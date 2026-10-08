/* Algorithms Phase 1 video (algo-1), scene-07-trap.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 7). */
VID.scene({
  kicker: "LINK TRAP",
  title: ["Closed loops", "trap the rank"],
  dur: 10,
  caps: [
    [0.4, 2.6, "A and B link only to each other."],
    [2.8, 6.0, "Rank sloshes between them, round after round."],
    [6.2, 9.4, "A trap: X gets nothing, so the ranking says little."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 7 placeholder",
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
