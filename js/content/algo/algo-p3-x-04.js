/* algo-p3-x-04.js: LP: 3.8 applications; optimisation helpers and 3.10 convexity */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const { T } = S;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  /* ============ 3.8 Where LPs are used ============ */
  const CHIPS = [
    ["3x + 2y ≤ 12", 1],
    ["x · y ≤ 6", 0],
    ["x² + y ≤ 4", 0],
    ["x − y ≥ 1", 1],
    ["√x + y ≤ 3", 0],
    ["2x + 5y + z = 9", 1],
    ["5 / x ≤ 2", 0],
    ["x/4 + y/3 ≤ 1", 1],
  ];
  const mapT = (rows) => (box) => {
    box.innerHTML = `<div class="fig-wrap">${T(["LP part", "in this application"], rows)}</div>`;
  };
  // prettier-ignore
  L["a3-apps"] = {
    sum: "LP appears wherever you allocate limited resources under linear rules: telecoms, finance, airlines, networks and game AI. The skill is recognising the three parts, and checking that every formula really is linear.",
    steps: [
      { t: "LP is everywhere", b: `<p>The lecture lists five typical uses. In each one a decision-maker picks quantities, scores the result with a linear formula, and obeys linear limits: a mobile operator balancing profit and quality of service, a portfolio manager balancing risk and yield, an airline scheduling crews, a network designer choosing routes, a game AI choosing a strategy under resource limits.</p>`,
        v: F.cells([{ v: "telecom", sub: "profit vs quality", c: "violet" }, { v: "portfolio", sub: "risk vs yield", c: "blue" }, { v: "airline", sub: "crew cost", c: "amber" }, { v: "network", sub: "battery life", c: "teal" }, { v: "game AI", sub: "resources", c: "rose" }], { size: 104 }) },
      { t: "Telecom: profit and quality", b: `<p>An operator sells voice, image and video. It picks how much capacity <b>xⱼ</b> to give each service, maximises profit, and must keep a minimum quality for each service while sharing a fixed total capacity.</p>`,
        v: mapT([["variables", "capacity given to voice, image, video"], ["objective", "maximise total profit (a weighted sum)"], ["constraints", "quality of each service ≥ its minimum; total capacity ≤ what is available"]]),
        c: { q: "In the operator's LP, what are the variables?", o: ["How much capacity each service receives", "The profit earned by each service", "The minimum quality for each service"], a: 0, why: "Variables are what the operator chooses. Profit is the score, and the minimum qualities are constants in the constraints." } },
      { t: "Portfolio: minimise risk", b: `<p>A fund chooses how much to put in stocks, bonds and property, wanting the <b>least risk</b> while still reaching a <b>minimum yearly yield</b>. The yield rule is linear (a weighted sum of holdings). For the whole thing to be an LP the risk score must be linear too, such as a weighted sum of risk ratings.</p>`,
        v: mapT([["variables", "amount invested in stocks, bonds, property"], ["objective", "minimise a linear risk score"], ["constraints", "expected yield ≥ the target; amounts sum to the budget"]]),
        c: { q: "Which condition do you need if a portfolio's risk is to be an LP objective?", o: ["The risk score must be linear in the holdings", "Every holding must be at least a million pounds", "The yield target must be an exact equality"], a: 0, why: "An LP objective is a weighted sum. A risk measure with squared terms (such as variance) would be non-linear." } },
      { t: "Airline crews", b: `<p>An airline assigns crews to flights at the lowest cost, obeying rules on maximum and continuous service time and on the minimum crew per flight. All are linear limits on how many people are assigned.</p><p>One catch: you cannot send 2.4 crews. A plain LP may return fractions, so real schedules need extra techniques beyond this course.</p>`,
        v: mapT([["variables", "number of crews assigned to each pattern"], ["objective", "minimise total crew cost"], ["constraints", "legal duty hours; at least the minimum crew on every flight"]]),
        c: { q: "An LP for crew scheduling returns 2.4 crews on one route. What is the issue?", o: ["Crews are whole numbers, so extra methods are needed", "LPs never allow decimal numbers in their answers", "The ratio test must have failed on some pivot"], a: 0, why: "LP variables are continuous. Whole-number requirements need further techniques, though LP is still the starting point." } },
      { t: "Networks: make the first battery last", b: `<p>Route data between routers so that the time before <b>the first battery dies</b> is as long as possible. That is a max-min goal, not a plain sum. The trick: add a variable <b>t</b>, maximise t, and require <code>t ≤ lifetimeᵢ</code> for every router. Each lifetime is linear in the traffic routed through it, so the whole model is an LP.</p>`,
        v: F.cells([{ v: "maximise t", sub: "the objective", c: "teal" }, { v: "t ≤ life₁", sub: "router 1", c: "violet" }, { v: "t ≤ life₂", sub: "router 2", c: "violet" }, { v: "t ≤ life₃", sub: "router 3", c: "violet" }], { size: 104 }),
        c: { q: "To lengthen the time until the first battery fails, which objective is used?", o: ["Maximise t, with t ≤ every router's lifetime", "Maximise the sum of every router's lifetime", "Minimise the longest lifetime among the routers"], a: 0, why: "t is forced below the shortest lifetime, so raising t raises the weakest router. A plain sum could let one router die early." } },
      { t: "Is it really linear?", b: `<p>An LP needs two behaviours: <b>proportional</b> (double the input, double the effect) and <b>additive</b> (effects add up). Products of variables, squares, roots and divisions by a variable break one of them.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${T(["formula", "LP-friendly?"], [["3x + 2y ≤ 12", "yes"], ["x · y ≤ 6", "no: product of variables"], ["x² + y ≤ 4", "no: square"], ["x/4 + y/3 ≤ 1", "yes: constants times variables"]])}</div>`; },
        c: { q: "Which constraint can appear in a linear program?", o: ["x − y ≥ 1", "x · y ≥ 1", "x² − y ≥ 1"], a: 0, why: "Only constants multiply the variables, and the terms are added. The product and the square break linearity." } },
    ],
    guide: ["Tap a formula chip, then choose <b>Linear</b> or <b>Not linear</b>.", "Count how many of the eight chips are linear before you finish.", "Answer the questions after the demo."],
  };
  N.register({
    id: "a3-apps",
    subject: "algo",
    lecture: 3,
    order: 8,
    num: "3.8",
    title: "Where LPs are used",
    blurb: "Telecoms, finance, airlines, networks, game AI: recognise the LP, and test that it is linear.",
    render(root) {
      root.appendChild(header(this, ""));
      let sel = -1;
      const done = {};
      const card = el(
        `<div class="card"><div id="chips"></div><div class="controls"><button class="btn small" id="yes">Linear</button><button class="btn small" id="no">Not linear</button><span class="faint" id="sc"></span></div><div class="callout" id="msg" style="min-height:64px"></div></div>`,
      );
      root.appendChild(card);
      const say = (c, h) => {
        const m = qs("#msg", card);
        m.className = "callout " + c;
        m.innerHTML = h;
      };
      function draw() {
        qs("#chips", card).innerHTML = CHIPS.map(
          ([f], i) => `<span class="a3-chip ${done[i] ?? ""} ${sel === i ? "sel" : ""}" data-i="${i}">${f}</span>`,
        ).join("");
        qsa(".a3-chip", card).forEach(
          (c) =>
            (c.onclick = () => {
              sel = +c.dataset.i;
              draw();
            }),
        );
        const right = Object.values(done).filter((v) => v === "ok").length;
        qs("#sc", card).textContent = `sorted: ${Object.keys(done).length} of ${CHIPS.length}, right: ${right}`;
      }
      const judge = (ans) => {
        if (sel < 0 || done[sel]) {
          say("violet", "Tap a formula chip that has not been sorted yet.");
          return;
        }
        const ok = CHIPS[sel][1] === ans;
        done[sel] = ok ? "ok" : "no";
        say(
          ok ? "teal" : "rose",
          ok
            ? `<b>Right.</b> ${CHIPS[sel][1] ? "Constants times variables, added up." : "A variable is multiplied, squared, rooted or divided by."}`
            : `<b>Not quite.</b> ${CHIPS[sel][0]} is ${CHIPS[sel][1] ? "linear: only constants multiply the variables." : "not linear: a variable is multiplied, squared, rooted or divided by."}`,
        );
        sel = -1;
        draw();
      };
      qs("#yes", card).onclick = () => judge(1);
      qs("#no", card).onclick = () => judge(0);
      draw();
      say("violet", "Is each formula allowed in a linear program?");
      root.appendChild(
        predict({
          id: "a3-app-1",
          q: "Which of these formulas can NOT appear in a linear program?",
          opts: ["x/4 + y/3 ≤ 1", "x · y ≤ 6", "2x + 5y + z = 9"],
          a: 1,
          why: "x · y multiplies two variables, so doubling x does not simply double the effect. The other two are constants times variables, added.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-app-2",
          q: "A fund wants to minimise risk measured by variance, which squares the weight of each holding. Is that an LP?",
          opts: [
            "Yes: every minimising problem counts as an LP",
            "No: squares make the objective non-linear",
            "Yes, as long as the yield rule uses a ≥ sign",
          ],
          a: 1,
          why: "An LP objective must be a weighted sum of the variables. Squares break proportionality, so the fund needs a linear risk score or a different method.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Every LP application has the same parts: <b>variables</b> you choose, a linear <b>objective</b>, linear <b>constraints</b>.",
            "A max-min goal becomes an LP by adding a variable t, maximising t and requiring t ≤ each quantity.",
            "Products, squares and roots of variables are not linear. Whole-number needs (crews) go beyond plain LP.",
          ],
          "Name the variables, objective and constraints, then check every formula is linear.",
        ),
      );
    },
  });
  const GR = (3 - Math.sqrt(5)) / 2; // 0.381966
  const nf = (v, d = 2) =>
    Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(1) : (+v.toFixed(d)).toString();
  const f3 = (v) => (+v).toFixed(3);
  const P2 = (p) => `(${nf(p[0])}, ${nf(p[1])})`;
  const tbl = (head, rows, hl = -1) =>
    `<table class="t"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${i === hl ? "hl" : ""}">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const NS = "http://www.w3.org/2000/svg";
  const caption = (t) => `<div class="fig-cap">${t}</div>`;
  /* ================= engines ================= */
  const vadd = (a, b) => a.map((v, i) => v + b[i]),
    vsub = (a, b) => a.map((v, i) => v - b[i]),
    vmul = (a, k) => a.map((v) => v * k);
  const vdist = (a, b) => Math.hypot(...vsub(a, b));
  /* ============ 3.10 Convex or not? ============ */
  const CVX = {
    sq: { n: "x²", f: (x) => x * x, convex: "yes" },
    abs: { n: "|x|", f: (x) => Math.abs(x), convex: "yes (not strictly)" },
    dw: { n: "x⁴ − 2x²", f: (x) => x ** 4 - 2 * x * x, convex: "no" },
    sn: { n: "sin 2x", f: (x) => Math.sin(2 * x), convex: "no" },
  };
  function chordSVG(def, x1, x2, t, W = 520, H = 230) {
    const f = def.f,
      pad = 30,
      lo = -2,
      hi = 2;
    const ys = Array.from({ length: 81 }, (_, i) => f(lo + (i * (hi - lo)) / 80)),
      y0 = Math.min(...ys) - 0.3,
      y1 = Math.max(...ys) + 0.4;
    const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad),
      Y = (v) => H - pad + 6 - ((v - y0) / (y1 - y0)) * (H - pad - 24);
    const curve = ys
      .map((v, i) => `${i ? "L" : "M"}${X(lo + (i * (hi - lo)) / 80).toFixed(1)} ${Y(v).toFixed(1)}`)
      .join(" ");
    const m = t * x1 + (1 - t) * x2,
      fm = f(m),
      ch = t * f(x1) + (1 - t) * f(x2),
      ok = ch >= fm - 1e-9;
    return `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:${H}px"><line x1="${pad}" y1="${Y(0)}" x2="${W - pad}" y2="${Y(0)}" stroke="var(--line)"/>
      <path d="${curve}" fill="none" stroke="var(--teal)" stroke-width="3"/>
      <line x1="${X(x1)}" y1="${Y(f(x1))}" x2="${X(x2)}" y2="${Y(f(x2))}" stroke="var(--amber)" stroke-width="3"/>
      <line x1="${X(m)}" y1="${Y(fm)}" x2="${X(m)}" y2="${Y(ch)}" stroke="${ok ? "var(--teal)" : "var(--rose)"}" stroke-width="3" stroke-dasharray="4 3"/>
      <circle cx="${X(x1)}" cy="${Y(f(x1))}" r="6" fill="var(--amber)"/><circle cx="${X(x2)}" cy="${Y(f(x2))}" r="6" fill="var(--amber)"/>
      <circle cx="${X(m)}" cy="${Y(ch)}" r="6" fill="var(--amber)" stroke="var(--bg-2)" stroke-width="2"/><circle cx="${X(m)}" cy="${Y(fm)}" r="6" fill="${ok ? "var(--teal)" : "var(--rose)"}" stroke="var(--bg-2)" stroke-width="2"/>
      <text x="${X(x1)}" y="${H - 6}" class="fig-sub">x₁</text><text x="${X(x2)}" y="${H - 6}" class="fig-sub">x₂</text></svg>`;
  }
  // prettier-ignore

  L["a3-convex"] = {
    sum: "A convex function is one bowl: any local minimum is the global minimum. The chord test, the second derivative, convex sets, the epigraph and the Hessian are five ways to say the same thing.",
    steps: [
      { t: "One bowl, or many dips?", b: `<p>We want to <b>minimise</b> $y = f(\\mathbf{x})$ where $\\mathbf{x}$ has $D$ parameters. Some functions are friendly: one bowl, one bottom. Others have many dips, and a method can get stuck in the wrong one.</p><span class="key">A <b>convex</b> function has only one minimum, so it is relatively easy (and reliable) to find.</span>`,
        v: F.frames([{ t: "<b>Convex</b>: one minimum", v: F.plot([{ f: (x) => 0.6 + 2.4 * (x - 0.45) ** 2, c: "teal" }], { x: [0, 1], h: 150, marks: [[0.45, "the minimum", "amber"]] }) }, { t: "<b>Not convex</b>: several dips", v: F.plot([{ f: (x) => 1.2 + Math.sin(11 * x) * 0.6 + 0.8 * (x - 0.5) ** 2, c: "rose" }], { x: [0, 1], h: 150, marks: [[0.27, "local", "violet"], [0.83, "global?", "amber"]] }) }]),
        c: { q: "What is special about a convex function?", o: ["Every local minimum is also the global minimum", "It has no minimum at all", "It always looks exactly like a parabola"], a: 0, why: "One bowl means there is nowhere else to get stuck. Parabolas are convex, but so are |x|, eˣ and x⁴." } },
      { t: "The chord test (Jensen)", b: `<p>Pick two points $x_1, x_2$ and join their heights with a straight line, the <b>chord</b> (secant). If the chord <i>never dips below</i> the graph, no matter which two points you pick, $f$ is convex:</p><p>$$t\\,f(x_1) + (1-t)\\,f(x_2) \\;\\ge\\; f\\big(t x_1 + (1-t) x_2\\big), \\quad 0 < t < 1$$</p><p>For $f(x)=x^2$, $x_1=-1$, $x_2=3$, $t=\\tfrac12$: the chord height is $(1+9)/2 = 5$, the curve is $f(1)=1$. The chord is above.</p><p class="faint">The lecture writes a strict &gt;; with &ge; you also allow flat chords, like those of $|x|$.</p>`,
        v: F.plot([{ f: (x) => x * x, c: "teal" }, { pts: [[-1, 1], [3, 9]], c: "amber" }], { x: [-1.5, 3.5], h: 190, marks: [[1, "f = 1", "teal", 1], [1, "chord = 5", "amber", 5]], vlines: [[-1, "x₁", "violet"], [3, "x₂", "violet"]] }),
        c: { q: "For f(x) = x², x₁ = −1, x₂ = 3, t = ½, which is larger at the midpoint x = 1?", o: ["The chord, 5, against a curve value of 1", "The curve, 5, against a chord of 1", "They are equal, both 3"], a: 0, why: "Chord height = ½·1 + ½·9 = 5. Curve = 1² = 1. The chord sits above the graph, as a convex function requires." } },
      { t: "Second derivative: bending upwards", b: `<p>For a smooth function of one variable there is a quicker check: $\\dfrac{d^2 f}{dx^2} \\ge 0$ for every $x$ in the set $X$ you care about. The slope only ever increases, so the curve bends up.</p><p>Watch the phrase <b>on $X$</b>: $x^3$ has $f''=6x$, negative for $x<0$, so it is not convex on all of $\\mathbb{R}$, but it <i>is</i> convex on $x \\ge 0$.</p>`,
        v: tbl(["f(x)", "f″(x)", "Convex on?"], [["x²", "2", "everywhere"], ["x⁴", "12x² ≥ 0", "everywhere"], ["eˣ", "eˣ > 0", "everywhere"], ["x³", "6x", "only x ≥ 0"], ["sin x", "−sin x", "nowhere on all of ℝ"]]),
        c: { q: "f(x) = x³ and the set X = [1, 4]. Is f convex on X?", o: ["Yes: f″ = 6x is positive everywhere on X", "No: f″ changes sign at x = 0, so it fails", "No: cubics are never convex on any interval"], a: 0, why: "Convexity is about the set X. On [1, 4] we have 6x between 6 and 24, always positive; the sign change at 0 is outside X." } },
      { t: "Convex sets and the epigraph", b: `<p>A <b>convex set</b> contains the whole line segment between any two of its points: $\\theta x_1 + (1-\\theta)x_2 \\in C$ for $0\\le\\theta\\le1$. A disc is convex. A crescent is not: join its two tips and the segment leaves the shape.</p><p>The <b>epigraph</b> is the region on and above the graph, $\\operatorname{epi} f = \\{(x,u) : u \\ge f(x)\\}$. And here is the link:</p><span class="key">$f$ is convex exactly when its epigraph is a convex set.</span>`,
        v: `<svg class="fig" viewBox="0 0 560 190" style="max-height:190px"><ellipse cx="80" cy="85" rx="55" ry="45" fill="rgba(88,204,2,.18)" stroke="var(--teal)" stroke-width="3" class="fi"/><line x1="40" y1="70" x2="120" y2="100" stroke="var(--teal)" stroke-width="2.5"/><text x="80" y="170" class="fig-sub">convex set</text>
          <path d="M215 40 A55 50 0 1 0 215 135 A40 42 0 1 1 215 40Z" fill="rgba(255,75,75,.15)" stroke="var(--rose)" stroke-width="3" class="fi"/><line x1="215" y1="40" x2="215" y2="135" stroke="var(--rose)" stroke-width="2.5" stroke-dasharray="4 3"/><text x="205" y="170" class="fig-sub">crescent: not convex</text>
          <path d="M350 150 Q420 -20 490 150" fill="none" stroke="var(--line-2)" stroke-width="0"/><path d="M340 40 Q400 150 470 40 L470 15 L340 15Z" fill="rgba(206,130,255,.2)" class="fi"/><path d="M340 40 Q400 150 470 40" fill="none" stroke="var(--violet)" stroke-width="3" class="draw"/><text x="405" y="75" class="fig-sub" style="fill:var(--violet)">epi f</text><text x="405" y="170" class="fig-sub">epigraph of a convex f</text></svg>`,
        c: { q: "Which of these shapes is NOT a convex set?", o: ["A solid disc with a smooth round edge", "A solid square including its border", "A ring (a disc with a hole in the middle)"], a: 2, why: "Pick two points on opposite sides of the ring: the straight line between them crosses the hole, which is not in the set." } },
      { t: "Many dimensions: the Hessian", b: `<p>With several variables, second derivatives become the <b>Hessian matrix</b> $H$ (all the $\\partial^2 f/\\partial x_i\\partial x_j$). The test: $f$ is convex on $X$ iff <b>all eigenvalues of $H$ are non-negative</b> for every $\\mathbf{x}\\in X$.</p><p>Eigenvalues are the curvature along the principal directions. A negative one means the surface curves <i>down</i> in some direction: a saddle or a hilltop, not a bowl.</p>`,
        v: tbl(["f(x, y)", "Hessian", "Eigenvalues", "Convex?"], [["x² + y²", "[[2, 0], [0, 2]]", "2, 2", "yes"], ["x² + xy + y²", "[[2, 1], [1, 2]]", "3, 1", "yes"], ["x² − y²", "[[2, 0], [0, −2]]", "2, −2", "no: saddle"], ["x² + 3xy + y²", "[[2, 3], [3, 2]]", "5, −1", "no"]]),
        c: { q: "At some point a function's Hessian has eigenvalues 4 and −1. What does that tell you?", o: ["It bends down in one direction there, so it is not convex", "It is convex, because the larger eigenvalue is positive", "It is convex, because the eigenvalues add up to a positive number"], a: 0, why: "Convexity needs every eigenvalue ≥ 0. One negative eigenvalue is a downward-curving direction, so the function fails the test." } },
      { t: "Why we care: gradient = 0", b: `<p>For a convex, differentiable $f(x)$ the minimum $x^*$ is exactly where the gradient vanishes: $\\dfrac{df}{dx}=0$. So <b>minimising a convex function is the same as finding a root of its derivative</b>. Root finding is the next lesson (bisection).</p><p>When $f$ is not convex, or proving convexity is awkward, we fall back on numerical methods that only <i>evaluate</i> $f$: <b>bracketing</b> in one dimension and the <b>downhill simplex</b> in many.</p>`,
        v: F.plot([{ f: (x) => (x - 1) ** 2 + 0.5, c: "teal", label: "f(x)" }, { f: (x) => 2 * (x - 1), c: "violet", dash: "5 4", label: "f′(x)" }], { x: [-1, 3], y: [-4.2, 4.5], h: 190, marks: [[1, "x* : f′ = 0", "amber", 0]] }),
        c: { q: "f is smooth and convex. At its minimum x*, which statement holds?", o: ["f′(x*) = 0", "f(x*) = 0", "f″(x*) = 0"], a: 0, why: "The slope is zero at the bottom of a bowl. f(x*) need not be zero (the bowl may sit above the axis), and f″ is typically positive there." } },
    ],
    guide: ["Pick a function, then drag <b>x₁</b>, <b>x₂</b> and <b>t</b>. The green dot is on the curve, the amber one on the chord.", "Press <b>Test 200 random chords</b> on each function and see which ones ever fail.", "In the Hessian card, try the presets to see a bowl turn into a saddle, then answer the questions after the demo."],
  };
  N.register({
    id: "a3-convex",
    subject: "algo",
    lecture: 3,
    order: 10,
    num: "3.10",
    title: "Convex or not?",
    blurb: "One bowl or many dips: the chord test, f″, convex sets, the epigraph and the Hessian.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let key = "sq",
        x1 = -1.5,
        x2 = 1.2,
        t = 0.5;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Chord test</h2></div><div class="controls" id="fs"></div><div id="cv"></div>
        <div class="controls" id="sl"></div>
        <div class="stat-row"><div class="stat amber"><small>Chord height</small><b id="ch"></b></div><div class="stat teal"><small>f at that x</small><b id="fm"></b></div><div class="stat" id="vd"><small>Chord ≥ curve?</small><b id="ok"></b></div></div>
        <div class="controls"><button class="btn primary" id="rnd">Test 200 random chords</button><span class="dim" id="rt"></span></div></div>`);
      root.appendChild(card);
      qs("#fs", card).appendChild(
        N.seg(
          Object.keys(CVX).map((k) => [k, CVX[k].n]),
          key,
          (v) => {
            key = v;
            qs("#rt", card).textContent = "";
            upd();
          },
        ),
      );
      const s1 = N.slider("x₁", -2, 2, 0.1, x1, (v) => v.toFixed(1)),
        s2 = N.slider("x₂", -2, 2, 0.1, x2, (v) => v.toFixed(1)),
        st = N.slider("t", 0, 1, 0.05, t, (v) => v.toFixed(2));
      [s1, s2, st].forEach((s) => qs("#sl", card).appendChild(s));
      s1.onInput((v) => {
        x1 = v;
        upd();
      });
      s2.onInput((v) => {
        x2 = v;
        upd();
      });
      st.onInput((v) => {
        t = v;
        upd();
      });
      function upd() {
        const d = CVX[key],
          m = t * x1 + (1 - t) * x2,
          ch = t * d.f(x1) + (1 - t) * d.f(x2),
          fm = d.f(m);
        qs("#cv", card).innerHTML = chordSVG(d, x1, x2, t);
        qs("#ch", card).textContent = ch.toFixed(2);
        qs("#fm", card).textContent = fm.toFixed(2);
        qs("#ok", card).textContent = ch >= fm - 1e-9 ? "yes ✓" : "NO ✗";
      }
      qs("#rnd", card).onclick = () => {
        const d = CVX[key];
        let bad = 0,
          ex = null;
        for (let i = 0; i < 200; i++) {
          const a = -2 + 4 * Math.random(),
            b = -2 + 4 * Math.random(),
            u = Math.random();
          if (u * d.f(a) + (1 - u) * d.f(b) < d.f(u * a + (1 - u) * b) - 1e-9) {
            bad++;
            ex = ex || [a, b, u];
          }
        }
        qs("#rt", card).textContent = bad
          ? `${bad} of 200 chords dipped below the curve, so ${d.n} is not convex.`
          : `0 of 200 failed. ${d.n} passes the test (it is convex).`;
        if (ex) {
          x1 = ex[0];
          x2 = ex[1];
          t = ex[2];
          s1.value = x1;
          s2.value = x2;
          st.value = t;
          upd();
        }
      };
      upd();
      /* Hessian card */
      let ha = 1,
        hb = 0,
        hc = -1;
      const hcard =
        el(`<div class="card"><div class="card-head"><h2>Hessian of f = a·x² + b·xy + c·y²</h2></div><div class="controls" id="pre"></div><div class="controls" id="hs"></div><canvas class="viz" id="hv"></canvas>
        <div class="stat-row"><div class="stat"><small>Hessian</small><b id="hm"></b></div><div class="stat violet"><small>Eigenvalues</small><b id="he"></b></div><div class="stat" id="hv2"><small>Convex?</small><b id="hok"></b></div></div></div>`);
      root.appendChild(hcard);
      const PRE = {
        bowl: [1, 0, 1, "Bowl"],
        tilt: [1, 1, 1, "Tilted bowl"],
        saddle: [1, 0, -1, "Saddle"],
        steep: [1, 3, 1, "Twisted"],
      };
      qs("#pre", hcard).appendChild(
        N.seg(
          Object.keys(PRE).map((k) => [k, PRE[k][3]]),
          "saddle",
          (v) => {
            [ha, hb, hc] = PRE[v];
            sa.value = ha;
            sb.value = hb;
            sc.value = hc;
            hupd();
          },
        ),
      );
      const sa = N.slider("a", -3, 3, 1, ha),
        sb = N.slider("b", -3, 3, 1, hb),
        sc = N.slider("c", -3, 3, 1, hc);
      [sa, sb, sc].forEach((s) => qs("#hs", hcard).appendChild(s));
      sa.onInput((v) => {
        ha = v;
        hupd();
      });
      sb.onInput((v) => {
        hb = v;
        hupd();
      });
      sc.onInput((v) => {
        hc = v;
        hupd();
      });
      function hupd() {
        const p = 2 * ha,
          q = 2 * hc,
          r = hb,
          mid = (p + q) / 2,
          rad = Math.sqrt(((p - q) / 2) ** 2 + r * r),
          e1 = mid + rad,
          e2 = mid - rad;
        qs("#hm", hcard).textContent = `[${p}, ${r}; ${r}, ${q}]`;
        qs("#he", hcard).textContent = `${nf(e1)}, ${nf(e2)}`;
        qs("#hok", hcard).textContent = e2 >= -1e-9 ? "yes ✓" : "no ✗";
        const cv = qs("#hv", hcard),
          { ctx, w, h } = N.setupCanvas(cv, 190);
        if (w < 40) return;
        const C = N.colors(),
          G = 40,
          cw = w / G,
          ch = h / G;
        let lo = Infinity,
          hi = -Infinity;
        const vals = [];
        for (let j = 0; j < G; j++)
          for (let i = 0; i < G; i++) {
            const x = -2 + (4 * i) / (G - 1),
              y = 2 - (4 * j) / (G - 1),
              v = ha * x * x + hb * x * y + hc * y * y;
            vals.push(v);
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
          }
        vals.forEach((v, k) => {
          const tt = (v - lo) / (hi - lo || 1),
            band = Math.floor(tt * 10) % 2;
          ctx.fillStyle = band ? `rgba(206,130,255,${0.15 + 0.5 * tt})` : `rgba(28,176,246,${0.15 + 0.5 * tt})`;
          ctx.fillRect((k % G) * cw, Math.floor(k / G) * ch, cw + 1, ch + 1);
        });
        ctx.fillStyle = C.text;
        ctx.font = "700 12px sans-serif";
        ctx.fillText("darker = higher f", 8, 16);
      }
      life.onResize(hupd);
      hupd();
      root.appendChild(
        predict({
          id: "a3-cvx-1",
          q: "Choose x⁴ − 2x² and set x₁ = −1, x₂ = 1, t = 0.5. What does the chord test show at x = 0?",
          opts: [
            "The curve is above the chord, so the test fails",
            "The chord is above the curve, so the test passes",
            "The chord and the curve touch",
          ],
          a: 0,
          why: "f(−1) = f(1) = −1, so the chord is flat at −1. But f(0) = 0 is higher, so the curve rises above the chord. One failing chord proves x⁴ − 2x² is not convex (it has two dips).",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-cvx-2",
          q: "f = x² − y² has Hessian [2, 0; 0, −2]. What shape will its surface show?",
          opts: [
            "A saddle: up along x, down along y, so not convex",
            "A bowl, because 2 is positive",
            "A flat plane, because the entries cancel",
          ],
          a: 0,
          why: "The eigenvalues are 2 and −2. One negative eigenvalue means a direction of downward curvature, so it is a saddle and fails the convexity test.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Convex = the chord never dips below the graph = $f'' \\ge 0$ = convex epigraph = Hessian eigenvalues $\\ge 0$.",
            "A convex function has a single minimum, found where the gradient is zero.",
            "For non-convex or hard-to-prove cases use numerical methods: bracketing in 1-D, downhill simplex in many dimensions.",
          ],
          "One bowl, one bottom: that is convexity.",
        ),
      );
    },
  });
  Object.assign(S, { GR, NS, P2, caption, f3, nf, tbl, vadd, vdist, vmul, vsub });
})();
