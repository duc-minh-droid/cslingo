(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l6-regress", [
    M(
      "The target is x² + x + 1 and the candidates are x + 1, x² + 1, 2 and x. Which is closest to the target?",
      ["x + 1", "x² + 1", "2", "x"],
      0,
      "x + 1 is off by only x²: a small area.",
    ),
    M(
      "How is fitness measured in the lecture's regression example?",
      [
        "Sum of absolute errors over many x values",
        "The number of nodes in the program's tree",
        "Largest single error at any x, ignoring the rest",
        "Sum of the outputs the program produces",
      ],
      0,
      "Lower total error is better.",
    ),
    M(
      "When does the lecture's regression run stop?",
      [
        "When some individual's error is below 0.1",
        "After exactly 4 generations have been bred",
        "When all the programs have become identical",
        "When the population has no programs left",
      ],
      0,
      "That is the termination criterion.",
    ),
    M(
      "What does % stand for in the function set {+, −, ×, %}?",
      ["Protected division", "Percentage of the total", "Remainder after division", "Raising to a power"],
      0,
      "Division that returns a harmless value when the divisor is zero.",
    ),
    TF(
      "In symbolic regression, a lower error means a fitter program.",
      true,
      "Fitness is an error here, so lower is better.",
    ),
    M("The data come from x² + x + 1. What is y at x = 0?", ["1", "0", "2", "3"], 0, "0 + 0 + 1 = 1."),
    M("The data come from x² + x + 1. What is y at x = 1?", ["3", "1", "2", "4"], 0, "1 + 1 + 1 = 3."),
    M(
      "The candidate “2” gives 2 at x = 1, while the target gives 3. What is its absolute error there?",
      ["1", "2", "3", "5"],
      0,
      "|2 − 3| = 1.",
    ),
    M(
      "Why would a real GP run use a population larger than the lecture's 4?",
      [
        "More variety to recombine, so it is less likely to stall",
        "Larger populations are required for the run to be legal",
        "Four individuals cannot be evaluated on 11 points",
        "A larger population lowers the error to zero by itself",
      ],
      0,
      "Four programs give very little material for crossover and mutation.",
    ),
    M(
      "Generation 1 in the lecture has four individuals: a copy, a mutant and two crossover offspring. What does that tell you about the population size?",
      ["It stays at 4", "It doubles", "It halves", "It grows by 2"],
      0,
      "1 + 1 + 2 = 4, the same as before.",
    ),
    M(
      "What are the terminals in the lecture's symbolic regression run?",
      [
        "X and random constants",
        "The functions +, −, ×, and %",
        "The population size and depth",
        "The table of data points",
      ],
      0,
      "Terminals are the leaves of the trees.",
    ),
  ]);

  B.add("l6-prep", [
    M(
      "Which is one of the five preparatory steps?",
      [
        "Determining the criterion for terminating a run",
        "Choosing the colour scheme for the plots",
        "Choosing which compiler builds the system",
        "Writing the target program out by hand",
      ],
      0,
      "Terminals, functions, fitness, parameters and termination.",
    ),
    M(
      "Which of these sets contains the input variable X?",
      ["The terminal set", "The function set", "The parameters", "The termination criterion"],
      0,
      "Inputs and constants are terminals.",
    ),
    M(
      "With functions {+, −} and terminals {X, 1}, can GP build 2X + 1?",
      ["Yes: (+ X (+ X 1))", "No: it needs ×", "No: it needs a bigger population", "Only with protected division"],
      0,
      "X + (X + 1) = 2X + 1.",
    ),
    M(
      "With functions {×} only and terminal {X}, can GP build X + 1?",
      ["No: no sum can be formed", "Yes: (* X 1)", "Yes, with a deeper tree", "Yes, with mutation"],
      0,
      "Products of X are powers of X; there is no way to add 1.",
    ),
    M(
      "A target cannot be built from your function and terminal sets. What does a bigger population do?",
      [
        "Nothing: no program can match it",
        "It eventually finds the target after many runs",
        "It finds the target faster than a small one",
        "It makes the target easier to express",
      ],
      0,
      "The search space simply does not contain the answer.",
    ),
    M(
      "Which function set suits classifying records from blood-test data?",
      [
        "AND, OR, NOT and comparisons",
        "PLUS and TIMES with constants",
        "Forward and Branch commands",
        "Only numeric constants, no functions",
      ],
      0,
      "A classification rule is a logical expression.",
    ),
    M(
      "What are Forward and Branch used for in the lecture's antenna example?",
      [
        "Commands that build the antenna step by step",
        "Selection operators that pick the parents",
        "Fitness measures that score the antenna",
        "Crossover points inside the program tree",
      ],
      0,
      "They are the building blocks of an antenna-constructing program.",
    ),
    TF(
      "A larger population can make an unreachable target reachable.",
      false,
      "Only changing the building blocks can do that.",
    ),
    M(
      "Which belongs to the “parameters for the run” step?",
      ["Population size", "The data table", "The target formula", "The terminal set"],
      0,
      "Population size, number of generations and operator rates are run parameters.",
    ),
    M(
      "Which is a sensible termination criterion?",
      [
        "Error below a threshold, or a generation limit",
        "Stop as soon as the first program is built",
        "Stop when the population has become empty",
        "Stop whenever mutation produces a new tree",
      ],
      0,
      "Stop on success, or after a budget.",
    ),
    M(
      "Which decision fixes how programs are <b>scored</b>?",
      ["The fitness measure", "The function set", "The terminal set", "The population size"],
      0,
      "Fitness measures how well a program does.",
    ),
  ]);
})();
