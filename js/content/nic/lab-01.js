/* 4.9 — EA Lab: both lecture algorithms, fully configurable, evolving a pixel image */
(function () {
  const partScope = (NIC.shared.lab = NIC.shared.lab || {});

  const W = 12,
    L = W * W;
  const TARGETS = {
    heart:
      "000000000000011100011100111110111110111111111111111111111111111111111111011111111110001111111100000111111000000011110000000001100000000000000000",
    smiley:
      "000111111000001000000100010000000010100110011001100110011001100000000001100000000001101000000101100111111001010000000010001000000100000111111000",
    stripes: Array.from({ length: L }, (_, i) => (Math.floor(i / W) % 2 ? "1" : "0")).join(""),
    random: null,
  };
  const PSEUDO = {
    ss: [
      "0. Initialise popsize random solutions; evaluate",
      "1. X ← Select (tournament: best of tsize random)",
      "2. With prob mute_rate, M ← mutate(copy of X), else M = X",
      "3. Evaluate f(M)",
      "4. W ← current worst; if M not less fit than W: replace W with M",
      "5. If termination (e.g. 10,000 evals) stop, else go to 1",
    ],
    gen: [
      "0. Initialise population G of popsize random solutions; evaluate",
      "1. Select 2·(popsize−1) parents (rank-based: p = rank/F)",
      "2. Pair them up; Vary each pair → one child  (popsize−1 children)",
      "   Vary: with prob cross_rate crossover, else copy a random parent; then mutate",
      "3. Evaluate each child",
      "4. Keep the best of G, delete the rest (elitism)",
      "5. Add all children to G",
      "6. If termination (e.g. 100 generations) stop, else go to 1",
    ],
    custom: [
      "Custom mix: pick any algorithm type, selection, crossover and mutation below.",
      "Generational: popsize − elites children per generation.",
      "Steady-state: 1 child per iteration, replaces the worst if no worse.",
    ],
  };
  Object.assign(partScope, { L, PSEUDO, TARGETS, W });
})();
