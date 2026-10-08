/* Algorithms phase 2, scene 10-recap: PLACEHOLDER. Replace with the real recap (spec: videos/_plan/algo-2.json, "recap"). */
VID.scene({
  bare: true,
  dur: 9,
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-purple",
      text: "Recap (placeholder)",
      style: {
        left: "240px",
        top: "420px",
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
