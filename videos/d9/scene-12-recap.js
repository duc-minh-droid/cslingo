/* Lecture 9 (ds-9) · scene 12-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.8 / 2.8, each pictogram runs on its row's own clock
   (q = t − row time) and is finished by q 3.4, 6.4 the call to action 'Next: Workshop 9.W'. Rows are done at about 3.6,
   5.0 and 6.2; after that only Pebble's bob moves.
   Row 1 (blue): the cost bowl of scene 2 (grey (w − 4)², green best dot); the blue ball hops down four times along the
          D9.DESC weights 10 → 7 → 5.5 → 4.75 → 4.375 (q 1.0, 1.5, 2.0, 2.4, 0.4 s each), the first three under a shrinking
          orange step arrow (the last hop is too short for one); a green ring pops round the best dot (and the ball now
          beside it) at q 2.9.
   Row 2 (purple): eight purple chips; braces under them for full batch (one brace, '1 update', q 1.0), mini-batches (two
          braces, '2 updates', q 2.0) and one at a time (eight braces, '8 updates', q 3.0). Holds the last stage.
   Row 3 (green): the green dashed truth steps from 4 to 6 half way (q 1.0-1.6), the blue model line follows with a lag
          (q 1.4-2.6), then a red bad record pops and the blue line spikes to it and back (q 2.8-3.4). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => n.toFixed(1);

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.8, 2.8];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const CTA_AT = 6.4;

  // ---------- row 1: step downhill on the bowl ----------
  function descentRow(pic) {
    const ws = D9.DESC.ws;
    D9.same("recap row 1: the four steps at rate 0.25", ws, [10, 7, 5.5, 4.75, 4.375]);
    const vx = D9.BOWL.view;
    const px = (w) => 22 + ((w - vx.x[0]) / (vx.x[1] - vx.x[0])) * 296;
    const py = (c) => 126 - ((c - vx.y[0]) / (vx.y[1] - vx.y[0])) * 86;
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const pts = Array.from({ length: 61 }, (_, i) => {
      const w = vx.x[0] + ((vx.x[1] - vx.x[0]) * i) / 60;
      return `${f1(px(w))},${f1(py(Math.min(vx.y[1], D9.cost1(w))))}`;
    });
    const G = T("grey");
    svg.appendChild(
      V.s("polyline", {
        points: pts.join(" "),
        fill: "none",
        stroke: G.c,
        "stroke-width": 6,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
    const Gr = T("green");
    svg.appendChild(
      V.s("circle", { cx: f1(px(4)), cy: f1(py(0)), r: 10, fill: Gr.c, stroke: Gr.lip, "stroke-width": 3 }),
    );
    const P = ws.map((w) => ({ x: px(w), y: py(D9.cost1(w)) }));
    const arrows = [0, 1, 2].map((k) =>
      svg.appendChild(L5.arrow(P[k].x, P[k].y - 30, P[k + 1].x, P[k + 1].y - 30, "orange", 1, { w: 5, head: 12 })),
    );
    const ring = svg.appendChild(
      V.s("circle", { cx: f1(px(4)), cy: f1(py(0)), r: 28, fill: "none", stroke: Gr.c, "stroke-width": 5 }),
    );
    const B = T("blue");
    const ball = svg.appendChild(V.s("circle", { cx: 0, cy: 0, r: 12, fill: B.c, stroke: B.lip, "stroke-width": 3 }));
    const HOPS = [1.0, 1.5, 2.0, 2.4];
    return (q) => {
      let x = P[0].x;
      let y = P[0].y;
      HOPS.forEach((h, k) => {
        const f = ramp(q, h, h + 0.4, E.inOut);
        if (q >= h) {
          x = lerp(P[k].x, P[k + 1].x, f);
          y = lerp(P[k].y, P[k + 1].y, f) - 22 * 4 * f * (1 - f);
        }
        if (!arrows[k]) return;
        const a = ramp(q, h - 0.1, h + 0.3, E.lin);
        L5.drawOn(arrows[k], a);
        V.show(arrows[k], a > 0 ? 1 : 0);
      });
      ball.setAttribute("cx", f1(x));
      ball.setAttribute("cy", f1(y));
      V.show(ball, ramp(q, 0.2, 0.5));
      const r = ramp(q, 2.9, 3.2, E.lin);
      V.place(ring, { s: 0.5 + 0.5 * E.pop(r), o: r });
    };
  }

  // ---------- row 2: full batch, mini-batch, one at a time ----------
  function batchRow(pic) {
    const N = 8;
    const SIZES = [8, 4, 1];
    const ups = SIZES.map((b) => N / b);
    D9.same("recap row 2: 8 records in batches of 8, 4, 1", ups, [1, 2, 8]);
    const row = D4.chips(pic, { x: 22, y: 22, n: N, w: 30, h: 30, gap: 8, fs: 0, tone: "purple", radius: 8, lip: 4 });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const cx = (i) => row.mid(i).x;
    const y0 = row.bottom(0).y + 12;
    const braces = SIZES.map((b) =>
      Array.from({ length: N / b }, (_, j) =>
        svg.appendChild(D9.brace(cx(j * b) - 13, cx(j * b + b - 1) + 13, y0, "purple", { h: 14, w: 5 })),
      ),
    );
    const tags = ups.map((u) =>
      D4.tag(pic, { x: 170, y: 116, text: `${u} update${u > 1 ? "s" : ""}`, tone: "blue", solid: true, fs: 28 }),
    );
    const AT = [1.0, 2.0, 3.0];
    return (q) => {
      const stage = AT.reduce((s, a, i) => (q >= a ? i : s), -1);
      const fl = AT.reduce((s, a) => Math.max(s, flash(q, a, a + 0.4)), 0);
      row.all((i) => ({ solid: true, o: ramp(q, 0.1 + 0.05 * i, 0.4 + 0.05 * i), s: 1 + 0.18 * fl }));
      braces.forEach((set, s) =>
        set.forEach((g) => {
          const k = s === stage ? ramp(q, AT[s], AT[s] + 0.3, E.lin) : 0;
          V.place(g, { o: k, s: 0.9 + 0.1 * k });
        }),
      );
      tags.forEach((tg, s) => tg.set({ k: s === stage ? ramp(q, AT[s] + 0.1, AT[s] + 0.4, E.out) : 0 }));
    };
  }

  // ---------- row 3: online, follow the drift, watch bad data ----------
  function onlineRow(pic) {
    const C = D9.SHIFT.concept;
    const X = { a: 22, b: 318, half: 170 };
    const py = (w) => 118 - ((w - 3) / 4.6) * 104;
    const truth = (x) => (x < X.half ? C.from : C.to);
    const model = (x) => (x < X.half ? C.from : C.to - (C.to - C.from) * Math.exp(-(x - X.half) / 26));
    const SPIKE = { x: 284, w: 7.4, half: 9 };
    const bump = (x) => Math.max(0, 1 - Math.abs(x - SPIKE.x) / SPIKE.half);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const G = T("grey");
    svg.appendChild(
      V.s("polyline", {
        points: `${X.a},6 ${X.a},128 ${X.b + 4},128`,
        fill: "none",
        stroke: G.c,
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
    const line = (tone, w, dash) =>
      svg.appendChild(
        V.s("polyline", {
          fill: "none",
          stroke: T(tone).c,
          "stroke-width": w,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-dasharray": dash || "none",
        }),
      );
    const tl = line("green", 5, "10 8");
    const ml = line("blue", 6);
    const R = T("red");
    const dot = svg.appendChild(
      V.s("circle", { cx: SPIKE.x, cy: f1(py(SPIKE.w)), r: 10, fill: R.c, stroke: R.lip, "stroke-width": 3 }),
    );
    const path = (fn, k) => {
      const end = lerp(X.a, X.b, k);
      const out = [];
      for (let x = X.a; x < end; x += 2) out.push(`${f1(x)},${f1(py(fn(x)))}`);
      out.push(`${f1(end)},${f1(py(fn(end)))}`);
      return out.join(" ");
    };
    return (q) => {
      const kt = ramp(q, 1.0, 1.6, E.lin);
      tl.setAttribute("points", path(truth, kt));
      V.show(tl, kt > 0 ? 1 : 0);
      const km = ramp(q, 1.4, 2.6, E.lin);
      const sp = ramp(q, 2.9, 3.2, E.inOut);
      ml.setAttribute(
        "points",
        path((x) => model(x) + sp * (SPIKE.w - model(SPIKE.x)) * bump(x), km),
      );
      V.show(ml, km > 0 ? 1 : 0);
      const d = ramp(q, 2.8, 3.1, E.lin);
      V.place(dot, { s: (0.5 + 0.5 * E.pop(d)) * (1 + 0.2 * flash(q, 3.1, 3.4)), o: d });
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP" });
      const mascot = V.mascot("pebble", { size: 150, mood: "love" });
      mascot.style.left = "850px";
      mascot.style.top = "48px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "Step downhill:\nlearning rate × slope", descentRow],
        ["purple", "Full batch, mini-batch\nor one at a time", batchRow],
        ["green", "Online: adapt as data\ndrifts, watch bad data", onlineRow],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 9.W",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 904, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t - APPEAR[i]);
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
