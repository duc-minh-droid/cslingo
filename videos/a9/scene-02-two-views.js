/* Phase 9 · Fourier Transform & FFT (algo-9), scene 02: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[0].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "SIGNALS",
    title: ["One signal,", "two descriptions"],
    dur: 10.5,
    caps: [
      [1.2, 3.0, "Count the waves in one second."],
      [3.7, 5.5, "Two waves added make one wiggle."],
      [6.3, 8.1, "The bars show which waves are inside."],
      [8.4, 10.2, "One signal, two descriptions."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-blue",
        text: "scene 02: to be drawn",
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
