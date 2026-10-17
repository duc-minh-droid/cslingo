/* Phase 7 · Information Theory & Compression (algo-7), scene 11-recap: three rows, each a small animated pictogram and one bold line.
   Bare scene. Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is done at about
   3.6 s, row 2 at 6.8 and row 3 at 7.4, so for the last 1.6 s only Byte's bob moves.
   Row 1 (purple, the floor): two strips of cells, the fixed code (grey, 8 cells) and a green code under it (8 cells). A purple dashed
          line pops just after cell 7, the last green cell shrinks away and the strip stops exactly at the line: a green tick.
          8 and 7 are four symbols of the loaded die: 4 x 2 fixed bits against 4 x 1.75 = 7 bits of entropy (A7.DIE).
   Row 2 (green, Huffman): the five-leaf tree as dots (A7.HUFF). The leaves pop, then the four merges of A7.HUFF.merges one after
          another: the two lightest roots turn orange, the new dot pops and its two branches grow in blue. At the end the whole tree
          turns green (root solid) and a green tick pops.
   Row 3 (blue, LZW): a tape of nine squares (ABABABABA, A7.LZW.text); a blue strip hops over the chunks A | B | AB | ABA | BA
          (A7.LZW.chunks), each chunk turns green as it is sent and the first four add a chip (the learned entries, A7.LZW.entries:
          orange when new, then purple). A green tick pops and stays.
   Pictograms carry no text (shapes only); the row labels are 36 px. Every count and order comes from A7.* and is asserted when the
   scene is built. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 5.4;

  // a symbol drawn on with a little pop: g was made by L5.tick at absolute coordinates
  const stamp = (g, k) => {
    L5.drawOn(g, ramp(k, 0.15, 1, E.lin));
    V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
  };
  const setCls = (el, cls) => {
    if (el.className !== cls) el.className = cls;
  };

  // ---------- row 1: entropy is the floor ----------
  function floorRow(pic) {
    const CELLS = 4 * A7.DIE.fixedBits; // four symbols of the loaded die at 2 bits each
    const FLOOR = 4 * A7.DIE.H; // the entropy of four symbols: 7 bits
    A7.same("recap row 1: 8 fixed cells and a floor of 7", [CELLS, FLOOR], [8, 7]);
    const [X0, CELL, GAP, H] = [20, 18, 4, 24];
    const strip = (y, tone) =>
      A7.bits(pic, { x: X0, y, groups: "0".repeat(CELLS), cell: CELL, h: H, gap: GAP, digits: false, tone });
    const grey = strip(28, "grey");
    const green = strip(76, "green");
    // the line sits in the gap just after the 7th cell
    const edge = grey.cell(FLOOR - 1).x + CELL;
    const gapMid = (edge + grey.cell(FLOOR).x) / 2;
    const line = V.h("div", {
      class: "c-purple",
      style: { ...box(gapMid - 2, 14, 0, 100), borderLeft: "4px dashed var(--c-lip)" },
    });
    pic.append(line);
    // the tick pops just right of the strips, level with the green one it confirms (not far away at the edge of the picture)
    const tick = L5.svg(pic, PIC.w, PIC.h).appendChild(L5.tick(236, 88, 42, "green", { w: 8 }));
    const T = { strips: [0, 0.5], line: [0.4, 0.8], shrink: [0.9, 1.4], tick: [1.6, 2.1] };

    return (q) => {
      grey.set({ k: ramp(q, T.strips[0], T.strips[1], E.lin), tone: "grey" });
      const gone = ramp(q, T.shrink[0], T.shrink[1], E.inOut);
      green.set({
        k: ramp(q, T.strips[0] + 0.2, T.strips[1] + 0.2, E.lin),
        tone: "green",
        solid: true,
        cells: gone > 0 ? { [CELLS - 1]: { s: 1 - gone, o: gone >= 1 ? 0 : 1 } } : {},
      });
      const lk = ramp(q, T.line[0], T.line[1]);
      V.place(line, { s: 0.6 + 0.4 * E.pop(lk), o: Math.min(1, lk * 4) });
      stamp(tick, ramp(q, T.tick[0], T.tick[1], E.lin));
    };
  }

  // ---------- row 2: Huffman merges the two rarest ----------
  function huffRow(pic) {
    const H = A7.HUFF;
    A7.same(
      "recap row 2: the four merges",
      H.merges.map((m) => [m.a, m.b, m.id]),
      [
        ["C", "E", "CE"],
        ["D", "A", "DA"],
        ["CE", "DA", "CEDA"],
        ["CEDA", "B", "CEDAB"],
      ],
    );
    const tree = A7.tree(pic, {
      tree: H,
      pos: A7.treePos(H, { x0: 14, slot: 62, top: 18, dy: 34, flat: 1 }),
      ew: 5,
      label: () => ({ kind: "dot", text: "", sub: "" }),
    });
    const tick = L5.svg(pic, PIC.w, PIC.h).appendChild(L5.tick(310, 42, 42, "green", { w: 8 }));
    const T = { leaf: 0.1, first: 0.7, every: 0.8, done: 3.9 };

    return (q) => {
      const finished = q >= T.done;
      const nodes = {};
      const edges = {};
      H.order.forEach((id, i) => {
        nodes[id] = { tone: "grey", k: ramp(q, T.leaf * i, T.leaf * i + 0.4, E.lin) };
      });
      H.merges.forEach((m, n) => {
        const t0 = T.first + T.every * n;
        // the two lightest roots turn orange, then the new dot pops and its branches grow in blue
        if (q >= t0 && q < t0 + 0.7) {
          [m.a, m.b].forEach((id) => {
            nodes[id] = { ...nodes[id], tone: "orange", solid: true, s: 1 + 0.15 * flash(q, t0, t0 + 0.3) };
          });
        }
        const born = ramp(q, t0 + 0.4, t0 + 0.7, E.lin);
        nodes[m.id] = { tone: "grey", k: born };
        [m.a, m.b].forEach((id) => {
          edges[A7.ek(m.id, id)] = { tone: "blue", k: born };
        });
      });
      if (finished) {
        const bump = 1 + 0.15 * flash(q, T.done, T.done + 0.4);
        Object.keys(nodes).forEach((id) => {
          nodes[id] = { tone: "green", solid: id === H.root, k: 1, s: bump };
        });
        Object.keys(edges).forEach((key) => {
          edges[key] = { tone: "green", k: 1 };
        });
      }
      tree.update({ nodes, edges });
      stamp(tick, ramp(q, T.done + 0.1, T.done + 0.6, E.lin));
    };
  }

  // ---------- row 3: LZW learns phrases ----------
  function lzwRow(pic) {
    const { text, chunks, entries } = A7.LZW;
    A7.same(
      "recap row 3: chunks and learned entries",
      [text, chunks.map((c) => c.text), entries.map((e) => e.text)],
      ["ABABABABA", ["A", "B", "AB", "ABA", "BA"], ["AB", "BA", "ABA", "ABAB"]],
    );
    A7.same("recap row 3: chunk widths", chunks.map((c) => 30 * (c.to - c.from)), [30, 30, 60, 90, 60]); // prettier-ignore
    const [X0, SQ, PITCH] = [20, 26, 30];
    const chunkOf = [...text].map((_, j) => chunks.findIndex((c) => j >= c.from && j < c.to));
    const squares = [...text].map((ch, j) =>
      pic.appendChild(
        V.h("div", {
          class: "v-gene c-grey",
          style: { ...box(X0 + PITCH * j, 20, SQ, SQ), borderRadius: "8px", borderWidth: "2.5px" },
        }),
      ),
    );
    const span = A7.span(pic, { x: X0, y: 54, w: 30, h: 10, tone: "blue" });
    const CHIP = { w: 60, h: 26, gap: 8, y: 84 };
    const chips = entries.map((_, i) =>
      pic.appendChild(
        V.h("div", {
          class: "v-gene c-purple",
          style: {
            ...box(X0 + i * (CHIP.w + CHIP.gap), CHIP.y, CHIP.w, CHIP.h),
            borderRadius: "10px",
            borderWidth: "2.5px",
          },
        }),
      ),
    );
    const tick = L5.svg(pic, PIC.w, PIC.h).appendChild(L5.tick(310, 100, 42, "green", { w: 8 }));
    const LAND = chunks.map((_, i) => 0.3 + 0.55 * i); // the strip lands on chunk i
    const SENT = LAND.map((t) => t + 0.15); // and the chunk is sent a moment later
    const bx = (c) => X0 + PITCH * c.from;
    const bw = (c) => PITCH * (c.to - c.from) - (PITCH - SQ);

    const paint = (el, tone, solid, dim) => {
      setCls(el, `v-gene c-${tone}`);
      el.style.background = solid ? "var(--c)" : dim ? "" : "var(--panel)";
      el.style.borderColor = solid ? "var(--c-lip)" : "";
      el.style.boxShadow = `0 3px 0 var(${solid ? "--c-lip" : "--c-edge"})`;
    };

    return (q) => {
      squares.forEach((sq, j) => {
        const c = chunkOf[j];
        const at = SENT[c] + 0.04 * (j - chunks[c].from);
        const kj = ramp(q, 0.05 * j, 0.05 * j + 0.3, E.lin); // the tape pops in left to right
        const sent = q >= at;
        paint(sq, sent ? "green" : "grey", sent, text[j] === "B");
        V.place(sq, { s: (0.7 + 0.3 * E.pop(kj)) * (1 + 0.2 * flash(q, at, at + 0.25)), o: Math.min(1, kj * 4) });
      });
      // the strip hops over the chunks
      let [x, w] = [bx(chunks[0]), bw(chunks[0])];
      chunks.forEach((c, i) => {
        if (i === 0) return;
        const k = ramp(q, LAND[i] - 0.25, LAND[i], E.inOut);
        x += (bx(c) - bx(chunks[i - 1])) * k;
        w += (bw(c) - bw(chunks[i - 1])) * k;
      });
      span.set({ x, w, k: ramp(q, 0.1, 0.3, E.lin), tone: "blue" });
      // each of the first four chunks teaches the decoder a new phrase
      chips.forEach((chip, i) => {
        const at = SENT[i];
        const k = ramp(q, at, at + 0.3, E.lin);
        paint(chip, q < at + 0.4 ? "orange" : "purple", true, false);
        V.place(chip, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
      });
      stamp(tick, ramp(q, 3.5, 4.0, E.lin));
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
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP" });
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["purple", "Entropy is the floor\nif nothing is lost", floorRow],
        ["green", "Huffman merges the\ntwo rarest, repeat", huffRow],
        ["blue", "LZW learns repeated\nphrases as it goes", lzwRow],
      ].map(([tone, text, make], i) => {
        text.split("\n").forEach((line) => {
          if (line.length > 22) throw new Error(`recap: "${line}" is longer than 22 characters`);
        });
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
        text: "Next: Workshop 7.W",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 864, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
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
          r.update(t - START[i]);
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
