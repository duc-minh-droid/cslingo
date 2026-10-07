/* js/content/algo/algo-p9-x-02.js: Deepens a9-dft, a9-fft and a10-attn; 10.6 Inside an encoder layer. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap, archSvg } = shared;
  const insertAfter = (id, title, step) => {
    const st = L[id] && L[id].steps;
    if (!st) return;
    const i = st.findIndex((s) => s.t === title);
    st.splice(i < 0 ? st.length : i + 1, 0, step);
  };
  insertAfter("a9-dft", "Three hand DFTs worth memorising (N = 4)", {
    t: "Bins, hertz and the mirror",
    b: `<p>Bin $k$ answers for the frequency $k\\,f_s/N$, so the bins are $\\Delta f = f_s/N$ apart. To get <b>finer bins</b> record for longer (bigger $N$ at the same $f_s$).</p><p>For a real signal, bin $N-k$ mirrors bin $k$, so only bins $0$ to $N/2$ carry independent information. Bin $N/2$ is the <b>Nyquist</b> frequency, $f_s/2$.</p>`,
    v: table(
      ["Setting", "Result"],
      [
        ["fs = 600 Hz, N = 200", "bin spacing 600 / 200 = <b>3 Hz</b>"],
        ["same, bin k = 40", "40 × 3 = <b>120 Hz</b>"],
        ["same, last independent bin", "k = 100, i.e. 300 Hz (= fs/2)"],
        ["same, bin 160", "mirror of bin 200 − 160 = 40"],
      ],
    ),
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
    b: `<p>Write $W_N = e^{-j2\\pi/N}$ (the "twiddle" kernel). The DFT is $X[k]=\\sum_n x[n]\\,W_N^{kn}$. Two facts about its powers hold all the redundancy:</p><p><b>Periodicity:</b> $W_N^{k(n+N)}=W_N^{kn}$, because $N$ steps of $1/N$ of a turn is a full turn. <b>Conjugate symmetry:</b> $(W_N^{kn})^{*}=W_N^{-kn}$.</p>`,
    v:
      table(
        ["power p", "0", "1", "2", "3", "4", "5", "6", "7", "8"],
        [["W₄ᵖ", "1", "−j", "−1", "j", "1", "−j", "−1", "j", "1"]],
      ) + cap("For N = 4 the values repeat every 4 powers, so a huge number of products are copies of each other."),
    c: {
      q: "In an 8-point DFT, $W_8^{11}$ is the same number as…",
      o: ["$W_8^{3}$", "$W_8^{-3}$", "$W_8^{11/8}$"],
      a: 0,
      hint: "Powers repeat every N = 8, and 11 = 8 + 3.",
      why: "$W_8^{11}=W_8^{8+3}=W_8^{3}$: periodicity.",
    },
  });
  insertAfter("a9-fft", "The split that halves the work", {
    t: "Why the split is legal",
    b: `<p>Split $X[k]$ into even samples $n=2r$ and odd samples $n=2r+1$. The index $r$ runs from <b>0 to N/2 − 1</b> in both sums:</p>$$X[k]=\\sum_{r=0}^{N/2-1}x[2r]\\,(W_N^{2})^{kr}+W_N^{k}\\sum_{r=0}^{N/2-1}x[2r+1]\\,(W_N^{2})^{kr}$$<p>Now $W_N^{2}=e^{-j2\\pi\\cdot 2/N}=e^{-j2\\pi/(N/2)}=W_{N/2}$, so each sum is a DFT of size $N/2$: this is <b>decimation in time</b>: $X[k]=X_e[k]+W_N^{k}X_o[k]$.</p>`,
    v: F.flow([
      { t: "N-point DFT", c: "rose" },
      { t: "even samples", s: "N/2-point DFT", c: "teal" },
      { t: "odd samples", s: "N/2-point DFT", c: "amber" },
      { t: "X_e + W·X_o", s: "recombine", c: "violet" },
    ]),
    c: {
      q: "In the split, why does each half-sum become an N/2-point DFT?",
      o: [
        "Because $W_N^2$ equals $W_{N/2}$",
        "Because half of the samples are thrown away",
        "Because $W_N^k$ is always 1",
      ],
      a: 0,
      why: "Squaring the twiddle halves the angle step's period, which is exactly the kernel of a DFT with N/2 points.",
    },
  });
  insertAfter("a9-fft", "Recurse to the leaves", {
    t: "Counting the multiplications",
    b: `<p>A direct N-point DFT costs $N^2$ multiplications. One split gives two half-size DFTs, each $(N/2)^2$, plus $N$ multiplications by the twiddles:</p>$$2\\left(\\tfrac{N}{2}\\right)^2+N=\\tfrac{N^2}{2}+N$$<p>Split again and again, $m$ times, and the count becomes $\\tfrac{N^2}{2^m}+mN$. Stop at size-1 problems, $m=\\log_2 N$: that is $N+N\\log_2 N\\approx O(N\\log N)$.</p>`,
    v: table(
      ["splits m", "count N²/2ᵐ + mN (N = 8)", "formula"],
      [
        ["0", "64", "N²"],
        ["1", "32 + 8 = 40", "N²/2 + N"],
        ["2", "16 + 16 = 32", "N²/4 + 2N"],
        { c: ["3 (= log₂ 8)", "8 + 24 = 32", "N + N log₂N"], hl: true },
      ],
    ),
    c: {
      q: "N = 16 and one split. Using $N^2/2 + N$, how many multiplications?",
      o: ["128", "144", "272"],
      a: 1,
      hint: "16² = 256, half of that is 128, then add 16.",
      why: "$256/2 + 16 = 144$, down from 256.",
    },
  });
  insertAfter("a9-fft", "Butterflies climb back up", {
    t: "Numerical tricks with W",
    b: `<p>The twiddles have extra structure that makes the butterfly cheap:</p><p>$W_2^0 = 1$ and $W_2^1 = -1$. In general $W_N^{N/2} = -1$ (half a turn) and so $W_N^{N/2+k} = -W_N^{k}$.</p><p>That is why a butterfly is <b>a + W·b and a − W·b</b>: the second output uses the twiddle for $k + N/2$, which is just $-W_N^k$, so one multiplication is shared by two outputs.</p>`,
    v: F.cells(
      [
        { v: "W₈⁰ = 1", c: "teal" },
        { v: "W₈¹", c: "blue" },
        { v: "W₈² = −j", c: "violet" },
        { v: "W₈³", c: "amber" },
        { v: "W₈⁴ = −1", c: "rose", sub: "N/2" },
        { v: "W₈⁵ = −W₈¹", c: "blue" },
      ],
      { size: 58 },
    ),
    c: {
      q: "N = 8. Which of these equals $W_8^{5}$?",
      o: ["$-W_8^{1}$", "$W_8^{1}$", "$-W_8^{5}$"],
      a: 0,
      hint: "5 = 4 + 1 and 4 = N/2.",
      why: "$W_8^{4+1}=W_8^4\\,W_8^1=-W_8^1$.",
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
        b: `<p><b>Layer normalisation</b> rescales each token's vector so its numbers have mean 0 and variance 1:</p>$$\\hat{x}_i=\\frac{x_i-\\mu}{\\sqrt{\\sigma^2+\\epsilon}}$$<p>(then a learned scale and shift). It keeps the numbers a layer sees in a steady range. For $x=[1,3,5,7]$: mean 4, variance 5, giving about $[-1.34,-0.45,0.45,1.34]$.</p>`,
        v: F.compare(
          {
            title: "Before",
            c: "blue",
            body:
              F.bars(
                [
                  ["x₁", 1, "blue"],
                  ["x₂", 3, "blue"],
                  ["x₃", 5, "blue"],
                  ["x₄", 7, "blue"],
                ],
                { max: 7, fmt: (v) => v },
              ) + "mean 4, variance 5",
          },
          {
            title: "After layer norm",
            c: "teal",
            body:
              F.bars(
                [
                  ["x̂₁", 0.0, "teal"],
                  ["x̂₂", 0.45, "teal"],
                  ["x̂₃", 0.9, "teal"],
                  ["x̂₄", 1.34, "teal"],
                ],
                { max: 1.4, fmt: () => "" },
              ) + "centred on 0 (bars show distance above the lowest)",
          },
        ),
        c: {
          q: "After layer norm, a token's numbers have…",
          o: ["Mean 0 and variance 1", "All values between 0 and 1", "The same values as before"],
          a: 0,
          why: "That is the definition: subtract the mean, divide by the standard deviation.",
        },
      },
      {
        t: "The feed-forward network of a layer",
        b: `<p>The second sublayer is a small network applied to <b>each token separately</b> with the same weights: a linear layer up to a wider size, a ReLU, and a linear layer back:</p>$$\\text{FFN}(x)=\\max(0,\\,xW_1+b_1)\\,W_2+b_2$$<p>In the original paper the hidden size was 2048 for $d_{\\text{model}}=512$, four times wider.</p>`,
        v: F.flow([
          { t: "512 numbers", c: "blue" },
          { t: "Linear ↑", s: "→ 2048", c: "violet" },
          { t: "ReLU", s: "max(0, ·)", c: "amber" },
          { t: "Linear ↓", s: "→ 512", c: "teal" },
        ]),
        c: {
          q: "What is the difference between attention and the feed-forward network?",
          o: [
            "Attention mixes tokens together; the FFN treats each token alone",
            "Attention treats each token alone; the FFN mixes tokens together",
            "They are the same operation, just given different names in the paper",
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
