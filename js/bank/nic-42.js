(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l5-antenna", [
    M(
      "How many bits encode one coordinate in the antenna genome?",
      ["5", "4", "7", "21"],
      0,
      "One sign bit plus four magnitude bits.",
    ),
    M(
      "7 wires, 3 coordinates each, 5 bits per coordinate. How long is the chromosome?",
      ["35", "105", "21", "15"],
      1,
      "3 × 7 × 5 = 105.",
    ),
    M(
      "A similar antenna has 4 wires, with the same coding. How many bits?",
      ["20", "60", "35", "84"],
      1,
      "4 wires × 3 coordinates × 5 bits = 60.",
    ),
    M(
      "What number does the 5-bit pattern <code>−0101</code> represent?",
      ["−5", "−3", "+5", "−10"],
      0,
      "Sign −, magnitude 0101 = 4 + 1 = 5.",
    ),
    M(
      "What number does <code>+1001</code> represent?",
      ["+9", "+5", "−9", "+10"],
      0,
      "Sign +, magnitude 1001 = 8 + 1 = 9.",
    ),
    M(
      "How is the antenna's fitness measured?",
      [
        "Sum of squared gain differences, smaller is better",
        "The largest gain at any angle, bigger is better",
        "The total length of wire used in the antenna",
        "The number of wires that fit inside the cube",
      ],
      0,
      "A near-uniform gain pattern is wanted, so squared deviations are added up and minimised.",
    ),
    TF(
      "Binary coding was the only possible encoding for the antenna problem.",
      false,
      "Real-valued or integer coding would be just as applicable; binary was the fashion.",
    ),
    M(
      "Which magnitude bit, when flipped, changes the value by exactly 2?",
      ["The third bit (weight 2)", "The first bit (weight 8)", "The second bit (weight 4)", "The last bit (weight 1)"],
      0,
      "The four magnitude bits weigh 8, 4, 2 and 1.",
    ),
    M(
      "You flip only the sign bit of <code>+0111</code>. By how much does the coordinate change?",
      ["14", "7", "1", "0"],
      0,
      "+7 becomes −7: a change of 14.",
    ),
    M(
      "Which program simulates the radiation pattern for the fitness?",
      [
        "The National Electromagnetics Code (NEC)",
        "A neural network trained on antenna data",
        "A random-number generator with a fixed seed",
        "A GP interpreter running the antenna program",
      ],
      0,
      "Fitness is computed by simulating the pattern with NEC.",
    ),
    M(
      "Where does the first wire start?",
      [
        "At the feed point (0, 0, 0)",
        "At the farthest corner of the cube",
        "At a random point",
        "At the end of the last wire",
      ],
      0,
      "The feed point is in the middle of the ground plane.",
    ),
  ]);

  B.add("l6-idea", [
    M(
      "In genetic programming, what is the thing being evolved?",
      ["Programs", "Fitness functions", "Test inputs", "Random numbers"],
      0,
      "GP is an EA whose individuals are programs.",
    ),
    M(
      "Who popularised genetic programming with a 1992 book?",
      ["John Koza", "John Holland", "Ingo Rechenberg", "Hans-Paul Schwefel"],
      0,
      "Koza's 1992 book made GP widely known.",
    ),
    M(
      "Evaluate <code>(+ 3 (IF (&gt; TIME 5) 2 8))</code> at TIME = 7.",
      ["5", "11", "13", "10"],
      0,
      "7 &gt; 5 is true, so IF returns 2, and 3 + 2 = 5.",
    ),
    M(
      "Evaluate <code>(+ 3 (IF (&gt; TIME 5) 2 8))</code> at TIME = 2.",
      ["11", "5", "10", "8"],
      0,
      "2 &gt; 5 is false, so IF returns 8, and 3 + 8 = 11.",
    ),
    M(
      "In the lecture's C function <code>foo</code>, what is the output at time 11?",
      ["6", "7", "3", "11"],
      0,
      "Time &gt; 10, so temp1 = 3, and temp2 = 3 + 1 + 2 = 6.",
    ),
    M(
      "How is the fitness of a GP program computed?",
      [
        "Run it on many test inputs and sum the errors",
        "Count the nodes in its tree; fewer is fitter",
        "Read its source code and rate how tidy it is",
        "Run it once on a single typical input only",
      ],
      0,
      "Fitness requires executing the program over a range of inputs.",
    ),
    TF(
      "In GP, evaluating an individual is usually more involved than in a standard EA.",
      true,
      "The chromosome is a program, so it has to be run on test conditions.",
    ),
    M(
      "Which task is <b>not</b> a typical current use of GP?",
      [
        "Evolving a complete operating system",
        "Fitting a curve to measured data points",
        "Designing an antenna with a simulator",
        "Designing a circuit from specifications",
      ],
      0,
      "Whole-OS evolution is the “far future” idea. The others are today's tasks.",
    ),
    M(
      "What is search-based software engineering?",
      [
        "Using EAs and other search to improve real software",
        "Searching the web for code to copy into a project",
        "Debugging a program by stepping through it by hand",
        "Compiling programs faster with a smarter search",
      ],
      0,
      "It is the research area of evolving or improving real software.",
    ),
    M(
      "In the GP outline, what happens after programs are evaluated and modified?",
      [
        "Stop if a good program exists, else evaluate again",
        "The population is thrown away and the run restarts",
        "A human edits the best program before the next step",
        "The run always continues for exactly 100 generations",
      ],
      0,
      "It is the standard EA loop with a stopping test.",
    ),
    M(
      "Which part of an EA is unchanged in GP?",
      [
        "The generate, evaluate, select and vary loop",
        "The type of chromosome: it is a program tree",
        "How fitness is computed: by running the program",
        "What a gene means: a node of a program tree",
      ],
      0,
      "Only the individuals (programs) and their evaluation differ.",
    ),
  ]);

  B.add("l6-random", [
    M(
      "Which of these belongs to the <b>function set</b> in the lecture's example?",
      [
        "PLUS, MINUS, TIMES, DIV, IF",
        "X, Y and any real number constant",
        "Population size and the maximum depth",
        "Fitness and the termination criterion",
      ],
      0,
      "Functions become internal nodes; X, Y and numbers are terminals.",
    ),
    M(
      "Which belong to the terminal set?",
      [
        "X, Y and any real number",
        "PLUS, MINUS and TIMES operators",
        "The IF function with its four children",
        "The depth limit and the population",
      ],
      0,
      "Terminals sit at the leaves.",
    ),
    M(
      "How many children does IF have in the lecture's syntax?",
      ["4", "2", "3", "1"],
      0,
      "IF A &gt; B then return C else return D.",
    ),
    M(
      "Maximum depth 4, root at depth 1. A function node at depth 3 gets children. They must be…",
      ["Terminals", "Functions", "Random functions or terminals", "Absent"],
      0,
      "Depth 3 = Max − 1.",
    ),
    M(
      "Maximum depth 3 and every function has two children. What is the largest possible program size?",
      ["7 nodes", "3 nodes", "8 nodes", "15 nodes"],
      0,
      "1 + 2 + 4 = 7 nodes.",
    ),
    M(
      "Same rules with maximum depth 4. What is the largest possible size?",
      ["15 nodes", "8 nodes", "16 nodes", "31 nodes"],
      0,
      "1 + 2 + 4 + 8 = 15.",
    ),
    TF(
      "Every random program has the same number of nodes.",
      false,
      "Children are chosen at random between functions and terminals, so sizes vary.",
    ),
    M(
      "What do the syntax rules specify?",
      [
        "How many children each function takes",
        "The best fitness value we hope to reach",
        "How many generations the run will last",
        "The mutation rate used at each node",
      ],
      0,
      "Arity: PLUS takes two children, IF takes four.",
    ),
    M(
      "Why does the lecture's algorithm begin by choosing a function for the root?",
      [
        "A lone terminal is a trivial one-node program",
        "Functions always have a higher fitness than leaves",
        "Terminals are not allowed to sit at depth one",
        "It makes subtree mutation easier to implement",
      ],
      0,
      "A root function gives a real tree to grow.",
    ),
    M(
      "Maximum depth is 2 and the root is a function. What must its children be?",
      ["Terminals", "Functions", "One of each", "Nothing"],
      0,
      "The root is at depth 1 = Max − 1.",
    ),
  ]);

  B.add("l6-vary", [
    {
      type: "order",
      q: "Order the steps of subtree mutation.",
      items: [
        "Choose a node at random",
        "Remove the subtree rooted there",
        "Grow a new subtree in its place",
        "Check the depth limit is respected",
      ],
      why: "Pick the node, cut, grow a replacement within the usual depth rules.",
    },
    TF("Choosing a subtree is equivalent to choosing a node.", true, "Each node is the root of exactly one subtree."),
    M(
      "Why is subtree mutation biased towards high-depth nodes?",
      [
        "Most nodes of a bushy tree sit near the bottom",
        "Deep nodes have a higher fitness than shallow ones",
        "The root can never be chosen as a mutation point",
        "Deep nodes are chosen first, by an explicit rule",
      ],
      0,
      "A random node is more likely to be among the many deeper ones.",
    ),
    M(
      "One subtree crossover of two parents produces how many children?",
      ["Two", "One", "Three", "Four"],
      0,
      "Each parent receives the other's subtree.",
    ),
    M(
      "Parents have 5 and 9 nodes and swap subtrees of 1 and 3 nodes. The children's sizes are…",
      ["7 and 7", "5 and 9", "3 and 11", "9 and 5"],
      0,
      "5 − 1 + 3 = 7 and 9 − 3 + 1 = 7.",
    ),
    M(
      "Subtree crossover swaps subtrees between parents of total size 20. What is the total size of the two children?",
      ["20", "10", "40", "It depends on the subtrees"],
      0,
      "Nodes only move between the trees, so the total is conserved.",
    ),
    M(
      "If the root node is chosen for subtree <b>mutation</b>, what happens?",
      [
        "The whole program is replaced by a new random tree",
        "Nothing happens, as the root cannot be mutated",
        "Only the root's label changes, its children stay",
        "The program is deleted from the population",
      ],
      0,
      "The subtree rooted at the root is the entire tree.",
    ),
    M(
      "A crossover child would exceed the depth limit. What do GP systems typically do?",
      [
        "Reject it or retry the crossover",
        "Allow the trees to grow to any depth",
        "Delete the child's root and keep the rest",
        "Stop the run and report an error",
      ],
      0,
      "A limit stops trees growing without end.",
    ),
    TF(
      "Subtree crossover needs both parents to be the same size.",
      false,
      "Subtrees of different sizes can be swapped; the children's sizes just change.",
    ),
    {
      type: "cat",
      q: "Mutation or crossover?",
      buckets: ["Mutation", "Crossover"],
      items: [
        ["Needs two parents", 1],
        ["Grows a fresh random subtree", 0],
        ["Swaps subtrees between individuals", 1],
        ["Replaces one node's subtree", 0],
      ],
      why: "Crossover recombines material from two parents; mutation grows new material.",
    },
  ]);
})();
