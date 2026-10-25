/* algo-p3-x-08.js: deepened 3.14 and 3.15 moves (overflow) */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const {
    BOWL,
    BOWL2,
    COLN,
    OPNAME,
    P2,
    ROSEN,
    moveFig,
    moveMod,
    nf,
    nmDraw,
    nmFrames,
    nmIter,
    nmSVG,
    nmScene,
    simplexOf,
    tbl,
  } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  /* ============ 3.14 The wandering triangle (deepened) ============ */
  const EX = {
    R: [
      BOWL,
      [
        [1, 2],
        [0, 1],
        [0, 0],
      ],
    ], // reflection accepted
    E: [
      BOWL,
      [
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ], // expansion accepted
    EF: [
      BOWL,
      [
        [3, 1],
        [0, 1],
        [0, 0],
      ],
    ], // expansion tried, reflection kept
    M2: [
      BOWL,
      [
        [3, 2],
        [1, 2],
        [0, 0],
      ],
    ], // outside contraction
    M1: [
      BOWL,
      [
        [2, 4],
        [0, 2],
        [0, 0],
      ],
    ], // inside contraction
    S: [
      ROSEN,
      [
        [2, 3],
        [-2, 2],
        [-0.5, 2.5],
      ],
    ], // shrink (Rosenbrock)
  };
  const exRes = (k, P) => nmIter(simplexOf(EX[k][0], ...EX[k][1]), EX[k][0], P);
  const showFor = (r) =>
    r.op === "reflect" ? (r.tried ? ["R", "E"] : ["R"]) : r.op === "expand" ? ["R", "E"] : ["R", "M1", "M2"];
  /* ---------- pictures that let you move the point yourself ---------- */
  const TONE = { teal: "var(--teal-ink)", amber: "var(--amber-ink)", rose: "var(--rose-ink)" };
  const tone = (c, t) => `<b style="color:${TONE[c]}">${t}</b>`;
  const fit = (pts, w, h, pad) => {
    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]),
      x0 = Math.min(...xs),
      y0 = Math.min(...ys),
      dx = Math.max(...xs) - x0,
      dy = Math.max(...ys) - y0;
    const sc = Math.min((w - 2 * pad) / Math.max(dx, 1e-6), (h - 2 * pad) / Math.max(dy, 1e-6));
    const ox = (w - sc * dx) / 2,
      oy = (h - sc * dy) / 2;
    return { X: (x) => ox + sc * (x - x0), Y: (y) => h - oy - sc * (y - y0) };
  };
  const lab = (x, y, r, side, name) => {
    const [dx, dy, an] = {
      l: [-(r + 7), 4, "end"],
      r: [r + 7, 4, "start"],
      u: [0, -(r + 7), "middle"],
      d: [0, r + 18, "middle"],
    }[side];
    return `<text x="${x + dx}" y="${y + dy}" class="fig-sub" style="text-anchor:${an};fill:var(--text);font-size:13px;font-weight:700">${name}</text>`;
  };
  const dotSvg = (X, Y, p, c, name, r = 7, side = "u") =>
    `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${r}" fill="${c}" stroke="var(--panel)" stroke-width="2"/>${lab(X(p[0]), Y(p[1]), r, side, name)}`;
  const ringSvg = (X, Y, p, c, name, side = "r") =>
    `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="6" fill="var(--panel)" stroke="${c}" stroke-width="2.5"/>${lab(X(p[0]), Y(p[1]), 6, side, name)}`;
  const frame = (host, label) => {
    host.innerHTML = "";
    const box = el(
      `<div><div class="controls" data-a></div><div data-svg role="img" aria-label="${label}"></div><div class="controls" data-b></div><p class="mono" data-txt style="min-height:3.4em;margin:6px 0 0"></p></div>`,
    );
    host.appendChild(box);
    return box;
  };
  /** Slide a test point along the line from the worst corner W through the centre C (0 = C, 1 = the mirror image of W). */
  function lineFig(host, { cur, keys, u0, marks }) {
    const init = (k) => (typeof u0 === "object" ? u0[k] : u0);
    let u = init(cur);
    const box = frame(
      host,
      "A triangle with a dashed line from its worst corner through the middle of the other two. A slider moves a test point along that line.",
    );
    const sl = N.slider("Slide the test point (1 = mirror image)", -1, 2.5, 0.25, u, (v) => String(v));
    const draw = () => {
      const r = exRes(cur),
        f = EX[cur][0],
        C = r.C,
        W = r.W.p,
        at = (k) => [C[0] + k * (C[0] - W[0]), C[1] + k * (C[1] - W[1])];
      /* turn the picture so the line W -> C runs left to right, which keeps the long line and the small triangle in one view */
      const dd = Math.hypot(C[0] - W[0], C[1] - W[1]),
        ex = [(C[0] - W[0]) / dd, (C[1] - W[1]) / dd];
      const rt = (p) => [(p[0] - W[0]) * ex[0] + (p[1] - W[1]) * ex[1], -(p[0] - W[0]) * ex[1] + (p[1] - W[1]) * ex[0]];
      const { X, Y } = fit([rt(r.B.p), rt(r.G.p), rt(W), rt(at(-1)), rt(at(2.5))], 480, 210, 38);
      const T = rt(at(u)),
        fT = f(at(u)),
        side = (p) => (rt(p)[1] >= 0 ? "u" : "d");
      const poly = [r.B.p, r.G.p, W].map((p) => `${X(rt(p)[0])},${Y(rt(p)[1])}`).join(" ");
      const m = marks
        .map(([k, uu, sd]) => ringSvg(X, Y, rt(at(uu)), COLN[k], `${k} · f=${nf(f(at(uu)))}`, sd))
        .join("");
      qs("[data-svg]", box).innerHTML =
        `<svg class="fig" viewBox="0 0 480 210" style="max-height:210px"><line x1="${X(rt(at(-1))[0])}" y1="${Y(0)}" x2="${X(rt(at(2.5))[0])}" y2="${Y(0)}" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="5 5"/><polygon points="${poly}" fill="rgba(206,130,255,.14)" stroke="var(--violet)" stroke-width="2.4" stroke-linejoin="round"/>${dotSvg(X, Y, rt(r.B.p), COLN.B, `B · f=${nf(r.B.f)}`, 7, side(r.B.p))}${dotSvg(X, Y, rt(r.G.p), COLN.G, `G · f=${nf(r.G.f)}`, 7, side(r.G.p))}${dotSvg(X, Y, rt(W), COLN.W, `W · f=${nf(r.W.f)}`, 7, "d")}${dotSvg(X, Y, rt(C), COLN.C, "C", 5, side(r.B.p) === "u" ? "d" : "u")}${m}<circle cx="${X(T[0])}" cy="${Y(T[1])}" r="9" fill="var(--blue)" stroke="var(--panel)" stroke-width="3"/></svg>`;
      const v =
        fT < r.B.f
          ? ["teal", "better than the best corner"]
          : fT < r.G.f
            ? ["teal", "better than the good corner"]
            : fT < r.W.f
              ? ["amber", "better than the worst corner only"]
              : ["rose", "no better than the worst corner"];
      const where =
        u < 0
          ? "inside, between the middle and the worst corner"
          : u === 0
            ? "right on the middle"
            : u < 1
              ? "outside, between the middle and the mirror image"
              : u === 1
                ? "the mirror image of the worst corner"
                : "stretched beyond the mirror image";
      qs("[data-txt]", box).innerHTML = `Test point (blue): ${where}. It scores <b>${nf(fT)}</b>: ${tone(...v)}.`;
      N.fx.play(qs("[data-svg]", box));
    };
    if (keys)
      qs("[data-a]", box).appendChild(
        N.seg(keys, cur, (k) => {
          cur = k;
          sl.value = u = init(k);
          draw();
        }),
      );
    sl.onInput((v) => {
      u = v;
      draw();
    });
    qs("[data-b]", box).appendChild(sl);
    draw();
  }
  /** Shrink: slide the two other corners towards the best one (the Rosenbrock example). */
  function shrinkFig(host) {
    const f = ROSEN,
      b = [2, 3],
      g = [-2, 2],
      w = [-0.5, 2.5];
    let d = 0.5;
    const box = frame(host, "A triangle whose two worse corners slide towards the best corner as a slider moves.");
    const sl = N.slider("How far to pull in (0.5 = halfway)", 0, 1, 0.25, d, (v) => String(v));
    const draw = () => {
      const mv = (p) => [p[0] + d * (b[0] - p[0]), p[1] + d * (b[1] - p[1])],
        M = mv(w),
        Q = mv(g);
      const { X, Y } = fit([b, g, w, M, Q], 400, 190, 40);
      const pl = (a) => a.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ");
      qs("[data-svg]", box).innerHTML =
        `<svg class="fig" viewBox="0 0 400 190" style="max-height:190px"><polygon points="${pl([b, g, w])}" fill="rgba(206,130,255,.12)" stroke="var(--violet)" stroke-width="2.4" stroke-dasharray="6 4" stroke-linejoin="round"/><polygon points="${pl([b, M, Q])}" fill="rgba(88,204,2,.16)" stroke="var(--teal)" stroke-width="2.6" stroke-linejoin="round"/>${dotSvg(X, Y, b, COLN.B, `B · f=${nf(f(b))}`, 7, "u")}${dotSvg(X, Y, g, COLN.G, `G · f=${nf(f(g))}`, 7, "u")}${dotSvg(X, Y, w, COLN.W, `W · f=${nf(f(w))}`, 7, "d")}${dotSvg(X, Y, M, "var(--teal)", "M", 6, "d")}${dotSvg(X, Y, Q, "var(--teal)", "N", 6, "u")}</svg>`;
      qs("[data-txt]", box).innerHTML =
        `B stays put. W moves to M (f = <b>${nf(f(M))}</b>) and G moves to N (f = <b>${nf(f(Q))}</b>), each ${d === 0.5 ? "halfway" : `${Math.round(d * 100)}% of the way`} to B. The new triangle is smaller and hugs the best corner.`;
      N.fx.play(qs("[data-svg]", box));
    };
    sl.onInput((v) => {
      d = v;
      draw();
    });
    qs("[data-b]", box).appendChild(sl);
    draw();
  }
  /** Three stages: spot W, keep the best side, take its halfway point. */
  function centroidFig(host) {
    const B = [4, 2],
      G = [2, 6],
      W = [9, 9],
      C = [3, 4];
    const box = frame(
      host,
      "A triangle with corners B, G and W. Three stages show the worst corner covered up and the halfway point C of the other two.",
    );
    const TXT = [
      "The worst corner W has the highest score.",
      "Cover W. The other two corners make the best side.",
      "C is halfway along the best side. From now on we measure from C, in the direction away from W.",
    ];
    const draw = (k) => {
      const i = +k,
        { X, Y } = fit([B, G, W], 420, 250, 44);
      const side =
        i >= 1
          ? `<line x1="${X(B[0])}" y1="${Y(B[1])}" x2="${X(G[0])}" y2="${Y(G[1])}" stroke="var(--violet)" stroke-width="3.5"/>`
          : "";
      const tri =
        i === 0
          ? `<polygon points="${[B, G, W].map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")}" fill="rgba(206,130,255,.14)" stroke="var(--violet)" stroke-width="2.4" stroke-linejoin="round"/>`
          : "";
      const arrow =
        i === 2
          ? `<line x1="${X(W[0])}" y1="${Y(W[1])}" x2="${X(C[0])}" y2="${Y(C[1])}" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 4"/>${dotSvg(X, Y, C, COLN.C, "C = (3, 4)", 6, "l")}`
          : "";
      qs("[data-svg]", box).innerHTML =
        `<svg class="fig" viewBox="0 0 420 250" style="max-height:250px">${tri}${side}${arrow}${dotSvg(X, Y, B, COLN.B, "B = (4, 2)", 8, "r")}${dotSvg(X, Y, G, COLN.G, "G = (2, 6)", 8, "l")}${dotSvg(X, Y, W, i === 0 ? COLN.W : "var(--line-2)", i === 0 ? "W: worst" : "W", 8, "u")}</svg>`;
      qs("[data-txt]", box).textContent = TXT[i];
      N.fx.play(qs("[data-svg]", box));
    };
    qs("[data-a]", box).appendChild(
      N.seg(
        [
          ["0", "1. Spot the worst"],
          ["1", "2. Best side"],
          ["2", "3. Halfway: C"],
        ],
        "0",
        draw,
      ),
    );
    draw("0");
  }
  /** What a round costs: every test point is one evaluation of f. */
  function costFig(host) {
    const MV = {
      R: ["Reflect", ["R"], "R, the mirror image, is always tried first."],
      E: ["Expand", ["R", "E"], "E, the stretch, is tried only when R beat the best corner."],
      C: ["Contract", ["R", "M₁", "M₂"], "M₁ and M₂, the two cautious points, are tried when R was poor."],
      S: ["Shrink", ["R", "M₁", "M₂", "M", "N"], "M and N are the two corners pulled in by the shrink."],
    };
    const box = frame(host, "Pick a move to see how many function evaluations one round of it costs.");
    const draw = (k) => {
      const [name, t, why] = MV[k];
      const cells = t.map((x, i) => ({ v: x, sub: String(i + 1), c: i < 3 ? "blue" : "rose" }));
      qs("[data-svg]", box).innerHTML = F.cells(cells, { label: "evaluations", size: 48 });
      qs("[data-txt]", box).innerHTML =
        `${name} round: <b>${t.length}</b> evaluation${t.length > 1 ? "s" : ""} of f. ${why}`;
      N.fx.play(qs("[data-svg]", box));
    };
    qs("[data-a]", box).appendChild(
      N.seg(
        Object.keys(MV).map((k) => [k, MV[k][0]]),
        "R",
        draw,
      ),
    );
    draw("R");
  }
  /** Two knobs, one score, no formula: the situation Nelder-Mead is made for. */
  function knobFig(host) {
    const f = (x, y) => Math.round(((x - 3.5) ** 2 + (y - 1.5) ** 2) * 10);
    let best = Infinity,
      tries = 0;
    const box = el(
      `<div class="card" style="margin:0"><div class="controls" data-k></div><div class="stat-row"><div class="stat violet"><small>Score (lower is better)</small><b data-s></b></div><div class="stat teal"><small>Best so far</small><b data-b>–</b></div><div class="stat"><small>Settings tried</small><b data-t>0</b></div></div><p class="mono dim" style="margin:6px 0 0">The black box shows only the score: no formula, no slope.</p></div>`,
    );
    host.innerHTML = "";
    host.appendChild(box);
    const kx = N.slider("Knob 1", 0, 6, 0.5, 0, (v) => v.toFixed(1)),
      ky = N.slider("Knob 2", 0, 6, 0.5, 6, (v) => v.toFixed(1));
    const upd = (count) => {
      const s = f(kx.value, ky.value);
      if (count) {
        tries++;
        best = Math.min(best, s);
      }
      qs("[data-s]", box).textContent = s;
      qs("[data-b]", box).textContent = best === Infinity ? "–" : best;
      qs("[data-t]", box).textContent = tries;
    };
    kx.onInput(() => upd(true));
    ky.onInput(() => upd(true));
    qs("[data-k]", box).append(kx, ky);
    upd(false);
  }
  (function extendNM() {
    const D = L["a3-nm"];
    if (!D) return;
    const old = D.steps;
    if (!old[3].v)
      old[3].v = F.flow([
        "Evaluate f at the vertices",
        { t: "Compare: which is worst?", c: "amber" },
        { t: "Replace it", c: "teal" },
        "No derivative needed",
      ]);
    D.sum =
      "Nelder–Mead finds a minimum in many dimensions using only comparisons. A simplex (D + 1 points) crawls downhill: it keeps replacing its <b>worst</b> point by reflecting it, stretching when that works and shrinking when it doesn't.";
    // prettier-ignore

    D.steps = [
      { t: "Many knobs, no gradient", b: `<p>Imagine tuning an oven. You have three knobs (temperature, fan speed, time) and one number comes out: how burnt the cake is. There is no formula and no slope to follow. All you can do is try a setting and compare it with the last one.</p><p>Nelder–Mead is built for exactly that. It walks downhill using nothing but "which of these two settings scored lower?". Turn the two knobs below and see how far comparisons alone get you.</p><span class="key">Nelder–Mead uses the shape of a small triangle of settings and nothing but scores to walk downhill.</span><details class="math-more"><summary>Show the maths</summary><p>With $D$ knobs the settings form a point $\\mathbf{x}\\in\\mathbb{R}^D$, and the score is $y=f(\\mathbf{x})$. Treat $f$ as a black box: put in $D$ numbers, get one number out (a simulation, a model's error). We may have no formula and no derivative.</p></details>`,
        v: (box) => knobFig(box),
        c: { q: "What does Nelder–Mead need to know about f?", o: ["Only the value f(x) at points it chooses", "The gradient of f at every point it visits", "A formula for f written in closed form"], a: 0, why: "It never differentiates. Every decision is a comparison between two function values." } },
      { t: "A simplex has D + 1 points", b: `<p>A <b>simplex</b> is the simplest shape with volume in $D$ dimensions: $D+1$ points joined by all their line segments, faces and so on.</p><ul><li>1-D: a line segment (2 points)</li><li>2-D: a triangle (3 points)</li><li>3-D: a tetrahedron (4 points)</li></ul>`,
        v: `<svg class="fig" viewBox="0 0 520 150" style="max-height:150px"><line x1="40" y1="80" x2="140" y2="80" stroke="var(--violet)" stroke-width="3" class="draw"/><circle cx="40" cy="80" r="7" fill="var(--teal)" class="fi"/><circle cx="140" cy="80" r="7" fill="var(--rose)" class="fi"/><text x="90" y="125" class="fig-sub">1-D: 2 points</text>
          <polygon points="230,110 330,110 280,38" fill="rgba(206,130,255,.18)" stroke="var(--violet)" stroke-width="3" class="fi"/><circle cx="230" cy="110" r="7" fill="var(--teal)"/><circle cx="330" cy="110" r="7" fill="var(--amber)"/><circle cx="280" cy="38" r="7" fill="var(--rose)"/><text x="280" y="140" class="fig-sub">2-D: 3 points</text>
          <polygon points="400,112 490,118 450,80" fill="rgba(206,130,255,.18)" stroke="var(--violet)" stroke-width="2.5" class="fi"/><line x1="450" y1="22" x2="400" y2="112" stroke="var(--violet)" stroke-width="2.5"/><line x1="450" y1="22" x2="490" y2="118" stroke="var(--violet)" stroke-width="2.5"/><line x1="450" y1="22" x2="450" y2="80" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="4 3"/><circle cx="450" cy="22" r="6" fill="var(--rose)"/><text x="450" y="146" class="fig-sub">3-D: 4 points</text></svg>`,
        c: { q: "You minimise a function of 6 variables. How many points does the simplex hold?", o: ["7", "6", "12"], a: 0, why: "D + 1 = 7: one more point than there are dimensions, so the shape has volume in all 6." } },
      old[0],
      { t: "The centroid of the best side", b: `<p>The triangle has a worst corner, <b>W</b>: the one with the highest score. Cover it up. The other two corners, <b>B</b> (best) and <b>G</b> (good), make the <i>best side</i>. The <b>centroid C</b> is just the halfway point of that side.</p><p>Example: B is at (4, 2) and G at (2, 6). Halfway across is 3 and halfway up is 4, so C is at (3, 4). Every move from here on starts at W and heads through C.</p><details class="math-more"><summary>Show the maths</summary><p>Label the vertices so that $f(B)\\le f(G)\\le f(W)$. The centroid is the average of every vertex except the worst:</p><p>$$C=\\frac1D\\,(B+G+\\dots)$$</p><p>In 2-D that is the midpoint of the line $BG$. Here $C=\\tfrac12\\big((4,2)+(2,6)\\big)=(3,4)$, and the direction of every move is $C-W$.</p></details>`,
        v: (box) => centroidFig(box),
        c: { q: "In 2-D, B = (6, 0), G = (2, 4) and W = (7, 9). What is the centroid C?", o: ["(4, 2)", "(5, 4.33)", "(2, 4)"], a: 0, why: "C averages the two best points only: ((6+2)/2, (0+4)/2) = (4, 2). The worst point W is not included." } },
      { t: "Choosing the starting simplex", b: `<p>Before the triangle can crawl, it needs a start. Take your best guess, then make the other corners by nudging <b>one knob at a time</b> by a little (10%). A guess of (−1, 1) gives corners (−1, 1), (−1.1, 1) and (−1, 1.1): a small but proper triangle.</p><p><b>The catch:</b> if a knob is exactly 0, "10% of 0" is still 0. The nudge does nothing, two corners sit on top of each other and the triangle is flat. Then nudge by a small fixed amount instead.</p><details class="math-more"><summary>Show the maths</summary><p>For $D$ knobs, copy $\\mathbf{x}_0$ and multiply one coordinate at a time by 1.1. For $\\mathbf{x}_0=(-1,1)$ that gives $(-1,1)$, $(-1.1,1)$ and $(-1,1.1)$. If $x_{0,i}=0$ then $1.1\\times 0=0$, so the corner coincides with $\\mathbf{x}_0$.</p></details>`,
        v: F.frames([{ t: "x₀ = (−1, 1): a proper triangle", v: nmSVG({ w: 260, h: 170, pts: { "x₀": { p: [-1, 1], c: COLN.B, dy: 22 }, "x₁": { p: [-1.1, 1], c: COLN.G, dy: 22 }, "x₂": { p: [-1, 1.1], c: COLN.W } }, polys: [{ names: ["x₀", "x₁", "x₂"], c: "var(--violet)", fill: "rgba(206,130,255,.14)" }] }) }, { t: "x₀ = (0, 3): a collapsed sliver", v: nmSVG({ w: 260, h: 170, pts: { "x₀ = x₁": { p: [0, 3], c: COLN.B, dy: 22 }, "x₂": { p: [0, 3.3], c: COLN.W } }, lines: [["x₀ = x₁", "x₂", "var(--violet)"]] }) }]),
        c: { q: "x₀ = (0, 3). Scaling one coordinate at a time by 1.1 gives (0, 3), (0, 3) and (0, 3.3). What is wrong?", o: ["Two points coincide, so the simplex has no area", "Nothing: three points always make a triangle", "The points are too far apart to compare"], a: 0, why: "0 × 1.1 = 0, so the first new point equals x₀. A simplex that has collapsed onto a line can only search along that line." } },
      old[1], old[2], old[3],
    ];
    D.guide = [
      "Press <b>Step</b> and read the move name each time. The faint outline is the previous triangle.",
      "Press <b>Run</b>. The triangle stretches along the curved valley, then collapses onto the ★.",
      "Switch to the <b>3-D</b> view to see the path on the surface.",
      "The next lessons put numbers on each move and on when to stop.",
    ];
    // prettier-ignore

    moveMod("a3-nm", 14, "3.14", [
      { id: "a3-nm-2", q: "A simplex has to be replaced point by point. In a 2-D problem, which of its three points is always the one the algorithm tries to replace?", opts: ["The worst point W (highest f)", "The best point B (lowest f)", "The middle point G"], a: 0, why: "Every move starts from W: reflect it through the centroid of the others. B and G are the points we want to keep." },
      { id: "a3-nm-3", q: "Nelder–Mead on 4 variables needs how many function values just to start?", opts: ["5, one per vertex of the simplex", "4, one for each variable in the problem", "20, five for each of the 4 variables"], a: 0, why: "D + 1 = 5 vertices, each needs its own f value before the first ordering." },
    ]);
  })();
  /* ============ 3.15 Reflect, expand, contract, shrink ============ */
  // prettier-ignore

  L["a3-nm-ops"] = {
    sum: "Four moves, all measured from the centroid C of the best side: reflect W through C, expand if that was great, contract if it was poor, shrink everything towards B as a last resort.",
    steps: [
      { t: "Reflection", b: `<p>The worst corner is the one we least want, so we throw it away and look on the <i>other</i> side. Reflection flips the worst corner through the middle of the other two, like its mirror image across a pond. Slide the blue test point along the dashed line: at 1 it is the mirror image.</p><p>Example (a bowl whose lowest point is (3, 2)): the corners score 4, 10 and 13, and the worst is at (0, 0). Its mirror image is (1, 3), which scores 5. That beats the good corner (10), so it takes the worst corner's place.</p><details class="math-more"><summary>Show the maths</summary><p>Flip the worst vertex through the centroid of the best side:</p><p>$$R = C + \\alpha\\,(C-W),\\qquad \\alpha>0,\\ \\text{usually }\\alpha=1$$</p><p>Accept $R$ if $f(R)&lt;f(G)$. Here $B=(1,2)$, $G=(0,1)$, $W=(0,0)$ with $f=4,10,13$, so $C=(0.5,1.5)$, $R=(1,3)$ and $f(R)=5<10$.</p></details>`,
        v: (box) => lineFig(box, { cur: "R", u0: 1, marks: [["R", 1, "u"]] }),
        c: { q: "f(B) = 4, f(G) = 10, f(R) = 5. What happens?", o: ["Accept R in place of W, with no expansion", "Try an expansion beyond R, since it beat G", "Contract towards W, since R is not the best"], a: 0, why: "R beats G (5 < 10) but not B (5 > 4). That is good enough to accept, but not good enough to gamble on going further." } },
      { t: "Expansion", b: `<p>If the mirror image beats even the best corner, we are heading the right way, so be bold: stretch twice as far from the middle and see whether that is better still. It is a gamble. If the longer jump is worse, keep the mirror image.</p><p>Try both cases below. When the stretch pays off, the point scores 3.25 against 4 for the mirror image. When the mirror image already sits at the bottom (score 0), stretching only overshoots (3.25).</p><details class="math-more"><summary>Show the maths</summary><p>If $f(R)&lt;f(B)$, try</p><p>$$E = C + \\gamma\\,(C-W),\\qquad \\gamma>1,\\ \\text{usually }\\gamma=2$$</p><p>(measured from $C$, not from $R$). If $f(E)&lt;f(R)$ accept $E$; otherwise keep $R$. Case 1: $B=(1,1)$, $G=(0,1)$, $W=(0,0)$, so $R=(1,2)$ has $f=4$ and $E=(1.5,3)$ has $f=3.25$. Case 2: $f(R)=0$ is the true minimum and $f(E)=3.25$ is worse, so $R$ is kept.</p></details>`,
        v: (box) => lineFig(box, { cur: "E", keys: [["E", "Stretch pays off"], ["EF", "Stretch overshoots"]], u0: 2, marks: [["R", 1, "u"], ["E", 2, "u"]] }),
        c: { q: "f(B) = 1, f(R) = 0 and f(E) = 3.25. Which point replaces W?", o: ["R, because E is no better than R", "E, because it went furthest", "Neither: shrink the simplex"], a: 0, why: "Expansion is a gamble. f(E) = 3.25 is worse than f(R) = 0, so the gamble failed and we fall back on R." } },
      { t: "Contraction: two middle points", b: `<p>If the mirror image is no better than the good corner, the step overshot: the bottom is somewhere between, not beyond. So try two cautious points on the same line. One is <b>inside</b> (between the middle and the worst corner), the other <b>outside</b> (between the middle and the mirror image). Keep whichever scores lower, as long as it beats the worst corner.</p><p>Switch between the two cases below. Slide the blue point to see why the winner wins.</p><details class="math-more"><summary>Show the maths</summary><p>If $f(R)\\ge f(G)$, consider two points on the line through $W$ and $C$:</p><p>$$M_1,\\,M_2 = C \\mp \\beta\\,(C-W),\\qquad 0<\\beta<1,\\ \\text{usually }\\beta=\\tfrac12$$</p><p>$M_1$ is <b>inside</b>, $M_2$ is <b>outside</b>. Accept $M_1$ if $f(M_1)&lt;f(W)$ <i>and</i> $f(M_1)&lt;f(M_2)$; accept $M_2$ if $f(M_2)&lt;f(W)$ and $f(M_2)&lt;f(M_1)$.</p></details>`,
        v: (box) => lineFig(box, { cur: "M2", keys: [["M2", "Outside wins"], ["M1", "Inside wins"]], u0: { M2: 0.5, M1: -0.5 }, marks: [["R", 1, "u"], ["M1", -0.5, "u"], ["M2", 0.5, "d"]] }),
        c: { q: "R overshot. f(W) = 13, f(M₁) = 6.5 and f(M₂) = 8.5. Which point is accepted?", o: ["M₁ (the inside point)", "M₂ (the outside point)", "Neither"], a: 0, why: "Both beat W (13), and M₁ is lower than M₂ (6.5 < 8.5), so M₁ is accepted." } },
      { t: "Shrink: the last resort", b: `<p>Sometimes nothing works: the mirror image is poor and both cautious points are worse than the worst corner. The valley must have narrowed around the best corner, so the whole triangle is too big. The last resort is to pull the other two corners towards the best corner, which stays where it is. Slide to see it happen.</p><p>Example on the banana valley: the corners score 101, 409 and 508.5, the mirror image scores 506.5 and both middle points score about 595. Nothing helps, so the worst corner moves to (0.75, 2.75) and the good one to (0, 2.5). Shrinking is expensive (every moved corner needs a new score), so it is rare in practice.</p><details class="math-more"><summary>Show the maths</summary><p>If neither $M_1$ nor $M_2$ beats $W$, pull the other vertices towards the best point:</p><p>$$M = W+\\delta\\,(B-W),\\quad N = G+\\delta\\,(B-G),\\qquad 0<\\delta<1,\\ \\text{usually }\\delta=\\tfrac12$$</p><p>Rosenbrock example: $B=(2,3)$, $G=(-2,2)$, $W=(-0.5,2.5)$ with $f=101,\\,409,\\,508.5$. Then $f(R)=506.5\\ge409$, and $f(M_1)\\approx595.7$, $f(M_2)\\approx594.7$ are both worse than $f(W)$. Shrink: $M=(0.75,2.75)$ and $N=(0,2.5)$.</p><p class="faint">On a strictly convex $f$ a shrink can never happen, and it costs $D$ new evaluations.</p></details>`,
        v: (box) => shrinkFig(box),
        c: { q: "Neither contraction point is better than W. What does Nelder–Mead do?", o: ["Shrink every point except B halfway towards B", "Restart from a fresh random simplex of the same size", "Reflect again with a larger α and a longer step"], a: 0, why: "Nothing replaces W, so the simplex is rebuilt closer to the best point. B is the only vertex that stays still." } },
      { t: "The decision list", b: `<p>One round of the algorithm, in order:</p>${tbl(["Condition", "Move", "New vertex"], [["f(R) < f(B), then f(E) < f(R)", "expand", "E"], ["f(R) < f(B), but f(E) ≥ f(R)", "reflect", "R"], ["f(B) ≤ f(R) < f(G)", "reflect", "R"], ["f(R) ≥ f(G) and a middle point beats W (and the other middle point)", "contract", "M₁ or M₂"], ["otherwise", "shrink", "M, N"]])}<p>Then re-sort and repeat. Each round costs a handful of function evaluations, which is where the time goes.</p>`,
        v: F.flow(["Order B, G, W", "Centroid C", "Reflect R", { t: "good? bad?", c: "amber" }, { t: "Expand / Contract / Shrink", c: "violet" }], { loop: true }),
        c: { q: "f(R) < f(B), and then f(E) < f(R). Which vertex replaces W?", o: ["E", "R", "M₁"], a: 0, why: "A beaten best value triggers expansion, and E beat R, so the longer jump is kept." } },
      { t: "Watch it run", b: `<p>A full run on a simple bowl. Predict each choice before it happens. The faint outline is the previous simplex; the dotted line is the path of the best point.</p>`, v: (box, life) => opsRunner(box, life) },
      { t: "The four parameters and their costs", b: `<p>Each move has a dial that says how bold it is: reflect by 1 (a true mirror image), expand by 2 (twice as far), contract by ½ (halfway back), shrink by ½ (halfway to the best). These four standard settings work well almost everywhere, so you rarely touch them.</p><p>What matters in practice is the bill. Every test point costs one evaluation of f. Pick a move to see how many a 2-D round spends.</p><details class="math-more"><summary>Show the maths</summary><p>The constants are tunable: $\\alpha>0$ (reflection, 1), $\\gamma>1$ (expansion, 2), $0<\\beta<1$ (contraction, ½), $0<\\delta<1$ (shrink, ½). The standard choices are 1, 2, ½, ½. The counts are for this lecture's version, which computes both middle points.</p></details>`,
        v: (box) => costFig(box),
        c: { q: "In 2-D, a round ends in a shrink. How many function evaluations did that round cost (R, M₁, M₂, then the shrunk points)?", o: ["5", "3", "2"], a: 0, hint: "R, M₁, M₂ is three; the shrink creates two new points that need values.", why: "R, M₁ and M₂ cost 3 evaluations, and the two new vertices M and N cost 2 more, so 5. Reflect-only rounds cost just 1." } },
    ],
    guide: ["Choose a preset and watch which move the algorithm picks. Dashed green is the new simplex.", "Drag the α, γ, β, δ sliders: see how the candidate points slide along the line through W and C.", "Answer the questions after the demo."],
  };
  function opsRunner(box, life) {
    const view = [-0.5, 5.5, -0.8, 4.2],
      ringR = [0.5, 1, 1.6, 2.4, 3.4, 4.6];
    F.run(box, life, {
      code: [
        "order B, G, W; centroid of the best side",
        "reflect W through C to get R",
        "R beat B? try the expansion E",
        "R no better than G? try both contractions",
        "keep the best candidate (or shrink), repeat",
      ],
      build(stage) {
        return nmScene(stage, {
          view,
          star: [3.5, 2.2],
          bg: (X, Y) =>
            ringR
              .map(
                (r) =>
                  `<ellipse cx="${X(3.5)}" cy="${Y(2.2)}" rx="${X(3.5 + r) - X(3.5)}" ry="${Y(2.2) - Y(2.2 + r)}" fill="none" stroke="var(--line-2)" stroke-width="1.5" opacity=".7"/>`,
              )
              .join(""),
        });
      },
      frames: () =>
        nmFrames(
          BOWL2,
          [
            [0, 0],
            [1, 0],
            [0, 1],
          ],
          8,
        ),
      draw: nmDraw,
    });
  }
  N.register({
    id: "a3-nm-ops",
    subject: "algo",
    lecture: 3,
    order: 15,
    num: "3.15",
    title: "Reflect, expand, contract, shrink",
    blurb: "The four Nelder–Mead moves with real numbers: the formulas, the conditions and the order of tests.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let key = "R";
      const P = { a: 1, g: 2, b: 0.5, d: 0.5 };
      const card =
        el(`<div class="card"><div class="controls"><div id="ps"></div></div><div class="controls" id="sl"></div><div id="cv"></div>
        <div class="stat-row"><div class="stat violet"><small>Move chosen</small><b id="mv"></b></div><div class="stat"><small>Values f(B) · f(G) · f(W)</small><b id="fv"></b></div><div class="stat teal"><small>Evaluations</small><b id="ev"></b></div></div><div class="mono dim" id="txt"></div></div>`);
      root.appendChild(card);
      const NAMES = {
        R: "Reflect",
        E: "Expand",
        EF: "Expand fails",
        M2: "Contract out",
        M1: "Contract in",
        S: "Shrink",
      };
      qs("#ps", card).appendChild(
        N.seg(
          Object.keys(EX).map((k) => [k, NAMES[k]]),
          key,
          (v) => {
            key = v;
            draw();
          },
        ),
      );
      const mk = (lab, k, lo, hi, st) => {
        const s = N.slider(lab, lo, hi, st, P[k], (v) => v.toFixed(2));
        s.onInput((v) => {
          P[k] = v;
          draw();
        });
        qs("#sl", card).appendChild(s);
        return s;
      };
      mk("α reflect", "a", 0.5, 2, 0.25);
      mk("γ expand", "g", 1.25, 3, 0.25);
      mk("β contract", "b", 0.25, 0.75, 0.25);
      mk("δ shrink", "d", 0.25, 0.75, 0.25);
      function draw() {
        const r = exRes(key, P);
        qs("#cv", card).innerHTML = moveFig(r, showFor(r), { shrinkTo: r.op === "shrink", w: 460, h: 250 });
        qs("#mv", card).textContent = OPNAME[r.op] + (r.tried ? " (E failed)" : "");
        qs("#fv", card).textContent = `${nf(r.B.f)} · ${nf(r.G.f)} · ${nf(r.W.f)}`;
        qs("#ev", card).textContent = r.ev;
        qs("#txt", card).textContent =
          `C = ${P2(r.C)}   R = ${P2(r.R)} (f ${nf(r.fR)})` +
          (r.E ? `   E = ${P2(r.E)} (f ${nf(r.fE)})` : "") +
          (r.M1 ? `   M₁ = ${P2(r.M1)} (f ${nf(r.f1)})   M₂ = ${P2(r.M2)} (f ${nf(r.f2)})` : "");
        N.fx.play(qs("#cv", card));
      }
      draw();
      root.appendChild(
        predict({
          id: "a3-nmo-1",
          q: "Expansion uses γ = 2 and reflection uses α = 1, both measured from the centroid C along the line from W. How does the distance C→E compare with C→R?",
          opts: ["Twice as far", "The same", "Half as far"],
          a: 0,
          why: "R = C + 1·(C − W) and E = C + 2·(C − W). Same direction, but E is twice as far from C as R is.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-nmo-2",
          q: "Pick the Shrink preset. After the shrink, which vertex of the old simplex does not move at all?",
          opts: ["B, the best vertex", "W, the worst vertex", "G, the good vertex"],
          a: 0,
          why: "Shrink pulls W and G halfway towards B, so B is the fixed point. M = W + ½(B − W) and N = G + ½(B − G).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "$R=C+\\alpha(C-W)$, $E=C+\\gamma(C-W)$, $M_{1,2}=C\\mp\\beta(C-W)$, shrink towards $B$ by $\\delta$.",
            "Test in order: beat B (expand?), beat G (accept), else contract, else shrink.",
            "Usual constants 1, 2, ½, ½. Shrink is the expensive last resort and is rare.",
          ],
          "Reflect first. Stretch if it pays, pull back if it overshot, shrink if nothing works.",
        ),
      );
    },
  });
})();
