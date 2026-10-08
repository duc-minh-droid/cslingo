/* Algorithms Phase 3 · scene 02-region: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 2).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "THE PROBLEM",
    title: ["Rules cut the plane,", "what is left is legal"],
    dur: 12,
    caps: [
      [0.4, 3.2, "Each rule is a line that cuts the plane in half."],
      [3.4, 5.5, "Only the overlap passes both rules."],
      [5.7, 8.0, "Plug a plan into every rule."],
      [8.2, 10.8, "Pass them all and it is legal."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-02-region: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();
