/* Lecture 5 · Encodings, scene 08-indirect: indirect encoding of the exam timetable (same six exams, eight slots and clash pairs
   as scene 07). Gene i is an INSTRUCTION: "take the k-th clash-free slot for exam i". A decoder machine runs the exams in order;
   for each one it lights the slots that do not clash with exams already placed (green), blocks the others (grey + red cross), a
   pin counts 1, 2, 3 over the free slots up to k and the exam drops out of the machine into that slot. The result never clashes.
   Then ONE early gene changes: the exams it affects are picked up (a dashed ghost marks where each stood) and the decoder places
   them again in order, so several exams jump to other slots (orange, with a count). Everything shown comes from decode() below.
   Story (local seconds): 0.2 genes, 0.4 decoder, 0.5 slots, 0.7 clash pairs, 1.0-5.9 pass 1 (one step per exam), 5.95 "no clash",
   6.5 spotlight on gene 1, 6.7 it flips, 7.0 the affected exams lift out, 7.3-9.4 pass 2, 9.45 "N exams moved".
   Roles: green = free slot / no clash, blue = the gene and exam being decoded, red = blocked slot and its clashing exam,
   orange = an exam that moved, purple = the decoder. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const lin = E.lin;

  // ---------- the model: a real decoder, no typed-in results ----------
  const SLOTS = 8;
  const CLASH = [
    [0, 1], // E1-E2
    [1, 2], // E2-E3
    [3, 4], // E4-E5
  ];
  const GENES = [1, 2, 2, 4, 4, 1]; // gene i = "take the k-th clash-free slot for exam i"
  const CHANGE = { i: 0, k: 6 }; // one early gene changes
  const NEW_GENES = GENES.map((k, i) => (i === CHANGE.i ? CHANGE.k : k));

  function decode(genes) {
    const slots = [];
    const steps = genes.map((k, i) => {
      const partners = CLASH.filter(([, b]) => b === i).map(([a]) => a); // placed earlier, must not share a slot
      const blocked = partners.map((j) => slots[j]);
      const free = Array.from({ length: SLOTS }, (_, s) => s + 1).filter((s) => !blocked.includes(s));
      slots.push(free[k - 1]);
      return { i, k, partners, blocked, free, slot: free[k - 1] };
    });
    return { slots, steps };
  }
  const P1 = decode(GENES);
  const P2 = decode(NEW_GENES);
  const MOVED = GENES.map((_, i) => i).filter((i) => P1.slots[i] !== P2.slots[i]);
  const clashFree = (s) => CLASH.every(([a, b]) => s[a] !== s[b]);
  if (![...P1.slots, ...P2.slots].every(Boolean) || !clashFree(P1.slots) || !clashFree(P2.slots))
    throw new Error("indirect scene: the decoder must give a clash-free timetable both times");
  if (MOVED.filter((i) => i !== CHANGE.i).length < 2)
    throw new Error("indirect scene: the changed gene must move at least two other exams");

  // exams that ever stand (or leave a ghost) in the same slot get different rows inside the box
  const slotsOf = (i) => [P1.slots[i], P2.slots[i]];
  const ROW = [];
  GENES.forEach((_, i) => {
    const used = ROW.filter((_, j) => slotsOf(i).some((s) => slotsOf(j).includes(s)));
    ROW[i] = used.includes(0) ? 1 : 0;
    if (used.includes(0) && used.includes(1)) throw new Error("indirect scene: three exams share a slot");
  });
  const ord = (k) => `${k}${["th", "st", "nd", "rd"][k % 10 < 4 && ![11, 12, 13].includes(k % 100) ? k % 10 : 0]}`;

  // ---------- geometry (stage px) ----------
  const BOX = { w: 104, h: 152, pitch: 110, left: 31, y: 362 };
  const TOK = { w: 76, h: 42 };
  const GENE = { x: 169, y: 48, size: 84, gap: 14 };
  const DEC = { x: 150, y: 184, w: 636, h: 72 };
  const PIN_Y = 312; // the pins and block crosses sit here, above the boxes (the result tags sit in the same band later)
  const TAG_Y = 278;
  const PORT = { x: DEC.x + DEC.w / 2 - TOK.w / 2, hidden: 196, out: 276 };
  const LINE_Y = [GENE.y + GENE.size + 10, DEC.y - 3]; // the chute from a gene into the decoder
  const colX = (slot) => BOX.left + BOX.w / 2 + (slot - 1) * BOX.pitch;
  const tokPos = (slot, row) => ({ x: colX(slot) - TOK.w / 2, y: BOX.y + 12 + row * 48 });
  const pos1 = GENES.map((_, i) => tokPos(P1.slots[i], ROW[i]));
  const pos2 = GENES.map((_, i) => tokPos(P2.slots[i], ROW[i]));
  const f1 = (n) => n.toFixed(1);

  // ---------- timeline ----------
  const T = {
    tile: 0.2,
    dec: 0.4,
    box: 0.5,
    legend: 0.7,
    p1: [
      [1.0, 1.9],
      [1.9, 3.0],
      [3.0, 3.9],
      [3.9, 4.55],
      [4.55, 5.4],
      [5.4, 5.9],
    ],
    tick: 5.95,
    ring: 6.5,
    flip: [6.7, 7.15],
    lift: 7.0, // mover j lifts out at lift + 0.1 j and takes 0.3 s
    p2: [
      [7.3, 8.15],
      [8.15, 8.75],
      [8.75, 9.4],
    ],
    tag: 9.45,
  };

  if (T.p2.length !== Math.max(...MOVED) + 1)
    throw new Error("indirect scene: pass 2 needs one step per exam up to the last mover");
  // inside a step (fractions of its length): dot rides the chute, pins count, the picked slot lands, the exam leaves the machine
  const U = { dot: 0.16, count: [0.14, 0.62], land: [0.62, 0.74], out: [0.66, 0.96], end: 0.92 };
  const STEPS = [
    ...T.p1.map(([a, b], i) => ({ pass: 1, i, a, b, d: P1.steps[i] })),
    ...T.p2.map(([a, b], i) => ({ pass: 2, i, a, b, d: P2.steps[i] })),
  ];
  const stepOf = (pass, i) => STEPS.find((s) => s.pass === pass && s.i === i);
  const dropOf = (st) => [st.a + U.out[0] * (st.b - st.a), st.a + U.out[1] * (st.b - st.a)];
  const liftA = (i) => T.lift + 0.1 * i;

  // a token leaves the machine (p 0 -> 1: hidden behind it -> sitting in its slot); 1 -> 0 is the way back
  function flight(p, dest) {
    const a = clamp(p / 0.3);
    const b = clamp((p - 0.3) / 0.7);
    if (b <= 0) return { x: PORT.x, y: lerp(PORT.hidden, PORT.out, E.out(a)) };
    return {
      x: lerp(PORT.x, dest.x, E.inOut(b)),
      y: lerp(PORT.out, dest.y, E.inOut(b)) - 22 * Math.sin(Math.PI * b),
    };
  }

  // ---------- small builders (static styles are CSS strings; frames only call V.place / V.show / setAttribute) ----------
  const px = (v) => (typeof v === "number" ? `${v}px` : v);
  const at = (x, y, w, h) => `position:absolute;left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)};`;
  const FLEX = "display:flex;align-items:center;justify-content:center;";
  const setText = (el, str) => {
    if (el.textContent !== str) el.textContent = str;
  };
  const disc = (r, w, fill, edge) => V.s("circle", { r, "stroke-width": w, style: { fill, stroke: edge } });
  const numText = (str, fill) =>
    V.s("text", {
      dy: ".36em",
      "text-anchor": "middle",
      style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "28px", fill },
      text: str,
    });
  const gearPath = () => {
    const pts = [];
    for (let i = 0; i < 8; i++)
      [-0.42, -0.24, 0.24, 0.42].forEach((da, j) => {
        const [a, r] = [(i * Math.PI) / 4 + da, j % 3 ? 28 : 20];
        pts.push(`${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`);
      });
    return `M ${pts.join(" L ")} Z`;
  };

  // a sticker with a neutral face and coloured faces on top (tint({blue, orange, red}) cross-fades them)
  function token(parent, text, { x = 0, y = 0, w, h }) {
    const box = V.h("div", { style: at(x, y, w, h) });
    const face = (bg, edge, ink) =>
      V.h("div", {
        text,
        style: `${at(0, 0, "100%", "100%")}box-sizing:border-box;border:3px solid ${edge};border-radius:14px;background:${bg};box-shadow:0 5px 0 ${edge};color:${ink};font-size:28px;font-weight:900;line-height:1;${FLEX}`,
      });
    const faces = [
      ["blue", face("var(--blue)", "var(--blue-lip)", "var(--blue-on)")],
      ["orange", face("var(--amber)", "var(--amber-lip)", "var(--amber-on)")],
      ["red", face("var(--rose)", "var(--rose-lip)", "var(--rose-on)")],
    ];
    box.append(face("var(--panel)", "var(--line-2)", "var(--ink)"), ...faces.map((f) => f[1]));
    parent.append(box);
    return { el: box, tint: (k) => faces.forEach(([name, e]) => V.show(e, k[name] || 0)) };
  }
  const text = (str, x, y, w, size, align = "center") =>
    V.h("div", {
      class: "v-text dim",
      text: str,
      style: `left:${x}px;top:${y}px;width:${w}px;text-align:${align};font-size:${size}px;`,
    });

  V.scene({
    kicker: "INDIRECT ENCODING",
    title: ["Indirect: the genes", "are instructions"],
    dur: 11,
    caps: [
      [0.4, 3.5, "Indirect: each gene is an instruction for a decoder."],
      [4, 7, "The decoder never creates a clash."],
      [7.5, 10.5, "But one early gene can move many exams."],
    ],
    build(stage) {
      // ----- genes, with the exam each one belongs to written above it
      const row = L5.chromosome(stage, { ...GENE, genes: GENES.map(String), tone: "grey" });
      const examHead = text("exam", 0, 10, 150, 28, "right");
      const geneHead = text("gene", 0, GENE.y + 26, 150, 28, "right");
      const examLbl = GENES.map((_, i) => text(`E${i + 1}`, row.left + row.pos(i), 10, row.size, 30));
      stage.append(examHead, geneHead, ...examLbl);

      // ----- the eight slot boxes: neutral, blocked (grey), free (green) and picked (green, strong) faces
      const boxes = Array.from({ length: SLOTS }, (_, i) => {
        const el = V.h("div", { style: at(BOX.left + i * BOX.pitch, BOX.y, BOX.w, BOX.h) });
        const face = (bg, edge, ink, lip = edge) => {
          const label = V.h("div", {
            text: `slot ${i + 1}`,
            style: `position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:28px;font-weight:800;line-height:34px;color:${ink};`,
          });
          const style = `${at(0, 0, "100%", "100%")}box-sizing:border-box;border:3px solid ${edge};border-radius:22px;background:${bg};box-shadow:0 5px 0 ${lip};`;
          return V.h("div", { style }, label);
        };
        const faces = [
          face("var(--panel-2)", "var(--line-2)", "var(--text-dim)"),
          face("var(--line)", "var(--line-2)", "var(--text-faint)"),
          face("var(--teal-dim)", "var(--teal-edge)", "var(--teal-ink)"),
          face("var(--teal-dim)", "var(--teal)", "var(--teal-ink)", "var(--teal-lip)"),
        ];
        el.append(...faces);
        stage.append(el);
        return { el, faces };
      });

      // ----- the clash pairs (as in scene 07), lit red while one of them blocks a slot
      const legend = V.h("div", { style: at(0, 576, 936, 44) });
      const legLbl = V.h("div", {
        text: "can't share a slot",
        style: `${at(0, 0, 300, 44)}text-align:right;font-size:28px;font-weight:800;line-height:44px;color:var(--text-dim);`,
      });
      const pairs = CLASH.map(([a, b], j) => {
        const el = V.h("div", { style: at(326 + 204 * j, 0, 168, 44) });
        const first = token(el, `E${a + 1}`, { w: 62, h: 42 });
        const bar = V.h("div", {
          style: "position:absolute;left:62px;top:19px;height:6px;border-radius:3px;background:var(--rose);",
        });
        el.append(bar);
        const second = token(el, `E${b + 1}`, { x: 106, w: 62, h: 42 });
        legend.append(el);
        return { el, bar, first, second };
      });
      legend.append(legLbl);
      stage.append(legend);

      // ----- counting pins (solid = the latest count, dim = earlier counts) and block crosses, one set per slot
      const pinSvg = L5.svg(stage);
      const pins = Array.from({ length: SLOTS }, (_, i) => {
        const [solidNum, dimNum] = [numText("1", "var(--blue-on)"), numText("1", "var(--blue-ink)")];
        const tip = V.s("path", {
          d: "M -9 17 L 0 31 L 9 17 Z",
          "stroke-width": 3,
          "stroke-linejoin": "round",
          style: { fill: "var(--blue)", stroke: "var(--blue-lip)" },
        });
        const solid = V.s("g", {}, tip, disc(21, 4, "var(--blue)", "var(--blue-lip)"), solidNum);
        const dim = V.s("g", {}, disc(19, 3, "var(--blue-dim)", "var(--blue-edge)"), dimNum);
        const crossG = L5.cross(0, 0, 30, "red", { ink: true, w: 5 });
        const cross = V.s("g", {}, disc(21, 4, "var(--panel)", "var(--rose-lip)"), crossG);
        // the wrapper holds the position, so V.place can move and scale the inner groups from there
        const wrap = (g) => V.s("g", { transform: `translate(${f1(colX(i + 1))} ${PIN_Y})` }, g);
        pinSvg.append(...[dim, solid, cross].map(wrap));
        return { solid, dim, cross, crossG, solidNum, dimNum };
      });

      // ----- ghosts (where a moved exam used to stand), then the exam tokens
      const ghosts = MOVED.map((i) => {
        const el = V.h("div", {
          text: `E${i + 1}`,
          style: `${at(0, 0, TOK.w, TOK.h)}box-sizing:border-box;border:3px dashed var(--amber);border-radius:14px;color:var(--amber-ink);font-size:28px;font-weight:900;line-height:36px;text-align:center;`,
        });
        stage.append(el);
        return { i, el };
      });
      const toks = GENES.map((_, i) => token(stage, `E${i + 1}`, { w: TOK.w, h: TOK.h }));

      // ----- the decoder machine (purple): gear, label, readout and a dark output slot the exams come out of
      const dec = V.h("div", { class: "v-card c-purple", style: at(DEC.x, DEC.y, DEC.w, DEC.h) });
      const gearShape = {
        "stroke-width": 3,
        "stroke-linejoin": "round",
        style: { fill: "var(--violet)", stroke: "var(--violet-lip)" },
      };
      const gear = V.s(
        "g",
        {},
        V.s("path", { d: gearPath(), ...gearShape }),
        disc(8, 3, "var(--violet-dim)", "var(--violet-lip)"),
      );
      const gearBox = V.s(
        "svg",
        {
          width: 64,
          height: 64,
          viewBox: "-32 -32 64 64",
          style: { position: "absolute", left: "18px", top: "2px", overflow: "visible" },
        },
        gear,
      );
      const line = `line-height:${DEC.h - 6}px;font-weight:900;color:var(--violet-ink);`;
      const decLabel = V.h("div", {
        text: "decoder",
        style: `position:absolute;left:96px;top:0;font-size:40px;${line}`,
      });
      const readout = V.h("div", {
        style: `position:absolute;right:26px;top:0;font-size:32px;white-space:nowrap;${line}`,
      });
      dec.append(gearBox, decLabel, readout);
      const port = V.h("div", {
        style: `${at(DEC.x + DEC.w / 2 - 40, DEC.y + DEC.h - 8, 80, 16)}box-sizing:border-box;border:3px solid var(--violet-lip);border-radius:9px;background:var(--violet-on);`,
      });
      stage.append(dec, port);

      // ----- chutes: a line from every gene into the decoder (blue for the gene being decoded) and a dot that rides it
      const chuteSvg = L5.svg(stage);
      const gx = (i) => row.mid(i).x;
      const chutes = GENES.map((_, i) => {
        const grey = L5.arrow(gx(i), LINE_Y[0], gx(i), LINE_Y[1], "grey", 1, { w: 5, head: 16 });
        const blue = L5.arrow(gx(i), LINE_Y[0], gx(i), LINE_Y[1], "blue", 1, { w: 6, head: 18 });
        const dot = disc(12, 4, "var(--blue)", "var(--blue-lip)");
        dot.setAttribute("cx", gx(i));
        chuteSvg.append(grey, blue, dot);
        return { grey, blue, dot };
      });

      // ----- spotlight ring round the gene that changes
      const pad = 8;
      const ring = V.h("div", {
        style: `${at(row.left + row.pos(CHANGE.i) - pad, row.top - pad, row.size + 2 * pad, row.size + 6 + 2 * pad)}box-sizing:border-box;border:6px solid var(--blue);border-radius:30px;`,
      });
      stage.append(ring);

      // ----- the two result tags: "no clash" (green) and "N exams moved" (orange), side by side at the end
      const clear = L5.badge(stage, { x: 0, y: TAG_Y, w: 290, h: 58, valid: "no clash" });
      const moved = V.h("div", {
        class: "v-tag solid c-orange",
        text: `${MOVED.length} exams moved`,
        style: `${at(463, TAG_Y, 330, 58)}padding:0;${FLEX}font-size:34px;box-shadow:0 5px 0 var(--c-lip);`,
      });
      stage.append(moved);

      // ============ one frame, a pure function of t ============
      return (t) => {
        // ----- what the decoder is doing now: lit slots, blocked slots, pins, readout
        const [lit, blk, pick] = [0, 1, 2].map(() => Array(SLOTS + 1).fill(0));
        const redTok = Array(GENES.length).fill(0);
        const redPair = Array(CLASH.length).fill(0);
        const pinState = Array.from({ length: SLOTS }, () => ({ solid: 0, dim: 0, cross: 0, n: 1, bump: 0, p: 0 }));
        let act = null;
        let spin = 0;
        STEPS.forEach((st) => {
          const dur = st.b - st.a;
          spin += Math.max(0, Math.min(dur, t - st.a));
          const u = (t - st.a) / dur;
          if (u < 0 || u >= 1) return;
          act = { st, u };
          const { d } = st;
          const out = 1 - ramp(u, U.end, 1, lin);
          const e = ramp(u, 0.02, 0.14, lin) * out;
          const landed = ramp(u, U.land[0], U.land[1], lin);
          d.free.forEach((s) => (lit[s] = Math.max(lit[s], e * (s === d.slot ? 1 : 1 - landed))));
          d.blocked.forEach((s) => ((blk[s] = Math.max(blk[s], e)), (pinState[s - 1].cross = e)));
          pick[d.slot] = Math.max(pick[d.slot], landed * out);
          d.partners.forEach((j) => {
            redTok[j] = Math.max(redTok[j], e);
            redPair[CLASH.findIndex(([a, b]) => a === j && b === d.i)] = e;
          });
          // pins: the j-th free slot gets the number j + 1, one after the other
          const c0 = st.a + U.count[0] * dur;
          const w = ((U.count[1] - U.count[0]) * dur) / d.k;
          d.free.slice(0, d.k).forEach((s, j) => {
            const start = c0 + j * w;
            const last = j === d.k - 1;
            const cur = last ? 1 : 1 - ramp(t, start + w, start + w + 0.08, lin);
            Object.assign(pinState[s - 1], {
              n: j + 1,
              p: ramp(t, start, start + 0.18, lin),
              solid: cur * out,
              dim: (1 - cur) * (1 - landed) * out,
              bump: last ? flash(u, U.land[0], U.land[1] + 0.1) : 0,
            });
          });
        });

        // ----- genes and their labels
        const hp = ramp(t, T.tile, T.tile + 0.45, lin);
        V.place(examHead, { o: hp });
        V.place(geneHead, { o: hp });
        const tileBase = (i) => {
          const p = ramp(t, T.tile + 0.07 * i, T.tile + 0.07 * i + 0.45, lin);
          return { s: E.pop(p), y: -(1 - E.out(p)) * 20, o: clamp(p * 4) };
        };
        const geneState = (i) => {
          const on = act && act.st.i === i;
          const b = tileBase(i);
          const bump = on ? 1 + 0.1 * flash(act.u, 0, 0.3) : 1;
          const blue = on || (i === CHANGE.i && t >= T.ring + 0.1);
          return { ...b, s: b.s * bump, tone: blue ? "blue" : "grey", solid: !!on };
        };
        row.all(geneState);
        const g0 = geneState(CHANGE.i);
        const flipK = ramp(t, T.flip[0], T.flip[1], lin);
        row.flip(CHANGE.i, flipK, {
          ...g0,
          from: String(GENES[CHANGE.i]),
          to: String(CHANGE.k),
          toTone: g0.tone,
          hop: 12,
        });
        examLbl.forEach((e, i) => {
          const p = ramp(t, T.tile + 0.07 * i, T.tile + 0.07 * i + 0.4, lin);
          V.place(e, { y: (1 - E.out(p)) * -10, o: p });
          const mover = MOVED.includes(i) && t >= liftA(i);
          e.style.color = mover ? "var(--amber-ink)" : act && act.st.i === i ? "var(--blue-ink)" : "";
        });
        const ringIn = ramp(t, T.ring, T.ring + 0.4, E.back);
        V.place(ring, {
          s: 0.85 + 0.15 * ringIn,
          o: Math.min(1, ringIn * 3) * (1 - ramp(t, T.flip[1], T.flip[1] + 0.3, lin)),
        });

        // ----- decoder, readout, chutes
        const dp = ramp(t, T.dec, T.dec + 0.5, lin);
        const press = act ? 0.016 * flash(act.u, 0.1, 0.3) : 0;
        V.place(dec, { y: (1 - E.out(dp)) * 14, s: (0.92 + 0.08 * E.pop(dp)) * (1 + press), o: clamp(dp * 4) });
        V.place(port, { y: (1 - E.out(dp)) * 14, o: clamp(dp * 4) });
        V.place(gear, { r: 24 * t + 140 * spin });
        setText(readout, act ? `E${act.st.i + 1}: ${ord(act.st.d.k)} free slot` : "");
        V.place(readout, { o: act ? ramp(act.u, 0.1, 0.2, lin) * (1 - ramp(act.u, 0.9, 0.98, lin)) : 0 });
        const cp = ramp(t, T.dec + 0.3, T.dec + 0.7, lin);
        chutes.forEach(({ grey, blue, dot }, i) => {
          const u = act && act.st.i === i ? act.u : -1;
          V.show(grey, cp);
          V.show(blue, u < 0 ? 0 : ramp(u, 0, 0.1, lin) * (1 - ramp(u, 0.9, 0.98, lin)));
          dot.setAttribute("cy", f1(lerp(LINE_Y[0], LINE_Y[1], ramp(u, 0, U.dot, E.inOut))));
          V.show(dot, u < 0 ? 0 : clamp(u * 12) * (1 - ramp(u, U.dot, U.dot + 0.06, lin)));
        });

        // ----- slot boxes and pins
        boxes.forEach(({ el, faces }, i) => {
          const p = ramp(t, T.box + 0.04 * i, T.box + 0.04 * i + 0.4, lin);
          V.place(el, { y: (1 - E.out(p)) * 16, s: 0.92 + 0.08 * E.out(p), o: clamp(p * 4) });
          [blk, lit, pick].forEach((arr, k) => V.show(faces[k + 1], arr[i + 1]));
        });
        pins.forEach((pin, i) => {
          const ps = pinState[i];
          const pop = E.pop(ps.p);
          setText(pin.solidNum, String(ps.n));
          setText(pin.dimNum, String(ps.n));
          V.place(pin.solid, {
            y: -(1 - E.out(ps.p)) * 14,
            s: pop * (1 + 0.14 * ps.bump),
            o: ps.solid * clamp(ps.p * 4),
          });
          V.place(pin.dim, { s: 0.85 + 0.15 * pop, o: ps.dim });
          const ck = ramp(ps.cross, 0.2, 1, E.out);
          V.place(pin.cross, { s: E.pop(ck), o: ps.cross });
          L5.drawOn(pin.crossG, ramp(ck, 0.3, 1, lin));
        });

        // ----- exam tokens (and the ghosts of the ones that move)
        toks.forEach((tk, i) => {
          const out1 = dropOf(stepOf(1, i));
          let [p, dest, leaving] = [ramp(t, out1[0], out1[1], lin), pos1[i], false];
          let blue = t >= out1[0] ? 1 - ramp(t, out1[1], out1[1] + 0.3, lin) : 0;
          let orange = 0;
          if (MOVED.includes(i)) {
            const lp = ramp(t, liftA(i), liftA(i) + 0.3, lin);
            const out2 = dropOf(stepOf(2, i));
            if (lp > 0) [p, dest, leaving, blue] = [1 - lp, pos1[i], true, 0];
            if (t >= out2[0]) [p, dest, leaving] = [ramp(t, out2[0], out2[1], lin), pos2[i], false];
            orange = ramp(t, liftA(i), liftA(i) + 0.2, lin);
          }
          const { x, y } = flight(p, dest);
          const land = p >= 0.999 || leaving ? 0 : flash(p, 0.8, 1);
          V.place(tk.el, { x, y, s: 1 + 0.12 * land, o: p > 0.001 ? 1 : 0 });
          tk.tint({ blue, orange, red: redTok[i] });
        });
        ghosts.forEach(({ i, el }) => {
          const k = ramp(t, liftA(i) + 0.1, liftA(i) + 0.3, lin);
          V.place(el, { x: pos1[i].x, y: pos1[i].y, s: 0.9 + 0.1 * k, o: k });
        });

        // ----- legend
        const lg = ramp(t, T.legend, T.legend + 0.4, lin);
        V.place(legLbl, { y: (1 - E.out(lg)) * 8, o: lg });
        pairs.forEach((pr, j) => {
          const p = ramp(t, T.legend + 0.15 + 0.15 * j, T.legend + 0.55 + 0.15 * j, lin);
          V.place(pr.el, {
            y: (1 - E.out(p)) * 10,
            s: (0.8 + 0.2 * E.pop(p)) * (1 + 0.06 * redPair[j]),
            o: clamp(p * 4),
          });
          pr.bar.style.width = `${44 * ramp(p, 0.4, 1, E.out)}px`;
          [pr.first, pr.second].forEach((tk) => tk.tint({ red: redPair[j] }));
        });

        // ----- result tags: "no clash" alone after pass 1, again beside "N exams moved" after pass 2
        const second = t >= T.lift;
        clear.el.style.left = `${second ? 143 : 323}px`;
        clear("valid", ramp(t, second ? T.tag : T.tick, (second ? T.tag : T.tick) + 0.4, lin));
        const gone = second ? 1 : 1 - ramp(t, T.flip[0] + 0.05, T.flip[0] + 0.3, lin);
        if (gone < 1) V.show(clear.el, gone);
        const mk = ramp(t, T.tag + 0.1, T.tag + 0.5, lin);
        V.place(moved, { y: (1 - E.out(mk)) * 10, s: 0.8 + 0.2 * E.pop(mk), o: clamp(mk * 4) });
      };
    },
  });
})();
