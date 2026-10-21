/* Lecture 1 (ds-1) · Reliable, scalable and maintainable systems, scene 11-recap: three rows, each a small pictogram and one bold line.
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row
   (times below are pictogram time), 5.4 the call to action. Every pictogram plays ONCE and then HOLDS its finished state.
   Row 1 (green): four servers pop in grey and turn green (0.1-0.7); the second one turns orange with a bolt (1.4-1.9) and the
          other three stay green; a green tick draws on (2.4-2.9): a fault is not a failure (75% of the capacity is left).
   Row 2 (blue): nine blue requests walk through a purple split to ONE server (0.25-2.0); its meter fills and turns orange and a
          third of them (D1.serve: 3,000 of 9,000) drop; then two servers pop in (1.8-2.3), the requests fan out over three
          (2.0-3.4) and all three meters settle calm and green at half (3,000 of 6,000 each).
   Row 3 (purple): three apps and two databases, six tangled grey links (0.5-1.0); a purple layer pops in over them (1.1-1.5) and
          five tidy purple links draw on (1.4-1.9); a green tick (2.2-2.7). Counts come from the D1.MAINT rule (a x d vs a + d).
   From about 6.1 s on only Pebble moves. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
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

  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4); // a pictogram starts a little after its row has slid in
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // drawn at 340 x 140, shown 10% larger

  // ---------- small shared pieces ----------
  // a server icon in every tone it can take: show one of them, with a scale and an offset (hard switch, pops on a change)
  function serverIcons(svg, x, y, size, tones) {
    const layers = tones.map((name) => [name, svg.appendChild(D1.icon.server(x, y, size, name))]);
    return (tone, { s = 1, o = 1, dx = 0, dy = 0 } = {}) =>
      layers.forEach(([name, g]) => V.place(g, { x: dx, y: dy, s, o: name === tone ? o : 0 }));
  }

  // a round green sticker with a tick (drawn on, then popped)
  function tickBadge(svg, x, y) {
    const green = L5.tone("green");
    const lip = V.s("circle", { cx: x, cy: y + 5, r: 24, style: { fill: green.edge } });
    const disc = V.s("circle", {
      cx: x,
      cy: y,
      r: 24,
      "stroke-width": 3,
      style: { fill: green.dim, stroke: green.edge },
    });
    const tick = L5.tick(x, y, 40, "green", { ink: true, w: 7 });
    const g = svg.appendChild(V.s("g", {}, lip, disc, tick));
    return (k) => {
      L5.drawOn(tick, ramp(k, 0.2, 1, E.lin));
      V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
    };
  }

  // a straight link that draws on from its first end (k 0..1)
  function link(svg, [x1, y1], [x2, y2], w, stroke) {
    const el = svg.appendChild(
      V.s("line", {
        x1: f1(x1),
        y1: f1(y1),
        x2: f1(x2),
        y2: f1(y2),
        pathLength: 1,
        "stroke-width": w,
        "stroke-linecap": "round",
        style: { stroke },
      }),
    );
    return (k, o = 1) => {
      el.style.strokeDasharray = `${clamp(k).toFixed(3)} 2`;
      V.show(el, k < 0.003 ? 0 : o);
    };
  }

  // ---------- row 1: one fault among four servers is not a failure ----------
  function faultRow(pic) {
    const [XS, Y, S, BAD] = [[40, 110, 180, 250], 82, 54, 1];
    D1.same("recap row 1: a fault leaves capacity, a lone server does not", [D1.left(4, 1), D1.left(1, 1)], [75, 0]);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const servers = XS.map((x, i) =>
      serverIcons(svg, x, Y, S, i === BAD ? ["grey", "green", "orange"] : ["grey", "green"]),
    );
    const bolt = svg.appendChild(D1.icon.bolt(XS[BAD], 28, 40, "orange"));
    const badge = tickBadge(svg, 312, 74);
    const T = { pop: 0.1, popStep: 0.1, turn: 0.3, fault: 1.4, tick: 2.4 };
    const popAt = (i) => T.pop + T.popStep * i;
    const greenAt = (i) => popAt(i) + T.turn;
    const bump = (t, a) => 0.16 * flash(t, a, a + 0.35);

    return (t) => {
      const q = t - START[0];
      servers.forEach((set, i) => {
        const p = ramp(q, popAt(i), popAt(i) + 0.4, E.lin);
        const hit = i === BAD && q >= T.fault;
        const tone = hit ? "orange" : q >= greenAt(i) ? "green" : "grey";
        const shake = i === BAD ? 4 * Math.sin((q - T.fault) * 40) * flash(q, T.fault, T.fault + 0.45) : 0;
        set(tone, {
          s: E.pop(p) * (1 + bump(q, greenAt(i)) + (i === BAD ? bump(q, T.fault) : 0)),
          o: clamp(p * 4),
          dx: shake,
          dy: -(1 - E.out(p)) * 16,
        });
      });
      const b = ramp(q, T.fault, T.fault + 0.5, E.lin);
      V.place(bolt, {
        x: 4 * Math.sin((q - T.fault) * 40) * flash(q, T.fault, T.fault + 0.45),
        y: -(1 - E.out(b)) * 14,
        s: E.pop(b),
        o: clamp(b * 4),
      });
      badge(ramp(q, T.tick, T.tick + 0.5, E.lin));
    };
  }

  // ---------- row 2: one server is full, more servers share the load ----------
  function scaleRow(pic) {
    const [CAP, LOAD, N] = [D1.ONE.cap, D1.ONE.loads[1], 3];
    const one = D1.serve(LOAD, CAP);
    const share = D1.serve(LOAD / N, CAP);
    D1.same("recap row 2: one server drops a third", [one.served, one.dropped], [6000, 3000]);
    D1.same("recap row 2: three servers drop nothing", [share.served, share.dropped], [3000, 0]);
    const [FULL, HALF] = [Math.min(1, LOAD / CAP), share.load / CAP];
    D1.same("recap row 2: meters", [FULL, HALF], [1, 0.5]);
    const REQS = 9;
    const lost = Math.round((REQS * one.dropped) / LOAD); // every third request is lost
    D1.same("recap row 2: dropped requests", lost, 3);

    const [SPLIT, SX, YS, ME] = [[120, 70], 236, [24, 70, 116], 1];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const grey = "var(--line-2)";
    const wireIn = link(svg, [12, 70], [SPLIT[0] - 8, 70], 5, grey);
    const wires = YS.map((y) => link(svg, SPLIT, [SX - 18, y], 5, grey));

    // packets: SVG, under the split and the servers so they slide into them
    const packet = () => {
      const rect = (dy, fill, stroke) =>
        V.s("rect", { x: -9, y: -9 + dy, width: 18, height: 18, rx: 5, "stroke-width": 2.5, style: { fill, stroke } });
      const [blue, red] = [L5.tone("blue"), L5.tone("red")];
      const lip = rect(3, blue.lip, blue.lip);
      const face = rect(0, blue.c, blue.lip);
      return { g: svg.appendChild(V.s("g", {}, lip, face)), lip, face, blue, red };
    };
    // a trip takes DUR seconds; a dropped request goes the same speed to the full server (STOP of the way), then takes FALL to tumble off
    const [DUR, FALL, STOP, A0, AS, B0, BS] = [0.75, 0.4, 0.92, 0.25, 0.12, 2.0, 0.13];
    const TRAVEL = DUR * STOP;
    const trips = [
      ...Array.from({ length: REQS }, (_, i) => ({ t0: A0 + AS * i, to: ME, drop: i % 3 === 2 })),
      ...Array.from({ length: 6 }, (_, j) => ({ t0: B0 + BS * j, to: j % 3, drop: false })),
    ].map((tr) => ({
      ...tr,
      ...packet(),
      dur: tr.drop ? TRAVEL + FALL : DUR,
      path: D1.poly([[12, 70], SPLIT, [SX - 20, YS[tr.to]]]),
    }));

    // the split: a purple sticker with a fork
    const vio = L5.tone("purple");
    const split = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("circle", { cx: SPLIT[0], cy: SPLIT[1] + 4, r: 19, style: { fill: vio.lip } }),
        V.s("circle", {
          cx: SPLIT[0],
          cy: SPLIT[1],
          r: 19,
          "stroke-width": 3,
          style: { fill: vio.c, stroke: vio.lip },
        }),
        V.s("path", {
          d: `M ${SPLIT[0] - 9} ${SPLIT[1]} H ${SPLIT[0] - 2} M ${SPLIT[0] - 2} ${SPLIT[1]} L ${SPLIT[0] + 8} ${SPLIT[1] - 8} M ${SPLIT[0] - 2} ${SPLIT[1]} H ${SPLIT[0] + 8} M ${SPLIT[0] - 2} ${SPLIT[1]} L ${SPLIT[0] + 8} ${SPLIT[1] + 8}`,
          fill: "none",
          "stroke-width": 3.5,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: vio.on },
        }),
      ),
    );

    // the servers, each with a meter to its right
    const icons = YS.map((y) => serverIcons(svg, SX, y, 38, ["grey", "green", "orange"]));
    const MX = 268;
    const meters = YS.map((y) => {
      const track = svg.appendChild(
        V.s("rect", {
          x: MX,
          y: y - 8,
          width: 62,
          height: 16,
          rx: 8,
          "stroke-width": 2.5,
          style: { fill: "var(--panel)", stroke: grey },
        }),
      );
      const fill = svg.appendChild(V.s("rect", { x: MX, y: y - 8, height: 16, "stroke-width": 2.5 }));
      return { track, fill };
    });

    const T = { fill: [0.3, 1.0], full: 1.0, add: 1.8, drain: [2.2, 3.0], green: 2.6, rise: [2.5, 3.4] };
    const level = (q, i) =>
      i === ME
        ? lerp(ramp(q, T.fill[0], T.fill[1], E.lin) * FULL, HALF, ramp(q, T.drain[0], T.drain[1], E.inOut))
        : HALF * ramp(q, T.rise[0], T.rise[1], E.out);

    return (t) => {
      const q = t - START[1];
      const born = (a, d = 0.4) => ramp(q, a, a + d, E.lin);
      const bornMid = born(0);
      const added = born(T.add, 0.5);

      // links and the split
      wireIn(born(0.05, 0.3));
      V.place(split, { s: E.pop(born(0.1, 0.5)), o: clamp(born(0.1, 0.5) * 4) });
      wires.forEach((w, i) => w(i === ME ? born(0.2, 0.3) : ramp(q, T.add - 0.2, T.add + 0.3, E.lin)));

      // packets
      trips.forEach((tr) => {
        const sec = q - tr.t0; // seconds into this trip
        if (sec < 0 || sec > tr.dur) return V.place(tr.g, { o: 0 });
        const fall = tr.drop ? ramp(sec, TRAVEL, tr.dur, E.lin) : 0; // a dropped request bounces off the full server, turns red and falls
        const p = tr.path.at(tr.drop ? STOP * ramp(sec, 0, TRAVEL, E.lin) : sec / DUR);
        const tone = fall > 0 ? tr.red : tr.blue;
        [tr.lip.style.fill, tr.face.style.fill] = [tone.lip, tone.c];
        [tr.lip.style.stroke, tr.face.style.stroke] = [tone.lip, tone.lip];
        V.place(tr.g, {
          x: p.x,
          y: p.y + 62 * fall * fall,
          r: 60 * fall,
          s: tr.drop ? 1 - 0.3 * fall : 1 - 0.45 * ramp(sec / DUR, 0.9, 1, E.lin),
          o: Math.min(
            ramp(sec, 0, 0.1, E.lin),
            tr.drop ? 1 - ramp(fall, 0.45, 0.95, E.lin) : 1 - ramp(sec / DUR, 0.92, 1, E.lin),
          ),
        });
      });

      // servers and meters
      icons.forEach((set, i) => {
        const b = i === ME ? bornMid : added;
        const hot = i === ME && q >= T.full && q < T.green;
        const calm = i === ME ? q >= T.green : q >= T.add + 0.5;
        set(hot ? "orange" : calm ? "green" : "grey", {
          s:
            E.pop(b) *
            (1 +
              0.14 *
                (i === ME
                  ? flash(q, T.full, T.full + 0.35) + flash(q, T.green, T.green + 0.35)
                  : flash(q, T.add + 0.5, T.add + 0.85))),
          o: clamp(b * 4),
          dy: -(1 - E.out(b)) * 12,
        });
        const { track, fill } = meters[i];
        const v = level(q, i);
        const tone = L5.tone(hot ? "orange" : calm ? "green" : "blue");
        const w = 62 * v;
        fill.setAttribute("width", f1(Math.max(0, w)));
        fill.setAttribute("rx", f1(Math.min(8, w / 2)));
        [fill.style.fill, fill.style.stroke] = [tone.c, tone.lip];
        V.show(fill, w < 1.5 ? 0 : b);
        V.place(track, { o: b });
      });
    };
  }

  // ---------- row 3: a layer between apps and databases keeps the links tidy ----------
  function layerRow(pic) {
    const [A, DB] = [3, 2];
    const [direct, layered] = [A * DB, A + DB];
    D1.same("recap row 3: links without / with the layer", [direct, layered], [6, 5]);
    D1.same(
      "recap row 3: the same rule gives the lesson's 20 / 9",
      [D1.MAINT.direct, D1.MAINT.layered],
      [D1.MAINT.services.length * D1.MAINT.dbs.length, D1.MAINT.services.length + D1.MAINT.dbs.length],
    );
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const [AX, DX, AY, BY, DY] = [[42, 132, 222], [87, 177], 18, 66, 118];
    const [grey, vio] = [L5.tone("grey"), L5.tone("purple")];
    const sticker = (x, y, w, h, r, tone) => {
      const lip = V.s("rect", { x, y: y + 4, width: w, height: h, rx: r, style: { fill: tone.lip } });
      const face = V.s("rect", {
        x,
        y,
        width: w,
        height: h,
        rx: r,
        "stroke-width": 3,
        style: { fill: tone.c === grey.c ? "var(--line-2)" : tone.c, stroke: tone.lip },
      });
      return svg.appendChild(V.s("g", {}, lip, face));
    };

    // the tangle (under everything), then the apps, databases, layer and tidy links
    const tangle = AX.flatMap((ax) => DX.map((dx) => link(svg, [ax, AY + 14], [dx, DY - 20], 4, "var(--line-2)")));
    D1.same("recap row 3: tangled links drawn", tangle.length, direct);
    const apps = AX.map((x) => sticker(x - 29, AY - 14, 58, 30, 10, grey));
    const dbs = DX.map((x) => svg.appendChild(D1.icon.db(x, DY, 36, "grey")));
    const bar = sticker(10, BY - 14, 244, 28, 12, vio);
    const tidy = [
      ...AX.map((x) => link(svg, [x, AY + 16], [x, BY - 14], 5, vio.lip)),
      ...DX.map((x) => link(svg, [x, BY + 14], [x, DY - 18], 5, vio.lip)),
    ];
    D1.same("recap row 3: tidy links drawn", tidy.length, layered);
    const badge = tickBadge(svg, 312, 74);
    const T = { apps: 0.1, dbs: 0.3, tangle: 0.5, bar: 1.1, tidy: 1.4, tick: 2.2 };

    return (t) => {
      const q = t - START[2];
      const pop = (g, a, d = 0.4, dy = 0) => {
        const k = ramp(q, a, a + d, E.lin);
        V.place(g, { y: -(1 - E.out(k)) * dy, s: E.pop(k), o: clamp(k * 4) });
      };
      apps.forEach((g, i) => pop(g, T.apps + 0.08 * i, 0.4, 12));
      dbs.forEach((g, i) => pop(g, T.dbs + 0.08 * i, 0.4, 12));
      const fade = 1 - ramp(q, T.bar, T.bar + 0.4, E.lin); // the tangle gives way to the layer
      tangle.forEach((w, i) => w(ramp(q, T.tangle + 0.07 * i, T.tangle + 0.07 * i + 0.4, E.lin), fade));
      pop(bar, T.bar, 0.5, 0);
      tidy.forEach((w, i) => w(ramp(q, T.tidy + 0.09 * i, T.tidy + 0.09 * i + 0.3, E.lin)));
      badge(ramp(q, T.tick, T.tick + 0.5, E.lin));
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
      // 30 px like the title card's kicker (the engine's default .v-kicker is 28 px)
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP", style: { fontSize: "30px" } });
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["green", "Faults must not\nbecome failures", faultRow],
        ["blue", "Add machines\nas load grows", scaleRow],
        ["purple", "Easy to run,\nunderstand, change", layerRow],
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
        text: D1.NEXT,
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
          r.update(t);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
