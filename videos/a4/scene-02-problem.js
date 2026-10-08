/* Phase 4 · scene 02-problem: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE PROBLEM",
    title: ["Connect every town", "with no spare cable"],
    dur: 11,
    caps: [
      [0.4, 2.8, "Every cable has a cost. Every town must be linked."],
      [3.0, 6.3, "Four cables link all five towns: a spanning tree."],
      [6.5, 10.5, "A fifth cable makes a loop. A tree has no loops."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 02-problem",
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
