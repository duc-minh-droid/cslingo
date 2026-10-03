(function () {
  const partScope = (NIC.shared.algoP7 = NIC.shared.algoP7 || {});
  const { huffmanRun } = partScope;
  const N = NIC;
  const { el, qs, qsa } = N;
  const L = N.LESSONS;
  const FG = NIC.fig;

  /** LZW encoding: cursor over the input, the current string w, the dictionary growing, codes going out. The message is editable. */
  function lzwRun(box, life) {
    const ALPHA = ["A", "B", "N", "D"],
      MAXLEN = 16,
      SLOTS = ALPHA.length + MAXLEN;
    let text = "BANANABANDANA";
    function* frames() {
      const s = text,
        dict = new Map(ALPHA.map((ch, i) => [ch, i]));
      // pre-pass: which checks get a question (a multi-letter "yes", then the last multi-letter check if it isn't adjacent)
      const checks = [];
      {
        let w = "";
        const d = new Set(ALPHA);
        for (let p = 0; p < s.length; p++) {
          const wc = w + s[p];
          checks.push({ p, wc, has: d.has(wc) });
          if (d.has(wc)) w = wc;
          else {
            d.add(wc);
            w = s[p];
          }
        }
      }
      const multi = checks.filter((k) => k.wc.length > 1),
        asks = new Set();
      const firstYes = multi.find((k) => k.has) || multi[0];
      if (firstYes) asks.add(firstYes.p);
      const last = multi[multi.length - 1];
      if (last && firstYes && last.p - firstYes.p >= 2) asks.add(last.p);
      let w = "";
      const out = [],
        entries = ALPHA.map((ch, i) => [i, ch]);
      const snap = (x) => ({
        w,
        out: out.slice(),
        entries: entries.map((e) => e.slice()),
        cur: -1,
        wr: [0, 0],
        wc: "",
        yn: "",
        add: -1,
        hit: -1,
        ...x,
      });
      yield snap({
        cap: `Start with the alphabet: ${ALPHA.map((ch, i) => `${ch} = ${i}`).join(", ")}. The current string <b>w</b> is empty.`,
        line: 0,
      });
      for (let p = 0; p < s.length; p++) {
        const ch = s[p],
          wc = w + ch,
          has = dict.has(wc);
        yield snap({
          cur: p,
          wr: [p - w.length, p],
          wc,
          cap: `Read <b>${ch}</b>. Is w + c = <b>${wc}</b> in the dictionary?`,
          line: 1,
        });
        const ask = asks.has(p)
          ? {
              q: `Is <b>${wc}</b> already in the dictionary? Tap yes or no.`,
              pick: ".rn-lzw-yn",
              a: has ? "yes" : "no",
              why: has
                ? `${wc} was added earlier as entry <b>${dict.get(wc)}</b>, so w just grows.`
                : `${wc} has never been seen, so it becomes entry <b>${dict.size}</b>.`,
            }
          : null;
        if (has) {
          w = wc;
          yield snap({
            cur: p,
            wr: [p + 1 - w.length, p + 1],
            wc,
            yn: "yes",
            hit: dict.get(wc),
            ask,
            line: 2,
            cap: `Yes, <b>${wc}</b> is entry ${dict.get(wc)}. Keep it: w = <b>${wc}</b>.`,
          });
        } else {
          const code = dict.get(w),
            nc = dict.size;
          out.push(code);
          dict.set(wc, nc);
          entries.push([nc, wc]);
          const pw = w;
          w = ch;
          yield snap({
            cur: p,
            wr: [p, p + 1],
            wc,
            yn: "no",
            add: nc,
            ask,
            line: 3,
            cap: `No. Output <b>${code}</b> (for ${pw}), add <b>${wc} = ${nc}</b>, and restart w = <b>${ch}</b>.`,
          });
        }
      }
      const code = dict.get(w);
      out.push(code);
      yield snap({
        cur: -1,
        wr: [s.length - w.length, s.length],
        line: 4,
        mood: "love",
        hit: code,
        cap: `End of input: output <b>${code}</b> for w = ${w}. That's <b>${out.length} codes</b> for ${s.length} letters: ${out.join(", ")}.`,
      });
    }
    FG.run(box, life, {
      code: [
        "dictionary = the alphabet; w = empty",
        "read the next letter c",
        "if w + c is in it: w = w + c",
        "else: output code(w), add w + c, w = c",
        "at the end: output code(w)",
      ],
      build(stage, api) {
        const root = el(`<div class="rn-lzw">
          <label class="rn-lzw-in">Message <input type="text" maxlength="${MAXLEN}" value="${text}" spellcheck="false" autocomplete="off" aria-label="Message to encode (letters A, B, N, D)"><span>A B N D only</span></label>
          <div class="rn-lzw-tape">${Array.from({ length: MAXLEN }, () => `<span class="rn-lzw-cell"></span>`).join("")}</div>
          <div class="rn-lzw-mid">
            <div class="rn-lzw-box"><small>w</small><b class="rn-lzw-w">·</b></div>
            <div class="rn-lzw-box rn-lzw-ask"><small>w + c in the dictionary?</small><div><b class="rn-lzw-wc">·</b><span class="rn-lzw-yn" data-k="yes">yes</span><span class="rn-lzw-yn" data-k="no">no</span></div></div>
          </div>
          <div class="rn-lzw-row"><small>output</small><div class="rn-lzw-out">${Array.from({ length: MAXLEN }, () => `<span class="rn-lzw-code"></span>`).join("")}</div></div>
          <div class="rn-lzw-row"><small>dictionary</small><div class="rn-lzw-dict">${Array.from({ length: SLOTS }, () => `<span class="rn-lzw-ent"><i></i><b></b></span>`).join("")}</div></div>
        </div>`);
        stage.appendChild(root);
        const inp = qs("input", root);
        let t = 0;
        inp.addEventListener("keydown", (e) => e.stopPropagation());
        inp.addEventListener("input", () => {
          const v = inp.value
            .toUpperCase()
            .replace(/[^ABND]/g, "")
            .slice(0, MAXLEN);
          if (v !== inp.value) inp.value = v;
          clearTimeout(t);
          if (v.length < 2) return;
          t = setTimeout(() => {
            text = v;
            api.recompute();
          }, 500);
        });
        life.onCleanup(() => clearTimeout(t));
        return {
          root,
          cells: qsa(".rn-lzw-cell", root),
          w: qs(".rn-lzw-w", root),
          wc: qs(".rn-lzw-wc", root),
          yn: qsa(".rn-lzw-yn", root),
          codes: qsa(".rn-lzw-code", root),
          ents: qsa(".rn-lzw-ent", root),
        };
      },
      draw(s, f, c) {
        s.cells.forEach((cell, k) => {
          cell.hidden = k >= text.length;
          cell.textContent = text[k] || "";
          cell.classList.toggle("rn-lzw-done", k < f.wr[0]);
          cell.classList.toggle("rn-lzw-inw", k >= f.wr[0] && k < f.wr[1]);
          cell.classList.toggle("rn-lzw-cur", k === f.cur && !f.yn);
        });
        FG.rn.text(c, s.w, f.w || "·");
        FG.rn.text(c, s.wc, f.wc || "·");
        s.yn.forEach((b) => {
          b.classList.toggle("rn-lzw-on", b.dataset.k === f.yn);
          b.classList.toggle("rn-lzw-off", !!f.yn && b.dataset.k !== f.yn);
        });
        const pOut = c.prev ? c.prev.out.length : 0,
          pEnt = c.prev ? c.prev.entries.length : 0;
        s.codes.forEach((el2, k) => {
          const on = k < f.out.length;
          el2.hidden = !on;
          if (!on) return;
          el2.textContent = f.out[k];
          if (k >= pOut && !c.instant) {
            FG.rn.to({ instant: true }, el2, { opacity: 0, scale: 0.4 });
            FG.rn.to(c, el2, { opacity: 1, scale: 1 }, 0.1, 0.35);
          } else FG.rn.to({ instant: true }, el2, { opacity: 1, scale: 1 });
        });
        s.ents.forEach((en, k) => {
          const e = f.entries[k];
          en.hidden = !e;
          if (!e) return;
          en.firstChild.textContent = e[0];
          en.lastChild.textContent = e[1];
          en.classList.toggle("rn-lzw-new", e[0] === f.add);
          en.classList.toggle("rn-lzw-hit", e[0] === f.hit);
          if (k >= pEnt && !c.instant) {
            FG.rn.to({ instant: true }, en, { opacity: 0, y: -8 });
            FG.rn.to(c, en, { opacity: 1, y: 0 }, 0.15, 0.35);
          } else FG.rn.to({ instant: true }, en, { opacity: 1, y: 0 });
        });
      },
      frames,
    });
  }

  const addStep = (id, at, step) => {
    if (L[id]) L[id].steps.splice(at, 0, step);
  };
  addStep("a7-huffman", 2, {
    t: "Watch it run",
    b: `<p>Here is the merge on the lecture set, as counts per 100 symbols. Press <b>play</b> or step with the arrows. The top row is always the queue.</p><p>It will pause and ask you to pick the next pair. Tap a count to change it and the tree rebuilds.</p>`,
    v: (box, life) => huffmanRun(box, life),
  });
  addStep("a7-lzw", 2, {
    t: "Watch it run",
    b: `<p>The encoder on BANANABANDANA. Press <b>play</b> or step with the arrows: the cursor reads one letter at a time, and each new pair joins the dictionary.</p><p>It will pause and ask you to predict. Type your own message (A, B, N, D only) and the run restarts.</p>`,
    v: (box, life) => lzwRun(box, life),
  });
})();
