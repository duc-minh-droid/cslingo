/* Lecture 8 · Stream processing, scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line.
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0 (each pictogram starts 0.4 s later), 6.8 the
   call to action "Next: Workshop 8.W".
   Row 1 (blue): a grey file pops with a green tick (the batch finished); five blue events slide in from the right one after
   another and queue up beside it (the stream keeps coming).
   Rows 2 and 3 label the purple box "broker" underneath.
   Row 2 (purple): a producer P sends two blue messages into the purple broker, where they wait orange, then the broker pushes one
   to each consumer, which turns green.
   Row 3 (orange): the broker hands m3 to the top consumer, which crashes (red, bolt); m3 turns orange, goes back to the broker
   and on to the lower consumer, which turns green and acks.
   Every pictogram plays once and then holds its finished frame; only the mascot bob moves after about 6 s. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
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
  const at = (a, b, f) => ({ x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) });

  // ---------- row 1: the batch file is finished, the stream keeps coming ----------
  function streamRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const file = svg.appendChild(D8.file(60, 70, 70));
    const tick = svg.appendChild(L5.tick(120, 40, 34, "green", { w: 7 }));
    const N = 5;
    const discs = Array.from({ length: N }, () => D4.disc(pic, { x: 0, y: 70, size: 26, tone: "blue" }));
    return (t) => {
      const q = t - START[0];
      const kf = ramp(q, 0.1, 0.5, E.lin);
      V.place(file, { s: 0.7 + 0.3 * E.pop(kf), o: kf });
      const kt = ramp(q, 0.5, 0.9, E.lin);
      L5.drawOn(tick, kt);
      V.place(tick, { s: 1 + 0.25 * flash(q, 0.8, 1.2), o: kt > 0.01 ? 1 : 0 });
      discs.forEach((d, i) => {
        const f = ramp(q, 0.6 + 0.3 * i, 1.2 + 0.3 * i, E.out); // the last one stops at 2.4
        d.set({ x: lerp(352, 170 + 32 * i, f), k: f > 0 ? 1 : 0, o: Math.min(1, f * 3) });
      });
    };
  }

  // ---------- row 2: a broker buffers and pushes ----------
  function brokerRow(pic) {
    const P = { x: 40, y: 70 };
    const K = { x: 170, y: 70 };
    const C = [
      { x: 310, y: 40 },
      { x: 310, y: 100 },
    ];
    const SLOT = [
      { x: 155, y: 70 },
      { x: 185, y: 70 },
    ];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const wires = [
      D4.wire(svg, { pts: [P, K], tone: "grey", w: 4 }),
      ...C.map((c) => D4.wire(svg, { pts: [K, c], tone: "grey", w: 4 })),
    ];
    const prod = D4.disc(pic, { ...P, size: 50, fs: 30, text: "P", tone: "blue" });
    const broker = D4.card(pic, { x: K.x - 45, y: K.y - 35, w: 90, h: 70, tone: "purple", plain: false });
    const name = D4.label(pic, { x: K.x, y: K.y + 56, text: "broker", tone: "purple", fs: 28 });
    const cons = C.map((c) => D4.disc(pic, { ...c, size: 40, text: "", tone: "grey" }));
    const dots = SLOT.map(() => D4.disc(pic, { x: 0, y: 0, size: 22, tone: "blue" }));
    return (t) => {
      const q = t - START[1];
      wires.forEach((w) => w.set({ k: ramp(q, 0.1, 0.5) }));
      prod.set({ k: ramp(q, 0.05, 0.5, E.lin) });
      broker.set({ k: ramp(q, 0.1, 0.55, E.lin) });
      name.set({ k: ramp(q, 0.2, 0.6, E.lin) });
      dots.forEach((d, i) => {
        const fin = ramp(q, 0.4 + 0.1 * i, 0.9 + 0.1 * i, E.inOut);
        const fout = ramp(q, 1.6 + 0.1 * i, 2.1 + 0.1 * i, E.inOut);
        const p = fout > 0 ? at(SLOT[i], C[i], fout) : at(P, SLOT[i], fin);
        const waiting = fin >= 1 && fout <= 0;
        d.set({ x: p.x, y: p.y, tone: waiting ? "orange" : "blue", k: fin > 0 && fout < 1 ? 1 : 0 });
      });
      cons.forEach((c, i) => {
        const got = q >= 2.1 + 0.1 * i;
        c.set({
          k: ramp(q, 0.2 + 0.1 * i, 0.65 + 0.1 * i, E.lin),
          tone: got ? "green" : "grey",
          s: 1 + 0.2 * flash(q, 2.1 + 0.1 * i, 2.5 + 0.1 * i),
        });
      });
    };
  }

  // ---------- row 3: no ack, so the message is delivered again ----------
  function ackRow(pic) {
    const L = D8.ACKS;
    const redo = L.hops.find((h) => h.kind === "deliver" && h.redo);
    D8.same("recap row 3: m3 is redelivered to the other consumer", [redo.text, redo.to], ["m3", "C0"]);
    const K = { x: 66, y: 70 };
    const C = [
      { x: 252, y: 40 },
      { x: 252, y: 100 },
    ];
    const stop = (c) => ({ x: c.x - 60, y: c.y }); // the message waits just left of the consumer it reached
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const wires = C.map((c) => D4.wire(svg, { pts: [{ x: K.x + 45, y: K.y }, c], tone: "grey", w: 4 }));
    const broker = D4.card(pic, { x: K.x - 45, y: K.y - 35, w: 90, h: 70, tone: "purple", plain: false });
    const name = D4.label(pic, { x: K.x, y: K.y + 56, text: "broker", tone: "purple", fs: 28 });
    const cons = C.map((c) => D4.disc(pic, { ...c, size: 44, text: "", tone: "grey" }));
    const msg = D4.disc(pic, { ...K, size: 52, fs: 28, text: redo.text, tone: "blue" });
    const ack = D4.tag(pic, { x: 330, y: 100, text: "ack", tone: "green", solid: true });
    const top = L5.svg(pic, PIC.w, PIC.h);
    const bolt = top.appendChild(D4.bolt(278, 20, 30));
    return (t) => {
      const q = t - START[2];
      wires.forEach((w) => w.set({ k: ramp(q, 0.05, 0.4) }));
      broker.set({ k: ramp(q, 0.05, 0.5, E.lin) });
      name.set({ k: ramp(q, 0.15, 0.55, E.lin) });
      const g1 = ramp(q, 0.3, 0.8, E.inOut);
      const f2 = ramp(q, 1.4, 1.9, E.inOut);
      const f3 = ramp(q, 2.1, 2.6, E.inOut);
      let p = at(K, stop(C[0]), g1);
      if (f2 > 0) p = at(stop(C[0]), K, f2);
      if (f3 > 0) p = at(K, stop(C[1]), f3);
      const redone = q >= 1.3;
      msg.set({
        x: p.x - K.x,
        y: p.y - K.y,
        tone: redone ? "orange" : "blue",
        k: ramp(q, 0.1, 0.4, E.lin),
        s: 1 + 0.15 * flash(q, 1.25, 1.55),
      });
      const crash = q >= 1.0;
      const done = q >= 2.8;
      cons[0].set({ k: ramp(q, 0.15, 0.6, E.lin), tone: crash ? "red" : "grey", s: 1 + 0.2 * flash(q, 1.0, 1.4) });
      cons[1].set({ k: ramp(q, 0.25, 0.7, E.lin), tone: done ? "green" : "grey", s: 1 + 0.2 * flash(q, 2.8, 3.2) });
      const kb = ramp(q, 1.0, 1.3, E.lin);
      V.place(bolt, { s: 0.5 + 0.5 * E.pop(kb), o: kb });
      ack.set({ k: ramp(q, 2.8, 3.2, E.lin) });
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
        ["blue", "Batch ends;\na stream never does", streamRow],
        ["purple", "A broker buffers,\nkeeps and pushes", brokerRow],
        ["orange", "No ack?\nIt is delivered again", ackRow],
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
        text: "Next: Workshop 8.W",
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
