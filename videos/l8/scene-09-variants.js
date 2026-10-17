/* Lecture 8 video, scene 9: variants. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 9). */
VID.scene({
  kicker: "VARIANTS",
  title: ["Who gets to", "add trail?"],
  dur: 12.5,
  caps: [
    [0.5, 3.0, "Six ants finish. Which of them add trail?"],
    [3.4, 6.6, "Ant System: all. Elitist rank: best 3. Max-Min: best 1."],
    [7.0, 9.5, "Fewer depositors pile trail on the best round."],
    [9.9, 12.3, "But more runs get stuck on a poor round."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 9: variants (placeholder)",
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
