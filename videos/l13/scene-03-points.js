/* Lecture 13 video, scene 03-points: lesson 13.1's objective vectors. Each wind farm layout (L13.FARM) is scored on cost
   (£m, lower is better) and power (MW, higher is better), so it becomes one point in objective space.
   Layout (stage px): plot x 12, y 12, 600 x 616 (cost 15..60 across, power 20..75 up); right panel x 640..924: a layout tag,
   a cost stat and a power stat (284 x 80), the label 'objective vector'. A green 'better' arrow in the empty lower right of the
   plot points up and to the left.
   Story (local seconds): 0.3 plot; 0.9 'layout A' with £20m and 30 MW; 3.4 guides and dot A (blue) with 'A (20, 30)' and
   'objective vector'; 6.2 the panel switches to E (purple), dot E with 'E (52, 70)'; 8.4 the other nine layouts pop in (grey,
   letters only), 8.6 the 'better' arrow; hold to 12. */
VID.scene({
  kicker: "OBJECTIVE SPACE",
  title: ["Every layout", "becomes a point"],
  dur: 12,
  caps: [
    [0.5, 3.2, "Each layout gets two scores: its cost and its power."],
    [3.4, 6.0, "Layout A becomes one point, its objective vector: (20, 30)."],
    [6.2, 8.2, "Layout E costs more but makes more power: (52, 70)."],
    [8.8, 11.8, "Eleven layouts, eleven points. Better is up and to the left."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const { ramp, ease: E } = V;
    const F = L13.FARM;
    L13.same([F.ids.length, ...F.at.A, ...F.at.E], [11, 20, 30, 52, 70], "scene 3: 11 layouts, A and E");

    const pl = L13.plot(stage, {
      x: 12,
      y: 12,
      w: 584,
      h: 616,
      xr: [15, 60],
      yr: [20, 75],
      xt: [20, 30, 40, 50, 60],
      yt: [30, 40, 50, 60, 70],
      xl: "cost (£m)",
      yl: "power (MW)",
      dots: 11,
      links: 4,
    });
    const better = L13.arrow(pl.svg, { tone: "green", w: 8, head: 22 });
    const betterLab = L13.label(stage, { x: 0, y: 0, w: 200, text: "better", tone: "green", bold: true });
    const RX = 616;
    const lay = L13.tag(stage, { x: RX, y: 60, text: "layout A", tone: "blue", solid: true, fs: 32 });
    const cst = L13.stat(stage, { x: RX, y: 140, w: 308, h: 80, label: "cost", tone: "blue" });
    const pw = L13.stat(stage, { x: RX, y: 240, w: 308, h: 80, label: "power", tone: "blue" });
    const vecLab = L13.label(stage, { x: RX, y: 350, w: 308, text: "objective vector", bold: true });
    const vecTag = L13.tag(stage, { x: RX, y: 400, text: "", tone: "blue", fs: 36 });
    const LDX = { I: [18, 40], J: [-18, -16], E: [-18, -16] };

    return (t) => {
      const isE = t >= 6.2;
      const id = isE ? "E" : "A";
      const tone = isE ? "purple" : "blue";
      const [c, p] = F.at[id];
      const sw = isE ? ramp(t, 6.2, 6.6) : ramp(t, 0.9, 1.3);
      lay.set({ k: sw, text: `layout ${id}`, tone });
      cst.set({ k: isE ? sw : ramp(t, 1.2, 1.6), text: `£${c}m`, tone });
      pw.set({ k: isE ? sw : ramp(t, 1.5, 1.9), text: `${p} MW`, tone });
      const kv = isE ? ramp(t, 6.8, 7.2) : ramp(t, 3.9, 4.3);
      vecLab.set({ k: ramp(t, 3.7, 4.1) });
      vecTag.set({ k: kv, text: `(${c}, ${p})`, tone, x: (308 - L13.tagW(`(${c}, ${p})`, 36)) / 2 });

      const dots = [];
      const links = [];
      const kA = ramp(t, 3.4, 3.9);
      const gA = ramp(t, 3.4, 4.0);
      if (gA > 0) {
        const kGuide = isE ? 1 - ramp(t, 6.2, 6.5) : gA;
        links.push(
          { a: [20, 20], b: [20, 30], k: kGuide, tone: "blue" },
          { a: [15, 30], b: [20, 30], k: kGuide, tone: "blue" },
        );
      }
      const gE = ramp(t, 6.4, 7.0);
      if (gE > 0) {
        const kGuide = gE * (1 - ramp(t, 8.4, 8.7));
        links.push(
          { a: [52, 20], b: [52, 70], k: kGuide, tone: "purple" },
          { a: [15, 70], b: [52, 70], k: kGuide, tone: "purple" },
        );
      }
      const short = t >= 8.4;
      F.ids.forEach((k, i) => {
        let kk;
        let tn = "grey";
        if (k === "A") [kk, tn] = [kA, "blue"];
        else if (k === "E") [kk, tn] = [ramp(t, 6.4, 6.9), "purple"];
        else kk = L13.seq(t, 8.4, 0.08, 0.4, i);
        const long = !short && (k === "A" || k === "E");
        const [ldx, ldy] = LDX[k] || [18, -16];
        dots.push({
          at: F.P[i],
          tone: tn,
          k: kk,
          lab: long ? `${k} (${F.at[k].join(", ")})` : k,
          ldx,
          ldy,
        });
      });
      pl.update({ k: ramp(t, 0.2, 0.6), axes: ramp(t, 0.4, 0.9), dots, links });
      const kb = ramp(t, 8.6, 9.2, E.out);
      const [ax, ay] = pl.ps([56, 30]);
      const [bx, by] = pl.ps([48, 42]);
      better.set({ a: [ax, ay], b: [bx, by], k: kb });
      const [lx, ly] = pl.pt([56, 30]);
      betterLab.set({ k: kb, x: lx - 130, y: ly + 10 });
    };
  },
});
