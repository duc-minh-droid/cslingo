/* Algorithms Phase 1 (video algo-1), scene 10 "Repeat until the ranks settle": power iteration on the five-page web.
   Start at 0.2 each, then repeat "multiply by the matrix" (p <- G p, d = 0.85: the matrix of scene 9, drawn as a small blue and
   purple thumbnail; blue = the links, purple = the repair and the teleport floor). Rounds 1 to 3 are slow
   (blue dots run along the links, a purple dot fans out from the dead end T, the bars and the circles then change, the
   purple floor of 0.03 appears at the foot of every bar), then the counter runs on to round 20, the change per round
   flattens, and the settled ranks are ticked: R first, total 1.00.
   Every number comes from A1.PR5 (A1.pagerank on A1.WEBS.web5) and A1.shares; nothing is typed in.
   Local helpers: rankWeb (a web whose circles are sized by rank, with arrows that follow the live radius), floorLayer
   (the purple floor at the foot of each bar), chip (a tag with an icon that lights in turn). */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const S = V.s;
  const { ramp, clamp, lerp, flash, ease: E } = V;

  // ---- the algorithm (all from common.js)
  const WEB = A1.WEBS.web5;
  const NAMES = WEB.names;
  const PR = A1.PR5;
  const SETTLED = PR.p[20];
  const DELTA = PR.delta.slice(1, 21);
  const FLOOR = A1.matrices(WEB, A1.D).floor;
  const to2 = (v) => v.toFixed(2);
  const r2 = (v) => Math.round(v * 100);
  A1.must(r2(PR.p[1].R) === 49 && r2(PR.p[2].R) === 36 && r2(PR.p[3].R) === 44, "scene 10: rounds 1 to 3 of R");
  A1.must(NAMES.map((k) => r2(SETTLED[k])).join() === "21,13,41,21,4", "scene 10: settled ranks");
  A1.must(NAMES.reduce((a, k) => a + r2(SETTLED[k]), 0) === 100, "scene 10: settled ranks sum to 1.00");
  A1.must(Math.abs(FLOOR - 0.03) < 1e-9 && DELTA.length === 20, "scene 10: floor 0.03, 20 rounds of change");

  // ---- timeline (local seconds)
  const POP = 0.3; // the web, bars and stat pop in
  const RS = [1.5, 3.0, 4.2]; // start of the three slow rounds
  const FLY = 0.6; // dots run along the links
  const TWEEN = 0.5; // bars and circles change after the dots arrive
  const FF = [5.4, 8.4]; // fast forward: the counter runs on to round 20
  const SET = 8.8; // settled

  // ---- layout (stage px)
  const DY = 24; // the whole figure sits a little lower, so it is centred in the stage
  const WEB_BOX = { x: 0, y: 30 + DY, w: 430, h: 380 };
  const BARS = { x: 470, y: 30 + DY, w: 466, rowH: 52, max: 0.5 };
  const STAT = { x: 470, y: 384 + DY, w: 180, h: 128 };
  const SPARK = { x: 664, y: 370 + DY, w: 260, h: 180 };
  const CHIP_Y = 504;
  const WEB_CX = WEB_BOX.w / 2;
  const RAD = (p) => 30 * (0.8 + 2.4 * p); // circle radius from rank

  const css = (e, o) => (Object.assign(e.style, o), e);
  const f1 = (n) => n.toFixed(1);
  const layer = (stage) => {
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    stage.append(svg);
    return svg;
  };
  const pop = (k, dy = 12) => ({ s: 0.8 + 0.2 * E.pop(k), y: (1 - E.out(k)) * dy, o: clamp(k * 3) }); // for V.place
  const popT = (k, dy = 12) => ({ s: 0.8 + 0.2 * E.pop(k), dy: (1 - E.out(k)) * dy, o: clamp(k * 3) }); // for tag.set, stat.set
  const lerpVec = (a, b, k) => Object.fromEntries(NAMES.map((n) => [n, lerp(a[n], b[n], k)]));
  const leaderOf = (p) => {
    const order = [...NAMES].sort((a, b) => p[b] - p[a]);
    return p[order[0]] - p[order[1]] > 0.004 ? order[0] : null;
  };

  /* ---------- the web: circles sized by rank, arrows that follow the live radius ---------- */
  function rankWeb(stage) {
    const [rw, rh] = WEB.ref;
    const sc = Math.min(WEB_BOX.w / rw, WEB_BOX.h / rh);
    const [ox, oy] = [WEB_BOX.x + (WEB_BOX.w - rw * sc) / 2, WEB_BOX.y + (WEB_BOX.h - rh * sc) / 2];
    const C = Object.fromEntries(NAMES.map((k) => [k, [ox + WEB.pos[k][0] * sc, oy + WEB.pos[k][1] * sc]]));
    const [HEAD, HW, SW, GAP, LANE] = [18, 8, 6, 6, 20];
    const svg = layer(stage);
    const [gE, gN, gD] = [0, 1, 2].map(() => svg.appendChild(S("g")));
    const has = (a, b) => WEB.edges.some(([x, y]) => x === a && y === b);

    /* the dead end pours to every page: faint dashed lines (and a small loop back to itself), shown while the dots fly */
    const pours = WEB.dead.flatMap((a) =>
      NAMES.map((b) => {
        const line = gE.appendChild(S("path", { fill: "none", "stroke-width": 4, "stroke-linecap": "round" }));
        css(line, { stroke: T("purple").c, strokeDasharray: "9 9" });
        return { a, b, line };
      }),
    );
    const links = WEB.edges.map(([a, b]) => {
      const line = gE.appendChild(S("path", { fill: "none", "stroke-linecap": "round" }));
      const head = gE.appendChild(S("path", { "stroke-width": 3, "stroke-linejoin": "round" }));
      return { a, b, line, head };
    });
    /* ends of the arrow a -> b, stopping just outside both circles (two lanes when both directions exist) */
    function ends(a, b, rad) {
      const [A, B] = [C[a], C[b]];
      const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const u = [(B[0] - A[0]) / len, (B[1] - A[1]) / len];
      const lane = has(b, a) ? LANE : 0;
      const n = [u[1] * lane, -u[0] * lane];
      const p0 = [A[0] + u[0] * (rad[a] + GAP) + n[0], A[1] + u[1] * (rad[a] + GAP) + n[1]];
      const p3 = [B[0] - u[0] * (rad[b] + GAP) + n[0], B[1] - u[1] * (rad[b] + GAP) + n[1]];
      return { p0, p3, u };
    }
    function paintLink(l, rad, k, colour) {
      const { p0, p3, u } = ends(l.a, l.b, rad);
      const len = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]);
      V.show(l.head, k);
      V.show(l.line, k);
      if (k <= 0.001) return;
      const tip = [lerp(p0[0], p3[0], k), lerp(p0[1], p3[1], k)];
      const hs = clamp((k * len) / (HEAD * 1.3));
      const base = [tip[0] - u[0] * HEAD * hs, tip[1] - u[1] * HEAD * hs];
      const nrm = [-u[1] * HW * hs, u[0] * HW * hs];
      l.head.setAttribute(
        "d",
        `M${f1(tip[0])} ${f1(tip[1])}L${f1(base[0] + nrm[0])} ${f1(base[1] + nrm[1])}L${f1(base[0] - nrm[0])} ${f1(base[1] - nrm[1])}Z`,
      );
      const end = [tip[0] - u[0] * HEAD * 0.75 * hs, tip[1] - u[1] * HEAD * 0.75 * hs];
      l.line.setAttribute("d", `M${f1(p0[0])} ${f1(p0[1])}L${f1(end[0])} ${f1(end[1])}`);
      l.line.setAttribute("stroke-width", SW);
      for (const e of [l.line, l.head]) css(e, { stroke: colour, fill: e === l.head ? colour : "none" });
    }

    const nodes = Object.fromEntries(
      NAMES.map((k) => {
        const [x, y] = C[k];
        const lip = S("circle", { cx: x, cy: y + 4 });
        const face = S("circle", { cx: x, cy: y, "stroke-width": 4 });
        const text = S("text", { x, y: f1(y + 13), "text-anchor": "middle" }, k);
        css(text, { fontSize: "36px", fontWeight: "900" });
        const g = gN.appendChild(S("g", {}, lip, face, text));
        return [k, { g, lip, face, text }];
      }),
    );

    /* the dot pool: every dot is a small sticker circle */
    const pool = Array.from({ length: 16 }, () => {
      const lip = S("circle");
      const face = S("circle", { "stroke-width": 3 });
      return { g: gD.appendChild(S("g", {}, lip, face)), lip, face };
    });
    /* where a dot on its way from a to b is, f in 0..1 (a === b: a small loop below the page) */
    function dotAt(a, b, f, rad) {
      if (a === b) {
        const [lr, c] = [16, [C[a][0], C[a][1] + rad[a] + 18]];
        const th = -Math.PI / 2 + f * 2 * Math.PI;
        return [c[0] + lr * Math.cos(th), c[1] + lr * Math.sin(th) + 0];
      }
      const { p0, p3 } = ends(a, b, rad);
      return [lerp(p0[0], p3[0], f), lerp(p0[1], p3[1], f)];
    }

    return {
      pt: (k) => ({ x: C[k][0], y: C[k][1] }),
      svg,
      /* st: { rad, tone, solid, nodeK, edgeK, dots: [{ from, to, f, tone, size, o }] } */
      update(st) {
        const { rad } = st;
        links.forEach((l) => paintLink(l, rad, st.edgeK ?? 1, T("grey").c));
        pours.forEach((l) => {
          const k = (st.pourK ?? 0) * 0.55;
          V.show(l.line, k);
          if (l.a === l.b) {
            const [cx, cy] = [C[l.a][0], C[l.a][1] + rad[l.a] + 18];
            return l.line.setAttribute("d", `M${f1(cx)} ${f1(cy - 16)}a16 16 0 1 1 0 32a16 16 0 1 1 0 -32`);
          }
          const { p0, p3 } = ends(l.a, l.b, rad);
          l.line.setAttribute("d", `M${f1(p0[0])} ${f1(p0[1])}L${f1(p3[0])} ${f1(p3[1])}`);
        });
        NAMES.forEach((k) => {
          const n = nodes[k];
          const c = T((st.tone || {})[k] || "blue");
          const solid = !!(st.solid || {})[k];
          for (const e of [n.lip, n.face]) e.setAttribute("r", f1(rad[k]));
          css(n.face, { fill: solid ? c.c : c.dim, stroke: solid ? c.lip : c.edge });
          css(n.lip, { fill: solid ? c.lip : c.edge });
          css(n.text, { fill: solid ? c.on : c.ink });
          const nk = (st.nodeK || {})[k] ?? 1;
          const s = 0.7 + 0.3 * E.pop(nk);
          const [x, y] = C[k];
          n.g.setAttribute(
            "transform",
            `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`,
          );
          V.show(n.g, clamp(nk * 3));
        });
        pool.forEach((slot, i) => {
          const d = (st.dots || [])[i];
          if (!d) return V.show(slot.g, 0);
          const [x, y] = dotAt(d.from, d.to, d.f, rad);
          const c = T(d.tone || "blue");
          const r = (d.size ?? 16) / 2;
          for (const e of [slot.lip, slot.face]) e.setAttribute("r", f1(r));
          for (const e of [slot.lip, slot.face]) e.setAttribute("cx", f1(x));
          slot.face.setAttribute("cy", f1(y));
          slot.lip.setAttribute("cy", f1(y + 3));
          css(slot.face, { fill: c.c, stroke: c.lip });
          css(slot.lip, { fill: c.lip });
          V.show(slot.g, d.o ?? 1);
        });
      },
    };
  }

  /* ---------- the purple floor at the foot of every bar ---------- */
  function floorLayer(stage, bars) {
    const svg = layer(stage);
    const w = bars.xAt(FLOOR) - bars.left;
    const [h, rr] = [30, 15];
    const shape = (y0) =>
      `M${f1(bars.left + rr)} ${f1(y0)}H${f1(bars.left + w)}V${f1(y0 + h)}H${f1(bars.left + rr)}A${rr} ${rr} 0 0 1 ${f1(bars.left + rr)} ${f1(y0)}Z`;
    const c = T("purple");
    const segs = NAMES.map((k) => {
      const y0 = bars.rowY(k) - h / 2;
      const lip = S("path", { d: shape(y0 + 4), "stroke-width": 3, "stroke-linejoin": "round" });
      const face = S("path", { d: shape(y0), "stroke-width": 3, "stroke-linejoin": "round" });
      css(lip, { fill: c.lip, stroke: c.lip });
      css(face, { fill: c.c, stroke: c.lip });
      return svg.appendChild(S("g", {}, lip, face));
    });
    return { svg, set: (k) => segs.forEach((g) => V.place(g, { s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 4) })) };
  }

  /* ---------- a tag with an icon that can switch between grey, soft and solid ---------- */
  function chip(stage, { text, icon, tone, w }) {
    const ic = A1.icon(icon, 30, tone, { flow: true });
    const tg = A1.tag(stage, { text, tone, w, icon: ic });
    return {
      icon: ic,
      set({ x, y, tone: tn, solid = false, ...rest }) {
        tg.set({ x, y, center: true, tone: tn, solid, ...rest });
        ic.setAttribute("class", `c-${tn}`);
        ic.querySelectorAll("path").forEach((p) => (p.style.stroke = solid ? "var(--c-on)" : "var(--c-ink)"));
      },
    };
  }

  /* ---------- what is on screen at time t ---------- */
  function stateAt(t) {
    if (t >= FF[0]) {
      const c = 3 + 17 * ramp(t, FF[0], FF[1]);
      const k = Math.min(20, Math.round(c));
      return { p: PR.p[k], cp: c, shown: k, round: 0, f: 0, tw: 1 };
    }
    const round = RS.filter((a) => t >= a).length;
    if (!round) return { p: PR.p[0], cp: 0, shown: 0, round: 0, f: 0, tw: 0 };
    const a = RS[round - 1];
    const f = ramp(t, a, a + FLY, E.inOut);
    const tw = ramp(t, a + FLY, a + FLY + TWEEN, E.inOut);
    return {
      p: lerpVec(PR.p[round - 1], PR.p[round], tw),
      cp: round - 1 + tw,
      shown: tw > 0 ? round : round - 1,
      round,
      f,
      tw,
    };
  }

  V.scene({
    kicker: "ITERATE",
    title: ["Repeat until", "the ranks settle"],
    dur: 12,
    caps: [
      [0.4, 2.0, "Start with equal rank on every page."],
      [2.2, 5.4, "Each round: multiply by the matrix."],
      [5.8, 8.6, "Early rounds swing, then the ranks settle."],
      [9.0, 11.5, "R ranks first. The same loop ranks billions."],
    ],
    build(stage) {
      const g = rankWeb(stage);
      const bars = A1.bars(stage, { ...BARS, names: NAMES });
      const floor = floorLayer(stage, bars);
      const stat = A1.stat(stage, { ...STAT, label: "round", text: "0", tone: "blue" });
      const sp = A1.spark(stage, { ...SPARK, n: 20, dot: 4.5 });
      const tab = A1.tag(stage, { text: "biggest change", tone: "grey", ghost: true });
      const times = chip(stage, { text: "the matrix", icon: "cross", tone: "purple", w: 216 });
      const again = chip(stage, { text: "repeat", icon: "loop", tone: "purple", w: 196 });
      // the matrix of scene 9 as a thumbnail: blue = a link, purple = the repair and the teleport floor
      const MH = A1.matrices(WEB, A1.D).H;
      const THUMB = { x: 262, y: CHIP_Y - 53, pitch: 22, cell: 18 };
      const thumb = A1.grid(stage, { ...THUMB, rows: NAMES.length, cols: NAMES.length });
      const first = A1.tag(stage, { text: "R first", tone: "orange", solid: true });
      const total = A1.tag(stage, {
        text: "settled, sum = 1.00",
        tone: "green",
        solid: true,
        icon: A1.icon("tick", 30, "green", { flow: true, on: true }),
      });
      // the orange outline round R's bar row (drawn last, over the bars)
      const hi = layer(stage);
      const rowR = bars.rowY("R");
      const outline = hi.appendChild(
        S("rect", {
          x: BARS.x - 8,
          y: rowR - 25,
          width: BARS.w - 8,
          height: 50,
          rx: 22,
          fill: "none",
          pathLength: "1",
          "stroke-width": 5,
        }),
      );
      css(outline, { stroke: T("orange").c });

      return (t) => {
        const st = stateAt(t);
        const lead = leaderOf(st.p);
        const rad = Object.fromEntries(NAMES.map((k) => [k, RAD(st.p[k])]));

        // ---- dots: slow rounds carry the real amounts, the fast forward streams along the links
        const dots = [];
        if (st.round && t < RS[st.round - 1] + FLY) {
          const a = st.round - 1;
          for (const s of A1.shares(WEB, PR.p[a])) {
            const link = s.kind === "link";
            const edge = !link || WEB.edges.some(([x, y]) => x === s.from && y === s.to);
            A1.must(edge, "scene 10: a share without an edge");
            dots.push({
              from: s.from,
              to: s.to,
              f: st.f,
              tone: link ? "blue" : "purple",
              size: (10 + 50 * s.amt) * (0.35 + 0.65 * clamp((1 - st.f) * 5)),
              o: clamp(st.f * 10) * clamp((1 - st.f) * 12),
            });
          }
        } else if (t >= FF[0] && t < FF[1] + 0.2) {
          const fade = ramp(t, FF[0], FF[0] + 0.3, E.lin) * ramp(FF[1] + 0.2 - t, 0, 0.5, E.lin);
          WEB.edges.forEach(([from, to], i) => {
            const f = (t * 2.2 + i * 0.17) % 1;
            dots.push({
              from,
              to,
              f,
              tone: "blue",
              size: 16 * (0.35 + 0.65 * clamp((1 - f) * 5)),
              o: fade * clamp(f * 10) * clamp((1 - f) * 12),
            });
          });
        }

        // ---- the web
        const nodeK = Object.fromEntries(NAMES.map((k, i) => [k, ramp(t, POP + i * 0.1, POP + 0.5 + i * 0.1)]));
        g.update({
          rad,
          tone: lead ? { [lead]: "orange" } : {},
          solid: lead ? { [lead]: true } : {},
          nodeK,
          edgeK: ramp(t, 0.6, 1.2),
          pourK:
            st.round && t < RS[st.round - 1] + FLY + 0.3
              ? clamp(st.f * 6) * ramp(RS[st.round - 1] + FLY + 0.3 - t, 0, 0.3, E.lin)
              : 0,
          dots,
        });

        // ---- the bars and the purple floor
        const ticked = Object.fromEntries(
          NAMES.map((k, i) => [k, t >= SET + 0.1 * i ? SETTLED[k] : undefined]).filter(([, v]) => v !== undefined),
        );
        bars.update({
          vals: st.p,
          text: Object.fromEntries(NAMES.map((k) => [k, to2(PR.p[st.shown][k])])), // the printed numbers are the real round's
          hi: lead ? [lead] : [],
          ticks: ticked,
          tickTone: "green",
        });
        V.place(bars.svg, pop(ramp(t, POP + 0.2, POP + 0.8), 14));
        floor.set(ramp(t, RS[0] + FLY, RS[0] + FLY + 0.4));
        V.show(floor.svg, ramp(t, POP + 0.2, POP + 0.8) > 0.5 ? 1 : 0);

        // ---- round counter and change chart
        const settled = t >= SET;
        const bump = Math.max(...RS.map((a) => flash(t, a + FLY, a + FLY + 0.3)), flash(t, SET, SET + 0.4));
        stat.set({
          text: String(st.shown),
          label: settled ? "settled" : "round",
          tone: settled ? "green" : "blue",
          ...popT(ramp(t, POP + 0.4, POP + 0.9), 12),
          s: (0.8 + 0.2 * E.pop(ramp(t, POP + 0.4, POP + 0.9))) * (1 + 0.08 * bump),
        });
        sp.update({ data: DELTA, upto: st.cp >= 1 ? st.cp - 1 : -1, tone: "purple" });
        V.place(sp.svg, pop(ramp(t, POP + 0.6, POP + 1.0), 12));
        tab.set({ x: SPARK.x + SPARK.w / 2, y: SPARK.y - 30, center: true, ...popT(ramp(t, POP + 0.7, POP + 1.1), 8) });

        // ---- the rule under the web: "multiply by [the matrix]" lights up in every round; then "repeat"
        const chipIn = ramp(t, POP + 0.6, POP + 1.0);
        let on = 0; // 0 = not yet, 1 = on now, 2 = done
        RS.forEach((a) => {
          if (t >= a && t < a + FLY + TWEEN) on = 1;
          else if (t >= a + FLY + TWEEN && on !== 1) on = 2;
        });
        const ruleO = Math.min(chipIn, ramp(FF[0] - t, 0, 0.3, E.lin));
        const roundGlow = Math.max(...RS.map((a) => flash(t, a, a + FLY + TWEEN)));
        times.set({ x: 112, y: CHIP_Y, tone: on ? "purple" : "grey", solid: on === 1, ...popT(ruleO), o: ruleO });
        const ffIn = ramp(t, FF[0], FF[0] + 0.4) * ramp(SET - 0.2 - t, 0, 0.3, E.lin);
        again.set({ x: 112, y: CHIP_Y, tone: "purple", solid: true, ...popT(ffIn), o: ffIn });
        V.place(again.icon, { r: -360 * 1.4 * (t - FF[0]) });
        const thumbO = Math.min(chipIn, ramp(SET - 0.2 - t, 0, 0.3, E.lin));
        thumb.update((r, c) => ({ k: 1, tone: MH[r][c] > 0 ? "blue" : "purple" }));
        V.place(thumb.svg, {
          y: (1 - E.out(chipIn)) * 10,
          s: (0.8 + 0.2 * E.pop(chipIn)) * (1 + 0.08 * roundGlow),
          o: clamp(chipIn * 3) * thumbO,
        });

        // ---- settled: ticks, R first, total
        const kFirst = ramp(t, SET + 0.7, SET + 1.2);
        const kTot = ramp(t, SET + 1.1, SET + 1.6);
        first.set({ x: BARS.x, y: 304 + DY, ...popT(kFirst, 8) });
        total.set({ x: WEB_CX, y: CHIP_Y, center: true, ...popT(kTot, 8) });
        css(outline, { strokeDasharray: "1 1", strokeDashoffset: String(1 - ramp(t, SET + 0.6, SET + 1.3)) });
        V.show(outline, ramp(t, SET + 0.6, SET + 0.7, E.lin));
      };
    },
  });
})();
