/* Data Science (COM3021), Lecture 7, part 2: the Paxos sandbox panel, the step-through round and ds7-rounds (7.2, the two phases). */
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

  /* ============ 7.2 The two phases: prepare and accept ============ */
  reg({
    id: "ds7-rounds",
    order: 2,
    num: "7.2",
    title: "Prepare, promise, accept",
    blurb:
      "One Paxos round, message by message: PREPARE, PROMISE, ACCEPT, ACCEPTED, and what happens when proposers collide.",
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
          "ds7-rounds-1",
          "All three acceptors are up and <b>P1 (Noodles)</b> is selected. You press <b>Send PREPARE</b> and then <b>Send ACCEPT</b>. How many acceptors end up holding Noodles?",
          [
            "All 3: every acceptor promises and accepts",
            "2 of 3: only a quorum is told by the proposer",
            "1 of 3: only the first acceptor to reply to it",
          ],
          "The proposer sends its messages to every acceptor. All three are up, so all promise and all accept. Two would already be enough to choose the value.",
        ),
      );
      root.appendChild(
        pr(
          "ds7-rounds-2",
          "<b>Crash</b> acceptor C, then with <b>P1 (Noodles)</b> press <b>Send PREPARE</b> and <b>Send ACCEPT</b>. What does the demo report?",
          [
            "Noodles is chosen: A and B are a quorum of 2",
            "Nothing is chosen: all three acceptors must reply",
            "P1 cannot send ACCEPT because C's promise is missing",
          ],
          "A quorum is more than half of 3, which is 2. A and B promise and accept, so a majority holds Noodles even though C is crashed.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Phase 1:</b> the proposer sends <b>PREPARE(n)</b>; acceptors answer <b>PROMISE(n)</b> and ignore proposals numbered n or lower.",
            "<b>Phase 2:</b> once a quorum has promised, the proposer sends <b>ACCEPT(n, v)</b>; acceptors answer <b>ACCEPTED(n, v)</b>. Learners learn the value only after a majority has accepted it.",
            "A replicated log runs <b>one round per position</b>, each with a higher PREPARE number.",
            "Beyond the slides: a PROMISE reports any value already accepted, and the proposer must re-propose it.",
          ],
          "Ask for promises, then ask for acceptances: a majority at each step.",
        ),
      );
    },
  });

  L["ds7-rounds"] = {
    sum: "A Paxos round has two phases: <b>PREPARE and PROMISE</b>, then <b>ACCEPT and ACCEPTED</b>. Learners learn the value only after a majority accepted it.",
    steps: [
      st(
        "Phase 1: PREPARE",
        "A proposer starts a round by creating a <b>PREPARE</b> message with a number n. The number must be <b>unique</b> and <b>greater than any previous PREPARE</b> this proposer created. It sends it to the acceptors.",
        seqFig(1),
        mc(
          "What does a proposer send first in a round?",
          ["PREPARE with a new number", "ACCEPT carrying the value it wants", "PROMISE sent to every acceptor"],
          "A round opens with PREPARE(n). The value only travels later, in phase 2.",
        ),
      ),
      st(
        "Phase 1: PROMISE",
        "Each acceptor answers with a <b>PROMISE</b>: it will <b>ignore any proposals with an ID less than or equal to n</b>. That is how a newer proposal supersedes older ones.",
        seqFig(2),
        mc(
          "An acceptor has promised number 5. A PREPARE numbered 3 arrives from another proposer. What does it do?",
          [
            "Ignores it: 3 is not above its promise of 5",
            "Promises 3 as well, since it is a new proposer",
            "Replies and cancels its promise to 5",
          ],
          "A promise to 5 means ignoring proposals numbered 5 or lower. Only a higher number can get a new PROMISE.",
        ),
      ),
      st(
        "Phase 2: ACCEPT",
        "If the proposer receives a <b>PROMISE from a majority</b> (a quorum), it sends the acceptors an <b>ACCEPT(n, v)</b> message with its number and a value v. (An acceptor still accepts the ACCEPT numbered n that follows its own PROMISE(n).)",
        seqFig(3),
        mc(
          "Five acceptors, and a proposer holds PROMISE from only two of them. What must it do?",
          [
            "Wait for a third promise",
            "Send ACCEPT now, as two is nearly half",
            "Send ACCEPT to the two that promised only",
          ],
          "A quorum of 5 is 3. With two promises the proposer is one short, so it cannot go on to phase 2.",
        ),
      ),
      st(
        "ACCEPTED and the learners",
        "An acceptor that accepts replies <b>ACCEPTED(n, v)</b>. The <b>learners</b> learn the decided value only after receiving <b>ACCEPTED from a majority</b> of the acceptors.",
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
      st(
        "A log, one round per entry",
        "In the lecture's example three replicas keep a <b>log</b>, starting from a balance of £100. A first proposer runs a round for <b>+£50</b> (PREPARE 1). Learners learn it after ACCEPTED from a majority, and every replica appends it. A second round, <b>PREPARE 2</b>, settles <b>−£20</b> at the next position. The balance is 100 + 50 − 20 = 130.",
        logFig,
        mc(
          "Replicas hold a log whose last entry is 'add milk'. A client wants 'add eggs'. What does Paxos run?",
          [
            "A new round for the next position with a higher number",
            "Another round for the same position with the same number",
            "No round: replicas append the entry and sync it later",
          ],
          "Each log position is settled by its own round. A new proposal uses a number above the earlier ones.",
        ),
      ),
      st(
        "Beyond the slides: PROMISE reports a value",
        "<b>Not on the slides</b>, but it keeps the protocol safe: a PROMISE also reports any value that acceptor <b>has already accepted</b>, with its number. If a promise reports one, the proposer must <b>re-propose the value with the highest number</b> instead of its own, so a value that may already be chosen is never overwritten.",
        forcedFig,
        mc(
          "PROMISEs for PREPARE(4) report 'Tacos' accepted at number 2 and 'Noodles' accepted at number 3. The proposer wanted Burritos. What does it send?",
          ["ACCEPT(4, Noodles)", "ACCEPT(4, Burritos)", "ACCEPT(4, Tacos)"],
          "It must re-propose the reported value with the highest number. Noodles (3) beats Tacos (2), and its own Burritos is dropped.",
        ),
      ),
      st(
        "Two proposers collide",
        "Two proposers can start together. Acceptors that have promised a higher number <b>ignore</b> the older proposal: once PREPARE 2 has promises, the first proposer's <b>ACCEPT(1, v)</b> is ignored. It can retry with a higher number.",
        duelFig,
        {
          type: "multi",
          q: "An acceptor has promised number 5. Which messages does it ignore?",
          o: ["PREPARE(3)", "PREPARE(5)", "ACCEPT(3, v)", "PREPARE(6)", "ACCEPT(5, v)"],
          a: [0, 1, 2],
          why: "It ignores PREPARE messages numbered 5 or lower and ACCEPTs below 5. PREPARE(6) earns a new promise and ACCEPT(5, v) follows its own PROMISE(5).",
        },
      ),
    ],
    guide: [
      "Press <b>Send PREPARE</b>, then <b>Send ACCEPT</b>, and watch the acceptors fill in.",
      "Tap <b>Crash</b> on an acceptor and run another round. Then <b>Next log position</b> starts a fresh one.",
      "Switch between <b>P1 (Noodles)</b> and <b>P2 (Tacos)</b> to make proposers collide, then answer the questions after the demo.",
    ],
  };
})();
