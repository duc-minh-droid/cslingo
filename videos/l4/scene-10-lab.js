/* Lecture 4 · scene 10: the EA lab. Two lecture algorithms race to copy a 12 x 12 heart; every picture and number comes from
   L4.evolveLab (real runs, seed 1), driven by one shared evaluation counter. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const L5 = V.l5;
  const { place, ramp, ease } = V;
  const pop = (t, a, d = 0.4) => ease.pop(ramp(t, a, a + d, ease.lin));
  const text = (el, v) => el.textContent !== v && (el.textContent = v);

  V.scene({
    kicker: "EA LAB",
    title: ["Put it together:", "evolve a picture"],
    dur: 11,
    caps: [
      [0.8, 3.4, "Fitness: pixels that match, blank ones too."],
      [3.6, 6.0, "Two recipes race. Both rely on mutation."],
      [6.6, 10.5, "Algorithm 1 got there first, in this run."],
    ],
    build(stage) {
      const T = L4.HEART;
      const runs = [L4.evolveLab("ss", 1), L4.evolveLab("gen", 1)];
      if (runs[0].evals !== 3069 || runs[1].evals !== 4844 || runs.some((r) => r.at(30).fit !== 88))
        throw new Error("scene 10: lab runs changed, check the lecture data");
      const MAXE = runs[1].evals;
      const T0 = 1.6;
      const T1 = 9.0;
      const done = runs.map((r) => T0 + ((T1 - T0) * r.evals) / MAXE);
      const svg = L5.svg(stage);

      const tTarget = L4.tag(stage, { x: 468, y: 12, text: "target", tone: "green", anchor: "c" });
      const target = L4.pixels(stage, { x: 384, y: 66, cell: 14 });
      target.set({ bits: T, tone: "green" });
      const tEvals = L4.tag(stage, { x: 468, y: 250, text: "evals 30", tone: "grey", anchor: "c" });

      const panels = [
        { cx: 180, x: 48, name: "algorithm 1", recipe: ["steady-state", "tournament t = 3", "replace worst", "mutation"], tickX: 324 },
        { cx: 756, x: 624, name: "algorithm 2", recipe: ["generational", "1 elite", "rank", "crossover + mutation"], tickX: 612 },
      ].map((p, i) => {
        const head = L4.tag(stage, { x: p.cx, y: 12, text: p.name, tone: "blue", anchor: "c" });
        const pic = L4.pixels(stage, { x: p.x, y: 66, cell: 22 });
        const count = V.h("div", {
          class: "v-text",
          style: {
            left: `${p.cx - 130}px`,
            top: "326px",
            width: "260px",
            textAlign: "center",
            fontSize: "44px",
            fontWeight: "900",
            color: "var(--ink)",
          },
        });
        stage.append(count);
        const fin = L4.tag(stage, {
          x: p.cx,
          y: 380,
          text: `${L4.commas(runs[i].evals)} evaluations`,
          tone: "green",
          anchor: "c",
        });
        const tick = L5.tick(p.tickX, 360, 40, "green", { on: true });
        const disc = V.s("circle", {
          cx: p.tickX,
          cy: 360,
          r: 30,
          style: { fill: "var(--teal)", stroke: "var(--teal-lip)", strokeWidth: 3 },
        });
        const tg = V.s("g", {}, disc, tick);
        svg.append(tg);
        const recipe = p.recipe.map((txt, k) =>
          L4.tag(stage, { x: p.cx, y: 440 + 48 * k, text: txt, tone: "grey", anchor: "c" }),
        );
        return { ...p, head, pic, count, fin, tg, tick, recipe };
      });

      return (t) => {
        const pt = pop(t, 0.5);
        tTarget.set({ s: 0.7 + 0.3 * pt, o: pt });
        target.set({ bits: T, tone: "green", o: pt });
        const e = 4844 * ramp(t, T0, T1, ease.lin);
        const shown = Math.max(30, Math.round(e));
        tEvals.set({ text: `evals ${L4.commas(shown)}`, o: pop(t, 0.9) });
        panels.forEach((p, i) => {
          const q = pop(t, 0.7 + 0.2 * i);
          const at = runs[i].at(shown);
          const fin = t >= done[i];
          const bits = fin ? T : at.bits;
          p.head.set({ s: 0.7 + 0.3 * q, o: q });
          p.pic.set({ bits, target: T, wrong: !fin, tone: fin ? "green" : "blue", o: q });
          text(p.count, `${fin ? 144 : at.fit} / 144`);
          p.count.style.color = fin ? "var(--teal-ink)" : "var(--ink)";
          V.show(p.count, q);
          const k = ramp(t, done[i], done[i] + 0.5, ease.lin);
          const pk = pop(t, done[i], 0.45);
          place(p.tg, { s: Math.max(0.001, pk), o: pk });
          L5.drawOn(p.tick, k);
          p.fin.set({ s: 0.7 + 0.3 * pk, o: pk });
          p.recipe.forEach((r, j) => {
            const rq = pop(t, 1.0 + 0.2 * j + 0.2 * i, 0.35);
            r.set({ s: 0.7 + 0.3 * rq, o: rq });
          });
        });
      };
    },
  });
})();
