/* js/bank/algo-89.js: revision questions for a10-uses, a10-decoder, a10-attn (Phases 9 and 10), ported from the vault. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M } = partScope;
  const B = NIC.bank;

  B.add("a10-uses", [
    M(
      "A Vision Transformer treats an image as…",
      ["a sequence of patch tokens", "a list of colours", "one huge token", "a sentence of letters"],
      0,
      "Each patch is one token.",
    ),
    M(
      "A 224 × 224 image is cut into 32 × 32 patches. The number of tokens is…",
      ["49", "7", "196", "1,024"],
      0,
      "7 × 7 = 49.",
    ),
    M(
      "A 64 × 64 image is cut into 8 × 8 patches. The attention score matrix has how many entries?",
      ["4,096", "64", "512", "256"],
      0,
      "64 patches, 64² = 4,096.",
    ),
    M(
      "Which family suits translating a sentence?",
      ["Encoder plus decoder", "Encoder only", "Neither", "A decoder with no input"],
      0,
      "Read one sequence, write another.",
    ),
    M(
      "Which family suits sorting emails into topics?",
      ["Encoder only", "Decoder only", "Both are always needed", "Neither"],
      0,
      "Understanding, not generating.",
    ),
    M(
      "Halving the patch side (16 to 8) multiplies the attention work by about…",
      ["16", "4", "2", "8"],
      0,
      "4× tokens, 16× pairs.",
    ),
    M(
      "Sound can be fed to a transformer by…",
      [
        "cutting a spectrogram (made with FFTs) into frames",
        "writing it out as plain text and nothing else",
        "ignoring all of its frequency content",
        "sampling it below half the sampling rate",
      ],
      0,
      "A spectrogram stacks the spectra of consecutive slices.",
    ),
    {
      type: "cat",
      q: "Sort each task by the field it belongs to.",
      buckets: ["Language", "Vision"],
      items: [
        ["Translation", 0],
        ["Object detection", 1],
        ["Summarisation", 0],
        ["Image generation", 1],
      ],
      why: "Both fields use the same transformer machinery.",
    },
    M(
      "Why are very long documents expensive for attention?",
      [
        "Cost grows with the square of the number of tokens",
        "The tokenizer slows down on long documents",
        "Softmax cannot handle very long lists of scores",
        "The embeddings get bigger as the text grows",
      ],
      0,
      "Every token scores every other token.",
    ),
    M(
      "A model like T5 or mT5 is used for…",
      ["text-to-text tasks", "audio only", "sorting numbers", "image compression"],
      0,
      "Translation, summarisation and similar.",
    ),
  ]);

  B.add("a10-decoder", [
    M(
      "A decoder is needed when the model must…",
      ["generate new text", "classify a sentence", "count tokens", "measure similarity"],
      0,
      "Translation, summarisation, dialogue and code generation.",
    ),
    M(
      "The decoder starts generation from the token…",
      ["<sos>", "<eos>", "the last word of the input", "a random word"],
      0,
      "Start of sequence.",
    ),
    M(
      "Generation stops when the model produces…",
      ["<eos>", "<sos>", "a full stop", "a token with probability 1"],
      0,
      "End of sequence.",
    ),
    M(
      "Masked self-attention stops a position from seeing…",
      ["later positions", "itself", "earlier positions", "the encoder"],
      0,
      "The future does not exist yet when generating.",
    ),
    M(
      "A sentence has 5 tokens. How many cells of its 5 × 5 score matrix does the causal mask block?",
      ["10", "5", "15", "20"],
      0,
      "4 + 3 + 2 + 1 = 10.",
    ),
    M(
      "In cross-attention, the keys and values come from…",
      ["the encoder's output", "the decoder's previous words", "the positional encoding", "the softmax"],
      0,
      "Queries from the decoder, keys and values from the encoder.",
    ),
    M(
      "The final linear layer produces one score per…",
      ["word in the vocabulary", "position in the sentence", "head", "layer"],
      0,
      "Then softmax makes probabilities.",
    ),
    M(
      "Raising the temperature makes the next-word distribution…",
      [
        "flatter, so unlikely words appear more often",
        "sharper, so the top word always wins",
        "identical to a random guess only at T = 0",
        "unchanged",
      ],
      0,
      "Scores are divided by T.",
    ),
    M(
      "A model writes 7 tokens before <eos>. Including <eos>, how many prediction steps were run?",
      ["8", "7", "6", "1"],
      0,
      "Seven tokens plus <eos>.",
    ),
    {
      type: "order",
      q: "Put the steps of one generation round in order.",
      items: [
        "Feed the output so far into the decoder",
        "Apply masked attention (and cross-attention)",
        "Turn the last vector into probabilities over the vocabulary",
        "Pick a word and append it",
      ],
      why: "Feed, attend, softmax, pick.",
    },
    {
      type: "cat",
      q: "Which sublayer takes which source?",
      buckets: ["Decoder's own words", "Encoder's output"],
      items: [
        ["Masked self-attention", 0],
        ["Keys in cross-attention", 1],
        ["Values in cross-attention", 1],
        ["Queries in masked self-attention", 0],
      ],
      why: "Self-attention looks at the output so far; cross-attention reads the input sentence.",
    },
  ]);

  B.add("a10-attn", [
    M("Keys have d_k = 100. Raw scores are divided by…", ["10", "100", "50", "1"], 0, "√100 = 10."),
    M(
      'In self-attention, the word "it" can attend to…',
      [
        "every token in the sentence, including itself",
        "only the tokens that come before it",
        "only the nouns in the sentence",
        "only the very first token in it",
      ],
      0,
      "Without a mask, every position scores every position.",
    ),
    M(
      "A contextual embedding for a word is…",
      [
        "a vector rebuilt from the words it attends to",
        "the raw lookup vector for the word itself",
        "the number giving the word's position",
        "a copy of the single highest-scoring key",
      ],
      0,
      "The weighted sum of values.",
    ),
  ]);
})();
