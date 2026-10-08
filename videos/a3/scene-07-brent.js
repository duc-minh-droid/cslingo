/* Algorithms Phase 3 · scene 07-brent: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 7).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "BRACKETING",
    title: ["Fit a parabola,", "jump to its bottom"],
    dur: 13,
    caps: [
      [0.4, 3.2, "Same curve. Fit a parabola through the three points."],
      [3.4, 6.2, "Jump to the bottom of the parabola."],
      [6.4, 9.2, "Repeat: it homes in much faster than golden section."],
      [9.4, 12.4, "If a jump looks unsafe, take a golden step instead."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-07-brent: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();
