/* Lecture 4 video, scene 10: backwards. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 10). */
VID.scene({
  kicker: "MONOTONIC READS",
  title: ["Time must not", "run backwards"],
  dur: 11.5,
  caps: [
    [1.3, 3.0, "Refresh: replica A says 7."],
    [3.1, 5.5, "Next refresh: B says 6. Time ran backwards."],
    [5.6, 8.2, "Fix: keep each user on one replica."],
    [9.5, 11.3, "Their view only ever moves forward."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 10: backwards (placeholder)",
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
