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

  N.register({
    id: "l15-leaders",
    lecture: 15,
    order: 3,
    num: "15.3",
    title: "Choosing leaders",
    blurb:
      "No single global best: pick leaders from the archive at random, by crowding, by dominated count or by hypervolume, and rank many objectives.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Five archive members (blue) and seven particles (red). Tap a particle, then switch between <b>Random</b>, <b>Dominated count</b> and <b>Hypervolume</b> to see who would lead it.",
        ),
      );
      leaderLab(root);
      root.appendChild(
        pr(
          "l15-leaders-1",
          "Choose <b>Hypervolume</b> and tap particle <b>Q</b>. Which member leads it? | e | d | c | Only d and e dominate Q at (9, 4). e's own box is 1.5 × 1.5 = 2.25 and d's is 1.5 × 1 = 1.5, so e leads.",
        ),
      );
      root.appendChild(
        pr(
          "l15-leaders-2",
          "Choose <b>Dominated count</b>. Which member is least likely to lead? | c | a | e | c dominates four particles (P, T, U and V), more than anyone else, so its weight 1 ÷ 5 is the smallest. It sits where the swarm is already crowded.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "MOPSO picks <b>leaders</b> from the archive: there is no single global best.",
            "<b>Random</b> selection is simplest; preferring <b>sparse</b> members spreads the swarm along the front.",
            "<b>Dominated count</b>: members that dominate many particles are less likely to lead.",
            "<b>Hypervolume</b>: with the particle as reference point, the member with the largest own share leads; if none dominates it, pick at random.",
            "With many objectives dominance stops separating solutions, so use <b>average rank</b> or <b>distance ranking</b>.",
          ],
          "Lead the swarm towards the empty parts of the front.",
        ),
      );
    },
  });

  L["l15-leaders"] = {
    sum: "Leaders come from the archive: at random, preferring sparse regions, by how few swarm members they dominate, or by their hypervolume contribution. With many objectives, average rank and distance ranking replace dominance.",
    steps: [
      {
        t: "No single global best",
        b: `<p>Plain PSO pulls every particle towards one point, g. In MOPSO the best is a set: the <b>archive</b> of non-dominated solutions. So each particle needs its own <b>leader</b>, chosen from the archive.</p><p>The simplest rule: pick an archive member <b>at random</b>. With five members each has a 1 in 5 chance. Pick a few, then 100 more, and watch the tally even out.</p>`,
        v: (b) => tallyFig(b, ["rand"]),
        c: C(
          "An archive holds 8 members and leaders are picked uniformly at random. What is the chance a given member leads a particle? | 1 in 8 | 1 in 2 | 1 in 16 | Uniform choice gives each of the 8 members the same chance, 1 in 8.",
        ),
      },
      {
        t: "Prefer the sparse parts",
        b: `<p>Random choice ignores where the swarm already is. To <b>maintain diversity</b>, prefer leaders in <b>sparser</b> parts of the archive, so particles are drawn into gaps in the front.</p><p>One way: draw two members and keep the one with the larger <b>crowding distance</b>. Here a and e are the ends (∞), so they win most duels and the three middle members are picked less often. Compare the tallies.</p>`,
        v: (b) => tallyFig(b, ["rand", "sparse"]),
        c: C(
          "Why prefer leaders from sparse parts of the archive? | They pull particles into gaps, spreading the front | They are always the newest members of the archive | They dominate more of the swarm than the others do | A leader in an empty region draws particles there, so new non-dominated solutions fill the gaps.",
        ),
      },
      {
        t: "Dominated solution count",
        b: `<p>Count, for each archive member, how many <b>swarm particles it dominates</b>. A member that dominates many sits where the swarm is already busy, so it is made <b>less likely</b> to lead.</p><p>Here c dominates four particles and e only one. With weight 1 ÷ (1 + count), e gets 1 ÷ 2 and c gets 1 ÷ 5. Tap the members to see their links.</p><details class="math-more"><summary>Show the maths</summary><p>With $n_i$ the number of swarm particles that archive member $\\mathbf{a}_i$ dominates, one simple choice is</p>$$P(\\mathbf{a}_i)=\\frac{1/(1+n_i)}{\\sum_j 1/(1+n_j)}$$<p>The lecture only fixes the direction: more dominated particles, less likely to be chosen.</p></details>`,
        v: (b) => countFig(b),
        c: C(
          "Archive member A dominates 6 swarm particles; member B dominates 1. Under dominated solution count, which is more likely to lead? | B | A | Both equally | Members that dominate more of the swarm are less likely to be selected, so B is favoured: it is where fewer particles already are.",
        ),
      },
      {
        t: "Hypervolume with the particle as reference",
        b: `<p>Recap from <b>Lesson 13.3</b>: the <b>hypervolume</b> is the area a set dominates up to a <b>reference point</b>. For leader choice, use the particle that needs a leader as the reference point. Only the members that dominate it count.</p><p>Particle P at (7, 7.5) is dominated by b, c and d; together they cover 12 square units. Q is dominated only by d and e. R at (3, 3) is dominated by nobody. Switch particles.</p>`,
        v: (b) => hvFig(b, false),
        c: C(
          "Minimising both, the reference point is (6, 6) and the only member that dominates it is (2, 4). What is the hypervolume? | 8 | 4 | 24 | The box runs from (2, 4) to (6, 6): width 4, height 2, area 8.",
        ),
      },
      {
        t: "Leader by hypervolume contribution",
        b: `<p>A member's <b>contribution</b> is the part of the hypervolume only it covers: what would be lost without it. The member with the <b>largest contribution</b> leads. If no member dominates the particle there is no box, so the leader is picked <b>at random</b>.</p><p>For P: b adds 1.5, c adds 4 and d adds 1.5, so c leads. Step through each member's own box.</p><details class="math-more"><summary>Show the maths</summary><p>With the particle's objective vector $\\mathbf{r}$ as reference,</p>$$\\Delta HV(\\mathbf{a})=HV(A,\\mathbf{r})-HV(A\\setminus\\{\\mathbf{a}\\},\\mathbf{r}),\\qquad \\text{leader}=\\arg\\max_{\\mathbf{a}\\in A}\\Delta HV(\\mathbf{a})$$</details>`,
        v: (b) => hvFig(b, true),
        c: C(
          "A particle is dominated by three archive members whose own hypervolume shares are 1, 3.5 and 2. Which leads it? | The one with 3.5 | The one with 1 | Any of the three, at random | The leader is the member with the largest contribution to the hypervolume. Random choice is only for a particle nobody dominates.",
        ),
      },
      {
        t: "Many objectives: three problems",
        b: `<p>With four or more objectives, MOPSO hits the issues of <b>Lecture 13</b>: the front <b>cannot be drawn</b>; <b>search weakens</b>, because almost every pair of solutions is mutually non-dominating, so dominance cannot rank them; and the <b>number of solutions</b> needed to cover the front grows <b>exponentially</b>.</p><p>With 5 points along each objective, 2 objectives need 5 points, 5 objectives need 625. Slide M.</p><details class="math-more"><summary>Show the maths</summary><p>Around a point, the share of objective space that is comparable (it dominates the point or is dominated by it) is</p>$$\\frac{2}{2^{M}}$$<p>so with $M=6$ only $1/32$ of the space can be ranked by dominance.</p></details>`,
        v: (b) => manyFig(b),
        c: C(
          "Which is NOT one of the three many-objective issues in the lecture? | Particles can no longer move in decision space | The front is hard to visualise | Dominance loses its power to separate solutions | The three issues are visualisation, weaker search, and the exponential number of solutions needed. The PSO move itself still works.",
        ),
      },
      {
        t: "Average rank",
        b: `<p>Instead of dominance, rank the archive members <b>once per objective</b> (1 = best), then take the <b>average</b> of each member's M ranks. Members with a <b>lower</b> average are more likely to be leaders.</p><p>X is never worst, ranked 3, 1, 2 and 1: average 1.75, the best here. Rank the columns one by one.</p><details class="math-more"><summary>Show the maths</summary><p>With $r_{im}$ the rank of member $i$ on objective $m$,</p>$$\\bar r_i=\\frac{1}{M}\\sum_{m=1}^{M} r_{im}$$</details>`,
        v: (b) => avgFig(b),
        c: {
          q: "Three objectives. Member A ranks 2, 2 and 2. Member B ranks 1, 1 and 5. Which has the better (lower) average rank?",
          o: ["A", "B", "They tie"],
          a: 0,
          why: "A averages 6 ÷ 3 = 2. B averages 7 ÷ 3, about 2.3. Being best on two objectives does not make up for being worst on the third.",
          hint: "Add each member's ranks: 6 against 7.",
        },
      },
      {
        t: "Distance ranking",
        b: `<p>Another many-objective score: for each member, add the <b>absolute differences</b> between its objective values and every other member's, over all objectives. A <b>large</b> total means it is far from the rest, in an <b>uncrowded</b> region, so it is preferred.</p><p>For s1 = (1, 6, 3) against s2 = (2, 5, 4): 1 + 1 + 1 = 3. Add its gaps to s3 and s4 too and r(s1) = 25. Pick a member to see its gaps.</p><details class="math-more"><summary>Show the maths</summary>$$r(\\mathbf{x}_i)=\\sum_{m=1}^{M}\\sum_{j\\ne i}\\big|f_m(\\mathbf{x}_i)-f_m(\\mathbf{x}_j)\\big|$$</details>`,
        v: (b) => distFig(b),
        c: C(
          "Under distance ranking, member U has r = 40 and member V has r = 12. Which does the rule prefer, and why? | U: it lies in a less crowded region | V: it lies closer to the other members | Neither: r only measures convergence | A larger summed distance means the member is far from the others, in an uncrowded part of the space, which is what the rule prefers.",
        ),
      },
    ],
    guide: [
      "Tap particle <b>Q</b> and switch between <b>Random</b>, <b>Dominated count</b> and <b>Hypervolume</b>.",
      "With <b>Hypervolume</b>, tap <b>R</b>: nobody dominates it.",
      "With <b>Dominated count</b>, find the member with the smallest bar.",
      "Answer the questions after the demo.",
    ],
  };
})();
