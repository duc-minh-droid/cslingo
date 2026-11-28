/* Lecture 13 · Thread-level parallelism (Data Science, COM3021): the data every scene of this video shares (VID.d13, short
   name D13). PURE: no DOM, no Math.random, no Date. Drawing pieces are in common-2.js; small stickers (tags, chips) come from
   the lecture 4 kit VID.d4 and ticks, crosses and arrows from VID.l5, so the page loads videos/l5/common.js and
   videos/d4/common*.js first. Everything is computed here by porting the lessons' own rules (js/content/ds/ds-l13-*.js) and
   asserted against the script (videos/_plan/ds-13-script.md): a wrong number throws an Error when the page loads.

   COLOUR ROLES OF THIS VIDEO (the same in every scene):
     grey    hardware (cores, processors, the node outline, "Another node"), wires, arrows, axes, plain labels
     blue    threads and their parallel work (wavy thread lines, tally bars, receipt blocks being worked on)
     purple  processes and the master (process outlines, sequential bars, instruction streams, communicators and groups)
     orange  memory and data (shared memory, own memory, total = 0, receipts.csv, data values, the message envelope)
     green   done and delivered (finish times, speed-ups, a matched message, a rank read correctly, ticks)
     red     cost and waste (expensive start-up, idle cores, idle waiting at a join, an unmatched receive, the wall)

   1. D13.SPLIT  (scene 6, lesson 13.3 demo): 12 one-minute blocks on a 4-core processor, n = 1, 2, 4 threads.
        runs: [{n, per (blocks per thread), owner: [thread of each block], slot: [position in its thread's queue],
                time (minutes), idle (cores), speedup}]  -> times 12, 6, 3; idle 3, 2, 0; speed-up 4 on 4 threads.
   2. D13.FORK   (scene 7, lesson 13.4 'Join'): master and two workers tally 3, 2 and 1.5 minutes; join at 3;
        idle [0, 1, 1.5]; the master carries on alone 3..4.
   3. D13.RHYTHM (scene 8, lesson 13.4 forkJoin): load 2, tally 8, sort 1, tally 4, report 1 on n = 1, 2, 4 threads.
        runs: [{n, rows: [{name, bars: [{a, b, kind: "seq" | "work" | "idle", text}]}], marks: [[t, "fork" | "join"]], end}]
        ends 16, 10, 7; seq 4 minutes always.
   4. D13.FLYNN  (scene 4): prices [10, 5, 20, 15] plus 20% VAT -> [12, 6, 24, 18]; streams {SISD: 1/1, SIMD: 1/4, MIMD: 4/4}.
   5. D13.MPI    (scene 9, lesson 13.5): three shops; process 0 sends its total to 2; a receive from 0 matches, from 1 not.
   6. D13.RANKS  (scene 10, lesson 13.6 + workshop card 4): 12 processes in MPI_COMM_WORLD, groups of 3 named A..D;
        of(r) -> {group, rank}; process 7 is rank 1 in group C.
   SMALL TOOLS.  D13.same(what, got, want) throws on a mismatch;  D13.fm(v) -> "1.5" / "12". */
(function () {
  const V = window.VID;
  const D13 = (V.d13 = V.d13 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d13: ${what} is ${JSON.stringify(got)}, the script says ${JSON.stringify(want)}`);
  };
  const fm = (v, d = 2) => String(+(+v).toFixed(d));
  Object.assign(D13, { same, fm });

  // ---------- 1. split the pile (13.3) ----------
  {
    const blocks = 12;
    const cores = 4;
    const run = (n) => {
      const per = blocks / n;
      const owner = Array.from({ length: blocks }, (_, j) => Math.floor(j / per));
      const slot = Array.from({ length: blocks }, (_, j) => j % per);
      const time = Math.max(...slot) + 1; // one minute per block, a thread's blocks one after another
      return { n, per, owner, slot, time, idle: cores - n, speedup: blocks / time };
    };
    D13.SPLIT = { blocks, cores, runs: [1, 2, 4].map(run) };
    const R = D13.SPLIT.runs;
    same(
      "split: minutes on 1, 2, 4 threads",
      R.map((r) => r.time),
      [12, 6, 3],
    );
    same(
      "split: idle cores",
      R.map((r) => r.idle),
      [3, 2, 0],
    );
    same(
      "split: blocks per thread",
      R.map((r) => r.per),
      [12, 6, 3],
    );
    same("split: speed-up on 4 threads", R[2].speedup, 4);
  }

  // ---------- 2. fork and join (13.4) ----------
  {
    const work = [3, 2, 1.5];
    const names = ["Master", "Worker 1", "Worker 2"];
    const join = Math.max(...work);
    const idle = work.map((w) => join - w);
    const rows = names.map((name, i) => ({
      name,
      bars: [
        { a: 0, b: work[i], kind: "work", text: "tally" },
        ...(idle[i] > 0 ? [{ a: work[i], b: join, kind: "idle", text: "idle" }] : []),
        ...(i === 0 ? [{ a: join, b: join + 1, kind: "seq", text: "" }] : []),
      ],
    }));
    D13.FORK = { work, names, join, idle, rows, T: 4 };
    same("fork: join time", join, 3);
    same("fork: idle minutes", idle, [0, 1, 1.5]);
  }

  // ---------- 3. the rhythm of a program (13.4, the lesson's forkJoin) ----------
  {
    const plan = [
      ["seq", 2, "load"],
      ["par", 8, "tally"],
      ["seq", 1, "sort"],
      ["par", 4, "tally"],
      ["seq", 1, "report"],
    ];
    const forkJoin = (n) => {
      const rows = Array.from({ length: n }, (_, i) => ({ name: i ? `Worker ${i}` : "Master", bars: [] }));
      const marks = [];
      let t = 0;
      for (const [k, w, lbl] of plan) {
        if (k === "seq") {
          rows[0].bars.push({ a: t, b: t + w, kind: "seq", text: lbl });
          rows.slice(1).forEach((r) => r.bars.push({ a: t, b: t + w, kind: "idle", text: "" }));
          t += w;
        } else {
          const d = w / n;
          if (n > 1) marks.push([t, "fork"]);
          rows.forEach((r) => r.bars.push({ a: t, b: t + d, kind: "work", text: lbl }));
          t += d;
          if (n > 1) marks.push([t, "join"]);
        }
      }
      return { n, rows, marks, end: t };
    };
    const seq = plan.filter((p) => p[0] === "seq").reduce((s, p) => s + p[1], 0);
    D13.RHYTHM = { plan, runs: [1, 2, 4].map(forkJoin), seq };
    same(
      "rhythm: minutes on 1, 2, 4 threads",
      D13.RHYTHM.runs.map((r) => r.end),
      [16, 10, 7],
    );
    same("rhythm: sequential minutes", seq, 4);
    D13.RHYTHM.runs.forEach((r) => {
      const s = r.rows[0].bars.filter((b) => b.kind === "seq").reduce((a, b) => a + b.b - b.a, 0);
      same(`rhythm: master's sequential minutes on ${r.n} threads`, s, 4);
    });
  }

  // ---------- 4. Flynn's streams ----------
  {
    const prices = [10, 5, 20, 15];
    const rate = 0.2;
    const vat = prices.map((p) => Math.round(p * (1 + rate) * 100) / 100);
    D13.FLYNN = {
      rate,
      pct: Math.round(rate * 100),
      prices,
      vat,
      kinds: { SISD: { i: 1, d: 1 }, SIMD: { i: 1, d: 4 }, MIMD: { i: 4, d: 4 } },
    };
    same("flynn: prices with VAT", vat, [12, 6, 24, 18]);
  }

  // ---------- 5. MPI messages (13.5) ----------
  {
    const shops = ["North St", "Market Sq", "Station Rd"];
    const msg = { from: 0, to: 2 };
    const matches = (m, recv) => m.to === recv.at && m.from === recv.from;
    const good = { at: 2, from: 0 };
    const bad = { at: 2, from: 1 };
    D13.MPI = { shops, msg, good, bad, ok: matches(msg, good), wrong: matches(msg, bad) };
    same("mpi: the matching receive", D13.MPI.ok, true);
    same("mpi: the wrong sender", D13.MPI.wrong, false);
  }

  // ---------- 6. communicators and ranks (13.6) ----------
  {
    const size = 12;
    const per = 3;
    const names = ["A", "B", "C", "D"];
    const of = (r) => ({ g: Math.floor(r / per), group: names[Math.floor(r / per)], rank: r % per });
    D13.RANKS = { size, per, names, of, focus: 7 };
    same("ranks: groups", size / per, names.length);
    same("ranks: process 7", of(7), { g: 2, group: "C", rank: 1 });
    same(
      "ranks: group ranks",
      Array.from({ length: size }, (_, r) => of(r).rank),
      [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2],
    );
  }
})();
