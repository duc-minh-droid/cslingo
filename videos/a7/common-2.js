/* Phase 7 · Information Theory & Compression: small drawing pieces (VID.a7, short name A7): tags, tiles, dictionary chips, bit
   strips, a counter, bars, spans, a token and plus/equals symbols. Positions are the parent's pixels (stage 936 x 640, origin
   top-left). EVERY CALL IS PURE: create a piece once in build(stage), then call its set(...) every frame from update(t) with
   everything you want to see; anything you leave out falls back to its default and nothing is remembered between frames.
   Tones: "grey" "green" "red" "orange" "blue" "purple" (A7.TONES). Text is 28 px or more everywhere (fs below that is refused).
   k = 0..1 pops a piece in (scale 0.8 -> 1 with a little spring, fades in); k = 0 hides it. x, y in set() are OFFSETS from the
   piece's own slot (like V.place), s scales, o fades (keep text at o >= 0.8 once it is on screen: dim with the grey tone instead).

   A7.tag(parent, {x, y, text, tone = "grey", solid = false, fs = 28, h}) -> t        a pill sticker (.v-tag); x, y = top-left
       t.set({text, tone, solid, k = 1, x, y, s, o});  t.el.   Keep text under about 26 characters.
   A7.tiles(parent, {x, y, items, w = 96, h = 96, gap = 14, dir = "row" | "col", fs = 48, subFs = 28}) -> row
       a row (or column) of sticker tiles. items: ["B", ...] or [{text, sub, tone}]; sub = a second, smaller line under the text
       (a weight, a bit count). row.set(i, {text, sub, tone, solid, ghost, plain, ring, ringK, k, x, y, s, o}) sets tile i;
       row.all((i) => state | undefined) sets every tile; row.pos(i) -> {x, y} top-left of slot i in parent px; row.mid(i) ->
       {x, y} centre; row.width, row.height, row.left, row.top, row.w, row.h, row.el (the container: V.place / V.show it).
       A tile with no tone of its own (neither in items nor in set) is PLAIN: a white tile with ink text (a letter of the message;
       options plain: false makes it grey instead). plain: true in set() forces it; ghost = dashed outline (an emptied slot); solid = filled
       with the tone; ring = a tone name: a ring round the tile (attention) that pops in with ringK 0..1.
   A7.chips(parent, {x, y, items, cols = 4, w = 180, h = 60, gapX = 12, gapY = 12, fs = 34, idxFs = 28}) -> board
       dictionary entries: a number and a string side by side ("4 | ABA"). items: [{idx, text}] (idx may be a string). Slots fill
       left to right, row by row. board.set(i, {idx, text, tone, solid, ghost, ring, ringK, k, x, y, s, o}); board.all(fn);
       board.pos(i) / board.mid(i) as for tiles; board.width, board.height, board.el.
   A7.bits(parent, {x, y, groups, cell = 40, h = 52, gap = 4, groupGap = 14, fs = 30, digits = true, tone = "grey"}) -> b
       a strip of bit cells. groups: "0110" (one group) or ["1","1","011","010","001","1","000"] (one codeword per group, a
       wider gap between groups). digits: false draws empty cells (tiny pictograms: use cell >= 14, h >= 20).
       b.set({k = 1, groupK, tone, tones, solid, cells, o, x, y, s})
         k       0..1: cells pop in left to right over the strip (cell j shows once k * n > j)
         groupK  (g) => 0..1 instead of k: each group's own pop-in (a codeword appears as a whole)
         tone / tones   one tone for every cell, or ["green", "blue", ...] one per GROUP;  solid   filled cells
         cells   {cellIndex: {tone, solid, ghost, plain, text, x, y, s, o, k}} per-cell patch on top (x, y = offset from the
                 cell's home slot: a cell flying in from elsewhere, or falling away)
       b.cell(i) -> {x, y, w, h, cx, cy} home slot of cell i (parent px, top-left and centre);  b.group(g) -> {x, y, w, h};
       b.n (cell count), b.width, b.height, b.left, b.top, b.el.   A bit is 28 px + digits: fs below 28 only with digits: false.
   A7.counter(parent, {x, y, w = 270, h = 80, label = "total", tone = "green"}) -> c      label small on the left, big number right
       c.set({text, tone, solid, bump = 0..1, k, o});  text = the number as a string (tween it yourself, V.lerp);  bump = one
       pulse (pass V.flash(t, a, b)).
   A7.bar(parent, {x, y, w, h = 56, tone = "grey", solid = true, text = "", fs = 32}) -> b    a horizontal sticker bar that grows
       from x to the right, full length w at k = 1 (never shorter than 14 px once visible).
       b.set({k, tone, solid, text, textOut = false, o});  text sits inside (left, 18 px padding) or, with textOut, just right of
       the end (ink colour; use it for short bars);  b.end(k) -> x of the bar's right end at k.
   A7.span(parent, {x, y, w, h = 14, tone = "blue"}) -> s   a rounded line (a bracket under tiles: the phrase w, a chunk)
       s.set({x, w, k, tone, dash, o})   x, w: new left edge and width (px, parent coords: you may animate them); k grows it from
       the left; dash: true = dashed outline.
   A7.token(parent, {tone = "blue", size = 34}) -> m   a round sticker marker. m.set({x, y, s, o, tone});  x, y = its CENTRE (parent px).
   A7.sym(kind, x, y, size = 40, tone = "grey") -> SVG <g>   "plus" | "equals" | "minus" centred on x, y; append it to your own
       <svg> (e.g. from L5.svg(stage)); V.place(g, {s, o}) animates it (pivot: its own centre). */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const tn = (t) => {
    if (!A7.TONES.includes(t)) throw new Error(`VID.a7: unknown tone "${t}" (use ${A7.TONES.join(", ")})`);
    return t;
  };
  const fsOk = (fs, what) => {
    if (fs < 28) throw new Error(`VID.a7.${what}: text must be 28 px or more (got ${fs})`);
    return fs;
  };
  const abs = (x, y, w, h) => {
    const st = { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px` };
    if (w != null) st.width = `${f1(w)}px`;
    if (h != null) st.height = `${f1(h)}px`;
    return st;
  };
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };
  const popS = (k) => 0.8 + 0.2 * E.pop(clamp(k));
  const popO = (k) => Math.min(1, clamp(k) * 4);
  const setText = (el, text) => {
    if (text != null && el.textContent !== String(text)) el.textContent = String(text);
  };
  const setCls = (el, cls) => {
    if (el.className !== cls) el.className = cls;
  };
  const place = (el, st, base = {}) =>
    V.place(el, {
      x: (st.x || 0) + (base.x || 0),
      y: (st.y || 0) + (base.y || 0),
      s: (st.s ?? 1) * popS(st.k ?? 1),
      o: popO(st.k ?? 1) * (st.o ?? 1),
    });
  // a sticker's look from a state: tone, solid / ghost / plain
  const look = (el, st, dflt = {}) => {
    const tone = tn(st.tone || dflt.tone || "grey");
    const [solid, ghost, plain] = [st.solid ?? dflt.solid, st.ghost ?? dflt.ghost, st.plain ?? dflt.plain];
    setCls(el, `${el.dataset.cls} c-${tone}${solid ? " solid" : ""}${ghost ? " ghost" : ""}`);
    el.style.background = plain && !solid && !ghost ? "var(--panel)" : "";
    el.style.color = plain && !solid && !ghost ? "var(--ink)" : "";
    return tone;
  };
  // a ring round a sticker (attention), popping in with ringK
  function ringOf(parent, w, h, r) {
    const el = V.h("div", {
      style: {
        ...abs(-9, -9, w + 18, h + 18),
        boxSizing: "border-box",
        border: "6px solid var(--c)",
        borderRadius: `${r + 9}px`,
      },
    });
    parent.append(el);
    return (tone, k) => {
      if (tone) setCls(el, `c-${tn(tone)}`);
      V.place(el, { s: 0.9 + 0.1 * E.out(clamp(k)), o: tone ? Math.min(1, clamp(k) * 3) : 0 });
    };
  }

  // ---------- tag ----------
  function tag(parent, o = {}) {
    const el = V.h("div", {
      class: "v-tag",
      text: o.text || "",
      style: {
        ...abs(o.x || 0, o.y || 0),
        ...flex,
        fontSize: `${fsOk(o.fs ?? 28, "tag")}px`,
        height: o.h ? `${o.h}px` : "",
      },
    });
    parent.append(el);
    const set = (st = {}) => {
      setCls(el, `v-tag c-${tn(st.tone || o.tone || "grey")}${(st.solid ?? o.solid) ? " solid" : ""}`);
      setText(el, st.text);
      place(el, st);
    };
    return { el, set };
  }

  // ---------- tiles ----------
  function tiles(parent, o = {}) {
    const { x = 0, y = 0, w = 96, h = 96, gap = 14, dir = "row", fs = 48, subFs = 28 } = o;
    const items = (o.items || []).map((it) => (typeof it === "string" ? { text: it } : it));
    fsOk(fs, "tiles");
    if (items.some((it) => it.sub)) fsOk(subFs, "tiles sub");
    const slot = (i) => (dir === "col" ? { x: 0, y: i * (h + gap) } : { x: i * (w + gap), y: 0 });
    const width = dir === "col" ? w : items.length * (w + gap) - gap;
    const height = dir === "col" ? items.length * (h + gap) - gap : h;
    const el = V.h("div", { style: abs(x, y, width, height) });
    const cells = items.map((it, i) => {
      const p = slot(i);
      const main = V.h("div", { text: it.text ?? "", style: { fontSize: `${fs}px`, lineHeight: "1" } });
      const sub = V.h("div", {
        text: it.sub ?? "",
        style: { fontSize: `${subFs}px`, lineHeight: "1", marginTop: "6px", display: it.sub ? "" : "none" },
      });
      const box = V.h(
        "div",
        {
          class: "v-gene c-grey",
          "data-cls": "v-gene",
          style: { ...abs(p.x, p.y, w, h), flexDirection: "column", borderRadius: "20px", fontSize: `${fs}px` },
        },
        main,
        sub,
      );
      const ring = ringOf(box, w, h, 20);
      el.append(box);
      return { box, main, sub, ring };
    });
    parent.append(el);
    const set = (i, st = {}) => {
      const c = cells[i];
      if (!c) throw new Error(`VID.a7.tiles: no tile ${i} (0..${cells.length - 1})`);
      const it = items[i];
      look(c.box, st, { tone: it.tone, plain: !st.tone && !it.tone && o.plain !== false });
      setText(c.main, st.text ?? it.text);
      const sub = st.sub ?? it.sub ?? "";
      setText(c.sub, sub);
      c.sub.style.display = sub ? "" : "none";
      place(c.box, st);
      c.ring(st.ring, st.ringK ?? 1);
    };
    const pos = (i) => ({ x: x + slot(i).x, y: y + slot(i).y });
    return {
      el,
      set,
      pos,
      w,
      h,
      width,
      height,
      left: x,
      top: y,
      mid: (i) => ({ x: pos(i).x + w / 2, y: pos(i).y + h / 2 }),
      all: (fn) => cells.forEach((_, i) => set(i, fn(i) || {})),
    };
  }

  // ---------- dictionary chips ----------
  function chips(parent, o = {}) {
    const { x = 0, y = 0, cols = 4, w = 180, h = 60, gapX = 12, gapY = 12, fs = 34, idxFs = 28 } = o;
    const items = o.items || [];
    fsOk(fs, "chips");
    fsOk(idxFs, "chips idx");
    const slot = (i) => ({ x: (i % cols) * (w + gapX), y: Math.floor(i / cols) * (h + gapY) });
    const rows = Math.ceil(items.length / cols);
    const width = Math.min(cols, items.length) * (w + gapX) - gapX;
    const height = rows * (h + gapY) - gapY;
    const el = V.h("div", { style: abs(x, y, width, height) });
    const cells = items.map((it, i) => {
      const p = slot(i);
      const idx = V.h("span", {
        text: String(it.idx),
        style: {
          fontSize: `${idxFs}px`,
          fontWeight: "800",
          minWidth: "40px",
          textAlign: "center",
          fontFamily: "var(--sans)",
        },
      });
      const bar = V.h("span", {
        style: {
          width: "3px",
          alignSelf: "stretch",
          margin: "10px 14px",
          background: "var(--c-edge)",
          borderRadius: "2px",
        },
      });
      const text = V.h("span", {
        text: it.text,
        style: { fontSize: `${fs}px`, fontWeight: "900", fontFamily: "var(--mono)", letterSpacing: "0.02em" },
      });
      const box = V.h(
        "div",
        {
          class: "v-gene c-grey",
          "data-cls": "v-gene",
          style: { ...abs(p.x, p.y, w, h), borderRadius: "16px", padding: "0 6px" },
        },
        idx,
        bar,
        text,
      );
      const ring = ringOf(box, w, h, 16);
      el.append(box);
      return { box, idx, text, ring };
    });
    parent.append(el);
    const set = (i, st = {}) => {
      const c = cells[i];
      if (!c) throw new Error(`VID.a7.chips: no chip ${i} (0..${cells.length - 1})`);
      look(c.box, st, { tone: "purple" });
      setText(c.idx, st.idx ?? items[i].idx);
      setText(c.text, st.text ?? items[i].text);
      place(c.box, st);
      c.ring(st.ring, st.ringK ?? 1);
    };
    const pos = (i) => ({ x: x + slot(i).x, y: y + slot(i).y });
    return {
      el,
      set,
      pos,
      width,
      height,
      left: x,
      top: y,
      mid: (i) => ({ x: pos(i).x + w / 2, y: pos(i).y + h / 2 }),
      all: (fn) => cells.forEach((_, i) => set(i, fn(i) || {})),
    };
  }

  // ---------- bit strips ----------
  function bits(parent, o = {}) {
    const { x = 0, y = 0, cell = 40, h = 52, gap = 4, groupGap = 14, digits = true } = o;
    const fs = o.fs ?? 30;
    if (digits) fsOk(fs, "bits");
    const groups = typeof o.groups === "string" ? [o.groups] : o.groups || ["0"];
    const homes = [];
    const gpos = [];
    let cx = 0;
    groups.forEach((g, gi) => {
      const x0 = cx;
      [...g].forEach((ch) => {
        homes.push({ g: gi, ch, x: cx });
        cx += cell + gap;
      });
      gpos.push({ x: x0, w: cx - gap - x0 });
      cx += groupGap - gap;
    });
    const n = homes.length;
    const width = cx - groupGap;
    const el = V.h("div", { style: abs(x, y, width, h) });
    const els = homes.map((c) => {
      const box = V.h("div", {
        class: "v-gene c-grey",
        "data-cls": "v-gene",
        text: digits ? c.ch : "",
        style: {
          ...abs(c.x, 0, cell, h),
          borderRadius: `${Math.min(12, cell / 3)}px`,
          fontSize: `${fs}px`,
          fontFamily: "var(--mono)",
        },
      });
      el.append(box);
      return box;
    });
    parent.append(el);
    const set = (st = {}) => {
      V.place(el, { x: st.x || 0, y: st.y || 0, s: st.s ?? 1, o: st.o ?? 1 });
      els.forEach((box, i) => {
        const patch = (st.cells || {})[i] || {};
        const g = homes[i].g;
        const k = patch.k ?? (st.groupK ? st.groupK(g) : (st.k ?? 1) * n - i);
        const tone = patch.tone || (st.tones ? st.tones[g] : null) || st.tone || o.tone || "grey";
        look(box, { ...patch, tone, solid: patch.solid ?? st.solid });
        if (patch.text != null) setText(box, patch.text);
        place(box, { ...patch, k: clamp(k), o: patch.o ?? 1 });
      });
    };
    const cellAt = (i) => ({ x: x + homes[i].x, y, w: cell, h, cx: x + homes[i].x + cell / 2, cy: y + h / 2 });
    return {
      el,
      set,
      n,
      width,
      height: h,
      left: x,
      top: y,
      cell: cellAt,
      group: (g) => ({ x: x + gpos[g].x, y, w: gpos[g].w, h }),
    };
  }

  // ---------- counter ----------
  function counter(parent, o = {}) {
    const { x = 0, y = 0, w = 270, h = 80 } = o;
    const label = V.h("span", { text: o.label || "total", style: { fontSize: "28px", fontWeight: "900" } });
    const num = V.h("span", { text: "0", style: { fontSize: "50px", fontWeight: "900", lineHeight: "1" } });
    const el = V.h(
      "div",
      {
        class: "v-card",
        style: {
          ...abs(x, y, w, h),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderRadius: "22px",
        },
      },
      label,
      num,
    );
    parent.append(el);
    const set = (st = {}) => {
      const solid = st.solid ?? false;
      const tone = tn(st.tone || o.tone || "green");
      setCls(el, `v-card c-${tone}`);
      el.style.background = solid ? "var(--c)" : "";
      el.style.borderColor = solid ? "var(--c-lip)" : "";
      el.style.boxShadow = solid ? "0 6px 0 var(--c-lip)" : "";
      el.style.color = solid ? "var(--c-on)" : "";
      setText(num, st.text);
      V.place(el, { s: popS(st.k ?? 1) * (1 + 0.08 * (st.bump || 0)), o: popO(st.k ?? 1) * (st.o ?? 1) });
    };
    return { el, set };
  }

  // ---------- bar ----------
  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 300, h = 56, fs = 32 } = o;
    fsOk(fs, "bar");
    const el = V.h("div", {
      class: "v-card",
      style: {
        ...abs(x, y, w, h),
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        fontSize: `${fs}px`,
        fontWeight: "900",
        borderRadius: "16px",
        whiteSpace: "nowrap",
        overflow: "hidden",
      },
    });
    const out = V.h("div", {
      class: "v-text",
      style: { ...abs(x, y + (h - fs * 1.2) / 2), fontSize: `${fs}px`, fontWeight: "900" },
    });
    parent.append(el, out);
    const end = (k) => x + Math.max(14, w * clamp(k));
    const set = (st = {}) => {
      const k = clamp(st.k ?? 1);
      const tone = tn(st.tone || o.tone || "grey");
      const solid = st.solid ?? o.solid ?? true;
      const text = st.text ?? o.text ?? "";
      setCls(el, `v-card c-${tone}`);
      el.style.width = `${f1(Math.max(14, w * k))}px`;
      el.style.background = solid ? "var(--c)" : "";
      el.style.borderColor = solid ? "var(--c-lip)" : "";
      el.style.boxShadow = solid ? "0 6px 0 var(--c-lip)" : "";
      el.style.color = solid ? "var(--c-on)" : "";
      setText(el, st.textOut ? "" : text);
      V.show(el, k < 0.003 ? 0 : (st.o ?? 1));
      setText(out, st.textOut ? text : "");
      out.style.left = `${f1(end(k) + 14)}px`;
      out.style.color = `var(--${{ grey: "text-dim", green: "teal-ink", red: "rose-ink", orange: "amber-ink", blue: "blue-ink", purple: "violet-ink" }[tone]})`;
      V.show(out, st.textOut && k > 0.003 ? (st.o ?? 1) * clamp((k - 0.2) * 3) : 0);
    };
    return { el, set, end };
  }

  // ---------- span ----------
  function span(parent, o = {}) {
    const { x = 0, y = 0, w = 100, h = 14 } = o;
    const el = V.h("div", {
      style: { ...abs(x, y, w, h), boxSizing: "border-box", borderRadius: `${h / 2}px`, transformOrigin: "0 50%" },
    });
    parent.append(el);
    const set = (st = {}) => {
      const tone = tn(st.tone || o.tone || "blue");
      const k = clamp(st.k ?? 1);
      setCls(el, `c-${tone}`);
      el.style.left = `${f1(st.x ?? x)}px`;
      el.style.width = `${f1(st.w ?? w)}px`;
      el.style.background = st.dash ? "transparent" : "var(--c)";
      el.style.border = st.dash ? "3px dashed var(--c)" : "";
      V.show(el, k < 0.003 ? 0 : (st.o ?? 1));
      el.style.transform = `scaleX(${f1(Math.max(0.0001, k))})`;
    };
    return { el, set };
  }

  // ---------- token ----------
  function token(parent, o = {}) {
    const size = o.size ?? 34;
    const el = V.h("div", {
      style: {
        ...abs(-size / 2, -size / 2, size, size),
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "3px solid var(--c-lip)",
        background: "var(--c)",
        boxShadow: "0 4px 0 var(--c-lip)",
      },
    });
    parent.append(el);
    const set = (st = {}) => {
      setCls(el, `c-${tn(st.tone || o.tone || "blue")}`);
      V.place(el, { x: st.x || 0, y: st.y || 0, s: st.s ?? 1, o: st.o ?? 1 });
    };
    return { el, set };
  }

  // ---------- plus / equals / minus ----------
  const sym = (kind, x, y, size = 40, tone = "grey") => {
    const a = size / 2;
    const bar1 = [x - a, y, x + a, y];
    const lines = {
      plus: [bar1, [x, y - a, x, y + a]],
      minus: [bar1],
      equals: [
        [x - a, y - a * 0.42, x + a, y - a * 0.42],
        [x - a, y + a * 0.42, x + a, y + a * 0.42],
      ],
    };
    if (!lines[kind]) throw new Error(`VID.a7.sym: unknown symbol "${kind}" (plus, minus, equals)`);
    const colour =
      tone === "grey"
        ? "var(--text-dim)"
        : `var(--${{ green: "teal", red: "rose", orange: "amber", blue: "blue", purple: "violet" }[tn(tone)]}-ink)`;
    return V.s(
      "g",
      {},
      ...lines[kind].map(([x1, y1, x2, y2]) =>
        V.s("line", {
          x1: f1(x1),
          y1: f1(y1),
          x2: f1(x2),
          y2: f1(y2),
          "stroke-width": f1(Math.max(6, size * 0.2)),
          "stroke-linecap": "round",
          style: { stroke: colour },
        }),
      ),
    );
  };

  Object.assign(A7, { tag, tiles, chips, bits, counter, bar, span, token, sym });
})();
