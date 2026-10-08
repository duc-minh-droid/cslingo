/* Phase 4 · scene 05-prim: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PRIM'S ALGORITHM",
    title: ["Prim grows one tree,", "cheapest cable first"],
    dur: 13,
    caps: [
      [0.4, 2.6, "Start at any town. Look at every cable leaving the tree."],
      [2.8, 6.0, "Take the cheapest one. A new town joins."],
      [6.2, 9.6, "Repeat. A cable inside the tree is ignored."],
      [9.8, 12.5, "Every town is in. The cheapest tree costs 11."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 05-prim",
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
