/* Algorithms Phase 1 video (algo-1), scene-04-count.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 4). */
VID.scene({
  kicker: "COUNTING WORK",
  title: ["Count the work,", "not the seconds"],
  dur: 11,
  caps: [
    [0.4, 3.2, "Count how many times work() runs when n is 8."],
    [3.4, 6.6, "The inner loop grows: 0 + 1 + 2 + … + 7 = 28."],
    [6.8, 9.2, "Two full loops: 8 × 8 = 64."],
    [9.4, 10.9, "28 is about half of 64."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 4 placeholder",
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
