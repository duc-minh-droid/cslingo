/* Lecture 4 video, scene 2: scale. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 2). */
VID.scene({
  kicker: "WHY DISTRIBUTE",
  title: ["One machine hits a ceiling,", "and can die"],
  dur: 12,
  caps: [
    [0.5, 3.6, "600 requests a second: one big machine, or three small ones."],
    [3.9, 6.3, "The big machine crashes: nothing is served."],
    [6.8, 9.6, "A small one crashes: 400 are still served."],
    [9.9, 11.7, "Scaling out survives failures."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 2: scale (placeholder)",
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
