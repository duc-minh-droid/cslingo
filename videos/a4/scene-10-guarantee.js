/* Phase 4 · scene 10-guarantee: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE GUARANTEE",
    title: ["The tour is never worse", "than twice the best"],
    dur: 10,
    caps: [
      [0.4, 3.8, "Cut one cable from the best tour: a spanning tree is left."],
      [4.0, 6.8, "So the best tour costs at least W. Ours costs at most 2W."],
      [7.0, 9.6, "Our tour is never worse than twice the best."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 10-guarantee",
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
