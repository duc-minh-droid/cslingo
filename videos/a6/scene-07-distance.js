/* Phase 6 · scene 07-distance (14 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[5].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "FIXING A BIT",
    title: ["Valid words must", "stay far apart"],
    dur: 14,
    caps: [
      [2.1, 3.7, "One flip is one step."],
      [3.95, 5.65, "Only 000 and 111 are valid words."],
      [6.1, 7.7, "They are three steps apart."],
      [9.2, 10.8, "Nearest valid word is 000: fixed."],
      [11.8, 13.5, "Two flips lead to the wrong word."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 07 · distance", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
