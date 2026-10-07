(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { TAU, arrow, circ, dftAmps, f1, figCertTree, figRings, figSignPipe, figVenn, ln, pk, rc, softmax, svg, tx } =
    partScope;
  const B = NIC.bank;

  B.add("a8-keys", [
    {
      type: "mcq",
      q: "Diffie–Hellman with p = 17. Each ring shows which public values A = gᵃ mod 17 can ever appear (big green dots). Alice and Bob choose g = 4 instead of g = 3. What is the real problem?",
      fig: figRings(),
      o: [
        "Eve only has to try a = 1, 2, 3, 4, because the powers of 4 repeat after four steps",
        "Alice and Bob would calculate two different shared secrets, so the chat could not start",
        "Eve could read a straight off the ring, since every dot is labelled with its exponent",
        "The public value A would be too big to send, because g = 4 raises it to a higher power",
      ],
      a: 0,
      hint: "Count the steps until the sequence 4, 16, 13, 1 starts again.",
      why: "The secret exponent only matters up to where the powers start repeating. With g = 3 that is 16 steps, with g = 4 it is 4, so Eve can simply try every a up to 4 (or 8 for g = 2). A good base, called a generator, visits as many values as possible, which is what makes the search hard.",
    },
    {
      type: "pick",
      q: "Alice signs a contract and sends it with her signature. Eve has a copy of everything on the wire and Alice's <b>public</b> key. Tap <b>every</b> step Eve could carry out herself.",
      fig: figSignPipe(),
      a: ["s1", "s3", "s4", "s5"],
      why: "Hashing needs no secret, and unlocking a signature uses the <b>public</b> key, so Eve can do steps 1, 3, 4 and 5. The only step that needs a secret is step 2, locking with Alice's private key. That asymmetry is the whole point: anyone can check a signature, only Alice can make one.",
    },
    {
      type: "mcq",
      q: "Each method is placed by what it does well. Nothing lands in the overlap. How does a real secure chat cope with that?",
      fig: figVenn(),
      o: [
        "Public-key steps agree a fresh key, then fast symmetric encryption carries the chat",
        "It uses RSA for every single message and accepts the extra waiting time on each reply",
        "It sends the AES key in the clear first, because AES is quick enough to make up for that",
        "It picks a much bigger RSA key until RSA becomes as fast as AES for the bulk data",
      ],
      a: 0,
      why: "Public-key methods can start from nothing but are slow; symmetric ciphers are fast but need a shared key already. Combining them (a hybrid) gets both: use Diffie–Hellman or RSA once to agree a key, then AES for the bulk. A bigger RSA key makes it slower, not faster.",
    },
    {
      type: "pick",
      q: "Your browser trusts only the Root CA's key. Three servers each present a certificate claiming to be <b>shop.example</b>. Tap the certificate it should accept.",
      fig: figCertTree(),
      a: "A",
      why: "A certificate is only as good as the chain of signatures leading back to a key you already hold. A is signed by the Intermediate, whose own certificate is signed by the Root, so the chain closes. FreeCert is unknown to the browser and a self-signed certificate vouches only for itself, so a man in the middle could use either.",
    },
  ]);

  /* ================================================================== a9-dft ================================================================== */

  // D1: tone order is not in the magnitude spectrum
  function figTwoRecordings() {
    const N = 64,
      tone = (f, t) => Math.sin((TAU * f * t) / N);
    const A = Array.from({ length: N }, (_, t) => (t < 32 ? tone(4, t) : tone(8, t)));
    const Bs = Array.from({ length: N }, (_, t) => (t < 32 ? tone(8, t) : tone(4, t)));
    const sa = dftAmps(A),
      sb = dftAmps(Bs);
    const wave = (arr, cy, first, second) => {
      const X = (t) => 12 + (t * 316) / 63,
        pts = (a, b) =>
          arr
            .slice(a, b + 1)
            .map((v, i) => `${f1(X(a + i))},${f1(cy - v * 17)}`)
            .join(" ");
      return (
        ln(12, cy, 328, cy, { c: "var(--line)", w: 1.5 }) +
        `<polyline points="${pts(0, 32)}" fill="none" stroke="${first}" stroke-width="2.5" stroke-linejoin="round"/><polyline points="${pts(32, 63)}" fill="none" stroke="${second}" stroke-width="2.5" stroke-linejoin="round"/>`
      );
    };
    const bars = (x0, amps, title) => {
      let s = tx(x0 + 71, 134, title, { s: 12, c: "var(--text-dim)" });
      for (let k = 0; k <= 12; k++) {
        const h = amps[k] * 120,
          c = k === 4 ? "var(--blue)" : k === 8 ? "var(--amber)" : "var(--line-2)";
        s += `<rect x="${x0 + k * 11 + 1}" y="${f1(206 - h)}" width="8" height="${f1(Math.max(h, 1))}" rx="2" fill="${c}"/>`;
      }
      return (
        s +
        ln(x0, 207, x0 + 143, 207, { c: "var(--line-2)", w: 1.5 }) +
        tx(x0, 222, "0", { s: 11, c: "var(--text-faint)", a: "start" }) +
        tx(x0 + 143, 222, "12 Hz", { s: 11, c: "var(--text-faint)", a: "end" })
      );
    };
    const s =
      tx(8, 14, "Recording A: slow tone, then fast tone", { a: "start", s: 12, c: "var(--text-dim)" }) +
      wave(A, 42, "var(--blue)", "var(--amber)") +
      tx(8, 78, "Recording B: fast tone, then slow tone", { a: "start", s: 12, c: "var(--text-dim)" }) +
      wave(Bs, 106, "var(--amber)", "var(--blue)") +
      bars(10, sa, "Spectrum of A") +
      bars(180, sb, "Spectrum of B");
    return svg(
      340,
      230,
      s,
      "Two one-second recordings with the same two tones in opposite order, and their identical magnitude spectra",
    );
  }

  // D2: the fold plot at fs = 40 Hz
  function figFold() {
    const X = (f) => 44 + f * 3.4,
      Y = (a) => 168 - a * 6;
    const fold = (f) => Math.abs(f - 40 * Math.round(f / 40));
    let s =
      ln(44, 168, 318, 168, { c: "var(--text-faint)", w: 2 }) + ln(44, 168, 44, 40, { c: "var(--text-faint)", w: 2 });
    [0, 10, 20].forEach(
      (a) =>
        (s +=
          ln(41, Y(a), 47, Y(a), { c: "var(--text-faint)", w: 2 }) +
          tx(36, Y(a) + 4, a, { a: "end", s: 11, c: "var(--text-dim)" })),
    );
    s += tx(8, 24, "peak you see (Hz)", { a: "start", s: 12, c: "var(--text-dim)" });
    s += `<polyline points="${[0, 20, 40, 60, 80].map((f) => `${f1(X(f))},${f1(Y(fold(f)))}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    s += tx(181, 220, "true frequency of the tone (Hz). Tap marked tones.", { s: 12, c: "var(--text-dim)" });
    [10, 20, 30, 50, 60, 70].forEach((f) => {
      s += pk(
        String(f),
        `<rect x="${f1(X(f) - 14)}" y="176" width="28" height="26" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>` +
          tx(X(f), 194, f, { s: 13 }),
      );
    });
    [0, 40, 80].forEach((f) => (s += ln(X(f), 168, X(f), 172, { c: "var(--text-faint)", w: 2 })));
    return svg(330, 228, s, "Zig-zag plot: apparent frequency against true frequency when sampling at 40 Hz");
  }

  // D3: recording set-ups, sample rate across and length up
  function figSetups() {
    const X = (fs) => 48 + (fs / 1400) * 270,
      Y = (T) => 232 - T * 170;
    let s =
      ln(48, 232, 322, 232, { c: "var(--text-faint)", w: 2 }) + ln(48, 232, 48, 36, { c: "var(--text-faint)", w: 2 });
    [0, 400, 800, 1200].forEach(
      (v) =>
        (s +=
          ln(X(v), 232, X(v), 236, { c: "var(--text-faint)", w: 2 }) +
          tx(X(v), 250, v, { s: 11, c: "var(--text-dim)" })),
    );
    [0, 0.5, 1].forEach(
      (v) =>
        (s +=
          ln(44, Y(v), 48, Y(v), { c: "var(--text-faint)", w: 2 }) +
          tx(40, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-dim)" }) +
          (v ? ln(48, Y(v), 322, Y(v), { c: "var(--line)", w: 1, d: "3 4" }) : "")),
    );
    s +=
      tx(8, 22, "recording length (s)", { a: "start", s: 12, c: "var(--text-dim)" }) +
      tx(185, 270, "samples per second (Hz)", { s: 12, c: "var(--text-dim)" });
    [
      ["A", 500, 1],
      ["B", 800, 0.25],
      ["C", 800, 1],
      ["D", 650, 0.6],
      ["E", 1000, 0.4],
      ["F", 1200, 0.75],
      ["G", 400, 0.3],
    ].forEach(([id, fs, T]) => (s += pk(id, circ(X(fs), Y(T), 13, "p") + tx(X(fs), Y(T) + 5, id, { s: 13 }))));
    return svg(335, 278, s, "Scatter of seven recording set-ups: sample rate across, recording length up");
  }

  B.add("a9-dft", [
    {
      type: "mcq",
      q: "Recording A plays a 4 Hz tone for half a second then an 8 Hz tone for half a second. Recording B plays them the other way round. Both are analysed with one DFT over the whole second. Can the magnitude spectrum tell you which tone came first?",
      fig: figTwoRecordings(),
      o: [
        "No: each bar adds up the whole second, so the order of the tones is not in the bar heights",
        "Yes: the 4 Hz bar sits further left when that tone plays first, so you can simply read the order",
        "Yes: the tone that plays first always leaves the taller bar of the two bars in the spectrum",
        "No: the sample rate is too low to hold two different tones in the same recording",
      ],
      a: 0,
      why: "Every DFT bin multiplies all the samples by one rotating wave and adds the lot, so a bin answers “how much of this frequency is in the window?”, not “when?”. Swapping the halves gives exactly the same magnitudes (here the two charts are numerically identical). To see timing you cut the signal into short windows, a spectrogram.",
    },
    {
      type: "pick",
      q: "A recorder samples at <b>40 Hz</b>. The zig-zag shows where a tone of each true frequency appears. A peak shows at 10 Hz. Tap <b>every</b> marked true frequency that could have produced it.",
      fig: figFold(),
      a: ["10", "30", "50", "70"],
      why: "Everything folds back into 0 to 20 Hz (half of 40). Tones at 10, 30, 50 and 70 Hz all land on 10 Hz: they differ by multiples of the sampling rate (40 Hz) or are mirror images around it. 20 and 60 Hz both land on 20 Hz. After sampling, nothing can tell these impostors apart.",
    },
    {
      type: "pick",
      q: "The loudest tone to record is <b>300 Hz</b>, and two hums must show as separate peaks, which needs bins at most <b>2 Hz</b> apart. Each dot is a recording set-up. Tap <b>every</b> set-up that works.",
      fig: figSetups(),
      a: ["C", "D", "F"],
      hint: "Two conditions: samples per second above 2 × 300, and bin spacing 1 ÷ length at most 2.",
      why: "Condition 1: sample faster than twice the highest tone, so more than 600 Hz (rules out A and G). Condition 2: bin spacing is 1 ÷ length, so a length of at least 0.5 s gives 2 Hz bins (rules out B and E). C, D and F meet both.",
    },
    {
      type: "bug",
      q: "<code>mags</code> holds the DFT magnitudes for bins 0 to n/2, from n samples taken at <code>fs</code> Hz. The function should return the frequency of the loudest bin but gives silly answers. Click the faulty line.",
      code: [
        "def peak_hz(mags, fs):",
        "    n = 2 * (len(mags) - 1)",
        "    k = mags.index(max(mags))",
        "    return k * n / fs",
      ],
      a: 3,
      why: "Bin k sits at k × (bin spacing) and the spacing is fs ÷ n. The line multiplies by n and divides by fs, the wrong way up (the answer would shrink as you sample faster). It should be <code>k * fs / n</code>.",
    },
  ]);

  /* ================================================================== a9-fft ================================================================== */

  // F1: samples that are zero on the odd positions
  function figEvenOnly() {
    const xs = [3, 0, 1, 0, 4, 0, 2, 0],
      cw = 38,
      x0 = 16;
    let s = tx(8, 16, "8 samples", { a: "start", s: 12, c: "var(--text-dim)" });
    xs.forEach(
      (v, i) =>
        (s +=
          rc(x0 + i * cw, 24, cw - 4, 34, i % 2 ? "n" : "b", { r: 6 }) +
          tx(x0 + i * cw + (cw - 4) / 2, 47, v, { s: 15, c: i % 2 ? "var(--text-faint)" : "var(--blue-ink)" }) +
          tx(x0 + i * cw + (cw - 4) / 2, 74, `x${i}`, { s: 11, c: "var(--text-faint)" })),
    );
    s += tx(8, 108, "Spectrum bars (heights depend on the samples)", { a: "start", s: 12, c: "var(--text-dim)" });
    for (let k = 0; k < 8; k++) {
      const x = x0 + k * cw;
      if (k === 1)
        s +=
          rc(x, 120, cw - 4, 80, "g", { r: 6, sw: 1.5 }) +
          `<rect x="${x + 5}" y="152" width="${cw - 14}" height="48" rx="3" fill="var(--teal)"/>` +
          tx(x + (cw - 4) / 2, 140, "ref", { s: 11, c: "var(--teal-ink)" });
      else
        s += pk(
          String(k),
          rc(x, 120, cw - 4, 80, "p", { r: 6, d: "4 3" }) +
            tx(x + (cw - 4) / 2, 166, "?", { s: 15, c: "var(--text-faint)" }),
        );
      s += tx(x + (cw - 4) / 2, 218, `bin ${k}`, { s: 11, c: "var(--text-faint)" });
    }
    return svg(
      330,
      228,
      s,
      "Eight samples with zeros at odd positions, and eight spectrum slots with bin 1 drawn as the reference",
    );
  }

  // F2: an 8-point butterfly network
  function figButterfly8() {
    const order = [0, 4, 2, 6, 1, 5, 3, 7],
      Y = (i) => 44 + i * 25,
      bands = [
        [84, 150],
        [160, 226],
        [236, 302],
      ];
    let s = "";
    bands.forEach(([a, b], si) => {
      s += pk(
        `s${si + 1}`,
        rc(a - 4, 24, b - a + 8, 206, "p", { r: 10, d: "5 4" }) +
          tx((a + b) / 2, 18, `Stage ${si + 1}`, { s: 12, c: "var(--text-dim)" }),
      );
    });
    for (let i = 0; i < 8; i++) s += ln(46, Y(i), 306, Y(i), { c: "var(--line-2)", w: 1.5 });
    bands.forEach(([a, b], si) => {
      const d = 1 << si;
      for (let i = 0; i < 8; i++)
        if (!(i & d)) {
          const j = i + d;
          s += ln(a, Y(i), b, Y(j), { c: "var(--blue)", w: 2 }) + ln(a, Y(j), b, Y(i), { c: "var(--blue)", w: 2 });
          s +=
            circ(a, Y(i), 3.2, "p", { f: "var(--blue)", st: "var(--blue)", sw: 1 }) +
            circ(a, Y(j), 3.2, "p", { f: "var(--blue)", st: "var(--blue)", sw: 1 });
        }
    });
    order.forEach((v, i) => (s += tx(38, Y(i) + 4, `x${v}`, { a: "end", s: 12 })));
    return svg(340, 242, s, "An eight-point butterfly network with inputs in bit-reversed order and three stages");
  }

  // F3: a log ruler for operation counts
  function figRuler() {
    let s = ln(20, 44, 320, 44, { c: "var(--text-faint)", w: 2.5 });
    for (let e = 1; e <= 10; e++) {
      const x = 20 + ((e - 1) * 300) / 9;
      s += ln(x, 38, x, 50, { c: "var(--text-faint)", w: 2 });
    }
    [
      [1, "10"],
      [3, "1,000"],
      [6, "1 million"],
      [9, "1 billion"],
    ].forEach(
      ([e, t]) =>
        (s += tx(20 + ((e - 1) * 300) / 9, 72, t, { s: 12, c: "var(--text-dim)", a: e === 1 ? "start" : "middle" })),
    );
    s += tx(170, 18, "number of operations, each tick is 10× the last", { s: 12, c: "var(--text-dim)" });
    return svg(340, 84, s, "A logarithmic ruler from 10 operations to 10 billion");
  }

  B.add("a9-fft", [
    {
      type: "pick",
      q: "An 8-sample recording has <b>zeros at every odd position</b>: x = [3, 0, 1, 0, 4, 0, 2, 0]. Bin 1's bar is drawn. Which other bins must be <b>exactly as tall</b>? Tap them all.",
      fig: figEvenOnly(),
      a: ["3", "5", "7"],
      hint: "If the odd samples are all zero, what is left of X[k] = E[k] + W·O[k]?",
      why: "The odd half O is all zeros, so X[k] = E[k] and X[k + 4] = E[k]: the spectrum repeats every 4 bins, so bin 5 equals bin 1. A real signal also mirrors (bin 8 − k has the same height), so bin 7 matches bin 1 and bin 3 matches bin 5. Bins 0, 2, 4 and 6 are different (10, 4, 10, 4 against 1.41).",
    },
    {
      type: "pick",
      q: "In this 8-point FFT the inputs are shuffled into bit-reversed order and then merged in three stages. The original samples <b>x0 and x1</b> (the first two in the recording) are first combined in which stage? Tap it.",
      fig: figButterfly8(),
      a: "s3",
      hint: "Follow x0 and x1 along their wires: when do they first end up on the same butterfly?",
      why: "Stage 1 merges neighbours in the shuffled order, so x0 meets x4. Stage 2 merges those pairs with {x2, x6}. Only stage 3 joins the even-indexed group {x0, x4, x2, x6} with the odd group {x1, x5, x3, x7}, so x0 and x1 first meet there. Neighbours in time are the last to meet, because the split starts with even against odd.",
    },
    {
      type: "order",
      q: "Each job counts as N² operations (direct DFT) or about N log₂ N (FFT). Order them from the <b>fewest</b> operations to the most.",
      fig: figRuler(),
      hint: "log₂ of 4,096 is 12, of 65,536 is 16 and of 1,048,576 is 20.",
      items: [
        "Direct DFT of 64 samples",
        "FFT of 4,096 samples",
        "Direct DFT of 512 samples",
        "FFT of 65,536 samples",
        "FFT of 1,048,576 samples",
      ],
      why: "64² = 4,096; 4,096 × 12 ≈ 49,000; 512² ≈ 262,000; 65,536 × 16 ≈ 1,050,000; 1,048,576 × 20 ≈ 21 million. A direct DFT of just 512 samples already costs more than an FFT of 4,096, but an FFT of a million samples is still only about 21 million steps, far less than the 10¹² a direct DFT would need.",
    },
    {
      type: "bug",
      q: "This should reverse the bits of <code>i</code> (with 3 bits, 6 = 110 becomes 011 = 3), the order an FFT's inputs are shuffled into. It returns 1 for 6. Click the faulty line.",
      code: [
        "def bit_reverse(i, bits):",
        "    r = 0",
        "    for _ in range(bits):",
        "        r = r | (i & 1)",
        "        i >>= 1",
        "    return r",
      ],
      a: 3,
      why: "Each pass should push the bits already collected one place left and add the new one at the bottom: <code>r = (r &lt;&lt; 1) | (i &amp; 1)</code>. Without the shift every bit lands on the same place, so 6 (110) gives 0, 1, 1 → 1 instead of 3.",
    },
  ]);

  /* ================================================================== a10-attn ================================================================== */

  // A1: query and key arrows in 2-D
  function figArrows() {
    const X = (x) => 34 + (x + 2) * 40,
      Y = (y) => 222 - (y + 1) * 42,
      O = [X(0), Y(0)];
    let s =
      ln(X(-2), Y(0), X(5), Y(0), { c: "var(--line-2)", w: 1.5 }) +
      ln(X(0), Y(-1), X(0), Y(4), { c: "var(--line-2)", w: 1.5 });
    [
      [1, 1, "A"],
      [4, 1, "B"],
      [0, 3, "C"],
      [-1, 2, "D"],
    ].forEach(([x, y, id]) => {
      s += arrow(O[0], O[1], X(x), Y(y), "var(--text-faint)", 2.5);
    });
    s +=
      arrow(O[0], O[1], X(2), Y(2), "var(--blue)", 4) +
      tx(X(2) + 10, Y(2) - 14, "query (2, 2)", { a: "start", s: 12, c: "var(--blue-ink)" });
    [
      [1, 1, "A"],
      [4, 1, "B"],
      [0, 3, "C"],
      [-1, 2, "D"],
    ].forEach(([x, y, id]) => {
      s += pk(id, circ(X(x), Y(y), 13, "p") + tx(X(x), Y(y) + 5, id, { s: 13 }));
    });
    s += tx(8, 16, "key arrows A to D, all from the origin", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(330, 240, s, "A blue query arrow (2, 2) and four grey key arrows A (1,1), B (4,1), C (0,3), D (-1,2)");
  }

  // A2: three panels of softmax weights
  function figWeightPanels() {
    const sets = [
      ["A", [4, 2, 0]],
      ["B", [2, 1, 0]],
      ["C", [1, 0.5, 0]],
    ];
    let s = "";
    sets.forEach(([id, sc], p) => {
      const x0 = 6 + p * 112,
        w = softmax(sc);
      let g = rc(x0, 8, 104, 160, "p", { r: 10 }) + tx(x0 + 52, 28, `Panel ${id}`, { s: 13 });
      w.forEach((v, i) => {
        const h = v * 100,
          bx = x0 + 12 + i * 29;
        g +=
          `<rect x="${bx}" y="${f1(138 - h)}" width="24" height="${f1(h)}" rx="3" fill="var(--blue)"/>` +
          tx(bx + 12, 132 - h, v.toFixed(2), { s: 11 }) +
          tx(bx + 12, 156, `k${i + 1}`, { s: 11, c: "var(--text-faint)" });
      });
      s += pk(id, g);
    });
    return svg(340, 176, s, "Three bar panels of attention weights over three keys");
  }
  Object.assign(partScope, { figArrows, figRuler, figWeightPanels });
})();
