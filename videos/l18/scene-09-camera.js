/* Lecture 18 video, scene 09-camera: lesson 18.3's camera demo (L18.CAM): a 12 x 6 pixel garden, a hedgehog 2 pixels wide in
   row 4. The frame camera (orange) sends all 72 pixels every moment; the event camera (green) sends only the pixels whose
   brightness changed: 2 per moment while the hedgehog walks, none while it sits still. Totals: frame 216 / event 6 after
   three walking moments, frame 360 / event 6 after two still ones. Sensor fusion: events wake the frame camera for a photo.
   Layout (stage px): mode tag at y 12; grid x 12..612, y 70..370 (pitch 50, cells 46); note at y 386; right panel tiles
   x 636..924 at y 12 / 154 / 296 (130 high): Moments, Frame camera pixels sent, Event camera pixels sent; at 8.8 a flow
   strip at y 452 and a small photo frame at x 12..212, y 516..628.
   Story (local seconds): frame mode moments at 0.8 / 1.5 / 2.2 (all 72 pixels flash orange); 3.2 event mode, fresh count,
   the hedgehog starts again: moments 3.6 / 4.3 / 5.0 (the 2 changed pixels flash green); 6.0 the hedgehog sits still:
   moments 6.4 / 7.1, frame adds 72 each, event nothing, 7.3 the note; 8.8 the strip tags 9.0 + 0.5 i, the photo 10.4;
   hold to 12. */
VID.scene({
  kicker: "A CAMERA THAT ONLY REPORTS CHANGE",
  title: ["Send only", "what changed"],
  dur: 12,
  caps: [
    [0.4, 3.0, "A frame camera sends all 72 pixels, every moment."],
    [3.2, 5.8, "An event camera's pixels spike only when brightness changes: 2."],
    [6.0, 8.6, "Hedgehog sits still: the event camera sends nothing."],
    [8.8, 11.7, "Sensor fusion: wake the frame camera when events appear."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp } = V;
    const C = L18.CAM;
    // moments: [time, mode, step] with step = the CAM record after that moment
    const MOM_A = [0.8, 1.5, 2.2].map((at, i) => ({ at, mode: "frame", s: C.walk[i], n: i + 1 }));
    const MOM_B = [3.6, 4.3, 5.0, 6.4, 7.1].map((at, i) => ({
      at,
      mode: "event",
      s: i < 3 ? C.walk[i] : C.still[i - 3],
      n: i + 1,
    }));
    L18.same(
      [MOM_A[2].s.frame, MOM_B[2].s.event, MOM_B[4].s.frame, MOM_B[4].s.event],
      [216, 6, 360, 6],
      "scene 9: totals",
    );
    const svg = V.l5.svg(stage, 936, 640);
    const cells = [];
    for (let y = 0; y < C.GH; y++)
      for (let x = 0; x < C.GW; x++)
        cells.push(
          L18.rect(svg, { x: 12 + 50 * x, y: 70 + 50 * y, w: 46, h: 46, rx: 8, tone: "grey", fill: "dim", sw: 3 }),
        );
    const mode = L13.tag(stage, { x: 12, y: 8, text: "Frame camera", tone: "orange", solid: true });
    const note = L13.tag(stage, { x: 12, y: 386, text: "nothing changed: nothing sent", tone: "green" });
    const tiles = [
      ["Moments", "grey"],
      ["Frame camera, pixels sent", "orange"],
      ["Event camera, pixels sent", "green"],
    ].map(([label, tone], i) => L18.tile(stage, { x: 636, y: 12 + 142 * i, w: 288, h: 130, label, tone }));
    // flow strip and photo
    const W = (s) => Math.round(s.length * 14.6 + 40);
    const STRIP = [
      ["Event camera", "green"],
      ["Frame camera", "orange"],
      ["Fusion: best of both", "green"],
    ];
    let sx = 12;
    const strip = STRIP.map(([text, tone], i) => {
      const tag = L13.tag(stage, { x: sx, y: 452, text, tone, solid: i === 2 });
      const r = { tag, x0: sx, x1: sx + W(text) };
      sx += W(text) + 60;
      return r;
    });
    const sArr = [0, 1].map(() => L13.arrow(svg, { tone: "grey", w: 5, head: 16 }));
    const photo = svg.appendChild(V.s("g", {}));
    L18.rect(photo, { x: 12, y: 520, w: 200, h: 108, rx: 10, tone: "orange", fill: "dim", sw: 5 });
    L18.hedgehog(photo, 100, 606, 0.9);
    const snap = L13.label(stage, { x: 228, y: 556, w: 300, text: "one full photo", tone: "orange", align: "left" });

    return (t) => {
      const evMode = t >= 3.2;
      const list = evMode ? MOM_B : MOM_A;
      const done = list.filter((m) => t >= m.at);
      const last = done[done.length - 1];
      const pos = last ? last.s.pos : C.start;
      const since = last ? t - last.at : 99;
      const fr = last ? last.s.frame : 0;
      const ev = evMode && last ? last.s.event : 0;
      const k0 = ramp(t, 0.3, 0.7);
      cells.forEach((c, i) => {
        const x = i % C.GW,
          y = Math.floor(i / C.GW);
        const hog = y === C.ROW && (x === pos || x === pos + 1);
        let tone = "grey",
          fill = "dim";
        if (last && since < 0.55) {
          if (last.mode === "frame") tone = "orange";
          else if (y === C.ROW && last.s.changed.includes(x)) ((tone = "green"), (fill = "c"));
        }
        L18.paint(c, tone, fill);
        if (hog) c.style.fill = "var(--ink)";
        L18.op(c, k0);
      });
      mode.set({ k: k0, text: evMode ? "Event camera" : "Frame camera", tone: evMode ? "green" : "orange" });
      note.set({ k: ramp(t, 7.3, 7.7) * (1 - ramp(t, 8.8, 9.0)) });
      const bump = last && since < 0.3 ? 1 - since / 0.3 : 0;
      tiles[0].set({ k: ramp(t, 0.4, 0.8), text: String(done.length), bump });
      tiles[1].set({ k: ramp(t, 0.5, 0.9), text: String(fr), bump });
      tiles[2].set({
        k: ramp(t, 3.2, 3.6),
        text: String(ev),
        bump: last && last.s.changed.length && evMode ? bump : 0,
      });
      strip.forEach((s, i) => s.tag.set({ k: ramp(t, 9.0 + 0.5 * i, 9.4 + 0.5 * i) }));
      sArr.forEach((a, i) =>
        a.set({ a: [strip[i].x1 + 6, 478], b: [strip[i + 1].x0 - 6, 478], k: ramp(t, 9.3 + 0.5 * i, 9.6 + 0.5 * i) }),
      );
      L18.op(photo, ramp(t, 10.4, 10.7));
      V.place(photo, { s: 1 + 0.08 * V.flash(t, 10.4, 10.9), o: ramp(t, 10.4, 10.7) });
      snap.set({ k: ramp(t, 10.6, 11.0) });
    };
  },
});
