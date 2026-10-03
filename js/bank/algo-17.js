(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { LN, M, PK, RC, SVG, TX, dhFig, mitmFig } = partScope;
  const B = NIC.bank;

  B.add("a8-keys", [
    {
      type: "pick",
      q: "Alice and Bob run Diffie-Hellman across a wire that Eve can read. They announce p and g in the clear and then send each other A and B. Tap every value that Eve can read from the wire.",
      fig: dhFig,
      a: ["A", "B", "g", "p"],
      why: "p, g, A and B all cross the wire openly. Their private numbers a and b never leave their owners, and the shared value K is computed locally by each side. Eve would have to solve the discrete logarithm problem to get a or b from A or B.",
    },
    {
      type: "order",
      q: "Put the steps of generating a toy RSA key pair in order.",
      items: [
        "Pick two primes p and q",
        "Multiply them to get n = p × q",
        "Compute φ = (p − 1)(q − 1)",
        "Choose e that shares no factor with φ",
        "Find d so that e × d leaves remainder 1 when divided by φ",
        "Publish (n, e) and keep d secret",
      ],
      why: "Each step feeds the next: φ needs p and q, e must be coprime to φ, and d is the inverse of e modulo φ. Only n and e are published.",
    },
    {
      type: "cat",
      q: "In RSA, which of these can Eve safely see, and which must stay secret?",
      buckets: ["Safe for Eve to see", "Must stay secret"],
      items: [
        ["n (the modulus)", 0],
        ["e (the public exponent)", 0],
        ["d (the private exponent)", 1],
        ["The primes p and q", 1],
        ["The ciphertext sent to you", 0],
        ["φ = (p − 1)(q − 1)", 1],
      ],
      why: "n, e and the ciphertext are all public. p, q and φ give away d, since anyone who knows φ can compute d from e, so they must stay secret along with d itself. Security rests on the difficulty of factoring n into p and q.",
    },
    {
      type: "match",
      q: "Match each job to the key it uses.",
      pairs: [
        ["Send Bob a message only he can read", "Bob's public key"],
        ["Bob reads that message", "Bob's private key"],
        ["Alice signs a contract so anyone can check it came from her", "Alice's private key"],
        ["A stranger checks Alice's signature", "Alice's public key"],
      ],
      why: "Encryption uses the receiver's public key and decryption the receiver's private key. Signing flips it: only the owner can sign with her private key, and anyone can verify with her public key.",
    },
    M(
      "Mallory sits between Alice and Bob and runs a separate Diffie-Hellman exchange with each of them, as drawn. What is the situation afterwards?",
      [
        "Two different keys exist, and Mallory knows both of them",
        "One key is shared by all three, so Mallory can only listen",
        "Alice and Bob share one key that Mallory cannot work out",
        "The maths fails so both sides are told to start again",
      ],
      0,
      "Each exchange succeeds with its own key. Mallory decrypts with K1, reads, re-encrypts with K2 and passes it on, while both victims think they share one key. Diffie-Hellman gives a secret but no proof of who is at the other end, which is why certificates and signatures are needed.",
      { fig: mitmFig },
    ),
  ]);

  /* ==================== a9-dft ==================== */
  const dftBars = (() => {
    const N = 32,
      mag = (f) =>
        Array.from({ length: 17 }, (_, k) => {
          let re = 0,
            im = 0;
          for (let n = 0; n < N; n++) {
            const x = Math.sin((2 * Math.PI * f * n) / N),
              a = (-2 * Math.PI * k * n) / N;
            re += x * Math.cos(a);
            im += x * Math.sin(a);
          }
          return Math.hypot(re, im);
        });
    const panels = [
      { id: "A", t: "Spectrum A", m: mag(5.5) },
      { id: "B", t: "Spectrum B", m: mag(5) },
    ];
    let s = TX(200, 16, "32 samples over exactly 1 second, so bin k means k Hz", { s: 12 });
    panels.forEach((p, k) => {
      const y = 26 + k * 110;
      s += PK(
        p.id,
        RC(4, y, 392, 102, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) +
          TX(36, y + 20, p.t, { s: 13, a: "start" }) +
          p.m
            .map((v, i) => {
              const h = Math.max(1, (v / 16) * 56),
                x = 24 + i * 21;
              return `<rect x="${x}" y="${y + 90 - h - 10}" width="15" height="${h}" rx="2" fill="var(--blue)"/>`;
            })
            .join("") +
          [0, 5, 10, 15].map((i) => TX(24 + i * 21 + 7, y + 98, i, { s: 10 })).join(""),
      );
    });
    return SVG(400, 250, s, "Two magnitude spectra from a 32-sample window");
  })();

  B.add("a9-dft", [
    {
      type: "pick",
      q: "One of these spectra comes from a 5 Hz sine and the other from a 5.5 Hz sine, both recorded for exactly 1 second. Tap the spectrum of the 5.5 Hz tone.",
      fig: dftBars,
      a: "A",
      hint: "Does the window hold a whole number of cycles for each tone?",
      why: "5 Hz fits exactly 5 cycles into the window, so all the energy lands in bin 5. 5.5 Hz leaves half a cycle dangling, the window edges look like a jump, and energy smears (leaks) into neighbouring bins. Spectrum A is the smeared one.",
    },
    {
      type: "match",
      q: "Match each signal to the spectrum shape you would expect.",
      pairs: [
        ["A pure musical note", "One tall spike at the note's frequency"],
        ["A steady offset that never changes", "A spike at bin 0 only"],
        ["A single sharp click", "Similar energy in every bin"],
        ["Random hiss", "A jagged spread with no clear spike"],
      ],
      why: "A steady sine matches one frequency. A constant has no wiggle, so only bin 0 responds. A very short click contains every frequency equally, so its spectrum is flat. Random noise spreads energy irregularly across all bins.",
    },
    {
      type: "slider",
      q: "A hum recording contains a 50 Hz tone and a 52 Hz tone. To see them as two separate peaks you need bins at most 2 Hz apart. Sampling at 1,000 Hz, roughly how many seconds of signal must you record?",
      min: 0,
      max: 4,
      step: 0.25,
      ans: 0.5,
      tol: 0.25,
      unit: " s",
      hint: "Bin spacing is 1 divided by the recording time, whatever the sample rate is.",
      why: "Bin spacing = fs / N = 1 / T. For 2 Hz spacing you need T = 0.5 s (500 samples at 1,000 Hz). Sampling faster adds samples but doesn't sharpen frequency resolution. Only a longer recording does.",
    },
    {
      type: "multi",
      q: "A 60 Hz hum is being recorded at 100 Hz and shows up as a fake 40 Hz peak. Which actions would genuinely stop the false peak? Select all that apply.",
      o: [
        "Sample at more than 120 Hz",
        "Pass the signal through an analogue low-pass filter before sampling",
        "Record for ten times longer",
        "Apply a Hann window to the samples",
        "Delete the bins above 50 Hz after sampling",
      ],
      a: [0, 1],
      why: "Aliasing happens at the moment of sampling: samples of 60 Hz and 40 Hz are identical, so nothing afterwards can tell them apart. You either sample fast enough or remove the high frequencies before sampling. A longer record or window changes resolution and leakage, not aliasing.",
    },
    {
      type: "bug",
      q: "Every bin of the output of this DFT comes out equal to sum(x). Click the faulty line.",
      code: [
        "import cmath",
        "def dft(x):",
        "    N = len(x)",
        "    X = []",
        "    for k in range(N):",
        "        total = 0",
        "        for n in range(N):",
        "            total += x[n] * cmath.exp(-2j * cmath.pi * k * n)",
        "        X.append(total)",
        "    return X",
      ],
      a: 7,
      why: "The rotation for bin k at sample n is e^(-2πj·k·n/N). Without dividing by N, the angle is always a whole number of turns, so the factor is 1 and every bin just adds up the samples. The missing / N is the bug.",
    },
  ]);

  /* ==================== a9-fft ==================== */
  const splitFig = (() => {
    let s = RC(110, 6, 180, 32, { r: 10 }) + TX(200, 27, "x0 x1 x2 ... x15", { s: 13 });
    s += LN(160, 38, 100, 66) + LN(240, 38, 300, 66);
    s +=
      RC(10, 66, 190, 32, { r: 10 }) +
      TX(105, 87, "0 2 4 6 8 10 12 14", { s: 12 }) +
      RC(204, 66, 190, 32, { r: 10 }) +
      TX(299, 87, "1 3 5 7 9 11 13 15", { s: 12 });
    s += LN(70, 98, 50, 128) + LN(140, 98, 150, 128) + LN(260, 98, 250, 128) + LN(340, 98, 350, 128);
    const G = [
      ["g1", "0 4 8 12", 6],
      ["g2", "2 6 10 14", 104],
      ["g3", "1 5 9 13", 202],
      ["g4", "3 7 11 15", 300],
    ];
    G.forEach(([id, t, x]) => (s += PK(id, RC(x, 128, 94, 40, { r: 10 }) + TX(x + 47, 153, t, { s: 12 }))));
    return SVG(400, 180, s, "Two levels of even/odd splitting for 16 samples");
  })();

  const bflyFig = (() => {
    const nodeAt = (x, y, t, o = {}) =>
      RC(x - 26, y - 17, 52, 34, { r: 10, f: o.f, fo: o.fo, k: o.k }) + TX(x, y + 5, t, { s: 14, m: 1 });
    const ys = [34, 94, 154, 214];
    let s = "";
    // wires: E0->X0,X2; O0->X0,X2; E1->X1,X3; O1->X1,X3
    s += LN(90, ys[0], 290, ys[0]) + LN(90, ys[0], 290, ys[2]) + LN(90, ys[2], 290, ys[0]) + LN(90, ys[2], 290, ys[2]);
    s += LN(90, ys[1], 290, ys[1]) + LN(90, ys[1], 290, ys[3]) + LN(90, ys[3], 290, ys[1]) + LN(90, ys[3], 290, ys[3]);
    [
      ["E0", "4"],
      ["E1", "-2"],
      ["O0", "6"],
      ["O1", "-2"],
    ].forEach(
      ([n, v], i) =>
        (s +=
          nodeAt(90, ys[i], v, {
            f: i < 2 ? "var(--blue)" : "var(--amber)",
            fo: ".2",
            k: i < 2 ? "var(--blue)" : "var(--amber)",
          }) + TX(40, ys[i] + 5, n, { s: 12 })),
    );
    ["X0", "X1", "X2", "X3"].forEach(
      (n, i) => (s += nodeAt(290, ys[i], "?", { f: "var(--panel)" }) + TX(340, ys[i] + 5, n, { s: 13 })),
    );
    s += TX(190, 14, "X[k] = E[k] + W·O[k] and X[k+2] = E[k] − W·O[k]", { s: 12 });
    s += TX(190, 244, "k = 0: W = 1.   k = 1: W = −j.", { s: 12 });
    return SVG(400, 256, s, "Final butterfly stage of a 4-point FFT with E0 = 4, E1 = −2, O0 = 6, O1 = −2");
  })();

  B.add("a9-fft", [
    {
      type: "pick",
      q: "A 16-point FFT splits its samples into even-numbered and odd-numbered positions, then splits each of those lists the same way. Positions are counted from 0 within each list. After two splits, which group does sample x6 land in? Tap it.",
      fig: splitFig,
      a: "g2",
      hint: "x6 is at position 3 (odd) in the even list 0 2 4 6 8 10 12 14. Which child gets the odd positions?",
      why: "The first split sends x6 to the even list. In that list x6 sits at position 3, an odd position, so the second split sends it to the odd child: 2 6 10 14. The leaves of the full recursion therefore follow the bit-reversed order.",
    },
    {
      type: "slider",
      q: "The direct DFT takes 20 ms on 1,000 samples, and its work grows with the square of the sample count. About how long will it take on 4,000 samples?",
      min: 0,
      max: 800,
      step: 20,
      ans: 320,
      tol: 100,
      unit: " ms",
      hint: "4 times as many samples means 4 × 4 times as much work.",
      why: "Work grows like N², so 4× the samples costs 16× the time: 20 ms × 16 = 320 ms. An FFT on the same 4,000 samples would take only a little over 4× as long as for 1,000, which is the whole point of using it.",
    },
    {
      type: "order",
      q: "Put the stages of a recursive radix-2 FFT in order.",
      items: [
        "Split the samples into even-indexed and odd-indexed halves",
        "Keep splitting until every piece has just one sample",
        "Treat each single sample as its own DFT",
        "Combine pairs of results with butterflies",
        "Keep merging upwards until one full-length spectrum is left",
      ],
      why: "The FFT first breaks the problem down, using the fact that a single sample is its own DFT, and then builds the answer back up level by level. Each level costs about N operations and there are log2 N levels.",
    },
    {
      type: "bug",
      q: "The output of this FFT repeats its first half in its second half, so the spectrum is wrong. Click the faulty line.",
      code: [
        "import cmath",
        "def fft(x):",
        "    N = len(x)",
        "    if N == 1:",
        "        return x",
        "    even = fft(x[0::2])",
        "    odd = fft(x[1::2])",
        "    out = [0] * N",
        "    for k in range(N // 2):",
        "        t = cmath.exp(-2j * cmath.pi * k / N) * odd[k]",
        "        out[k] = even[k] + t",
        "        out[k + N // 2] = even[k] + t",
        "    return out",
      ],
      a: 11,
      why: "A butterfly produces two outputs: even[k] + t and even[k] − t. The second half must use the minus sign, because the rotation by half a turn flips the sign of the odd part's contribution. With a plus, both halves are identical.",
    },
    M(
      "The last stage of a 4-point FFT is shown, built from inputs x = 1, 2, 3, 4. What is X[2]?",
      ["−2", "2", "6", "10"],
      0,
      "X[2] = E[0] − W⁰·O[0] = 4 − 1×6 = −2. Check with the DFT formula: 1 − 2 + 3 − 4 = −2. X[0] would be 4 + 6 = 10 (the sum of the inputs).",
      { fig: bflyFig, hint: "Bin 2 pairs E0 with O0 using a minus sign and twiddle 1." },
    ),
  ]);

  /* ==================== a10-attn ==================== */
  const heatFig = (() => {
    const W = [
        [1, 0, 0, 0],
        [0.3, 0.7, 0, 0],
        [0.2, 0.5, 0.5, 0],
        [0.1, 0.4, 0.2, 0.3],
      ],
      tok = ["the", "dog", "chased", "it"];
    let s = TX(200, 16, "Attention weights, one row per token (decoder with a causal mask)", { s: 12 });
    tok.forEach((t, c) => (s += TX(120 + c * 60 + 28, 42, t, { s: 12 })));
    W.forEach((row, r) => {
      const y = 52 + r * 48;
      s +=
        TX(106, y + 29, tok[r], { a: "end", s: 12 }) +
        PK(
          "r" + (r + 1),
          RC(116, y, 248, 42, { r: 8, f: "var(--bg-2)", k: "var(--line)" }) +
            row
              .map(
                (v, c) =>
                  `<rect x="${120 + c * 60}" y="${y + 4}" width="56" height="34" rx="6" fill="var(--blue)" fill-opacity="${v ? 0.12 + v * 0.55 : 0}" stroke="var(--line-2)" stroke-width="1"/>` +
                  TX(120 + c * 60 + 28, y + 27, v, { s: 14 }),
              )
              .join(""),
        );
    });
    return SVG(400, 252, s, "A four by four attention weight matrix for the sentence the dog chased it");
  })();

  const satFig = `<table style="border-collapse:collapse;margin:0 auto;font:800 14px var(--sans);color:var(--text)"><tr>${["", "Raw scores", "Softmax weights"].map((h) => `<th style="padding:6px 12px;border:2px solid var(--line);background:var(--bg-2)">${h}</th>`).join("")}</tr>${[
    ["Row X", "0.5, 0.2, 0.1", "0.41, 0.31, 0.28"],
    ["Row Y", "20, 8, 4", "1.00, 0.00, 0.00"],
  ]
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td style="padding:6px 12px;border:2px solid var(--line);text-align:center">${c}</td>`).join("")}</tr>`,
    )
    .join("")}</table>`;

  B.add("a10-attn", [
    {
      type: "pick",
      q: "A student prints the attention weights of a decoder as shown. Every row must be a valid softmax output after causal masking. Exactly one row cannot be. Tap it.",
      fig: heatFig,
      a: "r3",
      hint: "Softmax weights are never negative and each row must add up to 1.",
      why: "Row 3 adds up to 0.2 + 0.5 + 0.5 = 1.2, but softmax weights always sum to exactly 1. The other rows sum to 1, and each one has zeros where the causal mask hides later tokens.",
    },
    M(
      "Row Y's raw scores are what you'd see with a large key size d_k and no scaling. What goes wrong?",
      [
        "Softmax collapses to one-hot, so other tokens get almost no learning signal",
        "The weights add up to more than 1, so each output vector gets too large",
        "The causal mask stops working, so tokens begin to see later tokens",
        "Softmax outputs turn negative, so some weights fall below zero",
      ],
      0,
      "Large gaps between scores make softmax saturate: one token takes essentially all the weight and the others get almost none, so the gradients flowing to them vanish. Dividing by √d_k keeps the scores in a range where softmax stays soft. The weights still sum to 1 and stay positive.",
      { fig: satFig, hint: "Compare how spread out each row's weights are." },
    ),
    {
      type: "cat",
      q: "A context grows from n to 2n tokens. Which quantities grow about 4 times (quadratic), and which about 2 times (linear)?",
      buckets: ["Quadratic (about 4×)", "Linear (about 2×)"],
      items: [
        ["Query–key scores computed in one head", 0],
        ["Token embeddings looked up", 1],
        ["Entries in the attention weight matrix", 0],
        ["Position vectors added", 1],
        ["Cells the causal mask must cover", 0],
        ["Value vectors that get mixed", 1],
      ],
      why: "Every token is scored against every token, giving an n × n grid: scores, weights and mask all grow with n². Anything stored once per token (embeddings, positions, values) grows only with n.",
    },
    {
      type: "order",
      q: "Put the steps of one masked self-attention layer in order.",
      items: [
        "Turn tokens into vectors and add position information",
        "Make a query, key and value vector for each token",
        "Score every query against every key",
        "Divide the scores by the square root of the key size",
        "Hide future tokens with the causal mask",
        "Softmax each row into weights that sum to 1",
        "Add up the value vectors using those weights",
      ],
      why: "Scores come before softmax, the mask must act before softmax so hidden tokens get exactly zero weight, and the values are only mixed after the weights exist.",
    },
    {
      type: "bug",
      q: "A model built with this attention function still peeks at later tokens. Click the faulty line.",
      code: [
        "import numpy as np",
        "def attention(Q, K, V):",
        "    d = K.shape[-1]",
        "    scores = Q @ K.T / np.sqrt(d)",
        "    future = np.triu(np.ones_like(scores), k=1)",
        "    scores = scores * (1 - future)",
        "    w = np.exp(scores)",
        "    w = w / w.sum(axis=-1, keepdims=True)",
        "    return w @ V",
      ],
      a: 5,
      why: "Multiplying by zero sets the future scores to 0, not to minus infinity. exp(0) = 1, so those tokens still get a real share of the softmax. The mask must put -inf there, for example np.where(future == 1, -np.inf, scores), so their weight is exactly 0.",
    },
  ]);
})();
