/* Revision bank, extra varied questions for the first four Data Science modules.
   Modules: ds-why, ds-blocks, ds-reliability, ds-load.
   Every question stands on its own. Numbers checked with node. */
(function () {
  const B = NIC.bank;

  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, c = "var(--text)", s = 12) =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${s}px var(--sans);fill:${c}">${t}</text>`;
  const box = (id, x, y, w, h, top, sub) =>
    `<g data-pick="${id}" style="cursor:pointer"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5"/>${tx(x + w / 2, y + h / 2 - 2, top, "var(--text)", 13)}${tx(x + w / 2, y + h / 2 + 15, sub, "var(--text-dim)", 11)}</g>`;

  /* hourly load figure: bars of requests per second */
  const HOURS = [
    ["9am", 120],
    ["10am", 180],
    ["11am", 260],
    ["12pm", 520],
    ["1pm", 300],
    ["2pm", 200],
  ];
  const loadFig = svg(
    420,
    190,
    `<line x1="30" y1="150" x2="410" y2="150" stroke="var(--line-2)" stroke-width="2.5"/>` +
      HOURS.map(([h, v], i) => {
        const x = 45 + i * 60,
          bh = v / 4;
        return `<g data-pick="${h}" style="cursor:pointer"><rect x="${x}" y="${150 - bh}" width="40" height="${bh}" rx="6" fill="var(--blue)" fill-opacity=".55" stroke="var(--blue-lip)" stroke-width="2.5"/>${tx(x + 20, 142 - bh, v, "var(--text)", 11)}${tx(x + 20, 170, h, "var(--text-dim)", 11)}</g>`;
      }).join(""),
  );

  const pathFig = svg(
    440,
    110,
    box("net", 8, 25, 95, 60, "Network", "5 ms") +
      box("app", 115, 25, 95, 60, "App code", "3 ms") +
      box("cache", 222, 25, 95, 60, "Cache check", "2 ms") +
      box("db", 329, 25, 103, 60, "Database", "90 ms") +
      `<line x1="103" y1="55" x2="115" y2="55" stroke="var(--text-dim)" stroke-width="2.5"/><line x1="210" y1="55" x2="222" y2="55" stroke="var(--text-dim)" stroke-width="2.5"/><line x1="317" y1="55" x2="329" y2="55" stroke="var(--text-dim)" stroke-width="2.5"/>`,
  );

  B.add("ds-why", [
    {
      type: "cat",
      q: "Each event hit a company that kept everything on one server. Sort it by the limitation of the one-server approach that it shows.",
      buckets: ["Availability", "Scalability", "Maintenance"],
      items: [
        ["The only machine's power supply fails at 3 a.m. and the shop is offline", 0],
        ["Traffic doubles on Black Friday and the one machine tops out", 1],
        ["A security patch needs a Sunday shutdown of the whole site", 2],
        ["Buying a second machine means both must hold identical, up-to-date data", 1],
        ["A single crashed process takes every customer's session down with it", 0],
        ["Fixing one small bug means the site must be switched off for an hour", 2],
      ],
      hint: "Ask: is it about staying up, coping with more users, or fixing things without stopping?",
      why: "A crash or power loss is about staying up (availability). More users than one machine can serve, or the work of keeping extra machines in step, is scalability. Needing downtime to patch or fix is maintenance.",
    },
    {
      type: "match",
      q: "A shop keeps copies of its data in two data centres. Match each design to what a customer would notice.",
      pairs: [
        ["Consistent choice during a network split", "An error or a wait, but never a wrong number"],
        ["Available choice during a network split", "A quick answer that may be a little out of date"],
        ["One big server crashes", "Everybody is locked out at the same moment"],
        ["One machine in a cluster of ten breaks", "Slightly less capacity, but the service carries on"],
      ],
      hint: "Think about what the customer sees, not how it is built.",
      why: "Consistency waits or refuses instead of showing wrong data, availability answers now and risks stale data, a single big machine is a single point of failure, and a cluster loses only a share of its capacity.",
    },
    {
      type: "order",
      q: "Put the story of how the web outgrew the single server in order.",
      items: [
        "A company keeps all its data on one mainframe in a fixed format",
        "Websites start building each page on the fly from the data",
        "Users and content grow very quickly",
        "One server can no longer stay up, grow or be maintained easily",
        "Data is spread over many machines and trade-offs appear",
      ],
      hint: "The problems only appear once growth arrives.",
      why: "The old setup worked while it was small and static. Dynamic pages and fast growth overloaded it, and the fix of using many machines brought the consistency-versus-availability and big-versus-cheap trade-offs.",
    },
    {
      type: "slider",
      q: "A shop uses a cluster of 10 identical machines that share its work equally. Two of them break. Roughly what percentage of its full capacity is left?",
      min: 0,
      max: 100,
      step: 5,
      start: 50,
      ans: 80,
      tol: 5,
      unit: "%",
      hint: "Each machine is a tenth of the capacity. Take away two tenths.",
      why: "Eight of the ten machines still work, so 8/10 = 80% of the capacity remains. With one big machine, the same fault would leave 0%. That is the case for many cheap machines.",
    },
    {
      type: "mcq",
      q: "A start-up keeps buying a bigger and bigger single server as it grows. Why does this only delay the problem?",
      o: [
        "One machine has a size limit and still fails alone",
        "Bigger servers need a different database design each time",
        "Bigger servers cannot run the same software as small ones",
      ],
      a: 0,
      hint: "Think about what happens if growth never stops.",
      why: "There is a limit to how powerful one machine can be, and it still has no spare if it fails. The other two options are made up: the same software and database design run on big and small servers alike.",
    },
    {
      type: "bug",
      q: "This function should choose consistency over availability: while the network is split, it must not reply from a possibly stale local copy. Click the faulty line.",
      code: [
        "def read_balance(account):",
        "    if network_split():",
        "        return local_copy[account]",
        "    return latest_agreed(account)",
      ],
      a: 2,
      hint: "Which line answers straight away with data that may be old?",
      why: "Line 3 replies from the local copy during the split, which is the availability choice. A consistent design would wait or refuse until the copies can agree again.",
    },
  ]);

  B.add("ds-blocks", [
    {
      type: "multi",
      q: "Which statements about a cache are true? Select all.",
      o: [
        "It keeps the result of costly work so it can be reused soon",
        "It can keep serving old data after the database has changed",
        "It usually has room for only part of the data",
        "It is the permanent home of every record",
      ],
      a: [0, 1, 2],
      hint: "A cache is a fast shortcut, not the master copy.",
      why: "A cache stores recent results, is small, and can go stale if the original changes. The permanent copy lives in the database, and the cache can be thrown away without losing records.",
    },
    {
      type: "match",
      q: "Every building block gains something and pays for it. Match each one to its price.",
      pairs: [
        ["Cache", "May show out-of-date answers until it is refreshed"],
        ["Index", "Extra storage, and extra work on every write"],
        ["Batch processing", "Results are only as fresh as the last run"],
        ["Full scan with no index", "Time grows in step with the number of records"],
      ],
      hint: "Ask what you give up in return for the speed or convenience.",
      why: "A cache can go stale, an index must be updated on each write, a batch job's answer is only as new as its last run, and without an index every search checks every record.",
    },
    {
      type: "order",
      q: "Put what happens when a request arrives at an app with a cache in order, for a miss.",
      items: [
        "The request arrives",
        "The app looks in the cache and finds nothing",
        "The app reads the answer from the database",
        "A copy of the answer is saved in the cache",
        "The answer is sent back",
      ],
      hint: "The cache is checked before the database, and filled after it.",
      why: "The cache is tried first. On a miss the slow database is used, and keeping a copy means the next request for the same item is a fast hit.",
    },
    {
      type: "slider",
      q: "A web app gets 400 requests per second. The cache answers 3 out of every 4 of them. Roughly how many requests per second still reach the database?",
      min: 0,
      max: 400,
      step: 20,
      start: 200,
      ans: 100,
      tol: 20,
      unit: "per second",
      hint: "If 3 out of 4 are answered by the cache, 1 out of 4 gets through. A quarter of 400 is...",
      why: "One request in four misses the cache, and 400 / 4 = 100 per second. The cache shields the database from most of the traffic.",
    },
    {
      type: "pick",
      q: "<b>A request passes through the four stages shown, and the database currently checks every row to find the record. Tap the stage whose time an index on the searched field would cut.</b>",
      fig: pathFig,
      a: ["db"],
      hint: "An index changes how the records are found.",
      why: "An index lets the database jump to the record instead of scanning every row, so the 90 ms scan shrinks. The network, the app code and the cache check do not search the table.",
    },
    {
      type: "mcq",
      q: "Why not simply make the cache big enough to hold all of the data?",
      o: [
        "Fast memory is costly, so a cache holds only part",
        "A cache that large would answer more slowly than a disk",
        "A cache is not allowed to hold more than one table",
      ],
      a: 0,
      hint: "Remember the pans on the hob: only a few fit.",
      why: "Caches are small and fast because fast storage is expensive. Holding everything would defeat the purpose. The other two reasons are made up: size does not make a cache slower than a disk, and there is no such rule about tables.",
    },
  ]);

  B.add("ds-reliability", [
    {
      type: "cat",
      q: "Sort each problem by whether it normally hits one node at a time or many nodes at once.",
      buckets: ["Usually one node at a time", "Can hit many nodes at once"],
      items: [
        ["A worn-out disk stops working", 0],
        ["A bad configuration file is pushed to every server", 1],
        ["A power supply in one machine burns out", 0],
        ["A date bug triggers on every node at midnight", 1],
        ["A memory module develops an error", 0],
        ["A leak in shared code uses up the memory on all nodes", 1],
      ],
      hint: "Hardware parts wear out separately. Software is usually the same on every node.",
      why: "Hardware faults are mostly uncorrelated, so one disk dying does not make another one die. Software faults often come from code or settings that every node shares, so they strike together.",
    },
    {
      type: "order",
      q: "A disk in a mirrored pair dies. Put the recovery in order.",
      items: [
        "A disk in the mirrored pair dies",
        "The service carries on reading from the surviving disk",
        "An engineer swaps in a new disk",
        "The new disk is filled from the surviving copy",
        "Both copies are healthy again",
      ],
      hint: "The service keeps working before the repair starts.",
      why: "Redundancy keeps the service running through the fault, so the fault never becomes a failure. The repair is then done in the background by copying the data back.",
    },
    {
      type: "slider",
      q: "On average a cluster of 10,000 disks loses one disk per day. How many disks would you expect to die in 50 days in a cluster of 2,000 disks?",
      min: 0,
      max: 40,
      step: 1,
      start: 20,
      ans: 10,
      tol: 3,
      unit: "disks",
      hint: "2,000 is a fifth of 10,000, so a fifth of one per day. A fifth of 50 is...",
      why: "A fifth of the size means 0.2 disks per day. Over 50 days that is 0.2 × 50 = 10. Even a small cluster sees steady hardware faults, so the design must expect them.",
    },
    {
      type: "multi",
      q: "Which of these help stop a fault from turning into a failure? Select all.",
      o: [
        "Several machines that can take over when one dies",
        "Rolling a change out to a few nodes before the rest",
        "Keeping spare capacity for the load of a lost node",
        "Releasing new code to every node at the same moment",
      ],
      a: [0, 1, 2],
      hint: "Look for ways to limit how much a single problem can spread.",
      why: "Redundancy, staged rollouts and spare capacity all stop one problem from spreading. Updating every node at once means a bug hits all of them together.",
    },
    {
      type: "match",
      q: "Match each term to the description that fits it best.",
      pairs: [
        ["Fault", "One component works in an unexpected way"],
        ["Failure", "The whole system stops providing the service"],
        ["Correlated fault", "Many nodes are hit by the same cause together"],
        ["Cascading failure", "Dead nodes' work overloads the survivors until they die too"],
      ],
      hint: "A fault is small and local. A failure is the visible service outage.",
      why: "A fault is a component misbehaving, a failure is the whole service going down. Correlated faults share one cause, and a cascade is the knock-on overload as work moves to fewer nodes.",
    },
    {
      type: "mcq",
      q: "A shopping app always returns correct results, but each page takes 40 seconds to load under a normal evening load. Which part of the lecture's definition of a reliable application does it break?",
      o: [
        "It fails to perform well enough for the expected load",
        "It does not tolerate users making mistakes or odd inputs",
        "It does not prevent unauthorised access and abuse",
      ],
      a: 0,
      hint: "Check each point of the definition against what the app does.",
      why: "The results are right, so the function is fine, but a 40-second page is not good enough performance for the load it expects. Nothing in the scenario involves user mistakes or unauthorised access.",
    },
  ]);

  B.add("ds-load", [
    {
      type: "cat",
      q: "Sort each question by which of the two scalability questions it asks.",
      buckets: [
        "Same system, more load: how does performance change?",
        "Same performance, more load: how many resources?",
      ],
      items: [
        ["With triple the traffic on today's three servers, will pages load slower?", 0],
        ["To keep p95 under 300 ms at triple the traffic, how many servers do we need?", 1],
        ["If we leave the database alone and double the users, what happens to response time?", 0],
        ["To hold response times steady as players double, how much extra capacity is needed?", 1],
        ["If requests per second climb from 500 to 1,000 on the same machine, how much does p99 rise?", 0],
        ["How many extra machines keep the average at 80 ms when the load grows tenfold?", 1],
      ],
      hint: "In one the hardware stays fixed. In the other the performance stays fixed.",
      why: "When the system is held fixed, you measure how performance changes. When the performance target is held fixed, you work out the resources needed to meet it.",
    },
    {
      type: "slider",
      q: "At peak a service gets 2,000 requests per second. Each server copes with 250 per second, but you only want to run each one at 80% of that. How many servers do you need?",
      min: 0,
      max: 20,
      step: 1,
      start: 8,
      ans: 10,
      tol: 1,
      unit: "servers",
      hint: "80% of 250 is 200. How many 200s make 2,000?",
      why: "80% of 250 is 200 per server, and 2,000 / 200 = 10 servers. Running right at capacity would make response times shoot up, so you leave some headroom.",
    },
    {
      type: "order",
      q: "A team wants to know whether its service can cope as it grows. Put the steps of their reasoning in order.",
      items: [
        "Pick the load parameter, such as requests per second",
        "Measure the performance parameter at today's load",
        "Raise the load on the same system and watch performance change",
        "Set a performance target and work out the resources needed to hold it",
        "Add the resources and test again to confirm the target holds",
      ],
      hint: "First keep the system the same, then keep the performance the same.",
      why: "You describe the load, measure today's performance, see how it changes on the same system, then fix the performance and ask how many resources it takes. A final test confirms the answer.",
    },
    {
      type: "multi",
      q: "Which statements about averages and percentiles are true? Select all.",
      o: [
        "A good average can hide a few very slow requests",
        "The p99 is a time that 99% of requests finish within",
        "Speeding up already fast requests lowers the mean but not the p99",
        "The mean is always the best single summary of performance",
      ],
      a: [0, 1, 2],
      hint: "An average is pulled around by the many fast requests. A percentile looks at the tail.",
      why: "The mean is pulled around by many fast requests and can hide a slow tail. Percentiles describe the tail directly. Fast requests do not move a high percentile, and no single number suits every case.",
    },
    {
      type: "pick",
      q: "<b>A web app's requests per second are shown for each hour. Capacity must cope with the busiest hour, not with the average. Tap the hour that sets the capacity needed.</b>",
      fig: loadFig,
      a: ["12pm"],
      hint: "Which bar is far above the rest?",
      why: "The busiest hour is 12pm, with 520 requests per second. A system sized for the average of about 260 would be swamped at lunchtime.",
    },
    {
      type: "bug",
      q: "This report should say how slow the worst 1% of requests are. Click the faulty line.",
      code: [
        "times = sorted(response_times)",
        "index = int(0.99 * len(times))",
        "p99 = times[0]",
        'print("p99:", p99)',
      ],
      a: 2,
      hint: "Which index is the fastest request? Which is near the slow end?",
      why: "times[0] is the fastest request after sorting. The p99 should be read at the computed index, near the slow end: times[index].",
    },
  ]);
})();
