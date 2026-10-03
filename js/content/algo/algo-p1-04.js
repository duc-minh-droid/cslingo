(function () {
  const partScope = (NIC.shared.algoP1 = NIC.shared.algoP1 || {});
  const { PRG } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = NIC.LESSONS;

  N.register({
    id: "a1-pagerank",
    subject: "algo",
    lecture: 1,
    order: 4,
    num: "1.4",
    title: "PageRank mechanics",
    blurb:
      "The real update rule, running live: repair the dangling page, add the teleport floor, and iterate until it settles.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const names = PRG.names,
        M = names.length;
      let d = 0.85,
        repair = true,
        p = names.map(() => 1 / M),
        iter = 0,
        deltas = [],
        running = null;
      const card = el(`<div class="card">
        <div class="card-head"><h2>Power iteration, live</h2><span class="faint">p ← G·p until it stops moving</span></div>
        <div class="grid side">
          <div>
            <div id="svgWrap"></div>
            <div class="controls" id="ctl">
              <button class="btn primary" id="it">Iterate once</button>
              <button class="btn" id="go">Run</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
            <div class="controls" id="dRow"></div>
            <div class="controls" id="optRow"></div>
            <div id="msg" class="callout teal" style="margin-top:4px"></div>
          </div>
          <div>
            <h3 style="margin-top:0">Rank vector p</h3>
            <div id="pbars"></div>
            <div class="stat-row">
              <div class="stat"><small>Iteration</small><b id="si">0</b></div>
              <div class="stat ${repair ? "teal" : "rose"}" id="massStat"><small>Total mass</small><b id="sm">1.000</b></div>
              <div class="stat violet"><small>Max change</small><b id="sd">—</b></div>
            </div>
            <canvas class="viz" id="cv" style="margin-top:6px"></canvas>
            <p class="faint" style="font-size:12.5px;margin:6px 0 0">max |Δp| per iteration — convergence means this line hits the floor.</p>
          </div>
        </div></div>`);
      root.appendChild(card);
      const dSlider = N.slider("Damping d", 0.5, 0.99, 0.01, d, (v) => `d = ${v.toFixed(2)}`);
      dSlider.onInput((v) => {
        d = v;
      });
      qs("#dRow", card).appendChild(dSlider);
      const rep = el(
        `<label class="field" style="display:flex;align-items:center;gap:8px"><input type="checkbox" checked> <span>Repair dangling pages (T pours to everyone)</span></label>`,
      );
      qs("input", rep).onchange = (e) => {
        repair = e.target.checked;
        qs("#massStat", card).className = "stat " + (repair ? "teal" : "rose");
      };
      const startSeg = N.seg(
        [
          ["u", "Uniform start"],
          ["s", "Session p₀ (0.4,0.1,0.2,0.2,0.1)"],
        ],
        "u",
        (v) => {
          reset(v);
        },
      );
      qs("#optRow", card).append(rep, startSeg);
      function svgHTML() {
        const P = PRG.pos,
          parts = [
            `<defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="var(--text-dim)" stroke-width="1.4"/></marker></defs>`,
          ];
        for (const u of names)
          for (const v of PRG.out[u]) {
            const [x1, y1] = P[u],
              [x2, y2] = P[v];
            const dx = x2 - x1,
              dy = y2 - y1,
              len = Math.hypot(dx, dy);
            const recip = PRG.out[v].includes(u),
              off = recip ? 20 : 7;
            const cx = (x1 + x2) / 2 - (dy / len) * off,
              cy = (y1 + y2) / 2 + (dx / len) * off;
            parts.push(
              `<path d="M${x1},${y1} Q${cx},${cy} ${x2 + (cx - x2) * 0.18},${y2 + (cy - y2) * 0.18}" fill="none" stroke="var(--line-2)" stroke-width="1.6" marker-end="url(#ah2)"/>`,
            );
          }
        for (const k of names) {
          const [x, y] = P[k];
          parts.push(
            `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel-2)" stroke="${PRG.out[k].length ? "var(--teal)" : "var(--rose)"}" stroke-width="2.5"/><text x="${x}" y="${y + 5}" fill="var(--text)" font-size="14" font-weight="700" text-anchor="middle">${k}</text>${PRG.out[k].length ? "" : `<text x="${x}" y="${y + 32}" fill="var(--rose)" font-size="10" text-anchor="middle" font-family="var(--mono)">dangling</text>`}`,
          );
        }
        return `<svg class="viz" viewBox="0 0 540 220" style="max-height:220px">${parts.join("")}</svg>`;
      }
      function step() {
        const np = names.map(() => 0);
        names.forEach((s, j) => {
          const links = PRG.out[s];
          if (!links.length) {
            if (repair) names.forEach((_, i2) => (np[i2] += p[j] / M));
          } else links.forEach((t) => (np[names.indexOf(t)] += p[j] / links.length));
        });
        const np2 = np.map((v) => d * v + (1 - d) / M);
        const delta = Math.max(...np2.map((v, i2) => Math.abs(v - p[i2])));
        p = np2;
        iter++;
        deltas.push(delta);
        draw();
      }
      function draw() {
        const mx = Math.max(...p, 1e-9);
        qs("#pbars", card).innerHTML = names
          .map((k, i2) => {
            const isMax = p[i2] === mx && mx > 1 / M + 0.001;
            return `<div style="display:grid;grid-template-columns:30px 1fr 62px;gap:10px;align-items:center;margin-bottom:7px">
            <b class="mono">${k}</b><span style="height:16px;border-radius:8px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${(p[i2] * 100).toFixed(1)}%;background:${isMax ? "var(--amber)" : "var(--teal)"};transition:width .25s"></span></span>
            <span class="mono dim" style="font-size:12px">${p[i2].toFixed(3)}</span></div>`;
          })
          .join("");
        qs("#si", card).textContent = iter;
        const mass = p.reduce((a, b) => a + b, 0);
        qs("#sm", card).textContent = mass.toFixed(3);
        qs("#sm", card).style.color = Math.abs(mass - 1) > 0.005 ? "var(--rose)" : "";
        qs("#sd", card).textContent = deltas.length ? deltas[deltas.length - 1].toExponential(1) : "—";
        N.lineChart(qs("#cv", card), {
          series: [{ data: deltas, color: N.colors().violet, dots: true }],
          height: 140,
          xLabel: "iteration",
          yMin: 0,
        });
        const m = qs("#msg", card);
        if (!repair && mass < 0.995) {
          m.className = "callout rose";
          m.innerHTML = `<b>Leaking!</b> T's column is all zeros, so every iteration loses d×rank(T) of the mass. Total is ${mass.toFixed(3)} and dropping — a probability vector can't survive a leaking column.`;
        } else if (deltas.length && deltas[deltas.length - 1] < 1e-6) {
          m.className = "callout teal";
          m.innerHTML = `<b>Converged.</b> The vector stopped moving — this is the PageRank ranking for this web: R first, P ≈ S next, then Q, then T.`;
        } else {
          m.className = "callout teal";
          m.innerHTML = `Each step: pour rank along links${repair ? " (T pours to everyone)" : " (T pours nowhere — watch the mass)"}, then add the ${(1 - d).toFixed(2)} teleport floor.`;
        }
      }
      function reset(start) {
        p = (start === "s" ? [0.4, 0.1, 0.2, 0.2, 0.1] : names.map(() => 1 / M)).slice();
        iter = 0;
        deltas = [];
        qs("#svgWrap", card).innerHTML = svgHTML();
        draw();
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#it", card).onclick = () => {
        stop();
        step();
      };
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(step, 260);
      };
      qs("#rs", card).onclick = () => {
        stop();
        reset();
      };
      reset();
      root.appendChild(
        predict({
          id: "a1-pagerank-1",
          q: "Turn <b>Repair dangling pages</b> OFF and run the iteration. What happens to the total rank mass?",
          opts: ["Stays at 1.0 — mass is always conserved", "Shrinks every iteration", "Grows past 1.0"],
          a: 1,
          why: "With no repair, T collects rank (teleports and C's endorsement still arrive) but pours d·rank(T) into the void each step. The sum drifts below 1 — the invariant 'mass = 1' is broken, and no fixed point can be a proper probability vector.",
        }),
      );
      root.appendChild(
        el(
          `<div class="callout amber"><b>Checks worth remembering.</b> ① Every column of the matrix sums to 1. ② Every iteration's vector sums to 1. ③ All entries stay ≥ 0. ④ Two different starts agree. Break any one and you have a bug — the session's "matrix clinic" boss is exactly this list.</div>`,
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Pipeline: <b>links → H → repair dangling → A → +teleport → G → iterate</b>.",
            "H is <b>column</b>-stochastic: sources are columns, each summing to 1.",
            "Teleport makes every G entry &gt; 0 → no traps, guaranteed convergence, every page gets a floor.",
            "Per-iteration cost: dense O(N²), sparse O(N+L). At web scale, only sparse survives.",
          ],
          "Repair the leak, add a teleport floor so nothing can trap the flow, then multiply until the numbers stop moving.",
        ),
      );
    },
  });

  /* ================================================================
     Boss — Phase 1
     ================================================================ */
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => {
    if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v;
  };
  addV(
    "a1-anatomy",
    1,
    FG.frames([
      { t: "start: best = first item (3)", v: FG.cells([{ v: 3, c: "teal", sub: "best" }, 8, 2, 9, 5]) },
      { t: "8 > 3 → best = 8", v: FG.cells([3, { v: 8, c: "teal", sub: "best" }, 2, 9, 5]) },
      { t: "2 isn't bigger → no change", v: FG.cells([3, { v: 8, c: "teal" }, { v: 2, c: "dim" }, 9, 5]) },
      { t: "9 > 8 → best = 9 (5 won't beat it)", v: FG.cells([3, 8, 2, { v: 9, c: "teal", sub: "best" }, 5]) },
    ]),
  );
  addV(
    "a1-anatomy",
    3,
    FG.compare(
      {
        title: "Empty list []",
        c: "rose",
        body: "<code>best ← first item</code> has nothing to read. Decide first: return <b>none</b>, or raise an error.",
      },
      {
        title: "Other traps",
        c: "amber",
        body: "all equal [4,4,4] · all negative [−3,−9] · one item [7]. The invariant must hold for each.",
      },
    ),
  );
  addV(
    "a1-bigo",
    1,
    FG.plot(
      [
        { f: (n) => n, c: "teal", label: "n" },
        { f: (n) => (n * (n - 1)) / 2, c: "amber", label: "n(n−1)/2" },
        { f: (n) => n * n, c: "rose", dash: "5 4", label: "n²" },
      ],
      { x: [1, 30], xl: "input size n", yl: "work() calls", h: 200 },
    ) +
      `<div class="fig-cap">The growing inner loop (amber) is always half of n², so it has the same curved shape: quadratic.</div>`,
  );
  addV(
    "a1-bigo",
    2,
    FG.cells([{ v: 16, c: "violet" }, "→", 8, "→", 4, "→", 2, "→", { v: 1, c: "teal" }]) +
      `<div class="fig-cap">16 → 1 takes 4 halvings = log₂16. A billion takes only about 30.</div>`,
  );
  addV(
    "a1-surfer",
    0,
    FG.graph({
      nodes: {
        A: { x: 80, y: 110, sub: "rank 30" },
        B: { x: 290, y: 45, sub: "+15" },
        C: { x: 290, y: 175, sub: "+15" },
      },
      edges: [
        ["A", "B", "½"],
        ["A", "C", "½"],
      ],
      directed: true,
      hl: { A: "teal", "A-B": "teal", "A-C": "teal" },
      w: 380,
      h: 215,
    }) + `<div class="fig-cap">A has two outgoing links, so each one carries half of A's rank.</div>`,
  );
  addV(
    "a1-surfer",
    2,
    FG.graph({
      nodes: { D: { x: 200, y: 150, sub: "dangling · keeps 6.25" }, A: [60, 50], B: [340, 50], C: [200, 30] },
      edges: [
        ["D", "A", "6.25", "amber"],
        ["D", "B", "6.25", "amber"],
        ["D", "C", "6.25", "amber"],
      ],
      directed: true,
      hl: { D: "amber" },
      w: 400,
      h: 210,
    }) +
      `<div class="fig-cap">D has no links, so its 25 tokens are split 4 ways: 6.25 to each of A, B, C and 6.25 back to itself. Nothing leaks away.</div>`,
  );
  addV(
    "a1-surfer",
    4,
    FG.bars(
      [
        ["follow a link", 85, "teal", "d = 0.85"],
        ["teleport anywhere", 15, "violet", "1 − d"],
      ],
      { max: 100, unit: "%" },
    ),
  );
  addV(
    "a1-pagerank",
    1,
    FG.flow([
      { t: "H", s: "raw link matrix" },
      { t: "A", s: "fix dangling columns → 1/N", c: "amber" },
      { t: "G = d·A + (1−d)·B", s: "add the teleport floor", c: "teal" },
    ]),
  );
  addV(
    "a1-pagerank",
    3,
    FG.plot([{ f: (k) => Math.pow(0.85, k), c: "teal", fill: true, label: "error ∝ 0.85ᵏ" }], {
      x: [0, 30],
      y: [0, 1],
      xl: "iteration k",
      yl: "distance from the answer",
      h: 180,
    }) +
      `<div class="fig-cap">Each iteration shrinks the remaining error by roughly a factor of d. After ~50 steps it's negligible.</div>`,
  );
})();
