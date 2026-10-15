/* Data Science (COM3021), Lecture 4: replication. Part 1 = shared helpers and styles, 4.1 (why distribute) and 4.2 (leaders and followers). */
(function () {
  const S = (NIC.shared.dsL4 = NIC.shared.dsL4 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 4, ...m });

  /* Styles for the replica cards used by the Lecture 4 demos (one injected sheet, prefixed d4-). */
  function css() {
    if (document.getElementById("ds4-css")) return;
    const s = document.createElement("style");
    s.id = "ds4-css";
    s.textContent = `.d4-row{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}
.d4-nd{flex:1 1 120px;min-width:104px;border:2px solid var(--line-2);border-radius:14px;background:var(--panel-2);padding:10px;text-align:center;font-weight:700}
.d4-nd small{display:block;color:var(--text-faint);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.d4-nd .d4-v{display:block;font-size:22px;font-weight:900;margin:2px 0}
.d4-nd.lead{border-color:var(--blue)}.d4-nd.ok{border-color:var(--teal)}.d4-nd.old{border-color:var(--amber)}
.d4-nd.down{border-style:dashed;border-color:var(--rose);opacity:.55}.d4-nd.pk{cursor:pointer}.d4-nd.hot{background:color-mix(in srgb,var(--blue) 14%,var(--panel-2))}
.d4-chip{display:inline-block;border:2px solid var(--line-2);border-radius:8px;padding:1px 7px;margin:2px;font-size:12.5px;background:var(--panel);font-weight:700}
.d4-chip.new{border-color:var(--teal)}.d4-chip.tmp{border-color:var(--amber)}
.d4-lane{position:relative;height:22px;background:var(--bg-2);border-radius:6px;overflow:hidden}
.d4-seg{position:absolute;top:0;height:100%;border-radius:6px}
.d4-tl{display:grid;grid-template-columns:96px 1fr;gap:8px;align-items:center;margin:6px 0;font-size:13px;font-weight:700}
.d4-ack{position:absolute;top:0;width:3px;height:100%;background:var(--text)}`;
    document.head.appendChild(s);
  }
  const chip = (t, c = "") => `<span class="d4-chip ${c}">${t}</span>`;
  const node = (k, label, big, cls = "", sub = "") =>
    `<div class="d4-nd ${cls}" data-k="${k}"><small>${label}</small><span class="d4-v">${big}</span>${sub}</div>`;
  Object.assign(S, { css, chip, node, reg });

  /* ============ 4.1 Why distribute ============ */
  const REQ = [600, 200, 200, 200];
  reg({
    id: "ds4-scale",
    order: 1,
    num: "4.1",
    title: "Why distribute: scale up or out",
    blurb: "One machine hits a ceiling and can die. Compare a bigger box with more boxes.",
    render(root, life) {
      css();
      root.appendChild(header(this, ""));
      let mode = "up",
        load = 400,
        dead = false,
        want = 800;
      const card =
        el(`<div class="card"><div class="card-head"><h2>One big machine or three small ones</h2><span class="tag">same total capacity</span></div>
        <div class="controls" id="c"></div><div class="d4-row" id="m"></div><div class="stat-row" id="s"></div><p class="dim" id="t" style="min-height:44px"></p>
        <div class="controls"><button class="btn rose" id="x">Crash a machine</button><button class="btn ghost" id="r">Repair it</button></div></div>`);
      root.appendChild(card);
      const sl = N.slider("Load (requests per second)", 100, 600, 100, load, (v) => `${v} req/s`);
      qs("#c", card).append(
        N.seg(
          [
            ["up", "Scale up: 1 machine"],
            ["out", "Scale out: 3 machines"],
          ],
          mode,
          (v) => {
            mode = v;
            dead = false;
            draw();
          },
        ),
        sl,
      );
      const draw = () => {
        const caps = mode === "up" ? [REQ[0]] : REQ.slice(1);
        const cap = caps.reduce((a, c, i) => a + (dead && i === 0 ? 0 : c), 0),
          served = Math.min(load, cap);
        qs("#m", card).innerHTML = caps
          .map((c, i) => node(i, `Machine ${i + 1}`, `${c}`, dead && i === 0 ? "down" : "ok", "req/s"))
          .join("");
        qs("#s", card).innerHTML =
          `<div class="stat blue"><small>Capacity left</small><b>${cap}</b></div><div class="stat"><small>Load</small><b>${load}</b></div><div class="stat ${served < load ? "amber" : ""}"><small>Served</small><b>${served}</b></div>`;
        qs("#t", card).innerHTML = !cap
          ? "<b>Outage.</b> The only machine is down, so every request fails."
          : served < load
            ? `<b>Overloaded.</b> ${load - served} req/s are turned away because the survivors are full.`
            : dead
              ? "One machine is down but the others <b>carry on</b>: the service stays up."
              : "Every request is served.";
      };
      sl.onInput((v) => {
        load = v;
        draw();
      });
      qs("#x", card).onclick = () => {
        dead = true;
        draw();
      };
      qs("#r", card).onclick = () => {
        dead = false;
        draw();
      };
      draw();

      const c2 =
        el(`<div class="card"><div class="card-head"><h2>What does the capacity cost?</h2><span class="tag">made-up cost units</span></div>
        <div class="controls" id="c2"></div><div id="b"></div><p class="dim" id="t2"></p></div>`);
      root.appendChild(c2);
      const sc = N.slider("Capacity wanted", 200, 1600, 200, want, (v) => `${v} req/s`);
      qs("#c2", c2).appendChild(sc);
      const draw2 = () => {
        const up = (want / 200) ** 2,
          out = want / 200;
        qs("#b", c2).innerHTML = F.bars(
          [
            ["Scale up: one bigger machine", up, "amber"],
            ["Scale out: more machines", out, "teal"],
          ],
          { max: 64, unit: " units" },
        );
        qs("#t2", c2).innerHTML =
          `Four times the capacity costs <b>${up} units</b> up but only <b>${out}</b> out. Big machines get steeply dearer, and one machine is still one point of failure.`;
      };
      sc.onInput((v) => {
        want = v;
        draw2();
      });
      draw2();

      root.appendChild(
        predict({
          id: "ds4-scale-1",
          q: "The load is 600 req/s. In the scale-out setup (three machines of 200 req/s) one machine crashes. What happens?",
          opts: [
            "400 req/s are served and the rest are turned away",
            "Nothing is served: the whole cluster stops",
            "All 600 req/s are served, as the others absorb the load",
          ],
          a: 0,
          why: "Two machines of 200 keep working, so capacity falls to 400. The service degrades but stays up. With one big machine the same crash is a total outage.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds4-scale-2",
          q: "In the cost demo, the wanted capacity goes from 400 to 1,600 (four times). How do the costs change?",
          opts: [
            "Scale up about 16 times, scale out about 4 times",
            "Both about 4 times, as the capacity is 4 times larger",
            "Scale out grows faster, as every extra machine costs more",
          ],
          a: 0,
          why: "Costs of one ever-bigger machine do not scale linearly (4 units becomes 64), while adding machines grows roughly in step with the capacity (2 becomes 8).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Distribute when the <b>load</b> outgrows one machine, or when one machine's <b>failure</b> must not stop the service.",
            "<b>Scale up</b> (vertical, shared-memory): a bigger machine. Costs do not scale linearly and fault tolerance is limited.",
            "<b>Scale out</b> (horizontal, shared-nothing): more machines. Costs scale better and survivors carry on after a failure.",
            "Two ways to spread data: <b>replication</b> (a copy on each node) and <b>partitioning</b> (each node holds a subset).",
          ],
          "Scaling out buys cheaper capacity and survival of failures, at the price of a distributed system.",
        ),
      );
    },
  });
  L["ds4-scale"] = {
    sum: "Why one machine is not enough, scaling up versus out, and the two ways to spread data.",
    steps: [
      {
        t: "Beyond one machine",
        b: `<p>So far we ignored <i>where</i> data lives. Now several machines or storage devices are involved. Two reasons to spread out: the <b>load</b> may grow beyond what one machine handles, and the machine may <b>go down</b>.</p>`,
        v: F.flow(["Load grows", { t: "One machine is full", c: "amber" }, { t: "Spread across machines", c: "teal" }]),
        c: {
          q: "Which two problems push you from one machine to several?",
          o: [
            "Load beyond one machine, and a machine failing",
            "Data being too well organised, and queries being too fast",
            "Having too few columns, and too many indexes",
          ],
          a: 0,
          why: "A single machine has a ceiling on load and is a single point of failure.",
        },
      },
      {
        t: "From two boxes to a global network",
        b: `<p>A distributed system can be just <b>two machines on one power supply</b> or a worldwide <b>content delivery network</b> (CDN). Estimates for Netflix: <b>4,669 servers in 243 locations</b> (2016) grew to <b>8,492 servers in 578 locations</b> (2018).</p>`,
        v: F.bars(
          [
            ["Servers, 2016", 4669, "blue"],
            ["Servers, 2018", 8492, "teal"],
          ],
          { max: 9000 },
        ),
        c: {
          q: "Between 2016 and 2018 Netflix's estimated locations went from 243 to 578. That is...",
          o: ["More than double", "About the same", "Roughly half as many"],
          a: 0,
          why: "Twice 243 is 486, and 578 is more than that.",
        },
      },
      {
        t: "Scaling up or scaling out",
        b: `<p><b>Vertical scaling</b> (scale up, <i>shared-memory</i>): buy a bigger machine. Costs do not scale linearly, and fault tolerance is limited. <b>Horizontal scaling</b> (scale out, <i>shared-nothing</i>): add machines. Costs can scale better and fault tolerance is better.</p>`,
        v: F.compare(
          {
            title: "Vertical: scale up",
            c: "amber",
            body: "one bigger machine<br>cost climbs steeply<br>still one point of failure",
          },
          {
            title: "Horizontal: scale out",
            c: "teal",
            body: "many ordinary machines<br>cost grows more gently<br>survivors carry on",
          },
        ),
        c: {
          type: "cat",
          q: "Does each fact describe <b>scaling up</b> or <b>scaling out</b>?",
          buckets: ["Scaling up", "Scaling out"],
          items: [
            ["Shared-memory architecture", 0],
            ["Shared-nothing architecture", 1],
            ["Limited fault tolerance", 0],
            ["Costs can scale better", 1],
          ],
          why: "Vertical scaling is shared-memory with costs that rise steeply and limited fault tolerance. Horizontal scaling is shared-nothing with better costs and fault tolerance.",
        },
      },
      {
        t: "Replication or partitioning",
        b: `<p>Once data sits on several nodes there are two basic choices. <b>Replication</b>: keep a <b>copy</b> of the data in each node. <b>Partitioning</b>: each node stores a <b>subset</b> of the data, called a <b>partition</b>. This lecture is about replication.</p>`,
        v: F.compare(
          { title: "Replication", c: "blue", body: "node 1: everything<br>node 2: everything<br>node 3: everything" },
          { title: "Partitioning", c: "violet", body: "node 1: part A<br>node 2: part B<br>node 3: part C" },
        ),
        c: {
          q: "One node holds only customers A to M and another holds N to Z. Which approach is this?",
          o: ["Partitioning", "Replication"],
          a: 0,
          why: "Each node stores a different subset (a partition). With replication every node would hold all the customers.",
        },
      },
      {
        t: "What replication buys you",
        b: `<p>Each node stores a copy (a <b>replica</b>). That can cut <b>latency</b> (keep data geographically close to users), raise <b>availability</b> (carry on when parts fail) and raise <b>read performance</b> (more machines can serve read queries).</p>`,
        v: F.cells(
          [
            { v: "Latency", sub: "data near users", c: "blue" },
            { v: "Availability", sub: "survive failures", c: "teal" },
            { v: "Read speed", sub: "more machines read", c: "amber" },
          ],
          { size: 128 },
        ),
        c: {
          q: "Users in Asia keep reading from a database in Europe. What does adding a replica in Asia mainly improve?",
          o: ["Latency", "Write capacity", "Disk space per node"],
          a: 0,
          why: "A nearby copy shortens the trip for reads. It does not make writes scale or shrink the data each node must hold.",
        },
      },
      {
        t: "What replication costs",
        b: `<p>Two limits. Your data has to be <b>small enough for a single machine</b>, since every replica holds all of it. And <b>write operations must update all the copies</b>, so adding replicas does not speed up writes.</p>`,
        v: F.compare(
          { title: "Limit 1", c: "rose", body: "every node holds <b>all</b> the data, so it must fit on one machine" },
          { title: "Limit 2", c: "rose", body: "a write has to reach <b>every</b> copy" },
        ),
        c: {
          q: "A dataset is 40 TB and each machine has 10 TB of disk. Can replication alone solve the load problem?",
          o: ["No: every replica would need all 40 TB", "Yes: each replica keeps a quarter of it"],
          a: 0,
          why: "Replicas hold full copies, so the data must fit one machine. Splitting it across nodes is partitioning.",
        },
      },
    ],
    guide: [
      "In the first demo, switch between <b>scale up</b> and <b>scale out</b>, raise the load, and press <b>Crash a machine</b>.",
      "In the second demo, drag the capacity slider and compare the two costs.",
      "Answer the questions after the demos.",
    ],
  };

  /* ============ 4.2 Leaders and followers ============ */
  reg({
    id: "ds4-leader",
    order: 2,
    num: "4.2",
    title: "Leaders and followers",
    blurb: "One replica takes the writes and ships a log to the others, which serve reads.",
    render(root, life) {
      css();
      root.appendChild(header(this, ""));
      let latest = 1;
      const v = { Leader: 1, "Follower A": 1, "Follower B": 1 };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Change a profile picture</h2><span class="tag">replication is not instant</span></div>
        <div class="d4-row" id="n"></div><div class="controls"><button class="btn primary" id="w">Write to the leader</button><button class="btn" id="f">Try writing to Follower A</button></div>
        <div class="controls" id="rd"></div><p class="dim" id="t" style="min-height:44px">Press <b>Write to the leader</b>, then read from each node.</p></div>`);
      root.appendChild(card);
      const say = (h) => (qs("#t", card).innerHTML = h);
      const draw = () => {
        qs("#n", card).innerHTML = Object.entries(v)
          .map(([k, n]) =>
            node(
              k,
              k,
              `pic ${n}`,
              `${k === "Leader" ? "lead " : ""}${n === latest ? "ok" : "old"}`,
              k === "Leader" ? "takes writes" : "read-only",
            ),
          )
          .join("");
      };
      Object.keys(v).forEach((k) => {
        const b = el(`<button class="btn small">Read from ${k}</button>`);
        qs("#rd", card).appendChild(b);
        b.onclick = () =>
          say(
            `${k} returns <b>picture ${v[k]}</b>${v[k] < latest ? ` <span style="color:var(--rose-ink)">(out of date: the newest is ${latest})</span>` : ""}.`,
          );
      });
      qs("#w", card).onclick = () => {
        latest++;
        v.Leader = latest;
        const n = latest;
        life.timeout(() => ((v["Follower A"] = Math.max(v["Follower A"], n)), draw()), 700);
        life.timeout(() => ((v["Follower B"] = Math.max(v["Follower B"], n)), draw()), 1800);
        say(
          `The leader stored <b>picture ${n}</b> and sent the change down its replication log. Followers apply it a moment later.`,
        );
        draw();
      };
      qs("#f", card).onclick = () =>
        say("<b>Refused.</b> Followers are read-only: writes can only be sent to the leader.");
      draw();

      let nodes = 4,
        wr = 200;
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>Do more replicas speed things up?</h2><span class="tag">each machine does 1,000 operations a second</span></div>
        <div class="controls" id="c"></div><div id="b"></div><p class="dim" id="t2"></p></div>`);
      root.appendChild(c2);
      const sn = N.slider("Machines (1 leader + followers)", 1, 6, 1, nodes, (x) => x),
        sw = N.slider("Writes per second", 0, 900, 100, wr, (x) => x);
      qs("#c", c2).append(sn, sw);
      const d2 = () => {
        qs("#b", c2).innerHTML = F.bars(
          [
            ["Read capacity (per second)", nodes * (1000 - wr), "teal"],
            ["Write capacity (per second)", 1000, "amber"],
          ],
          { max: 6000 },
        );
        qs("#t2", c2).innerHTML =
          `Every machine must apply all <b>${wr}</b> writes, leaving <b>${1000 - wr}</b> operations for reads: ${nodes} × ${1000 - wr} = <b>${nodes * (1000 - wr)}</b> reads. Writes still all go through one leader.`;
      };
      sn.onInput((x) => ((nodes = x), d2()));
      sw.onInput((x) => ((wr = x), d2()));
      d2();

      root.appendChild(
        predict({
          id: "ds4-leader-1",
          q: "In the capacity demo there are 4 machines and 200 writes a second. About how many reads a second can the cluster serve?",
          opts: ["About 3,200", "About 800", "About 4,000"],
          a: 0,
          why: "Every machine applies the 200 writes, so each has about 800 left for reads: 4 × 800 = 3,200. Only the leader is not enough (800), and 4,000 forgets the cost of writes.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds4-leader-2",
          q: "In the profile demo, you press the button to write to Follower A. What happens?",
          opts: [
            "It is refused: writes go to the leader only",
            "It is accepted and copied up to the leader",
            "It is accepted by Follower A alone",
          ],
          a: 0,
          why: "One replica is the leader and only it takes writes. Followers receive the replication log and serve reads.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "One replica is the <b>leader</b>: <b>writes</b> go only to it, and it stores them locally.",
            "The leader sends each change to the <b>followers</b> in a <b>replication log</b>. They apply the same changes <b>in the same order</b>.",
            "<b>Reads</b> can go to any replica, so extra followers add read capacity. Writes still all pass through the leader.",
            "Built into many databases, such as PostgreSQL, MongoDB and MySQL.",
          ],
          "Writes go to the leader, the log carries them to the followers, and reads can go anywhere.",
        ),
      );
    },
  });
  L["ds4-leader"] = {
    sum: "Leader and followers, the replication log, and where reads and writes may go.",
    steps: [
      {
        t: "One leader",
        b: `<p>One of the replicas is designated the <b>leader</b>. A <b>write</b> is sent to the leader, which writes it to its <b>local storage</b>.</p>`,
        v: F.flow(["Client write", { t: "Leader", c: "blue" }, "Local storage"]),
        c: {
          q: "Where must a client send a write?",
          o: ["To the leader", "To any replica", "To every replica at once"],
          a: 0,
          why: "Only the leader takes writes. It then passes them on.",
        },
      },
      {
        t: "The replication log",
        b: `<p>The leader sends each update to the other replicas, the <b>followers</b>, as part of a <b>replication log</b>. Followers apply the same changes to their local copy, in the <b>same order</b>.</p>`,
        v: F.frames([
          { t: "Leader writes #1, #2, #3", v: `<div>${chip("#1")}${chip("#2")}${chip("#3")}</div>` },
          { t: "Log is sent to followers", v: `<div>→ → →</div>` },
          {
            t: "They replay it in order",
            v: `<div>${chip("#1", "new")}${chip("#2", "new")}${chip("#3", "new")}</div>`,
          },
        ]),
        c: {
          q: "Why must followers apply the log in the same order as the leader?",
          o: [
            "Another order could leave the copies different",
            "It keeps the log file as small as it can be",
            "Followers cannot read the entries any other way",
          ],
          a: 0,
          why: "Two updates to the same item give different results in a different order, so copies could end up differing.",
        },
      },
      {
        t: "Where reads and writes go",
        b: `<p><b>Read queries</b> can be sent to <b>any</b> replica. <b>Writes</b> can only be sent to the <b>leader</b>. Many DBMSs have this built in, including PostgreSQL, MongoDB and MySQL.</p>`,
        v: F.compare(
          { title: "Reads", c: "teal", body: "leader or any follower" },
          { title: "Writes", c: "blue", body: "the leader only" },
        ),
        c: {
          type: "cat",
          q: "Which node(s) may serve each request?",
          buckets: ["Any replica", "Leader only"],
          items: [
            ["Look up a user's profile", 0],
            ["Change a user's email address", 1],
            ["Show the list of recent posts", 0],
            ["Delete an old comment", 1],
          ],
          why: "Reads may go to any replica. Changes (writes) go to the leader.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Press <b>play</b> or step with the arrows. A write enters at the leader and travels down the log.</p>`,
        v: (box, life) => S.logRun(box, life),
      },
      {
        t: "Reads scale, writes do not",
        b: `<p>More followers mean more machines for <b>reads</b>. But every write must still be applied on <b>every</b> copy, so replication does not add write capacity.</p>`,
        v: F.bars(
          [
            ["Read capacity (6 machines)", 6000, "teal"],
            ["Write capacity (leader)", 1000, "amber"],
          ],
          { max: 6000 },
        ),
        c: {
          q: "A site has too many writes for one leader. Does adding followers help?",
          o: ["Not with writes: they all still go through the leader", "Yes: followers share the writes"],
          a: 0,
          why: "Followers add read capacity only, since each one applies every write.",
        },
      },
    ],
    guide: [
      "Press <b>Write to the leader</b>, then use the <b>Read from</b> buttons straight away and again after a moment.",
      "Press <b>Try writing to Follower A</b> to see what it does.",
      "In the capacity demo, drag the machines and writes sliders.",
      "Answer the questions after the demos.",
    ],
  };
})();
