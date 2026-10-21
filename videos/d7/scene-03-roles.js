/* Lecture 7 (ds-7) · scene 3 (THREE ROLES): a node can play three roles in Paxos (lesson 7.1): a PROPOSER suggests a value to be
   chosen, ACCEPTORS decide which value is chosen, LEARNERS are told which value was chosen (they take no part in the decision).
   Three panels left to right, the value 7 travels through them: the proposer suggests it, the five acceptors choose it (they turn green),
   the learners are told. Every count comes from D7 (D7.ACCS, D7.R1.v), asserted on load. Colours: blue = the proposer and the value it
   suggests, green = chosen, grey = acceptors and learners at rest, purple = the arrows (the protocol's messages).
   Story (local seconds): 0.3 the three panels pop with their names; 1.2 the role descriptions; 3.0 the value 7 flies from the proposer
   to the acceptors; 4.4 the five acceptors turn green ("chosen"); 5.6 the value flies on to the learners, who show it. Hold. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const VALUE = String(D7.R1.v);
  const OY = 70; // the whole picture sits this far down the stage

  D7.same("roles scene: five acceptors and the value 7", [D7.ACCS.length, VALUE], [5, "7"]);
  const T = { pop: 0.3, popStep: 0.2, desc: 1.2, send: 3.0, sendDur: 0.9, choose: 4.4, tell: 5.6, tellDur: 0.9 };
  const PANEL = [
    { x: 12, name: "Proposer", lines: ["suggests", "a value"] },
    { x: 333, name: "Acceptors", lines: ["decide which", "one is chosen"] },
    { x: 654, name: "Learners", lines: ["are told", "the result"] },
  ];

  V.scene({
    kicker: "THREE ROLES",
    title: ["Proposers suggest,", "acceptors decide"],
    dur: 11,
    caps: [
      [0.6, 3.0, "A node can play three roles."],
      [3.1, 5.1, "Proposers suggest a value."],
      [5.2, 7.5, "Acceptors decide which one is chosen."],
      [7.6, 10.3, "Learners are only told the result."],
    ],
    build(stage) {
      const panels = PANEL.map((p, i) =>
        D4.card(stage, {
          x: p.x,
          y: 150 + OY,
          w: 270,
          h: 200,
          text: "",
          tone: i === 0 ? "blue" : "grey",
          plain: false,
        }),
      );
      const names = PANEL.map((p) =>
        D4.label(stage, { x: p.x + 135, y: 118 + OY, text: p.name, tone: "grey", fs: 34 }),
      );
      const descs = PANEL.map((p) =>
        p.lines.map((l, j) => D4.label(stage, { x: p.x + 135, y: 392 + OY + 36 * j, text: l, tone: "grey", fs: 30 })),
      );
      const svg = D4.svg(stage);
      const proposer = svg.appendChild(D4.person(147, 250 + OY, 90, "blue"));
      const learners = [624 + 90, 624 + 190].map((x) => svg.appendChild(D4.person(x + 70, 270 + OY, 70, "grey")));
      const arrows = [
        svg.appendChild(L5.arrow(286, 250 + OY, 330, 250 + OY, "purple", 1, { w: 8, head: 20 })),
        svg.appendChild(L5.arrow(607, 250 + OY, 651, 250 + OY, "purple", 1, { w: 8, head: 20 })),
      ];
      // five acceptors as discs: three above, two below
      const SPOT = [
        { x: 396, y: 205 + OY },
        { x: 468, y: 205 + OY },
        { x: 540, y: 205 + OY },
        { x: 432, y: 267 + OY },
        { x: 504, y: 267 + OY },
      ];
      const discs = D7.ACCS.map((k, i) =>
        D4.disc(stage, { x: SPOT[i].x, y: SPOT[i].y, size: 60, text: k, tone: "grey" }),
      );
      const chip = D4.packet(stage, { text: VALUE, tone: "blue" });
      const chipLearn = learners.map((_, i) => D4.packet(stage, { text: VALUE, tone: "green" }));
      const chosen = D4.tag(stage, { x: 468, y: 326 + OY, text: `chosen: ${VALUE}`, tone: "green", solid: true });

      return (t) => {
        panels.forEach((p, i) => {
          const k = ramp(t, T.pop + T.popStep * i, T.pop + T.popStep * i + 0.5, E.lin);
          p.set({ k });
          names[i].set({ k });
          descs[i].forEach((d) => d.set({ k: ramp(t, T.desc + 0.15 * i, T.desc + 0.15 * i + 0.4, E.lin) }));
        });
        V.place(proposer, {
          s: 0.6 + 0.4 * E.pop(ramp(t, T.pop, T.pop + 0.5, E.lin)),
          o: ramp(t, T.pop, T.pop + 0.4, E.lin),
        });
        learners.forEach((l, i) =>
          V.place(l, {
            s: 0.6 + 0.4 * E.pop(ramp(t, T.pop + 0.4, T.pop + 0.9, E.lin)),
            o: ramp(t, T.pop + 0.4, T.pop + 0.8, E.lin),
          }),
        );
        arrows.forEach((a, i) => {
          const k = ramp(t, T.pop + 0.8 + 0.2 * i, T.pop + 1.2 + 0.2 * i, E.lin);
          L5.drawOn(a, k);
          V.show(a, k > 0 ? 1 : 0);
        });
        discs.forEach((d, i) => {
          const k = ramp(t, T.pop + 0.3 + 0.08 * i + 0.2, T.pop + 0.7 + 0.08 * i + 0.2, E.lin);
          const green = t >= T.choose + 0.12 * i;
          d.set({
            k,
            tone: green ? "green" : "grey",
            s: green ? 1 + 0.15 * flash(t, T.choose + 0.12 * i, T.choose + 0.12 * i + 0.3) : 1,
          });
        });
        // the value suggested: proposer -> acceptors
        const f = E.inOut(ramp(t, T.send, T.send + T.sendDur, E.lin));
        const p = D4.at({ x: 147, y: 330 + OY }, { x: 468, y: 330 + OY }, f, 0);
        chip.set({ x: p.x, y: p.y, k: t >= T.send && t < T.choose ? 1 : 0 });
        chosen.set({ k: ramp(t, T.choose + 0.5, T.choose + 0.9, E.lin) });
        // the value told: acceptors -> learners
        chipLearn.forEach((c, i) => {
          const g = E.inOut(ramp(t, T.tell + 0.15 * i, T.tell + 0.15 * i + T.tellDur, E.lin));
          const q = D4.at({ x: 560, y: 330 + OY }, { x: 745 + 80 * i, y: 330 + OY }, g, 0);
          c.set({ x: q.x, y: q.y, k: t >= T.tell + 0.15 * i ? 1 : 0 });
        });
      };
    },
  });
})();
