/* Data Science (COM3021) — Lecture 1: reliable, scalable and maintainable data systems */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd, shuffle } = N;
  const S = "ds";
  const reg = (m) => N.register({ subject: S, lecture: 1, ...m });

  // ---------- shared small builders ----------
  const table = (head, rows) => `<table class="t" style="max-width:680px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const flow = (items) => `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;
  const box = (label, sub, color) => `<div style="border:1px solid ${color || "var(--line-2)"};border-radius:10px;padding:8px 12px;background:var(--bg-2);min-width:110px"><b>${label}</b><br><span class="faint" style="font-size:12.5px">${sub}</span></div>`;
  function sorter(root, title, cats, items) {
    let order = shuffle(items.map((_, i) => i)), idx = 0, right = 0, log = [];
    const card = el(`<div class="card"><div class="card-head"><h2>${title}</h2><span class="mono dim" data-sc></span></div>
      <div data-item style="font-size:18px;font-weight:600;margin:4px 0 14px"></div>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(cats.length, 4)},1fr);gap:10px">${cats.map(([c, d]) => `<button class="btn" data-c="${c}" style="text-align:left;padding:12px 14px;white-space:normal"><b>${c}</b>${d ? `<br><span class="faint" style="font-size:12.5px">${d}</span>` : ""}</button>`).join("")}</div>
      <div data-fb style="margin-top:12px;min-height:24px"></div><table class="t" data-log style="margin-top:8px"></table></div>`);
    const draw = () => {
      qs("[data-sc]", card).textContent = `${right} / ${log.length}`;
      qs("[data-item]", card).textContent = idx < order.length ? `“${items[order[idx]][0]}”` : `Done: ${right}/${items.length}`;
      qs("[data-log]", card).innerHTML = log.map(([i, p]) => `<tr><td>${items[i][0]}</td><td style="color:${p === items[i][1] ? "var(--teal)" : "var(--rose)"}">${p}</td><td class="faint">${p === items[i][1] ? "" : "→ " + items[i][1]}${items[i][2] ? ` · ${items[i][2]}` : ""}</td></tr>`).join("");
    };
    qsa("[data-c]", card).forEach((b) => (b.onclick = () => {
      if (idx >= order.length) return;
      const i = order[idx], ok = b.dataset.c === items[i][1];
      if (ok) right++; log.unshift([i, b.dataset.c]); idx++;
      qs("[data-fb]", card).innerHTML = ok ? `<span style="color:var(--teal)">✓ ${items[i][1]}</span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}` : `<span style="color:var(--rose)">✗ It's <b>${items[i][1]}</b></span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`;
      draw();
    }));
    draw(); root.appendChild(card);
  }

  /* ============ 1.1 Why data-intensive? ============ */
  reg({
    id: "ds-why", order: 1, num: "1.1", title: "Why data-intensive systems are hard",
    blurb: "From one mainframe to Google-scale: why a single server broke down, and the two big trade-offs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      // --- single server vs cluster ---
      let mode = "single", load = 3000, nodes = 6, broken = new Set();
      const CAP_BIG = 6000, CAP_SMALL = 1000;
      const card = el(`<div class="card"><div class="card-head"><h2>One powerful server vs many cheap ones</h2></div>
        <div class="controls" id="b1"></div><div class="controls" id="b2"></div>
        <div id="machines" style="display:flex;gap:10px;flex-wrap:wrap;margin:10px 0"></div>
        <div class="stat-row"><div class="stat"><small>Capacity (req/s)</small><b id="cap"></b></div><div class="stat teal"><small>Served</small><b id="srv"></b></div><div class="stat rose"><small>Dropped</small><b id="drp"></b></div><div class="stat"><small>Status</small><b id="stt"></b></div></div>
        <p class="faint" style="font-size:12.5px">Click a machine to break it (a fault), and click again to repair it. The numbers are illustrative.</p></div>`);
      root.appendChild(card);
      const sL = N.slider("Incoming load (requests/sec)", 0, 12000, 100, load, (v) => v.toLocaleString());
      sL.onInput((v) => { load = v; draw(); });
      const sN = N.slider("Cheap machines", 2, 12, 1, nodes);
      sN.onInput((v) => { nodes = v; broken.clear(); draw(); });
      qs("#b1", card).append(N.seg([["single", "Single powerful server"], ["cluster", "Cluster of cheap machines"]], mode, (v) => { mode = v; broken.clear(); sN.style.display = v === "cluster" ? "" : "none"; draw(); }), sN);
      sN.style.display = "none";
      qs("#b2", card).append(sL);
      function draw() {
        const ms = mode === "single" ? [{ cap: CAP_BIG, name: "Mainframe" }] : Array.from({ length: nodes }, (_, i) => ({ cap: CAP_SMALL, name: "Node " + (i + 1) }));
        const alive = ms.filter((_, i) => !broken.has(i));
        const cap = alive.reduce((a, m) => a + m.cap, 0), served = Math.min(load, cap);
        const per = alive.length ? load / alive.length : 0;
        qs("#machines", card).innerHTML = ms.map((m, i) => {
          const dead = broken.has(i), util = dead ? 0 : Math.min(1, per / m.cap);
          return `<button class="btn" data-i="${i}" style="width:${mode === "single" ? 220 : 96}px;padding:10px;text-align:left;border-color:${dead ? "var(--rose)" : util >= 1 ? "var(--amber)" : "var(--line-2)"}">
            <div style="font-size:12px" class="${dead ? "" : "dim"}">${dead ? "💥 " : ""}${m.name}</div><div class="mono" style="font-size:11px;color:var(--text-faint)">${m.cap.toLocaleString()} req/s</div>
            <div style="height:6px;border-radius:3px;background:var(--bg);margin-top:6px;overflow:hidden"><div style="height:100%;width:${util * 100}%;background:${util >= 1 ? "var(--amber)" : "var(--teal)"}"></div></div></button>`;
        }).join("");
        qsa("#machines [data-i]", card).forEach((b) => (b.onclick = () => { const i = +b.dataset.i; broken.has(i) ? broken.delete(i) : broken.add(i); draw(); }));
        qs("#cap", card).textContent = cap.toLocaleString(); qs("#srv", card).textContent = served.toLocaleString(); qs("#drp", card).textContent = (load - served).toLocaleString();
        const st = cap === 0 ? ["DOWN", "var(--rose)"] : load > cap ? ["Overloaded", "var(--amber)"] : ["Up", "var(--teal)"];
        qs("#stt", card).textContent = st[0]; qs("#stt", card).style.color = st[1];
      }
      draw();

      // --- consistency vs availability ---
      let a = 5, b = 5, link = true, pref = "consistent", logs = [];
      const cv = el(`<div class="card"><div class="card-head"><h2>Consistency vs availability</h2><span class="tag">the first trade-off</span></div>
        <p class="dim">The same "tickets left" value is stored on two servers (replicas) in different cities. They copy updates to each other over a network link.</p>
        <div class="controls" id="c1"></div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin:10px 0">
          <div class="card" style="margin:0;background:var(--bg-2);text-align:center"><div class="faint">🇬🇧 London replica</div><div class="mono" style="font-size:28px" id="va"></div><button class="btn small" id="buy">Buy 1 ticket here</button></div>
          <button class="btn" id="lnk"></button>
          <div class="card" style="margin:0;background:var(--bg-2);text-align:center"><div class="faint">🇺🇸 New York replica</div><div class="mono" style="font-size:28px" id="vb"></div><button class="btn small" id="read">Read "tickets left" here</button></div>
        </div><div id="clog" class="log"></div></div>`);
      root.appendChild(cv);
      qs("#c1", cv).append(el(`<span class="faint" style="font-size:13px">When the link is broken, New York should…</span>`), N.seg([["consistent", "stay consistent (refuse to answer)"], ["available", "stay available (answer anyway)"]], pref, (v) => (pref = v)));
      const cdraw = () => {
        qs("#va", cv).textContent = a; qs("#vb", cv).textContent = b;
        qs("#lnk", cv).innerHTML = link ? "⇄ link OK<br><span class='faint' style='font-size:11px'>click to cut</span>" : "✂ link CUT<br><span class='faint' style='font-size:11px'>click to repair</span>";
        qs("#lnk", cv).style.borderColor = link ? "var(--teal)" : "var(--rose)";
        qs("#clog", cv).innerHTML = logs.slice(0, 6).map((l) => `<div style="margin:4px 0">${l}</div>`).join("");
      };
      qs("#buy", cv).onclick = () => { if (a > 0) a--; if (link) { b = a; logs.unshift(`London sold a ticket → ${a}. Copied to New York straight away.`); } else logs.unshift(`London sold a ticket → ${a}. <span style="color:var(--amber)">Link is cut, so New York still thinks ${b}.</span>`); cdraw(); };
      qs("#read", cv).onclick = () => {
        if (link) logs.unshift(`New York answers <b>${b}</b>, which is correct and up to date. ✓`);
        else if (pref === "consistent") logs.unshift(`<span style="color:var(--rose)">New York refuses: "can't confirm the latest value, try later".</span> Consistent, but <b>unavailable</b>.`);
        else logs.unshift(`New York answers <b>${b}</b>${b !== a ? ` <span style="color:var(--amber)">but the real value is ${a}: stale!</span> Available, but <b>inconsistent</b>.` : " (happens to still be correct)."}`);
        cdraw();
      };
      qs("#lnk", cv).onclick = () => { link = !link; if (link) { b = a; logs.unshift(`Link repaired. Replicas sync → both ${a}.`); } else logs.unshift("✂ Network link cut."); cdraw(); };
      cdraw();

      root.appendChild(predict({ id: "ds-why-1", q: "An online shop's single database server dies at 2 a.m. What limitation of the traditional approach is this?", opts: ["Scalability", "Availability and fault tolerance: one machine means one point of failure", "Maintenance"], a: 1,
        why: "With everything on one server, any fault takes the whole service down. Spreading work over several machines lets the service survive individual faults." }));
      root.appendChild(takeaways([
        "Past: single servers (mainframes), static data formats, expensive RDBMSs (MS SQL, Oracle).",
        "The Web changed everything: more services online, dynamically generated content, rapid growth (Google, eBay, Facebook).",
        "Single servers struggle with <b>availability / fault tolerance</b>, <b>scalability</b> and <b>maintenance</b>.",
        "Two trade-offs: <b>consistency vs availability</b>, and <b>one powerful system vs several cheap commodity computers</b>.",
      ], "The web made data huge and dynamic, and single servers couldn't stay up or keep up, so we trade consistency against availability and one big machine against many cheap ones."));
    },
  });

  /* ============ 1.2 Building blocks ============ */
  reg({
    id: "ds-blocks", order: 2, num: "1.2", title: "The four building blocks",
    blurb: "Database, cache, index, batch processing: what each one does, with a live cache and an index race.",
    render(root, life) {
      root.appendChild(header(this, ""));
      sorter(root, "Which building block solves this?", [["Database", "store & retrieve later"], ["Cache", "reuse expensive results"], ["Index", "search efficiently"], ["Batch processing", "periodic jobs over lots of data"]], [
        ["Save every order a customer places so it's still there tomorrow", "Database"],
        ["The homepage's 'top 10 products' takes 3 s to compute, so keep the result for a minute", "Cache"],
        ["Find all users whose email starts with 'ali'… quickly", "Index"],
        ["Every night, compute total sales per shop from all of today's orders", "Batch processing"],
        ["Remember a logged-in user's profile so each page doesn't re-query it", "Cache"],
        ["Find restaurants within 1 km of a point on a map", "Index", "spatial data uses special indexes like the R-tree"],
        ["Keep a permanent record of every sensor reading", "Database"],
        ["Once a week, retrain a recommendation model on all purchase history", "Batch processing"],
      ]);
      // --- cache demo ---
      const ITEMS = 20, DB = 100, CACHE = 2;
      const zipf = Array.from({ length: ITEMS }, (_, i) => 1 / (i + 1)); const zs = zipf.reduce((a, b) => a + b, 0);
      const pickItem = () => { let u = rnd() * zs; for (let i = 0; i < ITEMS; i++) { u -= zipf[i]; if (u <= 0) return i; } return ITEMS - 1; };
      let cap = 4, cache = [], hits = 0, total = 0, lat = 0, last = null, running = null;
      const card = el(`<div class="card"><div class="card-head"><h2>Cache: keep popular answers close</h2><span class="faint">database lookup 100 ms · cache lookup 2 ms</span></div>
        <div class="controls" id="cc"></div>
        <div class="grid two"><div><h3>Requests arriving</h3><div id="req" style="min-height:44px"></div><h3 style="margin-top:12px">Cache contents (most recent first)</h3><div class="pop" id="cache"></div></div>
        <div><div class="stat-row"><div class="stat"><small>Requests</small><b id="tot"></b></div><div class="stat teal"><small>Hit rate</small><b id="hr"></b></div><div class="stat amber"><small>Avg latency</small><b id="al"></b></div></div>
        <p class="dim">A few products are much more popular than the rest (like real shops), so even a small cache catches most requests.</p></div></div>
        <div class="controls"><button class="btn primary" id="go">Send requests</button><button class="btn ghost" id="rs">Reset</button></div></div>`);
      root.appendChild(card);
      const sC = N.slider("Cache size (items)", 0, 20, 1, cap); sC.onInput((v) => { cap = v; cache = cache.slice(0, v); reset(); });
      qs("#cc", card).appendChild(sC);
      function reset() { cache = []; hits = 0; total = 0; lat = 0; last = null; draw(); }
      function one() {
        const it = pickItem(); total++;
        const hit = cache.includes(it);
        if (hit) { hits++; lat += CACHE; cache = [it, ...cache.filter((x) => x !== it)]; }
        else { lat += DB; if (cap > 0) cache = [it, ...cache].slice(0, cap); }
        last = { it, hit };
      }
      function draw() {
        qs("#req", card).innerHTML = last ? `<span class="pill ${last.hit ? "teal" : "rose"}">product #${last.it + 1} → ${last.hit ? "cache HIT (2 ms)" : "MISS → database (100 ms)"}</span>` : `<span class="faint">press Send requests</span>`;
        qs("#cache", card).innerHTML = cap === 0 ? `<span class="faint">no cache</span>` : cache.map((x) => `<div class="chip ${last && last.it === x ? "new" : ""}"><small>product</small><b>#${x + 1}</b></div>`).join("") + Array.from({ length: cap - cache.length }, () => `<div class="chip" style="opacity:.35"><small>empty</small><b>–</b></div>`).join("");
        qs("#tot", card).textContent = total; qs("#hr", card).textContent = total ? Math.round((100 * hits) / total) + "%" : "–"; qs("#al", card).textContent = total ? (lat / total).toFixed(1) + " ms" : "–";
      }
      function stop() { if (running) { running(); running = null; qs("#go", card).textContent = "Send requests"; qs("#go", card).classList.remove("on"); } }
      qs("#go", card).onclick = () => { if (running) return stop(); qs("#go", card).textContent = "Pause"; qs("#go", card).classList.add("on"); running = life.interval(() => { one(); draw(); if (total >= 400) stop(); }, 60); };
      qs("#rs", card).onclick = () => { stop(); reset(); };
      reset();
      // --- index demo ---
      const ix = el(`<div class="card"><div class="card-head"><h2>Index: find one record fast</h2></div><div class="controls" id="ic"></div>
        <div class="grid two"><div>${`<h3>Without an index</h3><p class="dim">Check records one by one until you find it (a <b>full scan</b>).</p>`}<div class="stat rose" style="display:inline-block"><small>Worst-case checks</small><b id="scan"></b></div></div>
        <div><h3>With an index</h3><p class="dim">A sorted structure (like a B-tree) halves the search each step, like finding a word in a dictionary.</p><div class="stat teal" style="display:inline-block"><small>Checks</small><b id="idx"></b></div></div></div>
        <p class="dim" id="ixT" style="margin-top:10px"></p></div>`);
      root.appendChild(ix);
      const sR = N.slider("Records", 1, 9, 1, 6, (v) => (10 ** v).toLocaleString());
      const iu = (v) => { const n = 10 ** v; qs("#scan", ix).textContent = n.toLocaleString(); qs("#idx", ix).textContent = Math.ceil(Math.log2(n)); qs("#ixT", ix).innerHTML = `With ${n.toLocaleString()} records, the index needs about <b>${Math.ceil(Math.log2(n))}</b> steps instead of ${n.toLocaleString()}: ${Math.round(n / Math.ceil(Math.log2(n))).toLocaleString()}× fewer. The cost: extra storage, and every write must also update the index.`; };
      sR.onInput(iu); qs("#ic", ix).appendChild(sR); iu(6);
      root.appendChild(el(`<div class="callout violet"><b>Each block can be built in many ways, and the problem decides which.</b> The lecture's example is <b>spatial data</b>: represent it as <b>GeoJSON</b>, store it in <b>PostGIS</b>, and index it with an <b>R-tree</b>.</div>`));
      root.appendChild(predict({ id: "ds-blocks-1", q: "Set the cache size to 0, then to 4. Why does a cache of just 4 out of 20 products catch so many requests?", opts: ["It's random luck", "Popularity is skewed: a few items get most of the requests, and the cache keeps exactly those", "The cache is faster at being wrong"], a: 1,
        why: "Real workloads are skewed (a few hot items). Caching the hot ones gives most of the speed-up for a fraction of the memory." }));
      root.appendChild(takeaways([
        "<b>Database</b>: store data so it can be retrieved later.",
        "<b>Cache</b>: store results of expensive operations to reuse soon.",
        "<b>Index</b>: let users search the data efficiently.",
        "<b>Batch processing</b>: periodically run routines over large amounts of accumulated data.",
        "Each block has many implementations, and the problem determines the choice (e.g. spatial: GeoJSON, PostGIS, R-tree).",
      ], "Data apps are built from four blocks: databases store, caches reuse, indexes search, batch jobs crunch."));
    },
  });

  /* ============ 1.3 Reliability ============ */
  reg({
    id: "ds-reliability", order: 3, num: "1.3", title: "Reliability: faults vs failures",
    blurb: "Watch 10,000 disks fail every day without the service failing, then watch one software bug take everything down.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const n = 10000, p = 1e-4;
      let R = 3, rep = 1, day = 0, down, faults, outages, groupDown, running = null;
      const card = el(`<div class="card"><div class="card-head"><h2>A data centre with 10,000 disks</h2><span class="faint">each disk has a 1-in-10,000 chance of dying each day</span></div>
        <div class="controls" id="d1"></div>
        <div class="grid side"><canvas class="viz" id="grid" style="image-rendering:pixelated"></canvas><div>
          <div class="stat-row"><div class="stat"><small>Days</small><b id="dd"></b></div><div class="stat amber"><small>Disk faults</small><b id="df"></b></div><div class="stat rose"><small>Service failures</small><b id="so"></b></div></div>
          <p class="dim" id="dT"></p></div></div>
        <div class="controls"><button class="btn primary" id="go">Run a year</button><button class="btn" id="dec">Run 10 years (instant)</button><button class="btn ghost" id="rs">Reset</button></div></div>`);
      root.appendChild(card);
      const sRep = N.slider("Copies of each piece of data", 1, 3, 1, rep), sRt = N.slider("Days to replace a dead disk", 1, 14, 1, R);
      sRep.onInput((v) => { rep = v; reset(); }); sRt.onInput((v) => (R = v));
      qs("#d1", card).append(sRep, sRt);
      function reset() { stop(); day = 0; down = new Float64Array(n); faults = 0; outages = 0; groupDown = new Uint8Array(Math.ceil(n / rep)); draw(); }
      function step() {
        for (let i = 0; i < n; i++) if (down[i] <= day && rnd() < p) { down[i] = day + R; faults++; }
        for (let g = 0, gi = 0; g < n; g += rep, gi++) {
          let all = true; for (let k = 0; k < rep && g + k < n; k++) if (down[g + k] <= day) all = false;
          if (all && !groupDown[gi]) outages++;
          groupDown[gi] = all ? 1 : 0;
        }
        day++;
      }
      function draw() {
        const cv = qs("#grid", card); const W = 100;
        cv.width = W; cv.height = W; cv.style.height = Math.min(cv.clientWidth || 300, 320) + "px";
        const ctx = cv.getContext("2d"), img = ctx.createImageData(W, W);
        for (let i = 0; i < n; i++) { const o = i * 4, dead = down[i] > day, gd = groupDown[Math.floor(i / rep)]; const c = gd ? [255, 75, 75] : dead ? [255, 150, 0] : [215, 255, 184]; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255; }
        ctx.putImageData(img, 0, 0);
        qs("#dd", card).textContent = day; qs("#df", card).textContent = faults; qs("#so", card).textContent = outages;
        qs("#dT", card).innerHTML = `<span style="color:var(--amber)">■</span> dead disk being replaced · <span style="color:var(--rose)">■</span> data unavailable (every copy is dead)<br><br>` + (rep === 1 ? "With <b>1 copy</b>, every disk fault is also a <b>failure</b>: some data becomes unavailable to users." : `With <b>${rep} copies</b>, a failure needs all ${rep} copies of the same data to die before repairs finish, which almost never happens. Faults are <b>tolerated</b>.`);
      }
      function stop() { if (running) { running(); running = null; qs("#go", card).textContent = "Run a year"; qs("#go", card).classList.remove("on"); } }
      qs("#go", card).onclick = () => { if (running) return stop(); qs("#go", card).textContent = "Pause"; qs("#go", card).classList.add("on"); let k = 0; running = life.interval(() => { for (let j = 0; j < 3; j++) step(); k += 3; draw(); if (k >= 365) stop(); }, 30); };
      qs("#dec", card).onclick = () => { stop(); for (let k = 0; k < 3650; k++) step(); draw(); };
      qs("#rs", card).onclick = reset;
      reset();

      // --- cascade / software fault ---
      const NODES = 6, CAP = 100;
      let totalLoad = 420, alive, busy = false;
      const cs = el(`<div class="card"><div class="card-head"><h2>Hardware fault vs software fault vs cascade</h2><span class="faint">6 servers, each can handle ${CAP} units of load</span></div>
        <div class="controls" id="k1"></div><div id="nodes" style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0"></div>
        <div class="controls"><button class="btn" id="hw">💥 Hardware fault (kill 1 server)</button><button class="btn" id="sw">🐞 Software bug (same bug on every server)</button><button class="btn ghost" id="rs2">Reset</button></div>
        <div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(cs);
      const sLd = N.slider("Total load", 100, 600, 10, totalLoad); sLd.onInput((v) => { totalLoad = v; draw2(); });
      qs("#k1", cs).appendChild(sLd);
      const reset2 = () => { alive = Array(NODES).fill(true); busy = false; qs("#msg", cs).style.display = "none"; draw2(); };
      const per = () => { const a = alive.filter(Boolean).length; return a ? totalLoad / a : Infinity; };
      function draw2() {
        const pl = per();
        qs("#nodes", cs).innerHTML = alive.map((ok, i) => `<div style="width:92px;padding:10px;border-radius:10px;background:var(--bg-2);border:1px solid ${!ok ? "var(--rose)" : pl > CAP ? "var(--amber)" : "var(--line-2)"}"><div style="font-size:12px">${ok ? "Server " + (i + 1) : "💀 down"}</div><div class="mono" style="font-size:12px;color:${ok && pl > CAP ? "var(--amber)" : "var(--text-dim)"}">${ok ? Math.round(pl) + " / " + CAP : "–"}</div><div style="height:6px;border-radius:3px;background:var(--bg);margin-top:6px;overflow:hidden"><div style="height:100%;width:${ok ? Math.min(100, (pl / CAP) * 100) : 0}%;background:${pl > CAP ? "var(--amber)" : "var(--teal)"}"></div></div></div>`).join("");
      }
      const msg = (h, c) => { const m = qs("#msg", cs); m.style.display = "block"; m.className = "callout " + c; m.innerHTML = h; };
      function cascade() {
        if (per() <= CAP) { busy = false; return; }
        const i = alive.findIndex(Boolean); if (i < 0) { busy = false; return; }
        life.timeout(() => {
          alive[i] = false; draw2();
          if (!alive.some(Boolean)) { msg("<b>Cascading failure.</b> Each crash pushed its load onto the survivors, overloading them in turn, until nothing was left. One fault turned into a total failure.", "rose"); busy = false; return; }
          cascade();
        }, 550);
      }
      qs("#hw", cs).onclick = () => {
        if (busy) return; const i = alive.findIndex(Boolean); if (i < 0) return;
        busy = true; alive[i] = false; draw2();
        if (per() > CAP) { msg("A server died and its load moved to the others, and now they're <b>overloaded</b>… watch.", "rose"); cascade(); }
        else { msg(`Hardware fault tolerated: the load was spread over the remaining ${alive.filter(Boolean).length} servers, each now at ${Math.round(per())}/${CAP}. This is a <b>fault, not a failure</b>.`, "teal"); busy = false; }
      };
      qs("#sw", cs).onclick = () => { if (busy) return; alive = alive.map(() => false); draw2(); msg("<b>Software faults are correlated.</b> The same buggy code runs on every node, so they all fail together. Having more servers didn't help at all. Hardware faults, by contrast, are mostly independent.", "rose"); };
      qs("#rs2", cs).onclick = reset2;
      reset2();
      root.appendChild(predict({ id: "ds-rel-1", q: "A cluster has 10,000 disks and loses about one per day. Is the service failing every day?", opts: ["Yes, a dead disk is a failure", "Not if data is replicated: a dead disk is a <b>fault</b>, and it only becomes a <b>failure</b> if the whole service stops", "Only on weekends"], a: 1,
        why: "Fault = one component misbehaves. Failure = the whole system stops providing the service. Reliable systems are designed so faults don't become failures." }));
      root.appendChild(takeaways([
        "Reliable = does what users expect, tolerates user mistakes, performs well enough under expected load, and prevents unauthorised access.",
        "<b>Fault</b>: one component behaves unexpectedly. <b>Failure</b>: the entire system stops providing the service.",
        "Hardware faults happen constantly at scale (10,000 disks → ~1 dead per day) but are mostly <b>uncorrelated</b>. RAID and redundant PSUs help, but at scale you need software-level resilience.",
        "Software faults are harder to anticipate and <b>correlated</b> (present on many nodes at once), and they can <b>cascade</b>.",
      ], "Faults are inevitable, so reliable systems stop them turning into failures, and software faults are the dangerous correlated kind."));
    },
  });

  /* ============ 1.4 Load & performance ============ */
  reg({
    id: "ds-load", order: 4, num: "1.4", title: "Load & performance",
    blurb: "Describe load with numbers, read response-time distributions, and see why an average hides your unhappiest users.",
    render(root, life) {
      root.appendChild(header(this, ""));
      // --- distribution ---
      let tail = 0.05, slo = 300, data = [];
      const card = el(`<div class="card"><div class="card-head"><h2>1,000 requests: the response-time distribution</h2></div><div class="controls" id="p1"></div>
        <canvas class="viz" id="hist"></canvas>
        <div class="stat-row"><div class="stat"><small>Mean (average)</small><b id="mn"></b></div><div class="stat teal"><small>Median (p50)</small><b id="md"></b></div><div class="stat amber"><small>p95</small><b id="p95"></b></div><div class="stat rose"><small>p99</small><b id="p99"></b></div><div class="stat violet"><small>Within target</small><b id="ok"></b></div></div>
        <p class="dim">p95 = 95% of requests were faster than this. The dashed line is your target ("respond within X ms").</p>
        <div class="controls"><button class="btn" id="regen">New sample</button></div></div>`);
      root.appendChild(card);
      const sT = N.slider("Share of slow requests", 0, 0.3, 0.01, tail, (v) => Math.round(v * 100) + "%"), sS = N.slider("Target (ms)", 100, 1500, 50, slo);
      sT.onInput((v) => { tail = v; gen(); }); sS.onInput((v) => { slo = v; draw(); });
      qs("#p1", card).append(sT, sS);
      const gn = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      function gen() { data = Array.from({ length: 1000 }, () => (rnd() < tail ? 600 + rnd() * 1800 : Math.exp(Math.log(120) + 0.35 * gn()))).sort((a, b) => a - b); draw(); }
      const pct = (q) => data[Math.min(data.length - 1, Math.floor(q * data.length))];
      function draw() {
        const C = N.colors(), bins = 40, max = 2500, cnt = new Array(bins).fill(0);
        data.forEach((x) => cnt[Math.min(bins - 1, Math.floor((x / max) * bins))]++);
        N.barChart(qs("#hist", card), { groups: [{ values: cnt, color: (i) => ((i + 0.5) * max / bins > slo ? C.rose : C.teal) }], labels: cnt.map((_, i) => (i % 4 === 0 ? Math.round((i * max) / bins) + "" : "")), height: 200, decimals: 0,
          names: ["requests"], tipTitle: (i) => `${Math.round((i * max) / bins)}–${Math.round(((i + 1) * max) / bins)} ms`, markers: [{ x: (slo / max) * bins - 0.5, color: C.amber, label: `target ${slo} ms` }] });
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        qs("#mn", card).textContent = Math.round(mean) + " ms"; qs("#md", card).textContent = Math.round(pct(0.5)) + " ms"; qs("#p95", card).textContent = Math.round(pct(0.95)) + " ms"; qs("#p99", card).textContent = Math.round(pct(0.99)) + " ms";
        qs("#ok", card).textContent = (data.filter((v) => v <= slo).length / 10).toFixed(1) + "%";
      }
      life.onResize(draw); gen();
      qs("#regen", card).onclick = gen;

      // --- load vs response time ---
      const MU = 100;
      let lam = 600, servers = 8, target = 50;
      const q = el(`<div class="card"><div class="card-head"><h2>What happens when load grows?</h2><span class="faint">each server handles ${MU} req/s (10 ms per request) · simple queueing model</span></div>
        <div class="controls" id="q1"></div><div class="grid two"><div><h3>① Keep the system (fixed servers): what happens to performance?</h3><canvas class="viz" id="qc"></canvas><p class="dim" id="qT"></p></div>
        <div><h3>② Keep the performance: how many servers do you need?</h3><div class="controls" id="q2"></div><div class="stat-row"><div class="stat teal"><small>Servers needed</small><b id="need"></b></div></div><p class="dim" id="nT"></p></div></div></div>`);
      root.appendChild(q);
      const sLam = N.slider("Load (req/s)", 50, 2000, 50, lam), sSrv = N.slider("Servers", 1, 25, 1, servers), sTg = N.slider("Target response time (ms)", 15, 200, 5, target);
      sLam.onInput((v) => { lam = v; qdraw(); }); sSrv.onInput((v) => { servers = v; qdraw(); }); sTg.onInput((v) => { target = v; qdraw(); });
      qs("#q1", q).append(sLam, sSrv); qs("#q2", q).append(sTg);
      const T = (l, n) => { const per = l / n; return per >= MU ? Infinity : 1000 / (MU - per); };
      function qdraw() {
        const xs = Array.from({ length: 40 }, (_, i) => 50 + (i * 1950) / 39);
        N.lineChart(qs("#qc", q), { series: [{ data: xs.map((x) => Math.min(300, T(x, servers))), color: N.colors().teal }, { data: xs.map(() => target), color: N.colors().amber, dash: [5, 4] }], yMin: 0, yMax: 300, height: 190, xLabel: "load 50 → 2000 req/s" });
        const t = T(lam, servers);
        qs("#qT", q).innerHTML = t === Infinity ? `<b style="color:var(--rose)">Overloaded:</b> ${lam} req/s is more than ${servers} × ${MU} = ${servers * MU} capacity. The queue grows forever.` : `At ${lam} req/s on ${servers} servers: <b>${t.toFixed(0)} ms</b>. Response time stays flat, then shoots up near capacity (${servers * MU} req/s).`;
        const need = target <= 1000 / MU ? Infinity : Math.ceil(lam / (MU - 1000 / target));
        qs("#need", q).textContent = need === Infinity ? "impossible" : need;
        qs("#nT", q).innerHTML = need === Infinity ? `A single request takes 10 ms, so a ${target} ms target can't be met.` : `To answer ${lam} req/s within ${target} ms, each server may take at most ${(MU - 1000 / target).toFixed(0)} req/s, so you need ⌈${lam} / ${(MU - 1000 / target).toFixed(0)}⌉ = <b>${need}</b> servers.`;
      }
      life.onResize(qdraw); qdraw();
      root.appendChild(predict({ id: "ds-load-1", q: "Raise the share of slow requests to ~10%. The median barely moves. What's the lesson?", opts: ["Slow requests don't matter", "A single number like the average or median hides the unhappy users, so look at the whole distribution (e.g. p95/p99)", "The median is broken"], a: 1,
        why: "The lecture: <i>not only a single value (e.g. average response time) but the distribution of values is also important. What fraction of users experience a performance level within the expected range?</i>" }));
      root.appendChild(takeaways([
        "<b>Scalability</b> = the system's ability to cope with increased load.",
        "Describe load with <b>load parameters</b> specific to the system: requests/sec (web app), read/write ratio (database), concurrent players (game). Watch for bottlenecks, average vs extreme cases, and the cost of different operations.",
        "<b>Performance</b>: response time (web services), or records per second / time to process a dataset (data analysis).",
        "Two questions: <b>keep the system</b> → how does performance change? <b>Keep the performance</b> → how many more resources?",
        "Performance varies (load, network), so look at the <b>distribution</b>, not just the average.",
      ], "Scalability is coping with more load: measure load with the right parameters, and judge performance by its distribution, not its average."));
    },
  });

  /* ============ 1.5 Twitter fan-out ============ */
  const USERS = ["Ana", "Ben", "Cat", "Dev", "Eli", "Fay"];
  const FOLLOWS = { Ana: ["Ben", "Cat", "Dev"], Ben: ["Ana", "Cat"], Cat: ["Ana", "Dev", "Eli", "Fay"], Dev: ["Cat"], Eli: ["Ana", "Cat"], Fay: ["Cat", "Ben"] }; // X follows these
  const followersOf = (u) => USERS.filter((x) => FOLLOWS[x].includes(u));
  reg({
    id: "ds-twitter", order: 5, num: "1.5", title: "Twitter: do the work on write or on read?",
    blurb: "The fan-out case study: two designs for home timelines, the real numbers, and why Twitter ended up hybrid.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let appr = 1, global = [], boxes = {}, writes = 0, reads = 0, n = 0;
      const card = el(`<div class="card"><div class="card-head"><h2>A tiny Twitter with 6 users</h2></div><div class="controls" id="t1"></div>
        <div class="grid side"><svg class="viz" id="g" viewBox="0 0 520 300"></svg><div>
          <div class="stat-row"><div class="stat amber"><small>Writes</small><b id="w"></b></div><div class="stat violet"><small>Reads</small><b id="r"></b></div></div>
          <div id="store"></div></div></div>
        <div class="controls" id="acts"></div><div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(card);
      const POS = { Ana: [90, 70], Ben: [260, 40], Cat: [260, 160], Dev: [430, 70], Eli: [110, 250], Fay: [420, 250] };
      qs("#t1", card).appendChild(N.seg([["1", "Approach 1: merge on read"], ["2", "Approach 2: fan-out on write"]], "1", (v) => { appr = +v; reset(); }));
      const reset = () => { global = []; boxes = Object.fromEntries(USERS.map((u) => [u, []])); writes = 0; reads = 0; qs("#msg", card).style.display = "none"; draw(); };
      function draw(hl = []) {
        const edges = USERS.flatMap((u) => FOLLOWS[u].map((v) => [u, v]));
        qs("#g", card).innerHTML = `<defs><marker id="ar" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--text-faint)"/></marker></defs>` +
          edges.map(([a, b]) => { const [x1, y1] = POS[a], [x2, y2] = POS[b], d = Math.hypot(x2 - x1, y2 - y1), on = hl.some(([p, q]) => p === a && q === b); return `<line x1="${x1}" y1="${y1}" x2="${x2 - ((x2 - x1) / d) * 24}" y2="${y2 - ((y2 - y1) / d) * 24}" stroke="${on ? "var(--amber)" : "var(--line-2)"}" stroke-width="${on ? 3 : 1.3}" marker-end="url(#ar)"/>`; }).join("") +
          USERS.map((u) => `<g><circle cx="${POS[u][0]}" cy="${POS[u][1]}" r="22" fill="var(--panel-2)" stroke="var(--teal)" stroke-width="2"/><text x="${POS[u][0]}" y="${POS[u][1] + 5}" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">${u}</text></g>`).join("") +
          `<text x="10" y="292" fill="var(--text-faint)" font-size="11">arrow A → B means "A follows B"</text>`;
        qs("#w", card).textContent = writes; qs("#r", card).textContent = reads;
        qs("#store", card).innerHTML = appr === 1 ? `<h3>Global tweets table</h3><div class="log" style="max-height:160px">${global.length ? global.slice().reverse().map((t) => `<div class="mono" style="font-size:12.5px">${t.u}: tweet #${t.n}</div>`).join("") : '<span class="faint">empty</span>'}</div>` :
          `<h3>Timeline caches (one mailbox per user)</h3>${USERS.map((u) => `<div class="mono" style="font-size:12.5px;margin:2px 0"><b>${u}</b>: ${boxes[u].length ? boxes[u].slice(-4).map((t) => `${t.u}#${t.n}`).join(", ") : '<span class="faint">–</span>'}</div>`).join("")}`;
      }
      const acts = qs("#acts", card);
      acts.innerHTML = `<span class="faint" style="font-size:13px">Post a tweet as:</span> ${USERS.map((u) => `<button class="btn small" data-post="${u}">${u}</button>`).join("")} <span class="faint" style="font-size:13px;margin-left:12px">Open home timeline of:</span> ${USERS.map((u) => `<button class="btn small" data-read="${u}">${u}</button>`).join("")} <button class="btn ghost small" id="rs">Reset</button>`;
      const msg = (h) => { const m = qs("#msg", card); m.style.display = "block"; m.innerHTML = h; };
      qsa("[data-post]", acts).forEach((b) => (b.onclick = () => {
        const u = b.dataset.post, t = { u, n: ++n };
        if (appr === 1) { global.push(t); writes++; draw(); msg(`<b>${u}</b> posts → <b>1 write</b> into the global table. Cheap!`); }
        else { const fs = followersOf(u); fs.forEach((f) => boxes[f].push(t)); writes += fs.length; draw(fs.map((f) => [f, u])); msg(`<b>${u}</b> posts → copied into the timeline cache of each of ${u}'s <b>${fs.length} followers</b> (${fs.join(", ")}) = <b>${fs.length} writes</b>.`); }
      }));
      qsa("[data-read]", acts).forEach((b) => (b.onclick = () => {
        const u = b.dataset.read, fl = FOLLOWS[u];
        if (appr === 1) { reads += fl.length; const tl = global.filter((t) => fl.includes(t.u)); draw(fl.map((f) => [u, f])); msg(`<b>${u}</b> opens their timeline → look up the ${fl.length} people they follow (${fl.join(", ")}), fetch each one's tweets and merge them by time = <b>${fl.length} reads</b> + a merge. Result: ${tl.length ? tl.map((t) => `${t.u}#${t.n}`).join(", ") : "nothing yet"}.`); }
        else { reads += 1; draw(); msg(`<b>${u}</b> opens their timeline → read their own mailbox = <b>1 read</b>. It's already built: ${boxes[u].length ? boxes[u].map((t) => `${t.u}#${t.n}`).join(", ") : "empty"}.`); }
      }));
      acts.querySelector("#rs").onclick = reset;
      reset();

      // --- at scale ---
      let tps = 4600, rps = 300000, fol = 75, celeb = false;
      const sc = el(`<div class="card"><div class="card-head"><h2>At Twitter's scale (November 2012 numbers)</h2></div><div class="controls" id="s1"></div>
        <div class="grid two"><div><canvas class="viz" id="bc"></canvas><div class="legend"><span style="--c:var(--amber)">writes/sec</span><span style="--c:var(--violet)">timeline reads/sec (lookups)</span></div></div><div id="sT" class="dim"></div></div></div>`);
      root.appendChild(sc);
      const sTp = N.slider("Tweets posted /s", 1000, 12000, 100, tps, (v) => v.toLocaleString()), sRp = N.slider("Timeline reads /s", 50000, 500000, 10000, rps, (v) => v.toLocaleString()), sFo = N.slider("Avg followers", 10, 300, 5, fol);
      const cb = el(`<label class="field"><input type="checkbox"> A celebrity with 30 million followers tweets</label>`);
      qs("input", cb).onchange = (e) => { celeb = e.target.checked; sdraw(); };
      sTp.onInput((v) => { tps = v; sdraw(); }); sRp.onInput((v) => { rps = v; sdraw(); }); sFo.onInput((v) => { fol = v; sdraw(); });
      qs("#s1", sc).append(sTp, sRp, sFo, cb);
      const k = (x) => (x >= 1e6 ? (x / 1e6).toFixed(1) + "M" : Math.round(x / 1000) + "k");
      function sdraw() {
        const a1w = tps, a1r = rps * fol, a2w = tps * fol, a2r = rps;
        N.barChart(qs("#bc", sc), { groups: [{ values: [a1w, a2w].map((x) => x / 1e6), color: N.colors().amber }, { values: [a1r, a2r].map((x) => x / 1e6), color: N.colors().violet }], labels: ["Approach 1", "Approach 2"], height: 200, decimals: 1 });
        qs("#sT", sc).innerHTML = `<p><b>Approach 1</b>: ${k(a1w)} writes/s, but every timeline read has to look up ~${fol} accounts and merge: ${k(rps)} × ${fol} ≈ <b>${k(a1r)} lookups/s</b>.</p>
          <p><b>Approach 2</b>: every tweet is copied to ~${fol} caches: ${k(tps)} × ${fol} = <b>${k(a2w)} writes/s</b> (the slide: 4.6k → <b>345k</b>), but each read is 1 cheap lookup: ${k(a2r)}/s.</p>
          <p>Reads outnumber tweets ~${Math.round(rps / tps)}× (the slide rounds this to "two orders of magnitude"), so doing the work <b>at write time</b> wins.</p>
          ${celeb ? `<div class="callout rose"><b>Celebrity problem:</b> one tweet = <b>30,000,000</b> cache writes. Twitter's goal is to deliver a tweet within <b>5 seconds</b>, so that would need 6M writes/s for just this one tweet. Hence the <b>hybrid</b>: approach 2 for most users, approach 1 for accounts with huge follower counts (their tweets are fetched and merged in at read time).</div>` : ""}
          <p class="faint" style="font-size:12.5px">Approach 1's lookup count assumes each user follows ~${fol} accounts (on average, followers = followees across the whole network).</p>`;
      }
      life.onResize(sdraw); sdraw();
      root.appendChild(predict({ id: "ds-tw-1", q: "Why did Twitter switch from approach 1 to approach 2?", opts: ["Approach 2 uses fewer writes", "Timeline reads are ~two orders of magnitude more frequent than tweets, so it's cheaper to do the work once at write time than on every read", "Approach 1 lost tweets"], a: 1,
        why: "Approach 1 struggled to keep up with home-timeline queries. Approach 2 moves the cost to posting (4.6k tweets/s → 345k cache writes/s), which is fine because posting is far rarer than reading." }));
      root.appendChild(takeaways([
        "Twitter's load: post tweet 4.6k/s average (12k+ peak), home timeline 300k/s. <b>Fan-out</b>: each user follows many people and is followed by many.",
        "<b>Approach 1</b>: insert into a global collection, and on read look up the followees, fetch their tweets and merge. Cheap writes, expensive reads.",
        "<b>Approach 2</b>: keep a timeline cache (mailbox) per user, and on post insert into every follower's cache. Expensive writes (345k/s), cheap reads.",
        "<b>Hybrid</b>: approach 2 for most users, approach 1 for users with very many followers.",
      ], "Twitter moved the work from read time to write time because reads vastly outnumber tweets, except for celebrities, where fan-out is too expensive."));
    },
  });

  /* ============ 1.6 Scaling up vs out ============ */
  reg({
    id: "ds-scaling", order: 6, num: "1.6", title: "Scaling up vs scaling out",
    blurb: "Buy a bigger machine or more machines? Compare cost curves and what happens when one machine dies.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let need = 8, deadV = false, deadH = 0;
      const card = el(`<div class="card"><div class="controls" id="c1"></div>
        <div class="grid two">
          <div><div class="card-head"><span class="tag amber">Vertical: scale up</span><span class="faint">one bigger machine (shared-memory)</span></div><div id="v"></div></div>
          <div><div class="card-head"><span class="tag teal">Horizontal: scale out</span><span class="faint">more cheap machines (shared-nothing)</span></div><div id="h"></div></div></div>
        <h3 style="margin-top:14px">Cost as capacity grows</h3><canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--amber)">vertical</span><span style="--c:var(--teal)">horizontal</span></div>
        <p class="faint" style="font-size:12.5px">Illustrative cost model: high-end hardware gets disproportionately expensive (vertical ∝ capacity<sup>1.7</sup>, and no machine bigger than 32× exists). Commodity machines cost the same each, plus ~10% coordination overhead.</p></div>`);
      root.appendChild(card);
      const sN = N.slider("Capacity needed (× one basic machine)", 1, 40, 1, need);
      sN.onInput((v) => { need = v; deadH = 0; deadV = false; draw(); });
      qs("#c1", card).appendChild(sN);
      const costV = (c) => (c > 32 ? Infinity : 1000 * c ** 1.7), costH = (c) => 1000 * c * (c > 1 ? 1.1 : 1);
      function draw() {
        const cv = costV(need), ch = costH(need);
        qs("#v", card).innerHTML = `<div style="display:flex;align-items:flex-end;gap:10px;height:120px"><button class="btn" id="kv" style="width:${40 + Math.min(need, 32) * 4}px;height:${40 + Math.min(need, 32) * 2.4}px;border-color:${deadV ? "var(--rose)" : "var(--amber)"}">${deadV ? "💥" : need > 32 ? "✗ too big" : need + "×"}</button></div>
          <div class="stat-row"><div class="stat amber"><small>Cost</small><b>${cv === Infinity ? "doesn't exist" : "£" + Math.round(cv).toLocaleString()}</b></div><div class="stat"><small>Capacity left</small><b style="color:${deadV ? "var(--rose)" : ""}">${deadV ? "0%" : "100%"}</b></div></div>`;
        qs("#h", card).innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:4px;align-content:flex-end;height:120px">${Array.from({ length: need }, (_, i) => `<button class="btn" data-h="${i}" style="width:26px;height:26px;padding:0;font-size:11px;border-color:${i < deadH ? "var(--rose)" : "var(--teal)"}">${i < deadH ? "💥" : ""}</button>`).join("")}</div>
          <div class="stat-row"><div class="stat teal"><small>Cost</small><b>£${Math.round(ch).toLocaleString()}</b></div><div class="stat"><small>Capacity left</small><b>${Math.round(((need - deadH) / need) * 100)}%</b></div></div>`;
        qs("#kv", card).onclick = () => { deadV = !deadV; draw(); };
        qsa("[data-h]", card).forEach((b) => (b.onclick = () => { deadH = Math.min(need, deadH + 1); draw(); }));
        const xs = Array.from({ length: 40 }, (_, i) => i + 1);
        N.lineChart(qs("#ch", card), { series: [{ data: xs.map((x) => (costV(x) === Infinity ? NaN : costV(x) / 1000)), color: N.colors().amber }, { data: xs.map((x) => costH(x) / 1000), color: N.colors().teal }], yMin: 0, height: 180, xLabel: "capacity 1× → 40×  (cost in £k)" });
      }
      life.onResize(draw); draw();
      root.appendChild(predict({ id: "ds-sc-1", q: "Click the big machine to break it, then break one small machine. What does this show?", opts: ["Both lose everything", "Vertical scaling has limited fault tolerance (one machine is one point of failure). Horizontal scaling loses only a slice of capacity", "Horizontal is always cheaper at every size"], a: 1,
        why: "The lecture: vertical = <i>costs do not scale linearly, limited fault tolerance</i>. Horizontal = <i>costs can scale better, better fault tolerance</i>. (At very small sizes one machine is simpler. Scaling out adds coordination complexity.)" }));
      root.appendChild(takeaways([
        "<b>Vertical scaling</b> (scale up, shared-memory): a more powerful machine. Costs don't scale linearly, and fault tolerance is limited.",
        "<b>Horizontal scaling</b> (scale out, shared-nothing): more commodity machines. Costs scale better, and fault tolerance is better.",
        "This is the lecture's second trade-off: a single powerful system vs several cheap commodity computers.",
      ], "Scaling up buys a bigger machine that gets pricier and is a single point of failure; scaling out adds cheap machines that are cheaper at scale and survive failures."));
    },
  });

  /* ============ 1.7 Maintainability ============ */
  reg({
    id: "ds-maintain", order: 7, num: "1.7", title: "Maintainability",
    blurb: "Operability, simplicity, evolvability: untangle a spaghetti architecture with an abstraction and count what a change costs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let abs = false;
      const svcs = ["Web app", "Mobile API", "Reports", "Search", "Billing"], dbs = ["Users DB", "Orders DB", "Products DB", "Logs DB"];
      const card = el(`<div class="card"><div class="card-head"><h2>Accidental complexity and abstraction</h2></div>
        <div class="controls"><button class="btn primary" id="tg">Add a data-access layer (abstraction)</button><button class="btn" id="chg">Change: replace "Orders DB" with a new database</button></div>
        <svg class="viz" id="arch" viewBox="0 0 560 300"></svg>
        <div class="stat-row"><div class="stat"><small>Connections to understand</small><b id="cn"></b></div><div class="stat amber"><small>Components to edit for that change</small><b id="ce"></b></div></div>
        <div id="msg" class="dim"></div></div>`);
      root.appendChild(card);
      const X = (i, n) => 60 + (i * 440) / (n - 1);
      function draw(hl = false) {
        const top = svcs.map((s, i) => [X(i, svcs.length), 40, s]), bot = dbs.map((d, i) => [X(i, dbs.length) + 20, 260, d]);
        let lines = "";
        if (!abs) top.forEach(([x1, y1]) => bot.forEach(([x2, y2, d]) => (lines += `<line x1="${x1}" y1="${y1 + 16}" x2="${x2}" y2="${y2 - 16}" stroke="${hl && d === "Orders DB" ? "var(--rose)" : "var(--line-2)"}" stroke-width="${hl && d === "Orders DB" ? 2.5 : 1.2}"/>`)));
        else { top.forEach(([x]) => (lines += `<line x1="${x}" y1="56" x2="${x}" y2="134" stroke="var(--line-2)"/>`)); bot.forEach(([x, , d]) => (lines += `<line x1="${x}" y1="166" x2="${x}" y2="244" stroke="${hl && d === "Orders DB" ? "var(--rose)" : "var(--line-2)"}" stroke-width="${hl && d === "Orders DB" ? 2.5 : 1.2}"/>`)); }
        const node = ([x, y, t], c) => `<rect x="${x - 48}" y="${y - 16}" width="96" height="32" rx="8" fill="var(--panel-2)" stroke="${c}"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="var(--text)" font-size="12">${t}</text>`;
        qs("#arch", card).innerHTML = lines + top.map((t) => node(t, hl && !abs ? "var(--rose)" : "var(--teal)")).join("") + bot.map((b) => node(b, "var(--amber)")).join("") +
          (abs ? `<rect x="40" y="134" width="480" height="32" rx="8" fill="var(--violet-dim)" stroke="${hl ? "var(--rose)" : "var(--violet)"}"/><text x="280" y="155" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600">Data-access layer (one clean interface)</text>` : "");
        qs("#cn", card).textContent = abs ? svcs.length + dbs.length : svcs.length * dbs.length;
      }
      qs("#tg", card).onclick = () => { abs = !abs; qs("#tg", card).textContent = abs ? "Remove the abstraction" : "Add a data-access layer (abstraction)"; qs("#ce", card).textContent = "–"; qs("#msg", card).innerHTML = ""; draw(); };
      qs("#chg", card).onclick = () => { draw(true); qs("#ce", card).textContent = abs ? 1 : svcs.length; qs("#msg", card).innerHTML = abs ? "Only the data-access layer changes. The 5 services don't even notice: <b>high evolvability</b>." : "Every service talks to Orders DB directly, so <b>all 5</b> must be edited and retested: <b>low evolvability</b>."; };
      draw(); qs("#ce", card).textContent = "–";
      sorter(root, "Which part of maintainability does this improve?", [["Operability", "easy to keep running"], ["Simplicity", "easy to understand"], ["Evolvability", "easy to change"]], [
        ["Good monitoring dashboards showing what the system is doing", "Operability"],
        ["The system doesn't depend on one particular machine staying alive", "Operability"],
        ["Behaviour is predictable, with no surprises", "Operability"],
        ["Automation and integration with standard tools", "Operability"],
        ["Removing obscure dependencies and an inconsistent architecture", "Simplicity"],
        ["Hiding messy details behind a clean abstraction", "Simplicity"],
        ["Better documentation and consistent code style", "Simplicity"],
        ["Adding a new feature for a new requirement takes a day, not a month", "Evolvability"],
        ["Handling increased load without a rewrite", "Evolvability"],
      ]);
      root.appendChild(predict({ id: "ds-mt-1", q: "\"Making a system simpler\" in the lecture's sense means…", opts: ["Removing features", "Removing <b>accidental complexity</b>: complexity that comes from the implementation, not the problem itself", "Using fewer servers"], a: 1,
        why: "Simpler doesn't mean less functionality. Accidental complexity (inconsistent architecture, obscure dependencies, poor style or docs) isn't inherent in the problem. Abstraction is a frequent cure." }));
      root.appendChild(takeaways([
        "<b>Maintainability</b> = the overall cost of keeping a system operational and up to date.",
        "<b>Operability</b>: easy for ops to keep running (monitoring, automation, no single-machine dependency, predictable behaviour).",
        "<b>Simplicity</b>: easy for new people to understand. Remove <b>accidental complexity</b>. Abstraction helps.",
        "<b>Evolvability</b>: easy to change for new requirements or load, and closely linked to simplicity and abstractions.",
      ], "Maintainable systems are easy to run, easy to understand, and easy to change, and abstraction helps with the last two."));
    },
  });


  /* =================== LESSONS =================== */
  const L = N.LESSONS;
  L["ds-why"] = {
    sum: "The web made data <b>huge, fast-growing and always-on</b>. A single server couldn't cope, so we face two trade-offs.",
    steps: [
      { t: "How it used to be", b: `<p>Before the web took off, a company's data typically lived on <b>one big server</b> (a mainframe), in a <b>fixed format</b>, inside an <b>expensive relational database</b> (like MS SQL or Oracle).</p>`, v: `<div class="mini-row">${box("1 mainframe", "all data, all users", "var(--amber)")}${box("Static format", "rarely changes")}${box("RDBMS", "MS SQL, Oracle")}</div>` },
      { t: "Then the web happened", b: `<p>Suddenly: many more companies and services online, <b>dynamically generated</b> content (every page built on the fly), and <b>rapid growth</b> in both content and users. Think Google, eBay, Facebook.</p><span class="analogy">A corner shop with one till suddenly gets a million customers a day, and they all want personalised receipts.</span>` },
      { t: "Where a single server breaks", b: `<p>Three limitations of the one-server approach:</p><p>① <b>Availability & fault tolerance</b>: if it dies, everything is down.<br>② <b>Scalability</b>: one machine can only get so big, and adding more means keeping them in sync (synchronisation, consistency).<br>③ <b>Maintenance</b>: hard to update or fix without downtime.</p>`,
        c: { q: "The one server crashes and the whole site is offline. Which limitation is this?", o: ["Scalability", "Availability / fault tolerance", "Maintenance"], a: 1, why: "One machine = one point of failure." } },
      { t: "Trade-off 1: consistency vs availability", b: `<p>Once data is copied across several machines, a network problem forces a choice: keep every copy <b>consistent</b> (refuse to answer until you're sure), or stay <b>available</b> (answer now, maybe with slightly old data).</p><span class="key">You can't always have both. Which one matters more depends on the application.</span>`,
        c: { q: "A bank balance should probably prefer…", o: ["availability, since stale is fine", "consistency: better to refuse than show the wrong balance", "neither"], a: 1, why: "Money needs correctness. A social feed can happily show slightly old posts (availability)." } },
      { t: "Trade-off 2: one big machine vs many cheap ones", b: `<p>Either buy a <b>single powerful system</b>, or use <b>several cheap commodity computers</b> working together. (Module 1.6 goes deeper.)</p>` },
    ],
    guide: ["In the first demo, drag the load up and watch <b>Single powerful server</b>. Then click the mainframe to break it.", "Switch to <b>Cluster</b>, break one or two nodes, and compare what's left.", "In the consistency demo, <b>cut the link</b>, buy a ticket in London, then read in New York, first in <b>consistent</b> mode, then in <b>available</b> mode."],
  };
  L["ds-blocks"] = {
    sum: "Almost every data app is built from four blocks: a <b>database</b>, a <b>cache</b>, an <b>index</b> and <b>batch processing</b>.",
    steps: [
      { t: "Database: remember things", b: `<p><b>Store data so it can be retrieved later.</b> Orders, users, posts: anything that must still be there tomorrow.</p>` },
      { t: "Cache: don't do expensive work twice", b: `<p><b>Store the results of expensive operations to be used again soon.</b></p><span class="analogy">Keeping your most-used pans on the hob instead of in the cupboard. Much faster to grab, but there's only room for a few.</span>`, v: flow([["Request", "violet"], ["In cache?", "amber"], ["Yes → answer in 2 ms", "teal"]]) + `<div class="mini-row"><span class="pill rose">No → fetch from the database (100 ms), then keep a copy in the cache</span></div>` },
      { t: "Index: find things fast", b: `<p><b>Let users search the data efficiently.</b> Without an index you check every record (a full scan). With one you jump almost straight to the answer.</p><span class="analogy">The index at the back of a textbook: look up "cache", go to page 42, and skip the other 499 pages.</span>`,
        c: { q: "A million records. Roughly how many checks does a sorted index need to find one?", o: ["1,000,000", "~20", "1"], a: 1, why: "Halving each step: log₂(1,000,000) ≈ 20." } },
      { t: "Batch processing: big periodic jobs", b: `<p><b>Periodically run specific routines on large amounts of accumulated data.</b> Example: every night, total up all of the day's sales.</p>` },
      { t: "Same blocks, different implementations", b: `<p>Each block can be built in many ways, and <b>the problem decides which</b>. The lecture's example is spatial (map) data:</p>`, v: `<div class="mini-row">${box("Representation", "GeoJSON")}${box("Storage", "PostGIS")}${box("Indexing", "R-tree")}</div>`,
        c: { q: "\"Every Sunday, recompute recommendations from all purchases\" is…", o: ["a cache", "batch processing", "an index"], a: 1, why: "A periodic job over lots of accumulated data." } },
    ],
    guide: ["Sort the 8 scenarios into the right block.", "In the cache demo, set the cache size to <b>0</b> and press Send requests. Note the average latency.", "Reset, set the cache size to <b>4</b>, and run again. Compare the hit rate and latency.", "Drag the <b>Records</b> slider in the index demo up to a billion."],
  };
  L["ds-reliability"] = {
    sum: "Reliable = keeps working correctly even when things go wrong. The key is stopping <b>faults</b> from becoming <b>failures</b>.",
    steps: [
      { t: "What \"reliable\" means", b: `<p>A reliable application:</p><p>✓ performs the function the user expected<br>✓ tolerates users making mistakes or using it in unexpected ways<br>✓ performs well enough under the expected load and data volume<br>✓ prevents unauthorised access and abuse</p><p>In short: <b>resilient</b>.</p>` },
      { t: "Fault vs failure: the key distinction", b: `<p><b>Fault</b>: <i>one component</i> works in an unexpected way (a disk dies, a process hangs).<br><b>Failure</b>: <i>the entire system</i> stops providing the service.</p><span class="analogy">A plane losing one of its four engines is a fault. The plane falling out of the sky is a failure. Good design means one engine out doesn't bring the plane down.</span>`,
        c: { q: "One of 50 web servers crashes, and users see no difference. Fault or failure?", o: ["Failure", "Fault"], a: 1, why: "A component misbehaved, but the service kept running." } },
      { t: "Hardware faults happen constantly", b: `<p>Disks, memory modules and power supplies fail. In big data centres this happens <b>all the time</b>:</p><span class="key">A cluster with 10,000 disks has on average <b>one dead disk every day</b>.</span><p>The traditional fix is redundant hardware (RAID for disks, redundant power supplies, hot-swappable CPUs). At huge scale even that isn't enough, so systems must be <b>resilient to whole machines failing</b>.</p>` },
      { t: "Software faults are sneakier", b: `<p>Hardware faults are mostly <b>uncorrelated</b>: one disk dying doesn't make another die. Software faults are <b>harder to anticipate</b> and can be present on <b>many (or all) nodes at once</b>: a faulty monitoring tool, or a process that overuses resources.</p>` },
      { t: "The cascading effect", b: `<p>One node fails, and its work moves to the others. They become overloaded and fail too, pushing even more work onto fewer nodes… until everything is down.</p>`, v: flow([["Node 1 dies", "rose"], ["others take its load", "amber"], ["overloaded → die", "rose"], ["total failure", "rose"]]),
        c: { q: "Why doesn't adding more identical servers protect against a software bug?", o: ["Servers are too expensive", "They all run the same buggy code, so they fail together", "They do protect against it"], a: 1, why: "Correlated faults defeat simple redundancy." } },
    ],
    guide: ["In the disk demo, keep <b>1 copy</b> and press <b>Run a year</b>. Every orange flash is also a service failure.", "Set <b>copies = 2</b>, reset, and press <b>Run 10 years</b>. Compare disk faults with service failures.", "In the second demo, press <b>Hardware fault</b> once (tolerated), then again (cascade!). Reset and try <b>Software bug</b>.", "Lower the total load and check how many hardware faults the cluster can now survive."],
  };
  L["ds-load"] = {
    sum: "<b>Scalability</b> = coping with more load. To reason about it, describe <b>load</b> with numbers and judge <b>performance</b> by its whole distribution.",
    steps: [
      { t: "Scalability: coping with more load", b: `<p>Scalability is a system's ability to <b>cope with increased load</b>. But first we have to say what \"load\" means for <i>this</i> system.</p>` },
      { t: "Load parameters depend on the system", b: `<p>Pick the numbers that actually stress your system:</p>`, v: table(["System", "Load parameter"], [["Web application", "requests per second"], ["Database", "read/write ratio"], ["Online game", "number of concurrent players"]]) + `<p class="dim" style="margin-top:8px">Also think about <b>bottlenecks</b>, <b>average vs extreme cases</b>, and the <b>cost of different operations</b>.</p>`,
        c: { q: "For a chat app, which is a sensible load parameter?", o: ["Messages sent per second", "Screen resolution", "Number of developers"], a: 0, why: "It's what the servers actually have to handle." } },
      { t: "Performance parameters", b: `<p><b>Web services</b>: <b>response time</b>, the time between a user sending a request and getting the answer.<br><b>Data analysis</b>: records processed per second, or time to process a dataset of a certain size.</p>` },
      { t: "Two questions to ask when load grows", b: `<p>① <b>Keep the system the same</b>: how does performance change?<br>② <b>Keep the performance the same</b>: how many more resources do you need?</p>` },
      { t: "Look at the distribution, not the average", b: `<p>The same request can be fast one moment and slow the next (current load, network delays). So one number like the <b>average</b> isn't enough. Ask: <b>what fraction of users get acceptable performance?</b></p><p>A handy tool: <b>percentiles</b>. p95 = 500 ms means 95% of requests finished within 500 ms (and 5% took longer).</p><span class="analogy">"The average commute is 30 minutes" hides the people stuck for 2 hours. Those are the ones who complain.</span>`,
        c: { q: "p99 = 1.2 s means…", o: ["the average is 1.2 s", "99% of requests took ≤ 1.2 s, and 1% took longer", "1% of requests took ≤ 1.2 s"], a: 1, why: "Percentiles tell you about the tail that averages hide." } },
    ],
    guide: ["In the distribution demo, drag <b>Share of slow requests</b> from 0% to 15%. Watch the mean vs median vs p99.", "Move the <b>Target</b> line and read the \"Within target\" percentage: that's the fraction of happy users.", "In the load demo, drag <b>Load</b> towards capacity and watch the response time shoot up (question ①).", "Set a target response time and read how many servers you need (question ②)."],
  };
  L["ds-twitter"] = {
    sum: "Twitter's timelines: do the work when someone <b>posts</b>, or when someone <b>reads</b>? Reads are far more common, so do it on write, except for celebrities.",
    steps: [
      { t: "Two operations, very different load", b: `<p>Twitter, November 2012:</p>`, v: table(["Operation", "Load"], [["Post tweet", "4.6k requests/sec on average, 12k+ at peak"], ["Home timeline (view tweets from people you follow)", "<b>300k</b> requests/sec"]]) + `<p class="dim" style="margin-top:8px">The hard part is <b>fan-out</b>: each user follows many people, and is followed by many people.</p>` },
      { t: "Approach 1: merge when you read", b: `<p>Posting just inserts the tweet into one <b>global collection</b> (1 write). Opening your timeline means: look up everyone you follow, fetch each one's tweets, and <b>merge</b> them by time.</p><span class="analogy">Every morning you visit each friend's house to see what they've written. Easy for them, lots of travel for you, every single time.</span>` },
      { t: "Approach 2: fan out when you write", b: `<p>Keep a <b>timeline cache</b> (a mailbox) for every user. When someone posts, look up their followers and <b>insert the tweet into each follower's mailbox</b>. Reading your timeline = just open your mailbox.</p><span class="analogy">Your friends post a copy to every one of their followers. More work for them, but you just open your letterbox.</span>`,
        c: { q: "In approach 2, a user with 200 followers posts once. How many writes?", o: ["1", "200", "400"], a: 1, why: "One copy per follower's timeline cache." } },
      { t: "Why Twitter chose approach 2", b: `<p>Approach 1 couldn't keep up with timeline reads, which happen <b>about two orders of magnitude</b> more often than posts (300k vs 4.6k). So Twitter moved the work to write time.</p><span class="key">Average ~75 followers per tweet: 4.6k tweets/s × 75 = <b>345k writes/s</b> to timeline caches. Big, but manageable, and reads become cheap.</span>` },
      { t: "The celebrity problem → hybrid", b: `<p>A user with <b>30 million</b> followers posts: approach 2 means 30 million writes for one tweet. Twitter aims to deliver tweets within <b>5 seconds</b>, and that's too slow.</p><p>So: <b>approach 2 for most users, approach 1 for users with huge follower counts</b>. Their tweets are fetched and merged in when you read.</p>`,
        c: { q: "Which is the hybrid?", o: ["Everyone uses approach 1", "Most users use fan-out on write; celebrities are merged at read time", "Celebrities use fan-out on write"], a: 1, why: "Fan-out is too expensive for celebrities, so theirs are merged at read time." } },
    ],
    guide: ["Keep <b>Approach 1</b>. Post a few tweets as different users, then open Cat's timeline. Watch the Writes and Reads counters.", "Switch to <b>Approach 2</b> and do the same. Posting as Cat now writes to 5 mailboxes (Cat has 5 followers).", "In the scale calculator, check the slide's number: 4.6k × 75 = 345k writes/s.", "Tick the <b>celebrity</b> box to see why the hybrid exists."],
  };
  L["ds-scaling"] = {
    sum: "<b>Scale up</b>: buy a bigger machine. <b>Scale out</b>: add more cheap machines. They differ in cost and in what happens when one breaks.",
    steps: [
      { t: "Vertical scaling (scaling up)", b: `<p>Replace your server with a <b>more powerful one</b>: more CPUs, RAM, disk. Also called a <b>shared-memory</b> architecture (everything in one box).</p><span class="analogy">Your van is too small, so you buy a lorry.</span>` },
      { t: "The catch with scaling up", b: `<p>① <b>Costs don't scale linearly</b>: a machine twice as powerful costs <i>much more</i> than twice as much, and eventually there's no bigger machine to buy.<br>② <b>Limited fault tolerance</b>: it's still one machine. If it dies, you're down.</p>` },
      { t: "Horizontal scaling (scaling out)", b: `<p>Add <b>more ordinary machines</b> and spread the work across them. Also called <b>shared-nothing</b> (each machine has its own CPU, memory and disk).</p><span class="analogy">Instead of a lorry, you run a fleet of vans. If one breaks down, the others keep delivering.</span>`,
        c: { q: "Which gives better fault tolerance?", o: ["Scaling up", "Scaling out"], a: 1, why: "Losing one of many machines only removes a slice of capacity." } },
      { t: "Costs scale better, but it's harder to coordinate", b: `<p>Scaling out: <b>costs can scale better</b> (commodity hardware) and <b>fault tolerance is better</b>. The price is complexity: machines must coordinate, stay consistent, and handle partial failures. That's the consistency trade-off from 1.1.</p>` },
    ],
    guide: ["Drag <b>Capacity needed</b> from 1× to 40×. Watch both costs and the cost curves.", "Past 32× the single machine doesn't exist at all.", "Click the big machine to break it, then click a few small machines. Compare the capacity left."],
  };
  L["ds-maintain"] = {
    sum: "Most of a system's cost comes <b>after</b> it's built. Maintainable = easy to <b>run</b>, easy to <b>understand</b>, easy to <b>change</b>.",
    steps: [
      { t: "What maintainability means", b: `<p>The <b>overall cost to keep a system operational and up to date</b>. It has three parts:</p>`, v: `<div class="mini-row">${box("Operability", "easy to keep running", "var(--teal)")}${box("Simplicity", "easy to understand", "var(--violet)")}${box("Evolvability", "easy to change", "var(--amber)")}</div>` },
      { t: "Operability: easy for the ops team", b: `<p>✓ visibility into what's happening (<b>good monitoring</b>)<br>✓ support for <b>automation</b> and standard tools<br>✓ <b>no dependency on individual machines</b><br>✓ <b>predictable</b> behaviour, with minimal surprises</p>` },
      { t: "Simplicity: easy for new people", b: `<p>Simpler doesn't mean fewer features. It means removing <b>accidental complexity</b>: complexity that isn't part of the problem and only comes from <i>how</i> it was built (inconsistent architecture, obscure dependencies, poor style or docs).</p><p><b>Abstraction</b> is often the best tool: hide messy details behind a clean interface.</p>`,
        c: { q: "Which is accidental complexity?", o: ["Tax rules a payroll system must follow", "Five services each wired differently to the same database for no reason", "Needing to store user data"], a: 1, why: "Tax rules are essential (they're part of the problem). The inconsistent wiring is self-inflicted." } },
      { t: "Evolvability: easy to change", b: `<p>How easily engineers can modify the system: new requirements, increased load. It's <b>closely linked to simplicity and good abstractions</b>. If it's easy to understand, it's easy to change safely.</p>`,
        c: { q: "Good abstractions mainly help…", o: ["operability only", "simplicity and evolvability", "neither"], a: 1, why: "They hide complexity (simplicity), and changes stay inside one component (evolvability)." } },
    ],
    guide: ["Look at the tangled architecture and count the connections (20).", "Press <b>Change: replace Orders DB</b>: red shows everything that must be edited.", "Press <b>Add a data-access layer</b>, then run the same change again.", "Sort the 9 statements into operability, simplicity or evolvability."],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => { if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v; };
  const dots = (n, cols, bad = [], c = "var(--teal)") => `<svg class="fig" viewBox="0 0 ${cols * 14 + 4} ${Math.ceil(n / cols) * 14 + 4}" style="max-height:120px">${Array.from({ length: n }, (_, i) => `<circle cx="${9 + (i % cols) * 14}" cy="${9 + Math.floor(i / cols) * 14}" r="5" fill="${bad.includes(i) ? "var(--rose)" : c}" opacity="${bad.includes(i) ? 1 : 0.55}"/>`).join("")}</svg>`;
  // response times: gamma(k = 2.5, θ = 100 ms) → p50 ≈ 218 ms, p95 ≈ 554 ms, p99 ≈ 754 ms, mean 250 ms
  const gammaPdf = (ms) => { const x = ms / 100; return Math.pow(x, 1.5) * Math.exp(-x); };

  addV("ds-why", 1, FG.compare({ title: "Before the web", c: "violet", body: "one company, one server, <b>fixed</b> data format, known number of users" }, { title: "After", c: "amber", body: "millions of users, every page <b>generated on the fly</b>, data and traffic growing every month" }));
  addV("ds-why", 2, FG.cells([{ v: "① down = all down", sub: "availability", c: "rose" }, { v: "② can only grow so big", sub: "scalability", c: "amber" }, { v: "③ hard to upgrade live", sub: "maintenance", c: "violet" }], { size: 150 }));
  addV("ds-why", 3, FG.compare({ title: "Choose consistency", c: "violet", body: "\"I can't reach the other copy, so I won't answer yet.\"<br>Right for <b>bank balances</b>." }, { title: "Choose availability", c: "teal", body: "\"Here's what I have, it might be a few seconds old.\"<br>Right for <b>a like counter</b>." }));
  addV("ds-why", 4, FG.compare({ title: "One powerful machine", c: "violet", body: "simple to program, <b>expensive</b>, a single point of failure" }, { title: "Many cheap machines", c: "teal", body: "cheap and fault-tolerant, but they must <b>coordinate</b>" }));
  addV("ds-blocks", 0, FG.flow([{ t: "your app", s: "writes an order" }, { t: "database", s: "keeps it safe", c: "teal" }, { t: "tomorrow", s: "still there" }]));
  addV("ds-blocks", 2, FG.bars([["no index: full scan", 500, "rose", "pages checked"], ["with an index", 1, "teal", "page checked"]], { max: 500 }));
  addV("ds-blocks", 3, FG.flow([{ t: "all day", s: "sales pile up" }, { t: "02:00", s: "batch job runs", c: "violet" }, { t: "08:00", s: "report is ready", c: "teal" }]));
  addV("ds-reliability", 0, FG.cells([{ v: "✓ does the job", c: "teal" }, { v: "✓ survives user mistakes", c: "teal" }, { v: "✓ fast enough under load", c: "teal" }, { v: "✓ keeps intruders out", c: "teal" }], { size: 150 }));
  addV("ds-reliability", 1, FG.compare({ title: "Fault", c: "amber", body: "<b>one part</b> misbehaves: a disk dies, a process hangs.<br>✈ one engine out of four stops" }, { title: "Failure", c: "rose", body: "<b>the whole service</b> stops working for users.<br>✈ the plane can't fly" }) + `<div class="fig-cap">Reliability engineering = stopping faults from turning into failures.</div>`);
  addV("ds-reliability", 2, dots(100, 25, [37]) + `<div class="fig-cap">Picture 10,000 disks as 100 rows like this. On an average day, about <b>one</b> of them dies. With redundancy, users never notice.</div>`);
  addV("ds-reliability", 3, FG.compare({ title: "Hardware fault: uncorrelated", c: "amber", body: dots(20, 10, [6]) + "one box dies, the rest carry on" }, { title: "Software bug: correlated", c: "rose", body: dots(20, 10, Array.from({ length: 20 }, (_, i) => i)) + "same bug on every node → all down together" }));
  addV("ds-load", 0, FG.plot([{ f: (x) => 0.2 + 0.6 * Math.pow(x, 3), c: "teal", fill: true }], { x: [0, 1], y: [0, 1], xl: "load (requests/s) →", yl: "response time", h: 150, vlines: [[0.8, "trouble starts", "rose"]] }));
  addV("ds-load", 2, FG.compare({ title: "Online services", c: "teal", body: "measure <b>response time</b>: how long one user waits" }, { title: "Batch / analytics", c: "violet", body: "measure <b>throughput</b>: records per second, or time for the whole job" }));
  addV("ds-load", 3, FG.compare({ title: "① Same machines, more load", c: "amber", body: "how much slower does it get?" }, { title: "② Same speed, more load", c: "teal", body: "how many more machines do we need?" }));
  addV("ds-load", 4, FG.plot([{ f: gammaPdf, c: "teal", fill: true }], { x: [0, 1000], xl: "response time (ms)", h: 190, vlines: [[218, "p50 218", "teal"], [250, "mean 250", "violet", 16], [554, "p95 554", "amber"], [754, "p99 754", "rose"]] }) + `<div class="fig-cap">The long right tail is why the average hides the slow requests. Half of users wait under 218 ms, but 1 in 100 waits over 750 ms.</div>`);
  addV("ds-twitter", 1, FG.graph({ nodes: { You: { x: 70, y: 110, label: "you" }, A: { x: 280, y: 30 }, B: { x: 300, y: 110 }, C: { x: 280, y: 190 } }, edges: [["You", "A"], ["You", "B"], ["You", "C"]], directed: true, hl: { You: "violet", "You-A": "violet", "You-B": "violet", "You-C": "violet" }, w: 380, h: 220, r: 20 }) + `<div class="fig-cap">Every time you open the app: fetch from everyone you follow, then merge. Cheap to post, expensive to read.</div>`);
  addV("ds-twitter", 2, FG.graph({ nodes: { A: { x: 70, y: 110, label: "poster" }, F1: { x: 290, y: 30, label: "📬" }, F2: { x: 310, y: 110, label: "📬" }, F3: { x: 290, y: 190, label: "📬" } }, edges: [["A", "F1"], ["A", "F2"], ["A", "F3"]], directed: true, hl: { A: "teal", "A-F1": "teal", "A-F2": "teal", "A-F3": "teal" }, w: 380, h: 220, r: 22 }) + `<div class="fig-cap">Post once, and a copy lands in every follower's mailbox. Expensive to post, instant to read.</div>`);
  addV("ds-twitter", 3, FG.bars([["posts per second", 4.6, "violet", "k"], ["timeline reads per second", 300, "teal", "k"]], { max: 300 }) + `<div class="fig-cap">Reads outnumber posts about 65 to 1, so it pays to do the work once at post time.</div>`);
  addV("ds-twitter", 4, FG.bars([["target delivery", 5, "teal", "s"], ["celebrity fan-out", 87, "rose", "s"]], { max: 87 }) + `<div class="fig-cap">30 million mailbox writes ÷ 345k writes/s ≈ <b>87 seconds</b>, way over the 5 s goal. Hence the hybrid.</div>`);
  addV("ds-scaling", 0, FG.compare({ title: "Before", c: "dim", body: "🚐 one van, 4 CPUs, 16 GB" }, { title: "Scale up", c: "violet", body: "🚚 one lorry, 64 CPUs, 1 TB, still <b>one</b> machine" }));
  addV("ds-scaling", 1, FG.plot([{ f: (p) => p, c: "teal", dash: "5 4", label: "fair price" }, { f: (p) => 0.15 * Math.pow(p, 2.2), c: "rose", label: "real price" }], { x: [0.5, 4], xl: "power →", yl: "cost", h: 170 }));
  addV("ds-scaling", 2, FG.graph({ nodes: { LB: { x: 60, y: 110, label: "LB" }, N1: { x: 250, y: 30, label: "1" }, N2: { x: 270, y: 90, label: "2" }, N3: { x: 270, y: 150, label: "3" }, N4: { x: 250, y: 205, label: "4", c: "rose", sub: "down" } }, edges: [["LB", "N1"], ["LB", "N2"], ["LB", "N3"], ["LB", "N4", null, "rose"]], hl: { N1: "teal", N2: "teal", N3: "teal" }, w: 360, h: 240 }) + `<div class="fig-cap">A load balancer spreads requests over several ordinary machines. One dies, and the others keep serving.</div>`);
  addV("ds-scaling", 3, FG.compare({ title: "You gain", c: "teal", body: "cheaper growth · no single point of failure" }, { title: "You pay", c: "amber", body: "coordination · consistency · partial failures to handle" }));
  addV("ds-maintain", 1, FG.cells([{ v: "📈 monitoring", c: "teal" }, { v: "🤖 automation", c: "teal" }, { v: "🔁 no special machines", c: "teal" }, { v: "🎯 no surprises", c: "teal" }], { size: 140 }));
  addV("ds-maintain", 2, FG.compare({ title: "Essential complexity", c: "violet", body: "part of the problem itself: bus routes really do change hourly" }, { title: "Accidental complexity", c: "rose", body: "caused by how it was built: three formats for the same timestamp, undocumented scripts" }) + `<div class="fig-cap">Good abstractions remove the accidental kind and leave only what the problem needs.</div>`);
  addV("ds-maintain", 3, FG.flow([{ t: "new requirement", s: "\"add ferries\"" }, { t: "simple design", s: "one new module", c: "teal" }, { t: "shipped", s: "in days, not months" }]));
})();
