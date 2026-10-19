/* Lecture 2 · scene 6 (GRAPH MODEL) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 6). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "GRAPH MODEL",
    title: ["When the links", "are the data"],
    dur: 13.0,
    caps: [
      [0.5, 2.7, "A graph stores things and their links."],
      [3.9, 5.4, "Each link has a label."],
      [5.7, 8.2, "A vertex lists its own links in and out."],
      [8.8, 12.6, "To find a route, walk the edges: three hops."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 6: graph model", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
