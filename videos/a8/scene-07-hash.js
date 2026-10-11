/* Phase 8 · scene 07 hash: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 7). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "HASH",
    title: ["A hash is a", "fingerprint of data"],
    dur: 10,
    caps: [
      [0.5, 2.6, "A hash turns data into a short fingerprint."],
      [2.9, 4.9, "The same data always gives the same fingerprint."],
      [5.1, 7.2, "Change one letter and every digit changes."],
      [7.6, 9.6, "And you cannot work backwards from it."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: hash", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
