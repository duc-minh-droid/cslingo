/* Phase 8 · scene 05 rsa-keys: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 5). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "RSA KEY PAIR",
    title: ["Publish a lock,", "keep the key"],
    dur: 12,
    caps: [
      [0.5, 2.1, "Pick two secret primes: 5 and 11."],
      [2.2, 3.8, "Multiply them: n = 55 will be public."],
      [3.9, 5.6, "Next z = (5 \u2212 1) \u00d7 (11 \u2212 1) = 40, kept secret."],
      [5.7, 7.5, "Pick e = 3: it shares no factor with 40."],
      [7.6, 9.4, "d = 27, because 3 \u00d7 27 = 81 = 2 \u00d7 40 + 1."],
      [9.6, 11.6, "Publish (55, 3). Keep 27 secret."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: rsa-keys", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
