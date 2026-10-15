(function () {
  const B = NIC.bank;

  const nodesFig = () => {
    const ns = [
      ["1", "A to M", "var(--blue)"],
      ["2", "N to Z", "var(--teal)"],
      ["3", "A to M", "var(--blue)"],
      ["4", "N to Z", "var(--teal)"],
    ];
    const cells = ns
      .map(
        ([k, d, c], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="${10 + i * 86}" y="34" width="78" height="52" rx="10" fill="var(--panel)" stroke="${c}" stroke-width="3"/><text x="${49 + i * 86}" y="56" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text)">Node ${k}</text><text x="${49 + i * 86}" y="74" text-anchor="middle" font-size="12" fill="var(--text)">${d}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 360 120" style="width:100%;max-width:420px"><text x="10" y="22" font-size="12" font-weight="800" fill="var(--text)">Each node stores customers by surname</text>${cells}<text x="10" y="108" font-size="12" fill="var(--text)">Node 1 holds the customers whose surnames run A to M.</text></svg>`;
  };
  const wrFig = () => {
    const ns = [
      ["L", "Leader", "var(--blue)", 10],
      ["F1", "Follower 1", "var(--teal)", 130],
      ["F2", "Follower 2", "var(--teal)", 250],
    ];
    const cells = ns
      .map(
        ([k, d, c, x]) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="${x}" y="34" width="100" height="48" rx="10" fill="var(--panel)" stroke="${c}" stroke-width="3"/><text x="${x + 50}" y="63" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text)">${d}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 360 120" style="width:100%;max-width:420px"><text x="10" y="22" font-size="12" font-weight="800" fill="var(--text)">One leader, two followers</text>${cells}<text x="10" y="106" font-size="12" fill="var(--text)">A user wants to change their email address.</text></svg>`;
  };

  B.add("ds4-scale", [
    {
      type: "mcq",
      q: "A photo-sharing site is fine on one server all year, except on the day a famous account joins and traffic triples. Which of these is a reason to spread the system over several machines?",
      o: [
        "The load may exceed what one machine can handle",
        "Several machines always run each query faster",
        "One machine cannot store any data on disk",
        "A single server cannot use a network",
      ],
      a: 0,
      why: "Two reasons to distribute: the load can grow beyond one machine, and one machine can go down. More machines do not make a single query faster by themselves.",
    },
    {
      type: "cat",
      q: "Is each point about <b>vertical</b> or <b>horizontal</b> scaling?",
      buckets: ["Vertical (up)", "Horizontal (out)"],
      items: [
        ["Replace the server with one that has more RAM and faster CPUs", 0],
        ["Add five more ordinary servers behind the same service", 1],
        ["Cost climbs faster than the capacity gained", 0],
        ["Losing one machine leaves the others running", 1],
      ],
      why: "Vertical scaling makes one machine bigger (costly, a single point of failure). Horizontal scaling adds machines, so the cost can scale better and failures are survivable.",
    },
    {
      type: "mcq",
      q: "A chain of shops stores each country's sales on its own set of machines: one set for France, one for Spain, one for Italy. Which approach is this?",
      o: ["Partitioning", "Replication", "Vertical scaling", "Semi-synchronous replication"],
      a: 0,
      why: "Each node holds a different subset (a partition). Under replication every node would hold all countries.",
    },
    {
      type: "multi",
      q: "Which are real benefits of keeping replicas of a database? Select all that apply.",
      o: [
        "Users can read from a copy near them",
        "The system keeps working if some machines fail",
        "More machines can serve read queries",
        "Writes only need to update one copy",
        "The data no longer needs to fit on one machine",
      ],
      a: [0, 1, 2],
      why: "Replicas cut latency, raise availability and spread reads. Writes must still update every copy, and each replica holds all the data.",
    },
    {
      type: "slider",
      q: "A service runs on 4 machines, each handling 250 requests a second. One machine fails. How many requests a second can the service still handle?",
      min: 0,
      max: 1000,
      step: 50,
      start: 500,
      ans: 750,
      tol: 50,
      unit: " req/s",
      hint: "Three machines remain, each doing 250. 3 × 250 = 750.",
      why: "The survivors carry on: 3 × 250 = 750 requests a second, a degraded but working service. One big machine failing would leave nothing.",
    },
    {
      type: "pick",
      q: "Node 1 holds the customers whose surnames run A to M. Tap the node that holds a <b>replica</b> of node 1.",
      fig: nodesFig(),
      a: "3",
      hint: "A replica is a full copy of the same data.",
      why: "Node 3 holds the same A to M customers, so it is a replica. Node 2 and node 4 hold the other half: that is partitioning.",
    },
    {
      type: "mcq",
      q: "A table is 6 TB and each machine has 2 TB of disk. A teammate suggests solving the load problem by adding replicas. What is wrong with that?",
      o: [
        "Every replica needs all 6 TB, so the data must be split",
        "Replicas can only be made of tables under 1 TB each",
        "Replicas cannot be placed on separate machines at all",
        "Replicas make every read slower than it was before",
      ],
      a: 0,
      why: "A replica is a full copy, so replication only works if the data fits on one machine. Beyond that you need partitioning.",
    },
    {
      type: "order",
      q: "Order these set-ups from the smallest distributed system to the biggest.",
      items: [
        "Two machines on the same power supply",
        "A cluster of racks in one data centre",
        "Servers in a few cities for one country",
        "A content delivery network with hundreds of locations",
      ],
      why: "A distributed system can be as small as two machines or as big as a worldwide CDN.",
    },
    {
      type: "mcq",
      q: "A forum's database gets 100 writes a second and almost no reads. The team adds ten read replicas. How much does the write capacity improve?",
      o: [
        "Hardly at all: every write must still reach every copy",
        "Ten times, as replicas share the writes",
        "It doubles, because half the replicas take writes",
        "It improves only for the reads",
      ],
      a: 0,
      why: "Write operations involve updating all copies, so extra replicas do not add write capacity (and the leader remains the single entry for writes).",
    },
    {
      type: "mcq",
      q: "Which architecture does scaling out describe?",
      o: [
        "Shared-nothing: each machine has its own resources",
        "Shared-memory: every CPU uses the same memory pool",
        "A single machine with a much faster processor",
        "A single disk that is shared by every user",
      ],
      a: 0,
      why: "Horizontal scaling is a shared-nothing architecture. Vertical scaling is the shared-memory style.",
    },
    {
      type: "mcq",
      q: "A video site keeps servers in hundreds of cities, so each viewer is served by a nearby one. Which benefit of keeping copies close to users is that?",
      o: ["Lower latency", "Cheaper writes", "A smaller dataset per machine", "A guarantee that replicas never lag"],
      a: 0,
      why: "Geographic closeness cuts the round trip. It does nothing for write costs or data size, and replicas can still lag.",
    },
    {
      type: "bug",
      q: "This plan for an on-sale spike has one flaw if the goal is to survive a machine failure. Which line?",
      code: [
        "plan = [",
        "  'buy the largest server we can afford',",
        "  'move the whole database onto it',",
        "  'retire the old machines',",
        "]",
      ],
      a: 3,
      why: "Retiring every other machine leaves one machine again: one failure is an outage. Spare machines (replicas) are what keep a service available.",
    },
  ]);

  B.add("ds4-leader", [
    {
      type: "mcq",
      q: "In a leader-follower cluster, a user changes their display name. Which node must receive that update first?",
      o: ["The leader", "Any follower", "All followers at the same moment", "The follower nearest to the user"],
      a: 0,
      why: "Writes can only be sent to the leader. It stores them and then sends them to the followers in the replication log.",
    },
    {
      type: "order",
      q: "Put the life of one write in order.",
      items: [
        "A client sends the write to the leader",
        "The leader stores it in its local storage",
        "The leader puts the change into the replication log",
        "Each follower applies the change to its own copy",
      ],
      why: "The leader handles the write first, then the log carries the change to the followers, which apply the same changes in the same order.",
    },
    {
      type: "cat",
      q: "Which node(s) can handle each request?",
      buckets: ["Any replica", "Leader only"],
      items: [
        ["Open a product page", 0],
        ["Add an item to a basket", 1],
        ["Search the catalogue", 0],
        ["Update a delivery address", 1],
      ],
      why: "Reads can go to any replica, but anything that changes data is a write for the leader.",
    },
    {
      type: "pick",
      q: "A user wants to change their email address. Tap the node that must receive this request.",
      fig: wrFig(),
      a: "L",
      why: "Changing data is a write, and writes can only be sent to the leader. Followers serve reads and replay the leader's log.",
    },
    {
      type: "slider",
      q: "A cluster has 3 machines (one leader, two followers). Each can do 600 operations a second. Writes arrive at 100 a second, and every machine applies all of them. About how many reads a second can the cluster serve in total?",
      min: 0,
      max: 2000,
      step: 100,
      start: 600,
      ans: 1500,
      tol: 200,
      unit: " reads/s",
      hint: "Each machine has 600 - 100 = 500 left for reads. Three machines: 3 × 500.",
      why: "Every machine spends 100 operations a second applying writes, leaving 500 for reads: 3 × 500 = 1,500. Followers add read capacity but not write capacity.",
    },
    {
      type: "mcq",
      q: "A counter starts at 10. The leader gets 'add 5' and then 'double it'. Why must a follower apply the log in the same order?",
      o: [
        "Add-then-double gives 30, double-then-add gives 25",
        "Followers cannot read entries out of order at all",
        "The order decides which follower becomes leader",
        "Applying the entries in a different order is faster",
      ],
      a: 0,
      why: "The two orders give different answers (30 versus 25), so followers must replay changes in the leader's order to hold the same data.",
    },
    {
      type: "multi",
      q: "Which statements about the replication log are true? Select all that apply.",
      o: [
        "The leader sends changes to followers through it",
        "Followers apply its changes in the same order as the leader",
        "Followers write changes into it and send them to the leader",
        "Clients send their reads through it",
        "It lets each follower keep its own local copy up to date",
      ],
      a: [0, 1, 4],
      why: "The log flows from the leader to the followers and is applied in order. Followers do not feed writes back, and reads do not travel through it.",
    },
    {
      type: "bug",
      q: "This code saves a post, but it can lose or scatter writes in a leader-follower database. Click the faulty line.",
      code: ["def save_post(post):", "    node = random_replica()", "    node.write(post)", "    return 'saved'"],
      a: 1,
      why: "A write must go to the leader, not a random replica. A follower cannot take writes.",
    },
    {
      type: "mcq",
      q: "A news site gets 95 reads for every write. Which change helps most?",
      o: [
        "Add followers, so more machines can serve the reads",
        "Add a second leader that takes half the reads",
        "Remove the replication log to save time",
        "Send every read to the leader only",
      ],
      a: 0,
      why: "Reads can be served by any replica, so more followers raise read capacity, which is what a read-heavy site needs.",
    },
    {
      type: "match",
      q: "Match each term to its role.",
      pairs: [
        ["Leader", "The replica that accepts writes"],
        ["Follower", "A replica that applies the leader's changes and serves reads"],
        ["Replication log", "The stream of changes sent from the leader"],
        ["Read-only query", "A request that can be answered by any replica"],
      ],
      why: "The leader takes writes, followers copy the leader's changes, the log carries them and reads can go anywhere.",
    },
    {
      type: "mcq",
      q: "Which statement about leader-based replication is accurate?",
      o: [
        "It is built into PostgreSQL, MongoDB and MySQL",
        "It exists only in academic research prototypes",
        "It needs a separate language on every replica",
        "It can only be used with one machine at a time",
      ],
      a: 0,
      why: "Leader-follower replication is a standard feature in many DBMSs, including PostgreSQL, MongoDB and MySQL.",
    },
    {
      type: "mcq",
      q: "A follower receives log entries #1, #2, #3 and #4. Which way of applying them keeps it identical to the leader?",
      o: ["#1, #2, #3, #4", "#4, #3, #2, #1", "#2, #1, #4, #3", "Whichever order they arrive in"],
      a: 0,
      why: "Followers apply changes in the same order as the leader. Another order might leave different data.",
    },
  ]);
})();
