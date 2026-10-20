/* Lecture 4 video, scene 9: own-writes. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 9). */
VID.scene({
  kicker: "READ YOUR WRITES",
  title: ["Your own post", "must not vanish"],
  dur: 12.5,
  caps: [
    [1.3, 3.6, "You post a comment: it goes to the leader."],
    [3.9, 6.6, "Reload: a follower that lags still shows 3."],
    [6.7, 8.6, "Your comment seems to have vanished."],
    [8.8, 12.2, "Fix: read your own recent posts from the leader."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 9: own-writes (placeholder)",
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
