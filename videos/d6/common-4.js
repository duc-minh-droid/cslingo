/* Lecture 6 · Consistency and consensus: the timeline, the meter and the step plot (VID.d6, short name D6), part 4. Needs
   videos/l5/common.js and d6/common.js .. common-3.js. EVERY CALL IS PURE: call set()/update() each frame from update(t) with
   everything you want to see; nothing is remembered between frames. Tones as everywhere (green agreed / latest / committed, red
   failure, orange old / undone / waiting, blue the request or data followed, purple the coordinator, rules and the flip moment).

   1. TIMELINE  (lanes of operations over time: the register histories of lessons 6.2 and 6.3 and the two payments of scene 5)
        const tl = D6.timeline(parent, {x: 0, y: 0, w: 936, T: 13, lanes: ["Client A", "Client B", "Client C"], laneH: 92, labelW: 170,
                                        barH: 60, axis: true});
            Lane i is a dashed guide line with its name at the left (28 px, grey); time runs left to right from x + labelW to x + w - 12
            over T time units; an arrow and the word "time" sit under the last lane when axis is true.
        tl.set({k: 1, o: 1})        k 0..1 fades the scaffold (names, guides, axis) in
        tl.x(t) -> px in parent coordinates;  tl.laneY(i) -> top of lane i's bars;  tl.laneMid(i) -> centre y of lane i;  tl.top (= y),
            tl.bottom (= y + lanes * laneH);  tl.width (px of the time axis), tl.x0
        const b = tl.bar({lane: 2, s: 4, e: 11, text: "write 1", tone: "purple", fs: 28});  one operation as a sticker bar from time s to e
            (make the bar at least 120 px wide for 7 characters: 1 time unit = tl.width / T px).
            b.set({k: 1, tone, solid, text, o, ring: tone | null, x, y, s})
              k 0..1 grows the bar from its left end (its text is revealed with it); ring = a coloured outline just outside the bar;
              x, y = offset in px; s = scale. b.x0, b.x1 (left and right end in px), b.mid -> {x, y} (centre), b.right -> {x, y} (right end,
              mid height), b.left.
        const z = tl.zone({s: 0, e: 6, tone: "grey", text: "x = 0"});  a tinted band behind all lanes from time s to e with a 28 px label at
            its top. z.set({k: 1, o: 1, tone, text, s, e})  (s and e may move, so a band can follow the flip line)
        const f = tl.flip();  the flip moment: a dashed vertical line over every lane with a small tag on top.
            f.set({t: 6, k: 1, tone: "purple", text: "flip", o: 1})  t = a time on the axis; k 0..1 draws it down from the top.
        const r = tl.range({s: 4, e: 7, row: 0, tone: "green", text: "before 7"});  a bracket under the lanes from time s to e (a line with
            two end ticks) with a 28 px label under it; row 0, 1, 2 ... = how far below the lanes (46 px per row).
            r.set({k: 1, o: 1, tone, text, s, e})
   2. METER  (a labelled horizontal bar with a number: response times, counts)
        const m = D6.meter(parent, {x, y, w: 800, label: "answer from the local copy", max: 62, unit: "ms", tone: "green"});   about 92 px high
            (label row 36 px, bar 44 px; the number sits after the bar's end, so keep ~120 px free at the right: the bar is w - 130 long
            at v = max)
        m.set({v: 62, k: 1, o: 1, tone, text, x, y})   v = the value shown (animate it with V.ramp for a growing bar and a counting number;
            text overrides "62 ms"); a bar is never narrower than 16 px once v > 0.  m.end(v) -> x of the bar's end for a value.
   3. STEP PLOT  (the replicas holding the update, tick by tick: lesson 6.2's staircase)
        const p = D6.stepPlot(parent, {x, y, w: 440, h: 250, xMax: 4, yMax: 3, counts: D6.EV.counts});   x, y = top-left of the plot area
            (leave 60 px at the left for the y numbers 1, 2, 3 and 80 px under it for the x numbers 0 .. xMax and the word "tick")
        p.set({tick: 2.4, k: 1, o: 1, tone: "green"})   tick = how far time has run (a fraction is fine): the staircase is drawn up to it
            with a dot at its end; the count at tick is counts[floor(tick)].  p.pt(tick, count) -> {x, y} px in parent coordinates. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { abs, flex, f1, D, tn, setText, setClass } = D6;

  // ---------- 1. timeline ----------
  function timeline(parent, o = {}) {
    const { x = 0, y = 0, w = 936, T = 13, lanes = [], laneH = 92, labelW = 170, barH = 60, axis = true } = o;
    const x0 = x + labelW;
    const width = w - labelW - 12;
    const tx = (t) => x0 + (t / T) * width;
    const laneY = (i) => y + i * laneH + (laneH - barH) / 2;
    const laneMid = (i) => y + i * laneH + laneH / 2;
    const bottom = y + lanes.length * laneH;
    const zoneLayer = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
    parent.append(zoneLayer);
    const svg = L5.svg(parent);
    const scaffold = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
    const names = lanes.map((n, i) =>
      V.h("div", {
        class: "v-text dim",
        text: n,
        style: { ...abs(x, laneMid(i) - 17, labelW - 14), textAlign: "left", fontSize: "28px" },
      }),
    );
    scaffold.append(...names);
    parent.append(scaffold);
    const guides = lanes.map((_, i) =>
      V.s("line", {
        x1: f1(x0),
        x2: f1(x0 + width),
        y1: f1(laneMid(i)),
        y2: f1(laneMid(i)),
        "stroke-width": 3,
        "stroke-dasharray": "4 9",
        "stroke-linecap": "round",
        style: { stroke: "var(--line-2)" },
      }),
    );
    const timeArrow = L5.arrow(x0, bottom + 24, x0 + width, bottom + 24, "grey", 1, { w: 5, head: 16 });
    const timeLabel = V.h("div", {
      class: "v-text dim",
      text: "time",
      style: { ...abs(x0 + width - 150, bottom + 36, 150), textAlign: "right", fontSize: "28px" },
    });
    svg.append(...guides, ...(axis ? [timeArrow] : []));
    if (axis) scaffold.append(timeLabel);
    const api = {
      x: tx,
      laneY,
      laneMid,
      top: y,
      bottom,
      width,
      x0,
      set(st = {}) {
        const k = clamp(st.k ?? 1) * (st.o ?? 1);
        V.show(scaffold, k);
        V.show(svg, k);
      },
    };

    api.bar = (b) => {
      const { lane = 0, s = 0, e = 1, tone: base = "blue", fs = 28 } = b;
      const [bx, bw] = [tx(s), tx(e) - tx(s)];
      const el = V.h("div", {
        class: `v-card c-${tn(base)}`,
        style: {
          ...abs(bx, laneY(lane), bw, barH),
          borderRadius: "18px",
          boxShadow: "0 5px 0 var(--c-edge)",
          overflow: "hidden",
        },
      });
      const inner = V.h("div", {
        text: b.text || "",
        style: { ...abs(0, 0, bw, barH - 3), ...flex, fontSize: `${fs}px`, fontWeight: "900", whiteSpace: "nowrap" },
      });
      el.append(inner);
      parent.append(el);
      const mid = { x: bx + bw / 2, y: laneMid(lane) };
      return {
        el,
        x0: bx,
        x1: bx + bw,
        mid,
        left: { x: bx, y: mid.y },
        right: { x: bx + bw, y: mid.y },
        set(st = {}) {
          setClass(el, `v-card c-${tn(st.tone || base)}`);
          Object.assign(el.style, {
            background: st.solid ? "var(--c)" : "",
            borderColor: st.solid ? "var(--c-lip)" : "",
            boxShadow: st.solid ? "0 5px 0 var(--c-lip)" : "0 5px 0 var(--c-edge)",
            color: st.solid ? "var(--c-on)" : "",
            outline: st.ring ? `5px solid ${D6.tone(st.ring).c}` : "none",
            outlineOffset: "5px",
          });
          setText(inner, st.text);
          const k = clamp(st.k ?? 1);
          el.style.width = `${f1(Math.max(0, bw * E.out(k)))}px`;
          V.place(el, { x: st.x || 0, y: st.y || 0, s: st.s ?? 1, o: Math.min(1, k * 6) * (st.o ?? 1) });
        },
      };
    };

    api.zone = (z) => {
      const { tone: base = "grey", s: s0 = 0, e: e0 = 1 } = z;
      const el = V.h("div", {
        class: `c-${tn(base)}`,
        style: {
          ...abs(tx(s0), y - 8, tx(e0) - tx(s0), bottom - y + 16),
          background: "var(--c-dim)",
          borderRadius: "18px",
        },
      });
      const lab = V.h("div", {
        text: z.text || "",
        style: {
          ...abs(0, 4, 10),
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "900",
          color: "var(--c-ink)",
          whiteSpace: "nowrap",
        },
      });
      el.append(lab);
      zoneLayer.append(el);
      return {
        el,
        set(st = {}) {
          setClass(el, `c-${tn(st.tone || base)}`);
          const [a, b] = [tx(st.s ?? s0), tx(st.e ?? e0)];
          el.style.left = `${f1(a)}px`;
          el.style.width = `${f1(Math.max(0, b - a))}px`;
          lab.style.width = el.style.width;
          setText(lab, st.text);
          V.place(el, { o: clamp(st.k ?? 1) * (st.o ?? 1) });
        },
      };
    };

    api.flip = () => {
      const line = V.s("line", {
        y1: f1(y - 10),
        "stroke-width": 6,
        "stroke-dasharray": "3 11",
        "stroke-linecap": "round",
      });
      svg.append(line);
      const tg = D6.tag(parent, { x: 0, y: y - 66, text: "flip", tone: "purple", solid: true });
      return {
        set(st = {}) {
          const { t = 0, k = 1, tone = "purple", o: op = 1 } = st;
          const X = tx(t);
          const kk = clamp(k);
          line.style.stroke = D6.tone(tone).c;
          line.setAttribute("x1", f1(X));
          line.setAttribute("x2", f1(X));
          line.setAttribute("y2", f1(y - 10 + (bottom - y + 20) * E.out(kk)));
          V.show(line, kk > 0.002 ? op : 0);
          tg.set({ text: st.text || "flip", tone, solid: true, k: kk, o: op, x: X - D6.tagW(st.text || "flip") / 2 });
        },
      };
    };

    api.range = (r) => {
      const { row = 0, tone: base = "green", s: s0 = 0, e: e0 = 1 } = r;
      const ry = bottom + 30 + row * 46;
      const g = V.s("g", {});
      const base0 = V.s("line", { "stroke-width": 6, "stroke-linecap": "round" });
      const ticks = [0, 1].map(() => V.s("line", { "stroke-width": 6, "stroke-linecap": "round" }));
      g.append(base0, ...ticks);
      svg.append(g);
      const lab = V.h("div", {
        text: r.text || "",
        style: {
          ...abs(0, ry + 4, 10),
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "900",
          whiteSpace: "nowrap",
        },
      });
      parent.append(lab);
      return {
        set(st = {}) {
          const tone = D6.tone(st.tone || base);
          const [a, b] = [tx(st.s ?? s0), tx(st.e ?? e0)];
          const k = clamp(st.k ?? 1);
          const bb = a + (b - a) * E.out(k);
          const setL = (l, x1, y1, x2, y2) => {
            l.setAttribute("x1", f1(x1));
            l.setAttribute("y1", f1(y1));
            l.setAttribute("x2", f1(x2));
            l.setAttribute("y2", f1(y2));
            l.style.stroke = tone.c;
          };
          setL(base0, a, ry, bb, ry);
          setL(ticks[0], a, ry - 12, a, ry + 12);
          setL(ticks[1], bb, ry - 12, bb, ry + 12);
          V.show(g, k > 0.002 ? (st.o ?? 1) : 0);
          lab.style.left = `${f1(a)}px`;
          lab.style.width = `${f1(Math.max(10, b - a))}px`;
          lab.style.color = tone.ink;
          setText(lab, st.text);
          V.place(lab, { y: (1 - k) * 8, o: V.ramp(k, 0.5, 1, E.lin) * (st.o ?? 1) });
        },
      };
    };
    return api;
  }

  // ---------- 2. meter ----------
  function meter(parent, o = {}) {
    const { x = 0, y = 0, w = 800, label = "", max = 100, unit = "", tone: base = "green" } = o;
    const full = w - 130;
    const el = V.h("div", { class: `c-${tn(base)}`, style: abs(x, y, w, 92) });
    const lab = V.h("div", {
      text: label,
      style: {
        ...abs(0, 0, w),
        fontSize: "28px",
        fontWeight: "800",
        lineHeight: "36px",
        whiteSpace: "nowrap",
        color: "var(--c-ink)",
      },
    });
    const track = V.h("div", {
      style: {
        ...abs(0, 44, full, 44),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: "22px",
        background: "var(--panel-2)",
      },
    });
    const fill = V.h("div", {
      style: {
        ...abs(0, 44, 16, 44),
        boxSizing: "border-box",
        border: "3px solid var(--c-lip)",
        borderRadius: "22px",
        background: "var(--c)",
        boxShadow: "0 4px 0 var(--c-lip)",
      },
    });
    const num = V.h("div", {
      style: {
        ...abs(0, 38, 120, 56),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "40px",
        fontWeight: "900",
        whiteSpace: "nowrap",
        color: "var(--c-ink)",
      },
    });
    el.append(lab, track, fill, num);
    parent.append(el);
    const endX = (v) => (v > 0 ? Math.max(16, (v / max) * full) : 0);
    return {
      el,
      end: (v) => x + endX(v),
      set(st = {}) {
        setClass(el, `c-${tn(st.tone || base)}`);
        const v = st.v ?? max;
        const bw = endX(v);
        fill.style.width = `${f1(bw)}px`;
        fill.style.visibility = bw > 0 ? "" : "hidden";
        num.style.left = `${f1(Math.max(bw, 16) + 14)}px`;
        setText(num, st.text ?? `${Math.round(v)} ${unit}`.trim());
        V.place(el, { x: st.x || 0, y: st.y || 0, o: clamp(st.k ?? 1) * (st.o ?? 1) });
      },
    };
  }

  // ---------- 3. step plot ----------
  function stepPlot(parent, o = {}) {
    const { x = 0, y = 0, w = 440, h = 250, xMax = 4, yMax = 3, counts = [], xLabel = "tick" } = o;
    const px = (t) => x + (t / xMax) * w;
    const py = (c) => y + h - (c / yMax) * h;
    const svg = L5.svg(parent);
    const axes = V.s("path", {
      d: D("M", [x, y - 8], "L", [x, y + h], "L", [x + w + 8, y + h]),
      fill: "none",
      "stroke-width": 5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: "var(--line-2)" },
    });
    const line = V.s("path", {
      fill: "none",
      "stroke-width": 9,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const dot = V.s("circle", { r: 13, "stroke-width": 5 });
    svg.append(axes, line, dot);
    const nums = [];
    for (let c = 1; c <= yMax; c++)
      nums.push(
        V.h("div", {
          class: "v-text dim",
          text: String(c),
          style: { ...abs(x - 58, py(c) - 17, 40), textAlign: "right", fontSize: "28px" },
        }),
      );
    for (let t = 0; t <= xMax; t++)
      nums.push(
        V.h("div", {
          class: "v-text dim",
          text: String(t),
          style: { ...abs(px(t) - 20, y + h + 12, 40), textAlign: "center", fontSize: "28px" },
        }),
      );
    if (xLabel)
      nums.push(
        V.h("div", {
          class: "v-text dim",
          text: xLabel,
          style: { ...abs(x + w - 80, y + h + 48, 100), textAlign: "right", fontSize: "28px" },
        }),
      );
    const wrap = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
    wrap.append(...nums);
    parent.append(wrap);
    return {
      pt: (t, c) => ({ x: px(t), y: py(c) }),
      set(st = {}) {
        const { tick = 0, k = 1, o: op = 1, tone = "green" } = st;
        const tt = clamp(tick, 0, xMax);
        const pts = [];
        for (let i = 0; i <= Math.min(Math.floor(tt), counts.length - 1); i++) {
          pts.push([px(i), py(counts[i])], [px(Math.min(i + 1, tt)), py(counts[i])]);
        }
        const c = D6.tone(tone);
        line.setAttribute("d", D("M", ...pts.flatMap((p, i) => (i ? ["L", p] : [p]))));
        line.style.stroke = c.c;
        const end = pts[pts.length - 1] || [px(0), py(0)];
        dot.setAttribute("cx", f1(end[0]));
        dot.setAttribute("cy", f1(end[1]));
        dot.style.fill = c.c;
        dot.style.stroke = c.lip;
        const kk = clamp(k) * op;
        V.show(svg, kk);
        V.show(wrap, kk);
      },
    };
  }

  Object.assign(D6, { timeline, meter, stepPlot });
})();
