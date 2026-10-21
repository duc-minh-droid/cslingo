/* Lecture 3 (ds-3) · scene 10 (MEMTABLE): the write path and the read path of an SSTable store (lesson 3.3 "Keeping it sorted while
   writing", "The write path", "The read path", the fruit keys). Writes arrive in any order and land in the MEMTABLE: a sorted tree
   IN MEMORY (purple) where a smaller key goes left and a bigger key goes right, so the nodes read left to right in sorted order.
   When it is full (5 records), the tree is read in order and written out to disk as a NEW SSTABLE, the newest segment (a flush),
   while new writes go to a fresh memtable. A get checks the memtable first, then the newest segment, then older ones, and stops
   at the first hit: the newest copy wins. The starting picture is the merged segment of scene 8 (apple 5, fig 8, mango 7, plum 9);
   every tree, walk, flushed record and read path comes from D3.MEM (D3.buildTree, D3.readPath, asserted when the page loads) and is
   checked again below against an independent rule. Words are defined where they first appear: the purple panel title "memtable: a
   sorted tree in memory", the orange tag "full: flush to disk" (flush = write it to disk), the dashed panel "new SSTable", and the
   tags "miss: not here" / "hit: fig = 11". Colours: purple = memory (the memtable), blue = a write on its way in, the ring that
   reads the tree and the get, green = the newest segment and the hit, red = a miss, orange = the full memtable, grey = older data
   on disk.
   Story (local seconds): 0.0 the memory panel, the dashed slot of the new SSTable and the existing SSTable (green: it is the
   newest) are there, 0.4 the blue tag "writes in any order"; WRITES: five blue records fly in from the left to the root and down
   the tree (kiwi, fig, plum, apple, grape), each settles purple and draws its edge; 1.7 and 2.4 the tags "before" and "after" say
   where a key goes; 4.3 the orange tag "full: flush to disk"; FLUSH 5.2-7.3: a blue ring reads the nodes in sorted order, left
   to right, and a copy of each drops into the new SSTable (dashed slots fill, it turns green and becomes "newest segment", the
   old one turns grey "older segment"); 7.45 the tree fades, 7.8 the purple tag "new memtable", 7.9-8.4 date 15 flies into the
   fresh memtable; READ 9.5-: the blue tag "get fig", a blue ring on the memory panel, 10.3 the red cross and "miss: not here"
   (the memtable only holds date), 11.1-11.55 the ring glides down to the newest segment, 11.8 fig 11 turns solid green with a
   green tick and "hit: fig = 11", 12.3 the grey tag "fig 8: never read"; hold to the end (14.6 s, 0.1 s over the storyboard). */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (the real tree, flush and read path, asserted against the storyboard, the lesson and an independent rule) ----------
  const M = D3.MEM;
  const FIG = M.getFig;
  const byKey = (a, b) => (a.k < b.k ? -1 : 1);
  D3.same("memtable scene: five writes fill the memtable", [M.writes.length, M.limit], [5, 5]);
  D3.same(
    "memtable scene: the writes arrive in no particular order",
    M.writes.map((r) => r.k).join() ===
      [...M.writes]
        .sort(byKey)
        .map((r) => r.k)
        .join(),
    false,
  );
  // independent rule: insert into a plain binary tree (smaller key left, bigger key right) and read it in order
  const insert = (node, r) => {
    if (!node) return { r, l: null, g: null };
    if (r.k < node.r.k) node.l = insert(node.l, r);
    else node.g = insert(node.g, r);
    return node;
  };
  const inOrder = (n) => (n ? [...inOrder(n.l), n.r, ...inOrder(n.g)] : []);
  const ROOT = M.writes.reduce(insert, null);
  D3.same("memtable scene: reading the tree in order is the sorted list", inOrder(ROOT), [...M.writes].sort(byKey));
  D3.same("memtable scene: that sorted list is the flushed SSTable", M.flushed, inOrder(ROOT));
  D3.same(
    "memtable scene: walking the nodes in sorted order gives the flushed records",
    M.walk.map((i) => ({ k: M.nodes[i].k, v: M.nodes[i].v })),
    M.flushed,
  );
  D3.same(
    "memtable scene: the root is the first write and a smaller key sits left of its parent",
    [M.nodes[0].k, M.nodes.every((n) => n.parent < 0 || (n.side === "L") === n.k < M.nodes[n.parent].k)],
    [M.writes[0].k, true],
  );
  D3.same(
    "memtable scene: the tree reads left to right in sorted order (the rank is the column)",
    M.walk.map((i) => M.nodes[i].rank),
    [0, 1, 2, 3, 4],
  );
  const OLD = M.old;
  const FIG_NEW = M.flushed.findIndex((r) => r.k === FIG.k);
  const FIG_OLD = OLD.findIndex((r) => r.k === FIG.k);
  // independent rule: the places in the order a get looks at them (memtable, newest segment, older segment): the first one with the key
  const PLACES = [[M.next], M.flushed, OLD];
  const HIT = PLACES.findIndex((p) => p.some((r) => r.k === FIG.k));
  D3.same(
    "memtable scene: get fig misses the fresh memtable, hits the newest segment (2 checks) and never reads the older fig",
    [FIG.checks, FIG.path.map((p) => p.hit), FIG.value, HIT + 1, PLACES[HIT][FIG_NEW].v, OLD[FIG_OLD].v],
    [2, [false, true], 11, 2, 11, 8],
  );
  D3.same(
    "memtable scene: the older segment is the merged segment of scene 8 and holds a fig of its own",
    [OLD, FIG_OLD >= 0, FIG_NEW === FIG_OLD],
    [D3.MERGE.out, true, true],
  );

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12; the rings reach 8 px beyond a panel) ----------
  const PX = 22; // the three panels share this left edge and width
  const PW = 892;
  const RIGHT = PX + PW - 24; // the right end of every tag in a panel's title row
  const NODE = { w: 156, gap: 12, h: 52 };
  const COL = NODE.w + NODE.gap;
  const TREE = { x: PX + (PW - (M.nodes.length * NODE.w + (M.nodes.length - 1) * NODE.gap)) / 2, y: 96, levelH: 80 };
  const MEM = { y: 20, h: 306 };
  const SEG = { h: 116, row: 54 }; // a segment panel: its title row, then the records 54 px below its top
  const NEW = { y: 350 };
  const OLD_Y = 490;
  const FROM = { x: PX + 108, y: TREE.y + NODE.h / 2 }; // where a write comes in: left of the tree, level with the root
  const ROOT_COL = M.nodes[0].rank; // the old root's column: the fresh memtable starts there
  const TAGH = 58;
  const pillW = (text) => D3.tagW(text) + 28; // D3.tagW is a little short for bold text (measured)
  const TXT = {
    mem: "memtable: a sorted tree in memory",
    writes: "writes in any order",
    order: "A to Z, left to right",
    full: "full: flush to disk",
    fresh: "new memtable",
    get: `get ${FIG.k}`,
    miss: "miss: not here",
    hit: `hit: ${FIG.k} = ${FIG.value}`,
    never: `${FIG.k} ${OLD[FIG_OLD].v}: never read`,
    fresh0: "disk: new SSTable",
    fresh1: "disk: newest segment",
    old0: "disk: SSTable",
    old1: "disk: older segment",
  };
  D3.same(
    "memtable scene: the three panels and their rings fit the stage with the 12 px margin",
    [
      PX - 8 >= 12 && PX + PW + 8 <= 924,
      MEM.y - 8 >= 12 && OLD_Y + SEG.h + 6 + 8 <= 628,
      MEM.y + MEM.h + 6 + 8 < NEW.y - 8 && NEW.y + SEG.h + 6 + 8 < OLD_Y - 8,
      TREE.x >= PX + 16 && TREE.x + 5 * NODE.w + 4 * NODE.gap <= PX + PW - 16,
      TREE.y >= MEM.y + 4 + TAGH + 8 && TREE.y + 2 * TREE.levelH + NODE.h + 6 <= MEM.y + MEM.h - 8,
    ],
    Array(5).fill(true),
  );

  // ---------- timeline ----------
  const T = { w0: 0.4, gap: 0.12, flush: 0.4, ring: 5.2, dep: 0.12, fly: 0.38 };
  // write i flies in (0.5 s + 0.1 s per level it has to walk down), then settles
  const WRITE = [];
  let at = T.w0;
  M.nodes.forEach((n) => {
    const dur = 0.5 + 0.1 * n.depth;
    WRITE.push({ s: at, land: at + dur });
    at += dur + T.gap;
  });
  const LAST = WRITE[WRITE.length - 1].land;
  const SIDE = M.nodes.findIndex((n) => n.side === "R"); // the first key that goes right of the root: the tree now has two sides
  T.full = LAST + 0.35; // "full: flush to disk"
  T.order = [WRITE[SIDE].land + 0.05, T.full - 0.05]; // "A to Z, left to right" (after "writes in any order")
  const STEP = T.flush; // the ring reads one node every 0.4 s
  const READ = M.walk.map((_, j) => T.ring + STEP * j); // the ring reaches the j-th node of the sorted walk
  const DROP = READ.map((a) => a + T.dep); // its copy leaves the node ...
  const LAND = DROP.map((a) => a + T.fly); // ... and lands in the new SSTable
  T.sw = LAND[0]; // the first record lands: the new SSTable is now the newest segment
  T.fade = [LAND[LAND.length - 1] + 0.15, LAND[LAND.length - 1] + 0.45]; // the old tree fades
  T.fresh = T.fade[1] + 0.05; // "new memtable"
  T.date = { s: T.fresh + 0.1, land: T.fresh + 0.6 }; // the next write flies into it
  T.get = 9.5; // "get fig"
  T.ringR = 9.8; // the blue ring on the memory panel
  T.miss = 10.3;
  T.glide = [11.1, 11.55]; // the ring glides down to the newest segment
  T.hit = 11.8;
  T.never = 12.3;
  const DUR = 14.6;
  D3.same(
    "memtable scene: the order of events",
    [
      WRITE.every((w, i) => !i || w.s >= WRITE[i - 1].land), // one write at a time
      T.order[0] + 1.2 <= T.order[1] && T.order[0] <= LAST && T.order[1] <= T.full,
      T.full >= LAST && T.full + 0.6 <= T.ring,
      READ.every((a, j) => !j || a - READ[j - 1] >= STEP - 1e-9) &&
        DROP.every((d, j) => d + T.fly <= READ[j] + STEP + 0.2),
      T.fade[0] >= LAND[LAND.length - 1] && T.fresh >= T.fade[1] && T.date.s > T.fresh && T.date.land + 0.4 <= T.get,
      T.get <= T.ringR && T.ringR < T.miss && T.miss + 0.5 <= T.glide[0] && T.glide[1] <= T.hit,
      T.hit < T.never && T.never + 1.6 <= DUR,
    ],
    Array(7).fill(true),
  );

  function build(stage) {
    // ---- the three panels: memory (purple), the new SSTable (a dashed slot until the first record lands), the existing SSTable ----
    const mem = D3.panel(stage, { x: PX, y: MEM.y, w: PW, h: MEM.h, tone: "purple", plain: true, title: TXT.mem });
    const fresh = D3.panel(stage, { x: PX, y: NEW.y, w: PW, h: SEG.h, tone: "grey", plain: true, title: TXT.fresh0 });
    const old = D3.panel(stage, { x: PX, y: OLD_Y, w: PW, h: SEG.h, tone: "grey", plain: true, title: TXT.old0 });
    const rowOf = (y, recs, tone) =>
      D3.recs(stage, {
        x: TREE.x,
        y: y + SEG.row,
        w: NODE.w,
        h: NODE.h,
        gap: 8,
        colGap: NODE.gap,
        cols: recs.length,
        recs,
        tone,
      });
    const slots = rowOf(
      NEW.y,
      M.flushed.map(() => ({})),
      "grey",
    ); // the five dashed places the new SSTable will fill
    const oldRow = rowOf(OLD_Y, OLD, "green");
    const newRow = rowOf(NEW.y, M.flushed, "green");

    // ---- the memtable: the tree of the five writes, then the fresh one with the next write (in the old root's column) ----
    const treeOpts = { y: TREE.y, nodeW: NODE.w, nodeH: NODE.h, gap: NODE.gap, levelH: TREE.levelH };
    const tree = D3.tree(stage, { ...treeOpts, x: TREE.x, nodes: M.nodes });
    const tree2 = D3.tree(stage, { ...treeOpts, x: TREE.x + ROOT_COL * COL, nodes: D3.buildTree([M.next]) });

    // ---- the tags: the right end of a panel's title row (one message at a time), and the "get fig" request ----
    const msg = (text, tone, solid, y, a, b, h) => {
      const w = pillW(text);
      const tag = D3.tag(stage, { x: RIGHT - w, y, text, tone, solid, h });
      tag.el.style.width = `${w}px`;
      D3.same(
        `memtable scene: "${text}" leaves room for the panel title`,
        RIGHT - w > PX + 20 + 15 * TXT.mem.length,
        true,
      );
      return (t, bump = 0) =>
        tag.set({ k: Math.min(ramp(t, a, a + 0.3, E.lin), 1 - ramp(t, b - 0.2, b, E.lin)), s: 1 + 0.06 * bump });
    };
    const memY = MEM.y + 4;
    const tags = {
      writes: msg(TXT.writes, "blue", false, memY, 0.4, T.order[0]),
      order: msg(TXT.order, "purple", false, memY, T.order[0], T.order[1]),
      full: msg(TXT.full, "orange", true, memY, T.full, T.fade[1]),
      fresh: msg(TXT.fresh, "purple", true, memY, T.fresh, T.get),
      miss: msg(TXT.miss, "red", true, memY, T.miss, 999),
      hit: msg(TXT.hit, "green", true, NEW.y + 4, T.hit, 999, 46),
      never: msg(TXT.never, "grey", false, OLD_Y + 4, T.never, 999, 46),
    };
    const getTag = D3.tag(stage, { x: TREE.x, y: TREE.y + NODE.h / 2 - TAGH / 2, text: TXT.get, tone: "blue" });

    // ---- the blue ring of the get (one on the memory panel, then one on the newest segment) and the cross / tick ----
    const mkRing = (rect) => {
      const el = V.h("div", {
        style: {
          ...D3.abs(PX - 8, rect.y - 8, PW + 16, rect.h + 16),
          boxSizing: "border-box",
          border: "5px solid",
          borderRadius: "34px",
          visibility: "hidden",
        },
      });
      el.style.borderColor = D3.tone("blue").c;
      stage.append(el);
      return el;
    };
    const ringMem = mkRing({ y: MEM.y, h: MEM.h });
    const ringNew = mkRing({ y: NEW.y, h: SEG.h });
    const layer = L5.svg(stage);
    const iconY = (y) => y + 33;
    const crossAt = { x: RIGHT - pillW(TXT.miss) - 36, y: iconY(MEM.y) };
    const tickAt = { x: RIGHT - pillW(TXT.hit) - 36, y: iconY(NEW.y + 4 - 4) };
    const cross = layer.appendChild(L5.cross(crossAt.x, crossAt.y, 44, "red", { w: 8 }));
    const tick = layer.appendChild(L5.tick(tickAt.x, tickAt.y, 44, "green", { w: 8 }));

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);

      // ---- the panels ----
      const first = 0.3 + 0.7 * k(0, 0.4);
      mem.set({ k: first, title: TXT.mem });
      const isNew = t >= T.sw; // the dashed slot becomes the newest segment, the existing SSTable becomes an older one
      const swap = flash(t, T.sw, T.sw + 0.4);
      fresh.set({
        k: first,
        tone: isNew ? "green" : "grey",
        title: isNew ? TXT.fresh1 : TXT.fresh0,
        s: 1 + 0.03 * swap,
      });
      Object.assign(fresh.el.style, {
        borderStyle: isNew ? "" : "dashed",
        boxShadow: isNew ? "" : "none",
        background: isNew ? "" : "transparent",
      });
      old.set({ k: first, title: isNew ? TXT.old1 : TXT.old0 });
      oldRow.all((i) => ({ k: D3.seq(t, 0.1, 0.07, 0.3, i), tone: isNew ? "grey" : "green" }));
      slots.all((j) => ({ ghost: true, k: first, o: 1 - ramp(t, LAND[j] - 0.1, LAND[j], E.lin) }));

      // ---- the memtable: the writes fly in and walk down the tree; then the flush reads it in order; then it fades ----
      const gone = ramp(t, T.fade[0], T.fade[1], E.lin);
      M.nodes.forEach((n, i) => {
        const w = WRITE[i];
        const j = M.walk.indexOf(i);
        const flying = t < w.land;
        const reading = t >= READ[j] && t < READ[j] + STEP;
        const dropped = t >= DROP[j] + 0.05;
        const st = {
          k: ramp(t, w.s, w.s + 0.15, E.lin),
          fly: { from: FROM, f: ramp(t, w.s + 0.05, w.land, E.inOut) },
          tone: flying || (reading && !dropped) ? "blue" : "purple",
          solid: flying,
          ghost: dropped,
          o: 1 - gone,
          s: 1 + 0.08 * flash(t, w.land, w.land + 0.3),
        };
        if (reading) {
          const ringK = Math.min(
            ramp(t, READ[j], READ[j] + 0.1, E.lin),
            1 - ramp(t, READ[j] + STEP - 0.08, READ[j] + STEP, E.lin),
          );
          Object.assign(st, { ring: "blue", ringK });
        }
        tree.set(i, st);
        tree.edge(i, { k: ramp(t, w.land - 0.3, w.land, E.lin), o: 1 - gone });
      });
      const dFly = t < T.date.land;
      tree2.set(0, {
        k: ramp(t, T.date.s, T.date.s + 0.15, E.lin),
        fly: { from: FROM, f: ramp(t, T.date.s + 0.05, T.date.land, E.inOut) },
        tone: dFly ? "blue" : "purple",
        solid: dFly,
        s: 1 + 0.08 * flash(t, T.date.land, T.date.land + 0.3),
      });

      // ---- the new SSTable: a copy of each node drops straight down into its column, in sorted order ----
      newRow.all((j) => {
        const from = tree.mid(M.walk[j]);
        const to = newRow.mid(j);
        const e = E.out(ramp(t, DROP[j], LAND[j], E.lin));
        const landed = t >= LAND[j];
        const st = {
          k: t >= DROP[j] ? ramp(t, DROP[j], DROP[j] + 0.1, E.lin) : 0,
          x: (from.x - to.x) * (1 - e),
          y: (from.y - to.y) * (1 - e),
          tone: landed ? "green" : "blue",
          solid: !landed,
          s: 1 + 0.06 * flash(t, LAND[j], LAND[j] + 0.3),
        };
        if (j === FIG_NEW && t >= T.hit)
          Object.assign(st, { tone: "green", solid: true, s: 1 + 0.08 * flash(t, T.hit, T.hit + 0.3) });
        return st;
      });

      // ---- the tags ----
      tags.writes(t);
      tags.order(t);
      tags.full(t, flash(t, T.full, T.full + 0.3));
      tags.fresh(t, flash(t, T.fresh, T.fresh + 0.3));
      tags.miss(t, flash(t, T.miss, T.miss + 0.3));
      tags.hit(t, flash(t, T.hit + 0.1, T.hit + 0.4));
      tags.never(t);
      getTag.set({ k: k(T.get, 0.3), s: 1 + 0.05 * flash(t, T.get, T.get + 0.3) });

      // ---- the get: the ring on the memory panel glides down to the newest segment; the red cross, the green tick ----
      const rk = Math.min(ramp(t, T.ringR, T.ringR + 0.25, E.lin), 1 - ramp(t, T.glide[0], T.glide[0] + 0.2, E.lin));
      V.place(ringMem, { s: 0.96 + 0.04 * E.pop(ramp(t, T.ringR, T.ringR + 0.25, E.lin)), o: rk });
      const nk = ramp(t, T.glide[0] + 0.2, T.glide[1], E.lin);
      V.place(ringNew, { s: 0.96 + 0.04 * E.pop(nk), o: nk });
      const ck = ramp(t, T.miss, T.miss + 0.3, E.lin);
      L5.drawOn(cross, ck);
      V.place(cross, { ...D3.pop(ck), o: ck });
      const tk = ramp(t, T.hit, T.hit + 0.3, E.lin);
      L5.drawOn(tick, tk);
      V.place(tick, { ...D3.pop(tk), o: tk });
    };
  }

  V.scene({
    kicker: "MEMTABLE",
    title: ["Writes land in memory,", "then reach disk sorted"],
    dur: DUR,
    caps: [
      [0.85, 2.85, "Writes land in memory first."],
      [2.95, 5.1, "A tree keeps the keys in order."],
      [5.3, 7.5, "When full, write it out in order."],
      [8.0, 9.9, "New writes get a new memtable."],
      [10.0, 12.1, "Reads check memory, then newest."],
      [12.4, 14.3, "First hit wins: fig 11, not 8."],
    ],
    build,
  });
})();
