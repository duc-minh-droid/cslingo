/* Lecture 2 · scene 8 (NoSQL) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 8). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "NoSQL",
    title: ["Four kinds of NoSQL,", "one recipe"],
    dur: 14.5,
    caps: [
      [0.5, 3.4, "NoSQL: simple, scales out, stays available."],
      [4.0, 6.2, "Document: the whole recipe in one place."],
      [6.5, 8.6, "Key-value: every item found by its key."],
      [8.8, 11.0, "Wide-column: columns vary per row."],
      [11.2, 14.1, "Graph: recipes linked to what they use."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 8: nosql", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
