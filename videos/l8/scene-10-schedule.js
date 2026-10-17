/* Lecture 8 video, scene 10: schedule. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 10). */
VID.scene({
  kicker: "CONSTRUCTION GRAPHS",
  title: ["Any problem drawn", "as a path"],
  dur: 13.5,
  caps: [
    [0.5, 2.9, "Any problem drawn as a path suits ants."],
    [3.1, 5.6, "The ant leaves Start and picks a job."],
    [5.9, 8.9, "It picks one job at a time, never twice."],
    [9.3, 11.1, "Lateness: finish time minus due time."],
    [11.4, 13.3, "Average 54 minutes late, worst 70."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 10: schedule (placeholder)",
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
