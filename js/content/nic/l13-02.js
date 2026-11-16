/* l13-02: Lectures 13-14: 13.2 ranking the population: non-dominated sorting, niching and crowding distance. */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL13;
  const { C, pr, mulberry, pts, ranks, RC, frame, dot, joinLine } = sh;

  /** NSGA-II crowding distance of each index in idx (one front): ends get Infinity, inner points add the normalised gap between their neighbours, per objective. */
  function crowd(P, idx) {
    const d = {};
    idx.forEach((i) => (d[i] = 0));
    for (let m = 0; m < P[idx[0]].length; m++) {
      const o = [...idx].sort((a, b) => P[a][m] - P[b][m]);
      const span = P[o[o.length - 1]][m] - P[o[0]][m] || 1;
      d[o[0]] = d[o[o.length - 1]] = Infinity;
      for (let k = 1; k < o.length - 1; k++) d[o[k]] += (P[o[k + 1]][m] - P[o[k - 1]][m]) / span;
    }
    return d;
  }
  const fmtD = (v) => (v === Infinity ? "∞" : v.toFixed(2));
  /** Crowding distance of every point within its own rank. */
  const crowdAll = (P, r) => {
    const out = P.map(() => 0);
    for (let k = 0; k <= Math.max(...r); k++) {
      const idx = P.map((_, i) => i).filter((i) => r[i] === k);
      const d = crowd(P, idx);
      idx.forEach((i) => (out[i] = d[i]));
    }
    return out;
  };
  Object.assign(sh, { crowd, fmtD, crowdAll });

  const S2 = [1, 1];
  const AX = { xr: [0, 10], yr: [0, 10], xl: "f₁ ← minimise", yl: "↓ minimise f₂" };
  const PEEL = pts("a 1 9, b 2 6, c 4 4, d 7 2, e 9 1, f 3 8, g 5 6, h 8 4, i 6 8, j 9 6, k 4 9.5, l 8 8");
  const rankedSVG = (P, upto, o = {}) => {
    const ids = Object.keys(P),
      V = ids.map((k) => P[k]),
      r = ranks(V, S2),
      fr = frame({ ...AX, ...o });
    let s = "";
    for (let k = 0; k <= Math.min(upto, Math.max(...r)); k++)
      s += joinLine(
        fr,
        V.filter((_, i) => r[i] === k),
        RC[k % 5],
      );
    s += ids
      .map((id, i) => dot(fr, id, V[i], { c: r[i] <= upto ? RC[r[i] % 5] : "dim", lab: o.lab ? o.lab(id, i, r) : id }))
      .join("");
    return { svg: fr.wrap(s, o.say || `Points coloured by rank, ranks 0 to ${upto} shown.`), r, ids };
  };

  /** Step-through peel: each press finds the non-dominated set of what is left and gives it the next rank. */
  function peelFig(b, P = PEEL) {
    let k = -1;
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Peel the next front</button><button class="btn ghost" data-a="rs">Start again</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const R = rankedSVG(P, k, { say: `Non-dominated sorting, ${k + 1} fronts peeled so far.` });
      qs("[data-p]", b).innerHTML = R.svg;
      const top = Math.max(...R.r);
      qs("[data-n]", b).innerHTML =
        k < 0
          ? "Nothing ranked yet. Find the points that nobody dominates."
          : `Rank ${k}: <b>${R.ids.filter((_, i) => R.r[i] === k).join(", ")}</b>. ${k < top ? `Remove them; ${R.r.filter((x) => x > k).length} points left.` : "Everyone is ranked."}`;
      qs("[data-a=nx]", b).disabled = k >= top;
    };
    qs("[data-a=nx]", b).onclick = () => (k++, draw());
    qs("[data-a=rs]", b).onclick = () => ((k = -1), draw());
    draw();
  }

  /** Slide-10 style: two non-dominated candidates, one in a crowd and one alone. */
  const tieFig = () => {
    const fr = frame({ ...AX, h: 280 });
    const front = [
      [1, 8.4],
      [1.3, 7.6],
      [1.9, 6.5],
      [6, 2.1],
      [6.7, 1.8],
      [7.4, 1.5],
      [8.1, 1.3],
    ];
    const blk = [1.55, 7.0],
      grn = [3.8, 3.6];
    const ring = (p, c, n) =>
      `<circle cx="${fr.X(p[0])}" cy="${fr.Y(p[1])}" r="${fr.X(1.2) - fr.X(0)}" fill="var(--${c})" fill-opacity=".1" stroke="var(--${c})" stroke-dasharray="5 4" class="fi"/><text x="${fr.X(p[0]) + 36}" y="${fr.Y(p[1]) + 4}" class="nw13-lab" style="fill:var(--${c}-ink)">${n} close by</text>`;
    const near = (p) => front.filter((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1.2).length;
    return fr.wrap(
      ring(blk, "rose", near(blk)) +
        ring(grn, "teal", near(grn)) +
        [
          [4, 7],
          [5.5, 6],
          [7, 5],
          [8, 7.5],
        ]
          .map((p, i) => dot(fr, "x" + i, p, { c: "dim", lab: false }))
          .join("") +
        front.map((p, i) => dot(fr, "f" + i, p, { c: "violet", lab: false })).join("") +
        dot(fr, "black", blk, { c: "text", lab: "crowded" }) +
        dot(fr, "green", grn, { c: "teal", lab: "lonely" }),
      `Both candidates are on the front. The crowded one has ${near(blk)} front points close by, the lonely one has ${near(grn)}.`,
    );
  };

  /** Niching: a radius slider draws a circle round each front point and counts the points inside it. */
  function nicheFig(b, life) {
    const P = [
      [1, 9],
      [1.5, 7.6],
      [2, 6.6],
      [2.6, 5.6],
      [4.4, 3.6],
      [7, 2],
      [7.6, 1.7],
      [8.2, 1.4],
      [9, 1.1],
    ];
    const fr = frame({ ...AX, h: 280 });
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const sl = N.slider("Niche radius", 0.4, 12, 0.4, 1.2, (v) => v.toFixed(1));
    qs("[data-c]", b).append(sl);
    const draw = (rad) => {
      const cnt = P.map((p) => P.filter((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) <= rad).length);
      const lo = Math.min(...cnt),
        rr = fr.X(rad) - fr.X(0);
      qs("[data-p]", b).innerHTML = fr.wrap(
        P.map(
          (p) =>
            `<circle cx="${fr.X(p[0])}" cy="${fr.Y(p[1])}" r="${rr}" fill="var(--blue)" fill-opacity=".05" stroke="var(--blue)" stroke-opacity=".5"/>`,
        ).join("") +
          P.map((p, i) =>
            dot(fr, i, p, { c: cnt[i] === lo ? "teal" : "violet", lab: String(cnt[i]), ring: cnt[i] === lo }),
          ).join(""),
        `Nine front points, each labelled with how many points lie inside its niche radius of ${rad.toFixed(1)}.`,
      );
      qs("[data-n]", b).innerHTML =
        lo === Math.max(...cnt)
          ? `Every niche holds <b>${lo}</b>: the radius cannot tell anyone apart.`
          : `Fewest in a niche: <b>${lo}</b> (green). The tie-break prefers those points.`;
    };
    sl.onInput(draw);
    draw(1.2);
  }

  /** Crowding distance, one objective at a time, on the worked front P..T. Each frame adds one side of a point's cuboid. */
  const W = pts("P 1 9, Q 2 6, R 3 5, S 6 2, T 9 1");
  function crowdFrames() {
    const ids = Object.keys(W),
      V = ids.map((k) => W[k]);
    const fs = [],
      d = { P: 0, Q: 0, R: 0, S: 0, T: 0 };
    for (let m = 0; m < 2; m++) {
      const o = [...ids].sort((a, b) => W[a][m] - W[b][m]);
      const span = W[o[4]][m] - W[o[0]][m];
      d[o[0]] = d[o[4]] = Infinity;
      fs.push({
        m,
        d: { ...d },
        cap: `Sort by f${m ? "₂" : "₁"}: ${o.join(", ")}. The two ends get <b>∞</b>, so they are always kept.`,
      });
      for (let k = 1; k < 4; k++) {
        const add = (W[o[k + 1]][m] - W[o[k - 1]][m]) / span;
        d[o[k]] += add;
        fs.push({
          m,
          cur: o[k],
          nb: [o[k - 1], o[k + 1]],
          d: { ...d },
          cap: `<b>${o[k]}</b>: its neighbours on f${m ? "₂" : "₁"} are ${o[k - 1]} and ${o[k + 1]}, gap ${W[o[k + 1]][m] - W[o[k - 1]][m]} out of the range ${span}, so add <b>${add.toFixed(2)}</b>.`,
        });
      }
    }
    fs.push({ d: { ...d }, cap: "Done. The biggest finite distance, <b>S</b>, has the most room around it." });
    return { fs, ids, V };
  }
  function crowdFig(b) {
    const { fs, ids, V } = crowdFrames();
    const fr = frame({ ...AX, h: 270 });
    let i = 0;
    b.innerHTML = `<div class="controls"><button class="btn ghost" data-a="bk">Back</button><button class="btn primary" data-a="nx">Next</button><span class="nw13-ctr" data-k></span></div><div class="grid two nw13-g"><div data-p></div><div data-t></div></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const f = fs[i];
      let cub = "";
      if (f.cur) {
        const [a, c] = f.nb.map((k) => W[k]);
        cub = `<rect x="${fr.X(a[0])}" y="${fr.Y(a[1])}" width="${fr.X(c[0]) - fr.X(a[0])}" height="${fr.Y(c[1]) - fr.Y(a[1])}" fill="var(--amber)" fill-opacity=".14" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 4"/>`;
      }
      qs("[data-p]", b).innerHTML = fr.wrap(
        cub + joinLine(fr, V) + ids.map((k, n) => dot(fr, k, V[n], { c: "teal", ring: k === f.cur })).join(""),
        `Front of five points P to T. ${f.cur ? `Working on ${f.cur}.` : ""}`,
      );
      qs("[data-t]", b).innerHTML =
        `<table class="t nw13-tbl"><tr><th>Point</th><th>(f₁, f₂)</th><th>Distance</th></tr>${ids.map((k, n) => `<tr class="${k === f.cur ? "on" : ""}"><td><b>${k}</b></td><td>(${V[n].join(", ")})</td><td>${fmtD(f.d[k])}</td></tr>`).join("")}</table>`;
      qs("[data-n]", b).innerHTML = f.cap;
      qs("[data-k]", b).textContent = `${i + 1} / ${fs.length}`;
      qs("[data-a=bk]", b).disabled = i === 0;
      qs("[data-a=nx]", b).disabled = i === fs.length - 1;
    };
    qs("[data-a=nx]", b).onclick = () => ((i = Math.min(fs.length - 1, i + 1)), draw());
    qs("[data-a=bk]", b).onclick = () => ((i = Math.max(0, i - 1)), draw());
    draw();
  }

  /** The crowded-comparison duel: rank first, crowding distance second. */
  function duelFig(b) {
    const D = {
      a: [
        ["X", 0, 0.4],
        ["Y", 1, Infinity],
      ],
      b: [
        ["X", 2, 0.9],
        ["Y", 2, 1.6],
      ],
      c: [
        ["X", 1, Infinity],
        ["Y", 1, 0.7],
      ],
    };
    b.innerHTML = `<div class="controls" data-c></div><div class="nw13-duel" data-d></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = (k) => {
      const [x, y] = D[k],
        w = x[1] !== y[1] ? (x[1] < y[1] ? x : y) : x[2] > y[2] ? x : y;
      qs("[data-d]", b).innerHTML = [x, y]
        .map(
          (c) =>
            `<div class="nw13-card fi${c === w ? " win" : ""}"><b>${c[0]}</b><span>rank ${c[1]}</span><span>distance ${fmtD(c[2])}</span>${c === w ? "<em>selected</em>" : ""}</div>`,
        )
        .join('<div class="nw13-vs">vs</div>');
      qs("[data-n]", b).innerHTML =
        x[1] !== y[1]
          ? `Different ranks: the lower rank wins, whatever the distances say.`
          : `Same rank: the larger crowding distance wins, because it sits in an emptier part of the front.`;
    };
    qs("[data-c]", b).append(
      N.seg(
        [
          ["a", "Duel 1"],
          ["b", "Duel 2"],
          ["c", "Duel 3"],
        ],
        "a",
        draw,
      ),
    );
    draw("a");
  }

  /** The sandbox: a random population, peeled front by front, with crowding distances on demand. */
  function sortDemo(root, life) {
    let seed = 7,
      P,
      k,
      showD = false;
    const card = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>Sort and crowd</h2></div><div class="controls"><button class="btn primary" data-a="peel">Peel next front</button><button class="btn" data-a="crowd">Show crowding</button><button class="btn ghost" data-a="new">New population</button></div><div data-p></div><div class="nw13-stats" data-t></div></div>`,
    );
    root.appendChild(card);
    const fresh = () => {
      const r = mulberry(seed);
      const V = Array.from({ length: 14 }, () => [0.5 + r() * 9, 0.5 + r() * 9].map((v) => Math.round(v * 2) / 2));
      P = Object.fromEntries(V.map((v, i) => [String.fromCharCode(65 + i), v]));
      k = -1;
    };
    const draw = () => {
      const ids = Object.keys(P),
        V = ids.map((x) => P[x]),
        r = ranks(V, S2),
        d = crowdAll(V, r);
      const R = rankedSVG(P, k, {
        h: 320,
        lab: (id, i) => (showD && r[i] <= k ? `${id} ${fmtD(d[i])}` : id),
        say: `Population of 14 points, ${k + 1} fronts peeled.`,
      });
      qs("[data-p]", card).innerHTML = R.svg;
      qs("[data-t]", card).innerHTML =
        `<div class="wk-stat"><small>Fronts peeled</small><b>${k + 1} of ${Math.max(...r) + 1}</b></div><div class="wk-stat teal"><small>Rank 0 size</small><b>${r.filter((x) => x === 0).length}</b></div><div class="wk-stat blue"><small>Not ranked yet</small><b>${r.filter((x) => x > k).length}</b></div>`;
      qs("[data-a=peel]", card).disabled = k >= Math.max(...r);
    };
    qs("[data-a=peel]", card).onclick = () => (k++, draw());
    qs("[data-a=crowd]", card).onclick = (e) => {
      showD = !showD;
      e.target.textContent = showD ? "Hide crowding" : "Show crowding";
      draw();
    };
    qs("[data-a=new]", card).onclick = () => (seed++, fresh(), draw());
    fresh();
    draw();
  }

  N.register({
    id: "l13-sorting",
    lecture: 13,
    order: 2,
    num: "13.2",
    title: "Ranking: non-dominated sorting and crowding",
    blurb: "Peel the population into fronts, then break ties inside a front by how crowded each point is.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Fourteen random solutions, both objectives minimised. Press <b>Peel next front</b> to rank them front by front, then <b>Show crowding</b> to see the tie-breaker NSGA-II uses inside a front.",
        ),
      );
      sortDemo(root, life);
      root.appendChild(
        pr(
          "l13-sorting-1",
          "Peel two fronts. Pick any point in rank 1. What is always true of it? | At least one rank 0 point dominates it | It dominates every point of rank 2 | No rank 0 point dominates it | It was dominated before rank 0 was removed, and whoever beat it is either in rank 0 or is itself beaten by a rank 0 point. Dominance passes along, so some rank 0 point beats it.",
        ),
      );
      root.appendChild(
        pr(
          "l13-sorting-2",
          "Peel one front and press <b>Show crowding</b>. Which rank 0 points get ∞? | The two ends: lowest f₁ and lowest f₂ | The point nearest the middle of the front | Every point that has no close neighbour | The ends have a neighbour on one side only, so NSGA-II gives them an infinite distance. That keeps the extremes, which widens the front.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Non-dominated sorting</b>: rank 0 is the non-dominated set; remove it, and the next non-dominated set is rank 1, and so on.",
            "Inside a rank, solutions are tied. Break ties to keep a good <b>spread</b>: prefer the solution in the emptier region.",
            "<b>Niching</b> counts neighbours within a <b>niche radius</b>, a new parameter to tune.",
            "<b>Crowding distance</b> adds the normalised gaps between each point's neighbours, objective by objective; the ends get ∞. No extra parameter.",
          ],
          "Rank first, then prefer the lonely.",
        ),
      );
    },
  });

  L["l13-sorting"] = {
    sum: "Non-dominated sorting peels the population into ranked fronts. Ties within a front are broken in favour of spread, by niching (needs a niche radius) or by NSGA-II's crowding distance (no parameter).",
    steps: [
      {
        t: "Ranking everyone, not just the best",
        b: `<p>Dominance finds the best solutions, but selection must also compare the rest. <b>Non-dominated sorting</b> ranks the whole population. Find the non-dominated set: that is <b>rank 0</b>. Set it aside and find the non-dominated set of what is left: <b>rank 1</b>. Repeat until everyone has a rank.</p><p>Here twelve points fall into four fronts. A lower rank is better, so rank plays the part fitness played in Lecture 3.</p>`,
        v: rankedSVG(PEEL, 3, {
          say: "Twelve points in four fronts: rank 0 green, rank 1 blue, rank 2 purple, rank 3 orange.",
        }).svg,
        c: C(
          "Point Z is in rank 2. What does that tell you? | Rank 0 and rank 1 had to be removed before nobody dominated Z | Z is dominated by exactly two points of the population | Z is two units away from the front on the f₁ axis | A rank counts peeling rounds, not points or distances. Z only became non-dominated once ranks 0 and 1 were gone.",
        ),
      },
      {
        t: "Watch the fronts peel",
        b: `<p>Press the button to peel one front at a time. Each round asks the same question of the points that are left: <b>who does nobody dominate?</b></p><p>Point <b>g</b> at $(5, 6)$ is beaten by $c = (4, 4)$, so it waits for round two. Once rank 0 is gone, nothing left beats it.</p><details class="math-more"><summary>Show the maths</summary><p>Peeling naively compares every pair in every round: up to $N$ rounds of $O(MN^2)$ checks, so $O(MN^3)$ for $N$ solutions and $M$ objectives. NSGA-II's <b>fast non-dominated sort</b> compares each pair once, storing for every solution $p$ a count $n_p$ of who dominates it and a list $S_p$ of whom it dominates:</p>$$\\text{rank 0}=\\{p: n_p=0\\},\\qquad \\text{then for } q\\in S_p:\\ n_q\\leftarrow n_q-1$$<p>Points whose count drops to 0 form the next front. The cost is $O(MN^2)$.</p></details>`,
        v: (b) => peelFig(b),
        c: C(
          "Minimising both, the points are (1, 5), (2, 2), (3, 4) and (4, 1). Which are in rank 0? | (1, 5), (2, 2) and (4, 1) | (2, 2) and (4, 1) only | All four points | (3, 4) is beaten by (2, 2) on both objectives. The other three each win on one objective against every rival.",
          "Check each point: is there another point that is lower on both?",
        ),
      },
      {
        t: "Ties inside a front",
        b: `<p>A dominance tournament has a weak spot: two solutions from the same front are <b>mutually non-dominated</b>, whatever you compare them with. Something else must break the tie.</p><p>Look at the two candidates. Both are on the front, but the crowded one has two other front points close by, while the lonely one has none. Picking the <b>lonely</b> one fills the gap and spreads the front.</p>`,
        v: tieFig(),
        c: C(
          "A tournament draws two non-dominated solutions. One sits in a dense cluster, the other in an empty stretch of the front. Which should win? | The one in the empty stretch, to keep the front spread out | The one in the dense cluster, since many solutions agree with it | Either one at random, since the tie cannot be broken | The aim is an evenly spread front. Choosing from sparse regions pushes the population to cover the gaps.",
        ),
      },
      {
        t: "Niching",
        b: `<p><b>Niching</b> splits the space into niches and prefers individuals in a niche with <b>fewer</b> members. Draw a circle of the <b>niche radius</b> round each point and count who is inside, itself included. With radius 1.2, a point on its own scores 1 and a point in a tight cluster scores 3 or 4.</p><p>Slide the radius. Too small and everyone scores 1; at 12 every circle holds all nine points. Either way the tie-break goes blind, so the radius is a <b>new parameter</b> to tune.</p><details class="math-more"><summary>Show the maths</summary><p>With niche radius $\\sigma$ and distance $d_{ij}$ between solutions $i$ and $j$, the niche count is</p>$$m_i=\\sum_{j}\\,[\\,d_{ij}\\le\\sigma\\,]$$<p>where $[\\cdot]$ is 1 when true and 0 otherwise. Prefer the smaller $m_i$. Classic fitness sharing uses a smooth version that falls from 1 to 0 as $d_{ij}$ grows to $\\sigma$.</p></details>`,
        v: (b, life) => nicheFig(b, life),
        c: C(
          "The niche radius is set so large that every circle holds the whole front. What happens to the tie-break? | Every niche count is equal, so it can no longer prefer anyone | It now always picks the end points of the front | It works better, because each count includes more points | When every count is the same the counts carry no information, so ties are back to random.",
        ),
      },
      {
        t: "Crowding distance",
        b: `<p>NSGA-II uses <b>crowding distance</b> instead. For each point on a front, look at its two neighbours along each objective: they form a box (the cuboid) round it. Add up the box's sides, each divided by that objective's range. A big total means plenty of room.</p><p>For <b>Q</b> at $(2, 6)$: along $f_1$ its neighbours are P and R, gap $3 - 1 = 2$ out of a range of 8, so $0.25$. Along $f_2$ they are R and P again, gap $9 - 5 = 4$ out of 8, so $0.5$. Total $0.75$. Step through all of them.</p><details class="math-more"><summary>Show the maths</summary><p>Sort the front $Y$ of $N$ points by each objective $m$ in turn. The ends get $d_1=d_N=\\infty$; each inner point adds</p>$$d_i \\mathrel{+}= \\frac{Y^m_{i+1}-Y^m_{i-1}}{f^{\\max}_m-f^{\\min}_m},\\qquad i=2,\\dots,N-1$$<p>Dividing by the range puts objectives measured in different units on the same scale.</p></details>`,
        v: (b) => crowdFig(b),
        c: C(
          "Along both objectives, a point's neighbours are 1 apart and the range of each objective is 4. What is its crowding distance? | 0.5 | 0.25 | 2 | Each objective adds 1 ÷ 4 = 0.25, and two objectives give 0.5.",
          "Work out one objective: gap ÷ range. Then add the two.",
        ),
      },
      {
        t: "Rank first, crowding second",
        b: `<p>NSGA-II's selection compares two solutions in two steps. First the <b>rank</b>: the lower rank wins outright. Only if the ranks are equal does it look at <b>crowding distance</b>: the larger distance wins.</p><p>So a rank 0 point with a small distance still beats a rank 1 point with ∞. Try the three duels.</p>`,
        v: (b) => duelFig(b),
        c: C(
          "X is rank 1 with crowding distance 0.3. Y is rank 1 with crowding distance 1.1. Which does NSGA-II prefer? | Y, the larger distance in a tie on rank | X, the smaller distance in a tie on rank | Neither, so it tosses a coin | Equal ranks pass the decision to crowding distance, and a larger distance means a less crowded region.",
        ),
      },
      {
        t: "Crowding or niching?",
        b: `<p>Both tie-breakers reward solutions in empty regions. The difference is the cost of setting them up: niching needs a <b>niche radius</b>, and a bad choice blinds it. Crowding distance measures the room between neighbours directly, so it has <b>no extra parameter</b>.</p>`,
        v: F.compare(
          {
            title: "Niching",
            c: "violet",
            body: "count neighbours in a radius<br>prefer the smaller count<br>needs a niche radius",
          },
          {
            title: "Crowding distance",
            c: "teal",
            body: "measure the gaps to neighbours<br>prefer the larger distance<br>no extra parameter",
          },
        ),
        c: C(
          "Why is crowding distance easier to set up than niching? | It has no niche radius to choose | It needs only one objective to work | It ignores how close points are to each other | Niching depends on a radius that must be tuned. Crowding distance uses the neighbours' gaps, which the front provides.",
        ),
      },
    ],
    guide: [
      "Press <b>Peel next front</b> until every point has a rank, and watch the colours.",
      "Press <b>Show crowding</b> to label each ranked point with its crowding distance.",
      "Press <b>New population</b> and peel again: the number of fronts changes.",
      "Answer the questions after the demo.",
    ],
  };
})();
