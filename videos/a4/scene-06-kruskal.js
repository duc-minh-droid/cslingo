/* Phase 4 · scene 06-kruskal: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "KRUSKAL'S ALGORITHM",
    title: ["Cheapest cable first,", "never close a loop"],
    dur: 14,
    caps: [
      [0.4, 1.7, "Sort every cable by cost."],
      [1.9, 4.8, "Take the cheapest cable. It joins two groups."],
      [5.0, 7.1, "Groups merge into one tree."],
      [7.3, 9.7, "AB is next, but A and B are already joined. Skip it."],
      [9.9, 11.6, "BD joins the last two groups."],
      [11.8, 13.7, "Four cables are enough, so the last two are never read."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 06-kruskal",
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
