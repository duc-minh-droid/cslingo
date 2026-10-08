/* Algorithms Phase 1 video (algo-1), scene-08-surfer.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 8). */
VID.scene({
  kicker: "THE RANDOM SURFER",
  title: ["Teleport to escape", "every trap"],
  dur: 12,
  caps: [
    [0.4, 3.0, "The surfer follows a link 85% of the time."],
    [3.2, 5.8, "Otherwise the surfer teleports to a random page."],
    [6.2, 9.0, "Count the visits over many hops."],
    [9.4, 11.6, "The shares settle: that is PageRank."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 8 placeholder",
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
