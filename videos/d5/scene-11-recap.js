/* Lecture 5 (ds-5) · Partitioning, scene 11-recap: three rows, each a small pictogram and one bold line (bare scene).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row
   (times below are pictogram time), 5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no
   fade, no reset), so for the last 2.5 seconds only Pebble's bob moves.
   Row 1 (blue): split the data into partitions. Twelve text-free blue squares fly into two grey nodes, six into each, and a green
          tick draws on between them.
   Row 2 (purple): ranges keep order, hashes spread load. Two strips of four nodes: under "range" three dots sit together in one node
          (a green tick), under "hash" one dot sits in each of three nodes (a red cross).
   Row 3 (orange): a new node takes whole partitions only. Three nodes hold four grey dots each and a fourth, dashed node is empty; one dot
          from each of the first three hops into it and turns orange; a green tick over it.
   Every count comes from the D5 data (D5.SPLIT, D5.RQ, D5.FIXED), asserted when the scene is built. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const { f1 } = D5;

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4);
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };
  const NEXT = "Next: Workshop 5.W";

  /** a small node card: a sticker box; dashed = a node that is not there yet */
  const nodeBox = (parent, x, y, w, h, dashed = false) =>
    parent.appendChild(
      V.h("div", {
        class: `v-card plain c-${dashed ? "orange" : "grey"}`,
        style: { ...box(x, y, w, h), borderRadius: "14px", borderStyle: dashed ? "dashed" : "solid" },
      }),
    );
  const dot = (parent, size, tone) =>
    D5.chip(parent, { text: "", w: size, h: size, tone, radius: Math.round(size / 2), lip: 3 });

  // ---------- row 1: split the data into partitions ----------
  function splitData(pic) {
    D5.same(
      "recap row 1: twelve orders, two nodes of six",
      [D5.SPLIT.orders.length, D5.SPLIT.orders.length / 2],
      [12, 6],
    );
    const N = D5.SPLIT.orders.length;
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const NODE = [
      { x: 22, y: 56, w: 100, h: 84 },
      { x: 218, y: 56, w: 100, h: 84 },
    ];
    const nodes = NODE.map((n) => nodeBox(pic, n.x, n.y, n.w, n.h));
    NODE.forEach((n) => svg.appendChild(D5.icon.server(n.x + n.w / 2, n.y + 18, 26, "grey")));
    const squares = Array.from({ length: N }, () => dot(pic, 20, "blue"));
    const home = (i) => ({ x: 20 + 26 * i + 10, y: 24 });
    const slot = (i) => {
      const n = NODE[Math.floor(i / 6)];
      const j = i % 6;
      return { x: n.x + 14 + 10 + 28 * (j % 3), y: n.y + 46 + 24 * Math.floor(j / 3) };
    };
    const tick = svg.appendChild(L5.tick(170, 98, 40, "green", { ink: true, w: 8 }));
    return (t) => {
      const q = t - START[0];
      nodes.forEach((n, i) =>
        V.place(n, {
          s: 0.7 + 0.3 * E.pop(ramp(q, 0.1 + 0.1 * i, 0.5 + 0.1 * i, E.lin)),
          o: ramp(q, 0.1 + 0.1 * i, 0.4 + 0.1 * i, E.lin),
        }),
      );
      squares.forEach((c, i) => {
        const appear = D5.appear(ramp(q, 0.1 + 0.02 * i, 0.5 + 0.02 * i, E.lin));
        const f = E.inOut(ramp(q, 1.0 + 0.06 * i, 1.8 + 0.06 * i, E.lin));
        const pos = D5.fly(home(i), slot(i), f, { arc: i % 2 ? 24 : -24 });
        c.set({ x: pos.x, y: pos.y, s: appear.s, o: appear.o, tone: "blue", solid: true });
      });
      const kt = ramp(q, 2.6, 3.1, E.lin);
      L5.drawOn(tick, ramp(kt, 0.2, 1, E.lin));
      V.place(tick, { s: 0.6 + 0.4 * E.pop(kt), o: kt });
    };
  }

  // ---------- row 2: ranges keep order, hashes spread load ----------
  function rangeOrHash(pic) {
    D5.same(
      "recap row 2: a range query asks one node with key ranges and four with hashing",
      [D5.RQ.range.length, D5.RQ.hash.length],
      [1, 4],
    );
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const STRIPS = [
      { y: 8, label: "range", dots: [0, 0, 0] },
      { y: 78, label: "hash", dots: [0, 1, 2] },
    ];
    const X0 = 118;
    const [W, H, G] = [44, 50, 6];
    const strips = STRIPS.map((s) => {
      const label = D5.tag(pic, { x: 0, y: s.y - 4, text: s.label, tone: "purple" });
      const nodes = Array.from({ length: 4 }, (_, i) => nodeBox(pic, X0 + (W + G) * i, s.y, W, H));
      const dots = s.dots.map((n, j) => ({
        chip: dot(pic, 14, "blue"),
        at: {
          x: X0 + (W + G) * n + W / 2,
          y: s.dots.length === 3 && s.label === "range" ? s.y + 11 + 14 * j : s.y + H / 2,
        },
      }));
      return { ...s, label, nodes, dots };
    });
    const tick = svg.appendChild(L5.tick(322, 33, 34, "green", { ink: true, w: 7 }));
    const cross = svg.appendChild(L5.cross(322, 103, 30, "red"));
    return (t) => {
      const q = t - START[1];
      strips.forEach((s, si) => {
        s.label.set({ k: ramp(q, 0.1 + 0.15 * si, 0.5 + 0.15 * si, E.lin) });
        s.nodes.forEach((n, i) => {
          const k = ramp(q, 0.1 + 0.05 * i + 0.15 * si, 0.5 + 0.05 * i + 0.15 * si, E.lin);
          V.place(n, { s: 0.7 + 0.3 * E.pop(k), o: k });
        });
        s.dots.forEach((d, j) => {
          const k = D5.appear(ramp(q, 0.6 + 0.08 * j + 0.1 * si, 1.0 + 0.08 * j + 0.1 * si, E.lin));
          d.chip.set({ x: d.at.x, y: d.at.y, s: k.s, o: k.o, tone: "blue", solid: true });
        });
      });
      const kt = ramp(q, 1.8, 2.3, E.lin);
      L5.drawOn(tick, ramp(kt, 0.2, 1, E.lin));
      V.place(tick, { s: 0.6 + 0.4 * E.pop(kt), o: kt });
      const kc = ramp(q, 2.6, 3.1, E.lin);
      L5.drawOn(cross, kc);
      V.place(cross, { s: 0.6 + 0.4 * E.pop(kc), o: kc });
    };
  }

  // ---------- row 3: a new node takes whole partitions only ----------
  function newNode(pic) {
    D5.same(
      "recap row 3: the new node steals three whole partitions",
      [D5.FIXED.moved, D5.FIXED.steals.length],
      [3, 3],
    );
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const XS = [4, 90, 176, 262];
    const [W, H, Y] = [70, 62, 50];
    const nodes = XS.map((x, i) => nodeBox(pic, x, Y, W, H, i === 3));
    // four grey dots in each of the first three nodes; the last of each hops to the new node
    const dotAt = (n, j) => ({ x: XS[n] + 20 + 30 * (j % 2), y: Y + 20 + 24 * Math.floor(j / 2) });
    const dots = [0, 1, 2].map((n) => Array.from({ length: 4 }, (_, j) => ({ n, j, chip: dot(pic, 14, "grey") })));
    const dest = (i) => ({ x: XS[3] + 20 + 30 * (i % 2), y: Y + 20 + 24 * Math.floor(i / 2) });
    const tick = svg.appendChild(L5.tick(XS[3] + W / 2, 24, 38, "green", { ink: true, w: 8 }));
    return (t) => {
      const q = t - START[2];
      nodes.forEach((n, i) => {
        const k = ramp(q, 0.1 + 0.08 * i, 0.5 + 0.08 * i, E.lin);
        V.place(n, { s: 0.7 + 0.3 * E.pop(k), o: k });
      });
      dots.forEach((row, n) =>
        row.forEach((d) => {
          const k = D5.appear(ramp(q, 0.4 + 0.04 * (n * 4 + d.j), 0.8 + 0.04 * (n * 4 + d.j), E.lin));
          const moves = d.j === 3;
          const s0 = 1.2 + 0.4 * n;
          const f = moves ? E.inOut(ramp(q, s0, s0 + 0.7, E.lin)) : 0;
          const pos = moves ? D5.fly(dotAt(d.n, d.j), dest(n), f, { arc: -30 }) : dotAt(d.n, d.j);
          const orange = moves && f > 0;
          d.chip.set({
            x: pos.x,
            y: pos.y,
            s: k.s * (moves ? 1 + 0.2 * flash(q, s0 + 0.7, s0 + 1.0) : 1),
            o: k.o,
            tone: orange ? "orange" : "grey",
            solid: orange,
          });
        }),
      );
      const kt = ramp(q, 3.0, 3.5, E.lin);
      L5.drawOn(tick, ramp(kt, 0.2, 1, E.lin));
      V.place(tick, { s: 0.6 + 0.4 * E.pop(kt), o: kt });
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      // 30 px like the title card's kicker (the engine's default .v-kicker is 28 px)
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP", style: { fontSize: "30px" } });
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "Split the data\ninto partitions", splitData],
        ["purple", "Ranges keep order,\nhashes spread load", rangeOrHash],
        ["orange", "New node? Move whole\npartitions only", newNode],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: NEXT,
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 904, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
