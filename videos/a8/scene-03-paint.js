/* Phase 8 · scene 03 paint: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 3). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "SHARED SECRET",
    title: ["Mix paint in public,", "share a secret colour"],
    dur: 12,
    caps: [
      [1.2, 3.4, "Both start with the same public paint."],
      [3.6, 5.8, "Each adds a secret paint of their own."],
      [6.0, 8.0, "They swap the mixtures. Eve can see those."],
      [8.0, 9.9, "Each adds their own secret again: the very same colour."],
      [10.1, 11.8, "Eve cannot unmix paint to find a secret."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: paint", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
