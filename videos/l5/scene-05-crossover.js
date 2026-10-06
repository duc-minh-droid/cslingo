/* Lecture 5 · Encodings, scene 05-crossover (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 05-crossover"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "05-crossover", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
