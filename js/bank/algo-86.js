/* js/bank/algo-91.js: revision questions for a9-fftcode, a9-2d, a10-softmax (Phases 9 and 10), ported from the vault. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M } = partScope;
  const B = NIC.bank;

  B.add("a9-fftcode", [
    M(
      "What does RecursiveFFT return when N = 1?",
      ["The input unchanged", "Zero", "An empty list", "The conjugate of the input"],
      0,
      "A one-sample DFT is the sample itself.",
    ),
    M(
      "How many calls to RecursiveFFT (including the first) does N = 16 produce?",
      ["31", "16", "64", "15"],
      0,
      "2N − 1 = 31.",
    ),
    M(
      "For N = 16, how many times does the combine loop in the top call run?",
      ["8", "16", "4", "15"],
      0,
      "k goes from 0 to N/2 − 1, so 8 passes, each writing two outputs.",
    ),
    M(
      "In the combine loop, what is the update after each pass?",
      ["w ← w · W_N", "w ← w + W_N", "w ← −w", "w ← 1"],
      0,
      "The twiddle advances by one more step of the unit circle.",
    ),
    M(
      "In Python, which slice gives the odd-indexed samples of x?",
      ["x[1::2]", "x[0::2]", "x[::-1]", "x[1:]"],
      0,
      "Start at 1, step 2.",
    ),
    M(
      "Your FFT should agree with the direct DFT to within about…",
      ["10⁻¹⁰ (rounding only)", "1 (the right order of magnitude)", "10% of each value", "no agreement is expected"],
      0,
      "It is the same sum regrouped, so only rounding differs.",
    ),
    M(
      "An impulse [1, 0, 0, 0, 0, 0, 0, 0] is passed to your FFT. The correct output is…",
      ["all eight bins equal to 1", "[8, 0, 0, 0, 0, 0, 0, 0]", "[1, 0, 0, 0, 0, 0, 0, 0]", "[0, 0, 0, 0, 8, 0, 0, 0]"],
      0,
      "An impulse contains every frequency equally.",
    ),
    M(
      "RecursiveFFT is called with N = 6. The problem is that…",
      [
        "halving reaches an odd length, so the halves cannot be paired",
        "the twiddle factor W_N does not exist for N = 6 at all",
        "the recursion never ends, as 6 cannot be halved",
        "the output would be complex instead of real",
      ],
      0,
      "Radix-2 needs a power of two; pad with zeros to 8.",
    ),
    {
      type: "bug",
      q: "This combine loop is meant to be a radix-2 butterfly. Which line is wrong?",
      code: [
        "for k in range(n // 2):",
        "    t = w * yo[k]",
        "    y[k] = ye[k] + t",
        "    y[k + n // 2] = ye[k] + t",
        "    w = w * WN",
      ],
      a: 3,
      why: "The second output must be ye[k] − t. Using + gives the same value for both halves.",
    },
    {
      type: "order",
      q: "Put the lines of RecursiveFFT in the order they run for N > 1.",
      items: [
        "Split into even and odd samples",
        "Call RecursiveFFT on the even samples",
        "Call RecursiveFFT on the odd samples",
        "Combine with the twiddle in a loop",
      ],
      why: "Split, recurse twice, then combine.",
    },
    M(
      "A timing plot doubles N each step. The N² program is recognised because…",
      [
        "its time grows about 4× per doubling",
        "its time grows about 2× per doubling",
        "it is always faster at small N",
        "it uses more memory",
      ],
      0,
      "N² quadruples when N doubles; N log N only slightly more than doubles.",
    ),
    M(
      "How many levels deep is the recursion tree for N = 1024 (counting the leaves)?",
      ["11", "10", "1,024", "2"],
      0,
      "log₂ 1024 = 10 splits give 11 levels.",
    ),
  ]);

  B.add("a9-2d", [
    M(
      "The 2-D FFT of an image is computed by…",
      [
        "a 1-D FFT of every row, then of every column of the result",
        "a 1-D FFT of only the first row",
        "a 1-D FFT of the whole image read as one long line",
        "the direct 2-D sum, since FFTs do not extend to 2-D",
      ],
      0,
      "Rows then columns, as in the workshop.",
    ),
    M(
      "A 512 × 512 image is transformed by rows then columns. How many 1-D FFTs are run?",
      ["1,024", "512", "262,144", "2"],
      0,
      "512 rows + 512 columns.",
    ),
    M(
      "In a centred 2-D spectrum, the zero-frequency point (DC) is…",
      ["in the middle", "in the top-left corner", "on the right edge", "wherever the brightest dot is"],
      0,
      "The spectrum is shifted so the centre is zero frequency.",
    ),
    M(
      "A single plane wave in a real image appears in the spectrum as…",
      [
        "two dots on opposite sides of the centre",
        "one bright dot sitting at the centre",
        "a bright ring around the centre",
        "a full row of bright dots along one axis",
      ],
      0,
      "(u, v) and its mirror (−u, −v).",
    ),
    M(
      "In a 200 × 200 image the spectrum has a peak at (u, v) = (12, 16). The wavelength is…",
      ["10 pixels", "20 pixels", "200 pixels", "28 pixels"],
      0,
      "√(12² + 16²) = 20 and 200/20 = 10.",
      { hint: "12-16-20 is a 3-4-5 triangle scaled by 4." },
    ),
    M(
      "Compared with the direct 2-D sum (N⁴), rows-and-columns with the FFT costs about…",
      ["2N² log₂N", "N³", "N²", "N log₂N"],
      0,
      "2N one-dimensional FFTs of N log₂N each.",
    ),
    M(
      "You transform columns first, then rows. The result is…",
      [
        "the same spectrum",
        "the spectrum flipped upside down",
        "wrong, since rows must go first",
        "only the real parts",
      ],
      0,
      "The 2-D DFT is separable.",
    ),
    M(
      "To remove a regular stripe pattern from a photo you would…",
      [
        "delete the matching spike pair in the spectrum and invert",
        "delete the centre block of the spectrum and invert",
        "transform only the first row of pixels and invert",
        "double the image size to dilute the pattern",
      ],
      0,
      "A stripe pattern is one plane wave, which is one mirrored pair.",
    ),
    M(
      "The workshop's Task 1 transforms the first row of the wave matrix. What does it show?",
      [
        "The wavelengths present along that single line",
        "The direction of every wave in the image",
        "The sea's average height only",
        "Nothing, since one row is too short",
      ],
      0,
      "A single row is a 1-D signal, so there is no direction information.",
    ),
    {
      type: "cat",
      q: "Sort each 2-D spectrum edit by what it does to the picture.",
      buckets: ["Blurs / smooths", "Sharpens / keeps edges"],
      items: [
        ["Keep only bins near the centre", 0],
        ["Keep only bins far from the centre", 1],
        ["Delete the outer ring", 0],
        ["Delete the central block", 1],
      ],
      why: "Near the centre = slow, smooth variation; far from the centre = fine detail.",
    },
    M(
      "Waves with a larger distance from the centre of the spectrum are…",
      [
        "rippling faster, with shorter wavelength",
        "rippling more slowly, with longer wavelength",
        "moving faster across the image as time passes",
        "brighter and more intense in the image",
      ],
      0,
      "Distance from the centre = frequency.",
    ),
    M(
      "After the row pass, the entries are complex. So the column pass is…",
      ["a complex-to-complex FFT", "a real-to-complex FFT", "skipped", "a direct DFT"],
      0,
      "Every entry produced by the row pass is a complex number.",
    ),
  ]);

  B.add("a10-softmax", [
    M(
      "Softmax of the scores [0, 0, 0, 0] is…",
      ["[0.25, 0.25, 0.25, 0.25]", "[1, 0, 0, 0]", "[0, 0, 0, 0]", "[4, 4, 4, 4]"],
      0,
      "Equal scores share equally.",
    ),
    M(
      "Which of these can be a softmax output?",
      ["[0.5, 0.3, 0.2]", "[0.5, 0.5, 0.5]", "[1.2, −0.1, −0.1]", "[0.7, 0.7, −0.4]"],
      0,
      "Positive and summing to 1.",
    ),
    M(
      "Scores [5, 3] and [2, 0] differ by the same gap of 2. Their softmax weights are…",
      ["identical", "different, as the first is larger", "different, as the second is smaller", "undefined"],
      0,
      "Only differences matter.",
    ),
    M(
      "A gap of 1 between two scores means the weights are in a ratio of about…",
      ["2.7 to 1", "1 to 1", "10 to 1", "1 to 1 plus 1"],
      0,
      "e ≈ 2.72.",
    ),
    M(
      "Why do implementations subtract the largest score before taking exponentials?",
      [
        "It avoids overflow without changing the result",
        "It makes the weights add up to exactly one",
        "It makes the weights sharper and more decisive",
        "It removes negative scores from the list",
      ],
      0,
      "The constant factor cancels in the division.",
    ),
    M(
      "Scores are doubled from [2, 1, 0] to [4, 2, 0]. The largest weight…",
      ["grows", "shrinks", "stays 0.67", "becomes 0.5"],
      0,
      "Bigger gaps give sharper weights (0.67 becomes 0.87).",
    ),
    M("Attention divides the scores by √d_k. With d_k = 36 the divisor is…", ["6", "36", "1,296", "18"], 0, "√36 = 6."),
    {
      type: "slider",
      q: "Scores [2, 1, 0]. Roughly what weight goes to the highest score?",
      min: 0,
      max: 100,
      step: 5,
      ans: 65,
      tol: 10,
      unit: "%",
      hint: "e² ≈ 7.4, e ≈ 2.7, 1, total ≈ 11.",
      why: "7.39 / 11.1 ≈ 0.67.",
    },
    {
      type: "multi",
      q: "Select all true statements about softmax.",
      o: [
        "The outputs are all positive",
        "The outputs add up to 1",
        "Adding a constant to every input changes the outputs",
        "Larger gaps between inputs give more decisive outputs",
      ],
      a: [0, 1, 3],
      why: "A constant shift cancels, so it does not change the outputs.",
    },
    M(
      "Without scaling by √d_k, large dot products make softmax…",
      [
        "nearly all-or-nothing, with tiny gradients",
        "completely uniform, giving equal weights",
        "negative for the smaller scores",
        "faster to compute, as exponentials grow",
      ],
      0,
      "Saturated softmax makes learning stall.",
    ),
    {
      type: "order",
      q: "Put the steps of softmax in order.",
      items: [
        "Subtract the maximum score (optional, for safety)",
        "Exponentiate each score",
        "Add up the exponentials",
        "Divide each exponential by the total",
      ],
      why: "Exponentiate, then normalise.",
    },
  ]);
})();
