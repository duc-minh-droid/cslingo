/* Data Science (COM3021), Lecture 9: batch and online machine learning.
   This part: the batching diagram (shared) and ds9-batches (9.2, concept drift, retraining cost, mini-batches, batch size). */
(function () {
  const S = (NIC.shared.ds9 = NIC.shared.ds9 || {});
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, rng, gauss, trips, loss, grad, epoch, chart, curve } =
    S;

  /** The batching diagram (slides 4, 8 and 12): 8 samples feed iterations of B samples; one update per iteration. */
  function pipes(box, life, B0 = 8, choose = true) {
    let B = B0,
      k = 0;
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const [ctl, fig, out] = [...box.children];
    const NAME = { 8: "Full batch", 4: "Mini-batch of 4", 2: "Mini-batch of 2", 1: "Online (one at a time)" };
    const draw = () => {
      const it = 8 / B,
        ih = Math.min(30, 200 / it - 6);
      const iy = (j) => 20 + ((j + 0.5) * 212) / it - ih / 2;
      const samp = Array.from({ length: 8 }, (_, i) => {
        const j = Math.floor(i / B),
          on = j === k,
          y = 22 + i * 26;
        return `<line x1="104" y1="${y + 10}" x2="200" y2="${iy(j) + ih / 2}" stroke="var(--${on ? "blue" : "line-2"})" stroke-width="${on ? 2.5 : 1.5}" stroke-dasharray="5 4"/><rect x="40" y="${y}" width="64" height="20" rx="6" fill="color-mix(in srgb,var(--rose) ${on ? 30 : 12}%,var(--panel))" stroke="var(--${on ? "rose" : "line-2"})" stroke-width="2"/>${tx(72, y + 15, `trip ${i + 1}`, { s: 11 })}`;
      }).join("");
      const iters = Array.from({ length: it }, (_, j) => {
        const on = j === k;
        return `<rect x="200" y="${iy(j)}" width="120" height="${ih}" rx="8" fill="color-mix(in srgb,var(--blue) ${on ? 30 : 10}%,var(--panel))" stroke="var(--${on ? "blue" : "line-2"})" stroke-width="2"/>${tx(260, iy(j) + ih / 2 + 4, `update ${j + 1}`, { s: Math.min(12, ih - 4) })}<line x1="320" y1="${iy(j) + ih / 2}" x2="380" y2="132" stroke="var(--${on ? "blue" : "line-2"})" stroke-width="${on ? 2.5 : 1.5}" stroke-dasharray="5 4"/>`;
      }).join("");
      const right = `<rect x="380" y="112" width="84" height="40" rx="8" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="5 3"/>${tx(422, 128, "compute", { s: 11 })}${tx(422, 142, "gradient", { s: 11 })}<path d="M464 132H484" stroke="var(--text-faint)" stroke-width="2"/><rect x="484" y="112" width="70" height="40" rx="8" fill="color-mix(in srgb,var(--teal) 22%,var(--panel))" stroke="var(--teal)" stroke-width="2"/>${tx(519, 128, "update", { s: 11 })}${tx(519, 142, "weight", { s: 11 })}`;
      fig.innerHTML = svg(
        560,
        240,
        `${tx(72, 14, "Training data", { s: 11.5 })}${samp}${iters}${right}`,
        `${NAME[B]}: 8 trips are split into ${it} group${it > 1 ? "s" : ""} of ${B}; each group gives one weight update`,
      );
      out.innerHTML = `<b>${NAME[B]}</b>: 8 trips, ${B} per update, so <b>${it} update${it > 1 ? "s" : ""}</b> per epoch. Now: update ${k + 1} uses trip${B > 1 ? "s" : ""} ${Array.from({ length: B }, (_, i) => k * B + i + 1).join(", ")}.`;
    };
    if (choose)
      seg(ctl, "8:Full batch|4:Batch of 4|2:Batch of 2|1:One at a time", B, (v) => {
        B = +v;
        k = 0;
        draw();
      });
    else ctl.remove();
    life.interval(() => {
      k = (k + 1) % (8 / B);
      if (8 / B > 1) draw();
    }, 1300);
    draw();
  }
  S.pipes = pipes;

  /** A stream of courier records: km from 1 to 4, minutes = W × km + noise. W changes to `to` at record `at`. */
  function stream(n, seed, at = Infinity, to = 6) {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => {
      const x = 1 + Math.floor(r() * 4),
        W = i < at ? 4 : to;
      return { x, y: W * x + gauss(r), W };
    });
  }
  /** One online (stochastic gradient descent) update on a single record. */
  const sgd = (w, p, eta) => w - eta * 2 * p.x * (w * p.x - p.y);
  const run = (d, eta, w = 4) => d.map((p) => (w = sgd(w, p, eta)));
  Object.assign(S, { stream, sgd, run });

  /* ---------- figures for 9.2 ---------- */
  /** Concept drift on a film site: the share of clicks on dramas falls from 70% to 30% over 26 weeks; the model stays at 70%. */
  function driftFig(box) {
    const C = chart({
      x: [0, 26],
      y: [0, 100],
      xl: "weeks since training",
      yl: "% of clicks on dramas",
      tx: [0, 13, 26],
      ty: [0, 30, 50, 70, 100],
      label: "Viewers' share of drama clicks falls from 70% to 30% over 26 weeks while the trained model stays at 70%",
    });
    const real = (t) => 70 - (40 * t) / 26;
    const sl = N.slider("Weeks since training", 0, 26, 1, 13);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    box.firstChild.append(sl);
    const draw = (t) => {
      box.children[1].innerHTML = C.wrap(
        C.path(
          [
            [0, 70],
            [26, 70],
          ],
          "violet",
          'stroke-dasharray="7 5"',
        ) +
          C.path(curve(real, 0, t, 26), "blue") +
          C.path(
            [
              [t, real(t)],
              [t, 70],
            ],
            "rose",
            'stroke-width="3"',
          ) +
          C.dot(t, real(t), "blue", 6) +
          tx(C.X(25.6), C.Y(70) - 8, "model: 70%", { a: "end", s: 11, c: "var(--violet-ink)" }),
      );
      box.lastChild.innerHTML = `Week ${t}: viewers click dramas <b>${fm(real(t), 1)}%</b> of the time; the model still assumes 70%. Gap: <b>${fm(70 - real(t), 1)} points</b>.`;
    };
    sl.onInput(draw);
    draw(13);
  }

  /** Always retraining on all the data: 2 GB arrives each week, the machine has 64 GB of memory. */
  function growFig(box) {
    const sl = N.slider("Weeks of data collected", 1, 52, 1, 10);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    box.firstChild.append(sl);
    const draw = (k) => {
      box.children[1].innerHTML = F.bars(
        [
          ["Data in this retrain", 2 * k, 2 * k > 64 ? "rose" : "blue", "GB"],
          ["Memory of the machine", 64, "violet", "GB"],
        ],
        { max: 104 },
      );
      box.lastChild.innerHTML = `Week ${k}: this retrain reads <b>${2 * k} GB</b>${2 * k > 64 ? ", which <b>no longer fits in memory</b>" : ""}. Weekly retrains so far have read 2 + 4 + … + ${2 * k} = <b>${k * (k + 1)} GB</b> in total.`;
    };
    sl.onInput(draw);
    draw(10);
  }

  /** Train on recent data only: a window over the newest weeks. */
  function windowFig(box) {
    let now = 12;
    const sl = N.slider("Weeks used for training", 1, 12, 1, 4);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="controls" style="justify-content:center"><button class="btn small">Next week</button></div><div class="fig-cap"></div>`;
    box.firstChild.append(sl);
    const draw = () => {
      const k = sl.value;
      box.children[1].innerHTML = `<div class="ds9-days" role="img" aria-label="Weeks ${now - 11} to ${now}; the newest ${k} are used for training">${Array.from(
        { length: 12 },
        (_, i) => {
          const wk = now - 11 + i,
            on = i >= 12 - k;
          return `<span class="ds9-day ${on ? "win ok" : ""}" style="${on ? "" : "opacity:.45"}">W${wk}</span>`;
        },
      ).join("")}</div>`;
      box.lastChild.innerHTML = `Each retrain reads the newest <b>${k} week${k > 1 ? "s" : ""}</b> = <b>${2 * k} GB</b>, every time. Weeks before W${now - k + 1} no longer affect the model.`;
    };
    box.children[2].firstChild.onclick = () => {
      now++;
      draw();
    };
    sl.onInput(draw);
    draw();
  }

  /** How often and how much: retrain every R days on the last W days, while preferences drift from 70% to 30%. */
  function cadenceFig(box) {
    let R = 7,
      W = 30;
    const real = (d) => (d < 0 ? 70 : 70 - (40 * d) / 119);
    const C = chart({
      x: [0, 120],
      y: [20, 80],
      xl: "day",
      yl: "% of clicks on dramas",
      tx: [0, 30, 60, 90, 120],
      ty: [30, 50, 70],
      label: "Real preference falls steadily; the retrained model follows it as a staircase",
    });
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = () => {
      const steps = [];
      let m = 70,
        gap = 0,
        n = 0;
      for (let d = 0; d < 120; d++) {
        if (d % R === 0) {
          let s = 0;
          for (let k = d - W; k < d; k++) s += real(k);
          m = s / W;
          n++;
        }
        steps.push([d, m], [d + 1, m]);
        gap += Math.abs(real(d) - m);
      }
      box.children[2].innerHTML = C.wrap(C.path(curve(real, 0, 120, 30), "blue") + C.path(steps, "violet"));
      box.lastChild.innerHTML = `<b>${n} retrains</b>, reading ${fm(n * W)} days of data in total. The model (purple) is on average <b>${fm(gap / 120, 1)} points</b> away from the real preference (blue).`;
    };
    seg(box.children[0], "1:Retrain daily|7:Weekly|30:Monthly", R, (v) => ((R = +v), draw()));
    seg(box.children[1], "7:Use a week|30:A month|365:A year", W, (v) => ((W = +v), draw()));
    draw();
  }

  /** Thirty random batches of size B from 48 trips: where their gradient estimates land, against the true gradient. */
  function noiseFig(box) {
    const d = trips(48, 4, 11),
      g = grad(d, 6);
    const C = chart({
      w: 520,
      h: 120,
      x: [0, 90],
      y: [0, 1],
      xl: "gradient estimate at w = 6",
      tx: [0, 30, 60, 90],
      label: "Thirty gradient estimates scattered around the true gradient; the spread shrinks as the batch grows",
    });
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (B) => {
      const r = rng(5),
        est = Array.from({ length: 30 }, () =>
          grad(
            d
              .map((_, i) => i)
              .sort(() => r() - 0.5)
              .slice(0, B)
              .map((i) => d[i]),
            6,
          ),
        );
      box.children[1].innerHTML = C.wrap(
        C.path(
          [
            [g, 0],
            [g, 1],
          ],
          "teal",
          'stroke-dasharray="6 4"',
        ) +
          est.map((e, i) => C.dot(e, 0.15 + ((i * 7) % 30) / 40, "blue", 5, 'opacity=".8"')).join("") +
          tx(C.X(g) + 6, 24, `true ${fm(g, 1)}`, { a: "start", s: 11, c: "var(--teal-ink)" }),
      );
      box.lastChild.innerHTML = `Batch of <b>${B}</b>: the 30 estimates run from <b>${fm(Math.min(...est), 1)}</b> to <b>${fm(Math.max(...est), 1)}</b>. ${B === 48 ? "Every batch is the whole data set, so every estimate is the true gradient." : "Each one would push the weight by a different amount."}`;
    };
    seg(box.firstChild, "1:Batch of 1|4:4|12:12|48:All 48", 4, (v) => draw(+v));
    draw(4);
  }

  /** Slide 9 rebuilt on our data: final loss after 3 epochs against the learning rate, for three batch sizes. */
  function tradeFig(box) {
    const d = trips(24, 4, 7),
      etas = Array.from({ length: 25 }, (_, i) => 0.002 * Math.pow(100, i / 24));
    const C = chart({
      x: [Math.log10(0.002), Math.log10(0.2)],
      y: [0, 120],
      xl: "learning rate (log scale)",
      yl: "loss after 3 epochs",
      ty: [0, 60, 120],
      label: "Loss after three epochs against learning rate for batch sizes 24, 8 and 1",
    });
    const line = (B) =>
      etas.map((eta) => {
        let w = 10;
        for (let e = 0; e < 3; e++) w = epoch(d, w, B, eta, 100 + e).w;
        return [Math.log10(eta), Math.min(200, loss(d, w))];
      });
    const L3 = [
      [24, "blue", "full batch (24)"],
      [8, "amber", "batch of 8"],
      [1, "violet", "one at a time"],
    ].map(([B, c, n]) => [B, c, n, line(B)]);
    box.innerHTML = `<div></div><div class="fig-cap"></div>`;
    const ticks = [0.002, 0.02, 0.2]
      .map((v) => tx(C.X(Math.log10(v)), 194, v, { s: 10.5, c: "var(--text-faint)" }))
      .join("");
    const key = L3.map(([, c, n], i) =>
      tx(178 + i * 128, 12, `— ${n}`, { a: "start", s: 11, c: `var(--${c}-ink)` }),
    ).join("");
    box.firstChild.innerHTML = C.wrap(L3.map(([, c, , p]) => C.path(p, c)).join("") + ticks + key);
    box.lastChild.innerHTML =
      "Smaller batches reach a low loss at <b>smaller</b> learning rates, but blow up <b>sooner</b> as the rate grows. Full batch needs a bigger rate to get anywhere in 3 epochs.";
  }

  /** 9.2 demo: one epoch at a time with each batch size, from the same start. */
  function race(box) {
    const d = trips(24, 4, 7),
      COL = { 24: "blue", 8: "amber", 4: "teal", 1: "violet" };
    const C = chart({
      x: [0, 3],
      y: [0, 300],
      xl: "epochs (passes over the 24 trips)",
      yl: "loss",
      tx: [0, 1, 2, 3],
      ty: [0, 100, 200, 300],
      label: "Loss curves for the batch sizes run so far",
    });
    let B = 24,
      runs = {};
    const fresh = () => ({ w: 10, ep: 0, pts: [[0, loss(d, 10)]], last: 0 });
    box.innerHTML = `<div class="controls" data-b></div><div data-f></div><div class="controls"><button class="btn primary" data-r>Run 1 epoch</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["blue", "Updates in that epoch"],
        ["violet", "Epochs run"],
        ["amber", "Weight w"],
        ["rose", "Loss"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, box);
    const draw = (msg) => {
      const r = runs[B] || fresh();
      $("[data-f]").innerHTML = C.wrap(
        Object.entries(runs)
          .map(
            ([b, x]) =>
              C.path(x.pts, COL[b]) + C.dot(x.pts[x.pts.length - 1][0], x.pts[x.pts.length - 1][1], COL[b], 4),
          )
          .join("") + C.dot(4, 0, "teal", 0),
      );
      setStats(box, [r.last, r.ep, fm(r.w, 3), fm(loss(d, r.w), 2)]);
      $("[data-c]").innerHTML = msg;
    };
    seg($("[data-b]"), "24:Full batch (24)|8:Batch of 8|4:Batch of 4|1:One at a time", B, (v) => {
      B = +v;
      draw(`Batch size ${B}: ${24 / B} update${B < 24 ? "s" : ""} per epoch. Learning rate 0.02 for every size.`);
    });
    $("[data-r]").onclick = () => {
      const r = (runs[B] = runs[B] || fresh());
      if (r.ep >= 3) return draw("Three epochs is enough for this chart. Pick another batch size or <b>Reset</b>.");
      const e = epoch(d, r.w, B, 0.02, 100 + r.ep);
      e.out.forEach((o) => r.pts.push([r.ep + o.seen / 24, o.l]));
      r.ep++;
      r.w = e.w;
      r.last = e.out.length;
      draw(
        `Epoch ${r.ep} with batch size ${B}: <b>${e.out.length} update${e.out.length > 1 ? "s" : ""}</b>, loss now ${fm(loss(d, r.w), 2)}.`,
      );
    };
    $("[data-z]").onclick = () => {
      runs = {};
      draw("All curves cleared. Every batch size starts again at w = 10.");
    };
    draw("Every batch size starts at w = 10 (the best weight is about 4). Press <b>Run 1 epoch</b>.");
  }

  /* ============ 9.2 Mini-batches, drift and retraining ============ */
  reg({
    id: "ds9-batches",
    order: 2,
    num: "9.2",
    title: "Mini-batches, drift and retraining",
    blurb: "Why a model goes stale, why retraining on everything gets expensive, and what the batch size changes.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Batch size race</h2><span class="tag">24 trips, learning rate 0.02</span></div><div></div></div>`,
      );
      root.appendChild(card);
      race(card.lastElementChild);
      root.appendChild(
        pr(
          "ds9-batches-1",
          "Run <b>one epoch</b> with each batch size, all from w = 10. Which ends its first epoch with the lowest loss?",
          [
            "One at a time: 24 small steps beat one big one",
            "Full batch (24): it follows the true gradient",
            "Batch of 8: a middle size always does best",
          ],
          "With the same learning rate, one-at-a-time makes 24 updates per epoch while full batch makes 1. Each update is noisier, but 24 of them get much closer to w ≈ 4 (loss about 1.7 against about 133).",
        ),
      );
      root.appendChild(
        pr(
          "ds9-batches-2",
          "Look at the <b>One at a time</b> curve. Does the loss fall at every single update?",
          [
            "No: now and then one trip pushes it back up",
            "Yes: every update lowers the loss a little",
            "No: it only falls at the end of each epoch",
          ],
          "Each update follows one trip's gradient, which is only an estimate. A trip that disagrees with the rest can raise the overall loss for a step, so the curve is jagged.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Data and problems are not static: preferences change over time (<b>concept drift</b>), so the model must be <b>updated</b>.",
            "Always retraining on <b>all</b> the data gets <b>increasingly costly</b>, and the data has to <b>fit in memory</b>.",
            "Training on <b>recent</b> data (mini-batch, <b>incremental learning</b>) is cheaper and lets old data matter less. You must choose <b>how often</b> to retrain and <b>how much</b> data to use.",
            "A <b>mini-batch</b> gives an <b>estimate</b> of the gradient: <b>the smaller the batch, the greater the randomness</b>, and convergence is less stable.",
            "Full batch is <b>rarely used in production</b>: it only suits very small datasets. The <b>batch size</b> is an important decision.",
          ],
          "All the data is accurate but slow and heavy; a little data is cheap and fresh but noisy.",
        ),
      );
    },
  });

  L["ds9-batches"] = {
    sum: "Data changes over time (<b>concept drift</b>), and retraining on everything gets costly and must fit in memory. <b>Mini-batch</b> learning trains on recent data and estimates the gradient: cheaper, but noisier as the batch shrinks.",
    steps: [
      st(
        "The world keeps moving",
        `<p>A model trained once and deployed assumes the world stays as it was. Often it does not: in a <b>recommendation system</b>, what people like <b>changes over time</b>. This is <b>concept drift</b>, and the model has to be <b>updated</b> to keep up.</p><p>Worked example: a film site trains its model when 70% of clicks go to dramas. Twenty-six weeks later only 30% do, but the model still recommends as if it were 70%. Halfway, at week 13, the gap is already 20 points. Drag the weeks.</p>`,
        (box) => driftFig(box),
        mc(
          "A music app's model was trained two years ago. Since then listeners have moved towards podcasts and its suggestions keep getting worse. What is going on?",
          [
            "Concept drift: the data has changed since training",
            "Divergence: the learning rate was set too high",
            "Overshoot: the weights jumped past the minimum",
          ],
          "The model has not changed, the world has. That is concept drift, and the fix is to update the model with newer data.",
        ),
      ),
      st(
        "Retraining on everything gets heavy",
        `<p>The simplest fix is to retrain regularly on <b>all the available data</b>. But the data keeps growing, so <b>retraining becomes increasingly costly</b>, and full batch training needs the data to <b>fit in memory</b>.</p><p>Worked example: 2 GB of new data arrives each week and the model is retrained weekly on everything. In week 10 a retrain reads 20 GB; by week 33 it reads 66 GB, more than the machine's 64 GB of memory. Over 10 weeks the retrains have read 2 + 4 + … + 20 = 110 GB.</p>${mm("<p>With $a$ GB per week, the retrain in week $k$ reads $ak$ GB, and all retrains up to week $k$ read</p>$$a(1 + 2 + \\dots + k) = a\\,\\frac{k(k+1)}{2}$$<p>so the total work grows with the <b>square</b> of the number of weeks. For $a = 2$, $k = 10$: $2 \\times 55 = 110$ GB.</p>")}`,
        (box) => growFig(box),
        mc(
          "3 GB of new data arrives every week and the model is retrained weekly on all of it. How much does the retrain in week 20 read?",
          ["60 GB", "3 GB", "23 GB"],
          "Twenty weeks of 3 GB each: 20 × 3 = 60 GB, and it keeps growing every week.",
          "Weeks times GB per week.",
        ),
      ),
      st(
        "Train on recent data",
        `<p>Alternatively, train on <b>more recent data</b> only. It is <b>less computationally intensive</b>, and <b>older data won't affect the model as much</b>. Updating a model bit by bit from newer data like this is <b>incremental learning</b>.</p><p>Worked example: keep only the last 4 weeks. Each retrain reads 4 × 2 = 8 GB, in week 10 or in week 100, and data older than 4 weeks no longer pulls the model back towards old tastes. Change the window and press <b>Next week</b>.</p>`,
        (box) => windowFig(box),
        mc(
          "A model is retrained every week on just the last 6 weeks of data. What happens to the cost of each retrain as the months go by?",
          [
            "It stays the same: always 6 weeks of data",
            "It grows: more data piles up every week",
            "It shrinks: each week replaces older data",
          ],
          "The window has a fixed length, so each retrain reads the same amount however long the system has been running.",
        ),
      ),
      st(
        "How often, and how much?",
        `<p>Training on recent data raises two questions. <b>How often</b> should the model be retrained: daily, weekly, monthly? And <b>how much data</b> should it use: a week, a month, a year?</p><p>Worked example: drama clicks fall steadily from 70% to 30% over 120 days. Retrained weekly on the last month, the model is on average about 5.6 points behind. Daily on the last week: about 1.3 points, but 120 retrains instead of 18. A year of data: about 18 points, because old tastes swamp the new. Try the combinations.</p>`,
        (box) => cadenceFig(box),
        mc(
          "Tastes drift steadily. Which change brings the model closest to the real preference?",
          [
            "Retrain more often, on a shorter window",
            "Retrain less often, on a longer window",
            "Retrain more often, on a longer window",
          ],
          "More frequent retraining reacts sooner, and a short window stops old data dragging the model back. Both cost: more retrains, and noisier data.",
        ),
      ),
      st(
        "Mini-batch: part of the data per update",
        `<p><b>Mini-batch learning</b> uses <b>part</b> of the data for each update, so it computes an <b>estimate of the gradient</b>. An epoch becomes several updates: data set size ÷ batch size.</p><p>Worked example: 8 trips with a batch of 2 gives 4 updates per epoch (iteration 1 uses trips 1–2, iteration 2 uses 3–4, …). With a batch of 1 there are 8 updates, one per trip. Switch between the batch sizes and watch which trips feed each update.</p>${mm("<p>With $n$ examples and batch size $b$:</p>$$\\text{updates per epoch} = \\frac{n}{b}, \\qquad \\hat g_j = \\frac{1}{b}\\sum_{i \\in \\text{batch } j} g_i$$<p>$n = 8$, $b = 2$: $4$ updates, each from its own estimate $\\hat g_j$.</p>")}`,
        (box, life) => S.pipes(box, life, 2, true),
        mc(
          "A training set has 1,200 rows and the batch size is 100. How many weight updates are there per epoch?",
          ["12", "1", "100"],
          "Each update uses 100 rows, so one pass over 1,200 rows makes 1,200 ÷ 100 = 12 updates.",
          "Rows ÷ batch size.",
        ),
      ),
      st(
        "Smaller batch, more randomness",
        `<p>A smaller batch averages fewer examples, so its gradient estimate depends more on <b>which</b> examples it happened to get. <b>The smaller the batch size, the greater the randomness</b>, and <b>convergence is less stable</b>, depending on the data fluctuations in the batch.</p><p>Worked example: 48 trips, true gradient about 31 at w = 6. Thirty random batches of 1 give estimates from about 2 to 80; batches of 12 stay between about 22 and 42; the whole set gives 31 every time. Pick a batch size.</p>${mm("<p>For a batch of $b$ examples drawn at random, the estimate is right on average and its spread (standard deviation) shrinks like</p>$$\\operatorname{sd}(\\hat g) \\approx \\frac{\\sigma}{\\sqrt{b}}$$<p>where $\\sigma$ is the spread of single-example gradients. Four times the batch halves the noise.</p>")}`,
        (box) => noiseFig(box),
        mc(
          "A team halves its batch size from 32 to 16. What happens to the gradient estimates?",
          [
            "They get noisier: each averages fewer examples",
            "They get more accurate: smaller batches are fresher",
            "Nothing changes: the true gradient is the same",
          ],
          "The true gradient is unchanged, but each estimate now averages 16 examples instead of 32, so it wanders more from batch to batch.",
        ),
      ),
      st(
        "Trade-offs",
        `<p><b>Full batch</b> is <b>rarely used in production</b>, since it is only suitable for <b>very small datasets</b>: every step must read all the data. That makes the choice of a <b>batch size</b> an important decision, and it interacts with the learning rate.</p><p>Worked example on our 24 trips, three epochs each: one-at-a-time already reaches the lowest loss at a learning rate of 0.004, but is clearly worse by 0.09, where full batch is still fine. Full batch needs about 0.06 to get as low. Small batches like small learning rates.</p>`,
        (box) => tradeFig(box),
        mc(
          "Why is full batch learning rarely used in production?",
          [
            "It only suits small datasets: every step reads all the data",
            "It cannot compute the true gradient on large datasets",
            "It updates the weights after every single example",
          ],
          "Full batch computes the true gradient, but each step needs the whole data set (and enough memory). For big data that is far too slow.",
        ),
      ),
    ],
    guide: [
      "With <b>Full batch (24)</b> selected, press <b>Run 1 epoch</b> and note the <b>Loss</b>.",
      "Switch to <b>Batch of 8</b>, <b>Batch of 4</b> and <b>One at a time</b>, running one epoch each. Compare <b>Updates in that epoch</b>.",
      "Run more epochs and compare how smooth each curve is, then answer the questions after the demo.",
    ],
  };
})();
