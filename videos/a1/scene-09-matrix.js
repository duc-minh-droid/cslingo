/* Algorithms Phase 1 video (algo-1), scene-09-matrix.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 9). */
VID.scene({
  kicker: "THE MATRIX",
  title: ["Links become", "a matrix"],
  dur: 13,
  caps: [
    [0.4, 4.4, "Each column is where one page sends its rank."],
    [4.6, 7.8, "T has no links, so it pours 0.2 into every page."],
    [8.2, 11.9, "Damping adds a teleport floor of 0.03 to every cell."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 9 placeholder",
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
