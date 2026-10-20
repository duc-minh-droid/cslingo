/* Lecture 6 · Consistency and consensus, scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line.
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0 (each pictogram starts 0.4 s later), 6.8 the call to action.
   Row 1 (red): nodes A (35, green) and B (40, orange) pop, the link between them draws and is cut, a blue "35" leaves A and dies at the gap.
   Row 2 (purple): a write bar and a "read 0" and a "read 1" bar pop, the purple flip line drops between the two reads, a green tick.
   Row 3 (green): coordinator C and three databases pop, the votes light up one by one (yes, yes, no), then all three turn orange: abort.
   Every pictogram plays once and then holds its finished frame; only the mascot bob moves after about 6 s. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

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
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);

  // ---------- row 1: a cut network, a read at B is either refused or stale ----------
  function cutRow(pic) {
    const ans = D6.CAP.answer; // policy "stay available" with the link cut
    D6.same([ans.a, ans.b, ans.stale], [D6.CAP.latest, D6.CAP.start, true], "recap row 1: the cut answer");
    const link = D6.link(pic, { a: { x: 116, y: 70 }, b: { x: 224, y: 70 }, w: 8, gap: 44 });
    const mk = (name, x) => D6.box(pic, { x, y: 14, w: 110, h: 112, name, tone: "grey", vfs: 36 });
    const [A, B] = [mk("A", 6), mk("B", 224)];
    const pk = D6.packet(pic, { tone: "blue", text: String(ans.a) });
    return (t) => {
      const q = t - START[0];
      const pop = (i) => ramp(q, 0.1 + 0.15 * i, 0.6 + 0.15 * i, E.lin);
      A.set({ value: ans.a, tone: "green", k: pop(0) });
      B.set({ value: ans.b, tone: "orange", k: pop(1) });
      link.update({ k: ramp(q, 0.7, 1.0, E.lin), cut: ramp(q, 1.2, 1.7, E.inOut), tone: "grey" });
      const go = ramp(q, 1.8, 2.2, E.inOut);
      const die = ramp(q, 2.2, 2.5, E.lin);
      pk.set({
        x: lerp(122, 144, go),
        y: 70,
        s: (0.6 + 0.4 * ramp(q, 1.8, 2.0, E.lin)) * (1 - die),
        o: q < 1.8 || die >= 1 ? 0 : 1,
      });
    };
  }

  // ---------- row 2: one flip moment fits every read ----------
  function flipRow(pic) {
    const { good } = D6.LIN;
    const w = D6.LIN.w;
    const r0 = good.reads.filter((r) => r.v === 0).reduce((a, r) => (r.e > a.e ? r : a)); // the last read that saw 0
    const r1 = good.reads.filter((r) => r.v === 1).reduce((a, r) => (r.s < a.s ? r : a)); // the first read that saw 1
    const flipT = (r0.e + r1.s) / 2; // between the two reads
    if (!good.check.ok || !(good.check.lo <= flipT && flipT <= good.check.hi) || !(r0.e < r1.s))
      throw new Error("recap row 2: the flip moment does not fit the reads");
    const X0 = r0.s; // the time at the left edge of the drawing
    const PX = 48; // px per time unit
    const x = (tm) => 3 + (tm - X0) * PX;
    const bar = (text, tone, solid, x0, x1, y, right) =>
      pic.appendChild(
        V.h("div", {
          class: `v-tag${solid ? " solid" : ""} c-${tone}`,
          text,
          style: {
            ...box(x0, y, x1 - x0, 52),
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: right ? "flex-end" : "center",
            padding: right ? "0 18px 0 0" : "0",
            fontSize: "28px",
            whiteSpace: "nowrap",
          },
        }),
      );
    const [bw, b0, b1] = [
      bar(`write ${r1.v}`, "purple", false, x(w.s), x(w.e), 70, true),
      bar(`read ${r0.v}`, "blue", true, x(r0.s), x(r0.e), 6),
      bar(`read ${r1.v}`, "green", true, x(r1.s), x(r1.e), 6),
    ];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const line = svg.appendChild(
      V.s("line", {
        x1: f1(x(flipT)),
        x2: f1(x(flipT)),
        y1: 0,
        y2: 0,
        "stroke-width": 6,
        "stroke-linecap": "round",
        "stroke-dasharray": "10 10",
        style: { stroke: D6.tone("purple").c },
      }),
    );
    const tick = svg.appendChild(L5.tick(316, 34, 48, "green", { w: 8 }));
    return (t) => {
      const q = t - START[1];
      [bw, b0, b1].forEach((b, i) => {
        const p = ramp(q, 0.1 + 0.15 * i, 0.6 + 0.15 * i, E.lin);
        V.place(b, { s: E.pop(p), o: Math.min(1, p * 4) });
      });
      const d = ramp(q, 1.2, 1.8, E.out);
      line.setAttribute("y2", f1(128 * d));
      V.show(line, d > 0.01 ? 1 : 0);
      const k = ramp(q, 2.0, 2.5, E.lin);
      L5.drawOn(tick, k);
      V.place(tick, { s: 1 + 0.25 * flash(q, 2.4, 2.8), o: k > 0.01 ? 1 : 0 });
    };
  }

  // ---------- row 3: all yes, or abort ----------
  function voteRow(pic) {
    const { votes, abort } = D6.TPC;
    const run = D6.run2pc(votes, "2pc");
    D6.same(
      [run.decision, run.same, run.out],
      [abort.decision, true, ["aborted", "aborted", "aborted"]],
      "recap row 3",
    );
    if (!votes.includes("no") || votes.includes("crash")) throw new Error("recap row 3: the votes must hold a no");
    const C = [170, 30];
    const V3 = [60, 170, 280].map((x) => [x, 104]);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const lines = V3.map(([x, y]) =>
      svg.appendChild(
        V.s("line", {
          x1: C[0],
          y1: C[1],
          x2: x,
          y2: y,
          "stroke-width": 5,
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)" },
        }),
      ),
    );
    const coord = D6.disc(pic, { x: C[0], y: C[1], size: 56, text: "C", tone: "purple" });
    const dbs = V3.map(([x, y]) => D6.disc(pic, { x, y, size: 60, text: "", tone: "grey" }));
    dbs.forEach((d) => (d.el.style.fontSize = "29px")); // "yes" and "no" fit the discs with room to spare
    const tag = D6.tag(pic, { x: 232, y: 1, text: "abort", tone: "purple" });
    return (t) => {
      const q = t - START[2];
      const born = (i) => ramp(q, 0.1 + 0.3 * i, 0.6 + 0.3 * i, E.lin);
      const gone = q >= 2.6; // the decision: abort for everyone
      coord.set({ k: ramp(q, 0.1, 0.6, E.lin) });
      lines.forEach((l, i) => {
        l.style.opacity = f1(ramp(q, 0.3 + 0.2 * i, 0.7 + 0.2 * i, E.lin));
      });
      dbs.forEach((d, i) => {
        const at = 1.0 + 0.5 * i;
        const lit = q >= at;
        const tone = gone ? "orange" : lit ? (votes[i] === "yes" ? "green" : "red") : "grey";
        d.set({
          k: born(i),
          tone,
          solid: lit || gone,
          text: lit ? votes[i] : "",
          s: 1 + 0.18 * flash(q, at, at + 0.4) + 0.12 * flash(q, 2.6 + 0.08 * i, 3.0 + 0.08 * i),
        });
      });
      tag.set({ k: ramp(q, 2.6, 3.0, E.lin) });
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
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["red", "Cut network: refuse,\nor answer stale", cutRow],
        ["purple", "One copy: no read\ngoes back in time", flipRow],
        ["green", "Two-phase commit:\nall yes, or abort", voteRow],
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
        const c = ramp(t, 6.8, 7.4, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 6.8, 7.1) });
      };
    },
  });
})();
