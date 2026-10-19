/* Lecture 6 · scene 06 (eventual): eventual consistency. A write of 35 lands on replica R1 and spreads, one hop per two
   ticks, to R2 and R3, so for a while some copies still hold the old 40. A read at R3 during that time returns the stale
   40; once the last copy has the write, all three agree. Every value, count and the stale read come from D6.EV. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const EV = D6.EV;

  // ---------- data, asserted ----------
  const RD = EV.read(3, 2); // a read at R3 during tick 3
  D6.same(RD, { value: 40, stale: true }, "scene 6: the read at R3 is stale");

  // ---------- timeline (local seconds) ----------
  const T0 = 1.6; // tick 0: the write lands on R1 (one second per tick, so R2 at 3.6 and R3 at 5.6)
  const T_RISE = 4.5; // the client's read leaves for R3
  const T_HIT = 4.85; // ... and reaches it (tick 3.25)
  const T_BACK = 5.4; // the reply is back with the client
  const T_FADE = [5.8, 6.2]; // the old reply and the "stale read" tag fade
  const T_CONV = 6.2; // "converged" pops
  D6.same(EV.read(T_HIT - T0, 2), RD, "scene 6: R3 is still old when the read reaches it");
  D6.same(EV.vals(T_HIT - T0), [EV.latest, EV.latest, EV.old], "scene 6: values at the read");
  D6.same(EV.count(EV.last), EV.n, "scene 6: every replica ends up with the write");
  if (T0 + EV.last >= T_FADE[0]) throw new Error("scene 6: R3 must update before the reply fades");

  // ---------- layout (stage px) ----------
  const BX = [12, 358, 704];
  const BY = 70;
  const BW = 220;
  const BH = 170;
  const MID_Y = BY + BH / 2;
  const CX = 814; // the client column under R3
  const RY0 = 350; // where the read packet waits and the reply comes to rest
  const RY1 = 205; // inside R3 (hidden behind it)
  const CLIENT_Y = 462;
  const TAG_Y = 538;

  V.scene({
    kicker: "EVENTUAL CONSISTENCY",
    title: ["Replicas disagree,", "then converge"],
    dur: 10.5,
    caps: [
      [0.5, 2.2, "The write lands on one copy."],
      [2.4, 4.2, "The others hear later."],
      [5.0, 6.7, "A read now can be stale."],
      [6.9, 8.9, "Soon every copy agrees."],
    ],
    build(stage) {
      // links first, then packets (they slide out from behind the boxes), then the boxes on top
      const links = [0, 1].map((i) =>
        D6.link(stage, { a: { x: BX[i] + BW, y: MID_Y }, b: { x: BX[i + 1], y: MID_Y }, w: 8 }),
      );
      const pWrite = D6.packet(stage, { tone: "blue", text: `write ${EV.latest}` });
      const pHop = [0, 1].map(() => D6.packet(stage, { tone: "blue", text: String(EV.latest) }));
      const pRead = D6.packet(stage, { tone: "blue", text: "read" });
      const pReply = D6.packet(stage, { tone: "orange", text: String(RD.value) });
      const boxes = BX.map((x, i) =>
        D6.box(stage, { x, y: BY, w: BW, h: BH, name: `R${i + 1}`, tone: "orange", icon: "server", vfs: 64 }),
      );
      const note = D6.label(stage, {
        x: BX[0],
        y: 262,
        w: 560,
        text: "Three copies (replicas) of one value",
        align: "left",
      });

      const plotTag = D6.tag(stage, { x: 340, y: 312, text: "replicas updated", tone: "green" });
      const plot = D6.stepPlot(stage, { x: 340, y: 392, w: 320, h: 150, counts: EV.counts, xLabel: "tick" });
      const stat = D6.stat(stage, { x: 76, y: 424, w: 200, h: 80, label: "tick", tone: "blue" });

      const svg = L5.svg(stage);
      const clock = D6.clock(44, 464, 56, "blue");
      const client = D6.person(CX, CLIENT_Y, 80, "blue");
      svg.append(clock, client);

      const wStale = D6.tagW("stale read");
      const wConv = D6.tagW("converged");
      const stale = D6.tag(stage, { x: CX - wStale / 2, y: TAG_Y, text: "stale read", tone: "orange", solid: true });
      const conv = D6.tag(stage, { x: CX - wConv / 2, y: TAG_Y, text: "converged", tone: "green", solid: true });

      const hop = (i, p, raw) => {
        const f = clamp((raw - EV.at[i]) / (EV.at[i + 1] - EV.at[i]));
        const hw = D6.packetW(String(EV.latest)) / 2 + 3;
        const pt = D6.along({ x: BX[i] + BW, y: MID_Y }, { x: BX[i + 1], y: MID_Y }, f, -hw);
        p.set({ x: pt.x, y: pt.y, o: raw >= EV.at[i] && raw <= EV.at[i + 1] ? 1 : 0 });
      };

      return (t) => {
        const raw = t - T0; // the tick clock; negative before the write lands
        const tick = clamp(raw, 0, EV.last);
        const vals = EV.vals(raw);

        // the network and the three replicas
        links.forEach((lk, i) => lk.update({ k: ramp(t, 0.5 + 0.2 * i, 1.0 + 0.2 * i), tone: "grey" }));
        boxes.forEach((b, i) => {
          const latest = vals[i] === EV.latest;
          const at = T0 + EV.at[i];
          b.set({
            value: vals[i],
            sub: latest ? "latest" : "old",
            tone: latest ? "green" : "orange",
            k: D6.seq(t, 0.3, 0.2, 0.5, i),
            s: 1 + 0.06 * flash(t, at, at + 0.5),
          });
        });
        note.set({ k: ramp(t, 0.6, 1.0, E.lin) });

        // the write drops into R1, then the new value hops from copy to copy
        const w = D6.pop(ramp(t, 0.45, 0.75, E.lin));
        pWrite.set({
          x: BX[0] + BW / 2,
          y: lerp(44, MID_Y - 15, ramp(t, 0.6, 1.5, E.inOut)),
          s: w.s,
          o: t < T0 ? w.o : 0,
        });
        pHop.forEach((p, i) => hop(i, p, raw));

        // the clock and the staircase of updated copies
        const k = ramp(t, 1.1, 1.5, E.lin);
        plotTag.set({ k });
        plot.set({ tick, k });
        const n = Math.floor(tick);
        stat.set({
          text: String(n),
          bump: raw > 0 && raw <= EV.last + 0.3 ? flash(raw % 1, 0, 0.3) : 0,
          k,
        });
        D6.clockHand(clock, tick / EV.last);
        V.place(clock, { s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) });

        // a client reads from R3 while it is still old
        const kc = D6.pop(ramp(t, 3.9, 4.3, E.lin));
        V.place(client, { s: kc.s, o: kc.o });
        const rise = ramp(t, T_RISE, T_HIT, E.inOut);
        pRead.set({ x: CX, y: lerp(RY0, RY1, rise), s: kc.s, o: t < T_HIT ? kc.o : 0 });
        const back = ramp(t, T_HIT, T_BACK, E.out);
        const gone = 1 - ramp(t, T_FADE[0], T_FADE[1], E.lin);
        pReply.set({ x: CX, y: lerp(RY1, RY0, back), o: t < T_HIT ? 0 : gone });
        stale.set({ k: ramp(t, 5.0, 5.4, E.lin), o: gone });
        conv.set({ k: ramp(t, T_CONV, T_CONV + 0.4, E.lin) });
      };
    },
  });
})();
