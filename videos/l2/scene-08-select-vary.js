/* Lecture 2 video, scene 8: the EA loop, Select then Vary, on the lecture's population of 10 solutions. */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const J = { x: 620, y: 152 };
  const BASE = 560;
  const SCALE = 290; // the dice: where the two parents meet
  const LIFT = 20;
  const [P1, P2] = L2.PARENTS; // S5, S9
  const [K1, K2] = L2.KIDS.map((q) => q.id);

  V.scene({
    kicker: "THE EA LOOP",
    title: ["Select parents,", "then vary them"],
    dur: 11,
    caps: [
      [0.4, 2.2, "A population: 10 solutions, each with a fitness."],
      [2.4, 4.6, "Select: fitter ones are more likely, not only the best."],
      [5.0, 8.4, "Vary: children can be better or worse."],
      [8.6, 10.6, "Next: who stays?"],
    ],
    build(stage) {
      const items = L2.POP.concat(L2.KIDS);
      const strip = L2.loopStrip(stage, { x: 48, y: 14, w: 840 });
      const pop = L2.bars(stage, { items, x: 24, base: BASE, pitch: 72, w: 60, scale: SCALE });
      const svg = L5.svg(stage);
      const mk = (x1, y1, x2, y2, tone, opt) => {
        const g = L5.arrow(x1, y1, x2, y2, tone, 1, opt);
        svg.append(g);
        return g;
      };
      const top = (id) => BASE - L2.byId(id).f * SCALE - LIFT;
      const sx = (id) => pop.slotX(+id.slice(1) - 1);
      // two curved arrows from the parents up and over the other bars to the dice
      const a1 = mk(sx(P1), top(P1) - 48, J.x - 34, J.y + 4, "purple", { bow: 70, w: 8, head: 24 });
      const a2 = mk(sx(P2), top(P2) - 48, J.x - 6, J.y + 34, "purple", { bow: 40, w: 8, head: 24 });
      // from the dice down to the two children
      const c1 = mk(J.x - 10, J.y + 30, sx(K1), pop.valueY(K1) - 10, "purple", { w: 8, head: 20 });
      const c2 = mk(J.x + 22, J.y + 30, sx(K2), pop.valueY(K2) - 10, "purple", { w: 8, head: 20, bow: 90 });
      const up = mk(sx(K1), 630, sx(K1), 606, "green", { w: 6, head: 16 });
      const down = mk(sx(K2), 606, sx(K2), 630, "red", { w: 6, head: 16 });
      const diceG = V.s("g", {});
      const varyTag = L2.tag(stage, { text: "mutate + mix", tone: "purple", x: 920, y: J.y, anchor: "r" });
      const chance = L2.tag(stage, { text: "taller bar, bigger chance", tone: "orange", x: 924, y: 190, anchor: "tr" });
      svg.append(diceG);
      let lastFace = 0;

      return (t) => {
        strip.update({
          k: ramp(t, 0.2, 1.2, E.lin),
          active: t < 1.9 ? -1 : t < 4.6 ? 0 : 1,
          pulse: Math.max(flash(t, 1.9, 2.5), flash(t, 4.6, 5.2)),
          loop: 0,
          ghost: 1,
        });
        // the bars
        const pick = ramp(t, 2.2, 3.0, E.back);
        const drop = ramp(t, 8.2, 8.8, E.inOut);
        const lift = pick * (1 - drop);
        const halo = ramp(t, 2.2, 3.0) * (1 - drop);
        L2.POP.forEach((q, i) => {
          const g = ramp(t, 0.4 + 0.1 * i, 0.9 + 0.1 * i, E.pop);
          const parent = q.id === P1 || q.id === P2;
          const on = parent && t >= 2.2 && t < 8.8 ? lift : 0;
          pop.set(q.id, {
            grow: g,
            value: g > 0.02 ? undefined : false,
            o: ramp(t, 0.4 + 0.1 * i, 0.6 + 0.1 * i, E.lin),
            dy: -LIFT * on,
            tone: parent && t >= 2.2 && t < 8.8 ? "orange" : "grey",
            solid: parent && t >= 2.2 && t < 8.8,
            ring: parent ? halo : 0,
            s: parent ? 1 + 0.06 * flash(t, 2.4, 3.2) : 1,
          });
        });
        L2.KIDS.forEach((q, i) => {
          const g = ramp(t, 5.9, 6.9, E.out);
          pop.set(q.id, {
            grow: g,
            o: g > 0 ? 1 : 0,
            tone: "purple",
            solid: true,
            slot: 10 + i,
            value: g > 0.01 ? undefined : false,
          });
        });
        // arrows
        const fade = 1 - drop;
        [
          [a1, 4.8, 5.6],
          [a2, 4.9, 5.7],
        ].forEach(([g, a, b]) => {
          const k = ramp(t, a, b, E.inOut);
          V.show(g, k > 0 ? fade : 0);
          L5.drawOn(g, k);
        });
        [
          [c1, 6.0, 6.8],
          [c2, 6.0, 6.8],
        ].forEach(([g, a, b]) => {
          const k = ramp(t, a, b, E.inOut);
          V.show(g, k > 0 ? 1 : 0);
          L5.drawOn(g, k);
        });
        [
          [up, 7.2],
          [down, 7.4],
        ].forEach(([g, a]) => {
          const k = ramp(t, a, a + 0.8, E.pop);
          V.place(g, { s: 0.4 + 0.6 * k, o: Math.min(1, k * 3) });
        });
        const kc = ramp(t, 2.5, 2.9, E.lin) * (1 - ramp(t, 4.4, 4.6, E.lin));
        chance.set({ o: kc, s: 0.8 + 0.2 * E.pop(kc) });
        const kv = ramp(t, 6.2, 6.6, E.lin);
        varyTag.set({ o: kv, s: 0.8 + 0.2 * E.pop(kv) });
        // the dice rolls, then rests on 5
        const k = ramp(t, 5.5, 5.9, E.back);
        const face = t < 6.2 ? 1 + (((Math.floor((t - 5.6) * 6) % 6) + 6) % 6) : 5;
        if (face !== lastFace) {
          diceG.replaceChildren(L5.dice(J.x, J.y, 44, { face, tone: "purple" }));
          lastFace = face;
        }
        V.place(diceG, { s: 0.3 + 0.7 * k, o: Math.min(1, k * 3), r: t > 5.5 && t < 6.2 ? Math.sin(t * 30) * 12 : 0 });
      };
    },
  });
})();
