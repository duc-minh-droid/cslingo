/* Data Science (COM3021), Lecture 11: distributed machine learning.
   This part: shared helpers (machine boxes, travelling messages, the timeline chart) and ds11-patterns (11.1, the
   communication patterns, idle machines and overlapping computation with communication). */
(function () {
  const S = (NIC.shared.ds11 = NIC.shared.ds11 || {});
  const N = NIC;
  const { el, takeaways, header, predict } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 11, ...m });

  /* ---------- helpers shared with the other Lecture 11 files (the right answer goes first: the engine shuffles) ---------- */
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
  const tint = (c, p = 16) => `color-mix(in srgb,var(--${c}) ${p}%,var(--panel))`;
  /** A machine: a sticker box with a name and an optional value underneath. */
  const box = (x, y, w, h, name, c, val, on) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${tint(c, on ? 34 : 14)}" stroke="var(--${c})" stroke-width="${on ? 3 : 2}"/>${tx(x + w / 2, y + (val === undefined ? h / 2 + 5 : h / 2 - 2), name, { s: 13 })}${val === undefined ? "" : tx(x + w / 2, y + h / 2 + 14, val, { s: 11.5, c: "var(--text-dim)", w: 700 })}`;
  const line = (d, c = "line-2", dash = "") =>
    `<path d="${d}" fill="none" stroke="var(--${c})" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  /** A message dot that travels along d during [s, s + l] of a T-second loop (SMIL; hidden under reduced motion). */
  const fly = (d, c, T = 2.4, s = 0, l = 0.8, r = 6) => {
    const a = Math.max(0.001, s / T),
      b = Math.min(0.998, (s + l) / T);
    return `<circle r="${r}" fill="var(--${c})" stroke="var(--panel)" stroke-width="1.5" class="ds11-fly" opacity="0"><animateMotion dur="${T}s" repeatCount="indefinite" path="${d}" keyPoints="0;0;1;1" keyTimes="0;${a};${b};1" calcMode="linear"/><animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${a};${a + 0.001};${b};${b + 0.001};1"/></circle>`;
  };
  /* Seeded randomness, so every learner (and every test) sees the same data. */
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

  /** Timeline chart. rows: [{n: name, s: [[t0, t1, kind, text?]]}], kinds work | comm | idle; marks: [[t, label]]. */
  const KIND = { work: ["blue", "compute"], comm: ["amber", "communicate"], idle: ["line-2", "idle"] };
  function gantt(rows, { T, w = 560, marks = [], label, pick = false }) {
    const lx = 74,
      rh = 30,
      h = 30 + rows.length * rh + 34,
      X = (t) => lx + (t / T) * (w - lx - 12),
      step = T <= 12 ? 1 : T <= 24 ? 2 : 5;
    const ticks = Array.from({ length: Math.floor(T / step) + 1 }, (_, i) => i * step)
      .map(
        (t) =>
          `<line x1="${X(t)}" y1="14" x2="${X(t)}" y2="${20 + rows.length * rh}" stroke="var(--line)" stroke-width="1"/>${tx(X(t), 12, `${t}`, { s: 10, c: "var(--text-faint)", w: 700 })}`,
      )
      .join("");
    const body = rows
      .map((r, i) => {
        const y = 20 + i * rh;
        const bars = r.s
          .map(([a, b, k, t]) => {
            if (b - a <= 0) return "";
            const [c] = KIND[k],
              idle = k === "idle";
            return `<rect x="${X(a)}" y="${y + 4}" width="${X(b) - X(a)}" height="${rh - 8}" rx="5" fill="${idle ? "transparent" : tint(c, 40)}" stroke="var(--${idle ? "rose" : c})" stroke-width="${idle ? 1.5 : 2}" ${idle ? 'stroke-dasharray="4 3"' : ""}/>${t && X(b) - X(a) > t.length * 6 + 6 ? tx((X(a) + X(b)) / 2, y + rh / 2 + 4, t, { s: 10.5, w: 800, c: idle ? "var(--rose-ink)" : "var(--text)" }) : ""}`;
          })
          .join("");
        return `<g ${pick ? `data-pick="${r.n}" data-k="${r.n}" class="ds11-lane"` : ""}><rect x="0" y="${y}" width="${w}" height="${rh}" fill="transparent"/>${tx(lx - 8, y + rh / 2 + 4, r.n, { a: "end", s: 12 })}${bars}</g>`;
      })
      .join("");
    const mk = marks
      .map(
        ([t, l]) =>
          `<line x1="${X(t)}" y1="16" x2="${X(t)}" y2="${24 + rows.length * rh}" stroke="var(--violet)" stroke-width="3"/>${tx(X(t), 36 + rows.length * rh, l, { s: 10.5, c: "var(--violet-ink)" })}`,
      )
      .join("");
    const ly = h - 10,
      leg = Object.values(KIND)
        .map(
          ([c, n], i) =>
            `<rect x="${lx + i * 120}" y="${ly - 10}" width="14" height="12" rx="3" fill="${n === "idle" ? "transparent" : tint(c, 40)}" stroke="var(--${n === "idle" ? "rose" : c})" ${n === "idle" ? 'stroke-dasharray="3 2"' : ""}/>${tx(lx + 20 + i * 120, ly, n, { a: "start", s: 11, c: "var(--text-dim)", w: 700 })}`,
        )
        .join("");
    return svg(w, h + (marks.length ? 8 : 0), ticks + body + mk + leg, label);
  }
  const figBox = (b, n = 1) =>
    (b.innerHTML = `${'<div class="controls" style="justify-content:center"></div>'.repeat(n)}<div></div><div class="fig-cap"></div>`);

  Object.assign(S, { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, tint, box, line, fly, rng, gauss });
  Object.assign(S, { gantt, figBox });

  /* ---------- figures for 11.1 ---------- */
  /** One job of 12 s: on one machine, split evenly over four, or split unevenly (three machines then sit idle). */
  function splitFig(b) {
    figBox(b);
    const draw = (v) => {
      const parts = v === "one" ? [12] : v === "even" ? [3, 3, 3, 3] : [2, 2, 2, 6],
        end = Math.max(...parts);
      const rows = parts.map((p, i) => ({
        n: parts.length === 1 ? "Machine" : `M${i + 1}`,
        s: [
          [0, p, "work", `${p} s`],
          [p, end, "idle"],
          ...(parts.length > 1 ? [[end, end + 1, "comm", "combine"]] : []),
        ],
      }));
      const tot = end + (parts.length > 1 ? 1 : 0),
        idle = parts.reduce((s, p) => s + end - p, 0);
      b.children[1].innerHTML = gantt(rows, { T: 13, label: `The job finishes after ${tot} seconds` });
      b.lastChild.innerHTML =
        v === "one"
          ? "One machine does all 12 s of work: done after <b>12 s</b>."
          : `Done after ${end} s of work + 1 s to combine = <b>${tot} s</b>. ${idle ? `Machines spend <b>${idle} s</b> idle, waiting for M4.` : "Nobody waits."}`;
    };
    seg(b.firstChild, "one:1 machine|even:4 machines, even split|uneven:4 machines, uneven", "even", draw);
    draw("even");
  }

  /** Push and pull between two machines, with the messages travelling. */
  function pushPullFig(b) {
    figBox(b);
    const P = "M130 70H384",
      Q = "M384 92H130";
    const draw = (v) => {
      const push = v === "push";
      b.children[1].innerHTML = svg(
        520,
        150,
        box(20, 40, 110, 76, "A", "blue", "has the data") +
          box(390, 40, 110, 76, "B", "violet", "needs the data") +
          line(P, "blue") +
          (push ? "" : line(Q, "violet", "5 4")) +
          (push
            ? fly(P, "blue", 2.4, 0.2, 1.4) + tx(257, 58, "A sends when A decides", { s: 11.5, c: "var(--blue-ink)" })
            : fly(Q, "violet", 3, 0.1, 1.1, 4.5) +
              fly(P, "blue", 3, 1.4, 1.2) +
              tx(257, 58, "2 · A replies with the data", { s: 11.5, c: "var(--blue-ink)" }) +
              tx(257, 112, "1 · B asks: “send it, please”", { s: 11.5, c: "var(--violet-ink)" })),
        push ? "Push: machine A sends data to machine B" : "Pull: machine B requests data, then A sends it",
      );
      b.lastChild.innerHTML = push
        ? "<b>Push</b>: A starts it. One message, sent whenever A has something new."
        : "<b>Pull</b>: B starts it. A request goes out and the data comes back: two messages, sent when B is ready.";
    };
    seg(b.firstChild, "push:Push|pull:Pull", "push", draw);
    draw("push");
  }

  /** Broadcast to 2, 4 or 8 machines: the same data, one copy per receiver. */
  function broadcastFig(b) {
    figBox(b);
    const draw = (v) => {
      const n = +v,
        h = Math.max(150, 20 + n * 30),
        ys = Array.from({ length: n }, (_, i) => 14 + ((i + 0.5) * (h - 28)) / n);
      const out = ys
        .map((y, i) => {
          const d = `M130 ${h / 2}L380 ${y}`;
          return line(d, "blue") + fly(d, "blue", 2.4, 0.2, 1.2) + box(384, y - 12, 116, 24, `C${i + 1}`, "amber");
        })
        .join("");
      b.children[1].innerHTML = svg(
        520,
        h,
        box(20, h / 2 - 34, 110, 68, "A", "blue", "50 MB model") + out,
        `Broadcast: A sends the same data to ${n} machines`,
      );
      b.lastChild.innerHTML = `A sends the same 50 MB to <b>${n}</b> machines: ${n} × 50 = <b>${n * 50} MB</b> leaves A when it sends each copy itself.`;
    };
    seg(b.firstChild, "2:2 machines|4:4 machines|8:8 machines", "4", draw);
    draw("4");
  }

  /** Stepper: reduce (a sum) of 3, 5, 2 and 6 from C1 to C4 onto B. */
  const VALS = [3, 5, 2, 6];
  function reduceRun(b, life) {
    const Y = (i) => 14 + i * 44;
    F.run(b, life, {
      build(stage) {
        stage.innerHTML = svg(
          520,
          190,
          "<g></g>",
          "Reduce: C1 to C4 send their numbers to a sum, and only B gets the total",
        );
        return stage.querySelector("svg g");
      },
      *frames() {
        let sum = 0;
        yield { k: -1, sum: null, cap: "Four machines each hold a number: 3, 5, 2 and 6. B wants their <b>sum</b>." };
        for (let i = 0; i < 4; i++) {
          sum += VALS[i];
          yield { k: i, sum, cap: `C${i + 1} sends ${VALS[i]}. Running sum: <b>${sum}</b>.` };
        }
        yield {
          k: 4,
          sum,
          cap: `The result, <b>${sum}</b>, is materialised on <b>B only</b>. C1 to C4 still hold just their own numbers.`,
        };
      },
      draw(g, f) {
        const edges = VALS.map((v, i) => {
          const d = `M120 ${Y(i) + 17}L300 95`,
            on = i === f.k;
          return (
            line(d, i <= f.k ? "blue" : "line-2", i <= f.k ? "" : "5 4") +
            (on ? fly(d, "blue", 1.2, 0, 1) : "") +
            box(20, Y(i), 100, 34, `C${i + 1}`, "amber", `holds ${v}`, on)
          );
        }).join("");
        g.innerHTML =
          edges +
          `<circle cx="318" cy="95" r="22" fill="${tint("violet", 20)}" stroke="var(--violet)" stroke-width="2"/>${tx(318, 101, "+", { s: 22 })}` +
          line("M340 95H392", f.k === 4 ? "violet" : "line-2") +
          box(
            394,
            60,
            110,
            70,
            "B",
            "violet",
            f.sum === null ? "empty" : f.k === 4 ? `sum = ${f.sum}` : `so far ${f.sum}`,
            f.k === 4,
          );
      },
    });
  }

  /** Reduce against all-reduce: the same sum, delivered to one machine or to all of them. */
  function allReduceFig(b) {
    figBox(b);
    const Y = (i) => 12 + i * 42;
    const draw = (v) => {
      const all = v === "all";
      const ins = VALS.map((x, i) => {
        const d = `M110 ${Y(i) + 16}L240 94`;
        return line(d, "blue") + fly(d, "amber", 3.2, 0.1, 1) + box(10, Y(i), 100, 32, `C${i + 1}`, "amber", `${x}`);
      }).join("");
      const outs = all
        ? VALS.map((_, i) => {
            const d = `M282 94L410 ${Y(i) + 16}`;
            return (
              line(d, "blue") + fly(d, "rose", 3.2, 1.6, 1) + box(410, Y(i), 100, 32, `C${i + 1}`, "amber", "16", true)
            );
          }).join("")
        : line("M282 94H410", "blue") +
          fly("M282 94H410", "rose", 3.2, 1.6, 1) +
          box(410, 60, 100, 68, "B", "violet", "16", true);
      b.children[1].innerHTML = svg(
        520,
        182,
        ins +
          `<circle cx="261" cy="94" r="21" fill="${tint("violet", 20)}" stroke="var(--violet)" stroke-width="2"/>${tx(261, 100, "+", { s: 22 })}` +
          outs,
        all ? "All-reduce: the sum 16 ends up on all four machines" : "Reduce: the sum 16 ends up on machine B only",
      );
      b.lastChild.innerHTML = all
        ? "<b>All-reduce</b>: the same sum, 16, lands back on <b>every</b> machine that sent a number. Think of it as a reduce followed by a broadcast."
        : "<b>Reduce</b>: the sum, 16, lands on <b>one</b> machine, B. The senders do not learn the total.";
    };
    seg(b.firstChild, "red:Reduce|all:All-reduce", "all", draw);
    draw("all");
  }

  /** Wait (B waits for A's signal) and barrier (everyone waits for the slowest), with the slowest time on a slider. */
  function barrierFig(b) {
    figBox(b, 2);
    let mode = "bar";
    const sl = N.slider("Slowest machine (s)", 5, 12, 1, 9, (v) => `${v} s`);
    b.children[1].append(sl);
    const draw = () => {
      const s = sl.value;
      let rows, cap;
      if (mode === "wait") {
        rows = [
          {
            n: "A",
            s: [
              [0, s, "work", "A works"],
              [s, s + 0.4, "comm", ""],
            ],
          },
          {
            n: "B",
            s: [
              [0, 3, "work", "B works"],
              [3, s + 0.4, "idle", "waiting"],
              [s + 0.4, s + 2.4, "work", "goes on"],
            ],
          },
        ];
        cap = `<b>Wait</b>: B pauses after 3 s until A's signal arrives, so B is idle for about <b>${s - 3} s</b>.`;
      } else {
        const t = [4, 6, 5, s],
          end = Math.max(...t);
        rows = t.map((w, i) => ({
          n: `C${i + 1}`,
          s: [
            [0, w, "work", `${w} s`],
            [w, end, "idle"],
            [end, end + 2, "work", "next"],
          ],
        }));
        cap = `<b>Barrier</b>: nobody passes until all four arrive, at ${end} s. Idle time: ${t.map((w) => end - w).join(" + ")} = <b>${t.reduce((a, w) => a + end - w, 0)} s</b>.`;
      }
      b.children[2].innerHTML = gantt(rows, {
        T: 15,
        marks: mode === "bar" ? [[Math.max(6, s), "barrier"]] : [],
        label:
          mode === "bar" ? "Four machines wait at a barrier for the slowest" : "Machine B waits for a signal from A",
      });
      b.lastChild.innerHTML = cap;
    };
    seg(b.firstChild, "wait:Wait|bar:Barrier", "bar", (v) => ((mode = v), draw()));
    sl.onInput(draw);
    draw();
  }

  /** Overlap: four rounds of 3 s of computing, each followed by sending its result. */
  function overlapPlan(k, c, m, over) {
    const cw = [],
      nw = [];
    let tC = 0,
      tN = 0;
    for (let i = 0; i < k; i++) {
      const s = over ? tC : Math.max(tC, tN);
      cw.push([s, s + c, "work", `round ${i + 1}`]);
      tC = s + c;
      const ns = Math.max(tC, tN);
      nw.push([ns, ns + m, "comm", "send"]);
      tN = ns + m;
      if (!over) tC = tN;
    }
    return { cw, nw, end: tN };
  }
  function overlapFig(b) {
    figBox(b, 2);
    let over = false;
    const sl = N.slider("Send time per round (s)", 1, 5, 1, 2, (v) => `${v} s`);
    b.children[1].append(sl);
    const draw = () => {
      const m = sl.value,
        p = overlapPlan(4, 3, m, over);
      b.children[2].innerHTML = gantt(
        [
          { n: "Compute", s: p.cw },
          { n: "Network", s: p.nw },
        ],
        { T: 32, label: `Four rounds finish after ${p.end} seconds` },
      );
      b.lastChild.innerHTML = `${over ? "<b>Overlap</b>: the next round starts while the last result is still on the wire." : "<b>Stop and wait</b>: the worker sits still while each result is sent."} Done after <b>${p.end} s</b>; computing for 12 of them (${Math.round(1200 / p.end)}% busy).`;
    };
    seg(b.firstChild, "stop:Stop and wait|over:Overlap", "stop", (v) => ((over = v === "over"), draw()));
    sl.onInput(draw);
    draw();
  }
  S.overlapPlan = overlapPlan;

  S.VALS = VALS;

  /* ============ 11.1 Communication patterns ============ */
  reg({
    id: "ds11-patterns",
    order: 1,
    num: "11.1",
    title: "Communication patterns",
    blurb:
      "Push, pull, broadcast, reduce, all-reduce, wait and barrier: how machines talk, and why idle machines waste money.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Pattern playground</h2><span class="tag">six patterns</span></div><div></div></div>`,
      );
      root.appendChild(card);
      S.playground(card.lastElementChild);
      root.appendChild(
        pr(
          "ds11-patterns-1",
          "Pick <b>Reduce</b> and press <b>Run</b>. Afterwards, what does C3 hold?",
          ["Its own 2, unchanged", "The total, 16", "Nothing: it handed its number over"],
          "A reduce materialises the result on one machine, B. The senders keep their own numbers and never see the total; that is what all-reduce adds.",
        ),
      );
      root.appendChild(
        pr(
          "ds11-patterns-2",
          "Run <b>Reduce</b>, then <b>All-reduce</b>, and compare <b>Messages</b>. What does all-reduce cost here?",
          ["Twice as many: 8 against 4", "The same: 4 each", "One more: 5 against 4"],
          "Done through a summing point as in the playground, all-reduce is a reduce (4 numbers in) followed by a broadcast (4 copies out): 8 messages.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "The <b>pattern of communication</b> is one of the most important choices in a distributed algorithm.",
            "<b>Push</b>: A sends to B. <b>Pull</b>: B requests from A. <b>Broadcast</b>: A sends to many.",
            "<b>Reduce</b>: combine (usually sum) values from C1…Cn onto <b>one</b> machine. <b>All-reduce</b>: the result lands on <b>all</b> of them.",
            "<b>Wait</b>: one machine pauses for another's signal. <b>Barrier</b>: everyone waits until all reach the same point.",
            "Avoid machines <b>waiting idle</b>; <b>overlap computation and communication</b> to hide network latency.",
          ],
          "Who sends, who receives, and who is left waiting: that is the whole design.",
        ),
      );
    },
  });

  L["ds11-patterns"] = {
    sum: "Machines in a distributed algorithm talk in a few standard <b>communication patterns</b>: push, pull, broadcast, reduce, all-reduce, wait and barrier. The goal is to keep every machine busy and <b>overlap computation with communication</b>.",
    steps: [
      st(
        "Many machines, one job",
        `<p>A job that takes one machine 12 seconds can be split across 4 machines. If each gets 3 seconds of work and combining the answers takes 1 second, the job is done in <b>4 s</b> instead of 12.</p><p>But if the split is uneven, say 2, 2, 2 and 6 seconds, everyone waits for the slow one: the job takes 7 s, and three machines sit <b>idle</b> for 4 s each. Two things decide how well a distributed algorithm runs: its <b>pattern of communication</b>, and avoiding a machine <b>waiting idle</b> for another.</p>${mm("<p>With work $w_1, \\dots, w_n$ and combine time $c$, the job ends at</p>$$T = \\max_i w_i + c \\qquad \\text{idle} = \\sum_i \\big(\\max_j w_j - w_i\\big)$$<p>Uneven split: $T = 6 + 1 = 7$ and idle $= 4 + 4 + 4 + 0 = 12$ s.</p>")}`,
        (b) => splitFig(b),
        mc(
          "12 s of work is split evenly across 3 machines, and combining takes 1 s. When is the job done?",
          ["After 5 s", "After 4 s", "After 13 s"],
          "Each machine does 12 ÷ 3 = 4 s of work, then 1 s to combine: 5 s.",
        ),
      ),
      st(
        "Push and pull",
        `<p>The simplest patterns move data between two machines. In a <b>push</b>, machine A sends data to machine B: A decides when. In a <b>pull</b>, machine B requests data from machine A: B decides when, and it costs a request plus the reply.</p><p>Worked example: a training server that sends its newest model to a phone app every time it improves is <b>pushing</b>. An app that asks the server “anything new?” each time it opens is <b>pulling</b>. Switch between them and watch who starts the conversation.</p>`,
        (b) => pushPullFig(b),
        mc(
          "A monitoring dashboard asks the training cluster for its latest accuracy once a minute. Which pattern is that?",
          ["Pull", "Push", "Broadcast"],
          "The dashboard (the receiver) requests the data each time: that is a pull. In a push the cluster would send it unasked.",
        ),
      ),
      st(
        "Broadcast",
        `<p>In a <b>broadcast</b>, machine A sends the same data to many machines. It is how every worker gets the same starting model, or the same settings.</p><p>Worked example: A holds a 50 MB model and broadcasts it to 4 workers. Each receives 50 MB, and if A sends each copy itself, 4 × 50 = <b>200 MB</b> leaves A. Double the workers and A's sending doubles too.</p>${mm("<p>Sending every copy from A costs A $n \\times s$ for $n$ receivers and data size $s$. <i>Beyond the slides:</i> real systems relay through a tree (each receiver forwards to others), which needs only about $\\lceil \\log_2 n \\rceil$ rounds: 3 rounds for 8 machines.</p>")}`,
        (b) => broadcastFig(b),
        mc(
          "A broadcasts 30 MB of parameters to 5 workers, sending each copy itself. How much data leaves A?",
          ["150 MB", "30 MB", "6 MB"],
          "Every worker needs its own copy of the same 30 MB: 5 × 30 = 150 MB.",
        ),
      ),
      st(
        "Reduce",
        `<p>A <b>reduce</b> computes some reduction, usually a <b>sum</b>, of data spread over machines C1, C2, …, Cn, and materialises the result on <b>one</b> machine, B.</p><p>Worked example: C1 to C4 hold 3, 5, 2 and 6. They send their numbers in, the sum grows 3, 8, 10, 16, and B ends up with <b>16</b>. The four senders still know only their own number. Press play.</p>${mm("<p>A reduce with the sum as its operation:</p>$$B \\leftarrow \\sum_{i=1}^{n} x_i = 3 + 5 + 2 + 6 = 16$$<p>Any operation that can be applied in any order and grouping works the same way (a maximum, a minimum, a count).</p>")}`,
        (b, life) => reduceRun(b, life),
        mc(
          "Five workers each count the words in their share of a book. You want the total on one coordinator only. Which pattern fits?",
          ["Reduce", "Broadcast", "All-reduce"],
          "Combining values from many machines onto one machine is a reduce. All-reduce would also copy the total back to every worker, which nobody needs here.",
        ),
      ),
      st(
        "All-reduce",
        `<p>An <b>all-reduce</b> computes the same reduction, but materialises the result on <b>all</b> the machines that took part. You can picture it as a reduce followed by a broadcast of the answer.</p><p>Worked example: with 3, 5, 2 and 6 on C1 to C4, a reduce leaves 16 on B only; an all-reduce leaves <b>16 on every C</b>. That matters when every machine needs the total to carry on, which is exactly what distributed training needs in the next lesson.</p>${mm("<p>After an all-reduce every machine $i$ holds</p>$$y_i = \\sum_{j=1}^{n} x_j$$<p><i>Beyond the slides:</i> the <b>ring all-reduce</b> passes chunks around a ring of $n$ machines. Each machine sends about $2\\frac{n-1}{n}$ times the data size, almost independent of $n$, so no single machine becomes a bottleneck.</p>")}`,
        (b) => allReduceFig(b),
        mc(
          "Four machines hold 2, 4, 6 and 8 and run an all-reduce (sum). Which machines hold 20 afterwards?",
          ["All four", "Only the first machine", "None: each keeps its own number"],
          "All-reduce materialises the result on every participating machine: all four hold 2 + 4 + 6 + 8 = 20.",
        ),
      ),
      st(
        "Wait and barrier",
        `<p>Two patterns are about time, not data. In a <b>wait</b>, one machine pauses its computation until a signal arrives from another. A <b>barrier</b> makes many machines wait until <b>all</b> of them reach the same point in their execution, then all continue from there.</p><p>Worked example: C1 to C4 reach the barrier after 4, 6, 5 and 9 s. Nobody moves on until 9 s, so the idle time is 5 + 3 + 4 + 0 = <b>12 s</b>. Drag the slowest machine and watch the dashed idle bars.</p>${mm("<p>For arrival times $t_1, \\dots, t_n$ the barrier opens at $\\max_i t_i$ and wastes</p>$$\\text{idle} = \\sum_{i=1}^{n} \\big(\\max_j t_j - t_i\\big) = n \\max_j t_j - \\sum_i t_i$$<p>Here $4 \\times 9 - 24 = 12$ s.</p>")}`,
        (b) => barrierFig(b),
        mc(
          "Four machines reach a barrier after 2, 3, 3 and 8 s. How much idle time does the barrier cause in total?",
          ["16 s", "8 s", "0 s"],
          "Everyone waits until 8 s: 6 + 5 + 5 + 0 = 16 s of idle machines.",
          "Each machine waits 8 minus its own time.",
        ),
      ),
      st(
        "Overlap computation and communication",
        `<p>Communication over the network can be slow, so we want to <b>hide this latency</b>. An important principle of distributed computing is to <b>overlap computation and communication</b>: workers keep doing useful work while results are being sent, instead of stopping to wait for the network.</p><p>Worked example: 4 rounds, each 3 s of computing and 2 s of sending. Stop and wait takes 4 × 5 = 20 s. If round 2 starts while round 1's result is still on the wire, the job takes 4 × 3 + 2 = <b>14 s</b>. This works whenever the next piece of work does not need the result being sent.</p>${mm("<p>With $k$ rounds of computing $c$ and sending $m$:</p>$$T_{\\text{wait}} = k(c + m) \\qquad T_{\\text{overlap}} = k\\max(c, m) + \\min(c, m)$$<p>$4(3 + 2) = 20$ against $4 \\times 3 + 2 = 14$. Once sending is slower than computing ($m > c$), the network sets the pace.</p>")}`,
        (b) => overlapFig(b),
        mc(
          "Three rounds of 4 s computing and 1 s sending. With computation and communication overlapped, how long does the job take?",
          ["13 s", "15 s", "12 s"],
          "Computing runs back to back for 3 × 4 = 12 s; only the last send (1 s) is left over: 13 s. Stop and wait would take 3 × 5 = 15 s.",
        ),
      ),
    ],
    guide: [
      "Pick <b>Push</b> and press <b>Run</b>, then try <b>Pull</b> and compare <b>Messages</b>.",
      "Try <b>Broadcast</b>, <b>Reduce</b> and <b>All-reduce</b>: watch <b>Holding the result</b>.",
      "Pick <b>Barrier</b> and press <b>Run</b>: read <b>Idle seconds</b>. Then answer the questions after the demo.",
    ],
  };
})();
