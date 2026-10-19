/* Lecture 1 (ds-1), scene 06: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[4].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "RELIABILITY",
    title: ["One fault can bring", "everything down"],
    dur: 12,
    caps: [
      [0.5, 2.7, "Six servers share the load, 70 each."],
      [2.8, 5.0, "One dies; five carry on at 84 each."],
      [5.1, 7.0, "One more dies: 105 each, over 100."],
      [7.1, 8.9, "Overload makes them fall one by one."],
      [9.2, 11.0, "One bug hits all six together."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 6 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();
