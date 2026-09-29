/* Data Science revision bank, part 2 (revision mode only). Concepts only, no SQL syntax, no calculator needed. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("ds-why", [
    M("Before the web took off, a company's data typically lived…", ["across thousands of cheap servers in several data centres", "on one big server, in a relational database", "in an in-memory cache only", "on employees' own computers"], 1, "The mainframe era: one machine, fixed schema."),
    M("\"Dynamically generated content\" means…", ["pages are printed out on demand for each visitor", "each page is built on the fly per request", "pages never change once written", "content is cached forever"], 1, "Every visit can trigger fresh work on the server."),
    M("A warehouse app shows stock counts. During a network split, one copy says 3 left, another says 0. Which choice favours consistency?", ["Show 3 left and sell immediately", "Refuse the order until the copies agree", "Show 0 and cancel all orders", "Show both numbers to the customer"], 1, "Consistency means never acting on possibly-wrong data."),
    TF("One server is enough for a global app with millions of users.", false, "Availability, scalability and maintenance all break at that scale."),
    M("You add a second database server. What new problem appears?", ["None: two servers just double capacity", "Keeping the two copies in sync", "It can no longer store large data", "Users can no longer log in"], 1, "Copies can disagree."),
    M("Why is maintenance hard on a single server?", ["It isn't: one server is the easiest thing to maintain", "Upgrades or repairs take the whole service offline", "It has no disk to install updates on", "It can't run software updates at all"], 1, "No spare machine to carry the load meanwhile."),
    { type: "cat", q: "Which single-server limitation is this?", buckets: ["Availability", "Scalability", "Maintenance"],
      items: [["A power cut takes the whole site down", 0], ["Black Friday traffic exceeds what one machine can handle", 1], ["Installing a security patch requires a 2-hour outage", 2]],
      why: "Down, too small, or hard to change." },
    M("\"Commodity computers\" are…", ["supercomputers built for one specialised task", "ordinary, cheap, widely available machines", "mainframes shared by many users", "phones and tablets"], 1, "The building blocks of scaling out."),
    M("The lecture's second trade-off is between…", ["the speed and the colour of the hardware", "one powerful system vs many cheap computers", "SQL vs NoSQL databases", "a cache vs an index"], 1, "Big box vs many boxes."),
    M("A \"stale read\" is…", ["a read that fails with an error", "reading data that's slightly out of date", "a query that runs very slowly", "reading a record that was deleted"], 1, "The price of choosing availability."),
  ]);
  B.add("ds-blocks", [
    M("A cache \"hit\" means…", ["the cache had to fetch from the database", "the requested result was already in the cache", "the cached data had expired", "the cache ran out of space"], 1, "Hits are fast; misses fall back to the slow path."),
    M("Which is a batch-processing job?", ["Answering a user's search request as they type", "Nightly recomputing of recommendations", "Serving a page straight from the cache", "Logging a user in"], 1, "Large, periodic, not interactive."),
    M("What's the trade-off of adding an index?", ["None: indexes are free once they're built", "Faster lookups, but more storage and slower writes", "Slower reads, but faster writes", "Less storage, but slower lookups"], 1, "Every write also updates the index."),
    TF("Adding an index speeds up writes.", false, "Writes get slightly slower; reads get faster."),
    { type: "cat", q: "An online shop. Which block handles each job?", buckets: ["Database", "Cache", "Search index", "Batch job"],
      items: [["Store every order permanently", 0], ["Keep recently viewed products ready for instant display", 1], ["Search products by keyword", 2], ["Produce the monthly sales report", 3]],
      why: "Durable storage, fast repeats, keyword lookup, periodic crunching." },
    M("A cache has room for only a few items. What should it keep?", ["The oldest items, since they've proven useful the longest", "The most frequently or recently used items", "A random selection of items", "Nothing: caches should stay empty"], 1, "Keep the hot items close."),
    M("The cache goes down but the database is fine. What happens?", ["Data in the cache is lost for good", "The app still works, just slower", "Nothing changes at all", "The database fails too"], 1, "A cache is an accelerator, not the source of truth."),
    M("\"Same building block, different implementations\" means…", ["All databases work the same way under the hood, whatever the data", "The right implementation depends on the problem", "Only one kind of index exists", "A cache is just a kind of database"], 1, "Choose by the kind of question you ask."),
    M("Without an index, the time to find a record grows…", ["not at all, because records are stored in order", "in proportion to the amount of data (a full scan)", "logarithmically", "exponentially"], 1, "Check every record."),
    M("Batch processing vs real-time: the batch job's result is typically…", ["instant, like any other query on the database", "available after the job runs (e.g. next morning)", "never available to users", "usually wrong"], 1, "Batch trades freshness for efficiency."),
  ]);
  B.add("ds-reliability", [
    { type: "multi", q: "According to the lecture, a reliable application… (select all)", o: ["performs the function the user expected", "tolerates user mistakes", "performs well enough under expected load", "prevents unauthorised access", "never has any faults"], a: [0, 1, 2, 3],
      why: "Faults will happen; reliability is about coping with them." },
    M("What's the goal of fault tolerance?", ["Eliminate every fault before it can ever happen", "Stop faults from turning into failures", "Hide faults from engineers", "Detect faults faster"], 1, "Faults are inevitable; failures shouldn't be."),
    M("What does RAID do for disks?", ["Speeds up the CPU by spreading work across disks", "Stores data redundantly so a dead disk loses nothing", "Encrypts everything on disk", "Compresses data to save space"], 1, "Classic hardware redundancy."),
    TF("A fault and a failure are the same thing.", false, "A fault is one component misbehaving; a failure is the whole service stopping."),
    M("Which is a correlated software fault?", ["One disk dies of old age in a single server", "A bug triggered by the same date everywhere", "A single power supply fails", "One network cable is cut"], 1, "Same code, same bug, everywhere at once."),
    M("How can a system reduce damage from human (operator) mistakes?", ["Remove humans from operations entirely", "Easy rollback, safe sandboxes and clear interfaces", "Hide errors so operators aren't distracted", "Disable logging to reduce noise"], 1, "Make mistakes cheap to undo."),
    M("Why should an app tolerate users entering unexpected input?", ["It shouldn't: users must follow the rules", "Users will do it, and the app should keep working", "To collect more data about users", "Because it makes the app faster"], 1, "Part of the lecture's definition of reliable."),
    M("A cascading failure is…", ["one fault that is quickly contained", "one node failing overloads others", "a planned shutdown of every node", "a burst of cache misses"], 1, "The domino effect."),
    M("Which is an example of redundancy?", ["One very reliable, expensive power supply", "Two power supplies, either able to run it", "Deleting old backups to save space", "A single high-quality network cable"], 1, "A spare takes over when one fails."),
    { type: "cat", q: "Hardware, software or human fault?", buckets: ["Hardware", "Software", "Human"],
      items: [["An admin deletes the wrong folder", 2], ["A memory module fails", 0], ["A leap-second bug crashes every node", 1]],
      why: "Three different sources, each needing different defences." },
  ]);
  B.add("ds-load", [
    M("p50 is another name for…", ["the mean", "the median", "the maximum", "the minimum"], 1, "Half of requests are faster, half slower."),
    M("Why do companies care about p99, not just the median?", ["It's easier to compute than the median on large logs", "The slowest requests often hit the most valuable users", "It's always lower than the median", "It's required by law"], 1, "Tail latency hits the heaviest users."),
    M("Throughput is…", ["time taken per request", "work done per unit time (e.g. records per second)", "memory used per request", "number of active users"], 1, "Batch systems care about throughput."),
    TF("An average response time of 200 ms means most users see about 200 ms.", false, "A few very slow requests can pull the mean far above what most users see."),
    M("For Twitter, which are sensible load parameters?", ["Screen sizes of users' devices", "Tweets posted and timelines read per second", "Number of servers in the data centre", "Font size of the timeline"], 1, "Numbers that stress the system."),
    M("1,000 requests, p99 = 800 ms. How many requests took longer than 800 ms?", ["about 1", "about 10", "about 100", "about 990"], 1, "1% of 1,000."),
    M("A page makes 5 backend calls in parallel and waits for all of them. What decides its speed?", ["The fastest call", "The slowest call", "The average call", "The first call"], 1, "Tail latency amplification."),
    M("Why run a load test?", ["To stress-test the office Wi-Fi and network cabling", "To see how performance changes as load grows", "To clear out old data", "To reduce storage costs"], 1, "Measure before it matters."),
    { type: "cat", q: "Which performance measure matters most?", buckets: ["Response time", "Throughput"],
      items: [["A checkout page", 0], ["An overnight job processing all of yesterday's logs", 1], ["A search box", 0], ["Training a model on a big dataset", 1]],
      why: "Interactive: response time. Batch: throughput." },
    M("\"Keep the system the same and increase load\" asks…", ["how many machines to buy", "how performance changes", "how to delete data", "how to add features"], 1, "The other question fixes performance and asks about resources."),
  ]);
  B.add("ds-twitter", [
    M("Twitter (2012): about 4.6k tweets/s vs 300k timeline reads/s. Roughly how many times more reads?", ["about 6×", "about 65×", "about 650×", "equal"], 1, "300 / 4.6 ≈ 65."),
    M("Average tweet goes to about 75 followers, at 4.6k tweets/s. Fan-out writes per second?", ["about 4,600", "about 35,000", "about 345,000", "about 3.4 million"], 2, "4,600 × 75 = 345,000."),
    M("In approach 1, where are new tweets stored?", ["In each follower's timeline", "In one global collection", "In the user's browser", "Nowhere"], 1, "Write once, merge on read."),
    M("In approach 2, what drives the cost of posting?", ["The length of the tweet", "How many followers the poster has", "The time of day it's posted", "The number of hashtags used"], 1, "One copy per follower."),
    TF("Fan-out on write makes posting slower but reading faster.", true, "Work moves from read time to write time."),
    M("A user with 30 million followers posts. At 345k writes/s, fan-out takes roughly…", ["1 second", "9 seconds", "87 seconds", "15 minutes"], 2, "30,000,000 / 345,000 ≈ 87 s."),
    M("Twitter aimed to deliver tweets to followers within…", ["5 seconds", "5 minutes", "1 hour", "1 day"], 0, "The celebrity fan-out blew past that target."),
    M("Downside of fan-out on write besides posting cost?", ["None", "Storage", "Reads get slower", "Tweets get shorter"], 1, "Millions of copies of popular posts."),
    M("Which load parameter turned out to matter most for Twitter's design?", ["The average length of a tweet", "The distribution of followers per user", "The number of hashtags per tweet", "The size of attached images"], 1, "A few huge accounts break the average-case design."),
    M("In the hybrid, which users are fanned out on write?", ["Celebrities with millions of followers", "Most ordinary users", "Nobody: everything is merged on read", "Everyone, including celebrities"], 1, "Best of both approaches."),
  ]);
  B.add("ds-scaling", [
    M("Vertical scaling is another name for…", ["scaling out", "scaling up", "caching", "indexing"], 1, "Bigger machine."),
    M("Horizontal scaling is another name for…", ["scaling up", "scaling out", "batch processing", "sharding a cache"], 1, "More machines."),
    M("A shared-memory architecture corresponds to…", ["scaling up (one big box)", "scaling out (many boxes)", "no scaling at all", "adding a cache layer"], 0, "Everything in one machine."),
    TF("Scaling out gives better fault tolerance than scaling up.", true, "One machine failing doesn't stop the others."),
    M("\"Elasticity\" means…", ["machines physically stretching to fit more parts", "adding or removing machines automatically as load changes", "swapping in a bigger disk when it fills", "queries slowing down gracefully under load"], 1, "Common in cloud systems that scale out."),
    M("A \"partial failure\" is…", ["a complete outage of the whole system at once", "some parts failing while others keep working", "a single query that runs slowly", "a bug in the user interface"], 1, "A problem that only exists in distributed systems."),
    M("Why don't big machines scale cost-effectively?", ["They do: cost grows roughly in line with the power you buy", "Cost outgrows capacity, and there's a size limit", "They're cheaper per unit of power than small machines", "They use less electricity overall"], 1, "Superlinear pricing plus a ceiling."),
    { type: "cat", q: "Scale up or scale out?", buckets: ["Scale up", "Scale out"],
      items: [["Upgrade from 16 GB to 512 GB of RAM", 0], ["Run 20 web servers behind a load balancer", 1], ["Replace the CPU with a faster one", 0], ["Split users across several databases", 1]],
      why: "Bigger box vs more boxes." },
    M("Main cost of scaling out?", ["Nothing: it's strictly better", "Coordination and consistency between machines", "Losing all fault tolerance", "Paying more for each individual machine"], 1, "Complexity is the price."),
    M("Which service is easiest to scale out?", ["One holding lots of in-memory state", "A stateless web server", "A single master database", "A mainframe"], 1, "No state to keep in sync."),
  ]);
  B.add("ds-maintain", [
    { type: "order", q: "Name the three parts of maintainability, in the lecture's order.", items: ["Operability", "Simplicity", "Evolvability"], why: "Easy to run, easy to understand, easy to change." },
    M("Operability is mainly about…", ["how fast the code runs on each individual request", "making life easy for the team running it", "how quickly new features can be shipped to users", "how the user interface looks"], 1, "Good ops support."),
    M("Simplicity is achieved by…", ["removing features users rarely need", "removing accidental complexity", "splitting into more services", "rewriting everything from scratch"], 1, "Keep the essential, drop the incidental."),
    M("Evolvability is…", ["how quickly the system starts up after a restart", "how easily it can be changed for new needs", "how many users the system can hold at once", "how thoroughly the system is monitored"], 1, "Change is inevitable."),
    TF("Most of a software system's cost comes from building the first version.", false, "Ongoing maintenance dominates."),
    M("Why are legacy systems painful?", ["They use technology that's too new", "Hard to understand and risky to change", "They run too fast to monitor", "They no longer have any users"], 1, "Low maintainability in practice."),
    M("Which is an example of good abstraction?", ["Copy-pasting the same code everywhere", "A clean interface that hides messy details", "Scripts that only one person understands", "Values hard-coded throughout the code"], 1, "Users of it don't need the details."),
    { type: "cat", q: "Which part of maintainability does this help most?", buckets: ["Operability", "Simplicity", "Evolvability"],
      items: [["Health dashboards and alerts", 0], ["Deleting an unused layer of indirection", 1], ["Loosely coupled modules that can be swapped out", 2]],
      why: "Run it, understand it, change it." },
    M("\"Predictable behaviour\" helps operators because…", ["it makes the system run faster under heavy load", "fewer surprises: fewer emergencies, easier fixes", "it removes the need for logs and dashboards", "it adds new features automatically"], 1, "Surprises are expensive."),
    M("\"Support for automation\" means…", ["no humans are ever needed to run it again", "routine tasks can be scripted with standard tools", "every deploy is done carefully by hand", "the system behaves randomly"], 1, "Part of operability."),
  ]);
})();
