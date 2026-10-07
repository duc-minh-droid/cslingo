/* algo-p3-x-06.js: deepened 3.12 bracketing (overflow) + 3.13 Brent (overflow) */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const { GR, brentRun, caption, curveScene, f3, goldenX, parab, retriple, tbl } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  /* ============ 3.12 Shrinking the bracket (deepened: algo-p3.js defines the module; we extend its lesson and renumber it) ============ */
  const BFK = (x) => 2.2 * Math.abs(x - 0.62) ** 1.4 + 0.25; // unimodal, kinked minimum at 0.62
  const moveMod = (id, order, num, extra) => {
    const m = N.modules.find((x) => x.id === id);
    if (!m) return;
    m.order = order;
    m.num = num;
    const r0 = m.render;
    m.render = function (root, life) {
      r0.call(this, root, life);
      const tk = root.querySelector(".takeaways");
      (extra || []).forEach((p) => root.insertBefore(predict(p), tk));
    };
  };
  const goldenWidths = [5, 10, 15, 29].map((n) => [`${n} steps`, n]);
  function goldenRunner(box, life) {
    F.run(box, life, {
      code: [
        "a < b < c with f(b) below f(a) and f(c)",
        "x goes 0.382 of the way into the larger part, measured from b",
        "evaluate f(x)",
        "keep the lowest point in the middle and its two neighbours",
        "repeat until c − a is small",
      ],
      build(stage) {
        return curveScene(stage, {
          f: BFK,
          x: [0, 1],
          y: [0.15, 1.55],
          pts: [
            ["a", "var(--violet)", "a"],
            ["b", "var(--teal)", "b"],
            ["c", "var(--violet)", "c"],
            ["x", "var(--amber)", "x"],
          ],
        });
      },
      *frames() {
        let t = { a: 0, b: GR, c: 1, fa: BFK(0), fb: BFK(GR), fc: BFK(1) };
        yield {
          t,
          x: null,
          cap: `<b>Start.</b> The triple (a, b, c) = (0, ${f3(t.b)}, 1) with f = ${f3(t.fa)}, ${f3(t.fb)}, ${f3(t.fc)}: the middle is lowest, so a minimum is bracketed. Width ${f3(t.c - t.a)}.`,
          line: 0,
        };
        for (let k = 1; k <= 8; k++) {
          const x = goldenX(t.a, t.b, t.c),
            fx = BFK(x),
            nt = retriple(t, x, fx),
            rightBig = t.c - t.b > t.b - t.a;
          yield {
            t,
            x,
            fx,
            cap: `<b>Step ${k}.</b> The larger part is [${rightBig ? "b, c" : "a, b"}], so put x there: x = ${f3(x)}, f(x) = ${f3(fx)}. Compare with f(b) = ${f3(t.fb)}.`,
            line: 1,
          };
          const cutLo = x > t.b ? (fx < t.fb ? t.a : x) : fx < t.fb ? t.b : t.a,
            cutHi = x > t.b ? (fx < t.fb ? t.b : t.c) : fx < t.fb ? t.c : x;
          yield {
            t: nt,
            x: null,
            cut: [cutLo, cutHi],
            cap: `New triple (${f3(nt.a)}, ${f3(nt.b)}, ${f3(nt.c)}): the bracket is now ${f3(nt.c - nt.a)} wide. One evaluation bought this cut.`,
            line: 3,
            ask:
              k <= 2
                ? {
                    q: "Which point becomes the new middle point b? Tap it.",
                    pick: ".cs-p",
                    a: [fx < t.fb ? "x" : "b"],
                    why:
                      fx < t.fb
                        ? "f(x) is below f(b), so x is the new lowest point and takes the middle."
                        : "f(x) is not below f(b), so b stays the lowest and x becomes a new end.",
                  }
                : null,
          };
          t = nt;
        }
        yield {
          t,
          x: null,
          cap: `<b>After 8 steps</b> the bracket is ${f3(t.c - t.a)} wide (0.618⁸ ≈ 0.02) and the minimum, at 0.62, is inside it. Total evaluations: 3 + 8 = 11.`,
          line: 4,
          mood: "happy",
        };
      },
      draw(s, f, c) {
        const t = f.t;
        s.place(c, "a", t.a, t.fa);
        s.place(c, "b", t.b, t.fb);
        s.place(c, "c", t.c, t.fc);
        s.place(c, "x", f.x == null ? null : f.x, f.fx);
        s.bracket(c, t.a, t.c);
        s.cutBox(c, ...(f.cut ? f.cut : [null]));
      },
    });
  }
  (function extendBracket() {
    const D = L["a3-bracket"];
    if (!D) return;
    const old = D.steps;
    D.sum =
      "No formula, no derivative, just the ability to evaluate the function. A bracket is a triple a < b < c with f(b) lowest; golden-section search adds one point per step at the 0.382 position and shrinks the bracket by 0.618 every time.";
    // prettier-ignore

    D.steps = [
      { t: "A bracket is a triple", b: `<p>To bracket a <b>minimum</b> of $f(x)$ you need three points $a<b<c$ with $f(a)>f(b)<f(c)$: the middle one is lower than both ends. Because $f$ comes down and then goes back up, there must be a minimum between $a$ and $c$.</p><p>Compare with a root bracket (two points, a sign change): a minimum needs three points, because one value is not enough to tell "down then up" from "just down".</p>`,
        v: F.plot([{ f: BFK, c: "teal" }], { x: [0, 1], h: 180, vlines: [[0.1, "a", "violet"], [0.45, "b", "teal"], [0.95, "c", "violet"]], marks: [[0.1, "", "violet"], [0.45, "lowest", "teal"], [0.95, "", "violet"]] }),
        c: { q: "Values at a < b < c are f(a), f(b), f(c). Which set brackets a minimum?", o: ["7, 3, 5", "3, 5, 7", "5, 7, 3"], a: 0, why: "You need the middle value strictly lowest: 7 > 3 < 5. In 3, 5, 7 the function only rises; in 5, 7, 3 the middle is a peak." } },
      old[0], old[1],
      { t: "Narrow the bracket: add one point", b: `<p>Each round, choose a new $x$ inside either $[a,b]$ or $[b,c]$, evaluate $f(x)$, and reassign the triple so it still brackets a minimum. The new $b$ is always whichever point has the lowest value.</p>${tbl(["x lies in", "f(x) vs f(b)", "New (a, b, c)"], [["(b, c)", "f(x) < f(b)", "(b, x, c)"], ["(b, c)", "f(x) ≥ f(b)", "(a, b, x)"], ["(a, b)", "f(x) < f(b)", "(a, x, b)"], ["(a, b)", "f(x) ≥ f(b)", "(x, b, c)"]])}<p>Stop when the bracket is narrow enough, or $f$ stops changing appreciably.</p>`,
        v: F.frames([{ t: "x right of b, lower: slide right", v: F.plot([{ f: BFK, c: "teal" }], { x: [0, 1], h: 130, w: 250, vlines: [[0.1, "a", "violet"], [0.4, "b", "violet"], [0.62, "x", "amber"], [0.95, "c", "violet"]] }) }, { t: "x right of b, higher: x is the new c", v: F.plot([{ f: BFK, c: "teal" }], { x: [0, 1], h: 130, w: 250, vlines: [[0.1, "a", "violet"], [0.45, "b", "violet"], [0.8, "x", "amber"]] }) }]),
        c: { q: "a < b < c, and x lies between b and c with f(x) ≥ f(b). What is the new triple?", o: ["(a, b, x)", "(b, x, c)", "(x, b, c)"], a: 0, why: "f(x) is not lower than f(b), so b stays the lowest and the minimum is left of x. x becomes the new right end; a and b stay." } },
      old[2],
      { t: "Where does 0.382 come from?", b: `<p>Take a bracket of width 1 with $b$ at distance $w$ from $a$. Put the new probe in the larger part, the same distance $w$ from the <i>far</i> end $c$. For the pattern to repeat in the smaller bracket we need $w$ to be the same fraction of what remains, which gives $w^2-3w+1=0$:</p><p>$$w=\\frac{3-\\sqrt5}{2}\\approx 0.382$$</p><p>So $b$ sits 0.382 from one end and 0.618 from the other (the golden ratio). Whichever side the next cut falls, the surviving probe is already at the right place for the smaller bracket.</p>`,
        v: `<svg class="fig" viewBox="0 0 520 120" style="max-height:120px"><line x1="30" y1="50" x2="490" y2="50" stroke="var(--line-2)" stroke-width="3"/><circle cx="30" cy="50" r="7" fill="var(--violet)"/><circle cx="206" cy="50" r="8" fill="var(--teal)"/><circle cx="314" cy="50" r="8" fill="var(--amber)"/><circle cx="490" cy="50" r="7" fill="var(--violet)"/>
          <text x="30" y="36" class="fig-sub">a</text><text x="206" y="36" class="fig-sub">b</text><text x="314" y="36" class="fig-sub">x</text><text x="490" y="36" class="fig-sub">c</text>
          <path d="M30 66 H206" stroke="var(--teal)" stroke-width="3"/><text x="118" y="88" class="fig-sub" style="fill:var(--teal)">0.382</text><path d="M314 66 H490" stroke="var(--amber)" stroke-width="3"/><text x="402" y="88" class="fig-sub" style="fill:var(--amber)">0.382</text><path d="M206 66 H314" stroke="var(--line-2)" stroke-width="3"/><text x="260" y="88" class="fig-sub">0.236</text><text x="260" y="110" class="fig-sub">larger part [b, c] = 0.618</text></svg>`,
        c: { q: "b sits 0.382 of the way from a to c. Where does the next probe x go?", o: ["Into the larger part [b, c], symmetric to b", "Into the smaller part [a, b], to be safe", "Exactly at the midpoint of [a, c]"], a: 0, why: "Probing the larger part gives the most information and keeps the pattern of the golden split. Mirror image of b in the bracket, at 0.618 from a." } },
      { t: "Golden section vs the alternatives", b: `<p>Per <b>function evaluation</b>, how fast does the bracket shrink?</p>${tbl(["Method", "Shrink factor", "Evaluations per cut", "Needs derivative?"], [["Bisection on f′", "0.5", "1 (of f′)", "yes"], ["Golden section", "0.618", "1 (reuses a probe)", "no"], ["Ternary (probes at thirds)", "0.667 per step, 0.82 per evaluation", "2", "no"]])}<p>After 10 evaluations of $f$: ternary has made 5 cuts, golden has made 10.</p>`,
        v: F.bars([["ternary", (2 / 3) ** 5, "rose"], ["golden", 0.618 ** 10, "teal"]], { max: 0.2, fmt: (v) => v.toFixed(3) }) + caption("Bracket width left after 10 evaluations of f (start width 1)"),
        c: { q: "Without derivatives, which shrinks the bracket most per function evaluation?", o: ["Golden section, ×0.618 per evaluation", "Ternary search, ×0.82 per evaluation", "They are identical in cost"], a: 0, why: "Ternary throws away 1/3 but pays 2 new evaluations per step (×0.67 per step ≈ ×0.82 per evaluation). Golden reuses a probe, so it pays 1 per step." } },
      { t: "Watch it run", b: `<p>Press <b>play</b> or step with the arrows. The shaded bar under the curve is the bracket; the red zone is the part thrown away.</p>`, v: (box, life) => goldenRunner(box, life) },
      { t: "When to stop", b: `<p>Converged when the bracket is <b>sufficiently narrow</b>, or the function value <b>does not change appreciably</b> from one iteration to the next. Each golden step multiplies the width by 0.618, so the number of steps is $\\ge \\ln(\\text{tol})/\\ln(0.618)$.</p><p>Near a smooth minimum $f$ is nearly flat (a parabola), so values closer than about $\\sqrt{\\varepsilon}\\approx10^{-8}$ of the true minimiser cannot be told apart in floating point. Asking for more precision than that is wasted work.</p>`,
        v: F.bars(goldenWidths.map(([l, n]) => [l, n, "violet", `width ≈ ${(0.618 ** n).toExponential(0)}`]), { max: 30, fmt: (v) => Math.round(v) }),
        c: { q: "Golden steps shrink a bracket of width 1 by 0.618 each. About how many steps give a width below 0.01?", o: ["5", "10", "20"], a: 1, hint: "0.618⁵ ≈ 0.09, and 0.09² ≈ 0.008.", why: "0.618¹⁰ ≈ 0.008 < 0.01, while 0.618⁹ ≈ 0.013 is still too wide. So 10 steps." } },
      { t: "Finding the first bracket", b: `<p>Sometimes you are given only a starting point. Walk downhill with growing steps (1, 2, 4, …) until $f$ rises again; the last three points form a bracket.</p><p>Values at $x=0,1,3,7$ are $9,5,3,4$: it fell, fell, then rose. The triple is $(1,3,7)$ because $5>3<4$.</p>`,
        v: F.plot([{ pts: [[0, 9], [1, 5], [3, 3], [7, 4], [10, 11]], c: "teal" }], { x: [0, 10], y: [0, 12], h: 170, marks: [[0, "9", "dim", 9], [1, "5", "violet", 5], [3, "3", "teal", 3], [7, "4", "violet", 4]] }),
        c: { q: "With steps that double, f at x = 0, 1, 3, 7 is 9, 5, 3, 4. Which triple brackets the minimum?", o: ["(1, 3, 7)", "(0, 1, 3)", "(3, 7, 15)"], a: 0, why: "A bracket needs a lower middle: f(1) = 5 > f(3) = 3 < f(7) = 4. In (0, 1, 3) the values only fall, so there is no guarantee." } },
    ];
    D.guide = [
      "Before each <b>Iterate</b>, compare the two purple probe heights and predict which end gets cut.",
      "Press <b>Iterate</b>. The discarded part fades to red and the bracket shrinks.",
      "Keep going until the width is under 0.01. How many steps did it take?",
      "Answer the questions after the demo about the triple update rule and the cost of ternary search.",
    ];
    // prettier-ignore

    moveMod("a3-bracket", 12, "3.12", [
      { id: "a3-br-2", q: "a = 0, b = 0.4, c = 1 bracket a minimum. You evaluate x = 0.6 and find f(0.6) < f(0.4). What is the new triple?", opts: ["(0.4, 0.6, 1)", "(0, 0.4, 0.6)", "(0, 0.6, 1)"], a: 0, why: "x is right of b and lower, so it is the new lowest point. The minimum lies right of b, so a moves up to b: (b, x, c)." },
      { id: "a3-br-3", q: "Ternary search (probes at 1/3 and 2/3, two evaluations per cut) and golden section both get 10 evaluations. Which ends with the narrower bracket?", opts: ["Golden section, about 0.008 wide", "Ternary search, about 0.13 wide", "Both, about 0.05"], a: 0, why: "Ternary makes 5 cuts of ×0.667 (≈ 0.13). Golden reuses a probe, so 10 evaluations give 10 cuts of ×0.618 (≈ 0.008)." },
    ]);
  })();
  /* ============ 3.13 Brent's parabola ============ */
  const EXPF = (x) => Math.exp(x) - 2 * x; // minimum at ln 2
  const QUART = (x) => x ** 4 - 3 * x * x + x + 3; // minimum near 1.1309
  const BRF = {
    exp: { n: "eˣ − 2x", f: EXPF, x: [0, 2.2], y: [0.4, 3.6], t: [0, 1, 2], min: Math.LN2 },
    kink: { n: "kinked dip", f: BFK, x: [0, 1], y: [0.15, 1.55], t: [0, GR, 1], min: 0.62 },
    quart: { n: "x⁴ − 3x² + x + 3", f: QUART, x: [0, 2.5], y: [1.5, 8], t: [0, 1.2, 2.5], min: 1.1309011 },
  };
  const lag = (t) => (xv) =>
    (t.fa * ((xv - t.b) * (xv - t.c))) / ((t.a - t.b) * (t.a - t.c)) +
    (t.fb * ((xv - t.a) * (xv - t.c))) / ((t.b - t.a) * (t.b - t.c)) +
    (t.fc * ((xv - t.a) * (xv - t.b))) / ((t.c - t.a) * (t.c - t.b));
  function hybridStep(f, t, last, pure) {
    let x = pure ? null : parab(t.a, t.b, t.c, t.fa, t.fb, t.fc),
      kind = "P",
      why = "";
    if (pure) {
      kind = "G";
    } else if (x === null) {
      kind = "G";
      why = "the three points are in a straight line";
    } else if (!(x > t.a && x < t.c)) {
      kind = "G";
      why = "the parabola's lowest point is outside the bracket";
    } else if (Math.abs(x - t.b) < 1e-9) {
      kind = "G";
      why = "the parabola's lowest point is already b";
    } else if (Math.abs(x - t.b) > 0.5 * last) {
      kind = "G";
      why = "the step is not shrinking fast enough";
    }
    if (kind === "G") x = goldenX(t.a, t.b, t.c);
    const fx = f(x);
    return { x, fx, kind, why, nt: retriple(t, x, fx), step: Math.abs(x - t.b) };
  }
  function brentSVG(d, t, show, W = 520, H = 230) {
    const pad = 18,
      [x0, x1] = d.x,
      [y0, y1] = d.y;
    const X = (v) => pad + ((v - x0) / (x1 - x0)) * (W - 2 * pad),
      Y = (v) => H - 34 - ((Math.max(y0 - 1, Math.min(y1 + 1, v)) - y0) / (y1 - y0)) * (H - 62);
    const crv = (g, n) =>
      Array.from({ length: n + 1 }, (_, i) => {
        const xv = x0 + ((x1 - x0) * i) / n;
        return `${i ? "L" : "M"}${X(xv).toFixed(1)} ${Y(g(xv)).toFixed(1)}`;
      }).join(" ");
    const dot = (x, c, lbl) =>
      `<line x1="${X(x)}" y1="${Y(d.f(x))}" x2="${X(x)}" y2="${H - 34}" stroke="${c}" stroke-dasharray="3 3"/><circle cx="${X(x)}" cy="${Y(d.f(x))}" r="6" fill="${c}" stroke="var(--bg-2)" stroke-width="2"/><text x="${X(x)}" y="${Y(d.f(x)) - 11}" class="fig-sub" style="fill:${c}">${lbl}</text>`;
    return `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:${H}px"><rect x="${X(t.a)}" y="${H - 20}" width="${Math.max(3, X(t.c) - X(t.a))}" height="9" rx="4.5" fill="var(--violet)" opacity=".6"/><line x1="${pad}" y1="${H - 34}" x2="${W - pad}" y2="${H - 34}" stroke="var(--line-2)"/>
      <path d="${crv(d.f, 160)}" fill="none" stroke="var(--teal)" stroke-width="3"/>${show.par ? `<path d="${crv(lag(t), 80)}" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-dasharray="6 4"/>` : ""}
      ${dot(t.a, "var(--violet)", "a")}${dot(t.b, "var(--teal)", "b")}${dot(t.c, "var(--violet)", "c")}${show.x != null ? dot(show.x, "var(--amber)", "x") : ""}</svg>`;
  }
  function brentRunner(box, life) {
    const d = BRF.kink,
      run = brentRun(d.f, d.t[0], d.t[1], d.t[2], 5e-4);
    F.run(box, life, {
      code: [
        "start with a bracket (a, b, c)",
        "fit a parabola through the three points",
        "jump to its lowest point x (if it is safe)",
        "otherwise take a golden-section step",
        "keep the lowest point as b, repeat",
      ],
      build(stage) {
        return curveScene(stage, {
          f: d.f,
          x: d.x,
          y: d.y,
          pts: [
            ["a", "var(--violet)", "a"],
            ["b", "var(--teal)", "b"],
            ["c", "var(--violet)", "c"],
            ["x", "var(--amber)", "x"],
          ],
        });
      },
      *frames() {
        const t0 = run.out[0].t;
        yield {
          t: t0,
          x: null,
          cap: `<b>Start.</b> Bracket (${f3(t0.a)}, ${f3(t0.b)}, ${f3(t0.c)}) with values ${f3(t0.fa)}, ${f3(t0.fb)}, ${f3(t0.fc)}. Evaluations so far: 3.`,
          line: 0,
        };
        let ev = 3,
          nP = 0,
          nG = 0;
        for (const o of run.out) {
          ev++;
          o.kind === "P" ? nP++ : nG++;
          const px = o.par != null ? o.par : null;
          yield {
            t: o.t,
            par: true,
            x: o.x,
            fx: o.fx,
            cap:
              o.kind === "P"
                ? `<b>Step ${o.k}: parabola.</b> The parabola through the three points bottoms out at x = ${f3(o.x)}. It is inside the bracket and the step (${f3(o.step)}) is shrinking, so jump there: f(x) = ${f3(o.fx)}.`
                : `<b>Step ${o.k}: golden section.</b> The parabola cannot be trusted (${o.why}), so take a golden step instead: x = ${f3(o.x)}, f(x) = ${f3(o.fx)}.`,
            line: o.kind === "P" ? 2 : 3,
            _px: px,
          };
          const lo = o.x > o.t.b ? (o.fx < o.t.fb ? o.t.a : o.x) : o.fx < o.t.fb ? o.t.b : o.t.a,
            hi = o.x > o.t.b ? (o.fx < o.t.fb ? o.t.b : o.t.c) : o.fx < o.t.fb ? o.t.c : o.x;
          yield {
            t: o.nt,
            par: false,
            x: null,
            cut: [lo, hi],
            cap: `New bracket (${f3(o.nt.a)}, ${f3(o.nt.b)}, ${f3(o.nt.c)}); the best point b has f = ${f3(o.nt.fb)}. Evaluations: ${ev}.`,
            line: 4,
            ask:
              o.k <= 2
                ? {
                    q: "Which point becomes the new middle point b? Tap it.",
                    pick: ".cs-p",
                    a: [o.fx < o.t.fb ? "x" : "b"],
                    why:
                      o.fx < o.t.fb
                        ? "f(x) is below f(b): x is the new lowest point."
                        : "f(x) is not below f(b), so b stays.",
                  }
                : null,
          };
        }
        const fin = run.t;
        yield {
          t: fin,
          par: false,
          x: null,
          cap: `<b>Done.</b> ${nP} parabolic and ${nG} golden steps (${ev} evaluations in all) pin the minimum at x ≈ ${f3(fin.b)}; the true minimiser is 0.620. Golden section alone would need about 15 steps to get the bracket under 0.001.`,
          line: 4,
          mood: "happy",
        };
      },
      draw(s, f, c) {
        const t = f.t;
        s.place(c, "a", t.a, t.fa);
        s.place(c, "b", t.b, t.fb);
        s.place(c, "c", t.c, t.fc);
        s.place(c, "x", f.x == null ? null : f.x, f.fx);
        s.bracket(c, t.a, t.c);
        s.cutBox(c, ...(f.cut ? f.cut : [null]));
        s.parabola(c, f.par ? t : null);
      },
    });
  }
  const accDigits = (() => {
    // digits of accuracy after 6 new evaluations on e^x - 2x
    const err = (x) => Math.max(Math.abs(x - Math.LN2), 1e-12),
      t0 = BRF.exp.t;
    let tb = { a: t0[0], b: t0[1], c: t0[2], fa: EXPF(t0[0]), fb: EXPF(t0[1]), fc: EXPF(t0[2]) },
      last = 2;
    for (let i = 0; i < 6; i++) {
      const s = hybridStep(EXPF, tb, last, false);
      tb = s.nt;
      last = s.step;
    }
    let tg = { a: t0[0], b: t0[1], c: t0[2], fa: EXPF(t0[0]), fb: EXPF(t0[1]), fc: EXPF(t0[2]) };
    for (let i = 0; i < 6; i++) {
      const s = hybridStep(EXPF, tg, 1, true);
      tg = s.nt;
    }
    return { brent: -Math.log10(err(tb.b)), golden: -Math.log10(err(tg.b)) };
  })();
  // prettier-ignore

  L["a3-brent"] = {
    sum: "Near a minimum a smooth function looks like a parabola. Brent's method fits a parabola through the bracket's three points and jumps to its lowest point, falling back to golden section whenever the jump looks unsafe.",
    steps: [
      { t: "Fit a parabola, jump to its bottom", b: `<p>Golden section ignores the <i>values</i> beyond comparing them. But three points and their heights define a unique parabola, and near a smooth minimum the function really does look like one. So: fit the parabola, and guess that the minimum is at the parabola's lowest point.</p>`,
        v: (() => { const t = { a: 0, b: 1, c: 2, fa: EXPF(0), fb: EXPF(1), fc: EXPF(2) }; return F.plot([{ f: EXPF, c: "teal" }, { f: lag(t), c: "amber", dash: "6 4" }], { x: [0, 2.2], y: [0.4, 3.6], h: 190, vlines: [[0, "a", "violet"], [1, "b", "violet"], [2, "c", "violet"]], marks: [[parab(0, 1, 2, t.fa, t.fb, t.fc), "x", "amber", lag(t)(parab(0, 1, 2, t.fa, t.fb, t.fc))]] }); })(),
        c: { q: "Why does fitting a parabola help find a minimum?", o: ["Near a smooth minimum f looks like a parabola with an easy-to-find bottom", "A parabola always passes exactly through the true minimum of f", "It removes the need to evaluate f after the first three points"], a: 0, why: "The fit uses three evaluations already paid for, and its vertex is a good guess when f is smooth. It is only a guess, which is why the bracket is kept." } },
      { t: "The formula", b: `<p>With $f(a), f(b), f(c)$ known, the parabola's lowest point is</p><p>$$x \\;=\\; b-\\frac12\\,\\frac{(b-a)^2\\,[f(b)-f(c)]-(b-c)^2\\,[f(b)-f(a)]}{(b-a)\\,[f(b)-f(c)]-(b-c)\\,[f(b)-f(a)]}$$</p><p>Worked example: $f(x)=x^2-4x+5$ with $a=0,\\,b=1,\\,c=5$, so $f=5,\\,2,\\,10$.</p>`,
        v: tbl(["Piece", "Working", "Value"], [["f(b) − f(c)", "2 − 10", "−8"], ["f(b) − f(a)", "2 − 5", "−3"], ["Numerator", "(1)²(−8) − (−4)²(−3) = −8 + 48", "40"], ["Denominator", "(1)(−8) − (−4)(−3) = −8 − 12", "−20"], ["x", "1 − ½ · (40 / −20) = 1 + 1", "2"]], 4),
        c: { q: "For f(x) = x² − 4x + 5 the formula returns x = 2 in a single step. Why exactly 2?", o: ["The data lie on a parabola, so its vertex is the true minimum", "The formula secretly does bisection and happens to land on 2", "2 happens to be f(b), the middle function value"], a: 0, why: "f is itself a parabola with its minimum at x = 2. Fitting a parabola to three points of a parabola recovers it exactly. For other functions the vertex is only an approximation." } },
      { t: "Update the triple", b: `<p>The new point $x$ is then used exactly like a golden probe. If $x$ is lower than $b$ it becomes the new middle and an old end moves in; if not, it replaces the nearer end. The minimum <b>stays bracketed</b>.</p>${tbl(["x is…", "f(x) vs f(b)", "New (a, b, c)"], [["right of b", "lower", "(b, x, c)"], ["right of b", "not lower", "(a, b, x)"], ["left of b", "lower", "(a, x, b)"], ["left of b", "not lower", "(x, b, c)"]])}`,
        v: F.frames([{ t: "x right of b, lower: (b, x, c)", v: F.plot([{ f: EXPF, c: "teal" }], { x: [0, 2.2], y: [0.4, 3.6], h: 130, w: 250, vlines: [[0, "a", "violet"], [0.5, "b", "violet"], [0.62, "x", "amber"], [2, "c", "violet"]] }) }, { t: "x left of b, not lower: (x, b, c)", v: F.plot([{ f: EXPF, c: "teal" }], { x: [0, 2.2], y: [0.4, 3.6], h: 130, w: 250, vlines: [[0, "a", "violet"], [0.2, "x", "amber"], [0.6, "b", "violet"], [2, "c", "violet"]] }) }]),
        c: { q: "x lies left of b and f(x) ≥ f(b). What is the new triple?", o: ["(x, b, c)", "(a, x, b)", "(a, b, x)"], a: 0, why: "b is still the lowest point, so it stays in the middle. x is left of b and not lower, so it replaces the old left end a." } },
      { t: "Watch it run", b: `<p>This function has a kink at the bottom, so the parabola is only a rough fit and the algorithm sometimes needs a golden step. The amber dashed curve is the parabola through the current triple.</p>`, v: (box, life) => brentRunner(box, life) },
      { t: "Safeguards: when not to trust the parabola", b: `<p>A parabola is only a guess, so Brent's method checks it before jumping:</p><ul><li>The new $x$ must lie <b>inside the bracket</b>. If not, the minimum may no longer be enclosed: switch to a golden step.</li><li>The step sizes must be <b>diminishing</b>. If they stall, the loop may never converge: switch to golden.</li><li>If the three points are in a straight line, the denominator is 0 and there is no parabola at all.</li></ul>`,
        v: F.flow(["Parabolic x", { t: "Inside (a, c)? Step shrinking?", c: "amber" }, { t: "yes: use x", c: "teal" }, { t: "no: golden step", c: "violet" }]),
        c: { q: "The parabola's lowest point falls outside the bracket [a, c]. What does Brent's method do?", o: ["Ignores it and takes a golden-section step", "Jumps to it anyway, as it is the best guess", "Stops, because the bracket has failed"], a: 0, why: "A point outside the bracket would lose the guarantee. The golden step is slower but always safe, so it is the fallback." } },
      { t: "Why bother: speed", b: `<p>Golden section is <b>linear</b>: a fixed ×0.618 per step. Parabolic steps are <b>superlinear</b> on smooth functions, roughly doubling the number of correct digits every couple of steps once close. Brent keeps the best of both: golden's guarantee and the parabola's speed.</p>`,
        v: F.bars([["parabolic (Brent)", accDigits.brent, "teal"], ["golden only", accDigits.golden, "violet"]], { max: 6, fmt: (v) => v.toFixed(1) }) + caption("Correct decimal digits of the minimiser of eˣ − 2x after 6 new evaluations, starting from (0, 1, 2)"),
        c: { q: "On a smooth function, what makes Brent's method faster than pure golden section?", o: ["Parabolic steps home in far faster than a fixed ×0.618 cut", "It evaluates f at fewer points when it first starts up", "It needs no initial bracket, so there is nothing to find first"], a: 0, why: "Golden shrinks the bracket by the same factor whatever f looks like. A parabola exploits the shape of f, which pays off near a smooth minimum." } },
      { t: "The family at a glance", b: `<p>All of these keep a bracket and need no more than values of $f$ (or $f'$ for bisection):</p>${tbl(["Method", "Finds", "Needs", "Speed"], [["Bisection", "root of g", "sign change", "×0.5 per evaluation"], ["Golden section", "minimum", "bracket (triple)", "×0.618 per evaluation"], ["Parabolic interpolation", "minimum", "smooth f", "superlinear, but can fail alone"], ["Brent's method", "minimum", "bracket (triple)", "parabola with golden safeguard"]])}<p>Brent's method is what many libraries use for one-dimensional minimisation.</p>`,
        v: F.flow([{ t: "Bracket a minimum (a, b, c)", c: "violet" }, "Parabola step", { t: "Safe? keep", c: "teal" }, { t: "Unsafe? golden", c: "amber" }]),
        c: { q: "Which method is a hybrid of two others?", o: ["Brent's method (parabolic + golden section)", "Bisection (halving + a parabola fit)", "Ternary search (thirds + golden section)"], a: 0, why: "Brent combines the fast parabolic jump with the safe golden-section step. Bisection and ternary search are single-idea methods." } },
    ],
    guide: ["Pick a function, then press <b>Step ▸</b> a few times. The amber dashed curve is the parabola through the current triple.", "Switch to <b>Golden only</b> and compare how many evaluations you need on the smooth function.", "Watch the log: steps marked <b>golden</b> are the safeguard kicking in."],
  };
  N.register({
    id: "a3-brent",
    subject: "algo",
    lecture: 3,
    order: 13,
    num: "3.13",
    title: "Brent's parabola trick",
    blurb: "Fit a parabola through the bracket, jump to its bottom, and fall back to golden section when it is unsafe.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let key = "exp",
        method = "brent",
        t,
        last,
        ev,
        logs;
      const init = () => {
        const d = BRF[key],
          x = d.t;
        t = { a: x[0], b: x[1], c: x[2], fa: d.f(x[0]), fb: d.f(x[1]), fc: d.f(x[2]) };
        last = x[2] - x[0];
        ev = 3;
        logs = [];
      };
      init();
      const card =
        el(`<div class="card"><div class="controls"><div id="fs"></div><div id="ms"></div></div><div class="controls"><button class="btn primary" id="it">Step ▸</button><button class="btn" id="run">Run 8 steps</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="cv"></div><div class="stat-row"><div class="stat violet"><small>Bracket width</small><b id="wd"></b></div><div class="stat teal"><small>Evaluations</small><b id="ev"></b></div><div class="stat amber"><small>Error of b</small><b id="er"></b></div></div><div class="mono dim" id="log" style="white-space:pre-line"></div></div>`);
      root.appendChild(card);
      qs("#fs", card).appendChild(
        N.seg(
          Object.keys(BRF).map((k) => [k, BRF[k].n]),
          key,
          (v) => {
            key = v;
            init();
            draw();
          },
        ),
      );
      qs("#ms", card).appendChild(
        N.seg(
          [
            ["brent", "Brent"],
            ["golden", "Golden only"],
          ],
          method,
          (v) => {
            method = v;
            init();
            draw();
          },
        ),
      );
      function draw() {
        const d = BRF[key];
        const px = method === "brent" ? parab(t.a, t.b, t.c, t.fa, t.fb, t.fc) : null;
        qs("#cv", card).innerHTML = brentSVG(d, t, { par: method === "brent" && px !== null, x: null });
        qs("#wd", card).textContent = (t.c - t.a).toFixed(4);
        qs("#ev", card).textContent = ev;
        const er = Math.abs(t.b - d.min);
        qs("#er", card).textContent = er < 1e-6 ? "< 1e-6" : er.toExponential(1);
        qs("#log", card).textContent = logs.slice(-5).join("\n");
        N.fx.play(qs("#cv", card));
      }
      const step = () => {
        if (t.c - t.a < 1e-6) return;
        const s = hybridStep(BRF[key].f, t, last, method === "golden");
        ev++;
        last = s.step;
        logs.push(
          `${s.kind === "P" ? "parabola" : "golden "} step: x = ${s.x.toFixed(4)}${s.why ? ` (${s.why})` : ""}`,
        );
        t = s.nt;
      };
      let stop = null;
      qs("#it", card).onclick = () => {
        step();
        draw();
      };
      qs("#run", card).onclick = () => {
        if (stop) return;
        let k = 0;
        stop = life.interval(() => {
          if (k++ >= 8) {
            stop();
            stop = null;
            return;
          }
          step();
          draw();
        }, 350);
      };
      qs("#rs", card).onclick = () => {
        if (stop) {
          stop();
          stop = null;
        }
        init();
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a3-brt-1",
          q: "Brent's method fits a parabola to three points that lie exactly on a parabola. How many parabolic steps until the vertex is the true minimum?",
          opts: ["One", "About ten", "It never gets there"],
          a: 0,
          why: "A parabola through three points of a parabola is that parabola, so its vertex is the minimum immediately. Real functions are only approximately parabolic, so several steps are needed.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-brt-2",
          q: "The three points f(a), f(b), f(c) happen to lie on a straight line. What happens in the formula?",
          opts: [
            "The denominator is zero: no parabola, so use a golden step",
            "It returns the midpoint of the bracket as its best guess",
            "It returns b unchanged, since the line is flat there",
          ],
          a: 0,
          why: "A straight line has no lowest point. The denominator (b−a)[f(b)−f(c)] − (b−c)[f(b)−f(a)] vanishes for collinear points, which is one of the cases where the golden fallback takes over.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Three points define a parabola; its lowest point is a fast guess at the minimum.",
            "Always keep the minimum bracketed: if the guess is outside the bracket or steps stop shrinking, take a golden step.",
            "Brent's method = parabolic speed + golden-section safety.",
          ],
          "Guess with a parabola, but never lose the bracket.",
        ),
      );
    },
  });
  Object.assign(S, { moveMod });
})();
