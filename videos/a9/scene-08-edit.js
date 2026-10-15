/* Phase 9 · Fourier Transform & FFT (algo-9), scene 08: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[6].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "FILTERING",
    title: ["Edit the bars,", "then go back"],
    dur: 11.5,
    caps: [
      [2.2, 4.0, "The DFT turns the wiggle into bars."],
      [4.2, 5.8, "The hum is one pair of bars."],
      [6.0, 7.7, "Delete both bars."],
      [8.0, 10.0, "Go back: the hum is gone."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-orange",
        text: "scene 08: to be drawn",
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
