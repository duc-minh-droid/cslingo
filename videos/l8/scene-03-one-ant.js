/* Lecture 8 video, scene 3: one-ant. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 3). */
VID.scene({
  kicker: "ONE ANT",
  title: ["One ant builds", "a whole tour"],
  dur: 12,
  caps: [
    [1.4, 3.7, "Towns it has visited go on the tabu list."],
    [3.9, 6.0, "It picks any town that is still allowed."],
    [6.2, 8.4, "A visited town is never picked again."],
    [8.9, 11.4, "All towns visited: back home. Tour length 74 km."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 3: one-ant (placeholder)",
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
