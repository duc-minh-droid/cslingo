/* Lecture 1 · What is NIC?, scene 06-selection: weak selection bias. Parents A-D with fitness 9, 6, 3, 1 are picked in
   proportion to fitness (20 seeded picks); then the same 20 tokens show "only the best" and "equal chances" for contrast. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  const FIT = [9, 6, 3, 1];
  const NAMES = ["A", "B", "C", "D"];
  const CX = [117, 351, 585, 819];
  const BASE = 262;
  const UNIT = 20;
  const BIN = { y: 394, w: 150, h: 180 };
  const NPICK = 20;
  const PICKS = L1.picks(46, FIT, NPICK);
  const COUNTS = L1.countPicks(PICKS, 4);
  const WEAK_PCT = L1.chancesRounded(FIT);
  const STATES = {
    weak: { pct: WEAK_PCT },
    strong: { pct: [100, 0, 0, 0] },
    none: { pct: [25, 25, 25, 25] },
  };
  // timeline
  const PICK0 = 2.8;
  const PICK_DT = 0.16;
  const FALL = 0.35;
  const SW = { strong: 6.2, none: 8.2, weak: 10.1 }; // when each morph starts
  const MORPH = 0.5;
  const STAG = 0.2; // extra delay spread over the 20 tokens
  const D_TOKEN = PICKS.indexOf(3);

  // build-time checks of every quoted number
  const need = (c, m) => {
    if (!c) throw new Error(`scene 06: ${m}`);
  };
  need(FIT.reduce((a, b) => a + b, 0) === 19, "total 19");
  need(WEAK_PCT.join() === "47,32,16,5", "chips 47 32 16 5");
  need(PICKS.map((p) => NAMES[p]).join("") === "ACACAABABBBABDABCAAA", "pick sequence");
  need(COUNTS.join() === "10,6,3,1", "counts 10 6 3 1");
  need(D_TOKEN === 13, "D is picked at pick 14");

  // slots: bin and rank (0 = bottom row) of every token in each state
  const rankIn = (bins) => bins.map((b, j) => bins.slice(0, j).filter((x) => x === b).length);
  const SLOT = {
    weak: PICKS.map((b, j) => ({ b, r: rankIn(PICKS)[j] })),
    strong: PICKS.map((_, j) => ({ b: 0, r: j })),
    none: PICKS.map((_, j) => ({ b: j % 4, r: Math.floor(j / 4) })),
  };
  const slotXY = ({ b, r }) => [CX[b] + ((r % 4) - 1.5) * 34, BIN.y + BIN.h - 23 - Math.floor(r / 4) * 34];
  need(slotXY(SLOT.strong[19])[1] > BIN.y + 8, "20 tokens fit in one bin");

  const px = (n) => `${n.toFixed(1)}px`;
  const abs = (x, y, w, h) => ({ position: "absolute", left: px(x), top: px(y), width: px(w), height: px(h) });

  V.scene({
    kicker: "INGREDIENT 2",
    title: ["Fitter parents are", "likelier, not certain"],
    dur: 12,
    caps: [
      [0.4, 2.6, "Four parents with fitness 9, 6, 3 and 1."],
      [2.8, 6, "Fitter parents are likelier to be picked, 20 times."],
      [6.2, 8, "Only the best? Everyone becomes a copy."],
      [8.2, 10, "Equal chances? Nothing pushes towards better."],
      [10.1, 11.5, "Weak bias: fitter is likelier, nobody is shut out."],
    ],
    build(stage) {
      const svgIcon = (kind) =>
        V.s(
          "svg",
          { width: 34, height: 34, viewBox: "0 0 34 34", style: { flex: "none" } },
          kind === "tick"
            ? L5.tick(17, 17, 28, "green", { on: true, w: 5 })
            : L5.cross(17, 17, 28, "red", { on: true, w: 5 }),
        );
      // verdict tags (top centre)
      const verdict = (text, tone, icon, w) => {
        const e = V.h(
          "div",
          {
            class: `v-tag solid c-${tone}`,
            style: {
              ...abs(468 - w / 2, 12, w, 52),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "0 12px",
            },
          },
          svgIcon(icon),
          V.h("span", { text }),
        );
        stage.append(e);
        return e;
      };
      const picks = L1.chip(stage, `${NPICK} picks`, "orange", { x: 790, y: 12, width: 146 });
      const vWeak = verdict("weak bias", "green", "tick", 250);
      const vStrong = verdict("only the best", "red", "cross", 300);
      const vNone = verdict("equal chances", "red", "cross", 310);

      // columns: bar, number, letter tile, chip, bin
      const cols = CX.map((cx, i) => {
        const bin = V.h("div", {
          style: {
            ...abs(cx - BIN.w / 2, BIN.y, BIN.w, BIN.h),
            boxSizing: "border-box",
            border: "3px dashed var(--line-2)",
            borderRadius: "20px",
          },
        });
        const bar = V.h("div", { class: "v-gene solid c-blue", style: { borderRadius: "18px", fontSize: "0" } });
        const num = V.h("div", {
          class: "v-text big",
          text: String(FIT[i]),
          style: { ...abs(cx - 60, 0, 120, 53), textAlign: "center" },
        });
        const tile = V.h("div", {
          class: "v-gene c-blue",
          text: NAMES[i],
          style: { ...abs(cx - 33, 268, 66, 66), fontSize: "38px", borderRadius: "16px" },
        });
        const ring = V.h("div", {
          style: {
            ...abs(cx - 33 - 9, 268 - 9, 84, 84),
            boxSizing: "border-box",
            border: "5px solid var(--amber)",
            borderRadius: "24px",
          },
        });
        const chip = L1.chip(stage, "", "grey", { x: cx - 60, y: 342, width: 120 });
        chip.style.height = "50px";
        stage.append(bin, bar, num, ring, tile, chip);
        return { cx, bin, bar, num, tile, ring, chip };
      });

      // tokens
      const tokens = PICKS.map((p, j) => {
        const el = V.h("div", {
          style: {
            ...abs(0, 0, 28, 28),
            boxSizing: "border-box",
            borderRadius: "50%",
            background: "var(--amber)",
            border: "3px solid var(--amber-lip)",
            boxShadow: "0 3px 0 var(--amber-lip)",
          },
        });
        const ring = V.h("div", {
          style: {
            ...abs(0, 0, 28, 28),
            boxSizing: "border-box",
            borderRadius: "50%",
            border: "5px solid var(--amber)",
          },
        });
        stage.append(el, ring);
        return { p, el, ring };
      });

      const bar3 = L1.ingredientBar(stage, { y: 588 });

      const pos = (j, t) => {
        // returns [x, y, opacity] of token j at time t
        const t0 = PICK0 + PICK_DT * j;
        if (t < t0) return [0, 0, 0];
        const home = slotXY(SLOT.weak[j]);
        const start = [CX[PICKS[j]], 402];
        const kf = ramp(t, t0, t0 + FALL, E.inOut);
        let [x, y] = [lerp(start[0], home[0], kf), lerp(start[1], home[1], kf)];
        y -= 5 * Math.sin(Math.PI * ramp(t, t0 + FALL, t0 + FALL + 0.2, E.lin));
        const order = ["weak", "strong", "none", "weak"];
        const times = [0, SW.strong, SW.none, SW.weak];
        for (let m = 1; m < 4; m++) {
          const a0 = times[m] + (STAG * j) / (NPICK - 1);
          const k = ramp(t, a0, a0 + MORPH, E.inOut);
          if (k <= 0) break;
          const [fx, fy] = slotXY(SLOT[order[m - 1]][j]);
          const [tx, ty] = slotXY(SLOT[order[m]][j]);
          x = lerp(fx, tx, k);
          y = lerp(fy, ty, k) - 28 * Math.sin(Math.PI * k);
        }
        return [x, y, ramp(t, t0, t0 + 0.12, E.lin)];
      };

      const pctAt = (t, i) => {
        let from = WEAK_PCT[i];
        const seq = [
          [SW.strong, STATES.strong.pct[i]],
          [SW.none, STATES.none.pct[i]],
          [SW.weak, WEAK_PCT[i]],
        ];
        for (const [a, to] of seq) {
          const k = ramp(t, a, a + 0.6, E.inOut);
          if (k > 0) from = lerp(from, to, k);
          else break;
          if (k < 1) break;
          from = to;
        }
        return from;
      };

      return (t) => {
        const barIn = (i) => ramp(t, 0.3 + 0.12 * i, 1.0 + 0.12 * i, E.out);
        const chipIn = (i) => ramp(t, 1.4 + 0.2 * i, 1.8 + 0.2 * i, E.pop);
        cols.forEach((c, i) => {
          const k = barIn(i);
          const h = FIT[i] * UNIT * k;
          V.show(c.bar, k);
          Object.assign(c.bar.style, {
            left: px(c.cx - 60),
            top: px(BASE - h),
            width: "120px",
            height: px(Math.max(h, 1)),
          });
          V.place(c.num, { y: BASE - h - 56, o: k });
          // pulse: when this parent is picked, and when the strong state boosts A
          let pulse = 0;
          PICKS.forEach((p, j) => {
            if (p === i) pulse = Math.max(pulse, flash(t, PICK0 + PICK_DT * j, PICK0 + PICK_DT * j + 0.2));
          });
          const barPulse = i === 0 ? flash(t, SW.strong + 0.1, SW.strong + 0.6) : 0;
          const tin = ramp(t, 0.4 + 0.12 * i, 1.0 + 0.12 * i, E.pop);
          V.place(c.tile, { s: (0.6 + 0.4 * tin) * (1 + 0.12 * pulse), o: Math.min(1, tin * 3) });
          V.place(c.ring, { s: 1 + 0.06 * pulse, o: Math.min(1, pulse * 2.5) });
          c.bar.style.transform = `scale(${(1 + 0.05 * barPulse).toFixed(3)})`;
          c.bar.style.transformOrigin = "50% 100%";
          const ci = chipIn(i);
          c.chip.textContent = `${Math.round(pctAt(t, i))}%`;
          c.chip.className = `v-tag c-${pulse > 0.3 ? "orange" : "grey"}`;
          V.place(c.chip, { s: (0.7 + 0.3 * ci) * (1 + 0.12 * pulse), o: Math.min(1, ci * 3) });
          V.show(c.bin, ramp(t, 2.4, 2.8, E.lin));
        });
        tokens.forEach((q, j) => {
          const [x, y, o] = pos(j, t);
          V.place(q.el, { x: x - 14, y: y - 14, o });
          // the lone D token gets one expanding orange ring at 6.0 and again at 10.9
          const rr =
            j === D_TOKEN ? Math.max(ramp(t, 6.0, 6.5, E.lin) * (t < 6.5 ? 1 : 0), ramp(t, 10.9, 11.4, E.lin)) : 0;
          V.place(q.ring, { x: x - 14, y: y - 14, s: 1 + 1.1 * rr, o: rr > 0 && rr < 1 ? 1 - rr : 0 });
        });
        // verdict tags
        const pop = (a) => ramp(t, a, a + 0.4, E.pop);
        const win = (a, b) => Math.min(pop(a), 1 - ramp(t, b, b + 0.15, E.lin));
        const set = (el, k) => V.place(el, { s: 0.8 + 0.2 * Math.min(1, k), o: Math.min(1, k * 3) });
        set(vStrong, win(SW.strong, 8.05));
        set(vNone, win(SW.none, 9.9));
        set(vWeak, pop(SW.weak));
        V.place(picks, { s: 0.8 + 0.2 * pop(PICK0 - 0.2), o: Math.min(1, pop(PICK0 - 0.2) * 3) });
        bar3(["done", "active", "off"], ramp(t, 0.3, 1.1, E.lin));
      };
    },
  });
})();
