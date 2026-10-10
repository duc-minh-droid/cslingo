/* Phase 6 · scene 06-resend (11.5 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[4].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "TWO WAYS TO COPE",
    title: ["Ask again,", "or fix it yourself"],
    dur: 11.5,
    caps: [
      [0.4, 2.3, "A download checks every frame."],
      [2.9, 5, "Check fails, so ask for a resend."],
      [6.4, 8.3, "A probe far away cannot wait."],
      [9.5, 11.2, "So it must repair errors itself."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 06 · resend", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
