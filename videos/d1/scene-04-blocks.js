/* Lecture 1 (ds-1), scene 04: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[2].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "BUILDING BLOCKS",
    title: ["Four building blocks", "behind every data app"],
    dur: 13,
    caps: [
      [1.5, 3.9, "A database keeps data safe for tomorrow."],
      [4.4, 7.2, "A cache keeps answers close: 2 ms, not 100."],
      [7.8, 10.2, "An index: 20 checks, not a million."],
      [10.5, 12.8, "A batch job crunches it overnight."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 4 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();
