/* TEMPORARY layout test for the helpers (deleted by the architect before finishing). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  const S = (n, title, build) =>
    V.scene({
      kicker: `TEST ${n}`,
      title: [title, ""],
      dur: 3,
      caps: [[0.4, 2.8, "Caption test sentence for layout."]],
      build,
    });

  // 2: split (4 nodes, 8 slots, overflow row)
  S(2, "split", (stage) => {
    const cl = D5.cluster(stage, { x: 12, y: 260, n: 4, w: 210, gap: 24, cols: 4, rows: 2, cw: 44, ch: 44, cg: 6 });
    const tray = Array.from({ length: 12 }, (_, i) => D5.chip(stage, { text: String(i + 1), w: 44, h: 44 }));
    const rep = [];
    for (let n = 0; n < 4; n++)
      for (let i = 0; i < 12; i++) rep.push({ n, i, c: D5.chip(stage, { text: String(i + 1), w: 44, h: 44 }) });
    const lg = [
      D5.tag(stage, { x: 100, y: 540, text: "leader", tone: "blue" }),
      D5.tag(stage, { x: 300, y: 540, text: "follower", tone: "blue" }),
    ];
    return (t) => {
      for (let n = 0; n < 4; n++) cl.set(n, { tag: `P${n + 1}`, ring: n === 0 ? "red" : "green", ringK: 1, k: 1 });
      tray.forEach((c, i) => c.set({ x: 156 + i * 56, y: 60, ...D5.appear(1) }));
      rep.forEach(({ n, i, c }) => {
        const p = cl.slot(n, i);
        c.set({ x: p.x, y: p.y, tone: i >= 8 ? "red" : "blue", solid: i >= 8 });
      });
      lg[0].set({});
      lg[1].set({});
      void t;
    };
  });

  // 3: ranges (cols 1, rows 4)
  S(3, "ranges", (stage) => {
    const cl = D5.cluster(stage, { x: 12, y: 150, n: 4, w: 210, gap: 24, cols: 1, rows: 4, cw: 178, ch: 44, cg: 6 });
    const chips = [];
    D5.NAME_NODES.forEach((l, n) =>
      l.forEach((name, i) => chips.push([n, i, D5.chip(stage, { text: name, w: 178, h: 44, tone: "grey" })])),
    );
    const q = D5.tag(stage, { x: 300, y: 20, text: "Khan to Mills", tone: "blue", solid: true });
    return () => {
      for (let n = 0; n < 4; n++) cl.set(n, { tag: D5.RANGES[n], ring: n === 1 ? "blue" : null });
      chips.forEach(([n, i, c]) => {
        const p = cl.slot(n, i);
        c.set({ x: p.x, y: p.y, tone: n === 1 && i < 3 && i > 0 ? "blue" : "grey", solid: n === 1 && i > 0 && i < 3 });
      });
      q.set({});
    };
  });

  // 4: hotspot (cols 2, rows 3, meters)
  S(4, "hotspot", (stage) => {
    const cl = D5.cluster(stage, { x: 12, y: 190, n: 4, w: 210, gap: 24, cols: 2, rows: 3, cw: 88, ch: 44, cg: 6 });
    const ms = [0, 1, 2, 3].map((n) => D5.meter(stage, { x: cl.box(n).x + 15, y: cl.box(n).y + cl.h + 24, w: 180 }));
    const cs = D5.WRITES.map((w) => D5.chip(stage, { text: w, w: 88, h: 44 }));
    const clock = D5.tag(stage, { x: 380, y: 10, text: "now 14:xx", tone: "orange", solid: true });
    return () => {
      for (let n = 0; n < 4; n++) cl.set(n, { tag: D5.HOURS[n], tone: n === 2 ? "red" : "grey" });
      cs.forEach((c, i) => c.set({ x: cl.slot(2, i).x, y: cl.slot(2, i).y }));
      ms.forEach((m, n) => m.set({ k: n === 2 ? 1 : 0, tone: n === 2 ? "red" : "green" }));
      clock.set({});
    };
  });

  // 5: hash (cells, box, cols 2 rows 1)
  S(5, "hash", (stage) => {
    const cl = D5.cluster(stage, { x: 12, y: 270, n: 4, w: 210, gap: 24, cols: 2, rows: 1, cw: 64, ch: 44, cg: 8 });
    const nc = D5.cells(stage, { y: 180 });
    const hb = D5.hashBox(stage, { x: 700, y: 10 });
    const keys = D5.KEYS8.map((id) => D5.chip(stage, { text: String(id), w: 64, h: 44 }));
    const disc = D5.disc(stage, { x: 700, y: 140, text: "11", tone: "orange", size: 56 });
    return () => {
      for (let n = 0; n < 4; n++) cl.set(n, {});
      for (let i = 0; i < 16; i++) nc.set(i, { solid: i === 11, tone: i === 11 ? "orange" : "purple" });
      hb.set({ pulse: 1 });
      keys.forEach((c, i) => c.set({ x: 50 + i * 72, y: 40 }));
      disc.set({});
    };
  });

  // 6: two layouts (compact clusters)
  S(6, "range query", (stage) => {
    const top = D5.cluster(stage, {
      x: 12,
      y: 64,
      n: 4,
      w: 210,
      gap: 24,
      cols: 2,
      rows: 2,
      cw: 64,
      ch: 44,
      cg: 8,
      headH: 52,
    });
    const bot = D5.cluster(stage, {
      x: 12,
      y: 380,
      n: 4,
      w: 210,
      gap: 24,
      cols: 2,
      rows: 2,
      cw: 64,
      ch: 44,
      cg: 8,
      headH: 52,
    });
    const a = [];
    D5.RNODES.forEach((l, n) =>
      l.forEach((id, j) => a.push((D5.chip(stage, { text: String(id), w: 64, h: 44 })._set = (c) => c))),
    );
    const chips = [];
    D5.RNODES.forEach((l, n) =>
      l.forEach((id, j) => chips.push([top.slot(n, j), D5.chip(stage, { text: String(id), w: 64, h: 44 }), id])),
    );
    D5.HNODES.forEach((l, n) =>
      l.forEach((id, j) => chips.push([bot.slot(n, j), D5.chip(stage, { text: String(id), w: 64, h: 44 }), id])),
    );
    const t1 = D5.tag(stage, { x: 12, y: 0, text: "key ranges", tone: "purple" });
    const t2 = D5.tag(stage, { x: 12, y: 316, text: "hash", tone: "purple" });
    const s1 = D5.stat(stage, { x: 600, y: 0, w: 324, label: "nodes asked", tone: "green" });
    const s2 = D5.stat(stage, { x: 600, y: 316, w: 324, label: "nodes asked", tone: "red" });
    return () => {
      for (let n = 0; n < 4; n++) {
        top.set(n, { ring: n === 0 ? "blue" : null });
        bot.set(n, { ring: "red" });
      }
      chips.forEach(([p, c, id]) => c.set({ x: p.x, y: p.y, tone: id <= 104 ? "blue" : "grey", solid: id <= 104 }));
      t1.set({});
      t2.set({});
      s1.set({ text: "1" });
      s2.set({ text: "4" });
      void a;
    };
  });

  // 7: by document (3 nodes w 288, chips w 128)
  S(7, "by document", (stage) => {
    const cl = D5.cluster(stage, {
      x: 12,
      y: 130,
      n: 3,
      w: 288,
      gap: 24,
      cols: 2,
      rows: 2,
      cw: 128,
      ch: 44,
      cg: 8,
      h: 250,
      names: ["Partition 1", "Partition 2", "Partition 3"],
    });
    const chips = [];
    D5.DOCS.forEach((l, n) =>
      l.forEach((id, j) => chips.push([cl.slot(n, j), D5.chip(stage, { text: D5.carText(id), w: 128, h: 44 }), id])),
    );
    const idx = [0, 1, 2].map((n) =>
      D5.tag(stage, { x: cl.box(n).x + 20, y: cl.box(n).y + 190, text: "red: 6, 9, 12", tone: "purple", w: 248 }),
    );
    const q = D5.tag(stage, { x: 340, y: 10, text: "red", tone: "blue", solid: true });
    return () => {
      for (let n = 0; n < 3; n++) cl.set(n, { ring: "red" });
      chips.forEach(([p, c, id]) =>
        c.set({
          x: p.x,
          y: p.y,
          tone: D5.CARS[id - 1][1] === "red" ? "blue" : "grey",
          solid: D5.CARS[id - 1][1] === "red",
        }),
      );
      idx.forEach((t) => t.set({}));
      q.set({});
    };
  });

  // 8: by term (index cards) + doc cards
  S(8, "by term", (stage) => {
    const ic = D5.cluster(stage, {
      x: 12,
      y: 20,
      n: 3,
      w: 288,
      gap: 24,
      cols: 1,
      rows: 1,
      cw: 200,
      ch: 44,
      cg: 6,
      h: 190,
      slots: false,
      names: ["Index 1", "Index 2", "Index 3"],
      icon: false,
    });
    const lines = [];
    [0, 1, 2].forEach((n) =>
      D5.TERMS.filter((t) => D5.idxPart(t) === n).forEach((t, j) =>
        lines.push([
          n,
          j,
          D5.text(stage, {
            x: ic.box(n).x + 20,
            y: ic.box(n).y + 64 + j * 50,
            text: `${t}: ${D5.postings(t).join(" ")}`,
            tone: "purple",
          }),
        ]),
      ),
    );
    const dc = D5.cluster(stage, {
      x: 12,
      y: 330,
      n: 3,
      w: 288,
      gap: 24,
      cols: 4,
      rows: 1,
      cw: 56,
      ch: 44,
      cg: 8,
      slots: false,
      names: ["Cars 1", "Cars 2", "Cars 3"],
    });
    const dch = [];
    D5.DOCS.forEach((l, n) =>
      l.forEach((id, j) => dch.push([dc.slot(n, j), D5.chip(stage, { text: String(id), w: 56, h: 44 })])),
    );
    return () => {
      for (let n = 0; n < 3; n++) {
        ic.set(n, { tone: "purple", ring: n === 2 ? "blue" : null });
        dc.set(n, {});
      }
      lines.forEach(([, , t]) => t.set({}));
      dch.forEach(([p, c]) => c.set({ x: p.x, y: p.y }));
    };
  });

  // 9: two rows of 4 nodes, one ghost
  S(9, "rebalance", (stage) => {
    const mk = (y) =>
      D5.cluster(stage, {
        x: 12,
        y,
        n: 4,
        w: 210,
        gap: 24,
        cols: 2,
        rows: 2,
        cw: 70,
        ch: 44,
        cg: 8,
        headH: 52,
        names: ["Node A", "Node B", "Node C", "Node D"],
      });
    const a = mk(66);
    const b = mk(366);
    const ca = [];
    for (let k = 0; k < 12; k++) ca.push([D5.chip(stage, { text: String(k), w: 70, h: 44 }), k]);
    const cb = [];
    for (let k = 0; k < 12; k++) cb.push([D5.chip(stage, { text: `P${k}`, w: 70, h: 44, tone: "grey" }), k]);
    return () => {
      for (let n = 0; n < 4; n++) {
        a.set(n, { ghost: n === 3, tag: n === 0 ? "key mod N" : undefined });
        b.set(n, { ghost: n === 3, tone: n === 3 ? "orange" : "grey" });
      }
      ca.forEach(([c, k]) => c.set({ x: a.slot(k % 3, Math.floor(k / 3)).x, y: a.slot(k % 3, Math.floor(k / 3)).y }));
      cb.forEach(([c, k]) => c.set({ x: b.slot(k % 3, Math.floor(k / 3)).x, y: b.slot(k % 3, Math.floor(k / 3)).y }));
    };
  });

  // 10: tanks
  S(10, "dynamic", (stage) => {
    const cl = D5.cluster(stage, {
      x: 12,
      y: 80,
      n: 3,
      w: 288,
      gap: 24,
      cols: 1,
      rows: 1,
      cw: 200,
      ch: 44,
      h: 360,
      slots: false,
    });
    const base = cl.box(0).y + cl.h - 24;
    const tanks = [6, 8, 4].map((_, n) => D5.tank(stage, { x: cl.box(n).x + 144, y: base }));
    const rule = D5.rule(stage, { x: 12, y: base - 150, w: 912, text: "limit 10 GB" });
    return () => {
      for (let n = 0; n < 3; n++) cl.set(n, {});
      [6, 12, 3].forEach((gb, n) => tanks[n].set({ gb, tone: gb > 10 ? "red" : "blue" }));
      rule.set({});
    };
  });
  void L5;
  void ramp;
  void E;
})();
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  // 11: animation + icons + links, to test purity
  V.scene({
    kicker: "TEST 11",
    title: ["motion", ""],
    dur: 4,
    caps: [[0.4, 3.5, "Motion test."]],
    build(stage) {
      const cl = D5.cluster(stage, {
        x: 12,
        y: 300,
        n: 4,
        w: 210,
        gap: 24,
        cols: 2,
        rows: 2,
        cw: 70,
        ch: 44,
        cg: 8,
        headH: 52,
      });
      const chips = D5.ids(0, 5).map((i) => D5.chip(stage, { text: String(i), w: 70, h: 44 }));
      const q = D5.tag(stage, { x: 340, y: 20, text: "red", tone: "blue", solid: true, icon: "search" });
      const q2 = D5.tag(stage, { x: 560, y: 20, text: "client", tone: "blue", icon: "client" });
      const q3 = D5.tag(stage, { x: 700, y: 20, text: "+ node", tone: "orange", icon: "plus" });
      const svg = L5.svg(stage);
      const ln = [0, 1, 2, 3].map((n) =>
        D5.link(svg, { x: 468, y: 80 }, { x: cl.top(n).x, y: cl.top(n).y - 70 }, "blue"),
      );
      const ic = svg.appendChild(D5.icon.client(60, 60, 60));
      const hb = D5.hashBox(stage, { x: 40, y: 140 });
      return (t) => {
        for (let n = 0; n < 4; n++)
          cl.set(n, { k: ramp(t, 0.1 + n * 0.1, 0.6 + n * 0.1), tag: `T${n}`, tagK: ramp(t, 0.5, 1) });
        chips.forEach((c, i) => {
          const a = { x: 100 + i * 80, y: 220 };
          const b = cl.slot(i % 4, Math.floor(i / 4));
          const k = ramp(t, 1 + i * 0.2, 2 + i * 0.2, E.inOut);
          const p = D5.fly(a, b, k, { arc: -50 });
          c.set({ ...p, ...D5.appear(ramp(t, 0.4, 0.8)), ring: "orange", ringK: ramp(t, 2.5, 3) });
        });
        q.set({ k: ramp(t, 0.3, 0.8) });
        q2.set({});
        q3.set({ solid: true });
        ln.forEach((l, n) => l(ramp(t, 1.5 + n * 0.2, 2.2 + n * 0.2, E.out)));
        V.place(ic, { x: 20, y: 0, s: 1 });
        hb.set({ pulse: V.flash(t, 1, 2) });
      };
    },
  });
})();
