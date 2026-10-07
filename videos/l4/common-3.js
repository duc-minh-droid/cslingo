/* Lecture 4 · drawing helpers, part 2: roulette wheel, heat map, pixel picture. (Part 1 is common-2.js: tag, tiles, bar, knob,
   cut line, bell.) Same rules: stage pixels, every call a PURE function of its arguments, omitted fields use defaults.

   1. WHEEL  (roulette wheel: sticker lip, wedges, fixed orange pointer above the top)
        const w = L4.wheel(stage, { cx, cy, r });        // centre and radius, stage px. The pointer reaches about 26 px above cy - r.
        w.update({ p, labels, tones, rot, hit, hitK, o })
          p       slice fractions in order, up to 8 (they may sum to less than 1 while slices grow in, or be interpolated: L4.mix)
          labels  text per slice (hidden under 5%; a slice over 50% puts its label 0.3 r from the centre, others 0.62 r). Labels stay
                  upright whatever the rotation.
          tones   per slice: "grey" (default; neighbours alternate between neutral shades) or any tone, e.g. "red" for the superfit
          rot     clockwise degrees of the whole wheel (slice 0 starts at the top at rot 0): use L4.spinPlan(...)[i].rot
          hit     index of the picked slice, hitK 0..1: it pops out 12 px along its mid-angle with a blue 4 px outline (a grey slice
                  also turns blue); it is drawn on top of its neighbours
          o       opacity of everything
        w.el, w.pointerTip -> {x, y}: the point of the pointer in stage px

   2. HEAT  (takeover heat map: a framed card with a cols x rows grid of rounded cells)
        const hm = L4.heat(stage, { x, y, cols, rows, cw, ch, gap: 2 });   // x, y = outer top-left; outer size = cols * cw by rows * ch
        hm.update({ vals, best, shown, o })
          vals   matrix [row][col] of fitness 1..best;  best = the maximum fitness. A cell equal to best is orange, every other cell is
                 green with opacity 0.15 + 0.75 * (v - 1) / (best - 2): deeper green = fitter. best defaults to the largest value in vals.
          shown  number of rows revealed (fractional: row floor(shown) fades and slides in by the fraction). Default: all rows.
        hm.el, hm.width, hm.height

   3. PIXELS  (an n x n black/white picture: a framed sticker card)
        const px = L4.pixels(stage, { x, y, cell, n: 12 });   // x, y = outer top-left; outer size = n * cell (cell 22 -> 264 px)
        px.set({ bits, target, tone, wrong, o })
          bits    string or array of 0/1, row by row;  tone: "blue" (default) or "green": the colour of the ones; zeros are pale
          target  the picture to compare with;  wrong: true outlines every cell that differs from target with a red border
        px.el, px.size */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const { clamp } = V;
  const { abs, f1, svgIn } = L4.ui;
  const dflt = (v, d) => (v == null ? d : v);
  const rad = (d) => (d * Math.PI) / 180;
  const opac = (e, o) => {
    e.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
    e.style.visibility = o <= 0.001 ? "hidden" : "";
  };

  // ---------- 1. wheel ----------
  const MAXS = 8;
  const SHADES = ["var(--panel-2)", "var(--line)", "var(--line-2)"];
  function wheel(parent, opt = {}) {
    const { cx = 0, cy = 0, r = 190 } = opt;
    const svg = svgIn(parent);
    const base = V.s("circle", { cx, cy: cy + 6, r, style: { fill: "var(--line-2)" } });
    const disc = V.s("circle", {
      cx,
      cy,
      r,
      "stroke-width": 3,
      style: { fill: "var(--panel-2)", stroke: "var(--line-2)" },
    });
    const rot = V.s("g", {});
    const slices = Array.from({ length: MAXS }, () => {
      const g = V.s("g", {});
      const path = V.s("path", { "stroke-width": 3, "stroke-linejoin": "round" });
      const text = V.s("text", {
        "text-anchor": "middle",
        dy: ".36em",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "30px" },
      });
      g.append(path, text);
      rot.append(g);
      return { g, path, text };
    });
    const hub = V.s("circle", {
      cx,
      cy,
      r: 14,
      "stroke-width": 3,
      style: { fill: "var(--panel)", stroke: "var(--line-2)" },
    });
    const tipY = cy - r + 10;
    const pointer = V.s("path", {
      d: `M ${f1(cx - 20)} ${f1(cy - r - 24)} L ${f1(cx + 20)} ${f1(cy - r - 24)} L ${f1(cx)} ${f1(tipY)} Z`,
      "stroke-width": 4,
      "stroke-linejoin": "round",
      style: { fill: "var(--amber)", stroke: "var(--amber-lip)" },
    });
    svg.append(base, disc, rot, hub, pointer);
    const pt = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
    let order = "";
    function update(st = {}) {
      const p = st.p || [];
      const n = Math.min(p.length, MAXS);
      const rotation = dflt(st.rot, 0);
      const hit = dflt(st.hit, -1);
      const hitK = clamp(dflt(st.hitK, 0));
      rot.setAttribute("transform", `rotate(${f1(rotation)} ${f1(cx)} ${f1(cy)})`);
      // alternate the neutral shades; with an odd count the last slice gets a third shade so it differs from slice 0
      const greyIdx = (i) => (i === n - 1 && n % 2 === 1 && n > 1 ? 2 : i % 2);
      let start = 0;
      slices.forEach((sl, i) => {
        const frac = i < n ? Math.max(0, p[i]) : 0;
        const a0 = rad(360 * start);
        const a1 = rad(360 * (start + frac));
        const mid = (a0 + a1) / 2;
        start += frac;
        if (frac < 0.0005) return V.show(sl.g, 0);
        V.show(sl.g, 1);
        const tone = (st.tones && st.tones[i]) || "grey";
        const picked = i === hit && hitK > 0;
        let d;
        if (frac > 0.9995)
          d = `M ${f1(cx)} ${f1(cy - r)} A ${r} ${r} 0 1 1 ${f1(cx)} ${f1(cy + r)} A ${r} ${r} 0 1 1 ${f1(cx)} ${f1(cy - r)} Z`;
        else
          d = `M ${f1(cx)} ${f1(cy)} L ${pt(a0, r).map(f1).join(" ")} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${pt(a1, r).map(f1).join(" ")} Z`;
        sl.path.setAttribute("d", d);
        const colour = tone === "grey" ? (picked ? "blue" : "grey") : tone;
        sl.g.setAttribute("class", `c-${colour === "grey" ? "grey" : colour}`);
        sl.path.style.fill = colour === "grey" ? SHADES[greyIdx(i)] : "var(--c)";
        sl.path.style.stroke = picked ? "var(--blue)" : colour === "grey" ? "var(--bg)" : "var(--c-lip)";
        sl.path.setAttribute("stroke-width", picked ? String(3 + hitK) : "3");
        const off = picked ? 12 * hitK : 0;
        sl.g.setAttribute("transform", `translate(${f1(off * Math.sin(mid))} ${f1(-off * Math.cos(mid))})`);
        const [lx, ly] = pt(mid, frac > 0.5 ? 0.3 * r : 0.62 * r);
        sl.text.setAttribute("x", f1(lx));
        sl.text.setAttribute("y", f1(ly));
        sl.text.setAttribute("transform", `rotate(${f1(-rotation)} ${f1(lx)} ${f1(ly)})`);
        sl.text.textContent = st.labels && frac >= 0.05 && st.labels[i] != null ? String(st.labels[i]) : "";
        sl.text.style.fill = colour === "grey" ? "var(--ink)" : "var(--c-on)";
      });
      if (hit >= 0 && hit < MAXS && hitK > 0 && order !== String(hit)) {
        rot.append(slices[hit].g);
        order = String(hit);
      } else if (hit < 0 || hitK <= 0) {
        if (order !== "") slices.forEach((sl) => rot.append(sl.g));
        order = "";
      }
      opac(svg, dflt(st.o, 1));
    }
    update({ p: [], o: 1 });
    return { el: svg, update, pointerTip: { x: cx, y: tipY } };
  }

  // ---------- 2. heat ----------
  function heat(parent, opt = {}) {
    const { x = 0, y = 0, cols = 12, rows = 8, cw = 22, ch = 44, gap = 2 } = opt;
    const [W, H] = [cols * cw, rows * ch];
    const el = V.h("div", {
      style: {
        ...abs(x, y, W, H),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: "16px",
        background: "var(--panel)",
        boxShadow: "0 6px 0 var(--line-2)",
      },
    });
    const [pw, ph] = [(W - 12) / cols, (H - 12) / rows];
    const cells = [];
    for (let rr = 0; rr < rows; rr++) {
      for (let c = 0; c < cols; c++) {
        const e = V.h("div", {
          style: { ...abs(3 + c * pw + gap / 2, 3 + rr * ph + gap / 2, pw - gap, ph - gap), borderRadius: "5px" },
        });
        el.append(e);
        cells.push(e);
      }
    }
    parent.append(el);
    const update = (st = {}) => {
      const vals = st.vals || [];
      const best = dflt(st.best, Math.max(1, ...vals.flat()));
      const shown = dflt(st.shown, rows);
      cells.forEach((e, i) => {
        const [rr, c] = [Math.floor(i / cols), i % cols];
        const v = vals[rr] && vals[rr][c];
        const k = clamp(shown - rr);
        if (v == null || k <= 0.001) return V.show(e, 0);
        const top = v === best;
        const alpha = top ? 1 : 0.15 + (0.75 * (v - 1)) / Math.max(1, best - 2);
        e.style.background = top ? "var(--amber)" : "var(--teal)";
        e.style.visibility = "";
        e.style.opacity = String(Math.min(1, alpha) * k);
        e.style.transform = `translateY(${f1((1 - k) * 10)}px)`;
      });
      opac(el, dflt(st.o, 1));
    };
    update({});
    return { el, update, width: W, height: H };
  }

  // ---------- 3. pixels ----------
  function pixels(parent, opt = {}) {
    const { x = 0, y = 0, cell = 22, n = 12 } = opt;
    const S = n * cell;
    const el = V.h("div", {
      style: {
        ...abs(x, y, S, S),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: "14px",
        background: "var(--panel)",
        boxShadow: "0 6px 0 var(--line-2)",
      },
    });
    const pc = (S - 12) / n;
    const cells = Array.from({ length: n * n }, (_, i) => {
      const e = V.h("div", {
        style: {
          ...abs(3 + (i % n) * pc + 0.5, 3 + Math.floor(i / n) * pc + 0.5, pc - 1, pc - 1),
          borderRadius: `${Math.max(2, pc * 0.18).toFixed(1)}px`,
        },
      });
      el.append(e);
      return e;
    });
    parent.append(el);
    const ring = `inset 0 0 0 ${Math.max(2, Math.min(3, pc * 0.2)).toFixed(1)}px var(--rose)`;
    const set = (st = {}) => {
      const bits = [...(st.bits || "")].map(Number);
      const tgt = st.target == null ? null : [...st.target].map(Number);
      const on = st.tone === "green" ? "var(--teal)" : "var(--blue)";
      cells.forEach((e, i) => {
        e.style.background = bits[i] ? on : "var(--panel-2)";
        e.style.boxShadow = st.wrong && tgt && bits[i] !== tgt[i] ? ring : "";
      });
      opac(el, dflt(st.o, 1));
    };
    set({});
    return { el, set, size: S };
  }

  Object.assign(L4, { wheel, heat, pixels });
})();
