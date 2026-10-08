/* Algorithms phase 2, scene 08: PLACEHOLDER. Replace the build() with the real scene; the spec is in videos/_plan/algo-2.json (scene n = 8). */
VID.scene({
  kicker: "NO MAP",
  title: ["Routing without a map:", "ask your neighbours"],
  dur: 12,
  caps: [
    [0.4, 3.8, "A has no map. It only hears its neighbours."],
    [4.0, 7.0, "Each says how far F is. A adds its own road cost."],
    [7.4, 11.4, "It keeps the smallest total, and the next hop: D."],
  ],
  build(stage) {
    const card = VID.h("div", {
      class: "v-card plain c-blue",
      text: "Scene 8 (placeholder)",
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
