/* Phase 9 · Fourier Transform & FFT (algo-9), scene 03: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[1].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "FOURIER'S IDEA",
    title: ["Add sine waves,", "get any shape"],
    dur: 11.5,
    caps: [
      [0.6, 2.1, "Target: a square wave."],
      [2.3, 3.9, "Start with one sine wave."],
      [4.1, 5.7, "Add a weaker wave, 3 times faster."],
      [5.9, 7.5, "Then 5 times faster, weaker still."],
      [7.7, 9.3, "Keep adding: the corners sharpen."],
      [9.5, 11.3, "Only odd waves are needed."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-blue",
        text: "scene 03: to be drawn",
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
