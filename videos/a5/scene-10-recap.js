/* Phase 5 · scene 10-recap: PLACEHOLDER written by the architect (the recap author replaces this whole file).
   The design is the "recap" entry of videos/_plan/algo-5.json (bare scene, three rows of looping pictograms, calm finish).
   Helpers: videos/a5/common*.js, videos/l5/common.js (read their API comments first). */
(function () {
  const V = window.VID;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const card = V.h("div", {
        class: "v-card plain c-blue",
        text: "recap · placeholder",
        style: {
          left: "290px",
          top: "470px",
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
