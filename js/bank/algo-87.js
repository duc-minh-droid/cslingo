/* js/bank/algo-92.js: revision questions for a10-qkv, a10-heads, a10-recap (Phases 9 and 10), ported from the vault. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M } = partScope;
  const B = NIC.bank;

  B.add("a10-qkv", [
    M(
      "In the library analogy, the key is…",
      [
        "the label on a book's spine that the search is matched to",
        "the words you type into the search box to look",
        "the contents of the book that you finally read",
        "the librarian who fetches the book for you",
      ],
      0,
      "Query = search words, key = label, value = contents.",
    ),
    M(
      "The score between a query and a key is…",
      [
        "their dot product",
        "the distance between the words in the sentence",
        "the sum of their lengths",
        "the larger of the two vectors",
      ],
      0,
      "Large when the vectors point the same way.",
    ),
    M("q = [1, 3] and k = [3, −1]. The dot product q·k is…", ["0", "6", "−3", "10"], 0, "3 − 3 = 0: perpendicular."),
    M(
      "How many learned weight matrices turn a token's embedding into its query, key and value?",
      ["three", "one", "two", "four"],
      0,
      "W_Q, W_K and W_V.",
    ),
    M(
      "The attention weights for a token are [0.1, 0.7, 0.2]. Its output vector is…",
      ["0.1·v₁ + 0.7·v₂ + 0.2·v₃", "v₂ only", "the average of the three keys", "q + k₂"],
      0,
      "A weighted blend of all values.",
    ),
    M("The attention score matrix for 12 tokens has how many entries?", ["144", "12", "24", "1,728"], 0, "12 × 12."),
    M(
      "In self-attention, the queries, keys and values come from…",
      ["the same sequence", "three different documents", "the decoder only", "a random vector"],
      0,
      "Self means one sequence looks at itself.",
    ),
    M(
      "Which shapes are right for T tokens with d_k = d_v = 64?",
      [
        "Q, K, V are T × 64; scores are T × T",
        "Q is T × T; scores are T × 64",
        "Everything is 64 × 64",
        "scores are T × 1",
      ],
      0,
      "QKᵀ is T × T.",
    ),
    {
      type: "match",
      q: "Match each part of attention to its role.",
      pairs: [
        ["Query", "what this token is looking for"],
        ["Key", "what this token advertises it contains"],
        ["Value", "what it hands over if chosen"],
        ["Softmax", "turns scores into weights adding to 1"],
      ],
      why: "These four make up one attention step.",
    },
    {
      type: "order",
      q: "Put the steps of scaled dot-product attention for one token in order.",
      items: [
        "Score the query against every key",
        "Divide the scores by √d_k",
        "Apply softmax",
        "Add up the values weighted by the softmax",
      ],
      why: "Score, scale, softmax, blend.",
    },
    M(
      "The output of attention for a token is called a contextual embedding because…",
      [
        "it is rebuilt from the tokens it attended to",
        "it contains the context length",
        "it is always the same for a given word",
        "it contains only the word itself",
      ],
      0,
      "The vector depends on the surrounding words.",
    ),
  ]);

  B.add("a10-heads", [
    M("d_model = 512 and 8 heads. The size of each head, d_h, is…", ["64", "8", "512", "4,096"], 0, "512 / 8 = 64."),
    M(
      "8 heads each output T × 64. After concatenation the shape is…",
      ["T × 512", "T × 64", "8T × 64", "T × 8"],
      0,
      "8 × 64 = 512 columns.",
    ),
    M(
      "Why use several heads?",
      [
        "Different heads can capture different relationships at once",
        "To make the softmax step unnecessary altogether",
        "To remove the need for the feed-forward network",
        "To reduce the length of the sentence being read",
      ],
      0,
      "Each head has its own projections.",
    ),
    M(
      "Going from 1 head to 8 heads with d_model fixed changes the number of attention parameters by…",
      ["no change", "a factor of 8", "a factor of 64", "a factor of 1/8"],
      0,
      "The heads divide d_model between them.",
    ),
    M(
      "What is the job of W_O after the concatenation?",
      [
        "It mixes the heads' outputs together",
        "It adds the position to each head's output",
        "It masks future tokens in each head",
        "It normalises the layer's output vectors",
      ],
      0,
      "A final linear layer.",
    ),
    M(
      "Averaging the attention maps of all heads would…",
      [
        "blur together the sharp patterns each head found",
        "make every head identical to all the others",
        "remove the softmax from each of the heads",
        "double the number of tokens in the input",
      ],
      0,
      "Concatenate and mix instead.",
    ),
    M(
      "d_model = 64 and 4 heads. Each head's query vector has how many numbers?",
      ["16", "4", "64", "256"],
      0,
      "64 / 4 = 16.",
    ),
    {
      type: "cat",
      q: "Which statements describe one head, and which the whole multi-head layer?",
      buckets: ["One head", "The whole layer"],
      items: [
        ["Has its own W_Q, W_K, W_V", 0],
        ["Produces a T × d_h output", 0],
        ["Concatenates all head outputs", 1],
        ["Applies W_O to mix heads", 1],
      ],
      why: "Heads work separately; the layer joins them.",
    },
    M(
      "Each head's attention score matrix for T tokens has shape…",
      ["T × T", "T × d_h", "d_h × d_h", "h × T"],
      0,
      "Every token against every token.",
    ),
    M(
      'A heat-map shows one head linking "it" to "animal". The safest conclusion is…',
      [
        "information flowed from animal to it there; it is not proof",
        "the model has fully understood the whole sentence",
        "all the other heads must agree with it",
        "the mask has failed and leaked the future",
      ],
      0,
      "Attention is suggestive, not an explanation.",
    ),
    {
      type: "slider",
      q: "d_model = 512 and 16 heads. How many numbers does each head's key vector have?",
      min: 0,
      max: 128,
      step: 4,
      ans: 32,
      tol: 8,
      unit: "",
      hint: "512 / 16.",
      why: "512 / 16 = 32.",
    },
  ]);

  B.add("a10-recap", [
    M(
      "LZW with A = 0, B = 1 on A B A B A B A B A outputs…",
      ["0, 1, 2, 4, 3", "0, 1, 0, 1, 0", "0, 1, 2, 3, 4", "1, 0, 3, 2, 4"],
      0,
      "The dictionary learns AB, BA, ABA, ABAB as it goes.",
    ),
    M(
      "Hamming (7,4) with data bits 0 0 1 1: the parity bit p1 = d1 ⊕ d2 ⊕ d4 is…",
      ["1", "0", "2", "undefined"],
      0,
      "0 ⊕ 0 ⊕ 1 = 1.",
    ),
    M(
      "The 7-bit Hamming word for data 0011 is…",
      ["1000011", "0011000", "1111111", "0000011"],
      0,
      "p1 p2 d1 p3 d2 d3 d4 = 1 0 0 0 0 1 1.",
    ),
    M(
      "In RSA with n = 2773 and private key d = 157, a ciphertext of 587 decrypts to…",
      ["31", "587", "157", "2773"],
      0,
      "587^157 mod 2773 = 31.",
    ),
    M(
      "In a blockchain, altering one old record…",
      ["changes every later hash", "changes only that record's hash", "has no effect", "deletes the chain"],
      0,
      "Each record includes the previous hash.",
    ),
    M(
      "Which theme do Fourier transforms and the FFT belong to?",
      [
        "Time-frequency conversion",
        "Graph algorithms and PageRank",
        "Encryption and error correction",
        "Optimisation methods",
      ],
      0,
      "They convert between time and frequency domains.",
    ),
    M(
      "Which pairs a job with the right algorithm?",
      [
        "Wrap a set of points: Graham scan",
        "Rank web pages: Huffman coding",
        "Correct one flipped bit: Dijkstra",
        "Split a signal into frequencies: PageRank",
      ],
      0,
      "Graham scan builds convex hulls.",
    ),
    M(
      "The exam has 4 questions of 25 marks each. The total is…",
      ["100 marks", "60 marks", "25 marks", "200 marks"],
      0,
      "4 × 25 = 100.",
    ),
    {
      type: "match",
      q: "Match each algorithm to its problem.",
      pairs: [
        ["Huffman / LZW", "lossless compression"],
        ["CRC", "detecting corrupted data"],
        ["Hamming (7,4)", "correcting a single bit error"],
        ["RSA", "public-key encryption"],
      ],
      why: "Compression, detection, correction, encryption.",
    },
    M(
      "Which optimisation methods does the course list?",
      [
        "Bracketing, Nelder-Mead, simplex and Kalman filtering",
        "Only bubble sort, merge sort and quicksort",
        "Only RSA, AES and the SHA hash family",
        "Huffman coding, LZW and run-length coding",
      ],
      0,
      "These form the optimisation theme.",
    ),
  ]);
})();
