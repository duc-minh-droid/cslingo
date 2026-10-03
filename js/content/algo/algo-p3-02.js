(function () {
  const partScope = (NIC.shared.algoP3 = NIC.shared.algoP3 || {});
  const { Q, WALK, lpSVG, nice, qa, qdv, qm, qs_, qt, qv } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

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
  Object.assign(partScope, { BF, PHI });
})();
