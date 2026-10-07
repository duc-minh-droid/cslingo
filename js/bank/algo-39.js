(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { arrow, circ, figMixerBoard, lines, ln, pk, rc, softmax, svg, tx } = partScope;
  const B = NIC.bank;

  // M2: grid of true frequency against sample rate
  function figAliasGrid() {
    const fs = [16, 32, 64],
      fr = [5, 11, 19, 27],
      x0 = 74,
      y0 = 56,
      cw = 80,
      ch = 38;
    let s =
      tx(x0 + 120, 16, "samples per second", { s: 12, c: "var(--text-dim)" }) +
      tx(8, 16, "tone", { a: "start", s: 12, c: "var(--text-dim)" });
    fs.forEach((v, c) => (s += tx(x0 + c * cw + cw / 2, y0 - 10, `${v} /s`, { s: 13 })));
    fr.forEach((f, r) => {
      s += tx(x0 - 10, y0 + r * ch + ch / 2 + 5, `${f} Hz`, { a: "end", s: 13 });
      fs.forEach(
        (v, c) =>
          (s += pk(
            `${f}-${v}`,
            rc(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6, "p", { r: 8 }) +
              tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 5, "?", { s: 14, c: "var(--text-faint)" }),
          )),
      );
    });
    return svg(
      320,
      y0 + 4 * ch + 6,
      s,
      "A grid with four tone frequencies down the side and three sampling rates across the top",
    );
  }

  // M3: a spectrum with a noise floor
  function figFloor() {
    const amps = [
      0.002, 0.051, 0.032, 0.986, 0.04, 0.012, 0.035, 0.288, 0.013, 0.029, 0.018, 0.054, 0.176, 0.05, 0.007, 0.02, 0.0,
    ];
    const X = (k) => 22 + k * 18,
      Yb = 166,
      sc = 130;
    let s =
      ln(14, Yb, 328, Yb, { c: "var(--text-faint)", w: 2 }) +
      ln(14, Yb - 0.1 * sc, 328, Yb - 0.1 * sc, { c: "var(--rose)", w: 2, d: "5 4" }) +
      tx(326, Yb - 0.1 * sc - 6, "noise floor", { a: "end", s: 11, c: "var(--rose-ink)" });
    amps.forEach((a, k) => {
      s += pk(
        String(k),
        `<rect x="${X(k) - 9}" y="20" width="18" height="${Yb - 20}" fill="transparent"/>` +
          ln(X(k), Yb, X(k), Yb - Math.max(a * sc, 1.5), { c: "var(--blue)", w: 3 }) +
          circ(X(k), Yb - Math.max(a * sc, 1.5), 4.5, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1 }),
      );
    });
    for (let k = 0; k <= 16; k += 2) s += tx(X(k), Yb + 16, k, { s: 11, c: "var(--text-dim)" });
    s += tx(170, Yb + 34, "frequency (Hz)", { s: 12, c: "var(--text-dim)" });
    return svg(340, 206, s, "Spectrum of a mystery signal with a dashed noise floor and several bars rising above it");
  }

  // M4: before and after one even/odd split
  function figSplitAreas() {
    let s =
      tx(58, 16, "One 16-point DFT", { s: 12, c: "var(--text-dim)" }) +
      rc(10, 26, 96, 96, "b", { r: 6 }) +
      tx(58, 79, "16 × 16", { s: 15, c: "var(--blue-ink)" });
    s += lines(58, 142, ["every output reads", "all 16 samples"], { s: 11, c: "var(--text-faint)", lh: 14 });
    s += tx(214, 16, "Split, then combine", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(150, 26, 60, 60, "g", { r: 5 }) +
      tx(180, 61, "8 × 8", { s: 13, c: "var(--teal-ink)" }) +
      rc(218, 26, 60, 60, "g", { r: 5 }) +
      tx(248, 61, "8 × 8", { s: 13, c: "var(--teal-ink)" });
    s +=
      tx(180, 102, "evens", { s: 11, c: "var(--text-faint)" }) +
      tx(248, 102, "odds", { s: 11, c: "var(--text-faint)" });
    s +=
      rc(150, 112, 128, 14, "a", { r: 5 }) +
      lines(214, 142, ["combine: one product", "for each of 8 bin pairs"], { s: 11, c: "var(--amber-ink)", lh: 14 });
    return svg(300, 164, s, "A single 16 by 16 square against two 8 by 8 squares plus a thin combine strip");
  }

  B.add("a9-mix", [
    {
      type: "pick",
      q: "The mixer holds two waves: <b>Wave 1</b> at 3 Hz with strength 1 and <b>Wave 2</b> at 8 Hz with strength 0.5. Which spectrum will it show? Tap it.",
      fig: figMixerBoard(),
      a: "C",
      why: "Each wave gets its own bar: frequency decides where the bar stands and strength decides how tall it is. So there is a full bar at 3 Hz and a half-height one at 8 Hz (C). A has the strengths swapped, and B has moved Wave 2 to 11 Hz (3 + 8), as if frequencies added up. They don't: waves add, frequencies stay.",
    },
    {
      type: "pick",
      q: "You sample tones of 5, 11, 19 and 27 Hz at 16, 32 and 64 samples per second. Tap <b>every</b> cell where the bar will show up at the <b>wrong</b> frequency.",
      fig: figAliasGrid(),
      a: ["11-16", "19-16", "27-16", "19-32", "27-32"],
      hint: "A tone shows correctly only if it is below half the sampling rate: 8, 16 or 32 Hz.",
      why: "The limit is half the sampling rate: 8 Hz at 16/s, 16 Hz at 32/s and 32 Hz at 64/s. At 16/s only 5 Hz is safe (11, 19 and 27 fold back to 5, 3 and 5). At 32/s, 19 and 27 fold to 13 and 5. At 64/s everything is below 32 Hz, so all four are right. Note 27 Hz at 16/s lands on 5 Hz: it impersonates the real 5 Hz tone.",
    },
    {
      type: "pick",
      q: "A mystery signal is sampled for one second at 32 samples per second, and its spectrum is shown. Tap <b>every</b> frequency that is really in the signal, not just noise.",
      fig: figFloor(),
      a: ["3", "7", "12"],
      why: "The dashed line is the noise floor: the wobble a few small random bars make by chance. Three bars clearly rise above it, at 3, 7 and 12 Hz. The 12 Hz one is short but it is far above the floor, so it counts. A short bar means a quiet wave, not a missing one.",
    },
    {
      type: "slider",
      q: "A 16-point DFT costs about 16 × 16 multiplications. Split the samples into evens and odds, run <b>two</b> 8-point DFTs, then combine with one product for each of the 8 bin pairs. About how many multiplications is that in total?",
      fig: figSplitAreas(),
      min: 0,
      max: 300,
      step: 4,
      ans: 136,
      tol: 20,
      unit: " products",
      hint: "8 × 8 = 64, and there are two of them. Then add 8.",
      why: "Two 8-point DFTs cost 2 × 64 = 128, and combining adds 8 more products: 136, roughly half of 256. Split again and again and the saving compounds, which is how the FFT reaches N log N.",
    },
    {
      type: "bug",
      q: "A wave of <code>f</code> Hz sampled <code>fs</code> times per second has its samples at times <code>t / fs</code>. This code should give one second of samples, but the wave comes out wildly wrong. Click the faulty line.",
      code: [
        "def sample(f, fs):",
        "    out = []",
        "    for t in range(fs):",
        "        a = 2 * pi * f * t * fs",
        "        out.append(sin(a))",
        "    return out",
      ],
      a: 3,
      why: "Sample number t is taken at time t / fs seconds, so the angle is 2π × f × t / fs. Multiplying by fs makes the wave race along, faster the more samples you take. It should divide.",
    },
    {
      type: "match",
      q: "In the mixer something changes on screen. Match each thing you see to what you did.",
      pairs: [
        ["A bar jumps to a lower frequency than the wave you set", "Sampled at less than twice its frequency"],
        ["A bar gets taller but stays in place", "Raised that wave's strength"],
        ["A bar slides sideways at the same height", "Changed that wave's frequency"],
        ["A bar disappears from the spectrum", "Set that wave's strength to zero"],
      ],
      why: "Height tracks strength and position tracks frequency. A bar standing at the wrong place when you set nothing wrong is the alias warning: the wave is above half the sampling rate and has folded back.",
    },
  ]);

  /* ================================================================== a10-code (workshop) ================================================================== */

  // X1: printed scores and weights
  function figScoreTable() {
    const rows = [
        [0, 0, 0],
        [-2, 0, 0],
        [1, 1, 0],
        [2, 0, 0],
      ],
      shown = rows.map((r) => softmax(r).map((v) => v.toFixed(2)));
    shown[2] = ["0.50", "0.50", "0.00"];
    let s =
      tx(16, 16, "scores", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(160, 16, "weights printed", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach((r, i) => {
      const y = 24 + i * 44;
      s += pk(
        `r${i}`,
        rc(6, y, 328, 38, "p") +
          tx(16, y + 24, `[${r.join(", ")}]`.replace(/-/g, "−"), { a: "start", s: 14, m: 1 }) +
          tx(160, y + 24, `[${shown[i].join(", ")}]`, { a: "start", s: 14, m: 1 }),
      );
    });
    return svg(
      340,
      204,
      s,
      "Four rows each showing three scores and the three softmax weights a student's code printed",
    );
  }

  // X2: two pipelines for softmax
  function figSoftmaxPipes() {
    const box = (x, y, k, a, b, c) =>
      rc(x, y, 96, 62, k) + lines(x + 48, y + 20, [a, b, c].filter(Boolean), { s: 11, lh: 14 });
    let s = tx(8, 14, "Naive", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      box(8, 22, "p", "scores", "1000, 1000,", "998") +
      arrow(106, 53, 122, 53) +
      box(124, 22, "r", "e^score", "overflow!", "") +
      arrow(222, 53, 238, 53) +
      box(240, 22, "n", "divide by", "the total", "(never reached)");
    s += tx(8, 108, "Subtract the largest score first", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      box(8, 116, "p", "minus the max", "0, 0, −2", "") +
      arrow(106, 147, 122, 147) +
      box(124, 116, "p", "e^score", "1, 1, 0.14", "") +
      arrow(222, 147, 238, 147) +
      box(240, 116, "g", "divide by", "the total", "0.47 0.47 0.06");
    return svg(
      344,
      186,
      s,
      "Naive softmax fails at the exponential on scores near 1000; subtracting the largest score first gives weights 0.47, 0.47, 0.06",
    );
  }

  // X3: where can a blended output land?
  function figHull() {
    const X = (x) => 40 + x * 62,
      Y = (y) => 262 - y * 62;
    let s =
      ln(X(0), Y(0), X(4), Y(0), { c: "var(--line-2)", w: 1.5 }) +
      ln(X(0), Y(0), X(0), Y(4), { c: "var(--line-2)", w: 1.5 });
    for (let v = 1; v <= 4; v++)
      s +=
        tx(X(v), Y(0) + 15, v, { s: 11, c: "var(--text-faint)" }) +
        tx(X(0) - 9, Y(v) + 4, v, { s: 11, c: "var(--text-faint)", a: "end" });
    [
      [3, 0, "v1 (3, 0)", 1],
      [0, 3, "v2 (0, 3)", 1],
      [3, 3, "v3 (3, 3)", 1],
    ].forEach(([x, y, t]) => {
      s += `<rect x="${X(x) - 6}" y="${Y(y) - 6}" width="12" height="12" rx="2" fill="var(--violet)" stroke="var(--violet-lip)" stroke-width="1.5"/>`;
    });
    s +=
      tx(X(3) + 12, Y(0) - 2, "v1", { a: "start", s: 12, c: "var(--violet-ink)" }) +
      tx(X(0) + 12, Y(3) - 4, "v2", { a: "start", s: 12, c: "var(--violet-ink)" }) +
      tx(X(3), Y(3) - 12, "v3", { s: 12, c: "var(--violet-ink)" });
    [
      ["A", 2, 2],
      ["B", 1, 1],
      ["C", 3.55, 2.4],
      ["D", 1, 2.2],
      ["E", 2.4, 0.2],
      ["F", 2.5, 2.5],
    ].forEach(([id, x, y]) => (s += pk(id, circ(X(x), Y(y), 12, "p") + tx(X(x), Y(y) + 5, id, { s: 13 }))));
    return svg(
      336,
      284,
      s,
      "Three value vectors v1 (3,0), v2 (0,3) and v3 (3,3) as purple squares and six candidate outputs A to F",
    );
  }

  // X4: a scale from shared evenly to winner takes all
  function figGauge() {
    let s = ln(20, 40, 320, 40, { c: "var(--text-faint)", w: 3 });
    [
      [0.333, "⅓"],
      [0.5, "½"],
      [0.75, "¾"],
      [1, "1"],
    ].forEach(([v, t]) => {
      const x = 20 + ((v - 0.333) / 0.667) * 300;
      s +=
        ln(x, 33, x, 47, { c: "var(--text-faint)", w: 2 }) +
        tx(x, 64, t, { s: 13, c: "var(--text-dim)", a: v === 1 ? "end" : v < 0.4 ? "start" : "middle" });
    });
    s +=
      tx(20, 18, "even shares", { a: "start", s: 12, c: "var(--blue-ink)" }) +
      tx(320, 18, "winner takes (almost) all", { a: "end", s: 12, c: "var(--amber-ink)" }) +
      tx(170, 84, "weight of the biggest share, 3 tokens", { s: 11, c: "var(--text-faint)" });
    return svg(340, 94, s, "A scale for the biggest softmax weight, from one third to one");
  }

  // X6: matrix shapes in one attention head
  function figShapes() {
    const u = 20,
      mat = (id, x, y, r, c, name, wrong) =>
        pk(
          id,
          rc(x, y, c * u, r * u, wrong ? "p" : "p", { r: 5 }) +
            tx(x + (c * u) / 2, y + (r * u) / 2 - 2, name, { s: 12 }) +
            tx(x + (c * u) / 2, y + (r * u) / 2 + 13, `${r}×${c}`, { s: 12, c: "var(--text-dim)" }),
        );
    let s = tx(8, 14, "3 tokens, d_k = 4, values of 2 numbers. Shape = rows × columns.", {
      a: "start",
      s: 11,
      c: "var(--text-dim)",
    });
    s +=
      mat("Q", 10, 34, 3, 4, "Q") +
      tx(104, 70, "×", { s: 18, c: "var(--text-faint)" }) +
      mat("Kt", 122, 24, 4, 3, "Kᵀ") +
      tx(196, 70, "→", { s: 18, c: "var(--text-faint)" }) +
      mat("scores", 214, 34, 3, 3, "scores");
    s += tx(244, 112, "↓ softmax", { s: 11, c: "var(--text-faint)" });
    s +=
      mat("weights", 10, 134, 3, 3, "weights") +
      tx(88, 170, "×", { s: 18, c: "var(--text-faint)" }) +
      mat("V", 104, 134, 3, 2, "V") +
      tx(160, 170, "=", { s: 18, c: "var(--text-faint)" }) +
      mat("out", 176, 134, 3, 3, "out");
    return svg(300, 210, s, "Six matrices Q, K transposed, scores, weights, V and out with their shapes");
  }

  B.add("a10-code", [
    {
      type: "pick",
      q: "A student prints three scores and the three softmax weights for four different tokens. One row <b>cannot</b> be the output of a correct softmax, whatever the code looks like. Tap it.",
      fig: figScoreTable(),
      a: "r2",
      why: "Softmax turns every score into e^score, which is always positive, so no weight can be exactly 0 (a masked score of −∞ is the only way to get there). Scores [1, 1, 0] should give about 0.42, 0.42, 0.16. The printed 0.50, 0.50, 0.00 looks like each score divided by the total of the scores. Row 2's negative score is fine: it just earns a small share.",
    },
    {
      type: "mcq",
      q: "Scores of 1000 overflow <code>math.exp</code>, so the lab subtracts the biggest score first. Why can that never change the final weights?",
      fig: figSoftmaxPipes(),
      o: [
        "Each term shrinks by the same factor, e to the max, so the final division cancels it",
        "It removes the largest score from the sum, which the other weights never really needed",
        "It rounds the scores so that they match exactly after the exponential step is taken",
        "It forces the weights to add to 1, which the divide step cannot manage on its own",
      ],
      a: 0,
      why: "e^(s − m) = e^s ÷ e^m. Every term gets divided by the same e^m, and so does the total, so the common factor cancels in the final division. The weights are identical, but the numbers stay small enough to compute. Without this step Python raises an OverflowError on <code>math.exp(1000)</code>.",
    },
    {
      type: "pick",
      q: "Three value vectors are fixed: v1 = (3, 0), v2 = (0, 3) and v3 = (3, 3). A token blends them with positive weights that add up to 1. Tap <b>every</b> candidate that no choice of weights could ever produce.",
      fig: figHull(),
      a: ["B", "C", "E"],
      hint: "A blend with weights adding to 1 stays inside the triangle with corners v1, v2 and v3. Which side is x + y = 3?",
      why: "A weighted average with positive weights summing to 1 always lands inside the triangle with corners v1, v2, v3 (x ≤ 3, y ≤ 3 and x + y ≥ 3). B (1, 1) and E (2.4, 0.2) have x + y below 3, and C sticks out past x = 3. A, D and F are inside. Attention can only mix its values, never invent something outside them.",
    },
    {
      type: "order",
      q: "A token's three keys give these score patterns (the other two scores are 0). Order them from the <b>most even</b> weights to the <b>sharpest</b>, judged by the biggest weight.",
      fig: figGauge(),
      hint: "e ≈ 2.7, e³ ≈ 20 and e⁶ ≈ 400. A score of −3 gives a tiny e⁻³ ≈ 0.05.",
      items: ["scores [0, 0, 0]", "scores [−3, 0, 0]", "scores [1, 0, 0]", "scores [3, 0, 0]", "scores [6, 0, 0]"],
      why: "Biggest weights: [0, 0, 0] gives ⅓ each; [−3, 0, 0] makes the first key almost invisible and the others share about 0.49 each; [1, 0, 0] gives 2.7 ÷ (2.7 + 2) ≈ 0.58; [3, 0, 0] gives about 0.91; [6, 0, 0] gives about 0.995. A lower score does not make the blend sharper, it just hands more to the rest.",
    },
    {
      type: "bug",
      q: "In the lab's blend step, <code>weights[j]</code> is token <code>j</code>'s share. This loop runs without any error but gives the wrong mix. Click the faulty line.",
      code: [
        "mix = [0] * len(V[0])",
        "for j in range(len(V)):",
        "    for d in range(len(V[0])):",
        "        mix[d] += weights[d] * V[j][d]",
      ],
      a: 3,
      why: "The share to use is token j's, <code>weights[j]</code>. The line indexes by <code>d</code>, the slot in the value vector, so it multiplies by the wrong weight (and fails with an IndexError whenever there are fewer tokens than slots). It should read <code>weights[j] * V[j][d]</code>.",
    },
    {
      type: "pick",
      q: "n = 3 tokens, d_k = 4 numbers per query and key, and each value vector has 2 numbers. Rows are tokens. One box in this attention head is drawn with the <b>wrong shape</b>. Tap it.",
      fig: figShapes(),
      a: "out",
      why: "The scores and weights are token against token, 3×3, and V is 3×2. Multiplying 3×3 by 3×2 gives 3 rows (one per token) and 2 columns (the length of a value vector), so <b>out</b> should be 3×2. A blend of value vectors can't be wider than the values themselves.",
    },
  ]);

  /* ================================================================== a11-picker (workshop) ================================================================== */

  // P1: decision flow
  function figToolFlow() {
    const Q = [
      ["Link every point as", "cheaply as possible?", "mst", ["MST", "Prim / Kruskal"]],
      ["An outline round", "scattered points?", "hull", ["Convex hull"]],
      ["Best mix under", "straight-line limits?", "lp", ["Linear", "programming"]],
      ["One goal, plus an honest", "estimate of distance left?", "astar", ["A*"]],
    ];
    let s = "";
    Q.forEach(([a, b, id, name], i) => {
      const y = 8 + i * 66;
      s +=
        rc(8, y, 190, 44, "b") +
        lines(103, y + 19, [a, b], { s: 12, lh: 15 }) +
        arrow(200, y + 22, 238, y + 22, "var(--teal)", 2.5) +
        tx(219, y + 14, "yes", { s: 11, c: "var(--teal-ink)" });
      s += pk(
        id,
        rc(242, y + 1, 108, 42, "g") +
          lines(296, y + (name.length > 1 ? 18 : 25), name, { s: 12, lh: 14, c: "var(--teal-ink)" }),
      );
      s += arrow(103, y + 46, 103, y + 64, "var(--rose)", 2.5) + tx(122, y + 59, "no", { s: 11, c: "var(--rose-ink)" });
    });
    s += pk("dijk", rc(8, 272, 190, 38, "g") + tx(103, 296, "Dijkstra", { s: 13, c: "var(--teal-ink)" }));
    return svg(
      356,
      318,
      s,
      "A decision flow chart: four yes/no questions lead to MST, convex hull, linear programming, A* or finally Dijkstra",
    );
  }

  // P2: the channel
  function figChannel() {
    const wire = (x1, x2) => ln(x1, 58, x2, 58, { c: "var(--text-faint)", w: 2 });
    let s =
      rc(6, 36, 62, 44, "n") +
      lines(37, 55, ["Text", "in"], { s: 12, lh: 14 }) +
      rc(272, 36, 62, 44, "n") +
      lines(303, 55, ["Text", "out"], { s: 12, lh: 14 });
    [84, 124, 220, 252].forEach((x) => (s += circ(x, 58, 15, "p") + tx(x, 63, "?", { s: 15, c: "var(--text-faint)" })));
    s += wire(68, 69) + wire(99, 109) + wire(139, 160) + wire(204, 205) + wire(235, 237) + wire(267, 272);
    s += `<polyline points="150,58 160,40 168,74 178,40 188,74 196,58" fill="none" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round"/>`;
    s +=
      tx(173, 100, "noisy link: one bit may flip", { s: 12, c: "var(--amber-ink)" }) +
      tx(106, 28, "two steps before", { s: 11, c: "var(--text-dim)" }) +
      tx(236, 28, "two steps after", { s: 11, c: "var(--text-dim)" });
    return svg(
      340,
      112,
      s,
      "A channel: text goes through two steps, a noisy link where a bit may flip, then two more steps",
    );
  }
  Object.assign(partScope, { figChannel, figToolFlow });
})();
