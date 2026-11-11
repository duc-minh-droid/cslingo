/* Data Science (COM3021), Lecture 11: distributed machine learning.
   This part: ds11-kmeans (11.3, the k-means algorithm and its MapReduce version: map, combine, reduce). */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { el, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, fm, seg, svg, tx, rng, gauss, figBox } = S;

  /* ---------- k-means on 2-D points ---------- */
  const COLS = ["blue", "rose", "amber"];
  const CLOUD = (() => {
    const r = rng(2024),
      C = [
        [0.25, 0.72],
        [0.74, 0.74],
        [0.55, 0.38],
      ];
    return Array.from({ length: 45 }, (_, i) => {
      const [cx, cy] = C[i % 3];
      return [+(cx + 0.07 * gauss(r)).toFixed(3), +(cy + 0.07 * gauss(r)).toFixed(3)];
    });
  })();
  const START = [
    [0.45, 0.66],
    [0.64, 0.82],
    [0.72, 0.7],
  ];
  const d2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
  const nearest = (p, cs) => cs.reduce((bi, c, i) => (d2(p, c) < d2(p, cs[bi]) ? i : bi), 0);
  /** New centres from sums and counts; an empty cluster keeps its old centre. */
  const centres = (acc, old) => acc.map((a, k) => (a.n ? [a.x / a.n, a.y / a.n] : old[k]));
  const tally = (pts, asg, k = 3) => {
    const acc = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
    pts.forEach((p, i) => ((acc[asg[i]].x += p[0]), (acc[asg[i]].y += p[1]), acc[asg[i]].n++));
    return acc;
  };
  /** The scatter: points coloured by cluster (grey before assignment), mapper shown by shape, centres as crosses. */
  function scatter(pts, asg, cs, { trail = [], label, shapes = false }) {
    const W = 360,
      X = (v) => 20 + v * (W - 40),
      Y = (v) => W - 20 - v * (W - 40);
    const dots = pts
      .map((p, i) => {
        const c = asg ? `var(--${COLS[asg[i]]})` : "var(--line-2)",
          x = X(p[0]),
          y = Y(p[1]),
          sh = shapes ? Math.floor(i / 15) : 0;
        return sh === 0
          ? `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="var(--panel)" stroke-width="1"/>`
          : sh === 1
            ? `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" fill="${c}" stroke="var(--panel)"/>`
            : `<path d="M${x} ${y - 6}L${x + 5.5} ${y + 4}H${x - 5.5}Z" fill="${c}" stroke="var(--panel)"/>`;
      })
      .join("");
    const tr = trail
      .map(
        (path, k) =>
          `<path d="${path.map((c, i) => `${i ? "L" : "M"}${X(c[0])} ${Y(c[1])}`).join("")}" fill="none" stroke="var(--${COLS[k]})" stroke-width="2" stroke-dasharray="3 3"/>`,
      )
      .join("");
    const cx = cs
      .map(
        (c, k) =>
          `<path d="M${X(c[0]) - 9} ${Y(c[1]) - 9}l18 18m0 -18l-18 18" stroke="var(--panel)" stroke-width="7" stroke-linecap="round"/><path d="M${X(c[0]) - 9} ${Y(c[1]) - 9}l18 18m0 -18l-18 18" stroke="var(--${COLS[k]})" stroke-width="4" stroke-linecap="round"/>`,
      )
      .join("");
    return svg(
      W,
      W,
      `<rect x="10" y="10" width="${W - 20}" height="${W - 20}" rx="10" fill="var(--panel-2)" stroke="var(--line)"/>${tr}${dots}${cx}`,
      label,
    );
  }
  Object.assign(S, { CLOUD, START, nearest, centres, tally, scatter });

  /* ---------- figures for 11.3 ---------- */
  /** Stepper: 1-D k-means, points 1, 2, 4, 8, 9, 12 and starting centres 0 and 6, until no point changes cluster. */
  const P1 = [1, 2, 4, 8, 9, 12];
  function lineRun(b, life) {
    const X = (v) => 30 + v * 36;
    F.run(b, life, {
      build(stage) {
        stage.innerHTML = svg(520, 110, "<g></g>", "Six points on a number line and two cluster centres");
        return stage.querySelector("svg g");
      },
      *frames() {
        let c = [0, 6],
          prev = null;
        yield { c, a: null, cap: "Six points and two starting centres, <b>0</b> and <b>6</b>." };
        for (let t = 1; t <= 5; t++) {
          const a = P1.map((p) => (Math.abs(p - c[0]) <= Math.abs(p - c[1]) ? 0 : 1));
          const same = prev && a.every((x, i) => x === prev[i]);
          yield {
            c,
            a,
            cap: same
              ? `Iteration ${t}, assignment: <b>no point changed cluster</b>. The partition is the same as last time, so k-means stops.`
              : `Iteration ${t}, <b>assignment step</b>: each point joins its nearest centre. Blue: ${P1.filter((_, i) => !a[i]).join(", ")}. Red: ${P1.filter((_, i) => a[i]).join(", ")}.`,
          };
          if (same) return;
          const nc = [0, 1].map((k) => P1.filter((_, i) => a[i] === k).reduce((s, v, _, arr) => s + v / arr.length, 0));
          yield {
            c: nc,
            a,
            cap: `<b>Update step</b>: each centre moves to the mean of its points: <b>${fm(nc[0])}</b> and <b>${fm(nc[1])}</b>.`,
          };
          c = nc;
          prev = a;
        }
      },
      draw(g, f) {
        const axis = `<line x1="20" x2="500" y1="60" y2="60" stroke="var(--line-2)" stroke-width="2"/>${[0, 2, 4, 6, 8, 10, 12].map((v) => tx(X(v), 98, v, { s: 10.5, c: "var(--text-faint)" })).join("")}`;
        const pts = P1.map(
          (p, i) =>
            `<circle cx="${X(p)}" cy="60" r="8" fill="${f.a ? `var(--${COLS[f.a[i]]})` : "var(--line-2)"}" stroke="var(--panel)" stroke-width="2"/>`,
        ).join("");
        const cs = f.c
          .map(
            (c, k) =>
              `<path d="M${X(c)} 44l-8 -14h16z" fill="var(--${COLS[k]})" stroke="var(--panel)" stroke-width="1.5"/>${tx(X(c), 24, fm(c), { s: 11, c: `var(--${COLS[k]}-ink)` })}`,
          )
          .join("");
        g.innerHTML = axis + pts + cs;
      },
    });
  }

  /** Stepper: 2-D k-means on 45 points with k = 3, like the slides' iteration pictures. */
  function cloudRun(b, life) {
    F.run(b, life, {
      build(stage) {
        stage.innerHTML = "<div></div>";
        return stage.firstChild;
      },
      *frames() {
        let c = START,
          prev = null;
        const trail = START.map((x) => [x]);
        yield {
          a: null,
          c,
          trail: trail.map((x) => [...x]),
          cap: "45 points and 3 starting centres, two of them close together.",
        };
        for (let t = 1; t <= 15; t++) {
          const a = CLOUD.map((p) => nearest(p, c)),
            moved = prev ? a.filter((x, i) => x !== prev[i]).length : a.length;
          if (prev && !moved) {
            yield {
              a,
              c,
              trail: trail.map((x) => [...x]),
              cap: `Iteration ${t}: <b>no point changed cluster</b>, so the partition is final.`,
            };
            return;
          }
          c = centres(tally(CLOUD, a), c);
          c.forEach((x, k) => trail[k].push(x));
          yield {
            a,
            c,
            trail: trail.map((x) => [...x]),
            cap: `Iteration ${t}: ${prev ? `<b>${moved}</b> point${moved > 1 ? "s" : ""} changed cluster` : "every point is assigned"}; each centre moves to the mean of its points.`,
          };
          prev = a;
        }
      },
      draw(g, f) {
        g.innerHTML = scatter(CLOUD, f.a, f.c, {
          trail: f.trail,
          label: "Points coloured by their nearest centre; dashed lines show the centres moving",
        });
      },
    });
  }

  /** Distances per iteration: n points × k centres, spread over M mappers. */
  function costFig(b) {
    figBox(b, 2);
    const sl = N.slider("Mappers", 1, 8, 1, 4);
    b.children[1].append(sl);
    b.firstChild.remove();
    const draw = (M) => {
      const per = (1200000 * 5) / M;
      b.children[1].innerHTML = F.bars(
        Array.from({ length: M }, (_, i) => [`Mapper ${i + 1}`, per / 1e6, "blue", "million"]),
        { max: 6, fmt: (v) => fm(v, 2), label: `${M} mappers share 6 million distance calculations` },
      );
      b.lastChild.innerHTML = `1,200,000 points × 5 centres = 6 million distances every iteration. On <b>${M}</b> mapper${M > 1 ? "s" : ""}: <b>${fm(per / 1e6, 2)} million</b> each, all at the same time.`;
    };
    sl.onInput(draw);
    draw(4);
  }

  /** Stepper: one mapper (points 1, 4, 8, 12) against centres c0 = 2 and c1 = 9. Emits ⟨index of closest centre, sample⟩. */
  const MAP1 = [1, 4, 8, 12],
    C0 = [2, 9];
  function mapRun(b, life) {
    F.run(b, life, {
      code: [
        "for each sample in my split:",
        "  min_dis = ∞, index = −1",
        "  for each centre i: d = distance(sample, centre i)",
        "    if d < min_dis: min_dis = d, index = i",
        "  emit ⟨index, sample⟩",
      ],
      build(stage) {
        stage.innerHTML = `<div class="ds11-cents"><span class="ds11-cent c0" data-k="c0">centre c0 = 2</span><span class="ds11-cent c1" data-k="c1">centre c1 = 9</span></div><table class="ds11-tbl"><thead><tr><th>Sample</th><th>to c0</th><th>to c1</th><th>Emits</th></tr></thead><tbody>${MAP1.map((p) => `<tr><td>${p}</td><td></td><td></td><td></td></tr>`).join("")}</tbody></table>`;
        return stage;
      },
      *frames() {
        const rows = [];
        yield {
          rows: [],
          on: -1,
          line: 0,
          cap: "Mapper 1 holds the samples 1, 4, 8 and 12, and a copy of the centres 2 and 9.",
        };
        for (const [i, p] of MAP1.entries()) {
          const d = C0.map((c) => Math.abs(p - c)),
            k = d[0] < d[1] ? 0 : 1;
          rows.push([d[0], d[1], ""]);
          yield {
            rows: rows.map((r) => [...r]),
            on: i,
            line: 2,
            cap: `Sample ${p}: distance ${d[0]} to c0 and ${d[1]} to c1.`,
          };
          rows[i][2] = `⟨${k}, ${p}⟩`;
          yield {
            rows: rows.map((r) => [...r]),
            on: i,
            line: 4,
            cap: `Closest is c${k}, so emit <b>⟨${k}, ${p}⟩</b>: key = cluster index, value = the sample.`,
            ...(p === 8
              ? {
                  ask: {
                    q: "Which centre is closest to sample 8? Tap it.",
                    pick: ".ds11-cent",
                    a: ["c1"],
                    why: "8 is 6 away from c0 = 2 but only 1 away from c1 = 9.",
                  },
                }
              : {}),
          };
        }
      },
      draw(sc, f) {
        sc.querySelectorAll("tbody tr").forEach((tr, i) => {
          const r = f.rows[i] || ["", "", ""];
          [1, 2, 3].forEach((j) => (tr.children[j].textContent = r[j - 1]));
          tr.classList.toggle("on", f.on === i);
        });
      },
    });
  }

  /** Combine: send sums and counts, or (wrongly) local means. Mapper 1: 1, 4 | 8, 12. Mapper 2: 2, 3 | 14. */
  function combineFig(b) {
    figBox(b);
    const groups = [
      [
        [1, 4],
        [8, 12],
      ],
      [[2, 3], [14]],
    ];
    const draw = (v) => {
      const sums = v === "sums";
      const cell = (g) =>
        sums
          ? `sum ${g.reduce((s, x) => s + x, 0)}, count ${g.length}`
          : `mean ${fm(g.reduce((s, x) => s + x, 0) / g.length)}`;
      const res = [0, 1].map((k) => {
        const all = groups.flatMap((m) => m[k]),
          truth = all.reduce((s, x) => s + x, 0) / all.length,
          got = sums
            ? truth
            : (groups[0][k].reduce((s, x) => s + x, 0) / groups[0][k].length +
                groups[1][k].reduce((s, x) => s + x, 0) / groups[1][k].length) /
              2;
        return { truth, got };
      });
      b.children[1].innerHTML = `<table class="ds11-tbl"><thead><tr><th></th><th>Cluster 0</th><th>Cluster 1</th></tr></thead><tbody>${groups.map((m, i) => `<tr><td>Mapper ${i + 1}</td><td>${m[0].join(", ")} → ${cell(m[0])}</td><td>${m[1].join(", ")} → ${cell(m[1])}</td></tr>`).join("")}<tr class="on"><td>Reducer</td>${res.map((r) => `<td>${fm(r.got)} ${Math.abs(r.got - r.truth) < 1e-9 ? "✓" : `✗ (true mean ${fm(r.truth)})`}</td>`).join("")}</tr></tbody></table>`;
      b.lastChild.innerHTML = sums
        ? "Sums and counts add up exactly: cluster 1 gets (20 + 14) ÷ (2 + 1) = <b>11.33</b>, the true mean of 8, 12 and 14."
        : "Averaging the local means treats mapper 2's single point like mapper 1's two: cluster 1 gets (10 + 14) ÷ 2 = <b>12</b>, which is wrong.";
    };
    seg(b.firstChild, "sums:Send sums and counts|means:Send local means", "sums", draw);
    draw("sums");
  }

  /** Reduce and the loop: the MapReduce iteration as a cycle, with the numbers of two iterations. */
  function loopFig(b) {
    figBox(b);
    const it = [
      [
        "2 and 9",
        "1, 2, 3, 4 | 8, 12, 14",
        "(10, 4) and (34, 3)",
        "2.5 and 11.33",
        "Moved: map again with the new centres",
      ],
      [
        "2.5 and 11.33",
        "1, 2, 3, 4 | 8, 12, 14",
        "(10, 4) and (34, 3)",
        "2.5 and 11.33",
        "Nothing moved: converged, output the centres",
      ],
    ];
    const draw = (v) => {
      const r = it[+v];
      b.children[1].innerHTML =
        F.flow(
          [
            { t: "Map", s: "nearest centre", c: "blue" },
            { t: "Combine", s: "local sums, counts", c: "amber" },
            { t: "Reduce", s: "new centres", c: "violet" },
            { t: "Converged?", s: "if not, repeat", c: "teal" },
          ],
          {
            loop: true,
            label: "Map, combine, reduce, test convergence, and repeat with the new centres until converged",
          },
        ) +
        `<table class="ds11-tbl"><tbody>${["Centres in", "Map assigns", "Sums and counts", "Reducer's centres", "Convergence test"].map((h, i) => `<tr${i === 4 ? ' class="on"' : ""}><td>${h}</td><td>${r[i]}</td></tr>`).join("")}</tbody></table>`;
      b.lastChild.innerHTML = `Iteration ${+v + 1}. ${+v ? "The partition did not change, so the reducer's test says <b>stop</b>." : "The centres moved, so they are sent back to every mapper for another round."}`;
    };
    seg(b.firstChild, "0:Iteration 1|1:Iteration 2", "0", draw);
    draw("0");
  }

  /** Records sent to the reducer per iteration, with and without a combiner: 3 mappers. */
  function trafficFig(b) {
    figBox(b, 2);
    let n = 1000000;
    const sl = N.slider("Clusters k", 2, 10, 1, 4);
    b.children[1].append(sl);
    const draw = () => {
      const k = sl.value;
      b.children[2].innerHTML = F.bars(
        [
          ["No combiner: one record per point", 3 * n, "rose"],
          ["Combiner: one per mapper and cluster", 3 * k, "teal"],
        ],
        { max: 3 * n, fmt: (v) => v.toLocaleString("en-GB"), label: "Records sent to the reducer per iteration" },
      );
      b.lastChild.innerHTML = `3 mappers × ${n.toLocaleString("en-GB")} points: without a combiner <b>${(3 * n).toLocaleString("en-GB")}</b> records cross the network every iteration; with one, 3 × ${k} = <b>${3 * k}</b>.`;
    };
    seg(b.firstChild, "1000:1,000 points per mapper|1000000:1,000,000", n, (v) => ((n = +v), draw()));
    sl.onInput(draw);
    draw();
  }

  /* ============ 11.3 Parallel k-means with MapReduce ============ */
  reg({
    id: "ds11-kmeans",
    order: 3,
    num: "11.3",
    title: "Parallel k-means with MapReduce",
    blurb: "k-means clustering, then the same algorithm split into map, combine and reduce across many machines.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Parallel k-means on three mappers</h2><span class="tag">k = 3</span></div><div></div></div>`,
      );
      root.appendChild(card);
      S.kmLab(card.lastElementChild);
      root.appendChild(
        pr(
          "ds11-kmeans-1",
          "Pick <b>Combiner off</b>, then press <b>Map</b> and <b>Reduce</b>. How many records reach the reducer?",
          ["45: one per point", "At most 9: one per mapper and cluster", "3: one per cluster"],
          "Without a combiner every ⟨cluster, point⟩ pair the mappers emit goes over the network: 45 of them. A combiner would shrink that to one (sum, count) per mapper and cluster.",
        ),
      );
      root.appendChild(
        pr(
          "ds11-kmeans-2",
          "Press <b>Run to convergence</b> with the combiner on, note the result, then <b>Reset</b>, pick <b>Combiner off</b> and run again. How do the final centres compare?",
          [
            "They are exactly the same",
            "Without the combiner they are more accurate",
            "Without the combiner it never converges",
          ],
          "Sums and counts add up to exactly the same totals as the raw points, so the centres and the number of iterations are identical. The combiner only saves network traffic.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>k-means</b> repeats two steps: <b>assign</b> every point to its nearest centre, then <b>update</b> each centre to the mean of its points.",
            "It stops when the partition no longer changes, or after a <b>MAX</b> number of iterations.",
            "<b>Map</b>: compute distances to the K centres, assign each point, emit ⟨cluster, point⟩.",
            "<b>Combine</b>: per cluster, send the local <b>sum</b> of the values in each dimension and the <b>number of samples</b>, never a local mean.",
            "<b>Reduce</b>: add the sums and counts, compute the new centres, <b>test convergence</b>, and loop back if needed.",
          ],
          "Mappers assign, combiners shrink, the reducer averages and decides whether to go round again.",
        ),
      );
    },
  });

  L["ds11-kmeans"] = {
    sum: "<b>k-means</b> alternates an assignment step and an update step until the clusters stop changing. In <b>MapReduce</b> the mappers assign points, a <b>combiner</b> sends local sums and counts per cluster, and the <b>reducer</b> computes new centres and tests convergence.",
    steps: [
      st(
        "k-means: assign, then update",
        `<p><b>k-means</b> splits data into k clusters. Start with k centres. The <b>assignment step</b> puts every point in the cluster with the nearest centre; the <b>update step</b> moves every centre to the mean of its points. Repeat.</p><p>Worked example on a line: points 1, 2, 4, 8, 9, 12 and centres 0 and 6. First assignment: {1, 2} and {4, 8, 9, 12}, so the centres move to 1.5 and 8.25. Now 4 is nearer 1.5, so it switches: {1, 2, 4} and {8, 9, 12}, centres 2.33 and 9.67. Step through it.</p>${mm("<p>Assignment, with distance $d$:</p>$$C_i^{(t)} = \\{\\, x_j : d(x_j, \\mu_i) \\le d(x_j, \\mu_h) \\text{ for all } h = 1, \\dots, K \\,\\}$$<p>Update:</p>$$\\mu_i^{(t+1)} = \\frac{1}{|C_i^{(t)}|} \\sum_{x_j \\in C_i^{(t)}} x_j$$<p>For $\\{1, 2, 4\\}$: $7 / 3 \\approx 2.33$.</p>")}`,
        (b, life) => lineRun(b, life),
        mc(
          "Centres are at 3 and 10. Which cluster does the point 6 join in the assignment step?",
          ["The centre at 3", "The centre at 10", "Neither: it waits for the update step"],
          "6 is 3 away from the centre at 3 and 4 away from the centre at 10, so it joins the nearer one, 3.",
        ),
      ),
      st(
        "Watch it converge",
        `<p>The slides follow k-means through many pictures of the same data. The boundaries between clusters swing about at first, then settle. The loop stops when <b>the partition no longer changes</b> (no point switches cluster) or after a <b>MAX</b> number of iterations.</p><p>Worked example: 45 points, k = 3, with two starting centres badly placed close together. Every point is assigned in iteration 1; 3, 7, 12 and then 2 points switch in the next ones; in iteration 6 none do, so k-means stops. Press play and watch the dashed trails of the centres.</p>${mm("<p>The stopping rule from the algorithm:</p>$$\\text{stop if } t \\ge \\text{MAX} \\ \\text{ or } \\ \\mathcal{P}^{t} = \\mathcal{P}^{t-1}$$<p>Each iteration can only lower the total squared distance from points to their centres, which is why the partition settles.</p>")}`,
        (b, life) => cloudRun(b, life),
        mc(
          "When does k-means stop?",
          [
            "When no point changes cluster, or after MAX iterations",
            "When every cluster holds the same number of points",
            "After one assignment step and one update step",
          ],
          "The loop ends when the partition is unchanged since the last iteration, or when the iteration limit MAX is reached.",
        ),
      ),
      st(
        "Why spread it over machines",
        `<p>Every iteration measures the distance from <b>every</b> point to <b>every</b> centre. But each point's assignment needs only that point and the centres, never the other points, so the points can be split across machines and handled at the same time. Each machine just needs a copy of the centres: a <b>broadcast</b>.</p><p>Worked example: 1,200,000 points and 5 centres make 6 million distances per iteration. On 4 machines that is 1.5 million each.</p>`,
        (b) => costFig(b),
        mc(
          "2,000,000 points, k = 3, spread evenly over 4 machines. How many distances does each machine compute per iteration?",
          ["1,500,000", "6,000,000", "500,000"],
          "2,000,000 × 3 = 6,000,000 distances in all, shared by 4 machines: 1,500,000 each.",
          "Points times centres, then divide by the machines.",
        ),
      ),
      st(
        "Map: find the nearest centre",
        `<p>The MapReduce version has three phases. In <b>Map</b>, each mapper takes its share of the samples, computes the distance from each to the K centres, assigns it to the closest, and sends the intermediate data on: a pair ⟨index of the closest centre, the sample⟩.</p><p>Worked example: mapper 1 holds 1, 4, 8 and 12; the centres are c0 = 2 and c1 = 9. Sample 8 is 6 from c0 and 1 from c1, so it emits ⟨1, 8⟩. Step through all four.</p>`,
        (b, life) => mapRun(b, life),
        mc(
          "In the map phase, what is the key of each emitted pair?",
          [
            "The index of the closest centre",
            "The position of the sample in the file",
            "The distance to the closest centre",
          ],
          "The key is the cluster index, so everything for one cluster can be grouped together. The value is the sample itself.",
        ),
      ),
      st(
        "Combine: sums and counts",
        `<p>The <b>combiner</b> runs on each mapper's own output. For every cluster it adds up the values of its samples in each dimension and counts them, then sends just those local sums and the number of samples.</p><p>Worked example: mapper 1 has 8 and 12 in cluster 1 (sum 20, count 2); mapper 2 has 14 (sum 14, count 1). The reducer gets (20 + 14) ÷ 3 = <b>11.33</b>, the true mean. Sending local means instead gives (10 + 14) ÷ 2 = 12: wrong, because a mean forgets how many points it came from.</p>${mm("<p>Mapper $m$ sends $(S_{m,i}, n_{m,i})$ with $S_{m,i} = \\sum x_j$ over its points in cluster $i$. The reducer computes</p>$$\\mu_i = \\frac{\\sum_m S_{m,i}}{\\sum_m n_{m,i}} = \\frac{20 + 14}{2 + 1} = \\frac{34}{3}$$<p>whereas $\\frac{1}{2}\\big(\\frac{20}{2} + \\frac{14}{1}\\big) = 12$ gives one point the weight of two.</p>")}`,
        (b) => combineFig(b),
        mc(
          "Mapper A sends a cluster's sum 30 from 3 points; mapper B sends sum 20 from 1 point. What is the cluster's new centre?",
          ["12.5", "15", "50"],
          "Add the sums and the counts: (30 + 20) ÷ (3 + 1) = 50 ÷ 4 = 12.5. Averaging the local means (10 and 20) would wrongly give 15.",
          "Total sum over total count.",
        ),
      ),
      st(
        "Reduce, test, repeat",
        `<p>The <b>reducer</b> aggregates the local results of all the mappers, computes the new centre of each cluster, and <b>tests convergence</b>. If the criterion is not met, the new centres go back to the mappers and the next iteration starts with Map again; if it is, it outputs the final result.</p><p>Worked example (both mappers together): iteration 1 turns centres 2 and 9 into 2.5 and 11.33, so they moved and the loop goes round. In iteration 2 no point changes cluster, the centres stay at 2.5 and 11.33, and the job is done.</p>`,
        (b) => loopFig(b),
        mc(
          "Which phase of parallel k-means decides whether to run another iteration?",
          ["Reduce", "Map", "Combine"],
          "The reducer has every cluster's totals, so it computes the new centres and tests convergence. Mappers and combiners only see their own share.",
        ),
      ),
      st(
        "What the combiner saves",
        `<p>The combiner does not change the answer; it changes the <b>traffic</b>. Without it, every point crosses the network to the reducer every iteration. With it, each mapper sends one record per cluster. In the patterns of lesson 11.1: the centres are <b>broadcast</b> to the mappers, combine-then-reduce is a <b>reduce</b>, and the reducer waits for every mapper, like a <b>barrier</b>.</p><p>Worked example: 3 mappers with 1,000,000 points each and k = 4. No combiner: 3,000,000 records per iteration. With one: 3 × 4 = <b>12</b>.</p>`,
        (b) => trafficFig(b),
        mc(
          "4 mappers hold 250,000 points each and k = 5. With a combiner, how many records reach the reducer per iteration?",
          ["20", "1,000,000", "5"],
          "Each mapper sends one (sum, count) record per cluster: 4 × 5 = 20, instead of 1,000,000 raw points.",
        ),
      ),
    ],
    guide: [
      "Press <b>Map</b>, <b>Combine</b> and <b>Reduce</b> in turn and watch <b>Records to reducer</b> and <b>Centre shift</b>.",
      "Press <b>Run to convergence</b> and read <b>Status</b> and <b>Iteration</b>.",
      "Press <b>Reset</b>, pick <b>Combiner off</b>, and run again. Then answer the questions after the demo.",
    ],
  };
})();
