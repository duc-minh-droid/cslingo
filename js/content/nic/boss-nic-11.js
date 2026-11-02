/* Nature-Inspired boss quiz for Lecture 11 (flocking): a drone light show and a starling flock. Every number checked by hand. */
(function () {
  const N = NIC;
  /* Drone D is the only one outside the dashed circle. Drone B hides behind A, but boids have no occlusion, so both are sensed. */
  const DRONES = { A: [260, 110], B: [290, 110], C: [200, 60], D: [320, 150], E: [180, 100] };
  const droneFig = () =>
    `<svg viewBox="0 0 460 220" style="max-height:220px" role="group" aria-label="A boid in the middle with a dashed circle of radius 70. Drones A and B lie on one line to its right, both inside the circle. C and E are inside. D is outside."><circle cx="230" cy="110" r="70" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-dasharray="7 5"/><path d="M218 100 l24 10 l-24 10 l5 -10z" fill="var(--violet)"/>${Object.entries(
      DRONES,
    )
      .map(
        ([k, [x, y]]) =>
          `<g data-pick="${k}" aria-label="Drone ${k}"><circle cx="${x}" cy="${y}" r="11" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font:900 13px var(--sans);fill:var(--ink)">${k}</text></g>`,
      )
      .join("")}</svg>`;

  N.registerBoss({
    id: "l11-boss",
    lecture: 11,
    title: "Lecture 11 boss quiz",
    blurb: "Ten questions: a starling flock, a drone light show, the three boid rules, agents and a faulty robot.",
    lede: "A falcon over a starling roost, a stadium light show with 400 drones and a warehouse full of robots. Use what you know about flocking, Reynolds' boids, agents and multi-agent systems.",
    qs: [
      {
        type: "mcq",
        q: "A falcon dives at a starling flock. The birds burst outwards, then draw together into a single flock again. Which description fits best?",
        o: [
          "A reaction to a predator, then the flock coalesces again",
          "The lead starling gave the order to scatter and regroup",
          "Starlings stop flocking until the falcon has gone",
          "The flock split for good and became two new flocks",
        ],
        a: 0,
        why: "Flash expansion is a flocking reaction to predators, and flocks coalesce and split with no dedicated leader. Nobody ordered the burst or the regrouping.",
      },
      {
        type: "cat",
        q: "A light-show team writes down what its drones should do. Which of Reynolds' rules does each describe?",
        buckets: ["Separation", "Alignment", "Cohesion"],
        items: [
          ["Keep clear of a drone that is closing in", 0],
          ["Gradually match the heading of the drones around you", 1],
          ["Drift towards the middle of the nearby drones", 2],
          ["Back away from a drone that is almost touching", 0],
          ["Fly the same way as your neighbours", 1],
          ["Rejoin the group after a gust blows you off", 2],
        ],
        why: "Separation avoids crowding, alignment steers towards the neighbours' average heading and cohesion steers towards the neighbours' average position.",
      },
      {
        type: "pick",
        q: "A boid senses every flockmate inside the dashed circle, in all directions, with no noise. Click the one drone it <b>cannot</b> sense.",
        fig: droneFig(),
        a: "D",
        why: "D lies outside the circle. B sits behind A on the same line, but Reynolds' boids have no occlusion, so B is sensed too.",
      },
      {
        type: "slider",
        q: "Four boids fly in a line: three head east and one heads west. Estimate the flock's polarisation, from 0 (random) to 1 (all together).",
        min: 0,
        max: 1,
        step: 0.05,
        ans: 0.5,
        tol: 0.1,
        unit: "",
        hint: "Three arrows east and one west leave two net arrows east, out of four.",
        why: "Three east arrows minus one west arrow leave 2, and 2 ÷ 4 = 0.5. Half of the possible agreement.",
      },
      {
        type: "order",
        q: "Order one tick of a single boid, from the moment it starts.",
        items: [
          "Sense every flockmate inside the radius",
          "Work out the separation, alignment and cohesion pushes",
          "Add the three pushes, each times its weight",
          "Turn to the new heading",
          "Move one step along that heading",
        ],
        why: "A boid senses first, computes the three pushes, adds them with their weights, turns and then moves. Every boid does this at the same time.",
      },
      {
        type: "multi",
        q: "Which are among Reynolds' sensing assumptions for a boid?",
        o: [
          "It senses distance and bearing of every flockmate inside its radius",
          "A flockmate hidden behind another cannot be sensed",
          "Every boid has the same sensing range and accuracy",
          "Each reading carries a random error",
          "It reacts at once, with one perception-to-action loop",
        ],
        a: [0, 2, 4],
        why: "The boid's sensing is local, identical for all, noise-free and without occlusion, and the response is immediate. Hidden boids and random error are not assumed.",
      },
      {
        type: "mcq",
        q: "A parcel-sorting arm sees each parcel in full, always behaves the same way for a given command, and judges each parcel on its own. How is its environment best described?",
        o: [
          "Fully observable, deterministic and episodic",
          "Partially observable, stochastic and sequential",
          "Fully observable, stochastic and sequential",
          "Partially observable, deterministic and episodic",
        ],
        a: 0,
        why: "Seeing the whole parcel makes it fully observable, a repeatable result makes it deterministic and judging each parcel alone makes it episodic.",
      },
      {
        type: "mcq",
        q: "12 warehouse robots must each hold one direct link with every other robot, one link per pair. How many links is that?",
        o: ["66", "24", "132"],
        a: 0,
        hint: "12 × 11 = 132, but each link joins two robots.",
        why: "Each of 12 robots pairs with 11 others, which counts every link twice: 12 × 11 ÷ 2 = 66. A ring of neighbours would need only 12.",
      },
      {
        type: "bug",
        q: "This routine should give a drone its cohesion push, towards the centre of its neighbours. Click the faulty line.",
        code: [
          "for d in drones:",
          "    near = [o for o in drones if o is not d and dist(d, o) < radius]",
          "    push = sum(d.pos - o.pos for o in near if dist(d, o) < 2)",
          "    match = mean(o.vel for o in near) - d.vel",
          "    pull = d.pos - mean(o.pos for o in near)",
          "    d.vel += 1.0 * push + 0.1 * match + 0.01 * pull",
        ],
        a: 4,
        why: "Cohesion points towards the neighbours' centre, so it must be mean(o.pos) - d.pos. As written the drone is pushed away from its neighbours. The push line points away from close drones, which is right for separation.",
      },
      {
        type: "match",
        q: "Match each idea about agents and their systems to its meaning.",
        pairs: [
          ["Sensor", "Takes a percept in from the environment"],
          ["Actuator", "Carries out the agent's chosen action"],
          ["Percept sequence", "Everything the agent has perceived so far"],
          ["Single point of failure", "One part whose breakdown stops the whole detection system"],
        ],
        why: "Sensors take percepts in and actuators act. The percept sequence is the complete history, and a central fault detector is a single point of failure.",
      },
    ],
  });
})();
