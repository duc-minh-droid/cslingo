/* Lecture 7 video: scene 08-duel (placeholder, replaced by the real scene) */
VID.scene({
  kicker: "TWO PROPOSERS",
  title: ["The bigger number", "wins the duel"],
  dur: 13,
  caps: [[0.5, 2.5, "placeholder"]],
  build(stage, V) {
    const t0 = V.h("div", {
      class: "v-card c-blue",
      text: "08-duel",
      style: {
        left: "300px",
        top: "200px",
        width: "336px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    });
    stage.append(t0);
    return () => {};
  },
});
