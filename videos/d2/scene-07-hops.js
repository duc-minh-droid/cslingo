/* Lecture 2 · scene 7 (FOLLOWING LINKS) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 7). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "FOLLOWING LINKS",
    title: ["Friends of friends:", "joins or edges?"],
    dur: 12.5,
    caps: [
      [0.5, 2.4, "Five people, linked in a chain."],
      [3.0, 6.2, "Tables add a join per hop; the graph just walks."],
      [7.0, 9.0, "Want a fourth hop?"],
      [9.3, 12.2, "Queries grow, the graph walk does not."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 7: following links", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
