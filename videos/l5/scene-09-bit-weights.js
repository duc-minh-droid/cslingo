/* Lecture 5 · Encodings, scene 09-bit-weights: not every bit is equal. One antenna coordinate is five bits [sign][8][4][2][1]
   (+2 = 0 0010). Flip a bit and a slider thumb hops along a number line from -15 to +15: the 1-bit moves it 1, the 8-bit moves
   it 8, the sign bit moves it 4 (+2 becomes -2). Every value comes from the bits through valueOf(), never typed.
   Story (local seconds): 0.1-1.2 tiles, weights, "=" and the value card appear, 0.7-1.7 number line and thumb, 1.8-2.3 the lit
   tile "2" is linked to +2. Then three flips (an orange ring marks the flipped bit; after the hop an orange arc spans the move
   and is named "moves N"): 2.5 the 1-bit (then back), 5.2 the 8-bit (then back), 8.1 the sign bit (stays). 9.55 closing tag. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // the coordinate: a sign bit, then bits worth 8, 4, 2, 1
  const WEIGHTS = [null, 8, 4, 2, 1];
  const START = [0, 0, 0, 1, 0]; // +2
  const valueOf = (b) => (b[0] ? -1 : 1) * b.slice(1).reduce((sum, v, i) => sum + v * WEIGHTS[i + 1], 0);
  const SIGNED = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");

  // timeline: a flip turns a tile, the thumb hops, an orange arc spans the move and is named; the back step undoes all of it
  const EVENTS = [
    {
      bit: 4,
      flip: [2.5, 2.9],
      move: [2.85, 3.35],
      arc: [3.35, 3.6],
      tag: [3.45, 3.7],
      back: { out: [4.5, 4.65], flip: [4.5, 4.85], move: [4.6, 5.05] },
    },
    {
      bit: 1,
      flip: [5.2, 5.6],
      move: [5.55, 6.1],
      arc: [6.1, 6.35],
      tag: [6.2, 6.45],
      back: { out: [7.3, 7.45], flip: [7.3, 7.65], move: [7.4, 7.9] },
    },
    { bit: 0, flip: [8.1, 8.5], move: [8.45, 9.0], arc: [9.0, 9.25], tag: [9.1, 9.35] },
  ];
  const T_FINAL = 9.55;

  // what each flip does to the value, computed from the bits
  const bits = [...START];
  EVENTS.forEach((e) => {
    e.from = valueOf(bits);
    bits[e.bit] ^= 1;
    e.to = valueOf(bits);
    e.dist = Math.abs(e.to - e.from);
    if (e.back) bits[e.bit] ^= 1;
  });
  const START_V = valueOf(START);
  if (START_V !== 2 || EVENTS.map((e) => e.to).join() !== "3,10,-2" || EVENTS.map((e) => e.dist).join() !== "1,8,4")
    throw new Error("bit-weights scene: the values do not match the lesson (+2, then +3, +10, -2)");

  // number line -15 .. +15 with a slider thumb centred on the line (24 x 44); a bigger move is a bigger hop and a bigger arc
  const [X0, PPU, Y, SIZE, GAP] = [48, 28, 468, 96, 14];
  const [THUMB_W, THUMB_H] = [24, 44];
  const TILE = { x: 22, y: 36 };
  const xOf = (v) => X0 + (v + 15) * PPU;
  const slotX = (i) => TILE.x + i * (SIZE + GAP);
  EVENTS.forEach((e) => {
    const [x0, x1] = [xOf(e.from), xOf(e.to)];
    const dx = Math.abs(x1 - x0);
    Object.assign(e, { x0, x1, dir: Math.sign(x1 - x0), cx: (x0 + x1) / 2, rx: dx / 2, hop: 16 + 0.25 * dx });
    e.arcY = Y - THUMB_H / 2 - 10; // the arc starts just above the thumb
    e.arcRy = 20 + 0.28 * dx;
  });
  const hopPt = (e, f) => ({
    x: e.cx - e.dir * e.rx * Math.cos(Math.PI * f),
    y: Y - e.hop * Math.sin(Math.PI * f),
  });
  const hopOf = (e, t) =>
    ramp(t, e.move[0], e.move[1], E.inOut) - (e.back ? ramp(t, e.back.move[0], e.back.move[1], E.inOut) : 0);
  const arcOf = (e, t) =>
    ramp(t, e.arc[0], e.arc[1], E.inOut) - (e.back ? ramp(t, e.back.out[0], e.back.out[1], E.lin) : 0);

  // every flip of one tile, in time order
  const flipsOf = (i) => EVENTS.filter((e) => e.bit === i).flatMap((e) => (e.back ? [e.flip, e.back.flip] : [e.flip]));
  const tileAt = (i, t) => {
    let bit = START[i];
    let k = null;
    flipsOf(i).forEach(([a, b]) => {
      if (t >= (a + b) / 2) bit ^= 1;
      if (t > a && t < b) k = (t - a) / (b - a);
    });
    const sx = k == null ? 1 : Math.max(0.03, Math.abs(Math.cos(Math.PI * k)));
    return { bit, sx, y: k == null ? 0 : -12 * Math.sin(Math.PI * k) };
  };

  const pill = {
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 0 var(--c-lip)",
  };
  const thumbRect = (x, dy, attrs) =>
    V.s("rect", {
      x: x - THUMB_W / 2,
      y: Y - THUMB_H / 2 + dy,
      width: THUMB_W,
      height: THUMB_H,
      rx: THUMB_W / 2,
      ...attrs,
    });

  V.scene({
    kicker: "BIT WEIGHTS",
    title: ["Not every bit", "is equal"],
    dur: 11,
    caps: [
      [0.4, 2.4, "A coordinate is stored as five bits."],
      [2.4, 5.1, "Flip the 1-bit: the value moves 1."],
      [5.1, 8, "Flip the 8-bit: it moves 8."],
      [8, 9.5, "Flip the sign: + becomes −, a jump of 4."],
      [9.5, 10.6, "Which bit you flip matters."],
    ],
    build(stage) {
      const svg = L5.svg(stage);

      // "=" between the bits and the value
      const equals = [TILE.y + 34, TILE.y + 54].map((y) =>
        svg.appendChild(V.s("rect", { x: 584, y, width: 36, height: 8, rx: 4, style: { fill: "var(--text-dim)" } })),
      );

      // number line, ticks and labels
      const xEnd = xOf(15) + 14;
      const line = svg.appendChild(
        V.s("line", {
          x1: xOf(-15) - 14,
          y1: Y,
          x2: xEnd,
          y2: Y,
          "stroke-width": 6,
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)" },
        }),
      );
      const ticks = Array.from({ length: 31 }, (_, n) => {
        const v = n - 15;
        const big = v % 5 === 0;
        return svg.appendChild(
          V.s("line", {
            x1: xOf(v),
            x2: xOf(v),
            y1: Y - (big ? 14 : 8),
            y2: Y + (big ? 14 : 8),
            "stroke-width": big ? 4 : 3,
            "stroke-linecap": "round",
            style: { stroke: v === 0 ? "var(--text-dim)" : "var(--line-2)" },
          }),
        );
      });
      const numbers = [-15, -10, -5, 0, 5, 10, 15].map((v) =>
        svg.appendChild(
          V.s("text", {
            x: xOf(v),
            y: Y + 60,
            "text-anchor": "middle",
            text: v < 0 ? `−${-v}` : String(v),
            style: {
              fontFamily: "var(--sans)",
              fontSize: "28px",
              fontWeight: "800",
              fill: v === 0 ? "var(--ink)" : "var(--text-dim)",
            },
          }),
        ),
      );

      // the orange arcs (one per flip), the dashed outline of where the thumb started, the thumb (a blue sticker)
      const arcs = EVENTS.map((e) =>
        svg.appendChild(
          V.s(
            "g",
            {},
            V.s("path", {
              d: `M ${e.x0.toFixed(1)} ${e.arcY} A ${e.rx.toFixed(1)} ${e.arcRy.toFixed(1)} 0 0 ${e.dir > 0 ? 1 : 0} ${e.x1.toFixed(1)} ${e.arcY}`,
              fill: "none",
              pathLength: "1",
              "data-draw": "1",
              "stroke-width": 7,
              "stroke-linecap": "round",
              style: { stroke: "var(--amber)" },
            }),
          ),
        ),
      );
      const ghost = svg.appendChild(
        thumbRect(xOf(START_V), 0, {
          fill: "none",
          "stroke-width": 4,
          "stroke-dasharray": "7 6",
          style: { stroke: "var(--blue-edge)" },
        }),
      );
      const thumb = svg.appendChild(
        V.s(
          "g",
          {},
          thumbRect(xOf(START_V), 4, { style: { fill: "var(--blue-lip)" } }),
          thumbRect(xOf(START_V), 0, { "stroke-width": 4, style: { fill: "var(--blue)", stroke: "var(--blue-lip)" } }),
        ),
      );

      // the five bit tiles, the weights under them, and a ring that marks the bit being flipped
      const row = L5.chromosome(stage, {
        x: TILE.x,
        y: TILE.y,
        genes: START.map(String),
        size: SIZE,
        gap: GAP,
        tone: "grey",
      });
      const weights = WEIGHTS.map((w, i) =>
        stage.appendChild(
          V.h("div", {
            class: "v-text",
            text: w == null ? "sign" : String(w),
            style: {
              left: `${slotX(i)}px`,
              top: `${TILE.y + (w == null ? 122 : 112)}px`,
              width: `${SIZE}px`,
              textAlign: "center",
              fontSize: w == null ? "30px" : "46px",
              fontWeight: "900",
              lineHeight: "1.2",
            },
          }),
        ),
      );
      const rings = EVENTS.map((e) =>
        stage.appendChild(
          V.h("div", {
            style: {
              position: "absolute",
              boxSizing: "border-box",
              left: `${slotX(e.bit) - 8}px`,
              top: `${TILE.y - 8}px`,
              width: `${SIZE + 16}px`,
              height: `${SIZE + 22}px`,
              border: "6px solid var(--amber)",
              borderRadius: "28px",
            },
          }),
        ),
      );

      // the value, big
      const card = stage.appendChild(
        V.h("div", {
          class: "v-card c-blue",
          style: { left: "644px", top: `${TILE.y}px`, width: "280px", height: "152px" },
        }),
      );
      card.append(
        V.h("div", {
          class: "v-text",
          text: "value",
          style: {
            left: "0",
            top: "8px",
            width: "100%",
            textAlign: "center",
            fontSize: "28px",
            color: "var(--blue-ink)",
          },
        }),
      );
      const bigNum = card.appendChild(
        V.h("div", {
          class: "v-text",
          text: SIGNED(START_V),
          style: {
            left: "0",
            top: "40px",
            width: "100%",
            textAlign: "center",
            fontSize: "92px",
            fontWeight: "900",
            lineHeight: "1",
            color: "var(--blue-ink)",
          },
        }),
      );

      // "moves N" labels above each arc, and the closing tag
      const tags = EVENTS.map((e) =>
        stage.appendChild(
          V.h("div", {
            class: "v-tag solid c-orange",
            text: `moves ${e.dist}`,
            style: {
              ...pill,
              left: `${Math.round(e.cx - 70)}px`,
              top: `${Math.round(e.arcY - e.arcRy - 62)}px`,
              width: "140px",
              height: "52px",
              fontSize: "30px",
            },
          }),
        ),
      );
      const closing = stage.appendChild(
        V.h("div", {
          class: "v-tag c-orange",
          text: "one flip, a big or small move",
          style: { ...pill, left: "176px", top: "566px", width: "584px", height: "58px", fontSize: "34px" },
        }),
      );

      return (t) => {
        // ---- the bit tiles ----
        const lit = flash(t, 1.8, 2.3); // links the lit tile to +2
        row.all((i) => {
          const p = ramp(t, 0.1 + 0.1 * i, 0.5 + 0.1 * i, E.lin);
          const st = tileAt(i, t);
          const landed = EVENTS.filter((e) => e.bit === i).reduce(
            (s, e) => s + flash(t, e.flip[1], e.flip[1] + 0.3),
            0,
          );
          return {
            y: st.y - (1 - E.out(p)) * 24,
            s: E.pop(p) * (1 + 0.1 * landed + (i === 3 ? 0.1 * lit : 0)),
            sx: st.sx,
            o: clamp(p * 4),
            tone: st.bit ? "blue" : "grey",
            solid: st.bit === 1,
            text: String(st.bit),
          };
        });

        // ---- rings and weights: the flipped bit is the one that matters ----
        const act = START.map(() => 0);
        EVENTS.forEach((e, n) => {
          const a = e.flip[0] - 0.1;
          const b = e.back ? e.back.flip[1] + 0.1 : 99;
          const k = ramp(t, a, a + 0.3, E.back);
          const out = ramp(t, b, b + 0.2, E.lin);
          V.place(rings[n], { s: 0.85 + 0.15 * k, o: clamp(k * 3) * (1 - out) });
          act[e.bit] = Math.max(act[e.bit], clamp(k) * (1 - out));
        });
        weights.forEach((w, i) => {
          const p = ramp(t, 0.3 + 0.1 * i, 0.7 + 0.1 * i, E.lin);
          const on = act[i] > 0.5;
          const set = tileAt(i, t).bit === 1;
          w.style.color = on ? "var(--amber-ink)" : set ? "var(--blue-ink)" : "var(--text-dim)";
          V.place(w, { s: 1 + 0.2 * act[i] + (i === 3 ? 0.12 * lit : 0), y: (1 - E.out(p)) * 10, o: p });
        });

        // ---- the thumb hops along the arc of whichever flip is under way ----
        const hops = EVENTS.map((e) => hopOf(e, t));
        let live = -1;
        hops.forEach((f, n) => (live = f > 0.0005 ? n : live));
        const pos = live < 0 ? { x: xOf(START_V), y: Y } : hopPt(EVENTS[live], hops[live]);
        const landings = EVENTS.flatMap((e) => [e.move[1], e.back && e.back.move[1]]).filter(Boolean);
        const bump = landings.reduce((s, l) => s + flash(t, l, l + 0.3), 0);

        const lineK = ramp(t, 0.7, 1.4, E.out);
        line.setAttribute("x2", (xOf(-15) - 14 + (xEnd - xOf(-15) + 14) * lineK).toFixed(1));
        V.show(line, clamp(lineK * 6));
        ticks.forEach((tk, n) => V.show(tk, ramp(t, 0.8 + n * 0.014, 1.05 + n * 0.014, E.lin)));
        numbers.forEach((n, k) => V.show(n, ramp(t, 1.0 + k * 0.05, 1.3 + k * 0.05, E.lin)));

        const drop = ramp(t, 1.2, 1.7, E.lin);
        V.place(thumb, {
          x: pos.x - xOf(START_V),
          y: pos.y - Y - (1 - E.out(drop)) * 80,
          s: E.pop(drop) * (1 + 0.15 * bump + 0.15 * lit),
          o: clamp(drop * 4),
        });
        V.show(ghost, clamp(Math.max(0, ...hops) * 6) * clamp(drop * 4));
        arcs.forEach((g, n) => L5.drawOn(g, arcOf(EVENTS[n], t)));

        // ---- the value follows the thumb ----
        const cardK = ramp(t, 0.5, 1.0, E.lin);
        const shown = SIGNED(Math.round((pos.x - X0) / PPU - 15));
        if (bigNum.textContent !== shown) bigNum.textContent = shown;
        V.place(card, { s: (0.8 + 0.2 * E.pop(cardK)) * (1 + 0.04 * bump + 0.04 * lit), o: clamp(cardK * 4) });
        equals.forEach((q) => V.show(q, ramp(t, 0.45, 0.8, E.lin)));

        // ---- "moves N" labels ----
        tags.forEach((tg, n) => {
          const e = EVENTS[n];
          const k = ramp(t, e.tag[0], e.tag[1], E.lin);
          const out = e.back ? ramp(t, e.back.out[0], e.back.out[1], E.lin) : 0;
          V.place(tg, {
            s: (0.7 + 0.3 * E.pop(k)) * (1 - 0.12 * out),
            y: (1 - E.out(k)) * 10,
            o: clamp(k * 3) * (1 - out),
          });
        });
        const ck = ramp(t, T_FINAL, T_FINAL + 0.35, E.lin);
        V.place(closing, { s: 0.85 + 0.15 * E.pop(ck), y: (1 - E.out(ck)) * 10, o: clamp(ck * 4) });
      };
    },
  });
})();
