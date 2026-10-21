/* Lecture 7 (ds-7) · scene 2 (WHY PAXOS): lecture 6's two-phase commit needs a yes from EVERY node, so one crashed node stalls it;
   Paxos is a consensus algorithm (Lamport, 1989) that needs only a MAJORITY to agree: with five acceptors, three are enough and two
   may crash (lesson 7.1). Two rows of five nodes: in the first one node is down and the coordinator waits for it; in the second
   two nodes are down and the three left still reach agreement. Every count comes from D7.QUORUM (asserted on load). Colours: green
   = said yes / agreed, red = crashed or stuck, grey = a node that has not answered, blue = the value agreed.
   Story (local seconds): 0.3 both rows pop; 1.0 the four live nodes of row 1 say yes one after another, node E crashes at 2.4 and
   "stuck: waiting for E" pops; 4.6 row 2: A, B and C say yes, D and E are down, "chosen with 3 of 5" pops. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const Q = D7.QUORUM;

  D7.same(
    "why scene: five nodes, two-phase commit needs 5, a majority needs 3, two may crash",
    [Q.n, Q.n, Q.need, Q.maxDown],
    [5, 5, 3, 2],
  );
  const NAMES = D7.ACCS;
  const T = { pop: 0.3, yes: 1.0, yesStep: 0.35, crash: 2.4, stuck: 3.2, row2: 4.6, chosen: 7.0 };

  V.scene({
    kicker: "WHY PAXOS",
    title: ["Two-phase commit", "needs everyone"],
    dur: 10,
    caps: [
      [0.6, 3.2, "Two-phase commit needs all five to say yes."],
      [3.4, 5.8, "One crash and it is stuck waiting."],
      [6.0, 8.5, `Paxos needs a majority: ${Q.need} of ${Q.n}.`],
      [8.6, 9.9, `${Q.maxDown} may crash.`],
    ],
    build(stage) {
      const x0 = 128;
      const rowChips = (y) =>
        D4.chips(stage, { x: x0, y, n: 5, w: 120, h: 84, gap: 20, texts: NAMES, fs: 40, tone: "grey" });
      const rowA = rowChips(120);
      const rowB = rowChips(400);
      const headA = D4.tag(stage, { x: 468, y: 62, text: `two-phase commit: all ${Q.n} must agree` });
      const headB = D4.tag(stage, { x: 468, y: 346, text: `Paxos: ${Q.need} of ${Q.n} must agree`, tone: "purple" });
      const stuck = D4.tag(stage, { x: 468, y: 252, text: "stuck: waiting for E", tone: "red", solid: true });
      const chosen = D4.tag(stage, {
        x: 468,
        y: 548,
        text: `chosen with ${Q.need} of ${Q.n}`,
        tone: "green",
        solid: true,
      });
      const top = D4.svg(stage);
      const boltA = top.appendChild(D4.bolt(rowA.mid(4).x, rowA.mid(4).y, 70, "red"));
      const boltB = [3, 4].map((i) => top.appendChild(D4.bolt(rowB.mid(i).x, rowB.mid(i).y, 70, "red")));
      const tickB = top.appendChild(L5.tick(rowB.mid(2).x + 190, 548, 40, "green", { ink: true, w: 8 }));

      return (t) => {
        const k = ramp(t, T.pop, T.pop + 0.5, E.lin);
        headA.set({ k });
        headB.set({ k: ramp(t, T.row2 - 0.4, T.row2, E.lin) });
        // row 1: four yes votes, then E crashes
        rowA.all((i) => {
          const yesAt = T.yes + T.yesStep * i;
          const dead = i === 4 && t >= T.crash;
          const yes = i < 4 && t >= yesAt;
          return {
            o: k,
            tone: dead ? "red" : yes ? "green" : "grey",
            solid: yes || dead,
            s: yes ? 1 + 0.12 * flash(t, yesAt, yesAt + 0.3) : 1,
          };
        });
        const bk = ramp(t, T.crash, T.crash + 0.25, E.lin);
        V.place(boltA, { s: 0.5 + 0.5 * E.pop(bk), o: bk * (1 - ramp(t, T.crash + 0.6, T.crash + 0.9, E.lin)) });
        stuck.set({ k: ramp(t, T.stuck, T.stuck + 0.4, E.lin) });
        // row 2: A, B, C say yes, D and E are down
        const k2 = ramp(t, T.row2 - 0.4, T.row2, E.lin);
        rowB.all((i) => {
          const at = T.row2 + 0.4 * i;
          const dead = i >= 3 && t >= T.row2 + 0.3;
          const yes = i < 3 && t >= at + 0.6;
          return {
            o: k2,
            tone: dead ? "red" : yes ? "green" : "grey",
            solid: yes || dead,
            s: yes ? 1 + 0.12 * flash(t, at + 0.6, at + 0.9) : 1,
          };
        });
        boltB.forEach((b, i) => {
          const f = ramp(t, T.row2 + 0.3 + 0.15 * i, T.row2 + 0.55 + 0.15 * i, E.lin);
          V.place(b, { s: 0.5 + 0.5 * E.pop(f), o: f * (1 - ramp(t, T.row2 + 1.3, T.row2 + 1.6, E.lin)) });
        });
        chosen.set({ k: ramp(t, T.chosen, T.chosen + 0.4, E.lin) });
        const tk = ramp(t, T.chosen, T.chosen + 0.4, E.lin);
        L5.drawOn(tickB, tk);
        V.place(tickB, { s: 0.6 + 0.4 * E.pop(tk), o: tk });
      };
    },
  });
})();
