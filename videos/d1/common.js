/* Lecture 1 · Reliable, scalable and maintainable systems: the data and rules every scene of this video shares (pure, no DOM,
   no randomness except the seeded rng). Everything hangs off VID.d1; scenes start with  const D1 = VID.d1;  Drawing helpers
   are in common-2.js (tags, cards, icons), common-3.js (servers, packets, wires, bars) and common-4.js (the disk field, the
   dot histogram, the architecture diagram). Every number below comes from running the real rule when the page loads and is
   asserted against the storyboard (videos/_plan/ds-1.json): a wrong number throws an Error with a clear message.

   TOOLS.  D1.same(what, got, want) (deep compare, throws), D1.close(what, got, want, tol), D1.rng(seed) -> () => 0..1 (seeded,
           mulberry32), D1.fmt(34297) -> "34,297", D1.money(34297) -> "£34,297", D1.pct(0.579) -> "58%".

   1. ONE SERVER (scene 2; lesson 1.1).  One mainframe handles 6,000 requests per second.
        D1.serve(load, cap = 6000, alive = true) -> {load, cap, served, dropped}
        D1.ONE = {cap: 6000, loads: [3000, 9000],
                  calm: {served: 3000, dropped: 0}, over: {served: 6000, dropped: 3000}, down: {served: 0, dropped: 9000}}
   2. TWO COPIES AND A CUT LINK (scene 3; lesson 1.1).  London and New York each hold "tickets left" = 5.
        D1.ticketRun(mode) with mode "consistent" | "available" -> {london: 4, ny: 5, answer: null | 5, stale: bool}: the link is
        cut, London sells one ticket (5 -> 4), then a customer asks New York.
        D1.TICKETS = {start: 5, after: 4, consistent: {answer: null, stale: false}, available: {answer: 5, stale: true}}
   3. FOUR BUILDING BLOCKS (scene 4; lesson 1.2).
        D1.CACHE = {dbMs: 100, cacheMs: 2, items: 20, top: 4, shares: [20 popularity shares, sum 1, Zipf], hit: 0.579 (share of
                    requests the 4 most popular products catch), avgMs: 43.25 (mean latency with that cache), noneMs: 100}
        D1.INDEX = {records: 1000000, scan: 1000000, checks: 20}   (checks = ceil(log2(records)))
        D1.BATCH = {night: "02:00", ready: "08:00"}
   4. DISKS (scene 5; lesson 1.3).  10,000 disks, each with a 1-in-10,000 chance of dying each day; a dead disk is replaced after
        3 days.  Seeded simulation (seed 872), 7 days, disk i sits at column i % 100, row floor(i / 100); its copy is disk i ^ 1.
        D1.DISKS = {n: 10000, p: 0.0001, expected: 1, seed: 872, replace: 3, cols: 100,
                    days: [{day: 1, dead: [idx...], total: running count of faults}, ... 7],
                    perDay: [1, 1, 0, 2, 1, 1, 1], faults: 7,
                    failures1: 7 (one copy: every dead disk loses data), failures2: 0 (a copy is alive for every dead disk),
                    at(i) -> {col, row}, copy(i) -> i ^ 1}
   5. CASCADE (scene 6; lesson 1.3).  Six servers, each can take 100 units of load, total load 420.
        D1.cascade(load, n, cap) -> [{alive, per, over}]: what happens when servers keep dying while the survivors are overloaded.
        D1.CASC = {n: 6, cap: 100, load: 420,
                   calm: {alive: 6, per: 70}, one: {alive: 5, per: 84, over: false},
                   two: {alive: 4, per: 105, over: true},
                   chain: [{alive: 4, per: 105}, {alive: 3, per: 140}, {alive: 2, per: 210}, {alive: 1, per: 420}, {alive: 0}]}
   6. RESPONSE TIMES (scene 7; lesson 1.4).  A long-tailed distribution (gamma, shape 2.5, scale 100 ms), 100 requests = its
        100 mid-point quantiles, arriving in a fixed shuffled order.
        D1.PERF = {samples: [100 response times in ms, ascending], order: [0..99 shuffled: the order they arrive],
                   mean: 250, p50: 218, p95: 554, p99: 754, aboveP95: 5, aboveP99: 1, max: 837,
                   bin: 50, bins: [count per 50 ms bin, 17 of them, 0-50 ... 800-850]}
        D1.quantile(p) -> ms of the continuous distribution
   7. FAN-OUT (scene 8; lesson 1.5).  Six users; X follows the people in D1.TWEET.follows[X].
        D1.TWEET = {users: ["Ana", ...], follows, followersOf(u), cat: {followers: ["Ana","Ben","Dev","Eli","Fay"],
                    writes1: 1, writes2: 5}, ana: {followees: ["Ben","Cat","Dev"], reads1: 3, reads2: 1},
                    load: {posts: 4600, reads: 300000, fan: 75, writes2: 345000, ratio: 65.2},
                    celeb: {followers: 30000000, secs: 87, target: 5}}
   8. SCALE UP OR OUT (scene 9; lesson 1.6).  Cost of capacity measured in "basic machines".
        D1.costUp(c) = 1000 * c^1.7 (Infinity above 32);  D1.costOut(c) = 1000 * c * (c > 1 ? 1.1 : 1);  D1.left(c, dead)
        D1.SCALE = {max: 32, need: 8, up8: 34297, out8: 8800, up32: 362039, out32: 35200, big: 40, out40: 44000, up40: Infinity,
                    leftUp: 0, leftOut: 88}   (leftOut: one of 8 machines dead = 7/8 of the capacity, rounded to %)
   9. MAINTAINABILITY (scene 10; lesson 1.7).
        D1.MAINT = {services: ["Web app","Mobile API","Reports","Search","Billing"], dbs: ["Users DB","Orders DB","Products DB",
                    "Logs DB"], edges: 20 pairs [serviceIndex, dbIndex], direct: 20, layered: 9, hot: 1 (the Orders DB index),
                    editDirect: 5 (services to edit when Orders DB is replaced), editLayer: 1, big: {services: 8, dbs: 6,
                    direct: 48, layered: 14}}
   10. WORKSHOP for the recap: D1.NEXT = "Next: Workshop 1.W". */
(function () {
  const V = window.VID;
  const D1 = (V.d1 = V.d1 || {});

  // ---------- tools ----------
  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d1: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol))
      throw new Error(`VID.d1: ${what} is ${got}, the storyboard says ${want} (+-${tol})`);
  };
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const fmt = (n) => Math.round(n).toLocaleString("en-GB");
  const money = (n) => `£${fmt(n)}`;
  const pct = (x) => `${Math.round(x * 100)}%`;
  Object.assign(D1, { same, close, rng, fmt, money, pct });

  // ---------- 1. one server ----------
  const serve = (load, cap = 6000, alive = true) => {
    const served = alive ? Math.min(load, cap) : 0;
    return { load, cap, served, dropped: load - served };
  };
  const ONE = { cap: 6000, loads: [3000, 9000] };
  ONE.calm = serve(3000, ONE.cap);
  ONE.over = serve(9000, ONE.cap);
  ONE.down = serve(9000, ONE.cap, false);
  same("one server calm", [ONE.calm.served, ONE.calm.dropped], [3000, 0]);
  same("one server over", [ONE.over.served, ONE.over.dropped], [6000, 3000]);
  same("one server down", [ONE.down.served, ONE.down.dropped], [0, 9000]);
  ONE.calm = { served: 3000, dropped: 0 };
  ONE.over = { served: 6000, dropped: 3000 };
  ONE.down = { served: 0, dropped: 9000 };
  Object.assign(D1, { serve, ONE });

  // ---------- 2. two copies and a cut link ----------
  const ticketRun = (mode) => {
    let [london, ny] = [5, 5];
    london -= 1; // the link is cut: the sale is never copied
    const real = london;
    if (mode === "consistent") return { london, ny, answer: null, stale: false };
    return { london, ny, answer: ny, stale: ny !== real };
  };
  const TICKETS = { start: 5, after: 4, consistent: ticketRun("consistent"), available: ticketRun("available") };
  same("tickets consistent", [TICKETS.consistent.answer, TICKETS.consistent.stale], [null, false]);
  same(
    "tickets available",
    [TICKETS.available.answer, TICKETS.available.stale, TICKETS.available.london],
    [5, true, 4],
  );
  Object.assign(D1, { ticketRun, TICKETS });

  // ---------- 3. the four building blocks ----------
  const zipf = Array.from({ length: 20 }, (_, i) => 1 / (i + 1));
  const zsum = zipf.reduce((a, b) => a + b, 0);
  const shares = zipf.map((z) => z / zsum);
  const hit = shares.slice(0, 4).reduce((a, b) => a + b, 0);
  const CACHE = {
    dbMs: 100,
    cacheMs: 2,
    items: 20,
    top: 4,
    shares,
    hit,
    avgMs: hit * 2 + (1 - hit) * 100,
    noneMs: 100,
  };
  close("cache hit share of the 4 most popular of 20", CACHE.hit, 0.579, 0.0005);
  close("cache average latency", CACHE.avgMs, 43.25, 0.01);
  const INDEX = { records: 1000000, scan: 1000000, checks: Math.ceil(Math.log2(1000000)) };
  same("index checks", INDEX.checks, 20);
  Object.assign(D1, { CACHE, INDEX, BATCH: { night: "02:00", ready: "08:00" } });

  // ---------- 4. disks ----------
  const N_DISK = 10000;
  const P_DISK = 1e-4;
  const simulateDisks = (seed, days, replace) => {
    const r = rng(seed);
    const back = new Array(N_DISK).fill(0); // the day a replaced disk is back
    let total = 0;
    return Array.from({ length: days }, (_, d) => {
      const dead = [];
      for (let i = 0; i < N_DISK; i++)
        if (back[i] <= d && r() < P_DISK) {
          back[i] = d + 1 + replace;
          dead.push(i);
        }
      total += dead.length;
      return { day: d + 1, dead, total };
    });
  };
  const DISKS = { n: N_DISK, p: P_DISK, expected: N_DISK * P_DISK, seed: 872, replace: 3, cols: 100 };
  DISKS.days = simulateDisks(DISKS.seed, 7, DISKS.replace);
  DISKS.perDay = DISKS.days.map((d) => d.dead.length);
  DISKS.faults = DISKS.days[6].total;
  const allDead = DISKS.days.flatMap((d) => d.dead);
  DISKS.failures1 = allDead.length; // one copy: the data on a dead disk is gone
  DISKS.failures2 = allDead.filter((i) => allDead.includes(i ^ 1) && i !== (i ^ 1)).length; // both copies of a pair dead
  DISKS.at = (i) => ({ col: i % 100, row: Math.floor(i / 100) });
  DISKS.copy = (i) => i ^ 1;
  close("expected faults per day", DISKS.expected, 1);
  same("disk faults per day", DISKS.perDay, [1, 1, 0, 2, 1, 1, 1]);
  same("disk faults in a week", [DISKS.faults, DISKS.failures1, DISKS.failures2], [7, 7, 0]);
  same(
    "dead disks (column,row)",
    allDead.map((i) => `${i % 100},${Math.floor(i / 100)}`),
    ["71,10", "32,23", "74,59", "74,91", "39,62", "8,1", "91,46"],
  );
  D1.DISKS = DISKS;

  // ---------- 5. cascade ----------
  const cascade = (load, n, cap) =>
    Array.from({ length: n + 1 }, (_, k) => {
      const alive = n - k;
      return alive ? { alive, per: load / alive, over: load / alive > cap } : { alive: 0, per: Infinity, over: true };
    });
  const CASC = { n: 6, cap: 100, load: 420 };
  const rows = cascade(CASC.load, CASC.n, CASC.cap);
  CASC.calm = { alive: 6, per: rows[0].per };
  CASC.one = { alive: 5, per: rows[1].per, over: rows[1].over };
  CASC.two = { alive: 4, per: rows[2].per, over: rows[2].over };
  CASC.chain = rows.slice(2).map((r) => (r.alive ? { alive: r.alive, per: r.per } : { alive: 0 }));
  same("cascade calm", CASC.calm, { alive: 6, per: 70 });
  same("cascade one dead", CASC.one, { alive: 5, per: 84, over: false });
  same("cascade two dead", CASC.two, { alive: 4, per: 105, over: true });
  same("cascade chain", CASC.chain, [
    { alive: 4, per: 105 },
    { alive: 3, per: 140 },
    { alive: 2, per: 210 },
    { alive: 1, per: 420 },
    { alive: 0 },
  ]);
  Object.assign(D1, { cascade, CASC });

  // ---------- 6. response times ----------
  const G25 = 0.75 * Math.sqrt(Math.PI); // gamma function at 2.5
  const gpdf = (u) => (u <= 0 ? 0 : (Math.pow(u, 1.5) * Math.exp(-u)) / G25); // density in units of 100 ms
  const STEP = 0.005;
  const cum = [0];
  for (let i = 1; i <= 6000; i++) cum.push(cum[i - 1] + ((gpdf((i - 1) * STEP) + gpdf(i * STEP)) / 2) * STEP);
  const quantile = (p) => {
    let [lo, hi] = [0, cum.length - 1];
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < p) lo = mid;
      else hi = mid;
    }
    const f = (p - cum[lo]) / (cum[hi] - cum[lo] || 1);
    return (lo + f) * STEP * 100;
  };
  const samples = Array.from({ length: 100 }, (_, i) => Math.round(quantile((i + 0.5) / 100)));
  const shuffled = (n, seed) => {
    const r = rng(seed);
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const PERF = { samples, order: shuffled(100, 11), mean: 250 };
  PERF.p50 = Math.round(quantile(0.5));
  PERF.p95 = Math.round(quantile(0.95));
  PERF.p99 = Math.round(quantile(0.99));
  PERF.aboveP95 = samples.filter((v) => v > PERF.p95).length;
  PERF.aboveP99 = samples.filter((v) => v > PERF.p99).length;
  PERF.max = samples[99];
  PERF.bin = 50;
  PERF.bins = Array.from({ length: 17 }, (_, b) => samples.filter((v) => Math.floor(v / 50) === b).length);
  same("response times p50 p95 p99", [PERF.p50, PERF.p95, PERF.p99], [218, 554, 754]);
  same("requests above p95 / p99, slowest", [PERF.aboveP95, PERF.aboveP99, PERF.max], [5, 1, 837]);
  close("sample mean is close to the true mean of 250 ms", samples.reduce((a, b) => a + b, 0) / 100, 250, 1);
  same(
    "the arrival order is a permutation",
    [...PERF.order].sort((a, b) => a - b).join(),
    samples.map((_, i) => i).join(),
  );
  same(
    "bins add up to 100 requests",
    PERF.bins.reduce((a, b) => a + b, 0),
    100,
  );
  Object.assign(D1, { quantile, PERF });

  // ---------- 7. fan-out ----------
  const USERS = ["Ana", "Ben", "Cat", "Dev", "Eli", "Fay"];
  const FOLLOWS = {
    Ana: ["Ben", "Cat", "Dev"],
    Ben: ["Ana", "Cat"],
    Cat: ["Ana", "Dev", "Eli", "Fay"],
    Dev: ["Cat"],
    Eli: ["Ana", "Cat"],
    Fay: ["Cat", "Ben"],
  };
  const followersOf = (u) => USERS.filter((x) => FOLLOWS[x].includes(u));
  const TWEET = { users: USERS, follows: FOLLOWS, followersOf };
  TWEET.cat = { followers: followersOf("Cat"), writes1: 1 };
  TWEET.cat.writes2 = TWEET.cat.followers.length;
  TWEET.ana = { followees: FOLLOWS.Ana, reads1: FOLLOWS.Ana.length, reads2: 1 };
  TWEET.load = { posts: 4600, reads: 300000, fan: 75 };
  TWEET.load.writes2 = TWEET.load.posts * TWEET.load.fan;
  TWEET.load.ratio = Math.round((TWEET.load.reads / TWEET.load.posts) * 10) / 10;
  TWEET.celeb = { followers: 30000000, target: 5 };
  TWEET.celeb.secs = Math.round(TWEET.celeb.followers / TWEET.load.writes2);
  same("Cat's followers", TWEET.cat.followers, ["Ana", "Ben", "Dev", "Eli", "Fay"]);
  same("writes per post (merge on read, fan-out on write)", [TWEET.cat.writes1, TWEET.cat.writes2], [1, 5]);
  same("Ana's reads (merge on read, fan-out on write)", [TWEET.ana.reads1, TWEET.ana.reads2], [3, 1]);
  same("fan-out writes per second, reads per post", [TWEET.load.writes2, TWEET.load.ratio], [345000, 65.2]);
  same("celebrity fan-out seconds", [TWEET.celeb.secs, TWEET.celeb.target], [87, 5]);
  D1.TWEET = TWEET;

  // ---------- 8. scale up or out ----------
  const costUp = (c) => (c > 32 ? Infinity : 1000 * Math.pow(c, 1.7));
  const costOut = (c) => 1000 * c * (c > 1 ? 1.1 : 1);
  const left = (c, dead) => Math.round(((c - dead) / c) * 100);
  const SCALE = { max: 32, need: 8, big: 40 };
  SCALE.up8 = Math.round(costUp(8));
  SCALE.out8 = Math.round(costOut(8));
  SCALE.up32 = Math.round(costUp(32));
  SCALE.out32 = Math.round(costOut(32));
  SCALE.up40 = costUp(40);
  SCALE.out40 = Math.round(costOut(40));
  SCALE.leftUp = 0;
  SCALE.leftOut = left(8, 1);
  same("cost at 8x (up, out)", [SCALE.up8, SCALE.out8], [34297, 8800]);
  same("cost at 32x (up, out)", [SCALE.up32, SCALE.out32], [362039, 35200]);
  same("cost at 40x (up, out)", [SCALE.up40, SCALE.out40], [Infinity, 44000]);
  same("capacity left after one machine dies (up, out)", [SCALE.leftUp, SCALE.leftOut], [0, 88]);
  Object.assign(D1, { costUp, costOut, left, SCALE });

  // ---------- 9. maintainability ----------
  const MAINT = {
    services: ["Web app", "Mobile API", "Reports", "Search", "Billing"],
    dbs: ["Users DB", "Orders DB", "Products DB", "Logs DB"],
    hot: 1,
  };
  MAINT.edges = MAINT.services.flatMap((_, s) => MAINT.dbs.map((__, d) => [s, d]));
  MAINT.direct = MAINT.edges.length;
  MAINT.layered = MAINT.services.length + MAINT.dbs.length;
  MAINT.editDirect = MAINT.edges.filter(([, d]) => d === MAINT.hot).length;
  MAINT.editLayer = 1;
  MAINT.big = { services: 8, dbs: 6, direct: 8 * 6, layered: 8 + 6 };
  same("connections without / with the layer", [MAINT.direct, MAINT.layered], [20, 9]);
  same("components to edit without / with the layer", [MAINT.editDirect, MAINT.editLayer], [5, 1]);
  same("bigger system without / with the layer", [MAINT.big.direct, MAINT.big.layered], [48, 14]);
  D1.MAINT = MAINT;
  D1.NEXT = "Next: Workshop 1.W";
})();
