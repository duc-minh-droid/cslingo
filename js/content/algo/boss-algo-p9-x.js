/* boss-algo-p9-x: extra boss questions for Phases 9 and 10, ported from the vault. */
(function () {
  const N = NIC;
  /** Append questions to a boss and keep its path-node question count in step. */
  function extend(id, add) {
    const d = N.bossDef(id);
    if (!d) return;
    d.qs.push(...add);
    const m = N.modules.find((x) => x.id === id);
    if (m) m.qCount = d.qs.length;
  }
  extend("a9-boss", [
    {
      type: "multi",
      q: "A sound engineer analyses a short recording with the DFT. Select <b>all</b> the true statements about leakage.",
      o: [
        "It happens when a tone does not fit a whole number of cycles in the window",
        "A Hann window reduces it at the price of a wider main peak",
        "Sampling faster removes it",
        "It can hide a faint tone that sits near a loud one",
      ],
      a: [0, 1, 3],
      why: "Leakage comes from the window edges, so a taper helps. Sampling faster cures aliasing, not leakage.",
    },
    {
      type: "order",
      q: "A 50 Hz hum is removed from a recording using the spectrum. Put the steps in order.",
      items: [
        "Take the DFT of the samples",
        "Set the hum's bin and its mirror bin to zero",
        "Take the inverse DFT",
        "Play back the cleaned samples",
      ],
      why: "Transform, edit both bins of the mirror pair, transform back.",
    },
    {
      type: "mcq",
      q: "A signal has N = 128 samples and its hum sits at bin 20. Which pair of bins must be deleted so the cleaned signal stays real?",
      o: ["20 and 108", "20 and 64", "20 and 21", "20 and 128"],
      a: 0,
      hint: "The mirror of bin k is N − k.",
      why: "128 − 20 = 108. Deleting only bin 20 would leave a complex, half-removed hum.",
    },
    {
      type: "mcq",
      q: "A radar image is 100 × 100 pixels and its 2-D spectrum peaks at (u, v) = (6, 8). What does that say about the dominant wave?",
      o: [
        "Wavelength 10 pixels, running along the direction (6, 8)",
        "Wavelength 14 pixels, running along the direction (6, 8)",
        "Wavelength 100 pixels, running along the horizontal axis",
        "Wavelength 1 pixel, running along the vertical axis",
      ],
      a: 0,
      hint: "The distance from the centre is √(36 + 64).",
      why: "Distance 10, so wavelength is 100/10 = 10 pixels. The pair (6, 8) also fixes the direction.",
    },
    {
      type: "mcq",
      q: "An 8-point radix-2 FFT has 3 levels, each with N/2 butterflies. For N = 32, how many butterflies are there altogether?",
      o: ["80", "32", "160", "512"],
      a: 0,
      hint: "N/2 = 16 per level, and log₂ 32 = 5 levels.",
      why: "16 butterflies × 5 levels = 80, far fewer than the 1,024 products of the direct DFT.",
    },
    {
      type: "slider",
      q: "A square wave is built from sine waves. About what percentage of the first sine's amplitude does the sine at 7 times the base frequency have?",
      min: 0,
      max: 50,
      step: 1,
      ans: 14,
      tol: 3,
      unit: "%",
      hint: "Amplitudes go 1, 1/3, 1/5, 1/7, …",
      why: "1/7 ≈ 14%.",
    },
    {
      type: "cat",
      q: "Sort each remedy by the problem it addresses.",
      buckets: ["Aliasing", "Leakage"],
      items: [
        ["Low-pass filter before sampling", 0],
        ["Multiply the samples by a Hamming window", 1],
        ["Raise the sample rate above twice the top frequency", 0],
        ["Taper the ends of the window towards zero", 1],
      ],
      why: "Aliasing is lost at sampling time, so it is prevented there. Leakage comes from the abrupt window edges, so a taper helps.",
    },
    {
      type: "match",
      q: "Match each step of the lecture's recursive FFT to what it does.",
      pairs: [
        ["Return x when N = 1", "ends the recursion: one sample is its own DFT"],
        ["Split into even and odd samples", "creates two half-size problems"],
        ["y[k] = ye[k] + w·yo[k]", "builds the first half of the output"],
        ["w ← w · W_N", "turns the twiddle by one more step"],
      ],
      why: "These four lines are the whole algorithm.",
    },
  ]);
  extend("a10-boss", [
    {
      type: "mcq",
      q: "A model has d<sub>model</sub> = 256 and uses 8 attention heads. How long is each head's query vector, and what shape do the concatenated head outputs have for T tokens?",
      o: ["32 numbers; T × 256", "8 numbers; T × 32", "256 numbers; T × 8", "32 numbers; T × 32"],
      a: 0,
      hint: "d_h = d_model / h, and the heads are glued side by side.",
      why: "256 / 8 = 32 per head, and 8 × 32 = 256 columns after concatenation.",
    },
    {
      type: "mcq",
      q: 'A decoder is generating the 6-word sentence "the small cat chased red mice". How many cells of its 6 × 6 score matrix does the causal mask block?',
      o: ["15", "6", "21", "30"],
      a: 0,
      hint: "Count the cells above the diagonal: 5 + 4 + 3 + 2 + 1.",
      why: "Each word may see itself and earlier words only. 5 + 4 + 3 + 2 + 1 = 15 cells are blocked.",
    },
    {
      type: "mcq",
      q: "In a residual connection around an attention sublayer, the layer outputs x + Sublayer(x). If a faulty sublayer outputs only zeros, what does the layer pass on?",
      o: ["x, unchanged", "A vector of zeros", "−x", "x with every number doubled"],
      a: 0,
      why: "x + 0 = x. The skip path is what keeps information flowing in deep stacks.",
    },
    {
      type: "mcq",
      q: "A 128 × 128 image is cut into 16 × 16 patches for a Vision Transformer. How many tokens does the transformer see?",
      o: ["64", "8", "128", "256"],
      a: 0,
      hint: "128 / 16 patches along each side.",
      why: "8 × 8 = 64 patches, so 64 tokens (and a 64 × 64 attention matrix).",
    },
    {
      type: "order",
      q: "A decoder translates a sentence. Put one round of generation in order.",
      items: [
        "Feed the output so far, starting from the start token",
        "Masked self-attention over those words",
        "Cross-attention to the encoder's output",
        "Linear layer and softmax over the vocabulary",
      ],
      why: "Attend to what has been written, look at the input, then turn the last vector into word probabilities.",
    },
    {
      type: "cat",
      q: "Sort each part of a transformer by where its keys, queries or inputs come from.",
      buckets: ["Works within one sequence", "Connects two sequences"],
      items: [
        ["Encoder self-attention", 0],
        ["Masked self-attention in the decoder", 0],
        ["Cross-attention", 1],
        ["Feed-forward network (per token)", 0],
      ],
      why: "Only cross-attention reads from a second sequence (the encoder's output).",
    },
    {
      type: "mcq",
      q: "Scores [3, 3, 0] go through softmax. Roughly what weight does the last token get? (e³ ≈ 20, e⁰ = 1)",
      o: ["about 0.02", "about 0.33", "about 0.2", "0"],
      a: 0,
      hint: "The two big scores give about 20 each, the small one gives 1, so 1 out of about 41.",
      why: "1 / (20 + 20 + 1) ≈ 0.024. It is small but not zero: softmax never gives exactly 0 without a mask.",
    },
    {
      type: "multi",
      q: "Select all statements that are true of how a transformer represents a sentence.",
      o: [
        "Each token's input is its word embedding plus a positional encoding",
        "Attention alone is blind to word order",
        "Layer norm gives each token's vector mean 0 and variance 1 before scaling",
        "More heads at fixed d_model means many more attention parameters",
      ],
      a: [0, 1, 2],
      why: "Heads split d_model between them, so the parameter count stays the same.",
    },
  ]);
})();
