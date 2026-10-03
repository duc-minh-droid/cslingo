(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, hit, svg } = partScope;
  const B = NIC.bank;

  /* =====================================================================
     l2-mst
     ===================================================================== */
  const mstPlans = (() => {
    const pos = { A: [18, 70], B: [58, 24], C: [58, 116], D: [104, 70], E: [148, 24], F: [148, 116] };
    const plans = [
      [
        "1",
        [
          ["C", "D", 1],
          ["A", "B", 2],
          ["E", "F", 2],
          ["B", "C", 3],
          ["D", "E", 3],
        ],
      ],
      [
        "2",
        [
          ["A", "B", 2],
          ["B", "C", 3],
          ["C", "D", 1],
          ["D", "F", 6],
          ["E", "F", 2],
        ],
      ],
      [
        "3",
        [
          ["A", "B", 2],
          ["C", "D", 1],
          ["E", "F", 2],
          ["B", "C", 3],
        ],
      ],
      [
        "4",
        [
          ["A", "C", 4],
          ["B", "C", 3],
          ["C", "D", 1],
          ["D", "E", 3],
          ["E", "F", 2],
        ],
      ],
    ];
    const ox = [4, 176],
      oy = [4, 160];
    let g = "";
    plans.forEach(([name, edges], i) => {
      const x0 = ox[i % 2],
        y0 = oy[Math.floor(i / 2)];
      g += R(x0, y0, 170, 150, { r: 12 });
      edges.forEach(([a, b, c]) => {
        const [x1, y1] = pos[a],
          [x2, y2] = pos[b];
        g += L(x0 + x1, y0 + y1, x0 + x2, y0 + y2, { c: "var(--blue)", sw: 3.5 });
      });
      edges.forEach(([a, b, c]) => {
        const [x1, y1] = pos[a],
          [x2, y2] = pos[b],
          dx = x2 - x1,
          dy = y2 - y1,
          Ln = Math.hypot(dx, dy),
          lx = x0 + (x1 + x2) / 2 - (dy / Ln) * 10,
          ly = y0 + (y1 + y2) / 2 + (dx / Ln) * 10;
        g +=
          R(lx - 8, ly - 9, 16, 18, { f: "var(--panel)", s: "none", r: 4, sw: 0 }) +
          T(lx, ly + 5, c, { z: 14, c: "var(--rose-ink)" });
      });
      Object.entries(pos).forEach(([k, [x, y]]) => (g += C(x0 + x, y0 + y, 9, { s: "var(--text-dim)", sw: 3 })));
      g += T(x0 + 85, y0 + 144, "Plan " + name, { z: 14 }) + hit("p" + name, x0, y0, 170, 150, 12);
    });
    return svg(350, 314, g);
  })();

  const mstTrace = (() => {
    const nodes = { A: [30, 80], B: [105, 25], C: [105, 135], D: [220, 80], E: [330, 25], F: [330, 135] };
    const edges = [
      ["A", "B", 4],
      ["A", "C", 2],
      ["C", "B", 1],
      ["B", "D", 5],
      ["C", "D", 8],
      ["D", "E", 3],
      ["D", "F", 7],
      ["E", "F", 6],
    ];
    const graph = NIC.qfig.graph(nodes, edges, { w: 360, h: 160, r: 16 });
    const rows = [
      ["1", "A – C", 2],
      ["2", "C – B", 1],
      ["3", "B – D", 5],
      ["4", "D – F", 7],
      ["5", "D – E", 3],
    ];
    const tbl = `<table style="border-collapse:separate;border-spacing:4px;margin:6px auto 0;font:800 14px var(--sans);color:var(--text)"><tr style="color:var(--text-dim);font-size:12px"><td>Step</td><td>Edge added</td><td>Cost</td></tr>${rows.map((r) => `<tr><td style="padding:5px 12px;background:var(--bg-2);border-radius:8px;text-align:center">${r[0]}</td><td style="padding:5px 14px;background:var(--blue-dim);border-radius:8px;text-align:center">${r[1]}</td><td style="padding:5px 12px;background:var(--bg-2);border-radius:8px;text-align:center">${r[2]}</td></tr>`).join("")}</table>`;
    return `<div style="max-width:380px;margin:0 auto">${graph}${tbl}</div>`;
  })();

  const mstMatrix = (() => {
    const names = "ABCDE",
      M = { AB: 7, AC: 3, AE: 9, BC: 2, BD: 5, CD: 6, CE: 8, DE: 4 };
    const x0 = 56,
      y0 = 62,
      cs = 52;
    let g = T(180, 16, "Cost of each possible cable (– means none)", { z: 13, c: "var(--text-dim)" });
    [...names].forEach(
      (n, i) =>
        (g +=
          T(x0 + i * cs + cs / 2, y0 - 6, n, { z: 15, c: "var(--blue-ink)" }) +
          T(x0 - 18, y0 + i * cs + cs / 2 + 5, n, { z: 15, c: "var(--blue-ink)" })),
    );
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++) {
        const x = x0 + c * cs,
          y = y0 + r * cs;
        if (c <= r) {
          g += R(x + 2, y + 2, cs - 4, cs - 4, { f: "var(--bg-2)", s: "none", r: 8, sw: 0, o: 0.6 });
          continue;
        }
        const key = names[r] + names[c],
          v = M[key];
        if (v === undefined) {
          g +=
            R(x + 2, y + 2, cs - 4, cs - 4, { r: 8, sw: 1.5 }) +
            T(x + cs / 2, y + cs / 2 + 5, "–", { z: 16, c: "var(--text-faint)" });
          continue;
        }
        g +=
          R(x + 2, y + 2, cs - 4, cs - 4, { r: 8, f: "var(--panel)", s: "var(--line-2)" }) +
          T(x + cs / 2, y + cs / 2 + 6, v, { z: 17 }) +
          hit(key, x + 2, y + 2, cs - 4, cs - 4, 8);
      }
    return svg(330, y0 + 5 * cs + 8, g);
  })();

  const mstLoop = (() => {
    const N = { A: [34, 150], B: [114, 150], C: [114, 50], D: [254, 50], E: [254, 150], F: [346, 150] };
    const tree = [
      ["A", "B", 9],
      ["B", "C", 4],
      ["C", "D", 6],
      ["D", "E", 2],
      ["E", "F", 5],
    ];
    let g =
      L(N.B[0] + 18, N.B[1], N.E[0] - 18, N.E[1], { c: "var(--amber)", d: "7 6", sw: 4 }) +
      T(184, 140, "new link: 3", { z: 13, c: "var(--amber-ink)" });
    tree.forEach(([a, b, w]) => {
      const [x1, y1] = N[a],
        [x2, y2] = N[b],
        dx = x2 - x1,
        dy = y2 - y1,
        Ln = Math.hypot(dx, dy),
        sx = x1 + (dx / Ln) * 18,
        sy = y1 + (dy / Ln) * 18,
        ex = x2 - (dx / Ln) * 18,
        ey = y2 - (dy / Ln) * 18;
      const mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2,
        vert = Math.abs(dx) < 1;
      g +=
        `<g data-pick="${a}${b}">${L(sx, sy, ex, ey, { c: "var(--blue)", sw: 4 })}<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="transparent" stroke-width="22"/></g>` +
        T(vert ? mx + (x1 < 200 ? -15 : 15) : mx, vert ? my + 5 : my - 12, w, { z: 14, c: "var(--rose-ink)" });
    });
    Object.entries(N).forEach(
      ([k, [x, y]]) => (g += C(x, y, 18, { s: "var(--text-dim)", sw: 3 }) + T(x, y + 5, k, { z: 15 })),
    );
    return svg(380, 190, g);
  })();

  B.add("l2-mst", [
    {
      type: "pick",
      q: "Six towns A to F must be joined by cable. Each plan shows the links it would lay, with the cost of each link in red. Tap the plan with the lowest total cost among those that really connect all six towns with no loops.",
      fig: mstPlans,
      a: "p1",
      hint: "First check each plan reaches all six towns. Then add up the costs of the ones that do.",
      why: "Plan 1 costs 1 + 2 + 2 + 3 + 3 = 11 and reaches every town. Plan 4 costs 13 and plan 2 costs 14, both valid trees, but dearer. Plan 3 is the cheapest at 8 but leaves two towns cut off from the rest, so it does not count. A spanning tree on 6 towns needs exactly 5 links.",
    },
    {
      type: "mcq",
      q: "A student runs Prim's algorithm from town A on the network below and records the steps in the table. Prim always adds the cheapest link that joins the tree to a new town. Which step first breaks that rule?",
      fig: mstTrace,
      o: ["Step 2", "Step 3", "Step 4", "Step 5"],
      a: 2,
      hint: "At each step, list the links that join the tree so far to a town outside it, and compare.",
      why: "At step 4 the tree is A, B, C and D. The links leaving it are D–E (3) and D–F (7), so Prim must add D–E. The student added D–F (7). Steps 2 and 5 look suspicious because their costs go down, but Prim's costs need not rise: they just have to be the cheapest on offer at the time (at step 2, C–B at 1 was available once C was in the tree).",
    },
    {
      type: "pick",
      q: "The table gives the cost of each possible cable between five towns (– means no cable can be laid). Run Prim's algorithm from town A and select the cell of every cable it adds.",
      fig: mstMatrix,
      a: ["AC", "BC", "BD", "DE"],
      why: "From A the cheapest cable is A–C (3). The tree {A, C} can reach B for 2 (B–C, cheaper than A–B at 7). Then {A, B, C} reaches D by B–D (5, cheaper than C–D at 6). Finally {A, B, C, D} reaches E by D–E (4, cheaper than C–E at 8 or A–E at 9). Four cables for five towns, total 3 + 2 + 5 + 4 = 14.",
    },
    {
      type: "pick",
      q: "These cables (with their costs) form a cheapest spanning tree. A new link between B and E, costing 3, becomes available (dashed). Adding it makes a loop. To end with a spanning tree that is as cheap as possible, which existing cable should be removed? Tap it.",
      fig: mstLoop,
      a: "CD",
      why: "The new link creates the loop B–C–D–E–B, with costs 4, 6, 2 and 3. Any one cable on the loop can go without disconnecting anyone, so the best swap removes the dearest one on it: C–D at 6. That cuts the total by 3. A–B costs more (9) but is not on the loop, and removing it would cut off town A.",
    },
    {
      type: "cat",
      q: "A network firm asks for the cheapest set of cables joining some sites. Which versions are plain minimum spanning tree problems, where greedy Prim is optimal, and which add a rule that makes the problem hard?",
      buckets: ["Plain MST", "Constrained, hard"],
      items: [
        ["Join 9 offices with the least total cable; any office can host any number of cables", 0],
        ["Join 9 offices, but no office may have more than 3 cables on its patch panel", 1],
        ["Join 12 villages by the cheapest total length of pipe, any layout allowed", 0],
        ["Join 12 villages by pipe, but the route between two named hospitals may use at most 4 pipes", 1],
        ["Join 30 towns by the cheapest road network, with no other rules", 0],
        ["Join 30 towns, but some pairs of towns need a minimum bandwidth between them", 1],
      ],
      why: "Without extra rules, Prim is greedy and provably optimal, however many sites there are. Adding a degree limit, a limit on route length or bandwidth needs between pairs makes many trees infeasible and greedy choices can trap you, and no fast exact method is known. Real networks are usually the constrained kind.",
    },
  ]);
})();
