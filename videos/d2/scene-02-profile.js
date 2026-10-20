/* Lecture 2 · scene 2 (RELATIONAL OR DOCUMENT) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 2). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "RELATIONAL OR DOCUMENT",
    title: ["One profile page,", "two ways to store it"],
    dur: 13.0,
    caps: [
      [0.5, 2.6, "One profile page needs six tables."],
      [2.8, 6.0, "The page asks each table in turn."],
      [6.3, 8.2, "Six places to read, glued by a key."],
      [8.4, 10.4, "A document keeps it all together."],
      [10.6, 12.7, "One read gets the whole page."],
    ],
    build(stage) {
      const c = D2.card(stage, {
        x: 258,
        y: 240,
        w: 420,
        h: 120,
        text: "scene 2: relational or document",
        tone: "grey",
      });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
