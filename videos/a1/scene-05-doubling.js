/* Algorithms Phase 1 video (algo-1), scene-05-doubling.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 5). */
VID.scene({
  kicker: "BIG-O",
  title: ["Double the input,", "watch the work"],
  dur: 12,
  caps: [
    [0.4, 2.8, "Now double n, from 8 to 16."],
    [3.0, 5.2, "One loop: twice the work."],
    [5.4, 7.4, "Nested loops: four times."],
    [7.6, 10.0, "Halving: just one extra step."],
    [10.2, 11.7, "The shape of the growth is the Big-O."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 5 placeholder",
      style: {
        left: "168px",
        top: "250px",
        width: "600px",
        height: "110px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "34px",
      },
    });
    stage.append(card);
    return (t) => VID.place(card, { y: (1 - VID.ramp(t, 0.1, 0.6)) * 24, o: VID.ramp(t, 0.1, 0.6) });
  },
});
