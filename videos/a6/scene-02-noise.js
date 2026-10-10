/* Phase 6 · scene 02-noise (10.5 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[0].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "THE PROBLEM",
    title: ["Noise flips bits,", "and nobody tells you"],
    dur: 10.5,
    caps: [
      [0.5, 2.7, "A message travels as bits."],
      [3.5, 5.5, "Noise on the wire flips a bit."],
      [6, 8, "The receiver cannot tell."],
      [8.7, 10.3, "Fix: add a check bit."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 02 · noise", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
