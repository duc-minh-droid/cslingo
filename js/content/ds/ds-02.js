(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});
  const { reg, sorter } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, rnd } = N;

  /* ============ 1.2 Building blocks ============ */
  reg({
    id: "ds-blocks",
    order: 2,
    num: "1.2",
    title: "The four building blocks",
    blurb: "Database, cache, index, batch processing: what each one does, with a live cache and an index race.",
    render(root, life) {
      root.appendChild(header(this, ""));
      sorter(
        root,
        "Which building block solves this?",
        [
          ["Database", "store & retrieve later"],
          ["Cache", "reuse expensive results"],
          ["Index", "search efficiently"],
          ["Batch processing", "periodic jobs over lots of data"],
        ],
        [
          ["Save every order a customer places so it's still there tomorrow", "Database"],
          ["The homepage's 'top 10 products' takes 3 s to compute, so keep the result for a minute", "Cache"],
          ["Find all users whose email starts with 'ali'… quickly", "Index"],
          ["Every night, compute total sales per shop from all of today's orders", "Batch processing"],
          ["Remember a logged-in user's profile so each page doesn't re-query it", "Cache"],
          [
            "Find restaurants within 1 km of a point on a map",
            "Index",
            "spatial data uses special indexes like the R-tree",
          ],
          ["Keep a permanent record of every sensor reading", "Database"],
          ["Once a week, retrain a recommendation model on all purchase history", "Batch processing"],
        ],
      );
      // --- cache demo ---
      const ITEMS = 20,
        DB = 100,
        CACHE = 2;
      const zipf = Array.from({ length: ITEMS }, (_, i) => 1 / (i + 1));
      const zs = zipf.reduce((a, b) => a + b, 0);
      const pickItem = () => {
        let u = rnd() * zs;
        for (let i = 0; i < ITEMS; i++) {
          u -= zipf[i];
          if (u <= 0) return i;
        }
        return ITEMS - 1;
      };
      let cap = 4,
        cache = [],
        hits = 0,
        total = 0,
        lat = 0,
        last = null,
        running = null;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Cache: keep popular answers close</h2><span class="faint">database lookup 100 ms · cache lookup 2 ms</span></div>
        <div class="controls" id="cc"></div>
        <div class="grid two"><div><h3>Requests arriving</h3><div id="req" style="min-height:44px"></div><h3 style="margin-top:12px">Cache contents (most recent first)</h3><div class="pop" id="cache"></div></div>
        <div><div class="stat-row"><div class="stat"><small>Requests</small><b id="tot"></b></div><div class="stat teal"><small>Hit rate</small><b id="hr"></b></div><div class="stat amber"><small>Avg latency</small><b id="al"></b></div></div>
        <p class="dim">A few products are much more popular than the rest (like real shops), so even a small cache catches most requests.</p></div></div>
        <div class="controls"><button class="btn primary" id="go">Send requests</button><button class="btn ghost" id="rs">Reset</button></div></div>`);
      root.appendChild(card);
      const sC = N.slider("Cache size (items)", 0, 20, 1, cap);
      sC.onInput((v) => {
        cap = v;
        cache = cache.slice(0, v);
        reset();
      });
      qs("#cc", card).appendChild(sC);
      function reset() {
        cache = [];
        hits = 0;
        total = 0;
        lat = 0;
        last = null;
        draw();
      }
      function one() {
        const it = pickItem();
        total++;
        const hit = cache.includes(it);
        if (hit) {
          hits++;
          lat += CACHE;
          cache = [it, ...cache.filter((x) => x !== it)];
        } else {
          lat += DB;
          if (cap > 0) cache = [it, ...cache].slice(0, cap);
        }
        last = { it, hit };
      }
      function draw() {
        qs("#req", card).innerHTML = last
          ? `<span class="pill ${last.hit ? "teal" : "rose"}">product #${last.it + 1} → ${last.hit ? "cache HIT (2 ms)" : "MISS → database (100 ms)"}</span>`
          : `<span class="faint">press Send requests</span>`;
        qs("#cache", card).innerHTML =
          cap === 0
            ? `<span class="faint">no cache</span>`
            : cache
                .map(
                  (x) =>
                    `<div class="chip ${last && last.it === x ? "new" : ""}"><small>product</small><b>#${x + 1}</b></div>`,
                )
                .join("") +
              Array.from(
                { length: cap - cache.length },
                () => `<div class="chip" style="opacity:.35"><small>empty</small><b>–</b></div>`,
              ).join("");
        qs("#tot", card).textContent = total;
        qs("#hr", card).textContent = total ? Math.round((100 * hits) / total) + "%" : "–";
        qs("#al", card).textContent = total ? (lat / total).toFixed(1) + " ms" : "–";
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Send requests";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          one();
          draw();
          if (total >= 400) stop();
        }, 60);
      };
      qs("#rs", card).onclick = () => {
        stop();
        reset();
      };
      reset();
      // --- index demo ---
      const ix =
        el(`<div class="card"><div class="card-head"><h2>Index: find one record fast</h2></div><div class="controls" id="ic"></div>
        <div class="grid two"><div>${`<h3>Without an index</h3><p class="dim">Check records one by one until you find it (a <b>full scan</b>).</p>`}<div class="stat rose" style="display:inline-block"><small>Worst-case checks</small><b id="scan"></b></div></div>
        <div><h3>With an index</h3><p class="dim">A sorted structure (like a B-tree) halves the search each step, like finding a word in a dictionary.</p><div class="stat teal" style="display:inline-block"><small>Checks</small><b id="idx"></b></div></div></div>
        <p class="dim" id="ixT" style="margin-top:10px"></p></div>`);
      root.appendChild(ix);
      const sR = N.slider("Records", 1, 9, 1, 6, (v) => (10 ** v).toLocaleString());
      const iu = (v) => {
        const n = 10 ** v;
        qs("#scan", ix).textContent = n.toLocaleString();
        qs("#idx", ix).textContent = Math.ceil(Math.log2(n));
        qs("#ixT", ix).innerHTML =
          `With ${n.toLocaleString()} records, the index needs about <b>${Math.ceil(Math.log2(n))}</b> steps instead of ${n.toLocaleString()}: ${Math.round(n / Math.ceil(Math.log2(n))).toLocaleString()}× fewer. The cost: extra storage, and every write must also update the index.`;
      };
      sR.onInput(iu);
      qs("#ic", ix).appendChild(sR);
      iu(6);
      root.appendChild(
        el(
          `<div class="callout violet"><b>Each block can be built in many ways, and the problem decides which.</b> The lecture's example is <b>spatial data</b>: represent it as <b>GeoJSON</b>, store it in <b>PostGIS</b>, and index it with an <b>R-tree</b>.</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "ds-blocks-1",
          q: "Set the cache size to 0, then to 4. Why does a cache of just 4 out of 20 products catch so many requests?",
          opts: ["It's random luck", "Popularity is skewed", "The cache is faster at being wrong"],
          a: 1,
          why: "Real workloads are skewed (a few hot items). Caching the hot ones gives most of the speed-up for a fraction of the memory.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Database</b>: store data so it can be retrieved later.",
            "<b>Cache</b>: store results of expensive operations to reuse soon.",
            "<b>Index</b>: let users search the data efficiently.",
            "<b>Batch processing</b>: periodically run routines over large amounts of accumulated data.",
            "Each block has many implementations, and the problem determines the choice (e.g. spatial: GeoJSON, PostGIS, R-tree).",
          ],
          "Data apps are built from four blocks: databases store, caches reuse, indexes search, batch jobs crunch.",
        ),
      );
    },
  });

  /* ============ 1.3 Reliability ============ */
  reg({
    id: "ds-reliability",
    order: 3,
    num: "1.3",
    title: "Reliability: faults vs failures",
    blurb:
      "Watch 10,000 disks fail every day without the service failing, then watch one software bug take everything down.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const n = 10000,
        p = 1e-4;
      let R = 3,
        rep = 1,
        day = 0,
        down,
        faults,
        outages,
        groupDown,
        running = null;
      const card =
        el(`<div class="card"><div class="card-head"><h2>A data centre with 10,000 disks</h2><span class="faint">each disk has a 1-in-10,000 chance of dying each day</span></div>
        <div class="controls" id="d1"></div>
        <div class="grid side"><canvas class="viz" id="grid" style="image-rendering:pixelated"></canvas><div>
          <div class="stat-row"><div class="stat"><small>Days</small><b id="dd"></b></div><div class="stat amber"><small>Disk faults</small><b id="df"></b></div><div class="stat rose"><small>Service failures</small><b id="so"></b></div></div>
          <p class="dim" id="dT"></p></div></div>
        <div class="controls"><button class="btn primary" id="go">Run a year</button><button class="btn" id="dec">Run 10 years (instant)</button><button class="btn ghost" id="rs">Reset</button></div></div>`);
      root.appendChild(card);
      const sRep = N.slider("Copies of each piece of data", 1, 3, 1, rep),
        sRt = N.slider("Days to replace a dead disk", 1, 14, 1, R);
      sRep.onInput((v) => {
        rep = v;
        reset();
      });
      sRt.onInput((v) => (R = v));
      qs("#d1", card).append(sRep, sRt);
      function reset() {
        stop();
        day = 0;
        down = new Float64Array(n);
        faults = 0;
        outages = 0;
        groupDown = new Uint8Array(Math.ceil(n / rep));
        draw();
      }
      function step() {
        for (let i = 0; i < n; i++)
          if (down[i] <= day && rnd() < p) {
            down[i] = day + R;
            faults++;
          }
        for (let g = 0, gi = 0; g < n; g += rep, gi++) {
          let all = true;
          for (let k = 0; k < rep && g + k < n; k++) if (down[g + k] <= day) all = false;
          if (all && !groupDown[gi]) outages++;
          groupDown[gi] = all ? 1 : 0;
        }
        day++;
      }
      function draw() {
        const cv = qs("#grid", card);
        const W = 100;
        cv.width = W;
        cv.height = W;
        cv.style.height = Math.min(cv.clientWidth || 300, 320) + "px";
        const ctx = cv.getContext("2d"),
          img = ctx.createImageData(W, W);
        for (let i = 0; i < n; i++) {
          const o = i * 4,
            dead = down[i] > day,
            gd = groupDown[Math.floor(i / rep)];
          const c = gd ? [255, 75, 75] : dead ? [255, 150, 0] : [215, 255, 184];
          img.data[o] = c[0];
          img.data[o + 1] = c[1];
          img.data[o + 2] = c[2];
          img.data[o + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        qs("#dd", card).textContent = day;
        qs("#df", card).textContent = faults;
        qs("#so", card).textContent = outages;
        qs("#dT", card).innerHTML =
          `<span style="color:var(--amber-ink)">■</span> dead disk being replaced · <span style="color:var(--rose-ink)">■</span> data unavailable (every copy is dead)<br><br>` +
          (rep === 1
            ? "With <b>1 copy</b>, every disk fault is also a <b>failure</b>: some data becomes unavailable to users."
            : `With <b>${rep} copies</b>, a failure needs all ${rep} copies of the same data to die before repairs finish, which almost never happens. Faults are <b>tolerated</b>.`);
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run a year";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        let k = 0;
        running = life.interval(() => {
          for (let j = 0; j < 3; j++) step();
          k += 3;
          draw();
          if (k >= 365) stop();
        }, 30);
      };
      qs("#dec", card).onclick = () => {
        stop();
        for (let k = 0; k < 3650; k++) step();
        draw();
      };
      qs("#rs", card).onclick = reset;
      reset();

      // --- cascade / software fault ---
      const NODES = 6,
        CAP = 100;
      let totalLoad = 420,
        alive,
        busy = false;
      const cs =
        el(`<div class="card"><div class="card-head"><h2>Hardware fault vs software fault vs cascade</h2><span class="faint">6 servers, each can handle ${CAP} units of load</span></div>
        <div class="controls" id="k1"></div><div id="nodes" style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0"></div>
        <div class="controls"><button class="btn" id="hw">💥 Hardware fault (kill 1 server)</button><button class="btn" id="sw">🐞 Software bug (same bug on every server)</button><button class="btn ghost" id="rs2">Reset</button></div>
        <div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(cs);
      const sLd = N.slider("Total load", 100, 600, 10, totalLoad);
      sLd.onInput((v) => {
        totalLoad = v;
        draw2();
      });
      qs("#k1", cs).appendChild(sLd);
      const reset2 = () => {
        alive = Array(NODES).fill(true);
        busy = false;
        qs("#msg", cs).style.display = "none";
        draw2();
      };
      const per = () => {
        const a = alive.filter(Boolean).length;
        return a ? totalLoad / a : Infinity;
      };
      function draw2() {
        const pl = per();
        qs("#nodes", cs).innerHTML = alive
          .map(
            (ok, i) =>
              `<div style="width:92px;padding:10px;border-radius:10px;background:var(--bg-2);border:1px solid ${!ok ? "var(--rose)" : pl > CAP ? "var(--amber)" : "var(--line-2)"}"><div style="font-size:12px">${ok ? "Server " + (i + 1) : "💀 down"}</div><div class="mono" style="font-size:12px;color:${ok && pl > CAP ? "var(--amber)" : "var(--text-dim)"}">${ok ? Math.round(pl) + " / " + CAP : "–"}</div><div style="height:6px;border-radius:3px;background:var(--bg);margin-top:6px;overflow:hidden"><div style="height:100%;width:${ok ? Math.min(100, (pl / CAP) * 100) : 0}%;background:${pl > CAP ? "var(--amber)" : "var(--teal)"}"></div></div></div>`,
          )
          .join("");
      }
      const msg = (h, c) => {
        const m = qs("#msg", cs);
        m.style.display = "block";
        m.className = "callout " + c;
        m.innerHTML = h;
      };
      function cascade() {
        if (per() <= CAP) {
          busy = false;
          return;
        }
        const i = alive.findIndex(Boolean);
        if (i < 0) {
          busy = false;
          return;
        }
        life.timeout(() => {
          alive[i] = false;
          draw2();
          if (!alive.some(Boolean)) {
            msg(
              "<b>Cascading failure.</b> Each crash pushed its load onto the survivors, overloading them in turn, until nothing was left. One fault turned into a total failure.",
              "rose",
            );
            busy = false;
            return;
          }
          cascade();
        }, 550);
      }
      qs("#hw", cs).onclick = () => {
        if (busy) return;
        const i = alive.findIndex(Boolean);
        if (i < 0) return;
        busy = true;
        alive[i] = false;
        draw2();
        if (per() > CAP) {
          msg("A server died and its load moved to the others, and now they're <b>overloaded</b>… watch.", "rose");
          cascade();
        } else {
          msg(
            `Hardware fault tolerated: the load was spread over the remaining ${alive.filter(Boolean).length} servers, each now at ${Math.round(per())}/${CAP}. This is a <b>fault, not a failure</b>.`,
            "teal",
          );
          busy = false;
        }
      };
      qs("#sw", cs).onclick = () => {
        if (busy) return;
        alive = alive.map(() => false);
        draw2();
        msg(
          "<b>Software faults are correlated.</b> The same buggy code runs on every node, so they all fail together. Having more servers didn't help at all. Hardware faults, by contrast, are mostly independent.",
          "rose",
        );
      };
      qs("#rs2", cs).onclick = reset2;
      reset2();
      root.appendChild(
        predict({
          id: "ds-rel-1",
          q: "A cluster has 10,000 disks and loses about one per day. Is the service failing every day?",
          opts: ["Yes, a dead disk is a failure", "Not if data is replicated", "Only on weekends"],
          a: 1,
          why: "Fault = one component misbehaves. Failure = the whole system stops providing the service. Reliable systems are designed so faults don't become failures.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Reliable = does what users expect, tolerates user mistakes, performs well enough under expected load, and prevents unauthorised access.",
            "<b>Fault</b>: one component behaves unexpectedly. <b>Failure</b>: the entire system stops providing the service.",
            "Hardware faults happen constantly at scale (10,000 disks → ~1 dead per day) but are mostly <b>uncorrelated</b>. RAID and redundant PSUs help, but at scale you need software-level resilience.",
            "Software faults are harder to anticipate and <b>correlated</b> (present on many nodes at once), and they can <b>cascade</b>.",
          ],
          "Faults are inevitable, so reliable systems stop them turning into failures, and software faults are the dangerous correlated kind.",
        ),
      );
    },
  });
})();
