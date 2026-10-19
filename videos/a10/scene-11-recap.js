/* Phase 10 · Transformers & Attention (algo-10), scene 11-recap: three rows, each a small animated pictogram and one bold line.
   Bare scene. Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is done at about
   4.4, row 2 at 5.4 and row 3 at 6.2, so for the last two seconds only Byte's bob moves.
   Row 1 (purple): the purple query ("barked") looks at three blue keys (the, dog, barked) along arrows whose thickness is the share;
          the shares 0.14, 0.58, 0.28 (from A10.QKV) pop in green, then the biggest, dog, turns green (key and share).
   Row 2 (orange): four blue tiles (four heads) slide together into one green bar, then a stack of three grey "layer" cards builds
          from the bottom.
   Row 3 (green): three dashed slots; the words Ich, habe, einen (A10.DEC) are written in turn, then a green arrow loops from the
          last word back to the start: go round again.
   Every share and word comes from A10.QKV / A10.DEC and is asserted when the scene is built. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const { f1 } = A10;

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
  const CTA_AT = 5.4;

  // an arrow draws on from its tail and its head lands only when the line has arrived (L5.drawOn alone shows the head early)
  const drawArrow = (g, k) => {
    L5.drawOn(g, k);
    g.querySelectorAll("[data-head]").forEach((h) => V.show(h, ramp(k, 0.92, 1, E.lin)));
  };

  // ---------- row 1: a query weighs every key (the thicker the arrow, the bigger the share) ----------
  function queryRow(pic) {
    const { weights, rows } = A10.QKV.barked;
    A10.same(
      "recap row 1: the shares of barked",
      rows.map((r) => r.wTxt),
      ["0.14", "0.58", "0.28"],
    );
    A10.same(
      "recap row 1: dog gets the biggest share",
      [rows[weights.indexOf(Math.max(...weights))].word, A10.tagW("0.14")],
      ["dog", 100],
    );
    const BEST = weights.indexOf(Math.max(...weights));
    const WIN = [2.4, 2.8]; // the biggest share turns green

    const query = A10.disc(pic, { x: 30, y: 70, size: 52, tone: "purple" });
    const keys = rows.map((_, i) => A10.disc(pic, { x: 150, y: 24 + 46 * i, size: 40, tone: "blue" }));
    const svg = A10.svg(pic, PIC.w, PIC.h);
    const arrows = weights.map((w, i) => {
      const wd = 3 + 12 * w;
      return svg.appendChild(L5.arrow(58, 70, 126, 24 + 46 * i, "purple", 1, { w: wd, head: 12 + wd }));
    });
    const tags = rows.map((r, i) =>
      A10.tag(pic, { x: 190, y: 4 + 46 * i, w: 100, h: 42, text: r.wTxt, tone: "green" }),
    );

    return (q) => {
      query.set({ k: ramp(q, 0, 0.5) });
      keys.forEach((d, i) => {
        const best = i === BEST;
        d.set({
          k: A10.seq(q, 0.3, 0.1, 0.3, i),
          tone: best && q >= WIN[0] ? "green" : "blue",
          s: best ? 1 + 0.2 * flash(q, ...WIN) : 1,
        });
      });
      arrows.forEach((g, i) => drawArrow(g, E.out(A10.seq(q, 0.9, 0.2, 0.4, i))));
      tags.forEach((t, i) => {
        const best = i === BEST;
        t.set({
          k: A10.seq(q, 1.6, 0.12, 0.36, i),
          solid: best && q >= WIN[0],
          s: best ? 1 + 0.12 * flash(q, ...WIN) : 1,
        });
      });
    };
  }

  // ---------- row 2: four heads glued into one bar, then layers stacked ----------
  function stackRow(pic) {
    const [HW, SLOT, GLUE] = [40, 48, 40];
    A10.same("recap row 2: four heads glued make a 160 px bar", [4 * HW + 3 * (GLUE - HW), SLOT - GLUE], [160, 8]);
    const heads = A10.cells(pic, {
      x: 0,
      y: 50,
      texts: ["", "", "", ""],
      w: HW,
      h: HW,
      gap: SLOT - HW,
      tone: "blue",
      radius: 12,
    });
    const layers = [0, 1, 2].map((i) => {
      const c = A10.card(pic, { x: 210, y: 92 - 40 * i, w: 100, h: 36, text: "layer", tone: "grey" });
      c.el.style.boxShadow = "0 3px 0 var(--c-edge)"; // a slim lip so the stacked cards do not overlap
      return c;
    });
    const T = { heads: 0, glue: [0.8, 1.6], tone: 1.2, layers: 1.9 };

    return (q) => {
      const e = ramp(q, ...T.glue, E.inOut);
      const done = q >= T.tone;
      heads.all((i) => ({
        ...A10.pop(A10.seq(q, T.heads, 0.08, 0.3, i)),
        x: -(SLOT - GLUE) * i * e,
        tone: done ? "green" : "blue",
        solid: done,
      }));
      layers.forEach((c, i) => c.set({ k: A10.seq(q, T.layers, 0.2, 0.3, i) }));
    };
  }

  // ---------- row 3: the decoder writes a word, then goes round again ----------
  function writeRow(pic) {
    const words = A10.DEC.out.slice(0, 3);
    A10.same("recap row 3: the first three words", words, ["Ich", "habe", "einen"]);
    const wr = A10.sentence(pic, { x: 0, y: 24, words, gap: 4 });
    A10.same("recap row 3: the sentence is 313 px wide", wr.width, 313);
    const svg = A10.svg(pic, PIC.w, PIC.h);
    const loop = svg.appendChild(L5.arrow(300, 104, 40, 104, "green", 1, { w: 5, head: 14, bow: 20 }));
    const WRITE = [0.5, 1.1, 1.7];
    const T = { slots: 0, loop: [2.3, 2.8], flash: 0.5 };

    return (q) => {
      wr.all((i) => {
        const w = WRITE[i];
        if (q < w) return { k: A10.seq(q, T.slots, 0.05, 0.3, i), ghost: true, text: "" };
        const fresh = q < w + T.flash; // a new word shows green for a moment, then settles to grey
        return {
          text: words[i],
          tone: fresh ? "green" : "grey",
          solid: fresh,
          s: 1 + 0.08 * flash(q, w, w + 0.35),
        };
      });
      drawArrow(loop, ramp(q, ...T.loop, E.lin));
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
        ["purple", "Attention weighs\nevery word", queryRow],
        ["orange", "Heads side by side,\nlayers in a stack", stackRow],
        ["green", "The decoder writes\none word at a time", writeRow],
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
        text: "Next: Workshop 10.C",
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
