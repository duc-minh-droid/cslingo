/* Data Science (COM3021), Lecture 6, part 2: the steps of ds6-acid (6.2), the timeline helpers and ds6-linear (6.3). */
(function () {
  const S = NIC.shared.dsL6;
  const { reg, mc, pr, st, chip, reps, svg, tx, lin } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  const rows = (...c) => `<div class="ds6-chips">${c.join("")}</div>`;
  L["ds6-acid"] = {
    sum: "<b>ACID</b> describes what a transaction guarantees. Replicated databases usually offer only <b>eventual consistency</b>: all nodes converge, but reads in between may be out of date.",
    steps: [
      st(
        "Transactions group statements",
        "Moving £30 from Asha to Ben is two writes: a debit and a credit. A <b>transaction</b> treats them as a single unit, and its guarantees are known as <b>ACID</b>.",
        F.flow([
          { t: "Debit Asha", s: "100 to 70", c: "rose" },
          { t: "Credit Ben", s: "50 to 80", c: "teal" },
          { t: "Commit", s: "one unit", c: "blue" },
        ]),
      ),
      st(
        "Atomicity: all or nothing",
        "Each statement in a transaction (read, write, update or delete) is treated as <b>a single unit</b>. Either everything happens or none of it does. If the server crashes after the debit, the debit is <b>rolled back</b>.",
        F.compare(
          { title: "No transaction", c: "rose", body: "crash after the debit: Asha 70, Ben 50, total <b>120</b>" },
          {
            title: "Atomic",
            c: "teal",
            body: "crash after the debit: rolled back, Asha 100, Ben 50, total <b>150</b>",
          },
        ),
        mc(
          "A transaction has three statements and the third one fails. What does atomicity require?",
          [
            "None of the three leaves a trace",
            "The first two stay and the third is retried",
            "The first two stay until someone cleans up",
          ],
          "Atomic means all or nothing. A failure part-way through undoes the statements that already ran.",
        ),
      ),
      st(
        "Consistency: obey the rules",
        "Transactions only change tables in <b>predefined, predictable ways</b>. The database has rules (the total stays £150, no balance goes below zero) and a transaction may not leave the data breaking them.",
        F.cells(
          [
            { v: "100", sub: "Asha", c: "blue" },
            "+",
            { v: "50", sub: "Ben", c: "blue" },
            "=",
            { v: "150", sub: "total", c: "teal" },
          ],
          { size: 64 },
        ),
      ),
      st(
        "Isolation: no interference",
        "When many users read and write at once, <b>isolation</b> makes concurrent transactions not interfere. Without it, two withdrawals of £30 from £100 can both read 100 and both write 70, losing one of them.",
        F.compare(
          { title: "No isolation", c: "rose", body: "both read 100, both write 70: balance <b>70</b>" },
          { title: "Isolated", c: "teal", body: "one after the other: 100, then 70, then <b>40</b>" },
        ),
        mc(
          "Two shoppers each pay £30 from the same £100 balance at the same moment, and the balance ends at £70. Which property failed?",
          ["Isolation", "Durability", "Availability"],
          "The two transactions interfered: both used the old balance. Isolated transactions behave as if run one at a time, giving £40.",
        ),
      ),
      st(
        "Durability: it stays saved",
        "Once a transaction has <b>committed</b>, its changes are saved even in the event of a <b>system failure</b>. A power cut a second later does not undo it.",
        F.flow([
          { t: "Commit", s: "reported ok", c: "teal" },
          { t: "Saved to disk", s: "not just memory", c: "blue" },
          { t: "Power cut", s: "server dies", c: "rose" },
          { t: "Restart", s: "still there", c: "teal" },
        ]),
      ),
      st(
        "Two different Cs",
        "The <b>C in ACID</b> and the <b>C in CAP</b> are different ideas. ACID consistency is about data obeying its <b>rules</b>. CAP consistency is about every read seeing the <b>latest write</b> across replicas.",
        F.compare(
          { title: "C in ACID", c: "blue", body: "the data keeps its <b>rules</b> (totals, no negative balances)" },
          { title: "C in CAP", c: "violet", body: "every read gets the <b>latest write</b> (or an error)" },
        ),
        mc(
          "A read from a replica returns an old value after a newer write. Which C has been lost?",
          ["The C in CAP", "The C in ACID", "Neither: reads are never affected"],
          "Reading an old value breaks CAP-style consistency (latest write). The ACID rules about the data's shape are a separate matter.",
        ),
      ),
      st(
        "Eventual consistency",
        "With replication, at a given moment some nodes hold an <b>outdated</b> version, because writes arrive at different nodes at different times. Most replicated data systems offer <b>eventual consistency</b>: all nodes end up with the same data, and reads eventually return the same value.",
        F.frames(
          [
            { t: "write hits R1", v: rows(chip("R1 35", "new"), chip("R2 40", "old"), chip("R3 40", "old")) },
            { t: "reaches R2", v: rows(chip("R1 35", "new"), chip("R2 35", "new"), chip("R3 40", "old")) },
            { t: "reaches R3", v: rows(chip("R1 35", "new"), chip("R2 35", "new"), chip("R3 35", "new")) },
          ],
          "Three replicas receive an update one after another",
        ),
        mc(
          "A store is eventually consistent. A write has reached two of three replicas and nothing else is written. What is guaranteed?",
          [
            "All three replicas will end up with the new value",
            "Any read right now returns the new value",
            "Reads fail until the third replica has it",
          ],
          "Eventual consistency only promises convergence in the end. Until then a read may hit a replica that is still outdated.",
        ),
      ),
      st(
        "Convergence is not instant",
        "You can see it as <b>convergence</b>: all nodes move towards the same state. But <b>how long</b> will it take? Until then, reads could return anything. These <b>transient inconsistencies</b> are hard to detect, because they tend to appear only during <b>system faults</b> or under a high volume of concurrent operations.",
        F.plot(
          [
            {
              pts: [
                [0, 1],
                [2, 1],
                [2, 2],
                [4, 2],
                [4, 3],
                [6, 3],
              ],
              c: "teal",
            },
          ],
          { x: [0, 6], y: [0, 3.5], xl: "ticks since the write", yl: "replicas with the update", w: 440, h: 170 },
        ),
        mc(
          "Why do transient inconsistencies often go unnoticed in testing?",
          [
            "They appear mainly under faults or heavy load",
            "They only occur in tables that nobody ever reads",
            "They vanish as soon as any read touches the data",
          ],
          "On a quiet, healthy system replicas converge almost at once. The gaps show up under faults or high concurrency, which tests rarely reproduce.",
        ),
      ),
    ],
    guide: [
      "In the first card, try <b>Transfer £30 and crash after the debit</b> in <b>Separate statements</b> mode, then in <b>One transaction</b> mode.",
      "In the second card press <b>Write 35 at R1</b>, then <b>Advance 1 tick</b> and <b>Read from R3</b> a few times.",
      "Answer the questions after the demo.",
    ],
  };

  /* ---------- timeline of register operations (shared with the workshop, the boss and the bank) ---------- */
  const R = (c, s, e, v, t, id, bad) => ({ c, s, e, v, k: "r", t, id, bad });
  const W = (c, s, e, id) => ({ c, s, e, v: 1, k: "w", t: "write(1) ⇒ ok", id });
  const X0 = 70,
    WD = 450,
    LH = 42;
  function tl(ops, { lanes = ["Client A", "Client B", "Client C"], T = 14, flip = null, pick = false } = {}) {
    const x = (t) => X0 + ((WD - X0 - 8) * t) / T;
    const base = lanes
      .map(
        (n, i) =>
          `${tx(6, 35 + i * LH, n, { a: "start", s: 11 })}<line x1="${X0}" x2="${WD - 8}" y1="${30 + i * LH}" y2="${30 + i * LH}" stroke="var(--line-2)" stroke-dasharray="4 5"/>`,
      )
      .join("");
    const bars = ops
      .map((o) => {
        const c = o.bad ? "rose" : o.k === "w" ? "violet" : "blue",
          w = x(o.e) - x(o.s);
        const g = `<rect x="${x(o.s)}" y="${18 + o.c * LH}" width="${w}" height="24" rx="6" fill="color-mix(in srgb,var(--${c}) 18%,var(--panel))" stroke="var(--${c})" stroke-width="2"/>${tx(x(o.s) + w / 2, 34 + o.c * LH, o.t || (typeof o.v === "string" ? `⇒ ${o.v}` : `read ⇒ ${o.v}`), { s: 11 })}`;
        return pick && o.id ? `<g data-pick="${o.id}" style="cursor:pointer">${g}</g>` : `<g class="fi">${g}</g>`;
      })
      .join("");
    const fl =
      flip === null
        ? ""
        : `<line x1="${x(flip)}" x2="${x(flip)}" y1="10" y2="${lanes.length * LH + 18}" stroke="var(--amber)" stroke-width="3" stroke-dasharray="5 4"/>${tx(x(flip), 9, "flip", { c: "var(--amber-ink)" })}`;
    const h = lanes.length * LH + 38;
    const say = ops
      .map((o) => `${lanes[o.c]} ${o.k === "w" ? "writes 1" : `reads ${o.v}`} from ${o.s} to ${o.e}`)
      .join("; ");
    const body = `${base}${bars}${fl}${tx(WD - 8, h - 6, "time →", { a: "end", c: "var(--text-faint)" })}`;
    return pick ? svg(WD, h, body, "").replace(' role="img" aria-label=""', "") : svg(WD, h, body, `Timeline. ${say}`);
  }
  Object.assign(S, { R, W, tl });

  /* ============ 6.3 Linearizability ============ */
  const WR = { s: 4, e: 11 };
  const RD = [
    ["A1", 0, 0, 2],
    ["B1", 1, 3.5, 5.5],
    ["A2", 0, 6, 8],
    ["B2", 1, 9, 10.5],
    ["A3", 0, 12, 14],
  ];
  reg({
    id: "ds6-linear",
    order: 3,
    num: "6.3",
    title: "Linearizability",
    blurb: "Make a replicated database behave as if there were one copy. Test a timeline of reads and writes.",
    render(root) {
      root.appendChild(header(this, ""));
      const v = { A1: 0, B1: 0, A2: 1, B2: 1, A3: 1 };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Is this history linearizable?</h2><span class="tag">register x starts at 0, client C writes 1</span></div>
        <div id="fg"></div><div class="controls" id="bt"></div><div class="stat-row"><div class="stat"><small>Verdict</small><b></b></div></div><p class="dim" style="min-height:44px"></p></div>`);
      root.appendChild(card);
      function draw() {
        const rd = RD.map(([n, c, s, e]) => ({ n, c, s, e, v: v[n] })),
          r = lin(WR, rd);
        qs("#fg", card).innerHTML = tl([...rd.map((o) => R(o.c, o.s, o.e, o.v, `${o.n} ⇒ ${o.v}`)), W(2, WR.s, WR.e)], {
          flip: r.ok ? r.flip : null,
        });
        const b = qs("b", card);
        b.textContent = r.ok ? "Linearizable" : "Not linearizable";
        b.style.color = r.ok ? "var(--teal-ink)" : "var(--rose-ink)";
        qs("p", card).innerHTML = r.msg;
        card
          .querySelectorAll("[data-r]")
          .forEach((x) => (x.textContent = `Read ${x.dataset.r} returns ${v[x.dataset.r]}`));
      }
      RD.forEach(([n]) => {
        const b = el(`<button class="btn small" data-r="${n}"></button>`);
        b.onclick = () => {
          v[n] = 1 - v[n];
          draw();
        };
        qs("#bt", card).appendChild(b);
      });
      const rs = el(`<button class="btn small ghost">Reset</button>`);
      rs.onclick = () => {
        Object.assign(v, { A1: 0, B1: 0, A2: 1, B2: 1, A3: 1 });
        draw();
      };
      qs("#bt", card).appendChild(rs);
      draw();
      root.appendChild(
        pr(
          "ds6-linear-1",
          "Starting from the history as first shown, you press <b>Read A3 returns 1</b> so that A3 returns 0. A3 starts after the write has completed. What does the checker say?",
          [
            "Not linearizable: later reads must return 1",
            "Linearizable: a 0 is always allowed for a read",
            "Linearizable: A3 overlaps the write bar",
          ],
          "The write completes at time 11 and A3 only starts at 12. Once a write has completed every later read must see it, so a 0 breaks the one-copy illusion.",
        ),
      );
      root.appendChild(
        pr(
          "ds6-linear-2",
          "Starting again from the first history, you set <b>B1</b> to 1 and <b>A2</b> to 0. Both reads overlap the write. Is the history linearizable?",
          [
            "No: A2 starts after B1 has already returned 1",
            "Yes: overlapping reads may return anything, in any order",
            "Yes: each read is legal on its own",
          ],
          "B1 finishes at 5.5 having seen 1, and A2 only starts at 6. After one client has read the new value, every later read must return it too.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Linearizable</b>: the system appears as if there is <b>one single copy</b> of the data and every operation is atomic. As soon as a client completes a write, all clients must see it.",
            "A read before the write starts returns the old value, after it completes the new value, and an <b>overlapping</b> read may return either.",
            "The extra rule: <b>once any client reads the new value, all later reads must return it too</b>.",
          ],
          "Look for one moment inside the write bar where 0 flips to 1. If a read contradicts it, the history is not linearizable.",
        ),
      );
    },
  });

  L["ds6-linear"] = {
    sum: "A <b>linearizable</b> system behaves as if there were one copy of the data. Once any client reads a new value, every later read must return it too.",
    steps: [
      st(
        "Same question, different answers",
        "An eventually consistent database may give different answers to the same question, which hurts reliability. Here the shop sign is 0 (closed) or 1 (open). Alice reads 1, then <b>afterwards</b> Bob reads 0.",
        tl([W(2, 2, 6), R(0, 7, 9, 1, "Alice ⇒ 1"), R(1, 10, 12.5, 0, "Bob ⇒ 0", "", true)], {
          lanes: ["Alice", "Bob", "Manager"],
        }),
      ),
      st(
        "The one-copy illusion",
        "Ideally a distributed database behaves, from the user's perspective, as if there is only <b>one version</b> of the data: the most current one. The system should <b>appear</b> as if all operations are atomic and there is a single copy.",
        F.compare(
          {
            title: "Linearizable",
            c: "teal",
            body: "as soon as a client completes a write, <b>all</b> clients see it",
          },
          {
            title: "Not linearizable",
            c: "rose",
            body: "some clients still read the old copy after the write finished",
          },
        ),
      ),
      st(
        "A register",
        "To reason about it, think of a <b>register</b>: a document or a row. It has two operations. <b>read(x) ⇒ v</b> means the client asked for register x and got value v. <b>write(x, v) ⇒ r</b> means the client set x to v and got a response r (<b>ok</b> or an error).",
        F.cells(
          [
            { v: "read(x) ⇒ v", sub: "returns the value", c: "blue" },
            { v: "write(x, v) ⇒ r", sub: "r is ok or an error", c: "violet" },
          ],
          { size: 170 },
        ),
        mc(
          "What does write(x, 7) ⇒ ok tell the client?",
          [
            "The register was set to 7 and the database confirmed it",
            "The register already held 7",
            "The next read will return 7 only on that node",
          ],
          "The response r says whether the write succeeded: ok means the database accepted it.",
        ),
      ),
      st(
        "Reading a timeline",
        "Each bar is the <b>duration</b> of an operation. The value starts at 0 and client C writes 1. A read that finishes <b>before</b> the write starts returns 0. A read that starts <b>after</b> the write completes returns 1. A read that <b>overlaps</b> the write may return 0 or 1.",
        tl([
          R(0, 0, 2, 0),
          R(1, 3, 6, "0 or 1"),
          R(0, 5, 8, "0 or 1"),
          R(1, 8.5, 11, "0 or 1"),
          W(2, 4, 10),
          R(0, 12, 14, 1),
        ]),
        mc(
          "A read starts before the write and ends after it has started. Which values may it return?",
          ["Either 0 or 1", "Only 1, the new value", "Only 0 until the write completes"],
          "An overlapping read cannot be ordered strictly before or after the write, so the old value and the new value are both allowed.",
        ),
      ),
      st(
        "Still not quite there",
        "Allowing 0 or 1 for each overlapping read separately is not enough. Alice's read returns 1 and Bob's later read returns 0, yet both overlap the write. Each one alone is fine. Together they show the value <b>going backwards</b>.",
        tl([W(2, 4, 11), R(0, 5, 7, 1, "A ⇒ 1"), R(1, 8, 10, 0, "B ⇒ 0", "", true)]),
        {
          type: "pick",
          q: "Both reads overlap the write. Tap the read that breaks linearizability.",
          fig: tl([W(2, 4, 11, "w"), R(0, 5, 7, 1, "A ⇒ 1", "a"), R(1, 8, 10, 0, "B ⇒ 0", "b")], { pick: true }),
          a: "b",
          why: "B starts after A has already returned 1, so B must return 1 too. Returning 0 makes the value go backwards.",
        },
      ),
      st(
        "The extra constraint",
        "We need an additional constraint: in a linearizable system, <b>if one client reads 1, all subsequent reads should also read 1</b>. The dashed line shows one moment where the register flips from 0 to 1, with every 0-read before it and every 1-read after it.",
        tl([R(0, 0, 2, 0), R(1, 3.5, 5.5, 0), W(2, 4, 11), R(0, 6, 8, 1), R(1, 9, 12, 1)], { flip: 6 }),
      ),
      st(
        "Checking a history",
        "To test a history, look for a <b>flip moment</b> inside the write bar. Each read returning 0 must start <b>before</b> it, and each read returning 1 must end <b>after</b> it. If no such moment exists, the history is not linearizable.",
        F.flow([
          { t: "Find the write", c: "violet" },
          { t: "Pick a flip moment", c: "amber" },
          { t: "0-reads start before", c: "blue" },
          { t: "1-reads end after", c: "teal" },
        ]),
        mc(
          "One read returns 1 and ends at time 5. Another returns 0 and starts at time 6. Is the history linearizable?",
          ["No: the 0 comes after a 1 had been read", "Yes: both are legal alone", "Yes, if the write is long enough"],
          "Any flip moment would have to be after 6 for the 0-read and before 5 for the 1-read, which is impossible.",
        ),
      ),
    ],
    guide: [
      "Press the buttons named <b>Read A1 returns 0</b> and so on to flip what each read returns.",
      "Watch the verdict and the dashed flip line. Make the history break, then fix it.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds6-cap"] = {
    sum: "Linearizability is crucial for leaders, unique IDs and seat bookings. It costs availability during a partition and response time whenever the network is slow.",
    steps: [
      st(
        "One leader, really one",
        "A system that uses <b>single-leader replication</b> needs to be sure there is indeed <b>only one leader</b>. If two nodes both believe they lead, they accept conflicting writes.",
        F.compare(
          { title: "Two leaders", c: "rose", body: "both accept writes: the copies drift apart" },
          { title: "One leader", c: "teal", body: "every write goes through one node, in one order" },
        ),
        mc(
          "Two nodes each believe they are the leader. What is the danger?",
          [
            "Their copies accept conflicting writes",
            "Reads become faster so nothing is lost",
            "Nothing: followers can sort it out later",
          ],
          "The whole design relies on a single node ordering the writes. Two leaders break that.",
        ),
      ),
      st(
        "Uniqueness guarantees",
        "<b>Constraints and uniqueness guarantees</b> need it too: no two entries with the same <b>unique ID</b>, and no two passengers <b>booking the same seat</b> on a flight.",
        F.compare(
          { title: "Not linearizable", c: "rose", body: "two replicas each accept 14C: <b>sold twice</b>" },
          { title: "Linearizable", c: "teal", body: "the second request sees the first and is refused" },
        ),
        mc(
          "Two people sign up with the same username at the same time, on different replicas, and both succeed. What was missing?",
          [
            "An agreed check that the name is free",
            "Faster hardware on every replica node",
            "A larger number of followers per leader",
          ],
          "Uniqueness needs one agreed answer to 'is this name taken?'. Independent replicas cannot give it.",
        ),
      ),
      st(
        "Linearizability and CAP",
        "If your application <b>requires</b> linearizability and some replicas are disconnected, those replicas <b>cannot process requests</b> while they are cut off. They sacrifice <b>availability</b>.",
        reps([
          { name: "Node A", val: 35, cls: "fresh", tag: chip("serving", "new") },
          { name: "Node B", val: "refuses", cls: "cut", tag: chip("link cut", "bad") },
        ]),
        mc(
          "A booking system must be linearizable and one replica loses its link. What should that replica do?",
          [
            "Refuse requests until the link is back",
            "Keep selling seats from its own copy",
            "Pick a seat at random and fix it later",
          ],
          "Answering from a possibly outdated copy would break linearizability, so it must stay unavailable.",
        ),
      ),
      st(
        "Who can relax",
        "Applications that <b>do not require</b> linearizability can be <b>more tolerant</b> of network problems: a slightly old answer is fine for them.",
        F.cells(
          [
            { v: "needs it", sub: "leader, unique ID, seat", c: "rose" },
            { v: "can relax", sub: "like count, news feed", c: "teal" },
          ],
          { size: 150 },
        ),
        {
          type: "cat",
          q: "Does each task need linearizability?",
          buckets: ["Needs it", "Can relax"],
          items: [
            ["Choose the one leader after a crash", 0],
            ["Show the number of views on a video", 1],
            ["Hand out each voucher code only once", 0],
            ["Refresh a friends' activity feed", 1],
          ],
          hint: "Ask whether a wrong or old answer causes real harm.",
          why: "Leaders and unique codes must be exact. View counts and feeds can be a little behind without harm.",
        },
      ),
      st(
        "The performance price",
        "Linearizability has <b>performance impacts</b>, so many distributed databases do not guarantee it, in favour of speed. A replica can answer locally in a moment, but to be linearizable it must first check with the others.",
        F.bars(
          [
            ["Answer from the local copy", 2, "teal", "ms"],
            ["Check with the other site (30 ms each way)", 62, "rose", "ms"],
          ],
          { max: 62 },
        ),
        mc(
          "Why do many distributed databases not guarantee linearizability?",
          [
            "It slows every read and write, so they favour performance",
            "It cannot be implemented on more than one node",
            "It makes the data less durable on disk",
          ],
          "Checking with other replicas costs network time on each operation, so speed-focused systems skip it.",
        ),
      ),
      st(
        "Network delays",
        "If you want linearizability, the response time of reads and writes is <b>at least proportional to the uncertainty of delays</b> in the network. With highly variable delays, linearizable operations are <b>inevitably slow</b>.",
        F.plot(
          [
            { f: (x) => x, c: "rose", label: "linearizable" },
            { f: () => 2, c: "teal", label: "local answer" },
          ],
          { x: [0, 100], y: [0, 100], xl: "delay uncertainty (ms)", yl: "response time (ms)", w: 440, h: 170 },
        ),
        mc(
          "A network's delays are steady at 10 ms in one system and swing between 10 and 200 ms in another. Which system has the slower linearizable reads?",
          ["The one with wildly varying delays", "The one with the steady delays", "Both are equally fast in practice"],
          "Response time grows with the uncertainty in delays, so the unpredictable network is much slower.",
        ),
      ),
    ],
    guide: [
      "Try <b>Eventually consistent</b>: press <b>Book 14C at London</b>, <b>Book 14C at Leeds</b>, then <b>Deliver updates</b>.",
      "Switch to <b>Linearizable</b>, try the same bookings, then use <b>Link cut</b> and move the <b>One-way network delay</b> slider.",
      "Answer the questions after the demo.",
    ],
  };
})();
