/* Lecture 4 video, scene 8: split. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 8). */
VID.scene({
  kicker: "SPLIT BRAIN",
  title: ["A cut-off leader", "that still thinks it leads"],
  dur: 11,
  caps: [
    [0.5, 2.0, "A is the leader."],
    [2.2, 4.3, "A is cut off; the others think it died."],
    [4.4, 6.3, "They promote B, but A still leads."],
    [6.5, 8.7, "Both take a write for seat 12."],
    [8.9, 10.9, "Split brain: two histories disagree."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 8: split (placeholder)",
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
