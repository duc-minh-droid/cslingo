/* Lecture 15 (ds-15) · scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram runs on its row's own clock
   (q = t − row time) and is finished by q 2.9, 6.0 the call to action 'Next: Workshop 15.W'. Rows are done at about 3.7,
   4.8 and 5.9; after that only Pebble's bob moves.
   Row 1 (blue): one grey node box; q 1.0-1.5 it splits into two blue processor boxes, q 1.5-2.3 each fills with 8 small blue
          core squares (2 × 8 = 16 shown; the cluster has D15.CL.nodes of these nodes), q 2.4 a green '64' disc pops.
   Row 2 (red): two small time bars, a red block plus a blue block; q 1.0-1.8 in the lower bar the blue block shrinks to a tenth
          while the red stays; q 2.2 a green dashed ceiling line draws above.
   Row 3 (orange): three orange job chips in a queue; q 1.0-1.6 the first slides into a grey node frame, q 1.7 turns blue,
          q 2.3 green, q 2.5 a green tick draws. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;
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
  const rect = (svg, tone, solid) => {
    const c = T(tone);
    return svg.appendChild(
      V.s("rect", {
        rx: 8,
        fill: solid ? c.c : "var(--panel)",
        stroke: solid ? c.lip : c.edge,
        "stroke-width": 3,
      }),
    );
  };
  const put = (el, x, y, w, h) => {
    el.setAttribute("x", f1(x));
    el.setAttribute("y", f1(y));
    el.setAttribute("width", f1(Math.max(0, w)));
    el.setAttribute("height", f1(h));
  };

  // ---------- row 1: node -> processors -> cores ----------
  function coresRow(pic) {
    D15.same("recap row 1 total", D15.CL.total, 64);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const node = rect(svg, "grey", false);
    const procs = [rect(svg, "blue", false), rect(svg, "blue", false)];
    const cores = Array.from({ length: 16 }, () => rect(svg, "blue", true));
    const disc = D4.disc(pic, { x: 300, y: 70, size: 64, text: String(D15.CL.total), tone: "green", fs: 30 });
    return (q) => {
      const ks = ramp(q, 1.0, 1.5, E.inOut);
      put(node, 20, 20, 230, 100);
      V.show(node, ramp(q, 0.1, 0.4) * (1 - ks));
      procs.forEach((p, i) => {
        put(p, lerp(20, 20 + i * 120, ks), 20, lerp(230, 110, ks), 100);
        V.show(p, ks > 0 ? 1 : 0);
      });
      cores.forEach((c, j) => {
        const pi = Math.floor(j / 8);
        const m = j % 8;
        put(c, 20 + pi * 120 + 11 + (m % 4) * 23, 40 + Math.floor(m / 4) * 30, 19, 22);
        c.setAttribute("rx", "4");
        V.show(c, D15.seq(q, 1.5, 0.05, 0.2, j) >= 1 ? 1 : 0);
      });
      disc.set({ k: ramp(q, 2.4, 2.8) });
    };
  }

  // ---------- row 2: Amdahl's bars and the ceiling ----------
  function amdahlRow(pic) {
    const A = D15.AM;
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const px = 2.4;
    const red = [rect(svg, "red", true), rect(svg, "red", true)];
    const blue = [rect(svg, "blue", true), rect(svg, "blue", true)];
    const ceil = svg.appendChild(
      V.s("line", {
        x1: 20,
        y1: 14,
        x2: 300,
        y2: 14,
        stroke: T("green").c,
        "stroke-width": 5,
        "stroke-dasharray": "10 8",
      }),
    );
    return (q) => {
      const k0 = ramp(q, 0.1, 0.4);
      const ks = ramp(q, 1.0, 1.8, E.inOut);
      [40, 90].forEach((y, i) => {
        put(red[i], 20, y, A.seq * px, 34);
        const w = i ? lerp(A.par, A.par / A.procs, ks) * px : A.par * px;
        put(blue[i], 20 + A.seq * px, y, w, 34);
        V.show(red[i], k0);
        V.show(blue[i], k0);
      });
      const kc = ramp(q, 2.2, 2.7, E.lin);
      ceil.setAttribute("x2", f1(lerp(20, 300, kc)));
      V.show(ceil, kc > 0 ? 1 : 0);
    };
  }

  // ---------- row 3: a job through the queue ----------
  function queueRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const frame = svg.appendChild(
      V.s("rect", {
        x: 200,
        y: 24,
        width: 110,
        height: 92,
        rx: 14,
        fill: "none",
        stroke: T("grey").c,
        "stroke-width": 4,
        "stroke-dasharray": "9 7",
      }),
    );
    const jobs = [0, 1, 2].map(() => rect(svg, "orange", true));
    const tick = svg.appendChild(L5.tick(255, 70, 40, "green", { on: true, w: 7 }));
    return (q) => {
      V.show(frame, ramp(q, 0.1, 0.4));
      const mv = ramp(q, 1.0, 1.6, E.inOut);
      jobs.forEach((j, i) => {
        // i = 0 is the front of the queue (right-most)
        const x = 130 - i * 50;
        const fx = i === 0 ? lerp(x, 225, mv) : x + 50 * mv;
        put(j, fx, i === 0 ? lerp(46, 40, mv) : 46, i === 0 ? lerp(40, 60, mv) : 40, i === 0 ? lerp(48, 60, mv) : 48);
        const c = i === 0 ? (q >= 2.3 ? T("green") : q >= 1.7 ? T("blue") : T("orange")) : T("orange");
        j.style.fill = c.c;
        j.style.stroke = c.lip;
        V.show(j, ramp(q, 0.1 + 0.1 * i, 0.4 + 0.1 * i));
      });
      L5.drawOn(tick, ramp(q, 2.5, 2.9, E.out));
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
        ["blue", "Nodes × processors × cores,\ncounted in FLOPS", coresRow],
        ["red", "Amdahl: the part that won't share\nsets the ceiling", amdahlRow],
        ["orange", "Slurm: partitions, priority,\nsbatch, squeue, srun, sacct", queueRow],
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
            fontSize: "30px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 15.W",
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
