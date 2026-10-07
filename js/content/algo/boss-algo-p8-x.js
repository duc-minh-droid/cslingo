/* boss-algo-p8-x: extra boss questions for Phase 8 (ported from the vault). */
(function () {
  const B = NIC.bossDef("a8-boss");
  if (!B) return;
  const blocks = [
    ["Block 1", "-", "a3f1"],
    ["Block 2", "a3f1", "5c20"],
    ["Block 3", "5c02", "e817"],
    ["Block 4", "e817", "09bd"],
  ];
  const chainFig = `<svg viewBox="0 0 520 110" style="max-height:120px">${blocks.map(([n, prev, h], i) => `<g data-pick="b${i + 1}"><rect x="${6 + i * 128}" y="8" width="116" height="92" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${64 + i * 128}" y="30" text-anchor="middle" style="font:900 14px var(--sans);fill:var(--ink)">${n}</text><text x="${64 + i * 128}" y="56" text-anchor="middle" style="font:700 12px ui-monospace,monospace;fill:var(--text-dim)">prev ${prev}</text><text x="${64 + i * 128}" y="80" text-anchor="middle" style="font:700 12px ui-monospace,monospace;fill:var(--text-dim)">hash ${h}</text></g>`).join("")}</svg>`;
  B.qs.push(
    {
      type: "mcq",
      q: "A message was encrypted with a shift cipher using key 4, and the ciphertext reads <b>GSHI</b>. What was the plaintext?",
      o: ["CODE", "KWLM", "CAKE"],
      a: 0,
      hint: "Slide each letter back 4: G, F, E, D, C.",
      why: "Decrypting slides each letter back by 4: G→C, S→O, H→D, I→E, giving <b>CODE</b>. KWLM is what you get by sliding forwards instead.",
    },
    {
      type: "cat",
      q: "Sort each description under the kind of cipher it fits.",
      buckets: ["Symmetric", "Public-key"],
      items: [
        ["One secret key shared by both sides", 0],
        ["A pair of keys, one of them published", 1],
        ["Fast enough for bulk data such as video", 0],
        ["Needs only n key pairs for n people", 1],
        ["Needs n(n−1)/2 shared keys for n people", 0],
        ["Anyone can lock a message for you", 1],
      ],
      why: "Symmetric ciphers (DES, AES) are quick but need a shared key per pair. Public-key schemes (RSA, Diffie-Hellman) trade speed for a published half.",
    },
    {
      type: "mcq",
      q: "Toy RSA with p = 5 and q = 13, so n = 65 and (p−1)(q−1) = 48. The public exponent is e = 5. Which private exponent d satisfies (5 × d) mod 48 = 1?",
      o: ["5", "19", "29"],
      a: 2,
      hint: "5 × 29 = 145, and 145 = 3 × 48 + 1.",
      why: "5 × 29 = 145 = 144 + 1, so <b>d = 29</b>. Check 5 × 19 = 95, which leaves 47, not 1.",
    },
    {
      type: "order",
      q: "Put the steps of RSA key generation in order.",
      items: [
        "Choose two large primes p and q",
        "Compute n = p × q and (p−1)(q−1)",
        "Pick e sharing no factor with (p−1)(q−1)",
        "Find d with e × d leaving remainder 1",
        "Publish (n, e) and keep d secret",
      ],
      why: "Everything downstream depends on the primes. e needs the (p−1)(q−1) value, d needs both e and that value, and only the public pair is released.",
    },
    {
      type: "mcq",
      q: "A network raises the proof-of-work requirement from 3 to 5 leading hex zeros. About how many times more hashing does a miner need on average?",
      o: ["About 2 times", "About 256 times", "About 10 times"],
      a: 1,
      hint: "Each extra zero is a factor of 16, and two extra zeros is 16 × 16.",
      why: "Each hex zero is a 1-in-16 event, so two more zeros multiplies the average work by 16 × 16 = <b>256</b>.",
    },
    {
      type: "pick",
      q: "This four-block chain has been tampered with somewhere. Click the first block whose stored <b>prev</b> does not match the hash of the block before it.",
      fig: chainFig,
      a: "b3",
      why: "Block 2's hash is 5c20, but block 3 stores 5c02, so the link breaks at <b>block 3</b>. Blocks 2 and 4 match their predecessors.",
    },
    {
      type: "mcq",
      q: "A fork splits the network. Branch X reaches 108 blocks and branch Y reaches 106. What happens to a payment that appears only in branch Y?",
      o: [
        "It goes back to the waiting pool, unless X holds it",
        "It stays confirmed because Y was found first",
        "It is split between both branches",
      ],
      a: 0,
      why: "Nodes follow the longest valid chain, so branch Y's blocks are orphaned and their transactions go back to be mined again (unless X already contains them).",
    },
    {
      type: "slider",
      q: "Change a single character of the input to SHA-256. On average, about how many of the 256 output bits change?",
      min: 0,
      max: 256,
      step: 8,
      ans: 128,
      tol: 24,
      unit: " bits",
      why: "A good hash flips each output bit with probability 1/2 (the avalanche property), so about <b>128</b> of 256.",
    },
  );
})();
