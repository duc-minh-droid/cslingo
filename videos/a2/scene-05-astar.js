/* Algorithms phase 2, scene 05: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 5). */
VID.scene({
  kicker: "A*",
  title: ["A* is Dijkstra", "plus a compass"],
  dur: 13,
  caps: [
    [0.4, 2.6, "A* is Dijkstra with a compass."],
    [2.8, 5.0, "Score each cell: cost so far g, plus a guess h."],
    [5.2, 9.6, "It expands the lowest score, so it heads for the goal."],
    [10.0, 12.6, "It finds the way round the wall: cost 11."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 5 (placeholder)",
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
