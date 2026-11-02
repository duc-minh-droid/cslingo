/* Data Science (COM3021), Lecture 9: batch and online machine learning.
   This part: shared helpers (seeded data, the one-weight courier model, small SVG charts, the batching diagram) and
   ds9-descent (9.1, gradient descent, epochs and full batch learning). */
(function () {
  const S = (NIC.shared.ds9 = NIC.shared.ds9 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 9, ...m });

  /* ---------- helpers shared with the other Lecture 9 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const mm = (html) => `<details class="math-more"><summary>Show the maths</summary>${html}</details>`;
  /** Numbers for display: at most d decimals, a real minus sign. */
  const fm = (v, d = 2) => String(+(+v).toFixed(d)).replace("-", "−");
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        String(v),
        cb,
      ),
    );
  const stats = (list) =>
    `<div class="stat-row">${list.map(([c, l]) => `<div class="stat ${c}"><small>${l}</small><b>–</b></div>`).join("")}</div>`;
  const setStats = (box, vals) => box.querySelectorAll(".stat b").forEach((b, i) => (b.textContent = vals[i]));
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)", w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${s}px var(--sans);fill:${c}">${t}</text>`;

  /* Seeded randomness, so every learner (and every test) sees the same data. */
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  /* The model: a courier app predicts minutes = w × km. One weight, so the cost curve is a simple bowl. */
  const trips = (n, w, seed, sd = 1.5) => {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => {
      const x = 1 + (i % 4);
      return { x, y: Math.max(1, w * x + sd * gauss(r)) };
    });
  };
  const loss = (d, w) => d.reduce((s, p) => s + (w * p.x - p.y) ** 2, 0) / d.length;
  const grad = (d, w) => d.reduce((s, p) => s + 2 * p.x * (w * p.x - p.y), 0) / d.length;
  const best = (d) => d.reduce((s, p) => s + p.x * p.y, 0) / d.reduce((s, p) => s + p.x * p.x, 0);
  /** One epoch of (mini-)batch gradient descent: shuffle, then one update per batch of B. Returns the loss after each. */
  function epoch(d, w, B, eta, seed) {
    const r = rng(seed),
      idx = d.map((_, i) => i).sort(() => r() - 0.5),
      out = [];
    for (let i = 0; i < d.length; i += B) {
      const b = idx.slice(i, i + B).map((k) => d[k]);
      w -= eta * grad(b, w);
      out.push({ seen: i + b.length, w, l: loss(d, w) });
    }
    return { w, out };
  }

  /** A plain chart frame: returns data-to-pixel maps and wrap(inner) for the finished svg. */
  function chart({ w = 520, h = 210, x, y, xl = "", yl = "", tx: tX = [], ty: tY = [], label }) {
    const P = { l: 40, r: 14, t: 16, b: 30 };
    const X = (v) => P.l + ((v - x[0]) / (x[1] - x[0])) * (w - P.l - P.r);
    const Y = (v) => P.t + (1 - (Math.max(y[0], Math.min(y[1], v)) - y[0]) / (y[1] - y[0])) * (h - P.t - P.b);
    const frame =
      `<line x1="${P.l}" y1="${h - P.b}" x2="${w - P.r}" y2="${h - P.b}" stroke="var(--line-2)" stroke-width="2"/><line x1="${P.l}" y1="${P.t}" x2="${P.l}" y2="${h - P.b}" stroke="var(--line-2)" stroke-width="2"/>` +
      tX.map((v) => tx(X(v), h - P.b + 15, fm(v), { s: 10.5, c: "var(--text-faint)" })).join("") +
      tY.map((v) => tx(P.l - 6, Y(v) + 4, fm(v), { s: 10.5, c: "var(--text-faint)", a: "end" })).join("") +
      (xl ? tx(w - P.r, h - 3, xl, { s: 11, c: "var(--text-faint)", a: "end" }) : "") +
      (yl ? tx(P.l + 6, P.t - 4, yl, { s: 11, c: "var(--text-faint)", a: "start" }) : "");
    const inside = (v) => v >= x[0] && v <= x[1];
    const path = (pts, c, extra = "") =>
      `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join("")}" fill="none" stroke="var(--${c})" stroke-width="2.5" stroke-linejoin="round" ${extra}/>`;
    const dot = (px, py, c, r = 5, extra = "") =>
      `<circle cx="${X(px).toFixed(1)}" cy="${Y(py).toFixed(1)}" r="${r}" fill="var(--${c})" stroke="var(--panel)" stroke-width="1.5" ${extra}/>`;
    return { X, Y, inside, path, dot, wrap: (inner) => svg(w, h, frame + inner, label) };
  }
  const curve = (f, a, b, n = 80) =>
    Array.from({ length: n + 1 }, (_, i) => [a + ((b - a) * i) / n, f(a + ((b - a) * i) / n)]);

  Object.assign(S, { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, rng, gauss, trips, loss, grad, best });
  Object.assign(S, { epoch, chart, curve });

  /* ---------- figures for 9.1: one test trip of 1 km that really took 4 minutes; cost = (w − 4)² ---------- */
  const cost = (w) => (w - 4) ** 2;
  const bowl = (wide) =>
    chart({
      x: wide ? [-6, 14] : [-2, 10],
      y: [0, wide ? 100 : 40],
      xl: "weight w (minutes per km)",
      yl: "cost",
      tx: wide ? [-4, 0, 4, 8, 12] : [0, 2, 4, 6, 8, 10],
      ty: wide ? [0, 50, 100] : [0, 20, 40],
      label: "A bowl-shaped cost curve with its lowest point at weight 4",
    });

  /** Slider on the weight: the ball sits on the bowl; optionally the tangent (the gradient) and the downhill arrow. */
  function weightFig(box, slope) {
    const C = bowl(false),
      sl = N.slider("Weight w", 0, 10, 0.5, 8, (v) => fm(v));
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    box.firstChild.append(sl);
    const draw = (w) => {
      const g = 2 * (w - 4),
        tan = [w - 1.6, w + 1.6].map((v) => [v, cost(w) + g * (v - w)]);
      const dir = g > 0 ? -1 : 1;
      const arrow =
        slope && g !== 0
          ? `<path d="M${C.X(w)} ${C.Y(cost(w)) - 16}h${dir * 46}" stroke="var(--teal)" stroke-width="3"/><path d="M${C.X(w) + dir * 52} ${C.Y(cost(w)) - 16}l${-dir * 9} -6v12z" fill="var(--teal)"/>`
          : "";
      box.children[1].innerHTML = C.wrap(
        C.path(curve(cost, -2, 10), "blue") +
          (slope ? C.path(tan, "rose", 'stroke-dasharray="6 4"') : "") +
          arrow +
          C.dot(w, cost(w), "rose", 8) +
          C.dot(4, 0, "teal", 5),
      );
      box.lastChild.innerHTML = slope
        ? `At w = ${fm(w)} the slope is <b>${fm(g)}</b>. ${g > 0 ? "Uphill is to the right, so the step goes <b>left</b>." : g < 0 ? "Uphill is to the left, so the step goes <b>right</b>." : "Flat: this is the bottom, so there is nowhere downhill to go."}`
        : `Guess <b>${fm(w)} min per km</b>: the 1 km trip is predicted at ${fm(w)} min, ${fm(Math.abs(w - 4))} min off. Cost = ${fm(Math.abs(w - 4))}² = <b>${fm(cost(w))}</b>.`;
    };
    sl.onInput(draw);
    draw(8);
  }

  /** Stepper: gradient descent from w = 10 with learning rate 0.25. Every number comes from the update rule. */
  function descentRun(box, life) {
    const C = bowl(false);
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = C.wrap(C.path(curve(cost, -2, 10), "blue") + C.dot(4, 0, "teal") + "<g></g>");
        return stage.querySelector("svg g:last-child");
      },
      *frames() {
        let w = 10;
        const eta = 0.25,
          trail = [w];
        yield { trail: [...trail], cap: `Start at <b>w = 10</b>. Cost (10 − 4)² = ${cost(10)}.` };
        for (let k = 1; k <= 5; k++) {
          const g = 2 * (w - 4),
            nw = w - eta * g;
          trail.push(nw);
          yield {
            trail: [...trail],
            cap: `Step ${k}: slope ${fm(g)}. Move 0.25 × ${fm(g)} = ${fm(eta * g)} downhill: <b>w = ${fm(nw, 3)}</b>, cost ${fm(cost(nw), 3)}.`,
          };
          w = nw;
        }
      },
      draw(g, f) {
        g.innerHTML =
          C.path(
            f.trail.map((w) => [w, cost(w)]),
            "amber",
            'stroke-dasharray="4 3"',
          ) +
          f.trail
            .map((w, i) =>
              C.dot(w, cost(w), i === f.trail.length - 1 ? "rose" : "amber", i === f.trail.length - 1 ? 8 : 4),
            )
            .join("");
      },
    });
  }

  /** Learning-rate picker: the path of 6 steps from w = 10 on the wide bowl. */
  function ratesFig(box) {
    const C = bowl(true);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (eta) => {
      let w = 10;
      const ws = [w];
      for (let k = 0; k < 6; k++) ws.push((w = w - eta * 2 * (w - 4)));
      const shown = ws.filter((v, i) => ws.slice(0, i + 1).every(C.inside));
      box.children[1].innerHTML = C.wrap(
        C.path(curve(cost, -6, 14), "blue") +
          C.path(
            shown.map((v) => [v, cost(v)]),
            "amber",
          ) +
          shown.map((v, i) => C.dot(v, cost(v), i === shown.length - 1 ? "rose" : "amber", i ? 5 : 7)).join(""),
      );
      const f = 1 - 2 * eta,
        gone = shown.length < ws.length;
      box.lastChild.innerHTML = `Learning rate <b>${eta}</b>: each step multiplies the distance to the bottom by ${fm(f)}. ${gone ? `The ball overshoots further every time and leaves the chart after ${shown.length - 1} steps: it <b>diverges</b>.` : f < 0 ? `It jumps across the bottom and back, but still settles: after 6 steps w = ${fm(ws[6], 3)}.` : `After 6 steps w = ${fm(ws[6], 3)}.`}`;
    };
    seg(box.firstChild, "0.1:0.1 (small)|0.25:0.25|0.75:0.75|1.1:1.1 (too big)", "0.1", (v) => draw(+v));
    draw(0.1);
  }

  /** Stepper: three epochs of full batch learning on 4 trips. Forward pass row by row, backward pass, update. */
  function epochRun(box, life) {
    const T = [
      [1, 4],
      [2, 8],
      [3, 12],
      [2, 8],
    ];
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = `<div class="ds9-pass"></div><table class="ds9-tbl"><thead><tr><th>Trip</th><th>km</th><th>Real min</th><th>Predicted</th><th>Error</th></tr></thead><tbody>${T.map((t, i) => `<tr><td>${i + 1}</td><td>${t[0]}</td><td>${t[1]}</td><td></td><td></td></tr>`).join("")}</tbody></table><div class="ds9-w"></div>`;
        return stage;
      },
      *frames() {
        let w = 6;
        const eta = 0.05;
        for (let e = 1; e <= 3; e++) {
          const rows = [];
          yield { e, w, rows: [], on: -1, ph: "forward", cap: `<b>Epoch ${e}</b> starts with w = ${fm(w, 3)}.` };
          for (const [i, [x, y]] of T.entries()) {
            rows.push([fm(w * x, 3), fm(w * x - y, 3)]);
            yield {
              e,
              w,
              rows: [...rows],
              on: i,
              ph: "forward",
              cap: `Forward pass, trip ${i + 1}: ${fm(w, 3)} × ${x} = ${fm(w * x, 3)} min, error ${fm(w * x - y, 3)}.`,
            };
          }
          const g = (2 * T.reduce((s, [x, y]) => s + x * (w * x - y), 0)) / T.length;
          yield {
            e,
            w,
            rows,
            on: -1,
            ph: "backward",
            cap: `Backpropagation: average the errors (weighted by km) into the gradient, <b>${fm(g, 3)}</b>.`,
          };
          const nw = w - eta * g;
          yield {
            e,
            w: nw,
            rows,
            on: -1,
            ph: "update",
            cap: `Update once: w = ${fm(w, 3)} − 0.05 × ${fm(g, 3)} = <b>${fm(nw, 3)}</b>. One epoch, one update.`,
          };
          w = nw;
        }
      },
      draw(sc, f) {
        sc.querySelector(".ds9-pass").innerHTML = ["forward", "backward", "update"]
          .map(
            (p) =>
              `<span class="ds9-pill ${f.ph === p ? "on" : ""}">${p === "forward" ? "forward pass" : p === "backward" ? "backward pass" : "update"}</span>`,
          )
          .join("");
        sc.querySelectorAll("tbody tr").forEach((tr, i) => {
          tr.classList.toggle("on", f.on === i);
          tr.children[3].textContent = f.rows[i] ? f.rows[i][0] : "";
          tr.children[4].textContent = f.rows[i] ? f.rows[i][1] : "";
        });
        sc.querySelector(".ds9-w").innerHTML = `Epoch <b>${f.e}</b> of 3 · weight <b>${fm(f.w, 3)}</b>`;
      },
    });
  }

  /** Per-trip gradients and what each choice of batch averages them to. */
  function estimateFig(box) {
    const G = [4, 18, 10, 30, 2, 14],
      C = chart({
        x: [0.3, 6.7],
        y: [0, 32],
        tx: [1, 2, 3, 4, 5, 6],
        ty: [0, 13, 30],
        xl: "trip",
        yl: "gradient from that trip",
        label: "Gradients from six trips: 4, 18, 10, 30, 2 and 14; their average is 13",
      });
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (v) => {
      const use = v === "all" ? [0, 1, 2, 3, 4, 5] : v.split(",").map(Number),
        est = use.reduce((s, i) => s + G[i], 0) / use.length;
      const bars = G.map((g, i) => {
        const on = use.includes(i);
        return `<rect x="${C.X(i + 1) - 18}" y="${C.Y(g)}" width="36" height="${C.Y(0) - C.Y(g)}" rx="5" fill="color-mix(in srgb,var(--${on ? "blue" : "line-2"}) ${on ? 45 : 30}%,var(--panel))" stroke="var(--${on ? "blue" : "line-2"})" stroke-width="2"/>`;
      }).join("");
      box.children[1].innerHTML = C.wrap(
        bars +
          C.path(
            [
              [0.3, 13],
              [6.7, 13],
            ],
            "teal",
            'stroke-dasharray="6 4"',
          ) +
          C.path(
            [
              [0.3, est],
              [6.7, est],
            ],
            "rose",
          ) +
          tx(C.X(6.6), C.Y(13) - 6, "true gradient 13", { a: "end", s: 11, c: "var(--teal-ink)" }),
      );
      box.lastChild.innerHTML = `Average of the blue trips: <b>${fm(est)}</b> (red line). ${est === 13 ? "That <b>is</b> the true gradient: every trip counted." : `An <b>estimate</b>: off by ${fm(Math.abs(est - 13))} from the true 13.`}`;
    };
    seg(box.firstChild, "all:All 6 trips|0,1:Trips 1–2|2,3:Trips 3–4|4,5:Trips 5–6|3:Trip 4 alone", "all", draw);
    draw("all");
  }
  Object.assign(S, { cost, bowl });

  /** 9.1 demo: walk down the bowl with a chosen learning rate. */
  function walker(box) {
    const C = bowl(true);
    let eta = 0.25,
      w = 10,
      trail = [10];
    box.innerHTML = `<div class="controls" data-r></div><div data-f></div><div class="controls"><button class="btn primary" data-s>Step</button><button class="btn" data-t>Run 10 steps</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["blue", "Weight w"],
        ["rose", "Cost"],
        ["violet", "Steps taken"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, box);
    const draw = (msg) => {
      const sh = trail.filter((v, i) => trail.slice(0, i + 1).every(C.inside));
      $("[data-f]").innerHTML = C.wrap(
        C.path(curve(cost, -6, 14), "blue") +
          C.path(
            sh.map((v) => [v, cost(v)]),
            "amber",
          ) +
          sh
            .map((v, i) => C.dot(v, cost(v), i === sh.length - 1 ? "rose" : "amber", i === sh.length - 1 ? 8 : 4))
            .join(""),
      );
      setStats(box, [Math.abs(w) > 1e5 ? "huge" : fm(w, 3), cost(w) > 1e5 ? "huge" : fm(cost(w), 3), trail.length - 1]);
      $("[data-c]").innerHTML = msg;
    };
    const step = (n) => {
      const before = cost(w);
      for (let k = 0; k < n; k++) trail.push((w = w - eta * 2 * (w - 4)));
      draw(
        cost(w) > before
          ? "The cost went <b>up</b>: each step jumps past the bottom by more than it started. This learning rate diverges."
          : cost(w) < 0.001
            ? "Down at the bottom: w ≈ 4, the best weight."
            : `Cost fell from ${fm(before, 3)} to ${fm(cost(w), 3)}.`,
      );
    };
    seg($("[data-r]"), "0.1:Learning rate 0.1|0.25:0.25|0.75:0.75|1.1:1.1", "0.25", (v) => {
      eta = +v;
      w = 10;
      trail = [10];
      draw(`Learning rate ${v}. Start again at w = 10.`);
    });
    $("[data-s]").onclick = () => step(1);
    $("[data-t]").onclick = () => step(10);
    $("[data-z]").onclick = () => {
      w = 10;
      trail = [10];
      draw("Back at w = 10.");
    };
    draw("Start at w = 10. Press <b>Step</b>.");
  }

  /* ============ 9.1 Gradient descent, epochs and full batch learning ============ */
  reg({
    id: "ds9-descent",
    order: 1,
    num: "9.1",
    title: "Gradient descent and full batch learning",
    blurb:
      "How a model learns by walking downhill, what an epoch is, and why full batch learning uses the true gradient.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Walk down the cost bowl</h2><span class="tag">pick a learning rate</span></div><div></div></div>`,
      );
      root.appendChild(card);
      walker(card.lastElementChild);
      root.appendChild(
        pr(
          "ds9-descent-1",
          "Pick <b>learning rate 1.1</b> and press <b>Step</b> a few times. What happens to the cost?",
          [
            "It grows: each step overshoots further",
            "It falls slowly but steadily towards 0",
            "It drops to 0 in a single step and stays there",
          ],
          "With 1.1 each step multiplies the distance to the bottom by 1 − 2 × 1.1 = −1.2: it flips side and grows by a fifth, so the cost rises and the weight diverges.",
        ),
      );
      root.appendChild(
        pr(
          "ds9-descent-2",
          "Pick <b>learning rate 0.75</b> and press <b>Step</b> repeatedly. How does the ball move?",
          [
            "It zigzags across the bottom, landing closer each time",
            "It creeps down one side and never crosses the bottom",
            "It jumps further away each time and leaves the chart",
          ],
          "Each step multiplies the distance by 1 − 2 × 0.75 = −0.5: the sign flips (other side) but the size halves, so it zigzags in and still settles at 4.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Gradient descent</b> learns by repeatedly stepping the weights <b>downhill</b> on the cost: the <b>gradient</b> (slope) says which way is uphill.",
            "The <b>learning rate</b> sets the step size: too small is slow, too big overshoots and can <b>diverge</b>.",
            "Neural networks train over <b>epochs</b>: each epoch is one <b>forward pass</b> and one <b>backpropagation</b> pass over the training data.",
            "<b>Full batch learning</b> uses <b>all</b> the data to compute the <b>true gradient</b>: one update per epoch. Mini-batches compute an <b>approximation</b>.",
            "Batch learning trains <b>before deployment</b>: simpler to reason about, with <b>smoother, more consistent convergence</b>.",
          ],
          "Slope says which way, learning rate says how far, and the batch says how much data you trust per step.",
        ),
      );
    },
  });

  L["ds9-descent"] = {
    sum: "<b>Gradient descent</b> steps the weights downhill on the cost, by the <b>learning rate</b> times the <b>gradient</b>. An <b>epoch</b> is one pass over the training data; <b>full batch learning</b> uses all of it to compute the <b>true gradient</b>.",
    steps: [
      st(
        "Learning means lowering a cost",
        `<p>A courier app predicts how long a delivery takes: <b>minutes = w × km</b>. Training means finding a good <b>weight w</b>. To judge a guess we need a <b>cost</b>: a number that is big when predictions are wrong.</p><p>Worked example: a 1 km test trip really took 4 minutes. Guess w = 7 and the model says 7 minutes, 3 off, so the cost (squared error) is 3² = 9. Guess w = 4 and the cost is 0. Drag the weight: the cost traces a <b>bowl</b>, and learning means getting to the bottom.</p>${mm("<p>For one trip of $x = 1$ km taking $y = 4$ minutes, the squared error is</p>$$C(w) = (w x - y)^2 = (w - 4)^2$$<p>a parabola with its minimum $C = 0$ at $w = 4$. With many trips the cost is the average of their squared errors, still a bowl in $w$.</p>")}`,
        (box) => weightFig(box, false),
        mc(
          "Guess w = 6 for the 1 km trip that took 4 minutes. What is the cost?",
          ["4", "2", "36"],
          "The prediction is 6 minutes, 2 too many, and the cost squares the error: 2² = 4.",
          "Error first, then square it.",
        ),
      ),
      st(
        "The gradient points uphill",
        `<p>We cannot see the whole bowl, only how steep it is where we stand. That steepness is the <b>gradient</b> (the slope). A positive slope means the cost rises to the right, so we should step <b>left</b>; a negative slope means step right.</p><p>Worked example: at w = 8 the slope is +8, so step left. At w = 1 the slope is −6, so step right. At w = 4 the slope is 0: we are at the bottom. Drag the weight and watch the dashed tangent and the green arrow.</p>${mm("<p>The gradient is the derivative of the cost:</p>$$\\frac{dC}{dw} = 2(w - 4)$$<p>At $w = 8$ it is $2 \\times 4 = 8$; at $w = 1$ it is $2 \\times (-3) = -6$. Gradient descent always moves in the direction of $-\\frac{dC}{dw}$.</p>")}`,
        (box) => weightFig(box, true),
        mc(
          "At the current weight the gradient is −5. Which way should gradient descent move w?",
          ["Up: increase w", "Down: decrease w", "Nowhere: a negative slope means it is at the bottom"],
          "A negative slope means the cost falls as w grows, so downhill is towards larger w. Gradient descent moves against the gradient.",
        ),
      ),
      st(
        "One step: learning rate × gradient",
        `<p>Each step moves the weight <b>against</b> the gradient, scaled by the <b>learning rate</b>: new w = w − learning rate × gradient.</p><p>Worked example with learning rate 0.25, starting at w = 10. The slope is 2 × (10 − 4) = 12, so move 0.25 × 12 = 3: w = 7. Next the slope is 6, move 1.5: w = 5.5. Then 4.75, then 4.375. Each step halves the distance to 4. Press play to watch the incremental steps.</p>${mm("<p>The update rule, with learning rate $\\eta$:</p>$$w_{t+1} = w_t - \\eta \\frac{dC}{dw}(w_t)$$<p>Here $w_{t+1} - 4 = (w_t - 4)(1 - 2\\eta)$. With $\\eta = 0.25$ that factor is $0.5$, so the distance halves every step: 6, 3, 1.5, 0.75 …</p>")}`,
        (box, life) => descentRun(box, life),
        mc(
          "Learning rate 0.25, current w = 6. Where is w after one step?",
          ["5", "4", "5.5"],
          "The slope is 2 × (6 − 4) = 4. The step is 0.25 × 4 = 1, so w goes from 6 to 5.",
          "Slope first: 2 × (6 − 4).",
        ),
      ),
      st(
        "Too small, too big",
        `<p>The learning rate is a trade-off. Too small and the ball creeps: lots of steps for little progress. Too big and every step jumps <b>past</b> the bottom. A bit too big still settles, zigzagging in; much too big lands further away each time and the weights <b>diverge</b>.</p><p>Worked example from w = 10: with 0.1 the distance to 4 shrinks by a fifth each step (6, 4.8, 3.84 …). With 1.1 it goes 6, then 7.2 on the other side, then 8.64: it grows. Try each rate.</p>${mm("<p>Each step multiplies the distance by $(1 - 2\\eta)$:</p>$$|w_{t} - 4| = |1 - 2\\eta|^{t}\\,|w_0 - 4|$$<p>It shrinks when $|1 - 2\\eta| < 1$, that is $0 < \\eta < 1$ for this bowl. For $\\eta = 1.1$ the factor is $-1.2$: it flips side and grows.</p>")}`,
        (box) => ratesFig(box),
        mc(
          "The cost goes up after every step. What is the most likely fix?",
          ["Lower the learning rate", "Raise the learning rate", "Train for more epochs at the same learning rate"],
          "A rising cost means the steps overshoot the bottom by more each time. Smaller steps stop the overshoot; more epochs would just diverge further.",
        ),
      ),
      st(
        "Epochs: forward pass, backward pass",
        `<p>Neural networks are trained over a series of <b>epochs</b>. Each epoch is one <b>forward pass</b> (predict every training example and measure the errors) and one <b>backpropagation</b> pass (turn those errors into gradients for the weights).</p><p>Worked example: 4 trips that took exactly 4 minutes per km, starting at w = 6. Forward: predictions 6, 12, 18, 12, errors 2, 4, 6, 4. Backward: gradient 18. Update with learning rate 0.05: w = 6 − 0.9 = 5.1. Epoch 2 starts from 5.1. Step through three epochs.</p>${mm("<p>For mean squared error over $n$ trips, the gradient is</p>$$\\frac{dC}{dw} = \\frac{2}{n}\\sum_{i=1}^{n} x_i\\,(w x_i - y_i)$$<p>At $w = 6$: $\\frac{2}{4}(1\\cdot2 + 2\\cdot4 + 3\\cdot6 + 2\\cdot4) = \\frac{2}{4}\\cdot 36 = 18$. A network does the same through many layers: backpropagation is the chain rule applied layer by layer.</p>")}`,
        (box, life) => epochRun(box, life),
        mc(
          "What does one epoch of training involve?",
          [
            "A forward and a backward pass over all the training data",
            "A forward pass over one randomly chosen training example",
            "Training repeatedly until the cost reaches its minimum",
          ],
          "An epoch is one full pass over the training data: forward to get predictions and errors, backward to get the gradients.",
        ),
      ),
      st(
        "True gradient or an estimate",
        `<p>In each epoch we can either compute the <b>true gradient</b> using <b>all</b> the available data, or compute an <b>approximation</b> of it from part of the data.</p><p>Worked example: six trips give gradients 4, 18, 10, 30, 2 and 14. Their average, 13, is the true gradient. Trips 1–2 alone average 11; trips 3–4 average 20; trip 4 on its own says 30. Each part gives a different estimate. Pick a batch and compare the red line with the green one.</p>${mm("<p>True gradient over all $n$ examples, and the estimate from a batch $B$:</p>$$g = \\frac{1}{n}\\sum_{i=1}^{n} g_i \\qquad \\hat g = \\frac{1}{|B|}\\sum_{i \\in B} g_i$$<p>Here $g = 78/6 = 13$. A random batch gives the right answer <b>on average</b>, but any single batch can be off.</p>")}`,
        (box) => estimateFig(box),
        mc(
          "Trips give gradients 6, 2, 10 and 6. A batch uses only the first two trips. What does it estimate, against the true gradient?",
          ["4, against a true 6", "6, against a true 4", "8, against a true 6"],
          "The batch averages 6 and 2 to get 4. The true gradient averages all four: 24 ÷ 4 = 6.",
          "Average two numbers, then all four.",
        ),
      ),
      st(
        "Full batch learning",
        `<p><b>Full batch learning</b> uses <b>all the data</b> and computes the <b>true gradient</b>, so there is exactly <b>one update per epoch</b>. The model is trained <b>before deployment</b> and then used as it is.</p><p>Worked example: 8 trips all feed iteration 1, the gradient is computed once, the weight is updated once, and epoch 2 starts. It is the usual way models are trained because it is <b>simpler to reason about</b> and gives <b>smoother, more consistent convergence</b>: the same data gives the same step every time.</p>${mm("<p>With $n$ examples and batch size $b$, an epoch makes $n / b$ updates. Full batch is $b = n$:</p>$$\\text{updates per epoch} = \\frac{n}{n} = 1$$")}`,
        (box, life) => S.pipes(box, life, 8, false),
        mc(
          "Why does full batch learning converge so smoothly?",
          [
            "Every step uses the true gradient, not a sampled one",
            "It uses a larger learning rate than the other methods",
            "It updates the weight after every single example",
          ],
          "With all the data in every step there is no sampling noise: the step is the same each time you run it.",
        ),
      ),
    ],
    guide: [
      "Press <b>Step</b> a few times with <b>Learning rate 0.1</b>, then <b>Reset</b> and try <b>0.25</b>. Compare <b>Steps taken</b>.",
      "Try <b>0.75</b> and watch the ball zigzag across the bottom.",
      "Try <b>1.1</b> and press <b>Run 10 steps</b>: watch the <b>Cost</b>. Then answer the questions after the demo.",
    ],
  };
})();
