/* Phase 4 · scene 09-tour: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "FROM TREE TO TOUR",
    title: ["Walk round the tree,", "skip the repeats"],
    dur: 12,
    caps: [
      [0.4, 2.8, "Start with the minimum spanning tree. Its cost is W."],
      [3.0, 6.3, "Walk round it. Every cable is used twice: 2W."],
      [6.5, 9.8, "Skip towns already visited. Detours become direct legs."],
      [10.0, 11.6, "A round trip, no longer than the walk."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 09-tour",
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
