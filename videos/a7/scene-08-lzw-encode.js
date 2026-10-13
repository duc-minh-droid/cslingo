/* Phase 7 · Information Theory & Compression (algo-7), scene 08: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "LZW",
    title: ["LZW learns phrases", "as it reads"],
    dur: 13,
    caps: [
      [0.4, 2.4, "LZW starts with a tiny dictionary: A and B."],
      [2.6, 4.8, "A new longer phrase: send a code, learn it."],
      [5.2, 6.8, "Known? Keep growing."],
      [7.2, 8.7, "Still known: grow again."],
      [8.9, 10.4, "Longer phrases get one code each."],
      [11.4, 12.9, "Nine letters became five codes."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 8 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
