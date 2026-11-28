/* Lecture 18 video, scene 10-units: lesson 18.3's spiking heuristic units (L18.UNITS, unitsDemo seed 11, a toy). GAs and PSO
   are parallel but energy hungry on ordinary hardware. Five units U1..U5 each hold a candidate setting (0..10) and a charge;
   a manager and selector coordinate. No spike: a heuristic step towards the best so far (7.2). Spike: the neuron's own
   dynamics make a jump. U1: 2.8 -> 5.2 -> 6.3 -> spike 1.3 -> 4.0.
   Layout (stage px): header y 12..100 (GA and PSO chips, a draining battery, 'parallel, but energy hungry'), replaced at 9.8
   by the orange banner; manager card y 118..172 (from 6.0 the move legend instead); five lanes at y 190 + 76 i (h 70):
   'U1'.. at x 12, axis x 100..760 (0..10), charge bar x 790..924; the green 'best 7.2' line at x 575 with its label at y 586.
   Story (local seconds): 0.4 header, battery drains 0.8..2.8; 3.2 manager, lanes 3.4 + 0.15 i, the best line 4.0; the lanes
   pulse out of step from 4.2; 6.0 the other lanes fade, U1 ticks at 6.3 / 7.0 (steps, grey arrows), 8.2 (spike: charge full,
   purple flash and arrow), 9.0 (step); 9.8 the banner; hold to 12. */
VID.scene({
  kicker: "EVOLUTION ON A SPIKING CHIP",
  title: ["Spike, jump;", "no spike, step"],
  dur: 12,
  caps: [
    [0.4, 3.0, "GAs and PSO are parallel but energy hungry on normal hardware."],
    [3.2, 5.8, "Neuromorphic heuristic units evolve candidates asynchronously."],
    [6.0, 7.8, "No spike: a heuristic step, towards the best so far."],
    [8.0, 9.6, "A spike: the neuron's own dynamics make a jump."],
    [9.8, 11.7, "Promising, but still highly experimental."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp, lerp, flash } = V;
    const U = L18.UNITS;
    const U1 = [U.start[0], ...U.ticks.map((s) => s[0])];
    L18.same(
      U1.map((s) => s.x),
      [2.8, 5.2, 6.3, 1.3, 4],
      "scene 10: U1's settings",
    );
    const TT = [6.3, 7.0, 8.2, 9.0];
    const X = (v) => 100 + 66 * v;
    const LY = (i) => 190 + 76 * i;
    const svg = V.l5.svg(stage, 936, 640);
    // header
    const ga = L13.chip(stage, { x: 12, y: 18, w: 96, h: 70, text: "GA", tone: "orange", fs: 34 });
    const pso = L13.chip(stage, { x: 120, y: 18, w: 110, h: 70, text: "PSO", tone: "orange", fs: 34 });
    const bat = L18.battery(svg, 252, 22, 170, 62);
    const hungry = L13.label(stage, {
      x: 450,
      y: 34,
      w: 474,
      text: "parallel, but energy hungry",
      tone: "orange",
      align: "left",
    });
    const banner = L13.tag(stage, {
      x: 150,
      y: 30,
      text: "promising, still highly experimental",
      tone: "orange",
      solid: true,
      fs: 34,
    });
    const mgr = L13.tag(stage, {
      x: 12,
      y: 118,
      text: "manager and selector: global coordination",
      tone: "green",
      solid: true,
    });
    const legS = L13.tag(stage, { x: 12, y: 118, text: "no spike: heuristic step", tone: "grey" });
    const legD = L13.tag(stage, { x: 400, y: 118, text: "spike: own dynamics", tone: "purple", solid: true });
    // lanes
    const lanes = U.start.map((s, i) => {
      const g = svg.appendChild(V.s("g", {}));
      L18.rect(g, { x: 88, y: LY(i), w: 684, h: 70, rx: 16, tone: "grey", fill: "dim", sw: 3 });
      L18.line(g, [X(0), LY(i) + 46], [X(10), LY(i) + 46], "grey", 4);
      L18.rect(g, { x: 790, y: LY(i) + 22, w: 134, h: 30, rx: 8, tone: "purple", fill: "dim", sw: 3 });
      const fill = g.appendChild(V.s("rect", { x: 794, y: LY(i) + 26, height: 22, rx: 5 }));
      fill.style.fill = L13.tone("purple").c;
      const dot = L18.circ(g, X(s.x), LY(i) + 46, 14, "blue");
      const lab = L13.label(stage, { x: 12, y: LY(i) + 18, w: 70, text: `U${i + 1}`, align: "left", bold: true });
      return { g, fill, dot, lab };
    });
    const best = L18.line(svg, [X(U.best), 184], [X(U.best), 572], "green", 6);
    const bestL = L13.label(stage, {
      x: X(U.best) - 110,
      y: 586,
      w: 220,
      text: `best ${U.best}`,
      tone: "green",
      bold: true,
    });
    const val = L13.label(stage, { x: 0, y: LY(0) - 2, w: 80, text: "", tone: "blue", bold: true });
    const arrows = TT.map(() => L13.arrow(svg, { tone: "grey", w: 6, head: 18 }));
    const OFF = [0, 0.37, 0.81, 0.22, 0.6];

    return (t) => {
      // header, then the banner
      const hk = ramp(t, 0.4, 0.8) * (1 - ramp(t, 9.6, 9.9));
      ga.set({ k: hk, solid: true });
      pso.set({ k: hk, solid: true });
      const lvl = 1 - 0.8 * ramp(t, 0.8, 2.8, V.ease.lin);
      bat.set({ level: lvl, tone: lvl < 0.45 ? "red" : "orange" });
      V.place(bat.g, { o: hk });
      hungry.set({ k: hk });
      banner.set({ k: ramp(t, 9.8, 10.2) });
      mgr.set({ k: ramp(t, 3.2, 3.6) * (1 - ramp(t, 5.9, 6.1)) });
      legS.set({ k: ramp(t, 6.1, 6.5) });
      legD.set({ k: ramp(t, 8.0, 8.4) });
      // lanes
      const focus = ramp(t, 6.0, 6.3);
      lanes.forEach((ln, i) => {
        const k = ramp(t, 3.4 + 0.15 * i, 3.8 + 0.15 * i);
        V.place(ln.g, { o: k * (i ? 1 - 0.7 * focus : 1) });
        ln.lab.set({ k, o: i ? 1 - 0.7 * focus : 1 });
        let x = U.start[i].x,
          v = U.start[i].v;
        if (i === 0) {
          U1.forEach((s, j) => {
            if (!j) return;
            const q = ramp(t, TT[j - 1], TT[j - 1] + 0.4, V.ease.inOut);
            x = lerp(x, s.x, q);
            const full = s.last === "spike" ? ramp(t, TT[j - 1] - 0.3, TT[j - 1]) : 0;
            v =
              t < TT[j - 1] - 0.3
                ? v
                : s.last === "spike"
                  ? t < TT[j - 1] + 0.2
                    ? lerp(v, 1, full)
                    : 0
                  : lerp(v, s.v, q);
          });
        }
        ln.dot.setAttribute("cx", X(x).toFixed(1));
        ln.fill.setAttribute("width", (126 * Math.min(1, v)).toFixed(1));
        const p = t > 4.2 && t < 6.0 ? flash((t - 4.2 + OFF[i]) % 1, 0, 0.35) : 0;
        const spk = i === 0 ? flash(t, 8.2, 8.7) : 0;
        V.place(ln.dot, { s: 1 + 0.4 * p + 0.6 * spk });
        L18.paint(ln.dot, spk > 0.05 ? "purple" : "blue");
        if (i === 0) {
          val.set({ k: focus, text: x.toFixed(1), x: X(x) - 40 });
        }
      });
      L18.op(best, ramp(t, 4.0, 4.4));
      bestL.set({ k: ramp(t, 4.0, 4.4) });
      // U1's moves
      arrows.forEach((a, j) => {
        const from = U1[j].x,
          to = U1[j + 1].x;
        const spike = U1[j + 1].last === "spike";
        const on = ramp(t, TT[j] - 0.1, TT[j] + 0.3) * (1 - ramp(t, (TT[j + 1] || 99) - 0.2, TT[j + 1] || 99));
        const dir = to > from ? 1 : -1;
        a.set({
          a: [X(from) + dir * 18, LY(0) + 46],
          b: [X(to) - dir * 18, LY(0) + 46],
          k: on,
          tone: spike ? "purple" : "grey",
        });
      });
    };
  },
});
