(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, PK, RC, SVG, TX, circleFig, slotsFig } = partScope;
  const B = NIC.bank;

  B.add("a9-fft", [
    {
      type: "pick",
      q: "An 8-point FFT first shuffles its inputs into bit-reversed order. Tap the slot that x[3] is moved into.",
      fig: slotsFig,
      a: "s6",
      hint: "3 is 011 in three bits. Read those bits backwards.",
      why: "3 = 011, and 011 reversed is 110 = 6. So x[3] goes to slot 6 (and x[6] goes to slot 3). This shuffle puts the even/odd splitting of every level into place, so the butterflies can then work in place level by level.",
    },
    {
      type: "pick",
      q: "In an 8-point FFT the twiddle factor Wᵏ is the point k steps clockwise round the circle from W⁰ = 1. A butterfly computes a + W·b and a − W·b using ONE multiplication. That works because the twiddle for the second output is exactly opposite. Tap the point opposite W¹.",
      fig: circleFig,
      a: "p5",
      why: "Opposite means half a turn, which is 4 steps out of 8, so the point is W⁵ = −W¹. The second output can therefore reuse the same product with a flipped sign, a − W·b, instead of doing another multiplication. This sharing is a big part of why the FFT is fast.",
    },
    M(
      "A signal has N = 1,048,576 (about a million) samples. Roughly how many times fewer operations does an FFT need than the direct DFT?",
      ["About 20×", "About 1,000×", "About 50,000×", "About 1,000,000×"],
      2,
      "The direct DFT needs about N² operations and the FFT about N log₂ N, so the ratio is N / log₂ N = 1,048,576 / 20 ≈ 50,000. The gain grows with N, so it matters most for large signals.",
      { hint: "log₂ of a million is about 20. Divide a million by 20." },
    ),
    {
      type: "slider",
      q: "How many butterflies in total does a 64-point radix-2 FFT perform?",
      min: 0,
      max: 400,
      step: 4,
      ans: 192,
      tol: 16,
      hint: "log₂ 64 levels, and 32 butterflies on each level.",
      why: "There are log₂ 64 = 6 levels with N / 2 = 32 butterflies each, so 6 × 32 = 192. The direct DFT would need about 64 × 64 = 4,096 multiplications.",
    },
    {
      type: "bug",
      q: "A programmer multiplies two polynomials by FFT: transform both, multiply point by point, transform back. The product comes out wrapped round and wrong. Click the faulty line.",
      code: [
        "def polymul(a, b):",
        "    n = max(len(a), len(b))",
        "    A = fft(a + [0] * (n - len(a)))",
        "    B = fft(b + [0] * (n - len(b)))",
        "    C = [p * q for p, q in zip(A, B)]",
        "    return ifft(C)",
      ],
      a: 1,
      why: "A product of lengths la and lb has la + lb − 1 coefficients, so n must be at least that (rounded up to a power of two). With a smaller n the high-order terms wrap round and add onto the low ones. Zero-padding up to that length stops it.",
    },
  ]);

  /* ==================== a10-attn ==================== */
  const attnTableFig = (() => {
    const rows = [
      ["the", "0.6", "10"],
      ["cat", "0.3", "20"],
      ["sat", "0.1", "30"],
    ];
    let s =
      TX(60, 18, "Token", { s: 12 }) + TX(180, 18, "Attention weight", { s: 12 }) + TX(300, 18, "Value", { s: 12 });
    rows.forEach(([t, w, v], i) => {
      const y = 26 + i * 36;
      s +=
        RC(2, y, 356, 30, { r: 8 }) +
        TX(60, y + 21, t, { s: 15 }) +
        TX(180, y + 21, w, { s: 15, f: "var(--blue)" }) +
        TX(300, y + 21, v, { s: 15 });
    });
    return SVG(360, 138, s, "Three tokens with attention weights 0.6, 0.3, 0.1 and values 10, 20, 30");
  })();
  const causalFig = (() => {
    const w = ["The", "cat", "sat", "on", "the", "mat"];
    let s = "";
    w.forEach((t, i) => {
      const ed = i === 3;
      s += PK(
        "t" + (i + 1),
        RC(6 + i * 66, 28, 60, 40, {
          r: 9,
          k: ed ? "var(--amber)" : "var(--line-2)",
          f: ed ? "var(--amber)" : "var(--panel)",
          fo: ed ? 0.22 : 1,
        }) + TX(36 + i * 66, 53, t, { s: 14 }),
      );
    });
    s += TX(36 + 3 * 66, 90, "edited", { s: 12, f: "var(--amber)" });
    return SVG(410, 100, s, "Six tokens The cat sat on the mat, with the fourth token on being edited");
  })();
  const headsFig = (() => {
    const n = 5,
      cs = 22;
    const mats = [
      ["Head 1", (i, j) => (j > i ? null : 1 / (i + 1))],
      ["Head 2", (i, j) => (j > i ? null : i === 0 ? 1 : j === i - 1 ? 0.8 : j === i ? 0.2 : 0)],
      ["Head 3", (i, j) => (j > i ? null : i === 0 ? 1 : j === 0 ? 0.9 : j === i ? 0.1 : 0)],
    ];
    let s = "";
    mats.forEach(([name, f], m) => {
      const x0 = 14 + m * 132,
        y0 = 30;
      let g = TX(x0 + 55, 18, name, { s: 13 });
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const v = f(i, j);
          g +=
            v === null
              ? RC(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2, {
                  r: 3,
                  f: "var(--bg-2, var(--panel))",
                  k: "var(--line)",
                  w: 1,
                  d: "2 2",
                })
              : RC(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2, {
                  r: 3,
                  f: "var(--blue)",
                  fo: Math.max(0.04, v),
                  k: "var(--line-2)",
                  w: 1,
                });
        }
      s += PK("h" + (m + 1), RC(x0 - 8, 4, 126, 146, { r: 10, f: "transparent", k: "var(--line)", w: 1 }) + g);
    });
    s += TX(200, 166, "row = word asking, column = word it looks at; darker = more weight", { s: 11, w: 700 });
    return SVG(
      400,
      176,
      s,
      "Three 5 by 5 attention heatmaps for Head 1, Head 2 and Head 3, with the upper triangle masked",
    );
  })();

  B.add("a10-attn", [
    {
      type: "mcq",
      q: "One token attends to three tokens with the weights and values shown (values are plain numbers here, to keep it simple). What is its attention output?",
      o: ["10", "15", "20", "30"],
      a: 1,
      fig: attnTableFig,
      hint: "Weight each value: 0.6 × 10 + 0.3 × 20 + 0.1 × 30.",
      why: "The output is a weighted sum of values: 6 + 6 + 3 = 15. It is not the value of the top-weighted token (10) and not the plain average (20). Attention blends everything it looks at, in proportion to the weights.",
    },
    {
      type: "pick",
      q: 'A causal model reads "The cat sat on the mat". You edit token 4 ("on") and re-run one attention layer. Tap every token whose attention output can change.',
      fig: causalFig,
      a: ["t4", "t5", "t6"],
      why: "With a causal mask, each token looks only at itself and earlier tokens. So tokens 1 to 3 never see token 4, and their outputs stay the same. Token 4 itself and the later tokens 5 and 6 can all see the edit. This is why generation can reuse earlier results as it adds new tokens.",
    },
    {
      type: "pick",
      q: "These three heads were printed for a 5-word sentence. Tap the head that mostly looks at the PREVIOUS word.",
      fig: headsFig,
      a: "h2",
      why: "Head 2 puts most of its weight just below the diagonal, on the word before. Head 1 spreads weight evenly over everything so far, and Head 3 sends almost everything to the first word. Different heads learn different jobs, which is the reason for having several.",
    },
    {
      type: "match",
      q: "A model has a bug. Match each symptom to the missing piece of attention.",
      pairs: [
        [
          "It predicts the next word perfectly in training, but fails when generating",
          "The causal mask (it peeks at the answer)",
        ],
        ["Shuffling the words gives exactly the same output", "Position information"],
        ["Weights are almost all 0 or 1 and learning stalls", "The 1/√d scaling of scores"],
        ["The weights in a row add up to far more than 1", "Softmax"],
      ],
      why: "Without a mask the model can copy the word it is meant to predict, which only looks like brilliance in training. Attention alone has no sense of order, so position must be added. Unscaled dot products get huge, pushing softmax to a hard 0/1 pick with tiny gradients. Weights that don't add to 1 mean softmax is missing.",
    },
    {
      type: "bug",
      q: "A programmer's single attention head runs without errors but the output ignores what the tokens actually say, so it looks like a copy of the keys. Click the faulty line.",
      code: ["q = X @ Wq", "k = X @ Wk", "v = X @ Wv", "s = q @ k.T / d ** 0.5", "w = softmax(s)", "out = w @ k"],
      a: 5,
      why: "The weights decide how much of each token's VALUE to blend in: out = w @ v. Using k there blends the keys, which are only labels for matching. The values are the content that attention is meant to carry forward.",
    },
  ]);
})();
