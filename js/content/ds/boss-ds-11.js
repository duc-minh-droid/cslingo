/* Data Science Lecture 11 (distributed machine learning): the 11.3 parallel k-means demo, the two "beyond the slides"
   figures of 11.2 (parameter server, data and model parallelism), and the boss quiz. New boss scenario: Lumen, a
   photo app that trains its image tagger on 8 GPUs and groups photos by colour with k-means. */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { qs } = N;
  const { fm, seg, stats, setStats, svg, tx, tint, box, line, fly, gantt, figBox } = S;
  const { CLOUD, START, nearest, centres, tally, scatter } = S;

  /* ---------- 11.3 demo: parallel k-means on three mappers ---------- */
  function kmLab(b) {
    let s;
    const reset = () =>
      (s = {
        c: START.map((x) => [...x]),
        a: null,
        prev: null,
        comb: null,
        it: 0,
        rec: 0,
        shift: 0,
        done: false,
        phase: "map",
        trail: START.map((x) => [x]),
      });
    let on = true;
    reset();
    b.innerHTML = `<div class="controls" data-o></div><div class="ds11-km"><div data-f></div><div><div class="controls"><button class="btn primary" data-m>Map</button><button class="btn" data-c>Combine</button><button class="btn" data-r>Reduce</button></div><div class="controls"><button class="btn" data-a>Run to convergence</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["violet", "Iteration"],
        ["blue", "Records to reducer"],
        ["amber", "Centre shift"],
        ["teal", "Status"],
      ],
    )}</div></div><div class="fig-cap" data-t></div>`;
    const $ = (q) => qs(q, b);
    const draw = (msg) => {
      $("[data-f]").innerHTML = scatter(CLOUD, s.a, s.c, {
        trail: s.trail,
        shapes: true,
        label: "45 points on three mappers (circle, square, triangle), coloured by cluster",
      });
      setStats(b, [
        s.it,
        s.rec || "–",
        s.it ? fm(s.shift, 3) : "–",
        s.done ? "converged" : s.phase === "map" ? "ready to map" : s.phase === "combine" ? "mapped" : "combined",
      ]);
      if (msg) $("[data-t]").innerHTML = msg;
    };
    const map = () => {
      if (s.done) return "Converged already. Press <b>Reset</b> to start again.";
      s.a = CLOUD.map((p) => nearest(p, s.c));
      s.phase = "combine";
      s.comb = null;
      return "<b>Map</b>: each mapper finds every point's nearest centre and emits ⟨cluster, point⟩: 45 pairs.";
    };
    const combine = () => {
      if (s.phase !== "combine") return "Press <b>Map</b> first.";
      s.phase = "reduce";
      if (!on) return "The combiner is <b>off</b>: all 45 pairs will go to the reducer as they are.";
      s.comb = [0, 1, 2].flatMap((m) =>
        tally(
          CLOUD.filter((_, i) => Math.floor(i / 15) === m),
          s.a.filter((_, i) => Math.floor(i / 15) === m),
        ).filter((x) => x.n),
      );
      return `<b>Combine</b>: each mapper adds up its points per cluster and keeps the count: <b>${s.comb.length}</b> records of (sum, count).`;
    };
    const reduce = () => {
      if (s.phase === "combine" && !on) combine();
      if (s.phase !== "reduce") return s.phase === "map" ? "Press <b>Map</b> first." : "Press <b>Combine</b> first.";
      const nc = centres(tally(CLOUD, s.a), s.c),
        same = s.prev && s.a.every((x, i) => x === s.prev[i]);
      s.rec = on ? s.comb.length : CLOUD.length;
      s.shift = Math.max(...nc.map((c, k) => Math.hypot(c[0] - s.c[k][0], c[1] - s.c[k][1])));
      s.c = nc;
      s.c.forEach((x, k) => s.trail[k].push(x));
      s.it++;
      s.prev = s.a;
      s.phase = "map";
      s.done = !!same;
      return same
        ? `<b>Reduce</b>: no point changed cluster since the last iteration, so the test says <b>converged</b> after ${s.it} iterations.`
        : `<b>Reduce</b>: ${s.rec} records add up to new centres; the biggest move is ${fm(s.shift, 3)}. Not converged: the centres go back to the mappers.`;
    };
    seg($("[data-o]"), "on:Combiner on|off:Combiner off", "on", (v) => {
      on = v === "on";
      draw(
        on
          ? "Combiner on: mappers send one (sum, count) per cluster."
          : "Combiner off: mappers send every ⟨cluster, point⟩ pair.",
      );
    });
    $("[data-m]").onclick = () => draw(map());
    $("[data-c]").onclick = () => draw(combine());
    $("[data-r]").onclick = () => draw(reduce());
    $("[data-a]").onclick = () => {
      let m = "";
      for (let k = 0; k < 20 && !s.done; k++) {
        if (s.phase === "map") map();
        if (s.phase === "combine") combine();
        m = reduce();
      }
      draw(m || "Converged already. Press <b>Reset</b>.");
    };
    $("[data-z]").onclick = () => (reset(), draw("Back to the starting centres."));
    draw("Three mappers each hold 15 of the 45 points. Press <b>Map</b>.");
  }

  S.kmLab = kmLab;

  /** Beyond the slides: a parameter server with synchronous rounds or asynchronous pushes. Workers take 2, 3 and 5 s. */
  function asyncFig(b) {
    figBox(b);
    const C = [2, 3, 5],
      T = 15;
    const draw = (v) => {
      let rows, cap;
      if (v === "sync") {
        rows = C.map((c, i) => ({
          n: `W${i + 1}`,
          s: [0, 5, 10].flatMap((t) => [
            [t, t + c, "work", "grad"],
            [t + c, t + 5, "idle"],
          ]),
        }));
        cap =
          "<b>Synchronous</b>: the server waits for all three each round, so every round takes 5 s. In 15 s: 3 rounds, <b>9 gradients</b>, none stale.";
      } else {
        const ev = [];
        rows = C.map((c, i) => ({
          n: `W${i + 1}`,
          s: Array.from(
            { length: Math.floor(T / c) },
            (_, k) => (ev.push([(k + 1) * c, k * c, i]), [k * c, (k + 1) * c, "work", "grad"]),
          ),
        }));
        const stale = ev
          .filter((e) => e[2] === 2)
          .map(([end, start]) => ev.filter((x) => x[0] > start && x[0] < end).length);
        cap = `<b>Asynchronous</b>: each worker pushes its gradient and pulls fresh parameters whenever it finishes. No idle time: <b>${ev.length} gradients</b> in 15 s. But W3's arrive <b>stale</b>: ${Math.max(...stale)} other updates have landed since it read the parameters.`;
      }
      b.children[1].innerHTML = gantt(rows, {
        T,
        label: v === "sync" ? "Synchronous rounds of 5 seconds" : "Workers push gradients as soon as they finish",
      });
      b.lastChild.innerHTML = cap;
    };
    seg(b.firstChild, "sync:Synchronous|async:Asynchronous", "sync", draw);
    draw("sync");
  }

  /** Beyond the slides: data parallelism (copies of the model, shards of data) against model parallelism (layers split). */
  function parallelFig(b) {
    figBox(b);
    const layers = (x, y, on) =>
      [0, 1, 2]
        .map(
          (k) =>
            `<rect x="${x}" y="${y + k * 16}" width="70" height="12" rx="4" fill="${tint(on === undefined || on === k ? "violet" : "line-2", 45)}" stroke="var(--${on === undefined || on === k ? "violet" : "line-2"})"/>`,
        )
        .join("");
    const draw = (v) => {
      let inner;
      if (v === "data")
        inner =
          [0, 1, 2]
            .map(
              (m) =>
                box(20 + m * 170, 20, 140, 110, `Machine ${m + 1}`, "blue") +
                layers(55 + m * 170, 52) +
                tx(90 + m * 170, 120, `data shard ${m + 1} of 3`, { s: 11, c: "var(--text-dim)" }),
            )
            .join("") +
          line("M90 132V150H430V132", "amber") +
          tx(260, 168, "all-reduce the gradients", { s: 11.5, c: "var(--amber-ink)" });
      else
        inner =
          [0, 1, 2]
            .map(
              (m) =>
                box(20 + m * 170, 20, 140, 110, `Machine ${m + 1}`, "blue") +
                layers(55 + m * 170, 52, m) +
                tx(90 + m * 170, 120, `layer ${m + 1} only`, { s: 11, c: "var(--text-dim)" }),
            )
            .join("") +
          line("M160 75H190") +
          line("M330 75H360") +
          fly("M90 150H430", "rose", 3, 0.1, 2.4) +
          tx(260, 168, "one minibatch flows through all three", { s: 11.5, c: "var(--rose-ink)" });
      b.children[1].innerHTML = svg(
        520,
        176,
        inner,
        v === "data"
          ? "Data parallelism: every machine holds the whole model and a share of the data"
          : "Model parallelism: each machine holds one layer of the model",
      );
      b.lastChild.innerHTML =
        v === "data"
          ? "<b>Data parallelism</b>: every machine has the <b>whole model</b> and a share of each minibatch. This is what all-reduce SGD does."
          : "<b>Model parallelism</b>: the <b>model itself</b> is split, a layer per machine. Needed when the model is too big for one machine; the data passes from machine to machine.";
    };
    seg(b.firstChild, "data:Data parallelism|model:Model parallelism", "data", draw);
    draw("data");
  }

  Object.assign(S, { asyncFig, parallelFig });

  /** The pick question: four GPUs, one of them a straggler. */
  const lanes = gantt(
    [3, 5, 3, 3].map((c, i) => ({
      n: `GPU${i + 1}`,
      s: [
        [0, c, "work", `${c} s`],
        [c, 5, "idle"],
        [5, 6, "comm", "all-reduce"],
      ],
    })),
    {
      T: 7,
      pick: true,
      label: "Four GPUs: three compute for 3 seconds, one for 5 seconds, then all join the all-reduce",
    },
  );

  NIC.registerBoss({
    id: "ds11-boss",
    subject: "ds",
    lecture: 11,
    title: "Lecture 11 boss quiz",
    blurb:
      "Ten questions set at a photo app: communication patterns, distributed SGD with all-reduce, idle time and parallel k-means.",
    lede: "A new scenario: <b>Lumen</b> is a photo app. It trains its image tagger with minibatch SGD on 8 GPUs, and groups millions of photos by colour with k-means on a MapReduce cluster. Keep every machine busy and every answer right.",
    qs: [
      {
        type: "match",
        q: "Match each Lumen message to its communication pattern.",
        pairs: [
          ["Push", "The training server sends each new model to the app unasked"],
          ["Pull", "The app asks the server for the latest model when it opens"],
          ["Broadcast", "One machine sends the same starting weights to all 8 GPUs"],
          ["All-reduce", "The 8 GPUs' gradients are summed and every GPU gets the total"],
        ],
        why: "Push: the sender decides. Pull: the receiver requests. Broadcast: one machine sends the same data to many. All-reduce: a reduction whose result lands on every participant.",
      },
      {
        type: "cat",
        q: "Which pattern does each Lumen job need?",
        buckets: ["Reduce", "All-reduce", "Barrier"],
        items: [
          ["Uploads counted on each server, total wanted on the reporting machine", 0],
          ["Error counts from 8 GPUs summed into the coordinator's log", 0],
          ["Gradient sums that every GPU needs before its next update", 1],
          ["Tag counts that every GPU needs to reweight its own data", 1],
          ["No GPU starts epoch 2 until every GPU has finished epoch 1", 2],
          ["All GPUs pause until the last one has loaded its data", 2],
        ],
        why: "A result needed on one machine is a reduce; a result needed on every machine is an all-reduce; waiting until everyone reaches the same point is a barrier.",
      },
      {
        type: "slider",
        q: "Lumen's minibatch is B = 256 and it trains on M = 8 GPUs. What per-GPU minibatch B′ keeps the algorithm the same as minibatch SGD?",
        min: 0,
        max: 64,
        step: 4,
        start: 0,
        ans: 32,
        tol: 0,
        hint: "B = M · B′, so divide 256 by 8.",
        why: "B′ = B ÷ M = 256 ÷ 8 = 32 examples per GPU each iteration.",
      },
      {
        type: "order",
        q: "Put one iteration of distributed SGD with all-reduce in order, as every GPU runs it.",
        items: [
          "Select a minibatch of B′ of its own examples",
          "Compute the average gradient on that minibatch",
          "All-reduce: sum the gradients of all GPUs",
          "Update its copy of the weights with α / M times the sum",
        ],
        why: "Each worker selects its minibatch, computes its gradient, joins the all-reduce so it holds the sum, and then makes the same update as every other worker.",
      },
      {
        type: "mcq",
        q: "Each Lumen training iteration is 4 s of computing followed by a 1 s all-reduce, with no overlap. What fraction of the time are the GPUs computing?",
        o: ["80%", "20%", "75%", "100%"],
        a: 0,
        hint: "4 seconds out of every 4 + 1.",
        why: "4 of every 5 seconds: 80%. During the all-reduce the GPUs are idle, because computation and communication are not overlapped.",
      },
      {
        type: "bug",
        q: "This is the code every GPU runs. Training goes wrong after the first iteration. Tap the faulty line.",
        code: [
          "w = load_initial_weights()",
          "for t in range(T):",
          "    batch = sample(my_examples, B_prime)",
          "    g = average_gradient(w, batch)",
          "    G = reduce_sum(g, onto=gpu_0)",
          "    w = w - (alpha / M) * G",
        ],
        a: 4,
        hint: "Which GPUs hold G after that line?",
        why: "A reduce leaves the sum on GPU 0 only, so the other GPUs have no G to update with and their copies fall out of step. It must be an all-reduce.",
      },
      {
        type: "multi",
        q: "Lumen moves from 1 GPU with B = 256 to 8 GPUs with all-reduce and B′ = 32. Select every true statement.",
        o: [
          "The updates equal minibatch SGD with B = 256",
          "The learning rate can stay as it was",
          "Every GPU plays the same role",
          "GPUs sit idle while the all-reduce runs",
          "Each GPU ends with different weights",
          "The learning rate must be divided by 8",
        ],
        a: [0, 1, 2, 3],
        why: "The all-reduce rebuilds the full minibatch gradient, so it is statistically equivalent to minibatch SGD with the same hyperparameters, and every worker has the same role. Its drawback is idle time during the communication. All GPUs hold identical weights.",
      },
      {
        type: "pick",
        q: "This timeline shows one synchronous iteration on 4 GPUs. Tap the GPU that every other GPU is waiting for.",
        fig: lanes,
        a: "GPU2",
        hint: "Look for the longest blue bar.",
        why: "GPU2 computes for 5 s while the others need 3 s. The all-reduce cannot start until it has its gradient, so the others sit idle: GPU2 is the straggler.",
      },
      {
        type: "slider",
        q: "Four Lumen workers reach a barrier after 5, 7, 6 and 10 s. How many seconds of idle time does the barrier cause in total?",
        min: 0,
        max: 24,
        step: 1,
        start: 0,
        ans: 12,
        tol: 0,
        unit: " s",
        hint: "Each waits until 10 s: 10 − 5, 10 − 7, 10 − 6, 10 − 10.",
        why: "Nobody continues until 10 s: 5 + 3 + 4 + 0 = 12 s of idle machines.",
      },
      {
        type: "mcq",
        q: "In Lumen's parallel k-means, mapper A's combiner reports a cluster's brightness sum 12 from 4 photos, and mapper B's reports sum 18 from 2 photos. What centre does the reducer compute?",
        o: ["5", "6", "7.5", "30"],
        a: 0,
        hint: "Add the sums, add the counts, then divide.",
        why: "(12 + 18) ÷ (4 + 2) = 30 ÷ 6 = 5. Averaging the local means (3 and 9) would wrongly give 6, which is why combiners send sums and counts.",
      },
    ],
  });
})();
