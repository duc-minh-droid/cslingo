/* Phase 7 coverage pass (1/4): shared helpers, 7.1 redundancy, 7.3 binary entropy, 7.4 Kraft. */
(function () {
  const sh = (NIC.shared.algoP7x = NIC.shared.algoP7x || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    FG = N.fig;
  const reg = (m) => N.register({ subject: "algo", lecture: 7, ...m });
  const lg2 = Math.log2;
  // ---------- small shared helpers (copied locally: other files' helpers are private) ----------
  const table = (head, rows, mw = 640) =>
    `<table class="t" style="max-width:${mw}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${[]
            .concat(r.c || r)
            .map((c) => `<td>${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</table>`;
  const H = (ps) => ps.reduce((a, p) => a - (p > 0 ? p * lg2(p) : 0), 0);
  const norm = (w) => {
    const s = w.reduce((a, b) => a + b, 0);
    return s ? w.map((x) => x / s) : w.map(() => 1 / w.length);
  };
  const mseed = (s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

  /** Simple dynamic line chart as an SVG string (no draw animation, so a slider can redraw it). */
  function curve(fn, { x = [0, 1], y = [0, 1], w = 440, h = 190, marks = [], xl = "", yl = "", n = 120 } = {}) {
    const pad = { l: 36, r: 14, t: 14, b: 28 };
    const X = (v) => pad.l + ((v - x[0]) / (x[1] - x[0])) * (w - pad.l - pad.r),
      Y = (v) => pad.t + (1 - (v - y[0]) / (y[1] - y[0])) * (h - pad.t - pad.b);
    const d = Array.from({ length: n + 1 }, (_, i) => {
      const xv = x[0] + ((x[1] - x[0]) * i) / n;
      return `${i ? "L" : "M"}${X(xv).toFixed(1)} ${Y(fn(xv)).toFixed(1)}`;
    }).join(" ");
    const mk = marks
      .map(
        ([xv, yv, c, lbl, dy = 0]) =>
          `<line x1="${X(xv)}" y1="${Y(yv)}" x2="${X(xv)}" y2="${h - pad.b}" stroke="${c}" stroke-dasharray="4 4"/><circle cx="${X(xv)}" cy="${Y(yv)}" r="6" fill="${c}"/>${lbl ? `<text x="${Math.min(w - 60, X(xv) + 9)}" y="${Math.max(pad.t + 10, Y(yv) - 9 + dy)}" class="fig-sub" style="fill:${c}">${lbl}</text>` : ""}`,
      )
      .join("");
    return `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="${pad.l}" y1="${h - pad.b}" x2="${w - pad.r}" y2="${h - pad.b}" stroke="var(--line-2)"/><line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${h - pad.b}" stroke="var(--line-2)"/>
      <path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>${mk}
      <text x="${w - pad.r}" y="${h - 6}" class="fig-sub" style="text-anchor:end">${xl}</text><text x="${pad.l + 6}" y="${pad.t + 4}" class="fig-sub">${yl}</text></svg>`;
  }

  /** Huffman codes for [[sym, weight]]. Bit `big` goes to the larger child (the lecture gives 1 to the larger). Returns {codes, merges}. */
  function huff(items, big = 1) {
    let id = 0,
      q = items.map(([s, f]) => ({ id: id++, s, f, leaf: true }));
    const merges = [];
    while (q.length > 1) {
      q.sort((a, b) => a.f - b.f || b.leaf - a.leaf || a.id - b.id);
      const [x, y] = q;
      const [hi, lo] = x.f > y.f ? [x, y] : y.f > x.f ? [y, x] : x.id < y.id ? [x, y] : [y, x];
      const nd = { id: id++, f: x.f + y.f, kids: [hi, lo], bits: [String(big), String(1 - big)], s: hi.s + lo.s };
      merges.push([x.s, x.f, y.s, y.f, nd.f]);
      q = q.filter((k) => k !== x && k !== y);
      q.push(nd);
    }
    const codes = {};
    const walk = (nd, c) => {
      if (nd.leaf) codes[nd.s] = c || "0";
      else {
        walk(nd.kids[0], c + nd.bits[0]);
        walk(nd.kids[1], c + nd.bits[1]);
      }
    };
    walk(q[0], "");
    return { codes, merges };
  }
  const lzwEnc = (t, alpha) => {
    const d = new Map(alpha.map((c, i) => [c, i]));
    let w = "";
    const out = [],
      steps = [];
    for (const c of t) {
      if (d.has(w + c)) w += c;
      else {
        out.push(d.get(w));
        steps.push([w, d.get(w), w + c, d.size]);
        d.set(w + c, d.size);
        w = c;
      }
    }
    out.push(d.get(w));
    steps.push([w, d.get(w), "", -1]);
    return { out, steps, dict: [...d] };
  };
  const lzwDec = (codes, alpha) => {
    const d = alpha.slice();
    let prev = null,
      out = "";
    const steps = [];
    for (const k of codes) {
      const miss = k >= d.length,
        e = miss ? prev + prev[0] : d[k];
      let added = null;
      if (prev !== null) {
        added = [d.length, prev + e[0]];
        d.push(prev + e[0]);
      }
      out += e;
      steps.push({ k, e, miss, added });
      prev = e;
    }
    return { out, steps, dict: d };
  };

  const Hb = (p) => H([p, 1 - p]);
  const sampleP = (p, n, seed) => {
    const r = mseed(seed);
    let k = 0;
    for (let i = 0; i < n; i++) if (r() < p) k++;
    return k / n;
  };

  /* ============ 7.1 Redundancy and source coding ============ */
  reg({
    id: "a7-redundancy",
    order: 1,
    num: "7.1",
    title: "Redundancy and source coding",
    blurb:
      "Why we compress at all: text, sound and video are full of repetition. Measure how much a message could shrink.",
    render(root) {
      root.appendChild(header(this, ""));
      const BASE = "most english sentences carry a lot of redundancy because letters follow patterns";
      const scr = (s) =>
        s
          .split(" ")
          .map((w) => (w.length > 3 ? w[0] + [...w.slice(1, -1)].reverse().join("") + w.slice(-1) : w))
          .join(" ");
      const rnd = mseed(11);
      const PRE = {
        english: ["Plain English", BASE],
        scrambled: ["Scrambled English", scr(BASE)],
        repeat: ["Repetitive", "ab".repeat(37)],
        random: [
          "Random letters",
          Array.from({ length: 74 }, () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(rnd() * 26)]).join(""),
        ],
      };
      let key = "english";
      const card =
        el(`<div class="card"><div class="card-head"><h2>Redundancy lab</h2><span class="faint">pick a message, see what a code could save</span></div>
        <div class="controls" id="pre"></div>
        <p class="mono" id="txt" style="margin:8px 0;word-break:break-all;min-height:3.2em"></p>
        <div class="stat-row"><div class="stat"><small>ASCII (8 bits/char)</small><b id="s1"></b></div><div class="stat"><small>Fixed-length code</small><b id="s2"></b></div><div class="stat teal"><small>Huffman code</small><b id="s3"></b></div><div class="stat amber"><small>Entropy floor</small><b id="s4"></b></div></div>
        <div id="bars" style="min-height:150px"></div><p class="faint" id="note" style="min-height:3em"></p></div>`);
      root.appendChild(card);
      qs("#pre", card).appendChild(
        N.seg(
          Object.entries(PRE).map(([k, v]) => [k, v[0]]),
          key,
          (v) => {
            key = v;
            draw();
          },
        ),
      );
      function draw() {
        const s = PRE[key][1],
          n = s.length,
          cnt = {};
        [...s].forEach((c) => (cnt[c] = (cnt[c] || 0) + 1));
        const syms = Object.entries(cnt),
          k = syms.length;
        const h = H(syms.map(([, f]) => f / n));
        const codes = huff(syms).codes;
        const hb = syms.reduce((a, [c, f]) => a + f * codes[c].length, 0);
        const fixed = Math.ceil(lg2(k)) * n,
          ascii = 8 * n;
        qs("#txt", card).textContent = s;
        qs("#s1", card).textContent = ascii + " bits";
        qs("#s2", card).textContent = fixed + " bits";
        qs("#s3", card).textContent = hb + " bits";
        qs("#s4", card).textContent = (n * h).toFixed(0) + " bits";
        qs("#bars", card).innerHTML = FG.bars(
          [
            ["ASCII", ascii, "dim"],
            [`fixed ${Math.ceil(lg2(k))}-bit`, fixed, "violet"],
            ["Huffman", hb, "teal"],
            ["entropy floor", n * h, "amber"],
          ],
          { max: ascii, fmt: (v) => Math.round(v) + " bits" },
        );
        qs("#note", card).innerHTML =
          `${n} characters, ${k} different symbols, entropy ${h.toFixed(2)} bits per character. The Huffman table is not counted here.` +
          (key === "repeat"
            ? " Both symbols are equally common, so a symbol count sees nothing to save. The repeating <i>pattern</i> is the redundancy."
            : "") +
          (key === "scrambled"
            ? " Same letters as the plain version, so the same counts. Order does not matter to a per-symbol count."
            : "");
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-redundancy-1",
          q: "Switch between <b>Plain English</b> and <b>Scrambled English</b>. How do their entropy and Huffman sizes compare?",
          opts: [
            "Scrambled is lower, because jumbling the letters makes it look more random",
            "They match: same letters and spaces, only the order differs",
            "Scrambled is higher, because it is much harder for a person to read",
          ],
          a: 1,
          why: "Both strings contain exactly the same letters, so the counts, the entropy and the Huffman lengths are identical. People read the scrambled version by using <b>context</b>: redundancy that lives in the order and the words, which a per-symbol count cannot see.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-redundancy-2",
          q: "On <b>Repetitive</b> (abab…), Huffman needs 1 bit per character. Could a smarter scheme do far better?",
          opts: [
            "No: 1 bit per symbol is the entropy floor, so there is nothing left to save",
            "Yes: the pattern repeats, so a sequence learner could use far fewer bits",
            "No: Huffman is always optimal for any message, whatever its pattern",
          ],
          a: 1,
          why: "The entropy floor shown here counts symbols one at a time, and Huffman reaches it. But the message is two letters repeating, which a <b>dictionary</b> method (LZW, later in this lecture) squeezes much further.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Compression</b> (source coding) removes redundancy from raw data before it is sent or stored.",
            "A fixed-length code spends the same bits on every symbol. Frequent symbols deserve fewer.",
            "Redundancy comes in kinds: skewed symbol frequencies (Huffman) and repeated sequences (LZW).",
            "Static models are fast but fit no text perfectly; dynamic models fit the text but must be sent; adaptive models learn as they go.",
          ],
          "Compression squeezes out redundancy, and different schemes hunt different kinds of it.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-redundancy"] = {
    sum: "Raw data is wasteful. <b>Compression</b> (source coding) strips out redundancy so the same message fits in fewer bits.",
    steps: [
      { t: "Where compression sits", b: `<p>In a communication system the message goes through <b>source coding</b> first (remove redundancy: compression), then channel coding (add <i>controlled</i> redundancy to survive noise, the next lecture), then the channel.</p><span class="key">Compression takes redundancy out. Error correction puts a little back in, on purpose.</span>`,
        v: FG.flow([{ t: "source", s: "raw data" }, { t: "compress", s: "remove redundancy", c: "teal" }, { t: "error coding", s: "add safe redundancy", c: "violet" }, { t: "channel", s: "noise" }]),
        c: { q: "Which step in the chain removes redundancy?", o: ["Source coding (compression)", "Channel coding, which protects the bits", "The noisy channel in the middle"], a: 0, why: "Source coding squeezes redundancy out. Channel coding adds structured redundancy back to fight noise." } },
      { t: "Raw data is big", b: `<p>Without compression:</p>`,
        v: table(["Data", "Raw size"], [["A 1000-page book as ASCII text", "about 5 MB"], ["30 seconds of digital audio", "about 5.3 MB"], ["7 colour images, 512×512 pixels", "about 5.5 MB"], ["1 second of black and white video", "about 7.86 MB"], ["1 second of colour video", "about 23.6 MB"]], 520),
        c: { q: "Why is raw video the hardest of these to store or stream?", o: ["It needs more processor time than any other kind of data", "Each second adds many megabytes of repeated frames", "Video frames are random noise, so nothing can be reduced"], a: 1, why: "Colour video grows by tens of MB per second, and neighbouring frames and pixels are very alike: the repetition is the redundancy to remove." } },
      { t: "Redundancy in plain English", b: `<p>Read this: <i>"Aoccdrnig to rscheearch at Cmabirgde Uinervtisy, it deosn't mttaer in waht oredr the ltteers in a wrod are..."</i> You can, because the first and last letters stay put and you read whole words, not single letters.</p><p>That is redundancy: English has far more structure than its letters need. The basic idea of compression: <b>find the structure and don't pay for it twice</b>.</p>`,
        v: FG.compare({ title: "What was sent", c: "rose", body: "<code>Aoccdrnig</code>, <code>rscheearch</code>, <code>ltteers</code>: the middle letters are jumbled" }, { title: "What you read", c: "teal", body: "<b>According</b>, <b>research</b>, <b>letters</b>: context and word shape fill the gaps" }),
        c: { q: "The jumbled text is still readable. What does that show?", o: ["It carries more than it needs, so much can be predicted", "English letters are all equally likely, so none can be predicted", "Scrambled text has lower entropy than normal text, so it is easier"], a: 0, why: "Readers rebuild the missing structure from context. That slack is exactly what a compressor removes." } },
      { t: "The fixed-length baseline", b: `<p>Send <b>B B A D E B C</b> with 5 letters. Three bits can name 8 things, so a fixed code needs 3 bits per letter: A=000, B=001, C=010, D=011, E=100.</p><p>7 letters × 3 bits = <b>21 bits</b>. Can we use fewer? B appears three times, everything else once. Give B a <b>short</b> codeword and the rest longer ones: the next lessons build exactly that (the answer is 15 bits).</p>`,
        v: FG.cells(["B", "B", "A", "D", "E", "B", "C"].map((c) => ({ v: c, sub: "3 bits", c: c === "B" ? "teal" : undefined })), { label: "fixed 3 bits: 21 total" }),
        c: { q: "With a fixed-length code, what does a 9-symbol alphabet need per symbol?", o: ["3 bits, because 8 symbols already fit", "4 bits, because 3 bits name only 8 things", "9 bits, one per symbol"], a: 1, why: "A fixed length is ⌈log₂ k⌉ bits for k symbols: 3 bits cover up to 8, and a ninth symbol forces 4." } },
      { t: "Static, dynamic, adaptive models", b: `<p>A compressor needs a <b>model</b> of the data. Three ways to get one:</p>`,
        v: table(["Model", "Idea", "Cost", "Example"], [["<b>Static</b>", "same model for every text", "fast, but never ideal", "Morse code, ASCII"], ["<b>Dynamic</b>", "build the model from this text", "needs a first pass and the model must be sent", "Huffman code"], ["<b>Adaptive</b>", "learn and update as the text arrives", "better fit, but decode from the start", "LZW"]], 720),
        c: { q: "Which kind of model is the Huffman code (frequencies counted in advance, then sent with the data)?", o: ["Static", "Dynamic", "Adaptive"], a: 1, why: "Counting the text first and sending the table is a dynamic model. LZW is the adaptive one." } },
      { t: "The road ahead", b: `<p>Two questions drive this lecture. <b>How well can any code do?</b> (entropy: a hard floor.) <b>How do we get close without knowing the probabilities first?</b> (Huffman if you know them, LZW if you don't.) Then we see where each one turns up: JPEG, GIF, fax.</p>`,
        v: FG.flow([{ t: "entropy", s: "the floor" }, { t: "Huffman", s: "uses known p", c: "teal" }, { t: "LZW", s: "learns as it goes", c: "violet" }, { t: "GIF, JPEG", s: "in the wild", c: "amber" }]) },
    ],
    guide: ["Pick <b>Plain English</b> and read the four size cards: ASCII, fixed, Huffman and the entropy floor.", "Switch to <b>Scrambled English</b>: the numbers do not move. Why?", "Try <b>Repetitive</b> and <b>Random letters</b> and compare how far Huffman sits above the floor.", "Answer the questions after the demo."],
  };

  reg({
    id: "a7-binary-entropy",
    order: 3,
    num: "7.3",
    title: "Entropy of a coin and of real text",
    blurb:
      "The binary entropy curve peaks at one bit for a fair coin. Then estimate entropy from samples and see how close it gets.",
    render(root) {
      root.appendChild(header(this, ""));
      let p = 0.3,
        n = 100,
        seed = 3;
      const card =
        el(`<div class="card"><div class="card-head"><h2>A biased coin</h2><span class="faint">slide the bias, then draw flips to estimate it</span></div>
        <div class="controls" id="ct"></div>
        <div class="grid two"><div id="cv"></div><div>
          <div class="stat-row"><div class="stat teal"><small>True entropy H(p)</small><b id="th"></b></div><div class="stat"><small>Estimated p̂</small><b id="ph"></b></div><div class="stat amber"><small>Empirical entropy</small><b id="eh"></b></div></div>
          <p class="faint" id="msg" style="min-height:3.4em"></p></div></div>
        <div class="controls"><span class="faint">Flips drawn</span><span id="ns"></span><button class="btn small" id="again">Draw again</button></div></div>`);
      root.appendChild(card);
      const sl = N.slider("P(heads)", 1, 99, 1, 30, (v) => v + "%");
      sl.onInput((v) => {
        p = v / 100;
        draw();
      });
      qs("#ct", card).appendChild(sl);
      qs("#ns", card).appendChild(
        N.seg(
          [
            ["10", "10"],
            ["100", "100"],
            ["1000", "1,000"],
            ["10000", "10,000"],
          ],
          "100",
          (v) => {
            n = +v;
            draw();
          },
        ),
      );
      qs("#again", card).onclick = () => {
        seed++;
        draw();
      };
      function draw() {
        const ph = sampleP(p, n, seed * 7919),
          th = Hb(p),
          eh = Hb(ph);
        qs("#cv", card).innerHTML = curve(Hb, {
          x: [0.001, 0.999],
          y: [0, 1.05],
          xl: "p",
          yl: "H(p) bits",
          marks: [
            [p, th, "var(--teal)", ""],
            [Math.min(0.999, Math.max(0.001, ph)), eh, "var(--amber)", ""],
          ],
        });
        qs("#th", card).textContent = th.toFixed(3);
        qs("#ph", card).textContent = ph.toFixed(3);
        qs("#eh", card).textContent = eh.toFixed(3);
        qs("#msg", card).innerHTML =
          `Green dot: the true bias. Orange dot: what ${n.toLocaleString()} flips suggest. They are ${Math.abs(eh - th) < 0.02 ? "very close" : Math.abs(eh - th) < 0.06 ? "close" : "noticeably apart"} (gap ${Math.abs(eh - th).toFixed(3)} bits).`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-binary-entropy-1",
          q: "Compare a coin with P(heads) = 20% against one with P(heads) = 80%. Their entropies are…",
          opts: [
            "Equal: swapping the roles of heads and tails changes nothing",
            "Higher for the 80% coin, because heads is more common",
            "Higher for the 20% coin, because heads is rarer",
          ],
          a: 0,
          why: "H(p) = H(1 − p). The curve is a mirror image around p = 0.5: what matters is how lopsided the coin is, not which side is favoured.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-binary-entropy-2",
          q: "Set the bias to 30% and draw <b>10,000</b> flips. The empirical entropy will be…",
          opts: [
            "Within about 0.02 of the true value: many samples pin it down",
            "Exactly the true value, since the sample is so large",
            "Far off, because random flips make entropy meaningless",
          ],
          a: 0,
          why: "The estimated frequency p̂ wobbles by roughly 0.005 at this size, and the entropy curve is gentle there. With 10 flips the estimate can be well off. It is never promised to be exact.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "For two outcomes, <b>H(p) = −p log₂p − (1−p) log₂(1−p)</b>: zero at p = 0 or 1, a peak of 1 bit at p = ½, symmetric about it.",
            "The more lopsided a source, the fewer bits per symbol it needs: a 90/10 coin is about 0.47 bits per flip.",
            "Entropy of real data is <b>estimated from counts</b>: p̂ = count / total. More samples, better estimate.",
            "Take 0 · log₂ 0 to be 0 (a symbol that never occurs adds nothing).",
          ],
          "A coin carries one bit only when it is fair; bias is compressible.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-binary-entropy"] = {
    sum: "The two-outcome case shows the whole shape of entropy: fair means one bit, skew means less. Then we measure entropy from real counts.",
    steps: [
      { t: "Two outcomes", b: `<p>For a coin that lands heads with probability $p$:</p><p>$$H(p) = -p\\log_2 p - (1-p)\\log_2 (1-p)$$</p><p>It is zero when the outcome is certain and largest, <b>1 bit</b>, at $p = \\tfrac12$.</p>`,
        v: FG.plot([{ f: (x) => Hb(x), c: "blue", fill: true }], { x: [0.001, 0.999], y: [0, 1.05], marks: [[0.5, "1 bit at p = ½", "teal"], [0.1, "0.47", "amber"]], xl: "p", yl: "H(p) bits" }),
        c: { q: "At which bias is a coin's entropy at its maximum?", o: ["p = 0.5, the fair coin", "p = 0.9, the most predictable", "Any bias gives the same entropy"], a: 0, why: "A fair coin is the hardest to predict, so each flip carries the most information: 1 bit." } },
      { t: "Symmetric, and zero at the ends", b: `<p>Swap heads and tails and nothing changes: $H(p) = H(1-p)$. At the extremes the outcome is certain. The formula would ask for $0 \\cdot \\log_2 0$, so by convention <b>$0\\log_2 0 = 0$</b>: an impossible symbol adds nothing.</p>`,
        v: table(["P(heads)", "P(tails)", "H (bits)"], [["0.5", "0.5", Hb(0.5).toFixed(3)], ["0.25", "0.75", Hb(0.25).toFixed(3)], ["0.75", "0.25", Hb(0.75).toFixed(3)], ["0.1", "0.9", Hb(0.1).toFixed(3)], ["0.01", "0.99", Hb(0.01).toFixed(3)], ["0", "1", "0 (by convention)"]], 480),
        c: { q: "Why is H(0.25) equal to H(0.75)?", o: ["Both are equally lopsided; only which side is favoured differs", "Because 0.25 + 0.75 = 1 forces the entropy to be 1", "It is a coincidence of these two numbers"], a: 0, why: "The formula treats the two outcomes symmetrically. A 25/75 coin and a 75/25 coin are mirror images." } },
      { t: "Skewed is easier to compress", b: `<p>A fair coin needs 1 bit per flip. A 90/10 coin has $H \\approx 0.47$ bits. Over 100 flips a good code could use about <b>47 bits</b> instead of 100: runs of the likely side cost almost nothing, and the rare one is the only real news.</p><span class="analogy">A friend who nearly always says "fine" tells you little when they say "fine". You pay attention only to the rare other answers.</span>`,
        v: FG.bars([["fair coin (50/50)", Hb(0.5), "violet", "bits per flip"], ["biased coin (90/10)", Hb(0.1), "teal"], ["certain coin (100/0)", 0, "dim"]], { max: 1, fmt: (v) => v.toFixed(2) }),
        c: { q: "A source's entropy is 0.47 bits per symbol. Roughly how many bits could 100 symbols need at best?", o: ["About 47", "About 100", "About 470"], a: 0, why: "Entropy is bits per symbol, so 100 symbols need about 100 × 0.47 = 47 bits." } },
      { t: "Entropy of a text, from counts", b: `<p>To estimate entropy for real data, count each symbol and use $\\hat p = \\text{count}/\\text{total}$. Take the word <b>banana</b>: b once, a three times, n twice, out of 6.</p><p>$H = \\tfrac16\\log_2 6 + \\tfrac36\\log_2 2 + \\tfrac26\\log_2 3 \\approx 1.46$ bits per letter. The sum adds up each symbol's share of the average surprise: an <b>expected value</b>.</p>`,
        v: table(["letter", "count", "p̂", "−log₂ p̂", "p̂ × (−log₂ p̂)"], [["a", 3, "0.500", "1.000", "0.500"], ["n", 2, "0.333", "1.585", "0.528"], ["b", 1, "0.167", "2.585", "0.431"], { c: ["<b>H</b>", "6", "1.000", "", "<b>1.459</b>"], hl: true }], 640),
        c: { q: "Why do we <b>sum</b> p × (−log₂ p) over the symbols?", o: ["An average of surprise, weighted by probability", "Because the probabilities must add up to exactly 1", "To remove the symbols that never occur in the text"], a: 0, why: "The average of a quantity is Σ probability × value. Here the value is the surprise." } },
      { t: "Sample versus truth", b: `<p>Flip a 30% coin and estimate the entropy from what you see. The true value is $H(0.3) \\approx 0.881$. Few flips give a rough estimate; many flips converge.</p>`,
        v: (() => { const r = mseed(3), rows = []; for (const k of [10, 100, 10000]) { let h = 0; for (let i = 0; i < k; i++) if (r() < 0.3) h++; rows.push([k.toLocaleString() + " flips", h / k, Hb(h / k)]); } return FG.bars(rows.map(([l, ph, e]) => [l + " (p̂ = " + ph.toFixed(3) + ")", e, "amber"]).concat([["true H(0.3)", Hb(0.3), "teal"]]), { max: 1, fmt: (v) => v.toFixed(3) }); })(),
        c: { q: "You estimated entropy from 10 flips and from 10,000. Which do you trust more, and why?", o: ["10,000: the frequencies settle near the true values", "10: smaller samples are always less noisy than big ones", "Neither, since entropy can never be estimated from data"], a: 0, why: "Empirical frequencies converge on the true probabilities as the sample grows, so the empirical entropy converges on the true entropy." } },
      { t: "A loaded die", b: `<p>Probabilities 0.4, 0.2, 0.1, 0.1, 0.1, 0.1. Ideal code lengths $-\\log_2 p$: <b>1.32</b>, <b>2.32</b> and <b>3.32</b> bits. Weight them by $p$ and add: $H \\approx 2.32$.</p><p>A real code needs whole bits, so it lands slightly above: a Huffman code for this die averages <b>2.4</b> bits.</p>`,
        v: table(["face", "p", "ideal −log₂ p", "p × ideal"], [["1", "0.4", "1.32", "0.529"], ["2", "0.2", "2.32", "0.464"], ["3 to 6", "0.1 each", "3.32", "0.332 each"], { c: ["total H", "1.0", "", "<b>2.32</b>"], hl: true }], 560),
        c: { q: "A code for this die averages 2.4 bits, but H ≈ 2.32. Is that a contradiction?", o: ["No: H is a floor, and whole-bit codewords sit just above it", "Yes: no code can ever exceed the entropy", "Yes: the code must be wrong, because it equals neither 2 nor 3"], a: 0, why: "Entropy is a lower bound on the average length. Codes can sit above it; they can never go below." } },
    ],
    guide: ["Drag the <b>P(heads)</b> slider and watch the green dot ride the curve: it peaks at 50%.", "Set the bias to 20%, then 80%: same entropy.", "Choose <b>10</b> flips and press <b>Draw again</b> several times: the orange dot jumps around.", "Switch to <b>10,000</b> flips: it barely moves from the green dot."],
  };
  Object.assign(sh, { table, H, norm, mseed, curve, huff, lzwEnc, lzwDec, Hb });
})();
