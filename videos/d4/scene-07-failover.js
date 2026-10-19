/* Lecture 4 video, scene 7: failover. PLACEHOLDER: the scene author replaces build() following videos/_plan/ds-4.json (scene 7). */
VID.scene({
  kicker: "FAILOVER",
  title: ["The leader crashes:", "promote the freshest copy"],
  dur: 13,
  caps: [
    [0.5, 3.4, "The leader wrote 20 changes; followers lag behind."],
    [3.6, 6.4, "The leader crashes. Which follower takes over?"],
    [6.5, 8.6, "Best: the follower with the most changes."],
    [8.7, 10.0, "B takes over."],
    [10.1, 12.8, "The 2 changes no follower had are lost."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 7: failover (placeholder)",
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
