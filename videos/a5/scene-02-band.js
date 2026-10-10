/* Phase 5 · scene 02-band: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 2 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE CONVEX HULL",
    title: ["Stretch a rubber band", "round the pins"],
    dur: 12,
    caps: [
      [1.3, 3.5, "Stretch a rubber band round every pin."],
      [3.7, 6, "Let go. It snaps onto the outer pins."],
      [6.2, 8.4, "The pins it touches are the hull corners."],
      [8.6, 11.6, "A convex shape keeps every segment inside."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-green",
        text: "scene 2 · placeholder",
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
