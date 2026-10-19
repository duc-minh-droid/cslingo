/* Lecture 4 video, scene 3: copies. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 3). */
VID.scene({
  kicker: "REPLICATION",
  title: ["Replication keeps a", "full copy on every node"],
  dur: 10.5,
  caps: [
    [0.5, 3.8, "Replication: every node keeps a full copy."],
    [4.2, 6.4, "Partitioning: each node keeps a piece."],
    [7.0, 10.2, "When a node fails, the copies carry on."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 3: copies (placeholder)",
      style: {
        left: "108px",
        top: "200px",
        width: "720px",
        height: "160px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        textAlign: "center",
      },
    });
    stage.append(card);
    return (t) => V.place(card, { y: (1 - V.ramp(t, 0.2, 0.7)) * 20, o: V.ramp(t, 0.2, 0.7) });
  },
});
