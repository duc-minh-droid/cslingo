/* Lecture 12 video, scene 09-bits: lesson 12.5, approach 1 (traditional binary PSO). A position made of bits cannot take a
   real velocity (1 + 0.7 is not a bit). Keep the same velocity rule, hold v between 0 and 1 and read it as the chance that the
   bit is 1: the bit becomes 1 if a random number rand() is below v. The lesson's one bit (L12.BIT), then 20 draws with v = 0.8
   (L12.DRAWS). The app's speed cap is never shown or mentioned.
   Layout (stage px): PART A (large and centred, y 220..370, 0.4-3.4): green '1' + grey '0.7' = red ghost '?' crossed out, 'a bit is 0 or 1'.
   PART B (same band, from 3.4): grey bit chip 'bit x' (x 120), purple '1' 'own best p' (x 380), orange '1' 'swarm best g'
   (x 640). The chance bar (x 100, y 280, w 736, h 60, 0 left, 1 right): blue 0 -> 0.5 (the old v), purple 0.5 -> 0.7 (+0.2),
   orange 0.7 -> 0.8 (+0.1). Above the bar: 'v = 0.5' (blue, at 0.5), later 'v = 0.8' (solid blue, at 0.8) and 'rand() = 0.55'
   (grey, at the marker); below it: '+0.2' and '+0.1' under their segments; the grey tag 'v stays between 0 and 1' under the
   bar's left end. The die (grey) sits right of the bar's top. PART C (y 470..590): 20 bit chips, one per draw (green solid 1,
   grey 0), the marker hopping to each draw's rand() as its chip pops; tags 'v = 0.8' and '16 of 20 are 1'.
   Story (local seconds): 0.4-1.4 part A pops left to right, 1.8-2.4 the red cross draws on; 3.0-3.4 part A fades; 3.4-4.0 the
   three chips of part B; 3.9-4.4 the bar with the blue 0 -> 0.5 segment, 'v = 0.5' and 'v stays between 0 and 1'; 4.9-5.35
   purple grows with '+0.2' (purple chip pulses); 5.35-5.8 orange grows with '+0.1' (orange chip pulses); 5.75 'v = 0.8' pops;
   7.2-7.5 'v = 0.5' fades; 7.3-7.8 the die shakes and the marker drops at 0.55, 'rand() = 0.55' pops; 8.2-8.8 the bit flips
   from grey 0 to green 1 with a green tick; 10.0 the rand() tag fades; 10.2-12.6 the 20 draws (0.12 s apart); 12.8 '16 of 20
   are 1'. Hold to 15. */
VID.scene({
  kicker: "BINARY PSO",
  title: ["For bits, velocity", "becomes a chance"],
  dur: 15,
  caps: [
    [1, 3, "A bit is 0 or 1: adding 0.7 makes no sense."],
    [4.2, 5.7, "Binary PSO keeps v between 0 and 1."],
    [5.8, 7.6, "The two pulls add 0.2 and 0.1: v is now 0.8."],
    [7.8, 10, "Draw rand(): 0.55 is below 0.8, so the bit is 1."],
    [10.4, 12.7, "So v is the chance of a 1, drawn every step."],
    [12.9, 14.8, "Here 16 of 20 draws come out as 1."],
  ],
  build(stage, V) {
    const L12 = V.l12;
    const L5 = V.l5;
    const { ramp, flash, lerp, ease: E } = V;
    const { fmt } = L12;

    // ---- the data (computed and asserted in l12/common.js), asserted again here
    const B = L12.BIT;
    const D = L12.DRAWS;
    L12.same([B.x, B.p, B.g, B.c1, B.c2], [0, 1, 1, 1, 1], "scene 9: the lesson's bit, its bests and c1, c2");
    L12.close([B.v, B.z1, B.z2, B.u], [0.5, 0.2, 0.1, 0.55], 1e-9, "scene 9: old v, dice and draw");
    L12.close([B.cog, B.soc, B.nv], [0.2, 0.1, 0.8], 1e-9, "scene 9: pulls +0.2, +0.1, new v 0.8");
    L12.close(
      B.nv,
      L12.bitV(B.v + B.cog + B.soc),
      1e-9,
      "scene 9: the new v is the old v plus both pulls, kept in 0..1",
    );
    L12.same([B.u < B.nv, B.nx], [true, 1], "scene 9: 0.55 < 0.8, so the bit becomes 1");
    L12.same([D.v, D.bits.length, D.ones], [B.nv, 20, 16], "scene 9: 20 draws with v = 0.8, 16 ones");
    D.u.forEach((u, i) => L12.same(D.bits[i], u < D.v ? 1 : 0, `scene 9: draw ${i + 1} is 1 when rand() < v`));
    const NUDGE = 0.7; // part A's real-valued velocity: 1 + 0.7 is not a bit
    L12.same(NUDGE !== 0 && 1 + NUDGE !== 0 && 1 + NUDGE !== 1, true, "scene 9: 1 + 0.7 is neither 0 nor 1");

    const svg = L5.svg(stage);
    const midX = (a, b) => (a + b) / 2;

    // ---- PART A: 1 + 0.7 = ?
    // drawn large and centred on the stage (it is alone on screen for its 3 s)
    const AY = 220;
    const AH = 110;
    const AX = [180, 390, 632]; // left edges: 1 (124 wide), 0.7 (156 wide), ? (124 wide); 576 px in all, centred
    const A1 = L12.chip(stage, { x: AX[0], y: AY, w: 124, h: AH, text: "1", tone: "green", fs: 58 });
    const A2 = L12.chip(stage, { x: AX[1], y: AY, w: 156, h: AH, text: fmt(NUDGE), tone: "grey", fs: 58 });
    const A3 = L12.chip(stage, { x: AX[2], y: AY, w: 124, h: AH, text: "?", tone: "red", fs: 58 });
    const plus = svg.appendChild(L12.mark("plus", midX(AX[0] + 124, AX[1]), AY + AH / 2, 56, "grey"));
    const eq = svg.appendChild(L12.mark("equals", midX(AX[1] + 156, AX[2]), AY + AH / 2, 56, "grey"));
    const crossA = svg.appendChild(L5.cross(AX[2] + 112, AY + 6, 76, "red"));
    const labA = L12.label(stage, { x: AX[0], y: AY + AH + 24, w: 576, text: "a bit is 0 or 1", fs: 34 });
    const partA = [A1, plus, A2, eq, A3];

    // ---- PART B: the bit and its two bests
    const BY = 40;
    const BH = 76;
    const mkB = (x, text, tone, lab, ltone) => ({
      chip: L12.chip(stage, { x, y: BY, w: 96, h: BH, text, tone, fs: 44 }),
      lab: L12.label(stage, { x: x - 72, y: BY + BH + 12, w: 240, text: lab, tone: ltone }),
    });
    const bit = mkB(120, String(B.x), "grey", "bit x", "grey");
    const pB = mkB(380, String(B.p), "purple", "own best p", "purple");
    const gB = mkB(640, String(B.g), "orange", "swarm best g", "orange");
    const tick = svg.appendChild(L5.tick(258, BY + BH / 2, 52, "green"));

    // ---- the chance bar
    const BAR = { x: 100, y: 280, w: 736, h: 60 };
    const bar = L12.prob(stage, BAR);
    const xOf = bar.xOf;
    const ABOVE = BAR.y - 84; // tags above the bar (clear of the marker's pointer)
    const BELOW = BAR.y + BAR.h + 16;
    const centred = (parent, text, tone, v, y, solid = false) => {
      const tg = L12.tag(parent, { x: 0, y, text, tone, solid });
      return { tg, x: xOf(v) - L12.tagW(text) / 2 };
    };
    const v05 = centred(stage, `v = ${fmt(B.v)}`, "blue", B.v, ABOVE);
    const v08 = centred(stage, `v = ${fmt(B.nv)}`, "blue", B.nv, ABOVE, true);
    const p02 = centred(stage, `+${fmt(B.cog)}`, "purple", B.v + B.cog / 2, BELOW);
    const p01 = centred(stage, `+${fmt(B.soc)}`, "orange", B.v + B.cog + B.soc / 2, BELOW);
    const keep = L12.tag(stage, { x: BAR.x, y: BELOW + 56, text: "v stays between 0 and 1", tone: "grey" });
    const rTag = L12.tag(stage, { x: 0, y: ABOVE, text: "", tone: "grey" });
    const dice = svg.appendChild(L5.dice(880, BAR.y - 40, 64, { tone: "grey" }));

    // ---- PART C: 20 draws with v = 0.8
    const CY = 486;
    const CW = 40;
    const STEP = 45.5;
    const C0 = (936 - (19 * STEP + CW)) / 2;
    const chipsC = D.bits.map((b, i) =>
      L12.chip(stage, { x: C0 + STEP * i, y: CY, w: CW, h: 56, text: String(b), tone: "grey", fs: 30, radius: 12 }),
    );
    L12.same(C0 >= 12 && C0 + 19 * STEP + CW <= 924, true, "scene 9: the 20 draws fit inside the stage");
    const vC = L12.tag(stage, { x: C0, y: CY + 72, text: `v = ${fmt(D.v)}`, tone: "blue", solid: true });
    const onesC = L12.tag(stage, {
      x: C0 + L12.tagW(`v = ${fmt(D.v)}`) + 16,
      y: CY + 72,
      text: `${D.ones} of ${D.bits.length} are 1`,
      tone: "green",
      solid: true,
    });

    const T = {
      a: 0.4,
      cross: [1.8, 2.4],
      aOut: [3.0, 3.4],
      b: 3.4,
      bar: [3.9, 4.4],
      purple: [4.9, 5.35],
      orange: [5.35, 5.8],
      v08: 5.75,
      v05Out: [7.2, 7.5],
      drop: [7.3, 7.8],
      flip: [8.2, 8.8],
      rOut: [10.0, 10.2],
      c: 10.2,
      cStep: 0.12,
      ones: 12.8,
    };
    L12.same(T.c + 19 * T.cStep + 0.3 <= T.ones, true, "scene 9: the tally pops after the last draw");

    return (t) => {
      // part A
      const aOut = 1 - ramp(t, ...T.aOut, E.lin);
      partA.forEach((p, i) => {
        const k = L12.seq(t, T.a, 0.2, 0.4, i);
        if (p.set) p.set({ k, o: aOut, ghost: p === A3, solid: p === A1 });
        else V.place(p, { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 3) * aOut });
      });
      L5.drawOn(crossA, ramp(t, ...T.cross, E.lin));
      V.place(crossA, { o: aOut });
      labA.set({ k: ramp(t, 1.4, 1.8), o: aOut });

      // part B
      const pulseP = flash(t, T.purple[0], T.purple[1] + 0.2);
      const pulseO = flash(t, T.orange[0], T.orange[1] + 0.2);
      const fl = ramp(t, ...T.flip, E.lin);
      const one = fl >= 0.5;
      [bit, pB, gB].forEach((q, i) => {
        const k = L12.seq(t, T.b, 0.15, 0.4, i);
        const pulse = i === 1 ? pulseP : i === 2 ? pulseO : 0;
        if (i === 0)
          q.chip.set({
            k,
            text: one ? String(B.nx) : String(B.x),
            tone: one ? "green" : "grey",
            solid: one,
            sx: Math.abs(Math.cos(Math.PI * fl)),
            s: 1 + 0.1 * flash(t, T.flip[1] - 0.1, T.flip[1] + 0.3),
          });
        else q.chip.set({ k, s: 1 + 0.12 * pulse, ring: pulse > 0.01 ? (i === 1 ? "purple" : "orange") : null });
        q.lab.set({ k: L12.seq(t, T.b + 0.15, 0.15, 0.4, i) });
      });
      L5.drawOn(tick, ramp(t, T.flip[1], T.flip[1] + 0.4, E.lin));

      // the bar
      const bk = ramp(t, ...T.bar);
      const pk = ramp(t, ...T.purple);
      const ok = ramp(t, ...T.orange);
      const segs = [
        { from: 0, to: B.v, tone: "blue" },
        { from: B.v, to: B.v + B.cog * pk, tone: "purple" },
        { from: B.v + B.cog, to: B.v + B.cog + B.soc * ok, tone: "orange" },
      ];
      // part C: the marker hops to each draw's rand() as its chip pops
      const ci = Math.min(19, Math.floor((t - T.c) / T.cStep));
      let marker = B.u;
      if (t >= T.c) {
        const prev = ci <= 0 ? B.u : D.u[ci - 1];
        marker = lerp(prev, D.u[Math.max(0, ci)], ramp(t - T.c - Math.max(0, ci) * T.cStep, 0, 0.06, E.out));
      }
      bar.set({ k: bk, segs, marker, markerK: ramp(t, ...T.drop), markerTone: "grey" });
      v05.tg.set({ k: ramp(t, T.bar[0] + 0.2, T.bar[1] + 0.2), x: v05.x, o: 1 - ramp(t, ...T.v05Out, E.lin) });
      p02.tg.set({ k: ramp(t, T.purple[0] + 0.15, T.purple[1]), x: p02.x });
      p01.tg.set({ k: ramp(t, T.orange[0] + 0.15, T.orange[1]), x: p01.x });
      v08.tg.set({ k: ramp(t, T.v08, T.v08 + 0.4), x: v08.x });
      keep.set({ k: ramp(t, T.bar[0] + 0.3, T.bar[1] + 0.3) });
      const rText = `rand() = ${fmt(B.u)}`;
      rTag.set({
        text: rText,
        k: ramp(t, T.drop[1] - 0.2, T.drop[1] + 0.2),
        x: xOf(B.u) - L12.tagW(rText) / 2,
        o: 1 - ramp(t, ...T.rOut, E.lin),
      });
      const shake = ramp(t, T.drop[0] - 0.1, T.drop[1], E.lin);
      V.place(dice, {
        r: 14 * Math.sin(shake * Math.PI * 4) * (shake < 1 ? 1 : 0),
        s: 0.7 + 0.3 * E.pop(ramp(t, T.drop[0] - 0.4, T.drop[0])),
        o: ramp(t, T.drop[0] - 0.4, T.drop[0] - 0.2),
      });

      // part C
      chipsC.forEach((c, i) => {
        const k = L12.seq(t, T.c, T.cStep, 0.3, i);
        const b = D.bits[i];
        c.set({ k, text: String(b), tone: b ? "green" : "grey", solid: !!b });
      });
      vC.set({ k: ramp(t, T.c, T.c + 0.4) });
      onesC.set({ k: ramp(t, T.ones, T.ones + 0.4), s: 1 + 0.08 * flash(t, T.ones + 0.3, T.ones + 0.8) });
    };
  },
});
