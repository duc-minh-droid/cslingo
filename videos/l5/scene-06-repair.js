/* Lecture 5 · Encodings, scene 06-repair (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 06-repair"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "06-repair", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
