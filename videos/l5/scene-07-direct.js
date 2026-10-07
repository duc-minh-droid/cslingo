/* Lecture 5 · Encodings, scene 07-direct: direct encoding of an exam timetable (6 exams, 8 slots). Gene i is the slot of exam i,
   so the genes ARE the timetable. A random mutation moves one exam; the new slot can clash, and fitness must punish it.
   Story (local seconds): 0.35 genes pop in, 0.7 slot boxes, 1.6-3.4 a line per gene runs to its slot and the exam drops in,
   3.15 tag "any string of numbers is a timetable", 4.1 the clash pairs appear, 4.9 spotlight on gene 5 (blue), 5.4 it flips,
   5.95 its line swings to the new slot, 6.35 the exam slides over, 7.05 both exams go red with a clash mark, 7.9 the penalty tag.
   Roles: green = always a legal timetable, blue = the gene being changed, red = clash. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the model: computed, never typed in ----------
  const START = [1, 2, 3, 6, 4, 8]; // gene i = slot of exam i + 1
  const MUT = { gene: 4, to: 6 }; // gene 5 changes from slot 4 to slot 6
  const CLASH = [
    [0, 1], // E1-E2
    [1, 2], // E2-E3
    [3, 4], // E4-E5
  ];
  const clashes = (g) => CLASH.filter(([a, b]) => g[a] === g[b]);
  const AFTER = START.map((s, i) => (i === MUT.gene ? MUT.to : s));
  const BAD = clashes(AFTER)[0];
  if (clashes(START).length || clashes(AFTER).length !== 1 || !BAD.includes(MUT.gene))
    throw new Error("direct scene: the start must be clash-free and the mutation must cause exactly one clash");
  const BAD_SLOT = AFTER[BAD[0]];
  const BAD_PAIR = CLASH.findIndex((p) => p[0] === BAD[0] && p[1] === BAD[1]);
  // exams already standing in the same slot (a second exam sits one row lower)
  const rowOf = (g, i) => g.slice(0, i).filter((s) => s === g[i]).length;

  // ---------- geometry (stage px) ----------
  const BOX = { w: 104, h: 178, pitch: 110, left: 31, y: 300 };
  const TOK = { w: 80, h: 46, gap: 30, pad: 10 };
  const colX = (slot) => BOX.left + BOX.w / 2 + (slot - 1) * BOX.pitch;
  const tokPos = (slot, row) => ({ x: colX(slot) - TOK.w / 2, y: BOX.y + TOK.pad + row * (TOK.h + TOK.gap) });
  const LINE_Y = 162; // where the gene lines start, just under the tiles
  const f1 = (n) => n.toFixed(1);
  // write an attribute only when its value changes, so a frame that repeats an earlier one repaints nothing
  const attr = (el, name, value) => {
    const v = String(value);
    if (el.getAttribute(name) !== v) el.setAttribute(name, v);
  };
  const curve = (x1, y1, x2, y2) => {
    const m = (y1 + y2) / 2;
    return `M ${f1(x1)} ${f1(y1)} C ${f1(x1)} ${f1(m)} ${f1(x2)} ${f1(m)} ${f1(x2)} ${f1(y2)}`;
  };

  // ---------- timeline ----------
  const T = {
    tile: 0.35, // tile i pops at tile + 0.1 i
    box: 0.7, // box k pops at box + 0.06 k
    line: 1.6, // line i starts at line + 0.2 i
    lineStep: 0.2,
    lineDur: 0.5,
    tokLag: 0.4, // the exam drops in this long after its line starts
    tagA: [3.15, 4.2],
    legend: 4.1,
    spot: 4.9,
    flip: [5.4, 5.95],
    sweep: [5.95, 6.6], // the line end swings to the new slot
    move: [6.35, 7.05], // the exam follows
    clash: 7.05,
    tagB: 7.9,
  };

  // a small sticker with a neutral face and blue / red faces on top (cross-fade with tint(blue 0..1, red 0..1))
  function token(parent, text, { x = 0, y = 0, w, h, fs }) {
    const box = V.h("div", {
      style: { position: "absolute", left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` },
    });
    const face = (bg, edge, ink) =>
      V.h("div", {
        text,
        style: {
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          border: `3px solid ${edge}`,
          borderRadius: "14px",
          background: bg,
          boxShadow: `0 5px 0 ${edge}`,
          color: ink,
          fontSize: `${fs}px`,
          fontWeight: "900",
          lineHeight: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });
    const blue = face("var(--blue)", "var(--blue-lip)", "var(--blue-on)");
    const red = face("var(--rose)", "var(--rose-lip)", "var(--rose-on)");
    box.append(face("var(--panel)", "var(--line-2)", "var(--ink)"), blue, red);
    parent.append(box);
    return { el: box, tint: (b, r) => (V.show(blue, b), V.show(red, r)) };
  }

  V.scene({
    kicker: "DIRECT ENCODING",
    title: ["Direct: the genes", "are the answer"],
    dur: 10,
    caps: [
      [0.4, 4, "Direct: each gene is the slot of one exam."],
      [4.5, 7, "Mutation moves just one exam..."],
      [7.2, 9.6, "...but it can create a clash. Fitness must punish it."],
    ],
    build(stage) {
      // chromosome of six genes, with the exam each one belongs to written above it
      const row = L5.chromosome(stage, { x: 145, y: 52, genes: START.map(String), size: 96, gap: 14, tone: "grey" });
      const text = (str, x, y, w, size, align) =>
        V.h("div", {
          class: "v-text dim",
          text: str,
          style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, textAlign: align, fontSize: `${size}px` },
        });
      const examHead = text("exam", 0, 14, 128, 28, "right");
      const geneHead = text("gene", 0, 83, 128, 28, "right");
      const examLbl = START.map((_, i) => text(`E${i + 1}`, row.left + row.pos(i), 12, row.size, 30, "center"));
      stage.append(examHead, geneHead, ...examLbl);

      // the eight slot boxes (a red face for the slot where the clash will happen)
      const boxFace = (k, bg, edge, ink) =>
        V.h(
          "div",
          {
            style: {
              position: "absolute",
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              border: `3px solid ${edge}`,
              borderRadius: "22px",
              background: bg,
              boxShadow: `0 5px 0 ${edge}`,
            },
          },
          V.h("div", {
            text: `slot ${k}`,
            style: {
              position: "absolute",
              left: "0",
              right: "0",
              bottom: "6px",
              textAlign: "center",
              fontSize: "28px",
              fontWeight: "800",
              lineHeight: "34px",
              color: ink,
            },
          }),
        );
      const boxes = Array.from({ length: 8 }, (_, i) => {
        const el = V.h("div", {
          style: {
            position: "absolute",
            left: `${BOX.left + i * BOX.pitch}px`,
            top: `${BOX.y}px`,
            width: `${BOX.w}px`,
            height: `${BOX.h}px`,
          },
        });
        const red = boxFace(i + 1, "var(--rose-dim)", "var(--rose-edge)", "var(--rose-ink)");
        el.append(boxFace(i + 1, "var(--panel-2)", "var(--line-2)", "var(--text-dim)"), red);
        stage.append(el);
        return { el, red };
      });

      // one line per gene: neutral, then a blue and a red copy on top (drawn on with a dash)
      const svg = L5.svg(stage);
      const mkLine = (colour, w) =>
        V.s("path", {
          fill: "none",
          pathLength: "1",
          "stroke-width": w,
          "stroke-linecap": "round",
          style: { stroke: colour },
        });
      const layers = [
        ["var(--node-off-ic)", 4, 7],
        ["var(--blue)", 6, 9],
        ["var(--rose)", 6, 9],
      ].map(([colour, w, r]) =>
        START.map(() => ({ line: mkLine(colour, w), dot: V.s("circle", { r, style: { fill: colour } }) })),
      );
      layers.forEach((layer) => layer.forEach(({ line, dot }) => svg.append(line, dot)));

      // the exam tokens sit above the lines
      const toks = START.map((_, i) => token(stage, `E${i + 1}`, { w: TOK.w, h: TOK.h, fs: 30 }));

      // spotlight ring round the gene that mutates
      const ringPad = 7;
      const ring = V.h("div", {
        style: {
          position: "absolute",
          boxSizing: "border-box",
          left: `${row.left + row.pos(MUT.gene) - ringPad}px`,
          top: `${row.top - ringPad}px`,
          width: `${row.size + 2 * ringPad}px`,
          height: `${row.size + 6 + 2 * ringPad}px`,
          border: "6px solid var(--blue)",
          borderRadius: "30px",
        },
      });
      stage.append(ring);

      // the clash mark: a red link between the two exams in the slot, with a cross on it
      const top = L5.svg(stage);
      const [lx, ly1, ly2] = [colX(BAD_SLOT), tokPos(BAD_SLOT, 0).y + TOK.h, tokPos(BAD_SLOT, 1).y];
      const link = V.s("line", {
        x1: lx,
        y1: ly1,
        x2: lx,
        y2: ly1,
        "stroke-width": 8,
        "stroke-linecap": "round",
        style: { stroke: "var(--rose)" },
      });
      const crossG = L5.cross(lx, (ly1 + ly2) / 2, 28, "red", { ink: true, w: 4 });
      const badgeG = V.s(
        "g",
        {},
        V.s("circle", {
          cx: lx,
          cy: (ly1 + ly2) / 2,
          r: 15,
          "stroke-width": 3.5,
          style: { fill: "var(--panel)", stroke: "var(--rose-lip)" },
        }),
        crossG,
      );
      top.append(link, badgeG);

      // legend: the pairs of exams that share students and must not share a slot
      const legend = V.h("div", {
        style: { position: "absolute", left: "0", top: "574px", width: "936px", height: "52px" },
      });
      const legLbl = V.h("div", {
        text: "can't share a slot",
        style: {
          position: "absolute",
          left: "0",
          top: "0",
          width: "300px",
          textAlign: "right",
          fontSize: "28px",
          fontWeight: "800",
          lineHeight: "44px",
          color: "var(--text-dim)",
        },
      });
      const pairs = CLASH.map(([a, b], j) => {
        const el = V.h("div", {
          style: { position: "absolute", left: `${326 + 204 * j}px`, top: "0", width: "168px", height: "44px" },
        });
        const first = token(el, `E${a + 1}`, { x: 0, w: 62, h: 44, fs: 28 });
        const bar = V.h("div", {
          style: {
            position: "absolute",
            left: "62px",
            top: "19px",
            height: "6px",
            borderRadius: "3px",
            background: "var(--rose)",
          },
        });
        el.append(bar);
        const second = token(el, `E${b + 1}`, { x: 106, w: 62, h: 44, fs: 28 });
        legend.append(el);
        return { el, bar, first, second };
      });
      legend.append(legLbl);
      stage.append(legend);

      // two tags that take turns in the same place
      const tag = (cls, w, str, icon) => {
        const el = V.h(
          "div",
          {
            class: `v-tag ${cls}`,
            style: {
              left: `${(936 - w) / 2}px`,
              top: "501px",
              width: `${w}px`,
              height: "52px",
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            },
          },
          V.s("svg", { width: 34, height: 34, viewBox: "0 0 34 34" }, icon),
          V.h("span", { text: str }),
        );
        stage.append(el);
        return el;
      };
      const tagA = tag(
        "c-green",
        640,
        "any string of numbers is a timetable",
        L5.tick(17, 17, 26, "green", { ink: true, w: 5 }),
      );
      const tagB = tag(
        "c-red",
        540,
        "fitness punishes it: penalty",
        L5.arrow(17, 4, 17, 30, "red", 1, { ink: true, w: 5, head: 13 }),
      );

      return (t) => {
        const blueK = ramp(t, T.spot + 0.1, T.spot + 0.25, E.lin); // the changing exam turns blue
        const redK = ramp(t, T.clash, T.clash + 0.12, E.lin); // the two clashing exams turn red
        const spotBump = 1 + 0.1 * flash(t, T.spot + 0.1, T.spot + 0.6);
        const clashBump = 1 + 0.08 * flash(t, T.clash, T.clash + 0.5);
        const isBad = (i) => BAD.includes(i);

        // labels and genes
        const hp = ramp(t, 0.35, 0.8, E.lin);
        V.place(examHead, { o: hp });
        V.place(geneHead, { o: hp });
        examLbl.forEach((e, i) => {
          const p = ramp(t, T.tile + 0.1 * i, T.tile + 0.1 * i + 0.4, E.lin);
          V.place(e, { y: (1 - E.out(p)) * 8, o: p });
          e.style.color =
            isBad(i) && redK > 0.5 ? "var(--rose-ink)" : i === MUT.gene && blueK > 0.5 ? "var(--blue-ink)" : "";
        });
        const tileBase = (i) => {
          const p = ramp(t, T.tile + 0.1 * i, T.tile + 0.1 * i + 0.45, E.lin);
          return { s: E.pop(p), y: -(1 - E.out(p)) * 20, o: clamp(p * 4) };
        };
        row.all((i) => {
          const b = tileBase(i);
          return isBad(i) ? { ...b, s: b.s * clashBump, tone: redK > 0.5 ? "red" : "grey" } : b;
        });
        const mb = tileBase(MUT.gene);
        row.flip(MUT.gene, ramp(t, T.flip[0], T.flip[1], E.lin), {
          ...mb,
          s: mb.s * spotBump * clashBump,
          from: String(START[MUT.gene]),
          to: String(AFTER[MUT.gene]),
          tone: blueK > 0.01 ? "blue" : "grey",
          toTone: redK > 0.5 ? "red" : "blue",
          hop: 14,
        });
        const ringIn = ramp(t, T.spot, T.spot + 0.4, E.back);
        V.place(ring, { s: 0.85 + 0.15 * ringIn, o: Math.min(1, ringIn * 3) * (1 - ramp(t, 6.0, 6.3, E.lin)) });

        // slot boxes
        boxes.forEach(({ el, red }, i) => {
          const p = ramp(t, T.box + 0.06 * i, T.box + 0.06 * i + 0.4, E.lin);
          V.place(el, { y: (1 - E.out(p)) * 16, s: 0.92 + 0.08 * E.out(p), o: clamp(p * 4) });
          V.show(red, i + 1 === BAD_SLOT ? redK : 0);
        });

        // gene lines and exam tokens
        const sweep = ramp(t, T.sweep[0], T.sweep[1], E.inOut);
        const move = ramp(t, T.move[0], T.move[1], E.lin);
        START.forEach((slot, i) => {
          const mut = i === MUT.gene;
          const ls = T.line + T.lineStep * i;
          const k = ramp(t, ls, ls + T.lineDur, E.inOut);
          const ex = mut ? lerp(colX(slot), colX(AFTER[i]), sweep) : colX(slot);
          const d = curve(row.mid(i).x, LINE_Y, ex, BOX.y);
          const weight = [1, mut ? blueK : 0, isBad(i) ? redK : 0];
          layers.forEach((layer, li) => {
            const { line, dot } = layer[i];
            attr(line, "d", d);
            // dashed only while it draws on; a finished line is an ordinary solid stroke
            line.style.strokeDasharray = k < 0.999 ? "1 1" : "none";
            line.style.strokeDashoffset = k < 0.999 ? String(1 - k) : "0";
            V.show(line, k > 0.002 ? weight[li] : 0);
            attr(dot, "cx", f1(ex));
            attr(dot, "cy", BOX.y);
            V.show(dot, ramp(k, 0.85, 1, E.lin) * weight[li]);
          });

          const p = ramp(t, ls + T.tokLag, ls + T.tokLag + 0.4, E.lin);
          const home = tokPos(slot, rowOf(START, i));
          const dest = tokPos(AFTER[i], rowOf(AFTER, i));
          const lift = mut ? Math.sin(Math.PI * move) : 0;
          const x = mut ? lerp(home.x, dest.x, E.inOut(move)) : home.x;
          const y = mut ? lerp(home.y, dest.y, E.out(clamp(move / 0.5))) : home.y;
          V.place(toks[i].el, {
            x,
            y: y - 10 * lift - 32 * (1 - E.out(p)),
            s: E.pop(p) * (1 + 0.08 * lift) * (mut ? spotBump : 1) * (isBad(i) ? clashBump : 1),
            o: clamp(p * 4),
          });
          toks[i].tint(mut ? blueK : 0, isBad(i) ? redK : 0);
        });

        // clash mark inside the slot
        const lk = ramp(t, T.clash + 0.1, T.clash + 0.4, E.lin);
        attr(link, "y2", f1(lerp(ly1, ly2, lk)));
        V.show(link, lk);
        const bk = ramp(t, T.clash + 0.25, T.clash + 0.65, E.lin);
        V.place(badgeG, { s: E.pop(bk), o: clamp(bk * 4) });
        L5.drawOn(crossG, ramp(bk, 0.3, 1, E.lin));

        // legend
        const lg = ramp(t, T.legend, T.legend + 0.4, E.lin);
        V.place(legLbl, { y: (1 - E.out(lg)) * 8, o: lg });
        pairs.forEach((pr, j) => {
          const p = ramp(t, T.legend + 0.15 + 0.15 * j, T.legend + 0.55 + 0.15 * j, E.lin);
          V.place(pr.el, {
            y: (1 - E.out(p)) * 10,
            s: (0.8 + 0.2 * E.pop(p)) * (j === BAD_PAIR ? clashBump : 1),
            o: clamp(p * 4),
          });
          pr.bar.style.width = `${44 * ramp(p, 0.4, 1, E.out)}px`;
          const bad = j === BAD_PAIR ? redK : 0;
          pr.first.tint(0, bad);
          pr.second.tint(0, bad);
        });

        // tags
        const inA = ramp(t, T.tagA[0], T.tagA[0] + 0.4, E.lin);
        V.place(tagA, {
          y: (1 - E.out(inA)) * 10,
          s: 0.9 + 0.1 * E.pop(inA),
          o: inA * (1 - ramp(t, T.tagA[1], T.tagA[1] + 0.3, E.lin)),
        });
        const inB = ramp(t, T.tagB, T.tagB + 0.4, E.lin);
        V.place(tagB, { y: (1 - E.out(inB)) * 10, s: 0.9 + 0.1 * E.pop(inB), o: inB });
      };
    },
  });
})();
