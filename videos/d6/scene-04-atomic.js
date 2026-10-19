/* Lecture 6 · scene 04 (atomic): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 4). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "ACID \u00b7 ATOMIC",
    title: ["A transaction is", "all or nothing"],
    dur: 12.5,
    caps: [
      [0.5, 2.3, "Moving £30 is two writes."],
      [3.0, 4.6, "A crash hits after the debit."],
      [5.0, 6.7, "£30 has vanished."],
      [7.2, 9.2, "One transaction undoes the debit."],
      [9.6, 12.1, "All or nothing: the total stays £150."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Acid \u00b7 Atomic" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
