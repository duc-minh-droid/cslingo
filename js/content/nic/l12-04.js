(function () {
  const partScope = (NIC.shared.l12 = NIC.shared.l12 || {});
  const { G } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd, shuffle } = N;
  N.register({
    id: "l2-mst",
    lecture: 2,
    order: 4,
    num: "2.4",
    title: "An easy problem (MST) and its hard cousin",
    blurb:
      "Build spanning trees by hand, watch Prim's algorithm find the optimum, then add a small constraint and see greedy fail.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let sel = new Set(),
        prim = null,
        maxDeg = 0;
      const card = el(`<div class="card"><div class="controls" id="b1"></div>
        <div class="grid side"><svg class="viz" id="g" viewBox="0 0 540 330"></svg><div>
          <div class="stat-row"><div class="stat amber"><small>Cost</small><b id="c"></b></div><div class="stat"><small>Edges</small><b id="e"></b></div></div>
          <div id="st"></div><div id="primLog" class="dim" style="margin-top:10px"></div></div></div>
        <div class="controls"><button class="btn" id="t36">Slide tree #1</button><button class="btn" id="t20">Slide tree #2</button><button class="btn primary" id="pr">Run Prim step by step</button><button class="btn ghost" id="clr">Clear</button></div>
        <p class="faint" style="font-size:12.5px">Click edges to add or remove them. The edge weights are the slide's. The layout is reconstructed (the PDF text lost it) so that the slide's trees cost 36 and 20 and the MST costs 18, as on the slides.</p></div>`);
      root.appendChild(card);
      const cons = el(
        `<label class="field"><input type="checkbox"> Constraint: no node may have degree above 2</label>`,
      );
      qs("input", cons).onchange = (e) => {
        maxDeg = e.target.checked ? 2 : 0;
        draw();
      };
      qs("#b1", card).appendChild(cons);
      const key = (e) => e[0] + e[1];
      const deg = (set) => {
        const d = {};
        Object.keys(G.nodes).forEach((n) => (d[n] = 0));
        G.edges.forEach((e) => {
          if (set.has(key(e))) {
            d[e[0]]++;
            d[e[1]]++;
          }
        });
        return d;
      };
      const isTree = (set) => {
        if (set.size !== 4) return false;
        const p = {};
        const f = (x) => (p[x] === undefined || p[x] === x ? (p[x] = x) : (p[x] = f(p[x])));
        for (const e of G.edges)
          if (set.has(key(e))) {
            const a = f(e[0]),
              b = f(e[1]);
            if (a === b) return false;
            p[a] = b;
          }
        return true;
      };
      const cost = (set) => G.edges.reduce((a, e) => a + (set.has(key(e)) ? e[2] : 0), 0);
      // brute force optima
      const combos = [];
      const rec = (i, cur) => {
        if (cur.length === 4) {
          combos.push(new Set(cur));
          return;
        }
        for (let k = i; k < 10; k++) rec(k + 1, [...cur, key(G.edges[k])]);
      };
      rec(0, []);
      const trees = combos.filter(isTree);
      const opt = (md) => Math.min(...trees.filter((t) => !md || Math.max(...Object.values(deg(t))) <= md).map(cost));
      function draw(hl = []) {
        const d = deg(sel);
        qs("#g", card).innerHTML =
          G.edges
            .map((e) => {
              const [a, b, w] = e,
                on = sel.has(key(e)),
                h = hl.includes(key(e));
              const [x1, y1] = G.nodes[a],
                [x2, y2] = G.nodes[b];
              return `<g data-e="${key(e)}" style="cursor:pointer"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="16"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? "var(--teal)" : h ? "var(--amber)" : "var(--line-2)"}" stroke-width="${on ? 4 : h ? 3 : 1.5}" ${h && !on ? 'stroke-dasharray="6 4"' : ""}/>
            <text x="${(x1 + x2) / 2 + 7}" y="${(y1 + y2) / 2 - 5}" fill="${on ? "var(--text)" : "var(--text-dim)"}" font-size="13" font-weight="${on ? 700 : 400}" font-family="var(--mono)">${w}</text></g>`;
            })
            .join("") +
          Object.entries(G.nodes)
            .map(
              ([n, [x, y]]) =>
                `<circle cx="${x}" cy="${y}" r="18" fill="var(--panel-2)" stroke="${maxDeg && d[n] > maxDeg ? "var(--rose)" : "var(--teal)"}" stroke-width="2.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="var(--text)" font-weight="700" font-size="15">${n}</text>`,
            )
            .join("");
        qsa("[data-e]", card).forEach(
          (g) =>
            (g.onclick = () => {
              prim = null;
              qs("#primLog", card).innerHTML = "";
              const k = g.dataset.e;
              sel.has(k) ? sel.delete(k) : sel.add(k);
              draw();
            }),
        );
        qs("#c", card).textContent = cost(sel);
        qs("#e", card).textContent = `${sel.size} / 4`;
        const tree = isTree(sel),
          viol = maxDeg && Math.max(...Object.values(d)) > maxDeg,
          best = opt(maxDeg);
        qs("#st", card).innerHTML = tree
          ? viol
            ? `<div class="callout rose">A spanning tree, but it <b>breaks the degree constraint</b> (red node), so it's not a feasible solution.</div>`
            : cost(sel) === best
              ? `<div class="callout teal"><b>Optimal!</b> ${cost(sel)} is the cheapest ${maxDeg ? "tree with max degree 2" : "spanning tree"} for this graph.</div>`
              : `<div class="callout">Valid spanning tree. The cheapest possible is <b>${best}</b>.</div>`
          : `<p class="dim">A <b>spanning tree</b> connects all 5 nodes with no cycles, which always takes exactly <b>n − 1 = 4</b> edges.${sel.size > 0 && !tree && sel.size >= 4 ? ' <span style="color:var(--rose)">Yours has a cycle or leaves a node out.</span>' : ""}</p>`;
      }
      qs("#t36", card).onclick = () => {
        sel = new Set(["AB", "DE", "BC", "BE"]);
        draw();
      };
      qs("#t20", card).onclick = () => {
        sel = new Set(["AC", "AD", "BC", "BE"]);
        draw();
      };
      qs("#clr", card).onclick = () => {
        sel = new Set();
        prim = null;
        qs("#primLog", card).innerHTML = "";
        draw();
      };
      qs("#pr", card).onclick = () => {
        if (!prim || prim.done) {
          prim = { in: new Set(["A"]), log: [], done: false };
          sel = new Set();
        }
        const cands = G.edges.filter(
          (e) =>
            prim.in.has(e[0]) !== prim.in.has(e[1]) &&
            (!maxDeg || (deg(sel)[e[0]] < maxDeg && deg(sel)[e[1]] < maxDeg)),
        );
        if (!cands.length) {
          prim.done = true;
          qs("#primLog", card).innerHTML +=
            `<div style="color:var(--rose)">No feasible edge left: greedy is stuck.</div>`;
          return;
        }
        const pick = cands.reduce((b, e) => (e[2] < b[2] ? e : b));
        sel.add(key(pick));
        prim.in.add(pick[0]);
        prim.in.add(pick[1]);
        prim.log.push(
          `Step ${prim.log.length + 1}: candidates ${cands.map((e) => `${e[0]}${e[1]}(${e[2]})`).join(", ")} → cheapest <b>${pick[0]}${pick[1]} (${pick[2]})</b>`,
        );
        if (sel.size === 4) prim.done = true;
        qs("#primLog", card).innerHTML =
          `<b>Prim${maxDeg ? " (greedy, skipping edges that break the constraint)" : ""}</b>, starting from A:<br>` +
          prim.log.join("<br>") +
          (prim.done && sel.size === 4
            ? `<br><b style="color:${cost(sel) === opt(maxDeg) ? "var(--teal)" : "var(--rose)"}">Total ${cost(sel)}${cost(sel) === opt(maxDeg) ? ": optimal." : `, but the true optimum is ${opt(maxDeg)}. Greedy is no longer guaranteed!`}</b>`
            : "");
        draw(cands.map(key));
      };
      draw();
      root.appendChild(
        predict({
          id: "l2-mst-1",
          q: "Turn on the degree ≤ 2 constraint and run Prim. What happens, and what does it show?",
          opts: [
            "Prim still finds the optimum, because greedy always works on trees",
            "Greedy gets 20 while the best feasible tree costs 19",
            "No tree satisfies the constraint",
          ],
          a: 1,
          why: "Unconstrained, Prim is guaranteed optimal in polynomial time: an <b>easy</b> problem. With the degree constraint, greedy picks A–C, C–D, B–D, B–E = 20, but D–A–C–E–B costs 19. <b>Degree-constrained MST is hard</b>, and real-world MST problems almost always have constraints like this.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>MST</b>: the cheapest tree connecting all nodes (n − 1 edges, no cycles). It's <b>easy</b>: Prim's algorithm is polynomial and guaranteed optimal.",
            "Prim: start with an empty tree and repeatedly add the cheapest edge that feasibly extends it, until n − 1 edges.",
            "Constrained versions (max degree, bandwidth requirements) are almost always <b>hard</b>, and real-world problems are the constrained kind.",
          ],
          "Plain MST is easy thanks to Prim's greedy algorithm, but add a real-world constraint and it becomes hard.",
        ),
      );
    },
  });

  /* ============ 2.5 Exact vs approximate ============ */
  N.register({
    id: "l2-approx",
    lecture: 2,
    order: 5,
    num: "2.5",
    title: "Exact vs approximate algorithms",
    blurb:
      "16²¹ water-network designs, then a live race between a fast simple heuristic and a slower EA that wins in the end.",
    render(root, life) {
      root.appendChild(header(this, ""));
      root.appendChild(
        el(`<div class="card"><div class="card-head"><h2>New York Tunnels (a highly simplified water network)</h2></div>
        <div class="stat-row"><div class="stat"><small>Pipes</small><b>21</b></div><div class="stat"><small>Diameters per pipe</small><b>16</b></div><div class="stat rose"><small>Possible designs = 16²¹</small><b>19,342,813,113,834,066,795,298,816</b></div></div>
        <p class="dim">Checking a billion designs per second would take about <b>6.1 × 10<sup>8</sup> years</b>. No exact method is practical, so we need <b>approximate algorithms</b>: good answers in reasonable time, with <b>no guarantee</b> of optimality.</p></div>`),
      );
      const n = 25;
      let cities,
        nnTour,
        nnLen,
        pop,
        fits,
        evals,
        hist,
        running = null;
      const d = (a, b) => Math.hypot(cities[a][0] - cities[b][0], cities[a][1] - cities[b][1]);
      const len = (t) => t.reduce((s, c, i) => s + d(c, t[(i + 1) % n]), 0);
      function init() {
        cities = Array.from({ length: n }, () => [0.05 + rnd() * 0.9, 0.08 + rnd() * 0.84]);
        const t = [0],
          left = new Set([...Array(n).keys()].slice(1));
        while (left.size) {
          const c = t[t.length - 1];
          let b = null;
          for (const x of left) if (b === null || d(c, x) < d(c, b)) b = x;
          t.push(b);
          left.delete(b);
        }
        nnTour = t;
        nnLen = len(t);
        pop = Array.from({ length: 30 }, () => shuffle([...Array(n).keys()]));
        fits = pop.map(len);
        evals = 30;
        hist = { ea: [Math.min(...fits)], x: [evals] };
        draw();
      }
      function iter() {
        let b = randint(0, 29);
        for (let k = 1; k < 3; k++) {
          const c = randint(0, 29);
          if (fits[c] < fits[b]) b = c;
        }
        const m = pop[b].slice();
        let i = randint(0, n - 1),
          j = randint(0, n - 1);
        if (i > j) [i, j] = [j, i];
        const seg = m.slice(i, j + 1).reverse();
        m.splice(i, seg.length, ...seg);
        const fm = len(m);
        evals++;
        let w = 0;
        for (let k = 1; k < 30; k++) if (fits[k] > fits[w]) w = k;
        if (fm <= fits[w]) {
          pop[w] = m;
          fits[w] = fm;
        }
      }
      const card =
        el(`<div class="card"><div class="card-head"><h2>Race: simple fast method vs sophisticated slow method</h2><span class="faint">25-city TSP</span></div>
        <div class="grid two"><div><div class="card-head"><span class="tag amber">Nearest neighbour</span><span class="faint">greedy, "always go to the closest unvisited city"</span></div><canvas class="viz" id="nn"></canvas></div>
        <div><div class="card-head"><span class="tag teal">Evolutionary algorithm</span><span class="faint">steady-state, tournament, segment-reversal mutation</span></div><canvas class="viz" id="ea"></canvas></div></div>
        <div class="controls"><button class="btn primary" id="go">Run EA</button><button class="btn ghost" id="rs">New cities</button><span class="mono dim" id="info"></span></div>
        <h3>Solution quality over time (shorter tour = better)</h3><canvas class="viz" id="ch"></canvas>
        <div class="legend"><span style="--c:var(--amber)">nearest neighbour (done instantly)</span><span style="--c:var(--teal)">EA best so far</span></div></div>`);
      root.appendChild(card);
      function drawTour(cv, t, color) {
        const { ctx, w, h } = N.setupCanvas(cv, 220);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        t.forEach((c, i) => {
          const [x, y] = cities[c];
          i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = N.colors().text;
        cities.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x * w, y * h, 3.5, 0, 7);
          ctx.fill();
        });
      }
      function draw() {
        const C = N.colors();
        drawTour(qs("#nn", card), nnTour, C.amber);
        const bi = fits.indexOf(Math.min(...fits));
        drawTour(qs("#ea", card), pop[bi], C.teal);
        N.lineChart(qs("#ch", card), {
          series: [
            { data: hist.ea.map(() => nnLen), color: C.amber, dash: [5, 4] },
            { data: hist.ea, color: C.teal },
          ],
          height: 200,
          xLabel: "time (evaluations)",
        });
        const best = fits[bi];
        qs("#info", card).innerHTML =
          `evals ${evals.toLocaleString()} · NN ${nnLen.toFixed(3)} · EA ${best.toFixed(3)} ${best < nnLen ? `<b style="color:var(--teal)">(EA ahead by ${((1 - best / nnLen) * 100).toFixed(1)}%)</b>` : `<span style="color:var(--amber)">(NN ahead)</span>`}`;
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run EA";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          for (let k = 0; k < 60; k++) iter();
          hist.ea.push(Math.min(...fits));
          draw();
          if (evals > 25000) stop();
        }, 30);
      };
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      life.onResize(draw);
      init();
      root.appendChild(
        predict({
          id: "l2-ap-1",
          q: "You have <b>1 second</b> to produce a delivery route. Which method, and why?",
          opts: [
            "The EA, because it finds the better answer eventually",
            "Nearest neighbour: it gets a good route almost instantly",
            "Exhaustive search, because it's guaranteed optimal",
          ],
          a: 1,
          why: "That's the lecture's quality-vs-time curve: a <b>simple method gets good solutions fast</b>, a <b>sophisticated method is slow but better eventually</b>. The right choice depends on your time budget. Exhaustive search: 24!/2 ≈ 3 × 10<sup>23</sup> tours. No.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Exact</b> algorithm: guaranteed to return an optimal solution. Only practical for easy problems or tiny instances.",
            "<b>Approximate</b> algorithms: reasonable time, often near-optimal (sometimes optimal), but <b>no guarantee</b>.",
            "EAs are among the most successful approximate algorithms, but slow: simple heuristics are fast and good, and EAs overtake them given time.",
          ],
          "Hard problems need approximate algorithms: fast, usually good, never guaranteed optimal.",
        ),
      );
    },
  });
})();
