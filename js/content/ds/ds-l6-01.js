/* Data Science (COM3021), Lecture 6: consistency and consensus.
   This part: shared helpers + ds6-fail (6.1, failures and CAP) and ds6-acid (6.2, ACID and eventual consistency). */
(function () {
  const S = (NIC.shared.dsL6 = NIC.shared.dsL6 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 6, ...m });

  if (!document.getElementById("ds6-style")) {
    const st = document.createElement("style");
    st.id = "ds6-style";
    st.textContent = `
.ds6-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:8px 0}
.ds6-node{border:2px solid var(--line);border-radius:14px;padding:8px 10px;background:var(--panel-2);box-shadow:0 3px 0 var(--line);min-width:0;text-align:center}
.ds6-node h4{margin:0 0 2px;font-size:12.5px;font-weight:900;color:var(--text);display:flex;justify-content:space-between;gap:6px}
.ds6-node h4 small{font-weight:800;color:var(--text-faint)}
.ds6-val{font-size:26px;font-weight:900;color:var(--text);line-height:1.2}
.ds6-node.cut{border-style:dashed;opacity:.6}.ds6-node.stale{border-color:var(--amber)}.ds6-node.fresh{border-color:var(--teal)}
.ds6-node.bad{border-color:var(--rose)}.ds6-node.lead{border-color:var(--blue)}
.ds6-chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;min-height:22px}
.ds6-chip{font-size:11.5px;font-weight:800;padding:1px 6px;border-radius:8px;border:2px solid var(--line-2);background:var(--panel);color:var(--text)}
.ds6-chip.new{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 20%,var(--panel))}
.ds6-chip.old{border-color:var(--amber)}.ds6-chip.bad{border-color:var(--rose);background:color-mix(in srgb,var(--rose) 14%,var(--panel))}
.ds6-net{display:inline-block;font-weight:900;font-size:12.5px;padding:2px 10px;border-radius:10px;border:2px solid var(--line-2)}
.ds6-net.up{border-color:var(--teal);color:var(--teal-ink)}.ds6-net.cut{border-color:var(--rose);color:var(--rose-ink)}
.ds6-log{font-size:13px;font-weight:700;margin:6px 0 0;padding:0;list-style:none;display:grid;gap:3px}
.ds6-log li{border-left:4px solid var(--line-2);padding:2px 8px}
.ds6-log li.ok{border-color:var(--teal)}.ds6-log li.no{border-color:var(--rose)}.ds6-log li.old{border-color:var(--amber)}`;
    document.head.appendChild(st);
  }

  /* ---------- helpers shared with the other Lecture 6 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why) => ({ q, o, a: 0, why });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b: b.startsWith("<p>") ? b : `<p>${b}</p>`, v, c });
  const chip = (t, cls = "") => `<span class="ds6-chip mono ${cls}">${t}</span>`;
  const rep = (n) =>
    `<div class="ds6-node ${n.cls || ""}" data-k="${n.k || n.name}"><h4>${n.name}${n.sub ? `<small>${n.sub}</small>` : ""}</h4><div class="ds6-val">${n.val}</div>${n.tag ? `<div class="ds6-chips">${n.tag}</div>` : ""}</div>`;
  const reps = (a) => `<div class="ds6-grid">${a.map(rep).join("")}</div>`;
  const net = (up) => `<span class="ds6-net ${up ? "up" : "cut"}">network ${up ? "connected" : "cut"}</span>`;
  const log = (box, items) =>
    (box.innerHTML = `<ul class="ds6-log">${items.map(([c, t]) => `<li class="${c}">${t}</li>`).join("")}</ul>`);
  /** A segmented switch from a spec like "up:Network connected|cut:Network cut". */
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        v,
        cb,
      ),
    );
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:800 ${s}px var(--sans);fill:${c}">${t}</text>`;
  /** Is a history of one register (starts at 0, one write of 1 by `w`) linearizable? reads: [{n, s, e, v}]. */
  const lin = (w, rd) => {
    let lo = w.s,
      loN = "",
      hi = w.e,
      hiN = "";
    rd.forEach((r) => {
      if (r.v === 0 && r.s > lo) [lo, loN] = [r.s, r.n];
      if (r.v === 1 && r.e < hi) [hi, hiN] = [r.e, r.n];
    });
    const ok = lo <= hi;
    const msg = ok
      ? `The write can flip from 0 to 1 at time ${+((lo + hi) / 2).toFixed(1)}: every 0 comes before it and every 1 after it.`
      : loN && hiN
        ? `${loN} returns 0 but starts after ${hiN} had already returned 1.`
        : loN
          ? `${loN} starts after the write completed but returns 0.`
          : `${hiN} returns 1 but finished before the write started.`;
    return { ok, flip: (lo + hi) / 2, msg };
  };
  /** Tappable cards for pick questions: [id, title, line]. */
  const pk = (list) =>
    `<div class="ds6-grid">${list.map(([id, t, v]) => `<div class="ds6-node" data-pick="${id}" style="cursor:pointer"><h4>${t}</h4><div class="ds6-val" style="font-size:19px">${v}</div></div>`).join("")}</div>`;
  Object.assign(S, { reg, mc, pr, st, chip, rep, reps, net, log, seg, svg, tx, lin, pk });

  const dot = (x, y, c, t) =>
    `<circle cx="${x}" cy="${y}" r="24" fill="color-mix(in srgb,var(--${c}) 18%,var(--panel))" stroke="var(--${c})" stroke-width="2"/>${tx(x, y + 5, t)}`;
  const splitFig = svg(
    420,
    120,
    `<g class="fi">${dot(70, 35, "blue", "A")}${dot(70, 90, "blue", "B")}${dot(350, 62, "amber", "C")}</g><path d="M94 35L326 60M94 90L326 66" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 7"/><path d="M196 72L224 48" stroke="var(--rose)" stroke-width="4"/>${tx(210, 100, "link cut", { c: "var(--rose-ink)" })}`,
    "Nodes A and B on one side, node C on the other, and the link between the two sides cut",
  );

  /* ============ 6.1 Failures and the CAP theorem ============ */
  reg({
    id: "ds6-fail",
    order: 1,
    num: "6.1",
    title: "Things go wrong: the CAP theorem",
    blurb:
      "Networks split and nodes die. When the network is cut, a store must choose: stay consistent or stay available.",
    render(root) {
      root.appendChild(header(this, ""));
      let up = true,
        pol = "C",
        a = 40,
        b = 40,
        last = 40,
        n = [0, 0, 0],
        lines = [["", "Two replicas hold the tickets left for the 8 pm show."]];
      const card =
        el(`<div class="card"><div class="card-head"><h2>Two replicas, one network</h2><span class="tag">tickets left for the 8 pm show</span></div>
        <div class="controls" id="n6"></div><div class="controls" id="p6"></div><div id="cl"></div>
        <div class="controls"><button class="btn primary" id="w6">Sell 5 tickets on node A</button><button class="btn" id="rb">Read from node B</button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="stat-row"><div class="stat teal"><small>Answered</small><b></b></div><div class="stat rose"><small>Refused</small><b></b></div><div class="stat amber"><small>Stale answers</small><b></b></div></div>
        <div id="lg"></div></div>`);
      root.appendChild(card);
      const say = (c, t) => (lines = [[c, t]]);
      function draw() {
        const cur = (v) => ({
          val: v,
          cls: v === last ? "fresh" : "stale",
          tag: chip(v === last ? "latest" : "old", v === last ? "new" : "old"),
        });
        qs("#cl", card).innerHTML =
          net(up) +
          reps([
            { name: "Node A", ...cur(a) },
            { name: "Node B", ...cur(b) },
          ]);
        card.querySelectorAll(".stat b").forEach((x, i) => (x.textContent = n[i]));
        log(qs("#lg", card), lines);
      }
      seg(qs("#n6", card), "up:Network connected|cut:Network cut", "up", (v) => {
        up = v === "up";
        if (up && b !== a) b = a;
        say(
          up ? "ok" : "no",
          up ? "The link is back: node B catches up with node A." : "The link between A and B is cut.",
        );
        draw();
      });
      seg(qs("#p6", card), "C:Stay consistent|A:Stay available", "C", (v) => {
        pol = v;
        say(
          "",
          v === "C"
            ? "Refuse a request rather than risk a stale answer."
            : "Always answer, even if the data may be old.",
        );
        draw();
      });
      const refuse = (who) => {
        n[1]++;
        say("no", `Node ${who} cannot reach the other node, so it cannot be sure it is up to date: <b>error</b>.`);
      };
      qs("#w6", card).onclick = () => {
        if (!up && pol === "C") refuse("A");
        else {
          a = last = Math.max(0, a - 5);
          if (up) b = a;
          n[0]++;
          say("ok", up ? `Sold 5: both nodes now say ${a}.` : `Sold 5 on node A (${a} left). Node B has not heard.`);
        }
        draw();
      };
      qs("#rb", card).onclick = () => {
        if (!up && pol === "C") refuse("B");
        else {
          n[0]++;
          n[2] += b === last ? 0 : 1;
          say(
            b === last ? "ok" : "old",
            `Node B answers <b>${b}</b>${b === last ? "." : `, but the latest write says ${last}: a <b>stale</b> answer.`}`,
          );
        }
        draw();
      };
      qs("#rs", card).onclick = () => {
        a = b = last = 40;
        n = [0, 0, 0];
        say("", "Back to 40 tickets on both nodes.");
        draw();
      };
      draw();
      root.appendChild(
        pr(
          "ds6-fail-1",
          "The network is cut and the policy is <b>Stay available</b>. You press <b>Sell 5 tickets on node A</b> once from a fresh start, then <b>Read from node B</b>. What does B report?",
          [
            "40: B never heard about the sale",
            "35: B learnt of the sale in the background",
            "An error: B is cut off, so it refuses",
          ],
          "Staying available means B answers with what it has. The sale only reached A, so B still says 40 while the latest write says 35: a stale answer.",
        ),
      );
      root.appendChild(
        pr(
          "ds6-fail-2",
          "The network is cut and the policy is <b>Stay consistent</b>. What happens when you press <b>Read from node B</b>?",
          [
            "B refuses with an error: it cannot confirm it is current",
            "B answers with its old value and flags it",
            "B asks node A over the cut link and answers 35",
          ],
          "A consistent system must never return an out-of-date value. With the link cut B cannot check, so it gives up availability and returns an error.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "In a distributed system nodes crash, messages get lost and the network splits. A <b>fault-tolerant</b> system keeps working anyway.",
            "<b>CAP</b>: <b>C</b> every read gets the latest write or an error, <b>A</b> every request gets a non-error response, <b>P</b> the system works even when parts of the network are cut off.",
            "More precisely: <b>if there is a partition, choose between availability and consistency</b>. No partition, no dilemma.",
          ],
          "A cut network forces a choice: refuse and stay right, or answer and maybe be wrong.",
        ),
      );
    },
  });

  L["ds6-fail"] = {
    sum: "Distributed systems fail in many ways. The <b>CAP theorem</b> says that when the network is partitioned you must choose between <b>consistency</b> and <b>availability</b>.",
    steps: [
      st(
        "Many things can go wrong",
        "In a distributed system many things can go wrong, and they will. Nodes <b>crash</b>, messages are <b>lost</b>, replies are <b>slow</b> and the network can <b>split</b>.",
        F.cells(
          [
            { v: "crash", sub: "a node stops", c: "rose" },
            { v: "lost", sub: "a message vanishes", c: "amber" },
            { v: "slow", sub: "a reply drags", c: "blue" },
            { v: "split", sub: "network cut in two", c: "violet" },
          ],
          { size: 104 },
        ),
        mc(
          "Which of these is a network partition?",
          [
            "The network splits so two groups of nodes cannot talk",
            "One server crashes while the rest keep talking",
            "A reply arrives slower than it usually does",
          ],
          "A partition cuts the network in two: both sides keep running but cannot reach each other. A crash or a slow reply is a different fault.",
        ),
      ),
      st(
        "Reliable from unreliable",
        "Letting a system fail entirely is not acceptable in most cases. Building <b>reliable, fault-tolerant</b> systems from <b>unreliable</b> components is challenging, so we rely on <b>algorithms, abstractions and protocols</b>, such as transactions in databases.",
        F.flow([
          { t: "Unreliable parts", s: "crash, lose, delay", c: "rose" },
          { t: "Protocols", s: "e.g. transactions", c: "blue" },
          { t: "Reliable service", s: "keeps working", c: "teal" },
        ]),
      ),
      st(
        "Three properties: C, A, P",
        "The <b>CAP theorem</b> names <b>Consistency</b> (every read receives the most recent write or an error), <b>Availability</b> (every request receives a non-error response) and <b>Partition tolerance</b> (the system keeps operating even if parts of the network are disconnected).",
        F.cells(
          [
            { v: "C", sub: "latest write, or an error", c: "blue" },
            { v: "A", sub: "a non-error answer", c: "teal" },
            { v: "P", sub: "works when the network splits", c: "violet" },
          ],
          { size: 150 },
        ),
        {
          type: "match",
          q: "Match each CAP property to its meaning.",
          pairs: [
            ["Consistency", "A read returns the most recent write, or an error"],
            ["Availability", "Every request gets a non-error response"],
            ["Partition tolerance", "The system keeps operating when parts of the network are cut off"],
          ],
          why: "C is about reads seeing the latest write, A is about always getting a real answer, and P is about surviving a split network.",
        },
      ),
      st(
        "What a partition looks like",
        "In a <b>network partition</b> every node is still running, but the link between two groups is cut. Each side can only talk to itself, so neither can tell what the other side is doing.",
        splitFig,
      ),
      st(
        "If partitioned, choose",
        "More precisely: <b>if there is a network partition, you have to choose between availability and consistency</b>. The cut-off node either <b>refuses</b> (consistent, not available) or <b>answers</b> from what it has (available, maybe stale).",
        F.compare(
          {
            title: "Keep consistency",
            c: "blue",
            body: "the cut-off node <b>refuses</b> requests: never wrong, not always available",
          },
          {
            title: "Keep availability",
            c: "amber",
            body: "the cut-off node <b>answers</b> anyway: always responds, maybe stale",
          },
        ),
        mc(
          "Node B is cut off, holds 40, and the latest write set 35. It replies 40 anyway. What does that show?",
          [
            "B was available but not consistent",
            "B was consistent but not available",
            "B was both consistent and available",
          ],
          "B did respond, so it was available, but the response was not the most recent write, so consistency was lost.",
        ),
      ),
      st(
        "No partition, no dilemma",
        "You do not always give something up. With a healthy network a replicated store can be <b>consistent and available</b>. The choice only appears <b>when there is a partition</b>.",
        F.compare(
          { title: "Network healthy", c: "teal", body: "consistency <b>and</b> availability" },
          { title: "Network cut", c: "rose", body: "pick <b>one</b>: consistency or availability" },
        ),
        mc(
          "A healthy network, and a replicated store answers every read with the latest write. Is CAP broken?",
          [
            "No: the choice only arises when there is a partition",
            "Yes: it must have given up one of the three",
            "Yes: it cannot be partition tolerant",
          ],
          "CAP only forces a trade-off during a partition. When the network is whole, consistency and availability can both hold.",
        ),
      ),
    ],
    guide: [
      "Press <b>Sell 5 tickets on node A</b>, then <b>Read from node B</b> while <b>Network connected</b> is on.",
      "Switch to <b>Network cut</b> and try the same under <b>Stay consistent</b>, then under <b>Stay available</b>.",
      "Watch the Refused and Stale answers counts, then answer the questions after the demo.",
    ],
  };

  /* ============ 6.2 ACID and eventual consistency ============ */
  reg({
    id: "ds6-acid",
    order: 2,
    num: "6.2",
    title: "ACID and eventual consistency",
    blurb: "Transactions promise all-or-nothing. Replicas only promise to agree eventually.",
    render(root) {
      root.appendChild(header(this, ""));
      let mode = "plain",
        asha = 100,
        ben = 50,
        msg = "Asha has £100 and Ben has £50: £150 between them.";
      const c1 =
        el(`<div class="card"><div class="card-head"><h2>Move £30 from Asha to Ben</h2><span class="tag">rule: the total stays £150</span></div>
        <div class="controls" id="m1"></div>
        <div class="controls"><button class="btn rose" id="tc">Transfer £30 and crash after the debit</button><button class="btn primary" id="ts">Transfer £30 safely</button><button class="btn ghost" id="t0">Reset</button></div>
        <div class="stat-row"><div class="stat"><small>Asha</small><b></b></div><div class="stat"><small>Ben</small><b></b></div><div class="stat amber"><small>Total</small><b></b></div></div>
        <p class="dim" style="min-height:44px"></p></div>`);
      root.appendChild(c1);
      function d1() {
        const v = [asha, ben, asha + ben];
        c1.querySelectorAll(".stat b").forEach((x, i) => (x.textContent = `£${v[i]}`));
        c1.querySelectorAll(".stat b")[2].style.color = v[2] === 150 ? "" : "var(--rose-ink)";
        qs("p", c1).innerHTML = msg;
      }
      seg(qs("#m1", c1), "plain:Separate statements|txn:One transaction", "plain", (v) => {
        mode = v;
        asha = 100;
        ben = 50;
        msg =
          v === "txn"
            ? "A transaction treats the debit and the credit as one unit."
            : "Two separate statements: debit, then credit.";
        d1();
      });
      const transfer = (crash) => () => {
        if (asha < 30) msg = "Asha has under £30: the rule <b>no negative balance</b> stops the transfer.";
        else if (crash && mode === "txn")
          msg =
            "The server crashed halfway, so the transaction never committed and the debit was <b>rolled back</b>: all or nothing.";
        else if (crash) {
          asha -= 30;
          msg = "The server crashed after the debit and the credit never ran: £30 has <b>vanished</b>.";
        } else {
          asha -= 30;
          ben += 30;
          msg = "Debit and credit both done: the total is still £150.";
        }
        d1();
      };
      qs("#tc", c1).onclick = transfer(true);
      qs("#ts", c1).onclick = transfer(false);
      qs("#t0", c1).onclick = () => {
        asha = 100;
        ben = 50;
        msg = "Back to £100 and £50.";
        d1();
      };
      d1();
      let tick = 0,
        wrote = false,
        vals = [40, 40, 40],
        old = 0,
        m2 = "Replica R1 receives the write. R2 and R3 will hear about it later.";
      const AT = [0, 2, 4];
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>Three replicas catch up</h2><span class="tag">the update reaches R2 at tick 2 and R3 at tick 4</span></div>
        <div id="r2"></div>
        <div class="controls"><button class="btn primary" id="wr">Write 35 at R1</button><button class="btn" id="tk">Advance 1 tick</button><button class="btn" id="rd">Read from R3</button><button class="btn ghost" id="r0">Reset</button></div>
        <div class="stat-row"><div class="stat"><small>Tick</small><b></b></div><div class="stat teal"><small>Replicas holding 35</small><b></b></div><div class="stat amber"><small>Stale reads</small><b></b></div></div>
        <p class="dim" style="min-height:44px"></p></div>`);
      root.appendChild(c2);
      function d2() {
        const latest = wrote ? 35 : 40,
          v = [tick, `${vals.filter((x) => x === 35).length} of 3`, old];
        qs("#r2", c2).innerHTML = reps(
          vals.map((x, i) => ({
            name: `R${i + 1}`,
            val: x,
            cls: x === latest ? "fresh" : "stale",
            tag: chip(x === latest ? "latest" : "outdated", x === latest ? "new" : "old"),
          })),
        );
        c2.querySelectorAll(".stat b").forEach((x, i) => (x.textContent = v[i]));
        qs("p", c2).innerHTML = m2;
        qs("#wr", c2).disabled = wrote;
        qs("#tk", c2).disabled = !wrote || vals.every((x) => x === 35);
      }
      qs("#wr", c2).onclick = () => {
        wrote = true;
        tick = 0;
        vals[0] = 35;
        m2 = "R1 has 35. The update travels to the others, but not instantly.";
        d2();
      };
      qs("#tk", c2).onclick = () => {
        tick++;
        vals = vals.map((x, i) => (tick >= AT[i] ? 35 : x));
        m2 = vals.every((x) => x === 35)
          ? "All replicas agree: they have <b>converged</b>."
          : "Some replicas still hold the old value.";
        d2();
      };
      qs("#rd", c2).onclick = () => {
        const stale = vals[2] !== (wrote ? 35 : 40);
        old += stale ? 1 : 0;
        m2 = `R3 answers <b>${vals[2]}</b>${stale ? ": a stale read, until the update arrives." : "."}`;
        d2();
      };
      qs("#r0", c2).onclick = () => {
        tick = old = 0;
        wrote = false;
        vals = [40, 40, 40];
        m2 = "Reset: all three replicas say 40.";
        d2();
      };
      d2();
      root.appendChild(
        pr(
          "ds6-acid-1",
          "In <b>Separate statements</b> mode, Asha has £100 and Ben £50. You press <b>Transfer £30 and crash after the debit</b>. What is the total of the two accounts now?",
          [
            "£120: the £30 left Asha but never reached Ben",
            "£150: transfers never change the total",
            "£180: Ben is credited twice",
          ],
          "The debit ran (Asha 70) but the credit did not (Ben 50), so 70 + 50 = 120. In <b>One transaction</b> mode the debit is rolled back and the total stays 150.",
        ),
      );
      root.appendChild(
        pr(
          "ds6-acid-2",
          "You press <b>Write 35 at R1</b> and then <b>Advance 1 tick</b> twice. How many replicas hold 35?",
          ["2 of 3: R1 and R2", "1 of 3: only R1", "3 of 3: all of them"],
          "R2 receives the update at tick 2 and R3 only at tick 4. After 2 ticks R1 and R2 have it and R3 is still outdated.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>A</b>tomicity: <b>all or nothing</b>. <b>C</b>onsistency: only predefined, predictable changes. <b>I</b>solation: concurrent transactions do not interfere. <b>D</b>urability: committed changes survive a failure.",
            "<b>Eventual consistency</b>: replicas may briefly disagree, but all <b>converge</b> to the same state.",
            "Until they converge, reads can return anything, and these <b>transient inconsistencies</b> are hard to detect.",
          ],
          "ACID protects a transaction. Eventual consistency only promises that replicas will agree, in the end.",
        ),
      );
    },
  });
})();
