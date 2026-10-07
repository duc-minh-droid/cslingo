/* js/bank/algo-88.js: revision questions for a9-series, a9-dft, a9-fft, a10-tokens, a10-block (Phases 9 and 10), ported from the vault. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M } = partScope;
  const B = NIC.bank;

  B.add("a9-series", [
    M(
      "Fourier's 1807 claim was that a periodic function can be written as…",
      [
        "a weighted sum of sine waves of different frequencies",
        "a single sine wave with a changing frequency",
        "a list of its largest peaks and nothing else",
        "a product of two simpler periodic functions",
      ],
      0,
      "Weights (amplitudes and phases) on sines of many frequencies: the Fourier series.",
    ),
    M(
      "A pure sine wave of 5 Hz repeats once every…",
      ["5 seconds", "0.2 seconds", "0.5 seconds", "50 seconds"],
      1,
      "Period = 1 / frequency = 1/5 = 0.2 s.",
      { hint: "Divide 1 by the frequency." },
    ),
    M(
      "To build a perfect square wave you need, strictly speaking…",
      [
        "three sine waves: 1, 3 and 5 times the base frequency",
        "ten sine waves, as the rest are negligible",
        "infinitely many odd-multiple sine waves",
        "one sine wave and its mirror image",
      ],
      2,
      "Each extra odd harmonic sharpens the corners but a finite sum never gives perfectly vertical edges.",
    ),
    M(
      "In a square wave the sine at 7 times the base frequency has an amplitude of…",
      ["1/7 of the first", "7 times the first", "1/49 of the first", "the same as the first"],
      0,
      "Amplitudes go 1, 1/3, 1/5, 1/7, …",
    ),
    {
      type: "cat",
      q: "Sort each description by the domain it belongs to.",
      buckets: ["Time domain", "Frequency domain"],
      items: [
        ["The air pressure at 0.2 s", 0],
        ["A bar chart of how strong each pitch is", 1],
        ["A plot of a waveform against time", 0],
        ["A list of frequencies with amplitudes", 1],
      ],
      why: "The time domain shows how the value moves; the frequency domain shows which frequencies are inside.",
    },
    M(
      "A square wave is built from 30 sine waves. Near each sharp edge the sum…",
      [
        "has an overshoot of about 9% of the jump that stays",
        "matches the target perfectly at every point",
        "undershoots by a larger amount each time",
        "becomes flat with no ripple left near the edge",
      ],
      0,
      "This is the Gibbs effect: more waves make the overshoot narrower but not smaller.",
    ),
    M(
      "Two sines have the same frequency and amplitude but one is delayed. They differ in…",
      ["frequency", "phase", "amplitude", "period"],
      1,
      "A delay shifts the wave in time, which is a phase change.",
    ),
    M(
      "Why does the transform of a real signal produce complex numbers?",
      [
        "Each frequency needs an amplitude and a phase, held by length and angle",
        "Real signals hide an imaginary part that the DFT reveals",
        "Complex numbers are quicker for the computer to add up",
        "The samples are rounded in a way that needs complex numbers",
      ],
      0,
      "Magnitude gives how much, angle gives the time shift.",
    ),
    {
      type: "order",
      q: "A square wave is being built up. Put the sine waves in the order they are added (lowest frequency first).",
      items: ["1× the base frequency", "3× the base frequency", "5× the base frequency", "7× the base frequency"],
      why: "The odd multiples are added in increasing order, each weaker than the one before.",
    },
    {
      type: "slider",
      q: "In a square wave, the sine at 5 times the base frequency has what percentage of the first sine's amplitude?",
      min: 0,
      max: 100,
      step: 5,
      ans: 20,
      tol: 5,
      unit: "%",
      hint: "Amplitudes are 1, 1/3, 1/5, …",
      why: "1/5 = 20%.",
    },
    M(
      'A sine wave is said to have "no harmonics". This means…',
      [
        "it contains only a single frequency",
        "its amplitude never changes sign",
        "it cannot be sampled",
        "it has a frequency of exactly zero",
      ],
      0,
      "A harmonic is an extra component at a multiple of the frequency; a sine has none.",
    ),
    M(
      "Which signal needs the fewest sine waves for a good approximation?",
      [
        "A triangle wave, which has no sudden jump",
        "A square wave, because it only takes two values",
        "A saw tooth, because it is a straight line",
        "They all need the same number",
      ],
      0,
      "Smooth signals have rapidly shrinking amplitudes (1/n²); jumps need slowly shrinking ones (1/n).",
    ),
  ]);

  B.add("a9-dft", [
    M("X[k] = 6 + 8j. Its magnitude is…", ["10", "14", "48", "2"], 0, "√(36 + 64) = 10.", { hint: "6-8-10 triangle." }),
    M(
      "fs = 800 Hz and N = 200. Which frequency is bin k = 25?",
      ["100 Hz", "25 Hz", "32 Hz", "200 Hz"],
      0,
      "Spacing 4 Hz, so 25 × 4 = 100 Hz.",
      { hint: "Spacing is fs / N = 4 Hz." },
    ),
    M("For a real signal with N = 100, bin 70 mirrors bin…", ["30", "70", "50", "10"], 0, "N − k = 30."),
  ]);

  B.add("a9-fft", [
    M("W_N^(N/2) equals…", ["−1", "1", "j", "0"], 0, "Half a turn of the unit circle."),
    M(
      "One split gives the multiplication count N²/2 + N. For N = 8 that is…",
      ["40", "64", "36", "16"],
      0,
      "32 + 8 = 40.",
    ),
    M(
      "In 1969 a 2048-point seismic analysis took 13½ hours with the DFT and 2.4 seconds with the FFT. That is a speed-up of about…",
      ["20,000×", "200×", "2,000,000×", "20×"],
      0,
      "48,600 s divided by 2.4 s ≈ 20,000.",
      { hint: "13.5 hours = 48,600 seconds." },
    ),
    M(
      "Who published the FFT algorithm in 1965?",
      ["Cooley and Tukey", "Fourier and Laplace", "Shannon and Nyquist", "Dijkstra and Prim"],
      0,
      "The principle is older (Gauss) but Cooley and Tukey made it famous.",
    ),
  ]);

  B.add("a10-tokens", [
    M(
      "The first step in a language model's pipeline is to…",
      [
        "split the text into tokens",
        "apply attention to the raw letters",
        "choose the next word",
        "add the positional encoding",
      ],
      0,
      "Text becomes tokens, then vectors.",
    ),
    M(
      "An embedding table has 2,000 tokens and 32 numbers per token. How many numbers does it hold?",
      ["64,000", "2,032", "6,400", "640,000"],
      0,
      "2,000 × 32 = 64,000.",
    ),
    M(
      "InputEmbedding equals…",
      [
        "WordEmbedding + PositionalEncoding",
        "WordEmbedding × PositionalEncoding",
        "PositionalEncoding alone",
        "WordEmbedding with the position appended as text",
      ],
      0,
      "The two vectors are added elementwise.",
    ),
    M(
      'Without positional encoding, the sentences "dog bites man" and "man bites dog" give attention…',
      [
        "the same set of input vectors, so it cannot tell the order",
        "different vectors, because the words differ in order",
        "no vectors at all, since the order is missing",
        "a different number of tokens in each sentence",
      ],
      0,
      "Attention itself ignores order.",
    ),
    M(
      "A tokenizer maps each token to…",
      [
        "an integer id in a fixed vocabulary",
        "a probability",
        "a position in the sentence",
        "a random vector chosen at run time",
      ],
      0,
      "The id then indexes the embedding table.",
    ),
    M(
      'The word "bank" appears at positions 1 and 5. With positional encoding their model inputs are…',
      ["different", "identical", "both zero", "swapped"],
      0,
      "Same word embedding, different position vector.",
    ),
    {
      type: "cat",
      q: "Which part of the input vector carries which information?",
      buckets: ["Meaning of the word", "Location in the sentence"],
      items: [
        ["Word embedding", 0],
        ["Positional encoding", 1],
        ["Embedding row looked up by token id", 0],
        ["Sine and cosine pattern for the slot", 1],
      ],
      why: "Embedding = what the word is; positional encoding = where it sits.",
    },
    {
      type: "order",
      q: "Put the stages of the transformer input in order.",
      items: ["Text", "Tokens", "Embedding vectors", "Embedding plus positional encoding"],
      why: "Tokenise, look up, then add position.",
    },
    M(
      "In the original transformer, the encoder and the decoder each repeat a layer…",
      ["N times, stacked", "once only", "once per letter", "twice, in parallel"],
      0,
      "The stack of N identical layers (N = 6 in the paper).",
    ),
    M(
      "Which sentence has the most tokens if each word is one token?",
      ["I am going to the bank", "Hello world, how are you", "Please stop that now", "Yes please come in now"],
      0,
      "Six words, six tokens.",
    ),
    {
      type: "match",
      q: "Match each component to its job.",
      pairs: [
        ["Tokenizer", "cuts text into pieces and gives each an id"],
        ["Embedding", "turns an id into a learned vector"],
        ["Positional encoding", "tells the model where each token sits"],
        ["Encoder", "reads the whole input sentence"],
      ],
      why: "The first three prepare the input; the encoder processes it.",
    },
  ]);

  B.add("a10-block", [
    M(
      "An encoder layer has two sublayers. They are…",
      [
        "multi-head self-attention and a feed-forward network",
        "attention and a softmax output layer",
        "embedding and then positional encoding",
        "masked attention and then cross-attention",
      ],
      0,
      "Each wrapped in Add & Norm.",
    ),
    M(
      "A residual connection outputs…",
      ["x + Sublayer(x)", "Sublayer(x) alone", "x × Sublayer(x)", "x − Sublayer(x)"],
      0,
      "The input skips around the sublayer and is added back.",
    ),
    M(
      "A sublayer outputs all zeros. With a residual connection the layer returns…",
      ["x unchanged", "zeros", "−x", "2x"],
      0,
      "x + 0 = x.",
    ),
    M(
      "After layer norm, a token's numbers have…",
      [
        "mean 0 and variance 1 (before scale and shift)",
        "all values squeezed between 0 and 1",
        "exactly the same values as before",
        "values that add up to a sum of 1",
      ],
      0,
      "Subtract the mean and divide by the standard deviation.",
    ),
    M(
      "The feed-forward network is applied…",
      [
        "to each token separately with the same weights",
        "to the whole sentence at once as one vector",
        "only to the first token of the sentence",
        "only to the padding tokens at the end",
      ],
      0,
      "It is position-wise.",
    ),
    M(
      "Which sublayer lets tokens exchange information?",
      ["Multi-head self-attention", "The feed-forward network of a layer", "Layer norm", "The residual connection"],
      0,
      "The others work on each token alone.",
    ),
    M(
      "An encoder layer takes T × 512 in. It returns…",
      ["T × 512", "T × T", "512 × 512", "T × 2,048"],
      0,
      "Same shape in and out, so layers stack.",
    ),
    M(
      "The paper's feed-forward network widens 512 numbers to…",
      ["2,048", "1,024", "512", "64"],
      0,
      "Four times wider, then back down.",
    ),
    {
      type: "order",
      q: "Put the operations of one encoder layer in order.",
      items: [
        "Multi-head self-attention",
        "Add the input back and layer-normalise",
        "Feed-forward network",
        "Add the input back and layer-normalise again",
      ],
      why: "Attention, Add & Norm, FFN, Add & Norm.",
    },
    M(
      "x = [1, 3, 5, 7] has mean 4. After subtracting the mean, the numbers are…",
      ["−3, −1, 1, 3", "1, 3, 5, 7", "0, 0, 0, 0", "−4, −4, −4, −4"],
      0,
      "Each value minus 4.",
    ),
    {
      type: "multi",
      q: "Select the benefits of residual connections.",
      o: [
        "The input passes through if the sublayer has nothing to add",
        "Gradients flow easily through deep stacks",
        "They remove the need for attention",
        "They keep the shape unchanged",
      ],
      a: [0, 1, 3],
      why: "They are a skip path, not a replacement for any sublayer.",
    },
  ]);
})();
