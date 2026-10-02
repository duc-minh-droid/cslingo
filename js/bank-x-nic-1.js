/* Revision bank, third set of varied, visual questions (nic-1).
   Modules: l1-what, l1-monkey, l1-ingredients, l1-apps, l2-generic, l2-optim, l2-complexity, l2-mst (5 each).
   Each figure carries the information its question needs. Data for the charts is computed by small
   seeded simulations of the real algorithms below, so every number on screen is genuine. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.z || 13}px var(--sans);fill:${o.c || "var(--text)"};pointer-events:none">${s}</text>`;
  const R = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r === undefined ? 6 : o.r}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw === undefined ? 2 : o.sw}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}${o.o ? ` fill-opacity="${o.o}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.sw || 2}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const C = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw === undefined ? 2 : o.sw}"${o.o ? ` fill-opacity="${o.o}"` : ""}/>`;
  /* a pick target drawn on top of the picture: only the transparent frame takes the highlight */
  const hit = (id, x, y, w, h, r = 10) => `<g data-pick="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="transparent" stroke="var(--line)" stroke-width="2"/></g>`;
  const poly = (pts, c, sw = 3) => `<polyline points="${pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  let mkn = 0;
  const arrowDef = (c = "var(--text-dim)") => { const id = "xm" + ++mkn; return [id, `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs>`]; };
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  /* =====================================================================
     l1-what
     ===================================================================== */
  const whatMini = (() => {
    const dead = (x, y) => `${C(x, y, 11, { f: "var(--rose-dim)", s: "var(--rose)", sw: 3 })}${T(x, y + 5, "×", { c: "var(--rose-ink)", z: 16 })}`;
    const node = (x, y) => C(x, y, 9, { s: "var(--text-dim)", sw: 3 });
    const panel = (ox, nodes, edges, deadIdx, cap) => {
      const lines = edges.map(([a, b]) => L(ox + nodes[a][0], nodes[a][1], ox + nodes[b][0], nodes[b][1], deadIdx.includes(a) || deadIdx.includes(b) ? { c: "var(--rose-edge)", d: "4 4", sw: 2 } : { c: "var(--blue)", sw: 3 })).join("");
      const dots = nodes.map(([x, y], i) => (deadIdx.includes(i) ? dead(ox + x, y) : node(ox + x, y))).join("");
      return `${R(ox, 4, 138, 168, { r: 14 })}${lines}${dots}${T(ox + 69, 142, cap[0], { z: 12, c: "var(--text-dim)" })}${T(ox + 69, 158, cap[1], { z: 12, c: "var(--text-dim)" })}`;
    };
    const star = [[69, 66], ...[-90, -18, 54, 126, 198].map((a) => [69 + 48 * Math.cos((a * Math.PI) / 180), 66 + 48 * Math.sin((a * Math.PI) / 180)])];
    const ring = [0, 60, 120, 180, 240, 300].map((a) => [69 + 46 * Math.cos((a * Math.PI) / 180), 66 + 46 * Math.sin((a * Math.PI) / 180)]);
    const chain = [0, 1, 2, 3, 4].map((i) => [20 + i * 25, 66]);
    return svg(440, 178, `
      ${panel(0, star, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]], [0], ["One hub gives", "all the orders"])}
      ${panel(151, ring, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [2, 5]], [0], ["Peers talk to", "their neighbours"])}
      ${panel(302, chain, [[0, 1], [1, 2], [2, 3], [3, 4]], [2], ["A chain of", "hand-offs"])}
      ${hit("a", 0, 4, 138, 168, 14)}${hit("b", 151, 4, 138, 168, 14)}${hit("c", 302, 4, 138, 168, 14)}`);
  })();

  const whatColonies = (() => {
    const vals = [92, 8, 95, 87, 11], x0 = 62, bw = 40, gap = 20, base = 190, top = 30, H = base - top;
    const bars = vals.map((v, i) => {
      const x = x0 + i * (bw + gap), h = (v / 100) * H;
      return `${R(x, base - h, bw, h, { f: "var(--blue)", s: "var(--blue-ink)", r: 5 })}${T(x + bw / 2, base - h - 6, v + "%", { z: 14 })}${T(x + bw / 2, base + 18, "Colony " + (i + 1), { z: 12, c: "var(--text-dim)" })}`;
    }).join("");
    const y50 = base - H / 2;
    return svg(420, 220, `
      ${L(x0 - 8, base, 410, base)}${L(x0 - 8, top, x0 - 8, base)}
      ${L(x0 - 8, y50, 410, y50, { c: "var(--amber)", d: "6 5" })}${T(24, y50 + 5, "50%", { z: 12, c: "var(--amber-ink)" })}
      ${T(24, top + 5, "100%", { z: 12, c: "var(--text-dim)" })}${T(24, base + 4, "0%", { z: 12, c: "var(--text-dim)" })}
      ${bars}${T(236, 16, "Share of ants on route A after one hour", { z: 13, c: "var(--text-dim)" })}`);
  })();

  const whatTable = (() => {
    const rows = [
      ["Sort a million names", "Yes", "Yes", "No"],
      ["300-stop courier round", "Yes", "No", "Yes"],
      ["Pick the funniest joke", "No", "No", "Yes"],
      ["Solve 3x + 2 = 11", "Yes", "Yes", "No"],
    ];
    const ids = ["a", "b", "c", "d"], cols = [180, 262, 344], y0 = 52, rh = 46;
    let g = [T(12, 28, "Job", { a: "start", c: "var(--text-dim)", z: 13 }), ...["Can we score", "Fast exact", "Is a good"].map((s, i) => T(cols[i] + 38, 20, s, { z: 12, c: "var(--text-dim)" })), ...["answers?", "method known?", "answer fine?"].map((s, i) => T(cols[i] + 38, 35, s, { z: 12, c: "var(--text-dim)" }))].join("");
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(12, y + 28, r[0], { a: "start", z: 13 });
      for (let k = 1; k <= 3; k++) {
        const yes = r[k] === "Yes";
        g += R(cols[k - 1] + 6, y + 8, 64, 30, { f: yes ? "var(--blue-dim)" : "var(--bg-2)", s: yes ? "var(--blue-edge)" : "var(--line-2)", r: 15 }) + T(cols[k - 1] + 38, y + 28, r[k], { c: yes ? "var(--blue-ink)" : "var(--text-dim)" });
      }
    });
    rows.forEach((_, i) => (g += hit(ids[i], 3, y0 + i * rh + 2, 434, rh - 4, 12)));
    return svg(440, y0 + rows.length * rh + 4, g);
  })();

  const whatGroups = (() => {
    const data = [["10", 100, 98, 40], ["20", 100, 97, 28], ["50", 0, 95, 15], ["200", 0, 93, 6]], x0 = 54, gw = 90, base = 200, top = 34, H = base - top;
    const col = ["var(--blue)", "var(--teal)", "var(--amber)"], ink = ["var(--blue-ink)", "var(--teal-ink)", "var(--amber-ink)"];
    let g = L(x0 - 6, base, 432, base) + L(x0 - 6, top, x0 - 6, base);
    [0, 50, 100].forEach((v) => { const y = base - (v / 100) * H; g += T(x0 - 12, y + 4, v, { a: "end", z: 12, c: "var(--text-dim)" }) + (v ? L(x0 - 6, y, 432, y, { c: "var(--line)", sw: 1 }) : ""); });
    data.forEach((d, gi) => {
      const gx = x0 + gi * gw;
      for (let k = 0; k < 3; k++) {
        const v = d[k + 1], x = gx + 6 + k * 26, h = (v / 100) * H;
        if (v === 0) g += T(x + 12, base - 8, "none", { z: 11, c: "var(--rose-ink)" });
        else g += R(x, base - h, 24, h, { f: col[k], s: ink[k], r: 4, sw: 1.5 });
      }
      g += T(gx + 45, base + 18, d[0] + " stops", { z: 13 });
    });
    g += [["Exact search", 0], ["Evolutionary algorithm", 1], ["Random guessing", 2]].map(([s, k], i) => R(10 + [0, 98, 292][i], 6, 12, 12, { f: col[k], s: ink[k], r: 3, sw: 1.5 }) + T(26 + [0, 98, 292][i], 16, s, { a: "start", z: 12 })).join("");
    g += T(22, base + 36, "Score = % of the best plan known. “none” = no answer within the time limit.", { a: "start", z: 12, c: "var(--text-dim)" });
    return svg(440, 244, g);
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
    const x0 = 78, cw = 30, y0 = 34, rh = 28;
    let g = T(8, 18, "Green = letter matches the target", { a: "start", z: 12, c: "var(--text-dim)" }) + T(x0 + 8 * cw + 36, 18, "matches", { z: 12, c: "var(--text-dim)" });
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(10, y + 19, "step " + i, { a: "start", z: 13 });
      [...r].forEach((b, k) => (g += R(x0 + k * cw + 1, y + 2, cw - 4, rh - 6, b === "1" ? { f: "var(--teal)", s: "var(--teal-ink)", r: 5 } : { f: "var(--bg-2)", s: "var(--line-2)", r: 5 })));
      g += T(x0 + 8 * cw + 36, y + 19, r.split("1").length - 1 + " / 8", { z: 13 });
    });
    rows.forEach((_, i) => (g += hit("r" + i, 4, y0 + i * rh, 8 * cw + x0 + 62, rh, 8)));
    return svg(400, y0 + rows.length * rh + 6, g);
  })();

  const monkeyTrace = (() => {
    const cell = (x, y, ch, ok) => R(x, y, 30, 30, ok ? { f: "var(--teal-dim)", s: "var(--teal)", r: 6 } : { f: "var(--bg-2)", r: 6 }) + T(x + 15, y + 21, ch, { z: 16 });
    const target = "PLANT", start = "PIANO";
    let g = T(8, 40, "Target", { a: "start" }) + T(8, 82, "Start", { a: "start" });
    [...target].forEach((ch, i) => (g += cell(78 + i * 34, 20, ch, true)));
    [...start].forEach((ch, i) => (g += cell(78 + i * 34, 62, ch, ch === target[i])));
    g += T(268, 82, "3 letters match", { a: "start", z: 12, c: "var(--text-dim)" });
    const props = ["change letter 2 to L", "change letter 5 to S", "change letter 4 to E", "change letter 1 to B"];
    props.forEach((p, i) => (g += R(8, 112 + i * 34, 384, 28, { r: 8 }) + T(24, 131 + i * 34, "Proposal " + (i + 1), { a: "start", c: "var(--blue-ink)" }) + T(138, 131 + i * 34, p, { a: "start" })));
    return svg(400, 252, g);
  })();

  const monkeyRuns = (() => {
    const target = "METHINKS IT IS LIKE A WEASEL", AL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
    const run = (k, seed, steps) => {
      const r = rng(seed); const cur = [...target].map(() => AL[Math.floor(r() * 27)]);
      const sc = (a) => a.reduce((s, c, i) => s + (c === target[i]), 0); let cs = sc(cur); const out = [cs];
      for (let t = 0; t < steps; t++) { const kid = cur.slice(); for (let j = 0; j < k; j++) kid[Math.floor(r() * 28)] = AL[Math.floor(r() * 27)]; const ks = sc(kid); if (ks >= cs) { for (let i = 0; i < 28; i++) cur[i] = kid[i]; cs = ks; } out.push(cs); }
      return out;
    };
    const N = 2000, panels = [[1, "1 letter per step"], [4, "4 letters per step"], [28, "all 28 per step"]];
    let g = "";
    panels.forEach(([k, name], i) => {
      const ox = i * 148 + 4, w = 136, h = 118, x0 = ox + 26, y0 = 20, y1 = y0 + h;
      const data = run(k, 11, N), X = (t) => x0 + (t / N) * (w - 32), Y = (v) => y1 - (v / 28) * h;
      const pts = []; for (let t = 0; t <= N; t += 20) pts.push([X(t), Y(data[t])]);
      g += R(ox, 2, w, 176, { r: 12 }) + L(x0, y1, ox + w - 6, y1) + L(x0, y0, x0, y1);
      g += L(x0, Y(28), ox + w - 6, Y(28), { c: "var(--teal)", d: "4 4", sw: 1.5 }) + poly(pts, "var(--blue)", 3);
      g += T(ox + 20, Y(28) + 4, "28", { a: "end", z: 11, c: "var(--text-dim)" }) + T(ox + 20, y1 + 4, "0", { a: "end", z: 11, c: "var(--text-dim)" });
      g += T(ox + w / 2, y1 + 18, name, { z: 12 }) + T(ox + w / 2, y1 + 33, "steps 0 to 2000 →", { z: 11, c: "var(--text-dim)" });
    });
    return svg(450, 184, g);
  })();

  const monkeyCycle = (() => {
    const [id, defs] = arrowDef();
    const bx = [[20, 40], [250, 40], [250, 170], [20, 170]], names = [["Make a child:", "change one letter"], ["Count how many", "letters match"], ["Keep the child unless", "it matches fewer"], ["The kept string", "becomes the parent"]];
    const w = 170, h = 56;
    let g = defs;
    g += `<path d="M${bx[0][0] + w} ${bx[0][1] + h / 2} L${bx[1][0] - 4} ${bx[1][1] + h / 2}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[1][0] + w / 2} ${bx[1][1] + h + 2} L${bx[2][0] + w / 2} ${bx[2][1] - 6}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[2][0] - 2} ${bx[2][1] + h / 2} L${bx[3][0] + w + 6} ${bx[3][1] + h / 2}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[3][0] + w / 2} ${bx[3][1] - 2} L${bx[0][0] + w / 2} ${bx[0][1] + h + 6}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    bx.forEach(([x, y], i) => {
      g += `<g data-pick="b${i + 1}">${R(x, y, w, h, { r: 14, s: "var(--blue-edge)", f: "var(--blue-dim)", sw: 3 })}</g>${T(x + w / 2, y + 24, names[i][0], { z: 13, c: "var(--ink)" })}${T(x + w / 2, y + 42, names[i][1], { z: 13, c: "var(--ink)" })}`;
    });
    return svg(440, 250, g);
  })();

  B.add("l1-monkey", [
    {
      type: "pick",
      q: "A keep-if-better run changes exactly ONE letter per step and keeps the child if its match count does not drop. Each row shows which of 8 letters match the target after that step. (A wrong letter swapped for another wrong letter does not show.) One row cannot have come from the row above it under these rules. Tap it.",
      fig: monkeyGrid,
      a: "r5",
      why: "From step 4 to step 5 the count stays at 5, which is allowed on its own, but look at which letters moved: letter 7 went from right to wrong while letter 8 went from wrong to right. That is two letters changed in one step. Steps 1 to 2 look identical because a wrong letter became another wrong letter, which is a legal, unseen change.",
    },
    {
      type: "mcq",
      q: "Keep-if-better changes one letter and keeps the child if its match count is not lower than its parent's. Starting from PIANO (target PLANT), the four proposals below are tried in order. What is the current string after proposal 4?",
      fig: monkeyTrace,
      o: ["PLANS", "PLANO", "BLANS", "PLAES"],
      a: 0,
      hint: "Count matches after each proposal. Only the proposals that do not lower the count are kept.",
      why: "Proposal 1 gives PLANO (4 matches, up from 3): kept. Proposal 2 gives PLANS (still 4 matches): not worse, so it is kept. Proposal 3 would give PLAES (3 matches) and proposal 4 would give BLANS (3 matches): both worse, so both are thrown away. The string stays PLANS. Accepting equal scores is what lets the search drift across flat patches.",
    },
    {
      type: "bug",
      q: "This keep-if-better search is meant to build on its improvements, but it never gets further than one lucky letter beyond where it started. Click the faulty line.",
      code: [
        "start = random_text()",
        "best = start",
        "for step in range(5000):",
        "    kid = mutate(start)",
        "    if score(kid) >= score(best):",
        "        best = kid",
      ],
      a: 3,
      why: "Every child is made from the original start string, not from the current best. Improvements are recorded in best but never built on, so the search can only ever beat start by a single change. The child must be made from the current best: mutate(best).",
    },
    {
      type: "mcq",
      q: "Three runs of one search try to match a 28-letter sentence. Each step they re-roll some random letters and keep the child if its match count is not lower. The runs differ only in how many letters they re-roll per step. The middle run shot ahead early but then crawled at about 19. Why?",
      fig: monkeyRuns,
      o: [
        "Near the end, re-rolling four at once nearly always spoils a right letter, so few children are kept",
        "Once about 19 of the 28 letters are right, there are no different letters left for it to try out",
        "Keep-if-better only lets a child be kept while the match count is below about 20, then it switches off",
        "Re-rolling four letters costs four times as much, so its curve is simply the same one stretched sideways",
      ],
      a: 0,
      why: "Early on almost any change helps, so big steps are fast. Near the end most letters are right, and four random changes almost surely break a right letter without fixing a wrong one, so the child scores lower and is rejected. The one-letter run is slower at first but keeps finding the odd improvement. Re-rolling all 28 letters is little better than random typing.",
    },
    {
      type: "pick",
      q: "In nature the environment “scores” each offspring by how well it survives. Which box of this keep-if-better loop does that job?",
      fig: monkeyCycle,
      a: "b2",
      why: "Counting the matching letters is the fitness function: it is the judge of how well a child does, like the environment. Box 1 is variation (mutation), box 3 is selection (acting on the score) and box 4 is the next generation.",
    },
  ]);

  /* =====================================================================
     l1-ingredients
     ===================================================================== */
  const ingGrids = (() => {
    const r = rng(20), Ln = 10, P = 6;
    let pop = Array.from({ length: P }, () => Array.from({ length: Ln }, () => (r() < 0.5 ? 1 : 0)));
    const fit = (a) => a.reduce((s, b) => s + b, 0);
    const snaps = { 0: pop.map((a) => a.slice()) };
    for (let gI = 1; gI <= 30; gI++) {
      const np = [];
      for (let i = 0; i < P; i++) { const a = pop[Math.floor(r() * P)], b = pop[Math.floor(r() * P)]; np.push((fit(a) >= fit(b) ? a : b).slice()); }
      pop = np; if (gI === 4 || gI === 30) snaps[gI] = pop.map((a) => a.slice());
    }
    const names = [["a", 0, "generation 0"], ["b", 4, "generation 4"], ["c", 30, "generation 30"]];
    let g = "";
    names.forEach(([id, gen, label], pi) => {
      const ox = 6 + pi * 148, cell = 11;
      g += R(ox, 2, 136, 128, { r: 12 });
      snaps[gen].forEach((row, i) => row.forEach((b, k) => (g += R(ox + 13 + k * cell, 12 + i * cell + i * 3, cell - 1, cell + 1, b ? { f: "var(--blue)", s: "var(--blue-ink)", r: 2, sw: 1 } : { f: "var(--bg-2)", s: "var(--line-2)", r: 2, sw: 1 }))));
      g += T(ox + 68, 120, label, { z: 13 });
      g += hit(id, ox, 2, 136, 128, 12);
    });
    return svg(450, 136, g);
  })();

  const ingBars = (() => {
    const schemes = [
      ["s1", "A: always take the single fittest", [100, 0, 0, 0]],
      ["s2", "B: anyone, with equal chance", [25, 25, 25, 25]],
      ["s3", "C: chance proportional to fitness", [50, 31.25, 12.5, 6.25]],
      ["s4", "D: pick from the fittest two only", [50, 50, 0, 0]],
      ["s5", "E: chance by rank (4, 3, 2, 1 shares)", [40, 30, 20, 10]],
    ];
    const col = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"], ink = ["var(--teal-ink)", "var(--blue-ink)", "var(--amber-ink)", "var(--violet-ink)"];
    const x0 = 16, W = 400, y0 = 36, rh = 46;
    let g = ["Fittest", "2nd", "3rd", "4th"].map((s, i) => R(x0 + i * 100, 8, 12, 12, { f: col[i], s: ink[i], r: 3, sw: 1.5 }) + T(x0 + 18 + i * 100, 18, s, { a: "start", z: 12 })).join("");
    schemes.forEach(([id, name, ps], i) => {
      const y = y0 + i * rh;
      g += T(x0, y + 12, name, { a: "start", z: 13 });
      let x = x0;
      ps.forEach((p, k) => {
        const w = (p / 100) * W; if (!w) return;
        g += R(x, y + 18, w, 20, { f: col[k], s: ink[k], r: 0, sw: 1.5 }) + (w > 30 ? T(x + w / 2, y + 33, (p % 1 ? p.toFixed(1) : p) + "%", { z: 12, c: "#fff" }) : "");
        x += w;
      });
      g += hit(id, x0 - 8, y - 2, W + 16, 44, 8);
    });
    return svg(440, y0 + schemes.length * rh, g);
  })();

  const ingDots = (() => {
    const f = (x) => 0.6 * Math.exp(-(((x - 0.2) / 0.08) ** 2)) + 1.0 * Math.exp(-(((x - 0.72) / 0.1) ** 2));
    const r = rng(2 * 131);
    const climb = (x) => { for (let t = 0; t < 200; t++) { const y = Math.min(1, Math.max(0, x + (r() < 0.5 ? -0.02 : 0.02))); if (f(y) >= f(x)) x = y; } return x; };
    const sizes = [1, 2, 4, 8], res = {};
    sizes.forEach((N) => { res[N] = []; for (let k = 0; k < 12; k++) { let best = 0; for (let j = 0; j < N; j++) best = Math.max(best, f(climb(r()))); res[N].push(best); } });
    const x0 = 56, cw = 88, y1 = 196, y0 = 24, Y = (v) => y1 - ((v - 0.5) / 0.55) * (y1 - y0);
    let g = L(x0 - 10, y1, 430, y1) + L(x0 - 10, y0 - 6, x0 - 10, y1);
    g += L(x0 - 10, Y(1), 430, Y(1), { c: "var(--teal)", d: "5 5", sw: 1.5 }) + T(x0 - 14, Y(1) + 4, "big", { a: "end", z: 12, c: "var(--teal-ink)" });
    g += L(x0 - 10, Y(0.6), 430, Y(0.6), { c: "var(--amber)", d: "5 5", sw: 1.5 }) + T(x0 - 14, Y(0.6) + 4, "small", { a: "end", z: 12, c: "var(--amber-ink)" });
    sizes.forEach((N, i) => {
      const cx = x0 + 10 + i * cw + cw / 2 - 4;
      res[N].forEach((v, k) => (g += C(cx + ((k % 4) - 1.5) * 11, Y(Math.min(v, 1.02)) + 0, 4.5, { f: v > 0.9 ? "var(--teal)" : "var(--amber)", s: "var(--panel)", sw: 1 })));
      g += T(cx, y1 + 20, N === 1 ? "1 climber" : N + " climbers", { z: 13 });
      g += hit("n" + N, cx - cw / 2 + 2, y0 - 8, cw - 4, y1 - y0 + 34, 10);
    });
    return svg(440, 232, g);
  })();

  const ingCut = (() => {
    const P1 = "1110100011", P2 = "0101111100", x0 = 58, cw = 34;
    let g = T(26, 62, "P1", { z: 14 }) + T(26, 104, "P2", { z: 14 });
    [[P1, 44], [P2, 86]].forEach(([s, y]) => [...s].forEach((b, k) => (g += R(x0 + k * cw + 1, y, cw - 2, 30, b === "1" ? { f: "var(--teal-dim)", s: "var(--teal)", r: 6 } : { f: "var(--bg-2)", r: 6 }) + T(x0 + k * cw + cw / 2, y + 21, b, { z: 15 }))));
    for (let k = 1; k <= 9; k++) {
      const x = x0 + k * cw;
      g += `<g data-pick="c${k}">${L(x, 36, x, 126, { c: "var(--blue)", d: "4 4", sw: 3 })}<rect x="${x - 8}" y="36" width="16" height="90" rx="6" fill="transparent" stroke="none"/></g>${T(x, 148, "cut " + k, { z: 11, c: "var(--blue-ink)" })}`;
    }
    g += T(220, 18, "Cut after position…", { z: 13, c: "var(--text-dim)" });
    return svg(410, 160, g);
  })();

  const ingStrip = (() => {
    const bits = "0110100111010010100110101100100101101010".split("");
    let g = T(8, 16, "Parent: 40 bits", { a: "start", z: 13 });
    bits.forEach((b, i) => { const x = 8 + (i % 20) * 20, y = 26 + Math.floor(i / 20) * 24; g += R(x, y, 18, 20, b === "1" ? { f: "var(--blue-dim)", s: "var(--blue-edge)", r: 4, sw: 1.5 } : { f: "var(--bg-2)", s: "var(--line-2)", r: 4, sw: 1.5 }) + T(x + 9, y + 15, b, { z: 12, c: "var(--text-dim)" }); });
    g += T(8, 92, "Each bit flips on its own, with chance 1 in 20.", { a: "start", z: 13, c: "var(--amber-ink)" });
    return svg(416, 104, g);
  })();

  B.add("l1-ingredients", [
    {
      type: "pick",
      q: "A population of six 10-bit candidates is bred by selection and copying only: no mutation and no crossover. Each panel shows the six rows (one per candidate) at a different generation. Tap the panel after which recombination (crossover) on its own can no longer make anything new.",
      fig: ingGrids,
      a: "c",
      why: "By generation 30 all six rows are identical. Crossing two identical parents gives a child identical to both, so recombination has nothing to mix. At generation 4 there are still three different rows, so crossover could still build new combinations. Selection alone shrinks variety; mutation is what puts new variety back in.",
    },
    {
      type: "pick",
      q: "Selection should have a weak bias towards the fittest: fitter parents are likelier, but nobody is ruled out. Each bar shows how a scheme shares parent slots among four candidates with fitness 8, 5, 2 and 1. Select every scheme that matches that description.",
      fig: ingBars,
      a: ["s3", "s5"],
      hint: "C splits 16 total fitness: 8, 5, 2 and 1 sixteenths.",
      why: "C gives shares of 8/16, 5/16, 2/16 and 1/16: the fittest is favoured, yet the weakest still has a 6% chance. E does the same by rank. A gives everyone else no chance at all, B has no bias, and D rules out the bottom two. Zero chances throw away variety; no bias throws away progress.",
    },
    {
      type: "pick",
      q: "Each dot is one run of a hill-climbing search on a landscape with a small hill (height 0.6) and a big mountain (height 1.0). In a run, a population of climbers starts at random places and each only walks uphill. The dot is the best height any climber reached. Tap the smallest population size for which all 12 runs reached the big mountain.",
      fig: ingDots,
      a: "n4",
      why: "With one climber, a start near the small hill ends up on it, so about half the runs are stuck at 0.6. With two climbers, both must be unlucky, which still happens now and then. With four climbers, at least one almost always starts in the mountain's catchment area, and every run reaches 1.0. A population is insurance against a bad start.",
    },
    {
      type: "pick",
      q: "One-point crossover: a child takes everything before the cut from Parent 1 and everything after it from Parent 2. Fitness is the number of 1s in the child. Tap the cut that gives the fittest child.",
      fig: ingCut,
      a: "c3",
      hint: "Count the 1s in the left part of P1 and the right part of P2 for each cut.",
      why: "Cutting after position 3 gives 111 from P1 and 1111100 from P2: 1111111100, which has eight 1s. Every other cut gives 7 or fewer (cut 1 or 2 gives 7, cut 4 or 5 gives 7, cut 6 gives 6, cut 7 or 9 gives 5, cut 8 gives 4). Crossover works when each parent has a good piece the other lacks.",
    },
    {
      type: "slider",
      q: "A parent has 40 bits. Mutation flips each bit independently with chance 1 in 20. On average, how many bits differ between a child and its parent?",
      fig: ingStrip,
      min: 0, max: 10, step: 1, ans: 2, tol: 1, unit: " bits",
      hint: "40 bits, each with a 1 in 20 chance: 40 ÷ 20.",
      why: "Expected flips = number of bits × chance per bit = 40 × 1/20 = 2. A rate of about one flip per child makes mutation a small tweak, which is what an EA wants: small changes mostly stay near a good parent, and the odd child still lands somewhere new.",
    },
  ]);

  /* =====================================================================
     l1-apps
     ===================================================================== */
  const appsScatter = (() => {
    const P = { A: [1, 4], B: [2, 8], C: [3, 9], D: [4, 12], E: [5, 13], F: [2, 5], G: [6, 14], H: [3, 12] };
    const x0 = 50, y1 = 250, W = 350, H = 220, X = (s) => x0 + (s / 6.5) * W, Y = (g) => y1 - (g / 15) * H;
    let g = "";
    for (let i = 0; i <= 6; i++) g += L(X(i), y1, X(i), Y(15), { c: "var(--line)", sw: 1 }) + T(X(i), y1 + 18, i, { z: 12, c: "var(--text-dim)" });
    for (let v = 0; v <= 15; v += 5) g += L(x0, Y(v), X(6.5), Y(v), { c: "var(--line)", sw: 1 }) + T(x0 - 10, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" });
    g += L(x0, y1, X(6.5), y1) + L(x0, y1, x0, Y(15));
    g += T(235, y1 + 38, "Size (cm)", { z: 13, c: "var(--text-dim)" }) + T(12, 130, "Gain (dB)", { z: 13, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 12 130)" `);
    Object.entries(P).forEach(([k, [s, ga]]) => (g += `<g data-pick="${k}">${C(X(s), Y(ga), 13, { s: "var(--blue)", sw: 3 })}${T(X(s), Y(ga) + 5, k, { z: 13, c: "var(--ink)" })}</g>`));
    return svg(420, 288, g);
  })();

  const appsGantt = (() => {
    const x0 = 44, W = 380, top = 24, rh = 19;
    let g = "";
    for (let k = 0; k <= 5; k++) { const x = x0 + (k / 5) * W; g += L(x, top - 4, x, top + 10 * rh, { c: "var(--line)", sw: 1 }) + T(x, top + 10 * rh + 16, k * 30, { z: 12, c: "var(--text-dim)" }); }
    for (let m = 0; m < 10; m++) {
      g += T(x0 - 8, top + m * rh + 13, "M" + (m + 1), { a: "end", z: 11, c: "var(--text-dim)" });
      for (let b = 0; b < 5; b++) g += R(x0 + (b / 5) * W + 1.5, top + m * rh + 1, W / 5 - 3, rh - 3, { f: b % 2 ? "var(--blue)" : "var(--teal)", s: b % 2 ? "var(--blue-ink)" : "var(--teal-ink)", r: 4, sw: 1.5 });
    }
    g += T(x0 + W / 2, top + 10 * rh + 36, "seconds into one generation (each block = one 30-second simulation)", { z: 12, c: "var(--text-dim)" });
    return svg(440, top + 10 * rh + 46, g);
  })();

  const appsHeat = (() => {
    const px = 5, py = 2, v = (c, r) => Math.max(0, 8 - (Math.abs(c - px) + Math.abs(r - py)));
    const rules = [["P", (c, r) => v(c, r) / 8], ["Q", (c, r) => (c === px && r === py ? 1 : 0)], ["R", (c, r) => Math.floor(v(c, r) / 3) / 2]];
    const cs = 17; let g = "";
    rules.forEach(([name, fn], pi) => {
      const ox = 8 + pi * 148;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) { const val = fn(c, r); g += `<rect x="${ox + 8 + c * cs}" y="${8 + r * cs}" width="${cs}" height="${cs}" fill="var(--panel)" stroke="var(--line)" stroke-width="1"/><rect x="${ox + 8 + c * cs}" y="${8 + r * cs}" width="${cs}" height="${cs}" fill="var(--teal)" fill-opacity="${val}" stroke="var(--line)" stroke-width="1"/>`; }
      g += T(ox + 8 + px * cs + cs / 2, 8 + py * cs + 13, "★", { z: 13, c: "var(--ink)" }) + T(ox + 8 + 3.5 * cs, 8 + 7 * cs + 20, "Score " + name, { z: 14 });
    });
    return svg(450, 160, g);
  })();

  const appsLamps = (() => {
    const desks = ["0,1", "1,1", "1,2", "2,0", "3,2", "3,3", "2,3"];
    const cands = { A: [[1, 1]], B: [[0, 1], [1, 2], [2, 0], [3, 2], [2, 3]], C: [[1, 1], [2, 3], [3, 2]], D: [[1, 1], [3, 3], [2, 0]] };
    const pos = { A: [14, 28], B: [164, 28], C: [14, 178], D: [164, 178] }, cs = 30;
    let g = "";
    Object.entries(cands).forEach(([k, lamps]) => {
      const [ox, oy] = pos[k];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const desk = desks.includes(r + "," + c);
        g += R(ox + c * cs, oy + r * cs, cs, cs, { f: desk ? "var(--amber-dim)" : "var(--bg-2)", s: "var(--line-2)", r: 0, sw: 1 });
        if (desk) g += R(ox + c * cs + 8, oy + r * cs + 9, 14, 12, { f: "var(--amber-edge)", s: "var(--amber-ink)", r: 2, sw: 1.5 });
      }
      lamps.forEach(([r, c]) => (g += C(ox + c * cs + cs / 2, oy + r * cs + cs / 2, 9, { f: "var(--gold)", s: "var(--gold-lip)", sw: 2.5 })));
      g += T(ox + 2 * cs, oy - 8, "Layout " + k, { z: 13 });
      g += hit(k, ox - 6, oy - 24, 4 * cs + 12, 4 * cs + 32, 10);
    });
    return svg(320, 322, g);
  })();

  B.add("l1-apps", [
    {
      type: "pick",
      q: "A designer scores each antenna design as fitness = gain (dB) − 2 × size (cm), and higher is better. The plot shows eight candidate designs. Tap the fittest one.",
      fig: appsScatter,
      a: "H",
      hint: "Read gain up the side and size along the bottom, then do gain minus twice the size.",
      why: "H has gain 12 and size 3, so 12 − 6 = 6. The top-gain design G scores 14 − 12 = 2, and the smallest design A scores 4 − 2 = 2. B and D score 4. A fitness function turns a trade-off (more gain against more size) into one number, so the EA can rank any two designs without anyone saying how to build a good one.",
    },
    {
      type: "slider",
      q: "Scoring one candidate takes a 30-second simulation. The population has 50 candidates, and 10 machines share the work as drawn (one generation). Picking parents and making children takes almost no time. How long will 40 generations take?",
      fig: appsGantt,
      min: 0, max: 200, step: 10, ans: 100, tol: 20, unit: " minutes",
      hint: "One generation is 5 rounds of 30 seconds. Then multiply by 40.",
      why: "50 candidates over 10 machines is 5 rounds of 30 s = 150 s per generation. 40 generations is 40 × 150 = 6,000 s, which is 100 minutes. Almost all the time goes on evaluating fitness, so a cheaper simulation or more machines is what speeds an EA up, not faster selection.",
    },
    {
      type: "order",
      q: "A designer tunes two settings, each with 7 values (the 49 squares). The squares are shaded by the score each of three scoring rules gives them (darker green = higher; the star is the best design under all three). An EA starts at a random square and keeps changes to a neighbouring square that do not lower the score. Order the rules from most to least helpful for guiding it.",
      fig: appsHeat,
      items: ["Score P", "Score R", "Score Q"],
      why: "P rises smoothly to the star, so every step uphill is rewarded and the EA is always pulled towards it. R is shaded in bands: it only gives feedback when the EA crosses a band edge, but it still points the right way. Q scores 0 everywhere except the star itself, so there is nothing to climb and the EA is reduced to guessing. A good fitness function ranks near-misses as better than bad misses.",
    },
    {
      type: "pick",
      q: "An office has desks (the small boxes). A lamp lights its own square and the squares directly above, below, left and right. Fitness = number of desks lit − number of lamps used, higher is better. Tap the fittest layout.",
      fig: appsLamps,
      a: "D",
      hint: "Count the lit desks for each layout, then take away the number of lamps.",
      why: "Layout D lights all 7 desks with 3 lamps: 7 − 3 = 4. Layout C lights 6 desks with 3 lamps: 3. Layout B lights all 7 desks but needs 5 lamps: 2. Layout A uses one lamp for 3 desks: 2. The score has to weigh both aims at once, which is why neither the most lamps nor the fewest wins.",
    },
    {
      type: "cat",
      q: "An engineer uses an EA to evolve a new antenna design. Who does each piece of work?",
      buckets: ["The engineer", "The EA", "Nobody: not needed"],
      items: [
        ["Decide what makes a design good, as a score", 0],
        ["Choose how a design is written down as a chromosome", 0],
        ["Create the first batch of random designs", 1],
        ["Tweak and combine promising designs into new ones", 1],
        ["Decide which designs get to be parents", 1],
        ["Know a step-by-step recipe for the best design", 2],
        ["Know in advance what the best design looks like", 2],
      ],
      why: "The human supplies the two problem-specific parts: a fitness function and an encoding. Everything else (random starts, variation, selection) is generic and the EA does it. Nobody needs a recipe or a picture of the answer: that is why EAs can produce designs that surprise the experts.",
    },
  ]);

  /* =====================================================================
     l2-generic
     ===================================================================== */
  const genRuns = (() => {
    const Lb = 30, P = 8, G = 20, PM = 2 / 30, fit = (a) => a.reduce((s, b) => s + b, 0);
    const sim = (rule, seed) => {
      const r = rng(seed); let pop = Array.from({ length: P }, () => Array.from({ length: Lb }, () => (r() < 0.5 ? 1 : 0))); const hist = [Math.max(...pop.map(fit))];
      const tour = () => { const a = pop[Math.floor(r() * P)], b = pop[Math.floor(r() * P)]; return fit(a) >= fit(b) ? a : b; };
      for (let g = 0; g < G; g++) {
        const kids = []; for (let i = 0; i < P; i++) { const p = tour().slice(); for (let j = 0; j < Lb; j++) if (r() < PM) p[j] = 1 - p[j]; kids.push(p); }
        if (rule === "all") pop = kids;
        else if (rule === "merge") pop = [...pop, ...kids].sort((a, b) => fit(b) - fit(a)).slice(0, P);
        else { pop = pop.slice().sort((a, b) => fit(b) - fit(a)); const ks = kids.slice().sort((a, b) => fit(b) - fit(a)); for (let i = 0; i < 4; i++) pop[P - 1 - i] = ks[i]; }
        hist.push(Math.max(...pop.map(fit)));
      }
      return hist;
    };
    const order = [["P", "merge"], ["Q", "all"], ["R", "some"]];
    let g = "";
    order.forEach(([name, rule], i) => {
      const ox = 4 + i * 148, w = 136, x0 = ox + 26, y0 = 14, y1 = 134, data = sim(rule, 8), X = (t) => x0 + (t / G) * (w - 34), Y = (v) => y1 - ((v - 15) / 15) * (y1 - y0);
      g += R(ox, 2, w, 184, { r: 12 }) + L(x0, y1, ox + w - 6, y1) + L(x0, y0, x0, y1);
      [20, 25, 30].forEach((v) => (g += L(x0, Y(v), ox + w - 6, Y(v), { c: "var(--line)", sw: 1 }) + T(ox + 20, Y(v) + 4, v, { a: "end", z: 11, c: "var(--text-dim)" })));
      g += poly(data.map((v, t) => [X(t), Y(v)]), "var(--teal)", 3) + T(ox + w / 2, y1 + 18, "Run " + name, { z: 14 }) + T(ox + w / 2, y1 + 34, "generations 0 to 20 →", { z: 11, c: "var(--text-dim)" });
      g += hit("run" + name, ox, 2, w, 184, 12);
    });
    return svg(450, 192, g);
  })();

  const genStop = (() => {
    const imp = { 0: 11, 2: 14, 6: 18, 11: 21, 22: 24 }, best = []; let cur = 0; for (let t = 0; t <= 60; t++) { if (imp[t] !== undefined) cur = imp[t]; best.push(cur); }
    const x0 = 44, W = 380, y1 = 190, y0 = 24, X = (t) => x0 + (t / 60) * W, Y = (v) => y1 - ((v - 8) / 20) * (y1 - y0);
    let pts = []; best.forEach((v, t) => { if (t) pts.push([X(t), Y(best[t - 1])]); pts.push([X(t), Y(v)]); });
    let g = L(x0, y1, x0 + W + 4, y1) + L(x0, y0 - 6, x0, y1);
    [10, 20, 28].forEach((v) => (g += L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) + T(x0 - 8, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" })));
    g += poly(pts, "var(--teal)", 3.5);
    g += T(235, 16, "Best fitness in the population", { z: 13, c: "var(--text-dim)" }) + T(x0 + W / 2, y1 + 48, "generation", { z: 12, c: "var(--text-dim)" });
    [22, 30, 37, 45, 60].forEach((t) => (g += `<g data-pick="g${t}">${L(X(t), Y(best[t]), X(t), y1, { c: "var(--blue-edge)", d: "3 4", sw: 2 })}${C(X(t), y1 + 18, 14, { s: "var(--blue)", sw: 3 })}${T(X(t), y1 + 23, t, { z: 13, c: "var(--ink)" })}</g>`));
    return svg(440, 244, g);
  })();

  const genScatter = (() => {
    const x0 = 40, y1 = 300, S = 36, X = (v) => x0 + v * S, Y = (v) => y1 - v * 28;
    const kids = { A: [2, 3], B: [4.5, 4.5], C: [7, 6], D: [3, 7], E: [9, 1] };
    let g = "";
    for (let i = 0; i <= 10; i++) g += L(X(i), y1, X(i), Y(10), { c: "var(--line)", sw: 1 }) + L(x0, Y(i), X(10), Y(i), { c: "var(--line)", sw: 1 }) + (i % 2 === 0 ? T(X(i), y1 + 17, i, { z: 12, c: "var(--text-dim)" }) + T(x0 - 8, Y(i) + 4, i, { a: "end", z: 12, c: "var(--text-dim)" }) : "");
    g += L(x0, y1, X(10), y1) + L(x0, y1, x0, Y(10)) + T(X(5), y1 + 36, "gene x", { z: 13, c: "var(--text-dim)" }) + T(10, 160, "gene y", { z: 13, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 10 160)" `);
    [["Parent 1", [2, 6]], ["Parent 2", [7, 3]]].forEach(([n, [x, y]]) => (g += R(X(x) - 11, Y(y) - 11, 22, 22, { f: "var(--violet-dim)", s: "var(--violet)", r: 5, sw: 3 }) + T(X(x), Y(y) - 18, n, { z: 12, c: "var(--violet-ink)" })));
    Object.entries(kids).forEach(([k, [x, y]]) => (g += `<g data-pick="${k}">${C(X(x), Y(y), 13, { s: "var(--blue)", sw: 3 })}${T(X(x), Y(y) + 5, k, { z: 13, c: "var(--ink)" })}</g>`));
    return svg(420, 346, g);
  })();

  const genBars = (() => {
    const v = [100, 3, 2, 2, 1], x0 = 50, base = 150, H = 110;
    let g = L(x0 - 10, base, 410, base) + L(x0 - 10, base - H - 6, x0 - 10, base);
    v.forEach((val, i) => { const x = x0 + i * 70, h = Math.max(3, (val / 100) * H); g += R(x, base - h, 44, h, { f: i === 0 ? "var(--amber)" : "var(--blue)", s: i === 0 ? "var(--amber-ink)" : "var(--blue-ink)", r: 5 }) + T(x + 22, base - h - 7, val, { z: 14 }) + T(x + 22, base + 18, i === 0 ? "leader" : "#" + (i + 1), { z: 12, c: "var(--text-dim)" }); });
    g += T(235, 16, "Fitness of the five individuals", { z: 13, c: "var(--text-dim)" });
    return svg(420, 178, g);
  })();

  const genFlow = (() => {
    const [id, defs] = arrowDef();
    const bx = 20, bw = 190, bh = 34, ys = [26, 84, 142, 200], decY = 262;
    const names = ["Random population, scored", "Select parents", "Vary: mutate / recombine", "Score children, update population"];
    let g = defs;
    const arrow = (pid, d, label) => `<g data-pick="${pid}"><path d="${d}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/><path d="${d}" stroke="transparent" stroke-width="22" fill="none"/></g>`;
    ys.forEach((y, i) => (g += R(bx, y, bw, bh, { r: 10, f: i === 0 ? "var(--teal-dim)" : "var(--blue-dim)", s: i === 0 ? "var(--teal)" : "var(--blue-edge)", sw: 2.5 }) + T(bx + bw / 2, y + 22, names[i], { z: 13, c: "var(--ink)" })));
    g += `<polygon points="${bx + bw / 2},${decY - 4} ${bx + bw / 2 + 80},${decY + 22} ${bx + bw / 2},${decY + 48} ${bx + bw / 2 - 80},${decY + 22}" fill="var(--amber-dim)" stroke="var(--amber)" stroke-width="2.5"/>` + T(bx + bw / 2, decY + 27, "Time left?", { z: 13, c: "var(--ink)" });
    g += R(300, decY + 6, 110, 34, { r: 10, f: "var(--rose-dim)", s: "var(--rose)", sw: 2.5 }) + T(355, decY + 28, "Stop: report best", { z: 12, c: "var(--ink)" });
    g += arrow("a1", `M${bx + bw / 2} ${ys[0] + bh} L${bx + bw / 2} ${ys[1] - 6}`) + arrow("a2", `M${bx + bw / 2} ${ys[1] + bh} L${bx + bw / 2} ${ys[2] - 6}`) + arrow("a3", `M${bx + bw / 2} ${ys[2] + bh} L${bx + bw / 2} ${ys[3] - 6}`) + arrow("a4", `M${bx + bw / 2} ${ys[3] + bh} L${bx + bw / 2} ${decY - 8}`);
    g += arrow("a5", `M${bx + bw / 2 + 80} ${decY + 22} L${296} ${decY + 22}`) + T(255, decY + 14, "no", { z: 12, c: "var(--text-dim)" });
    g += arrow("a6", `M${bx + bw / 2 - 80} ${decY + 22} L${6} ${decY + 22} L${6} ${ys[0] + bh / 2} L${bx - 4} ${ys[0] + bh / 2}`) + T(52, decY + 14, "yes", { z: 12, c: "var(--text-dim)" });
    return svg(420, 318, g);
  })();

  B.add("l2-generic", [
    {
      type: "pick",
      q: "Three runs of one EA share the same starting population of 8 candidates (fitness = number of 1s in a 30-bit string). They differ only in how the next population is chosen. Rule ① all 8 children replace the old population. Rule ② old and new are merged and the best 8 are kept. Rule ③ the 4 weakest are replaced by the 4 best children. Each panel plots the best fitness per generation. Tap the run that used rule ①.",
      fig: genRuns,
      a: "runQ",
      why: "Under rule ① the best parent is thrown away every generation, and its children are not guaranteed to match it, so the best fitness can fall (it dips several times in run Q and ends lower than it started climbing). Rules ② and ③ both keep the best individual, so their best-so-far never goes down.",
    },
    {
      type: "pick",
      q: "An EA stops as soon as its best fitness has not improved for 15 generations in a row. The chart shows its best fitness per generation (drawn out to generation 60 so you can see what would follow). At which generation does it stop? Tap it.",
      fig: genStop,
      a: "g37",
      hint: "Find the last generation where the line steps up, then add 15.",
      why: "The last improvement is at generation 22. Fifteen generations without any gain brings us to generation 37, so the run stops there, even though the line is flat from 22 to 60. A patience rule like this saves time once progress has dried up, at the risk of stopping just before a late jump.",
    },
    {
      type: "pick",
      q: "Each individual has two genes, x and y, drawn as a point. Uniform crossover builds a child by copying each gene unchanged from one parent or the other (the x gene from either, the y gene from either). Tap every child that crossover of Parent 1 and Parent 2 could produce.",
      fig: genScatter,
      a: ["A", "C"],
      why: "Parent 1 is (2, 6) and Parent 2 is (7, 3). Child A (2, 3) takes x from Parent 1 and y from Parent 2, and child C (7, 6) takes x from Parent 2 and y from Parent 1. B (4.5, 4.5) is the average of the parents: that is blending, not copying a gene. D has both genes nudged, which is a mutation, and E is far from both parents.",
    },
    {
      type: "slider",
      q: "Fitness-proportional selection gives each individual a share of the parent slots equal to its share of the total fitness. The five individuals have the fitness values shown. About what percentage of the parent slots goes to the leader?",
      fig: genBars,
      min: 0, max: 100, step: 5, ans: 93, tol: 7, unit: "%",
      hint: "The total is 100 + 3 + 2 + 2 + 1 = 108.",
      why: "The leader's share is 100 ÷ 108, about 93%. The other four individuals fight over the remaining 7%, so the next generation is nearly all copies of the leader. One outlier can make proportional selection almost greedy, which is why many EAs pick by rank instead, where the leader's share would only be 5 out of 15.",
    },
    {
      type: "pick",
      q: "This flowchart of the generic EA has one wrong arrow. Tap it.",
      fig: genFlow,
      a: "a6",
      why: "When there is time left, the loop must go back to selecting parents from the updated population. This arrow goes back to the random starting population, which would throw away everything the EA has learned and restart each generation as a random search.",
    },
  ]);

  /* =====================================================================
     l2-optim
     ===================================================================== */
  const optCube = (() => {
    const w = [30, 70, 75], Tg = 100, f = (b) => Math.abs(b[0] * w[0] + b[1] * w[1] + b[2] * w[2] - Tg);
    const posOf = (b) => [60 + 160 * b[0] + 70 * b[2], 196 - 110 * b[1] - 46 * b[2]];
    const all = [...Array(8).keys()].map((i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
    let g = "";
    all.forEach((a) => all.forEach((b) => { const d = (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2]); if (d === 1 && a.join("") < b.join("")) { const [x1, y1] = posOf(a), [x2, y2] = posOf(b); g += L(x1, y1, x2, y2, { c: "var(--line-2)", sw: 3 }); } }));
    all.forEach((b) => { const [x, y] = posOf(b), k = b.join(""); g += `<g data-pick="v${k}">${C(x, y, 25, { s: "var(--blue)", sw: 3 })}</g>${T(x, y - 2, k, { z: 14 })}${T(x, y + 13, "f = " + f(b), { z: 12, c: "var(--text-dim)" })}`; });
    g += T(215, 18, "Weights 30, 70 and 75 kg · f = |total − 100|, lower is better", { z: 12, c: "var(--text-dim)" });
    return svg(400, 236, g);
  })();

  const optRuler = (() => {
    const x0 = 24, U = 15.2, X = (e) => x0 + e * U, y = 108;
    let g = L(x0, y, X(25), y, { sw: 3 });
    [0, 5, 10, 15, 20, 25].forEach((e) => (g += L(X(e), y - 5, X(e), y + 5, { sw: 2 }) + T(X(e), y + 25, e === 0 ? "1 s" : "10<tspan dy='-5' style='font-size:10px'>" + e + "</tspan>", { z: 12, c: "var(--text-dim)" })));
    [[4.94, "a day", 62], [9.5, "a century", 40], [17.6, "age of the universe", 62]].forEach(([e, s, ty]) => (g += L(X(e), ty + 6, X(e), y, { c: "var(--amber)", d: "3 3", sw: 2 }) + T(X(e), ty, s, { z: 12, c: "var(--amber-ink)" })));
    [3, 9, 15, 21, 24].forEach((e, i) => (g += `<g data-pick="m${e}">${C(X(e), y, 13, { f: "var(--blue-dim)", s: "var(--blue)", sw: 3 })}</g>${T(X(e), y + 5, "ABCDE"[i], { z: 13, c: "var(--ink)" })}`));
    g += T(220, 150, "seconds, on a log scale: each tick is 100,000 times the one before", { z: 12, c: "var(--text-dim)" }) + T(220, 16, "How long would the full search take?", { z: 13, c: "var(--text-dim)" });
    return svg(410, 162, g);
  })();

  const optHeat = (() => {
    const cs = 29, cols = 14, rows = 9, ox = 8, oy = 8;
    const S = [3, 6], D = [10, 2.5], f = (c, r) => Math.min(4 + Math.hypot(c - S[0], r - S[1]), Math.hypot(c - D[0], r - D[1]));
    let g = "";
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const v = Math.max(0, Math.min(1, 1 - f(c + 0.5, r + 0.5) / 9)); g += `<rect x="${ox + c * cs}" y="${oy + r * cs}" width="${cs}" height="${cs}" fill="var(--panel)"/><rect x="${ox + c * cs}" y="${oy + r * cs}" width="${cs}" height="${cs}" fill="var(--teal)" fill-opacity="${v.toFixed(2)}"/>`; }
    g += R(ox, oy, cols * cs, rows * cs, { f: "none", r: 0, sw: 2 });
    const pts = { A: [3, 6], B: [9, 4], C: [6, 5], D: [12, 7], E: [5, 1] };
    Object.entries(pts).forEach(([k, [c, r]]) => (g += `<g data-pick="${k}">${C(ox + c * cs, oy + r * cs, 13, { f: "var(--panel)", s: "var(--ink)", sw: 3 })}${T(ox + c * cs, oy + r * cs + 5, k, { z: 13, c: "var(--ink)" })}</g>`));
    g += T(ox + 20, oy + rows * cs + 22, "worse", { a: "start", z: 12, c: "var(--text-dim)" }) + R(ox + 80, oy + rows * cs + 10, 24, 14, { f: "var(--panel)", r: 3, sw: 1 }) + R(ox + 108, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", o: 0.35, r: 3, sw: 1 }) + R(ox + 136, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", o: 0.7, r: 3, sw: 1 }) + R(ox + 164, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", r: 3, sw: 1 }) + T(ox + 198, oy + rows * cs + 22, "better", { a: "start", z: 12, c: "var(--text-dim)" });
    return svg(424, 300, g);
  })();

  const optTable = (() => {
    const cols = [["110", 0], ["101", 5], ["001", 25], ["010", 30]];
    let g = T(8, 28, "Subset", { a: "start", c: "var(--text-dim)", z: 13 }) + T(8, 68, "f", { a: "start", z: 14 }) + T(8, 108, "f squared", { a: "start", z: 14 });
    cols.forEach(([s, v], i) => { const x = 110 + i * 78; g += R(x, 8, 70, 30, { f: "var(--blue-dim)", s: "var(--blue-edge)", r: 8 }) + T(x + 35, 29, s, { z: 14, c: "var(--ink)" }) + R(x, 48, 70, 30, { r: 8 }) + T(x + 35, 69, v, { z: 14 }) + R(x, 88, 70, 30, { r: 8 }) + T(x + 35, 109, (v * v).toLocaleString("en-GB"), { z: 14 }); });
    return svg(430, 128, g);
  })();

  const optStep = (() => {
    const imp = { 0: 100, 40: 55, 110: 30, 200: 12, 412: 0 }, x0 = 44, W = 380, y1 = 170, y0 = 22, X = (t) => x0 + (t / 1000) * W, Y = (v) => y1 - (v / 100) * (y1 - y0);
    let cur = 100, pts = [[X(0), Y(100)]]; for (let t = 1; t <= 1000; t++) { if (imp[t] !== undefined) { pts.push([X(t), Y(cur)]); cur = imp[t]; pts.push([X(t), Y(cur)]); } } pts.push([X(1000), Y(cur)]);
    let g = L(x0, y1, x0 + W + 4, y1) + L(x0, y0 - 6, x0, y1);
    [0, 50, 100].forEach((v) => (g += L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) + T(x0 - 8, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" })));
    g += poly(pts, "var(--teal)", 3.5) + T(235, 14, "Best fitness found so far (lower is better, never below 0)", { z: 12, c: "var(--text-dim)" }) + T(x0 + W / 2, y1 + 50, "candidates checked", { z: 12, c: "var(--text-dim)" });
    [200, 300, 412, 700, 1000].forEach((t) => (g += `<g data-pick="k${t}">${L(X(t), Y(0), X(t), y1, { c: "var(--blue-edge)", d: "3 4", sw: 2 })}${C(X(t), y1 + 20, 14, { s: "var(--blue)", sw: 3 })}${T(X(t), y1 + 24, t, { z: 11, c: "var(--ink)" })}</g>`));
    return svg(440, 232, g);
  })();

  B.add("l2-optim", [
    {
      type: "pick",
      q: "The cube shows all 8 on/off choices for three items weighing 30, 70 and 75 kg, with f = |total − 100| beside each (lower is better). A search starts at 000 and repeatedly moves to the neighbour (one bit flipped) with the lowest f, stopping when no neighbour is better. Where does it stop?",
      fig: optCube,
      a: "v101",
      why: "From 000 the neighbours score 70, 30 and 25, so it moves to 001. From 001 the neighbours score 5 (101), 45 and 100, so it moves to 101. Now no neighbour beats 5 (they are 25, 70 and 75), so it stops. But the true optimum is 110 with f = 0, two flips away. Neighbour-by-neighbour search can end on a good-looking answer that isn't the best, which is why exhaustive search is the only guarantee when the space is small.",
    },
    {
      type: "pick",
      q: "A timetable problem has about 10<sup>30</sup> candidate timetables. A fast computer scores 10<sup>9</sup> (a billion) of them every second. Tap where an exhaustive search would finish on this time ruler.",
      fig: optRuler,
      a: "m21",
      hint: "10 to the 30, divided by 10 to the 9, is 10 to the (30 − 9) seconds.",
      why: "10³⁰ ÷ 10⁹ = 10²¹ seconds. The age of the universe is only about 4 × 10¹⁷ seconds, so the search would take roughly 2,000 times longer than the universe has existed. Enumeration is only for small search spaces.",
    },
    {
      type: "pick",
      q: "Two numbers (x and y) are tuned, so there are infinitely many settings and enumeration is impossible. The map shades every setting by its score (darker green = better). An EA has tried the five settings marked A to E. Tap the best one.",
      fig: optHeat,
      a: "B",
      why: "B sits near the centre of the deeper valley. A sits at the bottom of the shallower valley, and it looks fine on its own, but its colour is paler than B's. C, D and E are on slopes. The EA only ever sees the scores of the settings it has tried, so it must compare them like this and breed from the better ones.",
    },
    {
      type: "mcq",
      q: "A colleague changes the fitness function from f to f² (still minimised) and re-runs the exhaustive search over all 8 subsets of weights 30, 70 and 75 kg, with target 100 kg. The table shows a few of the scores. What changes?",
      fig: optTable,
      o: [
        "Nothing about the winner: squaring keeps the order of scores that are 0 or more, so the same subset wins",
        "A different subset wins, because squaring punishes the big misses far more than it punishes the small ones",
        "Two subsets now tie for best, because 0 and 25 are close enough together once squared to count as equal",
        "The search space gets larger, because the squared scores are bigger numbers than the original scores are",
      ],
      a: 0,
      why: "Squaring a score that is never negative never swaps the order of two candidates (a smaller f always gives a smaller f²), so exhaustive search picks 110 either way. The search space is the set of candidates, not the set of scores, so it stays at 8. (Selection that depends on score ratios could still behave differently, but ranking-based best-finding does not.)",
    },
    {
      type: "pick",
      q: "Exhaustive search checks candidates one at a time and records the best fitness so far (lower is better, and no candidate can score below 0). At which marker could you first stop and be certain you have found an optimum?",
      fig: optStep,
      a: "k412",
      why: "At 412 candidates the best fitness drops to 0, and no score can be lower than 0, so nothing left unchecked can beat it. The earlier flat stretches (for example around 300) prove nothing, because an unchecked candidate might still be better. Knowing the best possible score is what lets you stop early.",
    },
  ]);

  /* =====================================================================
     l2-complexity
     ===================================================================== */
  const cxBars = (() => {
    const ns = [24, 25, 26, 27, 28], x0 = 56, base = 190, H = 140;
    let g = L(x0 - 12, base, 410, base) + T(220, 16, "Time for exhaustive search, 1 million candidates per second", { z: 13, c: "var(--text-dim)" });
    ns.forEach((n, i) => { const t = Math.pow(2, n) / 1e6, h = (t / 270) * H, x = x0 + i * 68; g += R(x, base - h, 44, h, { f: "var(--amber)", s: "var(--amber-ink)", r: 5 }) + T(x + 22, base - h - 7, t.toFixed(t < 100 ? 1 : 0) + " s", { z: 13 }) + T(x + 22, base + 20, "n = " + n, { z: 13 }); });
    return svg(420, 220, g);
  })();

  const cxTable = (() => {
    const ns = [10, 20, 30, 40], A = [1, 4, 9, 16], Bv = [0.032, 1.024, 32.8, 1048.6];
    const fm = (v) => (v < 0.1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : v < 100 ? v.toFixed(0) : Math.round(v).toLocaleString("en-GB"));
    let g = T(60, 24, "n", { c: "var(--text-dim)" }) + T(190, 24, "Program A (s)", { c: "var(--blue-ink)" }) + T(330, 24, "Program B (s)", { c: "var(--amber-ink)" });
    ns.forEach((n, i) => { const y = 36 + i * 40; g += R(24, y, 72, 32, { r: 8, f: "var(--bg-2)" }) + T(60, y + 22, n, { z: 15 }) + R(120, y, 140, 32, { r: 8, f: "var(--blue-dim)", s: "var(--blue-edge)" }) + T(190, y + 22, fm(A[i]), { z: 15 }) + R(274, y, 140, 32, { r: 8, f: "var(--amber-dim)", s: "var(--amber-edge)" }) + T(344, y + 22, fm(Bv[i]), { z: 15 }); });
    return svg(440, 206, g);
  })();

  const cxTree = (() => {
    const lvX = (lv, i) => { const n = Math.pow(2, lv), w = 360; return 20 + (w / n) * (i + 0.5); }, ys = [30, 90, 150, 210];
    let g = "";
    for (let lv = 0; lv < 3; lv++) for (let i = 0; i < Math.pow(2, lv); i++) for (const j of [2 * i, 2 * i + 1]) g += L(lvX(lv, i), ys[lv], lvX(lv + 1, j), ys[lv + 1], { c: "var(--line-2)", sw: 2.5 });
    for (let lv = 0; lv < 4; lv++) for (let i = 0; i < Math.pow(2, lv); i++) g += (lv === 3 ? R(lvX(lv, i) - 20, ys[lv] - 14, 40, 28, { f: "var(--teal-dim)", s: "var(--teal)", r: 8 }) + T(lvX(lv, i), ys[lv] + 5, (7 - i).toString(2).padStart(3, "0"), { z: 12 }) : C(lvX(lv, i), ys[lv], 11, { s: "var(--blue)", sw: 3 }));
    ["item 1", "item 2", "item 3"].forEach((s, k) => (g += T(436, ys[k] + 34, s, { a: "end", z: 12, c: "var(--text-dim)" })));
    g += T(210, 252, "left branch = take (1), right = skip (0)", { z: 12, c: "var(--text-dim)" });
    return svg(440, 262, g);
  })();

  const cxLines = (() => {
    const x0 = 66, W = 330, y1 = 190, y0 = 24, ymax = 6.2, X = (n) => x0 + ((n - 10) / 20) * W, Y = (v) => y1 - (Math.log10(v) / ymax) * (y1 - y0);
    let g = L(x0, y1, x0 + W + 6, y1) + L(x0, y0 - 6, x0, y1);
    [[1, "1"], [100, "100"], [1e4, "10,000"], [1e6, "1,000,000"]].forEach(([v, s]) => (g += L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) + T(x0 - 6, Y(v) + 4, s, { a: "end", z: 11, c: "var(--text-dim)" })));
    const P = [], Q = []; for (let n = 10; n <= 30; n += 0.5) { P.push([X(n), Y(Math.pow(2, n) / 1000)]); Q.push([X(n), Y(n * n * n)]); }
    g += poly(P, "var(--amber)", 3.5) + poly(Q, "var(--blue)", 3.5);
    g += T(X(12), Y(1e3) - 28, "2ⁿ ÷ 1000", { z: 12, c: "var(--amber-ink)" }) + T(X(11.5), Y(1e3) + 18, "n³", { z: 13, c: "var(--blue-ink)" });
    g += T(235, 14, "Steps needed (log scale: each line is ×100)", { z: 12, c: "var(--text-dim)" });
    [10, 15, 20, 25, 30].forEach((n) => (g += `<g data-pick="n${n}">${L(X(n), y1, X(n), y0, { c: "var(--line-2)", d: "2 5", sw: 1.5 })}${C(X(n), y1 + 20, 14, { s: "var(--violet)", sw: 3 })}${T(X(n), y1 + 25, n, { z: 13, c: "var(--ink)" })}</g>`));
    return svg(440, 236, g);
  })();

  B.add("l2-complexity", [
    {
      type: "mcq",
      q: "A brute-force search checks 2<sup>n</sup> candidates at a million per second. The bars show its running time for n = 24 to 28. For a one-hour budget (3,600 seconds), roughly what is the largest n it can handle?",
      fig: cxBars,
      o: ["28", "31", "34", "40"],
      a: 1,
      hint: "Each extra item doubles the time. Start from 268 s at n = 28 and keep doubling.",
      why: "Doubling from 268 s: n = 29 takes about 540 s, n = 30 about 1,070 s and n = 31 about 2,150 s (36 minutes). n = 32 would take about 4,300 s (72 minutes), which is over the hour. So n = 31 is the limit, and a computer 1,000 times faster would only buy about 10 more items.",
    },
    {
      type: "mcq",
      q: "A team times two exact programs for the same job on inputs of size n. The job will soon be run with n = 100. Which program should they keep, and why?",
      fig: cxTable,
      o: [
        "A: its time rises gently as n grows, while B's time multiplies by about 30 for every 10 extra items",
        "B: it was faster than A on the smaller inputs, so its lead should only widen as n grows towards 100",
        "B: its first two timings are the smallest, which shows that it must do less work per item than A does",
        "Neither: four timings are far too few to say anything reliable about what will happen at n = 100",
      ],
      a: 0,
      why: "A grows steadily (1, 4, 9, 16 s: like n²). B's times jump by a factor of about 32 every time n goes up by 10 (1 → 33 → 1,049), which is exponential. B only looked quicker while n was small. At n = 100, A needs about 100 s, whereas B would need over a million million seconds, which is tens of thousands of years. Early wins can fool you: a small exponential eventually loses to any polynomial.",
    },
    {
      type: "mcq",
      q: "An exhaustive search visits every leaf of a decision tree: one level per item, branching into take or skip. With 3 items there are 8 leaves. How many leaves are there after two more items are added (5 items in total)?",
      fig: cxTree,
      o: ["10", "16", "32", "64"],
      a: 2,
      why: "Each new item doubles every existing branch, so each extra level multiplies the leaves by 2. Two more levels give 8 × 2 × 2 = 32, which is 2⁵. Adding items adds levels, but the work counts leaves, so it grows exponentially, not by a fixed amount per item.",
    },
    {
      type: "match",
      q: "A programmer times a program at n = 100, then at n = 200 (or 101). Match each timing log to the growth it points to.",
      pairs: [
        ["Time doubles when n goes from 100 to 200", "Linear, n"],
        ["Time quadruples when n goes from 100 to 200", "Quadratic, n²"],
        ["Time goes up 8 times when n goes from 100 to 200", "Cubic, n³"],
        ["Time doubles when n goes from 100 to just 101", "Exponential, 2ⁿ"],
      ],
      why: "Doubling the input and getting 2, 4 or 8 times the time points to n, n² and n³ (2¹, 2², 2³ times). If a single extra item doubles the time, the exponent contains n, which is exponential. At n = 200 the exponential program would be unimaginably slow.",
    },
    {
      type: "pick",
      q: "Program P takes 2<sup>n</sup> steps but runs on a computer 1,000 times faster, so it needs 2<sup>n</sup> ÷ 1,000 time units. Program Q takes n³ steps on an ordinary computer. The chart plots both on a log scale. Tap the first marked n at which Q beats P.",
      fig: cxLines,
      a: "n25",
      why: "At n = 20, P needs about 1,000 and Q needs 8,000, so P is ahead. At n = 25, P needs about 33,500 but Q needs only 15,600. Beyond that the gap keeps widening (at n = 30 it is about a million against 27,000). A thousand-fold faster machine only delays the exponential's defeat by a few items, while a better algorithm wins for good.",
    },
  ]);

  /* =====================================================================
     l2-mst
     ===================================================================== */
  const mstPlans = (() => {
    const pos = { A: [18, 56], B: [58, 18], C: [58, 94], D: [100, 56], E: [138, 18], F: [138, 94] };
    const plans = [
      ["1", [["C", "D", 1], ["A", "B", 2], ["E", "F", 2], ["B", "C", 3], ["D", "E", 3]]],
      ["2", [["A", "B", 2], ["B", "C", 3], ["C", "D", 1], ["D", "F", 6], ["E", "F", 2]]],
      ["3", [["A", "B", 2], ["C", "D", 1], ["E", "F", 2], ["B", "C", 3]]],
      ["4", [["A", "C", 4], ["B", "C", 3], ["C", "D", 1], ["D", "E", 3], ["E", "F", 2]]],
    ];
    const ox = [6, 168], oy = [4, 134];
    let g = "";
    plans.forEach(([name, edges], i) => {
      const x0 = ox[i % 2], y0 = oy[Math.floor(i / 2)];
      g += R(x0, y0, 154, 124, { r: 12 });
      edges.forEach(([a, b, c]) => { const [x1, y1] = pos[a], [x2, y2] = pos[b]; g += L(x0 + x1, y0 + y1 - 4, x0 + x2, y0 + y2 - 4, { c: "var(--blue)", sw: 3 }); });
      edges.forEach(([a, b, c]) => {
        const [x1, y1] = pos[a], [x2, y2] = pos[b], dx = x2 - x1, dy = y2 - y1, Ln = Math.hypot(dx, dy), lx = x0 + (x1 + x2) / 2 - (dy / Ln) * 9, ly = y0 + (y1 + y2) / 2 - 4 + (dx / Ln) * 9;
        g += R(lx - 8, ly - 8, 16, 16, { f: "var(--panel)", s: "none", r: 4, sw: 0 }) + T(lx, ly + 4, c, { z: 13, c: "var(--rose-ink)" });
      });
      Object.entries(pos).forEach(([k, [x, y]]) => (g += C(x0 + x, y0 + y - 4, 8, { s: "var(--text-dim)", sw: 2.5 })));
      g += T(x0 + 77, y0 + 118, "Plan " + name, { z: 13 }) + hit("p" + name, x0, y0, 154, 124, 12);
    });
    return svg(330, 262, g);
  })();

  const mstTrace = (() => {
    const nodes = { A: [30, 80], B: [105, 25], C: [105, 135], D: [220, 80], E: [330, 25], F: [330, 135] };
    const edges = [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "D", 8], ["D", "E", 3], ["D", "F", 7], ["E", "F", 6]];
    const graph = NIC.qfig.graph(nodes, edges, { w: 360, h: 160, r: 16 });
    const rows = [["1", "A – C", 2], ["2", "C – B", 1], ["3", "B – D", 5], ["4", "D – F", 7], ["5", "D – E", 3]];
    const tbl = `<table style="border-collapse:separate;border-spacing:4px;margin:6px auto 0;font:800 14px var(--sans);color:var(--text)"><tr style="color:var(--text-dim);font-size:12px"><td>Step</td><td>Edge added</td><td>Cost</td></tr>${rows.map((r) => `<tr><td style="padding:5px 12px;background:var(--bg-2);border-radius:8px;text-align:center">${r[0]}</td><td style="padding:5px 14px;background:var(--blue-dim);border-radius:8px;text-align:center">${r[1]}</td><td style="padding:5px 12px;background:var(--bg-2);border-radius:8px;text-align:center">${r[2]}</td></tr>`).join("")}</table>`;
    return `<div style="max-width:380px;margin:0 auto">${graph}${tbl}</div>`;
  })();

  const mstMatrix = (() => {
    const names = "ABCDE", M = { AB: 7, AC: 3, AE: 9, BC: 2, BD: 5, CD: 6, CE: 8, DE: 4 };
    const x0 = 56, y0 = 40, cs = 52;
    let g = T(180, 18, "Cost of each possible cable (– means none)", { z: 13, c: "var(--text-dim)" });
    [...names].forEach((n, i) => (g += T(x0 + i * cs + cs / 2, y0 - 6, n, { z: 15, c: "var(--blue-ink)" }) + T(x0 - 18, y0 + i * cs + cs / 2 + 5, n, { z: 15, c: "var(--blue-ink)" })));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const x = x0 + c * cs, y = y0 + r * cs;
      if (c <= r) { g += R(x + 2, y + 2, cs - 4, cs - 4, { f: "var(--bg-2)", s: "none", r: 8, sw: 0, o: 0.6 }); continue; }
      const key = names[r] + names[c], v = M[key];
      if (v === undefined) { g += R(x + 2, y + 2, cs - 4, cs - 4, { r: 8, sw: 1.5 }) + T(x + cs / 2, y + cs / 2 + 5, "–", { z: 16, c: "var(--text-faint)" }); continue; }
      g += R(x + 2, y + 2, cs - 4, cs - 4, { r: 8, f: "var(--panel)", s: "var(--line-2)" }) + T(x + cs / 2, y + cs / 2 + 6, v, { z: 17 }) + hit(key, x + 2, y + 2, cs - 4, cs - 4, 8);
    }
    return svg(330, y0 + 5 * cs + 8, g);
  })();

  const mstLoop = (() => {
    const N = { A: [34, 150], B: [114, 150], C: [114, 50], D: [254, 50], E: [254, 150], F: [346, 150] };
    const tree = [["A", "B", 9], ["B", "C", 4], ["C", "D", 6], ["D", "E", 2], ["E", "F", 5]];
    let g = L(N.B[0] + 18, N.B[1], N.E[0] - 18, N.E[1], { c: "var(--amber)", d: "7 6", sw: 4 }) + T(184, 140, "new link: 3", { z: 13, c: "var(--amber-ink)" });
    tree.forEach(([a, b, w]) => {
      const [x1, y1] = N[a], [x2, y2] = N[b], dx = x2 - x1, dy = y2 - y1, Ln = Math.hypot(dx, dy), sx = x1 + (dx / Ln) * 18, sy = y1 + (dy / Ln) * 18, ex = x2 - (dx / Ln) * 18, ey = y2 - (dy / Ln) * 18;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, vert = Math.abs(dx) < 1;
      g += `<g data-pick="${a}${b}">${L(sx, sy, ex, ey, { c: "var(--blue)", sw: 4 })}<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="transparent" stroke-width="22"/></g>` + T(vert ? mx + (x1 < 200 ? -15 : 15) : mx, vert ? my + 5 : my - 12, w, { z: 14, c: "var(--rose-ink)" });
    });
    Object.entries(N).forEach(([k, [x, y]]) => (g += C(x, y, 18, { s: "var(--text-dim)", sw: 3 }) + T(x, y + 5, k, { z: 15 })));
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
