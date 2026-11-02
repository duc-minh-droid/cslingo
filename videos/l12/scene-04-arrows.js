/* Lecture 12 · scene-04-arrows: the velocity update (lesson 12.3) as three arrows laid head to tail on the zoomed map: the
   velocity the particle already has (grey), a pull towards its own best p (purple, c1 z1 (p - x)) and a pull towards the
   swarm's best g (orange, c2 z2 (g - x)). Their sum (blue, dashed) is the new velocity; the particle moves there, its new odour
   (25) does not beat its own best (52), so p stays. One real step of the app's demo swarm: L12.FOCUS = particle 1 of L12.RUN
   on step 9 (the other 13 particles of frame 8 are faint). Same zoom window as scene 6. Local seconds: 0.2 map, 0.8 particle,
   1.4 p, 1.8 g, 2.6 grey, 4.0 / 4.5 purple, 5.9 / 6.3 orange, 8.3 new velocity, 9.6 move, 11.2 odour, 11.8 verdict. */
(function () {
  const V = window.VID;
  const L12 = V.l12;
  const { ramp, lerp, ease: E } = V;

  const FO = L12.FOCUS;
  const F8 = L12.RUN.frames[FO.step - 1];
  L12.same([FO.i, FO.step], [1, 9], "scene 4: particle 1, step 9");
  L12.close(F8.x[FO.i], FO.x0, 1e-9, "scene 4: frame 8 holds the followed particle");
  L12.same([FO.pfOld, FO.gf, FO.f, FO.pfNew], [52, 99, 25, 52], "scene 4: odours");
  L12.same(FO.f < FO.pfOld, true, "scene 4: the new odour does not beat the own best");
  L12.close(FO.c, FO.x, 1e-9, "scene 4: head to tail ends on the new position");
  const VIEW = [0.5, 2, 8.5, 10];

  // ---------- timeline (local seconds) ----------
  const T = {
    map: [0.2, 0.8],
    dot: [0.8, 1.3],
    p: [1.4, 2.0],
    g: [1.8, 2.4],
    grey: [2.6, 3.6],
    pGuide: [4.0, 6.0],
    purple: [4.5, 5.5],
    gGuide: [5.9, 7.9],
    orange: [6.3, 7.3],
    sum: [8.3, 9.3],
    move: [9.6, 11.0],
    odour: [11.2, 11.8],
    stays: [11.8, 12.4],
    pulse: [12.0, 12.8],
  };

  V.scene({
    kicker: "THE VELOCITY",
    title: ["Three arrows make", "the new velocity"],
    dur: 16,
    caps: [
      [0.5, 2.4, "Follow one particle for one step."],
      [2.6, 4.3, "Grey: the velocity it already has."],
      [4.5, 6.1, "Purple: a pull towards its own best spot, p."],
      [6.3, 7.9, "Orange: a pull towards the swarm's best spot, g."],
      [8.3, 11, "Added head to tail, they make the new velocity."],
      [11.6, 15.4, `Its new odour, ${FO.f}, does not beat ${FO.pfOld}, so p stays.`],
    ],
    build(stage) {
      const map = L12.field(stage, { x: 12, y: 12, size: 616, view: VIEW, vecs: 8 });

      // panel tags (x 648 .. 924)
      const PX = 648;
      const tags = {
        p: L12.tag(stage, { x: PX, y: 20, text: `own best p: ${FO.pfOld}`, tone: "purple" }),
        g: L12.tag(stage, { x: PX, y: 92, text: `swarm best g: ${FO.gf}`, tone: "orange" }),
        grey: L12.tag(stage, { x: PX, y: 200, text: "keep going", tone: "grey" }),
        purple: L12.tag(stage, { x: PX, y: 272, text: "pull to p", tone: "purple" }),
        orange: L12.tag(stage, { x: PX, y: 344, text: "pull to g", tone: "orange" }),
        sum: L12.tag(stage, { x: PX, y: 430, text: "new velocity", tone: "blue", solid: true }),
        stays: L12.tag(stage, { x: PX, y: 520, text: `${FO.f} < ${FO.pfOld}: p stays`, tone: "purple", solid: true }),
      };
      // small letters naming p and g on the map
      const [ppx, ppy] = map.pt(FO.p);
      const [gpx, gpy] = map.pt(FO.g);
      const pLab = L12.label(stage, { x: ppx - 70, y: ppy - 22, w: 40, text: "p", tone: "purple", fs: 36 });
      const gLab = L12.label(stage, { x: gpx + 26, y: gpy - 62, w: 40, text: "g", tone: "orange", fs: 36 });
      pLab.set({ k: 0, bold: true });
      gLab.set({ k: 0, bold: true });
      const [cx, cy] = map.pt(FO.c);
      const odourTag = L12.tag(stage, { x: cx + 24, y: cy + 22, text: `odour ${FO.f}`, tone: "green" });

      return (t) => {
        const mv = ramp(t, T.move[0], T.move[1], E.inOut);
        const here = [lerp(FO.x0[0], FO.c[0], mv), lerp(FO.x0[1], FO.c[1], mv)];
        const pk = ramp(t, T.p[0], T.p[1]);
        const pulse = V.flash(t, T.pulse[0], T.pulse[1]);
        const guide = (span) => 0.8 * Math.min(ramp(t, span[0], span[0] + 0.4), 1 - ramp(t, span[1] - 0.4, span[1]));
        map.update({
          k: ramp(t, T.map[0], T.map[1]),
          dots: [
            ...F8.x.map((x, i) => (i === FO.i ? null : { x, tone: "blue", r: 13, o: 0.3 })).filter(Boolean),
            { x: here, tone: "blue", r: 15, focus: true, s: E.pop(ramp(t, T.dot[0], T.dot[1])) },
          ],
          rings: [
            { x: FO.p, tone: "purple", r: 22 * (1 + 0.35 * pulse), k: pk },
            { x: FO.x0, tone: "blue", r: 15, dash: true, o: 0.6, k: ramp(t, T.move[0], T.move[0] + 0.4) },
          ],
          star: { x: FO.g, size: 48, k: ramp(t, T.g[0], T.g[1]) },
          vecs: [
            { a: FO.x0, b: FO.p, tone: "purple", w: 4, head: 1, dash: true, o: guide(T.pGuide), k: 1 },
            { a: FO.x0, b: FO.g, tone: "orange", w: 4, head: 1, dash: true, o: guide(T.gGuide), k: 1 },
            { a: FO.x0, b: FO.a, tone: "grey", w: 8, head: 22, k: ramp(t, T.grey[0], T.grey[1], E.inOut) },
            { a: FO.a, b: FO.b, tone: "purple", w: 8, head: 22, k: ramp(t, T.purple[0], T.purple[1], E.inOut) },
            { a: FO.b, b: FO.c, tone: "orange", w: 8, head: 22, k: ramp(t, T.orange[0], T.orange[1], E.inOut) },
            { a: FO.x0, b: FO.c, tone: "blue", w: 7, head: 22, dash: true, k: ramp(t, T.sum[0], T.sum[1], E.inOut) },
          ],
        });

        tags.p.set({ k: pk });
        pLab.set({ k: pk, bold: true });
        tags.g.set({ k: ramp(t, T.g[0], T.g[1]) });
        gLab.set({ k: ramp(t, T.g[0], T.g[1]), bold: true });
        tags.grey.set({ k: ramp(t, T.grey[0], T.grey[0] + 0.6) });
        tags.purple.set({ k: ramp(t, T.purple[0], T.purple[0] + 0.6) });
        tags.orange.set({ k: ramp(t, T.orange[0], T.orange[0] + 0.6) });
        tags.sum.set({ k: ramp(t, T.sum[0], T.sum[0] + 0.6) });
        odourTag.set({ k: ramp(t, T.odour[0], T.odour[1]) });
        tags.stays.set({ k: ramp(t, T.stays[0], T.stays[1]) });
      };
    },
  });
})();
