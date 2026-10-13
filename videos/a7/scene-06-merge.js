/* Phase 7 · Information Theory & Compression (algo-7), scene 06: Huffman coding, merge the two smallest again and again.
   Left: the pool of five letters with their chances (leaves never move). Four times the two SMALLEST roots turn orange, a new node
   (their sum, blue) appears centred above them with two branches, and a green chip with its weight flies to the "Huffman" label on
   the right: every merge adds its weight to the bits per letter, so the green bar grows .20, .49, .98, 1.98. At the end the tree
   turns green and a purple bar shows the entropy floor, 1.96, practically as long as the Huffman bar and far below the fixed 3.00.
   Every number comes from A7.HUFF (asserted by the helpers; the positions are re-checked here). */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { ramp, flash, lerp, ease: E } = V;
  const H = A7.HUFF;
  const must = (ok, msg) => {
    if (!ok) throw new Error(`algo-7 scene 06: ${msg}`);
  };

  // ---------- timing (local seconds) ----------
  const T0 = [2.2, 4.6, 6.7, 8.6]; // a merge starts: the two smallest roots turn orange
  const POP = [0.6, 0.6, 0.6, 0.7]; // ... the new node pops this long after
  const PICKED = 0.7; // ... the picked pair is released
  const FLY = 1.2; // ... the weight chip leaves the new node
  const FLY_LEN = 0.6;
  const BAR_END = [2.2, 2.2, 2.2, 2.0]; // ... the bar has reached its new length
  const GREEN = 10.6; // the finished tree turns green, bottom up
  const FLOOR = 11.0; // the entropy floor appears

  // ---------- layout (stage px) ----------
  const RX = 680; // the right column
  const BAR_W = 240; // 80 px per bit: the fixed 3-bit code fills it
  const CHIP_H = 62; // a weight chip is 62 px tall and 83 px wide (100 for "1.00"): a flight starts centred on the node
  const BOW = [40, 40, -30, -30]; // how far each flight arcs up (down for the two that start high, so they miss the fixed bar)
  const chipW = (text) => (text.length > 3 ? 100 : 83);
  const pos = A7.treePos(H, { x0: 20, slot: 120, top: 70, dy: 140, flat: 1 });
  const expect = {
    C: [80, 490],
    E: [200, 490],
    D: [320, 490],
    A: [440, 490],
    B: [560, 490],
    CE: [140, 350],
    DA: [380, 350],
    CEDA: [260, 210],
    CEDAB: [410, 70],
  };
  Object.entries(expect).forEach(([id, p]) =>
    must(pos[id][0] === p[0] && pos[id][1] === p[1], `node ${id} is at ${pos[id]}, not ${p}`),
  );
  must(H.merges.length === 4 && H.costs.join() === "20,49,98,198", "the merge costs differ from the storyboard");
  must(A7.fmtBits(H.merges[3].cost) === "1.98" && H.H.toFixed(2) === "1.96", "the labels differ from the storyboard");

  // who is picked at which merge, and when a node turns green (bottom up: leaves first, the root last)
  const pickedAt = {};
  H.smallest.forEach((pair, i) => pair.forEach((id) => (pickedAt[id] = i)));
  const mergeOf = {};
  H.merges.forEach((m, i) => (mergeOf[m.id] = i));
  const greenAt = (id) => GREEN + 0.1 * H.nodes[id].height;

  function build(stage) {
    const T = A7.tree(stage, { tree: H, pos, leafW: 88 });

    // the pool's own caption: the small numbers on the leaves are chances
    const chanceLine = A7.span(stage, { x: 30, y: 550, w: 580, h: 8, tone: "grey" });
    const chanceTag = A7.tag(stage, { x: 159, y: 566, text: "chance of each letter", tone: "grey", h: 52 });

    // right column: the three bars (a dashed track shows the scale: the full length is the fixed 3 bits)
    const track = (y) => {
      const el = V.h("div", {
        style: {
          position: "absolute",
          left: `${RX}px`,
          top: `${y}px`,
          width: `${BAR_W}px`,
          height: "48px",
          boxSizing: "border-box",
          border: "3px dashed var(--line-2)",
          borderRadius: "16px",
        },
      });
      stage.append(el);
      return el;
    };
    const hdr = A7.tag(stage, { x: RX, y: 20, text: "bits per letter", tone: "grey" });
    const fixedLbl = A7.tag(stage, { x: RX, y: 100, text: `fixed: ${A7.fmtBits(H.fixedBits * 100)}`, tone: "grey" });
    const fixedBar = A7.bar(stage, { x: RX, y: 168, w: BAR_W, h: 48, tone: "grey" });
    const huffLbl = A7.tag(stage, { x: RX, y: 250, text: "Huffman: 0.00", tone: "green" });
    const huffTrack = track(318);
    const huffBar = A7.bar(stage, { x: RX, y: 318, w: BAR_W, h: 48, tone: "green" });
    const floorLbl = A7.tag(stage, { x: RX, y: 400, text: `floor: ${H.H.toFixed(2)}`, tone: "purple" });
    const floorTrack = track(468);
    const floorBar = A7.bar(stage, { x: RX, y: 468, w: BAR_W, h: 48, tone: "purple" });

    // a bar has no text here, so it needs no padding (the helper's 18 px padding would keep every short bar at 42 px)
    [fixedBar, huffBar, floorBar].forEach((b) => (b.el.style.padding = "0"));

    // one green chip per merge: the new node's weight, flying to the Huffman label
    const chips = H.merges.map((m) => A7.tag(stage, { x: 0, y: 0, text: A7.fmtW(m.w), tone: "green", solid: true }));

    return (t) => {
      // ---- the tree ----
      const nodes = {};
      const edges = {};
      H.order.forEach((id, i) => {
        nodes[id] = { k: ramp(t, 0.3 + 0.12 * i, 0.8 + 0.12 * i, E.lin) };
      });
      H.merges.forEach((m, i) => {
        nodes[m.id] = { k: ramp(t, T0[i] + POP[i], T0[i] + POP[i] + 0.5, E.lin) };
        [m.a, m.b].forEach((kid) => {
          edges[A7.ek(m.id, kid)] = { k: ramp(t, T0[i] + POP[i], T0[i] + POP[i] + 0.5, E.out) };
        });
      });
      Object.keys(nodes).forEach((id) => {
        const n = nodes[id];
        n.tone = "grey";
        const g = greenAt(id);
        if (id in pickedAt) {
          // the two smallest roots: orange with a ring that pops in, then lets go
          const u = t - T0[pickedAt[id]];
          const rk = ramp(u, 0, 0.3) * (1 - ramp(u, PICKED, PICKED + 0.15, E.lin));
          if (u >= 0 && u < PICKED) n.tone = "orange";
          if (rk > 0) Object.assign(n, { ring: "orange", ringK: rk });
        }
        if (id in mergeOf) {
          // the new node is blue while it is made and until its weight has left
          const i = mergeOf[id];
          const u = t - T0[i];
          if (u >= POP[i] && u < FLY + FLY_LEN) n.tone = "blue";
          if (id === H.root && u >= POP[i]) n.tone = "blue";
        }
        if (t >= g) {
          n.tone = "green";
          n.solid = id === H.root;
          n.s = 1 + 0.08 * flash(t, g, g + 0.25);
        }
      });
      H.merges.forEach((m, i) => {
        [m.a, m.b].forEach((kid) => {
          const e = edges[A7.ek(m.id, kid)];
          const u = t - T0[i];
          e.tone = u < FLY + FLY_LEN || m.id === H.root ? "blue" : "grey";
          if (t >= greenAt(kid)) e.tone = "green";
        });
      });
      T.update({ nodes, edges });

      // ---- the weights flying to the label, and the bar they grow ----
      let cost = 0;
      let bump = 0;
      H.merges.forEach((m, i) => {
        const fa = T0[i] + FLY;
        const fb = fa + FLY_LEN;
        const p = ramp(t, fa, fb, E.inOut);
        const from = T.pt(m.id);
        chips[i].set({
          k: t >= fa && t < fb ? ramp(t, fa, fa + 0.2, E.lin) : 0,
          x: lerp(from.x - chipW(A7.fmtW(m.w)) / 2, RX, p),
          y: lerp(from.y - CHIP_H / 2, 250, p) - BOW[i] * Math.sin(Math.PI * p),
        });
        const [ba, bb] = [fb, T0[i] + BAR_END[i]];
        const prev = i ? H.merges[i - 1].cost : 0;
        cost += (m.cost - prev) * ramp(t, ba, bb, E.inOut);
        bump += flash(t, ba, bb);
      });
      const kCost = cost / (H.fixedBits * 100);
      huffLbl.set({
        k: ramp(t, 2.0, 2.4, E.lin),
        text: `Huffman: ${A7.fmtBits(Math.round(cost))}`,
        s: 1 + 0.06 * bump,
      });
      V.show(huffTrack, ramp(t, 2.0, 2.4, E.lin));
      huffBar.set({ k: kCost });

      // ---- the fixed bar and the floor ----
      const intro = ramp(t, 0.6, 0.9, E.lin);
      hdr.set({ k: intro });
      fixedLbl.set({ k: ramp(t, 0.65, 1.05, E.lin) });
      fixedBar.set({ k: ramp(t, 0.7, 1.2) });
      chanceLine.set({ k: ramp(t, 1.0, 1.5) });
      chanceTag.set({ k: ramp(t, 1.2, 1.6, E.lin) });
      floorLbl.set({ k: ramp(t, FLOOR, FLOOR + 0.4, E.lin) });
      V.show(floorTrack, ramp(t, FLOOR, FLOOR + 0.4, E.lin));
      floorBar.set({ k: (H.H / H.fixedBits) * ramp(t, FLOOR + 0.2, FLOOR + 0.8) });
    };
  }

  V.scene({
    kicker: "HUFFMAN CODING",
    title: ["Merge the two rarest,", "again and again"],
    dur: 14,
    caps: [
      [0.4, 2.7, "Each letter has a chance. Join the two smallest."],
      [3.3, 5.3, "Its chance adds to the bits per letter."],
      [5.5, 8.0, "Repeat with the two smallest left."],
      [9.4, 11.0, "One node left: the tree is done."],
      [11.1, 13.6, "1.98 bits a letter, just above the 1.96 floor."],
    ],
    build,
  });
})();
