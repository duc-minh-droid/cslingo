/* Phase 4 · scene 08-cost: PLACEHOLDER (the scene author replaces build()). */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE COST",
    title: ["Which is faster?", "It depends on the network"],
    dur: 11,
    caps: [
      [0.4, 3.6, "Prim's work counts towns. Kruskal's work counts cables."],
      [4.0, 6.4, "Few cables: Kruskal does far less."],
      [7.4, 10.5, "Nearly every pair linked: Prim wins. Same tree either way."],
    ],
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-blue",
          text: "scene 08-cost",
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
