/* Lecture 4 · scene 03, replacement.
   Two steady-state panels run side by side with the same five slots and the same child (0.5). Both scan from slot 1 with an
   orange cursor. Replace first weaker stops at the first slot weaker than the child (3 looks) and crosses off the ones before it;
   replace weakest checks all five (5 looks) and evicts the 0.1. The child drops into the evicted slot. The 0.1 that survives in
   panel B is tagged. Slots, looks and results come from L4.replaceWeakest / L4.replaceFirstWeaker. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const L5 = V.l5;
  const { ramp, ease } = V;
  const slots = L4.POP_SLOTS;
  const CHILD = 0.5;
  const A = L4.replaceWeakest(slots, CHILD);
  const B = L4.replaceFirstWeaker(slots, CHILD);
  if (
    JSON.stringify(A.pop) !== "[0.7,0.8,0.3,0.9,0.5]" ||
    A.idx !== 4 ||
    A.looks !== 5 ||
    JSON.stringify(B.pop) !== "[0.7,0.8,0.5,0.9,0.1]" ||
    B.idx !== 2 ||
    B.looks !== 3
  )
    throw new Error("scene 03: replacement results changed, check the lecture data");

  const TX = 348;
  const TS = 96;
  const GAP = 12;
  const ROWS = [140, 440];
  const SCAN = 1.6;
  const STEP = 0.45;
  // per panel: where the child goes (idx), when the stop tile turns red, slide, drop and flip windows
  const PANELS = [
    { name: "replace weakest", res: A, red: 3.9, slide: [4.0, 4.6], drop: [4.6, 5.1], flip: [5.0, 5.4], cross: false },
    {
      name: "replace first weaker",
      res: B,
      red: 2.9,
      slide: [3.0, 3.5],
      drop: [3.5, 4.0],
      flip: [3.9, 4.3],
      cross: true,
    },
  ];
  const fmt = (v) => v.toFixed(1);
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, ease.lin));

  V.scene({
    kicker: "REPLACEMENT",
    title: ["A child needs a slot:", "who gets replaced?"],
    dur: 10,
    caps: [
      [0.8, 2.4, "A child with fitness 0.5 arrives."],
      [2.6, 6.0, "First weaker stops early. Weakest checks all five."],
      [6.2, 9.5, "The 0.1 survives: more variety is kept."],
    ],
    build(stage) {
      const svg = L5.svg(stage);
      const ps = PANELS.map((p, n) => {
        const y = ROWS[n];
        const row = L4.tiles(stage, { x: TX, y, vals: slots.map(fmt), w: TS, h: TS, gap: GAP, font: 48 });
        const name = L4.tag(stage, { x: 12, y: y + 6, text: p.name });
        const count = L4.tag(stage, { x: 12, y: y + 66, text: "0 looks" });
        const child = L4.tiles(stage, {
          x: TX,
          y: y - 120,
          vals: [fmt(CHILD)],
          w: TS,
          h: TS,
          font: 48,
          tone: "purple",
        });
        const marks = slots.map((_, i) => {
          const cx = TX + row.pos(i) + TS / 2;
          const cross = L5.cross(cx, y + TS + 26, 32, "grey");
          const tick = L5.tick(cx, y + TS + 26, 32, "green");
          svg.append(cross, tick);
          return { cross, tick };
        });
        const survive = L4.tag(stage, {
          x: TX + row.pos(4) + TS / 2,
          y: y + TS + 14,
          text: "survives",
          tone: "orange",
          anchor: "c",
        });
        return { p, y, row, name, count, child, marks, survive };
      });

      return (t) => {
        ps.forEach(({ p, y, row, name, count, child, marks, survive }, n) => {
          const stop = p.res.idx;
          const startAt = (i) => SCAN + STEP * i;
          const looks = Math.min(p.res.looks, Math.max(0, Math.floor((t - SCAN) / STEP) + 1));
          // header pop-in
          const a = pop(t, 0.5 + 0.1 * n);
          name.set({ s: Math.max(a, 0.001), o: Math.min(1, a * 2) });
          count.set({
            text: `${looks} looks`,
            s: Math.max(pop(t, 0.7 + 0.1 * n), 0.001),
            o: Math.min(1, pop(t, 0.7) * 2),
          });
          // tiles
          const tone = (i) => {
            if (i === stop && t >= p.red) return "red";
            if (i > stop && p.cross) return "grey"; // first weaker has stopped
            const last = i === stop ? p.red : startAt(i) + STEP;
            return t >= startAt(i) && t < last ? "orange" : "grey";
          };
          slots.forEach((_, i) => {
            const pp = pop(t, 0.5 + 0.08 * i + 0.1 * n);
            const base = { s: Math.max(pp, 0.001), o: Math.min(1, pp * 2), tone: tone(i) };
            if (i !== stop) return row.set(i, base);
            const f = ramp(t, p.flip[0], p.flip[1], ease.lin);
            return row.flip(i, f, { ...base, from: fmt(slots[i]), to: fmt(CHILD), toTone: "purple" });
          });
          // the child slides above the stop slot, then drops in and disappears into the flip
          const sl = ramp(t, p.slide[0], p.slide[1], ease.inOut);
          const dr = ramp(t, p.drop[0], p.drop[1], ease.in);
          const cp = pop(t, 0.5 + 0.1 * n);
          const gone = 1 - ramp(t, p.drop[1], p.drop[1] + 0.1, ease.lin);
          child.set(0, {
            x: row.pos(stop) * sl,
            y: 120 * dr,
            s: Math.max(cp, 0.001),
            o: Math.min(1, cp * 2) * gone,
          });
          // crosses and the tick (panel B only)
          marks.forEach((m, i) => {
            const cx = p.cross && i < stop ? ramp(t, startAt(i) + STEP, startAt(i) + STEP + 0.3, ease.lin) : 0;
            const tk = p.cross && i === stop ? ramp(t, startAt(i) + 0.1, startAt(i) + 0.4, ease.lin) : 0;
            L5.drawOn(m.cross, cx);
            L5.drawOn(m.tick, tk);
          });
          // "survives" under panel B's 0.1 (tile 5)
          if (n === 1) {
            const k = ramp(t, 6.0, 6.45, ease.lin);
            const sp = ease.pop(k);
            survive.set({
              s: Math.max(sp, 0.001),
              o: Math.min(1, k * 3),
              y: -6 * Math.sin(Math.PI * Math.min(1, k * 1.5)),
            });
          } else survive.set({ o: 0 });
        });
      };
    },
  });
})();
