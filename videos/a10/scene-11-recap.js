/* Phase 10 · Transformers & Attention (algo-10), scene 11-recap: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 11 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 11: recap",
        style: { left: "330px", top: "500px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
