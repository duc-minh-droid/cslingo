/* Lecture 11 (ds-11) · scene 12-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram runs on its row's own clock
   (q = t − row time) and is finished by q 2.9, 6.0 the call to action 'Next: Workshop 11.W'. Rows are done at about 3.7,
   4.8 and 5.9; after that only Pebble's bob moves.
   Row 1 (purple): four grey machines with a blue value each and a purple + hub; q 1.0-1.9 four purple dots fly into the +
          (stagger 0.1), the + pulses, q 1.9-2.5 four green dots fly back and stay, one on every machine (all-reduce).
   Row 2 (blue): three worker chips 'w' over a mini timeline (three worker lanes and a network lane); q 1.0-1.8 blue compute
          bars grow, q 1.9-2.4 the purple all-reduce bar grows on the network lane while red dashed idle bars grow on the
          worker lanes; q 2.6 the three w chips flash and turn green (the same updated model on every worker).
   Row 3 (green): a framed plane with 10 grey points in two groups and two crosses (blue c0, orange c1); q 1.0 every point
          takes the tone of its nearest cross (assign), q 1.6-2.2 the crosses glide to their groups' means (update),
          q 2.6 a green tick draws (converged). The assignment and the means are computed below and asserted. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D11 = V.d11;
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
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const CTA_AT = 6.0;
  const circle = (svg, tone, r) => {
    const c = T(tone);
    return svg.appendChild(V.s("circle", { cx: 0, cy: 0, r, fill: c.c, stroke: c.lip, "stroke-width": 3 }));
  };
  const at = (el, p) => {
    el.setAttribute("cx", f1(p.x));
    el.setAttribute("cy", f1(p.y));
  };

  // ---------- row 1: all-reduce onto every machine ----------
  function allReduceRow(pic) {
    const n = D11.PAT.vals.length;
    D11.same("recap row 1: four machines", n, 4);
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const G = T("grey");
    const HUB = { x: 250, y: 70 };
    const ys = Array.from({ length: n }, (_, i) => 8 + i * 33);
    ys.forEach((y) =>
      svg.appendChild(
        V.s("line", {
          x1: 100,
          y1: y + 14,
          x2: HUB.x,
          y2: HUB.y,
          stroke: G.c,
          "stroke-width": 4,
          "stroke-linecap": "round",
        }),
      ),
    );
    ys.forEach((y) =>
      svg.appendChild(
        V.s("rect", { x: 20, y, width: 80, height: 28, rx: 8, fill: "var(--panel)", stroke: G.c, "stroke-width": 3 }),
      ),
    );
    ys.forEach((y) => at(circle(svg, "blue", 8), { x: 42, y: y + 14 }));
    const P = T("purple");
    const hub = V.s("g", {});
    hub.append(
      V.s("circle", { cx: HUB.x, cy: HUB.y, r: 30, fill: P.c, stroke: P.lip, "stroke-width": 3 }),
      V.s("path", {
        d: `M${HUB.x - 13} ${HUB.y}H${HUB.x + 13}M${HUB.x} ${HUB.y - 13}V${HUB.y + 13}`,
        stroke: P.on,
        "stroke-width": 6,
        "stroke-linecap": "round",
      }),
    );
    svg.appendChild(hub);
    const ups = ys.map(() => circle(svg, "purple", 8));
    const downs = ys.map(() => circle(svg, "green", 8));
    return (q) => {
      ys.forEach((y, i) => {
        const src = { x: 100, y: y + 14 };
        const ku = ramp(q, 1.0 + 0.1 * i, 1.5 + 0.1 * i, E.inOut);
        at(ups[i], D4.at(src, HUB, ku));
        V.show(ups[i], ku > 0 && ku < 1 ? 1 : 0);
        const kd = ramp(q, 1.9 + 0.1 * i, 2.4 + 0.1 * i, E.inOut);
        at(downs[i], D4.at(HUB, { x: 76, y: y + 14 }, kd));
        V.show(downs[i], kd > 0 ? 1 : 0);
      });
      V.place(hub, { s: 1 + 0.18 * flash(q, 1.75, 2.15) });
    };
  }

  // ---------- row 2: all-reduce SGD, idle while it talks ----------
  function sgdRow(pic) {
    const M = D11.SGD.M;
    D11.same("recap row 2: three workers", M, 3);
    const w = D4.chips(pic, { x: 30, y: 2, n: M, w: 90, h: 40, gap: 12, fs: 28, texts: () => "w" });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const laneY = (j) => 56 + j * 21;
    const X = { a: 30, mid: 220, b: 326 };
    const G = T("grey");
    for (let j = 0; j <= M; j++)
      svg.appendChild(
        V.s("line", { x1: X.a, y1: laneY(j) + 16, x2: X.b, y2: laneY(j) + 16, stroke: G.c, "stroke-width": 2 }),
      );
    const bar = (tone, dash) => {
      const c = T(tone);
      return svg.appendChild(
        V.s("rect", {
          height: 14,
          rx: 6,
          fill: dash ? "none" : c.c,
          stroke: dash ? c.c : c.lip,
          "stroke-width": dash ? 3 : 2,
          "stroke-dasharray": dash ? "6 4" : "none",
        }),
      );
    };
    const work = Array.from({ length: M }, () => bar("blue"));
    const idle = Array.from({ length: M }, () => bar("red", true));
    const net = bar("purple");
    const put = (el, j, x0, x1) => {
      el.setAttribute("x", f1(x0));
      el.setAttribute("y", f1(laneY(j)));
      el.setAttribute("width", f1(Math.max(0, x1 - x0)));
      V.show(el, x1 - x0 > 1 ? 1 : 0);
    };
    return (q) => {
      const kw = ramp(q, 1.0, 1.8, E.lin);
      const kc = ramp(q, 1.9, 2.4, E.lin);
      work.forEach((el, j) => put(el, j, X.a, lerp(X.a, X.mid, kw)));
      idle.forEach((el, j) => put(el, j, X.mid + 4, lerp(X.mid + 4, X.b, kc)));
      put(net, M, X.mid + 4, lerp(X.mid + 4, X.b, kc));
      const done = q >= 2.6;
      const fl = flash(q, 2.6, 3.0);
      w.all(() => ({ tone: done ? "green" : "grey", solid: done, s: 1 + 0.2 * fl, o: ramp(q, 0.1, 0.4) }));
    };
  }

  // ---------- row 3: k-means as map (assign) and reduce (update) ----------
  function kmeansRow(pic) {
    const pts = [
      [60, 70],
      [85, 95],
      [100, 58],
      [72, 112],
      [112, 88],
      [200, 50],
      [228, 76],
      [250, 44],
      [214, 104],
      [262, 88],
    ];
    const start = [
      [125, 112],
      [190, 30],
    ];
    const d2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
    const asg = pts.map((p) => (d2(p, start[0]) <= d2(p, start[1]) ? 0 : 1));
    D11.same("recap row 3: the assignment splits the two groups", asg, [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
    const ends = [0, 1].map((k) => {
      const mine = pts.filter((_, i) => asg[i] === k);
      return [D11.mean(mine.map((p) => p[0])), D11.mean(mine.map((p) => p[1]))];
    });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const G = T("grey");
    svg.appendChild(
      V.s("rect", {
        x: 16,
        y: 4,
        width: 278,
        height: 132,
        rx: 14,
        fill: "var(--panel)",
        stroke: G.c,
        "stroke-width": 3,
      }),
    );
    const dots = pts.map((p) => {
      const c = svg.appendChild(V.s("circle", { cx: p[0], cy: p[1], r: 8, "stroke-width": 3 }));
      return c;
    });
    const TONES = ["blue", "orange"];
    const crosses = TONES.map((tone) => {
      const g = V.s("g", {});
      g.append(L5.cross(0, 0, 34, tone, { w: 7 }));
      return svg.appendChild(g);
    });
    const tick = svg.appendChild(L5.tick(318, 70, 40, "green"));
    return (q) => {
      const on = q >= 1.0;
      const fl = flash(q, 1.0, 1.4);
      dots.forEach((c, i) => {
        const tone = T(on ? TONES[asg[i]] : "grey");
        c.style.fill = on ? tone.c : "var(--panel)";
        c.style.stroke = on ? tone.lip : G.c;
        c.setAttribute("r", f1(8 * (1 + 0.3 * fl)));
      });
      const kg = ramp(q, 1.6, 2.2, E.inOut);
      crosses.forEach((g, k) => {
        const x = lerp(start[k][0], ends[k][0], kg);
        const y = lerp(start[k][1], ends[k][1], kg);
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
        V.show(g, ramp(q, 0.2, 0.5));
      });
      L5.drawOn(tick, ramp(q, 2.6, 2.9, E.out));
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
        ["purple", "Patterns: who sends,\nwho gets the result", allReduceRow],
        ["blue", "All-reduce SGD: same model,\nbut idle while it talks", sgdRow],
        ["green", "k-means in MapReduce:\nmap, combine, reduce", kmeansRow],
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
        text: "Next: Workshop 11.W",
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
