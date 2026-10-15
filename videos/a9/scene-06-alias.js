/* Phase 9 · Fourier Transform & FFT (algo-9), scene 06: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[4].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "ALIASING",
    title: ["Sample too slowly,", "and a wave lies"],
    dur: 12.5,
    caps: [
      [1.7, 3.2, "Take 8 samples in one second."],
      [3.4, 5.1, "The dots fit a 1 Hz wave too."],
      [5.7, 7.3, "Half the sample rate is the limit."],
      [7.5, 9.3, "So 7 Hz folds back onto 1 Hz."],
      [9.9, 11.9, "Sample faster than twice the wave."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-orange",
        text: "scene 06: to be drawn",
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
