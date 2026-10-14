/* Data Science (COM3021), Lecture 6, part 3: ds6-cap (6.4, linearizability in practice) and ds6-consensus (6.5, two-phase commit). */
(function () {
  const S = NIC.shared.dsL6;
  const { reg, mc, pr, st, chip, reps, net, log, seg, svg, tx } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ============ 6.4 Linearizability: where it matters, and what it costs ============ */
  reg({
    id: "ds6-cap",
    order: 4,
    num: "6.4",
    title: "Linearizability: where and at what cost",
    blurb: "Seats, IDs and leaders need one copy of the truth. Pay for it in availability and in response time.",
    render(root) {
      root.appendChild(header(this, ""));
      const NM = { London: "Mia", Leeds: "Omar" };
      let mode = "lin",
        up = true,
        d = 30,
        seat = { London: "", Leeds: "" },
        down = 0,
        ms = "-",
        lines = [["", "Seat 14C is free. Mia books at London and Omar at Leeds."]];
      const card =
        el(`<div class="card"><div class="card-head"><h2>Booking desk: seat 14C</h2><span class="tag">two sites, one seat</span></div>
        <div class="controls" id="m4"></div><div class="controls" id="n4"></div><div class="controls" id="d4"></div><div id="cl"></div>
        <div class="controls"><button class="btn primary" id="b1">Book 14C at London</button><button class="btn primary" id="b2">Book 14C at Leeds</button><button class="btn" id="dv">Deliver updates</button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="stat-row"><div class="stat rose"><small>Double bookings</small><b></b></div><div class="stat amber"><small>Refused (link cut)</small><b></b></div><div class="stat blue"><small>Last response time</small><b></b></div></div>
        <div id="lg"></div></div>`);
      root.appendChild(card);
      const say = (c, t) => (lines = [[c, t]]);
      const dbl = () => !!(seat.London && seat.Leeds && seat.London !== seat.Leeds);
      function draw() {
        const site = (s) => ({
          name: s,
          sub: "seat 14C",
          val: seat[s] || "free",
          cls: dbl() ? "bad" : seat[s] ? "fresh" : "",
          tag: seat[s] ? chip(`booked by ${seat[s]}`, dbl() ? "bad" : "new") : "",
        });
        qs("#cl", card).innerHTML = net(up) + reps([site("London"), site("Leeds")]);
        card.querySelectorAll(".stat b").forEach((x, i) => (x.textContent = [dbl() ? 1 : 0, down, ms][i]));
        qs("#dv", card).disabled = mode === "lin";
        log(qs("#lg", card), lines);
      }
      const reset = (m) => {
        seat = { London: "", Leeds: "" };
        down = 0;
        ms = "-";
        say("", m);
        draw();
      };
      seg(qs("#m4", card), "lin:Linearizable|ev:Eventually consistent", "lin", (v) => {
        mode = v;
        reset(
          v === "lin"
            ? "Every booking is checked against the other site first."
            : "Each site decides alone and tells the other later.",
        );
      });
      seg(qs("#n4", card), "up:Link up|cut:Link cut", "up", (v) => {
        up = v === "up";
        say(
          up ? "ok" : "no",
          up ? "The link between London and Leeds is back." : "The link between London and Leeds is cut.",
        );
        draw();
      });
      const sl = N.slider("One-way network delay", 10, 100, 10, d, (v) => `${v} ms`);
      sl.onInput((v) => (d = v));
      qs("#d4", card).appendChild(sl);
      const book = (s, o) => () => {
        const who = NM[s];
        if (mode === "ev") {
          ms = "2 ms";
          if (seat[s]) say("old", `${s} already shows 14C as booked by ${seat[s]}.`);
          else {
            seat[s] = who;
            say("ok", `${s} accepts ${who} at once. ${o} has not been told yet.`);
          }
        } else if (!up) {
          down++;
          say("no", `${s} cannot reach ${o} to check, so it refuses ${who}: <b>unavailable</b>.`);
        } else if (seat.London || seat.Leeds) {
          ms = `${2 * d + 2} ms`;
          say(
            "old",
            `${s} asks ${o} first and finds 14C taken by ${seat.London || seat.Leeds}: ${who} is refused, correctly.`,
          );
        } else {
          seat.London = seat.Leeds = who;
          ms = `${2 * d + 2} ms`;
          say("ok", `${s} asks ${o}, both agree, and 14C is booked for ${who}. It took a round trip.`);
        }
        draw();
      };
      qs("#b1", card).onclick = book("London", "Leeds");
      qs("#b2", card).onclick = book("Leeds", "London");
      qs("#dv", card).onclick = () => {
        if (!up) say("no", "Updates cannot cross the cut link.");
        else if (dbl()) say("no", "Both sites meet: Mia and Omar each hold 14C. The seat was <b>sold twice</b>.");
        else {
          seat.London = seat.Leeds = seat.London || seat.Leeds;
          say("ok", "Updates delivered: both sites agree.");
        }
        draw();
      };
      qs("#rs", card).onclick = () => reset("Seat 14C is free again.");
      draw();
      root.appendChild(
        pr(
          "ds6-cap-1",
          "<b>Eventually consistent</b>, <b>Link up</b>. You press <b>Book 14C at London</b> and then <b>Book 14C at Leeds</b>, without pressing <b>Deliver updates</b>. What do the two sites show?",
          [
            "Mia at London, Omar at Leeds: seat promised twice",
            "Mia at both sites, as the link is up and it replicates",
            "Omar is refused at Leeds, since Mia booked first",
          ],
          "In this mode each site decides alone and replicates later. Neither has heard of the other booking, so both accept. Delivering the updates then reveals the clash.",
        ),
      );
      root.appendChild(
        pr(
          "ds6-cap-2",
          "<b>Linearizable</b>, <b>Link up</b>, delay slider at <b>40 ms</b>. You press <b>Book 14C at London</b>. About how long does the response take?",
          [
            "About 80 ms: a round trip to the other site",
            "About 40 ms: a single trip",
            "About 2 ms: London decides alone",
          ],
          "Linearizability needs the other site's answer before replying: there and back, 2 x 40 = 80 ms, plus the small local work. The eventually consistent mode answers in about 2 ms.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Linearizability is crucial for <b>single-leader</b> replication (exactly one leader), for <b>uniqueness</b> (no two entries with the same ID) and for constraints like <b>no two passengers on the same seat</b>.",
            "If an application needs it and replicas are disconnected, they <b>cannot process requests</b>: availability is sacrificed. Applications that do not need it tolerate network problems better.",
            "It has a performance cost: response time is at least proportional to the <b>uncertainty of network delays</b>, so many databases skip it.",
          ],
          "One copy of the truth costs waiting. Pay only where wrong answers are worse than slow ones.",
        ),
      );
    },
  });

  /* ---------- two-phase commit helpers (shared with the workshop, the boss and the bank) ---------- */
  const DB = ["Orders DB", "Stock DB", "Payments DB"];
  /** Run a three-database transaction. votes: "yes" | "no" | "crash" each. mode: "naive" | "2pc". */
  function run2pc(votes, mode) {
    const log = [];
    let out;
    if (mode === "naive") {
      log.push(["", "The coordinator sends <b>commit</b> to every database and does not wait for answers."]);
      out = votes.map((v, i) => {
        const o = v === "yes" ? "committed" : v === "no" ? "rejected" : "never got it";
        log.push([
          v === "yes" ? "ok" : "no",
          `${DB[i]}: ${v === "yes" ? "commits." : v === "no" ? "finds a conflict and refuses to commit." : "is down and never receives the request."}`,
        ]);
        return o;
      });
    } else {
      log.push(["", "<b>Phase 1.</b> The coordinator sends <b>prepare</b> to every database."]);
      votes.forEach((v, i) =>
        log.push([
          v === "yes" ? "ok" : "no",
          `${DB[i]}: ${v === "yes" ? "votes <b>yes</b> and locks its data." : v === "no" ? "votes <b>no</b>." : "never replies (crashed)."}`,
        ]),
      );
      const all = votes.every((v) => v === "yes");
      log.push([
        all ? "ok" : "no",
        `<b>Phase 2.</b> ${all ? "Every vote was yes: the coordinator sends <b>commit</b> to all." : "A vote was missing or no: the coordinator sends <b>abort</b> to all."}`,
      ]);
      out = votes.map(() => (all ? "committed" : "aborted"));
    }
    const done = out.filter((o) => o === "committed").length;
    return { out, log, same: done === 0 || done === out.length };
  }
  /** Two-phase commit as a sequence diagram. `no` = index (0 or 1) of the database that votes no, -1 for none. */
  function seq(no = -1) {
    const C = [70, 220, 370],
      go = (x1, x2, y, t, c) => {
        const col = c === "faint" ? "var(--text-faint)" : `var(--${c})`,
          ink = c === "faint" ? "var(--text-faint)" : `var(--${c}-ink)`;
        return `<path d="M${x1} ${y}H${x2}" stroke="${col}" stroke-width="2"/><path d="M${x2} ${y}l${x2 > x1 ? "-7 -4v8z" : "7 -4v8z"}" fill="${col}"/>${tx(x1 + (x2 - x1) * (Math.abs(x2 - x1) > 200 ? 0.75 : 0.5), y - 4, t, { s: 11, c: ink })}`;
      };
    const d = no < 0 ? "commit" : "abort",
      dc = no < 0 ? "teal" : "rose";
    const lock = [0, 1]
      .filter((i) => i !== no)
      .map((i) => `<rect x="${C[i + 1] - 5}" y="100" width="10" height="106" rx="3" fill="var(--line-2)"/>`)
      .join("");
    const lines = C.map(
      (x) => `<line x1="${x}" x2="${x}" y1="34" y2="222" stroke="var(--line-2)" stroke-dasharray="4 5"/>`,
    ).join("");
    const heads = ["Coordinator", "Database 1", "Database 2"].map((n, i) => tx(C[i], 22, n)).join("");
    const m = [
      go(C[0], C[1], 56, "prepare", "blue"),
      go(C[0], C[2], 74, "prepare", "blue"),
      go(C[1], C[0], 108, "yes", "teal"),
      go(C[2], C[0], 126, no === 1 ? "no" : "yes", no === 1 ? "rose" : "teal"),
    ];
    if (no === 0) m[2] = go(C[1], C[0], 108, "no", "rose");
    m.push(
      go(C[0], C[1], 156, d, dc),
      go(C[0], C[2], 174, d, dc),
      go(C[1], C[0], 192, "ok", "faint"),
      go(C[2], C[0], 208, "ok", "faint"),
    );
    return svg(
      470,
      236,
      `${lines}${lock}<g class="fi">${m.join("")}</g>${tx(440, 92, "phase 1", { s: 11 })}${tx(440, 150, "phase 2", { s: 11 })}${tx(150, 232, "grey bar = locks held by the transaction", { s: 11, c: "var(--text-faint)" })}${heads}`,
      `Two-phase commit: the coordinator sends prepare to both databases, ${no < 0 ? "both reply yes and it sends commit" : "one replies no and it sends abort"}, and they acknowledge. Locks are held between prepare and the decision.`,
    );
  }
  Object.assign(S, { DB, run2pc, seq });

  /** Step-through: a purchase touches three databases and one of them votes no. */
  function tpcRun(box, life) {
    F.run(box, life, {
      code: [
        "the transaction is ready to commit",
        "coordinator sends prepare to every database",
        "each database votes yes or no, and locks its data",
        "all yes: send commit. Any no: send abort",
        "each database applies the decision and unlocks",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const f = (x) => ({ v: ["-", "-", "-"], lock: [0, 0, 0], ...x });
        yield f({
          cap: "A purchase touches <b>three databases</b>. Each has the data written but nothing is committed yet.",
          line: 0,
        });
        yield f({
          v: ["?", "?", "?"],
          cap: "<b>Phase 1.</b> The coordinator sends <b>prepare</b> to all three.",
          line: 1,
        });
        yield f({
          v: ["yes", "?", "?"],
          lock: [1, 0, 0],
          cap: "<b>Orders DB</b> votes <b>yes</b> and locks the rows.",
          line: 2,
        });
        yield f({ v: ["yes", "yes", "?"], lock: [1, 1, 0], cap: "<b>Stock DB</b> votes <b>yes</b> too.", line: 2 });
        yield f({
          v: ["yes", "yes", "no"],
          lock: [1, 1, 0],
          cap: "<b>Payments DB</b> votes <b>no</b>: the payment would break one of its rules.",
          line: 2,
        });
        yield f({
          v: ["abort", "abort", "abort"],
          lock: [1, 1, 0],
          cap: "<b>Phase 2.</b> One no is enough: the coordinator sends <b>abort</b> to everyone.",
          line: 3,
          ask: {
            q: "Votes are in: yes, yes and no. Tap the database whose vote decides the outcome.",
            pick: ".ds6-node",
            a: ["Payments DB"],
            why: "A single no forces an abort. The two yes votes cannot override it.",
          },
        });
        yield f({
          v: ["abort", "abort", "abort"],
          cap: "All three <b>aborted</b> and released their locks. Nobody committed, so the databases still agree.",
          line: 4,
        });
      },
      draw(r, fr) {
        r.innerHTML = reps(
          DB.map((n, i) => ({
            name: n,
            val: fr.v[i],
            cls: fr.v[i] === "no" ? "bad" : fr.v[i] === "abort" ? "stale" : fr.v[i] === "yes" ? "fresh" : "",
            tag: fr.lock[i] ? chip("locked", "old") : "",
          })),
        );
      },
    });
  }

  /** The three-database transaction panel (used by the lesson demo and the workshop). onRun(res, mode, votes) follows each run. */
  function tpcPanel(box, onRun = () => {}) {
    let mode = "naive",
      res = null;
    const votes = ["yes", "yes", "yes"];
    box.innerHTML = `<div class="controls" data-m></div><div data-votes></div><div class="controls"><button class="btn primary" data-go>Run the transaction</button></div><div data-cl></div><div class="stat-row"><div class="stat"><small>Outcome</small><b>-</b></div></div><div data-lg></div>`;
    const $ = (q) => qs(q, box);
    function draw() {
      $("[data-cl]").innerHTML = res
        ? reps(
            DB.map((n, i) => ({
              name: n,
              val: res.out[i],
              cls: res.out[i] === "committed" ? "fresh" : res.out[i] === "aborted" ? "stale" : "bad",
            })),
          )
        : "";
      const b = $(".stat b");
      b.textContent = res ? (res.same ? "All or nothing" : "INCONSISTENT") : "-";
      b.style.color = !res ? "" : res.same ? "var(--teal-ink)" : "var(--rose-ink)";
      log($("[data-lg]"), res ? res.log : [["", "Choose how each database will behave, then run the transaction."]]);
    }
    seg($("[data-m]"), "naive:Commit everywhere|2pc:Two-phase commit", "naive", (v) => {
      mode = v;
      res = null;
      draw();
    });
    DB.forEach((n, i) => {
      const row = el(`<div class="controls"><b style="min-width:110px">${n}</b></div>`);
      seg(row, "yes:Yes|no:No|crash:Crashed", "yes", (v) => {
        votes[i] = v;
        res = null;
        draw();
      });
      $("[data-votes]").appendChild(row);
    });
    $("[data-go]").onclick = () => {
      res = run2pc(votes, mode);
      draw();
      onRun(res, mode, votes);
    };
    draw();
  }
  Object.assign(S, { tpcPanel });

  /* ============ 6.5 Consensus and two-phase commit ============ */
  reg({
    id: "ds6-consensus",
    order: 5,
    num: "6.5",
    title: "Consensus and two-phase commit",
    blurb: "Getting nodes to agree: why committing everywhere fails, and how a coordinator makes it all-or-nothing.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Buy a ticket across three databases</h2><span class="tag">one transaction, three nodes</span></div><div></div></div>`,
      );
      root.appendChild(card);
      tpcPanel(card.lastElementChild);
      root.appendChild(
        pr(
          "ds6-consensus-1",
          "<b>Commit everywhere</b> mode. <b>Orders DB</b> and <b>Stock DB</b> are set to <b>Yes</b>, <b>Payments DB</b> to <b>No</b>. You press <b>Run the transaction</b>. What is the outcome?",
          [
            "Two commit and Payments does not: half-done",
            "All three databases roll back and stay in sync",
            "All three commit, since two of three said yes",
          ],
          "Each database acts alone. Two commit and the third refuses, so the purchase exists in two databases and not in the third. Nothing coordinated the decision.",
        ),
      );
      root.appendChild(
        pr(
          "ds6-consensus-2",
          "<b>Two-phase commit</b> mode, <b>Stock DB</b> set to <b>Crashed</b>, the others to <b>Yes</b>. You press <b>Run the transaction</b>. What happens?",
          [
            "Everything aborts: the coordinator never gets a yes from Stock",
            "Orders and Payments commit and Stock catches up later",
            "The coordinator commits, since most votes were yes",
          ],
          "Commit needs every participant to vote yes. A missing reply counts as no, so the coordinator sends abort to all and the databases stay in agreement.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Consensus</b> means getting several nodes to agree: for example <b>leader election</b> (who leads after a failure?) and <b>atomic commit</b> (everyone commits or everyone aborts).",
            "Sending commit to every node and letting each decide fails: a node may find a conflict, a request may be lost, a node may crash.",
            "<b>Two-phase commit</b>: a <b>coordinator</b> sends <b>prepare</b>. If all reply yes it sends <b>commit</b>, if any says no it sends <b>abort</b> to all.",
          ],
          "Ask first, decide once, tell everyone: that is how many nodes behave like one.",
        ),
      );
    },
  });

  L["ds6-consensus"] = {
    sum: "<b>Consensus</b> gets nodes to agree. <b>Two-phase commit</b> uses a coordinator to make a transaction commit on every node or on none.",
    steps: [
      st(
        "Getting nodes to agree",
        "<b>Consensus</b> means getting several nodes to <b>agree</b> on something. The lecture's two main cases are <b>leader election</b> and <b>atomic commit</b>.",
        F.cells(
          [
            { v: "leader election", sub: "who leads now?", c: "blue" },
            { v: "atomic commit", sub: "commit or abort?", c: "violet" },
          ],
          { size: 150 },
        ),
      ),
      st(
        "Leader election",
        "In a single-leader architecture, if the leader fails, <b>who is the new leader</b>? Every node must agree on <b>one</b> answer, or two nodes will both act as leader.",
        reps([
          { name: "Node A", val: "crashed", cls: "cut", tag: chip("old leader", "bad") },
          { name: "Node B", val: "leader", cls: "lead", tag: chip("elected", "new") },
          { name: "Node C", val: "follower", cls: "fresh" },
        ]),
        mc(
          "The leader crashes, then nodes B and C each declare themselves the new leader and neither backs down. What is missing?",
          [
            "Consensus on a single new leader",
            "A faster network between B and C",
            "A second copy of the data on node A",
          ],
          "Leader election is a consensus problem: all live nodes must agree on exactly one leader.",
        ),
      ),
      st(
        "Atomic commit",
        "A transaction may <b>fail on some nodes but succeed on others</b>, yet all nodes have to agree on the outcome. On a single-node database atomicity is easy. When several nodes are involved (for example a partitioned database) it is not.",
        F.compare(
          { title: "One node", c: "teal", body: "one place decides: commit or roll back" },
          { title: "Many nodes", c: "rose", body: "each node may say something different" },
        ),
      ),
      st(
        "Commit everywhere fails",
        "It is <b>not sufficient</b> to send commit to all nodes and let each commit independently. A node may detect a <b>constraint violation or conflict</b>, a commit request may be <b>lost</b>, or a node may <b>crash</b>. Then some commit and others do not.",
        reps([
          { name: "Orders DB", val: "committed", cls: "fresh" },
          { name: "Stock DB", val: "conflict", cls: "bad" },
          { name: "Payments DB", val: "lost msg", cls: "stale" },
        ]),
        {
          type: "multi",
          q: "Which problems can leave a send-commit-to-all transaction half done?",
          o: [
            "One node detects a constraint violation",
            "A commit request is lost in the network",
            "One node crashes before committing",
            "Every node votes yes and stays up",
          ],
          a: [0, 1, 2],
          why: "A conflict, a lost message or a crash each stop one node committing while others do. If everything works, there is no problem to solve.",
        },
      ),
      st(
        "Two-phase commit",
        "<b>Two-phase commit (2PC)</b> splits commit into two phases and adds a <b>coordinator</b> (or transaction manager). When the application is ready to commit, the coordinator sends a <b>prepare</b> request to each node. If all reply <b>yes</b>, it sends a <b>commit</b>.",
        seq(),
        {
          type: "order",
          q: "Put the steps of a successful two-phase commit in order.",
          items: [
            "The coordinator sends prepare to each node",
            "Every node replies yes",
            "The coordinator sends commit to each node",
            "Every node commits and confirms",
          ],
          why: "Phase 1 is prepare and the votes. Phase 2 is the commit decision and its acknowledgement.",
        },
      ),
      st("Watch it run", "Press play or step with the arrows. One database will vote no.", (box, life) =>
        tpcRun(box, life),
      ),
      st(
        "Any no means abort",
        "If <b>any</b> participant replies <b>no</b>, the coordinator sends an <b>abort</b> request to <b>all</b> nodes. The grey bars show that a node which voted yes holds its <b>locks</b> until the decision arrives, because it can no longer decide on its own.",
        seq(1),
        mc(
          "Three of four databases vote yes and the fourth votes no. What does the coordinator send?",
          ["Abort to all four", "Commit to the three that said yes", "Commit to all four, since most said yes"],
          "2PC is all or nothing: a single no aborts the transaction on every node, including the ones that said yes.",
        ),
      ),
    ],
    guide: [
      "In <b>Commit everywhere</b> mode set one database to <b>No</b> or <b>Crashed</b> and press <b>Run the transaction</b>.",
      "Switch to <b>Two-phase commit</b>, keep the same votes and run it again.",
      "Answer the questions after the demo.",
    ],
  };
})();
