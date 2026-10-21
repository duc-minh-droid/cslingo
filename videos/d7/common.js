/* Lecture 7 · The Paxos consensus protocol (Data Science, COM3021): the data and the drawing rig every scene of this video shares
   (VID.d7, short name D7). It reuses the lecture 4 drawing pieces (VID.d4: tags, packets, cards, wires, bolt, crown, person ...), so
   the page loads videos/l5/common.js and videos/d4/common*.js first. Every number below comes from running a tiny Paxos simulation
   when the page loads and is asserted against the storyboard (videos/_plan/ds-7.json): a wrong number throws an Error.

   COLOUR ROLES OF THIS VIDEO (the same in every scene):
     "blue"    a proposer and the value it proposes (the thing we follow)
     "purple"  the protocol messages: PREPARE, PROMISE, ACCEPT, ACCEPTED, and the rule "n"
     "green"   promised, accepted, chosen, a quorum (agreed, safe)
     "orange"  waiting, older, superseded (a smaller proposal number, a retry)
     "red"     crashed, ignored, a failure
     "grey"    neutral (an acceptor that has not done anything yet, learners)

   1. THE SIMULATION  (pure functions; acceptors A to E, proposal numbers 1, 2, 3 ...)
        D7.MAJ(n) -> quorum of n acceptors (more than half);  D7.ACCS = ["A","B","C","D","E"]
        D7.acceptor() -> {promised: 0, accepted: null | {n, v}}
        D7.prepare(acc, n) -> {ok, report}   promise iff n > acc.promised (then promised = n); report = the accepted pair or null
        D7.accept(acc, n, v) -> true         accept iff n >= acc.promised (then accepted = {n, v})
        D7.pick(own, reports) -> the value a proposer must send in phase 2: the value of the highest-numbered report, or its own
   2. THE EXAMPLES  (each scene reads the values it shows from here)
        D7.QUORUM = {n: 5, need: 3, maxDown: 2, groups: [["A","B","C"], ["C","D","E"]], shared: ["C"]}
            any two majorities share at least one acceptor (checked by brute force over all of them)
        D7.R1 = {n: 1, v: 7, down: "E", promises: [A, B, C, D], accepted: [A, B, C, D], learned: 3 (ACCEPTED messages when a learner is told)}
        D7.DUEL = {p1: {n: 1, v: 7}, p2: {n: 2, v: 9}, promisedFirst: [A, B, C] (promised 1), promised2: [B, C, D, E] (promised 2),
                   ignored: [B, C] (the ACCEPT(1, 7) they ignore), accepted1: [A], won: 2, retry: {n: 3, v: 9}}
        D7.SAFE = {p1: {n: 1, v: 7}, onlyAB: [A, B] (accepted (1, 7) before P1 crashed), p2: {n: 2, own: 9, quorum: [B, C, D],
                   reports: {B: {n: 1, v: 7}, C: null, D: null}, sends: 7}
        D7.LOG = {start: 100, entries: [{pos: 1, n: 1, v: +50}, {pos: 2, n: 2, v: -20}], balance: 130}
   3. THE RIG  (the picture of scenes 6 to 9: proposer(s) on the left, five acceptors in a column, learners on the right)
        const rig = D7.rig(stage, {proposers: 1 | 2, learners: true | false});
          rig.prop[i]  card of proposer i (x 12 .. 242);  rig.acc[k]  card of acceptor k (x 360 .. 610);  rig.learn  learners card
          rig.pos.prop(i), rig.pos.acc(k), rig.pos.learn  -> {x, y} centres;  rig.edge.propOut(i) / accIn(k) / accOut(k) / learnIn
          rig.wire[i][k]  the wire proposer i -> acceptor k (rig.wire[i][k].at(f) rides it);  rig.svg  the wire layer
        Cards are D4.card objects: set({text, tone, plain, k, x, y, s, o}). Text is one line of at most about 16 characters.
        D7.card(parent, ...) = D4.card.  D7.packet = D4.packet.  D7.msg(text, tone) = a solid packet of the protocol's colours. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = (V.d7 = V.d7 || {});
  const { clamp } = V;

  D7.same = D4.same;
  D7.f1 = (n) => n.toFixed(1);
  D7.ACCS = ["A", "B", "C", "D", "E"];
  D7.MAJ = (n) => Math.floor(n / 2) + 1;

  // ---------- 1. the simulation ----------
  D7.acceptor = () => ({ promised: 0, accepted: null });
  D7.prepare = (acc, n) => {
    if (n > acc.promised) {
      acc.promised = n;
      return { ok: true, report: acc.accepted ? { ...acc.accepted } : null };
    }
    return { ok: false, report: null };
  };
  D7.accept = (acc, n, v) => {
    if (n >= acc.promised) {
      acc.promised = n;
      acc.accepted = { n, v };
      return true;
    }
    return false;
  };
  D7.pick = (own, reports) => {
    const seen = reports.filter(Boolean);
    return seen.length ? seen.reduce((a, b) => (b.n > a.n ? b : a)).v : own;
  };

  // ---------- 2. the examples ----------
  const names = D7.ACCS;
  const fresh = () => Object.fromEntries(names.map((k) => [k, D7.acceptor()]));

  // any two majorities of five share an acceptor: checked over every majority, and the two shown in the picture
  const subsets = (list, size) =>
    size === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), size - 1).map((r) => [x, ...r]));
  const majorities = subsets(names, D7.MAJ(names.length));
  D7.QUORUM = {
    n: names.length,
    need: D7.MAJ(names.length),
    maxDown: names.length - D7.MAJ(names.length),
    groups: [
      ["A", "B", "C"],
      ["C", "D", "E"],
    ],
    shared: ["C"],
  };
  D7.same(
    "quorum: five acceptors need three, two may crash, any two majorities overlap",
    [
      D7.QUORUM.n,
      D7.QUORUM.need,
      D7.QUORUM.maxDown,
      majorities.every((a) => majorities.every((b) => a.some((x) => b.includes(x)))),
    ],
    [5, 3, 2, true],
  );
  D7.same(
    "quorum: the two groups drawn are majorities and share exactly acceptor C",
    [D7.QUORUM.groups.map((g) => g.length), D7.QUORUM.groups[0].filter((x) => D7.QUORUM.groups[1].includes(x))],
    [[3, 3], ["C"]],
  );

  // the successful round: E has crashed, A to D promise and accept
  D7.R1 = (() => {
    const st = fresh();
    const up = names.filter((k) => k !== "E");
    const promises = up.filter((k) => D7.prepare(st[k], 1).ok);
    const sent = D7.pick(
      7,
      promises.map((k) => null),
    );
    const accepted = promises.filter((k) => D7.accept(st[k], 1, sent));
    return { n: 1, v: sent, down: "E", promises, accepted, learned: D7.MAJ(names.length) };
  })();
  D7.same(
    "round 1: n = 1, value 7, E down, four promises and four ACCEPTED, learners told at the third",
    [D7.R1.n, D7.R1.v, D7.R1.down, D7.R1.promises, D7.R1.accepted, D7.R1.learned],
    [1, 7, "E", ["A", "B", "C", "D"], ["A", "B", "C", "D"], 3],
  );

  // two proposers collide
  D7.DUEL = (() => {
    const st = fresh();
    const promisedFirst = ["A", "B", "C"].filter((k) => D7.prepare(st[k], 1).ok);
    const promised2 = ["B", "C", "D", "E"].filter((k) => D7.prepare(st[k], 2).ok);
    // P1's ACCEPT(1, 7) now reaches everybody it asked: the ones that promised 2 ignore it
    const accepted1 = promisedFirst.filter((k) => D7.accept(st[k], 1, 7));
    const ignored = promisedFirst.filter((k) => !accepted1.includes(k));
    const accepted2 = promised2.filter((k) => D7.accept(st[k], 2, 9));
    return {
      p1: { n: 1, v: 7 },
      p2: { n: 2, v: 9 },
      promisedFirst,
      promised2,
      accepted1,
      ignored,
      accepted2,
      won: accepted2.length >= D7.MAJ(names.length) ? 2 : 1,
      retry: { n: 3, v: 9 },
    };
  })();
  D7.same(
    "duel: P1 gets promises 1 from A B C, P2's number 2 is promised by B C D E, P1's ACCEPT(1) is ignored by B and C, P2 wins with four",
    [D7.DUEL.promisedFirst, D7.DUEL.promised2, D7.DUEL.accepted1, D7.DUEL.ignored, D7.DUEL.accepted2, D7.DUEL.won],
    [["A", "B", "C"], ["B", "C", "D", "E"], ["A"], ["B", "C"], ["B", "C", "D", "E"], 2],
  );

  // a promise reports an earlier accepted value: the proposer must re-propose the value with the highest number
  D7.SAFE = (() => {
    const st = fresh();
    ["A", "B"].forEach((k) => {
      D7.prepare(st[k], 1);
      D7.accept(st[k], 1, 7);
    });
    const quorum = ["B", "C", "D"];
    const reports = Object.fromEntries(quorum.map((k) => [k, D7.prepare(st[k], 2).report]));
    return {
      p1: { n: 1, v: 7 },
      onlyAB: ["A", "B"],
      p2: {
        n: 2,
        own: 9,
        quorum,
        reports,
        sends: D7.pick(
          9,
          quorum.map((k) => reports[k]),
        ),
      },
    };
  })();
  D7.same(
    "safety: B reports (1, 7), C and D report nothing, so P2 must send 7, not its own 9",
    [D7.SAFE.p2.reports, D7.SAFE.p2.sends],
    [{ B: { n: 1, v: 7 }, C: null, D: null }, 7],
  );

  // a log with one round per entry
  D7.LOG = (() => {
    const entries = [
      { pos: 1, n: 1, v: 50 },
      { pos: 2, n: 2, v: -20 },
    ];
    return { start: 100, entries, balance: entries.reduce((s, e) => s + e.v, 100) };
  })();
  D7.same("log: 100 + 50 - 20 = 130", [D7.LOG.balance, D7.LOG.entries.map((e) => e.n)], [130, [1, 2]]);

  // ---------- 3. the rig ----------
  const ACC_X = 360;
  const ACC_W = 250;
  const ACC_H = 92;
  const ACC_Y = (k) => 22 + k * (ACC_H + 16);
  D7.rig = (parent, o = {}) => {
    const { proposers = 1, learners = true } = o;
    const svg = D4.svg(parent);
    const pos = {
      prop: (i) => ({ x: 127, y: proposers === 1 ? 320 : i === 0 ? 150 : 490 }),
      acc: (k) => ({ x: ACC_X + ACC_W / 2, y: ACC_Y(k) + ACC_H / 2 }),
      learn: { x: 812, y: 320 },
    };
    const edge = {
      propOut: (i) => ({ x: 242, y: pos.prop(i).y }),
      accIn: (k) => ({ x: ACC_X, y: pos.acc(k).y }),
      accOut: (k) => ({ x: ACC_X + ACC_W, y: pos.acc(k).y }),
      learnIn: { x: 700, y: 320 },
    };
    const wire = Array.from({ length: proposers }, (_, i) =>
      D7.ACCS.map((_, k) =>
        D4.wire(svg, {
          pts: [
            [edge.propOut(i).x, edge.propOut(i).y],
            [edge.accIn(k).x, edge.accIn(k).y],
          ],
          tone: "grey",
          w: 4,
        }),
      ),
    );
    const prop = Array.from({ length: proposers }, (_, i) =>
      D4.card(parent, { x: 12, y: pos.prop(i).y - 60, w: 230, h: 120, text: "", tone: "blue", plain: false }),
    );
    const acc = D7.ACCS.map((_, k) =>
      D4.card(parent, { x: ACC_X, y: ACC_Y(k), w: ACC_W, h: ACC_H, text: "", tone: "grey", plain: false }),
    );
    const learn = learners
      ? D4.card(parent, { x: 700, y: 240, w: 224, h: 160, text: "", tone: "grey", plain: false })
      : null;
    return { svg, prop, acc, learn, pos, edge, wire };
  };
  D7.card = D4.card;
  D7.packet = D4.packet;
  D7.msg = (parent, text, tone) => D4.packet(parent, { text, tone });
  D7.clamp = clamp;
})();
