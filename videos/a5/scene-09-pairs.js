/* Phase 5 · scene 09-pairs: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 9 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "WHAT HULLS ARE FOR",
    title: ["The farthest pair is", "always on the hull"],
    dur: 11,
    caps: [
      [1, 3.2, "Try every pair: 21 of them."],
      [3.6, 5.5, "Drop pairs with an inside point."],
      [5.8, 7.8, "The farthest pair is two hull corners."],
      [8.4, 10.9, "1,000 points, 10 corners: 45 pairs, not 499,500."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-purple",
        text: "scene 9 · placeholder",
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
