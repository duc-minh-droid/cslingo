/* Lecture 4 video, scene 6: join. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 6). */
VID.scene({
  kicker: "NEW FOLLOWER",
  title: ["A new follower joins", "with a snapshot"],
  dur: 12,
  caps: [
    [0.4, 2.7, "A new follower needs a copy of the data."],
    [3.0, 4.9, "Take a snapshot of the leader."],
    [5.0, 7.0, "Writes keep coming while it copies."],
    [7.2, 9.4, "It asks for every change since."],
    [9.6, 11.7, "Caught up: no pause in writes."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 6: join (placeholder)",
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
