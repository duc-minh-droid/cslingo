/* Lecture 12 (ds-12) · scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram runs on its row's own clock
   (q = t − row time) and is finished by q 2.4; 4.2 the call to action 'Next: Workshop 12.W'. After about 5.4 only Pebble's
   bob moves.
   Row 1 (blue): a grey hardware bar and a purple hypervisor bar (q 0.3-0.8), then two guest columns (blue guest OS, green app)
          rise onto it (q 1.0-1.8): a whole computer in software.
   Row 2 (green): one blue kernel bar (q 0.3-0.8), three dashed green boxes drop onto it (q 1.0, 1.25, 1.5) and a green app
          pops in each: sealed boxes on one shared kernel.
   Row 3 (purple): a purple recipe card (q 0.3-0.8), a grey arrow draws (q 1.0-1.5), three green pod dots pop (q 1.6, 1.8,
          2.0) and stay. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
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
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const CTA_AT = 4.2;
  const rect = (svg, x, y, w, h, tone, o = {}) => {
    const c = T(tone);
    return svg.appendChild(
      V.s("rect", {
        x,
        y,
        width: w,
        height: h,
        rx: o.rx ?? 6,
        fill: o.dash ? "none" : c.c,
        stroke: o.dash ? c.c : c.lip,
        "stroke-width": o.dash ? 4 : 3,
        "stroke-dasharray": o.dash ? "8 6" : "none",
      }),
    );
  };

  // ---------- row 1: a whole computer in software ----------
  function vmRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const base = [rect(svg, 20, 114, 300, 20, "grey"), rect(svg, 20, 88, 300, 20, "purple")];
    const cols = [40, 190].map((x) => {
      const g = svg.appendChild(V.s("g", {}));
      g.append(rect(svg, x, 56, 110, 26, "blue"), rect(svg, x, 24, 110, 26, "green"));
      return g;
    });
    return (q) => {
      base.forEach((b, i) => V.show(b, ramp(q, 0.3 + 0.2 * i, 0.6 + 0.2 * i)));
      cols.forEach((g, i) => {
        const k = ramp(q, 1.0 + 0.3 * i, 1.5 + 0.3 * i);
        V.place(g, { y: (1 - k) * 30, o: k });
      });
    };
  }

  // ---------- row 2: sealed boxes on one shared kernel ----------
  function boxRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const kernel = rect(svg, 20, 110, 300, 22, "blue");
    const xs = [30, 130, 230];
    const shells = xs.map((x) => rect(svg, x, 22, 80, 80, "green", { dash: true, rx: 12 }));
    const apps = xs.map((x) => rect(svg, x + 20, 46, 40, 32, "green"));
    return (q) => {
      V.show(kernel, ramp(q, 0.3, 0.8));
      xs.forEach((_, i) => {
        const k = ramp(q, 1.0 + 0.25 * i, 1.4 + 0.25 * i);
        V.place(shells[i], { y: (1 - k) * -26, o: k });
        const ka = ramp(q, 1.3 + 0.25 * i, 1.7 + 0.25 * i, E.lin);
        V.place(apps[i], { s: E.pop(ka), o: ka > 0 ? 1 : 0 });
      });
    };
  }

  // ---------- row 3: the image builds it, Kubernetes keeps it running ----------
  function k8sRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const card = svg.appendChild(V.s("g", {}));
    card.append(rect(svg, 30, 16, 100, 112, "purple", { rx: 12 }));
    [44, 66, 88, 110].forEach((y, i) =>
      card.appendChild(
        V.s("line", {
          x1: 48,
          y1: y,
          x2: i % 2 ? 96 : 112,
          y2: y,
          stroke: T("purple").on,
          "stroke-width": 6,
          "stroke-linecap": "round",
        }),
      ),
    );
    const arrow = svg.appendChild(L5.arrow(146, 72, 222, 72, "grey", 1, { w: 6, head: 18 }));
    const G = T("green");
    const pods = [30, 72, 114].map((y) =>
      svg.appendChild(V.s("circle", { cx: 270, cy: y, r: 17, fill: G.c, stroke: G.lip, "stroke-width": 3 })),
    );
    return (q) => {
      V.place(card, { s: 0.8 + 0.2 * E.pop(ramp(q, 0.3, 0.8, E.lin)), o: ramp(q, 0.3, 0.5) });
      L5.drawOn(arrow, ramp(q, 1.0, 1.5));
      pods.forEach((p, i) => {
        const k = ramp(q, 1.6 + 0.2 * i, 2.0 + 0.2 * i, E.lin);
        V.place(p, { s: E.pop(k), o: k > 0 ? 1 : 0 });
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
        ["blue", "Virtual machine: a whole\ncomputer in software", vmRow],
        ["green", "Container: a sealed box\non one shared kernel", boxRow],
        ["purple", "Image builds the box,\nKubernetes keeps it running", k8sRow],
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
            fontSize: "34px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 12.W",
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
