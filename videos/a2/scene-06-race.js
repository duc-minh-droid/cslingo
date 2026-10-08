/* Algorithms phase 2, scene 06: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 6). */
VID.scene({
  kicker: "A* VS DIJKSTRA",
  title: ["Same route,", "far less work"],
  dur: 12,
  caps: [
    [0.4, 3.4, "Same grid, same wall. Dijkstra looks everywhere."],
    [3.6, 7.4, "A* aims at the goal and expands far fewer cells."],
    [7.8, 11.6, "But its guess must never be higher than the true cost."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 6 (placeholder)",
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
