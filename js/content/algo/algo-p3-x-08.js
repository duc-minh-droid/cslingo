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
      { t: "Many knobs, no gradient", b: `<p>Now the function has more than one input: minimise $y=f(\\mathbf{x})$ with $\\mathbf{x}\\in\\mathbb{R}^D$. Think of $f$ as a black box: put in $D$ numbers, get one number out (a simulation, a model's error). We may have no formula and no derivative.</p><span class="key">Nelder–Mead uses the geometry of a <b>simplex</b> and nothing but function values to walk downhill.</span>`,
        v: F.flow(["x₁ … x_D", { t: "f(x): black box", c: "violet" }, { t: "one number y", c: "teal" }]),
        c: { q: "What does Nelder–Mead need to know about f?", o: ["Only the value f(x) at points it chooses", "The gradient of f at every point it visits", "A formula for f written in closed form"], a: 0, why: "It never differentiates. Every decision is a comparison between two function values." } },
      { t: "A simplex has D + 1 points", b: `<p>A <b>simplex</b> is the simplest shape with volume in $D$ dimensions: $D+1$ points joined by all their line segments, faces and so on.</p><ul><li>1-D: a line segment (2 points)</li><li>2-D: a triangle (3 points)</li><li>3-D: a tetrahedron (4 points)</li></ul>`,
        v: `<svg class="fig" viewBox="0 0 520 150" style="max-height:150px"><line x1="40" y1="80" x2="140" y2="80" stroke="var(--violet)" stroke-width="3" class="draw"/><circle cx="40" cy="80" r="7" fill="var(--teal)" class="fi"/><circle cx="140" cy="80" r="7" fill="var(--rose)" class="fi"/><text x="90" y="125" class="fig-sub">1-D: 2 points</text>
          <polygon points="230,110 330,110 280,38" fill="rgba(206,130,255,.18)" stroke="var(--violet)" stroke-width="3" class="fi"/><circle cx="230" cy="110" r="7" fill="var(--teal)"/><circle cx="330" cy="110" r="7" fill="var(--amber)"/><circle cx="280" cy="38" r="7" fill="var(--rose)"/><text x="280" y="140" class="fig-sub">2-D: 3 points</text>
          <polygon points="400,112 490,118 450,80" fill="rgba(206,130,255,.18)" stroke="var(--violet)" stroke-width="2.5" class="fi"/><line x1="450" y1="22" x2="400" y2="112" stroke="var(--violet)" stroke-width="2.5"/><line x1="450" y1="22" x2="490" y2="118" stroke="var(--violet)" stroke-width="2.5"/><line x1="450" y1="22" x2="450" y2="80" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="4 3"/><circle cx="450" cy="22" r="6" fill="var(--rose)"/><text x="450" y="146" class="fig-sub">3-D: 4 points</text></svg>`,
        c: { q: "You minimise a function of 6 variables. How many points does the simplex hold?", o: ["7", "6", "12"], a: 0, why: "D + 1 = 7: one more point than there are dimensions, so the shape has volume in all 6." } },
      old[0],
      { t: "The centroid of the best side", b: `<p>Label the vertices so that $f(B)\\le f(G)\\le f(W)$ (best, good, worst). The <b>centroid</b> $C$ is the average of every vertex except the worst:</p><p>$$C=\\frac1D\\,(B+G+\\dots)$$</p><p>In 2-D that is the midpoint of the line $BG$, the <i>best side</i>. Example: $B=(4,2)$, $G=(2,6)$ give $C=\\tfrac12(6,8)=(3,4)$. Everything the algorithm does next is measured from $C$, in the direction from $W$ to $C$.</p>`,
        v: nmSVG({ pts: { B: { p: [4, 2], c: COLN.B, t: "(4, 2)", dy: 22 }, G: { p: [2, 6], c: COLN.G, t: "(2, 6)", dy: -13 }, W: { p: [9, 9], c: COLN.W, t: "(9, 9)", dy: -13 }, C: { p: [3, 4], c: COLN.C, r: 5, t: "C = (3, 4)", dx: -48, dy: 4 } }, polys: [{ names: ["B", "G", "W"], c: "var(--violet)", fill: "rgba(206,130,255,.14)" }], lines: [["W", "C"]] }),
        c: { q: "In 2-D, B = (6, 0), G = (2, 4) and W = (7, 9). What is the centroid C?", o: ["(4, 2)", "(5, 4.33)", "(2, 4)"], a: 0, why: "C averages the two best points only: ((6+2)/2, (0+4)/2) = (4, 2). The worst point W is not included." } },
      { t: "Choosing the starting simplex", b: `<p>You need $D+1$ starting points. A common choice: take your guess $\\mathbf{x}_0$ and make $D$ more points by changing <b>one coordinate at a time</b> by 10%. For $\\mathbf{x}_0=(-1,1)$ that gives $(-1,1)$, $(-1.1,1)$ and $(-1,1.1)$.</p><p><b>Edge case:</b> if a coordinate of $\\mathbf{x}_0$ is exactly 0, "times 1.1" changes nothing, so two points coincide and the simplex has no area. Use a small additive step instead.</p>`,
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
  const exR = exRes("R"),
    exE = exRes("E"),
    exEF = exRes("EF"),
    exM2 = exRes("M2"),
    exM1 = exRes("M1"),
    exS = exRes("S");
  // prettier-ignore

  L["a3-nm-ops"] = {
    sum: "Four moves, all measured from the centroid C of the best side: reflect W through C, expand if that was great, contract if it was poor, shrink everything towards B as a last resort.",
    steps: [
      { t: "Reflection", b: `<p>Flip the worst vertex through the centroid of the best side:</p><p>$$R = C + \\alpha\\,(C-W),\\qquad \\alpha>0,\\ \\text{usually }\\alpha=1$$</p><p>Accept $R$ if it is better than the good point: $f(R)<f(G)$. Example (a bowl with minimum at (3, 2)): $B=(1,2)$, $G=(0,1)$, $W=(0,0)$ with $f=4,10,13$. Then $C=(0.5,1.5)$, $R=(1,3)$ and $f(R)=5<10$: accept.</p>`,
        v: moveFig(exR, ["R"]),
        c: { q: "f(B) = 4, f(G) = 10, f(R) = 5. What happens?", o: ["Accept R in place of W, with no expansion", "Try an expansion beyond R, since it beat G", "Contract towards W, since R is not the best"], a: 0, why: "R beats G (5 < 10) but not B (5 > 4). That is good enough to accept, but not good enough to gamble on going further." } },
      { t: "Expansion", b: `<p>If the reflection beats even the best, $f(R)<f(B)$, the minimum is probably further along that line. Try</p><p>$$E = C + \\gamma\\,(C-W),\\qquad \\gamma>1,\\ \\text{usually }\\gamma=2$$</p><p>(measured from $C$, not from $R$). If $f(E)<f(R)$ accept $E$; otherwise keep $R$.</p><p>Left: $B=(1,1)$, $G=(0,1)$, $W=(0,0)$: $R=(1,2)$ has $f=4$ and $E=(1.5,3)$ has $f=3.25$, so $E$ wins. Right: $f(R)=0$ is already the true minimum, $f(E)=3.25$ is worse, so $R$ is kept.</p>`,
        v: F.frames([{ t: "<b>E</b> beats R: keep E", v: moveFig(exE, ["R", "E"], { w: 260, h: 220 }) }, { t: "<b>E</b> is worse: keep R", v: moveFig(exEF, ["R", "E"], { w: 260, h: 220 }) }]),
        c: { q: "f(B) = 1, f(R) = 0 and f(E) = 3.25. Which point replaces W?", o: ["R, because E is no better than R", "E, because it went furthest", "Neither: shrink the simplex"], a: 0, why: "Expansion is a gamble. f(E) = 3.25 is worse than f(R) = 0, so the gamble failed and we fall back on R." } },
      { t: "Contraction: two middle points", b: `<p>If the reflection is no better than the good point, $f(R)\\ge f(G)$, the step overshot. Consider two points on the line through $W$ and $C$:</p><p>$$M_1,\\,M_2 = C \\mp \\beta\\,(C-W),\\qquad 0<\\beta<1,\\ \\text{usually }\\beta=\\tfrac12$$</p><p>$M_1$ is <b>inside</b> (between $C$ and $W$), $M_2$ is <b>outside</b> (between $C$ and $R$). Accept $M_1$ if $f(M_1)<f(W)$ <i>and</i> $f(M_1)<f(M_2)$; accept $M_2$ if $f(M_2)<f(W)$ and $f(M_2)<f(M_1)$.</p>`,
        v: F.frames([{ t: "<b>M₂</b> (outside) wins", v: moveFig(exM2, ["R", "M1", "M2"], { w: 260, h: 220 }) }, { t: "<b>M₁</b> (inside) wins", v: moveFig(exM1, ["R", "M1", "M2"], { w: 260, h: 220 }) }]),
        c: { q: "R overshot. f(W) = 13, f(M₁) = 6.5 and f(M₂) = 8.5. Which point is accepted?", o: ["M₁ (the inside point)", "M₂ (the outside point)", "Neither"], a: 0, why: "Both beat W (13), and M₁ is lower than M₂ (6.5 < 8.5), so M₁ is accepted." } },
      { t: "Shrink: the last resort", b: `<p>If neither $M_1$ nor $M_2$ beats $W$, the valley has narrowed around $B$. Pull the other vertices towards the best point:</p><p>$$M = W+\\delta\\,(B-W),\\quad N = G+\\delta\\,(B-G),\\qquad 0<\\delta<1,\\ \\text{usually }\\delta=\\tfrac12$$</p><p>Example on the Rosenbrock function: $B=(2,3)$, $G=(-2,2)$, $W=(-0.5,2.5)$ with $f=101,\\,409,\\,508.5$. Then $f(R)=506.5\\ge409$, and $f(M_1)\\approx595.7$, $f(M_2)\\approx594.7$ are both worse than $f(W)$. Shrink: $M=(0.75,2.75)$ and $N=(0,2.5)$.</p><p class="faint">On a strictly convex $f$ a shrink can never happen, which is one reason it is rare in practice (it is also expensive: $D$ new evaluations).</p>`,
        v: moveFig(exS, ["R", "M1", "M2"], { shrinkTo: true, w: 420, h: 230 }),
        c: { q: "Neither contraction point is better than W. What does Nelder–Mead do?", o: ["Shrink every point except B halfway towards B", "Restart from a fresh random simplex of the same size", "Reflect again with a larger α and a longer step"], a: 0, why: "Nothing replaces W, so the simplex is rebuilt closer to the best point. B is the only vertex that stays still." } },
      { t: "The decision list", b: `<p>One round of the algorithm, in order:</p>${tbl(["Condition", "Move", "New vertex"], [["f(R) < f(B), then f(E) < f(R)", "expand", "E"], ["f(R) < f(B), but f(E) ≥ f(R)", "reflect", "R"], ["f(B) ≤ f(R) < f(G)", "reflect", "R"], ["f(R) ≥ f(G) and a middle point beats W (and the other middle point)", "contract", "M₁ or M₂"], ["otherwise", "shrink", "M, N"]])}<p>Then re-sort and repeat. Each round costs a handful of function evaluations, which is where the time goes.</p>`,
        v: F.flow(["Order B, G, W", "Centroid C", "Reflect R", { t: "good? bad?", c: "amber" }, { t: "Expand / Contract / Shrink", c: "violet" }], { loop: true }),
        c: { q: "f(R) < f(B), and then f(E) < f(R). Which vertex replaces W?", o: ["E", "R", "M₁"], a: 0, why: "A beaten best value triggers expansion, and E beat R, so the longer jump is kept." } },
      { t: "Watch it run", b: `<p>A full run on a simple bowl. Predict each choice before it happens. The faint outline is the previous simplex; the dotted line is the path of the best point.</p>`, v: (box, life) => opsRunner(box, life) },
      { t: "The four parameters and their costs", b: `<p>The constants are tunable: $\\alpha>0$ (reflection, 1), $\\gamma>1$ (expansion, 2), $0<\\beta<1$ (contraction, ½), $0<\\delta<1$ (shrink, ½). The standard choices are 1, 2, ½, ½.</p><p>Function evaluations in a 2-D round (this lecture's version, which computes both middle points):</p>`,
        v: F.bars([["reflect", 1, "teal"], ["expand (R, E)", 2, "violet"], ["contract (R, M₁, M₂)", 3, "amber"], ["shrink (R, M₁, M₂, M, N)", 5, "rose"]], { max: 5 }),
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
