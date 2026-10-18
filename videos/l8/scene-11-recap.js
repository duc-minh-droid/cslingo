/* Lecture 8 · The Ant System, scene 11-recap: three rows, each a small animated pictogram and one bold line (bare scene).
   Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   5.4-6.0 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): rows 1 and 2
   are done at about 5.1, row 3 at 6.1, so for the last 2.5 seconds only Sprout's bob moves.
   Row 1 (blue): the loop. Discs 1 2 3 joined by two grey arrows; an orange ant stands above disc 1, hops to disc 2 and disc 3
          (each disc bumps as it lands), then rides the grey return arrow (drawn under it) back to disc 1 and stays there.
   Row 2 (orange): the choice. The share strip Ash 20% / Birch 40% / Cedar 40%, a dice that rolls and lands on 4, the random
          number's pointer dropping on the strip at u = 0.31, and the Birch slice turning solid orange (the slice it landed in).
   Row 3 (green): the update. Four blue blocks (the old trail 4); two turn red and float away (evaporation, rho = 0.5); seven
          green blocks pop into slots 2-8 (the deposits Q / L = 4 + 2 + 1); the tag 2 + 7 = 9 (the new trail).
   Every number comes from L8.LOOP, L8.HUB and L8.LEDGER (run and asserted in l8/common.js) and is asserted again when the
   scene is built. */
(function () {
  const V = window.VID;
  const L8 = V.l8;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const { f1 } = L8;

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
  const smooth = (x) => x * x * (3 - 2 * x);

  // ---------- row 1: build tours, then update the trails (the loop repeats) ----------
  function loopRow(pic) {
    const R = L8.LOOP.iters;
    L8.same(
      R[0].ants.every((a) => a.tour.length === L8.FIVE.ids.length && new Set(a.tour).size === L8.FIVE.ids.length),
      true,
      "recap row 1: every ant builds a whole tour (each village once)",
    );
    L8.same(
      Object.keys(R[0].after).some((k) => R[0].after[k] !== R[0].before[k]),
      true,
      "recap row 1: the update step changes the trails",
    );
    L8.same(
      R[1].before["R-S"],
      R[0].after["R-S"],
      "recap row 1: the next round starts from the trails the last one left",
    );
    L8.same(R[0].starts !== R[1].starts, true, "recap row 1: the ants start afresh each round");

    const STEPS = ["place the ants", "build the tours", "update the trails"];
    L8.same(STEPS.length, 3, "recap row 1: three steps in a round");
    const [X, Y, SIZE, AY] = [[56, 170, 284], 54, 52, 12];
    const discs = X.map((x, i) => L8.disc(pic, { x, y: Y, size: SIZE, text: String(i + 1), tone: "blue" }));
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const fwd = [0, 1].map((i) =>
      svg.appendChild(L5.arrow(X[i] + 34, Y, X[i + 1] - 34, Y, "grey", 1, { w: 6, head: 18 })),
    );
    const BOW = 22;
    const back = svg.appendChild(L5.arrow(X[2], 96, X[0], 96, "grey", 1, { bow: BOW }));
    const heads = [...back.querySelectorAll("[data-head]")];

    // the ant's ride: round the right of disc 3, along the return arrow's own curve, round the left of disc 1, up on top of it
    const cubic = (p, t) => {
      const u = 1 - t;
      return [0, 1].map(
        (a) => u * u * u * p[0][a] + 3 * u * u * t * p[1][a] + 3 * u * t * t * p[2][a] + t * t * t * p[3][a],
      );
    };
    const quad = (p, t) => {
      const u = 1 - t;
      return [0, 1].map((a) => u * u * p[0][a] + 2 * u * t * p[1][a] + t * t * p[2][a]);
    };
    const ctrl = [(X[2] + X[0]) / 2, 96 + BOW * 2]; // the arrow's own control point (see L5.arrow)
    const dirEnd = [X[0] - ctrl[0], 96 - ctrl[1]].map((v, _, a) => v / Math.hypot(a[0], a[1]));
    const shaftEnd = [X[0] - dirEnd[0] * 22 * 0.75, 96 - dirEnd[1] * 22 * 0.75];
    const pieces = [
      {
        f: cubic,
        p: [
          [X[2], AY],
          [356, 8],
          [340, 72],
          [X[2], 96],
        ],
        n: 28,
      },
      { f: quad, p: [[X[2], 96], ctrl, shaftEnd], n: 48 },
      { f: cubic, p: [shaftEnd, [24, 88], [4, AY], [X[0], AY]], n: 28 },
    ];
    const pts = [];
    const bounds = [];
    pieces.forEach((pc) => {
      for (let i = pts.length ? 1 : 0; i <= pc.n; i++) pts.push(pc.f(pc.p, i / pc.n));
      bounds.push(pts.length - 1);
    });
    const cum = pts.map(() => 0);
    const ang = pts.map(() => 0);
    pts.forEach((p, i) => {
      if (!i) return;
      cum[i] = cum[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      let a = (Math.atan2(p[1] - pts[i - 1][1], p[0] - pts[i - 1][0]) * 180) / Math.PI;
      while (a - ang[i - 1] > 180) a -= 360;
      while (a - ang[i - 1] < -180) a += 360;
      ang[i] = a;
    });
    // the ride starts and ends facing right, as the ant stands on top of disc 1 (the sampled heading is within a few degrees)
    L8.same(
      Math.abs(ang[1]) < 6 && Math.abs(ang[ang.length - 1] - 360) < 6,
      true,
      "recap row 1: the ant leaves and returns facing right",
    );
    ang[0] = 0;
    ang[ang.length - 1] = 360;
    const [LA, LB] = [cum[bounds[0]], cum[bounds[1]] - cum[bounds[0]]];
    const ride = (s) => {
      const i = Math.max(
        1,
        cum.findIndex((c) => c >= s),
      );
      const k = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return {
        x: lerp(pts[i - 1][0], pts[i][0], k),
        y: lerp(pts[i - 1][1], pts[i][1], k),
        r: lerp(ang[i - 1], ang[i], k),
      };
    };
    const ant = svg.appendChild(L8.ant(0, 0, 44));
    const T = {
      discs: 0.1,
      arrows: [0.9, 1.6],
      ant: 1.5,
      hop: [
        [1.8, 2.3],
        [2.5, 3.0],
      ],
      back: [3.2, 4.0],
    };

    return (q) => {
      discs.forEach((d, i) => {
        const land = i === 0 ? T.ant : T.hop[i - 1][1];
        const end = i === 0 ? T.back[1] : T.hop[i - 1][1];
        const bump = flash(q, land, land + 0.4) + (i === 0 ? flash(q, end - 0.1, end + 0.3) : 0);
        d.set({ text: String(i + 1), k: L8.seq(q, T.discs, 0.15, 0.35, i), s: 1 + 0.12 * Math.min(1, bump) });
      });
      fwd.forEach((g, i) => L5.drawOn(g, L8.seq(q, T.arrows[0], 0.35, T.arrows[1] - T.arrows[0] - 0.35, i)));

      // where the ant is: above disc 1, hop, hop, then round the loop
      let p = { x: X[0], y: AY, r: 0 };
      let bounce = 0;
      let s = 0;
      T.hop.forEach(([a, b], j) => {
        const e = smooth(ramp(q, a, b, E.lin));
        if (q >= a) {
          p = { x: lerp(X[j], X[j + 1], e), y: AY - 3 * Math.sin(Math.PI * e), r: 0 };
          bounce = Math.sin(Math.PI * e);
        }
      });
      if (q >= T.back[0]) {
        s = smooth(ramp(q, T.back[0], T.back[1], E.lin)) * cum[cum.length - 1];
        p = ride(s);
        bounce = 0;
      }
      const born = ramp(q, T.ant, T.ant + 0.35, E.lin);
      V.place(ant, {
        x: p.x,
        y: p.y,
        r: p.r,
        s: (0.5 + 0.5 * E.pop(born)) * (1 + 0.1 * bounce),
        o: Math.min(1, born * 4),
      });
      // the return arrow is drawn under the ant; its head shows only once the ant has nearly reached the end of it
      const k = clamp((s - LA) / LB);
      L5.drawOn(back, k);
      heads.forEach((h) => V.show(h, ramp(k, 0.96, 1, E.lin)));
    };
  }

  // ---------- row 2: roll the dice on the share strip ----------
  function diceRow(pic) {
    const rows = L8.HUB.rows.slice(0, 3); // Ash, Birch, Cedar (Dale is tabu and has no slice)
    const chance = rows.map((r) => r.p);
    L8.same(chance.map(L8.pct), [20, 40, 40], "recap row 2: the shares of the strip");
    const draw = L8.HUB.draws[0];
    const win = L8.pick(chance, draw.u);
    L8.same(draw.u.toFixed(2), "0.31", "recap row 2: the random number");
    L8.same([rows[win].name, draw.to], ["Birch", "Birch"], "recap row 2: the slice the number lands in");

    const STRIP = { x: 0, y: 66, w: PIC.w, h: 50 };
    const strip = L8.strip(pic, { ...STRIP, fs: 28 });
    const parts = rows.map((r) => ({ text: r.name, v: r.p, tone: "grey" }));
    const geo = strip.update({ parts, k: 1 }); // only to read where the slices sit
    const hit = pic.appendChild(
      V.h("div", {
        class: "v-gene c-orange solid",
        text: rows[win].name,
        style: {
          ...box(geo.lefts[win], STRIP.y, geo.widths[win], STRIP.h),
          fontSize: "28px",
          borderRadius: "22px",
          visibility: "hidden",
        },
      }),
    );
    const FACE = 4; // the face the dice lands on (any face will do: it only says "a random number")
    const diceSvg = L5.svg(pic, PIC.w, PIC.h);
    const dice = [1, 2, 3, 4, 5, 6].map((f) => diceSvg.appendChild(L5.dice(36, 31, 50, { face: f, tone: "orange" })));
    const T = { strip: [0.1, 0.7], dice: [0.7, 1.0], roll: [1.0, 1.7], rate: 12, drop: [1.7, 2.3], win: [2.4, 2.7] };

    return (q) => {
      const sk = ramp(q, ...T.strip, E.lin);
      strip.update({ parts, k: sk, marker: draw.u, markerK: ramp(q, ...T.drop, E.lin) });
      const rolling = q >= T.roll[0] && q < T.roll[1];
      const face = rolling ? 1 + (Math.floor((q - T.roll[0]) * T.rate) % 6) : q >= T.roll[1] ? FACE : 1;
      const calm = rolling ? 1 - ramp(q, T.roll[1] - 0.25, T.roll[1], E.lin) : 0; // the shake dies away before it lands
      const dk = ramp(q, ...T.dice, E.lin);
      dice.forEach((d, i) =>
        V.place(d, {
          r: 10 * Math.sin(24 * q) * calm,
          y: -6 * Math.abs(Math.sin(12 * (q - T.roll[0]))) * calm,
          s: (0.6 + 0.4 * E.pop(dk)) * (1 + 0.12 * flash(q, T.roll[1], T.roll[1] + 0.3)),
          o: i + 1 === face ? clamp(dk * 3) : 0,
        }),
      );
      V.place(hit, { o: ramp(q, ...T.win, E.lin), s: 1 + 0.06 * flash(q, T.win[0], T.win[1] + 0.2) });
    };
  }

  // ---------- row 3: evaporate, then add Q / L ----------
  function trailRow(pic) {
    const LG = L8.LEDGER;
    const [evap, delta, next] = [(1 - LG.rho) * LG.tau, LG.deps.reduce((a, b) => a + b, 0), LG.next];
    L8.same([evap, delta, next], [2, 7, 9], "recap row 3: 2 + 7 = 9");
    L8.same(L8.nextTau(LG.tau, LG.rho, LG.deps), next, "recap row 3: the update rule gives the new trail");
    L8.same(LG.tau - evap, 2, "recap row 3: two of the four old blocks evaporate");
    L8.same(evap + delta, 9, "recap row 3: nine slots");
    const KEEP = evap;
    L8.same(LG.tau - KEEP, LG.lost, "recap row 3: the blocks that evaporate");
    const slotX = (i) => 8 + 36 * i;
    const mk = (i, tone) => L8.chip(pic, { x: slotX(i), y: 72, w: 28, h: 56, text: "", tone, radius: 8 });
    const blue = Array.from({ length: LG.tau }, (_, i) => mk(i, "blue"));
    const green = Array.from({ length: delta }, (_, g) => mk(KEEP + g, "green"));

    // the new trail 2 + 7 = 9, the plus and equals drawn as strokes (never glyphs)
    const sym = (kind) => {
      const svg = V.s("svg", { width: 30, height: 30, viewBox: "0 0 30 30", style: { display: "block" } });
      svg.append(L8.mark(kind, 15, 15, 30, "blue"));
      return svg;
    };
    const tag = V.h("div", {
      class: "v-tag c-blue",
      style: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "32px",
        lineHeight: "1.2",
      },
    });
    tag.append(
      V.h("span", { text: String(evap) }),
      sym("plus"),
      V.h("span", { text: String(delta) }),
      sym("equals"),
      V.h("span", { text: String(next) }),
    );
    const bar = V.h("div", {
      style: { ...box(0, 0, PIC.w, 56), display: "flex", justifyContent: "center", alignItems: "center" },
    });
    bar.append(tag);
    pic.append(bar);
    const T = { pop: 0.1, popStep: 0.08, red: 0.85, go: [1.0, 1.4], green: 1.4, greenStep: 0.1, tag: 2.25 };

    return (q) => {
      blue.forEach((b, i) => {
        const k = L8.seq(q, T.pop, T.popStep, 0.35, i);
        if (i < KEEP) return b.set({ solid: true, k });
        const gone = ramp(q, ...T.go, E.in);
        b.set({
          solid: true,
          tone: q >= T.red ? "red" : "blue",
          k,
          s: 1 + 0.1 * flash(q, T.red, T.red + 0.4),
          y: -30 * gone,
          o: 1 - gone,
        });
      });
      green.forEach((b, g) => {
        const k = L8.seq(q, T.green, T.greenStep, 0.35, g);
        b.set({ solid: true, k, y: -(1 - E.out(k)) * 14 });
      });
      const tk = ramp(q, T.tag, T.tag + 0.4, E.lin);
      V.place(tag, { s: L8.popOf({ k: tk }), o: L8.fadeOf({ k: tk }) });
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
        ["blue", "Build tours, then\nupdate the trails", loopRow],
        ["orange", "Trail times closeness,\nthen roll the dice", diceRow],
        ["green", "Evaporate, then add\nQ over tour length", trailRow],
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
