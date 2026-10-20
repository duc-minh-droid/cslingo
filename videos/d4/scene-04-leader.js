/* Lecture 4 video, scene 4: leader. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 4). */
VID.scene({
  kicker: "LEADER AND FOLLOWERS",
  title: ["Writes go to the leader,", "the log carries them on"],
  dur: 13,
  caps: [
    [1.2, 4.4, "Every write goes to the leader."],
    [4.8, 8.4, "It sends each change on, in order, as a log."],
    [9.0, 12.6, "Reads can go to any node, writes only to the leader."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 4: leader (placeholder)",
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
