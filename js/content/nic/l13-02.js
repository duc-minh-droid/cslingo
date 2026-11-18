/* l13-02: Lectures 13-14: figures for 13.3 and 13.4 (non-dominated sorting, niching and crowding distance) and the sort-and-crowd demo. The lessons are in l13-04.js and l13-05.js. */
(function () {
  const N = NIC;
  const { el, qs } = N;
  const sh = NIC.shared.nicL13;
  const { mulberry, pts, ranks, RC, frame, dot, joinLine } = sh;

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

  Object.assign(sh, { rankedSVG, PEEL, peelFig, tieFig, nicheFig, crowdFig, duelFig, sortDemo });
})();
