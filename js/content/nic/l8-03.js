/* l8-03: Lecture 8: 8.4 results and variants, 8.5 construction graphs and scheduling. */
(function () {
  const N = NIC;
  const { el, qs, qsa, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL8;
  const { C, pr, mulberry, table, colonyDemo, runColony, OPT } = sh;

  // ---------- 8.4 results and variants ----------
  const MODES = [
    ["all", "All ants (Ant System)"],
    ["rank", "Best 3 (elitist rank)"],
    ["best", "Best ant only (Max-Min style)"],
  ];
  const mean20 = (P, key) => {
    const runs = Array.from({ length: 20 }, (_, s) => runColony(s + 1, P, 20));
    return Array.from({ length: 20 }, (_, i) => [i + 1, runs.reduce((a, S) => a + S.hist[i][key], 0) / 20]);
  };
  const raceFig = () =>
    F.plot(
      MODES.map(([m], i) => ({
        pts: mean20({ ...sh.DEF, mode: m }, "mean"),
        c: ["rose", "blue", "teal"][i],
        label: ["All ants", "Best 3", "Best ant"][i],
      })),
      {
        x: [1, 20],
        y: [Math.floor(OPT / 10) * 10, 160],
        xl: "iteration",
        yl: "ants' average tour (km), 20 runs",
        h: 190,
      },
    );
  /** Share of 40 runs that end 20 iterations above 116 km, for each update rule (greedy-ish set-up). */
  const riskFig = () => {
    const bad = MODES.map(([m, name], i) => {
      const P = { ...sh.DEF, beta: 1, mode: m };
      const k = Array.from({ length: 40 }, (_, s) => runColony(s + 1, P, 20)).filter((S) => S.best.len > 116).length;
      return [name, Math.round((k / 40) * 100), ["rose", "blue", "teal"][i]];
    });
    return F.bars(bad, {
      max: 100,
      unit: "%",
      label: `Share of 40 runs that finished above 116 km: ${bad.map((b) => `${b[0]} ${b[1]}%`).join(", ")}`,
    });
  };
  const whoFig = () => {
    const lens = [48, 52, 55, 60, 71, 80],
      row = (name, k) =>
        `<div class="nw8-who"><b>${name}</b>${lens.map((v, i) => `<span class="nw8-chip ${i < k ? "teal" : ""}">${v}</span>`).join("")}</div>`;
    return `<div class="nw8-whos"><p class="dim">Six ants' tour lengths (km), shortest first. Shaded ants deposit.</p>${row("Ant System", 6)}${row("Elitist rank (best 3)", 3)}${row("Max-Min (best 1)", 1)}</div>`;
  };

  N.register({
    id: "l8-variants",
    lecture: 8,
    order: 4,
    num: "8.4",
    title: "Results and variants",
    blurb: "How the Ant System fared against GAs and annealing, and the variants that let only the best ants deposit.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Early results were good but not magic. Later variants change <b>who deposits pheromone</b>: all ants (Ant System), the best few (<b>Elitist rank</b>) or only the best (<b>Max-Min</b>). Try them on the ten villages.",
        ),
      );
      colonyDemo(root, life, { controls: ["mode", "beta", "rho"], title: "Who gets to deposit?", params: { beta: 3 } });
      root.appendChild(
        pr(
          "l8-var-1",
          "Choose <b>Best ant</b>, press <b>Run 10</b> and read <b>Trail on best round</b>. Compared with <b>All ants</b>, the share is… | Higher: one tour gets all the new pheromone | Lower: fewer ants means less pheromone overall | The same: Q/L makes every ant equal | Only an ant that finds the best round deposits, so the trail piles onto it. When all ants deposit, trails spread over many different tours.",
        ),
      );
      root.appendChild(
        pr(
          "l8-var-2",
          "With <b>Best ant</b> and a high <b>ρ</b> such as 0.9, what is the danger? | It may commit early to a poor round | The colony never learns anything from tours | Pheromone grows without any limit at all | Strong deposits plus fast forgetting mean the newest good tour dominates quickly. If it is not the best, the colony may be stuck with it.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "The <b>Ant System</b> found the best solutions on small problems (30 cities). On larger ones it converged to good, not best, solutions.",
            "On a static problem like the TSP, specialist algorithms are hard to beat; <b>coupling ants with a local optimiser</b> gave world-class results.",
            "<b>Elitist rank</b> and <b>Max-Min</b> update the pheromone with only the best n ants, or the single best.",
            "Focused updates converge faster but risk locking in: the balance is again exploration against exploitation.",
          ],
          "Let fewer ants shout louder, and you get speed and risk in equal measure.",
        ),
      );
    },
  });

  L["l8-variants"] = {
    sum: "Early ant results, the comparison with genetic algorithms and annealing, and variants that update with only the best ants.",
    steps: [
      {
        t: "Early ant results",
        b: `<p>The original Ant System found the <b>best</b> solutions on small problems (30 cities). On larger ones it converged to <b>good, not best</b> solutions. On a <b>static</b> problem like the TSP, specialist algorithms are hard to beat. Ants are really <b>dynamic</b> optimisers, built for problems that change, so good static results were a bonus. <b>Coupling ants with local search</b> gave world-class results.</p>`,
        v: F.compare(
          { title: "Small problems", c: "teal", body: "ants found the best solutions" },
          { title: "Larger problems", c: "amber", body: "good solutions, not the best" },
        ),
        c: C(
          "Which result is true of the early Ant System on the TSP? | On large problems it gave good but not the best solutions | It beat every specialist TSP algorithm on large problems | It only worked on problems that change while it runs | Ants did well, but static TSP is exactly where specialist algorithms are strongest.",
        ),
      },
      {
        t: "Ants against GA and annealing",
        b: `<p>A comparison pitted the Ant Colony System (ACS) against a genetic algorithm (GA) and simulated annealing (SA) on the same maps. The ants found tours as short or shorter, while looking at <b>far fewer tours</b>.</p><p>On the 50-town map, Eil50, the ACS found a tour of 425 after examining about 1,800 tours. The GA needed 25,000 tours to reach 428 and SA needed about 68,500 to reach 443. The bars show how many tours each one examined.</p><details class="math-more"><summary>Show the full table</summary><p>The ACS ran for 1250 iterations with 20 ants, averaged over 15 runs. Shortest tour and number of tours examined, from the lecture's table:</p>${table(
          ["Problem", "ACS length", "ACS tours", "GA length", "GA tours", "SA length", "SA tours"],
          [
            ["Eil50", 425, "1,830", 428, "25,000", 443, "68,512"],
            ["Eil75", 535, "3,480", 545, "80,000", 580, "173,250"],
            ["KroA100", "21,282", "4,820", "21,761", "103,000", "n/a", "n/a"],
          ],
        )}</details>`,
        v: F.bars(
          [
            ["Ants (ACS)", 1830, "teal"],
            ["Genetic algorithm", 25000, "blue"],
            ["Annealing", 68512, "violet"],
          ],
          { max: 68512, fmt: (v) => v.toLocaleString("en-GB"), unit: " tours" },
        ),
        c: C(
          "On Eil50 the ACS examined 1,830 tours and the GA 25,000. Roughly how many times fewer tours did the ACS examine? | About 14 times | About 3 times | About 140 times | 25,000 / 1,830 is about 25 / 1.8, which is just under 14.",
          "Try 25,000 / 2,000 first.",
        ),
      },
      {
        t: "Who deposits?",
        b: `<p>The original <b>Ant System</b> lets every ant deposit. Variants update differently, using only the <b>best</b> or the <b>best n</b> ants: <b>Max-Min Ant System</b> (Stützle and Hoos, 2000) and <b>Elitist Rank Ant System</b> (Bullnheimer, 1999). They performed better on some problems. Max-Min also keeps every trail between a minimum and a maximum, so no road ever becomes impossible or certain.</p>`,
        v: whoFig(),
        c: C(
          "Ten ants finish their tours. The elitist rank variant lets the best 3 deposit. How many ants deposit? | 3 | 10 | 1 | Only the best n = 3 ants update the trails.",
        ),
      },
      {
        t: "Race the three rules",
        b: `<p>Same colony, same ten villages, three update rules. The chart is the <b>average tour length of the ants</b>, averaged over 20 runs of the simulator. Where the ants' average sits close to the best round, the colony has converged on one route.</p>`,
        v: raceFig(),
        c: C(
          "Which update rule's curve is highest, so the colony is still the most scattered? | All ants deposit | Best 3 deposit | Only the best ant deposits | When every ant lays pheromone, trails stay spread across many tours, so the average stays high.",
        ),
      },
      {
        t: "Faster, but riskier",
        b: `<p>Focus helps speed, but a colony that listens to one ant can be misled. In a harder set-up (β = 1) we count how many of 40 runs <b>finished above 116 km</b> after 20 iterations. The shortest possible round is ${OPT.toFixed(1)} km.</p>`,
        v: riskFig(),
        c: C(
          "Which update rule most often ended with a poor round in that chart? | Best ant only | Best 3 ants only | All ants together | Giving all the pheromone to one early tour makes it hard for the colony to leave a wrong route.",
        ),
      },
    ],
    guide: [
      "Pick <b>All ants</b>, press <b>Run 10</b> twice and note <b>Trail on best round</b>.",
      "Press <b>Reset</b>, pick <b>Best ant</b> and repeat. Compare the two numbers.",
      "Drag <b>ρ</b> high with <b>Best ant</b> selected, then <b>Reset</b> and run a few times to see whether it gets stuck.",
      "Answer the questions after the demo.",
    ],
  };

  // ---------- 8.5 scheduling on a construction graph ----------
  const JOBS = {
    B: ["Banner", 30, 100],
    L: ["Leaflets", 30, 20],
    P: ["Posters", 30, 50],
    T: ["Tickets", 30, 80],
    W: ["Wraps", 50, 30],
  };
  const KEYS = Object.keys(JOBS);
  const evalOrder = (o) => {
    let t = 0;
    const rows = o.map((j) => {
      t += JOBS[j][1];
      return { j, end: t, late: Math.max(0, t - JOBS[j][2]) };
    });
    return { rows, avg: rows.reduce((a, r) => a + r.late, 0) / o.length, max: Math.max(...rows.map((r) => r.late)) };
  };
  const gantt = (o) =>
    `<div class="nw8-gantt">${evalOrder(o)
      .rows.map(
        (r) =>
          `<div class="nw8-job ${r.late ? "late" : "ok"}" style="flex:${JOBS[r.j][1]}"><b>${r.j}</b><small>ends ${r.end}</small><small>due ${JOBS[r.j][2]}</small><small>late ${r.late}</small></div>`,
      )
      .join("")}</div>`;
  const edd = () => [...KEYS].sort((a, b) => JOBS[a][2] - JOBS[b][2]);
  /** The reorderable schedule: used by 8.5 and the workshop. onEval(order, result) runs after every change. */
  function schedCard(box, onEval) {
    const st = { o: ["B", "T", "P", "L", "W"] };
    box.innerHTML = `<div class="nw8-sched"><div class="nw8-moves" data-m></div><div data-g></div><div class="nw8-stats" data-s></div><div class="controls"><button class="btn small" data-edd>Earliest due first</button><button class="btn small ghost" data-shuf>Shuffle</button></div></div>`;
    const r = mulberry(11);
    function draw() {
      const e = evalOrder(st.o);
      qs("[data-m]", box).innerHTML = st.o
        .map(
          (j, i) =>
            `<span class="nw8-mv"><button class="btn small ghost" data-l="${i}" ${i ? "" : "disabled"} aria-label="Move ${JOBS[j][0]} earlier">◀</button><b>${j}</b><button class="btn small ghost" data-r="${i}" ${i < st.o.length - 1 ? "" : "disabled"} aria-label="Move ${JOBS[j][0]} later">▶</button></span>`,
        )
        .join("");
      qs("[data-g]", box).innerHTML = gantt(st.o);
      qs("[data-s]", box).innerHTML =
        `<div class="wk-stat blue"><small>Average lateness</small><b>${+e.avg.toFixed(1)} min</b></div><div class="wk-stat rose"><small>Maximum lateness</small><b>${e.max} min</b></div>`;
      qsa("[data-l],[data-r]", box).forEach(
        (b) =>
          (b.onclick = () => {
            const i = +(b.dataset.l ?? b.dataset.r),
              k = b.dataset.l !== undefined ? i - 1 : i + 1;
            [st.o[i], st.o[k]] = [st.o[k], st.o[i]];
            draw();
          }),
      );
      if (onEval) onEval([...st.o], e);
    }
    qs("[data-edd]", box).onclick = () => ((st.o = edd()), draw());
    qs("[data-shuf]", box).onclick = () => {
      for (let i = 4; i > 0; i--) {
        const k = Math.floor(r() * (i + 1));
        [st.o[i], st.o[k]] = [st.o[k], st.o[i]];
      }
      draw();
    };
    draw();
  }
  /** One-ant run on the construction graph: Start, then jobs, alpha = beta = 1, eta = 100/due. */
  const TAU = {
    S: { B: 1, L: 1, P: 2, T: 1, W: 3 },
    B: { L: 1, P: 1, T: 2, W: 1 },
    L: { B: 1, P: 3, T: 1, W: 2 },
    P: { B: 1, L: 1, T: 3, W: 1 },
    T: { B: 3, L: 1, P: 1, W: 1 },
    W: { B: 1, L: 2, P: 2, T: 1 },
  };
  function* antFrames() {
    const r = mulberry(2);
    let cur = "S";
    const order = [];
    yield {
      cap: "The ant starts on the <b>Start</b> node. Nothing is scheduled yet.",
      cur,
      order: [],
      J: KEYS,
      step: 0,
    };
    while (order.length < 5) {
      const J = KEYS.filter((j) => !order.includes(j)),
        w = J.map((j) => TAU[cur][j] * (100 / JOBS[j][2])),
        s = w.reduce((a, b) => a + b, 0),
        p = w.map((x) => x / s);
      let c = 0,
        i = 0;
      const u = r();
      for (; i < J.length - 1; i++) {
        c += p[i];
        if (u < c) break;
      }
      const f = {
        cap: `From <b>${cur === "S" ? "Start" : cur}</b>: the ant may pick any job in J. Score = τ × η with η = 100/due. It draws <b>${J[i]}</b>.`,
        cur,
        order: [...order],
        J,
        w,
        p,
        to: J[i],
        step: order.length + 1,
      };
      if (order.length === 0 || order.length === 3)
        f.ask = {
          q: "Tap a job the ant can still choose.",
          pick: ".nw8-chip",
          a: J,
          why: `Only jobs not yet scheduled: ${J.join(", ")}.`,
        };
      yield f;
      order.push(J[i]);
      cur = J[i];
    }
    const e = evalOrder(order);
    yield {
      cap: `Every job is visited, so the path is complete: <b>no return to Start</b>. Schedule ${order.join(" ")}: average lateness <b>${e.avg}</b>, maximum <b>${e.max}</b>. Quality can be Q divided by that fitness.`,
      cur,
      order,
      J: [],
      done: true,
    };
  }
  const schedRun = (box, life) =>
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = `<div class="nw8-rs"><div class="nw8-chips" data-c></div><div data-g></div><div class="nw8-tbl" data-t></div></div>`;
        return { stage };
      },
      draw(sc, f) {
        const s = sc.stage;
        qs("[data-c]", s).innerHTML =
          `<span class="nw8-chip ${f.cur === "S" ? "now" : ""}">Start</span>${KEYS.map((k) => `<span class="nw8-chip ${f.order.includes(k) ? "done" : ""} ${f.cur === k ? "now" : ""} ${f.J.includes(k) && !f.done ? "teal" : ""}" data-k="${k}">${k}</span>`).join("")}`;
        qs("[data-g]", s).innerHTML = f.order.length ? gantt(f.order) : "";
        qs("[data-t]", s).innerHTML = f.w
          ? table(
              ["to", "τ", "η = 100/due", "τ × η", "p"],
              f.J.map((j, i) => [
                `<b>${j}</b>`,
                TAU[f.cur][j],
                +(100 / JOBS[j][2]).toFixed(2),
                +f.w[i].toFixed(2),
                `${Math.round(f.p[i] * 100)}%`,
              ]),
            )
          : "";
      },
      frames: antFrames,
    });
  const layerFig = () => {
    const cols = [
      ["Starter", ["Soup", "Salad", "Olives"]],
      ["Main", ["Pie", "Curry", "Pasta"]],
      ["Dessert", ["Fruit", "Cake", "Sorbet"]],
    ];
    const pick = [0, 1, 2],
      X = (c) => 100 + c * 130,
      Y = (r) => 52 + r * 46;
    let s = `<circle cx="22" cy="${Y(1)}" r="14" fill="var(--panel-2)" stroke="var(--text)" stroke-width="2"/><text x="22" y="${Y(1) + 4}" text-anchor="middle" font-size="9" font-weight="800" fill="var(--text)">Start</text>`;
    cols.forEach(([nm, o], c) => {
      s += `<text x="${X(c)}" y="18" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text)">${nm}</text>`;
      o.forEach((t, r) => {
        const on = pick[c] === r;
        if (c < 2)
          o.forEach(
            (_, r2) =>
              (s += `<line x1="${X(c) + 24}" y1="${Y(r)}" x2="${X(c + 1) - 24}" y2="${Y(r2)}" stroke="${on && pick[c + 1] === r2 ? "var(--teal)" : "var(--line-2)"}" stroke-width="${on && pick[c + 1] === r2 ? 4 : 1.2}"/>`),
          );
        if (c === 0)
          s += `<line x1="36" y1="${Y(1)}" x2="${X(0) - 24}" y2="${Y(r)}" stroke="${on ? "var(--teal)" : "var(--line-2)"}" stroke-width="${on ? 4 : 1.2}"/>`;
        s += `<rect x="${X(c) - 24}" y="${Y(r) - 14}" width="48" height="28" rx="9" fill="${on ? "color-mix(in srgb, var(--teal) 20%, var(--panel))" : "var(--panel)"}" stroke="${on ? "var(--teal)" : "var(--line-2)"}" stroke-width="2"/><text x="${X(c)}" y="${Y(r) + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--text)">${t}</text>`;
      });
    });
    return `<svg class="fig" viewBox="0 0 400 190" role="img" aria-label="A layered construction graph: Start, then one option from each of three layers: starter, main and dessert. The highlighted path is Soup, Curry, Sorbet.">${s}</svg>`;
  };
  const eds = (t) => t.split(" ").map((e) => e.split("-"));
  const constructionFig = () =>
    F.graph({
      nodes: {
        Start: { x: 40, y: 80, c: "violet" },
        A: [150, 30],
        B: [150, 130],
        C: [270, 30],
        D: [270, 130],
        E: [370, 80],
      },
      edges: eds("Start-A Start-B A-C A-D B-C B-D C-E D-E"),
      hl: { "A-C": "teal", "C-E": "teal" },
      w: 410,
      h: 160,
      directed: true,
      label: "A construction graph: any route from Start to the end is one candidate solution.",
    });
  const startFig = () =>
    F.graph({
      nodes: {
        Start: { x: 40, y: 80, c: "violet" },
        B: [160, 24],
        L: [160, 80],
        P: [160, 136],
        T: [270, 50],
        W: [270, 110],
      },
      edges: eds("Start-B Start-L Start-P L-W L-T W-P B-T T-W"),
      hl: { "Start-L": "teal", "L-W": "teal" },
      w: 330,
      h: 160,
      directed: true,
      label:
        "Jobs as nodes with a Start node. An edge from one job to another means the second is scheduled next. The first edge from Start picks the first job.",
    });

  N.register({
    id: "l8-schedule",
    lecture: 8,
    order: 5,
    num: "8.5",
    title: "Construction graphs: scheduling",
    blurb: "Beyond the TSP: one machine, five jobs with due times, a lateness fitness and an ant on a Start node.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "ACO works for <b>any problem whose solutions can be drawn as paths in a network</b>: a <b>construction graph</b>. Take a print shop with one press. Reorder the five jobs and watch lateness change.",
        ),
      );
      const card = el(
        `<div class="card nw8-demo"><div class="card-head"><h2>Reorder the print jobs</h2></div><div data-box></div></div>`,
      );
      root.appendChild(card);
      schedCard(qs("[data-box]", card));
      root.appendChild(
        pr(
          "l8-sched-1",
          "Press <b>Earliest due first</b>. What does that order achieve? | The smallest maximum lateness of any order | The smallest average lateness of any order | Zero lateness for every job | Sorting by due date (Jackson's rule) minimises the worst lateness. Here the maximum is 70 min, but the average (50) is not the best, and some jobs are still late.",
        ),
      );
      root.appendChild(
        pr(
          "l8-sched-2",
          "Use ◀ and ▶ to swap two neighbouring jobs. Which jobs' finish times change? | Only the two swapped jobs | Every job after the swap | Every job in the schedule | The jobs before the pair and after it finish when they did before, since the pair still takes the same total time. Only the two swapped jobs trade finish times.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Any problem you can draw as <b>paths in a construction graph</b> can be attacked with ants.",
            "<b>Lateness</b> = finish time − due time, or 0 if the job is early. Fitness can be the <b>average</b> or the <b>maximum</b> lateness, and they may disagree.",
            "For scheduling, <b>each job is a node</b>, an ant starts at <b>Start</b>, and the path ends when <b>every job has been visited</b>: no return.",
            "A layered graph lets an ant make <b>one choice per layer</b>, moving forward one layer at a time.",
          ],
          "Draw the solution as a path, then let the ants walk it.",
        ),
      );
    },
  });

  L["l8-schedule"] = {
    sum: "Single-machine scheduling with due dates as a path problem: lateness fitness, a Start node, a due-date heuristic and a layered construction graph.",
    steps: [
      {
        t: "Solutions as paths",
        b: `<p>The ant colony algorithm is not just for the TSP. It suits <b>any sequencing problem, or indeed any problem</b>, as long as you can represent solutions as <b>paths in a network</b>: a <b>construction graph</b>. An ant builds one candidate solution by walking from the start to the end.</p>`,
        v: constructionFig(),
        c: C(
          "What does ACO need before it can be applied to a new problem? | Solutions that can be drawn as paths in a graph | A distance between every pair of its cities | A population that crosses over its own tours | Pheromone and the transition rule work on the edges of a graph. Cities and distances are specific to the TSP.",
        ),
      },
      {
        t: "One press, five jobs",
        b: `<p>A print shop has <b>one machine</b>, so it can do just one job at a time. Times are minutes after opening. Every job has a <b>duration</b> and a <b>due time</b>.</p>`,
        v: table(
          ["Job", "Name", "Duration", "Due"],
          KEYS.map((k) => [k, JOBS[k][0], JOBS[k][1], JOBS[k][2]]),
        ),
        c: C(
          "The five jobs last 30, 30, 30, 30 and 50 minutes. If the press never idles, when does the last job finish, in any order? | Minute 170 | Minute 150 | Minute 200 | The finish time of the last job is the sum of all durations: 30 + 30 + 30 + 30 + 50 = 170.",
        ),
      },
      {
        t: "Lateness",
        b: `<p>A job's <b>lateness</b> is its finish time minus its due time, or <b>0</b> if it finishes early. Here is the order <b>L W P T B</b>: shaded blocks are late.</p>`,
        v: gantt(["L", "W", "P", "T", "B"]),
        c: C(
          "A job finishes at minute 40 and was due at minute 70. What is its lateness? | 0 | 30 | −30 | Lateness is never negative: finishing early counts as 0, not as a bonus.",
        ),
      },
      {
        t: "Fitness: average or maximum?",
        b: `<p>Fitness can be the <b>average lateness</b> or the <b>maximum lateness</b>. They need not agree: press <b>Earliest due first</b>, then rearrange the jobs yourself with the arrows and compare the two numbers.</p>`,
        v: (box) => schedCard(box),
        c: C(
          "Schedule X has average lateness 38 min and maximum 140 min. Schedule Y has average 50 and maximum 70. Which is better if no customer may wait more than 100 min late? | Y, because its worst job is only 70 late | X, because its average is lower | Neither: they are the same fitness | The maximum measures the worst customer. X's worst job is 140 late, which breaks the limit.",
        ),
      },
      {
        t: "The ant's graph",
        b: `<p>Just as with the TSP, each ant finds a path, but <b>each job is a node</b>. There is no need to return to the start: the path is complete when <b>every job is visited</b>. An ant starts at a <b>Start</b> node, so the first link it chooses defines the first job on the machine.</p>`,
        v: startFig(),
        c: C(
          "Why add a Start node to the scheduling graph? | The first job also needs trails and a heuristic score | It lets the ant return to the first job at the end | It stores the best schedule found so far by any ant | The first edge from Start decides which job runs first, so it needs its own trails.",
        ),
      },
      {
        t: "A heuristic: earliest due date",
        b: `<p>Each step of the ant's walk mixes pheromone with a rule of thumb. For scheduling a natural rule of thumb is the <b>due date</b>: the sooner a job is due, the stronger its pull, so the ant leans towards the urgent jobs.</p><p>For example, job L is due at minute 20 and job B at minute 100, so L pulls five times as hard as B. The ruler below puts each job at its due time and draws it bigger the sooner it is due. The strip shows how a draw would go if only this rule counted.</p><details class="math-more"><summary>Show the maths</summary><p>The heuristic for job $j$ is</p><p>$$\\eta_j=\\frac{100}{\\text{due}_j}$$</p>${F.bars(
          KEYS.map((k) => [`${k}, due ${JOBS[k][2]}`, +(100 / JOBS[k][2]).toFixed(2), "blue"]),
          { fmt: (v) => v.toFixed(2), label: "Heuristic eta equals 100 over due time: L 5, W 3.33, P 2, T 1.25, B 1" },
        )}</details>`,
        v: (box) =>
          NIC.shared.nicFig.dueRuler(
            box,
            KEYS.map((k) => ({ k, due: JOBS[k][2] })),
          ),
        c: C(
          "Which job has the smallest η, so is the least attractive by the heuristic alone? | B, due at 100 | L, due at 20 | W, due at 30 | η = 100/due is smallest for the biggest due time, and B has the latest due time of 100.",
        ),
      },
      {
        t: "Watch an ant schedule",
        b: `<p>One ant on the construction graph. It leaves <b>Start</b>, picks a job at each step, and finishes when all five are scheduled. Pheromone was learned in earlier iterations.</p>`,
        v: (box, life) => schedRun(box, life),
        c: C(
          "In the run, W is picked first although L is due sooner. How is that possible? | The choice is random and pheromone on Start to W was strong | The heuristic prefers W, which has the earliest due time | Jobs are always picked in alphabetical order | The score is pheromone times heuristic, and the draw is random, so a less favoured job can win.",
        ),
      },
      {
        t: "One choice per layer",
        b: `<p>Other problems need a different shape. A <b>layered graph</b> has several layers, and an ant moves <b>one layer at a time</b>, choosing one node in each. Choosing a dinner is an example: one starter, one main, one dessert. The path is the whole menu, and pheromone on an edge records how good that pick was after the previous one.</p>`,
        v: layerFig(),
        c: C(
          "An ant has picked Curry in the Main layer. Where can it go next? | To any dessert | To any other main | Back to Start | Ants only move forward one layer at a time, so the next step is a node in the Dessert layer.",
        ),
      },
    ],
    guide: [
      "Press <b>Earliest due first</b> and note the two stats.",
      "Use the arrows to move jobs and try to get the average lateness as low as you can.",
      "Press <b>Shuffle</b> a few times to see typical random schedules.",
      "Answer the questions after the demo.",
    ],
  };
  Object.assign(sh, { JOBS, KEYS, evalOrder, gantt, schedCard, edd });
})();
