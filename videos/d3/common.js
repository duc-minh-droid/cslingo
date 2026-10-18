/* Lecture 3 · Storage and retrieval: the data and algorithms every scene of this video shares (pure, no DOM, no randomness).
   Everything hangs off VID.d3; scenes start with  const D3 = VID.d3;  Drawing helpers: common-2.js (stickers, icons, the movable
   pointer), common-3.js (record lists, map entries, panels), common-4.js (the merge rig and the memtable tree). Every number below
   comes from running the real algorithm when the page loads and is asserted against the storyboard (videos/_plan/ds-3.json): a
   wrong number throws an Error with a clear message.

   RECORDS.  A record is {k: "mew", v: 3} (a key and a value) or {k: "kiwi", tomb: true} (a TOMBSTONE: the delete marker). A log
   line is "key,value" plus a newline, so D3.size(rec) = bytes of that line (a tombstone line is as long as a one-digit value).
     D3.size(rec) -> bytes       D3.offsets(recs) -> byte offset of every record (cumulative sizes, the first is 0)
     D3.same(what, got, want) / D3.close(what, got, want, tol) throw when a number differs from the storyboard.
     D3.hash(key) -> 32-bit FNV-1a hash of the key (unsigned)

   1. TWO WORKLOADS (scene 2).   D3.LOAD = {txn: {writes: 9}, ana: {cols: 4, rows: 6, cells: 24, answer: 1}}
        transactional = many small writes (9 packets, nothing is read back); analytics = one big read (24 table cells scanned for 1 answer).
   2. THE SIMPLEST DATABASE (scenes 3 and 4): a log file. set appends one line (1 step); get scans EVERY line from the top
      because the LAST line for the key wins; delete appends a tombstone. The bike-share example of lesson 3.1.
        D3.runLog(ops) -> {lines, steps}      ops: {op: "set", k, v} | {op: "get", k} | {op: "del", k}
            steps[i] for set/del = {op, cost: 1, line (index of the appended line)}
            steps[i] for get     = {op, scanned (lines read = all of them), hits (indices of lines for that key), win (index of the last
                                    hit, or -1), value (number, or null), deleted (true when the winning line is a tombstone)}
        D3.LOG = {lines: [bike 1, dock 2, bike 3, dock TOMB], steps: [set bike 1, set dock 2, set bike 3, get bike, del dock, get dock],
                  getBike: {scanned: 3, hits: [0, 2], win: 2, value: 3}, getDock: {scanned: 4, hits: [1, 3], win: 3, deleted: true}}
        D3.COST = {write: 1, first: {n: 8, scan: 8}, second: {n: 16, scan: 16}, ratio: 2}   a write costs 1 step; the scan of 8
            lines is 8 steps, of 16 lines 16 steps (the match is the last line, so the scan cannot stop early).
   3. THE HASH INDEX (scene 5): the cat-video play counts of lesson 3.2, one record per play. D3.PLAYS = the 12 records in write order
      [mew 1, mew 2, purr 1, yawn 1, mew 3, purr 2, mew 4, yawn 2, mew 5, purr 3, mew 6, purr 4] (the value counts plays of that key).
        D3.hashIndex(recs) -> {key: {i, off}}   the in-memory map: every key points at its LATEST record (index i, byte offset off)
        D3.HASH = {recs: PLAYS[0..8] (the nine lines on disk), offs: [0, 6, 12, 19, 26, 32, 39, 45, 52] (each line's byte offset),
                   bytes: 58 (file size), map: {mew: {i: 8, off: 52}, purr: {i: 5, off: 32}, yawn: {i: 7, off: 45}},
                   trail: [{i, k, off}] x 9 (the map entry each append sets, in order: lets a scene show the map being kept up to date),
                   get: {k: "mew", off: 52, value: 5, reads: 1, scan: 9}   one jump instead of reading all 9 lines,
                   write: {rec: purr 3, off: 58, mapAfter: {mew 52, purr 58, yawn 45}}   a new append moves purr's pointer from 32 to 58,
                   get2: {k: "purr", off: 58, value: 3, reads: 1}}
   4. SEGMENTS AND COMPACTION (scene 6): D3.SEG
        D3.segment(recs, limit) -> segments   a file is closed when it holds `limit` records; the next write opens a new one
        D3.compact(segments) -> {before, after, keep, drop, out}   keep the LATEST record of every key: keep = indices (in the flat
            oldest-to-newest list) of the survivors, drop = the rest, out = the survivors as records in log order
        D3.SEG = {limit: 6, segs: [[mew 1, mew 2, purr 1, yawn 1, mew 3, purr 2], [mew 4, yawn 2, mew 5, purr 3, mew 6, purr 4]],
                  flat: PLAYS (12), before: 12, after: 3, keep: [7, 10, 11], drop: [0, 1, 2, 3, 4, 5, 6, 8, 9],
                  out: [yawn 2, mew 6, purr 4], next: 2 (the index of the segment that opens when the last one is full)}
   5. TWO LIMITS OF THE HASH INDEX (scene 7): D3.LIM
        D3.LIM.ram = {slots: 6, keys: 12, fit: 6, over: 6}   the map must fit in memory: 12 keys do not fit 6 slots
        D3.LIM.range = {keys: [kitty1 ... kitty6], from: "kitty2", to: "kitty5", want: [kitty2 ... kitty5], lookups: 4,
            table: 8 buckets as a list [null, "kitty3", "kitty6", "kitty1", "kitty4", null, "kitty2", "kitty5"] (bucket = FNV-1a hash
            mod 8, the next free bucket on a clash), bucketOf: {kitty1: 3, kitty2: 6, kitty3: 1, kitty4: 4, kitty5: 7, kitty6: 2},
            wantBuckets: [6, 1, 4, 7] (not in key order, not side by side: the map has no order), sorted: kitty1 ... kitty6,
            wantAt: [1, 2, 3, 4] (the wanted keys sit side by side in the sorted list)}
   6. MERGING SORTED SEGMENTS (scene 8): lesson 3.3 "Watch a merge". D3.MERGE
        D3.mergeSegments(segs) -> {frames, out, stepOf}   segs oldest first, each sorted by key (null value = tombstone).
            One frame per output key: {step, heads: [index of each segment's head record, or -1 when it is used up], key (the smallest
            key under the pointers), who (segments holding that key under their pointer), win (the newest of them), rec (its record),
            tomb (the winner is a tombstone: nothing is written), drop ([[segment, index] of every losing copy]), take ([segment,
            index] of the winner), outIndex (slot in the output, -1 for a tombstone)}.  stepOf[s][i] = the frame that uses record i of
            segment s;  out = the merged records.
        D3.MERGE = {segs: [[apple 1, fig 2, mango 3, plum 4], [apple 5, kiwi 6, mango 7], [fig 8, kiwi TOMB, plum 9]], frames (5),
                    out: [apple 5, fig 8, mango 7, plum 9], keys: apple fig kiwi mango plum, tombSteps: [2]}
            step 0 apple (segments 1 and 2): segment 2 wins (5), the 1 is dropped;  step 1 fig (1 and 3): segment 3 wins (8);
            step 2 kiwi (2 and 3): the newest is the TOMBSTONE, so kiwi is written nowhere;  step 3 mango (1 and 2): 7 wins;
            step 4 plum (1 and 3): 9 wins.   10 records in, 4 out.
   7. THE SPARSE INDEX (scene 9): a sorted segment of 12 keys in 3 blocks of 4. D3.SPARSE
        D3.sparseFind(seg, index, key) -> {via, reads, hit}   the largest indexed key <= key, then read forward from there
        D3.SPARSE = {recs: 12 records (hand, handbag, handful, handle, handsome, handy, hang, hangar, hanger, happen, happy, harbour;
                     the value is the record number 1..12), block: 4, offs (byte offsets), index: [{key: "hand", i: 0, off: 0},
                     {key: "handsome", i: 4, off}, {key: "hanger", i: 8, off}], entries: 3 (of 12 keys),
                     find: {key: "handbag", via: "hand", viaI: 0, reads: [0, 1] (indices read: 2 records), hit: 1},
                     range: {from: "handbag", to: "handy", via: "hand", hits: [1, 2, 3, 4, 5], scanned: [0 .. 6], jumps: 1}}
   8. THE MEMTABLE (scene 10): lesson 3.3 "The write path" and "The read path". D3.MEM
        D3.MEM = {old: D3.MERGE.out (the one merged segment on disk: apple 5, fig 8, mango 7, plum 9), limit: 5,
                  writes: [kiwi 10, fig 11, plum 12, apple 13, grape 14] (arrive in this random order),
                  nodes: the memtable tree, one per write in insertion order: {k, v, parent (node index or -1), side: "L" | "R" | "",
                         depth (0 = root), rank (0-based position in sorted order), route (node indices from the root down to it)}:
                         kiwi root (rank 3), fig left of kiwi (rank 1), plum right of kiwi (rank 4), apple left of fig (rank 0),
                         grape right of fig (rank 2); height 3,
                  walk: node indices in sorted order [3, 1, 4, 0, 2] (apple, fig, grape, kiwi, plum),
                  flushed: [apple 13, fig 11, grape 14, kiwi 10, plum 12] (the new SSTable, the newest segment),
                  next: date 15 (the write that lands in the fresh memtable while the flush happens),
                  getFig: {k: "fig", checks: 2, path: [memtable miss, newest segment hit], value: 11}   newest copy wins, 8 is never read,
                  getMango: {k: "mango", checks: 3, path: [memtable miss, newest segment miss, older segment hit], value: 7}}
        D3.readPath(key, memtable, segments) -> {k, path: [{where, hit}], checks, value}   memory first, then newest to oldest, stop at the hit
        D3.buildTree(writes) -> nodes (the layout above)

   SMALL TOOLS.  D3.rng(seed) -> () => 0..1 (mulberry32, seeded: the only randomness allowed). */
(function () {
  const V = window.VID;
  const D3 = (V.d3 = V.d3 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d3: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.d3: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hash = (s) => {
    let h = 0x811c9dc5;
    for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    return h >>> 0;
  };
  const rec = (k, v) => (v === null ? { k, tomb: true } : { k, v });
  const recs = (list) => list.map(([k, v]) => rec(k, v));
  const size = (r) => r.k.length + 1 + (r.tomb ? 1 : String(r.v).length) + 1;
  const offsets = (list) => {
    let at = 0;
    return list.map((r) => {
      const o = at;
      at += size(r);
      return o;
    });
  };
  Object.assign(D3, { same, close, rng, hash, size, offsets });

  // ---------- 1. two workloads ----------
  D3.LOAD = { txn: { writes: 9 }, ana: { cols: 4, rows: 6, cells: 24, answer: 1 } };
  same("workload: analytics cells", D3.LOAD.ana.cols * D3.LOAD.ana.rows, D3.LOAD.ana.cells);

  // ---------- 2. the log ----------
  const scan = (lines, k) => {
    const hits = [];
    lines.forEach((r, i) => r.k === k && hits.push(i)); // every line is read: the LAST one for the key wins
    return { scanned: lines.length, hits, win: hits.length ? hits[hits.length - 1] : -1 };
  };
  function runLog(ops) {
    const lines = [];
    const steps = ops.map((op) => {
      if (op.op === "get") {
        const s = scan(lines, op.k);
        const r = lines[s.win];
        return { op, ...s, value: r && !r.tomb ? r.v : null, deleted: !!(r && r.tomb) };
      }
      lines.push(op.op === "del" ? rec(op.k, null) : rec(op.k, op.v));
      return { op, cost: 1, line: lines.length - 1 };
    });
    return { lines, steps };
  }
  D3.runLog = runLog;
  const logRun = runLog([
    { op: "set", k: "bike", v: 1 },
    { op: "set", k: "dock", v: 2 },
    { op: "set", k: "bike", v: 3 },
    { op: "get", k: "bike" },
    { op: "del", k: "dock" },
    { op: "get", k: "dock" },
  ]);
  D3.LOG = { ...logRun, getBike: logRun.steps[3], getDock: logRun.steps[5] };
  same("log: final lines", D3.LOG.lines, [
    { k: "bike", v: 1 },
    { k: "dock", v: 2 },
    { k: "bike", v: 3 },
    { k: "dock", tomb: true },
  ]);
  const gb = D3.LOG.getBike;
  same("log: get bike", [gb.scanned, gb.hits, gb.win, gb.value], [3, [0, 2], 2, 3]);
  const gd = D3.LOG.getDock;
  same("log: get dock", [gd.scanned, gd.hits, gd.win, gd.deleted], [4, [1, 3], 3, true]);
  same("log: a set costs one step", [logRun.steps[0].cost, logRun.steps[4].cost], [1, 1]);

  const costLog = (n) =>
    Array.from({ length: n }, (_, i) => rec(i === n - 1 ? "bike" : ["dock", "helmet"][i % 2], i + 1));
  const [c1, c2] = [scan(costLog(8), "bike"), scan(costLog(16), "bike")];
  D3.COST = {
    write: 1,
    first: { n: 8, scan: c1.scanned },
    second: { n: 16, scan: c2.scanned },
    ratio: c2.scanned / c1.scanned,
  };
  same("cost: scanning n lines takes n steps", [D3.COST.first.scan, D3.COST.second.scan, D3.COST.ratio], [8, 16, 2]);
  same("cost: the match is the last line, so the scan cannot stop early", [c1.win, c2.win], [7, 15]);

  // ---------- 3. the hash index ----------
  const PLAY_KEYS = ["mew", "mew", "purr", "yawn", "mew", "purr", "mew", "yawn", "mew", "purr", "mew", "purr"];
  const counts = {};
  D3.PLAYS = PLAY_KEYS.map((k) => rec(k, (counts[k] = (counts[k] || 0) + 1)));
  same(
    "plays: the twelve records",
    D3.PLAYS.map((r) => `${r.k} ${r.v}`),
    ["mew 1", "mew 2", "purr 1", "yawn 1", "mew 3", "purr 2", "mew 4", "yawn 2", "mew 5", "purr 3", "mew 6", "purr 4"],
  );
  function hashIndex(list) {
    const offs = offsets(list);
    const map = {};
    list.forEach((r, i) => (map[r.k] = { i, off: offs[i] })); // an append updates the key's entry: the latest record wins
    return map;
  }
  D3.hashIndex = hashIndex;
  const hRecs = D3.PLAYS.slice(0, 9);
  const hOffs = offsets(hRecs);
  const hMap = hashIndex(hRecs);
  const hNew = D3.PLAYS[9];
  const hOff2 = offsets(D3.PLAYS.slice(0, 10))[9];
  const hMap2 = hashIndex(D3.PLAYS.slice(0, 10));
  D3.HASH = {
    recs: hRecs,
    offs: hOffs,
    bytes: hOffs[8] + size(hRecs[8]),
    map: hMap,
    trail: hRecs.map((r, i) => ({ i, k: r.k, off: hOffs[i] })),
    get: { k: "mew", off: hMap.mew.off, value: hRecs[hMap.mew.i].v, reads: 1, scan: scan(hRecs, "mew").scanned },
    write: { rec: hNew, off: hOff2, mapAfter: Object.fromEntries(Object.entries(hMap2).map(([k, e]) => [k, e.off])) },
    get2: { k: "purr", off: hMap2.purr.off, value: D3.PLAYS[hMap2.purr.i].v, reads: 1 },
  };
  same("hash: byte offsets of the nine lines", D3.HASH.offs, [0, 6, 12, 19, 26, 32, 39, 45, 52]);
  same("hash: file size", D3.HASH.bytes, 58);
  same("hash: the map after nine appends", D3.HASH.map, {
    mew: { i: 8, off: 52 },
    purr: { i: 5, off: 32 },
    yawn: { i: 7, off: 45 },
  });
  same("hash: get mew", [D3.HASH.get.off, D3.HASH.get.value, D3.HASH.get.reads, D3.HASH.get.scan], [52, 5, 1, 9]);
  same("hash: the new write", [D3.HASH.write.rec, D3.HASH.write.off], [{ k: "purr", v: 3 }, 58]);
  same("hash: the map after the write", D3.HASH.write.mapAfter, { mew: 52, purr: 58, yawn: 45 });
  same("hash: get purr", [D3.HASH.get2.off, D3.HASH.get2.value], [58, 3]);

  // ---------- 4. segments and compaction ----------
  const segment = (list, limit) => {
    const segs = [[]];
    list.forEach((r) => {
      if (segs[segs.length - 1].length >= limit) segs.push([]);
      segs[segs.length - 1].push(r);
    });
    return segs;
  };
  const compact = (segs) => {
    const flat = segs.flat();
    const latest = new Map();
    flat.forEach((r, i) => latest.set(r.k, i)); // the last record of a key wins
    const keep = [...latest.values()].sort((a, b) => a - b);
    const drop = flat.map((_, i) => i).filter((i) => !keep.includes(i));
    return { before: flat.length, after: keep.length, keep, drop, out: keep.map((i) => flat[i]) };
  };
  Object.assign(D3, { segment, compact });
  const sSegs = segment(D3.PLAYS, 6);
  const sCom = compact(sSegs);
  D3.SEG = { limit: 6, segs: sSegs, flat: D3.PLAYS, ...sCom, next: sSegs.length };
  same(
    "segments: sizes",
    D3.SEG.segs.map((s) => s.length),
    [6, 6],
  );
  same("segments: the next one opens at", D3.SEG.next, 2);
  same("compaction: 12 records become 3", [D3.SEG.before, D3.SEG.after], [12, 3]);
  same(
    "compaction: survivors",
    [D3.SEG.keep, D3.SEG.drop],
    [
      [7, 10, 11],
      [0, 1, 2, 3, 4, 5, 6, 8, 9],
    ],
  );
  same(
    "compaction: output",
    D3.SEG.out.map((r) => `${r.k} ${r.v}`),
    ["yawn 2", "mew 6", "purr 4"],
  );

  // ---------- 5. two limits of the hash index ----------
  const KITTIES = [1, 2, 3, 4, 5, 6].map((i) => `kitty${i}`);
  const BUCKETS = 8;
  const table = Array(BUCKETS).fill(null);
  const bucketOf = {};
  KITTIES.forEach((k) => {
    let b = hash(k) % BUCKETS;
    while (table[b]) b = (b + 1) % BUCKETS; // the next free bucket on a clash
    table[b] = k;
    bucketOf[k] = b;
  });
  const want = KITTIES.filter((k) => k >= "kitty2" && k <= "kitty5");
  D3.LIM = {
    ram: { slots: 6, keys: 12, fit: 6, over: 6 },
    range: {
      keys: KITTIES,
      from: "kitty2",
      to: "kitty5",
      want,
      lookups: want.length,
      table,
      bucketOf,
      wantBuckets: want.map((k) => bucketOf[k]),
      sorted: [...KITTIES].sort(),
      wantAt: want.map((k) => KITTIES.indexOf(k)),
    },
  };
  same("limit: twelve keys, six slots", [D3.LIM.ram.keys - D3.LIM.ram.slots, D3.LIM.ram.over], [6, 6]);
  same("limit: the bucket table", D3.LIM.range.table, [
    null,
    "kitty3",
    "kitty6",
    "kitty1",
    "kitty4",
    null,
    "kitty2",
    "kitty5",
  ]);
  same("limit: buckets of the wanted keys", D3.LIM.range.wantBuckets, [6, 1, 4, 7]);
  same("limit: four lookups", D3.LIM.range.lookups, 4);
  const wb = D3.LIM.range.wantBuckets;
  if (wb.every((b, i) => i === 0 || b > wb[i - 1]) || wb.every((b, i) => i === 0 || b === wb[i - 1] + 1))
    throw new Error("VID.d3: the wanted keys must NOT sit in key order in the hash table");
  same("limit: the wanted keys are side by side when sorted", D3.LIM.range.wantAt, [1, 2, 3, 4]);

  // ---------- 6. merging sorted segments ----------
  function mergeSegments(segs) {
    const p = segs.map(() => 0);
    const frames = [];
    const stepOf = segs.map((s) => s.map(() => -1));
    let outN = 0;
    while (p.some((x, s) => x < segs[s].length)) {
      const heads = p.map((x, s) => (x < segs[s].length ? x : -1));
      const key = heads
        .map((x, s) => (x >= 0 ? segs[s][x].k : null))
        .filter((k) => k !== null)
        .sort()[0]; // the smallest key under any pointer
      const who = heads.map((x, s) => (x >= 0 && segs[s][x].k === key ? s : -1)).filter((s) => s >= 0);
      const win = Math.max(...who); // the newest segment holding the key
      const r = segs[win][heads[win]];
      const step = frames.length;
      who.forEach((s) => (stepOf[s][heads[s]] = step));
      frames.push({
        step,
        heads,
        key,
        who,
        win,
        rec: r,
        tomb: !!r.tomb,
        drop: who.filter((s) => s !== win).map((s) => [s, heads[s]]),
        take: [win, heads[win]],
        outIndex: r.tomb ? -1 : outN++,
      });
      who.forEach((s) => p[s]++);
    }
    return { frames, out: frames.filter((f) => !f.tomb).map((f) => f.rec), stepOf };
  }
  D3.mergeSegments = mergeSegments;
  const mSegs = [
    recs([
      ["apple", 1],
      ["fig", 2],
      ["mango", 3],
      ["plum", 4],
    ]),
    recs([
      ["apple", 5],
      ["kiwi", 6],
      ["mango", 7],
    ]),
    recs([
      ["fig", 8],
      ["kiwi", null],
      ["plum", 9],
    ]),
  ];
  mSegs.forEach((s, i) => {
    if (s.some((r, j) => j && s[j - 1].k >= r.k)) throw new Error(`VID.d3: merge segment ${i + 1} is not sorted`);
  });
  const mRun = mergeSegments(mSegs);
  D3.MERGE = {
    segs: mSegs,
    ...mRun,
    keys: mRun.frames.map((f) => f.key),
    tombSteps: mRun.frames.filter((f) => f.tomb).map((f) => f.step),
  };
  same("merge: keys in output order", D3.MERGE.keys, ["apple", "fig", "kiwi", "mango", "plum"]);
  same(
    "merge: winners (segment index)",
    D3.MERGE.frames.map((f) => f.win),
    [1, 2, 2, 1, 2],
  );
  same(
    "merge: losers",
    D3.MERGE.frames.map((f) => f.drop),
    [[[0, 0]], [[0, 1]], [[1, 1]], [[0, 2]], [[0, 3]]],
  );
  same("merge: tombstone step", D3.MERGE.tombSteps, [2]);
  same(
    "merge: output",
    D3.MERGE.out.map((r) => `${r.k} ${r.v}`),
    ["apple 5", "fig 8", "mango 7", "plum 9"],
  );
  same("merge: records in and out", [mSegs.flat().length, D3.MERGE.out.length], [10, 4]);
  same(
    "merge: output slots",
    D3.MERGE.frames.map((f) => f.outIndex),
    [0, 1, -1, 2, 3],
  );
  if (D3.MERGE.stepOf.flat().some((s) => s < 0)) throw new Error("VID.d3: a merge record was never used");

  // ---------- 7. the sparse index ----------
  const WORDS = [
    "hand",
    "handbag",
    "handful",
    "handle",
    "handsome",
    "handy",
    "hang",
    "hangar",
    "hanger",
    "happen",
    "happy",
    "harbour",
  ];
  if (WORDS.some((w, i) => i && WORDS[i - 1] >= w)) throw new Error("VID.d3: the sparse-index keys are not sorted");
  const spRecs = WORDS.map((k, i) => rec(k, i + 1));
  const spOffs = offsets(spRecs);
  const BLOCK = 4;
  const spIndex = spRecs
    .filter((_, i) => i % BLOCK === 0)
    .map((r) => ({ key: r.k, i: spRecs.indexOf(r), off: spOffs[spRecs.indexOf(r)] }));
  function sparseFind(list, index, key, to) {
    let via = index[0];
    index.forEach((e) => e.key <= key && (via = e)); // the nearest indexed key before (or at) the one we want
    const reads = [];
    const hits = [];
    for (let i = via.i; i < list.length; i++) {
      reads.push(i);
      if (list[i].k > (to ?? key)) break; // sorted: a bigger key means it is not here
      if (list[i].k >= key) hits.push(i);
      if (to === undefined && list[i].k === key) break;
    }
    return { via, reads, hit: hits.length ? hits[0] : -1, hits };
  }
  D3.sparseFind = sparseFind;
  const spFind = sparseFind(spRecs, spIndex, "handbag");
  const spRange = sparseFind(spRecs, spIndex, "handbag", "handy");
  D3.SPARSE = {
    recs: spRecs,
    block: BLOCK,
    offs: spOffs,
    index: spIndex,
    entries: spIndex.length,
    find: { key: "handbag", via: spFind.via.key, viaI: spFind.via.i, reads: spFind.reads, hit: spFind.hit },
    range: {
      from: "handbag",
      to: "handy",
      via: spRange.via.key,
      hits: spRange.hits,
      scanned: spRange.reads,
      jumps: 1,
    },
  };
  same(
    "sparse: index keys",
    D3.SPARSE.index.map((e) => [e.key, e.i]),
    [
      ["hand", 0],
      ["handsome", 4],
      ["hanger", 8],
    ],
  );
  same("sparse: the index holds 3 of 12 keys", [D3.SPARSE.entries, D3.SPARSE.recs.length], [3, 12]);
  same("sparse: find handbag", [D3.SPARSE.find.via, D3.SPARSE.find.reads, D3.SPARSE.find.hit], ["hand", [0, 1], 1]);
  same(
    "sparse: range handbag to handy",
    [D3.SPARSE.range.via, D3.SPARSE.range.hits, D3.SPARSE.range.scanned],
    ["hand", [1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6]],
  );

  // ---------- 8. the memtable ----------
  function buildTree(writes) {
    const nodes = [];
    writes.forEach((w) => {
      const n = { k: w.k, v: w.v, parent: -1, side: "", depth: 0, rank: 0, route: [] };
      let at = nodes.length ? 0 : -1;
      while (at >= 0) {
        const side = w.k < nodes[at].k ? "L" : "R";
        const kid = nodes.findIndex((m) => m.parent === at && m.side === side);
        if (kid < 0) {
          n.parent = at;
          n.side = side;
          break;
        }
        at = kid;
      }
      n.route = n.parent < 0 ? [] : [...nodes[n.parent].route, n.parent];
      n.depth = n.route.length;
      nodes.push(n);
    });
    [...nodes.keys()].sort((a, b) => (nodes[a].k < nodes[b].k ? -1 : 1)).forEach((i, r) => (nodes[i].rank = r));
    return nodes;
  }
  D3.buildTree = buildTree;
  function readPath(key, memtable, segments) {
    const path = [];
    const places = [
      ["memtable", memtable],
      ...segments.map((s, i) => [
        i === 0 ? "newest segment" : i === segments.length - 1 ? "oldest segment" : "older segment",
        s,
      ]),
    ];
    let value = null;
    for (const [where, list] of places) {
      const r = list.find((x) => x.k === key);
      path.push({ where, hit: !!r });
      if (r) {
        value = r.tomb ? null : r.v;
        break; // the newest copy wins: stop at the first hit
      }
    }
    return { k: key, path, checks: path.length, value };
  }
  D3.readPath = readPath;
  const memWrites = recs([
    ["kiwi", 10],
    ["fig", 11],
    ["plum", 12],
    ["apple", 13],
    ["grape", 14],
  ]);
  const nodes = buildTree(memWrites);
  const walk = [...nodes.keys()].sort((a, b) => nodes[a].rank - nodes[b].rank);
  const flushed = walk.map((i) => ({ k: nodes[i].k, v: nodes[i].v }));
  const memNext = rec("date", 15);
  const segsOnDisk = [flushed, D3.MERGE.out]; // newest first
  D3.MEM = {
    old: D3.MERGE.out,
    limit: 5,
    writes: memWrites,
    nodes,
    walk,
    flushed,
    next: memNext,
    getFig: readPath("fig", [memNext], segsOnDisk),
    getMango: readPath("mango", [memNext], segsOnDisk),
  };
  same(
    "memtable: tree",
    nodes.map((n) => [n.k, n.parent, n.side, n.depth, n.rank]),
    [
      ["kiwi", -1, "", 0, 3],
      ["fig", 0, "L", 1, 1],
      ["plum", 0, "R", 1, 4],
      ["apple", 1, "L", 2, 0],
      ["grape", 1, "R", 2, 2],
    ],
  );
  same("memtable: height", Math.max(...nodes.map((n) => n.depth)) + 1, 3);
  same("memtable: sorted walk", walk, [3, 1, 4, 0, 2]);
  same(
    "memtable: flushed segment",
    flushed.map((r) => `${r.k} ${r.v}`),
    ["apple 13", "fig 11", "grape 14", "kiwi 10", "plum 12"],
  );
  same("memtable: the memtable fills at the limit", [memWrites.length, D3.MEM.limit], [5, 5]);
  same(
    "read path: fig",
    [D3.MEM.getFig.path, D3.MEM.getFig.checks, D3.MEM.getFig.value],
    [
      [
        { where: "memtable", hit: false },
        { where: "newest segment", hit: true },
      ],
      2,
      11,
    ],
  );
  same(
    "read path: mango",
    [D3.MEM.getMango.checks, D3.MEM.getMango.value, D3.MEM.getMango.path.map((p) => p.hit)],
    [3, 7, [false, false, true]],
  );
})();
