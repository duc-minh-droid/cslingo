/* Algorithms Phase 1 (algo-1), scene 05-doubling: double n from 8 to 16 and watch each loop. One loop does twice the work (x2),
   two nested loops four times (x4: four copies of the old square), a halving loop one extra step (+1). Every count comes from
   A1.DOUBLE / A1.calls / A1.halving. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const { ramp, flash, ease: E } = V;

  // ---------- data (all from the helpers, asserted here) ----------
  const [ONE, SQ, HALF] = A1.DOUBLE;
  const [N0, N1] = [8, 16];
  const CH16 = A1.halving(N1).chain; // 16 8 4 2 1: slot 0 is the new box
  A1.must(ONE.kind === "one" && SQ.kind === "sq" && HALF.kind === "half", "scene 5: DOUBLE order");
  A1.must(A1.halving(N0).chain.join() === CH16.slice(1).join(), "scene 5: the 8-chain is the 16-chain without 16");
  A1.must(
    A1.calls("one", N0).length === ONE.w0 && A1.calls("one", N1).length === ONE.w1 && ONE.w0 === 8 && ONE.w1 === 16,
    "scene 5: one loop 8 -> 16",
  );
  A1.must(
    A1.calls("sq", N0).length === SQ.w0 && A1.calls("sq", N1).length === SQ.w1 && SQ.w0 === 64 && SQ.w1 === 256,
    "scene 5: nested loops 64 -> 256",
  );
  A1.must(HALF.w0 === CH16.length - 2 && HALF.w1 === CH16.length - 1 && HALF.w0 === 3, "scene 5: halving 3 -> 4");
  A1.must(SQ.w1 === 4 * SQ.w0 && ONE.w1 === 2 * ONE.w0 && HALF.w1 === HALF.w0 + 1, "scene 5: x2, x4, +1");

  // ---------- layout (stage px) ----------
  const COL = [0, 324, 648];
  const CX = COL.map((x) => x + 144);
  const [Y_TOP, Y_HEAD, Y_OBJ] = [30, 92, 130];
  const [PITCH, CELL] = [18, 14];
  const Y_CNT = 472;
  const Y_SIG = 538;
  const Y_CLS = 600;
  const BOX_H = 44;
  const chainY = (k) => 156 + 62 * k;
  const arrowY = (k) => (chainY(k) + chainY(k + 1)) / 2; // centre of the gap under slot k
  const TOP = { n: 360, arrow: 424, dbl: 586 };

  // ---------- timeline (local seconds) ----------
  const T = {
    n: 0.3,
    head: [0.4, 0.52, 0.64],
    obj: [0.8, 0.95, 1.1],
    cnt: [1.1, 1.22, 1.34],
    dbl: [2.2, 2.9],
    swap: 2.8,
    c1: 3.0, // first new cell; 0.1 s apart
    c1flip: 4.0,
    sig1: 4.6,
    q: [5.2, 5.75, 6.3], // right, below, diagonal quadrant
    c2settle: 7.0,
    sig2: 7.2,
    c3: 7.9,
    c3settle: 9.3,
    c3flip: 8.9,
    sig3: 9.4,
    cls: [10.1, 10.35, 10.6],
  };

  const lin = (t, a, b) => ramp(t, a, b, E.lin);
  const pop = (k) => ({ s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 3) });
  const popAt = (t, a, d = 0.4) => pop(lin(t, a, a + d));
  const bump = (t, a, d = 0.35) => 1 + 0.14 * flash(t, a, a + d);
  const setTone = (el, tone) => {
    const c = `c-${tone}`;
    if (el.getAttribute("class") !== c) el.setAttribute("class", c);
  };

  /* a counter pill: "8" first, then "8 -> 16" with a drawn arrow (never a glyph) */
  function counter(stage) {
    const el = V.h("div", {
      class: "v-tag c-blue",
      style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "0", fontSize: "30px" },
    });
    const [a, b] = [V.h("span"), V.h("span")];
    const arrow = A1.icon("arrow", 28, "blue", { flow: true, w: 7 });
    el.append(a, arrow, b);
    stage.append(el);
    return {
      set({ cx, cy, from, to, w, h = 54, ...st }) {
        const both = to !== undefined;
        Object.assign(el.style, {
          left: `${(cx - w / 2).toFixed(1)}px`,
          top: `${(cy - h / 2).toFixed(1)}px`,
          width: `${w}px`,
          height: `${h}px`,
          lineHeight: `${h - 6}px`,
        });
        a.textContent = String(from);
        b.textContent = both ? String(to) : "";
        arrow.style.display = b.style.display = both ? "" : "none";
        V.place(el, st);
      },
    };
  }

  V.scene({
    kicker: "BIG-O",
    title: ["Double the input,", "watch the work"],
    dur: 12,
    caps: [
      [0.4, 2.8, "Now double n, from 8 to 16."],
      [3.0, 5.2, "One loop: twice the work."],
      [5.4, 7.4, "Nested loops: four times."],
      [7.6, 10.0, "Halving: just one extra step."],
      [10.2, 11.7, "The shape of the growth is the Big-O."],
    ],
    build(stage) {
      // top strip: n = 8 -> double n -> n = 16
      const nTag = A1.tag(stage, { text: "n = 8", tone: "blue", solid: true, fs: 32, w: 150 });
      const dArrow = A1.icon("arrow", 52, "purple");
      stage.append(dArrow);
      const dTag = A1.tag(stage, { text: "double n", tone: "purple", solid: true, fs: 32 });

      const heads = ["one loop", "nested loops", "halving loop"].map((text) => A1.tag(stage, { text, tone: "grey" }));

      // objects
      const g1 = A1.grid(stage, { x: CX[0] - CELL / 2, y: Y_OBJ, rows: N1, cols: 1, pitch: PITCH, cell: CELL });
      const g2 = A1.grid(stage, { x: CX[1] - (15 * PITCH + CELL) / 2, y: Y_OBJ, rows: N1, cols: N1, pitch: PITCH, cell: CELL });
      const boxes = CH16.map((v) => A1.tag(stage, { text: String(v), tone: "grey", fs: 28, w: 88, h: BOX_H }));
      const arrows = CH16.slice(1).map(() => A1.icon("arrow", 24, "blue", { w: 7 }));
      arrows.forEach((a) => stage.append(a));
      const halves = arrows.map(() => A1.tag(stage, { text: "÷2", tone: "purple", fs: 28, w: 64, h: 40 }));

      // numbers and names under the objects
      const cnt = [0, 1, 2].map(() => counter(stage));
      const sigIcon = [A1.icon("cross", 28, "blue", { flow: true, on: true, w: 7 }), A1.icon("cross", 28, "red", { flow: true, on: true, w: 7 }), A1.icon("plus", 28, "green", { flow: true, on: true, w: 7 })]; // prettier-ignore
      const sigTone = ["blue", "red", "green"];
      const sig = [ONE, SQ, HALF].map((q, i) =>
        A1.tag(stage, { text: q.sig.slice(1), tone: sigTone[i], solid: true, fs: 36, w: 116, h: 58, icon: sigIcon[i] }),
      );
      const cls = [ONE, SQ, HALF].map((q) => A1.tag(stage, { text: q.cls, tone: "grey", fs: 28 }));

      // the cells that belong to the new, doubled input: execution order from the real loops
      const oldKey = (c) => `${c.i},${c.j}`;
      const old1 = new Set(A1.calls("one", N0).map(oldKey));
      const new1 = A1.calls("one", N1).filter((c) => !old1.has(oldKey(c)));
      A1.must(new1.length === ONE.w1 - ONE.w0, "scene 5: new cells of the one loop");
      const newIdx = new Map(new1.map((c, idx) => [c.i, idx]));
      const old2 = new Set(A1.calls("sq", N0).map(oldKey));
      A1.must(A1.calls("sq", N1).filter((c) => !old2.has(oldKey(c))).length === SQ.w1 - SQ.w0, "scene 5: new cells of the square"); // prettier-ignore

      return (t) => {
        // ---- top strip ----
        const swapped = t >= T.swap;
        nTag.set({ center: true, x: TOP.n, y: Y_TOP, text: swapped ? `n = ${N1}` : `n = ${N0}`, ...popAt(t, T.n), s: popAt(t, T.n).s * bump(t, T.swap) }); // prettier-ignore
        V.place(dArrow, { x: TOP.arrow, y: Y_TOP - 26, o: ramp(t, T.dbl[0], T.dbl[0] + 0.1, E.lin) });
        A1.drawOn(dArrow, lin(t, T.dbl[0], T.dbl[1]));
        dTag.set({ center: true, x: TOP.dbl, y: Y_TOP, ...popAt(t, T.dbl[0] + 0.3) });

        heads.forEach((h, i) => h.set({ center: true, x: CX[i], y: Y_HEAD, ...popAt(t, T.head[i]) }));

        // ---- column 1: one loop. Cells 0..7 are old; 8..15 are new (orange, then blue) ----
        g1.update(
          (r) => {
            if (old1.has(oldKey({ i: r, j: 0 }))) {
              const k = lin(t, T.obj[0] + 0.04 * r, T.obj[0] + 0.04 * r + 0.25);
              return k > 0 ? { k, tone: "blue" } : undefined;
            }
            const t0 = T.c1 + 0.1 * newIdx.get(r);
            const k = lin(t, t0, t0 + 0.25);
            return k > 0 ? { k, tone: t >= T.c1flip + 0.1 ? "blue" : "orange" } : undefined;
          },
          { o: lin(t, T.obj[0], T.obj[0] + 0.3) },
        );

        // ---- column 2: nested loops. The square grows by three copies of itself ----
        g2.update(
          (r, c) => {
            if (old2.has(oldKey({ i: r, j: c }))) {
              const t0 = T.obj[1] + 0.02 * (r + c);
              const k = lin(t, t0, t0 + 0.25);
              return k > 0 ? { k, tone: "blue" } : undefined;
            }
            const q = r < N0 ? 0 : c < N0 ? 1 : 2; // right, below, diagonal quadrant
            const t0 = T.q[q] + 0.025 * ((r % N0) + (c % N0));
            const k = lin(t, t0, t0 + 0.2);
            return k > 0 ? { k, tone: t >= T.c2settle ? "blue" : "orange" } : undefined;
          },
          { o: lin(t, T.obj[1], T.obj[1] + 0.3) },
        );

        // ---- column 3: halving chain. Slot 0 (the 16) is new ----
        const k0 = lin(t, T.c3, T.c3 + 0.4);
        const settled = t >= T.c3settle;
        boxes.forEach((b, k) => {
          const pp = k === 0 ? pop(k0) : popAt(t, T.obj[2] + 0.12 * (k - 1));
          b.set({
            center: true,
            x: CX[2],
            y: chainY(k),
            tone: k === 0 && !settled ? "orange" : "grey",
            solid: k === 0 && !settled,
            ...pp,
          });
        });
        arrows.forEach((a, k) => {
          const born = k === 0 ? T.c3 + 0.4 : T.obj[2] + 0.12 * k + 0.2; // arrow k joins slot k and slot k + 1
          const dk = lin(t, born, born + 0.4);
          setTone(a, k === 0 && !settled ? "orange" : "blue");
          V.place(a, { x: CX[2] - 12, y: arrowY(k) - 12, r: 90, o: dk > 0 ? 1 : 0 });
          A1.drawOn(a, dk);
          const hk = lin(t, born + 0.2, born + 0.6);
          halves[k].set({ center: true, x: CX[2] + 90, y: arrowY(k), ...pop(hk) });
        });

        // ---- counters (a number, then "before -> after") ----
        const flips = [T.c1flip, T.c2settle, T.c3flip];
        [ONE, SQ, HALF].forEach((q, i) => {
          const done = t >= flips[i];
          cnt[i].set({
            cx: CX[i],
            cy: Y_CNT,
            from: q.w0,
            to: done ? q.w1 : undefined,
            w: done ? 196 : 92,
            ...popAt(t, T.cnt[i]),
            s: popAt(t, T.cnt[i]).s * bump(t, flips[i]),
          });
        });

        // ---- signatures: x2, x4 (with a small shake), +1 ----
        const sigAt = [T.sig1, T.sig2, T.sig3];
        sig.forEach((s, i) => {
          const sk = lin(t, sigAt[i] + 0.3, sigAt[i] + 0.7);
          const shake = i === 1 ? Math.sin(sk * Math.PI * 5) * 7 * (1 - sk) : 0;
          s.set({ center: true, x: CX[i], y: Y_SIG, dx: shake, ...popAt(t, sigAt[i]) });
        });

        // ---- the class of growth ----
        cls.forEach((c, i) => c.set({ center: true, x: CX[i], y: Y_CLS, ...popAt(t, T.cls[i]) }));
      };
    },
  });
})();
