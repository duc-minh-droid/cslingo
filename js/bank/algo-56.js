(function () {
  const B = NIC.bank;
  const svg = (w, h, body, label) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;height:auto;display:block;max-width:${Math.min(Math.round(w * 1.45), 560)}px;margin:0 auto">${body}</svg>`;
  const tx = (x, y, s, c = "var(--text)", sz = 12) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${sz}" font-weight="800" fill="${c}">${s}</text>`;
  const box = (x, y, w, h, label, fill = "var(--panel)", c = "var(--text)") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="var(--line-2)" stroke-width="2"/>${tx(x + w / 2, y + h / 2 + 4, label, c)}`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;

  // a8-keys: six possible exponents, nothing else shown
  function figExponents() {
    let s = "";
    for (let a = 1; a <= 6; a++) s += pk(String(a), box(8 + (a - 1) * 52, 22, 46, 38, `a = ${a}`));
    return svg(320, 72, s, "Six boxes, one for each private exponent a from 1 to 6");
  }

  // a9-dft: a spectrum and four one-second recordings
  function wave(x0, y0, w, h, freqs) {
    let d = "";
    for (let i = 0; i <= w; i += 2) {
      const y = freqs.reduce((s, f) => s + Math.sin((2 * Math.PI * f * i) / w), 0) / freqs.length;
      d += `${i ? "L" : "M"}${(x0 + i).toFixed(1)} ${(y0 + h / 2 - y * (h / 2 - 6)).toFixed(1)}`;
    }
    return `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="2"/>`;
  }
  function figRecordings() {
    let s = tx(160, 14, "Spectrum: two equal bars, at 3 Hz and 9 Hz", "var(--text-dim)");
    [3, 9].forEach((f) => {
      s += `<rect x="${40 + f * 20 - 6}" y="26" width="12" height="40" fill="var(--teal)"/>`;
    });
    s += `<line x1="30" y1="66" x2="290" y2="66" stroke="var(--line-2)" stroke-width="2"/>`;
    const P = [
      ["A", [3]],
      ["B", [9]],
      ["C", [3, 9]],
      ["D", [3, 6]],
    ];
    P.forEach(([id, f], i) => {
      const x = 8 + (i % 2) * 156,
        y = 80 + Math.floor(i / 2) * 76;
      s += pk(
        id,
        `<rect x="${x}" y="${y}" width="148" height="68" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${wave(x + 4, y, 140, 68, f)}${tx(x + 14, y + 14, id, "var(--text-dim)")}`,
      );
    });
    return svg(320, 236, s, "A spectrum with bars at 3 and 9 Hz, above four waveform panels A to D");
  }

  // a10-attn: a sentence of nine words
  function figSentence() {
    const W = ["The", "robot", "dropped", "the", "cup", "because", "it", "was", "clumsy"];
    let s = "";
    W.forEach((w, i) => {
      const row = i < 5 ? 0 : 1,
        x = 6 + (row ? i - 5 : i) * 62,
        y = 8 + row * 46;
      const hot = w === "it";
      const inner = box(
        x,
        y,
        58,
        36,
        w,
        hot ? "var(--amber)" : "var(--panel)",
        hot ? "var(--amber-on)" : "var(--text)",
      );
      s += hot ? inner : pk(w, inner);
    });
    return svg(
      320,
      100,
      s,
      "The sentence: The robot dropped the cup because it was clumsy, with the word it highlighted",
    );
  }

  B.add("a8-keys", [
    {
      type: "multi",
      q: "A toy RSA key uses n = 55 (5 × 11), e = 3 and d = 27. Select every true statement.",
      o: [
        "Encrypting the message m = 2 gives the ciphertext 8",
        "Decrypting needs the exponent 27, not 3",
        "Eve could rebuild d from the public key by factoring 55 and finding φ = 40",
        "The pair (55, 27) is the public key",
        "Switching to e = 4 would also work, as 4 is less than 55",
      ],
      a: [0, 1, 2],
      hint: "2³ = 8, which is smaller than 55. For the last one, e must share no factor with 40.",
      why: "2³ = 8, and 8 is below 55 so the remainder is 8. Decrypting uses the private exponent d = 27. With a tiny n, Eve factors 55 in her head, gets φ = 4 × 10 = 40, and solves 3d ≡ 1 (mod 40). The public key is (n, e) = (55, 3), and e = 4 shares the factor 4 with 40, so no d exists.",
    },
    {
      type: "slider",
      q: "Ten colleagues each want a private chat with every one of the other nine. They agree one separate Diffie–Hellman secret for each pair of people. About how many secrets are agreed in total?",
      min: 0,
      max: 100,
      step: 5,
      start: 20,
      ans: 45,
      tol: 5,
      unit: "secrets",
      hint: "Each person has 9 partners, so 10 × 9 = 90 chats, but each pair was counted twice.",
      why: "10 × 9 = 90 counts every pair twice (Ana with Ben, then Ben with Ana), so there are 45 pairs. The count grows with the square of the group, which is one reason public-key systems let each person publish a single key instead.",
    },
    {
      type: "order",
      q: "Put the steps of one Diffie–Hellman exchange in order.",
      items: [
        "Alice and Bob agree a public prime p and base g",
        "Each picks a private number that nobody else sees",
        "Each sends g raised to their private number, mod p",
        "Each raises the value they received to their own private number, mod p",
      ],
      hint: "Nothing can be sent until the private numbers exist, and the final step needs the other side's value.",
      why: "The public numbers come first, then the private ones. Only after swapping g^a and g^b can each side raise what it got to its own secret. Both then reach g^(ab) mod p, a value that was never sent over the wire.",
    },
    {
      type: "bug",
      q: "A toy RSA program with n = 55, e = 3 and d = 27 should print True for any message m from 1 to 54. It runs, but prints False for most messages. Click the faulty line.",
      code: ["n, e, d = 55, 3, 27", "c = pow(m, e, n)", "back = pow(c, e, n)", "print(back == m)"],
      a: 2,
      why: "Encrypting uses the public exponent e, but decrypting must use the private exponent d. Raising to e a second time gives m to the power 9, not m. It should read pow(c, d, n).",
    },
    {
      type: "cat",
      q: "Alice and Bob run plain Diffie–Hellman with huge numbers and no certificates or signatures. Sort each attack by whether the exchange alone stops it.",
      buckets: ["Stopped by the exchange alone", "Not stopped by the exchange alone"],
      items: [
        ["Eve silently records every value sent on the wire", 0],
        ["Mallory swaps both public values in transit and runs two exchanges", 1],
        ["Eve tries to work out the secret from p, g, A and B", 0],
        ["Mallory pretends to be Bob and runs her own exchange with Alice", 1],
      ],
      hint: "Ask whether the attacker only watches, or also takes part.",
      why: "Watching is useless to Eve, because getting the secret from A and B means solving a discrete logarithm. But the exchange never proves who is on the other end, so an active attacker who joins in, or stands in the middle, ends up sharing a secret with each side. Certificates and signatures fix that.",
    },
    {
      type: "pick",
      q: "Toy Diffie–Hellman with p = 7 and g = 3. Alice sent A = 3<sup>a</sup> mod 7 = 6, and Eve tries each exponent. Tap the private exponent a that Alice used.",
      fig: figExponents(),
      a: "3",
      hint: "Powers of 3 mod 7: 3, then 9 → 2, then 6.",
      why: "3¹ = 3, 3² = 9 → 2, and 3³ = 27 = 3 × 7 + 6 → 6, so a = 3. With p this small Eve just tries all six exponents. With a prime of 600 digits there is no list short enough to try, which is why the discrete log is the hard problem.",
    },
  ]);

  B.add("a9-dft", [
    {
      type: "pick",
      q: "A one-second recording has a spectrum with two equal bars, at 3 Hz and 9 Hz. Which recording shows it? Tap it.",
      fig: figRecordings(),
      a: "C",
      hint: "Count the wiggles in one second: slow is 3, fast is 9. The spectrum has both.",
      why: "C is a 3-cycle wave added to a 9-cycle wave, so its spectrum has one bar for each. A has only the slow wave and B only the fast one. D mixes 3 cycles with 6, so its second bar would stand at 6 Hz, not 9.",
    },
    {
      type: "cat",
      q: "A spectrum shows a false peak. Sort each remedy by which problem it fixes: aliasing (a tone above fs / 2 folds down) or leakage (energy smears across neighbouring bins).",
      buckets: ["Fixes aliasing", "Reduces leakage"],
      items: [
        ["Sample at more than twice the highest frequency", 0],
        ["Taper the window edges with a Hann window", 1],
        ["Filter out tones above fs / 2 before sampling", 0],
        ["Record a whole number of cycles in the window", 1],
      ],
      hint: "Aliasing is about the sampling rate. Leakage is about the window edges.",
      why: "Aliasing happens when sampling is too slow, so the fix is to sample faster or to remove the fast tones before sampling. Leakage happens when the window cuts a wave mid-cycle, so the fixes work on the window: fit whole cycles, or taper the edges. A window reduces leakage but never removes it, and it cannot undo aliasing.",
    },
    {
      type: "slider",
      q: "A recorder samples at 200 Hz and takes 100 samples. Two tones sound at 30 Hz and 50 Hz. About how many bins apart are their peaks?",
      min: 0,
      max: 30,
      step: 1,
      start: 5,
      ans: 10,
      tol: 2,
      unit: "bins",
      hint: "Bin spacing is 200 ÷ 100 = 2 Hz. The tones are 20 Hz apart.",
      why: "Bin spacing is fs / N = 200 / 100 = 2 Hz. The tones are 50 − 30 = 20 Hz apart, and 20 / 2 = 10 bins. Bin k stands at k × 2 Hz, so the peaks are at bins 15 and 25.",
    },
    {
      type: "order",
      q: "Put the steps of finding the loudest frequency in a recording in order.",
      items: [
        "Record N samples at a fixed sampling rate",
        "Taper the edges with a window to cut leakage",
        "Run the transform to get one value per bin",
        "Find the tallest bin k and convert it with k × fs / N",
      ],
      hint: "You can only read bins after the transform, and you convert to hertz last.",
      why: "The samples come first, and the window is applied to them before the transform because it reshapes the samples, not the bins. Only once you hold the magnitudes can you pick the tallest, and the bin number then becomes hertz by multiplying by the bin spacing fs / N.",
    },
    {
      type: "bug",
      q: "This should return the size (magnitude) of DFT bin k. It runs, but the answer is wrong for every signal that has a sine part. Click the faulty line.",
      code: [
        "def dft_bin(x, k):",
        "    n = len(x)",
        "    re = im = 0",
        "    for t in range(n):",
        "        angle = 2 * pi * k * t / n",
        "        re += x[t] * cos(angle)",
        "        im -= x[t] * sin(angle)",
        "    return sqrt(re ** 2 + im)",
      ],
      a: 7,
      why: "The size of a complex number is sqrt(re² + im²). The code squares re but not im, so the sine part is counted wrongly, and any signal with a sine part gets the wrong size. It should read sqrt(re ** 2 + im ** 2).",
    },
    {
      type: "multi",
      q: "A one-second recording at 64 samples per second is a 5 Hz sine plus a 12 Hz sine, both with whole cycles in the window. Select every true statement about bins 0 to 32 of its spectrum.",
      o: [
        "Bins 5 and 12 stand out",
        "Doubling the loudness of the 12 Hz wave doubles bin 12 only",
        "Bin 17, which is 5 + 12, also stands out",
        "Removing the 5 Hz wave leaves bin 12 exactly as it was",
        "The two waves must be equally loud for the DFT to separate them",
      ],
      a: [0, 1, 3],
      why: "The DFT is additive: each wave contributes its own bar, at its own bin, and the bars do not interact. Frequencies do not add, so bin 17 stays empty, and the waves can have any loudness because each bin only asks how much of its own frequency is present.",
    },
  ]);

  B.add("a9-fft", [
    {
      type: "mcq",
      q: "A 4-point FFT is run on the impulse [1, 0, 0, 0]. The even samples (1, 0) give half-size results E = [1, 1], and the odd samples (0, 0) give O = [0, 0]. The butterflies compute X[k] = E[k] + W·O[k] and X[k + 2] = E[k] − W·O[k]. What are X[0] to X[3]?",
      o: ["[1, 1, 1, 1]", "[4, 0, 0, 0]", "[1, 0, 0, 0] unchanged", "[1, 1, −1, −1]"],
      a: 0,
      hint: "O is all zeros, so W·O is zero whatever W is.",
      why: "With O all zero, every butterfly gives E[k] + 0 and E[k] − 0, so each output is just E[k]. That gives 1, 1, 1, 1: an impulse contains every frequency equally, as in the lesson's table.",
    },
    {
      type: "slider",
      q: "An FFT of 1,000 samples takes about 1 millisecond. Its work grows like N log₂ N. About how long would 1,000,000 samples take?",
      min: 0,
      max: 10,
      step: 0.5,
      start: 5,
      ans: 2,
      tol: 0.5,
      unit: "s",
      hint: "There are 1,000 times as many samples, and log₂ goes from about 10 to about 20, so double that.",
      why: "The samples grow 1,000 times and the number of levels doubles (about 10 to about 20), so the work grows about 2,000 times: 1 ms × 2,000 = 2 s. A direct DFT grows with N², so the same jump would make it about a million times slower.",
    },
    {
      type: "cat",
      q: "Sort each part of a radix-2 FFT by whether it happens while splitting the problem down or while combining the answers back up.",
      buckets: ["Going down (splitting)", "Coming back up (combining)"],
      items: [
        ["Pick out the even-position samples", 0],
        ["Multiply by a twiddle factor", 1],
        ["Reach size-1 problems, whose DFT is the sample itself", 0],
        ["Add and subtract a pair of values", 1],
      ],
      hint: "All the arithmetic happens on the way back up.",
      why: "Splitting only sorts samples into even and odd positions, so there is no arithmetic until the size-1 leaves. Every multiplication and addition belongs to the butterflies that combine two smaller answers into a bigger one.",
    },
    {
      type: "match",
      q: "Match each piece of the radix-2 FFT to its job.",
      pairs: [
        ["Even/odd split", "Turns one big DFT into two half-size ones"],
        ["Twiddle factor W", "Rotates the odd half's value before combining"],
        ["Butterfly", "Makes a sum and a difference from one pair"],
        ["Bit-reversed order", "Where the samples sit when they reach the size-1 leaves"],
      ],
      why: "Splitting by even and odd position shrinks the problem. W rotates the odd half so the pieces line up, and the butterfly uses one product to give two outputs, a + W·b and a − W·b. Splitting again and again shuffles the samples into bit-reversed order at the leaves.",
    },
    {
      type: "bug",
      q: "This recursive FFT should split the samples into even-position and odd-position ones. It runs, but the spectrum is wrong. Click the faulty line.",
      code: [
        "def fft(x):",
        "    n = len(x)",
        "    if n == 1:",
        "        return x",
        "    a, b = x[:n // 2], x[n // 2:]",
        "    ea, eb = fft(a), fft(b)",
        "    return combine(ea, eb)",
      ],
      a: 4,
      why: "Splitting into first half and second half gives two problems of the right size, but they are the wrong problems. The twiddle factors in the butterflies only work when the halves are the even samples and the odd samples, x[0::2] and x[1::2].",
    },
    {
      type: "multi",
      q: "A radix-2 FFT runs on 32 samples. Select every true statement.",
      o: [
        "It has 5 levels of butterflies",
        "Each level has 16 butterflies",
        "It performs 80 butterflies in total",
        "Going to 64 samples exactly doubles the butterflies",
        "A direct DFT of the same 32 samples needs only about 80 products too",
      ],
      a: [0, 1, 2],
      hint: "32 = 2 × 2 × 2 × 2 × 2. Levels × butterflies per level gives the total.",
      why: "32 halves to 1 in 5 steps, each level pairs up 32 values into 16 butterflies, and 5 × 16 = 80. At 64 samples it is 6 × 32 = 192, which is more than double. The direct DFT needs about 32 × 32 = 1,024 products.",
    },
  ]);

  B.add("a10-attn", [
    {
      type: "slider",
      q: "A layer has 8 attention heads. For a text of 1,000 tokens, each head scores every token against every token. About how many millions of scores does the layer compute?",
      min: 0,
      max: 20,
      step: 1,
      start: 4,
      ans: 8,
      tol: 1,
      unit: "million",
      hint: "1,000 × 1,000 = 1,000,000 scores per head.",
      why: "Each head scores 1,000 × 1,000 = 1,000,000 pairs, and 8 heads make 8 million. This n² table per head is what makes long texts expensive.",
    },
    {
      type: "multi",
      q: "Select every true statement about queries, keys and values in one attention head.",
      o: [
        "Token 3's query is scored against the key of every token, itself included",
        "The weights in one token's row add up to 1",
        "Token 3's key changes depending on which other token is asking",
        "Values are blended using the weights only after softmax",
        "A token's query is what the other tokens use to score it",
      ],
      a: [0, 1, 3],
      why: "A query is the asker, so token 3's query is scored against every key, giving a row of weights that softmax makes add up to 1. The values are then blended with those weights. A key is just the token's advert and is the same whoever asks. Other tokens score it with their queries against its key, not with its query.",
    },
    {
      type: "order",
      q: "Each row is a set of attention scores for three tokens, before softmax. Order the rows from the flattest weights to the most sharply peaked weights.",
      items: ["[5, 5, 5]", "[11, 10, 10]", "[13, 10, 10]", "[18, 10, 10]"],
      hint: "Only the gap between the top score and the others matters, not the size of the numbers.",
      why: "Softmax ignores adding the same number to every score, so only the gaps count. A gap of 0 is flat, and gaps of 1, 3 and 8 give more and more weight to the first token: about 0.58, 0.91 and nearly 1.",
    },
    {
      type: "cat",
      q: "An attention layer has no mask and no position vectors, so it only sees which word vectors are present. For each pair of inputs, does the layer see them as the same or as different?",
      buckets: ["Look identical to the layer", "Look different to the layer"],
      items: [
        ["'dog bites man' and 'man bites dog'", 0],
        ["'she ate fish' and 'fish ate she'", 0],
        ["'she ate fish' and 'she ate rice'", 1],
        ["'big red ball' and 'big blue ball'", 1],
      ],
      hint: "Do the two inputs use exactly the same words?",
      why: "Without position vectors, attention scores depend only on the word vectors, so shuffling the same words just shuffles the outputs. Changing a word changes its vector and so changes the result. This is why a position vector is added to each embedding.",
    },
    {
      type: "pick",
      q: 'In "The robot dropped the cup because it was clumsy", the query for the word <b>it</b> should match the key of the right earlier word. Tap that word.',
      fig: figSentence(),
      a: "robot",
      hint: "Which thing can be clumsy?",
      why: "A cup cannot be clumsy, so a good head puts most of its weight on the key of robot, and its output for it then carries robot's value. The model has to learn this from data, since nothing in the word it points at robot.",
    },
    {
      type: "mcq",
      q: "One token's four raw scores are [10, 0, 0, 0]. What does softmax produce?",
      o: [
        "Token 1 gets nearly all the weight",
        "All four weights stay near one quarter each",
        "Tokens 2 to 4 get negative weights as they score zero",
        "Token 1 gets exactly all the weight, the others none",
      ],
      a: 0,
      hint: "e¹⁰ is about 22,000, and each of the others is e⁰ = 1.",
      why: "e¹⁰ is about 22,000 against 1 for each of the others, so token 1 gets almost 100% of the weight. It is never exactly 1, since the others stay a little above 0, and softmax weights are never negative. The output is then nearly just token 1's value.",
    },
  ]);
})();
