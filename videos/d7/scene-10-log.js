/* Lecture 7 video: scene 10-log (placeholder, replaced by the real scene) */
VID.scene({
  kicker: "A LOG OF ROUNDS",
  title: ["One round per", "log entry"],
  dur: 12,
  caps: [[0.5, 2.5, "placeholder"]],
  build(stage, V) {
    const t0 = V.h("div", {
      class: "v-card c-blue",
      text: "10-log",
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
