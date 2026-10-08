/* Algorithms phase 2, scene 09: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 9). */
VID.scene({
  kicker: "BAD NEWS",
  title: ["When a road breaks,", "the gossip can loop"],
  dur: 14,
  caps: [
    [0.4, 3.0, "A reaches C through B. B reaches C directly."],
    [3.0, 6.6, "The B to C road breaks. B hears A's old news."],
    [6.8, 9.6, "The cost creeps up, one step at a time."],
    [10.0, 13.4, "Poisoned reverse: A tells B that C is unreachable via you."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 9 (placeholder)",
      style: {
        left: "168px",
        top: "240px",
        width: "600px",
        height: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
      },
    });
    stage.append(card);
    return () => {};
  },
});
