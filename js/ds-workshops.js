/* Data Science workshops (COM3021): no-code, hands-on labs built on NIC.workshop.
   1.W Ops room (reliability, load, p99) · 2.W Query lab (relational / document / graph) · 3.W Engine room (memtable, SSTables, compaction).
   Every number on screen comes from the simulation, never typed in. */
(function () {
  const N = NIC, { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig, L = N.LESSONS;
  const reg = (lecture, m) => N.register({ subject: "ds", lecture, order: 90, workshop: true, ...m });
  const fxOn = () => N.fx && N.fx.ok;
  const snd = (n) => N.sfx && N.sfx.play(n);
  const list = (a) => (a.length ? a.join(", ") : "nobody");

  /* =====================================================================
     1.W  OPS ROOM: keep a photo app alive
     ===================================================================== */
  const CAP = 100, SLO = 300, BASE = 20, MAXS = 10;
  function perf(servers, load) {
    const alive = servers.filter((s) => s === "ok").length;
    if (!alive) return { alive, state: "down" };
    const u = load / (CAP * alive);
    if (u > 1) return { alive, u, state: "over" };
    const p50 = Math.round(BASE / (1 - 0.9 * u)), p99 = Math.round(p50 * 3.5);
    return { alive, u, p50, p99, state: p99 <= SLO ? "ok" : "slow" };
  }

  function opsRoom(stage, api, life) {
    let servers, load, mode, canary;
    const reset = () => { servers = ["ok", "ok", "ok"]; load = 300; canary = -1; };
    reset(); mode = "all";
    const card = el(`<div class="wk-card">
      <h3>Snapbox: live traffic<span class="wk-sp"></span><span class="wk-badge" data-badge>Healthy</span></h3>
      <div class="wk-lane-l">users ▸ load balancer ▸ servers</div><div class="wk-lane" data-lane></div>
      <div class="wk-servers" data-srv style="margin-top:12px"></div>
      <div class="wk-stats" style="margin-top:12px" data-stats></div>
      <div data-lat style="margin-top:10px"></div>
      </div>`);
    const ctl = el(`<div class="wk-card"><h3>Controls</h3>
      <div class="wk-row" data-c1></div>
      <div class="wk-row" data-c2 style="margin-top:12px"></div></div>`);
    stage.append(card, ctl);
    const lane = qs("[data-lane]", card), srvBox = qs("[data-srv]", card);
    const sl = N.slider("Traffic", 100, 900, 50, load, (v) => `${v} req/s`);
    const bAdd = el(`<button class="btn">+ Add server</button>`), bKill = el(`<button class="btn rose">Kill a server</button>`), bFix = el(`<button class="btn">Replace failed</button>`);
    const bDep = el(`<button class="btn primary">Deploy v2</button>`), bBack = el(`<button class="btn">Roll back</button>`), bRs = el(`<button class="btn ghost small">Reset room</button>`);
    qs("[data-c1]", ctl).append(bAdd, bKill, bFix, sl);
    qs("[data-c2]", ctl).append(N.seg([["all", "All at once"], ["canary", "One server first"]], mode, (v) => { mode = v; }), bDep, bBack, bRs);
    qs("[data-c2]", ctl).insertAdjacentHTML("afterbegin", `<span class="faint" style="font-weight:800">Release v2 (it has a bug):</span>`);

    const tiles = [];
    function draw(pop) {
      const P = perf(servers, load);
      while (tiles.length < servers.length) { const t = el(`<div class="wk-srv pop-in"><div>Server ${tiles.length + 1}</div><div class="wk-meter"><i></i></div><div data-t></div></div>`); tiles.push(t); srvBox.appendChild(t); }
      while (tiles.length > servers.length) tiles.pop().remove();
      servers.forEach((s, i) => {
        const t = tiles[i], u = P.u || 0;
        t.className = `wk-srv ${s === "dead" ? "dead" : s === "bug" ? "bug" : u > 0.85 ? "max" : u > 0.65 ? "hot" : ""}${i === canary && s === "bug" ? " canary" : ""}`;
        qs("i", t).style.transform = `scaleY(${s === "ok" ? Math.max(0.06, Math.min(1, u)) : 0})`;
        qs("[data-t]", t).textContent = s === "ok" ? `${Math.round(u * 100)}% busy` : s === "dead" ? "disk failed" : "bug crash";
      });
      if (pop != null && tiles[pop]) { fxOn() && N.fx.springIn(tiles[pop], { from: 0.5, bounce: 0.55, dur: 0.45 }); }
      const badge = qs("[data-badge]", card);
      badge.className = `wk-badge ${P.state === "ok" ? "" : P.state === "slow" ? "slow" : "down"}`;
      badge.textContent = { ok: "Healthy", slow: "Too slow", over: "Overloaded", down: "DOWN" }[P.state];
      const cap = P.alive * CAP;
      qs("[data-stats]", card).innerHTML = N.wk.stat("Servers up", `${P.alive} / ${servers.length}`, P.alive === servers.length ? "teal" : "amber") +
        N.wk.stat("Traffic", `${load} req/s`, "blue") + N.wk.stat("Capacity", `${cap} req/s`) + N.wk.stat("Busy", P.u == null ? "-" : `${Math.round(P.u * 100)}%`, P.u > 1 ? "rose" : P.u > 0.85 ? "amber" : "teal");
      const bar = (name, ms, cls) => `<div class="wk-lat"><span>${name}</span><span class="wk-track"><i class="${cls}" style="transform:scaleX(${ms == null ? 1 : Math.min(1, ms / 800)})"></i>${name === "p99" ? `<span class="wk-slo" style="left:${(SLO / 800) * 100}%"></span>` : ""}</span><output>${P.state === "down" ? "no answer" : P.state === "over" ? "timeouts" : ms + " ms"}</output></div>`;
      qs("[data-lat]", card).innerHTML = bar("median", P.p50, P.state === "ok" || P.state === "slow" ? "" : "bad") + bar("p99", P.p99, P.state === "ok" ? "" : "bad") + `<div class="faint" style="font-size:12px;font-weight:800;text-align:right">black line = goal: p99 under ${SLO} ms</div>`;
      // traffic dots: more traffic, more dots, faster
      const n = Math.max(2, Math.min(10, Math.round(load / 100))), w = Math.max(200, (lane.clientWidth || 600) - 16);
      lane.className = `wk-lane${P.state === "ok" ? "" : " bad"}`;
      lane.innerHTML = Array.from({ length: n }, (_, i) => `<span class="wk-pkt" style="--dl:${(-i * 2.6) / n}s;--fd:${Math.max(1.3, 3.2 - load / 450)}s;--lw:${w}px"></span>`).join("");
      btns(P);
    }
    function btns() {
      bAdd.disabled = servers.length >= MAXS;
      bKill.disabled = !servers.includes("ok");
      bFix.disabled = !servers.some((s) => s !== "ok");
      bBack.disabled = !servers.includes("bug");
    }
    const healthy = () => perf(servers, load).state === "ok";
    const served = () => ["ok", "slow"].includes(perf(servers, load).state);

    bAdd.onclick = () => {
      servers.push("ok"); draw(servers.length - 1); snd("pop");
      const P = perf(servers, load);
      api.say(P.state === "ok" ? `Server ${servers.length} is in. Each one takes a share, so everyone gets faster.` : `Added a server, but at ${Math.round((P.u || 9) * 100)}% busy it's still too hot. Capacity is ${CAP} req/s per server.`, "happy");
      if (load >= 600 && healthy()) api.done("spike");
    };
    bKill.onclick = () => {
      const ok = servers.map((s, i) => (s === "ok" ? i : -1)).filter((i) => i >= 0), i = ok[Math.floor(N.rnd() * ok.length)];
      servers[i] = "dead"; snd("wrong"); draw();
      fxOn() && N.fx.shake(tiles[i]);
      const P = perf(servers, load);
      if (P.state === "ok") { api.say("A disk died and nobody noticed. That's a <b>fault</b> that never became a <b>failure</b>: you had spare capacity.", "love"); if (load >= 300) api.done("fault"); }
      else if (P.state === "down") api.say("That was the last server. Total failure.", "cry");
      else api.say(`One server down and Snapbox is <b>${P.state === "over" ? "overloaded" : "too slow"}</b>. Faults are normal, so keep headroom for them.`, "sad");
    };
    bFix.onclick = () => {
      servers = servers.map((s) => "ok"); canary = -1; draw(); snd("tick");
      api.say("Failed servers replaced. In real life: swap the disk, or let the orchestrator restart the machine.", "happy");
    };
    sl.onInput((v) => {
      load = v; draw();
      const P = perf(servers, load);
      if (load >= 600 && P.state === "ok") api.done("spike");
      if (P.state !== "ok" && load >= 600) api.say(`${load} req/s needs more capacity. Add servers until the goal line holds.`, "think");
    });
    bDep.onclick = () => {
      const up = servers.map((s, i) => (s === "ok" ? i : -1)).filter((i) => i >= 0);
      if (!up.length) { api.say("There's nothing running to deploy to.", "think"); return; }
      if (mode === "all") {
        up.forEach((i) => (servers[i] = "bug")); canary = -1; draw(); snd("sad");
        up.forEach((i) => fxOn() && N.fx.shake(tiles[i]));
        api.say(`Every server runs the <b>same</b> code, so the same bug hit all ${up.length} at once. A software fault is <b>correlated</b>: adding servers would not have helped.`, "shocked");
        if (perf(servers, load).state === "down") api.done("outage");
      } else {
        canary = up[0]; servers[canary] = "bug"; draw(); snd("wrong");
        fxOn() && N.fx.shake(tiles[canary]);
        const P = perf(servers, load);
        if (served()) { api.say("Only the <b>first</b> server got v2 and it crashed. Everyone else is on v1 and users barely noticed. Now roll back.", "happy"); api.done("release"); }
        else api.say("The canary crashed, but the rest couldn't cope with its share of traffic. Lower traffic or add servers first, then try a safer release.", "think");
      }
    };
    bBack.onclick = () => { servers = servers.map((s) => (s === "bug" ? "ok" : s)); canary = -1; draw(); snd("tick"); api.say("Rolled back to v1. Service restored.", "happy"); };
    bRs.onclick = () => { reset(); sl.value = load; draw(); api.say("Room reset: 3 servers and 300 req/s.", "idle"); };
    life.onResize(() => draw());
    draw();
  }

  reg(1, {
    id: "ds-ops", num: "1.W", title: "Workshop: keep the app alive",
    blurb: "No code. Run the ops room for a photo app: survive failed servers, traffic spikes and a bad release.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro: "Welcome to the ops room. <b>Snapbox</b> has 3 servers and 300 req/s. Let's break things safely.",
        missions: [
          { id: "fault", t: "Survive a dead server", d: "Press <b>Kill a server</b> while Snapbox stays <b>Healthy</b> at 300 req/s or more.", hint: "Each server handles 100 req/s. After one dies, the rest must stay under about 85% busy. How many servers does that need?" },
          { id: "spike", t: "Ride a traffic spike", d: "Push traffic to <b>600 req/s</b> and keep it <b>Healthy</b>.", hint: "p99 is the slowest 1 in 100 requests. Watch it cross the black line as servers get busier." },
          { id: "release", t: "Release without an outage", d: "Deploy v2 <b>one server first</b> and keep users being served.", hint: "Set the switch to <b>One server first</b>. If the rest can't cope with the load, lower traffic or add a server first." },
          { id: "outage", t: "Cause an outage on purpose", d: "Deploy v2 <b>all at once</b> and watch what happens.", hint: "Roll back or press <b>Reset room</b> first, then switch to <b>All at once</b>." },
        ],
        build: (stage, api) => opsRoom(stage, api, life),
      });
      root.appendChild(predict({ id: "ds-ops-1", q: "Snapbox has 4 servers, each handling 100 req/s, and 320 req/s of traffic. One disk dies. What happens to the remaining three?", opts: ["They run above their capacity, so the app slows or fails", "They share it easily: 320 req/s is under 400", "Nothing, because faults never reduce capacity"], a: 0,
        why: "Three servers give 300 req/s of capacity, below the 320 they now receive. A healthy-looking system can fail after one ordinary fault if it has no headroom." }));
      root.appendChild(predict({ id: "ds-ops-2", q: "A new release crashes on start-up. Which rollout limits the damage to the fewest users?", opts: ["Send v2 to one server first and watch it", "Send v2 to every server at the same moment", "Send v2 to every server overnight"], a: 0,
        why: "A software bug is correlated: every server running it fails the same way. A canary exposes a small slice of traffic to the new code, so a bad release is caught early." }));
      root.appendChild(takeaways([
        "Hardware faults are <b>independent</b>: extra servers absorb them, but only if you kept <b>headroom</b>.",
        "Software faults are <b>correlated</b>: the same bug hits every copy, so more servers do not help. Roll out <b>gradually</b>.",
        "Judge speed by a <b>percentile</b> (p99), not just the median: the slowest users feel trouble first.",
      ], "Plan for one ordinary fault to happen, and release changes to a few servers before all of them."));
    },
  });
  L["ds-ops"] = {
    sum: "A hands-on ops room: survive faults and spikes, then release a bad version safely.",
    steps: [
      { t: "What you will practise", b: `<p>You run the servers for <b>Snapbox</b>, a photo app. Four missions: lose a server, take a traffic spike, ship a buggy release carefully, then ship it badly on purpose.</p><p>Every server handles <b>100 requests per second</b>. The goal is a <b>p99 under 300 ms</b>.</p>`,
        v: F.flow(["Traffic", { t: "Load balancer", c: "blue" }, { t: "Servers", c: "teal" }]),
        c: { q: "What does \"p99 = 300 ms\" mean?", o: ["99 in 100 requests finish within 300 ms", "The average request takes 300 ms", "99% of servers respond in 300 ms"], a: 0, why: "A percentile describes the slowest users: p99 is the time that all but 1 request in 100 beat." } },
      { t: "Busier means slower", b: `<p>A server that is half busy answers quickly. One near its limit queues requests, and the <b>slowest</b> ones suffer first.</p><p>So leave <b>headroom</b>. Capacity you need only when something breaks is still capacity you need.</p>`,
        v: F.compare({ title: "40% busy", c: "teal", body: "requests rarely wait: p99 stays small" }, { title: "95% busy", c: "rose", body: "a queue forms: p99 balloons, then timeouts" }),
        c: { q: "Why keep servers well below 100% busy in normal times?", o: ["So a failure or spike does not push them over the edge", "Because idle servers are cheaper to run", "Because 100% busy servers lose data"], a: 0, why: "Headroom is what lets one failed server or one spike be absorbed instead of becoming an outage." } },
    ],
    guide: ["Work through the four missions in the workshop."],
  };

  /* =====================================================================
     2.W  QUERY LAB: the same question on tables, documents and a graph
     ===================================================================== */
  const PEOPLE = { Ana: ["Leeds", "Acme"], Ben: ["Leeds", "Bolt"], Cy: ["York", "Acme"], Dee: ["York", "Bolt"], Eli: ["Hull", "Acme"] };
  const NAMES = Object.keys(PEOPLE);
  const FRIENDS = [["Ana", "Ben"], ["Ben", "Cy"], ["Cy", "Dee"], ["Dee", "Eli"]];
  const GPOS = { Ana: [50, 70], Ben: [150, 35], Cy: [250, 70], Dee: [350, 35], Eli: [450, 70] };
  const nbrs = (n) => FRIENDS.flatMap(([a, b]) => (a === n ? [b] : b === n ? [a] : []));
  const BLOCKS = [
    { id: "all", k: "start", t: "Start: everyone" }, { id: "ana", k: "start", t: "Start: Ana" },
    { id: "c-Leeds", k: "flt", t: "City is Leeds" }, { id: "c-York", k: "flt", t: "City is York" }, { id: "c-Hull", k: "flt", t: "City is Hull" },
    { id: "w-Acme", k: "flt", t: "Works at Acme" }, { id: "w-Bolt", k: "flt", t: "Works at Bolt" },
    { id: "hop", k: "hop", t: "Go to friends" },
  ];
  const BL = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

  /** Run a pipeline of block ids. Returns the steps (input/output sets, edges walked) and the three cost meters. */
  function runQuery(ids) {
    let cur = [], seen = new Set(), steps = [], hops = 0, fetches = 0;
    ids.forEach((id, i) => {
      const b = BL[id], inp = cur.slice(); let out, edges = [];
      if (b.k === "start") { out = id === "all" ? NAMES.slice() : ["Ana"]; seen = new Set(out); }
      else if (b.id === "hop") {
        hops++; fetches += inp.length;
        out = []; FRIENDS.forEach(([a, c], ei) => { [[a, c], [c, a]].forEach(([x, y]) => { if (inp.includes(x) && !seen.has(y) && !out.includes(y)) { out.push(y); edges.push(ei); } }); });
        FRIENDS.forEach(([a, c], ei) => { if ((inp.includes(a) && out.includes(c)) || (inp.includes(c) && out.includes(a))) if (!edges.includes(ei)) edges.push(ei); });
        out.forEach((p) => seen.add(p));
      } else if (id.startsWith("c-")) out = inp.filter((p) => PEOPLE[p][0] === id.slice(2));
      else out = inp.filter((p) => PEOPLE[p][1] === id.slice(2));
      cur = out; steps.push({ id, inp, out, edges });
    });
    return { steps, result: cur, hops, fetches, filters: ids.filter((x) => /^[cw]-/.test(x)) };
  }

  function queryLab(stage, api, life) {
    let pipe = [], token = 0;
    const docText = (n) => `{ <b>"name"</b>: "${n}", <b>"city"</b>: "${PEOPLE[n][0]}", <b>"works_at"</b>: "${PEOPLE[n][1]}", <b>"friends"</b>: [${nbrs(n).map((x) => `"${x}"`).join(", ")}] }`;
    const build = el(`<div class="wk-card"><h3>Your query<span class="wk-sp"></span><button class="btn small ghost" data-clear>Clear</button></h3>
      <div class="wk-pipe" data-pipe></div>
      <div class="wk-pal" style="margin-top:12px" data-pal></div>
      <div class="wk-row" style="margin-top:12px"><button class="btn primary" data-run>Run query</button><span class="wk-note" data-res style="flex:1;min-height:0"></span></div></div>`);
    const views = el(`<div class="wk-grid3">
      <div class="wk-card"><h3>Tables</h3>
        <table class="wk-tbl" data-ptbl><tr><th>name</th><th>city</th><th>works at</th></tr>${NAMES.map((n) => `<tr data-p="${n}"><td><b>${n}</b></td><td>${PEOPLE[n][0]}</td><td>${PEOPLE[n][1]}</td></tr>`).join("")}</table>
        <table class="wk-tbl" data-ftbl style="margin-top:6px"><tr><th>friendships: a</th><th>b</th></tr>${FRIENDS.map(([a, b], i) => `<tr data-e="${i}"><td>${a}</td><td>${b}</td></tr>`).join("")}</table>
        <div class="wk-cost"><span>Self-joins on friendships</span><b data-c-tbl>-</b></div></div>
      <div class="wk-card"><h3>Documents</h3>${NAMES.map((n) => `<div class="wk-doc" data-p="${n}">${docText(n)}</div>`).join("")}
        <div class="wk-cost"><span>Extra documents your code fetches</span><b data-c-doc>-</b></div></div>
      <div class="wk-card"><h3>Graph</h3>
        <svg class="wk-gsvg" viewBox="0 0 500 105" role="img" aria-label="Five people in a line of friendships">
          ${FRIENDS.map(([a, b], i) => `<line class="ge" data-e="${i}" x1="${GPOS[a][0]}" y1="${GPOS[a][1]}" x2="${GPOS[b][0]}" y2="${GPOS[b][1]}"/>`).join("")}
          ${NAMES.map((n) => `<g class="gn" data-p="${n}"><circle cx="${GPOS[n][0]}" cy="${GPOS[n][1]}" r="22"/><text x="${GPOS[n][0]}" y="${GPOS[n][1]}">${n}</text></g>`).join("")}</svg>
        <p class="faint" style="font-weight:800;font-size:12.5px;margin:6px 0 0">Friendships are the edges. A hop follows them.</p>
        <div class="wk-cost"><span>Edge hops</span><b data-c-gr>-</b></div></div></div>`);
    stage.append(build, views);
    const pipeEl = qs("[data-pipe]", build), res = qs("[data-res]", build), pal = qs("[data-pal]", build);
    const grp = (label, kind) => `<div class="wk-row"><b>${label}</b>${BLOCKS.filter((b) => b.k === kind).map((b) => `<button class="wk-blk ${b.k}" data-b="${b.id}">${b.t}</button>`).join("")}</div>`;
    pal.innerHTML = grp("Start", "start") + grp("Filter", "flt") + grp("Traverse", "hop");

    const drawPipe = () => {
      pipeEl.innerHTML = pipe.map((id, i) => `${i ? `<span class="wk-arr">▸</span>` : ""}<button class="wk-blk in-pipe ${BL[id].k}" data-i="${i}" title="Tap to remove">${BL[id].t}</button>`).join("");
      qsa("[data-i]", pipeEl).forEach((b) => (b.onclick = () => { const i = +b.dataset.i; pipe = BL[pipe[i]].k === "start" ? [] : pipe.filter((_, j) => j !== i); drawPipe(); clear(); }));
      if (fxOn() && pipe.length) N.fx.springIn(pipeEl.lastElementChild, { from: 0.6, bounce: 0.5, dur: 0.35 });
    };
    const mark = (set, cls, edges = []) => {
      qsa("[data-p]", views).forEach((n) => { const on = set.includes(n.dataset.p); const was = n.classList.contains(cls); n.classList.remove("front", "hit", "pop"); if (on) { n.classList.add(cls); if (!was) { void n.getBoundingClientRect(); n.classList.add("pop"); } } });
      qsa("[data-e]", views).forEach((n) => { const on = edges.includes(+n.dataset.e); n.classList.toggle("front", on && n.tagName === "TR"); n.classList.toggle("on", on); });
    };
    const clear = () => { token++; mark([], "front"); ["tbl", "doc", "gr"].forEach((k) => (qs(`[data-c-${k}]`, views).textContent = "-")); res.innerHTML = ""; };

    qsa("[data-b]", build).forEach((b) => (b.onclick = () => {
      const id = b.dataset.b, blk = BL[id];
      if (blk.k === "start") pipe = [id, ...pipe.slice(BL[pipe[0] || "hop"].k === "start" ? 1 : 0)];
      else if (!pipe.length || BL[pipe[0]].k !== "start") { api.say("Every query needs a <b>Start</b> block first: who are we searching?", "think"); N.wk.flash(qs(".wk-row", pal), "wk-shake"); snd("wrong"); return; }
      else pipe.push(id);
      snd("tap"); drawPipe(); clear();
    }));
    qs("[data-clear]", build).onclick = () => { pipe = []; drawPipe(); clear(); };

    const M = {
      leeds: { want: ["Ana", "Ben"], ok: (r) => r.filters.length >= 1 },
      york: { want: ["Cy"], ok: (r) => r.filters.length >= 2 },
      fof: { want: ["Cy"], ok: (r) => r.hops === 2 && r.filters.length === 0 },
      bolt: { want: ["Dee"], ok: (r) => r.hops === 3 && r.filters.includes("w-Bolt") },
    };
    qs("[data-run]", build).onclick = () => {
      if (!pipe.length || BL[pipe[0]].k !== "start") { api.say("Build a query first: tap a <b>Start</b> block, then add filters or hops.", "think"); return; }
      const my = ++token, r = runQuery(pipe), put = (k, v) => { const n = qs(`[data-c-${k}]`, views); fxOn() ? N.fx.count(n, v, { from: 0, dur: 0.35 }) : (n.textContent = v); };
      const last = r.steps.length - 1;
      r.steps.forEach((s, i) => life.timeout(() => {
        if (my !== token) return;
        mark(s.out, i === last ? "hit" : "front", s.edges);
        if (i === last) {
          put("tbl", r.hops); put("doc", r.fetches); put("gr", r.hops);
          res.innerHTML = `Result: <b>${list(r.result)}</b>`;
          snd(r.result.length ? "step" : "wrong");
          grade(r);
        }
      }, 120 + i * 480));
    };
    function grade(r) {
      const hit = Object.entries(M).find(([, m]) => m.want.join() === r.result.slice().sort().join() && m.ok(r));
      if (hit) { api.done(hit[0]); }
      if (r.hops >= 1) {
        api.say(`<b>${r.hops}</b> hop${r.hops > 1 ? "s" : ""}: tables needed ${r.hops} self-join${r.hops > 1 ? "s" : ""}, documents made your code fetch <b>${r.fetches}</b> more document${r.fetches === 1 ? "" : "s"}, the graph just followed ${r.hops} edge${r.hops > 1 ? "s" : ""}. <b>Relationships are a graph's home ground.</b>`, "think");
      } else if (hit) api.say("Filters on one kind of record are easy in <b>every</b> model. The difference shows up when you follow relationships.", "happy");
      else api.say(`That returned <b>${list(r.result)}</b>. Check the mission again and adjust the blocks.`, "think");
    }
    drawPipe();
  }

  reg(2, {
    id: "ds-querylab", num: "2.W", title: "Workshop: ask the data",
    blurb: "No code. Snap query blocks together and see one dataset as tables, documents and a graph.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro: "Same five people, three data models. Build a query from blocks and watch all three light up.",
        missions: [
          { id: "leeds", t: "Who lives in Leeds?", d: "Start with <b>everyone</b>, then add a city filter.", hint: "Start: everyone, then City is Leeds. Press <b>Run query</b>." },
          { id: "york", t: "Acme staff in York", d: "Two filters in a row: a city <b>and</b> an employer.", hint: "Filters narrow the list one after another, so order doesn't matter." },
          { id: "fof", t: "Friends of friends of Ana", d: "Start at <b>Ana</b> and go to friends twice. Who is new?", hint: "Start: Ana, Go to friends, Go to friends. Each hop only adds people you haven't reached yet." },
          { id: "bolt", t: "Three steps away, works at Bolt", d: "Start at Ana, hop three times, then filter by employer.", hint: "Three hops, then Works at Bolt. Read the three cost meters afterwards." },
        ],
        build: (stage, api) => queryLab(stage, api, life),
      });
      root.appendChild(predict({ id: "ds-ql-1", q: "You must list everyone within 4 friendship hops of one person. Which model makes that natural?", opts: ["A graph: follow the edges hop by hop", "Documents: each friend id is fetched in application code", "Tables: four separate single-table lookups"], a: 0,
        why: "Variable-depth relationship queries are what graph models are built for. Documents push each hop into your own code, and tables need one more join per hop." }));
      root.appendChild(predict({ id: "ds-ql-2", q: "\"Everyone in York who works at Acme\" uses no relationships. How do the three models compare?", opts: ["All three answer it easily", "Only the graph can answer it", "Only tables can answer it"], a: 0,
        why: "A filter over one kind of record is easy everywhere. Models diverge on many-to-many relationships, not on simple filters." }));
      root.appendChild(takeaways([
        "<b>Filters</b> over one kind of record are easy in tables, documents and graphs.",
        "<b>Relationships</b> are the test: tables need a <b>join</b> per hop, documents push each hop into your application, graphs simply follow edges.",
        "Choose the model from the <b>questions you will ask</b>, not from habit.",
      ], "If the question is about how things connect, reach for a graph; if it is about one record, most models will do."));
    },
  });
  L["ds-querylab"] = {
    sum: "Build queries from blocks and see one dataset as tables, documents and a graph.",
    steps: [
      { t: "What you will practise", b: `<p>You'll build queries without typing any syntax: snap <b>Start</b>, <b>Filter</b> and <b>Traverse</b> blocks together, then run them.</p><p>The same five people are shown as <b>tables</b>, <b>documents</b> and a <b>graph</b>, so you can compare.</p>`,
        v: F.flow([{ t: "Start", c: "violet" }, { t: "Filter", c: "blue" }, { t: "Go to friends", c: "amber" }]),
        c: { q: "In the lab, which block walks along relationships?", o: ["Go to friends", "City is York", "Start: everyone"], a: 0, why: "Traversal follows edges between records. Filters only narrow the records you already have." } },
      { t: "Three ways to hop", b: `<p>A hop means <b>\"go to this person's friends\"</b>. Each model pays for it differently.</p>`,
        v: F.compare({ title: "Tables and documents", c: "amber", body: "a join, or another fetch from your code, for every hop" }, { title: "Graph", c: "teal", body: "follow an edge: the same move every time" }),
        c: { q: "A query needs a variable number of hops. Why is that awkward in tables?", o: ["The number of joins is fixed when you write the query", "Tables cannot store friendships at all", "Tables forbid filters on two columns"], a: 0, why: "Each hop is one more join written into the query, so an unknown depth is hard to express." } },
    ],
    guide: ["Work through the four missions in the workshop."],
  };

  /* =====================================================================
     3.W  ENGINE ROOM: memtable, SSTables, compaction, crashes
     ===================================================================== */
  function engineRoom(stage, api, life) {
    const CAPM = 4, KEYS = ["apple", "date", "fig", "kiwi", "mango", "plum"];
    let mem, segs, wal, walOn, crashed, ctr, mode, slow, compactedAfterSlow, flushes;
    const seed = () => { mem = new Map(); segs = [[["apple", 1], ["fig", 2], ["kiwi", 3], ["mango", 4]], [["apple", 5], ["date", 6], ["kiwi", 7], ["plum", 8]]]; wal = []; walOn = true; crashed = false; ctr = 8; slow = false; compactedAfterSlow = false; flushes = 0; };
    seed(); mode = "put";
    const card = el(`<div class="wk-card"><h3>Pick a key, then act on it<span class="wk-sp"></span><span class="faint" data-v style="text-transform:none;letter-spacing:0"></span></h3>
      <div class="wk-row" data-mode style="margin-bottom:12px"></div><div class="wk-keys" data-keys></div></div>`);
    const eng = el(`<div class="wk-card"><h3>The engine</h3><div class="wk-layers">
      <div class="wk-layer mem" data-mem><small>Memtable<br><span style="text-transform:none;letter-spacing:0">in memory, sorted, holds ${CAPM}</span></small><div class="wk-cells"></div></div>
      <div class="wk-layer" data-wal><small>Log file<br><span style="text-transform:none;letter-spacing:0">on disk, append-only</span></small><div class="wk-cells"></div></div>
      <div class="wk-disk" data-disk></div></div>
      <div class="wk-row" style="margin-top:12px" data-ctl></div></div>`);
    const out = el(`<div class="wk-out" data-out>Choose <b>Put</b>, <b>Delete</b> or <b>Get</b>, then tap a key.</div>`);
    stage.append(card, eng, out);
    const setOut = (h) => { out.innerHTML = h; N.wk.flash(out); };
    const bCompact = el(`<button class="btn">Compact disk segments</button>`), bCrash = el(`<button class="btn rose">Crash the machine</button>`), bRestart = el(`<button class="btn primary">Restart</button>`), bRs = el(`<button class="btn ghost small">Reset</button>`);
    const walSeg = N.seg([["on", "Log on"], ["off", "Log off"]], "on", (v) => { walOn = v === "on"; });
    qs("[data-ctl]", eng).append(bCompact, bCrash, bRestart, walSeg, bRs);
    const modeSeg = N.seg([["put", "Put"], ["del", "Delete"], ["get", "Get"]], mode, (v) => { mode = v; drawKeys(); });
    qs("[data-mode]", card).appendChild(modeSeg);

    const cells = (rows, cls = "", hitKey) => rows.length ? rows.map(([k, v]) => `<span class="wk-cell ${v === null ? "tomb" : ""} ${k === hitKey ? "hit" : ""} ${cls}">${k}: ${v === null ? "deleted" : "v" + v}</span>`).join("") : `<span class="wk-empty">(empty)</span>`;
    const memRows = () => [...mem.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, o]) => [k, o.v]);
    const layerEls = () => [qs("[data-mem]", eng), ...qsa("[data-disk] .wk-layer", eng)];
    function drawKeys() {
      const box = qs("[data-keys]", card); box.innerHTML = KEYS.map((k) => `<button class="wk-key" data-mode="${mode}" data-k="${k}" ${crashed ? "disabled" : ""}>${k}</button>`).join("");
      qsa("[data-k]", box).forEach((b) => (b.onclick = () => act(b.dataset.k)));
    }
    function draw(newKey) {
      qs(".wk-cells", qs("[data-mem]", eng)).innerHTML = cells(memRows(), "new", newKey);
      qs(".wk-cells", qs("[data-wal]", eng)).innerHTML = wal.length ? wal.map(([k, v]) => `<span class="wk-cell">${k}: ${v === null ? "deleted" : "v" + v}</span>`).join("") : `<span class="wk-empty">${walOn ? "(nothing unsaved)" : "(log is off)"}</span>`;
      qs("[data-disk]", eng).innerHTML = segs.slice().reverse().map((s, i) => { const n = segs.length - i; return `<div class="wk-layer"><small>Segment ${n}<br><span style="text-transform:none;letter-spacing:0">${i === 0 ? "newest" : n === 1 ? "oldest" : "sorted, read-only"}</span></small><div class="wk-cells">${cells(s)}</div></div>`; }).join("");
      qs("[data-v]", card).textContent = `${segs.length} segment${segs.length === 1 ? "" : "s"} on disk`;
      qs("[data-mem]", eng).classList.toggle("crashed", crashed);
      bRestart.disabled = !crashed; bCrash.disabled = crashed; bCompact.disabled = crashed || segs.length < 2;
      drawKeys();
    }
    const flush = () => {
      const rows = memRows(); segs.push(rows); mem = new Map(); wal = []; flushes++;
      snd("pop"); draw();
      const last = qs("[data-disk] .wk-layer", eng); fxOn() && N.fx.springIn(last, { from: 0.85, bounce: 0.4, dur: 0.4 });
      api.say(`The memtable filled up, so it was written out as <b>Segment ${segs.length}</b>: already sorted, and never edited again.`, "happy");
      api.done("flush");
    };
    function put(k, del) {
      if (crashed) return;
      const v = del ? null : ++ctr;
      mem.set(k, { v }); if (walOn) wal.push([k, v]);
      snd(del ? "squeak" : "tap"); draw(k);
      if (mem.size >= CAPM) life.timeout(flush, 350);
      else api.say(del ? `Deleting doesn't erase anything. It writes a <b>tombstone</b> for <b>${k}</b>; older copies stay until compaction.` : `Written to memory (and the log, if it is on). ${CAPM - mem.size} more until a flush.`, del ? "think" : "idle");
    }
    const copies = (k) => (mem.has(k) ? 1 : 0) + segs.filter((s) => s.some(([x]) => x === k)).length;
    async function get(k) {
      if (crashed) return;
      const order = [{ t: "memory", rows: memRows() }, ...segs.slice().reverse().map((s, i) => ({ t: `Segment ${segs.length - i}`, rows: s }))];
      const hitI = order.findIndex((l) => l.rows.some(([x]) => x === k)), checks = hitI < 0 ? order.length : hitI + 1, le = layerEls();
      le.forEach((e) => e.classList.remove("look", "found", "miss"));
      const my = ++getTok;
      for (let i = 0; i < checks; i++) {
        await new Promise((r) => life.timeout(r, fxOn() ? 260 : 0)); if (my !== getTok) return;
        le[i].classList.add("look"); snd("tick");
        await new Promise((r) => life.timeout(r, fxOn() ? 200 : 0)); if (my !== getTok) return;
        le[i].classList.remove("look"); le[i].classList.add(i === hitI ? "found" : "miss");
      }
      const row = hitI >= 0 ? order[hitI].rows.find(([x]) => x === k) : null;
      setOut(!row ? `<b>${k}</b> isn't anywhere: <span class="no">not found</span> after <b>${checks}</b> places checked.` : row[1] === null ? `<b>${k}</b>: the newest entry is a <b>tombstone</b>, so it's <span class="no">deleted</span>. Found in ${order[hitI].t} after <b>${checks}</b> check${checks > 1 ? "s" : ""}.` : `<b>${k}</b> = <span class="ok">v${row[1]}</span> from ${order[hitI].t}. Places checked: <b>${checks}</b>.`);
      snd(row ? "correct" : "wrong");
      if (row && row[1] !== null && copies(k) >= 2) { api.say(`<b>${k}</b> exists in ${copies(k)} places. The search goes newest to oldest and stops at the first hit, so the <b>newest value wins</b>.`, "happy"); api.done("newest"); }
      if (row && row[1] === null) { api.say("A tombstone hides every older copy. Compaction will finally remove the key for good.", "think"); api.done("delete"); }
      if (checks >= 3) { slow = true; api.say(`${checks} places to check for one key. The more segments pile up, the slower reads get. Try <b>Compact</b>.`, "sad"); }
      else if (slow && compactedAfterSlow && checks <= 2) { api.say(`Only <b>${checks}</b> places now. Compaction merged the segments and kept the newest value per key.`, "love"); api.done("compact"); }
    }
    let getTok = 0;
    function act(k) { if (mode === "put") put(k, false); else if (mode === "del") put(k, true); else get(k); }

    bCompact.onclick = () => {
      const before = segs.length, latest = new Map();
      segs.forEach((s) => s.forEach(([k, v]) => latest.set(k, v)));
      const merged = [...latest.entries()].filter(([, v]) => v !== null).sort((a, b) => (a[0] < b[0] ? -1 : 1));
      segs = [merged]; if (slow) compactedAfterSlow = true;
      snd("whoosh"); draw(); fxOn() && N.fx.springIn(qs("[data-disk] .wk-layer", eng), { from: 0.8, bounce: 0.4, dur: 0.45 });
      setOut(`Merged <b>${before}</b> segments into <b>1</b> sorted segment. Newest values kept, tombstoned keys dropped: <b>${merged.length}</b> keys remain.`);
      api.say(slow ? "Merged! Now read the same key again and count the places." : "Compacted. Fewer segments mean fewer places to check on each read.", "happy");
    };
    bCrash.onclick = () => {
      const unsaved = mem.size;
      crashed = true; mem = new Map(); snd("sad"); draw(); fxOn() && N.fx.shake(qs("[data-mem]", eng));
      setOut(`💥 Power cut. Memory is wiped: <b>${unsaved}</b> unsaved write${unsaved === 1 ? "" : "s"} gone from the memtable. The log file on disk has <b>${wal.length}</b> record${wal.length === 1 ? "" : "s"}.`);
      api.say(unsaved ? "Everything in RAM has vanished. Will the log save us?" : "Nothing unsaved was in memory, so nothing to lose this time. Write a key first.", unsaved ? "shocked" : "idle");
      bCrash._had = unsaved;
    };
    bRestart.onclick = () => {
      crashed = false; mem = new Map(); wal.forEach(([k, v]) => mem.set(k, { v })); snd("tick"); draw();
      const n = mem.size, lost = (bCrash._had || 0) - n;
      setOut(n ? `Restarted and <b>replayed the log</b>: ${n} write${n === 1 ? "" : "s"} recovered.${lost > 0 ? ` ${lost} were lost because the log was off when they were written.` : ""}` : `Restarted with an empty memtable.${lost > 0 ? ` ${lost} unsaved write${lost === 1 ? "" : "s"} lost forever: the log was off.` : ""}`);
      if (n) { api.say("The write-ahead log put everything back. That's why databases log before they acknowledge a write.", "love"); api.done("crash"); }
      else if (lost > 0) api.say("Those writes are gone. Switch the log <b>on</b> and try again.", "cry");
    };
    bRs.onclick = () => { getTok++; seed(); walSeg.querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i === 0)); draw(); setOut("Engine reset to two old segments."); api.say("Fresh engine: two old segments and an empty memtable.", "idle"); };
    draw();
  }

  reg(3, {
    id: "ds-engine", num: "3.W", title: "Workshop: run a storage engine",
    blurb: "No code. Write, delete and read keys, then flush, compact and survive a crash.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro: "This engine keeps recent writes in a <b>memtable</b> and old data in sorted <b>segments</b>. Put, delete, get, then break it.",
        missions: [
          { id: "flush", t: "Trigger a flush", d: "In <b>Put</b> mode, write four different keys to fill the memtable.", hint: "Tap four keys one after another. Overwriting the same key doesn't grow the memtable." },
          { id: "newest", t: "Newest value wins", d: "Switch to <b>Get</b> and read a key that has more than one copy.", hint: "<b>apple</b> is in both old segments. Read it and see which version comes back." },
          { id: "delete", t: "Delete, then read", d: "Use <b>Delete</b> on a key, then <b>Get</b> it.", hint: "Delete doesn't remove data, it adds a tombstone. Get the same key and see what the search finds first." },
          { id: "compact", t: "Make reads cheaper", d: "Read a key that takes <b>3 or more</b> checks, press <b>Compact</b>, then read it again.", hint: "<b>fig</b> only lives in the oldest segment, so it needs several checks. Compact, then get it again." },
          { id: "crash", t: "Survive a power cut", d: "Write a key with the <b>log on</b>, <b>Crash</b> the machine, then <b>Restart</b>.", hint: "Put a key (don't fill the memtable), crash, restart. Try it once with the log off to see the difference." },
        ],
        build: (stage, api) => engineRoom(stage, api, life),
      });
      root.appendChild(predict({ id: "ds-eng-1", q: "A write is acknowledged, then the machine loses power before the memtable is flushed. With a write-ahead log, what happens to the write?", opts: ["It is replayed from the log on restart", "It is gone, because memory was lost", "It was already in a sorted segment"], a: 0,
        why: "The log is appended to disk before the write is acknowledged. After a crash the engine rebuilds the memtable by replaying it." }));
      root.appendChild(predict({ id: "ds-eng-2", q: "Reads have slowed as the number of disk segments grew from 2 to 12. What brings read cost back down?", opts: ["Compaction: merge segments and keep the newest value per key", "Writing more keys to the memtable", "Turning the log off"], a: 0,
        why: "A read may have to check every segment from newest to oldest. Merging them leaves fewer places to look, and throws away overwritten values and tombstones." }));
      root.appendChild(takeaways([
        "Writes go to the <b>memtable</b> (memory) and the <b>log</b>; a full memtable is flushed as a new <b>sorted segment</b>.",
        "A read checks memory, then segments <b>newest to oldest</b>, and stops at the first hit. Newest wins.",
        "<b>Delete</b> writes a tombstone; <b>compaction</b> merges segments, drops old values and finally removes deleted keys.",
        "The <b>log</b> is what lets memory be lost without losing data.",
      ], "Fast writes come from appending in memory; compaction pays the bill later by keeping reads short."));
    },
  });
  L["ds-engine"] = {
    sum: "Write, delete and read keys in a log-structured engine; flush, compact and crash it.",
    steps: [
      { t: "What you will practise", b: `<p>You'll drive a small <b>log-structured</b> storage engine by hand. Writes land in a sorted <b>memtable</b>; when it fills, it is flushed to an immutable <b>segment</b> on disk.</p><p>A read looks in memory first, then each segment from <b>newest to oldest</b>.</p>`,
        v: F.flow(["Put", { t: "Memtable", c: "amber" }, { t: "Segment on disk", c: "blue" }]),
        c: { q: "Where does a read look first?", o: ["In the memtable, then the newest segment", "In the oldest segment, then the newest", "In every segment at the same time"], a: 0, why: "The newest data is most likely to be current, so the search goes newest to oldest and stops at the first match." } },
      { t: "Why a log file too?", b: `<p>Memory is fast but <b>vanishes</b> on a crash. So every write is also appended to a <b>write-ahead log</b> on disk. After a restart, the engine replays the log to rebuild the memtable.</p>`,
        v: F.compare({ title: "Log on", c: "teal", body: "crash, restart, replay: nothing lost" }, { title: "Log off", c: "rose", body: "crash: every unsaved write is gone" }),
        c: { q: "Once a memtable has been flushed to a segment, what happens to its log records?", o: ["They are no longer needed and can be discarded", "They must be kept forever", "They are copied into every later segment"], a: 0, why: "The data is now safely in a segment on disk, so replaying those records would add nothing." } },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
