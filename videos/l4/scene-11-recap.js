/* Lecture 4 · scene 11-recap: three rows, each a small animated pictogram and one bold line.
   Story (local seconds): 0.1 title and Sprout, 0.8 / 1.8 / 2.8 the three rows slide in, 5.2 the boss-quiz tag pops.
   Row 1: five tiles flip to purple (everyone replaced), back; then only tile 1 (red, the weakest) flips; loop 5.2 s from 1.4.
   Row 2: five bars show the rank chances for the exponent b, which runs 1 -> 2 -> 0 -> 1 with the knob; loop 4.8 s from 2.4.
   Row 3: a tour re-roll breaks it (two D, red cross), flips back, then a swap keeps it valid (green tick); loop 6.4 s from 3.4. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const svgOf = (tag, attrs, ...kids) => V.s(tag, attrs, ...kids);
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.8, 2.8];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };

  // time inside the current loop cycle, -1 before the first start
  const loop = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period);

  // tone and flip state of one tile from a list of steps {a, b, from, to} (a === b: an instant colour change)
  function stepState(steps, q, base) {
    let cur = base;
    for (const s of steps) {
      if (q < s.a) break;
      if (q < s.b) return { k: ramp(q, s.a, s.b, E.inOut), from: s.from, to: s.to };
      cur = s.to;
    }
    return { k: 0, tone: cur };
  }
  const applyTile = (row, i, st, extra) => {
    if (st.tone) row.set(i, { ...extra, tone: st.tone });
    else row.flip(i, st.k, { ...extra, from: "", to: "", tone: st.from, toTone: st.to, hop: 14 });
  };

  // ---------- row 1: replace all, or just one ----------
  function replaceRow(pic) {
    const [SIZE, GAP] = [48, 10];
    const row = L4.tiles(pic, {
      x: 16,
      y: 46,
      vals: ["", "", "", "", ""],
      w: SIZE,
      h: SIZE,
      gap: GAP,
      font: 28,
      tone: "grey",
    });
    const base = (i) => (i === 4 ? "green" : "grey");
    const P = 5.2;
    const steps = (i) => {
      const w = 0.3 + 0.16 * i;
      const all = [
        { a: w, b: w + 0.5, from: base(i), to: "purple" },
        { a: 2.0 + 0.08 * i, b: 2.5 + 0.08 * i, from: "purple", to: base(i) },
      ];
      return i === 0
        ? [
            ...all,
            { a: 3.3, b: 3.3, from: "grey", to: "red" },
            { a: 3.6, b: 4.1, from: "red", to: "purple" },
            { a: 4.6, b: 5.0, from: "purple", to: "grey" },
          ]
        : all;
    };
    const stepsOf = [0, 1, 2, 3, 4].map(steps);
    return (t) => {
      const q = loop(t, 1.4, P);
      row.all((i) => ({ o: 1 }));
      for (let i = 0; i < 5; i++) {
        const born = ramp(t, 1.0 + 0.08 * i, 1.5 + 0.08 * i, E.lin);
        const shake = i === 0 ? 4 * Math.sin(q * 40) * flash(q, 3.3, 3.6) : 0;
        const extra = { s: E.pop(born), o: clamp(born * 4), x: shake };
        applyTile(row, i, q < 0 ? { k: 0, tone: base(i) } : stepState(stepsOf[i], q, base(i)), extra);
      }
    };
  }

  // ---------- row 2: bars follow the exponent b ----------
  function pressureRow(pic) {
    const P = 4.8;
    const [BASE, LEN, KMAX] = [132, 118, 0.5];
    const bars = [0, 1, 2, 3, 4].map((i) =>
      L4.bar(pic, { x: 10 + i * 32, y: BASE, len: LEN, thick: 22, dir: "v", textPos: "none" }),
    );
    const bOf = (q) => {
      if (q < 0) return 1;
      return q < 1.0
        ? 1
        : q < 1.8
          ? lerp(1, 2, E.inOut(ramp(q, 1.0, 1.8)))
          : q < 2.8
            ? 2
            : q < 3.6
              ? lerp(2, 0, E.inOut(ramp(q, 2.8, 3.6)))
              : q < 4.0
                ? 0
                : lerp(0, 1, E.inOut(ramp(q, 4.0, 4.6)));
    };
    const [TX0, TX1, TY] = [200, 322, 84];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const track = svg.appendChild(
      svgOf("rect", { x: TX0 - 8, y: TY - 8, width: TX1 - TX0 + 16, height: 16, rx: 8, "stroke-width": 3 }),
    );
    track.style.fill = "var(--panel-2)";
    track.style.stroke = "var(--line-2)";
    const [gr, ink] = [L5.tone("green"), "var(--ink)"];
    const dots = [0, 1, 2].map((s) => {
      const d = svg.appendChild(svgOf("circle", { cx: lerp(TX0, TX1, s / 2), cy: TY + 30, r: 5 }));
      d.style.fill = ink;
      return d;
    });
    const lip = svg.appendChild(svgOf("circle", { r: 17, cy: TY + 4 }));
    const thumb = svg.appendChild(svgOf("circle", { r: 17, cy: TY, "stroke-width": 3 }));
    lip.style.fill = gr.lip;
    thumb.style.fill = gr.c;
    thumb.style.stroke = gr.lip;
    const tag = L4.tag(pic, { x: 200, y: 8, text: "b = 1", tone: "green", fs: 28 });
    return (t) => {
      const q = loop(t, 2.4, P);
      const b = bOf(q);
      const ps = L4.rankProbs([5, 4, 3, 2, 1], b).p;
      bars.forEach((bar, i) => {
        const born = ramp(t, 2.0 + 0.08 * i, 2.5 + 0.08 * i, E.lin);
        bar.set({ k: (ps[i] / KMAX) * E.out(born), tone: "green", o: clamp(born * 4) });
      });
      const x = lerp(TX0, TX1, b / 2);
      thumb.setAttribute("cx", f1(x));
      lip.setAttribute("cx", f1(x));
      const born = ramp(t, 2.1, 2.6, E.lin);
      [track, thumb, lip, ...dots].forEach((e) => V.show(e, born));
      tag.set({ text: `b = ${Math.round(b)}`, o: born, s: 1 });
    };
  }

  // ---------- row 3: re-roll breaks a tour, swap keeps it valid ----------
  function operatorRow(pic) {
    const TOUR = "DEGJA";
    const BROKEN = TOUR.slice(0, 3) + "D" + TOUR.slice(4);
    const SWAPPED = L5.swapAt(TOUR, 1, 4);
    if (L5.isPerm(BROKEN) || !L5.isPerm(SWAPPED) || SWAPPED !== "DAGJE") throw new Error("recap: unexpected tours");
    const bad = L5.dupIdx(BROKEN);
    const [SIZE, PITCH] = [48, 56];
    const row = L4.tiles(pic, {
      x: 6,
      y: 46,
      vals: [...TOUR],
      w: SIZE,
      h: SIZE,
      gap: PITCH - SIZE,
      font: 28,
      tone: "blue",
    });
    const [I, J] = [1, 4];
    const T = {
      flip: [0.3, 0.8],
      red0: 0.8,
      cross: 0.95,
      back: [2.2, 2.7],
      blue0: 2.7,
      swap: [3.2, 4.2],
      green: 4.4,
      tick: 4.7,
      undo: [5.2, 6.0],
      end: 6.1,
    };
    const over = L5.svg(pic, PIC.w, PIC.h);
    const [BX, BY] = [312, 70];
    const [red, green] = [L5.tone("red"), L5.tone("green")];
    const lip = svgOf("circle", { cx: BX, cy: BY + 5, r: 24 });
    const disc = svgOf("circle", { cx: BX, cy: BY, r: 24, "stroke-width": 3 });
    const crossG = L5.cross(BX, BY, 44, "red", { ink: true, w: 7 });
    const tickG = L5.tick(BX, BY, 44, "green", { ink: true, w: 7 });
    const badge = over.appendChild(svgOf("g", {}, lip, disc, crossG, tickG));
    return (t) => {
      const q = loop(t, 3.4, 6.4);
      const k = q < 0 ? 0 : ramp(q, T.swap[0], T.swap[1], E.inOut) - ramp(q, T.undo[0], T.undo[1], E.inOut);
      const moving = k > 0 && k < 1;
      const brokenNow = q >= T.red0 && q < T.back[1];
      for (let i = 0; i < 5; i++) {
        const born = ramp(t, 3.0 + 0.07 * i, 3.5 + 0.07 * i, E.lin);
        const hop = i === I ? 1 : i === J ? -1 : 0;
        const green0 = T.green + 0.08 * i;
        let tone = "blue";
        if (q >= 0) {
          if (moving && hop) tone = "purple";
          else if (q >= green0 && q < T.end - 0.1) tone = "green";
          else if (brokenNow && bad.includes(i)) tone = "red";
        }
        const shake = q >= 0 && bad.includes(i) ? 5 * Math.sin((q - T.red0) * 38) * flash(q, T.red0, T.red0 + 0.5) : 0;
        const extra = {
          x: shake + hop * PITCH * (J - I) * k * (hop > 0 ? 1 : 1),
          y: -(1 - E.out(born)) * 16 - hop * 28 * Math.sin(Math.PI * k),
          s: E.pop(born) * (1 + (hop ? 0.06 * flash(q, T.swap[0], T.swap[1]) : 0)),
          o: clamp(born * 4),
        };
        if (i === 3 && q >= 0 && q >= T.flip[0] && q < T.back[1]) {
          const fw = q < T.back[0];
          const f = fw ? ramp(q, T.flip[0], T.flip[1], E.inOut) : ramp(q, T.back[0], T.back[1], E.inOut);
          if (f > 0 && f < 1)
            row.flip(i, f, {
              ...extra,
              from: fw ? "J" : "D",
              to: fw ? "D" : "J",
              tone: fw ? "blue" : "red",
              toTone: fw ? "red" : "blue",
              hop: 14,
            });
          else row.set(i, { ...extra, text: fw ? "D" : "J", tone });
        } else row.set(i, { ...extra, text: q >= T.flip[1] && q < T.back[0] && i === 3 ? "D" : TOUR[i], tone });
      }
      const showCross = brokenNow;
      const showTick = q >= T.tick && q < T.undo[1];
      const on = showCross
        ? ramp(q, T.cross, T.cross + 0.4) - ramp(q, T.back[0], T.back[0] + 0.3)
        : showTick
          ? ramp(q, T.tick, T.tick + 0.4) - ramp(q, T.undo[0], T.undo[0] + 0.5)
          : 0;
      const tn = showTick ? green : red;
      [disc.style.fill, disc.style.stroke, lip.style.fill] = [tn.dim, tn.edge, tn.edge];
      V.show(crossG, +showCross);
      V.show(tickG, +showTick);
      L5.drawOn(crossG, clamp(on * 2));
      L5.drawOn(tickG, clamp(on * 2));
      V.place(badge, { s: 0.7 + 0.3 * E.pop(clamp(on)), o: clamp(on * 3) });
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
      const mascot = V.mascot("sprout", { size: 150, mood: "love" });
      mascot.style.left = "850px";
      mascot.style.top = "44px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "Replace all,\nor just a few", replaceRow],
        ["green", "Tune the selection\npressure", pressureRow],
        ["purple", "Operators fit\nthe encoding", operatorRow],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "420px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "42px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Beat the Lecture 4 boss quiz",
        style: { position: "relative", fontSize: "34px", padding: "8px 30px 10px" },
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
          r.update(t);
        });
        V.place(cta, { s: 0.8 + 0.2 * ramp(t, 5.2, 5.8, E.pop), o: ramp(t, 5.2, 5.5) });
      };
    },
  });
})();
