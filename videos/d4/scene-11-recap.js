/* Lecture 4 video, scene 11: recap. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (recap). */
VID.scene({
  bare: true,
  dur: 9,
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-green",
      text: "Recap (placeholder)",
      style: {
        left: "108px",
        top: "400px",
        width: "864px",
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
      },
    });
    stage.append(card);
    return (t) => V.place(card, { y: (1 - V.ramp(t, 0.2, 0.7)) * 20, o: V.ramp(t, 0.2, 0.7) });
  },
});
