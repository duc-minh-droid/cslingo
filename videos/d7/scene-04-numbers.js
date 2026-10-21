/* Lecture 7 video: scene 04-numbers (placeholder, replaced by the real scene) */
VID.scene({
  kicker: "PROPOSAL NUMBERS",
  title: ["Every proposal has a", "bigger number"],
  dur: 10,
  caps: [[0.5, 2.5, "placeholder"]],
  build(stage, V) {
    const t0 = V.h("div", {
      class: "v-card c-blue",
      text: "04-numbers",
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
