/* Lecture 7 video: scene 07-accept (placeholder, replaced by the real scene) */
VID.scene({
  kicker: "PHASE 2",
  title: ["Accept, then the", "learners learn"],
  dur: 13,
  caps: [[0.5, 2.5, "placeholder"]],
  build(stage, V) {
    const t0 = V.h("div", {
      class: "v-card c-blue",
      text: "07-accept",
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
