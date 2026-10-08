/* Algorithms Phase 1 video (algo-1), scene-06-flow.js: PLACEHOLDER. Replace it with the real scene (spec: videos/_plan/algo-1.json, scene n = 6). */
VID.scene({
  kicker: "PAGERANK",
  title: ["Rank flows along", "the links"],
  dur: 13,
  caps: [
    [0.4, 1.9, "Give every page 25 tokens."],
    [2.0, 4.6, "Each page pours them equally down its links."],
    [4.8, 6.6, "D has no links, so its 25 tokens vanish."],
    [7.0, 9.4, "Fix: a dead end pours to every page."],
    [9.6, 12.4, "Now nothing is lost: the total is 100 again."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card c-purple",
      text: "Scene 6 placeholder",
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
