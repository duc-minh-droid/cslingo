/* Data Science (COM3021), Lecture 11: distributed machine learning.
   This part: the SGD model shared with the workshop, and ds11-sgd (11.2, minibatch SGD run on M machines with an
   all-reduce; its idle time; beyond the slides: stragglers, parameter servers, data and model parallelism). */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, tint, box, rng, gauss, gantt, figBox } = S;

  /* ---------- the model: each example i has a target y; loss ½(w − y)², so its gradient is w − y ---------- */
  const POOL = (() => {
    const r = rng(1111);
    return Array.from({ length: 400 }, () => +(5 + 2 * gauss(r)).toFixed(2));
  })();
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  /** Distributed SGD with all-reduce: T iterations, minibatch B dealt to M workers (B' = B / M each). Returns w after each. */
  function trainAR({ M, B = 8, T = 10, alpha = 0.3, w = 10, seed = 7 }) {
    const r = rng(seed),
      path = [w];
    for (let t = 0; t < T; t++) {
      const batch = Array.from({ length: B }, () => POOL[Math.floor(r() * POOL.length)]),
        Bp = B / M;
      const g = Array.from({ length: M }, (_, m) => mean(batch.slice(m * Bp, (m + 1) * Bp).map((y) => w - y)));
      const G = g.reduce((s, v) => s + v, 0); // the all-reduce: every worker now holds G
      w -= (alpha / M) * G;
      path.push(w);
    }
    return path;
  }
  /** A small line chart of weight paths: series [{p: [w0, w1, ...], c, faint}]. */
  function pathChart(series, { T = 10, lo = 4, hi = 10.5, label }) {
    const W = 520,
      H = 190,
      X = (i) => 44 + (i / T) * (W - 60),
      Y = (v) => 14 + (1 - (v - lo) / (hi - lo)) * (H - 44);
    const grid = [4, 6, 8, 10]
      .map(
        (v) =>
          `<line x1="44" x2="${W - 16}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/>${tx(38, Y(v) + 4, v, { a: "end", s: 10.5, c: "var(--text-faint)" })}`,
      )
      .join("");
    const lines = series
      .map(
        (s) =>
          `<path d="${s.p.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join("")}" fill="none" stroke="var(--${s.c})" stroke-width="${s.faint ? 2 : 3}" ${s.faint ? 'stroke-dasharray="5 4" opacity=".6"' : ""} stroke-linejoin="round"/>`,
      )
      .join("");
    return svg(
      W,
      H,
      grid +
        lines +
        tx(W - 16, H - 8, "iteration →", { a: "end", s: 11, c: "var(--text-faint)" }) +
        tx(46, 10, "weight w", { a: "start", s: 11, c: "var(--text-faint)" }),
      label,
    );
  }
  Object.assign(S, { POOL, mean, trainAR, pathChart });

  /* ---------- figures for 11.2 ---------- */
  /** 12 examples per epoch, used as one batch or as minibatches of 4 or 2; the current minibatch is lit in turn. */
  function batchFig(b, life) {
    figBox(b);
    let B = 4,
      k = 0;
    const draw = () => {
      const n = 12 / B;
      b.children[1].innerHTML = `<div class="ds11-tiles" role="img" aria-label="12 training examples in ${n} groups of ${B}">${Array.from({ length: 12 }, (_, i) => `<span class="ds11-ex ${Math.floor(i / B) === k ? "on" : ""} g${Math.floor(i / B) % 2}">#${i + 1}</span>`).join("")}</div>`;
      b.lastChild.innerHTML = `${B === 12 ? "<b>Batch</b>: all 12 examples feed one gradient" : `<b>Minibatch of ${B}</b>: 12 ÷ ${B} = ${n} gradients`}, so <b>${n} update${n > 1 ? "s" : ""}</b> per epoch. Lit now: update ${k + 1}.`;
    };
    seg(b.firstChild, "12:Batch|4:Minibatch of 4|2:Minibatch of 2", B, (v) => ((B = +v), (k = 0), draw()));
    life.interval(() => {
      k = (k + 1) % (12 / B);
      if (B < 12) draw();
    }, 1200);
    draw();
  }

  /** The minibatch update: four example gradients 2, 6, 4, 0 average to 3; the learning rate scales the step from w = 10. */
  function updateFig(b) {
    figBox(b, 2);
    const G = [2, 6, 4, 0],
      sl = N.slider("Learning rate α", 0.1, 1, 0.1, 0.5, (v) => fm(v, 1));
    b.children[1].append(sl);
    b.firstChild.remove();
    const Y = (v) => 150 - v * 20;
    const draw = (a) => {
      const bars = G.map(
        (g, i) =>
          `<rect x="${60 + i * 70}" y="${Y(g)}" width="44" height="${150 - Y(g)}" rx="5" fill="${tint("blue", 40)}" stroke="var(--blue)" stroke-width="2"/>${tx(82 + i * 70, Y(g) - 6, g, { s: 12 })}${tx(82 + i * 70, 168, `ex ${i + 1}`, { s: 11, c: "var(--text-dim)" })}`,
      ).join("");
      const step = a * 3;
      b.children[1].innerHTML = svg(
        520,
        180,
        `<line x1="40" x2="330" y1="150" y2="150" stroke="var(--line-2)" stroke-width="2"/>${bars}<line x1="40" x2="330" y1="${Y(3)}" y2="${Y(3)}" stroke="var(--rose)" stroke-width="2.5" stroke-dasharray="6 4"/>${tx(334, Y(3) + 4, "average 3", { a: "start", s: 11.5, c: "var(--rose-ink)" })}` +
          box(390, 40, 120, 80, "w", "teal", `10 → ${fm(10 - step)}`, true),
        "Four example gradients 2, 6, 4 and 0 average to 3",
      );
      b.lastChild.innerHTML = `Average gradient (2 + 6 + 4 + 0) ÷ 4 = <b>3</b>. Step = ${fm(a, 1)} × 3 = ${fm(step)}, so w goes from 10 to <b>${fm(10 - step)}</b>.`;
    };
    sl.onInput(draw);
    draw(0.5);
  }

  /** B = 8 example gradients dealt to M workers: each averages its B' = 8 / M, and the average of those is the same 3.5. */
  const G8 = [2, 6, 4, 4, 5, 1, 3, 3];
  function dealFig(b) {
    figBox(b);
    const draw = (v) => {
      const M = +v,
        Bp = 8 / M,
        loc = Array.from({ length: M }, (_, m) => mean(G8.slice(m * Bp, (m + 1) * Bp)));
      b.children[1].innerHTML = `<div class="ds11-workers" role="img" aria-label="${M} workers with ${Bp} gradients each">${loc
        .map(
          (g, m) =>
            `<div class="ds11-wk"><b>Worker ${m + 1}</b><div>${G8.slice(m * Bp, (m + 1) * Bp)
              .map((x) => `<span class="ds11-ex">${x}</span>`)
              .join("")}</div><small>local average <b>${fm(g)}</b></small></div>`,
        )
        .join("")}</div>`;
      b.lastChild.innerHTML = `M = ${M}, B′ = 8 ÷ ${M} = ${Bp}. Local averages ${loc.map((x) => fm(x)).join(", ")}; their average is <b>${fm(mean(loc))}</b>, exactly the minibatch gradient of all 8.`;
    };
    seg(b.firstChild, "1:1 machine|2:2 machines|4:4 machines|8:8 machines", "4", draw);
    draw("4");
  }

  /** Stepper: two iterations of Algorithm 1 on 3 workers, w0 = 10, α = 0.5. Every number comes from the update rule. */
  const IT = [
    [
      [4, 6],
      [5, 3],
      [8, 4],
    ],
    [
      [5, 5],
      [6, 4],
      [3, 7],
    ],
  ];
  function iterRun(b, life) {
    const code = [
      "load w0 on every machine",
      "select a minibatch of B' = 2 of my examples",
      "compute g_m = average gradient on it",
      "all-reduce: G = g_1 + g_2 + g_3 on every machine",
      "update: w = w − (α / M) × G",
    ];
    F.run(b, life, {
      code,
      build(stage) {
        stage.innerHTML = `<table class="ds11-tbl"><thead><tr><th>Worker</th><th>w</th><th>minibatch (targets)</th><th>g<sub>m</sub></th><th>G</th></tr></thead><tbody>${[1, 2, 3].map((m) => `<tr data-k="W${m}"><td>W${m}</td><td></td><td></td><td></td><td></td></tr>`).join("")}</tbody></table><div class="ds11-note"></div>`;
        return stage;
      },
      *frames() {
        let w = 10;
        const a = 0.5,
          M = 3;
        const base = { w: [w, w, w], mb: ["", "", ""], g: ["", "", ""], G: "" };
        yield {
          ...base,
          line: 0,
          it: 0,
          cap: "Every machine loads the same starting weight, <b>w = 10</b>. Learning rate α = 0.5.",
        };
        for (const [t, batches] of IT.entries()) {
          const ws = [w, w, w],
            mb = batches.map((x) => x.join(", "));
          const f = { w: ws, mb, g: ["", "", ""], G: "", it: t + 1 };
          yield { ...f, line: 1, cap: `Iteration ${t + 1}: each worker picks 2 of its own examples.` };
          const g = batches.map((x) => w - mean(x));
          yield {
            ...f,
            g: g.map((v) => fm(v)),
            line: 2,
            cap: `Each gradient is w minus the average target: ${g.map((v, m) => `W${m + 1}: ${fm(w)} − ${fm(mean(batches[m]))} = ${fm(v)}`).join("; ")}.`,
            ...(t === 0
              ? {
                  ask: {
                    q: "Which worker will report the largest gradient? Tap its row.",
                    pick: "tr[data-k]",
                    a: ["W2"],
                    why: "W2's targets average 4, the furthest below w = 10, so its gradient 10 − 4 = 6 is the largest.",
                  },
                }
              : {}),
          };
          const G = g.reduce((s, v) => s + v, 0);
          yield {
            ...f,
            g: g.map((v) => fm(v)),
            G: fm(G),
            line: 3,
            cap: `All-reduce: ${g.map((v) => fm(v)).join(" + ")} = <b>${fm(G)}</b>, now on <b>every</b> worker.`,
          };
          const nw = w - (a / M) * G;
          yield {
            ...f,
            w: [nw, nw, nw],
            g: g.map((v) => fm(v)),
            G: fm(G),
            line: 4,
            cap: `Each worker updates its own copy the same way: ${fm(w)} − (0.5 ÷ 3) × ${fm(G)} = <b>${fm(nw)}</b>. All three copies still agree.`,
          };
          w = nw;
        }
      },
      draw(sc, f) {
        sc.querySelectorAll("tbody tr").forEach((tr, m) => {
          const c = tr.children;
          c[1].textContent = fm(f.w[m]);
          c[2].textContent = f.mb[m];
          c[3].textContent = f.g[m];
          c[4].textContent = f.G;
          tr.classList.toggle("on", f.line === 3 || f.line === 4);
        });
        sc.querySelector(".ds11-note").innerHTML = f.it ? `Iteration <b>${f.it}</b> of 2` : "Before training";
      },
    });
  }

  /** The same minibatches on 1 machine (B = 8) or 4 machines (B' = 2) give the same path; 4 machines with B' = 8 do not. */
  function sameFig(b) {
    figBox(b);
    const runs = {
      one: { p: trainAR({ M: 1, B: 8 }), c: "blue", n: "1 machine, B = 8" },
      four: { p: trainAR({ M: 4, B: 8 }), c: "rose", n: "4 machines, B′ = 2" },
      big: { p: trainAR({ M: 4, B: 32 }), c: "violet", n: "4 machines, B′ = 8" },
    };
    const draw = (v) => {
      const sel = runs[v],
        others = Object.entries(runs).filter(([k]) => k !== v);
      b.children[1].innerHTML = pathChart([...others.map(([, r]) => ({ ...r, faint: true })), sel], {
        label: "Weight paths of three training runs over 10 iterations",
      });
      const same = Math.abs(runs.one.p[10] - runs.four.p[10]) < 1e-9;
      b.lastChild.innerHTML = `<b>${sel.n}</b>: final w = ${fm(sel.p[10], 3)}. ${v === "big" ? "A bigger total minibatch (B = 32) is a <b>different</b> algorithm: a smoother path, so it needs its own hyperparameters." : `${same ? "The 1-machine and 4-machine runs give the <b>identical</b> path: the lines lie on top of each other." : ""}`}`;
    };
    seg(b.firstChild, "one:1 machine, B = 8|four:4 machines, B′ = 2|big:4 machines, B′ = 8", "four", draw);
    draw("four");
  }

  /** Timeline of synchronous training: 4 workers compute, then all-reduce; one may be a straggler. */
  function syncPlan(c, m, slow, k = 3) {
    const rows = c.map((_, i) => ({ n: `W${i + 1}`, s: [] })),
      cs = c.map((x, i) => (i === slow ? x * 2 : x)),
      top = Math.max(...cs);
    let t = 0;
    for (let it = 0; it < k; it++) {
      rows.forEach((r, i) =>
        r.s.push(
          [t, t + cs[i], "work", `${cs[i]} s`],
          [t + cs[i], t + top, "idle"],
          [t + top, t + top + m, "comm", m >= 1 ? "all-reduce" : ""],
        ),
      );
      t += top + m;
    }
    return { rows, iter: top + m, busy: cs.reduce((s, x) => s + x, 0) / (c.length * (top + m)), end: t };
  }
  S.syncPlan = syncPlan;
  function idleFig(b) {
    figBox(b, 2);
    let slow = -1;
    const sl = N.slider("All-reduce time (s)", 0.5, 4, 0.5, 1, (v) => `${v} s`);
    b.children[1].append(sl);
    const draw = () => {
      const p = syncPlan([3, 3, 3, 3], sl.value, slow);
      b.children[2].innerHTML = gantt(p.rows, { T: 30, label: `Each iteration takes ${p.iter} seconds` });
      b.lastChild.innerHTML = `Each iteration: ${slow < 0 ? "3 s computing" : "6 s for the slow W3 (the others wait)"} + ${sl.value} s all-reduce = <b>${p.iter} s</b>. Workers are computing <b>${Math.round(p.busy * 100)}%</b> of the time.`;
    };
    seg(b.firstChild, "-1:Equal workers|2:One straggler", "-1", (v) => ((slow = +v), draw()));
    sl.onInput(draw);
    draw();
  }

  /* ---------- 11.2 demo: run a training cluster ---------- */
  function cluster(b) {
    let M = 1,
      slow = false,
      last = null,
      prev = null;
    b.innerHTML = `<div class="controls" data-m></div><div class="controls" data-s></div><div class="controls" data-l></div><div data-f></div><div class="controls"><button class="btn primary" data-r>Run 10 iterations</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["teal", "Final weight"],
        ["blue", "Wall time"],
        ["amber", "Busy"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, b),
      sl = N.slider("All-reduce time (s)", 0, 4, 0.5, 0, (v) => `${v} s`);
    $("[data-l]").append(sl);
    const draw = (msg) => {
      $("[data-f]").innerHTML = pathChart(
        [...(prev ? [{ p: prev.p, c: "violet", faint: true }] : []), ...(last ? [{ p: last.p, c: "teal" }] : [])],
        { label: "Weight path of the last run (green) and the run before it (purple, dashed)" },
      );
      setStats(
        b,
        last ? [fm(last.p[10], 3), `${fm(last.time, 1)} s`, `${Math.round(last.busy * 100)}%`] : ["–", "–", "–"],
      );
      $("[data-c]").innerHTML = msg;
    };
    seg($("[data-m]"), "1:1 worker|2:2 workers|4:4 workers|8:8 workers", "1", (v) => {
      M = +v;
      draw(`${M} worker${M > 1 ? "s" : ""}, each computing B′ = ${8 / M} of the 8 examples per iteration.`);
    });
    seg($("[data-s]"), "eq:Equal workers|slow:One straggler", "eq", (v) => {
      slow = v === "slow";
      draw(slow ? "W1 now computes at half speed." : "All workers run at the same speed.");
    });
    $("[data-r]").onclick = () => {
      const p = syncPlan(Array(M).fill(8 / M), sl.value, slow ? 0 : -1, 10);
      prev = last;
      last = { p: trainAR({ M }), time: p.end, busy: p.busy, M };
      const same = prev && Math.abs(prev.p[10] - last.p[10]) < 1e-9;
      draw(
        `${M} worker${M > 1 ? "s" : ""}: 10 iterations in <b>${fm(p.end, 1)} s</b>, ${fm(p.iter, 1)} s each.${same && prev.M !== M ? " Same weight path as the run before: the same minibatch SGD, just spread out." : ""}${slow && M > 1 ? " Every iteration waits for the straggler." : ""}`,
      );
    };
    $("[data-z]").onclick = () => {
      last = prev = null;
      draw("Cleared. Press <b>Run 10 iterations</b>.");
    };
    draw("Each example takes 1 s to process. Press <b>Run 10 iterations</b>.");
  }

  /* ============ 11.2 Distributed SGD with all-reduce ============ */
  reg({
    id: "ds11-sgd",
    order: 2,
    num: "11.2",
    title: "Distributed SGD with all-reduce",
    blurb:
      "Split each minibatch across machines, all-reduce the gradients, and get exactly minibatch SGD, idle time included.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Run a training cluster</h2><span class="tag">B = 8 per iteration</span></div><div></div></div>`,
      );
      root.appendChild(card);
      cluster(card.lastElementChild);
      root.appendChild(
        pr(
          "ds11-sgd-1",
          "Run with <b>1 worker</b>, then pick <b>4 workers</b> and run again. How do the two weight paths compare?",
          ["They are the same path", "The 4-worker path is noisier", "The 4-worker path ends higher"],
          "Four workers with B′ = 2 average the same 8 examples as one worker with B = 8, and the all-reduce puts the full sum on every machine, so every update is identical.",
        ),
      );
      root.appendChild(
        pr(
          "ds11-sgd-2",
          "With <b>4 workers</b>, pick <b>One straggler</b> and run. What happens to <b>Wall time</b>?",
          [
            "It rises: each iteration waits for W1",
            "Nothing: the other three cover for it",
            "It falls: W1's gradient is skipped",
          ],
          "The all-reduce needs every worker's gradient, so each iteration lasts as long as the slowest worker: 4 s instead of 2 s.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Epoch</b>: one pass over the training set. <b>Batch</b>: all the data per gradient. <b>Minibatch</b>: a subset per iteration.",
            "With <b>M</b> workers and <b>B = M · B′</b>, each worker averages the gradient of its own B′ examples.",
            "An <b>all-reduce</b> sums the workers' gradients onto <b>every</b> machine, so each updates its own copy of the parameters in the same way.",
            "It is <b>statistically equivalent to minibatch SGD</b>, uses the <b>same hyperparameters</b>, and is <b>easy to implement</b>: every worker has the same role.",
            "Drawback: workers are <b>idle during the all-reduce</b>; computation and communication are not overlapped.",
          ],
          "Same algorithm, more machines: the price is the wait at every all-reduce.",
        ),
      );
    },
  });

  L["ds11-sgd"] = {
    sum: "Minibatch SGD runs on M machines by splitting each minibatch (B = M · B′), letting each worker compute its own gradient and summing them with an <b>all-reduce</b>. It is equivalent to minibatch SGD with the same hyperparameters, but workers are idle during the communication.",
    steps: [
      st(
        "Epoch, batch, minibatch",
        `<p>Three words to keep straight. An <b>epoch</b> is one pass over the full training set. <b>Batch</b> means using all your data to compute the gradient during one iteration. <b>Minibatch</b> means using only a subset of the data in each iteration.</p><p>Worked example: 12 training examples. As one batch, an epoch makes <b>1</b> update. With minibatches of 4 it makes 12 ÷ 4 = <b>3</b> updates; with minibatches of 2, <b>6</b>. Watch which examples feed each update.</p>`,
        (b, life) => batchFig(b, life),
        mc(
          "A training set has 1,000 examples and the minibatch size is 50. How many updates make one epoch?",
          ["20", "50", "1"],
          "One epoch passes over all 1,000 examples, 50 per update: 1,000 ÷ 50 = 20 updates.",
        ),
      ),
      st(
        "The minibatch update",
        `<p>Minibatch SGD averages the gradients of the B examples in the minibatch and steps the weights against that average, scaled by the learning rate α.</p><p>Worked example: one weight, w = 10, a minibatch of 4 examples whose gradients are 2, 6, 4 and 0. Their average is 12 ÷ 4 = 3. With α = 0.5 the step is 1.5, so w becomes <b>8.5</b>. Slide the learning rate.</p>${mm("<p>The update from the slides, for a minibatch of size $B$ at iteration $t$:</p>$$w_{t+1} = w_t - \\alpha_t \\cdot \\frac{1}{B} \\sum_{b=1}^{B} \\nabla f_{i_{b,t}}(w_t)$$<p>Here $10 - 0.5 \\times \\frac{2 + 6 + 4 + 0}{4} = 10 - 1.5 = 8.5$.</p>")}`,
        (b) => updateFig(b),
        mc(
          "w = 6, learning rate 0.5, and a minibatch's four gradients are 1, 3, 5 and 7. Where does w go?",
          ["4", "2", "5"],
          "The average gradient is 16 ÷ 4 = 4. The step is 0.5 × 4 = 2, so w goes from 6 to 4.",
          "Average first, then multiply by 0.5.",
        ),
      ),
      st(
        "Split the minibatch across machines",
        `<p>Now use <b>M</b> worker machines, each taking an equal share: <b>B = M · B′</b>, where B′ is the per-machine minibatch. Worker 1 computes the average gradient of its B′ examples, worker 2 of its B′, and so on.</p><p>Worked example: B = 8 gradients 2, 6, 4, 4, 5, 1, 3, 3 (average 3.5). On 4 machines B′ = 2, and the local averages are 4, 4, 3 and 3. Their average is <b>3.5</b> again. Every machine keeps a full copy of the model and works on different data: this is <b>data parallelism</b>.</p>${mm("<p>Split the inner sum by machine. With $B = M B'$:</p>$$w_{t+1} = w_t - \\alpha_t \\cdot \\frac{1}{M} \\sum_{m=1}^{M} \\frac{1}{B'} \\sum_{b=1}^{B'} \\nabla f_{i_{m,b,t}}(w_t)$$<p>Worker $m$ computes the inner average; only the outer sum needs communication. Because every share has the same size $B'$, the average of the averages is the overall average.</p>")}`,
        (b) => dealFig(b),
        mc(
          "A minibatch of B = 32 is shared by M = 4 machines. What is B′, the minibatch on each machine?",
          ["8", "128", "4"],
          "B = M · B′, so B′ = 32 ÷ 4 = 8 examples per machine.",
        ),
      ),
      st(
        "Watch one iteration",
        `<p>The slides' Algorithm 1, on 3 machines: every machine loads the same w₀; in each iteration it selects its own minibatch, computes its gradient g<sub>m</sub>, joins an <b>all-reduce</b> that leaves G = g₁ + … + g<sub>M</sub> on every machine, and updates w ← w − (α / M) · G.</p><p>Worked example: w = 10, α = 0.5, and each example's gradient is w minus its target. The workers' gradients 5, 6 and 4 sum to G = 15, so every copy moves to 10 − (0.5 ÷ 3) × 15 = <b>7.5</b>. Step through two iterations.</p>${mm("<p>Algorithm 1, per machine $m$ and iteration $t$:</p>$$g_{m,t} = \\frac{1}{B'} \\sum_{b=1}^{B'} \\nabla f_{i_{m,b,t}}(w_{t-1}) \\qquad G_t = \\sum_{m=1}^{M} g_{m,t} \\qquad w_t = w_{t-1} - \\frac{\\alpha_t}{M} G_t$$<p>At the end the algorithm returns $w_T$ from any machine: they all hold the same value.</p>")}`,
        (b, life) => iterRun(b, life),
        mc(
          "Why is the update w − (α / M) · G and not w − α · G?",
          [
            "G is a sum of M averages, so dividing by M averages them",
            "Each worker only owns 1 / M of the weights",
            "The step must shrink as more machines join in",
          ],
          "The all-reduce adds up M gradient averages. Dividing by M turns the sum into the average gradient of the whole minibatch, exactly as in minibatch SGD.",
        ),
      ),
      st(
        "Same algorithm, same hyperparameters",
        `<p>Because the all-reduce rebuilds the full minibatch gradient, the algorithm is <b>statistically equivalent to minibatch SGD</b> with B = M · B′. So it is easy to reason about, and we can keep the <b>same hyperparameters</b> (learning rate, batch size). It is also <b>easy to implement</b>: all the worker machines have the same role, and it runs on top of standard distributed computing primitives.</p><p>Worked example: the same minibatches of 8 run on 1 machine and on 4 machines with B′ = 2 trace the identical weight path. Giving each of the 4 machines 8 examples instead (B = 32) is a different algorithm.</p>`,
        (b) => sameFig(b),
        mc(
          "A model trains well on 1 machine with minibatch 64. You move to 8 machines. Which per-machine minibatch keeps the algorithm unchanged?",
          ["8", "64", "512"],
          "Keep B = M · B′ = 64, so B′ = 64 ÷ 8 = 8. With B′ = 64 the total minibatch would become 512, a different algorithm needing new hyperparameters.",
        ),
      ),
      st(
        "The drawback: idle during the all-reduce",
        `<p>While the communication for the all-reduce is happening, the workers are <b>idle</b>: we are not overlapping computation and communication.</p><p>Worked example: 3 s of computing and a 1 s all-reduce per iteration means each worker computes only 3 of every 4 seconds: <b>75%</b> busy. And because the all-reduce needs everyone's gradient, a slow worker (<i>beyond the slides</i>, a <b>straggler</b>) holds the whole cluster back: if one worker needs 6 s, every iteration takes 6 + 1 = 7 s.</p>${mm("<p>With compute times $c_1, \\dots, c_M$ and all-reduce time $r$, a synchronous iteration takes</p>$$T_{\\text{iter}} = \\max_m c_m + r \\qquad \\text{busy} = \\frac{\\sum_m c_m}{M \\, T_{\\text{iter}}}$$<p>Equal workers: $\\frac{3}{3 + 1} = 75\\%$. With one straggler at 6 s: $\\frac{3 + 3 + 6 + 3}{4 \\times 7} \\approx 54\\%$.</p>")}`,
        (b) => idleFig(b),
        mc(
          "Each iteration is 6 s of computing followed by a 2 s all-reduce. What fraction of the time are the workers computing?",
          ["75%", "25%", "100%"],
          "6 s of every 6 + 2 = 8 s: 6 ÷ 8 = 75%. The other 25% is idle waiting on the network.",
        ),
      ),
      st(
        "Beyond the slides: parameter servers and asynchrony",
        `<p><i>This step goes beyond the slides.</i> A common alternative is a <b>parameter server</b>: workers <b>push</b> their gradients to a server that holds the parameters, and <b>pull</b> fresh parameters back. If the server waits for every worker each round, it is <b>synchronous</b> and suffers the same waiting. If each worker pushes and pulls whenever it finishes, it is <b>asynchronous</b>: nobody idles, but gradients can be <b>stale</b>, computed from parameters others have already changed.</p><p>Worked example: workers needing 2, 3 and 5 s. Synchronous rounds take 5 s, giving 9 gradients in 15 s. Asynchronous gives 7 + 5 + 3 = <b>15</b>, but W3's gradients are several updates out of date.</p>`,
        (b) => S.asyncFig(b),
        mc(
          "What does asynchronous training give up in exchange for no idle workers?",
          [
            "Fresh gradients: some use outdated parameters",
            "Accuracy of each worker's arithmetic",
            "The ability to use more than two workers",
          ],
          "Without waiting, a slow worker's gradient may be computed from parameters that other workers' updates have already moved on from.",
        ),
      ),
      st(
        "Beyond the slides: data or model parallelism",
        `<p><i>This step goes beyond the slides.</i> All-reduce SGD is <b>data parallelism</b>: every machine has the whole model and a share of the data. When the model itself is too big for one machine, <b>model parallelism</b> splits the model instead (for example, one group of layers per machine) and passes each minibatch from machine to machine.</p><p>Worked example: a 3-layer network on 3 machines. Data parallel: 3 full copies, each sees a third of the data, gradients are all-reduced. Model parallel: machine 1 runs layer 1 and hands its output to machine 2, and so on.</p>`,
        (b) => S.parallelFig(b),
        mc(
          "A model's parameters do not fit in the memory of any single machine. Which approach can still train it?",
          ["Model parallelism", "Data parallelism", "A larger minibatch per machine"],
          "Data parallelism needs a full copy of the model on every machine. Splitting the model itself across machines is model parallelism.",
        ),
      ),
    ],
    guide: [
      "Press <b>Run 10 iterations</b> with <b>1 worker</b>, then pick <b>4 workers</b> and run again: compare the paths and <b>Final weight</b>.",
      "Raise <b>All-reduce time (s)</b> and run: watch <b>Busy</b> and <b>Wall time</b>.",
      "Pick <b>One straggler</b> and run again. Then answer the questions after the demo.",
    ],
  };
})();
