/* Algorithms, Phase 2 workshops: Dijkstra first by hand (no code), then in code.
   2.W "Be Dijkstra" (no-code)  ·  2.C "Code Dijkstra" (code lab). Every number comes from the real algorithm. */
(function () {
  const partScope = (NIC.shared.algoWorkshops2 = NIC.shared.algoWorkshops2 || {});

  const N = NIC,
    { el, qs, qsa } = N;

  const reg = (m) => N.register({ subject: "algo", lecture: 2, workshop: true, ...m });
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const INF = "∞";

  // The map used in the no-code workshop and the first code test. Shortest A→F is 13 (A C B D E F).
  const MAP = {
    nodes: { A: [50, 150], B: [170, 52], C: [170, 248], D: [330, 82], E: [330, 238], F: [470, 150] },
    edges: [
      ["A", "B", 4],
      ["A", "C", 2],
      ["B", "C", 1],
      ["B", "D", 5],
      ["C", "D", 8],
      ["C", "E", 10],
      ["D", "E", 2],
      ["D", "F", 6],
      ["E", "F", 3],
    ],
  };

  /** The graph drawing shared by both workshops. */
  function graphView(stage, g) {
    const pos = g.nodes,
      names = Object.keys(pos);
    const W = 520,
      H = 300;
    stage.innerHTML = `<svg class="dj-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="A weighted graph">
      ${g.edges.map(([a, b, w], i) => `<line class="dj-e" data-e="${i}" x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}"/>`).join("")}
      ${g.edges
        .map(([a, b, w]) => {
          const x = (pos[a][0] + pos[b][0]) / 2,
            y = (pos[a][1] + pos[b][1]) / 2;
          return `<g class="dj-w"><rect x="${x - 13}" y="${y - 11}" width="26" height="22" rx="8"/><text x="${x}" y="${y}">${w}</text></g>`;
        })
        .join("")}
      ${names.map((n) => `<g class="dj-n" data-n="${n}" tabindex="0" role="button" aria-label="Node ${n}"><circle cx="${pos[n][0]}" cy="${pos[n][1]}" r="24"/><text class="dj-nm" x="${pos[n][0]}" y="${pos[n][1] - 1}">${n}</text><text class="dj-d" x="${pos[n][0]}" y="${pos[n][1] + 40}">${INF}</text></g>`).join("")}
      <g class="dj-top"></g></svg>`;
    const svg = qs("svg", stage),
      node = (n) => qs(`[data-n="${n}"]`, svg),
      edgeIdx = (a, b) => g.edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
    const view = {
      svg,
      node,
      /** Paint the state: dist map, settled set, the node being settled, and the tree edges. */
      set({ dist, settled, cur, prev = {}, flash }) {
        names.forEach((n) => {
          const d = dist[n],
            nd = node(n),
            fin = d !== Infinity && d !== undefined;
          nd.classList.toggle("done", settled.has(n));
          nd.classList.toggle("front", fin && !settled.has(n));
          nd.classList.toggle("cur", n === cur);
          const t = qs(".dj-d", nd),
            txt = fin ? String(d) : INF;
          if (t.textContent !== txt) {
            t.textContent = txt;
            if (flash === n && fxOn()) N.fx.bump(t, { scale: 1.5 });
          }
        });
        qsa(".dj-e", svg).forEach((e) => e.classList.remove("tree"));
        Object.entries(prev).forEach(([v, u]) => {
          if ((u && settled.has(v)) || (u && dist[v] !== Infinity)) {
            const i = edgeIdx(u, v);
            if (i >= 0) qs(`[data-e="${i}"]`, svg).classList.add("tree");
          }
        });
      },
      /** A packet of light runs u → v along the road, then the road rests. */
      async look(u, v, tone) {
        const i = edgeIdx(u, v),
          e = qs(`[data-e="${i}"]`, svg);
        if (!e) return;
        e.classList.add("on");
        if (fxOn()) {
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("r", 7);
          dot.setAttribute("class", "dj-pkt");
          dot.setAttribute("cx", pos[u][0]);
          dot.setAttribute("cy", pos[u][1]);
          qs(".dj-top", svg).appendChild(dot);
          const a = dot.animate(
            [
              { transform: "translate(0px,0px) scale(.6)", opacity: 0 },
              { opacity: 1, offset: 0.15 },
              { transform: `translate(${pos[v][0] - pos[u][0]}px,${pos[v][1] - pos[u][1]}px) scale(1)`, opacity: 1 },
            ],
            { duration: 420, easing: "ease-in-out", fill: "forwards" },
          );
          await a.finished.catch(() => {});
          dot.remove();
        }
        e.classList.remove("on");
        if (tone) {
          e.classList.add(tone);
          setTimeout(() => e.classList.remove(tone), 500);
        }
      },
      route(path) {
        qsa(".dj-e", svg).forEach((x) => x.classList.remove("route"));
        path.slice(1).forEach((v, k) => {
          const i = edgeIdx(path[k], v);
          if (i >= 0) {
            const l = qs(`[data-e="${i}"]`, svg);
            l.classList.add("route");
            if (fxOn())
              l.animate(
                [
                  { strokeDashoffset: 160, strokeDasharray: 160 },
                  { strokeDashoffset: 0, strokeDasharray: 160 },
                ],
                { duration: 420, delay: k * 260, easing: "ease-out", fill: "backwards" },
              );
          }
        });
      },
      clearRoute() {
        qsa(".dj-e", svg).forEach((x) => x.classList.remove("route"));
      },
    };
    return view;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, fxOn() ? ms : 0));

  /* =====================================================================
     2.W  BE DIJKSTRA: no code
     ===================================================================== */
  function beDijkstra(stage, api, life) {
    const nodes = Object.keys(MAP.nodes),
      start = "A";
    const fresh = () => ({
      dist: Object.fromEntries(nodes.map((n) => [n, n === start ? 0 : Infinity])),
      prev: {},
      settled: new Set(),
      order: [],
    });
    let st = fresh(),
      hist = [],
      busy = false,
      streak = 0,
      best = 0,
      hinted = null;
    const clone = (s) => ({
      dist: { ...s.dist },
      prev: { ...s.prev },
      settled: new Set(s.settled),
      order: s.order.slice(),
    });
    const nextNode = (s) =>
      nodes
        .filter((n) => !s.settled.has(n) && s.dist[n] !== Infinity)
        .sort((a, b) => s.dist[a] - s.dist[b] || (a < b ? -1 : 1))[0] || null;
    const nbrs = (u) => MAP.edges.flatMap(([a, b, w]) => (a === u ? [[b, w]] : b === u ? [[a, w]] : []));

    const left =
      el(`<div class="wk-card"><h3>The map<span class="wk-sp"></span><span class="wk-badge" data-stat>Start at A</span></h3><div data-g></div>
      <div class="dj-legend"><span><i class="lg unseen"></i>not reached</span><span><i class="lg front"></i>reached, not settled</span><span><i class="lg cur"></i>settling now</span><span><i class="lg done"></i>settled (final)</span></div></div>`);
    const right =
      el(`<div class="wk-card"><h3>Notebook<span class="wk-sp"></span><span class="faint" data-n style="text-transform:none;letter-spacing:0"></span></h3>
      <table class="dj-tbl" data-tbl></table>
      <div class="dj-q"><b>Waiting room</b> <span class="faint">reached but not settled</span><div class="dj-chips" data-q></div></div></div>`);
    const row = el(`<div class="cl-layout"></div>`);
    row.append(left, right);
    const ctl =
      el(`<div class="wk-card"><h3>Your move</h3><div class="wk-row"><button class="btn" data-undo>Undo</button><button class="btn" data-hint>Hint</button><button class="btn" data-step>Step for me</button><button class="btn primary" data-auto>Watch it all</button><button class="btn ghost small" data-rs>Reset</button></div>
      <div class="wk-note" data-note style="margin-top:10px">Tap the node you would settle next: the reached one with the <b>smallest</b> distance.</div></div>`);
    stage.append(row, ctl);
    const view = graphView(qs("[data-g]", left), MAP),
      note = qs("[data-note]", ctl),
      tbl = qs("[data-tbl]", right),
      qEl = qs("[data-q]", right);
    const say = (h) => {
      note.innerHTML = h;
    };

    function draw(cur, flash) {
      view.set({ dist: st.dist, settled: st.settled, cur, prev: st.prev, flash });
      const nx = nextNode(st);
      tbl.innerHTML =
        `<tr><th>Node</th><th>Distance</th><th>Came from</th><th></th></tr>` +
        nodes
          .map(
            (n) =>
              `<tr data-r="${n}" class="${st.settled.has(n) ? "done" : st.dist[n] !== Infinity ? "front" : ""} ${n === cur ? "cur" : ""}"><td><b>${n}</b></td><td>${st.dist[n] === Infinity ? INF : st.dist[n]}</td><td>${st.prev[n] || "-"}</td><td>${st.settled.has(n) ? "settled" : ""}</td></tr>`,
          )
          .join("");
      const wait_ = nodes
        .filter((n) => !st.settled.has(n) && st.dist[n] !== Infinity)
        .sort((a, b) => st.dist[a] - st.dist[b] || (a < b ? -1 : 1));
      qEl.innerHTML = wait_.length
        ? wait_
            .map(
              (n) =>
                `<span class="dj-chip ${hinted === n ? "hint" : ""}" data-pick="${n}">${n}<i>${st.dist[n]}</i></span>`,
            )
            .join("")
        : `<span class="faint">${st.settled.size === nodes.length ? "Empty: every node is settled." : "Empty"}</span>`;
      qsa("[data-pick]", qEl).forEach((c) => (c.onclick = () => pick(c.dataset.pick, true)));
      qs("[data-n]", right).textContent = `${st.settled.size} of ${nodes.length} settled`;
      const b = qs("[data-stat]", left);
      b.textContent =
        st.settled.size === nodes.length ? "All settled" : nx ? `${st.settled.size} settled` : "Start at A";
      b.className = `wk-badge${st.settled.size === nodes.length ? "" : " slow"}`;
      qs("[data-undo]", ctl).disabled = !hist.length || busy;
      qs("[data-step]", ctl).disabled = busy || !nextNode(st);
      qs("[data-hint]", ctl).disabled = busy || !nextNode(st);
      qs("[data-auto]", ctl).disabled = busy || !nextNode(st);
    }

    /** Settle u: show each road being looked at, and update neighbours if the new route is shorter. */
    async function settle(u) {
      busy = true;
      hist.push(clone(st));
      hinted = null;
      st.settled.add(u);
      st.order.push(u);
      draw(u);
      snd("step");
      const evs = [];
      for (const [v, w] of nbrs(u)) {
        if (st.settled.has(v)) {
          evs.push({ v, w, skip: true });
          continue;
        }
        const cand = st.dist[u] + w,
          old = st.dist[v],
          imp = cand < old;
        evs.push({ v, w, cand, old, imp });
      }
      const lines = [];
      for (const e of evs) {
        if (e.skip) {
          await view.look(u, e.v);
          lines.push(`<b>${e.v}</b> is already settled, skip.`);
          continue;
        }
        await view.look(u, e.v, e.imp ? "good" : "meh");
        if (e.imp) {
          st.dist[e.v] = e.cand;
          st.prev[e.v] = u;
          draw(u, e.v);
          snd("pop");
          lines.push(
            `<b>${e.v}</b>: ${st.dist[u]} + ${e.w} = <b>${e.cand}</b> ${e.old === Infinity ? "(first way in)" : `beats ${e.old}: <b>shortcut!</b>`}`,
          );
          if (e.old !== Infinity) api.done("shortcut");
        } else lines.push(`<b>${e.v}</b>: ${st.dist[u]} + ${e.w} = ${e.cand}, not better than ${e.old}.`);
        await wait(120);
      }
      draw(u);
      say(`Settled <b>${u}</b> at ${st.dist[u]}. ${lines.join(" · ")}`);
      api.done("first");
      busy = false;
      draw();
      if (st.settled.size === nodes.length) {
        api.say("Everything is settled. Now tap any node to see its <b>best route</b> from A.", "love");
        say(`All settled. Tap a node to trace its best route back to <b>A</b> by following <i>came from</i>.`);
      }
    }

    function pick(n, byLearner) {
      if (busy) return;
      if (st.settled.size === nodes.length) return route(n);
      if (st.settled.has(n)) {
        say(`<b>${n}</b> is already settled: its distance is final.`);
        api.say("That one's done. Pick from the waiting room.", "think");
        return;
      }
      if (st.dist[n] === Infinity) {
        say(
          `<b>${n}</b> hasn't been reached yet, so it has no distance to compare. Only reached nodes can be settled.`,
        );
        api.say("You can only settle a node you've reached.", "think");
        shake(n);
        return;
      }
      const nx = nextNode(st);
      if (n !== nx) {
        streak = 0;
        snd("wrong");
        shake(n);
        say(
          `Not yet: <b>${n}</b> is ${st.dist[n]} away, but <b>${nx}</b> is only ${st.dist[nx]}. A longer detour might make ${n} cheaper later, but nothing can beat the smallest, so <b>${nx}</b> is final first.`,
        );
        api.say(`Smallest wins: <b>${nx}</b> (${st.dist[nx]}) comes before <b>${n}</b> (${st.dist[n]}).`, "sad");
        return;
      }
      if (byLearner) {
        streak++;
        best = Math.max(best, streak);
        if (streak >= 5) api.done("streak");
      }
      settle(n);
    }
    const shake = (n) => {
      const g = view.node(n);
      g && fxOn() && N.fx.shake(g);
    };

    async function route(n) {
      const path = [];
      for (let c = n; c; c = st.prev[c]) path.unshift(c);
      view.route(path);
      snd("tick");
      qsa("[data-r]", right).forEach((r) => r.classList.toggle("route", path.includes(r.dataset.r)));
      say(
        `Best route to <b>${n}</b>: <b>${path.join(" → ")}</b>, total <b>${st.dist[n]}</b>. Each step was recorded in <i>came from</i>.`,
      );
      if (n === "F") {
        api.say(`A to F costs ${st.dist.F}. Notice it isn't the roads that <i>look</i> shortest from A.`, "love");
      }
      if (path.length > 2) api.done("route");
    }

    qs("[data-undo]", ctl).onclick = () => {
      if (busy || !hist.length) return;
      st = hist.pop();
      streak = 0;
      view.clearRoute();
      hinted = null;
      say("Undone. Try that move again.");
      draw();
      snd("back");
    };
    qs("[data-hint]", ctl).onclick = () => {
      const nx = nextNode(st);
      if (!nx || busy) return;
      hinted = nx;
      streak = 0;
      draw();
      say(`Hint: look at the waiting room. The smallest distance there is <b>${nx}</b> (${st.dist[nx]}).`);
    };
    qs("[data-step]", ctl).onclick = () => {
      const nx = nextNode(st);
      if (nx && !busy) settle(nx);
    };
    qs("[data-auto]", ctl).onclick = async () => {
      if (busy) return;
      while (nextNode(st) && qs("[data-auto]", ctl).isConnected) {
        await settle(nextNode(st));
        await wait(260);
      }
    };
    qs("[data-rs]", ctl).onclick = () => {
      if (busy) return;
      st = fresh();
      hist = [];
      streak = 0;
      hinted = null;
      view.clearRoute();
      say("Fresh map. Tap A to begin.");
      draw();
    };
    qsa("[data-n]", left).forEach((g) => {
      g.onclick = () => pick(g.dataset.n, true);
      g.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick(g.dataset.n, true);
        }
      };
    });
    draw();
  }
  Object.assign(partScope, { MAP, beDijkstra, graphView, reg });
})();
