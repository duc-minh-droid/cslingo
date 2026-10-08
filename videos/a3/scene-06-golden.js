/* Algorithms Phase 3 · scene 06-golden: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 6).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "BRACKETING",
    title: ["No slope needed:", "one new probe a step"],
    dur: 13,
    caps: [
      [0.4, 3.2, "No slope? Three points can still trap a minimum."],
      [3.4, 7.2, "Add one probe a step. The lowest stays in the middle."],
      [7.4, 11.0, "Old probes are reused, so each cut costs one test."],
      [11.2, 12.8, "Every step keeps 0.618 of the bracket."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-06-golden: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();
