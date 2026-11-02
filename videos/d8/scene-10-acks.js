/* Lecture 8 · Stream processing, scene 10 (ACKNOWLEDGEMENTS): a consumer acks a message when it has finished it; a message
   that is never acked (its consumer crashed) is delivered again, and with load balancing that changes the order.
   Story (local seconds, all from the D8.ACKS log): m1 -> Consumer 2 and m2 -> Consumer 1 arrive 1.8 / 2.1, acks fly 2.6-3.5,
   m3 -> Consumer 2 and m4 -> Consumer 1 arrive 4.8 / 5.1, Consumer 2 crashes at 5.6 (noticed 6.4: m3 waits orange in the queue,
   the broker bumps), Consumer 1 acks m4 7.4-8.0, m3 is redelivered to Consumer 1 8.0-8.6, acked 10.0-10.6, m5 delivered
   10.6-11.2 and acked 12.4-13.0. Extra: key row pops at 0.6 / 2.6 / 6.4; 10.4-11.0 an orange ring on Consumer 1's m3 chip
   and an orange arrow curling from m3 back over m4; 12.6 Consumer 1's chip row bumps. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const L = D8.ACKS;
  const ids = (a) => a.map((x) => `m${x}`);
  D8.same(
    "scene 10: Consumer 1 does m2, m4, m3, m5; Consumer 2 only m1; crash 5.6, noticed 6.4, redelivered 8.0",
    [ids(L.end.cons[0].done), ids(L.end.cons[1].done), L.times.crash, L.times.noticed, L.times.redeliver],
    [["m2", "m4", "m3", "m5"], ["m1"], 5.6, 6.4, 8],
  );
  const T = L.times;
  const FIRST = L.hops.find((h) => h.kind === "deliver").t0; // when the first message leaves the broker
  const M3 = L.end.cons[0].done.indexOf(3); // m3's place in Consumer 1's row (after m4)
  const M4 = L.end.cons[0].done.indexOf(4);
  D8.same("scene 10: m3 sits right after m4 in Consumer 1's row", [M4, M3], [1, 2]);

  V.scene({
    kicker: "ACKNOWLEDGEMENTS",
    title: ["No ack?", "Deliver it again"],
    dur: 14.5,
    caps: [
      [FIRST, 2.4, "m1 goes to Consumer 2, m2 to Consumer 1."],
      [2.6, 4, "Each sends an ack when it is done."],
      [4.2, 5.5, "Then m3 and m4 go out."],
      [T.crash + 0.1, 7.8, "Consumer 2 crashes: no ack for m3."],
      [T.redeliver, 10, "So the broker delivers m3 again."],
      [10.4, 12.4, "Consumer 1 did m4 before m3."],
      [12.6, 14.2, "Redelivery can change the order."],
    ],
    build(stage) {
      const fl = D8.flow(stage, L, { box: { y: 20, h: 500 }, prodNames: ["Producer"] });

      const keys = [
        ["no ack yet", "blue", 160, 0.6, false], // tinted like the handed-out chips in the broker's queue
        ["acked", "green", 420, 2.6, true],
        ["redelivered", "orange", 690, T.noticed, true],
      ].map(([text, tone, x, at, solid]) => ({ tag: D4.tag(stage, { x, y: 500, text, tone, solid }), at }));

      // the order arrow: from m3 (third chip) curling back over m4 (second chip) of Consumer 1
      const row = fl.crow[0];
      const a = row.top(M3);
      const b = row.top(M4);
      const top = D4.svg(stage);
      const arrow = top.appendChild(
        L5.arrow(a.x + 6, a.y - 4, b.x + 2, b.y - 4, "orange", 1, { w: 7, head: 20, bow: -26 }),
      );

      return (t) => {
        fl.set(t, {
          k: ramp(t, 0.3, 0.8, E.lin),
          broker: { bump: flash(t, T.noticed, T.noticed + 0.4) },
        });
        // Consumer 2 crashes holding m3: its m3 chip goes red with the bolt (the rig only does it once the crash is noticed)
        const down = fl.downAt(1, t);
        const lostAt = fl.arrivals(1, t).findIndex((x) => x.id === 3);
        if (down > 0 && lostAt >= 0) {
          fl.crow[1].set(lostAt, {
            text: "m3",
            tone: "red",
            solid: true,
            s: 1 + 0.15 * flash(t, T.crash, T.crash + 0.4),
          });
        }
        // emphasis on Consumer 1's row: m3 ringed orange, the row bumps at the end
        const ring = ramp(t, 10.4, 11.0, E.lin);
        if (ring > 0) {
          const done = fl.at(t).s.cons[0].done.includes(3);
          row.set(M3, { text: "m3", tone: done ? "green" : "blue", solid: done, ring: "orange", ringK: ring });
        }
        V.place(row.el, { s: 1 + 0.08 * flash(t, 12.6, 13.0) });
        const d = ramp(t, 10.4, 11.0, E.lin);
        L5.drawOn(arrow, d);
        V.show(arrow, d > 0 ? 1 : 0);
        keys.forEach(({ tag, at }) => tag.set({ k: ramp(t, at, at + 0.4, E.lin) }));
      };
    },
  });
})();
