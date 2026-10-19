/* Lecture 6 · scene 10 (two-phase): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 10). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "TWO-PHASE COMMIT",
    title: ["Ask first,", "then decide once"],
    dur: 13.5,
    caps: [
      [0.5, 2.2, "First, ask every database."],
      [2.8, 4.6, "Each votes, and holds its locks."],
      [5.0, 6.8, "Any no means abort for all."],
      [7.3, 9.3, "All three abort and unlock."],
      [9.8, 12.0, "If all vote yes, all commit."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Two-Phase Commit" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
