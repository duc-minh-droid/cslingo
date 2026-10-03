(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a4-mst", [
    M(
      "Which data structure speeds up Prim?",
      [
        "A stack of visited nodes, most recent on top",
        "A priority queue of candidate edges or keys",
        "A union-find structure only",
        "A hash map of edges only",
      ],
      1,
      "Find the cheapest crossing edge fast.",
    ),
    M(
      "Kruskal's running time is dominated by…",
      ["the union-find operations", "sorting the m edges", "printing the final tree", "choosing the start node"],
      1,
      "The sort costs most.",
    ),
    M(
      "Edges A–B 2, A–C 2, B–C 1, C–D 3, B–D 4. MST weight?",
      ["5", "6", "7", "8"],
      1,
      "B–C 1 + one of the 2s + C–D 3 = 6.",
    ),
    TF("Kruskal can grow several separate trees before they merge into one.", true, "It works on a forest."),
    M(
      "Prim always maintains…",
      [
        "a forest of separate trees",
        "exactly one connected tree",
        "a sorted list of all edges",
        "a cycle through every node",
      ],
      1,
      "It grows from one start node.",
    ),
    M(
      "A classic MST use?",
      [
        "Encrypting data before sending",
        "Connecting points with the least total cable",
        "Sorting a list of items",
        "Routing packets along shortest paths",
      ],
      1,
      "Cheapest network.",
    ),
    M(
      "Is an MST the same as a shortest-path tree from one node?",
      [
        "Yes: both minimise the distance to every node",
        "No: an MST minimises total weight, not root distance",
        "Only in directed acyclic graphs",
        "Only when every weight is equal",
      ],
      1,
      "Different objectives, often different trees.",
    ),
    M(
      "A graph is disconnected. What do Prim and Kruskal produce?",
      [
        "Both stop with an error",
        "Prim covers only one component",
        "Both still build one full tree",
        "Neither returns anything",
      ],
      1,
      "No edges cross between components.",
    ),
  ]);

  /* ---------- Phase 5 ---------- */
  B.add("a5-orient", [
    M(
      "The orientation of p → a → b is the sign of…",
      [
        "(a − p) · (b − p), the dot product",
        "(a − p) × (b − p), the 2-D cross product",
        "|a − p|, the distance from p to a",
        "a + b, the vector sum",
      ],
      1,
      "The 2-D cross product.",
    ),
    M(
      "With y pointing up, a positive cross product means…",
      [
        "clockwise (a right turn), as on a clock face",
        "counter-clockwise (a left turn)",
        "the three points are collinear",
        "the turn is undefined",
      ],
      1,
      "Maths convention.",
    ),
    M(
      "(0,0) → (4,0) → (4,3): which way does it turn?",
      ["Left", "Right", "Straight"],
      0,
      "(4,0) × (4,3) = 4·3 − 0·4 = 12 > 0.",
    ),
    TF("The orientation test needs square roots.", false, "Only multiplication and subtraction."),
    M(
      "In screen coordinates (y pointing down), what happens to the sign?",
      ["Nothing", "It flips", "It doubles", "It becomes zero"],
      1,
      "Mirroring the y-axis reverses orientation.",
    ),
    M(
      "Hull code finds three collinear points. What must it decide?",
      [
        "Nothing: collinear points can simply be ignored",
        "Whether to keep the middle point, consistently",
        "To stop and report an error",
        "To re-sort all the points",
      ],
      1,
      "Collinear handling is a classic source of bugs.",
    ),
    M(
      "How can turn tests check whether a point is inside a convex polygon?",
      [
        "They can't: you need to measure the angles instead",
        "Inside if it's on the same side of every edge",
        "By counting how many vertices it's near",
        "By measuring its distance to the centre",
      ],
      1,
      "Same turn direction for all edges.",
    ),
    M(
      "|cross product| of (0,0), (4,0), (4,3) relates to the triangle's area how?",
      ["Area = |cross| = 12", "Area = |cross| / 2 = 6", "Area = |cross|² = 144", "There's no relation between them"],
      1,
      "The cross product is twice the triangle's signed area.",
    ),
  ]);
  B.add("a5-wrap", [
    M(
      "At each step, gift wrapping picks the next point that…",
      [
        "is nearest to the current point on the hull",
        "keeps all other points on one side of the edge",
        "is highest above the current point",
        "is chosen at random",
      ],
      1,
      "The most extreme turn.",
    ),
    M(
      "If the hull has h points, how many wrapping steps are there?",
      ["n", "h", "n²", "log n"],
      1,
      "One per hull point.",
    ),
    M("Each wrapping step costs…", ["O(1)", "O(n)", "O(h)", "O(n²)"], 1, "Scan all candidates."),
    TF("Gift wrapping is output-sensitive.", true, "Its cost depends on the hull size h."),
    M(
      "1,000 points, only 3 on the hull. About how many checks?",
      ["3", "about 3,000", "about 1,000,000", "about 10,000"],
      1,
      "n × h = 1,000 × 3.",
    ),
    M(
      "Where does gift wrapping usually start?",
      [
        "A randomly chosen point from the input",
        "An extreme point, like the leftmost",
        "The point nearest the centre of mass",
        "The last point in the list",
      ],
      1,
      "Guaranteed to be on the hull.",
    ),
    M(
      "Two candidate points are collinear with the current point. Which does the usual rule pick?",
      ["The nearer", "The farther", "Either", "Neither"],
      1,
      "Taking the farther point skips points in the middle of an edge.",
    ),
    M(
      "Compared with Graham scan, gift wrapping is better when…",
      ["the hull is large", "the hull is small", "points are sorted", "never"],
      1,
      "n·h beats n log n when h is tiny.",
    ),
  ]);
  B.add("a5-graham", [
    M(
      "After choosing the anchor, Graham scan sorts points by…",
      ["x-coordinate only", "angle around the anchor", "distance from the anchor only", "point name"],
      1,
      "Polar angle order.",
    ),
    M("Graham scan keeps candidate hull points on a…", ["queue", "stack", "heap", "tree"], 1, "Push and pop."),
    M(
      "A point is popped when the top two points plus the new point make…",
      [
        "a left turn (counter-clockwise)",
        "a right turn or a straight line",
        "any turn at all",
        "a closed loop back to the anchor",
      ],
      1,
      "A dent inward.",
    ),
    TF("Graham scan's worst case is O(n²).", false, "It's O(n log n) in every case."),
    M(
      "What does the stack hold when the scan finishes?",
      ["Every point, in sorted order", "Exactly the hull, in order", "Only the interior points", "Nothing: it's empty"],
      1,
      "The output.",
    ),
    M(
      "Why start from the lowest point?",
      [
        "It has the smallest label",
        "It's on the hull, and all the others lie above it",
        "Any point works, so it's just a convention",
        "It's the quickest point to find",
      ],
      1,
      "A safe pivot for the angle sort.",
    ),
    M(
      "Two points have the same angle from the anchor. Common tie-break?",
      ["Pick one at random", "By distance from the anchor", "Alphabetically by name", "Drop both points"],
      1,
      "Distance decides which comes first.",
    ),
    M(
      "Why is the scan itself linear?",
      [
        "It skips most of the points after sorting them",
        "Each point is pushed once, popped at most once",
        "It uses a heap to find points",
        "It stops as soon as the hull closes",
      ],
      1,
      "At most 2n stack operations.",
    ),
  ]);

  /* ---------- Phase 6 ---------- */
  B.add("a6-crc", [
    M(
      "A parity bit catches…",
      [
        "every error, however many bits",
        "any odd number of flipped bits",
        "any even number of flipped bits",
        "only burst errors",
      ],
      1,
      "Even numbers of flips cancel out.",
    ),
    M(
      "CRC works by…",
      [
        "counting the 1 bits in the message and storing the total",
        "polynomial division with XOR (mod 2)",
        "encrypting the message with a key",
        "sorting the bits of the message",
      ],
      1,
      "The remainder is the check value.",
    ),
    M("In mod-2 arithmetic, addition is the same as…", ["AND", "OR", "XOR", "NOT"], 2, "1 + 1 = 0, no carry."),
    TF("A CRC can correct errors on its own.", false, "It detects; correction needs a code like Hamming, or a resend."),
    M(
      "CRCs are especially good at detecting…",
      ["deliberate forgery", "burst errors", "correct data", "nothing"],
      1,
      "Common on real links.",
    ),
    M("Generator 1011 has degree…", ["2", "3", "4", "11"], 1, "4 bits means degree 3."),
    M("1011 XOR 1101 = ?", ["0110", "1001", "1111", "0000"], 0, "Bit by bit: 1⊕1=0, 0⊕1=1, 1⊕0=1, 1⊕1=0."),
    M(
      "Where are CRCs used?",
      [
        "Storing passwords securely so they can't be reversed",
        "Ethernet frames and ZIP files",
        "Generating encryption keys",
        "Sorting large files",
      ],
      1,
      "Everyday error detection.",
    ),
  ]);
  B.add("a6-hamming", [
    M("Hamming(7,4) has how many parity bits?", ["1", "3", "4", "7"], 1, "7 − 4 = 3, at positions 1, 2, 4."),
    M(
      "Syndrome 000 means…",
      ["error at position 0", "no error detected", "two errors", "all bits wrong"],
      1,
      "Every parity check passed.",
    ),
    M("Syndrome 111 points at position…", ["1", "4", "7", "3"], 2, "111 in binary is 7."),
    TF("Hamming(7,4) corrects any single-bit error.", true, "The syndrome names the position."),
    M(
      "p1 checks which positions?",
      ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "1, 2, 4"],
      0,
      "Positions whose binary ends in 1.",
    ),
    M(
      "p4 checks which positions?",
      ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "4 only"],
      2,
      "Positions with the 4s bit set.",
    ),
    M("Hamming(7,4)'s code rate?", ["4/7", "3/7", "7/4", "1/2"], 0, "4 data bits per 7 sent."),
    M(
      "Minimum Hamming distance 3 means the code can…",
      ["correct 3 errors", "correct 1 error (or detect 2)", "correct no errors at all", "detect 3 and correct 2"],
      1,
      "Distance d corrects ⌊(d − 1)/2⌋ errors.",
    ),
  ]);

  /* ---------- Phase 7 ---------- */
  B.add("a7-entropy", [
    M("Entropy of a fair coin?", ["0 bits", "0.5 bits", "1 bit", "2 bits"], 2, "Two equally likely outcomes."),
    M(
      "An event with probability 1/8 carries how much surprise?",
      ["1 bit", "3 bits", "8 bits", "1/8 bit"],
      1,
      "−log₂(1/8) = 3.",
    ),
    M(
      "Maximum entropy for 4 symbols?",
      ["1 bit", "2 bits", "4 bits", "unlimited"],
      1,
      "log₂ 4, when all are equally likely.",
    ),
    TF("Entropy depends on what the symbols are called.", false, "Only the probabilities matter."),
    M(
      "A distribution becomes more skewed. Its entropy…",
      ["rises", "falls", "stays the same", "becomes negative"],
      1,
      "More predictable, less surprise.",
    ),
    M(
      "Why does English text compress well?",
      [
        "Most English texts are short, so there's little to store",
        "Frequencies are uneven, with lots of redundancy",
        "English text is already encrypted",
        "English uses very few vowels",
      ],
      1,
      "Low entropy per character.",
    ),
    M(
      "Probabilities 0.5, 0.25, 0.25. Entropy?",
      ["1 bit", "1.5 bits", "2 bits", "0.75 bits"],
      1,
      "0.5·1 + 0.25·2 + 0.25·2 = 1.5.",
    ),
    M(
      "Entropy gives what about average code length?",
      [
        "An upper limit on the length of the best code",
        "A lower limit no lossless code can beat",
        "The exact length of the best code",
        "Nothing about code length",
      ],
      1,
      "The compression floor.",
    ),
  ]);
})();
