/* Lecture 13 video, scene 02-tradeoff: lesson 13.1's wake toy model (L13.WAKE). Two turbines in a row: the back one sits in
   the front one's wake (red cone). The back turbine slides back from a gap of 2 to 8 rotor widths: its power climbs from 77%
   to 95% (green stat) while the cable cost climbs from £3.0m to £12.0m (red stat). Then two grey tags name the two goals.
   Layout (stage px): field panel x 12..924, y 12..352 (ground at y 300); front turbine x 140, back turbine x 140 + 80 g;
   stats y 384 (power x 12, cost x 486, 438 x 84); goal tags y 510.
   Story (local seconds): 0.3 panel, 0.6 turbines, 1.2 wake; 3.6-8.4 gap 2 -> 8 (stats follow, values at whole gaps);
   9.2 / 9.6 the goal tags pop; hold to 13. */
VID.scene({
  kicker: "A TRADE-OFF",
  title: ["Two goals that", "pull against each other"],
  dur: 13,
  caps: [
    [0.5, 3.4, "The back turbine sits in the front one's wake."],
    [3.6, 6.4, "Moving it further back gives it more power."],
    [6.6, 8.9, "But the longer cable costs more money."],
    [9.2, 12.7, "Cost and power pull against each other: a trade-off."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L5 = V.l5;
    const { ramp, ease: E, lerp } = V;
    const W = L13.WAKE;
    L13.same([W(2).pct, W(8).pct, W(2).cable, W(8).cable], [77, 95, 3, 12], "scene 2: wake model ends");

    const svg = L5.svg(stage);
    const S = (n, a) => svg.appendChild(V.s(n, a));
    const panel = V.h("div", {
      class: "v-card plain c-grey",
      style: { position: "absolute", left: "12px", top: "12px", width: "912px", height: "334px" },
    });
    stage.prepend(panel);
    const GY = 300;
    const HUB = 150;
    const ground = S("line", { x1: 40, y1: GY, x2: 896, y2: GY, "stroke-width": 5, "stroke-linecap": "round" });
    ground.style.stroke = "var(--line-2)";
    const wake = S("polygon", { "stroke-width": 3, "stroke-dasharray": "10 7" });
    wake.style.fill = L13.tone("red").dim;
    wake.style.stroke = L13.tone("red").c;
    const wakeLab = S("text", { x: 560, y: 284, "text-anchor": "middle" });
    wakeLab.textContent = "wake";
    wakeLab.style.font = "900 28px Nunito, sans-serif";
    wakeLab.style.fill = L13.tone("red").ink;
    const winds = [90, 150, 210].map((y) => L5.arrow(30, y, 96, y, "grey", 1, { w: 6, head: 18 }));
    winds.forEach((a) => svg.appendChild(a));
    const windLab = S("text", { x: 30, y: 262 });
    windLab.textContent = "wind";
    windLab.style.font = "900 28px Nunito, sans-serif";
    windLab.style.fill = "var(--text-dim)";

    const turbine = () => {
      const g = S("g", {});
      const tower = g.appendChild(V.s("path", { d: `M-6 ${HUB} L-11 ${GY} L11 ${GY} L6 ${HUB} Z` }));
      tower.style.fill = "var(--line-2)";
      const rot = g.appendChild(V.s("g", {}));
      [0, 120, 240].forEach((a) => {
        const b = rot.appendChild(
          V.s("path", { d: "M-7 0 Q-9 -40 0 -92 Q9 -40 7 0 Z", transform: `rotate(${a})`, "stroke-width": 3 }),
        );
        b.style.fill = L13.tone("blue").c;
        b.style.stroke = L13.tone("blue").lip;
      });
      const hub = rot.appendChild(V.s("circle", { r: 13, "stroke-width": 3 }));
      hub.style.fill = "var(--panel)";
      hub.style.stroke = L13.tone("blue").lip;
      return { g, rot };
    };
    const front = turbine();
    const back = turbine();

    const pow = L13.stat(stage, { x: 12, y: 384, w: 438, h: 84, label: "back turbine power", tone: "green" });
    const cost = L13.stat(stage, { x: 486, y: 384, w: 438, h: 84, label: "cable cost", tone: "red" });
    const goal1 = L13.tag(stage, { x: 12, y: 516, text: "cost: lower is better", tone: "grey", fs: 32 });
    const goal2 = L13.tag(stage, { x: 486, y: 516, text: "power: higher is better", tone: "grey", fs: 32 });

    const FX = 140;
    const PX = 80; // px per rotor width
    return (t) => {
      const kp = ramp(t, 0.2, 0.6);
      V.place(panel, { o: kp, s: 0.96 + 0.04 * kp });
      const kt = ramp(t, 0.5, 1.0, E.pop);
      const gap = lerp(2, 8, ramp(t, 3.6, 8.4, E.inOut));
      const g = Math.round(gap);
      const bx = FX + PX * gap;
      [
        [front, FX, 0.9],
        [back, bx, 0.9 * (0.4 + 0.6 * (W(g).pct / 100))],
      ].forEach(([tb, x, sp]) => {
        tb.g.setAttribute("transform", `translate(${x.toFixed(1)} 0) scale(${(0.6 + 0.4 * kt).toFixed(3)})`);
        tb.g.setAttribute("opacity", ramp(t, 0.5, 0.8).toFixed(3));
        tb.rot.setAttribute("transform", `translate(0 ${HUB}) rotate(${((t * 360 * sp) % 360).toFixed(1)})`);
      });
      const kw = ramp(t, 1.2, 1.8);
      const tip = 900;
      wake.setAttribute("points", `${FX},${HUB} ${tip},${HUB - 120} ${tip},${HUB + 120}`);
      wake.setAttribute("opacity", (0.9 * kw).toFixed(3));
      wakeLab.setAttribute("opacity", kw.toFixed(3));
      winds.forEach((a, i) => V.place(a, { x: 8 * Math.sin(2 * Math.PI * (t / 1.6 + i / 3)), o: kp }));
      windLab.setAttribute("opacity", kp.toFixed(3));
      ground.setAttribute("opacity", kp.toFixed(3));
      const ks = ramp(t, 1.4, 1.9);
      pow.set({ k: ks, text: `${W(g).pct}%` });
      cost.set({ k: ramp(t, 1.6, 2.1), text: `£${W(g).cable.toFixed(1)}m` });
      goal1.set({ k: ramp(t, 9.2, 9.6) });
      goal2.set({ k: ramp(t, 9.6, 10.0) });
    };
  },
});
