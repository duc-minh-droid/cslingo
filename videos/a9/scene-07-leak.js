/* Phase 9 · Fourier Transform & FFT (algo-9), scene 07: PLACEHOLDER written by the architect so the page loads and the length is right.
   Replace the build() with the real scene described in videos/_plan/algo-9.json (scenes[5].spec). Keep the kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const { ramp } = V;
  V.scene({
    kicker: "LEAKAGE",
    title: ["Cut a wave mid-cycle,", "and the bars leak"],
    dur: 12,
    caps: [
      [1.4, 3.2, "Whole cycles fit the window: one clean bar."],
      [4.4, 6.1, "Half a cycle more: the ends do not meet."],
      [6.4, 8.2, "The jump needs many frequencies: the bars leak."],
      [8.8, 10.9, "A window fades the ends, so the leak shrinks."],
    ],
    build(stage) {
      const card = V.h("div", {
        class: "v-card c-orange",
        text: "scene 07: to be drawn",
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
