/* l11-03: Lecture 11: 11.3 how boid flocks behave, 11.4 agents, percepts and environments. */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = (NIC.shared.nicL11 = NIC.shared.nicL11 || {});
  const { C, pr } = sh;
  const wrapBox = (box) => box.appendChild(el(`<div class="fig-wrap" aria-live="polite"></div>`));
  const demo = (title, o) => (root, life) => {
    const card = el(`<div class="card"><div class="card-head"><h2>${title}</h2></div><div data-box></div></div>`);
    root.appendChild(card);
    sh.flock(qs("[data-box]", card), life, { bare: true, ...o });
  };

  /* ============ 11.3 How boid flocks behave ============ */
  const BEHAVE = [
    ["Spontaneous polarisation", "alignment", "blue"],
    ["Staying together, joining up", "cohesion", "teal"],
    ["No collisions", "separation", "rose"],
    ["Turns that spread through the flock", "alignment and cohesion", "violet"],
    ["Flash expansion from a packed start", "separation", "rose"],
  ];
  sh.rulesFor = (box) => {
    const out = wrapBox(box);
    out.innerHTML = `<table class="t nw11-tbl"><tr><th>What you see</th><th>Mostly thanks to</th></tr>${BEHAVE.map(([a, b, c]) => `<tr class="fi"><td>${a}</td><td><span class="tag ${c}">${b}</span></td></tr>`).join("")}</table>`;
  };
  const behave = (extra) => ({ buttons: ["reset", "fast", "pause"], stats: ["polar", "groups"], ...extra });

  N.register({
    id: "l11-behave",
    lecture: 11,
    order: 3,
    num: "11.3",
    title: "How boid flocks behave",
    blurb: "Polarise, turn together, join, burst apart and form flockettes. Run the experiments on a live flock.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "With the three rules switched on, Reynolds' boids <b>polarise</b>, <b>turn together</b>, <b>join</b> when they meet and <b>burst apart</b> if started packed. This sandbox has a button for each experiment. Watch <b>Polarisation</b>, <b>Groups</b>, <b>Spread</b> and <b>Flock heading</b>.",
        ),
      );
      demo("Flock experiments", {
        buttons: ["reset", "together", "apart", "meet", "nudge", "fast", "pause"],
        sliders: ["R"],
        stats: ["polar", "groups", "spread", "heading"],
        trace: true,
      })(root, life);
      root.appendChild(
        pr(
          "l11-behave-1",
          "Let the flock settle, then press <b>Turn a third</b>. What happens to the <b>Flock heading</b>? | The whole flock settles on a new shared heading | The old heading returns as the turned boids rejoin | Two flocks form and fly in opposite directions | The turned third pulls its neighbours round, and alignment spreads the change, so everyone ends up on a new common heading.",
        ),
      );
      root.appendChild(
        pr(
          "l11-behave-2",
          "Set <b>Perception radius</b> to 30, press <b>Scatter</b> and wait, then compare with radius 120. Which leaves more groups? | Radius 30: short-sighted boids form several flockettes | Radius 120: boids that see more split into more groups | Neither: the radius only changes the speed | With a small radius, distant boids never sense each other, so separate flockettes persist. A wide radius lets one flock gather everyone.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Reynolds' flocks <b>spontaneously polarise</b> and <b>synchronise turns</b>, with no leader.",
            "Flocks <b>join</b> when they meet. Started packed they <b>burst apart</b> (flash expansion), and started far apart they may form <b>flockettes</b> that merge later.",
            "Each behaviour traces back to one or two of the three rules.",
          ],
          "Same three rules, many flock behaviours.",
        ),
      );
    },
  });

  L["l11-behave"] = {
    sum: "Boid flocks <b>polarise</b>, <b>turn together</b>, <b>join</b> on meeting, <b>burst apart</b> from a packed start and may form <b>flockettes</b>.",
    steps: [
      {
        t: "They polarise themselves",
        b: `<p>Reynolds' flocks <b>spontaneously polarise</b>. Start 60 boids with random headings and nobody in charge, and within seconds they head roughly the same way: polarisation climbs from about 0.1 to near 1. Press <b>Scatter</b> and watch the trace in the corner.</p><p>Alignment does the work. Each boid keeps nudging towards its neighbours' average, so small groups agree first, and agreeing groups then agree with each other.</p>`,
        v: (box, life) => sh.flock(box, life, behave({ trace: true, stats: ["polar", "heading"] })),
        c: C(
          "Which rule mainly makes the flock polarise? | Alignment | Separation | Cohesion | Alignment turns each boid towards its neighbours' average heading, so headings converge. Cohesion gathers boids and separation spaces them out.",
        ),
      },
      {
        t: "Turns that sweep through",
        b: `<p>Flocks also <b>synchronise their changes in direction</b>. If part of the flock turns, its neighbours follow, then their neighbours, and soon the whole flock has settled on a new shared heading.</p><p>For example, turn a third of the boids 90° and the flock does not split. Press <b>Turn a third</b>: <b>Flock heading</b> jumps at once, then the flock re-polarises.</p><details class="math-more"><summary>Show the maths</summary><p>Straight after the turn, two thirds still head the old way (weight 2) and one third heads 90° round (weight 1). Adding those arrows gives an average heading of</p><p>$$\\theta=\\arctan\\frac{1}{2}\\approx27^\\circ$$</p><p>from the old heading. The flock then settles a little further round as the boids keep adjusting.</p></details>`,
        v: (box, life) =>
          sh.flock(
            box,
            life,
            behave({ buttons: ["nudge", "reset", "fast"], stats: ["polar", "heading"], trace: true }),
          ),
        c: C(
          "A third of a flock turns sharply. What happens next? | Neighbours follow, and the flock settles on a new shared heading | The turned boids are cast out and the flock keeps its heading | The flock splits into two flocks for good | Alignment spreads the change outwards through the neighbours, so the flock turns as one.",
        ),
      },
      {
        t: "Flocks join when they meet",
        b: `<p>When two flocks meet they <b>join</b>. Boids at the edges sense the other flock's boids, align with them and move towards their centre, until a single flock remains. Press <b>Two flocks meet</b> and watch <b>Groups</b> fall from 2 to 1.</p><p>Usually this happens within about ten seconds (600 ticks), but not always: sometimes the flocks pass through each other and need longer to turn back. Press <b>Speed ×3</b> to hurry.</p>`,
        v: (box, life) =>
          sh.flock(box, life, behave({ buttons: ["meet", "fast", "pause"], sliders: ["R"], start: "meet" })),
        c: C(
          "Two flocks meet head-on and merge. Why? | Edge boids align with and approach the other flock | A leader boid in each flock negotiates and agrees a merger | Separation pulls the boids of both flocks closer together | Alignment and cohesion work across the gap between flocks. Separation only pushes boids apart.",
        ),
      },
      {
        t: "Packed start: flash expansion",
        b: `<p>If the boids <b>start together</b>, <b>flash expansion</b> occurs. In the sandbox 60 boids start inside a 36-unit square. Every boid is crowded, so separation pushes hard, and they fly off in all directions: the <b>Spread</b> grows from about 14 to between 140 and 190 within two seconds (100 ticks), about ten times wider. Cohesion and alignment then draw the pieces back into a flock.</p><p>Press <b>Start together</b> and watch <b>Spread</b> and <b>Groups</b>.</p>`,
        v: (box, life) =>
          sh.flock(
            box,
            life,
            behave({ buttons: ["together", "fast", "pause"], stats: ["spread", "groups"], start: "together" }),
          ),
        c: C(
          "All boids start packed into one small clump, heading in random directions. What do you see first? | A burst outwards, then regrouping | One tight flock that stays put | Boids frozen until the rules take over | Crowding makes separation push hard, and the boids fly apart before cohesion and alignment pull them back.",
        ),
      },
      {
        t: "Flockettes",
        b: `<p>If boids start <b>too far apart</b> they may slowly aggregate, or form small flocks called <b>flockettes</b>, which later merge, given enough time and a small enough space. How far a boid sees matters: with a radius of 30 many flockettes survive, and with 120 nearly everyone is in sight of a bigger flock. Our field wraps round so there are no edges to hide behind.</p><p>Drag <b>Perception radius</b>, press <b>Scatter</b> and compare <b>Groups</b>.</p>`,
        v: (box, life) => sh.flock(box, life, behave({ buttons: ["reset", "fast", "pause"], sliders: ["R"], R: 30 })),
        c: C(
          "What is a flockette? | A small flock that forms when boids start far apart | A single boid that has lost touch with its own flock | A lead boid that steers a small group of followers | Flockettes are small flocks that may later merge into larger ones if there is enough time and a small enough space.",
        ),
      },
      {
        t: "Which rule does which job",
        b: `<p>Each behaviour you have seen traces back to a rule. <b>Alignment</b> makes the flock agree on a heading and carries turns through it. <b>Cohesion</b> holds the flock together and joins flocks that meet. <b>Separation</b> stops collisions and pushes a packed start apart.</p><p>Switch cohesion off in a settled flock and the boids still agree on a heading but fall into several separate groups.</p>`,
        v: (box) => sh.rulesFor(box),
        c: C(
          "Cohesion is switched off in a settled flock. What happens? | Headings still agree, but the boids split into groups | They crash into each other almost constantly in the flock | They stop agreeing on a heading and drift off at random | Without cohesion nothing pulls groups together, though alignment still keeps headings matched.",
        ),
      },
    ],
    guide: [
      "Press <b>Scatter</b>, <b>Start together</b>, <b>Start far apart</b> and <b>Two flocks meet</b> in turn.",
      "Press <b>Turn a third</b> and read <b>Flock heading</b>. Drag <b>Perception radius</b>.",
      "Press <b>Speed ×3</b> to hurry. Answer the questions after the demo.",
    ],
  };

  /* ============ 11.4 Agents and environments ============ */
  const ENVS = {
    ttt: ["Noughts and crosses", ["Fully observable", 0], ["Deterministic", 0], ["Static", 0], ["Sequential", 1]],
    photo: [
      "Sorting photos, one at a time",
      ["Fully observable", 0],
      ["Deterministic", 0],
      ["Static", 0],
      ["Episodic", 0],
    ],
    drone: [
      "A drone in gusty woods",
      ["Partially observable", 1],
      ["Stochastic", 1],
      ["Dynamic", 1],
      ["Sequential", 1],
    ],
    boid: ["A boid in a flock", ["Partially observable", 1], ["Deterministic", 0], ["Dynamic", 1], ["Sequential", 1]],
  };
  const QS = [
    "Can it see everything?",
    "Same action, same result?",
    "Does the world change meanwhile?",
    "Do choices affect later ones?",
  ];
  sh.envs = (box) => {
    const out = wrapBox(box);
    out.innerHTML = `<div data-c class="nw11-pick"></div><div class="nw11-chips" data-k></div><p class="fig-cap" data-m></p>`;
    const show = (k) => {
      const [, ...p] = ENVS[k],
        hard = p.filter((x) => x[1]).length;
      qs("[data-k]", out).innerHTML = p
        .map(([n, h], i) => `<div class="nw11-chip ${h ? "hard" : "easy"}"><small>${QS[i]}</small>${n}</div>`)
        .join("");
      qs("[data-m]", out).innerHTML = `<b>${hard} of 4</b> properties make this environment harder for an agent.`;
    };
    qs("[data-c]", out).append(
      N.seg(
        Object.entries(ENVS).map(([k, v]) => [k, v[0]]),
        "ttt",
        show,
      ),
    );
    show("ttt");
  };
  const LEVELS = [
    ["A busy kitchen: pets, spills, people", "Real, but hard"],
    ["The same kitchen with pets shut out", "Fewer surprises"],
    ["An empty, tidy kitchen", "Few surprises"],
    ["An empty kitchen with floor markers", "Easy, less real"],
    ["A taped-off square of bare floor", "Easiest, least real"],
  ];
  sh.dial = (box) => {
    const out = wrapBox(box);
    out.innerHTML = `<div class="controls" data-c></div><div data-b></div><p class="fig-cap" data-m></p>`;
    const draw = (v) => {
      qs("[data-b]", out).innerHTML = F.bars(
        [
          ["Easy for the agent", v * 25, "teal"],
          ["Like the real world", 100 - v * 25, "violet"],
        ],
        { max: 100, unit: "%", label: "Ease against realism" },
      );
      qs("[data-m]", out).innerHTML = `<b>${LEVELS[v][0]}</b>. ${LEVELS[v][1]}.`;
    };
    const s = N.slider("Restrictions on the environment", 0, 4, 1, 0);
    s.onInput(draw);
    qs("[data-c]", out).append(s);
    draw(0);
  };
  const ROWS = [
    ["A human", "eyes, ears", "hands, legs"],
    ["A robot", "cameras, range finders", "motors, grippers"],
    ["A software agent", "keystrokes, files, network packets", "screen, files, network packets"],
    ["A boid", "flockmates' distance and bearing", "a turn, then a move"],
  ];
  const table = `<table class="t nw11-tbl"><tr><th>Agent</th><th>Sensors</th><th>Actuators</th></tr>${ROWS.map((r) => `<tr class="fi">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;

  N.register({
    id: "l11-agents",
    lecture: 11,
    order: 4,
    num: "11.4",
    title: "Agents and environments",
    blurb:
      "Sensors, actuators, percepts and the properties of an environment. A boid is an agent: click one to see its percept.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "An <b>agent</b> perceives its environment through <b>sensors</b> and acts on it through <b>actuators</b>. A boid is a very small agent. Click a boid: the purple one shows its current <b>percept</b> (what it senses) and its <b>action</b> (how it turns).",
        ),
      );
      demo("A boid as an agent", {
        n: 40,
        arrows: true,
        percept: true,
        sliders: ["R"],
        buttons: ["pause", "fast", "reset"],
      })(root, life);
      root.appendChild(
        pr(
          "l11-agents-1",
          "Set <b>Perception radius</b> to 20, press <b>Pause</b> and click a boid that has no flockmate inside its circle. What action does it show? | Keep straight on | Turn towards the nearest boid | Turn to a random heading | With an empty percept none of the three rules has anything to react to, so the boid simply continues.",
        ),
      );
      root.appendChild(
        pr(
          "l11-agents-2",
          "What does a boid's action depend on? | Only what it senses right now | Everything it has sensed since the start | A lead boid's orders | A boid responds immediately in one perception-to-action loop. It keeps no memory of earlier percepts, so it acts on the present percept alone.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "An <b>agent</b> senses with <b>sensors</b> and acts with <b>actuators</b>. A <b>percept</b> is one instant of input, a <b>percept sequence</b> is the whole history.",
            "The more restrictive the <b>environment</b>, the easier the task and the less realistic it is.",
            "Environments differ in <b>observability</b>, <b>determinism</b>, <b>dynamism</b> and whether choices are <b>episodic</b> or <b>sequential</b>.",
          ],
          "Sense, decide, act, and the world answers.",
        ),
      );
    },
  });

  L["l11-agents"] = {
    sum: "An <b>agent</b> senses its <b>environment</b> and acts on it. Environments differ in observability, determinism, dynamism and sequence.",
    steps: [
      {
        t: "What an agent is",
        b: `<p>An <b>agent</b> <b>perceives</b> its environment through <b>sensors</b> and <b>acts</b> upon it using <b>actuators</b>. A thermostat senses the temperature and switches a heater. A robot senses with cameras and acts with wheels.</p><p>The loop never stops: sense, decide, act, and the world changes, so the next thing sensed is different.</p>`,
        v: F.cycle(["Sensors take in a percept", "The agent decides", "Actuators act", "The environment changes"], {
          center: "agent",
        }),
        c: C(
          "A heater controller reads the room temperature. That reading is... | A percept, taken in by a sensor | An action, carried out by an actuator | The environment itself | A percept is what the agent perceives at an instant. The reading comes from a sensor.",
        ),
      },
      {
        t: "Percepts and percept sequences",
        b: `<p>A <b>percept</b> is what the agent perceives at one instant. Its <b>percept sequence</b> is the complete history of everything it has perceived. An agent's action can depend on its percept sequence, but not on anything it has never perceived.</p><p>For example, a lift that saw "button pressed on floor 3" and then "button pressed on floor 5" can use both. In the picture the purple boid is a forgetful agent: its percept is the flockmates it senses right now, and it acts at once.</p>`,
        v: (box, life) =>
          sh.flock(box, life, { n: 40, arrows: true, percept: true, sliders: ["R"], buttons: ["pause"] }),
        c: C(
          "A robot saw a red light a moment ago and sees green now. It may use... | Both: its percept sequence | Only the green light | Neither, as an agent cannot remember | The action may depend on the whole percept sequence, so the earlier red light can matter.",
        ),
      },
      {
        t: "Examples of agents",
        b: `<p>Agents come in many forms. A <b>human</b> senses with eyes and ears and acts with hands and legs. A <b>robot</b> senses with cameras and acts with motors. A <b>software agent</b> senses keystrokes, files and network packets and acts by writing to the screen, to files or to the network. A <b>boid</b> senses flockmates' distance and bearing and acts by turning.</p>`,
        v: table,
        c: C(
          "Which pairing fits a software agent? | Senses network packets, acts by sending packets | Senses with cameras and microphones, acts with motors | Senses with eyes and ears, acts with hands and legs | A software agent's sensors and actuators are data: files, keystrokes, packets. Cameras and motors suit a robot.",
        ),
      },
      {
        t: "Environments",
        b: `<p>The <b>environment</b> is the space the agent works in: a room, a network, a piece of software. The more <b>restrictive</b> the environment, the easier the agent's task, but the less realistic it is.</p><p>For example, a cleaning robot in a taped-off square of bare floor has an easy job. In a busy kitchen it is a real job and a hard one. Slide the restrictions and compare.</p>`,
        v: (box) => sh.dial(box),
        c: C(
          "Which environment is easiest for an agent but least realistic? | A taped-off square of bare floor | A busy street at rush hour | A crowded kitchen with pets | Restrictions remove surprises, so the task is easier, but the world is less like the real one.",
        ),
      },
      {
        t: "Four properties of an environment",
        b: `<p>Environments differ in four ways. <b>Observability</b>: can the agent see the whole state? <b>Determinism</b>: does the same action always give the same result? <b>Dynamism</b>: does the world change while the agent thinks? <b>Episodic vs sequential</b>: do today's choices affect later ones?</p><p>The more of these that are on the hard side (partial, random, changing, sequential), the harder the task. Pick the four tasks in the picture.</p>`,
        v: (box) => sh.envs(box),
        c: C(
          "A drone flies through gusty wind and cannot see behind trees. Which two properties does that show? | Stochastic and partially observable | Deterministic and fully observable | Static and episodic | Gusts make results unpredictable (stochastic) and the trees hide part of the state (partially observable).",
        ),
      },
      {
        t: "A boid is an agent",
        b: `<p>A boid fits the agent picture. Its <b>sensors</b> report flockmates' range and bearing. Its <b>actuator</b> is a turn. Its <b>environment</b> is an open field full of other boids: <b>partially observable</b> (only inside the radius) and <b>dynamic</b> (everyone else moves too). It acts on its current percept alone, with one perception-to-action loop.</p>`,
        v: F.flow(
          ["Sense flockmates in range", "Apply the three rules", "Turn and move", { t: "Others move too", c: "teal" }],
          { loop: true },
        ),
        c: C(
          "Why is a boid's environment only partially observable? | It senses only flockmates inside its radius | It cannot turn to look at flockmates beside it | The field is too small for the boids to see it all | A boid knows nothing about flockmates outside its radius, so it never sees the whole state.",
        ),
      },
    ],
    guide: [
      "Click different boids to see their <b>Percept</b> and <b>Action</b>. Drag <b>Perception radius</b>.",
      "Press <b>Pause</b> to freeze a frame, <b>Speed ×3</b> to hurry. Answer the questions after the demo.",
    ],
  };
})();
