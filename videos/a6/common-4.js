/* Phase 6 · Error Detection & Correction: the Hamming rig, the syndrome readout and the cube (VID.a6, short name A6). Same
   rules as common-2.js (parent pixels, PURE calls: pass everything every frame). Needs a6/common.js, common-2.js.

   1. THE HAMMING RIG  (scenes 8, 9, 10: one seven-tile codeword with its three checks underneath)
        const H = A6.hamRig(parent, {x: 118, y: 56, size: 88, gap: 14, rowH: 78, word: A6.HAM.cw});
      Layout (defaults, stage px): the seven tiles at y 56..144, x 118..818 (position 1 = the first tile); position numbers
      1..7 under them (y 152), the binary numbers under those (y 196), then three check bands, top to bottom p4, p2, p1
      (y 248, 326, 404, each 64 high; the label tag p4 / p2 / p1 sits at x 14, the verdict icon at x 876), and room for the
      readout from y 500 to 600. The tiles at positions 1, 2, 4 are orange (check bits), the others grey (data).
      H.bits       the A6.bits row (set(i, {text, tone, solid, ring, ringK, o, ...}), flip(...), mid(i), top(i), bottom(i)). Tile
                   i is POSITION i + 1. Pass the text yourself every frame, e.g. word[i] or "p1".
      H.set(i, state)   = H.bits.set       H.all(fn)   = H.bits.all       H.mid(i) / H.top(i) / H.bottom(i)  in parent pixels
      H.nums(k, {hot, tone})       the position numbers 1..7 (28 px) fade in with k 0..1; hot = a list of positions (1-based)
                                   drawn in that tone's ink and bold (default tone "purple")
      H.bin(k, {hot, at})          the position numbers written in binary under them ("001" ... "111", monospace); k 0..1 fades them
                                   in; hot = "p1" | "p2" | "p4" | null: the digit that check reads (p1 the last, p2 the middle, p4 the
                                   first) is drawn bold purple where it is 1 and the other digits stay grey: the groups read off;
                                   at = a position (1-based): its whole binary label is drawn bold orange (the answer 110 under 6)
      H.row(name, st)              the check band of "p4" | "p2" | "p1":
          st = {k: 0..1 the band and its label pop in,
                dots: 0..1 the discs of the watched positions pop in left to right (default k),
                vals: a 7-character string, the CURRENT bits of the word (the discs show the digits of the watched positions;
                      a 1 is a solid disc, a 0 a pale one. Default: H.word),
                own: text shown in the check bit's own disc (orange) instead of its digit, e.g. "?" before it is computed,
                bad: [positions] discs drawn red (the flipped bit),
                tone: "grey" (idle) | "purple" (being read) | ...: the colour of the band,
                verdict: "ok" | "bad" | null, vk: 0..1 the tick or cross draws on at the right end and the band turns green or red
                         (once vk > 0.3),  o: opacity of the whole band}
      H.rowMid(name) -> {x, y} the middle of a band;  H.rowY(name) top of a band;  H.verdictAt(name) -> {x, y} the verdict icon
      H.cover(name) -> [7 booleans] which tiles that check watches (use it to ring the tiles: H.set(i, {ring: "purple", ringK: k}))
      H.syn  the syndrome readout (below):  H.syn.set({...})
      H.left, H.width, H.size, H.gap, H.word, H.el
   2. THE SYNDROME READOUT  (scenes 9 and 10; created by the rig, at x = rig centre - 182, y 500)
        H.syn.set({vals: [1, 1, 0], k: 0..1, eqK: 0..1, num: "6", numK: 0..1, numX, numY, numS, o})
          vals  the three checks as 0/1 in the order p4 p2 p1 (1 = the check failed): three small tiles, red for 1, green for 0,
                with the labels p4 p2 p1 (28 px) above them.   k pops the three tiles in one after the other.
          eqK   an equals sign (SVG) between the tiles and the number.   num / numK  the orange number disc ("6"), a round solid
                sticker.   numX, numY (px) and numS (scale) move the disc away from home to fly it up to a tile.
        H.syn.numHome() -> {x, y} where the disc sits in parent pixels.
   3. THE CUBE  (scene 7)
        const cube = A6.cube(parent, {x: 20, y: 30, w: 520, h: 420, pillW: 92, pillH: 54});
        cube.update({nodes: {"000": "green" | {tone, solid, s, o, ring, ringK}, ...}, edges: {"000-010": "orange" | {tone, k, w, o,
                     from, dash}, ...}, base: {node: {...}, edge: {...}}, o});
          nodes   the eight words as rounded stickers (34 px). A word you do not list is grey. tone = A6.TONES, solid = filled;
                  ring + ringK = a coloured ring just outside (pop-in).
          edges   the twelve cube edges, keyed "<smaller word>-<larger word>" (A6.ek("010", "000") = "000-010"). Unlisted edges are
                  pale grey. k 0..1 grows the edge from one end (`from`: the word to grow from, default the first of the key),
                  w width multiplier (1), dash = dashed, o opacity.
          base    default state for every node / edge you do not list
        cube.pt("010") -> {x, y} the centre of a word in parent pixels;   cube.mid("000-010", f = 0.5) -> {x, y} a point along an
        edge (f from its first word);   cube.edgeKeys;  cube.el.
        Layout: front face = the words that start with 0 (000 bottom left, 001 bottom right, 010 top left, 011 top right), back
        face = the words that start with 1, shifted up and to the right: so 000 and 111 are opposite corners. Each flip of one bit
        moves a word along one edge.
        A6.ek(a, b) -> the edge key of two words. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { abs, flex, setText, setClass, f1, D } = A6;
  const NAMES = ["p4", "p2", "p1"];

  // ---------- 1. the Hamming rig ----------
  function hamRig(parent, opt = {}) {
    const { x = 118, y = 56, size = 88, gap = 14, rowH = 78 } = opt;
    const word = opt.word || A6.HAM.cw;
    const n = 7;
    const tones = [..."1234567"].map((p) => (A6.HAM.checkPos.includes(+p) ? "orange" : "grey"));
    const bits = A6.bits(parent, { x, y, bits: word, size, gap, tones });
    const width = bits.width;
    const cx = (i) => x + i * (size + gap) + size / 2;
    const numY = y + size + 8;
    const binY = numY + 44;
    const nums = A6.labelRow(parent, { x, y: numY, texts: [1, 2, 3, 4, 5, 6, 7].map(String), size, gap });
    const bin = A6.labelRow(parent, { x, y: binY, texts: A6.HAM.bin, size, gap, mono: true });
    // binary labels as three digits so one digit can be picked out: overwrite the text nodes with spans
    bin.els.forEach((e, i) => {
      e.textContent = "";
      [...A6.HAM.bin[i]].forEach((d) => e.append(V.h("span", { text: d })));
    });
    const bandTop = binY + 54;
    const rowY = (name) => bandTop + NAMES.indexOf(name) * rowH;
    const BAND = rowH - 14;
    const svg = L5.svg(parent, 936, 640);

    const rows = Object.fromEntries(
      NAMES.map((name) => {
        const top = rowY(name);
        const band = V.h("div", {
          class: "v-card c-grey",
          style: { ...abs(x - 16, top, width + 32, BAND), borderRadius: "22px", visibility: "hidden" },
        });
        const label = V.h("div", {
          class: "v-tag solid c-orange",
          text: name,
          style: { ...abs(14, top + (BAND - 46) / 2), ...flex },
        });
        const discs = Array.from({ length: n }, (_, i) =>
          V.h("div", {
            class: "v-gene c-purple",
            style: {
              ...abs(cx(i) - 25, top + (BAND - 50) / 2, 50, 50),
              borderRadius: "50%",
              fontSize: "30px",
              boxShadow: "0 4px 0 var(--c-edge)",
              visibility: "hidden",
            },
          }),
        );
        parent.append(band, label, ...discs);
        const ok = svg.appendChild(L5.tick(x + width + 58, top + BAND / 2, 56, "green", { w: 10, ink: true }));
        const bad = svg.appendChild(L5.cross(x + width + 58, top + BAND / 2, 56, "red", { w: 10, ink: true }));
        L5.drawOn(ok, 0);
        L5.drawOn(bad, 0);
        V.show(ok, 0);
        V.show(bad, 0);
        return [name, { band, label, discs, ok, bad }];
      }),
    );
    parent.append(svg); // the verdict icons above the bands
    const cover = (name) => [1, 2, 3, 4, 5, 6, 7].map((p) => A6.HAM.groups[name].includes(p));

    function row(name, st = {}) {
      const r = rows[name];
      const k = clamp(st.k ?? 0);
      const vals = st.vals || word;
      const vk = clamp(st.vk ?? 0);
      const tone = st.verdict && vk > 0.3 ? (st.verdict === "ok" ? "green" : "red") : st.tone || "grey";
      const o = st.o ?? 1;
      setClass(r.band, `v-card c-${tone}`);
      V.place(r.band, { s: 0.94 + 0.06 * E.out(k), o: Math.min(1, k * 4) * o });
      V.place(r.label, { s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 4) * o });
      const inGroup = cover(name);
      const dots = st.dots ?? k;
      let seen = 0;
      r.discs.forEach((d, i) => {
        if (!inGroup[i]) return V.show(d, 0);
        const dk = clamp(dots * 5 - seen++);
        const isOwn = (name === "p1" && i === 0) || (name === "p2" && i === 1) || (name === "p4" && i === 3);
        const bad = (st.bad || []).includes(i + 1);
        const digit = vals[i];
        const t = bad ? "red" : isOwn ? "orange" : "purple";
        setClass(d, `v-gene c-${t}${digit === "1" ? " solid" : ""}`);
        d.style.boxShadow = digit === "1" ? "0 4px 0 var(--c-lip)" : "0 4px 0 var(--c-edge)";
        setText(d, isOwn && st.own != null ? st.own : digit);
        V.place(d, { s: E.pop(dk), o: Math.min(1, dk * 4) * o });
      });
      const showOk = st.verdict === "ok";
      const showBad = st.verdict === "bad";
      V.show(r.ok, showOk ? o : 0);
      V.show(r.bad, showBad ? o : 0);
      L5.drawOn(r.ok, showOk ? vk : 0);
      L5.drawOn(r.bad, showBad ? vk : 0);
    }

    // position numbers and binary numbers
    const numsFn = (k, o = {}) => {
      const hot = o.hot || [];
      nums.all((i) => ({
        k: clamp(k * 1.2 - i * 0.03),
        tone: hot.includes(i + 1) ? o.tone || "purple" : "grey",
        bold: hot.includes(i + 1),
      }));
    };
    const digitOf = { p1: 2, p2: 1, p4: 0 };
    const binFn = (k, o = {}) => {
      bin.all((i) => ({ k: clamp(k * 1.2 - i * 0.03) }));
      bin.els.forEach((e, i) => {
        const at = o.at === i + 1;
        if (at) {
          e.style.color = A6.tone("orange").ink;
          e.style.fontWeight = "900";
        }
        [...e.children].forEach((s, d) => {
          const on = o.hot && digitOf[o.hot] === d && A6.HAM.bin[i][d] === "1";
          s.style.color = on ? A6.tone("purple").ink : "";
          s.style.fontWeight = on ? "900" : "";
        });
      });
    };

    // the syndrome readout
    const sw = 3 * 64 + 2 * 10;
    const sx = x + width / 2 - 182;
    const sy = bandTop + 3 * rowH + 24;
    const labs = A6.labelRow(parent, { x: sx, y: sy, texts: NAMES, size: 64, gap: 10 });
    const stiles = A6.bits(parent, { x: sx, y: sy + 38, bits: "000", size: 64, gap: 10, fs: 40 });
    const eqSvg = L5.svg(parent, 936, 640);
    const eqG = eqSvg.appendChild(
      V.s(
        "g",
        {},
        ...[-9, 9].map((dy) =>
          V.s("rect", {
            x: f1(sx + sw + 40 - 22),
            y: f1(sy + 38 + 32 + dy - 5),
            width: 44,
            height: 10,
            rx: 5,
            style: { fill: A6.tone("orange").c },
          }),
        ),
      ),
    );
    const home = { x: sx + sw + 40 + 22 + 50, y: sy + 38 + 32 };
    const numDisc = A6.disc(parent, { x: home.x, y: home.y, size: 84, text: "", tone: "orange" });
    const syn = {
      numHome: () => ({ ...home }),
      set(st = {}) {
        const vals = st.vals || [0, 0, 0];
        const k = clamp(st.k ?? 0);
        const o = st.o ?? 1;
        labs.all((i) => ({ k: clamp(k * 3 - i) * o }));
        stiles.all((i) => {
          const kk = clamp(k * 3 - i);
          return {
            text: String(vals[i]),
            tone: vals[i] ? "red" : "green",
            solid: true,
            s: E.pop(kk),
            o: Math.min(1, kk * 4) * o,
          };
        });
        V.place(eqG, { s: 0.7 + 0.3 * E.pop(clamp(st.eqK ?? 0)), o: clamp((st.eqK ?? 0) * 4) * o });
        numDisc.set({ text: st.num ?? "", k: st.numK ?? 0, x: st.numX || 0, y: st.numY || 0, s: st.numS ?? 1, o });
      },
    };
    syn.set({});

    return {
      el: bits.el,
      bits,
      word,
      left: x,
      width,
      size,
      gap,
      set: bits.set,
      all: bits.all,
      mid: bits.mid,
      top: bits.top,
      bottom: bits.bottom,
      nums: numsFn,
      bin: binFn,
      row,
      cover,
      syn,
      rowY,
      rowMid: (name) => ({ x: x + width / 2, y: rowY(name) + BAND / 2 }),
      verdictAt: (name) => ({ x: x + width + 58, y: rowY(name) + BAND / 2 }),
    };
  }

  // ---------- 3. the cube ----------
  const ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  function cube(parent, opt = {}) {
    const { x = 0, y = 0, w = 520, h = 420, pillW = 92, pillH = 54 } = opt;
    const dx = 150;
    const dy = 120;
    const W = w - dx - pillW;
    const H = h - dy - pillH;
    const pt = (word) => {
      const [b1, b2, b3] = [...word].map(Number);
      return { x: x + pillW / 2 + b3 * W + b1 * dx, y: y + h - pillH / 2 - b2 * H - b1 * dy };
    };
    const svg = L5.svg(parent, 936, 640);
    const edgeEls = A6.CUBE_EDGES.map(([a, b]) => {
      const line = V.s("path", { fill: "none", "stroke-linecap": "round" });
      svg.append(line);
      return { key: ek(a, b), a, b, line };
    });
    const pills = A6.CUBE_NODES.map((wd) => {
      const p = pt(wd);
      const el = V.h("div", {
        class: "v-gene c-grey",
        text: wd,
        style: {
          ...abs(p.x - pillW / 2, p.y - pillH / 2, pillW, pillH),
          borderRadius: "18px",
          fontSize: "34px",
          letterSpacing: "0.02em",
        },
      });
      const ring = V.h("div", {
        style: {
          ...abs(p.x - pillW / 2 - 9, p.y - pillH / 2 - 9, pillW + 18, pillH + 18),
          boxSizing: "border-box",
          border: "5px solid var(--violet)",
          borderRadius: "26px",
          visibility: "hidden",
        },
      });
      parent.append(ring, el);
      return { word: wd, el, ring };
    });
    const mid = (key, f = 0.5) => {
      const [a, b] = key.split("-");
      const [p, q] = [pt(a), pt(b)];
      return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f };
    };
    function update(st = {}) {
      const o = st.o ?? 1;
      const nodes = st.nodes || {};
      const edges = st.edges || {};
      const base = st.base || {};
      const norm = (v, d) => (typeof v === "string" ? { ...d, tone: v } : { ...d, ...(v || {}) });
      edgeEls.forEach(({ key, a, b, line }) => {
        const e = norm(edges[key], norm(base.edge, { tone: "grey" }));
        const t = e.tone === "grey" ? { c: "var(--line-2)" } : A6.tone(e.tone);
        const from = e.from === b ? b : a;
        const to = from === a ? b : a;
        const [p, q] = [pt(from), pt(to)];
        const k = e.dash ? 1 : clamp(e.k ?? 1);
        const ex = p.x + (q.x - p.x) * k;
        const ey = p.y + (q.y - p.y) * k;
        line.setAttribute("d", D("M", [p.x, p.y], "L", [ex, ey]));
        line.setAttribute("stroke-width", f1(9 * (e.w ?? 1)));
        line.style.stroke = t.c;
        line.style.strokeDasharray = e.dash ? "4 16" : "";
        V.show(line, k <= 0.003 ? 0 : (e.o ?? 1) * o);
      });
      pills.forEach(({ word, el, ring }) => {
        const nd = norm(nodes[word], norm(base.node, { tone: "grey" }));
        setClass(el, `v-gene c-${A6.tn(nd.tone)}${nd.solid ? " solid" : ""}`);
        V.place(el, { s: nd.s ?? 1, o: (nd.o ?? 1) * o });
        const rk = clamp(nd.ringK ?? (nd.ring ? 1 : 0));
        if (nd.ring && rk > 0.002) {
          ring.style.borderColor = A6.tone(nd.ring).c;
          ring.style.visibility = "";
          ring.style.opacity = String(Math.min(1, rk * 3) * (nd.o ?? 1) * o);
          ring.style.transform = `scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
        } else ring.style.visibility = "hidden";
      });
    }
    update({});
    return { el: svg, update, pt, mid, edgeKeys: edgeEls.map((e) => e.key) };
  }

  Object.assign(A6, { hamRig, cube, ek });
})();
