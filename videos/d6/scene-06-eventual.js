/* Lecture 6 · scene 06 (eventual): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 6). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "EVENTUAL CONSISTENCY",
    title: ["Replicas disagree,", "then converge"],
    dur: 10.5,
    caps: [
      [0.5, 2.2, "The write lands on one copy."],
      [2.4, 4.2, "The others hear later."],
      [5.0, 6.7, "A read now can be stale."],
      [6.9, 8.9, "Soon every copy agrees."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Eventual Consistency" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
