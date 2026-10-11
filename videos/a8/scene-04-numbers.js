/* Phase 8 · scene 04 numbers: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 4). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "DIFFIE-HELLMAN KEY EXCHANGE",
    title: ["The same trick", "with numbers"],
    dur: 15,
    caps: [
      [0.6, 3.4, "Public: p = 23 and g = 5. Secret: a = 6 and b = 15."],
      [3.8, 6.0, "mod 23 keeps only the remainder after dividing by 23."],
      [6.2, 7.8, "They swap A = 8 and B = 19 in public."],
      [8.0, 10.2, "Both get 2. The secret numbers were never sent."],
      [10.9, 13.0, "Eve must try every power of 5 until she hits 8."],
      [13.2, 14.8, "A 617-digit prime makes that search hopeless."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: numbers", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
