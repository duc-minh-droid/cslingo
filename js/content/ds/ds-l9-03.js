/* Data Science (COM3021), Lecture 9: batch and online machine learning.
   This part: ds9-online (9.5, streaming data, online learning / stochastic gradient descent, learning rate, bad data)
   and ds9-shifts (9.6, the three data shifts: covariate, prior probability and concept drift). */
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

  /* ============ 9.5 Learning on the fly ============ */
  reg({
    id: "ds9-online",
    order: 5,
    num: "9.5",
    title: "Learning on the fly",
    blurb: "When data streams past once and is gone: update on every record, and live with the risks.",
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
          "You pressed <b>Roadworks</b> and kept adding records. Which model's error stayed high?",
          [
            "The frozen model: it never learns from new records",
            "The online model: the change confused its updates",
            "Neither: both recovered within a few records",
          ],
          "The frozen batch model keeps its old weight whatever arrives, so its error stays high. The online model updates on every record and catches up.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "With <b>streaming data</b> each record is seen in <b>one pass</b>, and the stream may <b>evolve</b>.",
            "<b>Online learning</b> updates on every <b>new observation</b>: one data point per update, <b>stochastic gradient descent</b>.",
            "The <b>learning rate</b> sets how fast it adapts; <b>bad data has an immediate impact</b>, so it needs <b>closer monitoring</b>.",
          ],
          "Online learning never stops learning, which is its strength and its risk.",
        ),
      );
    },
  });

  L["ds9-online"] = {
    sum: "<b>Online learning</b> updates the model on every new observation (stochastic gradient descent), so it keeps up with a stream. The <b>learning rate</b> sets how fast it adapts; bad data hits at once.",
    steps: [
      st(
        "A river, not a lake",
        `<p>A lake sits still; you can dip into it again and again. A river flows past once. With a <b>stream</b>, data never stops arriving and isn't kept, so <b>multiple passes</b> are <b>no longer possible</b>: each record is processed in <b>one pass</b>. The stream may also <b>evolve over time</b>, so a model trained once can become <b>outdated</b>, and it must keep up with the stream's <b>high speed</b>. Watch <b>Records stored</b> stay at 0.</p>`,
        (box, life) => belt(box, life),
        mc(
          "Why can't a streaming system simply run more epochs over its data?",
          [
            "Each record is seen once: nothing is stored to reread",
            "Epochs only work for neural networks, not small models",
            "More epochs would always make the learning rate too big",
          ],
          "An epoch is a pass over a stored training set. A stream is processed in one pass, so the model must learn from each record as it goes by.",
        ),
      ),
      st(
        "Update on every record",
        `<p>Picture a sat-nav that nudges its arrival estimate after every junction, not once a day. <b>Online learning</b> updates the model <b>whenever a new observation arrives</b>, using that <b>single data point</b>. That is <b>stochastic gradient descent</b>: a mini-batch of size 1, so the model is <b>always adjusting</b> to changes in the data. Step through five deliveries.</p>${mm("<p>The update for one record $(x, y)$ with learning rate $\\eta$:</p>$$w \\leftarrow w - \\eta \\cdot 2x\\,(wx - y)$$<p>For $x = 3$, $y = 15$, $w = 4$: $w = 4 - 0.02 \\times 2 \\times 3 \\times (12 - 15) = 4 + 0.36 = 4.36$.</p>")}`,
        (box, life) => sgdRun(box, life),
      ),
      st(
        "How fast should it adapt?",
        `<p>A jumpy friend changes their mind with every rumour; a stubborn one never does. An always-adjusting model faces the same choice: <b>how fast should it adapt</b>? The <b>learning rate</b> controls it. A high rate reacts quickly to real change but also chases noise. A low rate is steady but slow to notice. Try the rates when roadworks change the speed.</p>${mm("<p>Ignoring noise, each update shrinks the gap to the true weight $w^*$ by a factor:</p>$$w - w^* \\leftarrow (1 - 2\\eta x^2)(w - w^*)$$<p>A bigger $\\eta$ shrinks the gap faster (quicker adaptation) but also moves $w$ further on every noisy record.</p>")}`,
        (box) => adaptFig(box),
        mc(
          "A team raises the learning rate of its online model. What do they gain and what do they lose?",
          [
            "Faster reaction to change, but a jumpier model",
            "A steadier model, but slower reaction to change",
            "Faster reaction, and nothing lost at all",
          ],
          "A larger learning rate takes bigger steps on every record: real changes are tracked sooner, and noise moves the model more too.",
        ),
      ),
      st(
        "Bad data hits at once",
        `<p>If that jumpy friend hears one silly rumour, they act on it straight away. An online model learns from every record the moment it arrives, so <b>bad data has an immediate performance impact</b>. Online learning <b>requires closer monitoring</b>, and its <b>convergence is less stable</b> than batch training, where data can be checked first. Watch one broken record hit.</p>`,
        (box) => glitchFig(box),
      ),
    ],
    guide: [
      "Press <b>+10 records</b> a few times and compare <b>Frozen model error</b> with <b>Online model error</b>.",
      "Press <b>Roadworks</b> and keep adding records (or press <b>Play</b>). Watch both errors.",
      "Pick <b>Learning rate 0.05</b> and press <b>Glitch</b>, then try <b>0.004</b>. Then answer the question after the demo.",
    ],
  };

  /* ============ 9.6 Three ways a model goes stale ============ */
  reg({
    id: "ds9-shifts",
    order: 6,
    num: "9.6",
    title: "Three ways a model goes stale",
    blurb: "New inputs, a new mix of answers, or new rules: the three data shifts behind model decay.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Covariate shift</b>: the <b>inputs</b> change, the relationship stays (faces in masks).",
            "<b>Prior probability shift</b>: the <b>target</b> mix changes, the inputs look the same (flu during COVID).",
            "<b>Concept drift</b>: the <b>relationship between input and output</b> changes.",
          ],
          "Inputs, answers or the rule between them: any of the three can make a model decay.",
        ),
      );
    },
  });

  L["ds9-shifts"] = {
    sum: "Three data shifts cause <b>model decay</b>: <b>covariate shift</b> (inputs change), <b>prior probability shift</b> (targets change) and <b>concept drift</b> (the input-output relationship changes).",
    steps: [
      st(
        "New-looking inputs",
        `<p>Three kinds of <b>data shift</b> cause <b>model decay</b>. The first: imagine recognising friends by their faces, then everyone starts wearing masks. Your friends are the same people; they just look different. That is <b>covariate shift</b>: the <b>input</b> variables change between training and use, while the link from input to answer stays the same. A face-recognition model trained on uncovered faces struggles with masks.</p>`,
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
        "Same clues, different odds",
        `<p>A <b>prior probability shift</b> changes the <b>target</b> while the <b>inputs</b> stay the same: how common each outcome is moves. A model estimates whether someone has <b>flu</b> from fever and a cough. Before, those symptoms usually meant flu. During the <b>COVID pandemic</b> the same symptoms mostly meant something else. The clues look identical; the odds behind them changed.</p>`,
        (box) => shiftFig(box, "prior"),
      ),
      st(
        "The rules themselves change",
        `<p><b>Concept drift</b> is when the <b>relationship between input and output changes</b> over time in unforeseen ways. The inputs can look just the same, but the right answer for them is different. Back to the courier app: roadworks mean the same distances now take longer per km. A model that learned the old rule is wrong on every trip, and only new data can fix it.</p>`,
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
  };
})();
