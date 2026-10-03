(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
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
