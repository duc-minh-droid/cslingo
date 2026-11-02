/* Revision bank, Lecture 11 (flocking): l11-behave, l11-agents, l11-mas. */
(function () {
  const B = NIC.bank;
  const M = (q, right, wrong, why, x = {}) => ({ type: "mcq", q, o: [right, ...wrong], a: 0, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l11-behave", [
    M(
      "Boids start with random headings and nobody in charge, yet within seconds most head the same way. Which rule does most of this work?",
      "Alignment",
      ["Separation", "Cohesion"],
      "Alignment keeps turning each boid towards its neighbours' average heading, so agreement spreads.",
    ),
    {
      type: "slider",
      q: "Six boids: five head east and one heads west. Estimate the polarisation, from 0 (random) to 1 (all together).",
      min: 0,
      max: 1,
      step: 0.05,
      ans: 0.65,
      tol: 0.1,
      unit: "",
      hint: "Five east minus one west leaves 4 net arrows, out of 6.",
      why: "(5 − 1) ÷ 6 = 0.67. Most boids agree, but one pulls the score down.",
    },
    {
      type: "slider",
      q: "Two thirds of a flock head north and one third heads east. About how many degrees east of north is the flock's average heading?",
      min: 0,
      max: 90,
      step: 5,
      ans: 25,
      tol: 8,
      unit: "°",
      hint: "Two arrows north and one east: the average leans east, but by well under 45°.",
      why: "Two arrows north and one east add to a heading of arctan(1/2), about 27°. The flock then settles close to it.",
    },
    {
      type: "match",
      q: "Match each starting condition to what boid flocks do.",
      pairs: [
        ["All boids packed into one tiny square", "Flash expansion, then regrouping"],
        ["Two flocks flying towards each other", "They join into one flock"],
        ["Boids spread out with short sight", "Small flockettes that may merge later"],
        ["A third of the flock turns sharply", "The flock settles on a new shared heading"],
      ],
      why: "Packed starts burst apart, meeting flocks join, short-sighted boids form flockettes, and turns spread through the flock.",
    },
    {
      type: "order",
      q: "Order what happens when two boid flocks meet.",
      items: [
        "Boids at the edges sense the other flock's boids",
        "They align with the other flock's headings",
        "They move towards the combined centre",
        "The two flocks become a single flock",
      ],
      why: "Alignment and cohesion work across the gap between the flocks, and one flock remains.",
    },
    M(
      "Why does a packed start burst outwards (flash expansion)?",
      "Crowded boids are pushed hard apart by separation",
      [
        "Cohesion pushes every boid away from the middle",
        "The leader boid scatters the others",
        "Alignment forces all boids to turn the same way at once",
      ],
      "With everyone crowded, separation is strong, so the boids fly off in all directions before cohesion and alignment regroup them.",
    ),
    M(
      "The right-hand third of a boid flock turns away. Who decides what the left-hand boids do next?",
      "Each boid, from what its own neighbours do",
      [
        "The boid that turned first, as the flock's leader",
        "A central controller that watches the whole flock",
        "The boids that sit at the very front",
      ],
      "There is no leader: every boid reacts to its neighbours, and the change spreads from boid to boid.",
    ),
    TF(
      "A boid flock needs a leader boid before it can polarise.",
      false,
      "Polarisation is spontaneous. Alignment between neighbours is enough, with no dedicated leader.",
    ),
    {
      type: "multi",
      q: "Which are characteristics of Reynolds' boid flocks?",
      o: [
        "They spontaneously polarise",
        "They synchronise their changes in direction",
        "Flocks join when they meet",
        "They need one fixed leader",
        "They never form separate groups",
      ],
      a: [0, 1, 2],
      why: "Reynolds' flocks polarise, turn together and join. They have no leader and, if started far apart, can form separate flockettes.",
    },
    M(
      "A student sets the perception radius very small. What is most likely?",
      "Several separate flockettes remain",
      ["One huge flock forms at once", "The boids stop moving", "Every boid ends up heading a different way for good"],
      "Boids that cannot see far rarely sense other flocks, so flockettes form and may merge only slowly.",
    ),
  ]);

  B.add("l11-agents", [
    M(
      "A robot vacuum reads its bump sensor and then turns its wheels. Which is the percept?",
      "The bump sensor reading",
      ["The turn of the wheels", "The room itself", "The vacuum's battery"],
      "A percept is what the agent perceives at an instant. The wheel turn is an action.",
    ),
    {
      type: "match",
      q: "Match each part of a thermostat agent to its role.",
      pairs: [
        ["Temperature probe", "Sensor"],
        ["Heater switch", "Actuator"],
        ["The latest reading", "Percept"],
        ["Every reading since it was fitted", "Percept sequence"],
      ],
      why: "Sensors take percepts in, actuators act, and the percept sequence is the complete history of percepts.",
    },
    {
      type: "cat",
      q: "Is each of these a percept or an action?",
      buckets: ["Percept", "Action"],
      items: [
        ["The room temperature reading", 0],
        ["Switch the heater on", 1],
        ["A neighbour boid 40 units away", 0],
        ["Turn 5 degrees left", 1],
        ["A camera image of the road", 0],
        ["Set the motor speed to 2 m/s", 1],
      ],
      why: "Percepts come in through sensors. Actions go out through actuators.",
    },
    M(
      "How does restricting an agent's environment change the task?",
      "It makes the task easier but less realistic",
      [
        "It makes the task harder but more realistic",
        "It makes the task easier and more realistic",
        "It changes nothing, since agents adapt anyway",
      ],
      "The more restrictive the environment, the easier the agent's task, but the less like the real world it is.",
    ),
    {
      type: "cat",
      q: "Is the environment fully or partially observable to the agent?",
      buckets: ["Fully observable", "Partially observable"],
      items: [
        ["A noughts and crosses board", 0],
        ["A boid that sees only flockmates inside its radius", 1],
        ["A drone flying behind trees", 1],
        ["A sudoku grid on the screen", 0],
        ["A card game with hidden hands", 1],
      ],
      why: "If the agent can see the whole state the environment is fully observable. If some of it is hidden, it is partially observable.",
    },
    M(
      "A wheeled robot is told to move 1 m but its wheels sometimes slip, so it goes between 0.9 m and 1 m. Which property is this?",
      "Stochastic: the same action gives different results",
      [
        "Dynamic: the world changes while it thinks",
        "Episodic: each choice stands alone",
        "Partially observable: it cannot see the floor",
      ],
      "When the same action does not always give the same result, the environment is stochastic rather than deterministic.",
    ),
    M(
      "A taxi agent plans a route while traffic keeps moving. Which property does that show?",
      "The environment is dynamic",
      ["The environment is static", "The environment is episodic", "The environment is fully observable"],
      "A dynamic environment changes while the agent is still deciding.",
    ),
    M(
      "A spam filter judges each email by itself and its decisions never affect later emails. Which property is this?",
      "Episodic",
      ["Sequential", "Dynamic", "Stochastic"],
      "In an episodic environment each choice stands alone. In a sequential one, today's choice changes what comes next.",
    ),
    TF(
      "An agent's action may depend on something it has never perceived.",
      false,
      "An action can depend on the percept sequence, but not on anything the agent has not perceived.",
    ),
    {
      type: "order",
      q: "Order one pass round the agent loop.",
      items: [
        "Sensors take in a percept",
        "The agent decides what to do",
        "Actuators carry out the action",
        "The environment changes",
      ],
      why: "Sense, decide, act, and the environment responds, which changes the next percept.",
    },
    {
      type: "multi",
      q: "Which of these are actuators?",
      o: [
        "A robot's motors",
        "A software agent writing to a file",
        "A network packet being sent",
        "A camera taking a picture",
        "Keystrokes arriving from a user",
      ],
      a: [0, 1, 2],
      why: "Actuators are how an agent acts. Cameras and incoming keystrokes are sensors.",
    },
  ]);

  B.add("l11-mas", [
    M(
      "Why can a multi-agent system scale to many agents?",
      "Each agent only talks to its direct neighbours",
      [
        "One agent processes all the messages",
        "Every agent keeps a full copy of the others' memories",
        "Agents never need to communicate",
      ],
      "Local communication keeps the overhead per agent small however many agents there are.",
    ),
    {
      type: "slider",
      q: "8 agents each hold one direct link with every other agent, one link per pair. How many links is that?",
      min: 0,
      max: 60,
      step: 2,
      ans: 28,
      tol: 6,
      unit: " links",
      hint: "8 × 7 = 56, and each link is counted twice.",
      why: "8 × 7 ÷ 2 = 28. With only 2 ring neighbours each, 8 links would do.",
    },
    M(
      "50 agents sit on a ring and talk only to their two neighbours. About how many links are there?",
      "50",
      ["25", "100", "1,225"],
      "Each agent adds one link to the next, so a ring of 50 has 50 links. Everyone-to-everyone would need 50 × 49 ÷ 2 = 1,225.",
      { hint: "Each agent has one link to the next agent round the ring." },
    ),
    {
      type: "cat",
      q: "Is each of these systems cooperative or competitive?",
      buckets: ["Cooperative", "Competitive"],
      items: [
        ["Robots lifting one heavy crate together", 0],
        ["Two bidding agents after the last ticket", 1],
        ["Drones forming a picture in the sky", 0],
        ["Trading agents each chasing their own profit", 1],
      ],
      why: "Cooperative agents share a goal. Competitive agents have goals that conflict.",
    },
    {
      type: "match",
      q: "Match each way of organising agents to its description.",
      pairs: [
        ["Flat", "All agents are peers"],
        ["Hierarchical", "Orders pass down from an agent at the top"],
        ["Team", "Fixed groups, each with its own job"],
        ["Coalition", "Agents group up for a task"],
      ],
      why: "These are four common organisations of a multi-agent system.",
    },
    M(
      "A hospital's delivery robots all report to one control computer, which then crashes. What is the weakness?",
      "The control computer was a single point of failure",
      [
        "The robots exchanged too little information between them",
        "The robots were all built too much alike to cope",
        "The robots used too few neighbours to talk to",
      ],
      "Centralised fault detection or control means that if the central unit fails, the whole system loses it.",
    ),
    TF(
      "Most fault-detection research assumes that the agents are heterogeneous.",
      false,
      "The focus is often on homogeneous agents, although real agents are often heterogeneous.",
    ),
    M(
      "How do many fault detectors find a faulty agent?",
      "Classify messages as expected or unexpected, then check the senders",
      [
        "Shut agents down one at a time until the faults stop appearing",
        "Wait for each faulty agent to report itself to a central log",
        "Rank agents by how many messages each one sends in total",
      ],
      "Monitoring communications and then examining the agents behind the unexpected messages is a common approach.",
    ),
    {
      type: "order",
      q: "Order the steps of a message-monitoring fault detector.",
      items: [
        "Agents exchange messages",
        "Each message is classed as expected or unexpected",
        "Agents behind unexpected messages are examined",
        "A faulty agent is isolated",
      ],
      why: "Detection starts from the traffic, then narrows to the agents responsible, and only then isolates.",
    },
    {
      type: "multi",
      q: "Which are applications of multi-agent systems mentioned in the lecture?",
      o: [
        "Autonomous cars",
        "Multi-robot factories",
        "Automated trading",
        "Commercial games",
        "Single-user pocket calculators",
      ],
      a: [0, 1, 2, 3],
      why: "Multi-agent systems have a wide range of uses, from cars and factories to trading and games.",
    },
    M(
      "Who came up with particle swarm optimisation, and when?",
      "Kennedy and Eberhart, 1995",
      ["Reynolds and Levine, 1987", "Levine and Grassé, 1998", "Grassé and Franks, 1959"],
      "Kennedy and Eberhart (1995) turned the best bits of flocking into an optimisation algorithm. Reynolds' boids came first, in 1987.",
    ),
  ]);
})();
