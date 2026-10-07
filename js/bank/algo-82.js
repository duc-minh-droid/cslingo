/* js/bank/algo-86.js: revision questions for Phase 8 (ported from the vault). */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a8-pow", [
    M(
      "A block needs 2 leading hex zeros. About how many hashes on average?",
      ["32", "256", "65,536"],
      1,
      "16 × 16 = 256.",
    ),
    M(
      "A miner does 100 hashes per second and needs 2 leading hex zeros (about 256 tries). Roughly how long on average?",
      ["About 3 seconds", "About 3 minutes", "About 3 hours"],
      0,
      "256 / 100 is about 2.5 to 3 seconds.",
    ),
    TF(
      "Checking a proof of work takes roughly as long as finding it.",
      false,
      "Finding takes huge numbers of hashes; checking takes one.",
    ),
    M(
      "Two competing chains exist. Which one do nodes follow?",
      ["The one seen first", "The longest valid one", "The one with the most transactions"],
      1,
      "Longest valid chain wins; that is how forks resolve.",
    ),
    {
      type: "multi",
      q: "Which are benefits of proof of work? Select all.",
      o: [
        "Limits the rate of new blocks",
        "Makes adding invalid blocks very costly",
        "Gives a rule for choosing between competing chains",
        "Encrypts the transactions",
      ],
      a: [0, 1, 2],
      why: "Work throttles, deters and arbitrates. It does not encrypt anything.",
    },
    M(
      "What is a '51% attack'?",
      [
        "A group with most of the mining power",
        "Hackers steal over half of all the wallets",
        "Over half of all blocks fail validation",
      ],
      0,
      "With most of the hashing power an attacker's chain wins eventually.",
    ),
    M(
      "Why do sellers wait for several confirmations?",
      [
        "Each extra block makes a rewrite much harder",
        "The first block is always rejected by miners",
        "Miners are slow to be paid for their work",
      ],
      0,
      "A minority attacker's chance of catching up falls steeply with depth.",
    ),
    {
      type: "slider",
      q: "A new block appears about every 10 minutes. About how long does it take for a payment to receive 6 confirmations?",
      min: 0,
      max: 120,
      step: 5,
      ans: 60,
      tol: 15,
      unit: " min",
      why: "6 blocks × 10 minutes = about an hour.",
    },
    {
      type: "cat",
      q: "Benefit or cost of proof of work?",
      buckets: ["Benefit", "Cost"],
      items: [
        ["Forging history is expensive", 0],
        ["Uses a great deal of electricity", 1],
        ["Rate of new blocks is limited", 0],
        ["Few transactions confirmed per second", 1],
      ],
      why: "The same work that protects the chain also burns energy and slows it.",
    },
    {
      type: "order",
      q: "Order the mining loop.",
      items: [
        "Collect transactions into a block",
        "Hash the block header",
        "Check whether the hash starts with enough zeros",
        "If not, change the nonce and hash again",
        "If yes, broadcast the block",
      ],
      why: "Trial and error on the nonce until the target is met.",
    },
    M(
      "What happens to an orphaned block?",
      [
        "Its transactions go back to the waiting pool",
        "It is merged into the longest chain afterwards",
        "It is mined again with exactly the same nonce",
      ],
      0,
      "Its branch is abandoned, so its payments must be confirmed again.",
    ),
    TF(
      "Requiring more leading zeros makes mining faster.",
      false,
      "Each extra zero makes success rarer, so mining takes longer.",
    ),
  ]);

  B.add("a8-hash", [
    M(
      "How many hex digits does a SHA-256 digest have?",
      ["32", "64", "256"],
      1,
      "256 bits is 64 hex digits (4 bits each).",
    ),
    TF(
      "Hashing a message with SHA-256 lets you recover it later with the right key.",
      false,
      "A hash has no key and no inverse. Encryption is the reversible one.",
    ),
    {
      type: "slider",
      q: "A good 32-bit hash is fed two inputs one character apart. About how many output bits differ?",
      min: 0,
      max: 32,
      step: 2,
      ans: 16,
      tol: 6,
      unit: " bits",
      why: "Each bit flips with probability 1/2.",
    },
    {
      type: "cat",
      q: "Hash or encryption?",
      buckets: ["Hash", "Encryption"],
      items: [
        ["No key", 0],
        ["Can be reversed with the key", 1],
        ["Fixed-length output", 0],
        ["Used to fingerprint a download", 0],
      ],
      why: "A hash fingerprints; encryption hides and can be undone.",
    },
    {
      type: "order",
      q: "Order what a forger must do after editing block 1 of a four-block chain.",
      items: [
        "Edit block 1's data",
        "Recompute block 1's hash",
        "Update block 2's stored prev, which changes block 2's hash",
        "Update block 3's stored prev, and so on to the tip",
      ],
      why: "The change cascades to every later block.",
    },
  ]);

  B.add("a8-keys", [
    M(
      "Diffie-Hellman with p = 13, g = 2. Alice's secret is a = 5 and she sends A = 6; Bob's secret is b = 2 and he sends B = 4. What shared secret do both reach?",
      ["4", "6", "10"],
      2,
      "Alice: 4⁵ = 1024 and 1024 = 78 × 13 + 10. Bob: 6² = 36 = 2 × 13 + 10.",
      { hint: "13 × 78 = 1014." },
    ),
    TF(
      "Diffie-Hellman proves who you are talking to.",
      false,
      "It agrees a key only; authentication needs certificates or signatures.",
    ),
    {
      type: "cat",
      q: "Public or private in Diffie-Hellman?",
      buckets: ["Seen by Eve", "Never sent"],
      items: [
        ["The prime p", 0],
        ["The base g", 0],
        ["Alice's A = gᵃ mod p", 0],
        ["Alice's secret a", 1],
        ["The shared secret gᵃᵇ", 1],
      ],
      why: "Only the exchanged values are visible; the secrets stay at home.",
    },
    {
      type: "order",
      q: "Order the Diffie-Hellman exchange.",
      items: [
        "Agree a public prime p and base g",
        "Each side picks a private number",
        "Each sends g to the power of their secret, mod p",
        "Each raises the received value to their own secret",
      ],
      why: "Both then hold gᵃᵇ mod p.",
    },
  ]);
})();
