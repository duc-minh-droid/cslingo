/* Algorithms, Phase 2 workshops: Dijkstra first by hand (no code), then in code.
   2.W "Be Dijkstra" (no-code)  ·  2.C "Code Dijkstra" (code lab). Every number comes from the real algorithm. */
(function () {
  const N = NIC, { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig, L = N.LESSONS;
  const reg = (m) => N.register({ subject: "algo", lecture: 2, workshop: true, ...m });
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const INF = "∞";

  // The map used in the no-code workshop and the first code test. Shortest A→F is 13 (A C B D E F).
  const MAP = {
    nodes: { A: [50, 150], B: [170, 52], C: [170, 248], D: [330, 82], E: [330, 238], F: [470, 150] },
    edges: [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2], ["D", "F", 6], ["E", "F", 3]],
  };

  /** The graph drawing shared by both workshops. */
  function graphView(stage, g) {
    const pos = g.nodes, names = Object.keys(pos);
    const W = 520, H = 300;
    stage.innerHTML = `<svg class="dj-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="A weighted graph">
      ${g.edges.map(([a, b, w], i) => `<line class="dj-e" data-e="${i}" x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}"/>`).join("")}
      ${g.edges.map(([a, b, w]) => { const x = (pos[a][0] + pos[b][0]) / 2, y = (pos[a][1] + pos[b][1]) / 2; return `<g class="dj-w"><rect x="${x - 13}" y="${y - 11}" width="26" height="22" rx="8"/><text x="${x}" y="${y}">${w}</text></g>`; }).join("")}
      ${names.map((n) => `<g class="dj-n" data-n="${n}" tabindex="0" role="button" aria-label="Node ${n}"><circle cx="${pos[n][0]}" cy="${pos[n][1]}" r="24"/><text class="dj-nm" x="${pos[n][0]}" y="${pos[n][1] - 1}">${n}</text><text class="dj-d" x="${pos[n][0]}" y="${pos[n][1] + 40}">${INF}</text></g>`).join("")}
      <g class="dj-top"></g></svg>`;
    const svg = qs("svg", stage), node = (n) => qs(`[data-n="${n}"]`, svg), edgeIdx = (a, b) => g.edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
    const view = {
      svg, node,
      /** Paint the state: dist map, settled set, the node being settled, and the tree edges. */
      set({ dist, settled, cur, prev = {}, flash }) {
        names.forEach((n) => {
          const d = dist[n], nd = node(n), fin = d !== Infinity && d !== undefined;
          nd.classList.toggle("done", settled.has(n)); nd.classList.toggle("front", fin && !settled.has(n)); nd.classList.toggle("cur", n === cur);
          const t = qs(".dj-d", nd), txt = fin ? String(d) : INF;
          if (t.textContent !== txt) { t.textContent = txt; if (flash === n && fxOn()) N.fx.bump(t, { scale: 1.5 }); }
        });
        qsa(".dj-e", svg).forEach((e) => e.classList.remove("tree"));
        Object.entries(prev).forEach(([v, u]) => { if (u && settled.has(v) || (u && dist[v] !== Infinity)) { const i = edgeIdx(u, v); if (i >= 0) qs(`[data-e="${i}"]`, svg).classList.add("tree"); } });
      },
      /** A packet of light runs u → v along the road, then the road rests. */
      async look(u, v, tone) {
        const i = edgeIdx(u, v), e = qs(`[data-e="${i}"]`, svg); if (!e) return;
        e.classList.add("on");
        if (fxOn()) {
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"); dot.setAttribute("r", 7); dot.setAttribute("class", "dj-pkt"); dot.setAttribute("cx", pos[u][0]); dot.setAttribute("cy", pos[u][1]);
          qs(".dj-top", svg).appendChild(dot);
          const a = dot.animate([{ transform: "translate(0px,0px) scale(.6)", opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translate(${pos[v][0] - pos[u][0]}px,${pos[v][1] - pos[u][1]}px) scale(1)`, opacity: 1 }], { duration: 420, easing: "ease-in-out", fill: "forwards" });
          await a.finished.catch(() => {}); dot.remove();
        }
        e.classList.remove("on");
        if (tone) { e.classList.add(tone); setTimeout(() => e.classList.remove(tone), 500); }
      },
      route(path) {
        qsa(".dj-e", svg).forEach((x) => x.classList.remove("route"));
        path.slice(1).forEach((v, k) => { const i = edgeIdx(path[k], v); if (i >= 0) { const l = qs(`[data-e="${i}"]`, svg); l.classList.add("route"); if (fxOn()) l.animate([{ strokeDashoffset: 160, strokeDasharray: 160 }, { strokeDashoffset: 0, strokeDasharray: 160 }], { duration: 420, delay: k * 260, easing: "ease-out", fill: "backwards" }); } });
      },
      clearRoute() { qsa(".dj-e", svg).forEach((x) => x.classList.remove("route")); },
    };
    return view;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, fxOn() ? ms : 0));

  /* =====================================================================
     2.W  BE DIJKSTRA: no code
     ===================================================================== */
  function beDijkstra(stage, api, life) {
    const nodes = Object.keys(MAP.nodes), start = "A";
    const fresh = () => ({ dist: Object.fromEntries(nodes.map((n) => [n, n === start ? 0 : Infinity])), prev: {}, settled: new Set(), order: [] });
    let st = fresh(), hist = [], busy = false, streak = 0, best = 0, hinted = null, auto = false;
    const clone = (s) => ({ dist: { ...s.dist }, prev: { ...s.prev }, settled: new Set(s.settled), order: s.order.slice() });
    const nextNode = (s) => nodes.filter((n) => !s.settled.has(n) && s.dist[n] !== Infinity).sort((a, b) => s.dist[a] - s.dist[b] || (a < b ? -1 : 1))[0] || null;
    const nbrs = (u) => MAP.edges.flatMap(([a, b, w]) => (a === u ? [[b, w]] : b === u ? [[a, w]] : []));

    const left = el(`<div class="wk-card"><h3>The map<span class="wk-sp"></span><span class="wk-badge" data-stat>Start at A</span></h3><div data-g></div>
      <div class="dj-legend"><span><i class="lg unseen"></i>not reached</span><span><i class="lg front"></i>reached, not settled</span><span><i class="lg cur"></i>settling now</span><span><i class="lg done"></i>settled (final)</span></div></div>`);
    const right = el(`<div class="wk-card"><h3>Notebook<span class="wk-sp"></span><span class="faint" data-n style="text-transform:none;letter-spacing:0"></span></h3>
      <table class="dj-tbl" data-tbl></table>
      <div class="dj-q"><b>Waiting room</b> <span class="faint">reached but not settled</span><div class="dj-chips" data-q></div></div></div>`);
    const row = el(`<div class="cl-layout"></div>`); row.append(left, right);
    const ctl = el(`<div class="wk-card"><h3>Your move</h3><div class="wk-row"><button class="btn" data-undo>Undo</button><button class="btn" data-hint>Hint</button><button class="btn" data-step>Step for me</button><button class="btn primary" data-auto>Watch it all</button><button class="btn ghost small" data-rs>Reset</button></div>
      <div class="wk-note" data-note style="margin-top:10px">Tap the node you would settle next: the reached one with the <b>smallest</b> distance.</div></div>`);
    stage.append(row, ctl);
    const view = graphView(qs("[data-g]", left), MAP), note = qs("[data-note]", ctl), tbl = qs("[data-tbl]", right), qEl = qs("[data-q]", right);
    const say = (h) => { note.innerHTML = h; };

    function draw(cur, flash) {
      view.set({ dist: st.dist, settled: st.settled, cur, prev: st.prev, flash });
      const nx = nextNode(st);
      tbl.innerHTML = `<tr><th>Node</th><th>Distance</th><th>Came from</th><th></th></tr>` + nodes.map((n) => `<tr data-r="${n}" class="${st.settled.has(n) ? "done" : st.dist[n] !== Infinity ? "front" : ""} ${n === cur ? "cur" : ""}"><td><b>${n}</b></td><td>${st.dist[n] === Infinity ? INF : st.dist[n]}</td><td>${st.prev[n] || "-"}</td><td>${st.settled.has(n) ? "settled" : ""}</td></tr>`).join("");
      const wait_ = nodes.filter((n) => !st.settled.has(n) && st.dist[n] !== Infinity).sort((a, b) => st.dist[a] - st.dist[b] || (a < b ? -1 : 1));
      qEl.innerHTML = wait_.length ? wait_.map((n) => `<span class="dj-chip ${hinted === n ? "hint" : ""}" data-pick="${n}">${n}<i>${st.dist[n]}</i></span>`).join("") : `<span class="faint">${st.settled.size === nodes.length ? "Empty: every node is settled." : "Empty"}</span>`;
      qsa("[data-pick]", qEl).forEach((c) => (c.onclick = () => pick(c.dataset.pick, true)));
      qs("[data-n]", right).textContent = `${st.settled.size} of ${nodes.length} settled`;
      const b = qs("[data-stat]", left); b.textContent = st.settled.size === nodes.length ? "All settled" : nx ? `${st.settled.size} settled` : "Start at A"; b.className = `wk-badge${st.settled.size === nodes.length ? "" : " slow"}`;
      qs("[data-undo]", ctl).disabled = !hist.length || busy; qs("[data-step]", ctl).disabled = busy || !nextNode(st); qs("[data-hint]", ctl).disabled = busy || !nextNode(st);
      qs("[data-auto]", ctl).disabled = busy || !nextNode(st);
    }

    /** Settle u: show each road being looked at, and update neighbours if the new route is shorter. */
    async function settle(u) {
      busy = true; hist.push(clone(st)); hinted = null;
      st.settled.add(u); st.order.push(u); draw(u); snd("step");
      const evs = [];
      for (const [v, w] of nbrs(u)) {
        if (st.settled.has(v)) { evs.push({ v, w, skip: true }); continue; }
        const cand = st.dist[u] + w, old = st.dist[v], imp = cand < old;
        evs.push({ v, w, cand, old, imp });
      }
      const lines = [];
      for (const e of evs) {
        if (e.skip) { await view.look(u, e.v); lines.push(`<b>${e.v}</b> is already settled, skip.`); continue; }
        await view.look(u, e.v, e.imp ? "good" : "meh");
        if (e.imp) {
          st.dist[e.v] = e.cand; st.prev[e.v] = u; draw(u, e.v); snd("pop");
          lines.push(`<b>${e.v}</b>: ${st.dist[u]} + ${e.w} = <b>${e.cand}</b> ${e.old === Infinity ? "(first way in)" : `beats ${e.old}: <b>shortcut!</b>`}`);
          if (e.old !== Infinity) api.done("shortcut");
        } else lines.push(`<b>${e.v}</b>: ${st.dist[u]} + ${e.w} = ${e.cand}, not better than ${e.old}.`);
        await wait(120);
      }
      draw(u);
      say(`Settled <b>${u}</b> at ${st.dist[u]}. ${lines.join(" · ")}`);
      api.done("first");
      busy = false; draw();
      if (st.settled.size === nodes.length) { api.say("Everything is settled. Now tap any node to see its <b>best route</b> from A.", "love"); say(`All settled. Tap a node to trace its best route back to <b>A</b> by following <i>came from</i>.`); }
    }

    function pick(n, byLearner) {
      if (busy) return;
      if (st.settled.size === nodes.length) return route(n);
      if (st.settled.has(n)) { say(`<b>${n}</b> is already settled: its distance is final.`); api.say("That one's done. Pick from the waiting room.", "think"); return; }
      if (st.dist[n] === Infinity) { say(`<b>${n}</b> hasn't been reached yet, so it has no distance to compare. Only reached nodes can be settled.`); api.say("You can only settle a node you've reached.", "think"); shake(n); return; }
      const nx = nextNode(st);
      if (n !== nx) {
        streak = 0; snd("wrong"); shake(n);
        say(`Not yet: <b>${n}</b> is ${st.dist[n]} away, but <b>${nx}</b> is only ${st.dist[nx]}. A longer detour might make ${n} cheaper later, but nothing can beat the smallest, so <b>${nx}</b> is final first.`);
        api.say(`Smallest wins: <b>${nx}</b> (${st.dist[nx]}) comes before <b>${n}</b> (${st.dist[n]}).`, "sad");
        return;
      }
      if (byLearner) { streak++; best = Math.max(best, streak); if (streak >= 5) api.done("streak"); }
      settle(n);
    }
    const shake = (n) => { const g = view.node(n); g && fxOn() && N.fx.shake(g); };

    async function route(n) {
      const path = []; for (let c = n; c; c = st.prev[c]) path.unshift(c);
      view.route(path); snd("tick");
      qsa("[data-r]", right).forEach((r) => r.classList.toggle("route", path.includes(r.dataset.r)));
      say(`Best route to <b>${n}</b>: <b>${path.join(" → ")}</b>, total <b>${st.dist[n]}</b>. Each step was recorded in <i>came from</i>.`);
      if (n === "F") { api.say(`A to F costs ${st.dist.F}. Notice it isn't the roads that <i>look</i> shortest from A.`, "love"); }
      if (path.length > 2) api.done("route");
    }

    qs("[data-undo]", ctl).onclick = () => { if (busy || !hist.length) return; st = hist.pop(); streak = 0; view.clearRoute(); hinted = null; say("Undone. Try that move again."); draw(); snd("back"); };
    qs("[data-hint]", ctl).onclick = () => { const nx = nextNode(st); if (!nx || busy) return; hinted = nx; streak = 0; draw(); say(`Hint: look at the waiting room. The smallest distance there is <b>${nx}</b> (${st.dist[nx]}).`); };
    qs("[data-step]", ctl).onclick = () => { const nx = nextNode(st); if (nx && !busy) settle(nx); };
    qs("[data-auto]", ctl).onclick = async () => { if (busy) return; while (nextNode(st) && qs("[data-auto]", ctl).isConnected) { await settle(nextNode(st)); await wait(260); } };
    qs("[data-rs]", ctl).onclick = () => { if (busy) return; st = fresh(); hist = []; streak = 0; hinted = null; view.clearRoute(); say("Fresh map. Tap A to begin."); draw(); };
    qsa("[data-n]", left).forEach((g) => { g.onclick = () => pick(g.dataset.n, true); g.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(g.dataset.n, true); } }; });
    draw();
  }

  reg({
    id: "a2-watch", order: 90, num: "2.W", title: "Workshop: be Dijkstra",
    blurb: "No code. Settle nodes yourself, watch roads get checked, and trace the best route.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro: "You are the algorithm. The map shows roads and their lengths. Tap <b>A</b> to begin: its distance is 0.",
        missions: [
          { id: "first", t: "Settle your first node", d: "Tap <b>A</b> and watch every road out of it get checked.", hint: "A starts at distance 0, so it is the only node you can settle." },
          { id: "shortcut", t: "Catch a shortcut", d: "Keep going until a road gives a node a <b>shorter</b> distance than it had.", hint: "Settle C (2). Its road to B is only 1, so B drops from 4 to 3." },
          { id: "streak", t: "Five right in a row", d: "Settle five nodes with no wrong pick and no hints.", hint: "Always look at the waiting room and take the smallest distance. The Hint button breaks your streak." },
          { id: "route", t: "Trace a route", d: "After every node is settled, tap a node to see its best route back to A.", hint: "Tap F. The route comes from following each node's came-from entry backwards." },
        ],
        build: (stage, api) => beDijkstra(stage, api, life),
      });
      root.appendChild(predict({ id: "a2-watch-1", q: "A node in the waiting room has distance 6 and another has 9. Why settle the 6 first?", opts: ["Every other route would have to pass through something at least 6 away", "Smaller numbers are always closer to the goal", "Nodes are settled in alphabetical order"], a: 0,
        why: "All remaining routes leave the settled set through a node that is already at least 6 away, and road lengths are never negative, so nothing can beat 6. That is why it is final." }));
      root.appendChild(predict({ id: "a2-watch-2", q: "You settle a node and one road gives a neighbour 3 instead of its old 4. What is that called?", opts: ["Relaxing the edge", "Settling the node", "Breaking the tie"], a: 0,
        why: "Relaxing an edge means checking whether going through the node you just settled is shorter, and updating the neighbour's distance (and came-from) if so." }));
      root.appendChild(takeaways([
        "Keep a <b>distance</b> for every node (∞ until reached) and a waiting room of reached-but-unsettled nodes.",
        "Always settle the node with the <b>smallest distance</b>. That distance is final, because roads are never negative.",
        "After settling, <b>relax</b> each road: if going through this node is shorter, update the neighbour and remember where it came from.",
        "Follow <b>came from</b> backwards to rebuild the best route.",
      ], "Settle the closest unsettled node, then check every road out of it for a shortcut."));
    },
  });
  L["a2-watch"] = {
    sum: "Run Dijkstra by hand: pick the smallest, relax the roads, trace the route.",
    steps: [
      { t: "What you will practise", b: `<p>You'll run <b>Dijkstra</b> yourself, with no code. Each node has a <b>distance</b> from the start (∞ until reached).</p><p>The rule is one line: <span class="key">settle the reached node with the smallest distance, then check its roads for shortcuts.</span></p>`,
        v: F.flow([{ t: "Pick smallest", c: "blue" }, { t: "Settle it", c: "teal" }, { t: "Relax its roads", c: "amber" }]),
        c: { q: "Which node do you settle first on a fresh map?", o: ["The start node, at distance 0", "The node with the shortest road", "The goal node"], a: 0, why: "Only the start has a distance at first (0), and 0 is the smallest, so it is settled first." } },
      { t: "Relaxing a road", b: `<p>After settling <b>u</b>, look at each road <b>u – v</b> of length <b>w</b>. The new candidate for <b>v</b> is <span class="key">dist[u] + w</span>. If it is smaller than v's current distance, update v and remember it came from u.</p>`,
        v: F.compare({ title: "Candidate is smaller", c: "teal", body: "update the distance, set came-from = u" }, { title: "Candidate is not smaller", c: "dim", body: "leave it alone" }),
        c: { q: "B has distance 4. You settle C (2) and the road C–B is 1. What happens to B?", o: ["It becomes 3, because 2 + 1 beats 4", "It stays 4, because it was reached first", "It becomes 1, the length of the road"], a: 0, why: "The candidate is dist[C] + 1 = 3, which is smaller than 4, so B is updated." } },
    ],
    guide: ["Work through the four missions in the workshop."],
  };

  /* =====================================================================
     2.C  CODE DIJKSTRA
     ===================================================================== */
  const adj = (g) => { const a = {}; Object.keys(g.nodes).forEach((n) => (a[n] = [])); g.edges.forEach(([x, y, w]) => { a[x].push([y, w]); a[y].push([x, w]); }); return a; };
  const G2 = { nodes: { S: [60, 150], X: [260, 70], Y: [160, 240], Z: [440, 160] }, edges: [["S", "X", 7], ["S", "Y", 2], ["Y", "X", 3], ["X", "Z", 1]] };
  const G3 = { nodes: { A: [110, 150], B: [260, 150], C: [420, 150] }, edges: [["A", "B", 1]] };

  const STARTER = `function dijkstra(graph, start) {
  const dist = {};
  const done = new Set();
  for (const v in graph) dist[v] = Infinity;
  dist[start] = 0;

  while (true) {
    // 1. Pick the unsettled node with the smallest distance.
    let u = null;
    for (const v in graph) {
      /* YOUR CODE: if v is not done, is reachable, and is closer than u, let u = v */
    }
    if (u === null) break;            // nothing left to settle
    done.add(u);
    trace({ type: "settle", u, dist: { ...dist } });

    // 2. Relax every road out of u.
    for (const [v, w] of graph[u]) {
      const cand = dist[u] + w;
      trace({ type: "look", u, v, cand, cur: dist[v] });
      /* YOUR CODE: if cand is smaller than dist[v], update dist[v] */
    }
  }
  return dist;
}`;
  const SOLUTION = `function dijkstra(graph, start) {
  const dist = {};
  const done = new Set();
  for (const v in graph) dist[v] = Infinity;
  dist[start] = 0;

  while (true) {
    // 1. Pick the unsettled node with the smallest distance.
    let u = null;
    for (const v in graph) {
      if (!done.has(v) && dist[v] < Infinity && (u === null || dist[v] < dist[u])) u = v;
    }
    if (u === null) break;            // nothing left to settle
    done.add(u);
    trace({ type: "settle", u, dist: { ...dist } });

    // 2. Relax every road out of u.
    for (const [v, w] of graph[u]) {
      const cand = dist[u] + w;
      trace({ type: "look", u, v, cand, cur: dist[v] });
      if (cand < dist[v]) dist[v] = cand;
    }
  }
  return dist;
}`;

  function codeScene() {
    return {
      build(stage, test) {
        stage.innerHTML = `<div class="cl-layout"><div data-g></div><table class="dj-tbl" data-t></table></div>`;
        const view = graphView(qs("[data-g]", stage), test.view), nodes = Object.keys(test.view.nodes), tbl = qs("[data-t]", stage);
        const h = { view, nodes, tbl, start: test.args[1] };
        this.reset(h, test); return h;
      },
      reset(h) {
        const dist = Object.fromEntries(h.nodes.map((n) => [n, n === h.start ? 0 : Infinity]));
        h.view.set({ dist, settled: new Set(), cur: null }); h.view.clearRoute(); draw(h, dist, new Set(), null, null);
      },
      async frame(h, f, { i, frames, animate }) {
        if (!f) return this.reset(h);
        // rebuild the picture from the start of the trace, so stepping back and scrubbing are exact
        let dist = Object.fromEntries(h.nodes.map((n) => [n, n === h.start ? 0 : Infinity])), settled = new Set(), cur = null, look = null;
        for (let k = 0; k <= i; k++) {
          const x = frames[k];
          if (x.type === "settle") { dist = { ...dist, ...x.dist }; settled.add(x.u); cur = x.u; look = null; }
          else if (x.type === "look") { look = x; if (x.cand < (dist[x.v] === undefined ? Infinity : dist[x.v])) dist = { ...dist, [x.v]: x.cand }; }
        }
        h.view.set({ dist, settled, cur, flash: look && f === look ? look.v : null });
        draw(h, dist, settled, cur, look);
        if (animate && f.type === "look") h.view.look(f.u, f.v, f.cand < f.cur ? "good" : "meh");
      },
      caption(f) {
        if (!f) return "";
        if (f.type === "settle") return `Settle <b>${f.u}</b>: the smallest unsettled distance is <b>${f.dist[f.u]}</b>.`;
        if (f.type === "look") return `Road ${f.u} – ${f.v}: candidate ${f.cand} vs current ${f.cur === Infinity ? INF : f.cur}. ${f.cand < f.cur ? `<b>Better</b>, so ${f.v} should update.` : "Not better."}`;
        return "";
      },
    };
    function draw(h, dist, settled, cur, look) {
      h.tbl.innerHTML = `<tr><th>Node</th><th>Distance</th><th></th></tr>` + h.nodes.map((n) => `<tr class="${settled.has(n) ? "done" : dist[n] !== Infinity ? "front" : ""} ${n === cur ? "cur" : ""} ${look && look.v === n ? "look" : ""}"><td><b>${n}</b></td><td>${dist[n] === Infinity ? INF : dist[n]}</td><td>${settled.has(n) ? "settled" : ""}</td></tr>`).join("");
    }
  }

  reg({
    id: "a2-code", order: 91, num: "2.C", title: "Workshop: code Dijkstra",
    blurb: "Fill in two short blanks, run the tests and watch your own code settle the map.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "byte", noun: "Dijkstra", entry: "dijkstra", watch: true,
        intro: "You've done it by hand. Now teach the computer. There are <b>two blanks</b>, marked in orange. Everything else is written for you.",
        brief: "<b>Goal:</b> return an object of shortest distances from <code>start</code>. <code>graph</code> maps each node to a list of <code>[neighbour, length]</code> pairs. Unreachable nodes stay <code>Infinity</code>. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.",
        starter: STARTER, solution: SOLUTION,
        hints: ["Blank 1 is the same decision you made by hand: among nodes that are <b>not done</b> and <b>already reached</b> (<code>dist[v] &lt; Infinity</code>), which has the smallest distance? Keep the best so far in <code>u</code>.", "The first candidate has nothing to compare with, so test <code>u === null</code> before <code>dist[v] &lt; dist[u]</code>.", "Blank 2 is the relax step: <code>if (cand &lt; dist[v]) dist[v] = cand;</code>"],
        tests: [
          { name: "The map from the workshop", desc: "Six nodes, nine roads, from A.", args: [adj(MAP), "A"], expect: { A: 0, B: 3, C: 2, D: 8, E: 10, F: 13 }, view: MAP },
          { name: "A side road is shorter", desc: "S to X: direct is 7, via Y is 5.", args: [adj(G2), "S"], expect: { S: 0, X: 5, Y: 2, Z: 6 }, view: G2, hint: "If this one fails but the map passes, check you update <code>dist[v]</code> whenever the new candidate is smaller." },
          { name: "An island", desc: "C has no roads. It should stay at Infinity.", args: [adj(G3), "A"], expect: { A: 0, B: 1, C: Infinity }, view: G3, hint: "Only pick nodes that have been reached, otherwise you'd 'settle' C at Infinity." },
        ],
        scene: codeScene(),
      });
      root.appendChild(predict({ id: "a2-code-1", q: "In your code, why check <code>dist[v] &lt; Infinity</code> before picking v as the next node?", opts: ["An unreached node has no known route, so it can't be settled yet", "Infinity is slower to compare than a number", "It stops the loop from visiting the start twice"], a: 0,
        why: "A node at Infinity hasn't been reached by any settled node. Picking it would 'settle' something with no route, and relaxing from it would give nonsense (Infinity + w)." }));
      root.appendChild(predict({ id: "a2-code-2", q: "A graph has 1,000 nodes. Your code scans every node to find the smallest each round. Roughly how many scans happen in total?", opts: ["About a million: 1,000 rounds of 1,000 checks", "About 1,000: one scan in total", "About ten thousand"], a: 0,
        why: "Each of the 1,000 rounds scans all 1,000 nodes, which is about 1,000 × 1,000 = 1,000,000 checks. A priority queue (heap) is how real implementations avoid the full scan." }));
      root.appendChild(takeaways([
        "Dijkstra in code is two loops: <b>pick the smallest unsettled</b>, then <b>relax its edges</b>.",
        "<code>Infinity</code> is a handy 'not reached yet' value, but never settle a node that is still at it.",
        "Scanning all nodes each round costs about n² checks; a <b>priority queue</b> is the standard speed-up.",
      ], "Pick the closest unsettled node, then improve its neighbours: repeat until nothing is left."));
    },
  });
  L["a2-code"] = {
    sum: "Write the two decisions at the heart of Dijkstra and watch your code run.",
    steps: [
      { t: "What you will write", b: `<p>The code lab gives you a working skeleton with <b>two blanks</b>. You'll fill them with exactly what you did by hand:</p><ol><li>pick the unsettled node with the smallest distance</li><li>relax each road out of it</li></ol><p>Then run the tests and watch your code settle the map, one step at a time.</p>`,
        v: F.flow([{ t: "Blank 1: pick", c: "amber" }, { t: "Settle", c: "teal" }, { t: "Blank 2: relax", c: "amber" }]),
        c: { q: "Which part of Dijkstra is 'relaxing'?", o: ["Updating a neighbour if the route through this node is shorter", "Choosing the next node to settle", "Returning the final distances"], a: 0, why: "Relaxing an edge means testing dist[u] + w against dist[v] and improving it if we can." } },
      { t: "Reading the picture", b: `<p>Under your code, the map replays <b>your run</b> step by step: a pulse along a road is one candidate being checked, and the notebook shows the distances your code holds at that moment.</p><p>If a test fails, pick it in the list and step through: the first wrong number shows where the code went astray.</p>`,
        v: F.compare({ title: "Your code's trace", c: "blue", body: "every settle and every road checked is recorded" }, { title: "The replay", c: "teal", body: "play, step or scrub to find the exact step that went wrong" }),
        c: { q: "A test fails. What is the most useful next move?", o: ["Step through its replay and find the first wrong distance", "Run the tests again without changing anything", "Load the solution straight away"], a: 0, why: "Stepping through shows exactly where your code's distances first differ from what you expect, which points at the faulty line." } },
    ],
    guide: ["Fill the two blanks and pass the tests in the code lab."],
  };
})();
