/* Data Science (COM3021), Lecture 5: distributed architectures, partitioning.
   This part: shared helpers + ds5-why (5.1) and ds5-range (5.2). ds-l5-02 and -03 hold the other lessons. */
(function () {
  const S = (NIC.shared.dsL5 = NIC.shared.dsL5 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 5, ...m });

  /* ---------- styles (injected once, ds5- prefixed) ---------- */
  if (!document.getElementById("ds5-style")) {
    const st = document.createElement("style");
    st.id = "ds5-style";
    st.textContent = `
.ds5-nodes{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:8px 0}
.ds5-node{border:2px solid var(--line);border-radius:14px;padding:8px 10px;background:var(--panel-2);box-shadow:0 3px 0 var(--line);min-width:0}
.ds5-node h4{margin:0 0 6px;font-size:12.5px;font-weight:900;color:var(--text);display:flex;justify-content:space-between;gap:6px}
.ds5-node h4 small{font-weight:800;color:var(--text-faint)}
.ds5-node.down{opacity:.5;border-style:dashed}
.ds5-node.hit{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 10%,var(--panel-2))}
.ds5-node.hot{border-color:var(--rose)}
.ds5-node.fresh{border-color:var(--teal)}
.ds5-chips{display:flex;flex-wrap:wrap;gap:4px;min-height:24px}
.ds5-chip{font-size:11.5px;font-weight:800;padding:1px 6px;border-radius:8px;border:2px solid var(--line-2);background:var(--panel);color:var(--text)}
.ds5-chip.lead{border-color:var(--teal)}
.ds5-chip.fol{border-style:dashed;border-color:var(--blue)}
.ds5-chip.over{border-color:var(--rose);background:color-mix(in srgb,var(--rose) 14%,var(--panel))}
.ds5-chip.hit{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 22%,var(--panel))}
.ds5-chip.new{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 20%,var(--panel))}
.ds5-bar{height:10px;border-radius:6px;background:var(--bg-2);overflow:hidden;margin-top:6px}
.ds5-bar i{display:block;height:100%;width:100%;background:var(--teal);transform:scaleX(var(--w,0));transform-origin:left;transition:transform var(--dur-3) var(--ease-out)}
.ds5-bar i.hot{background:var(--rose)}
.ds5-lbl{font-size:12px;font-weight:900;color:var(--text-faint);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 2px}
button.ds5-chip{cursor:pointer;font-family:inherit}
.ds5-chip.sel{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 24%,var(--panel))}
.ds5-node.tgt{cursor:pointer}
.ds5-node:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.ds5-bar i{transition:none}}`;
    document.head.appendChild(st);
  }

  /* ---------- helpers shared with ds-l5-02, -03 and the workshop ---------- */
  const chip = (t, cls = "") => `<span class="ds5-chip mono ${cls}">${t}</span>`;
  const bar = (f, cls = "") =>
    `<div class="ds5-bar"><i class="${cls}" style="--w:${Math.max(0, Math.min(1, f))}"></i></div>`;
  /** One node card: n = {name, k?, sub?, chips: html[], cls?, extra?} */
  const nodeCard = (n) =>
    `<div class="ds5-node ${n.cls || ""}" data-k="${n.k || n.name}"><h4>${n.name}${n.sub ? `<small>${n.sub}</small>` : ""}</h4><div class="ds5-chips">${(n.chips || []).join("")}</div>${n.extra || ""}</div>`;
  const nodesHtml = (a) => `<div class="ds5-nodes">${a.map(nodeCard).join("")}</div>`;
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  /* ============ 5.1 Why partition ============ */
  const ITEMS = 12,
    NODES = 4,
    PER = 3,
    CAP = 8;
  function layout(mode) {
    const nodes = Array.from({ length: NODES }, () => []);
    for (let id = 1; id <= ITEMS; id++) {
      const p = Math.floor((id - 1) / PER);
      if (mode === "rep") nodes.forEach((n) => n.push({ id, role: "copy" }));
      else {
        nodes[p].push({ id, role: "lead" });
        if (mode === "both") nodes[(p + 1) % NODES].push({ id, role: "fol" });
      }
    }
    return nodes;
  }

  reg({
    id: "ds5-why",
    order: 1,
    num: "5.1",
    title: "Why partition?",
    blurb: "Copies are not enough for huge data. Split it into partitions, one subset per node.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let mode = "part",
        down = new Set();
      const card =
        el(`<div class="card"><div class="card-head"><h2>Twelve orders, four nodes</h2><span class="tag">each node has room for 8 orders</span></div>
        <div class="controls" id="m5"></div><div class="controls" id="d5"></div>
        <div id="cl"></div>
        <div class="stat-row"><div class="stat"><small>Copies of each order</small><b id="s1"></b></div><div class="stat amber"><small>Fullest node</small><b id="s2"></b></div><div class="stat blue"><small>Orders unavailable</small><b id="s3"></b></div></div>
        <p id="msg" class="dim" style="min-height:48px"></p></div>`);
      root.appendChild(card);
      qs("#m5", card).appendChild(
        N.seg(
          [
            ["rep", "Replication only"],
            ["part", "Partitioning only"],
            ["both", "Both"],
          ],
          mode,
          (v) => {
            mode = v;
            draw();
          },
        ),
      );
      const dd = qs("#d5", card);
      [1, 2, 3, 4].forEach((n) => {
        const b = el(`<button class="btn small" aria-pressed="false">Crash node ${n}</button>`);
        b.onclick = () => {
          down.has(n) ? down.delete(n) : down.add(n);
          b.setAttribute("aria-pressed", String(down.has(n)));
          b.textContent = down.has(n) ? `Restore node ${n}` : `Crash node ${n}`;
          draw();
        };
        dd.appendChild(b);
      });
      function draw() {
        const nodes = layout(mode);
        qs("#cl", card).innerHTML = nodesHtml(
          nodes.map((n, i) => ({
            name: `Node ${i + 1}`,
            sub: down.has(i + 1) ? "down" : `${n.length}/${CAP}`,
            cls: down.has(i + 1) ? "down" : n.length > CAP ? "hot" : "",
            chips: n.map((c, k) => chip(c.id, c.role === "fol" ? "fol" : k >= CAP ? "over" : "lead")),
          })),
        );
        const lost = [];
        for (let id = 1; id <= ITEMS; id++)
          if (!nodes.some((n, i) => !down.has(i + 1) && n.some((c) => c.id === id))) lost.push(id);
        const big = Math.max(...nodes.map((n) => n.length));
        qs("#s1", card).textContent = mode === "rep" ? NODES : mode === "both" ? 2 : 1;
        qs("#s2", card).textContent = `${big} of ${CAP}`;
        qs("#s2", card).style.color = big > CAP ? "var(--rose-ink)" : "";
        qs("#s3", card).textContent = lost.length;
        qs("#msg", card).innerHTML =
          big > CAP && !down.size
            ? "Every node needs <b>all 12</b> orders but only has room for 8: <b>exact copies do not fit</b>. The data must be split."
            : lost.length
              ? `Orders <b>${lost.join(", ")}</b> were only on crashed nodes: they are unavailable.`
              : mode === "both"
                ? "Each partition has a <b>leader</b> (solid) and a <b>follower</b> (dashed) on another node, so one crash loses nothing."
                : down.size
                  ? "Every order still has a live copy."
                  : "Each order sits in <b>exactly one</b> partition, and each node holds one partition: 3 orders each.";
      }
      draw();
      root.appendChild(
        predict({
          id: "ds5-why-1",
          q: "In the <b>Both</b> layout (each partition has a leader on one node and a follower on the next), nodes 1 and 3 crash together. What happens to the 12 orders?",
          opts: [
            "All 12 stay available: every partition still has a live copy",
            "Orders 1 to 3 and 7 to 9 become unavailable, since their leaders are down",
            "Every order becomes unavailable, because two of the four nodes are down",
          ],
          a: 0,
          why: "Node 1's partition has its follower on node 2, and node 3's partition has its follower on node 4. Node 4's partition has a follower on node 1, but its leader on node 4 is fine. Every partition keeps at least one live copy.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds5-why-2",
          q: "<b>Partitioning only</b>, one node crashes. How many of the 12 orders become unavailable?",
          opts: [
            "None, because the other nodes take over its data",
            "3 orders: the crashed node's partition",
            "All 12, since the whole cluster stops",
          ],
          a: 1,
          why: "With no replicas, a partition lives on just one node. The crashed node held 3 orders and nobody else has a copy. This is why partitioning is usually combined with replication.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Replication</b> keeps a full copy on each node. <b>Partitioning</b> gives each node a different <b>subset</b> (a partition).",
            "For very large datasets, exact copies are <b>not sufficient</b>: every node would still need to store everything.",
            "Each item belongs to <b>exactly one</b> partition, and a node can hold <b>several</b> partitions. Names: <b>shard</b>, <b>region</b>, <b>vnode</b>.",
            "Usually combined: each partition has a <b>leader</b> on one node and <b>followers</b> on others. The goal is to spread data and load <b>evenly</b>.",
          ],
          "Replication copies the whole; partitioning splits the whole; real systems do both.",
        ),
      );
    },
  });

  const FOL = (t) => chip(t, "fol"),
    LEAD = (t) => chip(t, "lead");
  L["ds5-why"] = {
    sum: "<b>Partitioning</b> splits a huge dataset into subsets, one per node. It is the answer when exact copies are too big, and it is combined with replication.",
    steps: [
      {
        t: "Two ways to spread data",
        b: `<p><b>Replication</b> keeps a copy of the data on each node. <b>Partitioning</b> gives different nodes different subsets of the data, called <b>partitions</b>.</p>`,
        v: F.compare(
          { title: "Replication", c: "blue", body: "every node holds <b>all</b> the data" },
          { title: "Partitioning", c: "teal", body: "every node holds <b>part</b> of the data" },
        ),
        c: {
          q: "A table of 10,000 customers is split so node A stores customers 1 to 5,000 and node B stores 5,001 to 10,000. What is this?",
          o: ["Partitioning", "Replication", "Neither: each node should hold all customers"],
          a: 0,
          why: "Each node stores a different subset, so these are two partitions. Replication would put all 10,000 customers on both nodes.",
        },
      },
      {
        t: "When copies are not enough",
        b: `<p>For <b>very large</b> datasets, exact copies on different nodes are <b>not sufficient</b>: each node must still store everything. A partitioned database stores different subsets on different nodes, so the data can be bigger than any one machine.</p>`,
        v: F.bars(
          [
            ["Whole dataset", 12, "rose", "TB"],
            ["One node's disk", 4, "blue", "TB"],
            ["One partition of 3", 4, "teal", "TB"],
          ],
          { max: 12 },
        ),
        c: {
          q: "A dataset is 12 TB and every node's disk holds 4 TB. How can a cluster of 3 such nodes store it?",
          o: [
            "Partitioning: about 4 TB on each node",
            "Replication: a full 12 TB copy on each node",
            "It cannot be stored on any number of nodes",
          ],
          a: 0,
          why: "A full copy needs 12 TB per node, which does not fit. Split into three partitions of about 4 TB, each node holds exactly one.",
        },
      },
      {
        t: "Same idea, different names",
        b: `<p>Databases do not agree on a name. A <b>shard</b> in MongoDB, Elasticsearch and Firestore, a <b>region</b> in HBase, a <b>vnode</b> in Cassandra: all are a partition.</p>`,
        v: F.cells(
          [
            { v: "shard", sub: "MongoDB, Elasticsearch, Firestore", c: "teal" },
            { v: "region", sub: "HBase", c: "blue" },
            { v: "vnode", sub: "Cassandra", c: "violet" },
          ],
          { size: 150 },
        ),
        c: {
          type: "match",
          q: "Match each system to its name for a partition.",
          pairs: [
            ["Cassandra", "vnode"],
            ["HBase", "region"],
            ["MongoDB", "shard"],
          ],
          why: "Cassandra says vnode, HBase says region, MongoDB (and Elasticsearch, Firestore) say shard.",
        },
      },
      {
        t: "One item, one partition",
        b: `<p>Each node stores a subset (a partition), and a node can store <b>more than one</b>. Each piece of data belongs to <b>exactly one</b> partition. The point is <b>scalability</b>: the query load is spread across nodes.</p>`,
        v: nodesHtml([
          { name: "Node 1", chips: [LEAD("P1"), LEAD("P2")] },
          { name: "Node 2", chips: [LEAD("P3")] },
          { name: "Node 3", chips: [LEAD("P4"), LEAD("P5")] },
        ]),
        c: {
          q: "Which statement is true for a partitioned database?",
          o: [
            "Each record is in exactly one partition; a node may hold several",
            "A record is stored in every partition so any node can answer",
            "Each node must hold exactly one partition, never more than one",
          ],
          a: 0,
          why: "Partitions do not overlap, so each record is in one partition. But nothing limits a node to a single partition.",
        },
      },
      {
        t: "Partitions plus replication",
        b: `<p>Partitioning is often combined with replication. With <b>leader-followers</b>, each partition's <b>leader</b> sits on one node while its <b>followers</b> sit on other nodes. So one node can be the leader for some partitions and a follower for others.</p>`,
        v: nodesHtml([
          { name: "Node 1", chips: [LEAD("P1"), FOL("P3")] },
          { name: "Node 2", chips: [LEAD("P2"), FOL("P1")] },
          { name: "Node 3", chips: [LEAD("P3"), FOL("P2")] },
        ]),
        c: {
          q: "Node 1 is the leader for P1 and a follower for P3, as in the picture. Node 1 crashes. What happens to the data in P1?",
          o: [
            "It survives: a follower of P1 on another node can take over",
            "It is lost, because the leader held the only copy",
            "It survives only if P3 is promoted instead",
          ],
          a: 0,
          why: "P1 has a follower on node 2, so that copy can be promoted to leader. P3 simply loses one follower, which can be rebuilt.",
        },
      },
      {
        t: "Spread it evenly",
        b: `<p>The goal is to spread the <b>data</b> and the <b>query load</b> evenly. If the partitioning is fair, 10 nodes handle about 10 times as much data and load as one (ignoring replication and overhead). If not, it is <b>skewed</b>: some nodes take far more, and a node that is much busier than the rest is a <b>hot spot</b>.</p>`,
        v: F.compare(
          { title: "Fair", c: "teal", body: "4 nodes: 25% 25% 25% 25% of requests" },
          { title: "Skewed", c: "rose", body: "4 nodes: <b>85%</b> 5% 5% 5%: the first node is a hot spot" },
        ),
        c: {
          q: "With perfectly fair partitioning and no replication, 10 nodes can handle roughly how much load compared with 1 node?",
          o: ["1 times", "10 times", "100 times"],
          a: 1,
          why: "Fair partitioning shares the work equally, so 10 nodes handle about 10 times as much. Skew breaks this: the busiest node limits the whole cluster.",
        },
      },
    ],
    guide: [
      "Switch between <b>Replication only</b>, <b>Partitioning only</b> and <b>Both</b> and read the fullest node.",
      "Press <b>Crash node 1</b> in each layout and check the orders unavailable.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 5.2 Key ranges and hot spots ============ */
  const RNG = [
    ["A–F", "A".charCodeAt(0), "F".charCodeAt(0)],
    ["G–M", 71, 77],
    ["N–S", 78, 83],
    ["T–Z", 84, 90],
  ];
  const SURN =
    "Adams Baker Chen Davies Evans Fox Green Hughes Ibrahim Jones Khan Lewis Morgan Nolan Owen Patel Quinn Rao Singh Taylor Usman Vance Walsh Young".split(
      " ",
    );
  const nodeOfName = (s) => RNG.findIndex((r) => s.charCodeAt(0) >= r[1] && s.charCodeAt(0) <= r[2]);
  const HOURS = ["00–05", "06–11", "12–17", "18–23"];
  const pad = (n) => String(n).padStart(2, "0");

  function routeRun(box, life) {
    const WR = ["14:02", "14:09", "14:13", "14:21", "14:34", "14:50"];
    F.run(box, life, {
      code: [
        "a write arrives with its timestamp as the key",
        "compare the key with each partition's range",
        "send the write to that partition",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const cnt = [0, 0, 0, 0];
        const snap = (x) => ({ cnt: cnt.slice(), key: "", to: -1, ...x });
        yield snap({
          cap: "Four nodes, each owning a <b>range of timestamps</b> (hours of the day). It is now 14:00 and writes are arriving.",
          line: 0,
        });
        for (let i = 0; i < WR.length; i++) {
          const to = Math.floor(+WR[i].slice(0, 2) / 6);
          cnt[to]++;
          const f = snap({
            key: WR[i],
            to,
            cap: `Write keyed <b>${WR[i]}</b>: that falls in <b>${HOURS[to]}</b>, so it goes to <b>Node ${to + 1}</b>.`,
            line: 1,
          });
          if (i === 0)
            f.ask = {
              q: "A write arrives with key 14:02. Tap the node whose range covers it.",
              pick: ".ds5-node",
              a: ["N3"],
              why: "14:02 lies in 12–17, which is Node 3's range.",
            };
          yield f;
        }
        yield snap({
          cap: "All six writes landed on <b>Node 3</b>. The key order follows the arrival order, so the newest range takes every write: a <b>hot spot</b>.",
          line: 2,
        });
      },
      draw(sc, f) {
        const mx = Math.max(1, ...f.cnt);
        sc.innerHTML = `${f.key ? `<div class="faint" style="font-weight:800;margin-bottom:4px">Incoming write: key <b class="mono">${f.key}</b></div>` : ""}${nodesHtml(
          f.cnt.map((c, i) => ({
            name: `Node ${i + 1}`,
            k: `N${i + 1}`,
            sub: HOURS[i],
            cls: f.to === i ? "hit" : c && c === mx && c > 3 ? "hot" : "",
            chips: [chip(`${c} writes`)],
            extra: bar(c / 6, c > 3 ? "hot" : ""),
          })),
        )}`;
      },
    });
  }

  reg({
    id: "ds5-range",
    order: 2,
    num: "5.2",
    title: "Key ranges and hot spots",
    blurb: "Give each partition a range of sorted keys. Range queries are cheap, but the wrong key makes a hot spot.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let mode = "time",
        clock = 14,
        tot = [0, 0, 0, 0],
        n = 0;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Send writes to four nodes</h2><span class="tag">partitioned by key range</span></div>
        <div class="controls" id="k5"></div>
        <div class="controls"><button class="btn primary" id="w8">Send 8 writes</button><button class="btn" id="adv">Move the clock on 6 hours</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="cl"></div>
        <div class="stat-row"><div class="stat"><small>Writes sent</small><b id="s1">0</b></div><div class="stat amber"><small>Busiest node's share</small><b id="s2">-</b></div><div class="stat blue"><small>Idle nodes</small><b id="s3">-</b></div></div>
        <p id="msg" class="dim" style="min-height:48px"></p></div>`);
      root.appendChild(card);
      qs("#k5", card).appendChild(
        N.seg(
          [
            ["time", "Key = timestamp"],
            ["name", "Key = customer surname"],
          ],
          mode,
          (v) => {
            mode = v;
            reset();
          },
        ),
      );
      function draw(msg) {
        const mx = Math.max(1, ...tot);
        qs("#cl", card).innerHTML = nodesHtml(
          tot.map((c, i) => ({
            name: `Node ${i + 1}`,
            sub: mode === "time" ? HOURS[i] : RNG[i][0],
            cls: n > 8 && c / n > 0.5 ? "hot" : "",
            chips: [chip(`${c} writes`)],
            extra: bar(c / mx, n > 8 && c / n > 0.5 ? "hot" : ""),
          })),
        );
        qs("#s1", card).textContent = n;
        qs("#s2", card).textContent = n ? pct(Math.max(...tot), n) + "%" : "-";
        qs("#s3", card).textContent = n ? tot.filter((c) => !c).length : "-";
        qs("#msg", card).innerHTML =
          msg ||
          (mode === "time"
            ? `The clock reads <b>${pad(clock)}:xx</b>. Press <b>Send 8 writes</b>.`
            : "Surnames arrive in no particular order. Press <b>Send 8 writes</b>.");
        qs("#adv", card).hidden = mode !== "time";
      }
      function reset() {
        tot = [0, 0, 0, 0];
        n = 0;
        draw();
      }
      qs("#w8", card).onclick = () => {
        for (let i = 0; i < 8; i++) {
          const to = mode === "time" ? Math.floor(clock / 6) : nodeOfName(SURN[Math.floor(N.rnd() * SURN.length)]);
          tot[to]++;
          n++;
        }
        const top = tot.indexOf(Math.max(...tot));
        draw(
          mode === "time"
            ? `Every key is a timestamp near <b>${pad(clock)}:xx</b>, so every write goes to <b>Node ${top + 1}</b>. The other nodes sit idle: a <b>write hot spot</b>.`
            : `Surnames fall into all four ranges, so writes are <b>spread</b>. The ranges are not even in the alphabet but hold similar amounts of data.`,
        );
      };
      qs("#adv", card).onclick = () => {
        clock = (clock + 6) % 24;
        draw(
          `The clock moved on to <b>${pad(clock)}:xx</b>. Now a <b>different</b> node takes every write, but still only one.`,
        );
      };
      qs("#rs", card).onclick = reset;
      draw();
      root.appendChild(
        predict({
          id: "ds5-range-1",
          q: "Key = timestamp, clock at 14:xx, and you send 40 writes. What share of them does the busiest node take?",
          opts: ["About 25%, one quarter each", "About 50%", "All 100%"],
          a: 2,
          why: "Every new write has the current time as its key, and the current time lies inside a single node's range. The other three ranges are in the past or the future, so they get nothing.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds5-range-2",
          q: "Why did switching the key to the <b>customer surname</b> spread the writes out?",
          opts: [
            "Surnames arrive in no particular order, so they spread across ranges",
            "Surname mode added extra nodes to share the load",
            "Surnames are hashed before they are stored, which spreads them",
          ],
          a: 0,
          why: "The key order no longer follows the arrival order. Each new customer falls anywhere in the alphabet, so every range receives writes.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Key-range partitioning</b>: each partition owns a continuous range of <b>sorted</b> keys, like the volumes of a paper encyclopaedia.",
            "The ranges are <b>not evenly spaced</b>: boundaries follow the data so each partition holds a similar amount.",
            "Sorted keys make <b>range queries</b> cheap: neighbouring keys sit in the same partition.",
            "Danger: if the key order follows the arrival order (a <b>timestamp</b>), all new writes hit one partition: a <b>write hot spot</b>.",
          ],
          "Sorted ranges keep neighbours together, which is great for scans and terrible when everyone writes at the end.",
        ),
      );
    },
  });

  Object.assign(S, { reg, chip, bar, nodeCard, nodesHtml, pct, LEAD, FOL, RNG, routeRun });
})();
