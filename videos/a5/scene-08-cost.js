/* Phase 5 · scene 08-cost: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 8 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "WRAP OR SCAN?",
    title: ["The cost depends on", "the size of the hull"],
    dur: 12,
    caps: [
      [1, 3, "1,024 points, and only 4 are corners."],
      [3.2, 5, "Wrapping: 4,096 steps. Scan: 10,240."],
      [5.1, 6.6, "A small hull favours wrapping."],
      [7, 8.9, "Now every point is a corner."],
      [9.3, 11.6, "Wrapping explodes. The scan stays at 10,240."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-blue",
        text: "scene 8 · placeholder",
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
