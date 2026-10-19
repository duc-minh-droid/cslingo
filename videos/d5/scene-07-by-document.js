/* Lecture 5 · Partitioning, scene-07-by-document (11.5 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 7). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "SECONDARY INDEXES",
    title: ["Search by colour:", "ask every partition"],
    dur: 11.5,
    caps: [
      [0.4, 3.0, "Each partition indexes only its own cars."],
      [3.4, 5.6, "Search for red cars."],
      [6.0, 8.6, "Any partition may hold one, so ask all three."],
      [8.8, 11.1, "Gather the answers into one list."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 7 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
