/* Data Science (COM3021), Lecture 9: batch and online machine learning.
   This part: ds9-online (9.3, streaming data, online learning / stochastic gradient descent, learning rate, bad data,
   and the three data shifts: covariate, prior probability and concept drift). */
(function () {
  const S = (NIC.shared.ds9 = NIC.shared.ds9 || {});
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, fm, seg, stats, setStats, tx, rng, gauss, chart, curve, stream, sgd, run } = S;

  /* ---------- figures for 9.3 ---------- */
  /** Records ride past the model once; it updates and the record is gone. */
  function belt(box, life) {
    const d = stream(400, 9);
    let k = 0,
      w = 4;
    box.innerHTML = `<div class="ds9-belt" role="img" aria-label="Delivery records slide past the model one at a time and disappear after it learns from them"><div class="ds9-model">model<br>w = 4</div></div>${stats(
      [
        ["blue", "Records seen"],
        ["rose", "Records stored"],
        ["teal", "Weight w"],
      ],
    )}`;
    const bt = box.firstChild;
    const tick = () => {
      if (!bt.isConnected) return;
      const p = d[k++ % d.length];
      w = sgd(w, p, 0.02);
      const r = el(`<span class="ds9-rec">${p.x} km · ${fm(p.y, 0)} min</span>`);
      r.style.setProperty("--d", `${bt.clientWidth + 20}px`);
      bt.appendChild(r);
      life.timeout(() => r.remove(), 3300);
      bt.querySelector(".ds9-model").innerHTML = `model<br>w = ${fm(w)}`;
      setStats(box, [k, 0, fm(w)]);
    };
    life.interval(tick, 900);
    tick();
  }

  /** Stepper: online updates, one record at a time, learning rate 0.02. */
  function sgdRun(box, life) {
    const R = [
      [3, 15],
      [1, 5],
      [2, 9],
      [4, 19],
      [2, 10],
    ];
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = `<table class="ds9-tbl"><thead><tr><th>Record</th><th>km</th><th>Real min</th><th>Predicted</th><th>w after</th></tr></thead><tbody>${R.map((r, i) => `<tr><td>${i + 1}</td><td>${r[0]}</td><td>${r[1]}</td><td></td><td></td></tr>`).join("")}</tbody></table><div class="ds9-w"></div>`;
        return stage;
      },
      *frames() {
        let w = 4;
        const rows = [];
        yield { w, rows: [], on: -1, cap: "The model starts at <b>w = 4</b>. Records arrive one at a time." };
        for (const [i, [x, y]] of R.entries()) {
          const pred = w * x,
            g = 2 * x * (pred - y),
            nw = w - 0.02 * g;
          rows.push([fm(pred, 3), fm(nw, 3)]);
          yield {
            w: nw,
            rows: [...rows],
            on: i,
            cap: `Record ${i + 1}: predict ${fm(w, 3)} × ${x} = ${fm(pred, 3)}, real ${y}. Gradient ${fm(g, 3)}, so w = ${fm(w, 3)} − 0.02 × ${fm(g, 3)} = <b>${fm(nw, 3)}</b>. Then the record is dropped.`,
          };
          w = nw;
        }
      },
      draw(sc, f) {
        sc.querySelectorAll("tbody tr").forEach((tr, i) => {
          tr.classList.toggle("on", f.on === i);
          tr.children[3].textContent = f.rows[i] ? f.rows[i][0] : "";
          tr.children[4].textContent = f.rows[i] ? f.rows[i][1] : "";
        });
        sc.querySelector(".ds9-w").innerHTML =
          `${f.rows.length} update${f.rows.length === 1 ? "" : "s"} · weight <b>${fm(f.w, 3)}</b>`;
      },
    });
  }

  /** The online weight tracking a sudden change (4 → 6 at record 40) for a chosen learning rate. */
  function adaptFig(box) {
    const d = stream(80, 21, 40);
    const C = chart({
      x: [0, 80],
      y: [2, 8],
      xl: "record",
      yl: "weight (min per km)",
      tx: [0, 20, 40, 60, 80],
      ty: [2, 4, 6, 8],
      label: "The real minutes per km jump from 4 to 6 at record 40; the online weight follows",
    });
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (eta) => {
      const ws = run(d, eta),
        k = ws.findIndex((v, i) => i >= 40 && Math.abs(v - 6) < 0.5),
        pre = ws.slice(20, 40);
      box.children[1].innerHTML = C.wrap(
        C.path(
          d.map((p, i) => [i + 1, p.W]),
          "teal",
          'stroke-dasharray="6 4"',
        ) +
          C.path(
            ws.map((w, i) => [i + 1, w]),
            "blue",
          ),
      );
      box.lastChild.innerHTML = `Learning rate <b>${eta}</b>: within 0.5 of the new 6 after <b>${k - 39} record${k - 39 === 1 ? "" : "s"}</b>. Before the change it wobbles by <b>${fm(Math.max(...pre) - Math.min(...pre))}</b> min per km.`;
    };
    seg(box.firstChild, "0.004:Learning rate 0.004|0.02:0.02|0.05:0.05", "0.004", (v) => draw(+v));
    draw(0.004);
  }

  /** One bad record (a 2 km trip logged as 90 minutes) at record 20. */
  function glitchFig(box) {
    const d = stream(40, 33);
    d[19] = { x: 2, y: 90, W: 4 };
    const C = chart({
      x: [0, 40],
      y: [0, 22],
      xl: "record",
      yl: "online weight",
      tx: [0, 10, 20, 30, 40],
      ty: [0, 4, 10, 20],
      label: "The online weight jumps when a bad record arrives at record 20, then slowly returns to 4",
    });
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (eta) => {
      const ws = run(d, eta),
        back = ws.findIndex((v, i) => i > 19 && Math.abs(v - 4) < 0.5);
      box.children[1].innerHTML = C.wrap(
        C.path(
          [
            [20, 0],
            [20, 22],
          ],
          "rose",
          'stroke-dasharray="4 4"',
        ) +
          tx(C.X(20) + 6, 30, "bad record: 2 km, 90 min", { a: "start", s: 11, c: "var(--rose-ink)" }) +
          C.path(
            [
              [0, 4],
              [40, 4],
            ],
            "teal",
            'stroke-dasharray="6 4"',
          ) +
          C.path(
            ws.map((w, i) => [i + 1, w]),
            "blue",
          ),
      );
      box.lastChild.innerHTML = `Learning rate <b>${eta}</b>: the weight jumps from ${fm(ws[18])} to <b>${fm(ws[19])}</b> on one bad record, and is back within 0.5 of 4 after ${back - 19} more records.`;
    };
    seg(box.firstChild, "0.004:Learning rate 0.004|0.02:0.02|0.05:0.05", "0.02", (v) => draw(+v));
    draw(0.02);
  }

  /** The three data shifts, each on its own picture. */
  function shiftFig(box, start) {
    const C = chart({
      x: [0, 9],
      y: [0, 24],
      xl: "input",
      yl: "output",
      tx: [0, 3, 6, 9],
      ty: [0, 12, 24],
      label: "Data shift",
    });
    const f = (x) => 2 + 3 * x - 0.2 * x * x;
    const pts = (xs, g) => xs.map((x, i) => [x, g(x) + [0.5, -0.4, 0.2, -0.6, 0.4, -0.2][i % 6]]);
    const draw = (m) => {
      let inner, cap;
      if (m === "cov") {
        const old = pts([1, 1.4, 1.8, 2.2, 2.6, 3], f),
          now = pts([5.5, 6, 6.5, 7, 7.5, 8], f);
        inner =
          C.path(curve(f, 0, 9), "teal", 'stroke-dasharray="6 4"') +
          C.path(
            [
              [0, 2.6],
              [9, 2.6 + 2.2 * 9],
            ],
            "violet",
          ) +
          old.map((p) => C.dot(p[0], p[1], "blue", 5)).join("") +
          now.map((p) => C.dot(p[0], p[1], "amber", 5)).join("");
        cap =
          "<b>Covariate shift</b>: the inputs move (orange) away from the training inputs (blue). The rule (green dashes) is the same, but the model (purple) was only fitted where the blue points were.";
      } else if (m === "prior") {
        const dots = (n, flu, y0) =>
          Array.from(
            { length: n },
            (_, i) =>
              `<circle cx="${70 + (i % 10) * 40}" cy="${y0 + Math.floor(i / 10) * 26}" r="10" fill="color-mix(in srgb,var(--${i < flu ? "rose" : "blue"}) 40%,var(--panel))" stroke="var(--${i < flu ? "rose" : "blue"})" stroke-width="2"/>`,
          ).join("");
        box.children[1].innerHTML = S.svg(
          520,
          220,
          tx(270, 18, "Patients with fever and a cough: before", { s: 12 }) +
            dots(20, 12, 36) +
            tx(270, 120, "the same symptoms, during a pandemic", { s: 12 }) +
            dots(20, 4, 138) +
            tx(270, 212, "red = flu, blue = something else", { s: 11, c: "var(--text-faint)" }),
          "Before: 12 of 20 patients with the same symptoms have flu. During a pandemic: 4 of 20",
        );
        box.lastChild.innerHTML =
          "<b>Prior probability shift</b>: the symptoms (inputs) look the same, but how many patients actually have flu (the target) changes: 12 in 20 before, 4 in 20 during. A model that still says 60% is now wrong.";
        return;
      } else {
        const old = pts([1, 2, 3, 4, 5, 6], (x) => 2 + 2.5 * x),
          now = pts([1.5, 2.5, 3.5, 4.5, 5.5, 6.5], (x) => 2 + 3.4 * x);
        inner =
          C.path(
            [
              [0, 2],
              [9, 24.5],
            ],
            "violet",
            'stroke-dasharray="6 4"',
          ) +
          old.map((p) => C.dot(p[0], p[1], "blue", 5)).join("") +
          now.map((p) => C.dot(p[0], p[1], "amber", 5)).join("");
        cap =
          "<b>Concept drift</b>: same kind of inputs, but the relationship itself has changed. New points (orange) sit above the old rule (purple dashes) that the model learned from the blue ones.";
      }
      box.children[1].innerHTML = C.wrap(inner);
      box.lastChild.innerHTML = cap;
    };
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    seg(box.firstChild, "cov:Covariate shift|prior:Prior shift|concept:Concept drift", start, draw);
    draw(start);
  }

  /** 9.3 demo: a live stream; a frozen batch model against an online model. */
  function live(box, life) {
    const r = rng(77),
      H = 60;
    let Wt = 4,
      wOn = 4,
      eta = 0.02,
      n = 0,
      playing = false,
      hist = [],
      errF = [],
      errO = [];
    const C = chart({
      x: [0, H],
      y: [0, 12],
      xl: "last 60 records",
      yl: "minutes per km",
      tx: [0, 30, 60],
      ty: [0, 4, 6, 12],
      label: "Real minutes per km, the frozen model and the online model over the last 60 records",
    });
    box.innerHTML = `<div class="controls" data-e></div><div data-f></div><div class="controls"><button class="btn primary" data-p>Play</button><button class="btn" data-t>+10 records</button><button class="btn" data-r>Roadworks</button><button class="btn ghost" data-g>Glitch</button></div>${stats(
      [
        ["blue", "Records seen"],
        ["violet", "Frozen model error"],
        ["teal", "Online model error"],
        ["amber", "Online weight"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, box);
    const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
    const feed = (p) => {
      errF.push(Math.abs(4 * p.x - p.y));
      errO.push(Math.abs(wOn * p.x - p.y));
      if (errF.length > 10) (errF.shift(), errO.shift());
      wOn = sgd(wOn, p, eta);
      hist.push({ W: Wt, w: wOn, bad: p.bad });
      if (hist.length > H) hist.shift();
      n++;
    };
    const draw = (msg) => {
      const o = H - hist.length;
      $("[data-f]").innerHTML = C.wrap(
        C.path(
          hist.map((h, i) => [o + i, h.W]),
          "teal",
          'stroke-dasharray="6 4"',
        ) +
          C.path(
            [
              [0, 4],
              [H, 4],
            ],
            "violet",
          ) +
          (hist.length
            ? C.path(
                hist.map((h, i) => [o + i, h.w]),
                "blue",
              )
            : "") +
          hist.map((h, i) => (h.bad ? C.dot(o + i, Math.min(12, h.w), "rose", 6) : "")).join("") +
          tx(C.X(H) - 4, C.Y(4) + 16, "frozen: 4", { a: "end", s: 11, c: "var(--violet-ink)" }),
      );
      setStats(box, [n, `${fm(avg(errF), 1)} min`, `${fm(avg(errO), 1)} min`, fm(wOn)]);
      if (msg) $("[data-c]").innerHTML = msg;
    };
    const one = () => {
      const x = 1 + Math.floor(r() * 4);
      feed({ x, y: Wt * x + gauss(r) });
    };
    seg($("[data-e]"), "0.004:Learning rate 0.004|0.02:0.02|0.05:0.05", "0.02", (v) => {
      eta = +v;
      draw(`Online learning rate ${v}.`);
    });
    $("[data-p]").onclick = (e) => {
      playing = !playing;
      e.target.textContent = playing ? "Pause" : "Play";
    };
    $("[data-t]").onclick = () => {
      for (let i = 0; i < 10; i++) one();
      draw();
    };
    $("[data-r]").onclick = () => {
      Wt = Wt === 4 ? 6 : 4;
      draw(
        Wt === 6
          ? "<b>Roadworks</b>: every km now takes about 6 minutes. The frozen model still says 4."
          : "Roadworks over: back to about 4 minutes per km.",
      );
    };
    $("[data-g]").onclick = () => {
      const before = wOn;
      feed({ x: 2, y: 90, bad: true });
      draw(
        `<b>Glitch</b>: a 2 km trip logged as 90 minutes. The online weight jumps from ${fm(before)} to <b>${fm(wOn)}</b> at once.`,
      );
    };
    life.interval(() => {
      if (!playing || !box.isConnected) return;
      one();
      draw();
    }, 250);
    for (let i = 0; i < 20; i++) one();
    draw("Records arrive one at a time. Press <b>Play</b> or <b>+10 records</b>.");
  }

  /* ============ 9.3 Online learning and data shifts ============ */
  reg({
    id: "ds9-online",
    order: 3,
    num: "9.3",
    title: "Online learning and data shifts",
    blurb:
      "Learning from a stream one record at a time: how fast to adapt, what bad data does, and the three kinds of shift.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>A live delivery stream</h2><span class="tag">frozen model vs online model</span></div><div></div></div>`,
      );
      root.appendChild(card);
      live(card.lastElementChild, life);
      root.appendChild(
        pr(
          "ds9-online-1",
          "Press <b>Roadworks</b>, then <b>+10 records</b> a few times. Which model's error stays high?",
          [
            "The frozen model: it never learns from new records",
            "The online model: the change confuses its updates",
            "Neither: both recover within a few records",
          ],
          "The frozen batch model keeps w = 4 whatever arrives, so its error stays at about 2 minutes per km times the distance. The online model updates on every record and catches up with 6.",
        ),
      );
      root.appendChild(
        pr(
          "ds9-online-2",
          "Pick <b>learning rate 0.05</b> and press <b>Glitch</b>. What happens to the online weight?",
          [
            "It leaps far off at once, then recovers over the next records",
            "It barely moves: one record among many cannot matter",
            "It moves a little, then stays wrong from then on",
          ],
          "Online learning updates on the bad record immediately. With 0.05 one 90-minute record pushes w up by about 16. Good records then pull it back, quickly at this rate.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "With <b>streaming data</b>, multiple passes are no longer possible: data is processed in <b>one pass</b>, and the stream may <b>evolve</b>, so a model can become outdated.",
            "<b>Online learning</b> updates the parameters whenever a <b>new observation</b> arrives: one data point per update, <b>stochastic gradient descent</b>.",
            "<b>How fast should it adapt?</b> The <b>learning rate</b> controls it: fast adapts quickly but is noisy, and <b>bad data has an immediate impact</b>. It needs <b>closer monitoring</b> and convergence is less stable.",
            "Three shifts cause model decay: <b>covariate shift</b> (inputs change), <b>prior probability shift</b> (targets change), <b>concept drift</b> (the input-output relationship changes).",
          ],
          "Online learning never stops learning, which is its strength and its risk.",
        ),
      );
    },
  });

  L["ds9-online"] = {
    sum: "<b>Online learning</b> updates the model on every new observation (stochastic gradient descent), so it keeps up with a stream. The <b>learning rate</b> sets how fast it adapts; bad data hits at once. Models decay through <b>covariate shift</b>, <b>prior probability shift</b> and <b>concept drift</b>.",
    steps: [
      st(
        "The extreme case: streaming data",
        `<p>With a <b>stream</b>, data never stops arriving and is not kept. <b>Multiple passes</b> over the data are <b>no longer possible</b>: each record must be processed in <b>one pass</b>. The stream may also <b>evolve over time</b>, so a model trained once can become <b>outdated</b>, and it has to keep up with the stream's <b>high speed</b>.</p><p>Worked example: the courier app logs a delivery about every second across the city. Storing them all to re-read every night is out; instead each record passes the model once, the model learns a little, and the record is gone. Watch <b>Records stored</b> stay at 0.</p>`,
        (box, life) => belt(box, life),
        mc(
          "Why can't a streaming system simply run more epochs over its data?",
          [
            "Each record is seen once: no stored data to go over again",
            "Epochs only work for neural networks, not simple models",
            "More epochs would always make the learning rate too big",
          ],
          "An epoch is a pass over a stored training set. A stream is processed in one pass, so the model must learn from each record as it goes by.",
        ),
      ),
      st(
        "Update on every observation",
        `<p><b>Online learning</b> updates the model parameters <b>whenever a new observation arrives</b>, using that <b>single data point</b>. That is <b>stochastic gradient descent</b>: a mini-batch of size 1, so the model is <b>always adjusting</b> to changes in the data.</p><p>Worked example: w = 4 and a 3 km delivery took 15 minutes. Predict 12: 3 too few. The gradient is 2 × 3 × (12 − 15) = −18, so with learning rate 0.02, w = 4 + 0.36 = 4.36. Step through five records.</p>${mm("<p>The update for one record $(x, y)$ with learning rate $\\eta$:</p>$$w \\leftarrow w - \\eta \\cdot 2x\\,(wx - y)$$<p>For $x = 3$, $y = 15$, $w = 4$: $w = 4 - 0.02 \\times 2 \\times 3 \\times (12 - 15) = 4 + 0.36 = 4.36$.</p>")}`,
        (box, life) => sgdRun(box, life),
        mc(
          "w = 5 and a 2 km delivery took 8 minutes. The learning rate is 0.05. What is w after this online update?",
          ["4.6", "5.4", "3"],
          "Predict 10, which is 2 too many. Gradient 2 × 2 × 2 = 8, step 0.05 × 8 = 0.4 downwards: 5 − 0.4 = 4.6.",
          "Error first (10 − 8), then 2 × km × error, then × 0.05.",
        ),
      ),
      st(
        "How fast should it adapt?",
        `<p>Because it is always adjusting, an online model raises a question: <b>how fast should it adapt</b>? That is <b>controlled by the learning rate</b>. A high rate reacts quickly to real change but also chases noise; a low rate is steady but slow to notice.</p><p>Worked example: roadworks change 4 minutes per km to 6 at record 40. With learning rate 0.004 the model needs about 23 records to get within 0.5 of 6; with 0.02, about 2. But with 0.05 it wobbles by about 1 minute per km even before anything changes, against 0.1 at 0.004.</p>${mm("<p>Ignoring noise, each update shrinks the gap to the true weight $w^*$ by a factor:</p>$$w - w^* \\leftarrow (1 - 2\\eta x^2)(w - w^*)$$<p>A bigger $\\eta$ shrinks the gap faster (quicker adaptation) but also moves $w$ further on every noisy record.</p>")}`,
        (box) => adaptFig(box),
        mc(
          "A team raises the learning rate of its online model. What do they gain and what do they lose?",
          [
            "Faster reaction to change, but a jumpier model",
            "A steadier model, but slower reaction to change",
            "Faster reaction, and no cost at all",
          ],
          "A larger learning rate takes bigger steps on every record: real changes are tracked sooner, and noise moves the model more too.",
        ),
      ),
      st(
        "Bad data hits at once",
        `<p>An online model learns from every record the moment it arrives, so <b>bad data has an immediate performance impact</b>. Online learning <b>requires closer monitoring</b>, and its <b>convergence is less stable</b> than batch training, where data can be checked before training.</p><p>Worked example: a glitch logs a 2 km trip as 90 minutes. With learning rate 0.02 the weight leaps from about 4 to about 10.6 on that one record, and predictions are badly wrong until good records pull it back. With 0.004 it only reaches about 5.3. Compare the rates.</p>`,
        (box) => glitchFig(box),
        mc(
          "Why does an online model need closer monitoring than one trained in batch before deployment?",
          [
            "It updates on each record at once, before anyone checks it",
            "It uses more memory, so it crashes more often",
            "Its learning rate grows a little with every record",
          ],
          "A batch model is trained, checked and then deployed. An online model changes live with every record, so a bad record changes predictions straight away.",
        ),
      ),
      st(
        "Shift 1: covariate shift",
        `<p>Three kinds of <b>data shift</b> cause <b>model decay</b>. The first is <b>covariate shift</b>: the <b>input</b> variables change from the training data to the test data, while the target relationship is unchanged.</p><p>Worked example: a face-recognition model trained on uncovered faces cannot identify people wearing <b>masks</b>. Who each person is has not changed; the inputs now look different from anything in training. In the picture, the model only ever saw the blue inputs.</p>`,
        (box) => shiftFig(box, "cov"),
        mc(
          "A fruit-grading model was trained on photos taken in daylight. The packing house moves to LED lighting, and grades fall apart, though the fruit is just as good. Which shift is this?",
          [
            "Covariate shift: the inputs changed",
            "Prior shift: the share of good fruit changed",
            "Concept drift: what counts as good fruit changed",
          ],
          "The photos (inputs) look different; the link between fruit and grade is the same. That is a covariate shift.",
        ),
      ),
      st(
        "Shift 2: prior probability shift",
        `<p>A <b>prior probability shift</b> is a change in the <b>target</b> variable while the <b>input</b> variables are unchanged: how common each outcome is moves.</p><p>Worked example: a model estimates the probability that someone has <b>flu</b> from their symptoms. Before, 12 in 20 patients with fever and a cough had flu. During the <b>COVID pandemic</b> the same symptoms mostly meant something else: 4 in 20. The symptoms look the same; the answer behind them changed.</p>`,
        (box) => shiftFig(box, "prior"),
        mc(
          "A spam filter sees email that looks the same as before, but the share of spam in the inbox jumps from 10% to 50% after a leak. Which shift is this?",
          [
            "Prior shift: the target mix changed",
            "Covariate shift: the emails look different",
            "Concept drift: what spam means changed",
          ],
          "The emails (inputs) look as they did; what changed is how common the spam target is. That is a prior probability shift.",
        ),
      ),
      st(
        "Shift 3: concept drift",
        `<p><b>Concept drift</b> is when the <b>relationship between input and output changes</b> over time in unforeseen ways. The inputs can look just the same; the right answer for them is different.</p><p>Worked example: roadworks across the city. Deliveries are the same distances as before, but each km now takes about 6 minutes instead of 4. A model that learned "4 per km" is wrong on every trip, and only new data can fix it.</p>`,
        (box) => shiftFig(box, "concept"),
        {
          type: "cat",
          q: "Which kind of data shift is each case?",
          buckets: ["Covariate shift", "Prior shift", "Concept drift"],
          items: [
            ["A voice assistant trained on adults is now used mostly by children", 0],
            ["Same symptoms, but far fewer of those patients have flu", 1],
            ["The same house now sells for much more after a rail line opens", 2],
          ],
          why: "Children's voices are new inputs (covariate). Fewer flu cases is a change in the target mix (prior). The same house fetching a different price is a changed input-output relationship (concept drift).",
        },
      ),
    ],
    guide: [
      "Press <b>+10 records</b> a few times and compare <b>Frozen model error</b> with <b>Online model error</b>.",
      "Press <b>Roadworks</b> and keep adding records (or press <b>Play</b>). Watch both errors.",
      "Pick <b>Learning rate 0.05</b> and press <b>Glitch</b>, then try <b>0.004</b>. Then answer the questions after the demo.",
    ],
  };
})();
