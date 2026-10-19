/* Lecture 4 · Replication (Data Science, COM3021): the data and algorithms every scene of this video shares (pure, no DOM, no
   randomness). Everything hangs off VID.d4; scenes start with  const D4 = VID.d4;  Drawing helpers are in common-2.js (tags,
   packets, chips, wires, pictograms), common-3.js (the server node, the cluster rig, the timing lane). Every number below comes
   from running the rule when the page loads and is asserted against the storyboard (videos/_plan/ds-4.json): a wrong number
   throws an Error with a clear message. Scene captions may be built from these values (`${D4.FAIL.lose.B}`), never typed.

   NODE KEYS.  "L" = the leader, "A", "B", "C" = followers (names on screen: "Leader", "Follower A" ...). Time is in TICKS or
   MS exactly as stated per section; a scene maps its own seconds onto them.

   1. SCALE (scene 2, lesson 4.1).  600 requests a second arrive; one big machine of 600, or three of 200 (same total).
        D4.SCALE = {load: 600, unit: 100, discs: 6 (one disc = 100 req/s),
                    up:  {caps: [600], crash: [0], before: 600, after: 0, away: 600},
                    out: {caps: [200, 200, 200], crash: [0], before: 600, after: 400, away: 200}}
        D4.SCALE.slots(row) -> for disc j = 0..5: {m: machine index, s: slot index in that machine, lost: true if that machine
            crashed}.  up: m 0 for all six (s = j);  out: m = floor(j / 2), s = j % 2; lost for m 0 only after the crash.
        D4.servedOf(load, caps, deadIdx[]) -> req/s served (the smaller of the load and what the live machines can do)
   2. COPY (scene 3, lesson 4.1).  Three records A B C on three nodes (index 0, 1, 2); node 1 (the middle one) fails.
        D4.COPY = {records: ["A","B","C"], replica: [["A","B","C"] x3], part: [["A"],["B"],["C"]], down: 1,
                   holders(layout, rec, down?) -> how many live nodes hold rec (down = failed node index or -1),
                   held: {replica: {before: 3, after: 2}, part: {before: 1, after: 0}}}   (how many nodes hold record "B")
   3. LOG (scene 4, lesson 4.2).  A client changes a profile picture three times; entry #n is stored by the leader at tick n; a
        follower with lag g applies it at tick n + g, always in log order.
        D4.LOG = {writes: ["pic 1","pic 2","pic 3"], lag: {L: 0, A: 1, B: 2},
                  applied(node, tick) -> entries applied by then (0..3),  value(node, tick) -> "none" | "pic n",
                  events: [{node, n, tick}] every application, sorted by tick then node (L first): L1 at 1, L2 at 2, L3 at 3,
                          A1 at 2, A2 at 3, A3 at 4, B1 at 3, B2 at 4, B3 at 5,
                  order: {A: [1,2,3], B: [1,2,3]} (the same order everywhere), end: "pic 3"}
   4. SYNC (scene 5, lesson 4.3).  The leader takes 5 ms; followers confirm 30 ms and 90 ms after that. Times are ms since the
        write reached the leader.
        D4.SYNC = {local: 5, lat: {A: 30, B: 90}, arrive: {L: 5, A: 35, B: 95},      (when each node holds the write)
                   holds(ms) -> {L, A, B} booleans,
                   modes: [{key: "async", name: "Asynchronous", waits: "none", ack: 5,  holds, copies: 1, left: 0, lost: true},
                           {key: "semi",  name: "Semi-synchronous", waits: "one", ack: 35, holds, copies: 2, left: 1, lost: false},
                           {key: "sync",  name: "Synchronous", waits: "all", ack: 95, holds, copies: 3, left: 2, lost: false}]}
        ack = when the client is told "done"; holds = who has the write at that moment; copies = how many nodes hold it then;
        left = copies still alive if the leader crashes right after answering; lost = no copy left.
   5. JOIN (scene 6, lesson 4.4).  New follower F3. Tick 0: snapshot of the leader, which holds #1..#5. The leader then stores
        #6 at tick 1, #7 at tick 2, #8 at tick 4. The snapshot reaches F3 at tick 2.5; F3 then asks for everything after #5 and
        applies one entry per tick: #n at tick 2.5 + (n - 5).
        D4.JOIN = {snap: 5, writes: {6: 1, 7: 2, 8: 4}, copyDone: 2.5, applyAt: {6: 3.5, 7: 4.5, 8: 5.5}, caughtAt: 5.5,
                   leaderAt(tick) -> entries on the leader (5, 6, 7 or 8),  f3At(tick) -> entries on F3 (0, then 5, 6, 7, 8),
                   backlog: [6, 7, 8] (what F3 must ask for), during: [6, 7] (stored while the snapshot was being copied),
                   events: [{tick, kind: "snap"|"store"|"copy"|"apply", n}] sorted by tick}
   6. FAIL (scene 7, lesson 4.4).  The leader wrote 20 changes (entry n at tick n) then crashed at tick 20; follower X applies n
        at tick n + delay.
        D4.FAIL = {wrote: 20, crash: 20, delay: {A: 5, B: 2, C: 4}, at: {A: 15, B: 18, C: 16}, lose: {A: 5, B: 2, C: 4},
                   best: "B", lost: [19, 20], missing(k) -> entries follower k lacks, e.g. missing("A") = [16..20]}
        (promote the follower at #18 and #19, #20 are lost; promote A at #15 and five are)
   7. SPLIT (scene 8, lesson 4.4).  Nodes A (leader), B, C. A is cut off but alive; B is promoted; a client writes seat 12 = Ann to
        A and another writes seat 12 = Bo to B; then the network heals.
        D4.SPLIT = {nodes: ["A","B","C"], leader0: "A", promoted: "B", seat: 12, writes: {A: "Ann", B: "Bo"}, leaders: ["A","B"],
                    conflict: true, after: {A: "Ann", B: "Bo", C: "Bo"}}   (C follows B; two histories for one seat)
   8. LAG and BACK (scenes 9 and 10, lesson 4.5).  A counter on the leader and two followers; a write at time w reaches a node
        with lag g at time w + g.
        D4.countAt({base, writes: [w...], lag: {L, A, B}}, node, t) -> the count that node shows at time t
        D4.LAG  = {base: 3, writes: [0], lag: {L: 0, A: 1, B: 4}, at: 2,                  (comments; you post one at time 0)
                   show: {L: 4, A: 4, B: 3}, stale: "B", own: "L"}   (reload at time 2: B still says 3; the leader says 4)
        D4.BACK = {base: 6, writes: [0, 3], lag: {L: 0, A: 1, B: 4},                       (likes)
                   state: {L: 7, A: 7, B: 6} (time 2.5, the start of the scene),
                   bad: [{node: "A", t: 2, seen: 7}, {node: "B", t: 2.5, seen: 6}], back: true,
                   pinned: [{node: "A", t: 2, seen: 7}, {node: "A", t: 4.5, seen: 8}], forward: true}
   SMALL TOOLS.  D4.rng(seed) -> () => 0..1 (mulberry32, the only randomness allowed); D4.range(a, b) -> [a..b];
        D4.same(what, got, want) / D4.close(what, got, want, tol) throw when a number differs from the storyboard. */
(function () {
  const V = window.VID;
  const D4 = (V.d4 = V.d4 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d4: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.d4: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  const sum = (xs) => xs.reduce((s, x) => s + x, 0);
  Object.assign(D4, { same, close, rng, range });

  // ---------- 1. scale up or out ----------
  const servedOf = (load, caps, dead = []) => Math.min(load, sum(caps.map((c, i) => (dead.includes(i) ? 0 : c))));
  const SCALE = (() => {
    const load = 600;
    const unit = 100;
    const discs = load / unit;
    const row = (caps, crash) => {
      const before = servedOf(load, caps);
      const after = servedOf(load, caps, crash);
      // disc j goes to the first machine with a free slot (a slot takes one disc of `unit` req/s)
      const owner = caps.flatMap((c, m) => Array.from({ length: c / unit }, (_, s) => ({ m, s })));
      const slots = () => owner.slice(0, discs).map((o) => ({ ...o, lost: crash.includes(o.m) }));
      return { caps, crash, before, after, away: load - after, slots };
    };
    const up = row([600], [0]);
    const out = row([200, 200, 200], [0]);
    return { load, unit, discs, up, out, slots: (r) => r.slots() };
  })();
  D4.servedOf = servedOf;
  D4.SCALE = SCALE;
  same(
    "scale: served before and after the crash, up then out",
    [SCALE.up.before, SCALE.up.after, SCALE.up.away, SCALE.out.before, SCALE.out.after, SCALE.out.away],
    [600, 0, 600, 600, 400, 200],
  );
  same(
    "scale: where the six 100 req/s discs sit (big, then small machines)",
    [SCALE.slots(SCALE.up).map((d) => d.m), SCALE.slots(SCALE.out).map((d) => d.m)],
    [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 2, 2],
    ],
  );
  same(
    "scale: discs lost with the crashed machine",
    [SCALE.slots(SCALE.up).filter((d) => d.lost).length, SCALE.slots(SCALE.out).filter((d) => d.lost).length],
    [6, 2],
  );

  // ---------- 2. copies on every node ----------
  const COPY = (() => {
    const records = ["A", "B", "C"];
    const replica = [0, 1, 2].map(() => records.slice());
    const part = records.map((r) => [r]);
    const holders = (layout, rec, down = -1) => layout.filter((recs, i) => i !== down && recs.includes(rec)).length;
    const down = 1;
    const held = (layout) => ({ before: holders(layout, "B"), after: holders(layout, "B", down) });
    return { records, replica, part, down, holders, held: { replica: held(replica), part: held(part) } };
  })();
  D4.COPY = COPY;
  same(
    "copy: how many nodes hold record B before and after node 1 fails (replica, then partitions)",
    [COPY.held.replica.before, COPY.held.replica.after, COPY.held.part.before, COPY.held.part.after],
    [3, 2, 1, 0],
  );

  // ---------- 3. the replication log ----------
  const LOG = (() => {
    const writes = ["pic 1", "pic 2", "pic 3"];
    const lag = { L: 0, A: 1, B: 2 };
    const applied = (node, tick) => Math.max(0, Math.min(writes.length, Math.floor(tick - lag[node])));
    const value = (node, tick) => (applied(node, tick) ? writes[applied(node, tick) - 1] : "none");
    const events = Object.keys(lag)
      .flatMap((node) => writes.map((_, i) => ({ node, n: i + 1, tick: i + 1 + lag[node] })))
      .sort((p, q) => p.tick - q.tick || p.node.localeCompare(q.node));
    const order = Object.fromEntries(["A", "B"].map((k) => [k, events.filter((e) => e.node === k).map((e) => e.n)]));
    return { writes, lag, applied, value, events, order, end: value("B", 99) };
  })();
  D4.LOG = LOG;
  same(
    "log: every follower applies #1 #2 #3 in the same order, and ends on pic 3",
    [LOG.order, LOG.end, LOG.value("L", 3), LOG.value("A", 2), LOG.value("B", 2), LOG.value("A", 0.5)],
    [{ A: [1, 2, 3], B: [1, 2, 3] }, "pic 3", "pic 3", "pic 1", "none", "none"],
  );
  same(
    "log: event ticks (L, A, B)",
    [1, 2, 3].map((n) => ["L", "A", "B"].map((k) => LOG.events.find((e) => e.node === k && e.n === n).tick)),
    [
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ],
  );

  // ---------- 4. synchronous, asynchronous, semi-synchronous ----------
  const SYNC = (() => {
    const local = 5;
    const lat = { A: 30, B: 90 };
    const arrive = { L: local, A: local + lat.A, B: local + lat.B };
    const holds = (ms) => ({ L: ms >= arrive.L, A: ms >= arrive.A, B: ms >= arrive.B });
    const mode = (key, name, waits, ack) => {
      const h = holds(ack);
      const copies = Object.values(h).filter(Boolean).length;
      return { key, name, waits, ack, holds: h, copies, left: copies - 1, lost: copies - 1 === 0 };
    };
    const modes = [
      mode("async", "Asynchronous", "none", arrive.L),
      mode("semi", "Semi-synchronous", "one", arrive.A),
      mode("sync", "Synchronous", "all", Math.max(arrive.A, arrive.B)),
    ];
    return { local, lat, arrive, holds, modes };
  })();
  D4.SYNC = SYNC;
  same(
    "sync: the client is told done at 5, 35 and 95 ms",
    SYNC.modes.map((m) => m.ack),
    [5, 35, 95],
  );
  same(
    "sync: copies when told done, copies left after a leader crash, lost",
    [SYNC.modes.map((m) => m.copies), SYNC.modes.map((m) => m.left), SYNC.modes.map((m) => m.lost)],
    [
      [1, 2, 3],
      [0, 1, 2],
      [true, false, false],
    ],
  );

  // ---------- 5. a new follower: snapshot, then catch up ----------
  const JOIN = (() => {
    const snap = 5;
    const writes = { 6: 1, 7: 2, 8: 4 };
    const copyDone = 2.5;
    const applyAt = Object.fromEntries(Object.keys(writes).map((n) => [n, copyDone + (+n - snap)]));
    const leaderAt = (tick) => snap + Object.values(writes).filter((w) => w <= tick).length;
    const f3At = (tick) => (tick < copyDone ? 0 : snap + Object.values(applyAt).filter((a) => a <= tick).length);
    const caughtAt = applyAt[8];
    const events = [
      { tick: 0, kind: "snap", n: snap },
      ...Object.entries(writes).map(([n, tick]) => ({ tick, kind: "store", n: +n })),
      { tick: copyDone, kind: "copy", n: snap },
      ...Object.entries(applyAt).map(([n, tick]) => ({ tick, kind: "apply", n: +n })),
    ].sort((p, q) => p.tick - q.tick);
    const backlog = Object.keys(writes).map(Number);
    const during = backlog.filter((n) => writes[n] <= copyDone);
    return { snap, writes, copyDone, applyAt, caughtAt, leaderAt, f3At, backlog, during, events };
  })();
  D4.JOIN = JOIN;
  same(
    "join: leader entries at ticks 0, 2.4, 4, 5.5 and F3 entries at 2.4, 2.5, 3.5, 5.5",
    [[0, 2.4, 4, 5.5].map(JOIN.leaderAt), [2.4, 2.5, 3.5, 5.5].map(JOIN.f3At)],
    [
      [5, 7, 8, 8],
      [0, 5, 6, 8],
    ],
  );
  same(
    "join: backlog, entries stored while copying, when F3 has caught up",
    [JOIN.backlog, JOIN.during, JOIN.caughtAt, JOIN.applyAt],
    [[6, 7, 8], [6, 7], 5.5, { 6: 3.5, 7: 4.5, 8: 5.5 }],
  );

  // ---------- 6. the leader fails: who gets promoted ----------
  const FAIL = (() => {
    const wrote = 20;
    const crash = 20;
    const delay = { A: 5, B: 2, C: 4 };
    const at = Object.fromEntries(
      Object.entries(delay).map(([k, d]) => [k, Math.max(0, Math.min(wrote, Math.floor(crash - d)))]),
    );
    const lose = Object.fromEntries(Object.entries(at).map(([k, v]) => [k, wrote - v]));
    const best = Object.keys(at).reduce((a, b) => (at[b] > at[a] ? b : a));
    const missing = (k) => range(at[k] + 1, wrote);
    return { wrote, crash, delay, at, lose, best, lost: missing(best), missing };
  })();
  D4.FAIL = FAIL;
  same("fail: entries each follower has applied when the leader crashes", FAIL.at, { A: 15, B: 18, C: 16 });
  same(
    "fail: changes lost if you promote A, B, C; the best choice; what is lost",
    [FAIL.lose, FAIL.best, FAIL.lost],
    [{ A: 5, B: 2, C: 4 }, "B", [19, 20]],
  );
  same("fail: what follower A lacks", FAIL.missing("A"), [16, 17, 18, 19, 20]);

  // ---------- 7. split brain ----------
  const SPLIT = (() => {
    const nodes = ["A", "B", "C"];
    const writes = { A: "Ann", B: "Bo" };
    // after the repair: A still has what it took, B and C (C follows its new leader B) have Bo
    const after = { A: writes.A, B: writes.B, C: writes.B };
    const leaders = ["A", "B"].filter((k) => writes[k] !== undefined);
    return {
      nodes,
      leader0: "A",
      promoted: "B",
      seat: 12,
      writes,
      leaders,
      conflict: new Set(Object.values(after)).size > 1,
      after,
    };
  })();
  D4.SPLIT = SPLIT;
  same(
    "split: two leaders took different writes for one seat",
    [SPLIT.leaders, SPLIT.conflict, SPLIT.after],
    [["A", "B"], true, { A: "Ann", B: "Bo", C: "Bo" }],
  );

  // ---------- 8. replication lag: stale reads, backwards reads ----------
  const countAt = (m, node, t) => m.base + m.writes.filter((w) => w + (m.lag[node] || 0) <= t).length;
  D4.countAt = countAt;
  const LAG = { base: 3, writes: [0], lag: { L: 0, A: 1, B: 4 }, at: 2 };
  LAG.show = Object.fromEntries(["L", "A", "B"].map((k) => [k, countAt(LAG, k, LAG.at)]));
  LAG.stale = Object.keys(LAG.show).find((k) => LAG.show[k] < LAG.show.L);
  LAG.own = "L";
  D4.LAG = LAG;
  same(
    "lag: the count each node shows when you reload at time 2, and the stale one",
    [LAG.show, LAG.stale],
    [{ L: 4, A: 4, B: 3 }, "B"],
  );

  const BACK = { base: 6, writes: [0, 3], lag: { L: 0, A: 1, B: 4 } };
  BACK.state = Object.fromEntries(["L", "A", "B"].map((k) => [k, countAt(BACK, k, 2.5)]));
  const read = (node, t) => ({ node, t, seen: countAt(BACK, node, t) });
  BACK.bad = [read("A", 2), read("B", 2.5)];
  BACK.back = BACK.bad[1].seen < BACK.bad[0].seen;
  BACK.pinned = [read("A", 2), read("A", 4.5)];
  BACK.forward = BACK.pinned[1].seen >= BACK.pinned[0].seen;
  D4.BACK = BACK;
  same(
    "back: state at the start, the two reads that go backwards, the pinned reads",
    [BACK.state, BACK.bad.map((r) => r.seen), BACK.back, BACK.pinned.map((r) => r.seen), BACK.forward],
    [{ L: 7, A: 7, B: 6 }, [7, 6], true, [7, 8], true],
  );
})();
