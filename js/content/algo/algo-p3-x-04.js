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
  const more = (h) => `<details class="math-more"><summary>Show the maths</summary>${h}</details>`;
  const fx1 = (v) => v.toFixed(1);
  /** Live figure: controls redraw one HTML string. specs: [key, "seg", options, value] or [key, "sl", label, min, max, step, value, fmt]. */
  // prettier-ignore
  const live = (box, specs, draw) => {
    const st = {},
      bar = el(`<div class="controls"></div>`),
      out = el(`<div class="fig-wrap"></div>`);
    const go = () => (out.innerHTML = draw(st));
    specs.forEach(([k, kind, ...a]) => {
      const seg = kind === "seg",
        c = seg ? N.seg(a[0], a[1], (v) => ((st[k] = v), go())) : N.slider(...a);
      st[k] = seg ? a[1] : a[4];
      if (!seg) c.onInput((v) => ((st[k] = v), go()));
      bar.appendChild(c);
    });
    box.append(bar, out);
    go();
  };
  /* tangent figures: curves with their slope and bend (step 2) or flat spots (step 5) */
  // prettier-ignore
  const TG = {
    sq: { n: "x²", f: (x) => x * x, d: (x) => 2 * x, e: () => 2, x: [-2, 2], y: [-0.5, 4.5] },
    cu: { n: "x³", f: (x) => x ** 3, d: (x) => 3 * x * x, e: (x) => 6 * x, x: [-2, 2], y: [-8, 8] },
    sn: { n: "sin x", f: Math.sin, d: Math.cos, e: (x) => -Math.sin(x), x: [-2, 2], y: [-1.5, 1.5] },
    bowl: { n: "a bowl", f: (x) => (x - 1) ** 2 + 0.5, d: (x) => 2 * (x - 1), e: () => 2, x: [-1, 3], y: [-0.5, 6] },
    wig: { n: "a wiggly curve", f: (x) => 0.3 * (x - 1) ** 2 + Math.sin(3 * x), d: (x) => 0.6 * (x - 1) + 3 * Math.cos(3 * x), e: (x) => 0.6 - 9 * Math.sin(3 * x), x: [-1, 3], y: [-1.5, 3.5] },
  };
  // prettier-ignore
  const tang = (keys, x0, note) => (box) =>
    live(box, [["f", "seg", keys.map((k) => [k, TG[k].n]), keys[0]], ["x", "sl", "point", ...TG[keys[0]].x, 0.1, x0, fx1]], (s) => {
      const g = TG[s.f], y = g.f(s.x), sl = g.d(s.x), [tone, msg] = note(sl, g.e(s.x));
      const line = { pts: [[s.x - 0.9, y - 0.9 * sl], [s.x + 0.9, y + 0.9 * sl]], c: "amber", width: 4 };
      return F.plot([{ f: g.f, c: "teal", dash: "0" }, line], { x: g.x, y: g.y, h: 190, marks: [[s.x, "", "amber", y]] }) + `<div class="callout ${tone}">${msg}</div>`;
    });
  /* convex-set figure: random strings between points of a shape; a string that leaves it is red */
  // prettier-ignore
  const bowlY = (x) => 150 - 100 * ((x - 150) / 140) ** 2,
    wigY = (x) => 105 + 38 * Math.sin((x - 10) / 22);
  // prettier-ignore
  const above = (yc) => `M10 6${Array.from({ length: 57 }, (_, i) => `L${10 + 5 * i} ${yc(10 + 5 * i)}`).join("")}L290 6z`;
  // prettier-ignore
  const circ = (cx, r) => `M${cx - r} 88a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  // prettier-ignore
  const SH = {
    disc: { n: "Disc", d: circ(150, 70), in: (x, y) => Math.hypot(x - 150, y - 88) < 70 },
    ring: { n: "Ring", d: circ(150, 70) + circ(150, 32), in: (x, y) => Math.hypot(x - 150, y - 88) < 70 && Math.hypot(x - 150, y - 88) > 32 },
    moon: { n: "Crescent", d: "M193.4 33.1A70 70 0 1 0 193.4 142.9A55 55 0 1 1 193.4 33.1z", in: (x, y) => Math.hypot(x - 150, y - 88) < 70 && Math.hypot(x - 190, y - 88) > 55 },
    bowl: { n: "Above a bowl", d: above(bowlY), in: (x, y) => y <= bowlY(x) },
    wig: { n: "Above a wiggly curve", d: above(wigY), in: (x, y) => y <= wigY(x) },
  };
  // prettier-ignore
  const setFig = (s) => {
    const d = SH[s.f];
    let seed = s.r * 7919, bad = 0;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pick = () => { let p; do p = [10 + 280 * rnd(), 6 + 158 * rnd()]; while (!d.in(...p)); return p; };
    const lines = Array.from({ length: 30 }, () => {
      const a = pick(), b = pick(), ok = Array.from({ length: 21 }, (_, i) => d.in(a[0] + ((b[0] - a[0]) * i) / 20, a[1] + ((b[1] - a[1]) * i) / 20)).every(Boolean);
      bad += !ok;
      return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="var(--${ok ? "teal" : "rose"})" stroke-width="2" opacity=".8"/>`;
    }).join("");
    return `<svg class="fig" viewBox="0 0 300 170" style="max-height:230px"><path d="${d.d}" fill="color-mix(in srgb, var(--blue) 18%, transparent)" fill-rule="evenodd" stroke="var(--blue)" stroke-width="3"/>${lines}</svg><div class="callout ${bad ? "rose" : "teal"}">${bad ? `<b>${bad} of 30</b> strings leave the shape: not convex.` : "All 30 strings stay inside: this shape is convex."}</div>`;
  };
  /* Hessian figure: how a surface bends along one direction */
  // prettier-ignore
  const HS = { bowl: [1, 0, 1, "Bowl"], saddle: [1, 0, -1, "Saddle"], tilt: [1, 1, 1, "Tilted bowl"], twist: [1, 3, 1, "Twisted"] };
  // prettier-ignore
  const hessFig = (s) => {
    const [a, b, c] = HS[s.f], r = (s.t * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
    const k = 2 * (a * co * co + b * co * si + c * si * si), low = a + c - Math.hypot(a - c, b);
    const compass = `<svg viewBox="-34 -34 68 68" width="84" height="84" style="flex:none"><circle r="30" fill="none" stroke="var(--line-2)" stroke-width="2"/><line x1="${-27 * co}" y1="${27 * si}" x2="${27 * co}" y2="${-27 * si}" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/></svg>`;
    const cut = F.plot([{ f: (u) => (k / 2) * u * u, c: k >= 0 ? "teal" : "rose", dash: "0" }], { x: [-2, 2], y: [-8, 8], h: 160, w: 380 });
    return `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">${compass}<div style="flex:1;min-width:240px">${cut}</div></div><div class="callout ${k > 0.05 ? "teal" : k < -0.05 ? "rose" : "amber"}">Walking in this direction, the ground bends <b>${k > 0.05 ? "up" : k < -0.05 ? "down" : "neither way"}</b> (bend ${nf(k)}).</div><div class="callout ${low >= -1e-9 ? "teal" : "rose"}">The sharpest downward bend in any direction is ${nf(Math.min(low, 0))}: ${low >= -1e-9 ? "no direction bends down, so it is convex." : "some direction bends down, so it is not convex."}</div>`;
  };
  // prettier-ignore

  L["a3-convex"] = {
    sum: "A convex function is one bowl: any local minimum is the global minimum. The chord test, the second derivative, convex sets, the epigraph and the Hessian are five ways to say the same thing.",
    steps: [
      { t: "One bowl, or many dips?", b: `<p>We want to <b>minimise</b> $y = f(\\mathbf{x})$ where $\\mathbf{x}$ has $D$ parameters. Some functions are friendly: one bowl, one bottom. Others have many dips, and a method can get stuck in the wrong one.</p><span class="key">A <b>convex</b> function has only one minimum, so it is relatively easy (and reliable) to find.</span>`,
        v: F.frames([{ t: "<b>Convex</b>: one minimum", v: F.plot([{ f: (x) => 0.6 + 2.4 * (x - 0.45) ** 2, c: "teal" }], { x: [0, 1], h: 150, marks: [[0.45, "the minimum", "amber"]] }) }, { t: "<b>Not convex</b>: several dips", v: F.plot([{ f: (x) => 1.2 + Math.sin(11 * x) * 0.6 + 0.8 * (x - 0.5) ** 2, c: "rose" }], { x: [0, 1], h: 150, marks: [[0.27, "local", "violet"], [0.83, "global?", "amber"]] }) }]),
        c: { q: "What is special about a convex function?", o: ["Every local minimum is also the global minimum", "It has no minimum at all", "It always looks exactly like a parabola"], a: 0, why: "One bowl means there is nowhere else to get stuck. Parabolas are convex, but so are |x|, eˣ and x⁴." } },
      { t: "The chord test (Jensen)", b: `<p>Try this with a rubber band. Pin it to two points on the curve and pull it tight. On a <b>bowl</b> the band always sits above the curve. On a curve with a hump in the middle, the band can dip <i>under</i> the curve.</p><p>Example with y = x²: pin the band at x = −1 (height 1) and x = 3 (height 9). Halfway between, at x = 1, the band is at height 5 but the curve is only at 1. The band is above, as a bowl demands.</p><span class="key">If the band never dips below the curve, however you pin it, the function is convex.</span>${more(`<p>The band is the <b>chord</b> (secant). For any two points $x_1, x_2$ and any weight $0 < t < 1$, $f$ is convex when</p><p>$$t\\,f(x_1) + (1-t)\\,f(x_2) \\;\\ge\\; f\\big(t x_1 + (1-t) x_2\\big)$$</p><p>The left side is the height of the chord, the right side the height of the curve. For $f(x)=x^2$, $x_1=-1$, $x_2=3$, $t=\\tfrac12$: the chord height is $(1+9)/2 = 5$, the curve is $f(1)=1$.</p><p class="faint">The lecture writes a strict &gt;; with &ge; you also allow flat chords, like those of $|x|$.</p>`)}`,
        v: (box) => live(box, [["f", "seg", [["sq", "x²"], ["dw", "x⁴ − 2x²"]], "sq"], ["a", "sl", "left pin", -2, 2, 0.1, -1.5, fx1], ["b", "sl", "right pin", -2, 2, 0.1, 1.2, fx1]], (s) => { const d = CVX[s.f], ok = (d.f(s.a) + d.f(s.b)) / 2 >= d.f((s.a + s.b) / 2) - 1e-9; return chordSVG(d, s.a, s.b, 0.5) + `<div class="callout ${ok ? "teal" : "rose"}">${ok ? "At the midpoint the band is above the curve." : "The band dips <b>below</b> the curve: not convex."}</div>`; }),
        c: { q: "A band pinned at two points of a curve dips below the curve between them. What does that tell you?", o: ["The two pins were too close together", "The curve is not convex", "The curve is convex with a flat bottom"], a: 1, why: "On a convex curve the band never dips below it, wherever you pin it. One dip is enough to show the curve is not convex. A flat bottom is fine: the band just touches it." } },
      { t: "Second derivative: bending upwards", b: `<p>Walk along the curve from left to right and watch the <b>slope</b>, how steeply it climbs. On a bowl the slope keeps growing: steeply down, then flat, then steeply up. The curve turns upwards the whole way, like a smile. Where the slope starts <i>shrinking</i> the curve bends down, like a frown, and it is not a bowl there.</p><p>Slide the point below. The cube x³ is a frown left of zero and a smile right of zero, so it only counts as a bowl on the right-hand side.</p>${more(`<p>For a smooth function of one variable the test is $\\dfrac{d^2 f}{dx^2} \\ge 0$ for every $x$ in the set $X$ you care about: the slope only ever increases.</p><p>Watch the phrase <b>on $X$</b>: $x^3$ has $f''=6x$, negative for $x \\lt 0$, so it is not convex on all of $\\mathbb{R}$, but it <i>is</i> convex on $x \\ge 0$.</p>${tbl(["f(x)", "f″(x)", "Convex on?"], [["x²", "2", "everywhere"], ["x⁴", "12x² ≥ 0", "everywhere"], ["eˣ", "eˣ > 0", "everywhere"], ["x³", "6x", "only x ≥ 0"], ["sin x", "−sin x", "nowhere on all of ℝ"]])}`)}`,
        v: tang(["sq", "cu", "sn"], -1.2, (sl, be) => be > 0.05 ? ["teal", `Slope ${nf(sl)}, and it is <b>growing</b> here: the curve bends up, like a smile.`] : be < -0.05 ? ["rose", `Slope ${nf(sl)}, and it is <b>shrinking</b> here: the curve bends down, like a frown.`] : ["amber", `Slope ${nf(sl)}: the bend flips between up and down at this point.`]),
        c: { q: "A curve bends down to the left of zero and up to the right of zero, like x³. Where can you treat it as a bowl?", o: ["Everywhere, since part of it bends up", "Nowhere, since part of it bends down", "Only to the right of zero"], a: 2, why: "Convexity is about the stretch you look at. Right of zero the curve only bends up, so it is a bowl there. Including the left side breaks it." } },
      { t: "Convex sets and the epigraph", b: `<p>A shape is <b>convex</b> if a straight piece of string between any two of its points stays inside it. A disc passes. A crescent or a ring fails: some pairs of points have a string that leaves the shape.</p><p>Press the shapes below. Each line joins two random points inside the shape: green stays inside, red escapes. The last two shapes are everything <i>above</i> a graph (its <b>epigraph</b>). Above a bowl no string escapes; above a wiggly curve some do. That is the link:</p><span class="key">A function is convex exactly when the region above its graph is a convex shape.</span>${more(`<p>A set $C$ is convex when $\\theta x_1 + (1-\\theta)x_2 \\in C$ for all $x_1, x_2 \\in C$ and $0\\le\\theta\\le1$. The epigraph is $\\operatorname{epi} f = \\{(x,u) : u \\ge f(x)\\}$, and $f$ is convex exactly when $\\operatorname{epi} f$ is a convex set.</p>`)}`,
        v: (box) => live(box, [["f", "seg", Object.entries(SH).map(([k, v]) => [k, v.n]), "moon"], ["r", "sl", "new random lines", 1, 9, 1, 1]], setFig),
        c: { q: "Which of these shapes is NOT a convex set?", o: ["A ring with a hole in the middle", "A solid square including its border", "A solid disc"], a: 0, why: "Pick two points on opposite sides of the ring: the straight line between them crosses the hole, which is not in the set." } },
      { t: "Many dimensions: the Hessian", b: `<p>On a curve there is one way to bend. On a surface you can look in every compass direction, and each direction has its own bend. The surface is a bowl only if <b>every</b> direction bends up. A saddle, like a mountain pass, bends up along the path and down across it.</p><p>Turn the direction below. The lecture packs all these bends into one table of second derivatives, the <b>Hessian</b>. Its eigenvalues are the bends along the main directions, so the surface is convex when none of them is negative.</p>${more(`<p>The Hessian matrix $H$ holds all the second derivatives $\\partial^2 f/\\partial x_i\\partial x_j$. The test: $f$ is convex on $X$ iff <b>all eigenvalues of $H$ are non-negative</b> for every $\\mathbf{x}\\in X$.</p><p>Eigenvalues are the curvature along the principal directions. A negative one means the surface curves <i>down</i> in some direction: a saddle or a hilltop, not a bowl.</p>${tbl(["f(x, y)", "Hessian", "Eigenvalues", "Convex?"], [["x² + y²", "[[2, 0], [0, 2]]", "2, 2", "yes"], ["x² + xy + y²", "[[2, 1], [1, 2]]", "3, 1", "yes"], ["x² − y²", "[[2, 0], [0, −2]]", "2, −2", "no: saddle"], ["x² + 3xy + y²", "[[2, 3], [3, 2]]", "5, −1", "no"]])}`)}`,
        v: (box) => live(box, [["f", "seg", Object.entries(HS).map(([k, v]) => [k, v[3]]), "saddle"], ["t", "sl", "direction", 0, 175, 5, 0, (v) => v + "°"]], hessFig),
        c: { q: "Looking north to south a surface bends up, but looking east to west it bends down. Is it convex there?", o: ["Yes: it bends up in at least one direction", "No: one downward direction is enough", "Yes: the up and down bends cancel out"], a: 1, why: "Convex needs every direction to bend up. One direction bending down makes a saddle, and a saddle is not a bowl." } },
      { t: "Why we care: gradient = 0", b: `<p>At the very bottom of a bowl the ground is flat. So finding the lowest point of a bowl means finding where the slope is zero. Drag the point below: negative slope, step right; positive slope, step left; zero, stop.</p><p>Careful: that only works for a bowl. On a wiggly curve the ground is also flat on hilltops and in small dips, so flat does not always mean lowest.</p><p>Finding where something equals zero is <b>root finding</b>, the next lesson (bisection). When the function is not convex, or proving convexity is awkward, we fall back on numerical methods that only <i>evaluate</i> it: <b>bracketing</b> in one dimension and the <b>downhill simplex</b> in many.</p>${more(`<p>For a convex, differentiable $f(x)$ the minimum $x^*$ is exactly where the gradient vanishes: $\\dfrac{df}{dx}=0$. So <b>minimising a convex function is the same as finding a root of its derivative</b>.</p>`)}`,
        v: tang(["bowl", "wig"], -0.5, (sl, be) => Math.abs(sl) < 0.15 ? ["amber", be > 0 ? "Slope ≈ 0: flat ground at the bottom of a dip. On a bowl this is the answer." : "Slope ≈ 0: flat ground, but this is the top of a hill, not a minimum."] : sl < 0 ? ["violet", `Slope ${nf(sl)}: the ground falls to the right. Step right.`] : ["violet", `Slope ${nf(sl)}: the ground falls to the left. Step left.`]),
        c: { q: "You stand on a smooth convex curve and the slope under you is positive, rising to the right. Where is the minimum?", o: ["To your right", "To your left", "Right under you"], a: 1, why: "The ground rises to your right, so it falls to your left. On a convex curve there is only one bottom, and it lies downhill." } },
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
  Object.assign(S, { GR, NS, P2, caption, f3, live, more, nf, tbl, vadd, vdist, vmul, vsub });
})();
