/* Lecture 8 video, scene 7: update. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 7). */
VID.scene({
  kicker: "THE UPDATE",
  title: ["Evaporate,", "then deposit"],
  dur: 12.5,
  caps: [
    [0.5, 2.7, "This road carries a trail of 4."],
    [3.0, 5.0, "Evaporation: half of it fades."],
    [5.4, 8.8, "Each ant adds Q over its tour length."],
    [9.1, 10.6, "Shorter tours leave more."],
    [10.7, 12.3, "New trail: 2 + 7 = 9."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 7: update (placeholder)",
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
