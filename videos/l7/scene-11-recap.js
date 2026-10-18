/* Lecture 7 · Swarm intelligence, scene 11-recap: three rows, each a small pictogram that plays ONCE and then holds its finished
   drawing, and one bold line. No numbers on screen.
   Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0 (the pictogram starts 0.4 s later), 5.4 the call to action.
   Row 1 (purple): five identical ink ants on a ring, linked to their neighbours (no leader in the middle); an orange crown pops
          in the centre and a red cross draws over it.
   Row 2 (blue): four ants run from one grey sticker to another and the blue trail between them thickens; purple dots lift off it
          while it thins (evaporation); a last ant follows it and stops on the far sticker under a green tick.
   Row 3 (green): four towns and six thin grey roads; the four roads of the shortest tour (L7.MAP.tours[1]) draw on in green one
          after another and thicken while the two other roads fade away; a green tick pops in the middle. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const lin = E.lin;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const line = (a, b, attrs) =>
    V.s("path", {
      d: `M ${f1(a[0])} ${f1(a[1])} L ${f1(b[0])} ${f1(b[1])}`,
      fill: "none",
      pathLength: "1",
      "stroke-linecap": "round",
      ...attrs,
    });
  // draw-on of a line made by line(): k 0..1 of its length (hidden at 0)
  const drawTo = (el, k) => {
    el.style.strokeDasharray = `${clamp(k).toFixed(3)} 2`;
    el.style.visibility = k <= 0.002 ? "hidden" : "";
  };

  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4); // each pictogram starts 0.4 s after its row
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // drawn at 340 x 140, shown 10% larger

  // a round green sticker with a tick (the tick draws on while the sticker pops); returns update(k, o)
  function tickBadge(svg, x, y, r) {
    const green = L7.tone("green");
    const lip = V.s("circle", { cx: x, cy: y + 4, r, style: { fill: green.edge } });
    const disc = V.s("circle", { cx: x, cy: y, r, "stroke-width": 3, style: { fill: green.dim, stroke: green.edge } });
    const tick = L5.tick(x, y, r * 1.8, "green", { ink: true, w: 7 });
    const g = svg.appendChild(V.s("g", {}, lip, disc, tick));
    return (k, o = 1) => {
      L5.drawOn(tick, ramp(k, 0.2, 1, lin));
      V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) * o });
    };
  }

  // ---------- row 1: ants with no leader ----------
  function swarmRow(pic) {
    const N = 5;
    const SIZE = 42;
    const GAP = 26; // a link starts this far from each ant centre
    const ELL = { cx: 170, cy: 70, rx: 126, ry: 49 };
    const at = (a) => [ELL.cx + ELL.rx * Math.cos(a), ELL.cy + ELL.ry * Math.sin(a)];
    // five ants spaced evenly ALONG the ellipse (equal arc length), clockwise from the top
    const STEPS = 2000;
    const cum = [0];
    for (let i = 1; i <= STEPS; i++) {
      const [p, q] = [at(-Math.PI / 2 + ((i - 1) / STEPS) * 2 * Math.PI), at(-Math.PI / 2 + (i / STEPS) * 2 * Math.PI)];
      cum.push(cum[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1]));
    }
    const ring = Array.from({ length: N }, (_, k) => {
      const want = (cum[STEPS] * k) / N;
      let i = 0;
      while (cum[i + 1] < want) i++;
      const a = -Math.PI / 2 + ((i + (want - cum[i]) / (cum[i + 1] - cum[i])) / STEPS) * 2 * Math.PI;
      const [x, y] = at(a);
      return { x, y, r: (Math.atan2(ELL.ry * Math.cos(a), -ELL.rx * Math.sin(a)) * 180) / Math.PI }; // r: face along the ring
    });
    const T = { pop: 0.1, popStep: 0.12, link: 0.9, linkStep: 0.08, crown: 1.8, cross: 2.4 };

    const svg = L5.svg(pic, PIC.w, PIC.h);
    const links = ring.map((p, k) => {
      const q = ring[(k + 1) % N];
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      if (len < 2 * GAP + 20) throw new Error(`recap row 1: link ${k} is too short to show (${Math.round(len)} px)`);
      const [ux, uy] = [(q.x - p.x) / len, (q.y - p.y) / len];
      return svg.appendChild(
        line([p.x + ux * GAP, p.y + uy * GAP], [q.x - ux * GAP, q.y - uy * GAP], {
          "stroke-width": 5,
          style: { stroke: "var(--line-2)" },
        }),
      );
    });
    const ants = ring.map(() => svg.appendChild(L7.ant(0, 0, SIZE)));
    const crown = svg.appendChild(L7.crown(ELL.cx, ELL.cy - 2, 60, "orange"));
    const cross = svg.appendChild(L5.cross(ELL.cx, ELL.cy, 68, "red", { w: 8 }));

    return (t) => {
      const q = t - START[0];
      ring.forEach((p, k) => {
        const t0 = T.pop + T.popStep * k;
        const pk = ramp(q, t0, t0 + 0.3, lin);
        V.place(ants[k], {
          x: p.x,
          y: p.y - 14 * (1 - ramp(q, t0, t0 + 0.3, E.out)),
          r: p.r,
          s: E.pop(pk),
          o: ramp(q, t0, t0 + 0.15, lin),
        });
        drawTo(links[k], ramp(q, T.link + T.linkStep * k, T.link + T.linkStep * k + 0.3, E.inOut));
      });
      V.place(crown, { s: E.pop(ramp(q, T.crown, T.crown + 0.5, lin)), o: ramp(q, T.crown, T.crown + 0.2, lin) });
      L5.drawOn(cross, ramp(q, T.cross, T.cross + 0.5, lin));
    };
  }

  // ---------- row 2: a trail builds up, evaporates a little, and guides the next ant ----------
  function trailRow(pic) {
    const [LX, RX, Y] = [36, 304, 70];
    const R = 24; // the two stickers
    const ROAD = 26; // the grey road is wide enough for the thickest trail (20 px)
    const SIZE = 30;
    const RUN = 0.6; // one run from sticker to sticker
    const DEP = [0.6, 0.8, 1.0, 1.2]; // the four leading ants leave one after another
    const T = { thin: [2.2, 2.8], last: [3.0, 3.8], tick: [3.9, 4.3] };
    const thick = (p) => 3 + (17 * p.reduce((a, b) => a + b, 0)) / p.length; // 3 px for the first ant, 20 px once all four have passed

    const road = L5.svg(pic, PIC.w, PIC.h);
    road.appendChild(line([LX, Y], [RX, Y], { "stroke-width": ROAD, style: { stroke: "var(--line)" } }));
    const blue = road.appendChild(line([LX, Y], [RX, Y], { style: { stroke: "var(--blue)" } }));
    const purple = road.appendChild(line([LX, Y], [RX, Y], { style: { stroke: "var(--violet)" } }));
    const stickers = L5.svg(pic, PIC.w, PIC.h);
    [LX, RX].forEach((x) => stickers.appendChild(L7.spot(x, Y, "", R)));
    // purple dots lifting off the trail while it thins (evaporation)
    const violet = L7.tone("purple");
    const dots = [96, 170, 244].map((x) =>
      stickers.appendChild(
        V.s("circle", { cx: x, cy: Y, r: 8, "stroke-width": 3, style: { fill: violet.c, stroke: violet.lip } }),
      ),
    );
    const antLayer = L5.svg(pic, PIC.w, PIC.h);
    const runners = DEP.map(() => antLayer.appendChild(L7.ant(0, 0, SIZE)));
    const last = antLayer.appendChild(L7.ant(0, 0, SIZE));
    const badge = tickBadge(antLayer, RX, 20, 19);

    return (t) => {
      const q = t - START[1];
      const prog = DEP.map((d) => clamp((q - d) / RUN));
      // the trail is laid behind the first ant, then thickens with every ant that follows, then thins while it evaporates
      const thin = ramp(q, T.thin[0], T.thin[1], E.inOut);
      const w = thick(prog) - 8 * thin;
      const hue = flash(q, T.thin[0], T.thin[1] + 0.4); // purple while it fades
      drawTo(blue, Math.max(...prog));
      drawTo(purple, Math.max(...prog));
      blue.setAttribute("stroke-width", f1(w));
      purple.setAttribute("stroke-width", f1(w));
      V.show(purple, hue);
      dots.forEach((d, j) => {
        const u = clamp((q - T.thin[0] - 0.12 * j) / 0.8);
        const o = Math.min(1, 2 * Math.sin(Math.PI * u)); // in quickly, holds, out at the top
        V.place(d, { y: -(10 + 24 * E.out(u)), s: 0.7 + 0.3 * E.out(Math.min(1, 3 * u)), o });
      });
      runners.forEach((a, i) => {
        const p = prog[i];
        V.place(a, {
          x: lerp(LX, RX, p),
          y: Y + 1.5 * Math.sin(2 * Math.PI * (4 * q + i * 0.3)),
          o: ramp(p, 0, 0.12, lin) * (1 - ramp(p, 0.88, 1, lin)),
        });
      });
      // the last ant follows the trail and waits on the far sticker
      const pl = ramp(q, T.last[0], T.last[1], E.inOut);
      V.place(last, {
        x: lerp(LX, RX, pl),
        y: Y + (pl > 0 && pl < 1 ? 1.5 * Math.sin(2 * Math.PI * 4 * q) : 0),
        o: ramp(q, T.last[0], T.last[0] + 0.15, lin),
      });
      badge(ramp(q, T.tick[0], T.tick[1], lin));
    };
  }

  // ---------- row 3: the shortest tour gets the thick trail ----------
  function shortRow(pic) {
    const TOUR = L7.MAP.tours[1];
    L7.same("recap row 3: the shortest tour", [TOUR.name, TOUR.len], ["A-B-D-C", 14]);
    const POS = { A: [40, 30], B: [300, 30], C: [86, 112], D: [254, 112] };
    const R = 15;
    const T = { go: 0.7, step: 0.35, fade: [1.0, 2.3], tick: [2.5, 2.9] };
    const legs = TOUR.path.map((c, i) => ({ from: c, to: TOUR.path[(i + 1) % TOUR.path.length] }));
    const keys = legs.map((l) => L7.ek(l.from, l.to));
    L7.same("recap row 3: the tour's roads", [...keys].sort(), [...TOUR.edges].sort());
    const skipped = L7.MAP.roads.filter((k) => !keys.includes(k));
    L7.same("recap row 3: the roads the tour skips", skipped, ["A-D", "B-C"]);
    const ends = (k) => k.split("-").map((c) => POS[c]);

    const svg = L5.svg(pic, PIC.w, PIC.h);
    const grey = Object.fromEntries(
      L7.MAP.roads.map((k) => [
        k,
        svg.appendChild(line(...ends(k), { "stroke-width": 5, style: { stroke: "var(--line-2)" } })),
      ]),
    );
    const green = L7.tone("green");
    const tour = legs.map((l) =>
      svg.appendChild(line(POS[l.from], POS[l.to], { "stroke-width": 14, style: { stroke: green.c } })),
    );
    const reached = { [TOUR.path[0]]: T.go }; // when the green tour first touches each town
    legs.forEach((l, i) => (reached[l.to] = reached[l.to] ?? T.go + T.step * (i + 1)));
    const towns = L7.MAP.names.split("").map((c) => {
      const lip = V.s("circle", { cx: POS[c][0], cy: POS[c][1] + 3, r: R });
      const face = V.s("circle", { cx: POS[c][0], cy: POS[c][1], r: R, "stroke-width": 3 });
      return { c, lip, face, g: svg.appendChild(V.s("g", {}, lip, face)) };
    });
    const badge = tickBadge(svg, 170, 70, 22);
    const greyTone = L7.tone("grey");

    return (t) => {
      const q = t - START[2];
      const fade = ramp(q, T.fade[0], T.fade[1], E.inOut);
      L7.MAP.roads.forEach((k) => {
        const off = !keys.includes(k);
        grey[k].setAttribute("stroke-width", f1(off ? lerp(5, 2, fade) : 5));
        V.show(grey[k], q < 0 ? 0 : off ? 1 - fade : 1);
      });
      legs.forEach((l, i) => {
        const a = T.go + T.step * i;
        tour[i].setAttribute("stroke-width", f1(lerp(6, 14, ramp(q, a, a + T.step, lin))));
        drawTo(tour[i], ramp(q, a, a + T.step, lin));
      });
      towns.forEach(({ c, lip, face, g }, i) => {
        const on = q >= reached[c];
        face.style.fill = on ? green.c : "var(--panel)";
        face.style.stroke = on ? green.lip : greyTone.edge;
        lip.style.fill = on ? green.lip : greyTone.edge;
        const pk = ramp(q, 0.05 * i, 0.05 * i + 0.4, lin);
        V.place(g, { s: E.pop(pk) * (1 + 0.25 * flash(q, reached[c], reached[c] + 0.3)), o: Math.min(1, pk * 4) });
      });
      badge(ramp(q, T.tick[0], T.tick[1], lin));
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
        ["purple", "Simple ants, no boss:\na clever colony", swarmRow],
        ["blue", "Trails build up, fade\nand guide the next ant", trailRow],
        ["green", "Short tours get more\npheromone per road", shortRow],
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
        text: "Next: Workshop 7.W",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 864, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
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
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
