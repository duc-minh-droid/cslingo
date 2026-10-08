/* Algorithms phase 2, scene 07: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 7). */
VID.scene({
  kicker: "ROUTERS",
  title: ["Routers forward", "one hop at a time"],
  dur: 13,
  caps: [
    [0.4, 3.0, "Every router learns the whole map."],
    [3.2, 7.0, "Each runs Dijkstra and keeps only the first hop."],
    [7.4, 12.4, "A packet moves on one table lookup at a time."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 7 (placeholder)",
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
