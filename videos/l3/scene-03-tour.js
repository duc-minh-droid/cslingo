/* Lecture 3 video, scene-03-tour.js (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER", title: ["scene-03-tour.js"],
    dur: 11,
    build(stage) {
      stage.append(V.h("div", { class: "v-text big", text: "scene-03-tour.js", style: { left: "40px", top: "40px" } }));
      return () => {};
    },
  });
})();
