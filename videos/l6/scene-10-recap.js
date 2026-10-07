/* Lecture 6 video: recap. Four rows, each with a small animated pictogram and one short bold line: the tree, cut and paste
   (the swap happens once and ends in a clean state), fitness, and picking the right parts first. */
VID.scene({
  bare: true,
  dur: 9,
  build(stage, V) {
    const { h, place, ramp, ease } = V;
    const L = V.l6;
    const BOX = { w: 190, h: 136 };

    const head = h("div", {
      class: "v-title-line",
      text: "Remember",
      style: { position: "absolute", left: "72px", top: "96px", fontSize: "76px" },
    });
    const mascot = V.mascot("sprout", { size: 150, mood: "happy" });
    mascot.style.left = "858px";
    mascot.style.top = "70px";
    stage.append(head, mascot);

    const makeRow = (i, tone, text) => {
      const card = h("div", {
        class: `v-card plain c-${tone}`,
        style: { left: "72px", top: `${240 + i * 176}px`, width: "936px", height: "160px" },
      });
      const box = h("div", {
        style: { position: "absolute", left: "26px", top: "12px", width: "190px", height: "136px" },
      });
      const label = h("div", {
        class: "v-text big",
        text,
        style: {
          left: "250px",
          top: "0",
          width: "650px",
          height: "154px",
          display: "flex",
          alignItems: "center",
          whiteSpace: "normal",
          lineHeight: "1.15",
          fontSize: "44px",
        },
      });
      card.append(box, label);
      stage.append(card);
      return { card, box, label, at: 1 + i * 1.1 };
    };
    const rows = [
      makeRow(0, "purple", "A program is a tree"),
      makeRow(1, "blue", "Cut and paste subtrees"),
      makeRow(2, "green", "Fitness: run it, measure the error"),
      makeRow(3, "orange", "Pick the right parts first"),
    ];

    // 1. a mini tree that grows node by node
    const treeRoot = L.parse("(+ (* X X) 1)");
    const t1 = L.tree(rows[0].box, { root: treeRoot, x: 0, y: 0, w: BOX.w, h: BOX.h, node: 34, rows: 1.5, room: 0 });

    // 2. two trees swap a subtree, scissors snip first
    const treeA = L.parse("(+ X#a1 1#a2)");
    const treeB = L.parse("(* 2#b1 X#b2)");
    const trA = L.tree(rows[1].box, { root: treeA, x: 0, y: 24, w: 88, h: 112, node: 34, rows: 1.8, room: 0 });
    const trB = L.tree(rows[1].box, { root: treeB, x: 102, y: 24, w: 88, h: 112, node: 34, rows: 1.8, room: 0 });
    const scis = L.scissors(40, "orange");
    rows[1].box.append(scis);
    const pa = trA.pos("a2");
    const pb = trB.pos("b1");
    const move = { dx: pb.x - pa.x, dy: pb.y - pa.y };

    // 3. a plot with the target, a program and the shaded gap between them
    const plot = L.plot(rows[2].box, { x: 0, y: 0, w: BOX.w, h: BOX.h, ymin: 0, ymax: 3.2, frame: false });
    const prog = L.parse("(+ X 1)");
    const cTarget = plot.curve(L.TARGET, "green", 1, { w: 6 });
    const cProg = plot.curve(prog, "blue", 1, { w: 6 });
    const gap = plot.gap(prog, L.TARGET, "red", 1);

    // 4. the parts: terminals and functions pop in, and the multiply tile joins last
    const partsSpec = [
      ["X", 28, 36, "blue"],
      ["1", 82, 36, "blue"],
      ["+", 28, 100, "purple"],
      ["*", 82, 100, "purple"],
    ];
    const parts = partsSpec.map(([label, x, y, tn]) => ({
      tile: L.tile(rows[3].box, label, { size: 44, tone: tn }),
      x,
      y,
    }));
    const partsNew = L.tile(rows[3].box, "-", { size: 44, tone: "purple" });

    return (t) => {
      place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
      place(mascot, { s: 0.7 + 0.3 * ramp(t, 0.2, 0.9, ease.pop), o: ramp(t, 0.2, 0.5) });
      rows.forEach((r) => {
        const k = ramp(t, r.at, r.at + 0.5);
        place(r.card, { y: (1 - k) * 36, o: k });
      });

      // pictogram 1: nodes appear one by one, root first
      const u1 = t - rows[0].at - 0.5;
      t1.all().forEach((id, i) => t1.reveal(id, ramp(u1, i * 0.35, i * 0.35 + 0.5)));
      t1.draw();

      // pictogram 2: select, snip, swap once; the edges let go, then grow back at the new parent
      const u2 = t - rows[1].at - 0.8;
      const cyc = u2 < 0 ? -1 : u2;
      const sel = cyc < 0 ? 0 : ramp(cyc, 0, 0.4);
      const k = cyc < 0 ? 0 : ramp(cyc, 1, 1.9, ease.inOut);
      const arc = Math.sin(Math.PI * k) * 24;
      [trA, trB].forEach((tr, n) => {
        tr.all().forEach((id, i) => tr.reveal(id, ramp(t - rows[1].at - 0.4, i * 0.12, i * 0.12 + 0.4)));
        const leaf = n === 0 ? "a2" : "b1";
        const newParent = n === 0 ? trB.anchor("b1") : trA.anchor("a1");
        const st = {
          ...(sel > 0.01 ? { tone: "orange" } : {}),
          halo: sel * 0.5 * (1 - ramp(cyc, 2.2, 2.6)),
          dx: (n === 0 ? 1 : -1) * move.dx * k,
          dy: (n === 0 ? 1 : -1) * move.dy * k + (n === 0 ? -arc : arc),
          lift: k > 0.01 && k < 0.99,
        };
        if (k > 0) st.eo = k < 0.5 ? 1 - ramp(k, 0, 0.25, ease.lin) : ramp(k, 0.75, 1, ease.lin);
        if (k >= 0.5) st.attach = newParent;
        tr.set(leaf, st);
        tr.draw();
      });
      const snip = cyc < 0 ? 0 : ramp(cyc, 0.3, 0.9, ease.lin) * (1 - ramp(cyc, 1, 1.2));
      scis.snip(Math.abs(Math.sin(Math.PI * 3 * snip)));
      place(scis, {
        x: 76,
        y: 0,
        s: 0.8 + 0.2 * ramp(t, rows[1].at + 0.6, rows[1].at + 1.1, ease.pop),
        o: ramp(t, rows[1].at + 0.6, rows[1].at + 0.9) * (cyc < 0 ? 0 : ramp(cyc, 0, 0.3) * (1 - ramp(cyc, 1.2, 1.5))),
      });

      // pictogram 3: target curve, program curve, then the red gap sweeps in
      const u3 = t - rows[2].at - 0.5;
      cTarget.set({ k: ramp(u3, 0, 0.9, ease.inOut) });
      cProg.set({ k: ramp(u3, 0.7, 1.6, ease.inOut) });
      gap.set({ k: ramp(u3, 1.6, 2.5, ease.inOut), o: 1 });

      // pictogram 4: four parts pop in one by one, then a fifth joins the functions
      const u4 = t - rows[3].at - 0.5;
      parts.forEach((p, i) => {
        const kk = ramp(u4, i * 0.3, i * 0.3 + 0.5, ease.pop);
        p.tile.apply({ x: p.x, y: p.y, s: kk, o: Math.min(1, kk * 4) });
      });
      const kn = ramp(u4, 2.2, 2.7, ease.pop);
      partsNew.apply({ x: 136, y: 100, s: kn, o: Math.min(1, kn * 4), pulse: V.flash(u4, 2.2, 2.7) });
    };
  },
});
