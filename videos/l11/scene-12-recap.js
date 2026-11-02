/* Lecture 11 · Flocking, scene 12-recap: three rows, each a small animated pictogram and one bold line (bare scene).
   Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   5.6-6.2 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is
   done at about 4.2, row 2 at 5.8, row 3 at 6.4, so for the last 2.5 seconds only Sprout's bob moves.
   Row 1 (purple): no leader. Seven grey boids with mixed headings pop, then all turn to the right and close up into one loose
          flock while drifting right; a grey 'no leader' tag pops under them (every boid stays grey: none is in charge).
   Row 2 (blue): the three rules. A purple boid with three grey flockmates; its red separation push (away from the close one),
          blue alignment push (the flockmates' heading) and green cohesion push (towards their centre) draw on head to
          tail, then the purple sum of the three closes the triangle, and the boid turns to the sum's heading.
   Row 3 (orange): an agent senses, then acts. A purple boid with its dashed orange radius; the two flockmates inside turn
          orange, the 'sense' card pops, an arrow, the 'act' card pops and the boid turns right, a return arrow closes the loop.
   The geometry is a hand-made pictogram; the sum arrow and the final heading are computed from the three pushes. */
(function () {
  const V = window.VID;
  const L11 = V.l11;
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
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 5.6;
  const deg = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI;
  const turnTo = (a, b, k) => {
    let d = b - a;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return a + d * k;
  };

  // ---------- row 1: no leader, one flock ----------
  function flockRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const HEAD = [-150, 40, 110, -60, 170, 20, -100];
    const END = [
      [112, 14],
      [150, 32],
      [108, 50],
      [190, 16],
      [146, 58],
      [192, 48],
      [228, 32],
    ];
    const C = [168, 34];
    const START_PT = END.map(([x, y]) => [C[0] + (x - C[0]) * 1.4 - 30, C[1] + (y - C[1]) * 1.15 + 4]);
    L11.same(HEAD.length, END.length, "recap row 1: seven boids");
    const boids = END.map(() => L11.dart(svg, { tone: "grey", size: 26 }));
    const tag = L11.tag(pic, { x: C[0] - L11.tagW("no leader") / 2, y: 78, h: 46, text: "no leader", tone: "grey" });
    return (q) => {
      const m = E.inOut(ramp(q, 0.9, 2.4, E.lin));
      boids.forEach((b, i) => {
        const k = L11.seq(q, 0.1, 0.05, 0.3, i);
        b.set({
          x: lerp(START_PT[i][0], END[i][0], m),
          y: lerp(START_PT[i][1], END[i][1], m),
          r: turnTo(HEAD[i], 0, m),
          s: 0.6 + 0.4 * E.pop(k),
          o: Math.min(1, k * 3),
        });
      });
      tag.set({ k: ramp(q, 2.6, 3.0) });
    };
  }

  // ---------- row 2: separation + alignment + cohesion = the turn ----------
  function rulesRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const ME = [104, 70];
    const MATES = [
      [124, 26, -30],
      [226, 34, -30],
      [236, 104, -30],
    ];
    const LEN = 66;
    const unit = (dx, dy) => {
      const d = Math.hypot(dx, dy);
      return [(dx / d) * LEN, (dy / d) * LEN];
    };
    const near = MATES[0];
    const sep = unit(ME[0] - near[0], ME[1] - near[1]); // away from the close one
    const ali = unit(Math.cos((-30 * Math.PI) / 180), Math.sin((-30 * Math.PI) / 180)); // their heading
    const cx = MATES.reduce((s, m) => s + m[0], 0) / MATES.length;
    const cy = MATES.reduce((s, m) => s + m[1], 0) / MATES.length;
    const coh = unit(cx - ME[0], cy - ME[1]); // towards their centre
    const SUM = [sep[0] + ali[0] + coh[0], sep[1] + ali[1] + coh[1]];
    // the three pushes are drawn head to tail (red from the boid, blue from its tip, green from the blue tip), so the
    // purple sum closes the triangle and never lies on top of a push
    const STARTS = [ME, [ME[0] + sep[0], ME[1] + sep[1]], [ME[0] + sep[0] + ali[0], ME[1] + sep[1] + ali[1]]];
    L11.check(
      [...STARTS, [ME[0] + SUM[0], ME[1] + SUM[1]]].every(([x, y]) => x > 8 && x < PIC.w - 8 && y > 8 && y < PIC.h - 4),
      "recap row 2: the push triangle fits the pictogram",
    );
    const SUM_DEG = deg(SUM[0], SUM[1]);
    L11.same(SUM_DEG > 0 && SUM_DEG < 20, true, "recap row 2: the sum turns the boid a little to the right");

    const mates = MATES.map(() => L11.dart(svg, { tone: "grey", size: 26 }));
    const vecs = [
      [sep, "red"],
      [ali, "blue"],
      [coh, "green"],
    ].map(([v, tone]) => ({ v, el: L11.vec(svg, { tone, w: 6, head: 16 }) }));
    const sum = L11.vec(svg, { tone: "purple", w: 8, head: 20 });
    const me = L11.dart(svg, { tone: "purple", size: 34 });
    const T = { draw: [0.8, 1.3, 1.8], sum: [2.5, 3.0], turn: [3.0, 3.5] };
    return (q) => {
      mates.forEach((b, i) => {
        const k = L11.seq(q, 0.1, 0.08, 0.3, i + 1);
        b.set({ x: MATES[i][0], y: MATES[i][1], r: MATES[i][2], s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 3) });
      });
      const kSum = ramp(q, ...T.sum, E.out);
      vecs.forEach(({ v, el }, i) =>
        el.set({
          x1: STARTS[i][0],
          y1: STARTS[i][1],
          x2: STARTS[i][0] + v[0],
          y2: STARTS[i][1] + v[1],
          k: ramp(q, T.draw[i], T.draw[i] + 0.4, E.out),
          o: 1 - 0.55 * kSum,
        }),
      );
      sum.set({ x1: ME[0], y1: ME[1], x2: ME[0] + SUM[0], y2: ME[1] + SUM[1], k: kSum });
      const k = ramp(q, 0.1, 0.4);
      me.set({
        x: ME[0],
        y: ME[1],
        r: SUM_DEG * ramp(q, ...T.turn, E.inOut),
        s: 0.6 + 0.4 * E.pop(k),
        o: Math.min(1, k * 3),
      });
    };
  }

  // ---------- row 3: sense, act, sense again ----------
  function agentRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const ME = [64, 70];
    const RAD = 56;
    const or = L11.tone("orange");
    const circle = svg.appendChild(
      V.s("circle", {
        cx: ME[0],
        cy: ME[1],
        r: RAD,
        "stroke-width": "4",
        "stroke-dasharray": "9 7",
        style: { fill: or.dim, stroke: or.c },
      }),
    );
    const MATES = [
      [38, 40, 10],
      [96, 98, -20],
      [140, 122, -10],
    ];
    const inside = MATES.map(([x, y]) => Math.hypot(x - ME[0], y - ME[1]) < RAD);
    L11.same(inside, [true, true, false], "recap row 3: two flockmates inside the radius, one outside");
    const mates = MATES.map(() => L11.dart(svg, { tone: "grey", size: 24 }));
    const me = L11.dart(svg, { tone: "purple", size: 30 });
    const sense = L11.card(pic, { x: 140, y: 14, w: 96, h: 54, text: "sense", tone: "orange", plain: false });
    const act = L11.card(pic, { x: 270, y: 14, w: 68, h: 54, text: "act", tone: "purple", plain: false });
    const fwd = svg.appendChild(L5.arrow(240, 41, 266, 41, "grey", 1, { w: 5, head: 12 }));
    const back = svg.appendChild(L5.arrow(304, 84, 188, 84, "grey", 1, { w: 5, head: 14, bow: 18 }));
    const TURN = 20;
    return (q) => {
      const k = ramp(q, 0.1, 0.6, E.out);
      circle.setAttribute("r", f1(Math.max(0.1, RAD * k)));
      V.show(circle, q >= 0.1);
      mates.forEach((b, i) => {
        const kb = L11.seq(q, 0.2, 0.08, 0.3, i);
        b.set({
          x: MATES[i][0],
          y: MATES[i][1],
          r: MATES[i][2],
          tone: inside[i] && q >= 0.8 ? "orange" : "grey",
          s: (0.6 + 0.4 * E.pop(kb)) * (1 + (inside[i] ? 0.2 * flash(q, 0.8, 1.1) : 0)),
          o: Math.min(1, kb * 3),
        });
      });
      me.set({
        x: ME[0],
        y: ME[1],
        r: TURN * ramp(q, 2.0, 2.5, E.inOut),
        s: 0.6 + 0.4 * E.pop(k),
        o: Math.min(1, k * 3),
      });
      sense.set({ k: ramp(q, 1.0, 1.35) });
      L5.drawOn(fwd, ramp(q, 1.4, 1.8));
      act.set({ k: ramp(q, 1.9, 2.25) });
      L5.drawOn(back, ramp(q, 2.6, 3.0, E.inOut));
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
        ["purple", "No leader: many\nsimple birds, one flock", flockRow],
        ["blue", "Separation, alignment,\ncohesion", rulesRow],
        ["orange", "An agent senses,\nthen acts", agentRow],
      ].map(([tone, text, make], i) => {
        text.split("\n").forEach((line) => {
          if (line.length > 24) throw new Error(`recap: "${line}" is longer than 24 characters`);
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
