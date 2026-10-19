/* Lecture 6 · scene 03 (cap): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 3). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "THE CAP THEOREM",
    title: ["A cut network", "forces a choice"],
    dur: 14,
    caps: [
      [0.5, 2.4, "Two copies hold the tickets left."],
      [2.9, 4.5, "The link between them is cut."],
      [5.0, 6.8, "A sale reaches only one copy."],
      [7.2, 8.9, "Node B is asked to read."],
      [9.2, 11.0, "Refuse: right, but not available."],
      [11.4, 13.3, "Answer: available, but stale."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "The Cap Theorem" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
