/* l15-01: Lecture 15 (multi-objective particle swarm optimisation): shared kernel (archive update, pruning, hypervolume, ranks) and the figures of 15.1 and 15.2 (personal bests and the archive). The lessons are in l15-04.js. Plot helpers come from Lecture 13 (NIC.shared.nicL13). */
(function () {
  const N = NIC;
  const { qs } = N;
  const sh = (NIC.shared.nicL15 = NIC.shared.nicL15 || {});
  const L13 = NIC.shared.nicL13;
  const { C, pr, mulberry, frame, dot, joinLine, box, crowd, fmtD } = L13;
  const S2 = [1, 1];
  const dom = (a, b) => L13.dom(a, b, S2);

  // ---------- kernel: both objectives minimised ----------
  /** The lecture's archive update for one new solution y. log[i] is "rm" (y dominates a_i), "beats" (a_i dominates y) or "tie". */
  function archAdd(A, y) {
    const log = [],
      keep = [];
    let marked = false;
    A.forEach((a) => {
      if (dom(y, a)) return log.push("rm");
      keep.push(a);
      if (dom(a, y)) marked = true;
      log.push(dom(a, y) ? "beats" : "tie");
    });
    if (!marked) keep.push(y);
    return { A: keep, log, added: !marked };
  }
  /** Prune by crowding: drop the smallest crowding distance, recompute, repeat until cap. out: [[index, distance]] in removal order. */
  function pruneCrowd(P, cap) {
    let idx = P.map((_, i) => i);
    const out = [];
    while (idx.length > Math.max(cap, 2)) {
      const d = crowd(P, idx);
      const w = idx.reduce((a, b) => (d[b] < d[a] ? b : a));
      out.push([w, d[w]]);
      idx = idx.filter((i) => i !== w);
    }
    return { keep: idx, out };
  }
  const cen = (P, c) => [0, 1].map((m) => c.reduce((s, i) => s + P[i][m], 0) / c.length);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  /** Hierarchical clustering: join the two clusters whose centres are closest until cap clusters remain; keep the member nearest each centre. */
  function cluster(P, cap) {
    let CL = P.map((_, i) => [i]);
    const joins = [];
    while (CL.length > cap) {
      let best = [0, 1, Infinity];
      for (let a = 0; a < CL.length; a++)
        for (let b = a + 1; b < CL.length; b++) {
          const d = dist(cen(P, CL[a]), cen(P, CL[b]));
          if (d < best[2]) best = [a, b, d];
        }
      const [a, b] = best;
      joins.push(CL[a].concat(CL[b]));
      CL = CL.filter((_, k) => k !== a && k !== b).concat([CL[a].concat(CL[b])]);
    }
    const keep = CL.map((c) => c.reduce((x, y) => (dist(P[y], cen(P, c)) < dist(P[x], cen(P, c)) ? y : x)));
    return { C: CL, keep, joins };
  }
  /** 2-D hypervolume of the points that dominate the reference point r. */
  function hv(P, r) {
    const Q = P.filter((p) => dom(p, r)).sort((a, b) => a[0] - b[0]);
    let area = 0,
      top = r[1];
    Q.forEach((p) => {
      if (p[1] < top) ((area += (r[0] - p[0]) * (top - p[1])), (top = p[1]));
    });
    return area;
  }
  /** Each member's own share of the hypervolume (what is lost when it is removed); 0 if it does not dominate r. */
  const contrib = (P, r) =>
    P.map((p, i) =>
      dom(p, r)
        ? hv(P, r) -
          hv(
            P.filter((_, j) => j !== i),
            r,
          )
        : 0,
    );
  /** Per-objective ranks (1 = lowest value) of every row of V, then their average. */
  const ranksPer = (V) =>
    V[0].map((_, m) => {
      const r = [];
      V.map((v, i) => [v[m], i])
        .sort((a, b) => a[0] - b[0])
        .forEach(([, i], k) => (r[i] = k + 1));
      return r;
    });
  const avgRank = (V) => V.map((_, i) => ranksPer(V).reduce((s, r) => s + r[i], 0) / V[0].length);
  /** Distance ranking: the sum of absolute objective differences to every other member (larger = less crowded). */
  const distRank = (V) =>
    V.map((a, i) => V.reduce((s, b, j) => (j === i ? s : s + a.reduce((t, x, m) => t + Math.abs(x - b[m]), 0)), 0));
  const AX = { xr: [0, 10], yr: [0, 10], xl: "time ←", yl: "↓ energy" };
  /** "a 1 8, b 2 5" -> {a: [1, 8], ...} */
  const pts = L13.pts;
  /** Shaded box from point p up to reference point r (both minimised). */
  const hvBox = (fr, p, r, c = "teal", op = 0.16) =>
    `<rect x="${fr.X(p[0])}" y="${fr.Y(r[1])}" width="${fr.X(r[0]) - fr.X(p[0])}" height="${fr.Y(p[1]) - fr.Y(r[1])}" fill="var(--${c})" fill-opacity="${op}" stroke="var(--${c})" stroke-opacity=".5"/>`;
  const star = (fr, p, t) =>
    `<g class="fi"><rect x="${fr.X(p[0]) - 8}" y="${fr.Y(p[1]) - 8}" width="16" height="16" rx="3" fill="var(--rose)" stroke="var(--panel)" stroke-width="2"/><text x="${fr.X(p[0]) + 11}" y="${fr.Y(p[1]) - 9}" class="nw13-lab">${t}</text></g>`;
  const ARCH = pts("a1 1 8, a2 2.5 5, a3 4 4, a4 6 2.5, a5 8.5 1");
  Object.assign(sh, {
    C,
    pr,
    mulberry,
    frame,
    dot,
    joinLine,
    box,
    crowd,
    fmtD,
    dom,
    archAdd,
    pruneCrowd,
    cluster,
    cen,
    dist,
    hv,
    contrib,
    ranksPer,
    avgRank,
    distRank,
    AX,
    pts,
    hvBox,
    star,
    ARCH,
  });

  // ---------- 15.1 figures ----------
  const SWARM9 = pts("A 1.5 8, B 2.5 5.5, C 4 4.5, D 3 7, E 5.5 3, F 6 6, G 8 1.5, H 7 4, I 9 5");
  /** pbest update rules side by side: one particle's moves, two personal bests. */
  const MOVES = [
    [4, 6],
    [6, 7],
    [3.5, 5.5],
    [4.5, 4],
  ];
  function pbestFig(b) {
    const fr = frame({ ...AX, h: 280 });
    let k = 0;
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Next move</button><button class="btn ghost" data-a="rs">Start again</button></div><div data-p></div><p class="nw13-legend"><span class="nw13-k violet"></span>pbest, keep oldest <span class="nw13-k amber"></span>pbest, keep newest <span class="nw13-k blue"></span>new position y</p><table class="t nw13-tbl" data-t></table>`;
    const run = () => {
      let o = [5, 5],
        n = [5, 5];
      const rows = MOVES.slice(0, k).map((y) => {
        const uo = dom(y, o),
          un = !dom(n, y);
        const r = [y, uo, un];
        if (uo) o = y;
        if (un) n = y;
        return r;
      });
      return { o, n, rows };
    };
    const draw = () => {
      const { o, n, rows } = run(),
        y = MOVES[k - 1];
      qs("[data-p]", b).innerHTML = fr.wrap(
        (y
          ? `<line x1="${fr.X(y[0])}" y1="${fr.Y(y[1])}" x2="${fr.X(n[0])}" y2="${fr.Y(n[1])}" class="draw" stroke="var(--line-2)" stroke-dasharray="4 4"/>`
          : "") +
          MOVES.slice(0, k)
            .map((m, i) => dot(fr, `y${i + 1}`, m, { c: i === k - 1 ? "blue" : "dim", r: 6 }))
            .join("") +
          dot(fr, "old", o, { c: "violet", r: 10, lab: `oldest (${o.join(", ")})` }) +
          dot(fr, "new", n, { c: "amber", r: 7, lab: `newest (${n.join(", ")})` }),
        `One particle, ${k} moves. Keep-oldest pbest at (${o.join(", ")}), keep-newest pbest at (${n.join(", ")}).`,
      );
      qs("[data-t]", b).innerHTML =
        `<tr><th>move</th><th>new y</th><th>keep oldest</th><th>keep newest</th></tr>` +
        (rows.length
          ? rows
              .map(
                ([m, uo, un], i) =>
                  `<tr${i === k - 1 ? ' class="on"' : ""}><td>${i + 1}</td><td>(${m.join(", ")})</td><td>${uo ? "<b>replace</b>" : "keep"}</td><td>${un ? "<b>replace</b>" : "keep"}</td></tr>`,
              )
              .join("")
          : `<tr><td colspan="4">Both rules start with pbest (5, 5). Press <b>Next move</b>.</td></tr>`);
    };
    qs("[data-a=nx]", b).onclick = () => ((k = Math.min(MOVES.length, k + 1)), draw());
    qs("[data-a=rs]", b).onclick = () => ((k = 0), draw());
    draw();
  }

  /** Archive against swarm over the iterations of a real run (looked up at call time from l15-workshop.js). */
  function snapFig(b) {
    const S = sh.mopsoInit(4, { cap: 0 }),
      snaps = [];
    for (let i = 0; i <= 20; i++) {
      snaps.push({ P: S.P.map((q) => q.f.slice()), A: S.A.map((a) => a.f.slice()) });
      sh.mopsoStep(S);
    }
    const fr = frame({ ...AX, h: 290 });
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-legend"><span class="nw13-k blue"></span>swarm Pₜ now <span class="nw13-k teal"></span>archive Aₜ <span class="nw13-k dash"></span>true front</p><p class="nw13-note" data-n aria-live="polite"></p>`;
    const sl = N.slider("Iteration t", 0, 20, 1, 0);
    qs("[data-c]", b).append(sl);
    const draw = (t) => {
      const s = snaps[t];
      const clip = (p) => [p[0], Math.min(10, p[1])];
      qs("[data-p]", b).innerHTML = fr.wrap(
        joinLine(fr, sh.TRUE, "line-2", "5 4") +
          s.A.map((p, i) => dot(fr, `a${i}`, clip(p), { c: "teal", lab: false, r: 6 })).join("") +
          s.P.map((p, i) => dot(fr, `p${i}`, clip(p), { c: "blue", lab: false, r: 5 })).join(""),
        `Iteration ${t}: ${s.P.length} particles and ${s.A.length} archived solutions.`,
      );
      qs("[data-n]", b).innerHTML =
        `Iteration <b>${t}</b>: the swarm has ${s.P.length} particles, the archive holds <b>${s.A.length}</b> non-dominated solutions.`;
    };
    sl.onInput(draw);
    draw(0);
  }

  /** The archive update, one comparison at a time. */
  const NEW = {
    s: [[2, 4], "Strong newcomer (2, 4)"],
    w: [[5, 4.5], "Weak newcomer (5, 4.5)"],
    t: [[7, 2], "New trade-off (7, 2)"],
  };
  function updFig(b) {
    const ids = Object.keys(ARCH),
      A = ids.map((k) => ARCH[k]);
    const fr = frame({ ...AX, h: 280 });
    let key = "s",
      k = 0;
    b.innerHTML = `<div class="controls" data-c></div><div class="controls"><button class="btn primary" data-a="nx">Next comparison</button><button class="btn ghost" data-a="rs">Start again</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const y = NEW[key][0],
        R = archAdd(A, y),
        done = k > ids.length;
      const st = (i) => (i < k ? R.log[i] : "");
      const say = {
        rm: (i) => `y dominates <b>${ids[i]}</b>: remove it.`,
        beats: (i) => `<b>${ids[i]}</b> dominates y: mark y as dominated and carry on.`,
        tie: (i) => `Neither dominates: <b>${ids[i]}</b> stays.`,
      };
      const marked = R.log.slice(0, k).includes("beats");
      const under = k && !done ? box(fr, y, S2, true, "teal") + box(fr, y, S2, false, "rose") : "";
      qs("[data-p]", b).innerHTML = fr.wrap(
        under +
          ids
            .map((id, i) =>
              st(i) === "rm" && (done || i < k - 1)
                ? ""
                : dot(fr, id, A[i], {
                    c: st(i) === "rm" ? "rose" : st(i) === "beats" ? "violet" : "teal",
                    ring: i === k - 1,
                  }),
            )
            .join("") +
          (done && !R.added ? "" : star(fr, y, done ? "y (added)" : "y")),
        `Archive a1 to a5 and the new solution y at (${y.join(", ")}). ${k} comparisons made.`,
      );
      qs("[data-n]", b).innerHTML = !k
        ? `New solution y = (${y.join(", ")}). Press <b>Next comparison</b> to check it against each archive member.`
        : done
          ? R.added
            ? `Not marked, so <b>y joins the archive</b>. It now holds ${R.A.length}.`
            : `y was marked as dominated, so <b>it is not added</b>. The archive is unchanged.`
          : `${say[R.log[k - 1]](k - 1)}${marked ? " (y is marked.)" : ""}`;
    };
    qs("[data-c]", b).append(
      N.seg(
        Object.entries(NEW).map(([v, t]) => [v, t[1]]),
        "s",
        (v) => ((key = v), (k = 0), draw()),
      ),
    );
    qs("[data-a=nx]", b).onclick = () => ((k = Math.min(ids.length + 1, k + 1)), draw());
    qs("[data-a=rs]", b).onclick = () => ((k = 0), draw());
    draw();
  }

  /** Archive size over 60 iterations with no cap, from a real run. */
  function growFig(b) {
    let seed = 2;
    b.innerHTML = `<div class="controls"><button class="btn" data-a="rr">Run again (new seed)</button></div><div data-p></div><div class="nw13-stats" data-t></div>`;
    const draw = () => {
      const S = sh.mopsoInit(seed, { cap: 0 }),
        sz = [S.A.length];
      for (let i = 0; i < 60; i++) (sh.mopsoStep(S), sz.push(S.A.length));
      const top = Math.max(50, Math.ceil(Math.max(...sz) / 50) * 50);
      const fr = frame({ xr: [0, 60], yr: [0, top], xl: "iteration", yl: "archive size", nx: 6, ny: 5, h: 240 });
      qs("[data-p]", b).innerHTML = fr.wrap(
        `<polyline class="draw" points="${sz.map((v, i) => `${fr.X(i).toFixed(1)},${fr.Y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="3"/>`,
        `Archive size over 60 iterations, from ${sz[0]} to ${sz[60]}.`,
      );
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat"><small>Start</small><b>${sz[0]}</b></div><div class="wk-stat teal"><small>After 60 iterations</small><b>${sz[60]}</b></div><div class="wk-stat amber"><small>Comparisons per new solution</small><b>${sz[60]}</b></div>`;
    };
    qs("[data-a=rr]", b).onclick = () => (seed++, draw());
    draw();
  }

  Object.assign(sh, { SWARM9, pbestFig, snapFig, updFig, growFig });
})();
