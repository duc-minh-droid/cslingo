/* Algorithms Phase 1 video (algo-1), scene-10-iterate.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 10). */
VID.scene({
  kicker: "ITERATE",
  title: ["Repeat until", "the ranks settle"],
  dur: 12,
  caps: [
    [0.4, 2.0, "Start with equal rank on every page."],
    [2.2, 5.4, "Each round: pour along the links, add the teleport floor."],
    [5.8, 8.6, "The first rounds swing, then the ranks settle."],
    [9.0, 11.5, "R ranks first. The same loop ranks billions of pages."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 10 placeholder",
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
