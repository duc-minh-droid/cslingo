/* Algorithms, Phase 4 workshop: build a minimum spanning tree by hand (no code).
   4.W "Build the cheapest network". Three modes share one map: Kruskal with a coach, a cut finder, and a free build
   that lets you overspend. Every total, loop and swap below comes from running the real algorithms on the map. */
(function () {
  const N = NIC,
    { qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const NS = "http://www.w3.org/2000/svg";

  // Seven towns and eleven possible cables (cost = weight). All weights differ, so the cheapest network is unique.
  const POS = { A: [50, 150], B: [150, 52], C: [150, 248], D: [285, 150], E: [405, 52], F: [405, 248], G: [480, 150] };
  const EDGES = [
    ["A", "B", 7],
    ["A", "C", 4],
    ["B", "C", 9],
    ["B", "D", 5],
    ["C", "D", 8],
    ["C", "F", 10],
    ["D", "E", 3],
    ["D", "F", 2],
    ["E", "F", 11],
    ["E", "G", 6],
    ["F", "G", 12],
  ];
  const NODES = Object.keys(POS),
    NEED = NODES.length - 1;
  const nm = (i) => EDGES[i][0] + "–" + EDGES[i][1];
  const W = (i) => EDGES[i][2];
  const cost = (t) => t.reduce((s, i) => s + W(i), 0);
  const sortedIdx = EDGES.map((_, i) => i).sort((a, b) => W(a) - W(b));

  /** Edge indices of the route from a to b inside a forest, or null if they are not connected. */
  function pathIn(tree, a, b) {
    const adj = {};
    NODES.forEach((n) => (adj[n] = []));
    tree.forEach((i) => {
      const [x, y] = EDGES[i];
      adj[x].push([y, i]);
      adj[y].push([x, i]);
    });
    const prev = { [a]: null },
      q = [a];
    while (q.length) {
      const u = q.shift();
      if (u === b) break;
      for (const [v, i] of adj[u])
        if (!(v in prev)) {
          prev[v] = [u, i];
          q.push(v);
        }
    }
    if (!(b in prev)) return null;
    const out = [];
    let c = b;
    while (prev[c]) {
      out.unshift(prev[c][1]);
      c = prev[c][0];
    }
    return out;
  }
  /** The towns along a path of edges starting at `from`. */
  function pathNodes(path, from) {
    const out = [from];
    let c = from;
    path.forEach((i) => {
      c = EDGES[i][0] === c ? EDGES[i][1] : EDGES[i][0];
      out.push(c);
    });
    return out;
  }
  function groupsOf(tree) {
    const p = Object.fromEntries(NODES.map((n) => [n, n]));
    const f = (x) => (p[x] === x ? x : (p[x] = f(p[x])));
    tree.forEach((i) => (p[f(EDGES[i][0])] = f(EDGES[i][1])));
    const by = {};
    NODES.forEach((n) => (by[f(n)] = (by[f(n)] || []).concat(n)));
    return Object.values(by).sort((a, b) => NODES.indexOf(a[0]) - NODES.indexOf(b[0]));
  }

  // The real algorithms: Kruskal for the answer, plus Prim as a cross-check of the total.
  function kruskal() {
    const p = Object.fromEntries(NODES.map((n) => [n, n]));
    const f = (x) => (p[x] === x ? x : (p[x] = f(p[x])));
    const t = [];
    sortedIdx.forEach((i) => {
      const [a, b] = EDGES[i];
      if (f(a) !== f(b)) {
        p[f(a)] = f(b);
        t.push(i);
      }
    });
    return t;
  }
  function primCost() {
    const inT = new Set(["A"]);
    let c = 0;
    while (inT.size < NODES.length) {
      const i = sortedIdx.find((j) => inT.has(EDGES[j][0]) !== inT.has(EDGES[j][1]));
      c += W(i);
      inT.add(inT.has(EDGES[i][0]) ? EDGES[i][1] : EDGES[i][0]);
    }
    return c;
  }
  const MST = kruskal(),
    MSTCOST = cost(MST);
  if (primCost() !== MSTCOST) console.error("aw4: Prim and Kruskal disagree");

  const wait = (ms) => new Promise((r) => setTimeout(r, fxOn() ? ms : Math.min(ms, 650)));
  const COLS = ["blue", "violet", "amber", "teal"];

  function buildIt(stage, api) {
    let mode = "kruskal",
      busy = false,
      noteHtml = "";
    const K = { tree: [], rej: [] };
    const Fr = { tree: [], over: false };
    const C = { S: new Set(), safe: [], cuts: new Set() };

    stage.innerHTML = `<div class="aw4-tabs" role="tablist">
        <button class="btn aw4-tab" data-mode="kruskal" role="tab">1 · Kruskal with a coach</button>
        <button class="btn aw4-tab" data-mode="cut" role="tab">2 · Cut finder</button>
        <button class="btn aw4-tab" data-mode="free" role="tab">3 · Free build</button></div>
      <div class="aw4-layout">
        <div class="wk-card"><h3>The network<span class="wk-sp"></span><span class="wk-badge" data-badge>0 cables</span></h3><div data-svg></div>
          <div class="aw4-legend"><span><i class="lg tree"></i>cable laid</span><span><i class="lg cross"></i>crosses the cut</span><span><i class="lg rej"></i>refused (loop)</span><span><i class="lg bad"></i>the loop</span></div></div>
        <div class="wk-card aw4-side"><h3 data-title></h3><div data-side></div></div></div>`;
    const svgHost = qs("[data-svg]", stage),
      side = qs("[data-side]", stage),
      badge = qs("[data-badge]", stage);

    // ----- the drawing (built once) -----
    const mid = (i) => {
      const [a, b] = EDGES[i];
      return [(POS[a][0] + POS[b][0]) / 2, (POS[a][1] + POS[b][1]) / 2];
    };
    svgHost.innerHTML = `<svg class="aw4-svg" viewBox="0 0 530 300" role="img" aria-label="Seven towns and eleven possible cables with their costs">
      ${EDGES.map(([a, b, w], i) => {
        const [x, y] = mid(i);
        return `<g class="aw4-e" data-i="${i}" tabindex="0" role="button" aria-label="Cable ${a} to ${b}, cost ${w}">
        <line class="aw4-hit" x1="${POS[a][0]}" y1="${POS[a][1]}" x2="${POS[b][0]}" y2="${POS[b][1]}"/><line class="aw4-ln" x1="${POS[a][0]}" y1="${POS[a][1]}" x2="${POS[b][0]}" y2="${POS[b][1]}"/>
        <g class="aw4-w"><rect x="${x - 14}" y="${y - 12}" width="28" height="24" rx="9"/><text x="${x}" y="${y}">${w}</text></g></g>`;
      }).join("")}
      ${NODES.map((n) => `<g class="aw4-n" data-n="${n}" tabindex="-1"><circle cx="${POS[n][0]}" cy="${POS[n][1]}" r="23"/><text x="${POS[n][0]}" y="${POS[n][1]}">${n}</text></g>`).join("")}
      <g class="aw4-top"></g></svg>`;
    const svg = qs("svg", svgHost),
      top = qs(".aw4-top", svg);
    const eEl = (i) => qs(`.aw4-e[data-i="${i}"]`, svg),
      nEl = (n) => qs(`.aw4-n[data-n="${n}"]`, svg);

    const note = (h) => {
      noteHtml = h;
      const n = qs("[data-note]", side);
      if (n) n.innerHTML = h;
    };
    const shakeEdge = (i) => {
      const w = qs(".aw4-w", eEl(i));
      if (fxOn() && N.fx.shake) N.fx.shake(w);
    };
    function grow(i) {
      if (!fxOn()) return;
      const ln = qs(".aw4-ln", eEl(i)),
        len = ln.getTotalLength ? ln.getTotalLength() : 200;
      ln.animate(
        [
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDasharray: len, strokeDashoffset: 0 },
        ],
        { duration: 280, easing: "ease-out" },
      );
    }
    const tag = (i, text) => {
      const [x, y] = mid(i),
        g = document.createElementNS(NS, "g");
      g.setAttribute("class", "aw4-tag");
      g.innerHTML = `<rect x="${x - 34}" y="${y - 42}" width="68" height="24" rx="12"/><text x="${x}" y="${y - 30}">${text}</text>`;
      top.appendChild(g);
      if (fxOn())
        g.animate(
          [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 200, easing: "ease-out", fill: "backwards" },
        );
      return g;
    };

    /** The loop animation: the route that already joins the two ends lights up red with the refused cable closing it. */
    async function loopFx(i, path, label = "loop!", ms = 1300) {
      busy = true;
      snd("wrong");
      const ends = pathNodes(path, EDGES[i][0]);
      path.forEach((j) => eEl(j).classList.add("bad"));
      eEl(i).classList.add("bad", "ghost");
      ends.forEach((n) => nEl(n).classList.add("loopn"));
      const t = tag(i, label);
      shakeEdge(i);
      await wait(ms);
      path.forEach((j) => eEl(j).classList.remove("bad"));
      eEl(i).classList.remove("bad", "ghost");
      ends.forEach((n) => nEl(n).classList.remove("loopn"));
      t.remove();
      busy = false;
    }

    // ----- painting -----
    const crossing = () => EDGES.map((_, i) => i).filter((i) => C.S.has(EDGES[i][0]) !== C.S.has(EDGES[i][1]));
    function paint() {
      const tree = mode === "kruskal" ? K.tree : mode === "free" ? Fr.tree : C.safe,
        rej = mode === "kruskal" ? K.rej : [],
        cr = mode === "cut" ? crossing() : [];
      EDGES.forEach((_, i) => {
        const g = eEl(i);
        g.classList.toggle("tree", tree.includes(i));
        g.classList.toggle("rej", rej.includes(i));
        g.classList.toggle("cross", cr.includes(i));
      });
      const gs = mode === "cut" ? [] : groupsOf(tree).filter((g) => g.length > 1);
      NODES.forEach((n) => {
        const k = gs.findIndex((g) => g.includes(n)),
          e = nEl(n);
        COLS.forEach((c) => e.classList.toggle("c-" + c, k >= 0 && COLS[k % COLS.length] === c));
        e.classList.toggle(
          "c-violet",
          (mode === "cut" && C.S.has(n)) || (k >= 0 && COLS[k % COLS.length] === "violet"),
        );
        e.classList.toggle("pick", mode === "cut");
        e.setAttribute("tabindex", mode === "cut" ? "0" : "-1");
      });
      qsa(".aw4-tab", stage).forEach((b) => {
        const on = b.dataset.mode === mode;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on);
      });
      svg.dataset.mode = mode;
      renderSide();
    }
    const stat = (l, v, t) => N.wk.stat(l, v, t);
    function renderSide() {
      let h, title, bd, cls;
      if (mode === "kruskal") {
        title = "Kruskal: cheapest first, skip loops";
        const nextI = sortedIdx.find((i) => !K.tree.includes(i) && !K.rej.includes(i)),
          full = K.tree.length === NEED;
        bd = full ? "Spanning tree" : `${K.tree.length} of ${NEED} cables`;
        cls = full ? "" : "slow";
        h = `<div class="wk-stats">${stat("Cables", `${K.tree.length} / ${NEED}`, "blue")}${stat("Total cost", cost(K.tree), "amber")}${stat("Loops refused", K.rej.length, "rose")}</div>
          <div class="aw4-lh">The list <span>cheapest first. Tap a cable (here or on the map) to try it.</span></div>
          <div class="aw4-chips">${sortedIdx.map((i) => `<button class="aw4-chip ${K.tree.includes(i) ? "take" : K.rej.includes(i) ? "rej" : full ? "off" : i === nextI ? "next" : ""}" data-i="${i}"><b>${nm(i)}</b><i>${W(i)}</i></button>`).join("")}</div>
          <div class="wk-row"><button class="btn small ghost" data-act="reset">Start again</button></div>`;
      } else if (mode === "cut") {
        title = "Cut finder: lightest across the gap";
        const cr = crossing().sort((a, b) => W(a) - W(b));
        bd = C.S.size ? `${C.S.size} on the purple side` : "Pick a side";
        cls = C.S.size ? "slow" : "slow";
        h = `<div class="wk-stats">${stat("Purple side", C.S.size ? [...C.S].sort().join(" ") : "none", "blue")}${stat("Cables crossing", cr.length, "amber")}${stat("Cuts solved", `${C.cuts.size} / 2`, "teal")}</div>
          <div class="aw4-lh">Crossing cables <span>cheapest first. Tap the one that must be safe.</span></div>
          <div class="aw4-chips">${cr.length ? cr.map((i) => `<button class="aw4-chip cr ${C.safe.includes(i) ? "take" : ""}" data-i="${i}"><b>${nm(i)}</b><i>${W(i)}</i></button>`).join("") : `<span class="faint">Tap towns on the map to build a purple team.</span>`}</div>
          <div class="wk-row"><button class="btn small" data-act="newcut">New cut for me</button><button class="btn small ghost" data-act="clearcut">Clear</button></div>`;
      } else {
        title = "Free build: any cables you like";
        const sp = Fr.tree.length === NEED,
          c = cost(Fr.tree),
          over = sp ? c - MSTCOST : 0;
        bd = sp ? (over > 0 ? `+${over} over the minimum` : "Minimum!") : `${Fr.tree.length} of ${NEED} cables`;
        cls = sp ? (over > 0 ? "down" : "") : "slow";
        h = `<div class="wk-stats">${stat("Cables", `${Fr.tree.length} / ${NEED}`, "blue")}${stat("Your total", c, over > 0 ? "rose" : "amber")}${stat("Cheapest possible", MSTCOST, "teal")}</div>
          <div class="wk-row" style="margin-top:10px"><button class="btn small primary" data-act="swap" ${sp && over > 0 && !busy ? "" : "disabled"}>Improve with one swap</button><button class="btn small ghost" data-act="reset">Start again</button></div>`;
      }
      badge.textContent = bd;
      badge.className = "wk-badge" + (cls ? " " + cls : "");
      qs("[data-title]", stage).textContent = title;
      side.innerHTML = h + `<div class="wk-note aw4-note" data-note>${noteHtml}</div>`;
    }

    // ----- Kruskal mode -----
    async function kTap(i) {
      if (busy) return;
      if (K.tree.includes(i) || K.rej.includes(i)) {
        note(
          `<b>${nm(i)}</b> is already decided: ${K.tree.includes(i) ? "it is in the network" : "it was refused, because it would make a loop"}.`,
        );
        return;
      }
      if (K.tree.length === NEED) {
        note("The network is complete. Every road left in the list would only make a loop.");
        return;
      }
      const [a, b] = EDGES[i],
        p = pathIn(K.tree, a, b);
      if (p) {
        await loopFx(i, p);
        K.rej.push(i);
        paint();
        note(
          `<b>Refused ${nm(i)} (${W(i)}).</b> ${a} and ${b} are already joined through <b>${pathNodes(p, a).join(" → ")}</b>. This cable would close a loop, and a loop always has one cable too many. It is also the dearest on that loop, because Kruskal laid the others first.`,
        );
        api.say(`A loop! ${a} and ${b} are already connected, so that cable would be wasted.`, "surprised");
        api.done("loop");
        return;
      }
      const best = sortedIdx.find(
        (j) => !K.tree.includes(j) && !K.rej.includes(j) && !pathIn(K.tree, EDGES[j][0], EDGES[j][1]),
      );
      if (i !== best) {
        snd("wrong");
        shakeEdge(i);
        note(
          `Not yet. <b>${nm(i)} (${W(i)})</b> is allowed, but <b>${nm(best)} (${W(best)})</b> is cheaper and makes no loop. Kruskal always takes the <b>cheapest</b> safe cable first, so ${nm(i)} has to wait.`,
        );
        api.say(`Cheaper first: <b>${nm(best)}</b> costs only ${W(best)}.`, "sad");
        return;
      }
      const before = groupsOf(K.tree).length;
      K.tree.push(i);
      paint();
      grow(i);
      snd("pop");
      const merged = groupsOf(K.tree).length,
        joined = before - merged === 1;
      note(
        `Laid <b>${nm(i)} (${W(i)})</b>: the cheapest cable that joins two separate groups. Total so far <b>${cost(K.tree)}</b>.${K.tree.length === NEED ? "" : ` ${merged} group${merged === 1 ? "" : "s"} left.`}`,
      );
      if (K.tree.length === 3) {
        api.say("Three cables down. The coloured blobs are groups of towns that are already joined.", "happy");
        api.done("k3");
      } else if (K.tree.length < NEED)
        api.say(joined ? `<b>${nm(i)}</b> joined two groups into one.` : `Good: <b>${nm(i)}</b>.`, "happy");
      if (K.tree.length === NEED) {
        note(
          `All ${NODES.length} towns are connected with ${NEED} cables for a total of <b>${cost(K.tree)}</b>. The cables left in the list would all make loops, so Kruskal can stop: a spanning tree always has one fewer cable than towns.`,
        );
        api.say(`Finished at <b>${cost(K.tree)}</b>. No other network connects all seven towns for less.`, "love");
        api.done("mst");
      }
    }

    // ----- Cut mode -----
    const cutKey = () => {
      const s = C.S.has("A") ? C.S : new Set(NODES.filter((n) => !C.S.has(n)));
      return [...s].sort().join("");
    };
    function nodeTap(n) {
      if (mode !== "cut" || busy) return;
      if (C.S.has(n)) C.S.delete(n);
      else C.S.add(n);
      const sz = C.S.size;
      if (sz === 0) note("Tap towns to put them on the purple side. The rest of the map is the other side.");
      else if (sz === NODES.length) note("Every town is purple, so there is no gap. Leave at least one town out.");
      else {
        const cr = crossing();
        note(
          `Purple side: <b>${[...C.S].sort().join(", ")}</b>. <b>${cr.length}</b> cable${cr.length === 1 ? "" : "s"} cross${cr.length === 1 ? "es" : ""} the gap (dashed orange). Which one is certain to be in the cheapest network?`,
        );
      }
      snd("tick");
      paint();
    }
    function cTap(i) {
      if (busy || mode !== "cut") return;
      if (!C.S.size || C.S.size === NODES.length) {
        note("Make a cut first: tap some towns to turn them purple, leaving at least one out.");
        return;
      }
      const cr = crossing();
      if (!cr.includes(i)) {
        shakeEdge(i);
        snd("wrong");
        note(
          `<b>${nm(i)}</b> has both ends on the same side, so it does not cross the gap. Only the dashed orange cables count for this cut.`,
        );
        return;
      }
      const best = cr.slice().sort((a, b) => W(a) - W(b))[0];
      if (i !== best) {
        snd("wrong");
        shakeEdge(i);
        note(
          `<b>${nm(i)} (${W(i)})</b> crosses, but <b>${nm(best)} (${W(best)})</b> is lighter. If a network used ${nm(i)} here, swapping in ${nm(best)} keeps everything connected and costs ${W(i) - W(best)} less. So the lightest one is the safe one.`,
        );
        api.say(`Swap ${nm(i)} for the lighter ${nm(best)} and you only save money.`, "sad");
        return;
      }
      if (!C.safe.includes(i)) C.safe.push(i);
      const first = !C.cuts.has(cutKey());
      C.cuts.add(cutKey());
      paint();
      snd("correct");
      grow(i);
      note(
        `<b>Safe: ${nm(i)} (${W(i)}).</b> It is the lightest cable across this cut, and sure enough it is in the cheapest network (the one Kruskal built, total ${MSTCOST}). ${first && C.cuts.size < 2 ? "Try a different cut." : ""}`,
      );
      api.say(`Lightest across the gap is always safe. That is the <b>cut property</b>.`, "love");
      if (C.cuts.size >= 2) api.done("cut");
    }
    function newCut() {
      if (busy) return;
      for (let tries = 0; tries < 60; tries++) {
        const size = 1 + Math.floor(Math.random() * 3),
          pool = NODES.slice(),
          S = new Set();
        while (S.size < size) S.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        C.S = S;
        if (!C.cuts.has(cutKey())) break;
      }
      const cr = crossing();
      note(
        `Purple side: <b>${[...C.S].sort().join(", ")}</b>. <b>${cr.length}</b> cables cross the gap. Tap the one that must be safe.`,
      );
      paint();
    }

    // ----- Free build -----
    async function fTap(i) {
      if (busy) return;
      if (Fr.tree.includes(i)) {
        Fr.tree = Fr.tree.filter((j) => j !== i);
        paint();
        snd("back");
        note(`Took <b>${nm(i)}</b> out again. Total now <b>${cost(Fr.tree)}</b>.`);
        return;
      }
      const [a, b] = EDGES[i],
        p = pathIn(Fr.tree, a, b);
      if (p) {
        await loopFx(i, p);
        const heavy = p.concat(i).reduce((m, j) => (W(j) > W(m) ? j : m));
        note(
          `<b>That makes a loop.</b> ${a} and ${b} are already joined through ${pathNodes(p, a).join(" → ")}, so ${nm(i)} would be a spare cable. ${heavy === i ? "It is also the dearest on the loop." : `If you really wanted it, the dearest cable on the loop is <b>${nm(heavy)} (${W(heavy)})</b>, and that is the one to drop.`}`,
        );
        api.say("No loops: a network with a spare cable wastes money.", "surprised");
        api.done("loop");
        return;
      }
      Fr.tree.push(i);
      paint();
      grow(i);
      snd("pop");
      if (Fr.tree.length < NEED) {
        note(
          `Laid <b>${nm(i)} (${W(i)})</b>. Total <b>${cost(Fr.tree)}</b>. ${NEED - Fr.tree.length} more to connect every town.`,
        );
        return;
      }
      const c = cost(Fr.tree),
        over = c - MSTCOST;
      if (over > 0) {
        note(
          `Every town is connected, but your total is <b>${c}</b> and the cheapest possible is <b>${MSTCOST}</b>: you overspent by <b>${over}</b>. Picking cables that look fine one at a time is not enough. Press <b>Improve with one swap</b> to see the fix.`,
        );
        api.say(`Connected, but <b>${over}</b> too dear. Try the swap button.`, "think");
        Fr.over = true;
        api.done("costly");
      } else {
        note(
          `That is <b>${c}</b>, the minimum. You matched Kruskal without the list. To see what a greedy mistake costs, start again and begin with a dear cable such as F–G (12).`,
        );
        api.say("That is the cheapest network. Now try to overspend on purpose.", "love");
      }
    }
    async function swap() {
      if (busy || Fr.tree.length !== NEED) return;
      for (const i of sortedIdx.filter((j) => !Fr.tree.includes(j))) {
        const p = pathIn(Fr.tree, EDGES[i][0], EDGES[i][1]),
          h = p.reduce((m, j) => (W(j) > W(m) ? j : m));
        if (W(h) <= W(i)) continue;
        busy = true;
        renderSide();
        note(
          `Try adding <b>${nm(i)} (${W(i)})</b>. It closes the loop <b>${pathNodes(p, EDGES[i][0]).join(" → ")} → ${EDGES[i][0]}</b>.`,
        );
        busy = false;
        await loopFx(i, p, "spare!", 1100);
        busy = true;
        Fr.tree = Fr.tree.filter((j) => j !== h);
        Fr.tree.push(i);
        busy = false;
        paint();
        grow(i);
        snd("pop");
        const c = cost(Fr.tree);
        note(
          `The dearest cable on that loop is <b>${nm(h)} (${W(h)})</b>, so drop it and keep <b>${nm(i)} (${W(i)})</b>. Everything is still connected and you saved <b>${W(h) - W(i)}</b>. Total now <b>${c}</b>${c === MSTCOST ? `: the minimum, the same as Kruskal's ${MSTCOST}.` : ". Swap again."}`,
        );
        api.say(
          c === MSTCOST
            ? "Minimum reached! The heaviest cable on a loop is never needed."
            : "Better. The heaviest cable on a loop can always go.",
          c === MSTCOST ? "love" : "happy",
        );
        return;
      }
    }

    // ----- wiring -----
    const introBy = {
      kruskal:
        "<b>Kruskal:</b> tap the cheapest cable that does not make a loop. Try to sneak a loop in: tap a cable whose ends are already joined.",
      cut: "<b>Cut:</b> tap some towns to make a purple team. Then tap the lightest cable that crosses from purple to the rest.",
      free: "<b>Free build:</b> tap any cables you like to connect all seven towns (tap a laid cable to remove it). Loops are still refused. Can you overspend?",
    };
    function setMode(m) {
      if (busy) return;
      mode = m;
      noteHtml = introBy[m];
      paint();
      snd("tick");
      api.say(
        {
          kruskal: "Cheapest first. Skip anything that makes a loop.",
          cut: "Split the towns in two, then find the lightest bridge.",
          free: "No coach this time. Connect everything any way you like.",
        }[m],
        "idle",
      );
    }
    qsa(".aw4-tab", stage).forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
    const edgeTap = (i) => (mode === "kruskal" ? kTap(i) : mode === "cut" ? cTap(i) : fTap(i));
    qsa(".aw4-e", svg).forEach((g) => {
      const i = +g.dataset.i;
      g.onclick = () => edgeTap(i);
      g.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          edgeTap(i);
        }
      };
    });
    qsa(".aw4-n", svg).forEach((g) => {
      g.onclick = () => nodeTap(g.dataset.n);
      g.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nodeTap(g.dataset.n);
        }
      };
    });
    side.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-i]"),
        act = e.target.closest("[data-act]");
      if (chip) return edgeTap(+chip.dataset.i);
      if (!act || busy) return;
      const a = act.dataset.act;
      if (a === "reset") {
        if (mode === "kruskal") {
          K.tree = [];
          K.rej = [];
        } else {
          Fr.tree = [];
          Fr.over = false;
        }
        noteHtml = introBy[mode];
        paint();
        snd("back");
      } else if (a === "swap") swap();
      else if (a === "newcut") newCut();
      else if (a === "clearcut") {
        C.S = new Set();
        noteHtml = introBy.cut;
        paint();
      }
    });
    noteHtml = introBy.kruskal;
    paint();
  }

  N.register({
    id: "a4-build",
    subject: "algo",
    lecture: 4,
    order: 90,
    num: "4.W",
    workshop: true,
    title: "Workshop: build the cheapest network",
    blurb:
      "No code. Lay cables Kruskal-style, refuse loops, find safe cables with a cut, and see what a greedy slip costs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "Seven towns need connecting with as little cable as possible. The numbers are costs. Start in <b>Kruskal</b> mode: tap the cheapest cable.",
        missions: [
          {
            id: "k3",
            t: "Lay the three cheapest safe cables",
            d: "In <b>Kruskal</b> mode, tap the cheapest cable, then the next cheapest, and so on.",
            hint: "Look at the list on the right: it is sorted cheapest first. Start with D–F (2).",
          },
          {
            id: "loop",
            t: "Catch a loop",
            d: "Tap a cable whose two ends are <b>already joined</b>. Watch the loop light up.",
            hint: "Once D–F and D–E are laid, E and F are connected through D. Tap E–F (11).",
          },
          {
            id: "mst",
            t: "Finish the network",
            d: "Keep taking the cheapest cable that makes no loop until all seven towns are connected.",
            hint: "Seven towns need six cables. Skip any cable that would join two towns that are already connected.",
          },
          {
            id: "cut",
            t: "Find two safe cables with a cut",
            d: "Open <b>Cut finder</b>. Tap towns to make a purple team, then tap the <b>lightest</b> cable crossing to the rest. Do it for two different cuts.",
            hint: "Try purple = just A. Two cables cross it: A–C (4) and A–B (7). The lighter one is safe.",
          },
          {
            id: "costly",
            t: "Overspend on purpose",
            d: "Open <b>Free build</b> and connect all seven towns <b>without</b> going cheapest first, so your total beats the minimum.",
            hint: "Start with dear cables: F–G (12), A–B (7), then fill in the rest without loops.",
          },
        ],
        build: (stage, api) => buildIt(stage, api),
      });
      root.appendChild(
        predict({
          id: "a4-build-1",
          q: "Two halves of a network are separated by a gap. Cables of cost 3, 8 and 12 cross it. Which one can you commit to without seeing anything else?",
          opts: ["The 3 cable", "The 8 cable", "The 12 cable"],
          a: 0,
          why: "The lightest cable across a cut is always safe: any tree that used the 8 or the 12 here could swap in the 3, stay connected and cost less. That is the cut property.",
        }),
      );
      root.appendChild(
        predict({
          id: "a4-build-2",
          q: "Your hand-built network connects every town. You add one more cable and it closes a loop. Which cable on that loop is safe to drop?",
          opts: [
            "The dearest cable on the loop",
            "The cheapest cable on the loop",
            "Any of them: the total stays the same",
          ],
          a: 0,
          why: "The rest of the loop still connects its towns, so any one cable can go. Dropping the dearest saves the most, and the dearest on a loop is never needed in a cheapest network.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A spanning tree over <b>n</b> towns has exactly <b>n − 1</b> cables and no loops.",
            "<b>Kruskal:</b> go through the cables cheapest first and skip any whose ends are already connected.",
            "<b>Cut property:</b> the lightest cable across any split is safe. Prim uses it with the cut <i>tree | everything else</i>.",
            "<b>Loop property:</b> the dearest cable on a loop is never needed, so swapping it out can only save money.",
          ],
          "Cheapest first, never close a loop: the lightest bridge across any gap is always safe.",
        ),
      );
    },
  });

  L["a4-build"] = {
    sum: "Build a minimum spanning tree by hand: Kruskal's list, loops refused, safe cables from cuts, and the cost of a greedy slip.",
    steps: [
      {
        t: "What you will build",
        b: `<p>You'll connect <b>seven towns</b> with cables that each have a cost. Every town must be reachable, and the total cost must be as small as possible.</p><p>The cheapest answer never has a loop, so it always uses <span class="key">one fewer cable than there are towns</span>.</p>`,
        v: F.compare(
          { title: "A spanning tree", c: "teal", body: "all towns connected, <b>no loops</b>, n − 1 cables" },
          { title: "A loop", c: "rose", body: "one cable is spare: drop it and everything stays connected" },
        ),
        c: {
          q: "You must connect seven towns with the cheapest possible network. How many cables does it use?",
          o: ["Six", "Seven", "Eight"],
          a: 0,
          why: "A network with no loops and every town connected has n − 1 cables, which is six for seven towns. A seventh cable would close a loop.",
        },
      },
      {
        t: "Two rules, one idea",
        b: `<p><b>Kruskal:</b> walk the cables cheapest first. Lay a cable unless its two ends are already connected, because that would make a loop.</p><p><b>Cut property:</b> split the towns into two teams. The lightest cable crossing between them is always safe to lay.</p>`,
        v: F.flow([
          { t: "Cheapest left", c: "blue" },
          { t: "Loop?", s: "skip it", c: "rose" },
          { t: "Lay it", c: "teal" },
        ]),
        c: {
          q: "Kruskal reaches a cable whose two ends are already joined by other cables. What does it do?",
          o: [
            "Skips it, as it would only make a loop",
            "Lays it, because it is cheap enough",
            "Lays it and removes the cheapest cable nearby",
          ],
          a: 0,
          why: "Two towns that are already connected do not need another route between them, so the cable would be a wasted loop.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
