/* Phase 4 · scene 04-cut: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE CUT PROPERTY",
    title: ["The cheapest bridge", "across a cut is safe"],
    dur: 14,
    caps: [
      [0.4, 3.0, "Split the towns into two groups: a cut."],
      [3.2, 5.4, "A tree must cross it. AC is the cheapest."],
      [5.6, 8.0, "Suppose a tree uses the dearer cable AB."],
      [8.2, 10.6, "Add AC: a loop. Drop AB and the tree is cheaper."],
      [10.8, 13.5, "The cheapest cable across a cut is always safe."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 04-cut",
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
