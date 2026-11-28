/* Lecture 14 (ds-14) · scene 3 (THE SHAPES OF DATA): four panels build one after the other, each with its shape in orange
   underneath (lesson 14.2). Data from D14.SHAPE. Colours: blue the values, orange the shape names, purple the "order 4" badge,
   red / green / blue the colour channels of a photo, grey the panel frames and plain labels.
   Story (local seconds): 0.5 panel 1, the sweet pea packet's card: four features with blue values 180, 10, 150, 7, "features";
   3.4 panel 2, the soil sensor: rows moisture and soil °C, one column of readings slides in per beat (6am to 9pm),
   "features × timestamps"; 6.6 panel 3, a photo as three stacked channel grids R, G, B, "width × height × channels"; 9.6 panel 4,
   four frames (each a small R G B stack), "frames × width × height × channels", then the purple badge "order 4". Hold to 14. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const S = D14.SHAPE;
  const AT = [0.5, 3.4, 6.6, 9.6];
  const PW = 450;
  const PH = 300;
  const PX = [12, 474, 12, 474];
  const PY = [12, 12, 326, 326];
  const CH = ["red", "green", "blue"];
  const box = (x, y, w, h, tone) =>
    V.h("div", {
      class: `v-card plain c-${tone}`,
      style: {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: "12px",
        background: D14.tone(tone).dim,
        boxShadow: `0 4px 0 ${D14.tone(tone).edge}`,
      },
    });

  V.scene({
    kicker: "THE SHAPES OF DATA",
    title: ["Name the directions,", "and you know the shape"],
    dur: 14,
    caps: [
      [0.4, 3.2, "A packet's features: one vector."],
      [3.4, 6.4, "Sensor readings: features × timestamps, a matrix."],
      [6.6, 9.4, "A photo: width × height × channels (RGB)."],
      [9.6, 13.7, "A video: frames × width × height × channels."],
    ],
    build(stage) {
      const panels = PX.map((x, i) => D4.card(stage, { x, y: PY[i], w: PW, h: PH, tone: "grey", plain: true }));
      const svg = D4.svg(stage);
      const shapes = ["features", "features × timestamps", "width × height × channels", S.dims.join(" × ")].map(
        (text, i) =>
          D14.note(stage, { x: PX[i] + PW / 2, y: PY[i] + (i === 3 ? 254 : 266), w: 420, text, tone: "orange" }),
      );

      // panel 1: the packet's profile card
      const p1 = { x: PX[0], y: PY[0] };
      const title1 = D4.label(stage, { x: p1.x + PW / 2, y: p1.y + 34, text: "Sweet pea packet", fs: 30 });
      const feats = S.profile.map(([name, v], i) => ({
        name: D4.label(stage, { x: p1.x + 262, y: p1.y + 86 + 44 * i, text: name, fs: 28, anchor: "r" }),
        chip: D4.chips(stage, {
          x: p1.x + 278,
          y: p1.y + 68 + 44 * i,
          n: 1,
          w: 110,
          h: 38,
          fs: 28,
          texts: [String(v)],
        }),
      }));

      // panel 2: the soil sensor's time series
      const p2 = { x: PX[1], y: PY[1] };
      const rows2 = S.sens.rows.map((row, r) => ({
        name: D4.label(stage, { x: p2.x + 132, y: p2.y + 74 + 54 * r, text: S.sens.names[r], fs: 28, anchor: "r" }),
        chips: D4.chips(stage, {
          x: p2.x + 144,
          y: p2.y + 52 + 54 * r,
          n: 6,
          w: 42,
          h: 44,
          gap: 5,
          fs: 28,
          texts: row.map(String),
        }),
      }));
      const axis = L5.arrow(p2.x + 144, p2.y + 172, p2.x + 424, p2.y + 172, "grey", 1, { w: 5, head: 16 });
      svg.append(axis);
      const times = [0, 5].map((j) =>
        D4.label(stage, { x: p2.x + 165 + j * 47, y: p2.y + 206, text: S.sens.times[j], fs: 28 }),
      );

      // panel 3: a photo is three channel grids
      const p3 = { x: PX[2], y: PY[2] };
      const layers = CH.map((tone, i) => {
        const el = box(p3.x + 100 + 36 * i, p3.y + 24 + 36 * i, 210, 120, tone);
        stage.append(el);
        const lab = D4.label(stage, {
          x: p3.x + 118 + 36 * i,
          y: p3.y + 44 + 36 * i,
          text: tone[0].toUpperCase(),
          tone,
          fs: 28,
          anchor: "l",
        });
        return { el, lab };
      });

      // panel 4: a video is a row of photos
      const p4 = { x: PX[3], y: PY[3] };
      const frames = Array.from({ length: S.frames }, (_, f) => {
        const fx = p4.x + 30 + 104 * f;
        const els = CH.map((tone, i) => {
          const el = box(fx + 9 * i, p4.y + 70 + 9 * i, 70, 52, tone);
          stage.append(el);
          return el;
        });
        const num = D4.label(stage, { x: fx + 44, y: p4.y + 158, text: String(f + 1), fs: 28 });
        return { els, num };
      });
      const badge = D4.tag(stage, {
        x: p4.x + PW / 2,
        y: p4.y + 34,
        text: `order ${S.order}`,
        tone: "purple",
        solid: true,
      });

      return (t) => {
        panels.forEach((p, i) => p.set({ k: ramp(t, AT[i], AT[i] + 0.4, E.lin) }));
        shapes.forEach((s, i) => s.set({ k: ramp(t, AT[i] + 1.4, AT[i] + 1.8, E.lin) }));
        title1.set({ k: ramp(t, AT[0] + 0.2, AT[0] + 0.5, E.lin) });
        feats.forEach((f, i) => {
          const k = D14.seq(t, AT[0] + 0.4, 0.22, 0.4, i);
          f.name.set({ k });
          f.chip.set(0, { ...D14.cellSt(1, { text: String(S.profile[i][1]) }), s: 0.8 + 0.2 * E.pop(k), o: k });
        });
        rows2.forEach((r, ri) => {
          r.name.set({ k: ramp(t, AT[1] + 0.2, AT[1] + 0.5, E.lin) });
          r.chips.all((j) => {
            const k = D14.seq(t, AT[1] + 0.4, 0.3, 0.35, j);
            return {
              tone: "blue",
              solid: true,
              x: 30 * (1 - E.out(k)),
              o: k,
              s: 1 + 0.08 * flash(t, AT[1] + 0.75 + 0.3 * j, AT[1] + 1.05 + 0.3 * j) * ri,
            };
          });
        });
        L5.drawOn(axis, ramp(t, AT[1] + 0.4, AT[1] + 2.2, E.lin));
        times.forEach((l, i) => l.set({ k: ramp(t, AT[1] + 0.5 + 1.5 * i, AT[1] + 0.8 + 1.5 * i, E.lin) }));
        layers.forEach((l, i) => {
          const k = D14.seq(t, AT[2] + 0.3, 0.35, 0.45, i);
          V.place(l.el, { y: -24 * (1 - E.out(k)), o: k });
          l.lab.set({ k, y: -24 * (1 - E.out(k)) });
        });
        frames.forEach((f, i) => {
          const k = D14.seq(t, AT[3] + 0.3, 0.3, 0.4, i);
          f.els.forEach((el) => V.place(el, { x: 24 * (1 - E.out(k)), o: k }));
          f.num.set({ k });
        });
        badge.set({ k: ramp(t, AT[3] + 2.0, AT[3] + 2.4, E.lin), s: 1 + 0.12 * flash(t, AT[3] + 2.3, AT[3] + 2.8) });
      };
    },
  });
})();
