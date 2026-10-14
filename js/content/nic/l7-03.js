/* l7-03: Lecture 7: 7.4 an ant colony on a four-town delivery round (tour kernel and map drawing shared with the workshop). */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.nicL7 = NIC.shared.nicL7 || {});

  // ---------- tour kernel (any small complete map) ----------
  // map = { names:["A",…], pos:{A:[x,y]}, dist:{"A-B":3, …} }; tau is an object keyed like dist.
  // An ant at town i picks an unvisited town j with weight tau_ij / d_ij (pheromone over distance); after a whole tour,
  // every edge keeps (1 - rho) of its pheromone and each edge of the tour gains Q / (tour length).
  const ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const dd = (m, a, b) => m.dist[ek(a, b)];
  const edgesOf = (path) => path.map((c, i) => ek(c, path[(i + 1) % path.length]));
  const tourLen = (m, path) => edgesOf(path).reduce((s, e) => s + m.dist[e], 0);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const canon = (path) => {
    const i = path.indexOf("A"),
      r = path.slice(i).concat(path.slice(0, i));
    return r[1] > r[r.length - 1] ? [r[0], ...r.slice(1).reverse()] : r;
  };
  const tourName = (p) => canon(p).join("-");
  function allTours(m) {
    const [first, ...rest] = m.names,
      out = [];
    (function go(path, left) {
      if (!left.length) {
        if (path[0] < path[path.length - 1]) out.push([first, ...path]);
        return;
      }
      left.forEach((x, i) =>
        go(
          [...path, x],
          left.filter((_, j) => j !== i),
        ),
      );
    })([], rest);
    return out;
  }
  /** unvisited towns from `cur`, each with weight tau/d and chance p */
  function options(m, tau, cur, visited) {
    const c = m.names.filter((x) => !visited.includes(x)),
      w = c.map((x) => tau[ek(cur, x)] / dd(m, cur, x)),
      s = sum(w);
    return c.map((x, i) => ({ town: x, w: w[i], p: w[i] / s }));
  }
  function buildTour(m, tau, rnd, start) {
    const path = [start];
    while (path.length < m.names.length) {
      const opts = options(m, tau, path[path.length - 1], path);
      let u = rnd(),
        k = 0;
      while (k < opts.length - 1 && u >= opts[k].p) u -= opts[k++].p;
      path.push(opts[k].town);
    }
    return path;
  }
  /** one ant: build a tour, evaporate everywhere, deposit Q / length along the tour. Changes tau; returns {path, len} */
  function sendAnt(m, tau, rnd, rho, Q, start) {
    const path = buildTour(m, tau, rnd, start || m.names[Math.floor(rnd() * m.names.length)]),
      len = tourLen(m, path);
    Object.keys(tau).forEach((e) => (tau[e] *= 1 - rho));
    edgesOf(path).forEach((e) => (tau[e] += Q / len));
    return { path, len };
  }
  const trailOn = (tau, path) => sum(edgesOf(path).map((e) => tau[e]));
  const strongest = (m, tau, tours) =>
    tours.reduce((b, t) => (trailOn(tau, t) > trailOn(tau, b) + 1e-9 ? t : b), tours[0]);
  Object.assign(sh, { ek, dd, edgesOf, tourLen, canon, tourName, allTours, options, sendAnt, trailOn, strongest, sum });

  // ---------- map drawing: edge thickness shows pheromone ----------
  const lab = (x, y, s, w = 60) =>
    `<g><rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="7" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" style="font:800 11.5px var(--sans);fill:var(--text)">${s}</text></g>`;
  /** o: {w, h, hl (Set of edge keys), at (label position per key, 0..1 from the first town), short (label distance only)} */
  function mapSVG(m, tau, o = {}) {
    const w = o.w || 460,
      h = o.h || 270,
      hl = o.hl || new Set(),
      at = o.at || {};
    const keys = Object.keys(m.dist);
    const lines = keys
      .map((k) => {
        const [a, b] = k.split("-"),
          [x1, y1] = m.pos[a],
          [x2, y2] = m.pos[b],
          on = hl.has(k);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? "var(--teal)" : "var(--blue)"}" stroke-width="${(2 + Math.min(14, tau[k] / 3)).toFixed(1)}" stroke-linecap="round" opacity="${on ? 0.9 : 0.55}"/>`;
      })
      .join("");
    const tags = keys
      .map((k) => {
        const [a, b] = k.split("-"),
          t = at[k] ?? 0.5,
          x = m.pos[a][0] + (m.pos[b][0] - m.pos[a][0]) * t,
          y = m.pos[a][1] + (m.pos[b][1] - m.pos[a][1]) * t;
        return o.short
          ? lab(x.toFixed(1), y.toFixed(1), `d ${m.dist[k]}`, 38)
          : lab(x.toFixed(1), y.toFixed(1), `d ${m.dist[k]} · τ ${tau[k].toFixed(tau[k] < 10 && tau[k] % 1 ? 1 : 0)}`);
      })
      .join("");
    const towns = m.names
      .map((n) => {
        const [x, y] = m.pos[n];
        return `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${x}" y="${y + 5}" class="fig-n">${n}</text>`;
      })
      .join("");
    const says = `Map of ${m.names.length} towns. ${keys.map((k) => `${k.replace("-", " to ")}: distance ${m.dist[k]}, pheromone ${tau[k].toFixed(0)}`).join("; ")}.`;
    return `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-height:${h}px" role="img" aria-label="${says}">${lines}${towns}${tags}</svg>`;
  }
  Object.assign(sh, { mapSVG });

  // ---------- the lesson's map ----------
  // Towns A and B along the top, C and D along the bottom. Not to scale: the numbers on the edges are the distances.
  const M4 = {
    names: ["A", "B", "C", "D"],
    pos: { A: [80, 50], B: [380, 50], C: [140, 225], D: [320, 225] },
    dist: { "A-B": 3, "A-C": 4, "A-D": 5, "B-C": 6, "B-D": 3, "C-D": 4 },
  };
  const AT4 = { "A-D": 0.3, "B-C": 0.3 };
  const T0 = { "A-B": 24, "A-C": 40, "A-D": 10, "B-C": 30, "B-D": 20, "C-D": 10 };
  const RHO = 0.5,
    Q = 72;
  const TOURS4 = allTours(M4);
  const walk = ["A", "C", "B", "D"]; // the story ant's tour; length 4 + 6 + 3 + 5 = 18, so each edge gains 72 / 18 = 4
  const pct = (o) => Object.fromEntries(o.map((x) => [x.town, Math.round(x.p * 100)]));

  /** frames of the one-ant walkthrough, built with the kernel */
  function* frames() {
    const tau = { ...T0 },
      base = { cur: null, visited: [], probs: null, hot: [], tau: { ...tau } };
    yield { ...base, cap: "Pheromone (<b>τ</b>) starts at random levels on every road. Distances stay fixed." };
    yield { ...base, cur: "A", visited: ["A"], cap: "An ant is placed on a random town. This one starts at <b>A</b>." };
    let visited = ["A"],
      hot = [];
    for (let i = 0; i < walk.length - 1; i++) {
      const cur = walk[i],
        opts = options(M4, tau, cur, visited),
        nxt = walk[i + 1],
        f = {
          cur,
          visited: [...visited],
          probs: pct(opts),
          hot: [...hot],
          tau: { ...tau },
          try: opts.map((x) => ek(cur, x.town)),
          cap:
            opts.length === 1
              ? `Only <b>${nxt}</b> is left, so the chance is 100%.`
              : `From <b>${cur}</b> each unvisited town gets a weight, τ ÷ d: ${opts.map((x) => `<b>${x.town}</b> ${x.w.toFixed(0)}`).join(", ")}. Chance = weight ÷ ${sum(opts.map((x) => x.w)).toFixed(0)}.`,
        };
      if (i === 0)
        f.ask = {
          q: "Which town is the ant most likely to pick next? Tap it.",
          pick: ".rn-node",
          a: [opts.reduce((b, x) => (x.p > b.p ? x : b)).town],
          why: "C has the highest weight: 40 ÷ 4 = 10, against 8 for B and 2 for D.",
        };
      yield f;
      visited = [...visited, nxt];
      hot = [...hot, ek(cur, nxt)];
      yield {
        cur: nxt,
        visited: visited.slice(0, -1),
        probs: null,
        hot: [...hot],
        tau: { ...tau },
        cap: `The ant picks <b>${nxt}</b>. Its <b>tour memory</b> is now {${visited.join(", ")}}, so it cannot go back to those towns.`,
      };
    }
    hot = edgesOf(walk);
    const len = tourLen(M4, walk);
    yield {
      cur: "A",
      visited: walk,
      probs: null,
      hot,
      tau: { ...tau },
      cap: `Back to <b>A</b> to close the tour <b>${walk.join("-")}-A</b>. Its length is ${walk.map((c, i) => dd(M4, c, walk[(i + 1) % 4])).join(" + ")} = <b>${len}</b>.`,
    };
    const ev = Object.fromEntries(Object.keys(tau).map((e) => [e, tau[e] * (1 - RHO)]));
    yield {
      cur: "A",
      visited: walk,
      probs: null,
      hot,
      tau: ev,
      cap: `<b>Evaporate</b> first: every road keeps ${(1 - RHO) * 100}% of its pheromone (ρ = ${RHO}).`,
    };
    const dep = { ...ev };
    hot.forEach((e) => (dep[e] += Q / len));
    yield {
      cur: "A",
      visited: walk,
      probs: null,
      hot,
      tau: dep,
      phase: "deposit",
      cap: `Then <b>deposit</b>: each road on the tour gains Q ÷ length = ${Q} ÷ ${len} = <b>${Q / len}</b>. Roads the ant skipped only lost pheromone.`,
    };
  }

  function walkthrough(box, life) {
    F.run(box, life, {
      who: "sprout",
      build(stage) {
        const nodes = Object.fromEntries(M4.names.map((n) => [n, M4.pos[n]])),
          g = F.graphScene(stage, {
            nodes,
            edges: Object.keys(M4.dist).map((k) => [...k.split("-"), T0[k]]),
            w: 460,
            h: 270,
          });
        const tb = document.createElement("div");
        tb.className = "rn-tbl";
        stage.appendChild(tb);
        return { ...g, tb };
      },
      frames,
      draw(sc, f, c) {
        M4.names.forEach((n) => {
          const h = sc.node(n),
            p = f.probs && f.probs[n];
          h.g.setAttribute(
            "class",
            `rn-node ${n === f.cur ? "s-cur" : f.visited.includes(n) ? "s-done" : p !== undefined && p !== null ? "s-tent" : ""}`,
          );
          F.rn.text(c, h.tag, p !== undefined && p !== null ? `${p}%` : "·");
        });
        Object.keys(M4.dist).forEach((k) => {
          const [a, b] = k.split("-"),
            h = sc.edge(a, b);
          h.g.classList.toggle("try", !!(f.try && f.try.includes(k)));
          F.rn.num(c, h.wt, f.tau[k]);
          h.hot.classList.toggle("amber", f.phase === "deposit" && f.hot.includes(k));
          F.rn.stroke(c, h.hot, f.hot.includes(k));
        });
        const cur = f.cur,
          rows = Object.keys(M4.dist)
            .map((k) => {
              const live = f.try && f.try.includes(k);
              return `<tr${live ? ' class="hl"' : ""}><td>${k.replace("-", "")}</td><td>${M4.dist[k]}</td><td>${f.tau[k].toFixed(f.tau[k] % 1 ? 1 : 0)}</td><td>${live && cur ? (f.tau[k] / M4.dist[k]).toFixed(f.tau[k] % M4.dist[k] ? 1 : 0) : "·"}</td></tr>`;
            })
            .join("");
        sc.tb.innerHTML = `<table class="t" style="max-width:460px"><tr><th>road</th><th>distance d</th><th>pheromone τ</th><th>weight τ ÷ d</th></tr>${rows}</table>`;
      },
    });
  }

  // ---------- demo: send ants down the same map ----------
  N.register({
    id: "l7-tsp",
    lecture: 7,
    order: 4,
    num: "7.4",
    title: "Ants on a four-town round",
    blurb: "Send ants round a four-town delivery map and watch the thick trails settle on the short tour.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "An <b>ant</b> builds a tour one town at a time, choosing the next town by <b>pheromone</b> and <b>distance</b>, and never revisiting a town in its <b>tour memory</b>. When it finishes, <b>every road</b> loses some pheromone (evaporation) and the roads of the tour gain pheromone according to how short the tour was. Thick lines on the map show strong trails.",
        ),
      );
      let tau = { ...T0 },
        rho = 20,
        n = 0,
        last = null;
      const counts = Object.fromEntries(TOURS4.map((t) => [tourName(t), 0]));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Send ants round the map</h2></div><div class="controls" id="c"></div><div class="controls"><button class="btn primary" id="one">Send 1 ant</button><button class="btn" id="ten">Send 10 ants</button><button class="btn ghost" id="rs">Reset trails</button></div><div id="svg"></div><div id="tab"></div><div id="note"></div></div>`,
      );
      root.appendChild(card);
      const sR = N.slider("Evaporation ρ", 10, 90, 10, rho, (v) => v + "%");
      sR.onInput((v) => (rho = v));
      qs("#c", card).append(sR);
      const send = (k) => {
        for (let i = 0; i < k; i++) {
          last = sendAnt(M4, tau, Math.random, rho / 100, Q);
          counts[tourName(last.path)]++;
          n++;
        }
        draw();
      };
      function draw() {
        const top = strongest(M4, tau, TOURS4);
        qs("#svg", card).innerHTML = mapSVG(M4, tau, { hl: new Set(n ? edgesOf(top) : []), at: AT4 });
        qs("#tab", card).innerHTML =
          `<table class="t" style="max-width:520px"><tr><th>tour</th><th>length</th><th>trail on its roads</th><th>ants that built it</th></tr>${TOURS4.map(
            (t) =>
              `<tr${tourName(t) === tourName(top) && n ? ' class="hl"' : ""}><td class="mono">${tourName(t)}</td><td>${tourLen(M4, t)}</td><td>${trailOn(tau, t).toFixed(0)}</td><td>${counts[tourName(t)]}</td></tr>`,
          ).join("")}</table>`;
        qs("#note", card).innerHTML = n
          ? `<div class="callout blue"><b>${n}</b> ant${n === 1 ? "" : "s"} sent. The last one built <b>${tourName(last.path)}</b> (length ${last.len}). The tour with the strongest trail, in green, is <b>${tourName(top)}</b>.</div>`
          : `<div class="callout blue">No ants yet. The pheromone is random, and a tour of length 18 currently has the strongest trail.</div>`;
      }
      qs("#one", card).onclick = () => send(1);
      qs("#ten", card).onclick = () => send(10);
      qs("#rs", card).onclick = () => {
        tau = { ...T0 };
        n = 0;
        last = null;
        Object.keys(counts).forEach((k) => (counts[k] = 0));
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "l7-tsp-1",
          q: "Press <b>Send 10 ants</b> three times (30 ants in all, evaporation 20%). Which tour is most likely to have the strongest trail?",
          opts: ["The length-14 tour", "A length-18 tour", "Each tour about equally"],
          a: 0,
          why: "The 14-tour uses short roads, which are favoured by the 1 ÷ d weight, and its deposit Q ÷ 14 is bigger than Q ÷ 18. Evaporation slowly wipes out the random start.",
        }),
      );
      root.appendChild(
        predict({
          id: "l7-tsp-2",
          q: "Press <b>Reset trails</b>, then <b>Send 1 ant</b>. Look at the thin lines. What happened to the pheromone on the roads that ant did <b>not</b> use?",
          opts: ["It fell, because of evaporation", "It stayed the same", "It rose a little, to keep the colony fair"],
          a: 0,
          why: "Evaporation applies to every road after each tour. Only the roads on the ant's tour then get a deposit to make up for it.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "An ant chooses the next town using <b>pheromone</b> and <b>distance</b>: strong trails and short hops win more often.",
            "A <b>tour memory</b> stops an ant revisiting a town, so every finished tour is valid.",
            "After a tour: <b>evaporate</b> every road, then <b>deposit</b> on the tour's roads. A shorter tour deposits more per road.",
            "Over many ants the trails concentrate on short tours, but a first ant does not need to be good.",
          ],
          "Short tours get more pheromone, so later ants follow them.",
        ),
      );
    },
  });

  const rowsFor = () => {
    const ev = Object.keys(T0).map((k) => [k, T0[k], T0[k] * (1 - RHO)]);
    const len = tourLen(M4, walk),
      used = edgesOf(walk);
    return ev.map(([k, a, b]) => [k.replace("-", ""), a, b, b + (used.includes(k) ? Q / len : 0)]);
  };
  const dep = (() => {
    const len = tourLen(M4, walk),
      t = {};
    Object.keys(T0).forEach((k) => (t[k] = T0[k] * (1 - RHO) + (edgesOf(walk).includes(k) ? Q / len : 0)));
    return t;
  })();

  L["l7-tsp"] = {
    sum: "In ACO, ants build tours using pheromone and distance. A finished tour is scored, and pheromone is laid on its roads by quality.",
    steps: [
      {
        t: "Ants walk a graph",
        b: `<p>In <b>ant colony optimisation</b> the ants are <b>agents</b> that move along the edges between nodes of a graph. They choose where to go using <b>pheromone strength</b> (and maybe other things). An ant's path is one <b>candidate solution</b>. When it finishes, pheromone is laid on that path according to the <b>quality</b> of the solution, which changes what other ants do. That is stigmergy.</p>`,
        v: F.flow(["Ant builds a tour", "Tour is scored", "Pheromone laid by quality", "Later ants follow"], {
          loop: true,
        }),
        c: {
          q: "In ACO, what does one ant's finished path stand for?",
          o: ["A candidate solution", "The best solution so far", "The whole pheromone trail"],
          a: 0,
          why: "Each ant builds one full solution. The best ones are reinforced.",
        },
      },
      {
        t: "A four-town delivery round",
        b: `<p>A van must visit four towns once each and return to the start: a tiny <b>travelling salesman problem</b>. The numbers on the roads are distances (the picture is not to scale). Every road also holds some <b>pheromone</b>, set at random levels to begin with.</p>`,
        v: F.graph({
          nodes: { A: [80, 40], B: [380, 40], C: [140, 175], D: [320, 175] },
          edges: [
            ["A", "B", 3],
            ["A", "C", 4],
            ["A", "D", 5],
            ["B", "C", 6],
            ["B", "D", 3],
            ["C", "D", 4],
          ],
          w: 460,
          h: 210,
        }),
        c: {
          q: "Ignoring the start town and the direction, how many different round trips visit all four towns?",
          o: ["Three", "Six", "Twenty-four"],
          a: 0,
          hint: "Fix the start at A. Order the other three towns (six ways), then remember each trip can be driven in two directions.",
          why: "Six orders of B, C and D, but each trip and its reverse are the same loop, so only 3 are different.",
        },
      },
      {
        t: "Pick the next town",
        b: `<p>An ant at A weighs each unvisited town by the pheromone on the road and the <b>next-hop distance</b>. More pheromone and a shorter hop make a town more attractive. This lesson uses weight = <b>τ ÷ d</b> (lecture 8 gives the full rule). The chance of a town is its weight ÷ the total.</p>`,
        v: F.bars(
          options(M4, T0, "A", ["A"]).map((x, i) => [
            `${x.town}: τ ${T0[ek("A", x.town)]} ÷ d ${dd(M4, "A", x.town)}`,
            Math.round(x.p * 100),
            ["blue", "teal", "amber"][i],
          ]),
          { max: 100, unit: "%" },
        ),
        c: {
          q: "Which road makes the next town the <b>most</b> attractive?",
          o: ["High pheromone and a short hop", "High pheromone and a long hop", "Low pheromone and a short hop"],
          a: 0,
          why: "Weight is pheromone divided by distance, so it grows with pheromone and shrinks with distance.",
        },
      },
      {
        t: "Tour memory",
        b: `<p>Each ant keeps a <b>tour memory</b> of the towns it has visited (the lecture's tabu list). It cannot choose them again. The ant at C, having visited A then C, can only choose from the rest. When one town is left there is no choice, and then the ant returns to its start.</p>`,
        v: F.cells(
          [
            { v: "A", c: "teal", sub: "visited" },
            { v: "C", c: "teal", sub: "visited" },
            { v: "B", sub: "free" },
            { v: "D", sub: "free" },
          ],
          { label: "Tour memory" },
        ),
        c: {
          q: "The ant has visited A, then C. Which towns can it pick next?",
          o: ["B or D", "Only B", "A, B or D"],
          a: 0,
          why: "A and C are in the tour memory, so they are ruled out. B and D are both still free.",
        },
      },
      {
        t: "Watch one ant",
        b: `<p>Press play or step with the arrows. Answer the question when it appears. The table shows distance, pheromone and weight for the roads the ant is weighing.</p>`,
        v: (box, life) => walkthrough(box, life),
        c: {
          q: "The ant at A has weights B = 8, C = 10, D = 2. What is the chance it picks C?",
          o: ["50%", "10%", "80%"],
          a: 0,
          hint: "The weights add up to 20. C holds 10 of them.",
          why: "10 ÷ 20 = 50%. B gets 40% and D gets 10%.",
        },
      },
      {
        t: "Evaporate, then deposit",
        b: `<p>When the tour is done, <b>every</b> road loses part of its pheromone: here half is kept. Then each road <b>on the tour</b> gains <b>Q ÷ tour length</b>, with Q = 72 and length 18 that is 4 per road. A shorter tour would deposit more.</p>`,
        v:
          `<table class="t" style="max-width:480px"><tr><th>road</th><th>start</th><th>after evaporation</th><th>after deposit</th></tr>` +
          rowsFor()
            .map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`)
            .join("") +
          `</table>`,
        c: {
          q: "Road AB started at 24 and was not on the tour. Half is kept after evaporation. What does it hold afterwards?",
          o: ["12", "24", "28"],
          a: 0,
          why: "24 × 0.5 = 12. Roads off the tour only lose pheromone.",
        },
      },
      {
        t: "The next ant",
        b: `<p>The trail now leans towards the tour the first ant found (thick lines). The next ant starts at another random town. A better tour deposits more per road, so over many ants the thick lines move to the short tours.</p>`,
        v: mapSVG(M4, dep, { hl: new Set(edgesOf(walk)), at: AT4 }),
        c: {
          q: "Two ants use the same Q. One finds a tour of length 14 and the other a tour of length 18. Which deposits more on each road?",
          o: ["The length-14 ant", "The length-18 ant", "They deposit the same"],
          a: 0,
          hint: "Compare 72 ÷ 14 with 72 ÷ 18.",
          why: "Q ÷ length is larger for the shorter tour (about 5.1 against 4), so short tours are reinforced harder.",
        },
      },
    ],
    guide: [
      "Press <b>Send 1 ant</b> and watch the numbers change in the table.",
      "Press <b>Send 10 ants</b> a few times and drag <b>Evaporation ρ</b>.",
      "Press <b>Reset trails</b> to start again.",
      "Answer the questions after the demo.",
    ],
  };
})();
