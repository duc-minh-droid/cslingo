/* Lecture 9 (ds-9) · scene 5 (AN EPOCH): an epoch is one forward pass (predict every training trip, measure the error) and one
   backward pass (turn the errors into the gradient) over ALL the training data. Full batch learning uses all of it, so it gets
   the true gradient and makes exactly ONE update per epoch (lesson 9.1 steps 5-7). Four trips in a table (trip, real minutes,
   predicted, error); a blue arrow runs the forward pass down the rows, an orange arrow runs the backward pass back up, the four
   errors fly into one gradient, one update moves w from 6 to 5.1, then epoch 2 takes it to 4.605. Every number comes from
   D9.EPOCH (asserted on load). Colours: purple = the trips (data), blue = the model's w and its predictions, red = the errors,
   orange = the gradient and the update step, green = all the data / the true gradient, grey = the epoch counter.
   Story (local seconds): 0.3 rows pop; 1.3 forward pass, predictions and errors row by row; 3.5 backward pass, errors fly into
   the gradient (4.3); 5.4 the update, 6.0 w = 5.1, 6.2 counter; 6.6 epoch 2 values, 7.8 w = 4.605; 9.6 all the data. */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const EP = D9.EPOCH;
  const [e1, e2] = EP.epochs;
  const fm = D9.fm;

  D9.same(
    "epoch scene: four trips, w 6, learning rate 0.05, gradient 18 then 9.9, w 5.1 then 4.605",
    [EP.trips.length, EP.w0, EP.eta, e1.grad, fm(e1.nw), e2.w, fm(e2.grad), fm(e2.nw, 3)],
    [4, 6, 0.05, 18, "5.1", e1.nw, "9.9", "4.605"],
  );

  const T = { rows: 0.3, fwd: 1.3, pred: 1.5, predStep: 0.45, back: 3.5, grad: 4.3, sum: 5.4, w1: 6.0, cnt1: 6.2 };
  Object.assign(T, { flip2: 6.6, grad2: 7.2, sum2: 7.4, w2: 7.8, all: 9.6, allTag: 10.0 });

  // geometry: four rows of four cells (trip, real, predicted, error), the right panel centred at PX
  const ROW = (i) => 92 + 100 * i;
  const CH = { x: 84, w: 112, h: 72, gap: 12 };
  const colX = (j) => CH.x + j * (CH.w + CH.gap) + CH.w / 2;
  const TABLE_R = CH.x + 4 * CH.w + 3 * CH.gap;
  const AX = { fwd: TABLE_R + 20, back: TABLE_R + 44, top: 80, bot: 466 };
  const PX = 778;

  const sumText = (e) => [`${fm(e.w, 3)} − ${fm(EP.eta)} × ${fm(e.grad, 3)}`, `= ${fm(e.nw, 3)}`];
  const errText = (v) => `+${fm(v, 3)}`;

  V.scene({
    kicker: "AN EPOCH",
    title: ["Full batch: all the data,", "one update"],
    dur: 12,
    caps: [
      [0.4, 1.8, `Four trips; the model starts at w = ${fm(EP.w0)}.`],
      [2, 4, "Forward pass: predict every trip and measure the error."],
      [4.4, 5.6, `Backward pass: the errors make one gradient, ${fm(e1.grad)}.`],
      [5.8, 7.6, `One update: w = ${fm(e1.w)} − ${fm(EP.eta)} × ${fm(e1.grad)} = ${fm(e1.nw)}.`],
      [8, 9.6, `That was one epoch. Epoch 2 takes w to ${fm(e2.nw, 3)}.`],
      [9.8, 11.8, "Full batch uses all the data: the true gradient."],
    ],
    build(stage) {
      // the green "all the data" outline sits behind the table
      const all = D4.card(stage, { x: 8, y: 78, w: TABLE_R + 4, h: 402, tone: "green", plain: true });
      const heads = ["trip", "real", "predicted", "error"].map((text, j) =>
        D4.label(stage, { x: colX(j), y: 50, text, fs: 28, tone: "grey" }),
      );
      const svg = D4.svg(stage);
      const parcels = EP.trips.map((_, i) => svg.appendChild(D9.parcel(44, ROW(i) + CH.h / 2, 48)));
      const rows = EP.trips.map(([km, min], i) =>
        D4.chips(stage, {
          x: CH.x,
          y: ROW(i),
          n: 4,
          w: CH.w,
          h: CH.h,
          gap: CH.gap,
          fs: 30,
          texts: [`${km} km`, `${min} min`, "", ""],
          tones: ["purple", "purple", "blue", "red"],
        }),
      );
      const arrows = D4.svg(stage);
      const fwd = arrows.appendChild(L5.arrow(AX.fwd, AX.top, AX.fwd, AX.bot, "blue", 1, { w: 7 }));
      const back = arrows.appendChild(L5.arrow(AX.back, AX.bot, AX.back, AX.top, "orange", 1, { w: 7 }));
      const fwdLab = D4.label(stage, { x: 150, y: 512, text: "forward pass", fs: 28, tone: "blue" });
      const backLab = D4.label(stage, { x: 430, y: 512, text: "backward pass", fs: 28, tone: "orange" });
      const allTag = D4.tag(stage, {
        x: 296,
        y: 584,
        text: "all the data: the true gradient",
        tone: "green",
        solid: true,
      });

      const wTag = D4.tag(stage, { x: PX, y: 80, text: "", tone: "blue", solid: true, fs: 34 });
      const gTag = D4.tag(stage, { x: PX, y: 236, text: "", tone: "orange", solid: true, fs: 30 });
      const sumCard = D4.card(stage, { x: PX - 140, y: 294, w: 280, h: 116, tone: "orange", plain: true });
      const sumL = [0, 1].map((j) =>
        D4.label(stage, { x: PX, y: 330 + 46 * j, text: "", fs: j ? 32 : 28, tone: "orange" }),
      );
      const cnt = D4.tag(stage, { x: PX, y: 472, text: "", tone: "grey", fs: 28 });
      const flyers = e1.errs.map((v) => D4.tag(stage, { text: errText(v), tone: "red", solid: true, fs: 28 }));

      return (t) => {
        const ep2 = t >= T.flip2 + 0.15; // the flip shows the new value from its half-way point
        // ----- table -----
        rows.forEach((row, i) => {
          const k = D9.seq(t, T.rows, 0.12, 0.45, i);
          const s = 0.7 + 0.3 * E.pop(k);
          V.place(parcels[i], { s, o: Math.min(1, k * 3) });
          row.set(0, { s, o: Math.min(1, k * 3) });
          row.set(1, { s, o: Math.min(1, k * 3) });
          const at = T.pred + T.predStep * i;
          const pf = ramp(t, at, at + 0.3, E.lin);
          const f2 = ramp(t, T.flip2, T.flip2 + 0.3, E.lin);
          const sx = Math.abs(Math.cos(Math.PI * (pf < 1 ? pf : f2)));
          const shown = pf >= 0.5;
          const pred = fm((ep2 ? e2 : e1).preds[i], 3);
          row.set(
            2,
            shown ? { solid: true, text: pred, sx, s } : { ghost: true, text: "", sx, s, o: Math.min(1, k * 3) },
          );
          const ek = ramp(t, at + 0.25, at + 0.6, E.lin);
          const err = errText((ep2 ? e2 : e1).errs[i]);
          const back1 = flash(t, T.back + 0.1 + 0.1 * (3 - i), T.back + 0.4 + 0.1 * (3 - i));
          if (ek <= 0) row.set(3, { ghost: true, text: "", s, o: Math.min(1, k * 3) });
          else
            row.set(3, {
              text: err,
              s: (0.7 + 0.3 * E.pop(ek)) * (1 + 0.1 * back1),
              sx: ek >= 1 ? Math.abs(Math.cos(Math.PI * f2)) : 1,
              ring: back1 > 0.02 ? "red" : null,
              ringK: back1,
            });
        });
        heads.forEach((h, j) => h.set({ k: ramp(t, T.rows + 0.1 * j, T.rows + 0.4 + 0.1 * j, E.lin) }));
        all.set({ k: ramp(t, T.all, T.all + 0.5, E.lin) });
        allTag.set({ k: ramp(t, T.allTag, T.allTag + 0.4, E.lin) });

        // ----- the two passes -----
        // epoch 2 runs both passes again: the arrows sweep a second time
        const again = t >= T.flip2 - 0.1;
        L5.drawOn(
          fwd,
          again
            ? ramp(t, T.flip2 - 0.1, T.flip2 + 0.4, E.inOut)
            : ramp(t, T.fwd, T.pred + T.predStep * 3 + 0.5, E.inOut),
        );
        L5.drawOn(back, again ? ramp(t, T.grad2 - 0.5, T.grad2, E.inOut) : ramp(t, T.back, T.back + 0.8, E.inOut));
        fwdLab.set({ k: ramp(t, T.fwd + 0.2, T.fwd + 0.6, E.lin) });
        backLab.set({ k: ramp(t, T.back + 0.2, T.back + 0.6, E.lin) });
        flyers.forEach((f, i) => {
          const a = T.back + 0.2 + 0.1 * (3 - i);
          const k = ramp(t, a, a + 0.5, E.inOut);
          const from = rows[i].mid(3);
          const p = D4.at(from, { x: PX, y: 236 }, k, -60);
          f.set({ x: p.x, y: p.y, s: lerp(1, 0.6, k), k: k > 0 && k < 1 ? 1 : 0 });
        });

        // ----- the right panel: w, the gradient, the update -----
        const w = t >= T.w2 ? e2.nw : t >= T.w1 ? e1.nw : EP.w0;
        const wb = flash(t, T.w1, T.w1 + 0.35) + flash(t, T.w2, T.w2 + 0.35);
        wTag.set({ text: `w = ${fm(w, 3)}`, k: ramp(t, T.rows, T.rows + 0.4, E.lin), s: 1 + 0.15 * wb });
        const g2 = t >= T.grad2;
        gTag.set({
          text: `gradient ${fm(g2 ? e2.grad : e1.grad, 3)}`,
          k: ramp(t, T.grad, T.grad + 0.4, E.lin),
          s: 1 + 0.12 * flash(t, T.grad2, T.grad2 + 0.35),
        });
        const sk = ramp(t, T.sum, T.sum + 0.4, E.lin);
        const s2 = t >= T.sum2;
        const sb = 1 + 0.06 * flash(t, T.sum2, T.sum2 + 0.35);
        sumCard.set({ k: sk, s: sb });
        sumText(s2 ? e2 : e1).forEach((txt, j) => sumL[j].set({ text: txt, k: clamp(sk * 1.5), s: sb }));
        const c2 = t >= T.w2;
        cnt.set({
          text: `epoch ${c2 ? 2 : 1} · 1 update`,
          k: ramp(t, T.cnt1, T.cnt1 + 0.4, E.lin),
          s: 1 + 0.12 * flash(t, T.w2, T.w2 + 0.35),
        });
      };
    },
  });
})();
