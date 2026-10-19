/* Lecture 6 · scene 05 (isolation): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 5). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "ACID \u00b7 ISOLATION",
    title: ["Isolation keeps", "payments apart"],
    dur: 12.5,
    caps: [
      [0.6, 2.3, "Two shoppers each pay £30."],
      [1.8, 3.2, "Both read £100 first."],
      [3.3, 5.0, "Both write £70: one is lost."],
      [6.9, 8.4, "One at a time gives £40."],
      [8.8, 12.2, "ACID: atomic, consistent, isolated, durable."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Acid \u00b7 Isolation" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
