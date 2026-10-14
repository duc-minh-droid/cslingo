(function () {
  const partScope = (NIC.shared.bossAlgo = NIC.shared.bossAlgo || {});
  const { boss, maskGrid } = partScope;

  /* ================= Phase 10 ================= */
  boss(10, {
    blurb: "Eight questions: new softmax numbers, masks, scaling, and what attention can't tell you.",
    lede: "New scores and a new sentence. Softmax only needs e ≈ 2.718 and a feel for the sizes.",
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
        o: ["They all shrink", "They stay exactly the same", "The first becomes 0", "They become equal to each other"],
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
})();
