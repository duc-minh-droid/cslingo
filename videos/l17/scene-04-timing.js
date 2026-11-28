/* Lecture 17 video, scene 04-timing: temporal and population coding (lesson 17.2, L17.TIME, L17.POP7). Temporal: one spike
   each, earlier when stronger: bright (9) at step 4, medium (5) at 11, dim (2) at 16. Population: five neurons liking 0,
   2.5, 5, 7.5 and 10; strength 7 gives 0, 0, 3, 5 and 1 spikes, so the busy ones (likes 5, 7.5, 10) carry the value.
   Layout (stage px): top raster rows y 12 / 76 / 140 (rh 64, labels 200 px, badges in the last 110 px), a 'step n' label
   beside each spike; a blue tag 'input: strength 7' and an orange tag 'who is busy says 7' at y 214; the population
   raster rows y 284 + 68 i (rh 68, x 24..924) with counts at the right; an orange dashed box round the three busy rows.
   Story (local seconds): 0.4 the playhead sweeps 20 steps (0.4..3.4); each spike pops as it is reached, with its finish
   badge 1st / 2nd / 3rd; 3.2 the 'step 4 / 11 / 16' labels; 6.0 the strength tag and the five population rows; 6.6..8.6
   their spikes draw; 8.6 counts appear, busy labels turn orange; 9.6 the dashed box and the 'who is busy says 7' tag;
   hold to 13. */
VID.scene({
  kicker: "TIMING AND TEAMS",
  title: ["When it fires,", "or who fires"],
  dur: 13,
  caps: [
    [0.4, 3.0, "Temporal coding: a strong input fires early, a weak one late."],
    [3.2, 5.8, "Bright fires at step 4, dim at step 16. One spike can be enough."],
    [6.0, 9.4, "Population coding: five neurons, each liking a range."],
    [9.6, 12.7, "Strength 7 wakes the neurons that like 5, 7.5 and 10."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp, clamp } = V;
    const FIRST = L17.TIME.map((tr) => L17.on(tr)[0]);
    const COUNTS = L17.POP7.map((tr) => L17.on(tr).length);
    L17.same(FIRST, [4, 11, 16], "scene 4: first spikes");
    L17.same(COUNTS, [0, 0, 3, 5, 1], "scene 4: population code of 7");
    const svg = L17.svg(stage);
    const box = svg.appendChild(
      V.s("rect", { x: 12, y: 284 + 2 * 68 - 6, width: 912, height: 3 * 68 + 8, rx: 18, "stroke-width": 5 }),
    );
    box.setAttribute("fill", "none");
    box.setAttribute("stroke-dasharray", "14 10");
    box.style.stroke = L13.tone("orange").c;

    const top = L17.raster(svg, {
      y: 12,
      rows: 3,
      rh: 64,
      labW: 200,
      cntW: 110,
      labs: ["bright (9)", "medium (5)", "dim (2)"],
    });
    const stepLab = FIRST.map((s, i) =>
      L17.text(svg, { x: top.colX(s) + 18, y: top.rowY(i) + 40, text: `step ${s}`, tone: "grey" }),
    );
    const badges = ["1st", "2nd", "3rd"].map((text, i) =>
      L13.tag(stage, { x: 924 - 92, y: top.rowY(i) + 6, text, tone: "orange", solid: true }),
    );
    const strength = L13.tag(stage, { x: 12, y: 214, text: "input: strength 7", tone: "blue", solid: true });
    const says = L13.tag(stage, { x: 400, y: 214, text: "who is busy says 7", tone: "orange" });
    const LABS = L17.POP.map((c) => `likes ${c}`);
    const pop = L17.raster(svg, { x: 24, w: 900, y: 284, rows: 5, rh: 68, labW: 190, cntW: 80, labs: LABS });

    return (t) => {
      const k1 = ramp(t, 0.2, 0.5);
      const up = 20 * clamp((t - 0.4) / 3.0);
      top.o(k1);
      L17.TIME.forEach((tr, i) => top.set(i, { train: tr, upto: up }));
      top.head({ upto: up, o: t > 0.3 && t < 3.5 ? 1 : 0 });
      badges.forEach((b, i) => {
        const at = 0.4 + ((FIRST[i] - 0.5) / 20) * 3.0;
        b.set({ k: ramp(t, at, at + 0.3) });
      });
      stepLab.forEach((l, i) => l.set({ o: ramp(t, 3.2 + 0.2 * i, 3.5 + 0.2 * i) }));
      // population
      const k2 = ramp(t, 6.0, 6.4);
      strength.set({ k: k2 });
      const up2 = 20 * clamp((t - 6.6) / 2.0);
      pop.o(k2);
      const done = ramp(t, 8.6, 9.0);
      L17.POP7.forEach((tr, i) =>
        pop.set(i, {
          train: tr,
          upto: up2,
          lab: LABS[i],
          labTone: done > 0.5 ? (COUNTS[i] ? "orange" : "grey") : undefined,
          cnt: String(COUNTS[i]),
          cntO: done,
          cntTone: COUNTS[i] ? "orange" : "grey",
        }),
      );
      pop.head({ upto: up2, o: t > 6.5 && t < 8.7 ? 1 : 0 });
      L17.vis(box, ramp(t, 9.6, 10.0));
      says.set({ k: ramp(t, 9.8, 10.2) });
    };
  },
});
