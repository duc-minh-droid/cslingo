/* Phase 9 · Fourier Transform & FFT (algo-9), scene 04: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[2].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "THE TEST",
    title: ["Test each frequency", "with a spinning arrow"],
    dur: 14,
    caps: [
      [1.2, 2.9, "Take 8 samples of a wave."],
      [3.2, 5.2, "Each sample scales a spinning arrow."],
      [6.9, 8.6, "Right speed: the arrows line up and add."],
      [9.4, 11.0, "Now spin twice instead."],
      [11.4, 13.2, "The arrows loop back and cancel."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-purple",
        text: "scene 04: to be drawn",
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
