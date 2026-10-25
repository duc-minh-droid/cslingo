/* l8-01: Lecture 8 (ant colony detail): shared kernel and colony demo, 8.1 the Ant System loop. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = (NIC.shared.nicL8 = NIC.shared.nicL8 || {});

  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /** Quick check and predict builders. Spec: "question | right answer | wrong | wrong | why" (the engine shuffles the order). */
  const parts = (spec) => {
    const x = spec.split(" | ");
    return { q: x[0], opts: x.slice(1, -1), why: x[x.length - 1] };
  };
  const C = (spec, hint) => {
    const { q, opts, why } = parts(spec);
    return { q, o: opts, a: 0, why, ...(hint ? { hint } : {}) };
  };
  const pr = (id, spec) => predict((({ q, opts, why }) => ({ id, q, opts, a: 0, why }))(parts(spec)));
  const table = (head, rows) =>
    `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;

  // ---------- the ten-village round used by the colony demos ----------
  const NAMES = "ABCDEFGHIJ".split("");
  const XY = "48,62 150,34 262,56 388,44 414,160 318,244 190,218 62,190 238,140 130,120"
    .split(" ")
    .map((t) => t.split(",").map(Number));
  const n = XY.length;
  const D = XY.map((a) => XY.map((b) => Math.hypot(a[0] - b[0], a[1] - b[1]) / 10));
  const tourLen = (t) => t.reduce((s, c, i) => s + D[c][t[(i + 1) % t.length]], 0);
  /** Held-Karp: the exact shortest round, so the demos can say how close the colony is. */
  const OPT = (() => {
    const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    dp[1][0] = 0;
    for (let m = 1; m < 1 << n; m++)
      for (let i = 0; i < n; i++) {
        if (!(m & (1 << i)) || dp[m][i] === Infinity) continue;
        for (let j = 0; j < n; j++)
          if (!(m & (1 << j))) dp[m | (1 << j)][j] = Math.min(dp[m | (1 << j)][j], dp[m][i] + D[i][j]);
      }
    return Math.min(...dp[(1 << n) - 1].map((v, i) => v + D[i][0]));
  })();
  // ---------- Ant System: the transition rule, one iteration, the update rule ----------
  const DEF = { ants: 10, alpha: 1, beta: 3, rho: 0.5, Q: 100, mode: "all" };
  /** p_ij^k over every town j: zero for the tabu list (visited), tau^alpha * eta^beta, normalised. */
  function probs(tau, i, vis, al, be) {
    const w = D[i].map((d, j) => (vis.has(j) || j === i ? 0 : Math.pow(tau[i][j], al) * Math.pow(1 / d, be)));
    const s = w.reduce((a, b) => a + b, 0);
    return w.map((x) => (s ? x / s : 0));
  }
  function buildTour(S, start, P) {
    const t = [start],
      vis = new Set(t);
    while (t.length < n) {
      const p = probs(S.tau, t[t.length - 1], vis, P.alpha, P.beta);
      const u = S.r();
      let c = 0,
        j = 0;
      for (; j < n; j++) {
        c += p[j];
        if (u < c && p[j] > 0) break;
      }
      if (j >= n) j = p.findIndex((x) => x > 0);
      t.push(j);
      vis.add(j);
    }
    return t;
  }
  const newColony = (seed) => ({
    r: mulberry(seed),
    tau: Array.from({ length: n }, () => Array(n).fill(1)),
    best: null,
    hist: [],
  });
  /** One iteration: ants on random towns, every ant builds a tour, evaporate, then deposit Q/L on the edges used. */
  function iterate(S, P) {
    const tours = Array.from({ length: P.ants }, () => buildTour(S, Math.floor(S.r() * n), P));
    const lens = tours.map(tourLen);
    const rank = [...tours.keys()].sort((a, b) => lens[a] - lens[b]);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) S.tau[i][j] = Math.max(0.01, S.tau[i][j] * (1 - P.rho));
    const who = P.mode === "all" ? rank : rank.slice(0, P.mode === "rank" ? 3 : 1);
    who.forEach((k) =>
      tours[k].forEach((c, i) => {
        const d = tours[k][(i + 1) % n];
        S.tau[c][d] += P.Q / lens[k];
        S.tau[d][c] += P.Q / lens[k];
      }),
    );
    if (!S.best || lens[rank[0]] < S.best.len - 1e-9) S.best = { len: lens[rank[0]], tour: tours[rank[0]] };
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    S.hist.push({ best: S.best.len, mean, spread: Math.max(...lens) - Math.min(...lens) });
    return S;
  }
  /** Share of all trail that sits on the edges of the best tour found so far. */
  function share(S) {
    if (!S.best) return 0;
    let on = 0,
      all = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all += S.tau[i][j];
    S.best.tour.forEach((c, i) => (on += S.tau[c][S.best.tour[(i + 1) % n]]));
    return on / all;
  }
  const runColony = (seed, P, its) => {
    const S = newColony(seed);
    for (let i = 0; i < its; i++) iterate(S, P);
    return S;
  };

  // ---------- drawing the round ----------
  function mapSVG(S) {
    let mx = 0,
      mn = Infinity;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        mx = Math.max(mx, S.tau[i][j]);
        mn = Math.min(mn, S.tau[i][j]);
      }
    let lines = "";
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const f = mx - mn < 1e-9 ? 0 : (S.tau[i][j] - mn) / (mx - mn);
        lines += `<line x1="${XY[i][0]}" y1="${XY[i][1]}" x2="${XY[j][0]}" y2="${XY[j][1]}" stroke="var(--blue)" stroke-width="${(0.8 + 7 * f).toFixed(1)}" stroke-linecap="round" opacity="${(0.16 + 0.7 * f).toFixed(2)}"/>`;
      }
    const best = S.best
      ? S.best.tour
          .map((c, i) => {
            const d = S.best.tour[(i + 1) % n];
            return `<line x1="${XY[c][0]}" y1="${XY[c][1]}" x2="${XY[d][0]}" y2="${XY[d][1]}" stroke="var(--teal)" stroke-width="2.5" stroke-dasharray="1 6" stroke-linecap="round"/>`;
          })
          .join("")
      : "";
    const dots = XY.map(
      ([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="13" fill="var(--panel)" stroke="var(--text)" stroke-width="2"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text)">${NAMES[i]}</text>`,
    ).join("");
    return `<svg class="fig" viewBox="0 0 460 270" role="img" aria-label="Map of ten villages. Thicker blue lines carry more pheromone; the green dotted line is the best round so far.">${lines}${best}${dots}</svg>`;
  }

  /** The colony sandbox. o: {controls: ["ants","alpha","beta","rho","Q","mode"], seed, title, onRun(S, P)} */
  function colonyDemo(root, life, o = {}) {
    let seed = o.seed || 7,
      S = newColony(seed);
    const P = { ...DEF, ...(o.params || {}) };
    const card = el(
      `<div class="card nw8-demo"><div class="card-head"><h2>${o.title || "Ant colony on ten villages"}</h2></div>
      <div class="controls" data-ctl></div>
      <div class="controls"><button class="btn primary" data-a="1">Run 1 iteration</button><button class="btn" data-a="10">Run 10</button><button class="btn ghost" data-a="0">Reset</button></div>
      <div class="grid two"><div data-map></div><div><canvas class="viz" data-ch></canvas><p class="nw8-legend"><span class="nw8-key teal"></span>best so far <span class="nw8-key amber"></span>average of the ants</p></div></div>
      <div class="nw8-stats" data-st></div></div>`,
    );
    root.appendChild(card);
    const ctl = qs("[data-ctl]", card);
    const defs = {
      ants: ["Ants", 1, 30, 1, "ants"],
      alpha: ["α", 0, 5, 0.5, "alpha"],
      beta: ["β", 0, 6, 0.5, "beta"],
      rho: ["ρ", 0.05, 0.95, 0.05, "rho"],
      Q: ["Q", 10, 500, 10, "Q"],
    };
    (o.controls || ["ants"]).forEach((k) => {
      if (k === "mode") {
        ctl.append(
          N.seg(
            "all:All ants,rank:Best 3,best:Best ant".split(",").map((x) => x.split(":")),
            P.mode,
            (v) => (P.mode = v),
          ),
        );
        return;
      }
      const [lab, lo, hi, st, key] = defs[k];
      const s = N.slider(lab, lo, hi, st, P[key], (v) => (Number.isInteger(v) ? v : +v.toFixed(2)));
      s.onInput((v) => (P[key] = v));
      ctl.append(s);
    });
    function draw() {
      qs("[data-map]", card).innerHTML = mapSVG(S);
      const h = S.hist;
      N.lineChart(qs("[data-ch]", card), {
        series: [
          { data: h.map((x) => x.best), color: N.colors().teal },
          { data: h.map((x) => x.mean), color: N.colors().amber },
        ],
        yMin: Math.floor(OPT / 10) * 10 - 10,
        height: 190,
        xLabel: "iteration",
        names: ["best so far", "average of the ants"],
      });
      const t = h[h.length - 1];
      qs("[data-st]", card).innerHTML = t
        ? `<div class="wk-stat"><small>Iteration</small><b>${h.length}</b></div><div class="wk-stat teal"><small>Best so far</small><b>${t.best.toFixed(1)} km</b></div><div class="wk-stat amber"><small>Ants' average</small><b>${t.mean.toFixed(1)} km</b></div><div class="wk-stat blue"><small>Trail on best round</small><b>${Math.round(share(S) * 100)}%</b></div>`
        : `<p class="dim">Press <b>Run 1 iteration</b>. The shortest possible round is ${OPT.toFixed(1)} km, but the ants do not know that.</p>`;
    }
    const go = (k) => {
      for (let i = 0; i < k; i++) iterate(S, P);
      draw();
      if (o.onRun) o.onRun(S, P);
    };
    qsa("[data-a]", card).forEach((b) => {
      b.onclick = () => {
        const k = +b.dataset.a;
        if (!k) {
          S = newColony(++seed);
          draw();
          if (o.onRun) o.onRun(S, P);
        } else go(k);
      };
    });
    life.onResize(draw);
    draw();
    return { card, state: () => S, params: P, go, draw };
  }
  Object.assign(sh, { C, pr, mulberry, table, colonyDemo, runColony, OPT, DEF, share });

  // ---------- 8.1 the Ant System loop: a five-village round, one ant, step by step ----------
  const T5 = { P: [60, 70], Q: [190, 36], R: [330, 70], S: [296, 206], T: [104, 200] };
  const K5 = Object.keys(T5);
  const d5 = (a, b) => Math.round(Math.hypot(T5[a][0] - T5[b][0], T5[a][1] - T5[b][1]) / 10);
  const e5 = (a, b) => [a, b].sort().join("-");
  const TAU5 = { "P-Q": 3, "Q-R": 1, "R-S": 2, "S-T": 4, "P-T": 2, "P-R": 1, "P-S": 1, "Q-S": 1, "Q-T": 1, "R-T": 1 };
  const A5 = 1,
    B5 = 2,
    Q5 = 100;
  /** The real transition rule with a seeded draw: one frame per decision, then the closing leg and the update. */
  function* antFrames() {
    const r = mulberry(8);
    let cur = "T";
    const vis = ["T"],
      path = [];
    yield { cap: "An ant is placed on <b>T</b>. Its <b>tabu list</b> is {T}.", cur, vis: [...vis], path: [], J: [] };
    while (vis.length < K5.length) {
      const J = K5.filter((x) => !vis.includes(x));
      const w = J.map((j) => Math.pow(TAU5[e5(cur, j)], A5) * Math.pow(1 / d5(cur, j), B5));
      const s = w.reduce((a, b) => a + b, 0),
        p = w.map((x) => x / s);
      let c = 0,
        i = 0;
      const u = r();
      for (; i < J.length - 1; i++) {
        c += p[i];
        if (u < c) break;
      }
      const to = J[i];
      const f = {
        cap: `At <b>${cur}</b>. Tabu list {${vis.join(", ")}}, so <b>J</b> = {${J.join(", ")}}. Each town in J gets $\\tau^\\alpha\\eta^\\beta$, divided by the total. The ant draws a random number and picks <b>${to}</b>.`,
        cur,
        vis: [...vis],
        path: [...path],
        J,
        w,
        p,
        to,
      };
      if (vis.length === 1)
        f.ask = {
          q: "Tap a town this ant is still allowed to visit next.",
          pick: ".rn-node",
          a: J,
          why: `Everything not in the tabu list: ${J.join(", ")}.`,
        };
      if (vis.length === 3)
        f.ask = {
          q: "Tap a town that is still in J.",
          pick: ".rn-node",
          a: J,
          why: `Only ${J.join(" and ")} are left, so the choice is between them.`,
        };
      yield f;
      path.push([cur, to]);
      vis.push(to);
      cur = to;
    }
    const tour = vis.concat(vis[0]);
    const len = tour.slice(1).reduce((s, x, k) => s + d5(tour[k], x), 0);
    yield {
      cap: `All five towns are visited, so <b>J is empty</b>. The ant closes the round back to <b>T</b>. Length $L_k$ = <b>${len} km</b>.`,
      cur: "T",
      vis: [...vis],
      path: [...path, [cur, "T"]],
      J: [],
      len,
    };
    yield {
      cap: `Once every ant has finished, pheromone is updated. This ant's quality is $Q/L_k$ = ${Q5}/${len} ≈ <b>${(Q5 / len).toFixed(2)}</b>, laid on each of its five edges.`,
      cur: "T",
      vis: [...vis],
      path: [...path, [cur, "T"]],
      J: [],
      len,
      upd: true,
    };
  }
  const antRun = (box, life) =>
    F.run(box, life, {
      code: [
        "place the ants on random towns",
        "for step = 1 .. num_city:",
        "  each ant picks the next town with the transition rule",
        "update the pheromone",
        "repeat until the end condition",
      ],
      build(stage) {
        const edges = [];
        K5.forEach((a, i) => K5.slice(i + 1).forEach((b) => edges.push([a, b, d5(a, b)])));
        const g = F.graphScene(stage, { nodes: T5, edges, w: 400, h: 250 });
        const tb = document.createElement("div");
        tb.className = "nw8-tbl";
        stage.appendChild(tb);
        return { ...g, tb };
      },
      draw(sc, f, c) {
        K5.forEach((k) => {
          const h = sc.node(k),
            at = f.J.includes(k);
          h.g.setAttribute(
            "class",
            `rn-node ${k === f.cur ? "s-cur" : f.vis.includes(k) ? "s-done" : at ? "s-tent" : ""}`,
          );
          F.rn.text(c, h.tag, at && f.p ? `${Math.round(f.p[f.J.indexOf(k)] * 100)}%` : "·");
        });
        const used = (a, b) => f.path.some(([x, y]) => e5(x, y) === e5(a, b));
        K5.forEach((a, i) =>
          K5.slice(i + 1).forEach((b) => {
            const h = sc.edge(a, b);
            h.g.classList.toggle("try", !!(f.to && e5(f.cur, f.to) === e5(a, b)));
            F.rn.stroke(c, h.hot, used(a, b));
          }),
        );
        sc.tb.innerHTML = f.w
          ? table(
              ["from " + f.cur + " to", "d", "τ", "τ × η² (×100)", "p"],
              f.J.map((j, i) => [
                `<b>${j}</b>`,
                d5(f.cur, j),
                TAU5[e5(f.cur, j)],
                ((TAU5[e5(f.cur, j)] * 100) / d5(f.cur, j) ** 2).toFixed(2),
                `${Math.round(f.p[i] * 100)}%`,
              ]),
            )
          : f.upd
            ? `<p class="mono dim">Evaporation first: every τ → (1 − ρ)τ. Then +${(Q5 / f.len).toFixed(2)} on each edge this ant used.</p>`
            : "";
      },
      frames: antFrames,
    });

  N.register({
    id: "l8-loop",
    lecture: 8,
    order: 1,
    num: "8.1",
    title: "The Ant System loop",
    blurb: "Place ants, let each build a tour one town at a time, then update the pheromone. Run the colony yourself.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "The <b>Ant System</b> (Dorigo, 1996) is the original ant colony algorithm. We assume you already know why pheromone helps ants. Here is the algorithm itself: <b>num_ant</b> ants are placed on random cities, take <b>num_city</b> steps each, and then the pheromone is updated.",
        ),
      );
      colonyDemo(root, life, { controls: ["ants"], title: "Run the colony" });
      root.appendChild(
        pr(
          "l8-loop-1",
          "Press <b>Run 1 iteration</b> about ten times. What can the <b>best so far</b> line do? | Only stay level or fall, since it keeps the best round ever seen | Rise and fall, because it follows the best round of each separate iteration | Fall a little on every single iteration, since the colony keeps improving | Best so far is a running minimum, so it can never rise. It need not fall every iteration either: it stays level until some ant beats the record.",
        ),
      );
      root.appendChild(
        pr(
          "l8-loop-2",
          "After 10 iterations at the default settings, how does the <b>ants' average</b> compare with the best so far? | It has fallen towards the record but stays above it, since choices are random | It is already below the record, because averages smooth out the bad tours | It matches the record exactly once the first iteration has finished | The average includes every ant, and the record is the single best round, so the average sits above it. Trails pull the average down as the colony learns, but each choice is still a random draw.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "One iteration: <b>place ants at random</b>, every ant builds a full tour with the <b>transition rule</b>, then <b>update the pheromone</b>.",
            "The <b>tabu list</b> holds the towns an ant has visited. The towns it may still choose are $J_i^k$.",
            "Ants do not carry memory between iterations. The <b>pheromone</b> is the colony's memory.",
            "Stop on an <b>end condition</b>: a fixed number of iterations, no improvement for a while, or a good-enough tour.",
          ],
          "Ants build, then the trails learn from what they built.",
        ),
      );
    },
  });

  const loopFig = () => {
    const S = runColony(2, DEF, 30);
    return F.plot([{ pts: S.hist.map((h, i) => [i + 1, h.best]), c: "teal", label: "best so far" }], {
      x: [1, 30],
      y: [Math.floor(OPT / 10) * 10 - 10, Math.ceil(S.hist[0].best / 10) * 10],
      xl: "iteration",
      yl: "km",
      h: 180,
    });
  };
  L["l8-loop"] = {
    sum: "The Ant System loop: random placement, a full tour per ant using the transition rule, then a pheromone update, repeated until an end condition.",
    steps: [
      {
        t: "The loop",
        b: `<p>Take the travelling salesperson problem: visit every town once and come home, as short as possible. The <b>Ant System</b> solves it with a colony of <b>num_ant</b> ants.</p><p>1. Place the ants on <b>random cities</b>. 2. For <b>step = 1 to num_city</b>, every ant picks its next city by the probabilistic <b>transition rule</b>. 3. <b>Update the pheromone</b>. 4. Repeat until the end condition.</p>`,
        v: F.flow(
          [
            "Place ants on random cities",
            "Each ant builds a tour",
            "Update the pheromone",
            { t: "End condition met?", c: "violet" },
          ],
          { loop: true },
        ),
        c: C(
          "In the Ant System, when is the pheromone updated? | After every ant has built a full tour | After each single step of each ant | Only once, before any ant moves | Ants build whole tours first. Only then do the trails change, using the quality of the finished tours.",
        ),
      },
      {
        t: "The tabu list",
        b: `<p>While it builds a tour, an ant keeps a list of the towns it has already visited: the <b>tabu list</b>. Those towns are off limits. The ant may only choose among the towns it has not seen yet, and a visited town has <b>no chance at all</b> of being picked.</p><p>For example, an ant that has visited A, B and C out of six towns can still choose D, E or F. Tap an allowed town below to move the ant on, and watch the tabu list grow and the choices shrink until none are left and the tour ends.</p><details class="math-more"><summary>Show the maths</summary><p>For ant $k$ standing at city $i$, the cities it has <b>not</b> yet visited form the set $J_i^k$. Everything else is on the tabu list and gets probability $0$; only the towns in $J_i^k$ share the probability.</p></details>`,
        v: (box) => NIC.shared.nicFig.walk(box),
        c: C(
          "An ant has visited A, B and C in a round of six towns. How many towns can it still choose from? | 3 | 2 | 4 | Six towns minus the three on the tabu list leaves D, E and F.",
        ),
      },
      {
        t: "Watch one ant build a tour",
        b: `<p>Five villages, a little pheromone already on some roads. Step through <b>one ant</b>: tabu list, the towns it may still choose, and the random pick. Press play or use the arrows.</p>`,
        v: (box, life) => antRun(box, life),
        c: C(
          "In the run, the ant picks the next town at random. Which description fits? | A weighted random draw over the allowed towns | Always the allowed town with the most pheromone | A uniform random pick among the allowed towns | It is a weighted random draw: each allowed town has a probability from the transition rule, and the ant rolls once.",
        ),
      },
      {
        t: "What an ant remembers",
        b: `<p>The tabu list is <b>per ant and per tour</b>. When the next iteration starts, ants are placed again and every tabu list starts fresh. What survives from one iteration to the next is the <b>pheromone</b> on the edges.</p>`,
        v: F.compare(
          { title: "Forgotten every iteration", c: "rose", body: "tabu list<br>the ant's own tour" },
          {
            title: "Carried forward",
            c: "teal",
            body: "pheromone $\\tau_{ij}$ on every edge<br>the best round found so far",
          },
        ),
        c: C(
          "A new iteration begins. What happens to each ant's tabu list? | It is cleared, because the ant starts a new tour | It is kept, so ants avoid last tour's towns | It is merged into the pheromone | A tabu list only stops an ant visiting a town twice within one tour. Learning across iterations happens through the pheromone.",
        ),
      },
      {
        t: "How many ants, how many steps",
        b: `<p>Each iteration is <b>num_ant</b> separate tours, all built from the same trails. More ants mean more tries per iteration but more work. Each ant takes <b>num_city</b> steps, so with 10 ants and 10 towns an iteration makes about 100 transition-rule decisions.</p>`,
        v: F.bars(
          [
            ["num_ant = 5, num_city = 10", 50, "blue"],
            ["num_ant = 10, num_city = 10", 100, "teal"],
            ["num_ant = 20, num_city = 10", 200, "violet"],
          ],
          { unit: " decisions", label: "Decisions per iteration for 5, 10 and 20 ants on ten towns: 50, 100, 200" },
        ),
        c: C(
          "Each ant makes one decision per town. How many decisions in one iteration with 4 ants and 8 towns? | 32 | 12 | 16 | 4 ants × 8 steps = 32.",
        ),
      },
      {
        t: "When to stop",
        b: `<p>The <b>end condition</b> is up to you: a fixed number of iterations, a time limit, a good-enough length, or no new best for many iterations. This curve is the best-so-far line from the ten-village colony: quick gains early, then a long flat stretch.</p>`,
        v: loopFig(),
        c: C(
          "The best-so-far line has been flat for many iterations. Which end condition does that suggest? | Stop: no improvement for a long time | Stop: pheromone has all evaporated | Keep going: flat means the colony is about to crash | A long flat run is the usual 'no improvement' stopping rule. Evaporation does not vanish all trails, and nothing here predicts a crash.",
        ),
      },
    ],
    guide: [
      "Press <b>Run 1 iteration</b> several times and watch the pale blue lines thicken on good roads.",
      "Press <b>Run 10</b>, then <b>Reset</b>, and run again: a different seed gives a different story.",
      "Drag the <b>Ants</b> slider, then run again. More ants means more tours per iteration.",
      "Answer the questions after the demo.",
    ],
  };
})();
