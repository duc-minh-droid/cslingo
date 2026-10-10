/* Phase 5 · scene 03-turn: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 3 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE TURN TEST",
    title: ["Which way does", "the path turn?"],
    dur: 14,
    caps: [
      [0.6, 3.2, "Walk from p to a to b. Left or right?"],
      [3.4, 5.8, "The cross product: positive means a left turn."],
      [6.2, 8.1, "Now try a different path."],
      [8.3, 9.9, "Negative means a right turn."],
      [10, 11.9, "And one more path."],
      [12.1, 13.6, "Zero means a straight line."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-blue",
        text: "scene 3 · placeholder",
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
