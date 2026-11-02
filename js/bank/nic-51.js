(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  // ---------- 12.4 PSO settings and stopping ----------
  B.add("l12-settings", [
    M(
      "A team halves its swarm size to save computing time. What is the main risk?",
      [
        "Starting guesses may miss the region holding the best solution",
        "The velocity update can no longer be calculated for any particle",
        "The pbest of each particle is forgotten",
        "The fitness function stops giving meaningful scores",
      ],
      0,
      "A smaller swarm samples the search space less. It costs less per iteration, but it is likelier to start without any particle near the best region.",
    ),
    {
      type: "cat",
      q: "Is each of these something you choose before the run, or a quantity you read during it?",
      buckets: ["Chosen before the run", "Read during the run"],
      items: [
        ["Swarm size", 0],
        ["The values of c₁ and c₂", 0],
        ["The maximum number of iterations", 0],
        ["The normalised swarm radius", 1],
        ["The best fitness found so far", 1],
        ["Iterations since the last improvement", 1],
      ],
      why: "Swarm size, the acceleration coefficients and the iteration limit are settings. The swarm radius, the best fitness and the stall count are measurements that the stopping rules look at.",
    },
    {
      type: "multi",
      q: "Which of these are termination criteria named in the lecture?",
      o: [
        "A maximum number of iterations",
        "An acceptable solution is found",
        "No improvement for N iterations",
        "The normalised swarm radius is close to zero",
        "Every particle has visited every point of the space",
        "The first particle's velocity turns positive",
      ],
      a: [0, 1, 2, 3],
      why: "The four rules are a maximum number of iterations, an acceptable solution, no improvement for N iterations and a swarm radius close to zero. The other two are not stopping rules.",
    },
    M(
      "Particles sit on a ring, and each follows the best of itself and two neighbours on each side. How many particles does each one compare itself with, counting itself?",
      ["5", "3", "4", "2"],
      0,
      "Two on each side plus itself is 5. This is a local-best (lbest) neighbourhood. The whole swarm would be gbest.",
    ),
    M(
      "A ring of 20 particles uses small neighbourhoods (each follows the best of itself and one neighbour each side). Compared with using the whole swarm's best, how does news of a good position spread?",
      [
        "More slowly, along the ring, so groups can explore for longer",
        "Instantly to every particle in the ring at the very next step",
        "Not at all, since neighbouring particles never share their bests",
        "Only when the swarm size is reduced to three",
      ],
      0,
      "A good position passes one neighbour at a time. That slows convergence, and different parts of the ring can search different regions for longer.",
    ),
    TF(
      "Setting c₁ and c₂ as high as possible always gives faster and better results.",
      false,
      "Too high values may cause premature convergence and overshooting. Too low values slow progress. The aim is a balance.",
    ),
    TF(
      "If the normalised swarm radius is almost zero, the swarm must be sitting on the global optimum.",
      false,
      "A tiny radius only says the particles are close together. They can be bunched on a poor local optimum.",
    ),
    M(
      "A run ends because the maximum number of iterations was reached, but the normalised swarm radius is still 70%. What is the sensible reading?",
      [
        "The swarm had not converged, so more iterations may help",
        "The swarm has converged on the best possible solution",
        "The fitness function must be wrong or badly scaled",
        "The velocities must all be exactly zero",
      ],
      0,
      "A radius of 70% means the particles are still spread out, so the search had not settled. The iteration limit cut it short.",
    ),
    {
      type: "order",
      q: "Order what happens at the end of one iteration of a PSO run.",
      items: [
        "Every particle's position is updated",
        "Every particle is scored at its new position",
        "Each personal best is updated if beaten",
        "The swarm's best is updated if beaten",
        "The stopping rules are tested",
      ],
      why: "Positions move first, then the new positions are scored. The bests are refreshed from the new scores, and the stopping rules then check the updated state.",
    },
    {
      type: "slider",
      q: "A swarm of 40 particles may run for up to 250 iterations, scoring each particle once per iteration. About how many fitness evaluations is that at most?",
      min: 0,
      max: 20000,
      step: 1000,
      ans: 10000,
      tol: 1500,
      hint: "40 × 250 is 4 × 25 × 100.",
      why: "40 × 250 = 10 000 evaluations. Doubling either the swarm size or the iteration limit doubles that.",
    },
    {
      type: "bug",
      q: "This loop should stop as soon as the swarm has converged (radius under 0.01). Click the faulty line.",
      code: [
        "it = 0",
        "while it < max_iters:",
        "    step_swarm()",
        "    if radius() > 0.01:",
        "        break",
        "    it += 1",
      ],
      a: 3,
      why: "The swarm has converged when the radius is below 0.01. The test as written stops the run the moment the swarm is still spread out.",
    },
    M(
      "Both acceleration coefficients are set far too high. Which behaviour does the lecture warn about?",
      [
        "Premature convergence: big pulls fling particles to the current best",
        "Slow progress, because the pulls are tiny and barely move anything",
        "The swarm size shrinks as weak particles are removed one by one",
        "The velocity is replaced by a probability of a 1 or a 0",
      ],
      0,
      "Too low values slow progress. Too high values may cause premature convergence: violent pulls throw the swarm onto whatever the current best is.",
    ),
  ]);

  // ---------- 12.5 binary PSO ----------
  B.add("l12-binary", [
    M(
      "A bit has velocity 0.6. Three random draws are 0.7, 0.3 and 0.5, in that order. Which bits result under the rule 'the bit is 1 if rand() is below v'?",
      ["0, 1, 1", "1, 0, 0", "1, 1, 1", "0, 0, 1"],
      0,
      "0.7 is not below 0.6, so 0. 0.3 is below 0.6, so 1. 0.5 is below 0.6, so 1.",
      { hint: "A draw is a 1 only if it is smaller than 0.6." },
    ),
    {
      type: "slider",
      q: "100 bits each have velocity 0.35 and use the rule 'the bit is 1 if rand() is below v'. About how many come out as 1?",
      min: 0,
      max: 100,
      step: 5,
      ans: 35,
      tol: 8,
      hint: "The velocity is the chance of a 1: 35%.",
      why: "Each bit is 1 with probability 0.35, so about 35 of 100 are 1.",
    },
    TF(
      "In traditional binary PSO the velocity is replaced by a bit.",
      false,
      "The velocity stays continuous and uses the original update rule. Only the position is turned into a 0 or 1 using the velocity as a probability.",
    ),
    {
      type: "cat",
      q: "Which binary PSO approach does each statement describe?",
      buckets: ["Velocity as probability", "Geometric (recombination)"],
      items: [
        ["A bit is 1 if rand() is below the velocity", 0],
        ["A mask picks bits from three strings", 1],
        ["Keeps the original continuous velocity update", 0],
        ["There is no explicit velocity", 1],
        ["Moves towards pbest and gbest in proportion to c₁ and c₂", 1],
        ["Needs the velocity to be read as a probability", 0],
      ],
      why: "Traditional BPSO keeps the real velocity and thresholds it. Geometric BPSO drops the velocity and recombines the current, personal-best and global-best strings.",
    },
    M(
      "How many positions differ between the bit strings 1011001 and 1101011 (their Hamming distance)?",
      ["3", "2", "4", "5"],
      0,
      "Compare position by position: 1/1 same, 0/1 differ, 1/0 differ, 1/1 same, 0/0 same, 0/1 differ, 1/1 same. Three differ.",
      { hint: "Lay the strings one above the other and count the mismatches." },
    ),
    {
      type: "bug",
      q: "This binary PSO update should use the velocity as a probability. Click the faulty line.",
      code: [
        "for j in range(D):",
        "    v[j] = clip(v[j] + c1*z1*(p[j]-x[j]) + c2*z2*(g[j]-x[j]), 0, 1)",
        "    x[j] = 1 if v[j] < random() else 0",
      ],
      a: 2,
      why: "The bit should be 1 when the random draw is below the velocity: random() < v[j]. As written, a large velocity makes a 1 less likely.",
    },
    {
      type: "order",
      q: "Order one step of geometric binary PSO for a single particle.",
      items: [
        "Choose how often to copy each source from c₁ and c₂",
        "Draw a mask with one source for each position",
        "Copy each bit from the string the mask names",
        "Score the new string",
        "Update the personal and global bests if beaten",
      ],
      why: "The weights set the mask's odds, the mask picks sources, the copy builds the new string, and only then can it be scored and compared with the bests.",
    },
    M(
      "Mask 1 means 'copy the current bit', 2 means 'copy the global best' and 3 means 'copy the personal best'. The mask is 1 2 3 1 3. The current string is 01001, the global best 11100 and the personal best 00110. What is the new string?",
      ["01100", "11100", "00110", "01001"],
      0,
      "Position 1 copies current (0). Position 2 copies the global best (1). Position 3 copies the personal best (1). Position 4 copies current (0). Position 5 copies the personal best (0). That gives 01100.",
    ),
    {
      type: "multi",
      q: "Which statements about binary PSO are true?",
      o: [
        "PSO generally needs a real vector but can be modified for binary strings",
        "One approach reads the velocity as the probability of a 1",
        "Another approach moves in Hamming space by recombining strings",
        "Geometric BPSO still adds a real velocity to each bit",
        "Binary PSO can only be used on static problems",
      ],
      a: [0, 1, 2],
      why: "Basic PSO is for real vectors, with two ways to handle bits: velocity as a probability, or geometric recombination without a velocity. PSO can also be modified for dynamic problems.",
    },
    M(
      "Under the slide's rule a bit's velocity reaches 1.4. What is the chance the next bit is 1?",
      [
        "Certain, since rand() is always below 1.4",
        "Zero, since the velocity is outside 0 to 1",
        "About 40%, the part above 1",
        "50%, since the rule is a coin toss",
      ],
      0,
      "rand() is always between 0 and 1, so it is always below 1.4 and the bit is always 1. That is why implementations keep the velocity within a range or squash it.",
    ),
    TF(
      "Geometric binary PSO needs the velocity to stay between 0 and 1.",
      false,
      "Geometric BPSO has no explicit velocity at all. Only the velocity-as-probability approach needs the velocity to behave like a probability.",
    ),
    M(
      "Besides discrete spaces, which kind of problem does the lecture say PSO can be modified for?",
      [
        "Dynamic optimisation problems",
        "Problems with no fitness function",
        "Problems with only one possible solution",
        "Problems solved by sorting",
      ],
      0,
      "The summary says PSO can be modified for discrete spaces and for dynamic optimisation problems, where the best solution changes over time.",
    ),
  ]);
})();
