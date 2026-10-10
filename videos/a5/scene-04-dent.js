/* Phase 5 · scene 04-dent: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 4 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "WHY TURNS MATTER",
    title: ["A convex shape always", "turns the same way"],
    dur: 11,
    caps: [
      [1, 3.2, "Walk round the hull, corner by corner."],
      [3.4, 5.5, "Every turn is a left turn."],
      [6.3, 8.4, "Go through F and you turn right."],
      [8.6, 10.8, "Right turn: a dent, not a corner."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-purple",
        text: "scene 4 · placeholder",
        style: {
          left: "218px",
          top: "250px",
          width: "500px",
          height: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "38px",
        },
      });
      stage.append(card);
      return (t) => V.place(card, { s: 0.8 + 0.2 * V.ramp(t, 0.1, 0.6, V.ease.pop), o: V.ramp(t, 0.1, 0.4) });
    },
  });
})();
