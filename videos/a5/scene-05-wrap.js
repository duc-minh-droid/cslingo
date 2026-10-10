/* Phase 5 · scene 05-wrap: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 5 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "GIFT WRAPPING",
    title: ["Wrap the outside,", "one corner at a time"],
    dur: 15,
    caps: [
      [1, 3, "The leftmost point must be on the hull."],
      [3.2, 5.6, "Swing a line clockwise until it touches a point."],
      [5.8, 7.6, "Smallest angle wins: A to G."],
      [7.8, 10, "Repeat from each new point."],
      [12.9, 14.7, "Back at A. The loop closes."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-orange",
        text: "scene 5 · placeholder",
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
