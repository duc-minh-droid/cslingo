/* algo-p3-x-05.js: 3.11 bisection (overflow) */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const { GR, NS, caption, f3, live, more, nf, tbl } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  /** Bisection on g over [a, b] (needs a sign change). */
  function bisect(g, a, b, steps) {
    const rows = [];
    let ga = g(a);
    for (let k = 0; k < steps; k++) {
      const m = (a + b) / 2,
        gm = g(m),
        same = Math.sign(gm) === Math.sign(ga);
      rows.push({ a, b, m, gm, width: b - a, keepRight: same });
      if (same) {
        a = m;
        ga = gm;
      } else b = m;
    }
    return { rows, a, b };
  }
  /** Vertex of the parabola through (a, fa), (b, fb), (c, fc): the lecture's formula. */
  function parab(a, b, c, fa, fb, fc) {
    const num = (b - a) ** 2 * (fb - fc) - (b - c) ** 2 * (fb - fa),
      den = (b - a) * (fb - fc) - (b - c) * (fb - fa);
    return den === 0 ? null : b - (0.5 * num) / den;
  }
  /** Golden placement of the next probe inside the larger sub-interval of the triple (a, b, c). */
  const goldenX = (a, b, c) => (c - b > b - a ? b + GR * (c - b) : b - GR * (b - a));
  /** Reassign (a, b, c) after evaluating x, keeping f(b) the lowest. */
  function retriple(t, x, fx) {
    let { a, b, c, fa, fb, fc } = t;
    if (x > b) {
      if (fx < fb) {
        a = b;
        fa = fb;
        b = x;
        fb = fx;
      } else {
        c = x;
        fc = fx;
      }
    } else {
      if (fx < fb) {
        c = b;
        fc = fb;
        b = x;
        fb = fx;
      } else {
        a = x;
        fa = fx;
      }
    }
    return { a, b, c, fa, fb, fc };
  }
  /** Brent-style hybrid: parabolic step when it stays inside (a, c) and the steps are shrinking; golden otherwise. */
  function brentRun(f, a, b, c, tol, maxN = 40) {
    let t = { a, b, c, fa: f(a), fb: f(b), fc: f(c) },
      last = c - a;
    const out = [];
    for (let k = 0; k < maxN; k++) {
      let x = parab(t.a, t.b, t.c, t.fa, t.fb, t.fc),
        kind = "P",
        why = "";
      if (x === null) {
        kind = "G";
        why = "the three points are in a straight line, so the formula divides by zero";
      } else if (!(x > t.a && x < t.c)) {
        kind = "G";
        why = "the parabola's lowest point falls outside the bracket";
      } else if (Math.abs(x - t.b) < 1e-9) {
        kind = "G";
        why = "the parabola's lowest point is already at b";
      } else if (Math.abs(x - t.b) > 0.5 * last) {
        kind = "G";
        why = "the step is not shrinking fast enough";
      }
      const par = kind === "P" ? x : null;
      if (kind === "G") x = goldenX(t.a, t.b, t.c);
      const step = Math.abs(x - t.b),
        fx = f(x),
        nt = retriple(t, x, fx);
      out.push({ k: k + 1, t, x, fx, nt, kind, why, par, step });
      t = nt;
      last = step;
      if (step < tol) break;
    }
    return { out, t };
  }
  /* ================= figure builders ================= */
  /** Curve scene for runners: persistent curve, bracket bar, cut region, parabola and named probe points. */
  function curveScene(stage, { f, x: [x0, x1], y: [y0, y1], w = 560, h = 240, zero = false, pts }) {
    const pad = { l: 14, r: 14, t: 20, b: 34 };
    const X = (v) => pad.l + ((v - x0) / (x1 - x0)) * (w - pad.l - pad.r),
      Y = (v) => pad.t + (1 - (v - y0) / (y1 - y0)) * (h - pad.t - pad.b);
    const curve = Array.from({ length: 161 }, (_, i) => {
      const xv = x0 + ((x1 - x0) * i) / 160;
      return `${i ? "L" : "M"}${X(xv).toFixed(1)} ${Y(Math.max(y0 - 1, Math.min(y1 + 1, f(xv)))).toFixed(1)}`;
    }).join(" ");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("class", "fig rn-svg");
    svg.style.maxHeight = h + "px";
    const base = h - pad.b;
    svg.innerHTML = `<rect class="cs-cut" x="0" y="${pad.t}" width="0" height="${base - pad.t}" fill="var(--rose-dim)" opacity="0"/>
      <line x1="${pad.l}" y1="${base}" x2="${w - pad.r}" y2="${base}" stroke="var(--line-2)"/>
      ${zero ? `<line x1="${pad.l}" y1="${Y(0)}" x2="${w - pad.r}" y2="${Y(0)}" stroke="var(--line-2)" stroke-dasharray="4 4"/><text x="${w - pad.r - 4}" y="${Y(0) - 6}" style="text-anchor:end" class="fig-sub">g = 0</text>` : ""}
      <path class="cs-par" d="" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-dasharray="6 4" opacity="0"/>
      <path d="${curve}" fill="none" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>
      <rect class="cs-br" x="${pad.l}" y="${base + 8}" width="0" height="9" rx="4.5" fill="var(--violet)" opacity=".6"/>
      ${pts.map(([k, colr, lab]) => `<g class="cs-p rs-p" data-k="${k}" opacity="0"><line x1="0" y1="0" x2="0" y2="40" stroke="${colr}" stroke-dasharray="3 3"/><circle class="rn-halo" r="14" fill="none" stroke-width="3" opacity="0"/><circle r="7" fill="${colr}" stroke="var(--bg-2)" stroke-width="2"/><text y="-13" class="fig-sub" style="fill:${colr}">${lab}</text></g>`).join("")}`;
    stage.appendChild(svg);
    const q = (s) => svg.querySelector(s);
    return {
      svg,
      X,
      Y,
      base,
      pad,
      w,
      h,
      y0,
      y1,
      f,
      pt: (k) => q(`.cs-p[data-k="${k}"]`),
      bar: q(".cs-br"),
      cut: q(".cs-cut"),
      par: q(".cs-par"),
      place(c, k, x, fx, label) {
        const g = this.pt(k);
        if (x == null) {
          F.rn.to(c, g, { opacity: 0 }, 0, 0.2);
          return;
        }
        F.rn.to(c, g, { x: X(x), y: Y(fx), opacity: 1 });
        g.querySelector("line").setAttribute("y2", Math.max(0, base - Y(fx)));
        if (label != null) g.querySelector("text").textContent = label;
      },
      bracket(c, a, b) {
        F.rn.to(c, this.bar, { attr: { x: X(a), width: Math.max(3, X(b) - X(a)) } });
      },
      cutBox(c, lo, hi) {
        if (lo == null) {
          F.rn.to(c, this.cut, { opacity: 0 }, 0, 0.2);
          return;
        }
        this.cut.setAttribute("x", X(lo));
        this.cut.setAttribute("width", Math.max(1, X(hi) - X(lo)));
        F.rn.to(c, this.cut, { opacity: 1 }, 0, 0.3);
      },
      parabola(c, t) {
        if (!t) {
          F.rn.to(c, this.par, { opacity: 0 }, 0, 0.2);
          return;
        }
        const q2 = (xv) =>
          (t.fa * ((xv - t.b) * (xv - t.c))) / ((t.a - t.b) * (t.a - t.c)) +
          (t.fb * ((xv - t.a) * (xv - t.c))) / ((t.b - t.a) * (t.b - t.c)) +
          (t.fc * ((xv - t.a) * (xv - t.b))) / ((t.c - t.a) * (t.c - t.b));
        this.par.setAttribute(
          "d",
          Array.from({ length: 81 }, (_, i) => {
            const xv = x0 + ((x1 - x0) * i) / 80;
            return `${i ? "L" : "M"}${X(xv).toFixed(1)} ${Y(Math.max(y0 - 1, Math.min(y1 + 1, q2(xv)))).toFixed(1)}`;
          }).join(" "),
        );
        F.rn.to(c, this.par, { opacity: 1 }, 0, 0.3);
      },
    };
  }
  /* ============ 3.11 Bracketing a root: bisection ============ */
  const GB = (x) => x ** 3 - x - 2; // root 1.5214 on [1, 2]
  const BIS = {
    cub: { n: "x³ − x − 2", g: GB, a: 1, b: 2, y: [-3, 5], x: [0.8, 2.2], note: "" },
    cos: { n: "cos x − x", g: (x) => Math.cos(x) - x, a: 0, b: 1, y: [-1.2, 1.2], x: [-0.1, 1.1], note: "" },
    sq2: { n: "x² − 2", g: (x) => x * x - 2, a: 0, b: 2, y: [-2.5, 2.5], x: [-0.1, 2.1], note: "" },
    pole: { n: "1 / (x − 0.4)", g: (x) => 1 / (x - 0.4), a: 0, b: 1, y: [-6, 6], x: [-0.05, 1.05], note: "pole" },
  };
  function rootSVG(d, a, b, m, W = 520, H = 220) {
    const pad = 22,
      [x0, x1] = d.x,
      [y0, y1] = d.y;
    const X = (v) => pad + ((v - x0) / (x1 - x0)) * (W - 2 * pad),
      Y = (v) => H - 30 - ((Math.max(y0, Math.min(y1, v)) - y0) / (y1 - y0)) * (H - 56);
    const pts = Array.from({ length: 241 }, (_, i) => {
      const xv = x0 + ((x1 - x0) * i) / 240;
      return [xv, d.g(xv)];
    });
    const path = pts
      .map(
        (p, i) =>
          `${i && Math.abs(p[1] - pts[i - 1][1]) < y1 - y0 ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`,
      )
      .join(" ");
    const mark = (x, c, lbl) =>
      `<line x1="${X(x)}" y1="${Y(d.g(x))}" x2="${X(x)}" y2="${Y(0)}" stroke="${c}" stroke-dasharray="3 3"/><circle cx="${X(x)}" cy="${Y(d.g(x))}" r="6" fill="${c}"/><text x="${X(x)}" y="${Y(d.g(x)) + (d.g(x) > 0 ? -12 : 20)}" class="fig-sub" style="fill:${c}">${lbl}</text>`;
    return `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:${H}px"><rect x="${X(a)}" y="${H - 18}" width="${Math.max(3, X(b) - X(a))}" height="9" rx="4.5" fill="var(--violet)" opacity=".6"/>
      <line x1="${pad}" y1="${Y(0)}" x2="${W - pad}" y2="${Y(0)}" stroke="var(--line-2)"/><path d="${path}" fill="none" stroke="var(--teal)" stroke-width="3"/>${mark(a, "var(--violet)", "a")}${mark(b, "var(--violet)", "b")}${m != null ? mark(m, "var(--amber)", "m") : ""}</svg>`;
  }
  const bisRows = bisect(GB, 1, 2, 6).rows;
  // prettier-ignore
  const sweepFig = (box) => live(box, [["f", "seg", ["cub", "cos", "sq2"].map((k) => [k, BIS[k].n]), "cub"], ["p", "sl", "walker", 0, 1, 0.01, 0.5, (v) => Math.round(v * 100) + "%"]], (s) => {
    const d = BIS[s.f], m = d.a + (d.b - d.a) * s.p, side = (x) => (d.g(x) < 0 ? "below" : "above"), crossed = side(m) !== side(d.a);
    return rootSVG(d, d.a, d.b, m) + `<div class="callout ${crossed ? "teal" : "violet"}">The start (a) is ${side(d.a)} zero and the end (b) is ${side(d.b)}. The walker (m) is ${side(m)} zero: ${crossed ? "it has <b>already crossed</b> zero somewhere behind it." : "it has not crossed yet, so the crossing is still ahead."}</div>`;
  });
  /** Six bisection cuts as rows: each bracket, the dot at its middle (green above zero, red below), the half thrown away in red. */
  // prettier-ignore
  const ladder = () => {
    const { rows, a, b } = bisect(GB, 1, 2, 6), all = [...rows, { a, b, m: null }], X = (v) => 70 + (v - 1) * 360;
    const row = (r, i) => { const y = 24 + 28 * i, gone = r.keepRight ? [r.a, r.m] : [r.m, r.b];
      return `<g class="fi"><text x="6" y="${y + 9}" class="fig-sub" style="text-anchor:start">${i ? "cut " + i : "start"}</text><rect x="${X(r.a)}" y="${y}" width="${X(r.b) - X(r.a)}" height="11" rx="5" fill="var(--violet)" opacity=".6"/>${r.m == null ? "" : `<rect x="${X(gone[0])}" y="${y}" width="${X(gone[1]) - X(gone[0])}" height="11" fill="var(--rose)" opacity=".4"/><circle cx="${X(r.m)}" cy="${y + 5.5}" r="6" fill="var(--${r.gm > 0 ? "teal" : "rose"})" stroke="var(--bg-2)" stroke-width="2"/>`}<text x="514" y="${y + 9}" class="fig-sub" style="text-anchor:end">width ${nf(r.b - r.a, 3)}</text></g>`; };
    return `<svg class="fig" viewBox="0 0 520 ${28 * all.length + 30}" style="max-height:260px"><line x1="${X(1.5214)}" y1="12" x2="${X(1.5214)}" y2="${28 * all.length + 20}" stroke="var(--amber)" stroke-width="2.5" stroke-dasharray="4 3"/><text x="${X(1.5214)}" y="9" class="fig-sub" style="fill:var(--amber-ink,var(--amber))">root</text>${all.map(row).join("")}</svg>` + caption("Purple: the bracket. Red part: thrown away. Dot: green if g is above zero at the middle, red if below.");
  };
  // prettier-ignore
  const halvFig = (s) => {
    const n = Math.ceil(s.d * Math.log2(10));
    return `<div class="stat-row"><div class="stat violet"><small>halvings</small><b>${n}</b></div><div class="stat amber"><small>width left (start 1)</small><b>${(2 ** -n).toExponential(1)}</b></div><div class="stat"><small>points to try one by one</small><b>${(10 ** s.d).toLocaleString("en-GB")}</b></div></div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:10px">${Array.from({ length: n }, () => `<span style="width:14px;height:14px;border-radius:4px;background:var(--violet);opacity:.6"></span>`).join("")}</div>`;
  };
  const f1 = (x) => Math.exp(x) - 2;
  // prettier-ignore
  const minFig = (s) => {
    const { a, b } = bisect(f1, 0, 1, s.k);
    return `<div class="fig-cap">The curve f: its lowest point (orange)</div>` + F.plot([{ f: (x) => Math.exp(x) - 2 * x, c: "teal", dash: "0" }], { x: [0, 1.2], y: [0.4, 1.2], h: 150, vlines: [[a, "a", "violet"], [b, "b", "violet"]], marks: [[Math.LN2, "", "amber"]] })
      + `<div class="fig-cap">Its slope: the lowest point is where the slope crosses zero</div>` + rootSVG({ g: f1, x: [0, 1.2], y: [-1.2, 1.2] }, a, b, null, 520, 150)
      + `<div class="callout violet">At a the ground is ${f1(a) < 0 ? "falling" : "rising"} (slope ${nf(f1(a))}), at b it is ${f1(b) < 0 ? "falling" : "rising"} (slope ${nf(f1(b))}), so the lowest point is trapped in a bracket of width ${nf(b - a, 3)}. The true value is 0.693.</div>`;
  };
  // prettier-ignore

  L["a3-bisect"] = {
    sum: "To find where g(x) = 0 you only need a sign change. Bisection keeps a bracket [a, b] with g(a) and g(b) of opposite signs and halves it every step. Minimising a convex function is the same job applied to its derivative.",
    steps: [
      { t: "A root is bracketed by a sign change", b: `<p>Picture a path that starts below sea level and ends above it. You cannot get from one side to the other without stepping on sea level somewhere: no teleporting. That is all a bracket is, two points where the curve sits on opposite sides of zero.</p><p>Example: g(1) = −2 is below zero and g(2) = 4 is above, so somewhere between 1 and 2 the curve is exactly zero. This does not say <i>where</i>; finding that is the job of the search. Slide the walker along the curve below.</p>${more(`<p>A root of $g(x)$ is <b>bracketed</b> by $a$ and $b$ if $g(a) \\lt 0$ and $g(b) \\gt 0$, or $g(a) \\gt 0$ and $g(b) \\lt 0$. A continuous curve cannot get from below zero to above zero without crossing it, so there must be a <b>zero-crossing</b> between $a$ and $b$.</p>`)}`,
        v: (box) => sweepFig(box),
        c: { q: "g is continuous with g(1) = −2 and g(2) = 4. What do you know?", o: ["The root is exactly at 1.5", "There is no root, since the values differ so much", "A root lies somewhere between 1 and 2"], a: 2, why: "The sign change guarantees at least one zero-crossing in [1, 2]. It does not say where; that is what the search is for." } },
      { t: "Bisection: cut the bracket in half", b: `<p>Bisection is the game of guessing a number with "higher or lower", played on a curve. Look at the middle of the bracket and ask which side of zero the curve is on. The root hides in the half whose two ends are on <b>opposite</b> sides of zero, so throw the other half away. Then do it again.</p><p>Example: g(x) = x³ − x − 2 between 1 (below zero) and 2 (above). The middle, 1.5, is still below zero (−0.125), so the root is in [1.5, 2]. The next middle, 1.75, is above zero, so the root is in [1.5, 1.75]. Each row of the picture is half as wide as the one above, and the root (orange line) never escapes.</p>${more(`<p>Each step: take the midpoint $m=(a+b)/2$, evaluate $g(m)$, and move <b>the end that has the same sign as $g(m)$</b> up to $m$. The bracket still has a sign change, but is half as wide.</p><p>Worked example: $g(x)=x^3-x-2$ on $[1,2]$, where $g(1)=-2$ and $g(2)=4$.</p>${tbl(["Step", "a", "b", "m", "g(m)", "Move"], bisRows.map((r, i) => [i + 1, f3(r.a), f3(r.b), f3(r.m), (r.gm >= 0 ? "+" : "") + f3(r.gm), r.keepRight ? `a → ${f3(r.m)}` : `b → ${f3(r.m)}`]))}`)}`,
        v: ladder(),
        c: { q: "At the midpoint the curve is below zero, and it was also below zero at the left end. Where is the root?", o: ["In the left half, since both ends match", "In the right half, where the sign flips", "Exactly at the midpoint"], a: 1, why: "The root is in the half whose ends are on opposite sides of zero. Left end and midpoint are both below zero, so the sign flips between the midpoint and the right end." } },
      { t: "Watch it run", b: `<p>Press <b>play</b>, or step with the arrows. Before each cut, guess which end moves. The red zone is the half that gets thrown away.</p>`, v: (box, life) => bisectRun(box, life) },
      { t: "How many halvings?", b: `<p>Each question in "higher or lower" halves what is left, like folding a sheet of paper. Ten folds and a 1-metre bracket is about a millimetre. Every halving buys exactly one more binary digit of the answer, whatever the function looks like.</p><p>Roughly <b>3.3 halvings per decimal digit</b>, because 2 multiplied by itself ten times is 1024, close to 1000. A bracket of width 1 needs 10 halvings to get within 0.001. Checking every point at that spacing would take 1000 evaluations. Move the slider to see the gap grow.</p>${more(`<p>After $n$ steps the width is $(b-a)/2^n$. To reach a tolerance, $n \\ge \\log_2\\!\\big((b-a)/\\text{tol}\\big)$.</p><p>Width 1, tolerance 0.001: $2^{10}=1024$, so <b>10 steps</b>.</p>`)}`,
        v: (box) => live(box, [["d", "sl", "decimal digits of accuracy", 1, 12, 1, 3]], halvFig),
        c: { q: "You found a root to 3 decimal places in 10 halvings. About how many more halvings give 3 more decimal places?", o: ["About 3 more", "About 10 more", "About 1000 more"], a: 1, why: "Three more digits means a bracket 1000 times narrower, and 2¹⁰ = 1024, so another 10 halvings. Each decimal digit costs about 3.3 halvings." } },
      { t: "When a bracket lies", b: `<p>The sign test is a promise only if its conditions hold:</p><ul><li><b>Same sign at both ends</b> proves nothing: there may be no root, or two.</li><li>A <b>pole</b> (like $1/x$) also flips sign, but there is no root.</li><li>A <b>double root</b> touches zero without crossing, so no sign change is ever seen.</li><li>With <b>several roots</b> inside, bisection finds one of them, not necessarily the one you want.</li></ul>`,
        v: F.frames([
          { t: "Same sign, two roots", v: F.plot([{ f: (x) => (x - 0.5) * (x - 1.5), c: "rose" }], { x: [0, 2], y: [-0.4, 0.8], h: 120, w: 260 }) },
          { t: "Pole: sign flips, no root", v: F.plot([{ f: (x) => 1 / x, c: "rose" }], { x: [-1, 1], y: [-5, 5], h: 120, w: 260, n: 301 }) },
          { t: "Double root: no sign change", v: F.plot([{ f: (x) => (x - 1) ** 2, c: "rose" }], { x: [0, 2], y: [-0.4, 1.2], h: 120, w: 260, marks: [[1, "", "amber", 0]] }) },
          { t: "Three roots: finds one", v: F.plot([{ f: (x) => x ** 3 - x, c: "rose" }], { x: [-1.5, 1.5], y: [-2, 2], h: 120, w: 260 }) },
        ]),
        c: { q: "g(x) = 1/x on [−1, 1]: g(−1) = −1 and g(1) = 1. Can bisection find a root?", o: ["No: the sign change comes from a pole at 0, not a root", "Yes: there is a sign change, so a root must exist", "Yes, but only if you start at the midpoint"], a: 0, why: "The 'must be a zero-crossing' promise needs g to be continuous. 1/x jumps across 0 and never equals zero, and bisection would happily converge onto the pole." } },
      { t: "From roots to minima", b: `<p>At the bottom of a smooth bowl the ground is flat. To the left of the bottom the ground falls, to the right it rises. So hunt for the place where the <b>slope</b> goes from negative to positive: that is a zero of the slope, and bisection can find it.</p><p>The bracket condition becomes: the ground is falling at a and rising at b. Example: f(x) = eˣ − 2x has slope −1 at 0 and +0.72 at 1, so its lowest point is trapped between. Slide the step counter and watch the bracket close in on 0.693.</p>${more(`<p>For a smooth convex $f$, the minimum is where $f'(x)=0$. So bracket a root of $g=f'$: you need $f'(a) \\lt 0 \\lt f'(b)$, which says <i>f is falling at a and rising at b</i>.</p><p>Example: $f(x)=e^x-2x$, so $f'(x)=e^x-2$, with $f'(0)=-1$ and $f'(1)\\approx0.72$. Bisection homes in on $\\ln 2\\approx0.693$.</p>${tbl(["Step", "a", "b", "m", "f′(m)"], bisect((x) => Math.exp(x) - 2, 0, 1, 4).rows.map((r, i) => [i + 1, f3(r.a), f3(r.b), f3(r.m), (r.gm >= 0 ? "+" : "") + f3(r.gm)]))}`)}`,
        v: (box) => live(box, [["k", "sl", "bisection steps", 0, 6, 1, 0]], minFig),
        c: { q: "To bracket the lowest point of a smooth bowl by bisecting its slope, what must hold at the two ends?", o: ["f(a) = f(b), so the ends are level", "The ground falls at a and rises at b", "f(a) < 0 and f(b) > 0"], a: 1, why: "A minimum is where the slope goes from negative to positive. The condition is on the slope at the ends, not on the heights f(a) and f(b)." } },
    ],
    guide: ["Pick a function. Press <b>Halve ▸</b> and watch the bracket (purple bar) shrink around the zero-crossing.", "Press <b>Run to width &lt; 0.001</b>, then check the last row: is |g(m)| small?", "Try the <b>1 / (x − 0.4)</b> function: it has a sign change but no root."],
  };
  function bisectRun(box, life) {
    const g = BIS.cub.g;
    F.run(box, life, {
      code: [
        "a, b with g(a) and g(b) of opposite sign",
        "m = (a + b) / 2, evaluate g(m)",
        "move the end that matches g(m)'s sign",
        "repeat until the bracket is narrow",
      ],
      build(stage) {
        return curveScene(stage, {
          f: g,
          x: [0.8, 2.2],
          y: [-3, 5],
          zero: true,
          pts: [
            ["a", "var(--violet)", "a"],
            ["b", "var(--violet)", "b"],
            ["m", "var(--amber)", "m"],
          ],
        });
      },
      *frames() {
        let a = 1,
          b = 2,
          ga = g(a);
        yield {
          a,
          b,
          m: null,
          cap: `<b>Start.</b> g(1) = ${nf(g(1))} is below zero and g(2) = ${nf(g(2))} is above, so a root is bracketed. Width ${nf(b - a, 4)}.`,
          line: 0,
        };
        for (let k = 1; k <= 6; k++) {
          const m = (a + b) / 2,
            gm = g(m),
            right = Math.sign(gm) === Math.sign(ga);
          yield {
            a,
            b,
            m,
            cap: `<b>Step ${k}.</b> m = ${f3(m)}, g(m) = ${f3(gm)} (${gm < 0 ? "below" : "above"} zero).`,
            line: 1,
          };
          const old = [a, b];
          if (right) {
            a = m;
            ga = gm;
          } else b = m;
          yield {
            a,
            b,
            m: null,
            cut: right ? [old[0], m] : [m, old[1]],
            cap: `g(m) has the same sign as g(${right ? "a" : "b"}), so <b>${right ? "a" : "b"} moves to m</b>. The new bracket [${f3(a)}, ${f3(b)}] is half as wide: ${nf(b - a, 4)}.`,
            line: 2,
            ask:
              k <= 2
                ? {
                    q: "Which end of the bracket moves to m? Tap it.",
                    pick: ".cs-p",
                    a: [right ? "a" : "b"],
                    why: `g(m) is ${gm < 0 ? "negative, like g(a)" : "positive, like g(b)"}, so the end with that sign moves.`,
                  }
                : null,
          };
        }
        yield {
          a,
          b,
          m: null,
          cap: `<b>Done.</b> After 6 halvings the root is trapped in a bracket of width ${nf(b - a, 4)}: about ${f3((a + b) / 2)}. The true root is 1.5214.`,
          line: 3,
          mood: "happy",
        };
      },
      draw(s, f, c) {
        s.place(c, "a", f.a, g(f.a));
        s.place(c, "b", f.b, g(f.b));
        s.place(c, "m", f.m, f.m == null ? 0 : g(f.m));
        s.bracket(c, f.a, f.b);
        s.cutBox(c, ...(f.cut || [null]).slice(0, 2));
      },
    });
  }
  N.register({
    id: "a3-bisect",
    subject: "algo",
    lecture: 3,
    order: 11,
    num: "3.11",
    title: "Bracketing a root: bisection",
    blurb: "A sign change traps a root. Halve the bracket until it is as narrow as you like.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let key = "cub",
        a,
        b,
        iter = 0;
      const reset = () => {
        const d = BIS[key];
        a = d.a;
        b = d.b;
        iter = 0;
      };
      reset();
      const card =
        el(`<div class="card"><div class="controls"><div id="fs"></div></div><div class="controls"><button class="btn primary" id="it">Halve ▸</button><button class="btn" id="run">Run to width &lt; 0.001</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="cv"></div><div class="stat-row"><div class="stat violet"><small>Bracket valid?</small><b id="vl"></b></div><div class="stat amber"><small>Width</small><b id="wd"></b></div><div class="stat"><small>Halvings</small><b id="n"></b></div><div class="stat teal"><small>|g(m)|</small><b id="gm"></b></div></div><p class="mono dim" id="msg"></p></div>`);
      root.appendChild(card);
      qs("#fs", card).appendChild(
        N.seg(
          Object.keys(BIS).map((k) => [k, BIS[k].n]),
          key,
          (v) => {
            key = v;
            reset();
            draw();
          },
        ),
      );
      function draw() {
        const d = BIS[key],
          m = (a + b) / 2;
        qs("#cv", card).innerHTML = rootSVG(d, a, b, m);
        qs("#vl", card).textContent = Math.sign(d.g(a)) !== Math.sign(d.g(b)) ? "yes ✓" : "no ✗";
        qs("#wd", card).textContent = (b - a).toFixed(4);
        qs("#n", card).textContent = iter;
        const v = Math.abs(d.g(m));
        qs("#gm", card).textContent = v > 1e4 ? "huge" : v.toFixed(4);
        qs("#msg", card).textContent =
          iter && b - a < 0.002
            ? v > 0.05
              ? "The bracket collapsed, but |g| is huge there: this is a pole, not a root."
              : `Converged: the root is about ${m.toFixed(4)}.`
            : `m = ${m.toFixed(4)}, g(m) = ${v > 1e4 ? "huge" : d.g(m).toFixed(4)}`;
        N.fx.play(qs("#cv", card));
      }
      const step = () => {
        const d = BIS[key],
          m = (a + b) / 2;
        if (Math.sign(d.g(m)) === Math.sign(d.g(a))) a = m;
        else b = m;
        iter++;
      };
      let stop = null;
      qs("#it", card).onclick = () => {
        step();
        draw();
      };
      qs("#run", card).onclick = () => {
        if (stop) return;
        stop = life.interval(() => {
          if (b - a < 0.001 || iter > 40) {
            stop();
            stop = null;
            return;
          }
          step();
          draw();
        }, 200);
      };
      qs("#rs", card).onclick = () => {
        if (stop) {
          stop();
          stop = null;
        }
        reset();
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a3-bis-1",
          q: "A bracket starts 1 wide. Roughly how wide is it after 5 halvings?",
          opts: ["about 0.2", "about 0.03", "about 0.005"],
          a: 1,
          why: "1 / 2⁵ = 1/32 ≈ 0.03. Each halving removes half, so five of them leave one thirty-second.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-bis-2",
          q: "Choose 1 / (x − 0.4) on [0, 1] and run it to the end. What has bisection found?",
          opts: [
            "A pole at x = 0.4: the sign flips but g is not near zero",
            "The root at x = 0.4, where g crosses zero cleanly",
            "Nothing useful: it stops after one step because g is huge",
          ],
          a: 0,
          why: "g(0) < 0 and g(1) > 0, yet 1/(x − 0.4) is never zero. The bracket shrinks onto the jump at 0.4, where |g| blows up.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A sign change on a <b>continuous</b> g brackets a root; halve the bracket by keeping the sign change.",
            "Width after $n$ steps is $(b-a)/2^n$: guaranteed, one binary digit per step.",
            "Poles, double roots and several roots break the naive promise. Minimising a convex $f$ means bisecting $f'$.",
          ],
          "Evaluate the middle, keep the half that still straddles zero.",
        ),
      );
    },
  });
  Object.assign(S, { brentRun, curveScene, goldenX, parab, retriple });
})();
