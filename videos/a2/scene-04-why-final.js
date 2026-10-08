/* Algorithms phase 2, scene 04: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 4). */
VID.scene({
  kicker: "WHY IT WORKS",
  title: ["Why settled means final,", "and when it breaks"],
  dur: 11,
  caps: [
    [0.4, 4.6, "Any other way to C goes via B, and B is already further."],
    [4.8, 6.8, "So the smallest waiting node is final."],
    [7.0, 10.6, "A negative road can undercut a node that was settled."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 4 (placeholder)",
      style: {
        left: "168px",
        top: "240px",
        width: "600px",
        height: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
      },
    });
    stage.append(card);
    return () => {};
  },
});
