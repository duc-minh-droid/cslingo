/* js/bank/ds-35.js: Data Science lecture 5 revision questions, part 1: ds5-why and ds5-range. */
(function () {
  const B = NIC.bank;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  /* Row of tappable cards: [id, [line, line...]] */
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

  B.add("ds5-why", [
    {
      type: "cat",
      q: "A shop's order database is spread over several machines. Is each description <b>replication</b> or <b>partitioning</b>?",
      buckets: ["Replication", "Partitioning"],
      items: [
        ["Every machine can answer for every order", 0],
        ["Orders 1 to 1M are on machine A, orders 1M+1 to 2M on machine B", 1],
        ["The dataset can grow beyond one machine's disk", 1],
        ["Each machine stores a complete copy of the data", 0],
      ],
      hint: "Ask: does each machine hold everything, or only a subset?",
      why: "Replication keeps copies of the whole dataset. Partitioning gives each machine a subset, so the total can exceed one disk.",
    },
    {
      type: "slider",
      q: "A dataset is 800 GB and each node's disk holds 200 GB. With partitioning and no replicas, at least how many nodes are needed?",
      min: 0,
      max: 10,
      step: 1,
      start: 2,
      ans: 4,
      tol: 1,
      unit: " nodes",
      hint: "800 divided by 200.",
      why: "800 / 200 = 4. Each node stores one partition of 200 GB. Full replicas would need 800 GB on every node, which does not fit.",
    },
    {
      type: "pick",
      q: "Each node is the leader of one partition and a follower of another, as shown. <b>Node 2 crashes.</b> Tap the node whose follower copy will be promoted to replace the lost leader of P2.",
      fig:
        caption("Leaders (solid) and followers (dashed), three nodes") +
        cards(
          [
            ["n1", ["Node 1", "leader P1", "follower P3"]],
            ["n2", ["Node 2", "leader P2", "follower P1"]],
            ["n3", ["Node 3", "leader P3", "follower P2"]],
          ],
          { h: 120 },
        ),
      a: "n3",
      hint: "Find where the follower of P2 lives.",
      why: "Node 3 holds a follower of P2, so that copy takes over. P1 lost a follower copy on Node 2, but its leader on Node 1 is fine.",
    },
    {
      type: "order",
      q: "Order these set-ups by how much data each <b>node</b> must store for a 100 GB dataset on 4 nodes, from least to most.",
      items: [
        "Partitioned, one copy of each partition (25 GB per node)",
        "Partitioned, each partition also has one follower (50 GB per node)",
        "Every node holds a complete replica (100 GB per node)",
      ],
      hint: "25, then double it, then four times it.",
      why: "Plain partitioning stores a quarter per node. Adding one follower doubles that. Full replication puts the whole dataset on every node.",
    },
    {
      type: "mcq",
      q: "In a partitioned cluster, which statement about records is true?",
      o: [
        "Each record belongs to exactly one partition",
        "Each record belongs to every partition",
        "Each record belongs to two partitions, so one can fail",
        "Records belong to nodes, never to partitions",
      ],
      a: 0,
      why: "Partitions do not overlap: each record sits in one partition. Copies for safety come from replication, not from overlapping partitions.",
    },
    {
      type: "multi",
      q: "Which statements are true when partitioning is combined with leader-follower replication? Select all that apply.",
      o: [
        "A partition's leader and followers sit on different nodes",
        "One node can lead one partition and follow another",
        "A node can hold several partitions",
        "Followers of a partition must all be on the leader's node",
        "A partition needs a separate database for each follower",
      ],
      a: [0, 1, 2],
      why: "Leaders and followers are spread over nodes, so that one crash does not remove every copy. Nodes may hold several partitions, in either role.",
    },
    {
      type: "match",
      q: "Match each word to what it means in a partitioned cluster.",
      pairs: [
        ["Partition", "A subset of the data, with each item in exactly one"],
        ["Skew", "Some nodes get a disproportionate share of data or load"],
        ["Hot spot", "A node much busier than the others"],
        ["Follower", "A copy that tracks its partition's leader"],
      ],
      why: "A partition is the subset. Skew is uneven distribution, a hot spot is a node overloaded by it, and a follower is a replica of the leader.",
    },
    {
      type: "bug",
      q: "<code>place()</code> should store each item in <b>exactly one</b> partition. Click the faulty line.",
      code: [
        "def place(item, partitions):",
        "    p = partitions[item.id % len(partitions)]",
        "    for q in partitions:",
        "        q.append(item)",
        "    return p",
      ],
      a: 3,
      hint: "Which line puts the item into partitions other than p?",
      why: "The loop appends the item to every partition, which is replication, not partitioning. Only p should receive it.",
    },
    {
      type: "mcq",
      q: "Fair partitioning splits 5 TB evenly over 10 nodes with no replicas. Roughly how much does each node hold?",
      o: ["50 GB", "500 GB", "5 TB", "50 TB"],
      a: 1,
      hint: "5 TB is 5,000 GB, divided by 10.",
      why: "5,000 GB / 10 = 500 GB per node. This is the benefit of partitioning: the data per node shrinks as nodes are added.",
    },
    {
      type: "mcq",
      q: "A database scatters records at random over 6 nodes. Data and load are even. What is the drawback when you search for one record?",
      o: [
        "You may have to ask all 6 nodes, because nothing says where it is",
        "Data is no longer spread evenly across the six nodes",
        "Each record ends up stored on every one of the nodes",
        "The search is faster because every node helps look",
      ],
      a: 0,
      why: "With no rule linking a record to a node, a lookup has no shortcut: every node must be queried. Real partitioning schemes use the key to find the right node.",
    },
    {
      type: "mcq",
      q: "A 4-node cluster is partitioned fairly, but one node serves 70% of all requests. What is this node called, and why is it a problem?",
      o: [
        "A hot spot: it limits the whole cluster's throughput",
        "A follower: it holds spare copies and has little work to do",
        "A replica: it duplicates what the other three nodes hold",
        "A shard: it is expected to carry more load than the rest",
      ],
      a: 0,
      why: "Skew sends a disproportionate share of load to one node. The cluster cannot handle more than that node can, so the other three are wasted.",
    },
  ]);

  const ranges = (rows, note) =>
    caption(note) +
    cards(
      rows.map(([id, a, b]) => [id, [a, b]]),
      { h: 90 },
    );

  B.add("ds5-range", [
    {
      type: "pick",
      q: "A phone book is partitioned by key range on surname. Tap the partition that stores <b>Patterson</b>.",
      fig: ranges(
        [
          ["p1", "Node 1", "A to D"],
          ["p2", "Node 2", "E to K"],
          ["p3", "Node 3", "L to R"],
          ["p4", "Node 4", "S to Z"],
        ],
        "Surname ranges",
      ),
      a: "p3",
      hint: "P comes after L and before S.",
      why: "Patterson starts with P, which falls between L and R, so it belongs to the third range.",
    },
    {
      type: "slider",
      q: "A sensor network writes 200 readings a second, keyed by timestamp, into 4 hourly-range partitions. How many readings a second does the busiest node receive?",
      min: 0,
      max: 250,
      step: 10,
      start: 50,
      ans: 200,
      tol: 20,
      unit: " per second",
      hint: "Which partition covers the current hour?",
      why: "All current readings carry the current time, which lies in one range, so one node takes all 200 a second while the others get none.",
    },
    {
      type: "cat",
      q: "Under key-range partitioning, is each key likely to cause a <b>write hot spot</b> or to <b>spread writes</b>?",
      buckets: ["Write hot spot", "Writes spread out"],
      items: [
        ["The time the event happened", 0],
        ["A rising order number, 1001, 1002, 1003...", 0],
        ["Customer surname", 1],
        ["The customer's postcode", 1],
      ],
      hint: "Does the key grow in the same order that new data arrives?",
      why: "Keys that follow arrival order, like timestamps and counters, send every new write to the newest range. Surnames and postcodes arrive in no particular order.",
    },
    {
      type: "mcq",
      q: "A shop partitions customers by surname into equal alphabet ranges. Nearly half the customers have surnames starting with S to Z. What is the problem?",
      o: [
        "The S to Z partition is far bigger than the others",
        "Surnames cannot be sorted into ranges at all",
        "Range queries stop working on a partitioned table",
        "Each customer ends up stored in two partitions at once",
      ],
      a: 0,
      why: "Equal-width ranges ignore the data. A partition for a popular part of the alphabet grows large and busy, so boundaries should follow the data.",
    },
    {
      type: "bug",
      q: "A store keeps readings in a key-range partitioned database, with ranges in time order. <code>save()</code> creates a write hot spot. Click the line that causes it.",
      code: [
        "def save(sensor, value):",
        "    key = (now(), sensor)",
        "    part = find_range(key)",
        "    part.write(key, value)",
      ],
      a: 1,
      hint: "Which part of the key decides the partition?",
      why: "The key starts with the current time, so every new reading falls in the newest range. Putting the sensor first would spread writes over many ranges.",
    },
    {
      type: "multi",
      q: "Which statements about key-range partitioning are true? Select all that apply.",
      o: [
        "Keys are sorted, so neighbouring keys sit together",
        "Range boundaries need not be evenly spaced",
        "A range query often touches only one or two partitions",
        "A timestamp key spreads writes evenly",
        "Every key has to be hashed first",
      ],
      a: [0, 1, 2],
      why: "Sorted keys and uneven, data-fitted boundaries are core to the idea, and they make range queries cheap. A timestamp key does the opposite of spreading writes, and hashing belongs to the other scheme.",
    },
    {
      type: "mcq",
      q: "Ranges are A to F, G to M, N to S and T to Z. How many partitions does a query for surnames from <b>Mills</b> to <b>Quinn</b> touch?",
      o: ["1", "2", "4"],
      a: 1,
      why: "Mills is in G to M, Quinn is in N to S, and everything between falls in these two ranges, so 2 partitions.",
    },
    {
      type: "mcq",
      q: "Which everyday object is closest to key-range partitioning?",
      o: [
        "A paper encyclopaedia split into volumes by alphabet",
        "A deck of cards shuffled into piles at random",
        "Photocopies of one book given to every library",
        "A recipe that is rewritten from memory each time",
      ],
      a: 0,
      why: "Each volume covers a continuous range of the sorted keys. That also tells you which volume to pick up for a word.",
    },
    {
      type: "order",
      q: "Put the steps of a write in a key-range partitioned cluster in order.",
      items: [
        "A write arrives with its key",
        "The key is compared with each partition's range",
        "The range that contains the key is found",
        "The write is stored on the node holding that partition",
      ],
      hint: "You cannot choose a node before you know which range contains the key.",
      why: "The key's position in the sorted order picks the range, and the range picks the node.",
    },
    {
      type: "mcq",
      q: "A day is split into six four-hour ranges (00-03, 04-07, 08-11, 12-15, 16-19, 20-23). A scan covers 05:00 to 13:00. How many partitions does it touch?",
      o: ["2", "3", "6"],
      a: 1,
      hint: "05:00 is in 04-07 and 13:00 is in 12-15.",
      why: "The scan runs through 04-07, 08-11 and 12-15. Neighbouring keys sit together, so only these three partitions are needed.",
    },
    {
      type: "cat",
      q: "Is each point a <b>strength</b> or a <b>weakness</b> of key-range partitioning?",
      buckets: ["Strength", "Weakness"],
      items: [
        ["A scan between two keys reads a few neighbouring partitions", 0],
        ["A rising key sends every new write to one partition", 1],
        ["Keys stay sorted within the cluster", 0],
        ["Choosing even-looking ranges can still leave one partition far bigger", 1],
      ],
      hint: "Does it help or hurt neighbouring keys and balanced load?",
      why: "Sorted neighbours are what the scheme gives you. Hot spots and badly chosen ranges are the price.",
    },
  ]);
})();
