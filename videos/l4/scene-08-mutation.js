/* Lecture 4 · scene 08-mutation: every encoding needs its own mutation; re-rolling a tour gene breaks the tour, a swap keeps it. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const L5 = V.l5;
  const { ramp, ease: E } = V;

  // ---------- data (all derived here, never typed twice) ----------
  const BIN = [1, 0, 1, 1, 0, 1];
  const BIN_AT = 2;
  const BIN2 = BIN.map((b, i) => (i === BIN_AT ? 1 - b : b));
  const INT = [3, 5, 2, 8, 7, 2];
  const INT_AT = 1;
  const INT_NEW = 1;
  if (INT.includes(INT_NEW)) throw new Error("re-rolled value must be new");
  const INT2 = INT.map((v, i) => (i === INT_AT ? INT_NEW : v));
  const REAL = [0.3, 0.2, 0.4];
  const REAL_AT = 1;
  const REAL_D = 0.07;
  const REAL2 = REAL.map((v, i) => (i === REAL_AT ? v + REAL_D : v));
  const f2 = (v) => v.toFixed(2);
  const TOUR = "DEGJA";
  const TOUR_AT = 3;
  const BROKEN = L5.setAt(TOUR, TOUR_AT, TOUR[0]); // DEGDA
  const DUPS = L5.dupIdx(BROKEN); // genes 1 and 4
  const MISSING = L5.missingOf(BROKEN, TOUR); // ["J"]
  const SWAP = [1, 4];
  const SWAPPED = L5.swapAt(TOUR, SWAP[0], SWAP[1]); // DAGJE
  if (L5.isPerm(BROKEN, TOUR) || !L5.isPerm(SWAPPED, TOUR) || DUPS.join() !== "0,3") throw new Error("tour data");

  // ---------- layout ----------
  const ROW_Y = [14, 154, 294, 434];
  const X0 = 200;
  const TAG_X = 772;
  const pop = (t, a, d = 0.45) => ramp(t, a, a + d, E.pop);

  V.scene({
    kicker: "MUTATION",
    title: ["Mutation must fit", "the encoding"],
    dur: 12,
    caps: [
      [0.8, 4.8, "Each encoding needs its own kind of mutation."],
      [5.0, 7.8, `Re-rolling a tour breaks it: ${TOUR[0]} twice, ${MISSING[0]} lost.`],
      [8.4, 11.5, "Swapping two genes keeps every city once."],
    ],
    build(stage) {
      const bin = L4.tiles(stage, { x: X0, y: ROW_Y[0], vals: BIN, w: 80, h: 80, gap: 10, font: 44 });
      const int = L4.tiles(stage, { x: X0, y: ROW_Y[1], vals: INT, w: 80, h: 80, gap: 10, font: 44 });
      const real = L4.tiles(stage, { x: X0, y: ROW_Y[2], vals: REAL.map(f2), w: 120, h: 80, gap: 12, font: 40 });
      const tour = L4.tiles(stage, { x: X0, y: ROW_Y[3], vals: [...TOUR], w: 80, h: 80, gap: 10, font: 44 });
      const ghost = L4.tiles(stage, { x: X0 + 5 * 90, y: ROW_Y[3], vals: MISSING, w: 80, h: 80, gap: 10, font: 44 });
      const names = ["binary", "integer", "real", "tour"].map((text, i) =>
        L4.tag(stage, { x: 12, y: ROW_Y[i] + 17, text }),
      );
      const ops = ["bit flip", "re-roll", "nudge", "re-roll"].map((text, i) =>
        L4.tag(stage, { x: TAG_X, y: ROW_Y[i] + 17, text, tone: "purple", solid: true }),
      );
      const plus = L4.tag(stage, {
        x: 604,
        y: ROW_Y[2] + 17,
        text: `+${REAL_D.toFixed(2)}`,
        tone: "blue",
        solid: true,
      });
      const bell = L4.bell(stage, { x: real.left + real.pos(REAL_AT), y: ROW_Y[2] - 46, w: 120, h: 40 });
      const badge = L5.badge(stage, { x: 200, y: 536 });
      const svg = L5.svg(stage);
      const die = [V.s("g", {}), V.s("g", {})];
      svg.append(...die);
      const rollDie = (g, t, a, b, hide, at, y) => {
        const on = ramp(t, a, a + 0.3, E.back) * (1 - ramp(t, hide, hide + 0.3));
        const roll = ramp(t, a + 0.1, b, E.lin);
        const faces = [5, 2, 4, 1, 6, 3, 5];
        g.replaceChildren(L5.dice(0, 0, 44, { face: faces[Math.min(6, Math.floor(roll * 7))], tone: "purple" }));
        const rolling = roll > 0 && roll < 1;
        V.place(g, {
          x: at,
          y: y - (rolling ? 8 * Math.abs(Math.sin(roll * 16)) : 0),
          s: 0.5 + 0.5 * on,
          r: rolling ? Math.sin(roll * 20) * 14 : 0,
          o: Math.min(1, on * 3),
        });
      };

      // one simple row: grey -> the chosen gene turns blue and flips -> the rest turn green
      const simple = (row, p, t, texts, texts2) => {
        const k = ramp(t, p.f0, p.f1, E.inOut);
        row.all((i) => {
          const base = { s: 0.6 + 0.4 * p.pop, o: Math.min(1, p.pop * 3) };
          if (i === p.at) return base;
          return { ...base, tone: t >= p.green ? "green" : "grey" };
        });
        row.flip(p.at, k, {
          from: texts[p.at],
          to: texts2[p.at],
          tone: t >= p.f0 ? "blue" : "grey",
          toTone: "blue",
          hop: 18,
          s: 0.6 + 0.4 * p.pop,
          o: Math.min(1, p.pop * 3),
        });
      };

      return (t) => {
        // ---------- rows 1 to 3 ----------
        const pops = [0, 1, 2].map((i) => pop(t, 0.5 + 0.12 * i, 0.55));
        [0, 1, 2].forEach((i) => {
          names[i].set({ y: 0, s: 0.7 + 0.3 * pops[i], o: Math.min(1, pops[i] * 3) });
        });
        simple(bin, { at: BIN_AT, f0: 1.6, f1: 2.1, green: 2.3, pop: pops[0] }, t, BIN.map(String), BIN2.map(String));
        simple(int, { at: INT_AT, f0: 2.8, f1: 3.3, green: 3.5, pop: pops[1] }, t, INT.map(String), INT2.map(String));
        simple(real, { at: REAL_AT, f0: 4.0, f1: 4.5, green: 4.7, pop: pops[2] }, t, REAL.map(f2), REAL2.map(f2));

        // operator tags
        const opAt = [1.5, 2.6, 3.8, 5.0];
        ops.forEach((o, i) => {
          const k = pop(t, opAt[i], 0.4);
          o.set({ s: 0.7 + 0.3 * k, o: Math.min(1, k * 3) });
        });
        // the tour row's tag changes to "swap"
        const swapK = pop(t, 8.5, 0.4);
        ops[3].set({
          text: t >= 8.5 ? "swap" : "re-roll",
          s: t >= 8.5 ? 0.7 + 0.3 * swapK : 0.7 + 0.3 * pop(t, 5.0, 0.4),
          o: t >= 8.5 ? Math.min(1, swapK * 3) : Math.min(1, pop(t, 5.0, 0.4) * 3),
        });

        // dice above the re-rolled genes
        rollDie(die[0], t, 2.6, 3.3, 3.4, int.mid(INT_AT).x, ROW_Y[1] - 28);
        rollDie(die[1], t, 5.0, 5.9, 6.5, tour.mid(TOUR_AT).x, ROW_Y[3] - 28);

        // bell curve above the nudged gene, its dot moves with the nudge
        const nudge = ramp(t, 4.0, 4.5, E.inOut);
        const bk = ramp(t, 3.8, 4.4);
        bell.set({ k: bk, mark: bk > 0.98 ? 0.5 + 0.12 * nudge : undefined, o: bk > 0 ? 1 : 0 });
        const pk = pop(t, 4.4, 0.4);
        plus.set({ s: 0.7 + 0.3 * pk, o: Math.min(1, pk * 3) });

        // ---------- row 4: the tour ----------
        const rp = pop(t, 5.0, 0.55);
        names[3].set({ s: 0.7 + 0.3 * rp, o: Math.min(1, rp * 3) });
        const kA = ramp(t, 5.9, 6.4, E.inOut);
        const kB = ramp(t, 7.8, 8.3, E.inOut);
        const kS = ramp(t, 8.7, 9.5, E.inOut);
        const shake = Math.sin(t * 60) * 7 * (1 - ramp(t, 6.4, 7.1, E.lin)) * (t >= 6.4 ? 1 : 0);
        const base = { s: 0.6 + 0.4 * rp, o: Math.min(1, rp * 3) };
        const done = t >= 9.5;
        const red = t >= 6.4 && t < 8.05;
        tour.all((i) => {
          if (i === 0) return { ...base, tone: done ? "green" : red ? "red" : "grey", x: red ? shake : 0 };
          if (i === 2) return { ...base, tone: done ? "green" : "grey" };
          return base;
        });
        // gene 4 (J): J -> D, then D -> J
        if (t < 7.8) {
          tour.flip(TOUR_AT, kA, {
            ...base,
            from: TOUR[TOUR_AT],
            to: BROKEN[TOUR_AT],
            tone: t >= 5.9 ? "blue" : "grey",
            toTone: "red",
            hop: 18,
            x: t >= 6.4 ? shake : 0,
          });
        } else if (t < 8.3) {
          tour.flip(TOUR_AT, kB, {
            ...base,
            from: BROKEN[TOUR_AT],
            to: TOUR[TOUR_AT],
            tone: "red",
            toTone: "grey",
            hop: 18,
          });
        } else {
          tour.set(TOUR_AT, { ...base, text: TOUR[TOUR_AT], tone: done ? "green" : "grey" });
        }
        // genes 2 and 5 hop past each other
        const arc = Math.sin(Math.PI * kS);
        const gap = 90 * (SWAP[1] - SWAP[0]);
        const moving = kS > 0 && kS < 1;
        const swapTone = done ? "blue" : moving ? "purple" : "grey";
        tour.set(SWAP[0], { ...base, tone: swapTone, x: gap * kS, y: -38 * arc, s: base.s * (1 + 0.1 * arc) });
        tour.set(SWAP[1], { ...base, tone: swapTone, x: -gap * kS, y: 38 * arc, s: base.s * (1 + 0.1 * arc) });
        tour.tiles[SWAP[0]].style.zIndex = moving ? "3" : "";
        tour.tiles[SWAP[1]].style.zIndex = moving ? "2" : "";

        // the missing J appears after the row while the tour is broken
        const gk = pop(t, 6.4, 0.4) * (1 - ramp(t, 7.8, 8.1));
        ghost.set(0, { tone: "orange", ghost: true, s: 0.6 + 0.4 * gk, o: Math.min(1, gk * 3) });

        // validity badge
        const bk1 = pop(t, 6.5, 0.5);
        const bk2 = pop(t, 9.6, 0.5);
        if (t >= 9.6) badge("valid", bk2);
        else if (t >= 6.5 && t < 7.8) badge("invalid", bk1 * (1 - ramp(t, 7.6, 7.8)));
        else badge("none", 0);
      };
    },
  });
})();
