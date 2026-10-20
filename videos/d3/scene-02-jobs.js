/* Lecture 3 (ds-3) · scene-02-jobs.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 2). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "TWO JOBS",
    title: ["A database stores data", "and finds it again"],
    dur: 10,
    caps: [
      [0.5, 3.2, "Some work is many small writes."],
      [4.9, 7.4, "Other work is one big read."],
      [8.0, 9.8, "Design follows the workload."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 2: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
