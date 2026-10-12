(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  // ===== draft of scene 9 (mining), 13.5 s
  V.scene({
    kicker: "PROOF OF WORK",
    title: ["Sealing a block", "means guessing"],
    dur: 13.5,
    caps: [[0.4, 2.4, "Try numbers (nonces) until the hash starts with 0."], [2.6, 5.6, "Every try gives a new, unpredictable hash."], [6.2, 8.4, "Found it after 15 hashes. Checking takes just 1."], [8.8, 11.0, "Each extra zero makes a hit 16 times rarer."], [11.2, 13.2, "So it costs about 16 times more work."]],
    build(stage) {
      const R = A8.MINE.rows;
      const blk = A8.block(stage, { x: 0, y: 10, w: 300, fields: ["data", "nonce", "hash"], title: "Block 7" });
      const tr = A8.tries(stage, { x: 340, y: 10, w: 590, rows: 5, rowH: 62, count: R.length, lead: true, row: (i) => ({ a: `nonce ${R[i].n}`, b: R[i].hash, ok: R[i].ok }) });
      const target = A8.tag(stage, { x: 150, y: 285, text: "hash starts with 0", tone: "orange" });
      const found = A8.tag(stage, { x: 640, y: 350, text: "found after 15 hashes", tone: "green", solid: true });
      const b1 = A8.bar(stage, { x: 20, y: 430, w: 360, tone: "orange" });
      const b2 = A8.bar(stage, { x: 20, y: 500, w: 360, tone: "green" });
      const g = A8.cells(stage, { x: 40, y: 385, cols: 16, rows: 16, size: 12, gap: 3 });
      const t1 = A8.tag(stage, { x: 300, y: 392, text: "starts with 0: 1 in 16", tone: "orange", anchor: "l" });
      const t2 = A8.tag(stage, { x: 300, y: 500, text: "starts with 00: 1 in 256", tone: "orange", anchor: "l" });
      const t3 = A8.tag(stage, { x: 470, y: 580, text: "16 times more work", tone: "orange", solid: true, fs: 36 });
      return (t) => {
        const up = 15 * ramp(t, 1.2, 5.7, E.lin);
        const cur = clamp(Math.ceil(up - 1e-9) - 1, 0, 14);
        const row = R[cur];
        const dim = 1 - 0.65 * ramp(t, 8.4, 8.8);
        const win = ramp(t, 5.7, 6.2);
        blk.set({ data: "cat pays dan 4", nonce: row.n, hash: row.hash, hashTone: row.ok && up >= 15 ? "green" : "blue", hashMarks: (j) => (j === 0 ? (row.ok ? "green" : "red") : null), mark: up >= 15 ? "ok" : null, tone: up >= 15 ? "green" : "grey", k: ramp(t, 0.2, 0.8), o: dim });
        tr.update({ upto: up, hi: win > 0 ? 14 : null, hiK: win, o: dim });
        target.set({ k: ramp(t, 0.6, 1.0), o: dim });
        found.set({ k: ramp(t, 6.2, 6.6), o: dim });
        b1.set({ k: ramp(t, 6.8, 7.5), text: "find: 15 hashes", o: 1 - ramp(t, 8.4, 8.8) });
        b2.set({ k: (1 / 15) * ramp(t, 7.5, 7.9), text: "check: 1 hash", textOut: true, o: 1 - ramp(t, 8.4, 8.8) });
        g.update((r, c) => (r === 0 && c === 5 ? { tone: "green" } : undefined), { rows: t < 9.8 ? 1 : 1 + 15 * ramp(t, 9.8, 11.0, E.lin), cols: t < 8.8 ? 0 : 16 * ramp(t, 8.8, 9.4, E.lin) + (t >= 9.4 ? 0 : 0), o: 1 });
        t1.set({ k: ramp(t, 9.2, 9.6) });
        t2.set({ k: ramp(t, 11.0, 11.4) });
        t3.set({ k: ramp(t, 11.4, 11.8) });
      };
    },
  });
  // ===== draft of scene 8 (chain) with the check strip
  V.scene({
    kicker: "HASH CHAIN",
    title: ["Edit one block and", "every link after breaks"],
    dur: 12.5,
    caps: [[0.5, 3.0, "Each block stores the hash of the block before it."], [3.3, 5.4, "Edit one block and its hash changes."], [5.5, 7.7, "The next block holds the old hash: the link breaks."], [8.2, 10.8, "Recompute every later hash and it looks valid again."], [11.0, 12.4, "Hashes spot edits. They do not stop them."]],
    build(stage) {
      const b = [0, 1, 2].map((i) => A8.block(stage, { x: i * 333, y: 40, w: 270, title: `Block ${i + 1}` }));
      const links = [0, 1].map((i) => {
        const pts = A8.elbow(b[i].pt("hash", "r"), b[i + 1].pt("prev", "l"));
        return { l: A8.link(stage, { pts }), tick: A8.icon(stage, "tick", { x: pts[1][0], y: (pts[1][1] + pts[2][1]) / 2, size: 40, disc: true, tone: "green" }), cross: A8.icon(stage, "cross", { x: pts[1][0], y: (pts[1][1] + pts[2][1]) / 2, size: 40, disc: true, tone: "red" }) };
      });
      const badge = L5.badge(stage, { x: 303, y: 500, w: 330, h: 68, valid: "valid chain", invalid: "broken chain" });
      const tagO = A8.tag(stage, { x: 468, y: 596, text: "but the edit is still there", tone: "orange" });
      const lab1 = A8.tag(stage, { x: 330, y: 345, text: "stored in block 2", tone: "grey" });
      const lab2 = A8.tag(stage, { x: 606, y: 345, text: "hash of block 1", tone: "grey" });
      const d1 = A8.digest(stage, { x: 330, y: 405, text: "fb28ccb9", fs: 36 });
      const d2 = A8.digest(stage, { x: 606, y: 405, text: "fb28ccb9", fs: 36 });
      const okI = A8.icon(stage, "tick", { x: 468, y: 405, size: 56, disc: true, tone: "green" });
      const noI = A8.icon(stage, "cross", { x: 468, y: 405, size: 56, disc: true, tone: "red" });
      return (t) => {
        const st = t < 3.9 ? 0 : t < 8.5 ? 1 : t < 10.0 ? 2 : 3;
        const v = A8.CHAIN.view(st);
        b.forEach((bl, i) => {
          const changing = (i === 0 && st === 1 && t < 4.4) || (i === 1 && st === 2 && t < 9.0) || (i === 2 && st === 3 && t < 10.5);
          bl.set({ data: v[i].data, prev: v[i].prev, hash: v[i].hash, dataTone: v[i].edited ? "orange" : "grey", prevTone: v[i].linkOk ? "blue" : "red", hashTone: "blue", hashMarks: changing ? (j) => (j < 8 ? "orange" : null) : null, tone: v[i].linkOk ? "grey" : "red", mark: v[i].linkOk ? null : "bad", k: ramp(t, 0.2 + 0.25 * i, 0.7 + 0.25 * i) });
        });
        links.forEach((lk, i) => {
          const ok = v[i + 1].linkOk;
          lk.l.set({ k: ramp(t, 1.5, 2.4), tone: ok ? "blue" : "red" });
          lk.tick.set({ k: ramp(t, 2.0, 2.4), o: ok ? 1 : 0 });
          lk.cross.set({ k: ramp(t, 2.0, 2.4), o: ok ? 0 : 1 });
        });
        const valid = v.every((x) => x.linkOk);
        badge(t < 2.4 ? "none" : valid ? "valid" : "invalid", ramp(t, 2.4, 3.0));
        tagO.set({ k: ramp(t, 11.0, 11.4) });
        // check strip: link into block 2 until 9.0, then the link into block 3
        const L = t < 9.0 ? 1 : 2;
        const stored = v[L].prev;
        const actual = v[L - 1].hash;
        const ok = stored === actual;
        const sk = ramp(t, 2.2, 2.6);
        lab1.set({ text: `stored in block ${L + 1}`, k: sk });
        lab2.set({ text: `hash of block ${L}`, k: sk });
        const diff = ok ? [] : A8.diffIdx(stored, actual);
        d1.set({ text: stored, marks: (i) => (diff.includes(i) ? "red" : ok ? "green" : null), k: sk });
        d2.set({ text: actual, marks: (i) => (diff.includes(i) ? "red" : ok ? "green" : null), k: sk });
        okI.set({ k: sk, o: ok ? 1 : 0 });
        noI.set({ k: sk, o: ok ? 0 : 1 });
      };
    },
  });
})();
