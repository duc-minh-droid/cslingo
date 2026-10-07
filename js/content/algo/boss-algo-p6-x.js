/* boss-algo-p6-x: extra Phase 6 boss questions (CRC division, Hamming syndromes, distance, matrices). New scenarios; numbers checked with node. */
(function () {
  const def = NIC.bossDef("a6-boss");
  if (!def) return;
  const mod = NIC.modules.find((m) => m.id === "a6-boss");
  const bits = (word, { pick = false } = {}) =>
    `<svg viewBox="0 0 ${word.length * 54 + 10} 86" style="max-height:90px">${[...word].map((b, i) => `<g ${pick ? `data-pick="${i + 1}"` : ""}><rect x="${8 + i * 54}" y="8" width="46" height="46" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${31 + i * 54}" y="39" text-anchor="middle" style="font:900 20px var(--mono);fill:var(--text)">${b}</text><text x="${31 + i * 54}" y="75" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--text-faint)">${i + 1}</text></g>`).join("")}</svg>`;
  def.qs.push(
    {
      type: "mcq",
      q: "A CRC uses the generator <b>1011</b> ($x^3+x+1$). The message is <b>1010</b>. Append three zeros and divide with XOR. What are the 3 check bits?",
      o: ["011", "101", "110", "001"],
      a: 0,
      hint: "Divide 1010000: line 1011 up under the leading 1 and XOR, then repeat on whatever now starts with a 1.",
      why: "1010000: XOR 1011 at the front gives 0001000; XOR again at the fourth bit gives 0000011. The remainder is <b>011</b>, so the frame sent is 1010011.",
    },
    {
      type: "pick",
      q: "Hamming(7,4) (parity at positions 1, 2, 4). The word below arrives with one flipped bit. <b>Click the flipped bit.</b>",
      fig: bits("0111001", { pick: true }),
      a: "2",
      hint: "p1 covers 1,3,5,7; p2 covers 2,3,6,7; p4 covers 4,5,6,7.",
      why: "p1: 0⊕1⊕0⊕1 = 0 holds. p2: 1⊕1⊕0⊕1 = 1 fails. p4: 1⊕0⊕0⊕1 = 0 holds. The syndrome p4 p2 p1 = 010 = <b>2</b>. The original codeword was 0011001, carrying data 1001.",
    },
    {
      type: "mcq",
      q: "What is the Hamming distance between the words 10110 and 01100?",
      o: ["1", "2", "3", "5"],
      a: 2,
      why: "Compare place by place: the first, second and fourth bits differ and the others match, so the distance is <b>3</b> (the same as the number of 1s in their XOR, 11010).",
    },
    {
      type: "multi",
      q: "A code has a minimum Hamming distance of 4 between codewords. Which statements are true? Select all that apply.",
      o: [
        "It can correct every single-bit error",
        "It can detect every two-bit error",
        "It can correct every two-bit error",
        "It can detect every pattern of four flipped bits",
      ],
      a: [0, 1],
      why: "Distance 4 corrects ⌊(4 − 1)/2⌋ = 1 error and detects up to 3 (so 2 certainly). Correcting two errors would need distance 5, and four flips can turn one codeword into another unnoticed.",
    },
    {
      type: "slider",
      q: "A Hamming(31,26) code protects blocks over a link that flips each bit with a 1% chance. About what percentage of blocks take two or more flips, which the code cannot repair?",
      min: 0,
      max: 30,
      step: 1,
      ans: 4,
      tol: 3,
      unit: "%",
      hint: "A block of 31 bits expects about 0.3 flips. Two or more in the same block is rare but not negligible.",
      why: "Chance of 0 flips is about 73% and of exactly 1 flip about 23%, leaving about <b>4%</b> for two or more.",
    },
    {
      type: "order",
      q: "Put a Hamming(7,4) receiver's steps in order.",
      items: [
        "XOR the bits of each parity group",
        "Read the failed checks as a binary number",
        "Flip the bit at that position (if it is not 0)",
        "Read the data bits from positions 3, 5, 6 and 7",
      ],
      why: "Check the groups, read the syndrome, repair, then extract the data. Extracting first would pass a corrupted data bit straight through.",
    },
    {
      type: "mcq",
      q: "Using the parity-check matrix, a receiver computes <b>H · R = [1, 1, 0]</b>, written (e1, e2, e3) with e1 the 1s place. Which position is wrong?",
      o: ["3", "4", "6", "7"],
      a: 0,
      why: "The position is e1·1 + e2·2 + e3·4 = 1 + 2 + 0 = <b>3</b>. Reading the bits the wrong way round would give 6.",
    },
    {
      type: "match",
      q: "Match each error-correcting family to its distinguishing feature.",
      pairs: [
        ["Reed-Solomon", "Works on symbols; protects CDs and QR codes"],
        ["Turbo codes", "Come close to channel capacity; used in 3G/4G"],
        ["LDPC codes", "Built on a sparse graph of bits and parity checks"],
        ["CRC", "Detects only; the remainder of a polynomial division"],
      ],
      why: "Reed-Solomon (1960) repairs damaged symbols; turbo codes (1990-91) were the first practical near-capacity codes; LDPC codes (Gallager, 1960) use a sparse bipartite graph; a CRC only detects.",
    },
    {
      type: "mcq",
      q: "Which bit string is the generator polynomial $x^5 + x^2 + 1$?",
      o: ["100101", "101001", "110001", "100011"],
      a: 0,
      why: "Powers 5, 2 and 0 are present; 4, 3 and 1 are absent. From $x^5$ down to $x^0$: 1 0 0 1 0 1.",
    },
  );
  if (mod) mod.qCount = def.qs.length;
})();
