/* Phase 9 · Fourier Transform & FFT (algo-9), scene 11-recap: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real recap described in videos/_plan/algo-9.json (recap.spec and recap.points): a bare scene with three rows of small
   animated pictograms that play once and hold, like videos/a6/scene-11-recap.js. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-green",
        text: "recap: to be drawn",
        style: {
          left: "240px",
          top: "460px",
          width: "600px",
          height: "130px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "34px",
          textAlign: "center",
        },
      });
      stage.append(card);
      return (t) => V.place(card, { o: ramp(t, 0.2, 0.6) });
    },
  });
})();
