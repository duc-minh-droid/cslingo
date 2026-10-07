/* Lecture 1 video, scene 09-apps.
   Beat 1: three candidates go into a black-box "fitness function" (orange sticker with a dial); each comes out as a bar and a
   score (the number of green tiles, counted in code); the best is ringed and kept. Beat 2: six application areas pop in as
   pictograms (L1.picto). Everything is a pure function of the scene's local time t. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { h, s, place, ramp, ease: E, flash, show } = V;
  const px = (n) => `${n}px`;
  const abs = (x, y, w, hh) => ({ left: px(x), top: px(y), width: px(w), height: px(hh) });

  // ---------- data ----------
  const CANDS = ["010010", "111010", "110111"];
  const SCORES = CANDS.map((c) => [...c].filter((b) => b === "1").length);
  const BAR_LEN = SCORES.map((n) => Math.round((n / 6) * 230));
  if (SCORES.join() !== "2,4,5" || BAR_LEN.join() !== "77,153,192") throw new Error("scene 09: scores changed");
  const AREAS = [
    ["planning", "Planning"],
    ["design", "Design"],
    ["simulation", "Simulation"],
    ["identification", "Identification"],
    ["control", "Control"],
    ["classification", "Classification"],
  ];

  // ---------- timeline (local seconds) ----------
  const SCORE_AT = (k) => 1.3 + k;
  const KEEP_AT = 4.3;
  const B1_OUT = [4.7, 5.2];
  const TILE_AT = (i) => 5.4 + 0.7 * i;
  const BOB_AT = 9.0;

  // ---------- layout (stage px) ----------
  const CARD_Y = (k) => 70 + 140 * k;
  const ROW_C = (k) => CARD_Y(k) + 50;
  const BOX = { x: 380, y: 130, w: 220, h: 200 };
  const BAR_X = 660;

  const tile = (on, size, x, y) =>
    h("div", {
      class: on ? "c-green" : "c-grey",
      style: {
        position: "absolute",
        ...abs(x, y, size, size),
        boxSizing: "border-box",
        borderRadius: px(Math.round(size * 0.24)),
        border: `${size > 30 ? 3 : 2}px solid ${on ? "var(--c-lip)" : "var(--c-edge)"}`,
        background: on ? "var(--c)" : "var(--panel-2)",
        boxShadow: `0 ${size > 30 ? 3 : 2}px 0 ${on ? "var(--c-lip)" : "var(--c-edge)"}`,
      },
    });

  V.scene({
    kicker: "APPLICATIONS",
    title: ["If you can score it,", "you can evolve it"],
    dur: 12,
    caps: [
      [0.4, 5, "An EA only needs a score for each candidate."],
      [5.4, 8.6, "Six areas, one requirement: you can score it."],
      [8.8, 11.5, "Anything you can score, you can evolve."],
    ],
    build(stage) {
      // ---------- beat 1 ----------
      const b1 = h("div", { style: { position: "absolute", ...abs(0, 0, 936, 640) } });
      stage.append(b1);
      const cards = CANDS.map((c, k) => {
        const card = h("div", { class: "v-card plain", style: abs(0, CARD_Y(k), 330, 100) });
        [...c].forEach((b, j) => card.append(tile(b === "1", 44, 13 + 52 * j - 3, 28 - 3)));
        b1.append(card);
        return card;
      });
      const box = h("div", {
        class: "v-card c-orange",
        style: {
          ...abs(BOX.x, BOX.y, BOX.w, BOX.h),
          background: "var(--c)",
          borderColor: "var(--c-lip)",
          boxShadow: "0 6px 0 var(--c-lip)",
        },
      });
      b1.append(box);
      const gg = L1.gauge(box, { x: (BOX.w - 6 - 120) / 2, y: 14, w: 120, on: true });
      box.append(
        h("div", {
          html: "fitness<br>function",
          style: {
            position: "absolute",
            left: "0px",
            top: "100px",
            width: px(BOX.w - 6),
            textAlign: "center",
            font: "900 32px/1.2 var(--sans)",
            color: "var(--c-on)",
          },
        }),
      );
      const copies = CANDS.map((c, k) => {
        const g = h("div", { style: { position: "absolute", ...abs(165 - 76, ROW_C(k) - 11, 152, 22) } });
        [...c].forEach((b, j) => g.append(tile(b === "1", 22, 26 * j, 0)));
        b1.append(g);
        return g;
      });
      const bars = SCORES.map((n, k) => {
        const bar = h("div", {
          class: "c-green",
          style: {
            position: "absolute",
            left: px(BAR_X),
            top: px(ROW_C(k) - 20),
            width: px(BAR_LEN[k]),
            height: "40px",
            boxSizing: "border-box",
            border: "3px solid var(--c-lip)",
            borderRadius: "12px",
            background: "var(--c)",
            boxShadow: "0 4px 0 var(--c-lip)",
            transformOrigin: "0 50%",
          },
        });
        const num = h("div", {
          text: String(n),
          style: {
            position: "absolute",
            left: px(BAR_X + BAR_LEN[k] + 12),
            top: px(ROW_C(k) - 20),
            font: "900 32px/40px var(--sans)",
            color: "var(--teal-ink)",
          },
        });
        const pk = h("div", {
          class: "c-green",
          style: {
            position: "absolute",
            ...abs(0, 0, 22, 22),
            borderRadius: "50%",
            background: "var(--c)",
            border: "3px solid var(--c-lip)",
            boxSizing: "border-box",
          },
        });
        b1.append(bar, num, pk);
        return { bar, num, pk };
      });
      const ring = h("div", {
        style: {
          position: "absolute",
          ...abs(BAR_X - 12, ROW_C(2) - 32, BAR_LEN[2] + 12 + 70, 64),
          boxSizing: "border-box",
          border: "5px solid var(--amber)",
          borderRadius: "18px",
        },
      });
      const keep = h(
        "div",
        { class: "v-tag c-green", style: { left: px(BAR_X), top: px(ROW_C(2) + 40), paddingLeft: "46px" } },
        "keep",
      );
      const tk = s("svg", {
        width: 30,
        height: 30,
        style: { position: "absolute", left: "10px", top: "7px", overflow: "visible" },
      });
      tk.append(L5.tick(15, 15, 30, "green", { ink: true, w: 5 }));
      keep.append(tk);
      b1.append(ring, keep);

      // ---------- beat 2 ----------
      const tiles = AREAS.map(([kind, name], i) => {
        const t = h("div", {
          class: "v-card plain c-blue",
          style: abs(320 * (i % 3), 20 + 270 * Math.floor(i / 3), 296, 230),
        });
        const p = L1.picto(kind, 140, { x: 78 - 3, y: 14 - 3 });
        t.append(
          p,
          h("div", {
            text: name,
            style: {
              position: "absolute",
              left: "0px",
              top: "166px",
              width: "290px",
              textAlign: "center",
              font: "900 32px/1.2 var(--sans)",
              color: "var(--ink)",
            },
          }),
        );
        stage.append(t);
        return t;
      });
      void s;

      return (t) => {
        // beat 1 in / out
        show(b1, 1 - ramp(t, B1_OUT[0], B1_OUT[1], E.lin));
        cards.forEach((c, k) => {
          const p = ramp(t, 0.3 + 0.15 * k, 0.8 + 0.15 * k, E.pop);
          place(c, { s: 0.6 + 0.4 * p, o: p > 0.001 ? Math.min(1, p * 2) : 0 });
        });
        const pb = ramp(t, 0.55, 1.05, E.pop);
        let pulse = 0;
        SCORES.forEach((n, k) => {
          const a = SCORE_AT(k);
          pulse = Math.max(pulse, flash(t, a + 0.3, a + 0.6));
          // copy slides into the box
          const sl = ramp(t, a, a + 0.35, E.inOut);
          place(copies[k], {
            x: 325 * sl,
            y: (230 - ROW_C(k)) * sl,
            s: 1 - 0.4 * sl,
            o: t < a ? 0 : 1 - ramp(t, a + 0.25, a + 0.4, E.lin),
          });
          // packet to the bar slot
          const pf = ramp(t, a + 0.45, a + 0.75, E.inOut);
          const pk = bars[k].pk;
          pk.style.left = px(600 - 11 + (BAR_X - 600) * pf + 11);
          pk.style.top = px(230 - 11 + (ROW_C(k) - 230) * pf);
          show(pk, t < a + 0.45 ? 0 : 1 - ramp(t, a + 0.7, a + 0.85, E.lin));
          // bar and number
          const g = ramp(t, a + 0.65, a + 1.05, E.out);
          place(bars[k].bar, { o: g > 0 ? 1 : 0 });
          bars[k].bar.style.transform = `scaleX(${Math.max(0.001, g)})`;
          const np = ramp(t, a + 0.95, a + 1.35, E.pop);
          place(bars[k].num, { s: np, o: np > 0.001 ? 1 : 0 });
        });
        // needle: holds the previous score until the next candidate arrives
        let nd = 0;
        SCORES.forEach((n, k) => {
          nd = V.lerp(nd, n / 6, ramp(t, SCORE_AT(k) + 0.3, SCORE_AT(k) + 0.65, E.inOut));
        });
        gg.set(nd);
        place(box, { s: 0.6 + 0.4 * pb + 0.04 * pulse, o: pb > 0.001 ? Math.min(1, pb * 2) : 0 });
        const kp = ramp(t, KEEP_AT, KEEP_AT + 0.4, E.pop);
        place(ring, { s: 0.9 + 0.1 * kp, o: kp > 0.001 ? Math.min(1, kp * 2) : 0 });
        place(keep, { s: kp, o: kp > 0.001 ? 1 : 0 });
        L5.drawOn(tk.firstChild, ramp(t, KEEP_AT + 0.25, KEEP_AT + 0.6, E.lin));
        // beat 2
        tiles.forEach((el, i) => {
          const p = ramp(t, TILE_AT(i), TILE_AT(i) + 0.5, E.pop);
          place(el, {
            s: p,
            y: -6 * flash(t, BOB_AT + 0.05 * i, BOB_AT + 0.05 * i + 0.4),
            o: p > 0.001 ? Math.min(1, p * 2) : 0,
          });
        });
      };
    },
  });
})();
