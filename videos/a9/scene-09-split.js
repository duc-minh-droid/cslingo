/* Phase 9 · Fourier Transform & FFT (algo-9), scene 09: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[7].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "THE FFT",
    title: ["The FFT splits", "evens from odds"],
    dur: 12.5,
    caps: [
      [1.5, 3.1, "A full DFT does all 64 products."],
      [3.3, 4.8, "Split into even and odd samples."],
      [5.0, 6.6, "Two half-size DFTs cost 16 each."],
      [6.9, 8.6, "One butterfly: one product, two answers."],
      [9.2, 11.4, "32 products and 4 butterflies, not 64."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-purple",
        text: "scene 09: to be drawn",
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
