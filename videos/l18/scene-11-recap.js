/* Lecture 18 · Neuromorphic computing, scene 11-recap: three rows, each a small animated pictogram and one bold line (bare
   scene). Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after
   its row, 4.2-4.8 the call to action 'Next: Workshop 18.W'. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no
   loop, no reset): all are done by 6.5 s, so for the rest only Sprout's bob moves.
   Row 1 (green): two neurons joined by a synapse; the synapse draws, then its memory cell pops on it (no separate memory).
   Row 2 (purple): a row of eight grey cells; two purple spikes drop and only the two cells under them light green.
   Row 3 (orange): a battery fills and stays nearly full, a flask pops in beside it (still experimental). */
(function () {
  const V = window.VID;
  const L13 = V.l13;
  const L18 = V.l18;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
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
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 4.2;
  const DONE = {};

  // ---------- row 1: the synapse stores and computes ----------
  function synRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const line = L18.line(svg, [70, 70], [270, 70], "green", 10);
    const a = L18.circ(svg, 60, 70, 34, "green", "dim");
    const b = L18.circ(svg, 280, 70, 34, "green", "dim");
    const cell = L18.rect(svg, { x: 150, y: 50, w: 40, h: 40, rx: 7, tone: "green", fill: "c", sw: 4 });
    DONE.row1 = 1.6;
    return (q) => {
      V.place(a, { s: 0.6 + 0.4 * ramp(q, 0, 0.3, E.back), o: ramp(q, 0, 0.2) });
      V.place(b, { s: 0.6 + 0.4 * ramp(q, 0.1, 0.4, E.back), o: ramp(q, 0.1, 0.3) });
      line.style.strokeDasharray = "200";
      line.style.strokeDashoffset = f1(200 * (1 - ramp(q, 0.3, 0.9)));
      V.place(cell, { s: 0.4 + 0.6 * ramp(q, 1.0, 1.6, E.pop), o: ramp(q, 1.0, 1.2) });
    };
  }

  // ---------- row 2: work only where a spike arrived ----------
  function eventRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const cells = Array.from({ length: 8 }, (_, i) =>
      L18.rect(svg, { x: 14 + i * 40, y: 82, w: 32, h: 44, rx: 6, tone: "grey", fill: "dim", sw: 3 }),
    );
    const LIT = [2, 5];
    const spikes = LIT.map((i) => L18.spike(svg, 30 + i * 40, 66, 52, "purple", 8));
    DONE.row2 = 1.6;
    return (q) => {
      cells.forEach((c, i) => {
        const k = LIT.indexOf(i);
        const on = k >= 0 && q >= 0.8 + 0.5 * k;
        L18.paint(c, on ? "green" : "grey", on ? "c" : "dim");
        L18.op(c, ramp(q, 0, 0.3));
      });
      spikes.forEach((s, k) => {
        const u = ramp(q, 0.4 + 0.5 * k, 0.8 + 0.5 * k, E.out);
        V.place(s, { y: (1 - u) * -30, o: u });
      });
    };
  }

  // ---------- row 3: thrifty, but experimental ----------
  function thriftRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const bat = L18.battery(svg, 20, 40, 160, 64);
    const flask = L18.flask(svg, 270, 72, 1.3, "orange");
    DONE.row3 = 1.6;
    return (q) => {
      V.place(bat.g, { o: ramp(q, 0, 0.2) });
      bat.set({ level: 0.9 * ramp(q, 0.1, 0.8), tone: "green" });
      V.place(flask, { s: 0.5 + 0.5 * ramp(q, 0.9, 1.6, E.pop), o: ramp(q, 0.9, 1.1) });
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
        ["green", "Synapses store\nand compute", synRow],
        ["purple", "Event driven: work\nonly on spikes", eventRow],
        ["orange", "Thrifty, but still\nexperimental", thriftRow],
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
      const ends = [DONE.row1, DONE.row2, DONE.row3].map((d, i) => START[i] + d);
      L13.same(
        ends.every((e) => e <= 6.5),
        true,
        `recap: every pictogram is finished by 6.5 s (${ends.map((e) => e.toFixed(1)).join(", ")})`,
      );

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 18.W",
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
