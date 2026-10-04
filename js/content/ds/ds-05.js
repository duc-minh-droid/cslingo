(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});
  const { box, table } = partScope;
  const N = NIC;
  const L = N.LESSONS;
  L["ds-twitter"] = {
    sum: "Twitter's timelines: do the work when someone <b>posts</b>, or when someone <b>reads</b>? Reads are far more common, so do it on write, except for celebrities.",
    steps: [
      {
        t: "Two operations, very different load",
        b: `<p>Twitter, November 2012:</p>`,
        v:
          table(
            ["Operation", "Load"],
            [
              ["Post tweet", "4.6k requests/sec on average, 12k+ at peak"],
              ["Home timeline (view tweets from people you follow)", "<b>300k</b> requests/sec"],
            ],
          ) +
          `<p class="dim" style="margin-top:8px">The hard part is <b>fan-out</b>: each user follows many people, and is followed by many people.</p>`,
      },
      {
        t: "Approach 1: merge when you read",
        b: `<p>Posting just inserts the tweet into one <b>global collection</b> (1 write). Opening your timeline means: look up everyone you follow, fetch each one's tweets, and <b>merge</b> them by time.</p><span class="analogy">Every morning you visit each friend's house to see what they've written. Easy for them, lots of travel for you, every single time.</span>`,
      },
      {
        t: "Approach 2: fan out when you write",
        b: `<p>Keep a <b>timeline cache</b> (a mailbox) for every user. When someone posts, look up their followers and <b>insert the tweet into each follower's mailbox</b>. Reading your timeline = just open your mailbox.</p><span class="analogy">Your friends post a copy to every one of their followers. More work for them, but you just open your letterbox.</span>`,
        c: {
          type: "match",
          q: "One user posts one tweet. Match each case to the <b>number of writes</b> it causes.",
          pairs: [
            ["Approach 1, any user", "1 write"],
            ["Approach 2, a user with 30 followers", "30 writes"],
            ["Approach 2, a user with 200 followers", "200 writes"],
            ["Approach 2, a celebrity with 30 million followers", "30 million writes"],
          ],
          hint: "Approach 1 inserts the tweet once. Approach 2 inserts one copy per follower.",
          why: "Approach 1 inserts one tweet into a global collection. Approach 2 writes one copy into each follower's timeline cache, so the writes equal the follower count. That's why celebrities are the problem.",
        },
      },
      {
        t: "Why Twitter chose approach 2",
        b: `<p>Approach 1 couldn't keep up with timeline reads, which happen <b>about two orders of magnitude</b> more often than posts (300k vs 4.6k). So Twitter moved the work to write time.</p><span class="key">Average ~75 followers per tweet: 4.6k tweets/s × 75 = <b>345k writes/s</b> to timeline caches. Big, but manageable, and reads become cheap.</span>`,
      },
      {
        t: "The celebrity problem → hybrid",
        b: `<p>A user with <b>30 million</b> followers posts: approach 2 means 30 million writes for one tweet. Twitter aims to deliver tweets within <b>5 seconds</b>, and that's too slow.</p><p>So: <b>approach 2 for most users, approach 1 for users with huge follower counts</b>. Their tweets are fetched and merged in when you read.</p>`,
        c: {
          q: "Which is the hybrid?",
          o: ["Everyone uses approach 1", "Most users use fan-out on write", "Celebrities use fan-out on write"],
          a: 1,
          why: "Fan-out is too expensive for celebrities, so theirs are merged at read time.",
        },
      },
    ],
    guide: [
      "Keep <b>Approach 1</b>. Post a few tweets as different users, then open Cat's timeline. Watch the Writes and Reads counters.",
      "Switch to <b>Approach 2</b> and do the same. Posting as Cat now writes to 5 mailboxes (Cat has 5 followers).",
      "In the scale calculator, check the slide's number: 4.6k × 75 = 345k writes/s.",
      "Tick the <b>celebrity</b> box to see why the hybrid exists.",
    ],
  };
  L["ds-scaling"] = {
    sum: "<b>Scale up</b>: buy a bigger machine. <b>Scale out</b>: add more cheap machines. They differ in cost and in what happens when one breaks.",
    steps: [
      {
        t: "Vertical scaling (scaling up)",
        b: `<p>Replace your server with a <b>more powerful one</b>: more CPUs, RAM, disk. Also called a <b>shared-memory</b> architecture (everything in one box).</p><span class="analogy">Your van is too small, so you buy a lorry.</span>`,
      },
      {
        t: "The catch with scaling up",
        b: `<p>① <b>Costs don't scale linearly</b>: a machine twice as powerful costs <i>much more</i> than twice as much, and eventually there's no bigger machine to buy.<br>② <b>Limited fault tolerance</b>: it's still one machine. If it dies, you're down.</p>`,
      },
      {
        t: "Horizontal scaling (scaling out)",
        b: `<p>Add <b>more ordinary machines</b> and spread the work across them. Also called <b>shared-nothing</b> (each machine has its own CPU, memory and disk).</p><span class="analogy">Instead of a lorry, you run a fleet of vans. If one breaks down, the others keep delivering.</span>`,
        c: {
          type: "cat",
          q: "Does each description fit <b>scaling up</b> or <b>scaling out</b>?",
          buckets: ["Scaling up", "Scaling out"],
          items: [
            ["A shared-memory machine: everything in one box", 0],
            ["Ordinary machines, each with its own CPU, memory and disk", 1],
            ["Losing one machine only removes a slice of capacity", 1],
            ["If the single machine dies, the whole system is down", 0],
          ],
          hint: "Think about what happens to the service when one machine breaks.",
          why: "Scaling out has better fault tolerance: losing one of many machines only removes a slice of capacity. Scaling up keeps everything on one machine, which is still a single point of failure.",
        },
      },
      {
        t: "Costs scale better, but it's harder to coordinate",
        b: `<p>Scaling out: <b>costs can scale better</b> (commodity hardware) and <b>fault tolerance is better</b>. The price is complexity: machines must coordinate, stay consistent, and handle partial failures. That's the consistency trade-off from 1.1.</p>`,
      },
    ],
    guide: [
      "Drag <b>Capacity needed</b> from 1× to 40×. Watch both costs and the cost curves.",
      "Past 32× the single machine doesn't exist at all.",
      "Click the big machine to break it, then click a few small machines. Compare the capacity left.",
    ],
  };
  L["ds-maintain"] = {
    sum: "Most of a system's cost comes <b>after</b> it's built. Maintainable = easy to <b>run</b>, easy to <b>understand</b>, easy to <b>change</b>.",
    steps: [
      {
        t: "What maintainability means",
        b: `<p>The <b>overall cost to keep a system operational and up to date</b>. It has three parts:</p>`,
        v: `<div class="mini-row">${box("Operability", "easy to keep running", "var(--teal)")}${box("Simplicity", "easy to understand", "var(--violet)")}${box("Evolvability", "easy to change", "var(--amber)")}</div>`,
      },
      {
        t: "Operability: easy for the ops team",
        b: `<p>✓ visibility into what's happening (<b>good monitoring</b>)<br>✓ support for <b>automation</b> and standard tools<br>✓ <b>no dependency on individual machines</b><br>✓ <b>predictable</b> behaviour, with minimal surprises</p>`,
      },
      {
        t: "Simplicity: easy for new people",
        b: `<p>Simpler doesn't mean fewer features. It means removing <b>accidental complexity</b>: complexity that isn't part of the problem and only comes from <i>how</i> it was built (inconsistent architecture, obscure dependencies, poor style or docs).</p><p><b>Abstraction</b> is often the best tool: hide messy details behind a clean interface.</p>`,
        c: {
          type: "cat",
          q: "Is each source of complexity <b>essential</b> (part of the problem) or <b>accidental</b> (self-inflicted)?",
          buckets: ["Essential", "Accidental"],
          items: [
            ["The tax rules a payroll system is legally required to follow", 0],
            ["Five services wired differently to one database", 1],
            ["The need to store every user's personal data securely", 0],
            ["Obscure dependencies that nobody documented", 1],
          ],
          hint: "Would the complexity still be there if the system were built as cleanly as possible?",
          why: "Tax rules and security are essential: they are part of the problem itself. Inconsistent wiring and undocumented dependencies only come from how the system was built.",
        },
      },
      {
        t: "Evolvability: easy to change",
        b: `<p>How easily engineers can modify the system: new requirements, increased load. It's <b>closely linked to simplicity and good abstractions</b>. If it's easy to understand, it's easy to change safely.</p>`,
        c: {
          q: "Good abstractions mainly help…",
          o: [
            "operability only, since they don't change the design",
            "simplicity and evolvability",
            "neither of them: abstractions add layers and complexity",
          ],
          a: 1,
          why: "They hide complexity (simplicity), and changes stay inside one component (evolvability).",
        },
      },
    ],
    guide: [
      "Look at the tangled architecture and count the connections (20).",
      'Press <b>Change: replace "Orders DB"</b>: red shows everything that must be edited.',
      "Press <b>Add a data-access layer</b>, then run the same change again.",
      "Sort the 9 statements into operability, simplicity or evolvability.",
    ],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => {
    if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v;
  };
  const dots = (n, cols, bad = [], c = "var(--teal)") =>
    `<svg class="fig" viewBox="0 0 ${cols * 14 + 4} ${Math.ceil(n / cols) * 14 + 4}" role="img" aria-label="${n} dots in rows of ${cols}${bad.length ? `, with ${bad.length === 1 ? "one marked in red" : `${bad.length} marked in red`}` : ""}" style="max-height:120px">${Array.from({ length: n }, (_, i) => `<circle cx="${9 + (i % cols) * 14}" cy="${9 + Math.floor(i / cols) * 14}" r="5" fill="${bad.includes(i) ? "var(--rose)" : c}" opacity="${bad.includes(i) ? 1 : 0.55}"/>`).join("")}</svg>`;
  // response times: gamma(k = 2.5, θ = 100 ms) → p50 ≈ 218 ms, p95 ≈ 554 ms, p99 ≈ 754 ms, mean 250 ms
  const gammaPdf = (ms) => {
    const x = ms / 100;
    return Math.pow(x, 1.5) * Math.exp(-x);
  };

  addV(
    "ds-why",
    1,
    FG.compare(
      {
        title: "Before the web",
        c: "violet",
        body: "one company, one server, <b>fixed</b> data format, known number of users",
      },
      {
        title: "After",
        c: "amber",
        body: "millions of users, every page <b>generated on the fly</b>, data and traffic growing every month",
      },
    ),
  );
  addV(
    "ds-why",
    2,
    FG.cells(
      [
        { v: "① down = all down", sub: "availability", c: "rose" },
        { v: "② can only grow so big", sub: "scalability", c: "amber" },
        { v: "③ hard to upgrade live", sub: "maintenance", c: "violet" },
      ],
      { size: 150 },
    ),
  );
  addV(
    "ds-why",
    3,
    FG.compare(
      {
        title: "Choose consistency",
        c: "violet",
        body: "\"I can't reach the other copy, so I won't answer yet.\"<br>Right for <b>bank balances</b>.",
      },
      {
        title: "Choose availability",
        c: "teal",
        body: '"Here\'s what I have, it might be a few seconds old."<br>Right for <b>a like counter</b>.',
      },
    ),
  );
  addV(
    "ds-why",
    4,
    FG.compare(
      {
        title: "One powerful machine",
        c: "violet",
        body: "simple to program, <b>expensive</b>, a single point of failure",
      },
      { title: "Many cheap machines", c: "teal", body: "cheap and fault-tolerant, but they must <b>coordinate</b>" },
    ),
  );
  addV(
    "ds-blocks",
    0,
    FG.flow([
      { t: "your app", s: "writes an order" },
      { t: "database", s: "keeps it safe", c: "teal" },
      { t: "tomorrow", s: "still there" },
    ]),
  );
  addV(
    "ds-blocks",
    2,
    FG.bars(
      [
        ["no index: full scan", 500, "rose", "pages checked"],
        ["with an index", 1, "teal", "page checked"],
      ],
      { max: 500 },
    ),
  );
  addV(
    "ds-blocks",
    3,
    FG.flow([
      { t: "all day", s: "sales pile up" },
      { t: "02:00", s: "batch job runs", c: "violet" },
      { t: "08:00", s: "report is ready", c: "teal" },
    ]),
  );
  addV(
    "ds-reliability",
    0,
    FG.cells(
      [
        { v: "✓ does the job", c: "teal" },
        { v: "✓ survives user mistakes", c: "teal" },
        { v: "✓ fast enough under load", c: "teal" },
        { v: "✓ keeps intruders out", c: "teal" },
      ],
      { size: 150 },
    ),
  );
  addV(
    "ds-reliability",
    1,
    FG.compare(
      {
        title: "Fault",
        c: "amber",
        body: "<b>one part</b> misbehaves: a disk dies, a process hangs.<br>✈ one engine out of four stops",
      },
      {
        title: "Failure",
        c: "rose",
        body: "<b>the whole service</b> stops working for users.<br>✈ the plane can't fly",
      },
    ) + `<div class="fig-cap">Reliability engineering = stopping faults from turning into failures.</div>`,
  );
  addV(
    "ds-reliability",
    2,
    dots(100, 25, [37]) +
      `<div class="fig-cap">Picture 10,000 disks as 100 rows like this. On an average day, about <b>one</b> of them dies. With redundancy, users never notice.</div>`,
  );
  addV(
    "ds-reliability",
    3,
    FG.compare(
      {
        title: "Hardware fault: uncorrelated",
        c: "amber",
        body: dots(20, 10, [6]) + "one box dies, the rest carry on",
      },
      {
        title: "Software bug: correlated",
        c: "rose",
        body:
          dots(
            20,
            10,
            Array.from({ length: 20 }, (_, i) => i),
          ) + "same bug on every node → all down together",
      },
    ),
  );
  addV(
    "ds-load",
    0,
    FG.plot([{ f: (x) => 0.2 + 0.6 * Math.pow(x, 3), c: "teal", fill: true }], {
      x: [0, 1],
      y: [0, 1],
      xl: "load (requests/s) →",
      yl: "response time",
      h: 150,
      vlines: [[0.8, "trouble starts", "rose"]],
    }),
  );
  addV(
    "ds-load",
    2,
    FG.compare(
      { title: "Online services", c: "teal", body: "measure <b>response time</b>: how long one user waits" },
      {
        title: "Batch / analytics",
        c: "violet",
        body: "measure <b>throughput</b>: records per second, or time for the whole job",
      },
    ),
  );
  addV(
    "ds-load",
    3,
    FG.compare(
      { title: "① Same machines, more load", c: "amber", body: "how much slower does it get?" },
      { title: "② Same speed, more load", c: "teal", body: "how many more machines do we need?" },
    ),
  );
  addV(
    "ds-load",
    4,
    FG.plot([{ f: gammaPdf, c: "teal", fill: true }], {
      x: [0, 1000],
      xl: "response time (ms)",
      h: 190,
      vlines: [
        [218, "p50 218", "teal"],
        [250, "mean 250", "violet", 16],
        [554, "p95 554", "amber"],
        [754, "p99 754", "rose"],
      ],
    }) +
      `<div class="fig-cap">The long right tail is why the average hides the slow requests. Half of users wait under 218 ms, but 1 in 100 waits over 750 ms.</div>`,
  );
  addV(
    "ds-twitter",
    1,
    FG.graph({
      nodes: {
        You: { x: 70, y: 110, label: "you" },
        A: { x: 280, y: 30 },
        B: { x: 300, y: 110 },
        C: { x: 280, y: 190 },
      },
      edges: [
        ["You", "A"],
        ["You", "B"],
        ["You", "C"],
      ],
      directed: true,
      hl: { You: "violet", "You-A": "violet", "You-B": "violet", "You-C": "violet" },
      w: 380,
      h: 220,
      r: 20,
    }) +
      `<div class="fig-cap">Every time you open the app: fetch from everyone you follow, then merge. Cheap to post, expensive to read.</div>`,
  );
  addV(
    "ds-twitter",
    2,
    FG.graph({
      nodes: {
        A: { x: 70, y: 110, label: "poster" },
        F1: { x: 290, y: 30, label: "📬" },
        F2: { x: 310, y: 110, label: "📬" },
        F3: { x: 290, y: 190, label: "📬" },
      },
      edges: [
        ["A", "F1"],
        ["A", "F2"],
        ["A", "F3"],
      ],
      directed: true,
      hl: { A: "teal", "A-F1": "teal", "A-F2": "teal", "A-F3": "teal" },
      w: 380,
      h: 220,
      r: 22,
    }) +
      `<div class="fig-cap">Post once, and a copy lands in every follower's mailbox. Expensive to post, instant to read.</div>`,
  );
  addV(
    "ds-twitter",
    3,
    FG.bars(
      [
        ["posts per second", 4.6, "violet", "k"],
        ["timeline reads per second", 300, "teal", "k"],
      ],
      { max: 300 },
    ) + `<div class="fig-cap">Reads outnumber posts about 65 to 1, so it pays to do the work once at post time.</div>`,
  );
  Object.assign(partScope, { addV });
})();
