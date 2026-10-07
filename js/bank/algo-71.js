/* js/bank/algo-75.js: Phase 5 revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a5-orient", [
    M(
      "p = (0,0), a = (5,1), b = (2,4). The cross product (a − p) × (b − p) is…",
      ["18, a left turn", "−18, a right turn", "6, a left turn", "0, collinear"],
      0,
      "5·4 − 1·2 = 18, positive, so a left turn.",
    ),
    M(
      "A drawing library has y pointing down. You use the maths cross-product formula unchanged and get a positive value. How does that turn look on screen?",
      ["Clockwise", "Counter-clockwise", "Straight on", "It depends on the colours"],
      0,
      "Mirroring y flips orientation, so a positive value looks clockwise.",
    ),
    M(
      "The cross product of p → a → b is 10. What is the area of the triangle p, a, b?",
      ["5", "10", "20", "100"],
      0,
      "The cross product is twice the area.",
    ),
    TF(
      "A cross product of zero means the three points are the same point.",
      false,
      "Zero means collinear: the three points lie on one line, not necessarily the same point.",
    ),
    {
      type: "cat",
      q: "Which way does each walk turn? (y points up)",
      buckets: ["Left", "Right", "Straight"],
      items: [
        ["(0,0) → (3,0) → (3,2)", 0],
        ["(0,0) → (3,0) → (6,−2)", 1],
        ["(0,0) → (2,1) → (6,3)", 2],
        ["(1,1) → (1,4) → (−2,4)", 0],
      ],
      why: "Cross products: 6, −6, 0 and 9. Positive is left, negative is right, zero is straight.",
    },
  ]);
  B.add("a5-wrap", [
    M(
      "What is the reference point r at the start of the lecture's gift wrapping?",
      [
        "A made-up point above the leftmost point",
        "The second vertex of the hull, found by the first sweep",
        "The rightmost point of the whole point set",
        "The centre of mass of all the points in S",
      ],
      0,
      "Nothing came before h, so r supplies a direction to measure the first angles from.",
    ),
    M(
      "Gift wrapping on 7 points finds a hull of 5. Round i checks 7 − i + 1 candidates. How many checks in all?",
      ["25", "35", "49", "15"],
      0,
      "7 + 6 + 5 + 4 + 3 = 25.",
    ),
    M(
      "Which points are candidates in the lecture's inner loop?",
      [
        "Those not yet on the hull, plus the start",
        "Only the points that are on the hull so far",
        "Every point in the set, every single time",
        "The points that happen to be nearest to h",
      ],
      0,
      "S minus H keeps shrinking, and H[0] stays in so the loop can close.",
    ),
    M(
      "The lecture's gift wrapping lists the hull in which order?",
      ["Clockwise", "Counter-clockwise", "Sorted by x", "Sorted by angle around the centre"],
      0,
      "It sweeps clockwise, picking the smallest clockwise angle each time.",
    ),
    TF(
      '"Output-sensitive" means the running time depends on the size of the answer, here h.',
      true,
      "Gift wrapping costs O(n·h): a smaller hull means less work.",
    ),
  ]);
  B.add("a5-graham", [
    M(
      "Why did Bell Labs need a new hull algorithm around 1970?",
      [
        "10,000 points was too slow for O(n²)",
        "Gift wrapping was giving the wrong answers",
        "Computers could not store that many points",
        "Hulls had not yet been properly defined",
      ],
      0,
      "O(n²) on 10,000 points is 100 million steps. O(n log n) is about 133,000.",
    ),
    M(
      "Which lines of the lecture's Graham scan pseudocode reject a point?",
      [
        "8 and 9: the while test and POP",
        "2: the sort by polar angle",
        "11: PUSH of the new point",
        "13: return S as the answer",
      ],
      0,
      "A point is rejected when it is popped, and POP runs only while the turn is clockwise.",
    ),
    M(
      "The scan loop of Graham's algorithm runs for i = 3 to n. How many times is that?",
      ["n − 2", "n", "n log n", "2n"],
      0,
      "Points 3 to n inclusive: n − 2 iterations.",
    ),
    M(
      "After handling the first k sorted points, the stack holds…",
      [
        "the hull of the anchor and those k points",
        "the k points that are nearest the anchor",
        "the k points with the biggest angles of all",
        "the k points that have been popped so far",
      ],
      0,
      "That invariant is why the finished stack is the whole hull.",
    ),
    TF(
      "In Graham scan, a point once popped can be pushed back later.",
      false,
      "A popped point is inside the hull of the points seen so far, so it never returns.",
    ),
  ]);
})();
