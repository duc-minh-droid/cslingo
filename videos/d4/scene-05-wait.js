/* Lecture 4 video, scene 5: wait. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 5). */
VID.scene({
  kicker: "SYNC OR ASYNC",
  title: ["Wait for the followers,", "or answer at once?"],
  dur: 12.5,
  caps: [
    [0.5, 2.7, "The leader stores the write in 5 ms."],
    [3.0, 5.6, "Followers confirm after 30 and 90 ms."],
    [5.9, 8.6, "Answer at once, or wait for the followers."],
    [8.9, 12.2, "If the leader then crashes, only waiting keeps the write."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 5: wait (placeholder)",
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
