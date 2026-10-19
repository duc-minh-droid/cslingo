/* Phase 6 · Error Detection & Correction (algo-6), scene 11-recap: three rows, each a small animated pictogram and one bold line.
   Bare scene. Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   6.8 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is done at about
   5.5, row 2 at 6.4 and row 3 at 6.6, so for the last two seconds only Byte's bob moves.
   Row 1 (orange): two frames, each with its check bits in orange: a parity frame (data 1011 + parity bit 1) and the CRC frame
          (1011 + remainder 100). A bit flips in the first (a red tile, a red cross), then in the second: both flips are caught.
   Row 2 (purple): the words 000, 010, 011, 111 as markers on a line, the ends solid green (valid words), three purple arrows (one flip
          each) between them and the label "3 apart". The second marker turns red (the noisy word 010); a green arrow curves from it back
          to the first marker (000) while a red token hops along it and turns green: a green tick over 000. The finished picture keeps
          the red word, the green repair arrow and the tick.
   Row 3 (green): the three checks p4 p2 p1 as discs 1 1 0 (red = failed, green = passed), an equals sign and the orange disc 6.
   Every bit, remainder and syndrome comes from A6.CRC / A6.CODE / A6.HAM and is asserted when the scene is built. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const { f1 } = A6;

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 6.8;
  const pop = (k) => ({ s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4), y: -(1 - E.out(k)) * 14 });

  // a symbol drawn on with a little pop: g was made by L5.tick / L5.cross at absolute coordinates
  const stamp = (g, k) => {
    L5.drawOn(g, V.ramp(k, 0.15, 1, E.lin));
    V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
  };

  // ---------- row 1: check bits catch a flip (parity, then the CRC) ----------
  function catchRow(pic) {
    const { msg, gen, frame } = A6.CRC;
    const parity = msg + A6.parityOf(msg);
    const HIT = 1;
    A6.same("recap row 1: parity frame", [parity, A6.ones(parity) % 2], ["10111", 0]);
    A6.same("recap row 1: parity frame after one flip", A6.ones(A6.flipAt(parity, HIT)) % 2, 1);
    A6.same("recap row 1: the CRC frame divides cleanly", A6.polyMod(frame, gen), "000");
    if (A6.polyMod(A6.flipAt(frame, HIT), gen) === "000") throw new Error("recap row 1: the CRC missed a single flip");
    A6.same("recap row 1: the flipped bit is a 0 that becomes a 1", [parity[HIT], frame[HIT]], ["0", "0"]);

    const [SIZE, GAP, Y1, Y2, CX] = [38, 4, 16, 86, 326];
    const strip = (bits, y, checks) =>
      A6.bits(pic, {
        x: 4,
        y,
        bits,
        size: SIZE,
        gap: GAP,
        fs: 28,
        tones: [...bits].map((_, i) => (i >= bits.length - checks ? "orange" : "grey")),
      });
    const rows = [strip(parity, Y1, 1), strip(frame, Y2, frame.length - msg.length)];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const crosses = [Y1, Y2].map((y) => svg.appendChild(L5.cross(CX, y + SIZE / 2, 36, "red", { w: 7 })));
    const T = { pop: [0.1, 0.55], flip: [1.6, 3.3], crossLag: 0.6 };

    return (q) => {
      rows.forEach((row, r) => {
        const t0 = r ? T.flip[1] : T.flip[0];
        const bump = 0.14 * flash(q, t0, t0 + 0.5);
        row.all((i) => pop(A6.seq(q, T.pop[r], 0.07, 0.45, i)));
        const st = pop(A6.seq(q, T.pop[r], 0.07, 0.45, HIT));
        row.flip(HIT, ramp(q, t0, t0 + 0.5, E.inOut), {
          ...st,
          s: st.s * (1 + bump),
          from: "0",
          to: "1",
          tone: "grey",
          toTone: "red",
          hop: 12,
        });
        stamp(crosses[r], ramp(q, t0 + T.crossLag, t0 + T.crossLag + 0.45, E.lin));
      });
    };
  }

  // ---------- row 2: far-apart valid words let a flipped word be repaired ----------
  function farRow(pic) {
    const { path, one } = A6.CODE;
    A6.same("recap row 2: the four words on the line", path, ["000", "010", "011", "111"]);
    A6.same(
      "recap row 2: one flip from 000 decodes back to 000",
      [one.recv, one.fix, A6.dist(one.recv, one.fix)],
      [path[1], path[0], 1],
    );
    const [Y, R] = [70, 18];
    const X = [40, 40 + 260 / 3, 40 + 520 / 3, 300];
    const valid = path.map((w) => A6.CODE.words.includes(w));

    const lineSvg = L5.svg(pic, PIC.w, PIC.h);
    const line = lineSvg.appendChild(
      V.s("path", {
        d: `M ${X[0]} ${Y} L ${X[3]} ${Y}`,
        fill: "none",
        "stroke-width": 6,
        "stroke-linecap": "round",
        style: { stroke: "var(--line-2)" },
      }),
    );
    // one purple arrow below the line for every flip between neighbouring words
    const steps = [0, 1, 2].map((i) =>
      lineSvg.appendChild(
        L5.arrow(X[i] + 10, Y + R + 8, X[i + 1] - 10, Y + R + 8, "purple", 1, { w: 5, head: 15, bow: -13 }),
      ),
    );
    const marks = path.map((_, i) => A6.token(pic, { tone: valid[i] ? "green" : "grey", size: 2 * R }));
    // how far apart the valid words are: three flips
    const label = V.h("div", {
      text: `${A6.CODE.d} apart`,
      style: {
        ...box(0, 112, PIC.w, 34),
        textAlign: "center",
        fontSize: "28px",
        fontWeight: "800",
        color: "var(--violet-ink)",
      },
    });
    pic.append(label);
    // the repair: a green arrow from the noisy word back to the nearest valid word (an arc above the line)
    const repair = lineSvg.appendChild(
      L5.arrow(X[1] - 6, Y - R - 4, X[0] + 10, Y - R - 4, "green", 1, { w: 6, head: 16, bow: 14 }),
    );
    const noisy = A6.token(pic, { tone: "red", size: 2 * R });
    const tickSvg = L5.svg(pic, PIC.w, PIC.h);
    const tick = tickSvg.appendChild(L5.tick(X[0], 20, 34, "green", { w: 7 }));
    const T = { pop: 0.1, steps: 0.9, label: [1.9, 2.2], noisy: 2.2, repair: [2.8, 3.3], hop: [3.0, 3.6], tick: 3.7 };

    return (q) => {
      V.show(line, ramp(q, 0, 0.3, E.lin));
      steps.forEach((g, i) => L5.drawOn(g, A6.seq(q, T.steps, 0.28, 0.4, i)));
      const e = ramp(q, T.hop[0], T.hop[1], E.inOut);
      marks.forEach((m, i) => {
        const k = A6.seq(q, T.pop, 0.1, 0.45, i);
        const land = i === 0 ? 0.2 * flash(q, T.hop[1] - 0.1, T.hop[1] + 0.3) : 0;
        const tone = i === 1 && q >= T.noisy ? "red" : valid[i] ? "green" : "grey"; // the noisy word stays red
        m.set({ x: X[i], y: Y, s: (0.5 + 0.5 * E.pop(k)) * (1 + land), o: Math.min(1, k * 4), tone });
      });
      const kl = ramp(q, ...T.label, E.lin);
      V.place(label, { y: (1 - kl) * 8, o: kl });
      L5.drawOn(repair, ramp(q, ...T.repair, E.lin));
      const born = ramp(q, T.noisy, T.noisy + 0.4, E.lin);
      noisy.set({
        x: lerp(X[1], X[0], e),
        y: Y - 30 * Math.sin(Math.PI * e),
        s: (0.4 + 0.6 * E.pop(born)) * (1 + 0.12 * (1 - e) + 0.1 * flash(q, T.hop[1] - 0.1, T.hop[1] + 0.3)),
        o: Math.min(1, born * 4),
        tone: e >= 0.6 ? "green" : "red",
      });
      stamp(tick, ramp(q, T.tick, T.tick + 0.45, E.lin));
    };
  }

  // ---------- row 3: the failed checks, read as binary, spell the position ----------
  function spellRow(pic) {
    const { syn, at } = A6.HAM.one;
    A6.same("recap row 3: the failed checks and the position", [syn, at, parseInt(syn, 2)], ["110", 6, 6]);
    const [Y, DX] = [86, [36, 96, 156]];
    const names = ["p4", "p2", "p1"];
    const labs = A6.labelRow(pic, { x: DX[0] - 24, y: 8, texts: names, size: 48, gap: 12, fs: 28 });
    const discs = [...syn].map((c, i) => {
      const d = A6.disc(pic, { x: DX[i], y: Y, size: 48, text: c, tone: c === "1" ? "red" : "green" });
      d.el.style.fontSize = "30px";
      return d;
    });
    const eqSvg = L5.svg(pic, PIC.w, PIC.h);
    const [EX, EW] = [214, 44];
    const eq = eqSvg.appendChild(
      V.s(
        "g",
        {},
        ...[-9, 9].map((dy) =>
          V.s("rect", {
            x: EX - EW / 2,
            y: Y + dy - 5,
            width: EW,
            height: 10,
            rx: 5,
            style: { fill: A6.tone("orange").c },
          }),
        ),
      ),
    );
    const num = A6.disc(pic, { x: 292, y: Y, size: 68, text: String(at), tone: "orange" });
    const T = { discs: 0.15, step: 0.5, eq: 1.9, num: 2.6 };

    return (q) => {
      discs.forEach((d, i) => {
        const k = A6.seq(q, T.discs, T.step, 0.4, i);
        d.set({ k });
        labs.set(i, { k, tone: "orange", bold: true });
      });
      const ke = ramp(q, T.eq, T.eq + 0.4, E.lin);
      V.place(eq, { s: 0.7 + 0.3 * E.pop(ke), o: Math.min(1, ke * 4) });
      num.set({ k: ramp(q, T.num, T.num + 0.6, E.lin) });
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
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["orange", "Check bits catch\nflips: parity, CRC", catchRow],
        ["purple", "Far-apart valid words\nlet us fix a flip", farRow],
        ["green", "Failed checks spell\nthe error position", spellRow],
      ].map(([tone, text, make], i) => {
        text.split("\n").forEach((line) => {
          if (line.length > 22) throw new Error(`recap: "${line}" is longer than 22 characters`);
        });
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
        text: "Next: Workshop 6.W",
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
          r.update(t - START[i]);
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
