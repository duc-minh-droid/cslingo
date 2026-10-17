/* Lecture 8 video, scene 5: dice. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 5). */
VID.scene({
  kicker: "THE CHOICE",
  title: ["Then roll the dice,", "weighted by those shares"],
  dur: 9,
  caps: [
    [1.2, 3.1, "The ant draws a random number."],
    [3.4, 5.2, "The slice it lands in wins."],
    [5.9, 8.6, "Unlikely roads can still win."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 5: dice (placeholder)",
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
