/* Lecture 2 · scene 10 (recap) PLACEHOLDER: a bare scene so the page loads and the length is right. The scene author replaces this file
   following videos/_plan/ds-2.json ("recap": three rows of small animated SVG pictograms, Pebble, a call-to-action sticker). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    bare: true,
    dur: 9.0,
    build(stage) {
      const c = D2.card(stage, { x: 330, y: 480, w: 420, h: 120, text: "recap placeholder", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
