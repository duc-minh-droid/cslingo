(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { ceiling, hotNodes, ln, pk, rc, shards, svg, table, tx } = partScope;
  const B = NIC.bank;

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
