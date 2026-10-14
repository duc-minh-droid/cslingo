/* Data Science Lecture 5 workshop (5.W): a cluster sandbox. Cool a hot spot, split a big partition,
   add a node moving as little as possible, and compare range queries on two layouts. No code, no typing. */
(function () {
  const S = NIC.shared.dsL5 || {};
  const { reg, bar, pct, chip, nodesHtml } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  const CAP = 60, // requests per second one node can serve
    LIM = 10, // GB, the dynamic-partitioning size limit
    COOL = 45; // 75% of CAP
  // [partition number, requests per second, size in GB]
  const BASE = [
    [1, 12, 6],
    [2, 9, 5],
    [3, 44, 7],
    [4, 10, 6],
    [5, 8, 8],
    [6, 7, 5],
    [7, 9, 18],
    [8, 8, 6],
    [9, 6, 7],
    [10, 10, 5],
    [11, 7, 8],
    [12, 5, 6],
  ];
  const KEYS = [20, 35];
  const fresh = () =>
    BASE.map(([n, load, gb]) => ({ id: `P${n}`, base: n, half: "", load, gb, node: `N${Math.ceil(n / 3)}` }));

  function sandbox(stage, api, life) {
    let parts = fresh(),
      nodes = ["N1", "N2", "N3", "N4"],
      sel = null,
      traffic = false,
      layout = "range",
      ran = new Set(),
      snap = null,
      moves = 0,
      par = 0,
      qhit = { parts: new Set(), nodes: new Set() };
    const box = el(`<div>
      <div class="wk-card"><h3>Cluster of partitions<span class="wk-sp"></span><button class="btn small" data-t>Run traffic</button><button class="btn small" data-add>Add node N5</button><button class="btn small ghost" data-undo hidden>Undo node add</button></h3>
        <div data-nodes></div>
        <div class="wk-stats" style="margin-top:8px"><div class="wk-stat blue"><small>Busiest node</small><b data-s1>-</b></div><div class="wk-stat"><small>Partitions</small><b data-s2></b></div><div class="wk-stat amber"><small>Moves since node added</small><b data-s3>-</b></div></div>
        <div class="wk-row" style="margin-top:8px"><button class="btn small" data-split disabled>Split selected partition</button><span class="wk-note" data-note style="flex:1">Tap a partition, then tap the node to move it to.</span></div></div>
      <div class="wk-card"><h3>Range query: keys ${KEYS[0]} to ${KEYS[1]}</h3>
        <div class="wk-row" data-lay></div>
        <div class="wk-row" style="margin-top:8px"><button class="btn primary small" data-q>Run the range query</button><span class="wk-note" data-qn style="flex:1">Each partition holds 10 of the 120 keys.</span></div></div>
    </div>`);
    stage.appendChild(box);
    const $ = (s) => qs(s, box);
    const load = (n) => parts.filter((p) => p.node === n).reduce((a, p) => a + p.load, 0);
    const cnt = (n) => parts.filter((p) => p.node === n).length;
    const note = (h) => ($("[data-note]").innerHTML = h);

    function draw() {
      $("[data-nodes]").innerHTML = `<div class="ds5-nodes">${nodes
        .map((n) => {
          const l = load(n),
            hot = traffic && l > CAP,
            warm = traffic && l > COOL;
          return `<div class="ds5-node ${sel ? "tgt" : ""} ${hot ? "hot" : ""} ${qhit.nodes.has(n) ? "hit" : ""}" data-n="${n}">
            <h4>${n}<small>${traffic ? `${pct(l, CAP)}%` : `${cnt(n)} parts`}</small></h4>
            <div class="ds5-chips">${parts
              .filter((p) => p.node === n)
              .map(
                (p) =>
                  `<button class="ds5-chip mono ${p.id === sel ? "sel" : ""} ${qhit.parts.has(p.id) ? "hit" : ""} ${p.gb > LIM ? "over" : ""}" data-p="${p.id}" aria-pressed="${p.id === sel}">${p.id} ${traffic ? p.load + "/s " : ""}${p.gb}GB</button>`,
              )
              .join("")}</div>
            ${bar(traffic ? l / CAP : 0, warm ? "hot" : "")}<button class="btn small ghost" data-n="${n}" style="margin-top:6px" aria-label="${sel ? "Move the selected partition to" : "Check"} node ${n}">${sel ? "Move here" : "Check node"}</button></div>`;
        })
        .join("")}</div>`;
      const top = Math.max(...nodes.map(load));
      $("[data-s1]").textContent = traffic ? `${pct(top, CAP)}%` : "-";
      $("[data-s2]").textContent = parts.length;
      $("[data-s3]").textContent = snap ? `${moves} (best ${par})` : "-";
      $("[data-split]").disabled = !sel || parts.find((p) => p.id === sel).gb <= LIM;
      $("[data-add]").disabled = nodes.length >= 5;
      $("[data-undo]").hidden = !snap;
      $("[data-t]").textContent = traffic ? "Stop traffic" : "Run traffic";
    }
    function check() {
      if (traffic && Math.max(...nodes.map(load)) <= COOL && api.done("cool"))
        api.say(
          "The hot partition has a node mostly to itself and nobody is above <b>75%</b>. That is a fair spread.",
          "happy",
        );
      if (parts.every((p) => p.gb <= LIM) && api.done("split"))
        api.say("Over the size limit means <b>split</b>: each half can now live on its own node.", "happy");
      if (snap) {
        const c = nodes.map(cnt);
        if (Math.max(...c) - Math.min(...c) <= 1) {
          if (moves <= par) {
            if (api.done("add"))
              api.say(
                `Balanced in <b>${moves}</b> moves, the fewest possible. Whole partitions only: no key was re-hashed.`,
                "happy",
              );
          } else
            note(
              `Balanced, but it took <b>${moves}</b> moves and the fewest possible is <b>${par}</b>. Press <b>Undo node add</b> and steal only what the new node needs.`,
            );
        }
      }
    }
    function move(n) {
      const p = parts.find((x) => x.id === sel);
      sel = null;
      if (!p || p.node === n) return draw();
      p.node = n;
      if (snap) moves++;
      qhit = { parts: new Set(), nodes: new Set() };
      note(`Moved <b>${p.id}</b> to <b>${n}</b>.`);
      draw();
      check();
    }
    $("[data-nodes]").onclick = (e) => {
      const c = e.target.closest("[data-p]"),
        nd = e.target.closest("[data-n]");
      if (c) {
        sel = sel === c.dataset.p ? null : c.dataset.p;
        const p = parts.find((x) => x.id === sel);
        note(
          sel
            ? `<b>${sel}</b> selected (${p.load}/s, ${p.gb} GB). Tap a node to move it there${p.gb > LIM ? ", or press <b>Split</b>" : ""}.`
            : "Tap a partition, then tap the node to move it to.",
        );
        return draw();
      }
      if (!nd) return;
      if (sel) return move(nd.dataset.n);
      if (!traffic) return note("Press <b>Run traffic</b> first, so every node shows how busy it is.");
      if (load(nd.dataset.n) > CAP) {
        note(
          `<b>${nd.dataset.n}</b> is asked for ${load(nd.dataset.n)} requests a second but can serve ${CAP}: a <b>hot spot</b>.`,
        );
        if (api.done("find"))
          api.say("That is the hot spot: one node carrying a partition far busier than the rest.", "surprised");
      } else note(`<b>${nd.dataset.n}</b> is fine at ${pct(load(nd.dataset.n), CAP)}%. Look for a node past 100%.`);
    };
    $("[data-t]").onclick = () => {
      traffic = !traffic;
      note(traffic ? "Traffic is flowing. Which node is past 100%? Tap it." : "Traffic stopped.");
      draw();
      check();
    };
    $("[data-split]").onclick = () => {
      const i = parts.findIndex((p) => p.id === sel),
        p = parts[i];
      parts.splice(
        i,
        1,
        { ...p, id: `${p.id}a`, half: "a", gb: p.gb / 2, load: Math.ceil(p.load / 2) },
        { ...p, id: `${p.id}b`, half: "b", gb: p.gb / 2, load: Math.floor(p.load / 2) },
      );
      sel = null;
      note(
        `<b>${p.id}</b> (${p.gb} GB) split into two partitions of ${p.gb / 2} GB. They share a node until you move one.`,
      );
      draw();
      check();
    };
    $("[data-add]").onclick = () => {
      snap = parts.map((p) => ({ ...p }));
      nodes = nodes.concat("N5");
      const sim = parts.map((p) => ({ ...p })),
        c = (n) => sim.filter((p) => p.node === n).length;
      par = 0;
      for (;;) {
        const cs = nodes.map(c),
          from = nodes[cs.indexOf(Math.max(...cs))],
          to = nodes[cs.indexOf(Math.min(...cs))];
        if (Math.max(...cs) - Math.min(...cs) <= 1) break;
        sim.filter((p) => p.node === from).pop().node = to;
        par++;
      }
      moves = 0;
      sel = null;
      note(`<b>N5</b> joined empty. Give it a fair share by moving whole partitions: fewest moves wins.`);
      api.say(
        "A new node with nothing on it. Take partitions from the busiest in count, and only as many as it needs.",
        "think",
      );
      draw();
    };
    $("[data-undo]").onclick = () => {
      parts = snap.map((p) => ({ ...p }));
      nodes = nodes.filter((n) => n !== "N5");
      snap = null;
      sel = null;
      note("Back to before N5 joined.");
      draw();
    };
    $("[data-lay]").appendChild(
      N.seg(
        [
          ["range", "Partitioned by key range"],
          ["hash", "Partitioned by hash"],
        ],
        layout,
        (v) => {
          layout = v;
          qhit = { parts: new Set(), nodes: new Set() };
          $("[data-qn]").textContent = "Each partition holds 10 of the 120 keys.";
          draw();
        },
      ),
    );
    $("[data-q]").onclick = () => {
      const ids = new Set(),
        nds = new Set();
      for (let k = KEYS[0]; k <= KEYS[1]; k++) {
        const h = layout === "hash" ? (k * 37 + 5) % 120 : k,
          b = Math.floor(h / 10) + 1,
          sub = h % 10;
        const p = parts.find((x) => x.base === b && (x.half === "" || (x.half === "a") === sub < 5));
        ids.add(p.id);
        nds.add(p.node);
      }
      qhit = { parts: ids, nodes: nds };
      ran.add(layout);
      $("[data-qn]").innerHTML =
        layout === "range"
          ? `Neighbouring keys share partitions: <b>${ids.size}</b> partitions, so <b>${nds.size}</b> node${nds.size > 1 ? "s" : ""} asked.`
          : `Hashing scatters neighbours: <b>${ids.size}</b> partitions, so <b>${nds.size}</b> nodes asked.`;
      draw();
      if (ran.size === 2 && api.done("range"))
        api.say("Same keys, same question: key ranges ask a couple of nodes, hashing asks nearly all.", "wink");
    };
    draw();
  }

  reg({
    id: "ds5-cluster",
    order: 90,
    workshop: true,
    num: "5.W",
    title: "Workshop: run a partitioned cluster",
    blurb:
      "No code. Cool a hot spot, split a big partition, add a node with the fewest moves and count nodes for a range query.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "Twelve partitions on four nodes, and one of them is far busier than the others. Move, split and add until the cluster is healthy.",
        missions: [
          {
            id: "find",
            t: "Find the hot spot",
            d: "Press <b>Run traffic</b>, then tap the node that is past 100%.",
            hint: "A node over 100% is asked for more requests a second than it can serve. Its bar will be red.",
          },
          {
            id: "cool",
            t: "Cool it down",
            d: "Move partitions so that <b>no node is above 75%</b>.",
            hint: "The busy partition cannot be shared, so give it a node to itself: move its neighbours away to quieter nodes.",
          },
          {
            id: "split",
            t: "Split the giant",
            d: "One partition is over the <b>10 GB</b> limit. Select it and press <b>Split selected partition</b>.",
            hint: "Partitions with a red outline are over the limit.",
          },
          {
            id: "add",
            t: "Add a node, move the least",
            d: "Press <b>Add node N5</b>, then move whole partitions until every node has a fair count, in as few moves as possible.",
            hint: "A fair count differs by at most 1 between nodes. N5 only needs its share, so steal from the nodes with the most partitions.",
          },
          {
            id: "range",
            t: "Count the nodes",
            d: "Run the <b>range query</b> on both layouts, key range and hash.",
            hint: "Switch the layout, then press <b>Run the range query</b> each time.",
          },
        ],
        build: (stage, api) => sandbox(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "ds5-cluster-1",
          q: "One partition takes 44 requests a second. A node serves up to 60, and it also holds two other partitions adding 21 a second. What is the quickest fix?",
          opts: [
            "Move the two quieter partitions to other nodes",
            "Add a third quiet partition to the same node",
            "Change the hash function for every key",
          ],
          a: 0,
          why: "The hot partition alone uses 44 of 60. Its neighbours push the node over 100%, so moving them away leaves it comfortably under the limit.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds5-cluster-2",
          q: "A fifth node joins four nodes holding 12 partitions (3 each). Which plan moves the least data?",
          opts: [
            "Steal 2 whole partitions for the new node",
            "Re-hash every key with mod 5",
            "Copy all 12 partitions onto the new node",
          ],
          a: 0,
          why: "A fair share is about 2 partitions. Stealing exactly those moves almost nothing, whereas mod N changes the answer for most keys and copying everything defeats the point.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>hot spot</b> is a node carrying far more load than the rest. Fix it by moving its other partitions away.",
            "A partition over the size limit is <b>split</b>, and the halves can live on different nodes.",
            "A new node <b>steals whole partitions</b> until its share is fair. Moving only what is needed keeps rebalancing fast.",
            "<b>Range queries</b> touch few nodes with key ranges, but nearly all of them with hashed keys.",
          ],
          "Spread the load, move whole partitions, and know what each layout costs a range query.",
        ),
      );
    },
  });

  L["ds5-cluster"] = {
    sum: "Run a partitioned cluster by hand: cool a hot spot, split a big partition, add a node and compare range queries.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>You manage a cluster of <b>12 partitions</b> on 4 nodes. One partition gets far more traffic than the rest, so its node is a <b>hot spot</b>. You can <b>move</b> partitions, <b>split</b> big ones and <b>add</b> a node.</p>`,
        v: F.compare(
          { title: "Hot spot", c: "rose", body: "one node over 100% while others idle" },
          { title: "Balanced", c: "teal", body: "every node comfortably under its limit" },
        ),
        c: {
          q: "A node can serve 60 requests a second but is asked for 65. What is it?",
          o: ["A hot spot: over its capacity", "A healthy node with spare room", "A follower with no load"],
          a: 0,
          why: "Load above capacity means requests queue or fail. The fix is to move load to other nodes.",
        },
      },
      {
        t: "Only move what you need",
        b: `<p>When a node joins, it should take a <b>fair share</b> of partitions, and <b>no more data than necessary</b> should move. Whole partitions move; keys are not re-hashed.</p>`,
        v: F.flow([
          { t: "N5 joins", s: "empty", c: "amber" },
          { t: "steal from fullest", s: "whole partitions", c: "blue" },
          { t: "fair share", s: "fewest moves", c: "teal" },
        ]),
        c: {
          q: "Four nodes hold 12 partitions, 3 each. A fifth node joins. How many partitions should it end up with, at least?",
          o: ["2", "6", "12"],
          a: 0,
          why: "12 partitions over 5 nodes is 2.4 each, so a fair share is 2 or 3. Two moves reach it.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };

  L["ds5-index"] = {
    sum: "<b>Secondary indexes</b> search by something other than the key. Partition them <b>by document</b> (each partition indexes its own data) or <b>by term</b> (the index is split by word).",
    steps: [
      {
        t: "Not the key",
        b: `<p>A <b>key</b> in a key-value model identifies one record. A <b>secondary index</b> does not: many records can share a value. It is used for <b>search or sorting</b>, for example finding every car with colour <i>red</i>, or every post by a given user id.</p>`,
        v: F.compare(
          { title: "Primary key", c: "teal", body: "<code>car_id = 7</code>: exactly one record" },
          { title: "Secondary index", c: "blue", body: "<code>colour = red</code>: many records" },
        ),
        c: {
          q: "Which lookup would need a secondary index on a cars table keyed by car id?",
          o: [
            "All cars whose make is Kia",
            "The car with id 42, looked up by its key",
            "Whether a car with id 7 exists in the table",
          ],
          a: 0,
          why: "Make is not the key, so finding cars by make needs an index on it. Lookups by id use the key.",
        },
      },
      {
        t: "Two ways to partition it",
        b: `<p>Secondary indexes don't map neatly to partitions: the matching records are spread over many. There are two designs: <b>partitioning by document</b> and <b>partitioning by term</b>.</p>`,
        v: F.compare(
          { title: "By document", c: "teal", body: "each partition indexes <b>its own</b> documents" },
          { title: "By term", c: "violet", body: "the index is <b>split by word</b> (blue, ford, kia...)" },
        ),
      },
      {
        t: "By document: a local index",
        b: `<p>Each partition keeps an index of <b>only the documents it holds</b>. A write touches one partition. But a search for <i>red</i> cannot tell which partitions have red cars, so it is sent to <b>all</b>, and the results are combined: <b>scatter-gather</b>.</p>`,
        v: nodesHtml([
          { name: "Partition 1", chips: [chip("red: 1,4"), chip("green: 7,10")] },
          { name: "Partition 2", chips: [chip("blue: 2,5,8,11")] },
          { name: "Partition 3", chips: [chip("green: 3"), chip("red: 6,9,12")] },
        ]),
        c: {
          q: "A cluster with 6 partitions uses local (by document) indexes. A search for one colour must be sent to how many partitions?",
          o: ["1", "3", "6"],
          a: 2,
          why: "Matching documents could be in any partition, so the search is scattered to all 6 and the answers gathered.",
        },
      },
      {
        t: "By term: a global index",
        b: `<p>Keep <b>one index for everything</b>, and partition that index by <b>term</b> (for example colours a to m on one partition, n to z on another). A search reads <b>one</b> index partition. The cost is on writes: one document has several terms, so a single write may update <b>several</b> index partitions.</p>`,
        v: nodesHtml([
          { name: "Index 1", chips: [chip("blue → 2,5,8,11"), chip("ford → 1,5,7,9")] },
          { name: "Index 2", chips: [chip("green → 3,7,10"), chip("kia → 2,4,10,11")] },
          { name: "Index 3", chips: [chip("mini → 3,6,8,12"), chip("red → 1,4,6,9,12")] },
        ]),
        c: {
          q: "A global index is split by term. A new document has two terms stored in two different index partitions. How many index partitions does saving it update?",
          o: ["1", "2", "All of them, always"],
          a: 1,
          why: "Each term's entry lives in its own index partition, so the write reaches both. This is why writes are more complex with a term-partitioned index.",
        },
      },
      {
        t: "Trade-offs",
        b: `<p>By document: <b>simple, cheap writes</b>, but reads are wide. By term: <b>efficient reads</b>, but writes touch more partitions.</p>`,
        v: F.compare(
          { title: "By document", c: "teal", body: "write: 1 partition<br>search: all partitions" },
          { title: "By term", c: "violet", body: "write: several partitions<br>search: 1 index partition" },
        ),
        c: {
          type: "cat",
          q: "Which indexing design does each description fit?",
          buckets: ["By document", "By term"],
          items: [
            ["A search must be sent to every partition", 0],
            ["A single write may update several partitions", 1],
            ["A search reads one index partition", 1],
            ["A write touches only the partition holding the document", 0],
          ],
          hint: "A local index is wide on reads and narrow on writes. A global one is the other way round.",
          why: "By document gives cheap writes and scatter-gather reads. By term gives narrow reads and wider writes.",
        },
      },
      {
        t: "Which one?",
        b: `<p>Decide by what the workload does <b>most</b>. A search-heavy site rarely changes its data, so it pays to make searches cheap. A write-heavy feed that is rarely searched pays for every extra partition on each write.</p>`,
        v: F.cells(
          [
            { v: "mostly searches", sub: "by term", c: "violet" },
            { v: "mostly writes", sub: "by document", c: "teal" },
          ],
          { size: 150 },
        ),
        c: {
          q: "A catalogue is updated a few times a day but searched thousands of times a second by word. Which index design fits best?",
          o: [
            "By term: each search reads a single index partition",
            "By document: every search is already cheap",
            "Neither: secondary indexes cannot be partitioned",
          ],
          a: 0,
          why: "Reads dominate, so the narrow read of a term-partitioned index pays off, and the occasional wider write is a small cost.",
        },
      },
    ],
    guide: [
      "Search for a word in <b>Index by document</b> and watch which partitions light up.",
      "Switch to <b>Index by term</b>, search again, then press <b>Save a new car</b> in both modes.",
      "Answer the questions after the demo.",
    ],
  };
})();
