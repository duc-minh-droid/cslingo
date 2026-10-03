/* ===== bank-x-nic-1.js ===== */
/* Revision bank, third set of varied, visual questions (nic-1).
   Modules: l1-what, l1-monkey, l1-ingredients, l1-apps, l2-generic, l2-optim, l2-complexity, l2-mst (5 each).
   Each figure carries the information its question needs. Data for the charts is computed by small
   seeded simulations of the real algorithms below, so every number on screen is genuine. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${(o.z || 13) <= 12 ? (o.z || 13) + 1 : o.z || 13}px var(--sans);fill:${o.c || "var(--text)"};pointer-events:none">${s}</text>`;
  const R = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r === undefined ? 6 : o.r}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw === undefined ? 2 : o.sw}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}${o.o ? ` fill-opacity="${o.o}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.sw || 2}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const C = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw === undefined ? 2 : o.sw}"${o.o ? ` fill-opacity="${o.o}"` : ""}/>`;
  /* a pick target drawn on top of the picture: only the transparent frame takes the highlight */
  const hit = (id, x, y, w, h, r = 10) =>
    `<g data-pick="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="transparent" stroke="var(--line)" stroke-width="2"/></g>`;
  const poly = (pts, c, sw = 3) =>
    `<polyline points="${pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  let mkn = 0;
  const arrowDef = (c = "var(--text-dim)") => {
    const id = "xm" + ++mkn;
    return [
      id,
      `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs>`,
    ];
  };
  const rng = (s) => () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  /* =====================================================================
     l1-what
     ===================================================================== */
  const whatMini = (() => {
    const dead = (x, y) =>
      `${C(x, y, 11, { f: "var(--rose-dim)", s: "var(--rose)", sw: 3 })}${T(x, y + 5, "×", { c: "var(--rose-ink)", z: 16 })}`;
    const node = (x, y) => C(x, y, 9, { s: "var(--text-dim)", sw: 3 });
    const panel = (ox, nodes, edges, deadIdx, cap) => {
      const lines = edges
        .map(([a, b]) =>
          L(
            ox + nodes[a][0],
            nodes[a][1],
            ox + nodes[b][0],
            nodes[b][1],
            deadIdx.includes(a) || deadIdx.includes(b)
              ? { c: "var(--rose-edge)", d: "4 4", sw: 2 }
              : { c: "var(--blue)", sw: 3 },
          ),
        )
        .join("");
      const dots = nodes.map(([x, y], i) => (deadIdx.includes(i) ? dead(ox + x, y) : node(ox + x, y))).join("");
      return `${R(ox, 4, 138, 168, { r: 14 })}${lines}${dots}${T(ox + 69, 142, cap[0], { z: 12, c: "var(--text-dim)" })}${T(ox + 69, 158, cap[1], { z: 12, c: "var(--text-dim)" })}`;
    };
    const star = [
      [69, 66],
      ...[-90, -18, 54, 126, 198].map((a) => [
        69 + 48 * Math.cos((a * Math.PI) / 180),
        66 + 48 * Math.sin((a * Math.PI) / 180),
      ]),
    ];
    const ring = [0, 60, 120, 180, 240, 300].map((a) => [
      69 + 46 * Math.cos((a * Math.PI) / 180),
      66 + 46 * Math.sin((a * Math.PI) / 180),
    ]);
    const chain = [0, 1, 2, 3, 4].map((i) => [20 + i * 25, 66]);
    return svg(
      440,
      178,
      `
      ${panel(
        0,
        star,
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
        ],
        [0],
        ["One hub gives", "all the orders"],
      )}
      ${panel(
        151,
        ring,
        [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 0],
          [1, 4],
          [2, 5],
        ],
        [0],
        ["Peers talk to", "their neighbours"],
      )}
      ${panel(
        302,
        chain,
        [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
        [2],
        ["A chain of", "hand-offs"],
      )}
      ${hit("a", 0, 4, 138, 168, 14)}${hit("b", 151, 4, 138, 168, 14)}${hit("c", 302, 4, 138, 168, 14)}`,
    );
  })();

  const whatColonies = (() => {
    const vals = [92, 8, 95, 87, 11],
      x0 = 62,
      bw = 40,
      gap = 20,
      base = 190,
      top = 30,
      H = base - top;
    const bars = vals
      .map((v, i) => {
        const x = x0 + i * (bw + gap),
          h = (v / 100) * H;
        return `${R(x, base - h, bw, h, { f: "var(--blue)", s: "var(--blue-ink)", r: 5 })}${T(x + bw / 2, base - h - 6, v + "%", { z: 14 })}${T(x + bw / 2, base + 18, "Colony " + (i + 1), { z: 12, c: "var(--text-dim)" })}`;
      })
      .join("");
    const y50 = base - H / 2;
    return svg(
      420,
      220,
      `
      ${L(x0 - 8, base, 410, base)}${L(x0 - 8, top, x0 - 8, base)}
      ${L(x0 - 8, y50, 410, y50, { c: "var(--amber)", d: "6 5" })}${T(24, y50 + 5, "50%", { z: 12, c: "var(--amber-ink)" })}
      ${T(24, top + 5, "100%", { z: 12, c: "var(--text-dim)" })}${T(24, base + 4, "0%", { z: 12, c: "var(--text-dim)" })}
      ${bars}${T(236, 16, "Share of ants on route A after one hour", { z: 13, c: "var(--text-dim)" })}`,
    );
  })();

  const whatTable = (() => {
    const rows = [
      [["Sort a million", "names"], "Yes", "Yes", "No"],
      [["Plan a 300-stop", "courier round"], "Yes", "No", "Yes"],
      [["Pick the", "funniest joke"], "No", "No", "Yes"],
      [["Solve", "3x + 2 = 11"], "Yes", "Yes", "No"],
    ];
    const ids = ["a", "b", "c", "d"],
      cols = [128, 208, 288],
      y0 = 56,
      rh = 54;
    let g =
      ["Can we", "Fast exact", "Good enough"]
        .map((s, i) => T(cols[i] + 40, 16, s, { z: 12, c: "var(--text-dim)" }))
        .join("") +
      ["score it?", "method?", "is fine?"]
        .map((s, i) => T(cols[i] + 40, 33, s, { z: 12, c: "var(--text-dim)" }))
        .join("");
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(10, y + 22, r[0][0], { a: "start", z: 13 }) + T(10, y + 40, r[0][1], { a: "start", z: 13 });
      for (let k = 1; k <= 3; k++) {
        const yes = r[k] === "Yes";
        g +=
          R(cols[k - 1] + 6, y + 10, 68, 32, {
            f: yes ? "var(--blue-dim)" : "var(--bg-2)",
            s: yes ? "var(--blue-edge)" : "var(--line-2)",
            r: 16,
          }) + T(cols[k - 1] + 40, y + 31, r[k], { z: 14, c: yes ? "var(--blue-ink)" : "var(--text-dim)" });
      }
    });
    rows.forEach((_, i) => (g += hit(ids[i], 3, y0 + i * rh + 2, 374, rh - 4, 12)));
    return svg(380, y0 + rows.length * rh + 4, g);
  })();

  const whatGroups = (() => {
    const data = [
        ["10", 100, 98, 40],
        ["20", 100, 97, 28],
        ["50", 0, 95, 15],
        ["200", 0, 93, 6],
      ],
      x0 = 54,
      gw = 90,
      base = 200,
      top = 34,
      H = base - top;
    const col = ["var(--blue)", "var(--teal)", "var(--amber)"],
      ink = ["var(--blue-ink)", "var(--teal-ink)", "var(--amber-ink)"];
    let g = L(x0 - 6, base, 432, base) + L(x0 - 6, top, x0 - 6, base);
    [0, 50, 100].forEach((v) => {
      const y = base - (v / 100) * H;
      g +=
        T(x0 - 12, y + 4, v, { a: "end", z: 12, c: "var(--text-dim)" }) +
        (v ? L(x0 - 6, y, 432, y, { c: "var(--line)", sw: 1 }) : "");
    });
    data.forEach((d, gi) => {
      const gx = x0 + gi * gw;
      for (let k = 0; k < 3; k++) {
        const v = d[k + 1],
          x = gx + 6 + k * 26,
          h = (v / 100) * H;
        if (v === 0) g += T(x + 12, base - 8, "✗", { z: 15, c: "var(--rose-ink)" });
        else g += R(x, base - h, 24, h, { f: col[k], s: ink[k], r: 4, sw: 1.5 });
      }
      g += T(gx + 45, base + 18, d[0] + " stops", { z: 13 });
    });
    g += [
      ["Exact search", 0],
      ["Evolutionary algorithm", 1],
      ["Random guessing", 2],
    ]
      .map(
        ([s, k], i) =>
          R(10 + [0, 98, 292][i], 6, 12, 12, { f: col[k], s: ink[k], r: 3, sw: 1.5 }) +
          T(26 + [0, 98, 292][i], 16, s, { a: "start", z: 12 }),
      )
      .join("");
    g +=
      T(22, base + 38, "Score = % of the best plan known.", { a: "start", z: 12, c: "var(--text-dim)" }) +
      T(22, base + 56, "✗ = no answer within the time limit.", { a: "start", z: 12, c: "var(--text-dim)" });
    return svg(440, 262, g);
  })();

  B.add("l1-what", [
    {
      type: "pick",
      q: "Each design below loses the member marked with a red cross. Which design carries on working as a whole, the way an ant colony does when ants disappear?",
      fig: whatMini,
      a: "b",
      why: "In the hub design the hub gives every order, so losing it leaves five workers with nobody to listen to. In the chain, losing a middle link cuts the group in two. In the peer design each member only needs its neighbours, and the remaining members are still joined up. A colony is built like that: no member is essential, so the group keeps going.",
    },
    {
      type: "mcq",
      q: "Five colonies each had two routes to food, and the two routes were exactly the same length. The bars show the share of each colony's ants using route A after an hour. What best explains the pattern?",
      fig: whatColonies,
      o: [
        "A few early ants happen to favour one route, and trail feedback then locks the whole colony onto it",
        "The ants cannot tell equal routes apart, so every colony spreads its ants evenly between the two routes",
        "Route A is a little shorter in some trials, and the colonies that chose B missed that difference",
        "The scent fades far too quickly for a route to build up, so each colony picks a fresh route every minute",
      ],
      a: 0,
      why: "With equal routes there is nothing to prefer at first. Chance gives one route a few extra ants, they lay extra scent, and the scent draws more ants. Each colony ends up committed to a single route, but which one is down to luck, so some pick A and some pick B. An even split is the unstable middle, not the usual result.",
    },
    {
      type: "bug",
      q: "This colony simulation should use local rules only: every ant reacts to the scent next to it, and nobody gives orders. Click the line that breaks that.",
      code: [
        "for ant in colony:",
        "    scent = trail.near(ant.pos)",
        "    ant.move(boss.route_for(ant))",
        "    trail.add(ant.pos)",
      ],
      a: 2,
      why: "boss.route_for(ant) is a central controller handing out routes. The point of the ant model is that simple local actions (sniff the nearby trail, move, leave scent) add up to a good colony route with no leader. The move should depend only on the scent the ant has just sniffed.",
    },
    {
      type: "pick",
      q: "A team wants to try a nature-inspired method on one of these jobs. Tap the job where it is the sensible choice.",
      fig: whatTable,
      a: "b",
      why: "The courier round can be scored (total distance) but has no fast exact method, and a good plan in minutes is all that is needed: exactly the niche for nature-inspired methods. Sorting and the equation already have fast exact methods. The joke cannot be scored automatically, and without a score there is nothing for selection to act on.",
    },
    {
      type: "multi",
      q: "A firm compared three ways of planning delivery rounds of different sizes. Select every statement the chart supports.",
      fig: whatGroups,
      o: [
        "On the 10-stop round the exact search did slightly better than the evolutionary algorithm",
        "The evolutionary algorithm reached at least 90% of the best known plan at every size tested",
        "The evolutionary algorithm found the very best plan for the 50-stop round",
        "Random guessing stayed within 10 points of the evolutionary algorithm at every size",
        "At 200 stops only the evolutionary and random methods gave plans, and the evolutionary one was far better",
      ],
      a: [0, 1, 4],
      why: "Exact search wins while the problem is small (100 against 98) but gives no answer in time at 50 and 200 stops. The evolutionary plans stay between 93 and 98, which is at least 90 everywhere. Its 50-stop plan scores 95, so it is close to the best known, but nothing shows it is the best possible. Random guessing falls from 40 to 6, far below the evolutionary plans.",
    },
  ]);

  /* =====================================================================
     l1-monkey
     ===================================================================== */
  const monkeyGrid = (() => {
    const rows = ["01001000", "01001010", "01001010", "11001010", "11101010", "11101001", "11101011"];
    const x0 = 78,
      cw = 30,
      y0 = 34,
      rh = 28;
    let g =
      T(8, 18, "Green = letter matches the target", { a: "start", z: 12, c: "var(--text-dim)" }) +
      T(x0 + 8 * cw + 36, 18, "matches", { z: 12, c: "var(--text-dim)" });
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(10, y + 19, "step " + i, { a: "start", z: 13 });
      [...r].forEach(
        (b, k) =>
          (g += R(
            x0 + k * cw + 1,
            y + 2,
            cw - 4,
            rh - 6,
            b === "1"
              ? { f: "var(--teal)", s: "var(--teal-ink)", r: 5 }
              : { f: "var(--bg-2)", s: "var(--line-2)", r: 5 },
          )),
      );
      g += T(x0 + 8 * cw + 36, y + 19, r.split("1").length - 1 + " / 8", { z: 13 });
    });
    rows.forEach((_, i) => (g += hit("r" + i, 4, y0 + i * rh, 8 * cw + x0 + 62, rh, 8)));
    return svg(400, y0 + rows.length * rh + 6, g);
  })();

  const monkeyTrace = (() => {
    const cell = (x, y, ch, ok) =>
      R(x, y, 30, 30, ok ? { f: "var(--teal-dim)", s: "var(--teal)", r: 6 } : { f: "var(--bg-2)", r: 6 }) +
      T(x + 15, y + 21, ch, { z: 16 });
    const target = "PLANT",
      start = "PIANO";
    let g = T(8, 40, "Target", { a: "start" }) + T(8, 82, "Start", { a: "start" });
    [...target].forEach((ch, i) => (g += cell(78 + i * 34, 20, ch, true)));
    [...start].forEach((ch, i) => (g += cell(78 + i * 34, 62, ch, ch === target[i])));
    g += T(268, 82, "3 letters match", { a: "start", z: 12, c: "var(--text-dim)" });
    const props = ["change letter 2 to L", "change letter 5 to S", "change letter 4 to E", "change letter 1 to B"];
    props.forEach(
      (p, i) =>
        (g +=
          R(8, 112 + i * 34, 384, 28, { r: 8 }) +
          T(24, 131 + i * 34, "Proposal " + (i + 1), { a: "start", c: "var(--blue-ink)" }) +
          T(138, 131 + i * 34, p, { a: "start" })),
    );
    return svg(400, 252, g);
  })();

  const monkeyRuns = (() => {
    const target = "METHINKS IT IS LIKE A WEASEL",
      AL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
    const run = (k, seed, steps) => {
      const r = rng(seed);
      const cur = [...target].map(() => AL[Math.floor(r() * 27)]);
      const sc = (a) => a.reduce((s, c, i) => s + (c === target[i]), 0);
      let cs = sc(cur);
      const out = [cs];
      for (let t = 0; t < steps; t++) {
        const kid = cur.slice();
        for (let j = 0; j < k; j++) kid[Math.floor(r() * 28)] = AL[Math.floor(r() * 27)];
        const ks = sc(kid);
        if (ks >= cs) {
          for (let i = 0; i < 28; i++) cur[i] = kid[i];
          cs = ks;
        }
        out.push(cs);
      }
      return out;
    };
    const N = 2000,
      panels = [
        [1, "1 letter per step"],
        [4, "4 letters per step"],
        [28, "all 28 per step"],
      ];
    let g = "";
    panels.forEach(([k, name], i) => {
      const ox = i * 148 + 4,
        w = 136,
        h = 118,
        x0 = ox + 26,
        y0 = 20,
        y1 = y0 + h;
      const data = run(k, 11, N),
        X = (t) => x0 + (t / N) * (w - 32),
        Y = (v) => y1 - (v / 28) * h;
      const pts = [];
      for (let t = 0; t <= N; t += 20) pts.push([X(t), Y(data[t])]);
      g += R(ox, 2, w, 176, { r: 12 }) + L(x0, y1, ox + w - 6, y1) + L(x0, y0, x0, y1);
      g += L(x0, Y(28), ox + w - 6, Y(28), { c: "var(--teal)", d: "4 4", sw: 1.5 }) + poly(pts, "var(--blue)", 3);
      g +=
        T(ox + 20, Y(28) + 4, "28", { a: "end", z: 11, c: "var(--text-dim)" }) +
        T(ox + 20, y1 + 4, "0", { a: "end", z: 11, c: "var(--text-dim)" });
      g +=
        T(ox + w / 2, y1 + 18, name, { z: 12 }) +
        T(ox + w / 2, y1 + 33, "steps 0 to 2000 →", { z: 11, c: "var(--text-dim)" });
    });
    return svg(450, 184, g);
  })();
  Object.assign(partScope, { C, L, R, T, arrowDef, hit, monkeyGrid, monkeyRuns, monkeyTrace, poly, rng, svg });
})();
