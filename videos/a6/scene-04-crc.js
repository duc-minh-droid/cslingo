/* Phase 6 · scene 04-crc (12.5 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[2].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "THE CRC",
    title: ["Check bits come from", "a long division"],
    dur: 12.5,
    caps: [
      [1.2, 3, "Pick a pattern both sides know."],
      [3.3, 5.3, "Add zeros to the message, then divide."],
      [5.6, 7.6, "Line the pattern up under the next 1."],
      [8, 9.7, "What is left over is the remainder."],
      [9.9, 11.9, "Send the message plus the remainder."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 04 · crc", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
