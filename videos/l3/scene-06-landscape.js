/* Lecture 3 · scene 06-landscape: all solutions on a line, fitness as height; a hillclimber stops on the nearest peak. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const f = L3.fvals("multi");
  const START = 4;
  const hc = L3.hcSteps(f, START, [1, 1, 1, 1, -1]);
  const need = (ok, msg) => {
    if (!ok) throw new Error(`scene-06-landscape: ${msg}`);
  };
  need(hc.path.join() === "4,5,6,7", `hc path ${hc.path}`);
  need(hc.tries.map((x) => `${x.m}${x.ok ? "+" : "-"}`).join() === "5+,6+,7+,8-,6-", "hc tries");
  need(L3.bestOf(f) === 29 && L3.peaks(f).join() === "7,18,29", "peaks");
  need(f[4].toFixed(2) === "0.34" && f[8] < f[7] && f[6] < f[7], "heights");

  const T_STEP = 4.8; // first move starts
  const T_REJ = [6.6, 7.1];
  const sh = (t, a, b) =>
    V.clamp(Math.sin(Math.PI * 6 * V.clamp((t - a) / (b - a))) * (1 - V.clamp((t - a) / (b - a))));

  V.scene({
    kicker: "LANDSCAPES",
    title: ["Draw every solution", "as a landscape"],
    dur: 10,
    caps: [
      [0.4, 2.8, "Neighbouring solutions sit side by side."],
      [3, 4.8, "Nearby solutions have similar fitness."],
      [5, 7.6, "Hillclimbing climbs the hill it starts on."],
      [7.8, 9.5, "It stops at a local peak, not the best."],
    ],
    build(stage) {
      const P = L3.land(stage, { x: 0, y: 10, w: 936, h: 450, kind: "multi", frame: true });
      const tall = P.tag("taller = fitter = shorter tour", { at: "tl", tone: "grey" });
      const axis = L3.tag(stage, {
        x: 468,
        y: 490,
        text: "all solutions, neighbours side by side",
        anchor: "c",
        tone: "grey",
      });
      const arrowSvg = L5.svg(stage);
      const arrow = L5.arrow(0, 0, 70, 0, "grey", 1, { w: 6, head: 20 });
      const arrowG = V.s("g", {}, arrow);
      arrowSvg.append(arrowG);
      const star = P.marker("star", { size: 44 });
      const hiker = P.marker("token", { size: 34 });
      const ghost1 = P.marker("ghost", { size: 34, tone: "red" });
      const ghost2 = P.marker("ghost", { size: 34, tone: "red" });
      const bad1 = P.marker("badge", { icon: "cross" });
      const bad2 = P.marker("badge", { icon: "cross" });
      const good = P.marker("badge", { icon: "tick" });
      const stuck = L3.sticker(P.html, {
        x: 0,
        y: 0,
        w: 300,
        h: 64,
        text: "local optimum",
        tone: "red",
        icon: "cross",
      });
      const best = L3.sticker(P.html, { x: 0, y: 0, w: 130, h: 64, text: "best", tone: "orange", icon: null });
      const sx = Math.max(12, P.px(7) - 150);
      const sy = 98;
      const bx = P.px(29) - 200;
      const by = P.py(29) - 54;
      return (t) => {
        const sk = ramp(t, 7.8, 8.4, E.lin);
        const barsK = (i) => ramp(t, 0.3 + 0.05 * i, 0.65 + 0.05 * i) * (1 - ramp(t, 2.8, 3.8));
        P.update({ curve: ramp(t, 2.8, 3.8, E.lin), fill: ramp(t, 3.2, 4.0, E.lin), bars: t < 3.9 ? barsK : 0 });
        const intro = ramp(t, 0.2, 0.7);
        V.show(axis.holder, intro);
        axis.set({ o: intro });
        V.place(arrowG, { x: 762, y: 508, o: intro });
        tall.set({ o: ramp(t, 2.8, 3.6) });
        // hiker pops, then climbs 4 -> 5 -> 6 -> 7
        const popK = ramp(t, 4.0, 4.8, E.lin);
        const st = L3.stepAt(t, T_STEP, 0.6, 3);
        let i = START;
        let dy = 0;
        for (let s = 0; s < st.n; s++) {
          const h = L3.hop(
            hc.path[s],
            hc.path[s + 1],
            s < st.n - 1 ? 1 : ramp(t, T_STEP + 0.6 * s, T_STEP + 0.6 * s + 0.3, E.lin),
            34,
          );
          i = h.i;
          dy = h.dy;
        }
        const shake = sh(t, 7.0, 7.8) * 8;
        hiker.set({ i, dy, dx: shake, s: E.pop(popK), o: popK > 0 ? 1 : 0 });
        // green tick after each accepted move
        let tk = 0;
        for (let s = 0; s < 3; s++) tk = Math.max(tk, flash(t, T_STEP + 0.6 * s + 0.3, T_STEP + 0.6 * s + 0.85));
        const tpos = t < T_STEP + 0.6 ? 5 : t < T_STEP + 1.2 ? 6 : 7;
        good.set({ icon: "tick", i: tpos, o: tk > 0 ? Math.min(1, tk * 2.5) : 0, k: Math.min(1, tk * 2.5), dy: -28 });
        // two rejected tries
        const g1 = ramp(t, T_REJ[0], T_REJ[0] + 0.25);
        const g2 = ramp(t, T_REJ[1], T_REJ[1] + 0.25);
        const g1o = g1 * (1 - g2);
        ghost1.set({ i: 8, o: g1o > 0 ? 1 : 0, s: 0.8 + 0.2 * E.pop(g1) * (g1o > 0 ? 1 : 0), ring: "red", ringK: 0 });
        bad1.set({ icon: "cross", i: 8, o: g1o > 0.5 ? 1 : 0, k: ramp(t, T_REJ[0] + 0.1, T_REJ[0] + 0.4) });
        ghost2.set({ i: 6, o: g2 > 0 ? 1 : 0, s: 0.8 + 0.2 * E.pop(g2), ring: "red", ringK: 0 });
        bad2.set({ icon: "cross", i: 6, o: g2 > 0 ? 1 - sk : 0, k: ramp(t, T_REJ[1] + 0.1, T_REJ[1] + 0.4) });
        // verdicts
        stuck.set({ k: sk, o: sk > 0 ? 1 : 0, dx: sx, dy: sy });
        const sc = ramp(t, 8.4, 9.0, E.lin);
        star.set({ i: 29, s: E.pop(sc), o: sc > 0 ? 1 : 0 });
        const bk = ramp(t, 8.6, 9.2, E.lin);
        best.set({ k: bk, o: bk > 0 ? 1 : 0, dx: bx, dy: by });
      };
    },
  });
})();
