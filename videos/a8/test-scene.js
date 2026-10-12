(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, clamp } = V;
  const panels = [];
  V.scene({
    kicker: "TEST",
    title: ["Helper check", "panel by time"],
    dur: 4,
    caps: [[0.2, 3.8, "Caption sits here."]],
    build(stage) {
      const mk = (fn) => {
        const p = V.h("div", { style: { position: "absolute", inset: "0" } });
        stage.append(p);
        panels.push(p);
        fn(p);
      };
      // scene 10 mid-hunt (block 3, try 12 of 30)
      mk((p) => {
        const v = A8.SEAL.view(3);
        const blocks = [0, 1, 2].map((i) => A8.block(p, { x: i * 333, y: 10, w: 270, fields: ["data", "prev", "nonce", "hash"] }));
        const hunt = A8.SEAL.hunt(3).rows;
        const n = 12;
        blocks.forEach((b, i) => {
          const mining = i === 2;
          const hash = mining ? hunt[n] : v[i].hash;
          const nonce = mining ? n : v[i].nonce;
          const ok = hash[0] === "0";
          b.set({ title: `Block ${i + 1}`, data: v[i].data, prev: v[i].prev, nonce, hash, dataTone: v[i].edited ? "orange" : "grey", prevTone: mining ? "blue" : v[i].linkOk ? "blue" : "red", hashTone: "blue", nonceTone: mining ? "orange" : "grey", hashMarks: (j) => (j === 0 ? (ok ? "green" : "red") : null), mark: mining ? null : "ok", tone: "grey" });
        });
        [0, 1, 2].forEach((i) => {
          A8.tag(p, { x: 20, y: 354 + i * 60, text: `block ${i + 1}`, anchor: "l" }).set({});
          A8.bar(p, { x: 160, y: 330 + i * 60, w: 360, tone: "orange" }).set({ k: [15, 5, n + 1][i] / 30, text: `${[15, 5, n + 1][i]} tries`, textOut: i === 1 });
        });
        A8.tag(p, { x: 740, y: 420, text: "50 tries", tone: "orange", solid: true, fs: 44 }).set({ k: 0.5 });
      });
      // scene 4 first half corrected coordinates + scene 6 html sums
      mk((p) => {
        A8.person(p, { who: "alice", x: 52, y: 48 }).set({});
        A8.person(p, { who: "bob", x: 884, y: 48, name: "left" }).set({});
        A8.tag(p, { x: 390, y: 66, text: "p = 23", tone: "blue", fs: 36 }).set({});
        A8.tag(p, { x: 545, y: 66, text: "g = 5", tone: "blue", fs: 36 }).set({});
        A8.wire(p, { x: 150, y: 190, w: 636, h: 120 }).set({});
        A8.tag(p, { x: 110, y: 190, text: "B = 19", tone: "blue", fs: 40, solid: true }).set({});
        A8.tag(p, { x: 826, y: 190, text: "A = 8", tone: "blue", fs: 40, solid: true }).set({});
        A8.tag(p, { x: 468, y: 320, html: A8.pow("7", "3", 40) + " = 343<br>= 6 × 55 + 13", tone: "blue", fs: 40, box: true }).set({});
        A8.tag(p, { x: 468, y: 440, html: A8.pow("13", "27", 40) + " mod 55 = 7", tone: "green", fs: 40, box: true }).set({});
        A8.person(p, { who: "eve", x: 52, y: 520 }).set({});
        A8.tag(p, { x: 255, y: 520, text: "(55, 3)", tone: "red", solid: true, fs: 32 }).set({});
        A8.tag(p, { x: 385, y: 520, text: "13", tone: "red", solid: true, fs: 32 }).set({});
        [2, 3, 4, 5].forEach((f, i) => A8.tag(p, { x: 500 + i * 104, y: 520, text: `÷ ${f}`, box: true, w: 92, h: 70, tone: f === 5 ? "green" : "red", fs: 36 }).set({}));
        A8.tag(p, { x: 300, y: 595, text: "55 = 5 × 11, so d = 27", tone: "red", fs: 32 }).set({});
        A8.tag(p, { x: 730, y: 595, text: "a real n: 617 digits", tone: "blue", solid: true, fs: 32 }).set({});
      });
      return (t) => {
        const pi = Math.min(panels.length - 1, Math.floor(t / 2));
        panels.forEach((p, i) => (p.style.display = i === pi ? "block" : "none"));
      };
    },
  });
})();
