/* THROWAWAY test scenes for the d2 helpers (deleted before the architect finishes). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, ease: E } = V;

  // T1: profile
  V.scene({
    kicker: "TEST 1",
    title: ["Profile", "page"],
    dur: 4,
    build(stage) {
      const page = D2.page(stage, { x: 0, y: 80, w: 210, h: 380 });
      D2.tag(stage, { x: 0, y: 6, text: "profile page", tone: "blue" }).set({});
      D2.tag(stage, { x: 258, y: 6, text: "relational: 6 tables", tone: "grey" }).set({});
      const tabs = D2.PROFILE.fields.map((f, i) =>
        D2.table(stage, {
          x: 258 + (i % 3) * 228,
          y: i < 3 ? 80 : 208,
          w: 210,
          name: f.table,
          rows: Array.from({ length: f.n }, () => [{ text: "251", tone: "orange" }, ""]),
        }),
      );
      const doc = D2.doc(stage, {
        x: 258,
        y: 420,
        w: 420,
        title: "chef #251",
        lines: D2.profileDoc().slice(0, 2),
        tone: "blue",
      });
      const st = D2.stat(stage, { x: 700, y: 440, w: 224, h: 80, label: "reads", tone: "green" });
      const svg = L5.svg(stage);
      svg.appendChild(
        L5.arrow(page.right().x + 4, page.slotMid(1).y, tabs[1].left().x - 6, tabs[1].left().y, "blue", 1, { bow: 12 }),
      );
      const tok = D2.token(stage, { tone: "blue" });
      return (t) => {
        page.set({ fill: [1, 1, 0.6, 0, 0, 0], wait: 3, waitK: t % 1 });
        tabs.forEach((tb, i) =>
          tb.set({ hot: i === 1 ? 0 : -1, hotK: 1, cells: i === 2 ? { "0,1": { text: "x", tone: "green" } } : {} }),
        );
        doc.set({ fill: [1, 0.5], hot: 1 });
        st.set({ text: "6", bump: 0.5 });
        const p = D2.bez(page.right(), tabs[1].left(), 12, 0.5);
        tok.set(p);
      };
    },
  });

  // T2: rename
  V.scene({
    kicker: "TEST 2",
    title: ["Rename", "everywhere"],
    dur: 4,
    build(stage) {
      D2.tag(stage, { x: 0, y: 6, text: "relational", tone: "grey" }).set({});
      D2.tag(stage, { x: 330, y: 6, text: "document", tone: "grey" }).set({});
      const tb = D2.table(stage, {
        x: 0,
        y: 80,
        w: 270,
        name: "companies",
        rows: [[{ text: "7", tone: "orange" }, "Acme"]],
        widths: [60],
      });
      const svg = L5.svg(stage);
      const ppl = [0, 1, 2, 3].map((i) => {
        const cx = 34 + i * 66;
        svg.appendChild(
          V.s("circle", {
            cx,
            cy: 330,
            r: 28,
            style: { fill: "var(--blue-dim)", stroke: "var(--blue-edge)" },
            "stroke-width": 3,
          }),
        );
        svg.appendChild(D2.icon.person(cx, 330, 40, "blue"));
        svg.appendChild(L5.arrow(cx, 300, 135, 200, "purple", 1, { w: 5, head: 16 }));
        return cx;
      });
      const G = D2.dots(stage, { x: 330, y: 70 });
      const s1 = D2.stat(stage, { x: 0, y: 520, w: 300, h: 80, label: "rows", tone: "green" });
      const s2 = D2.stat(stage, { x: 330, y: 520, w: 594, h: 80, label: "documents to rewrite", tone: "orange" });
      return (t) => {
        tb.set({ cells: { "0,1": { text: "Apex", tone: "green", solid: false } } });
        const n = Math.floor(ramp(t, 0.5, 3.5, E.lin) * 400);
        G.set((i) =>
          i === D2.RENAME.stale ? { tone: "orange", ring: "red" } : i < n ? { tone: "green", solid: true } : "orange",
        );
        s1.set({ text: "1" });
        s2.set({ text: "400" });
        void ppl;
      };
    },
  });

  // T3: schema
  V.scene({
    kicker: "TEST 3",
    title: ["Schema", "change"],
    dur: 4,
    build(stage) {
      D2.tag(stage, { x: 0, y: 0, text: "document store", tone: "grey" }).set({});
      const d1 = D2.doc(stage, {
        x: 0,
        y: 66,
        w: 280,
        title: "#1",
        lines: [{ key: "name", text: "Ada Byte" }],
        tone: "blue",
      });
      const d2 = D2.doc(stage, {
        x: 300,
        y: 66,
        w: 280,
        title: "#2",
        lines: [{ key: "name", text: "Bo Li" }],
        tone: "blue",
      });
      const d3 = D2.doc(stage, {
        x: 600,
        y: 66,
        w: 310,
        title: "#3",
        lines: [
          { key: "first_name", text: "Cy" },
          { key: "last_name", text: "Dee" },
        ],
        tone: "blue",
      });
      const ch = [
        D2.tag(stage, { x: 130, y: 112, text: "Ada", tone: "purple", solid: true, h: 38, fs: 28 }),
        D2.tag(stage, { x: 210, y: 112, text: "Byte", tone: "purple", solid: true, h: 38, fs: 28 }),
      ];
      D2.tag(stage, { x: 0, y: 280, text: "relational", tone: "grey" }).set({});
      const tb = D2.table(stage, {
        x: 0,
        y: 344,
        w: 560,
        name: "users",
        rows: [
          ["Ada Byte", { text: "NULL", tone: "grey" }, { text: "NULL" }],
          ["Bo Li", "NULL", "NULL"],
          ["Cy Dee", "Cy", "Dee"],
        ],
        widths: [190, 150],
      });
      const bar = D2.bar(stage, { x: 600, y: 360, w: 320, h: 56, tone: "orange" });
      return (t) => {
        d1.set({ hot: 0, hotTone: "purple", texts: { 0: "" } });
        d2.set({});
        d3.set({});
        ch.forEach((c) => c.set({}));
        tb.set({ hot: 1, hotTone: "orange" });
        bar.set({ p: 0.62, text: "620 / 1,000" });
        void t;
      };
    },
  });

  // T4: graph
  V.scene({
    kicker: "TEST 4",
    title: ["Property", "graph"],
    dur: 4,
    build(stage) {
      const nodes = Object.fromEntries(
        D2.GRAPH.nodes.map((n) => [n.id, { x: D2.LAYOUT[n.id][0], y: D2.LAYOUT[n.id][1], kind: n.kind }]),
      );
      const g = D2.graph(stage, { nodes, edges: D2.GRAPH.edges });
      const tok = D2.token(stage, { tone: "blue", size: 34 });
      return (t) => {
        g.update({
          nodes: {
            Ben: { tone: "blue", ring: "orange" },
            Ana: { tone: "green", solid: true },
            Leeds: { tone: "orange" },
          },
          edges: {
            "Ana>Ben": { tone: "green", label: 1, w: 1.4, labelSide: -1 },
            "Ben>Cy": { tone: "blue", k: 0.6 },
            "Ana>Leeds": { tone: "orange", label: 1, labelSide: 1 },
            "Cy>Acme": { tone: "purple", label: 1, dash: true, labelSide: 1 },
            "Eli>Acme": { tone: "grey", label: 1 },
            "Cy>Dee": { tone: "red", label: 0 },
          },
        });
        tok.set(g.edgePt("Ana>Ben", ramp(t, 0, 2, E.inOut)));
      };
    },
  });

  // T5: hops
  V.scene({
    kicker: "TEST 5",
    title: ["Friends", "of friends"],
    dur: 4,
    build(stage) {
      const xs = [90, 280, 470, 660, 850];
      const nodes = Object.fromEntries(D2.CHAIN.people.map((p, i) => [p, { x: xs[i], y: 40, kind: "person" }]));
      const g = D2.graph(stage, { nodes, edges: D2.CHAIN.friends.map(([a, b]) => [a, b, "FRIEND"]), directed: false });
      const rows = ["Tables", "Documents", "Graph"].map((name, i) => {
        const y = 150 + i * 150;
        D2.card(stage, { x: 0, y, w: 190, h: 90, text: name, tone: "grey" }).set({});
        return [0, 1, 2, 3].map((j) =>
          D2.card(stage, {
            x: 230 + j * 170,
            y,
            w: 140,
            h: 90,
            text: j ? ["join", "fetch", "follow"][i] : "start\nAna",
            tone: i === 0 ? "purple" : i === 1 ? "orange" : "blue",
            plain: false,
          }),
        );
      });
      return (t) => {
        g.update({
          nodes: { Ana: { tone: "blue", solid: true }, Ben: "blue", Cy: "green" },
          edges: { "Ana>Ben": { tone: "blue" } },
        });
        rows.forEach((r) => r.forEach((c, j) => c.set({ k: ramp(t, 0.1 * j, 0.4 + 0.1 * j) })));
      };
    },
  });

  // T6: families
  V.scene({
    kicker: "TEST 6",
    title: ["Four", "families"],
    dur: 4,
    build(stage) {
      const F = D2.FAMILIES;
      const svg = L5.svg(stage);
      const cell = (i) => [(i % 2) * 496, Math.floor(i / 2) * 316];
      const tags = D2.FAMILY_ORDER.map((k, i) => {
        const [x, y] = cell(i);
        const t = D2.tag(stage, { x: x + 62, y, text: F[k].name, tone: "grey" });
        const ic = svg.appendChild(D2.fam(k, 54, "grey"));
        V.place(ic, { x: x + 28, y: y + 29 });
        return t;
      });
      const doc = D2.doc(stage, { x: 0, y: 66, w: 440, title: "recipes", lines: F.doc.lines });
      const kv = D2.table(stage, {
        x: 496,
        y: 66,
        w: 440,
        name: "",
        rows: F.kv.rows.map(([a, b]) => [
          { text: a, tone: "orange" },
          { text: b, tone: "purple" },
        ]),
        widths: [200],
      });
      const wide = F.wide.rows.map((r, i) =>
        D2.table(stage, { x: 0, y: 382 + i * 62, w: 440, name: "", rows: [r.cols.map((c) => c)], widths: [100, 100] }),
      );
      void wide;
      const nodes = {
        Pancakes: [586, 440],
        Waffles: [586, 560],
        Eggs: [830, 400],
        Breakfast: [830, 490],
        Flour: [830, 580],
      };
      const gs = D2.graph(stage, {
        nodes: Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, { x: v[0], y: v[1] }])),
        edges: F.graph.edges,
      });
      return (t) => {
        tags.forEach((tg) => tg.set({}));
        doc.set({ fill: [1, 1, 1] });
        kv.set({});
        wide.forEach((w) => w.set({}));
        gs.update({ edges: { "Pancakes>Flour": { label: 1, labelSide: -1 } } });
        void t;
      };
    },
  });
})();
