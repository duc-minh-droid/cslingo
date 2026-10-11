(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  const panels = [];
  const mk = (fn) => {
    const p = V.h("div", { style: { position: "absolute", inset: "0" } });
    panels.push(p);
    return fn(p) || null;
  };
  V.scene({
    kicker: "TEST",
    title: ["Helper check", "panel by time"],
    dur: 10,
    caps: [[0.2, 9.8, "Caption sits here and must stay short."]],
    build(stage) {
      const fpanel = (fn) => stage.append(mk(fn) && panels[panels.length - 1]);
      // ---- scene 2 key frame
      mk((p) => {
        stage.append(p);
        A8.person(p, { who: "alice", x: 52, y: 48 }).set({});
        A8.person(p, { who: "bob", x: 884, y: 48, name: "left" }).set({});
        A8.wire(p, { x: 40, y: 215, w: 856, h: 150 }).set({});
        A8.tag(p, { x: 468, y: 112, text: "the open wire" }).set({});
        const row = L5.chromosome(p, { x: 494, y: 162, genes: "XJHWJY", size: 56, gap: 8, tone: "blue" });
        row.all(() => ({}));
        A8.tag(p, { x: 150, y: 370, text: "key 5", tone: "purple", fs: 36 }).set({});
        A8.icon(p, "key", { x: 72, y: 370, tone: "purple", size: 64 }).set({});
        A8.tag(p, { x: 766, y: 370, text: "key ?", ghost: true, fs: 36 }).set({});
        A8.icon(p, "qmark", { x: 860, y: 370, tone: "orange", size: 56 }).set({});
        A8.tag(p, { x: 600, y: 258, text: "key 5", tone: "purple", fs: 36 }).set({});
        A8.tag(p, { x: 468, y: 420, text: "key 5", tone: "red", solid: true, fs: 36 }).set({});
        A8.link(p, { pts: [[600, 295], [600, 340], [468, 340], [468, 390]], tone: "red" }).set({});
        A8.icon(p, "eye", { x: 468, y: 495, tone: "red" }).set({});
        A8.person(p, { who: "eve", x: 468, y: 578 }).set({});
        A8.icon(p, "qmark", { x: 700, y: 420, tone: "red", size: 50 }).set({});
      });
      // ---- scene 3 key frame
      mk((p) => {
        stage.append(p);
        A8.person(p, { who: "alice", x: 52, y: 48 }).set({});
        A8.person(p, { who: "bob", x: 884, y: 48, name: "left" }).set({});
        A8.tag(p, { x: 468, y: 66, text: "the open wire" }).set({});
        A8.wire(p, { x: 150, y: 190, w: 636, h: 176 }).set({});
        A8.pot(p, { x: 110, y: 190, r: 40 }).set({ drops: ["P", "B", "A"] });
        A8.pot(p, { x: 826, y: 190, r: 40 }).set({ drops: ["P", "A", "B"] });
        A8.icon(p, "equals", { x: 468, y: 190, tone: "green", disc: true, size: 64 }).set({});
        A8.pot(p, { x: 110, y: 380, r: 40 }).set({ drops: ["A"], frame: "purple" });
        A8.pot(p, { x: 826, y: 380, r: 40 }).set({ drops: ["B"], frame: "purple" });
        A8.tag(p, { x: 110, y: 455, text: "secret", tone: "purple" }).set({});
        A8.tag(p, { x: 826, y: 455, text: "secret", tone: "purple" }).set({});
        A8.pot(p, { x: 400, y: 410, r: 32 }).set({ drops: ["P", "A"] });
        A8.pot(p, { x: 536, y: 410, r: 32 }).set({ drops: ["P", "B"] });
        A8.icon(p, "qmark", { x: 468, y: 410, tone: "red", size: 50 }).set({});
        A8.icon(p, "eye", { x: 468, y: 490, tone: "red" }).set({});
        A8.person(p, { who: "eve", x: 468, y: 578 }).set({});
        A8.tag(p, { x: 110, y: 275, text: "public", tone: "blue" }).set({});
        A8.drop(p, { x: 260, y: 330, paint: "A" }).set({});
      });
      // ---- scene 4 key frame (exchange)
      mk((p) => {
        stage.append(p);
        A8.person(p, { who: "alice", x: 52, y: 48 }).set({});
        A8.person(p, { who: "bob", x: 884, y: 48, name: "left" }).set({});
        A8.tag(p, { x: 410, y: 66, text: "p = 23", tone: "blue", fs: 36 }).set({});
        A8.tag(p, { x: 530, y: 66, text: "g = 5", tone: "blue", fs: 36 }).set({});
        A8.wire(p, { x: 150, y: 190, w: 636, h: 120 }).set({});
        A8.tag(p, { x: 110, y: 190, text: "B = 19", tone: "blue", fs: 40, solid: true }).set({});
        A8.tag(p, { x: 826, y: 190, text: "A = 8", tone: "blue", fs: 40, solid: true }).set({});
        A8.tag(p, { x: 170, y: 330, html: A8.pow("19", "6", 40) + " mod 23 = 2", tone: "green", fs: 40, box: true }).set({});
        A8.tag(p, { x: 766, y: 330, html: A8.pow("8", "15", 40) + " mod 23 = 2", tone: "green", fs: 40, box: true }).set({});
        A8.icon(p, "equals", { x: 468, y: 330, tone: "green", disc: true, size: 64 }).set({});
        A8.tag(p, { x: 130, y: 430, text: "a = 6", tone: "purple", fs: 36 }).set({});
        A8.icon(p, "lock", { x: 46, y: 430, tone: "purple", size: 50 }).set({});
        A8.tag(p, { x: 806, y: 430, text: "b = 15", tone: "purple", fs: 36 }).set({});
        A8.icon(p, "lock", { x: 890, y: 430, tone: "purple", size: 50 }).set({});
        A8.tag(p, { x: 468, y: 520, html: A8.pow("5", "6") + " = 15625 = 679 × 23 + 8", tone: "orange", fs: 40, box: true }).set({});
        A8.tag(p, { x: 468, y: 590, text: "mod 23 = the remainder 8", tone: "orange", solid: true }).set({});
      });
      // ---- scene 4 key frame (Eve's search)
      mk((p) => {
        stage.append(p);
        A8.person(p, { who: "eve", x: 52, y: 48 }).set({});
        [["p = 23", 300], ["g = 5", 420], ["A = 8", 530], ["B = 19", 650]].forEach(([t, x]) => A8.tag(p, { x, y: 48, text: t, tone: "blue", fs: 36 }).set({}));
        A8.tag(p, { x: 820, y: 48, text: "a = ?", tone: "purple", ghost: true, fs: 36 }).set({});
        A8.tag(p, { x: 468, y: 150, html: A8.pow("5", "x") + " mod 23 = 8, so x = ?", tone: "orange", fs: 40, box: true }).set({});
        A8.DH.search.forEach((s, i) => A8.tag(p, { x: 178 + i * 116, y: 280, text: `x = ${s.x}\n${s.y}`, box: true, w: 104, h: 96, tone: s.hit ? "green" : "orange", fs: 30 }).set({}));
        A8.tag(p, { x: 468, y: 375, text: "6 tries", tone: "green", solid: true, fs: 36 }).set({});
        A8.tag(p, { x: 300, y: 500, text: A8.BIG.lead, tone: "blue", mono: true, fs: 36 }).set({});
        A8.tag(p, { x: 690, y: 500, text: "a real p: 617 digits", tone: "blue", solid: true, fs: 32 }).set({});
        A8.tag(p, { x: 468, y: 580, text: "no computer can search that", tone: "red", fs: 32 }).set({});
      });
      // ---- scene 5 key frame
      mk((p) => {
        stage.append(p);
        A8.person(p, { who: "bob", x: 52, y: 48 }).set({});
        A8.tag(p, { x: 150, y: 130, text: "p = 5", tone: "purple", fs: 40 }).set({});
        A8.tag(p, { x: 300, y: 130, text: "q = 11", tone: "purple", fs: 40 }).set({});
        A8.tag(p, { x: 20, y: 225, text: "n = 5 × 11 = 55", tone: "blue", fs: 40, anchor: "l" }).set({});
        A8.tag(p, { x: 20, y: 320, text: "z = 4 × 10 = 40", tone: "purple", fs: 40, anchor: "l" }).set({});
        A8.tag(p, { x: 20, y: 415, text: "e = 3", tone: "blue", fs: 40, anchor: "l" }).set({});
        A8.tag(p, { x: 190, y: 415, text: "no common factor with 40", tone: "green", fs: 28, anchor: "l" }).set({});
        A8.tag(p, { x: 20, y: 510, text: "d = 27", tone: "purple", fs: 40, anchor: "l" }).set({});
        A8.tag(p, { x: 220, y: 510, text: "3 × 27 = 81 = 2 × 40 + 1", tone: "purple", fs: 32, anchor: "l" }).set({});
        A8.icon(p, "lock", { x: 740, y: 190, tone: "blue", size: 120 }).set({});
        A8.tag(p, { x: 740, y: 290, text: "public key", tone: "blue", fs: 32 }).set({});
        A8.tag(p, { x: 740, y: 345, text: "(55, 3)", tone: "blue", solid: true, fs: 36 }).set({});
        A8.icon(p, "key", { x: 740, y: 440, tone: "purple", size: 120 }).set({});
        A8.tag(p, { x: 740, y: 540, text: "private key", tone: "purple", fs: 32 }).set({});
        A8.tag(p, { x: 740, y: 595, text: "27", tone: "purple", solid: true, fs: 36 }).set({});
      });
      // ---- scene 6 key frame
      mk((p) => {
        stage.append(p);
        A8.person(p, { who: "alice", x: 52, y: 48 }).set({});
        A8.person(p, { who: "bob", x: 884, y: 48, name: "left" }).set({});
        A8.wire(p, { x: 150, y: 190, w: 636, h: 90 }).set({});
        A8.tag(p, { x: 110, y: 190, text: "7", tone: "green", solid: true, fs: 48, box: true, w: 80, h: 80 }).set({});
        A8.tag(p, { x: 826, y: 190, text: "13", tone: "blue", solid: true, fs: 48, box: true, w: 90, h: 80 }).set({});
        A8.icon(p, "lock", { x: 870, y: 140, tone: "purple", size: 44 }).set({});
        A8.icon(p, "lock", { x: 130, y: 300, tone: "blue", size: 56 }).set({});
        A8.tag(p, { x: 230, y: 300, text: "(55, 3)", tone: "blue", fs: 36 }).set({});
        A8.icon(p, "lock", { x: 730, y: 300, tone: "blue", size: 56 }).set({});
        A8.tag(p, { x: 830, y: 300, text: "(55, 3)", tone: "blue", fs: 36 }).set({});
        A8.icon(p, "key", { x: 730, y: 390, tone: "purple", size: 64 }).set({});
        A8.tag(p, { x: 820, y: 390, text: "27", tone: "purple", solid: true, fs: 36 }).set({});
        A8.tag(p, { x: 468, y: 320, text: A8.pow("7", "3", 40) + " = 343\n= 6 × 55 + 13", tone: "blue", fs: 40, box: true }).set({});
        A8.tag(p, { x: 468, y: 420, html: A8.pow("13", "27", 40) + " mod 55 = 7", tone: "green", fs: 40, box: true }).set({});
        A8.person(p, { who: "eve", x: 52, y: 520 }).set({});
        A8.tag(p, { x: 240, y: 520, text: "(55, 3)", tone: "red", solid: true, fs: 36 }).set({});
        A8.tag(p, { x: 340, y: 520, text: "13", tone: "red", solid: true, fs: 36 }).set({});
        [2, 3, 4, 5].forEach((f, i) => A8.tag(p, { x: 470 + i * 104, y: 520, text: `÷ ${f}`, box: true, w: 92, h: 70, tone: f === 5 ? "green" : "red", fs: 36 }).set({}));
        A8.tag(p, { x: 300, y: 595, text: "55 = 5 × 11, so d = 27", tone: "red", fs: 32 }).set({});
        A8.tag(p, { x: 730, y: 595, text: "a real n: 617 digits", tone: "blue", solid: true, fs: 32 }).set({});
      });
      // ---- scene 7 key frame
      mk((p) => {
        stage.append(p);
        const row = (y, inp, dig, marks, inTone) => {
          A8.tag(p, { x: 130, y, text: inp, box: true, tone: inTone || "grey", fs: 44, w: 130, h: 76 }).set({});
          L5.svg(p).append(L5.arrow(210, y, 330, y, "grey", 1, { w: 7, head: 20 }));
          A8.tag(p, { x: 468, y, text: "hash", box: true, tone: "grey", solid: false, fs: 40, w: 190, h: 76 }).set({});
          L5.svg(p).append(L5.arrow(575, y, 650, y, "grey", 1, { w: 7, head: 20 }));
          A8.digest(p, { x: 780, y, text: dig, fs: 36 }).set({ marks });
        };
        row(100, "cat", A8.HASH.cat);
        row(240, "cot", A8.HASH.cot, () => "orange", "orange");
        row(380, "cat", A8.HASH.cat, () => "green", "grey");
        A8.icon(p, "equals", { x: 780, y: 310, tone: "green", disc: true, size: 52 }).set({});
        const sv = L5.svg(p);
        sv.append(L5.arrow(700, 540, 230, 540, "red", 1, { w: 6, head: 18 }));
        A8.icon(p, "cross", { x: 468, y: 540, tone: "red", disc: true, size: 56 }).set({});
        A8.tag(p, { x: 130, y: 540, text: "?", tone: "red", box: true, fs: 44, w: 100, h: 76 }).set({});
      });
      // ---- scene 8 key frame
      mk((p) => {
        stage.append(p);
        const v = A8.CHAIN.view(2);
        const blocks = [0, 1, 2].map((i) => A8.block(p, { x: i * 333, y: 20, w: 270 }));
        blocks.forEach((b, i) =>
          b.set({ title: `Block ${i + 1}`, data: v[i].data, prev: v[i].prev, hash: v[i].hash, dataTone: v[i].edited ? "orange" : "grey", prevTone: v[i].linkOk ? "blue" : "red", hashTone: "blue", mark: v[i].linkOk ? null : "bad", tone: v[i].linkOk ? "grey" : "red" }),
        );
        [0, 1].forEach((i) => {
          const pts = A8.elbow(blocks[i].pt("hash", "r"), blocks[i + 1].pt("prev", "l"));
          A8.link(p, { pts, tone: v[i + 1].linkOk ? "blue" : "red" }).set({});
          const mid = { x: (pts[1][0] + 0), y: (pts[1][1] + pts[2][1]) / 2 };
          A8.icon(p, v[i + 1].linkOk ? "tick" : "cross", { x: mid.x, y: mid.y, size: 40, disc: true, tone: v[i + 1].linkOk ? "green" : "red" }).set({});
        });
        const bd = L5.badge(p, { x: 20, y: 400, w: 330, h: 68, valid: "valid chain", invalid: "broken chain" });
        bd("invalid", 1);
        A8.tag(p, { x: 600, y: 434, text: "block 3 is the next to break", tone: "red", fs: 30 }).set({});
      });
      // ---- scene 9 key frame
      mk((p) => {
        stage.append(p);
        const blk = A8.block(p, { x: 0, y: 10, w: 300, fields: ["data", "nonce", "hash"], title: "Block 7" });
        blk.set({ data: "cat pays dan 4", nonce: 14, hash: "0d84059e", hashTone: "green", hashMarks: (i) => (i === 0 ? "green" : null), mark: "ok" });
        const tr = A8.tries(p, { x: 340, y: 10, w: 590, rows: 5, rowH: 62, count: A8.MINE.rows.length, lead: true, row: (i) => ({ a: `nonce ${A8.MINE.rows[i].n}`, b: A8.MINE.rows[i].hash, ok: A8.MINE.rows[i].ok }) });
        tr.update({ upto: 15, hi: 14 });
        A8.tag(p, { x: 150, y: 285, text: "hash starts with 0", tone: "orange", fs: 28 }).set({});
        A8.tag(p, { x: 640, y: 350, text: "found after 15 hashes", tone: "green", solid: true }).set({});
        const b1 = A8.bar(p, { x: 20, y: 420, w: 360, tone: "orange", text: "15 hashes to find" });
        b1.set({ text: "find: 15 hashes" });
        const b2 = A8.bar(p, { x: 20, y: 490, w: 360, tone: "green", text: "1" });
        b2.set({ k: 1 / 15, textOut: true, text: "check: 1 hash" });
        const c16 = A8.cells(p, { x: 560, y: 440, cols: 16, rows: 1, size: 22, gap: 4 });
        c16.update((r, c) => (c === 9 ? { tone: "green" } : undefined));
        const c256 = A8.cells(p, { x: 620, y: 480, cols: 16, rows: 8, size: 14, gap: 3 });
        c256.update((r, c) => (r === 3 && c === 5 ? { tone: "green" } : undefined));
      });
      // ---- scene 10 key frame
      mk((p) => {
        stage.append(p);
        const v = A8.SEAL.view(3);
        const blocks = [0, 1, 2].map((i) => A8.block(p, { x: i * 333, y: 10, w: 270, fields: ["data", "prev", "nonce", "hash"] }));
        blocks.forEach((b, i) =>
          b.set({ title: `Block ${i + 1}`, data: v[i].data, prev: v[i].prev, nonce: v[i].nonce, hash: v[i].hash, dataTone: v[i].edited ? "orange" : "grey", prevTone: v[i].linkOk ? "blue" : "red", hashTone: "blue", hashMarks: (j) => (j === 0 ? (v[i].sealOk ? "green" : "red") : null), mark: v[i].sealOk && v[i].linkOk ? "ok" : "bad", tone: v[i].linkOk ? "grey" : "red" }),
        );
        [0, 1, 2].forEach((i) => A8.bar(p, { x: 130, y: 330 + i * 64, w: 360, tone: "orange", text: `${[15, 5, 30][i]} tries` }).set({ k: [15, 5, 30][i] / 30, text: `${[15, 5, 30][i]} tries`, textOut: i === 1 }));
        [0, 1, 2].forEach((i) => A8.tag(p, { x: 20, y: 354 + i * 64, text: `block ${i + 1}`, anchor: "l" }).set({}));
        A8.tag(p, { x: 700, y: 440, text: "50 tries", tone: "orange", solid: true, fs: 44 }).set({});
      });
      return (t) => {
        const pi = Math.min(panels.length - 1, Math.floor(t));
        panels.forEach((p, i) => (p.style.display = i === pi ? "block" : "none"));
      };
    },
  });
})();
