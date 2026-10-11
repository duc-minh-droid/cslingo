/* Phase 8 · scene 06 rsa-lock: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 6). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "RSA",
    title: ["Anyone can lock it,", "only Bob can unlock"],
    dur: 12.2,
    caps: [
      [1.0, 3.0, "Bob shares his public key, (55, 3)."],
      [3.4, 5.6, "Alice locks 7 with it and gets 13."],
      [5.8, 8.0, "Bob unlocks 13 with his private key: back to 7."],
      [8.3, 10.2, "Eve factors the tiny n in four tries: 5 \u00d7 11."],
      [10.4, 12.0, "A real n has 617 digits."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: rsa-lock", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
