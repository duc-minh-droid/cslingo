/* js/content/algo/algo-p9-x-02.js: Deepens a9-dft, a9-fft and a10-attn; 10.6 Inside an encoder layer. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap, archSvg, svgFig, tint } = shared;
  const TAU = Math.PI * 2;
  /** A circle of n stopping points (an arrow turning 1/n of a circle per step), with optional tags, diameters, highlights. */
  const wheel = (n, { tags = {}, pairs = [], hl = [] } = {}) => {
    const P = (p, r) => [150 + r * Math.cos((TAU * p) / n), 96 + r * Math.sin((TAU * p) / n)].map((v) => v.toFixed(1));
    const ln = ([a, b]) =>
      `<line x1="${P(a, 62)[0]}" y1="${P(a, 62)[1]}" x2="${P(b, 62)[0]}" y2="${P(b, 62)[1]}" stroke="var(--violet)" stroke-width="2" stroke-dasharray="5 4" class="draw"/>`;
    const dot = (p) => {
      const c = hl.includes(p) ? "amber" : "blue";
      return `<circle cx="${P(p, 62)[0]}" cy="${P(p, 62)[1]}" r="8" fill="${tint(c, 55)}" stroke="var(--${c})" stroke-width="2" class="fi"/><text x="${P(p, 90)[0]}" y="${+P(p, 90)[1] + 4}" class="fig-sub">${tags[p] ?? p}</text>`;
    };
    return svgFig(
      300,
      192,
      `A circle with ${n} equally spaced stopping points, numbered from 0 clockwise`,
      `<circle cx="150" cy="96" r="62" fill="none" stroke="var(--line-2)" stroke-width="2"/>${pairs.map(ln).join("")}${Array.from({ length: n }, (_, p) => dot(p)).join("")}`,
      190,
    );
  };
  const bar = (x, y, w, h, c, t = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${tint(c, 40)}" stroke="var(--${c})" stroke-width="2" class="fi"/>${t}`;
  const insertAfter = (id, title, step) => {
    const st = L[id] && L[id].steps;
    if (!st) return;
    const i = st.findIndex((s) => s.t === title);
    st.splice(i < 0 ? st.length : i + 1, 0, step);
  };
  const binsFig = () => {
    const bx = (k) => 30 + k * 2.5;
    const tk = ([k, a, b]) =>
      `<line x1="${bx(k)}" y1="84" x2="${bx(k)}" y2="98" stroke="var(--text-faint)" stroke-width="2"/><text x="${bx(k)}" y="116" class="fig-box">${a}</text><text x="${bx(k)}" y="132" class="fig-sub">${b}</text>`;
    const T = [
      [0, "bin 0", "0 Hz"],
      [40, "bin 40", "120 Hz"],
      [100, "bin 100", "300 Hz = half the rate"],
      [160, "bin 160", "480 Hz"],
      [200, "bin 200", "600 Hz = the rate"],
    ];
    return svgFig(
      560,
      146,
      "A frequency axis for 200 bins at 600 samples per second. Bins 0 to 100 are new information; bins 100 to 200 mirror them.",
      `<rect x="30" y="64" width="250" height="20" rx="4" fill="${tint("teal")}"/><rect x="280" y="64" width="250" height="20" rx="4" fill="${tint("rose")}"/><text x="155" y="78" class="fig-sub">new information</text><text x="405" y="78" class="fig-sub">mirror image</text>${T.map(tk).join("")}<path d="M${bx(40)} 60 Q ${bx(100)} 4 ${bx(160)} 60" fill="none" stroke="var(--violet)" stroke-width="2" stroke-dasharray="5 4" class="draw"/><text x="280" y="26" class="fig-sub" style="fill:var(--violet-ink)">bin 160 is a copy of bin 40</text>`,
    );
  };
  insertAfter("a9-dft", "Three hand DFTs worth memorising (N = 4)", {
    t: "Bins, hertz and the mirror",
    b: `<p>Record 200 samples at 600 per second and you have captured a third of a second. Bin 40 asks: how many times does a wave fit into that window? <b>40 times in a third of a second is 120 Hz.</b> Every bin is the same step apart (3 Hz here), so a <b>longer recording gives finer bins</b>.</p><p>The bins climb to half the sample rate (300 Hz here, the <b>Nyquist</b> frequency). Past that the picture repeats as a <b>mirror image</b>, so a real signal only carries new information in the first half.</p><details class="math-more"><summary>Show the maths</summary><p>Bin $k$ answers for the frequency $k\\,f_s/N$, so neighbouring bins are $\\Delta f = f_s/N$ apart. For a real signal, bin $N-k$ mirrors bin $k$, so only bins $0$ to $N/2$ are independent. Bin $N/2$ is at $f_s/2$.</p></details>`,
    v: binsFig(),
    c: {
      q: "fs = 600 Hz and N = 200. Which frequency is bin k = 40?",
      o: ["40 Hz", "120 Hz", "15 Hz"],
      a: 1,
      hint: "Spacing is fs / N = 3 Hz.",
      why: "$f_s/N = 3$ Hz per bin, so bin 40 is 40 × 3 = 120 Hz.",
    },
  });
  insertAfter("a9-dft", "Bins, hertz and the mirror", {
    t: "Magnitude and phase of a bin",
    b: `<p>Each output $X[k]$ is a <b>complex number</b>. Its <b>magnitude</b> $|X[k]|=\\sqrt{\\text{re}^2+\\text{im}^2}$ says how strong frequency $k$ is. Its <b>angle</b> (phase) says how that wave is shifted in time.</p><p>Spectrum plots usually show only the magnitude, but the phase is needed to rebuild the signal exactly.</p>`,
    v:
      `<svg class="fig" viewBox="0 0 280 200" style="max-height:200px"><line x1="30" y1="170" x2="250" y2="170" stroke="var(--line-2)"/><line x1="30" y1="170" x2="30" y2="20" stroke="var(--line-2)"/><line x1="30" y1="170" x2="190" y2="50" stroke="var(--teal)" stroke-width="4" class="draw"/><line x1="190" y1="170" x2="190" y2="50" stroke="var(--line-2)" stroke-dasharray="4 4"/><text x="110" y="188" class="fig-sub">real = 3</text><text x="214" y="116" class="fig-sub" style="text-anchor:start">imaginary = 4</text><text x="92" y="98" class="fig-sub" style="fill:var(--teal)">|X| = 5</text></svg>` +
      cap("X = 3 + 4j has magnitude 5 (a 3-4-5 triangle)."),
    c: {
      q: "X[k] = 3 + 4j. What is its magnitude?",
      o: ["7", "5", "12"],
      a: 1,
      why: "$\\sqrt{3^2+4^2}=\\sqrt{25}=5$.",
    },
  });
  insertAfter("a9-fft", "Where the waste is", {
    t: "Two symmetries of the twiddle",
    b: `<p>The DFT multiplies samples by a spinning arrow, and that arrow only ever points at a handful of places. An arrow that turns an eighth of a circle per step has just <b>8 stopping points</b>. Take 8 steps and you are back at the start, so step 11 lands exactly where step 3 did.</p><p>Arrows half a circle apart are exact opposites: one is the other with its sign flipped. So a DFT keeps multiplying by the same few values, and most of its products are <b>repeats or sign-flips</b> of each other. That is the waste the FFT removes.</p><details class="math-more"><summary>Show the maths</summary><p>Write $W_N = e^{-j2\\pi/N}$ (the "twiddle"). The DFT is $X[k]=\\sum_n x[n]\\,W_N^{kn}$. Two facts about its powers hold all the redundancy.</p><p><b>Periodicity:</b> $W_N^{k(n+N)}=W_N^{kn}$, because $N$ steps of $1/N$ of a turn is a full turn. <b>Conjugate symmetry:</b> $(W_N^{kn})^{*}=W_N^{-kn}$.</p></details>`,
    v:
      wheel(8, { tags: { 0: "0 = 8", 3: "3 = 11" }, pairs: [[1, 5]], hl: [3] }) +
      cap("Turning clockwise, step 11 lands on the same spot as step 3. Steps 1 and 5 are opposite."),
    c: {
      q: "An arrow turns an eighth of a circle per step. After 11 steps, where is it compared with after 3 steps?",
      o: ["In exactly the same place", "On the opposite side of the circle", "Eleven-eighths of a turn further round"],
      a: 0,
      hint: "8 steps is one full circle, and 11 = 8 + 3.",
      why: "8 steps bring the arrow back to the start, so 11 steps leave it where 3 steps did.",
    },
  });
  insertAfter("a9-fft", "The split that halves the work", {
    t: "Why the split is legal",
    b: `<p>Deal the samples into two piles, the <b>even positions</b> and the <b>odd positions</b>. Each pile gets its own small DFT, and the two small answers snap together into the full one. Press <b>Next</b> in the picture to watch it happen.</p><p>Why is that allowed? Every output listens to all the samples with spinning arrows. Look only at the even samples: stepping from one to the next, the arrow turns twice as far, which is exactly how a DFT of half the size turns its arrow. The odd samples do the same, one step later, which is a fixed twist for each output. And the small answers repeat after half the outputs, so the same two small DFTs feed <b>every</b> output. That sharing is the saving.</p><details class="math-more"><summary>Show the maths</summary><p>Split $X[k]$ into even samples $n=2r$ and odd samples $n=2r+1$. The index $r$ runs from $0$ to $N/2-1$ in both sums:</p>$$X[k]=\\sum_{r=0}^{N/2-1}x[2r]\\,(W_N^{2})^{kr}+W_N^{k}\\sum_{r=0}^{N/2-1}x[2r+1]\\,(W_N^{2})^{kr}$$<p>Now $W_N^{2}=e^{-j2\\pi\\cdot 2/N}=e^{-j2\\pi/(N/2)}=W_{N/2}$, so each sum is a DFT of size $N/2$. This is <b>decimation in time</b>: $X[k]=X_e[k]+W_N^{k}X_o[k]$.</p></details>`,
    v: (box, life) => shared.splitFig(box, life),
    c: {
      q: "After the two small DFTs, how are the 8 final outputs produced?",
      o: [
        "Each pair of small results gives two outputs: a sum and a difference",
        "The even pile gives outputs 0 to 3 and the odd pile gives outputs 4 to 7",
        "Both piles are transformed again at full size, then averaged",
      ],
      a: 0,
      hint: "Watch the last picture: each pair of tiles feeds two outputs.",
      why: "Each pair (E<sub>k</sub>, O<sub>k</sub>) gives output k as E + w·O and output k + 4 as E − w·O. Every output needs both piles.",
    },
  });
  const costFig = () => {
    const R = [
      ["no split", 64, 0],
      ["1 split", 32, 8],
      ["2 splits", 16, 16],
      ["3 splits", 8, 24],
    ];
    const row = ([l, a, b], i) =>
      `<text x="130" y="${34 + i * 40}" class="fig-box" style="text-anchor:end">${l}</text>${bar(140, 14 + i * 40, a * 6, 30, "rose")}${b ? bar(140 + a * 6, 14 + i * 40, b * 6, 30, "violet") : ""}<text x="${148 + (a + b) * 6}" y="${34 + i * 40}" class="fig-sub" style="text-anchor:start">total ${a + b}</text>`;
    return svgFig(
      560,
      196,
      "Multiplications for 8 samples after 0, 1, 2 and 3 splits: the small-DFT work shrinks while the gluing grows slowly",
      R.map(row).join("") +
        `<rect x="140" y="176" width="14" height="14" rx="3" fill="${tint("rose", 40)}" stroke="var(--rose)"/><text x="160" y="188" class="fig-sub" style="text-anchor:start">work inside the small DFTs</text><rect x="340" y="176" width="14" height="14" rx="3" fill="${tint("violet", 40)}" stroke="var(--violet)"/><text x="360" y="188" class="fig-sub" style="text-anchor:start">gluing the answers (8 per level)</text>`,
    );
  };
  insertAfter("a9-fft", "Recurse to the leaves", {
    t: "Counting the multiplications",
    b: `<p>A direct DFT gives each of 8 outputs a product with each of 8 samples: <b>64 multiplications</b>. Deal the samples into two piles and each small DFT costs only 4 × 4 = 16, so the piles cost 32 between them, plus 8 to glue the answers together: <b>40 in all</b>.</p><p>Now do it again inside each pile, and again, until every pile is one sample. The small-DFT work halves with every split, while gluing costs only 8 per level. After 3 splits the bill is about 32 instead of 64, and for big N the saving is enormous, because the number of levels grows only like log₂ N.</p><details class="math-more"><summary>Show the maths</summary><p>A direct N-point DFT costs $N^2$ multiplications. One split gives two half-size DFTs, each $(N/2)^2$, plus $N$ for the twiddles:</p>$$2\\left(\\tfrac{N}{2}\\right)^2+N=\\tfrac{N^2}{2}+N$$<p>Split $m$ times and the count is $\\tfrac{N^2}{2^m}+mN$. Stop at size-1 problems, $m=\\log_2 N$: that is $N+N\\log_2 N\\approx O(N\\log N)$.</p></details>`,
    v: costFig(),
    c: {
      q: "Why does one split cut the cost of the small DFTs roughly in half?",
      o: [
        "Two half-size DFTs cost a quarter each",
        "The even samples need no multiplications at all",
        "Half of the outputs are thrown away as duplicates",
      ],
      a: 0,
      hint: "Halving the size cuts the cost to a quarter, but there are two piles.",
      why: "A DFT of half the size does a quarter of the products ((N/2)² = N²/4). Two of them cost N²/2, half the original.",
    },
  });
  insertAfter("a9-fft", "Butterflies climb back up", {
    t: "Numerical tricks with W",
    b: `<p>Walk halfway round the circle and you stand on the exact opposite point. So the arrow for the second half of the outputs is the arrow for the first half with its sign flipped, at no extra cost.</p><p>That is what makes a butterfly cheap. It computes <b>a + w·b</b> and <b>a − w·b</b>: the product w·b is calculated <b>once</b> and used twice, added for one output and subtracted for the other.</p><details class="math-more"><summary>Show the maths</summary><p>$W_2^0 = 1$ and $W_2^1 = -1$. In general $W_N^{N/2} = -1$ (half a turn), so $W_N^{N/2+k} = -W_N^{k}$. The second output uses the twiddle for $k + N/2$, which is just $-W_N^k$, so one multiplication is shared by two outputs.</p></details>`,
    v:
      wheel(8, {
        tags: { 5: "5 (opposite 1)" },
        pairs: [
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ],
        hl: [1, 5],
      }) + cap("Each dashed line joins two opposite stops: the same arrow with its sign flipped."),
    c: {
      q: "An arrow turns an eighth of a circle per step. Step 5 is directly opposite which step?",
      o: ["Step 1", "Step 3", "Step 4"],
      a: 0,
      hint: "Opposite means half a circle away, which is 4 steps.",
      why: "Half of 8 steps is 4, and 5 − 4 = 1. So the arrow at step 5 is minus the arrow at step 1.",
    },
  });
  insertAfter("a9-fft", "The payoff, in numbers", {
    t: "A short history",
    b: `<p>The idea is old: Gauss used the principle long before computers. The algorithm was published by <b>Cooley and Tukey in 1965</b>.</p><p>In 1969 a 2048-point analysis of a seismic trace took <b>13½ hours</b> with the direct DFT. With the FFT the same task on the same machine took <b>2.4 seconds</b>: about 20,000 times faster.</p>`,
    v:
      F.bars(
        [
          ["Direct DFT, 1969", 48600, "rose", "13½ hours = 48,600 s"],
          ["FFT, same machine", 2.4, "teal", "2.4 s"],
        ],
        { max: 48600, fmt: () => "" },
      ) + cap("Bar lengths to scale: the FFT bar is a sliver."),
    c: {
      q: "13½ hours became 2.4 seconds. About how many times faster is that?",
      o: ["About 200×", "About 20,000×", "About 2,000,000×"],
      a: 1,
      hint: "13½ hours = 13.5 × 3600 s ≈ 48,600 s, and 48,600 / 2.4 ≈ 20,000.",
      why: "$48{,}600 / 2.4 \\approx 20{,}000$.",
    },
  });

  const fill = (id, title, v) => {
    const st = L[id] && L[id].steps.find((s) => s.t === title);
    if (st && !st.v) st.v = v;
  };
  fill(
    "a9-dft",
    "Reading the playground",
    F.cells([
      { v: "mix sines", sub: "top picture", c: "blue" },
      "→",
      { v: "DFT", c: "violet" },
      "→",
      { v: "spectrum", sub: "bottom picture", c: "teal" },
      "→",
      { v: "> 50 Hz", sub: "folds back", c: "rose" },
    ]),
  );
  fill(
    "a9-fft",
    "Reading the playground",
    F.cells([
      { v: "split", sub: "evens / odds", c: "teal" },
      "→",
      { v: "leaves", sub: "bit-reversed", c: "amber" },
      "→",
      { v: "butterflies", sub: "combine", c: "violet" },
      "→",
      { v: "race", sub: "N² vs N log N", c: "rose" },
    ]),
  );

  const ins = (title, step) => {
    const st = L["a10-attn"].steps,
      i = st.findIndex((s) => s.t === title);
    st.splice(i < 0 ? st.length : i + 1, 0, step);
  };
  ins("Query, key, value", {
    t: "Scaling by the square root of d_k",
    b: `<p>The score for each pair is the dot product $q\\cdot k$ divided by $\\sqrt{d_k}$. Long vectors give big dot products, which would make softmax all-or-nothing; the division keeps the scores in a sensible range. With $d_k=64$ the scores are divided by 8.</p><span class="key">weights = softmax(q·kⱼ / √d_k)</span>`,
    v: table(
      ["d<sub>k</sub>", "divide scores by"],
      [
        ["4", "2"],
        ["16", "4"],
        ["64", "8"],
      ],
    ),
    c: {
      q: "d<sub>k</sub> goes from 16 to 64. How does the divisor change?",
      o: ["From 4 to 8", "From 16 to 64", "It stays the same"],
      a: 0,
      why: "√16 = 4 and √64 = 8.",
    },
  });
  ins("Softmax turns scores into shares", {
    t: "Self-attention: every word looks at every word",
    b: `<p>In <b>self-attention</b> the queries, keys and values all come from the same sentence, so each word attends to <b>all</b> the words, including itself. The word <i>it</i> in "The animal didn't cross the street because it was too tired" puts most of its weight on <i>animal</i>; <i>The</i> or <i>street</i> get little.</p><p>The output for each word is a <b>contextual embedding</b>: its vector rebuilt from the words it attended to. Stacking these rows gives the matrix $Z\\in\\mathbb{R}^{T\\times d_{\\text{model}}}$.</p>`,
    v:
      F.cells(
        [
          { v: "The", c: "dim" },
          { v: "animal", c: "teal" },
          { v: "didn't", c: "dim" },
          { v: "cross", c: "dim" },
          { v: "the", c: "dim" },
          { v: "street", c: "blue" },
          { v: "because", c: "dim" },
          { v: "it", c: "amber", sub: "query" },
        ],
        { size: 40 },
      ) + cap('"it" attends strongly to "animal" (teal), weakly to "street" (blue).'),
    c: {
      q: 'In self-attention, which tokens can the word "it" attend to?',
      o: [
        "Every token in the sentence, including itself",
        "Only the tokens that come before it",
        "Only the nouns in the sentence",
      ],
      a: 0,
      why: "Without a mask, every position scores every position. (A causal mask, used in the decoder, restricts it to earlier tokens.)",
    },
  });
  const lnorm = (x) => {
    const m = x.reduce((a, b) => a + b) / x.length,
      v = x.reduce((a, b) => a + (b - m) ** 2, 0) / x.length;
    return { m, v, z: x.map((t) => (t - m) / Math.sqrt(v + 1e-5)) };
  };
  reg({
    id: "a10-block",
    order: 6,
    num: "10.6",
    title: "Inside an encoder layer",
    blurb: "Two sublayers, each wrapped in a residual connection and layer norm, and stacked N times.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const x = [1, 3, 5, 7],
        FX = [2, -1, 0.5, -2];
      let strength = 1,
        resid = true,
        norm = true;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Add &amp; Norm on one token</h2><span class="faint">a token's vector of 4 numbers goes through a sublayer, then "Add &amp; Norm"</span></div>
        <div class="controls" id="r" style="gap:10px 18px"></div><div class="controls" id="r2"></div>
        <div id="tb"></div>
        <div class="stat-row"><div class="stat teal"><small>Mean of the output</small><b id="s1"></b></div><div class="stat amber"><small>Variance of the output</small><b id="s2"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      const r = qs("#r", card);
      x.forEach((v, i) => {
        const s = N.slider(`x${i + 1}`, -8, 8, 1, v, (t) => String(t));
        s.onInput((t) => {
          x[i] = t;
          draw();
        });
        r.append(s);
      });
      const ss = N.slider("Sublayer strength", 0, 2, 0.5, strength, (t) => fmt(t, 1));
      ss.onInput((t) => {
        strength = t;
        draw();
      });
      const c1 = el(
        `<label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" checked> Residual connection</label>`,
      );
      const c2 = el(
        `<label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" checked> Layer norm</label>`,
      );
      qs("input", c1).onchange = (e) => {
        resid = e.target.checked;
        draw();
      };
      qs("input", c2).onchange = (e) => {
        norm = e.target.checked;
        draw();
      };
      qs("#r2", card).append(ss, c1, c2);
      function draw() {
        const fx = FX.map((v) => v * strength),
          sum = x.map((v, i) => (resid ? v : 0) + fx[i]),
          nr = lnorm(sum),
          out = norm ? nr.z : sum;
        const row = (a) => a.map((v) => fmt(+v.toFixed(2), 2)).join(", ");
        qs("#tb", card).innerHTML = table(
          ["stage", "vector"],
          [
            ["input x", `[${row(x)}]`],
            ["sublayer output F(x)", `[${row(fx)}]`],
            [resid ? "x + F(x)  (residual)" : "F(x) only (no residual)", `[${row(sum)}]`],
            { c: [norm ? "after layer norm" : "output (norm off)", `<b>[${row(out)}]</b>`], hl: true },
          ],
        );
        const m = out.reduce((a, b) => a + b) / 4,
          v = out.reduce((a, b) => a + (b - m) ** 2, 0) / 4;
        qs("#s1", card).textContent = fmt(+m.toFixed(2), 2);
        qs("#s2", card).textContent = fmt(+v.toFixed(2), 2);
        qs("#note", card).innerHTML =
          !resid && strength === 0
            ? `<div class="callout rose"><b>The signal is gone.</b> Without the residual path, a sublayer that outputs nothing wipes the token out.</div>`
            : resid && strength === 0
              ? `<div class="callout teal">With the residual connection, a useless sublayer still passes <b>x</b> through unchanged. That is what lets deep stacks train.</div>`
              : norm
                ? `<div class="callout violet">Layer norm rescales this one token's numbers to mean 0 and variance 1 (before the learned scale and shift), whatever size they arrived with.</div>`
                : "";
      }
      draw();
      root.appendChild(
        predict({
          id: "a10-block-1",
          q: "Residual connection <b>on</b>, layer norm <b>off</b>, and set the <b>sublayer strength to 0</b>. What is the output?",
          opts: [
            "The input x, passed straight through",
            "All zeros, since the sublayer gave nothing",
            "x with every number halved by the layer",
          ],
          a: 0,
          why: "Output = x + F(x) and F(x) = 0, so the skip path delivers x untouched. This shortcut is the point of a residual connection.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-block-2",
          q: "Switch layer norm <b>on</b>. After it, what is the mean of the four output numbers?",
          opts: ["0", "1", "It depends on the input"],
          a: 0,
          why: "Layer norm subtracts the mean of the token's own numbers and divides by their standard deviation, so the result has mean 0 and variance 1 whatever the input.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "An <b>encoder layer</b> has two sublayers: (A) multi-head self-attention, (B) a position-wise feed-forward network.",
            "Each sublayer is wrapped as <b>LayerNorm(x + Sublayer(x))</b>: a <b>residual connection</b> then <b>layer norm</b>.",
            "<b>Residual</b>: the input skips around the sublayer and is added back, so information and gradients flow easily through deep stacks.",
            "<b>Layer norm</b> rescales each token's vector to mean 0, variance 1.",
            "The <b>feed-forward network</b> (two linear layers with a ReLU between) transforms every token on its own; attention is what mixes tokens.",
            "Input and output of a layer have the same shape (T × d<sub>model</sub>), so layers stack N times.",
          ],
          "Attention mixes tokens, the feed-forward network thinks about each one, and skip connections keep the signal alive.",
        ),
      );
    },
  });
  L["a10-block"] = {
    sum: "The encoder is <b>N identical layers</b>. Each has multi-head self-attention and a feed-forward network, wrapped in residual connections and layer norm.",
    steps: [
      {
        t: "Layers in a stack",
        b: `<p>The encoder is one layer repeated $N$ times (the original paper used $N=6$). Each layer takes a $T\\times d_{\\text{model}}$ array and returns an array of the <b>same shape</b>, so layers can be piled up as high as you like.</p>`,
        v: archSvg(["e2", "e3", "e4", "e5"]),
        c: {
          q: "A layer takes T × 512 in. What shape does it return?",
          o: ["T × 512", "T × 1", "512 × 512"],
          a: 0,
          why: "Same shape in and out is what lets N layers be stacked.",
        },
      },
      {
        t: "Two sublayers",
        b: `<p>Each encoder layer has exactly <b>two sublayers</b>:</p><p><b>(A) multi-head self-attention</b> lets every token gather information from the others. <b>(B) a feed-forward network</b> then processes each token separately.</p><p>Both come with <b>residual connections and layer norm</b>.</p>`,
        v: F.flow([
          { t: "Multi-head attention", s: "(A) mix tokens", c: "violet" },
          { t: "Add & Norm", c: "amber" },
          { t: "Feed-forward", s: "(B) per token", c: "teal" },
          { t: "Add & Norm", c: "amber" },
        ]),
        c: {
          q: "Which sublayer lets tokens exchange information with each other?",
          o: ["Multi-head self-attention", "The feed-forward network of a layer", "Layer norm"],
          a: 0,
          why: "The feed-forward network and layer norm act on each token on its own.",
        },
      },
      {
        t: "Residual connections",
        b: `<p>Instead of replacing $x$ by $\\text{Sublayer}(x)$, the layer outputs $x+\\text{Sublayer}(x)$. The input <b>skips around</b> the sublayer and is added back. If the sublayer has nothing useful to add the token passes through unchanged, and gradients can flow straight back through the skip, which makes very deep stacks trainable.</p>`,
        v: `<svg class="fig" viewBox="0 0 360 150" style="max-height:150px"><rect x="130" y="52" width="100" height="40" rx="10" fill="var(--violet-dim)" stroke="var(--violet)" stroke-width="2"/><text x="180" y="77" class="fig-box">Sublayer</text><path d="M20 72 H130 M230 72 H300" stroke="var(--text-faint)" stroke-width="2" marker-end="url(#ah)" fill="none"/><path d="M60 72 V20 H300 V60" stroke="var(--teal)" stroke-width="2.5" fill="none" stroke-dasharray="6 4" class="draw"/><circle cx="300" cy="72" r="12" fill="var(--panel-2)" stroke="var(--amber)" stroke-width="2"/><text x="300" y="77" class="fig-n">+</text><text x="180" y="14" class="fig-sub" style="fill:var(--teal)">skip: x goes round the sublayer</text><text x="30" y="100" class="fig-sub">x</text></svg>`,
        c: {
          q: "A sublayer outputs all zeros. With a residual connection the layer returns…",
          o: ["x unchanged", "All zeros", "−x"],
          a: 0,
          why: "x + 0 = x.",
        },
      },
      {
        t: "Layer norm",
        b: `<p>Different tokens can arrive with numbers of very different size, and deep stacks drift. <b>Layer norm tidies each token on its own: slide its numbers so their average is 0, then stretch or shrink them to a standard spread.</b></p><p>Take [1, 3, 5, 7]. The average is 4, so subtracting it gives [−3, −1, 1, 3]. Those have a typical size of 2.24, so dividing by 2.24 gives about [−1.34, −0.45, 0.45, 1.34]. Whatever size the numbers arrived with, they leave on the same scale.</p><details class="math-more"><summary>Show the maths</summary><p>With the mean $\\mu$ and variance $\\sigma^2$ of the token's numbers:</p>$$\\hat{x}_i=\\frac{x_i-\\mu}{\\sqrt{\\sigma^2+\\epsilon}}$$<p>followed by a learned scale and shift. Here $\\mu=4$ and $\\sigma^2=5$, so $\\sigma\\approx 2.24$. The tiny $\\epsilon$ only stops a division by zero.</p></details>`,
        get v() {
          return shared.lnFig();
        },
        c: {
          q: "One token arrives as [1, 3, 5, 7] and another as [10, 30, 50, 70]. After layer norm, how do they compare?",
          o: [
            "They come out almost identical",
            "The second is ten times larger",
            "The second keeps its larger average",
          ],
          a: 0,
          hint: "The second is the first multiplied by 10, and layer norm removes the average and the overall size.",
          why: "Centring and dividing by the spread cancels the factor of 10: both give about [−1.34, −0.45, 0.45, 1.34].",
        },
      },
      {
        t: "The feed-forward network of a layer",
        b: `<p>Attention has just let the tokens swap information. Now each token gets some private thinking time: its list of 512 numbers goes through a small network on its own. The list is <b>widened</b> to 2048 numbers (room to compute many features), the negative ones are <b>clipped to zero</b>, and it is <b>narrowed</b> back to 512.</p><p>The same weights are used for every token, and tokens do not talk to each other here. That is the division of labour: attention mixes, this part thinks.</p><details class="math-more"><summary>Show the maths</summary>$$\\text{FFN}(x)=\\max(0,\\,xW_1+b_1)\\,W_2+b_2$$<p>The clipping is the ReLU, $\\max(0,\\cdot)$. In the original paper the hidden size was 2048 for $d_{\\text{model}}=512$, four times wider.</p></details>`,
        get v() {
          return shared.ffnFig();
        },
        c: {
          q: "What is the difference between attention and the feed-forward network?",
          o: [
            "Attention mixes tokens; the FFN treats each token alone",
            "Attention treats each token alone; the FFN mixes tokens",
            "Both mix tokens, but the FFN does it more cheaply",
          ],
          a: 0,
          why: "Position-wise means the same small network is applied to every position independently.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Take one token's four numbers $x$ through a sublayer and then <b>Add &amp; Norm</b>. Toggle the residual connection and layer norm, and set the sublayer strength to zero to see what each protects.</p>`,
        v: F.cells([
          { v: "x", c: "blue" },
          "→",
          { v: "F(x)", c: "violet" },
          "→",
          { v: "x + F(x)", c: "amber" },
          "→",
          { v: "norm", c: "teal" },
        ]),
      },
    ],
    guide: [
      "With everything on, read the four stages in the table. Check the output has mean 0.",
      "Set <b>Sublayer strength</b> to 0 with <b>Residual connection</b> on, then off. What survives?",
      "Untick <b>Layer norm</b> and change x to larger numbers: how does the output size change?",
      "Answer the questions after the demo.",
    ],
  };
})();
