/* Algorithms phase 2, scene 03: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 3). */
VID.scene({
  kicker: "DIJKSTRA",
  title: ["Settle the closest node,", "then relax its roads"],
  dur: 17,
  caps: [
    [0.4, 2.5, "Settle the node with the smallest distance."],
    [2.7, 8.0, "Then check its roads. A shorter way replaces the old distance."],
    [8.2, 12.4, "Repeat. The smallest waiting distance is always final."],
    [12.8, 16.4, "The green roads are the shortest routes: A to E costs 8."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 3 (placeholder)",
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
