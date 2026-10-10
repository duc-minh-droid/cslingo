/* Phase 7 · Information Theory & Compression (algo-7), scene 09: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "LZW",
    title: ["The decoder rebuilds", "the same dictionary"],
    dur: 12,
    caps: [[0.4, 2.0, "The decoder gets only codes and the A, B start."], [2.4, 5.0, "Each code adds an entry: last chunk plus next letter."], [6.6, 9.2, "Code 4 is not known yet: AB plus its own first letter."], [10.0, 11.8, "The text is back. The dictionary was never sent."]],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 9 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
