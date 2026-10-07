/* Phase 7 coverage pass (2/4): 7.5 KL divergence, 7.7 Huffman worked example. */
(function () {
  const sh = (NIC.shared.algoP7x = NIC.shared.algoP7x || {});
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    FG = N.fig;
  const reg = (m) => N.register({ subject: "algo", lecture: 7, ...m });
  const lg2 = Math.log2;
  const { table, H, norm, huff } = sh;
  /* ============ 7.5 Coding with the wrong model (KL divergence) ============ */
  const P0 = [0.5, 0.25, 0.125, 0.125];
  const KL = (p, q) => p.reduce((a, x, i) => a + (x > 0 ? x * lg2(x / q[i]) : 0), 0);
  const Lq = (p, q) => p.reduce((a, x, i) => a - (x > 0 ? x * lg2(q[i]) : 0), 0);
  reg({
    id: "a7-kl",
    order: 5,
    num: "7.5",
    title: "Coding with the wrong model",
    blurb:
      "Design a code for the wrong probabilities q and you pay a penalty. The expected length is exactly H(p) plus the KL divergence.",
    render(root) {
      root.appendChild(header(this, ""));
      const P = [0.5, 0.25, 0.125, 0.125],
        SYMS = ["A", "B", "C", "D"],
        COL = ["var(--teal)", "var(--violet)", "var(--amber)", "var(--rose)"];
      const PRE = {
        same: ["q = p", [8, 4, 2, 2]],
        uni: ["Uniform guess", [4, 4, 4, 4]],
        near: ["Close guess", [4, 3, 2, 1]],
        rev: ["Backwards guess", [1, 1, 2, 4]],
      };
      let w = PRE.near[1].slice();
      const card =
        el(`<div class="card"><div class="card-head"><h2>The data follow p, the code assumes q</h2><span class="faint">p is fixed: A ½, B ¼, C ⅛, D ⅛</span></div>
        <div class="controls" id="pre"></div><div class="controls" id="sl"></div>
        <table class="t" id="tb" style="margin:8px 0;max-width:640px"></table>
        <div id="bars" style="min-height:110px"></div>
        <div class="stat-row"><div class="stat teal"><small>Entropy H(p)</small><b id="h"></b></div><div class="stat rose"><small>Penalty D(p‖q)</small><b id="d"></b></div><div class="stat"><small>Real average length L</small><b id="l"></b></div><div class="stat"><small>H + D</small><b id="hd"></b></div></div></div>`);
      root.appendChild(card);
      const sls = SYMS.map((s, i) => {
        const sl = N.slider("weight " + s, 1, 16, 1, w[i], (v) => v);
        sl.onInput((v) => {
          w[i] = v;
          draw();
        });
        qs("#sl", card).appendChild(sl);
        return sl;
      });
      qs("#pre", card).appendChild(
        N.seg(
          Object.entries(PRE).map(([k, v]) => [k, v[0]]),
          "near",
          (k) => {
            w = PRE[k][1].slice();
            sls.forEach((s, i) => (s.value = w[i]));
            draw();
          },
        ),
      );
      function draw() {
        const q = norm(w),
          h = H(P),
          d = KL(P, q),
          l = Lq(P, q);
        qs("#tb", card).innerHTML =
          `<tr><th>Symbol</th><th class="num">true p</th><th class="num">assumed q</th><th class="num">code length −log₂ q</th><th class="num">p × length</th></tr>` +
          SYMS.map(
            (s, i) =>
              `<tr><td style="color:${COL[i]}"><b>${s}</b></td><td class="num">${P[i]}</td><td class="num">${q[i].toFixed(3)}</td><td class="num">${(-lg2(q[i])).toFixed(2)}</td><td class="num">${(-P[i] * lg2(q[i])).toFixed(3)}</td></tr>`,
          ).join("") +
          `<tr class="hl"><td colspan="4"><b>L = Σ p × length</b></td><td class="num"><b>${l.toFixed(3)}</b></td></tr>`;
        qs("#bars", card).innerHTML = FG.bars(
          [
            ["entropy H(p): the best possible", h, "teal"],
            ["penalty D(p‖q): cost of the wrong model", d, "rose"],
            ["actual length L", l, "violet"],
          ],
          { max: 4, fmt: (v) => v.toFixed(3) + " bits" },
        );
        qs("#h", card).textContent = h.toFixed(3);
        qs("#d", card).textContent = d.toFixed(3);
        qs("#l", card).textContent = l.toFixed(3);
        qs("#hd", card).textContent = (h + d).toFixed(3);
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-kl-1",
          q: "Choose <b>Uniform guess</b>: the code treats all four symbols as equally likely, but the data follow p. The extra cost over the best possible is…",
          opts: [
            "0.25 bits per symbol: 2 bits spent against 1.75",
            "Nothing at all: a uniform model is a neutral choice",
            "1.75 bits per symbol, which is the whole entropy again",
          ],
          a: 0,
          why: "A uniform model gives every symbol a 2-bit word, so L = 2. The best possible is H = 1.75, so the penalty is D(p‖q) = 0.25. A wrong model is never free.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-kl-2",
          q: "Drag the q sliders anywhere you like. Can the penalty D(p‖q) ever go <b>negative</b>?",
          opts: [
            "Yes: a lucky model can beat the true entropy",
            "No: zero when q equals p, positive otherwise",
            "Only when q has more symbols than p does",
          ],
          a: 1,
          why: "L = H + D and L ≥ H for any decodable code, so D ≥ 0. A model that matches the source (q = p) costs nothing extra; any mismatch costs something.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A code built for model q gives symbol x the length <b>−log₂ q(x)</b>. If the data really follow p, the average is <b>L = Σ p(−log₂ q)</b>.",
            "<b>L = H(p) + D(p‖q)</b>: entropy plus the KL divergence Σ p log₂(p/q).",
            "D ≥ 0, and D = 0 only if q = p: a wrong model can only cost bits.",
            "That is why compressors work hard to learn the source: dynamic models count it, adaptive models track it.",
          ],
          "The wrong model costs you exactly the KL divergence in extra bits per symbol.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-kl"] = {
    sum: "A code is only as good as the model behind it. Give it the wrong probabilities and the extra bits per symbol are exactly the KL divergence.",
    steps: [
      { t: "A code built on a guess", b: `<p>Suppose you design a code for probabilities $q$, but the real data follow $p$. Symbol $x$ gets the ideal length for the model: $l_q(x) = -\\log_2 q(x)$. The symbols still turn up at their <b>true</b> rate, so the real average is</p><p>$$L = \\sum_x p(x)\\,\\bigl(-\\log_2 q(x)\\bigr)$$</p>`,
        v: FG.flow([{ t: "true source p", s: "what actually happens" }, { t: "code designed for q", s: "length −log₂ q", c: "violet" }, { t: "cost", s: "L = Σ p (−log₂ q)", c: "rose" }]),
        c: { q: "Which probabilities decide how <b>often</b> each codeword is used?", o: ["The true p: it is what the source really sends", "The assumed q, because the code was built from it", "Neither: codewords are used equally often"], a: 0, why: "Frequency of use comes from the data (p). The codeword lengths come from the model (q)." } },
      { t: "Entropy plus a penalty", b: `<p>Add and subtract $\\log_2 p$ inside the sum:</p><p>$$L = \\underbrace{\\sum_x p\\,(-\\log_2 p)}_{H(p)} \\;+\\; \\underbrace{\\sum_x p\\,\\log_2\\frac{p}{q}}_{D_{\\mathrm{KL}}(p\\,\\|\\,q)}$$</p><p>The first part is the entropy: the best you could do. The second is the <b>KL divergence</b>: the price of using $q$ instead of $p$.</p>`,
        v: FG.bars([["entropy H(p)", 1.75, "teal", "bits"], ["+ penalty D(p‖q)", 0.25, "rose"], ["= actual L", 2.0, "violet"]], { max: 2.2, fmt: (v) => v.toFixed(2) }) + `<div class="fig-cap">p = (½, ¼, ⅛, ⅛) coded with a uniform guess q = (¼, ¼, ¼, ¼).</div>`,
        c: { q: "H(p) = 1.75 and D(p‖q) = 0.25. The real average length L is…", o: ["2.0 bits", "1.5 bits", "7 bits"], a: 0, why: "L = H + D = 1.75 + 0.25 = 2.0." } },
      { t: "The penalty is never negative", b: `<p>Because $L \\ge H$ for every decodable code, $D_{\\mathrm{KL}}(p\\|q) \\ge 0$. It is <b>zero only when $q = p$</b>. A wrong model can only cost bits, never save them.</p><p>It is not symmetric: for $p = (\\tfrac12,\\tfrac14,\\tfrac18,\\tfrac18)$ and $q = (0.4, 0.3, 0.2, 0.1)$, $D(p\\|q) \\approx 0.051$ but $D(q\\|p) \\approx 0.054$. KL measures the cost of coding <i>p-data</i> with a <i>q-code</i>, which is not the same journey backwards.</p>`,
        v: table(["Model q", "L (bits)", "D(p‖q)"], [["(½, ¼, ⅛, ⅛) = p", fmt(Lq(P0, P0), 3), "0"], ["(0.4, 0.3, 0.2, 0.1)", Lq(P0, [0.4, 0.3, 0.2, 0.1]).toFixed(3), KL(P0, [0.4, 0.3, 0.2, 0.1]).toFixed(3)], ["(¼, ¼, ¼, ¼) uniform", "2", "0.25"], ["(⅛, ⅛, ¼, ½) backwards", Lq(P0, [0.125, 0.125, 0.25, 0.5]).toFixed(3), "0.875"]], 520),
        c: { q: "A model q matches the true p exactly. The penalty D(p‖q) is…", o: ["0", "1", "H(p)"], a: 0, why: "Matching the source is the best case. Then L = H and nothing is wasted." } },
      { t: "Static, dynamic, adaptive: a KL view", b: `<p>Back to the three kinds of model:</p>`,
        v: table(["Model", "How q is chosen", "Typical penalty"], [["Static (ASCII, Morse)", "fixed in advance for all text", "D can stay large for text that doesn't match"], ["Dynamic (Huffman)", "count this text, send the table", "D close to 0 but the table costs bits"], ["Adaptive (LZW)", "learn as the text arrives", "starts high and falls as the model improves"]], 720),
        c: { q: "Which model has no mismatch penalty to start with, but pays to send its model?", o: ["Dynamic: fitted to this text, then sent", "Static: it is built to fit every possible text", "Adaptive: it already knows the text in advance"], a: 0, why: "A dynamic code is built from the text's own counts, so q ≈ p, but the table must travel with the data." } },
    ],
    guide: ["Choose <b>q = p</b>: the penalty is 0 and L = H.", "Choose <b>Uniform guess</b>: L = 2 and the penalty is 0.25.", "Drag individual q sliders and watch the red penalty bar grow as q moves away from p.", "Check that H + D always equals L."],
  };

  /* ============ 7.7 The lecture's Huffman example: encode and decode ============ */
  const LEC = [
    ["A", 0.16],
    ["B", 0.51],
    ["C", 0.09],
    ["D", 0.13],
    ["E", 0.11],
  ];
  const LEC_CODES = huff(LEC).codes; // B=1, A=011, D=010, E=001, C=000 (the lecture's table)
  const encode = (msg, codes) => [...msg].map((c) => codes[c]).join("");
  const decodeTree = (bits, codes) => {
    const inv = Object.fromEntries(Object.entries(codes).map(([k, v]) => [v, k]));
    let p = "",
      o = "";
    for (const b of bits) {
      p += b;
      if (inv[p]) {
        o += inv[p];
        p = "";
      }
    }
    return o;
  };

  reg({
    id: "a7-huffman-worked",
    order: 7,
    num: "7.7",
    title: "Huffman: encode and decode a message",
    blurb:
      "The lecture's five-letter example, end to end: build the code, encode BBADEBC, then walk the tree to decode it.",
    render(root) {
      root.appendChild(header(this, ""));
      const LET = ["B", "A", "D", "E", "C"];
      let msg = "BBADEBC",
        dp = 0,
        pre = "",
        dout = "";
      const card =
        el(`<div class="card"><div class="card-head"><h2>Encode, then decode</h2><span class="faint">lecture code: B 1, A 011, D 010, E 001, C 000</span></div>
        <div class="controls" id="lt"><span class="faint">Add a letter</span></div>
        <p style="margin:6px 0">Message: <b class="mono" id="m" style="letter-spacing:.12em"></b> <button class="btn small ghost" id="clr">Clear</button></p>
        <div class="tape-bits" id="bits" style="display:flex;flex-wrap:wrap;gap:6px;min-height:40px;margin:6px 0"></div>
        <div class="stat-row"><div class="stat teal"><small>Huffman bits</small><b id="hb"></b></div><div class="stat"><small>Fixed 3-bit code</small><b id="fb"></b></div><div class="stat amber"><small>Saved</small><b id="sv"></b></div></div>
        <hr style="border:0;border-top:2px solid var(--line);margin:12px 0">
        <div class="controls"><button class="btn primary" id="step">Read next bit</button><button class="btn ghost" id="rs">Reset decoder</button></div>
        <div class="rn-lzw-tape" id="tape" style="margin:8px 0;min-height:34px"></div>
        <div class="stat-row"><div class="stat"><small>Prefix read so far</small><b class="mono" id="pf" style="min-width:60px;display:inline-block">·</b></div><div class="stat teal"><small>Decoded</small><b class="mono" id="do" style="min-width:60px;display:inline-block">·</b></div></div>
        <p class="faint" id="dm" style="min-height:2.6em"></p></div>`);
      root.appendChild(card);
      LET.forEach((c) => {
        const b = el(`<button class="btn small">${c}</button>`);
        b.onclick = () => {
          if (msg.length < 12) {
            msg += c;
            reset();
            draw();
          }
        };
        qs("#lt", card).appendChild(b);
      });
      qs("#clr", card).onclick = () => {
        msg = "";
        reset();
        draw();
      };
      qs("#rs", card).onclick = () => {
        reset();
        draw();
      };
      const inv = Object.fromEntries(Object.entries(LEC_CODES).map(([k, v]) => [v, k]));
      function reset() {
        dp = 0;
        pre = "";
        dout = "";
      }
      qs("#step", card).onclick = () => {
        const bits = encode(msg, LEC_CODES);
        if (dp >= bits.length) return;
        pre += bits[dp++];
        let note = `Read <b>${bits[dp - 1]}</b>. The prefix <b class="mono">${pre}</b> is not a codeword yet: keep reading.`;
        if (inv[pre]) {
          note = `<b class="mono">${pre}</b> is the codeword for <b>${inv[pre]}</b>. Output it and start a fresh prefix.`;
          dout += inv[pre];
          pre = "";
        }
        draw(note);
      };
      function draw(note) {
        const bits = encode(msg, LEC_CODES);
        qs("#m", card).textContent = msg || "(empty)";
        qs("#bits", card).innerHTML = [...msg]
          .map(
            (c, i) =>
              `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:2px 8px;border:2px solid var(--line);border-radius:9px;background:var(--${["blue-dim", "violet-dim"][i % 2]})"><small class="faint">${c}</small><b class="mono">${LEC_CODES[c]}</b></span>`,
          )
          .join("");
        qs("#hb", card).textContent = bits.length + " bits";
        qs("#fb", card).textContent = msg.length * 3 + " bits";
        qs("#sv", card).textContent = msg.length ? Math.round((1 - bits.length / (msg.length * 3)) * 100) + "%" : "0%";
        qs("#tape", card).innerHTML = [...bits]
          .map(
            (b, i) =>
              `<span class="rn-lzw-cell ${i < dp - pre.length ? "rn-lzw-done" : i < dp ? "rn-lzw-inw" : ""}">${b}</span>`,
          )
          .join("");
        qs("#pf", card).textContent = pre || "·";
        qs("#do", card).textContent = dout || "·";
        qs("#dm", card).innerHTML =
          note ||
          (dp >= bits.length && bits.length
            ? dout === msg
              ? "Finished: the decoded text equals the message, with no separators needed."
              : ""
            : "Press <b>Read next bit</b>: the decoder grows a prefix until it matches a codeword.");
        qs("#step", card).disabled = dp >= bits.length;
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-huffman-worked-1",
          q: "Build the message <b>B B B B B B</b> (six Bs). How many bits does it take?",
          opts: [
            "6 bits: B is the 1-bit codeword",
            "18 bits, the same as any other six letters",
            "12 bits, two per letter",
          ],
          a: 0,
          why: "B is the most common letter (0.51), so it gets the shortest code, a single bit. Six Bs cost 6 bits, against 18 bits with a fixed 3-bit code.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-huffman-worked-2",
          q: "Build <b>C E D A</b> (the four rare letters). Compared with a fixed 3-bit code, the Huffman stream is…",
          opts: [
            "Shorter, as the code always wins",
            "The same length: all four rare letters use 3-bit codewords",
            "Longer, because rare letters get long codewords",
          ],
          a: 1,
          why: "Four of the five letters have 3-bit codewords, exactly the fixed-code cost. The saving only appears when the frequent B shows up. Huffman never loses on average, but a particular message can tie.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Order by probability, merge the two smallest, repeat: here C+E, then D+A, then those two, then B.",
            "Code table: <b>B = 1, A = 011, D = 010, E = 001, C = 000</b>. Average <b>L = 1.98</b> bits against entropy <b>H = 1.964</b>.",
            "Encoding is a table lookup. Decoding walks the tree one bit at a time and restarts at every leaf.",
            "No separators are needed because no codeword is a prefix of another.",
          ],
          "Huffman encodes by lookup and decodes by tree walk, and the average sits just above the entropy.",
        ),
      );
    },
  });

  /** Huffman decode runner: bits, growing prefix, output, code table. Reuses the LZW runner styles. */
  function huffDecodeRun(box, life) {
    const MSG = "BBADEBC",
      BITS = encode(MSG, LEC_CODES),
      ORDER = ["B", "A", "D", "E", "C"];
    const inv = Object.fromEntries(Object.entries(LEC_CODES).map(([k, v]) => [v, k]));
    function* frames() {
      let start = 0,
        out = "";
      const snap = (x) => ({ pos: start, from: start, to: start, out, match: "", pre: "", ...x });
      yield snap({
        cap: `Bits to decode: <b class="mono">${BITS}</b>. The code table (right) has no codeword that is a prefix of another.`,
        line: 0,
      });
      let asked = 0;
      for (let i = 0; i < BITS.length; i++) {
        const pre = BITS.slice(start, i + 1),
          hit = inv[pre];
        const ask =
          hit && pre.length === 3 && asked < 2
            ? (asked++,
              {
                q: `The prefix is now <b class="mono">${pre}</b>. Which letter is that codeword? Tap it.`,
                pick: ".rn-lzw-yn",
                a: [hit],
                why: `${pre} is the codeword for <b>${hit}</b> in the table.`,
              })
            : null;
        if (hit) {
          out += hit;
          yield snap({
            from: start,
            to: i + 1,
            pre,
            match: hit,
            out,
            ask,
            line: 2,
            cap: `Read <b>${BITS[i]}</b>: prefix <b class="mono">${pre}</b>. It is the codeword for <b>${hit}</b>. Output it and restart.`,
          });
          start = i + 1;
        } else
          yield snap({
            from: start,
            to: i + 1,
            pre,
            out,
            line: 1,
            cap: `Read <b>${BITS[i]}</b>: prefix <b class="mono">${pre}</b>. Not a codeword yet, so read another bit.`,
          });
      }
      yield snap({
        from: BITS.length,
        to: BITS.length,
        out,
        mood: "love",
        line: 3,
        cap: `All ${BITS.length} bits used. Decoded: <b>${out}</b>, which is the original message ${out === MSG ? "exactly" : ""}.`,
      });
    }
    FG.run(box, life, {
      code: [
        "prefix = empty",
        "read a bit, extend the prefix",
        "if the prefix is a codeword: output its letter, prefix = empty",
        "repeat until the bits run out",
      ],
      build(stage) {
        const root = el(`<div class="rn-lzw">
          <div class="rn-lzw-tape">${[...BITS].map((b) => `<span class="rn-lzw-cell">${b}</span>`).join("")}</div>
          <div class="rn-lzw-mid"><div class="rn-lzw-box"><small>prefix</small><b class="rn-lzw-w">·</b></div>
            <div class="rn-lzw-box rn-lzw-ask"><small>codeword for…</small><div><b class="rn-lzw-wc">·</b>${ORDER.map((c) => `<span class="rn-lzw-yn" data-k="${c}">${c}</span>`).join("")}</div></div></div>
          <div class="rn-lzw-row"><small>decoded</small><div class="rn-lzw-out">${[...MSG].map(() => `<span class="rn-lzw-code"></span>`).join("")}</div></div>
          <div class="rn-lzw-row"><small>code table</small><div class="rn-lzw-dict">${ORDER.map((c) => `<span class="rn-lzw-ent" data-k="${c}"><i>${c}</i><b>${LEC_CODES[c]}</b></span>`).join("")}</div></div></div>`);
        stage.appendChild(root);
        return {
          root,
          cells: qsa(".rn-lzw-cell", root),
          w: qs(".rn-lzw-w", root),
          chips: qsa(".rn-lzw-yn", root),
          codes: qsa(".rn-lzw-code", root),
          ents: qsa(".rn-lzw-ent", root),
        };
      },
      draw(s, f, c) {
        s.cells.forEach((cell, k) => {
          cell.classList.toggle("rn-lzw-done", k < f.from);
          cell.classList.toggle("rn-lzw-inw", k >= f.from && k < f.to);
        });
        FG.rn.text(c, s.w, f.pre || "·");
        s.chips.forEach((b) => {
          b.classList.toggle("rn-lzw-on", b.dataset.k === f.match);
          b.classList.toggle("rn-lzw-off", !!f.match && b.dataset.k !== f.match);
        });
        s.ents.forEach((en) => en.classList.toggle("rn-lzw-hit", en.dataset.k === f.match));
        s.codes.forEach((e, k) => {
          e.hidden = k >= f.out.length;
          e.textContent = f.out[k] || "";
        });
      },
      frames,
    });
  }

  // prettier-ignore
  L["a7-huffman-worked"] = {
    sum: "The lecture's five-letter example, step by step: build the tree, read off the codes, compare with entropy, then encode and decode a real message.",
    steps: [
      { t: "The lecture's source", b: `<p>Five letters with probabilities A 0.16, B 0.51, C 0.09, D 0.13, E 0.11. The first move is to sort them. B is by far the most common.</p>`,
        v: table(["letter", "probability", "sorted"], [["A", "0.16", "2nd"], ["B", "0.51", "1st"], ["C", "0.09", "5th (smallest)"], ["D", "0.13", "3rd"], ["E", "0.11", "4th"]], 460),
        c: { q: "Which two letters merge first?", o: ["C (0.09) and E (0.11)", "A (0.16) and D (0.13)", "B (0.51) and A (0.16)"], a: 0, why: "Always merge the two <b>smallest</b>. Those are C and E, giving a node of 0.20." } },
      { t: "Merge, merge, merge", b: `<p>Each merge puts a new node back in the queue. The lecture labels the larger branch 1 and the smaller 0.</p>`,
        v: FG.frames([
          { t: "C 0.09 + E 0.11 = 0.20", v: FG.cells([{ v: "B", sub: ".51" }, { v: "A", sub: ".16" }, { v: "D", sub: ".13" }, { v: "CE", sub: ".20", c: "teal" }]) },
          { t: "D 0.13 + A 0.16 = 0.29", v: FG.cells([{ v: "B", sub: ".51" }, { v: "DA", sub: ".29", c: "violet" }, { v: "CE", sub: ".20" }]) },
          { t: "CE 0.20 + DA 0.29 = 0.49", v: FG.cells([{ v: "B", sub: ".51" }, { v: "CEDA", sub: ".49", c: "amber" }]) },
          { t: "B 0.51 + 0.49 = 1.00: done", v: FG.cells([{ v: "root", sub: "1.00", c: "rose" }]) },
        ]),
        c: { q: "After C and E merge, the queue is B 0.51, A 0.16, D 0.13 and CE 0.20. Which two merge next?", o: ["D 0.13 and A 0.16", "CE 0.20 and A 0.16", "B 0.51 and CE 0.20"], a: 0, why: "The two smallest are 0.13 and 0.16." } },
      { t: "Reading off the codewords", b: `<p>Walk from the root and write down the branch labels. The lecture's table is:</p><p><b>B = 1, A = 011, D = 010, E = 001, C = 000</b></p><p>B sits one step from the root, the other four three steps down. Swap the 0 and 1 labels at any merge and you get another valid code with the same lengths.</p>`,
        v: FG.cells([{ v: "B", sub: "1", c: "teal" }, { v: "A", sub: "011", c: "violet" }, { v: "D", sub: "010", c: "violet" }, { v: "E", sub: "001", c: "violet" }, { v: "C", sub: "000", c: "violet" }], { size: 62 }),
        c: { q: "Is B = 1 a prefix of any other codeword in this table?", o: ["No: all the others start with 0", "Yes: it is a prefix of the codeword for A", "It depends on which message is sent"], a: 0, why: "A, D, E and C all begin with 0, so the single bit 1 can only mean B. That is what keeps the code prefix-free." } },
      { t: "Average length versus entropy", b: `<p>$L = 1(0.51) + 3(0.16 + 0.13 + 0.11 + 0.09) = 0.51 + 3(0.49) = \\mathbf{1.98}$ bits per symbol.</p><p>Entropy: $H = \\sum p\\log_2\\tfrac1p \\approx \\mathbf{1.964}$. So $L$ sits just above $H$ (by about 0.016), as it must. A fixed code for five letters costs 3 bits per symbol.</p>`,
        v: FG.bars([["fixed-length code", 3, "dim", "bits"], ["Huffman L", 1.98, "teal"], ["entropy H", 1.964, "violet"]], { max: 3, fmt: (v) => v.toFixed(3) }),
        c: { q: "Which relationship holds for Huffman's average length L and the entropy H?", o: ["L is a little above H", "L is a little below H", "L is far above H"], a: 0, why: "L ≥ H always. Here the gap is only about 0.016 bits per symbol." } },
      { t: "Encode BBADEBC", b: `<p>Look each letter up in the table and concatenate: B, B, A, D, E, B, C becomes</p><p><b class="mono">1 · 1 · 011 · 010 · 001 · 1 · 000</b> = <b class="mono">110110100011000</b></p><p>That is <b>15 bits</b>, against 21 with a fixed 3-bit code. The three Bs are the saving.</p>`,
        v: FG.cells(["B", "B", "A", "D", "E", "B", "C"].map((c) => ({ v: c, sub: LEC_CODES[c], c: c === "B" ? "teal" : "violet" })), { size: 52 }),
        c: { q: "How many bits does BBADEBC take with this Huffman code?", o: ["15", "21", "7"], a: 0, why: "1 + 1 + 3 + 3 + 3 + 1 + 3 = 15 bits." } },
      { t: "Watch it decode", b: `<p>The decoder knows only the table and the bit stream <b class="mono">110110100011000</b>. Press <b>play</b> or step with the arrows. It reads a bit at a time, grows a prefix, and the moment the prefix is a codeword it outputs that letter and starts over.</p><p>It will pause twice and ask which letter a prefix stands for.</p>`,
        v: (box, life) => huffDecodeRun(box, life) },
      { t: "Many valid codes, one best length", b: `<p>Ties and 0/1 labels can be chosen differently, so there is <b>more than one</b> Huffman code for the same source. All of them have the <b>same average length</b>, the minimum.</p><p>When every probability is a power of ½ (like ½, ¼, ⅛, ⅛) the ideal lengths are whole numbers, so $L = H$ exactly: 1.75 bits. Otherwise there is a small gap, as here.</p>`,
        v: FG.compare({ title: "p = ½, ¼, ⅛, ⅛", c: "teal", body: "lengths 1, 2, 3, 3<br><b>L = H = 1.75</b>: no rounding loss" }, { title: "p = .51, .16, .13, .11, .09", c: "violet", body: "lengths 1, 3, 3, 3, 3<br><b>L = 1.98</b> vs <b>H = 1.964</b>" }),
        c: { q: "Two people build Huffman codes for the same source, one swapping every 0 and 1. Their average lengths are…", o: ["The same: relabelling changes no lengths", "Different, because one of the two must be better", "Equal only if the source happens to be uniform"], a: 0, why: "Swapping 0 and 1 at a merge changes the codewords but not their lengths, so L is unchanged." } },
    ],
    guide: ["Tap letters to build a message and see its bit string and saving against fixed 3-bit codes.", "Build BBADEBC (the default) and check it gives 15 bits.", "Press <b>Read next bit</b> repeatedly and watch the prefix grow and reset.", "Answer the questions after the demo."],
  };
  Object.assign(sh, { LEC_CODES, encode, decodeTree });
})();
