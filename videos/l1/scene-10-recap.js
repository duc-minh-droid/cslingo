/* Lecture 1 · What is NIC?, scene 10-recap: three rows, each a small animated pictogram and one bold line.
   Story (local seconds): 0.1 title and Sprout, 0.8 / 1.8 / 2.8 the three rows slide in, 6.4 the call to action pops in.
   Row 1 (green): Q Z T with three pips; tile 1 flips to C (1.7), tile 2 to A (2.6), all turn green with a tick (3.1).
   Row 2 (blue): the landscape draws in, the star pops, six dots replay the first five generations of popRun(40, 6, 5).
   Row 3 (orange): a candidate 110111 sends a packet along an arrow into the gauge; the needle swings to 5/6, the bar fills. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });

  const CARD = { x: 72, w: 936, h: 192, tops: [236, 448, 660] };
  const APPEAR = [0.8, 1.8, 2.8];
  const PIC = { x: 16, y: 10, w: 376, h: 140, zoom: 1.1 };

  // ---------- row 1: Q Z T becomes C A T ----------
  function keepWhatWorks(pic) {
    const { start, target } = L1.CAT;
    if (start !== "QZT" || target !== "CAT") throw new Error("recap: unexpected CAT data");
    const flips = [
      { i: 0, at: 1.7, to: "C" },
      { i: 1, at: 2.6, to: "A" },
    ];
    const G = 3.1; // all green
    const grid = L1.letterGrid(pic, { text: start, cols: 3, size: 56, gap: 10, x: 14, y: 20, tone: "blue" });
    const pips = L1.pips(pic, { n: 3, size: 26, gap: 30, x: 31, y: 98 });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const tick = svg.appendChild(L5.tick(300, 48, 60, "green", { ink: true, w: 10 }));
    const row = grid.rows[0];
    const word = (t) => [...start].map((c, i) => flips.reduce((s, f) => (f.i === i && t >= f.at + 0.3 ? f.to : s), c));
    return (t) => {
      const cur = word(t);
      const flags = cur.map((c, i) =>
        c === target[i]
          ? ramp(t, flips.find((f) => f.i === i)?.at + 0.3 || 1.3, flips.find((f) => f.i === i)?.at + 0.6 || 1.6, E.lin)
          : 0,
      );
      pips(flags, ramp(t, 1.2, 1.7, E.lin));
      for (let i = 0; i < 3; i++) {
        const born = ramp(t, 1.2 + 0.08 * i, 1.2 + 0.08 * i + 0.5, E.lin);
        const fl = flips.find((f) => f.i === i);
        const gt = G + 0.1 * i;
        const base = {
          s: E.pop(born) * (1 + 0.14 * flash(t, gt, gt + 0.35)),
          o: clamp(born * 4),
          y: -(1 - E.out(born)) * 14,
        };
        const tone = t >= gt ? "green" : "blue";
        if (fl) {
          const k = ramp(t, fl.at, fl.at + 0.6, E.lin);
          row.flip(i, k, {
            ...base,
            from: start[i],
            to: fl.to,
            tone: t >= gt ? "green" : "blue",
            toTone: t >= gt ? "green" : t < fl.at + 0.9 ? "purple" : "blue",
            hop: 12,
          });
        } else row.set(i, { ...base, tone });
      }
      L5.drawOn(tick, ramp(t, G + 0.5, G + 0.95, E.lin));
      V.place(tick, { s: 0.7 + 0.3 * E.pop(ramp(t, G + 0.5, G + 0.95, E.lin)), o: ramp(t, G + 0.5, G + 0.6) });
    };
  }

  // ---------- row 2: a population climbs the landscape ----------
  function populationClimbs(pic) {
    const run = L1.popRun(40, 6, 5, { rec: true });
    if (L1.avgPct(run[5].pop) < 90) throw new Error("recap: the population should end near the top");
    const T0 = 3.6;
    const STEP = 0.55;
    const ls = L1.landscape(pic, { x: 0, w: PIC.w, base: 126, peak: 40, star: 32 });
    const kids = Array.from({ length: 6 }, () => ls.dot({ tone: "blue", r: 8 }));
    const olds = Array.from({ length: 6 }, () => ls.dot({ tone: "blue", r: 8 }));
    return (t) => {
      ls.set({ k: ramp(t, 2.0, 3.0, E.lin), star: ramp(t, 2.9, 3.5, E.lin), starPulse: flash(t, 6.2, 6.8), o: 1 });
      const born = ramp(t, 3.2, 3.7, E.lin);
      const g = clamp(Math.floor((t - T0) / STEP), -1, 4); // generation being drawn (index into run - 1), -1 = before
      const u = clamp((t - T0 - g * STEP) / STEP);
      const moving = t >= T0 && t < T0 + 5 * STEP;
      const gen = moving ? g + 1 : t < T0 ? 0 : 5;
      kids.forEach((d, k) => {
        const pop = run[gen].pop;
        const st = { s: E.pop(clamp(born - 0.06 * k)), o: clamp(born * 4) };
        if (moving) {
          const sp = L1.sprout(
            run[gen - 1].pop,
            run[gen].pop,
            run[gen].info.map((c) => c.p1),
            u,
          );
          d.set({ i: sp.kids[k].i, o: sp.kids[k].o, s: 1 });
        } else d.set({ i: pop[k], ...st });
      });
      olds.forEach((d, j) => {
        if (moving) {
          const sp = L1.sprout(
            run[gen - 1].pop,
            run[gen].pop,
            run[gen].info.map((c) => c.p1),
            u,
          );
          d.set({ i: sp.olds[j].i, o: sp.olds[j].o, s: 1 });
        } else d.set({ i: run[gen].pop[j], o: 0 });
      });
    };
  }

  // ---------- row 3: a candidate is scored ----------
  function scoreIt(pic) {
    const BITS = "110111";
    const score = [...BITS].filter((b) => b === "1").length;
    if (score !== 5) throw new Error("recap: 110111 should score 5 of 6");
    const frac = score / BITS.length;
    const SIZE = 40;
    const GAP = 4;
    const row = L5.chromosome(pic, {
      x: 6,
      y: 22,
      genes: [...BITS],
      size: SIZE,
      gap: GAP,
      tones: [...BITS].map((b) => (b === "1" ? "blue" : "grey")),
    });
    row.tiles.forEach((tile) => Object.assign(tile.style, { fontSize: "26px", borderRadius: "12px" }));
    const rowW = row.width;
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const arrow = svg.appendChild(L5.arrow(rowW + 10, 42, rowW + 38, 42, "grey", 1, { w: 6, head: 16 }));
    const gg = L1.gauge(pic, { x: rowW + 42, y: 4, w: 76, on: false });
    const packet = pic.appendChild(
      V.h("div", {
        class: "v-gene c-blue",
        text: "1",
        style: { ...box(rowW + 6, 22, 40, 40), fontSize: "26px", borderRadius: "12px" },
      }),
    );
    const TRACK = { x: 6, y: 96, w: 340, h: 26 };
    const track = pic.appendChild(
      V.h("div", {
        style: {
          ...box(TRACK.x, TRACK.y, TRACK.w, TRACK.h),
          borderRadius: "13px",
          boxSizing: "border-box",
          background: "var(--panel)",
          border: "3px solid var(--amber-lip)",
          overflow: "hidden",
        },
      }),
    );
    const fill = track.appendChild(
      V.h("div", { style: { position: "absolute", left: "0", top: "0", height: "100%", background: "var(--teal)" } }),
    );
    const T = { tiles: 3.2, arrow: 3.9, gauge: 4.0, go: 4.6, swing: 5.3 };
    return (t) => {
      row.all((i) => {
        const p = ramp(t, T.tiles + 0.07 * i, T.tiles + 0.07 * i + 0.45, E.lin);
        return { y: -(1 - E.out(p)) * 14, s: E.pop(p), o: clamp(p * 4) };
      });
      L5.drawOn(arrow, ramp(t, T.arrow, T.arrow + 0.4, E.lin));
      const gk = ramp(t, T.gauge, T.gauge + 0.5, E.lin);
      const swing = ramp(t, T.swing, T.swing + 0.9, E.out);
      gg.set(frac * swing, { s: 0.7 + 0.3 * E.pop(gk), o: clamp(gk * 4) });
      const d = clamp((t - T.go) / 0.7);
      const e = E.inOut(d);
      V.place(packet, {
        x: lerp(0, 52, e),
        y: 0,
        s: (1 - 0.5 * ramp(d, 0.8, 1, E.lin)) * (t < T.go ? 0 : 1),
        o: t < T.go ? 0 : Math.min(ramp(t, T.go, T.go + 0.1, E.lin), 1 - ramp(d, 0.9, 1, E.lin)),
      });
      const bk = ramp(t, T.swing, T.swing + 0.9, E.out);
      V.show(track, ramp(t, T.gauge, T.gauge + 0.4, E.lin));
      fill.style.width = `${f1(Math.max(0, frac * bk * (TRACK.w - 6)))}px`;
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
        ["green", "Copy nature:\nkeep what works", keepWhatWorks],
        ["blue", "Population, selection,\nmutation, recombination", populationClimbs],
        ["orange", "Can you score it?\nThen you can evolve it", scoreIt],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", {
          class: `v-card plain c-${tone}`,
          style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h),
        });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "186px",
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
        text: "Beat the Lecture 1 boss quiz",
        style: { position: "relative", fontSize: "34px", padding: "8px 30px 10px" },
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
        V.place(cta, { s: 0.8 + 0.2 * ramp(t, 6.4, 6.9, E.pop), o: ramp(t, 6.4, 6.7) });
      };
    },
  });
})();
