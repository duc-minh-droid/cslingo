/* Phase 7 · Information Theory & Compression (algo-7), scene 05: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "DECODING",
    title: ["Codes you can read", "without any gaps"],
    dur: 12,
    caps: [
      [0.4, 2.2, "Codes sit side by side, with no gaps."],
      [2.4, 3.8, "01 could be A then B…"],
      [3.8, 5.3, "…or C. Two readings!"],
      [5.7, 7.6, "Put every code at a branch end."],
      [7.6, 10.2, "Follow the bits down. A leaf means a letter is done."],
      [10.5, 11.9, "No code starts another."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 5 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
