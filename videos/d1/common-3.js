/* Lecture 1 · Reliable, scalable and maintainable systems: machines, traffic and bars (VID.d1, short name D1). Needs l5/common.js,
   d1/common.js and d1/common-2.js loaded first. Positions are the parent's pixels (the stage is 936 x 640). EVERY CALL IS PURE:
   call set() / update() each frame with everything you want to see; nothing is remembered between frames.

   1. SERVER  (a rack sticker: two slots, an LED, a text line and a load meter whose full width = the capacity)
        const s = D1.server(parent, {x, y, w: 130, h: 150, label: "1", fs: 28});   x, y = top-left; any size works (the parts scale)
        s.set({state, load, label, text, k, x, y, s, o, shake})
            state: "idle" grey (not in use) | "ok" green | "hot" orange (near capacity) | "over" orange tint (above capacity,
            the meter is full) | "down" red tint with a red cross (dead) | "ghost" dashed empty outline (does not exist)
            load: 0..1 fills the meter (1 = at capacity; pass load / capacity and anything above 1 shows a full meter)
            label: small name at the top (default the one given in the options);  text: the big line in the middle, e.g. "84"
            k 0..1 pops it in;  x, y offsets;  s scale;  o opacity;  shake: horizontal offset in px (a hit)
        s.mid() / s.top() / s.bottom() / s.left() / s.right() -> {x, y} anchor points in PARENT coordinates, s.w, s.h, s.el
        const row = D1.servers(parent, {n: 6, x, y, w: 130, h: 150, gap: 16, label: (i) => String(i + 1), fs}) -> {list, mid(i),
            top(i), bottom(i), set(i, st), all(fn)}   a row of n servers (row.list[i] is a D1.server)
   2. STREAM  (packets walking along a path, looping while the scene holds; a share of them can be dropped on the way)
        const st = D1.stream(parent, {path: D1.poly([[x, y], ...]), n: 10, tone: "blue", size: 26, square: true});
        st.update({t, t0: 0, period: 1.8, rate: 1, dropShare: 0, dropAt: 0.82, tone, o: 1, tones: fn(i, cycle) -> tone})
            t = scene time; each packet takes `period` s to walk the whole path, n packets are spread over one period; none shows
            before t0.  rate 0..1 = the share of packet slots in use (the traffic: use it to raise and lower the load);
            dropShare 0..1 = the share of packets that are dropped when they reach path fraction dropAt (they turn red, fall 60 px
            and fade); o fades them all.  Which packet is dropped or skipped is a fixed pattern, so seeking is exact.
   3. WIRE  (a straight link that can be drawn on and cut)
        const w = D1.wire(parent, {x1, y1, x2, y2, w: 8});
        w.set({tone: "grey", k: 1, cut: 0, o: 1, dash: false})   k 0..1 draws it from (x1, y1); cut 0..1 opens a gap in the
            middle and pops a red spark in it (the broken network link);  w.mid() -> {x, y};  w.at(f) -> {x, y}
   4. BAR  (a horizontal sticker bar with its number)
        const b = D1.bar(parent, {x, y, w: 400, h: 48, tone: "blue"});   w = the width of a full bar
        b.set({v: 0..1, tone, text, k, o, x, y})   text sits inside the bar when it is wide enough, else just after its end
   5. USER  (a person icon with a name under it; x, y = the centre of the icon)
        const u = D1.user(parent, {x, y, size: 64, name: "Ana", tone: "grey"});   u.set({tone, name, k, x, y, s, o})  u.el */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { abs, f1, tn } = D1;

  // ---------- 1. server ----------
  const STATE = {
    idle: { tone: "grey", plain: true },
    ok: { tone: "green", plain: true },
    hot: { tone: "orange", plain: true },
    over: { tone: "orange", plain: false },
    down: { tone: "red", plain: false },
    ghost: { tone: "grey", plain: true },
  };
  function server(parent, o = {}) {
    const { x = 0, y = 0, w = 130, h = 150, fs = 28 } = o;
    const el = V.h("div", {
      class: "v-card plain c-grey",
      style: { ...abs(x, y, w, h), borderRadius: `${Math.round(Math.min(w, h) * 0.2)}px` },
    });
    const bar = (cls, l, t, bw, bh) =>
      V.h("div", { class: cls, style: { ...abs(l, t, bw, bh), borderRadius: `${f1(bh / 2)}px` } });
    const slots = [0, 1].map((i) => bar("", w * 0.12, h * 0.1 + i * h * 0.085, w * 0.5, h * 0.05));
    slots.forEach((s) => (s.style.background = "var(--line)"));
    const led = V.h("div", {
      style: { ...abs(w * 0.76, h * 0.095, h * 0.085, h * 0.085), borderRadius: "50%", background: "var(--line-2)" },
    });
    const lab = V.h("div", {
      class: "v-text dim",
      text: o.label || "",
      style: { ...abs(0, h * 0.27, w - 6), textAlign: "center", fontSize: `${fs}px`, lineHeight: "1" },
    });
    const txt = V.h("div", {
      class: "v-text",
      style: {
        ...abs(0, h * 0.45, w - 6),
        textAlign: "center",
        fontSize: `${Math.round(fs * 1.35)}px`,
        fontWeight: "900",
        lineHeight: "1",
        color: "var(--ink)",
      },
    });
    const track = bar("", w * 0.1, h * 0.75, w * 0.8 - 6, h * 0.1);
    Object.assign(track.style, { background: "var(--line)", overflow: "hidden" });
    const fill = V.h("div", { style: { ...abs(0, 0, 0, h * 0.1), borderRadius: `${f1(h * 0.05)}px` } });
    track.append(fill);
    const cross = V.s(
      "svg",
      {
        width: w,
        height: h,
        style: { position: "absolute", left: "-3px", top: "-3px", overflow: "visible", visibility: "hidden" },
      },
      L5.cross(w / 2, h * 0.5, Math.min(w, h) * 0.5, "red", { ink: true, w: Math.max(8, Math.min(w, h) * 0.1) }),
    );
    el.append(...slots, led, lab, txt, track, cross);
    parent.append(el);
    return {
      el,
      w,
      h,
      set(st = {}) {
        const sp = STATE[st.state || "idle"];
        if (!sp) throw new Error(`VID.d1.server: unknown state "${st.state}"`);
        const ghost = st.state === "ghost";
        const down = st.state === "down";
        D1.setClass(el, `v-card${sp.plain ? " plain" : ""} c-${sp.tone}`);
        el.style.borderStyle = ghost ? "dashed" : "";
        el.style.boxShadow = ghost ? "none" : "";
        el.style.background = ghost ? "transparent" : "";
        const col = D1.tone(sp.tone);
        led.style.background = st.state === "idle" || ghost ? "var(--line-2)" : col.c;
        D1.setText(lab, st.label);
        D1.setText(txt, st.text);
        txt.style.color = st.state === "over" || st.state === "hot" ? col.ink : "var(--ink)";
        const load = clamp(st.load || 0, 0, 1);
        fill.style.width = `${f1(load * (w * 0.8 - 6))}px`;
        fill.style.background = col.c;
        const hide = (e, on) => (e.style.visibility = on ? "hidden" : "");
        hide(fill, down || ghost || load <= 0.001);
        [lab, txt, track, led, ...slots].forEach((e) => hide(e, ghost));
        hide(txt, ghost || down);
        cross.style.visibility = down ? "" : "hidden";
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: (st.x || 0) + (st.shake || 0),
          y: st.y || 0,
          s: (st.s ?? 1) * (0.85 + 0.15 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
      mid: () => ({ x: x + w / 2, y: y + h / 2 }),
      top: () => ({ x: x + w / 2, y }),
      bottom: () => ({ x: x + w / 2, y: y + h }),
      left: () => ({ x, y: y + h / 2 }),
      right: () => ({ x: x + w, y: y + h / 2 }),
    };
  }
  function servers(parent, o = {}) {
    const { n = 6, x = 0, y = 0, w = 130, h = 150, gap = 16, fs = 28 } = o;
    const list = Array.from({ length: n }, (_, i) =>
      server(parent, { x: x + i * (w + gap), y, w, h, fs, label: o.label ? o.label(i) : String(i + 1) }),
    );
    return {
      list,
      mid: (i) => list[i].mid(),
      top: (i) => list[i].top(),
      bottom: (i) => list[i].bottom(),
      set: (i, st) => list[i].set(st),
      all: (fn) => list.forEach((s, i) => s.set(fn(i) || {})),
    };
  }

  // ---------- 2. stream ----------
  function stream(parent, o = {}) {
    const { path, n = 10, tone: base = "blue", size = 26, square = true } = o;
    const toks = Array.from({ length: n }, () => D1.token(parent, { tone: base, size, square }));
    const pat = (j, c, mul, add) => ((j * mul + c * add) % 10) / 10; // a fixed pseudo-random pattern in 0..0.9
    return {
      toks,
      update(u = {}) {
        const { t = 0, t0 = 0, period = 1.8, rate = 1, dropShare = 0, dropAt = 0.82, tone = base, o: op = 1 } = u;
        toks.forEach((tk, j) => {
          const v = (t - t0) / period - j / n;
          if (v < 0) return tk.set({ o: 0 });
          const c = Math.floor(v);
          const f = v - c;
          if (pat(j, c, 3, 7) >= rate) return tk.set({ o: 0 });
          const drop = pat(j, c, 7, 3) < dropShare;
          const col = u.tones ? u.tones(j, c) : drop && f > dropAt ? "red" : tone;
          if (drop && f > dropAt) {
            const q = (f - dropAt) / (1 - dropAt);
            const p = path.at(dropAt);
            return tk.set({ x: p.x, y: p.y + 60 * E.out(q), s: 1 - 0.4 * q, o: (1 - q) * op, tone: col });
          }
          const p = path.at(f);
          tk.set({
            x: p.x,
            y: p.y,
            s: 1 - 0.5 * V.ramp(f, 0.92, 1, E.lin),
            o: Math.min(V.ramp(f, 0, 0.06, E.lin), 1 - V.ramp(f, 0.92, 1, E.lin)) * op,
            tone: col,
          });
        });
      },
    };
  }

  // ---------- 3. wire ----------
  function wire(parent, o = {}) {
    const { x1, y1, x2, y2, w = 8 } = o;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const at = (f) => ({ x: x1 + (x2 - x1) * f, y: y1 + (y2 - y1) * f });
    const svg = L5.svg(parent);
    const seg = () => V.s("line", { "stroke-width": f1(w), "stroke-linecap": "round" });
    const [a, b] = [svg.appendChild(seg()), svg.appendChild(seg())];
    const mid = at(0.5);
    const spark = svg.appendChild(D1.icon.spark(mid.x, mid.y, 74, "red"));
    const place = (e, p, q) => {
      e.setAttribute("x1", f1(p.x));
      e.setAttribute("y1", f1(p.y));
      e.setAttribute("x2", f1(q.x));
      e.setAttribute("y2", f1(q.y));
    };
    return {
      svg,
      mid: () => mid,
      at,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        const cut = clamp(st.cut || 0);
        const gap = cut * 36;
        const colour = D1.tone(tn(st.tone || "grey")).c;
        const reach = k; // fraction drawn
        const end1 = Math.min(reach, 0.5 - gap / len);
        place(a, at(0), at(Math.max(0, end1)));
        place(b, at(0.5 + gap / len), at(Math.max(0.5 + gap / len, reach)));
        for (const e of [a, b]) {
          e.style.stroke = cut > 0.05 ? D1.tone("red").c : colour;
          e.style.strokeDasharray = st.dash ? `${f1(w * 1.4)} ${f1(w * 1.6)}` : "";
        }
        V.show(a, end1 > 0.002 ? (st.o ?? 1) : 0);
        V.show(b, reach > 0.5 + gap / len + 0.002 ? (st.o ?? 1) : 0);
        V.place(spark, { s: 0.5 + 0.5 * E.pop(cut), o: clamp(cut * 3) * (st.o ?? 1) });
      },
    };
  }

  // ---------- 4. bar ----------
  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 400, h = 48, tone: base = "blue" } = o;
    const wrap = V.h("div", { style: abs(x, y, w + 260, h) });
    const rail = V.h("div", {
      style: { ...abs(0, 0, w, h), borderRadius: `${h / 2}px`, background: "var(--line)", opacity: "0.55" },
    });
    const fill = V.h("div", {
      class: "v-gene solid c-blue",
      style: { ...abs(0, 0, 0, h), borderRadius: `${h / 2}px`, borderWidth: "3px", boxShadow: "0 4px 0 var(--c-lip)" },
    });
    const txt = V.h("div", {
      class: "v-text",
      style: { ...abs(0, 0), top: `${f1((h - 34) / 2)}px`, fontSize: "28px", lineHeight: "34px", fontWeight: "900" },
    });
    wrap.append(rail, fill, txt);
    parent.append(wrap);
    return {
      el: wrap,
      set(st = {}) {
        const v = clamp(st.v ?? 0);
        const px = Math.max(v > 0.0005 ? h * 0.5 : 0, v * w);
        D1.setClass(fill, `v-gene solid c-${tn(st.tone || base)}`);
        fill.style.width = `${f1(px)}px`;
        fill.style.visibility = px <= 0.5 ? "hidden" : "";
        D1.setText(txt, st.text);
        const inside = px > D1.tagW(txt.textContent, 28) - 6;
        txt.style.left = `${f1(inside ? 18 : px + 14)}px`;
        txt.style.color = inside ? D1.tone(tn(st.tone || base)).on : "var(--ink)";
        const k = clamp(st.k ?? 1);
        V.place(wrap, { x: st.x || 0, y: (st.y || 0) + (1 - k) * 8, o: k * (st.o ?? 1) });
      },
    };
  }

  // ---------- 5. user ----------
  function user(parent, o = {}) {
    const { x = 0, y = 0, size = 64, tone: base = "grey" } = o;
    const wd = Math.max(size * 2, 120);
    const el = V.h("div", { style: abs(x - wd / 2, y - size * 0.6, wd, size * 1.3 + 40) });
    const svg = V.s("svg", {
      width: wd,
      height: size * 1.3,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    const icons = D1.TONES.map((t) => svg.appendChild(D1.icon.person(wd / 2, size * 0.6, size, t)));
    const nm = V.h("div", {
      class: "v-text dim",
      text: o.name || "",
      style: { ...abs(0, size * 1.12, wd), textAlign: "center", fontSize: "28px", lineHeight: "1.1" },
    });
    el.append(svg, nm);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const tone = tn(st.tone || base);
        icons.forEach((g, i) => V.show(g, +(D1.TONES[i] === tone)));
        D1.setText(nm, st.name);
        nm.style.visibility = (st.name ?? o.name) ? "" : "hidden";
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }

  Object.assign(D1, { server, servers, stream, wire, bar, user });
})();
