/* Phase 5 · scene 07-stack: PLACEHOLDER written by the architect (the scene author replaces this whole file).
   The design is scene 7 of videos/_plan/algo-5.json ("spec"); the kicker, title, duration and captions below are final.
   Helpers: videos/a5/common*.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "GRAHAM SCAN: THE STACK",
    title: ["A stack pops", "every dent"],
    dur: 15,
    caps: [
      [0.8, 3, "Keep a stack. Push the first two points."],
      [3.2, 5.4, "Test the turn. Left keeps the point."],
      [6, 8.2, "A right turn is a dent: pop it."],
      [10.5, 12.7, "Pop until the turn is left, then push."],
      [13.3, 14.9, "The stack is the hull."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-green",
        text: "scene 7 · placeholder",
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
