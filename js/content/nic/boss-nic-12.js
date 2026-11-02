/* Nature-Inspired boss quiz for Lecture 12 (particle swarm optimisation): a kite workshop, fresh scenarios, mixed formats. Numbers checked by hand. */
(function () {
  const N = NIC;
  /** Pick figure: rings of scent round the food; each particle is a pickable dot. */
  const field = () => {
    const P = { A: [70, 165], B: [150, 55], C: [238, 122], D: [330, 62], E: [385, 170] };
    const rings = [20, 48, 78, 110]
      .map(
        (r) =>
          `<circle cx="250" cy="112" r="${r}" fill="var(--teal)" fill-opacity="0.12" stroke="var(--teal)" stroke-opacity="0.5"/>`,
      )
      .join("");
    const dots = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<g data-pick="${k}" aria-label="Particle ${k}"><circle cx="${x}" cy="${y}" r="15" fill="var(--blue)" stroke="var(--panel)" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font:900 14px var(--sans);fill:var(--blue-on)">${k}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 440 230" style="max-height:230px" role="group" aria-label="Rings of scent with the food at the centre. Five particles A to E stand at different distances from the centre. C is closest to the centre.">${rings}${dots}</svg>`;
  };

  N.registerBoss({
    id: "l12-boss",
    lecture: 12,
    title: "Lecture 12 boss quiz",
    blurb:
      "Ten questions: particles and swarms, the velocity update, stopping rules and bit strings, all on a kite maker's bench.",
    lede: "A kite workshop tunes designs with a particle swarm. Each particle is a trio of numbers, the wind is the fitness, and the owner wants answers without a calculator. Use what you know about pbest, gbest, c₁, c₂, stopping rules and binary PSO.",
    qs: [
      {
        type: "mcq",
        q: "The kite workshop searches for a steady-flying design. It tunes three numbers per kite: tail length, bridle angle and spar flex. In PSO terms, what is one particle?",
        o: [
          "One trial setting of the three numbers, with a velocity",
          "The best flight score found by any kite on the field so far",
          "The strength of the wind on the test field",
          "The full set of kites flown in one afternoon",
        ],
        a: 0,
        why: "A particle is a candidate solution: here, one complete setting of the three numbers, plus a velocity saying how it will change. The best score so far is gbest's fitness, and the set of all particles is the swarm.",
      },
      {
        type: "cat",
        q: "Sort these problems by how a particle would represent them.",
        buckets: ["Binary string", "Permutation", "Real vector"],
        items: [
          ["Which of 12 sensors to fit to a kite", 0],
          ["The order to test six kites in one afternoon", 1],
          ["Tail length, in metres, as any value from 0.5 to 3", 2],
          ["Which of 9 spars to swap for carbon fibre", 0],
          ["Seating order of five testers at a table", 1],
          ["The spar flex and bridle angle as two decimals", 2],
        ],
        why: "Choosing items on or off is a binary string. An ordering of items is a permutation. Settings that can take any value in a range are a real vector, the case PSO was developed for.",
      },
      {
        type: "match",
        q: "The workshop wants a stopping rule for each of four situations. Match each one.",
        pairs: [
          ["The flight score passes the buyer's target of 90", "Acceptable solution found"],
          ["The run has used its budget of 400 time steps", "Maximum number of iterations"],
          ["No kite has beaten the record for 30 steps", "No improvement for N iterations"],
          ["All particles now sit almost on top of each other", "Normalised swarm radius near zero"],
        ],
        why: "A target reached is an acceptable solution. A fixed budget is a maximum number of iterations. A flat record is no improvement. A swarm squeezed into one place has a normalised radius near zero.",
      },
      {
        type: "slider",
        q: "One kite's spar-flex setting is x = 10 with velocity v = 2. Its own best is p = 16 and the swarm's best is g = 6. Take c₁ = 2, c₂ = 2, z₁ = 0.5 and z₂ = 0.5. Where is it after the update?",
        min: 0,
        max: 30,
        step: 1,
        ans: 14,
        tol: 1,
        hint: "Personal pull: 2 × 0.5 × (16 − 10) = 6. Global pull: 2 × 0.5 × (6 − 10) = −4. New velocity = 2 + 6 − 4, then add it to 10.",
        why: "The new velocity is 2 + 6 − 4 = 4. The new position is 10 + 4 = 14.",
      },
      {
        type: "order",
        q: "Put one time step of one particle in order.",
        items: [
          "Draw fresh random numbers z₁ and z₂",
          "Add the two pulls to the current velocity",
          "Add the new velocity to the position",
          "Score the particle at its new position",
          "Update its personal best and the swarm's best if beaten",
        ],
        why: "The pulls need z₁ and z₂ first. The new velocity is made from the old one plus the pulls, then added to the position. Only then can the new position be scored and the bests updated.",
      },
      {
        type: "pick",
        q: "The rings show scent, strongest at the centre. No particle has ever been closer to the food than where it stands now. Click the particle that holds the swarm's best position (gbest).",
        fig: field(),
        a: "C",
        why: "gbest is the best position found by anyone. The scent is strongest at the centre, and particle C is the closest, so C holds it. Particles never see the food: they compare scent only.",
      },
      {
        type: "multi",
        q: "Which statements about z₁ and z₂ in the velocity update are true?",
        o: [
          "They are two different draws from the uniform distribution between 0 and 1",
          "They are redrawn so the same pulls give a different step each time",
          "They help prevent premature convergence",
          "They are constants set once before the run, like c₁ and c₂",
          "They make the pulls always push the particle away from the bests",
        ],
        a: [0, 1, 2],
        why: "z₁ and z₂ are fresh random draws between 0 and 1. That randomness spreads the swarm and prevents premature convergence. c₁ and c₂ are the constants, and a draw between 0 and 1 only scales a pull, it never reverses it.",
      },
      {
        type: "slider",
        q: "In binary PSO a bit has velocity 0.7. The workshop draws it 200 times with the rule 'the bit is 1 if rand() is below v'. About how many of the 200 bits come out as 1?",
        min: 0,
        max: 200,
        step: 10,
        ans: 140,
        tol: 15,
        hint: "A velocity of 0.7 is a 70% chance. What is 70% of 200?",
        why: "With probability 0.7 for each draw, about 0.7 × 200 = 140 bits are 1. It will not be exactly 140 every time, because each draw is random.",
      },
      {
        type: "bug",
        q: "This code should apply the lecture's velocity and position updates to particle i, dimension j. Click the faulty line.",
        code: [
          "for j in range(D):",
          "    z1, z2 = random(), random()",
          "    v[i][j] = v[i][j] + c1*z1*(p[i][j] - x[i][j]) + c2*z2*(x[i][j] - g[j])",
          "    x[i][j] = x[i][j] + v[i][j]",
        ],
        a: 2,
        why: "The global pull must be g − x so it points towards the swarm's best. Writing x − g reverses it and pushes the particle away from the best position.",
      },
      {
        type: "mcq",
        q: "A bit has velocity 0.25. Three random draws are 0.1, 0.4 and 0.2, in that order. Which three bits result under the rule 'the bit is 1 if rand() is below v'?",
        o: ["1, 0, 1", "0, 1, 0", "1, 1, 1", "0, 0, 0"],
        a: 0,
        hint: "A draw below 0.25 gives a 1.",
        why: "0.1 is below 0.25, so 1. 0.4 is not, so 0. 0.2 is below 0.25, so 1. The result is 1, 0, 1.",
      },
    ],
  });
})();
