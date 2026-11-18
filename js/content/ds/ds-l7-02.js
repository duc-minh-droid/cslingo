/* Data Science (COM3021), Lecture 7, part 2: the Paxos sandbox panel, the step-through round, ds7-rounds (7.3, phase 1) and ds7-accept (7.4, phase 2). */
(function () {
  const S = NIC.shared.dsL7;
  const { reg, mc, pr, st, seg, log, svg, tx, grid, makeSim } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /** The sandbox shared by the lesson demo and the workshop: n acceptors, proposers [{name, own}], onEvent(sim, last) after each action. */
  function paxosPanel(box, { n = 3, props, onEvent = () => {} }) {
    const sim = makeSim(n, props);
    let sel = 0,
      say = [["", `${n} acceptors, so a quorum is ${sim.q}. Choose a proposer, then press <b>Send PREPARE</b>.`]];
    box.innerHTML = `<div class="controls" data-pp></div><div data-g></div><div data-s></div>
      <div class="controls"><button class="btn primary" data-pre>Send PREPARE</button><button class="btn primary" data-acc>Send ACCEPT</button><button class="btn" data-nx>Next log position</button><button class="btn ghost" data-rs>Reset</button></div>
      <div class="stat-row"><div class="stat blue"><small>Quorum</small><b></b></div><div class="stat teal"><small>Chosen</small><b></b></div><div class="stat amber"><small>Log entries</small><b></b></div></div><div data-l></div>`;
    const $ = (s) => qs(s, box);
    const fire = (r) => {
      draw();
      onEvent(sim, r);
    };
    function draw() {
      const ch = sim.chosen;
      $("[data-g]").innerHTML = `<div class="ds7-grid">${sim.acc
        .map(
          (a, i) =>
            `<div class="ds7-node ${!a.up ? "down" : ch && a.accN === ch.n && a.accV === ch.v ? "ok" : ""}" data-k="${a.id}"><h4>${a.id}<small>${a.up ? "up" : "crashed"}</small></h4><div class="ds7-ln">promised: ${a.prom || "-"}</div><div class="ds7-ln">accepted: ${a.accV ? `${a.accV} (${a.accN})` : "-"}</div><button class="btn small ghost" data-c="${i}" aria-label="${a.up ? "Crash" : "Restart"} acceptor ${a.id}">${a.up ? "Crash" : "Restart"}</button></div>`,
        )
        .join("")}</div>`;
      $("[data-g]")
        .querySelectorAll("[data-c]")
        .forEach((b) => {
          b.onclick = () => {
            const a = sim.acc[+b.dataset.c];
            sim.toggle(+b.dataset.c);
            say = [
              [
                a.up ? "ok" : "no",
                a.up
                  ? `${a.id} restarts. It still remembers what it promised and accepted.`
                  : `${a.id} crashes: it will not reply until it restarts.`,
              ],
            ];
            fire({ t: "crash" });
          };
        });
      $("[data-s]").innerHTML =
        sim.ps
          .map(
            (p, i) =>
              `<div class="ds7-strip ${i === sel && sim.ps.length > 1 ? "on" : ""}"><b>${p.name}</b> wants ${p.own}. Number: ${p.n || "none yet"}. Promises: ${p.prom.length} of ${sim.q}.${p.n ? (p.quorum ? ` Will propose <b>${p.val}</b>${p.forced ? ` (re-proposed: ${p.from} had already accepted it)` : ""}.` : " No quorum yet.") : ""}</div>`,
          )
          .join("") +
        `<div class="ds7-strip ${ch ? "ok" : ""}">${ch ? `Learners learn <b>${ch.v}</b>: a majority accepted it at number ${ch.n}.` : "Learners wait for ACCEPTED from a majority."} Log: ${sim.decided.length ? sim.decided.map((v, i) => `${i}: ${v}`).join(" · ") : "empty"}. Deciding position ${sim.slot}.</div>`;
      const b = box.querySelectorAll(".stat b");
      [`${sim.q} of ${n}`, ch ? ch.v : "-", sim.decided.length].forEach((v, i) => (b[i].textContent = v));
      $("[data-acc]").disabled = !sim.ps[sel].quorum;
      $("[data-nx]").disabled = !ch;
      log($("[data-l]"), say);
    }
    if (props.length > 1)
      seg($("[data-pp]"), props.map((p, i) => `${i}:${p.name} (${p.own})`).join("|"), "0", (v) => {
        sel = +v;
        say = [["", `${props[sel].name} is selected. Its next PREPARE will use a number no other proposer uses.`]];
        draw();
      });
    $("[data-pre]").onclick = () => {
      const r = sim.prepare(sel);
      say = r.lines;
      fire(r);
    };
    $("[data-acc]").onclick = () => {
      const r = sim.accept(sel);
      say = r.lines;
      fire(r);
    };
    $("[data-nx]").onclick = () => {
      sim.next();
      say = [
        [
          "ok",
          `Log position ${sim.slot - 1} is settled. A new round for position ${sim.slot} starts: the acceptors are empty, but proposal numbers keep growing.`,
        ],
      ];
      fire({ t: "next" });
    };
    $("[data-rs]").onclick = () => {
      sim.reset();
      sel = 0;
      say = [["", "Everything is reset: all acceptors up and empty, no proposal numbers used."]];
      fire({ t: "reset" });
    };
    draw();
    return sim;
  }
  Object.assign(S, { paxosPanel });

  /* ---------- figures: the message diagram, a replicated log, and two collisions ---------- */
  /** Paxos messages as a sequence diagram, showing the first `upto` of the four message groups. */
  function seqFig(upto) {
    const X = { P: 130, A: 240, B: 340, C: 440, L: 540 };
    const groups = [
      ["PREPARE(1)", "blue", "P", ["A", "B", "C"], 1],
      ["PROMISE(1)", "violet", ["A", "B", "C"], "P", 1],
      ["ACCEPT(1, v)", "amber", "P", ["A", "B", "C"], 1],
      ["ACCEPTED(1, v)", "teal", ["A", "B", "C"], "L", 1],
    ];
    const arrow = (x1, x2, y, c) =>
      `<path d="M${x1} ${y}H${x2}" stroke="var(--${c})" stroke-width="2"/><path d="M${x2} ${y}l${x2 > x1 ? "-7 -4v8z" : "7 -4v8z"}" fill="var(--${c})"/>`;
    const body = groups
      .slice(0, upto)
      .map(([t, c, from, to], g) => {
        const ends = Array.isArray(from) ? from.map((f) => [X[f], X[to]]) : to.map((x) => [X[from], X[x]]);
        return `<g class="fi">${tx(8, 74 + g * 66, t, { a: "start", s: 11.5, c: `var(--${c}-ink)` })}${ends.map(([x1, x2], k) => arrow(x1, x2, 70 + g * 66 + k * 17 + (g ? 0 : 0), c)).join("")}</g>`;
      })
      .join("");
    const heads = Object.entries({ P: "Proposer", A: "A", B: "B", C: "C", L: "Learners" })
      .map(
        ([k, t]) =>
          tx(X[k], 24, t, { s: 12.5 }) +
          `<line x1="${X[k]}" x2="${X[k]}" y1="32" y2="304" stroke="var(--line-2)" stroke-dasharray="4 5"/>`,
      )
      .join("");
    return svg(
      600,
      316,
      `<rect x="2" y="36" width="596" height="132" rx="8" fill="color-mix(in srgb,var(--blue) 7%,var(--panel))"/><rect x="2" y="170" width="596" height="132" rx="8" fill="color-mix(in srgb,var(--amber) 7%,var(--panel))"/>${tx(594, 52, "PHASE 1", { a: "end", s: 10.5, c: "var(--text-faint)" })}${tx(594, 186, "PHASE 2", { a: "end", s: 10.5, c: "var(--text-faint)" })}${heads}${body}`,
      `Paxos message diagram showing ${["PREPARE", "PREPARE and PROMISE", "PREPARE, PROMISE and ACCEPT", "PREPARE, PROMISE, ACCEPT and ACCEPTED"][upto - 1]} between a proposer, acceptors A, B and C and the learners`,
    );
  }
  const logFig = (() => {
    const cell = (x, y, t, c) =>
      `<rect x="${x - 40}" y="${y}" width="80" height="26" rx="7" fill="color-mix(in srgb,var(--${c}) 18%,var(--panel))" stroke="var(--${c})" stroke-width="2"/>${tx(x, y + 18, t, { s: 13 })}`;
    const cols = ["A", "B", "C"].map((id, i) => {
      const x = 170 + i * 150;
      return `<g class="fi">${cell(x, 20, "−£20", "amber")}${cell(x, 52, "+£50", "teal")}${cell(x, 84, "£100", "blue")}<circle cx="${x}" cy="138" r="20" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/>${tx(x, 143, id, { s: 14 })}${tx(x, 172, "balance £130", { s: 11.5, c: "var(--text-faint)" })}</g>`;
    });
    return svg(
      560,
      186,
      `${tx(6, 38, "position 2", { a: "start", s: 11, c: "var(--text-faint)" })}${tx(6, 70, "position 1", { a: "start", s: 11, c: "var(--text-faint)" })}${tx(6, 102, "position 0", { a: "start", s: 11, c: "var(--text-faint)" })}${cols.join("")}`,
      "Three replicas A, B and C each hold the same log: 100, then +50, then -20, giving a balance of 130",
    );
  })();
  const forcedFig =
    grid(
      [
        { name: "A", sub: "PROMISE(2)", lines: ["accepted: Noodles (1)"], cls: "m1" },
        { name: "B", sub: "PROMISE(2)", lines: ["accepted: Noodles (1)"], cls: "m1" },
        { name: "C", sub: "PROMISE(2)", lines: ["accepted: -"] },
      ],
      "c3",
    ) +
    `<div class="ds7-strip on"><b>P2</b> wants Tacos, but A and B report Noodles (1). P2 must send <b>ACCEPT(2, Noodles)</b>.</div>`;
  const duelFig =
    grid(
      ["A", "B", "C"].map((name) => ({ name, sub: "promised 2", lines: ["ACCEPT(1, Tea): ignored"], cls: "bad" })),
      "c3",
    ) +
    `<div class="ds7-strip"><b>P1</b> won promises for 1. Then <b>P2</b>'s PREPARE(2) won promises too, so P1's late ACCEPT(1, Tea) is ignored.</div>`;

  /** Step-through of one round: three acceptors, C has crashed, a quorum is 2. Every number comes from the simulation. */
  function roundRun(box, life) {
    const sim = makeSim(3, [{ name: "P1", own: "Noodles" }]);
    sim.acc[2].up = false;
    const pre = sim.prepare(0),
      acc = sim.accept(0),
      [pa, pb] = pre.got,
      [aa, ab] = acc.ok,
      v = acc.v;
    F.run(box, life, {
      code: [
        "a proposer wants a value chosen",
        "send PREPARE(n) to the acceptors",
        "each acceptor replies PROMISE(n)",
        "with a quorum of promises: send ACCEPT(n, v)",
        "each acceptor replies ACCEPTED(n, v)",
        "a majority accepted: the value is chosen",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const f = (x) => ({ pr: 0, ac: 0, sent: 0, learn: 0, ...x });
        yield f({
          cap: `P1 wants <b>${v}</b> chosen. With ${sim.n} acceptors a quorum is <b>${sim.q}</b>. Acceptor C has crashed.`,
          line: 0,
        });
        yield f({
          sent: 1,
          cap: `<b>Phase 1.</b> P1 sends PREPARE(${pre.n}) to the acceptors.`,
          line: 1,
        });
        yield f({ sent: 1, pr: 1, cap: `${pa} replies PROMISE(${pre.n}): 1 of ${sim.q} promises.`, line: 2 });
        yield f({
          sent: 1,
          pr: 2,
          cap: `${pb} replies PROMISE(${pre.n}): ${pre.got.length} of ${sim.q}, a <b>quorum</b>. C never answers.`,
          line: 2,
          ask: {
            q: `${pa} has promised and C is crashed. Tap the acceptor whose PROMISE completes the quorum of ${sim.q}.`,
            pick: ".ds7-node",
            a: [pb],
            why: `${pa} and ${pb} make ${sim.q} of ${sim.n}: a majority. C is down, so ${pb} is the one that completes it.`,
          },
        });
        yield f({
          sent: 2,
          pr: 2,
          cap: `<b>Phase 2.</b> With a quorum, P1 sends ACCEPT(${acc.n}, ${v}).`,
          line: 3,
        });
        yield f({ sent: 2, pr: 2, ac: 1, cap: `${aa} accepts and replies ACCEPTED(${acc.n}, ${v}).`, line: 4 });
        yield f({
          sent: 2,
          pr: 2,
          ac: 2,
          cap: `${ab} accepts too: ${acc.hold} of ${sim.n}, a majority.`,
          line: 4,
        });
        yield f({
          sent: 2,
          pr: 2,
          ac: 2,
          learn: 1,
          cap: `<b>${v}</b> is chosen, and the learners learn it. C is still crashed, yet a majority holds the value.`,
          line: 5,
        });
      },
      draw(r, fr) {
        r.innerHTML =
          grid(
            sim.acc.map((a) => {
              const pi = pre.got.indexOf(a.id),
                ai = acc.ok.indexOf(a.id),
                ok = ai >= 0 && ai < fr.ac;
              return {
                name: a.id,
                sub: a.up ? "up" : "crashed",
                cls: !a.up ? "down" : ok ? "ok" : pi >= 0 && pi < fr.pr ? "m1" : "",
                lines: [
                  `promised: ${pi >= 0 && pi < fr.pr ? pre.n : "-"}`,
                  `accepted: ${ok ? `${v} (${acc.n})` : "-"}`,
                ],
              };
            }),
            "c3",
          ) +
          `<div class="ds7-strip on"><b>P1</b> wants ${v}. ${["Idle.", `Sent PREPARE(${pre.n}).`, `Sent ACCEPT(${acc.n}, ${v}).`][fr.sent]}</div><div class="ds7-strip ${fr.learn ? "ok" : ""}">${fr.learn ? `Learners learn <b>${v}</b>.` : "Learners wait for a majority of ACCEPTED."}</div>`;
      },
    });
  }

  Object.assign(S, { logFig, forcedFig });

  /* ============ 7.3 Phase 1: asking for promises ============ */
  reg({
    id: "ds7-rounds",
    order: 3,
    num: "7.3",
    title: "Phase 1: asking for promises",
    blurb: "Before it names a value, a proposer asks the acceptors to promise to listen.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Phase 1:</b> the proposer sends <b>PREPARE(n)</b> with a new, higher number.",
            "Acceptors answer <b>PROMISE(n)</b>: they will ignore proposals numbered n or lower.",
            "When two proposers collide, the higher number wins and the other retries with a bigger one.",
          ],
          "Ask for promises first: a majority must agree to listen.",
        ),
      );
    },
  });

  L["ds7-rounds"] = {
    sum: "Phase 1 of a Paxos round: the proposer sends <b>PREPARE(n)</b> and acceptors reply <b>PROMISE(n)</b>, promising to ignore older proposals.",
    steps: [
      st(
        "Raising your hand: PREPARE",
        "Picture raising your hand with your ticket before you speak: “Number 4 here, may I suggest something?” That is <b>PREPARE(n)</b>. A proposer starts a round by sending it to the acceptors, with a number n that is <b>unique</b> and <b>bigger than any PREPARE it sent before</b>. No value travels yet: phase 1 is only about numbers.",
        seqFig(1),
        mc(
          "What does a proposer send first in a round?",
          ["PREPARE with a new number", "ACCEPT carrying the value it wants", "PROMISE sent to every acceptor"],
          "A round opens with PREPARE(n). The value only travels later, in phase 2.",
        ),
      ),
      st(
        "The promise: PROMISE",
        "Each acceptor that agrees replies <b>PROMISE(n)</b>: “From now on I'll ignore any proposal numbered n or lower.” It's like a shop saying it now only serves ticket 4 and up. Because numbers only go up, this is how a <b>newer proposal supersedes older ones</b>. Once a <b>majority</b> has promised, phase 1 is done.",
        seqFig(2),
        mc(
          "An acceptor has already promised a number. A PREPARE with a smaller number turns up. What does the acceptor do?",
          ["Ignores it", "Promises the smaller number as well", "Cancels its first promise and starts over"],
          "A promise means ignoring proposals numbered at or below it. Only a higher number can win a new PROMISE.",
        ),
      ),
      st(
        "Two proposers at once",
        "Two friends can both say “I'll sort the order!” at the same moment. In Paxos, acceptors that have promised a <b>higher number ignore the older proposal</b>. So once PREPARE 2 has won promises, the first proposer's late <b>ACCEPT(1, v)</b> is simply ignored. No harm done: the loser <b>tries again with a higher number</b>.",
        duelFig,
      ),
    ],
  };

  /* ============ 7.4 Phase 2: getting the value accepted ============ */
  reg({
    id: "ds7-accept",
    order: 4,
    num: "7.4",
    title: "Phase 2: making it official",
    blurb: "With promises in hand, the proposer names its value and a majority makes it official.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Run Paxos rounds</h2><span class="tag">3 acceptors, 2 proposers</span></div><div></div></div>`,
      );
      root.appendChild(card);
      paxosPanel(card.lastElementChild, {
        n: 3,
        props: [
          { name: "P1", own: "Noodles" },
          { name: "P2", own: "Tacos" },
        ],
      });
      root.appendChild(
        pr(
          "ds7-rounds-2",
          "You crashed acceptor C and still ran PREPARE and ACCEPT for <b>P1 (Noodles)</b>. What did the demo report?",
          [
            "Noodles was chosen: A and B are a majority",
            "Nothing was chosen: every acceptor must reply",
            "P1 could not send ACCEPT without C's promise",
          ],
          "A quorum is more than half of the three acceptors. A and B promise and accept, so a majority holds Noodles even though C is crashed.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Phase 2:</b> after a quorum of promises, the proposer sends <b>ACCEPT(n, v)</b>.",
            "Acceptors reply <b>ACCEPTED(n, v)</b>.",
            "Learners learn the value only after <b>ACCEPTED from a majority</b>.",
          ],
          "Promises first, then the value: a majority at each step.",
        ),
      );
    },
  });

  L["ds7-accept"] = {
    sum: "Phase 2 of a Paxos round: after a quorum of promises the proposer sends <b>ACCEPT(n, v)</b>, acceptors reply <b>ACCEPTED</b>, and learners learn the value from a majority.",
    steps: [
      st(
        "Now name the value: ACCEPT",
        "Once most of the room has promised to listen, you can finally speak. If the proposer receives <b>PROMISE from a majority</b> (a quorum), it sends <b>ACCEPT(n, v)</b>: its number n and the value v it wants. Without a quorum it may not go on. An acceptor accepts unless it has since promised a higher number.",
        seqFig(3),
        mc(
          "A proposer holds promises from fewer than half of the acceptors. What must it do?",
          ["Wait for more promises", "Send ACCEPT anyway to save time", "Send ACCEPT only to those that promised"],
          "ACCEPT may only go out after a quorum, more than half, has promised. Until then the proposer is stuck in phase 1.",
        ),
      ),
      st(
        "ACCEPTED and the learners",
        "Think of a waiter who only sends the order to the kitchen once most of the table has confirmed it. Each acceptor that accepts replies <b>ACCEPTED(n, v)</b>. The <b>learners</b> learn the decided value only after receiving <b>ACCEPTED from a majority</b> of the acceptors. A few acceptors that never heard a thing don't change that.",
        seqFig(4),
        {
          type: "order",
          q: "Put the four messages of one Paxos round in order.",
          items: ["PREPARE(n)", "PROMISE(n)", "ACCEPT(n, v)", "ACCEPTED(n, v)"],
          why: "Phase 1 is PREPARE then PROMISE. Phase 2 is ACCEPT then ACCEPTED.",
        },
      ),
      st(
        "Watch it run",
        "Press play or step with the arrows. One acceptor has crashed, and the round still succeeds.",
        (box, life) => roundRun(box, life),
      ),
    ],
    guide: [
      "Press <b>Send PREPARE</b>, then <b>Send ACCEPT</b>, and watch the acceptors fill in.",
      "Press <b>Reset</b>, tap <b>Crash</b> on acceptor C and run the round again.",
      "Switch to <b>P2 (Tacos)</b> and run a round too, then answer the question after the demo.",
    ],
  };
})();
