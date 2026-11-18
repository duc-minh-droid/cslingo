/* Data Science (COM3021), Lecture 11: distributed machine learning.
   This part: the SGD model shared with the workshop, and the figures and cluster demo of 11.3 and 11.4 (minibatch
   SGD run on M machines with an all-reduce, its idle time, stragglers). The lessons are in ds-l11-04.js and -05.js. */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { qs } = N;
  const F = N.fig;
  const { fm, seg, stats, setStats, svg, tx, tint, box, rng, gauss, gantt, figBox } = S;

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

  Object.assign(S, { batchFig, updateFig, dealFig, iterRun, sameFig, idleFig, cluster });
})();
