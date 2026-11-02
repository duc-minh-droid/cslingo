/* Lecture 8 (ds-8) · scene 8 (DIRECT OR BROKER): lesson 8.2, steps 'Direct messaging' and 'Message brokers'. Two flow rigs
   run the same script: on top the producer sends straight to Consumers A and B (direct messaging); underneath a broker sits in
   the middle. Consumer B is offline from 2.4 to 6.4 while m2 and m3 are sent: directly they are lost to B; the broker keeps them
   (orange in its queue), hands them over when B is back and deletes each message once it is delivered.
   Every packet, chip and crash comes from D8.OFFLINE (simulated and asserted on load); the scene only places tags and the tick.
   Colours: blue = the producer and a message, purple = the broker, green = delivered, orange = waiting in the queue,
   red = lost / offline. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const { direct: DIR, broker: BRK } = D8.OFFLINE;
  const ids = (list) => list.map((x) => `m${x}`);

  // the times the captions and tags lean on, read from the logs
  const T = {
    down: D8.firstMark(DIR, "crash", null, 1),
    lost: D8.firstMark(DIR, "lost", 3, 1),
    up: D8.firstMark(BRK, "up", null, 1),
    held: D8.firstMark(BRK, "got", 3, 1),
    m4: D8.firstMark(BRK, "got", 4, 1),
  };
  D8.same(
    "broker scene: B is offline 2.4-6.4; directly it loses m2 and m3, via the broker it gets all four and the queue ends empty",
    [
      T.down,
      T.up,
      ids(DIR.end.cons[1].lost),
      ids(DIR.end.cons[1].got),
      ids(BRK.end.cons[1].got),
      BRK.end.queue.length,
      T.lost,
      T.held,
      T.m4,
    ],
    [2.4, 6.4, ["m2", "m3"], ["m1", "m4"], ["m1", "m2", "m3", "m4"], 0, 4.6, 7.3, 9.4],
  );
  const lostTxt = ids(DIR.end.cons[1].lost).join(" and ");
  const TAG = { lost: 4.9, done: 9.6 };

  V.scene({
    kicker: "DIRECT OR BROKER",
    title: ["A broker holds", "the messages"],
    dur: 12,
    caps: [
      [1.0, 2.3, "m1 goes to A and B either way."],
      [2.5, 4.6, "Then consumer B goes offline."],
      [4.8, 6.3, `Sent directly, ${lostTxt} are lost to B.`],
      [6.5, 8.6, "The broker kept them and hands them over."],
      [8.8, 11.6, "With a broker, consumers can come and go."],
    ],
    build(stage) {
      const names = { consNames: ["Consumer A", "Consumer B"], prodNames: ["Producer"] };
      const top = D8.flow(stage, DIR, { box: { y: 40, h: 270 }, ...names });
      const bot = D8.flow(stage, BRK, { box: { y: 360, h: 280 }, ...names });

      const tagDirect = D4.tag(stage, { x: 97, y: 22, text: "direct", tone: "grey" });
      const tagBroker = D4.tag(stage, { x: 110, y: 344, text: "via a broker", tone: "purple", solid: true });
      const tagLost = D4.tag(stage, { x: 330, y: 274, text: "lost to B", tone: "red", solid: true });
      const tagDel = D4.tag(stage, { x: 420, y: 372, text: "deleted once delivered", tone: "purple" }); // over the broker

      const fx = D4.svg(stage);
      const bB = bot.cons[1];
      const tick = fx.appendChild(L5.tick(bB.x + bB.w - 6, bB.y + 6, 44, "green", { w: 8 }));

      return (t) => {
        const k = ramp(t, 0.3, 0.8, E.lin);
        const wiresK = ramp(t, 0.4, 0.9, E.out);
        top.set(t, { k, wiresK });
        bot.set(t, { k, wiresK, broker: { bump: flash(t, T.up, T.up + 0.5) } });
        // fan-out: a message A already has still waits (orange) in the queue until it is on its way to B
        const { s, fly } = bot.at(t);
        const toB = (id) => fly.some((h) => h.id === id && h.to === "C1");
        s.queue.forEach((m, i) => {
          if (m.status === "out" && !toB(m.id)) bot.qrow.set(i, { text: m.text, tone: "orange", solid: true });
        });

        const tk = E.out(ramp(t, 0.3, 0.7));
        tagDirect.set({ k: tk });
        tagBroker.set({ k: tk });
        tagLost.set({ k: E.pop(ramp(t, TAG.lost, TAG.lost + 0.4)) });
        tagDel.set({ k: E.pop(ramp(t, TAG.done, TAG.done + 0.4)) });
        const kk = E.pop(ramp(t, TAG.done, TAG.done + 0.4));
        V.place(tick, { s: 0.4 + 0.6 * kk, o: Math.min(1, kk * 3) });
      };
    },
  });
})();
