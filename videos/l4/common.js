/* Lecture 4 · Selection, operators and encodings: pure algorithms and data (no DOM). Drawing helpers are in common-2.js and
   common-3.js. Everything hangs off VID.l4 (short name L4). Also load l5/common.js first (tones, badge, pictograms).

   Every number a scene shows must come from here. L4.selfCheck() runs once at load and throws if a lecture figure is wrong
   (it is also exported so node can run it: see the bottom of this file).

   RANDOMNESS    L4.mulberry32(seed) -> () => [0, 1)         seeded generator (deterministic, never Math.random)
   FORMATTING    L4.pct(p) -> "99%" (integer percent, one decimal below 1%: "0.4%");  L4.pctN(p) -> the rounded number
                 L4.commas(3069) -> "3,069";  L4.mix(a, b, k) -> a + (b - a) * k for numbers or equal-length arrays
   SELECTION     L4.ranksOf(f)            rank per individual, 1 = worst ... P = best (ties: earlier index ranks lower)
                 L4.rouletteProbs(f)      f_i / sum f
                 L4.rankProbs(f, b = 1)   {w, sum, p}: w_i = rank_i ^ b, p_i = w_i / sum (b may be fractional, b = 0 is random)
                 L4.tournProbs(f, t)      win chance of each individual, (r/P)^t - ((r-1)/P)^t (needs distinct fitnesses)
   WHEEL         L4.thetaOf(f, u)         wheel angle (deg clockwise from the top) of the point u in [0, sum f)
                 L4.pickSlice(f, u)       index of the slice u falls in
                 L4.spinTo(prevRot, theta, extra = 720)  next wheel rotation (deg, clockwise) with theta under the pointer
                 L4.spinPlan(f, us, rot0 = 0, extra = 720) -> [{u, idx, theta, rot}] one entry per spin, rotations chained
                 L4.sliceMid(p, i)        mid-angle (deg clockwise from the top) of slice i of fractions p
   REPLACEMENT   L4.generational(pop, kids, elites = 0) -> new array (the best `elites` keep their slots, others take kids in order)
                 L4.replaceWeakest(pop, child)    -> {pop, idx, looks, replaced}  (scans all, evicts the first minimum if child >= it)
                 L4.replaceFirstWeaker(pop, child)-> {pop, idx, looks, replaced}  (scan from slot 0, stop at the first member <= child)
   TAKEOVER      L4.takeoverRows(method, seed = 4, P = 12, G = 8)  method "random" | "tournament" | "best"
                 -> rows[g][i] = fitness 1..P of individual i in generation g (rows[0] is the same for every method)
                 L4.countOf(row, v = max) -> how many cells of the row equal v (copies of the best)
   CROSSOVER     L4.crossMask(n, cuts) -> "00000111" (0 until the first cut, then alternating);  cuts = genes kept before the cut
                 L4.cross(p1, p2, mask) -> [child1, child2]; mask 1 = take that gene from the other parent. Strings in -> strings
                 out, arrays in -> arrays out. The mask is a string or an array.
   LAB           L4.HEART  the 144-char target bit string (12 x 12, row by row, 82 ones)
                 L4.evolveLab(kind, seed = 1, P = 30) -> {evals, snaps, at(e)}, kind "ss" (algorithm 1) | "gen" (algorithm 2).
                 at(e) = {evals, fit, bits} of the best individual after e evaluations; snaps are the improvements.
                 Results are cached per (kind, seed, P), so calling it again is free.
   DATA          L4.FIT_ROULETTE [2,3,5], L4.FIT_SUPER [100,.4,.3,.2,.1], L4.FIT_TOURN [3,8,5,1], L4.POP_GA [.1,.5,.3,.2,.9],
                 L4.POP_SLOTS [.7,.8,.3,.9,.1]
   UI            L4.ui = {abs, f1, svgIn}: tiny shared DOM helpers for common-2.js / common-3.js (scenes need not use them) */
(function () {
  const V = window.VID;
  const L4 = (V.l4 = V.l4 || {});

  // ---------- randomness and formatting ----------
  const mulberry32 = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pctN = (p) => (p > 0 && p < 0.01 ? Math.round(p * 1000) / 10 : Math.round(p * 100));
  const pct = (p) => `${pctN(p)}%`;
  const commas = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);

  // ---------- selection ----------
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const ranksOf = (f) => {
    const order = f.map((_, i) => i).sort((a, b) => f[a] - f[b] || a - b);
    const r = new Array(f.length);
    order.forEach((i, k) => (r[i] = k + 1));
    return r;
  };
  const rouletteProbs = (f) => f.map((v) => v / sum(f));
  const rankProbs = (f, b = 1) => {
    const w = ranksOf(f).map((r) => Math.pow(r, b));
    const total = sum(w);
    return { w, sum: total, p: w.map((v) => v / total) };
  };
  const tournProbs = (f, t) => {
    const P = f.length;
    return ranksOf(f).map((r) => Math.pow(r / P, t) - Math.pow((r - 1) / P, t));
  };

  // ---------- wheel ----------
  const thetaOf = (f, u) => (u / sum(f)) * 360;
  const pickSlice = (f, u) => {
    let acc = 0;
    for (let i = 0; i < f.length; i++) {
      acc += f[i];
      if (u < acc) return i;
    }
    return f.length - 1;
  };
  const spinTo = (prevRot, theta, extra = 720) => {
    const need = (((360 - theta - prevRot) % 360) + 360) % 360;
    return prevRot + extra + need;
  };
  const spinPlan = (f, us, rot0 = 0, extra = 720) => {
    let rot = rot0;
    return us.map((u) => {
      const theta = thetaOf(f, u);
      rot = spinTo(rot, theta, extra);
      return { u, idx: pickSlice(f, u), theta, rot };
    });
  };
  const sliceMid = (p, i) => 360 * (sum(p.slice(0, i)) + p[i] / 2);

  // ---------- replacement ----------
  const generational = (pop, kids, elites = 0) => {
    const keep = new Set(
      pop
        .map((_, i) => i)
        .sort((a, b) => pop[b] - pop[a] || a - b)
        .slice(0, elites),
    );
    let k = 0;
    return pop.map((v, i) => (keep.has(i) ? v : kids[k++]));
  };
  const replaceWeakest = (pop, child) => {
    let idx = 0;
    pop.forEach((v, i) => {
      if (v < pop[idx]) idx = i;
    });
    const replaced = child >= pop[idx];
    return { pop: pop.map((v, i) => (replaced && i === idx ? child : v)), idx, looks: pop.length, replaced };
  };
  const replaceFirstWeaker = (pop, child) => {
    const idx = pop.findIndex((v) => v <= child);
    const hit = idx >= 0;
    return {
      pop: pop.map((v, i) => (hit && i === idx ? child : v)),
      idx,
      looks: hit ? idx + 1 : pop.length,
      replaced: hit,
    };
  };

  // ---------- takeover ----------
  function takeoverRows(method, seed = 4, P = 12, G = 8) {
    const r = mulberry32(seed);
    const ri = (n) => Math.floor(r() * n);
    const base = Array.from({ length: P }, (_, i) => i + 1);
    for (let i = P - 1; i > 0; i--) {
      const j = ri(i + 1);
      [base[i], base[j]] = [base[j], base[i]];
    }
    const rows = [base];
    for (let g = 1; g < G; g++) {
      const prev = rows[g - 1];
      rows.push(
        Array.from({ length: P }, () => {
          if (method === "random") return prev[ri(P)];
          if (method === "best") return Math.max(...prev);
          const a = ri(P);
          const b = ri(P); // tournament, t = 2, with replacement
          return Math.max(prev[a], prev[b]);
        }),
      );
    }
    return rows;
  }
  const countOf = (row, v = Math.max(...row)) => row.filter((x) => x === v).length;

  // ---------- crossover ----------
  const crossMask = (n, cuts) => {
    let out = "";
    let bit = 0;
    for (let i = 0; i < n; i++) {
      if (cuts.includes(i)) bit = 1 - bit;
      out += bit;
    }
    return out;
  };
  const cross = (p1, p2, mask) => {
    const str = typeof p1 === "string";
    const [a, b, m] = [[...p1], [...p2], [...mask].map(Number)];
    const c1 = a.map((g, i) => (m[i] ? b[i] : g));
    const c2 = b.map((g, i) => (m[i] ? a[i] : g));
    return str ? [c1.join(""), c2.join("")] : [c1, c2];
  };

  // ---------- EA lab ----------
  const HEART =
    "000000000000011100011100111110111110111111111111111111111111111111111111011111111110001111111100000111111000000011110000000001100000000000000000";
  const labCache = {};
  function evolveLab(kind, seed = 1, P = 30) {
    const key = `${kind}|${seed}|${P}`;
    if (labCache[key]) return labCache[key];
    const T = [...HEART].map(Number);
    const L = 144;
    const r = mulberry32(seed);
    const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
    const fit = (g) => g.reduce((s, b, i) => s + (b === T[i] ? 1 : 0), 0);
    const mut = (g) => g.map((b) => (r() < 1 / L ? 1 - b : b));
    let pop = Array.from({ length: P }, () => Array.from({ length: L }, () => ri(0, 1)));
    let fits = pop.map(fit);
    let evals = P;
    const snaps = []; // one entry each time the best fitness improves
    const note = () => {
      const bi = fits.indexOf(Math.max(...fits));
      if (!snaps.length || fits[bi] > snaps[snaps.length - 1].fit)
        snaps.push({ evals, fit: fits[bi], bits: pop[bi].join("") });
    };
    note();
    while (Math.max(...fits) < L && evals < 100000) {
      if (kind === "ss") {
        // steady-state, mutation only, tournament t = 3, replace worst
        let b = ri(0, P - 1);
        for (let k = 1; k < 3; k++) {
          const c = ri(0, P - 1);
          if (fits[c] > fits[b]) b = c;
        }
        const m = mut(pop[b]);
        const fm = fit(m);
        evals++;
        let w = 0;
        for (let i = 1; i < P; i++) if (fits[i] < fits[w]) w = i;
        if (fm >= fits[w]) {
          pop[w] = m;
          fits[w] = fm;
        }
      } else {
        // generational, 1 elite, rank selection, 1-point crossover (rate 0.8), mutation
        const order = fits.map((_, i) => i).sort((a, b) => fits[b] - fits[a]);
        const rank = new Array(P);
        order
          .slice()
          .reverse()
          .forEach((i, k) => (rank[i] = k + 1));
        const tot = rank.reduce((a, b) => a + b, 0);
        const pick = () => {
          let u = r() * tot;
          let acc = 0;
          for (let i = 0; i < P; i++) {
            acc += rank[i];
            if (u < acc) return i;
          }
          return P - 1;
        };
        const nx = [pop[order[0]]];
        const nf = [fits[order[0]]];
        while (nx.length < P) {
          const a = pop[pick()];
          const b = pop[pick()];
          let c;
          if (r() < 0.8) {
            const k = ri(1, L - 1);
            c = a.slice(0, k).concat(b.slice(k));
          } else c = (r() < 0.5 ? a : b).slice();
          c = mut(c);
          nx.push(c);
          nf.push(fit(c));
          evals++;
        }
        pop = nx;
        fits = nf;
      }
      note();
    }
    const at = (e) => {
      let s = snaps[0];
      for (const x of snaps) if (x.evals <= e) s = x;
      return s;
    };
    return (labCache[key] = { evals, snaps, at });
  }

  // ---------- tiny shared DOM helpers (for common-2 / common-3) ----------
  const f1 = (n) => n.toFixed(1);
  const ui = {
    f1,
    abs: (x, y, w, h) => ({
      position: "absolute",
      left: `${f1(x)}px`,
      top: `${f1(y)}px`,
      ...(w == null ? {} : { width: `${f1(w)}px` }),
      ...(h == null ? {} : { height: `${f1(h)}px` }),
    }),
    svgIn: (parent, w = 936, h = 640) =>
      parent.appendChild(
        V.s("svg", { width: w, height: h, style: { position: "absolute", left: "0", top: "0", overflow: "visible" } }),
      ),
  };

  // ---------- lecture data ----------
  const FIT_ROULETTE = [2, 3, 5];
  const FIT_SUPER = [100, 0.4, 0.3, 0.2, 0.1];
  const FIT_TOURN = [3, 8, 5, 1];
  const POP_GA = [0.1, 0.5, 0.3, 0.2, 0.9];
  const POP_SLOTS = [0.7, 0.8, 0.3, 0.9, 0.1];

  // ---------- self check ----------
  function selfCheck() {
    const eq = (a, b, what) => {
      if (JSON.stringify(a) !== JSON.stringify(b))
        throw new Error(`L4.selfCheck: ${what}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
    };
    const near = (a, b, what, tol = 1e-9) => {
      if (a.length !== b.length || a.some((v, i) => Math.abs(v - b[i]) > tol))
        throw new Error(`L4.selfCheck: ${what}: ${a} != ${b}`);
    };
    // formatting
    eq(
      [pct(0.99), pct(0.004), pct(0.0039), pct(0.001), pct(0.2), pct(100 / 101)],
      ["99%", "0.4%", "0.4%", "0.1%", "20%", "99%"],
      "pct",
    );
    eq(commas(3069), "3,069", "commas");
    // roulette, rank
    near(rouletteProbs(FIT_ROULETTE), [0.2, 0.3, 0.5], "roulette 2 3 5");
    if (Math.abs(rouletteProbs(FIT_SUPER)[0] - 100 / 101) > 1e-12) throw new Error("L4.selfCheck: roulette superfit");
    eq(rouletteProbs(FIT_SUPER).map(pct), ["99%", "0.4%", "0.3%", "0.2%", "0.1%"], "roulette superfit pct");
    eq(ranksOf(FIT_SUPER), [5, 4, 3, 2, 1], "ranks");
    near(rankProbs(FIT_SUPER).p, [5 / 15, 4 / 15, 3 / 15, 2 / 15, 1 / 15], "rank b=1");
    eq(rankProbs(FIT_SUPER).p.map(pct), ["33%", "27%", "20%", "13%", "7%"], "rank b=1 pct");
    near(rankProbs(FIT_SUPER, 2).p, [25 / 55, 16 / 55, 9 / 55, 4 / 55, 1 / 55], "rank b=2");
    eq(rankProbs(FIT_SUPER, 2).p.map(pct), ["45%", "29%", "16%", "7%", "2%"], "rank b=2 pct");
    near(rankProbs(FIT_SUPER, 0).p, [0.2, 0.2, 0.2, 0.2, 0.2], "rank b=0");
    // tournament: formula against brute force over all P^t draws
    [1, 2, 3, 4].forEach((t) => {
      const P = FIT_TOURN.length;
      const wins = new Array(P).fill(0);
      for (let n = 0; n < Math.pow(P, t); n++) {
        let x = n;
        let best = -1;
        for (let k = 0; k < t; k++) {
          const i = x % P;
          x = Math.floor(x / P);
          if (best < 0 || FIT_TOURN[i] > FIT_TOURN[best]) best = i;
        }
        wins[best]++;
      }
      near(
        tournProbs(FIT_TOURN, t),
        wins.map((w) => w / Math.pow(P, t)),
        `tournament t=${t}`,
      );
    });
    near(tournProbs(FIT_TOURN, 2), [0.1875, 0.4375, 0.3125, 0.0625], "tournament t=2");
    eq(
      [2, 3, 4].map((t) => tournProbs(FIT_TOURN, t).map(pct)),
      [
        ["19%", "44%", "31%", "6%"],
        ["11%", "58%", "30%", "2%"],
        ["6%", "68%", "25%", "0.4%"],
      ],
      "tournament pct",
    );
    // wheel
    const plan = spinPlan(FIT_ROULETTE, [7.3, 3.4]);
    eq(
      plan.map((s) => s.idx),
      [2, 1],
      "spin slices",
    );
    near(
      plan.map((s) => s.theta),
      [262.8, 122.4],
      "spin theta",
      1e-9,
    );
    plan.forEach((s) => {
      if (
        Math.abs((((s.rot + s.theta) % 360) + 360) % 360) > 1e-6 &&
        Math.abs(((((s.rot + s.theta) % 360) + 360) % 360) - 360) > 1e-6
      )
        throw new Error("L4.selfCheck: spin does not end at the pointer");
    });
    eq(
      spinPlan(FIT_SUPER, [61.0, 12.4]).map((s) => s.idx),
      [0, 0],
      "superfit spins",
    );
    // replacement
    eq(generational(POP_GA, [0.5, 0.3, 0.3, 0.7, 0.7], 0), [0.5, 0.3, 0.3, 0.7, 0.7], "generational");
    eq(generational(POP_GA, [0.5, 0.3, 0.3, 0.7, 0.7], 1), [0.5, 0.3, 0.3, 0.7, 0.9], "generational elite");
    eq(replaceWeakest(POP_GA, 0.5).pop, [0.5, 0.5, 0.3, 0.2, 0.9], "steady-state");
    const rw = replaceWeakest(POP_SLOTS, 0.5);
    const rf = replaceFirstWeaker(POP_SLOTS, 0.5);
    eq([rw.idx, rw.looks, rw.pop], [4, 5, [0.7, 0.8, 0.3, 0.9, 0.5]], "replace weakest");
    eq([rf.idx, rf.looks, rf.pop], [2, 3, [0.7, 0.8, 0.5, 0.9, 0.1]], "replace first weaker");
    // takeover
    const cnt = (m) => takeoverRows(m).map((r) => countOf(r, 12));
    eq(cnt("random"), [1, 2, 4, 3, 2, 3, 2, 3], "takeover random");
    eq(cnt("tournament"), [1, 1, 2, 3, 5, 7, 10, 11], "takeover tournament");
    eq(cnt("best"), [1, 12, 12, 12, 12, 12, 12, 12], "takeover best");
    eq(takeoverRows("random")[0], [6, 8, 7, 10, 5, 9, 11, 2, 1, 3, 4, 12], "takeover row 0");
    // crossover
    eq([crossMask(8, [5]), crossMask(8, [2, 6])], ["00000111", "00111100"], "masks");
    eq(cross("ABCDEFGH", "KLMNOPQR", crossMask(8, [5])), ["ABCDEPQR", "KLMNOFGH"], "1-point");
    eq(cross("ABCDEFGH", "KLMNOPQR", crossMask(8, [2, 6])), ["ABMNOPGH", "KLCDEFQR"], "2-point");
    eq(cross("ABCDEFGH", "KLMNOPQR", "01001101"), ["ALCDOPGR", "KBMNEFQH"], "uniform");
    // lab
    if (HEART.length !== 144 || [...HEART].filter((b) => b === "1").length !== 82)
      throw new Error("L4.selfCheck: heart");
    const a = evolveLab("ss", 1);
    const b = evolveLab("gen", 1);
    eq(
      [a.evals, b.evals, a.at(30).fit, b.at(30).fit, a.at(1e9).fit, b.at(1e9).fit],
      [3069, 4844, 88, 88, 144, 144],
      "lab",
    );
    return true;
  }

  Object.assign(L4, {
    mulberry32,
    pct,
    pctN,
    commas,
    mix,
    ranksOf,
    rouletteProbs,
    rankProbs,
    tournProbs,
    thetaOf,
    pickSlice,
    spinTo,
    spinPlan,
    sliceMid,
    generational,
    replaceWeakest,
    replaceFirstWeaker,
    takeoverRows,
    countOf,
    crossMask,
    cross,
    HEART,
    evolveLab,
    ui,
    FIT_ROULETTE,
    FIT_SUPER,
    FIT_TOURN,
    POP_GA,
    POP_SLOTS,
    selfCheck,
  });
  selfCheck();
})();
