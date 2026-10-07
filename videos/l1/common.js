/* Lecture 1 · What is NIC?: the pure-data part of this video's helper library (window.VID.l1, short name L1 in scenes).
   Three files share the namespace: common.js (this one: seeded simulations and algorithms, NO DOM), common-2.js (drawing
   blocks: landscape, letter grid, pips, waffle, gauge, ingredient bar ...) and common-3.js (pictograms for scenes 2, 9, 10).
   Every function here is deterministic: the same arguments always give the same result, so scenes can call them at build
   time and treat the answers as data. Nothing random is ever drawn at play time. To check the numbers in node:
       globalThis.window = { VID: {} }; await import("./videos/l1/common.js"); window.VID.l1.verify()   (an .mjs script)
   (verify() throws on the first quoted number that does not match and returns a report object otherwise).

   RANDOMNESS
     L1.rng(seed) -> r()        the exact mulberry32 of js/content/nic/l12-01.js, r() in [0, 1)
     L1.randint(r, a, b)        integer a..b inclusive  (a + floor(r() * (b - a + 1)))
     L1.fmt(n) -> "3,037"       thousands commas       L1.clamp(x, a, b)

   1. WEASEL  (scenes 3 and 4; letters A-Z plus space = 27 choices, 28 positions)
        L1.weasel.TARGET "METHINKS IT IS LIKE A WEASEL"    .ALPHA "ABC...Z "     .matches(str) -> number of positions equal to TARGET
        L1.weasel.SPACE "11972515182562019788602740026717047105681" (27^28, 41 digits, string)      .SPACE_DIGITS 41
        const k = L1.weasel.keeper(17)      keep-if-better run (change one position at random, keep if matches do not drop)
            k.tries 3037 (the random start string counts as try 1, as in the app)   k.start (string, 0 correct)
            k.stateAt(n) string after n tries (1 <= n <= tries, any order, fast; stateAt(1) = start)
            k.matchesAt(n) correct letters after n tries   k.firstAt[m] first try at which m letters were correct (m 1..28)
            k.changes   [{try, i, c, m}] the tries that changed the string (894 of them)
        const m = L1.weasel.monkey(117, 3037)     every try is 28 fresh random letters (the typing monkey)
            m.tries   m.string(n) the n-th random string (1-based)   m.matchesAt(n)   m.bestAt(n) best matches over tries 1..n
        Both throw when the seeds used in the video (17 / 117, 3037) stop giving the quoted numbers.

   2. CAT  (scene 3)   L1.CAT = {target "CAT", start "QZT", tries [[pos, letter], ...] = [[0,"C"],[2,"Q"],[1,"A"]],
        verdicts ["keep","discard","keep"], rows: [{cur, cand, candOk (correct count of the try), curOk, verdict, after}]}
        cur = current row before the try, cand = the try row, after = current row after the verdict; correct counts are numbers.
        L1.correct(str, target) -> number of positions equal to target.

   3. LANDSCAPE  (scenes 5, 8, 10; the lecture playground's "multimodal" landscape, 240 points, x = i / 239)
        L1.land = {N: 240, f(i) height, max (1.0643), pct(i) = f(i) / max (0..1), vals[], star: 167, hills: [30, 74, 120, 167, 209]}
        L1.climber(seed, gens) -> [{start}, {cand, ok, x}, ...]    one hill climber: candidate = clamp(x + randint(-4, 4)), moves if
            f(cand) >= f(x); x = index after that generation. climber(23, 16): start 22, reaches hill 30 at generation 8.
        L1.popRun(seed, P, gens, {rec}) -> [{pop: [indices]}, {pop, info: [{p1, p2, mid, kid}]}, ...]   (gens + 1 entries)
            Each child: p1 = winner of two random dots (fitter wins, first draw wins ties); with rec also p2 (two more draws) and
            mid = round((p1 + p2) / 2) of the two parents' INDICES (positions); child = clamp(mid or p1 + randint(-4, 4)).
            info[c].p1 / p2 are DOT numbers (0..P-1, index into the previous generation's pop), mid and kid are landscape
            indices (kid === pop[c]). Without rec: p2 and mid are null. Generation 0 has no info.
            Handy: pop.map(L1.land.pct), L1.avgPct(pop) (0..100 mean), L1.nearStar(pop) (dots at indices 143-187).
        L1.test200(P, seed) -> 200 flags (0/1): 60 generations per run, success = best >= 98% of max (P = 1 uses the climber rule).
            test200(1, 1) sums to 42, test200(20, 1) to 167.

   4. SELECTION  (scene 6)
        L1.picks(seed, fitnesses, n) -> n parent indices, fitness-proportional (u = r() * total, subtract in order)
        L1.chances(fitnesses) -> [47.4, 31.6, 15.8, 5.3] (percent, one decimal);  L1.chancesRounded(f) -> [47, 32, 16, 5] (sums to 100)
        L1.countPicks(picks, n) -> counts per parent.   L1.PICKS = picks(46, [9, 6, 3, 1], 20)   (A C A C A A B A B B B A B D ...)

   5. SCENE 2 MODELS
        L1.evoBars() -> {H0: [40, 92, 60, 28, 76, 50], gens: [[6 heights] x 4 (g0..g3)], means: [57.7, 74.5, 88.0, 96.7],
            events: [{dead: [slot, slot], parents: [slot, slot], copies: [{from, to, h}], before, after}] x 3,  dead, copies}
            (dead/copies = the first event's lists, for convenience). Two shortest slots die, the two tallest each leave one copy in
            a vacated slot (tallest into the shortest's slot), copy height = parent + delta, deltas [+6,-5], [+5,-4], [+4,-6].
        L1.antWaves(waves, lenShort, lenLong, perWave) -> [{nShort, nLong, sShort, sLong}]   scent AFTER each wave (start 1 / 1):
            wave sends round(perWave * sS / (sS + sL)) ants short, rest long; sS += nShort, sL += nLong * lenShort / lenLong.
            antWaves(3, 180, 360, 10): 5/5, 6/4, 7/3, final scents 19 and 7.   L1.ANTS = that call.

   Colour tones used by the drawing files: "green" "red" "blue" "purple" "orange" "grey" (see VID.l5.tone). */
(function () {
  const V = window.VID;
  const L1 = (V.l1 = V.l1 || {});

  // ---------- randomness ----------
  const rng = (seed) => {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const randint = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const need = (cond, msg) => {
    if (!cond) throw new Error(`VID.l1: ${msg}`);
  };

  // ---------- 1. weasel ----------
  const TARGET = "METHINKS IT IS LIKE A WEASEL";
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
  const correct = (s, target) => [...s].reduce((n, c, i) => n + (c === target[i] ? 1 : 0), 0);
  const matches = (s) => correct(s, TARGET);
  const letter = (r) => ALPHA[Math.floor(r() * ALPHA.length)];

  /* Tries are counted like the app's demo: the random start string is try 1, every later candidate is one more try. */
  function keeper(seed, maxTries = 100000) {
    const r = rng(seed);
    const cells = Array.from(TARGET, () => letter(r));
    const start = cells.join("");
    let m = matches(start);
    const changes = [];
    const firstAt = {};
    const STEP = 25;
    const ckpt = [start];
    const evFrom = [0]; // evFrom[j] = index of the first change made after STEP * j candidates
    let n = 0; // candidates tried so far (tries = n + 1)
    while (m < TARGET.length && n + 1 < maxTries) {
      n++;
      const i = Math.floor(r() * TARGET.length);
      const c = letter(r);
      const d = (c === TARGET[i] ? 1 : 0) - (cells[i] === TARGET[i] ? 1 : 0);
      if (d >= 0 && c !== cells[i]) {
        cells[i] = c;
        m += d;
        changes.push({ try: n + 1, i, c, m });
        if (d > 0) firstAt[m] = firstAt[m] || n + 1;
      }
      if (n % STEP === 0) {
        ckpt.push(cells.join(""));
        evFrom.push(changes.length);
      }
    }
    const tries = n + 1;
    for (let q = 27; q >= 1; q--) firstAt[q] = Math.min(firstAt[q] || tries, firstAt[q + 1] || tries); // first try with AT LEAST q correct
    const stateAt = (t) => {
      const nn = clamp(Math.round(t), 1, tries) - 1;
      const j = Math.floor(nn / STEP);
      const cur = [...ckpt[j]];
      for (let e = evFrom[j]; e < changes.length && changes[e].try <= nn + 1; e++) cur[changes[e].i] = changes[e].c;
      return cur.join("");
    };
    const matchesAt = (t) => {
      const nn = clamp(Math.round(t), 1, tries);
      let [lo, hi] = [0, changes.length]; // lo = number of changes with try <= nn
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (changes[mid].try <= nn) lo = mid + 1;
        else hi = mid;
      }
      return lo ? changes[lo - 1].m : matches(start);
    };
    if (seed === 17) {
      need(
        tries === 3037 && start === "SFOECUHOGSVIGFRTHNSSPQPKBBXI",
        `keeper(17) gives ${tries} tries, expected 3,037`,
      );
      need(changes.length === 894, `keeper(17): ${changes.length} string changes, expected 894`);
    }
    return { tries, start, stateAt, matchesAt, firstAt, changes };
  }

  function monkey(seed, n) {
    const r = rng(seed);
    const strings = [];
    const hits = [];
    const best = [0];
    for (let k = 1; k <= n; k++) {
      const s = Array.from(TARGET, () => letter(r)).join("");
      strings.push(s);
      hits.push(matches(s));
      best.push(Math.max(best[k - 1], hits[k - 1]));
    }
    const at = (arr, k) => arr[clamp(Math.round(k), 1, n) - 1];
    const out = {
      tries: n,
      string: (k) => at(strings, k),
      matchesAt: (k) => at(hits, k),
      bestAt: (k) => best[clamp(Math.round(k), 0, n)],
    };
    if (seed === 117 && n === 3037) {
      need(out.bestAt(3037) === 6 && out.bestAt(47) === 6 && out.bestAt(46) === 3, "monkey(117) best-so-far changed");
    }
    return out;
  }
  const weasel = { TARGET, ALPHA, matches, keeper, monkey, SPACE: String(27n ** 28n), SPACE_DIGITS: 41 };

  // ---------- 2. CAT ----------
  const makeCat = () => {
    const target = "CAT";
    const start = "QZT";
    const tries = [
      [0, "C"],
      [2, "Q"],
      [1, "A"],
    ];
    let cur = start;
    const rows = tries.map(([i, c]) => {
      const cand = cur.slice(0, i) + c + cur.slice(i + 1);
      const [curOk, candOk] = [correct(cur, target), correct(cand, target)];
      const verdict = candOk >= curOk ? "keep" : "discard";
      const row = { cur, cand, curOk, candOk, verdict, after: verdict === "keep" ? cand : cur };
      cur = row.after;
      return row;
    });
    const verdicts = rows.map((r) => r.verdict);
    need(verdicts.join() === "keep,discard,keep" && cur === "CAT", "CAT rows do not give keep, discard, keep");
    return { target, start, tries, verdicts, rows };
  };

  // ---------- 3. landscape ----------
  const bump = (x, c, w, h) => h * Math.exp(-((x - c) ** 2) / (2 * w * w));
  const N = 240;
  const fOf = (x) =>
    0.1 +
    bump(x, 0.12, 0.04, 0.45) +
    bump(x, 0.3, 0.05, 0.62) +
    bump(x, 0.5, 0.035, 0.5) +
    bump(x, 0.7, 0.045, 1) +
    bump(x, 0.88, 0.04, 0.72) +
    0.04 * Math.sin(x * 60);
  const vals = Array.from({ length: N }, (_, i) => fOf(i / (N - 1)));
  const max = Math.max(...vals);
  const land = {
    N,
    vals,
    max,
    f: (i) => vals[clamp(Math.round(i), 0, N - 1)],
    pct: (i) => vals[clamp(Math.round(i), 0, N - 1)] / max,
    star: vals.indexOf(max),
    hills: vals.flatMap((v, i) => (i > 0 && i < N - 1 && v > vals[i - 1] && v >= vals[i + 1] && v > 0.5 ? [i] : [])),
  };
  const { f } = land;
  const near = (a, b, tol) => Math.abs(a - b) < tol;
  need(land.star === 167 && near(max, 1.0643, 5e-4) && land.hills.join() === "30,74,120,167,209", "landscape changed");

  function climber(seed, gens) {
    const r = rng(seed);
    let x = randint(r, 0, N - 1);
    const out = [{ start: x }];
    for (let g = 0; g < gens; g++) {
      const cand = clamp(x + randint(r, -4, 4), 0, N - 1);
      const ok = f(cand) >= f(x);
      if (ok) x = cand;
      out.push({ cand, ok, x });
    }
    return out;
  }

  function popRun(seed, P, gens, opt = {}) {
    const r = rng(seed);
    let pop = Array.from({ length: P }, () => randint(r, 0, N - 1));
    const out = [{ pop }];
    const winner = () => {
      const a = randint(r, 0, P - 1);
      const b = randint(r, 0, P - 1);
      return f(pop[a]) >= f(pop[b]) ? a : b;
    };
    for (let g = 0; g < gens; g++) {
      const info = pop.map(() => {
        const p1 = winner();
        const p2 = opt.rec ? winner() : null;
        const mid = opt.rec ? Math.round((pop[p1] + pop[p2]) / 2) : null;
        const kid = clamp((opt.rec ? mid : pop[p1]) + randint(r, -4, 4), 0, N - 1);
        return { p1, p2, mid, kid };
      });
      pop = info.map((c) => c.kid);
      out.push({ pop, info });
    }
    return out;
  }
  const avgPct = (pop) => (100 * pop.reduce((s, i) => s + land.pct(i), 0)) / pop.length;
  const nearStar = (pop) => pop.filter((i) => i >= 143 && i <= 187).length;

  function test200(P, seed) {
    const r = rng(seed);
    const flags = [];
    for (let run = 0; run < 200; run++) {
      let pop = Array.from({ length: P }, () => randint(r, 0, N - 1));
      for (let g = 0; g < 60; g++) {
        if (P === 1) {
          const m = clamp(pop[0] + randint(r, -4, 4), 0, N - 1);
          pop = [f(m) >= f(pop[0]) ? m : pop[0]];
        } else {
          const pick = () => {
            const a = pop[randint(r, 0, P - 1)];
            const b = pop[randint(r, 0, P - 1)];
            return f(a) >= f(b) ? a : b;
          };
          pop = pop.map(() => clamp(pick() + randint(r, -4, 4), 0, N - 1));
        }
      }
      flags.push(Math.max(...pop.map(f)) >= 0.98 * max ? 1 : 0);
    }
    return flags;
  }

  // ---------- 4. selection ----------
  function picks(seed, fit, n) {
    const r = rng(seed);
    const total = fit.reduce((a, b) => a + b, 0);
    return Array.from({ length: n }, () => {
      let u = r() * total;
      for (let i = 0; i < fit.length; i++) {
        if (u < fit[i]) return i;
        u -= fit[i];
      }
      return fit.length - 1;
    });
  }
  const chances = (fit) => {
    const t = fit.reduce((a, b) => a + b, 0);
    return fit.map((x) => Math.round((1000 * x) / t) / 10);
  };
  const chancesRounded = (fit) => {
    const raw = chances(fit);
    const out = raw.map(Math.floor);
    let left = 100 - out.reduce((a, b) => a + b, 0);
    raw
      .map((v, i) => [v - Math.floor(v), i])
      .sort((a, b) => b[0] - a[0])
      .forEach(([, i]) => left-- > 0 && out[i]++);
    return out;
  };
  const countPicks = (list, n) => Array.from({ length: n }, (_, i) => list.filter((p) => p === i).length);

  // ---------- 5. scene 2 models ----------
  function evoBars() {
    const H0 = [40, 92, 60, 28, 76, 50];
    const deltas = [
      [6, -5],
      [5, -4],
      [4, -6],
    ];
    const gens = [H0];
    const events = deltas.map((d) => {
      const before = gens[gens.length - 1];
      const order = before.map((h, i) => [h, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const dead = order.slice(0, 2).map((p) => p[1]);
      const parents = order
        .slice(-2)
        .reverse()
        .map((p) => p[1]);
      const after = before.slice();
      const copies = parents.map((from, k) => {
        after[dead[k]] = before[from] + d[k];
        return { from, to: dead[k], h: after[dead[k]] };
      });
      gens.push(after);
      return { dead, parents, copies, before, after };
    });
    const mean = (a) => Math.round((a.reduce((s, h) => s + h, 0) / a.length) * 10) / 10;
    const means = gens.map(mean);
    need(means.join() === "57.7,74.5,88,96.7", `evoBars means ${means}`);
    return { H0, gens, means, events, dead: events[0].dead, copies: events[0].copies };
  }

  function antWaves(waves, lenShort, lenLong, perWave) {
    let [sShort, sLong] = [1, 1];
    return Array.from({ length: waves }, () => {
      const nShort = Math.round((perWave * sShort) / (sShort + sLong));
      const nLong = perWave - nShort;
      sShort += nShort;
      sLong += (nLong * lenShort) / lenLong;
      return { nShort, nLong, sShort, sLong };
    });
  }

  const PICKS = picks(46, [9, 6, 3, 1], 20);
  const ANTS = antWaves(3, 180, 360, 10);
  const CAT = makeCat();

  /** Throws when a number quoted in the video no longer comes out; returns the numbers it found. */
  function verify() {
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const k = keeper(17);
    const mk = monkey(117, 3037);
    need(
      [8, 183, 507, 904, 1362, 1605, 1707, 2108, 3037].join() ===
        [1, 5, 10, 15, 20, 25, 26, 27, 28].map((m) => k.firstAt[m]).join(),
      "keeper milestones",
    );
    const cl = climber(23, 16);
    const cands = cl.slice(1).map((c) => c.cand + (c.ok ? "+" : "x"));
    need(
      cl[0].start === 22 && cands.join(" ") === "18x 23+ 21x 21x 20x 23+ 27+ 30+ 26x 32x 27x 26x 34x 33x 30+ 32x",
      "climber(23)",
    );
    const p16 = popRun(16, 20, 16);
    need(
      p16[0].pop.join() === "151,34,180,93,81,4,225,123,45,224,109,1,65,100,139,203,81,99,203,38",
      "popRun(16) start",
    );
    need(p16.map((g) => nearStar(g.pop)).join() === "2,2,2,2,4,4,2,1,2,2,4,5,6,7,12,19,20", "popRun(16) star counts");
    const t1 = sum(test200(1, 1));
    const t20 = sum(test200(20, 1));
    need(t1 === 42 && t20 === 167, `test200 gave ${t1} / ${t20}, expected 42 / 167`);
    const p40 = popRun(40, 6, 5, { rec: true });
    const avg = p40.map((g) => Math.round(avgPct(g.pop)));
    need(avg.join() === "49,73,82,92,93,95", `popRun(40) averages ${avg}`);
    need(PICKS.map((p) => "ABCD"[p]).join(" ") === "A C A C A A B A B B B A B D A B C A A A", "picks(46)");
    need(
      ANTS.map((w) => `${w.nShort}/${w.nLong}`).join() === "5/5,6/4,7/3" &&
        ANTS[2].sShort === 19 &&
        ANTS[2].sLong === 7,
      "ants",
    );
    return { keeperTries: k.tries, monkeyBest: mk.bestAt(3037), test200: [t1, t20], averages: avg, climber: cl };
  }

  Object.assign(L1, {
    rng,
    randint,
    clamp,
    fmt,
    correct,
    weasel,
    CAT,
    land,
    climber,
    popRun,
    avgPct,
    nearStar,
    test200,
    picks,
    chances,
    chancesRounded,
    countPicks,
    PICKS,
    evoBars,
    antWaves,
    ANTS,
    verify,
  });
})();
