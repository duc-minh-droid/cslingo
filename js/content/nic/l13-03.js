/* l13-03: Lectures 13-14: figures for 13.5 and 13.6 (tournaments, NSGA-II, elitism, weighted sums, hypervolume, many objectives). The lessons are in l13-05.js. */
(function () {
  const N = NIC;
  const { el, qs } = N;
  const sh = NIC.shared.nicL13;
  const { mulberry, pts, dom, ranks, RC, frame, dot } = sh;
  const S2 = [1, 1];

  // ---------- 13.3 figures ----------
  const TP = pts("A 1 8, B 2 5, C 3 7, D 4 3, E 5 6, F 6 2, G 7 5, H 8 1, I 8.5 7, J 9 3.5");
  /** Pareto tournament with a comparison set of size C. */
  function tourFig(b, life) {
    const ids = Object.keys(TP),
      r = mulberry(13),
      fr = frame({ xr: [0, 10], yr: [0, 10], xl: "f₁ ← minimise", yl: "↓ minimise f₂", h: 280 });
    let cs = 2,
      last = null,
      tally = { dom: 0, all: 0 };
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const sl = N.slider("Comparison set size C", 1, 6, 1, cs);
    sl.onInput((v) => ((cs = v), (tally = { dom: 0, all: 0 }), (last = null), draw()));
    const btn = el(`<button class="btn primary">Run a tournament</button>`);
    qs("[data-c]", b).append(sl, btn);
    const ok = (k, Z) => !Z.some((z) => dom(TP[z], TP[k], S2));
    btn.onclick = () => {
      const pool = [...ids].sort(() => r() - 0.5);
      const [x, y] = pool,
        Z = pool.slice(2, 2 + cs);
      const ax = ok(x, Z),
        ay = ok(y, Z),
        by = ax !== ay;
      const win = by ? (ax ? x : y) : r() < 0.5 ? x : y;
      tally.all++;
      if (by) tally.dom++;
      last = { x, y, Z, ax, ay, win, by };
      draw();
    };
    const draw = () => {
      const t = last;
      qs("[data-p]", b).innerHTML = fr.wrap(
        ids
          .map((k) =>
            dot(fr, k, TP[k], {
              c: !t
                ? "blue"
                : k === t.x || k === t.y
                  ? k === t.win
                    ? "teal"
                    : "rose"
                  : t.Z.includes(k)
                    ? "amber"
                    : "dim",
              ring: t && k === t.win,
            }),
          )
          .join(""),
        t
          ? `Tournament between ${t.x} and ${t.y}, comparison set ${t.Z.join(", ")}. ${t.win} selected.`
          : "Ten solutions.",
      );
      qs("[data-n]", b).innerHTML = t
        ? `x = <b>${t.x}</b> ${t.ax ? "is" : "is not"} non-dominated by Z, y = <b>${t.y}</b> ${t.ay ? "is" : "is not"}. Z (orange) = ${t.Z.join(", ")}. ${t.by ? `<b>${t.win}</b> wins on dominance.` : `Same verdict for both: <b>${t.win}</b> wins a coin toss.`} Decided by dominance so far: <b>${tally.dom} of ${tally.all}</b>.`
        : "Press <b>Run a tournament</b>: two contestants are drawn, plus C others to judge them.";
    };
    draw();
  }
  /** Slide-14 bars: N = 10 parents, 10 children, fronts of 4, 3, 6, 4 and 3, then the cut. */
  function nsgaFig(b) {
    const SZ = [4, 3, 6, 4, 3];
    const CAP = [
      "Start: a population of <b>N = 10</b> parents.",
      "Selection, crossover and mutation make <b>10 children</b>. Parents and children together: <b>2N = 20</b>.",
      "<b>Fast non-dominated sort</b> splits the 20 into ranks of 4, 3, 6, 4 and 3.",
      "Ranks 0 and 1 fit whole: 4 + 3 = <b>7</b> places taken, 3 to go.",
      "Rank 2 has 6 members but only 3 places. <b>Sort it by crowding distance</b> and keep the 3 largest.",
      "The rest is <b>discarded</b>. The 10 survivors are the next parents.",
    ];
    let i = 0;
    b.innerHTML = `<div class="controls"><button class="btn ghost" data-a="bk">Back</button><button class="btn primary" data-a="nx">Next</button><span class="nw13-ctr" data-k></span></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const cell = (x, y, c, o = "") =>
      `<rect x="${x}" y="${y}" width="44" height="11" rx="3" fill="var(--${c})" fill-opacity="${o || 0.75}" stroke="var(--panel)"/>`;
    const draw = () => {
      let s = "";
      const col = (x, n, f, lab) => {
        for (let k = 0; k < n; k++) s += f(k, x, 26 + k * 12);
        s += `<text x="${x + 22}" y="18" class="nw13-tk">${lab}</text>`;
      };
      col(20, i >= 1 ? 20 : 10, (k, x, y) => cell(x, y, k < 10 ? "violet" : "amber"), i >= 1 ? "2N" : "N");
      if (i >= 2) {
        const rk = SZ.flatMap((n, r) => Array(n).fill(r));
        col(150, 20, (k, x, y) => cell(x, y, RC[rk[k]]), "ranks");
        SZ.reduce((y, n, r) => {
          s += `<text x="200" y="${26 + (y + n / 2) * 12 + 4}" class="nw13-tk" style="text-anchor:start">rank ${r}</text>`;
          return y + n;
        }, 0);
      }
      if (i >= 3) {
        const keep = i >= 4 ? 10 : 7;
        const rk = SZ.flatMap((n, r) => Array(n).fill(r));
        col(300, keep, (k, x, y) => cell(x, y, RC[rk[k]]), "next N");
        if (i >= 4)
          s += `<rect x="146" y="${26 + 7 * 12 - 2}" width="52" height="${6 * 12 + 2}" rx="5" fill="none" stroke="var(--text)" stroke-width="2" stroke-dasharray="5 3"/>`;
        if (i >= 5)
          s += `<rect x="146" y="${26 + 10 * 12 - 1}" width="52" height="${10 * 12}" rx="5" fill="var(--rose)" fill-opacity=".25"/><text x="172" y="${26 + 20 * 12 + 14}" class="nw13-tk" style="fill:var(--rose-ink)">discarded</text>`;
      }
      s += `<line x1="0" y1="${26 + 10 * 12 - 1}" x2="420" y2="${26 + 10 * 12 - 1}" stroke="var(--text-dim)" stroke-dasharray="4 4"/>`;
      qs("[data-p]", b).innerHTML =
        `<svg class="fig" viewBox="0 0 420 300" style="max-height:300px" role="img" aria-label="NSGA-II step ${i + 1} of 6. ${CAP[i].replace(/<[^>]+>/g, "")}">${s}</svg>`;
      qs("[data-n]", b).innerHTML = CAP[i];
      qs("[data-k]", b).textContent = `${i + 1} / ${CAP.length}`;
      qs("[data-a=bk]", b).disabled = i === 0;
      qs("[data-a=nx]", b).disabled = i === CAP.length - 1;
    };
    qs("[data-a=nx]", b).onclick = () => ((i = Math.min(5, i + 1)), draw());
    qs("[data-a=bk]", b).onclick = () => ((i = Math.max(0, i - 1)), draw());
    draw();
  }
  /** Elitist or not: four parents and four children, each labelled with its rank; who survives? */
  function elitFig(b) {
    const par = [0, 0, 1, 2],
      kid = [1, 1, 2, 3];
    b.innerHTML = `<div class="controls" data-c></div><div class="nw13-elit" data-d></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = (m) => {
      const all = [...par.map((r) => ["parent", r]), ...kid.map((r) => ["child", r])];
      const keep =
        m === "n"
          ? [4, 5, 6, 7]
          : all
              .map((x, i) => i)
              .sort((a, c) => all[a][1] - all[c][1] || a - c)
              .slice(0, 4);
      qs("[data-d]", b).innerHTML = all
        .map(
          ([w, r], i) => `<span class="nw13-blk ${w}${keep.includes(i) ? " keep" : ""}">${w} <b>rank ${r}</b></span>`,
        )
        .join("");
      const kr = keep.map((i) => all[i][1]);
      qs("[data-n]", b).innerHTML =
        `Next generation ranks: <b>${kr.join(", ")}</b>. ${m === "n" ? "Both rank 0 parents are lost: nothing guarantees the best survive." : "Parents and children compete together, so the two rank 0 parents stay."}`;
    };
    qs("[data-c]", b).append(
      N.seg(
        [
          ["n", "Non-elitist"],
          ["e", "Elitist"],
        ],
        "n",
        draw,
      ),
    );
    draw("n");
  }
  /** Weighted sum: a weight slider tilts a straight line; the first point it touches wins. o: {pts, s, xr, yr, xl, yl, onW(w, id, seen)} */
  function wsFig(b, life, o) {
    const ids = Object.keys(o.pts),
      fr = frame({ ...o, h: o.h || 280 });
    const V = ids.map((k) => o.pts[k]);
    const lo = [0, 1].map((m) => Math.min(...V.map((p) => p[m]))),
      hi = [0, 1].map((m) => Math.max(...V.map((p) => p[m])));
    const nz = (v, m) => (o.s[m] > 0 ? (v - lo[m]) / (hi[m] - lo[m]) : (hi[m] - v) / (hi[m] - lo[m]));
    const un = (u, m) => (o.s[m] > 0 ? lo[m] + u * (hi[m] - lo[m]) : hi[m] - u * (hi[m] - lo[m]));
    const front = ranks(V, o.s),
      seen = new Set();
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const sl = N.slider(o.label || "Weight on f₁", 0, 1, 0.05, 0.5, (v) => v.toFixed(2));
    qs("[data-c]", b).append(sl);
    const draw = (w) => {
      const sc = V.map((p) => w * nz(p[0], 0) + (1 - w) * nz(p[1], 1));
      const best = sc.indexOf(Math.min(...sc)),
        v = sc[best];
      seen.add(ids[best]);
      const ln = (
        w > 0.999
          ? [
              [v, -0.3],
              [v, 1.3],
            ]
          : [-0.3, 1.3].map((u) => [u, (v - w * u) / (1 - w)])
      )
        .map(([u1, u2]) => `${fr.X(un(u1, 0)).toFixed(1)},${fr.Y(un(u2, 1)).toFixed(1)}`)
        .join(" ");
      qs("[data-p]", b).innerHTML = fr.wrap(
        `<clipPath id="nw13c"><rect x="${fr.p.l}" y="${fr.p.t}" width="${fr.w - fr.p.l - fr.p.r}" height="${fr.h - fr.p.t - fr.p.b}"/></clipPath><polyline points="${ln}" stroke="var(--amber)" stroke-width="3" fill="none" clip-path="url(#nw13c)"/>` +
          ids
            .map((k, i) =>
              dot(fr, k, V[i], {
                c: i === best ? "amber" : front[i] ? "dim" : seen.has(k) ? "teal" : "violet",
                ring: i === best,
              }),
            )
            .join(""),
        `Weighted sum with weight ${w.toFixed(2)} on the first objective picks ${ids[best]}.`,
      );
      const miss = ids.filter((k, i) => !front[i] && !seen.has(k));
      qs("[data-n]", b).innerHTML =
        `Weight ${w.toFixed(2)} picks <b>${ids[best]}</b> (orange). Front points found so far (green): <b>${[...seen].join(", ")}</b>.${miss.length ? ` Not found yet (purple): ${miss.join(", ")}.` : ""}`;
      if (o.onW) o.onW(w, ids[best], seen, miss);
    };
    sl.onInput(draw);
    draw(0.5);
  }
  sh.wsFig = wsFig;
  const DENT = pts("U1 1 9, U2 2 5.5, U3 3.5 4.8, U4 5 4.3, U5 6.5 2, U6 9 1");
  /** The offshore front as cost against power, with the hypervolume it covers up to a reference point. */
  function windFig(b) {
    const cost = (p) => +(0.6 * p + 0.06 * p * p).toFixed(1);
    const RUNS = {
      a: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((p) => [p, cost(p)]),
      b: [0, 1, 2, 3, 19, 20, 21].map((p) => [p, cost(p)]),
    };
    const fr = frame({ xr: [0, 25], yr: [0, 50], xl: "power (MW) →", yl: "↓ cost (£m)", h: 290 });
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><div class="nw13-stats" data-t></div>`;
    const draw = (k) => {
      const R = RUNS[k],
        q = [...R].sort((a, c) => c[0] - a[0]);
      let area = 0,
        prev = 50,
        sh2 = "";
      q.forEach(([p, c]) => {
        area += p * (prev - c);
        sh2 += `<rect x="${fr.X(0)}" y="${fr.Y(prev)}" width="${fr.X(p) - fr.X(0)}" height="${fr.Y(c) - fr.Y(prev)}" fill="var(--teal)" fill-opacity=".18"/>`;
        prev = c;
      });
      qs("[data-p]", b).innerHTML = fr.wrap(
        sh2 +
          R.map((p, i) => dot(fr, i, p, { c: "teal", lab: false, r: 6 })).join("") +
          `<g class="fi"><circle cx="${fr.X(22)}" cy="${fr.Y(0)}" r="8" fill="none" stroke="var(--rose)" stroke-width="3"/><text x="${fr.X(22) - 10}" y="${fr.Y(0) - 12}" class="nw13-lab" style="text-anchor:end;fill:var(--rose-ink)">ideal, infeasible</text><text x="${fr.X(0) + 12}" y="${fr.Y(0) - 10}" class="nw13-lab">cheapest, least power</text><text x="${fr.X(22) - 6}" y="${fr.Y(42.2) - 10}" class="nw13-lab" style="text-anchor:end">most power, most expensive</text></g>`,
        `Front of a wind farm run: cost rises faster and faster as power grows. Shaded: the hypervolume, ${Math.round((area / 1100) * 100)} percent of the box.`,
      );
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat teal"><small>Hypervolume (share of the box)</small><b>${Math.round((area / 1100) * 100)}%</b></div><div class="wk-stat"><small>Points</small><b>${R.length}</b></div>`;
    };
    qs("[data-c]", b).append(
      N.seg(
        [
          ["a", "Run A: spread"],
          ["b", "Run B: clumped"],
        ],
        "a",
        draw,
      ),
    );
    draw("a");
  }
  /** Many objectives: the share of the space that can be compared with a point shrinks as 2 / 2^M. */
  function manyFig(b) {
    b.innerHTML = `<div class="controls" data-c></div><div class="nw13-many" data-d></div><div class="nw13-stats" data-t></div>`;
    const sl = N.slider("Objectives M", 2, 8, 1, 2);
    qs("[data-c]", b).append(sl);
    const draw = (M) => {
      const one = 100 / 2 ** M;
      qs("[data-d]", b).innerHTML =
        `<span class="nw13-seg teal" style="flex:${one}">${one >= 6 ? "better" : ""}</span><span class="nw13-seg rose" style="flex:${one}">${one >= 6 ? "worse" : ""}</span><span class="nw13-seg grey" style="flex:${100 - 2 * one}">incomparable</span>`;
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat amber"><small>Incomparable share</small><b>${(100 - 2 * one).toFixed(1)}%</b></div><div class="wk-stat blue"><small>Points for 5 per axis</small><b>${(5 ** (M - 1)).toLocaleString("en-GB")}</b></div>`;
    };
    sl.onInput(draw);
    draw(2);
  }
  /** Parallel coordinates: one axis per objective, one line per layout. */
  function pcFig(b) {
    const AXES = [
      ["Turbines", 20, 60, 1],
      ["Area", 10, 40, 1],
      ["Cable", 30, 90, 1],
      ["Energy cost", 40, 80, 1],
      ["Energy", 300, 900, -1],
      ["Efficiency", 80, 95, -1],
    ];
    const LAY = {
      W1: [24, 12, 35, 72, 360, 93],
      W2: [40, 22, 55, 55, 620, 89],
      W3: [58, 38, 85, 48, 880, 84],
      W4: [50, 20, 70, 60, 700, 82],
    };
    const cols = { W1: "blue", W2: "teal", W3: "violet", W4: "amber" };
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const X = (i) => 34 + i * 74,
      Y = (i, v) => 30 + (1 - (v - AXES[i][1]) / (AXES[i][2] - AXES[i][1])) * 180;
    const draw = (sel) => {
      const ax = AXES.map(
        ([t, lo, hi, s], i) =>
          `<line x1="${X(i)}" y1="30" x2="${X(i)}" y2="210" class="nw13-ax"/><text x="${X(i)}" y="232" class="nw13-tk">${t}</text><text x="${X(i)}" y="248" class="nw13-tk">${s > 0 ? "minimise" : "maximise"}</text><text x="${X(i) + 4}" y="26" class="nw13-tk" style="text-anchor:start">${hi}</text><text x="${X(i) + 4}" y="222" class="nw13-tk" style="text-anchor:start">${lo}</text>`,
      ).join("");
      const ln = Object.entries(LAY)
        .map(
          ([k, v]) =>
            `<polyline points="${v.map((x, i) => `${X(i)},${Y(i, x).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--${cols[k]})" stroke-width="${k === sel ? 5 : 2.5}" opacity="${!sel || k === sel ? 1 : 0.25}" class="draw"/>`,
        )
        .join("");
      qs("[data-p]", b).innerHTML =
        `<svg class="fig" viewBox="0 0 440 256" style="max-height:280px" role="img" aria-label="Parallel coordinate plot: six vertical axes, one per objective, and four layouts drawn as lines crossing every axis.">${ax}${ln}</svg>`;
      qs("[data-n]", b).innerHTML = sel
        ? `<b>${sel}</b>: ${AXES.map(([t], i) => `${t} ${LAY[sel][i]}${["", " km²", " km", " £/MWh", " GWh a year", "%"][i]}`).join(", ")}.`
        : "Pick a layout to follow its line across all six objectives.";
    };
    qs("[data-c]", b).append(
      N.seg(
        Object.keys(LAY).map((k) => [k, k]),
        "",
        draw,
      ),
    );
    draw("");
  }

  Object.assign(sh, { tourFig, nsgaFig, elitFig, DENT, windFig, manyFig, pcFig });
})();
