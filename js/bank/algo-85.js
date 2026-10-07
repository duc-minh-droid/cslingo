/* js/bank/algo-90.js: revision questions for a9-cft, a9-leak, a9-filter (Phases 9 and 10), ported from the vault. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M } = partScope;
  const B = NIC.bank;

  B.add("a9-cft", [
    M(
      "The inverse continuous Fourier transform includes the factor…",
      ["1/(2π) in front of the integral", "1/N in front of the sum", "2π inside the exponent only", "no factor at all"],
      0,
      "f(t) = (1/2π) ∫ F(ω) e^{jωt} dω.",
    ),
    M(
      "A DFT of 8 samples produces…",
      [
        "8 outputs, one per frequency bin",
        "4 outputs, since half are redundant by definition",
        "16 outputs, real and imaginary separately",
        "1 output, the total energy",
      ],
      0,
      "N inputs give N outputs F[0] … F[N−1].",
    ),
    M(
      "Samples are taken every T = 0.5 ms and N = 1000 samples are used. The spacing between DFT bins is…",
      ["0.5 Hz", "2 Hz", "1000 Hz", "20 Hz"],
      1,
      "fs = 1/T = 2000 Hz, and fs/N = 2 Hz.",
      { hint: "T = 0.5 ms gives fs = 2000 Hz." },
    ),
    M(
      "For N = 4, W = e^{−j2π/4} equals…",
      ["j", "−j", "−1", "1"],
      1,
      "A quarter turn clockwise: cos(π/2) − j sin(π/2) = −j.",
    ),
    M(
      "The DFT of the constant signal [1, 1, 1, 1] is…",
      ["[4, 0, 0, 0]", "[1, 1, 1, 1]", "[0, 0, 4, 0]", "[1, 0, 0, 0]"],
      0,
      "Bin 0 adds the samples; the other bins cancel.",
    ),
    M(
      "Applying the inverse DFT (N = 4) to [0, 0, 4, 0] gives…",
      ["[1, 0, 0, 0]", "[0, 0, 4, 0]", "[1, −1, 1, −1]", "[4, 4, 4, 4]"],
      2,
      "f[n] = (1/4)·4·e^{jπn} = (−1)^n.",
    ),
    M(
      "The direct DFT of N = 100 samples needs about how many complex multiplications?",
      ["200", "10,000", "700", "100"],
      1,
      "N × N = 10,000.",
    ),
    M(
      "Row 0 of the DFT matrix is all ones. So F[0] is…",
      [
        "the sum of all the samples",
        "the first sample alone",
        "the difference of the first and last samples",
        "always zero",
      ],
      0,
      "Every sample is multiplied by 1 and added: the DC component.",
    ),
    {
      type: "order",
      q: "Put the steps of computing one DFT bin F[k] in order.",
      items: [
        "Multiply each sample by its spinning arrow",
        "Add up all N products",
        "Read the sum as how much of frequency k is present",
      ],
      why: "Spin, add, interpret.",
    },
    {
      type: "match",
      q: "Match each symbol to its meaning in the DFT.",
      pairs: [
        ["f[n]", "the sample taken at time nT"],
        ["F[k]", "how much of frequency bin k is present"],
        ["W", "the turn e^(−j2π/N), the basic spinning step"],
        ["N", "the number of samples (and of bins)"],
      ],
      why: "These four symbols appear in every DFT formula.",
    },
    M(
      "How does the inverse DFT differ from the forward DFT?",
      [
        "The exponent's sign flips and the sum is divided by N",
        "It uses only cosines instead of complex exponentials",
        "It keeps only the real parts of the forward outputs",
        "It sums over fewer terms than the forward DFT does",
      ],
      0,
      "Conjugate arrows and a 1/N.",
    ),
    M(
      "Why does a computer replace the Fourier integral by a sum?",
      [
        "It only has a finite list of samples, not a continuous signal",
        "Sums are always more accurate than integrals, whatever the signal",
        "Integrals cannot handle sine waves, only polynomials",
        "The integral would give complex answers, which are not allowed",
      ],
      0,
      "A digital signal exists only at sample instants.",
    ),
  ]);

  B.add("a9-leak", [
    M(
      "A tone is exactly 12 whole cycles in the window. In the DFT it appears…",
      ["in a single bin", "smeared across all bins", "only if a window is applied", "in the Nyquist bin"],
      0,
      "Whole cycles tile seamlessly, so only one bin is excited.",
    ),
    M(
      "Which problem is cured by a Hann window?",
      ["Leakage", "Aliasing", "Both", "Neither"],
      0,
      "Windows taper the ends and reduce leakage. Aliasing happens at sampling time.",
    ),
    M(
      "A window function is applied…",
      [
        "to the samples, before the DFT",
        "to the spectrum, after the DFT",
        "to the sampling clock",
        "to the inverse DFT only",
      ],
      0,
      "Multiply each sample by the window value for its position.",
    ),
    M(
      "Compared with no window, a Hamming window gives…",
      [
        "lower side lobes but a wider main peak",
        "higher side lobes but a narrower main peak",
        "a narrower peak and lower side lobes",
        "exactly the same spectrum",
      ],
      0,
      "Tapering costs resolution.",
    ),
    M(
      "A 70 Hz tone is sampled at 100 Hz. Where does it appear?",
      ["30 Hz", "70 Hz", "170 Hz", "35 Hz"],
      0,
      "It folds: 100 − 70 = 30 Hz.",
    ),
    {
      type: "cat",
      q: "Which cure goes with which problem?",
      buckets: ["Cures aliasing", "Cures leakage"],
      items: [
        ["Low-pass filter before sampling", 0],
        ["Hann window", 1],
        ["Sample at a higher rate", 0],
        ["Hamming window", 1],
      ],
      why: "Aliasing is prevented before or during sampling; leakage is tamed by tapering the finished samples.",
    },
    M(
      "A faint tone near a loud one cannot be seen in the spectrum. A likely reason is…",
      [
        "the loud tone's leakage skirts are higher than the faint tone",
        "the faint tone has been aliased away to another frequency",
        "the DFT cannot display two tones in one spectrum at once",
        "the window was too short to hold a whole sine wave at all",
      ],
      0,
      "A window lowers the skirts so the faint bump emerges.",
    ),
    {
      type: "multi",
      q: "Select all true statements about windows.",
      o: [
        "They taper the samples towards zero at the edges",
        "They widen the main peak of a tone",
        "They remove leakage completely",
        "They reduce the long skirts of a tone",
      ],
      a: [0, 1, 3],
      why: "Windows reduce leakage rather than remove it, and the price is a wider main peak.",
    },
    M(
      "Doubling the recording length at the same sample rate makes the bin spacing…",
      ["half as large", "twice as large", "unchanged", "zero"],
      0,
      "fs/N with N doubled.",
    ),
    M(
      "The DFT behaves as if the N samples were…",
      [
        "one period of a signal that repeats forever",
        "a single non-repeating event",
        "a random selection of a longer signal",
        "a signal that is zero outside the window and never repeats",
      ],
      0,
      "Mismatched ends become a jump at the seam, which causes leakage.",
    ),
    {
      type: "slider",
      q: "The first side lobe of a Hann window is about how many decibels below the main peak?",
      min: -60,
      max: 0,
      step: 5,
      ans: -30,
      tol: 10,
      unit: "dB",
      why: "About −31 dB, against −13 dB with no window and −43 dB for Hamming.",
    },
    M(
      "Which statement about the Hann and Hamming windows is correct?",
      [
        "Both are zero or near zero at the edges of the window",
        "Both leave the edges of the window at full strength",
        "Both increase the sample rate of the recording",
        "Both only work when N is a power of two exactly",
      ],
      0,
      "That tapering removes most of the seam jump.",
    ),
  ]);

  B.add("a9-filter", [
    M(
      "N = 64 and a hum sits at bin k = 9. Which other bin must also be deleted to remove it from a real signal?",
      ["55", "9", "32", "18"],
      0,
      "The mirror of k is N − k = 55.",
    ),
    M(
      "A low-pass filter in the frequency domain…",
      [
        "keeps the bins below a cut-off and removes the rest",
        "keeps only the highest bins and removes the lowest",
        "deletes the single tallest bin, whichever it is",
        "adds a little noise to hide a hum from the listener",
      ],
      0,
      "Slow content stays; fast content (and most noise) goes.",
    ),
    M(
      "You want to remove slow drift from a sensor reading. Use a…",
      ["high-pass filter", "low-pass filter", "window function", "faster sample rate"],
      0,
      "Drift is a very slow component, so remove the low bins.",
    ),
    M(
      "In spectral compression, which coefficients are kept?",
      ["The largest ones", "The smallest ones", "Every second one", "Only those at bin 0"],
      0,
      "A few tall bins carry most of the signal.",
    ),
    M(
      "An HRV series shows strong activity at 0.25 Hz. Which band is that?",
      ["HF (0.15 to 0.4 Hz)", "LF (0.04 to 0.15 Hz)", "VLF (below 0.04 Hz)", "ULF (below 0.0033 Hz)"],
      0,
      "0.25 Hz lies between 0.15 and 0.4 Hz.",
    ),
    M(
      "The LF/HF ratio from the HRV spectrum is used as…",
      [
        "an index of sympathetic against parasympathetic balance",
        "a measure of the sample rate used for the recording",
        "the heart's blood pressure at rest and exercise",
        "the number of beats per minute, read off the peak",
      ],
      0,
      "It compares low-frequency to high-frequency power.",
    ),
    {
      type: "order",
      q: "Put the steps of removing a hum in order.",
      items: [
        "Take the DFT of the samples",
        "Set the hum's bins (and mirrors) to zero",
        "Take the inverse DFT",
        "Use the cleaned samples",
      ],
      why: "Transform, edit, transform back.",
    },
    {
      type: "match",
      q: "Match each use of the Fourier transform to what it exploits.",
      pairs: [
        ["Voice enhancement", "deleting a hum or hiss in the spectrum"],
        ["Radio tuning", "selecting one frequency band from many"],
        ["Compression", "keeping only the strongest coefficients"],
        ["ECG analysis", "seeing which rhythms are present"],
      ],
      why: "All of them first move to the frequency domain.",
    },
    M(
      "Only bin k = 15 of a real signal is deleted, leaving its mirror. The inverse DFT is…",
      [
        "complex: half the component remains and an imaginary part appears",
        "real, and the component is cleanly removed",
        "identical to the original, as only one bin changed",
        "all zeros, since half the spectrum is gone",
      ],
      0,
      "Real signals need conjugate pairs of bins.",
    ),
    M(
      "In a CT scan, computer-processed X-rays taken from many angles are combined to give…",
      [
        "tomographic images, or slices, of the body",
        "a single flat photograph of the whole body",
        "a sound recording of the heartbeat",
        "a single heart-rate number per minute",
      ],
      0,
      "The reconstruction relies on Fourier transforms.",
    ),
    {
      type: "cat",
      q: "What does each filter do to a noisy signal that has a slow wave and fast noise?",
      buckets: ["Keeps the slow wave", "Keeps the fast noise"],
      items: [
        ["Low-pass", 0],
        ["High-pass", 1],
        ["Delete the top bins", 0],
        ["Delete the bottom bins", 1],
      ],
      why: "Low bins are slow content; high bins are fast content.",
    },
    M(
      "Which is NOT a typical application of the Fourier transform?",
      [
        "Finding the shortest route between two cities",
        "Noise cancellation in a pair of headphones",
        "Analysing the frequencies of earthquake shaking",
        "X-ray crystallography of molecules such as DNA",
      ],
      0,
      "Shortest routes are a graph-search problem.",
    ),
  ]);
})();
