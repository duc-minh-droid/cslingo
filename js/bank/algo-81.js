/* js/bank/algo-85.js: revision questions for Phase 8 (ported from the vault). */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a8-rsa", [
    M("Toy RSA with p = 7 and q = 11. What is n?", ["18", "60", "77"], 2, "n = p × q = 77."),
    M("With p = 7 and q = 11, what is (p−1)(q−1)?", ["60", "77", "72"], 0, "6 × 10 = 60."),
    M(
      "With (p−1)(q−1) = 60, which exponent is an acceptable e?",
      ["9", "10", "11"],
      2,
      "gcd(11, 60) = 1. 9 shares 3 with 60 and 10 shares 10.",
      { hint: "Check which numbers divide 60: 2, 3, 4, 5, 6, 10, 12 ..." },
    ),
    M(
      "Toy RSA: n = 15 (p = 3, q = 5) and e = 3. What is the ciphertext of M = 2?",
      ["6", "8", "9"],
      1,
      "2³ = 8, and 8 is below 15.",
      { hint: "2 × 2 × 2." },
    ),
    M(
      "With n = 15, e = 3 and d = 3, someone encrypts M = 17. What does decryption give back?",
      ["17", "2", "1"],
      1,
      "17 behaves like 17 − 15 = 2 modulo 15, so decrypting returns 2, not 17.",
    ),
    TF(
      "Alice can safely publish her private exponent d.",
      false,
      "Anyone with d can decrypt. Only (n, e) is published.",
    ),
    M(
      "Why does factoring n break RSA?",
      [
        "The factors give (p−1)(q−1), and hence d from e",
        "The factors are the plaintext message itself",
        "The factors replace the public key entirely",
      ],
      0,
      "d is e's inverse modulo (p−1)(q−1), which needs only p and q.",
    ),
    {
      type: "multi",
      q: "Which are needed for RSA to work? Select all.",
      o: [
        "gcd(e, (p−1)(q−1)) = 1",
        "The message M is smaller than n",
        "p and q are different primes",
        "p and q are both even",
      ],
      a: [0, 1, 2],
      why: "A coprime e gives an inverse d, M must fit below n, and p ≠ q keeps the construction sound. Two even primes would both have to be 2.",
    },
    {
      type: "cat",
      q: "Public or private in RSA?",
      buckets: ["Published", "Kept secret"],
      items: [
        ["n", 0],
        ["e", 0],
        ["d", 1],
        ["p and q", 1],
      ],
      why: "(n, e) is the public key. d, and the primes that lead to it, stay secret.",
    },
    {
      type: "order",
      q: "Order the messages when Alice sends Bob a secret with RSA.",
      items: [
        "Bob publishes (n, e)",
        "Alice computes C = Mᵉ mod n",
        "Alice sends C over the open channel",
        "Bob computes M = Cᵈ mod n",
      ],
      why: "Public key first, then encrypt, transmit, decrypt.",
    },
    {
      type: "bug",
      q: "This function should find the private exponent d (the d with e × d leaving remainder 1 modulo z). Click the faulty line.",
      code: ["def inverse(e, z):", "    for d in range(1, z):", "        if (e * d) % z == 0:", "            return d"],
      a: 2,
      why: "The remainder must be 1, not 0. A remainder of 0 just finds a multiple of z.",
    },
    M(
      "n = 2773 = 47 × 59. At most how many prime trial divisions find the smaller factor?",
      ["About 15", "About 700", "About 2,773"],
      0,
      "47 is the 15th prime, so at most 15 prime divisions. Real 2048-bit keys make this impossible.",
    ),
  ]);

  B.add("a8-bitcoin", [
    M(
      "How many satoshi is 0.0003 bitcoin?",
      ["3,000", "30,000", "300,000"],
      1,
      "0.0001 bitcoin = 10,000 satoshi, so 0.0003 is 30,000.",
      { hint: "Three lots of 10,000." },
    ),
    M(
      "Which block-header field holds the difficulty target?",
      ["bits", "nonce", "timestamp"],
      0,
      "'bits' encodes the target; the nonce is what miners vary.",
    ),
    TF(
      "The first transaction in a block pays the miner (the coinbase transaction).",
      true,
      "It creates the miner's reward.",
    ),
    M(
      "A block holds 16 transactions. How many pairing hashes sit above the 16 leaf hashes in its Merkle tree?",
      ["15", "16", "31"],
      0,
      "8 + 4 + 2 + 1 = 15.",
      { hint: "Halve each time: 8, 4, 2, 1." },
    ),
    M(
      "A block holds 5 transactions and Bitcoin duplicates the odd one out at each level. How many hashes sit above the 5 leaves?",
      ["4", "6", "9"],
      1,
      "5 leaves pair into 3 nodes (the last paired with itself), then 2, then 1: 3 + 2 + 1 = 6.",
      { hint: "Level sizes: 3, then 2, then 1." },
    ),
    {
      type: "multi",
      q: "Which are guarantees the Bitcoin blockchain aims for? Select all.",
      o: [
        "Transaction history is not amended",
        "Double spending is avoided",
        "Any payment can be reversed on request",
        "Transactions are hidden from miners",
      ],
      a: [0, 1],
      why: "Immutable history and no double spends. Payments are not reversible and miners must see them to verify.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Consensus", "Honest nodes agree on one history"],
        ["Persistence", "Buried transactions stay put"],
        ["Liveness", "Valid transactions get included"],
        ["Confirmations", "Blocks on top of a payment's block"],
      ],
      why: "The three blockchain promises plus the depth measure.",
    },
    M(
      "A transaction buried six blocks deep suddenly vanishes from the agreed chain. Which promise failed?",
      ["Consensus", "Persistence", "Liveness"],
      1,
      "Persistence says deep transactions stay.",
    ),
    {
      type: "cat",
      q: "Sort each use under its area.",
      buckets: ["Smart contracts", "Record keeping", "Digital currency", "Securities"],
      items: [
        ["Escrow", 0],
        ["Supply chain tracking", 1],
        ["Cross-border remittance", 2],
        ["Crowdfunding shares", 3],
      ],
      why: "Four areas from the lecture's wheel of possible uses.",
    },
    {
      type: "order",
      q: "Order a Bitcoin payment from start to history.",
      items: [
        "The wallet makes an address",
        "The sender enters your address and an amount",
        "The transaction is broadcast to the network",
        "Miners verify it and put it in a block",
        "The block joins the chain",
      ],
      why: "Address, request, broadcast, verification, then inclusion.",
    },
    M(
      "In 'Bitcoin' versus 'bitcoins', what does the capital B mean?",
      [
        "The protocol, software and community",
        "The smallest unit of value, one satoshi",
        "The largest allowed block size in bytes",
      ],
      0,
      "Lower-case bitcoins are the units.",
    ),
    TF(
      "Using Bitcoin requires a bank account to hold the ledger.",
      false,
      "The ledger is kept by the miners and nodes; a wallet holds keys.",
    ),
  ]);
})();
