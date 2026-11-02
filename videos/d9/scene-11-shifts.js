/* Lecture 9 (ds-9) · scene 11 (DATA SHIFTS): three columns, one shift each, and all three cause model decay.
   Story (local seconds):
     0.3 column 0 'covariate shift': three plain faces 'trained on' (0.8-1.4, a green tick: the model knows them), the same
         faces with masks 'now' (1.6-2.2), a red cross (2.4: the model fails), 'inputs change' (2.8).
     3.6 column 1 'prior shift': 20 patients (3.8-4.6), 12 solid purple = flu, 'before'; eight turn hollow grey one by one
         (5.0-5.8), the labels flip to 'pandemic' and '4 of 20 have flu' at 5.8; 'targets change' (6.2).
     7.0 column 2 'concept drift': a small km / min plot with the old records, the blue model line and the green dashed truth,
         both at 4 per km (7.1-7.6); the truth turns to 6 per km and the new records pop (7.8-8.6); the label (8.6);
         'the rule changes' (9.0).
     9.6-10.2 the three bottom tags bump together and turn red: model decay. Hold to 11.
   Numbers from D9.SHIFT (12 and 4 of 20, 4 -> 6 per km) and D9.DRIFT (the records). */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => n.toFixed(1);

  const S = D9.SHIFT;
  const fm = D9.fm;
  const X0 = [0, 1, 2].map((c) => 12 + 308 * c);
  const CW = 296;

  // which 20 patients have flu: a fixed shuffle (seeded), first `before` have flu, the first `during` of them keep it
  const order = (() => {
    const r = D9.rng(9);
    return Array.from({ length: S.prior.n }, (_, i) => i)
      .map((i) => [r(), i])
      .sort((a, b) => a[0] - b[0])
      .map((p) => p[1]);
  })();
  const flu0 = order.slice(0, S.prior.before);
  const keep = flu0.slice(0, S.prior.during);
  const lose = flu0.slice(S.prior.during).sort((a, b) => a - b);
  D9.same(
    "s11: 12 of 20 flu dots before, 8 turn hollow, 4 stay",
    [flu0.length, lose.length, keep.length, S.prior.n],
    [12, 8, 4, 20],
  );
  const DR = D9.DRIFT;
  D9.same("s11: concept drift 4 -> 6 per km", [S.concept.from, S.concept.to, DR.model, DR.real], [4, 6, 4, 6]);

  V.scene({
    kicker: "DATA SHIFTS",
    title: ["Three shifts that", "make a model decay"],
    dur: 11,
    caps: [
      [1.6, 3.4, "Covariate shift: the inputs change, like faces in masks."],
      [3.9, 5.6, `Prior probability shift: same symptoms; before, ${fm(S.prior.before)} in ${fm(S.prior.n)} had flu.`],
      [5.9, 6.9, `In the pandemic, only ${fm(S.prior.during)} in ${fm(S.prior.n)}.`],
      [7.8, 9.4, `Concept drift: the rule itself changes, ${fm(S.concept.from)} → ${fm(S.concept.to)} per km.`],
      [9.6, 10.8, "Each one makes a trained model decay."],
    ],
    build(stage) {
      const T0 = [0.3, 3.6, 7.0];
      const cards = X0.map((x) => D4.card(stage, { x, y: 92, w: CW, h: 400, tone: "grey", plain: true }));
      const heads = ["covariate shift", "prior shift", "concept drift"].map((text, c) =>
        D4.tag(stage, { x: X0[c] + CW / 2, y: 50, text, tone: "purple", fs: 30 }),
      );
      const foots = ["inputs change", "targets change", "the rule changes"].map((text, c) =>
        D4.tag(stage, { x: X0[c] + CW / 2, y: 550, text, tone: "grey", solid: true, fs: 28 }),
      );
      const FOOT_AT = [2.8, 6.2, 9.0];

      // ---------- column 2 plot (DOM, under the svg layer) ----------
      const x2 = X0[2];
      const plot = D9.plot(stage, {
        x: x2 + 8,
        y: 120,
        w: 280,
        h: 300,
        xr: [0, 4.5],
        yr: [0, 28],
        xticks: [],
        pad: { l: 16, r: 12, t: 10, b: 20 },
        frame: false,
        xlab: "km",
        ylab: "min",
      });
      const driftLab = D4.label(stage, {
        x: x2 + CW / 2,
        y: 450,
        text: `about ${fm(S.concept.to)} min per km`,
        tone: "green",
        fs: 28,
      });

      const svg = D4.svg(stage);

      // ---------- column 0: faces ----------
      const x0 = X0[0];
      const fx = (i) => x0 + 52 + 72 * i;
      const plainF = [0, 1, 2].map((i) => svg.appendChild(D9.face(fx(i), 190, 64)));
      const maskF = [0, 1, 2].map((i) => svg.appendChild(D9.face(fx(i), 400, 64, { mask: true })));
      const tick = svg.appendChild(L5.tick(x0 + 262, 190, 40, "green", { w: 7 }));
      const cross = svg.appendChild(L5.cross(x0 + 262, 400, 40, "red", { w: 7 }));
      const trained = D4.label(stage, { x: x0 + CW / 2, y: 128, text: "trained on", fs: 28 });
      const nowL = D4.label(stage, { x: x0 + CW / 2, y: 320, text: "now", fs: 28 });

      // ---------- column 1: patients ----------
      const x1 = X0[1];
      const dots = Array.from({ length: S.prior.n }, (_, k) => {
        const i = k % 5;
        const j = Math.floor(k / 5);
        const c = V.s("circle", { cx: f1(x1 + 52 + 48 * i), cy: f1(190 + 52 * j), r: 14 });
        svg.appendChild(c);
        return c;
      });
      const isFlu0 = new Set(flu0);
      const loseAt = new Map(lose.map((k, n) => [k, 5.0 + 0.1 * n]));
      const before = D4.label(stage, { x: x1 + CW / 2, y: 128, text: "before", fs: 28 });
      const pand = D4.label(stage, { x: x1 + CW / 2, y: 128, text: "pandemic", fs: 28 });
      const cnt0 = D4.label(stage, {
        x: x1 + CW / 2,
        y: 450,
        text: `${fm(S.prior.before)} of ${fm(S.prior.n)} have flu`,
        tone: "purple",
        fs: 28,
      });
      const cnt1 = D4.label(stage, {
        x: x1 + CW / 2,
        y: 450,
        text: `${fm(S.prior.during)} of ${fm(S.prior.n)} have flu`,
        tone: "purple",
        fs: 28,
      });
      const P = T("purple");
      const G = T("grey");

      return (t) => {
        // cards and head tags
        cards.forEach((c, i) => c.set({ k: ramp(t, T0[i], T0[i] + 0.5, E.lin) }));
        heads.forEach((h, i) => h.set({ k: ramp(t, T0[i] + 0.1, T0[i] + 0.5, E.out) }));
        const decay = t >= 9.9;
        foots.forEach((f, i) => {
          const at = 9.6 + 0.1 * i;
          f.set({
            k: ramp(t, FOOT_AT[i], FOOT_AT[i] + 0.4, E.out),
            tone: decay ? "red" : "grey",
            s: 1 + 0.18 * flash(t, at, at + 0.5),
          });
        });

        // column 0
        plainF.forEach((g, i) => {
          const k = ramp(t, 0.8 + 0.1 * i, 1.2 + 0.1 * i, E.lin);
          V.place(g, { s: 0.5 + 0.5 * E.pop(k), o: k });
        });
        trained.set({ k: ramp(t, 0.8, 1.2, E.out) });
        const tk = ramp(t, 1.3, 1.6, E.lin);
        L5.drawOn(tick, tk);
        V.show(tick, tk > 0 ? 1 : 0);
        maskF.forEach((g, i) => {
          const k = ramp(t, 1.6 + 0.1 * i, 2.0 + 0.1 * i, E.lin);
          V.place(g, { s: 0.5 + 0.5 * E.pop(k), o: k });
        });
        nowL.set({ k: ramp(t, 1.6, 2.0, E.out) });
        const ck = ramp(t, 2.4, 2.7, E.lin);
        V.place(cross, { s: (0.5 + 0.5 * E.pop(ck)) * (1 + 0.2 * flash(t, 2.6, 3.0)), o: ck });

        // column 1
        dots.forEach((c, k) => {
          const pk = ramp(t, 3.8 + 0.03 * k, 4.1 + 0.03 * k, E.lin);
          const goneAt = loseAt.get(k);
          const flu = isFlu0.has(k) && !(goneAt != null && t >= goneAt);
          c.setAttribute("fill", flu ? P.c : "var(--panel)");
          c.setAttribute("stroke", flu ? P.lip : G.c);
          c.setAttribute("stroke-width", flu ? 3 : 5);
          const s = (0.4 + 0.6 * E.pop(pk)) * (goneAt != null ? 1 + 0.3 * flash(t, goneAt, goneAt + 0.3) : 1);
          V.place(c, { s, o: pk });
        });
        const flip = ramp(t, 5.8, 6.0, E.lin);
        const k1 = ramp(t, 3.8, 4.2, E.out);
        before.set({ k: k1, o: 1 - flip });
        cnt0.set({ k: ramp(t, 4.4, 4.7, E.out), o: 1 - flip });
        pand.set({ k: flip, s: 1 + 0.12 * flash(t, 5.8, 6.2) });
        cnt1.set({ k: flip, s: 1 + 0.12 * flash(t, 5.8, 6.2) });

        // column 2
        const pk = ramp(t, 7.1, 7.6, E.lin);
        const rot = ramp(t, 7.8, 8.4, E.inOut);
        const slope = lerp(S.concept.from, S.concept.to, rot);
        const nk = (i) => ramp(t, 8.0 + 0.07 * i, 8.3 + 0.07 * i, E.lin);
        plot.update({
          k: pk,
          axes: pk,
          curves: [
            { fn: (x) => DR.model * x, from: 0, to: 4.5, tone: "blue", w: 6 },
            { fn: (x) => slope * x, from: 0, to: 4.5, tone: "green", w: 5, dash: true },
          ],
          dots: [
            ...DR.old.map((p) => ({ at: [p.x, p.y], tone: "purple", r: 8, hollow: rot > 0.5 })),
            ...DR.now.map((p, i) => ({ at: [p.x, p.y], tone: "purple", r: 8, s: E.pop(nk(i)), o: nk(i) })),
          ],
        });
        driftLab.set({ k: ramp(t, 8.6, 9.0, E.out) });
      };
    },
  });
})();
