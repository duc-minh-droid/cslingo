/* Algorithms Phase 1 video (algo-1), scene-03-invariant.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 3). */
VID.scene({
  kicker: "THE LOOP INVARIANT",
  title: ["A promise that", "stays true"],
  dur: 13,
  caps: [
    [0.4, 2.6, "Scan once and keep the biggest so far."],
    [2.8, 6.2, "After k items, best is the biggest of those k."],
    [6.6, 10.6, "It holds after every step. That is the invariant."],
    [10.9, 12.8, "At the end the promise is the answer: 9."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 3 placeholder",
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
