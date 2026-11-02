(function () {
  const B = NIC.bank;
  const Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  /** Rings of scent round a food spot; each particle is pickable. */
  const rings = (P, food) =>
    `<svg viewBox="0 0 440 230" style="max-height:230px" role="group" aria-label="Rings of scent with the food at the centre. Particles ${Object.keys(P).join(", ")} stand at different distances from it.">${[
      18, 46, 76, 108,
    ]
      .map(
        (r) =>
          `<circle cx="${food[0]}" cy="${food[1]}" r="${r}" fill="var(--teal)" fill-opacity="0.12" stroke="var(--teal)" stroke-opacity="0.5"/>`,
      )
      .join("")}${Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<g data-pick="${k}" aria-label="Particle ${k}"><circle cx="${x}" cy="${y}" r="15" fill="var(--blue)" stroke="var(--panel)" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font:900 14px var(--sans);fill:var(--blue-on)">${k}</text></g>`,
      )
      .join("")}</svg>`;

  // ---------- 12.1 particles, swarm, optimisation ----------
  B.add("l12-swarm", [
    M(
      "Which of these does a PSO particle <b>not</b> have?",
      ["Mass and volume", "A position in the search space", "A velocity", "A fitness at its current position"],
      0,
      "A particle is only numbers: a position, a velocity and the acceleration that changes it. It has no mass or volume, so particles can overlap.",
    ),
    TF(
      "Particles in a swarm must keep apart, as real birds do, so that they never share a position.",
      false,
      "A particle has no mass or volume. Two particles can hold the same position and nothing happens.",
    ),
    M(
      "A field has a patch of seed that no bird can see from far away, yet within an hour a crowd is feeding there. Which feature of this does PSO borrow?",
      [
        "Individuals follow local cues and what others do, with no leader",
        "One bird sees the seed first and then directs every other bird to it",
        "Every bird keeps a full map of the field in its head",
        "Birds queue up so that each takes a turn at the seed",
      ],
      0,
      "This is the cornfield vector or rooster effect: the knowledge of the swarm sits in the local behaviour of each individual. Nobody leads and nobody holds a map.",
    ),
    {
      type: "cat",
      q: "Is each of these part of flocking boids (Lecture 11), of PSO, or of both?",
      buckets: ["Flocking only", "PSO only", "Both"],
      items: [
        ["Velocity matching with neighbours", 0],
        ["Remembering the best spot this individual has visited", 1],
        ["A group of simple individuals with no leader", 2],
        ["A pull towards the best position the swarm has found", 1],
        ["Every individual moves with a velocity", 2],
        ["Steering away from crowded flockmates", 0],
      ],
      why: "Both are swarms of simple movers. Velocity matching and separation belong to boids. Personal and global best memories belong to PSO, which leaves velocity matching out.",
    },
    M(
      "A swarm's best score at the end of three steps was 31, then 28, then 26, because the leading particle drifted off its peak. What is the swarm's best-so-far (gbest) fitness after step 3?",
      ["31", "26", "28", "85"],
      0,
      "gbest is a record of the best position ever found, so it can never get worse. The best was 31 at step 1 and no particle has beaten it.",
    ),
    {
      type: "order",
      q: "Order how a swarm search unfolds.",
      items: [
        "Scatter particles at random over the search space",
        "Score every particle with the fitness function",
        "Move each particle towards good positions it knows",
        "The cloud bunches up near high fitness",
        "Read off the best position found",
      ],
      why: "The search starts from random guesses, scores them, moves them using remembered good positions, and the swarm tightens around good ground. The answer is the best position found.",
    },
    TF(
      "Particle swarm optimisation guarantees that it finds the single best solution.",
      false,
      "It finds near-optimal solutions with a population of individuals. The lecture says near optimal because nothing proves that no better solution exists.",
    ),
    {
      type: "pick",
      q: "Scent is strongest at the centre of the rings. Click the particle with the best fitness right now.",
      fig: rings({ A: [60, 60], B: [160, 170], C: [255, 118], D: [345, 70], E: [390, 190] }, [250, 112]),
      a: "C",
      why: "The fitness here is the odour, which rises towards the centre. C stands nearest the middle, so it has the highest odour of the five.",
    },
    {
      type: "multi",
      q: "Which statements explain the three words in 'particle swarm optimisation'?",
      o: [
        "Particle: a candidate solution with no mass or volume",
        "Swarm: velocity matching is not included",
        "Optimisation: near-optimal solutions found by a population",
        "Swarm: one particle gives orders to the rest",
        "Optimisation: the search always ends on the exact optimum",
      ],
      a: [0, 1, 2],
      why: "A particle is a mass-free candidate solution. The swarm leaves out velocity matching and has no commander. Optimisation here means near-optimal answers from a population, not proof of the optimum.",
    },
    {
      type: "slider",
      q: "A swarm of 25 particles runs for 40 time steps. Each particle is scored once per step. About how many fitness evaluations is that?",
      min: 0,
      max: 2000,
      step: 100,
      ans: 1000,
      tol: 100,
      unit: "",
      hint: "25 × 40 is 25 × 4 × 10.",
      why: "25 particles × 40 steps = 1000 evaluations. This is why swarm size and iterations decide the cost of a run.",
    },
    M(
      "The lecture says the knowledge of the swarm is incorporated into the local behaviour of each particle. What does that mean here?",
      [
        "Each move includes a pull to the swarm's best, so shared knowledge shapes it",
        "A central controller tells each particle exactly where to move next",
        "Each particle stores a copy of the whole map of the search space",
        "The particles vote at the end of each step on which one is best",
      ],
      0,
      "There is no controller and no stored map. Each particle follows a local rule that includes a pull towards what the swarm knows, so knowledge flows into every move.",
    ),
  ]);

  // ---------- 12.2 continuous problems and the basic loop ----------
  B.add("l12-vectors", [
    {
      type: "cat",
      q: "How would a particle represent each of these problems?",
      buckets: ["Binary string", "Permutation", "Real vector"],
      items: [
        ["Choose which of 12 features to keep", 0],
        ["The order of nine deliveries", 1],
        ["Tune five gains of a controller", 2],
        ["Seat eight guests in a row", 1],
        ["Set the sweep angle of an aircraft wing", 2],
        ["Switch ten street lamps on or off", 0],
      ],
      why: "On-or-off choices are binary strings, orderings are permutations, and tunable dials that take any value in a range are real vectors, the case PSO was developed for.",
    },
    M(
      "A controller has six gains to tune, each any real number. How long is the position vector of one particle?",
      ["6", "1", "12", "36"],
      0,
      "One number per dial: six gains, six dimensions. A velocity of the same length is kept as well, but it is not extra dimensions.",
    ),
    TF(
      "PSO was developed for continuous representations.",
      true,
      "Basic PSO works on vectors of real numbers, which suits designs such as antennae, wings and controllers.",
    ),
    M(
      "A particle at (4.0, −1.5) has the new velocity (−1.0, 2.0). Where is it after the position update?",
      ["(3.0, 0.5)", "(5.0, −3.5)", "(3.0, −3.5)", "(5.0, 0.5)"],
      0,
      "Add the velocity component by component: 4.0 + (−1.0) = 3.0 and −1.5 + 2.0 = 0.5.",
      { hint: "First dimension 4 − 1, second dimension −1.5 + 2." },
    ),
    {
      type: "order",
      q: "Put the basic PSO loop in order.",
      items: [
        "Create and initialise N random particles",
        "Start a new time step",
        "For each particle, work out its new velocity",
        "Add that velocity to the particle's position",
        "Check the stopping rules before the next step",
      ],
      why: "The swarm is initialised once. Each time step then updates every particle's velocity and position, and the stopping rules decide whether another step happens.",
    },
    {
      type: "slider",
      q: "A swarm of 30 particles runs for 20 time steps. How many position updates happen in all?",
      min: 0,
      max: 1000,
      step: 50,
      ans: 600,
      tol: 50,
      hint: "30 × 20 is 3 × 2 × 100.",
      why: "Each of the 30 particles is moved at each of the 20 steps: 30 × 20 = 600.",
    },
    {
      type: "bug",
      q: "This function should do the PSO position update. Click the faulty line.",
      code: ["def move(x, v):", "    for j in range(len(x)):", "        x[j] = x[j] * v[j]", "    return x"],
      a: 2,
      why: "A position is moved by adding the velocity, not by multiplying. With a velocity of 0.5 the faulty line would halve every position.",
    },
    M(
      "A particle has velocity (0, 0) and no pull acts on it. What happens to its position at the next step?",
      [
        "It stays where it is",
        "It moves by its fitness",
        "It jumps to a random position",
        "It moves to the swarm's best position",
      ],
      0,
      "The position update adds the velocity. Adding zero changes nothing, and a velocity of 0 only changes when a pull acts.",
    ),
    {
      type: "multi",
      q: "Which of these can be written as a real vector for PSO?",
      o: [
        "The thickness in cm of each of four beams in a truss",
        "The order to deliver to eight shops",
        "The gain setting of each of three amplifier stages",
        "A 12-bit mask saying which options to include",
        "The angles of the three joints of a robot arm",
      ],
      a: [0, 2, 4],
      why: "Thicknesses, gains and joint angles are dials that take any value in a range, so a vector of real numbers fits. A delivery order is a permutation and an option mask is a bit string.",
    },
    {
      type: "cat",
      q: "Does each problem fit basic PSO as it is, or does it need a modification for discrete spaces?",
      buckets: ["Basic PSO fits", "Needs a discrete version"],
      items: [
        ["Choosing eight sensor settings, each a real number", 0],
        ["Choosing which 20 of 100 features to use", 1],
        ["Tuning the angle and span of a wing", 0],
        ["Setting bits of a 16-bit configuration word", 1],
        ["Finding the thickness of a circuit board layer", 0],
      ],
      why: "Basic PSO adds real velocities to real positions. Bit strings (and permutations) are discrete, so they need a binary or other discrete version.",
    },
    M(
      "In x<sup>t+1</sup><sub>ij</sub> = x<sup>t</sup><sub>ij</sub> + v<sup>t+1</sup><sub>ij</sub>, what does the t+1 on the velocity tell you?",
      [
        "The velocity just worked out for this step is added",
        "The velocity is taken from the next particle in the swarm",
        "The velocity is a prediction made one step in advance",
        "The velocity is added twice, once now and once later",
      ],
      0,
      "The velocity is updated first by the velocity rule, and that fresh value is then added to the position. i names the particle and j the dimension.",
    ),
  ]);

  // ---------- 12.3 updating velocities ----------
  B.add("l12-velocity", [
    M(
      "A particle has x = 2 and v = 1. Its own best is p = 6 and the swarm's best is g = 4. Take c₁ = 2, c₂ = 1, z₁ = 0.5 and z₂ = 0.5. Where is it after the update?",
      ["8", "6", "10", "3"],
      0,
      "Personal pull 2 × 0.5 × (6 − 2) = 4. Global pull 1 × 0.5 × (4 − 2) = 1. New velocity 1 + 4 + 1 = 6. New position 2 + 6 = 8.",
      { hint: "Work out each pull first, add both to v = 1, then add the new velocity to x = 2." },
    ),
    {
      type: "slider",
      q: "A particle is at x = 9 and its own best is p = 5. Take c₁ = 2 and z₁ = 0.25. What does the personal pull c₁ z₁ (p − x) add to the velocity?",
      min: -10,
      max: 10,
      step: 1,
      ans: -2,
      tol: 1,
      hint: "p − x = 5 − 9 = −4, and 2 × 0.25 = 0.5.",
      why: "0.5 × (−4) = −2. The pull is negative because p is below x: it draws the particle back down.",
    },
    M(
      "Which part of the velocity update brings in what the <b>whole swarm</b> has found?",
      ["c₂ z₂ (g − x)", "c₁ z₁ (p − x)", "The current velocity v", "The random draw z₁ on its own"],
      0,
      "g is the best position of the population. The pull c₂ z₂ (g − x) is the term that lets the experience of the whole swarm guide a particle.",
    ),
    {
      type: "cat",
      q: "Does each change make a particle lean on its own experience or on the swarm's?",
      buckets: ["Own experience counts for more", "The swarm's experience counts for more"],
      items: [
        ["Double c₁, keep c₂", 0],
        ["Double c₂, keep c₁", 1],
        ["Set c₂ to 0", 0],
        ["Set c₁ to 0", 1],
        ["Halve c₁, keep c₂", 1],
        ["Halve c₂, keep c₁", 0],
      ],
      why: "c₁ weights the pull to the particle's own best and c₂ the pull to the swarm's best. Raising one, or lowering the other, shifts the balance.",
    },
    TF(
      "z₁ and z₂ are constants chosen once before the run.",
      false,
      "c₁ and c₂ are the constants. z₁ and z₂ are fresh draws from the uniform distribution between 0 and 1.",
    ),
    M(
      "In a velocity update c₂ = 2 and the gap g − x is 3. Over many draws of z₂, what range can the global pull take?",
      ["From 0 up to 6", "Exactly 3 every time", "From 3 up to 6", "From −6 up to 6"],
      0,
      "z₂ lies between 0 and 1, so the pull 2 × z₂ × 3 runs from 0 to 6. It scales the pull but never reverses it.",
      { hint: "Try z₂ = 0 and z₂ = 1." },
    ),
    {
      type: "multi",
      q: "Which statements about the velocity update are true?",
      o: [
        "i labels the particle and j labels the dimension",
        "p is the best position that particle has visited itself",
        "g is the best position found by the whole population",
        "The pull to p is stronger the further the particle is from p",
        "The pull to g always points away from g",
      ],
      a: [0, 1, 2, 3],
      why: "The gap p − x grows as the particle moves away from p, so the pull grows too. Both pulls point towards their targets, scaled by c and z.",
    },
    {
      type: "order",
      q: "Order the pieces of one velocity update for particle i in dimension j.",
      items: [
        "Draw z₁ and z₂ from the uniform distribution",
        "Find the gaps p − x and g − x",
        "Scale the gaps by c₁ z₁ and c₂ z₂",
        "Add both pulls to the current velocity",
        "Add the new velocity to the position",
      ],
      why: "The draws and the gaps are needed before the pulls can be scaled. The scaled pulls are added to the old velocity, and the new velocity then moves the particle.",
    },
    {
      type: "bug",
      q: "This update should pull a particle towards its own best and towards the swarm's best. Click the faulty line.",
      code: [
        "v[i][j] = v[i][j]",
        "v[i][j] += c1 * z1 * (p[i][j] - x[i][j])",
        "v[i][j] += c2 * z2 * (g[j] - p[i][j])",
        "x[i][j] += v[i][j]",
      ],
      a: 2,
      why: "The global pull is the gap from the current position to the swarm's best, g − x. Using p in place of x measures from the wrong place.",
    },
    {
      type: "pick",
      q: "A particle is at A. Its own best is at B and the swarm's best is at C. Click the position that the c₂ pull points towards.",
      fig: Qf.points({ A: [1, 2], B: [6, 6], C: [7, 1] }, { max: 8 }),
      a: "C",
      why: "c₂ weights the pull to the swarm's best position, which is C. The pull to B is the c₁ term.",
    },
    M(
      "A particle sits exactly on its own best and on the swarm's best, with velocity 0. What is its velocity after the update?",
      [
        "0, because both gaps are zero",
        "Positive, because the pulls are positive",
        "It depends only on z₁ and z₂",
        "It equals c₁ + c₂",
      ],
      0,
      "The pulls are c₁ z₁ (p − x) and c₂ z₂ (g − x). With x = p = g both gaps are 0, so nothing is added to a velocity of 0.",
    ),
    {
      type: "slider",
      q: "Take c₂ = 4 and a gap g − x = 5. On average z₂ is about 0.5. What is the average global pull?",
      min: 0,
      max: 30,
      step: 1,
      ans: 10,
      tol: 2,
      hint: "4 × 0.5 = 2, and then 2 × 5.",
      why: "4 × 0.5 × 5 = 10. The pull on any one step ranges from 0 to 20, around that average.",
    },
  ]);
})();
