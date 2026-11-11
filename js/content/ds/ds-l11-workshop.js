/* Data Science Lecture 11 workshop (11.W): run a 4-worker training cluster. Choose how gradients are shared, scale out,
   and watch the clock: idle time, overlapping communication, and a straggler. No code, no typing.
   Also here: the pattern playground that the 11.1 demo uses (it is built on the same timeline chart). */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, fm, seg, stats, setStats, svg, box, line, fly, gantt, rng, POOL, mean, trainAR, VALS } = S;

  /* ---------- 11.1 demo: the pattern playground ---------- */
  const PAT = {
    push: { m: 1, who: "B", idle: 0, cap: "A <b>pushes</b> its 7 to B. One message." },
    pull: { m: 2, who: "B", idle: 0, cap: "B <b>pulls</b>: it asks A, and A replies with 7. Two messages." },
    bcast: { m: 4, who: "C1–C4", idle: 0, cap: "A <b>broadcasts</b> its 7: every C now holds a copy. Four messages." },
    red: {
      m: 4,
      who: "B only",
      idle: 0,
      cap: "C1 to C4 are <b>reduced</b> (summed) onto B: 3 + 5 + 2 + 6 = 16. Four messages.",
    },
    all: {
      m: 8,
      who: "C1–C4",
      idle: 0,
      cap: "<b>All-reduce</b>: four numbers in to the sum, four copies of 16 back out. Eight messages.",
    },
    bar: {
      m: 0,
      who: "–",
      idle: 12,
      cap: "<b>Barrier</b>: C1 to C4 take 4, 6, 5 and 9 s; all wait for C4. Idle: 5 + 3 + 4 + 0 = 12 s.",
    },
  };
  function playground(b) {
    let pat = "push",
      ran = false;
    b.innerHTML = `<div class="controls" data-p></div><div data-f></div><div class="controls"><button class="btn primary" data-r>Run</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["blue", "Messages"],
        ["teal", "Holding the result"],
        ["rose", "Idle seconds"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, b);
    const Y = (i) => 14 + i * 50;
    const draw = () => {
      const r = ran && pat,
        cv = r === "bcast" ? [7, 7, 7, 7] : r === "all" ? [16, 16, 16, 16] : VALS,
        bv = r === "push" || r === "pull" ? "7" : r === "red" ? "16" : "–";
      let edges = "";
      const T = 3;
      if (r === "push" || r === "pull") {
        edges =
          line("M110 106C250 106 300 106 430 106", "blue") +
          fly("M110 106H430", "blue", T, r === "pull" ? 1.3 : 0.2, 1.2);
        if (r === "pull") edges += fly("M430 96H110", "violet", T, 0.1, 1.1, 4.5);
      } else if (r === "bcast")
        edges = VALS.map(
          (_, i) => line(`M110 106L230 ${Y(i) + 18}`, "blue") + fly(`M110 106L230 ${Y(i) + 18}`, "blue", T, 0.2, 1.2),
        ).join("");
      else if (r === "red" || r === "all")
        edges = VALS.map((_, i) => {
          const d = `M330 ${Y(i) + 18}L430 106`;
          return (
            line(d, "blue") +
            fly(d, "amber", T, 0.1, 1) +
            (r === "all" ? fly(`M430 106L330 ${Y(i) + 18}`, "rose", T, 1.5, 1) : "")
          );
        }).join("");
      const work = [4, 6, 5, 9];
      const cs = VALS.map((_, i) =>
        box(
          230,
          Y(i),
          100,
          36,
          `C${i + 1}`,
          "amber",
          r === "bar" ? `${work[i]} s of work` : `holds ${cv[i]}`,
          r === "all" || r === "bcast",
        ),
      ).join("");
      $("[data-f]").innerHTML =
        svg(
          540,
          214,
          edges +
            box(10, 74, 100, 64, "A", "blue", "holds 7") +
            cs +
            box(
              430,
              74,
              100,
              64,
              r === "all" ? "+ (sum)" : "B",
              "violet",
              r === "all" ? "16" : `holds ${bv}`,
              r === "red" || r === "push" || r === "pull",
            ),
          "Machines A, C1 to C4 and B, with the chosen pattern's messages",
        ) +
        (r === "bar"
          ? gantt(
              work.map((w, i) => ({
                n: `C${i + 1}`,
                s: [
                  [0, w, "work", `${w} s`],
                  [w, 9, "idle"],
                ],
              })),
              { T: 10, marks: [[9, "barrier"]], label: "C1 to C4 wait at the barrier for C4" },
            )
          : "");
      const p = PAT[pat];
      setStats(b, ran ? [p.m || "–", p.who, p.idle] : ["–", "–", "–"]);
      $("[data-c]").innerHTML = ran ? p.cap : "Pick a pattern and press <b>Run</b>.";
    };
    seg($("[data-p]"), "push:Push|pull:Pull|bcast:Broadcast|red:Reduce|all:All-reduce|bar:Barrier", pat, (v) => {
      pat = v;
      ran = false;
      draw();
    });
    $("[data-r]").onclick = () => ((ran = true), draw());
    $("[data-z]").onclick = () => ((ran = false), draw());
    draw();
  }

  S.playground = playground;

  /* ---------- the cluster: 4 workers, minibatch B = 8 (B' = 2 each), α = 0.3, one weight; gradient of ½(w − y)² is w − y ---------- */
  const M = 4,
    A = 0.3;
  const batchAt = (t) => {
    const r = rng(300 + t);
    return Array.from({ length: 8 }, () => POOL[Math.floor(r() * POOL.length)]);
  };
  /** One timeline iteration plan: compute c per worker (W3 doubled if slow), all-reduce m, overlapped in 4 chunks or not. */
  function plan(m, over, slow, k = 3) {
    const cs = [2, 2, 2, 2].map((c, i) => (slow && i === 2 ? 4 : c)),
      top = Math.max(...cs);
    let iter = top + m;
    if (over) {
      let nd = 0;
      for (let j = 1; j <= 4; j++) nd = Math.max((j * top) / 4, nd) + m / 4;
      iter = nd;
    }
    const rows = cs.map((c, i) => ({ n: `W${i + 1}`, s: [] })),
      net = { n: "Network", s: [] };
    for (let it = 0; it < k; it++) {
      const t = it * iter;
      rows.forEach((r, i) => r.s.push([t, t + cs[i], "work", `${cs[i]} s`], [t + cs[i], t + iter, "idle"]));
      net.s.push(over ? [t + top / 4, t + iter, "comm", "all-reduce"] : [t + top, t + iter, "comm", "all-reduce"]);
    }
    return { rows: [...rows, net], iter, busy: cs.reduce((s, c) => s + c, 0) / (M * iter) };
  }

  function sandbox(stage, api) {
    let pat = "red",
      t = 0,
      ws = [10, 10, 10, 10],
      ref = 10,
      m = 1,
      over = false,
      slow = false;
    const runs = {};
    const C1 = el(
      `<div class="wk-card"><h3>1 · Share the gradients</h3><div class="controls" data-p></div><div data-t></div><div class="controls"><button class="btn primary" data-i>Run one iteration</button><button class="btn ghost" data-z>Reset copies</button></div>${stats(
        [
          ["violet", "Iteration"],
          ["blue", "Copies agree"],
          ["teal", "Matches minibatch SGD"],
        ],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    const C2 = el(
      `<div class="wk-card"><h3>2 · Scale out (B = 8 per iteration)</h3><div class="controls" data-m></div><div class="controls"><button class="btn primary" data-r>Train 10 iterations</button></div><div class="ds11-runs" data-l></div><div class="fig-cap" data-c></div></div>`,
    );
    const C3 = el(
      `<div class="wk-card"><h3>3 · Watch the clock (4 workers)</h3><div class="controls" data-a></div><div class="controls" data-o></div><div class="controls" data-s></div><div data-g></div>${stats(
        [
          ["blue", "Time per iteration"],
          ["amber", "Busy"],
        ],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    stage.append(C1, C2, C3);
    const $1 = (s) => qs(s, C1),
      $2 = (s) => qs(s, C2),
      $3 = (s) => qs(s, C3);

    /* card 1 */
    const agree = () => ws.every((w) => Math.abs(w - ws[0]) < 1e-9);
    const draw1 = (msg, g = [], got = []) => {
      $1("[data-t]").innerHTML =
        `<table class="ds11-tbl"><thead><tr><th>Worker</th><th>its copy of w</th><th>its gradient</th><th>received</th></tr></thead><tbody>${ws
          .map(
            (w, i) =>
              `<tr class="${got[i] === "nothing" ? "bad" : ""}"><td>W${i + 1}</td><td>${fm(w, 3)}</td><td>${g.length ? fm(g[i], 3) : ""}</td><td>${got[i] || ""}</td></tr>`,
          )
          .join("")}</tbody></table>`;
      setStats(C1, [t, agree() ? "yes" : "no", agree() && Math.abs(ws[0] - ref) < 1e-9 ? "yes" : "no"]);
      if (msg) $1("[data-c]").innerHTML = msg;
    };
    seg($1("[data-p]"), "red:Reduce|bcast:Broadcast W1's gradient|all:All-reduce", pat, (v) => {
      pat = v;
      draw1(`Pattern: <b>${{ red: "Reduce onto W1", bcast: "Broadcast of W1's gradient", all: "All-reduce" }[v]}</b>.`);
    });
    $1("[data-i]").onclick = () => {
      const b = batchAt(t),
        g = ws.map((w, i) => mean(b.slice(2 * i, 2 * i + 2).map((y) => w - y))),
        G = g.reduce((s, v) => s + v, 0),
        was = agree() && Math.abs(ws[0] - ref) < 1e-9;
      ref -= A * mean(b.map((y) => ref - y));
      t++;
      let got;
      if (pat === "all") {
        ws = ws.map((w) => w - (A / M) * G);
        got = ws.map(() => `G = ${fm(G, 3)}`);
      } else if (pat === "red") {
        ws[0] -= (A / M) * G;
        got = ["G = " + fm(G, 3), "nothing", "nothing", "nothing"];
      } else {
        ws = ws.map((w) => w - A * g[0]);
        got = ws.map(() => `g₁ = ${fm(g[0], 3)}`);
      }
      const ok = agree() && Math.abs(ws[0] - ref) < 1e-9;
      draw1(
        pat === "all"
          ? `Every worker received the full sum and made the same update.${ok ? "" : " The copies were already out of step, so they stay that way: press <b>Reset copies</b>."}`
          : pat === "red"
            ? "Only W1 has the total. W2 to W4 cannot update, so their copies of the model fall out of step."
            : "Everyone updated the same way, but with W1's 2 examples only: 6 of the 8 gradients were thrown away.",
        g,
        got,
      );
      if (pat === "all" && was && ok && api.done("share"))
        api.say(
          "All four copies agree and match plain minibatch SGD on all 8 examples. That is the point of the all-reduce.",
          "happy",
        );
      else if (pat === "red")
        api.say("A reduce leaves the sum on one machine. The other workers are stuck with an old model.", "surprised");
    };
    $1("[data-z]").onclick = () => {
      ws = [10, 10, 10, 10];
      ref = 10;
      t = 0;
      draw1("All copies back to w = 10.");
    };

    /* card 2 */
    let M2 = 1;
    seg($2("[data-m]"), "1:1 worker|2:2 workers|4:4 workers|8:8 workers", "1", (v) => (M2 = +v));
    $2("[data-r]").onclick = () => {
      runs[M2] = trainAR({ M: M2 })[10];
      $2("[data-l]").innerHTML = Object.entries(runs)
        .map(([k, w]) => `<span class="ds11-run">${k} worker${k > 1 ? "s" : ""}: w = <b>${fm(w, 4)}</b></span>`)
        .join("");
      const ks = Object.keys(runs),
        same = ks.length > 1 && ks.every((k) => Math.abs(runs[k] - runs[ks[0]]) < 1e-9);
      $2("[data-c]").innerHTML =
        `${M2} worker${M2 > 1 ? "s" : ""}, B′ = ${8 / M2} each. ${same ? "Every run lands on the <b>same</b> weight." : "Try another number of workers."}`;
      if (same && api.done("same"))
        api.say(
          "Same weight whatever the number of workers: it is the same minibatch SGD, so the same hyperparameters work.",
          "love",
        );
    };

    /* card 3 */
    const sl = N.slider("All-reduce time (s)", 0.5, 4, 0.5, m, (v) => `${v} s`);
    $3("[data-a]").append(sl);
    const draw3 = (msg) => {
      const p = plan(m, over, slow);
      $3("[data-g]").innerHTML = gantt(p.rows, {
        T: 3 * (4 + 4),
        pick: true,
        label: `Three iterations of ${fm(p.iter, 2)} seconds each`,
      });
      setStats(C3, [`${fm(p.iter, 2)} s`, `${Math.round(p.busy * 100)}%`]);
      if (msg) $3("[data-c]").innerHTML = msg;
      if (!over && p.busy < 0.5 && api.done("idle"))
        api.say(
          `Busy only ${Math.round(p.busy * 100)}%: the workers spend more time waiting for the all-reduce than computing.`,
          "sleepy",
        );
      if (over && m >= 2 && p.busy >= 0.8 - 1e-9 && api.done("overlap"))
        api.say(
          "Sending the first chunks of the gradient while the rest is computed hides most of the network time.",
          "happy",
        );
    };
    sl.onInput((v) => ((m = v), draw3()));
    seg($3("[data-o]"), "stop:Stop and wait|over:Overlap", "stop", (v) => {
      over = v === "over";
      draw3(
        over
          ? "Overlap: each gradient goes out in 4 chunks, the first while the rest is still being computed."
          : "Stop and wait: compute everything, then all-reduce.",
      );
    });
    seg($3("[data-s]"), "eq:Equal workers|slow:One straggler", "eq", (v) => {
      slow = v === "slow";
      draw3(
        slow
          ? "One worker now runs at half speed. Tap the worker everyone else waits for."
          : "All four workers take 2 s.",
      );
    });
    $3("[data-g]").addEventListener("click", (e) => {
      const lane = e.target.closest(".ds11-lane");
      if (!lane) return;
      if (slow && lane.dataset.k === "W3" && api.done("straggler"))
        api.say(
          "W3 is the straggler: every iteration lasts as long as its 4 s, and the other three sit idle.",
          "determined",
        );
      else if (slow)
        api.say(`${lane.dataset.k} finishes early and then waits. Look for the longest blue bar.`, "think");
    });
    draw1("Every worker starts with w = 10. Press <b>Run one iteration</b>.");
    $2("[data-c]").innerHTML = "Pick a number of workers and press <b>Train 10 iterations</b>.";
    draw3("Each worker computes for 2 s per iteration.");
  }

  reg({
    id: "ds11-lab",
    order: 90,
    workshop: true,
    num: "11.W",
    title: "Workshop: run a training cluster",
    blurb: "No code. Share gradients between four workers, scale out, and chase away the idle time.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "Four workers train one model together with minibatch SGD. Make them agree, scale them out, and keep them busy.",
        missions: [
          {
            id: "share",
            t: "Share the gradients",
            d: "In card 1 pick the pattern that gives every worker the summed gradient and press <b>Run one iteration</b> so that <b>Copies agree</b> and <b>Matches minibatch SGD</b> both say yes.",
            hint: "Try <b>Reduce</b> first to see what goes wrong, then <b>Reset copies</b> and use <b>All-reduce</b>.",
          },
          {
            id: "same",
            t: "Same answer, more machines",
            d: "In card 2 press <b>Train 10 iterations</b> with two different numbers of workers.",
            hint: "The minibatch is always 8 examples; only how it is split changes.",
          },
          {
            id: "idle",
            t: "Spot the idle time",
            d: "In card 3, with <b>Stop and wait</b>, raise <b>All-reduce time (s)</b> until <b>Busy</b> drops below 50%.",
            hint: "Each worker computes for 2 s. Busy = 2 ÷ (2 + all-reduce time).",
          },
          {
            id: "overlap",
            t: "Hide the latency",
            d: "Keep <b>All-reduce time (s)</b> at 2 s or more, pick <b>Overlap</b>, and get <b>Busy</b> to 80% or more.",
            hint: "At 2 s, overlapping in 4 chunks leaves only the last chunk's 0.5 s uncovered.",
          },
          {
            id: "straggler",
            t: "Find the straggler",
            d: "Pick <b>One straggler</b>, then tap the worker's row in the timeline that everyone waits for.",
            hint: "Its blue compute bar is twice as long as the others.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds11-lab-1",
          "In card 3 with <b>Stop and wait</b>, <b>Equal workers</b> and an <b>All-reduce time</b> of 2 s, what does <b>Busy</b> show?",
          ["50%", "80%", "100%"],
          "Each iteration is 2 s of computing then 2 s of all-reduce: computing 2 of every 4 seconds, 50%.",
        ),
      );
      root.appendChild(
        pr(
          "ds11-lab-2",
          "With <b>One straggler</b>, switching to <b>Overlap</b> helps a little. Why can it not remove the straggler's cost?",
          [
            "The all-reduce still needs W3's last chunk",
            "Overlap only works with equal workers",
            "W3 stops computing while it overlaps",
          ],
          "Overlap hides network time behind computing, but the sum cannot finish until the slowest worker has produced its gradient, so every iteration still lasts at least W3's 4 s.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Only an <b>all-reduce</b> gives every worker the full gradient sum, so all copies of the model stay identical.",
            "Splitting B = M · B′ across workers gives the <b>same</b> result as one machine: the same hyperparameters work.",
            "In synchronous training workers are <b>idle</b> during the all-reduce; the slower the network, the lower the busy time.",
            "<b>Overlapping</b> communication with computation hides much of that time; a <b>straggler</b> still holds everyone back.",
          ],
          "Agree on the gradient, then fight for every idle second.",
        ),
      );
    },
  });

  L["ds11-lab"] = {
    sum: "Run a four-worker minibatch SGD cluster: share gradients with reduce, broadcast or all-reduce, scale out without changing the result, and cut idle time by overlapping communication.",
    steps: [
      st(
        "What you will practise",
        "<p>Four workers each hold a copy of a one-weight model and 2 of every 8 examples. You choose how they share their gradients, check that more workers give the same answer, then watch the clock: idle time while the all-reduce runs, overlapping it with computation, and a slow worker.</p>",
        F.flow([
          { t: "Share", s: "reduce or all-reduce", c: "blue" },
          { t: "Scale out", s: "1 to 8 workers", c: "teal" },
          { t: "Watch the clock", s: "idle and overlap", c: "amber" },
          { t: "Straggler", s: "who holds us up", c: "rose" },
        ]),
        mc(
          "After a reduce, only W1 holds the gradient sum. What happens if all four workers carry on training?",
          [
            "Their copies of the model drift apart",
            "They all make the same update anyway",
            "Training gets faster with fewer messages",
          ],
          "Only W1 can update with the full sum. The others are left with old parameters, so the copies no longer agree.",
        ),
      ),
      st(
        "Hiding the network",
        "<p>A gradient does not have to wait until it is complete: the first parts can be sent while the rest is still being computed (<i>beyond the slides</i>, this is how training libraries overlap the all-reduce with backpropagation). Here a 2 s computation and a 2 s all-reduce take 4 s with stop and wait, but only 2.5 s overlapped in 4 chunks.</p>",
        gantt(
          [
            {
              n: "Stop",
              s: [
                [0, 2, "work", "compute"],
                [2, 4, "comm", "all-reduce"],
              ],
            },
            { n: "Overlap", s: [[0, 2, "work", "compute"]] },
            { n: "network", s: [[0.5, 2.5, "comm", "all-reduce"]] },
          ],
          { T: 5, label: "Stop and wait takes 4 seconds; overlapping takes 2.5 seconds" },
        ),
        mc(
          "Why does overlapping make an iteration shorter?",
          [
            "The network works while the worker computes",
            "The all-reduce sends less data",
            "Workers skip part of their minibatch",
          ],
          "The same data is sent and the same gradient computed; the two just happen at the same time instead of one after the other.",
        ),
      ),
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
