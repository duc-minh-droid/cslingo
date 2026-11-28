/* Lecture 18 video, scene 04-superpowers: three of the four strengths of a neuromorphic chip, one row each (lesson 18.1):
   parallel, processing and memory collocated, scalable; a fourth empty slot announces 'event driven' (next scene).
   Layout (stage px): rows at y 12 / 168 / 324 / 480, 140 high. Each row: pictogram panel x 12..452, card x 468..924.
   Row 1: a 4 x 4 grid of green neurons that pulse together, beside one orange worker and a queue of 16 jobs lit one by one.
   Row 2: orange processor and blue memory boxes far apart with a blue packet running across the gap, beside two green
   neurons joined by a synapse with its memory cell (no gap). Row 3: chip tiles snap on one by one, joined by wires; a counter
   (times mark + number) shows 1..4. Row 4: a dashed slot with a doorbell and 'Event driven: next'.
   Story (local seconds): rows at 0.4 / 3.2 / 6.0 / 8.8 (panel, then card 0.3 s later), each animation starts with its row;
   chips snap at 6.4 / 6.9 / 7.4 / 7.9; hold to 12. */
VID.scene({
  kicker: "FOUR SUPERPOWERS",
  title: ["Parallel, collocated,", "scalable"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Parallel: all neurons work at once, each doing something simple."],
    [3.2, 5.8, "Processing and memory together: faster and less energy."],
    [6.0, 8.6, "Scalable: need a bigger network? Add more chips."],
    [8.8, 11.7, "And the fourth: it is event driven."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp, flash } = V;
    const Y = [12, 168, 324, 480];
    const AT = [0.4, 3.2, 6.0, 8.8];
    const svg = V.l5.svg(stage, 936, 640);
    const panels = Y.slice(0, 3).map((y) => L18.rect(svg, { x: 12, y, w: 440, h: 140, rx: 20, tone: "grey" }));
    const cards = [
      ["Parallel\nall neurons at once", "green"],
      ["Collocated\nmemory and processing\ntogether", "green"],
      ["Scalable\nmore chips, more neurons", "green"],
    ].map(([text, tone], i) => L18.card(stage, { x: 468, y: Y[i], w: 456, h: 140, text, tone, fs: 30 }));

    // row 1
    const r1 = svg.appendChild(V.s("g", {}));
    const grid = [];
    for (let i = 0; i < 16; i++) grid.push(L18.circ(r1, 50 + (i % 4) * 30, 37 + Math.floor(i / 4) * 30, 10, "green"));
    const chef = L18.circ(r1, 210, 82, 22, "orange");
    const jobs = [];
    for (let i = 0; i < 16; i++)
      jobs.push(L18.rect(r1, { x: 250 + (i % 8) * 24, y: 52 + Math.floor(i / 8) * 36, w: 18, h: 26, rx: 4, sw: 2 }));

    // row 2
    const r2 = svg.appendChild(V.s("g", {}));
    const y2 = Y[1];
    L18.rect(r2, { x: 30, y: y2 + 40, w: 56, h: 60, rx: 10, tone: "orange", fill: "c" });
    L18.rect(r2, { x: 176, y: y2 + 40, w: 56, h: 60, rx: 10, tone: "blue", fill: "c" });
    L18.line(r2, [86, y2 + 70], [176, y2 + 70], "grey", 5);
    const pk = L18.rect(r2, { x: 0, y: y2 + 58, w: 24, h: 24, rx: 5, tone: "blue", fill: "c", sw: 2 });
    L18.line(r2, [252, y2 + 20], [252, y2 + 120], "grey", 3);
    L18.line(r2, [300, y2 + 70], [410, y2 + 70], "green", 8);
    L18.circ(r2, 290, y2 + 70, 22, "green", "dim");
    L18.circ(r2, 420, y2 + 70, 22, "green", "dim");
    const cell = L18.rect(r2, { x: 341, y: y2 + 56, w: 28, h: 28, rx: 5, tone: "green", fill: "c", sw: 3 });

    // row 3
    const r3 = svg.appendChild(V.s("g", {}));
    const y3 = Y[2];
    const wires = [0, 1, 2].map((i) => L18.line(r3, [86 + 84 * i, y3 + 70], [116 + 84 * i, y3 + 70], "green", 6));
    const chips = [0, 1, 2, 3].map((i) => L18.chip(r3, 34 + 84 * i, y3 + 42, 56, "green").g);
    r3.appendChild(L13.mark("times", 384, y3 + 70, 40, "green"));
    const count = L13.label(stage, { x: 400, y: y3 + 44, w: 52, text: "1", tone: "green", fs: 44, bold: true });

    // row 4
    const r4 = svg.appendChild(V.s("g", {}));
    const slot = L18.rect(r4, { x: 12, y: Y[3], w: 912, h: 140, rx: 20, tone: "purple", fill: "none", sw: 5 });
    slot.setAttribute("stroke-dasharray", "18 12");
    const bell = L18.bell(r4, 90, Y[3] + 70, 1.2, "purple");
    const next = L13.label(stage, { x: 160, y: Y[3] + 46, w: 600, text: "Event driven: next", tone: "purple", fs: 36 });
    next.el.style.textAlign = "left";
    const CHIP_AT = [6.4, 6.9, 7.4, 7.9];

    return (t) => {
      panels.forEach((p, i) => L18.op(p, ramp(t, AT[i], AT[i] + 0.4)));
      cards.forEach((c, i) => c.set({ k: ramp(t, AT[i] + 0.3, AT[i] + 0.7) }));
      // row 1: the grid pulses together every second, the worker does one job each 0.25 s
      L18.op(r1, ramp(t, AT[0], AT[0] + 0.4));
      const p = t < 0.8 ? 0 : flash((t - 0.8) % 1, 0, 0.5);
      grid.forEach((g) => V.place(g, { s: 1 + 0.35 * p }));
      const done = Math.max(0, Math.min(16, Math.floor((t - 0.8) / 0.25)));
      jobs.forEach((j, i) => L18.paint(j, i < done ? "orange" : "grey", i < done ? "c" : "dim"));
      V.place(chef, { s: 1 + 0.15 * (t > 0.8 && done < 16 ? flash((t - 0.8) % 0.25, 0, 0.25) : 0) });
      // row 2: the packet crosses the long gap again and again; the cell flashes in place
      L18.op(r2, ramp(t, AT[1], AT[1] + 0.4));
      const q = t < 3.6 ? 0 : ((t - 3.6) % 1.2) / 1.2;
      const f = q < 0.5 ? V.ease.inOut(q * 2) : V.ease.inOut(2 - q * 2);
      pk.setAttribute("x", (90 + 58 * 2 * f).toFixed(1));
      V.place(cell, { s: 1 + 0.3 * (t < 3.6 ? 0 : flash((t - 3.6) % 0.6, 0, 0.6)) });
      // row 3: chips snap on
      L18.op(r3, ramp(t, AT[2], AT[2] + 0.4));
      chips.forEach((c, i) =>
        V.place(c, {
          s: 0.6 + 0.4 * ramp(t, CHIP_AT[i], CHIP_AT[i] + 0.4, V.ease.back),
          o: ramp(t, CHIP_AT[i], CHIP_AT[i] + 0.2),
        }),
      );
      wires.forEach((w, i) => L18.op(w, ramp(t, CHIP_AT[i + 1] + 0.2, CHIP_AT[i + 1] + 0.4)));
      count.set({ k: ramp(t, 6.4, 6.6), text: String(Math.max(1, CHIP_AT.filter((a) => t >= a).length)) });
      // row 4
      L18.op(r4, ramp(t, AT[3], AT[3] + 0.4));
      V.place(bell, { s: 1 + 0.12 * flash(t, 9.4, 9.9) });
      next.set({ k: ramp(t, 9.1, 9.5) });
    };
  },
});
