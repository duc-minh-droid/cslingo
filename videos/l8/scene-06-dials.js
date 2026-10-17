/* Lecture 8 video, scene 6: dials. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 6). */
VID.scene({
  kicker: "TWO DIALS",
  title: ["Two dials set what", "the ants trust"],
  dur: 12,
  caps: [
    [0.5, 2.7, "Two dials set what the ants trust."],
    [3.0, 5.4, "Alpha trusts the trail, beta trusts closeness."],
    [6.0, 8.5, "Alpha 0: trails ignored, the nearest wins."],
    [9.2, 11.8, "Beta 0: only trails count, the strongest wins."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 6: dials (placeholder)",
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
