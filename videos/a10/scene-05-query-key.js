/* Phase 10 · Transformers & Attention (algo-10), scene 05-query-key: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 5 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "QUERY AND KEY",
    title: ["A query is matched", "against every key"],
    dur: 13.5,
    caps: [
      [1, 3.4, "Each word makes a query, a key and a value."],
      [3.5, 5.3, "Hold the query of “barked” against each key."],
      [5.4, 7.2, "Multiply the pairs, then add them up."],
      [7.6, 9.4, "“dog” matches best: a score of 3."],
      [9.5, 11.2, "Divide by 1.41 to keep scores small."],
      [11.3, 13.1, "Softmax turns them into shares."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 5: query-key",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
