/* Lecture 13 video, scene 04-dominance: lesson 13.1's Pareto dominance on the wind farm (L13.FARM, same plot as scene 3).
   D (40, 62) against G (45, 58): D is cheaper and makes more power, so D dominates G (G lies in D's box, the region that is
   worse on both goals, and turns red). D against K (46, 64): D is cheaper, K makes more power; K is outside D's box and D is
   outside K's box, so neither dominates: they are mutually non-dominating.
   Layout (stage px): plot x 12, y 12, 584 x 616; right panel x 616..924: two stats 'cheaper' and 'more power' (y 90, 190),
   the verdict tag (y 310) and, in part 2, the label 'mutually non-dominating' (y 380).
   Story (local seconds): 0.3 plot (all grey), 0.8 D blue + G purple; 3.4 / 4.4 the two stats; 6.4 D's box grows, 7.0 G red
   cross, 7.4 'D dominates G'; 9.4 part 2: G back to grey, K purple, stats again (9.8, 10.6), 11.0 K's box; 12.2 verdict
   'neither dominates', 12.6 the label; hold to 15. */
VID.scene({
  kicker: "DOMINANCE",
  title: ["When one layout", "beats another"],
  dur: 15,
  caps: [
    [0.5, 3.0, "Compare two layouts, D and G."],
    [3.2, 6.2, "D is cheaper and makes more power."],
    [6.4, 9.2, "So D dominates G: no worse on any goal, better on at least one."],
    [9.4, 12.0, "Now D and K: D is cheaper, but K makes more power."],
    [12.2, 14.8, "Neither wins on both: they are mutually non-dominating."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const { ramp } = V;
    const F = L13.FARM;
    const [D, G, K] = [F.at.D, F.at.G, F.at.K];
    L13.same([D[0] < G[0], D[1] > G[1], D[0] < K[0], K[1] > D[1]], [true, true, true, true], "scene 4: who wins where");
    L13.same(
      [L13.dom(D, G, F.s), L13.dom(D, K, F.s), L13.dom(K, D, F.s)],
      [true, false, false],
      "scene 4: D dominates G; D and K are mutually non-dominating",
    );

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
      boxes: 2,
    });
    const RX = 616;
    const cheap = L13.stat(stage, { x: RX, y: 90, w: 308, h: 80, label: "cheaper", tone: "blue" });
    const more = L13.stat(stage, { x: RX, y: 190, w: 308, h: 80, label: "more power", tone: "blue" });
    const verdict = L13.tag(stage, { x: RX, y: 310, text: "", tone: "blue", solid: true, fs: 32 });
    const mutual = L13.label(stage, {
      x: RX,
      y: 384,
      w: 308,
      text: "mutually\nnon-dominating",
      tone: "orange",
      bold: true,
    });
    mutual.el.style.whiteSpace = "pre-line";
    const LDX = { I: [18, 40], J: [-18, -16], E: [-18, -16], D: [-18, -16] };
    const CORNER = [60, 20]; // worse on both goals: more cost, less power

    return (t) => {
      const two = t >= 9.4;
      const k2 = ramp(t, 9.4, 9.8);
      const dots = F.ids.map((k, i) => {
        const [ldx, ldy] = LDX[k] || [18, -16];
        const d = { at: F.P[i], tone: "grey", k: L13.seq(t, 0.3, 0.03, 0.4, i), lab: k, ldx, ldy };
        if (k === "D") Object.assign(d, { tone: "blue", ring: t >= 0.8 });
        if (k === "G") {
          const red = ramp(t, 7.0, 7.3) * (1 - k2);
          Object.assign(d, {
            tone: !two ? (red > 0.5 ? "red" : "purple") : "grey",
            ring: t >= 1.0 && !two,
            cross: red,
          });
        }
        if (k === "K" && two) Object.assign(d, { tone: "purple", ring: true });
        if (k === "D" || (k === "G" && t >= 1.0)) d.s = 1.15;
        return d;
      });
      const boxes = [{ a: D, b: CORNER, tone: "blue", k: ramp(t, 6.4, 7.0) }];
      if (two) boxes.push({ a: K, b: CORNER, tone: "purple", k: ramp(t, 11.0, 11.6) });
      pl.update({ k: ramp(t, 0.1, 0.4), dots, boxes });

      const r1 = two ? ramp(t, 9.8, 10.2) : ramp(t, 3.4, 3.8) * (1 - ramp(t, 9.4, 9.6));
      const r2 = two ? ramp(t, 10.6, 11.0) : ramp(t, 4.4, 4.8) * (1 - ramp(t, 9.4, 9.6));
      cheap.set({ k: r1, text: "D", tone: "blue" });
      more.set({ k: r2, text: two ? "K" : "D", tone: two ? "purple" : "blue" });
      verdict.set(
        two
          ? { k: ramp(t, 12.2, 12.6), text: "neither dominates", tone: "orange" }
          : { k: ramp(t, 7.4, 7.8) * (1 - ramp(t, 9.4, 9.6)), text: "D dominates G", tone: "blue" },
      );
      mutual.set({ k: ramp(t, 12.6, 13.0) });
    };
  },
});
