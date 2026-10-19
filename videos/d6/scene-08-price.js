/* Lecture 6 · scene 08 (price): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 8). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "THE PRICE OF AGREEMENT",
    title: ["One copy of the truth", "costs waiting"],
    dur: 12.5,
    caps: [
      [0.5, 2.2, "Two sites sell seat 14C."],
      [2.6, 4.4, "Each books its own customer."],
      [4.8, 6.4, "Neither knew: sold twice."],
      [6.9, 8.9, "So Leeds must ask London first."],
      [9.6, 11.4, "Asking costs 62 ms, not 2 ms."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "The Price Of Agreement" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
