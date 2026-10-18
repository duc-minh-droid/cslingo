/* Lecture 8 video, scene 7: the update. The update rule for ONE road: new trail = (1 - rho) x old trail + what the ants
   deposit. First evaporation (rho = 0.5 keeps half of the old 4), then every ant that used the road adds Q over its tour
   length, so shorter tours lay more. Lesson 8.3's ledger: trail 4, rho 0.5, Q 100, three ants whose tours (25, 50, 100 km)
   all use the road. Every figure comes from L8.LEDGER (the lesson's rule, run and asserted in l8/common.js) and is
   re-derived and asserted here. The road swells and shrinks with the trail (4 -> 2 -> 9): it starts big on the left, facing
   the tank on the right (so the stage is full from the first second), then glides up to sit over the tank.
   Story (local seconds): 0.2-0.9 the big road, the floor, the tank title, four blue blocks and the disc 4; 2.9-3.3
   the red evaporation tag, 3.3-4.3 two blocks turn red, float up and fade (the disc shows 2); 4.8-5.4 the road shrinks up to
   the tank to make room; 5.2-5.6 the green deposit tag, the 'L = tour length' label and 'ants using this road', then
   one row per ant (ant and tour chip, arrow, 'Q / L = deposit' chip) whose green blocks fly into the tank (the disc counts
   6, 8, 9); 9.2-10.0 the short tour's chip and the long tour's chip pulse (shorter tours leave more); 10.6-11.3 the
   result: 2 + 7 = 9, the two blue blocks and the seven green blocks flash as their numbers pop. 11.3-12.5 hold. */

VID.scene({
  kicker: "THE UPDATE",
  title: ["Evaporate,", "then deposit"],
  dur: 12.5,
  // the captions' numbers come from the same asserted ledger as the figure
  caps: ((LG) => [
    [0.5, 2.7, `This road carries a trail of ${LG.tau}.`],
    [3.0, 5.0, "Evaporation: half of it fades."],
    [5.4, 8.8, "Each ant that used it adds Q over its tour length."],
    [9.1, 10.6, "Shorter tours leave more."],
    [10.7, 12.3, `New trail: ${(1 - LG.rho) * LG.tau} + ${LG.deps.reduce((a, b) => a + b, 0)} = ${LG.next}.`],
  ])(VID.l8.LEDGER),
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, ease: E } = V;

    // ---- the data: lesson 8.3's ledger (computed and asserted in l8/common.js), re-derived and asserted here
    const LG = L8.LEDGER;
    const evap = (1 - LG.rho) * LG.tau;
    const deps = LG.lens.map((len) => LG.Q / len);
    const delta = deps.reduce((a, b) => a + b, 0);
    L8.same([LG.tau, LG.rho, LG.Q, LG.lens], [4, 0.5, 100, [25, 50, 100]], "scene 7: the ledger's inputs");
    L8.same(evap, 2, "scene 7: the trail left after evaporation");
    L8.same(LG.tau - evap, LG.lost, "scene 7: the trail lost to evaporation");
    L8.same(deps, [4, 2, 1], "scene 7: deposits Q / L");
    L8.same(deps, LG.deps, "scene 7: deposits agree with the ledger");
    L8.same(delta, 7, "scene 7: the total deposit");
    L8.same(evap + delta, 9, "scene 7: the new trail (1 - rho) x old + deposits");
    L8.same(LG.next, 9, "scene 7: the ledger's new trail");
    L8.same(L8.nextTau(LG.tau, LG.rho, deps), 9, "scene 7: nextTau agrees");
    L8.same(
      LG.lens.map((len, i) => deps[i] * len),
      [100, 100, 100],
      "scene 7: every deposit times its length is Q",
    );
    L8.same(
      deps.every((d, i) => i === 0 || d < deps[i - 1]),
      true,
      "scene 7: a longer tour deposits less",
    );
    // the running total shown in the disc: start, after evaporation, after each ant
    const run = [LG.tau, evap, evap + deps[0], evap + deps[0] + deps[1], evap + delta];
    L8.same(run, [4, 2, 6, 8, 9], "scene 7: the running total");
    const KEEP = LG.tau - LG.lost; // blue blocks that stay: 2
    L8.same(KEEP, 2, "scene 7: two blue blocks stay");

    // ---- timeline (local seconds)
    const T = {
      open: 0.2, // road, floor, title, blue blocks (0.1 s apart)
      disc: 0.8,
      evapTag: 2.9,
      red: 3.3, // the two top blocks turn red ...
      go: [3.7, 4.3], // ... then float up and fade, the trail shrinks
      discEvap: 4.2,
      slide: [4.8, 5.4], // the tank group slides right
      depTag: 5.2,
      tour: 5.3, // the 'L = tour length' label
      pulse: [
        [9.2, 9.6],
        [9.6, 10.0],
      ], // the shortest and the longest tour
      result: 10.6,
    };
    // one row per ant: the ant and its tour, the 'Q / L = deposit' chip, then the blocks flying into the tank
    const ROWS = [
      { ant: 5.6, eq: 6.0, fly: 6.6, step: 0.08, dur: 0.5 },
      { ant: 6.8, eq: 7.2, fly: 7.6, step: 0.08, dur: 0.45 },
      { ant: 7.8, eq: 8.2, fly: 8.5, step: 0.08, dur: 0.5 },
    ];
    ROWS.forEach((r) => (r.land = r.fly + r.step * (deps[ROWS.indexOf(r)] - 1) + r.dur));
    const DISC_AT = [T.disc, T.discEvap, ROWS[0].land, ROWS[1].land, ROWS[2].land];

    // ---- layout (stage px): the tank on the right, one row per ant on the left
    const SLOT = 9;
    L8.same(SLOT, evap + delta, "scene 7: the tank holds the new trail, one block per unit");
    const BX = 670;
    const slotY = (i) => 518 - 44 * i; // block i from the floor up, 36 px high with an 8 px gap
    const ROWY = (i) => 252 + 104 * i;
    const [EQX, EQW] = [300, 260];
    const LAUNCH = EQX + EQW + 52; // where a block leaves its chip: the free column between the rows and the tank
    // the tank (title, blocks, disc) stays on the right; the road it measures starts big on the left and glides up over it
    const tank = V.h("div", { style: L8.abs(0, 0, 936, 640) });
    stage.append(tank);
    const tsvg = L5.svg(tank);
    const svg = L5.svg(stage);

    // the road this is about: two villages and a road whose width follows the trail (drawn in a box centred on its final spot)
    const ROAD = { x0: 30, x1: 190, y: 30 }; // inside the box
    const BOX = { x: 635, y: 14, w: 220, h: 60 }; // the box's final place on the stage (centre 745, 44)
    const BIG = { x: 250, y: 270, s: 2 }; // where the big road sits at the start (its centre) and its scale
    const roadBox = V.h("div", { style: L8.abs(BOX.x, BOX.y, BOX.w, BOX.h) });
    stage.append(roadBox);
    const road = L5.svg(roadBox, BOX.w, BOX.h).appendChild(
      V.s("line", {
        x1: ROAD.x0,
        y1: ROAD.y,
        x2: ROAD.x1,
        y2: ROAD.y,
        "stroke-linecap": "round",
        style: { stroke: "var(--blue)" },
      }),
    );
    const floor = tsvg.appendChild(
      V.s("line", {
        x1: 650,
        y1: 568,
        x2: 840,
        y2: 568,
        "stroke-width": 6,
        "stroke-linecap": "round",
        style: { stroke: "var(--line-2)" },
      }),
    );
    const towns = [ROAD.x0, ROAD.x1].map(() => L8.token(roadBox, { tone: "grey", size: 40 }));
    const title = L8.tag(tank, { x: 610, y: 96, text: "trail on this road", tone: "blue" });
    const disc = L8.disc(tank, { x: 876, y: 340, size: 76, text: String(run[0]), tone: "blue" });

    const mkBlock = (i, tone) => L8.chip(tank, { x: BX, y: slotY(i), w: 150, h: 36, text: "", tone, radius: 12 });
    const blue = Array.from({ length: LG.tau }, (_, i) => mkBlock(i, "blue"));
    const green = [];
    const owner = []; // owner[g] = the ant whose deposit block g is
    deps.forEach((d, a) => {
      for (let j = 0; j < d; j++) {
        green.push(mkBlock(KEEP + green.length, "green"));
        owner.push({ a, j });
      }
    });
    L8.same(green.length, delta, "scene 7: one green block per unit deposited");

    // the left side: the two rule tags and the three ants
    const tagEvap = L8.tag(stage, { x: 18, y: 14, text: `evaporation: ρ = ${LG.rho}`, tone: "red" });
    const tagDep = L8.tag(stage, { x: 18, y: 78, text: `deposit: Q / L, Q = ${LG.Q}`, tone: "green" });
    const tourLab = L8.label(stage, { x: 18, y: 156, w: 240, text: "L = tour length", tone: "grey", align: "left" });
    // only the ants that walked this road add to it
    const usingTag = L8.tag(stage, { x: 270, y: 146, text: "ants using this road", tone: "grey" });

    // a chip holding an equation: numbers as text, signs drawn as SVG
    const eqChip = (o) => {
      const c = L8.chip(stage, { x: o.x, y: o.y, w: o.w, h: o.h, text: "", tone: o.tone, fs: o.fs, radius: o.radius });
      const ink = L8.tone(o.tone).ink;
      const sign = (kind) => {
        const g =
          kind === "slash"
            ? V.s("path", {
                d: "M 10 27 L 24 7",
                fill: "none",
                "stroke-width": 5,
                "stroke-linecap": "round",
                style: { stroke: ink },
              })
            : L8.mark(kind, 17, 17, 34, o.tone);
        return V.s("svg", { width: 34, height: 34, viewBox: "0 0 34 34", style: { flex: "none" } }, g);
      };
      const part = (p) => (["slash", "equals", "plus"].includes(p) ? sign(p) : V.h("span", { text: p }));
      c.tile.append(V.h("div", { style: { display: "flex", alignItems: "center", gap: "6px" } }, ...o.parts.map(part)));
      return c;
    };
    const ants = ROWS.map((_, i) => svg.appendChild(L8.ant(52, ROWY(i), 64)));
    const tours = LG.lens.map((len, i) =>
      L8.chip(stage, { x: 96, y: ROWY(i) - 32, w: 130, h: 64, text: `${len} km`, tone: "grey", fs: 34, radius: 20 }),
    );
    const arrows = ROWS.map((_, i) =>
      svg.appendChild(L5.arrow(236, ROWY(i), 290, ROWY(i), "grey", 1, { w: 6, head: 18 })),
    );
    const eqs = LG.lens.map((len, i) =>
      eqChip({
        x: EQX,
        y: ROWY(i) - 32,
        w: EQW,
        h: 64,
        tone: "green",
        fs: 34,
        radius: 20,
        parts: [String(LG.Q), "slash", String(len), "equals", String(deps[i])],
      }),
    );

    // the result: new trail = 2 + 7 = 9, the two parts in the colours of their blocks
    const RY = 584;
    const resTag = L8.tag(stage, { x: 12, y: RY - 24, text: "new trail", tone: "blue" });
    const res = [
      { x: 190, w: 72, text: String(evap), tone: "blue", solid: false },
      { x: 322, w: 72, text: String(delta), tone: "green", solid: false },
      { x: 454, w: 84, text: String(evap + delta), tone: "blue", solid: true },
    ].map((r) =>
      L8.chip(stage, {
        x: r.x,
        y: RY - 32,
        w: r.w,
        h: 64,
        text: r.text,
        tone: r.tone,
        solid: r.solid,
        fs: 40,
        radius: 20,
      }),
    );
    const resSolid = [false, false, true];
    const plus = svg.appendChild(L8.mark("plus", 292, RY, 40, "grey"));
    const equals = svg.appendChild(L8.mark("equals", 424, RY, 40, "grey"));

    // ---- the trail on the road as a smooth number: shrinks while it evaporates, grows as each block lands
    const landOf = (g) => ROWS[owner[g].a].fly + ROWS[owner[g].a].step * owner[g].j + ROWS[owner[g].a].dur;
    const tauAt = (t) =>
      LG.tau -
      LG.lost * ramp(t, T.go[0], T.go[1], E.inOut) +
      green.reduce((s, _, g) => s + ramp(t, landOf(g) - 0.12, landOf(g), E.lin), 0);
    L8.same(tauAt(T.go[1] + 0.1), 2, "scene 7: the road's trail after evaporation");
    L8.same(tauAt(12.5), 9, "scene 7: the road's trail at the end");
    const pulseOf = (t, a) => flash(t, T.pulse[a][0], T.pulse[a][1]);

    return (t) => {
      // ---- the road: big on the left at first, then it glides up over the tank; the floor and the tank title
      const open = ramp(t, T.open, T.open + 0.5, E.lin);
      const glide = ramp(t, T.slide[0], T.slide[1], E.inOut);
      V.place(roadBox, {
        x: (BIG.x - (BOX.x + BOX.w / 2)) * (1 - glide),
        y: (BIG.y - (BOX.y + BOX.h / 2)) * (1 - glide),
        s: 1 + (BIG.s - 1) * (1 - glide),
      });
      V.place(floor, { o: ramp(t, T.open, T.open + 0.4, E.lin) });
      V.place(road, { o: open });
      road.setAttribute("stroke-width", L8.f1(3 + 2.4 * tauAt(t)));
      towns.forEach((m, i) =>
        m.set({ x: i ? ROAD.x1 : ROAD.x0, y: ROAD.y, s: 0.6 + 0.4 * E.pop(open), o: clamp(open * 3) }),
      );
      title.set({ k: ramp(t, T.open, T.open + 0.4, E.lin) });

      // ---- the disc: the running total
      let shown = 0;
      DISC_AT.forEach((at, i) => {
        if (t >= at) shown = i;
      });
      const bump = DISC_AT.reduce((m, at, i) => (i ? Math.max(m, flash(t, at, at + 0.4)) : m), 0);
      disc.set({ text: String(run[shown]), k: ramp(t, T.disc, T.disc + 0.4, E.lin), s: 1 + 0.18 * bump });

      // ---- the four blue blocks; the top two evaporate: red, then up and away
      const redFlash = flash(t, T.red, T.red + 0.4);
      const gone = ramp(t, T.go[0], T.go[1], E.in);
      const resBlue = flash(t, T.result, T.result + 0.45);
      blue.forEach((b, i) => {
        const k = L8.seq(t, T.open, 0.1, 0.4, i);
        if (i < KEEP) b.set({ k, solid: true, s: 1 + 0.06 * resBlue });
        else
          b.set({
            k,
            solid: true,
            tone: t >= T.red ? "red" : "blue",
            s: 1 + 0.08 * redFlash,
            y: -30 * gone,
            o: 1 - gone,
          });
      });
      tagEvap.set({
        k: ramp(t, T.evapTag, T.evapTag + 0.4, E.lin),
        s: 1 + 0.05 * flash(t, T.evapTag + 0.3, T.evapTag + 0.7),
      });

      // ---- deposits: the label, then one row per ant
      tagDep.set({ k: ramp(t, T.depTag, T.depTag + 0.4, E.lin) });
      tourLab.set({ k: ramp(t, T.tour, T.tour + 0.4, E.lin) });
      usingTag.set({ k: ramp(t, T.tour + 0.1, T.tour + 0.5, E.lin) });
      ROWS.forEach((r, i) => {
        const ak = ramp(t, r.ant, r.ant + 0.5, E.lin);
        V.place(ants[i], { x: (1 - E.out(ak)) * -14, s: 0.6 + 0.4 * E.pop(ak), o: clamp(ak * 3) });
        const pulse = i === 0 ? pulseOf(t, 0) : i === 2 ? pulseOf(t, 1) : 0;
        tours[i].set({ k: ak, s: 1 + 0.1 * pulse });
        const dk = ramp(t, r.eq, r.eq + 0.35, E.out);
        L5.drawOn(arrows[i], dk);
        eqs[i].set({ k: ramp(t, r.eq + 0.1, r.eq + 0.5, E.lin), s: 1 + 0.12 * pulse, ring: "green", ringK: pulse });
      });

      // ---- the green blocks fly from their ant's chip into the tank; shorter tours leave more of them
      const resGreen = flash(t, T.result + 0.25, T.result + 0.7);
      green.forEach((b, g) => {
        const { a, j } = owner[g];
        const r = ROWS[a];
        const t0 = r.fly + r.step * j;
        const p = clamp((t - t0) / r.dur);
        // out of the ant's chip, down (or up) the free column beside it, then in from the left along the slot
        const fy = E.inOut(clamp(p / 0.55));
        const fx = E.out(clamp((p - 0.4) / 0.6));
        const pulse = a === 0 ? pulseOf(t, 0) : a === 2 ? pulseOf(t, 1) : 0;
        b.set({
          solid: true,
          x: (1 - fx) * (LAUNCH - BX - 75),
          y: (1 - fy) * (ROWY(a) - slotY(KEEP + g) - 18),
          s: (0.5 + 0.5 * E.inOut(clamp((p - 0.35) / 0.65))) * (1 + 0.07 * Math.max(pulse, resGreen)),
          o: t >= t0 ? clamp((t - t0) / 0.1) : 0,
        });
      });

      // ---- the result: 2 + 7 = 9
      resTag.set({ k: ramp(t, T.result, T.result + 0.4, E.lin) });
      res.forEach((c, i) =>
        c.set({
          k: L8.seq(t, T.result + 0.05, 0.09, 0.4, i),
          solid: resSolid[i],
          s: 1 + 0.08 * (i === 2 ? bump : 0),
        }),
      );
      V.place(plus, {
        s: 0.6 + 0.4 * E.pop(L8.seq(t, T.result + 0.05, 0.09, 0.4, 0.5)),
        o: clamp(L8.seq(t, T.result + 0.05, 0.09, 0.4, 0.5) * 3),
      });
      V.place(equals, {
        s: 0.6 + 0.4 * E.pop(L8.seq(t, T.result + 0.05, 0.09, 0.4, 1.5)),
        o: clamp(L8.seq(t, T.result + 0.05, 0.09, 0.4, 1.5) * 3),
      });
    };
  },
});
