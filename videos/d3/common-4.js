/* Lecture 3 · Storage and retrieval: the merge rig and the memtable tree (VID.d3, short name D3). Needs l5/common.js and d3/common.js to
   common-3.js loaded first. Positions are the parent's pixels (stage 936 x 640). EVERY CALL IS PURE: call update()/set() every frame.

   1. THE MERGE RIG (scene 8): three sorted segments (oldest left) and the merged output, with the pointers walking down.
        const m = D3.mergeRig(parent, {x: 35, y: 10, colW: 200, gap: 22, rowH: 52, rowGap: 10, segs: D3.MERGE.segs, merge: D3.MERGE});
        m.update({p, k: 1, o: 1})
            p = progress through the steps, 0..5 (D3.MERGE.frames.length): p = 0 only shows the segments; step i runs from p = i to i + 1:
            f 0-0.25 the head of every segment gets a blue ring, f 0.28 the records holding the smallest key turn blue, f 0.5 the newest
            copy turns green (a tombstone winner turns red) and the older copies red, f 0.55-1 the winner flies into the merged column
            (nothing flies for a tombstone), f 0.96 the used records become dashed ghosts. k 0..1 pops headings and records in (columns
            one after another), o fades the whole rig.
        m.info(p) -> {step, f, frame (D3.MERGE.frames[step] or null when done), done}   for captions and tags (frame.key = smallest key)
        m.chip(s, i) -> {x, y} centre of record i of segment s;  m.outSlot(j) -> centre of merged slot j;  m.colX(c), m.width, m.height
        The headings "segment 1/2/3" and "merged" and an "older -> newer" arrow under the three segments are part of the rig.
   2. THE MEMTABLE TREE (scene 10): a binary tree whose nodes sit left to right in SORTED order (so walking it in order is a sweep).
        const t = D3.tree(parent, {x, y, nodes: D3.MEM.nodes, nodeW: 156, nodeH: 52, gap: 12, levelH: 84, tone: "purple", fs: 28});
        t.set(i, {tone, solid, ring, ringK, k, x, y, s, o, fly: {from: {x, y}, f}})   i = node index (insertion order = D3.MEM.writes order);
            fly moves the node along from -> root -> ... -> its own place (f 0..1), so a write "travels down the tree".
        t.edge(i, {k, o, tone})     the line from the parent of node i down to it (k draws it on)
        t.mid(i), t.top(i), t.bottom(i) -> {x, y} in PARENT coordinates;  t.route(i) -> points root .. node i;  t.walk (sorted node order)
        t.width, t.height, t.el */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { clamp, lerp, ease: E } = V;
  const { abs, tn } = D3;

  function mergeRig(parent, o = {}) {
    const { x = 35, y = 10, colW = 200, gap = 22, rowH = 52, rowGap = 10 } = o;
    const merge = o.merge || D3.MERGE;
    const segs = o.segs || merge.segs;
    const { frames, out, stepOf } = merge;
    const nF = frames.length;
    const colX = (c) => x + c * (colW + gap);
    const top = y + 62;
    const rows = Math.max(...segs.map((s) => s.length), out.length);
    const bottom = top + rows * rowH + (rows - 1) * rowGap;
    const root = V.h("div", { style: abs(0, 0, 936, 640) });
    parent.append(root);
    const heads = ["segment 1", "segment 2", "segment 3", "merged"].map((text, c) =>
      D3.tag(root, { x: colX(c) + (colW - D3.tagW(text)) / 2, y, text, tone: c === 3 ? "green" : "grey", solid: c === 3 }),
    );
    const cols = segs.map((s, c) => D3.recs(root, { x: colX(c), y: top, w: colW, h: rowH, gap: rowGap, recs: s }));
    const outCol = D3.recs(root, { x: colX(3), y: top, w: colW, h: rowH, gap: rowGap, recs: out });
    const svg = L5.svg(root);
    const arrowY = bottom + 44;
    const age = svg.appendChild(L5.arrow(colX(0) + 120, arrowY, colX(2) + colW - 120, arrowY, "grey", 1, { w: 6, head: 18 }));
    const older = D3.tag(root, { x: colX(0), y: arrowY - 29, text: "older", tone: "grey" });
    const newer = D3.tag(root, { x: colX(2) + colW - D3.tagW("newer"), y: arrowY - 29, text: "newer", tone: "grey", solid: true });
    const info = (p) => {
      const done = p >= nF;
      const step = done ? nF : clamp(Math.floor(p), 0, nF - 1);
      return { step, f: done ? 1 : clamp(p - step), frame: done ? null : frames[step], done };
    };
    const outStep = out.map((_, j) => frames.findIndex((f) => f.outIndex === j));
    function update({ p = 0, k = 1, o: op = 1 } = {}) {
      const { step, f, frame, done } = info(p);
      V.show(root, op);
      const kc = (c, i) => clamp((k - c * 0.14 - i * 0.04) / 0.45);
      heads.forEach((h, c) => h.set({ k: clamp((k - c * 0.1) / 0.3) }));
      const ak = clamp((k - 0.55) / 0.4);
      L5.drawOn(age, ak);
      older.set({ k: ak });
      newer.set({ k: ak });
      segs.forEach((seg, s) =>
        cols[s].all((i) => {
          const used = stepOf[s][i];
          const gone = done || used < step || (used === step && f >= 0.96);
          const st = { k: kc(s, i) };
          if (gone) {
            const loser = frames[used].drop.some(([a, b]) => a === s && b === i) || frames[used].tomb;
            return { ...st, ghost: true, tone: loser ? "red" : "grey" };
          }
          const head = frame.heads[s] === i;
          const ring = head ? "blue" : undefined;
          const ringK = clamp(f / 0.25);
          if (used !== step) return { ...st, ring, ringK };
          let tone = "grey";
          let solid = false;
          if (f >= 0.28) tone = "blue";
          if (f >= 0.5) {
            const win = frame.who.length && s === frame.win;
            tone = win && !frame.tomb ? "green" : "red";
            solid = win;
          }
          return { ...st, tone, solid, ring, ringK, s: 1 + 0.08 * V.flash(f, 0.5, 0.75) };
        }),
      );
      outCol.all((j) => {
        const fi = outStep[j];
        const q = clamp((p - (fi + 0.55)) / 0.45);
        const from = cols[frames[fi].take[0]].mid(frames[fi].take[1]);
        const to = outCol.mid(j);
        const e = E.inOut(q);
        return {
          k: q > 0 ? Math.max(0.05, clamp(q * 3)) : 0,
          x: (from.x - to.x) * (1 - e),
          y: (from.y - to.y) * (1 - e),
          tone: "green",
          solid: p < fi + 1.3,
        };
      });
    }
    return {
      update,
      info,
      chip: (s, i) => cols[s].mid(i),
      outSlot: (j) => outCol.mid(j),
      colX,
      width: 4 * colW + 3 * gap,
      height: arrowY + 20 - y,
      el: root,
    };
  }

  function tree(parent, o = {}) {
    const { x = 0, y = 0, nodeW = 156, nodeH = 52, gap = 12, levelH = 84, tone = "purple", fs = 28 } = o;
    const nodes = o.nodes || D3.MEM.nodes;
    const depth = Math.max(...nodes.map((n) => n.depth)) + 1;
    const width = nodes.length * nodeW + (nodes.length - 1) * gap;
    const height = (depth - 1) * levelH + nodeH;
    const el = V.h("div", { style: abs(x, y, width, height) });
    parent.append(el);
    const svg = L5.svg(el, width, height);
    const px = (i) => nodes[i].rank * (nodeW + gap);
    const py = (i) => nodes[i].depth * levelH;
    const mid = (i) => ({ x: x + px(i) + nodeW / 2, y: y + py(i) + nodeH / 2 });
    const edges = nodes.map((n, i) => {
      if (n.parent < 0) return null;
      const [a, b] = [mid(n.parent), mid(i)];
      const g = V.s(
        "g",
        {},
        V.s("path", {
          d: `M ${a.x - x} ${a.y - y + nodeH / 2} L ${b.x - x} ${b.y - y - nodeH / 2}`,
          fill: "none",
          pathLength: "1",
          "data-draw": "1",
          "stroke-width": 6,
          "stroke-linecap": "round",
          style: { stroke: D3.tone(tn(tone)).edge },
        }),
      );
      svg.append(g);
      return g;
    });
    const cells = nodes.map((n, i) => D3.recCell(el, { x: px(i), y: py(i), w: nodeW, h: nodeH, fs, tone, rec: n }));
    const route = (i) => [...nodes[i].route, i].map(mid);
    return {
      el,
      width,
      height,
      walk: [...nodes.keys()].sort((a, b) => nodes[a].rank - nodes[b].rank),
      mid,
      top: (i) => ({ x: mid(i).x, y: y + py(i) }),
      bottom: (i) => ({ x: mid(i).x, y: y + py(i) + nodeH }),
      route,
      edge(i, st = {}) {
        const g = edges[i];
        if (!g) return;
        g.querySelector("path").style.stroke = D3.tone(tn(st.tone || tone)).edge;
        L5.drawOn(g, st.k ?? 1);
        V.show(g, st.o ?? 1);
      },
      set(i, st = {}) {
        let [dx, dy] = [st.x || 0, st.y || 0];
        if (st.fly) {
          const pos = D3.along([st.fly.from, ...route(i)], st.fly.f);
          dx += pos.x - mid(i).x;
          dy += pos.y - mid(i).y;
        }
        cells[i].set({ ...st, x: dx, y: dy, tone: st.tone || tone });
      },
    };
  }
  Object.assign(D3, { mergeRig, tree, lerp });
})();
