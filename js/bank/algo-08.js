(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;

  /* ---------- Phase 10 ---------- */
  B.add("a10-attn", [
    M(
      "In attention, how is the relevance score between two tokens computed?",
      [
        "The distance between their positions in the sentence",
        "One token's query dotted with the other's key",
        "The product of their lengths",
        "A learned random number",
      ],
      1,
      "q · k (then scaled).",
    ),
    M(
      "After softmax, a token's attention weights…",
      ["are all exactly equal", "are positive and sum to 1", "can be negative", "sum to N"],
      1,
      "A share of attention.",
    ),
    M(
      "A token's attention output is…",
      [
        "the key with the highest score",
        "a weighted sum of the value vectors",
        "the query vector itself",
        "the largest raw score",
      ],
      1,
      "A blend, not a single pick.",
    ),
    TF("Attention's cost grows linearly with sequence length.", false, "Every token scores every token: quadratic."),
    M(
      "The causal mask stops each token from attending to…",
      ["itself", "earlier tokens", "later (future) tokens", "all other tokens"],
      2,
      "No peeking ahead when generating.",
    ),
    M(
      '"Self"-attention means…',
      [
        "a token only attends to itself, never to others",
        "Q, K and V all come from one sequence",
        "the model trains itself without data",
        "the model uses a single head only",
      ],
      1,
      "The sequence attends to itself.",
    ),
    M(
      "Scores [3, 1] after softmax give the first token roughly…",
      ["0.5", "0.75", "0.88", "1.0"],
      2,
      "e³ / (e³ + e¹) = 1 / (1 + e⁻²) ≈ 0.88.",
      { hint: "Only the difference (2) matters, and e² ≈ 7.4." },
    ),
    M(
      "An embedding is…",
      [
        "a compression format for storing text",
        "a learned vector representing a token",
        "a mask over future tokens",
        "the output of softmax",
      ],
      1,
      "Tokens become points in a vector space.",
    ),
  ]);
})();
