/* Lecture 7 · scene-07-trail: a pheromone trail GAINS from the ants that walk it and LOSES a fifth to evaporation every step, so it
   levels off where gain equals loss (ants per step / evaporation: 4 / 0.2 = 20 and 2 / 0.2 = 10). A new ant picks a trail with
   chance equal to its share (20 of 30 = 67%). If the ants stop, nothing refills it and it fades away. Two tanks fill and leak,
   run on the lesson's own numbers (L7.TRAIL / L7.trailAt, asserted below). Local seconds: 0.2-1.3 everything pops, 1.4-6.4 steps
   0 to 24 (slow at first so the first steps can be read, then a fast forward that spreads the levelling off over the caption), 6.4
   the '=' signs, the dashed marks and their '20' / '10' labels (the pills already read +4 and -4.0), 6.4-10.4 the step counter
   creeps on to 30, 6.8-7.1 the equation cards, 8.7-10.1 the chance tag and bars, 10.4-10.7 the ants fade, 10.6 the red 'ants stop'
   tag, 11.0-13.5 steps 30 to 50 while the tanks drain. The tag above each tank shows its live level. Ants drip pheromone into
   their tank (one drip per ant per 0.4 s) and purple bubbles evaporate off the surface. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const E = V.ease;
  const { ramp, clamp } = V;
  const lin = E.lin;
  const f1 = (n) => n.toFixed(1);
  const fract = (x) => x - Math.floor(x);

  // ---------- facts (asserted: a wrong number throws) ----------
  const TR = L7.TRAIL;
  const round1 = (x) => Math.round(x * 10) / 10;
  L7.same("scene 7 trail rules", [TR.rho, TR.ants.a, TR.ants.b, TR.stop, TR.steps], [0.2, 4, 2, 30, 50]);
  L7.same("scene 7 levels at step 30 (A, B)", [round1(TR.a[30]), round1(TR.b[30])], [20, 10]);
  L7.same("scene 7 levels at step 40 (A, B)", [round1(TR.a[40]), round1(TR.b[40])], [2.1, 1.1]);
  L7.close("scene 7 trail A at step 50", TR.a[50], 0.23, 0.005);
  L7.close("scene 7 trail B at step 50", TR.b[50], 0.12, 0.005);
  L7.same("scene 7 levels where gain equals loss", [TR.eq.a, TR.eq.b], [4 / 0.2, 2 / 0.2]);
  L7.same("scene 7 chance of picking A and B", [TR.chance.a, TR.chance.b], [67, 33]);
  L7.same("scene 7 chance is the share of 20 + 10", [Math.round((100 * TR.eq.a) / (TR.eq.a + TR.eq.b))], [67]);

  // what the two pills under a tank say at a step: the gain of this step and what evaporates in it
  const gainText = (v) => (v ? `+${v}` : "0"); // nothing gained is a plain 0, never '+0'
  const lossText = (v) => (v < 0.001 ? "0" : `-${v.toFixed(v < 0.095 ? 2 : 1)}`); // nothing lost is a plain 0, never '-0'
  const pillsAt = (T) => {
    const s = L7.trailAt(T);
    return [gainText(s.gainA), lossText(s.lossA), gainText(s.gainB), lossText(s.lossB)];
  };
  L7.same("scene 7 pills at step 2", pillsAt(2), ["+4", "-0.8", "+2", "-0.4"]);
  L7.same("scene 7 pills at step 30 (gain balances loss)", pillsAt(30), ["+4", "-4.0", "+2", "-2.0"]);
  L7.same("scene 7 pills at step 50 (the ants have stopped)", pillsAt(50), ["0", "-0.06", "0", "-0.03"]);
  L7.same("scene 7 pills at step 0 (nothing gained or lost yet)", pillsAt(0), ["0", "0", "0", "0"]);
  const EQ_CARD = [`A: ${TR.ants.a} ÷ ${TR.rho} = ${TR.eq.a}`, `B: ${TR.ants.b} ÷ ${TR.rho} = ${TR.eq.b}`];
  L7.same("scene 7 equation cards", EQ_CARD, ["A: 4 ÷ 0.2 = 20", "B: 2 ÷ 0.2 = 10"]);
  L7.same("scene 7 a fifth is the evaporation 0.2", 1 / TR.rho, 5);
  const TOTAL = TR.eq.a + TR.eq.b;
  const CHANCE_TAG = `chance: ${TR.eq.a} ÷ ${TOTAL}, ${TR.eq.b} ÷ ${TOTAL}`;
  L7.same("scene 7 chance tag (20 of 30 and 10 of 30)", CHANCE_TAG, "chance: 20 ÷ 30, 10 ÷ 30");

  // ---------- step time T(t): the first steps are slow enough to read, then a fast forward that eases to a stop at step 30 ----------
  const T_RUN = 1.4; // the ants start walking
  const T_LEVEL = 6.4; // the trails have levelled off (step 24 of 30)
  const T_DONE = 10.4; // step 30, the last one the ants walk
  const T_STOP = 11.0; // the ants have stopped: steps 30 to 50 (the drain)
  const DRAIN = 8; // steps per second after the ants stop
  const KNOTS = [
    [T_RUN, 0],
    [3.4, 5],
    [T_LEVEL, 24],
    [T_DONE, TR.stop],
    [T_STOP, TR.stop],
  ];
  // a monotone cubic through the knots (Fritsch-Butland slopes), so the speed never jumps
  const gap = KNOTS.slice(1).map((k, i) => k[0] - KNOTS[i][0]);
  const secant = KNOTS.slice(1).map((k, i) => (k[1] - KNOTS[i][1]) / gap[i]);
  const slope = KNOTS.map((_k, i) => {
    if (i === 0) return secant[0];
    if (i === KNOTS.length - 1) return secant[i - 1];
    if (secant[i - 1] * secant[i] <= 0) return 0;
    const w1 = 2 * gap[i] + gap[i - 1];
    const w2 = gap[i] + 2 * gap[i - 1];
    return (w1 + w2) / (w1 / secant[i - 1] + w2 / secant[i]);
  });
  const hermite = (t) => {
    const i = KNOTS.findIndex((_k, j) => j < KNOTS.length - 1 && t < KNOTS[j + 1][0]);
    const s = (t - KNOTS[i][0]) / gap[i];
    const [s2, s3] = [s * s, s * s * s];
    return (
      (2 * s3 - 3 * s2 + 1) * KNOTS[i][1] +
      (s3 - 2 * s2 + s) * gap[i] * slope[i] +
      (3 * s2 - 2 * s3) * KNOTS[i + 1][1] +
      (s3 - s2) * gap[i] * slope[i + 1]
    );
  };
  const tickAt = (t) => {
    if (t <= T_RUN) return 0;
    if (t < T_STOP) return hermite(t);
    return Math.min(TR.steps, TR.stop + (t - T_STOP) * DRAIN);
  };
  L7.close("scene 7 step 5 at 3.4 s", tickAt(3.4), 5, 1e-9);
  L7.close("scene 7 step 24 at 6.4 s", tickAt(T_LEVEL), 24, 1e-9);
  L7.close("scene 7 step 30 at 10.4 s", tickAt(T_DONE), 30, 1e-9);
  L7.close("scene 7 step 30 stays until 11.0 s", tickAt(T_STOP - 0.001), 30, 1e-9);
  L7.close("scene 7 step 50 at 13.5 s", tickAt(T_STOP + (TR.steps - TR.stop) / DRAIN), 50, 1e-9);
  L7.same(
    "scene 7 the step never runs backwards",
    Array.from({ length: 1301 }, (_, i) => tickAt(i / 100)).every((v, i, a) => i === 0 || v >= a[i - 1] - 1e-9),
    true,
  );
  L7.same("scene 7 pills at 6.4 s (gain balances loss)", pillsAt(tickAt(T_LEVEL)), ["+4", "-4.0", "+2", "-2.0"]);

  // ---------- layout (stage px) ----------
  const TANK_Y = 154;
  const HEAD_Y = 12; // 12 px stage margin
  const TANKS = [
    { x: 40, w: 220, tone: "blue", name: "trail A", n: TR.ants.a, eq: TR.eq.a, pct: TR.chance.a },
    { x: 300, w: 220, tone: "blue", name: "trail B", n: TR.ants.b, eq: TR.eq.b, pct: TR.chance.b },
  ];
  TANKS.forEach((k) => (k.cx = k.x + k.w / 2));
  const ANT_Y = 110;
  const ANT_SIZE = 42;
  const PILL_Y = 502;
  const PILL = { w: 84, h: 54, gap: 52 }; // gain pill, a gap for '=', loss pill (both as wide as their tank)
  const RX = 552;
  const RW = 366; // the right column ends 18 px inside the stage, so a popping card stays inside the margin
  // the ants above a tank: one per ant that walks the trail each step, centred over it
  const ANTS = TANKS.flatMap((k, ti) =>
    Array.from({ length: k.n }, (_, i) => ({ tank: ti, i, x: k.cx + 50 * (i - (k.n - 1) / 2) })),
  );
  L7.same("scene 7 ants above the tanks", [ANTS.length, ANTS.filter((a) => a.tank === 0).length], [6, 4]);
  // widths of the tag texts (28 px, weight 900) as the browser draws them, plus the tag's own padding
  const TAG_W = { "trail A": 220, "trail B": 220, "ants stop": 172 }; // the tank tags are 220 px wide: they show 'trail A: 20.0'
  const AT = { tags: 0.2, tanks: 0.35, ants: 0.55, pills: 0.7, step: 0.9, legend: 1.0 };
  const T_ANTS_OFF = [10.4, 10.7]; // the ants fade out
  const CYCLE = 0.4; // one bob and one drip per ant in this many seconds
  const FALL = 0.34; // seconds a drip takes to reach the pheromone
  const VAPOUR = [
    [75, 125, 175, 25],
    [110, 160, 60, 190],
  ]; // x of the vapour bubbles above each tank, from the tank's left edge
  const VAPOUR_LOSS = [0.15, 1.0, 2.2, 3.2]; // the loss at which the first, second ... bubble shows

  V.scene({
    kicker: "PHEROMONE TRAILS",
    title: ["Trails build up", "and fade away"],
    dur: 14.1,
    caps: [
      [1.4, 3.4, "Each step, ants add pheromone."],
      [3.6, 6.2, "Each step, a fifth of it evaporates."],
      [6.4, 8.6, "It levels off where gain equals loss."],
      [8.9, 10.9, "Stronger trails get picked more."],
      [11.1, 13.5, "If the ants stop, the trail fades away."],
    ],
    build(stage) {
      const blue = L7.tone("blue");
      const purple = L7.tone("purple");
      const orange = L7.tone("orange");

      // tags over the tanks, then the tanks
      const centred = (text, cx, y, tone, solid) => {
        const w = TAG_W[text];
        const t = L7.tag(stage, { x: cx - w / 2, y, text, tone, solid });
        t.el.style.width = `${w}px`;
        return t;
      };
      const heads = TANKS.map((k) => centred(k.name, k.cx, HEAD_Y, "blue", false));
      const tanks = TANKS.map((k) => L7.tank(stage, { x: k.x, y: TANK_Y, w: k.w, h: 330, max: 24, tone: "blue" }));

      // the pills under each tank: this step's gain (blue), this step's loss (purple), and an orange '=' between them
      const mkPill = (x, tone) => {
        const p = L7.tag(stage, { x, y: PILL_Y, text: "+0", tone, solid: true, h: PILL.h });
        Object.assign(p.el.style, { width: `${PILL.w}px`, padding: "0" });
        return p;
      };
      const pills = TANKS.map((k) => ({
        gain: mkPill(k.x, "blue"),
        loss: mkPill(k.x + PILL.w + PILL.gap, "purple"),
      }));

      // the svg layer above the tanks: ants, drips of pheromone, vapour, the '=' signs
      const svg = V.s("svg", {
        width: 936,
        height: 640,
        style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
      });
      stage.append(svg);
      const eqs = TANKS.map((k) => {
        const cy = PILL_Y + PILL.h / 2;
        const bar = (dy) =>
          V.s("rect", {
            x: f1(k.cx - 13),
            y: f1(cy + dy),
            width: 26,
            height: 7,
            rx: 3.5,
            style: { fill: orange.c },
          });
        return svg.appendChild(V.s("g", {}, bar(-10), bar(3)));
      });
      const drip = () =>
        V.s("ellipse", {
          rx: 7,
          ry: 10,
          "stroke-width": "3",
          style: { fill: blue.c, stroke: blue.lip },
        });
      const ants = ANTS.map((a) => ({
        ...a,
        g: svg.appendChild(L7.ant(0, 0, ANT_SIZE)),
        drip: svg.appendChild(drip()),
      }));
      const vapour = TANKS.map((_, ti) =>
        VAPOUR[ti].map((_x, j) =>
          svg.appendChild(V.s("circle", { r: 8, fill: "none", "stroke-width": "4", style: { stroke: purple.c } })),
        ),
      );

      // 'ants stop' where the ants were
      const stopTag = centred("ants stop", 270, ANT_Y - 29, "red", true);

      // right column: the step counter, the legend, the equations, the chance bars
      const step = L7.stat(stage, { x: RX, y: 12, w: RW, h: 76, label: "step", tone: "grey" });
      const gainTag = L7.tag(stage, { x: RX, y: 104, text: "gain: ants add", tone: "blue", solid: true });
      const lossTag = L7.tag(stage, { x: RX, y: 170, text: `loss: a fifth (${TR.rho})`, tone: "purple", solid: true });
      const cards = EQ_CARD.map((text, i) =>
        L7.card(stage, { x: RX, y: 250 + 70 * i, w: RW, h: 62, text, tone: "blue", plain: true, fs: 32 }),
      );
      const chanceTag = L7.tag(stage, { x: RX, y: 402, text: CHANCE_TAG, tone: "grey" });
      // the dashed marks are labelled with the level they stand for (20 and 10), in the gap between the tanks
      const markLabels = TANKS.map((k, i) =>
        L7.text(stage, {
          x: 260,
          y: tanks[i].yOf(k.eq) - 22,
          w: 40,
          text: String(k.eq),
          fs: 30,
          tone: "orange",
          align: "center",
        }),
      );
      const bars = TANKS.map((k, i) => {
        const b = L7.bar(stage, { x: RX, y: 474 + 66 * i, w: RW, h: 56, tone: "orange" });
        b.el.lastChild.style.left = "14px"; // a little closer to the edge, so 'B 33%' fits inside its short bar
        return b;
      });

      return (t) => {
        const T = tickAt(t);
        const s = L7.trailAt(T);
        const level = [s.a, s.b];
        const loss = [s.lossA, s.lossB];
        const text = pillsAt(T);

        // ---- tags, tanks, pills ----
        heads.forEach((h, i) =>
          h.set({
            text: `${TANKS[i].name}: ${level[i].toFixed(1)}`, // the live level
            k: ramp(t, AT.tags + 0.1 * i, AT.tags + 0.1 * i + 0.35, lin),
          }),
        );
        tanks.forEach((tk, i) => {
          const k = ramp(t, AT.tanks + 0.1 * i, AT.tanks + 0.1 * i + 0.4, lin);
          const m = t >= T_LEVEL + 0.05 ? [TANKS[i].eq] : [null];
          tk.set({ v: level[i], k, mark: m[0] });
        });
        pills.forEach((p, i) => {
          const k0 = AT.pills + 0.1 * i;
          p.gain.set({ text: text[2 * i], k: ramp(t, k0, k0 + 0.35, lin) });
          p.loss.set({ text: text[2 * i + 1], k: ramp(t, k0 + 0.05, k0 + 0.4, lin) });
        });

        // '=' appears once the level is reached (gain equals loss), and goes when the ants stop
        eqs.forEach((g, i) => {
          const k = ramp(t, T_LEVEL + 0.1 * i, T_LEVEL + 0.1 * i + 0.4, E.pop);
          const gone = 1 - ramp(t, T_ANTS_OFF[0], T_ANTS_OFF[1] + 0.2, lin);
          V.place(g, { s: 0.6 + 0.4 * k, o: Math.min(1, k * 4) * gone });
        });

        // ---- ants: bob in time, one drip each per cycle, and fade out when they stop ----
        const walking = 1 - ramp(t, T_ANTS_OFF[0], T_ANTS_OFF[1], lin);
        ants.forEach((a, idx) => {
          const k = ramp(t, AT.ants + 0.1 * idx, AT.ants + 0.1 * idx + 0.3, E.pop);
          const c = (t - T_RUN) / CYCLE - 0.23 * a.i; // this ant's cycle count
          const bob = 5 * ramp(t, T_RUN, T_RUN + 0.3, lin) * Math.sin(2 * Math.PI * c);
          const y = ANT_Y + bob - (1 - k) * 14;
          V.place(a.g, { x: a.x, y, s: Math.max(0.01, k), o: Math.min(1, k * 4) * walking });
          // the drip leaves when the ant is at the bottom of its bob and falls to the surface of the pheromone
          const d = c - 0.25;
          const age = fract(d) * CYCLE;
          const surf = tanks[a.tank].yOf(level[a.tank]);
          const y0 = ANT_Y + 5 + ANT_SIZE * 0.4;
          const p = age / FALL;
          const live = d >= 0 && p < 1 && walking > 0.001 && surf > y0 + 4;
          if (!live) return V.show(a.drip, 0);
          a.drip.setAttribute("cx", f1(a.x));
          a.drip.setAttribute("cy", f1(y0 + (surf - y0) * p));
          a.drip.setAttribute("rx", f1(7 * (1 - 0.5 * p ** 4)));
          a.drip.setAttribute("ry", f1(10 * (1 - 0.5 * p ** 4)));
          V.show(a.drip, Math.min(1, p * 8) * walking);
        });

        // ---- vapour: a few purple bubbles rise off a trail while it is losing pheromone ----
        vapour.forEach((row, ti) => {
          const surf = tanks[ti].yOf(level[ti]);
          row.forEach((b, j) => {
            const c = fract(t / 1.3 + 0.29 * j + 0.13 * ti);
            const vis = clamp((loss[ti] - VAPOUR_LOSS[j]) / 0.5);
            if (vis <= 0.001) return V.show(b, 0);
            b.setAttribute("cx", f1(TANKS[ti].x + VAPOUR[ti][j] + 6 * Math.sin(2 * Math.PI * c)));
            b.setAttribute("cy", f1(surf - 14 - 40 * c));
            b.setAttribute("r", f1(5 + 4 * c));
            V.show(b, vis * Math.sin(Math.PI * c));
          });
        });

        // ---- the right column ----
        step.set({ text: String(s.step), k: ramp(t, AT.step, AT.step + 0.35, lin) });
        gainTag.set({ k: ramp(t, AT.legend, AT.legend + 0.35, lin) });
        lossTag.set({ k: ramp(t, AT.legend + 0.1, AT.legend + 0.45, lin) });
        cards.forEach((c, i) => {
          const t0 = 6.8 + 0.3 * i;
          c.set({ k: ramp(t, t0, t0 + 0.35, lin) });
        });
        chanceTag.set({ k: ramp(t, 8.7, 9.05, lin) });
        markLabels.forEach((m, i) => m.set({ k: ramp(t, T_LEVEL + 0.05 + 0.1 * i, T_LEVEL + 0.4 + 0.1 * i, lin) }));
        bars.forEach((b, i) => {
          const pop = ramp(t, 8.7 + 0.15 * i, 9.05 + 0.15 * i, lin);
          const fill = ramp(t, 9.0 + 0.3 * i, 9.8 + 0.3 * i, E.out);
          b.set({
            k: (fill * TANKS[i].pct) / 100,
            text: fill > 0 ? `${i ? "B" : "A"} ${Math.round(fill * TANKS[i].pct)}%` : `${i ? "B" : "A"}`,
            o: pop,
            y: (1 - pop) * 10,
          });
        });

        // ---- the ants stop ----
        stopTag.set({ k: ramp(t, 10.6, 10.95, lin) });
      };
    },
  });
})();
