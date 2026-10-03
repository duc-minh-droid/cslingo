(function () {
  const partScope = (NIC.shared.bossAlgo = NIC.shared.bossAlgo || {});
  const { boss, maskGrid } = partScope;
  const N = NIC;

  /* ================= Phase 10 ================= */
  boss(10, {
    blurb: "Eight questions: new softmax numbers, masks, scaling, and what attention can't tell you.",
    lede: "New scores and a new sentence. Softmax by hand is fine with e ≈ 2.718.",
    qs: [
      {
        type: "mcq",
        q: "Attention scores for three tokens are [1, 1, 0]. After softmax, roughly what weight does the third token get? (e ≈ 2.7)",
        o: ["0", "about 0.16", "about 0.33", "about 0.5"],
        a: 1,
        hint: "The first two each get e ≈ 2.7 and the third gets e⁰ = 1. The total is about 6.4, so the third gets about 1 part in 6.",
        why: "e¹, e¹, e⁰ = 2.718, 2.718, 1, which sum to 6.437. The third gets 1 / 6.437 ≈ <b>0.155</b>; the first two get 0.422 each.",
      },
      {
        type: "pick",
        q: 'A decoder is generating the sentence "cats chase small mice". <b>Click every cell the causal mask must block.</b>',
        fig: maskGrid(["cats", "chase", "small", "mice"]),
        a: ["r0c1", "r0c2", "r0c3", "r1c2", "r1c3", "r2c3"],
        why: "Each word may look at itself and earlier words only, so everything above the diagonal (a later column) is masked: 6 cells.",
      },
      {
        type: "mcq",
        q: "A model's context grows from 512 to 2,048 tokens. By what factor does the attention score matrix grow?",
        o: ["4×", "8×", "16×", "64×"],
        a: 2,
        why: "It's n × n: 4× longer means 4² = <b>16×</b> more pairs. That's why long contexts are expensive.",
      },
      {
        type: "mcq",
        q: "Keys and queries have dimension d_k = 64. What do the raw dot products get divided by before softmax?",
        o: ["64", "32", "8", "6"],
        a: 2,
        why: "√64 = <b>8</b>. Without it, large dot products push softmax towards all-or-nothing, which stalls learning.",
      },
      {
        type: "match",
        q: "A library analogy: match each part of attention to its role.",
        pairs: [
          ["Query", "What you type into the library search box"],
          ["Key", "The label on each book's spine that the search matches against"],
          ["Value", "The contents of the book you actually read"],
        ],
        why: "Queries are compared with keys to decide how relevant each item is; values are what gets blended into the output.",
      },
      {
        type: "mcq",
        q: "Scores are [5, 3, 1]. You subtract 5 from all of them before softmax (a common trick for numerical safety). What happens to the weights?",
        o: ["They all shrink", "They're identical", "The first becomes 0", "They become uniform"],
        a: 1,
        why: "e^(s − 5) = e^s × e^(−5), and the common factor cancels when you normalise. That's why subtracting the max is safe.",
      },
      {
        type: "mcq",
        q: 'A researcher shows a heatmap where "it" puts 80% weight on "trophy" and claims this <b>proves</b> the model resolved the pronoun. What\'s the problem?',
        o: [
          "80% is too low to count as evidence; it would need to be 100%",
          "It shows where information flowed in one layer, not why",
          "Heatmaps can't show pronouns at all",
          "Nothing: 80% weight is proof",
        ],
        a: 1,
        why: "Attention is one mechanism among many (other heads, other layers, MLPs). High weight is suggestive, but it isn't a causal explanation.",
      },
      {
        type: "multi",
        q: "Which statements about transformers are true? Select all that apply.",
        o: [
          "Without position information, shuffling the words would give the same set of outputs",
          "Every attention weight row sums to 1",
          "Values decide how much attention each token gets",
          "Multiple heads can attend to different relationships at once",
        ],
        a: [0, 1, 3],
        why: "Attention itself ignores order, hence position vectors. Softmax rows sum to 1. Keys (via query·key scores), not values, decide the weights. Heads run in parallel with their own projections.",
      },
    ],
  });

  /* ================= Capstone ================= */
  N.registerBoss({
    id: "a11-capstone",
    subject: "algo",
    lecture: 11,
    title: "Final boss: pick the algorithm",
    blurb: "Ten mixed questions across all ten phases: choose tools, spot broken assumptions, estimate costs.",
    lede: "Every phase in one quiz. For each scenario, find the assumption that decides which tool fits.",
    qs: [
      {
        type: "cat",
        q: "A logistics company has four problems. Which tool fits each?",
        buckets: ["Dijkstra / A*", "MST (Prim / Kruskal)", "Linear programming", "Evolutionary search"],
        items: [
          ["Fastest van route from depot to one customer", 0],
          ["Cheapest fibre network linking all 40 depots", 1],
          ["How many of each product to ship, with linear capacity limits", 2],
          ["Driver rosters with dozens of messy, non-linear union rules", 3],
        ],
        why: "Point-to-point shortest path: Dijkstra/A*. Connect everything cheaply: MST. Linear objective and constraints: LP. Messy, non-linear, hard: heuristic search.",
      },
      {
        type: "mcq",
        q: "A route planner starts giving wrong answers after the company adds <b>refund edges with negative cost</b>. Which assumption broke, and what's the fix?",
        o: [
          "Admissibility; use a better heuristic",
          "Non-negative edge weights",
          "Connectivity; add edges",
          "Nothing broke",
        ],
        a: 1,
        why: 'Dijkstra\'s "settled means final" rule needs non-negative weights. Bellman–Ford handles negative edges (and detects negative cycles).',
      },
      {
        type: "match",
        q: "Match each data problem to the right tool.",
        pairs: [
          ["Shrink English text with very uneven letter frequencies", "Huffman coding"],
          ["Shrink server logs full of repeated phrases", "LZW"],
          ["Catch accidental bit flips on a fast, retryable link", "CRC + retransmit"],
          ["Survive bit flips where resending is impossible", "Hamming error correction"],
        ],
        why: "Skewed symbols: Huffman. Repeated sequences: LZW. Cheap retries: detect with CRC. No retries: correct on arrival.",
      },
      {
        type: "multi",
        q: "Which of these need a <b>secret</b> to work? Select all that apply.",
        o: [
          "Checking a file against its SHA-256 fingerprint",
          "Diffie–Hellman key agreement",
          "Signing a software update",
          "Computing a CRC",
        ],
        a: [1, 2],
        why: "DH needs each side's private exponent, and signing needs a private key. Hashes and CRCs are public calculations; anyone can compute them.",
      },
      {
        type: "slider",
        q: "Estimate: how many times slower is a direct DFT than an FFT for N = 1,048,576 (2²⁰) samples?",
        min: 1000,
        max: 100000,
        step: 1000,
        start: 10000,
        ans: 52000,
        tol: 6000,
        unit: "×",
        hint: "The ratio is N / log₂ N. Here log₂ N = 20, so it's about a million divided by 20.",
        why: "N / log₂ N = 1,048,576 / 20 ≈ <b>52,000×</b>. That gap is the difference between real-time and hopeless.",
      },
      {
        type: "order",
        q: "A search engine's pipeline, from crawling to answering a query. Put it in order.",
        items: [
          "Crawl pages and record their links",
          "Build the link matrix and repair dangling pages",
          "Iterate PageRank until the scores settle",
          "At query time, combine text relevance with PageRank to order the results",
        ],
        why: "PageRank is computed offline over the whole link graph; at query time it's one signal combined with text matching.",
      },
      {
        type: "mcq",
        q: "You need the lowest point of an expensive, noisy simulation with three continuous knobs and no gradient available. Which tool?",
        o: ["The simplex method for LP", "Golden-section search", "Nelder–Mead", "Kruskal's algorithm"],
        a: 2,
        why: "No linear structure rules out LP; three knobs rules out 1-D golden-section; no gradient rules out gradient descent. Nelder–Mead only needs comparisons.",
      },
      {
        type: "cat",
        q: "What happens to each algorithm when its key assumption is removed?",
        buckets: ["Still correct", "Can give wrong answers"],
        items: [
          ["A* with h = 0", 0],
          ["A* with h = 2 × true distance", 1],
          ["Hamming decoding with two flipped bits", 1],
          ["Kruskal with tied edge weights", 0],
          ["Golden-section on a function with two dips", 1],
        ],
        why: "h = 0 is just Dijkstra, and ties don't hurt MSTs. An overestimating heuristic, two-bit errors and a non-unimodal bracket all break the guarantee.",
      },
      {
        type: "mcq",
        q: "Which pair shares the most similar core idea?",
        o: ["Prim and Dijkstra", "Huffman and RSA", "FFT and Kruskal", "Graham scan and PageRank"],
        a: 0,
        why: "Prim adds the cheapest edge leaving the tree; Dijkstra settles the closest frontier node. Same greedy frontier pattern with a different key (edge weight vs path length).",
      },
      {
        type: "mcq",
        q: "An attention model processes 1,024 tokens. How many query–key scores does <b>one</b> attention head compute?",
        o: ["1,024", "2,048", "about 1 million (1,024²)", "about 1 billion (1,024³)"],
        a: 2,
        why: "Every token scores every token: 1,024² = <b>1,048,576</b>, the quadratic cost again.",
      },
    ],
  });
})();
