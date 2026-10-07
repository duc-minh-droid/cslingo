(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { nmContours, nmLines, nmMoves } = partScope;
  const B = NIC.bank;

  B.add("a3-nm", [
    {
      type: "pick",
      q: "The rings are contour lines of f, and the number on a ring is f there (lower is better). Nelder–Mead holds the violet triangle ABC and replaces its worst corner by flipping it through the midpoint of the other two. Each grey arrow shows where flipping one corner would land. Click the landing point it actually tries first.",
      fig: nmContours(),
      a: "Q",
      why: "Corner A sits between the f = 9 and f = 16 rings, B between 4 and 9, and C between 1 and 4, so A is the worst. Flipping A through the midpoint of B and C lands at Q, which is close to the minimum. The other two arrows flip corners that are not the worst, so Nelder–Mead would not try them. Q is also better than every corner, which makes an expansion likely next.",
    },
    {
      type: "match",
      q: "Each picture shows a Nelder–Mead triangle before (grey dashed) and after one move (green). The red dot marks the old worst corner. Match each picture to its move.",
      fig: nmMoves(),
      pairs: [
        ["Picture A", "Contract: pull the worst corner back towards the middle"],
        ["Picture B", "Reflect: flip the worst corner through the midpoint"],
        ["Picture C", "Shrink: squash the whole triangle towards the best corner"],
        ["Picture D", "Expand: flip the worst corner and go even further"],
      ],
      why: "In B the worst corner jumps to the far side of the other two (a reflection). In D it jumps even further out on the same line (an expansion). In A it moves a little way inwards, which is a contraction. In C two corners move at once, towards the best one: that is the shrink, and the only move that changes more than one corner.",
    },
    {
      type: "bug",
      q: "shrink(pts) is called when nothing else works. pts is sorted with the best corner first. It should keep the best corner and move every other corner halfway towards it (mid(p, q) is the midpoint). The triangle it returns is lopsided. Click the faulty line.",
      code: [
        "def shrink(pts):",
        "    best = pts[-1]",
        "    out = [best]",
        "    for p in pts[1:]:",
        "        out.append(mid(best, p))",
        "    return out",
      ],
      a: 1,
      why: "Shrinking pulls everything towards the best corner, which is pts[0] when the list is sorted best first. pts[-1] is the worst corner, so every other corner is dragged towards the worst point, away from the minimum.",
    },
    {
      type: "multi",
      q: "Select every situation where Nelder–Mead is a sensible first thing to try.",
      o: [
        "Tuning 3 settings of a game simulator that only returns a score",
        "Minimising a smooth function of 4 inputs when no gradient is available",
        "Fitting a model with 2,000 parameters whose gradient is cheap to compute",
        "Finding the guaranteed global minimum of a function with many valleys",
        "Tuning 2 settings of a lab experiment whose readings are slightly noisy",
      ],
      a: [0, 1, 4],
      why: "Nelder–Mead only compares function values, so it works when you can only evaluate a score, even a noisy one, and the number of inputs is small. It is a poor fit for thousands of parameters (the triangle becomes huge and slow, and a cheap gradient is much better) and it offers no guarantee of finding the global minimum, since it can settle in any valley.",
    },
    {
      type: "pick",
      q: "A student logs the three corner values (best, middle, worst) after each iteration of a normal Nelder–Mead run on a minimisation problem, with no shrink moves. One dot on the green best line is impossible. Click it.",
      fig: nmLines(),
      a: "4",
      hint: "In a normal iteration only the worst corner is replaced. What can that do to the best value?",
      why: "At iteration 4 the best value rises from 3 to 3.6, so the best corner was thrown away. Reflect, expand and contract only replace the worst corner, and shrink keeps the best, so the best value can only stay or fall. In fact all three lines should only stay level or go down.",
    },
  ]);
})();
