(function () {
  const B = NIC.bank;
  const Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  /** pheromone on a trail that gets `ants` per step with evaporation rho, optionally stopping at step `stop` */
  const trail = (ants, rho, steps, stop = Infinity) => {
    const out = [0];
    for (let t = 1; t <= steps; t++) out.push(out[t - 1] * (1 - rho) + (t <= stop ? ants : 0));
    return out.map((v, i) => [i, v]);
  };

  B.add("l7-stig", [
    M(
      "What is stigmergy?",
      [
        "Communication through the environment",
        "Direct touch between neighbouring ants",
        "A leader's orders passed down a chain",
        "A way of storing a map in memory",
      ],
      0,
      "One agent changes the environment and another senses it later, so nobody needs to meet.",
    ),
    {
      type: "cat",
      q: "Is each example sematonic or sign-based stigmergy?",
      buckets: ["Sematonic", "Sign-based"],
      items: [
        ["A scent trail laid along a route to food", 1],
        ["A chalk arrow left on a hiking path", 1],
        ["An ant takes a posture that makes others start building a bridge", 0],
        ["A termite adds a pellet to a pile that attracts others to add more", 0],
        ["A beetle drops scent at every junction it crosses", 1],
        ["Pheromone laid on the way home from a food source", 1],
      ],
      why: "Sematonic: the action is itself the work and prompts others. Sign-based: the action leaves a mark that is not the work itself.",
    },
    M(
      "A trail holds 40 units of pheromone. No ant uses it, and a quarter evaporates each step. What does it hold after one step?",
      ["30", "10", "35", "20"],
      0,
      "A quarter of 40 is 10, so 40 − 10 = 30.",
    ),
    {
      type: "slider",
      q: "Each step 4 ants add one unit each to a trail, and 20% of the trail evaporates each step. About where does the trail level off?",
      min: 0,
      max: 60,
      step: 5,
      ans: 20,
      tol: 5,
      unit: " units",
      hint: "It levels off where gain equals loss. Gain is 4 per step. Loss is 20% of the level.",
      why: "At 20 units the loss is 20% × 20 = 4, the same as the gain, so it stops changing.",
    },
    M(
      "Trail A holds 30 units and trail B holds 10. A new ant picks in proportion to pheromone. About how likely is it to pick A?",
      ["About 75%", "About 50%", "About 30%", "About 90%"],
      0,
      "30 out of 40 is three quarters. B still gets a quarter, so weaker trails keep being tested.",
      { hint: "A holds 30 of the 40 units in total." },
    ),
    TF(
      "Ants always follow the strongest trail and never choose a weaker one.",
      false,
      "Ants prefer stronger trails but choose with a chance. A weak trail still gets some ants.",
    ),
    M(
      "How does evaporation help a colony that has found a better route?",
      [
        "Old trails fade, so the colony can switch",
        "It makes every trail stronger over time",
        "It stops ants from laying any more pheromone",
        "It sends ants back to the nest",
      ],
      0,
      "Without evaporation an early trail would stay for ever and block better routes.",
    ),
    {
      type: "order",
      q: "Order what happens to a trail that many ants use and then abandon.",
      items: [
        "Many ants walk it and it builds up",
        "Ants favour it because it is strong",
        "The colony stops using it",
        "No new pheromone is added",
        "Evaporation fades it towards zero",
      ],
      why: "Accumulation and preference come first. Once nobody uses the trail, only evaporation acts, and it fades.",
    },
    {
      type: "multi",
      q: "Which statements describe a pheromone trail?",
      o: [
        "Ants lay it as they travel",
        "It evaporates gradually",
        "Its strength builds up where many ants walk",
        "Ants prefer paths with more of it",
        "It never fades once it is laid",
      ],
      a: [0, 1, 2, 3],
      why: "These four are the lecture's facts. A trail that never faded could not forget bad routes.",
    },
    M(
      "Trail P gets 4 ants per step and trail Q gets 2 per step, with the same evaporation. When both have levelled off, how do their strengths compare?",
      ["P is about twice Q", "P is about four times Q", "They are about equal", "P is about half Q"],
      0,
      "Each level is ants ÷ evaporation, so with the same evaporation they are in the ratio 4 to 2.",
    ),
    M(
      "The graph shows a trail that levels off and then falls. What happened at step 20?",
      [
        "The ants stopped using the trail",
        "Evaporation was switched off",
        "More ants joined the trail",
        "The food source moved",
      ],
      0,
      "Nothing refills the trail after the ants stop, so evaporation pulls it towards zero.",
      {
        fig: NIC.fig.plot([{ pts: trail(4, 0.2, 40, 20), c: "blue" }], {
          x: [0, 40],
          y: [0, 24],
          xl: "step",
          yl: "trail strength",
          h: 190,
        }),
      },
    ),
    M(
      "Ants are behaviourally unsophisticated. Which feature of how they communicate matters most for the complex tasks a colony manages?",
      [
        "Sign-based stigmergy using pheromone",
        "Direct speech between pairs of ants",
        "A shared written plan",
        "Each ant remembering the route of every other ant",
      ],
      0,
      "Pheromone trails carry information between ants, so individual ants can stay simple.",
    ),
  ]);

  B.add("l7-tsp", [
    M(
      "In ACO on a delivery round, what does one ant's finished tour stand for?",
      [
        "A candidate solution",
        "The best solution found so far",
        "The strength of one road",
        "The final answer, with no need to compare",
      ],
      0,
      "Each ant builds one complete solution. Good ones are reinforced.",
    ),
    M(
      "In the lecture's four-city example, when is pheromone laid?",
      [
        "After the ant finishes, on the roads it used",
        "Only on the first road of every tour",
        "Before the ant picks its next town",
        "On every road equally",
      ],
      0,
      "An ant completes its tour first. Then evaporation is applied and the tour's roads are reinforced.",
    ),
    M(
      "A five-town map has towns A to E. An ant started at B, then went to D, then to A. Which towns may it choose next?",
      ["C or E", "Only C", "B, C or E", "Any of the five"],
      0,
      "B, D and A are in its tour memory. C and E are the towns it has not visited.",
    ),
    M(
      "An ant at town P weighs three towns by pheromone ÷ distance. Q has pheromone 30 at distance 5, R has 40 at distance 10 and S has 10 at distance 5. Which town is most likely?",
      ["Q", "R", "S", "R and S are equally likely"],
      0,
      "The weights are 30 ÷ 5 = 6, 40 ÷ 10 = 4 and 10 ÷ 5 = 2. Q has the largest.",
      { hint: "Work out each weight: 30 ÷ 5, 40 ÷ 10, 10 ÷ 5." },
    ),
    M(
      "An ant's three options have weights 8, 10 and 2. What is the chance it picks the one with weight 10?",
      ["50%", "10%", "80%", "100%"],
      0,
      "The weights total 20, and 10 ÷ 20 is a half.",
      { hint: "Add the weights first: 8 + 10 + 2." },
    ),
    TF(
      "After a tour, only the roads on the tour lose pheromone to evaporation.",
      false,
      "Evaporation affects every road. Only the tour's roads then receive a deposit.",
    ),
    M(
      "Evaporation keeps 50% of the pheromone. A road on the tour held 20 and the deposit is 4. What does it hold afterwards?",
      ["14", "24", "10", "4"],
      0,
      "Half of 20 is 10, then add 4 for 14.",
      { hint: "Halve first, then add the deposit." },
    ),
    {
      type: "order",
      q: "Order one cycle of a simple ant colony on a delivery round.",
      items: [
        "Place each ant on a random town",
        "Let each ant build a complete tour",
        "Measure the length of each tour",
        "Evaporate pheromone on every road",
        "Deposit pheromone on each tour's roads, then repeat",
      ],
      why: "Ants build and are scored, then the trails are updated, then the cycle starts again.",
    },
    {
      type: "cat",
      q: "Does each description belong to evaporation or to deposit?",
      buckets: ["Evaporation", "Deposit"],
      items: [
        ["Every road loses a fraction of its pheromone", 0],
        ["Only roads on the tour change", 1],
        ["It happens to roads the ant never used", 0],
        ["The amount depends on the tour length", 1],
        ["It can only make a road's pheromone smaller", 0],
        ["It can only make a road's pheromone larger", 1],
      ],
      why: "Evaporation shrinks everything. The deposit adds to the tour's roads, and it is bigger for shorter tours.",
    },
    M(
      "With Q = 60, one ant finds a tour of length 12 and another finds a tour of length 20. What does each deposit on every road of its tour?",
      ["5 and 3", "3 and 5", "5 and 5", "12 and 20"],
      0,
      "Deposit is Q ÷ length: 60 ÷ 12 = 5 and 60 ÷ 20 = 3. Shorter tours deposit more.",
      { hint: "60 ÷ 12, then 60 ÷ 20." },
    ),
    {
      type: "pick",
      q: "A delivery ant is at B, having started at A. Green towns are already in its tour memory. <b>Click every town it may choose next.</b>",
      fig: Qf.graph(
        { A: [60, 60], B: [200, 40], C: [340, 70], D: [300, 170], E: [110, 170] },
        [
          ["A", "B"],
          ["B", "C"],
          ["C", "D"],
          ["D", "E"],
          ["E", "A"],
        ],
        { pick: "nodes", w: 420, h: 220, hl: { A: "var(--teal)", B: "var(--teal)" } },
      ),
      a: ["C", "D", "E"],
      why: "A and B are in the tour memory. The ant can choose any town it has not visited: C, D or E.",
    },
    M(
      "The first ant on a map finds a poor tour and lays pheromone on it. Why is that not a disaster?",
      [
        "Later ants explore, and better tours deposit more",
        "Pheromone on poor tours never evaporates",
        "The first ant's tour is always kept as the answer",
        "Later ants are forbidden from using those roads",
      ],
      0,
      "A trail is only a probability weight. Later ants still try other tours, and shorter tours deposit more per road, so the trails shift.",
    ),
    TF(
      "An ant may revisit a town it has already been to if the road has strong pheromone.",
      false,
      "The tour memory forbids revisits, so every finished tour is a valid round trip.",
    ),
  ]);
})();
