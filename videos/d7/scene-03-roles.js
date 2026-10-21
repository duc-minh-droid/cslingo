/* Lecture 7 video: scene 03-roles (placeholder, replaced by the real scene) */
VID.scene({
  kicker: "THREE ROLES",
  title: ["Proposers suggest,", "acceptors decide"],
  dur: 11,
  caps: [[0.5, 2.5, "placeholder"]],
  build(stage, V) {
    const t0 = V.h("div", {
      class: "v-card c-blue",
      text: "03-roles",
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
