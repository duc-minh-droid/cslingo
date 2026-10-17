/* Lecture 8 video, scene 8: snowball. PLACEHOLDER: the scene author replaces build() following videos/_plan/lecture-8.json (scene 8). */
VID.scene({
  kicker: "POSITIVE FEEDBACK",
  title: ["Good trails", "snowball"],
  dur: 12.5,
  caps: [
    [0.5, 2.9, "At first the trails are thin and equal."],
    [3.4, 6.2, "Short rounds leave more trail, so more ants follow."],
    [6.5, 9.1, "More ants, more trail: it snowballs."],
    [9.6, 12.2, "The colony settles on one short round."],
  ],
  build(stage, V) {
    const card = V.h("div", {
      class: "v-card c-blue",
      text: "Scene 8: snowball (placeholder)",
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
