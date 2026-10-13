/* Phase 8 · scene 02 key-problem: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 2). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "THE KEY PROBLEM",
    title: ["The cipher needs a key", "but Eve is listening"],
    dur: 11,
    caps: [
      [2.0, 4.2, "Anything on the open wire, Eve can read."],
      [5.0, 7.2, "A cipher scrambles it with a secret key."],
      [8.7, 10.8, "But how does Bob get the key without Eve seeing it?"],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: key-problem", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
