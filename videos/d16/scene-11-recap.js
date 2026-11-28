/* Lecture 16 (ds-16) · scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title 'Remember' and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram runs on its row's
   own clock (q = t − row time) and is finished by q 2.9, 6.0 the call to action 'Next: Workshop 16.W'. Rows are done at about
   3.7, 4.8 and 5.9; after that only Pebble's bob moves.
   Row 1 (purple): a purple chip and a blue code page; q 1.0-1.5 a purple arrow goes from the code over the top to the chip,
          q 1.6-2.1 a blue arrow comes back underneath, q 2.3-2.8 both are redrawn green: one closed loop.
   Row 2 (blue): six small job chips in a blue column; q 1.0-1.7 the three heavy ones (D16.JOBS) slide right into a purple
          column (stagger 0.15) and turn purple; q 1.9-2.2 the last one (pet-safety rules) starts across, flashes red, and
          q 2.3-2.6 slides back blue.
   Row 3 (orange): a mini timeline of one photo (D16.P.cpu -> D16.P.gpu, at 2.3 px per ms, every bar at least 8 px wide):
          q 1.0-1.8 the long blue network bar on the CPU lane becomes a short purple bar on the GPU lane and the bars re-pack,
          the two orange copy bars grow on the copy lane; q 2.0-2.8 they pulse twice, then hold. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D4.tone;
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
  const CTA_AT = 6.0;

  // ---------- row 1: hardware and software shape each other ----------
  function loopRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    svg.append(D16.chip(70, 70, 84, "purple"), D16.code(270, 70, 80, "blue"));
    const mk = (a, b, tone) => {
      const g = L5.arrow(a[0], a[1], b[0], b[1], tone, 1, { w: 6, head: 16, bow: -26 });
      svg.append(g);
      return g;
    };
    const top = [mk([236, 34], [104, 34], "purple"), mk([236, 34], [104, 34], "green")];
    const bot = [mk([104, 106], [236, 106], "blue"), mk([104, 106], [236, 106], "green")];
    return (q) => {
      const g = ramp(q, 2.3, 2.8, E.inOut);
      L5.drawOn(top[0], ramp(q, 1.0, 1.5, E.inOut));
      L5.drawOn(bot[0], ramp(q, 1.6, 2.1, E.inOut));
      V.show(top[0], 1 - g);
      V.show(bot[0], 1 - g);
      L5.drawOn(top[1], g);
      L5.drawOn(bot[1], g);
    };
  }

  // ---------- row 2: heavy, stable jobs into hardware; changing ones stay ----------
  function partRow(pic) {
    const J = D16.JOBS;
    D16.same("recap row 2: heavy jobs", J.filter((j) => j.heavy).length, 3);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const frame = (x, tone) =>
      svg.appendChild(
        V.s("rect", {
          x,
          y: 2,
          width: 110,
          height: 136,
          rx: 14,
          fill: T(tone).dim,
          stroke: T(tone).edge,
          "stroke-width": 3,
        }),
      );
    frame(20, "blue");
    frame(210, "purple");
    const chips = J.map((_, i) =>
      svg.appendChild(V.s("rect", { y: 10 + 21 * i, width: 84, height: 15, rx: 6, "stroke-width": 2 })),
    );
    const PET = J.length - 1;
    return (q) => {
      chips.forEach((el, i) => {
        let k = 0;
        let tone = "blue";
        if (J[i].heavy) {
          k = ramp(q, 1.0 + 0.15 * i, 1.4 + 0.15 * i, E.inOut);
          if (k >= 1) tone = "purple";
        } else if (i === PET) {
          k = 0.5 * ramp(q, 1.9, 2.2, E.inOut) * (1 - ramp(q, 2.3, 2.6, E.inOut));
          if (q >= 2.15 && q < 2.45) tone = "red";
        }
        el.setAttribute("x", f1(lerp(33, 223, k)));
        el.style.fill = T(tone).c;
        el.style.stroke = T(tone).lip;
      });
    };
  }

  // ---------- row 3: profile, the copies appear ----------
  function copyRow(pic) {
    const A = D16.bars(D16.P.cpu);
    const B = D16.bars(D16.P.gpu);
    const PX = 2.3;
    const X0 = 24;
    const LANE = [28, 70, 112];
    const KEYS = ["prep", "copy1", "net", "copy2", "show"];
    const TONE = { prep: "blue", show: "blue", copy1: "orange", copy2: "orange" };
    const svg = L5.svg(pic, PIC.w, PIC.h);
    LANE.forEach((y) =>
      svg.appendChild(V.s("line", { x1: 16, x2: 330, y1: y + 14, y2: y + 14, stroke: T("grey").c, "stroke-width": 2 })),
    );
    const bars = KEYS.map(() => svg.appendChild(V.s("rect", { height: 24, rx: 6, "stroke-width": 2 })));
    return (q) => {
      const k = ramp(q, 1.0, 1.8, E.inOut);
      const pulse = flash(q, 2.0, 2.4) + flash(q, 2.4, 2.8);
      KEYS.forEach((key, i) => {
        const a = lerp(A[key].a, B[key].a, k);
        const b = lerp(A[key].b, B[key].b, k);
        const row = key === "net" ? (k >= 0.5 ? 1 : 0) : A[key].row;
        const copy = key.startsWith("copy");
        const w = copy && b - a < 0.05 ? 0 : Math.max(8, (b - a) * PX);
        const tone = key === "net" ? (k >= 0.5 ? "purple" : "blue") : TONE[key];
        const el = bars[i];
        const grow = copy ? 1 + 0.25 * pulse : 1;
        el.setAttribute("x", f1(X0 + a * PX));
        el.setAttribute("width", f1(w));
        el.setAttribute("y", f1(LANE[row] + 2 - 12 * (grow - 1)));
        el.setAttribute("height", f1(24 * grow));
        el.style.fill = T(tone).c;
        el.style.stroke = T(tone).lip;
        V.show(el, w > 0 ? 1 : 0);
      });
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
      const mascot = V.mascot("pebble", { size: 150, mood: "love" });
      mascot.style.left = "850px";
      mascot.style.top = "48px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["purple", "Co-design: hardware and\nsoftware, shaped for\neach other", loopRow],
        ["blue", "Partition: heavy, stable jobs\nin hardware, changing ones\nin software", partRow],
        ["orange", "Profile, count the copies,\nmeasure the whole pipeline", copyRow],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "420px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "32px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 16.W",
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
          r.update(t - APPEAR[i]);
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
