/* Lecture 5 · Encodings, scene 10-recap: three rows, each a small animated pictogram and one bold line.
   Story (local seconds): 0.1 title and Sprout, 0.8 / 1.8 / 2.8 the three rows slide in.
   Row 1: the five cities light up along the route (1.4-2.5), then turn into five gene tiles ADECB (3.3-4.8).
   Row 2: a broken child ADCDB (red cross) shakes, the repeated D becomes E (3.6-4.2), everything turns green with a tick,
          then a swap of two genes (5.3-6.3) and back (7.5-8.5) keeps it valid.
   Row 3: genes go straight into the answer (direct, from 5.0) or through a decoder box first (indirect, from 6.0);
          the packets keep looping.
   4.6 the "Not every bit is equal" tag and 6.4 the plain "Next: Workshop 5.W" tag pop in. */
(function () {
  const V = window.VID;
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
  const loop = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period); // time inside the current cycle, -1 before the first
  const pulse = (t, t1, period) => (t < t1 ? 0 : flash((t - t1) % period, 0, 0.4)); // a bump at t1, t1 + period, ...

  // the three rows: card geometry and the moment each one slides in
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.8, 2.8];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // the pictogram area inside a card (drawn at 340 x 140, shown 10% larger)

  // ---------- row 1: a map becomes a gene string ----------
  function mapToGenes(pic) {
    const TOUR = "ADECB";
    const POS = { A: [50, 59], D: [170, 24], E: [290, 59], C: [244, 116], B: [96, 116] };
    const slot = (i) => [38 + i * 66, 70];
    const T = { cities: 1.0, route: [1.4, 2.5], morph: 3.3, wave: 5.0 };
    const R = 20;
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const arrows = [...TOUR].map((c, i) => {
      const [a, b] = [POS[c], POS[TOUR[(i + 1) % TOUR.length]]];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const [ux, uy] = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
      const m = R + 4;
      const g = L5.arrow(a[0] + ux * m, a[1] + uy * m, b[0] - ux * m, b[1] - uy * m, "blue", 1, { w: 6, head: 15 });
      return svg.appendChild(g);
    });
    const tiles = [...TOUR].map((c) => pic.appendChild(V.h("div", { class: "v-gene c-grey", text: c })));
    return (t) => {
      const d = ramp(t, T.route[0], T.route[1], E.lin);
      arrows.forEach((g, i) => L5.drawOn(g, clamp(d * arrows.length - i)));
      V.show(svg, 1 - ramp(t, T.morph, T.morph + 0.5, E.lin));
      tiles.forEach((tile, j) => {
        const born = ramp(t, T.cities + 0.07 * j, T.cities + 0.07 * j + 0.45, E.lin);
        const litAt = T.route[0] + ((T.route[1] - T.route[0]) * j) / tiles.length;
        const lit = t >= litAt;
        const e = ramp(t, T.morph + 0.1 * j, T.morph + 0.1 * j + 0.7, E.inOut);
        const size = (lerp(40, 56, e) + 7 * flash(t, litAt, litAt + 0.3)) * E.pop(born);
        const [from, to] = [POS[TOUR[j]], slot(j)];
        const wave =
          ramp(t, T.wave, T.wave + 0.4) *
          Math.pow(Math.max(0, Math.sin(2 * Math.PI * ((t - T.wave) / 2.4 - j * 0.11))), 2);
        const cx = lerp(from[0], to[0], e);
        const cy = lerp(from[1], to[1], e) - 18 * Math.sin(Math.PI * e) - 6 * wave;
        const st = tile.style;
        tile.className = `v-gene c-${lit ? "blue" : "grey"}`;
        Object.assign(st, box(cx - size / 2, cy - size / 2, size, size));
        st.borderRadius = `${f1(lerp(size / 2, 14, e))}px`;
        st.fontSize = `${f1(lerp(28, 30, e))}px`;
        V.show(tile, clamp(born * 4));
      });
    };
  }

  // ---------- row 2: broken, repaired, swapped, still valid ----------
  function brokenToValid(pic) {
    const BROKEN = L5.cross1("ADECB", "AECDB", 2)[0];
    const FIXED = L5.repair(BROKEN);
    const SWAPPED = L5.swapAt(FIXED, 1, 2);
    if (BROKEN !== "ADCDB" || FIXED !== "ADCEB" || SWAPPED !== "ACDEB") throw new Error("recap: unexpected tours");
    if (L5.isPerm(BROKEN) || !L5.isPerm(FIXED) || !L5.isPerm(SWAPPED)) throw new Error("recap: validity is wrong");
    const [fix] = L5.repairSteps(BROKEN); // the second D becomes E
    const bad = L5.dupIdx(BROKEN);
    const [SIZE, PITCH] = [48, 56];
    const cx = (i) => 30 + PITCH * i;
    const T = {
      pop: 2.0,
      badge: 2.5,
      shake: [2.7, 3.3],
      fix: [3.6, 4.2],
      green: 4.3,
      swap: [5.3, 6.3],
      back: [7.5, 8.5],
    };
    const greenAt = (i) => T.green + 0.08 * i;
    const [I, J] = [1, 2]; // the two genes that swap

    // purple swap arrows lie under the tiles
    const under = L5.svg(pic, PIC.w, PIC.h);
    const arcs = [
      under.appendChild(L5.arrow(cx(I), 36, cx(J), 36, "purple", 1, { w: 5, head: 15, bow: 16 })),
      under.appendChild(L5.arrow(cx(J), 106, cx(I), 106, "purple", 1, { w: 5, head: 15, bow: 16 })),
    ];
    const row = L5.chromosome(pic, { x: 6, y: 46, genes: BROKEN, size: SIZE, gap: PITCH - SIZE, tone: "blue" });
    row.tiles.forEach((tile) => Object.assign(tile.style, { fontSize: "28px", borderRadius: "14px" }));

    // the status sticker: red cross, then green tick
    const over = L5.svg(pic, PIC.w, PIC.h);
    const [BX, BY] = [312, 70];
    const [red, green] = [L5.tone("red"), L5.tone("green")];
    const lip = svgOf("circle", { cx: BX, cy: BY + 5, r: 24 });
    const disc = svgOf("circle", { cx: BX, cy: BY, r: 24, "stroke-width": 3 });
    const crossG = L5.cross(BX, BY, 44, "red", { ink: true, w: 7 });
    const tickG = L5.tick(BX, BY, 44, "green", { ink: true, w: 7 });
    const badge = over.appendChild(svgOf("g", {}, lip, disc, crossG, tickG));

    return (t) => {
      const valid = t >= T.green;
      const fixK = ramp(t, T.fix[0], T.fix[1], E.lin);
      const swapK = ramp(t, T.swap[0], T.swap[1], E.inOut) - ramp(t, T.back[0], T.back[1], E.inOut); // out, then back again
      const hopping = swapK > 0 && swapK < 1;
      const bump = (i) => 0.14 * flash(t, greenAt(i), greenAt(i) + 0.35);
      for (let i = 0; i < FIXED.length; i++) {
        const p = ramp(t, T.pop + 0.07 * i, T.pop + 0.07 * i + 0.45, E.lin);
        const shake = bad.includes(i) ? 5 * Math.sin((t - T.shake[0]) * 38) * flash(t, T.shake[0], T.shake[1]) : 0;
        const hop = i === I ? 1 : i === J ? -1 : 0; // one tile hops over, the other under
        const st = {
          x: shake + hop * PITCH * (J - I) * swapK,
          y: -(1 - E.out(p)) * 20 - hop * 30 * Math.sin(Math.PI * swapK),
          s:
            E.pop(p) *
            (1 + bump(i) + (hop ? 0.06 * (flash(t, T.swap[0], T.swap[1]) + flash(t, T.back[0], T.back[1])) : 0)),
          o: clamp(p * 4),
          tone: hopping && hop ? "purple" : valid && t >= greenAt(i) ? "green" : bad.includes(i) ? "red" : "blue",
        };
        if (i === fix.i)
          row.flip(i, fixK, {
            ...st,
            from: fix.from,
            to: fix.to,
            tone: st.tone,
            toTone: valid ? "green" : "purple",
            hop: 16,
          });
        else row.set(i, st);
      }
      // the arrows draw in just before each swap and fade after it
      const [a, b] = t < T.swap[1] + 0.6 ? T.swap : T.back;
      arcs.forEach((g) => {
        L5.drawOn(g, ramp(t, a - 0.45, a - 0.05, E.lin));
        V.show(g, 1 - ramp(t, b + 0.05, b + 0.45, E.lin));
      });
      // sticker: pops in red, flips to green when the tour is valid, bumps again after the swap
      const born = ramp(t, T.badge, T.badge + 0.5, E.lin);
      const tone = valid ? green : red;
      [disc.style.fill, disc.style.stroke, lip.style.fill] = [tone.dim, tone.edge, tone.edge];
      V.show(crossG, +!valid);
      V.show(tickG, +valid);
      L5.drawOn(crossG, ramp(t, T.badge + 0.2, T.badge + 0.5));
      L5.drawOn(tickG, ramp(t, T.green + 0.05, T.green + 0.5));
      const scale =
        0.7 +
        0.3 * E.pop(born) +
        0.12 * flash(t, T.green, T.green + 0.4) +
        0.12 * (flash(t, T.swap[1], T.swap[1] + 0.4) + flash(t, T.back[1], T.back[1] + 0.4));
      V.place(badge, { s: scale, o: clamp(born * 4) });
    };
  }

  // ---------- row 3: genes feed the answer directly, or through a decoder ----------
  function genesToAnswer(pic) {
    const [Y1, Y2] = [32, 108]; // the two lanes
    const P = 2.6; // one trip of a packet, then it repeats
    const T = {
      panel: 3.1,
      lane1: 3.2,
      lane2: 3.5,
      arrow1: 3.7,
      arrow2: 3.9,
      box: 4.1,
      arrow3: 4.5,
      direct: 5.0,
      indirect: 6.0,
    };
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const divider = svg.appendChild(
      svgOf("path", {
        d: `M 4 70 L 262 70`,
        fill: "none",
        "stroke-width": 3,
        "stroke-linecap": "round",
        "stroke-dasharray": "2 9",
        style: { stroke: "var(--line-2)" },
      }),
    );
    const grey = (x1, x2, y) => svg.appendChild(L5.arrow(x1, y, x2, y, "grey", 1, { w: 6, head: 16 }));
    const [direct, toBox, fromBox] = [grey(150, 266, Y1), grey(150, 180, Y2), grey(232, 266, Y2)];

    // packets (under the decoder and the answer, so they slide in and out of them): blue genes in, green answer out
    const packet = (name) => {
      const tn = L5.tone(name);
      const rect = (dy, fill) =>
        svgOf("rect", {
          x: -11,
          y: -11 + dy,
          width: 22,
          height: 22,
          rx: 6,
          "stroke-width": 2.5,
          style: { fill, stroke: tn.lip },
        });
      return svg.appendChild(svgOf("g", {}, rect(3, tn.lip), rect(0, tn.c)));
    };
    const [pD, pIn, pOut] = [packet("blue"), packet("blue"), packet("green")];

    // the answer: a small timetable that fills in once something reaches it
    const panel = svg.appendChild(svgOf("g", {}));
    const sticker = (x, y, w, h, r, extra) => svgOf("rect", { x, y, width: w, height: h, rx: r, ...extra });
    const panelLip = panel.appendChild(sticker(272, 11, 64, 124, 14, {}));
    const panelBody = panel.appendChild(sticker(272, 6, 64, 124, 14, { "stroke-width": 3 }));
    const header = panel.appendChild(sticker(279, 13, 50, 14, 7, {}));
    const FILLED = [0, 3, 4];
    const cells = Array.from({ length: 6 }, (_, k) =>
      panel.appendChild(sticker(279 + (k % 2) * 28, 37 + Math.floor(k / 2) * 30, 22, 22, 6, { "stroke-width": 2.5 })),
    );

    // the decoder: a purple box with a turning gear
    const decoder = svg.appendChild(svgOf("g", {}));
    const vio = L5.tone("purple");
    decoder.append(
      sticker(184, 87, 44, 52, 12, { style: { fill: vio.lip } }),
      sticker(184, 82, 44, 52, 12, { "stroke-width": 3, style: { fill: vio.c, stroke: vio.lip } }),
    );
    const [GX, GY] = [206, 108];
    const gearD = Array.from({ length: 8 }, (_, k) => {
      const a = (k * Math.PI) / 4;
      const pt = (da, r) => `${f1(GX + r * Math.cos(a + da))} ${f1(GY + r * Math.sin(a + da))}`;
      const w = (Math.PI / 180) * 11;
      return `${k ? "L" : "M"} ${pt(-w * 1.5, 12)} L ${pt(-w * 0.8, 17)} L ${pt(w * 0.8, 17)} L ${pt(w * 1.5, 12)}`;
    }).join(" ");
    const gear = decoder.appendChild(
      svgOf(
        "g",
        {},
        svgOf("path", { d: `${gearD} Z`, style: { fill: vio.on } }),
        svgOf("circle", { cx: GX, cy: GY, r: 5.5, style: { fill: vio.c } }),
      ),
    );

    const mkRow = (genes, y) => {
      const row = L5.chromosome(pic, { x: 4, y, genes, size: 42, gap: 5, tone: "blue" });
      row.tiles.forEach((tile) => Object.assign(tile.style, { fontSize: "26px", borderRadius: "12px" }));
      return row;
    };
    const rows = [mkRow(["3", "11", "7"], Y1 - 21), mkRow(["1", "2", "1"], Y2 - 21)];

    const ta = Math.min(T.direct + 1.0, T.indirect + 1.4); // first arrival: the answer appears
    return (t) => {
      V.show(divider, ramp(t, T.panel, T.panel + 0.5, E.lin));
      rows.forEach((row, lane) => {
        const t0 = lane ? T.lane2 : T.lane1;
        row.all((i) => {
          const p = ramp(t, t0 + 0.07 * i, t0 + 0.07 * i + 0.45, E.lin);
          return { y: -(1 - E.out(p)) * 14, s: E.pop(p), o: clamp(p * 4) };
        });
      });
      L5.drawOn(direct, ramp(t, T.arrow1, T.arrow1 + 0.5, E.lin));
      L5.drawOn(toBox, ramp(t, T.arrow2, T.arrow2 + 0.3, E.lin));
      L5.drawOn(fromBox, ramp(t, T.arrow3, T.arrow3 + 0.3, E.lin));

      // the decoder pops in, bumps when a packet goes in, and its gear keeps turning
      const q = loop(t, T.indirect, P);
      const n = q < 0 ? 0 : Math.floor((t - T.indirect) / P);
      const work = q < 0 ? 0 : ramp(q, 0.45, 0.9, E.inOut);
      V.place(gear, { r: 18 * t + 150 * (n + work) });
      V.place(decoder, {
        s: E.pop(ramp(t, T.box, T.box + 0.5, E.lin)) * (1 + 0.08 * flash(q, 0.45, 0.9)),
        o: clamp(ramp(t, T.box, T.box + 0.5, E.lin) * 4),
      });

      // packets
      const d = loop(t, T.direct, P);
      V.place(pD, {
        x: lerp(152, 264, E.inOut(clamp(d / 1.0))),
        y: Y1,
        s: 1 - 0.5 * ramp(d, 0.88, 1.0, E.lin),
        o: d < 0 ? 0 : Math.min(ramp(d, 0, 0.15, E.lin), 1 - ramp(d, 0.9, 1.0, E.lin)),
      });
      V.place(pIn, {
        x: lerp(152, 196, E.inOut(clamp(q / 0.45))),
        y: Y2,
        s: 1 - 0.5 * ramp(q, 0.3, 0.45, E.lin),
        o: q < 0 ? 0 : Math.min(ramp(q, 0, 0.15, E.lin), 1 - ramp(q, 0.3, 0.45, E.lin)),
      });
      V.place(pOut, {
        x: lerp(222, 264, E.inOut(clamp((q - 0.9) / 0.5))),
        y: Y2,
        s: 0.6 + 0.4 * ramp(q, 0.9, 1.05, E.lin) - 0.5 * ramp(q, 1.3, 1.4, E.lin),
        o: q < 0.9 ? 0 : Math.min(ramp(q, 0.9, 1.05, E.lin), 1 - ramp(q, 1.32, 1.4, E.lin)),
      });

      // the answer: grey until the first packet arrives, then green, and it bumps with every arrival
      const born = ramp(t, T.panel, T.panel + 0.5, E.lin);
      const got = t >= ta;
      const tn = L5.tone(got ? "green" : "grey");
      [panelBody.style.fill, panelBody.style.stroke, panelLip.style.fill] = [
        "var(--panel)",
        got ? tn.lip : "var(--line-2)",
        got ? tn.lip : "var(--line-2)",
      ];
      header.style.fill = got ? tn.c : "var(--line)";
      const hit = Math.max(pulse(t, T.direct + 1.0, P), pulse(t, T.indirect + 1.4, P));
      V.place(panel, { s: (0.7 + 0.3 * E.pop(born)) * (1 + 0.06 * hit), o: clamp(born * 4) });
      cells.forEach((cell, k) => {
        const on = got && FILLED.includes(k);
        [cell.style.fill, cell.style.stroke] = on ? [tn.c, tn.lip] : ["var(--panel-2)", "var(--line-2)"];
        V.place(cell, { s: on ? E.pop(ramp(t, ta + 0.05 * k, ta + 0.05 * k + 0.4, E.lin)) : 1 });
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
        ["blue", "The encoding is\nthe big decision", mapToGenes],
        ["green", "Keep every child valid", brokenToValid],
        ["purple", "Direct: the answer\nIndirect: instructions", genesToAnswer],
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

      // bottom row: the bit-weights reminder (four bars, each twice the last) and what comes next (plain tags, not buttons)
      const bars = svgOf(
        "svg",
        { width: 64, height: 44, viewBox: "0 0 64 44" },
        ...[0, 1, 2, 3].map((k) =>
          svgOf("rect", {
            x: 2 + k * 16,
            y: 42 - [8, 16, 28, 40][k],
            width: 12,
            height: [8, 16, 28, 40][k],
            rx: 4,
            style: { fill: "var(--amber-on)" },
          }),
        ),
      );
      const tagStyle = { position: "relative", display: "flex", alignItems: "center", gap: "14px", fontSize: "34px" };
      const bitTag = V.h(
        "div",
        { class: "v-tag solid c-orange", style: { ...tagStyle, padding: "8px 28px 10px 22px" } },
        bars,
        V.h("span", { text: "Not every bit is equal" }),
      );
      const nextTag = V.h("div", {
        class: "v-tag c-grey",
        text: "Next: Workshop 5.W",
        style: { ...tagStyle, padding: "8px 26px 10px" },
      });
      const ctaBar = V.h("div", {
        style: {
          ...box(0, 904, 1080, 80),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
        },
      });
      ctaBar.append(bitTag, nextTag);
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
        const [c1, c2] = [ramp(t, 4.6, 5.2, E.pop), ramp(t, 6.4, 7.0, E.pop)];
        V.place(bitTag, { s: 0.8 + 0.2 * c1, o: ramp(t, 4.6, 4.9) });
        V.place(nextTag, { s: 0.8 + 0.2 * c2, o: ramp(t, 6.4, 6.7) });
      };
    },
  });
})();
