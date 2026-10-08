/* Algorithms Phase 1 (algo-1), scene 11-recap: three rows, each a small looping pictogram and one bold line.
   Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0 (the pictogram starts 0.4 s later), 5.4 the call to action.
   Row 1 (period 4.8): a blue ring checks 3 8 1 9 4 one tile at a time; the tile holding the best turns orange and a green tick bumps
          after every hop (the promise holds). Numbers from A1.maxRun.
   Row 2 (period 4.5): a strip, a square and a halving chain at n = 4 double to n = 8: new cells pop orange, then the tags x2, x4, +1.
          Cells come from A1.calls / A1.halving.
   Row 3 (period 4.5): a five-node web (the web of A1.WEBS.web5); blue packets run along the links, R swells and turns orange,
          a purple dashed arc teleports the surfer from P to T, then a green tick pops. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const cyc = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period); // time inside the current lap, -1 before the first
  const bumps = (q, times, len = 0.35) => times.reduce((a, b) => a + flash(q, b, b + len), 0);
  const out = (q, a, b) => 1 - ramp(q, a, b, E.lin); // 1 -> 0 between a and b (the end of a lap)

  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 13, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);

  // ---------- row 1: the loop invariant ----------
  function loopRow(pic) {
    const LIST = A1.LIST.slice(0, 5);
    const run = A1.maxRun(LIST);
    A1.must(
      run.answer === 9 &&
        run.steps.map((s) => s.best).join() === "3,8,8,9,9" &&
        run.steps.map((s) => +s.beat).join("") === "11010" &&
        run.steps.every((s) => s.holds),
      "recap row 1: the run of 3 8 1 9 4 is not what the storyboard says",
    );
    const [SIZE, GAP] = [46, 10];
    const row = A1.row(pic, { x: 4, y: 18, values: LIST, size: SIZE, gap: GAP, tone: "grey" });
    row.tiles.forEach((tile) => (tile.style.fontSize = "28px"));
    pic.lastElementChild.style.borderWidth = "4px"; // the ring is the last element A1.row appended: a slimmer ring for small tiles
    const best = A1.tag(pic, { text: "best 3", tone: "orange", fs: 28, w: 126, h: 42 });
    const tick = A1.icon("tick", 38, "green");
    pic.append(tick);
    const s0 = (s) => 0.3 + 0.8 * s; // step s starts here: the ring arrives at +0.3, the verdict comes at +0.45
    const verdict = (s) => s0(s) + 0.45;
    const END = 4.35; // the lap resets here

    return (t) => {
      const q = cyc(t, START[0], 4.8);
      const live = q >= 0 && q < END;
      let bestAt = -1;
      run.steps.forEach((st, s) => {
        if (live && st.beat && q >= verdict(s)) bestAt = s;
      });
      let ringAt = 0;
      for (let s = 1; s < LIST.length; s++) ringAt += ramp(q, s0(s), s0(s) + 0.3, E.inOut);
      row.all((i) => {
        const pop = ramp(t, START[0] + 0.07 * i, START[0] + 0.07 * i + 0.45, E.lin);
        const done = live && q >= verdict(i);
        const isBest = i === bestAt;
        return {
          tone: !done ? "grey" : isBest ? "orange" : "blue",
          solid: done && isBest,
          s: E.pop(pop) * (1 + 0.12 * bumps(q, [verdict(i)]) - 0.1 * flash(q, END, END + 0.35)),
          y: -(1 - E.out(pop)) * 14,
          o: clamp(pop * 4),
        };
      });
      row.ring({ i: ringAt, k: ramp(q, 0.3, 0.6, E.lin) * out(q, END, END + 0.3), tone: "blue", pad: 5 });

      const shown = live ? ramp(q, verdict(0), verdict(0) + 0.25, E.lin) * out(q, END - 0.05, END) : 0;
      const [bx, by] = [4 + (LIST.length * SIZE + (LIST.length - 1) * GAP) / 2, 106];
      best.set({
        x: bx,
        y: by,
        center: true,
        text: bestAt >= 0 ? `best ${run.steps[bestAt].x}` : "best 3",
        s: (0.8 + 0.2 * E.pop(shown)) * (1 + 0.12 * bumps(q, [0, 1, 3].map(verdict))),
        o: shown,
      });
      A1.drawOn(tick, live ? ramp(q, verdict(0), verdict(0) + 0.3, E.lin) : 0);
      V.place(tick, {
        x: 288,
        y: 22,
        s: 1 + 0.3 * bumps(q, run.steps.map((_, s) => verdict(s))),
        o: live ? shown : 0,
      });
    };
  }

  // ---------- row 2: double n and watch the work ----------
  function doubleRow(pic) {
    const [W0, W1] = [4, 8]; // n before and after doubling
    A1.must(
      A1.work("one", W1) === 2 * A1.work("one", W0) &&
        A1.work("sq", W1) === 4 * A1.work("sq", W0) &&
        A1.work("half", W1) === A1.work("half", W0) + 1,
      "recap row 2: doubling should give x2, x4 and +1",
    );
    const CELL = { pitch: 11, size: 9, top: 3 };
    const key = (c) => `${c.i},${c.j}`;
    const lit = (kind, n) => new Set(A1.calls(kind, n).map(key)); // the cells the real loops light
    const [oneA, oneB, sqA, sqB] = [lit("one", W0), lit("one", W1), lit("sq", W0), lit("sq", W1)];
    const [cx1, cx2, cx3] = [57, 170, 283]; // the three column centres
    const span = (7 * CELL.pitch + CELL.size) / 2;
    const strip = A1.grid(pic, { x: cx1 - CELL.size / 2, y: CELL.top, rows: 8, cols: 1, ...CELL });
    const square = A1.grid(pic, { x: cx2 - span, y: CELL.top, rows: 8, cols: 8, ...CELL });

    // the halving chain: boxes joined by small arrows, the new box joins at the top
    const chainA = A1.halving(W0).chain;
    const chainB = A1.halving(W1).chain;
    A1.must(chainB.length === chainA.length + 1, "recap row 2: the chain should gain one box");
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const [BW, BH, BP] = [36, 16, 24]; // box width, height and pitch
    const slotY = (k) => CELL.top + k * BP;
    const mkBox = (k) => {
      const lip = V.s("rect", { x: cx3 - BW / 2, y: slotY(k) + 3, width: BW, height: BH, rx: 6 });
      const face = V.s("rect", { x: cx3 - BW / 2, y: slotY(k), width: BW, height: BH, rx: 6, "stroke-width": 3 });
      const g = svg.appendChild(V.s("g", {}, lip, face));
      return { g, lip, face };
    };
    const mkArrow = (k) => {
      const [x, y] = [cx3, slotY(k) + BH + 2];
      const g = svg.appendChild(
        V.s("path", {
          d: `M${f1(x - 5)} ${f1(y)}L${f1(x + 5)} ${f1(y)}L${f1(x)} ${f1(y + 6)}Z`,
          "stroke-width": 2,
          "stroke-linejoin": "round",
          style: { fill: L5.tone("grey").c, stroke: L5.tone("grey").c },
        }),
      );
      return g;
    };
    const slots = chainB.map((_, k) => ({ box: mkBox(k), arrow: k < chainB.length - 1 ? mkArrow(k) : null }));
    const paint = (b, tn) => {
      const c = L5.tone(tn);
      [b.face.style.fill, b.face.style.stroke, b.lip.style.fill] = [tn === "orange" ? c.c : c.dim, tn === "orange" ? c.lip : c.edge, tn === "orange" ? c.lip : c.edge]; // prettier-ignore
    };

    const mkTag = (tone, icon, text) => A1.tag(pic, { text, tone, solid: true, fs: 28, w: 92, h: 42, icon });
    const tags = [
      [mkTag("blue", A1.icon("cross", 24, "blue", { flow: true, on: true, w: 7 }), "2"), cx1],
      [mkTag("red", A1.icon("cross", 24, "red", { flow: true, on: true, w: 7 }), "4"), cx2],
      [mkTag("green", A1.icon("plus", 24, "green", { flow: true, on: true, w: 7 }), "1"), cx3],
    ];
    A1.must(A1.DOUBLE.map((d) => d.sig).join() === "×2,×4,+1", "recap row 2: the signatures");

    const T = { strip: 0.5, sq: 1.5, chain: 2.9, tags: [1.25, 2.65, 3.6] };
    const END = 4.1;
    // one cell: base cells are always lit; new cells pop orange at `at`, turn blue 0.35 s later and vanish at the lap's end
    const cellState = (isBase, isNew, at, q) => {
      if (isBase) return { k: 1, tone: "blue" };
      if (!isNew) return undefined;
      const k = Math.min(ramp(q, at, at + 0.25, E.lin), out(q, END, END + 0.3));
      return k > 0 ? { k, tone: q < at + 0.55 ? "orange" : "blue" } : undefined;
    };

    return (t) => {
      const q = cyc(t, START[1], 4.5);
      const intro = ramp(t, START[1], START[1] + 0.5, E.lin);
      V.show(strip.svg, intro);
      V.show(square.svg, intro);
      strip.update((r, c) => cellState(oneA.has(`${r},${c}`), oneB.has(`${r},${c}`), T.strip + 0.12 * (r - W0), q), {
        o: intro,
      });
      square.update(
        (r, c) => cellState(sqA.has(`${r},${c}`), sqB.has(`${r},${c}`), T.sq + 0.08 * (r + c - W0), q),
        { o: intro },
      );

      slots.forEach((sl, k) => {
        const isNew = k === 0;
        const at = T.chain;
        const born = isNew ? Math.min(ramp(q, at, at + 0.3, E.lin), out(q, END, END + 0.3)) : E.pop(intro);
        paint(sl.box, isNew && q < at + 0.55 ? "orange" : "blue");
        V.place(sl.box.g, { s: 0.7 + 0.3 * E.pop(born), o: clamp(born * 3) });
        if (sl.arrow) V.place(sl.arrow, { o: isNew ? clamp(born * 3) : E.pop(intro) });
      });

      tags.forEach(([tag, cx], i) => {
        const k = Math.min(ramp(q, T.tags[i], T.tags[i] + 0.4, E.lin), out(q, END, END + 0.3));
        tag.set({ x: cx, y: 118, center: true, s: 0.8 + 0.2 * E.pop(k), o: clamp(k * 3) });
      });
    };
  }

  // ---------- row 3: share rank, teleport, repeat ----------
  function webRow(pic) {
    const web = A1.WEBS.web5;
    A1.must(web.edges.length === 6 && web.dead.join() === "T", "recap row 3: the five-page web has six links and T is a dead end");
    const NODE = { P: [50, 36], Q: [150, 20], R: [244, 68], S: [172, 114], T: [50, 108] };
    const R0 = 14;
    const [blue, orange, purple, grey] = ["blue", "orange", "purple", "grey"].map(L5.tone);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const gLinks = svg.appendChild(V.s("g"));
    const gNodes = svg.appendChild(V.s("g"));
    const gDots = svg.appendChild(V.s("g"));
    const gPort = svg.appendChild(V.s("g"));

    // links: straight lines (two lanes when both directions exist) with a small head; their ends follow the node sizes
    const links = web.edges.map(([a, b]) => {
      const line = gLinks.appendChild(V.s("line", { "stroke-width": 4, "stroke-linecap": "round", style: { stroke: grey.edge } }));
      const head = gLinks.appendChild(V.s("path", { "stroke-width": 2, "stroke-linejoin": "round", style: { fill: grey.edge, stroke: grey.edge } }));
      const dot = gDots.appendChild(V.s("circle", { r: 5.5, "stroke-width": 2, style: { fill: blue.c, stroke: blue.lip } }));
      return { a, b, line, head, dot, off: web.edges.some(([x, y]) => x === b && y === a) ? 5 : 0 };
    }); // prettier-ignore
    const rad = {};
    const lane = (l) => {
      const [[ax, ay], [bx, by]] = [NODE[l.a], NODE[l.b]];
      const d = Math.hypot(bx - ax, by - ay);
      const [ux, uy] = [(bx - ax) / d, (by - ay) / d];
      const [nx, ny] = [-uy * l.off, ux * l.off];
      const [s0, s1] = [rad[l.a] + 5, rad[l.b] + 5];
      return { x1: ax + ux * s0 + nx, y1: ay + uy * s0 + ny, x2: bx - ux * s1 + nx, y2: by - uy * s1 + ny, ux, uy, nx: -uy, ny: ux };
    }; // prettier-ignore

    // nodes: sticker circles. R has a blue and an orange copy that cross-fade.
    const mkNode = () => {
      const lip = V.s("circle");
      const face = V.s("circle", { "stroke-width": 3 });
      const g = gNodes.appendChild(V.s("g", {}, lip, face));
      return {
        set({ x, y, r, tone, solid, o }) {
          const c = L5.tone(tone);
          for (const [e, dy] of [[lip, 3], [face, 0]]) {
            e.setAttribute("cx", f1(x));
            e.setAttribute("cy", f1(y + dy));
            e.setAttribute("r", f1(Math.max(0, r)));
          } // prettier-ignore
          [face.style.fill, face.style.stroke, lip.style.fill] = [solid ? c.c : c.dim, solid ? c.lip : c.edge, solid ? c.lip : c.edge]; // prettier-ignore
          V.show(g, o);
        },
      };
    };
    const nodes = Object.fromEntries(web.names.map((k) => [k, mkNode()]));
    const rOrange = mkNode();

    // teleport: a dashed arc P -> T, a purple dot that rides it, and a ring round T
    const [A, C, B] = [[41, 49], [6, 72], [41, 95]];
    const arcAt = (u) => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1]]; // prettier-ignore
    const arc = gPort.appendChild(V.s("path", { d: `M${A} Q${C} ${B}`, fill: "none", "stroke-width": 4, "stroke-linecap": "round", "stroke-dasharray": "7 6", style: { stroke: purple.c } })); // prettier-ignore
    const [tx, ty] = [B[0] - C[0], B[1] - C[1]];
    const tl = Math.hypot(tx, ty);
    const [hx, hy] = [tx / tl, ty / tl];
    const arcHead = gPort.appendChild(V.s("path", { d: `M${f1(B[0] + hx * 4)} ${f1(B[1] + hy * 4)}L${f1(B[0] - hx * 8 - hy * 6)} ${f1(B[1] - hy * 8 + hx * 6)}L${f1(B[0] - hx * 8 + hy * 6)} ${f1(B[1] - hy * 8 - hx * 6)}Z`, "stroke-width": 2, "stroke-linejoin": "round", style: { fill: purple.c, stroke: purple.c } })); // prettier-ignore
    const jump = gPort.appendChild(V.s("circle", { r: 6.5, "stroke-width": 2, style: { fill: purple.c, stroke: purple.lip } }));
    const halo = gPort.appendChild(V.s("circle", { cx: NODE.T[0], cy: NODE.T[1], r: R0 + 8, fill: "none", "stroke-width": 4, style: { stroke: purple.c } })); // prettier-ignore
    const tick = A1.icon("tick", 34, "green");
    pic.append(tick);

    const ROUNDS = [0.2, 1.1, 2.7]; // packets leave every link together and take 0.7 s
    const END = 4.2;
    return (t) => {
      const q = cyc(t, START[2], 4.5);
      const intro = (i) => ramp(t, START[2] + 0.07 * i, START[2] + 0.07 * i + 0.45, E.lin);
      const reset = 1 - ramp(q, END, END + 0.3, E.inOut); // 1 during the lap, 0 at its end
      const grow = (0.26 * ramp(q, 0.9, 1.2) + 0.2 * ramp(q, 1.8, 2.1) + 0.1 * ramp(q, 3.4, 3.7)) * (q < 0 ? 0 : reset);
      const orangeK = ramp(q, 1.8, 2.2, E.lin) * (q < 0 ? 0 : reset);
      web.names.forEach((k, i) => {
        const pop = intro(i);
        rad[k] = R0 * E.pop(pop) * (k === "R" ? 1 + grow + 0.07 * bumps(q, [0.9, 1.8, 3.4], 0.3) : 1);
        const [x, y] = NODE[k];
        nodes[k].set({ x, y, r: rad[k], tone: k === "T" ? "grey" : "blue", solid: false, o: clamp(pop * 4) * (k === "R" ? 1 - orangeK : 1) });
        if (k === "R") rOrange.set({ x, y, r: rad[k], tone: "orange", solid: true, o: clamp(pop * 4) * orangeK });
      }); // prettier-ignore
      const linkO = ramp(t, START[2] + 0.25, START[2] + 0.7, E.lin);
      const round = ROUNDS.findIndex((r0) => q >= r0 && q < r0 + 0.7);
      const f = round < 0 ? 0 : ramp(q, ROUNDS[round], ROUNDS[round] + 0.7, E.inOut);
      links.forEach((l) => {
        const g = lane(l);
        l.line.setAttribute("x1", f1(g.x1));
        l.line.setAttribute("y1", f1(g.y1));
        l.line.setAttribute("x2", f1(g.x2 - g.ux * 8));
        l.line.setAttribute("y2", f1(g.y2 - g.uy * 8));
        const [px, py] = [g.x2 - g.ux * 9, g.y2 - g.uy * 9];
        l.head.setAttribute("d", `M${f1(g.x2)} ${f1(g.y2)}L${f1(px + g.nx * 5)} ${f1(py + g.ny * 5)}L${f1(px - g.nx * 5)} ${f1(py - g.ny * 5)}Z`);
        V.show(l.line, linkO);
        V.show(l.head, linkO);
        l.dot.setAttribute("cx", f1(lerp(g.x1, g.x2, f)));
        l.dot.setAttribute("cy", f1(lerp(g.y1, g.y2, f)));
        V.show(l.dot, round < 0 ? 0 : Math.min(ramp(f, 0, 0.12, E.lin), 1 - ramp(f, 0.88, 1, E.lin)));
      }); // prettier-ignore

      // the teleport
      const tp = q < 0 ? 0 : Math.min(ramp(q, 1.95, 2.15, E.lin), out(q, 2.65, 2.95));
      V.show(arc, tp);
      V.show(arcHead, tp);
      const [jx, jy] = arcAt(ramp(q, 2.05, 2.5, E.inOut));
      jump.setAttribute("cx", f1(jx));
      jump.setAttribute("cy", f1(jy));
      V.show(jump, q < 0 ? 0 : Math.min(ramp(q, 2.0, 2.1, E.lin), out(q, 2.5, 2.6)));
      V.show(halo, q < 0 ? 0 : Math.min(ramp(q, 2.5, 2.65, E.lin), out(q, 2.95, 3.3)));

      const k = q < 0 ? 0 : ramp(q, 3.7, 4.0, E.lin) * reset;
      A1.drawOn(tick, k);
      V.place(tick, { x: 290, y: 50, s: 0.7 + 0.3 * E.pop(k), o: k });
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
        ["blue", "A loop is correct if\nits promise stays true", loopRow],
        ["red", "Double n and watch:\n×2, ×4 or +1", doubleRow],
        ["green", "Share rank, teleport,\nrepeat to settle", webRow],
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
        text: "Code it: Workshop 1.C",
        style: { position: "relative", display: "flex", alignItems: "center", fontSize: "34px", padding: "8px 34px 10px" },
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
          r.update(t);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
