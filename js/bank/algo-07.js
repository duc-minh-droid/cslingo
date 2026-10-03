(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a7-huffman", [
    M(
      "Huffman's algorithm repeatedly…",
      [
        "splits the largest group in two",
        "merges the two least probable nodes",
        "sorts symbols alphabetically",
        "picks two nodes at random",
      ],
      1,
      "Greedy from the bottom up.",
    ),
    M(
      "Among prefix-free codes that assign each symbol a whole-bit codeword, Huffman is…",
      [
        "random, depending on the tie-breaks",
        "optimal (minimum average length)",
        "the worst possible",
        "valid only sometimes",
      ],
      1,
      "Provably optimal for symbol-by-symbol coding.",
    ),
    M(
      "Prefix-free means…",
      [
        "every codeword starts with a 0 bit",
        "no codeword begins another codeword",
        "all codewords have equal length",
        "codewords are sorted by length",
      ],
      1,
      "So decoding needs no separators.",
    ),
    TF(
      "Huffman codes can use fractional numbers of bits per symbol.",
      false,
      "Every codeword is a whole number of bits.",
    ),
    M(
      "Two symbols, each probability 0.5. Huffman gives…",
      ["0 bits each", "1 bit each", "2 bits each", "a variable length"],
      1,
      "One bit, 0 or 1.",
    ),
    M(
      "Which symbol gets the shortest codeword?",
      ["The rarest", "The most frequent", "The first alphabetically", "A random one"],
      1,
      "Frequent symbols should be cheap.",
    ),
    M(
      "How do you decode a Huffman bit stream?",
      [
        "Look up fixed-size blocks of bits in a table",
        "Walk the tree bit by bit to a leaf, then restart",
        "Reverse the bits and read them backwards",
        "Use a secret key to unlock it",
      ],
      1,
      "Tree walk.",
    ),
    M(
      "Why can't Huffman beat entropy exactly when ideal lengths are fractional?",
      [
        "It can: Huffman always matches entropy",
        "Real codewords must round to whole bits",
        "Huffman uses random codes",
        "Entropy is calculated wrongly",
      ],
      1,
      "Rounding costs a little.",
    ),
  ]);
  B.add("a7-lzw", [
    M(
      "LZW's dictionary starts with…",
      [
        "an empty dictionary that fills as it goes",
        "every single character of the alphabet",
        "a list of common English words",
        "the whole message",
      ],
      1,
      "Longer entries are added as it goes.",
    ),
    M(
      "At each step the encoder outputs the code for…",
      [
        "one character at a time, whatever the dictionary holds",
        "the longest string already in the dictionary",
        "a randomly chosen string",
        "the whole message at once",
      ],
      1,
      "Greedy longest match.",
    ),
    M(
      "After outputting the code for w, the encoder adds what to the dictionary?",
      ["w", "w + the next character", "the next character only", "nothing"],
      1,
      "A slightly longer phrase for next time.",
    ),
    TF("LZW is lossless.", true, "The decoder reproduces the input exactly."),
    M(
      "Which input compresses best with LZW?",
      ["Random characters", "ABABABABABAB", "Encrypted data", "One character"],
      1,
      "Repeats become dictionary hits.",
    ),
    M(
      "What happens when the dictionary fills up?",
      [
        "The file is lost and has to be sent again",
        "Implementations freeze or reset it",
        "The encoder crashes",
        "The input is deleted",
      ],
      1,
      "A practical detail.",
    ),
    M(
      "Which well-known format uses LZW?",
      ["GIF images", "JPEG photos", "MP3 audio", "PNG images"],
      0,
      "GIF (and some older UNIX compress tools).",
    ),
    M(
      "LZW on <code>ABABAB</code> with A = 0, B = 1 outputs how many codes?",
      ["2", "4", "6", "3"],
      1,
      "0, 1, 2 (AB), 2 (AB): four codes for six characters.",
    ),
  ]);

  /* ---------- Phase 8 ---------- */
  B.add("a8-hash", [
    M(
      "A hash collision is…",
      [
        "a program crash inside the hash function",
        "two different inputs with the same digest",
        "a slow hash function",
        "an empty input",
      ],
      1,
      "Good hashes make these practically impossible to find.",
    ),
    M(
      "Preimage resistance means…",
      [
        "hashing is fast to compute on any input",
        "given a digest, you can't find an input for it",
        "outputs are always short",
        "inputs are kept secret",
      ],
      1,
      "One-way.",
    ),
    M(
      "In proof of work, what is the nonce for?",
      [
        "Encrypting the block's contents before it's shared",
        "A number miners vary until the hash hits the target",
        "The block's timestamp",
        "The miner's name",
      ],
      1,
      "Trial and error.",
    ),
    TF("A SHA-256 digest's length depends on the input's length.", false, "Always 256 bits."),
    M(
      "Difficulty goes up by one leading hex zero. Expected work…",
      ["doubles", "×16", "×10", "stays the same"],
      1,
      "Each hex digit has 16 values.",
    ),
    M(
      "What links each block to the one before it?",
      [
        "A timestamp shared with the previous block",
        "It includes the previous block's hash",
        "A digital signature",
        "The block's size",
      ],
      1,
      "Change one block and every later link breaks.",
    ),
    M(
      'A "51% attack" means…',
      [
        "half the blocks are lost when the network splits",
        "someone with most mining power can rewrite history",
        "a bug in the hash function",
        "the encryption fails",
      ],
      1,
      "PoW assumes an honest majority.",
    ),
    M(
      "A hash chain on its own is…",
      ["tamper-proof", "tamper-evident", "encrypted", "private"],
      1,
      "Evidence, not prevention.",
    ),
  ]);
  B.add("a8-keys", [
    M(
      "Diffie–Hellman's security rests on…",
      [
        "the difficulty of factoring large numbers",
        "the difficulty of the discrete logarithm",
        "the difficulty of sorting",
        "the difficulty of hashing",
      ],
      1,
      "Easy to compute gᵃ mod p, hard to undo.",
    ),
    M(
      "RSA's security rests on…",
      [
        "the difficulty of discrete logarithms",
        "the difficulty of factoring n = p × q",
        "the difficulty of hashing",
        "the difficulty of XOR",
      ],
      1,
      "Knowing p and q gives away the private key.",
    ),
    M("An RSA public key consists of…", ["(p, q)", "(n, e)", "(d, φ)", "just d"], 1, "n and the encryption exponent."),
    TF(
      "Diffie–Hellman encrypts messages directly.",
      false,
      "It only agrees a shared key; encryption happens afterwards.",
    ),
    M(
      "Why are p = 23 and g = 5 fine in lessons but useless in practice?",
      [
        "They're even numbers, which are easy to factor",
        "Tiny numbers let anyone try every exponent",
        "They're both prime",
        "They're too large to compute with",
      ],
      1,
      "Real primes are 2048+ bits.",
    ),
    M("For p = 3, q = 5, what's φ(n)?", ["8", "15", "7", "10"], 0, "(3 − 1) × (5 − 1) = 8."),
    M("RSA's e must satisfy…", ["e is even", "gcd(e, φ) = 1", "e > n", "e = d"], 1, "Otherwise no inverse d exists."),
    M(
      "Real systems usually encrypt bulk data with…",
      [
        "RSA on its own, for every byte of the message",
        "a fast symmetric cipher keyed via RSA or DH",
        "no encryption at all",
        "hashes only",
      ],
      1,
      "Hybrid encryption: public-key crypto is slow.",
    ),
  ]);

  /* ---------- Phase 9 ---------- */
  B.add("a9-dft", [
    M(
      "The DFT converts a signal from…",
      [
        "the frequency domain to the time domain",
        "the time domain to the frequency domain",
        "bits to bytes",
        "analogue to digital",
      ],
      1,
      "Which frequencies are present, and how strongly.",
    ),
    M("N samples give how many DFT bins?", ["N/2", "N", "2N", "log N"], 1, "One output per input sample."),
    M(
      "The highest frequency you can represent without aliasing is…",
      ["fs", "fs / 2", "2 fs", "fs / 4"],
      1,
      "The Nyquist frequency.",
    ),
    TF(
      "Aliasing can be removed after the signal has been sampled.",
      false,
      "The information is already lost; filter before sampling.",
    ),
    M("Bin k corresponds to frequency…", ["k Hz", "k · fs / N", "k · N", "fs / k"], 1, "Spacing fs / N."),
    M("fs = 1,000 Hz, N = 1,000 samples. Bin spacing?", ["0.1 Hz", "1 Hz", "10 Hz", "1,000 Hz"], 1, "1,000 / 1,000."),
    M(
      "For a real-valued signal, the magnitude spectrum is…",
      ["random", "symmetric", "all zeros", "only positive at k = 0"],
      1,
      "That's why only bins up to N/2 are usually shown.",
    ),
    M(
      "A window function (e.g. Hann) is used to…",
      [
        "increase aliasing so it can be removed",
        "reduce leakage by tapering the edges",
        "add noise",
        "speed up the FFT",
      ],
      1,
      "Smoother edges, less smearing.",
    ),
  ]);
  B.add("a9-fft", [
    M(
      "The FFT's core idea is to…",
      [
        "approximate the DFT using fewer terms",
        "split into even/odd halves recursively, sharing work",
        "skip every other sample",
        "sort the samples first",
      ],
      1,
      "Divide and conquer.",
    ),
    M("FFT running time?", ["O(N²)", "O(N log N)", "O(N)", "O(2ᴺ)"], 1, "log N levels, N work each."),
    M(
      "N = 1,024. Roughly N log₂ N vs N²?",
      ["10,000 vs 1,000,000", "1,000 vs 10,000", "equal", "1,000,000 vs 10,000"],
      0,
      "1,024 × 10 ≈ 10⁴; 1,024² ≈ 10⁶.",
    ),
    TF("The FFT is an approximation of the DFT.", false, "Same result, computed faster."),
    M(
      'A "butterfly" combines two values a and b into…',
      ["a × b, then W·a", "a + W·b and a − W·b", "a and b swapped", "a − b only"],
      1,
      "One multiply shared by two outputs.",
    ),
    M(
      "What's a twiddle factor?",
      [
        "A bug in the FFT caused by rounding",
        "The complex rotation Wᵏ used in a butterfly",
        "The sample rate",
        "A window function",
      ],
      1,
      "Roots of unity.",
    ),
    M("Radix-2 FFT needs N to be…", ["odd", "a power of 2", "prime", "less than 100"], 1, "So the halving reaches 1."),
    M(
      "Which of these depends on the FFT?",
      [
        "Sorting names into alphabetical order",
        "Audio processing, Wi-Fi and image compression",
        "Hashing passwords for storage",
        "Binary search in a sorted list",
      ],
      1,
      "It's everywhere in signal processing.",
    ),
  ]);
})();
