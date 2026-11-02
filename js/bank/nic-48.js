/* Revision bank, Lecture 11 (flocking): l11-flock, l11-boids. */
(function () {
  const B = NIC.bank;
  const M = (q, right, wrong, why, x = {}) => ({ type: "mcq", q, o: [right, ...wrong], a: 0, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  /** A boid at the centre with flockmates (green dots) and four candidate push arrows to pick from. */
  const arrows = () => {
    const ar = (id, dx, dy) =>
      `<g data-pick="${id}" style="cursor:pointer"><circle cx="${230 + dx * 1.7}" cy="${105 + dy * 1.7}" r="19" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/><path d="M${230 + dx * 0.8} ${105 + dy * 0.8} L${230 + dx * 1.7} ${105 + dy * 1.7}" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><circle cx="${230 + dx * 1.7}" cy="${105 + dy * 1.7}" r="6" fill="var(--blue)"/></g>`;
    const mates = [
      [300, 55],
      [330, 75],
      [310, 105],
      [285, 40],
    ];
    return `<svg viewBox="0 0 460 210" style="max-height:210px" role="group" aria-label="A boid in the middle. Its flockmates are all to the upper right. Four arrows point upper right, lower left, upper left and lower right.">${mates.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="var(--teal)"/>`).join("")}<path d="M218 95 l24 10 l-24 10 l5 -10z" fill="var(--violet)"/>${ar("ne", 42, -42)}${ar("sw", -42, 42)}${ar("nw", -42, -42)}${ar("se", 42, 42)}</svg>`;
  };

  B.add("l11-flock", [
    M(
      "A slime mould sits on a plate where the food has just run out. What do its cells do?",
      "Crawl together into one slug that can move off",
      [
        "Stay apart and each search for food alone",
        "Choose one cell as a leader and follow its path",
        "Divide quickly so the plate fills with cells",
      ],
      "When food is scarce the separate cells form a multicellular slug that moves as a unit, with no cell in charge.",
    ),
    TF(
      "A cloud of fruit flies that keeps together without agreeing on a direction is an example of coordinated flocking.",
      false,
      "Fruit flies swarm: they stay together but are not coordinated. Flocking means members head the same way.",
    ),
    {
      type: "cat",
      q: "Is each of these a characteristic of flocking?",
      buckets: ["A flocking characteristic", "Not a flocking characteristic"],
      items: [
        ["The whole flock moves quickly in one direction", 0],
        ["One dedicated leader steers every turn", 1],
        ["Members swerve away from a predator", 0],
        ["Members collide often when the flock turns", 1],
        ["Two flocks coalesce, or one splits in two", 0],
        ["The flock falls apart as soon as a member leaves", 1],
      ],
      why: "Flocks move fast and react to predators and obstacles without collisions, coalesce and split, tolerate members leaving or joining, and have no dedicated leader.",
    },
    M(
      "A herd of wildebeest crosses a plain in one moving mass. What does this suggest about flocking?",
      "It occurs on land as well as in air and water",
      [
        "It is limited to animals that can fly",
        "It needs a medium that carries scent",
        "It happens only in groups of fish",
      ],
      "Flocking appears in all media (air, water and land) and in many animal families.",
    ),
    {
      type: "slider",
      q: "A herring shoal is 17 miles long. About how many kilometres is that?",
      min: 0,
      max: 60,
      step: 1,
      ans: 27,
      tol: 4,
      unit: " km",
      hint: "One mile is about 1.6 km. 17 × 1.6 is 17 + 10 = 27.",
      why: "17 × 1.6 ≈ 27 km. Shoals can be vast, yet each fish follows the same simple local rules.",
    },
    M(
      "A school of sardines keeps bumping into each other as it turns. Which urge is too weak?",
      "Repulsion, which keeps members from crowding",
      [
        "Attraction, which keeps members together",
        "The pull of the environmental template",
        "The memory of the flock's leader",
      ],
      "Collisions mean members get too close, so repulsion (segregation) is not strong enough.",
    ),
    {
      type: "order",
      q: "Order the gap between two neighbours from smallest to largest by what the urges do.",
      items: [
        "Far too close: repulsion pushes them apart",
        "A comfortable gap: the two urges cancel",
        "Too far: attraction pulls them together",
      ],
      why: "At short range repulsion wins, in the middle the urges balance, and at long range attraction wins. The flock holds its spacing around the balanced gap.",
    },
    M(
      "Starlings hold their route using their neighbours and the Earth's magnetic field. What is the magnetic field here?",
      "An environmental template that guides the flock",
      [
        "A dedicated leader that every bird follows",
        "A pheromone trail laid by earlier flocks",
        "A repulsion zone around each bird",
      ],
      "Flocks combine neighbour mimetism with an environmental template such as a magnetic or odour field.",
    ),
    M(
      "A goose manages 600 km alone. In a V-formation it can go over 70% further. About how far is that?",
      "Over 1,000 km",
      ["About 700 km", "About 800 km", "About 900 km"],
      "70% of 600 is 420, and 600 + 420 = 1,020 km, so a V-formation takes it past 1,000 km.",
      { hint: "70% of 600 is 420." },
    ),
    {
      type: "multi",
      q: "Which are benefits of flocking mentioned in the lecture?",
      o: [
        "Geese in a V-formation can fly further",
        "Fish cast off slime that cuts turbulence",
        "Antelope pronging may confuse a predator",
        "A flock guarantees that no member is ever caught",
        "The flock needs fewer members as it grows",
      ],
      a: [0, 1, 2],
      why: "Flocking extends range, reduces turbulence and repels predators. It does not make any member safe for certain.",
    },
    {
      type: "match",
      q: "Match each animal to how it gains from flocking.",
      pairs: [
        ["Geese in a V", "Fly further than they could alone"],
        ["Fish shedding slime", "Less turbulence, so less energy to swim"],
        ["Antelope pronging", "Visual confusion for a predator"],
        ["Fish in flash expansion", "Burst apart to repel a predator"],
      ],
      why: "Each behaviour pays in a different way: range, calmer water, confusion, or a startling burst.",
    },
  ]);

  B.add("l11-boids", [
    M(
      "Craig Reynolds wanted to animate flocks. What did he want from the animation?",
      "Realistic, 3D flocks that are cheap to compute",
      [
        "Exact copies of one filmed flock's paths",
        "A flock steered by one lead animator frame by frame",
        "Flat 2D flocks with scripted routes",
      ],
      "His goal was realism in 3D at low computing cost, which is why each boid has a few local rules and not a script.",
    ),
    {
      type: "cat",
      q: "Is each of these among Reynolds' assumptions about a boid's sensing?",
      buckets: ["Assumed", "Not assumed"],
      items: [
        ["Every boid senses in the same way", 0],
        ["Distance and bearing readings have no noise", 0],
        ["Flockmates can hide behind each other", 1],
        ["A boid reacts straight away", 0],
        ["Boids differ in how far they can see", 1],
        ["A boid sees only straight ahead", 1],
      ],
      why: "Sensing is local, all-direction, noise-free, occlusion-free, identical for all, and the response is immediate.",
    },
    {
      type: "slider",
      q: "A drone's personal space is 20 m. A flockmate is 8 m away. Separation pushes with strength 1 minus the distance over 20. Estimate the strength, from 0 to 1.",
      min: 0,
      max: 1,
      step: 0.05,
      ans: 0.6,
      tol: 0.1,
      unit: "",
      hint: "8 out of 20 is 0.4, so 1 − 0.4 is?",
      why: "1 − 8/20 = 0.6. At distance 0 the push would be 1, and at 20 it would fade to 0.",
    },
    {
      type: "bug",
      q: "This routine should give a boid its alignment push. Click the faulty line.",
      code: [
        "near = [o for o in boids if o is not d and dist(d, o) < radius]",
        "avg = mean(o.vel for o in near)",
        "turn = d.vel - avg",
        "d.vel += 0.1 * turn",
      ],
      a: 2,
      why: "Alignment steers towards the average heading, so the push must be avg - d.vel. As written the boid turns away from its neighbours' heading.",
    },
    M(
      "Used on its own, which rule gathers boids into clumps that need not head the same way?",
      "Cohesion",
      ["Alignment", "Separation"],
      "Cohesion pulls boids towards their neighbours' centre. Alignment matches headings and separation pushes boids apart.",
    ),
    M(
      "A designer sets the separation weight to 0 and leaves the rest. What is most likely to happen?",
      "A flock still forms, but boids overlap",
      [
        "No flock ever forms, as separation made it",
        "The boids stop moving at all",
        "The boids turn to face away from each other",
      ],
      "Alignment and cohesion still pull the flock together. Only separation stops boids crowding on top of each other.",
    ),
    {
      type: "order",
      q: "Order the stages of a simple flock simulation.",
      items: [
        "Place boids at random with random headings",
        "For each boid, sense flockmates inside the radius",
        "Work out the three pushes for every boid",
        "Update all headings together",
        "Move every boid and redraw",
      ],
      why: "Every boid senses and decides from the same snapshot, then all update together and move.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Separation", "Steer to avoid crowding local flockmates"],
        ["Alignment", "Steer towards the average heading of flockmates"],
        ["Cohesion", "Steer towards the average position of flockmates"],
        ["Perception radius", "How far away a boid can sense flockmates"],
      ],
      why: "These are the three rules and the sensing range they work within.",
    },
    {
      type: "pick",
      q: "A boid's flockmates are all to its upper right. <b>Click the arrow that shows the push from cohesion.</b>",
      fig: arrows(),
      a: "ne",
      why: "Cohesion moves a boid towards the average position of its flockmates, which here is up and to the right.",
    },
    M(
      "A boid cannot sense a flockmate's velocity directly. How does it estimate it?",
      "From two readings of the flockmate's position",
      [
        "From the flockmate's sound as it passes",
        "From a signal broadcast by a lead boid",
        "From a pheromone trail it leaves behind",
      ],
      "Second-order variables such as velocity are estimated from two first-order measurements, the positions.",
    ),
    TF(
      "A boid remembers where every flockmate was ten seconds ago and uses it to decide.",
      false,
      "Reynolds assumed an immediate response: one perception-to-action loop with no memory of earlier percepts.",
    ),
    M(
      "A designer wants a tighter flock and may change one weight, leaving the others alone. Which change helps?",
      "Raise cohesion",
      ["Raise separation", "Lower cohesion", "Lower alignment"],
      "A stronger pull towards the neighbours' centre packs the flock in. Raising separation would spread it out.",
    ),
  ]);
})();
