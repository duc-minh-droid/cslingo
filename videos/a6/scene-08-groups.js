/* Phase 6 · scene 08-groups (12.5 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[6].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "HAMMING CODE",
    title: ["Three checks,", "each guards a group"],
    dur: 12.5,
    caps: [
      [0.9, 2.8, "Check bits sit at positions 1, 2, 4."],
      [3, 4.6, "Write each position in binary."],
      [4.9, 6.5, "p4 guards positions starting with 1."],
      [6.7, 8.5, "p2 guards positions with a middle 1."],
      [8.8, 10.4, "p1 guards positions ending in 1."],
      [10.6, 12.3, "Every group now has an even count."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 08 · groups", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
