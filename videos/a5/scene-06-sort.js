/* Phase 5 · scene 06-sort: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 6 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "GRAHAM SCAN: SORT",
    title: ["Sort the points", "round the lowest one"],
    dur: 10,
    caps: [
      [0.8, 2.8, "The lowest point is on the hull."],
      [3, 5.8, "Sort the rest by angle, sweeping anticlockwise."],
      [7.6, 9.6, "The path still has dents."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-red",
        text: "scene 6 · placeholder",
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
