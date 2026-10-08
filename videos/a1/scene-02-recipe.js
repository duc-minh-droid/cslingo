/* Algorithms Phase 1 video (algo-1), scene-02-recipe.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 2). */
VID.scene({
  kicker: "WHAT IS AN ALGORITHM?",
  title: ["A wish is not", "an algorithm"],
  dur: 10,
  caps: [
    [0.4, 2.2, "“Find the biggest” is only a wish."],
    [2.5, 6.4, "An algorithm answers every question in advance."],
    [7.1, 9.5, "Even: what if the list is empty?"],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 2 placeholder",
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
