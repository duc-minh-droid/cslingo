/* Phase 9 · Fourier Transform & FFT (algo-9), scene 05: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[3].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "THE DFT",
    title: ["Test every frequency:", "that is the DFT"],
    dur: 12,
    caps: [
      [1.2, 3.0, "Run the test at every spin speed."],
      [3.2, 5.0, "Each test reads all 8 samples."],
      [6.6, 8.1, "Eight tests give eight bars."],
      [8.3, 9.8, "That is 8 × 8 = 64 products."],
      [10.0, 11.6, "A real wave gives a mirror pair."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-orange",
        text: "scene 05: to be drawn",
        style: {
          left: "168px",
          top: "240px",
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
