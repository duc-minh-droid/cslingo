/* Lecture 6 · Genetic programming, scene 02-behaviour (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 02-behaviour"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "02-behaviour", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
