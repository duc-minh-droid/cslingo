(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { LN, M, PK, RC, SVG, TX, bitCell } = partScope;
  const B = NIC.bank;

  /* ==================== a7-huffman ==================== */
  const treeFig = (() => {
    const A = { s: "A", p: ".5" },
      Bn = { s: "B", p: ".2" },
      C = { s: "C", p: ".2" },
      D = { s: "D", p: ".1" };
    const trees = [
      [
        [A, Bn],
        [C, D],
      ],
      [A, [Bn, [C, D]]],
      [D, [C, [Bn, A]]],
    ];
    let s = "";
    trees.forEach((t, ti) => {
      const ox = 6 + ti * 140;
      let leaf = 0;
      const lay = (n, d) => {
        if (n.s) {
          n.x = ox + 18 + leaf++ * 32;
          n.y = 30 + d * 38;
          return n;
        }
        n.k = n.map((c) => lay(c, d + 1));
        n.x = (n.k[0].x + n.k[n.k.length - 1].x) / 2;
        n.y = 30 + d * 38;
        return n;
      };
      const root = lay(t.slice(), 0);
      let lines = "",
        nodes = "";
      const draw = (n) => {
        if (n.s) {
          nodes +=
            `<circle cx="${n.x}" cy="${n.y}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>` +
            TX(n.x, n.y + 5, n.s, { s: 13 }) +
            TX(n.x, n.y + 28, n.p, { s: 11 });
          return;
        }
        n.k.forEach((c) => {
          lines += LN(n.x, n.y, c.x, c.y);
          draw(c);
        });
        nodes += `<circle cx="${n.x}" cy="${n.y}" r="5" fill="var(--line-2)"/>`;
      };
      draw(root);
      s += PK(
        "t" + (ti + 1),
        RC(ox - 2, 4, 134, 188, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) +
          lines +
          nodes +
          TX(ox + 65, 186, "Tree " + (ti + 1), { s: 13 }),
      );
    });
    return SVG(424, 198, s, "Three candidate code trees for symbols A, B, C and D with their probabilities");
  })();

  B.add("a7-huffman", [
    {
      type: "pick",
      q: "Symbols A, B, C and D occur with probabilities 0.5, 0.2, 0.2 and 0.1 (shown under each leaf). Each tree is a valid prefix code, but only one is the tree Huffman's algorithm builds. Tap it.",
      fig: treeFig,
      a: "t2",
      hint: "Average length = sum of probability × depth. Tree 1: 2 for every symbol. Work out the other two.",
      why: "Tree 2 averages 0.5×1 + 0.2×2 + 0.2×3 + 0.1×3 = 1.8 bits, the best of the three. Tree 1 is balanced (2.0 bits), and tree 3 puts the rarest symbol nearest the root, which averages 2.6 bits. Huffman merges the two rarest, so the rarest leaves end up deepest.",
    },
    {
      type: "bug",
      q: "This function should build a Huffman tree by repeatedly merging the two least frequent nodes. It produces a terrible code. Click the faulty line.",
      code: [
        "def huffman_merge(freq):",
        "    nodes = [(w, s) for s, w in freq.items()]",
        "    while len(nodes) > 1:",
        "        nodes.sort(reverse=True)",
        "        a = nodes.pop(0)",
        "        b = nodes.pop(0)",
        "        nodes.append((a[0] + b[0], (a, b)))",
        "    return nodes[0]",
      ],
      a: 3,
      why: "Sorting in descending order puts the biggest nodes at the front, so pop(0) removes the two MOST frequent. Huffman needs the two smallest: sort ascending (the default), then pop(0) twice.",
    },
    {
      type: "cat",
      q: "A prefix code gives each symbol a codeword of some length. Each codeword of length L uses up 1 / 2^L of the available code space, and the total cannot exceed 1. Which sets of lengths can belong to a prefix code?",
      buckets: ["Possible", "Impossible"],
      items: [
        ["Lengths 1, 2, 3, 3", 0],
        ["Lengths 1, 1, 2", 1],
        ["Lengths 2, 2, 2", 0],
        ["Lengths 1, 2, 2, 2", 1],
        ["Lengths 1, 2, 3, 4", 0],
        ["Lengths 2, 2, 2, 2, 2", 1],
      ],
      hint: "Add the fractions: length 1 is 1/2, length 2 is 1/4, length 3 is 1/8, length 4 is 1/16.",
      why: "1, 2, 3, 3 uses 1/2 + 1/4 + 1/8 + 1/8 = 1, which exactly fills the space. 2, 2, 2 and 1, 2, 3, 4 use less than 1, so they fit. 1, 1, 2 (1.25), 1, 2, 2, 2 (1.25) and five 2s (1.25) overshoot, so two codewords would have to share a prefix.",
    },
    {
      type: "slider",
      q: "A 1,000-symbol message uses A 500 times, B 250 times, C 125 times and D 125 times. Plain 8-bit characters cost 8,000 bits. Huffman gives A = 0, B = 10, C = 110, D = 111. Roughly what percentage of the original size is the Huffman version?",
      min: 0,
      max: 100,
      step: 2,
      ans: 22,
      tol: 8,
      unit: "%",
      hint: "Count bits: 500×1 + 250×2 + 125×3 + 125×3. Then compare with 8,000 (about 1,750 out of 8,000).",
      why: "500 + 500 + 375 + 375 = 1,750 bits, and 1,750 / 8,000 is about 22%. Skewed frequencies let the common symbol cost 1 bit instead of 8.",
    },
    {
      type: "multi",
      q: "Huffman built an optimal code for one file. Which changes would keep the average code length for that same file optimal? Select all that apply.",
      o: [
        "Swap the 0 and 1 labels on one branch of the tree",
        "Break a tie between two equal frequencies the other way round",
        "Give the rarest symbol the shortest codeword",
        "Write the frequencies as percentages instead of counts",
        "Reuse the tree built from a different file",
      ],
      a: [0, 1, 3],
      why: "Which branch is called 0 or 1 doesn't change any length, equal frequencies can be merged in either order with the same average, and scaling all counts leaves the merges unchanged. Giving the rarest symbol the shortest code is the opposite of the rule, and a tree built from different frequencies is only optimal for that other file.",
    },
  ]);

  /* ==================== a7-lzw ==================== */
  const lzwFig = (() => {
    const rows = [
      ["A", 0, "AB", 2],
      ["B", 1, "BB", 3],
      ["B", 1, "BA", 4],
      ["AB", 2, "ABA", 5],
      ["BA", 4, "BAB", 6],
      ["BB", 3, "BBA", 7],
      ["A", 0, "-", "-"],
    ];
    let s = TX(200, 20, "Input: A B B A B B A B B A   (dictionary starts A = 0, B = 1)", { s: 12 });
    ["match", "output", "new entry"].forEach((h, i) => (s += TX([86, 190, 306][i], 46, h, { s: 12 })));
    rows.forEach(([w, o, e, n], i) => {
      const y = 54 + i * 34;
      s += PK(
        "r" + (i + 1),
        RC(6, y, 388, 30, { r: 8 }) +
          TX(26, y + 20, i + 1, { s: 12 }) +
          TX(86, y + 20, w, { m: 1, s: 14 }) +
          TX(190, y + 20, o, { m: 1, s: 14 }) +
          TX(306, y + 20, e === "-" ? "-" : e + " = " + n, { m: 1, s: 14 }),
      );
    });
    return SVG(400, 296, s, "A table tracing LZW encoding of ABBABBABBA");
  })();

  const lzwDecFig = (() => {
    const T = [
      ["0", "A"],
      ["1", "B"],
      ["2", "C"],
      ["3", "BA"],
      ["4", "AB"],
    ];
    let s = TX(200, 20, "Decoder's table after handling codes 1, 0, 3", { s: 13 });
    T.forEach(([c, v], i) => {
      const x = 14 + i * 76;
      s +=
        RC(x, 32, 68, 52, {
          r: 8,
          f: i > 2 ? "var(--blue)" : "var(--panel)",
          fo: i > 2 ? ".2" : "1",
          k: i > 2 ? "var(--blue)" : "var(--line-2)",
        }) +
        TX(x + 34, 54, c, { s: 12 }) +
        TX(x + 34, 74, v, { m: 1, s: 16 });
    });
    s += TX(200, 112, "Next code to arrive: 4", { s: 14 });
    return SVG(400, 124, s, "The decoder's dictionary with entries 0 to 4");
  })();

  B.add("a7-lzw", [
    {
      type: "pick",
      q: "A learner traced LZW on the input shown, using the dictionary A = 0, B = 1. One line has the wrong new dictionary entry. Tap that line.",
      fig: lzwFig,
      a: "r4",
      hint: "Each new entry is the matched phrase plus the very next letter of the input. Re-trace the input from line 3.",
      why: "After B, B and BA are consumed the input continues A B B, so line 4 matches AB and the next letter is B: the new entry is ABB = 5, not ABA. Lines 1, 2, 3, 5 and 6 follow correctly from the input.",
    },
    {
      type: "bug",
      q: "This LZW encoder loses data. After adding a dictionary entry it should start the next phrase with the character that did not fit. Click the faulty line.",
      code: [
        "def lzw_encode(text, alphabet):",
        "    table = {ch: i for i, ch in enumerate(alphabet)}",
        "    w, out = '', []",
        "    for c in text:",
        "        if w + c in table:",
        "            w = w + c",
        "        else:",
        "            out.append(table[w])",
        "            table[w + c] = len(table)",
        "            w = ''",
        "    out.append(table[w])",
        "    return out",
      ],
      a: 9,
      why: "After emitting code(w) and storing w+c, the encoder must continue with w = c. Resetting to an empty string throws c away, so that letter never gets encoded.",
    },
    {
      type: "slider",
      q: "LZW encodes a message of 64 letters that are all A, starting with a dictionary that holds only A = 0. About how many codes does it output?",
      min: 0,
      max: 64,
      step: 1,
      ans: 11,
      tol: 3,
      unit: " codes",
      hint: "Phrases grow by one letter each time: A, AA, AAA, ... so the lengths add up 1 + 2 + 3 + ... until they reach 64.",
      why: "The encoder emits phrases of length 1, 2, 3, ... 10 (that covers 55 letters), then one final code for the last 9 letters: 11 codes in total. The phrase length keeps growing, so the number of codes grows only like the square root of the message length.",
    },
    {
      type: "cat",
      q: "Which method suits each data source better, Huffman or LZW?",
      buckets: ["Huffman suits it better", "LZW suits it better"],
      items: [
        ["Letters used very unevenly, but no phrase ever repeats", 0],
        ["The same long phrases keep recurring, with every letter about equally common", 1],
        ["A live stream where nothing can be read ahead to count letters", 1],
        ["Random-order symbols: A 70%, C, G and T 10% each", 0],
        ["A log file repeating the same long lines thousands of times", 1],
      ],
      why: "Huffman exploits uneven symbol frequencies, even when the order is random. LZW exploits repeated sequences and needs no counts in advance, because both ends build the same dictionary as the data goes by.",
    },
    M(
      "The decoder's table is shown. The next code that arrives is 4 (AB). Which entry does it add as code 5?",
      ["ABA", "ABB", "BAA", "BAB"],
      2,
      "The new entry is the previous output (BA) plus the first letter of the current one (AB gives A): BA + A = BAA. The decoder is always one entry behind the encoder, so it can add the entry only once it sees the next phrase's first letter.",
      { fig: lzwDecFig, hint: "New entry = previous string + first letter of the current string." },
    ),
  ]);

  /* ==================== a8-hash ==================== */
  const chainFig = (() => {
    const blocks = [
      ["Block 1", "Ann pays Bob 5", "0000", "7c21", ""],
      ["Block 2", "Bob pays Cy 20", "7c21", "e7b2", "edited (was 2), hash recomputed"],
      ["Block 3", "Cy pays Di 1", "41af", "9d03", ""],
      ["Block 4", "Di pays Ed 3", "9d03", "2b58", ""],
    ];
    let s = TX(200, 14, "Short made-up digests. prev = the parent block's hash.", { s: 12 });
    blocks.forEach(([n, d, p, h, note], i) => {
      const y = 28 + i * 64,
        edited = i === 1;
      s += PK(
        "b" + (i + 1),
        RC(6, y, 388, 56, { r: 10, k: edited ? "var(--amber)" : "var(--line-2)" }) +
          TX(18, y + 20, n, { a: "start", s: 13 }) +
          TX(120, y + 20, d, { a: "start", s: 13 }) +
          TX(18, y + 42, "prev " + p, { a: "start", m: 1, s: 13 }) +
          TX(120, y + 42, "hash " + h, { a: "start", m: 1, s: 13 }) +
          (note ? TX(382, y + 42, note, { a: "end", s: 10, f: "var(--amber-ink, var(--text))" }) : ""),
      );
    });
    return SVG(400, 288, s, "A chain of four blocks where block 2 was edited");
  })();

  const pairFig = (() => {
    const pairs = [
      { id: "p1", name: "Hash P", a: "1011001110100101", b: "1011001110110101" },
      { id: "p2", name: "Hash Q", a: "0110001101000010", b: "0100111010100011" },
    ];
    let s = TX(200, 16, "First 16 bits of each digest. Inputs differ by one character.", { s: 12 });
    pairs.forEach((p, k) => {
      const y = 28 + k * 100;
      s += PK(
        p.id,
        RC(4, y, 392, 90, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) +
          TX(40, y + 24, p.name, { s: 13 }) +
          [...p.a].map((c, i) => bitCell(76 + i * 19, y + 10, c, { w: 18, h: 28, sw: 1, tf: "var(--text)" })).join("") +
          [...p.b]
            .map((c, i) =>
              bitCell(76 + i * 19, y + 46, c, {
                w: 18,
                h: 28,
                sw: 1,
                f: c !== p.a[i] ? "var(--rose)" : "var(--panel)",
                fo: c !== p.a[i] ? ".35" : "1",
              }),
            )
            .join("") +
          TX(40, y + 40, "before", { s: 10 }) +
          TX(40, y + 68, "after", { s: 10 }),
      );
    });
    return SVG(400, 232, s, "Two pairs of digests with the differing bits highlighted");
  })();

  B.add("a8-hash", [
    {
      type: "pick",
      q: "An attacker edited block 2 and recomputed only block 2's own hash. Nothing else was touched. The checker validates each block in turn: its stored hash must match its contents, and its prev must equal the previous block's stored hash. Tap the first block that fails.",
      fig: chainFig,
      a: "b3",
      hint: "Compare each block's prev with the hash stored in the block above it.",
      why: "Block 2 passes: its own hash was recomputed and its prev still matches block 1. Block 3 still stores prev 41af, the OLD hash of block 2, but block 2 now has hash e7b2, so the link breaks there. Block 4 still matches block 3's stored hash.",
    },
    {
      type: "cat",
      q: "Should each job use a hash (a one-way fingerprint) or encryption (reversible with a key)?",
      buckets: ["Hash", "Encryption"],
      items: [
        ["Checking a login password without storing it", 0],
        ["Sending a private message the receiver must read", 1],
        ["Confirming a big download wasn't corrupted", 0],
        ["Storing a card number so a shop can charge it next month", 1],
        ["Spotting duplicate files without comparing every byte", 0],
      ],
      why: "Hashes give a fixed fingerprint that cannot be turned back into the input, which is right when you only need to compare or verify. When the original must be recovered later (a message, a stored card number) you need encryption, which a key can reverse.",
    },
    {
      type: "pick",
      q: "Both hash functions below were given two inputs that differ by a single character. One is suitable for detecting tampering and for proof of work. Tap that hash.",
      fig: pairFig,
      a: "p2",
      hint: "A good hash changes about half its output bits when the input changes at all.",
      why: "Hash Q flips about half of its bits (the avalanche effect), so the digest of an edited input looks unrelated to the original. Hash P flips just one bit, so edited inputs give almost the same digest and an attacker can search for a matching one easily.",
    },
    {
      type: "order",
      q: "Put the steps of mining one block in order.",
      items: [
        "Collect transactions and the previous block's hash into a block",
        "Choose a nonce and hash the whole block",
        "Check whether the digest starts with enough zeros",
        "Not enough zeros: change the nonce and hash again",
        "Enough zeros: broadcast the block",
        "Everyone else re-hashes it once to confirm",
      ],
      why: "Finding a good nonce is trial and error that can repeat millions of times, while confirming it takes one hash. That imbalance (costly to make, cheap to check) is what makes proof of work useful.",
    },
    {
      type: "bug",
      q: "A thief edits the data in the very last block of a chain, but this validity checker still says the chain is fine. Click the faulty line.",
      code: [
        "def valid(chain):",
        "    for i in range(1, len(chain) - 1):",
        "        cur, prev = chain[i], chain[i - 1]",
        "        if cur['prev'] != prev['hash']:",
        "            return False",
        "        if sha(cur['data'] + cur['prev']) != cur['hash']:",
        "            return False",
        "    return True",
      ],
      a: 1,
      why: "range(1, len(chain) - 1) stops before the last block, so it is never checked. The loop should run to len(chain). This off-by-one means the newest block can be tampered with freely.",
    },
  ]);

  /* ==================== a8-keys ==================== */
  const dhFig = (() => {
    const chips = [
      ["p", "p (the prime)"],
      ["g", "g (the base)"],
      ["a", "a (Alice's number)"],
      ["b", "b (Bob's number)"],
      ["A", "A = g^a mod p"],
      ["B", "B = g^b mod p"],
      ["K", "K (final shared value)"],
    ];
    let s = "";
    chips.forEach(([id, t], i) => {
      const x = 8 + (i % 2) * 196,
        y = 8 + Math.floor(i / 2) * 54;
      s += PK(id, RC(x, y, 184, 44, { r: 12 }) + TX(x + 92, y + 28, t, { s: 14 }));
    });
    return SVG(392, 228, s, "Seven values used in a Diffie-Hellman exchange");
  })();

  const mitmFig = (() => {
    const box = (x, t, k) =>
      RC(x, 36, 100, 56, {
        r: 12,
        k: k || "var(--line-2)",
        f: k ? "var(--rose)" : "var(--panel)",
        fo: k ? ".15" : "1",
      }) + TX(x + 50, 70, t, { s: 14 });
    return SVG(
      400,
      150,
      box(8, "Alice") +
        box(150, "Mallory", "var(--rose)") +
        box(292, "Bob") +
        LN(108, 64, 150, 64, { w: 3 }) +
        LN(250, 64, 292, 64, { w: 3 }) +
        TX(80, 22, "exchange 1", { s: 12 }) +
        TX(320, 22, "exchange 2", { s: 12 }) +
        TX(58, 118, "key K1", { s: 13, f: "var(--blue)" }) +
        TX(342, 118, "key K2", { s: 13, f: "var(--blue)" }) +
        TX(200, 118, "knows K1 and K2", { s: 12, f: "var(--rose)" }) +
        TX(200, 142, "Alice and Bob each believe they talk to the other directly", { s: 11 }),
      "Mallory sitting between Alice and Bob running two separate exchanges",
    );
  })();
  Object.assign(partScope, { dhFig, mitmFig });
})();
