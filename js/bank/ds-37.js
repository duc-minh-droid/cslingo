/* js/bank/ds-37.js: Data Science lecture 5 revision questions, part 3: ds5-rebalance. */
(function () {
  const B = NIC.bank;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const cards = (list, { w = 460, h = 110 } = {}) => {
    const cw = (w - 10 * (list.length + 1)) / list.length;
    const g = list
      .map(([id, lines], i) => {
        const x = 10 + i * (cw + 10);
        const t = lines
          .map(
            (l, j) =>
              `<text x="${x + cw / 2}" y="${34 + j * 22}" text-anchor="middle" style="font:800 ${j ? 12 : 14}px var(--sans);fill:var(--ink)">${esc(l)}</text>`,
          )
          .join("");
        return `<g data-pick="${id}"><rect x="${x}" y="10" width="${cw}" height="${h - 20}" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${t}</g>`;
      })
      .join("");
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">${g}</svg>`;
  };
  const caption = (s) => `<p class="faint" style="font-weight:800;margin:0 0 6px">${s}</p>`;

  B.add("ds5-rebalance", [
    {
      type: "order",
      q: "A node in a partitioned cluster fails. Put the rebalancing steps in order.",
      items: [
        "The failure is detected",
        "The partitions it held need new homes",
        "Surviving nodes with the fewest partitions are chosen",
        "Those partitions are served from other copies and the cluster is fair again",
      ],
      hint: "Notice the problem, decide where the work goes, then restore a fair spread.",
      why: "Rebalancing starts with the change, picks new owners that keep the load even, and finishes with a fair cluster that kept serving all the while.",
    },
    {
      type: "slider",
      q: "A cluster runs 1,000 fixed partitions on 10 nodes, 100 each. An 11th node joins and takes a fair share. About how many partitions does it end with?",
      min: 0,
      max: 200,
      step: 10,
      start: 100,
      ans: 90,
      tol: 10,
      unit: " partitions",
      hint: "1,000 divided by 11 is a little over 90.",
      why: "1,000 / 11 is about 91. The new node steals roughly 91 whole partitions spread over the old nodes, and nothing else changes.",
    },
    {
      type: "cat",
      q: "Does each event call for <b>rebalancing</b> or not?",
      buckets: ["Rebalancing needed", "Not needed"],
      items: [
        ["Traffic doubles and the nodes are saturated", 0],
        ["One record is updated", 1],
        ["A machine fails", 0],
        ["The dataset doubles in size", 0],
        ["A user reads one record", 1],
      ],
      hint: "Rebalancing responds to changes in capacity or load across the cluster.",
      why: "Throughput, data size and machine failures change how the load should be shared. A single read or update is ordinary work.",
    },
    {
      type: "mcq",
      q: 'Eight keys numbered 0 to 7 are placed with "key mod N". The cluster grows from 2 nodes to 4. How many keys end up on a different node?',
      o: ["0", "4", "8"],
      a: 1,
      hint: "Compare k mod 2 with k mod 4 for k = 0 to 7: keys 2, 3, 6 and 7 differ.",
      why: "Keys 0, 1, 4 and 5 keep their node, but 2, 3, 6 and 7 move. Half the data moved even though only two nodes were added. With more nodes the share gets worse.",
    },
    {
      type: "pick",
      q: "Three nodes hold 12 fixed partitions. A fourth node joins empty and must take 3. Which node should it take its <b>first</b> partition from?",
      fig:
        caption("Partitions per node") +
        cards(
          [
            ["a", ["Node A", "5 partitions"]],
            ["b", ["Node B", "3 partitions"]],
            ["c", ["Node C", "4 partitions"]],
          ],
          { h: 90 },
        ),
      a: "a",
      hint: "Take from the node that has the most.",
      why: "Node A has the most partitions, so taking one from it brings the cluster toward 3 each with the fewest moves.",
    },
    {
      type: "bug",
      q: "<code>add_node()</code> must move as little as possible when a node joins a cluster with fixed partitions. Click the faulty line.",
      code: [
        "def add_node(new):",
        "    for key in all_keys():",
        "        owner[key] = hash(key) % (len(nodes) + 1)",
        "    nodes.append(new)",
      ],
      a: 2,
      hint: "What changes for a key when the node count changes?",
      why: "Re-hashing with the node count moves most keys. A fixed-partition system leaves key-to-partition alone and moves only whole partitions to the new node.",
    },
    {
      type: "mcq",
      q: "With dynamic partitioning and a 10 GB limit, a partition grows to 18 GB. What happens?",
      o: [
        "It splits into two partitions of about 9 GB each",
        "It is moved whole to a node with a bigger disk",
        "It keeps growing until the node is full",
        "It is deleted when it passes the limit",
      ],
      a: 0,
      why: "Partitions above the size limit are split in two. Each half can then be stored on a different node.",
    },
    {
      type: "multi",
      q: "Which are requirements of rebalancing? Select all that apply.",
      o: [
        "Afterwards, load is shared fairly between the nodes",
        "Reads and writes keep being accepted during the move",
        "No more data than necessary is moved",
        "All writes pause until the move finishes",
        "Every key is re-hashed",
      ],
      a: [0, 1, 2],
      why: "Fair load, availability and minimal movement are the three requirements. Pausing writes and re-hashing everything break them.",
    },
    {
      type: "mcq",
      q: "A cluster uses a fixed number of partitions, 600 of them. Two new nodes join. How many partitions are there afterwards?",
      o: ["600", "1,200", "Fewer than 600"],
      a: 0,
      why: "The number of partitions does not change, nor does the assignment of keys to partitions. Only the partitions' homes change.",
    },
    {
      type: "mcq",
      q: "Under dynamic partitioning, a large amount of data is deleted and two neighbouring partitions are now tiny. What may the database do?",
      o: [
        "Merge them into one partition",
        "Split each of them again",
        "Move both onto the same disk and keep them apart forever",
        "Rehash all keys",
      ],
      a: 0,
      why: "When data shrinks, partitions can merge, so the number of partitions follows the amount of data.",
    },
    {
      type: "match",
      q: "Match each term to what it describes.",
      pairs: [
        ["Rebalancing", "Moving data and load between nodes"],
        ["Fixed partitions", "A new node steals whole partitions"],
        ["Dynamic partitioning", "Partitions split at a size limit"],
        ["Hash mod N", "Most keys move when N changes"],
      ],
      why: "Rebalancing is the process. Fixed and dynamic partitioning are two ways of doing it with little movement, and mod N is the pitfall to avoid.",
    },
    {
      type: "slider",
      q: "A cluster of 6 nodes holds 120 partitions, 20 each. One node crashes and its partitions are shared evenly among the 5 survivors. About how many extra partitions does each survivor take?",
      min: 0,
      max: 20,
      step: 1,
      start: 10,
      ans: 4,
      tol: 1,
      unit: " partitions",
      hint: "The crashed node's 20 partitions, split 5 ways.",
      why: "20 / 5 = 4 each. Each survivor now holds 24, and the load is fair again.",
    },
  ]);
})();
