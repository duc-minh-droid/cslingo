(function () {
  const partScope = (NIC.shared.algoP7 = NIC.shared.algoP7 || {});
  const { flow, reg, table } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, esc } = N;
  const L = N.LESSONS;
  const sh = (NIC.shared.algoP7x = NIC.shared.algoP7x || {});

  /* ---- figures shared with the other phase 7 files (published on NIC.shared.algoP7x) ---- */
  const chip = (t, c = "var(--line-2)", w = 30) =>
    `<span style="display:inline-grid;place-items:center;min-width:${w}px;height:30px;padding:0 6px;box-sizing:border-box;border:2px solid ${c};border-radius:9px;background:color-mix(in srgb, ${c} 18%, var(--panel-2));color:var(--ink);font:800 13px var(--mono)">${t}</span>`;
  /** A controls row holding a segmented picker, plus an output area. draw(value) runs on every pick; call it once to start. */
  const pick = (box, options, init, draw) => {
    const out = el(`<div></div>`),
      ctl = el(`<div class="controls"></div>`);
    ctl.append(N.seg(options, init, draw));
    box.append(ctl, out);
    return out;
  };
  const tint = (c, n = 28) => `color-mix(in srgb, ${c} ${n}%, var(--panel-2))`;

  const OPT = [1, 2, 3, 4].map((k) => [String(k), `1 in ${2 ** k}`]);
  /** Surprise as yes/no questions: 16 squares halve until the event is the only one left. */
  function halvingFig(box) {
    const out = pick(box, OPT, "3", (v) => draw(+v));
    const draw = (k) => {
      const rows = Array.from({ length: k + 1 }, (_, i) => {
        const y = 6 + i * 34;
        const sq = Array.from(
          { length: 16 },
          (_, j) =>
            `<rect x="${142 + j * 17}" y="${y}" width="15" height="24" rx="4" fill="${j >= 16 >> i ? "var(--bg-2)" : i === k ? "var(--amber)" : tint("var(--blue)", 35)}" stroke="var(--line-2)"/>`,
        ).join("");
        return `<g class="fi">${sq}<text x="136" y="${y + 16}" class="fig-sub" style="text-anchor:end">${i ? `after ${i} question${i > 1 ? "s" : ""}: ${16 >> i} left` : "all 16 squares"}</text></g>`;
      }).join("");
      out.innerHTML = `<svg class="fig" viewBox="0 0 414 ${k * 34 + 36}" role="img" aria-label="Sixteen squares, halved ${k} times until one is left">${rows}</svg>
        <p class="fig-cap">Orange: the event (${16 >> k} of the 16 squares). Narrowing down to it takes <b>${k} yes/no answer${k > 1 ? "s" : ""}</b>: ${k} bit${k > 1 ? "s" : ""} of surprise.</p>`;
    };
    draw(3);
  }

  /** Where rounding puts 12 values, and what that costs in bits (rate) and in error (distortion). */
  const YS = [0.08, 0.31, 0.12, 0.84, 0.22, 0.95, 0.05, 0.4, 0.18, 0.62, 0.27, 0.11],
    STEPS = [0.05, 0.1, 0.2, 0.34, 0.5, 1];
  const quant = (d) => {
    const z = YS.map((y) => Math.round(y / d)),
      cnt = {};
    z.forEach((k) => (cnt[k] = (cnt[k] || 0) + 1));
    const R = z.reduce((a, k) => a - Math.log2(cnt[k] / z.length), 0) / z.length;
    const D = YS.reduce((a, y, i) => a + (y - z[i] * d) ** 2, 0) / YS.length;
    return { z, R, D, P: 10 * Math.log10(1 / D), n: Object.keys(cnt).length };
  };
  function quantFig(box, mode) {
    let si = 2,
      lam = 100;
    const out = el(`<div></div>`),
      ctl = el(`<div class="controls"></div>`),
      sl = N.slider("Rounding step", 0, STEPS.length - 1, 1, si, (v) => STEPS[v]);
    sl.onInput((v) => ((si = v), draw()));
    ctl.append(sl);
    if (mode === "loss") {
      const s2 = N.slider("Price of error", 10, 1000, 10, lam, (v) => v);
      s2.onInput((v) => ((lam = v), draw()));
      ctl.append(s2);
    }
    box.append(ctl, out);
    function draw() {
      const d = STEPS[si],
        q = quant(d),
        X = (i) => 30 + (i + 0.5) * 32.5,
        Yy = (v) => 8 + (1 - v) * 150,
        J = (s) => quant(STEPS[s]).R + lam * quant(STEPS[s]).D,
        best = STEPS.map((_, s) => s).reduce((b, s) => (J(s) < J(b) ? s : b)),
        stat = (c, t, v) => `<div class="stat ${c}"><small>${t}</small><b>${v}</b></div>`;
      const grid = Array.from({ length: Math.floor(1 / d + 1e-9) + 1 }, (_, k) => Yy(k * d))
        .map(
          (y) => `<line x1="30" x2="420" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="${d < 0.1 ? 1 : 2}"/>`,
        )
        .join("");
      const pts = YS.map(
        (y, i) =>
          `<line x1="${X(i)}" x2="${X(i)}" y1="${Yy(y)}" y2="${Yy(q.z[i] * d)}" stroke="var(--rose)" stroke-width="3"/><rect x="${X(i) - 5}" y="${Yy(q.z[i] * d) - 5}" width="10" height="10" fill="var(--amber)"/><circle cx="${X(i)}" cy="${Yy(y)}" r="5" fill="var(--blue)"/>`,
      ).join("");
      const stats = {
        rate: stat("", "Different numbers used", q.n) + stat("teal", "Rate (bits per value)", q.R.toFixed(2)),
        dist: stat("rose", "Error (mean squared)", q.D.toFixed(4)) + stat("", "Score (PSNR, dB)", q.P.toFixed(1)),
        loss:
          stat("teal", "Bits per value", q.R.toFixed(2)) +
          stat("rose", "Error", q.D.toFixed(4)) +
          stat("amber", "Total score", J(si).toFixed(2)),
      };
      const cap = {
        rate: "Same colour, same number. Wider steps repeat numbers more, so fewer different numbers are in use and each is cheaper to write.",
        dist: "Each red line is one value's error. Wider steps, longer lines.",
        loss: `At this price the lowest total is at step <b>${STEPS[best]}</b>. ${best === si ? "You are on it." : si > best ? "Your step is coarser: cheap in bits but too much error." : "Your step is finer: accurate but too many bits."}`,
      };
      const nums = q.z
        .map((z) => chip(z, ["var(--blue)", "var(--teal)", "var(--amber)", "var(--violet)", "var(--rose)"][z % 5], 26))
        .join("");
      out.innerHTML = `<svg class="fig" viewBox="0 0 430 170" style="max-width:560px" role="img" aria-label="Twelve values (blue dots) rounded to the nearest multiple of ${d} (orange squares); red lines show the error">${grid}${pts}</svg>
        <p class="faint" style="margin:2px 0 6px"><b style="color:var(--blue-ink)">●</b> original value &nbsp; <b style="color:var(--amber-ink)">■</b> rounded value &nbsp; <b style="color:var(--rose-ink)">|</b> the error. Grid lines are the allowed rounded values.</p>
        <div class="faint" style="font-weight:800;font-size:12.5px;margin-bottom:3px">the rounded numbers that get sent</div><div style="display:flex;flex-wrap:wrap;gap:4px">${nums}</div>
        <div class="stat-row">${stats[mode]}</div><p class="fig-cap">${cap[mode]}</p>`;
    }
    draw();
  }

  /** Step through the LZW encoder on ABABABABA: the phrase in hand, the dictionary, the codes sent. */
  function lzwStepFig(box) {
    const MSG = "ABABABABA",
      d = ["A", "B"],
      sent = [],
      fr = [],
      snap = (i, w, add, note) => fr.push({ i, w, d: d.slice(), sent: sent.slice(), add, note });
    let w = "";
    snap(0, w, -1, "The dictionary starts with the alphabet: A = 0, B = 1.");
    for (const [i, c] of [...MSG].entries()) {
      const old = w,
        known = d.includes(w + c);
      if (known) w += c;
      else (sent.push(d.indexOf(w)), d.push(w + c), (w = c));
      const grow = `Read <b>${c}</b>: <b>${w}</b> is already in the dictionary, so keep growing.`;
      const emit = `Read <b>${c}</b>: <b>${old + c}</b> is new. Send the code for <b>${old}</b> (${d.indexOf(old)}), add <b>${old + c}</b> as entry ${d.length - 1}, restart from <b>${c}</b>.`;
      snap(i + 1, w, known ? -1 : d.length - 1, known ? grow : emit);
    }
    sent.push(d.indexOf(w));
    snap(
      9,
      "",
      -1,
      `End: send the code for what is left (<b>${w}</b> = ${d.indexOf(w)}). Nine letters became <b>${sent.length}</b> codes.`,
    );
    let k = 0;
    const out = el(`<div></div>`),
      nav = el(
        `<div class="controls"><button class="btn small ghost">← Back</button><button class="btn small primary">Next →</button><span class="faint"></span></div>`,
      ),
      [back, next] = nav.querySelectorAll("button"),
      row = (lb, h) =>
        `<div style="margin:8px 0"><div class="faint" style="font-weight:800;font-size:12.5px;margin-bottom:3px">${lb}</div><div style="display:flex;flex-wrap:wrap;gap:4px">${h}</div></div>`;
    const draw = () => {
      const f = fr[k],
        tile = (c, j) => chip(c, j < f.i - f.w.length ? "var(--teal)" : j < f.i ? "var(--blue)" : undefined, 28),
        ent = (e, j) =>
          chip(`<small style="opacity:.6">${j}</small>&nbsp;${e}`, j === f.add ? "var(--amber)" : undefined, 40),
        codes = f.sent.map((c) => chip(c, "var(--violet)")).join("") || `<span class="faint">none yet</span>`;
      back.disabled = !k;
      next.disabled = k === fr.length - 1;
      nav.lastChild.textContent = `step ${k + 1} of ${fr.length}`;
      out.innerHTML = `${row("message (green: already sent, blue: the phrase in hand)", [...MSG].map(tile).join(""))}${row("dictionary", f.d.map(ent).join(""))}${row("codes sent so far", codes)}<p class="fig-cap" style="min-height:3.2em">${f.note}</p>`;
    };
    back.onclick = () => (k--, draw());
    next.onclick = () => (k++, draw());
    box.append(nav, out);
    draw();
  }

  Object.assign(sh, { chip, pick, tint, halvingFig, quantFig, lzwStepFig });

  /* ============ 7.3 LZW ============ */
  reg({
    id: "a7-lzw",
    order: 9,
    num: "7.9",
    title: "LZW's growing dictionary",
    blurb:
      "No frequency table, no tree: encoder and decoder grow the same dictionary from the data itself. Step BANANABANDANA, then try AAA.",
    render(root) {
      root.appendChild(header(this, ""));
      let mode = "enc",
        trace = null,
        ptr = 0;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Type a message, grow a dictionary</h2><span class="faint">A–Z only · alphabet letters get codes 0…k−1 in the order given</span></div>
        <div class="controls">
          <label class="field">Message <input type="text" id="msg" value="BANANABANDANA" style="width:180px"></label>
          <label class="field">Alphabet <input type="text" id="al" value="ABND" style="width:90px"></label>
          <span id="seg"></span>
        </div>
        <div class="controls"><button class="btn primary" id="step">Step →</button><button class="btn" id="all">Run all</button><button class="btn ghost" id="rs">Reset</button><span class="mono dim" id="st"></span></div>
        <div class="grid two">
          <div><h3 id="t1"></h3><div class="pop" id="stream" style="margin-bottom:12px"></div><h3>Trace</h3><div class="log" style="max-height:300px"><table class="t" id="lg"></table></div></div>
          <div><h3>Dictionary — rebuilt on the fly, never transmitted</h3><div class="pop" id="dict"></div><div id="note" style="margin-top:12px"></div></div>
        </div></div>`);
      root.appendChild(card);
      qs("#seg", card).appendChild(
        N.seg(
          [
            ["enc", "Encode"],
            ["dec", "Decode"],
          ],
          mode,
          (v) => {
            mode = v;
            ptr = 0;
            draw();
          },
        ),
      );

      function build() {
        const text = (qs("#msg", card).value || "A").toUpperCase().replace(/[^A-Z]/g, "") || "A";
        const alRaw = (qs("#al", card).value || "").toUpperCase().replace(/[^A-Z]/g, "");
        const alphaArr = [...new Set(alRaw.split(""))];
        for (const c of text) if (!alphaArr.includes(c)) alphaArr.push(c);
        alphaArr.sort((a, b) => alRaw.indexOf(a) - alRaw.indexOf(b));
        // --- encode trace ---
        const dict = new Map(alphaArr.map((c, i) => [c, i]));
        let next = alphaArr.length,
          w = "";
        const steps = [],
          codes = [];
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (dict.has(w + c)) {
            steps.push({ act: "grow", w, c, pos: i });
            w += c;
          } else {
            const code = dict.get(w);
            codes.push(code);
            steps.push({ act: "emit", w, c, pos: i, code, add: w + c, n: next });
            dict.set(w + c, next++);
            w = c;
          }
        }
        codes.push(dict.get(w));
        steps.push({ act: "final", w, pos: text.length, code: dict.get(w) });
        // --- decode trace ---
        const dd = alphaArr.slice(),
          dsteps = [];
        let prev = null,
          out = "";
        for (const code of codes) {
          let entry,
            miss = false;
          if (dd[code] !== undefined) entry = dd[code];
          else if (code === dd.length && prev !== null) {
            entry = prev + prev[0];
            miss = true;
          } else {
            dsteps.push({ code, err: true });
            break;
          }
          let added = null;
          if (prev !== null) {
            added = prev + entry[0];
            dd.push(added);
          }
          out += entry;
          prev = entry;
          dsteps.push({ code, entry, miss, added, out });
        }
        trace = { text, alphaArr, steps, codes, dsteps };
        ptr = 0;
      }

      function encRow(s, i) {
        if (s.act === "grow")
          return `<tr><td>${i + 1}</td><td class="mono">${esc(s.w)}+${esc(s.c)}</td><td><span class="dim">"${esc(s.w + s.c)}" is already in the dict → keep growing w</span></td><td class="num faint">—</td></tr>`;
        if (s.act === "final")
          return `<tr class="hl"><td>${i + 1}</td><td class="mono">end</td><td>end of input → <b>don't forget the final emit:</b> emit w="${esc(s.w)}"</td><td class="num"><b>${s.code}</b></td></tr>`;
        return `<tr class="hl"><td>${i + 1}</td><td class="mono">${esc(s.w)}+${esc(s.c)}</td><td>"${esc(s.w + s.c)}" is new → emit w="${esc(s.w)}", <b>add ${esc(s.add)} → ${s.n}</b></td><td class="num"><b>${s.code}</b></td></tr>`;
      }
      function decRow(s, i) {
        if (s.err)
          return `<tr class="bad"><td>${i + 1}</td><td class="num">${s.code}</td><td>code ${s.code} is beyond the dictionary — corrupt stream</td><td></td></tr>`;
        const addTxt = s.added
          ? ` · add ${esc(s.added)} → ${trace.alphaArr.length + [...trace.dsteps.slice(0, i + 1).values()].filter((x) => x.added).length - 1}`
          : "";
        if (s.miss)
          return `<tr class="bad"><td>${i + 1}</td><td class="num">${s.code}</td><td><b>missing entry!</b> code not in dict yet → prev "${esc(prevOf(i))}" + its first char = "<b>${esc(s.entry)}</b>"${addTxt}</td><td class="mono">${esc(s.out)}</td></tr>`;
        return `<tr class="hl"><td>${i + 1}</td><td class="num">${s.code}</td><td>→ "<b>${esc(s.entry)}</b>"${addTxt}</td><td class="mono">${esc(s.out)}</td></tr>`;
      }
      const prevOf = (i) => (trace.dsteps[i - 1] ? trace.dsteps[i - 1].entry : "");

      function draw() {
        if (!trace) build();
        const t = trace;
        const miss = t.dsteps.some((s) => s.miss);
        if (mode === "enc") {
          const upto = ptr ? (t.steps[ptr - 1].pos ?? t.text.length) : 0;
          qs("#t1", card).textContent = `Input: ${t.text.length} characters`;
          qs("#stream", card).innerHTML = t.text
            .split("")
            .map((c, i) => `<span class="gene ${i < upto ? "good" : ""}">${c}</span>`)
            .join("");
          qs("#lg", card).innerHTML =
            `<tr><th>#</th><th>w + c</th><th>What happens</th><th class="num">Emit</th></tr>` +
            t.steps.slice(0, ptr).map(encRow).join("");
          const adds = t.steps.slice(0, ptr).filter((s) => s.add);
          qs("#dict", card).innerHTML =
            t.alphaArr.map((c, i) => `<div class="chip"><small>${i}</small><b>${esc(c)}</b></div>`).join("") +
            adds.map((s) => `<div class="chip new"><small>${s.n}</small><b>${esc(s.add)}</b></div>`).join("");
          qs("#st", card).textContent =
            `step ${ptr}/${t.steps.length} · ${t.codes.length} codes for ${t.text.length} chars`;
          qs("#note", card).innerHTML =
            ptr === t.steps.length
              ? `<div class="callout teal"><b>${t.text.length} chars → ${t.codes.length} codewords:</b> <span class="mono">${t.codes.join(", ")}</span>. Fewer items isn't the whole story — codes grow wider as the dictionary grows — but repeated phrases clearly win.</div>`
              : "";
        } else {
          qs("#t1", card).textContent = `Codes arriving: ${t.codes.length}`;
          qs("#stream", card).innerHTML = t.codes
            .map((c, i) => `<span class="gene ${i < ptr ? "good" : ""}">${c}</span>`)
            .join("");
          qs("#lg", card).innerHTML =
            `<tr><th>#</th><th class="num">Code</th><th>Lookup / rule</th><th>Output so far</th></tr>` +
            t.dsteps.slice(0, ptr).map(decRow).join("");
          let idx = t.alphaArr.length;
          qs("#dict", card).innerHTML =
            t.alphaArr.map((c, i) => `<div class="chip"><small>${i}</small><b>${esc(c)}</b></div>`).join("") +
            t.dsteps
              .slice(0, ptr)
              .filter((s) => s.added)
              .map((s) => `<div class="chip new"><small>${idx++}</small><b>${esc(s.added)}</b></div>`)
              .join("");
          qs("#st", card).textContent = `decoded ${ptr}/${t.dsteps.length} codes`;
          qs("#note", card).innerHTML =
            ptr && ptr >= t.dsteps.length && miss
              ? `<div class="callout amber"><b>The missing-entry case fired.</b> A code arrived that the decoder hadn't built yet — this happens exactly when the encoder <i>just created</i> an entry and immediately reused it (a pattern like <code>AAA…</code>, i.e. <code>XYXY…</code>). The only consistent entry is <b>previous output + its own first character</b>.</div>`
              : ptr >= t.dsteps.length
                ? `<div class="callout teal"><b>Round trip:</b> ${t.dsteps[t.dsteps.length - 1] && t.dsteps[t.dsteps.length - 1].out === t.text ? "decoder rebuilt " + esc(t.text) + " perfectly — same dictionary, never sent." : "output differs from input — check the trace."}</div>`
                : "";
        }
        qs("#step", card).disabled = ptr >= (mode === "enc" ? trace.steps.length : trace.dsteps.length);
      }

      qs("#step", card).onclick = () => {
        const len = mode === "enc" ? trace.steps.length : trace.dsteps.length;
        if (ptr < len) {
          ptr++;
          draw();
        }
      };
      qs("#all", card).onclick = () => {
        ptr = mode === "enc" ? trace.steps.length : trace.dsteps.length;
        draw();
      };
      qs("#rs", card).onclick = () => {
        build();
        draw();
      };
      qs("#msg", card).onchange = () => {
        build();
        draw();
      };
      qs("#al", card).onchange = () => {
        build();
        draw();
      };
      build();
      draw();

      root.appendChild(
        predict({
          id: "a7-lzw-1",
          q: "You encode <code>ABCDEFGH</code>, where no pair of letters ever repeats. How many codes does LZW output?",
          opts: [
            "8: one per letter, so nothing is saved",
            "4: it pairs up neighbouring letters",
            "2: the whole alphabet counts as one phrase",
          ],
          a: 0,
          why: "LZW only saves anything when a phrase it has already learned comes round again. Here every w + c is new, so each step just emits the single letter's code and adds an entry (AB, BC, CD…) that is never used. 8 letters give 8 codes, and the codes grow wider as the dictionary fills, so the output can even be bigger. Try it with a random string.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-lzw-2",
          q: "Huffman needs its frequency table sent with the message. LZW sends <b>nothing</b>, yet both sides end with identical dictionaries. How?",
          opts: [
            "The decoder guesses the likely entries",
            "Both process the same stream in the same order",
            "The dictionary is agreed in advance",
          ],
          a: 1,
          why: "Same input, same rule, same order → same table. The price: you can't decode mid-stream, and a lost codeword makes the dictionaries diverge (pair LZW with a CRC).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "LZW rule (encode): longest w in dict; when w+c is new, <b>emit code(w) and add w+c</b>. Don't forget the final emit.",
            "Decoder rebuilds the identical table: add <b>prev output + first char of current output</b>. Missing code → p + first(p).",
            "The dictionary is <b>cumulative state</b>: no mid-stream decoding, and corruption cascades.",
            "Different redundancy than Huffman: LZW exploits <b>repeated sequences</b>, Huffman exploits <b>symbol skew</b>. GIF uses LZW on palette indices.",
          ],
          "LZW builds a dictionary from the data itself, so nothing needs transmitting — but both sides must stay perfectly in sync.",
        ),
      );
    },
  });

  /* =================== LESSONS =================== */
  L["a7-entropy"] = {
    sum: "Some messages are predictable, some are full of surprises. <b>Entropy</b> measures the average surprise — and it's the hard lower bound on compression.",
    steps: [
      {
        t: "Information is surprise",
        b: `<p>Being told the sun rose this morning tells you nothing. Being told your lottery ticket won tells you a lot. <b>The rarer the news, the more it tells you</b>, and information theory counts that in bits.</p><p>Here is a way to count. I pick one of 16 squares and you hunt for it with yes/no questions, each cutting the possibilities in half. A 1-in-2 event takes one question, a 1-in-16 event takes four. <span class="key">The surprise of an event is the number of yes/no questions it takes to single it out.</span></p><details class="math-more"><summary>Show the maths</summary><p>Shannon's measure of surprise is</p><p>$$I(x) = -\\log_2 p(x)$$</p><p>Each halving of the probability adds exactly <b>one bit</b>, which is why log₂ is the right unit.</p>${table(
          ["p", "−log₂p", "meaning"],
          [
            ["1", "0 bits", "certainty: no news"],
            ["1/2", "1 bit", "one yes/no"],
            ["1/4", "2 bits", ""],
            ["1/8", "3 bits", ""],
            ["1/16", "4 bits", ""],
          ],
        )}</details>`,
        v: (box) => halvingFig(box),
      },
      {
        t: "Average the surprise → entropy",
        b: `<p>Weight each surprise by how often it happens: $H = \\sum_x p(x)\\,\\bigl(-\\log_2 p(x)\\bigr)$.</p><p>Loaded die: A 0.5, B 0.25, C 0.125, D 0.125 → H = 0.5·1 + 0.25·2 + 0.125·3 + 0.125·3 = <b>1.75 bits</b>.</p>`,
        c: {
          type: "order",
          q: "Put these sources in order from <b>lowest</b> to <b>highest</b> entropy.",
          items: [
            "A source that always sends A (p = 1)",
            "A source that sends A 90% of the time and B 10%",
            "A fair coin: A and B equally likely",
            "Four symbols, all equally likely",
          ],
          hint: "Entropy is the average surprise. The more predictable a source, the lower it is.",
          why: "Always A is certainty: −log₂1 = 0 bits. A 90/10 source is mostly predictable (about 0.47 bits). A fair coin is 1 bit and four equally likely symbols are 2 bits, the most four symbols can carry.",
        },
      },
      {
        t: "Uniform is the maximum",
        b: `<p>For n equally likely symbols, $H = \\log_2 n$ — the largest possible for that alphabet. Any skew lowers it. Four uniform symbols → 2 bits; the loaded die → 1.75.</p><span class="key">Entropy is a property of the <b>distribution</b>, not the alphabet. Same symbols, different probabilities → different entropy.</span>`,
        c: {
          q: "Two sources share the alphabet {A,B,C,D} but use different probabilities. Same entropy?",
          o: [
            "Yes, because they share exactly the same four-symbol alphabet",
            "No: entropy depends on the probabilities",
            "Only if both sources list the symbols in the same order",
          ],
          a: 1,
          why: "Relabelling changes nothing; changing probabilities changes everything.",
        },
      },
      {
        t: "Entropy is the compression floor",
        b: `<p>The ideal code length for symbol x is −log₂p(x) bits — often fractional (like 2.32). Real codewords use <b>whole bits</b>, so H is a <b>lower bound</b>: you can approach it (coding blocks of symbols together), never beat it on average.</p><span class="analogy">Entropy is to compression what a speed limit is to a road: you can get arbitrarily close, but no honest driver goes faster.</span>`,
      },
      {
        t: "Predictable = compressible",
        b: `<p>MISSISSIPPI's letters: I,S=4, P=2, M=1 out of 11 → H ≈ 1.82 bits, below the uniform 2 — the skew is the compressible part. English text is far more skewed, which is why it compresses so well.</p>`,
      },
    ],
    guide: [
      "Drag <b>Symbol A</b> to 32 and the rest toward 0 — watch H fall toward 0 and the 'saved' stat climb.",
      "Set all four sliders equal: H hits the 2-bit ceiling (the uniform max).",
      "Recreate the loaded die (8, 4, 2, 2) and confirm H = 1.75 in the table.",
      "Watch which symbol contributes most to H — it's not always the most common one.",
    ],
  };

  L["a7-huffman"] = {
    sum: "Huffman's trick: repeatedly merge the two <b>least</b> probable nodes into a tree, then read codewords off the branches. Greedy — and provably optimal.",
    steps: [
      {
        t: "Codes without separators",
        b: `<p>To decode a bit stream with no spaces, codewords must be <b>prefix-free</b>: no codeword may be a prefix of another.</p><p>A=0, B=10, C=110, D=111 → <code>010110</code> decodes left-to-right as 0|10|110 = <b>ABC</b>, unambiguously. But A=0, B=01 makes <code>01</code> ambiguous (B, or A-then-…).</p><span class="key">Prefix-free = every codeword is a <b>leaf</b> in a binary tree. That's the whole geometry.</span>`,
        c: {
          q: "A=0, B=1, C=01 — prefix-free?",
          o: [
            "Yes, all three codes are different",
            'No: A is a prefix of C, so "01" is ambiguous',
            "It can't be told without the probabilities",
          ],
          a: 1,
          why: "Any codeword that's a prefix of another breaks unique decodability.",
        },
      },
      {
        t: "The greedy merge",
        b: `<p>Probabilities: A .35, B .25, C .20, D .12, E .08. Rule: <b>merge the two smallest</b>, put the sum back in the queue, repeat until one node (the root) remains.</p>`,
        v: flow([
          ["D .12 + E .08 → DE .20", "teal"],
          ["C .20 + DE .20 → CDE .40", "violet"],
          ["A .35 + B .25 → AB .60", "amber"],
          ["AB .60 + CDE .40 → 1.00 ✓", "rose"],
        ]),
        c: {
          type: "order",
          q: "Huffman builds a tree for A .10, B .10, C .15, D .15 and E .50, always merging the <b>two smallest</b>. Put the merges in the order it does them.",
          items: ["A (.10) + B (.10)", "C (.15) + D (.15)", "AB (.20) + CD (.30)", "E (.50) + ABCD (.50)"],
          hint: "Each time, list the queue and take the two smallest. A merged node competes on its total.",
          why: "Always merge the two smallest in the queue. A and B (.10) go first, then C and D (.15), because AB (.20) is bigger. Then AB and CD (.50), and E joins last. A merged node competes on its total.",
        },
      },
      {
        t: "Why the rarest first? (the proof sketch)",
        b: `<p>Each leaf's depth = how many bits it costs <i>every time that symbol appears</i>. The deepest positions are the most expensive — so the two <b>rarest</b> symbols should pay that cost.</p><p><b>Exchange argument:</b> take any optimal tree, swap its deepest leaves for the two rarest symbols — cost never increases. Then the smaller problem is solved the same way. Greedy choice + optimal substructure = a proof, not luck.</p>`,
      },
      {
        t: "Reading off the codes",
        b: `<p>Walk from the root: 0 = first branch, 1 = second. Lecture set gives A=00, B=01, C=10, D=110, E=111 — frequent symbols at depth 2, rare D,E at depth 3.</p><p>Average length $L = \\sum p \\cdot \\text{len} = 0.35 \\cdot 2 + 0.25 \\cdot 2 + 0.20 \\cdot 2 + 0.12 \\cdot 3 + 0.08 \\cdot 3 = \\mathbf{2.20}$ bits. Entropy H ≈ <b>2.15</b>. <b>L ≥ H always</b> — the gap pays for integer lengths.</p>`,
        c: {
          q: "L = 2.20 vs H ≈ 2.15. Which is true?",
          o: ["Bug — L must equal H", "L ≥ H is the law", "H was miscomputed"],
          a: 1,
          why: "Entropy is a bound. Equal needs power-of-two probabilities (see the Loaded die preset).",
        },
      },
      {
        t: "What Huffman needs (and doesn't do)",
        b: `<p>Huffman is <b>static</b>: it needs the symbol frequencies gathered in advance, and the tree/table must travel with the message. It learns <b>symbol skew</b>, not repeated phrases — that's the job of LZW (Lempel–Ziv–Welch), the next module.</p><span class="analogy">Huffman is a tailor measuring you once and sewing a suit. LZW is a tailor who adjusts the suit while you walk.</span>`,
      },
    ],
    guide: [
      "Click the two smallest chips yourself — wrong picks get corrected with a hint.",
      "On the Lecture preset, watch the merged nodes re-enter the queue and get merged again.",
      "Read the final tree: 0/1 on the branches give each codeword; check A=00 … E=111 in the table.",
      "Switch to <b>Loaded die</b> and Finish — notice L equals H exactly (all probabilities are powers of two).",
    ],
  };
})();
