/* Lecture 6 · scene 04 (atomic): moving £30 from Asha to Ben is two writes. With no transaction a crash between them loses
   the £30 (total 120); inside one transaction the debit is rolled back (total 150). Two panels, one story each. Every number
   comes from D6.BANK (asserted in common.js). */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const B = D6.BANK;
  const money = (n) => `£${n}`;

  // the facts this scene draws, checked once more where they are used
  D6.same(B.plain.asha, B.afterDebit.asha, "scene 4: the crash leaves the debit in place");
  D6.same(B.plain.total, B.afterDebit.asha + B.afterDebit.ben, "scene 4: total after the crash");
  D6.same(B.atomic.asha, B.asha, "scene 4: rollback restores Asha");
  D6.same(B.atomic.total, B.total, "scene 4: the total stays");

  const ARROW_Y = 177;
  const MID = 244; // where the packet is when the crash hits (offset from the panel's left edge)
  const START = 202; // where the packet leaves Asha

  /* One panel. px = its left edge, atomic = inside a transaction, T = its event times (seconds). */
  function panel(stage, px, atomic, T) {
    const card = D6.card(stage, { x: px, y: 12, w: 444, h: 556, plain: true });
    const tag = D6.tag(stage, {
      x: px + 16,
      y: 28,
      text: atomic ? "one transaction" : "no transaction",
      tone: atomic ? "purple" : "grey",
    });
    const arrowLayer = L5.svg(stage);
    const arrow = L5.arrow(px + 164, ARROW_Y, px + 280, ARROW_Y, "grey", 1, { w: 7, head: 22 });
    arrowLayer.append(arrow);
    const asha = D6.box(stage, { x: px + 14, y: 102, w: 140, h: 140, name: "Asha", tone: "grey", vfs: 48 });
    const ben = D6.box(stage, { x: px + 290, y: 102, w: 140, h: 140, name: "Ben", tone: "grey", vfs: 48 });
    const bracket = atomic ? D6.bracket(stage, { x: px + 6, y: 260, w: 432, h: 80, tone: "purple" }) : null;
    const chip1 = D6.chip(stage, { x: px + 14, y: 270, w: 140, h: 60, text: "1 debit", fs: 28, radius: 20 });
    const chip2 = D6.chip(stage, { x: px + 290, y: 270, w: 140, h: 60, text: "2 credit", fs: 28, radius: 20 });
    const total = D6.stat(stage, { x: px + 22, y: 364, w: 400, h: 80, label: "total", tone: "blue" });
    const badge = L5.badge(stage, {
      x: px + 22,
      y: 472,
      w: 400,
      h: 68,
      valid: "all or nothing",
      invalid: money(B.amount) + " vanished",
    });
    const pk = D6.packet(stage, { tone: "blue", text: money(B.amount), fs: 28 });
    const top = L5.svg(stage);
    const bolt = D6.bolt(px + MID, 121, 62, "red");
    const cross = L5.cross(px + MID, ARROW_Y, 56, "red");
    top.append(bolt, cross);

    return (t) => {
      const kp = (i) => D6.seq(t, T.pop, 0.06, 0.5, i);
      card.set({ k: kp(0) });
      tag.set({ k: kp(1) });
      L5.drawOn(arrow, kp(2));
      if (bracket) bracket.set({ k: kp(5) });

      // phases of the story
      const deb = ramp(t, T.debit[0], T.debit[1], E.inOut); // the packet leaves Asha and runs to the crash point
      const dKey = ramp(t, T.debit[0], T.debit[1]); // Asha's number follows the debit
      const crash = clamp((t - T.bolt) / 0.4);
      const die = ramp(t, T.die[0], T.die[1]); // plain: the packet is lost
      const rb = ramp(t, T.rollback[0], T.rollback[1], E.inOut); // atomic: the packet runs back
      const undone = atomic && t >= T.rollback[1];

      // Asha and Ben
      let aVal = B.asha;
      let aTone = "grey";
      if (t >= T.debit[0]) aVal = D6.lerpN(B.asha, B.afterDebit.asha, dKey);
      if (t >= T.debit[1]) aTone = "green";
      if (atomic && t >= T.rollback[0]) {
        aVal = D6.lerpN(B.afterDebit.asha, B.atomic.asha, ramp(t, T.rollback[0] + 0.2, T.rollback[1]));
        aTone = t >= T.rollback[0] + 0.2 ? "orange" : "green";
      }
      const aBump =
        flash(t, T.debit[0] + 0.3, T.debit[1] + 0.2) +
        (atomic ? flash(t, T.rollback[1] - 0.3, T.rollback[1] + 0.2) : 0);
      asha.set({ value: money(aVal), tone: aTone, k: kp(3), s: 1 + 0.06 * aBump });
      ben.set({ value: money(B.ben), tone: "grey", k: kp(4) });

      // the packet carrying the £30
      let px0 = lerp(START, MID, deb);
      let ps = 0.6 + 0.4 * E.pop(ramp(t, T.debit[0], T.debit[0] + 0.3));
      let po = ramp(t, T.debit[0], T.debit[0] + 0.15);
      if (atomic && t >= T.rollback[0]) {
        px0 = lerp(MID, START, rb);
        ps = 1 - 0.35 * ramp(t, T.rollback[1] - 0.25, T.rollback[1]);
        po = 1 - ramp(t, T.rollback[1] - 0.25, T.rollback[1]);
      } else if (!atomic) {
        ps *= 1 - die;
        po *= 1 - die;
      }
      pk.set({ x: px + px0, y: ARROW_Y, s: ps, o: po });

      // the crash
      V.place(bolt, { ...D6.pop(crash), r: -8 * flash(t, T.bolt, T.bolt + 0.25) });
      const cK = !atomic ? ramp(t, T.die[0], T.die[1] - 0.1) : 0;
      V.place(cross, { s: 0.7 + 0.3 * E.pop(cK), o: cK > 0 ? 1 : 0 });
      L5.drawOn(cross, cK);

      // the two steps
      const c1 = atomic && undone ? "orange" : t >= T.debit[1] ? "green" : "grey";
      chip1.set({
        text: undone ? "1 undone" : "1 debit",
        tone: c1,
        k: kp(5),
        s:
          1 +
          0.08 *
            (flash(t, T.debit[1] - 0.1, T.debit[1] + 0.25) +
              (undone ? flash(t, T.rollback[1], T.rollback[1] + 0.3) : 0)),
      });
      chip2.set({
        tone: !atomic && t >= T.chip2 ? "red" : "grey",
        k: kp(6),
        s: 1 + 0.08 * (!atomic ? flash(t, T.chip2, T.chip2 + 0.3) : 0),
      });

      // the total
      const fall = ramp(t, T.total[0], T.total[1]);
      const tVal = !atomic ? D6.lerpN(B.total, B.plain.total, fall) : B.atomic.total;
      const tTone = !atomic ? (t >= T.total[0] ? "red" : "blue") : t >= T.total[0] ? "green" : "blue";
      total.set({ text: money(tVal), tone: tTone, bump: flash(t, T.total[0], T.total[0] + 0.5), k: kp(7) });

      // the verdict
      badge(atomic ? "valid" : "invalid", ramp(t, T.badge[0], T.badge[1], E.out));
    };
  }

  V.scene({
    kicker: "ACID · ATOMIC",
    title: ["A transaction is", "all or nothing"],
    dur: 12.5,
    caps: [
      [0.5, 2.3, "Moving £30 is two writes."],
      [3.0, 4.6, "A crash hits after the debit."],
      [5.0, 6.7, "£30 has vanished."],
      [7.8, 9.6, "One transaction undoes the debit."],
      [9.8, 12.2, "All or nothing: the total stays £150."],
    ],
    build(stage) {
      const left = panel(stage, 12, false, {
        pop: 0.2,
        debit: [2.0, 2.7],
        bolt: 2.9,
        die: [3.4, 3.9],
        rollback: [99, 99],
        chip2: 3.6,
        total: [4.1, 4.8],
        badge: [4.8, 5.2],
      });
      const right = panel(stage, 480, true, {
        pop: 5.9,
        debit: [6.7, 7.2],
        bolt: 7.3,
        die: [99, 99],
        rollback: [7.8, 8.6],
        total: [8.7, 9.1],
        badge: [9.1, 9.5],
      });
      return (t) => {
        left(t);
        right(t);
      };
    },
  });
})();
