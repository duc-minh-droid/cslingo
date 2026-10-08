/* throw-away layout checks */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const card = (stage, x, y, w, h, tone = "grey") =>
    stage.appendChild(
      V.h("div", {
        class: `v-card plain c-${tone}`,
        style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` },
      }),
    );
  const txt = (stage, x, y, text, cls = "v-text dim", extra = {}) =>
    stage.appendChild(V.h("div", { class: cls, text, style: { left: `${x}px`, top: `${y}px`, ...extra } }));

  // ---- scene 3 layout
  V.scene({
    kicker: "TEST 3",
    title: ["Many spanning trees,", "one is cheapest"],
    dur: 2,
    caps: [[0.2, 1.8, "Layout of scene three."]],
    build(stage) {
      const g = A4.net(stage, { x: 14, y: 24, s: 0.52, pills: false });
      card(stage, 372, 14, 564, 300);
      txt(stage, 392, 26, "one dot = one tree");
      const svg = L5.svg(stage);
      svg.append(
        V.s("path", { d: "M394 226H914", "stroke-width": 4, style: { stroke: "var(--line-2)", fill: "none" } }),
      );
      for (let v = 11; v <= 22; v++) {
        const x = 408 + (v - 11) * 44.7;
        svg.append(V.s("path", { d: `M${x} 226v10`, "stroke-width": 3, style: { stroke: "var(--line-2)" } }));
      }
      [11, 14, 17, 20, 22].forEach((v) => txt(stage, 408 + (v - 11) * 44.7 - 18, 238, String(v)));
      txt(stage, 560, 272, "total cost");
      const rows = {};
      const toks = A4.FLIP.map((i, j) => {
        const tr = A4.TREES[i];
        rows[tr.total] = (rows[tr.total] ?? -1) + 1;
        const tk = A4.token(stage, { tone: tr.total === 11 ? "green" : "blue", size: 30 });
        tk.set({ x: 408 + (tr.total - 11) * 44.7, y: 207 - 34 * rows[tr.total] });
        return tk;
      });
      const tot = A4.total(stage, { x: 40, y: 276, w: 260, label: "total", tone: "blue" });
      tot.set({ text: "12" });
      A4.tag(stage, { x: 0, y: 332, text: "how many spanning trees?" }).set({});
      A4.COUNTS.forEach((c, i) => {
        const y = 388 + i * 74;
        txt(stage, 0, y + 8, `${c.towns} towns`, "v-text dim", {});
        const digits = c.text.replace(/,/g, "").length;
        const w = Math.min(744, 110 + 26 * digits);
        const b = A4.bar(stage, { x: 180, y, w, tone: i === 2 ? "red" : "blue", text: c.text, fs: 34 });
        b.set({ k: 1, text: c.text });
      });
      txt(stage, 180, 612, "every pair linked");
      g.update({
        edges: {
          AB: { tone: "blue", w: 1.3 },
          BC: { tone: "blue", w: 1.3 },
          BD: { tone: "blue", w: 1.3 },
          DE: { tone: "blue", w: 1.3 },
        },
        base: { edge: { o: 0.5 } },
      });
      return () => {};
    },
  });
  // ---- scene 6 layout
  V.scene({
    kicker: "TEST 6",
    title: ["Cheapest cable first,", "never close a loop"],
    dur: 2,
    caps: [[0.2, 1.8, "Layout of scene six."]],
    build(stage) {
      const row = A4.tiles(stage, {
        x: 19,
        y: 6,
        items: A4.KRUSKAL.sorted.map((e) => `${e.key[0]}${e.key[1]} ${e.w}`),
      });
      row.all((i) => ({ tone: i < 3 ? "green" : i === 3 ? "red" : "grey", solid: i === 4 }));
      const g = A4.net(stage, { x: 24, y: 130, s: 0.8 });
      g.update({
        blobs: [
          { set: ["A", "B", "C"], tone: "green", dash: false },
          { set: ["D", "E"], tone: "green", dash: false },
        ],
        edges: {
          DE: { tone: "green", solid: true },
          BC: { tone: "green", solid: true },
          AC: { tone: "green", solid: true },
          AB: { tone: "blue", w: 1.35, halo: 1 },
        },
        base: { edge: { o: 0.5 } },
        towns: { A: { tone: "blue", ring: "blue" }, B: { tone: "blue", ring: "blue" } },
      });
      const c = card(stage, 560, 150, 376, 170, "red");
      const svg = L5.svg(stage);
      svg.append(L5.cross(612, 235, 60, "red", { ink: true, w: 10 }));
      c.append(
        V.h("div", {
          class: "v-text big",
          text: "same group:",
          style: { left: "112px", top: "28px", fontSize: "38px" },
        }),
      );
      c.append(
        V.h("div", { class: "v-text big", text: "skip it", style: { left: "112px", top: "78px", fontSize: "38px" } }),
      );
      A4.total(stage, { x: 560, y: 360, w: 340, label: "total" }).set({ text: "6", solid: false });
      const tri = V.s("path", {
        d: "M263 74l14 22h-28z",
        style: { fill: "var(--blue)", stroke: "var(--blue-lip)" },
        "stroke-width": 3,
        "stroke-linejoin": "round",
      });
      svg.append(tri);
      A4.tag(stage, { x: 660, y: 76, text: "never read" }).set({});
      return () => {};
    },
  });
  // ---- scene 8 layout
  V.scene({
    kicker: "TEST 8",
    title: ["Which is faster?", "It depends on the network"],
    dur: 2,
    caps: [[0.2, 1.8, "Layout of scene eight."]],
    build(stage) {
      [
        [0, "sparse", "Road map: few cables"],
        [496, "dense", "Every pair linked"],
      ].forEach(([x0, key, title]) => {
        A4.tag(stage, { x: x0, y: 0, text: title }).set({});
        const nodes = {};
        "ABCDEFGH".split("").forEach((t, i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 4;
          nodes[t] = [x0 + 220 + 72 * Math.cos(a), 135 + 72 * Math.sin(a)];
        });
        const ring = ["AB", "BC", "CD", "DE", "EF", "FG", "GH", "AH"];
        const extra = ["AE", "BG"];
        const all = [];
        "ABCDEFGH".split("").forEach((a, i) =>
          "ABCDEFGH"
            .slice(i + 1)
            .split("")
            .forEach((b) => all.push([a, b, 1])),
        );
        const edges = key === "sparse" ? [...ring, ...extra].map((k) => [k[0], k[1], 1]) : all;
        const g = A4.graph(stage, { nodes, edges, r: 12, ew: 4, letters: false, pills: false });
        g.update({
          base: { edge: { tone: "blue" } },
          towns: Object.fromEntries(Object.keys(nodes).map((t) => [t, "blue"])),
        });
        const c = A4.COST[key];
        txt(stage, x0, 226, key === "sparse" ? "1,024 towns · 2,048 cables" : "1,000 towns · 499,500 cables");
        txt(stage, x0, 290, "Prim · V²");
        txt(stage, x0, 384, "Kruskal · E log V");
        const max = Math.max(c.prim, c.kruskal);
        const b1 = A4.bar(stage, {
          x: x0,
          y: 324,
          w: 340,
          h: 44,
          tone: key === "dense" ? "green" : "grey",
          text: c.primText,
          textOut: true,
        });
        const b2 = A4.bar(stage, {
          x: x0,
          y: 418,
          w: 340,
          h: 44,
          tone: key === "sparse" ? "green" : "grey",
          text: c.kruskalText,
          textOut: true,
        });
        b1.set({ k: c.prim / max, text: c.primText, textOut: true });
        b2.set({ k: c.kruskal / max, text: c.kruskalText, textOut: true });
        A4.tag(stage, {
          x: x0,
          y: 490,
          text: key === "sparse" ? "about 50 times less" : "about 5 times less",
          tone: "green",
          solid: true,
        }).set({});
      });
      A4.tag(stage, { x: 278, y: 560, text: "same tree either way", tone: "green", solid: true, fs: 32 }).set({});
      return () => {};
    },
  });
  // ---- scene 10 layout
  V.scene({
    kicker: "TEST 10",
    title: ["The tour is never worse", "than twice the best"],
    dur: 2,
    caps: [[0.2, 1.8, "Layout of scene ten."]],
    build(stage) {
      const m = A4.tspMap(stage, { x: -30, y: -12, s: 1.2 });
      const ed = {};
      [...A4.TSP.best.order].forEach((c, i, o) => {
        const k = [c, o[(i + 1) % o.length]].sort().join("");
        ed[k] = { tone: "purple", dash: true };
      });
      m.update({ edges: ed });
      const svg = L5.svg(stage);
      svg.append(
        V.s("path", {
          d: "M24 520H912",
          "stroke-width": 5,
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)", fill: "none" },
        }),
      );
      const X = (v) => 24 + v * 4.3;
      const T = A4.TSP;
      [
        ["green", "W", T.W],
        ["purple", "best", T.best.len],
        ["blue", "tour", T.tourLen],
        ["orange", "2W", T.walkLen],
      ].forEach(([tone, name, v]) => A4.marker(stage, { x: X(v), y: 520, tone, name, text: A4.num(v) }).set({}));
      A4.marker(stage, {
        x: X(T.twiceBest),
        y: 520,
        tone: "purple",
        name: "twice best",
        text: A4.num(T.twiceBest),
        anchor: "right",
      }).set({});
      svg.append(
        V.s("path", {
          d: `M${X(T.best.len)} 428v-14H${X(T.twiceBest)}v14`,
          "stroke-width": 5,
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: "var(--violet)" },
        }),
      );
      svg.append(L5.tick(660, 378, 56, "green"));
      A4.tag(stage, { x: 590, y: 100, text: "a spanning tree", tone: "blue", solid: true }).set({});
      return () => {};
    },
  });
  // ---- scene 2 layout
  V.scene({
    kicker: "TEST 2",
    title: ["Connect every town", "with no spare cable"],
    dur: 2,
    caps: [[0.2, 1.8, "Layout of scene two."]],
    build(stage) {
      const g = A4.net(stage, { x: 24, y: 20, s: 1 });
      g.update({
        edges: {
          AB: { tone: "red", halo: 1 },
          BC: { tone: "red", halo: 1 },
          AC: { tone: "red", halo: 1, dash: true },
          BD: { tone: "green", solid: true },
          DE: { tone: "green", solid: true },
        },
        towns: { A: { tone: "green", solid: true }, B: { tone: "green", solid: true } },
      });
      A4.total(stage, { x: 650, y: 30, w: 280, label: "cables", tone: "blue" }).set({ text: "4" });
      A4.total(stage, { x: 650, y: 130, w: 280, label: "towns", tone: "grey" }).set({ text: "5" });
      A4.tag(stage, { x: 700, y: 232, text: "one fewer", tone: "green" }).set({});
      const b = L5.badge(stage, { x: 24, y: 490, w: 340, h: 68, valid: "spanning tree", invalid: "a loop" });
      b("invalid", 1);
      const svg = L5.svg(stage);
      svg.append(L5.cross(181, 243, 60, "red", { ink: true, w: 9 }));
      return () => {};
    },
  });
})();
