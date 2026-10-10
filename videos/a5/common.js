/* Phase 5 · Convex Hulls: the data and algorithms every scene of this video shares (pure, no DOM, randomness only through the
   seeded A5.rng). Everything hangs off VID.a5 (short name A5); scenes start with  const A5 = VID.a5;  Drawing helpers are in
   common-2.js (A5.plot: points, segments, polygons, arcs, tags), common-3.js (tags, tiles, counter, bars, stack cup, turn icons)
   and common-4.js (grid, sheet of text rows). Every number below comes from running the real algorithm when the page loads and is
   asserted against the storyboard (videos/_plan/algo-5.json): a wrong number throws an Error with a clear message. Run
   `node -e "global.window={VID:{}};require('./videos/a5/common.js');console.log(Object.keys(window.VID.a5))"` to check it.

   SCREEN COORDINATES.  Like the app (lesson 5.2) every point is [x, y] with y pointing DOWN. "left" and "right" always mean
   what the viewer SEES on screen. A5.turnValue(o, a, b) > 0 is a left turn o -> a -> b (as seen), < 0 right, 0 straight;
   A5.turnKind(o, a, b) -> "left" | "right" | "straight". A5.angle(from, to) = screen degrees (0 = east, 90 = south, -90 = up,
   so clockwise on screen is POSITIVE); A5.cwFromUp(h, p) = the lecture's clockwise angle from straight up (0..360);
   A5.ccwFromEast(c, p) = anticlockwise angle from east (0..360; Graham's sort key). A5.polar(p, deg, len) -> [x, y] along a
   screen angle; A5.rayEnd(p, deg, box?) -> where a ray from p leaves the box [x0, y0, x1, y1] (default the stage minus 12 px);
   A5.dist(a, b); A5.hullOf(P) -> hull names counter-clockwise as seen, starting at the leftmost point.

   THE SEVEN POINTS (lessons 5.2 to 5.4, the app's own data).   A5.PTS = {A: [60,230], B: [160,170], C: [190,245], D: [330,210],
   E: [410,120], F: [250,140], G: [230,45]};  A5.NAMES = "ABCDEFG" as an array.  The hull has five corners and B, F are inside:
   A5.HULL = ["A","C","D","E","G"] (anticlockwise as seen: left, bottom, right, top; Graham walks it this way) and
   A5.HULL_CW = ["A","G","E","D","C"] (gift wrapping walks it this way, as the lecture does); A5.INSIDE = ["B","F"].

   TURN TEST (scene 3, lesson 5.2 table; maths coordinates, y UP, as in the lesson).  A5.TRIPLES = [{p, a, b, va, vb, terms,
   cross, turn}]: va = a - p, vb = b - p, terms = [va.x * vb.y, va.y * vb.x], cross = terms[0] - terms[1], turn "left" | "right" |
   "straight":
       p (2,0) a (5,1) b (3,4):  va (3,1) vb (1,4)  3*4 - 1*1 = 11   left
       p (1,3) a (4,4) b (6,1):  va (3,1) vb (5,-2) 3*-2 - 1*5 = -11 right      (terms [-6, 5])
       p (0,2) a (2,3) b (6,5):  va (2,1) vb (6,3)  2*3 - 1*6 = 0    straight
   A5.crossUp(p, a, b) = the same formula for maths coordinates.

   ONE RIGHT TURN IS A DENT (scene 4).  A5.DENT = {path: ["A","C","D","E","F","G"], turns: [{at, from, to, kind}] one per vertex of the
   closed path (kind "left" except at F: "right"), hull: A5.HULL, skip: "F"}: the walk round the five corners turns left five times; a
   walk that goes E -> F -> G turns right at F, so F is a dent, not a corner (the same test pops F in Graham scan).

   GIFT WRAPPING, as the lecture and the app's "Watch it run" do it (scene 5).  A5.WRAP = A5.wrap(A5.PTS):
       start "A" (leftmost), reference r = a made-up point straight above it, then the clockwise angle r-h-p is measured for every
       candidate p (every point not yet on the hull, plus the start so the loop can close); the SMALLEST wins.
       .hull ["A","G","E","D","C"]      .rounds[i] = {n, h, ref ("up" in round 1, else the previous hull point), cands: [names, in
       alphabetical order], deg: {B: 59, ...} (rounded degrees), exact: {B: 59.04, ...}, best}      .checks 24 (candidates measured)
       Round 1 from A (r straight above):  B 59, C 97, D 86, E 73, F 65, G 43  -> G wins (42.6 degrees).
       Round 2 from G: E (250 deg from the reference toward A) wins;  round 3 from E: D;  round 4 from D: C;  round 5 from C: A, the
       start, so the loop closes.  Candidates per round: 6, 6, 5, 4, 3.  (Later-round angles are measured from the direction BACK to
       the previous hull point, so they run 180..360 and are NOT to be shown; show degrees in round 1 only.)
       A5.sweepDeg(h, p) = the round-1 style clockwise angle from straight up, in degrees (A -> G = 42.6).

   GRAHAM SCAN (scenes 6 and 7).  A5.SORT = {pivot: "C" (the lowest point), order: ["D","E","F","G","B","A"], ccw: {D: 14.0, E: 29.6, F: 60.3,
   G: 78.7, B: 111.8, A: 173.4} (anticlockwise degrees from east, the sort key)}.  A5.SCAN = A5.scan(A5.PTS) = {pivot, order, rounds,
   stack, popped, tests}:
       rounds[i] (one per incoming point p = order[i + 1]) = {p, tests: [{a, t, p, value, kind, pop}], popped: [names], before, after}
       where each test looks at the walk a -> t -> p (a = next-to-top, t = top of the stack): "left" keeps t, anything else pops t.
         E: C D E left                      -> push            stack C D E
         F: D E F left                      -> push            stack C D E F
         G: E F G RIGHT (pop F), D E G left -> push            stack C D E G
         B: E G B left                      -> push            stack C D E G B
         A: G B A RIGHT (pop B), E G A left -> push            stack C D E G A
       the scan starts with the stack [C, D] (pivot and first sorted point);  .stack = ["C","D","E","G","A"] = the hull anticlockwise;
       .popped = ["F","B"]; .tests = 7 turn tests.   A5.sortedPath = the closed walk C D E F G B A (back to C) in sorted order: it has
       dents at F and B (right turns), which the scan removes.

   COST (scene 8, lesson 5.6).  A5.log2n(1024) = 10.  A5.COST = {n: 1024, scan: 10240 (n log2 n), tie: 10, cases: [{h: 4, wrap: 4096,
   scan: 10240, winner: "wrap"}, {h: 1024, wrap: 1048576, scan: 10240, winner: "scan"}]};  A5.cost(n, h) -> {wrap: n * h, scan: n * log2 n}.
   A5.cloud(kind, seed) -> [[x, y], ...] in 0..1 for the two pictures: "blob" = 60 points, only 4 of them hull corners (the first four
   are the corners, in order), "ring" = 48 points all on a circle (all of them hull corners).  A5.cloudHull(points) -> indices of hull
   corners.  Asserted: blob hull = 4, ring hull = 48.

   FARTHEST PAIR (scene 9, lesson 5.8).  A5.FAR = {pairs: [{key, a, b, len, corner}] all 21 pairs of the seven points (alphabetical keys, len in
   app units), longest: {key: "AE", len: 366.9...}, corners: 10 (pairs between the five hull corners), all: 21,
   big: {n: 1000, hull: 10, all: 499500, corners: 45}}.  The longest pair is two hull corners (A and E).

   SMALL TOOLS.  A5.rng(seed) -> () => 0..1 (mulberry32, seeded: the only randomness allowed)   A5.num(x, d = 1) -> "42.6"
        A5.commas(n) -> "1,048,576"   A5.same(what, got, want) throws when JSON differs.  A5.close(what, got, want, tol) throws when
        numbers differ.  A5.TONES = ["grey","green","red","orange","blue","purple"]. */
(function () {
  const V = window.VID;
  const A5 = (V.a5 = V.a5 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a5: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.05) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a5: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const num = (x, d = 1) => x.toFixed(d);
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const TONES = ["grey", "green", "red", "orange", "blue", "purple"];
  const DEG = 180 / Math.PI;

  // ---------- geometry (screen coordinates, y down) ----------
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const turnValue = (o, a, b) => -cross(o, a, b);
  const turnKind = (o, a, b) => {
    const v = turnValue(o, a, b);
    return v > 0 ? "left" : v < 0 ? "right" : "straight";
  };
  const crossUp = (p, a, b) => (a[0] - p[0]) * (b[1] - p[1]) - (a[1] - p[1]) * (b[0] - p[0]);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const angle = (from, to) => Math.atan2(to[1] - from[1], to[0] - from[0]) * DEG;
  const mod360 = (d) => ((d % 360) + 360) % 360;
  const cwFromUp = (h, p) => mod360(angle(h, p) + 90);
  const ccwFromEast = (c, p) => mod360(-angle(c, p));
  const polar = (p, deg, len) => [p[0] + Math.cos(deg / DEG) * len, p[1] + Math.sin(deg / DEG) * len];
  const rayEnd = (p, deg, box = [12, 12, 924, 628]) => {
    const [dx, dy] = [Math.cos(deg / DEG), Math.sin(deg / DEG)];
    const ts = [];
    if (dx > 1e-9) ts.push((box[2] - p[0]) / dx);
    if (dx < -1e-9) ts.push((box[0] - p[0]) / dx);
    if (dy > 1e-9) ts.push((box[3] - p[1]) / dy);
    if (dy < -1e-9) ts.push((box[1] - p[1]) / dy);
    const t = Math.min(...ts);
    return [p[0] + dx * t, p[1] + dy * t];
  };
  /** Convex hull (Andrew's monotone chain) of {name: [x, y]} in screen coordinates: names anticlockwise as seen, from the leftmost. */
  function hullOf(P) {
    const names = Object.keys(P).sort((a, b) => P[a][0] - P[b][0] || P[b][1] - P[a][1]);
    const cr = (o, a, b) => (P[a][0] - P[o][0]) * (-P[b][1] + P[o][1]) - (-P[a][1] + P[o][1]) * (P[b][0] - P[o][0]);
    const half = (list) => {
      const out = [];
      list.forEach((q) => {
        while (out.length >= 2 && cr(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
        out.push(q);
      });
      out.pop();
      return out;
    };
    return half(names).concat(half(names.slice().reverse()));
  }

  // ---------- the seven points ----------
  const PTS = { A: [60, 230], B: [160, 170], C: [190, 245], D: [330, 210], E: [410, 120], F: [250, 140], G: [230, 45] };
  const NAMES = Object.keys(PTS);
  const HULL = hullOf(PTS);
  const HULL_CW = [HULL[0], ...HULL.slice(1).reverse()];
  const INSIDE = NAMES.filter((n) => !HULL.includes(n));
  same("hull of the seven points", HULL, ["A", "C", "D", "E", "G"]);
  same("inside points", INSIDE, ["B", "F"]);

  // ---------- the turn test (lesson 5.2 table, y up) ----------
  const TRIPLES = [
    [[2, 0], [5, 1], [3, 4]],
    [[1, 3], [4, 4], [6, 1]],
    [[0, 2], [2, 3], [6, 5]],
  ].map(([p, a, b]) => { // prettier-ignore
    const va = [a[0] - p[0], a[1] - p[1]];
    const vb = [b[0] - p[0], b[1] - p[1]];
    const terms = [va[0] * vb[1], va[1] * vb[0]];
    const c = terms[0] - terms[1];
    return { p, a, b, va, vb, terms, cross: c, turn: c > 0 ? "left" : c < 0 ? "right" : "straight" };
  });
  same(
    "turn test crosses",
    TRIPLES.map((t) => [t.cross, t.turn]),
    [[11, "left"], [-11, "right"], [0, "straight"]], // prettier-ignore
  );
  same("turn test terms", TRIPLES.map((t) => t.terms), [[12, 1], [-6, 5], [6, 6]]); // prettier-ignore
  same("turn test vectors", TRIPLES.map((t) => [t.va, t.vb]), [[[3, 1], [1, 4]], [[3, 1], [5, -2]], [[2, 1], [6, 3]]]); // prettier-ignore
  TRIPLES.forEach((t, i) => close(`crossUp ${i}`, crossUp(t.p, t.a, t.b), t.cross, 0));

  // ---------- one right turn is a dent ----------
  const DENT_PATH = ["A", "C", "D", "E", "F", "G"];
  const DENT = {
    path: DENT_PATH,
    hull: HULL,
    skip: "F",
    turns: DENT_PATH.map((at, i) => {
      const from = DENT_PATH[(i + DENT_PATH.length - 1) % DENT_PATH.length];
      const to = DENT_PATH[(i + 1) % DENT_PATH.length];
      return { at, from, to, kind: turnKind(PTS[from], PTS[at], PTS[to]) };
    }),
  };
  same(
    "turns round the hull",
    HULL.map((at, i) => turnKind(PTS[HULL[(i + 4) % 5]], PTS[at], PTS[HULL[(i + 1) % 5]])),
    ["left", "left", "left", "left", "left"],
  );
  same(
    "turns round the dented path",
    DENT.turns.map((t) => `${t.at}:${t.kind}`),
    ["A:left", "C:left", "D:left", "E:left", "F:right", "G:left"],
  );

  // ---------- gift wrapping (the lecture's version) ----------
  function wrap(P) {
    const names = Object.keys(P);
    const start = names.reduce((m, n) => (P[n][0] < P[m][0] ? n : m));
    const rounds = [];
    const H = [];
    let h = start;
    let ref = "up";
    let checks = 0;
    for (let guard = 0; guard < names.length + 2; guard++) {
      H.push(h);
      const refPt = ref === "up" ? [P[h][0], P[h][1] - 110] : P[ref];
      const cands = names.filter((n) => n !== h && (!H.includes(n) || n === H[0]));
      const exact = {};
      cands.forEach((n) => {
        const a = mod360(angle(P[h], P[n]) - angle(P[h], refPt));
        exact[n] = a < 1e-9 ? 360 : a;
      });
      const best = cands.reduce((m, n) => (exact[n] < exact[m] - 1e-9 ? n : m));
      const deg = Object.fromEntries(cands.map((n) => [n, Math.round(exact[n])]));
      checks += cands.length;
      rounds.push({ n: rounds.length + 1, h, ref, cands, deg, exact, best });
      if (best === start) break;
      ref = h;
      h = best;
    }
    return { start, hull: H, rounds, checks };
  }
  const WRAP = wrap(PTS);
  same("wrap hull", WRAP.hull, ["A", "G", "E", "D", "C"]);
  same("wrap hull is the hull", WRAP.hull, HULL_CW);
  same(
    "wrap candidates per round",
    WRAP.rounds.map((r) => r.cands.length),
    [6, 6, 5, 4, 3],
  );
  same("wrap round 1 angles", WRAP.rounds[0].deg, { B: 59, C: 97, D: 86, E: 73, F: 65, G: 43 });
  same(
    "wrap winners",
    WRAP.rounds.map((r) => r.best),
    ["G", "E", "D", "C", "A"],
  );
  close("wrap round 1 smallest angle", WRAP.rounds[0].exact.G, 42.6, 0.05);
  same("wrap checks", WRAP.checks, 24);
  const sweepDeg = (h, p) => cwFromUp(PTS[h], PTS[p]);

  // ---------- Graham scan (the app's version: the lowest point is the pivot) ----------
  function scan(P) {
    const names = Object.keys(P);
    const pivot = names.reduce((m, n) => (P[n][1] > P[m][1] || (P[n][1] === P[m][1] && P[n][0] < P[m][0]) ? n : m));
    const key = (n) => ccwFromEast(P[pivot], P[n]);
    const order = names.filter((n) => n !== pivot).sort((a, b) => key(a) - key(b));
    const ccw = Object.fromEntries(order.map((n) => [n, Math.round(key(n) * 10) / 10]));
    const st = [pivot, order[0]];
    const rounds = [];
    const popped = [];
    let tests = 0;
    for (let i = 1; i < order.length; i++) {
      const p = order[i];
      const before = st.slice();
      const ts = [];
      const gone = [];
      while (st.length >= 2) {
        const [a, t] = [st[st.length - 2], st[st.length - 1]];
        const value = turnValue(P[a], P[t], P[p]);
        tests++;
        const pop = value <= 0;
        ts.push({ a, t, p, value, kind: value > 0 ? "left" : value < 0 ? "right" : "straight", pop });
        if (!pop) break;
        gone.push(st.pop());
        popped.push(t);
      }
      st.push(p);
      rounds.push({ p, tests: ts, popped: gone, before, after: st.slice() });
    }
    return { pivot, order, ccw, rounds, stack: st, popped, tests };
  }
  const SCAN = scan(PTS);
  const SORT = { pivot: SCAN.pivot, order: SCAN.order, ccw: SCAN.ccw };
  same("sort pivot and order", [SORT.pivot, SORT.order.join("")], ["C", "DEFGBA"]);
  same("sort angles", SORT.ccw, { D: 14, E: 29.6, F: 60.3, G: 78.7, B: 111.8, A: 173.4 });
  same(
    "scan stacks",
    SCAN.rounds.map((r) => r.after.join("")),
    ["CDE", "CDEF", "CDEG", "CDEGB", "CDEGA"],
  );
  same(
    "scan tests",
    SCAN.rounds.map((r) => r.tests.map((t) => `${t.a}${t.t}${t.p}:${t.kind}`).join(" ")),
    ["CDE:left", "DEF:left", "EFG:right DEG:left", "EGB:left", "GBA:right EGA:left"],
  );
  same("scan popped", SCAN.popped, ["F", "B"]);
  same("scan stack is the hull", SCAN.stack, HULL.slice(HULL.indexOf("C")).concat(HULL.slice(0, HULL.indexOf("C"))));
  same("scan test count", SCAN.tests, 7);
  const sortedPath = [SCAN.pivot, ...SCAN.order];
  same(
    "the sorted walk has right turns at F and B only",
    sortedPath.map((at, i) => {
      const [f, t] = [sortedPath[(i + 6) % 7], sortedPath[(i + 1) % 7]];
      return `${at}:${turnKind(PTS[f], PTS[at], PTS[t])}`;
    }),
    ["C:left", "D:left", "E:left", "F:right", "G:left", "B:right", "A:left"],
  );

  // ---------- cost (lesson 5.6) ----------
  const log2n = (n) => Math.round(Math.log2(n) * 1e9) / 1e9;
  const cost = (n, h) => ({ wrap: n * h, scan: n * log2n(n) });
  const COST = {
    n: 1024,
    scan: cost(1024, 4).scan,
    tie: log2n(1024),
    cases: [4, 1024].map((h) => {
      const c = cost(1024, h);
      return { h, wrap: c.wrap, scan: c.scan, winner: c.wrap < c.scan ? "wrap" : "scan" };
    }),
  };
  same("cost", COST, {
    n: 1024,
    scan: 10240,
    tie: 10,
    cases: [
      { h: 4, wrap: 4096, scan: 10240, winner: "wrap" },
      { h: 1024, wrap: 1048576, scan: 10240, winner: "scan" },
    ],
  });
  /** the corner indices (of any [[x, y], ...]) of the convex hull */
  const cloudHull = (pts) => {
    const P = Object.fromEntries(pts.map((p, i) => [i, p]));
    return hullOf(P).map(Number);
  };
  function cloud(kind, seed) {
    const r = rng(seed);
    if (kind === "ring") {
      return Array.from({ length: 48 }, (_, i) => {
        const a = ((i + 0.3 * (r() - 0.5)) / 48) * 2 * Math.PI;
        return [0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)];
      });
    }
    const corners = [[0.12, 0.2], [0.9, 0.08], [0.96, 0.86], [0.04, 0.92]]; // prettier-ignore
    const area = (a, b, c) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2;
    const tris = [[0, 1, 2], [0, 2, 3]].map((t) => t.map((i) => corners[i])); // prettier-ignore
    const share = area(...tris[0]) / (area(...tris[0]) + area(...tris[1]));
    const pts = corners.slice();
    while (pts.length < 60) {
      const [a, b, c] = tris[r() < share ? 0 : 1];
      const [u, v] = [Math.sqrt(r()), r()];
      const [wa, wb, wc] = [1 - u, u * (1 - v), u * v]; // uniform inside the triangle
      pts.push([0, 1].map((k) => a[k] * wa + b[k] * wb + c[k] * wc));
    }
    return pts;
  }
  const BLOB = cloud("blob", 7);
  const RING = cloud("ring", 3);
  same("blob hull", cloudHull(BLOB).length, 4);
  same("blob hull corners are the first four", cloudHull(BLOB).sort(), [0, 1, 2, 3]);
  same("ring hull", cloudHull(RING).length, 48);

  // ---------- farthest pair (lesson 5.8) ----------
  const pairs = [];
  NAMES.forEach((a, i) => NAMES.slice(i + 1).forEach((b) => {
    pairs.push({ key: a + b, a, b, len: dist(PTS[a], PTS[b]), corner: HULL.includes(a) && HULL.includes(b) });
  })); // prettier-ignore
  const longest = pairs.reduce((m, p) => (p.len > m.len ? p : m));
  const choose2 = (n) => (n * (n - 1)) / 2;
  const FAR = {
    pairs,
    longest,
    all: pairs.length,
    corners: pairs.filter((p) => p.corner).length,
    big: { n: 1000, hull: 10, all: choose2(1000), corners: choose2(10) },
  };
  same("farthest pair", [longest.key, longest.corner], ["AE", true]);
  close("farthest pair length", longest.len, 366.9, 0.05);
  same("pair counts", [FAR.all, FAR.corners], [21, 10]);
  same("big pair counts", FAR.big, { n: 1000, hull: 10, all: 499500, corners: 45 });

  Object.assign(A5, {
    same, close, rng, num, commas, TONES, cross, turnValue, turnKind, crossUp, dist, angle, cwFromUp, ccwFromEast, polar, rayEnd,
    hullOf, PTS, NAMES, HULL, HULL_CW, INSIDE, TRIPLES, DENT, wrap, WRAP, sweepDeg, scan, SCAN, SORT, sortedPath, log2n, cost, COST,
    cloud, cloudHull, BLOB, RING, FAR,
  }); // prettier-ignore
})();
