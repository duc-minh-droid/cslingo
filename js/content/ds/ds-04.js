(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});
  const { box, flow, reg, sorter, table } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;

  /* ============ 1.6 Scaling up vs out ============ */
  reg({
    id: "ds-scaling",
    order: 6,
    num: "1.6",
    title: "Scaling up vs scaling out",
    blurb: "Buy a bigger machine or more machines? Compare cost curves and what happens when one machine dies.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let need = 8,
        deadV = false,
        deadH = 0;
      const card = el(`<div class="card"><div class="controls" id="c1"></div>
        <div class="grid two">
          <div><div class="card-head"><span class="tag amber">Vertical: scale up</span><span class="faint">one bigger machine (shared-memory)</span></div><div id="v"></div></div>
          <div><div class="card-head"><span class="tag teal">Horizontal: scale out</span><span class="faint">more cheap machines (shared-nothing)</span></div><div id="h"></div></div></div>
        <h3 style="margin-top:14px">Cost as capacity grows</h3><canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--amber)">vertical</span><span style="--c:var(--teal)">horizontal</span></div>
        <p class="faint" style="font-size:12.5px">Illustrative cost model: high-end hardware gets disproportionately expensive (vertical ∝ capacity<sup>1.7</sup>, and no machine bigger than 32× exists). Commodity machines cost the same each, plus ~10% coordination overhead.</p></div>`);
      root.appendChild(card);
      const sN = N.slider("Capacity needed (× one basic machine)", 1, 40, 1, need);
      sN.onInput((v) => {
        need = v;
        deadH = 0;
        deadV = false;
        draw();
      });
      qs("#c1", card).appendChild(sN);
      const costV = (c) => (c > 32 ? Infinity : 1000 * c ** 1.7),
        costH = (c) => 1000 * c * (c > 1 ? 1.1 : 1);
      function draw() {
        const cv = costV(need),
          ch = costH(need);
        qs("#v", card).innerHTML =
          `<div style="display:flex;align-items:flex-end;gap:10px;height:120px"><button class="btn" id="kv" style="width:${40 + Math.min(need, 32) * 4}px;height:${40 + Math.min(need, 32) * 2.4}px;border-color:${deadV ? "var(--rose)" : "var(--amber)"}">${deadV ? "💥" : need > 32 ? "✗ too big" : need + "×"}</button></div>
          <div class="stat-row"><div class="stat amber"><small>Cost</small><b>${cv === Infinity ? "doesn't exist" : "£" + Math.round(cv).toLocaleString()}</b></div><div class="stat"><small>Capacity left</small><b style="color:${deadV ? "var(--rose)" : ""}">${deadV ? "0%" : "100%"}</b></div></div>`;
        qs("#h", card).innerHTML =
          `<div style="display:flex;flex-wrap:wrap;gap:4px;align-content:flex-end;height:120px">${Array.from({ length: need }, (_, i) => `<button class="btn" data-h="${i}" style="width:26px;height:26px;padding:0;font-size:11px;border-color:${i < deadH ? "var(--rose)" : "var(--teal)"}">${i < deadH ? "💥" : ""}</button>`).join("")}</div>
          <div class="stat-row"><div class="stat teal"><small>Cost</small><b>£${Math.round(ch).toLocaleString()}</b></div><div class="stat"><small>Capacity left</small><b>${Math.round(((need - deadH) / need) * 100)}%</b></div></div>`;
        qs("#kv", card).onclick = () => {
          deadV = !deadV;
          draw();
        };
        qsa("[data-h]", card).forEach(
          (b) =>
            (b.onclick = () => {
              deadH = Math.min(need, deadH + 1);
              draw();
            }),
        );
        const xs = Array.from({ length: 40 }, (_, i) => i + 1);
        N.lineChart(qs("#ch", card), {
          series: [
            { data: xs.map((x) => (costV(x) === Infinity ? NaN : costV(x) / 1000)), color: N.colors().amber },
            { data: xs.map((x) => costH(x) / 1000), color: N.colors().teal },
          ],
          yMin: 0,
          height: 180,
          xLabel: "capacity 1× → 40×  (cost in £k)",
        });
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "ds-sc-1",
          q: "Click the big machine to break it, then break one small machine. What does this show?",
          opts: [
            "Both designs lose all their capacity as soon as one machine fails",
            "Vertical has one failure point; horizontal loses a slice",
            "Horizontal is cheaper at every possible size",
          ],
          a: 1,
          why: "The lecture: vertical = <i>costs do not scale linearly, limited fault tolerance</i>. Horizontal = <i>costs can scale better, better fault tolerance</i>. (At very small sizes one machine is simpler. Scaling out adds coordination complexity.)",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Vertical scaling</b> (scale up, shared-memory): a more powerful machine. Costs don't scale linearly, and fault tolerance is limited.",
            "<b>Horizontal scaling</b> (scale out, shared-nothing): more commodity machines. Costs scale better, and fault tolerance is better.",
            "This is the lecture's second trade-off: a single powerful system vs several cheap commodity computers.",
          ],
          "Scaling up buys a bigger machine that gets pricier and is a single point of failure; scaling out adds cheap machines that are cheaper at scale and survive failures.",
        ),
      );
    },
  });

  /* ============ 1.7 Maintainability ============ */
  reg({
    id: "ds-maintain",
    order: 7,
    num: "1.7",
    title: "Maintainability",
    blurb:
      "Operability, simplicity, evolvability: untangle a spaghetti architecture with an abstraction and count what a change costs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let abs = false;
      const svcs = ["Web app", "Mobile API", "Reports", "Search", "Billing"],
        dbs = ["Users DB", "Orders DB", "Products DB", "Logs DB"];
      const card = el(`<div class="card"><div class="card-head"><h2>Accidental complexity and abstraction</h2></div>
        <div class="controls"><button class="btn primary" id="tg">Add a data-access layer (abstraction)</button><button class="btn" id="chg">Change: replace "Orders DB" with a new database</button></div>
        <svg class="viz" id="arch" viewBox="0 0 560 300"></svg>
        <div class="stat-row"><div class="stat"><small>Connections to understand</small><b id="cn"></b></div><div class="stat amber"><small>Components to edit for that change</small><b id="ce"></b></div></div>
        <div id="msg" class="dim"></div></div>`);
      root.appendChild(card);
      const X = (i, n) => 60 + (i * 440) / (n - 1);
      function draw(hl = false) {
        const top = svcs.map((s, i) => [X(i, svcs.length), 40, s]),
          bot = dbs.map((d, i) => [X(i, dbs.length) + 20, 260, d]);
        let lines = "";
        if (!abs)
          top.forEach(([x1, y1]) =>
            bot.forEach(
              ([x2, y2, d]) =>
                (lines += `<line x1="${x1}" y1="${y1 + 16}" x2="${x2}" y2="${y2 - 16}" stroke="${hl && d === "Orders DB" ? "var(--rose)" : "var(--line-2)"}" stroke-width="${hl && d === "Orders DB" ? 2.5 : 1.2}"/>`),
            ),
          );
        else {
          top.forEach(([x]) => (lines += `<line x1="${x}" y1="56" x2="${x}" y2="134" stroke="var(--line-2)"/>`));
          bot.forEach(
            ([x, , d]) =>
              (lines += `<line x1="${x}" y1="166" x2="${x}" y2="244" stroke="${hl && d === "Orders DB" ? "var(--rose)" : "var(--line-2)"}" stroke-width="${hl && d === "Orders DB" ? 2.5 : 1.2}"/>`),
          );
        }
        const node = ([x, y, t], c) =>
          `<rect x="${x - 48}" y="${y - 16}" width="96" height="32" rx="8" fill="var(--panel-2)" stroke="${c}"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="var(--text)" font-size="12">${t}</text>`;
        qs("#arch", card).innerHTML =
          lines +
          top.map((t) => node(t, hl && !abs ? "var(--rose)" : "var(--teal)")).join("") +
          bot.map((b) => node(b, "var(--amber)")).join("") +
          (abs
            ? `<rect x="40" y="134" width="480" height="32" rx="8" fill="var(--violet-dim)" stroke="${hl ? "var(--rose)" : "var(--violet)"}"/><text x="280" y="155" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600">Data-access layer (one clean interface)</text>`
            : "");
        qs("#cn", card).textContent = abs ? svcs.length + dbs.length : svcs.length * dbs.length;
      }
      qs("#tg", card).onclick = () => {
        abs = !abs;
        qs("#tg", card).textContent = abs ? "Remove the abstraction" : "Add a data-access layer (abstraction)";
        qs("#ce", card).textContent = "–";
        qs("#msg", card).innerHTML = "";
        draw();
      };
      qs("#chg", card).onclick = () => {
        draw(true);
        qs("#ce", card).textContent = abs ? 1 : svcs.length;
        qs("#msg", card).innerHTML = abs
          ? "Only the data-access layer changes. The 5 services don't even notice: <b>high evolvability</b>."
          : "Every service talks to Orders DB directly, so <b>all 5</b> must be edited and retested: <b>low evolvability</b>.";
      };
      draw();
      qs("#ce", card).textContent = "–";
      sorter(
        root,
        "Which part of maintainability does this improve?",
        [
          ["Operability", "easy to keep running"],
          ["Simplicity", "easy to understand"],
          ["Evolvability", "easy to change"],
        ],
        [
          ["Good monitoring dashboards showing what the system is doing", "Operability"],
          ["The system doesn't depend on one particular machine staying alive", "Operability"],
          ["Behaviour is predictable, with no surprises", "Operability"],
          ["Automation and integration with standard tools", "Operability"],
          ["Removing obscure dependencies and an inconsistent architecture", "Simplicity"],
          ["Hiding messy details behind a clean abstraction", "Simplicity"],
          ["Better documentation and consistent code style", "Simplicity"],
          ["Adding a new feature for a new requirement takes a day, not a month", "Evolvability"],
          ["Handling increased load without a rewrite", "Evolvability"],
        ],
      );
      root.appendChild(
        predict({
          id: "ds-mt-1",
          q: "With the data-access layer in place, the system grows to 8 services and 6 databases. How many connections must someone understand?",
          opts: ["14", "48", "8"],
          a: 0,
          why: "Every service talks to the layer (8) and the layer talks to every database (6): 8 + 6 = <b>14</b>. Without it every service would reach every database directly: 8 × 6 = 48. An abstraction turns a product into a sum, so each new service or database adds one connection, not one per partner. That is accidental complexity removed.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Maintainability</b> = the overall cost of keeping a system operational and up to date.",
            "<b>Operability</b>: easy for ops to keep running (monitoring, automation, no single-machine dependency, predictable behaviour).",
            "<b>Simplicity</b>: easy for new people to understand. Remove <b>accidental complexity</b>. Abstraction helps.",
            "<b>Evolvability</b>: easy to change for new requirements or load, and closely linked to simplicity and abstractions.",
          ],
          "Maintainable systems are easy to run, easy to understand, and easy to change, and abstraction helps with the last two.",
        ),
      );
    },
  });

  /* =================== LESSONS =================== */
  const L = N.LESSONS;
  L["ds-why"] = {
    sum: "The web made data <b>huge, fast-growing and always-on</b>. A single server couldn't cope, so we face two trade-offs.",
    steps: [
      {
        t: "How it used to be",
        b: `<p>Before the web took off, a company's data typically lived on <b>one big server</b> (a mainframe), in a <b>fixed format</b>, inside an <b>expensive relational database</b> (like MS SQL or Oracle).</p>`,
        v: `<div class="mini-row">${box("1 mainframe", "all data, all users", "var(--amber)")}${box("Static format", "rarely changes")}${box("RDBMS", "MS SQL, Oracle")}</div>`,
      },
      {
        t: "Then the web happened",
        b: `<p>Suddenly: many more companies and services online, <b>dynamically generated</b> content (every page built on the fly), and <b>rapid growth</b> in both content and users. Think Google, eBay, Facebook.</p><span class="analogy">A corner shop with one till suddenly gets a million customers a day, and they all want personalised receipts.</span>`,
      },
      {
        t: "Where a single server breaks",
        b: `<p>Three limitations of the one-server approach:</p><p>① <b>Availability & fault tolerance</b>: if it dies, everything is down.<br>② <b>Scalability</b>: one machine can only get so big, and adding more means keeping them in sync (synchronisation, consistency).<br>③ <b>Maintenance</b>: hard to update or fix without downtime.</p>`,
        c: {
          type: "match",
          q: "A company runs everything on one server. Match each problem to the <b>limitation</b> it shows.",
          pairs: [
            ["The server crashes and the whole site is offline", "Availability"],
            ["One machine can't cope with a million customers a day", "Scalability"],
            ["Fixing the database means taking the site down overnight", "Maintenance"],
          ],
          hint: "Ask what went wrong: it stopped working, it couldn't grow, or it was hard to repair or update.",
          why: "A crash on a single machine takes everything down (availability and fault tolerance). One machine can only grow so big (scalability). Repairs that need downtime are a maintenance problem.",
        },
      },
      {
        t: "Trade-off 1: consistency vs availability",
        b: `<p>Once data is copied across several machines, a network problem forces a choice: keep every copy <b>consistent</b> (refuse to answer until you're sure), or stay <b>available</b> (answer now, maybe with slightly old data).</p><span class="key">You can't always have both. Which one matters more depends on the application.</span>`,
        c: {
          q: "A bank balance should probably prefer…",
          o: ["availability, since stale is fine", "consistency", "neither"],
          a: 1,
          why: "Money needs correctness. A social feed can happily show slightly old posts (availability).",
        },
      },
      {
        t: "Trade-off 2: one big machine vs many cheap ones",
        b: `<p>Either buy a <b>single powerful system</b>, or use <b>several cheap commodity computers</b> working together. (Module 1.6 goes deeper.)</p>`,
      },
    ],
    guide: [
      "In the first demo, drag the load up and watch <b>Single powerful server</b>. Then click the mainframe to break it.",
      "Switch to <b>Cluster</b>, break one or two nodes, and compare what's left.",
      "In the consistency demo, click <b>Link OK</b> to cut it, buy a ticket in London, then read in New York, first in <b>consistent</b> mode, then in <b>available</b> mode.",
    ],
  };
  L["ds-blocks"] = {
    sum: "Almost every data app is built from four blocks: a <b>database</b>, a <b>cache</b>, an <b>index</b> and <b>batch processing</b>.",
    steps: [
      {
        t: "Database: remember things",
        b: `<p><b>Store data so it can be retrieved later.</b> Orders, users, posts: anything that must still be there tomorrow.</p>`,
      },
      {
        t: "Cache: don't do expensive work twice",
        b: `<p><b>Store the results of expensive operations to be used again soon.</b></p><span class="analogy">Keeping your most-used pans on the hob instead of in the cupboard. Much faster to grab, but there's only room for a few.</span>`,
        v:
          flow([
            ["Request", "violet"],
            ["In cache?", "amber"],
            ["Yes → answer in 2 ms", "teal"],
          ]) +
          `<div class="mini-row"><span class="pill rose">No → fetch from the database (100 ms), then keep a copy in the cache</span></div>`,
      },
      {
        t: "Index: find things fast",
        b: `<p><b>Let users search the data efficiently.</b> Without an index you check every record (a full scan). With one you jump almost straight to the answer.</p><span class="analogy">The index at the back of a textbook: look up "cache", go to page 42, and skip the other 499 pages.</span>`,
        c: {
          q: "A million records. Roughly how many checks does a sorted index need to find one?",
          o: ["1,000,000", "~20", "1"],
          a: 1,
          why: "Halving each step: log₂(1,000,000) ≈ 20.",
        },
      },
      {
        t: "Batch processing: big periodic jobs",
        b: `<p><b>Periodically run specific routines on large amounts of accumulated data.</b> Example: every night, total up all of the day's sales.</p>`,
      },
      {
        t: "Same blocks, different implementations",
        b: `<p>Each block can be built in many ways, and <b>the problem decides which</b>. The lecture's example is spatial (map) data:</p>`,
        v: `<div class="mini-row">${box("Representation", "GeoJSON")}${box("Storage", "PostGIS")}${box("Indexing", "R-tree")}</div>`,
        c: {
          type: "match",
          q: "Match each job to the <b>building block</b> that does it.",
          pairs: [
            ["Keep every order safe so it is still there tomorrow", "Database"],
            ["Reuse an answer from a few seconds ago instead of recomputing it", "Cache"],
            ["Jump straight to one product among millions", "Index"],
            ["Every Sunday, recompute recommendations from all purchases", "Batch processing"],
          ],
          hint: "Think what each block is for: remember, reuse, find fast, or run a big periodic job.",
          why: "A database remembers, a cache avoids repeating expensive work, and an index avoids scanning every record. A periodic job over lots of accumulated data is batch processing.",
        },
      },
    ],
    guide: [
      "Sort the 8 scenarios into the right block.",
      "In the cache demo, set the <b>cache size</b> to 0 and press <b>Send requests</b>. Note the average latency.",
      "Press <b>Reset</b>, set the <b>cache size</b> to 4, and press <b>Send requests</b> again. Compare the hit rate and latency.",
      "Drag the <b>Records</b> slider in the index demo up to a billion.",
    ],
  };
  L["ds-reliability"] = {
    sum: "Reliable = keeps working correctly even when things go wrong. The key is stopping <b>faults</b> from becoming <b>failures</b>.",
    steps: [
      {
        t: 'What "reliable" means',
        b: `<p>A reliable application:</p><p>✓ performs the function the user expected<br>✓ tolerates users making mistakes or using it in unexpected ways<br>✓ performs well enough under the expected load and data volume<br>✓ prevents unauthorised access and abuse</p><p>In short: <b>resilient</b>.</p>`,
      },
      {
        t: "Fault vs failure: the key distinction",
        b: `<p><b>Fault</b>: <i>one component</i> works in an unexpected way (a disk dies, a process hangs).<br><b>Failure</b>: <i>the entire system</i> stops providing the service.</p><span class="analogy">A plane losing one of its four engines is a fault. The plane falling out of the sky is a failure. Good design means one engine out doesn't bring the plane down.</span>`,
        c: {
          type: "cat",
          q: "Was each event a <b>fault</b> (one part misbehaved) or a <b>failure</b> (the whole service stopped)?",
          buckets: ["Fault", "Failure"],
          items: [
            ["One of 50 web servers crashes, and users see no difference", 0],
            ["Every server crashes at once from the same bug and the site goes down", 1],
            ["A disk dies but its mirror keeps serving requests", 0],
            ["The checkout page shows an error to every shopper", 1],
          ],
          hint: "A fault is one part misbehaving. It only becomes a failure if users lose the service.",
          why: "In the first and third events a component misbehaved, but the service kept running: faults. In the others users lost the service: failures.",
        },
      },
      {
        t: "Hardware faults happen constantly",
        b: `<p>Disks, memory modules and power supplies fail. In big data centres this happens <b>all the time</b>:</p><span class="key">A cluster with 10,000 disks has on average <b>one dead disk every day</b>.</span><p>The traditional fix is redundant hardware (RAID for disks, redundant power supplies, hot-swappable CPUs). At huge scale even that isn't enough, so systems must be <b>resilient to whole machines failing</b>.</p>`,
      },
      {
        t: "Software faults are sneakier",
        b: `<p>Hardware faults are mostly <b>uncorrelated</b>: one disk dying doesn't make another die. Software faults are <b>harder to anticipate</b> and can be present on <b>many (or all) nodes at once</b>: a faulty monitoring tool, or a process that overuses resources.</p>`,
      },
      {
        t: "The cascading effect",
        b: `<p>One node fails, and its work moves to the others. They become overloaded and fail too, pushing even more work onto fewer nodes… until everything is down.</p>`,
        v: flow([
          ["Node 1 dies", "rose"],
          ["others take its load", "amber"],
          ["overloaded → die", "rose"],
          ["total failure", "rose"],
        ]),
        c: {
          q: "Why doesn't adding more identical servers protect against a software bug?",
          o: ["Servers are too expensive", "They all run the same buggy code", "They do protect against it"],
          a: 1,
          why: "Correlated faults defeat simple redundancy.",
        },
      },
    ],
    guide: [
      "In the disk demo, set <b>copies of each piece of data</b> to 1 and press <b>Run a year</b>. Every orange flash is also a service failure.",
      "Set <b>copies of each piece of data</b> to 2, press <b>Reset</b>, and press <b>Run 10 years</b>. Compare disk faults with service failures.",
      "In the second demo, press <b>Hardware fault</b> once (tolerated), then again (cascade!). Reset and try <b>Software bug</b>.",
      "Lower the <b>total load</b> and check how many hardware faults the cluster can now survive.",
    ],
  };
  L["ds-load"] = {
    sum: "<b>Scalability</b> = coping with more load. To reason about it, describe <b>load</b> with numbers and judge <b>performance</b> by its whole distribution.",
    steps: [
      {
        t: "Scalability: coping with more load",
        b: `<p>Scalability is a system's ability to <b>cope with increased load</b>. But first we have to say what "load" means for <i>this</i> system.</p>`,
      },
      {
        t: "Load parameters depend on the system",
        b: `<p>Pick the numbers that actually stress your system:</p>`,
        v:
          table(
            ["System", "Load parameter"],
            [
              ["Web application", "requests per second"],
              ["Database", "read/write ratio"],
              ["Online game", "number of concurrent players"],
            ],
          ) +
          `<p class="dim" style="margin-top:8px">Also think about <b>bottlenecks</b>, <b>average vs extreme cases</b>, and the <b>cost of different operations</b>.</p>`,
        c: {
          type: "cat",
          q: "For a chat app, which of these are sensible <b>load parameters</b>?",
          buckets: ["Load parameter", "Not a load parameter"],
          items: [
            ["Messages sent per second", 0],
            ["Number of developers on the team", 1],
            ["Users online at the same time", 0],
            ["Screen resolution of users' phones", 1],
          ],
          hint: "A load parameter is something that makes the servers work harder as it grows.",
          why: "Load is what the servers actually have to handle: messages per second and users online. Team size and screen resolution don't stress the servers.",
        },
      },
      {
        t: "Performance parameters",
        b: `<p><b>Web services</b>: <b>response time</b>, the time between a user sending a request and getting the answer.<br><b>Data analysis</b>: records processed per second, or time to process a dataset of a certain size.</p>`,
      },
      {
        t: "Two questions to ask when load grows",
        b: `<p>① <b>Keep the system the same</b>: how does performance change?<br>② <b>Keep the performance the same</b>: how many more resources do you need?</p>`,
      },
      {
        t: "Look at the distribution, not the average",
        b: `<p>The same request can be fast one moment and slow the next (current load, network delays). So one number like the <b>average</b> isn't enough. Ask: <b>what fraction of users get acceptable performance?</b></p><p>A handy tool: <b>percentiles</b>. p95 = 500 ms means 95% of requests finished within 500 ms (and 5% took longer).</p><span class="analogy">"The average commute is 30 minutes" hides the people stuck for 2 hours. Those are the ones who complain.</span>`,
        c: {
          q: "p99 = 1.2 s means…",
          o: [
            "the average request took 1.2 s",
            "99% of requests took ≤ 1.2 s, and 1% took longer",
            "1% of requests took ≤ 1.2 s, and 99% took longer",
          ],
          a: 1,
          why: "Percentiles tell you about the tail that averages hide.",
        },
      },
    ],
    guide: [
      "In the distribution demo, drag <b>Share of slow requests</b> from 0% to 15%. Watch the mean vs median vs p99.",
      'Move the <b>Target</b> line and read the "Within target" percentage: that\'s the fraction of happy users.',
      "In the load demo, drag <b>Load</b> towards capacity and watch the response time shoot up (question ①).",
      "Set the <b>target response time</b> and read how many servers you need (question ②).",
    ],
  };
})();
