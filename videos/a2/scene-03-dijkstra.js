/* Algorithms phase 2, scene 03-dijkstra: Dijkstra's whole run on the five-node road map.
   Every number (distances, candidate sums, shortcuts, settle order) is read ONCE from A2.DIJ_RUN; only the times are typed
   here. Per round: the pick (smallest waiting node, orange) settles (green, its row slides from the waiting room to the
   settled list), then each road out of it is relaxed (road draws on in blue, the pill shows the candidate sum). A shortcut holds
   still long enough to read: the pill turns into the comparison ("3 < 4", orange), the old badge number is struck out for about
   half a second and the new one pops in orange before the next road is checked. The times are generated below from a few gaps
   and the window of each relaxation. At the end the shortest-path tree is outlined in green. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;

  const RUN = A2.DIJ_RUN;
  const NAMES = A2.DIJ.names;
  const INF = A2.INF;
  const DRAW = 0.35; // a checked road draws on in this long
  const STRIKE = 0.25; // the old number is struck out in this long
  const PICK_DUR = 0.55; // a pick turns orange, then settles (its row slides to the settled list)
  const GAP_SETTLE = 0.45; // settled -> the first road of that node is checked
  const GAP_PICK = 0.35; // the last road checked -> the next pick
  const FIRST_WIN = 0.55; // a road that gives a node its first distance
  // a shortcut (a shorter way replaces the old number): when the comparison shows, when the strike starts, when the new number
  // lands and how long the whole window is, all counted from the moment the road starts to draw
  const SHORTS = [
    { cmp: 0.65, strike: 0.95, eff: 1.5, win: 1.85 },
    { cmp: 0.55, strike: 0.8, eff: 1.25, win: 1.55 },
    { cmp: 0.55, strike: 0.8, eff: 1.25, win: 1.55 },
  ];
  const SLIDE = 0.5; // a settled row slides to the settled list
  const LIST_Y = [20, 262]; // waiting room, settled list (stage y of their headers' top)

  // ---------- the run, read once from the real algorithm ----------
  A2.need(RUN.settled.join("") === "ACBDE", "scene 3: settle order must be A C B D E");
  A2.need(RUN.rounds.length === 5, "scene 3: five rounds");
  const PICK = []; // [pick starts, settled] per round
  const RELAX = []; // per round: [start, end] window of each road checked
  const SHORT_OF = {}; // "round-index" -> the shortcut timing of that relaxation
  {
    let clock = 1.4;
    let nShort = 0;
    RUN.rounds.forEach((rd, r) => {
      PICK.push([clock, clock + PICK_DUR]);
      clock += PICK_DUR + GAP_SETTLE;
      const wins = [];
      rd.relax.forEach((x, j) => {
        const sc = x.old === INF ? null : SHORTS[nShort++];
        if (sc) SHORT_OF[`${r}-${j}`] = sc;
        wins.push([clock, clock + (sc ? sc.win : FIRST_WIN)]);
        clock = wins[j][1];
      });
      RELAX.push(wins);
      clock += GAP_PICK; // after the last road of a node the next pick follows
    });
  }
  const FIN0 = PICK[PICK.length - 1][1] + 0.35; // the final tree starts to draw
  const FINSTEP = 0.3;
  const RES = FIN0 + 1.6; // the answer pops in
  A2.need(Object.keys(SHORT_OF).length === SHORTS.length, "scene 3: three shortcuts");
  const INFO = A2.obj(NAMES, (n, i) => ({
    n,
    appear: n === "A" ? 0.9 : null, // the badge and row get a number
    pop: n === "A" ? 0.9 : 0.5 + 0.1 * (i - 1), // the badge pops in
    pick: null,
    settle: null,
    steps: n === "A" ? [{ t: 0.9, eff: 0.9, v: 0, short: false }] : [],
  }));
  const EDGES = [];
  RUN.rounds.forEach((rd, r) => {
    A2.need(rd.relax.length === RELAX[r].length, `scene 3: round ${r} relaxes ${RELAX[r].length} roads`);
    INFO[rd.node].pick = PICK[r][0];
    INFO[rd.node].settle = PICK[r][1];
    rd.relax.forEach((x, j) => {
      const [a, end] = RELAX[r][j];
      const c = a + DRAW;
      const first = x.old === INF;
      const sc = SHORT_OF[`${r}-${j}`];
      A2.need(x.better, "scene 3: every relaxation of the lesson graph improves a distance");
      const to = INFO[x.to];
      to.steps.push({ t: first ? c : a + sc.strike, eff: first ? c : a + sc.eff, v: x.cand, short: !first });
      if (first) to.appear = c;
      else EDGES.find((e) => e.from === rd.before.parent[x.to] && e.to === x.to).gone = a + sc.eff; // the old way in is dropped
      EDGES.push({ key: `${rd.node}-${x.to}`, from: rd.node, to: x.to, a, b: first ? end : a + sc.eff, c, short: !first, gone: INF,
        cmpAt: first ? INF : a + sc.cmp, cmp: `${x.cand} < ${x.old}`, R: PICK[r + 1][0], sum: `${rd.d} + ${x.w} = ${x.cand}` }); // prettier-ignore
    });
  });
  A2.need(EDGES.length === 7 && EDGES.filter((e) => e.short).length === 3, "scene 3: 7 relaxations, 3 shortcuts");
  const valAt = (n, T) => INFO[n].steps.reduce((v, s) => (T >= s.eff - 1e-9 ? s.v : v), null);

  // waiting-room order after every change (a node appears, settles or changes number)
  const EV = [...new Set(NAMES.flatMap((n) => [INFO[n].appear, INFO[n].settle, ...INFO[n].steps.map((s) => s.eff)]))].sort((p, q) => p - q); // prettier-ignore
  const RANK = EV.map((T) =>
    NAMES.filter((n) => INFO[n].appear <= T + 1e-9 && T < INFO[n].settle - 1e-9).sort(
      (p, q) => valAt(p, T) - valAt(q, T) || NAMES.indexOf(p) - NAMES.indexOf(q),
    ),
  );
  function waitSlot(n, t) {
    const k = EV.reduce((m, T, i) => (t >= T ? i : m), -1);
    if (k < 0 || RANK[k].indexOf(n) < 0) return null;
    const cur = RANK[k].indexOf(n);
    const prev = k > 0 ? RANK[k - 1].indexOf(n) : -1;
    const from = prev < 0 ? cur : prev;
    return from + (cur - from) * A2.io(t, EV[k], EV[k] + 0.4);
  }

  // the final shortest-path tree: roads one after the other from A, a node turns solid when its road arrives
  const TREE = A2.treeEdges(RUN);
  A2.need(TREE.map((e) => e.join("")).join() === "AC,CB,BD,DE", "scene 3: the tree is A-C, C-B, B-D, D-E");
  const FIN = { A: FIN0 };
  TREE.forEach(([, q], i) => (FIN[q] = FIN0 + FINSTEP * (i + 1)));
  const TOTAL = RUN.dist.E;
  A2.need(TOTAL === 8 && RUN.dist.B === 3 && RUN.dist.C === 2 && RUN.dist.D === 6, "scene 3: distances 0 3 2 6 8");

  // ---------- per-frame states ----------
  function nodeState(n, t) {
    const I = INFO[n];
    if (t >= FIN[n]) return { look: "solid", tone: "green", pulse: A2.bump(t, FIN[n] - FINSTEP, 0.3) };
    if (t >= I.settle) return { look: "soft", tone: "green", pulse: A2.bump(t, I.settle, 0.3) };
    if (t >= I.pick) return { look: "solid", tone: "orange", ring: "orange", ringK: A2.lin(t, I.pick, I.pick + 0.3) };
    if (t < I.appear) return { look: "grey" };
    const st = { look: "soft", tone: "purple" };
    I.steps.filter((s) => s.short && t >= s.eff && t < s.eff + 0.5).forEach((s) => {
      Object.assign(st, { ring: "orange", ringK: A2.bump(t, s.eff, 0.5), pulse: A2.bump(t, s.eff, 0.4) });
    }); // prettier-ignore
    return st;
  }
  function badgeState(n, t) {
    const I = INFO[n];
    if (t < I.pop) return undefined;
    const b = { text: "∞", tone: "grey", k: A2.lin(t, I.pop, I.pop + 0.45), strike: 0, s: 1 };
    I.steps.forEach((s) => {
      if (t < s.t) return;
      if (s.short && t < s.eff) Object.assign(b, { strike: A2.lin(t, s.t, s.t + STRIKE), text: valAt(n, s.t - 0.01), tone: "purple" });
      else Object.assign(b, { text: s.v, tone: s.short && t < s.eff + 0.5 ? "orange" : "purple", s: 1 + 0.25 * A2.bump(t, s.eff, 0.4) });
    }); // prettier-ignore
    if (t >= FIN[n]) return { ...b, tone: "green", solid: true };
    if (t >= I.settle) b.tone = "green";
    else if (t >= I.pick) b.tone = "orange";
    return b;
  }
  function edgeState(e, t) {
    const sumOn = t >= e.a && t < e.R;
    const cmpOn = sumOn && t >= e.cmpAt; // a shortcut: the pill turns into the comparison, new < old
    const base = {
      w: 12,
      from: e.from,
      text: sumOn ? (cmpOn ? e.cmp : e.sum) : null,
      pill: cmpOn ? "orange" : undefined,
      ps: 1 + 0.2 * (A2.bump(t, e.a, 0.35) + (e.short ? A2.bump(t, e.cmpAt, 0.35) : 0)),
    };
    if (t < e.a) return {};
    if (t < e.b) return { ...base, tone: "blue", k: A2.io(t, e.a, e.a + DRAW) };
    const k = 1 - A2.io(t, e.gone, e.gone + 0.3); // a dropped road retracts towards the settled node
    if (t >= e.gone) return k > 0 ? { ...base, tone: "purple", k } : { ...base, tone: null, k: 1 };
    return { ...base, tone: t >= INFO[e.to].settle ? "green" : "purple" };
  }

  V.scene({
    kicker: "DIJKSTRA",
    title: ["Settle the closest node,", "then relax its roads"],
    dur: Math.round((RES + 2.1) * 2) / 2,
    caps: [
      [0.4, RELAX[0][0][0] - 0.1, "Distance from A. Settle the smallest first."],
      [RELAX[0][0][0], PICK[2][0] - 0.2, "Then check its roads. A shorter way replaces the old distance."],
      [PICK[2][0], PICK[4][1] + 0.1, "Repeat. The smallest waiting (tentative) distance is always final."],
      [FIN0 - 0.1, RES + 2.4, "The green roads are the shortest routes: A to E costs 8."],
    ],
    build(stage) {
      const G = A2.graph(stage, {
        nodes: A2.DIJ.pos,
        edges: A2.DIJ.edges,
        badge: { A: "t", B: "tl", C: "bl", D: "tr", E: "tr" },
        at: { "A-C": 0.38 },
      });
      const waiting = A2.list(stage, { x: 664, y: LIST_Y[0], head: "waiting room", headTone: "purple", keys: NAMES });
      const settled = A2.list(stage, { x: 664, y: LIST_Y[1], head: "settled", headTone: "green", keys: NAMES });
      const outlines = TREE.map(([p, q], i) => {
        const path = V.s("path", { fill: "none", "stroke-linecap": "round", "stroke-width": 22 });
        path.style.stroke = L5.tone("green").lip;
        G.under.appendChild(path);
        return { path, p: G.pt(p), q: G.pt(q), a: FIN0 + FINSTEP * i };
      });
      const start = A2.tag(stage, { x: 62, y: 430, text: "start", tone: "blue", solid: true });
      const result = A2.tag(stage, { x: 822, y: 100, text: `A to E: ${TOTAL}`, tone: "green", solid: true });
      const svg = L5.svg(stage);
      const tick = L5.tick(0, 0, 52, "green", { w: 10 });
      svg.append(tick);
      const settledY = (s) => s + (LIST_Y[0] - LIST_Y[1]) / 54; // a waiting-room slot, counted in settled-list slots

      return (t) => {
        const nodes = {};
        const badges = {};
        const edges = {};
        NAMES.forEach((n) => {
          nodes[n] = nodeState(n, t);
          const b = badgeState(n, t);
          if (b) badges[n] = b;
        });
        EDGES.forEach((e) => (edges[e.key] = edgeState(e, t)));
        G.update({ o: A2.fade(t, 0, 0.6), nodes, edges, badges });

        // the final tree gets a darker outline, road after road from A
        outlines.forEach((o) => {
          const k = A2.io(t, o.a, o.a + FINSTEP);
          o.path.setAttribute("d", k > 0.001 ? `M${o.p.x} ${o.p.y}L${o.p.x + (o.q.x - o.p.x) * k} ${o.p.y + (o.q.y - o.p.y) * k}` : "");
        }); // prettier-ignore

        // the waiting room and the settled list
        const wItems = {};
        const sItems = {};
        NAMES.forEach((n) => {
          const I = INFO[n];
          const slot = t < I.settle ? waitSlot(n, t) : null;
          if (slot !== null) {
            const picked = t >= I.pick;
            wItems[n] = {
              text: `${n} = ${valAt(n, t)}`,
              slot,
              tone: picked ? "orange" : "purple",
              solid: picked,
              s: 0.8 + 0.2 * A2.pop(t, I.appear, 0.4),
              o: A2.fade(t, I.appear, 0.15),
            };
          }
          if (t >= I.settle) {
            const from = settledY(waitSlot(n, I.settle - 0.001));
            sItems[n] = {
              text: `${n} = ${RUN.dist[n]}`,
              slot: from + (RUN.settled.indexOf(n) - from) * A2.io(t, I.settle, I.settle + SLIDE),
              tone: "green",
            };
          }
        });
        waiting.update({ k: A2.pop(t, 0.4) * (1 - A2.fade(t, FIN0 - 0.2, 0.3)), items: wItems });
        start.set({ s: 0.8 + 0.2 * A2.pop(t, 0.9), o: A2.fade(t, 0.9, 0.2) * (1 - A2.fade(t, PICK[1][0] - 0.3, 0.3)) });
        settled.update({ k: A2.pop(t, 0.6), items: sItems });

        // the answer
        result.set({ s: 0.8 + 0.2 * A2.pop(t, RES), o: A2.fade(t, RES) });
        L5.drawOn(tick, A2.io(t, RES + 0.4, RES + 0.8));
        V.place(tick, { x: 698, y: 100, s: 0.7 + 0.3 * A2.pop(t, RES + 0.4), o: A2.fade(t, RES + 0.4, 0.1) });
      };
    },
  });
})();
