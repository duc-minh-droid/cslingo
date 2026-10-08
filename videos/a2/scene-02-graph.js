/* Algorithms phase 2, scene 02: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 2). */
VID.scene({
  kicker: "THE PROBLEM",
  title: ["A map is a graph:", "every road has a cost"],
  dur: 11,
  caps: [
    [0.4, 3.2, "A map is places joined by roads."],
    [3.4, 6.2, "Each road has a cost. A route adds them up."],
    [6.4, 9.0, "The fewest roads is not always the cheapest."],
    [9.2, 10.8, "There are 7 routes. We need a method."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 2 (placeholder)",
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
