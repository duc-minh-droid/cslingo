/* Lecture 8 · The Ant System: charts (VID.l8, short name L8), part 5: the share strip, the bar, the dial and the schedule
   chart. Needs l8/common.js .. common-3.js. Everything is PURE: call update()/set() every frame from update(t).

   1. SHARE STRIP  (one bar cut into slices whose widths are shares: the probabilities of a choice, and the roulette wheel)
        const s = L8.strip(parent, {x, y, w: 936, h: 90, gap: 6, max: 6, fs: 32});      x, y = top-left of the strip
        const g = s.update({
          parts: [{text: "Ash", v: 0.2, tone: "orange", solid: false}, ...],   slice widths follow v / (sum of v); text shows when
                                          the slice is wide enough (about 12 px per character); v 0 hides the slice
          k: 1,                           0..1 pops the strip in
          ticks: 0,                       0..1 fades in the cumulative numbers under the cuts: 0, 0.2, 0.6, 1
          marker: null | 0..1,            a random number u: an orange pointer (a triangle over the strip and a small tick under it) drops onto the strip at u (inside its slice)
          markerK: 1,                     0..1 drop-in of the pointer (0 hides it)
          o: 1 })
        -> {lefts: [x of each slice, parent px], widths: [px], markerX: x of the pointer | null, cuts: [x of the cuts]} to aim other things at.
   2. BAR  (one horizontal bar on a light track: a probability, a share, a count)
        const b = L8.bar(parent, {x, y, w: 600, h: 52, tone: "blue", full: w - 110});   full = bar length for v = 1 (rest = room for the label)
        b.set({v: 0..1, tone, text: "40%", textIn: false, k: 1, o: 1, x, y, textTone})   the label sits just after the bar's end (textIn: inside its right end)
   3. DIAL  (a slider drawn as a track and a round knob, with its Greek letter and its value)
        const d = L8.dial(parent, {x, y, w: 380, label: "α", min: 0, max: 3, tone: "blue", fmt: (v) => String(v)});   x, y = top-left, 60 px high
        d.set({v, k, o, tone}) -> {knobX} (parent px). The letter is 44 px, the value 40 px.
   4. SCHEDULE CHART  (the print shop's jobs as blocks on a time line, 5 px per minute, plus due and lateness)
        const g = L8.gantt(parent, {x, y, order: "WLPTB", px: 5, h: 76});     x, y = top-left; blocks are job.dur * px wide (170 min = 850 px)
        g.update({n: 0..5, dueK: 0, lateK: 0, tone: "grey", o: 1})
          n = how many blocks are placed (the last one grows from the left while n is fractional); dueK 0..1 fades in the two small
          lines under each block, "ends 50" (its finish time) and "due 30"; lateK 0..1 pops the lateness tags under them ("late 20"
          red = ends minus due, "on time" green) and turns each block red / green.
        -> {lefts: [x of each block], widths: [px], rows: L8.evalOrder(order).rows, bottom: y of the lowest tag's bottom}
        Blocks hold the job letter (44 px); the lines and tags are 28 px. Height used: h + 130 (block, ends line at h + 8, due line at
        h + 44, tag at h + 84, 46 high). */
(function () {
  const V = window.VID;
  const L8 = V.l8;
  const { clamp, ease: E } = V;
  const { abs, f1, flex } = L8;

  // ---------- 1. share strip ----------
  function strip(parent, o = {}) {
    const { x = 0, y = 0, w = 936, h = 90, gap = 6, max = 6, fs = 32 } = o;
    const el = V.h("div", { style: abs(x, y, w, h) });
    const cells = Array.from({ length: max }, () => {
      const c = V.h("div", {
        class: "v-gene c-grey",
        style: { ...abs(0, 0, 10, h), fontSize: `${fs}px`, borderRadius: "22px" },
      });
      el.append(c);
      return c;
    });
    const tickEls = Array.from({ length: max + 1 }, () => {
      const t = V.h("div", {
        class: "v-text dim",
        style: { ...abs(0, h + 18, 90), textAlign: "center", visibility: "hidden" },
      });
      el.append(t);
      return t;
    });
    const svg = V.s("svg", {
      width: w,
      height: h + 100,
      style: { position: "absolute", left: "0", top: "-70px", overflow: "visible" },
    });
    const tone = L8.tone("orange");
    const shaft = V.s("path", {
      d: `M0 ${h + 76} L0 ${h + 90}`,
      "stroke-width": "6",
      "stroke-linecap": "round",
      style: { stroke: tone.c },
    });
    const tri = V.s("path", {
      d: "M-17 32 L17 32 L0 68 Z",
      "stroke-width": "4",
      "stroke-linejoin": "round",
      style: { fill: tone.c, stroke: tone.lip },
    });
    const pointer = V.s("g", {}, shaft, tri);
    svg.append(pointer);
    el.append(svg);
    parent.append(el);

    function update(s = {}) {
      const parts = s.parts || [];
      const n = Math.min(parts.length, max);
      const total = parts.reduce((a, p) => a + p.v, 0) || 1;
      const live = parts.slice(0, n).filter((p) => p.v > 0);
      const usable = w - gap * Math.max(0, live.length - 1);
      const lefts = [];
      const widths = [];
      let cx = 0;
      parts.slice(0, n).forEach((p, i) => {
        const wd = p.v > 0 ? (p.v / total) * usable : 0;
        lefts[i] = cx;
        widths[i] = wd;
        if (p.v > 0) cx += wd + gap;
        const c = cells[i];
        c.className = `v-gene c-${L8.tn(p.tone || "grey")}${p.solid ? " solid" : ""}`;
        c.style.left = `${f1(lefts[i])}px`;
        c.style.width = `${f1(Math.max(1, wd))}px`;
        const label = p.text != null && wd >= String(p.text).length * 12 + 24 ? p.text : "";
        if (c.textContent !== label) c.textContent = label;
        V.place(c, {
          s: 0.85 + 0.15 * E.pop(clamp(s.k ?? 1)),
          o: p.v > 0 ? Math.min(1, clamp(s.k ?? 1) * 4) * (s.o ?? 1) : 0,
        });
      });
      cells.slice(n).forEach((c) => V.show(c, 0));
      // cuts between the slices (cumulative numbers under them)
      const cuts = [0];
      let cum = 0;
      live.forEach((p, i) => {
        cum += p.v / total;
        const idx = parts.indexOf(p);
        cuts.push(i < live.length - 1 ? lefts[idx] + widths[idx] + gap / 2 : w);
        tickEls[i + 1].textContent = String(+cum.toFixed(2));
      });
      tickEls[0].textContent = "0";
      tickEls.forEach((t, i) => {
        if (i >= cuts.length) return V.show(t, 0);
        t.style.left = `${f1(cuts[i] - 45)}px`;
        V.show(t, clamp(s.ticks ?? 0));
      });
      // the random number u
      let markerX = null;
      if (s.marker != null) {
        let start = 0;
        for (let i = 0; i < n; i++) {
          const p = parts[i].v / total;
          if (p > 0 && (s.marker < start + p || i === n - 1)) {
            markerX = lefts[i] + clamp((s.marker - start) / p) * widths[i];
            break;
          }
          start += p;
        }
      }
      const mk = markerX == null ? 0 : clamp(s.markerK ?? 1);
      if (markerX != null)
        V.place(pointer, { x: markerX, y: (1 - E.out(mk)) * -50, o: Math.min(1, mk * 4) * (s.o ?? 1) });
      else V.show(pointer, 0);
      return {
        lefts: lefts.map((l) => x + l),
        widths,
        markerX: markerX == null ? null : x + markerX,
        cuts: cuts.map((c) => x + c),
      };
    }
    return { el, update };
  }

  // ---------- 2. bar ----------
  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 600, h = 52, tone: base = "blue" } = o;
    const full = o.full ?? w - 110;
    const el = V.h("div", { style: abs(x, y, w, h) });
    const track = V.h("div", {
      style: {
        ...abs(0, 0, w, h),
        boxSizing: "border-box",
        borderRadius: `${h / 2}px`,
        background: "var(--panel-2)",
        border: "3px solid var(--line)",
      },
    });
    const fill = V.h("div", {
      class: `v-gene c-${L8.tn(base)} solid`,
      style: { ...abs(0, 0, 10, h), borderRadius: `${h / 2}px` },
    });
    const text = V.h("div", {
      style: {
        ...abs(0, 0, 200, h),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "34px",
        fontWeight: "900",
        lineHeight: "1",
      },
    });
    el.append(track, fill, text);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const tone = L8.tn(st.tone || base);
        const wd = clamp(st.v ?? 0) * full;
        fill.className = `v-gene c-${tone} solid`;
        fill.style.width = `${f1(Math.max(wd, 0))}px`;
        fill.style.borderRadius = `${f1(Math.min(h / 2, wd / 2))}px`;
        V.show(fill, wd < 6 ? 0 : 1);
        const inside = !!st.textIn && wd > 110;
        text.style.left = `${f1(inside ? wd - 222 : Math.max(wd, 0) + 14)}px`;
        text.style.justifyContent = inside ? "flex-end" : "flex-start";
        text.style.color = inside ? L8.tone(tone).on : L8.tone(st.textTone || tone).ink;
        L8.setText(text, st.text ?? "");
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, o: Math.min(1, k * 4) * (st.o ?? 1), s: 0.96 + 0.04 * E.pop(k) });
      },
    };
  }

  // ---------- 3. dial ----------
  function dial(parent, o = {}) {
    const { x = 0, y = 0, w = 380, label = "α", min = 0, max = 3, tone: base = "blue" } = o;
    const fmt = o.fmt || ((v) => String(+v.toFixed(1)));
    const trackW = w - 70 - 100;
    const el = V.h("div", { style: abs(x, y, w, 60) });
    const lab = V.h("div", {
      class: "v-text big",
      text: label,
      style: { ...abs(0, 0, 56, 60), ...flex, fontSize: "46px", lineHeight: "1" },
    });
    const track = V.h("div", {
      style: { ...abs(70, 23, trackW, 14), borderRadius: "7px", background: "var(--line)", boxSizing: "border-box" },
    });
    const knob = V.h("div", {
      class: `v-gene solid c-${L8.tn(base)}`,
      style: { ...abs(70, 6, 48, 48), borderRadius: "50%", boxShadow: "0 5px 0 var(--c-lip)" },
    });
    const val = V.h("div", {
      class: "v-text big",
      style: {
        ...abs(70 + trackW + 24, 0, 76, 60),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "42px",
        lineHeight: "1",
      },
    });
    el.append(lab, track, knob, val);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const tone = L8.tn(st.tone || base);
        const f = clamp(((st.v ?? min) - min) / (max - min || 1));
        knob.className = `v-gene solid c-${tone}`;
        knob.style.left = `${f1(70 + f * (trackW - 48))}px`;
        lab.style.color = L8.tone(tone).ink;
        L8.setText(val, fmt(st.v ?? min));
        const k = clamp(st.k ?? 1);
        V.place(el, { o: Math.min(1, k * 4) * (st.o ?? 1), y: (1 - E.out(k)) * 12 });
        return { knobX: x + 70 + f * (trackW - 48) + 24 };
      },
    };
  }

  // ---------- 4. schedule chart ----------
  function gantt(parent, o = {}) {
    const { x = 0, y = 0, px = 5, h = 76, order = "WLPTB", gap = 6 } = o;
    const { rows } = L8.evalOrder(order);
    const el = V.h("div", { style: abs(x, y, 10, h) });
    const items = rows.map((r) => {
      const wd = L8.JOBS[r.j].dur * px - gap;
      const block = V.h("div", {
        class: "v-gene c-grey",
        text: r.j,
        style: { ...abs(r.start * px, 0, wd, h), borderRadius: "20px", fontSize: "44px", transformOrigin: "0 50%" },
      });
      const line = (text, dy) =>
        V.h("div", {
          class: "v-text dim",
          text,
          style: { ...abs(r.start * px, h + dy, wd), textAlign: "center", visibility: "hidden" },
        });
      const ends = line(`ends ${r.end}`, 8);
      const due = line(`due ${r.due}`, 44);
      const late = V.h("div", {
        class: `v-tag solid c-${r.late ? "red" : "green"}`,
        text: r.late ? `late ${r.late}` : "on time",
        style: { ...abs(r.start * px + wd / 2 - 70, h + 84, 140, 46), ...flex, padding: "0", visibility: "hidden" },
      });
      el.append(block, ends, due, late);
      return { block, ends, due, late, wd, left: r.start * px, r };
    });
    parent.append(el);
    function update(s = {}) {
      const n = s.n ?? 0;
      const lateK = clamp(s.lateK ?? 0);
      const dueK = clamp(s.dueK ?? 0);
      items.forEach((it, i) => {
        const k = clamp(n - i);
        const tone = lateK > 0.5 ? (it.r.late ? "red" : "green") : s.tone || "grey";
        it.block.className = `v-gene c-${tone}`;
        const sc = E.out(k);
        it.block.style.transform = `scaleX(${sc.toFixed(3)})`;
        V.show(it.block, k <= 0.001 ? 0 : Math.min(1, k * 5) * (s.o ?? 1));
        V.show(it.ends, k >= 1 ? dueK * (s.o ?? 1) : 0);
        V.show(it.due, k >= 1 ? dueK * (s.o ?? 1) : 0);
        const lk = k >= 1 ? lateK : 0;
        V.place(it.late, { s: 0.8 + 0.2 * E.pop(lk), o: Math.min(1, lk * 4) * (s.o ?? 1) });
      });
      return { lefts: items.map((it) => x + it.left), widths: items.map((it) => it.wd), rows, bottom: y + h + 84 + 46 };
    }
    return { el, update };
  }

  Object.assign(L8, { strip, bar, dial, gantt });
})();
