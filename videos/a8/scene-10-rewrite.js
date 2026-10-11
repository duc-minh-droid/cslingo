/* Phase 8 · scene 10 rewrite: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 10). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "PROOF OF WORK",
    title: ["Rewriting history", "means redoing the work"],
    dur: 11,
    caps: [
      [0.5, 2.0, "Each block is sealed by its own proof of work."],
      [2.2, 4.0, "Edit block 1: its seal and the link both break."],
      [4.2, 6.2, "Forging it means mining block 1 again."],
      [6.4, 8.4, "Then every later block must be mined again too."],
      [8.8, 10.7, "Rewriting history means redoing all that work."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: rewrite", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
