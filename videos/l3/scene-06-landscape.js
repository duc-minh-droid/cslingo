/* Lecture 3 video, scene-06-landscape.js (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER", title: ["scene-06-landscape.js"],
    dur: 10,
    build(stage) {
      stage.append(V.h("div", { class: "v-text big", text: "scene-06-landscape.js", style: { left: "40px", top: "40px" } }));
      return () => {};
    },
  });
})();
