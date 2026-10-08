/* Phase 4 · scene 07-correct: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "WHY BOTH ARE CORRECT",
    title: ["Every step is", "a safe cut"],
    dur: 11,
    caps: [
      [0.4, 3.0, "Every cable they take is the cheapest across some cut."],
      [3.2, 7.0, "Prim cuts off its tree. Kruskal cuts off one group."],
      [7.2, 10.5, "Both only make safe choices, so both find the same tree."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 07-correct",
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
