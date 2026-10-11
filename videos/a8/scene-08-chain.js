/* Phase 8 · scene 08 chain: PLACEHOLDER written by the architect. The scene author replaces this file with the real scene
   (spec: videos/_plan/algo-8.json, scene 8). It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    kicker: "HASH CHAIN",
    title: ["Edit one block and", "every link after breaks"],
    dur: 12.5,
    caps: [
      [0.5, 3.0, "Each block stores the hash of the block before it."],
      [3.3, 5.4, "Edit one block and its hash changes."],
      [5.5, 7.7, "The next block holds the old hash: the link breaks."],
      [8.2, 10.8, "Recompute every later hash and it looks valid again."],
      [11.0, 12.4, "Hashes spot edits. They do not stop them."],
    ],
    build(stage) {
      const t = A8.tag(stage, { x: 468, y: 300, text: "placeholder: chain", tone: "grey", fs: 36 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();
