(function () {
  const B = NIC.bank;
  const svg = (w, h, s) =>
    `<svg viewBox="0 0 ${w} ${h}" style="max-width:${w}px;width:100%;height:auto" font-family="inherit">${s}</svg>`;
  const box = (k, x, y, w, h, t, st) =>
    `<g data-pick="${k}" style="cursor:pointer"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="var(--panel-2)" stroke="${st || "var(--line)"}" stroke-width="2"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">${t}</text></g>`;
  const line = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line)" stroke-width="2"/>`;

  /* cost curves: one steeper than linear, one straight */
  const costCurves = svg(
    300,
    210,
    line(30, 180, 280, 180) +
      line(30, 180, 30, 15) +
      `<text x="155" y="203" text-anchor="middle" fill="var(--text)" font-size="12">Capacity</text>` +
      `<text x="8" y="100" fill="var(--text)" font-size="12" transform="rotate(-90 14 100)">Cost</text>` +
      `<g data-pick="steep" style="cursor:pointer"><path d="M30 178 Q200 170 275 20" fill="none" stroke="var(--blue)" stroke-width="5"/><text x="228" y="34" fill="var(--text)" font-size="13" font-weight="700">Line P</text></g>` +
      `<g data-pick="straight" style="cursor:pointer"><path d="M30 178 L275 100" fill="none" stroke="var(--amber)" stroke-width="5"/><text x="228" y="96" fill="var(--text)" font-size="13" font-weight="700">Line Q</text></g>`,
  );

  /* three apps -> one data layer -> two databases */
  const layers = (() => {
    let s = "";
    [30, 130, 230].forEach((x) => (s += line(x + 40, 50, 160, 90)));
    [100, 220].forEach((x) => (s += line(160, 124, x + 40, 160)));
    [30, 130, 230].forEach((x, i) => (s += box("app" + (i + 1), x, 10, 80, 40, "App " + (i + 1))));
    s += box("layer", 70, 90, 180, 34, "Data-access layer", "var(--violet)");
    s += box("ordersdb", 60, 160, 90, 40, "Orders DB") + box("usersdb", 180, 160, 90, 40, "Users DB");
    return svg(320, 210, s);
  })();

  B.add("ds-twitter", [
    {
      type: "cat",
      q: "A social app is choosing how to build home timelines. Sort each fact by the design it belongs to.",
      buckets: ["Merge on read only", "Fan-out on write only"],
      items: [
        ["Posting is a single insert into one shared table", 0],
        ["Every reader looks up and merges tweets from everyone they follow", 0],
        ["Each user has their own ready-made timeline cache", 1],
        ["A post by an account with huge numbers of followers triggers a flood of inserts", 1],
      ],
      hint: "Ask who does the work: the person posting, or the person reading?",
      why: "Merge on read keeps writing cheap (1 insert) but pushes the lookup and merge onto every reader. Fan-out on write copies each post into every follower's cache, so reading is quick but a post from a huge account means millions of inserts.",
    },
    {
      type: "slider",
      q: "A reader follows 200 accounts, 3 of whom are celebrities. The app uses the hybrid: ordinary accounts are fanned out on write, celebrities are merged on read. When this reader opens the app, how many separate lookups are needed (their own timeline cache plus the celebrity fetches)?",
      min: 0,
      max: 20,
      step: 1,
      start: 10,
      ans: 4,
      tol: 0,
      unit: "lookups",
      hint: "The 197 ordinary accounts are already inside the cache. Count the cache once, then the celebrities.",
      why: "One lookup reads the timeline cache, which already holds the 197 ordinary accounts' posts. Then 3 fetches pull in the celebrities' latest posts, to be merged by time. That is 4, not 200, which is why the hybrid keeps reads cheap.",
    },
    {
      type: "order",
      q: "Under fan-out on write, put the life of one tweet in order, from posting to being read.",
      items: [
        "A user posts a tweet",
        "The system looks up that user's followers",
        "The tweet is inserted into each follower's timeline cache",
        "A follower opens the app and reads their own cache",
      ],
      hint: "The followers have to be found before anything can be copied to them.",
      why: "The work happens at post time: find the followers, then copy the tweet into each one's mailbox. By the time a follower opens the app the tweet is already waiting, so the read is a single cheap lookup.",
    },
    {
      type: "multi",
      q: "A team builds timeline caches with fan-out on write. Select every statement that is true.",
      o: [
        "Opening a timeline becomes a simple read of one cache",
        "One post costs more writes the more followers the poster has",
        "The same tweet ends up stored in many caches",
        "A post costs the same number of writes whoever posts it",
        "Readers must still merge tweets from everyone they follow",
      ],
      a: [0, 1, 2],
      hint: "One copy goes to each follower. What does that say about cost, storage and reading?",
      why: "Fan-out trades write work for read speed: reads are one lookup, a post costs one write per follower, and each tweet is duplicated across caches. The merge is exactly what the cache removes, and cost clearly varies with follower count.",
    },
    {
      type: "bug",
      q: "A developer sketches fan-out on write, but posting is far slower than expected and every user's cache fills with tweets from strangers. Which line is the bug?",
      code: [
        "def post(author, tweet):",
        "    tweets_table.insert(tweet)",
        "    for user in all_users:",
        "        timeline_cache[user].append(tweet)",
      ],
      a: 2,
      hint: "Who should receive a copy of a tweet?",
      why: "Only the poster's followers should get a copy. Looping over all users writes the tweet into everyone's cache, so each post costs as many writes as there are users and strangers' tweets pollute every timeline.",
    },
    {
      type: "match",
      q: "Match each figure from the Twitter case study to what it measures.",
      pairs: [
        ["About 300 thousand per second", "Requests to view a home timeline"],
        ["About 4.6 thousand per second", "New tweets posted on average"],
        ["About 75", "Followers a typical tweet reaches"],
        ["Within 5 seconds", "Target time to deliver a tweet to followers"],
      ],
      hint: "Reads were roughly two orders of magnitude more common than posts.",
      why: "Timeline views (about 300 thousand per second) vastly outnumber posts (about 4.6 thousand per second). Multiplying posts by roughly 75 followers gives the fan-out write load, and Twitter aimed to deliver within 5 seconds, which a huge account's fan-out would break.",
    },
  ]);

  B.add("ds-scaling", [
    {
      type: "slider",
      q: "A shop needs 10 times the power of one basic machine, which costs £1 thousand. It scales out with 10 basic machines and adds about 10% on top for coordination. Roughly what does that cost, in £ thousand?",
      min: 0,
      max: 20,
      step: 1,
      start: 5,
      ans: 11,
      tol: 0,
      unit: "£k",
      hint: "10 machines at £1 thousand is £10 thousand. Add a tenth of that.",
      why: "Ten machines cost 10 × 1 = £10 thousand. The 10% coordination overhead adds £1 thousand, giving about £11 thousand. The cost grows in a straight line with the number of machines, unlike buying one ever-bigger machine.",
    },
    {
      type: "pick",
      q: "Two ways to add capacity are plotted as cost against capacity. Tap the line that shows scaling up (one ever-bigger machine).",
      fig: costCurves,
      a: "steep",
      hint: "Which line gets disproportionately dearer as capacity grows?",
      why: "High-end hardware costs much more than twice as much for twice the power, so the scale-up curve bends upwards (Line P). Commodity machines cost about the same each, giving the straight line (Line Q).",
    },
    {
      type: "order",
      q: "A growing service moves through these stages. Put them in the order they would sensibly happen.",
      items: [
        "Traffic grows until one server is overloaded",
        "The team buys a more powerful server (scale up)",
        "The biggest affordable machine is reached and costs climb steeply",
        "The team adds many ordinary machines (scale out)",
        "Engineers now handle coordination and consistency between machines",
      ],
      hint: "The cheap, simple fix usually comes before the one that adds complexity.",
      why: "Scaling up is the simple first move, but it hits a cost and size ceiling. Scaling out then spreads load across commodity machines, and the price of that is coordination, consistency and partial failures.",
    },
    {
      type: "cat",
      q: "Sort each move by whether it scales a service up or out.",
      buckets: ["Scale up", "Scale out"],
      items: [
        ["Swap the 16 GB database server for one with 512 GB of memory", 0],
        ["Upgrade the one machine to faster CPUs and bigger disks", 0],
        ["Put a second and third web server behind a load balancer", 1],
        ["Split customer records across four ordinary machines", 1],
      ],
      hint: "Up means one bigger box. Out means more boxes.",
      why: "Making a single machine more powerful is scaling up (shared-memory). Adding more ordinary machines that each have their own CPU, memory and disk is scaling out (shared-nothing).",
    },
    {
      type: "slider",
      q: "A fleet of 8 equal machines shares the load, and 2 of them fail. What percentage of the fleet's capacity is left?",
      min: 0,
      max: 100,
      step: 5,
      start: 50,
      ans: 75,
      tol: 0,
      unit: "%",
      hint: "6 machines are still running out of 8. 6 ÷ 8 is three quarters.",
      why: "6 of the 8 machines survive, which is 6 ÷ 8 = 75%. The service slows down but stays up. A single big machine that fails leaves 0%.",
    },
    {
      type: "bug",
      q: 'A team writes: "We scaled up so the service can survive a machine failing." Which line of their plan shows the claim is wrong?',
      code: [
        "Plan: replace the old server with one very powerful server",
        "It has far more CPUs, memory and disk",
        "The whole service runs on that single machine",
        "Launch after a successful load test",
      ],
      a: 2,
      hint: "What happens to the service if that one machine dies?",
      why: "However powerful it is, a single machine is still one point of failure, so fault tolerance stays limited. Surviving failures needs several machines, which is scaling out.",
    },
  ]);

  B.add("ds-maintain", [
    {
      type: "slider",
      q: "A tangled system has 6 apps, each connected directly to each of 3 data stores. A data-access layer would connect each app to the layer and the layer to each store. How many fewer connections would there be?",
      min: 0,
      max: 20,
      step: 1,
      start: 5,
      ans: 9,
      tol: 0,
      unit: "fewer",
      hint: "Before: 6 × 3. After: 6 + 3. Subtract.",
      why: "Directly there are 6 × 3 = 18 connections. With the layer there are 6 + 3 = 9, so 9 fewer. The abstraction hides the mess, making the system simpler to understand and easier to change.",
    },
    {
      type: "pick",
      q: "The Orders DB is being replaced. Tap the only box that has to be rewritten.",
      fig: layers,
      a: "layer",
      hint: "Which box is the only one that talks to the databases?",
      why: "The apps only know the clean interface, so they do not notice the change. Only the data-access layer talks to the database, so only it must be edited. That is evolvability helped by abstraction.",
    },
    {
      type: "order",
      q: "A tax rule changes in a well-abstracted system. Put the work in order.",
      items: [
        "A new tax rule is announced",
        "Engineers find the one component that handles tax",
        "They change only that component",
        "They retest it and release the update",
      ],
      hint: "With a good abstraction, locating the change is quick.",
      why: "Good abstractions keep a requirement's logic in one place, so engineers find it fast, change it without touching the rest and only need to retest that part. That is high evolvability.",
    },
    {
      type: "multi",
      q: "Select every change that reduces accidental complexity.",
      o: [
        "Replacing five different date formats with one agreed format",
        "Deleting a feature that customers rely on",
        "Replacing an obscure undocumented dependency with a standard documented one",
        "Writing down how the modules connect",
        "Adding a third cache layer that nobody can explain",
      ],
      a: [0, 2, 3],
      hint: "Accidental complexity comes from how the system was built, not from the problem.",
      why: "Consistency, standard dependencies and documentation all remove complexity the problem never needed. Dropping a feature changes what the system does without making it better built, and an unexplained extra layer adds complexity.",
    },
    {
      type: "bug",
      q: "A new engineer's order code works on their laptop but fails on the servers, and nobody can say why. Which line hides an obscure dependency?",
      code: [
        "def total(order):",
        "    tax = lookup_tax(order.country)",
        "    rate = open('/home/sam/rates.txt').read()",
        "    return order.net * (1 + tax) * float(rate)",
      ],
      a: 2,
      hint: "Which line relies on something tied to one person's machine?",
      why: "The rates file lives in one person's home folder, so the code depends on a single machine and is a surprise for operators and newcomers. Moving it to shared configuration helps operability and simplicity.",
    },
    {
      type: "cat",
      q: "Each symptom shows one part of maintainability going badly. Sort the symptoms.",
      buckets: ["Operability", "Simplicity", "Evolvability"],
      items: [
        ["Nobody can tell why the site slowed down at 9 a.m.", 0],
        ["The service only works while machine 3 stays up", 0],
        ["New hires need a month to understand the wiring", 1],
        ["Each service calls customers something different", 1],
        ["Adding a payment type means editing twelve files", 2],
        ["A traffic spike forces a rewrite", 2],
      ],
      hint: "Running, understanding and changing are the three parts.",
      why: "Missing monitoring and dependence on one machine hurt operability. A confusing, inconsistent design hurts simplicity. Needing many edits for a new feature, or a rewrite to cope with load, hurts evolvability.",
    },
  ]);
})();
