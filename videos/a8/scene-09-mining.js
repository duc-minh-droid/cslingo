/* Phase 8 · scene 09 mining: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 9). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "PROOF OF WORK",
    title: ["Sealing a block", "means guessing"],
    dur: 13.5,
    caps: [
      [0.4, 2.4, "Try numbers (nonces) until the hash starts with 0."],
      [2.6, 5.6, "Every try gives a new, unpredictable hash."],
      [6.2, 8.4, "Found it after 15 hashes. Checking takes just 1."],
      [8.8, 11.0, "Each extra zero makes a hit 16 times rarer."],
      [11.2, 13.2, "So it costs about 16 times more work."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: mining", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
