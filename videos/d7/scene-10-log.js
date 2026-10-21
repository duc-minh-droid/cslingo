/* Lecture 7 (ds-7) · scene 10 (A LOG OF ROUNDS): a replicated system runs one Paxos round for every entry of its log, so every
   replica ends up with the same entries in the same order (lesson 7.2). Round 1 (number 1) chooses +50, round 2 (number 2)
   chooses -20; three replicas start at 100 and all end at 130. Every entry comes from D7.LOG (asserted on load). Colours: purple =
   the protocol messages of a round, green = chosen and the entries that are decided, grey = empty slots.
   Story (local seconds): 0.3 the round chips and the three replica logs pop; 1.0 round 1 lights up (PREPARE 1, ACCEPT 1, chosen)
   and +50 lands in slot 1 of every replica at 2.4, the balance becomes 150 at 3.0; 4.6 round 2 starts, -20 lands in slot 2 at 6.2,
   the balance becomes 130 at 6.8. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const { ramp, flash, ease: E } = V;
  const LOG = D7.LOG;
  const fmt = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v)}`;
  const ENTRY = LOG.entries.map((e) => fmt(e.v));
  const BAL = LOG.entries.reduce((acc, e) => [...acc, acc[acc.length - 1] + e.v], [LOG.start]);

  D7.same(
    "log scene: two rounds choose +50 and -20, the balance goes 100, 150, 130",
    [LOG.entries.map((e) => e.n), ENTRY, BAL],
    [
      [1, 2],
      ["+50", "−20"],
      [100, 150, 130],
    ],
  );
  const REPLICAS = ["Replica 1", "Replica 2", "Replica 3"];
  const RT = [
    { reset: 0.3, lit: [1.0, 1.6, 2.2], slots: 2.4, bal: 3.0 },
    { reset: 4.6, lit: [4.8, 5.4, 6.0], slots: 6.2, bal: 6.8 },
  ];

  V.scene({
    kicker: "A LOG OF ROUNDS",
    title: ["One Paxos round", "per log entry"],
    dur: 12.5,
    caps: [
      [0.5, 3.0, "Each log entry is one Paxos round."],
      [3.2, 5.3, `Round 1 chose ${ENTRY[0]}: ${BAL[0]} → ${BAL[1]}.`],
      [7.0, 9.2, `Round 2 chose ${ENTRY[1]}: ${BAL[1]} → ${BAL[2]}.`],
      [9.4, 11.8, "Every replica gets the same order."],
    ],
    build(stage) {
      const rounds = D4.chips(stage, {
        x: 148,
        y: 100,
        n: 3,
        w: 200,
        h: 64,
        gap: 20,
        texts: ["", "", ""],
        fs: 28,
        tone: "grey",
      });
      const slotLab = [0, 1].map((j) =>
        D4.label(stage, { x: 250 + 75 + j * 170, y: 222, text: `slot ${j + 1}`, tone: "grey", fs: 28 }),
      );
      const names = REPLICAS.map((r, i) =>
        D4.label(stage, { x: 12, y: 300 + i * 100, text: r, tone: "grey", fs: 30, anchor: "l" }),
      );
      const logs = REPLICAS.map((_, i) =>
        D4.chips(stage, {
          x: 250,
          y: 266 + i * 100,
          n: 2,
          w: 150,
          h: 68,
          gap: 20,
          texts: ENTRY,
          fs: 34,
          tone: "green",
        }),
      );
      const bal = D4.tag(stage, { x: 790, y: 400, text: `balance: ${BAL[0]}`, tone: "grey", fs: 32 });

      return (t) => {
        const pk = ramp(t, RT[0].reset, RT[0].reset + 0.5, E.lin);
        const rd = t >= RT[1].reset ? 1 : 0;
        const r = RT[rd];
        const n = LOG.entries[rd].n;
        rounds.all((i) => {
          const lit = t >= r.lit[i];
          return {
            o: pk,
            text: [`PREPARE ${n}`, `ACCEPT ${n}`, "chosen"][i],
            tone: lit ? (i === 2 ? "green" : "purple") : "grey",
            solid: lit,
            s: lit ? 1 + 0.1 * flash(t, r.lit[i], r.lit[i] + 0.3) : 1,
          };
        });
        slotLab.forEach((l, j) => l.set({ k: ramp(t, 0.6 + 0.1 * j, 1.0 + 0.1 * j, E.lin) }));
        names.forEach((l, i) => l.set({ k: ramp(t, 0.5 + 0.1 * i, 0.9 + 0.1 * i, E.lin) }));
        logs.forEach((row, i) => {
          const pop = ramp(t, 0.5 + 0.1 * i, 0.9 + 0.1 * i, E.lin);
          row.all((j) => {
            const at = RT[j].slots + 0.15 * i;
            const k = ramp(t, at, at + 0.4, E.lin);
            return k > 0 ? { o: pop, solid: true, s: 0.7 + 0.3 * E.pop(k) } : { o: pop, ghost: true, text: "" };
          });
        });
        const step = t >= RT[1].bal ? 2 : t >= RT[0].bal ? 1 : 0;
        const at = [0, RT[0].bal, RT[1].bal][step];
        bal.set({
          k: ramp(t, 0.9, 1.3, E.lin),
          text: `balance: ${BAL[step]}`,
          tone: step === 2 ? "green" : "grey",
          solid: step === 2,
          s: step ? 1 + 0.12 * flash(t, at, at + 0.3) : 1,
        });
      };
    },
  });
})();
