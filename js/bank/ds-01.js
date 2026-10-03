/* Revision bank content for one course, merged from the earlier part files (loaded on demand by js/bank.js, never on startup). Append new questions at the end with NIC.bank.add(...). */
/* ===== bank-ds.js ===== */
/* Data Science revision bank — concepts only (no SQL syntax), new scenarios, no calculator needed. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("ds-why", [
    {
      type: "multi",
      q: "A photo-sharing startup runs everything on one server. Which problems is it exposed to? Select all.",
      o: [
        "If the server dies, the whole service is down",
        "Growth is capped by the biggest machine money can buy",
        "Upgrades mean taking the service offline",
        "It can't store images",
      ],
      a: [0, 1, 2],
      why: "Availability, scalability and maintenance are the three limits of a single machine. Storing images is fine.",
    },
    {
      type: "cat",
      q: "During a network split, which matters more for each feature?",
      buckets: ["Consistency", "Availability"],
      items: [
        ["Moving money between bank accounts", 0],
        ["Showing a post's like count", 1],
        ["Selling the last seat on a flight", 0],
        ["A page-view counter", 1],
      ],
      why: "If a wrong answer costs money or double-books, wait for consistency. If a slightly stale number is harmless, stay available.",
    },
    M(
      'Two data centres lose contact. A customer asks for their balance. Which reply is the "choose consistency" answer?',
      [
        "Show the last known balance immediately",
        "Refuse or wait until the copies confirm they agree",
        "Show a balance of zero until they reconnect",
        "Show whichever copy answers first",
      ],
      1,
      "Consistency means never answering with possibly-wrong data, even if that means not answering yet.",
    ),
    M(
      "What changed with the web that made one big server stop being enough?",
      [
        "Disks became too small to hold a company's data",
        "Fast-growing user numbers and pages built on the fly",
        "Relational databases stopped being allowed on the web",
        "Networks became too slow for one server",
      ],
      1,
      "Scale and dynamic content broke the one-mainframe model.",
    ),
    TF(
      "Adding a second server removes all of a single server's problems.",
      false,
      "It helps availability and capacity, but now the copies have to be kept in sync.",
    ),
  ]);
  B.add("ds-blocks", [
    {
      type: "cat",
      q: "A news website. Which building block handles each job?",
      buckets: ["Database", "Cache", "Search index", "Batch job"],
      items: [
        ["Keep every published article safely", 0],
        ['Serve the "most read" list to millions of visitors quickly', 1],
        ["Find articles by any keyword", 2],
        ["Recompute recommendations every night", 3],
      ],
      why: "Durable storage, fast repeated reads, keyword lookup and periodic heavy computation.",
    },
    M(
      "What's the classic risk of a cache?",
      [
        "It's slower than going straight to the database",
        "It can serve stale data after the source changes",
        "It keeps data permanently, so disks fill up",
        "It can't hold text, only numbers",
      ],
      1,
      "Keeping caches up to date (invalidation) is the hard part.",
    ),
    M(
      "Finding one record by key among a million: a full scan checks up to 1,000,000 records. Roughly how many steps does a sorted index need?",
      ["about 20", "about 1,000", "about 500,000", "1,000,000"],
      0,
      "Halving a million repeatedly reaches 1 in about 20 steps (2²⁰ ≈ 10⁶).",
    ),
    M(
      '"Restaurants within 1 km of me" is slow with an ordinary index on name. Why?',
      ["Names are too long", "The question is spatial", "Restaurants can't be indexed", "It needs a batch job"],
      1,
      "Same building block, different implementation: pick the one that fits the question.",
    ),
    TF(
      "A cache is the right place for data you must never lose.",
      false,
      "Caches can be wiped at any time. Durable data belongs in the database.",
    ),
  ]);
  B.add("ds-reliability", [
    {
      type: "cat",
      q: "Hardware fault or software fault?",
      buckets: ["Hardware", "Software"],
      items: [
        ["A power supply burns out", 0],
        ["A date-handling bug crashes every server at midnight", 1],
        ["A disk develops bad sectors", 0],
        ["A runaway process eats all memory on every node", 1],
      ],
      why: "Hardware faults hit single components. Software faults can hit every machine running the same code at once.",
    },
    M(
      "Why are software faults often more dangerous than hardware faults?",
      ["They're more common", "They're correlated", "They can't be fixed", "They only happen at night"],
      1,
      "Redundancy protects against independent failures, not against the same bug everywhere.",
    ),
    M(
      "A cluster has 20,000 disks. If 10,000 disks lose about one a day, how many die per day here?",
      ["about 1", "about 2", "about 20", "about 200"],
      1,
      "Twice the disks, twice the failures: about 2 a day.",
    ),
    M(
      "One overloaded node fails and its work moves to the rest, which then fail too. What helps prevent this?",
      [
        "Removing monitoring to reduce the load on every node",
        "Spare capacity and limits that shed excess load",
        "Running fewer servers",
        "Disabling retries entirely",
      ],
      1,
      "Headroom and load shedding stop a cascade.",
    ),
    M(
      "Why do some teams deliberately kill servers in production (chaos testing)?",
      [
        "To save money by permanently removing spare servers",
        "To check that faults really are tolerated",
        "To make users switch providers",
        "Because it's required by law",
      ],
      1,
      "Fault tolerance you've never exercised is fault tolerance you don't have.",
    ),
  ]);
  B.add("ds-load", [
    {
      type: "cat",
      q: "Match each system to the load parameter that matters most.",
      buckets: ["Requests per second", "Read/write ratio", "Simultaneously active users"],
      items: [
        ["A public web API", 0],
        ["A database that is mostly queried, rarely updated", 1],
        ["A group video-call service", 2],
      ],
      why: "Pick the number that actually stresses that system.",
    },
    M(
      '"p95 = 300 ms" means…',
      [
        "The average is 300 ms",
        "95% of requests finish within 300 ms",
        "5% of requests finish within 300 ms",
        "The fastest request takes 300 ms",
      ],
      1,
      "Percentiles describe the distribution, not just the middle.",
    ),
    M(
      "Sorted response times (ms): 40, 45, 50, 55, 60, 70, 80, 120, 400, 900. What's p90?",
      ["80", "120", "400", "900"],
      2,
      "90% of 10 is 9, so it's the 9th value: 400.",
    ),
    M(
      "One page load calls 10 backend services and waits for all of them. Why do tail latencies matter even more here?",
      [
        "They don't: only the average matters",
        "The page is as slow as its slowest call",
        "The ten averages add up",
        "Only the first call's speed counts",
      ],
      1,
      "Fan-out amplifies the tail.",
    ),
    M(
      "Load doubles and you want the same response times. What's the question to ask?",
      [
        "How slow will it get?",
        "How many more resources do we need?",
        "Can we remove monitoring?",
        "Should we stop logging?",
      ],
      1,
      "Fix performance, then ask what capacity that takes.",
    ),
  ]);
  B.add("ds-twitter", [
    M(
      "Merge-on-read: a user follows 300 accounts. What must happen each time they open their timeline?",
      [
        "One lookup in their precomputed timeline, nothing more",
        "Fetch posts from all 300 accounts and merge them",
        "Nothing: it's precomputed at write time",
        "Delete posts older than a day",
      ],
      1,
      "All the work happens at read time.",
    ),
    M(
      "Fan-out-on-write: someone with 1,000 followers posts once. How many timeline-cache writes?",
      ["1", "1,000", "1,000,000", "0"],
      1,
      "One copy into each follower's timeline.",
    ),
    M(
      "Why did Twitter move work from read time to write time?",
      [
        "Writes cost nothing in their database, so why not",
        "Timelines are read far more often than tweets are posted",
        "Reading timelines had been banned",
        "It uses less storage overall",
      ],
      1,
      "Doing the work once per post beats doing it on every one of many more reads.",
    ),
    {
      type: "cat",
      q: "Which approach suits each system best?",
      buckets: ["Merge on read", "Fan out on write"],
      items: [
        ["A social app where people read about 100× more than they post", 1],
        ["An account followed by 40 million people", 0],
        ["A logging tool where entries are written constantly but rarely read", 0],
      ],
      why: "Fan out when reads dominate. Merge on read when writes would explode (huge follower counts) or reads are rare.",
    },
    M(
      "In the hybrid scheme, where do a celebrity's posts come from when a fan opens their timeline?",
      [
        "The fan's precomputed timeline cache",
        "They're fetched and merged in at read time",
        "They're emailed to each fan",
        "They're not shown at all",
      ],
      1,
      "Huge accounts skip fan-out; their posts are merged in when you read.",
    ),
  ]);
  B.add("ds-scaling", [
    {
      type: "cat",
      q: "Scaling up or scaling out?",
      buckets: ["Scale up", "Scale out"],
      items: [
        ["Buy a machine with more CPUs and RAM", 0],
        ["Add more ordinary machines", 1],
        ["Still a single point of failure", 0],
        ["Machines must coordinate and stay consistent", 1],
      ],
      why: "Up = one bigger box. Out = many boxes sharing the work.",
    },
    M(
      '"Shared-nothing" architecture means…',
      [
        "All machines share one big central disk",
        "Each machine has its own CPU, memory and disk",
        "No data is stored on the machines",
        "One machine does all the real work",
      ],
      1,
      "Independence is what makes scaling out and fault tolerance possible.",
    ),
    M(
      "Why doesn't scaling up stay cheap?",
      [
        "Big machines need much more office space and cooling",
        "Double the power costs far more than double, up to a limit",
        "Big machines need more staff to run",
        "Machines above a certain size are banned",
      ],
      1,
      "High-end hardware prices rise faster than capacity.",
    ),
    M(
      "A small app with modest, steady load and a tiny team. Sensible first move?",
      ["Build a 100-node cluster", "Keep it simple", "Rewrite in a new language", "Remove the database"],
      1,
      "Distribution adds complexity; pay for it when the load demands it.",
    ),
    TF(
      "Scaling out removes the need to think about consistency.",
      false,
      "It creates the need: copies on different machines must agree.",
    ),
  ]);
  B.add("ds-maintain", [
    {
      type: "cat",
      q: "Operability, simplicity or evolvability?",
      buckets: ["Operability", "Simplicity", "Evolvability"],
      items: [
        ["Clear dashboards and alerts", 0],
        ["Removing tangled, accidental complexity", 1],
        ["Adding a new feature takes days, not months", 2],
        ["No dependency on one special machine", 0],
        ["Good abstractions that hide messy details", 1],
      ],
      why: "Easy to run, easy to understand, easy to change.",
    },
    M(
      "Most of a system's lifetime cost usually comes from…",
      [
        "Writing and testing the very first version of the system",
        "Running it and changing it afterwards",
        "Buying the first servers and licences",
        "Designing the logo and name",
      ],
      1,
      "Maintenance dominates, so design for it.",
    ),
    M(
      "Which is <b>essential</b> complexity for a train-booking system?",
      [
        "Three different date formats used across the services",
        "Fares that truly depend on time, route and railcard",
        "An undocumented deploy script that only one person runs",
        "A config flag nobody understands",
      ],
      1,
      "Fare rules are part of the problem itself. The rest comes from how it was built.",
    ),
    M(
      "A good abstraction…",
      [
        "exposes every internal detail",
        "hides details behind a clean interface",
        "adds features",
        "slows the system down deliberately",
      ],
      1,
      "A high-level language hides machine code in the same way.",
    ),
    TF(
      "Making a system simpler means removing features.",
      false,
      "Simplicity means removing accidental complexity, not functionality.",
    ),
  ]);
})();
