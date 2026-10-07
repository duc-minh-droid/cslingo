/* Lecture 3 video, scene-02-loop.js (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER", title: ["scene-02-loop.js"],
    dur: 13,
    build(stage) {
      stage.append(V.h("div", { class: "v-text big", text: "scene-02-loop.js", style: { left: "40px", top: "40px" } }));
      return () => {};
    },
  });
})();
