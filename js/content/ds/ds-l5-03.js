/* Data Science Lecture 5, part 3: ds5-rebalance (5.5) rebalancing: fixed vs dynamic partitions. */
(function () {
  const S = NIC.shared.dsL5 || {};
  const { reg, chip, bar, nodesHtml, RNG, routeRun } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  const P = 12;
  const LET = "ABCDEF";

  /** Step-through: a fourth node joins a cluster of 12 fixed partitions and steals whole partitions. */
  function stealRun(box, life) {
    F.run(box, life, {
      code: [
        "a new node joins, empty",
        "find the node with the most partitions",
        "move one whole partition to the new node",
        "repeat until the new node has a fair share",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const own = Array.from({ length: P }, (_, p) => "ABC"[p % 3]);
        const cnt = (n) => own.filter((x) => x === n).length;
        const snap = (x) => ({ own: own.slice(), nodes: x.nodes || "ABC", moved: -1, ...x });
        yield snap({
          cap: "Three nodes hold <b>12 partitions</b>, four each. The partitions are fixed: the count never changes.",
          line: 0,
        });
        yield snap({
          nodes: "ABCD",
          cap: "<b>Node D</b> joins, empty. It must take its fair share: 12 / 4 = <b>3</b> partitions.",
          line: 0,
        });
        for (let s = 0; s < 3; s++) {
          const mx = Math.max(...["A", "B", "C"].map(cnt)),
            top = ["A", "B", "C"].filter((n) => cnt(n) === mx);
          const from = top[0],
            p = own.lastIndexOf(from);
          own[p] = "D";
          const f = snap({
            nodes: "ABCD",
            moved: p,
            line: 2,
            cap: `D steals <b>P${p}</b> from <b>Node ${from}</b>, which had the most (${mx}). Only the <b>whole partition</b> moves.`,
          });
          if (s < 2)
            f.ask = {
              q: "Which node should Node D take its next partition from? Tap the node with the most partitions.",
              pick: ".ds5-node",
              a: top.map((n) => `N${n}`),
              why: "Taking from the fullest node evens the load out with the fewest moves.",
            };
          yield f;
        }
        yield snap({
          nodes: "ABCD",
          cap: "Done: <b>3 of 12</b> partitions moved and every node holds 3. The partitions and the key-to-partition assignment did not change.",
          line: 3,
        });
      },
      draw(sc, f) {
        sc.innerHTML = nodesHtml(
          [...f.nodes].map((n) => ({
            name: `Node ${n}`,
            k: `N${n}`,
            sub: `${f.own.filter((x) => x === n).length} partitions`,
            cls: n === "D" ? "fresh" : "",
            chips: f.own.map((o, p) => (o === n ? chip(`P${p}`, p === f.moved ? "new" : "lead") : "")).filter(Boolean),
          })),
        );
      },
    });
  }

  reg({
    id: "ds5-rebalance",
    order: 5,
    num: "5.5",
    title: "Rebalancing partitions",
    blurb: "Nodes join and leave. Move as little as possible: fixed partitions steal, dynamic ones split and merge.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let mode = "fixed",
        nodes = ["A", "B", "C"],
        total = 0,
        last = null,
        movedSet = new Set(),
        own = [];
      const assign = () =>
        mode === "mod" ? Array.from({ length: P }, (_, k) => nodes[k % nodes.length]) : own.slice();
      const reset = () => {
        nodes = ["A", "B", "C"];
        total = 0;
        last = null;
        movedSet = new Set();
        own = Array.from({ length: P }, (_, p) => nodes[p % 3]);
        draw();
      };
      const card =
        el(`<div class="card"><div class="card-head"><h2>A node joins the cluster</h2><span class="tag">12 items on 3 nodes</span></div>
        <div class="controls" id="m"></div>
        <div class="controls"><button class="btn primary" id="add">Add a node</button><button class="btn" id="rm">Remove the newest node</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="cl"></div>
        <div class="stat-row"><div class="stat"><small>Moved by the last change</small><b id="s1">-</b></div><div class="stat amber"><small>Moved in total</small><b id="s2">0</b></div></div>
        <p id="msg" class="dim" style="min-height:48px">Press <b>Add a node</b>.</p></div>`);
      root.appendChild(card);
      qs("#m", card).appendChild(
        N.seg(
          [
            ["fixed", "Fixed partitions"],
            ["mod", "Hash mod N"],
          ],
          mode,
          (v) => {
            mode = v;
            reset();
            qs("#s1", card).textContent = "-";
            qs("#s2", card).textContent = "0";
          },
        ),
      );
      function change(add) {
        if (add ? nodes.length >= 6 : nodes.length <= 2) return;
        const before = assign();
        if (add) {
          nodes = nodes.concat([...LET].find((c) => !nodes.includes(c)));
          if (mode === "fixed") {
            const nw = nodes[nodes.length - 1],
              want = Math.floor(P / nodes.length),
              cnt = (n) => own.filter((x) => x === n).length;
            while (cnt(nw) < want) {
              const from = nodes.slice(0, -1).reduce((a, b) => (cnt(b) > cnt(a) ? b : a));
              own[own.lastIndexOf(from)] = nw;
            }
          }
        } else {
          const gone = nodes.pop();
          if (mode === "fixed")
            own.forEach((o, p) => {
              if (o === gone)
                own[p] = nodes.reduce((a, b) =>
                  own.filter((x) => x === b).length < own.filter((x) => x === a).length ? b : a,
                );
            });
        }
        const after = assign();
        movedSet = new Set(after.map((a, k) => (a !== before[k] ? k : -1)).filter((k) => k >= 0));
        last = movedSet.size;
        total += last;
        draw();
      }
      function draw() {
        const a = assign();
        qs("#cl", card).innerHTML = nodesHtml(
          nodes.map((n) => ({
            name: `Node ${n}`,
            sub: `${a.filter((x) => x === n).length} items`,
            chips: a
              .map((o, k) =>
                o === n ? chip(mode === "fixed" ? `P${k}` : `k${k}`, movedSet.has(k) ? "new" : "lead") : "",
              )
              .filter(Boolean),
          })),
        );
        qs("#s1", card).textContent = last === null ? "-" : `${last} of ${P}`;
        qs("#s2", card).textContent = total;
        if (last !== null)
          qs("#msg", card).innerHTML =
            mode === "mod"
              ? `Each key's node is <b>key mod ${nodes.length}</b>. Changing the node count changes the answer for most keys, so <b>${last} of ${P}</b> had to move (highlighted).`
              : `Only whole partitions moved (highlighted): <b>${last} of ${P}</b>. The partition count and the key-to-partition mapping never changed.`;
        qs("#add", card).disabled = nodes.length >= 6;
        qs("#rm", card).disabled = nodes.length <= 2;
      }
      qs("#add", card).onclick = () => change(true);
      qs("#rm", card).onclick = () => change(false);
      qs("#rs", card).onclick = () => {
        reset();
        qs("#msg", card).innerHTML = "Press <b>Add a node</b>.";
      };
      reset();

      /* --- dynamic partitioning --- */
      const LIMIT = 10;
      let sz = [6, 8, 4];
      const f1 = (x) => Number(x.toFixed(1));
      const card2 =
        el(`<div class="card"><div class="card-head"><h2>Dynamic partitions</h2><span class="tag">split above 10 GB</span></div>
        <div class="controls"><button class="btn primary" id="gr">Add 4 GB to every partition</button><button class="btn" id="sh">Delete half of the data</button></div>
        <div id="cl"></div>
        <div class="stat-row"><div class="stat"><small>Partitions</small><b id="c1"></b></div><div class="stat amber"><small>Largest</small><b id="c2"></b></div></div>
        <p id="msg" class="dim" style="min-height:48px"></p></div>`);
      root.appendChild(card2);
      function draw2(msg) {
        qs("#cl", card2).innerHTML = nodesHtml(
          sz.map((g, i) => ({
            name: `Part ${i + 1}`,
            sub: `${f1(g)} GB`,
            cls: g > LIMIT ? "hot" : "",
            extra: bar(g / LIMIT, g > LIMIT ? "hot" : ""),
          })),
        );
        qs("#c1", card2).textContent = sz.length;
        qs("#c2", card2).textContent = `${f1(Math.max(...sz))} GB`;
        qs("#msg", card2).innerHTML = msg || "Grow the data and watch big partitions <b>split in two</b>.";
      }
      qs("#gr", card2).onclick = () => {
        sz = sz.map((g) => g + 4);
        const n0 = sz.length;
        sz = sz.flatMap((g) => (g > LIMIT ? [g / 2, g / 2] : [g]));
        const k = sz.length - n0;
        draw2(
          k
            ? `<b>${k}</b> partition${k > 1 ? "s were" : " was"} over ${LIMIT} GB and split into two halves. Each half can live on a different node.`
            : "Every partition is still within the limit: nothing to split.",
        );
      };
      qs("#sh", card2).onclick = () => {
        sz = sz.map((g) => g / 2);
        const n0 = sz.length;
        for (let i = 0; i < sz.length;) {
          if (i + 1 < sz.length && sz[i] + sz[i + 1] < 7) {
            sz[i] += sz[i + 1];
            sz.splice(i + 1, 1);
          } else i++;
        }
        const k = n0 - sz.length;
        draw2(
          k
            ? `The data shrank, so <b>${k}</b> pair${k > 1 ? "s" : ""} of small neighbours merged (here: together under 7 GB).`
            : "Smaller, but no neighbours were small enough to merge.",
        );
      };
      draw2();

      root.appendChild(
        predict({
          id: "ds5-rebalance-1",
          q: "<b>Fixed partitions</b>: 12 partitions are spread over 4 nodes, 3 each. A fifth node joins. About how many partitions move?",
          opts: ["2", "9", "12"],
          a: 0,
          why: "Fair share is 12 / 5, about 2, so the new node steals 2 whole partitions. Hash mod N would have moved most of the keys.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds5-rebalance-2",
          q: "With dynamic partitioning and a 10 GB limit, a partition grows to 14 GB. What happens?",
          opts: [
            "It splits into two partitions of about 7 GB each",
            "It is deleted and recreated",
            "Nothing: partitions can grow without limit",
          ],
          a: 0,
          why: "Partitions over the limit are split in two, and each half can be stored on a different node. When data shrinks, neighbours can merge back.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Rebalancing</b> moves data and load between nodes when throughput or data grows, or a machine fails.",
            "Afterwards load must be <b>fair</b>, reads and writes must <b>keep working</b> during it, and <b>no more data than necessary</b> may move.",
            "<b>Fixed number of partitions</b>: create many more than nodes. A new node <b>steals whole partitions</b>; the count and key assignment never change.",
            "<b>Dynamic partitioning</b>: a partition over a size limit (for example 10 GB) <b>splits in two</b>; small neighbours can <b>merge</b>.",
          ],
          "Move whole partitions, not individual keys: that is how a cluster grows without reshuffling everything.",
        ),
      );
    },
  });

  L["ds5-rebalance"] = {
    sum: "<b>Rebalancing</b> moves data and load between nodes. With <b>fixed partitions</b> a new node steals whole partitions; with <b>dynamic partitioning</b> big partitions split and small ones merge.",
    steps: [
      {
        t: "Things change",
        b: `<p>A cluster never stays still: the <b>query throughput</b> increases, the <b>dataset size</b> grows, or a <b>machine fails</b>. Moving data and load from one node to another is called <b>rebalancing</b>.</p>`,
        v: F.cells(
          [
            { v: "more traffic", sub: "throughput up", c: "amber" },
            { v: "more data", sub: "dataset grows", c: "blue" },
            { v: "node fails", sub: "others take over", c: "rose" },
          ],
          { size: 130 },
        ),
        c: {
          q: "Which of these is a reason to rebalance a partitioned cluster?",
          o: [
            "A machine fails and others must take over its partitions",
            "A user logs in from a new country and needs a nearby server",
            "A query returns an empty result set for a missing key",
          ],
          a: 0,
          why: "Rebalancing responds to changes in cluster capacity or demand: more load, more data, or fewer working machines.",
        },
      },
      {
        t: "Three requirements",
        b: `<p>After rebalancing, the load (data storage, reads and writes) should be shared <b>fairly</b>. While it happens, the database should <b>keep accepting reads and writes</b>. And <b>no more data than necessary</b> should move, to keep it fast and to limit network and disk I/O.</p>`,
        v: F.cells(
          [
            { v: "fair load", sub: "after", c: "teal" },
            { v: "stays online", sub: "during", c: "blue" },
            { v: "minimal moves", sub: "always", c: "violet" },
          ],
          { size: 130 },
        ),
        c: {
          q: "Which plan breaks the rebalancing requirements?",
          o: [
            "Refuse all writes for an hour while every record is copied to a new node",
            "Move a few whole partitions while the cluster keeps serving requests",
            "Move only the partitions the new node needs",
          ],
          a: 0,
          why: "The database must keep accepting reads and writes during the move, and only the necessary data should be copied.",
        },
      },
      {
        t: "The trap: hash mod N",
        b: `<p>A tempting way to pick a node is <b>node = hash mod N</b>: deal the keys round the nodes like cards. It works until <b>N changes</b>. The rule itself contains N, so when a node joins, almost every key gets a new answer even though no key changed.</p><p>Example: 12 keys with hashes 0 to 11 on 3 nodes. Key 7 leaves remainder 1 when divided by 3, so it lives on node B. With 4 nodes the remainder is 3, so it jumps to node D. Only keys 0, 1 and 2 stay put: <b>9 of 12</b> keys move, when only 3 had to go to the new node. Try the other buttons.</p><details class="math-more"><summary>Show the maths</summary><p>The key with hash $h$ goes to node $h \\bmod N$. It stays put only if $h \\bmod 3 = h \\bmod 4$, which holds just for $h = 0, 1, 2$.</p><table class="t"><tr><th>Key hash</th><th>mod 3</th><th>mod 4</th><th>moves?</th></tr>${Array.from({ length: 12 }, (_, k) => `<tr class="${k % 3 === k % 4 ? "" : "bad"}"><td>${k}</td><td>${k % 3}</td><td>${k % 4}</td><td>${k % 3 === k % 4 ? "no" : "yes"}</td></tr>`).join("")}</table></details>`,
        v: (box, life) => NIC.shared.ds.plain.mod(box, life),
        c: {
          q: 'Why does the rule "node = hash mod N" move so much data when a node is added?',
          o: [
            "N is part of the formula, so most keys get a new answer",
            "New nodes always have to copy the whole database",
            "Hash values are recomputed from scratch",
          ],
          a: 0,
          why: "A key's node depends on N. Change N and most keys now point at a different node, even though nothing else changed.",
        },
      },
      {
        t: "A fixed number of partitions",
        b: `<p>Create <b>many more partitions than nodes</b>, for example 1,000 partitions on a 10-node cluster: each node handles 100. A new node <b>steals</b> some partitions from the others. Only <b>entire partitions</b> move. The number of partitions does not change, nor does the assignment of keys to partitions.</p>`,
        v: F.flow([
          { t: "10 nodes", s: "100 partitions each", c: "blue" },
          { t: "node 11 joins", s: "steals whole partitions", c: "amber" },
          { t: "about 91 each", s: "1,000 / 11", c: "teal" },
        ]),
        c: {
          q: "1,000 partitions run on 10 nodes and an 11th node joins. What stays exactly the same?",
          o: [
            "Which partition each key belongs to",
            "The number of partitions on every old node",
            "The node that stores each partition",
          ],
          a: 0,
          why: "Keys still map to the same partitions, and only whole partitions move. Old nodes lose some partitions and some partitions change node.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Twelve partitions on three nodes, and a new node joins. Step through and see where its partitions come from.</p>`,
        v: (box, life) => stealRun(box, life),
      },
      {
        t: "Dynamic partitioning",
        b: `<p>If a partition grows beyond a size (for example <b>10 GB</b>), it is <b>split in two</b>, and each half can live on a different node. If the data shrinks, partitions can <b>merge</b>. The partition count follows the size of the data.</p>`,
        v: F.flow([
          { t: "12 GB", s: "over the 10 GB limit", c: "rose" },
          { t: "split", s: "6 GB + 6 GB", c: "amber" },
          { t: "two nodes", s: "one half each", c: "teal" },
        ]),
        c: {
          type: "order",
          q: "Put the life of a dynamic partition in order.",
          items: [
            "Writes make the partition grow",
            "It passes the size limit",
            "It splits into two halves",
            "One half can move to another node",
          ],
          hint: "It has to get big before it is split, and a split happens before halves move.",
          why: "Growth triggers the split. After the split each half is a separate partition, so one can be placed on a different node.",
        },
      },
    ],
    guide: [
      "In <b>Fixed partitions</b>, press <b>Add a node</b> twice and read how many items moved.",
      "Switch to <b>Hash mod N</b>, add a node and compare.",
      "In <b>Dynamic partitions</b>, press <b>Add 4 GB</b> a few times, then <b>Delete half</b>. Answer the questions after the demo.",
    ],
  };

  L["ds5-range"] = {
    sum: "<b>Key-range partitioning</b> gives each partition a continuous range of sorted keys. Range queries are efficient, but arrival-ordered keys such as timestamps create write hot spots.",
    steps: [
      {
        t: "Like an encyclopaedia",
        b: `<p>One way to partition is to give each partition a <b>continuous range of keys</b>, like the volumes of a paper encyclopaedia: <i>A to F</i> on volume 1, and so on. To find a key you check which range it falls in.</p>`,
        v: F.cells(
          RNG.map((r, i) => ({ v: r[0], sub: `Node ${i + 1}`, c: ["teal", "blue", "violet", "amber"][i] })),
          { size: 90, label: "Surnames" },
        ),
        c: {
          q: "Surnames are split into the ranges A–F, G–M, N–S and T–Z, one per node. Which node stores <b>Okafor</b>?",
          o: ["The A–F node", "The G–M node", "The N–S node"],
          a: 2,
          why: "O comes between N and S, so Okafor belongs to the third range.",
        },
      },
      {
        t: "Ranges need not be even",
        b: `<p>The ranges are <b>not evenly spaced</b>. If the alphabet is cut into equal slices, popular letters make some partitions huge. So the boundaries are chosen to fit the <b>data</b>, giving each partition about the same amount.</p>`,
        v: F.bars(
          [
            ["Equal letters, A–F", 18, "teal", "% of records"],
            ["Equal letters, G–M", 31, "amber", "%"],
            ["Equal letters, N–S", 40, "rose", "%"],
            ["Equal letters, T–Z", 11, "blue", "%"],
          ],
          { max: 40 },
        ),
        c: {
          q: "Why would a database choose uneven key ranges?",
          o: [
            "So each partition holds about the same amount of data",
            "So every range covers the same number of letters",
            "Because keys cannot be sorted into equal ranges",
          ],
          a: 0,
          why: "The aim is a fair split of data and load. Equal-width ranges ignore how the keys are really distributed.",
        },
      },
      {
        t: "Sorted keys help range queries",
        b: `<p>Keys inside a partition are <b>sorted</b>, and neighbouring keys sit together. A query for all keys between two values usually touches <b>one or two</b> partitions, not the whole cluster.</p>`,
        v: F.flow([
          { t: "query", s: "Khan to Mills", c: "violet" },
          { t: "range G–M", s: "contains both ends", c: "blue" },
          { t: "1 node asked", s: "contiguous scan", c: "teal" },
        ]),
        c: {
          q: "Ranges are A–F, G–M, N–S and T–Z. A query asks for all surnames from <b>Khan</b> to <b>Mills</b>. How many partitions must be searched?",
          o: ["1", "2", "4"],
          a: 0,
          why: "Both Khan and Mills fall in G–M, and every key in between does too, so a single partition holds them all.",
        },
      },
      {
        t: "The timestamp trap",
        b: `<p>With <b>sorted</b> keys, a problem appears when the key order <b>follows the order the data arrives</b>, for example a <b>timestamp</b>. All new writes carry the newest timestamps, so they all go to the <b>same</b> partition while the rest sit idle: a <b>write hot spot</b>.</p>`,
        v: F.bars(
          [
            ["Node 1, 00–05", 0, "dim", "writes"],
            ["Node 2, 06–11", 0, "dim", "writes"],
            ["Node 3, 12–17 (now 14:00)", 100, "rose", "writes"],
            ["Node 4, 18–23", 0, "dim", "writes"],
          ],
          { max: 100 },
        ),
        c: {
          q: "Sensors write readings keyed by timestamp into hourly ranges, one node per range. At 09:30, which node takes the writes?",
          o: [
            "Only the node whose range includes 09:30",
            "All the nodes in turn, one write each",
            "The node with the most free disk space",
          ],
          a: 0,
          why: "Each reading's key is the current time, so it falls into the one range that contains the current time.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Writes arrive with timestamp keys. Press <b>play</b> or step with the arrows, and watch where each one lands.</p>`,
        v: (box, life) => routeRun(box, life),
      },
      {
        t: "Good and bad",
        b: `<p>Key-range partitioning keeps keys <b>sorted</b> and neighbours together, which suits range queries. The cost: ranges must be chosen with care, and if the key order follows the arrival order you get <b>hot spots</b>.</p>`,
        v: F.compare(
          { title: "Strength", c: "teal", body: "sorted keys, cheap range queries" },
          { title: "Weakness", c: "rose", body: "uneven ranges, write hot spots with timestamp keys" },
        ),
        c: {
          type: "cat",
          q: "Is each point a <b>strength</b> or a <b>weakness</b> of key-range partitioning?",
          buckets: ["Strength", "Weakness"],
          items: [
            ["A query for neighbouring keys touches few partitions", 0],
            ["Timestamp keys send every new write to one partition", 1],
            ["Keys stay sorted inside each partition", 0],
            ["Ranges must be chosen to fit the data, or some partitions grow far larger", 1],
          ],
          hint: "Ask: does it help neighbouring keys, or does it concentrate the load?",
          why: "Sorted neighbours are the strength. Hot spots and uneven ranges are the price.",
        },
      },
    ],
    guide: [
      "Press <b>Send 8 writes</b> with <b>Key = timestamp</b> and read the busiest node's share.",
      "Press <b>Move the clock on 6 hours</b> and send more writes.",
      "Switch to <b>Key = customer surname</b> and send writes again. Answer the questions after the demo.",
    ],
  };
})();
