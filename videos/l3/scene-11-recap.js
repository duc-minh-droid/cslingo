/* Lecture 3 · scene-11-recap.js: three rows, each a small looping pictogram and one bold line.
   Row 1 a six-dot ring (the EA loop) with a token running round it; row 2 hillclimbing stops on the nearest hill;
   row 3 a jump over the valley, then a whole team. Local seconds: 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0,
   pictograms start 0.4 s later and loop (4 s, the ring 2.4 s), 5.4-6.0 the call-to-action tag pops. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const L3 = V.l3;
  const { ramp, flash, clamp, ease: E } = V;

  const f1 = (n) => (+n).toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };
  const PERIOD = 4;
  const loopT = (t, t0, p) => (t < t0 ? -1 : (t - t0) % p);

  // ---------- row 1: the six-station loop ----------
  function ring(pic) {
    const TONES = ["blue", "green", "orange", "purple", "purple", "green"];
    const [CX, CY, R, DR] = [170, 70, 51, 17];
    const P = 2.4;
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const ang = (k) => -Math.PI / 2 + (k * Math.PI) / 3;
    const at = (k, r = R) => [CX + r * Math.cos(ang(k)), CY + r * Math.sin(ang(k))];
    const arrows = TONES.map((_, k) => {
      const [a, b] = [at(k), at(k + 1)];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const [ux, uy] = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
      const m = DR + 5;
      return svg.appendChild(
        L5.arrow(a[0] + ux * m, a[1] + uy * m, b[0] - ux * m, b[1] - uy * m, "grey", 1, { w: 5, head: 12 }),
      );
    });
    const dots = TONES.map((name, k) => {
      const tn = L5.tone(name);
      const [x, y] = at(k);
      const lip = V.s("circle", { cx: f1(x), cy: f1(y + 4), r: DR, style: { fill: tn.lip } });
      const body = V.s("circle", { cx: f1(x), cy: f1(y), r: DR, "stroke-width": 3, style: { stroke: tn.lip } });
      const g = svg.appendChild(V.s("g", {}, lip, body));
      return { g, body, tn, x, y };
    });
    const tk = L5.tone("blue");
    const token = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("circle", { cx: 0, cy: 4, r: 11, style: { fill: tk.lip } }),
        V.s("circle", { cx: 0, cy: 0, r: 11, "stroke-width": 3, style: { fill: tk.c, stroke: tk.lip } }),
      ),
    );
    return (t) => {
      const born = (k) => ramp(t, 0.05 * k, 0.05 * k + 0.4, E.lin);
      const q = loopT(t, 0.4, P);
      const lap = q < 0 ? -1 : (q / P) * 6; // position of the token in dot units
      arrows.forEach((g, k) => {
        L5.drawOn(g, born(k));
      });
      dots.forEach((d, k) => {
        // time since the token last reached dot k
        const since = q < 0 ? -1 : (((q / P) * 6 - k + 6) % 6) * (P / 6);
        const lit = q >= 0 && since <= 0.7 && (t - 0.4 >= (k * P) / 6 || k === 0);
        const done = q >= 0 && t - 0.4 >= (k * P) / 6;
        d.body.style.fill = lit ? d.tn.c : done ? d.tn.dim : "var(--panel-2)";
        d.body.style.stroke = done ? d.tn.lip : "var(--line-2)";
        V.place(d.g, { s: E.pop(born(k)) * (1 + 0.25 * (q >= 0 ? flash(since, 0, 0.4) : 0)), o: clamp(born(k) * 4) });
      });
      const a = ang(lap);
      V.place(token, {
        x: CX + R * Math.cos(a) * (lap < 0 ? 0 : 1),
        y: CY + R * Math.sin(a) * (lap < 0 ? 0 : 1),
        s: 0.8 + 0.2 * (1 - Math.abs(Math.sin(Math.PI * lap))),
        o: lap < 0 ? 0 : ramp(q, 0, 0.2, E.lin),
      });
    };
  }

  // ---------- rows 2 and 3: the mini landscape ----------
  function landscape(pic) {
    return L3.land(pic, { x: 0, y: 0, w: PIC.w, h: PIC.h, kind: "multi", frame: false });
  }

  function stuck(pic) {
    const P = landscape(pic);
    const star = P.marker("star", {});
    const token = P.marker("token", { size: 30 });
    const cross = P.marker("badge", { icon: "cross" });
    return (t) => {
      const tt = loopT(t, 0.4, PERIOD);
      const q = tt < 0 ? 0 : tt;
      const on = tt >= 0;
      const fadeOut = 1 - ramp(q, 3.5, 3.9, E.lin);
      const born = on ? ramp(q, 0, 0.4, E.lin) : ramp(t, 0.4, 0.8, E.lin);
      P.update({ curve: 1, fill: 1, bars: 0 });
      star.set({ i: P.best, s: 1 + 0.15 * flash(q, 0.1, 0.5), o: ramp(t, 0.4, 0.8) });
      const step = (k) => ramp(q, 0.4 + 0.3 * k, 0.7 + 0.3 * k, E.lin);
      const segs = [1, 2, 3].map(step);
      const h = segs.findIndex((k) => k > 0 && k < 1);
      const pos = h >= 0 ? L3.hop(4 + h, 5 + h, segs[h], 16) : { i: 4 + segs.filter((k) => k >= 1).length, dy: 0 };
      token.set({ i: pos.i, dy: pos.dy, o: clamp(born * 4) * fadeOut, s: E.pop(born), ring: null });
      const k = on ? ramp(q, 1.5, 1.9, E.lin) : 0;
      cross.set({ icon: "cross", i: 7, dx: 44, dy: 36, k, s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 4) * fadeOut });
    };
  }

  function jump(pic) {
    const P = landscape(pic);
    const arc = V.s("path", {
      d: P.arc(7, 29, 22),
      fill: "none",
      "stroke-width": 5,
      "stroke-linecap": "round",
      "stroke-dasharray": "1 12",
      style: { stroke: L5.tone("purple").c },
    });
    P.over.append(arc);
    const star = P.marker("star", {});
    const token = P.marker("token", { size: 30 });
    const tick = P.marker("badge", { icon: "tick" });
    const team = [7, 18, 29].map((i) => P.marker("token", { size: 30, tone: "blue", i }));
    return (t) => {
      const tt = loopT(t, 0.4, PERIOD);
      const q = tt < 0 ? 0 : tt;
      const on = tt >= 0;
      P.update({ curve: 1, fill: 1, bars: 0 });
      const first = 1 - ramp(q, 2.3, 2.7, E.lin); // the jump scene fades before the team scene
      const born = on ? ramp(q, 0, 0.3, E.lin) : ramp(t, 0.4, 0.8, E.lin);
      const k = ramp(q, 0.6, 1.5, E.lin);
      const hp = L3.hop(7, 29, k, 36);
      arc.style.opacity = f1(ramp(q, 0.25, 0.55, E.lin) * first);
      token.set({ i: hp.i, dy: hp.dy, o: clamp(born * 4) * first, s: E.pop(born) });
      const kk = ramp(q, 1.6, 2.0, E.lin);
      tick.set({ icon: "tick", i: 29, dx: -46, dy: 58, k: kk, s: 0.5 + 0.5 * E.pop(kk), o: clamp(kk * 4) * first });
      star.set({ i: P.best, s: 1 + 0.3 * flash(q, 1.45, 1.9), o: ramp(t, 0.4, 0.8) });
      team.forEach((m, j) => {
        const p = ramp(q, 2.7 + 0.12 * j, 3.1 + 0.12 * j, E.lin);
        const bounce = Math.abs(Math.sin(Math.PI * clamp((q - 3.1 - 0.12 * j) / 0.45))) * ramp(q, 3.1, 3.2, E.lin);
        m.set({ i: [7, 18, 29][j], dx: j === 2 ? -8 : 0, dy: -16 * bounce, s: E.pop(p), o: clamp(p * 4) });
      });
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
      const mascot = V.mascot("sprout", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "One loop: score, pick,\nchange, replace", ring],
        ["red", "Hillclimbing stops on\nthe nearest hill", stuck],
        ["green", "Step downhill, or\nsend a whole team", jump],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", {
          class: `v-card plain c-${tone}`,
          style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h),
        });
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
        text: "Beat the Lecture 3 boss quiz",
        style: {
          position: "absolute",
          left: "0",
          top: "0",
          fontSize: "34px",
          padding: "8px 28px 10px",
          whiteSpace: "nowrap",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 904, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      cta.style.position = "relative";
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
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
