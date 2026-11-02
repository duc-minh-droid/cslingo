/* Lecture 8 (ds-8) · scene 9 (MANY CONSUMERS): lesson 8.3, steps 'Two ways to share a topic', 'Load balancing shares the work'
   and 'Fan-out broadcasts'. Two producers send the same four messages (Producer 1: m1 and m3, Producer 2: m2 and m4) through one
   broker to two consumers, twice: with LOAD BALANCING each message goes to one consumer (Consumer 1 gets m2 m4, Consumer 2 gets
   m1 m3: 4 deliveries), with FAN-OUT each message goes to both (8 deliveries). The two runs are two flow rigs over the same
   picture, each in its own container; the scene switches from the first to the second at D8.SHARE.offset.
   Every packet and chip comes from D8.SHARE.lb / .fan (simulated and asserted on load).
   Colours: blue = producers and messages, purple = the broker and the mode tag, green = delivered, grey = neutral. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const { lb: LB, fan: FAN, offset: OFF } = D8.SHARE;
  const ids = (list) => list.map((x) => `m${x}`);
  const delivers = (log) => log.hops.filter((h) => h.kind === "deliver");
  const pubs = (log) => log.hops.filter((h) => h.kind === "pub");
  const first = (list) => Math.min(...list.map((h) => h.t0));
  const last = (list) => Math.max(...list.map((h) => h.t1));

  const T = {
    lbGo: first(delivers(LB)), // the first message leaves the broker for one consumer
    lbDone: last(delivers(LB)),
    fanGo: first(delivers(FAN)),
    fanDone: last(delivers(FAN)),
  };
  const N = { msgs: pubs(LB).length, lb: delivers(LB).length, fan: delivers(FAN).length };
  D8.same(
    "share scene: 4 messages; load balancing 4 deliveries done by 3.8, fan-out 8 done by 9.4; who got what",
    [
      N,
      pubs(FAN).length,
      T.lbGo,
      T.lbDone,
      OFF,
      T.fanGo,
      T.fanDone,
      LB.end.cons.map((c) => ids(c.got)),
      FAN.end.cons.map((c) => ids(c.got)),
    ],
    [
      { msgs: 4, lb: 4, fan: 8 },
      4,
      1.4,
      3.8,
      5.6,
      7,
      9.4,
      [
        ["m2", "m4"],
        ["m1", "m3"],
      ],
      [
        ["m1", "m2", "m3", "m4"],
        ["m1", "m2", "m3", "m4"],
      ],
    ],
  );
  const TICKS = [9.8, 10.0];

  V.scene({
    kicker: "MANY CONSUMERS",
    title: ["Share the work,", "or send to all"],
    dur: 12,
    caps: [
      [T.lbGo, 3.7, "Load balancing: each message goes to one consumer."],
      [3.9, 5.5, `${N.msgs} messages, ${N.lb} deliveries: they share the work.`],
      [T.fanGo, 9.3, "Fan-out: each message goes to every consumer."],
      [9.5, 11.7, `The same ${N.msgs} messages: ${N.fan} deliveries.`],
    ],
    build(stage) {
      const layer = () => {
        const el = V.h("div", {
          style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
        });
        stage.append(el);
        return el;
      };
      const ca = layer();
      const cb = layer();
      const box = { box: { y: 60, h: 580 } };
      const a = D8.flow(ca, LB, box);
      const b = D8.flow(cb, FAN, box);

      const mode = D4.tag(stage, { x: 468, y: 120, text: "load balancing", tone: "purple", solid: true });
      const count = D4.tag(stage, { x: 430, y: 560, text: "deliveries: 0", tone: "grey" });
      const fx = D4.svg(stage);
      const ticks = b.cons.map((n) => fx.appendChild(L5.tick(n.x + n.w - 6, n.y + 6, 44, "green", { w: 8 })));

      return (t) => {
        const fan = t >= OFF;
        V.show(ca, fan ? 0 : 1);
        V.show(cb, fan ? 1 : 0);
        const k = ramp(t, 0.3, 0.8, E.lin);
        if (!fan) {
          const out = 1 - ramp(t, 5.1, 5.5, E.lin); // the chip rows clear before the second run
          a.set(t, { k, wiresK: ramp(t, 0.4, 0.9, E.out), queueK: out, chipsK: out });
        } else {
          const back = ramp(t, OFF, OFF + 0.4, E.lin);
          b.set(t, { k: 1, queueK: back, chipsK: back });
        }

        mode.set({
          text: fan ? "fan-out" : "load balancing",
          k: fan ? E.pop(ramp(t, OFF, OFF + 0.4)) : E.pop(ramp(t, 0.3, 0.7)),
        });
        const log = fan ? FAN : LB;
        const goal = fan ? N.fan : N.lb;
        const n = delivers(log).filter((h) => h.t1 <= t).length;
        const reached = n >= goal;
        const at = fan ? T.fanDone : T.lbDone;
        count.set({
          text: `deliveries: ${n}`,
          tone: reached ? "green" : "grey",
          solid: reached,
          k: E.out(ramp(t, 0.6, 1.0)),
          s: 1 + 0.15 * flash(t, at, at + 0.5),
        });
        ticks.forEach((g, i) => {
          const kk = E.pop(ramp(t, TICKS[i], TICKS[i] + 0.4));
          V.place(g, { s: 0.4 + 0.6 * kk, o: Math.min(1, kk * 3) });
        });
      };
    },
  });
})();
