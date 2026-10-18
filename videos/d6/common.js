/* Lecture 6 · Consistency and consensus (Data Science, COM3021): the data and algorithms every scene of this video shares
   (VID.d6, short name D6). PURE: no DOM, no randomness, no clock. Drawing helpers are in common-2.js (stickers, tags, tools),
   common-3.js (pictograms, nodes, links, packets) and common-4.js (timeline, meter, step plot). Scenes start with
       const V = window.VID, D6 = V.d6, L5 = V.l5;   const {ramp, flash, clamp, lerp, ease: E} = V;
   The real rules of js/content/ds/ds-l6-01.js .. ds-l6-03.js are run here on the lessons' own example data, and every number
   the storyboard (videos/_plan/ds-6.json) quotes is ASSERTED when the page loads: a wrong figure throws a clear Error.
   Scenes only look values up; never type a result by hand.

   TOOLS
     D6.rng(seed) -> () => 0..1 (mulberry32, the only randomness allowed).
     D6.same(got, want, what)  throws unless equal (numbers within 1e-9, arrays and objects by value);  D6.close(got, want, eps, what)

   1. FAULTS (scene 2, lesson 6.1)   D6.FAULTS = [{id: "crash", label: "node crashes"}, {id: "lost", label: "message lost"},
        {id: "slow", label: "reply slow"}, {id: "split", label: "network split"}]  (the four things that go wrong, in the order shown)
   2. CAP (scene 3, lesson 6.1)  Two replicas hold the tickets left for the 8 pm show, 40 each. A sale of 5 is written at node A.
        D6.CAP = {start: 40, sale: 5, latest: 35, run(policy, cut), refuse, answer, healthy}
        run("C" | "A", cut) -> {a, b, reply, stale, C, A}: policy "C" = stay consistent (refuse when cut off), "A" = stay available
          (answer from what it has). a, b = what node A and node B hold after the sale; reply = what a read at node B returns
          (a number or "error"); stale = the reply is not the latest write; C = consistent (the reply is the latest write, or an
          error); A = available (the reply is not an error).
        CAP.refuse  = run("C", true)  = {a: 35, b: 40, reply: "error", stale: false, C: true,  A: false}
        CAP.answer  = run("A", true)  = {a: 35, b: 40, reply: 40,      stale: true,  C: false, A: true}
        CAP.healthy = run("A", false) = {a: 35, b: 35, reply: 35,      stale: false, C: true,  A: true}   (no cut: no dilemma)
   3. BANK (scene 4, lesson 6.2)  Asha has 100 and Ben 50 (total 150); a transfer of 30 is a debit then a credit.
        D6.BANK = {asha: 100, ben: 50, amount: 30, total: 150, run(atomic, crash), plain, atomic, ok}
        run(atomic, crash) -> {asha, ben, total, log: ["debit", "crash" | "rollback" | "credit"]}
        BANK.plain  = run(false, true) = {asha: 70,  ben: 50, total: 120, log: [debit, crash]}   (30 vanished)
        BANK.atomic = run(true,  true) = {asha: 100, ben: 50, total: 150, log: [debit, rollback]} (rolled back: all or nothing)
        BANK.ok     = run(true, false) = {asha: 70,  ben: 80, total: 150, log: [debit, credit]}
        BANK.afterDebit = {asha: 70, ben: 50}   (the moment between the two writes)
   4. ISOLATION (scene 5, lesson 6.2)  Two shoppers X and Y each pay 30 from a balance of 100. An op is {who, kind: "read" | "write",
        s, e (seconds on a timeline, effect at e)}; a read sees the balance, a write stores (what it saw) - 30.
        D6.ISO = {balance: 100, pay: 30, T: 8, run(ops), mixed, serial, lost}
        run(ops) -> {ops: [{who, kind, s, e, val, bal}] (val = the number read or written, bal = balance after the op), final}
        ISO.mixed  (X and Y read 100 first, then both write 70):  X read 100 [0.4, 1.9], Y read 100 [0.9, 2.4], X write 70 [4.2, 5.7],
                   Y write 70 [4.7, 6.2]  -> final 70
        ISO.serial (one after the other):  X read 100 [0.4, 1.9], X write 70 [2.3, 3.8], Y read 70 [4.2, 5.7], Y write 40 [6.1, 7.6] -> final 40
        ISO.lost = 40 - 70 = -30 (the 30 that one payment lost: both ended at 70 but 40 was right). Lanes: "Shopper X", "Shopper Y".
        D6.ACID = [{k: "A", word: "Atomic", line: "all or nothing"}, {k: "C", word: "Consistent", line: "rules always hold"},
          {k: "I", word: "Isolated", line: "no interference"}, {k: "D", word: "Durable", line: "stays saved"}]
   5. EVENTUAL CONSISTENCY (scene 6, lesson 6.2)  Three replicas R1 R2 R3 hold 40; the write 35 lands on R1 at tick 0 and reaches
        R2 at tick 2 and R3 at tick 4.
        D6.EV = {n: 3, at: [0, 2, 4], old: 40, latest: 35, last: 4, vals(tick), count(tick), read(tick, i), counts}
        vals(tick) -> [R1, R2, R3 values];  count(tick) -> replicas holding 35;  read(tick, i) -> {value, stale}
        EV.counts = [1, 1, 2, 2, 3] (ticks 0..4);  EV.read(3, 2) = {value: 40, stale: true} (R3 is still old at tick 3);
        converged when count = 3 (tick 4).
   6. LINEARIZABILITY (scene 7, lesson 6.3)  Register x starts at 0 and client C writes 1. A read is {n, c (lane 0 = A, 1 = B), s, e, v}.
        D6.linCheck(w, reads) -> {ok, lo, hi, flip, loBy, hiBy}   w = {s, e}. lo = the latest start of a read that returned 0 (or w.s),
          hi = the earliest end of a read that returned 1 (or w.e). The history is linearizable iff lo <= hi, and the flip moment
          can be anywhere in [lo, hi] (flip = the middle). loBy / hiBy = the read names that set lo / hi (or "").
        D6.LIN = {w: {s: 4, e: 11}, T: 13, lanes: ["Client A", "Client B", "Client C"], good, bad}
        LIN.good.reads = A1 (lane 0, 0-2, reads 0), B1 (lane 1, 3.5-5.5, reads 0), A2 (lane 0, 6-8, reads 1), B2 (lane 1, 9-12, reads 1);
          LIN.good.check = {ok: true, lo: 4, hi: 8, flip: 6, loBy: "", hiBy: "A2"}  (one flip moment, 6, explains every read)
        LIN.bad.reads = A (lane 0, 5-7, reads 1), B (lane 1, 8-10, reads 0);
          LIN.bad.check = {ok: false, lo: 8, hi: 7, loBy: "B", hiBy: "A"}  (the flip would have to be after 8 for B and before 7 for A)
   7. PRICE OF AGREEMENT (scene 8, lesson 6.4)  Seat 14C is sold from two sites, London (Mia) and Leeds (Omar), 30 ms one way.
        D6.SEAT = {seat: "14C", sites: ["London", "Leeds"], who: {London: "Mia", Leeds: "Omar"}, oneWay: 30, local: 2, lin: 62, run(mode)}
        run("ev")  -> {London: "Mia", Leeds: "Omar", double: true,  ms: 2}     each site decides alone: sold twice
        run("lin") -> {London: "Mia", Leeds: "Mia",  double: false, refused: "Omar", ms: 62}   Leeds asks London first: taken, Omar refused
        62 = 2 * 30 + 2: a round trip plus 2 ms of local work (the lesson's bars: 2 ms local, 62 ms with the other site, 30 ms each way).
   8. TWO-PHASE COMMIT (scenes 9 and 10, lesson 6.5)  One purchase touches three databases.
        D6.DB = ["Orders", "Stock", "Payments"]
        D6.run2pc(votes, mode) -> {out, same, decision, locks}   votes[i] = "yes" | "no" | "crash"; mode "naive" (send commit to all and do
          not wait) or "2pc". out[i] = "committed" | "rejected" | "never got it" | "aborted"; same = all or nothing; decision = "commit" |
          "abort" | null (naive); locks[i] = the database voted yes and holds its locks until the decision arrives (2pc only).
        D6.TPC = {naive, abort, commit}
          TPC.naive  = run2pc(["yes", "no", "crash"], "naive") -> out [committed, rejected, never got it], same false (1 of 3 committed)
          TPC.abort  = run2pc(["yes", "yes", "no"], "2pc")     -> out [aborted, aborted, aborted], same true, decision "abort", locks [true, true, false]
          TPC.commit = run2pc(["yes", "yes", "yes"], "2pc")    -> out [committed x3], same true, decision "commit", locks [true, true, true]
        D6.TPC.votes = ["yes", "yes", "no"] (the run the video shows: Orders and Stock vote yes, Payments votes no). */
(function () {
  const V = window.VID;
  const D6 = (V.d6 = V.d6 || {});

  // ---------- tools ----------
  D6.rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const show = (v) => JSON.stringify(v);
  const eq = (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
    if (a && b && typeof a === "object" && typeof b === "object") {
      const k = Object.keys(b);
      return k.every((key) => eq(a[key], b[key]));
    }
    return typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 : a === b;
  };
  const same = (got, want, what = "value") => {
    if (!eq(got, want)) throw new Error(`VID.d6: ${what} is ${show(got)}, the storyboard says ${show(want)}`);
  };
  const close = (got, want, eps, what = "value") => {
    if (!(Math.abs(got - want) <= eps)) throw new Error(`VID.d6: ${what} is ${got}, the storyboard says ${want}`);
  };
  Object.assign(D6, { same, close });

  // ---------- 1. faults ----------
  D6.FAULTS = [
    { id: "crash", label: "node crashes" },
    { id: "lost", label: "message lost" },
    { id: "slow", label: "reply slow" },
    { id: "split", label: "network split" },
  ];
  same(
    D6.FAULTS.map((f) => f.id),
    ["crash", "lost", "slow", "split"],
    "FAULTS",
  );

  // ---------- 2. CAP: two replicas, a cut link, a read at node B ----------
  const CAP = (D6.CAP = { start: 40, sale: 5 });
  CAP.latest = CAP.start - CAP.sale;
  CAP.run = (policy, cut) => {
    const a = CAP.start - CAP.sale; // the sale is written at node A
    const b = cut ? CAP.start : a; // node B hears about it only when the link is up
    const refuse = cut && policy === "C";
    const reply = refuse ? "error" : b;
    return { a, b, reply, stale: !refuse && b !== a, C: refuse || b === a, A: !refuse };
  };
  CAP.refuse = CAP.run("C", true);
  CAP.answer = CAP.run("A", true);
  CAP.healthy = CAP.run("A", false);
  same(CAP.refuse, { a: 35, b: 40, reply: "error", stale: false, C: true, A: false }, "CAP.refuse");
  same(CAP.answer, { a: 35, b: 40, reply: 40, stale: true, C: false, A: true }, "CAP.answer");
  same(CAP.healthy, { a: 35, b: 35, reply: 35, stale: false, C: true, A: true }, "CAP.healthy");

  // ---------- 3. BANK: a transfer, with and without a transaction ----------
  const BANK = (D6.BANK = { asha: 100, ben: 50, amount: 30 });
  BANK.total = BANK.asha + BANK.ben;
  BANK.run = (atomic, crash) => {
    let { asha, ben } = BANK;
    const log = ["debit"];
    asha -= BANK.amount;
    if (crash) {
      if (atomic) {
        asha += BANK.amount; // rolled back: the debit is undone
        log.push("rollback");
      } else log.push("crash");
    } else {
      ben += BANK.amount;
      log.push("credit");
    }
    return { asha, ben, total: asha + ben, log };
  };
  BANK.plain = BANK.run(false, true);
  BANK.atomic = BANK.run(true, true);
  BANK.ok = BANK.run(true, false);
  BANK.afterDebit = { asha: BANK.asha - BANK.amount, ben: BANK.ben };
  same(BANK.total, 150, "BANK.total");
  same(BANK.plain, { asha: 70, ben: 50, total: 120, log: ["debit", "crash"] }, "BANK.plain");
  same(BANK.atomic, { asha: 100, ben: 50, total: 150, log: ["debit", "rollback"] }, "BANK.atomic");
  same(BANK.ok, { asha: 70, ben: 80, total: 150, log: ["debit", "credit"] }, "BANK.ok");
  same(BANK.afterDebit, { asha: 70, ben: 50 }, "BANK.afterDebit");

  // ---------- 4. ISOLATION: two payments from one balance ----------
  const ISO = (D6.ISO = { balance: 100, pay: 30, T: 8 });
  ISO.run = (ops) => {
    let bal = ISO.balance;
    const seen = {};
    const out = [...ops]
      .sort((p, q) => p.e - q.e)
      .map((o) => {
        let val;
        if (o.kind === "read") val = seen[o.who] = bal;
        else val = bal = seen[o.who] - ISO.pay;
        return { ...o, val, bal };
      });
    return { ops: out, final: bal };
  };
  const op = (who, kind, s, e) => ({ who, kind, s, e });
  ISO.mixed = ISO.run([
    op("X", "read", 0.4, 1.9),
    op("Y", "read", 0.9, 2.4),
    op("X", "write", 4.2, 5.7),
    op("Y", "write", 4.7, 6.2),
  ]);
  ISO.serial = ISO.run([
    op("X", "read", 0.4, 1.9),
    op("X", "write", 2.3, 3.8),
    op("Y", "read", 4.2, 5.7),
    op("Y", "write", 6.1, 7.6),
  ]);
  ISO.lost = ISO.serial.final - ISO.mixed.final;
  same(ISO.mixed.final, 70, "ISO.mixed.final");
  same(
    ISO.mixed.ops.map((o) => o.val),
    [100, 100, 70, 70],
    "ISO.mixed values",
  );
  same(ISO.serial.final, 40, "ISO.serial.final");
  same(
    ISO.serial.ops.map((o) => o.val),
    [100, 70, 70, 40],
    "ISO.serial values",
  );
  same(ISO.lost, -30, "ISO.lost");
  D6.ACID = [
    { k: "A", word: "Atomic", line: "all or nothing" },
    { k: "C", word: "Consistent", line: "rules always hold" },
    { k: "I", word: "Isolated", line: "no interference" },
    { k: "D", word: "Durable", line: "stays saved" },
  ];
  same(BANK.asha + BANK.ben, BANK.ok.asha + BANK.ok.ben, "the rule 'the total stays 150'");

  // ---------- 5. EVENTUAL CONSISTENCY: three replicas catch up ----------
  const EV = (D6.EV = { n: 3, at: [0, 2, 4], old: 40, latest: 35, last: 4 });
  EV.vals = (tick) => EV.at.map((a) => (tick >= a ? EV.latest : EV.old));
  EV.count = (tick) => EV.vals(tick).filter((v) => v === EV.latest).length;
  EV.read = (tick, i) => {
    const value = EV.vals(tick)[i];
    return { value, stale: value !== EV.latest };
  };
  EV.counts = Array.from({ length: EV.last + 1 }, (_, t) => EV.count(t));
  same(EV.counts, [1, 1, 2, 2, 3], "EV.counts");
  same(EV.read(3, 2), { value: 40, stale: true }, "EV.read(3, R3)");
  same(EV.count(EV.last), EV.n, "EV converged");

  // ---------- 6. LINEARIZABILITY: is there one flip moment? ----------
  D6.linCheck = (w, reads) => {
    let lo = w.s,
      loBy = "",
      hi = w.e,
      hiBy = "";
    reads.forEach((r) => {
      if (r.v === 0 && r.s > lo) [lo, loBy] = [r.s, r.n];
      if (r.v === 1 && r.e < hi) [hi, hiBy] = [r.e, r.n];
    });
    return { ok: lo <= hi, lo, hi, flip: (lo + hi) / 2, loBy, hiBy };
  };
  const rd = (n, c, s, e, v) => ({ n, c, s, e, v });
  const LIN = (D6.LIN = { w: { s: 4, e: 11 }, T: 13, lanes: ["Client A", "Client B", "Client C"] });
  LIN.good = {
    reads: [rd("A1", 0, 0, 2, 0), rd("B1", 1, 3.5, 5.5, 0), rd("A2", 0, 6, 8, 1), rd("B2", 1, 9, 12, 1)],
  };
  LIN.good.check = D6.linCheck(LIN.w, LIN.good.reads);
  LIN.bad = { reads: [rd("A", 0, 5, 7, 1), rd("B", 1, 8, 10, 0)] };
  LIN.bad.check = D6.linCheck(LIN.w, LIN.bad.reads);
  same(LIN.good.check, { ok: true, lo: 4, hi: 8, flip: 6, loBy: "", hiBy: "A2" }, "LIN.good.check");
  same(LIN.bad.check, { ok: false, lo: 8, hi: 7, loBy: "B", hiBy: "A" }, "LIN.bad.check");

  // ---------- 7. SEAT 14C: agreement costs a round trip ----------
  const SEAT = (D6.SEAT = {
    seat: "14C",
    sites: ["London", "Leeds"],
    who: { London: "Mia", Leeds: "Omar" },
    oneWay: 30,
    local: 2,
  });
  SEAT.lin = 2 * SEAT.oneWay + SEAT.local;
  SEAT.run = (mode) =>
    mode === "ev"
      ? { London: "Mia", Leeds: "Omar", double: true, ms: SEAT.local }
      : { London: "Mia", Leeds: "Mia", double: false, refused: "Omar", ms: SEAT.lin };
  same(SEAT.lin, 62, "SEAT.lin = 2 x 30 + 2");
  same(SEAT.run("ev"), { London: "Mia", Leeds: "Omar", double: true, ms: 2 }, "SEAT.run(ev)");
  same(SEAT.run("lin"), { London: "Mia", Leeds: "Mia", double: false, refused: "Omar", ms: 62 }, "SEAT.run(lin)");

  // ---------- 8. TWO-PHASE COMMIT ----------
  D6.DB = ["Orders", "Stock", "Payments"];
  D6.run2pc = (votes, mode) => {
    let out;
    let decision = null;
    let locks = votes.map(() => false);
    if (mode === "naive") {
      out = votes.map((v) => (v === "yes" ? "committed" : v === "no" ? "rejected" : "never got it"));
    } else {
      const all = votes.every((v) => v === "yes");
      decision = all ? "commit" : "abort";
      out = votes.map(() => (all ? "committed" : "aborted"));
      locks = votes.map((v) => v === "yes"); // a database that voted yes holds its locks until the decision arrives
    }
    const done = out.filter((o) => o === "committed").length;
    return { out, same: done === 0 || done === out.length, decision, locks };
  };
  const TPC = (D6.TPC = { votes: ["yes", "yes", "no"] });
  TPC.naive = D6.run2pc(["yes", "no", "crash"], "naive");
  TPC.abort = D6.run2pc(TPC.votes, "2pc");
  TPC.commit = D6.run2pc(["yes", "yes", "yes"], "2pc");
  same(TPC.naive.out, ["committed", "rejected", "never got it"], "TPC.naive.out");
  same(TPC.naive.same, false, "TPC.naive.same");
  same(TPC.abort.out, ["aborted", "aborted", "aborted"], "TPC.abort.out");
  same([TPC.abort.same, TPC.abort.decision, TPC.abort.locks], [true, "abort", [true, true, false]], "TPC.abort");
  same(TPC.commit.out, ["committed", "committed", "committed"], "TPC.commit.out");
  same([TPC.commit.same, TPC.commit.decision], [true, "commit"], "TPC.commit");
})();
