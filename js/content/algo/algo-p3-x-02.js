/* algo-p3-x-02.js: LP: feasible-region plot, deepened 3.2 and 3.4, 3.3 standard form */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const { T, fig, mod, nice, sgn } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  /* ---------- generic 2-variable LP plot: constraints a x + b y <= r (plus x, y >= 0) ---------- */
  function polySVG(
    cons,
    { obj = null, iso = null, opt = null, span = 8, W = 440, H = 310, step = 1, ax = ["x₁", "x₂"] } = {},
  ) {
    let poly = [
      [0, 0],
      [span, 0],
      [span, span],
      [0, span],
    ];
    cons.forEach(({ a, b, r }) => {
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
    const pad = 34,
      X = (x) => pad + (x / span) * (W - pad - 14),
      Y = (y) => H - pad + 4 - (y / span) * (H - pad - 18);
    const grid = [];
    for (let t = 0; t <= span; t += step)
      grid.push(
        `<line x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(span)}" stroke="var(--line)"/><text x="${X(t)}" y="${Y(0) + 15}" class="fig-sub">${t}</text><line x1="${X(0)}" y1="${Y(t)}" x2="${X(span)}" y2="${Y(t)}" stroke="var(--line)"/>${t ? `<text x="${X(0) - 8}" y="${Y(t) + 4}" class="fig-sub" style="text-anchor:end">${t}</text>` : ""}`,
      );
    const seg = ({ a, b, r }) => {
      const pts = [];
      if (b) {
        [0, span].forEach((x) => {
          const y = (r - a * x) / b;
          if (y >= -1e-9 && y <= span + 1e-9) pts.push([x, y]);
        });
      }
      if (a) {
        [0, span].forEach((y) => {
          const x = (r - b * y) / a;
          if (x >= -1e-9 && x <= span + 1e-9) pts.push([x, y]);
        });
      }
      return pts.length >= 2
        ? [
            pts[0],
            pts.reduce(
              (m, p) =>
                Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) > Math.hypot(m[0] - pts[0][0], m[1] - pts[0][1]) ? p : m,
              pts[1],
            ),
          ]
        : null;
    };
    const lines = cons
      .map((c) => {
        const s = seg(c);
        if (!s) return "";
        const col = c.c || "var(--violet)",
          t = c.at ?? 0.62,
          lx = s[0][0] + t * (s[1][0] - s[0][0]),
          ly = s[0][1] + t * (s[1][1] - s[0][1]);
        return `<line x1="${X(s[0][0])}" y1="${Y(s[0][1])}" x2="${X(s[1][0])}" y2="${Y(s[1][1])}" stroke="${col}" stroke-width="2"/>${c.n ? `<text x="${X(lx) + 7}" y="${Y(ly) - 7}" class="fig-sub" style="fill:${col};text-anchor:start">${c.n}</text>` : ""}`;
      })
      .join("");
    let isoLine = "";
    if (obj && iso !== null) {
      const s = seg({ a: obj[0], b: obj[1], r: iso });
      if (s)
        isoLine = `<line x1="${X(s[0][0])}" y1="${Y(s[0][1])}" x2="${X(s[1][0])}" y2="${Y(s[1][1])}" stroke="var(--rose)" stroke-width="2.5" stroke-dasharray="7 5"/>`;
    }
    const verts = poly
      .map(([x, y]) => {
        const isOpt = opt && Math.abs(opt[0] - x) < 1e-6 && Math.abs(opt[1] - y) < 1e-6;
        return `<g class="fi"><circle cx="${X(x)}" cy="${Y(y)}" r="${isOpt ? 9 : 6}" fill="${isOpt ? "var(--amber)" : "var(--teal)"}" stroke="var(--bg-2)" stroke-width="2"/><text x="${X(x) + (x > span * 0.6 ? -10 : 10)}" y="${Y(y) - 10}" class="fig-sub" style="fill:var(--text);text-anchor:${x > span * 0.6 ? "end" : "start"}">(${nice(x)}, ${nice(y)})${obj ? ` · z=${nice(obj[0] * x + obj[1] * y)}` : ""}</text></g>`;
      })
      .join("");
    const area =
      poly.length > 2
        ? `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="rgba(88,204,2,.16)" stroke="rgba(88,204,2,.5)"/>`
        : "";
    return {
      svg: `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:${H}px;overflow:hidden">${grid.join("")}${area}${lines}${isoLine}${poly.length > 2 ? verts : ""}<text x="${W - 14}" y="${Y(0) + 15}" class="fig-sub" style="text-anchor:end">${ax[0]}</text><text x="${X(0) - 8}" y="14" class="fig-sub">${ax[1]}</text></svg>`,
      poly,
    };
  }
  /* ============ deepen 3.2 a3-lp (feasible region) ============ */
  (function () {
    const m = mod("a3-lp");
    m.order = 2;
    m.num = "3.2";
    const S = L["a3-lp"].steps;
    const FACT = [
      { a: 1, b: 2, r: 10, n: "x + 2y ≤ 10", c: "var(--violet)", at: 0.2 },
      { a: 3, b: 1, r: 15, n: "3x + y ≤ 15", c: "var(--amber)", at: 0.55 },
    ];
    // prettier-ignore
    const polyHalf = { t: "Lines, planes, hyperplanes", b: `<p>A linear equation such as <code>a₁x₁ + a₂x₂ = b</code> is a <b>line</b> with 2 variables, a <b>plane</b> with 3, and a <b>hyperplane</b> with n. An inequality keeps one side of it.</p><p>Keep every side at once and you get a <b>convex polytope</b> (a polyhedron). <b>Convex</b> means: pick any two feasible plans, and every plan on the straight line between them is feasible too.</p>`,
      v: F.cells([{ v: "2 variables", sub: "a line cuts the plane", c: "violet" }, { v: "3 variables", sub: "a plane cuts space", c: "blue" }, { v: "n variables", sub: "a hyperplane cuts n-space", c: "amber" }], { size: 118 }),
      c: { q: "Two plans are both feasible. What is true of the plan exactly halfway between them?", o: ["It is feasible too, because the region is convex", "It might break a rule, so it must be re-checked", "It is always better than both of them"], a: 0, why: "Each rule is a half-space, and half-spaces are convex. An intersection of convex sets is convex, so the midpoint passes every rule." } };
    const mini = (inner) =>
      `<svg class="fig" viewBox="0 0 200 130" style="max-height:130px"><polygon points="30,110 160,110 185,55 120,15 40,35" fill="rgba(88,204,2,.16)" stroke="rgba(88,204,2,.6)" stroke-width="2"/>${inner}</svg>`;
    // prettier-ignore
    const grad = { t: "Inside is never best", b: `<p>Suppose the best plan sat strictly <b>inside</b> the region. Then you could nudge it a little in the direction that raises z and still be feasible, so it was not best. The optimum must be on the <b>boundary</b>.</p><p>On an edge, z is a linear function of position, so slide along the edge in the improving direction until the next edge stops you: a <b>vertex</b>.</p>`,
      v: F.frames([
        { t: "Inside: z can still rise", v: mini(`<circle cx="95" cy="65" r="6" fill="var(--teal)"/><path d="M101 63 L140 50" stroke="var(--rose)" stroke-width="3" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--rose)"/></marker></defs>`) },
        { t: "Follow z up to a boundary", v: mini(`<circle cx="95" cy="65" r="4" fill="var(--line-2)"/><path d="M95 65 L150 36" stroke="var(--text-faint)" stroke-dasharray="4 3"/><circle cx="152" cy="35" r="6" fill="var(--teal)"/>`) },
        { t: "Slide along the edge to a vertex", v: mini(`<path d="M152 35 L185 55" stroke="var(--rose)" stroke-width="3"/><circle cx="185" cy="55" r="9" fill="var(--amber)"/>`) },
      ]),
      c: { q: "Why can a linear objective never peak at an interior point?", o: ["A small step in the improving direction stays inside and scores more", "Interior points break at least one of the constraints", "Interior points have no z value because they are not corners"], a: 0, why: "Interior points still satisfy every rule with room to spare, and z has a constant slope, so there is always a better neighbour." } };
    // prettier-ignore
    const ex2 = { t: "A second picture: a ≥ rule", b: `<p>Maximise <code>x₁ + x₂</code> subject to <code>3x₁ − 2x₂ ≥ −4</code>, <code>4x₁ − x₂ ≤ 12</code>, <code>x₁ + 2x₂ ≤ 12</code>, x ≥ 0.</p><p>A ≥ rule is just a half-plane facing the other way (here the region lies below the line 3x₁ − 2x₂ = −4). The region is a five-cornered polygon, and the best corner is where the sliding line z = x₁ + x₂ leaves it.</p>`,
      v: fig(polySVG([{ a: -3, b: 2, r: 4, n: "3x₁ − 2x₂ ≥ −4", c: "var(--blue)", at: 0.25 }, { a: 4, b: -1, r: 12, n: "4x₁ − x₂ ≤ 12", c: "var(--amber)", at: 0.35 }, { a: 1, b: 2, r: 12, n: "x₁ + 2x₂ ≤ 12", c: "var(--violet)", at: 0.5 }], { obj: [1, 1], iso: 8, opt: [4, 4], span: 8 }).svg, "Corners: (0,0) → 0, (3,0) → 3, (4,4) → 8, (2,5) → 7, (0,2) → 2."),
      c: { q: "Which corner maximises x₁ + x₂ here?", o: ["(2, 5), where z = 7", "(4, 4), where z = 8", "(3, 0), where z = 3"], a: 1, why: "Evaluate all five corners: 0, 3, 8, 7 and 2. The largest is 8 at (4, 4), where the last two rules cross." } };
    // prettier-ignore
    const tie = { t: "A tie: a whole edge", b: `<p>Make the objective <code>z = 3x + y</code>. Its profit line is now <b>parallel</b> to the raw-material rule <code>3x + y ≤ 15</code>. Sliding the line out, it touches the polygon along a whole edge at once.</p><p>Both (5, 0) and (4, 3) give z = 15, and so does every point between them. The lecture's phrasing: the optimum is a vertex, or a <b>group of vertices</b>.</p>`,
      v: fig(polySVG(FACT, { obj: [3, 1], iso: 15, span: 8, ax: ["x", "y"] }).svg, "z = 3x + y ties along the whole edge from (5, 0) to (4, 3)."),
      c: { q: "With z = 3x + y on this region, how many plans earn the maximum of 15?", o: ["Exactly one, because simplex breaks the tie", "None, since a tie means there is no best plan", "Infinitely many: every point on that edge"], a: 2, why: "Both end corners give 15 and z is constant along the edge between them, so every point there is optimal. A solver reports one corner, but the others tie." } };
    S.find((x) => x.t === "Binding vs slack").v = (box) => {
      box.innerHTML = `<div class="fig-wrap">${T(
        ["rule at (4, 3)", "used", "limit", "slack"],
        [
          ["machine: x + 2y", "4 + 6 = 10", "10", "0 (binding)"],
          ["material: 3x + y", "12 + 3 = 15", "15", "0 (binding)"],
          ["demand cap: y ≤ 4 (if on)", "3", "4", "1 (slack)"],
        ],
      )}</div>`;
    };
    S.splice(2, 0, polyHalf); // after "Each rule cuts the plane"
    const i4 = S.findIndex((s) => s.t === "Binding vs slack");
    S.splice(i4, 0, grad, ex2, tie);
    // grad belongs after "Why a corner always wins": move it
    const g = S.indexOf(grad);
    S.splice(g, 1);
    S.splice(S.findIndex((s) => s.t === "Why a corner always wins") + 1, 0, grad);
    L["a3-lp"].guide.push("Set the slider to exactly £1 and read the table: two corners tie.");
    const r0 = m.render;
    m.render = function (root, life) {
      r0.call(this, root, life);
      root.appendChild(
        predict({
          id: "a3-lp-2",
          q: "Drag the £ per unit of y slider to exactly £1. The objective becomes 3x + y. What does the corner table show?",
          opts: [
            "(4, 3) is the only best corner, earning 15",
            "(5, 0) and (4, 3) tie at 15: a whole edge",
            "The LP becomes unbounded, with no best plan",
          ],
          a: 1,
          why: "At £1, (5,0) gives 15 and (4,3) gives 12 + 3 = 15. The objective line is parallel to 3x + y = 15, so the whole edge between them is optimal.",
        }),
      );
    };
  })();
  /* ============ deepen 3.4 a3-simplex ============ */
  (function () {
    const m = mod("a3-simplex");
    m.order = 4;
    m.num = "3.4";
    const S = L["a3-simplex"].steps;
    // prettier-ignore
    const many = { t: "Why not check every corner?", b: `<p>With <b>n</b> variables and <b>m</b> constraints there can be up to <b>C(m + n, n)</b> corners. That grows terrifyingly fast, so a program that visits all of them is hopeless on real problems.</p>`,
      v: F.bars([["n = m = 5", 252, "teal", "252"], ["n = m = 10", 184756, "amber", "about 185 thousand"], ["n = m = 20", 137846528820, "rose", "about 138 billion"]], { max: 137846528820, fmt: (v) => v.toLocaleString("en-GB") }),
      c: { q: "Why does simplex not simply evaluate every corner of the polygon?", o: ["The corner count can explode with more variables", "Corners cannot be located by a computer program", "The best plan is usually found in the interior"], a: 0, why: "Up to C(m + n, n) corners exist, so exhaustive search is exponential. Simplex only follows an improving path." } };
    // prettier-ignore
    const basic = { t: "A corner is a basic solution", b: `<p>Add a <b>slack</b> variable to each rule: <code>x + 2y + s₁ = 10</code> and <code>3x + y + s₂ = 15</code>. A slack measures unused capacity.</p><p>With 4 variables and 2 equations, a corner is where <b>two variables are 0</b> (the <b>nonbasic</b> ones). The other two are <b>basic</b>, and their values come from the equations.</p>`,
      v: (box) => { box.innerHTML = `<div class="fig-wrap">${T(["corner", "zero (nonbasic)", "basic values", "z = 3x + 2y"], [["(0, 0)", "x, y", "s₁ = 10, s₂ = 15", "0"], ["(5, 0)", "y, s₂", "x = 5, s₁ = 5", "15"], ["(4, 3)", "s₁, s₂", "x = 4, y = 3", "18"], ["(0, 5)", "x, s₁", "y = 5, s₂ = 10", "10"]], 2)}</div><div class="fig-cap">A pivot swaps one nonbasic variable with one basic variable: one step along an edge.</div>`; },
      c: { q: "At the corner (0, 5), which variables are zero?", o: ["y and s₂", "x and s₁", "s₁ and s₂"], a: 1, why: "x = 0 on the vertical axis, and s₁ = 10 − 0 − 2·5 = 0, so the machine rule is tight. s₂ = 15 − 5 = 10 is basic." } };
    S.find((x) => x.t === "Stop when no edge improves").v = (box) => {
      box.innerHTML = `<div class="fig-wrap">${T(
        ["neighbour of (4, 3)", "z", "better than 18?"],
        [
          ["(5, 0)", "15", "no"],
          ["(0, 5)", "10", "no"],
        ],
        -1,
      )}</div><div class="fig-cap">Every neighbour is worse, so simplex stops at (4, 3).</div>`;
    };
    S.splice(1, 0, many, basic);
    L["a3-simplex"].guide.push("Pick a different first entering variable in your head: do you still reach (4, 3)?");
    const r0 = m.render;
    m.render = function (root, life) {
      r0.call(this, root, life);
      root.appendChild(
        predict({
          id: "a3-sim-2",
          q: "From (0, 0), suppose y entered first instead of x. Machine hours allow y ≤ 5 and raw material allows y ≤ 15. Which corner do you reach?",
          opts: ["(0, 5) with z = 10", "(0, 15) with z = 30", "(5, 0) with z = 15"],
          a: 0,
          why: "The tighter limit wins: y = 5, so you reach (0, 5) with z = 10. From there x enters and you still end at (4, 3). Different paths can reach the same optimum.",
        }),
      );
    };
  })();
  /* ============ 3.3 Standard form ============
     min 2x1 + 3x2 - x3 ; x1+x2+x3 >= 4 ; x1 - x2 = 1 ; x1 + 2x3 <= 8 ; x1, x2 >= 0, x3 free. */
  function conv(k) {
    let sense = "min",
      c = [2, 3, -1],
      names = ["x₁", "x₂", "x₃"],
      rows = [
        { a: [1, 1, 1], op: "≥", r: 4 },
        { a: [1, -1, 0], op: "=", r: 1 },
        { a: [1, 0, 2], op: "≤", r: 8 },
      ];
    if (k >= 1) {
      sense = "max";
      c = c.map((v) => -v);
    }
    if (k >= 2) rows = rows.map((w) => (w.op === "≥" ? { a: w.a.map((v) => -v), op: "≤", r: -w.r } : w));
    if (k >= 3)
      rows = rows.flatMap((w) =>
        w.op === "="
          ? [
              { a: w.a, op: "≤", r: w.r },
              { a: w.a.map((v) => -v), op: "≤", r: -w.r },
            ]
          : [w],
      );
    if (k >= 4) {
      c = [...c, -c[2]];
      rows = rows.map((w) => ({ ...w, a: [...w.a, -w.a[2]] }));
      names = ["x₁", "x₂", "x₃′", "x₃″"];
    }
    return { sense, c, names, rows };
  }
  const lin = (a, names) =>
    a
      .map((v, j) => (v ? `${v < 0 ? "−" : "+"} ${Math.abs(v) === 1 ? "" : Math.abs(v)}${names[j]}` : ""))
      .filter(Boolean)
      .join(" ")
      .replace(/^\+ /, "")
      .replace(/^− /, "−");
  const convHTML = (k) => {
    const s = conv(k);
    return T(
      ["", "LP"],
      [
        [`<b>${s.sense === "min" ? "minimise" : "maximise"}</b>`, `<span class="mono">${lin(s.c, s.names)}</span>`],
        ...s.rows.map((w, i) => [
          `rule ${i + 1}`,
          `<span class="mono">${lin(w.a, s.names)} ${w.op} ${sgn(w.r)}</span>`,
        ]),
        ["signs", `<span class="mono">${k >= 4 ? "x₁, x₂, x₃′, x₃″ ≥ 0" : "x₁, x₂ ≥ 0, x₃ free"}</span>`],
      ],
    );
  };
  const CONV_CAP = [
    "The LP as the promoter might write it: minimise, with ≥, = and a free variable.",
    "<b>Rule 1.</b> Minimise f is the same as maximise −f: negate every objective coefficient.",
    "<b>Rule 2.</b> Multiply a ≥ rule by −1 to flip it to ≤ (the right-hand side changes sign too).",
    "<b>Rule 3.</b> Replace an equality by two inequalities: one ≤ and its negation.",
    "<b>Rule 4.</b> Replace a free variable x₃ by x₃′ − x₃″ with both ≥ 0. Standard form reached.",
  ];
  // prettier-ignore

  L["a3-standard"] = {
    sum: "Simplex expects one shape: <b>maximise, all rules ≤, all variables ≥ 0</b>. Any other LP is converted with four mechanical rules: negate to maximise, flip ≥, split =, split free variables.",
    steps: [
      { t: "One shape for every LP", b: `<p>The solver only has to understand <b>standard form</b>: maximise <code>cᵀx</code> subject to <code>Ax ≤ b</code> and <code>x ≥ 0</code>. Real problems arrive in other shapes (minimise cost, at-least rules, equalities, quantities that can be negative), so we convert them first.</p>`,
        v: F.cells([{ v: "maximise cᵀx", sub: "the objective", c: "teal" }, "and", { v: "Ax ≤ b", sub: "every rule is ≤", c: "violet" }, "and", { v: "x ≥ 0", sub: "no negative variables", c: "blue" }], { size: 104 }) },
      { t: "Minimise becomes maximise", b: `<p>Minimising a function and maximising its <b>negative</b> pick the very same plan. Only the sign of the score flips.</p><p>So <code>minimise 2x + 3y</code> becomes <code>maximise −2x − 3y</code>. Afterwards, remember to flip the answer's sign when reporting the cost.</p>`,
        v: F.plot([{ f: (x) => (x - 2) ** 2 + 1, c: "teal", label: "cost" }, { f: (x) => -((x - 2) ** 2 + 1), c: "rose", label: "−cost" }], { x: [0, 4], marks: [[2, "same x at both", "amber"]], h: 170 }),
        c: { q: "You want to minimise 5x + y. Which objective do you hand to a maximiser?", o: ["Maximise −5x − y", "Maximise 5x − y", "Maximise −5x + y"], a: 0, why: "Negate every coefficient. Flipping only one sign would change the problem, not just its direction." } },
      { t: "Flip a ≥ rule", b: `<p>A ≥ rule is the wrong way round. Multiply <b>both sides by −1</b>, and the inequality turns over: <code>2x + y ≥ 6</code> becomes <code>−2x − y ≤ −6</code>.</p><p>The right-hand side is now <b>negative</b>. That is fine algebraically, but it matters for simplex's starting point (see 3.7).</p>`,
        v: F.cells([{ v: "2x + y ≥ 6", c: "amber" }, "×(−1)", { v: "−2x − y ≤ −6", c: "teal" }], { size: 112 }),
        c: { q: "Convert 2x + y ≥ 6 to a ≤ rule.", o: ["−2x − y ≤ −6", "−2x − y ≤ 6", "2x + y ≤ −6"], a: 0, why: "Multiply every term, including the right-hand side, by −1. Changing only the left side, or only the right, changes the rule." } },
      { t: "An equality is two inequalities", b: `<p>An equality <code>ax = b</code> says "no more than b <i>and</i> no less than b". Write it as <code>ax ≤ b</code> together with <code>−ax ≤ −b</code>. The pair squeezes ax to exactly b.</p>`,
        v: F.cells([{ v: "x + y = 5", c: "violet" }, "→", { v: "x + y ≤ 5", c: "teal" }, "and", { v: "−x − y ≤ −5", c: "teal" }], { size: 104 }),
        c: { q: "How is the equality x + y = 5 written in standard form?", o: ["x + y ≤ 5 together with −x − y ≤ −5", "x + y ≤ 5 together with x + y ≤ −5", "x + y ≤ 5 and x + y ≤ 6"], a: 0, why: "The pair ax ≤ b and −ax ≤ −b is the same as ax ≥ b and ax ≤ b, which forces ax = b." } },
      { t: "A free variable is a difference", b: `<p>Standard form needs x ≥ 0. If a quantity may go negative (a profit or loss, a temperature), write <code>x = x′ − x″</code> with <code>x′ ≥ 0, x″ ≥ 0</code>. Replace x everywhere by the pair.</p><p>The same x has many representations: that is harmless, because the solver only needs <i>some</i> pair that works.</p>`,
        v: F.cells([{ v: "x = 3", sub: "x′ = 3, x″ = 0", c: "teal" }, { v: "x = 3", sub: "x′ = 5, x″ = 2", c: "blue" }, { v: "x = −2", sub: "x′ = 0, x″ = 2", c: "rose" }], { size: 120 }),
        c: { q: "With x = x′ − x″ and x′, x″ ≥ 0, which pair gives x = −2?", o: ["x′ = 0, x″ = 2", "x′ = 2, x″ = 0", "x′ = 2, x″ = 2"], a: 0, why: "0 − 2 = −2. The pair (2, 0) gives +2 and (2, 2) gives 0." } },
      { t: "All four rules together", b: `<p>Start from a messy LP: minimise <code>2x₁ + 3x₂ − x₃</code> with a ≥ rule, an equality, a ≤ rule and a free x₃. After the four rules we have <b>4 variables</b> and <b>4 rules</b>, all in standard form.</p><p>Note the negative right-hand sides: these came from the flips. They will matter when we ask where simplex can start.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${convHTML(4)}</div>`; } },
    ],
    guide: ["Press <b>Apply next rule</b> and read which rule changes which lines.", "Watch rule 3 turn one equality into two rows.", "Find the right-hand side of the flipped ≥ rule."],
  };
  N.register({
    id: "a3-standard",
    subject: "algo",
    lecture: 3,
    order: 3,
    num: "3.3",
    title: "Standard form",
    blurb: "Four mechanical rules turn any LP into 'maximise, ≤, x ≥ 0'.",
    render(root) {
      root.appendChild(header(this, ""));
      let k = 0;
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="nx">Apply next rule ▸</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="tb" style="min-height:250px"></div><div class="callout" id="cap" style="margin-top:10px;min-height:64px"></div></div>`);
      root.appendChild(card);
      function draw() {
        qs("#tb", card).innerHTML = convHTML(k);
        qs("#cap", card).innerHTML = CONV_CAP[k];
        qs("#cap", card).className = "callout " + (k === 4 ? "teal" : "violet");
        const b = qs("#nx", card);
        b.disabled = k === 4;
        b.textContent = k === 4 ? "Standard form ✓" : "Apply next rule ▸";
      }
      qs("#nx", card).onclick = () => {
        if (k < 4) {
          k++;
          draw();
        }
      };
      qs("#rs", card).onclick = () => {
        k = 0;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a3-std-1",
          q: "Apply all four rules in the demo. How many variables and how many rules (not counting sign rules) does the standard form have?",
          opts: ["3 variables, 3 rules", "4 variables, 4 rules", "4 variables, 3 rules"],
          a: 1,
          why: "The free variable x₃ becomes x₃′ and x₃″ (3 → 4 variables). The equality becomes two rules (3 → 4 rules).",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-std-2",
          q: "The rule x₁ + x₂ + x₃ ≥ 4 is flipped. What is its new right-hand side?",
          opts: ["−4", "4", "−1"],
          a: 0,
          why: "Multiplying both sides by −1 turns the 4 into −4: −x₁ − x₂ − x₃ ≤ −4.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Standard form: <b>maximise, every rule ≤, every variable ≥ 0</b>.",
            "Minimise → negate the objective. ≥ → multiply by −1. = → two inequalities. Free x → x′ − x″.",
            "Flipping a ≥ makes the right-hand side negative, which affects the simplex starting point.",
          ],
          "Four rules turn any LP into the one shape simplex understands.",
        ),
      );
    },
  });
  Object.assign(S, { lin, polySVG });
})();
