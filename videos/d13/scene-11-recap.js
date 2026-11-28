/* Lecture 13 (ds-13) · scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Rows slide in at 0.8 / 1.9 / 3.0 s; each pictogram runs on its row's own clock (q = t - row time) and is finished by q 2.8;
   4.2 the call to action "Next: Workshop 13.W". After about 5.8 s only Pebble's bob moves.
   Row 1 (blue): a purple process box with three blue wavy thread lines over one orange memory bar; q 1.0-1.6 the lines draw,
          q 1.7-2.4 a blue dot runs down each line into the memory.
   Row 2 (green): a mini timeline: a purple master bar, a green fork line, three blue tally bars of different lengths
          (q 1.0-1.8), red dashed idle up to the green join line (q 2.0), then the purple master bar again (q 2.2-2.7).
   Row 3 (orange): two purple process boxes with their own orange memory; q 1.0-2.0 an orange envelope flies along the line
          from one to the other, q 2.2 a green tick. */
(function () {
  const V = window.VID;
  const D13 = V.d13;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;
  const T = D13.tone;
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
  const CTA_AT = 4.2;
  const rect = (svg, x, y, w, h, tone, o = {}) => {
    const c = T(tone);
    return svg.appendChild(
      V.s("rect", {
        x,
        y,
        width: w,
        height: h,
        rx: o.rx ?? 8,
        "stroke-width": o.sw ?? 3,
        "stroke-dasharray": o.dash || "none",
        style: { fill: o.fill === false ? "none" : o.dim ? c.dim : c.c, stroke: o.dash ? c.c : c.lip },
      }),
    );
  };
  const dot = (svg, tone, r = 8) =>
    svg.appendChild(V.s("circle", { r, "stroke-width": 3, style: { fill: T(tone).c, stroke: T(tone).lip } }));
  const put = (el, x, y) => {
    el.setAttribute("cx", f1(x));
    el.setAttribute("cy", f1(y));
  };

  // ---------- row 1: threads share one memory ----------
  function threadsRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    rect(svg, 60, 4, 220, 92, "purple", { dim: true, rx: 14 });
    rect(svg, 60, 108, 220, 26, "orange", { rx: 8 });
    const xs = [110, 170, 230];
    const lines = xs.map((x) => D13.wavy(svg, { x, y0: 18, y1: 86, amp: 9, waves: 1.5, w: 6 }));
    const dots = xs.map(() => dot(svg, "blue", 7));
    return (q) => {
      lines.forEach((l, i) => l.set({ k: ramp(q, 1.0 + 0.1 * i, 1.4 + 0.1 * i, E.inOut) }));
      dots.forEach((d, i) => {
        const k = ramp(q, 1.7 + 0.1 * i, 2.2 + 0.1 * i, E.inOut);
        const p = k < 0.8 ? lines[i].at(k / 0.8) : { x: xs[i], y: lerp(86, 121, (k - 0.8) / 0.2) };
        put(d, p.x, p.y);
        V.show(d, k > 0 ? 1 : 0);
      });
    };
  }

  // ---------- row 2: fork, work, join ----------
  function forkRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const X = { a: 20, fork: 80, join: 240, b: 320 };
    const laneY = (j) => 22 + j * 34;
    const ends = [240, 190, 160];
    const master1 = rect(svg, X.a, laneY(0), X.fork - X.a - 4, 20, "purple", { rx: 6 });
    const work = ends.map(() => rect(svg, X.fork + 4, 0, 0, 20, "blue", { rx: 6 }));
    const idle = ends.map(() => rect(svg, 0, 0, 0, 20, "red", { rx: 6, fill: false, dash: "6 4" }));
    const master2 = rect(svg, X.join + 4, laneY(0), 0, 20, "purple", { rx: 6 });
    const fork = svg.appendChild(
      V.s("line", { x1: X.fork, x2: X.fork, y1: 10, y2: 120, "stroke-width": 5, style: { stroke: T("green").c } }),
    );
    const join = svg.appendChild(
      V.s("line", { x1: X.join, x2: X.join, y1: 10, y2: 120, "stroke-width": 5, style: { stroke: T("green").c } }),
    );
    const setW = (el, x0, x1, y) => {
      el.setAttribute("x", f1(x0));
      el.setAttribute("y", f1(y));
      el.setAttribute("width", f1(Math.max(0, x1 - x0)));
      V.show(el, x1 - x0 > 1 ? 1 : 0);
    };
    return (q) => {
      V.show(master1, ramp(q, 0.2, 0.5));
      V.show(fork, ramp(q, 0.8, 1.0));
      const kw = ramp(q, 1.0, 1.8, E.lin);
      work.forEach((el, j) => setW(el, X.fork + 4, Math.min(ends[j] - 4, lerp(X.fork + 4, 240, kw)), laneY(j)));
      const ki = ramp(q, 1.8, 2.0, E.lin);
      idle.forEach((el, j) => setW(el, ends[j], lerp(ends[j], X.join - 4, ki), laneY(j)));
      V.show(join, ramp(q, 2.0, 2.2));
      setW(master2, X.join + 4, lerp(X.join + 4, X.b, ramp(q, 2.2, 2.7, E.lin)), laneY(0));
    };
  }

  // ---------- row 3: separate memories send messages ----------
  function mpiRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    [20, 220].forEach((x) => {
      rect(svg, x, 20, 100, 100, "purple", { dim: true, rx: 14 });
      rect(svg, x + 15, 62, 70, 40, "orange", { rx: 8 });
    });
    svg.appendChild(
      V.s("line", { x1: 124, x2: 216, y1: 70, y2: 70, "stroke-width": 5, style: { stroke: T("grey").c } }),
    );
    const env = svg.appendChild(D13.envelope(0, 0, 40));
    const tick = svg.appendChild(L5.tick(305, 30, 40, "green"));
    return (q) => {
      const k = ramp(q, 1.0, 2.0, E.inOut);
      env.setAttribute(
        "transform",
        `translate(${f1(lerp(70, 270, k))} ${f1(lerp(82, 82, k) - 40 * Math.sin(Math.PI * k))})`,
      );
      V.show(env, ramp(q, 0.6, 0.9));
      L5.drawOn(tick, ramp(q, 2.2, 2.5, E.out));
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
        ["blue", "Threads share one memory\non one node", threadsRow],
        ["green", "Fork, work, join: only\nparallel parts speed up", forkRow],
        ["orange", "Separate memories talk\nby MPI messages", mpiRow],
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
        text: "Next: Workshop 13.W",
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
