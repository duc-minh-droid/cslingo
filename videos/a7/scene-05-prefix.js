/* Phase 7 · Information Theory & Compression (algo-7), scene 05: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "DECODING",
    title: ["Codes you can read", "without any gaps"],
    dur: 12,
    caps: [[0.4, 1.9, "These codes have no gaps between them."], [2.0, 3.0, "01 could be A then B…"], [3.1, 5.0, "…or C. That code has two readings."], [5.6, 7.4, "Put every code at the end of a branch."], [7.5, 10.4, "Follow the bits down. A leaf means a letter is done."], [10.5, 11.8, "No code starts another: no gaps needed."]],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 5 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
