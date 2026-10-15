/* Data Science Lecture 6 workshop (6.W): cut a network and see CAP, judge register timelines, and run a transaction
   across three databases with and without two-phase commit. No code, no typing. */
(function () {
  const S = NIC.shared.dsL6;
  const { reg, mc, pr, st, chip, reps, net, seg, tl, R, W, lin, tpcPanel } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ---------- mission 1-3: three replicas and a cut link ---------- */
  function replicas(stage, api) {
    let v = [5, 5, 5],
      last = 5,
      cut = false,
      pol = "C",
      wroteCut = false,
      refused = false,
      stale = false,
      note = "Three replicas hold the same number. R1 and R2 are on one side of the network, R3 on the other.";
    const box =
      el(`<div class="wk-card"><h3>Three replicas of one value</h3><div class="wk-row" data-n></div><div class="wk-row" data-p></div><div data-r></div>
      <div class="wk-row" style="margin-top:8px"><button class="btn primary small" data-w>Write 7 at R1</button><button class="btn small" data-t>Advance 1 tick</button><button class="btn small" data-rd>Read at R3</button><button class="btn small ghost" data-rs>Reset</button></div>
      <p class="wk-note" data-m style="min-height:44px"></p></div>`);
    stage.appendChild(box);
    const $ = (q) => qs(q, box);
    function draw() {
      $("[data-r]").innerHTML =
        net(!cut) +
        reps(
          v.map((x, i) => ({
            name: `R${i + 1}`,
            val: x,
            cls: `${x === last ? "fresh" : "stale"} ${cut && i === 2 ? "cut" : ""}`,
            tag: chip(x === last ? "latest" : "outdated", x === last ? "new" : "old"),
          })),
        );
      $("[data-m]").innerHTML = note;
    }
    function check() {
      if (wroteCut && api.done("cut"))
        api.say(
          "R3 is on the far side of a cut link, so it cannot hear about the new value. That is a partition.",
          "think",
        );
      if (refused && stale && api.done("both"))
        api.say(
          "Refusing keeps consistency and costs availability. Answering keeps availability and risks a stale value.",
          "wink",
        );
      if (wroteCut && !cut && v.every((x) => x === last) && api.done("heal"))
        api.say("The link is back and the replicas have <b>converged</b>: eventual consistency in action.", "happy");
    }
    seg($("[data-n]"), "up:Link to R3 up|cut:Link to R3 cut", "up", (x) => {
      cut = x === "cut";
      note = cut
        ? "The link to R3 is cut. R1 and R2 keep working together."
        : "The link is back. R3 will catch up on the next tick.";
      draw();
      check();
    });
    seg($("[data-p]"), "C:Refuse when cut off|A:Answer when cut off", "C", (x) => {
      pol = x;
      note =
        x === "C"
          ? "R3 will refuse reads while it is cut off."
          : "R3 will answer reads from its own copy, even while cut off.";
      draw();
    });
    $("[data-w]").onclick = () => {
      v[0] = v[1] = last = 7;
      wroteCut = wroteCut || cut;
      note = cut
        ? "R1 and R2 now hold 7. R3 cannot be told: the link is cut."
        : "R1 and R2 hold 7. R3 gets it on the next tick.";
      draw();
      check();
    };
    $("[data-t]").onclick = () => {
      if (!cut) v[2] = last;
      note = cut ? "A tick passes, but nothing can cross the cut link." : "R3 receives the latest value.";
      draw();
      check();
    };
    $("[data-rd]").onclick = () => {
      if (cut && pol === "C") {
        refused = true;
        note = "R3 is cut off and cannot confirm it is current, so it returns an <b>error</b>.";
      } else {
        stale = stale || (cut && v[2] !== last);
        note = `R3 answers <b>${v[2]}</b>${v[2] === last ? "." : `, but the latest value is ${last}: a <b>stale</b> read.`}`;
      }
      draw();
      check();
    };
    $("[data-rs]").onclick = () => {
      v = [5, 5, 5];
      last = 5;
      wroteCut = refused = stale = false;
      note = "Reset: all three replicas hold 5.";
      draw();
    };
    draw();
  }

  /* ---------- mission 4: four register timelines ---------- */
  const HIST = [
    {
      w: [3, 9],
      r: [
        [0, 0, 2, 0],
        [1, 4, 7, 1],
        [0, 5, 8, 1],
        [1, 10, 12, 1],
      ],
    },
    {
      w: [3, 9],
      r: [
        [0, 4, 6, 1],
        [1, 7, 10, 0],
        [0, 11, 13, 1],
      ],
    },
    {
      w: [3, 8],
      r: [
        [1, 0, 2, 0],
        [0, 9, 11, 0],
        [1, 12, 14, 1],
      ],
    },
    {
      w: [4, 12],
      r: [
        [0, 5, 7, 0],
        [1, 8, 10, 0],
        [0, 9, 11, 1],
      ],
    },
  ];
  const reads = (h) => {
    const n = [0, 0];
    return h.r.map(([c, s, e, v]) => ({ c, s, e, v, n: `${"AB"[c]}${++n[c]}` }));
  };
  function timelines(stage, api) {
    const ok = HIST.map(() => false);
    const box = el(
      `<div class="wk-card"><h3>Is each history linearizable?</h3><p class="wk-note">Register x starts at 0 and client C writes 1. Decide for each history.</p><div data-h></div></div>`,
    );
    stage.appendChild(box);
    HIST.forEach((h, k) => {
      const rd = reads(h),
        truth = lin({ s: h.w[0], e: h.w[1] }, rd).ok;
      const row =
        el(`<div style="margin:10px 0;border-top:2px solid var(--line-soft);padding-top:8px"><b>History ${k + 1}</b><div>${tl([...rd.map((o) => R(o.c, o.s, o.e, o.v, `${o.n} ⇒ ${o.v}`)), W(2, h.w[0], h.w[1])])}</div>
        <div class="wk-row"><button class="btn small" data-a="1">Linearizable</button><button class="btn small" data-a="0">Not linearizable</button><span class="wk-note" style="flex:1"></span></div></div>`);
      row.querySelectorAll("[data-a]").forEach((b) => {
        b.onclick = () => {
          const right = (b.dataset.a === "1") === truth;
          ok[k] = ok[k] || right;
          qs(".wk-note", row).innerHTML = right
            ? `Correct. ${lin({ s: h.w[0], e: h.w[1] }, rd).msg}`
            : "Not quite. Look for one moment inside the write bar where every 0-read starts before it and every 1-read ends after it.";
          if (ok.every(Boolean) && api.done("judge"))
            api.say("All four judged correctly: a flip moment exists only when no read goes back in time.", "happy");
        };
      });
      qs("[data-h]", box).appendChild(row);
    });
  }

  /* ---------- mission 5: two-phase commit ---------- */
  function transaction(stage, api) {
    const box = el(`<div class="wk-card"><h3>One purchase, three databases</h3><div></div></div>`);
    stage.appendChild(box);
    const seen = { naive: false, tpc: false };
    tpcPanel(box.lastElementChild, (res, mode, votes) => {
      if (mode === "naive" && !res.same) seen.naive = true;
      if (mode === "2pc" && res.same && votes.some((x) => x !== "yes")) seen.tpc = true;
      if (seen.naive && seen.tpc && api.done("tpc"))
        api.say(
          "Without a coordinator the databases disagreed. With prepare and a single decision, they all agree.",
          "happy",
        );
    });
  }

  reg({
    id: "ds6-lab",
    order: 90,
    workshop: true,
    num: "6.W",
    title: "Workshop: cut, test and commit",
    blurb: "No code. Cut a network and watch CAP bite, judge register timelines and run a two-phase commit.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "Three labs in one: a replicated value on a flaky network, four register timelines, and a purchase that touches three databases.",
        missions: [
          {
            id: "cut",
            t: "Cut the link and write",
            d: "Set the link to <b>Link to R3 cut</b>, then press <b>Write 7 at R1</b>.",
            hint: "R3 is on the far side. After the write it still holds the old value.",
          },
          {
            id: "both",
            t: "Refuse, then answer",
            d: "While the link is cut, press <b>Read at R3</b> under <b>Refuse when cut off</b>, then again under <b>Answer when cut off</b>.",
            hint: "Switch the policy between the two reads. One gives an error and the other a stale value.",
          },
          {
            id: "heal",
            t: "Heal and converge",
            d: "Set the link back to <b>Link to R3 up</b> and press <b>Advance 1 tick</b> until all three replicas agree.",
            hint: "You need to have written while the link was cut for the replicas to differ.",
          },
          {
            id: "judge",
            t: "Judge four timelines",
            d: "For each history press <b>Linearizable</b> or <b>Not linearizable</b>, until all four are right.",
            hint: "Find a flip moment inside the write bar: 0-reads must start before it, 1-reads must end after it.",
          },
          {
            id: "tpc",
            t: "Break it, then fix it",
            d: "In <b>Commit everywhere</b> set one database to <b>No</b> and run it. Then choose <b>Two-phase commit</b> and run the same votes.",
            hint: "Set one database to No, press Run the transaction, switch the mode and press it again.",
          },
        ],
        build(stage, api) {
          replicas(stage, api);
          timelines(stage, api);
          transaction(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds6-lab-1",
          "The link to R3 is cut, the policy is <b>Answer when cut off</b>, and you pressed <b>Write 7 at R1</b> from a fresh start. What does <b>Read at R3</b> return?",
          ["5: the old, stale value", "7, the new value from R1", "An error: R3 refuses"],
          "R3 cannot hear about the write across the cut link. Because it answers anyway, it returns what it holds: 5, while the latest value is 7.",
        ),
      );
      root.appendChild(
        pr(
          "ds6-lab-2",
          "In one timeline a read starts after the write has completed and still returns 0. What is the verdict for that history?",
          [
            "Not linearizable: later reads must see 1",
            "Linearizable: a 0 is legal for any read",
            "It depends on the other reads in the history",
          ],
          "Once the write has completed every later read must return the new value. No flip moment inside the write bar can make this read start before it.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "During a <b>partition</b> a cut-off replica either <b>refuses</b> (consistent, unavailable) or <b>answers</b> (available, maybe stale).",
            "When the link returns the replicas <b>converge</b>, as eventual consistency promises.",
            "A history is <b>linearizable</b> when one flip moment inside the write explains every read.",
            "<b>Two-phase commit</b> asks every database to prepare, then sends one decision to all: commit only if all said yes.",
          ],
          "Partitions force a choice, linearizability needs one flip, and 2PC turns many nodes into one decision.",
        ),
      );
    },
  });

  L["ds6-lab"] = {
    sum: "Cut a network, judge register timelines and run a transaction across three databases, with and without two-phase commit.",
    steps: [
      st(
        "What you will practise",
        "Three small labs. First <b>cut the network</b> and see a replica refuse or answer wrongly. Then judge <b>timelines</b> of reads and a write. Last, run a <b>transaction across three databases</b>.",
        F.flow([
          { t: "Cut the link", s: "CAP", c: "rose" },
          { t: "Judge timelines", s: "linearizable?", c: "blue" },
          { t: "Run 2PC", s: "all or nothing", c: "teal" },
        ]),
        mc(
          "A replica is cut off and returns an error rather than a possibly old value. Which property does that favour?",
          ["Consistency over availability", "Availability over consistency", "Neither: it is a bug"],
          "Refusing to answer means it is never wrong, but it is not available while cut off.",
        ),
      ),
      st(
        "Two rules to remember",
        "A history of reads and a write is linearizable only if <b>one flip moment</b> explains every read. A distributed commit is all or nothing only if <b>every participant votes yes</b> first.",
        F.compare(
          { title: "Timelines", c: "blue", body: "0-reads start before the flip, 1-reads end after it" },
          { title: "Transactions", c: "teal", body: "any no or missing reply means abort for everyone" },
        ),
        mc(
          "Two databases vote yes and the third never replies. What does a two-phase commit coordinator do?",
          ["Abort on all three databases", "Commit on the two that voted yes", "Wait forever and commit later"],
          "Commit needs every participant to vote yes. A missing reply is treated like a no, so everything aborts.",
        ),
      ),
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
