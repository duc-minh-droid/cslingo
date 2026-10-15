/* Phase 9 · Fourier Transform & FFT (algo-9), scene 10: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[8].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "THE FFT",
    title: ["Keep halving,", "share the work"],
    dur: 15.5,
    caps: [
      [0.6, 2.3, "Each half is a DFT too: split again."],
      [2.5, 4.0, "Down to single samples."],
      [4.2, 6.4, "Butterflies combine pairs, level by level."],
      [6.6, 8.7, "Three levels of four: 12 butterflies."],
      [8.9, 10.3, "The same answer as the direct DFT."],
      [11.2, 13.2, "A million samples: 18 minutes or 0.02 seconds."],
      [13.5, 15.2, "About 50,000 times less work."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-purple",
        text: "scene 10: to be drawn",
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
