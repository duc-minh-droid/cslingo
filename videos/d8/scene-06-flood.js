/* Lecture 8 (ds-8) · scene 6 (TOO FAST): a producer sends 6 messages a second, the consumer handles 4 (lesson 8.2, 'When producers
   are too fast' and its demo). Three lanes run the same 10 seconds side by side (D8.floodLane, from D8.FLOOD.steps): BUFFER keeps
   everything (the queue grows by 2 a second: 20 waiting), DROP throws away what does not fit a queue of 10 (14 dropped), and
   BACKPRESSURE makes the producer wait (it sends 46 of 60: 14 held back, none lost).
   Story (local seconds): 0.3 the lanes pop; 1.4 the clock starts, one simulated second every 0.9 s, until 10.4; a ring marks the lane
   the caption talks about (Buffer 3.2, Drop 5.8, Backpressure 8.4); 10.8 the three counters bump in turn; 11.6 "none lost". */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const { ramp, flash, ease: E } = V;
  const F = D8.FLOOD;
  D8.same(
    "flood scene: 6/s against 4/s for 10 s, limit 10: 20 waiting, 14 dropped, 14 held back (46 of 60 sent)",
    [F.p, F.c, F.secs, F.cap, F.end.buffer.q, F.end.drop.drop, F.end.back.held, F.end.back.sent, F.p * F.secs],
    [6, 4, 10, 10, 20, 14, 14, 46, 60],
  );

  const LANES = [
    { pol: "buffer", name: "Buffer", y: 20, ring: "orange", on: [3.2, 5.6], counter: `${F.end.buffer.q} waiting` },
    { pol: "drop", name: "Drop", y: 220, ring: "red", on: [5.8, 8.2], counter: `${F.end.drop.drop} dropped` },
    {
      pol: "back",
      name: "Backpressure",
      y: 420,
      ring: "orange",
      on: [8.4, 10.6],
      counter: `${F.end.back.held} held back`,
    },
  ];
  const T = { pop: 0.3, clock: [1.4, 10.4], bumps: [10.8, 11.1, 11.4], safe: 11.6 };

  V.scene({
    kicker: "TOO FAST",
    title: ["Drop, buffer", "or push back"],
    dur: 13,
    caps: [
      [0.5, 3, `${F.p} messages a second arrive, but only ${F.c} are handled.`],
      [3.2, 5.6, "Buffer: the queue just keeps growing."],
      [5.8, 8.2, "Drop: what does not fit is thrown away."],
      [8.4, 10.6, "Backpressure: the producer must wait."],
      [
        10.8,
        12.8,
        `After ${F.secs} s: ${F.end.buffer.q} waiting, ${F.end.drop.drop} dropped, ${F.end.back.held} held back.`,
      ],
    ],
    build(stage) {
      const lanes = LANES.map((L) => {
        const ring = V.h("div", {
          style: {
            position: "absolute",
            left: "4px",
            top: `${L.y - 6}px`,
            width: "928px",
            height: "152px",
            boxSizing: "border-box",
            border: `4px solid ${D8.tone(L.ring).c}`,
            borderRadius: "24px",
          },
        });
        stage.append(ring);
        const lane = D8.floodLane(stage, { y: L.y, pol: L.pol, name: L.name });
        return { ...L, ring, lane };
      });
      const back = lanes[2];
      const safeX = back.lane.count.x + D4.tagW(back.counter) + 110;
      const safe = D4.tag(stage, { x: safeX, y: back.y + 108, text: "none lost", tone: "green", solid: true });
      // the clock under the lanes: which simulated second we are in
      const clock = D4.label(stage, { x: 436, y: 604, text: "", tone: "grey", fs: 30, anchor: "l" });
      const clockG = D4.svg(stage).appendChild(D8.clock(404, 604, 44, "grey", 12));

      return (t) => {
        const sec = F.secs * ramp(t, T.clock[0], T.clock[1], E.lin);
        const countK = ramp(t, T.clock[0] - 0.2, T.clock[0] + 0.1, E.lin);
        lanes.forEach((L, i) => {
          const k = E.out(D4.seq(t, T.pop, 0.15, 0.5, i));
          const countS = 1 + 0.15 * flash(t, T.bumps[i], T.bumps[i] + 0.3);
          L.lane.set({ k, sec, countK, countS });
          const rk = ramp(t, L.on[0], L.on[0] + 0.3, E.lin) * (1 - ramp(t, L.on[1] - 0.2, L.on[1], E.lin));
          V.place(L.ring, { s: 0.97 + 0.03 * E.pop(rk), o: rk });
        });
        clock.set({ k: countK, text: `after ${Math.floor(sec + 1e-6)} s` });
        V.place(clockG, { r: 360 * (sec % 1), o: countK });
        safe.set({ k: ramp(t, T.safe, T.safe + 0.4, E.lin) });
      };
    },
  });
})();
