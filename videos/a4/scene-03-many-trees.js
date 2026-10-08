/* Phase 4 · scene 03-many-trees: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE GOAL",
    title: ["Many spanning trees,", "one is cheapest"],
    dur: 11,
    caps: [
      [0.4, 2.9, "The same five towns have 21 different spanning trees."],
      [3.0, 5.3, "Each one has its own total cost."],
      [5.4, 6.9, "The cheapest is the minimum spanning tree."],
      [7.0, 10.6, "Bigger networks have far too many trees to try them all."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 03-many-trees",
          style: {
            left: "168px",
            top: "250px",
            width: "600px",
            height: "110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          },
        }),
      );
      return () => {};
    },
  });
})();
