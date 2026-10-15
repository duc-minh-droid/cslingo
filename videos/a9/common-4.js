/* Phase 9 · Fourier Transform & FFT: the spin wheel (scene 4), the DFT table (scene 5) and the FFT network (scenes 9 and 10)
   (window.VID.a9, part 4 of 4; needs common.js, common-2.js and common-3.js). Stage px (936 x 640). EVERY set() is PURE: call it every
   frame with everything you want to see; what you leave out falls back to its default and nothing is remembered between frames.

   ───────────────────────────── 1. THE SPIN WHEEL (scene 4) ─────────────────────────────
     const W = A9.wheel(parent, {x, y, w: 400, h: 270, n: 8});    a sticker card with a unit circle and the purple test arrow
         the arrow of sample n points at -2 PI k n / 8 (it turns CLOCKWISE, k whole turns in the window), exactly the angle A9.chain(k) uses.
     W.set({k: 1, cur: 0, upto: 0, curK: 1, o: 1, s: 1, dy: 0})
         k     how many times the arrow turns in the window (1 = once, 2 = twice, ...)
         cur   which sample the arrow is at; FRACTIONAL is fine and turns the arrow smoothly (cur 2.5 is half way between sample 2 and 3)
         upto  small purple dots mark where the arrow pointed for samples 0 .. upto - 1 (a trail: pass floor(cur) or cur)
         curK  0..1 grows the arrow from the centre (0 hides it)       o, s, dy: opacity / scale / lift of the whole card
     W.P is the A9.plot inside (equal axes, unit circle radius = W.r px, centre W.c = {x, y} in stage px).

   ───────────────────────────── 2. THE DFT TABLE (scene 5) ─────────────────────────────
     const G = A9.dftGrid(parent, {x, y, cell: 50, gap: 5, unit: 70});   x, y = the top-left of the grid (row 0, column 0). n = 8.
         An 8 x 8 grid of small sticker cells: row k, column n holds a purple arrow pointing at -2 PI ((k n) mod 8) / 8 (A9.W8.ang). Above
         the columns the eight samples A9.W8.x stand as blue stems (a small stem plot; the stems reach 95 px above y, so y >= 107). Left of every row its number k
         (28 px). Right of the grid, row k owns an orange bar A9.W8.bars[k] x unit px long (a 0 bar ends as a small grey stub).
     G.set({o: 1, head: 1, rows: (k) => ({k: 0, lit: 0, bar: 0, hot: 0}) | undefined})
         head       0..1 pops the sample stems in
         rows(k)    called for k = 0..7:  k 0..1 pops the row's cells in, staggered left to right (0 hides the row, its number and its bar);
                    lit 0..1 tints the row purple (the test is running);  bar 0..1 grows the orange bar;  hot 0..1 rings the row
     G.rowMid(k) -> {x, y} the left end of row k (just left of its number);  G.rowEnd(k) -> {x, y} where its bar starts;  G.colMid(n) -> {x, y}
     the top of column n's cells;  G.stem(n) -> {x, y} the tip of sample n's stem;  G.left, G.top, G.right, G.bottom (the grid's edges, stage px),
     G.barX (x where the bars start), G.unit, G.pitch.   Width: 8 x 50 + 7 x 5 = 435; with x = 100 the grid ends at x 535, the bars start at x 555 and a value of 4 (70 px a unit)
     ends at x 835; with y = 110 the grid ends at y 545.

   ───────────────────────────── 3. THE FFT NETWORK (scenes 9 and 10) ─────────────────────────────
     const R = A9.fftRig(parent, {});     ONE layout for both scenes, so the viewer follows one picture.
       8 rows (0..7, top to bottom) with y = 56 + 68 r.   Four vertical lines x = R.cols = [112, 288, 464, 640]: level L of butterflies (L = 0, 1, 2)
       lives between line L and line L + 1. The input tiles (blue "x0" .. "x7", 76 x 52) stand in a column at x 36 (right edge 112 = line 0); the
       answer tiles (orange "X0" .. "X7") at x 672 (left edge 32 px after line 3), each with a bar to its right (starting at x 758, 40 px per unit,
       a value of 4 ends at x 918). Everything stays inside x 14..918.
     R.rowY(r) -> y of the centre of row r (fractional rows work);  R.cols;  R.pitch = 68;  R.rect(r0, r1, c0, c1) -> {x, y, w, h}: the box that
       covers rows r0..r1 between lines c0 and c1 (12 px in from each line, 26 px above and below the rows, so two boxes of 4 rows leave a 16 px gap (10 px once the 6 px lip is counted)): pass it to A9.box(...).set(...). For example
       the whole 8-point DFT is R.rect(0, 7, 0, 3), the even box R.rect(0, 3, 0, 2), the odd box R.rect(4, 7, 0, 2).
     R.tilesAt(from, to, u, fn?)  puts the eight INPUT tiles on a row arrangement, moving from `from` to `to` as u goes 0 -> 1. from / to are
       arrangements (A9.FFT.natural, A9.FFT.evenOdd, A9.FFT.order: the sample index in each row); every tile glides to its new row, and tiles that
       move up swing 22 px left, tiles that move down swing 22 px right while they pass, so they never overlap. fn(i) (i = sample index) may
       return {tone, text, o, s, ring, ringK, solid, ghost, x, y} to restyle a tile (x, y add to the position). Call it every frame (u 0 = at `from`).
     R.inTile(i) -> the A9.tile of sample i (when you want to place one yourself).
     R.bf(L, b) -> the butterfly b (0..3) of level L (0..2) (rows A9.FFT.levels[L][b].a and .b);  bf.set({o, lit, k, tone, signs, minus})
         o      opacity (0 hides it)         lit 0..1: grey -> coloured with `tone` (default "orange"): how far it is computed
         k      0..1 draws the lines on from the left (use it with lit: 1 for a butterfly that is just being drawn)
         signs  0..1 pops a green plus on the upper output line and a red minus on the lower (the two answers: a + W b and a - W b)
         s      scale of the purple W dot (pop it with E.pop)         minus: a tone name for the line that carries the minus (default "red" when signs > 0)
         Each butterfly is: a short purple-dot stub on its lower input (the twiddle W, the purple dot), two lines into the upper output and two into the
         lower output (a classic X). bf.dot -> {x, y} the position of the purple dot, bf.a / bf.b -> {x, y} of its upper and lower INPUT points,
         bf.a1 / bf.b1 -> the OUTPUT points, bf.mid -> {x, y} the middle of the X.
     R.out(k) -> the A9.tile of the answer X_k (orange);  R.outs.set(k, state);  R.bar(k).set({k: 0..1, v: A9.FFT.bars[k], o, tone}) grows the bar of
         answer k to k x v x 40 px (a value of 0 ends as a small grey stub);  R.outs.all((k) => state).
     R.set({o}) fades the grey lines of the network as a whole (o 1 default); it never touches tiles or bars. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { clamp, lerp, ease: E } = V;
  const { f1, at, tn } = A9;
  const FFT = A9.FFT;
  const W8 = A9.W8;

  // ---------- 1. the spin wheel ----------
  function wheel(parent, o = {}) {
    const { x = 0, y = 0, w = 400, h = 270, n = 8 } = o;
    const P = A9.plot(parent, { x, y, w, h, equal: true, frame: true, view: [-1.45, 1.45, -1.25, 1.25] });
    const r = P.len(1);
    const c = { x: P.px(0), y: P.py(0) };
    P.under.appendChild(
      V.s("circle", {
        fill: "none",
        "stroke-width": "4",
        cx: f1(c.x),
        cy: f1(c.y),
        r: f1(r),
        style: { stroke: "var(--line-2)" },
      }),
    );
    const cross = [0, 1].map(() =>
      P.under.appendChild(V.s("line", { "stroke-width": "2", style: { stroke: "var(--line)" } })),
    );
    at(cross[0], { x1: c.x - r * 1.25, x2: c.x + r * 1.25, y1: c.y, y2: c.y });
    at(cross[1], { x1: c.x, x2: c.x, y1: c.y - r * 1.15, y2: c.y + r * 1.15 });
    const trail = P.dots({ max: n, r: 8, tone: "purple", stem: false });
    const arrow = P.vec({ tone: "purple", w: 9, head: 24 });
    const hub = P.dot({ tone: "purple", r: 8 });
    const ang = (k, j) => (-A9.TAU * k * j) / n;
    return {
      P,
      r,
      c,
      el: P.root,
      set({ k = 1, cur = 0, upto = 0, curK = 1, o: op = 1, s = 1, dy = 0 } = {}) {
        P.set({ o: op, s, dy });
        trail.set(
          Array.from({ length: n }, (_, j) =>
            j < upto ? { x: Math.cos(ang(k, j)), y: Math.sin(ang(k, j)) } : null,
          ).filter(Boolean),
        );
        const a = ang(k, cur);
        arrow.set({ x1: 0, y1: 0, x2: Math.cos(a), y2: Math.sin(a), k: curK });
        hub.set({ x: 0, y: 0, o: curK > 0.001 ? 1 : 0 });
      },
    };
  }

  // ---------- 2. the DFT table ----------
  function dftGrid(parent, o = {}) {
    const { x = 0, y = 0, cell = 50, gap = 5, unit = 70 } = o;
    const n = W8.n;
    const pitch = cell + gap;
    const svg = A9.svg(parent);
    const G = {
      left: x,
      top: y,
      right: x + n * pitch - gap,
      bottom: y + n * pitch - gap,
      barX: x + n * pitch + 20,
      unit,
      pitch,
    };
    const cx = (c) => x + c * pitch + cell / 2;
    const cy = (r) => y + r * pitch + cell / 2;
    G.rowMid = (k) => ({ x: x - 14, y: cy(k) });
    G.rowEnd = (k) => ({ x: G.barX, y: cy(k) });
    G.colMid = (c) => ({ x: cx(c), y });
    const stemBase = y - 50;
    const stemH = 36;
    G.stem = (c) => ({ x: cx(c), y: stemBase - W8.x[c] * stemH });
    // samples as stems
    const stems = W8.x.map((v, c) => {
      const line = svg.appendChild(V.s("line", { "stroke-width": "4", "stroke-linecap": "round" }));
      const dot = svg.appendChild(V.s("circle", { r: "9", "stroke-width": "3" }));
      return { line, dot, v, c };
    });
    const base = svg.appendChild(
      V.s("line", { "stroke-width": "3", "stroke-linecap": "round", style: { stroke: "var(--line-2)" } }),
    );
    at(base, { x1: x, x2: G.right, y1: stemBase, y2: stemBase });
    // cells
    const cells = [];
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) {
        const g = svg.appendChild(V.s("g"));
        const rect = g.appendChild(
          V.s("rect", {
            x: f1(x + c * pitch),
            y: f1(y + r * pitch),
            width: cell,
            height: cell,
            rx: 12,
            "stroke-width": "3",
          }),
        );
        const a = (-A9.TAU * W8.ang(r, c)) / n;
        const [ox, oy] = [cx(c), cy(r)];
        const len = cell * 0.34;
        const [tx, ty] = [ox + Math.cos(a) * len, oy + Math.sin(a) * len];
        const line = g.appendChild(
          V.s("line", {
            x1: f1(ox - Math.cos(a) * len * 0.5),
            y1: f1(oy - Math.sin(a) * len * 0.5),
            x2: f1(tx),
            y2: f1(ty),
            "stroke-width": "5",
            "stroke-linecap": "round",
          }),
        );
        const [nx, ny] = [-Math.sin(a), Math.cos(a)];
        const hd = 9;
        const head = g.appendChild(
          V.s("polygon", {
            points: A9.pts2d([
              [tx + Math.cos(a) * hd, ty + Math.sin(a) * hd],
              [tx + nx * hd * 0.75, ty + ny * hd * 0.75],
              [tx - nx * hd * 0.75, ty - ny * hd * 0.75],
            ]).join(" "),
            "stroke-linejoin": "round",
            "stroke-width": "2",
          }),
        );
        row.push({ g, rect, line, head });
      }
      cells.push(row);
    }
    const labels = Array.from({ length: n }, (_, r) =>
      svg.appendChild(
        V.s("text", {
          "text-anchor": "end",
          text: String(r),
          style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "28px", fill: "var(--text-dim)" },
        }),
      ),
    );
    labels.forEach((t, r) => at(t, { x: x - 14, y: cy(r) + 10 }));
    const bars = Array.from({ length: n }, () => svg.appendChild(V.s("rect", { rx: 10, "stroke-width": "3" })));
    const rings = Array.from({ length: n }, () =>
      svg.appendChild(V.s("rect", { fill: "none", "stroke-width": "5", rx: 18 })),
    );
    const tpurple = A9.tone("purple");
    const torange = A9.tone("orange");
    const tblue = A9.tone("blue");
    G.set = ({ o: op = 1, head: hk = 1, rows } = {}) => {
      stems.forEach(({ line, dot, v, c }) => {
        const k = clamp(hk * 1.4 - c * 0.05);
        const [px, py] = [cx(c), stemBase - v * stemH * E.out(k)];
        at(line, { x1: px, x2: px, y1: stemBase, y2: py });
        line.style.stroke = tblue.c;
        at(dot, { cx: px, cy: py });
        dot.style.fill = tblue.c;
        dot.style.stroke = tblue.lip;
        V.show(line, Math.min(1, k * 3) * op);
        V.show(dot, Math.min(1, k * 3) * op);
      });
      V.show(base, hk * op);
      for (let r = 0; r < n; r++) {
        const st = (rows && rows(r)) || {};
        const rk = clamp(st.k ?? 0);
        const lit = clamp(st.lit ?? 0);
        const bk = clamp(st.bar ?? 0);
        const hot = clamp(st.hot ?? 0);
        for (let c = 0; c < n; c++) {
          const cell0 = cells[r][c];
          const kk = clamp(rk * (1 + 0.07 * n) - c * 0.07);
          cell0.rect.style.fill = lit > 0.5 ? tpurple.dim : "var(--panel)";
          cell0.rect.style.stroke = lit > 0.5 ? tpurple.edge : "var(--line-2)";
          cell0.line.style.stroke = tpurple.c;
          cell0.head.style.fill = tpurple.c;
          cell0.head.style.stroke = tpurple.c;
          const [ox, oy] = [cx(c), cy(r)];
          cell0.g.style.transformOrigin = `${f1(ox)}px ${f1(oy)}px`;
          cell0.g.style.transform = `scale(${(0.6 + 0.4 * E.pop(kk)).toFixed(3)})`;
          V.show(cell0.g, Math.min(1, kk * 4) * op);
        }
        const lab = labels[r];
        V.show(lab, Math.min(1, rk * 3) * op);
        const len = (W8.bars[r] * unit * E.out(bk)) | 0;
        const bar = bars[r];
        const isStub = W8.bars[r] === 0;
        at(bar, { x: G.barX, y: cy(r) - 15, width: isStub ? 10 : Math.max(0, len), height: 30 });
        bar.style.fill = isStub ? "var(--line-2)" : torange.c;
        bar.style.stroke = isStub ? "var(--line-2)" : torange.lip;
        V.show(bar, (isStub ? bk > 0.6 : bk > 0.01) ? op : 0);
        const ring = rings[r];
        at(ring, {
          x: x - 54,
          y: y + r * pitch - 7,
          width: G.right - x + 54 + 8 + 10 + (G.barX - G.right) + W8.bars[r] * unit + 10,
          height: cell + 14,
        });
        ring.style.stroke = torange.c;
        V.show(ring, hot * op);
      }
    };
    return G;
  }

  // ---------- 3. the FFT network ----------
  function fftRig(parent) {
    const [pitch, top, tw, th] = [68, 56, 76, 52];
    const cols = [112, 288, 464, 640];
    const [tx, outX, barX, unit] = [36, 672, 758, 40];
    const rowY = (r) => top + r * pitch;
    const svg = A9.svg(parent);
    const grey = (extra) =>
      V.s("line", {
        "stroke-width": "4",
        "stroke-linecap": "round",
        pathLength: "1",
        style: { stroke: "var(--line)" },
        ...extra,
      });
    const hot = (extra) => V.s("line", { "stroke-width": "6", "stroke-linecap": "round", pathLength: "1", ...extra });
    const netG = svg.appendChild(V.s("g"));
    const R = { cols, pitch, rowY, tw, th };
    R.rect = (r0, r1, c0, c1) => ({
      x: cols[c0] + 12,
      y: rowY(r0) - 38,
      w: cols[c1] - cols[c0] - 24,
      h: rowY(r1) - rowY(r0) + 76,
    });

    const sign = (txt, tone) => {
      const g = V.s("g");
      const t = A9.tone(tone);
      g.append(V.s("circle", { r: "15", "stroke-width": "3", style: { fill: "var(--panel)", stroke: t.c } }));
      g.append(
        V.s("path", {
          d: txt === "+" ? "M-8 0H8M0 -8V8" : "M-8 0H8",
          fill: "none",
          "stroke-width": "5",
          "stroke-linecap": "round",
          style: { stroke: t.c },
        }),
      );
      return g;
    };
    // butterflies
    R.bfs = FFT.levels.map((lv, L) =>
      lv.map((b) => {
        const [x0, x1] = [cols[L], cols[L + 1]];
        const [ya, yb] = [rowY(b.a), rowY(b.b)];
        const xd = x0 + 44;
        const geo = {
          stub: [x0, yb, xd, yb],
          aA: [x0, ya, x1, ya],
          aB: [x0, ya, x1, yb],
          wA: [xd, yb, x1, ya],
          wB: [xd, yb, x1, yb],
        };
        const names = Object.keys(geo);
        const base = {};
        const over = {};
        names.forEach((nm) => {
          const [a, b2, c, d] = geo[nm];
          const pos = { x1: f1(a), y1: f1(b2), x2: f1(c), y2: f1(d) };
          base[nm] = netG.appendChild(grey({ ...pos, "stroke-dasharray": "1 1" }));
          over[nm] = netG.appendChild(hot({ ...pos, "stroke-dasharray": "1 1" }));
        });
        const dot = netG.appendChild(V.s("circle", { cx: f1(xd), cy: f1(yb), r: "13", "stroke-width": "3" }));
        const plus = netG.appendChild(sign("+", "green"));
        const minus = netG.appendChild(sign("-", "red"));
        V.place(plus, { x: x1 - 24, y: ya });
        V.place(minus, { x: x1 - 24, y: yb });
        const bf = {
          a: { x: x0, y: ya },
          b: { x: x0, y: yb },
          a1: { x: x1, y: ya },
          b1: { x: x1, y: yb },
          dot: { x: xd, y: yb },
          mid: { x: (xd + x1) / 2, y: (ya + yb) / 2 },
          rows: [b.a, b.b],
          set({
            o: op = 1,
            lit = 0,
            k = 1,
            tone = "orange",
            signs = 0,
            minus: mt = signs > 0 ? "red" : tone,
            s = 1,
          } = {}) {
            const kk = clamp(k);
            const on = kk > 0.001;
            names.forEach((nm) => {
              [base[nm], over[nm]].forEach((e) => e.setAttribute("stroke-dashoffset", String(1 - kk)));
              V.show(base[nm], on ? op : 0);
              over[nm].style.stroke = A9.tone(nm === "wB" ? tn(mt) : tn(tone)).c;
              V.show(over[nm], on ? clamp(lit) * op : 0);
            });
            const t = A9.tone("purple");
            dot.style.fill = t.c;
            dot.style.stroke = t.lip;
            V.place(dot, { s: s * (0.5 + 0.5 * clamp(kk * 2)), o: clamp(kk * 3) * op });
            V.show(plus, clamp(signs) * op);
            V.show(minus, clamp(signs) * op);
          },
        };
        bf.set({ o: 0, k: 0 });
        return bf;
      }),
    );
    R.bf = (L, b) => R.bfs[L][b];

    // input tiles
    const ins = FFT.natural.map((i) =>
      A9.tile(parent, { x: tx, y: rowY(i) - th / 2, w: tw, h: th, text: `x${i}`, tone: "blue", fs: 30 }),
    );
    R.inTile = (i) => ins[i];
    const rowsOf = (arr) => FFT.rows(arr);
    R.tilesAt = (from, to, u = 1, fn) => {
      const [rf, rt] = [rowsOf(from), rowsOf(to)];
      ins.forEach((t, i) => {
        const row = lerp(rf[i], rt[i], clamp(u));
        const swing = 22 * Math.sin(Math.PI * clamp(u)) * Math.sign(rt[i] - rf[i]);
        const st = (fn && fn(i)) || {};
        t.set({ ...st, x: swing + (st.x || 0), y: (row - i) * pitch + (st.y || 0) });
      });
    };

    // answer tiles and bars
    const outs = FFT.natural.map((k) =>
      A9.tile(parent, { x: outX, y: rowY(k) - th / 2, w: tw, h: th, text: `X${k}`, tone: "orange", fs: 30 }),
    );
    R.out = (k) => outs[k];
    R.outs = { set: (k, st) => outs[k].set(st), all: (fn) => outs.forEach((t, k) => t.set(fn(k) || {})) };
    const barSvg = A9.svg(parent);
    const bars = FFT.natural.map(() => barSvg.appendChild(V.s("rect", { rx: 10, "stroke-width": "3" })));
    R.bar = (k) => ({
      set({ k: kk = 1, v = FFT.bars[k], o: op = 1, tone = "orange" } = {}) {
        const stub = v === 0;
        const t = A9.tone(tone);
        at(bars[k], {
          x: barX,
          y: rowY(k) - 15,
          width: stub ? 10 : Math.max(0, v * unit * E.out(clamp(kk))),
          height: 30,
        });
        bars[k].style.fill = stub ? "var(--line-2)" : t.c;
        bars[k].style.stroke = stub ? "var(--line-2)" : t.lip;
        V.show(bars[k], (stub ? kk > 0.6 : kk > 0.01) ? op : 0);
      },
    });
    R.set = ({ o: op = 1 } = {}) => {
      netG.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
    };
    return R;
  }

  Object.assign(A9, { wheel, dftGrid, fftRig });
})();
