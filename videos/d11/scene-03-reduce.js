/* Lecture 11 (ds-11) · scene 3 (REDUCE AND ALL-REDUCE): a reduce sums the numbers spread over C1..C4 (3, 5, 2, 6) and puts the
   total 16 on ONE machine, B (4 messages); an all-reduce puts the same 16 on ALL four machines: a reduce, then the answer is sent
   back to everyone (8 messages). The purple + hub is the same one scene 6 uses for the gradients (lesson 11.1, D11.PAT).
   Story (local seconds): 0.2 the four machines; 1.4 reduce (the sum climbs 3, 8, 10, 16); 3.9 16 lands on B only;
   6.2 B leaves; 6.8 all-reduce: the numbers come in again, 8.1 16 goes back out to every machine. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const P = D11.PAT;
  const fm = D11.fm;
  D11.same("reduce: four in, all-reduce: four in and four out", [P.msgs.reduce, P.msgs.all], [4, 8]);
  D11.same("reduce running sum", P.running, [3, 8, 10, 16]);

  const T = {
    pop: 0.2,
    hub: 0.8,
    wires: [1.0, 1.4],
    in1: 1.4, // packet i leaves at in1 + 0.55 i, 0.55 s
    step1: 0.55,
    toB: [3.9, 4.5],
    count1: 4.7,
    onB: 4.9,
    own: [5.2, 5.8],
    out: [6.2, 6.7],
    in2: 6.8, // faster: from in2 + 0.25 i, 0.5 s
    step2: 0.25,
    dur2: 0.5,
    back: [8.1, 8.9],
    count2: 9.1,
    onAll: 9.4,
  };
  const land1 = (i) => T.in1 + T.step1 * (i + 1);
  const land2 = (i) => T.in2 + T.step2 * i + T.dur2;
  const n = P.vals.length;
  const list = P.vals
    .map(fm)
    .join(", ")
    .replace(/, (\S+)$/, " and $1");

  V.scene({
    kicker: "REDUCE AND ALL-REDUCE",
    title: ["Sum onto one machine,", "or onto all of them"],
    dur: 12,
    caps: [
      [0.4, 2.4, `C1 to C4 each hold a number: ${list}.`],
      [2.6, 4.6, `Reduce sums them: ${P.running.map(fm).join(", ")}.`],
      [4.8, 6.4, `Only B gets the total, ${fm(P.sum)}. Four messages.`],
      [6.8, 8.8, "All-reduce sums the same four numbers."],
      [9.2, 11.7, `Then ${fm(P.sum)} goes back to every machine. Eight messages.`],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const CY = [12, 166, 320, 474]; // h 146: tall enough for the server icon
      const cOut = CY.map((y) => ({ x: 242, y: y + 73 }));
      const HL = { x: 413, y: 320 };
      const HR = { x: 523, y: 320 };
      const BL = { x: 694, y: 320 };
      const wC = cOut.map((p) => D4.wire(svg, { pts: [p, HL] }));
      const wB = D4.wire(svg, { pts: [HR, BL] });

      const C = CY.map((y, i) =>
        D4.node(stage, { x: 12, y, w: 230, h: 146, name: `C${i + 1}`, value: fm(P.vals[i]), icon: "server" }),
      );
      const hub = D4.disc(stage, { x: 468, y: 320, size: 110, text: "+", tone: "purple" });
      const B = D4.node(stage, { x: 694, y: 245, w: 230, h: 150, name: "B", value: "", icon: "server" });
      const run = D4.tag(stage, { x: 468, y: 220, text: "", tone: "purple", fs: 32 });
      const count = D4.tag(stage, { x: 468, y: 440, text: "", tone: "purple" });
      const onB = D4.tag(stage, { x: 809, y: 450, text: "result on B only", tone: "green" });
      const onAll = D4.tag(stage, { x: 468, y: 600, text: "result on all four", tone: "green", solid: true });

      const in1 = P.vals.map((v) => D4.packet(stage, { text: fm(v), tone: "purple" }));
      const in2 = P.vals.map((v) => D4.packet(stage, { text: fm(v), tone: "purple" }));
      const toB = D4.packet(stage, { text: fm(P.sum), tone: "purple" });
      const back = P.vals.map(() => D4.packet(stage, { text: fm(P.sum), tone: "purple" }));

      // how many numbers have reached the hub in a pass (0..4)
      const arrived = (t, land) => P.vals.reduce((a, _, i) => a + (t >= land(i) ? 1 : 0), 0);

      return (t) => {
        const k = (i) => D11.seq(t, T.pop, 0.12, 0.5, i);
        const allOut = ramp(t, T.out[0], T.out[1], E.lin);
        const second = t >= T.out[1];
        const gotAll = t >= T.back[1];

        C.forEach((c, i) =>
          c.set({
            k: k(i),
            value: gotAll ? fm(P.sum) : fm(P.vals[i]),
            vtone: gotAll ? "green" : "blue",
            ring: i === 2 && !second ? "grey" : undefined, // C3 still holds only its own number
            ringK: i === 2 && !second ? flash(t, T.own[0], T.own[1]) : 0,
            bump: flash(t, T.back[1], T.back[1] + 0.3) + (i === 2 ? flash(t, T.own[0], T.own[0] + 0.3) : 0),
          }),
        );
        const hk = ramp(t, T.hub, T.hub + 0.4, E.lin);
        const hits = second ? arrived(t, land2) : arrived(t, land1);
        const hitAt = second ? land2 : land1;
        const hubBump = P.vals.reduce((a, _, i) => a + flash(t, hitAt(i), hitAt(i) + 0.25), 0);
        hub.set({ k: hk, s: 1 + 0.1 * hubBump });
        const gotB = t >= T.toB[1];
        B.set({
          k: hk,
          o: 1 - allOut,
          value: gotB ? fm(P.sum) : "",
          vtone: "green",
          ring: "green",
          ringK: ramp(t, T.toB[1], T.toB[1] + 0.4, E.lin),
          bump: flash(t, T.toB[1], T.toB[1] + 0.3),
        });
        wC.forEach((w, i) => w.set({ k: E.out(D11.seq(t, T.wires[0], 0.08, 0.4, i)) }));
        wB.set({ k: E.out(ramp(t, T.wires[0], T.wires[1], E.lin)), o: 1 - allOut });

        // the running sum on the hub
        run.set({
          k: hits ? (second ? 1 : 1 - allOut) : 0,
          text: hits ? `sum = ${fm(P.running[hits - 1])}` : "",
          s: 1 + 0.12 * hubBump,
        });

        // reduce: four numbers in, the total out to B only
        in1.forEach((pk, i) => D11.fly(pk, cOut[i], HL, ramp(t, T.in1 + T.step1 * i, land1(i), E.inOut)));
        D11.fly(toB, HR, BL, ramp(t, T.toB[0], T.toB[1], E.inOut));

        // all-reduce: the same four numbers in, then the total back out along every wire
        in2.forEach((pk, i) => D11.fly(pk, cOut[i], HL, ramp(t, T.in2 + T.step2 * i, land2(i), E.inOut)));
        back.forEach((pk, i) => D11.fly(pk, HL, cOut[i], ramp(t, T.back[0], T.back[1], E.inOut)));

        // counters and result tags
        const c2 = t >= T.count2;
        count.set({
          k: c2 ? 1 : t >= T.count1 ? 1 - allOut : 0,
          text: c2 ? `${P.msgs.all} messages: ${n} in, ${n} out` : `${P.msgs.reduce} messages`,
          s: 1 + 0.12 * (flash(t, T.count1, T.count1 + 0.3) + flash(t, T.count2, T.count2 + 0.3)),
        });
        onB.set({ k: ramp(t, T.onB, T.onB + 0.4, E.lin) * (1 - allOut) });
        onAll.set({ k: ramp(t, T.onAll, T.onAll + 0.4, E.lin) });
      };
    },
  });
})();
