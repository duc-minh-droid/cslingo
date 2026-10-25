/* l7-01: Lecture 7 (swarm intelligence and ant colony optimisation): 7.1 swarm intelligence, 7.3 stigmergy and trails. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.nicL7 = NIC.shared.nicL7 || {});

  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  /** chance (percent) that the majority of n independent scouts, each right with probability p, is right (n odd) */
  function majority(n, p) {
    let s = 0;
    for (let k = Math.floor(n / 2) + 1; k <= n; k++) {
      let c = 1;
      for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1);
      s += c * p ** k * (1 - p) ** (n - k);
    }
    return s * 100;
  }
  /** trail strength after each step: lose a fraction rho, gain `ants` while t <= stop */
  function trail(ants, rho, steps, stop = Infinity) {
    const out = [0];
    for (let t = 1; t <= steps; t++) out.push(out[t - 1] * (1 - rho) + (t <= stop ? ants : 0));
    return out;
  }
  Object.assign(sh, { mulberry, plural, majority, trail });

  /* ============ 7.1 Swarm intelligence ============ */
  const SIZES = [1, 3, 5, 11, 21, 31, 61];
  const ring = () => {
    const nodes = {},
      edges = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes["ant" + i] = { x: 230 + 95 * Math.cos(a), y: 105 + 70 * Math.sin(a), label: "🐜" };
      edges.push(["ant" + i, "ant" + ((i + 1) % 6)]);
    }
    return F.graph({
      nodes,
      edges,
      w: 460,
      h: 210,
      r: 17,
      label: "Six identical ants, each linked only to its two neighbours",
    });
  };

  N.register({
    id: "l7-swarm",
    lecture: 7,
    order: 1,
    num: "7.1",
    title: "Swarm intelligence",
    blurb: "Simple scouts, no leader, a clever colony. Grow the colony and watch its vote get more reliable.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A <b>swarm</b> (a colony, flock or shoal) can do something that no single member can do reliably. This <b>emergent</b> ability comes from many simple members following local rules, with <b>no central controller</b>. Here each scout picks one of two routes to a food patch, and the colony goes with the route most scouts chose.",
        ),
      );
      let skill = 60,
        size = 3;
      const card = el(
        `<div class="card"><div class="card-head"><h2>Scouts and the colony</h2></div><div class="controls" id="c"></div><canvas class="viz" id="cv"></canvas><div class="legend"><span style="--c:var(--blue)">chance the colony picks the better route</span></div><div id="note"></div><div class="controls"><button class="btn primary" id="run">Send 200 colonies</button></div><div id="res"></div></div>`,
      );
      root.appendChild(card);
      const sSkill = N.slider("Scout skill", 50, 80, 5, skill, (v) => v + "%"),
        sSize = N.slider("Colony size", 0, SIZES.length - 1, 1, 1, (i) => SIZES[i]);
      sSkill.onInput((v) => {
        skill = v;
        draw();
      });
      sSize.onInput((i) => {
        size = SIZES[i];
        draw();
      });
      qs("#c", card).append(sSkill, sSize);
      function draw() {
        const ys = SIZES.map((n) => majority(n, skill / 100)),
          me = SIZES.indexOf(size);
        N.barChart(qs("#cv", card), {
          groups: [{ values: ys, color: (i) => (i === me ? N.colors().violet : N.colors().blue) }],
          labels: SIZES.map(String),
          height: 170,
          decimals: 1,
          yMax: 100,
          names: ["colony right (%)"],
        });
        qs("#note", card).innerHTML =
          `<div class="callout blue">One scout alone is right <b>${skill}%</b> of the time. A colony of <b>${size}</b> is right <b>${ys[me].toFixed(1)}%</b> of the time.</div>`;
        qs("#res", card).innerHTML = "";
      }
      qs("#run", card).onclick = () => {
        let right = 0;
        for (let k = 0; k < 200; k++) {
          let votes = 0;
          for (let s = 0; s < size; s++) if (Math.random() < skill / 100) votes++;
          if (votes * 2 > size) right++;
        }
        qs("#res", card).innerHTML =
          `<p>Out of 200 colonies of <b>${size}</b> scouts, <b>${right}</b> chose the better route (${((right / 200) * 100).toFixed(0)}%).</p>`;
      };
      draw();
      root.appendChild(
        predict({
          id: "l7-swarm-1",
          q: "Set <b>Scout skill</b> to 55% and <b>Colony size</b> to 61. About how often does the colony pick the better route?",
          opts: ["About 55%, the same as one scout", "About 80%", "100% every time"],
          a: 1,
          why: "Many weak, independent votes add up. At 55% skill a colony of 61 is right about 78% of the time. It is not perfect, because the scouts are still wrong often enough to tip some votes.",
        }),
      );
      root.appendChild(
        predict({
          id: "l7-swarm-2",
          q: "Set <b>Scout skill</b> to 50% (pure coin flips) and grow the colony. What happens to the bars?",
          opts: [
            "They stay at 50%, however large the colony is",
            "They climb towards 100% as the colony grows",
            "They fall below 50% as errors pile up",
          ],
          a: 0,
          why: "A crowd cannot conjure information that no member has. Each scout must be even slightly better than chance for the vote to help. Ants get that small edge from pheromone trails.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A swarm does something X reliably that its individual members cannot do, or do only with low probability. X is an <b>emergent</b> property.",
            "Every member is simple and alike, follows local rules and has <b>no central controller</b>.",
            "Many weak but better-than-chance contributions add up. Pure noise does not.",
          ],
          "Simple parts plus local interactions can give a clever whole.",
        ),
      );
    },
  });

  L["l7-swarm"] = {
    sum: "A <b>swarm</b> is many simple, identical agents with no leader whose local interactions produce clever group behaviour.",
    steps: [
      {
        t: "Simple parts, clever whole",
        b: `<p>Swarms, flocks and colonies often show something odd. Each <b>individual</b> cannot do some job X, or does it only with low probability. The <b>swarm as a unit</b> does X with high probability.</p><p><span class="key">The ability to do X is an emergent property of the swarm.</span></p>`,
        v: F.compare(
          { title: "One individual", c: "amber", body: "Cannot do X, or gets it right only now and then" },
          { title: "The swarm", c: "teal", body: "Does X reliably, as a unit" },
        ),
        c: {
          q: "What does <b>emergent</b> mean for a swarm?",
          o: [
            "A skill that only the group shows, not any member",
            "A skill that a hidden leader teaches every member",
            "A skill that every member practised alone first",
          ],
          a: 0,
          why: "Emergent behaviour appears at the level of the group. No single member has the skill or the plan.",
        },
      },
      {
        t: "No boss in charge",
        b: `<p>Each member has its own <b>simple behaviour</b> and a few rules for dealing with its fellows and with the environment. Every member is the same, and there is <b>no central controller</b>. The group result appears from these <b>local interactions</b>: ants finding food, termites building mounds.</p>`,
        v: ring(),
        c: {
          q: "Which statement fits a swarm?",
          o: [
            "All members are alike and follow simple local rules",
            "One master unit plans the work and passes orders down",
            "The members vote at a central desk before each move",
          ],
          a: 0,
          why: "A swarm has no controller. Each member reacts to what is near it.",
        },
      },
      {
        t: "What a colony can do",
        b: `<p>Franks (1989) watched <b>Lasius niger</b> ants. A colony keeps its nest within one degree, forms bridges, raids food areas, sorts brood, emigrates, <b>finds the shortest route to food</b> and <b>prefers the richest food source</b>. No single ant can do these things.</p>`,
        v: F.compare(
          { title: "One ant can", c: "amber", body: "Pick up a crumb<br>Follow a scent<br>Lay a scent" },
          {
            title: "Only the colony can",
            c: "teal",
            body: "Hold the nest at a steady temperature<br>Build a living bridge<br>Choose the shortest route",
          },
        ),
        c: {
          q: "Which is a <b>swarm</b> behaviour rather than something one ant does?",
          o: [
            "Choosing the shorter of two routes to food",
            "Walking along a scent that is already laid",
            "Picking up a single crumb of food",
          ],
          a: 0,
          why: "Following a scent or lifting a crumb is one ant's job. Choosing the shortest route is something the colony achieves together.",
        },
      },
      {
        t: "Emergence by numbers",
        b: `<p>Here is how a crowd of unreliable members can still be reliable. Each scout picks the better of two routes only 60% of the time, barely better than a coin toss. The colony simply goes where most scouts point.</p><p>One scout is right <b>${majority(1, 0.6).toFixed(0)}%</b> of the time. Eleven scouts voting together are right about <b>${majority(11, 0.6).toFixed(0)}%</b>, and thirty-one about <b>${majority(31, 0.6).toFixed(0)}%</b>. Hold a few votes below and compare the three colony sizes: single scouts wander, big crowds rarely go wrong.</p><details class="math-more"><summary>Show the maths</summary><p>With $n$ independent scouts, each right with probability $p=0.6$, the colony is right when more than half of them are:</p><p>$$P(\\text{majority right})=\\sum_{k>n/2}\\binom{n}{k}\\,p^{k}(1-p)^{n-k}$$</p><p>This gives ${majority(1, 0.6).toFixed(0)}% for $n=1$, ${majority(11, 0.6).toFixed(0)}% for $n=11$ and ${majority(31, 0.6).toFixed(0)}% for $n=31$. It only helps while $p>\\tfrac12$: each vote must be better than a coin flip.</p></details>`,
        v: (box) => NIC.shared.nicFig.vote(box),
        c: {
          q: "Each scout is right 60% of the time. Which colony is most likely to pick the better route?",
          o: ["A colony of 31 scouts", "A colony of 5 scouts", "A single scout alone"],
          a: 0,
          why: "More independent votes make the majority more reliable, as long as each vote is better than a coin flip.",
        },
      },
      {
        t: "Two swarm algorithms",
        b: `<p>Swarm behaviour has inspired successful optimisation methods. <b>Ant colony optimisation</b> (ACO) copies how ants find short routes. <b>Particle swarm optimisation</b> (PSO) copies the swarming of flocks and shoals and is a later topic.</p>`,
        v: F.flow(["Watch a swarm", "Copy its simple rules", { t: "Solve a hard problem", c: "teal" }]),
        c: {
          q: "What does a swarm algorithm borrow from nature?",
          o: [
            "Simple local rules that give good group behaviour",
            "A bit-string encoding with a crossover operator",
            "A ranked population thinned by tournaments",
          ],
          a: 0,
          why: "The other two options belong to evolutionary algorithms. Swarm methods copy the simple rules of the group.",
        },
      },
      {
        t: "The environment as a notice board",
        b: `<p>Members interact with each other <b>and with the environment</b>. An agent can change the world, and another agent can later sense that change. The environment then carries information between them, which is how ants do it. The next lessons look at the double-bridge experiment, then at this idea in detail.</p>`,
        v: F.cycle(["Agent acts", "Environment changes", "Others sense it", "Behaviour shifts"], { center: "swarm" }),
        c: {
          q: 'Where can a swarm keep its "memory" with no leader?',
          o: [
            "In marks left in the environment, such as scent",
            "In one lead ant that remembers every route",
            "In genes copied from the parents of each ant",
          ],
          a: 0,
          why: "Marks in the environment carry information from ant to ant, so no single ant has to remember.",
        },
      },
    ],
    guide: [
      "Drag <b>Scout skill</b> and <b>Colony size</b> and watch the bars.",
      "Press <b>Send 200 colonies</b> to see a random tally.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 7.3 Stigmergy and pheromone trails ============ */
  N.register({
    id: "l7-stig",
    lecture: 7,
    order: 3,
    num: "7.3",
    title: "Stigmergy and pheromone trails",
    blurb: "Ants talk through the ground. Lay trails on two paths and watch strength build up and fade.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "<b>Stigmergy</b> is communication through the environment. Ants use <b>pheromone</b>: they lay it as they walk, it <b>evaporates</b> over time, it <b>accumulates</b> where many ants walk, and other ants prefer paths with more of it. Here two trails each get a steady flow of ants.",
        ),
      );
      const S = { a: 4, b: 2, evap: 20, stop: "never" };
      const card = el(
        `<div class="card"><div class="card-head"><h2>Trail lab</h2></div><div class="controls" id="c"></div><div class="controls" id="c2"></div><canvas class="viz" id="cv"></canvas><div class="legend"><span style="--c:var(--blue)">trail A</span><span style="--c:var(--amber)">trail B</span></div><div id="note"></div></div>`,
      );
      root.appendChild(card);
      const sA = N.slider("Ants on trail A per step", 0, 6, 1, S.a),
        sB = N.slider("Ants on trail B per step", 0, 6, 1, S.b),
        sE = N.slider("Evaporation per step", 5, 40, 5, S.evap, (v) => v + "%");
      sA.onInput((v) => ((S.a = v), draw()));
      sB.onInput((v) => ((S.b = v), draw()));
      sE.onInput((v) => ((S.evap = v), draw()));
      const mode = N.seg(
        [
          ["never", "Ants keep walking"],
          ["20", "Ants stop at step 20"],
        ],
        S.stop,
        (v) => ((S.stop = v), draw()),
      );
      qs("#c", card).append(sA, sB, sE);
      qs("#c2", card).append(mode);
      function draw() {
        const stop = S.stop === "never" ? Infinity : +S.stop,
          rho = S.evap / 100;
        const ta = trail(S.a, rho, 40, stop),
          tb = trail(S.b, rho, 40, stop);
        N.lineChart(qs("#cv", card), {
          series: [
            { data: ta, color: N.colors().blue },
            { data: tb, color: N.colors().amber },
          ],
          height: 200,
          xLabel: "step",
          yMin: 0,
          yMax: Math.max(10, Math.ceil(Math.max(...ta, ...tb))),
          names: ["trail A", "trail B"],
        });
        const sa = ta[40],
          sb = tb[40],
          chance = sa + sb > 0.05 ? Math.round((sa / (sa + sb)) * 100) : null;
        qs("#note", card).innerHTML =
          `<div class="callout blue">At step 40: trail A holds <b>${sa.toFixed(1)}</b>, trail B holds <b>${sb.toFixed(1)}</b>. ${chance === null ? "Both trails have faded away." : `A new ant picks A with chance <b>${chance}%</b>.`}</div>`;
      }
      draw();
      root.appendChild(
        predict({
          id: "l7-stig-1",
          q: "Trail A gets 4 ants per step and trail B gets 2, with 20% evaporation and the ants keep walking. After 40 steps, about how likely is a new ant to pick A?",
          opts: ["About 50%", "About 67%", "About 90%"],
          a: 1,
          why: "Each trail levels off near ants ÷ evaporation: 4 ÷ 0.2 = 20 for A and 2 ÷ 0.2 = 10 for B. A holds 20 of the 30 units, which is two chances in three.",
        }),
      );
      root.appendChild(
        predict({
          id: "l7-stig-2",
          q: "With A at 4 ants and B at 2, drag <b>Evaporation per step</b> from 20% up to 40%. What happens?",
          opts: [
            "Both trails weaken, but A's chance stays near 67%",
            "Trail A weakens and B's chance rises to 50%",
            "Both trails get stronger, as the ants work harder",
          ],
          a: 0,
          why: "Both levels are ants ÷ evaporation, so both halve (20 and 10 become 10 and 5). Their ratio, and so the chance, stays the same. The ants keep the 2 to 1 lead.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Stigmergy</b> is indirect communication through the environment. Ants use <b>sign-based</b> stigmergy: pheromone marks that others follow.",
            "A trail <b>accumulates</b> where many ants walk and <b>evaporates</b> where none do. It levels off where gain equals loss.",
            "Ants <b>prefer</b> paths with more pheromone, so the chance of a path is its share of the pheromone.",
          ],
          "Lay a mark, let it fade, and let others follow the strongest one.",
        ),
      );
    },
  });

  L["l7-stig"] = {
    sum: "<b>Stigmergy</b> lets ants communicate through the environment. <b>Pheromone</b> trails build up, fade and pull other ants along.",
    steps: [
      {
        t: "Stigmergy",
        b: `<p><b>Stigmergy</b> is <b>indirect communication</b> through interaction with the environment (Grassé, 1959). An ant changes the world, and another ant later senses the change. Swarm behaviour emerges from how individuals communicate <b>through</b> their environment.</p>`,
        v: F.cycle(["Ant changes the world", "World now differs", "Another ant senses it", "Its behaviour shifts"]),
        c: {
          q: "Stigmergy means that ants communicate…",
          o: [
            "Indirectly, by marks that others find later",
            "Directly, by passing messages between pairs",
            "Through a leader that broadcasts the best route",
          ],
          a: 0,
          why: "The message sits in the environment. The sender and receiver never need to meet.",
        },
      },
      {
        t: "Two kinds of stigmergy",
        b: `<p><b>Sematonic</b> stigmergy: the action is part of the problem-solving work and it affects other agents (an ant takes up a posture that makes others start building a bridge). <b>Sign-based</b> stigmergy: the action leaves a mark that is <b>not</b> the work itself, for example a scent.</p>`,
        v: F.compare(
          { title: "Sematonic", c: "violet", body: "The work itself prompts others<br>Bridge-building posture" },
          { title: "Sign-based", c: "blue", body: "A mark left in the environment<br>Pheromone along a path" },
        ),
        c: {
          q: "An ant lays pheromone on its way to food. Which kind of stigmergy is this?",
          o: ["Sign-based", "Sematonic", "Neither: it is direct contact"],
          a: 0,
          why: "The pheromone is a mark in the environment. It is not the food-finding work itself.",
        },
      },
      {
        t: "Ants are sign-based experts",
        b: `<p>Ants are behaviourally unsophisticated, yet together they perform complex tasks. They have highly developed <b>sign-based stigmergy</b>: they communicate with <b>pheromones</b> and lay <b>trails</b> that other ants follow.</p>`,
        v: F.graph({
          nodes: {
            Nest: { x: 50, y: 90, label: "Nest" },
            a: [160, 40],
            b: [160, 140],
            c: [290, 90],
            Food: { x: 400, y: 90, label: "Food" },
          },
          edges: [
            ["Nest", "a"],
            ["Nest", "b"],
            ["a", "c"],
            ["b", "c"],
            ["c", "Food"],
          ],
          hl: { "Nest-a": "teal", "a-c": "teal", "c-Food": "teal" },
          w: 460,
          h: 180,
          r: 26,
          label: "A pheromone trail from the nest to the food, highlighted along the upper path",
        }),
        c: {
          q: "Why can simple ants solve complex tasks together?",
          o: [
            "They share information through trails of pheromone",
            "Each ant plans a full route before it leaves",
            "They memorise a map of the whole territory",
          ],
          a: 0,
          why: "The trail carries the group's knowledge, so no single ant needs to hold a plan or a map.",
        },
      },
      {
        t: "How a trail behaves",
        b: `<p>Ants lay pheromone while travelling to the nest, from the nest or both ways. The trail <b>evaporates</b> gradually. Its strength <b>accumulates</b> when several ants use the same path. Ants <b>prefer</b> paths with more pheromone.</p>`,
        v: F.flow(["Ants lay pheromone", "It builds up", "It fades", { t: "Ants favour strong paths", c: "teal" }], {
          loop: true,
        }),
        c: {
          q: "Many ants use path P and none use path Q. What happens to the pheromone?",
          o: [
            "P's trail grows while Q's fades away",
            "Both trails stay at the same strength",
            "P's trail fades while Q's trail grows",
          ],
          a: 0,
          why: "Use adds pheromone and time removes it. Only the used path gains.",
        },
      },
      {
        t: "Gain against loss",
        b: `<p>Think of a trail as a <b>leaky bucket</b>. Every step the ants pour in some pheromone, and every step a fixed share of what is in the bucket leaks out. While the bucket is nearly empty little leaks, so the level climbs. As it fills, more leaks, until the leak exactly matches what the ants pour in. Then the level stops rising.</p><p>For example, with 4 ants per step and 20% leaking: at a level of 20, the leak is 20% of 20 = 4, the same as the inflow, so the level settles at <b>20</b>. When the ants stop, nothing refills the bucket and it drains away. Move the sliders below and watch where the line levels off.</p><details class="math-more"><summary>Show the maths</summary><p>Each step: new level = old level × (1 − evaporation) + ants. It stops changing when the level $T$ satisfies $T=T(1-\\rho)+a$, with $a$ ants per step and evaporation fraction $\\rho$. Solving gives</p><p>$$T=\\frac{a}{\\rho}$$</p><p>so 4 ants and 20% evaporation give $4\\div0.2=20$.</p></details>`,
        v: (box, life) => NIC.shared.nicFig.bucket(box, life),
        c: {
          q: "All ants stop using a trail. What does its strength do?",
          o: [
            "It fades steadily towards zero",
            "It stays at its last level for good",
            "It keeps rising for a while, then stops",
          ],
          a: 0,
          why: "Evaporation keeps removing a fraction each step, and nothing adds to it.",
        },
      },
      {
        t: "More pheromone, higher chance",
        b: `<p>An ant is drawn to the stronger trail but is not forced onto it. Picture a strip cut into one slice per trail, each as wide as that trail's pheromone. The ant drops a pin at a random spot and takes the trail whose slice it hits. So a trail with three times the pheromone gets three times the visits, and a weak trail still gets some.</p><p>For example, with 30 on trail A and 10 on trail B, A owns 30 of the 40 units of strip: a <b>75%</b> chance, and B has 25%. Move the sliders and press Draw to see real picks.</p><details class="math-more"><summary>Show the maths</summary><p>The chance of a trail is its share of the total pheromone:</p><p>$$P(A)=\\frac{\\tau_A}{\\tau_A+\\tau_B}$$</p><p>With $\\tau_A=30$ and $\\tau_B=10$: $30\\div40=75\\%$ for A and 25% for B.</p></details>`,
        v: (box) => NIC.shared.nicL7.pick(box),
        c: {
          q: "Trail A holds 40 and trail B holds 20. About how likely is a new ant to pick A?",
          o: ["About two chances in three", "About nine chances in ten", "About one chance in two"],
          a: 0,
          hint: "A's share is 40 out of 60 in total.",
          why: "40 ÷ 60 is two thirds. B still gets one in three, so it keeps being visited.",
        },
      },
    ],
    guide: [
      "Drag <b>Ants on trail A per step</b>, <b>Ants on trail B per step</b> and <b>Evaporation per step</b>.",
      "Press <b>Ants stop at step 20</b> and watch both trails fade.",
      "Answer the questions after the demo.",
    ],
  };
})();
