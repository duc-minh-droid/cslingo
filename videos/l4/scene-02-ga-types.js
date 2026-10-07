/* Lecture 4 · scene 02-ga-types: how many individuals change per step. Generational (everyone replaced, the best 0.9 is lost),
   elitism (the best is copied across), steady-state (one child replaces the weakest). Numbers come from L4.generational and
   L4.replaceWeakest. Story (local seconds): 0.6 panel A, 1.8-3.4 everyone flips, 3.5 "best lost", 5.0-5.9 flip back, 6.0 elite,
   6.3-7.6 tiles 1-4 flip, 7.7 "best kept", 8.6 panel B, 9.0 child, 9.5 weakest turns red, 10.0-10.8 child replaces it. */
(function () {
  const V = window.VID;
  const { L4, L5 } = { L4: V.l4, L5: V.l5 };
  const { ramp, flash, clamp, ease: E } = V;

  const POP = L4.POP_GA;
  const KIDS = [0.5, 0.3, 0.3, 0.7, 0.7];
  const ALL = L4.generational(POP, KIDS, 0);
  const ELITE = L4.generational(POP, KIDS, 1);
  const SS = L4.replaceWeakest(POP, 0.5);
  const eq = (a, b, what) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`ga-types: ${what}: ${JSON.stringify(a)}`);
  };
  eq(ALL, [0.5, 0.3, 0.3, 0.7, 0.7], "generational");
  eq(ELITE, [0.5, 0.3, 0.3, 0.7, 0.9], "elitist");
  eq([SS.idx, SS.pop], [0, [0.5, 0.5, 0.3, 0.2, 0.9]], "steady-state");
  const BEST = Math.max(...POP);
  const BEST_AT = POP.indexOf(BEST);
  if (Math.max(...ALL) >= BEST || Math.max(...ELITE) !== BEST || Math.max(...SS.pop) !== BEST)
    throw new Error("ga-types: best-kept logic");

  const X = 300;
  const YA = 60;
  const YB = 450;
  const SZ = 104;
  const GAP = 14;
  const tone0 = (i) => (i === BEST_AT ? "green" : "grey");
  const flipK = (t, a, d = 0.5) => ramp(t, a, a + d, E.lin);

  V.scene({
    kicker: "GA TYPES",
    title: ["Replace everyone,", "or just a few"],
    dur: 13,
    caps: [
      [0.9, 4.6, "Generational: the whole population is replaced."],
      [5.2, 8.4, "Elitism copies the best across unchanged."],
      [8.8, 12.5, "Steady-state: one child replaces the weakest."],
    ],
    build(stage) {
      const opt = { x: X, w: SZ, h: SZ, gap: GAP, font: 52, vals: POP, tones: POP.map((_, i) => tone0(i)) };
      const rowA = L4.tiles(stage, { ...opt, y: YA });
      const rowB = L4.tiles(stage, { ...opt, y: YB });
      const kid = L4.tiles(stage, { ...opt, y: 310, vals: [0.5], tone: "purple", tones: ["purple"] });
      const tagA = L4.tag(stage, { x: 12, y: 66, text: "generational" });
      const tagB = L4.tag(stage, { x: 12, y: 456, text: "steady-state" });
      const elite = L4.tag(stage, { x: rowA.mid(4).x, y: YA + SZ + 22, text: "elite", tone: "green", anchor: "c" });
      const wrapA = stage.appendChild(V.h("div", {}));
      const wrapB = stage.appendChild(V.h("div", {}));
      const mk = (wrap, y) => L5.badge(wrap, { x: 12, y, w: 260, h: 68, valid: "best kept", invalid: "best lost" });
      const badgeA = mk(wrapA, 126);
      const badgeB = mk(wrapB, 516);

      return (t) => {
        // ----- panel A -----
        const inA = (i) => ramp(t, 0.6 + 0.1 * i, 1.0 + 0.1 * i, E.lin);
        const f1 = (i) => flipK(t, 1.8 + 0.18 * i); // everyone replaced
        const back = (i) => flipK(t, 5.0 + 0.06 * i); // restored
        const f2 = (i) => flipK(t, 6.3 + 0.15 * i); // elitist: slots 1-4
        POP.forEach((v, i) => {
          const p = inA(i);
          const base = { y: (1 - E.out(p)) * 20, s: E.pop(p), o: clamp(p * 4) };
          const kDown = f1(i);
          const kBack = back(i);
          const kElite = i < BEST_AT ? f2(i) : 0;
          const hop = 14;
          if (t < 5.0) {
            rowA.flip(i, kDown, {
              ...base,
              from: v,
              to: ALL[i],
              tone: tone0(i),
              toTone: "purple",
              hop,
            });
          } else if (t < 6.3) {
            rowA.flip(i, kBack, { ...base, from: ALL[i], to: v, tone: "purple", toTone: tone0(i), hop });
          } else {
            rowA.flip(i, kElite, {
              ...base,
              from: v,
              to: ELITE[i],
              tone: tone0(i),
              toTone: i === BEST_AT ? "green" : "purple",
              hop,
            });
          }
        });
        const bump = 0.12 * flash(t, 6.0, 6.5);
        const p5 = inA(BEST_AT);
        if (t >= 6.0) rowA.set(BEST_AT, { tone: "green", s: E.pop(p5) * (1 + bump) });
        tagA.set({ s: 0.8 + 0.2 * E.pop(ramp(t, 0.6, 0.9, E.lin)), o: clamp(ramp(t, 0.6, 0.9, E.lin) * 4) });
        const eK = ramp(t, 6.0, 6.35, E.lin);
        elite.set({ s: 0.75 + 0.25 * E.pop(eK), o: clamp(eK * 4) });
        const lost = t < 5.0 ? ramp(t, 3.5, 3.9, E.lin) : 1 - ramp(t, 5.0, 5.4, E.lin);
        const kept = ramp(t, 7.7, 8.1, E.lin);
        badgeA(t < 5.4 ? "invalid" : "valid", t < 5.4 ? lost : kept);
        V.show(wrapA, t < 5.4 ? clamp(lost * 4) : clamp(kept * 4));

        // ----- panel B -----
        const inB = (i) => ramp(t, 8.6 + 0.35 + 0.08 * i, 8.6 + 0.75 + 0.08 * i, E.lin);
        const slot0 = flipK(t, 10.4, 0.4);
        rowB.all((i) => {
          const p = inB(i);
          return { y: (1 - E.out(p)) * 20, s: E.pop(p), o: clamp(p * 4), tone: tone0(i) };
        });
        const pB = inB(0);
        const baseB = { y: (1 - E.out(pB)) * 20, s: E.pop(pB), o: clamp(pB * 4) };
        const shake = flash(t, 9.5, 10.3) * Math.sin(((t - 9.5) / 0.8) * Math.PI * 7) * 8;
        const red = ramp(t, 9.5, 9.6, E.lin) > 0 && t < 10.4;
        rowB.flip(0, slot0, {
          ...baseB,
          x: t < 10.4 ? shake : 0,
          from: POP[0],
          to: SS.pop[0],
          tone: red ? "red" : "grey",
          toTone: "purple",
          hop: 14,
        });
        tagB.set({ s: 0.8 + 0.2 * E.pop(ramp(t, 8.6, 8.9, E.lin)), o: clamp(ramp(t, 8.6, 8.9, E.lin) * 4) });
        const kIn = ramp(t, 9.0, 9.4, E.lin);
        const drop = ramp(t, 10.0, 10.5, E.in);
        const kOut = 1 - ramp(t, 10.5, 10.8, E.lin);
        kid.set(0, { y: drop * (YB - 310) + (1 - E.out(kIn)) * -24, s: E.pop(kIn), o: clamp(kIn * 4) * kOut });
        const kb = ramp(t, 10.9, 11.3, E.lin);
        badgeB("valid", kb);
        V.show(wrapB, clamp(kb * 4));
      };
    },
  });
})();
