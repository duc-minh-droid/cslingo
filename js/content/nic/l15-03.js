/* l15-03: Lecture 15: 15.3 choosing leaders (random, sparse, dominated solution count, hypervolume) and many-objective PSO (average rank, distance ranking). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS;
  const sh = NIC.shared.nicL15;
  const { C, pr, mulberry, frame, dot, crowd, dom, hv, contrib, ranksPer, avgRank, distRank, AX, pts, hvBox, star } =
    sh;

  /** Archive (blue, as on the slides) and swarm particles (red squares). */
  const H = pts("a 1 8, b 2.5 6.5, c 4 4.5, d 6 3, e 7.5 1.5");
  const SW = pts("P 7 7.5, Q 9 4, R 3 3, S 2 9, T 5 5.5, U 4.5 6, V 5.5 5");
  const HI = Object.keys(H),
    HV = HI.map((k) => H[k]),
    SI = Object.keys(SW);
  const COUNT = HV.map((a) => SI.filter((s) => dom(a, SW[s])));
  const W = COUNT.map((c) => 1 / (1 + c.length)),
    WS = W.reduce((s, x) => s + x, 0);
  const pct = (x) => `${Math.round(x * 100)}%`;
  /** Each member's exclusive hypervolume box against reference r (2-D, non-dominated set). */
  function exclBoxes(fr, V, r, only = -1) {
    const Q = V.map((p, i) => [p, i])
      .filter(([p]) => dom(p, r))
      .sort((x, y) => x[0][0] - y[0][0]);
    return Q.map(([p, i], k) => {
      if (only >= 0 && i !== only) return "";
      const x2 = k + 1 < Q.length ? Q[k + 1][0][0] : r[0],
        y2 = k > 0 ? Q[k - 1][0][1] : r[1];
      return `<rect x="${fr.X(p[0])}" y="${fr.Y(y2)}" width="${fr.X(x2) - fr.X(p[0])}" height="${fr.Y(p[1]) - fr.Y(y2)}" fill="var(--text)" fill-opacity="${only >= 0 ? 0.55 : 0.3}"/>`;
    }).join("");
  }
  sh.exclBoxes = exclBoxes;
  const sq = (fr, id, p, ring) =>
    `<g class="nw13-pt" data-id="${id}"><rect x="${fr.X(p[0]) - 7}" y="${fr.Y(p[1]) - 7}" width="14" height="14" rx="3" fill="var(--rose)" stroke="${ring ? "var(--text)" : "var(--panel)"}" stroke-width="${ring ? 3 : 2}"/><text x="${fr.X(p[0]) + 10}" y="${fr.Y(p[1]) - 9}" class="nw13-lab">${id}</text></g>`;
  const arch = (fr, o = {}) =>
    HI.map((k, i) =>
      dot(fr, k, HV[i], { c: o.c ? o.c(i) : "blue", ring: o.ring === i, lab: o.lab ? o.lab(i) : k }),
    ).join("");
  const bars = (vals, best) => {
    const mx = Math.max(0.01, ...vals);
    return `<div class="nw15-bars">${HI.map((k, i) => `<div class="nw15-bar${i === best ? " on" : ""}"><span style="height:${Math.round((vals[i] / mx) * 70)}px"></span><b>${k}</b><small>${pct(vals[i])}</small></div>`).join("")}</div>`;
  };

  /** Draw leaders at random (or by a sparse tournament) and tally them. */
  function tallyFig(b, modes) {
    let m = modes[0],
      r = mulberry(7),
      T = HV.map(() => 0),
      last = -1;
    const fr = frame({ ...AX, h: 260 }),
      d = crowd(
        HV,
        HV.map((_, i) => i),
      );
    const ptc = [8, 9];
    b.innerHTML = `<div class="controls" data-c></div><div class="controls"><button class="btn primary" data-a="one">Pick a leader</button><button class="btn" data-a="many">Pick 100 more</button></div><div data-p></div><div data-b></div>`;
    const pick = () => {
      const i = Math.floor(r() * 5),
        j = Math.floor(r() * 5);
      return m === "rand" ? i : d[i] >= d[j] ? i : j;
    };
    const draw = () => {
      const n = T.reduce((s, x) => s + x, 0);
      qs("[data-p]", b).innerHTML = fr.wrap(
        (last >= 0
          ? `<line x1="${fr.X(ptc[0])}" y1="${fr.Y(ptc[1])}" x2="${fr.X(HV[last][0])}" y2="${fr.Y(HV[last][1])}" class="draw" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="6 4"/>`
          : "") +
          arch(fr, { ring: last }) +
          star(fr, ptc, "particle"),
        `Archive a to e and one particle. ${n} leaders picked.`,
      );
      qs("[data-b]", b).innerHTML = bars(
        T.map((x) => (n ? x / n : 0)),
        -1,
      );
    };
    const add = (k) => {
      for (let i = 0; i < k; i++) T[(last = pick())]++;
      draw();
    };
    if (modes.length > 1)
      qs("[data-c]", b).append(
        N.seg(
          [
            ["rand", "Random"],
            ["sparse", "Prefer sparse"],
          ],
          m,
          (v) => ((m = v), (r = mulberry(7)), (T = HV.map(() => 0)), (last = -1), draw()),
        ),
      );
    qs("[data-a=one]", b).onclick = () => add(1);
    qs("[data-a=many]", b).onclick = () => add(100);
    draw();
  }

  /** Slide 9: links from each archive member to the swarm particles it dominates. */
  function countFig(b) {
    const fr = frame({ ...AX, h: 290 });
    let sel = -1;
    b.innerHTML = `<div data-p></div><div data-b></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const links = HV.map((a, i) =>
        COUNT[i]
          .map(
            (s) =>
              `<line x1="${fr.X(a[0])}" y1="${fr.Y(a[1])}" x2="${fr.X(SW[s][0])}" y2="${fr.Y(SW[s][1])}" stroke="var(--${sel === i ? "violet" : "line-2"})" stroke-width="${sel === i ? 2.5 : 1.5}" stroke-dasharray="4 4"/>`,
          )
          .join(""),
      ).join("");
      qs("[data-p]", b).innerHTML = fr.wrap(
        links +
          SI.map((s) => sq(fr, s, SW[s])).join("") +
          arch(fr, { ring: sel, lab: (i) => `${HI[i]} (${COUNT[i].length})` }),
        `Archive a to e with the number of swarm particles each dominates: ${HI.map((k, i) => `${k} ${COUNT[i].length}`).join(", ")}.`,
      );
      qs("[data-b]", b).innerHTML = bars(
        W.map((w) => w / WS),
        sel,
      );
      qs("[data-n]", b).innerHTML =
        sel < 0
          ? "Tap an archive member to light up the particles it dominates."
          : `<b>${HI[sel]}</b> dominates ${COUNT[sel].length ? `<b>${COUNT[sel].join(", ")}</b>` : "nobody"}: weight 1 ÷ (1 + ${COUNT[sel].length}), chance ${pct(W[sel] / WS)}.`;
    };
    qs("[data-p]", b).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (t && HI.includes(t.dataset.id)) ((sel = HI.indexOf(t.dataset.id)), draw());
    });
    draw();
  }

  /** Hypervolume with a particle as the reference point; then each member's own share. */
  const REFS = { P: SW.P, Q: SW.Q, R: SW.R };
  function hvFig(b, steps) {
    let p = "P",
      k = 0;
    const fr = frame({ ...AX, h: 290 });
    b.innerHTML = `<div class="controls" data-c></div>${steps ? `<div class="controls"><button class="btn primary" data-a="nx">Next member</button><button class="btn ghost" data-a="rs">Start again</button></div>` : ""}<div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const r = REFS[p],
        cb = contrib(HV, r),
        tot = hv(HV, r),
        doms = HV.map((a, i) => i).filter((i) => dom(HV[i], r));
      const cur = steps && k > 0 && k <= doms.length ? doms[k - 1] : -1,
        end = steps && k > doms.length;
      const best = cb.indexOf(Math.max(...cb));
      qs("[data-p]", b).innerHTML = fr.wrap(
        doms.map((i) => hvBox(fr, HV[i], r, "teal", 0.14)).join("") +
          (cur >= 0 ? exclBoxes(fr, HV, r, cur) : end && doms.length ? exclBoxes(fr, HV, r, best) : "") +
          arch(fr, {
            ring: cur >= 0 ? cur : end && doms.length ? best : -1,
            c: (i) => (dom(HV[i], r) ? "blue" : "dim"),
          }) +
          star(fr, r, `${p} = ref`),
        `Particle ${p} at (${r.join(", ")}) is the reference point. Hypervolume ${tot}.`,
      );
      qs("[data-n]", b).innerHTML = !doms.length
        ? `No archive member dominates <b>${p}</b>, so there is no box at all: <b>pick a leader at random</b>.`
        : !steps || k === 0
          ? `Members dominating <b>${p}</b>: ${doms.map((i) => HI[i]).join(", ")}. Together they dominate <b>${tot}</b> square units up to ${p}.`
          : cur >= 0
            ? `Without <b>${HI[cur]}</b> the black box would be lost: its own share is <b>${cb[cur]}</b>.`
            : `Largest own share: <b>${HI[best]}</b> (${cb[best]}). ${HI[best]} leads particle ${p}.`;
    };
    qs("[data-c]", b).append(
      N.seg(
        Object.keys(REFS).map((x) => [x, `Particle ${x}`]),
        p,
        (v) => ((p = v), (k = 0), draw()),
      ),
    );
    if (steps) {
      qs("[data-a=nx]", b).onclick = () => (k++, draw());
      qs("[data-a=rs]", b).onclick = () => ((k = 0), draw());
    }
    draw();
  }

  /** How dominance weakens as objectives are added. */
  function manyFig(b) {
    b.innerHTML = `<div class="controls" data-c></div><div class="nw13-stats" data-t></div><div class="nw15-share" data-s></div>`;
    const sl = N.slider("Objectives M", 2, 8, 1, 2);
    qs("[data-c]", b).append(sl);
    const draw = (M) => {
      const share = 2 / 2 ** M;
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat teal"><small>Comparable share around a point</small><b>${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%</b></div><div class="wk-stat amber"><small>Points for 5 per objective</small><b>${(5 ** (M - 1)).toLocaleString("en-GB")}</b></div><div class="wk-stat blue"><small>Draw the front?</small><b>${M === 2 ? "a curve" : M === 3 ? "a surface" : "no"}</b></div>`;
      qs("[data-s]", b).innerHTML =
        `<div class="nw13-many"><div class="nw13-seg teal" style="flex:${share}">${share > 0.12 ? "comparable" : ""}</div><div class="nw13-seg grey" style="flex:${1 - share}">mutually non-dominating</div></div>`;
    };
    sl.onInput(draw);
    draw(2);
  }

  /** Average rank, one objective at a time. */
  const AR = [
    ["W", [2, 9, 4, 6]],
    ["X", [5, 3, 3, 2]],
    ["Y", [8, 7, 1, 7]],
    ["Z", [3, 6, 5, 9]],
  ];
  function avgFig(b) {
    const V = AR.map((r) => r[1]),
      R = ranksPer(V),
      av = avgRank(V);
    let k = 0;
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Rank the next objective</button><button class="btn ghost" data-a="rs">Start again</button></div><table class="t nw13-tbl" data-t></table><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      qs("[data-t]", b).innerHTML =
        `<tr><th></th>${V[0].map((_, m) => `<th>f${"₁₂₃₄"[m]}</th>`).join("")}<th>average</th></tr>` +
        AR.map(
          ([n, v], i) =>
            `<tr${k > 4 && av[i] === Math.min(...av) ? ' class="on"' : ""}><td><b>${n}</b></td>${v.map((x, m) => `<td>${x}${m < k ? ` <b class="nw15-r">r${R[m][i]}</b>` : ""}</td>`).join("")}<td>${k > 4 ? av[i].toFixed(2) : ""}</td></tr>`,
        ).join("");
      qs("[data-n]", b).innerHTML =
        k === 0
          ? "Four archive members, four objectives, all minimised. Rank each column: 1 for the lowest value."
          : k <= 4
            ? `Objective ${k} ranked. ${k < 4 ? "Next column." : "Press once more to average."}`
            : `Lowest average: <b>${AR[av.indexOf(Math.min(...av))][0]}</b> (${Math.min(...av).toFixed(2)}), the most likely leader.`;
    };
    qs("[data-a=nx]", b).onclick = () => ((k = Math.min(5, k + 1)), draw());
    qs("[data-a=rs]", b).onclick = () => ((k = 0), draw());
    draw();
  }

  /** Distance ranking: summed absolute objective differences. */
  const DR = [
    ["s1", [1, 6, 3]],
    ["s2", [2, 5, 4]],
    ["s3", [6, 1, 5]],
    ["s4", [3, 4, 9]],
  ];
  function distFig(b) {
    const V = DR.map((r) => r[1]),
      rk = distRank(V);
    let sel = 0;
    b.innerHTML = `<div class="controls" data-c></div><table class="t nw13-tbl" data-t></table><div class="nw13-stats" data-s></div>`;
    const draw = () => {
      qs("[data-t]", b).innerHTML =
        `<tr><th></th><th>f₁</th><th>f₂</th><th>f₃</th><th>distance to ${DR[sel][0]}</th></tr>` +
        DR.map(([n, v], i) => {
          const d = v.map((x, m) => Math.abs(x - V[sel][m]));
          return `<tr${i === sel ? ' class="on"' : ""}><td><b>${n}</b></td>${v.map((x) => `<td>${x}</td>`).join("")}<td>${i === sel ? "itself" : `${d.join(" + ")} = <b>${d.reduce((s, x) => s + x, 0)}</b>`}</td></tr>`;
        }).join("");
      qs("[data-s]", b).innerHTML = DR.map(
        ([n], i) =>
          `<div class="wk-stat${rk[i] === Math.max(...rk) ? " teal" : ""}"><small>r(${n})</small><b>${rk[i]}</b></div>`,
      ).join("");
    };
    qs("[data-c]", b).append(
      N.seg(
        DR.map(([n], i) => [String(i), n]),
        "0",
        (v) => ((sel = +v), draw()),
      ),
    );
    draw();
  }

  /** The leader lab: tap a particle, choose a method, see who leads. */
  function leaderLab(root) {
    let m = "rand",
      p = "Q";
    const card = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>Leader lab</h2></div><div class="controls" data-c></div><div data-p></div><div data-b></div><p class="nw13-note" data-n aria-live="polite"></p></div>`,
    );
    root.appendChild(card);
    const fr = frame({ ...AX, h: 300 });
    const draw = () => {
      const r = SW[p],
        cb = contrib(HV, r),
        best = cb.indexOf(Math.max(...cb));
      const probs =
        m === "rand"
          ? HV.map(() => 0.2)
          : m === "count"
            ? W.map((w) => w / WS)
            : cb[best] > 0
              ? HV.map((_, i) => (i === best ? 1 : 0))
              : HV.map(() => 0.2);
      qs("[data-p]", card).innerHTML = fr.wrap(
        (m === "hv" ? exclBoxes(fr, HV, r) : "") +
          SI.map((s) => sq(fr, s, SW[s], s === p)).join("") +
          arch(fr, {
            lab: (i) => (m === "hv" ? `${HI[i]} ${cb[i]}` : m === "count" ? `${HI[i]} (${COUNT[i].length})` : HI[i]),
          }),
        `Archive a to e, swarm P to V. Selected particle ${p}.`,
      );
      qs("[data-b]", card).innerHTML = bars(probs, m === "hv" && cb[best] > 0 ? best : -1);
      qs("[data-n]", card).innerHTML =
        m === "rand"
          ? `Random: every member leads <b>${p}</b> with chance 20%.`
          : m === "count"
            ? `Dominated count: members that dominate many particles are picked less. The chances are the same for every particle.`
            : cb[best] > 0
              ? `Hypervolume with <b>${p}</b> as reference: <b>${HI[best]}</b> has the largest own share (${cb[best]}) and leads.`
              : `No member dominates <b>${p}</b>: the leader is picked at random.`;
    };
    qs("[data-c]", card).append(
      N.seg(
        [
          ["rand", "Random"],
          ["count", "Dominated count"],
          ["hv", "Hypervolume"],
        ],
        m,
        (v) => ((m = v), draw()),
      ),
    );
    qs("[data-p]", card).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (t && SI.includes(t.dataset.id)) ((p = t.dataset.id), draw());
    });
    draw();
  }

  Object.assign(sh, { tallyFig, countFig, hvFig, manyFig15: manyFig, avgFig, distFig, leaderLab });
})();
