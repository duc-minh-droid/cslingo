(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l5-valid", [
    TF(
      "Swap mutation keeps a tour valid.",
      true,
      "Swap only moves cities that are already in the tour, so every city still appears exactly once.",
    ),
    M(
      "A tour is <code>DBACE</code>. Standard mutation changes gene 2 (the B) to E. What is wrong with the result?",
      [
        "E appears twice and B is missing",
        "B appears twice and E is missing",
        "Nothing: E was already a city",
        "The tour now has one city too many",
      ],
      0,
      "<code>DEACE</code>: E is visited twice and B has vanished.",
    ),
    M(
      "Parents <code>ABCDE</code> and <code>EDCBA</code> are cut after gene 2 and the tails are swapped. Which cities are <b>missing</b> from the first child?",
      ["D and E", "A and B", "C only", "None: it is valid"],
      0,
      "Child 1 is <code>AB</code> + <code>CBA</code> = <code>ABCBA</code>. It has A, B and C only, so D and E are missing.",
    ),
    M(
      "The child <code>ABCBA</code> is repaired by replacing the repeated cities (left to right, second copies) with the missing cities D then E. What is the result?",
      ["ABCDE", "ABCED", "DECBA", "ADCEB"],
      0,
      "The second B (position 4) becomes D and the second A (position 5) becomes E, giving <code>ABCDE</code>.",
    ),
    M(
      "What are the lecture's two strategies for invalid crossover children?",
      [
        "A better crossover, or a fix that restores validity",
        "Much larger populations, or a much lower mutation rate",
        "Rank selection for parents, or tournament selection",
        "Binary encoding for tours, or real-valued encoding",
      ],
      0,
      "Either design an operator that never breaks the permutation, or let it break and repair the child.",
    ),
    TF(
      "Changing the encoding of a problem can change the shape of its fitness landscape.",
      true,
      "Neighbours and the available moves depend on the encoding, so ruggedness changes too.",
    ),
    {
      type: "cat",
      q: "Does each operation keep a 6-city tour valid?",
      buckets: ["Always valid", "Can be invalid"],
      items: [
        ["Swap two genes", 0],
        ["Replace one gene with a random city", 1],
        ["One-point crossover of two different tours", 1],
        ["Copy a tour unchanged", 0],
        ["Reverse the order of a block of genes", 0],
        ["Flip one bit of a gene", 1],
      ],
      why: "Anything that only rearranges the cities keeps the tour valid. Anything that writes a new value or mixes two different tours can duplicate a city.",
    },
    M(
      "One-point crossover is applied with the cut after the <b>last</b> gene. What are the children?",
      [
        "Copies of the two parents, so both are valid",
        "Both children are invalid, with a city repeated",
        "One child is valid and the other is invalid",
        "The operator cannot be applied at the end of a tour",
      ],
      0,
      "Nothing is swapped when the tail is empty, so the children are the parents themselves.",
    ),
    M(
      "Your TSP GA produces many invalid tours after crossover. Which change attacks the cause?",
      [
        "Use a permutation-aware crossover",
        "Increase the population size to 10,000",
        "Lower the mutation rate to almost zero",
        "Switch the parent selection to roulette",
      ],
      0,
      "The problem is that standard crossover ignores the permutation rule. Population size, mutation rate and selection don't change that.",
    ),
    {
      type: "order",
      q: "Order the lecture's “copy, swap, repair” procedure.",
      items: [
        "Copy both parents",
        "Choose a cut and swap the tails",
        "Spot the repeated cities",
        "Replace the repeats with the missing cities",
      ],
      why: "Copy, swap, find repeats, replace them with the missing cities.",
    },
  ]);

  B.add("l5-direct", [
    M(
      "A water network has 8 pipes, each with a choice of 6 diameters. Describe the k-ary chromosome.",
      [
        "Length 8, each gene one of 6 values",
        "Length 6, each gene one of 8 values",
        "Length 14, each gene a bit",
        "Length 48, each gene a diameter",
      ],
      0,
      "One gene per pipe (L = 8), each taking one of K = 6 values.",
    ),
    TF(
      "With a direct encoding, invalid solutions are dealt with mainly by penalising fitness.",
      true,
      "A direct genotype maps straight onto a solution, so a bad one is simply scored badly.",
    ),
    M(
      "There are 5 workers and 8 jobs. In Encoding 2 (one gene per job), how long is the chromosome?",
      ["5", "8", "13", "40"],
      1,
      "One gene for each of the 8 jobs; each gene holds one of the 5 workers.",
    ),
    M(
      "In Encoding 1 (one gene per worker), what does each gene hold?",
      [
        "The job that worker does",
        "The worker's total hours",
        "The number of jobs the worker does",
        "The worker's salary",
      ],
      0,
      "Gene i is the job assigned to worker i, with a range from 1 to m.",
    ),
    M(
      "Which constraint can <b>Encoding 2</b> break?",
      [
        "A worker may be given far too many jobs",
        "A job may be left with no worker at all",
        "A job may be given two different workers",
        "A worker may end up with no job to do",
      ],
      0,
      "Every job has exactly one worker by construction. What it can't prevent is one worker being overloaded.",
    ),
    TF(
      "In Encoding 1, two different workers can be told to do the same job.",
      true,
      "Genes are independent, so two genes can hold the same job number.",
    ),
    M(
      "In a pipe chromosome, the gene value 7 means…",
      [
        "Look up diameter number 7 in the table",
        "The pipe is 7 mm wide",
        "The pipe has 7 bends",
        "Seven pipes share this diameter",
      ],
      0,
      "Real diameters come from a lookup table; the gene is an index.",
    ),
    M(
      "There are 10 pipes and 3 diameters per pipe. About how many designs exist?",
      ["About 30", "About 600", "About 60,000", "About 60 million"],
      2,
      "3¹⁰ = 59,049.",
      { hint: "3⁵ = 243, and 243 × 243 is about 60,000." },
    ),
    {
      type: "cat",
      q: "Which encoding has the problem?",
      buckets: ["Encoding 1 (gene per worker)", "Encoding 2 (gene per job)"],
      items: [
        ["A job can end up with nobody", 0],
        ["One worker can end up with all the jobs", 1],
        ["Every job always has a worker", 1],
        ["Two workers may be told to do the same job", 0],
        ["Chromosome length equals the number of jobs", 1],
        ["No worker can do two jobs", 0],
      ],
      why: "Encoding 1 has a gene per worker, so jobs may be missed or doubled and workers get one job each. Encoding 2 has a gene per job, so every job is covered but a worker may be overloaded.",
    },
    M(
      "In Encoding 2, you want to discourage overworking one person. Where does the penalty go?",
      [
        "Into the fitness function",
        "Into the crossover operator",
        "Into the selection rule",
        "Into the chromosome length",
      ],
      0,
      "The encoding can't stop it, so fitness has to punish it.",
    ),
  ]);

  B.add("l5-indirect", [
    M(
      "Which encoding stores a slot number for each exam directly?",
      ["Direct", "Indirect", "Both", "Neither"],
      0,
      "A direct gene is the problem variable (the exam's slot).",
    ),
    TF(
      "An indirect encoding needs a decoder to build the solution.",
      true,
      "The genes are instructions for a constructive heuristic, which has to be run.",
    ),
    M(
      "In the lecture's indirect timetable, a gene value of 3 means…",
      [
        "Use the 3rd clash-free slot",
        "Put the exam in slot 3",
        "The exam clashes with exam 3",
        "Move the exam three slots later",
      ],
      0,
      "The gene picks from the list of slots that are free of clashes.",
    ),
    TF(
      "Single-gene mutation of a direct timetable changes the slot of exactly one exam.",
      true,
      "Each gene is one exam's slot, so only that exam moves.",
    ),
    M(
      "What is the main advantage of an indirect encoding?",
      [
        "It enforces constraints and shrinks the space",
        "It is faster to interpret than a direct one",
        "It gives a smoother fitness landscape overall",
        "It needs no fitness function to judge solutions",
      ],
      0,
      "Domain knowledge in the decoder keeps many invalid solutions out of the search.",
    ),
    M(
      "What is a main disadvantage of an indirect encoding?",
      [
        "Slow interpretation and rugged neighbourhoods",
        "It cannot represent any problem constraints",
        "Mutation has no effect on the solution it builds",
        "It needs a binary alphabet to work at all",
      ],
      0,
      "The decoder costs time, and one gene can change a lot of the solution.",
    ),
    M(
      "Which encoding generally has the smoother fitness landscape?",
      ["Direct", "Indirect"],
      0,
      "Direct mutations have a predictable, local effect.",
    ),
    M(
      "Your timetable EA wastes most evaluations on clashing timetables. Which change helps most?",
      [
        "An indirect encoding with a clash-free decoder",
        "A larger tournament size in parent selection",
        "A lower crossover rate across the population",
        "Running many more generations than before",
      ],
      0,
      "The decoder only produces clash-free timetables, so those evaluations are no longer wasted.",
    ),
    {
      type: "cat",
      q: "Direct or indirect?",
      buckets: ["Direct", "Indirect"],
      items: [
        ["Invalid solutions are handled by fitness penalties", 0],
        ["Genes are inputs to a constructive heuristic", 1],
        ["Mutation effects are easy to predict", 0],
        ["Exploits knowledge of the problem", 1],
        ["Genotype is quick to interpret", 0],
        ["Neighbouring genotypes may decode to very different solutions", 1],
      ],
      why: "Direct: simple, fast, smooth. Indirect: knowledge-rich, constraint-aware, rugged.",
    },
    M(
      "For pipe sizing, which genotype is <b>indirect</b>?",
      [
        "Genes are the parameters of rules for sizing pipes",
        "Genes are each pipe's diameter, read off directly",
        "Genes are bits of each pipe's diameter in binary",
        "Genes are the lengths of the pipes in the network",
      ],
      0,
      "An indirect genotype modifies a heuristic's variables, here rules for sizing pipes, rather than the pipe sizes themselves.",
    ),
  ]);

  B.add("l5-nozzle", [
    M(
      "Which early EA application was the first?",
      [
        "Rechenberg's pipe bend design",
        "Schwefel's two-phase jet nozzle",
        "Altshuler and Linden's antenna",
        "An exam timetabling system",
      ],
      0,
      "Rechenberg did the pipe bend; Schwefel's jet nozzle came slightly later in the same lab.",
    ),
    TF(
      "Random-gene mutation can break the rule D1 ≥ D2 ≥ D3.",
      true,
      "Replacing a gene with a random value in the range can put it out of order.",
    ),
    M(
      "Genotype 1.9, 1.2, 0.5, 0.7, 1.0, 1.4. D3 is replaced by 1.5. Is the nozzle still valid?",
      [
        "No: D3 would exceed D2",
        "Yes: 1.5 is within the range",
        "No: D3 would exceed D4",
        "Yes: 1.5 is smaller than D1",
      ],
      0,
      "The rule D2 ≥ D3 needs 1.2 ≥ 1.5, which fails.",
    ),
    M(
      "What is the only rule in the variable-length nozzle encoding?",
      [
        "The middle section is the smallest",
        "Diameters never increase",
        "There are exactly six sections",
        "The first section is the largest",
      ],
      0,
      "Everything else is free, so every mutation is valid.",
    ),
    M(
      "Which mutations does the variable-length encoding allow?",
      [
        "Change diameters, add sections, delete sections",
        "Change diameters only, keeping the section count",
        "Swap the order of two sections of the nozzle",
        "Flip individual bits of a binary string",
      ],
      0,
      "Adding and deleting sections lets the number of sections vary.",
    ),
    M(
      "In the genotype “Z1, Z2, D1, …”, what do Z1 and Z2 stand for?",
      [
        "Sections before and after the smallest",
        "Two special diameters at either end of the nozzle",
        "The nozzle's length and its width in total",
        "The mutation rates for adding and deleting",
      ],
      0,
      "They count how many sections come before and after the smallest.",
    ),
    TF(
      "The variable-length encoding can only produce nozzles with exactly six sections.",
      false,
      "The point of it is that sections can be added and deleted.",
    ),
    M(
      "Why does the lecture say EAs can <b>innovate</b>, not just optimise?",
      [
        "A free encoding lets them find unspecified designs",
        "They always beat the designs of human engineers",
        "They never need a fitness function to judge designs",
        "They run much faster than other search methods",
      ],
      0,
      "A flexible encoding can express shapes the designer didn't think of.",
    ),
    {
      type: "slider",
      q: "D4 = 1.3 must stay ≤ D5 = 1.3. A new value is drawn uniformly from 0.1 to 2. What is the chance it is ≤ 1.3 (in %)?",
      min: 0,
      max: 100,
      step: 5,
      ans: 63,
      tol: 10,
      unit: "%",
      hint: "The allowed part is 0.1 to 1.3, which is 1.2 wide, out of a range 1.9 wide.",
      why: "1.2 / 1.9 ≈ 0.63.",
    },
    M(
      "What was the task in the jet nozzle application?",
      [
        "Find the internal shape that gives maximum thrust",
        "Minimise the cost of the materials used overall",
        "Find the quietest nozzle under the same conditions",
        "Make the nozzle as short as it can be built",
      ],
      0,
      "The aim was the maximum possible thrust under given starting conditions.",
    ),
  ]);
})();
