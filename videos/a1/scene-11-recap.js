/* Algorithms Phase 1 video (algo-1), scene-11-recap.js: PLACEHOLDER. Replace it with the real recap (spec: videos/_plan/algo-1.json, "recap"). */
VID.scene({
  bare: true,
  dur: 9,
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Recap placeholder",
      style: {
        left: "240px",
        top: "450px",
        width: "600px",
        height: "110px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "34px",
      },
    });
    stage.append(card);
    return (t) => VID.place(card, { o: VID.ramp(t, 0.1, 0.6) });
  },
});
