/* Lecture 3 (ds-3) · scene-05-hash.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 5). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "HASH INDEX",
    title: ["A map in memory", "jumps straight to a key"],
    dur: 12,
    caps: [
      [0.5, 3.4, "Keep a map in memory: key to byte offset."],
      [4.6, 6.6, "Get mew: look up its offset."],
      [6.8, 8.6, "One jump, one disk read."],
      [9.0, 11.6, "A new write moves the pointer."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 5: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
