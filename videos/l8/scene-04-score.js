/* Lecture 8 video, scene 4: score. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 4). */
VID.scene({
  kicker: "THE CHOICE",
  title: ["Score every road:", "trail times closeness"],
  dur: 12.5,
  caps: [
    [0.8, 2.6, "Each road gets a score."],
    [3.0, 5.2, "Closeness is 1 over the distance."],
    [5.5, 7.5, "Score: trail times closeness."],
    [7.8, 9.4, "A visited town scores zero."],
    [9.7, 12.3, "Each score's share of the total is its chance."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 4: score (placeholder)",
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
