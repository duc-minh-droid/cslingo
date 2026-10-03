(function () {
  const B = NIC.bank;

  /* Graham: which point comes first in angle order */
  const pts = [
    ["a", 280, 150],
    ["b", 240, 70],
    ["c", 150, 30],
    ["d", 50, 100],
    ["e", 200, 140],
  ];
  const firstFig = `<svg class="fig" viewBox="0 0 320 190" style="max-height:200px"><line x1="150" y1="170" x2="310" y2="170" stroke="var(--line-2)" stroke-dasharray="4 4"/><text x="312" y="174" class="fig-sub">0°</text><circle cx="150" cy="170" r="8" fill="var(--amber)"/><text x="130" y="186" class="fig-sub">anchor</text>${pts
    .map(
      ([k, x, y]) =>
        `<circle data-pick="${k}" cx="${x}" cy="${y}" r="9" fill="var(--violet)"/><text x="${x + 12}" y="${y - 8}" class="fig-sub">${k}</text>`,
    )
    .join("")}</svg>`;

  /* CRC: even-parity frames */
  const frames = ["10110100", "01101110", "11001100", "00111011", "11111111"];
  const frameFig = `<svg class="fig" viewBox="0 0 300 ${frames.length * 34 + 6}" style="max-height:220px">${frames
    .map(
      (f, i) =>
        `<rect data-pick="f${i + 1}" x="10" y="${i * 34 + 4}" width="280" height="28" rx="8" fill="var(--panel-2)" stroke="var(--line)"/><text x="24" y="${i * 34 + 23}" class="fig-sub">frame ${i + 1}</text><text x="130" y="${i * 34 + 23}" class="fig-sub mono" style="letter-spacing:4px">${f}</text>`,
    )
    .join("")}</svg>`;

  B.add("a5-graham", [
    {
      type: "pick",
      q: "Graham scan sorts the other points by the angle they make with the anchor, measured counter-clockwise from the dashed horizontal line pointing right. Click the point that comes FIRST in that sorted order.",
      fig: firstFig,
      a: "a",
      hint: "Ignore distance. Which point is seen at the smallest angle above the dashed line?",
      why: "Point a is only a little above the horizontal from the anchor, so it has the smallest angle and is scanned first. Point e is the closest to the anchor but its angle is bigger, and distance does not decide the order unless two points share an angle. After a come e, b, c and d as the sweep turns counter-clockwise.",
    },
    {
      type: "order",
      q: "Put the stages of Graham scan in order.",
      items: [
        "Find the lowest point and make it the anchor",
        "Sort the other points by angle around the anchor",
        "Push the anchor and the first sorted point",
        "For each later point, pop while the top two plus it do not turn left",
        "Push the new point and move to the next one",
      ],
      hint: "The sort needs an anchor, and the stack needs a sorted list.",
      why: "The anchor comes first because the angles are measured round it. The sort must finish before the scan, since the scan trusts the order. Inside the scan, the pops (removing dents) come before the push of each new point.",
    },
    {
      type: "bug",
      q: "This sketch should give Graham scan's starting order, but the stack ends up holding a wiggly path that is not the hull. Click the faulty line.",
      code: [
        "def graham(points):",
        "    p0 = min(points, key=lambda p: (p.y, p.x))",
        "    rest = [p for p in points if p != p0]",
        "    rest.sort(key=lambda p: distance(p0, p))",
        "    stack = [p0, rest[0]]",
        "    for p in rest[1:]:",
        "        while len(stack) > 1 and not left_turn(stack[-2], stack[-1], p):",
        "            stack.pop()",
        "        stack.append(p)",
        "    return stack",
      ],
      a: 3,
      hint: "Hull corners must come up in boundary order. What order does that need?",
      why: "Sorting by distance from the anchor mixes up the boundary order, so the scan walks in and out instead of round the edge. The sort key must be the angle round the anchor. Everything else is correct: the lowest point is a safe anchor, and the loop pops until the turn is a left turn.",
    },
    {
      type: "cat",
      q: "The stack's top two points are A then B, and the new point is C. Sort each case by what Graham scan does next. Work out the sign of (B − A) × (C − A) = bx·cy − by·cx, measured from A.",
      buckets: ["Pop B first", "Keep B and push C"],
      items: [
        ["A (0, 0), B (2, 1), C (4, 2)", 0],
        ["A (0, 0), B (2, 2), C (4, 1)", 0],
        ["A (0, 0), B (2, 0), C (3, 2)", 1],
        ["A (0, 0), B (1, 3), C (−1, 5)", 1],
      ],
      hint: "Positive means a left turn, zero a straight line, negative a right turn. For the first: 2×2 − 1×4 = 0.",
      why: "The values are 2×2 − 1×4 = 0 (straight, so pop), 2×1 − 2×4 = −6 (right turn, pop), 2×2 − 0×3 = 4 (left, keep) and 1×5 − 3×(−1) = 8 (left, keep). Anything that is not a strict left turn makes B a dent or a flat point, so it goes.",
    },
    {
      type: "slider",
      q: "A scan runs on 12 points. Four of them end up as the hull corners and the other eight sit inside. Every point is pushed exactly once. How many pops happen in total over the whole scan?",
      min: 0,
      max: 16,
      step: 1,
      start: 0,
      ans: 8,
      tol: 0.5,
      unit: " pops",
      hint: "Each point is pushed once. It either stays on the stack at the end or was popped exactly once.",
      why: "Every point is pushed once. The four hull corners stay on the stack, and each of the eight inside points must have been popped, once each. So 8 pops. This also shows the scan does at most 2n stack operations.",
    },
    {
      type: "match",
      q: "Match each stage of Graham scan to its cost.",
      pairs: [
        ["Finding the lowest point", "One look at each point: O(n)"],
        ["Sorting by angle", "The slowest stage: O(n log n)"],
        ["All the pops in the scan", "At most one per point: O(n) in total"],
        ["The whole algorithm", "Sort plus scan: O(n log n)"],
      ],
      hint: "Add the costs: the biggest one wins.",
      why: "Finding the minimum is a single pass. Sorting costs n log n. The scan is linear because a point is popped at most once. Linear plus n log n plus linear is dominated by the sort, so the whole algorithm is O(n log n).",
    },
  ]);

  B.add("a6-crc", [
    {
      type: "pick",
      q: "A link uses even parity: each 8-bit frame, including its parity bit, should hold an even number of 1s. Click every frame the receiver accepts.",
      fig: frameFig,
      a: ["f1", "f3", "f5"],
      hint: "Count the 1s in each frame. Even is accepted, odd is rejected.",
      why: "Frames 1, 3 and 5 have 4, 4 and 8 ones, all even, so they are accepted. Frames 2 and 4 each have 5 ones, so they are rejected. Acceptance does not prove a frame is clean: two flipped bits would still pass.",
    },
    {
      type: "order",
      q: "Put one pass of CRC long division in order.",
      items: [
        "Line the generator up under the leading 1 of the working bits",
        "XOR the generator with the bits above it",
        "Bring down the next bits until a leading 1 appears",
        "Repeat while at least as many bits remain as the generator has",
        "What is left is the remainder",
      ],
      hint: "You cannot XOR until the generator is lined up, and you stop when too few bits remain.",
      why: "Each round lines up, XORs, then brings down bits to reach the next leading 1. The division stops when fewer bits remain than the generator, and those leftover bits are the remainder that gets appended to the message.",
    },
    {
      type: "bug",
      q: "This receiver should accept a frame only when its number of 1s is even, since the sender used even parity. It accepts every single-bit error and rejects good frames. Click the faulty line.",
      code: [
        "def frame_ok(bits):",
        "    ones = 0",
        "    for b in bits:",
        "        ones += b",
        "    return ones % 2 == 1",
      ],
      a: 4,
      hint: "What is ones % 2 for a good, even frame?",
      why: "A good frame has an even count, so ones % 2 is 0, not 1. The test is the wrong way round, so it accepts exactly the frames with one flipped bit and rejects the good ones. The counting loop is fine.",
    },
    {
      type: "slider",
      q: "A sender adds one even-parity bit to each 7-bit character. About what percentage of the transmitted bits is parity?",
      min: 0,
      max: 50,
      step: 2.5,
      start: 0,
      ans: 12.5,
      tol: 3,
      unit: "%",
      hint: "Each character sends 7 + 1 = 8 bits. What is 1 out of 8?",
      why: "One bit in every 8 is parity, which is 1/8 = 12.5%. A CRC with a longer remainder costs more per frame, but spread over a big frame the share is far smaller.",
    },
    {
      type: "cat",
      q: "Sort each description by the scheme it fits.",
      buckets: ["Parity bit only", "CRC only", "Both", "Neither"],
      items: [
        ["Counts the 1s in the frame", 0],
        ["Sends the remainder of an XOR long division", 1],
        ["Always catches a single flipped bit", 2],
        ["Fixes the flipped bit on its own", 3],
        ["Guaranteed to stop a forger who edits the data", 3],
      ],
      hint: "Both only detect random errors. Neither corrects, and neither is secure against a person.",
      why: "Parity is a count, and CRC is a division. Both always catch a single flipped bit. Neither can say which bit flipped, so neither corrects. A forger can recompute either one, so neither gives security. That needs a cryptographic hash or MAC.",
    },
    {
      type: "match",
      q: "CRC long division uses XOR with no carries. Match each XOR to its result.",
      pairs: [
        ["1100 XOR 1010", "0110"],
        ["1111 XOR 0101", "1010"],
        ["1001 XOR 1001", "0000"],
        ["1011 XOR 0011", "1000"],
      ],
      hint: "Compare the columns: the same bits give 0, different bits give 1.",
      why: "XOR gives 1 only where the two bits differ. 1100 and 1010 differ in the middle two places, so 0110. 1111 and 0101 differ in the first and third, so 1010. Anything XOR itself is all zeros. 1011 and 0011 differ only in the first place, so 1000.",
    },
  ]);

  B.add("a6-hamming", [
    {
      type: "order",
      q: "Follow one Hamming(7,4) word from sender to repaired data. Put the events in order.",
      items: [
        "The sender places 4 data bits and works out three parity bits",
        "Noise flips exactly one bit in transit",
        "The receiver re-runs its three parity checks",
        "The failed checks, read as binary, give a position",
        "The receiver flips the bit at that position back",
      ],
      hint: "The receiver can only read a position once it has run the checks.",
      why: "The word must be built before noise can hit it. The checks come after the damage, since they test the arrived word. Only the failed checks give the syndrome, and only the syndrome says which bit to flip back.",
    },
    {
      type: "cat",
      q: "Exactly one bit flipped in a Hamming(7,4) word. Sort each syndrome (p4 p2 p1) by what the receiver finds. Parity bits sit at positions 1, 2 and 4.",
      buckets: ["A data bit flipped", "A parity bit flipped", "Nothing flipped"],
      items: [
        ["101", 0],
        ["100", 1],
        ["000", 2],
        ["110", 0],
        ["010", 1],
      ],
      hint: "Read the syndrome as binary: 101 is 5. Then ask whether that position holds data or parity.",
      why: "101 is 5 and 110 is 6, which are data positions. 100 is 4 and 010 is 2, which are parity positions, so the data is already fine. 000 means every check passed, so nothing flipped.",
    },
    {
      type: "slider",
      q: "A message of 12 data bits is cut into three 4-bit pieces, and each piece is sent as its own Hamming(7,4) word. How many bits go down the wire in total?",
      min: 12,
      max: 30,
      step: 1,
      start: 12,
      ans: 21,
      tol: 0.5,
      unit: " bits",
      hint: "Each piece of 4 data bits becomes 7 bits. How many pieces are there?",
      why: "Three words of 7 bits is 21 bits. The 9 extra bits are the parity bits: 3 per word. Splitting a message into short words also helps, because each word can survive one flip of its own.",
    },
    {
      type: "bug",
      q: "This decoder XORs together the position of every 1 bit, which equals the syndrome, then flips the bit it names. The list <code>word</code> counts from 0, but positions count from 1. It corrupts the wrong bit. Click the faulty line.",
      code: [
        "def correct(word):",
        "    s = 0",
        "    for pos in range(1, 8):",
        "        if word[pos - 1] == 1:",
        "            s ^= pos",
        "    if s != 0:",
        "        word[s] ^= 1",
        "    return word",
      ],
      a: 6,
      hint: "Position 1 lives at index 0 in the list.",
      why: "The syndrome s is a position counted from 1, so its bit is word[s - 1]. Writing word[s] flips the neighbour on the right, and for position 7 it would even run off the end. The loop is right: it reads word[pos - 1], which is the bit at position pos.",
    },
    {
      type: "cat",
      q: "A message is sent as three separate Hamming(7,4) words. Noise flips bits as described, and the receiver fixes each word separately. Sort each case by the result.",
      buckets: ["All 12 data bits recovered", "Some data bits are wrong"],
      items: [
        ["One flipped bit in each of the three words", 0],
        ["Two flipped bits in the first word, none elsewhere", 1],
        ["One flipped bit in the second word, none elsewhere", 0],
        ["Three flipped bits in the third word, none elsewhere", 1],
      ],
      hint: "Each word is fixed on its own, and it can survive at most one flip.",
      why: "A word with one flip is repaired, however many other words also have one. Two flips in a word send the fix to an innocent bit, so that word's data ends wrong. Three flips in one word are even further past the limit: the fix lands on a different valid codeword, so its data is wrong too.",
    },
    {
      type: "mcq",
      q: "Why does Hamming(7,4) put its parity bits at positions 1, 2 and 4, instead of at 5, 6 and 7?",
      o: [
        "Each has a single 1 in binary, so each check owns one digit of the position number",
        "Positions 1, 2 and 4 arrive first, so the receiver can start checking while the rest of the word is still coming in",
        "Those bits are the least likely to flip in transit, which keeps the parity bits themselves safe from noise",
        "Positions 5, 6 and 7 hold the highest binary numbers, which are reserved for the syndrome itself",
      ],
      a: 0,
      hint: "Write 1, 2 and 4 in binary: 001, 010 and 100.",
      why: "A power of two has a single 1 in binary, so that position is checked only by its own parity bit. This keeps the three checks independent, and a bit's group memberships spell its position. Noise is equally likely to hit any position, and the receiver waits for the whole word.",
    },
  ]);
})();
