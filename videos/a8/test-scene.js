(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  V.scene({
    kicker: "TEST",
    title: ["Helper check", "panel by time"],
    dur: 10,
    caps: [[0.2, 9.8, "Caption sits here and must stay short."]],
    build(stage) {
      // panel 0: tags, people, icons
      const p0 = V.h("div", { style: { position: "absolute", inset: "0" } });
      stage.append(p0);
      const alice = A8.person(p0, { who: "alice", x: 52, y: 48 });
      const bob = A8.person(p0, { who: "bob", x: 884, y: 48, name: "left" });
      const eve = A8.person(p0, { who: "eve", x: 468, y: 560 });
      const tags = [
        A8.tag(p0, { x: 468, y: 48, text: "p = 23   g = 5", tone: "blue", fs: 32 }),
        A8.tag(p0, { x: 180, y: 140, text: "a = 6", tone: "purple", solid: false, fs: 32 }),
        A8.tag(p0, { x: 400, y: 140, text: "A = 8", tone: "blue", solid: true, fs: 32 }),
        A8.tag(p0, { x: 600, y: 140, text: "2", tone: "green", solid: true, fs: 44, w: 70 }),
        A8.tag(p0, { x: 760, y: 140, text: "ghost", ghost: true, fs: 32 }),
        A8.tag(p0, { x: 150, y: 230, html: A8.pow("5", "6") + " mod 23 = 8", tone: "blue", fs: 44, box: true }),
        A8.tag(p0, { x: 560, y: 230, text: "x = 1\n5", tone: "orange", box: true, w: 130, h: 92, fs: 32 }),
        A8.tag(p0, { x: 40, y: 330, text: "left anchor", anchor: "l", tone: "red" }),
        A8.tag(p0, { x: 896, y: 330, text: "right anchor", anchor: "r", tone: "grey" }),
      ];
      const icons = ["lock", "key", "eye", "qmark", "plus", "equals", "tick", "cross", "arrow"].map((n, i) =>
        A8.icon(p0, n, { x: 60 + i * 100, y: 420, tone: ["blue", "purple", "red", "orange", "grey", "green", "green", "red", "blue"][i], disc: i % 2 === 1 }),
      );
      const lockOpen = A8.icon(p0, "lock", { x: 880, y: 330, tone: "purple" });
      const fakeW = A8.tag(p0, { x: 700, y: 500, text: "Width 28px estimate", anchor: "l" });
      // panel 1: pots, drops, wire, link
      const p1 = V.h("div", { style: { position: "absolute", inset: "0" } });
      stage.append(p1);
      const wire = A8.wire(p1, { x: 40, y: 200, w: 856, h: 90 });
      const pots = [
        ["P"], ["A"], ["B"], ["P", "A"], ["P", "B"], ["P", "A", "B"],
      ].map((d, i) => A8.pot(p1, { x: 80 + i * 150, y: 360, r: 44 }));
      const potsF = [null, "purple", "blue"];
      const drop = A8.drop(p1, { x: 400, y: 120, paint: "A" });
      const link = A8.link(p1, { pts: [[100, 500], [300, 500], [300, 560], [500, 560]], tone: "orange" });
      const link2 = A8.link(p1, { pts: [[600, 500], [800, 560]], tone: "red", dash: true });
      // panel 2: digests, blocks
      const p2 = V.h("div", { style: { position: "absolute", inset: "0" } });
      stage.append(p2);
      const dg = A8.digest(p2, { x: 200, y: 40, text: A8.HASH.cat });
      const dg2 = A8.digest(p2, { x: 480, y: 40, text: A8.HASH.cot });
      const dg3 = A8.digest(p2, { x: 760, y: 40, text: "0d84059e", tone: "green" });
      const blocks = [0, 1, 2].map((i) => A8.block(p2, { x: i * 333, y: 110, w: 270 }));
      const links = [0, 1].map((i) => A8.link(p2, { pts: A8.elbow(blocks[i].pt("hash", "r"), blocks[i + 1].pt("prev", "l")), tone: "blue" }));
      const badges = [0, 1].map((i) => A8.icon(p2, "tick", { x: (i * 333 + 270 + (i + 1) * 333) / 2 + 0, y: 300, size: 44, disc: true, tone: "green" }));
      const blocks4 = [0, 1, 2].map((i) => A8.block(p2, { x: i * 333, y: 340, w: 270, fields: ["data", "prev", "nonce", "hash"] }));
      // panel 3: tries, cells, bars
      const p3 = V.h("div", { style: { position: "absolute", inset: "0" } });
      stage.append(p3);
      const tr = A8.tries(p3, { x: 20, y: 20, w: 560, rows: 5, rowH: 62, count: A8.MINE.rows.length, lead: true, row: (i) => ({ a: `nonce ${A8.MINE.rows[i].n}`, b: A8.MINE.rows[i].hash, ok: A8.MINE.rows[i].ok }) });
      const c16 = A8.cells(p3, { x: 620, y: 40, cols: 4, rows: 4, size: 40, gap: 8 });
      const c256 = A8.cells(p3, { x: 620, y: 260, cols: 16, rows: 16, size: 16, gap: 4 });
      const bars = [0, 1, 2].map((i) => A8.bar(p3, { x: 20, y: 380 + i * 70, w: 500, tone: ["green", "orange", "blue"][i], text: `bar ${i}` }));
      const row = L5.chromosome(p3, { x: 20, y: 600, genes: "SECRET", size: 56, gap: 8, tone: "grey" });
      const panels = [p0, p1, p2, p3];
      return (t) => {
        const pi = Math.min(3, Math.floor(t / 2.5));
        panels.forEach((p, i) => (p.style.display = i === pi ? "block" : "none"));
        const q = t - pi * 2.5;
        if (pi === 0) {
          alice.set({ k: ramp(q, 0, 0.5) });
          bob.set({});
          eve.set({});
          tags.forEach((tg) => tg.set({ k: 1 }));
          lockOpen.set({ open: ramp(q, 0.3, 1.6, E.inOut) });
          icons.forEach((ic, i) => ic.set({ draw: ramp(q, 0.1 * i, 0.1 * i + 0.8) , open: ramp(q, 0.5, 1.5)}));
          fakeW.set({});
        } else if (pi === 1) {
          wire.set({ k: ramp(q, 0, 1) });
          const D = [["P"], ["A"], ["B"], ["P", "A"], ["P", "B"], ["P", "A", "B"]];
          pots.forEach((p, i) => p.set({ drops: D[i], frame: i < 3 ? potsF[i % 3] || (i === 0 ? "blue" : "purple") : null, frameK: ramp(q, 0.2, 0.8) }));
          pots[0].set({ drops: ["P"], frame: "blue" });
          pots[1].set({ drops: ["A"], frame: "purple" });
          pots[2].set({ drops: ["B"], frame: "purple" });
          pots[4].set({ drops: [], ghost: true });
          drop.set({ x: 400 + 100 * ramp(q, 0, 1), y: 120 + 100 * ramp(q, 0, 1, E.inOut), paint: "A" });
          link.set({ k: ramp(q, 0, 1) });
          link2.set({});
        } else if (pi === 2) {
          dg.set({});
          dg2.set({ marks: (i) => (A8.HASH.diffHex.includes(i) ? "orange" : null) });
          dg3.set({ marks: (i) => (i === 0 ? "green" : null) });
          const v = A8.CHAIN.view(1);
          blocks.forEach((b, i) => b.set({ title: `Block ${i + 1}`, data: v[i].data, prev: v[i].prev, hash: v[i].hash, dataTone: v[i].edited ? "orange" : "grey", prevTone: v[i].linkOk ? "blue" : "red", hashTone: "blue", mark: v[i].linkOk ? null : "bad", tone: v[i].linkOk ? "grey" : "red" }));
          links.forEach((l, i) => l.set({ k: ramp(q, 0, 1), tone: i === 0 ? "red" : "blue" }));
          badges.forEach((bd, i) => bd.set({ tone: i === 0 ? "red" : "green" }));
          const s = A8.SEAL.view(1);
          blocks4.forEach((b, i) => b.set({ title: `Block ${i + 1}`, data: s[i].data, prev: s[i].prev, nonce: s[i].nonce, hash: s[i].hash, hashMarks: (j) => (j === 0 ? (s[i].sealOk ? "green" : "red") : null), mark: s[i].sealOk ? "ok" : "bad" }));
        } else {
          tr.update({ upto: ramp(q, 0, 2) * 16, hi: ramp(q, 0, 2) >= 1 ? 14 : null });
          c16.update((r, c) => (r * 4 + c === 5 ? { k: ramp(q, 0, 1), tone: "green" } : undefined));
          c256.update((r, c) => (r * 16 + c === 100 ? { k: ramp(q, 0, 1), tone: "green" } : undefined));
          bars.forEach((b, i) => b.set({ k: ramp(q, 0.1 * i, 0.1 * i + 1) * (0.3 + 0.3 * i), text: `bar ${i}`, textOut: i === 0 }));
          row.all((i) => ({ tone: i % 2 ? "blue" : "grey" }));
        }
      };
    },
  });
})();
