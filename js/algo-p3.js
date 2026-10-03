/* Phase 3 — Optimisation: LP feasible region, simplex pivots, bracketing, Nelder–Mead */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ---------- shared LP geometry ----------
     max z = 3x + c₂y   s.t.  x + 2y ≤ 10,  3x + y ≤ 15,  (optional) y ≤ 4,  x, y ≥ 0
     Base vertices (0,0) (5,0) (4,3) (0,5). With c₂ = 2: z = 0, 15, 18, 10 → optimum (4,3), z = 18. */
  const CONS = [
    { id: "c1", n: "x + 2y ≤ 10", a: 1, b: 2, r: 10, c: "var(--violet)", label: "machine hours" },
    { id: "c2", n: "3x + y ≤ 15", a: 3, b: 1, r: 15, c: "var(--amber)", label: "raw material" },
    { id: "c3", n: "y ≤ 4", a: 0, b: 1, r: 4, c: "var(--blue)", label: "demand cap on y" },
  ];
  const BIG = 40;
  /** Sutherland–Hodgman: clip the box [0,BIG]² by each active half-plane a·x + b·y ≤ r. */
  function region(active) {
    let poly = [
      [0, 0],
      [BIG, 0],
      [BIG, BIG],
      [0, BIG],
    ];
    CONS.filter((c) => active[c.id]).forEach(({ a, b, r }) => {
      const out = [],
        inside = (p) => a * p[0] + b * p[1] <= r + 1e-9;
      poly.forEach((p, i) => {
        const q = poly[(i + 1) % poly.length],
          pi = inside(p),
          qi = inside(q);
        if (pi) out.push(p);
        if (pi !== qi) {
          const t = (r - a * p[0] - b * p[1]) / (a * (q[0] - p[0]) + b * (q[1] - p[1]));
          out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
        }
      });
      poly = out;
    });
    poly = poly.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
    return { poly, unbounded: poly.some(([x, y]) => x >= BIG - 1e-6 || y >= BIG - 1e-6) };
  }
  const nice = (v) => (Math.abs(v - Math.round(v)) < 1e-6 ? String(Math.round(v)) : v.toFixed(2).replace(/0$/, ""));

  /** SVG plot of the feasible region. opts: {active, c2, opt, path, iso (z value), showZ} */
  function lpSVG({ active, c2 = 2, opt, path = [], iso = null, showZ = true, W = 460, H = 330 }) {
    const { poly, unbounded } = region(active);
    const finite = poly.filter(([x, y]) => x < BIG - 1e-6 && y < BIG - 1e-6);
    const span = Math.max(7, ...finite.map(([x, y]) => Math.max(x, y))) * 1.18;
    const pad = 34,
      X = (x) => pad + (x / span) * (W - pad - 14),
      Y = (y) => H - pad + 4 - (y / span) * (H - pad - 18);
    const ticks = [];
    const step = span > 14 ? 5 : span > 9 ? 2 : 1;
    for (let t = 0; t <= span; t += step)
      ticks.push(
        `<line x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(span)}" stroke="var(--line)" /><text x="${X(t)}" y="${Y(0) + 15}" class="fig-sub">${t}</text><line x1="${X(0)}" y1="${Y(t)}" x2="${X(span)}" y2="${Y(t)}" stroke="var(--line)" />${t ? `<text x="${X(0) - 8}" y="${Y(t) + 4}" class="fig-sub" style="text-anchor:end">${t}</text>` : ""}`,
      );
    const lines = CONS.filter((c) => active[c.id])
      .map((c) => {
        const pts =
          c.b === 0
            ? [
                [c.r / c.a, 0],
                [c.r / c.a, span],
              ]
            : [
                [0, c.r / c.b],
                [span, (c.r - c.a * span) / c.b],
              ];
        const lx = c.b === 0 ? c.r / c.a : Math.min(span * 0.82, (c.r / c.a) * 0.55 + 0.4),
          ly = c.b === 0 ? span * 0.9 : (c.r - c.a * lx) / c.b;
        return `<line x1="${X(pts[0][0])}" y1="${Y(pts[0][1])}" x2="${X(pts[1][0])}" y2="${Y(pts[1][1])}" stroke="${c.c}" stroke-width="2" /><text x="${X(lx) + 6}" y="${Y(ly) - 6}" class="fig-sub" style="fill:${c.c};text-anchor:start">${c.n}</text>`;
      })
      .join("");
    const clipPoly = poly.map(([x, y]) => `${X(Math.min(x, span))},${Y(Math.min(y, span))}`).join(" ");
    let isoLine = "";
    if (iso !== null && c2 > 0) {
      const y0 = iso / c2,
        x0 = iso / 3;
      isoLine = `<line x1="${X(0)}" y1="${Y(y0)}" x2="${X(x0)}" y2="${Y(0)}" stroke="var(--rose)" stroke-width="2.5" stroke-dasharray="7 5" /><text x="${X(Math.min(x0, span) * 0.5) + 8}" y="${Y(Math.min(y0, span) * 0.5) - 8}" class="fig-sub" style="fill:var(--rose);text-anchor:start">z = ${nice(iso)}</text>`;
    }
    const walk =
      path.length > 1
        ? `<polyline points="${path.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="none" stroke="var(--rose)" stroke-width="3.5" stroke-linejoin="round" class="draw" />`
        : "";
    const verts = finite
      .map(([x, y]) => {
        const isOpt = opt && Math.abs(opt[0] - x) < 1e-6 && Math.abs(opt[1] - y) < 1e-6,
          z = 3 * x + c2 * y;
        return `<g class="fi"><circle cx="${X(x)}" cy="${Y(y)}" r="${isOpt ? 9 : 6}" fill="${isOpt ? "var(--amber)" : "var(--teal)"}" stroke="var(--bg-2)" stroke-width="2" /><text x="${X(x) + (x > span * 0.6 ? -10 : 10)}" y="${Y(y) - 10}" class="fig-sub" style="fill:var(--text);text-anchor:${x > span * 0.6 ? "end" : "start"}">(${nice(x)}, ${nice(y)})${showZ ? ` · z=${nice(z)}` : ""}</text></g>`;
      })
      .join("");
    return {
      svg: `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:${H}px;overflow:hidden">${ticks.join("")}<polygon points="${clipPoly}" fill="rgba(88,204,2,${unbounded ? 0.08 : 0.16})" stroke="rgba(88,204,2,.5)" stroke-dasharray="${unbounded ? "5 5" : ""}" />${lines}${isoLine}${walk}${verts}<text x="${W - 14}" y="${Y(0) + 15}" class="fig-sub" style="text-anchor:end">x</text><text x="${X(0) - 8}" y="14" class="fig-sub">y</text></svg>`,
      finite,
      unbounded,
      X,
      Y,
      span,
    };
  }

  /* ============ 3.1 The feasible region ============ */
  L["a3-lp"] = {
    sum: "A linear program asks: <b>choose some numbers to make a score as big as possible, without breaking any rules</b>. The allowed choices form a polygon, and the best choice is always at one of its <b>corners</b>.",
    steps: [
      {
        t: "A factory problem",
        b: `<p>You make two products. <b>x</b> = units of product X, <b>y</b> = units of product Y. Each X earns £3 and each Y earns £2, so the <b>objective</b> is <code>z = 3x + 2y</code>.</p><p>But resources are limited. These are the <b>constraints</b>:</p>`,
        v: F.cells(
          [
            { v: "x + 2y ≤ 10", sub: "machine hours", c: "violet" },
            { v: "3x + y ≤ 15", sub: "raw material", c: "amber" },
            { v: "x, y ≥ 0", sub: "can't make negative units" },
          ],
          { size: 110 },
        ),
      },
      {
        t: "Each rule cuts the plane in half",
        b: `<p>Each constraint is a straight line. Everything on one side is allowed. The <b>feasible region</b> is where every rule is satisfied at once: the overlap.</p>`,
        v: (box) => {
          box.innerHTML = `<div class="fig-wrap">${lpSVG({ active: { c1: true, c2: true }, showZ: false }).svg}</div><div class="fig-cap">Every point in the green polygon is a legal production plan.</div>`;
        },
        c: {
          q: "Is the plan (5, 3) feasible?",
          o: [
            "Yes, both numbers are positive",
            "Yes, it only breaks one rule, which is allowed",
            "No: x + 2y = 11 > 10 and 3x + y = 18 > 15",
          ],
          a: 2,
          why: "Check every rule: 5 + 2·3 = 11 > 10 and 3·5 + 3 = 18 > 15. It breaks both, so it's outside.",
        },
      },
      {
        t: "Slide the profit line",
        b: `<p>All plans earning the same z lie on a straight line, <code>3x + 2y = z</code>. Increasing z slides that line outward, parallel to itself.</p><p>Keep sliding until the line is about to leave the polygon. The last point it touches is the <b>optimum</b>.</p>`,
        v: (box, life) => {
          box.innerHTML = `<div class="fig-wrap" id="slide"></div><div class="controls" style="justify-content:center"><button class="btn small" id="go">▶ Slide the line</button></div>`;
          const draw = (z) =>
            (qs("#slide", box).innerHTML = lpSVG({
              active: { c1: true, c2: true },
              iso: z,
              opt: z >= 18 ? [4, 3] : null,
              showZ: z >= 18,
            }).svg);
          draw(6);
          qs("#go", box).onclick = () => {
            if (N.fx.ok && !N.fx.reduce()) Motion.animate(0, 18, { duration: 1.6, ease: N.fx.EASE_IO, onUpdate: draw });
            else draw(18);
          };
        },
      },
      {
        t: "Why a corner always wins",
        b: `<p>A linear score has no hills. From any point inside the polygon, you can always move in the direction the score increases, until an edge stops you. Then slide along the edge until a <b>corner</b> stops you.</p><span class="key">So you only need to check the corners. Here: (0,0) → 0, (5,0) → 15, <b>(4,3) → 18</b>, (0,5) → 10.</span>`,
        v: F.bars(
          [
            ["(0,0)", 0, "dim"],
            ["(5,0)", 15, "teal"],
            ["(4,3)", 18, "amber", "best"],
            ["(0,5)", 10, "teal"],
          ],
          { max: 18 },
        ),
        c: {
          q: "Where is the optimum of an LP with a bounded feasible region?",
          o: [
            "In the centre of the feasible region",
            "At a corner, or along a whole edge if parallel",
            "Anywhere inside the region, since LPs are flat",
          ],
          a: 1,
          why: "A linear objective can't peak inside, so you can always slide further until a corner stops you.",
        },
      },
      {
        t: "Binding vs slack",
        b: `<p>At (4,3): machine hours are 4 + 6 = 10, exactly the limit. Raw material is 12 + 3 = 15, also exactly the limit. Both constraints are <b>binding</b>: they're what stops you earning more.</p><p>A constraint with room to spare has <b>slack</b>. Loosening it wouldn't change the answer at all.</p>`,
      },
    ],
    guide: [
      "Drag the <b>£ per unit of y</b> slider slowly. Watch the orange optimum <b>jump</b> from corner to corner. It never slides.",
      "Turn on <b>y ≤ 4</b>. A new corner appears. Does the optimum change at £2? At £5?",
      "Turn off a constraint. The region grows, and with both off it becomes unbounded.",
    ],
  };

  N.register({
    id: "a3-lp",
    subject: "algo",
    lecture: 3,
    order: 1,
    num: "3.1",
    title: "The feasible region",
    blurb: "Toggle constraints, change the profit per unit, and watch the best corner jump.",
    render(root) {
      root.appendChild(header(this, ""));
      const active = { c1: true, c2: true, c3: false };
      let c2 = 2;
      const card = el(`<div class="card"><div class="controls" id="tog"></div><div class="controls" id="slw"></div>
        <div class="grid side"><div class="fig-wrap" id="plot"></div><div><table class="t" id="tbl"></table><div class="callout" id="msg" style="margin-top:12px"></div></div></div></div>`);
      root.appendChild(card);
      CONS.forEach((c) => {
        const b = el(
          `<button class="btn small ${active[c.id] ? "on" : ""}" style="${active[c.id] ? `border-color:${c.c};color:${c.c}` : ""}">${c.n} <span class="faint">(${c.label})</span></button>`,
        );
        b.onclick = () => {
          active[c.id] = !active[c.id];
          b.classList.toggle("on", active[c.id]);
          b.style.borderColor = active[c.id] ? c.c : "";
          b.style.color = active[c.id] ? c.c : "";
          draw();
        };
        qs("#tog", card).appendChild(b);
      });
      const sl = N.slider("£ per unit of y (x is fixed at £3)", 0.5, 8, 0.25, 2, (v) => "£" + v.toFixed(2));
      sl.onInput((v) => {
        c2 = v;
        draw();
      });
      qs("#slw", card).appendChild(sl);
      let lastOpt = "";
      function draw() {
        const probe = lpSVG({ active, c2 });
        let opt = null,
          best = -Infinity;
        probe.finite.forEach(([x, y]) => {
          const z = 3 * x + c2 * y;
          if (z > best + 1e-9) {
            best = z;
            opt = [x, y];
          }
        });
        const res = lpSVG({ active, c2, opt: probe.unbounded ? null : opt, iso: probe.unbounded ? null : best });
        qs("#plot", card).innerHTML = res.svg;
        qsa("#plot .fi", card).forEach((g) => g.classList.remove("fi"));
        const binding = opt
          ? CONS.filter((c) => active[c.id] && Math.abs(c.a * opt[0] + c.b * opt[1] - c.r) < 1e-6).map((c) => c.n)
          : [];
        qs("#tbl", card).innerHTML =
          `<tr><th>corner</th><th class="num">z = 3x + ${nice(c2)}y</th></tr>` +
          res.finite
            .map(
              ([x, y]) =>
                `<tr class="${opt && opt[0] === x && opt[1] === y && !res.unbounded ? "hl" : ""}"><td class="mono">(${nice(x)}, ${nice(y)})</td><td class="num">${nice(3 * x + c2 * y)}</td></tr>`,
            )
            .join("");
        const m = qs("#msg", card);
        if (res.unbounded) {
          m.className = "callout rose";
          m.innerHTML = `<b>Unbounded.</b> With these rules you can make x or y as large as you like, so z has no maximum. Real LP solvers report this instead of an answer.`;
        } else {
          m.className = "callout teal";
          m.innerHTML = `Best plan: <b>(${nice(opt[0])}, ${nice(opt[1])})</b>, earning <b>£${nice(best)}</b>.<br><span class="dim">Binding: ${binding.join(" and ") || "none"}.</span>`;
          const key = opt.join();
          if (lastOpt && key !== lastOpt) N.fx.pop(m);
          lastOpt = key;
        }
      }
      draw();
      root.appendChild(
        predict({
          id: "a3-lp-1",
          q: "With £2 per y the optimum is (4, 3), z = 18. Raise the price of y to £7. Where does the optimum go?",
          opts: ["It stays at (4, 3)", "(0, 5)", "(5, 0)"],
          a: 1,
          why: "At £7: (4,3) gives 12 + 21 = 33, and (0,5) gives 35. The switch happens at exactly £6, where both give 30. The optimum jumps from corner to corner when the profit line tilts past an edge's slope.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Feasible region = where every constraint holds. The optimum sits at a <b>corner</b>.",
            "<b>Binding</b> constraints pass through the optimum. The others have slack.",
            "Change the objective enough and the optimum <b>jumps</b> to another corner rather than sliding.",
          ],
          "An LP is solved at a corner: build the feasible polygon, then compare its corners.",
        ),
      );
    },
  });

  /* ============ 3.2 Simplex pivots ============ */
  const WALK = [
    {
      p: [0, 0],
      z: 0,
      enter: "x",
      why: "Start at the origin: make nothing, earn nothing. Both products are profitable (+£3 per x, +£2 per y). <b>Dantzig's rule</b> picks the bigger gain, so <b>x enters</b>.",
    },
    {
      p: [5, 0],
      z: 15,
      enter: "y",
      why: "<b>Ratio test:</b> how far can x grow? Machine hours allow x ≤ 10, raw material allows x ≤ 5. The <b>tighter</b> limit wins, so x = 5 and raw material becomes binding. Now look along the raw-material edge: each extra y means ⅓ less x, a net gain of 2 − 3·⅓ = <b>+£1 per y</b>. So <b>y enters</b>.",
    },
    {
      p: [4, 3],
      z: 18,
      enter: null,
      why: "Slide along the edge until machine hours bind at y = 3, x = 4. From here every neighbouring corner is worse ((5,0) → 15, (0,5) → 10). No move improves z, so this is <b>optimal</b>.",
    },
  ];
  /* Exact fractions for the tableau, shown as a/b. */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);
  const Q = (n, d = 1) => {
    const g = gcd(n, d),
      s = d < 0 ? -1 : 1;
    return { n: (s * n) / g, d: (s * d) / g };
  };
  const qa = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d),
    qs_ = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
  const qm = (a, b) => Q(a.n * b.n, a.d * b.d),
    qdv = (a, b) => Q(a.n * b.d, a.d * b.n);
  const qv = (a) => a.n / a.d,
    qt = (a) => (a.n < 0 ? "−" : "") + (a.d === 1 ? Math.abs(a.n) : `${Math.abs(a.n)}/${a.d}`);

  /** Step-through simplex tableau on the 3.1 factory LP, with the current corner moving on the plot. */
  function simplexRun(box, life) {
    const VARS = ["x", "y", "s1", "s2"];
    function* frames() {
      // rows: s1: x + 2y + s1 = 10;  s2: 3x + y + s2 = 15.  gain row = reduced cost (z per unit) of each variable.
      let rows = [
        { b: "s1", a: [1, 2, 1, 0].map((v) => Q(v)), r: Q(10) },
        { b: "s2", a: [3, 1, 0, 1].map((v) => Q(v)), r: Q(15) },
      ];
      let gain = [3, 2, 0, 0].map((v) => Q(v)),
        z = Q(0);
      const vert = () =>
        ["x", "y"].map((v) => {
          const row = rows.find((w) => w.b === v);
          return row ? qv(row.r) : 0;
        });
      const trail = [[0, 0]];
      const snap = (x) => ({
        rows: rows.map((w) => ({ b: w.b, a: w.a.slice(), r: w.r })),
        gain: gain.slice(),
        z,
        p: vert(),
        trail: trail.slice(),
        ...x,
      });
      yield snap({
        cap: `Start at the corner <b>(0, 0)</b>: make nothing. The slacks s1, s2 hold all the spare capacity, so <b>z = 0</b>.`,
        line: 0,
      });
      for (let round = 0; round < 5; round++) {
        const best = gain.reduce((m, g, j) => (qv(g) > qv(gain[m]) ? j : m), 0);
        if (qv(gain[best]) <= 0) break;
        const ev = VARS[best];
        yield snap({
          enter: best,
          line: 1,
          mood: "think",
          cap: `The gain row says how much z rises per unit. Largest is <b>${ev}: +${qt(gain[best])}</b>, so <b>${ev} enters</b>.`,
          ask: {
            q: "Which variable <b>enters</b>? Tap its column heading.",
            pick: ".rn-tab-h[data-k]",
            a: ev,
            why: `Dantzig's rule: the largest positive gain is <b>${ev}</b> at +${qt(gain[best])} per unit.`,
          },
        });
        const ratios = rows.map((w) => (qv(w.a[best]) > 0 ? qdv(w.r, w.a[best]) : null));
        const leave = ratios.reduce((m, q, i) => (q && (m < 0 || qv(q) < qv(ratios[m])) ? i : m), -1);
        if (leave < 0) break;
        const rt = rows
          .map((w, i) => (ratios[i] ? `${w.b}: ${qt(w.r)} ÷ ${qt(w.a[best])} = ${qt(ratios[i])}` : `${w.b}: no limit`))
          .join(", ");
        yield snap({
          enter: best,
          leave,
          ratios,
          line: 2,
          cap: `Ratio test: ${rt}. Smallest is <b>${qt(ratios[leave])}</b>, so <b>${rows[leave].b} leaves</b>.`,
        });
        const pr = rows[leave],
          pv = pr.a[best];
        const np = { b: ev, a: pr.a.map((v) => qdv(v, pv)), r: qdv(pr.r, pv) };
        rows = rows.map((w, i) =>
          i === leave
            ? np
            : { b: w.b, a: w.a.map((v, j) => qs_(v, qm(w.a[best], np.a[j]))), r: qs_(w.r, qm(w.a[best], np.r)) },
        );
        const gb = gain[best];
        gain = gain.map((g, j) => qs_(g, qm(gb, np.a[j])));
        z = qa(z, qm(gb, np.r));
        const p = vert();
        trail.push(p);
        yield snap({
          piv: [leave, best],
          line: 3,
          mood: "happy",
          cap: `Pivot: ${ev} replaces ${pr.b}. Walk along an edge to the corner <b>(${p.map(nice).join(", ")})</b>, where <b>z = ${qt(z)}</b>.`,
        });
      }
      yield snap({
        done: true,
        line: 4,
        mood: "love",
        cap: `Every gain is now ≤ 0 (${VARS.map((v, j) => `${v}: ${qt(gain[j])}`).join(", ")}). No edge improves z, so <b>(${vert().map(nice).join(", ")})</b> with <b>z = ${qt(z)}</b> is optimal.`,
      });
    }
    F.run(box, life, {
      code: [
        "start at the origin: the slacks are basic",
        "enter: the column with the largest gain",
        "leave: the row with the smallest ratio",
        "pivot: move to the next corner",
        "stop when no gain is positive",
      ],
      build(stage) {
        const lp = lpSVG({ active: { c1: true, c2: true }, showZ: false, W: 380, H: 290 });
        const wrap = document.createElement("div");
        wrap.className = "rn-tab-wrap";
        wrap.innerHTML = `<table class="rn-tab"><thead><tr><th>basis</th>${VARS.map((v) => `<th class="rn-tab-h" data-k="${v}" data-c="${VARS.indexOf(v)}">${v}</th>`).join("")}<th>rhs</th><th class="rn-tab-rt">ratio</th></tr></thead>
          <tbody>${[0, 1].map((i) => `<tr data-r="${i}"><th></th>${VARS.map((_, j) => `<td data-c="${j}"></td>`).join("")}<td class="rn-tab-rhs"></td><td class="rn-tab-rt"></td></tr>`).join("")}
          <tr class="rn-tab-gain"><th>gain</th>${VARS.map((_, j) => `<td data-c="${j}"></td>`).join("")}<td class="rn-tab-rhs"></td><td class="rn-tab-rt"></td></tr></tbody></table>
          <div class="rn-tab-plot">${lp.svg}</div>`;
        stage.appendChild(wrap);
        const svg = wrap.querySelector("svg");
        svg.querySelectorAll(".fi, .draw").forEach((g) => g.classList.remove("fi", "draw"));
        const NS = "http://www.w3.org/2000/svg";
        const trail = document.createElementNS(NS, "polyline");
        trail.setAttribute("class", "rn-tab-trail");
        svg.appendChild(trail);
        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("class", "rn-tab-dot");
        dot.setAttribute("r", 11);
        dot.setAttribute("cx", lp.X(0));
        dot.setAttribute("cy", lp.Y(0));
        svg.appendChild(dot);
        return { wrap, svg, dot, trail, X: lp.X, Y: lp.Y };
      },
      draw(s, f, c) {
        const body = s.wrap.querySelectorAll("tbody tr");
        f.rows.forEach((w, i) => {
          const tr = body[i];
          F.rn.text(c, tr.querySelector("th"), w.b);
          w.a.forEach((v, j) => F.rn.text(c, tr.querySelector(`td[data-c="${j}"]`), qt(v)));
          F.rn.text(c, tr.querySelector(".rn-tab-rhs"), qt(w.r));
          tr.querySelector(".rn-tab-rt").textContent = f.ratios ? (f.ratios[i] ? qt(f.ratios[i]) : "—") : "";
          tr.classList.toggle("rn-tab-leave", f.leave === i);
          tr.classList.toggle("rn-tab-new", !!f.piv && f.piv[0] === i);
        });
        const g = body[2];
        f.gain.forEach((v, j) => F.rn.text(c, g.querySelector(`td[data-c="${j}"]`), qt(v)));
        F.rn.text(c, g.querySelector(".rn-tab-rhs"), "z = " + qt(f.z));
        s.wrap.querySelectorAll("[data-c]").forEach((e) => {
          const j = +e.dataset.c;
          e.classList.toggle("rn-tab-enter", f.enter === j);
          e.classList.toggle("rn-tab-pos", e.closest(".rn-tab-gain") !== null && qv(f.gain[j]) > 0);
        });
        s.wrap.querySelectorAll(".rn-tab-rt").forEach((e) => e.classList.toggle("rn-tab-show", !!f.ratios));
        s.wrap.classList.toggle("rn-tab-done", !!f.done);
        const cx = s.X(f.p[0]),
          cy = s.Y(f.p[1]);
        s.trail.setAttribute("points", f.trail.map(([a, b]) => `${s.X(a)},${s.Y(b)}`).join(" "));
        F.rn.to(c, s.dot, { attr: { cx, cy } }, 0, 0.7);
        s.dot.classList.toggle("rn-tab-opt", !!f.done);
      },
      frames,
    });
  }

  L["a3-simplex"] = {
    sum: "The simplex method never searches the inside of the polygon. It stands on a corner, picks an edge that improves the score, and walks to the next corner. When no edge improves, it stops, and that corner is optimal.",
    steps: [
      {
        t: "Walk the edges, not the interior",
        b: `<p>We know the optimum is at a corner. But a big LP can have millions of corners, so checking them all is hopeless.</p><p>Simplex is smarter: from the current corner, it only moves to a <b>neighbouring</b> corner that is <b>better</b>.</p>`,
        v: (box) => {
          box.innerHTML = `<div class="fig-wrap">${
            lpSVG({
              active: { c1: true, c2: true },
              path: [
                [0, 0],
                [5, 0],
                [4, 3],
              ],
              opt: [4, 3],
            }).svg
          }</div><div class="fig-cap">The red path is the whole algorithm: (0,0) → (5,0) → (4,3).</div>`;
        },
      },
      {
        t: "Which direction? The entering variable",
        b: `<p>At a corner, some variables are 0. Ask: <i>if I increased this one, how much would z gain per unit?</i> That's its <b>reduced cost</b>.</p><p><b>Dantzig's rule:</b> increase the variable with the largest positive reduced cost.</p>`,
        v: F.bars(
          [
            ["x: +£3 per unit", 3, "teal", "enters"],
            ["y: +£2 per unit", 2, "dim"],
          ],
          { max: 3 },
        ),
        c: {
          q: "Dantzig's rule picks the entering variable with…",
          o: [
            "The smallest coefficient, so each pivot moves carefully",
            "The largest positive reduced cost",
            "The first variable in alphabetical order, to keep things simple",
          ],
          a: 1,
          why: "It's a greedy per-unit rule. It doesn't always take the fewest pivots, but it's simple and works well.",
        },
      },
      {
        t: "How far? The ratio test",
        b: `<p>Increase x until a constraint stops you. Each constraint allows a different maximum. The <b>smallest</b> one wins, because going past it leaves the feasible region.</p>`,
        v: F.bars(
          [
            ["machine: x ≤ 10", 10, "violet"],
            ["material: x ≤ 5", 5, "amber", "tightest"],
          ],
          { max: 10 },
        ),
        c: {
          q: "Which constraint decides where you stop?",
          o: ["The loosest bound", "The tightest bound", "A random one"],
          a: 1,
          why: "Push past the tightest bound and you've broken that constraint. That's the ratio test.",
        },
      },
      {
        t: "Stop when no edge improves",
        b: `<p>At (4,3), every neighbouring corner has a lower z. All reduced costs are ≤ 0, and that's the certificate of optimality.</p><span class="key">Each pivot strictly improves z (in the normal non-degenerate case), and there are finitely many corners, so simplex always stops.</span>`,
      },
      {
        t: "Watch it run",
        b: `<p>Here is simplex as a <b>tableau</b>: one row per constraint, plus a <b>gain</b> row showing how much z rises per unit of each variable. The plot shows the corner it's standing on.</p><p>Press <b>play</b> or step with the arrows. It will pause and ask which variable enters.</p>`,
        v: (box, life) => simplexRun(box, life),
      },
    ],
    guide: [
      "Press <b>Pivot</b> and read the explanation under the plot at each corner.",
      "At (5,0), check the maths: why is the net gain for y only £1?",
      "At (4,3), confirm both neighbours are worse. That's the stopping rule.",
    ],
  };

  N.register({
    id: "a3-simplex",
    subject: "algo",
    lecture: 3,
    order: 2,
    num: "3.2",
    title: "Corner to corner: simplex pivots",
    blurb: "Walk the polygon's edges from corner to corner, improving z each time, until there's nowhere better to go.",
    render(root) {
      root.appendChild(header(this, ""));
      let i = 0;
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="pv"></button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="grid side"><div class="fig-wrap" id="plot"></div><div><div class="stat-row"><div class="stat"><small>Corner</small><b id="v"></b></div><div class="stat amber"><small>z = 3x + 2y</small><b id="z">0</b></div></div><div class="callout" id="why"></div></div></div></div>`);
      root.appendChild(card);
      function draw(animate) {
        const w = WALK[i];
        qs("#plot", card).innerHTML = lpSVG({
          active: { c1: true, c2: true },
          path: WALK.slice(0, i + 1).map((s) => s.p),
          opt: w.p,
        }).svg;
        qsa("#plot .fi", card).forEach((g) => g.classList.remove("fi"));
        if (animate) N.fx.play(qs("#plot", card));
        else qsa("#plot .draw", card).forEach((d) => d.classList.remove("draw"));
        qs("#v", card).textContent = `(${w.p.join(", ")})`;
        N.fx.count(qs("#z", card), w.z);
        qs("#why", card).innerHTML = w.why;
        qs("#why", card).className = "callout " + (w.enter ? "violet" : "teal");
        const btn = qs("#pv", card);
        btn.disabled = !w.enter;
        btn.textContent = w.enter ? `Pivot: increase ${w.enter} ▸` : "Optimal ✓";
      }
      qs("#pv", card).onclick = () => {
        if (i < WALK.length - 1) {
          i++;
          draw(true);
        }
      };
      qs("#rs", card).onclick = () => {
        i = 0;
        draw(false);
      };
      draw(false);
      root.appendChild(
        predict({
          id: "a3-sim-1",
          q: "At (5, 0) with z = 15, is there still a direction that improves z?",
          opts: [
            "No: (5, 0) is a corner, so it must be optimal",
            "Yes: trading ⅓ x for each extra y gains £1 per y",
            "It can't be told without solving the whole LP",
          ],
          a: 1,
          why: "Along 3x + y = 15, each +1 y costs −⅓ x: Δz = +2 − 1 = +1. Walking that edge reaches (4,3), z = 18. Being a corner doesn't make it optimal, only having no improving edge does.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Simplex walks corner to corner: <b>enter</b> the most profitable variable, <b>stop</b> at the tightest constraint.",
            "Each pivot improves z, and there are finitely many corners, so it terminates.",
            "Optimality test: no neighbouring corner is better (all reduced costs ≤ 0).",
          ],
          "Stand on a corner, walk an edge that gains, stop when every neighbour is worse.",
        ),
      );
    },
  });

  /* ============ 3.3 Bracketing ============ */
  // Unimodal but kinked (no usable derivative at the bottom): the minimum is at x = 0.62.
  const BF = (x) => 2.2 * Math.abs(x - 0.62) ** 1.4 + 0.25;
  const PHI = (Math.sqrt(5) - 1) / 2;
  L["a3-bracket"] = {
    sum: "No formula, no derivative, just the ability to <b>evaluate</b> the function. Golden-section search keeps an interval that is guaranteed to contain the minimum, and shrinks it by 38% every step.",
    steps: [
      {
        t: "A bracket is a promise",
        b: `<p>Suppose f goes down and then up once on [a, b]. That's called <b>unimodal</b>. Then the minimum is <i>somewhere</i> inside [a, b]. We don't know where yet, but we can narrow it down.</p>`,
        v: F.plot([{ f: BF, c: "teal", fill: true }], {
          x: [0, 1],
          vlines: [
            [0, "a", "violet"],
            [1, "b", "violet"],
          ],
          marks: [[0.62, "minimum (unknown to us)", "amber"]],
          h: 170,
        }),
      },
      {
        t: "Two probes tell you which side to throw away",
        b: `<p>Evaluate f at two interior points c &lt; d.</p><p>If <b>f(c) &lt; f(d)</b>, the minimum can't be to the right of d. If it were, the curve would have to go up to d and then come back down, which is two dips. So we discard [d, b].</p>`,
        v:
          F.plot([{ f: (x) => 2.2 * Math.abs(x - 0.3) ** 1.4 + 0.25, c: "teal" }], {
            x: [0, 1],
            vlines: [
              [0.382, "c", "violet"],
              [0.618, "d → cut from here", "rose"],
            ],
            marks: [
              [0.382, "f(c) low", "teal"],
              [0.618, "f(d) high", "rose"],
            ],
            h: 170,
          }) + `<div class="fig-cap">f(c) &lt; f(d), so everything to the right of d is thrown away.</div>`,
        c: {
          q: "f(c) < f(d) on a unimodal function. Which piece do you discard?",
          o: ["[a, c]", "[d, b]", "The whole bracket"],
          a: 1,
          why: "If the minimum were right of d, f would rise to d and then fall again, which isn't unimodal.",
        },
      },
      {
        t: "Why the golden ratio?",
        b: `<p>Put the probes at 38.2% and 61.8% of the way across. After you discard one end, the surviving probe lands <b>exactly</b> where a probe of the new, smaller bracket should be.</p><span class="key">So each step costs only <b>one</b> new function evaluation, and the bracket shrinks to 0.618 of its size every time.</span>`,
        v: F.bars(
          [
            ["step 0", 1, "violet"],
            ["step 1", PHI, "violet"],
            ["step 2", PHI ** 2, "violet"],
            ["step 3", PHI ** 3, "violet"],
            ["step 10", PHI ** 10, "teal", "≈ 0.008"],
          ],
          { max: 1, fmt: (v) => v.toFixed(3) },
        ),
      },
    ],
    guide: [
      "Before each <b>Iterate</b>, compare the two purple probe heights and predict which end gets cut.",
      "Press <b>Iterate</b>. The discarded part fades to red and the bracket shrinks.",
      "Keep going until the width is under 0.01. How many steps did it take?",
    ],
  };

  N.register({
    id: "a3-bracket",
    subject: "algo",
    lecture: 3,
    order: 3,
    num: "3.3",
    title: "Shrinking the bracket",
    blurb: "Golden-section search squeezes a guaranteed bracket around the minimum, with no derivatives needed.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let a = 0,
        b = 1,
        iter = 0,
        cut = null;
      const probes = () => ({ c: b - PHI * (b - a), d: a + PHI * (b - a) });
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="it">Iterate ▸</button><button class="btn" id="auto">Run to width &lt; 0.01</button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="fig-wrap" id="plot"></div>
        <div class="stat-row"><div class="stat violet"><small>Bracket</small><b id="br"></b></div><div class="stat amber"><small>Width</small><b id="wd"></b></div><div class="stat"><small>Iterations</small><b id="n">0</b></div><div class="stat teal"><small>Evaluations</small><b id="ev">2</b></div></div>
        <div class="mono dim" id="log"></div></div>`);
      root.appendChild(card);
      function draw() {
        const { c, d } = probes(),
          W = 620,
          H = 220,
          pad = 20;
        const X = (x) => pad + x * (W - 2 * pad);
        let lo = Infinity,
          hi = -Infinity;
        for (let i = 0; i <= 200; i++) {
          const v = BF(i / 200);
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
        const Y = (v) => H - 34 - ((v - lo) / (hi - lo)) * (H - 70);
        const curve = Array.from(
          { length: 201 },
          (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(BF(i / 200)).toFixed(1)}`,
        ).join(" ");
        const probe = (x, lbl, better) =>
          `<line x1="${X(x)}" y1="${Y(BF(x))}" x2="${X(x)}" y2="${H - 30}" stroke="var(--violet)" stroke-dasharray="3 3"/><circle cx="${X(x)}" cy="${Y(BF(x))}" r="6" fill="${better ? "var(--teal)" : "var(--violet)"}"/><text x="${X(x)}" y="${Y(BF(x)) - 12}" class="fig-sub" style="fill:${better ? "var(--teal)" : "var(--violet)"}">${lbl}</text>`;
        const cutRect = cut
          ? `<rect x="${X(cut[0])}" y="14" width="${X(cut[1]) - X(cut[0])}" height="${H - 44}" fill="var(--rose-dim)" class="fi"/><text x="${(X(cut[0]) + X(cut[1])) / 2}" y="28" class="fig-sub" style="fill:var(--rose)">discarded</text>`
          : "";
        qs("#plot", card).innerHTML =
          `<svg class="fig" viewBox="0 0 ${W} ${H}">${cutRect}<rect x="${X(a)}" y="${H - 22}" width="${Math.max(2, X(b) - X(a))}" height="10" rx="5" fill="var(--violet)" opacity=".55"/><text x="${X(a)}" y="${H - 2}" class="fig-sub">a</text><text x="${X(b)}" y="${H - 2}" class="fig-sub">b</text><path d="${curve}" fill="none" stroke="var(--teal)" stroke-width="2.5"/>${probe(c, "f(c)", BF(c) < BF(d))}${probe(d, "f(d)", BF(d) <= BF(c))}<text x="${X(0.62)}" y="${Y(BF(0.62)) + 20}" class="fig-sub" style="fill:var(--amber)">★</text></svg>`;
        N.fx.play(qs("#plot", card));
        qs("#br", card).textContent = `[${a.toFixed(3)}, ${b.toFixed(3)}]`;
        qs("#wd", card).textContent = (b - a).toFixed(3);
        qs("#n", card).textContent = iter;
        qs("#ev", card).textContent = iter + 2;
        qs("#log", card).textContent =
          `f(c) = ${BF(c).toFixed(4)}   f(d) = ${BF(d).toFixed(4)}   → ${BF(c) < BF(d) ? "f(c) smaller: next cut is [d, b]" : "f(d) smaller: next cut is [a, c]"}`;
      }
      const step = () => {
        const { c, d } = probes();
        if (BF(c) < BF(d)) {
          cut = [d, b];
          b = d;
        } else {
          cut = [a, c];
          a = c;
        }
        iter++;
      };
      qs("#it", card).onclick = () => {
        step();
        draw();
      };
      qs("#auto", card).onclick = () => {
        let k = 0;
        const t = life.interval(() => {
          if (b - a < 0.01 || k++ > 30) return t();
          step();
          draw();
        }, 280);
      };
      qs("#rs", card).onclick = () => {
        a = 0;
        b = 1;
        iter = 0;
        cut = null;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a3-br-1",
          q: "f(c) < f(d) at interior points c < d of a unimodal function. What is the new bracket?",
          opts: ["[a, d]", "[c, b]", "[a, c]"],
          a: 0,
          why: "f(c) < f(d) means the minimum is at or left of d, so keep [a, d] and discard [d, b]. c survives and becomes one of the next pair of probes.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A bracket guarantees the minimum is inside, so every cut is safe.",
            "Golden-section places probes so one is <b>reused</b>: one new evaluation per step, 0.618× shrink.",
            "Works without derivatives, even at a kink, but only in 1-D and only on a unimodal bracket.",
          ],
          "Two probes decide which end of the bracket goes. Repeat until it's small enough.",
        ),
      );
    },
  });

  /* ============ 3.4 Nelder–Mead ============ */
  // Softened Rosenbrock "banana" valley mapped onto [0,1]²: minimum at (0.8333, 0.6), value 0.
  const ROS = (x, y) => {
    const u = -1.5 + 3 * x,
      v = -0.5 + 2.5 * y;
    return (1 - u) ** 2 + 5 * (v - u * u) ** 2;
  };
  const MIN = [0.8333, 0.6];
  L["a3-nm"] = {
    sum: "Nelder–Mead finds a minimum using only comparisons. A triangle crawls downhill: it keeps flipping its <b>worst</b> corner to the other side, stretching when that works and shrinking when it doesn't.",
    steps: [
      {
        t: "A triangle, not a point",
        b: `<p>In 2-D, Nelder–Mead keeps 3 points: a triangle, called a <b>simplex</b>. Each corner has a function value. Sort them: <b style="color:var(--teal)">best</b>, <b style="color:var(--amber)">middle</b>, <b style="color:var(--rose)">worst</b>.</p><p>Every move is about getting rid of the worst corner.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 180" style="max-height:180px"><polygon points="90,140 250,150 150,40" fill="rgba(206,130,255,.14)" stroke="var(--violet)" stroke-width="2" class="fi"/><circle cx="90" cy="140" r="8" fill="var(--teal)" class="fi"/><text x="90" y="166" class="fig-sub" style="fill:var(--teal)">best</text><circle cx="250" cy="150" r="8" fill="var(--amber)" class="fi"/><text x="250" y="174" class="fig-sub" style="fill:var(--amber)">middle</text><circle cx="150" cy="40" r="8" fill="var(--rose)" class="fi"/><text x="150" y="24" class="fig-sub" style="fill:var(--rose)">worst</text><text x="340" y="96" class="fig-sub">downhill →</text></svg>`,
      },
      {
        t: "Reflect the worst corner",
        b: `<p>Flip the worst corner through the midpoint of the other two, like folding the triangle over. Then compare the new point:</p>`,
        v: F.frames([
          {
            t: "<b>Reflect</b>: new point is decent, so keep it",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,70 110,75 60,15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3"/><polygon points="20,70 110,75 70,130" fill="rgba(88,204,2,.15)" stroke="var(--teal)" transform="translate(0,-40)"/></svg>`,
          },
          {
            t: "<b>Expand</b>: it's the best yet, so go even further",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,40 110,45 60,-15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3" transform="translate(0,30)"/><line x1="60" y1="15" x2="80" y2="88" stroke="var(--teal)" stroke-width="2" class="draw"/><circle cx="80" cy="85" r="5" fill="var(--teal)"/></svg>`,
          },
          {
            t: "<b>Contract</b>: it's still bad, so pull back halfway",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,70 110,75 60,15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3"/><circle cx="62" cy="45" r="5" fill="var(--amber)"/><line x1="60" y1="15" x2="62" y2="45" stroke="var(--amber)" stroke-width="2" class="draw"/></svg>`,
          },
          {
            t: "<b>Shrink</b>: nothing works, so squash toward the best",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,70 110,75 60,15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3"/><polygon points="20,70 65,72 40,42" fill="rgba(255,75,75,.15)" stroke="var(--rose)"/></svg>`,
          },
        ]),
        c: {
          q: "The reflected point is worse than all three corners. What does Nelder–Mead try next?",
          o: ["Expand further", "Contract", "Restart randomly"],
          a: 1,
          why: "An overshoot calls for a contraction. Only if that also fails does the whole triangle shrink.",
        },
      },
      {
        t: "The landscape in 3-D",
        b: `<p>This is the valley the triangle crawls through below: a curved "banana" (a softened <b>Rosenbrock</b> function). The floor bends, so steps of a fixed size would keep bumping into the walls. Nelder–Mead's triangle stretches along the valley instead.</p><p>Drag to rotate it.</p>`,
        v: (box, life) => {
          F.surface3d(box, life, {
            f: (x, y) => Math.log(1 + ROS(x, y)),
            height: 260,
            points: [{ x: MIN[0], y: MIN[1], c: "#ff9600", label: "minimum" }],
          });
        },
      },
      {
        t: "Why it needs no gradient",
        b: `<p>Every decision is a comparison: <i>is this point better than that one?</i> There are no derivatives anywhere. So it works on noisy or non-smooth functions where gradient methods can't even start.</p><span class="key">The trade-off is weak theory: it can stall, and it slows down in high dimensions.</span>`,
      },
    ],
    guide: [
      "Press <b>Step</b> and read the move name each time. The faint outline is the previous triangle.",
      "Press <b>Run</b>. The triangle stretches along the curved valley, then collapses onto the ★.",
      "Switch to the <b>3-D</b> view to see the path on the surface.",
    ],
  };

  N.register({
    id: "a3-nm",
    subject: "algo",
    lecture: 3,
    order: 4,
    num: "3.4",
    title: "The wandering triangle",
    blurb: "Nelder–Mead crawls a triangle down a curved valley: reflect, expand, contract, shrink.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let tri,
        prev,
        iter = 0,
        lastOp = "—",
        trail = [],
        view = "2d",
        s3 = null,
        timer = null,
        contour = null;
      const f = (p) => ROS(p[0], p[1]);
      const init = () => {
        tri = [
          [0.12, 0.12],
          [0.3, 0.1],
          [0.16, 0.3],
        ].map((p) => ({ p, f: f(p) }));
        prev = null;
        iter = 0;
        lastOp = "—";
        trail = [tri[0].p.slice()];
      };
      init();
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="it">Step ▸</button><button class="btn" id="run">▶ Run</button><button class="btn ghost" id="rs">Reset</button><span style="flex:1"></span><span id="vw"></span></div>
        <div id="stage"></div><div class="legend"><span style="--c:var(--teal)">best</span><span style="--c:var(--amber)">middle</span><span style="--c:var(--rose)">worst</span><span style="--c:var(--line-2)">previous triangle</span></div>
        <div class="stat-row"><div class="stat teal"><small>Best f</small><b id="bf"></b></div><div class="stat violet"><small>Last move</small><b id="op">—</b></div><div class="stat"><small>Iterations</small><b id="n">0</b></div></div></div>`);
      root.appendChild(card);
      qs("#vw", card).appendChild(
        N.seg(
          [
            ["2d", "Contour"],
            ["3d", "3-D"],
          ],
          "2d",
          (v) => {
            view = v;
            mount();
          },
        ),
      );
      function nmStep() {
        prev = tri.map((v) => v.p.slice());
        tri.sort((a, b) => a.f - b.f);
        const [b0, m0, w0] = tri;
        const mid = [(b0.p[0] + m0.p[0]) / 2, (b0.p[1] + m0.p[1]) / 2];
        const at = (t) => [mid[0] + t * (w0.p[0] - mid[0]), mid[1] + t * (w0.p[1] - mid[1])];
        const r = at(-1),
          fr = f(r);
        if (fr < b0.f) {
          const e = at(-2),
            fe = f(e);
          if (fe < fr) {
            tri[2] = { p: e, f: fe };
            lastOp = "expand";
          } else {
            tri[2] = { p: r, f: fr };
            lastOp = "reflect";
          }
        } else if (fr < m0.f) {
          tri[2] = { p: r, f: fr };
          lastOp = "reflect";
        } else {
          const c = fr < w0.f ? at(-0.5) : at(0.5),
            fc = f(c);
          if (fc < Math.min(fr, w0.f)) {
            tri[2] = { p: c, f: fc };
            lastOp = fr < w0.f ? "contract (outside)" : "contract (inside)";
          } else {
            [1, 2].forEach((k) => {
              tri[k].p = [b0.p[0] + 0.5 * (tri[k].p[0] - b0.p[0]), b0.p[1] + 0.5 * (tri[k].p[1] - b0.p[1])];
              tri[k].f = f(tri[k].p);
            });
            lastOp = "shrink";
          }
        }
        tri.sort((a, b) => a.f - b.f);
        trail.push(tri[0].p.slice());
        iter++;
      }
      function draw2d() {
        const cv = qs("#cv", card);
        if (!cv) return;
        const { ctx, w, h } = N.setupCanvas(cv, 300);
        const C = N.colors();
        const X = (x) => 10 + x * (w - 20),
          Y = (y) => h - 10 - y * (h - 20);
        if (!contour) {
          const G = 120,
            off = document.createElement("canvas");
          off.width = off.height = G;
          const oc = off.getContext("2d"),
            img = oc.createImageData(G, G);
          let mx = 0;
          const vals = [];
          for (let j = 0; j < G; j++)
            for (let i = 0; i < G; i++) {
              const v = Math.log(1 + ROS(i / (G - 1), 1 - j / (G - 1)));
              vals.push(v);
              mx = Math.max(mx, v);
            }
          vals.forEach((v, k) => {
            const t = v / mx,
              band = Math.floor(t * 12) % 2,
              a = 0.08 + 0.55 * (1 - t);
            const c = band ? [88, 204, 2] : [28, 176, 246];
            img.data.set([c[0] * a + 247 * (1 - a), c[1] * a + 247 * (1 - a), c[2] * a + 247 * (1 - a), 255], k * 4);
          });
          oc.putImageData(img, 0, 0);
          contour = off;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(contour, X(0), Y(1), X(1) - X(0), Y(0) - Y(1));
        ctx.fillStyle = C.amber;
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("★", X(MIN[0]), Y(MIN[1]) + 5);
        if (trail.length > 1) {
          ctx.strokeStyle = "rgba(75,75,75,.45)";
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          trail.forEach((p, k) => (k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (prev) {
          ctx.beginPath();
          prev.forEach((p, k) => (k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
          ctx.closePath();
          ctx.strokeStyle = C.line_2;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        tri.forEach((v, k) => (k ? ctx.lineTo(X(v.p[0]), Y(v.p[1])) : ctx.moveTo(X(v.p[0]), Y(v.p[1]))));
        ctx.closePath();
        ctx.fillStyle = "rgba(206,130,255,0.22)";
        ctx.fill();
        ctx.strokeStyle = C.violet;
        ctx.lineWidth = 2;
        ctx.stroke();
        tri.forEach((v, k) => {
          ctx.beginPath();
          ctx.arc(X(v.p[0]), Y(v.p[1]), 6, 0, 7);
          ctx.fillStyle = k === 0 ? C.teal : k === 2 ? C.rose : C.amber;
          ctx.fill();
          ctx.strokeStyle = C.panel;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      function mount() {
        const st = qs("#stage", card);
        st.innerHTML = "";
        s3 = null;
        if (view === "2d") {
          st.innerHTML = `<canvas class="viz" id="cv"></canvas>`;
          draw2d();
        } else {
          s3 = F.surface3d(st, life, { f: (x, y) => Math.log(1 + ROS(x, y)), height: 320 });
          upd3();
        }
      }
      function upd3() {
        if (!s3) return;
        s3.setPoints([
          ...tri.map((v, k) => ({ x: v.p[0], y: v.p[1], c: ["#58cc02", "#ff9600", "#ff4b4b"][k], r: 5 })),
          { x: MIN[0], y: MIN[1], c: NIC.colors().text, r: 3, label: "★" },
        ]);
        s3.setPath(trail);
      }
      function refresh() {
        qs("#bf", card).textContent = tri[0].f.toFixed(4);
        qs("#op", card).textContent = lastOp;
        qs("#n", card).textContent = iter;
        view === "2d" ? draw2d() : upd3();
      }
      const stop = () => {
        if (timer) {
          timer();
          timer = null;
          qs("#run", card).textContent = "▶ Run";
        }
      };
      qs("#it", card).onclick = () => {
        stop();
        nmStep();
        refresh();
      };
      qs("#run", card).onclick = () => {
        if (timer) return stop();
        qs("#run", card).textContent = "⏸ Pause";
        timer = life.interval(() => {
          nmStep();
          refresh();
          if (iter > 80 || tri[0].f < 1e-5) stop();
        }, 170);
      };
      qs("#rs", card).onclick = () => {
        stop();
        init();
        refresh();
      };
      life.onResize(() => view === "2d" && draw2d());
      mount();
      refresh();
      root.appendChild(
        predict({
          id: "a3-nm-1",
          q: "The reflected point beats even the best corner. What should the algorithm do?",
          opts: [
            "Stop, because nothing can beat that point",
            "Try expanding even further in that direction",
            "Shrink the whole triangle towards the best",
          ],
          a: 1,
          why: "A reflection that beats everything suggests you're going downhill, so expansion gambles on a bigger step while it's paying off.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Sort the corners, then fix the <b>worst</b>: reflect → expand → contract → shrink.",
            "No gradients, only comparisons. It works on noisy, non-smooth objectives.",
            "The simplex <i>method</i> (LP) and Nelder–Mead's simplex share only a name: one walks polygon corners, the other moves a triangle.",
          ],
          "Reflect the worst corner. Go further when it works, pull back when it doesn't.",
        ),
      );
    },
  });
})();
