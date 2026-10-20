/* Lecture 5 · Partitioning: the big pieces (VID.d5, short name D5): the node cluster every scene stands on, plus the meter, the
   tank, the hash box, the number cells, plain text and arrows. Needs l5/common.js, d5/common.js and d5/common-2.js loaded first.
   Same rules as common-2.js: positions in stage px (936 x 640), EVERY CALL IS PURE (call set() each frame with everything you want
   to see, nothing is remembered), tones are D5.TONES, text is at least 28 px.

   1. CLUSTER  (nodes side by side: a server sticker with a header and a grid of slots for chips)
        const cl = D5.cluster(stage, {x: 12, y: 190, n: 4, w: 210, gap: 24, cols: 4, rows: 2, cw: 44, ch: 44, cg: 6, pad: 8,
                                       headH: 56, names: ["Node 1", ...], slots: true, tone: "grey", icon: true, h});
            Four nodes of width 210 with a 24 gap exactly fill the stage (x 12 .. 924, centres 117, 351, 585, 819); three nodes:
            w 288, gap 24 (centres 156, 468, 780).  Node height h = headH + pad + rows * ch + (rows - 1) * cg + pad unless given.
            slots: true draws one dashed empty slot per grid cell (the node's capacity); a grid wider than the node throws.
        cl.set(i, {tone, k, o, x, y, s, label, ghost, ring, ringK, ringDash, slotsO, tag, tagTone, tagSolid, tagK})
            i = node 0..n-1.  tone = the card tint (grey = plain panel; red a hot node, green a fair one, blue asked, orange new);
            k 0..1 pops the whole node in; o opacity; x, y = offset of the whole node from its home; s scale; label = header text;
            ghost = dashed outline with nothing in it (a node that has not joined yet); ring = tone name for a halo around the
            node (ringK 0..1 pops it, ringDash true = dashed); slotsO 0..1 fades the dashed slots; tag = a pill CENTRED over the
            node, on the 58 px above its top edge (the range tags A-F, hours, "P1"); pass the text EVERY frame (without it, or with
            tagK 0, the tag is hidden); tagK 0..1 pops it.
        cl.slot(i, j) -> {x, y} centre of slot j of node i in stage px (row-major; j >= cols * rows continues the grid BELOW the
            card: use it for overflow);  cl.box(i) -> {x, y, w, h} the card;  cl.mid(i) centre of the card;  cl.top(i) / cl.bottom(i)
            top / bottom centre;  cl.tagAt(i) centre of the tag;  cl.n, cl.w, cl.h, cl.cols, cl.rows, cl.nslots, cl.cw, cl.ch
        Put chips on slots:  chip.set({x: cl.slot(2, 1).x, y: cl.slot(2, 1).y}).
   2. METER  (a horizontal bar: load, writes served)
        const m = D5.meter(parent, {x, y, w: 180, h: 26, tone: "green", mark: 0.75});  m.set({k, tone, o, x, y})   k 0..1 = how full;
            mark draws a purple tick at that fraction (a capacity line).
   3. TANK  (a vertical bar whose height is a size in GB: partitions of scene 10)
        const t = D5.tank(parent, {x, y, w: 84, scale: 15, tone: "blue"});   x = centre, y = the BASELINE (bottom edge) in stage px
        t.set({gb, tone, text, o, x, y, solid, dashed, s})   height = gb * scale px (use gb >= 3: the label is 28 px); text defaults to
            "<gb> GB"; x, y = offset of the baseline; s scales width and height from the baseline.
        const r = D5.rule(parent, {x, y, w, text: "limit 10 GB", tone: "purple"});  r.set({k, o, y})   a dashed horizontal line from
            (x, y) to (x + w, y) with a pill label over its right end (y = line height; label sits above it).
   4. HASH BOX
        const hb = D5.hashBox(parent, {x, y, w: 190, h: 100, text: "hash"});   a purple sticker with the # icon;  hb.set({k, o, pulse, x, y, s})
            k pops it in; pulse 0..1 (V.flash) swells it and fills it solid while a key goes through; x, y = offset;  hb.mid = {x, y} centre.
   5. NUMBER CELLS  (the hash values 0-15 grouped over the nodes that own them)
        const nc = D5.cells(parent, {n: 16, per: 4, centres: [117, 351, 585, 819], y: 150, w: 46, h: 46, gap: 4, tone: "purple", texts});
        nc.set(i, {tone, solid, text, o, s, x, y, ring, ringK, dx, dy});   cell i (value i) sits in group floor(i / per), centred on
            centres[group]; dx, dy shift it;  nc.mid(i) -> {x, y};  nc.chips
   6. TEXT AND ARROWS
        const tx = D5.text(parent, {x, y, text, tone: "grey", fs: 28, w, align: "left"});  tx.set({text, tone, k, o, x, y, bold})   tone "ink"
            = strong text, "grey" = dim, any other tone = its -ink colour; w + align "center" centre it in a box (x = left).
        const ln = D5.link(L5.svg(stage), a, b, "blue", {w: 7, head: 22, bow: 0});  ln(k, o = 1)   an arrow from a to b ({x, y}), k 0..1
            draws it on; call it every frame (k 0 hides it). Uses VID.l5.arrow, so opt is the same. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { f1, tn, abs, flex, setText, setClass } = D5;

  // ---------- 1. cluster ----------
  function cluster(parent, o = {}) {
    const {
      x = 12,
      y = 0,
      n = 4,
      w = 210,
      gap = 24,
      cols = 4,
      rows = 2,
      cw = 44,
      ch = 44,
      cg = 6,
      pad = 8,
      headH = 56,
    } = o;
    const nslots = cols * rows;
    const gridW = cols * cw + (cols - 1) * cg;
    if (gridW > w - 2 * pad + 0.5)
      throw new Error(`VID.d5.cluster: a grid of ${cols} x ${cw} px (${gridW} px) does not fit a node of width ${w}`);
    const h = o.h ?? headH + pad + rows * ch + (rows - 1) * cg + pad;
    const gx = (w - gridW) / 2;
    const left = (i) => x + i * (w + gap);
    const slotRel = (j) => ({
      x: gx + (j % cols) * (cw + cg) + cw / 2,
      y: headH + pad + Math.floor(j / cols) * (ch + cg) + ch / 2,
    });
    const nodes = Array.from({ length: n }, (_, i) => {
      const wrap = V.h("div", { style: abs(left(i), y, w, h) });
      const ring = V.h("div", {
        style: {
          ...abs(-9, -9, w + 18, h + 24),
          boxSizing: "border-box",
          border: "5px solid var(--blue)",
          borderRadius: "34px",
          visibility: "hidden",
        },
      });
      const card = V.h("div", { class: "v-card plain c-grey", style: { ...abs(0, 0, w, h), borderRadius: "24px" } });
      const ic = V.s("svg", {
        width: 40,
        height: 40,
        viewBox: "0 0 40 40",
        style: { position: "absolute", left: "12px", top: `${(headH - 40) / 2}px`, overflow: "visible" },
      });
      if (o.icon !== false) ic.append(D5.icon.server(20, 20, 34));
      const label = V.h("div", {
        text: (o.names && o.names[i]) || `Node ${i + 1}`,
        style: {
          ...abs(o.icon === false ? 18 : 60, 0, w - 70, headH),
          ...flex,
          justifyContent: "flex-start",
          fontSize: "28px",
          fontWeight: "900",
          color: "var(--c-ink)",
          whiteSpace: "nowrap",
        },
      });
      card.append(ic, label);
      const slots = [];
      if (o.slots !== false)
        for (let j = 0; j < nslots; j++) {
          const p = slotRel(j);
          const s = V.h("div", {
            style: {
              ...abs(p.x - cw / 2 - 3, p.y - ch / 2 - 3, cw, ch),
              boxSizing: "border-box",
              border: "3px dashed var(--line-2)",
              borderRadius: "12px",
            },
          });
          slots.push(s);
          card.append(s);
        }
      const tagBox = V.h("div", { style: { ...abs(0, -68, w, 58), ...flex } });
      const tag = V.h("div", { class: "v-tag", style: { position: "relative", ...flex, fontSize: "28px" } });
      tagBox.append(tag);
      wrap.append(ring, card, tagBox);
      parent.append(wrap);
      return { wrap, ring, card, label, slots, tag, tagBox };
    });

    const set = (i, st = {}) => {
      const nd = nodes[i];
      const ghost = !!st.ghost;
      const tone = tn(st.tone || o.tone || "grey");
      setClass(nd.card, `v-card${tone === "grey" && !ghost ? " plain" : ""} c-${tone}`);
      nd.card.style.borderStyle = ghost ? "dashed" : "solid";
      nd.card.style.boxShadow = ghost ? "none" : "";
      nd.card.style.background = ghost ? "transparent" : "";
      setText(nd.label, st.label);
      const k = clamp(st.k ?? 1);
      V.place(nd.wrap, {
        x: st.x || 0,
        y: st.y || 0,
        s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)),
        o: Math.min(1, k * 4) * (st.o ?? 1),
      });
      const so = clamp(st.slotsO ?? 1);
      nd.slots.forEach((s) => V.show(s, so));
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        nd.ring.style.borderColor = D5.tone(st.ring).c;
        nd.ring.style.borderStyle = st.ringDash ? "dashed" : "solid";
        nd.ring.style.visibility = "";
        nd.ring.style.opacity = String(Math.min(1, rk * 3));
        nd.ring.style.transform = `scale(${(0.9 + 0.1 * E.pop(rk)).toFixed(3)})`;
      } else nd.ring.style.visibility = "hidden";
      const tk = clamp(st.tagK ?? (st.tag ? 1 : 0));
      if (st.tag != null) setText(nd.tag, st.tag);
      setClass(nd.tag, `v-tag c-${tn(st.tagTone || "purple")}${st.tagSolid ? " solid" : ""}`);
      V.place(nd.tag, { s: 0.8 + 0.2 * E.pop(tk), y: (1 - E.out(tk)) * 8, o: tk > 0 ? Math.min(1, tk * 4) : 0 });
    };
    const box = (i) => ({ x: left(i), y, w, h });
    return {
      set,
      box,
      n,
      w,
      h,
      cols,
      rows,
      nslots,
      cw,
      ch,
      x,
      y,
      gap,
      nodes,
      slot: (i, j) => ({ x: left(i) + slotRel(j).x, y: y + slotRel(j).y }),
      mid: (i) => ({ x: left(i) + w / 2, y: y + h / 2 }),
      top: (i) => ({ x: left(i) + w / 2, y }),
      bottom: (i) => ({ x: left(i) + w / 2, y: y + h }),
      tagAt: (i) => ({ x: left(i) + w / 2, y: y - 39 }),
    };
  }

  // ---------- 2. meter ----------
  function meter(parent, o = {}) {
    const { x = 0, y = 0, w = 180, h = 26, tone: base = "green", mark } = o;
    const el = V.h("div", {
      class: `c-${tn(base)}`,
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: `${h / 2}px`,
        background: "var(--panel-2)",
        overflow: "hidden",
      },
    });
    const fill = V.h("div", {
      style: {
        ...abs(0, 0, w - 6, h - 6),
        background: "var(--c)",
        borderRadius: `${h / 2}px`,
        transformOrigin: "0 50%",
      },
    });
    el.append(fill);
    if (mark != null)
      el.append(V.h("div", { style: { ...abs((w - 6) * mark - 2, 0, 4, h - 6), background: "var(--violet)" } }));
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `c-${tn(st.tone || base)}`);
        const k = clamp(st.k ?? 0);
        fill.style.transform = `scaleX(${Math.max(0.0001, k).toFixed(4)})`;
        fill.style.visibility = k <= 0.001 ? "hidden" : "";
        V.place(el, { x: st.x || 0, y: st.y || 0, o: st.o ?? 1 });
      },
    };
  }

  // ---------- 3. tank and rule ----------
  function tank(parent, o = {}) {
    const { x = 0, y = 0, w = 84, scale = 15, tone: base = "blue" } = o;
    const el = V.h("div", {
      class: `v-gene c-${tn(base)}`,
      text: "",
      style: { ...abs(x - w / 2, y, w, 0), borderRadius: "16px", fontSize: "28px", whiteSpace: "nowrap" },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const gb = st.gb ?? 0;
        const hh = Math.max(0, gb * scale);
        setClass(el, `v-gene c-${tn(st.tone || base)}${st.solid ? " solid" : ""}`);
        setText(el, st.text ?? `${f1(gb).replace(/\.0$/, "")} GB`);
        el.style.height = `${f1(hh)}px`;
        el.style.top = `${f1(y + (st.y || 0) - hh)}px`;
        el.style.left = `${f1(x + (st.x || 0) - w / 2)}px`;
        el.style.borderStyle = st.dashed ? "dashed" : "solid";
        el.style.transformOrigin = "50% 100%";
        V.place(el, { s: st.s ?? 1, o: hh < 1 ? 0 : (st.o ?? 1) });
        el.style.transformOrigin = "50% 100%";
      },
    };
  }
  function rule(parent, o = {}) {
    const { x = 0, y = 0, w = 300, text = "", tone: base = "purple" } = o;
    const el = V.h("div", { class: `c-${tn(base)}`, style: { ...abs(x, y, w, 0) } });
    const ln = V.h("div", { style: { ...abs(0, -2, w, 0), borderTop: "4px dashed var(--c)" } });
    const lab = V.h("div", {
      class: "v-tag",
      text,
      style: { ...abs(w - D5.tagW(text), -64), ...flex, fontSize: "28px" },
    });
    el.append(ln, lab);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        setClass(lab, `v-tag c-${tn(st.tone || base)}`);
        V.place(el, { y: st.y || 0, o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }

  // ---------- 4. hash box ----------
  function hashBox(parent, o = {}) {
    const { x = 0, y = 0, w = 190, h = 100, text = "hash" } = o;
    const el = V.h("div", {
      class: "v-card c-purple",
      style: { ...abs(x, y, w, h), ...flex, gap: "10px", borderRadius: "24px", fontSize: "34px" },
    });
    const ic = V.s("svg", { width: 48, height: 48, viewBox: "0 0 48 48", style: { overflow: "visible" } });
    ic.append(D5.icon.hash(24, 24, 44, "purple"));
    el.append(ic, V.h("span", { text, style: { fontWeight: "900" } }));
    parent.append(el);
    return {
      el,
      mid: { x: x + w / 2, y: y + h / 2 },
      set(st = {}) {
        const pulse = clamp(st.pulse ?? 0);
        const k = clamp(st.k ?? 1);
        el.style.background = pulse > 0.15 ? "var(--violet-dim)" : "";
        el.style.borderColor = pulse > 0.15 ? "var(--violet-lip)" : "";
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)) * (1 + 0.1 * pulse),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }

  // ---------- 5. number cells ----------
  function cells(parent, o = {}) {
    const { n = 16, per = 4, centres = [117, 351, 585, 819], y = 0, w = 46, h = 46, gap = 4, tone = "purple" } = o;
    const mid = (i) => {
      const g = Math.floor(i / per);
      const j = i % per;
      return { x: centres[g] + (j - (per - 1) / 2) * (w + gap), y: y + h / 2 };
    };
    const chips = Array.from({ length: n }, (_, i) =>
      D5.chip(parent, { text: String((o.texts && o.texts[i]) ?? i), tone, w, h, fs: 28, radius: 12, lip: 4 }),
    );
    return {
      chips,
      mid,
      set(i, st = {}) {
        const p = mid(i);
        chips[i].set({ ...st, x: p.x + (st.dx || 0) + (st.x || 0), y: p.y + (st.dy || 0) + (st.y || 0) });
      },
    };
  }

  // ---------- 6. text and arrows ----------
  function text(parent, o = {}) {
    const { x = 0, y = 0, fs = 28, w, align = "left" } = o;
    const el = V.h("div", {
      class: "v-text",
      text: o.text || "",
      style: { ...abs(x, y, w), fontSize: `${fs}px`, textAlign: align },
    });
    parent.append(el);
    const base = o.tone || "grey";
    return {
      el,
      set(st = {}) {
        const tone = st.tone || base;
        el.style.color = tone === "ink" ? "var(--ink)" : tone === "grey" ? "var(--text-dim)" : D5.tone(tone).ink;
        el.style.fontWeight = st.bold ? "900" : "";
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: (st.y || 0) + (1 - k) * 8, o: k * (st.o ?? 1) });
      },
    };
  }
  const link = (svg, a, b, tone = "blue", opt = {}) => {
    const g = svg.appendChild(L5.arrow(a.x, a.y, b.x, b.y, tone, 1, opt));
    return (k, o = 1) => {
      L5.drawOn(g, k);
      V.show(g, k <= 0.002 ? 0 : o);
    };
  };

  Object.assign(D5, { cluster, meter, tank, rule, hashBox, cells, text, link });
})();
