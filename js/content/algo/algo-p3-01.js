/* Phase 3 — Optimisation: LP feasible region, simplex pivots, bracketing, Nelder–Mead */
(function () {
  const partScope = (NIC.shared.algoP3 = NIC.shared.algoP3 || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  // five candidate plans (x, y) drawn against the two rule lines; the learner taps the feasible ones
  const plansPick = () => {
    const X = (x) => 40 + x * 48,
      Y = (y) => 240 - y * 38;
    const plans = [
      [2, 2, "up"],
      [4, 3, "left"],
      [5, 3, "up"],
      [1, 5, "up"],
      [6, 1, "down"],
    ];
    const lbl = (x, y, t, c, a) =>
      `<text x="${x}" y="${y}" text-anchor="${a}" style="font:800 13px var(--sans);fill:var(${c})">${t}</text>`;
    const dots = plans.map(([x, y, side]) => {
      const [tx, ty, a] =
        side === "left"
          ? [X(x) - 14, Y(y) + 5, "end"]
          : side === "down"
            ? [X(x), Y(y) + 28, "middle"]
            : [X(x), Y(y) - 16, "middle"];
      return `<g data-pick="(${x}, ${y})" aria-label="Plan (${x}, ${y})"><circle cx="${X(x)}" cy="${Y(y)}" r="20" fill="transparent"/><circle cx="${X(x)}" cy="${Y(y)}" r="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${lbl(tx, ty, `(${x}, ${y})`, "--ink", a)}</g>`;
    });
    return `<svg viewBox="0 0 400 270" role="group" aria-label="Plot of x across and y up, with the lines x + 2y = 10 and 3x + y = 15 and five candidate plans"><path d="M${X(0)} ${Y(6.2)} V${Y(0)} H${X(7.5)}" fill="none" stroke="var(--line-2)" stroke-width="2"/><line x1="${X(0)}" y1="${Y(5)}" x2="${X(7)}" y2="${Y(1.5)}" stroke="var(--violet)" stroke-width="3" stroke-dasharray="7 5"/><line x1="${X(3)}" y1="${Y(6)}" x2="${X(5)}" y2="${Y(0)}" stroke="var(--amber)" stroke-width="3" stroke-dasharray="7 5"/><g transform="rotate(21.6 ${X(6.4)} ${Y(1.75) - 14})">${lbl(X(6.4), Y(1.75) - 14, "x + 2y = 10", "--violet-ink", "middle")}</g>${lbl(X(3) + 10, Y(6) + 8, "3x + y = 15", "--amber-ink", "start")}${lbl(X(7.5) - 4, Y(0) + 18, "x", "--text-faint", "end")}${lbl(X(0) - 10, Y(6.2) + 4, "y", "--text-faint", "end")}${dots.join("")}</svg>`;
  };

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
          type: "pick",
          q: "A factory must keep both rules: machine hours <code>x + 2y ≤ 10</code> and raw material <code>3x + y ≤ 15</code>, with x, y ≥ 0. Tap <b>every</b> plan (x, y) that is feasible.",
          fig: plansPick(),
          a: ["(2, 2)", "(4, 3)"],
          hint: "A plan is feasible only if it passes both rules. Try each point in both inequalities.",
          why: "(2, 2) and (4, 3) pass both rules ((4, 3) sits exactly on both limits). (5, 3) breaks both, (1, 5) breaks machine hours (11 > 10) and (6, 1) breaks raw material (19 > 15).",
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
      "Drag the <b>£ per unit of y</b> slider slowly. Watch the orange optimum <i>jump</i> from corner to corner. It never slides.",
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
  Object.assign(partScope, { Q, WALK, lpSVG, nice, qa, qdv, qm, qs_, qt, qv });
})();
