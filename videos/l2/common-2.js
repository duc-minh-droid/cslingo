/* Lecture 2 · Why EAs: drawing helpers, part 1 (window.VID.l2, short name L2). Load after common.js (data and algorithms).
   Part 2 (common-3.js) has the town graph, the tour panel and the cost card.

   Every helper appends its elements to the parent you pass (the stage) ONCE, then returns an object whose update/set you call
   EVERY frame from your scene's update(t). They are pure: each call applies exactly the state you pass (omitted fields fall back
   to their defaults), nothing is remembered between frames, nothing animates by itself. Positions are stage px (936 x 640),
   tones are "green" "red" "blue" "purple" "orange" "grey". Colours come from VID.l5.tone(name) -> {c, ink, dim, edge, lip, on}.

   1. TAG  (a v-tag you can pop, move and centre; build your own with V.h("div", {class: "v-tag c-green"}) if you prefer)
        const t = L2.tag(stage, {text: "Easy", kids: [L2.sup("1.1", "n")], tone: "green", solid: false, x, y, size: 28,
                                 anchor: "c", lip: true, pad: "6px 18px 7px"})
          anchor = which point of the tag sits at (x, y): "tl" (default) "c" "tr" "l" "r" "tc" "bc"
          text OR kids (strings and elements, e.g. from L2.sup / L2.sci) fill the tag; solid = saturated fill with -on text
        t.set({x: 0, y: 0, s: 1, r: 0, o: 1})   offset from (x, y) in px, scale and rotate pivot on the anchor point, o 0 hides
        t.text("new text")  t.el (the v-tag)  t.wrap (the element to V.place yourself)
        Its size is only known in the browser (t.el.offsetWidth), so pick anchor "c" when you need it centred on a point.

   2. BARS  (scenes 8, 9: the population as bars, 12 slots)
        const pop = L2.bars(stage, {items: [{id: "S1", f: 0.1}, ...] (all 12 up front), x: 24, base: 548, pitch: 72, w: 60,
                                    scale: 320})
        pop.set(id, {slot, dx, dy, s, o, grow, tone, solid, ring, ringTone, dash, value, name, nameTone})   applied at once:
          slot  the slot it stands in (default its own index; fractions allowed so bars can slide)   dx, dy  extra px
          s     scale about the bar's base centre   o  opacity (0 hides everything of that bar)
          grow  0..1 multiplies the height; the value label shows f x grow with one decimal (value: false hides it, a string
                replaces it, e.g. "0.9")
          tone  colour (default grey, soft tinted look); solid: true = saturated sticker fill (children, picked parents)
          ring  0..1 = a halo outline in ringTone (default orange)    dash: true = only a dashed outline (ghost, placeholder)
          name  text under the baseline (default the id)   nameTone = colour it (default dim grey)
        Call set for every bar every frame; a bar you do not set keeps whatever it was last given (initially: visible, grey).
        pop.slotX(slot) -> centre x of a slot (x + pitch / 2 + pitch x slot);  pop.base
        pop.topY(id, grow = 1) -> y of the bar top for the bar's CURRENT dy and s (arrows, badges, ticks: place them 10 px above)
        pop.valueY(id, grow = 1) -> y of the TOP of its value label (28 px text, 34 px high) = topY - 40;  pop.nameY -> top of the
          name labels (base + 16)
        Bar = sticker card (3 px border, 6 px lip), value 28 px bold above it, name 28 px under the baseline. The first bar's
        left edge is x + (pitch - w) / 2 = 30 with the defaults, so slot 0 is centred at x 60.

   3. LOOP STRIP  (Select -> Vary -> Update, scenes 8, 9, and a model for the recap)
        const strip = L2.loopStrip(stage, {x: 48, y: 0, w: 840})      three 232 x 64 stickers, total height 96
        strip.update({k: 1, active: -1, pulse: 0, loop: 0, o: 1, ghost: 1})
          k 0..1 pops the strip in (stickers staggered, then the arrows)   active -1 | 0 | 1 | 2 lights that sticker (saturated,
          -on text; the others stay grey)   pulse 0..1 bumps the active sticker (pass V.flash(t, a, b))   loop 0..1 draws the
          return arrow (Update back to Select) on in orange   ghost 0..1 opacity of the faint grey guide of the return arrow
          that is always there (default 1; 0 hides it)
        strip.pt(i) -> {x, y} top-centre of sticker i (0 Select, 1 Vary, 2 Update), strip.height 96, strip.w
        Select = orange, Vary = purple, Update = green, each with a number badge 1 / 2 / 3.

   4. CLOCK  (scene 3)
        const c = L2.clock(stage, {x, y, r: 64})        x, y = the CENTRE
        c.update({angle: 0, o: 1, s: 1, tone: "red"})     angle in degrees, 0 = 12 o'clock, clockwise

   5. STAR  (an SVG <g> to append to your own SVG layer, e.g. VID.l5.svg(stage))
        L2.star(x, y, size, tone = "orange", {w: 3}) -> <g>   size = outer diameter, centre (x, y); V.place(g, {s, r, o}) works */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { clamp, ramp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const T = (name) => L5.tone(name);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });

  // ---------- 1. tag ----------
  const ANCHORS = {
    tl: "none",
    c: "translate(-50%, -50%)",
    tr: "translate(-100%, 0)",
    l: "translate(0, -50%)",
    r: "translate(-100%, -50%)",
    tc: "translate(-50%, 0)",
    bc: "translate(-50%, -100%)",
    br: "translate(-100%, -100%)",
    bl: "translate(0, -100%)",
  };
  function tag(parent, opt = {}) {
    const { text, kids, tone = "grey", solid = false, x = 0, y = 0, size = 28, anchor = "tl", lip = solid, pad } = opt;
    if (!ANCHORS[anchor]) throw new Error(`VID.l2.tag: unknown anchor "${anchor}"`);
    const style = { left: "0", top: "0", fontSize: `${size}px`, transform: ANCHORS[anchor] };
    if (lip) style.boxShadow = "0 4px 0 var(--c-lip)";
    if (pad) style.padding = pad;
    if (tone === "grey" && !solid) style.color = "var(--ink)"; // dark ink reads better than dim grey on the pale fill
    const el = V.h("div", { class: `v-tag${solid ? " solid" : ""} c-${tone}`, style }, ...(kids || [text]));
    const wrap = V.h(
      "div",
      { style: { position: "absolute", left: `${x}px`, top: `${y}px`, width: "0", height: "0" } },
      el,
    );
    parent.append(wrap);
    return {
      el,
      wrap,
      set: (s = {}) => V.place(wrap, s),
      text: (str) => {
        if (el.textContent !== str) el.textContent = str;
      },
    };
  }

  // ---------- 2. bars ----------
  function bars(parent, opt = {}) {
    const { items, x = 24, base = 548, pitch = 72, w = 60, scale = 320 } = opt;
    if (!items || !items.length) throw new Error("VID.l2.bars: items [{id, f}] required");
    const slotX = (slot) => x + pitch / 2 + pitch * slot;
    const BW = 80;
    const bars = {};
    const need = (id) => {
      if (!bars[id]) throw new Error(`VID.l2.bars: no bar "${id}"`);
      return bars[id];
    };
    items.forEach((it, i) => {
      const ring = V.h("div", {
        style: {
          position: "absolute",
          boxSizing: "border-box",
          borderRadius: "22px",
          borderWidth: "5px",
          borderStyle: "solid",
        },
      });
      const bar = V.h("div", {
        style: { position: "absolute", boxSizing: "border-box", border: "3px solid", borderRadius: "14px" },
      });
      const value = V.h("div", {
        style: {
          position: "absolute",
          left: "0",
          width: `${BW}px`,
          textAlign: "center",
          fontSize: "28px",
          lineHeight: "34px",
          fontWeight: "800",
        },
      });
      const name = V.h("div", {
        style: {
          position: "absolute",
          left: "0",
          top: `${base + 16}px`,
          width: `${BW}px`,
          textAlign: "center",
          fontSize: "28px",
          lineHeight: "34px",
          fontWeight: "800",
        },
      });
      const wrap = V.h(
        "div",
        {
          style: {
            ...abs(slotX(i) - BW / 2, 0, BW, base + 60),
            transformOrigin: `${BW / 2}px ${base}px`,
            pointerEvents: "none",
          },
        },
        ring,
        bar,
        value,
        name,
      );
      parent.append(wrap);
      bars[it.id] = { it, i, wrap, ring, bar, value, name, dy: 0, s: 1 };
    });
    const set = (id, st = {}) => {
      const b = need(id);
      const {
        slot = b.i,
        dx = 0,
        dy = 0,
        s = 1,
        o = 1,
        grow = 1,
        tone = "grey",
        solid = false,
        ring = 0,
        ringTone = "orange",
        dash = false,
        value,
        name,
        nameTone,
      } = st;
      Object.assign(b, { dy, s });
      const tn = T(tone);
      b.wrap.style.transform = `translate(${f1(dx + (slot - b.i) * pitch)}px, ${f1(dy)}px) scale(${s})`;
      V.show(b.wrap, o);
      const h = b.it.f * scale * clamp(grow);
      const show = h > 3;
      const top = base - h;
      Object.assign(b.bar.style, {
        left: `${(BW - w) / 2}px`,
        top: `${f1(top)}px`,
        width: `${w}px`,
        height: `${f1(Math.max(h, 0))}px`,
        visibility: show ? "" : "hidden",
        background: dash ? "transparent" : solid ? tn.c : tn.dim,
        borderColor: dash ? tn.c : solid ? tn.lip : tn.edge,
        borderStyle: dash ? "dashed" : "solid",
        boxShadow: dash ? "none" : `0 6px 0 ${solid ? tn.lip : tn.edge}`,
      });
      const rg = T(ringTone);
      Object.assign(b.ring.style, {
        left: `${(BW - w) / 2 - 9}px`,
        top: `${f1(top - 9)}px`,
        width: `${w + 18}px`,
        height: `${f1(h + 18 + 6)}px`,
        borderColor: rg.c,
        opacity: String(clamp(ring)),
        visibility: ring > 0.01 && show ? "" : "hidden",
        transform: `scale(${f1(0.88 + 0.12 * clamp(ring))})`,
      });
      const label = value === false ? "" : typeof value === "string" ? value : (b.it.f * clamp(grow)).toFixed(1);
      Object.assign(b.value.style, {
        top: `${f1(top - 40)}px`,
        color: tone === "grey" ? "var(--ink)" : tn.ink,
        visibility: show && label ? "" : "hidden",
      });
      if (b.value.textContent !== label) b.value.textContent = label;
      const nm = name == null ? b.it.id : name;
      if (b.name.textContent !== nm) b.name.textContent = nm;
      b.name.style.color = nameTone ? T(nameTone).ink : "var(--text-dim)";
    };
    const topY = (id, grow = 1) => {
      const b = need(id);
      return base + b.dy - b.it.f * scale * clamp(grow) * b.s;
    };
    items.forEach((it) => set(it.id));
    return { set, slotX, topY, valueY: (id, grow = 1) => topY(id, grow) - 40, nameY: base + 16, base };
  }

  // ---------- 3. loop strip ----------
  const STEPS = [
    ["Select", "orange"],
    ["Vary", "purple"],
    ["Update", "green"],
  ];
  function loopStrip(parent, opt = {}) {
    const { x = 0, y = 0, w = 840 } = opt;
    const [SW, SH] = [232, 64];
    const pitch = (w - SW) / 2;
    const cards = STEPS.map(([label, tn], i) => {
      const badge = V.h("div", {
        text: String(i + 1),
        style: {
          width: "40px",
          height: "40px",
          boxSizing: "border-box",
          borderRadius: "50%",
          border: "3px solid",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "900",
          flex: "none",
        },
      });
      const word = V.h("span", { text: label });
      const el = V.h(
        "div",
        {
          style: {
            ...abs(x + pitch * i, y, SW, SH),
            boxSizing: "border-box",
            border: "3px solid",
            borderRadius: "22px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 14px",
            fontSize: "34px",
            fontWeight: "900",
          },
        },
        badge,
        word,
      );
      parent.append(el);
      return { el, badge, tn };
    });
    const svg = L5.svg(parent);
    const cy = y + SH / 2;
    const links = [0, 1].map((i) => {
      const g = L5.arrow(x + pitch * i + SW + 10, cy, x + pitch * (i + 1) - 10, cy, "grey", 1, { w: 5, head: 16 });
      svg.append(g);
      return g;
    });
    const [sx, ux] = [x + SW / 2, x + pitch * 2 + SW / 2];
    const [yb, yl] = [y + SH + 6, y + 96];
    const line = `M ${f1(ux)} ${f1(yb)} L ${f1(ux)} ${f1(yl)} L ${f1(sx)} ${f1(yl)} L ${f1(sx)} ${f1(yb + 18)}`;
    const head = `M ${f1(sx)} ${f1(yb)} L ${f1(sx - 11)} ${f1(yb + 20)} L ${f1(sx + 11)} ${f1(yb + 20)} Z`;
    const path = (colour) =>
      V.s("path", {
        d: line,
        fill: "none",
        pathLength: "1",
        "stroke-width": "5",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: colour },
      });
    const tri = (colour) =>
      V.s("path", {
        d: head,
        "stroke-width": "3",
        "stroke-linejoin": "round",
        style: { fill: colour, stroke: colour },
      });
    const ghost = V.s("g", {}, path(T("grey").edge), tri(T("grey").edge));
    const live = path(T("orange").c);
    const liveHead = tri(T("orange").c);
    svg.append(ghost, live, liveHead);
    function update(st = {}) {
      const { k = 1, active = -1, pulse = 0, loop = 0, o = 1, ghost: gh = 1 } = st;
      cards.forEach((c, i) => {
        const on = i === active;
        const tn = T(on ? c.tn : "grey");
        const kk = ramp(k, i * 0.18, i * 0.18 + 0.6, E.pop);
        Object.assign(c.el.style, {
          background: on ? tn.c : tn.dim,
          borderColor: on ? tn.lip : tn.edge,
          boxShadow: `0 6px 0 ${on ? tn.lip : tn.edge}`,
          color: on ? tn.on : "var(--ink)",
        });
        Object.assign(c.badge.style, {
          background: "var(--panel)",
          borderColor: on ? tn.lip : tn.edge,
          color: "var(--ink)",
        });
        V.place(c.el, {
          s: (0.7 + 0.3 * kk) * (on ? 1 + 0.1 * clamp(pulse) : 1),
          o: clamp(ramp(k, i * 0.18, i * 0.18 + 0.25, E.lin) * o),
        });
      });
      links.forEach((g, i) => V.place(g, { o: ramp(k, 0.45 + i * 0.1, 0.8 + i * 0.1, E.lin) * o }));
      V.place(ghost, { o: clamp(gh) * ramp(k, 0.7, 1, E.lin) * o * 0.8 });
      live.style.strokeDasharray = "1 1";
      live.style.strokeDashoffset = String(1 - clamp(loop));
      V.place(live, { o: loop > 0.002 ? o : 0 });
      V.place(liveHead, { o: ramp(loop, 0.85, 1, E.lin) * o });
    }
    update({ k: 0 });
    return { update, pt: (i) => ({ x: x + pitch * i + SW / 2, y }), height: 96, w };
  }

  // ---------- 4. clock ----------
  function clock(parent, opt = {}) {
    const { x = 0, y = 0, r = 64 } = opt;
    const wrap = V.h("div", { style: abs(x - r, y - r, 2 * r, 2 * r) });
    const svg = V.s("svg", {
      width: 2 * r,
      height: 2 * r,
      style: { overflow: "visible", position: "absolute", left: "0", top: "0" },
    });
    const lipC = V.s("circle", { cx: r, cy: r + 6, r: r - 2, "stroke-width": "4" });
    const face = V.s("circle", { cx: r, cy: r, r: r - 2, "stroke-width": "4", style: { fill: "var(--panel)" } });
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      const [r0, r1] = [r - (i % 3 ? 17 : 22), r - 10];
      return V.s("line", {
        x1: f1(r + r0 * Math.sin(a)),
        y1: f1(r - r0 * Math.cos(a)),
        x2: f1(r + r1 * Math.sin(a)),
        y2: f1(r - r1 * Math.cos(a)),
        "stroke-width": i % 3 ? "3" : "5",
        "stroke-linecap": "round",
      });
    });
    const hand = V.s("line", {
      x1: r,
      y1: r,
      x2: r,
      y2: f1(r - r * 0.66),
      "stroke-width": "7",
      "stroke-linecap": "round",
    });
    const hub = V.s("circle", { cx: r, cy: r, r: 7 });
    svg.append(lipC, face, ...ticks, hand, hub);
    wrap.append(svg);
    parent.append(wrap);
    return {
      update(st = {}) {
        const { angle = 0, o = 1, s = 1, tone = "red" } = st;
        const tn = T(tone);
        lipC.style.fill = tn.lip;
        lipC.style.stroke = tn.lip;
        face.style.stroke = tn.c;
        ticks.forEach((t) => (t.style.stroke = tn.ink));
        hand.style.stroke = tn.ink;
        hub.style.fill = tn.ink;
        hand.setAttribute("transform", `rotate(${f1(angle)} ${r} ${r})`);
        V.place(wrap, { s, o });
      },
    };
  }

  // ---------- 5. star ----------
  function star(x, y, size, tone = "orange", opt = {}) {
    const R = size / 2;
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5;
      const rr = i % 2 ? R * 0.46 : R;
      return `${f1(x + rr * Math.sin(a))},${f1(y + 0.06 * R - rr * Math.cos(a))}`;
    }).join(" ");
    const tn = T(tone);
    return V.s(
      "g",
      {},
      V.s("polygon", {
        points: pts,
        "stroke-width": String(opt.w || 3),
        "stroke-linejoin": "round",
        style: { fill: tn.c, stroke: tn.lip },
      }),
    );
  }

  Object.assign(L2, { tag, bars, loopStrip, clock, star });
})();
