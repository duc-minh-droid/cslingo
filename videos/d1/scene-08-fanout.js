/* Lecture 1 (ds-1), scene 08: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[6].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "CASE STUDY: TIMELINES",
    title: ["Do the work", "on write or on read?"],
    dur: 16,
    caps: [
      [0.5, 2.6, "Approach 1: one write per post."],
      [2.8, 5.0, "Reading means 3 lookups and a merge."],
      [5.3, 7.2, "Approach 2: copy to each follower."],
      [7.3, 9.2, "Reading is one lookup."],
      [9.5, 11.6, "Reads outnumber posts 65 to 1."],
      [11.7, 13.5, "Copy on write: 345,000 a second."],
      [13.7, 15.8, "A celebrity needs 87 seconds: go hybrid."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 8 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();
