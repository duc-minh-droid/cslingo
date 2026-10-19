/* Lecture 6 · scene 07 (linearizable): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 7). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "LINEARIZABILITY",
    title: ["Linearizable: act", "like one copy"],
    dur: 14,
    caps: [
      [0.5, 2.5, "Many copies should act like one."],
      [3.0, 4.8, "Each bar is one operation in time."],
      [6.1, 7.9, "One flip explains every read."],
      [8.7, 10.6, "Now B reads 0 after A read 1."],
      [11.3, 13.4, "No flip fits: not linearizable."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Linearizability" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
