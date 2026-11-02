/* l11-workshop: Lecture 11: 11.5 multi-agent systems, and workshop 11.W, the boids lab (no code). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL11;
  const { C, pr, svgBox, tint } = sh;
  const wrapBox = (box) => box.appendChild(el(`<div class="fig-wrap" aria-live="polite"></div>`));

  /* ============ 11.5 Multi-agent systems ============ */
  const ringAt = (i, n, r = 82) => [
    230 + r * Math.cos((i / n) * 6.2832 - 1.5708),
    108 + r * Math.sin((i / n) * 6.2832 - 1.5708),
  ];
  /** n agents: everyone talking to everyone, against each agent talking only to its two ring neighbours. */
  sh.links = (box) => {
    const out = wrapBox(box);
    out.innerHTML = `<div class="controls" data-c></div><div data-s></div><div data-b></div><p class="fig-cap" data-m></p>`;
    const draw = (n) => {
      const all = (n * (n - 1)) / 2,
        pts = Array.from({ length: n }, (_, i) => ringAt(i, n));
      const chords = pts
        .flatMap((p, i) =>
          pts
            .slice(i + 1)
            .map(
              (q) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--rose)" opacity=".28"/>`,
            ),
        )
        .join("");
      const ring = pts
        .map(
          (p, i) =>
            `<line x1="${p[0]}" y1="${p[1]}" x2="${pts[(i + 1) % n][0]}" y2="${pts[(i + 1) % n][1]}" stroke="var(--teal)" stroke-width="3.5"/>`,
        )
        .join("");
      qs("[data-s]", out).innerHTML = svgBox(
        460,
        216,
        `${chords}${ring}${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="var(--blue)"/>`).join("")}`,
        `${n} agents: red lines are every pair, green lines are neighbours only`,
      );
      qs("[data-b]", out).innerHTML = F.bars(
        [
          ["Everyone talks to everyone", all, "rose"],
          ["Neighbours only", n, "teal"],
        ],
        { max: 435, label: "Links needed" },
      );
      qs("[data-m]", out).innerHTML = `With <b>${n}</b> agents: <b>${all}</b> links against <b>${n}</b>.`;
    };
    const s = N.slider("Number of agents", 4, 30, 2, 10);
    s.onInput(draw);
    qs("[data-c]", out).append(s);
    draw(10);
  };
  const ORG = {
    flat: ["Flat", "All agents are peers: no one is in charge."],
    tree: ["Hierarchical", "Orders pass down from a top agent through layers."],
    team: ["Team", "Fixed groups, each working on its own job."],
    coal: ["Coalition", "Agents group up for a task, and groups can overlap."],
  };
  sh.orgs = (box) => {
    const out = wrapBox(box),
      dot = (x, y, c = "blue") => `<circle cx="${x}" cy="${y}" r="9" fill="var(--${c})"/>`,
      ln = (a, b) =>
        `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--line-2)" stroke-width="3"/>`,
      blob = (x, y, rx, ry, c, t) =>
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${tint(c, 22)}" stroke="var(--${c})" stroke-width="2"/><text x="${x}" y="${y - ry - 5}" class="fig-sub">${t}</text>`;
    const tree = [
      [230, 30],
      [130, 95],
      [330, 95],
      [80, 165],
      [180, 165],
      [280, 165],
      [380, 165],
    ];
    const flat = Array.from({ length: 7 }, (_, i) => ringAt(i, 7, 70));
    const picture = {
      flat:
        flat.map((p, i) => ln(p, flat[(i + 1) % 7]) + ln(p, flat[(i + 3) % 7])).join("") +
        flat.map((p) => dot(...p)).join(""),
      tree:
        [
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 6],
        ]
          .map(([a, b]) => ln(tree[a], tree[b]))
          .join("") + tree.map((p, i) => dot(...p, i ? "blue" : "violet")).join(""),
      team: [90, 230, 370]
        .map(
          (x, k) =>
            blob(x, 112, 66, 56, ["blue", "teal", "amber"][k], `Team ${k + 1}`) +
            [
              [-22, 14],
              [22, 14],
              [0, -20],
            ]
              .map(([a, b]) => dot(x + a, 112 + b, "blue"))
              .join(""),
        )
        .join(""),
      coal:
        blob(150, 115, 90, 58, "blue", "Coalition 1") +
        blob(250, 115, 90, 58, "teal", "Coalition 2") +
        blob(350, 115, 70, 52, "amber", "Coalition 3") +
        [
          [110, 115],
          [140, 100],
          [200, 125],
          [240, 100],
          [290, 125],
          [340, 105],
          [370, 125],
        ]
          .map((p) => dot(...p))
          .join(""),
    };
    out.innerHTML = `<div class="controls" data-c style="justify-content:center"></div><div data-s></div><p class="fig-cap" data-m></p>`;
    const show = (k) => {
      qs("[data-s]", out).innerHTML = svgBox(460, 210, picture[k], `${ORG[k][0]} organisation of agents`);
      qs("[data-m]", out).innerHTML = `<b>${ORG[k][0]}</b>: ${ORG[k][1]}`;
    };
    qs("[data-c]", out).append(
      N.seg(
        Object.entries(ORG).map(([k, v]) => [k, v[0]]),
        "flat",
        show,
      ),
    );
    show("flat");
  };
  /** Toy fault spread on a ring of 10 agents. Agent 0 is faulty; its bad messages infect ring neighbours each tick. */
  function faultState(mode, broken, t) {
    let inf = new Set([0]),
      iso = new Set();
    for (let k = 1; k <= t; k++) {
      if (mode === "ring") {
        inf = new Set();
        iso = new Set([0]);
      } else if (!broken && k >= 3 && inf.size) {
        iso = new Set(inf);
        inf = new Set();
      } else if (inf.size) [...inf].forEach((i) => [(i + 1) % 10, (i + 9) % 10].forEach((j) => inf.add(j)));
    }
    return { inf, iso };
  }
  sh.faultState = faultState;
  sh.faults = (box) => {
    const out = wrapBox(box);
    let mode = "hub",
      broken = false,
      t = 0;
    out.innerHTML = `<div class="controls" data-c></div><div class="controls" data-d></div><div data-s></div><p class="fig-cap" data-m aria-live="polite"></p>`;
    const draw = () => {
      const { inf, iso } = faultState(mode, broken, t),
        pts = Array.from({ length: 10 }, (_, i) => ringAt(i, 10, 84));
      const col = (i) => (iso.has(i) ? "line-2" : inf.has(i) ? "rose" : "teal");
      const spokes =
        mode === "hub"
          ? pts
              .map(
                (p) =>
                  `<line x1="${p[0]}" y1="${p[1]}" x2="230" y2="108" stroke="var(--blue)" opacity="${broken ? 0.12 : 0.4}" stroke-dasharray="4 4"/>`,
              )
              .join("")
          : "";
      const ring = pts
        .map(
          (p, i) =>
            `<line x1="${p[0]}" y1="${p[1]}" x2="${pts[(i + 1) % 10][0]}" y2="${pts[(i + 1) % 10][1]}" stroke="var(--line-2)" stroke-width="3"/>`,
        )
        .join("");
      const hub =
        mode === "hub"
          ? `<circle cx="230" cy="108" r="27" fill="var(--${broken ? "line-2" : "blue"})"/><text x="230" y="112" class="fig-box-s" style="fill:var(--bg)">${broken ? "down" : "monitor"}</text>`
          : "";
      qs("[data-s]", out).innerHTML = svgBox(
        460,
        216,
        `${spokes}${ring}${hub}${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="var(--${col(i)})"/>`).join("")}<text x="${pts[0][0] - 17}" y="${pts[0][1] + 4}" class="fig-sub" style="text-anchor:end">faulty</text>`,
        `Ten agents on a ring after ${t} steps: ${inf.size} infected, ${iso.size} isolated`,
      );
      qs("[data-m]", out).innerHTML =
        `Step <b>${t}</b>: <b>${inf.size}</b> infected (red), <b>${iso.size}</b> isolated (grey).`;
    };
    const s = N.slider("Time step", 0, 6, 1, 0);
    s.onInput((v) => ((t = v), draw()));
    qs("[data-c]", out).append(
      N.seg(
        [
          ["hub", "Central monitor"],
          ["ring", "Neighbours watch each other"],
        ],
        mode,
        (v) => ((mode = v), draw()),
      ),
      N.seg(
        [
          ["0", "Monitor works"],
          ["1", "Monitor breaks"],
        ],
        "0",
        (v) => ((broken = v === "1"), draw()),
      ),
    );
    qs("[data-d]", out).append(s);
    draw();
  };

  N.register({
    id: "l11-mas",
    lecture: 11,
    order: 5,
    num: "11.5",
    title: "Multi-agent systems",
    blurb:
      "Many agents, scaling by talking to neighbours, how they are organised and what happens when one goes wrong.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A <b>multi-agent system</b> uses many agents together. Try the two demos: how the number of conversations grows with the number of agents, and how a single faulty agent spreads, depending on how faults are detected.",
        ),
      );
      const a = el(
        `<div class="card"><div class="card-head"><h2>Agents that talk</h2></div><div data-box></div></div>`,
      );
      const b = el(`<div class="card"><div class="card-head"><h2>A faulty agent</h2></div><div data-box></div></div>`);
      root.append(a, b);
      sh.links(qs("[data-box]", a));
      sh.faults(qs("[data-box]", b));
      root.appendChild(
        pr(
          "l11-mas-1",
          "In the first demo, slide the number of agents from 10 up to 30. What happens to the two bars? | The all-talk bar grows far faster than the neighbours bar | Both bars grow at the same rate | The neighbours bar grows faster, as it has more to carry | Everyone-to-everyone grows with the square of the number of agents, while neighbours-only grows in step with the number of agents.",
        ),
      );
      root.appendChild(
        pr(
          "l11-mas-2",
          "In the second demo, choose <b>Central monitor</b>, press <b>Monitor breaks</b> and drag <b>Time step</b> to 6. What happens? | The fault spreads to every agent | The faulty agent is isolated at once | Only the two nearest agents are infected | With no working monitor nothing detects the faulty agent, so it infects its neighbours, and then theirs, round the whole ring.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Many agents can be <b>cooperative</b> or <b>competitive</b>, and <b>scale</b> because each talks only to direct neighbours.",
            "Agents can be organised as <b>flat</b>, <b>hierarchical</b>, <b>team</b> or <b>coalition</b> structures.",
            "A faulty agent may infect others. A <b>centralised</b> detector is a <b>single point of failure</b>.",
          ],
          "Keep conversations local and detection spread out.",
        ),
      );
    },
  });
  L["l11-mas"] = {
    sum: "<b>Multi-agent systems</b> use many agents. They scale by local communication and need fault detection that has no single point of failure.",
    steps: [
      {
        t: "Why use many agents?",
        b: `<p>A <b>multi-agent system</b> uses several agents to solve more complex questions. It is <b>flexible</b>: the agents can solve a problem together and still learn on their own to make independent decisions. They can be <b>cooperative</b> (sharing a goal) or <b>competitive</b> (opposing goals).</p><p>Uses include autonomous cars, multi-robot factories, automated trading and commercial games. Many software environments exist for training them, though they bring complexities that a single agent never meets.</p>`,
        v: F.compare(
          { title: "Cooperative", c: "teal", body: "A shared goal<br>Robots carrying one load together" },
          { title: "Competitive", c: "rose", body: "Opposing goals<br>Trading agents bidding for the same shares" },
        ),
        c: C(
          "Two trading agents each try to buy the same shares as cheaply as possible. What kind of system is this? | Competitive | Cooperative | Single-agent | Their goals clash: one agent's gain is the other's loss, so the system is competitive.",
        ),
      },
      {
        t: "Scaling up",
        b: `<p>Multi-agent systems <b>scale</b> because agents only talk to their <b>direct neighbours</b>, which cuts the communication overhead. If every agent talked to every other agent, the number of links would explode.</p><p>For example, 10 agents all talking to each other need 45 links. If each talks only to its 2 ring neighbours, 10 links will do. Slide the number of agents.</p><details class="math-more"><summary>Show the maths</summary><p>Each of $n$ agents pairs with the other $n-1$, but each link joins two agents, so</p><p>$$\\text{links}=\\frac{n(n-1)}{2}$$</p><p>For $n=10$ that is $10\\times9/2=45$. A ring of neighbours needs just $n=10$ links, and 100 agents need 4,950 links against 100.</p></details>`,
        v: (box) => sh.links(box),
        c: C(
          "20 agents all talk to each other, one link per pair. How many links is that? | 190 | 40 | 380 | Each of 20 agents pairs with 19 others, which counts every link twice: 20 × 19 ÷ 2 = 190.",
          "20 × 19 = 380, and every link has been counted twice.",
        ),
      },
      {
        t: "How agents are organised",
        b: `<p>The agents of a system can be arranged in different ways. <b>Flat</b>: all are peers. <b>Hierarchical</b>: orders pass down from the top. <b>Team</b>: fixed groups each with a job. <b>Coalition</b>: agents group up for a task, and groups can overlap. Tap the four in the picture.</p>`,
        v: (box) => sh.orgs(box),
        c: C(
          "Which organisation has one agent at the top passing orders down through layers? | Hierarchical, with layers of command | Flat, with every agent a peer | Coalition, with groups formed for a task | In a hierarchy each layer takes orders from the one above. A flat system has no layers.",
        ),
      },
      {
        t: "Spotting a faulty agent",
        b: `<p>A faulty agent can <b>infect</b> others, so it must be detected and isolated. Detection is often <b>centralised</b>, which is a problem because it introduces a <b>single point of failure</b>. A common method <b>monitors the messages</b> between agents, sorts them into expected and unexpected, then examines the agents behind the unexpected ones.</p><p>In this toy ring, a central monitor needs 3 steps to isolate the infection (5 agents are caught by then), and if it breaks, all 10 agents get infected. Neighbours who watch each other stop it in 1 step. Drag <b>Time step</b>.</p>`,
        v: (box) => sh.faults(box),
        c: C(
          "A central monitor is the only watcher of ten agents. What is the main weakness? | If it fails, nothing detects the faulty agent | It uses far too few of the system's resources | It cannot see any messages between agents | A centralised detector is a single point of failure: when it stops, faults go unnoticed and spread.",
        ),
      },
      {
        t: "Hard questions about faults",
        b: `<p>Most fault-detection work focuses on <b>homogeneous</b> agents, all alike, where "unexpected" is easy to define. Real agents are often <b>heterogeneous</b>, each with its own normal behaviour. The approaches are also often <b>resource hungry</b>. And an open question remains: how should a faulty agent be <b>isolated</b>, without hurting the rest?</p>`,
        v: F.compare(
          { title: "Homogeneous (the usual focus)", c: "blue", body: "All agents alike<br>One idea of normal" },
          { title: "Heterogeneous (what we often have)", c: "amber", body: "Agents differ<br>Each has its own normal" },
        ),
        c: C(
          "Why is fault detection harder for heterogeneous agents? | Normal behaviour differs from agent to agent | They cannot send messages to each other at all | Every one of them is always faulty in practice | With no single idea of normal, an unexpected message is harder to define.",
        ),
      },
      {
        t: "From flocking to optimising",
        b: `<p>We can turn the best bits of this intelligent flocking behaviour into an <b>optimisation algorithm</b>. Kennedy and Eberhart (1995) arrived at <b>particle swarm optimisation</b> (PSO): a swarm of particles flying through a space of possible solutions. Next lecture looks at it in depth.</p>`,
        v: F.flow([
          "Boids flock with simple rules",
          "Particles fly through a search space",
          { t: "Particle swarm optimisation", c: "teal" },
        ]),
        c: C(
          "What does PSO borrow from flocking? | A moving swarm of simple agents | A leader boid that steers the rest | Pheromone trails on the ground | PSO keeps the swarm flying through a space, each particle simple, with no leader giving orders.",
        ),
      },
    ],
    guide: [
      "Drag <b>Number of agents</b> and compare the two bars.",
      "Pick <b>Central monitor</b> or <b>Neighbours watch each other</b>, press <b>Monitor breaks</b> and drag <b>Time step</b>.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 11.W Workshop: the boids lab ============ */
  /** Mission checks, run on every sixth tick of the lab. */
  function check(c, api) {
    const S = c.S;
    if (S.t % 6) return;
    const p = sh.polar(S.b);
    if (S.start === "scatter" && S.t >= 60 && p >= 0.9) api.done("form");
    if (S.P.wa === 0 && S.t >= 300 && p < 0.5) api.done("noalign");
    if (S.P.ws === 0 && sh.tooClose(S.b) >= 5) api.done("crash");
    if (S.start === "meet" && S.t >= 60 && sh.groups(S.b) === 1 && p >= 0.9) api.done("join");
    if (S.start === "together" && S.t <= 150 && sh.spread(S.b) >= 6 * S.s0) api.done("burst");
  }
  function build(stage, api, life) {
    const card = el(`<div class="wk-card"><h3>Boids lab</h3><div data-box></div></div>`);
    stage.appendChild(card);
    sh.flock(qs("[data-box]", card), life, {
      bare: true,
      sliders: ["ws", "wa", "wc", "R"],
      buttons: ["reset", "together", "meet", "fast", "pause"],
      stats: ["polar", "groups", "close", "spread"],
      trace: true,
      onTick: (c) => check(c, api),
    });
  }
  N.register({
    id: "l11-wlab",
    lecture: 11,
    order: 90,
    num: "11.W",
    workshop: true,
    title: "Workshop: boids lab",
    blurb: "No code. Switch the three rules on and off, start flocks packed and head-on, and read the stats.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro: "Sixty boids, four dials and four stats. Press <b>Scatter</b> and watch <b>Polarisation</b> climb.",
        missions: [
          {
            id: "form",
            t: "Watch a flock form",
            d: "Press <b>Scatter</b> and wait until <b>Polarisation</b> reaches 0.9.",
            hint: "Keep all three rules at 1 and press <b>Speed ×3</b> to hurry.",
          },
          {
            id: "noalign",
            t: "Switch alignment off",
            d: "Set <b>Alignment</b> to 0, press <b>Scatter</b> and let it run for 300 ticks. <b>Polarisation</b> should stay below 0.5.",
            hint: "Without alignment nothing makes the boids agree on a heading. Use <b>Speed ×3</b>.",
          },
          {
            id: "crash",
            t: "Let them collide",
            d: "Set <b>Separation</b> to 0 and reach at least 5 <b>Pairs too close</b> at once.",
            hint: "Cohesion pulls boids together and nothing pushes them apart: press <b>Scatter</b> and wait.",
          },
          {
            id: "join",
            t: "Two flocks meet",
            d: "Put the dials back to 1, press <b>Two flocks meet</b> and wait for <b>Groups</b> to fall to 1 with <b>Polarisation</b> at 0.9 or more.",
            hint: "If they pass through each other, raise <b>Perception radius</b> and press <b>Two flocks meet</b> again.",
          },
          {
            id: "burst",
            t: "Make a flash expansion",
            d: "Press <b>Start together</b> and watch <b>Spread</b> grow to at least 6 times where it started, within 150 ticks.",
            hint: "Keep <b>Separation</b> at 1 or more. Compare with <b>Separation</b> at 0.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l11-wlab-1",
          "In the lab, Cohesion is 0 and the other dials are 1. After <b>Scatter</b> and a while, what do you expect? | Headings agree, but the boids split into several groups | The boids never manage to agree on a heading at all | All the boids pile into one single tight group | Alignment still matches headings, but without cohesion nothing draws groups together.",
        ),
      );
      root.appendChild(
        pr(
          "l11-wlab-2",
          "Separation is 0. What does <b>Pairs too close</b> show? | A number well above 0 as boids pile up | It stays at 0 | It falls as the boids spread out | Nothing pushes crowded boids apart, so cohesion lets them overlap.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Alignment</b> off: no polarisation. <b>Separation</b> off: boids collide. <b>Cohesion</b> off: the flock splits into groups.",
            "Packed starts burst apart (<b>flash expansion</b>), and flocks that meet <b>join</b>.",
            "Change one dial at a time and read the four stats.",
          ],
          "One rule at a time, then read the numbers.",
        ),
      );
    },
  });
  L["l11-wlab"] = {
    sum: "Switch each of Reynolds' three rules off in turn, start flocks packed and head-on, and read polarisation, groups, collisions and spread.",
    steps: [
      {
        t: "The lab",
        b: `<p>The lab has four dials (<b>Separation</b>, <b>Alignment</b>, <b>Cohesion</b>, <b>Perception radius</b>) and four stats. <b>Polarisation</b> says how far boids head the same way, <b>Groups</b> counts separate flocks, <b>Pairs too close</b> counts near-collisions and <b>Spread</b> measures how wide the flock is. Four buttons restart the flock in a new way.</p>`,
        v: F.flow(
          ["Set the dials", "Press a start button", "Read the four stats", { t: "Change one dial", c: "violet" }],
          { loop: true },
        ),
        c: C(
          "Which stat tells you how many separate flocks there are? | Groups | Polarisation | Spread | Groups counts clumps of boids close to each other. Polarisation measures agreement in heading.",
        ),
      },
      {
        t: "One rule at a time",
        b: `<p>To learn what a rule does, switch it off and see what goes missing. With <b>Alignment</b> at 0 the boids cannot agree on a heading, so polarisation stays low. With <b>Separation</b> at 0 they overlap. With <b>Cohesion</b> at 0 they still agree on a heading, but drift into separate groups.</p>`,
        v: F.compare(
          { title: "Switch off", c: "amber", body: "Alignment, separation or cohesion" },
          { title: "Read the stat that moves", c: "teal", body: "Polarisation, pairs too close, groups" },
        ),
        c: C(
          "Which stat rises sharply when Separation is switched off? | Pairs too close | Polarisation | Spread of the flock | With nothing pushing boids apart, many end up almost on top of each other.",
        ),
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
