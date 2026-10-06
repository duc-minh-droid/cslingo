/* Lecture 5 · Encodings, scene 02-genes (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 02-genes"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "02-genes", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
