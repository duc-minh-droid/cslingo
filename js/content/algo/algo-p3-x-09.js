/* algo-p3-x-09.js: 3.16 stopping (overflow) */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const { P2, ROSEN, contourCanvas, contourURL, nf, nmDraw, nmIter, nmScene, nmSolve, tbl } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  /* ============ 3.16 When to stop, and how well it works ============ */
  const ROS01 = (x, y) => Math.log(1 + ROSEN([-2 + 4 * x, -1 + 4 * y]));
  const RUN6 = nmSolve(ROSEN, [-1, 1], { x: 1e-6, f: 1e-6, n: 1000 });
  const SNAPS = (() => {
    const want = [0, 1, 2, 4, 8, 16, 32, 48, 64, RUN6.it],
      seen = new Set();
    return want.filter((k) => k <= RUN6.it && !seen.has(k) && seen.add(k));
  })();
  function rosenRunner(box, life) {
    const view = [-1.6, 1.6, -0.4, 2.2],
      url = contourURL(ROSEN, view, 200, 163);
    F.run(box, life, {
      code: [
        "start: x₀ and two 10% nudges",
        "run rounds of reflect / expand / contract",
        "snapshots after 1, 2, 4, 8 … rounds",
        "stop when the simplex is tiny",
      ],
      build(stage) {
        return nmScene(stage, {
          view,
          w: 480,
          h: 390,
          star: [1, 1],
          bg: (X, Y) =>
            `<image href="${url}" x="${X(view[0])}" y="${Y(view[3])}" width="${X(view[1]) - X(view[0])}" height="${Y(view[2]) - Y(view[3])}" preserveAspectRatio="none"/>`,
        });
      },
      *frames() {
        let prev = 0;
        for (let k = 0; k < SNAPS.length; k++) {
          const it = SNAPS[k],
            s = RUN6.snaps[it],
            ops = RUN6.ops.slice(prev, it),
            count = (n) => ops.filter((o) => o === n).length;
          const mv =
            it === 0
              ? ""
              : ` Since the last picture: ${[
                  ["reflect", "reflections"],
                  ["expand", "expansions"],
                  ["in", "inside contractions"],
                  ["out", "outside contractions"],
                  ["shrink", "shrinks"],
                ]
                  .filter(([n]) => count(n))
                  .map(([n, l]) => `${count(n)} ${l}`)
                  .join(", ")}.`;
          yield {
            S: s.S,
            trail: RUN6.trail.slice(0, it + 1),
            noF: false,
            noRoles: false,
            cap:
              it === 0
                ? `<b>Start.</b> x₀ = (−1, 1) and two points nudged by 10%: a tiny triangle at the left of the banana-shaped valley. Best f = ${nf(s.S[0].f)}; the minimum ★ is at (1, 1), with f = 0.`
                : it === RUN6.it
                  ? `<b>Round ${it}: stop.</b> The best vertex is (${nf(s.S[0].p[0], 4)}, ${nf(s.S[0].p[1], 4)}) with f = ${nf(s.S[0].f)}, after ${RUN6.ev} evaluations in all.${mv}`
                  : `<b>After round ${it}.</b> Best f = ${nf(s.S[0].f)} at ${P2(s.S[0].p)}.${mv}`,
            line: it === 0 ? 0 : it === RUN6.it ? 3 : 2,
            ask:
              k === 1
                ? {
                    q: "In the very first round, which vertex of the little triangle gets replaced? Tap it.",
                    pick: ".ns-v",
                    a: ["W"],
                    why: "Always the worst point. Here it is the one furthest up the valley wall, with the highest f.",
                  }
                : null,
          };
          prev = it;
        }
      },
      draw: nmDraw,
    });
  }
  /* every round of the real run, replayed to count the evaluations it spent */
  const COSTS = (() => {
    let S = [
      [-1, 1],
      [-1.1, 1],
      [-1, 1.1],
    ]
      .map((p) => ({ p, f: ROSEN(p) }))
      .sort((a, b) => a.f - b.f);
    return Array.from({ length: RUN6.it }, () => {
      const r = nmIter(S, ROSEN);
      S = r.next;
      return r.ev;
    });
  })();
  const CHEAP = Math.round((100 * COSTS.filter((c) => c <= 2).length) / COSTS.length),
    SHR = COSTS.filter((c) => c === 5).length;
  const TILE = { 1: "var(--teal)", 2: "var(--violet)", 3: "var(--amber)", 5: "var(--rose)" };
  /** One tile per round, coloured by its evaluations; the slider replays the run and keeps the running bill. */
  function roundsFig(host) {
    host.innerHTML = "";
    const box = el(
      `<div role="img" aria-label="One coloured square per round of a real Nelder-Mead run: green 1 evaluation, purple 2, orange 3, red 5."><div data-t style="display:flex;flex-wrap:wrap;gap:4px;min-height:52px"></div><div class="controls" data-s></div><p class="mono" data-x style="min-height:3em;margin:6px 0"></p><div data-l style="display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px"></div></div>`,
    );
    host.appendChild(box);
    qs("[data-l]", box).innerHTML = [
      [1, "1 evaluation: reflect"],
      [2, "2: stretch tried"],
      [3, "3: contraction"],
      [5, "5: shrink"],
    ]
      .map(
        ([c, t]) =>
          `<span><i style="display:inline-block;width:12px;height:12px;border-radius:4px;vertical-align:-1px;margin-right:5px;background:${TILE[c]}"></i>${t}</span>`,
      )
      .join("");
    const sl = N.slider("Rounds shown", 1, RUN6.it, 1, RUN6.it, (v) => String(v));
    const draw = (k) => {
      const part = COSTS.slice(0, k),
        sum = part.reduce((a, b) => a + b, 3);
      qs("[data-t]", box).innerHTML = part
        .map(
          (c, i) =>
            `<span title="round ${i + 1}: ${c} evaluation${c > 1 ? "s" : ""}" style="width:14px;height:14px;border-radius:4px;background:${TILE[c]}"></span>`,
        )
        .join("");
      qs("[data-x]", box).innerHTML =
        `After <b>${k}</b> round${k > 1 ? "s" : ""}: <b>${sum}</b> evaluations in all (the first 3 are the starting corners), about ${(sum / k).toFixed(1)} per round.`;
    };
    sl.onInput(draw);
    qs("[data-s]", box).appendChild(sl);
    draw(RUN6.it);
  }
  // prettier-ignore

  L["a3-nm-stop"] = {
    sum: "Nelder–Mead stops when the simplex is small (domain), when the vertex values agree (function), or when time runs out. It is cheap, needs only function values and is worth trying first, but it has no strong convergence guarantee and can be slow.",
    steps: [
      { t: "Three ways to stop", b: `<p>Terminate when <b>one</b> of these is met:</p><ul><li><b>Domain convergence:</b> all the vertices are sufficiently close together. Needed when $f$ may be discontinuous.</li><li><b>Function convergence:</b> the values at the vertices are sufficiently close.</li><li><b>Out of time:</b> a maximum number of iterations or function evaluations.</li></ul>`,
        v: F.flow(["Round done", { t: "Vertices close?", c: "violet" }, { t: "Values agree?", c: "amber" }, { t: "Out of time?", c: "rose" }, { t: "Stop", c: "teal" }]),
        c: { q: "Why is a domain test needed as well as the function test, when f might be discontinuous?", o: ["Values can agree while the vertices are still far apart", "Vertices are always cheaper to compare", "The function test is only for smooth functions"], a: 0, why: "On a flat plateau or across a jump, all vertices can have nearly the same value while the simplex is still large. Only the geometry tells you it has not settled." } },
      { t: "A trap: summing the values", b: `<p>The workshop code stops when the <b>sum</b> of the vertex values is below a tolerance. That only works because the Rosenbrock minimum has value 0. If the best possible value is 5, the sum of three vertices can never fall below 15, so the test never fires and the run only ends when the iteration limit hits.</p><p>The robust version compares the <i>spread</i> $\\max f-\\min f$ against the tolerance, which does not care where the minimum value sits.</p>`,
        v: tbl(["Function", "Best f", "Sum of 3 vertex values", "Sum test < 0.001?", "Spread test"], [["Rosenbrock", "0", "→ 0", "fires", "fires"], ["bowl + 5", "5", "→ 15", "never fires", "fires"]], 1),
        c: { q: "The minimum value of f is 5. A run stops when the sum of the three vertex values is below 0.001. What happens?", o: ["It never meets that test, so the iteration limit ends it", "It stops at once, since 15 is far from 0.001", "It stops when the simplex is as small as possible"], a: 0, why: "Near the minimum the three values are about 5 each, so the sum approaches 15 and never gets below 0.001. A spread test (max − min) would work." } },
      { t: "The Rosenbrock test function", b: `<p>To compare optimisers, people use a famous obstacle course: a long, curved, banana-shaped valley. Finding the valley is easy, because its walls are steep. Following its floor down to the bottom is hard: the floor is almost flat and it bends, so the best direction keeps changing. Drag the picture to look from different sides. The orange dot is the lowest point, at (1, 1).</p><p>To get a feel for the scores: at (1, 1) it is 0, at (0, 0) it is 1 and at (−1, 1) it is 4. Weak optimisers either crawl along the floor or get thrown up the walls.</p><details class="math-more"><summary>Show the maths</summary><p>$$f(\\mathbf{x})=\\sum_{i=1}^{D-1}100\\,(x_{i+1}-x_i^2)^2+\\sum_{i=1}^{D-1}(1-x_i)^2$$</p><p>It has its minimum at $x_i=1$ for all $i$, where $f=0$. In 2-D: $f(x,y)=100(y-x^2)^2+(1-x)^2$, so $f(1,1)=0$, $f(0,0)=1$, $f(-1,1)=4$. (The slide prints $x_{i+1}-x_i$; the usual form squares $x_i$.)</p></details>`,
        v: (box, life) => { F.surface3d(box, life, { f: ROS01, height: 250, points: [{ x: 0.75, y: 0.5, c: "#ff9600", label: "minimum (1, 1)" }] }); },
        c: { q: "A simplex is sitting on the floor of the banana valley, far from (1, 1). Why is progress slow there?", o: ["The floor is nearly flat and curves, so only small steps help", "All the points on the floor have exactly the same score as each other", "The valley walls are so gentle that uphill cannot be told from downhill"], a: 0, why: "Along the floor f barely changes, and the floor bends, so big steps overshoot into the steep walls. The simplex has to creep." } },
      { t: "Watch it on Rosenbrock", b: `<p>Snapshots from a real run started at $\\mathbf{x}_0=(-1,1)$, stopping when the vertices and their values are within $10^{-6}$. The triangle squeezes through the narrow valley and ends on ★. The exact number of rounds depends on the start and the tolerances.</p>`, v: (box, life) => rosenRunner(box, life) },
      { t: "Efficiency: where the time goes", b: `<p>Each round of Nelder–Mead is cheap to think about but can be costly to run: every test point means one evaluation of f (a simulation, say), and that dwarfs the algorithm's own bookkeeping. So we count evaluations.</p><p>Below is the real banana-valley run. Each square is one round, coloured by how many evaluations it cost. Slide to watch the bill grow. ${CHEAP}% of the rounds cost 1 or 2 evaluations and ${SHR ? `only ${SHR} round${SHR === 1 ? "" : "s"} needed a shrink (5)` : "no round needed a shrink (5), the costly last resort"}, so the average is about ${(RUN6.ev / RUN6.it).toFixed(1)} per round (<b>${RUN6.it} rounds, ${RUN6.ev} evaluations</b> in all).</p><p>The bookkeeping stays cheap too. The one corner that changed is slid into its place in the sorted list, and the centroid is fixed by swapping that corner's share instead of adding every corner up again. Example: the centroid of (2, 3) and (0, 1) is (1, 2). Swap (0, 1) for (4, 3) and the new centroid is (3, 3).</p><details class="math-more"><summary>Show the maths</summary><ul><li><b>Ordering:</b> after one vertex changes, insert it into the sorted list with insertion sort.</li><li><b>Centroid:</b> update the old one in $O(D)$ instead of re-summing: $C'=C-\\tfrac1D\\,x_{\\text{old}}+\\tfrac1D\\,x_{\\text{new}}$.</li><li><b>Shrink:</b> expensive ($D$ new evaluations), so it is rarely used in practice.</li></ul><p>Update example (2-D): $C=(1,2)$; swap $G=(0,1)$ for $(4,3)$: $C'=(1,2)-(0,0.5)+(2,1.5)=(3,3)$, the midpoint of $B=(2,3)$ and $(4,3)$.</p></details>`,
        v: (box) => roundsFig(box),
        c: { q: "One corner of a 50-dimensional simplex is replaced. What is the cheapest way to get the new centroid?", o: ["Subtract the old corner's share and add the new one's", "Add up all the corners again and divide by the count", "Re-evaluate f at every corner, then average the results"], a: 0, why: "Only one corner changed, so only its share of the average changes: take the old share out and put the new one in. Re-adding all the corners costs far more, and re-evaluating f is the most expensive step of all." } },
      { t: "Does it always converge?", b: `<p>Some convergence results hold if (1) the angles between the simplex edges stay bounded away from 0 and $\\pi$ (the simplex never flattens) and (2) $f$ at a vertex decreases every iteration.</p><p>But there are no general guarantees. Convergence can occasionally be extremely slow even for well-behaved functions, and McKinnon (1998) built <b>two-dimensional strictly convex</b> examples where Nelder–Mead converges to a point that is not even stationary. A flattened "sliver" simplex is the typical symptom.</p>`,
        v: `<svg class="fig" viewBox="0 0 520 140" style="max-height:140px"><polygon points="40,100 130,100 85,32" fill="rgba(88,204,2,.16)" stroke="var(--teal)" stroke-width="3" class="fi"/><text x="85" y="128" class="fig-sub">healthy simplex</text><polygon points="270,98 420,88 345,92" fill="rgba(255,75,75,.18)" stroke="var(--rose)" stroke-width="3" class="fi"/><circle cx="270" cy="98" r="5" fill="var(--rose)"/><circle cx="420" cy="88" r="5" fill="var(--rose)"/><circle cx="345" cy="92" r="5" fill="var(--rose)"/><text x="345" y="128" class="fig-sub">flattened: edge angles near 0 or π</text><text x="470" y="62" class="fig-sub" style="fill:var(--rose)">stalls</text></svg>`,
        c: { q: "Which condition is needed for the lecture's convergence results?", o: ["The simplex never degenerates (angles stay away from 0 and π)", "The function has a gradient everywhere", "The starting simplex is exactly centred on the minimum"], a: 0, why: "A flattened simplex can only explore a line or plane, so it can miss descent directions. The guarantees assume it stays properly shaped and f keeps decreasing." } },
      { t: "Using it, and picking an optimiser", b: `<p><b>Advantages:</b> it uses only function evaluations and does not assume $f$ is smooth. <b>Tools:</b> MATLAB <code>fminsearch</code>; Python <code>scipy.optimize.minimize(method='Nelder-Mead')</code>. <b>Remark:</b> if you want to optimise some general function, try this first, but expect it can be slow.</p>${tbl(["Situation", "Reach for"], [["Linear objective, linear constraints", "Simplex method (LP)"], ["Convex and differentiable, 1-D", "Solve f′(x) = 0 (bisection)"], ["One variable, bracketed, no derivative", "Golden section / Brent"], ["Several variables, no derivative, maybe noisy", "Nelder–Mead"]])}`,
        v: F.flow([{ t: "Linear program?", c: "violet" }, { t: "1 variable?", c: "amber" }, { t: "Derivatives available?", c: "teal" }, { t: "Else: Nelder–Mead", c: "blue" }]),
        c: { q: "You tune 4 settings of a noisy simulator. You have no gradient. What do you try first?", o: ["Nelder–Mead", "Golden section search", "The LP simplex method"], a: 0, why: "Golden section and Brent are one-dimensional, and LP needs a linear model. Nelder–Mead works in several dimensions on function values alone." } },
    ],
    guide: ["Pick the <b>Rosenbrock</b> function, leave domain and function tests on, and press <b>Run</b>.", "Turn on only the <b>sum of f</b> test with the <b>bowl + 5</b> function and see what ends the run.", "Try a loose tolerance (1e-2): where does the run stop?"],
  };
  N.register({
    id: "a3-nm-stop",
    subject: "algo",
    lecture: 3,
    order: 16,
    num: "3.16",
    title: "When to stop, and how well it works",
    blurb: "Stopping tests, Rosenbrock's banana valley, cost per round and the limits of Nelder–Mead.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const FN = {
        ros: { n: "Rosenbrock", f: ROSEN, view: [-1.6, 1.6, -0.4, 2.2], star: [1, 1] },
        bowl: { n: "bowl + 5", f: (p) => (p[0] - 2) ** 2 + (p[1] - 1) ** 2 + 5, view: [-2, 4, -1.5, 3], star: [2, 1] },
      };
      let fk = "ros",
        tol = 1e-4,
        cap = 100;
      const on = { x: true, f: true, sum: false };
      const card = el(`<div class="card"><div class="controls"><div id="fs"></div></div>
        <div class="controls"><label class="chk"><input type="checkbox" id="cx" checked> domain (vertices close)</label><label class="chk"><input type="checkbox" id="cf" checked> function (values close)</label><label class="chk"><input type="checkbox" id="cs"> sum of f (lab-sheet style)</label></div>
        <div class="controls"><span class="dim">Tolerance</span><div id="ts"></div><span class="dim">Max rounds</span><div id="cs2"></div></div>
        <div class="controls"><button class="btn primary" id="go">Run Nelder–Mead</button></div><canvas class="viz" id="cv"></canvas>
        <div class="stat-row"><div class="stat violet"><small>Rounds</small><b id="it">–</b></div><div class="stat teal"><small>Evaluations</small><b id="ev">–</b></div><div class="stat amber"><small>Best f</small><b id="bf">–</b></div><div class="stat"><small>Best point</small><b id="bp">–</b></div></div><p class="mono dim" id="why">Press Run.</p></div>`);
      root.appendChild(card);
      qs("#fs", card).appendChild(
        N.seg(
          Object.keys(FN).map((k) => [k, FN[k].n]),
          fk,
          (v) => {
            fk = v;
            paint(null);
          },
        ),
      );
      qs("#ts", card).appendChild(
        N.seg(
          [
            ["0.01", "1e-2"],
            ["0.0001", "1e-4"],
            ["0.000001", "1e-6"],
          ],
          String(tol),
          (v) => {
            tol = +v;
          },
        ),
      );
      qs("#cs2", card).appendChild(
        N.seg(
          [
            ["25", "25"],
            ["100", "100"],
            ["500", "500"],
          ],
          String(cap),
          (v) => {
            cap = +v;
          },
        ),
      );
      qs("#cx", card).onchange = (e) => (on.x = e.target.checked);
      qs("#cf", card).onchange = (e) => (on.f = e.target.checked);
      qs("#cs", card).onchange = (e) => (on.sum = e.target.checked);
      const cache = {};
      function paint(res) {
        const d = FN[fk],
          cv = qs("#cv", card),
          { ctx, w, h } = N.setupCanvas(cv, 280);
        if (w < 40) return;
        const C = N.colors(),
          [x0, x1, y0, y1] = d.view,
          X = (x) => ((x - x0) / (x1 - x0)) * w,
          Y = (y) => h - ((y - y0) / (y1 - y0)) * h;
        const img = cache[fk] || (cache[fk] = contourCanvas(d.f, d.view, 200, 140));
        ctx.drawImage(img, 0, 0, w, h);
        ctx.fillStyle = C.amber;
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("★", X(d.star[0]), Y(d.star[1]) + 6);
        if (!res) return;
        ctx.strokeStyle = "rgba(128,128,128,.8)";
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        res.trail.forEach((p, k) => (k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        res.S.forEach((v, k) => (k ? ctx.lineTo(X(v.p[0]), Y(v.p[1])) : ctx.moveTo(X(v.p[0]), Y(v.p[1]))));
        ctx.closePath();
        ctx.fillStyle = "rgba(206,130,255,.3)";
        ctx.fill();
        ctx.strokeStyle = C.violet;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(X(res.S[0].p[0]), Y(res.S[0].p[1]), 5, 0, 7);
        ctx.fillStyle = C.teal;
        ctx.fill();
      }
      let last = null;
      qs("#go", card).onclick = () => {
        const d = FN[fk],
          res = nmSolve(d.f, [-1, 1], { x: on.x ? tol : null, f: on.f ? tol : null, sum: on.sum ? tol : null, n: cap });
        last = res;
        paint(res);
        qs("#it", card).textContent = res.it;
        qs("#ev", card).textContent = res.ev;
        qs("#bf", card).textContent = nf(res.S[0].f, 4);
        qs("#bp", card).textContent = P2(res.S[0].p.map((v) => +v.toFixed(3)));
        qs("#why", card).textContent = "Stopped: " + res.why + ".";
      };
      life.onResize(() => paint(last));
      paint(null);
      root.appendChild(
        predict({
          id: "a3-nms-1",
          q: "Choose the bowl + 5 function and tick only the sum-of-f test. What ends the run?",
          opts: [
            "The round limit, because the sum never gets near the tolerance",
            "The sum test, within a few rounds of starting",
            "The domain test, as it is the strictest of the three",
          ],
          a: 0,
          why: "The minimum value is 5, so the three vertex values sum to about 15 and never go below 1e-2 or 1e-4. Only the round limit ends the run.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-nms-2",
          q: "Rosenbrock with a loose tolerance of 1e-2 (domain and function tests on). Where does the run stop?",
          opts: [
            "Short of (1, 1), near (0.86, 0.73), as the values already agree",
            "Exactly at (1, 1), the true minimum of the function",
            "It never stops, as the valley is so long and curved",
          ],
          a: 0,
          why: "The valley floor is so flat along its length that the three vertex values differ by less than 0.01 well before the simplex reaches (1, 1). Tighter tolerances (1e-6) get to (1, 1).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Stop on: vertices close (domain), values close (function), or out of time. Compare the <b>spread</b> of values, not their sum.",
            "Cost is counted in function evaluations (about 2-3 per round here); keep centroid and ordering updates cheap.",
            "Only function values, no smoothness needed, so try it first. But no strong guarantee: it can stall or crawl.",
          ],
          "Stop when the simplex is tiny or the values agree, and never trust it blindly.",
        ),
      );
    },
  });
})();
