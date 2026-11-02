/* pso-03: Lecture 12: 12.4 settings, neighbourhoods and the four stopping rules. */
(function () {
  const N = NIC;
  const { qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL12;
  const { C, pr, newSwarm, step, run, swarmDemo, odour, RULES } = sh;

  // ---------- 12.4 settings, the four stopping rules ----------
  const rate = (n) => {
    let ok = 0;
    for (let sd = 1; sd <= 120; sd++) if (odour(run(sd, n, { c1: 2, c2: 2, w: 1 }, 40).g.f) >= 95) ok++;
    return Math.round((ok / 120) * 100);
  };
  const curve = (c) => {
    const avg = Array(31).fill(0);
    for (let sd = 1; sd <= 100; sd++) {
      const S = newSwarm(sd, 12);
      avg[0] += odour(S.g.f) / 100;
      for (let i = 1; i <= 30; i++) avg[i] += (step(S, { c1: c, c2: c, w: 0.7 }), S.hist[i - 1].best) / 100;
    }
    return avg.map((v, i) => [i, v]);
  };
  const firing = (w) => {
    const S = newSwarm(24, 10),
      at = {};
    for (let i = 1; i <= 80; i++) {
      step(S, { c1: 1, c2: 1, w });
      RULES.forEach(([id, , test]) => {
        if (test(S) && !at[id]) at[id] = i;
      });
    }
    return { at, S };
  };
  const stopFig = () => {
    const { at, S } = firing(0.6);
    const col = { max: "violet", good: "teal", stale: "amber", rad: "blue" };
    const nm = { max: "max iterations", good: "good enough", stale: "no improvement", rad: "radius ~ 0" };
    return F.plot([{ pts: S.hist.map((h, i) => [i + 1, h.best]), c: "teal" }], {
      x: [1, 80],
      y: [40, 105],
      vlines: RULES.filter(([id]) => at[id]).map(([id], k) => [at[id], `${nm[id]} (${at[id]})`, col[id], k * 14]),
      xl: "iteration",
      yl: "best odour",
      h: 210,
    });
  };
  const radFig = () => {
    const mk = (w) => {
      const avg = Array(41).fill(0);
      for (let sd = 1; sd <= 60; sd++) {
        const S = newSwarm(sd, 14);
        avg[0] += 100 / 60;
        for (let i = 1; i <= 40; i++) (step(S, { c1: 1, c2: 1, w }), (avg[i] += S.hist[i - 1].rad * (100 / 60)));
      }
      return avg.map((v, i) => [i, v]);
    };
    return F.plot(
      [
        { pts: mk(1), c: "rose", label: "w = 1" },
        { pts: mk(0.6), c: "teal", label: "w = 0.6" },
      ],
      {
        x: [0, 40],
        y: [0, 110],
        vlines: [],
        xl: "iteration",
        yl: "normalised swarm radius, %",
        h: 200,
      },
    );
  };
  const dials = () =>
    `<div class="nw12-dials">${[
      ["Swarm size", "how many particles; like population size in a GA"],
      ["Neighbourhood size", "who counts as a neighbour when finding the local best"],
      ["Iterations", "how many time steps to run"],
      ["c₁ and c₂", "how hard the pulls to pbest and gbest are"],
    ]
      .map(([a, b]) => `<div class="nw12-dial fi"><b>${a}</b><span>${b}</span></div>`)
      .join("")}</div>`;
  function ringFig(box) {
    let k = 1;
    const draw = () => {
      const pts = Array.from({ length: 8 }, (_, i) => [
        200 + 82 * Math.sin((i * Math.PI) / 4),
        100 - 70 * Math.cos((i * Math.PI) / 4),
      ]);
      const inN = (i) => k === 0 || Math.min((i + 8) % 8, (8 - i) % 8) <= k;
      const ring = pts
        .map(
          (p, i) =>
            `<line x1="${p[0]}" y1="${p[1]}" x2="${pts[(i + 1) % 8][0]}" y2="${pts[(i + 1) % 8][1]}" stroke="var(--line-2)" stroke-width="3"/>`,
        )
        .join("");
      const dots = pts
        .map(
          (p, i) =>
            `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 0 ? 15 : 12}" fill="${inN(i) ? "var(--amber)" : "var(--panel)"}" stroke="${i === 0 ? "var(--text)" : "var(--line-2)"}" stroke-width="3"/>`,
        )
        .join("");
      qs("[data-r]", box).innerHTML =
        `<svg class="fig" viewBox="0 0 400 200" style="max-height:210px" role="img" aria-label="Eight particles on a ring. The top one follows the best of itself and the ${k === 0 ? "whole swarm" : `${k} neighbour${k > 1 ? "s" : ""} on each side`}.">${ring}${dots}<text x="200" y="104" text-anchor="middle" class="nw12-lab2" style="fill:var(--text)">${k === 0 ? "gbest: whole swarm" : `lbest: ${k} each side`}</text></svg>`;
    };
    box.innerHTML = `<div class="controls" data-s></div><div data-r></div>`;
    qs("[data-s]", box).append(
      N.seg(
        [
          ["1", "1 each side"],
          ["2", "2 each side"],
          ["0", "Whole swarm"],
        ],
        "1",
        (v) => ((k = +v), draw()),
      ),
    );
    draw();
  }

  N.register({
    id: "l12-settings",
    lecture: 12,
    order: 4,
    num: "12.4",
    title: "PSO settings and stopping",
    blurb: "Swarm size, neighbourhoods, iterations, c1 and c2, and four ways to decide the search is over.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A PSO run has a few <b>dials</b> and a few <b>stopping rules</b>. Change the dials here, <b>Run</b> the swarm, and read the board under the stats: it tells you when each rule would stop the run.",
        ),
      );
      swarmDemo(root, life, {
        controls: ["n", "c1", "c2", "w", "k"],
        title: "Settings and stopping rules",
        rules: true,
        seed: 24,
        params: { c1: 1, c2: 1, w: 0.6, n: 10 },
      });
      root.appendChild(
        pr(
          "l12-settings-1",
          "Set <b>Swarm size</b> to 3 and press <b>Run</b> a few times with <b>Reset</b>. Compared with 30 particles, what happens? | It more often misses the brightest spot, since fewer places are tried | It always finds the food faster, because fewer particles can agree sooner | It finds the same best odour, since size does not matter | With only three guesses to start from, the search often never samples near the narrow peak. Larger swarms cover more of the map, at more cost per iteration.",
        ),
      );
      root.appendChild(
        pr(
          "l12-settings-2",
          "Set <b>Momentum kept</b> to 1 and run for 50 iterations. Which stopping rule is unlikely to fire? | Swarm radius near zero, because the swarm keeps circling | Maximum iterations, because it counts steps whatever the swarm does | No improvement for N iterations, because it watches only the best | Acceptable solution found, because it checks the best fitness only | With the slide's plain formula nothing slows the particles, so the swarm keeps moving. The other three rules look at a step count or at the best fitness, so they can fire whatever the radius does.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "The dials: <b>swarm size</b>, <b>neighbourhood size</b> (for the local best), <b>number of iterations</b>, and <b>c₁</b> and <b>c₂</b>.",
            "Too <b>low</b> acceleration coefficients slow progress. Too <b>high</b> may cause premature convergence.",
            "Stop on: <b>maximum iterations</b>, an <b>acceptable solution</b>, <b>no improvement for N iterations</b>, or a normalised <b>swarm radius</b> near zero.",
          ],
          "Set the dials, then choose how the search ends.",
        ),
      );
    },
  });

  L["l12-settings"] = {
    sum: "Swarm size, neighbourhood size, iterations and c1, c2 are the PSO settings; stop on a maximum, a good-enough solution, no improvement for N iterations, or a swarm radius near zero.",
    steps: [
      {
        t: "The four dials",
        b: `<p>PSO has a short list of settings. <b>Swarm size</b>, <b>neighbourhood size</b> (for the local best), the <b>number of iterations</b> and the <b>acceleration coefficients</b> $c_1$ and $c_2$.</p><p>The lecture calls them an intuitive set: each one has an easy picture, like population size in a genetic algorithm.</p>`,
        v: dials(),
        c: C(
          "Which PSO setting is the analogue of population size in a genetic algorithm? | Swarm size | Neighbourhood size | Number of iterations | The number of particles is the population. Neighbourhood size says who a particle listens to, and iterations says how long to run.",
        ),
      },
      {
        t: "Swarm size",
        b: `<p>More particles cover more of the map and give the search more chances to start near the food. But each iteration costs more. This is the same trade as population size in a genetic algorithm.</p><p>The bars run the swarm 120 times for each size: how often did it end within 5% of the best possible odour after 40 steps?</p>`,
        v: (box) => {
          box.innerHTML = F.bars(
            [4, 10, 25].map((n, i) => [`${n} particles`, rate(n), ["rose", "blue", "teal"][i]]),
            { unit: "%", max: 100, label: "Share of runs that found the food: 4, 10 and 25 particles" },
          );
        },
        c: C(
          "A bigger swarm usually finds the food more often. What is the cost? | More fitness evaluations in every iteration | A smaller maximum odour that the swarm can ever reach | It can no longer remember a personal best for each particle | Every particle is scored every iteration, so 40 particles cost twice as much per iteration as 20.",
        ),
      },
      {
        t: "Neighbourhood size: gbest or lbest",
        b: `<p>With <b>gbest</b>, every particle is pulled to the best position found by the whole swarm. With <b>lbest</b>, it is pulled to the best found in its <b>neighbourhood</b>: itself and a few neighbours on a ring. Pick one below to see which particles the top one listens to.</p><p>A small neighbourhood spreads good news slowly, so groups can explore different places for longer.</p>`,
        v: (box) => ringFig(box),
        c: C(
          "A particle follows the best of itself and one neighbour on each side. What is this called? | The local best (lbest) | The global best (gbest) | The personal best (pbest) | The best found within a neighbourhood is the local best. The global best is the whole swarm's, and the personal best is the particle's own.",
        ),
      },
      {
        t: "c₁ and c₂: not too low, not too high",
        b: `<p>$c_1$ and $c_2$ manage the relationship between pbest and gbest/lbest. <b>Too low</b>, and the pulls are tiny: progress is slow. <b>Too high</b>, and the pulls are violent: particles overshoot, and the swarm may leap to whatever the best-so-far is, even a decoy.</p><p>The lines show the average best odour of 100 swarms with $c_1 = c_2 = c$: red is $c = 0.05$, green is $c = 1$, purple is $c = 4$. The red line climbs slowest at first (it catches up given time), and the purple one ends lowest.</p>`,
        v: (box) => {
          box.innerHTML = F.plot(
            [
              { pts: curve(0.05), c: "rose" },
              { pts: curve(1), c: "teal" },
              { pts: curve(4), c: "violet" },
            ],
            {
              x: [0, 30],
              y: [55, 95],
              xl: "iteration",
              yl: "average best odour",
              h: 210,
              label:
                "Average best odour over 30 iterations for c = 0.05 (red), c = 1 (green) and c = 4 (purple). The red line climbs slowest at first and catches up, and the purple line ends lowest.",
            },
          );
        },
        c: C(
          "The lecture warns about acceleration coefficients that are too low. What goes wrong? | Progress is slow | The swarm always converges at once | Particles stop having a position | Tiny pulls change the velocities only a little, so the swarm takes many iterations to move towards good areas.",
        ),
      },
      {
        t: "Four ways to stop",
        b: `<p>Four <b>termination criteria</b>: a <b>maximum number of iterations</b>; an <b>acceptable solution</b> found; <b>no improvement</b> for N iterations; and a <b>normalised swarm radius</b> close to zero (the swarm has converged).</p><p>In this one run the four rules fire at different times, as the dashed lines show. Any one of them ends the run.</p>`,
        v: stopFig(),
        c: C(
          "The best odour has not changed for 8 iterations. Which stopping rule is this? | No improvement for N iterations | Acceptable solution found | Maximum number of iterations | Normalised swarm radius near zero | The rule watches the best fitness and stops when it has been flat for N iterations.",
        ),
      },
      {
        t: "Reading the swarm radius",
        b: `<p>The <b>normalised swarm radius</b> measures how spread out the particles are, divided by how spread they were at the start. When it is close to zero, all particles are in nearly the same place: the swarm has converged.</p><p>An extra, not in the slides: with the plain formula the swarm may keep circling for ever, so the radius stays high. A factor $w$ below 1 on the old velocity lets it settle. The lecture's formula is $w = 1$.</p><details class="math-more"><summary>Show the maths</summary>$$v^{t+1}_{ij}=w\\,v^{t}_{ij}+c_1 z_1 (p_{ij}-x_{ij})+c_2 z_2 (g_j-x_{ij})$$<p>Setting $w=1$ gives the slide's rule. The demo's <b>Momentum kept</b> slider is $w$.</p></details>`,
        v: (box) => {
          box.innerHTML = radFig();
        },
        c: C(
          "A swarm's normalised radius has dropped to nearly 0. What does this tell you? | The particles are bunched together: the swarm has converged | The swarm has certainly found the best position anywhere on the map | The particles have stopped being scored, so the fitness is frozen | A small radius means the particles are close to each other. They may be on the best spot or a poor one, so it is not proof of optimality.",
        ),
      },
    ],
    guide: [
      "Press <b>Run</b> and watch the four boxes under the stats light up as each rule would stop the run.",
      "Drag <b>Swarm size</b> between 3 and 40, press <b>Reset</b> and compare runs.",
      "Set <b>Momentum kept</b> to 1 and see how the swarm radius behaves, then set it back to about 0.6.",
      "Try <b>Neighbours each side</b> at 1: each particle follows only its ring neighbours. Answer the questions after the demo.",
    ],
  };
})();
