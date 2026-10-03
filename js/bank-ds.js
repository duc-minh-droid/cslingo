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

/* ===== bank-ds-2.js ===== */
/* Data Science revision bank, part 2 (revision mode only). Concepts only, no SQL syntax, no calculator needed. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("ds-why", [
    M(
      "Before the web took off, a company's data typically lived…",
      [
        "across thousands of cheap servers in several data centres",
        "on one big server, in a relational database",
        "in an in-memory cache only",
        "on employees' own computers",
      ],
      1,
      "The mainframe era: one machine, fixed schema.",
    ),
    M(
      '"Dynamically generated content" means…',
      [
        "pages are printed out on demand for each visitor",
        "each page is built on the fly per request",
        "pages never change once written",
        "content is cached forever",
      ],
      1,
      "Every visit can trigger fresh work on the server.",
    ),
    M(
      "A warehouse app shows stock counts. During a network split, one copy says 3 left, another says 0. Which choice favours consistency?",
      [
        "Show 3 left and sell immediately",
        "Refuse the order until the copies agree",
        "Show 0 and cancel all orders",
        "Show both numbers to the customer",
      ],
      1,
      "Consistency means never acting on possibly-wrong data.",
    ),
    TF(
      "One server is enough for a global app with millions of users.",
      false,
      "Availability, scalability and maintenance all break at that scale.",
    ),
    M(
      "You add a second database server. What new problem appears?",
      [
        "None: two servers just double capacity",
        "Keeping the two copies in sync",
        "It can no longer store large data",
        "Users can no longer log in",
      ],
      1,
      "Copies can disagree.",
    ),
    M(
      "Why is maintenance hard on a single server?",
      [
        "It isn't: one server is the easiest thing to maintain",
        "Upgrades or repairs take the whole service offline",
        "It has no disk to install updates on",
        "It can't run software updates at all",
      ],
      1,
      "No spare machine to carry the load meanwhile.",
    ),
    {
      type: "cat",
      q: "Which single-server limitation is this?",
      buckets: ["Availability", "Scalability", "Maintenance"],
      items: [
        ["A power cut takes the whole site down", 0],
        ["Black Friday traffic exceeds what one machine can handle", 1],
        ["Installing a security patch requires a 2-hour outage", 2],
      ],
      why: "Down, too small, or hard to change.",
    },
    M(
      '"Commodity computers" are…',
      [
        "supercomputers built for one specialised task",
        "ordinary, cheap, widely available machines",
        "mainframes shared by many users",
        "phones and tablets",
      ],
      1,
      "The building blocks of scaling out.",
    ),
    M(
      "The lecture's second trade-off is between…",
      [
        "the speed and the colour of the hardware",
        "one powerful system vs many cheap computers",
        "SQL vs NoSQL databases",
        "a cache vs an index",
      ],
      1,
      "Big box vs many boxes.",
    ),
    M(
      'A "stale read" is…',
      [
        "a read that fails with an error",
        "reading data that's slightly out of date",
        "a query that runs very slowly",
        "reading a record that was deleted",
      ],
      1,
      "The price of choosing availability.",
    ),
  ]);
  B.add("ds-blocks", [
    M(
      'A cache "hit" means…',
      [
        "the cache had to fetch from the database",
        "the requested result was already in the cache",
        "the cached data had expired",
        "the cache ran out of space",
      ],
      1,
      "Hits are fast; misses fall back to the slow path.",
    ),
    M(
      "Which is a batch-processing job?",
      [
        "Answering a user's search request as they type",
        "Nightly recomputing of recommendations",
        "Serving a page straight from the cache",
        "Logging a user in",
      ],
      1,
      "Large, periodic, not interactive.",
    ),
    M(
      "What's the trade-off of adding an index?",
      [
        "None: indexes are free once they're built",
        "Faster lookups, but more storage and slower writes",
        "Slower reads, but faster writes",
        "Less storage, but slower lookups",
      ],
      1,
      "Every write also updates the index.",
    ),
    TF("Adding an index speeds up writes.", false, "Writes get slightly slower; reads get faster."),
    {
      type: "cat",
      q: "An online shop. Which block handles each job?",
      buckets: ["Database", "Cache", "Search index", "Batch job"],
      items: [
        ["Store every order permanently", 0],
        ["Keep recently viewed products ready for instant display", 1],
        ["Search products by keyword", 2],
        ["Produce the monthly sales report", 3],
      ],
      why: "Durable storage, fast repeats, keyword lookup, periodic crunching.",
    },
    M(
      "A cache has room for only a few items. What should it keep?",
      [
        "The oldest items, since they've proven useful the longest",
        "The most frequently or recently used items",
        "A random selection of items",
        "Nothing: caches should stay empty",
      ],
      1,
      "Keep the hot items close.",
    ),
    M(
      "The cache goes down but the database is fine. What happens?",
      [
        "Data in the cache is lost for good",
        "The app still works, just slower",
        "Nothing changes at all",
        "The database fails too",
      ],
      1,
      "A cache is an accelerator, not the source of truth.",
    ),
    M(
      '"Same building block, different implementations" means…',
      [
        "All databases work the same way under the hood, whatever the data",
        "The right implementation depends on the problem",
        "Only one kind of index exists",
        "A cache is just a kind of database",
      ],
      1,
      "Choose by the kind of question you ask.",
    ),
    M(
      "Without an index, the time to find a record grows…",
      [
        "not at all, because records are stored in order",
        "in proportion to the amount of data (a full scan)",
        "logarithmically",
        "exponentially",
      ],
      1,
      "Check every record.",
    ),
    M(
      "Batch processing vs real-time: the batch job's result is typically…",
      [
        "instant, like any other query on the database",
        "available after the job runs (e.g. next morning)",
        "never available to users",
        "usually wrong",
      ],
      1,
      "Batch trades freshness for efficiency.",
    ),
  ]);
  B.add("ds-reliability", [
    {
      type: "multi",
      q: "According to the lecture, a reliable application… (select all)",
      o: [
        "performs the function the user expected",
        "tolerates user mistakes",
        "performs well enough under expected load",
        "prevents unauthorised access",
        "never has any faults",
      ],
      a: [0, 1, 2, 3],
      why: "Faults will happen; reliability is about coping with them.",
    },
    M(
      "What's the goal of fault tolerance?",
      [
        "Eliminate every fault before it can ever happen",
        "Stop faults from turning into failures",
        "Hide faults from engineers",
        "Detect faults faster",
      ],
      1,
      "Faults are inevitable; failures shouldn't be.",
    ),
    M(
      "What does RAID do for disks?",
      [
        "Speeds up the CPU by spreading work across disks",
        "Stores data redundantly so a dead disk loses nothing",
        "Encrypts everything on disk",
        "Compresses data to save space",
      ],
      1,
      "Classic hardware redundancy.",
    ),
    TF(
      "A fault and a failure are the same thing.",
      false,
      "A fault is one component misbehaving; a failure is the whole service stopping.",
    ),
    M(
      "Which is a correlated software fault?",
      [
        "One disk dies of old age in a single server",
        "A bug triggered by the same date everywhere",
        "A single power supply fails",
        "One network cable is cut",
      ],
      1,
      "Same code, same bug, everywhere at once.",
    ),
    M(
      "How can a system reduce damage from human (operator) mistakes?",
      [
        "Remove humans from operations entirely",
        "Easy rollback, safe sandboxes and clear interfaces",
        "Hide errors so operators aren't distracted",
        "Disable logging to reduce noise",
      ],
      1,
      "Make mistakes cheap to undo.",
    ),
    M(
      "Why should an app tolerate users entering unexpected input?",
      [
        "It shouldn't: users must follow the rules",
        "Users will do it, and the app should keep working",
        "To collect more data about users",
        "Because it makes the app faster",
      ],
      1,
      "Part of the lecture's definition of reliable.",
    ),
    M(
      "A cascading failure is…",
      [
        "one fault that is quickly contained",
        "one node failing overloads others",
        "a planned shutdown of every node",
        "a burst of cache misses",
      ],
      1,
      "The domino effect.",
    ),
    M(
      "Which is an example of redundancy?",
      [
        "One very reliable, expensive power supply",
        "Two power supplies, either able to run it",
        "Deleting old backups to save space",
        "A single high-quality network cable",
      ],
      1,
      "A spare takes over when one fails.",
    ),
    {
      type: "cat",
      q: "Hardware, software or human fault?",
      buckets: ["Hardware", "Software", "Human"],
      items: [
        ["An admin deletes the wrong folder", 2],
        ["A memory module fails", 0],
        ["A leap-second bug crashes every node", 1],
      ],
      why: "Three different sources, each needing different defences.",
    },
  ]);
  B.add("ds-load", [
    M(
      "p50 is another name for…",
      ["the mean", "the median", "the maximum", "the minimum"],
      1,
      "Half of requests are faster, half slower.",
    ),
    M(
      "Why do companies care about p99, not just the median?",
      [
        "It's easier to compute than the median on large logs",
        "The slowest requests often hit the most valuable users",
        "It's always lower than the median",
        "It's required by law",
      ],
      1,
      "Tail latency hits the heaviest users.",
    ),
    M(
      "Throughput is…",
      [
        "time taken per request",
        "work done per unit time (e.g. records per second)",
        "memory used per request",
        "number of active users",
      ],
      1,
      "Batch systems care about throughput.",
    ),
    TF(
      "An average response time of 200 ms means most users see about 200 ms.",
      false,
      "A few very slow requests can pull the mean far above what most users see.",
    ),
    M(
      "For Twitter, which are sensible load parameters?",
      [
        "Screen sizes of users' devices",
        "Tweets posted and timelines read per second",
        "Number of servers in the data centre",
        "Font size of the timeline",
      ],
      1,
      "Numbers that stress the system.",
    ),
    M(
      "1,000 requests, p99 = 800 ms. How many requests took longer than 800 ms?",
      ["about 1", "about 10", "about 100", "about 990"],
      1,
      "1% of 1,000.",
    ),
    M(
      "A page makes 5 backend calls in parallel and waits for all of them. What decides its speed?",
      ["The fastest call", "The slowest call", "The average call", "The first call"],
      1,
      "Tail latency amplification.",
    ),
    M(
      "Why run a load test?",
      [
        "To stress-test the office Wi-Fi and network cabling",
        "To see how performance changes as load grows",
        "To clear out old data",
        "To reduce storage costs",
      ],
      1,
      "Measure before it matters.",
    ),
    {
      type: "cat",
      q: "Which performance measure matters most?",
      buckets: ["Response time", "Throughput"],
      items: [
        ["A checkout page", 0],
        ["An overnight job processing all of yesterday's logs", 1],
        ["A search box", 0],
        ["Training a model on a big dataset", 1],
      ],
      why: "Interactive: response time. Batch: throughput.",
    },
    M(
      '"Keep the system the same and increase load" asks…',
      ["how many machines to buy", "how performance changes", "how to delete data", "how to add features"],
      1,
      "The other question fixes performance and asks about resources.",
    ),
  ]);
  B.add("ds-twitter", [
    M(
      "Twitter (2012): about 4.6k tweets/s vs 300k timeline reads/s. Roughly how many times more reads?",
      ["about 6×", "about 65×", "about 650×", "equal"],
      1,
      "300 / 4.6 ≈ 65.",
    ),
    M(
      "Average tweet goes to about 75 followers, at 4.6k tweets/s. Fan-out writes per second?",
      ["about 4,600", "about 35,000", "about 345,000", "about 3.4 million"],
      2,
      "4,600 × 75 = 345,000.",
    ),
    M(
      "In approach 1, where are new tweets stored?",
      ["In each follower's timeline", "In one global collection", "In the user's browser", "Nowhere"],
      1,
      "Write once, merge on read.",
    ),
    M(
      "In approach 2, what drives the cost of posting?",
      [
        "The length of the tweet",
        "How many followers the poster has",
        "The time of day it's posted",
        "The number of hashtags used",
      ],
      1,
      "One copy per follower.",
    ),
    TF("Fan-out on write makes posting slower but reading faster.", true, "Work moves from read time to write time."),
    M(
      "A user with 30 million followers posts. At 345k writes/s, fan-out takes roughly…",
      ["1 second", "9 seconds", "87 seconds", "15 minutes"],
      2,
      "30,000,000 / 345,000 ≈ 87 s.",
    ),
    M(
      "Twitter aimed to deliver tweets to followers within…",
      ["5 seconds", "5 minutes", "1 hour", "1 day"],
      0,
      "The celebrity fan-out blew past that target.",
    ),
    M(
      "Downside of fan-out on write besides posting cost?",
      ["None", "Storage", "Reads get slower", "Tweets get shorter"],
      1,
      "Millions of copies of popular posts.",
    ),
    M(
      "Which load parameter turned out to matter most for Twitter's design?",
      [
        "The average length of a tweet",
        "The distribution of followers per user",
        "The number of hashtags per tweet",
        "The size of attached images",
      ],
      1,
      "A few huge accounts break the average-case design.",
    ),
    M(
      "In the hybrid, which users are fanned out on write?",
      [
        "Celebrities with millions of followers",
        "Most ordinary users",
        "Nobody: everything is merged on read",
        "Everyone, including celebrities",
      ],
      1,
      "Best of both approaches.",
    ),
  ]);
  B.add("ds-scaling", [
    M(
      "Vertical scaling is another name for…",
      ["scaling out", "scaling up", "caching", "indexing"],
      1,
      "Bigger machine.",
    ),
    M(
      "Horizontal scaling is another name for…",
      ["scaling up", "scaling out", "batch processing", "sharding a cache"],
      1,
      "More machines.",
    ),
    M(
      "A shared-memory architecture corresponds to…",
      ["scaling up (one big box)", "scaling out (many boxes)", "no scaling at all", "adding a cache layer"],
      0,
      "Everything in one machine.",
    ),
    TF(
      "Scaling out gives better fault tolerance than scaling up.",
      true,
      "One machine failing doesn't stop the others.",
    ),
    M(
      '"Elasticity" means…',
      [
        "machines physically stretching to fit more parts",
        "adding or removing machines automatically as load changes",
        "swapping in a bigger disk when it fills",
        "queries slowing down gracefully under load",
      ],
      1,
      "Common in cloud systems that scale out.",
    ),
    M(
      'A "partial failure" is…',
      [
        "a complete outage of the whole system at once",
        "some parts failing while others keep working",
        "a single query that runs slowly",
        "a bug in the user interface",
      ],
      1,
      "A problem that only exists in distributed systems.",
    ),
    M(
      "Why don't big machines scale cost-effectively?",
      [
        "They do: cost grows roughly in line with the power you buy",
        "Cost outgrows capacity, and there's a size limit",
        "They're cheaper per unit of power than small machines",
        "They use less electricity overall",
      ],
      1,
      "Superlinear pricing plus a ceiling.",
    ),
    {
      type: "cat",
      q: "Scale up or scale out?",
      buckets: ["Scale up", "Scale out"],
      items: [
        ["Upgrade from 16 GB to 512 GB of RAM", 0],
        ["Run 20 web servers behind a load balancer", 1],
        ["Replace the CPU with a faster one", 0],
        ["Split users across several databases", 1],
      ],
      why: "Bigger box vs more boxes.",
    },
    M(
      "Main cost of scaling out?",
      [
        "Nothing: it's strictly better",
        "Coordination and consistency between machines",
        "Losing all fault tolerance",
        "Paying more for each individual machine",
      ],
      1,
      "Complexity is the price.",
    ),
    M(
      "Which service is easiest to scale out?",
      ["One holding lots of in-memory state", "A stateless web server", "A single master database", "A mainframe"],
      1,
      "No state to keep in sync.",
    ),
  ]);
  B.add("ds-maintain", [
    {
      type: "order",
      q: "Name the three parts of maintainability, in the lecture's order.",
      items: ["Operability", "Simplicity", "Evolvability"],
      why: "Easy to run, easy to understand, easy to change.",
    },
    M(
      "Operability is mainly about…",
      [
        "how fast the code runs on each individual request",
        "making life easy for the team running it",
        "how quickly new features can be shipped to users",
        "how the user interface looks",
      ],
      1,
      "Good ops support.",
    ),
    M(
      "Simplicity is achieved by…",
      [
        "removing features users rarely need",
        "removing accidental complexity",
        "splitting into more services",
        "rewriting everything from scratch",
      ],
      1,
      "Keep the essential, drop the incidental.",
    ),
    M(
      "Evolvability is…",
      [
        "how quickly the system starts up after a restart",
        "how easily it can be changed for new needs",
        "how many users the system can hold at once",
        "how thoroughly the system is monitored",
      ],
      1,
      "Change is inevitable.",
    ),
    TF(
      "Most of a software system's cost comes from building the first version.",
      false,
      "Ongoing maintenance dominates.",
    ),
    M(
      "Why are legacy systems painful?",
      [
        "They use technology that's too new",
        "Hard to understand and risky to change",
        "They run too fast to monitor",
        "They no longer have any users",
      ],
      1,
      "Low maintainability in practice.",
    ),
    M(
      "Which is an example of good abstraction?",
      [
        "Copy-pasting the same code everywhere",
        "A clean interface that hides messy details",
        "Scripts that only one person understands",
        "Values hard-coded throughout the code",
      ],
      1,
      "Users of it don't need the details.",
    ),
    {
      type: "cat",
      q: "Which part of maintainability does this help most?",
      buckets: ["Operability", "Simplicity", "Evolvability"],
      items: [
        ["Health dashboards and alerts", 0],
        ["Deleting an unused layer of indirection", 1],
        ["Loosely coupled modules that can be swapped out", 2],
      ],
      why: "Run it, understand it, change it.",
    },
    M(
      '"Predictable behaviour" helps operators because…',
      [
        "it makes the system run faster under heavy load",
        "fewer surprises: fewer emergencies, easier fixes",
        "it removes the need for logs and dashboards",
        "it adds new features automatically",
      ],
      1,
      "Surprises are expensive.",
    ),
    M(
      '"Support for automation" means…',
      [
        "no humans are ever needed to run it again",
        "routine tasks can be scripted with standard tools",
        "every deploy is done carefully by hand",
        "the system behaves randomly",
      ],
      1,
      "Part of operability.",
    ),
  ]);
})();

/* ===== bank-ds-3.js ===== */
/* Data Science revision bank, part 3 (revision mode only). Lecture 2: data models, schema, graphs, NoSQL. Concepts only, no SQL syntax, no calculator. Numbers verified with node. */
(function () {
  const B = NIC.bank,
    Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  /* A small ferry network for the pick questions. */
  const PORTS = { A: [60, 130], B: [170, 50], C: [170, 210], D: [290, 130], E: [400, 60], F: [400, 210] };
  const ROUTES = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["C", "D"],
    ["D", "E"],
    ["D", "F"],
    ["E", "F"],
  ];

  B.add("ds-models", [
    M(
      "What does a data model do for an application?",
      [
        "It maps the app's objects to a stored form such as tables or JSON",
        "It copies the app's objects onto extra servers, so a crash never loses any of them",
        "It scrambles the app's objects so outsiders cannot read them",
        "It times how long the app's objects take to load",
      ],
      0,
      "A data model is the mapping between an application entity and how a system stores it.",
    ),
    TF(
      "An object-relational mapper (ORM) removes any mismatch between objects and tables.",
      false,
      "It automates the translation, but the fit is still often unintuitive from the business point of view.",
    ),
    {
      type: "cat",
      q: "A plant nursery app. Which kind of relationship is each one?",
      buckets: ["One-to-many", "Many-to-one", "Many-to-many"],
      items: [
        ["One greenhouse holds many plants, each in only that greenhouse", 0],
        ["Hundreds of plants all come from the same supplier", 1],
        ["Gardeners follow many gardeners and are followed by many", 2],
        ["One plant has several care tips that belong only to it", 0],
      ],
      why: "One parent with owned children is one-to-many; many records sharing one entity is many-to-one; links that go both ways in bulk are many-to-many.",
    },
    M(
      "Which is NOT one of the lecture's ways to store a one-to-many list such as a profile's positions?",
      [
        "A separate table whose rows carry a foreign key to the user",
        "A structured JSON or XML column inside the user row",
        "JSON or XML text kept in a plain text field",
        "A separate database server that holds one copy per position",
      ],
      3,
      "The three options are normalised tables, a structured column, or text in a field. Adding servers is a scaling tool, not a data model.",
    ),
    {
      type: "match",
      q: "Match each way of storing a gardener's list of plants to its main trait.",
      pairs: [
        ["Separate table with a foreign key", "Each row points back to its owner"],
        ["Structured JSON column", "Nested data can still be indexed and queried"],
        ["JSON text in a text field", "The database sees only opaque text"],
      ],
      why: "Normalised rows link by key, a structured column stays queryable, and plain text is opaque to the database.",
    },
    TF(
      "All documents in one collection must have exactly the same fields.",
      false,
      "Documents in a single store can differ from one another; that flexibility is the point.",
    ),
    M(
      "Which of these is an example of a document database?",
      ["CouchDB", "Cassandra", "DynamoDB", "PostgreSQL"],
      0,
      "CouchDB, MongoDB and Firestore are the lecture's document stores. Cassandra is wide-column, DynamoDB key-value, PostgreSQL relational.",
    ),
    M(
      "Why do document models handle many-to-many links badly?",
      [
        "Shared data is copied into many documents, or joined with clumsy support",
        "Documents cannot hold more than one link, so each needs its own file",
        "Documents forget their links whenever the database restarts or is moved to a new machine",
        "Every link forces the whole collection to be locked while it is read",
      ],
      0,
      "Without good joins, the same data is either duplicated or fetched by slower, more complicated join features.",
    ),
    {
      type: "multi",
      q: "Which are genuine advantages of the relational model over the document model? Select all that apply.",
      o: [
        "Better support for joins",
        "Better support for many-to-one and many-to-many links",
        "All of an object's data is stored together in one place",
        "Documents in the same table can each have different fields",
      ],
      a: [0, 1],
      why: "Locality and flexible fields are the document model's strengths. Joins and shared entities are where relational wins.",
    },
    {
      type: "order",
      q: "Put the steps in order for storing a user's list of positions in normalised tables.",
      items: [
        "Give each user row a unique ID",
        "Create a separate table for the positions",
        "Add a column that holds the owner's user ID",
        "Insert one row per position",
      ],
      why: "The ID must exist first, then a child table with a foreign key column, then one row per item.",
    },
    M(
      'Why is translating between objects and tables "not always intuitive"?',
      [
        "Objects nest and link freely, but rows are flat and joined by keys",
        "Objects are stored on disk while tables live only in memory",
        "Objects can only hold numbers, while tables are the only place that can hold any text",
        "Objects change each time they are read, but tables never change",
      ],
      0,
      "One nested object may need several tables and joins to rebuild, which is awkward to reason about.",
    ),
    M(
      '"Semi-structured" documents such as JSON mean the data…',
      [
        "carries its own labels, but needs no fixed table layout",
        "has no labels at all, so it is only ever stored as raw text",
        "must match one shared layout before it can be saved",
        "is split into rows and columns the moment it arrives",
      ],
      0,
      "Keys label the values inside each document, without a rigid schema imposed from outside.",
    ),
    TF(
      "In a normalised design, a profile's positions live in rows that point back to the profile with a foreign key.",
      true,
      "That is the definition of the normalised one-to-many representation.",
    ),
    M(
      "Three gardeners list 5, 2 and 4 plants. How many rows does the separate plants table hold?",
      ["3", "11", "33", "40"],
      1,
      "One row per plant: 5 + 2 + 4 = 11. The three gardeners are rows in a different table.",
      { hint: "One row per plant, so add the three counts: 5 + 2 + 4." },
    ),
  ]);

  B.add("ds-schema", [
    M(
      "Schema-on-read is closest to which idea from programming?",
      [
        "Dynamic typing: the shape is checked when the data is used",
        "Static typing: the shape is checked before the program runs",
        "Garbage collection: unused data is cleaned up later",
        "Compiling: the data is turned into machine code first",
      ],
      0,
      "Neither side checks the shape up front; the code that reads the data deals with whatever it finds.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Schema-on-write", "Structure enforced when data is stored"],
        ["Schema-on-read", "Structure interpreted when the app reads it"],
        ["Locality", "An object's data sits together in one place"],
        ["Heterogeneous data", "Different kinds of object in one collection"],
      ],
      why: "Write-time versus read-time structure, plus the storage layout and data variety that go with them.",
    },
    TF(
      "Most document databases reject a document that is missing a field.",
      false,
      "Most enforce no schema at all, so no field is guaranteed.",
    ),
    {
      type: "cat",
      q: "Which data suits which approach?",
      buckets: ["Schema-on-read", "Schema-on-write"],
      items: [
        ["A catalogue where each product type has very different attributes", 0],
        ["Partner feeds whose format you do not control", 0],
        ["A ledger where every row must have an amount and a date", 1],
        ["A payroll table whose fixed columns every report relies on", 1],
      ],
      why: "Varied or uncontrolled data favours flexible reading. Data with rules that must always hold favours an enforced schema.",
    },
    M(
      'A weather startup replaces a "location" field with separate "lat" and "lon" fields in a document store. Old documents keep the old field. How should the reading code cope?',
      [
        "Test which fields exist and convert the old one when needed",
        "Refuse to read any document that still has the old field",
        "Wait until every stored document has been rewritten into the new shape first",
        "Assume every document already has the new fields",
      ],
      0,
      "Schema-on-read means the application handles both shapes as it reads.",
    ),
    M(
      "A hotel booking page always shows the guest, room, extras and notes for one booking together. How does locality help?",
      [
        "One read fetches the whole booking, not several tables",
        "The booking is copied to a second server to spread the load",
        "The guest's name is stored once and shared by every booking",
        "The extras are sorted alphabetically before they are shown",
      ],
      0,
      "The document is stored as one continuous piece, so one request brings everything back.",
    ),
    TF(
      "Locality is something only document databases can offer.",
      false,
      "Google Spanner offers it in a relational model, and wide-column stores manage it with column families.",
    ),
    {
      type: "multi",
      q: "When does schema-on-read help most? Select all that apply.",
      o: [
        "Different kinds of object share one collection",
        "You do not control the structure of incoming data, such as tweets",
        "Every record must be checked before it is ever saved",
        "Every field must have the same type in all records",
      ],
      a: [0, 1],
      why: "Heterogeneous data and data you cannot control need a tolerant reader. Strict pre-save checks call for schema-on-write.",
    },
    {
      type: "order",
      q: 'Put the steps in order for splitting one "full name" column into first and last names in a relational database.',
      items: [
        "Alter the table to add first-name and last-name columns",
        "Update every existing row to fill the new columns",
        "Deploy code that reads the new columns",
      ],
      why: "The columns must exist before they can be filled, and the app switches over once the data is ready.",
    },
    M(
      "What is the main downside of having no schema at all?",
      [
        "No guarantee which fields a given document contains",
        "The database can no longer store more than one document",
        "Every document must be read twice before it is used",
        "Documents have to be written in alphabetical order",
      ],
      0,
      "Your code cannot assume a field exists, so it must check the shape itself.",
    ),
    {
      type: "slider",
      q: "A table has 200 million rows. Filling in a new column updates 2 million rows every minute. About how many minutes does the update run?",
      min: 0,
      max: 300,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " min",
      hint: "200 million ÷ 2 million per minute.",
      why: "200 ÷ 2 = 100 minutes, which is why large relational changes can need downtime.",
    },
    M(
      'A schema that is "implicit" in a document store lives…',
      [
        "in the application code that reads the documents",
        "in a rulebook the database checks before saving",
        "in the file name of each document",
        "in an index that is rebuilt every night",
      ],
      0,
      "Nothing in the store enforces it; the reading code carries the assumptions.",
    ),
    {
      type: "bug",
      q: "This reader should return a full name from new documents (first_name and last_name) or old ones (name). Click the faulty line.",
      code: [
        "def full_name(doc):",
        '    if "first_name" in doc:',
        '        return doc["first_name"] + " " + doc["last_name"]',
        '    return doc["first_name"]',
      ],
      a: 3,
      why: 'Old documents have no first_name field. The fallback should read doc["name"].',
    },
  ]);

  B.add("ds-graph", [
    M(
      "Which kind of problem is naturally easy for a graph model but awkward for tables or documents?",
      [
        "Many-to-many links followed for several hops",
        "Storing a single long list of monthly totals",
        "Keeping one large text document for each author",
        "Counting how many rows a table currently holds",
      ],
      0,
      "Graphs make relationships the first-class thing, so hopping along them is direct.",
    ),
    {
      type: "cat",
      q: "In a ferry network, is each item a vertex or an edge?",
      buckets: ["Vertex (node)", "Edge"],
      items: [
        ["A port", 0],
        ["A ferry route between two ports", 1],
        ["A passenger in a social network", 0],
        ['A "follows" link between two passengers', 1],
      ],
      why: "Entities are vertices; the relationships between them are edges.",
    },
    {
      type: "match",
      q: "Match each property-graph part to its role.",
      pairs: [
        ["Unique ID", "Identifies one vertex or edge"],
        ["Incoming and outgoing edges", "Let you hop to neighbouring vertices"],
        ["Key-value properties", "Hold extra facts such as a name or a date"],
        ["Relationship label", "Says what kind of link an edge is"],
      ],
      why: "IDs identify, edges connect, properties describe, labels classify the relationship.",
    },
    {
      type: "pick",
      q: "<b>Click the port with the most routes attached to it.</b>",
      fig: Qf.graph(PORTS, ROUTES, { pick: "nodes", w: 460, h: 260 }),
      a: ["D"],
      why: "D has four routes (to B, C, E and F). Every other port has two.",
    },
    {
      type: "pick",
      q: "<b>Click every route that touches port E.</b>",
      fig: Qf.graph(PORTS, ROUTES, { pick: "edges", w: 460, h: 260 }),
      a: ["D-E", "E-F"],
      why: "E connects to D and to F. Those are its only two routes.",
    },
    M(
      "A property graph can be viewed as two relational tables. What do they hold?",
      [
        "Vertices in one table and edges in the other",
        "Reads in one table and writes in the other",
        "Old records in one table and new records in the other",
        "Names in one table and numbers in the other",
      ],
      0,
      "One table lists the vertices with their properties; the other lists the edges with their head, tail, label and properties.",
    ),
    TF(
      "In a property graph, any vertex may be connected to any other vertex.",
      true,
      "There is no restriction on which vertices can be linked; labels say what each link means.",
    ),
    {
      type: "match",
      q: "Match each graph technique to what it does.",
      pairs: [
        ["Dijkstra", "Finds the shortest route across a road network"],
        ["PageRank", "Scores how relevant a web page is for a search"],
        ["Traversal", "Hops along edges from a starting vertex"],
      ],
      why: "Dijkstra and PageRank are the lecture's ready-made graph algorithms; traversal is the basic operation they build on.",
    },
    M(
      "A hospital records which doctors refer patients to which specialists, and wants everyone within three referrals of one doctor. Why fit a graph?",
      [
        "Each vertex leads straight to its edges, so hops are cheap to follow",
        "Graphs store every doctor's name only once on a single server",
        "Graphs stop two doctors from ever sharing the same specialist",
        "Graphs keep every referral in one sorted list on disk",
      ],
      0,
      "Given a vertex you can quickly find its incoming and outgoing edges, so repeated hops stay easy.",
    ),
    {
      type: "multi",
      q: "Which datasets are naturally graphs? Select all that apply.",
      o: [
        "A road network of junctions and roads",
        "Web pages linked to other pages",
        "A social network of people and friendships",
        "A list of 10,000 temperature readings",
      ],
      a: [0, 1, 2],
      why: "Roads, links and friendships are entities joined by relationships. A plain list of readings has no links between items.",
    },
    {
      type: "order",
      q: "Put the steps in order for a two-hop trip starting at vertex A.",
      items: [
        "Start at vertex A",
        "Read A's outgoing edges",
        "Move to one of A's neighbours",
        "Read that neighbour's outgoing edges",
      ],
      why: "Each hop is: read the edges of where you are, then move along one of them.",
    },
    TF(
      "Different edge labels let one graph represent many different kinds of relationship.",
      true,
      'Labels such as "follows" or "works at" sit on edges, so one graph can mix relationships.',
    ),
    M(
      'In a property graph, where would you store "friends since 2019"?',
      [
        "As a property on the friendship edge",
        "As a property on the first friend's vertex only",
        "In a separate document for the year 2019",
        "In the ID of the second friend's vertex",
      ],
      0,
      "A fact about the relationship belongs on the edge that represents it.",
    ),
    TF(
      "To find a vertex's neighbours in a graph, you must scan every edge in the graph.",
      false,
      "A vertex keeps its own incoming and outgoing edges, so its neighbours are found directly.",
    ),
  ]);

  B.add("ds-nosql", [
    {
      type: "cat",
      q: "Which NoSQL family does each product belong to?",
      buckets: ["Document", "Key-value", "Wide-column"],
      items: [
        ["MongoDB", 0],
        ["Firestore", 0],
        ["DynamoDB", 1],
        ["Cassandra", 2],
        ["CouchDB", 0],
      ],
      why: "MongoDB, Firestore and CouchDB are document stores; DynamoDB is key-value; Cassandra is wide-column.",
    },
    M(
      "In the lecture's sense, NoSQL databases are…",
      [
        "non-relational stores that favour simple design and scaling out",
        "relational stores that have no query language and no way to search",
        "databases that only run on a single powerful server",
        "old formats that were replaced by spreadsheets",
      ],
      0,
      "The label means non-relational storage and retrieval, with simplicity, scalability and availability as priorities.",
    ),
    M(
      "In MongoDB, what sits directly inside a database?",
      [
        "Collections of documents",
        "One giant table shared by every document",
        "Foreign-key rules linking every document",
        "A property graph of all the documents",
      ],
      0,
      "Databases hold collections, and collections hold documents.",
    ),
    TF(
      "A wide-column store requires every row to use exactly the same column names.",
      false,
      "Column names and formats can vary from record to record.",
    ),
    M(
      "A session store must get, set and expire a shopping basket by its session ID, millions of times a second. Which family fits best?",
      ["Key-value", "Graph", "Wide-column", "Relational with many joins"],
      0,
      "Every access is by one exact key, which is what key-value stores do best.",
    ),
    {
      type: "match",
      q: "Match each scaling term to its meaning.",
      pairs: [
        ["Horizontal scaling", "Adding more machines to share the load"],
        ["Vertical scaling", "Moving to one bigger machine"],
        ["Availability", "The service keeps answering requests"],
      ],
      why: "NoSQL systems lean on horizontal scaling and availability.",
    },
    {
      type: "multi",
      q: "Which of these are NoSQL families in the lecture? Select all that apply.",
      o: ["Document", "Key-value", "Wide-column", "Graph", "Fixed-schema table store"],
      a: [0, 1, 2, 3],
      why: "The lecture lists document, key-value, wide-column and graph. A fixed-schema table store is the relational approach.",
    },
    {
      type: "order",
      q: "Put MongoDB's building blocks in order, from smallest to largest.",
      items: ["A field with a value", "A document", "A collection", "A database"],
      why: "Fields make up a document, documents fill a collection, collections live in a database.",
    },
    M(
      "A museum catalogue keeps rows in named columns, but paintings, coins and fossils each need different columns. Which family fits?",
      ["Wide-column", "Key-value", "Graph", "Fixed-schema tables"],
      0,
      "Wide-column stores use tables and rows, with column names that can vary per record.",
    ),
    TF(
      "A graph database counts as one of the NoSQL families.",
      true,
      "Graph is the fourth family, alongside document, key-value and wide-column.",
    ),
    M(
      "A ticketing app saves each event with its venue, price tiers and a nested seat map, and always loads it whole. Which family fits?",
      ["Document", "Key-value", "Graph", "Wide-column"],
      0,
      "Self-contained nested records that are read together are the document model's home ground.",
    ),
    M(
      "A rail planner wants the fewest changes between two stations across a web of lines. Which family fits?",
      ["Graph", "Key-value", "Document", "Wide-column"],
      0,
      "Stations are vertices and lines are edges, so route finding follows edges directly.",
    ),
    {
      type: "slider",
      q: "Each server handles 20,000 requests a second and the peak load is 100,000 requests a second. About how many servers share the peak?",
      min: 0,
      max: 12,
      step: 1,
      ans: 5,
      tol: 1,
      unit: " servers",
      hint: "How many 20,000s fit into 100,000?",
      why: "100,000 ÷ 20,000 = 5 servers, the scale-out idea behind NoSQL.",
    },
    M(
      'DynamoDB\'s "complex primary key" combines…',
      [
        "a partition key plus a sort key",
        "a graph edge plus a vertex ID",
        "a table name plus a column name",
        "a document ID plus a collection name",
      ],
      0,
      "The two-part key lets items be grouped by one part and ordered by the other.",
    ),
  ]);
})();

/* ===== bank-ds-4.js ===== */
/* Data Science revision bank, part 4 (revision mode only). Lecture 3: logs, hash indexes, SSTables. Concepts only, no calculator. Numbers verified with node. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("ds-log", [
    M(
      "What are the two fundamental jobs of a database?",
      [
        "Keep data when it is given, and return it when it is asked for",
        "Sort data into tables, and then delete the oldest tables",
        "Copy data to a backup, and then check the backup daily",
        "Compress data on entry, and unpack it on every read",
      ],
      0,
      "Store what you give it, give back what you ask for. Everything else serves those two jobs.",
    ),
    M(
      'In this lecture, a database "log" is…',
      [
        "a file of records where new ones are only added at the end",
        "a diary of every error message the server printed",
        "a list of which users signed in and when",
        "a table that is rebuilt from scratch every hour",
      ],
      0,
      "It is not a log in the traditional sense: old lines are never modified, only appended to.",
    ),
    {
      type: "slider",
      q: "Scanning a sensor log of 4 million readings takes about 8 ms. About how long does a scan of 40 million readings take?",
      min: 0,
      max: 200,
      step: 10,
      ans: 80,
      tol: 15,
      unit: " ms",
      hint: "40 million is 10 times 4 million.",
      why: "A scan is O(n): ten times the data takes ten times as long, so 8 × 10 = 80 ms.",
    },
    {
      type: "cat",
      q: "For a plain append-only log with no index, is each operation fast or slow?",
      buckets: ["Fast", "Slow (scan)"],
      items: [
        ["Append a new reading at the end of the file", 0],
        ["Find the latest reading for sensor 7", 1],
        ["Record a deletion by appending a tombstone", 0],
        ["Confirm a key is not in the file at all", 1],
      ],
      why: "Appending never searches. Any lookup, even for a missing key, has to read the whole file.",
    },
    TF(
      "A tombstone record immediately erases the old data from the file.",
      false,
      "It is a marker appended to say the key is deleted; the old lines are only dropped later.",
    ),
    {
      type: "order",
      q: "Put the life of a deletion in order.",
      items: [
        "The client asks to delete a key",
        "The database appends a tombstone for that key",
        "Later reads of the key meet the tombstone and report it missing",
        "A background merge discards the key's older records",
      ],
      why: "Deletion is a new append first; the space is only reclaimed by a later compaction.",
    },
    {
      type: "multi",
      q: "Which of these are write-heavy (transactional) workloads? Select all that apply.",
      o: [
        "Recording each card payment as it happens",
        "Storing sensor readings that arrive every second",
        "Building a quarterly trend report over all readings",
        "Scanning a year of data to work out averages",
      ],
      a: [0, 1],
      why: "Transactional workloads are write-intensive. Reports and big scans are analytics: read-intensive.",
    },
    M(
      "Why are binary files normally preferred to plain text for a log?",
      [
        "They are more compact and quicker to parse",
        "They can be read by any text editor",
        "They stop keys from ever repeating inside one file",
        "They let the file be edited in the middle",
      ],
      0,
      "Binary formats avoid conversion and waste, so they are usually more efficient.",
    ),
    {
      type: "bug",
      q: "This set() should add a record to the log without losing earlier ones. Click the faulty line.",
      code: [
        "def set(key, value):",
        '    f = open("db.log", "w")',
        '    f.write(key + "," + value + "\\n")',
        "    f.close()",
      ],
      a: 1,
      why: 'Opening in "w" mode wipes the file. It needs append mode ("a") so old records survive.',
    },
    M(
      "A database keeps its hash map in memory only. After a crash and restart, what must it do?",
      [
        "Rebuild the map, for example by re-reading the log",
        "Ask every user to send all of their data again",
        "Delete the log and start with an empty one",
        "Copy the log into a second log before anything else",
      ],
      0,
      "The log on disk survives; the in-memory map is lost and has to be rebuilt from it.",
    ),
    TF(
      "Reading a value from a plain append-only log gets slower as the file grows.",
      true,
      "A lookup scans the file, so the time grows in proportion to its size.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Log", "A file of records added in sequence"],
        ["Tombstone", "A special record marking a key as deleted"],
        ["Transactional workload", "Write-intensive, many small updates"],
        ["Analytics workload", "Read-intensive, scans a lot of data"],
      ],
      why: "Two storage terms and the two workload types that drive engine choices.",
    },
    M(
      "Why is a partially written record a risk?",
      [
        "After a crash, half a record could be read as if it were whole",
        "It makes the log file grow twice as fast as normal",
        "It forces every other record to be rewritten",
        "It changes the key of the record before it",
      ],
      0,
      "A crash mid-write can leave a broken record, so the engine must detect and ignore it.",
    ),
    M(
      "Why is appending to a log so quick?",
      [
        "The write always goes to the end, with no searching or rewriting",
        "The write is copied to several disks before it finishes",
        "The write is sorted into place among older records",
        "The write is held back until the file is compressed",
      ],
      0,
      "There is no lookup and no rewriting, just one sequential write at the end.",
    ),
  ]);

  B.add("ds-hashidx", [
    M(
      "For each key, what does the hash index hold?",
      [
        "The byte position of that key's latest record in the log",
        "A copy of every earlier value that the key ever had, oldest first",
        "The name of the file that holds the oldest record",
        "A count of how often the key has been read",
      ],
      0,
      "The map points to where the newest record starts, so a read can jump straight there.",
    ),
    {
      type: "slider",
      q: "Four log segments each hold updates to the same 250 keys. After compaction merges them into one segment, about how many records remain?",
      min: 0,
      max: 1000,
      step: 50,
      ans: 250,
      tol: 50,
      unit: " records",
      hint: "Compaction keeps one record per key, however many segments there are.",
      why: "One latest record per key: 250 keys means about 250 records, not 4 × 250 = 1,000.",
    },
    {
      type: "order",
      q: "Put a write and a later read in order for a hash-indexed log.",
      items: [
        "Append the key and value to the end of the log",
        "Note the byte offset where that record starts",
        "Store the offset for the key in the hash map",
        "Read the key by looking up its offset and jumping there",
      ],
      why: "The map is updated after every append, and reads use it to skip the scan.",
    },
    {
      type: "cat",
      q: "Is each statement an advantage or a limitation of a hash-indexed log?",
      buckets: ["Advantage", "Limitation"],
      items: [
        ["Writes are sequential, so they are quick", 0],
        ["Updates never overwrite old bytes, which eases crash recovery", 0],
        ["Every key needs an entry held in memory", 1],
        ['"All keys from c to f" turns into many separate lookups', 1],
      ],
      why: "Sequential writes and easy recovery are the strengths. The in-memory map and the lack of ordering are the limits.",
    },
    M(
      "Why are sequential writes faster than random access to a disk?",
      [
        "The disk writes in one continuous place instead of jumping around",
        "The disk skips checking that the data was really saved, so nothing is delayed",
        "The disk keeps every write in memory and never flushes",
        "The disk compresses data as it lands on the platter",
      ],
      0,
      "Random access pays a positioning cost each time; sequential writes avoid it.",
    ),
    TF(
      "A hash index can efficiently return all keys between two given values, in order.",
      false,
      "A hash map has no order, so each key in the range would need its own lookup.",
    ),
    M(
      "Why is the log broken into segments?",
      [
        "Closed segments can be compacted to free disk space",
        "Segments let random writes replace all the appending",
        "Segments make the hash map bigger than the memory",
        "Segments remove the need for any index at all",
      ],
      0,
      "A file is closed at a size limit and writes go to a new one, so older files can be cleaned up.",
    ),
    {
      type: "multi",
      q: "Which requests suit a hash-indexed log? Select all that apply.",
      o: [
        "Fetch the latest value for one exact key",
        "Update one counter again and again",
        "Delete one key by appending a tombstone",
        "List every key between m100 and m900 in order",
      ],
      a: [0, 1, 2],
      why: "Exact-key reads, repeated updates and tombstone deletes are all appends and single lookups. An ordered range is the weakness.",
    },
    {
      type: "bug",
      q: "compact() should keep the newest value for each key. Records arrive oldest first. Click the faulty line.",
      code: [
        "def compact(records):",
        "    latest = {}",
        "    for key, value in reversed(records):",
        "        latest[key] = value",
        "    return latest",
      ],
      a: 2,
      why: "Reversing means the oldest record is written last, so it wins. It should loop over records in their normal order.",
    },
    M(
      "A log holds only distinct keys, each written once. How much does compaction shrink it?",
      [
        "Barely at all, because there are no duplicates to drop",
        "To one record, because compaction keeps a single line",
        "By half, because old segments are always merged in pairs",
        "To nothing, because every record counts as stale",
      ],
      0,
      "Compaction only removes overwritten or deleted values; unique keys all stay.",
    ),
    TF(
      "After compaction, the latest value for each key is still kept.",
      true,
      "Throwing away older duplicates is the whole point; the newest record survives.",
    ),
    M(
      "Why is crash recovery easier with this design?",
      [
        "An update appends a new record instead of overwriting old bytes",
        "An update is copied to a second disk before it finishes",
        "An update rebuilds the whole file from scratch each time",
        "An update skips writing anything until the next restart",
      ],
      0,
      "Old content is never modified, so a crash cannot corrupt earlier data.",
    ),
    M(
      "After a restart, which part of a hash-indexed store has to be rebuilt?",
      [
        "The in-memory hash map",
        "The oldest segment on disk",
        "The tombstones in the log",
        "The keys' original values",
      ],
      0,
      "The log files persist; only the in-memory map is lost and re-read from them.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Segment", "A closed log file of limited size"],
        ["Compaction", "Dropping older values of repeated keys"],
        ["Byte offset", "Where a record starts in the file"],
        ["Hash map", "An in-memory lookup from key to offset"],
      ],
      why: "The four pieces of the hash-indexed log design.",
    },
  ]);

  B.add("ds-sstable", [
    TF(
      "In an SSTable segment, each key appears many times.",
      false,
      "An SSTable holds each key once per segment, and keeps the segment sorted by key.",
    ),
    M(
      "Old segment: a=1, c=3, e=5. Newer segment: c=9, d=4. After merging, what value does c hold?",
      ["3", "9", "12", "4"],
      1,
      "The newer segment wins for a repeated key, so c keeps 9.",
      { hint: "When two segments hold the same key, keep the value from the newer one." },
    ),
    {
      type: "order",
      q: "After merging the old segment (a=1, c=3, e=5) with the newer one (c=9, d=4), put the merged records in order.",
      items: ["a=1", "c=9", "d=4", "e=5"],
      why: "The merged segment stays sorted by key: a, c, d, e, with the newest value for c.",
    },
    M(
      "A sorted segment's sparse index holds only the keys a, h and p, with their offsets. You want key k. Where do you scan?",
      [
        "From h up to p",
        "The whole file from the start",
        "From p to the end of the file",
        "Just the exact entry for k",
      ],
      0,
      "k lies between h and p. Jump to h, then scan the short block until you pass k.",
    ),
    {
      type: "cat",
      q: "Does each item belong to the memtable or to an SSTable on disk?",
      buckets: ["Memtable (memory)", "SSTable (disk)"],
      items: [
        ["A balanced tree that keeps keys sorted as writes arrive", 0],
        ["An immutable sorted segment file", 1],
        ["The place every new write goes first", 0],
        ["Combined by background merging and compaction", 1],
      ],
      why: "New writes enter the in-memory tree; flushing turns it into a sorted file that later merges combine.",
    },
    TF(
      "Once an SSTable is written, a changed key is edited inside that file.",
      false,
      "SSTables are not edited; a new value goes into a newer memtable and later a newer segment.",
    ),
    M(
      "Why does the memtable use a balanced tree rather than a plain list?",
      [
        "It keeps keys sorted as each out-of-order write arrives",
        "It stores every key on disk as soon as it arrives",
        "It stops old values from being overwritten",
        "It removes the need to ever write an SSTable",
      ],
      0,
      "Writes come in random order, and a tree stays sorted as they are inserted.",
    ),
    {
      type: "slider",
      q: "A segment has 1,200 keys and its sparse index stores every 100th key. About how many index entries are there?",
      min: 0,
      max: 40,
      step: 1,
      ans: 12,
      tol: 2,
      unit: " entries",
      hint: "How many 100s fit into 1,200?",
      why: "1,200 ÷ 100 = 12 entries, a far smaller index than one entry per key.",
    },
    {
      type: "multi",
      q: "Which are true of SSTables compared with a hash-indexed log? Select all that apply.",
      o: [
        "The in-memory index need not hold every key",
        "Merging segments works like the merge step of merge sort",
        "Keys in a range sit next to each other on disk",
        "Every key must still be held in memory",
      ],
      a: [0, 1, 2],
      why: "Sorting brings a sparse index, easy merging and neighbouring keys. The all-keys-in-memory limit belongs to the hash index.",
    },
    M(
      "A key was updated recently, and an older value for it is on disk. Which value does a read return?",
      [
        "The memtable's value, because it is checked first",
        "The disk value, because files are more permanent",
        "Both values together, as a list",
        "Neither, because the two conflict",
      ],
      0,
      "Reads search the memtable, then segments from newest to oldest, and stop at the first hit.",
    ),
    {
      type: "bug",
      q: "read() should return the newest value for a key. Click the faulty line.",
      code: [
        "def read(key):",
        "    if key in memtable:",
        "        return memtable[key]",
        "    for seg in segments_oldest_first:",
        "        if key in seg:",
        "            return seg[key]",
        "    return None",
      ],
      a: 3,
      why: "Searching oldest first returns a stale value. Segments should be searched from newest to oldest.",
    },
    {
      type: "match",
      q: "Match each part to its role.",
      pairs: [
        ["Memtable", "In-memory sorted tree that takes new writes"],
        ["SSTable", "Sorted, unchanging file on disk"],
        ["Sparse index", "Offsets for only some of the keys"],
        ["Background merge", "Combines segments and drops stale values"],
      ],
      why: "The parts of the SSTable design and what each one does.",
    },
    M(
      "A key is deleted and a tombstone is written. What does a later merge do with it?",
      [
        "Drops the key's older values, since the key is deleted",
        "Copies the tombstone into every older segment and keeps it there",
        "Turns the tombstone into an empty value forever",
        "Keeps every older value so nothing is lost",
      ],
      0,
      "Merging discards overwritten and deleted values, so the deleted key's records disappear.",
    ),
    M(
      "Why can the blocks between index entries be compressed?",
      [
        "Each block is read whole, so it can be unpacked as one unit",
        "Compressed blocks are always faster to write into the memtable",
        "Compression removes the need to sort the keys",
        "Compressed blocks never need to be merged",
      ],
      0,
      "A lookup jumps to one block and scans it, so packing it up costs little.",
    ),
  ]);
})();

/* ===== bank-v-ds-1.js ===== */
/* DS revision bank, visual and varied questions, part 1.
   Modules: ds-why, ds-blocks, ds-reliability, ds-load, ds-twitter, ds-scaling, ds-maintain.
   Every question stands on its own; the figure carries the data needed. Numbers checked with node. */
(function () {
  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 10 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><thead><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  /* ================= ds-why ================= */

  /* online shop: users -> two load balancers -> three app servers -> ONE database */
  const shopChain = (() => {
    let s = "";
    [60, 130].forEach((y) => [37, 102, 167].forEach((ay) => (s += ln(180, y + 20, 240, ay + 20, { sw: 2 }))));
    [37, 102, 167].forEach((ay) => (s += ln(330, ay + 20, 420, 119, { sw: 2 })));
    s += ln(80, 119, 110, 80, { sw: 2 }) + ln(80, 119, 110, 150, { sw: 2 });
    s += pk("users", rc(10, 99, 70, 40) + tx(45, 124, "Users"));
    s +=
      pk("lb1", rc(110, 60, 70, 40) + tx(145, 85, "Balancer")) +
      pk("lb2", rc(110, 130, 70, 40) + tx(145, 155, "Balancer"));
    [37, 102, 167].forEach((ay, i) => (s += pk("app" + (i + 1), rc(240, ay, 90, 40) + tx(285, ay + 25, "App server"))));
    s += pk("db", rc(420, 94, 110, 50) + tx(475, 124, "Database"));
    return svg(550, 215, s);
  })();

  /* demand bars vs one server's capacity */
  const demandBars = (() => {
    const v = [20, 30, 45, 65, 95, 140, 200, 290],
      base = 190,
      k = 0.55;
    let s = "";
    v.forEach((d, i) => {
      const x = 36 + i * 64,
        h = d * k;
      s += pk(
        "w" + (i + 1),
        rc(x, base - h, 50, h, { rx: 6, f: "var(--blue-dim, var(--panel))", s: "var(--blue)", sw: 2 }) +
          tx(x + 25, base - h - 6, d, { s: 12 }) +
          tx(x + 25, base + 17, "Wk " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    s +=
      ln(26, base - 100 * k, 548, base - 100 * k, { s: "var(--rose)", sw: 3, d: "7 6" }) +
      tx(30, base - 100 * k - 8, "One server copes with 100 requests per second", {
        a: "start",
        s: 12,
        c: "var(--rose-ink)",
      });
    s += tx(10, 12, "Requests per second at the weekly peak", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(560, 215, s);
  })();

  B.add("ds-why", [
    {
      type: "pick",
      q: "A shop's traffic grew, so it added machines at every layer except one. Tap the part whose failure would STILL take the whole shop offline.",
      fig: shopChain,
      a: "db",
      why: "Users reach the shop through either balancer and any of three app servers, so each of those can fail without anyone noticing. The single database is the one part with no copy: it is the single point of failure. Adding servers only helped where the work could be shared.",
    },
    {
      type: "order",
      q: "Two copies of a bank balance sit in London and Sydney, and the link between them breaks. Put the events in the order that produces a stale read.",
      hint: "Think: what happens first, what is then missed, and who answers anyway?",
      items: [
        "The link between the London and Sydney copies is cut",
        "A London customer withdraws 40, so the London copy drops to 60",
        "A Sydney customer asks for their balance",
        "Sydney answers 100 from its own copy, without hearing about the withdrawal",
      ],
      why: "Once the copies cannot talk, an update on one side never reaches the other. If Sydney chooses to stay available it answers from what it has, which is out of date. Choosing consistency would mean refusing to answer until the link is back.",
    },
    {
      type: "pick",
      q: "One server copes with 100 requests per second (dashed line). Tap the first week in which it can no longer cope.",
      fig: demandBars,
      a: "w6",
      why: "Demand is 95 in week 5, then 140 in week 6, above the line. It grows by roughly 45% a week, so buying a machine twice as big (200) would only last about two more weeks. Rapid growth is why one server stopped being enough.",
    },
    {
      type: "bug",
      q: 'A team writes: "We removed our single point of failure by adding a second database server." Which line of the plan quietly undoes that claim?',
      code: [
        "Plan: add a second database server, B, beside server A",
        "Both servers start with a full copy of the data",
        "All writes go to A only; B is never told about them",
        "If A dies, clients are switched to B",
        "Result: users never lose service or data",
      ],
      a: 2,
      why: "Server B starts as a copy but never hears about new writes, so after a switch it would be missing everything since the copy. Keeping copies in step is the cost of replication. Without it the second server gives availability only on paper.",
    },
    {
      type: "mcq",
      q: "Using the two options in the table, what is the main price the cluster pays for being cheaper and for losing only an eighth of its capacity when one box dies?",
      fig: table(
        ["", "One big server", "Cluster of 8 small"],
        [
          ["Cores in total", "64", "8 × 8 = 64"],
          ["Hardware price", "£40k", "8 × £3k = £24k"],
          ["One machine dies", "100% of capacity lost", "12.5% of capacity lost"],
        ],
      ),
      o: [
        "The eight machines must be coordinated, and some can be down while others carry on",
        "Each machine runs programs more slowly than one 8-core server would",
        "The programs would have to be rewritten in a different language",
        "Every request must be answered by all eight machines at once",
      ],
      a: 0,
      why: "Cheap commodity machines scale and fail gently, but now data copies, ordering and partial failures have to be managed. That coordination is the trade-off behind the second lecture trade-off (one big machine versus many cheap ones).",
    },
    {
      type: "match",
      q: "Each change fixed one problem for a growing app. Match it to the NEW problem it brings.",
      pairs: [
        ["Keep a second copy of the database on another machine", "The two copies can disagree for a while"],
        ["Spread requests over ten identical web servers", "A user's session must be found on whichever one answers"],
        [
          "Replace a rack of big servers with hundreds of cheap ones",
          "Something is always broken somewhere, so partial failure is normal",
        ],
        ["Stay on one very large server", "Its price keeps climbing and one fault stops everything"],
      ],
      why: "No scaling step is free: copies bring consistency questions, spreading work brings shared state, cheap machines bring routine partial failure, and one big box keeps cost and availability risk.",
    },
  ]);

  /* ================= ds-blocks ================= */

  const cacheFlow = svg(
    560,
    170,
    tx(60, 30, "Request", { s: 14 }) +
      rc(10, 40, 100, 44) +
      tx(60, 67, "10 requests") +
      ln(110, 62, 190, 62) +
      rc(190, 38, 120, 48, { s: "var(--teal)" }) +
      tx(250, 67, "Cache") +
      ln(310, 52, 400, 30, { s: "var(--teal)" }) +
      rc(400, 8, 150, 44, { f: "var(--teal-dim)", s: "var(--teal)" }) +
      tx(475, 28, "Hit: 9 of 10", { s: 13 }) +
      tx(475, 44, "answered in 1 ms", { s: 12, c: "var(--text-dim)" }) +
      ln(310, 74, 400, 126, { s: "var(--rose)" }) +
      rc(400, 100, 150, 56, { f: "var(--rose-dim)", s: "var(--rose)" }) +
      tx(475, 120, "Miss: 1 of 10", { s: 13 }) +
      tx(475, 137, "1 ms check + 100 ms", { s: 12, c: "var(--text-dim)" }) +
      tx(475, 151, "database read = 101 ms", { s: 12, c: "var(--text-dim)" }),
  );

  const prodCards = (() => {
    const P = [
      ["a", "Kettle", 900, 2],
      ["b", "Toaster", 40, 1],
      ["c", "Flash-sale stock", 700, 1500],
      ["d", "Mug", 35, 0],
      ["e", "Blender", 500, 3],
      ["f", "Whisk", 20, 1],
    ];
    let s = "";
    P.forEach(([id, n, v, c], i) => {
      const x = 8 + (i % 3) * 182,
        y = 8 + Math.floor(i / 3) * 92;
      s += pk(
        id,
        rc(x, y, 172, 82) +
          tx(x + 86, y + 26, n, { s: 14 }) +
          tx(x + 86, y + 49, `${v} views a day`, { s: 12.5, c: "var(--blue-ink)" }) +
          tx(x + 86, y + 68, `changes ${c} times a day`, { s: 12.5, c: "var(--amber-ink)" }),
      );
    });
    return svg(556, 190, s);
  })();

  const timeline = (() => {
    const T = [
      ["t1", 150, "18:00", "evening"],
      ["t2", 290, "02:00", "batch starts"],
      ["t3", 420, "02:40", "batch finishes"],
      ["t4", 530, "03:30", "later"],
    ];
    let s = ln(20, 80, 585, 80, { s: "var(--line-2)", sw: 4 });
    s +=
      `<circle cx="50" cy="80" r="9" fill="var(--amber)"/>` +
      tx(50, 58, "14:00", { s: 13 }) +
      tx(50, 110, "kettle bought", { s: 12, c: "var(--amber-ink)" });
    s +=
      rc(290, 66, 130, 28, { rx: 6, f: "var(--violet-dim, var(--panel))", s: "var(--violet)", sw: 2 }) +
      tx(355, 85, "nightly batch job", { s: 11.5, c: "var(--violet-ink)" });
    T.forEach(
      ([id, x, t, l]) =>
        (s += pk(
          id,
          `<circle cx="${x}" cy="80" r="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
            tx(x, 55, t, { s: 13 }) +
            tx(x, 118, l, { s: 12, c: "var(--text-dim)" }),
        )),
    );
    s += tx(
      300,
      150,
      "Recommendations are recomputed from ALL of the day's purchases, then published when the job ends. Not to scale.",
      { s: 11.5, w: 700, c: "var(--text-faint)" },
    );
    return svg(600, 165, s);
  })();

  B.add("ds-blocks", [
    {
      type: "slider",
      q: "Look at the flow for 10 requests. Roughly what is the AVERAGE answer time per request, in milliseconds?",
      fig: cacheFlow,
      min: 0,
      max: 60,
      step: 1,
      ans: 11,
      tol: 4,
      unit: " ms",
      hint: "Nine requests take 1 ms each, one takes 101 ms. Add them up (9 + 101) and divide by 10.",
      why: "(9 × 1 + 1 × 101) ÷ 10 = 11 ms. The slow 10% of misses contribute more than 90% of the total time, so the hit rate decides whether a cache pays off, not the speed of a hit.",
    },
    {
      type: "pick",
      q: "The cache has room for TWO products. Tap the two that benefit most from being cached.",
      fig: prodCards,
      a: ["a", "e"],
      hint: "A cached copy only helps while it is still correct. Compare how often something is read with how often it changes.",
      why: "The kettle (900 views, 2 changes) and the blender (500 views, 3 changes) are read far more often than they change. The flash-sale stock has many views, but it changes about twice as often as it is read, so a cached copy would nearly always be out of date.",
    },
    {
      type: "bug",
      q: "Users change their display name, and the database shows the new name, but the app keeps showing the old one for hours. Which line is faulty?",
      code: [
        "function getName(id):",
        "  if cache.has(id): return cache.get(id)",
        "  row = database.read(id)",
        "  cache.put(id, row); return row.name",
        "function setName(id, newName):",
        "  database.write(id, newName)",
      ],
      a: 5,
      why: "The update writes only to the database. The cache still holds the old row, and reads keep hitting it. The fix is to delete or refresh the cached copy when the data changes. Keeping a cache in step with its source is its classic risk.",
    },
    {
      type: "mcq",
      q: "The table shows four features. If a team adds an extra index to each feature's main table, which feature will it hurt most?",
      fig: table(
        ["Feature", "Reads per second", "Writes per second"],
        [
          ["Product search", "2,000", "5"],
          ["Sensor log", "50", "3,000"],
          ["Profile page", "300", "20"],
          ["Wishlist", "100", "40"],
        ],
      ),
      o: ["Product search", "Sensor log", "Profile page", "Wishlist"],
      a: 1,
      why: "An index speeds up finding data but must be updated on every write. The sensor log writes 3,000 times a second and hardly ever reads, so it would pay the cost without getting the benefit. Read-heavy features like search gain the most.",
    },
    {
      type: "cat",
      q: "Sort each item by whether it is safe to serve from a cache or must be read from the database.",
      buckets: ["Safe to serve from a cache", "Must come from the database"],
      items: [
        ["The weather summary on a travel homepage, refreshed every ten minutes", 0],
        ["How many tickets are left, at the moment a customer clicks Buy", 1],
        ["The like counter on a very popular post", 0],
        ["A customer's account balance just before approving a payment", 1],
        ['The "trending now" list, rebuilt each hour', 0],
        ["Whether a username is already taken at sign-up", 1],
      ],
      why: "A cache is fine when slightly old data does no harm. When a decision depends on the exact current value (last ticket, money, uniqueness) a stale copy can cause a wrong or duplicate action, so read the source of truth.",
    },
    {
      type: "pick",
      q: "A recommendations page is built by a nightly batch job. A customer buys a kettle at 14:00. Tap the earliest moment their recommendations can reflect that purchase.",
      fig: timeline,
      a: "t3",
      why: "The batch job reads all of the day's data and publishes only when it finishes (02:40). Starting at 02:00 is not enough, and the evening is too early. This delay is the price of batch processing: big and efficient, but not real time.",
    },
  ]);

  /* ================= ds-reliability ================= */

  const cascade = (() => {
    const S = [
      ["s1", "Stage 1", "one disk dies,", "node 3 is out", [0, 0, 2, 0, 0]],
      ["s2", "Stage 2", "other 4 nodes", "take its work", [1, 1, 2, 1, 1]],
      ["s3", "Stage 3", "node 1 overloads", "and crashes", [2, 1, 2, 1, 1]],
      ["s4", "Stage 4", "node 5 crashes;", "pages still load", [2, 1, 2, 1, 2]],
      ["s5", "Stage 5", "last nodes fail,", "error page", [2, 2, 2, 2, 2]],
    ];
    const col = ["var(--teal)", "var(--amber)", "var(--rose)"];
    let s = "";
    S.forEach(([id, a, b, c, st], i) => {
      const x = 4 + i * 114;
      s += pk(
        id,
        rc(x, 6, 108, 146) +
          st
            .map((v, k) => `<rect x="${x + 10 + k * 18}" y="18" width="14" height="30" rx="4" fill="${col[v]}"/>`)
            .join("") +
          tx(x + 54, 74, a, { s: 12.5 }) +
          tx(x + 54, 100, b, { s: 10.5, w: 700, c: "var(--text-dim)" }) +
          tx(x + 54, 116, c, { s: 10.5, w: 700, c: "var(--text-dim)" }) +
          tx(x + 54, 140, ["all fine", "busy", "overload", "slow", "OFFLINE"][i], {
            s: 11,
            c: i === 4 ? "var(--rose-ink)" : "var(--text-faint)",
          }),
      );
    });
    s += tx(300, 172, "green = healthy, orange = running hot, red = down", { s: 11.5, w: 700, c: "var(--text-faint)" });
    return svg(590, 182, s);
  })();

  const crashGrid = (() => {
    const marks = { 2: [2], 4: [5], 5: [1, 6], 7: [3], 9: [1, 2, 3, 4, 5, 6], 10: [4] };
    let s = "";
    for (let d = 1; d <= 10; d++) {
      const x = 56 + (d - 1) * 50;
      s += pk(
        "d" + d,
        rc(x, 8, 44, 192, { rx: 8, sw: 2 }) +
          tx(x + 22, 220, "Day " + d, { s: 11.5, c: "var(--text-dim)" }) +
          (marks[d] || [])
            .map((n) => `<g><circle cx="${x + 22}" cy="${14 + n * 28}" r="9" fill="var(--rose)"/></g>`)
            .join(""),
      );
    }
    for (let n = 1; n <= 6; n++) s += tx(46, 18 + n * 28, "Node " + n, { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(570, 232, s);
  })();

  const nodesFig = (() => {
    let s = tx(280, 22, "Peak demand: 400 requests per second", { s: 15, c: "var(--amber-ink)" });
    for (let i = 0; i < 5; i++)
      s +=
        rc(30 + i * 100, 40, 90, 56, { s: "var(--teal)" }) +
        tx(75 + i * 100, 64, "Node", { s: 13 }) +
        tx(75 + i * 100, 84, "handles 100", { s: 12, c: "var(--text-dim)" });
    s += tx(280, 124, "Today: five identical nodes share the load evenly", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(540, 134, s);
  })();

  B.add("ds-reliability", [
    {
      type: "pick",
      q: "Each panel shows five nodes sharing a service as one failure leads to the next. Tap the stage at which the FAULT has become a FAILURE of the service.",
      fig: cascade,
      a: "s5",
      why: "A fault is one component misbehaving. In stages 1 to 4 users are still being served, even if slowly. Only in stage 5 does the system as a whole stop providing the service. The earlier stages show how a cascade of faults can march toward a failure.",
    },
    {
      type: "cat",
      q: "Sort each protective measure by the kind of fault it mainly guards against.",
      buckets: ["Hardware faults", "Software faults", "Human mistakes"],
      items: [
        ["Mirror every disk so a copy survives a dead drive", 0],
        ["Fit two power supplies per machine", 0],
        ["Release a new version to 5% of servers before the rest", 1],
        ["Cap the memory a runaway process can use", 1],
        ["Rehearse risky operations on a staging copy first", 2],
        ["Keep a one-click rollback for configuration changes", 2],
      ],
      why: "Redundant parts handle independent hardware faults. Software bugs hit many nodes at once, so you limit their spread (staged release, resource limits). People will make mistakes, so give them safe places to practise and an easy way to undo.",
    },
    {
      type: "mcq",
      q: "The service must still cope with peak demand if ANY TWO nodes are down at once. How many nodes of this size does it need in total?",
      fig: nodesFig,
      o: ["5", "6", "8", "10"],
      a: 1,
      hint: "Four nodes cover 400 (4 × 100). Then add two more as spare.",
      why: "400 ÷ 100 = 4 nodes must be working. To survive two failures you keep two spare, so 4 + 2 = 6. Five nodes would still manage one loss, but a second would overload the rest and could start a cascade.",
    },
    {
      type: "bug",
      q: "A migration runbook is meant to limit the damage of a mistake or a bug. Which step makes the plan dangerous?",
      code: [
        "1. Copy last night's production data to a staging database",
        "2. Run the new migration script on staging and check the results",
        "3. Run the same script on production at 14:00 on Friday, in all regions at once",
        "4. Keep the pre-migration backup ready to restore",
      ],
      a: 2,
      why: "Staging and a backup are good. Hitting every region at once means a bug in the script (or a human slip) is correlated across the whole system with nobody left untouched. Doing one region first, off-peak, would turn a possible failure into a contained fault.",
    },
    {
      type: "order",
      q: "Put the steps of a staged rollout in order, so a software bug stays a fault and does not become a failure.",
      items: [
        "Ship the new build to 1 of 20 servers",
        "Compare the new server's error rate with the other 19",
        "Spot errors rising on the updated server only",
        "Roll that server back before any others are updated",
        "Fix the bug and start the rollout again",
      ],
      why: "Software faults tend to appear on every node that runs the same code. Updating a small slice first, and comparing it with the rest, keeps 19 servers healthy while you find out. Rolling out to all 20 at once would risk a total failure.",
    },
    {
      type: "pick",
      q: "A red dot is a node crashing. Two pictures of a cluster for 10 days: tap the day that shows a CORRELATED fault, a software problem rather than worn-out hardware.",
      fig: crashGrid,
      a: "d9",
      why: "Hardware faults are mostly independent: a disk here, a power supply there, scattered over time. On day 9 all six nodes died together, which points to something they share, such as the same buggy software. Day 5 (two dots) is only what chance can produce.",
    },
  ]);

  /* ================= ds-load ================= */

  const hist = (() => {
    const c = [20, 35, 25, 10, 6, 4],
      lab = ["0–100", "100–200", "200–300", "300–400", "400–500", "500+"],
      base = 175;
    let s = "";
    c.forEach((n, i) => {
      const x = 40 + i * 88,
        h = n * 3.6;
      s += pk(
        "b" + (i + 1),
        rc(x, base - h, 76, h, { rx: 6, f: "var(--blue-dim, var(--panel))", s: "var(--blue)", sw: 2 }) +
          tx(x + 38, base - h - 6, n, { s: 13 }) +
          tx(x + 38, base + 18, lab[i], { s: 12, c: "var(--text-dim)" }),
      );
    });
    s += tx(300, 214, "Response time in ms. Bar height = number of requests (100 in total)", {
      s: 12,
      w: 700,
      c: "var(--text-faint)",
    });
    return svg(580, 224, s);
  })();

  const kneeChart = (() => {
    const L = [200, 400, 600, 800, 1000],
      p50 = [40, 42, 45, 70, 150],
      p99 = [120, 130, 160, 420, 780];
    const X = (v) => 70 + (v - 200) * 0.6,
      Y = (v) => 200 - v * 0.22;
    let s = ln(60, 200, 540, 200, { s: "var(--line)", sw: 2 }) + ln(60, 20, 60, 200, { s: "var(--line)", sw: 2 });
    [0, 200, 400, 600, 800].forEach((v) => (s += tx(52, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-faint)" })));
    s +=
      ln(60, Y(200), 540, Y(200), { s: "var(--rose)", sw: 2.5, d: "7 6" }) +
      tx(540, Y(200) - 6, "Promise: p99 under 200 ms", { a: "end", s: 12, c: "var(--rose-ink)" });
    s += `<polyline points="${L.map((l, i) => `${X(l)},${Y(p50[i])}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="3"/>`;
    s += `<polyline points="${L.map((l, i) => `${X(l)},${Y(p99[i])}`).join(" ")}" fill="none" stroke="var(--amber)" stroke-width="3"/>`;
    L.forEach(
      (l, i) =>
        (s +=
          tx(X(l), 220, l, { s: 11.5, c: "var(--text-dim)" }) +
          pk(
            "l" + l,
            `<circle cx="${X(l)}" cy="${Y(p99[i])}" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`,
          )),
    );
    s +=
      tx(300, 240, "Load: requests per second", { s: 12, w: 700, c: "var(--text-faint)" }) +
      tx(80, 14, "orange line = p99 (tap its dots)", { a: "start", s: 12, c: "var(--amber-ink)" }) +
      tx(330, 14, "green line = p50", { a: "start", s: 12, c: "var(--teal-ink)" });
    return svg(560, 248, s);
  })();

  B.add("ds-load", [
    {
      type: "pick",
      q: "100 requests were timed, as shown. Tap the bar that contains the p95 response time.",
      fig: hist,
      a: "b5",
      hint: "Add the bars from the fast end until you have passed 95 requests: 20, 55, 80, 90, ...",
      why: "Running totals are 20, 55, 80, 90 and 96. The 95th-fastest request falls in the 400–500 ms bar. The median (50th) is in the 100–200 ms bar, so a typical visit looks fine while one in twenty waits over 400 ms.",
    },
    {
      type: "multi",
      q: "The service promises that 99% of requests are answered in under 500 ms. On which days was the promise broken?",
      fig: table(
        ["Day", "p50", "p99"],
        [
          ["Mon", "80 ms", "400 ms"],
          ["Tue", "85 ms", "460 ms"],
          ["Wed", "90 ms", "620 ms"],
          ["Thu", "85 ms", "480 ms"],
          ["Fri", "100 ms", "510 ms"],
        ],
      ),
      o: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      a: [2, 4],
      why: "A promise about 99% of requests is a promise about p99. Wednesday (620) and Friday (510) are over 500 ms. The medians all look healthy, which is exactly why a median alone can hide a broken promise.",
    },
    {
      type: "cat",
      q: "A dashboard for an online shop lists these items. Sort each into what goes IN to the system (load) or how the system RESPONDS (performance).",
      buckets: ["Load parameter", "Performance measure"],
      items: [
        ["Orders placed per minute", 0],
        ["Time from tapping Pay to seeing the confirmation", 1],
        ["Average number of items in a basket", 0],
        ["Share of requests that are searches rather than purchases", 0],
        ["99th-percentile checkout time", 1],
        ["Time to process one night's two million orders", 1],
      ],
      why: "Load parameters describe what you put on the system, and they differ by application. Performance measures describe how it copes: response time for interactive services, processing time or records per second for data jobs.",
    },
    {
      type: "bug",
      q: "A load-test script ends by announcing whether users will be happy. Which line judges them in a way that can hide slow experiences?",
      code: [
        "times = run_load_test(users=500, duration=60)",
        "avg = sum(times) / len(times)",
        "print('average response:', avg)",
        "if avg < 300: print('Users are happy')",
        "else: print('Too slow')",
      ],
      a: 3,
      why: "An average blends fast and slow requests: 95 requests at 100 ms and 5 at 2,000 ms still average under 300 ms, while 5 users in 100 wait two seconds. Judge happiness with a percentile such as p95 or p99 instead.",
    },
    {
      type: "order",
      q: "Put the steps in order for reading the p90 response time from 50 measurements.",
      items: [
        "Collect all 50 response times",
        "Sort them from fastest to slowest",
        "Count along to 90% of the list (the 45th value)",
        "Read the response time at that position",
      ],
      why: "A percentile is a position in the sorted data, so the data must be sorted first. For 50 values the 45th is 90% of the way along, and 10% of requests (5 of them) are slower than it.",
    },
    {
      type: "pick",
      q: "A load test produced these curves. Tap the HIGHEST load that still keeps p99 inside the promise (the dashed line).",
      fig: kneeChart,
      a: "l600",
      why: "At 600 requests per second p99 is 160 ms, under the 200 ms promise. At 800 it jumps to 420 ms. The median barely moves at 800, which shows why the tail, not the middle, tells you when the system stops coping.",
    },
  ]);

  /* ================= ds-twitter ================= */

  const accounts = (() => {
    const A = [
      ["a", "@harbour_news", "500,000", "60"],
      ["b", "@famous_chef", "20 million", "1"],
      ["c", "@gig_venue", "3 million", "5"],
      ["d", "@neighbour_ann", "900", "200"],
    ];
    let s = "";
    A.forEach(([id, n, f, p], i) => {
      const x = 8 + (i % 2) * 280,
        y = 8 + Math.floor(i / 2) * 88;
      s += pk(
        id,
        rc(x, y, 268, 78) +
          tx(x + 134, y + 26, n, { s: 14 }) +
          tx(x + 134, y + 48, `${f} followers`, { s: 12.5, c: "var(--blue-ink)" }) +
          tx(x + 134, y + 66, `${p} posts a day`, { s: 12.5, c: "var(--amber-ink)" }),
      );
    });
    return svg(556, 182, s);
  })();

  const cross = (() => {
    const X = (r) => 60 + r * 110,
      Y = (v) => 215 - v * 0.5;
    let s =
      pk(
        "left",
        `<rect x="${X(0)}" y="12" width="${X(1) - X(0)}" height="203" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` +
          tx((X(0) + X(1)) / 2, 34, "Zone 1", { s: 12, c: "var(--text-dim)" }),
      ) +
      pk(
        "right",
        `<rect x="${X(1)}" y="12" width="${X(4) - X(1)}" height="203" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` +
          tx((X(1) + X(4)) / 2, 34, "Zone 2", { s: 12, c: "var(--text-dim)" }),
      );
    s += ln(60, 215, 500, 215, { s: "var(--line-2)", sw: 2 }) + ln(60, 12, 60, 215, { s: "var(--line-2)", sw: 2 });
    [0, 1, 2, 3, 4].forEach((r) => (s += tx(X(r), 233, r, { s: 11.5, c: "var(--text-dim)" })));
    [0, 100, 200, 300, 400].forEach((v) => (s += tx(52, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-faint)" })));
    s +=
      ln(X(0), Y(100), X(4), Y(104), { s: "var(--blue)", sw: 4 }) +
      ln(X(0), Y(1), X(4), Y(401), { s: "var(--amber)", sw: 4 });
    s +=
      tx(X(3) - 10, Y(104) - 12, "Fan-out on write", { s: 12.5, c: "var(--blue-ink)" }) +
      tx(X(1.5), Y(250), "Merge on read", { s: 12.5, c: "var(--amber-ink)" });
    s += tx(280, 252, "Timeline reads per post", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(560, 262, s);
  })();

  B.add("ds-twitter", [
    {
      type: "pick",
      q: "A hybrid system wants to know which account will cost the MOST fan-out writes in a day (writes = followers × posts). Tap it.",
      fig: accounts,
      a: "a",
      hint: "Multiply each card. Use millions: 0.5 × 60, 20 × 1, 3 × 5, and 900 × 200 is well under a million.",
      why: "The news account makes 0.5 million × 60 = 30 million writes a day, more than the chef (20 million × 1 = 20 million) and the venue (3 million × 5 = 15 million). Cost depends on followers AND how often someone posts, not on fame alone.",
    },
    {
      type: "order",
      q: "In a hybrid timeline, Alice follows ordinary friends and one celebrity. Put in order what happens when she opens the app.",
      items: [
        "Read Alice's pre-built timeline cache (her friends' posts)",
        "Look up which celebrity accounts she follows",
        "Fetch those celebrities' latest posts directly",
        "Merge both lists by time",
        "Show the finished timeline",
      ],
      why: "Ordinary posts were fanned out when written, so they are already waiting in her cache. Celebrity posts were never copied (too many writes), so they are fetched at read time and merged in.",
    },
    {
      type: "pick",
      q: "Every account has about 100 followers and follows about 100 accounts. The chart shows total operations per post as the number of timeline reads per post changes. Tap the zone where fan-out on write does LESS work.",
      fig: cross,
      a: "right",
      why: "Fan-out on write pays about 100 extra writes up front, then each read is one cheap lookup. Merge on read is nearly free to post, but every read costs about 100 lookups. The lines cross at one read per post; to the right of that, where posts are read often, fan-out on write wins.",
    },
    {
      type: "bug",
      q: "Opening the timeline is very slow for people who follow thousands of accounts. Which line does far more work than the screen needs?",
      code: [
        "function timeline(user):",
        "  result = []",
        "  for friend in following(user):",
        "    result += all_tweets_ever_by(friend)",
        "  return newest_50(sort_by_time(result))",
      ],
      a: 3,
      why: "The screen shows only 50 posts, yet this line downloads every tweet each friend ever wrote before sorting. Fetching just each friend's latest 50 would give the same answer with a fraction of the work. Even then, merge-on-read costs grow with the number followed.",
    },
    {
      type: "cat",
      q: "Which design is each symptom evidence of?",
      buckets: ["Merge on read", "Fan-out on write"],
      items: [
        ["Opening a timeline is slow for someone who follows 5,000 accounts", 0],
        ["One post by a huge account triggers millions of cache writes", 1],
        ["The same tweet is stored again in every follower's mailbox", 1],
        ["Posting is one cheap insert, however many followers there are", 0],
        ["Opening a timeline is a single cheap lookup", 1],
        ["Reading cost grows with the number of accounts you follow", 0],
      ],
      why: "Merge on read keeps writes trivial and pushes the work to every reader. Fan-out on write does the work once per post, in every follower's mailbox, so reads are cheap but celebrities are costly to post for.",
    },
    {
      type: "multi",
      q: "A team runs fan-out on write. Which changes to their app would make that design look WORSE? Select all that apply.",
      o: [
        "Average followers per account rises from 75 to 5,000",
        "People open their timeline once a week instead of daily",
        "People start following 2,000 accounts instead of 200",
        "Posting rate doubles overnight",
      ],
      a: [0, 1, 3],
      why: "More followers, or more posts, means more writes. Fewer timeline reads means the up-front work is rewarded less often. Following more accounts makes MERGE-on-read slower, but fan-out on write already reads a single mailbox, so it is not hurt.",
    },
  ]);

  /* ================= ds-scaling ================= */

  const hotNodes = (() => {
    const L = [
        ["N1", 20],
        ["N2", 25],
        ["N3", 95],
        ["N4", 15],
      ],
      base = 160;
    let s = "";
    L.forEach(([n, v], i) => {
      const x = 40 + i * 132,
        h = v * 1.3,
        c = "var(--blue)";
      s += pk(
        n.toLowerCase(),
        rc(x, 20, 110, 150, { rx: 12, sw: 2, f: "var(--bg-2)" }) +
          rc(x + 20, base - h + 10, 70, h, { rx: 6, s: c, f: "var(--blue-dim, var(--panel))", sw: 2 }) +
          tx(x + 55, base - h + 4, v + "% busy", { s: 12.5 }) +
          tx(x + 55, 186, n, { s: 14 }),
      );
    });
    s += tx(280, 208, "Each node owns a fixed set of accounts and only serves those", {
      s: 11.5,
      w: 700,
      c: "var(--text-faint)",
    });
    return svg(560, 218, s);
  })();

  const ceiling = (() => {
    const d = (m) => 10 * Math.pow(1.15, m),
      X = (m) => 50 + m * 20,
      Y = (v) => 195 - v * 0.62;
    let s = ln(50, 195, 540, 195, { s: "var(--line-2)", sw: 2 }) + ln(50, 12, 50, 195, { s: "var(--line-2)", sw: 2 });
    s +=
      ln(50, Y(100), 540, Y(100), { s: "var(--rose)", sw: 2.5, d: "7 6" }) +
      tx(56, Y(100) - 6, "Biggest machine you can buy", { a: "start", s: 12, c: "var(--rose-ink)" });
    let pts = "";
    for (let m = 0; m <= 24; m++) pts += `${X(m)},${Y(d(m))} `;
    s += `<polyline points="${pts}" fill="none" stroke="var(--amber)" stroke-width="3.5"/>`;
    [6, 12, 18, 24].forEach(
      (m) =>
        (s +=
          tx(X(m), 214, "Month " + m, { s: 11.5, c: "var(--text-dim)" }) +
          pk(
            "m" + m,
            `<circle cx="${X(m)}" cy="${Y(d(m))}" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`,
          )),
    );
    s += tx(56, 14, "Demand", { a: "start", s: 11.5, c: "var(--text-dim)" });
    return svg(560, 224, s);
  })();

  const shards = (() => {
    let s = "";
    [
      ["M1", "customers A–F"],
      ["M2", "customers G–L"],
      ["M3", "customers M–R"],
      ["M4", "customers S–Z"],
    ].forEach(([m, d], i) => {
      const x = 12 + i * 136,
        dead = i === 2;
      s +=
        rc(x, 12, 124, 100, { s: dead ? "var(--rose)" : "var(--teal)", f: dead ? "var(--rose-dim)" : "var(--panel)" }) +
        tx(x + 62, 36, m, { s: 15 }) +
        tx(x + 62, 62, "own CPU, RAM, disk", { s: 11, w: 700, c: "var(--text-dim)" }) +
        tx(x + 62, 88, d, { s: 12 });
      if (dead)
        s +=
          ln(x + 6, 18, x + 118, 106, { s: "var(--rose)", sw: 4 }) +
          ln(x + 118, 18, x + 6, 106, { s: "var(--rose)", sw: 4 });
    });
    s += tx(278, 136, "No copies: each customer's data is stored on exactly one machine", {
      s: 12,
      w: 700,
      c: "var(--text-faint)",
    });
    return svg(556, 146, s);
  })();

  B.add("ds-scaling", [
    {
      type: "pick",
      q: "A team added three machines to a cluster to cut slow pages, but users are still waiting. Tap the node that is holding the cluster back.",
      fig: hotNodes,
      a: "n3",
      why: "Scaling out only helps if the work is spread across the machines. N3 runs at 95% while the other three sit mostly idle, so extra machines are wasted. Balancing the load (or splitting the hot accounts) is part of the price of scaling out.",
    },
    {
      type: "slider",
      q: "The table lists what one machine costs. You need 64 cores in total. Roughly how many times MORE does a single 64-core machine cost than sixteen 4-core machines?",
      fig: table(
        ["Machine", "Cores", "Price"],
        [
          ["Small", "4", "£1k"],
          ["Medium", "8", "£2.2k"],
          ["Large", "16", "£5k"],
          ["Extra large", "32", "£12k"],
          ["Huge", "64", "£30k"],
        ],
      ),
      min: 1,
      max: 4,
      step: 0.5,
      ans: 2,
      tol: 0.5,
      unit: "×",
      hint: "Sixteen small machines cost 16 × £1k = £16k. Compare that with £30k.",
      why: "£30k against £16k is nearly double. Price climbs faster than power, so scaling up gets expensive, and eventually there is no bigger machine to buy at all.",
    },
    {
      type: "multi",
      q: "A team moves its web tier from 2 big machines to 10 identical small ones. Which NEW problems must it now handle? Select all that apply.",
      o: [
        "Spreading requests across the machines",
        "Keeping a user's login or basket available whichever machine answers",
        "Carrying on when some machines are down and others are fine",
        "The ten machines now share one pool of memory",
        "Making copies of data agree with each other",
      ],
      a: [0, 1, 2, 4],
      why: "Shared-nothing machines each have their own CPU, memory and disk, so the work, the state and the data copies must be coordinated, and partial failure is normal. They do NOT share memory: that is the shared-memory, scale-up design.",
    },
    {
      type: "bug",
      q: "This code runs on each of 10 web servers behind a load balancer. Users report that their basket sometimes appears empty. Which line is the root cause?",
      code: [
        "# runs on every web server",
        "baskets = {}   # kept in this server's memory",
        "def add_item(user, item):",
        "    baskets.setdefault(user, []).append(item)",
        "def show_basket(user): return baskets.get(user, [])",
      ],
      a: 1,
      why: "Each server keeps its own baskets. A user's next request may land on a different server that never saw the item. In a scale-out design, shared state belongs in a store all servers use, so any machine can answer.",
    },
    {
      type: "pick",
      q: "Demand for an app grows as shown. Tap the first marked month in which demand is above the biggest single machine you could ever buy (dashed line).",
      fig: ceiling,
      a: "m18",
      why: "Month 12 is about 54, month 18 about 124, past the ceiling of 100. Scaling up has a hard limit; scaling out has none, because you can keep adding machines. That ceiling is why a rapidly growing service cannot rely on one ever-bigger server.",
    },
    {
      type: "mcq",
      q: "Machine M3 loses power in this shared-nothing cluster. What do users experience?",
      fig: shards,
      o: [
        "Only customers stored on M3 get errors; everyone else is served normally",
        "The whole shop goes offline, because any one lost machine stops a cluster",
        "Nothing at all, because the other machines take over M3's customers",
        "Customers on M3 are served by the others, only a little more slowly",
      ],
      a: 0,
      why: "With no copies of the data, M3's customers have nowhere else to be served from: a partial failure. The other three machines carry on. Scaling out gives you smaller failures only; surviving them needs replication on top.",
    },
  ]);

  /* ================= ds-maintain ================= */

  const files = (() => {
    const F = [
      ["cart", "cart.js", "builds its own price text"],
      ["email", "email.js", "builds its own price text"],
      ["invoice", "invoice.js", "builds its own price text"],
      ["pricing", "pricing.js", "defines formatPrice()"],
      ["checkout", "checkout.js", "calls formatPrice()"],
    ];
    let s = "";
    F.forEach(([id, n, d], i) => {
      const x = 8 + (i % 3) * 182,
        y = 8 + Math.floor(i / 3) * 70;
      s += pk(
        id,
        rc(x, y, 172, 60) + tx(x + 86, y + 24, n, { s: 14 }) + tx(x + 86, y + 44, d, { s: 12, c: "var(--text-dim)" }),
      );
    });
    return svg(556, 150, s);
  })();

  const hours = (() => {
    const H = [
      ["New features", 10, "var(--teal)"],
      ["Fixing bugs", 8, "var(--rose)"],
      ["Working out how old code works", 14, "var(--violet)"],
      ["Manual deploys and restarts", 8, "var(--amber)"],
    ];
    let s = "";
    H.forEach(
      ([n, v, c], i) =>
        (s +=
          tx(10, 30 + i * 36, n, { a: "start", s: 12.5 }) +
          `<rect x="230" y="${14 + i * 36}" width="${v * 20}" height="26" rx="6" fill="${c}"/>` +
          tx(238 + v * 20, 33 + i * 36, v + " h", { a: "start", s: 12.5 })),
    );
    s += tx(280, 164, "Engineer-hours per week (40 in total)", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(560, 174, s);
  })();

  const links = (() => {
    const mesh = [
      [60, 20],
      [110, 75],
      [90, 140],
      [30, 140],
      [10, 75],
    ].map(([x, y]) => [x + 10, y + 5]);
    let s = "";
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        s += ln(mesh[i][0], mesh[i][1], mesh[j][0], mesh[j][1], { sw: 2, s: "var(--rose)" });
    mesh.forEach(
      ([x, y], i) =>
        (s +=
          `<circle cx="${x}" cy="${y}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
          tx(x, y + 5, "ABCDE"[i], { s: 13 })),
    );
    s += tx(70, 185, "Design A", { s: 14 });
    const chain = [0, 1, 2, 3, 4].map((i) => [260 + i * 62, 80]);
    for (let i = 0; i < 4; i++) s += ln(chain[i][0], 80, chain[i + 1][0], 80, { sw: 3, s: "var(--teal)" });
    chain.forEach(
      ([x, y], i) =>
        (s +=
          `<circle cx="${x}" cy="${y}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
          tx(x, y + 5, "ABCDE"[i], { s: 13 })),
    );
    s += tx(384, 185, "Design B", { s: 14 });
    return svg(560, 198, s);
  })();

  B.add("ds-maintain", [
    {
      type: "pick",
      q: 'The business wants every price shown as "GBP 4.50" instead of "£4.50". Tap EVERY file an engineer must edit.',
      fig: files,
      a: ["cart", "email", "invoice", "pricing"],
      why: "Three files each format prices their own way, so each needs the change, plus pricing.js where the shared helper lives. checkout.js only calls formatPrice(), so it is fixed for free. A good abstraction keeps a change in one place, which is evolvability; copy-paste is accidental complexity.",
    },
    {
      type: "bug",
      q: "A deploy script should not depend on any particular machine. Which line breaks that rule?",
      code: [
        "for s in servers_from_registry('web'):",
        "    drain_traffic(s)",
        "    deploy(s, build)",
        "    wait_until_healthy(s)",
        "restart('10.0.4.17')   # the box nobody put in the registry",
      ],
      a: 4,
      why: "Everything else asks the registry which machines exist, so adding or retiring servers needs no script change. The hard-coded address depends on one machine that only one person remembers. Operability means no dependence on individual machines.",
    },
    {
      type: "mcq",
      q: "The chart shows where one team's time goes. Which improvement attacks the biggest drain?",
      fig: hours,
      o: [
        "Clean up tangled code and write down the architecture",
        "Script deploys and restarts so tools can run them",
        "Hide the payment provider behind one interface so it can be swapped",
        "Add dashboards that show what the system is doing",
      ],
      a: 0,
      why: "The biggest bar, 14 of 40 hours, is working out how old code works, which is the cost of accidental complexity. Reducing it is the simplicity goal. Automation (8 h) and swapping providers would help, but they are smaller or different problems.",
    },
    {
      type: "match",
      q: "Each incident could have been avoided by a maintainability improvement. Match them up.",
      pairs: [
        ["Nobody noticed the disk filling until the site stopped", "Add monitoring and alerts"],
        [
          "A new hire spent a week finding which of three tax functions was live",
          "Delete duplicate code and document the design",
        ],
        [
          "Adding a currency took months because prices were hard-coded in 40 places",
          "Put money behind one abstraction",
        ],
        ["After each crash an engineer had to log in and restart by hand", "Script the restart so tools can run it"],
      ],
      why: "Visibility and automation are operability, deleting accidental complexity is simplicity, and a clean abstraction makes change easy, which is evolvability. Matching the cure to the symptom is how you decide where to invest.",
    },
    {
      type: "mcq",
      q: "Both designs have five modules. Now a sixth module F is added to each: in A it must talk to every existing module, in B it only talks to E at the end of the chain. By about how many does each newcomer's map of links grow?",
      fig: links,
      o: [
        "A grows by 5, B grows by 1",
        "A grows by 1, B grows by 5",
        "A grows by 6, B grows by 2",
        "A and B each grow by 1",
      ],
      a: 0,
      why: "Design A has 10 links among 5 modules (each pair); F adds 5 more, and the total keeps growing much faster than the module count. Design B stays easy to hold in your head: one new link. Tangled dependencies are accidental complexity.",
    },
    {
      type: "cat",
      q: "A bike-hire app has these features and quirks. Sort each by whether it is essential complexity (part of the problem) or accidental complexity (an artefact of how it was built).",
      buckets: ["Essential complexity", "Accidental complexity"],
      items: [
        ["A reserved bike is held for 15 minutes, then released", 0],
        ["Three services each write dates in a different format", 1],
        ["Vans must move bikes from full docks to empty ones", 0],
        ["A script that works only on one developer's laptop", 1],
        ["Prices change with the time of day", 0],
        ["One bug fixed separately in four copy-pasted functions", 1],
      ],
      why: "Reservations, rebalancing and time-based pricing exist because of what the business does, so they cannot be removed. Date-format clashes, laptop-only scripts and copy-paste come from how the system was built, and can be simplified away.",
    },
  ]);
})();

/* ===== bank-v-ds-2.js ===== */
/* DS revision bank, visual and varied questions, part 2.
   Lecture 2 (models, schema, graphs, NoSQL) and Lecture 3 (log, hash index, SSTable).
   Every figure is needed to answer; numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto">${body}</svg>`;
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 3, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const chips = (list) =>
    `<div style="display:flex;flex-wrap:wrap;gap:6px">${list.map((s, i) => `<span style="border:2px solid var(--line-2);border-radius:8px;padding:3px 8px;background:var(--panel);font:800 13px var(--mono)"><span style="color:var(--text-faint)">${i + 1}</span> ${esc(s)}</span>`).join("")}</div>`;

  /* Stacked segment rows (oldest at the top). rows: [{id, label, recs:[[key, value, colour?]]}] */
  function segRows(rows, { pick = false, head = "", w = 560 } = {}) {
    const top = head ? 34 : 6;
    let b = head ? tx(8, 22, head, { m: true, s: 13, c: "var(--text-dim)" }) : "";
    rows.forEach((r, i) => {
      const y = top + i * 54;
      b += tx(8, y + 28, r.label, { s: 12, c: "var(--text-dim)" });
      r.recs.forEach(([k, v, c], j) => {
        const x = 150 + j * 130,
          col = c || "var(--line-2)";
        const g =
          rc(x, y + 6, 118, 36, { st: col, f: c ? "var(--rose-dim)" : "var(--panel)" }) +
          tx(x + 59, y + 30, `${k} = ${v}`, { a: "middle", m: true, s: 14 });
        b += pick ? pk(r.id + k, g) : g;
      });
    });
    return svg(w, top + rows.length * 54, b);
  }

  /* ================= ds-models ================= */
  const dotPanel = (ox, id, title, links) => {
    const L = [0, 1, 2].map((i) => [ox + 45, 78 + i * 38]),
      R = [0, 1, 2].map((i) => [ox + 135, 78 + i * 38]);
    let s =
      rc(ox + 4, 6, 172, 166, { rx: 12 }) +
      tx(ox + 90, 28, title, { a: "middle", s: 14 }) +
      tx(ox + 45, 52, "left", { a: "middle", s: 11, c: "var(--text-faint)" }) +
      tx(ox + 135, 52, "right", { a: "middle", s: 11, c: "var(--text-faint)" });
    links.forEach(([a, b]) => (s += ln(L[a][0], L[a][1], R[b][0], R[b][1], "var(--blue)", 2.5)));
    L.forEach(
      ([x, y]) =>
        (s += `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`),
    );
    R.forEach(
      ([x, y]) =>
        (s += `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`),
    );
    return pk(id, s);
  };
  const FIG_DOTS = svg(
    580,
    180,
    dotPanel(0, "a", "Set A", [
      [0, 0],
      [0, 1],
      [1, 2],
    ]) +
      dotPanel(200, "b", "Set B", [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 0],
      ]) +
      dotPanel(400, "c", "Set C", [
        [0, 0],
        [1, 1],
        [2, 2],
      ]),
  );

  const mono = (x, y, s, o = {}) => tx(x, y, s, { m: true, s: 13, ...o });
  const FIG_POST = svg(
    560,
    230,
    pk("title", rc(10, 6, 540, 34) + mono(24, 28, `"title": "Sourdough tips",`)) +
      pk(
        "author",
        rc(10, 46, 540, 78) +
          mono(24, 68, `"author": {`) +
          mono(44, 90, `"name": "Mo Reid",  "town": "Leeds"`) +
          mono(24, 112, `},`),
      ) +
      pk("published", rc(10, 130, 540, 34) + mono(24, 152, `"published": "2 March",`)) +
      pk(
        "comments",
        rc(10, 170, 540, 52) +
          mono(24, 192, `"comments": [ {"text": "Lovely crumb!"},`) +
          mono(24, 212, `              {"text": "Will try this"} ]`),
      ),
  );

  const FIG_TEXTFIELD = table(
    ["id", "name", "positions (one text field)"],
    [
      ["1", "Ana", "Chef at Orbit Ltd; Baker at Nim Cafe"],
      ["2", "Bo", "Barista at Nim Cafe"],
      ["3", "Cy", "Chef at Orbit Ltd; Chef at Dune Bistro; Waiter at Pia's"],
    ],
  );

  B.add("ds-models", [
    {
      type: "pick",
      q: "Each dot is a record and each line is a link between a left record and a right record. Judge only from the lines: which set shows a many-to-many relationship?",
      fig: FIG_DOTS,
      a: "b",
      why: "In Set B some left records link to several right records and some right records link back to several left ones, so both sides are many. Set A is one-to-many (every right dot has at most one left), and Set C is one-to-one.",
    },
    {
      type: "bug",
      q: "A normalised design keeps users, positions and education in separate tables, each child row pointing at its user. This code builds the profile page for user 42. Click the faulty line.",
      code: [
        "user = users.find(id = 42)",
        "jobs = positions.find(id = 42)",
        "schools = education.find(user_id = 42)",
        "page = { user, jobs, schools }",
      ],
      a: 1,
      why: "A positions row's own id is just that row's number. To get user 42's positions you must match the foreign key column (user_id = 42), as the education line does.",
    },
    {
      type: "cat",
      q: "A cooking site uses a document database. For each piece of data, should it sit inside the document that uses it, or be its own shared record?",
      buckets: ["Embed inside the document", "Keep as its own shared record"],
      items: [
        ["The ordered steps of one recipe, only ever shown on that recipe's page", 0],
        ["The restaurant that 4,000 chef profiles list as their employer, and which sometimes renames itself", 1],
        ["The address history of one customer, read only with that customer", 0],
        ["A band credited on thousands of albums, searched on its own", 1],
        ["The line items of one order, always read together with the order", 0],
        ["A topic tag used by thousands of posts and browsed on its own page", 1],
      ],
      why: "Data owned by one parent and always read with it fits inside the document (locality, one read). Data shared by many documents, or used on its own, is better kept once, otherwise every copy has to be edited when it changes.",
    },
    {
      type: "multi",
      q: "This design stores each person's positions as plain text in one field. Which jobs does it make hard for the database? Select all that apply.",
      fig: FIG_TEXTFIELD,
      o: [
        "Find every person who ever worked at Orbit Ltd",
        "Count how many positions each person has",
        "Show one person's name",
        "Load one person by their id",
      ],
      a: [0, 1],
      why: "The database sees the positions field as opaque text, so it cannot index inside it, match on employer or count entries without custom string handling. Reading a name or an id is untouched.",
    },
    {
      type: "pick",
      q: "A blog keeps each post as one document, like the one below. Mo has written 300 posts, so Mo's details are copied into every one of them. Mo moves house. Tap the part that would need editing in all 300 documents.",
      fig: FIG_POST,
      a: "author",
      why: "The author block is a many-to-one link flattened into a copy. The title, date and comments belong to this one post, but Mo's town is repeated in every post Mo wrote, so one change means 300 edits (or a shared record and a join).",
    },
    {
      type: "bug",
      q: "A university stores students and courses in tables. A student can take many courses and a course has many students. This setup script hides one mistake. Click the faulty line.",
      code: [
        "students(id, name)",
        "courses(id, title)",
        "enrolments(student_id, course_id)   -- one row per pairing",
        "add enrolment (5, 2)  and  add enrolment (5, 9)",
        "students.update(id = 5, course_id = 9)",
      ],
      a: 4,
      why: "A single course_id column in students can hold only one course, so it cannot describe a many-to-many link. The separate enrolments table already records both pairings. The last line is the mistake.",
    },
  ]);

  /* ================= ds-schema ================= */
  const card = (x, id, lines) =>
    pk(
      id,
      rc(x, 8, 128, 112, { rx: 10 }) +
        lines.map((l, i) => tx(x + 10, 34 + i * 22, l, { m: true, s: 12 })).join("") +
        tx(x + 64, 140, id.toUpperCase(), { a: "middle", s: 13, c: "var(--text-faint)" }),
    );
  const FIG_CARDS = svg(
    560,
    150,
    card(4, "d1", ["name: Kettle", "price: 20"]) +
      card(144, "d2", ["name: Lamp", "price: 15", "voltage: 12"]) +
      card(284, "d3", ["name: Gift card", "value: 25"]) +
      card(424, "d4", ["name: Mug", "price: 6", "colour: red"]),
  );

  const FIG_SCHEMA =
    `<div style="font:800 13px var(--sans);margin-bottom:6px">Schema of the table <b>orders</b></div>` +
    table(
      ["column", "type", "rule"],
      [
        ["id", "whole number", "required"],
        ["qty", "whole number", "required"],
        ["note", "text", "optional"],
      ],
    );

  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const FIG_TIME = svg(
    560,
    170,
    months.map((m, i) => tx(50 + i * 40, 150, m, { a: "middle", s: 13, c: "var(--text-dim)" })).join("") +
      rc(30, 20, 120, 40, { st: "var(--blue)" }) +
      tx(90, 45, "{ name }", { a: "middle", m: true }) +
      rc(150, 20, 200, 40, { st: "var(--amber)" }) +
      tx(250, 45, "{ first, last }", { a: "middle", m: true }) +
      rc(350, 20, 160, 40, { st: "var(--violet)" }) +
      tx(430, 45, "{ first, last, title }", { a: "middle", m: true, s: 12 }) +
      tx(30, 84, "Code changes deployed: Jan, Apr and Sep. Old documents were never rewritten.", {
        s: 12,
        c: "var(--text-dim)",
        w: 700,
      }) +
      ln(30, 124, 510, 124, "var(--line-2)", 2) +
      `<path d="M510 108 v32" stroke="var(--rose)" stroke-width="3"/>` +
      tx(512, 104, "now", { a: "middle", s: 12, c: "var(--rose)" }),
  );

  B.add("ds-schema", [
    {
      type: "pick",
      q: "A shop's collection has no enforced schema. The basket code runs total = sum of doc.price over every document. Tap the document that this code cannot handle.",
      fig: FIG_CARDS,
      a: "d3",
      why: "Schema-on-read means nothing stopped the gift card being saved with value instead of price. The reading code meets the surprise: it must either check for a missing price or use the other field. Extra fields like voltage or colour do no harm to a sum of prices.",
    },
    {
      type: "order",
      q: 'A document store is changing from one "name" field to "first" and "last", with 50 million documents. Put a safe, gradual migration in order.',
      items: [
        "Deploy code that reads both the old and the new shape",
        "Make every new write use the new shape",
        "Rewrite old documents when they are read, or in the background",
        "Delete the old-shape handling once none remain",
      ],
      why: "Readers must cope with both shapes before anything is written in the new one, otherwise they break. Only when no old documents are left is it safe to remove the old-shape code.",
    },
    {
      type: "cat",
      q: "For each job, does keeping a document's data together in one stored piece (locality) help or hurt?",
      buckets: ["Locality helps", "Locality hurts"],
      items: [
        ["Show one order with all its lines and delivery notes", 0],
        ["List only the titles of 10,000 articles that each hold 3 MB of images", 1],
        ["Open a profile page that needs name, positions, education and contacts", 0],
        ["Chart one tiny number from every one of a million large documents", 1],
        ["Change a single small field inside a very large document", 1],
        ["Load a recipe with its steps and ingredients in one go", 0],
      ],
      why: "Locality pays off when you want most of a document in one read. It hurts when you want a small part of many big documents, because the whole of each one is still loaded (or rewritten).",
    },
    {
      type: "match",
      q: "A relational table is declared as below (schema-on-write). Match each incoming record to what the database does with it.",
      fig: FIG_SCHEMA,
      pairs: [
        ['{ id: 1, qty: "two" }', "Rejected: qty is the wrong type"],
        ['{ id: 2, note: "hi" }', "Rejected: required qty is missing"],
        ["{ id: 3, qty: 4 }", "Accepted"],
        ['{ id: 4, qty: 5, colour: "red" }', "Rejected: no such column"],
      ],
      why: "With schema-on-write the structure is checked when data is stored: types, required fields and the list of columns are all enforced. A document store without a schema would have accepted all four.",
    },
    {
      type: "mcq",
      q: "The team never rewrote old documents. Looking at the timeline, how many different shapes might the reading code meet in December?",
      fig: FIG_TIME,
      o: ["1", "2", "3", "4"],
      a: 2,
      why: "Documents written in each period keep the shape they were saved in, so old { name } documents, { first, last } documents and { first, last, title } documents all still sit in the store. With schema-on-read, the code carries that history.",
      hint: "Each deployment created a new shape, and nothing removed the old ones.",
    },
    {
      type: "bug",
      q: "A team explains why partner product feeds go into a schema-on-read store. One reason is wrong. Click it.",
      code: [
        "Partners add and rename fields without telling us.",
        "So the database cannot reject their uploads for us.",
        "So our code never has to handle a missing or renamed field.",
        "We interpret and tidy each document as we read it.",
      ],
      a: 2,
      why: "Schema-on-read moves the checking into the application. Because nothing is enforced on write, the reading code has to be ready for missing and renamed fields.",
    },
  ]);

  /* ================= ds-graph ================= */
  const Qf = NIC.qfig;
  const FIG_FOLLOW = Qf.graph(
    { A: [50, 130], B: [140, 60], C: [140, 200], D: [250, 100], E: [250, 200], F: [360, 60], G: [360, 200] },
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["C", "E"],
      ["D", "F"],
      ["E", "G"],
    ],
    { pick: "nodes", directed: true, w: 420, h: 260, hl: { A: "var(--teal)" } },
  );

  const FIG_TABLES = `<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:12px;align-items:start"><div><div style="font:800 13px var(--sans);margin-bottom:4px">Vertices</div>${table(
    ["id", "label", "name"],
    [
      ["1", "Person", "Mia"],
      ["2", "Person", "Leo"],
      ["3", "Place", "Cafe Nim"],
      ["4", "Person", "Zed"],
    ],
  )}</div><div><div style="font:800 13px var(--sans);margin-bottom:4px">Edges</div>${table(
    ["id", "from", "label", "to"],
    [
      ["e1", "1", "KNOWS", "2"],
      ["e2", "2", "VISITED", "3"],
      ["e3", "4", "VISITED", "3"],
      ["e4", "4", "KNOWS", "1"],
    ],
  )}</div></div>`;

  const FIG_PROPS = svg(
    560,
    190,
    rc(10, 40, 160, 100, { st: "var(--blue)", rx: 14 }) +
      tx(90, 66, "Ana", { a: "middle", s: 15 }) +
      tx(90, 88, "(Person)", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(90, 114, "born: 1990", { a: "middle", m: true, s: 12 }) +
      rc(390, 40, 160, 100, { st: "var(--amber)", rx: 14 }) +
      tx(470, 66, "Orbit Ltd", { a: "middle", s: 15 }) +
      tx(470, 88, "(Company)", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(470, 114, "city: Leeds", { a: "middle", m: true, s: 12 }) +
      ln(172, 90, 386, 90, "var(--line-2)", 3, 'marker-end="url(#ga)"') +
      `<defs><marker id="ga" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-2)"/></marker></defs>` +
      tx(280, 78, "WORKS_AT", { a: "middle", s: 13, c: "var(--text-dim)" }),
  );

  B.add("ds-graph", [
    {
      type: "pick",
      q: 'Arrows mean "follows". Asha (A, in green) wants suggestions. Tap everyone she reaches in exactly two follow hops, not one and not three.',
      fig: FIG_FOLLOW,
      a: ["D", "E"],
      why: 'One hop from A reaches B and C. One more hop from those reaches D (from B or C) and E (from C). F and G need a third hop. This is why a graph is good at "friends of friends": each hop just follows the edges leaving a vertex.',
    },
    {
      type: "mcq",
      q: "Using only these two tables, which person does Mia KNOW who has also VISITED Cafe Nim?",
      fig: FIG_TABLES,
      o: ["Leo", "Zed", "Leo and Zed", "Nobody"],
      a: 0,
      why: "Mia's outgoing KNOWS edge (e1) goes to Leo, and Leo has a VISITED edge (e2) to Cafe Nim. Zed visited the cafe too, but the KNOWS edge e4 points from Zed to Mia, which is the other direction.",
      hint: "Start at vertex 1 and follow only edges that leave it with the label KNOWS.",
    },
    {
      type: "cat",
      q: "Sort each query by how a graph database answers it.",
      buckets: ["Start at one vertex and follow edges outward", "Needs a pass over everything"],
      items: [
        ["Everyone within three referrals of one doctor", 0],
        ["The average age of all patients", 1],
        ["The fewest changes between two stations", 0],
        ["The total number of trips made this year", 1],
        ["Which cafes the friends of Mia have visited", 0],
        ["The oldest account across the whole network", 1],
      ],
      why: "Traversals touch only the neighbourhood around a start vertex, following the edges stored with each vertex. Whole-dataset summaries have to look at every vertex or edge, whichever model holds them.",
    },
    {
      type: "bug",
      q: "This traversal should suggest new people for Ola to follow: friends of friends who are not already connected to her. Click the faulty line.",
      code: [
        'start = vertex("Ola")',
        'friends = start.out("FOLLOWS")',
        'fof = friends.out("FOLLOWS")',
        "suggestions = fof",
        "show(suggestions)",
      ],
      a: 3,
      why: "Friends of friends include people Ola already follows and often Ola herself (a friend follows her back). Remove start and friends from fof before suggesting anyone.",
    },
    {
      type: "slider",
      q: "Everyone follows exactly 10 accounts, with no overlaps. Starting from one person, about how many accounts could you reach in exactly three hops?",
      min: 0,
      max: 2000,
      step: 100,
      ans: 1000,
      tol: 300,
      unit: " accounts",
      why: "Each hop multiplies the reach by 10: 10 after one hop, 100 after two, 1,000 after three. Fan-out grows fast, which is why graph stores keep each vertex's edges close at hand.",
      hint: "10 × 10 = 100, then × 10 again.",
    },
    {
      type: "multi",
      q: "In a property graph, which of these facts should be stored as properties on the edge between Ana and Orbit Ltd, not on either vertex? Select all that apply.",
      fig: FIG_PROPS,
      o: [
        "The year Ana started at Orbit Ltd",
        "Ana's year of birth",
        "Ana's job title at Orbit Ltd",
        "The city where Orbit Ltd is based",
      ],
      a: [0, 2],
      why: "A property belongs on the edge when it describes the relationship itself. When she started and her title there exist only because of the WORKS_AT link. Her birth year belongs to Ana, and the city belongs to the company.",
    },
  ]);

  /* ================= ds-nosql ================= */
  const rowsKV = [
    ["r1", "S-A", "09:00", "11"],
    ["r2", "S-A", "09:20", "12"],
    ["r3", "S-A", "09:40", "14"],
    ["r4", "S-A", "10:00", "15"],
    ["r5", "S-B", "09:20", "20"],
    ["r6", "S-B", "09:40", "21"],
    ["r7", "S-C", "09:00", "8"],
  ];
  const FIG_KV = svg(
    460,
    28 + rowsKV.length * 34 + 6,
    tx(30, 20, "Sensor (partition key)", { s: 12, c: "var(--text-dim)" }) +
      tx(210, 20, "Time (sort key)", { s: 12, c: "var(--text-dim)" }) +
      tx(360, 20, "Temp", { s: 12, c: "var(--text-dim)" }) +
      rowsKV
        .map(([id, s, t, v], i) =>
          pk(
            id,
            rc(8, 28 + i * 34, 444, 30) +
              tx(30, 49 + i * 34, s, { m: true }) +
              tx(210, 49 + i * 34, t, { m: true }) +
              tx(360, 49 + i * 34, v, { m: true }),
          ),
        )
        .join(""),
  );

  const dcard = (x, lines) =>
    rc(x, 6, 170, 100, { rx: 10 }) + lines.map((l, i) => tx(x + 12, 32 + i * 22, l, { m: true, s: 12 })).join("");
  const FIG_ITEMS = svg(
    560,
    116,
    dcard(4, ["title: Dune", "author: Herbert", "pages: 320"]) +
      dcard(194, ["title: Alien", "director: Scott", "minutes: 117"]) +
      dcard(384, ["title: Torch", "price: 40", "voltage: 5"]),
  );

  const FIG_SPARSE = table(
    ["Row", "Columns this row actually has"],
    [
      ["1", "name, age"],
      ["2", "name, city, phone"],
      ["3", "name, age, city"],
      ["4", "name, plan"],
    ],
  );

  B.add("ds-nosql", [
    {
      type: "pick",
      q: "A store keeps these rows grouped by partition key and ordered by sort key. A query asks for sensor S-A's readings from 09:20 to 09:40 inclusive. Tap every row it returns.",
      fig: FIG_KV,
      a: ["r2", "r3"],
      why: "The partition key picks the group (S-A only), and the sort key then gives a range inside it (09:20 to 09:40). The S-B rows have matching times but the wrong partition, and the other S-A rows fall outside the range.",
    },
    {
      type: "cat",
      q: "Sort these jobs by how well a pure key-value store handles them.",
      buckets: ["Fits a key-value store", "Awkward for a key-value store"],
      items: [
        ["Fetch one player's session by its session ID", 0],
        ["Find every session started from Leeds", 1],
        ["Read a sensor's readings between two times inside one partition", 0],
        ["Join each order with its customer's details", 1],
        ["Find the shortest chain of introductions between two people", 1],
        ["Overwrite a basket after every click", 0],
      ],
      why: "Key-value stores are built for lookups by key (and ranges on a sort key within one partition). Searching by values, joining and path-finding need a different model or a lot of scanning.",
    },
    {
      type: "bug",
      q: "A team designs a key-value table for click events, spread over 10 servers by hashing the partition key. At peak 50,000 writes a second arrive and one server melts while the other nine idle. Click the line that causes it.",
      code: [
        "Table: Clicks",
        "Partition key: today's date",
        "Sort key: time of click",
        "Servers: 10, partitions spread by hashing the partition key",
        "Traffic: 50,000 writes a second, all for today",
      ],
      a: 1,
      why: "Every click today has the same partition key, so every write hashes to the same partition on the same server. A key with many different values (such as a user or session ID) spreads writes across all ten servers.",
    },
    {
      type: "multi",
      q: "These three documents sit in one document-store collection. Select all statements that are true.",
      fig: FIG_ITEMS,
      o: [
        "A query for pages above 300 can only ever match the book",
        "The store would reject the film because it has no pages field",
        "Code that totals price over the collection must cope with documents that lack one",
        "Each of the three shapes needs its own database server",
      ],
      a: [0, 2],
      why: "Documents in a collection may differ, so nothing is rejected, but the application has to expect missing fields. Fields only match the documents that have them. Shapes do not need separate servers.",
    },
    {
      type: "mcq",
      q: "A wide-column store holds these four rows, each with only the columns shown. A fixed-column table would need one column for every name used by any row. How many cells would be empty in that table?",
      fig: FIG_SPARSE,
      o: ["6", "10", "14", "20"],
      a: 1,
      why: "Five distinct column names (name, age, city, phone, plan) across four rows make 20 cells, but only 2 + 3 + 3 + 2 = 10 hold data, so 10 are empty. A wide-column row stores just the columns it has.",
      hint: "Count the distinct names, multiply by 4 rows, then take away the cells that hold data.",
    },
    {
      type: "slider",
      q: "A document collection holds 600 GB. Each server can store 150 GB, and every item is kept on 3 different servers so the data stays available if some machines fail. How many servers does the cluster need?",
      min: 0,
      max: 20,
      step: 1,
      ans: 12,
      tol: 1,
      unit: " servers",
      why: "600 GB across 150 GB servers is 4 servers for one copy. Three copies of everything need 4 × 3 = 12. Adding machines (horizontal scaling) buys both room and availability.",
      hint: "First how many servers hold one copy (600 ÷ 150), then multiply by 3.",
    },
  ]);

  /* ================= ds-log ================= */
  const FIG_LOG1 = svg(
    580,
    70,
    [["set a=1"], ["set b=2"], ["set a=5"], ["delete b"], ["set c=7"]]
      .map(([s], i) =>
        pk("r" + (i + 1), rc(6 + i * 114, 22, 106, 40) + tx(59 + i * 114, 48, s, { a: "middle", m: true, s: 13 })),
      )
      .join("") +
      [1, 2, 3, 4, 5]
        .map((n, i) => tx(59 + i * 114, 14, "record " + n, { a: "middle", s: 11, c: "var(--text-faint)" }))
        .join(""),
  );

  const FIG_LOG2 = chips([
    "set a=1",
    "set b=2",
    "set a=4",
    "delete b",
    "set c=9",
    "delete c",
    "set c=3",
    "set d=6",
    "delete d",
  ]);

  const FIG_CRASH = svg(
    560,
    120,
    rc(6, 20, 150, 44, { st: "var(--teal)" }) +
      tx(81, 48, "len 9 | set a=1", { a: "middle", m: true, s: 12 }) +
      rc(166, 20, 150, 44, { st: "var(--teal)" }) +
      tx(241, 48, "len 9 | set b=2", { a: "middle", m: true, s: 12 }) +
      rc(326, 20, 96, 44, { st: "var(--rose)", d: "6 4" }) +
      tx(374, 48, "len 20 | se", { a: "middle", m: true, s: 12 }) +
      ln(430, 8, 430, 76, "var(--rose)", 4) +
      tx(438, 28, "power", { s: 12, c: "var(--rose)" }) +
      tx(438, 46, "cut", { s: 12, c: "var(--rose)" }) +
      tx(81, 88, "record 1: complete", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(241, 88, "record 2: complete", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(374, 88, "record 3: cut short", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(374, 106, "(header says 20 bytes)", { a: "middle", s: 11, c: "var(--text-faint)" }),
  );

  const FIG_CHART = svg(
    440,
    230,
    ln(50, 190, 420, 190, "var(--line-2)", 2) +
      ln(50, 190, 50, 20, "var(--line-2)", 2) +
      [10, 20, 30, 40]
        .map((g, i) => tx(100 + i * 100, 210, g + " GB", { a: "middle", s: 12, c: "var(--text-dim)" }))
        .join("") +
      tx(235, 228, "size of the log file", { a: "middle", s: 12, c: "var(--text-faint)" }) +
      tx(14, 110, "time", { s: 12, c: "var(--text-faint)" }) +
      `<polyline points="100,160 200,130 300,100 400,70" fill="none" stroke="var(--rose)" stroke-width="4" stroke-linecap="round"/>` +
      `<polyline points="100,182 200,182 300,182 400,182" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linecap="round"/>` +
      tx(400, 58, "A", { a: "middle", s: 15, c: "var(--rose-ink)" }) +
      tx(400, 172, "B", { a: "middle", s: 15, c: "var(--teal-ink)" }),
  );

  B.add("ds-log", [
    {
      type: "pick",
      q: "A log-based key-value store holds the five records below, oldest first. A client asks for b. Tap the record that decides the answer.",
      fig: FIG_LOG1,
      a: "r4",
      why: 'The newest record for a key wins, and the newest record for b is the tombstone (delete b). The answer is "not found", even though record 2 still holds the old value.',
    },
    {
      type: "slider",
      q: "A plain log holds 50 million records of 100 bytes each, and a read scans the whole file at 100 MB per second. About how many seconds does one read take?",
      min: 0,
      max: 120,
      step: 5,
      ans: 50,
      tol: 15,
      unit: " s",
      why: "50 million × 100 bytes = 5,000 MB, and 5,000 MB at 100 MB per second is 50 seconds. A scan per read does not survive real data volumes, which is why an index is needed.",
      hint: "50 million × 100 bytes is 5,000 MB (5 billion bytes). Then divide by 100 MB per second.",
    },
    {
      type: "bug",
      q: "After a restart the store rebuilds its in-memory hash map from the log. Click the line that makes it end up with old values.",
      code: [
        "on restart:",
        "  index = empty map",
        "  for each record in the log, from the newest to the oldest:",
        "    index[record.key] = that record's offset",
        "  now serve reads",
      ],
      a: 2,
      why: "Each assignment overwrites the previous one for that key, so the last record processed wins. Reading newest to oldest leaves the oldest record in the map. Replay from the oldest to the newest instead.",
    },
    {
      type: "mcq",
      q: "The power fails while the third record is being appended. After the restart the file ends as drawn. What should the store do?",
      fig: FIG_CRASH,
      o: [
        "Spot that the last record is incomplete and cut the file back to the end of record 2",
        "Throw the whole file away and start again with an empty log",
        "Read record 3 as it is and treat the missing bytes as zeros",
        "Keep waiting for the missing bytes of record 3 to arrive",
      ],
      a: 0,
      why: "Records 1 and 2 are complete, and because the log only appends, they were never touched. The partial tail is the only damage, so recovery trims it. Losing everything or guessing the missing bytes would throw away good data or invent data.",
    },
    {
      type: "cat",
      q: 'Replay this log from the top. For each request, does the store return a value or report "not found"?',
      fig: FIG_LOG2,
      buckets: ["Returns a value", "Reports not found"],
      items: [
        ["get(a)", 0],
        ["get(b)", 1],
        ["get(c)", 0],
        ["get(d)", 1],
        ["get(e)", 1],
      ],
      why: "a ends at 4. b was deleted. c was written, deleted and written again, so it ends at 3. d was deleted last. e never appears in the log at all.",
    },
    {
      type: "mcq",
      q: "A team charts how long a get and a set take as their log file grows. Line A rises steadily while line B stays flat. Which reading of the chart is right?",
      fig: FIG_CHART,
      o: [
        "A is get: it scans a bigger file each time. B is set: it only appends at the end",
        "A is set: bigger files take longer to write to. B is get: it jumps straight to the record",
        "A is delete: it must scan for the key. B is get: it reads the last line",
        "A is set: it must check every old record first. B is delete: it adds a marker only",
      ],
      a: 0,
      why: "In a plain log, appending costs the same however big the file is, so its time is flat. Reading has to scan for the key, so its time grows with the file. That growth is the problem an index solves.",
    },
  ]);

  /* ================= ds-hashidx ================= */
  const FIG_COMPACT = segRows(
    [
      {
        id: "1",
        label: "Segment 1 (oldest)",
        recs: [
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ],
      },
      {
        id: "2",
        label: "Segment 2",
        recs: [
          ["a", 4],
          ["d", 5],
          ["b", 6],
        ],
      },
      {
        id: "3",
        label: "Segment 3 (newest)",
        recs: [
          ["a", 7],
          ["c", 8],
          ["e", 9],
        ],
      },
    ],
    { pick: true },
  );

  const FIG_WORK = table(
    ["", "Workload A", "Workload B"],
    [
      ["Distinct keys", "40 thousand", "3 billion"],
      ["Writes per day", "2 billion updates", "3 billion, each key written once"],
      ["Reads", "by key", "by key"],
    ],
  );

  const FIG_IDX = segRows(
    [
      {
        id: "1",
        label: "Segment 1 (oldest)",
        recs: [
          ["k1", 4],
          ["k2", 7],
        ],
      },
      {
        id: "2",
        label: "Segment 2",
        recs: [
          ["k1", 9],
          ["k3", 2],
        ],
      },
      { id: "3", label: "Segment 3 (newest)", recs: [["k3", 5]] },
    ],
    { head: "index: k1 → seg 2,  k2 → seg 1,  k3 → seg 3" },
  );

  B.add("ds-hashidx", [
    {
      type: "pick",
      q: "Compaction merges these three segments into one, keeping only the newest value for each key. Tap every record that gets thrown away.",
      fig: FIG_COMPACT,
      a: ["1a", "1b", "1c", "2a"],
      why: "Newest values: a = 7 and c = 8 (segment 3), b = 6 and d = 5 (segment 2), e = 9 (segment 3). That leaves segment 1's a, b and c and segment 2's a as stale. Segment 1 is wholly out of date.",
    },
    {
      type: "slider",
      q: "A hash index keeps one entry per key and each entry takes about 100 bytes of memory. The server has 8 GB of memory set aside for it. Roughly how many million keys can it index?",
      min: 0,
      max: 200,
      step: 10,
      ans: 80,
      tol: 30,
      unit: " million",
      why: "8 GB is about 8,000 MB, and each entry is 100 bytes, so 8,000 MB ÷ 100 bytes = 80 million entries. The hash map must fit in memory, which caps the number of distinct keys.",
      hint: "8 GB is 8,000 MB. How many 100-byte entries fit in one MB?",
    },
    {
      type: "bug",
      q: "Compaction runs in the background while the store keeps serving reads. Click the step that can lose data or break reads.",
      code: [
        "compaction (background):",
        "  read the old segments and keep the newest record for each key",
        "  delete the old segments",
        "  write the kept records to a new segment file",
        "  point the index at the new segment",
      ],
      a: 2,
      why: "Until the new segment is written and the index points at it, reads still need the old files, and a crash in between would lose everything. Safe order: write the new segment, switch the index, then delete the old ones.",
    },
    {
      type: "mcq",
      q: "Which workload suits a hash-indexed log?",
      fig: FIG_WORK,
      o: [
        "A: few keys fit in memory, and compaction collapses billions of updates",
        "A: so many updates make every lookup slower than a scan",
        "B: the log never needs compaction, so the index can be smaller",
        "B: 3 billion keys is easy because the index lives on disk",
      ],
      a: 0,
      why: "The index needs one in-memory entry per distinct key. A has 40 thousand keys (a few MB) and compaction shrinks its pile of updates to 40 thousand records. B would need hundreds of GB of memory for its keys.",
    },
    {
      type: "cat",
      q: "The server restarts. For each item, does it survive on disk, or must it be rebuilt?",
      buckets: ["Survives the restart", "Must be rebuilt"],
      items: [
        ["The segment files", 0],
        ["The in-memory hash map of keys to offsets", 1],
        ["The newest value written for every key", 0],
        ["The record of which segment each key lives in (held in the map)", 1],
        ["Old overwritten values that compaction has not reached yet", 0],
      ],
      why: "Everything written is appended to files, so it survives. The hash map lives in memory and is lost, so the store replays the segments to rebuild it.",
    },
    {
      type: "multi",
      q: "Look at the index and the three segments. Select all statements that are true.",
      fig: FIG_IDX,
      o: [
        "The k1 record in segment 1 is out of date",
        "Merging segments 1 and 2 keeps k1 = 9 and k2 = 7",
        "k3's newest value is in segment 2",
        "Segment 1 could be deleted without losing any current value",
      ],
      a: [0, 1],
      why: "k1 was rewritten in segment 2, so segment 1's copy is stale. A merge of segments 1 and 2 keeps k1 = 9 and k2 = 7. k3's newest value is 5 in segment 3. Segment 1 is the only place with k2, so deleting it would lose a current value.",
    },
  ]);

  /* ================= ds-sstable ================= */
  const tn = (x, y, k) =>
    `<circle cx="${x}" cy="${y}" r="20" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>` +
    tx(x, y + 5, k, { a: "middle", m: true, s: 15 });
  const FIG_TREE = svg(
    560,
    190,
    ln(280, 30, 140, 90) +
      ln(280, 30, 420, 90) +
      ln(140, 90, 70, 160) +
      ln(140, 90, 210, 160) +
      ln(420, 90, 350, 160) +
      ln(420, 90, 490, 160) +
      tn(280, 30, "m") +
      tn(140, 90, "f") +
      tn(420, 90, "s") +
      tn(70, 160, "c") +
      tn(210, 160, "i") +
      tn(350, 160, "p") +
      tn(490, 160, "w"),
  );

  const FIG_READ = segRows(
    [
      {
        id: "m",
        label: "Memtable (memory)",
        recs: [
          ["c", 1],
          ["m", 2],
        ],
      },
      {
        id: "3",
        label: "Segment 3 (newest)",
        recs: [
          ["b", 5],
          ["x", 1],
        ],
      },
      {
        id: "2",
        label: "Segment 2",
        recs: [
          ["m", 3],
          ["q", "DELETED", "var(--rose)"],
        ],
      },
      {
        id: "1",
        label: "Segment 1 (oldest)",
        recs: [
          ["a", 1],
          ["q", 8],
        ],
      },
    ],
    { pick: true },
  );

  const FIG_SPARSEIDX = svg(
    560,
    200,
    tx(8, 22, "One sorted segment of 6,000 keys, two index designs", { s: 13, c: "var(--text-dim)" }) +
      tx(8, 56, "Design A", { s: 14 }) +
      [0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            rc(90 + i * 74, 38, 70, 26, { st: "var(--blue)" }) +
            tx(125 + i * 74, 56, "100 keys", { a: "middle", s: 11, w: 700 }),
        )
        .join("") +
      tx(8, 76, "index entry at the start of each block", { s: 11, c: "var(--text-faint)", w: 700 }) +
      tx(8, 120, "Design B", { s: 14 }) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        .map(
          (i) =>
            rc(90 + i * 37, 102, 34, 26, { st: "var(--amber)" }) +
            tx(107 + i * 37, 120, "10", { a: "middle", s: 11, w: 700 }),
        )
        .join("") +
      tx(8, 140, "index entry at the start of each block", { s: 11, c: "var(--text-faint)", w: 700 }) +
      tx(8, 176, "A: every 100th key is indexed (60 entries).   B: every 10th key is indexed (600 entries).", {
        s: 12,
        c: "var(--text-dim)",
        w: 700,
      }) +
      tx(8, 194, "Blocks are drawn only in part.", { s: 11, c: "var(--text-faint)", w: 700 }),
  );

  B.add("ds-sstable", [
    {
      type: "order",
      q: "The memtable is the balanced tree drawn here. It is flushed to disk as a new SSTable. Put the keys in the order they are written into the file.",
      fig: FIG_TREE,
      items: ["c", "f", "i", "m", "p", "s", "w"],
      why: "An SSTable is sorted by key, and reading a balanced search tree in order (left branch, then the node, then right branch) hands the keys over already sorted. That is why the memtable is a tree, and why no separate sort is needed at flush time.",
    },
    {
      type: "pick",
      q: "A read for key q checks the memtable first, then segments from newest to oldest, and stops at the first record it finds for q. Tap the record that decides the answer.",
      fig: FIG_READ,
      a: "2q",
      why: 'The memtable and segment 3 have no q, so the search reaches segment 2 and finds the tombstone there. It stops, so the answer is "not found", even though segment 1 still holds q = 8.',
    },
    {
      type: "mcq",
      q: "Memory is tight and reads are not time-critical. Which design fits, and what does it cost?",
      fig: FIG_SPARSEIDX,
      o: [
        "Design A: 60 index entries, but a lookup may scan about 100 records",
        "Design A: 600 index entries, and a lookup scans about 10 records",
        "Design B: 60 index entries, but a lookup may scan about 100 records",
        "Design B: 600 index entries, so every key is found with no scan",
      ],
      a: 0,
      why: "A sparse index trades memory for scanning. Indexing every 100th key needs a tenth of the memory of indexing every 10th, but each lookup has to scan a block ten times as long.",
    },
    {
      type: "bug",
      q: "This put() is meant to keep writes flowing while a full memtable is saved. Click the line that breaks that.",
      code: [
        "put(key, value):",
        "  memtable.insert(key, value)",
        "  if memtable is full:",
        "    freeze it, start a new empty memtable",
        "    block all puts until the frozen one is saved",
      ],
      a: 4,
      why: "New writes go into a fresh memtable while the full one is written out in the background, so writing stays fast. Blocking every put until the flush ends would stall the store each time the memtable fills.",
    },
    {
      type: "multi",
      q: "Three sorted segments of 1,000 keys each are merged into one. Select all statements that are true.",
      o: [
        "The inputs are read one after another from start to end, with no random jumping",
        "The output may hold fewer than 3,000 records",
        "The output must be sorted again afterwards",
        "When a key is in several segments, the oldest segment's value wins",
      ],
      a: [0, 1],
      why: "Merging sorted files is like the merge step of merge sort: read them side by side, sequentially. Duplicate keys collapse to one record, so the result can be smaller than 3,000. The output comes out sorted already, and the newest value wins, not the oldest.",
    },
    {
      type: "slider",
      q: "A store flushes its memtable whenever it fills 64 MB. Writes arrive at 8 MB per second. If nothing is ever merged, about how many SSTables pile up in one hour?",
      min: 0,
      max: 1000,
      step: 50,
      ans: 450,
      tol: 100,
      unit: " SSTables",
      why: "64 MB at 8 MB per second fills every 8 seconds. One hour is 3,600 seconds, so 3,600 ÷ 8 = 450 files. A read might have to check each of them, which is why background merging matters.",
      hint: "How many seconds to fill 64 MB at 8 MB per second? Then divide 3,600 by that.",
    },
  ]);
})();

/* ===== bank-w-ds-1.js ===== */
/* DS revision bank, second set of visual and varied questions, part 1.
   Modules: ds-why, ds-blocks, ds-reliability, ds-load, ds-twitter, ds-scaling, ds-maintain.
   Every question stands on its own; the figure carries the data needed. Numbers checked with node. */
(function () {
  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 10 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><thead><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const box2 = (x, y, w, h, a, b, o = {}) =>
    rc(x, y, w, h, o) +
    tx(x + w / 2, y + h / 2 - 3, a, { s: 12 }) +
    tx(x + w / 2, y + h / 2 + 13, b, { s: 11, c: "var(--text-dim)", w: 700 });

  /* ================= ds-why ================= */

  const growthTable = table(
    ["Month", "0", "3", "6", "9", "12"],
    [["Peak requests per second", "100", "200", "400", "800", "1,600"]],
  );

  const designsTable = `<table class="t"><thead><tr><th>Design</th><th>What a Sydney customer sees while the link is down (London paid out £40 a minute ago)</th></tr></thead><tbody><tr><td>X</td><td>Their balance of £100, shown at once, no warning</td></tr><tr><td>Y</td><td>An apology: "We can't show your balance right now"</td></tr><tr><td>Z</td><td>Their balance of £100 at once, tagged "may be out of date"</td></tr></tbody></table>`;

  const splitFig = (() => {
    let s = ln(150, 53, 270, 53, { s: "var(--teal)", sw: 4 });
    s += ln(90, 78, 175, 128, { s: "var(--rose)", d: "7 6" }) + ln(330, 78, 245, 128, { s: "var(--rose)", d: "7 6" });
    s += tx(126, 108, "✗", { c: "var(--rose-ink)", s: 18 }) + tx(294, 108, "✗", { c: "var(--rose-ink)", s: 18 });
    s +=
      pk("london", rc(30, 30, 120, 46) + tx(90, 59, "London")) +
      pk("paris", rc(270, 30, 120, 46) + tx(330, 59, "Paris")) +
      pk("sydney", rc(150, 130, 120, 46) + tx(210, 159, "Sydney"));
    return svg(420, 190, s);
  })();

  const twoServers = (() => {
    let s = tx(280, 16, "Either server can answer every request", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(100, 30, 150, 46, { s: "var(--teal)" }) +
      tx(175, 52, "Server 1", { s: 13 }) +
      tx(175, 68, "up 99% of the time", { s: 11, c: "var(--text-dim)", w: 700 });
    s +=
      rc(310, 30, 150, 46, { s: "var(--teal)" }) +
      tx(385, 52, "Server 2", { s: 13 }) +
      tx(385, 68, "up 99% of the time", { s: 11, c: "var(--text-dim)", w: 700 });
    return svg(560, 90, s);
  })();

  B.add("ds-why", [
    {
      type: "slider",
      q: "Demand doubles every three months (see the table). Today's server copes with 400 requests per second. It will be replaced by one 4 times bigger. Roughly how many extra months does that buy, counting from the moment the old server runs out?",
      fig: growthTable,
      min: 0,
      max: 12,
      step: 1,
      ans: 6,
      tol: 1,
      unit: " months",
      hint: "Going from 400 to 1,600 means doubling twice. Each doubling takes three months.",
      why: "400 is reached at month 6 and 1,600 at month 12, so the 4 times bigger machine buys only 6 months. When demand grows exponentially, buying a bigger machine is a short reprieve, which is why a design that can add machines is needed.",
    },
    {
      type: "multi",
      q: "A bank's data centres in London and Sydney cannot talk to each other. Which designs have chosen availability over consistency? Select all.",
      fig: designsTable,
      o: ["Design X", "Design Y", "Design Z"],
      a: [0, 2],
      why: "X and Z both answer at once from a copy that cannot know about the withdrawal. Tagging Z's answer as possibly out of date is honest, but it is still an answer that may be wrong. Only Y refuses to answer until the copies can agree, which is the consistency choice.",
    },
    {
      type: "pick",
      q: "A fault has cut the red dashed links. Tap the data centres that can still reach each other.",
      fig: splitFig,
      a: ["london", "paris"],
      why: "London and Paris still share a working link, so they can agree between them. Sydney is cut off on its own. Each side must now decide whether to keep answering (availability) or wait to be sure its data is right (consistency).",
    },
    {
      type: "bug",
      q: "A hosting contract is used to promise customers that a single-server service will rarely be down. Which line of the reasoning is wrong?",
      code: [
        "Contract: the server is up 99.9% of the year",
        "99.9% uptime allows about 9 hours of unplanned downtime a year",
        "Planned upgrades: 6 a year, each needs a 2-hour restart",
        "Conclusion: users will lose at most 9 hours of service a year",
      ],
      a: 3,
      why: "0.1% of a year is about 9 hours, but the upgrades add another 6 × 2 = 12 hours, so users lose about 21 hours. With a single server even routine maintenance is downtime, which is one of the limits that pushes designs towards several machines.",
    },
    {
      type: "mcq",
      q: "Two independent servers are each up 99% of the time, and either one can serve users. Roughly how often are BOTH down at the same moment?",
      fig: twoServers,
      o: ["About 0.01% of the time", "About 0.5% of the time", "About 1% of the time", "About 2% of the time"],
      a: 0,
      hint: "Each is down 1 time in 100. Both at once is 1 in 100 of those moments: 1 in 100 × 100.",
      why: "1% of 1% is 0.01%, about 1 minute in a week. Redundancy multiplies small failure chances together, which is its great strength. The sum only works if the faults are independent, which is the catch with shared causes.",
    },
    {
      type: "mcq",
      q: 'A forum shows each member\'s "last seen online" time. One database copy is sometimes about two seconds behind. What is the sensible design call?',
      o: [
        "Serve it: a slightly old last-seen time harms nobody",
        "Make every read wait until all copies agree, to be safe",
        "Remove the copies, because any lag makes them useless",
        "Show an error whenever two copies differ at all",
      ],
      a: 0,
      why: "A two-second-old timestamp does no damage, so availability and speed matter more than perfect agreement. Waiting for agreement or erroring is the right call for balances or the last seat on a flight, not for a harmless label.",
    },
  ]);

  /* ================= ds-blocks ================= */

  const lruFig = (() => {
    const it = [
      ["a", "Item A", "last used 2 s ago", "used 3 times"],
      ["b", "Item B", "last used 9 s ago", "used 40 times"],
      ["c", "Item C", "last used 6 s ago", "used once"],
    ];
    let s = tx(280, 16, "The cache is full. A new item, D, arrives and one item must go.", {
      s: 12,
      c: "var(--text-dim)",
    });
    it.forEach(
      ([id, n, l, u], i) =>
        (s += pk(
          id,
          rc(10 + i * 185, 30, 170, 80, { s: "var(--blue)" }) +
            tx(95 + i * 185, 54, n) +
            tx(95 + i * 185, 74, l, { s: 12, c: "var(--text-dim)", w: 700 }) +
            tx(95 + i * 185, 94, u, { s: 12, c: "var(--text-dim)", w: 700 }),
        )),
    );
    return svg(560, 125, s);
  })();

  const indexFig = table(
    ["id (has an index)", "name", "city", "joined"],
    [
      ["4021", "Priya", "Leeds", "2021"],
      ["4022", "Tom", "Exeter", "2019"],
      ["4023", "Aisha", "Leeds", "2023"],
      ["…", "…", "…", "…"],
    ],
  );

  const hitTable = table(
    ["Cache today", ""],
    [
      ["Share of requests answered by the cache", "90%"],
      ["Time for a cache hit", "2 ms"],
      ["Time for a miss (cache, then database)", "102 ms"],
      ["Option A", "Raise the hit share to 95%"],
      ["Option B", "Cut the hit time to 1 ms"],
    ],
  );

  const coldFig = (() => {
    const v = [50, 50, 50, 950, 500, 200, 100],
      base = 190,
      k = 0.15;
    let s = tx(10, 14, "Database load in requests per second. The cache is restarted, empty, at minute 4.", {
      a: "start",
      s: 12,
      c: "var(--text-dim)",
    });
    v.forEach((d, i) => {
      const x = 30 + i * 74,
        h = d * k;
      s += pk(
        "m" + (i + 1),
        rc(x, base - h, 54, h, { rx: 6, f: "var(--panel)", s: "var(--blue)", sw: 2 }) +
          tx(x + 27, base - h - 6, d, { s: 12 }) +
          tx(x + 27, base + 17, "Min " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    s +=
      ln(20, base - 300 * k, 548, base - 300 * k, { s: "var(--rose)", d: "7 6" }) +
      tx(24, base - 300 * k - 6, "Database copes with 300", { a: "start", s: 12, c: "var(--rose-ink)" });
    return svg(560, 215, s);
  })();

  B.add("ds-blocks", [
    {
      type: "pick",
      q: "The cache evicts the least recently used item. Tap the slot that is thrown out to make room for D.",
      fig: lruFig,
      a: "b",
      why: "Least recently used means the item untouched for the longest time: B, at 9 seconds. It is the most used overall, but the policy bets on recency, not on how popular an item was in the past. Counting uses would be a different policy.",
    },
    {
      type: "multi",
      q: "The customers table has an index on id only (shown). Which lookups does that index speed up? Select all.",
      fig: indexFig,
      o: [
        "Find the customer whose id is 4021",
        "List every customer who lives in Leeds",
        "Fetch customer 77's record at log-in",
        "Count all the customers who joined in 2023",
      ],
      a: [0, 2],
      why: "An index is a shortcut on one field. Looking up by id (a login, a profile page) can jump straight to the record. Finding by city or joining year has no shortcut, so the database still scans the whole table.",
    },
    {
      type: "match",
      q: "Match each symptom to the building block that fixes it.",
      pairs: [
        ["Every visitor makes the server recompute the same expensive result", "Cache"],
        ["Finding one customer in a huge table takes ages", "Index"],
        ["A yearly report must crunch every sale in the company", "Batch job"],
        ["A card-fraud alert must appear within seconds of a payment", "Stream processing"],
      ],
      why: "A cache stores a repeated answer, an index speeds finding by one field, batch processing handles huge jobs when delay is fine, and stream processing reacts to events as they arrive.",
    },
    {
      type: "mcq",
      q: "The cache is nearly always right. Which change lowers the average response time more?",
      fig: hitTable,
      o: [
        "Option A: raise the hit share to 95%",
        "Option B: cut the hit time to 1 ms",
        "They help about equally",
        "Neither: the database alone sets the average",
      ],
      a: 0,
      hint: "A hit costs 2 ms, a miss 102 ms. Where is most of the average time spent?",
      why: "Today the average is 0.9 × 2 + 0.1 × 102 = 12 ms. Option A gives 0.95 × 2 + 0.05 × 102 = 7 ms. Option B gives only 0.9 × 1 + 0.1 × 102 = 11.1 ms. The rare misses dominate, so avoiding them is worth far more than speeding up hits.",
    },
    {
      type: "pick",
      q: "The database copes with 300 requests per second. Tap the LAST minute in which it was overloaded.",
      fig: coldFig,
      a: "m5",
      why: "With the cache empty, nearly every request reaches the database, and it takes time to refill. Minute 4 has 950 and minute 5 has 500, both above 300. By minute 6 the load of 200 is back within its limit. A cache hides load, so losing it can overwhelm the database behind it.",
    },
    {
      type: "order",
      q: "Put the steps in order so that a changed address never leaves a stale copy in the cache for long.",
      items: [
        "A customer changes their address and the app writes it to the database",
        "The app deletes that customer's old cached copy",
        "Later, someone asks for the address and the cache has no entry",
        "The app reads the fresh row from the database",
        "The app stores the fresh row in the cache and returns it",
      ],
      why: "The database stays the source of truth. Deleting the old cached copy forces the next read to miss, fetch the fresh row and refill the cache, so the stale value cannot be served again.",
    },
  ]);

  /* ================= ds-reliability ================= */

  const chainFig = (() => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      s +=
        rc(8 + i * 110, 20, 90, 50, { s: "var(--blue)" }) +
        tx(53 + i * 110, 42, "Service " + (i + 1), { s: 12 }) +
        tx(53 + i * 110, 59, "up 99%", { s: 12, c: "var(--text-dim)", w: 700 });
      if (i < 4) s += ln(100 + i * 110, 45, 116 + i * 110, 45, { sw: 3 });
    }
    s += tx(280, 92, "A request must pass through all five, and each fails independently.", {
      s: 12,
      c: "var(--text-dim)",
    });
    return svg(560, 104, s);
  })();

  const powerFig = (() => {
    let s = ln(80, 110, 110, 110) + ln(190, 110, 230, 40) + ln(190, 110, 230, 110) + ln(190, 110, 230, 180);
    [40, 110, 180].forEach((y) => (s += ln(330, y, 450, 110, { sw: 2, s: "var(--amber)" })));
    s += rc(10, 90, 70, 40) + tx(45, 115, "Users");
    s += pk("router", rc(110, 90, 80, 40) + tx(150, 115, "Router"));
    [20, 90, 160].forEach(
      (y, i) => (s += pk("srv" + (i + 1), rc(230, y, 100, 40) + tx(280, y + 25, "Server " + (i + 1)))),
    );
    s += pk("power", rc(450, 90, 100, 40, { s: "var(--amber)" }) + tx(500, 115, "Power strip"));
    return svg(560, 215, s);
  })();

  const mttrTable = table(
    ["", "How often it fails", "Time to recover each time"],
    [
      ["Service A", "Once every 100 days", "1 day"],
      ["Service B", "Once every 10 days", "1 minute"],
    ],
  );

  B.add("ds-reliability", [
    {
      type: "mcq",
      q: "Each service in the chain is up 99% of the time and any one failing breaks the request. Roughly how often does a request succeed?",
      fig: chainFig,
      o: ["About 99%", "About 95%", "About 85%", "About 60%"],
      a: 1,
      hint: "Each service costs you about one percentage point. There are five of them.",
      why: "0.99 × 0.99 × 0.99 × 0.99 × 0.99 is about 0.95. Dependencies in a chain multiply their failure chances, so a system is less reliable than any single part. This is the opposite of redundancy, which multiplies in your favour.",
    },
    {
      type: "cat",
      q: "A post-mortem lists these events. Sort each one as a fault (a part misbehaves) or a failure (users are affected).",
      buckets: ["Fault", "Failure"],
      items: [
        ["A disk starts returning read errors", 0],
        ['Customers see a "service unavailable" page for 20 minutes', 1],
        ["A bad config file is pushed to one server", 0],
        ["Orders placed during the outage are lost", 1],
        ["A node reboots in a loop", 0],
      ],
      why: "A fault is a component departing from its spec. A failure is the whole service stopping its job for users. Fault tolerance is about stopping faults from turning into failures.",
    },
    {
      type: "pick",
      q: "The team claims three servers means any single failure is survivable. Tap EVERY part whose failure alone would still take the service down.",
      fig: powerFig,
      a: ["router", "power"],
      why: "The three servers are redundant, but they all depend on one router and one power strip. Redundancy only protects you from a part if there are spares of that part. Hidden shared dependencies are the usual way a redundant design still fails.",
    },
    {
      type: "bug",
      q: "Under normal load this works. When the backend slows down, the whole system collapses. Which line turns one slow service into a cascading failure?",
      code: [
        "def call_backend(req):",
        "    for attempt in range(1000):",
        "        resp = backend.send(req)",
        "        if resp.ok: return resp",
        "    raise Error('backend unavailable')",
      ],
      a: 1,
      why: "Up to 1,000 instant retries multiply the load on an already struggling backend. Every client piles on, which makes it slower still. A few retries with growing pauses, plus a limit, keep a fault local.",
    },
    {
      type: "match",
      q: "A dependency is down. Match each to the graceful reaction that keeps the service useful.",
      pairs: [
        ["The product-recommendations service times out", "Show the bestsellers list instead"],
        ["The card provider cannot be reached", "Accept the order and retry the charge later"],
        ["The image-resizing service is down", "Serve the original photo, uncropped"],
        ["The primary database loses power", "Promote a replica to take over"],
      ],
      why: "Fault tolerance is usually a fallback that keeps the core job going: a worse but acceptable answer, a retry queue, or a standby that takes over.",
    },
    {
      type: "mcq",
      q: "Over a whole year, which service is down for less time in total?",
      fig: mttrTable,
      o: [
        "Service B, though it fails ten times more often",
        "Service A, because it fails only a tenth as often",
        "They tie, since both are eventually fixed",
        "Neither: it depends on what caused each fault",
      ],
      a: 0,
      hint: "Count failures in a year, then multiply by the repair time of each.",
      why: "A fails about 3.65 times a year at 1 day each, roughly 3.65 days of downtime. B fails about 36.5 times at 1 minute each, about 36.5 minutes. Fast recovery can matter more than rare failure, which is why teams invest in automatic restarts and failover.",
    },
  ]);

  /* ================= ds-load ================= */

  const tenCalls = (() => {
    let s = "";
    for (let i = 0; i < 10; i++)
      s +=
        rc(8 + i * 54, 14, 46, 38, { s: i === 6 ? "var(--rose)" : "var(--blue)", sw: 2 }) +
        tx(31 + i * 54, 38, "S" + (i + 1), { s: 12 });
    s += tx(280, 76, "Each call is slow 1 time in 100. The page waits for all ten calls.", {
      s: 12,
      c: "var(--text-dim)",
    });
    return svg(560, 88, s);
  })();

  const abTable = table(
    ["Service", "Median", "Average", "Slowest 1% start at"],
    [
      ["A", "80 ms", "120 ms", "2,500 ms"],
      ["B", "150 ms", "170 ms", "600 ms"],
    ],
  );

  const burstFig = (() => {
    let s = tx(10, 14, "Requests per second", { a: "start", s: 12, c: "var(--text-dim)" });
    [
      ["Server can handle", 100, "var(--teal)"],
      ["During a one-minute burst", 120, "var(--rose)"],
      ["After the burst", 80, "var(--blue)"],
    ].forEach(([l, v, c], i) => {
      const y = 28 + i * 34;
      s +=
        tx(10, y + 18, l, { a: "start", s: 12 }) +
        rc(190, y, v * 2.6, 24, { rx: 6, f: c, s: c, sw: 1 }) +
        tx(190 + v * 2.6 + 8, y + 18, v, { a: "start", s: 13 });
    });
    return svg(560, 140, s);
  })();

  B.add("ds-load", [
    {
      type: "slider",
      q: "A page waits for all ten backend calls. Each call is slow 1 time in 100. Roughly what percentage of page loads hit at least one slow call?",
      fig: tenCalls,
      min: 0,
      max: 50,
      step: 1,
      ans: 10,
      tol: 3,
      unit: "%",
      hint: "Ten chances, each at about 1 in 100.",
      why: "The chance all ten are fast is 0.99 to the power 10, about 0.90. So about 10% of pages are slow, even though each call is slow only 1% of the time. Tail latency spreads through a design with many calls.",
    },
    {
      type: "mcq",
      q: 'A checkout promises "almost every payment answers in under a second". Which service should it use?',
      fig: abTable,
      o: [
        "Service B, because its slowest requests are far milder",
        "Service A, because its median and average are lower",
        "Service A, because 99% of its requests are very fast",
        "Either one: the average is all that matters",
      ],
      a: 0,
      why: "The promise is about nearly every request, so the tail decides it. A is faster for most requests, but 1 request in 100 takes 2.5 seconds or more. B's worst 1% start at 0.6 seconds. Median and average hide this.",
    },
    {
      type: "order",
      q: "A load test adds more and more users. Put in order what you would expect to see.",
      items: [
        "Throughput rises in step with the number of users",
        "Response times stay flat while there is spare capacity",
        "Throughput stops rising because the system is at capacity",
        "Requests queue up and the p99 climbs sharply",
        "Timeouts and errors begin to appear",
      ],
      why: "While capacity is spare, extra load is absorbed with no visible cost. Once it runs out, extra requests wait in queues, so tail latency shoots up first and errors follow.",
    },
    {
      type: "slider",
      q: "The burst ends and load falls to 80 requests per second. The queue built up during the burst now drains. Roughly how many seconds until it is empty?",
      fig: burstFig,
      min: 0,
      max: 180,
      step: 5,
      ans: 60,
      tol: 15,
      unit: " s",
      hint: "Backlog = 20 extra per second × 60 seconds. It drains at 20 per second of spare capacity.",
      why: "During the burst 20 extra requests a second pile up for 60 seconds: 1,200 waiting. Afterwards there are 20 spare slots a second, so it takes 1,200 ÷ 20 = 60 seconds to clear. Users keep seeing slow answers long after the burst ends.",
    },
    {
      type: "bug",
      q: "A script combines the response times of several servers into one overall p99. Which line is wrong?",
      code: [
        "for server in servers:",
        "    p99s.append(percentile(server.times, 99))",
        "overall_p99 = sum(p99s) / len(p99s)",
        "print('overall p99:', overall_p99)",
      ],
      a: 2,
      why: "Percentiles cannot be averaged. One slow server's tail gets diluted by the others. Combine all the raw times (or the histograms) first and then take the 99th percentile.",
    },
    {
      type: "match",
      q: "Match each complaint to the measure that would show it.",
      pairs: [
        ['"Once in a while checkout hangs for ages"', "p99 response time"],
        ['"Most people say it feels quick"', "Median response time"],
        ['"Launch-day traffic is ten times a normal day"', "Peak requests per second"],
        ["\"Customers keep seeing 'something went wrong'\"", "Error rate"],
      ],
      why: "Rare slow experiences live in the tail (p99), typical ones in the median, demand is a load parameter, and failures show in the error rate. No single number covers all four.",
    },
  ]);

  /* ================= ds-twitter ================= */

  const followersFig = (() => {
    const f = [
      ["f1", "Follower 1 · opened 2 days ago"],
      ["f2", "Follower 2 · opened today"],
      ["f3", "Follower 3 · opened 14 months ago"],
      ["f4", "Follower 4 · opened 3 weeks ago"],
      ["f5", "Follower 5 · opened 2 years ago"],
    ];
    let s = "";
    f.forEach(([id, t], i) => {
      const y = 8 + i * 52;
      s +=
        ln(90, 120, 190, y + 20, { sw: 2 }) +
        pk(id, rc(190, y, 270, 40, { s: "var(--blue)" }) + tx(325, y + 25, t, { s: 12 }));
    });
    s += rc(10, 100, 80, 40) + tx(50, 125, "Author");
    return svg(470, 270, s);
  })();

  const bucketTable = table(
    ["Group", "Accounts", "Followers each", "Posts per day each"],
    [
      ["A", "1 million", "100", "2"],
      ["B", "10,000", "10,000", "4"],
      ["C", "100", "5 million", "10"],
    ],
  );

  const stepsFig = (() => {
    const st = [
      ["s1", "1 · Look up", "who I follow"],
      ["s2", "2 · Fetch latest", "tweets of each"],
      ["s3", "3 · Merge and", "sort by time"],
      ["s4", "4 · Show the", "first 50"],
    ];
    let s = "";
    st.forEach(
      ([id, a, b], i) =>
        (s +=
          pk(id, box2(8 + i * 138, 14, 126, 56, a, b, { s: "var(--blue)" })) +
          (i < 3 ? ln(134 + i * 138, 42, 146 + i * 138, 42, { sw: 2 }) : "")),
    );
    return svg(560, 84, s);
  })();

  B.add("ds-twitter", [
    {
      type: "pick",
      q: "A system writes each new tweet only into the timeline caches of followers who opened the app within the last 30 days. Tap every cache that gets a write.",
      fig: followersFig,
      a: ["f1", "f2", "f4"],
      why: "Followers 1, 2 and 4 opened the app within 30 days. Followers 3 and 5 have not been seen for over a year, so writing to their caches is wasted work. Their timeline can be built when (if) they ever return. This trims the fan-out bill without changing what active users see.",
    },
    {
      type: "bug",
      q: "This hybrid should push tweets from ordinary accounts into followers' timeline caches and leave huge accounts to be merged at read time. Yet the write bill is enormous. Which line is wrong?",
      code: [
        "def post(author, text):",
        "    id = save_tweet(author, text)",
        "    if follower_count(author) > 1_000_000:",
        "        push_to_follower_timelines(id)",
        "    # otherwise followers merge this tweet in when they read",
        "    return id",
      ],
      a: 2,
      why: "The test is the wrong way round: it pushes millions of cache writes for celebrities and leaves ordinary accounts to be merged on read. It should push when the count is below the threshold.",
    },
    {
      type: "cat",
      q: "Each trend below grows tenfold. Which design gets MORE expensive?",
      buckets: ["Merge on read", "Fan-out on write"],
      items: [
        ["The number of times each user opens their timeline a day", 0],
        ["The number of accounts each user follows", 0],
        ["The number of followers each account has", 1],
        ["The number of tweets posted each day", 1],
      ],
      why: "Merge on read pays on each timeline open, and more per open the more accounts you follow. Fan-out on write pays on each post, once per follower, so tweets per day and followers per account drive it.",
    },
    {
      type: "mcq",
      q: "Under fan-out on write, which group causes the most timeline-cache writes per day?",
      fig: bucketTable,
      o: [
        "Group C, with only 100 accounts",
        "Group A, with by far the most accounts",
        "Group B, the middle of the range",
        "They cause about the same",
      ],
      a: 0,
      hint: "Writes = accounts × followers × posts. Compare 100 × 5 million × 10 with 1 million × 100 × 2.",
      why: "C: 100 × 5,000,000 × 10 = 5 billion. B: 10,000 × 10,000 × 4 = 400 million. A: 1,000,000 × 100 × 2 = 200 million. A handful of huge accounts dominates the bill, which is why hybrids treat them differently.",
    },
    {
      type: "mcq",
      q: "A colleague says fan-out on write is wasteful, since most followers will never read most tweets. Which fact best answers them?",
      o: [
        "Timeline reads far outnumber posts, so paying once per post saves repeated work",
        "Writes to caches are always cheaper than reads from any database",
        "Followers are certain to read every tweet they are sent",
        "Fan-out on write needs no storage for the timelines",
      ],
      a: 0,
      why: "The design is a bet on the read-to-write ratio. With hundreds of reads for every post, preparing timelines at post time costs less overall than merging on every open. It is not free, and the bet fails for huge accounts.",
    },
    {
      type: "pick",
      q: "A user opens their timeline under fan-out on write, where it is already built. Tap EVERY step that no longer has to happen at read time.",
      fig: stepsFig,
      a: ["s1", "s2", "s3"],
      why: "The merging was done earlier, at post time. At read time the app only has to show the first page of the ready-made cache, which is step 4. This is the trade: slower posting for much faster reading.",
    },
  ]);

  /* ================= ds-scaling ================= */

  const serialFig = (() => {
    let s = tx(10, 14, "A job takes 100 minutes on one machine", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      rc(10, 28, 100, 36, { rx: 6, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
      tx(60, 51, "20 min", { c: "#fff" }) +
      tx(60, 82, "must run in one piece", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(110, 28, 400, 36, { rx: 6, f: "var(--blue)", s: "var(--blue)", sw: 1 }) +
      tx(310, 51, "80 min", { c: "#fff" }) +
      tx(310, 82, "splits across as many machines as you like", { s: 12, c: "var(--text-dim)" });
    return svg(530, 96, s);
  })();

  const shardTable = table(
    ["Sharding key", "Node 1", "Node 2", "Node 3", "Node 4"],
    [
      ["Country", "55%", "25%", "12%", "8%"],
      ["Hash of the user id", "26%", "25%", "25%", "24%"],
      ["Month the user signed up", "4%", "6%", "10%", "80%"],
    ],
  );

  const queryFig = (() => {
    const n = [
      ["n1", "Exeter, Bath"],
      ["n2", "Leeds, York"],
      ["n3", "Cardiff, Swansea"],
      ["n4", "Glasgow, Perth"],
    ];
    let s =
      rc(110, 8, 340, 32, { s: "var(--violet)" }) + tx(280, 29, "Query: all customers in Exeter and Leeds", { s: 12 });
    n.forEach(
      ([id, c], i) => (s += pk(id, box2(8 + i * 138, 76, 126, 56, "Node " + (i + 1), c, { s: "var(--blue)" }))),
    );
    return svg(560, 144, s);
  })();

  B.add("ds-scaling", [
    {
      type: "slider",
      q: "Even with unlimited machines, roughly how many times faster than a single machine can this job get?",
      fig: serialFig,
      min: 1,
      max: 20,
      step: 1,
      ans: 5,
      tol: 1,
      unit: "×",
      hint: "With endless machines the 80 minutes shrink to almost nothing. What is left?",
      why: "The 20-minute part cannot be split, so the best possible time is just over 20 minutes: 100 ÷ 20 = 5 times faster. With 10 machines it takes 20 + 8 = 28 minutes. Scaling out helps only the part of the work that can be shared.",
    },
    {
      type: "mcq",
      q: "Which sharding key spreads the work evenly across the four nodes?",
      fig: shardTable,
      o: [
        "Hash of the user id, with every node near 25%",
        "Country, because users in one place stay together",
        "Sign-up month, because it is easy to explain",
        "Any of them: the key never changes the load",
      ],
      a: 0,
      why: "A hash scatters users almost evenly, so every node carries about a quarter. Country makes Node 1 a hot spot. Sign-up month sends nearly all new activity to one node. A shard that carries most of the load defeats scaling out.",
    },
    {
      type: "order",
      q: "A shop's single web server keeps baskets in its own memory. Put the steps in order for scaling out safely.",
      items: [
        "Move baskets out of server memory into a shared store",
        "Put a load balancer in front of the server",
        "Start a second identical server behind the balancer",
        "Switch one server off while users browse, to prove nothing is lost",
        "Add more servers as demand grows",
      ],
      why: "A second server only helps if either one can serve any user. So state moves out first. Then add the balancer and the copy, test by removing one, and only then grow.",
    },
    {
      type: "match",
      q: "Match each consequence to the architecture it describes.",
      pairs: [
        ["Upgrading means buying a bigger, much pricier single machine", "Shared memory"],
        ["All the nodes queue up at one common storage unit", "Shared disk"],
        ["Each node adds its own capacity, but data must be split between them", "Shared nothing"],
      ],
      why: "Shared memory is one big machine (scaling up). Shared disk puts many machines on one storage array, which becomes the bottleneck. Shared nothing scales out best, at the cost of splitting the data.",
    },
    {
      type: "bug",
      q: "Adding a fourth server to this setup would send most users to a different server, so their cached data is lost. Which line causes that?",
      code: [
        "servers = ['web1', 'web2', 'web3']",
        "def pick_server(user_id):",
        "    return servers[user_id % 3]",
        "# next week: add 'web4' and change the 3 to a 4",
      ],
      a: 2,
      hint: "Try user ids 0 to 11 with 3 servers, then with 4. How many land on the same server?",
      why: "Choosing by id % number-of-servers ties every user's place to the server count. Changing 3 to 4 leaves only 3 of every 12 users where they were, so 75% move. Schemes that move only a small share of data when servers are added avoid this.",
    },
    {
      type: "pick",
      q: "The data is partitioned by city, as shown. Tap every node that must be asked to answer the query.",
      fig: queryFig,
      a: ["n1", "n2"],
      why: "Exeter's customers live on Node 1 and Leeds's on Node 2. The other nodes hold nothing relevant, so they can be left alone. Choosing a partition key that matches common queries keeps a query from having to ask every node.",
    },
  ]);

  /* ================= ds-maintain ================= */

  const errBars = (() => {
    const v = [0.5, 0.6, 1, 2.5, 3.5, 6, 9],
      base = 190,
      k = 16;
    let s = tx(10, 14, "Share of requests failing, per minute", { a: "start", s: 12, c: "var(--text-dim)" });
    v.forEach((d, i) => {
      const x = 30 + i * 74,
        h = d * k;
      s += pk(
        "m" + (i + 1),
        rc(x, base - h, 54, h, { rx: 6, f: "var(--panel)", s: "var(--rose)", sw: 2 }) +
          tx(x + 27, base - h - 6, d + "%", { s: 12 }) +
          tx(x + 27, base + 17, "Min " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    s +=
      ln(20, base - 2 * k, 548, base - 2 * k, { s: "var(--amber)", d: "7 6" }) +
      tx(24, base - 2 * k - 6, "Rule: above 2% for two minutes in a row", {
        a: "start",
        s: 12,
        c: "var(--amber-ink, var(--text))",
      });
    return svg(560, 215, s);
  })();

  const debtBars = (() => {
    const A = [10, 9, 8, 6, 4, 3],
      Bv = [8, 8, 8, 8, 8, 8],
      base = 180,
      k = 14;
    let s = tx(10, 14, "Features shipped per month", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      rc(330, 4, 12, 12, { rx: 3, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
      tx(348, 15, "Team A: never tidies up", { a: "start", s: 12 });
    s +=
      rc(330, 22, 12, 12, { rx: 3, f: "var(--teal)", s: "var(--teal)", sw: 1 }) +
      tx(348, 33, "Team B: spends time tidying", { a: "start", s: 12 });
    A.forEach((a, i) => {
      const x = 30 + i * 86;
      s += pk(
        "m" + (i + 1),
        rc(x, base - a * k, 34, a * k, { rx: 5, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
          rc(x + 38, base - Bv[i] * k, 34, Bv[i] * k, { rx: 5, f: "var(--teal)", s: "var(--teal)", sw: 1 }) +
          tx(x + 17, base - a * k - 5, a, { s: 12 }) +
          tx(x + 55, base - Bv[i] * k - 5, Bv[i], { s: 12 }) +
          tx(x + 36, base + 17, "Month " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    return svg(560, 205, s);
  })();

  const costFig = (() => {
    let s = tx(10, 14, "Where a typical system's lifetime cost goes", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      rc(10, 28, 50, 36, { rx: 6, f: "var(--blue)", s: "var(--blue)", sw: 1 }) +
      tx(35, 51, "10%", { c: "#fff" }) +
      tx(35, 82, "building", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(60, 28, 450, 36, { rx: 6, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
      tx(285, 51, "90%", { c: "#fff" }) +
      tx(285, 82, "running, fixing and changing it", { s: 12, c: "var(--text-dim)" });
    return svg(530, 96, s);
  })();

  B.add("ds-maintain", [
    {
      type: "pick",
      q: "Good monitoring should page the on-call engineer. Tap the minute at which the alert rule first fires.",
      fig: errBars,
      a: "m5",
      why: "Minute 4 is above 2% but one minute is not enough. Minute 5 is the second in a row (3.5%), so the rule fires then. Waiting for two minutes avoids false alarms from blips. Minute 7's 9% is far too late, since users have been suffering for several minutes.",
    },
    {
      type: "pick",
      q: "Tap the first month in which team B ships MORE features than team A.",
      fig: debtBars,
      a: "m4",
      why: "In month 3 both ship 8, a tie. In month 4 team A has dropped to 6 while B still ships 8. Skipping tidy-up looks fastest at first, but the mess slows every later change. Simpler code is what keeps a team able to evolve the system.",
    },
    {
      type: "order",
      q: "A company wants to replace its old billing module without a risky big-bang switch. Put the steps in order.",
      items: [
        "Wrap the old billing module behind a small interface",
        "Build the new module behind the same interface",
        "Send 1% of invoices to the new module and compare results",
        "Raise the share step by step while the results stay identical",
        "Retire the old module once it receives no traffic",
      ],
      why: "A clean interface lets old and new swap places. A small share of traffic proves the new module with little risk, and growing it gradually means any problem is found early. This is what evolvability buys you.",
    },
    {
      type: "slider",
      q: "Building a system costs £200 thousand. Maintenance is typically about 90% of its lifetime cost. Roughly what is the lifetime cost, in £ thousand?",
      fig: costFig,
      min: 0,
      max: 3000,
      step: 100,
      ans: 2000,
      tol: 300,
      unit: "k",
      hint: "If the build is 10% of the total, the total is 10 times the build.",
      why: "The build is only 10% of the lifetime cost, so the total is about 10 × £200k = £2 million. Most of the money is spent keeping a system running and changing it, which is why maintainability is worth designing for.",
    },
    {
      type: "match",
      q: "Match each warning sign to the practice that would fix it.",
      pairs: [
        ["A deploy takes 20 manual steps and someone always skips one", "Automate the deploy"],
        ["The same discount rule is pasted into five services", "Define it once and reuse it"],
        ["Nobody notices the queue filling until customers phone", "Add monitoring and alerts"],
        ["Swapping the payment provider means editing every service", "Hide the provider behind one interface"],
      ],
      why: "Manual steps and invisible problems are operability issues, duplication is a simplicity problem, and a change that touches everything is an evolvability problem. Each has a different fix.",
    },
  ]);
})();

/* ===== bank-w-ds-2.js ===== */
/* DS revision bank, second set of visual and varied questions, part 2.
   Lecture 2 (models, schema, graph, NoSQL) and Lecture 3 (log, hash index, SSTable).
   New angles: diagnose, predict, compare, refute. Every figure is needed; numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto"><defs><marker id="wds-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line-2)"/></marker></defs>${body}</svg>`;
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 3, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const mono = (x, y, s, o = {}) => tx(x, y, s, { m: true, s: 13, ...o });
  const arrow = (a, b, r = 19) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]),
      ux = (b[0] - a[0]) / d,
      uy = (b[1] - a[1]) / d;
    return `<line x1="${a[0] + ux * r}" y1="${a[1] + uy * r}" x2="${b[0] - ux * (r + 2)}" y2="${b[1] - uy * (r + 2)}" stroke="var(--line-2)" stroke-width="2.5" marker-end="url(#wds-arr)"/>`;
  };

  /* ================= ds-models ================= */
  const tbl = (x, title, cols) => {
    let s =
      rc(x, 8, 170, 30 + cols.length * 26 + 6, { rx: 8 }) +
      `<rect x="${x}" y="8" width="170" height="28" rx="8" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="2"/>` +
      tx(x + 85, 27, title, { a: "middle", s: 13 });
    cols.forEach((c, i) => (s += mono(x + 12, 56 + i * 26, c, { s: 12 })));
    return s;
  };
  const FIG_RECIPES = svg(
    580,
    120,
    tbl(5, "recipes", ["id", "title"]) +
      pk("ing", tbl(205, "ingredients", ["id", "name"])) +
      pk("link", tbl(405, "recipe_ingredients", ["recipe_id", "ingredient_id"])),
  );

  const FIG_CUSTOMER = svg(
    560,
    200,
    rc(6, 6, 548, 188) +
      mono(20, 28, `{ "customer": "Ola Park", "town": "York",`) +
      mono(20, 50, `  "orders": [`) +
      mono(20, 74, `    { "day": "3 May",  "item": "Socks",  "price": 4 },`) +
      mono(20, 98, `    { "day": "9 May",  "item": "Socks",  "price": 4 },`) +
      mono(20, 122, `    { "day": "21 May", "item": "Gloves", "price": 7 } ] }`) +
      tx(20, 156, "One document, stored in a collection of 2 million customers.", { s: 12, c: "var(--text-dim)" }) +
      tx(20, 176, "No fixed schema is declared for the collection.", { s: 12, c: "var(--text-dim)" }),
  );

  B.add("ds-models", [
    {
      type: "cat",
      q: "Sort each need by the data model that suits it best.",
      buckets: ["Relational tables", "Document", "Graph"],
      items: [
        ["Invoices, customers and products that many different reports join together", 0],
        ["A CV page that is always loaded as one unit, with jobs nested inside", 1],
        ['"Who do my friends know that I don\'t?"', 2],
        ["Strict rules, such as every order must point at a real customer", 0],
        ["Each product page has its own set of attributes", 1],
        ["Finding the connection between two strangers through shared contacts", 2],
      ],
      why: "Tables shine when many reports join shared records under strict rules. Documents shine when one self-contained unit is loaded whole. Graphs shine when the answer is found by following links through several hops.",
    },
    {
      type: "pick",
      q: "Each recipe uses many ingredients, and each ingredient appears in many recipes. The amount in grams belongs to one recipe-and-ingredient pair. Tap the table where a grams column should go.",
      fig: FIG_RECIPES,
      a: "link",
      why: "Grams describes the relationship, not the recipe alone (a recipe has many amounts) and not the ingredient alone (flour is used in different amounts). The link table holds one row per pair, so that is where the amount lives.",
    },
    {
      type: "multi",
      q: "This customer is stored as one document with their orders nested inside. Select all statements that are true.",
      fig: FIG_CUSTOMER,
      o: [
        "One read returns the customer's whole order history",
        "Finding every customer who bought socks is as cheap as loading one customer",
        "Renaming a product leaves the old name inside past orders",
        "A product bought twice has its details stored twice",
        "An order with an extra field is rejected until the schema changes",
      ],
      a: [0, 2, 3],
      why: "Nesting gives locality, so one read gets everything, but it copies product details into each order, and those copies do not change when the product is renamed. Searching across all customers has no shortcut. With no declared schema, an extra field is simply stored.",
    },
    {
      type: "slider",
      q: "A reading club has 30 members. Each member subscribes to 4 of the club's magazines. Members and magazines are separate tables. About how many rows does the link table hold, with one row per subscription?",
      min: 0,
      max: 300,
      step: 10,
      ans: 120,
      tol: 20,
      hint: "30 members × 4 subscriptions each: 30 + 30 + 30 + 30.",
      why: "Each subscription is one member-magazine pair, so 30 × 4 = 120 rows. The link table grows with the number of relationships, not with the number of members or magazines.",
    },
    {
      type: "match",
      q: "Match each problem to the usual fix.",
      pairs: [
        ["The same employer name is typed into thousands of rows", "Move it to its own table and refer to it by ID"],
        ["A tag labels many posts and a post has many tags", "A link table holding both IDs"],
        ["A page needs a post and its comments in one read", "Nest the comments inside the post document"],
        ["Reports must combine data from several record types", "Keep separate tables so they can be joined"],
      ],
      why: "Repeated values belong in one shared record. Many-to-many needs a link table. Data that is always fetched together can be nested for locality. Frequent cross-record reports are what joins are for.",
    },
    {
      type: "bug",
      q: "A reviewer lists claims about moving a CV site from tables to documents. One claim is wrong. Click it.",
      code: [
        "Locality: one read can return a whole CV",
        "Joins across documents are weaker, so the app may do some in code",
        "Documents guarantee that no data is ever duplicated",
        "A shared record, such as an employer, needs care once it is copied into many documents",
      ],
      a: 2,
      why: "Embedding copies data into every document that uses it, so duplication is the usual cost of the document model. The other three claims describe real benefits and costs.",
    },
  ]);

  /* ================= ds-schema ================= */
  const FIG_FIELDS = svg(
    560,
    190,
    mono(10, 20, "Field names that hold an email address, 10,000 documents", { s: 12, c: "var(--text-dim)" }) +
      [
        ["f1", "email", "9,800"],
        ["f2", "e-mail", "150"],
        ["f3", "mail", "40"],
        ["f4", "emial", "10"],
      ]
        .map(([id, n, c], i) =>
          pk(
            id,
            rc(10, 32 + i * 38, 540, 32) +
              mono(24, 54 + i * 38, `"${n}"`) +
              tx(536, 54 + i * 38, `${c} documents`, { a: "end", s: 13, c: "var(--text-dim)" }),
          ),
        )
        .join(""),
  );

  const FIG_SHAPES = svg(
    560,
    110,
    rc(10, 10, 308, 38, { st: "var(--rose)", f: "var(--rose-dim)" }) +
      tx(164, 34, 'v1: one "name" field  (40 million)', { a: "middle", s: 13 }) +
      rc(318, 10, 192, 38, { st: "var(--amber)", f: "var(--amber-dim)" }) +
      tx(414, 34, "v2: first + last  (25 M)", { a: "middle", s: 13 }) +
      rc(510, 10, 40, 38, { st: "var(--teal)", f: "var(--teal-dim)" }) +
      tx(530, 34, "v3", { a: "middle", s: 12 }) +
      tx(530, 72, "5 M", { a: "middle", s: 13, c: "var(--teal)" }) +
      ln(530, 52, 530, 62, "var(--teal)", 2) +
      tx(10, 96, "Total: 70 million user documents, none ever rewritten. v3 adds first, last and nickname.", {
        s: 12,
        c: "var(--text-dim)",
      }),
  );

  B.add("ds-schema", [
    {
      type: "cat",
      q: "For each outcome, which approach is it a sign of?",
      buckets: ["Schema-on-write", "Schema-on-read"],
      items: [
        ["A misspelt field name is quietly stored", 1],
        ["Text typed into a number column is refused at insert", 0],
        ["Reading code must cope with old and new shapes side by side", 1],
        ["Every reader can rely on each row having the same columns", 0],
        ["Data from an outside partner is saved as it arrives, whatever its shape", 1],
        ["Adding a field to existing data needs a migration step", 0],
      ],
      why: "Schema-on-write checks the shape when data goes in, so readers can trust it, but changes need migrations. Schema-on-read accepts anything and pushes the checking, the old-and-new handling and the typo risk onto the readers.",
    },
    {
      type: "pick",
      q: 'In a schema-on-read collection, the team counts which field names hold an email address. A search for exactly "email" is run. Tap every spelling that this search would miss.',
      fig: FIG_FIELDS,
      a: ["f2", "f3", "f4"],
      why: 'Nothing enforced one spelling, so three variants crept in. The search only matches the exact name "email", so it silently skips 200 documents. That is the hidden cost of schema-on-read: the reader must know every shape that ever got written.',
    },
    {
      type: "match",
      q: "Match each symptom to its most likely cause.",
      pairs: [
        ["A report shows 12% of customers with no country", "Old documents were written before the field existed"],
        ["An insert fails with a type error", "The value does not fit the declared column type"],
        [
          'Both "zip" and "postcode" appear in one collection',
          "Writers followed different conventions and nothing enforced one",
        ],
        ["A dashboard breaks after a team renames a field", "Readers still expect the old shape"],
      ],
      why: "Each symptom traces to when the structure is checked. Missing and duplicate fields point to a store that never rejected anything. A type error is the schema doing its job. A rename breaks any reader that assumed the old name.",
    },
    {
      type: "bug",
      q: 'Old user documents hold one "name" typed by people, such as "Mo Reid" or "Mary Ann Smith". This reader must never crash. Click the faulty line.',
      code: [
        "def first_name(doc):",
        '    if "first" in doc:',
        '        return doc["first"]',
        '    first, last = doc["name"].split(" ")',
        "    return first",
      ],
      a: 3,
      why: 'Unpacking into exactly two parts crashes for a name with three words (or one). With schema-on-read the reader cannot assume tidy data, so it should take just the part before the first space, for example doc["name"].split(" ")[0].',
    },
    {
      type: "mcq",
      q: "A new reader is written that understands only the v3 shape. About what share of the stored documents can it handle?",
      fig: FIG_SHAPES,
      o: ["About 7%", "About 35%", "About 60%"],
      a: 0,
      hint: "Add the three groups for the total (40 + 25 + 5 = 70 million), then compare 5 with 70.",
      why: "Only the 5 million v3 documents match, and 5 out of 70 is about 7%. The 35% and 60% choices are the v2 and v1 shares. Because old documents were never rewritten, every reader must keep handling all three shapes.",
    },
  ]);

  /* ================= ds-graph ================= */
  const FIG_BRIDGE = (() => {
    const P = { A: [60, 45], B: [60, 155], C: [170, 100], D: [320, 100], E: [430, 45], F: [430, 155] };
    const E = [
      ["A", "B"],
      ["A", "C"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["D", "F"],
      ["E", "F"],
    ];
    let s = E.map(([a, b]) => ln(P[a][0], P[a][1], P[b][0], P[b][1], "var(--line-2)", 3)).join("");
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s += pk(
          k,
          `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>` +
            tx(x, y + 5, k, { a: "middle" }),
        )),
    );
    return svg(490, 200, s);
  })();

  const FIG_ONEWAY = (() => {
    const P = { D: [50, 100], P: [150, 100], Q: [250, 55], R: [350, 100], S: [150, 175], T: [50, 175] };
    const E = [
      ["D", "P"],
      ["P", "Q"],
      ["Q", "R"],
      ["R", "P"],
      ["S", "P"],
      ["T", "S"],
    ];
    let s = E.map(([a, b]) => arrow(P[a], P[b])).join("");
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s += pk(
          k,
          `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="${k === "D" ? "var(--teal)" : "var(--blue)"}" stroke-width="3"/>` +
            tx(x, y + 5, k, { a: "middle" }),
        )),
    );
    return svg(420, 205, s + tx(405, 195, "D = depot", { a: "end", s: 12, c: "var(--text-dim)" }));
  })();

  const FIG_HOPS = table(
    ["Hops from one person", "Stored as tables (ms)", "Stored as a graph (ms)"],
    [
      ["1", "12", "8"],
      ["2", "90", "14"],
      ["3", "2,400", "20"],
    ],
  );

  B.add("ds-graph", [
    {
      type: "pick",
      q: "Lines are friendships. If one person deletes their account, the network can split into two groups that no longer connect. Tap every person whose deletion would do that.",
      fig: FIG_BRIDGE,
      a: ["C", "D"],
      why: "C is the only link between A and B on one side and the rest, and D is the only link to E and F. Remove either and the groups separate. A, B, E and F each have another route, so the rest stays connected.",
    },
    {
      type: "pick",
      q: "Arrows are one-way streets. A van starts at the depot D (green) and follows the arrows, for as many streets as it likes. Tap every other place it can reach.",
      fig: FIG_ONEWAY,
      a: ["P", "Q", "R"],
      why: "D goes to P, P to Q, Q to R. R only leads back to P. S and T point toward P but nothing points to them, so the van can never get there. Direction matters: a link in one direction does not give a path in the other.",
    },
    {
      type: "cat",
      q: "In a property graph of people and companies, is each item a vertex, an edge, or a property?",
      buckets: ["Vertex", "Edge", "Property"],
      items: [
        ["Ana", 0],
        ["Orbit Ltd", 0],
        ['"works at" between Ana and Orbit Ltd', 1],
        ['"since 2019", stored on the works-at link', 2],
        ["Ana's date of birth", 2],
        ['"is friends with" between two people', 1],
      ],
      why: "Things are vertices and relationships are edges. Facts that describe one vertex (a birth date) or one edge (when the job began) are properties on it.",
    },
    {
      type: "slider",
      q: "A friendship network has 1,000 people and each has 50 friends. Friendship is mutual and each friendship is stored as one edge. About how many edges are there?",
      min: 0,
      max: 100000,
      step: 5000,
      ans: 25000,
      tol: 5000,
      hint: "1,000 × 50 = 50,000 friend slots. Each edge uses up two of them (one at each end).",
      why: "Counting each person's friends gives 50,000, but that counts every friendship twice, once from each side. So there are 25,000 edges.",
    },
    {
      type: "mcq",
      q: "The same friend network was queried both ways. At three hops, about how many times slower is the table version than the graph version?",
      fig: FIG_HOPS,
      o: ["About 6×", "About 30×", "About 120×"],
      a: 2,
      hint: "2,400 ÷ 20: halve both to get 1,200 ÷ 10.",
      why: "2,400 ÷ 20 = 120. The table time explodes with each extra hop because every hop is another join over the whole table, while the graph just follows stored links from where it stands.",
    },
    {
      type: "bug",
      q: 'A graph database holds people and the companies they work for. The team wants to answer "who works with Ana?" by following links. Click the line that blocks this.',
      code: [
        'vertex 1: Person   {name: "Ana"}',
        'vertex 2: Company  {name: "Orbit Ltd"}',
        'vertex 3: Person   {name: "Bo", employer: "Orbit Ltd"}',
        "edge 1 -> 2: WORKS_AT   {since: 2019}",
      ],
      a: 2,
      why: "Bo's employer is stored as text inside a property, so there is no edge to follow. It should be an edge from Bo to Orbit Ltd. Then Ana to Orbit Ltd and back to Bo is a two-hop traversal.",
    },
  ]);

  /* ================= ds-nosql ================= */
  const FIG_PKEYS = table(
    ["Candidate key", "Distinct values", "Busiest value's share of writes"],
    [
      ["Country code", "40", "35%"],
      ["Plan type", "3", "80%"],
      ["Order date", "1 (today)", "100%"],
      ["Customer ID", "2,000,000", "0.01%"],
    ],
  );

  const FIG_FAMS = (() => {
    const panel = (x, y, id, inner) => pk(id, rc(x, y, 150, 120) + inner);
    let s = panel(
      6,
      6,
      "A",
      mono(18, 38, '{ "name": "Ana",', { s: 12 }) +
        mono(18, 62, '  "tags": [...],', { s: 12 }) +
        mono(18, 86, '  "town": "Hull" }', { s: 12 }),
    );
    s += panel(
      170,
      6,
      "B",
      ["u:17", "u:18", "u:19", "u:20"]
        .map(
          (k, i) =>
            mono(184, 34 + i * 25, k, { s: 12 }) +
            tx(236, 34 + i * 25, "→", { s: 12 }) +
            rc(252, 21 + i * 25, 50, 18, { rx: 4, f: "var(--bg-2)" }),
        )
        .join(""),
    );
    const cell = (x, y, t, on) =>
      rc(x, y, 28, 24, {
        rx: 3,
        f: on ? "var(--violet-dim)" : "var(--bg-2)",
        st: on ? "var(--violet)" : "var(--line)",
        sw: 1.5,
      }) + (on ? mono(x + 14, y + 16, t, { a: "middle", s: 12 }) : "");
    const rows = [
      [1, 1, 0, 0],
      [1, 0, 1, 1],
      [0, 1, 0, 0],
    ];
    s += panel(
      6,
      136,
      "C",
      rows
        .map((r, i) => r.map((on, j) => cell(20 + j * 31, 152 + i * 32, ["a", "b", "c", "d"][j], on)).join(""))
        .join(""),
    );
    s += panel(
      170,
      136,
      "D",
      ln(220, 170, 290, 192, "var(--line-2)", 2.5) +
        ln(220, 170, 230, 232, "var(--line-2)", 2.5) +
        ln(230, 232, 290, 192, "var(--line-2)", 2.5) +
        [
          [220, 170],
          [290, 192],
          [230, 232],
        ]
          .map(
            ([x, y]) =>
              `<circle cx="${x}" cy="${y}" r="12" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`,
          )
          .join(""),
    );
    return svg(326, 262, s);
  })();

  B.add("ds-nosql", [
    {
      type: "mcq",
      q: "A key-value table is split into partitions by its partition key, and each partition lives on one server. Order writes arrive all day. Using the table, which partition key spreads the writes best?",
      fig: FIG_PKEYS,
      o: ["Country code", "Plan type", "Order date", "Customer ID"],
      a: 3,
      hint: "Look for many distinct values and no value that takes a big share.",
      why: "Customer ID has millions of values and no single one takes a noticeable share, so work spreads over all servers. Today's date puts every write on one partition. Plan type and country code leave one value with most or a third of the traffic.",
    },
    {
      type: "cat",
      q: "Which NoSQL family fits each job best?",
      buckets: ["Document", "Key-value", "Wide-column", "Graph"],
      items: [
        ["Look up a login session by its token", 1],
        ["Product pages where each item has its own attributes", 0],
        ["Suggest people two links away from you", 3],
        ["Rows that each carry their own mix of columns", 2],
        ["A blog post stored with nested comments, loaded as one unit", 0],
        ["A shopping basket fetched by user ID, never searched by contents", 1],
      ],
      why: "Key-value suits fetch-by-key. Documents suit self-contained nested items with varying fields. Wide-column rows may differ in their columns. Graphs suit following links across several hops.",
    },
    {
      type: "order",
      q: "A DynamoDB-style table has a partition key and a sort key. Put these steps in the order a lookup follows.",
      items: [
        "Take the partition key value from the request",
        "Use it to choose the partition, and so the server",
        "Within that partition, jump to the right sort key",
        "Read the item stored there",
      ],
      why: "The partition key decides where the data lives. Inside that partition, items are ordered by sort key, which gives the exact position or range.",
    },
    {
      type: "bug",
      q: "A team uses a plain key-value store for baskets. Click the line that the store is badly suited to, because it cannot find items by what is inside them.",
      code: [
        'store.set("basket:42", basket_a)',
        'store.set("basket:43", basket_b)',
        'mine = store.get("basket:42")',
        "big = [b for b in store.all() if b.total > 50]",
      ],
      a: 3,
      why: "Get and set by key are what the store does well. Asking for every basket with a total above 50 has no key to jump to, so it must read every value. A document store could be indexed on that field.",
    },
    {
      type: "match",
      q: "Match each worry to the NoSQL aim that addresses it.",
      pairs: [
        ["Traffic on a sale day is 20 times normal", "Scale out by adding machines"],
        ["Each product has different fields", "A flexible schema per item"],
        ["One data centre loses power but the site must keep answering", "Availability from copies on other machines"],
        ["A new hire must understand the design in a day", "Simplicity of design"],
      ],
      why: "NoSQL stores stress simple design, horizontal scaling and availability. Per-item schemas are one of the ways they stay flexible and easy to adopt.",
    },
    {
      type: "pick",
      q: "Four sample stores are drawn. Tap the wide-column store: table-like rows where each row has its own set of columns.",
      fig: FIG_FAMS,
      a: "C",
      why: "Panel C is the table with rows that fill different columns. A is a document with nested values, B is key-value (an opaque value behind each key) and D is a graph of vertices and edges.",
    },
  ]);

  /* ================= ds-log ================= */
  const FIG_SEQ = table(
    ["Task: store 100,000 records of 100 bytes", "Time on the same disk"],
    [
      ["Append each record to the end of one file", "0.1 s"],
      ["Overwrite each record in place at scattered positions", "12 s"],
    ],
  );

  const FIG_LOGH = (() => {
    const recs = ["bal = 100", "rent = 500", "bal = 80", "bal = 95", "rent = 520", "bal = 60"];
    let s = tx(8, 16, "log file, oldest first", { s: 12, c: "var(--text-dim)" });
    recs.forEach(
      (r, i) =>
        (s += pk(
          "r" + (i + 1),
          rc(8 + (i % 3) * 112, 26 + Math.floor(i / 3) * 56, 106, 48) +
            tx(61 + (i % 3) * 112, 44 + Math.floor(i / 3) * 56, "#" + (i + 1), {
              a: "middle",
              s: 11,
              c: "var(--text-faint)",
            }) +
            mono(61 + (i % 3) * 112, 63 + Math.floor(i / 3) * 56, r, { a: "middle", s: 13 }),
        )),
    );
    return svg(346, 140, s);
  })();

  const FIG_LOGT = (() => {
    const recs = [
      ["a", "5"],
      ["b", "7"],
      ["a", "9"],
      ["b", "✕ deleted"],
      ["c", "1"],
    ];
    let s = "";
    recs.forEach(([k, v], i) => {
      const x = 8 + (i % 3) * 116,
        y = 8 + Math.floor(i / 3) * 56,
        dl = v[0] === "✕";
      s +=
        rc(x, y, 110, 48, { st: dl ? "var(--rose)" : "var(--line-2)", f: dl ? "var(--rose-dim)" : "var(--panel)" }) +
        tx(x + 55, y + 18, "#" + (i + 1), { a: "middle", s: 11, c: "var(--text-faint)" }) +
        mono(x + 55, y + 38, dl ? `${k}: deleted` : `${k} = ${v}`, { a: "middle", s: 13 });
    });
    return svg(356, 120, s);
  })();

  B.add("ds-log", [
    {
      type: "mcq",
      q: "Same disk, same records. What mostly explains the gap in the table?",
      fig: FIG_SEQ,
      o: [
        "Appends carry on where the last one ended, but scattered writes make the disk jump",
        "Appended records are smaller than overwritten ones, so less data is written overall",
        "Appends wait in memory until the whole batch is ready, then reach the disk once",
        "Log files are kept in a faster part of the disk than ordinary data files are",
      ],
      a: 0,
      why: "The gap is about 120 times (12 s ÷ 0.1 s). Appending is sequential, so there is no seeking. Overwriting scattered places forces the disk to move for every record. That is why databases like append-only logs for writes.",
    },
    {
      type: "match",
      q: "Match each property of an append-only log to the reason behind it.",
      pairs: [
        ["Writes are fast", "Every record goes straight onto the end, with no seeking"],
        ["Recovery after a crash is simple", "Earlier records are never overwritten, so they stay intact"],
        ["Reads without an index are slow", "The only way to find a key is to scan the records"],
        ["The file keeps growing", "Old values and deleted keys are never removed in place"],
      ],
      why: 'All four follow from "only ever add to the end": cheap writes and safe history on one side, scans and growth on the other.',
    },
    {
      type: "pick",
      q: "Every record is kept. What was the value of bal immediately before record #4 was appended? Tap the record that tells you.",
      fig: FIG_LOGH,
      a: "r3",
      why: 'The newest bal before #4 is #3 (bal = 80). Record #4 itself is the value after, and #1 is older but was already replaced. A log keeps history, so "as it was then" is a scan that stops earlier.',
    },
    {
      type: "slider",
      q: "Appending to a log runs at 200 MB per second. Each record is 100 bytes. About how many million records can be written per second?",
      min: 0,
      max: 5,
      step: 0.5,
      ans: 2,
      tol: 0.5,
      unit: " million",
      hint: "1 MB holds 10,000 records of 100 bytes. So 200 MB holds 200 × 10,000.",
      why: "200 MB × 10,000 records per MB = 2,000,000 records a second. Sequential appends are fast enough that the disk is rarely the limit.",
    },
    {
      type: "bug",
      q: "This delete() edits the file in place instead of using the log's one rule: only ever append. Click the line that breaks that rule.",
      code: [
        "def delete(key):",
        '    lines = open("db.log").read().splitlines()',
        '    keep = [x for x in lines if not x.startswith(key + ",")]',
        '    open("db.log", "w").write("\\n".join(keep))',
      ],
      a: 3,
      why: "Reopening the file in write mode wipes it and rewrites everything. A crash halfway loses the whole log, and history is gone. The log way is to append a tombstone record for the key.",
    },
    {
      type: "multi",
      q: "Read this log. Select all statements that are true.",
      fig: FIG_LOGT,
      o: [
        "Scanning from the newest end finds a's current value after reading three records",
        "Scanning from the oldest end can stop at record #1 and answer for a",
        "b reads as deleted, even though record #2 still holds a value for it",
        "Record #3 erased record #1 from the file",
      ],
      a: [0, 2],
      why: "From the newest end the order is #5, #4, #3, and #3 gives a = 9. Scanning from the oldest end cannot stop early, because later records may override. The tombstone in #4 hides #2. Nothing is erased: #3 only supersedes #1.",
    },
  ]);

  /* ================= ds-hashidx ================= */
  const FIG_TOMB = (() => {
    const seg = (y, label, recs, dim) =>
      tx(8, y + 14, label, { s: 12, c: "var(--text-dim)" }) +
      recs
        .map(
          ([t, bad], i) =>
            rc(8 + i * 140, y + 20, 130, 34, {
              st: bad ? "var(--rose)" : "var(--line-2)",
              f: bad ? "var(--rose-dim)" : "var(--panel)",
              d: dim ? "5 4" : "",
            }) + mono(73 + i * 140, y + 42, t, { a: "middle", s: 13 }),
        )
        .join("");
    return svg(
      290,
      262,
      seg(2, "S1 (oldest, not merged)", [["k = 4"], ["m = 2"]], true) +
        seg(60, "S2 (to be merged)", [["m = 8"], ["n = 1"]]) +
        seg(118, "S3 (to be merged)", [["k: deleted", 1], ["p = 3"]]) +
        tx(8, 198, "Compaction merges only S2 and S3", { s: 12, c: "var(--text-dim)" }) +
        tx(8, 216, "into a new segment. S1 stays as it is.", { s: 12, c: "var(--text-dim)" }),
    );
  })();

  const FIG_IDXSIZE = table(
    ["Store", "Distinct keys", "Typical value size", "Updates a day"],
    [
      ["Photos", "2 million", "1 MB", "10 thousand"],
      ["Clicks", "500 million", "20 bytes", "2 million"],
      ["Profiles", "10 million", "100 KB", "50 million"],
    ],
  );

  const FIG_STALE = (() => {
    const rows = [
      ["ia", "a", "S1 @0"],
      ["ib", "b", "S2 @0"],
      ["ic", "c", "S1 @40"],
    ];
    let s = tx(8, 14, "in-memory index", { s: 12, c: "var(--text-dim)" });
    rows.forEach(([id, k, t], i) => (s += pk(id, rc(8, 22 + i * 44, 160, 36) + mono(20, 46 + i * 44, `${k} → ${t}`))));
    s += tx(196, 14, "segments on disk", { s: 12, c: "var(--text-dim)" });
    const rec = (x, y, t) => rc(x, y, 76, 30, { rx: 6 }) + mono(x + 38, y + 20, t, { a: "middle", s: 12 });
    s += tx(196, 38, "S1 (older)", { s: 12 }) + rec(196, 44, "a=1 @0") + rec(280, 44, "c=5 @40");
    s += tx(196, 100, "S2 (newer)", { s: 12 }) + rec(196, 106, "b=2 @0") + rec(280, 106, "c=9 @40");
    return svg(364, 160, s);
  })();

  B.add("ds-hashidx", [
    {
      type: "mcq",
      q: "Compaction is about to merge S2 and S3 into one new segment. Key k has a tombstone in S3. What should the merged segment do with it?",
      fig: FIG_TOMB,
      o: [
        "Keep it: S1 still holds k = 4, which would otherwise come back",
        "Drop it: compaction removes any key whose newest record is a deletion",
        "Drop it: the in-memory index forgets k, so the files no longer matter",
      ],
      a: 0,
      why: "S1 is not part of this merge, so an older k = 4 still sits there. If the tombstone vanished, a read (or an index rebuilt after a restart) would find 4. The tombstone can only go when no older segment holds the key. The index is rebuilt from the files, so it cannot be relied on.",
    },
    {
      type: "bug",
      q: "A hash-indexed log deletes a key like this. The server restarts and rebuilds its index by replaying the log. Click the line that lets the deleted key come back.",
      code: ["def delete(key):", "    if key in index:", "        del index[key]", "    return True"],
      a: 2,
      why: "Only the in-memory index forgets the key. The log still holds its old value and no tombstone, so the replay after a restart finds it again. The delete must also append a tombstone record.",
    },
    {
      type: "match",
      q: "Match each design change to its main consequence.",
      pairs: [
        ["Make segments much smaller", "More files to check, and compaction runs more often"],
        ["Keep the hash index on disk instead of memory", "Every lookup pays an extra disk read"],
        ["Ask for every key between two values", "No shortcut: a hash gives no order"],
        ["Let one key be rewritten millions of times", "Index stays small, but the log grows until compaction"],
      ],
      why: "The hash index trades memory for one-jump reads. Moving it to disk loses that speed, and hashing scatters keys so ranges cannot use it. Rewrites cost disk space, not index space, until compaction cleans up.",
    },
    {
      type: "mcq",
      q: "Which store needs the most memory for its hash index?",
      fig: FIG_IDXSIZE,
      o: ["Photos", "Clicks", "Profiles"],
      a: 1,
      hint: "The index holds one small entry per key. Does value size or update count change that?",
      why: "The index has one entry per distinct key, whatever the value size or how often it changes. Clicks has 500 million keys, far more than the others. Photos has the biggest values and Profiles the most updates, but neither adds index entries.",
    },
    {
      type: "slider",
      q: "After a crash, the server rebuilds its hash index by reading all its segments, 20 GB in total, at 400 MB per second. About how many seconds does the rebuild take?",
      min: 0,
      max: 120,
      step: 10,
      ans: 50,
      tol: 15,
      unit: " s",
      hint: "20 GB is 20,000 MB. How many lots of 400 fit in 20,000? Try 20,000 ÷ 400 = 200 ÷ 4.",
      why: "20,000 MB ÷ 400 MB/s = 50 s. The index lives in memory, so every restart has to scan the files again. That is a real cost of a hash index and why some stores save snapshots of it.",
    },
    {
      type: "pick",
      q: "A get for c returns 5, but c was updated later. Tap the index entry that is out of date.",
      fig: FIG_STALE,
      a: "ic",
      why: "c = 9 sits in the newer segment S2, but the index still points at the old copy in S1. On every write the index must be updated to the newest offset. Entries a and b point at their only records.",
    },
  ]);

  /* ================= ds-sstable ================= */
  const KEYS = ["b", "c", "e", "g", "h", "j", "m", "n", "p", "q", "s", "t"];
  const FIG_SPARSE = (() => {
    let s = tx(8, 16, "sparse index (every 4th key)", { s: 12, c: "var(--text-dim)" });
    [
      ["ib", "b", 0],
      ["ih", "h", 4],
      ["ip", "p", 8],
    ].forEach(
      ([id, k, i], j) =>
        (s += pk(id, rc(8 + j * 100, 24, 92, 34) + mono(54 + j * 100, 46, `${k} → #${i}`, { a: "middle" }))),
    );
    s += tx(8, 90, "sorted segment on disk", { s: 12, c: "var(--text-dim)" });
    KEYS.forEach((k, i) => {
      const x = 8 + (i % 6) * 52,
        y = 98 + Math.floor(i / 6) * 58;
      s +=
        rc(x, y, 46, 34, { rx: 6 }) +
        mono(x + 23, y + 22, k, { a: "middle" }) +
        tx(x + 23, y + 48, "#" + i, { a: "middle", s: 10, c: "var(--text-faint)" });
    });
    return svg(320, 216, s);
  })();

  const FIG_RANGE = (() => {
    const ks = ["a", "c", "d", "e", "f", "h", "k", "m"];
    let s = tx(8, 16, "one sorted segment", { s: 12, c: "var(--text-dim)" });
    ks.forEach(
      (k, i) =>
        (s += pk(
          "k" + k,
          rc(8 + (i % 4) * 70, 26 + Math.floor(i / 4) * 52, 64, 42) +
            mono(40 + (i % 4) * 70, 53 + Math.floor(i / 4) * 52, k, { a: "middle", s: 15 }),
        )),
    );
    return svg(296, 134, s);
  })();

  B.add("ds-sstable", [
    {
      type: "pick",
      q: "A read for key n uses the sparse index to decide where to start scanning the sorted segment. Tap the index entry it jumps to.",
      fig: FIG_SPARSE,
      a: "ih",
      why: "Keys are sorted, so n must lie at or after the largest indexed key that is not past it. That is h (position 4), and a short scan h, j, m, n finds it. Entry p is already beyond n, and b would scan further than needed.",
    },
    {
      type: "bug",
      q: "Merging an old and a new sorted segment (the leftover tails are handled after the loop). When the same key is in both, the newer value must win. Click the faulty line.",
      code: [
        "while i < len(old) and j < len(new):",
        "    if old[i][0] < new[j][0]:",
        "        out.append(old[i]); i += 1",
        "    elif old[i][0] > new[j][0]:",
        "        out.append(new[j]); j += 1",
        "    else:",
        "        out.append(old[i]); i += 1; j += 1",
      ],
      a: 6,
      why: "When the keys are equal, this keeps the old record and drops the new one, so stale values survive the merge. It should append new[j]. Both pointers move on either way.",
    },
    {
      type: "pick",
      q: "A range query asks for every key from d to h inclusive. Tap the records it returns.",
      fig: FIG_RANGE,
      a: ["kd", "ke", "kf", "kh"],
      why: "Because the segment is sorted, the answer is one block: find d, then read along until you pass h. A hash index would give no such block, since its keys are scattered.",
    },
    {
      type: "slider",
      q: "A 64 MB segment has a sparse index with one entry for each 4 KB block. About how many index entries are there, in thousands?",
      min: 0,
      max: 100,
      step: 2,
      ans: 16,
      tol: 3,
      unit: " thousand",
      hint: "64 MB is about 64,000 KB. How many 4 KB blocks is that? 64,000 ÷ 4.",
      why: "64,000 KB ÷ 4 KB = 16,000 entries. The index stays small because it covers blocks, not every key; a scan inside one block finds the record.",
    },
    {
      type: "match",
      q: "Match each event to what follows.",
      pairs: [
        ["The memtable fills up", "It is written out as a new sorted SSTable"],
        ["Many small SSTables pile up", "Reads check more files, so they are merged"],
        ["A key is in no segment at all", "The read checks every place before saying not found"],
        ["The newest segment holds a tombstone for the key", "The read stops there and reports not found"],
      ],
      why: "Reads go newest to oldest, so a newer tombstone settles the answer at once. A missing key is the worst case, because every file must be ruled out. Merging keeps that number of files small.",
    },
    {
      type: "mcq",
      q: "Why does the memtable keep its keys in a sorted tree instead of a plain hash map?",
      o: [
        "A flush can then write sorted keys to a new file in one pass",
        "A read can skip the SSTables and answer from memory every time",
        "Deleted keys vanish from memory without needing tombstones",
        "It uses less memory than a hash map could ever manage",
      ],
      a: 0,
      why: "An SSTable must be sorted. If the memtable already holds keys in order, a flush is just a sequential walk of the tree. A hash map would need a full sort first. The tree changes neither read coverage, tombstones nor memory use.",
    },
  ]);
})();

/* ===== bank-x-ds-1.js ===== */
/* Revision bank, third set of varied, visual questions (ds-1).
   Modules: the three workshops (ds-ops, ds-querylab, ds-engine) and the seven regular sessions.
   Every question stands on its own: the figure (or the question text) carries the data it needs.
   Numbers checked with node. Each figure kind is used once per module. */
(function () {
  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 12}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" ${o.fo != null ? `fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const ci = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" ${o.fo != null ? `fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}"/>`;
  /* a transparent overlay that makes a region tappable (the highlight is its outline) */
  const hit = (id, x, y, w, h, rx = 8) =>
    `<rect data-pick="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="transparent" stroke="none" style="cursor:pointer"/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const arrow = (x1, y1, x2, y2, o = {}) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      c = o.s || "var(--text-dim)",
      k = 8;
    const p = [
      [x2, y2],
      [x2 - k * Math.cos(a - 0.45), y2 - k * Math.sin(a - 0.45)],
      [x2 - k * Math.cos(a + 0.45), y2 - k * Math.sin(a + 0.45)],
    ]
      .map((q) => q.join(","))
      .join(" ");
    return (
      ln(x1, y1, x2 - 3 * Math.cos(a), y2 - 3 * Math.sin(a), { s: c, sw: o.sw || 2.5, d: o.d }) +
      `<polygon points="${p}" fill="${c}"/>`
    );
  };
  const xm = (x, y, r, c = "var(--rose)") =>
    ln(x - r, y - r, x + r, y + r, { s: c, sw: 3.5 }) + ln(x - r, y + r, x + r, y - r, { s: c, sw: 3.5 });
  const table = (head, rows) =>
    `<table class="t"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const chipH = (t, c) =>
    `<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 9px;border:2px solid ${c || "var(--line-2)"};border-radius:10px;font:800 12px var(--sans);background:var(--panel)">${t}</span>`;

  /* =====================================================================
     1.W  ds-ops
     ===================================================================== */

  // heat grid: how busy each server is NOW, by fleet size and traffic
  const opsHeat = (() => {
    const loads = [150, 250, 350, 450],
      ns = [3, 4, 5, 6, 7],
      x0 = 86,
      y0 = 40,
      cw = 68,
      ch = 34;
    let s = tx(x0 + 2 * cw, 13, "traffic, requests per second", { c: "var(--text-dim)" });
    loads.forEach((l, j) => (s += tx(x0 + j * cw + cw / 2, 33, l)));
    ns.forEach((n, i) => {
      s += tx(x0 - 10, y0 + i * ch + ch / 2 + 4, `${n} servers`, { a: "end" });
      loads.forEach((l, j) => {
        const p = Math.round((l / (100 * n)) * 100),
          col = p >= 100 ? "var(--rose)" : p >= 85 ? "var(--amber)" : "var(--teal)",
          op = p >= 100 ? 0.55 : p >= 85 ? 0.5 : p >= 50 ? 0.34 : 0.16;
        s +=
          rc(x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, { rx: 6, s: "var(--line)", sw: 2 }) +
          rc(x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, { rx: 6, f: col, fo: op, s: "none", sw: 0 }) +
          tx(x0 + j * cw + cw / 2, y0 + i * ch + ch / 2 + 4, p + "%");
        s += hit(`n${n}-${l}`, x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, 6);
      });
    });
    return svg(x0 + 4 * cw + 6, y0 + 5 * ch + 6, s);
  })();

  // small multiples: median vs p99 at three busy levels (model: median = 20 / (1 - 0.9 u), p99 = 3.5 x median)
  const opsPanels = (() => {
    const P = [
        ["50% busy", 36, 126],
        ["80% busy", 71, 249],
        ["95% busy", 138, 483],
      ],
      k = 0.24,
      base = 178,
      w = 140;
    let s = "";
    P.forEach(([t, m, p], i) => {
      const x = 4 + i * (w + 4);
      s += rc(x, 4, w, 206, { sw: 2, s: "var(--line)" }) + tx(x + w / 2, 24, t, { s: 13 });
      s += ln(x + 10, base, x + w - 10, base, { s: "var(--line-2)", sw: 2 });
      s +=
        ln(x + 8, base - 300 * k, x + w - 8, base - 300 * k, { s: "var(--rose)", sw: 2, d: "5 4" }) +
        tx(x + 10, base - 300 * k - 5, "goal 300", { a: "start", s: 12, c: "var(--rose-ink)" });
      s +=
        rc(x + 26, base - m * k, 34, m * k, { f: "var(--teal)", fo: 0.6, s: "var(--teal)", sw: 2, rx: 4 }) +
        tx(x + 43, base - m * k - 5, m, { s: 13 }) +
        tx(x + 43, base + 17, "median", { s: 12, c: "var(--text-dim)" });
      s +=
        rc(x + 82, base - p * k, 34, p * k, { f: "var(--blue)", fo: 0.6, s: "var(--blue)", sw: 2, rx: 4 }) +
        tx(x + 99, base - p * k + 16, p, { s: 13 }) +
        tx(x + 99, base + 17, "p99", { s: 12, c: "var(--text-dim)" });
      s += hit(`u${[50, 80, 95][i]}`, x, 4, w, 206, 10);
    });
    return svg(3 * (w + 4) + 4, 214, s);
  })();

  // Gantt: a staged rollout, one more server every 10 minutes
  const opsGantt = (() => {
    const x0 = 66,
      k = 8.5,
      t0 = [0, 10, 20, 30];
    let s = "";
    [0, 10, 20, 30, 40].forEach(
      (t) =>
        (s +=
          ln(x0 + t * k, 34, x0 + t * k, 188, { s: "var(--line)", sw: 1.5 }) +
          tx(x0 + t * k, 204, t, { s: 11, c: "var(--text-dim)" })),
    );
    s += tx(x0 + 20 * k, 222, "minutes since the rollout began", { s: 11, c: "var(--text-dim)" });
    t0.forEach((t, i) => {
      const y = 44 + i * 36;
      s += tx(x0 - 8, y + 16, `Server ${i + 1}`, { a: "end" });
      if (t)
        s +=
          rc(x0, y, t * k, 24, { f: "var(--blue)", fo: 0.3, s: "var(--blue)", sw: 2, rx: 5 }) +
          (t >= 10 ? tx(x0 + (t * k) / 2, y + 16, "v1", { s: 11 }) : "");
      s +=
        rc(x0 + t * k, y, (40 - t) * k, 24, { f: "var(--rose)", fo: 0.45, s: "var(--rose)", sw: 2, rx: 5 }) +
        tx(x0 + t * k + ((40 - t) * k) / 2, y + 16, "v2", { s: 11 });
      s += hit(`s${i + 1}`, 4, y - 5, 432, 34, 8);
    });
    s +=
      ln(x0 + 12 * k, 30, x0 + 12 * k, 190, { s: "var(--amber)", sw: 3, d: "6 4" }) +
      tx(x0 + 12 * k, 22, "alarm at minute 12", { c: "var(--amber-ink)" });
    return svg(440, 230, s);
  })();

  // rack: six servers, two down
  const opsRack = (() => {
    let s =
      rc(6, 20, 428, 96, { sw: 2.5, s: "var(--line-2)", rx: 12 }) +
      tx(220, 14, "the fleet: each server handles 100 requests per second", { c: "var(--text-dim)", s: 12 });
    for (let i = 0; i < 6; i++) {
      const x = 18 + i * 68,
        dead = i === 1 || i === 4;
      s +=
        rc(x, 34, 58, 66, {
          s: dead ? "var(--rose)" : "var(--teal)",
          f: dead ? "var(--rose)" : "var(--teal)",
          fo: 0.16,
          sw: 2.5,
          rx: 8,
        }) + tx(x + 29, 62, dead ? "down" : "100", { c: dead ? "var(--rose-ink)" : "var(--text)" });
      s += dead ? xm(x + 29, 80, 8) : tx(x + 29, 82, "req/s", { s: 11, c: "var(--text-dim)" });
    }
    return svg(440, 126, s);
  })();

  // state machine: a canary pipeline
  const opsFsm = (() => {
    const box = (x, y, w, a, b, c) =>
      rc(x, y, w, 44, { s: c, f: c, fo: 0.14, sw: 2.5, rx: 10 }) +
      tx(x + w / 2, y + 19, a) +
      tx(x + w / 2, y + 35, b, { s: 11, c: "var(--text-dim)" });
    let s = box(110, 6, 220, "v1 on all 4 servers", "everything is fine", "var(--blue)");
    s +=
      arrow(220, 50, 220, 104) + box(110, 104, 220, "canary: v2 on 1 of 4", "the other 3 stay on v1", "var(--amber)");
    s += arrow(170, 148, 100, 230) + arrow(270, 148, 340, 230);
    s +=
      box(10, 232, 180, "v2 on all 4 servers", "bug now everywhere", "var(--rose)") +
      box(250, 232, 180, "back to v1", "rolled back", "var(--teal)");
    const pill = (id, x, y, w, t) => pk(id, rc(x, y, w, 26, { sw: 2.5, rx: 13 }) + tx(x + w / 2, y + 17, t, { s: 12 }));
    s +=
      pill("deploy", 232, 66, 152, "deploy to 1 server") +
      pill("promote", 40, 176, 148, "1 min later: promote") +
      pill("rollback", 252, 176, 138, "alarm: roll back");
    return svg(440, 282, s);
  })();

  // scatter: one dot per hour, busy % against p99 (model: median = 20 / (1 - 0.9 u), p99 = 3.5 x median)
  const opsScatter = (() => {
    const X = (b) => 56 + b * 3.6,
      Y = (m) => 226 - m / 3;
    let s = ln(56, 226, 424, 226, { s: "var(--line-2)" }) + ln(56, 26, 56, 226, { s: "var(--line-2)" });
    [0, 25, 50, 75, 100].forEach((b) => (s += tx(X(b), 244, b + "%", { s: 11, c: "var(--text-dim)" })));
    [0, 200, 400, 600].forEach((m) => (s += tx(48, Y(m) + 4, m, { a: "end", s: 11, c: "var(--text-dim)" })));
    s +=
      tx(240, 262, "how busy the servers were that hour", { s: 11, c: "var(--text-dim)" }) +
      tx(14, 126, "p99 (ms)", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 14 126)" `,
      );
    s +=
      ln(56, Y(300), 424, Y(300), { s: "var(--rose)", sw: 2, d: "6 4" }) +
      tx(62, Y(300) - 6, "goal 300 ms", { a: "start", c: "var(--rose-ink)", s: 12 });
    const D = [
      [25, 91],
      [40, 520],
      [50, 126],
      [62, 158],
      [72, 200],
      [80, 249],
      [88, 336],
      [94, 455],
    ];
    D.forEach(
      ([b, m], i) =>
        (s +=
          ci(X(b), Y(m), 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)", sw: 2.5 }) +
          `<circle data-pick="h${i + 1}" cx="${X(b)}" cy="${Y(m)}" r="15" fill="transparent" stroke="none" style="cursor:pointer"/>`),
    );
    return svg(440, 270, s);
  })();

  B.add("ds-ops", [
    {
      type: "pick",
      q: "Each server handles 100 requests per second. The grid shows how busy each server is right now, with every server up. Traffic is 350 requests per second, and after ONE server dies the survivors must stay under 85% busy. Tap the smallest fleet that qualifies.",
      fig: opsHeat,
      a: "n6-350",
      hint: "After a failure, 350 is shared by one fewer server. Under 85% means under 85 req/s each.",
      why: "With 5 servers, losing one leaves 4 that share 350, so each runs at 87.5% busy, over the line. With 6 servers, losing one leaves 5 at 70% busy. The 70% shown in the grid today is the headroom you pay for, so that an ordinary fault stays a fault and never becomes a failure.",
    },
    {
      type: "pick",
      q: 'A teammate says: "The median is under 150 ms in all three cases, so Snapbox is healthy at any of these loads." The goal is a p99 under 300 ms. Tap the panel that proves them wrong.',
      fig: opsPanels,
      a: "u95",
      why: "At 95% busy the median is still only 138 ms, but p99 is 483 ms, well past the 300 ms goal. Queues build at the busiest moments, and the slowest requests suffer first, so the median can look fine while one user in a hundred is already unhappy.",
    },
    {
      type: "pick",
      q: "Version 2 of the app has a bug. It is rolled out to one more server every 10 minutes (one bar per server), and an alarm fires at minute 12. Tap every server that is running the buggy v2 at that moment.",
      fig: opsGantt,
      a: ["s1", "s2"],
      why: "Server 1 got v2 at minute 0 and server 2 at minute 10, so both are on v2 when the alarm fires. Servers 3 and 4 are still on v1, so half the fleet is untouched and can be kept as it is. Rolling out gradually turns a bad release into a small, catchable fault.",
    },
    {
      type: "slider",
      q: "Six servers handle 100 requests per second each, and two of them have died (shown). The four survivors must stay under 85% busy. Roughly what is the most traffic the service can take?",
      fig: opsRack,
      min: 0,
      max: 600,
      step: 20,
      ans: 340,
      tol: 20,
      unit: " req/s",
      hint: "Four survivors, each allowed 85 req/s.",
      why: "Four servers at 85 requests per second each is 340. Capacity you only need when something breaks is still capacity you need: planning for two failures at once costs a third of the fleet.",
    },
    {
      type: "pick",
      q: "A release pipeline runs a canary. The bug in v2 is a memory leak: a server crashes only after about 10 minutes of running it. Tap the arrow that lets this bug reach every server.",
      fig: opsFsm,
      a: "promote",
      why: "Promoting after one minute is far shorter than the time the leak needs to show itself, so the canary looks healthy and v2 goes everywhere. A canary only protects you if you watch it for longer than the bugs you fear take to appear.",
    },
    {
      type: "pick",
      q: "Each dot is one hour of Snapbox traffic. For this system p99 climbs steadily as the servers get busier. Tap the hour where something other than load is the problem.",
      fig: opsScatter,
      a: "h2",
      why: "The hour at 40% busy has a p99 of about 520 ms, far above the other hours with similar load. Busy servers explain the two right-hand dots, but not this one. Look for a bad release, a failing disk or a slow dependency.",
    },
    {
      type: "bug",
      q: "The team wants a warning BEFORE users get slow responses. Which line makes the warning fire too late?",
      code: ["goal_p99_ms: 300", "alert_busy_over_pct: 100", "rollout: one_server_first", "keep_spare_servers: 1"],
      a: 1,
      why: "In the ops room, p99 passes 300 ms at roughly 85% busy, and at 100% busy it is about 700 ms with timeouts close behind. An alert at 100% only fires once users are already suffering. Alert at around 80%.",
    },
    {
      type: "match",
      q: "Match each dashboard reading in the ops room to the most likely cause.",
      pairs: [
        ["Every server climbs to 95% busy and p99 rises with them", "Too little capacity for the traffic"],
        ["One server shows 0% busy while the others run hot", "A server has died or been pulled out"],
        ["All servers crash minutes after a deploy", "A correlated software fault"],
        ["Only the server with the new version shows errors", "A canary catching a bad release"],
      ],
      why: "Shared load shows up on every server at once. A silent server means it is gone. A crash on every machine right after a deploy is the same bug on the same code. Errors confined to one server running new code are exactly what a canary is for.",
    },
  ]);

  /* =====================================================================
     2.W  ds-querylab
     ===================================================================== */

  // Venn: who lives in York, who works at Acme (everyone else outside both)
  const qlVenn = (() => {
    const chip = (id, x, y, t) => pk(id, rc(x - 21, y - 14, 42, 28, { rx: 14, sw: 2.5 }) + tx(x, y + 5, t, { s: 13 }));
    let s =
      rc(4, 28, 372, 206, { sw: 2, s: "var(--line)", rx: 12 }) +
      tx(14, 46, "everyone", { a: "start", c: "var(--text-dim)", s: 12 });
    s +=
      ci(130, 130, 80, { f: "var(--blue)", fo: 0.16, s: "var(--blue)" }) +
      ci(240, 130, 80, { f: "var(--amber)", fo: 0.16, s: "var(--amber)" });
    s +=
      tx(110, 20, "lives in York", { s: 13, c: "var(--blue-ink)" }) +
      tx(270, 20, "works at Acme", { s: 13, c: "var(--amber-ink)" });
    s +=
      chip("dee", 90, 130, "Dee") +
      chip("cy", 185, 130, "Cy") +
      chip("ana", 268, 100, "Ana") +
      chip("eli", 268, 160, "Eli") +
      chip("ben", 340, 208, "Ben");
    return svg(380, 240, s);
  })();

  // graph: friendships, hop by hop from Ana
  const qlGraph = (() => {
    const P = { Ana: [48, 100], Ben: [150, 42], Cy: [150, 158], Dee: [270, 42], Eli: [270, 158], Fay: [392, 42] };
    const E = [
      ["Ana", "Ben"],
      ["Ana", "Cy"],
      ["Ben", "Dee"],
      ["Cy", "Dee"],
      ["Cy", "Eli"],
      ["Dee", "Fay"],
    ];
    let s = E.map(([a, b]) => ln(...P[a], ...P[b], { s: "var(--line-2)", sw: 3 })).join("");
    Object.entries(P).forEach(([n, [x, y]]) => {
      s +=
        n === "Ana"
          ? ci(x, y, 24, { f: "var(--violet)", fo: 0.3, s: "var(--violet)" }) + tx(x, y + 4, n)
          : ci(x, y, 24) + tx(x, y + 4, n);
      if (n !== "Ana")
        s += `<circle data-pick="${n.toLowerCase()}" cx="${x}" cy="${y}" r="27" fill="transparent" stroke="none" style="cursor:pointer"/>`;
    });
    s += tx(48, 140, "start", { s: 11, c: "var(--violet-ink)" });
    return svg(440, 200, s);
  })();

  // two pipelines as block chains, with the five-person chain underneath
  const qlPipes = (() => {
    const blk = (x, y, w, t, c) =>
      rc(x, y, w, 30, { s: c, f: c, fo: 0.15, sw: 2.5, rx: 8 }) + tx(x + w / 2, y + 19, t, { s: 11 });
    const row = (y, lbl, start, n) => {
      let r = tx(6, y + 20, lbl, { a: "start", s: 14 }) + blk(24, y, 92, start, "var(--violet)");
      let x = 116;
      for (let i = 0; i < n; i++) {
        r += tx(x + 7, y + 20, "▸", { c: "var(--text-dim)" }) + blk(x + 14, y, 84, "Go to friends", "var(--amber)");
        x += 98;
      }
      return r;
    };
    let s = row(8, "A", "Start: Ana", 3) + row(52, "B", "Start: everyone", 1);
    const P = ["Ana", "Ben", "Cy", "Dee", "Eli"];
    P.forEach((n, i) => {
      const x = 50 + i * 76;
      if (i) s += ln(x - 54, 118, x - 22, 118, { sw: 3 });
      s += ci(x, 118, 22) + tx(x, 123, n, { s: 12.5 });
    });
    s += tx(210, 160, "the five people, friends in a chain", { c: "var(--text-dim)", s: 12 });
    return svg(420, 168, s);
  })();

  // documents: five JSON-like cards
  const qlDocs = (() => {
    const D = [
      ["Ana", ["Ben"]],
      ["Ben", ["Ana", "Cy"]],
      ["Cy", ["Ben", "Dee"]],
      ["Dee", ["Cy", "Eli"]],
      ["Eli", ["Dee"]],
    ];
    let s = "";
    D.forEach(([n, f], i) => {
      const y = 6 + i * 46;
      s +=
        rc(6, y, 428, 38, { sw: 2.5, rx: 8 }) +
        tx(20, y + 24, `{ "name": "${n}", "friends": [${f.map((x) => `"${x}"`).join(", ")}] }`, { a: "start", s: 15 });
      s += hit(n.toLowerCase(), 6, y, 428, 38, 8);
    });
    return svg(440, 238, s);
  })();

  // tree: how far a friendship search fans out
  const qlTree = (() => {
    let s = "";
    const lvl = [
      ["hop 0", 28],
      ["hop 1", 92],
      ["hop 2", 156],
      ["hop 3", 220],
    ];
    lvl.forEach(([t, y]) => (s += tx(8, y + 4, t, { a: "start", c: "var(--text-dim)", s: 12 })));
    s += ci(240, 28, 18, { f: "var(--violet)", fo: 0.3, s: "var(--violet)" }) + tx(240, 32, "Ana", { s: 11 });
    const x1 = [130, 240, 350];
    x1.forEach((x) => {
      s += ln(240, 46, x, 78) + ci(x, 92, 14);
    });
    const x2 = [];
    x1.forEach((x) => [-36, 0, 36].forEach((d) => x2.push(x + d)));
    x2.forEach((x, i) => {
      s += ln(x1[Math.floor(i / 3)], 106, x, 144) + ci(x, 156, 9);
    });
    x2.forEach((x) => [-9, 9].forEach((d) => (s += ln(x, 165, x + d, 205, { sw: 1.5, s: "var(--line)" }))));
    s +=
      tx(300, 124, "× 100", { c: "var(--amber-ink)", a: "start", s: 13 }) +
      tx(398, 150, "× 100", { c: "var(--amber-ink)", a: "start", s: 13 }) +
      tx(418, 214, "× 100", { c: "var(--amber-ink)", a: "end", s: 13 });
    s += tx(432, 20, "each person has 100 friends, none shared", { c: "var(--text-dim)", s: 12, a: "end" });
    return svg(440, 236, s);
  })();

  // table plus two pipelines
  const qlTable = `${table(
    ["name", "city", "works at", "friends with"],
    [
      ["Ana", "Leeds", "Acme", "Ben"],
      ["Ben", "Leeds", "<b>Bolt</b>", "Ana, Cy"],
      ["Cy", "York", "Acme", "Ben, Dee"],
      ["Dee", "York", "<b>Bolt</b>", "Cy, Eli"],
      ["Eli", "Hull", "Acme", "Dee"],
    ],
  )}
    <div style="margin-top:10px;font:800 12px var(--sans);color:var(--text-dim)">Pipeline X</div>${chipH("Start: Ana", "var(--violet)")}${chipH("▸", "transparent")}${chipH("Works at Bolt", "var(--blue)")}${chipH("▸", "transparent")}${chipH("Go to friends", "var(--amber)")}
    <div style="margin-top:8px;font:800 12px var(--sans);color:var(--text-dim)">Pipeline Y</div>${chipH("Start: Ana", "var(--violet)")}${chipH("▸", "transparent")}${chipH("Go to friends", "var(--amber)")}${chipH("▸", "transparent")}${chipH("Works at Bolt", "var(--blue)")}`;

  B.add("ds-querylab", [
    {
      type: "pick",
      q: "The Venn diagram shows who lives in York and who works at Acme. A query starts with everyone, then chains <b>Works at Acme</b> followed by <b>City is York</b>. Tap everyone the FIRST filter throws out.",
      fig: qlVenn,
      a: ["ben", "dee"],
      why: "The first filter keeps only the Acme circle, so Ben and Dee, who are outside it, go. The second filter then removes Ana and Eli, leaving Cy. In the other order the filters remove different people at each step but the final answer is the same, because chained filters are an intersection.",
    },
    {
      type: "pick",
      q: "Friendships are shown as lines. Start at Ana and press <b>Go to friends</b> twice. A hop only adds people not already reached. Tap everyone who first appears on the SECOND hop.",
      fig: qlGraph,
      a: ["dee", "eli"],
      why: "Hop 1 reaches Ben and Cy. Hop 2 reaches Dee, through either of them, and Eli through Cy. Ana is already known and Dee is added only once even though two paths lead to her. Fay would only appear on hop 3.",
    },
    {
      type: "cat",
      q: "Five people are friends in a chain (Ana, Ben, Cy, Dee, Eli). A hop costs a self-join in tables, one document fetch for every person you start the hop from, and one edge hop in the graph. Which query is larger on each cost?",
      fig: qlPipes,
      buckets: ["Query A is larger", "Query B is larger"],
      items: [
        ["Self-joins on the friendships table", 0],
        ["Extra documents fetched by your code", 1],
        ["Edge hops followed in the graph", 0],
        ["People a document hop starts from", 1],
      ],
      hint: "Query B starts a single hop from all five people at once.",
      why: "Query A makes 3 hops, so 3 joins and 3 graph hops, but each hop starts from just one person, 3 fetches in total. Query B makes 1 hop from all 5 people, so only 1 join but 5 fetches. Documents pay per person you expand, tables per hop you write.",
    },
    {
      type: "pick",
      q: "Each person is stored as a document that lists their friends. Ben and Cy stop being friends. Tap every document the application must change.",
      fig: qlDocs,
      a: ["ben", "cy"],
      why: "Each friendship is stored twice, once in each person's list, so ending one friendship means editing two documents, and forgetting one leaves them disagreeing. In a table it is one row to delete and in a graph one edge.",
    },
    {
      type: "bug",
      q: "Five people are friends in a chain: Ana, Ben, Cy, Dee, Eli. Ana, Cy and Eli work at Acme. A hop adds only people not reached before. This trace of a query has one wrong step. Which line?",
      code: [
        "Start: Ana  ->  {Ana}",
        "Go to friends  ->  {Ben}",
        "Go to friends  ->  {Ana, Cy}",
        "Works at Acme  ->  {Ana, Cy}",
      ],
      a: 2,
      why: "On the second hop Ana is already reached, so only Cy is new and the result is {Cy}. The Acme filter then correctly keeps Cy. The error in line 3 spreads into line 4, which looks right only because it follows the wrong input.",
    },
    {
      type: "mcq",
      q: "Each person has 100 friends and nobody's friends overlap. The document model must fetch the document of every person at hop 2 to find the people at hop 3 (tree shown). Roughly how many fetches is that one step?",
      fig: qlTree,
      o: ["About 100", "About 10,000", "About 1,000,000", "About 100,000,000"],
      a: 1,
      hint: "People at hop 2 = 100 × 100.",
      why: "Hop 1 has 100 people and hop 2 has 100 × 100 = 10,000, so expanding hop 2 needs 10,000 document fetches, each a round trip from your own code. The frontier multiplies at every hop, which is why variable-depth relationship questions strain tables and documents.",
    },
    {
      type: "cat",
      q: "Which data model fits each job best?",
      buckets: ["Tables", "Documents", "Graph"],
      items: [
        ["Total sales per city per month over millions of rows", 0],
        ["Load a whole user profile, with settings and address, in one read", 1],
        ["Find the shortest chain of introductions between two strangers", 2],
        ["Join orders to customers, then group and add up", 0],
        ["Store records whose fields differ from one to the next", 1],
        ["Who bought what my friends' friends bought?", 2],
      ],
      why: "Tables suit filtering, joining and aggregating many uniform rows. Documents suit self-contained records that are read and written whole. Graphs suit questions about how things connect, especially to unknown depth.",
    },
    {
      type: "mcq",
      q: "Using the people and friendships in the table, which pipeline returns Ben?",
      fig: qlTable,
      o: ["Only pipeline Y", "Only pipeline X", "Both pipelines", "Neither pipeline"],
      a: 0,
      why: "Order matters between a filter and a hop. In X, filtering Ana for Bolt leaves nobody (she works at Acme), so the hop has nothing to start from. In Y the hop reaches Ben first, and the Bolt filter then keeps him. Two filters in a row can swap, but a hop changes who you are looking at.",
    },
  ]);

  /* =====================================================================
     3.W  ds-engine
     ===================================================================== */

  // layers: memory, then segments newest to oldest
  const enLayers = (() => {
    const chip = (x, y, t, tomb) =>
      rc(x, y, 104, 30, {
        sw: 2.2,
        rx: 7,
        s: tomb ? "var(--rose)" : "var(--line-2)",
        f: tomb ? "var(--rose)" : "var(--panel)",
        fo: tomb ? 0.14 : null,
        d: tomb ? "5 3" : null,
      }) + tx(x + 52, y + 20, t, { s: 12 });
    const rows = [
      ["mem", "Memtable", "in memory", [["date: v9"]]],
      ["s3", "Segment 3", "newest", [["apple: v5"], ["fig: deleted", 1]]],
      ["s2", "Segment 2", "", [["fig: v2"], ["kiwi: v3"]]],
      ["s1", "Segment 1", "oldest", [["apple: v1"], ["fig: v1"]]],
    ];
    let s = "";
    rows.forEach(([id, a, b, cells], i) => {
      const y = 8 + i * 60;
      s +=
        rc(4, y, 346, 52, { sw: 2, s: "var(--line)", rx: 10 }) +
        tx(14, y + 24, a, { a: "start", s: 13 }) +
        (b ? tx(14, y + 40, b, { a: "start", s: 11, c: "var(--text-dim)" }) : "");
      cells.forEach(([t, tomb], j) => (s += chip(122 + j * 112, y + 11, t, tomb)));
      s += hit(id, 4, y, 346, 52, 10);
    });
    return svg(354, 252, s);
  })();

  // sawtooth: segments on disk over 16 minutes
  const enSaw = (() => {
    const X = (m) => 50 + m * 23,
      Y = (n) => 224 - n * 28;
    const ev = [
      [2, 3],
      [4, 4],
      [6, 5],
      [8, 6],
      [9, 1],
      [10, 2],
      [12, 3],
      [14, 4],
      [16, 4],
    ];
    let s = ln(50, 224, 420, 224, { s: "var(--line-2)" }) + ln(50, 20, 50, 224, { s: "var(--line-2)" });
    for (let m = 0; m <= 16; m += 2) s += tx(X(m), 242, m, { s: 11, c: "var(--text-dim)" });
    for (let n = 0; n <= 7; n++)
      s +=
        tx(42, Y(n) + 4, n, { a: "end", s: 11, c: "var(--text-dim)" }) +
        (n ? ln(50, Y(n), 420, Y(n), { s: "var(--line)", sw: 1 }) : "");
    s +=
      tx(235, 262, "minutes", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 120, "segments on disk", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 120)" `,
      );
    let d = `M ${X(0)} ${Y(2)}`;
    ev.forEach(([m, n]) => (d += ` H ${X(m)} V ${Y(n)}`));
    s += `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    s +=
      ln(X(15), 24, X(15), 224, { s: "var(--amber)", sw: 2.5, d: "6 4" }) +
      tx(X(15), 16, "read here", { c: "var(--amber-ink)" });
    s += tx(X(9) - 6, Y(3), "compaction", { a: "end", c: "var(--rose-ink)", s: 12 });
    return svg(440, 270, s);
  })();

  // swimlane: writes, the log, the disk, a power cut
  const enLanes = (() => {
    const W = [["fig"], ["kiwi"], ["date"], ["plum"], ["apple"], ["fig"]];
    const X = (i) => 62 + i * 58;
    let s =
      tx(4, 38, "writes", { a: "start", c: "var(--text-dim)", s: 11 }) +
      tx(4, 110, "log file", { a: "start", c: "var(--text-dim)", s: 11 }) +
      tx(4, 178, "disk", { a: "start", c: "var(--text-dim)", s: 11 });
    s +=
      rc(56, 90, 2 * 58 - 2, 30, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 6 }) +
      tx(56 + 56, 110, "log ON", { s: 12 });
    s +=
      rc(56 + 2 * 58 + 2, 90, 4 * 58 - 8, 30, { f: "var(--rose)", fo: 0.25, s: "var(--rose)", sw: 2, rx: 6 }) +
      tx(56 + 2 * 58 + 2 + (4 * 58 - 8) / 2, 110, "log OFF", { s: 12 });
    s +=
      rc(268, 160, 134, 30, { f: "var(--blue)", fo: 0.28, s: "var(--blue)", sw: 2, rx: 6 }) +
      tx(335, 180, "segment saved", { s: 12 });
    s +=
      ln(268, 126, 268, 160, { s: "var(--blue)", sw: 2, d: "4 3" }) +
      tx(274, 143, "memtable full: flush", { a: "start", s: 11.5, c: "var(--blue-ink)" });
    W.forEach(
      ([k], i) =>
        (s += pk(
          `w${i + 1}`,
          rc(X(i) - 24, 16, 52, 40, { sw: 2.5, rx: 8 }) +
            tx(X(i) + 2, 32, `#${i + 1}`, { s: 10, c: "var(--text-dim)" }) +
            tx(X(i) + 2, 48, k, { s: 12 }),
        )),
    );
    s +=
      ln(56 + 6 * 58 - 2, 12, 56 + 6 * 58 - 2, 200, { s: "var(--rose)", sw: 3, d: "6 4" }) +
      tx(56 + 6 * 58 - 2, 212, "power cut", { c: "var(--rose-ink)", a: "end" });
    return svg(440, 222, s);
  })();

  // sequence diagram: a risky write path
  const enSeq = (() => {
    const L = [
      ["Client", 56],
      ["Engine", 160],
      ["Log (disk)", 272],
      ["Memtable (RAM)", 370],
    ];
    let s = "";
    L.forEach(([t, x], i) => {
      const w = i === 3 ? 118 : 92;
      s +=
        ln(x, 44, x, 222, { s: "var(--line)", sw: 2, d: "4 4" }) +
        rc(x - w / 2, 8, w, 32, { sw: 2.5, rx: 8 }) +
        tx(x, 28, t, { s: 13 });
    });
    const msg = (id, x1, x2, y, t, w) =>
      arrow(x1, y, x2, y, { s: "var(--text)" }) +
      pk(id, rc((x1 + x2) / 2 - w / 2, y - 29, w, 24, { sw: 2.2, rx: 12 }) + tx((x1 + x2) / 2, y - 12, t, { s: 12.5 }));
    s +=
      msg("m1", 56, 160, 78, "1 put fig=v9", 100) +
      msg("m2", 160, 56, 120, "2 ok, saved!", 98) +
      msg("m3", 160, 370, 162, "3 insert into memory", 164) +
      msg("m4", 160, 272, 204, "4 append", 84);
    return svg(440, 232, s);
  })();

  // tape: a run of writes
  const enTape = (() => {
    const K = ["fig", "kiwi", "kiwi", "fig", "date", "fig", "plum", "apple"];
    let s = tx(220, 14, "writes, in the order they arrive", { c: "var(--text-dim)", s: 12 });
    K.forEach((k, i) => {
      const x = 8 + i * 53;
      s +=
        rc(x, 40, 49, 50, { sw: 2.5, rx: 8 }) +
        tx(x + 24.5, 36, i + 1, { s: 12, c: "var(--text-dim)" }) +
        tx(x + 24.5, 71, k, { s: 13.5 }) +
        hit(`w${i + 1}`, x, 40, 49, 50, 8);
    });
    s += tx(220, 112, "memtable: full at 4 different keys", { c: "var(--blue-ink)", s: 12.5 });
    return svg(440, 122, s);
  })();

  // strips: three segments before compaction
  const enStrips = (() => {
    const S = [
      ["Segment 3", ["date: deleted", "fig: deleted", "kiwi: v9"]],
      ["Segment 2", ["apple: v5", "date: v6", "kiwi: v7", "plum: v8"]],
      ["Segment 1", ["apple: v1", "fig: v2", "kiwi: v3", "mango: v4"]],
    ];
    let s = "";
    S.forEach(([n, cells], i) => {
      const y = 8 + i * 48;
      s += tx(4, y + 24, n, { a: "start", s: 11 });
      cells.forEach((c, j) => {
        const tomb = c.includes("deleted");
        s +=
          rc(76 + j * 90, y + 4, 86, 34, {
            sw: 2.2,
            rx: 7,
            s: tomb ? "var(--rose)" : "var(--line-2)",
            f: tomb ? "var(--rose)" : "var(--panel)",
            fo: tomb ? 0.14 : null,
            d: tomb ? "5 3" : null,
          }) + tx(76 + j * 90 + 43, y + 26, c, { s: 11.5 });
      });
    });
    s += tx(4, 160, "dashed red = a tombstone: a record that the key was deleted", {
      a: "start",
      s: 12,
      c: "var(--text-dim)",
    });
    return svg(440, 168, s);
  })();

  // bars: places checked per key
  const enBars = (() => {
    const K = [
      ["apple", 3],
      ["date", 2],
      ["fig", 4],
      ["kiwi", 1],
      ["mango", 3],
      ["plum", 2],
    ];
    let s =
      ln(10, 176, 430, 176, { s: "var(--line-2)" }) +
      tx(220, 14, "places checked by a read of each key", { c: "var(--text-dim)", s: 11 });
    K.forEach(([k, n], i) => {
      const x = 22 + i * 68,
        h = n * 34;
      s +=
        rc(x, 176 - h, 48, h, { f: "var(--blue)", fo: 0.55, s: "var(--blue)", sw: 2.5, rx: 6 }) +
        tx(x + 24, 176 - h - 6, n, { s: 13 }) +
        tx(x + 24, 194, k, { s: 12 });
      s += hit(k, x - 6, 20, 60, 180, 8);
    });
    return svg(440, 204, s);
  })();

  B.add("ds-engine", [
    {
      type: "pick",
      q: "A read for <b>fig</b> checks memory first, then the segments from newest to oldest, and stops at the first layer that mentions the key. Tap the layer where this search stops.",
      fig: enLayers,
      a: "s3",
      why: "Memory has no fig, but Segment 3 holds a tombstone for it. That is the newest word on the key, so the read stops there and answers deleted. The older fig in Segment 2 and Segment 1 is hidden until compaction removes it for good.",
    },
    {
      type: "mcq",
      q: "Each flush adds one segment on disk and one compaction merges all segments into one (chart). A read for a key that lives only in the oldest segment checks the memtable, then every segment, newest first. How many places does it check at minute 15? (Memory counts as one.)",
      fig: enSaw,
      o: ["3 places", "4 places", "5 places", "6 places"],
      a: 2,
      hint: "Read the height of the line at the dashed marker, then add one for memory.",
      why: "At minute 15 there are 4 segments (flushes at 10, 12 and 14 after the merge at 9), plus the memtable: 5 places. The saw-tooth is the cost of fast writes: reads slow down as segments pile up, and compaction pulls them back.",
    },
    {
      type: "pick",
      q: "The memtable is flushed to a segment as soon as it holds 4 different keys, and a flush covers every write so far. The log was switched off after write 2. The machine then loses power. Tap every write that is lost for ever.",
      fig: enLanes,
      a: ["w5", "w6"],
      why: "Writes 3 and 4 were never logged, but write 4 filled the memtable, so the flush saved both to disk. Only writes 5 and 6 sat in memory with no log, so they are gone. Durability comes from either the log or a flush, and the log only matters for what has not been flushed.",
    },
    {
      type: "bug",
      q: "Users keep seeing values that were overwritten days ago. Which line of the engine's settings explains it?",
      code: [
        "memtable_max_keys: 4",
        "log_before_ack: true",
        "read_segments: oldest_to_newest",
        "stop_at_first_match: true",
      ],
      a: 2,
      why: "Stopping at the first match is right only when you look at the newest data first. Reading oldest to newest, the first match is the oldest copy of the key, which is the stale one. The newest value must win.",
    },
    {
      type: "cat",
      q: "The three segments (shown) are merged into a single new segment, keeping the newest value for every key and dropping deleted keys. Sort each record: kept, dropped as overwritten, or dropped as deleted?",
      fig: enStrips,
      buckets: ["Kept", "Overwritten", "Deleted"],
      items: [
        ["apple: v5 (Segment 2)", 0],
        ["apple: v1 (Segment 1)", 1],
        ["kiwi: v7 (Segment 2)", 1],
        ["date: v6 (Segment 2)", 2],
        ["mango: v4 (Segment 1)", 0],
        ["date tombstone (Segment 3)", 2],
      ],
      why: "Kiwi has three copies, so only the newest (v9) survives. Date was deleted last, so both its value and the tombstone vanish. Apple v1 was overwritten by v5. The merged segment holds apple v5, kiwi v9, mango v4 and plum v8: four keys instead of eleven records.",
    },
    {
      type: "pick",
      q: 'The write path is drawn in a risky order: the engine says "ok" before it has saved anything safely. Power fails right after step 2. Tap the step that must happen BEFORE the ok to keep the write.',
      fig: enSeq,
      a: "m4",
      why: "Memory is wiped by a power cut, so inserting into the memtable (step 3) is not enough. The append to the log on disk is what survives, so it has to happen before the ok. Write-ahead means log first, acknowledge second.",
    },
    {
      type: "pick",
      q: "The memtable flushes the moment it holds 4 different keys, and writing a key it already holds does not add a new one. Tap the write that triggers the first flush.",
      fig: enTape,
      a: "w7",
      why: "Counting different keys: fig (1), kiwi (2), date (3), then plum is the fourth at write 7. The repeats at writes 3, 4 and 6 only overwrite entries already in memory, so they never fill it. Updating hot keys is cheap for the memtable.",
    },
    {
      type: "pick",
      q: "The bars show how many places a read of each key checks now: memory first, then the segments, newest to oldest. All segments on disk are then compacted into one. Tap every key whose read becomes cheaper.",
      fig: enBars,
      a: ["apple", "fig", "mango"],
      hint: "After compaction a disk read costs at most 2 places: memory, then the one segment.",
      why: "After compaction the most any key can cost is 2: memory, then the single merged segment. Apple (3), mango (3) and fig (4) all drop to 2. Kiwi is found in memory at 1 and date and plum at 2 already, so they stay as they are.",
    },
  ]);

  /* =====================================================================
     1.1  ds-why
     ===================================================================== */

  // sequence: a write at London, a lag of 2 s, reads at two copies
  const whySeq = (() => {
    const Y = (t) => 66 + t * 48,
      xl = 58,
      xs = 322;
    let s =
      ln(xl, 38, xl, 268, { s: "var(--line)", sw: 2, d: "4 4" }) +
      ln(xs, 38, xs, 268, { s: "var(--line)", sw: 2, d: "4 4" });
    s +=
      rc(xl - 54, 6, 108, 30, { sw: 2.5 }) +
      tx(xl, 26, "London copy", { s: 13 }) +
      rc(xs - 54, 6, 108, 30, { sw: 2.5 }) +
      tx(xs, 26, "Sydney copy", { s: 13 });
    s += tx(xl + 10, Y(0) - 8, "write: balance 60 (was 100)", { a: "start", s: 12, c: "var(--teal-ink)" });
    s +=
      arrow(xl, Y(0), xs, Y(2), { s: "var(--teal)" }) +
      tx(250, Y(2) + 22, "copy lands at 2 s", { a: "end", s: 12, c: "var(--teal-ink)" });
    [
      ["r1", 0.5, "read 0.5 s", 1],
      ["r2", 1, "read 1 s", 0],
      ["r3", 1.5, "read 1.5 s", 1],
      ["r4", 2.5, "read 2.5 s", 1],
      ["r5", 4, "read 4 s", 1],
    ].forEach(([id, t, lbl, syd]) => {
      const px = syd ? xs + 8 : xl + 8;
      s +=
        ln(syd ? xs : xl, Y(t), px, Y(t), { s: "var(--text-dim)", sw: 2 }) +
        pk(id, rc(px, Y(t) - 13, 88, 26, { sw: 2.2, rx: 13 }) + tx(px + 44, Y(t) + 5, lbl, { s: 12 }));
    });
    s +=
      tx(14, 160, "time", { s: 12, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 14 160)" `) +
      arrow(24, 100, 24, 230, { s: "var(--text-dim)", sw: 1.5 });
    return svg(424, 276, s);
  })();

  // stacked bar: where one server's downtime comes from
  const whyStack = (() => {
    const S = [
      ["disk dies", 4, "var(--rose)"],
      ["upgrade restarts", 10, "var(--amber)"],
      ["power cut", 3, "var(--violet)"],
      ["network outage", 2, "var(--blue)"],
      ["app bug crash", 5, "var(--teal)"],
    ];
    const k = 16.4;
    let s = tx(220, 16, "one server in one building: hours of downtime in a year", { c: "var(--text-dim)", s: 11.5 });
    let x = 20;
    S.forEach(([t, h, c]) => {
      s += rc(x, 30, h * k, 44, { f: c, fo: 0.55, s: c, sw: 2.5, rx: 4 }) + tx(x + (h * k) / 2, 58, h + "h", { s: 13 });
      x += h * k;
    });
    S.forEach(([t, h, c], i) => {
      const lx = 20 + (i % 2) * 210,
        ly = 104 + Math.floor(i / 2) * 26;
      s +=
        rc(lx, ly - 11, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) +
        tx(lx + 24, ly + 2, `${t}, ${h} h`, { a: "start", s: 12 });
    });
    s += tx(220, 184, "total 24 hours a year", { c: "var(--text-dim)", s: 11.5 });
    return svg(440, 194, s);
  })();

  // scatter quadrant: harm of stale data against harm of waiting
  const whyScatter = (() => {
    const X = (v) => 52 + v * 37,
      Y = (v) => 244 - v * 22;
    let s = ln(52, 244, 424, 244, { s: "var(--line-2)" }) + ln(52, 24, 52, 244, { s: "var(--line-2)" });
    s += ln(X(0), Y(0), X(10), Y(10), { s: "var(--line-2)", sw: 2, d: "6 5" });
    s +=
      tx(238, 270, "harm if a user sees slightly old data  →", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 134, "harm if the app makes them wait  →", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 134)" `,
      );
    [0, 5, 10].forEach(
      (v) => (s += tx(X(v), 258, v === 0 ? "none" : v === 10 ? "huge" : "", { s: 10, c: "var(--text-dim)" })),
    );
    const P = [
      ["a", 1, 8.3, "like counter"],
      ["b", 9, 3, "bank transfer"],
      ["c", 2.1, 5.6, "online status"],
      ["d", 8, 5, "last flight seat"],
      ["e", 3.6, 7.2, "photo feed"],
      ["f", 6.5, 2, "medicine stock"],
    ];
    P.forEach(([id, x, y, t]) => {
      const anchor = x > 6 ? "end" : "start",
        dx = x > 6 ? -14 : 14;
      s += pk(
        id,
        ci(X(x), Y(y), 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)" }) +
          tx(X(x) + dx, Y(y) + 4, t, { a: anchor, s: 12 }),
      );
    });
    s +=
      tx(100, 40, "wait hurts more", { s: 11, c: "var(--text-dim)", a: "start" }) +
      tx(420, 232, "stale hurts more", { s: 11, c: "var(--text-dim)", a: "end" });
    return svg(440, 276, s);
  })();

  B.add("ds-why", [
    {
      type: "pick",
      q: "A bank balance is changed in London and copied to Sydney, which takes 2 seconds. Reads happen at both places (drawn on a time line). Tap every read that returns the OLD balance of 100.",
      fig: whySeq,
      a: ["r1", "r3"],
      why: "The new balance only lands in Sydney at 2 seconds. Sydney's reads at 0.5 s and 1.5 s come before it, so they are stale. London already holds 60, so its read at 1 s is right, and Sydney is right from 2.5 s on. Stale reads are the price of answering from a copy that has not caught up.",
    },
    {
      type: "slider",
      q: "Over a year, one server in one building is down for the 24 hours shown. A second identical server is added in the same building, behind a load balancer, and upgrades are done one server at a time. Roughly how many of the 24 hours disappear?",
      fig: whyStack,
      min: 0,
      max: 24,
      step: 1,
      ans: 14,
      tol: 2,
      unit: " hours",
      hint: "Which causes would the second server NOT share?",
      why: "A second server covers its own disk failing (4 h) and lets upgrades happen without downtime (10 h): 14 hours. The power cut, the network outage and the app bug hit both servers at the same time, so those 10 hours stay. Copies only help against faults they do not share.",
    },
    {
      type: "pick",
      q: "Each dot is a feature that keeps copies of its data in two data centres. During a network split it must either answer from its own copy (availability) or refuse until the copies agree (consistency). Tap every feature that should choose availability.",
      fig: whyScatter,
      a: ["a", "c", "e"],
      why: "Points above the dashed line are where waiting hurts more than seeing slightly old data: a like counter, an online status and a photo feed. For a bank transfer, the last seat on a flight or medicine stock, a wrong answer costs more than a pause, so those should choose consistency.",
    },
  ]);

  /* =====================================================================
     1.2  ds-blocks
     ===================================================================== */

  // tree: a sorted index of names
  const blkTree = (() => {
    const N = { M: [190, 34], F: [100, 100], S: [280, 100], C: [55, 170], H: [145, 170], P: [235, 170], V: [325, 170] };
    const E = [
      ["M", "F"],
      ["M", "S"],
      ["F", "C"],
      ["F", "H"],
      ["S", "P"],
      ["S", "V"],
    ];
    let s = E.map(([a, b]) => ln(N[a][0], N[a][1] + 16, N[b][0], N[b][1] - 16, { sw: 2.5 })).join("");
    Object.entries(N).forEach(
      ([k, [x, y]]) =>
        (s += pk(k.toLowerCase(), rc(x - 24, y - 17, 48, 34, { sw: 2.5, rx: 10 }) + tx(x, y + 5, k, { s: 14 }))),
    );
    s += tx(190, 218, "left = earlier in the alphabet, right = later", { s: 12, c: "var(--text-dim)" });
    return svg(380, 228, s);
  })();

  // heat strip: requests per minute in 2-hour blocks
  const blkHeat = (() => {
    const V = [120, 40, 30, 260, 700, 650, 540, 480, 560, 820, 600, 300],
      T = (i) => `${String((i * 2) % 24).padStart(2, "0")}–${String((i * 2 + 2) % 24).padStart(2, "0")}`;
    let s = tx(220, 14, "requests per minute from users, in 2-hour blocks", { c: "var(--text-dim)", s: 11.5 });
    V.forEach((v, i) => {
      const x = 8 + (i % 6) * 71,
        y = 28 + Math.floor(i / 6) * 78;
      s +=
        rc(x, y, 67, 66, { sw: 2, s: "var(--line)", rx: 8 }) +
        rc(x, y, 67, 66, { f: "var(--rose)", fo: +(0.08 + (v / 820) * 0.6).toFixed(2), s: "none", sw: 0, rx: 8 }) +
        tx(x + 33.5, y + 25, T(i), { s: 12 }) +
        tx(x + 33.5, y + 48, v, { s: 14 });
      s += hit(`b${i}`, x, y, 67, 66, 8);
    });
    return svg(440, 186, s);
  })();

  // small multiples: popularity of 20 items; the cache holds the top 2
  const blkPop = (() => {
    const zip = (s) => Array.from({ length: 20 }, (_, i) => Math.pow(i + 1, -s));
    const P = [
        ["A", zip(1)],
        ["B", zip(0.5)],
        ["C", zip(0)],
      ],
      w = 142;
    let s = "";
    P.forEach(([t, v], i) => {
      const x = 4 + i * (w + 4),
        mx = v[0],
        sh = (j) => (v[j] / mx) * 110;
      s +=
        rc(x, 4, w, 190, { sw: 2, s: "var(--line)", rx: 10 }) +
        tx(x + w / 2, 24, "Panel " + t) +
        ln(x + 8, 160, x + w - 8, 160, { sw: 2 });
      v.forEach(
        (_, j) =>
          (s += `<rect x="${x + 9 + j * 6.4}" y="${160 - sh(j)}" width="5" height="${sh(j)}" rx="1.5" fill="${j < 2 ? "var(--teal)" : "var(--line-2)"}"/>`),
      );
      s += tx(x + w / 2, 180, "requests per item", { s: 10.5, c: "var(--text-dim)" });
    });
    return svg(3 * (w + 4) + 4, 198, s);
  })();

  B.add("ds-blocks", [
    {
      type: "pick",
      q: "A sorted index stores names as a tree: at each node, go left for an earlier name and right for a later one. Tap every node examined while searching for <b>Q</b>, which is not in the index.",
      fig: blkTree,
      a: ["m", "s", "p"],
      why: "Q comes after M, so go right to S. Q is before S, so go left to P. Q comes after P, and nothing is to the right, so Q is not there. Three looks settled it, where a scan of all 7 names would take 7. Each step halves what is left, which is why indexes stay fast on a million records.",
    },
    {
      type: "pick",
      q: "A nightly batch job needs 4 hours in a row and must finish before the 08:00 report. It competes with users, so it should run when they are quietest. Tap the block where it should START.",
      fig: blkHeat,
      a: "b1",
      hint: "Add up the two neighbouring blocks that make 4 hours, and look for the smallest total.",
      why: "Starting at 02:00 uses the 02–04 and 04–06 blocks, 40 + 30 requests per minute, the quietest pair, and it ends at 06:00. Starting at 00:00 would cross a busier 120 block, and 04:00 would run into the morning rise. Batch work runs on accumulated data, so it can wait for the quiet hours.",
    },
    {
      type: "mcq",
      q: "Each panel shows how popular 20 items are (taller bar = more requests). A cache can hold only 2 items (the green bars, the most popular). Which workload does it help most?",
      fig: blkPop,
      o: [
        "Panel A: a few items take most requests",
        "Panel B: popularity falls away gently",
        "Panel C: every item is equally popular",
        "All three panels benefit the same",
      ],
      a: 0,
      why: "A cache works because popularity is skewed. In Panel A the top two items draw about 42% of requests. In B it is about 22% and in C only 10%, no better than a random pick. If everything is equally popular, a small cache catches little.",
    },
  ]);

  /* =====================================================================
     1.3  ds-reliability
     ===================================================================== */

  // racks: where do the copies of each shard live?
  const relRacks = (() => {
    const C = { A: "var(--violet)", B: "var(--blue)", C: "var(--amber)", D: "var(--teal)", E: "var(--rose)" };
    const R = [
      ["Rack 1", ["A", "A", "B", "C"]],
      ["Rack 2", ["B", "D", "D", "E"]],
      ["Rack 3", ["C", "E", "E", "D"]],
    ];
    let s = "";
    R.forEach(([t, sl], i) => {
      const x = 8 + i * 144,
        dead = i === 0;
      s +=
        rc(x, 30, 136, 222, { sw: 2.5, rx: 12, s: dead ? "var(--rose)" : "var(--line-2)", d: dead ? "7 5" : null }) +
        tx(x + 68, 22, t + (dead ? "  ⚡ power cut" : ""), { c: dead ? "var(--rose-ink)" : "var(--text)" });
      sl.forEach(
        (k, j) =>
          (s += pk(
            k,
            rc(x + 14, 42 + j * 50, 108, 42, { f: C[k], fo: 0.35, s: C[k], sw: 2.5, rx: 8 }) +
              tx(x + 68, 69 + j * 50, "shard " + k, { s: 13 }),
          )),
      );
    });
    return svg(440, 260, s);
  })();

  // Gantt: a mirrored pair loses a disk and rebuilds
  const relGantt = (() => {
    const x0 = 64,
      k = 30;
    let s = "";
    [0, 2, 4, 6, 8, 10, 12].forEach(
      (t) =>
        (s +=
          ln(x0 + t * k, 40, x0 + t * k, 158, { s: "var(--line)", sw: 1.5 }) +
          tx(x0 + t * k, 176, t, { s: 12, c: "var(--text-dim)" })),
    );
    s += tx(x0 + 6 * k, 194, "hours since Disk A died", { s: 12, c: "var(--text-dim)" });
    s +=
      tx(x0 - 8, 61, "Disk A", { a: "end", s: 13 }) +
      rc(x0, 44, 7 * k, 26, { f: "var(--amber)", fo: 0.4, s: "var(--amber)", sw: 2, rx: 5 }) +
      tx(x0 + 3.5 * k, 62, "rebuilding from B", { s: 12 }) +
      rc(x0 + 7 * k, 44, 5 * k, 26, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 5 }) +
      tx(x0 + 9.5 * k, 62, "healthy again", { s: 12 });
    s +=
      tx(x0 - 8, 101, "Disk B", { a: "end", s: 13 }) +
      rc(x0, 84, 12 * k, 26, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 5 }) +
      tx(x0 + 6 * k, 102, "healthy so far", { s: 12 });
    s += tx(x0 - 8, 138, "dies here?", { a: "end", s: 12, c: "var(--rose-ink)" });
    [2, 5, 8, 11].forEach((t) => {
      const x = x0 + t * k;
      s +=
        ln(x, 112, x, 124, { s: "var(--rose)", sw: 2, d: "3 3" }) +
        pk(`t${t}`, ci(x, 138, 14, { f: "var(--rose)", fo: 0.12, s: "var(--rose)", sw: 2.5 }) + xm(x, 138, 5));
    });
    return svg(440, 202, s);
  })();

  // DAG: who needs whom
  const relDag = (() => {
    const N = {
      Web: [220, 30],
      Cart: [120, 100],
      Search: [320, 100],
      StockDB: [60, 180],
      Auth: [210, 180],
      Index: [370, 180],
    };
    const E = [
      ["Web", "Cart"],
      ["Web", "Search"],
      ["Cart", "Auth"],
      ["Cart", "StockDB"],
      ["Search", "Auth"],
      ["Search", "Index"],
    ];
    let s = "";
    E.forEach(
      ([a, b]) => (s += arrow(N[a][0], N[a][1] + 17, N[b][0], N[b][1] - 20, { s: "var(--text-dim)", sw: 2.2 })),
    );
    Object.entries(N).forEach(([k, [x, y]]) => {
      const dead = k === "Auth";
      s +=
        rc(x - 42, y - 17, 84, 34, {
          sw: 2.5,
          rx: 9,
          s: dead ? "var(--rose)" : "var(--line-2)",
          f: dead ? "var(--rose)" : "var(--panel)",
          fo: dead ? 0.25 : null,
        }) + tx(x, y + 5, dead ? "Auth (down)" : k, { c: dead ? "var(--rose-ink)" : "var(--text)" });
    });
    s += tx(222, 224, "an arrow means: needs", { s: 11, c: "var(--text-dim)" });
    return svg(440, 234, s);
  })();

  B.add("ds-reliability", [
    {
      type: "pick",
      q: "Every shard of data has at least 2 copies, each in a slot of a rack. Rack 1 loses power (dashed). Tap the shard that becomes completely unavailable.",
      fig: relRacks,
      a: "A",
      why: "Both copies of shard A sit in Rack 1, so the power cut removes them together. Every other shard has a copy in another rack. Copies protect you only when their faults are independent, and a shared rack is a shared cause: spread the replicas.",
    },
    {
      type: "pick",
      q: "Two disks mirror each other. Disk A dies at hour 0 and its replacement takes until hour 7 to be rebuilt from Disk B. Tap every moment at which Disk B dying would lose data.",
      fig: relGantt,
      a: ["t2", "t5"],
      why: "While the rebuild runs, Disk B holds the only copy, so a failure at hour 2 or 5 loses everything. By hour 8 the mirror is whole again and Disk B can die safely. A faster rebuild, or a third copy, shrinks the window in which one more ordinary fault becomes a failure.",
    },
    {
      type: "cat",
      q: 'Each arrow means "needs". Every dependency is a hard one. Auth has crashed. What happens to each of the other services?',
      fig: relDag,
      buckets: ["Still works", "Breaks too"],
      items: [
        ["Web", 1],
        ["Cart", 1],
        ["Search", 1],
        ["StockDB", 0],
        ["Index", 0],
      ],
      why: "Failure travels up the arrows: Cart and Search need Auth, and Web needs both of them, so all three break. StockDB and Index never depend on Auth, so they keep running. One small fault in a shared service can become a failure of the whole page, which is why optional dependencies should degrade gracefully.",
    },
  ]);

  /* =====================================================================
     1.4  ds-load
     ===================================================================== */

  // CDF: share of requests finished within a time, for two services
  const loadCdf = (() => {
    const X = (ms) => 50 + ms * 0.185,
      Y = (p) => 240 - p * 2;
    const A = [
      [0, 0],
      [50, 22],
      [100, 50],
      [200, 76],
      [500, 90],
      [1000, 96],
      [1800, 99],
      [2000, 99.4],
    ];
    const Bp = [
      [0, 0],
      [100, 4],
      [200, 24],
      [300, 50],
      [500, 90],
      [700, 99],
      [1000, 100],
      [2000, 100],
    ];
    const path = (a) => a.map(([m, p], i) => `${i ? "L" : "M"} ${X(m).toFixed(1)} ${Y(p).toFixed(1)}`).join(" ");
    let s = ln(50, 240, 420, 240, { s: "var(--line-2)" }) + ln(50, 30, 50, 240, { s: "var(--line-2)" });
    [0, 500, 1000, 1500, 2000].forEach((m) => (s += tx(X(m), 258, m, { s: 12, c: "var(--text-dim)" })));
    [0, 50, 100].forEach((p) => (s += tx(42, Y(p) + 4, p + "%", { a: "end", s: 12, c: "var(--text-dim)" })));
    s += tx(235, 276, "response time (ms)", { s: 12, c: "var(--text-dim)" });
    s +=
      ln(50, Y(99), 420, Y(99), { s: "var(--rose)", sw: 2, d: "6 4" }) +
      tx(414, Y(99) - 8, "99% of requests", { a: "end", s: 12, c: "var(--rose-ink)" });
    s +=
      ln(X(1000), 30, X(1000), 240, { s: "var(--amber)", sw: 2.5, d: "6 4" }) +
      tx(X(1000) + 6, 226, "1 s limit", { a: "start", s: 12, c: "var(--amber-ink)" });
    s += pk(
      "A",
      `<path d="${path(A)}" fill="none" stroke="var(--violet)" stroke-width="4" stroke-linejoin="round"/>` +
        rc(X(2000) - 66, Y(60), 62, 24, { sw: 2.2, rx: 12, s: "var(--violet)" }) +
        tx(X(2000) - 35, Y(60) + 16, "Service A", { s: 11.5 }),
    );
    s += pk(
      "B",
      `<path d="${path(Bp)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>` +
        rc(X(700) - 30, Y(30), 62, 24, { sw: 2.2, rx: 12, s: "var(--blue)" }) +
        tx(X(700) + 1, Y(30) + 16, "Service B", { s: 11.5 }),
    );
    s += tx(14, 136, "share finished", { s: 12, c: "var(--text-dim)" }).replace(
      "<text ",
      `<text transform="rotate(-90 14 136)" `,
    );
    return svg(440, 284, s);
  })();

  // waterfall: one page, four backend calls (two chains)
  const loadFall = (() => {
    const x0 = 80,
      k = 0.85;
    let s = "";
    [0, 100, 200, 300, 400].forEach(
      (t) =>
        (s +=
          ln(x0 + t * k, 30, x0 + t * k, 190, { s: "var(--line)", sw: 1.5 }) +
          tx(x0 + t * k, 206, t, { s: 11, c: "var(--text-dim)" })),
    );
    s += tx(x0 + 200 * k, 224, "milliseconds", { s: 11, c: "var(--text-dim)" });
    const R = [
      ["auth", "Auth", 0, 120, "var(--blue)"],
      ["profile", "Profile", 0, 300, "var(--violet)"],
      ["orders", "Orders", 120, 220, "var(--amber)"],
      ["recs", "Recs", 300, 380, "var(--teal)"],
    ];
    R.forEach(([id, t, a, b, c], i) => {
      const y = 40 + i * 38;
      s +=
        tx(x0 - 8, y + 17, t, { a: "end" }) +
        rc(x0 + a * k, y, (b - a) * k, 26, { f: c, fo: 0.45, s: c, sw: 2.2, rx: 5 }) +
        tx(x0 + ((a + b) / 2) * k, y + 17, `${b - a} ms`, { s: 11 });
      s += hit(id, 4, y - 5, 432, 36, 8);
    });
    s +=
      `<path d="M ${x0 + 120 * k} 66 V 78 H ${x0 + 120 * k} V 116" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<path d="M ${x0 + 300 * k} 92 V 104 V 154" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 3"/>`;
    return svg(440, 232, s);
  })();

  // stacked bars: where the time goes at p50 and p99
  const loadStack = (() => {
    const S = [
        ["network", "var(--blue)", 20, 25],
        ["waiting in a queue", "var(--amber)", 5, 400],
        ["app code", "var(--violet)", 30, 40],
        ["database", "var(--teal)", 25, 60],
      ],
      k = 0.66;
    let s = "";
    [
      ["typical request (p50)", 2],
      ["slowest 1 in 100 (p99)", 3],
    ].forEach(([t, ix], r) => {
      const y = 28 + r * 70;
      s += tx(12, y - 8, t, { a: "start", s: 12 });
      let x = 12;
      S.forEach(([n, c, a, b]) => {
        const v = r ? b : a;
        s += rc(x, y, v * k, 34, { f: c, fo: 0.55, s: c, sw: 2, rx: 3 });
        x += v * k;
      });
      s += tx(x + 8, y + 22, (r ? 525 : 80) + " ms", { a: "start", s: 13 });
    });
    S.forEach(([n, c], i) => {
      const lx = 12 + (i % 2) * 210,
        ly = 176 + Math.floor(i / 2) * 24;
      s +=
        rc(lx, ly - 11, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 24, ly + 2, n, { a: "start", s: 12 });
    });
    return svg(440, 226, s);
  })();

  B.add("ds-load", [
    {
      type: "pick",
      q: 'The promise is: "at least 99% of requests finish within 1 second". Each curve shows the share of requests finished by a given time. Tap the service that keeps the promise.',
      fig: loadCdf,
      a: "B",
      why: "Service B is at 99% by about 700 ms, inside the 1 s limit. Service A is quicker for the typical request (half done in 100 ms against 300 ms) but only 96% are done at 1 s, because its slowest few take almost 2 s. A promise about the tail needs the tail, not the median.",
    },
    {
      type: "pick",
      q: "A page waits for all four backend calls (bars). Orders can only start once Auth has answered, and Recs once Profile has. Tap every call whose speed-up would make the page load sooner.",
      fig: loadFall,
      a: ["profile", "recs"],
      why: "The page is done when its longest chain finishes: Profile then Recs, 300 + 80 = 380 ms. Auth then Orders ends at 220 ms, which is not holding anything up, so speeding it up changes nothing. Look for the slowest chain, not the single biggest bar.",
    },
    {
      type: "mcq",
      q: "The bars show where the time goes for a typical request and for the slowest 1 in 100. Which single change would shrink the 99th-percentile response the most?",
      fig: loadStack,
      o: [
        "Faster network links between regions",
        "Spare servers, so requests rarely queue",
        "A quicker database query plan",
        "Smaller JSON responses",
      ],
      a: 1,
      why: "The slow requests are not slow because of their network, app or database work, which grow only a little. They are slow because they waited about 400 ms in a queue. Cutting the wait, by keeping servers less busy, fixes the tail; shaving the other parts barely touches it.",
    },
  ]);

  /* =====================================================================
     1.5  ds-twitter
     ===================================================================== */

  // log-log scatter: followers against posts per day
  const twScatter = (() => {
    const X = (f) => 60 + 72 * (Math.log10(f) - 2),
      Y = (p) => 246 - 100 * Math.log10(p);
    let s = ln(60, 246, 420, 246, { s: "var(--line-2)" }) + ln(60, 40, 60, 246, { s: "var(--line-2)" });
    [
      ["100", 2],
      ["1k", 3],
      ["10k", 4],
      ["100k", 5],
      ["1M", 6],
      ["10M", 7],
    ].forEach(([t, e]) => (s += tx(X(Math.pow(10, e)), 264, t, { s: 11, c: "var(--text-dim)" })));
    [
      [1, "1"],
      [10, "10"],
      [100, "100"],
    ].forEach(([p, t]) => (s += tx(52, Y(p) + 4, t, { a: "end", s: 11, c: "var(--text-dim)" })));
    s +=
      tx(240, 282, "followers (each tick is 10 times more)", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 140, "posts per day (log scale)", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 140)" `,
      );
    s +=
      ln(X(1e4), Y(100), X(1e6), Y(1), { s: "var(--rose)", sw: 2.5, d: "7 5" }) +
      tx(424, 104, "1 million writes a day", { a: "end", s: 12, c: "var(--rose-ink)" });
    const P = [
      ["a", 200, 5, "Maya"],
      ["b", 5e4, 10, "BrightNews"],
      ["c", 2e6, 2, "StarCo"],
      ["d", 3e4, 80, "TickerBot"],
      ["e", 300, 40, "Sam"],
      ["f", 5e5, 1, "ClubFC"],
    ];
    P.forEach(([id, f, p, t]) => {
      const x = X(f),
        y = Y(p),
        left = id === "b" || id === "f";
      s += pk(
        id,
        ci(x, y, 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)" }) +
          tx(x + (left ? -12 : 12), y + (id === "f" ? -8 : 4), t, { a: left ? "end" : "start", s: 12 }),
      );
    });
    return svg(440, 292, s);
  })();

  // small multiples: posts and timeline reads per second, in three workloads
  const twPanels = (() => {
    const P = [
        ["Panel X", 5, 300],
        ["Panel Y", 100, 10],
        ["Panel Z", 20, 20],
      ],
      w = 140,
      k = 0.4;
    let s = "";
    P.forEach(([t, po, re], i) => {
      const x = 4 + i * (w + 4),
        base = 172;
      s +=
        rc(x, 4, w, 208, { sw: 2, s: "var(--line)", rx: 10 }) +
        tx(x + w / 2, 24, t) +
        ln(x + 10, base, x + w - 10, base, { sw: 2 });
      s +=
        rc(x + 26, base - po * k, 38, po * k, { f: "var(--violet)", fo: 0.55, s: "var(--violet)", sw: 2, rx: 4 }) +
        tx(x + 45, base - po * k - 6, po + "k", { s: 13 }) +
        tx(x + 45, base + 17, "posts/s", { s: 11.5, c: "var(--text-dim)" });
      s +=
        rc(x + 84, base - re * k, 38, re * k, { f: "var(--amber)", fo: 0.55, s: "var(--amber)", sw: 2, rx: 4 }) +
        tx(x + 103, base - re * k - 6, re + "k", { s: 13 }) +
        tx(x + 103, base + 17, "reads/s", { s: 11.5, c: "var(--text-dim)" });
      s += hit(["x", "y", "z"][i], x, 4, w, 208, 10);
    });
    return svg(3 * (w + 4) + 4, 216, s);
  })();

  // Venn: followers of two accounts
  const twVenn = (() => {
    let s =
      ci(160, 110, 88, { f: "var(--violet)", fo: 0.14, s: "var(--violet)" }) +
      ci(280, 110, 88, { f: "var(--amber)", fo: 0.14, s: "var(--amber)" });
    s +=
      tx(130, 14, "followers of Bob", { c: "var(--violet-ink)" }) +
      tx(310, 14, "followers of Cara", { c: "var(--amber-ink)" });
    const dot = (x, y) => ci(x, y, 9, { f: "var(--blue)", fo: 0.6, s: "var(--blue)", sw: 2 });
    [
      [110, 80],
      [110, 118],
      [125, 150],
    ].forEach(([x, y]) => (s += dot(x, y)));
    [
      [220, 92],
      [220, 132],
    ].forEach(([x, y]) => (s += dot(x, y)));
    [
      [320, 90],
      [335, 135],
    ].forEach(([x, y]) => (s += dot(x, y)));
    s += tx(220, 212, "each dot is one user; Bob and Cara each post once", { s: 11.5, c: "var(--text-dim)" });
    return svg(440, 222, s);
  })();

  B.add("ds-twitter", [
    {
      type: "pick",
      q: "Fan-out on write does one cache write per follower for every post, so an account's daily cost is followers × posts per day. The dashed line marks 1 million writes a day (both axes are log scales). Tap every account whose cost is above that line.",
      fig: twScatter,
      a: ["c", "d"],
      hint: "Points to the right of the dashed line cost more than 1 million a day.",
      why: "StarCo has 2 million followers and posts twice: 4 million writes a day. TickerBot has only 30,000 followers but posts 80 times a day: 2.4 million. A bot can be as costly as a celebrity, so a hybrid scheme should choose by followers × posts, not by fame alone.",
    },
    {
      type: "pick",
      q: "Merge-on-read costs 1 write per post and 100 fetches per timeline read. Fan-out-on-write costs 75 writes per post and 1 fetch per read. Each panel shows a workload (thousands per second). Tap the panel where merge-on-read is the cheaper choice.",
      fig: twPanels,
      a: "y",
      hint: "Work out each approach's total for Panel Y, then check Panel Z.",
      why: "In Panel Y there are ten times more posts than reads: merge-on-read costs about 1.1 million operations a second, fan-out about 7.5 million. Panel Z looks balanced but fan-out still wins slightly (1.5 against 2.0 million). Only when reads are rarer than posts does doing the work at read time pay off.",
    },
    {
      type: "mcq",
      q: "Bob and Cara each post once. Under fan-out on write, each post is copied into the timeline cache of every follower (the diagram shows both followings). How many timeline-cache writes happen in total?",
      fig: twVenn,
      o: ["7 writes", "9 writes", "5 writes", "2 writes"],
      a: 1,
      hint: "Count the dots in each circle, then add the two circles.",
      why: "Bob has 5 followers and Cara has 4, so 5 + 4 = 9 writes. The 2 users who follow both get two writes, one per post, because the cost is counted per post and follower pair, not per user. The 7 would be the number of different users.",
    },
  ]);

  /* =====================================================================
     1.6  ds-scaling
     ===================================================================== */

  // line plot: demand through a day
  const scDemand = (() => {
    const D = [
      100, 80, 70, 60, 60, 80, 150, 300, 450, 500, 480, 450, 500, 520, 480, 450, 500, 600, 750, 800, 700, 500, 300, 150,
    ];
    const X = (h) => 52 + h * 15.4,
      Y = (v) => 222 - v * 0.22;
    let s = ln(52, 222, 420, 222, { s: "var(--line-2)" }) + ln(52, 30, 52, 222, { s: "var(--line-2)" });
    [0, 6, 12, 18, 24].forEach((h) => (s += tx(X(h), 240, h + ":00", { s: 11, c: "var(--text-dim)" })));
    [0, 400, 800].forEach((v) => (s += tx(44, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-dim)" })));
    let d = `M ${X(0)} ${Y(0)}`;
    D.forEach((v, h) => (d += ` L ${X(h + 0.5).toFixed(1)} ${Y(v).toFixed(1)}`));
    d += ` L ${X(24)} ${Y(0)} Z`;
    s += `<path d="${d}" fill="var(--blue)" fill-opacity="0.3" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    s +=
      ln(52, Y(800), 420, Y(800), { s: "var(--rose)", sw: 2.5, d: "7 5" }) +
      tx(414, Y(800) - 6, "one big machine, sized for the peak (800)", { a: "end", s: 11, c: "var(--rose-ink)" });
    s +=
      tx(236, 258, "time of day", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 126, "requests per second", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 126)" `,
      );
    return svg(440, 266, s);
  })();

  // heat grid: load per node per hour
  const scHeat = (() => {
    const V = [
      [22, 25, 24, 23, 26, 24],
      [21, 24, 23, 22, 25, 23],
      [96, 99, 100, 100, 98, 100],
      [20, 22, 21, 24, 22, 23],
    ];
    let s = tx(240, 13, "hour of the day", { c: "var(--text-dim)", s: 11.5 });
    ["9", "10", "11", "12", "13", "14"].forEach((h, j) => (s += tx(100 + j * 54 + 25, 32, h + ":00", { s: 11 })));
    V.forEach((row, i) => {
      s += tx(88, 58 + i * 36 + 4, `Node ${i + 1}`, { a: "end" });
      row.forEach(
        (v, j) =>
          (s +=
            rc(100 + j * 54, 40 + i * 36, 50, 32, { sw: 2, s: "var(--line)", rx: 6 }) +
            rc(100 + j * 54, 40 + i * 36, 50, 32, {
              f: v > 90 ? "var(--rose)" : "var(--teal)",
              fo: v > 90 ? 0.55 : 0.2,
              s: "none",
              sw: 0,
              rx: 6,
            }) +
            tx(125 + j * 54, 61 + i * 36, v + "%")),
      );
    });
    s += tx(220, 200, "% of each node's capacity in use", { s: 11.5, c: "var(--text-dim)" });
    return svg(440, 208, s);
  })();

  B.add("ds-scaling", [
    {
      type: "slider",
      q: "One big machine is bought for the peak (dashed line), and demand through the day is shown. Roughly what share of the big machine's capacity sits idle on average over the 24 hours?",
      fig: scDemand,
      min: 0,
      max: 100,
      step: 5,
      ans: 53,
      tol: 10,
      unit: "%",
      hint: "Most hours run at about 300 to 500, against a capacity of 800.",
      why: "Average demand is about 376 against a capacity of 800, so roughly half the machine is idle, all day, because it was sized for 8 pm. A fleet of small machines that grows and shrinks with demand (elasticity) pays for what is used. That is a cost argument for scaling out.",
    },
    {
      type: "mcq",
      q: "A cluster stores customer data on 4 nodes, split by customer. The map shows how busy each node is across six hours. What does this pattern show, and what is the sensible fix?",
      fig: scHeat,
      o: [
        "A hot partition: split up the busy node's data",
        "Too few machines: add more nodes of the same kind",
        "A network fault: nodes 1, 2 and 4 get no traffic",
        "A new machine that will balance itself in time",
      ],
      a: 0,
      why: "Nodes 1, 2 and 4 are only about a quarter busy, so capacity is not the problem. Node 3 is pinned near 100% hour after hour: one customer or key sends it most of the work. New nodes would get only the leftovers, so the busy partition itself has to be split across machines.",
    },
    {
      type: "bug",
      q: "A web fleet is meant to scale with demand, but servers are added and removed over and over, every few minutes, wasting money and causing blips. Which line of the autoscaler's settings is the cause?",
      code: ["scale_out_when_cpu_over: 70", "scale_in_when_cpu_under: 70", "check_every_seconds: 10", "min_servers: 2"],
      a: 1,
      why: "When CPU passes 70% a server is added, which spreads the load and pushes CPU just below 70%, so the same rule removes it again. Scale in should trigger well below scale out, say under 30%, leaving a gap so the fleet settles instead of flapping.",
    },
  ]);

  /* =====================================================================
     1.7  ds-maintain
     ===================================================================== */

  // two incident timelines
  const mtBars = (() => {
    const S = [
        ["finding it", "var(--amber)"],
        ["working out why", "var(--blue)"],
        ["fixing it", "var(--teal)"],
      ],
      k = 3.7;
    const I = [
      ["Incident last year", [40, 30, 20]],
      ["Incident this year", [2, 25, 3]],
    ];
    let s = "";
    I.forEach(([t, v], r) => {
      const y = 28 + r * 62;
      s += tx(12, y - 8, t, { a: "start", s: 12 });
      let x = 12;
      v.forEach((m, i) => {
        s +=
          rc(x, y, m * k, 34, { f: S[i][1], fo: 0.55, s: S[i][1], sw: 2, rx: 3 }) +
          (m >= 8 ? tx(x + (m * k) / 2, y + 22, m + " min", { s: 11.5 }) : "");
        x += m * k;
      });
      s += tx(x + 8, y + 22, `${v.reduce((a, b) => a + b)} min`, { a: "start", s: 13 });
    });
    S.forEach(([n, c], i) => {
      const lx = 12 + i * 142;
      s += rc(lx, 148, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 22, 161, n, { a: "start", s: 12 });
    });
    s += tx(12, 185, "2 min and 3 min are too thin to label inside the bars", {
      a: "start",
      s: 10.5,
      c: "var(--text-dim)",
    });
    return svg(440, 194, s);
  })();

  // dependency matrix: a filled cell means the ROW module calls the COLUMN module
  const mtMatrix = (() => {
    const M = ["Web", "Orders", "Users", "Billing", "DB"],
      D = {
        Web: ["Orders", "Users", "Billing"],
        Orders: ["Users", "DB"],
        Users: ["DB"],
        Billing: ["Orders", "DB"],
        DB: [],
      };
    const x0 = 84,
      y0 = 54,
      c = 62,
      r = 34;
    let s = tx(x0 + 2.5 * c, 14, "the module that is CALLED", { c: "var(--text-dim)", s: 11.5 });
    M.forEach(
      (m, j) =>
        (s += pk(
          m.toLowerCase(),
          rc(x0 + j * c + 3, 22, c - 6, 26, { sw: 2.2, rx: 8 }) + tx(x0 + j * c + c / 2, 40, m, { s: 12 }),
        )),
    );
    M.forEach((m, i) => {
      s += tx(x0 - 10, y0 + i * r + r / 2 + 4, m, { a: "end" });
      M.forEach((n, j) => {
        const on = D[m].includes(n);
        s += rc(x0 + j * c + 3, y0 + i * r + 3, c - 6, r - 6, {
          sw: 2,
          s: i === j ? "var(--line-2)" : "var(--line)",
          rx: 5,
          f: i === j ? "var(--bg-2)" : "var(--panel)",
        });
        if (on)
          s +=
            rc(x0 + j * c + 3, y0 + i * r + 3, c - 6, r - 6, {
              f: "var(--amber)",
              fo: 0.55,
              s: "var(--amber)",
              sw: 2,
              rx: 5,
            }) + tx(x0 + j * c + c / 2, y0 + i * r + r / 2 + 5, "●", { s: 12 });
      });
    });
    s += tx(x0 - 10, 42, "caller ↓", { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(440, 232, s);
  })();

  const mtTable = table(
    ["Server", "What is special about it"],
    [
      ["web-01", "Built from the standard image, restarts itself after a crash"],
      ["web-02", "Holds the only copy of the licence file, in one person's home folder"],
      ["batch-1", "The only box that can send invoices, because its IP address is whitelisted"],
      ["web-03", "Pulls its settings from the shared store when it starts"],
      ["db-2", "Settings tweaked by hand over SSH, with no copy kept anywhere"],
    ],
  );

  B.add("ds-maintain", [
    {
      type: "mcq",
      q: "The bars show how two incidents' time was spent, before and after the team improved how it runs the system. Which improvement saved the most time?",
      fig: mtBars,
      o: [
        "Monitoring that alerts the team at once",
        "Scripts that make rollbacks repeatable",
        "Simpler code that is easier to follow",
        "Hand-written notes for each machine",
      ],
      a: 0,
      hint: "Compare the saving in each colour: how many minutes did each phase shrink by?",
      why: "Finding the problem fell from 40 minutes to 2, a saving of 38. Fixing it fell from 20 to 3 (17 saved) and working out why only from 30 to 25. Operability starts with visibility: you cannot fix quickly what you have not noticed.",
    },
    {
      type: "pick",
      q: "A filled cell means that the row's module calls the column's module. One module's interface is about to change, and every module that depends on it, directly or through others, must be retested. Tap the module whose change would affect the most others.",
      fig: mtMatrix,
      a: "db",
      why: "Orders, Users and Billing call DB directly, and Web calls all three, so all four other modules are affected. Changing Users reaches Web, Orders and Billing, but not DB. A module everyone leans on is the most expensive to change. Putting a clean abstraction in front of it is how you protect evolvability.",
    },
    {
      type: "multi",
      q: "Operators want any machine to be replaceable by a fresh one in minutes, at 3 a.m. Which rows of the table would make that hard? Select all.",
      fig: mtTable,
      o: ["web-01", "web-02", "batch-1", "web-03", "db-2"],
      a: [1, 2, 4],
      why: "web-02's licence, batch-1's whitelisted address and db-2's hand-made settings each live in one machine only, so it cannot be swapped without losing something. web-01 and web-03 can be rebuilt from an image and a shared store. Operability means no dependency on individual machines.",
    },
  ]);
})();

/* ===== bank-x-ds-2.js ===== */
/* Revision bank, third set of varied, visual questions (ds-2).
   Lecture 2 (models, schema, graph, NoSQL) and Lecture 3 (log, hash index, SSTable).
   Every module gets four new questions, each with a different diagram kind from the earlier sets:
   tree, timeline, small multiples, flowchart | presence grid, sequence diagram, grouped bars, table trace |
   matrix, rings, Venn, code | heat grid, replica map, line plot, key diagram | sequence, scatter, snapshot panels, code |
   byte tape, segment matrix, gauge, crash sequence | layer stack, merge trace, key ruler, step chart.
   Concepts only, no SQL, no calculator. Numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto">${body}</svg>`;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${(o.s || 13) + 1}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const R = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const Ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2.5, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
  const Circ = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2.5}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const arrow = (x1, y1, x2, y2, c = "var(--text-dim)", w = 2.5, d = "") => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 9,
      bx = x2 - Math.cos(a) * h,
      by = y2 - Math.sin(a) * h,
      s = Math.sin(a) * 5,
      k = Math.cos(a) * 5;
    return (
      Ln(x1, y1, bx, by, c, w, d) +
      `<polygon points="${x2},${y2} ${bx + s},${by - k} ${bx - s},${by + k}" fill="${c}"/>`
    );
  };
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;

  /* Sequence diagram. lifelines [[x, label]], msgs [{id, from, to (lifeline idx), y, label, c, d, soft}] */
  function seq(w, h, lifelines, msgs, { pick = false, extra = "" } = {}) {
    let b = "";
    lifelines.forEach(([x, label]) => {
      b += Ln(x, 40, x, h - 6, "var(--line-2)", 2, "5 5");
      b += R(x - 62, 6, 124, 32, { f: "var(--panel-2)" }) + T(x, 27, label, { a: "middle", s: 13 });
    });
    msgs.forEach((m) => {
      const x1 = lifelines[m.from][0],
        x2 = lifelines[m.to][0],
        dir = x2 > x1 ? 1 : -1,
        col = m.c || "var(--text-dim)";
      const row = pick ? R(10, m.y - 22, w - 20, 36, { rx: 8, f: "var(--panel)", st: "var(--line)", sw: 2 }) : "";
      let inner =
        row + T((x1 + x2) / 2, m.y - 6, m.label, { a: "middle", s: 13, c: m.soft ? "var(--text-dim)" : "var(--text)" });
      inner += arrow(x1 + dir * 4, m.y + 6, x2 - dir * 4, m.y + 6, col, 2.5, m.d || "");
      b += pick ? PK(m.id, inner) : inner;
    });
    return svg(w, h, b + extra);
  }

  /* ================= ds-models ================= */
  function figTree() {
    const depts = [
      ["Design", 90],
      ["Games", 250],
      ["Web", 410],
    ];
    const ppl = [
      ["Ana", 44],
      ["Kai", 140],
      ["Raj", 250],
      ["Mia", 350],
      ["Zed", 440],
    ];
    let b = T(8, 18, "Each team lists the people who belong to it", { s: 12, c: "var(--text-dim)" });
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ].forEach(([d, p]) => (b += Ln(depts[d][1], 76, ppl[p][1], 168, "var(--line-2)", 3)));
    depts.forEach(
      ([n, x]) =>
        (b += R(x - 48, 40, 96, 36, { f: "var(--violet-dim)", st: "var(--violet)" }) + T(x, 63, n, { a: "middle" })),
    );
    ppl.forEach(
      ([n, x]) =>
        (b += PK(
          n.toLowerCase(),
          R(x - 38, 168, 76, 36, { f: "var(--blue-dim)", st: "var(--blue)" }) + T(x, 191, n, { a: "middle" }),
        )),
    );
    return svg(480, 222, b);
  }

  function figPrice() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      x0 = 30,
      dw = 60;
    let b = "";
    days.forEach((d, i) => {
      b += T(x0 + i * dw + dw / 2, 16, d, { a: "middle", s: 12, c: "var(--text-dim)" });
      b += Ln(x0 + i * dw, 24, x0 + i * dw, 186, "var(--line)", 1.5);
    });
    b += Ln(x0 + 7 * dw, 24, x0 + 7 * dw, 186, "var(--line)", 1.5);
    b += T(x0, 44, "Price of dried figs", { s: 12, c: "var(--text-dim)" });
    b +=
      R(x0, 52, 3 * dw, 30, { f: "var(--amber-dim)", st: "var(--amber)" }) +
      T(x0 + 1.5 * dw, 72, "4 per kg", { a: "middle" });
    b +=
      R(x0 + 3 * dw, 52, 4 * dw, 30, { f: "var(--teal-dim)", st: "var(--teal)" }) +
      T(x0 + 5 * dw, 72, "5 per kg", { a: "middle" });
    b += T(x0, 112, "Orders placed (each stores a copy)", { s: 12, c: "var(--text-dim)" });
    [
      [1, "Order #1", "figs, 4 per kg"],
      [4, "Order #2", "figs, 5 per kg"],
    ].forEach(([d, t, c]) => {
      const cx = x0 + d * dw + dw / 2;
      b +=
        R(cx - 62, 122, 124, 52, { f: "var(--panel)", st: "var(--blue)" }) +
        T(cx, 143, t, { a: "middle" }) +
        T(cx, 162, c, { a: "middle", s: 12, c: "var(--text-dim)" });
    });
    return svg(460, 190, b);
  }

  function figLookups() {
    const panels = [
      ["Normalised tables", ["users", "positions", "education", "contacts"], "amber"],
      ["JSON column", ["user row"], "teal"],
      ["Document", ["document"], "blue"],
    ];
    let b = T(8, 16, "Lookups needed to build ONE profile", { s: 12, c: "var(--text-dim)" });
    panels.forEach(([title, blocks, col], i) => {
      const x = 10 + i * 152,
        base = 196;
      b += R(x, 26, 140, 176, { f: "var(--panel-2)", st: "var(--line)" });
      b += T(x + 70, 46, title, { a: "middle", s: 12 });
      blocks.forEach((t, k) => {
        b +=
          R(x + 22, base - 30 - k * 34, 96, 28, { f: `var(--${col}-dim)`, st: `var(--${col})`, rx: 6 }) +
          T(x + 70, base - 11 - k * 34, t, { a: "middle", s: 12 });
      });
    });
    return svg(460, 210, b);
  }

  function figFlow() {
    const box = (x, y, w, h, lines, o = {}) =>
      R(x, y, w, h, { f: o.f || "var(--panel)", st: o.st || "var(--line-2)" }) +
      lines
        .map((t, i) => T(x + w / 2, y + h / 2 + 5 - (lines.length - 1) * 8 + i * 16, t, { a: "middle", s: 12 }))
        .join("");
    let b = box(130, 8, 220, 46, ["Do many records", "share this item?"], {
      f: "var(--violet-dim)",
      st: "var(--violet)",
    });
    b += arrow(160, 54, 85, 118, "var(--text-dim)", 2.5) + T(95, 84, "yes", { s: 12, c: "var(--text-dim)" });
    b += arrow(320, 54, 345, 98, "var(--text-dim)", 2.5) + T(345, 78, "no", { s: 12, c: "var(--text-dim)" });
    b += PK(
      "ref",
      box(10, 120, 150, 58, ["Its own record,", "parents point to it"], { f: "var(--amber-dim)", st: "var(--amber)" }),
    );
    b += box(235, 100, 225, 46, ["Is it read together with", "its parent almost every time?"], {
      f: "var(--violet-dim)",
      st: "var(--violet)",
    });
    b += arrow(290, 146, 245, 208, "var(--text-dim)", 2.5) + T(250, 176, "yes", { s: 12, c: "var(--text-dim)" });
    b += arrow(405, 146, 405, 208, "var(--text-dim)", 2.5) + T(412, 180, "no", { s: 12, c: "var(--text-dim)" });
    b += PK(
      "embed",
      box(165, 210, 150, 58, ["Embed it inside", "the parent document"], { f: "var(--teal-dim)", st: "var(--teal)" }),
    );
    b += PK(
      "link",
      box(335, 210, 130, 58, ["Its own record,", "linked by parent ID"], { f: "var(--blue-dim)", st: "var(--blue)" }),
    );
    return svg(480, 276, b);
  }

  B.add("ds-models", [
    {
      type: "pick",
      q: "A company stores each team's people as a list inside the team's own record. That nests neatly while every person belongs to one team. <b>Tap the person this nesting cannot store just once.</b>",
      fig: figTree(),
      a: "kai",
      why: "Kai sits under two teams, a many-to-many link. Nested inside both Design and Games, Kai's details would be copied twice and could drift apart. Everyone else has one parent, which is the one-to-many shape that documents nest well.",
    },
    {
      type: "multi",
      q: "A dried-fruit shop stores each order as a document that copies the product's name and price at the time of sale. Using the timeline, select all statements that are true.",
      fig: figPrice(),
      o: [
        "Order #1 still says 4, which is what that customer paid",
        "Copying the price into orders is a mistake: they should show the live price",
        "A report of Tuesday's takings stays right after the price rise",
        "If the product is renamed later, the copy in order #1 will not follow",
        "Order #2 would switch back to 4 if the price were cut again on Saturday",
      ],
      a: [0, 2, 3],
      why: "Orders are history, so a copy frozen at the time of sale is the point. The cost is that later edits do not reach the copies. Orders do not read the live price, so a Saturday cut changes nothing already stored.",
    },
    {
      type: "slider",
      q: "A page shows 25 profile cards, and each card is built on its own. Using the three panels, about how many lookups does the normalised-tables design need for the whole page?",
      fig: figLookups(),
      min: 0,
      max: 250,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " lookups",
      hint: "Count the blocks in the first panel, then multiply by 25.",
      why: "Four tables means four lookups for each profile: 4 × 25 = 100. The document design keeps a profile in one place, so it needs 25. Locality is the difference.",
    },
    {
      type: "pick",
      q: "A user's 30 saved search filters are shown only on a settings page, and the user document is large. Follow the flowchart for the filters. <b>Tap the box where the path ends.</b>",
      fig: figFlow(),
      a: "link",
      why: "Only this user has the filters, so they are not shared. They are rarely read with the user, so embedding would load them every time for nothing. Keeping them as their own linked record avoids that waste.",
    },
  ]);

  /* ================= ds-schema ================= */
  function figPresence() {
    const cols = ["id", "name", "email", "age", "city"],
      rows = [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0],
        [1, 1, 0, 1, 0],
        [1, 1, 1, 0, 1],
        [1, 1, 0, 0, 0],
        [1, 1, 1, 1, 0],
      ];
    let b = T(8, 18, "Which fields each of six sample documents has", { s: 12, c: "var(--text-dim)" });
    cols.forEach((c, i) => (b += T(96 + i * 72, 44, c, { a: "middle", m: true })));
    rows.forEach((r, j) => {
      b += T(10, 74 + j * 34, `doc ${j + 1}`, { s: 12, c: "var(--text-dim)" });
      r.forEach(
        (on, i) =>
          (b += on
            ? R(64 + i * 72, 54 + j * 34, 64, 28, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) +
              Circ(96 + i * 72, 68 + j * 34, 4.5, { f: "var(--blue)", st: "var(--blue)", sw: 1 })
            : R(64 + i * 72, 54 + j * 34, 64, 28, { f: "none", st: "var(--line-2)", d: "4 4", sw: 1.5, rx: 6 })),
      );
    });
    return svg(440, 266, b);
  }

  function figRolling() {
    const L = [
      [72, "App v1"],
      [240, "Database"],
      [408, "App v2"],
    ];
    const m = [
      { id: "m1", from: 0, to: 1, y: 74, label: "save Ada: {name}" },
      { id: "m2", from: 2, to: 1, y: 114, label: "save Cy: {first, last}" },
      { id: "m3", from: 0, to: 1, y: 154, label: "read Cy" },
      { id: "m4", from: 1, to: 0, y: 194, label: "Cy: {first, last}", d: "5 4" },
      { id: "m5", from: 2, to: 1, y: 234, label: "read Ada" },
      { id: "m6", from: 1, to: 2, y: 274, label: "Ada: {name}", d: "5 4" },
    ];
    return seq(480, 292, L, m, { pick: true });
  }

  function figBars() {
    const base = 214,
      k = 4; // 4 px per KB
    let b = "";
    [0, 10, 20, 30, 40].forEach((v) => {
      b +=
        Ln(70, base - v * k, 450, base - v * k, "var(--line)", 1.5) +
        T(62, base - v * k + 4, v, { a: "end", s: 11, c: "var(--text-dim)" });
    });
    b += T(8, 18, "KB read for one user", { s: 12, c: "var(--text-dim)" });
    b +=
      R(190, 6, 14, 14, { f: "var(--amber-dim)", st: "var(--amber)", rx: 3 }) + T(210, 18, "Document store", { s: 12 });
    b +=
      R(320, 6, 14, 14, { f: "var(--blue-dim)", st: "var(--blue)", rx: 3 }) +
      T(340, 18, "Normalised tables", { s: 12 });
    [
      [150, "Show the whole profile", 40, 40],
      [350, "Show just the name", 40, 1],
    ].forEach(([cx, t, d, n]) => {
      b +=
        R(cx - 48, base - d * k, 40, d * k, { f: "var(--amber-dim)", st: "var(--amber)", rx: 4 }) +
        T(cx - 28, base - d * k - 6, `${d} KB`, { a: "middle", s: 12 });
      b +=
        R(cx + 8, base - n * k, 40, n * k, { f: "var(--blue-dim)", st: "var(--blue)", rx: 2 }) +
        T(cx + 28, base - n * k - 6, `${n} KB`, { a: "middle", s: 12 });
      b += T(cx, base + 22, t, { a: "middle", s: 13 });
    });
    return svg(460, 240, b);
  }

  function figBackfill() {
    const rows = [
      ["1", "Ada Byte", "Ada", "Byte", ""],
      ["2", "Cy Dee", "Cy", "Dee", ""],
      ["3", "Eli Moss", "Eli", "Moss", ""],
      ["4", "Flo Park", null, null, ""],
      ["5", "Gus Lamb", null, null, ""],
      ["6", "Ivy Cole", "Ivy", "Cole", "written by v2"],
      ["7", "Jon Reed", null, null, "written by v1"],
    ];
    let b = T(8, 16, "Backfill copies name into first and last, in id order. It has done ids 1 to 3.", {
      s: 12,
      c: "var(--text-dim)",
    });
    [
      ["id", 18],
      ["name", 62],
      ["first", 196],
      ["last", 288],
      ["", 380],
    ].forEach(([t, x]) => (b += T(x, 44, t, { s: 12, m: true, c: "var(--text-dim)" })));
    rows.forEach(([id, nm, f, l, note], j) => {
      const y = 54 + j * 36;
      b += PK(
        `r${id}`,
        R(8, y, 464, 30, { f: "var(--panel)", st: "var(--line)", sw: 1.5, rx: 6 }) +
          T(18, y + 20, id, { m: true }) +
          T(62, y + 20, nm, { m: true, s: 12 }) +
          (f
            ? T(196, y + 20, f, { m: true, s: 12 }) + T(288, y + 20, l, { m: true, s: 12 })
            : T(196, y + 20, "NULL", { m: true, s: 12, c: "var(--text-faint)", w: 700 }) +
              T(288, y + 20, "NULL", { m: true, s: 12, c: "var(--text-faint)", w: 700 })) +
          T(380, y + 20, note, { s: 11, c: "var(--text-dim)" }),
      );
    });
    return svg(480, 314, b);
  }

  B.add("ds-schema", [
    {
      type: "mcq",
      q: "These six documents come from a schema-on-read collection. Every one has <code>name</code>. May the reading code skip its check for a missing <code>name</code> from now on?",
      fig: figPresence(),
      o: [
        "No: a later write is free to leave it out",
        "Yes: six out of six documents is enough to rely on",
        "Yes: the database validates each document on save",
        "Yes: a name field is always kept in a separate place",
      ],
      a: 0,
      why: "The grid shows what happens to exist today, not a rule. Without a schema, nothing stops tomorrow's document from missing a field, so the reader has to cope with that case itself.",
    },
    {
      type: "pick",
      q: "During a rolling update, old servers (v1) and new servers (v2) run together. v1 only understands <code>name</code>. v2 writes <code>first</code> and <code>last</code> but can still read old shapes. <b>Tap the message where something breaks.</b>",
      fig: figRolling(),
      a: "m4",
      why: "In message 4 the old v1 server reads a document that v2 wrote: no name field. With schema-on-read, every reader must cope with every shape, including the old code still running during the roll-out.",
    },
    {
      type: "slider",
      q: "The user list needs just the name of 50 users. Each profile document is 40 KB. Using the chart, about how many MB does the document store load for the list?",
      fig: figBars(),
      min: 0,
      max: 6,
      step: 0.5,
      ans: 2,
      tol: 0.5,
      unit: " MB",
      hint: "50 × 40 KB = 2,000 KB, and 1,000 KB is 1 MB.",
      why: "A document is loaded whole, so every user costs 40 KB even for one short field: 50 × 40 KB = 2,000 KB, about 2 MB. Tables would read around 50 KB. Locality is wasteful when you need a sliver.",
    },
    {
      type: "pick",
      q: "A relational table gets new <code>first</code> and <code>last</code> columns while the backfill job runs and both app versions keep writing. A new feature reads <code>first</code> straight from the table. <b>Tap every row that would give it NULL.</b>",
      fig: figBackfill(),
      a: ["r4", "r5", "r7"],
      why: "Rows 4 and 5 are still waiting for the backfill. Row 7 was written by the old app after the change, so nobody filled its new columns. Row 6 came from v2, which fills them. A migration is not finished until the old writers are gone too.",
    },
  ]);

  /* ================= ds-graph ================= */
  function figMatrix() {
    const P = ["A", "B", "C", "D", "E"],
      on = new Set(["A-B", "A-C", "B-A", "B-D", "C-D", "D-E", "E-D"]),
      x0 = 74,
      y0 = 62,
      s = 46;
    let b =
      T(8, 16, "Filled cell: the ROW person follows", { s: 12, c: "var(--text-dim)" }) +
      T(8, 34, "the COLUMN person", { s: 12, c: "var(--text-dim)" });
    P.forEach(
      (p, i) =>
        (b +=
          T(x0 + i * s + s / 2, y0 - 10, p, { a: "middle" }) + T(x0 - 18, y0 + i * s + s / 2 + 5, p, { a: "middle" })),
    );
    P.forEach((r, j) =>
      P.forEach((c, i) => {
        const id = `${r}-${c}`,
          x = x0 + i * s,
          y = y0 + j * s;
        b += on.has(id)
          ? PK(
              id,
              R(x + 2, y + 2, s - 4, s - 4, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) +
                Circ(x + s / 2, y + s / 2, 6, { f: "var(--blue)", st: "var(--blue)", sw: 1 }),
            )
          : R(x + 2, y + 2, s - 4, s - 4, { f: r === c ? "var(--line)" : "none", st: "var(--line)", sw: 1.5, rx: 6 });
      }),
    );
    return svg(340, 306, b);
  }

  function figRings() {
    const cum = [1, 7, 37, 187],
      k = 165 / Math.sqrt(187),
      cx = 170,
      cy = 180,
      r = cum.map((c) => k * Math.sqrt(c));
    let b = Circ(cx, cy, r[3], { f: "var(--violet-dim)", st: "var(--violet)", d: "6 6", sw: 2 });
    b +=
      Circ(cx, cy, r[2], { f: "var(--blue-dim)", st: "var(--blue)" }) +
      Circ(cx, cy, r[1], { f: "var(--teal-dim)", st: "var(--teal)" }) +
      Circ(cx, cy, r[0], { f: "var(--amber)", st: "var(--amber)", sw: 1 });
    [
      ["var(--amber)", "You", "the start"],
      ["var(--teal)", "Hop 1", "6 people"],
      ["var(--blue)", "Hop 2", "30 people"],
      ["var(--violet)", "Hop 3", "? people"],
    ].forEach(([c, t, s], i) => {
      b +=
        R(344, 40 + i * 62, 16, 16, { f: c, st: c, rx: 4 }) +
        T(366, 54 + i * 62, t, { s: 13 }) +
        T(366, 73 + i * 62, s, { s: 12, c: "var(--text-dim)" });
    });
    b += T(8, 18, "Areas show how many people are reached so far", { s: 12, c: "var(--text-dim)" });
    return svg(450, 360, b);
  }

  function figVenn() {
    const L = "M230,62.92 A90,90 0 1 0 230,197.08 A90,90 0 0 1 230,62.92 Z",
      Rr = "M230,62.92 A90,90 0 1 1 230,197.08 A90,90 0 0 0 230,62.92 Z",
      M = "M230,62.92 A90,90 0 0 0 230,197.08 A90,90 0 0 0 230,62.92 Z";
    const path = (d, f, st) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="2.5" stroke-linejoin="round"/>`;
    let b = T(170, 24, "Ana's friends", { a: "middle" }) + T(290, 24, "Ben's friends", { a: "middle" });
    b += PK(
      "ana",
      path(L, "var(--blue-dim)", "var(--blue)") +
        T(135, 122, "Eli", { a: "middle" }) +
        T(135, 150, "Flo", { a: "middle" }),
    );
    b += PK("ben", path(Rr, "var(--violet-dim)", "var(--violet)") + T(327, 136, "Gus", { a: "middle" }));
    b += PK(
      "both",
      path(M, "var(--teal-dim)", "var(--teal)") +
        T(230, 122, "Cy", { a: "middle" }) +
        T(230, 150, "Dee", { a: "middle" }),
    );
    return svg(340, 236, `<g transform="translate(-60,0)">${b}</g>`);
  }

  B.add("ds-graph", [
    {
      type: "pick",
      q: "The matrix records who follows whom. Two people <i>follow each other</i> when each one follows the other. <b>Tap every cell that belongs to a pair of mutual followers.</b>",
      fig: figMatrix(),
      a: ["A-B", "B-A", "D-E", "E-D"],
      why: "A follows B and B follows A, and D and E follow each other too: each pair fills two cells that mirror each other across the diagonal. A to C, B to D and C to D have no cell going back, so those follows are one-way.",
    },
    {
      type: "slider",
      q: "Each hop out from you reaches about 5 times as many new people as the hop before. Hop 1 reached 6 and hop 2 reached 30. About how many <b>new</b> people does hop 3 reach?",
      fig: figRings(),
      min: 0,
      max: 400,
      step: 10,
      ans: 150,
      tol: 30,
      unit: " people",
      hint: "6, then 30, then 30 × 5.",
      why: "The crowd multiplies at every hop: 6 × 5 = 30, and 30 × 5 = 150. A traversal is cheap for one or two hops, but the number of vertices it must touch grows fast, so deep traversals get costly.",
    },
    {
      type: "pick",
      q: "Ana wants to introduce friends of hers to Ben. The query is: <i>Ana's friends who are not yet friends with Ben.</i> <b>Tap the region the query returns.</b>",
      fig: figVenn(),
      a: "ana",
      why: "The query keeps Ana's friends and drops anyone Ben already knows. That is the left-hand crescent: Eli and Flo. Cy and Dee are in both circles, so they are already connected to Ben.",
    },
    {
      type: "bug",
      q: 'Friendships are mutual and each is stored once, as <code>(a, b)</code>. After <code>friends("ben")</code> the list holds only Cy, but Ana is Ben\'s friend too. Click the faulty line.',
      code: [
        'edges = [("ana", "ben"), ("ben", "cy")]',
        "def friends(v):",
        "    out = []",
        "    for a, b in edges:",
        "        if a == v:",
        "            out.append(b)",
        "    return out",
      ],
      a: 4,
      why: "The test only follows an edge from its first end. A mutual friendship has to be followed from either end: <code>if a == v</code> must also handle <code>b == v</code> and add <code>a</code>. Ana's edge starts at \"ana\", so Ben's lookup never sees her.",
    },
  ]);

  /* ================= ds-nosql ================= */
  function figHeat() {
    const hours = ["09:00 to 10:00", "10:00 to 11:00", "11:00 to 12:00", "12:00 to 13:00"];
    let b = T(8, 18, "Writes per second reaching each server (thousands)", { s: 12, c: "var(--text-dim)" });
    ["Server 1", "Server 2", "Server 3", "Server 4"].forEach(
      (s, i) => (b += T(180 + i * 70, 46, s, { a: "middle", s: 12 })),
    );
    hours.forEach((h, j) => {
      b += T(8, 76 + j * 44, h, { s: 12, c: "var(--text-dim)" });
      for (let i = 0; i < 4; i++) {
        const hot = i === j;
        b +=
          R(148 + i * 70, 54 + j * 44, 64, 38, {
            f: hot ? "var(--amber)" : "var(--amber-dim)",
            st: hot ? "var(--amber-ink)" : "var(--amber-edge)",
            rx: 6,
            sw: 1.5,
          }) + T(180 + i * 70, 78 + j * 44, hot ? "4.0" : "0.1", { a: "middle", c: hot ? "#fff" : "var(--amber-ink)" });
      }
    });
    return svg(440, 236, b);
  }

  function figReplicas() {
    const px = [60, 150, 240, 330, 420],
      sx = [75, 195, 315, 435],
      rep = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 2],
      ],
      down = new Set([0, 2]);
    let b = T(8, 14, "Each partition is stored on two servers", { s: 12, c: "var(--text-dim)" });
    rep.forEach(([a, c], p) =>
      [a, c].forEach((s) => (b += Ln(px[p], 60, sx[s], 178, down.has(s) ? "var(--rose-edge)" : "var(--line-2)", 2.5))),
    );
    px.forEach(
      (x, p) =>
        (b += PK(
          `P${p + 1}`,
          R(x - 35, 24, 70, 36, { f: "var(--violet-dim)", st: "var(--violet)" }) +
            T(x, 48, `P${p + 1}`, { a: "middle" }),
        )),
    );
    sx.forEach((x, s) => {
      b +=
        R(x - 45, 178, 90, 38, {
          f: down.has(s) ? "var(--rose-dim)" : "var(--teal-dim)",
          st: down.has(s) ? "var(--rose)" : "var(--teal)",
        }) +
        T(x, 201, `S${s + 1}${down.has(s) ? " down" : ""}`, {
          a: "middle",
          c: down.has(s) ? "var(--rose-ink)" : "var(--text)",
        });
    });
    return svg(480, 228, b);
  }

  function figScale() {
    const X = (x) => 56 + x * 40,
      Y = (c) => 250 - c * 18,
      up = (x) => 0.5 + 0.4 * x * x,
      out = (x) => 2 + x;
    let b = Ln(56, 250, 460, 250, "var(--text-dim)", 2) + Ln(56, 250, 56, 20, "var(--text-dim)", 2);
    b +=
      T(458, 272, "load handled", { a: "end", s: 12, c: "var(--text-dim)" }) +
      T(62, 16, "cost", { s: 12, c: "var(--text-dim)" });
    let pu = "";
    for (let x = 0; x <= 5.001; x += 0.25) pu += `${pu ? "L" : "M"}${X(x).toFixed(1)},${Y(up(x)).toFixed(1)}`;
    b += `<path d="${pu}" fill="none" stroke="var(--amber)" stroke-width="3.5" stroke-linecap="round"/>`;
    b += Ln(X(0), Y(out(0)), X(10), Y(out(10)), "var(--blue)", 3.5);
    b +=
      T(X(1.7), Y(up(1.7)) + 26, "one bigger machine", { s: 12, c: "var(--amber-ink)" }) +
      T(X(5.4), Y(out(5.4)) - 12, "more machines", { s: 12, c: "var(--blue-ink)" });
    [
      ["A", 0, up(0)],
      ["B", 3.5549, 5.5552],
      ["C", 5, up(5)],
      ["D", 8, out(8)],
    ].forEach(
      ([id, x, c]) =>
        (b += PK(
          id,
          Circ(X(x), Y(c), 14, { f: "var(--panel)", st: "var(--ink)" }) + T(X(x), Y(c) + 4.5, id, { a: "middle" }),
        )),
    );
    return svg(480, 284, b);
  }

  function figKeys() {
    const rows = [
      ["S-7", "09:00", "21.5", "88"],
      ["S-7", "09:15", "21.9", "87"],
      ["S-7", "09:30", "22.4", "87"],
      ["S-8", "09:00", "19.0", "42"],
      ["S-8", "09:15", "19.4", "42"],
    ];
    const th = (t, c, sub) =>
      `<th style="background:var(--${c}-dim);border-bottom:3px solid var(--${c})">${t}${sub ? `<div style="font:700 11px var(--sans);color:var(--text-dim)">${sub}</div>` : ""}</th>`;
    return `<table class="t" style="font-family:var(--mono);font-size:13px"><tr>${th("sensor", "amber", "partition key")}${th("time", "blue", "sort key")}<th>temp</th><th>battery %</th></tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  }

  B.add("ds-nosql", [
    {
      type: "mcq",
      q: "A table of sensor readings is split across four servers by one partition key. The grid shows the writes reaching each server, hour by hour. Which partition key fits this picture?",
      fig: figHeat(),
      o: [
        "The hour of the write, so each hour shares one partition",
        "The sensor ID, with thousands of sensors all writing evenly",
        "A random ID given to every reading as it arrives, to scatter them",
        "The building a sensor sits in, with four equally busy buildings",
      ],
      a: 0,
      why: "All of one hour's writes land on a single server while the others idle, and the hot spot moves on every hour. That is a time-based key. A sensor or random key spreads the load, and four busy buildings would keep every server steadily loaded.",
    },
    {
      type: "pick",
      q: "Each partition is stored on two servers, as the lines show. Servers S1 and S3 go down. <b>Tap the partition that can no longer be read.</b>",
      fig: figReplicas(),
      a: "P5",
      why: "P5 lived on S1 and S3, and both are down. Every other partition has a copy on S2 or S4. Keeping several copies on different servers is how a store stays available when machines fail.",
    },
    {
      type: "pick",
      q: "The chart compares what it costs to handle more load. Spreading across machines has a set-up cost but then grows steadily. <b>Tap the point where both options cost the same.</b>",
      fig: figScale(),
      a: "B",
      why: "B is where the lines cross: about 3.6 units of load. Below it one bigger machine is cheaper. Above it adding machines wins, and the big machine runs out at C, where D shows scaling out still going.",
    },
    {
      type: "match",
      q: "This table has partition key <code>sensor</code> and sort key <code>time</code>. Match each request to how the store finds the data.",
      fig: figKeys(),
      pairs: [
        ["S-7 readings from 09:00 to 09:30", "Go to one partition, read a slice in order"],
        ["S-7 reading at exactly 09:15", "Go to one partition, jump to one item"],
        ["Every sensor's reading at 09:15", "Ask every partition: time alone picks none"],
        ["S-7 and S-8 readings from 09:00 to 09:30", "Go to two partitions, read a slice from each"],
      ],
      why: "The partition key chooses where to look, and the sort key orders what is inside. A request that names the sensor stays within that partition. One that names only the time cannot pick a partition, so every partition has to be asked.",
    },
  ]);

  /* ================= ds-log ================= */
  function figInterleave() {
    const L = [
      [70, "Client 1"],
      [245, "Log file"],
      [420, "Client 2"],
    ];
    const m = [
      { id: "w1", from: 0, to: 1, y: 74, label: 'write "bike,"  (half)' },
      { id: "w2", from: 2, to: 1, y: 118, label: 'write "dock,7\\n"  (whole)' },
      { id: "w3", from: 0, to: 1, y: 162, label: 'write "5\\n"  (other half)' },
    ];
    const extra =
      T(6, 74, "1", { s: 12, c: "var(--text-dim)" }) +
      T(6, 118, "2", { s: 12, c: "var(--text-dim)" }) +
      T(6, 162, "3", { s: 12, c: "var(--text-dim)" });
    return seq(480, 186, L, m, { extra });
  }

  function figScatter() {
    const P = { A: [0.9, 0.08], B: [0.12, 0.9], C: [0.7, 0.18], D: [0.25, 0.75], E: [0.82, 0.25] };
    const X = (v) => 60 + v * 380,
      Y = (v) => 240 - v * 210;
    let b = Ln(60, 240, 450, 240, "var(--text-dim)", 2) + Ln(60, 240, 60, 20, "var(--text-dim)", 2);
    b +=
      Ln(X(0.5), 24, X(0.5), 240, "var(--line)", 1.5, "5 5") + Ln(60, Y(0.5), 440, Y(0.5), "var(--line)", 1.5, "5 5");
    b +=
      T(450, 262, "writes per second, low to high", { a: "end", s: 12, c: "var(--text-dim)" }) +
      T(66, 16, "rows read per query, few to many", { s: 12, c: "var(--text-dim)" });
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (b +=
          Circ(X(x), Y(y), 16, { f: "var(--blue-dim)", st: "var(--blue)" }) + T(X(x), Y(y) + 5, k, { a: "middle" })),
    );
    return svg(470, 274, b);
  }

  function figSnaps() {
    const panels = [
      ["P", 5, 6, ["dock=2", "dock=5", "dock: del"]],
      ["Q", 235, 6, []],
      ["R", 5, 120, ["dock=2"]],
      ["S", 235, 120, ["dock=2", "dock=5"]],
    ];
    let b = "";
    panels.forEach(([n, x, y, recs]) => {
      b +=
        R(x, y, 220, 104, { f: "var(--panel-2)", st: "var(--line)" }) +
        T(x + 12, y + 24, `Panel ${n}`, { s: 13 }) +
        T(x + 208, y + 24, `${recs.length} record${recs.length === 1 ? "" : "s"}`, {
          a: "end",
          s: 12,
          c: "var(--text-dim)",
        });
      recs.forEach((r, i) => {
        const dead = r.includes("del");
        b +=
          R(x + 8 + i * 70, y + 46, 66, 36, {
            f: dead ? "var(--rose-dim)" : "var(--panel)",
            st: dead ? "var(--rose)" : "var(--blue)",
            rx: 6,
          }) +
          T(x + 41 + i * 70, y + 69, r, { a: "middle", m: true, s: 10, c: dead ? "var(--rose-ink)" : "var(--text)" });
      });
      if (!recs.length) b += T(x + 110, y + 72, "empty file", { a: "middle", s: 13, c: "var(--text-faint)", w: 700 });
    });
    return svg(460, 232, b);
  }

  B.add("ds-log", [
    {
      type: "mcq",
      q: "Two clients append to the same log at once, and each record is sent in more than one write. Following the diagram, what goes wrong, and what is the usual fix?",
      fig: figInterleave(),
      o: [
        "Records are cut into broken lines; write each record as one uninterrupted append",
        "Both records are lost because the file is locked; retry the writes until it frees up",
        "Nothing: appends always land at the end, so each record stays whole and in order",
        "The second record overwrites the first; give every client a separate log file",
      ],
      a: 0,
      why: "The halves interleave, giving a line that reads bike,dock,7 and another that reads 5. Neither is a valid record. A log needs concurrency control so each record goes in as one uninterrupted append, for example through a single writer or a lock.",
    },
    {
      type: "cat",
      q: "Each dot is an application, placed by how many writes it makes per second and how many rows each of its reads must look at. Which kind of workload is each?",
      fig: figScatter(),
      buckets: ["Transactional (write-heavy)", "Analytics (read-heavy)"],
      items: [
        ["Dot A", 0],
        ["Dot B", 1],
        ["Dot C", 0],
        ["Dot D", 1],
        ["Dot E", 0],
      ],
      why: "A, C and E sit at many small writes with tiny reads, like payments or orders: transactional. B and D make few writes but scan huge amounts per read, like reports: analytics. The workload decides which storage engine fits.",
    },
    {
      type: "order",
      q: "A key <b>dock</b> is set twice, then deleted, then a compaction runs. These four snapshots of the log file were taken right after each of those events, but are shown in a mixed order. Put them in the order they were taken.",
      fig: figSnaps(),
      items: ["Panel R", "Panel S", "Panel P", "Panel Q"],
      why: "The first set adds one record (R) and the second adds another (S). The delete adds a tombstone line, so the file grows to three records (P). Only compaction removes lines, so the empty file (Q) comes last: a delete never erases anything by itself.",
    },
    {
      type: "bug",
      q: "Records are written as <code>key,value</code>. When a value such as <code>Reid, Mo</code> contains a comma, <code>get()</code> crashes. Click the faulty line.",
      code: [
        "def get(key):",
        "    last = None",
        '    for line in open("db.log"):',
        '        k, v = line.rstrip().split(",")',
        "        if k == key:",
        "            last = v",
        "    return last",
      ],
      a: 3,
      why: 'Splitting at every comma gives three pieces for that record, so the unpacking fails. The format is ambiguous. Split once (<code>split(",", 1)</code>) or use a binary format that stores lengths, which is one reason real logs prefer binary files.',
    },
  ]);

  /* ================= ds-hashidx ================= */
  function figTape() {
    const recs = [
        ["a", 14, "0"],
        ["b", 9, "14"],
        ["c", 12, "23"],
        ["d", 8, "35"],
      ],
      s = 8,
      x0 = 30;
    let b = T(8, 18, "Log file, drawn to scale (bytes)", { s: 12, c: "var(--text-dim)" }),
      x = x0;
    recs.forEach(([k, n, off], i) => {
      b +=
        R(x, 34, n * s, 48, { f: "var(--blue-dim)", st: "var(--blue)", rx: 4 }) +
        T(x + (n * s) / 2, 56, `key ${k}`, { a: "middle", s: 12 }) +
        T(x + (n * s) / 2, 73, `${n} B`, { a: "middle", s: 11, c: "var(--text-dim)", w: 700 });
      b += Ln(x, 82, x, 96, "var(--text-dim)", 2) + T(x, 112, off, { a: "middle", m: true, s: 12 });
      x += n * s;
    });
    b +=
      Ln(x, 82, x, 96, "var(--rose)", 2) +
      T(x, 112, "43", { a: "middle", m: true, s: 12, c: "var(--rose-ink)" }) +
      T(x, 130, "end of file", { a: "middle", s: 12, c: "var(--text-dim)" });
    b += T(8, 156, "Hash map in memory", { s: 12, c: "var(--text-dim)" });
    recs.forEach(
      ([k, , off], i) =>
        (b +=
          R(10 + i * 104, 166, 96, 34, { f: "var(--panel)", st: "var(--line-2)" }) +
          T(58 + i * 104, 188, `${k} → ${off}`, { a: "middle", m: true, s: 13 })),
    );
    return svg(440, 212, b);
  }

  function figSegMatrix() {
    const keys = ["a", "b", "c", "d", "e"],
      S = { 1: { a: 1, b: 2, c: 3, d: 4 }, 2: { b: 5, c: 6, e: 7 }, 3: { c: 8, e: 9 } },
      x0 = 64,
      cw = 118;
    let b = T(8, 16, "Compaction merges S1 and S2 only. S3 is newer and is left alone.", {
      s: 12,
      c: "var(--text-dim)",
    });
    ["S1 (oldest)", "S2", "S3 (newer)"].forEach(
      (t, i) => (b += T(x0 + i * cw + cw / 2, 44, t, { a: "middle", s: 12 })),
    );
    keys.forEach((k, j) => {
      b += T(24, 78 + j * 42, k, { a: "middle", m: true });
      [1, 2, 3].forEach((s, i) => {
        const v = S[s][k],
          x = x0 + i * cw + 4,
          y = 56 + j * 42;
        if (v == null) {
          b += R(x, y, cw - 8, 36, { f: "none", st: "var(--line)", d: "4 4", sw: 1.5, rx: 6 });
          return;
        }
        const cell =
          R(x, y, cw - 8, 36, {
            f: s === 3 ? "var(--panel-2)" : "var(--blue-dim)",
            st: s === 3 ? "var(--line-2)" : "var(--blue)",
            rx: 6,
          }) + T(x + (cw - 8) / 2, y + 23, `${k} = ${v}`, { a: "middle", m: true, s: 13 });
        b += s === 3 ? cell : PK(`S${s}${k}`, cell);
      });
    });
    return svg(430, 276, b);
  }

  function figGauge() {
    const cx = 230,
      cy = 176,
      r = 140,
      P = (f, rr = r) => {
        const t = Math.PI * (1 - f);
        return [(cx + rr * Math.cos(t)).toFixed(1), (cy - rr * Math.sin(t)).toFixed(1)];
      };
    const arc = (f0, f1, c) => {
      const a = P(f0),
        z = P(f1);
      return `<path d="M${a} A${r},${r} 0 0 1 ${z}" fill="none" stroke="${c}" stroke-width="26"/>`;
    };
    let b = arc(0, 0.7, "var(--teal)") + arc(0.7, 0.9, "var(--amber)") + arc(0.9, 1, "var(--rose)");
    const n = P(0.4, r - 30);
    b += Ln(cx, cy, n[0], n[1], "var(--ink)", 5) + Circ(cx, cy, 9, { f: "var(--ink)", st: "var(--ink)", sw: 1 });
    const l0 = P(0, r + 30),
      l5 = P(0.5, r + 22),
      l1 = P(1, r + 30);
    b +=
      T(l0[0], cy + 22, "0%", { a: "middle", s: 12 }) +
      T(l5[0], +l5[1] + 2, "50%", { a: "middle", s: 12 }) +
      T(l1[0], cy + 22, "100%", { a: "middle", s: 12 });
    b += T(cx, cy + 50, "Index memory used: 6.4 GB of the 16 GB set aside", { a: "middle", s: 13 });
    b += T(cx, cy + 70, "At 100% the hash map no longer fits in memory", { a: "middle", s: 12, c: "var(--text-dim)" });
    return svg(460, 262, b);
  }

  function figCrash() {
    const L = [
      [70, "Client"],
      [240, "Store (memory)"],
      [410, "Log (disk)"],
    ];
    const m = [
      { id: "c1", from: 0, to: 1, y: 74, label: "set(k, v)" },
      { id: "c2", from: 1, to: 2, y: 114, label: "append  k,v" },
      { id: "c3", from: 2, to: 1, y: 154, label: "saved at byte 90", d: "5 4" },
    ];
    let extra =
      R(40, 180, 400, 30, { f: "var(--rose-dim)", st: "var(--rose)", rx: 6 }) +
      T(240, 200, "power cut here", { a: "middle", c: "var(--rose-ink)" });
    extra +=
      R(150, 224, 180, 34, { f: "none", st: "var(--line-2)", d: "5 4", rx: 6 }) +
      T(240, 246, "map: k → 90  (never ran)", { a: "middle", s: 12, c: "var(--text-dim)", m: true });
    return seq(480, 270, L, m, { extra });
  }

  B.add("ds-hashidx", [
    {
      type: "mcq",
      q: "A new 11-byte record for key <b>a</b> is appended to this log. What does the hash map store for <b>a</b> afterwards?",
      fig: figTape(),
      o: ["0", "35", "43", "54"],
      a: 2,
      hint: "The old records fill 14 + 9 + 12 + 8 bytes. A new record starts where they end.",
      why: "The map holds the byte where the record <i>starts</i>. The file currently ends at 43 (14 + 9 + 12 + 8), so the new record begins there. The old record at 0 stays in the file until compaction, but nothing points to it any more.",
    },
    {
      type: "pick",
      q: "S1 and S2 are merged into one segment, keeping the newest value for each key <i>within those two</i>. Compaction does not look at S3. <b>Tap every record that is kept in the merged segment.</b>",
      fig: figSegMatrix(),
      a: ["S1a", "S1d", "S2b", "S2c", "S2e"],
      why: "Within S1 and S2 only b = 2 and c = 3 are overwritten (by 5 and 6), so they go. Records c = 6 and e = 7 stay even though S3 has newer values, because the merge never reads S3. The newer segment simply wins at read time.",
    },
    {
      type: "slider",
      q: "The keys will triple in number over the next year, and each key still needs the same memory. About what percentage of the 16 GB budget will the hash index need?",
      fig: figGauge(),
      min: 0,
      max: 200,
      step: 10,
      ans: 120,
      tol: 15,
      unit: "%",
      hint: "The gauge reads 40%. Triple it.",
      why: "6.4 GB is 40% of 16 GB, and 40% × 3 = 120%. The map would no longer fit in memory, which is the hash index's limit. Past that point you need a different design, such as sorted segments with a sparse index.",
    },
    {
      type: "mcq",
      q: "The power fails after the log append but before the in-memory map is updated. On restart the store rebuilds its map by replaying the log. What happens to this write?",
      fig: figCrash(),
      o: [
        "It is found, as replaying the log picks the record up",
        "It is lost, because the map never learnt that it existed",
        "It is half-applied, so the store must delete that record",
        "It is lost unless the client sends the same write again",
      ],
      a: 0,
      why: "The log is the source of truth and the map is only a shortcut that is rebuilt from it. A complete record that reached the disk comes back during the replay. Appending first and updating the map second is what makes this safe.",
    },
  ]);

  /* ================= ds-sstable ================= */
  function figStack() {
    const layers = [
      ["Memtable (memory)", ["m: deleted", "p = 4"], "violet", [0]],
      ["SSTable 3 (newest)", ["k = 2", "m = 9"], "blue"],
      ["SSTable 2", ["m = 7", "q = 1"], "blue"],
      ["SSTable 1 (oldest)", ["m = 3", "r = 5"], "blue"],
    ];
    let b = T(8, 16, "get(m) looks in the layers from the top down", { s: 12, c: "var(--text-dim)" });
    layers.forEach(([name, chips, col, dead], j) => {
      const y = 28 + j * 62;
      b += R(40, y, 430, 52, { f: `var(--${col}-dim)`, st: `var(--${col})` }) + T(52, y + 31, name, { s: 13 });
      chips.forEach((c, i) => {
        const x = 270 + i * 100,
          isDead = c.includes("deleted");
        b +=
          R(x, y + 8, 92, 36, {
            f: isDead ? "var(--rose-dim)" : "var(--panel)",
            st: isDead ? "var(--rose)" : "var(--line-2)",
            rx: 6,
          }) + T(x + 46, y + 31, c, { a: "middle", m: true, s: 12, c: isDead ? "var(--rose-ink)" : "var(--text)" });
      });
    });
    b += arrow(20, 40, 20, 262, "var(--text-dim)", 3);
    return svg(480, 284, b);
  }

  function figMergeTrace() {
    const A = ["a = 1", "c = 3", "e = 5", "g = 7"],
      Bn = ["c = 9", "d = 4", "g: deleted", "h = 2"],
      O = [
        ["a", "a = 1"],
        ["c", "c = 9"],
        ["d", "d = 4"],
        ["e", "e = 5"],
        ["g", "g = 7"],
        ["h", "h = 2"],
      ];
    let b = T(8, 18, "A and B are the two oldest segments. Nothing older exists.", { s: 12, c: "var(--text-dim)" });
    b +=
      T(60, 44, "A (older)", { a: "middle", s: 12 }) +
      T(190, 44, "B (newer)", { a: "middle", s: 12 }) +
      T(390, 44, "Merged output", { a: "middle", s: 12 });
    A.forEach(
      (t, i) =>
        (b +=
          R(8, 54 + i * 40, 104, 34, { f: "var(--panel)", st: "var(--line-2)", rx: 6 }) +
          T(60, 76 + i * 40, t, { a: "middle", m: true, s: 12 })),
    );
    Bn.forEach((t, i) => {
      const dead = t.includes("deleted");
      b +=
        R(136, 54 + i * 40, 108, 34, {
          f: dead ? "var(--rose-dim)" : "var(--panel)",
          st: dead ? "var(--rose)" : "var(--line-2)",
          rx: 6,
        }) + T(190, 76 + i * 40, t, { a: "middle", m: true, s: 12, c: dead ? "var(--rose-ink)" : "var(--text)" });
    });
    b += arrow(250, 140, 300, 140, "var(--text-dim)", 3);
    O.forEach(
      ([id, t], i) =>
        (b += PK(
          id,
          R(308, 54 + i * 40, 164, 34, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) +
            T(390, 76 + i * 40, t, { a: "middle", m: true, s: 12 }),
        )),
    );
    return svg(480, 300, b);
  }

  function figRuler() {
    const x0 = 110,
      cw = 14,
      X = (ch) => x0 + (ch.charCodeAt(0) - 97) * cw;
    let b = T(8, 18, "Key ranges covered by each file. The query asks for j to n.", { s: 12, c: "var(--text-dim)" });
    b += R(X("j"), 28, X("n") + cw - X("j"), 238, {
      f: "var(--amber-dim)",
      st: "var(--amber)",
      d: "5 4",
      rx: 4,
      sw: 1.5,
    });
    for (let i = 0; i < 26; i++) {
      const ch = String.fromCharCode(97 + i);
      b += T(x0 + i * cw + cw / 2, 46, ch, { a: "middle", m: true, s: 11, c: "var(--text-dim)", w: 700 });
    }
    const bars = [
      ["mem", "Memtable", "g", "r", "violet"],
      ["s1", "SSTable 1", "a", "m", "blue"],
      ["s2", "SSTable 2", "h", "t", "blue"],
      ["s3", "SSTable 3", "p", "z", "blue"],
      ["s4", "SSTable 4", "c", "e", "blue"],
    ];
    bars.forEach(([id, name, a, z, col], i) => {
      const y = 64 + i * 40,
        w = X(z) + cw - X(a);
      b +=
        T(8, y + 21, name, { s: 12 }) +
        PK(
          id,
          R(X(a), y, w, 30, { f: `var(--${col}-dim)`, st: `var(--${col})`, rx: 6 }) +
            T(X(a) + w / 2, y + 20, `${a}–${z}`, { a: "middle", s: 12, m: true }),
        );
    });
    return svg(480, 278, b);
  }

  function figSteps() {
    const X = (t) => 56 + t * 6.7,
      Y = (n) => 240 - n * 33;
    const ev = [
      [0, 0],
      [5, 1],
      [10, 2],
      [15, 3],
      [20, 4],
      [25, 5],
      [30, 1],
      [35, 2],
      [40, 3],
      [45, 4],
      [50, 1],
      [55, 2],
      [60, 2],
    ];
    let b = Ln(56, 240, 462, 240, "var(--text-dim)", 2) + Ln(56, 240, 56, 24, "var(--text-dim)", 2);
    [0, 2, 4, 6].forEach(
      (n) =>
        (b +=
          Ln(56, Y(n), 462, Y(n), "var(--line)", 1.2) + T(48, Y(n) + 4, n, { a: "end", s: 11, c: "var(--text-dim)" })),
    );
    [0, 20, 40, 60].forEach((t) => (b += T(X(t), 258, t, { a: "middle", s: 11, c: "var(--text-dim)" })));
    b +=
      T(462, 276, "minutes", { a: "end", s: 12, c: "var(--text-dim)" }) +
      T(62, 16, "SSTables on disk", { s: 12, c: "var(--text-dim)" });
    let d = `M${X(0)},${Y(0)}`;
    for (let i = 1; i < ev.length; i++) d += `L${X(ev[i][0])},${Y(ev[i - 1][1])}L${X(ev[i][0])},${Y(ev[i][1])}`;
    b += `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    [
      ["A", 12, 2],
      ["B", 28, 5],
      ["C", 33, 1],
      ["D", 48, 4],
      ["E", 58, 2],
    ].forEach(
      ([id, t, n]) =>
        (b += PK(
          id,
          Circ(X(t), Y(n) - 16, 13, { f: "var(--panel)", st: "var(--ink)" }) +
            T(X(t), Y(n) - 11.5, id, { a: "middle", s: 12 }),
        )),
    );
    return svg(480, 284, b);
  }

  B.add("ds-sstable", [
    {
      type: "mcq",
      q: "A store holds the layers below. A client deleted <b>m</b> recently. What does <code>get(m)</code> return?",
      fig: figStack(),
      o: [
        "Not found: the top layer to mention m says deleted",
        "9, because it is the newest value that m has on disk",
        "3, because the oldest segment holds the original value",
        "An error, because m appears in several layers at once",
      ],
      a: 0,
      why: "A read stops at the first layer that mentions the key, going from newest to oldest. Here that is the memtable's tombstone, so the answer is not found. The older values (9, 7 and 3) are still on disk until a merge discards them.",
    },
    {
      type: "pick",
      q: "A merge of the two oldest segments produced the output below. One output record is wrong. <b>Tap it.</b>",
      fig: figMergeTrace(),
      a: "g",
      why: "B deleted g, and no older segment exists, so the merge should drop g completely. Keeping g = 7 brings a deleted key back to life. The other five records are right: the newer c = 9 wins and the output stays sorted.",
    },
    {
      type: "pick",
      q: "Each segment is sorted, but each covers its own overlapping range of keys. A range query asks for keys j to n. <b>Tap every file the query must read.</b>",
      fig: figRuler(),
      a: ["mem", "s1", "s2"],
      why: "Any file whose range overlaps j to n may hold such keys, including the memtable. Segments from different flushes overlap, so a range scan has to read from several and merge the results. SSTable 3 (p to z) and SSTable 4 (c to e) cannot hold keys between j and n.",
    },
    {
      type: "pick",
      q: "A read for a key that does not exist must check the memtable and every SSTable on disk. The chart shows the number of SSTables over time as flushes add files and merges remove them. <b>Tap the moment such a read is slowest.</b>",
      fig: figSteps(),
      a: "B",
      why: "Each flush adds a file and each merge collapses them. Just before the first merge, at B, there are five files, so a missing-key read has the most places to look. After a merge, at C, only one is left. Merging keeps reads cheap.",
    },
  ]);
})();
