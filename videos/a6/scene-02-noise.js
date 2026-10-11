/* Phase 6 · scene 02-noise (10.5 s): a message crosses a noisy wire, one bit flips, and the receiver cannot tell; the cure
   is a check bit. The sent word 10110010 (message 1011001 + one check bit, explained in scene 3) and the received word
   1111001 come from videos/a6/common.js; nothing is typed here. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;

  const SENT = A6.PARITY.frame; // message + the check bit (slot 7)
  const MSG = A6.WIRE.msg;
  const RECV = A6.WIRE.recv;
  const HIT = A6.WIRE.flip; // the lane the noise hits (tile index, 0-based)
  const CHECK = 7; // the check-bit slot of the sent word
  A6.same("noise: sent", SENT, "10110010");
  A6.same("noise: sent = message + check bit", SENT.slice(0, CHECK), MSG);
  A6.same("noise: one flip", [A6.diffAt(MSG, RECV), MSG[HIT], RECV[HIT]], [[1], "0", "1"]);

  const X0 = 150; // left of tile 0 (sent and received rows share it)
  const SIZE = 84;
  const GAP = 12;
  const lane = (i) => X0 + (SIZE + GAP) * i + SIZE / 2; // the middle of tile i
  const SENT_Y = 72;
  const RECV_Y = 388;
  const LANE_FROM = SENT_Y + SIZE + 12; // 168
  const LANE_TO = RECV_Y - 12; // 376
  const LANE_MID = (LANE_FROM + LANE_TO) / 2; // 272
  const RECV_RISE = 140; // the received word rises this far while the receiver looks at it
  const END_DY = 100; // the sent word returns this far lower for the last picture

  V.scene({
    kicker: "THE PROBLEM",
    title: ["Noise flips bits,", "and nobody tells you"],
    dur: 10.5,
    caps: [
      [0.5, 2.7, "A message travels as bits."],
      [3.5, 5.5, "Noise on the wire flips a bit."],
      [6, 8, "The receiver cannot tell."],
      [8.7, 10.3, "Fix: add a check bit."],
    ],
    build(stage) {
      const tones = [...SENT].map((_, i) => (i === CHECK ? "orange" : "grey"));
      const sent = A6.bits(stage, { x: X0, y: SENT_Y, bits: SENT, size: SIZE, gap: GAP, tones });
      const sentTag = A6.tag(stage, { x: X0, y: 0, text: "sent", tone: "grey" });
      const received = A6.bits(stage, { x: X0, y: RECV_Y, bits: RECV, size: SIZE, gap: GAP });
      const recvTag = A6.tag(stage, { x: X0, y: 486, text: "received", tone: "grey" });

      // the wire: seven lanes, sent tile i down to received tile i
      const svg = L5.svg(stage);
      const lanes = [...MSG].map((_, i) =>
        svg.appendChild(L5.arrow(lane(i), LANE_FROM, lane(i), LANE_TO, "grey", 1, { w: 6, head: 18 })),
      );
      const wireTag = A6.tag(stage, { x: lane(6) + 36, y: LANE_MID - 29, text: "wire", tone: "grey" });
      const bolt = svg.appendChild(A6.bolt(lane(HIT), LANE_MID, 130, "orange"));

      // the receiver's doubt
      const qmark = svg.appendChild(A6.qmark(470, 556, 96, "orange"));
      const doubt = A6.tag(stage, { x: 530, y: 536, text: "any flips?", tone: "orange" });

      // the check bit, once it has a name (right-aligned with its tile so it stays inside the stage)
      const checkText = "check bit";
      const checkEnd = X0 + (SIZE + GAP) * CHECK + SIZE;
      const checkTag = A6.tag(stage, {
        x: checkEnd - A6.tagW(checkText) - 6, // the real pill is about 6 px wider than the estimate
        y: 176,
        text: checkText,
        tone: "orange",
        solid: true,
      });

      return (t) => {
        // ---- the sent word: pops in, fades while the receiver looks, comes back for the fix ----
        const sentVis = t < 7 ? 1 - ramp(t, 5.4, 5.9) : ramp(t, 8.0, 8.5);
        const sentDy = t < 7 ? 0 : END_DY; // when it comes back it sits lower, so the final picture is not top-heavy
        V.place(sent.el, { y: sentDy, o: sentVis });
        const popped = (i) => A6.seq(t, 0.3, 0.07, 0.28, i);
        sent.all((i) => {
          if (i === CHECK) {
            const k = ramp(t, 8.7, 9.4, E.lin);
            if (t < 8.7) return { ghost: true, text: "", o: ramp(t, 0.8, 1.1) };
            return { text: A6.PARITY.p, tone: "orange", solid: true, s: 0.4 + 0.6 * E.pop(k), o: Math.min(1, k * 5) };
          }
          const k = popped(i);
          return { s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) };
        });
        sentTag.set({ k: ramp(t, 0.2, 0.5, E.lin), y: sentDy, o: sentVis });

        // ---- the wire: seven lanes draw on, one is hit by noise, then they fade ----
        const laneFade = 1 - ramp(t, 5.4, 5.9);
        const hit = Math.sin(Math.PI * ramp(t, 2.5, 3.1, E.lin)) * Math.sin(2 * Math.PI * 9 * (t - 2.5));
        lanes.forEach((g, i) => {
          L5.drawOn(g, E.out(A6.seq(t, 1.3, 0.07, 0.6, i)));
          V.place(g, { x: i === HIT && t > 2.5 && t < 3.1 ? 4 * hit : 0, o: laneFade });
        });
        wireTag.set({ k: ramp(t, 1.5, 1.9, E.lin), o: laneFade });
        const b = ramp(t, 2.4, 2.9, E.lin);
        V.place(bolt, { s: lerp(0.5, 1.1, E.pop(b)), o: Math.min(1, b * 4) * (1 - ramp(t, 3.45, 3.85, E.lin)) });

        // ---- the received word: arrives, the hit tile flips to red, then it looks like any word ----
        const recvVis = 1 - ramp(t, 7.6, 8.0, E.lin);
        const recvDy = -RECV_RISE * ramp(t, 5.4, 6.2, E.inOut); // it moves up into the room the sent word leaves
        V.place(received.el, { y: recvDy, o: recvVis });
        for (let i = 0; i < RECV.length; i++) {
          const k = A6.seq(t, 3.0, 0.07, 0.25, i);
          const st = { s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) };
          if (i !== HIT) received.set(i, st);
          else
            received.flip(i, ramp(t, 3.5, 3.9, E.inOut), {
              ...st,
              from: MSG[HIT], // the tile first shows the 0 that was sent ...
              to: RECV[HIT], // ... then turns over to the 1 that the noise made
              tone: "grey",
              toTone: t < 5.6 ? "red" : "grey",
              hop: 14,
            });
        }
        recvTag.set({ k: ramp(t, 3.0, 3.3, E.lin), y: recvDy, o: recvVis });

        // ---- the receiver's doubt ----
        const q = ramp(t, 5.9, 6.4, E.lin);
        const qOut = recvVis;
        V.place(qmark, { y: recvDy, s: 0.6 + 0.4 * E.pop(q), o: Math.min(1, q * 4) * qOut });
        L5.drawOn(qmark, ramp(t, 5.9, 6.3));
        doubt.set({ k: ramp(t, 6.1, 6.4, E.lin), y: recvDy, o: qOut });

        // ---- the fix: a check bit ----
        checkTag.set({ k: ramp(t, 9.1, 9.5, E.lin), y: sentDy });
      };
    },
  });
})();
