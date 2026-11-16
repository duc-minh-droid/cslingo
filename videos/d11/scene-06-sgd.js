/* Lecture 11 (ds-11) · scene 6 (DISTRIBUTED SGD): one iteration of the slides' Algorithm 1 on three workers (lesson 11.2).
   Every worker keeps the same model w = 10; the minibatch of 6 is dealt out, 2 examples each; each worker averages the gradient
   of its own examples (w minus the target mean: 5, 6, 4); an all-reduce through the purple + hub puts G = 15 on every worker;
   every copy updates w = w − (alpha ÷ M) × G = 7.5, exactly the one-machine minibatch step on all 6. Numbers from D11.SGD.
   Colours: grey the worker cards, wires and the minibatch; blue each worker's own examples and gradient; purple the all-reduce
   (packets, the hub, G); green the model w and the final check.
   Story (local seconds): 0.2 cards; 1.0 minibatch; 2.0-3.0 deal; 3.3 gradients; 4.5 hub and wires; 4.9-5.6 gradients fly in;
   5.7 G = 15; 6.0-6.8 G flies back; 8.2 the update; 8.4-8.8 w flips to 7.5; 10.8 the one-machine check; 11.4 rings. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const S = D11.SGD;
  const fm = D11.fm;
  const WORD = ["no", "One", "Two", "Three", "Four"];
  D11.same("sgd scene: 3 workers, 2 examples each", [S.M, S.Bp, S.B], [3, 2, 6]);

  const CX = [156, 468, 780]; // card centres
  const CW = 76;
  const GAP = 10;
  const ROW_X = 468 - (S.B * (CW + GAP) - GAP) / 2;
  const HUB = { x: 468, y: 520 };
  const upd = `w = ${fm(S.w0)} − (${fm(S.alpha)} ÷ ${S.M}) × ${fm(S.G)} = ${fm(S.w1)}`;
  const chk = `one machine, all ${S.B}: ${fm(S.w0)} − ${fm(S.alpha)} × ${fm(S.gAll)} = ${fm(S.w0 - S.step)}`;
  D11.same("sgd scene: one machine gives the same w", fm(S.w0 - S.step), fm(S.w1));

  V.scene({
    kicker: "DISTRIBUTED SGD",
    title: ["Split the minibatch,", "all-reduce the gradients"],
    dur: 14,
    caps: [
      [0.4, 2.8, `${WORD[S.M]} workers, each with the same model, w = ${fm(S.w0)}.`],
      [3, 4.7, `The minibatch of ${S.B} is split: ${S.Bp} examples per worker.`],
      [4.9, 6.7, `Each worker computes its own gradient: ${fm(S.g[0])}, ${fm(S.g[1])} and ${fm(S.g[2])}.`],
      [7, 8.8, `All-reduce: G = ${fm(S.G)} lands on every worker.`],
      [9, 11, `Every copy updates the same way: w = ${fm(S.w1)}.`],
      [11.4, 13.7, `Exactly what one machine gets from all ${S.B}: it is minibatch SGD.`],
    ],
    build(stage) {
      // wires first, so they lie under the cards and the hub
      const wsvg = D4.svg(stage);
      const wires = CX.map((x) =>
        D4.wire(wsvg, {
          pts: [
            [x, 430],
            [HUB.x, HUB.y],
          ],
          tone: "grey",
          w: 6,
        }),
      );
      const cards = CX.map((x) => D4.card(stage, { x: x - 144, y: 110, w: 288, h: 320, plain: true }));
      const rings = CX.map((x) => {
        const el = V.h("div", {
          style: {
            position: "absolute",
            left: `${x - 154}px`,
            top: "100px",
            width: "308px",
            height: "340px",
            boxSizing: "border-box",
            border: "6px solid var(--c)",
            borderRadius: "30px",
          },
          class: "c-green",
        });
        stage.append(el);
        return el;
      });
      const names = CX.map((x, i) => D4.label(stage, { x, y: 136, text: `W${i + 1}`, fs: 30 }));
      const grads = CX.map((x, i) =>
        D4.tag(stage, { x, y: 258, tone: "blue", text: `g = ${fm(S.w0)} − ${fm(S.means[i])} = ${fm(S.g[i])}` }),
      );
      const gIn = CX.map((x) => D4.tag(stage, { x, y: 322, tone: "purple", solid: true, text: `G = ${fm(S.G)}` }));
      const ws = CX.map((x) => D4.tag(stage, { x, y: 392, tone: "green", solid: true, text: "" }));
      const chips = D4.chips(stage, { x: ROW_X, y: 12, n: S.B, w: CW, h: 56, gap: GAP, texts: S.all, tone: "grey" });
      const bAll = D4.tag(stage, { x: 110, y: 40, text: `B = ${S.B}` });
      const bEach = D4.tag(stage, { x: 110, y: 40, text: `B' = ${S.Bp} each` });
      const hub = D4.disc(stage, { x: HUB.x, y: HUB.y, size: 90, text: "+", tone: "purple" });
      const hubTag = D4.tag(stage, { x: 640, y: HUB.y + 10, tone: "purple", solid: true, text: `G = ${fm(S.G)}` });
      const pIn = S.g.map((g) => D4.packet(stage, { tone: "purple", text: fm(g) }));
      const pOut = CX.map(() => D4.packet(stage, { tone: "purple", text: fm(S.G) }));
      const bottomA = D4.tag(stage, { x: 468, y: 600, text: upd });
      const bottomB = D4.tag(stage, { x: 468 - 24, y: 600, text: chk, tone: "green" });
      const top = D4.svg(stage);
      const tick = L5.tick(468 - 24 + D4.tagW(chk) / 2 + 34, 600, 44, "green");
      top.append(tick);

      // where chip i lands: two slots per card, centre y 192
      const slotOff = (i) => {
        const card = Math.floor(i / S.Bp);
        const j = i % S.Bp;
        const tx = CX[card] + (j - (S.Bp - 1) / 2) * (CW + GAP);
        const sx = ROW_X + i * (CW + GAP) + CW / 2;
        return { x: tx - sx, y: 192 - (12 + 28) };
      };

      return (t) => {
        const fin = flash(t, 11.4, 12.0);
        CX.forEach((_, i) => {
          const ck = D11.seq(t, 0.2, 0.12, 0.4, i);
          cards[i].set({ k: ck });
          names[i].set({ k: ck });
          grads[i].set({ k: D11.seq(t, 3.3, 0.4, 0.4, i) });
          gIn[i].set({ k: ramp(t, 6.8, 7.1, E.lin), s: 1 + 0.15 * flash(t, 6.8, 7.2) });
          const flip = t >= 8.6;
          ws[i].set({
            k: ck,
            text: `w = ${fm(flip ? S.w1 : S.w0)}`,
            s: 1 + 0.25 * flash(t, 8.4, 8.8) + 0.15 * fin,
          });
          const rk = ramp(t, 11.4, 11.8, E.lin);
          rings[i].style.opacity = rk.toFixed(2);
          rings[i].style.transform = `scale(${(0.94 + 0.06 * E.pop(rk)).toFixed(3)})`;
          rings[i].style.visibility = rk > 0 ? "" : "hidden";
          wires[i].set({ k: ramp(t, 4.5, 4.9, E.out) });
          const a = { x: CX[i], y: 420 };
          D11.fly(pIn[i], a, HUB, ramp(t, 4.9, 5.6, E.inOut));
          D11.fly(pOut[i], HUB, a, ramp(t, 6.0, 6.8, E.inOut));
        });
        hub.set({ k: ramp(t, 4.5, 4.9, E.lin), s: 1 + 0.2 * flash(t, 5.5, 5.9) });
        hubTag.set({ k: ramp(t, 5.7, 6.0, E.lin), s: 1 + 0.15 * flash(t, 5.7, 6.1) });
        // the minibatch: pops, then is dealt out (turning blue as each chip lands)
        for (let i = 0; i < S.B; i++) {
          const pk = D11.seq(t, 1.0, 0.05, 0.3, i);
          const dk = E.inOut(D11.seq(t, 2.0, 0.1, 0.5, i));
          const off = slotOff(i);
          const landed = dk >= 0.95;
          chips.set(i, {
            x: off.x * dk,
            y: off.y * dk,
            s: E.pop(pk),
            o: pk > 0 ? 1 : 0,
            tone: landed ? "blue" : "grey",
            solid: landed,
          });
        }
        bAll.set({ k: ramp(t, 1.0, 1.4, E.lin), o: 1 - ramp(t, 2.8, 3.0, E.lin) });
        bEach.set({ k: ramp(t, 3.0, 3.4, E.lin) });
        bottomA.set({ k: ramp(t, 8.2, 8.5, E.lin), o: 1 - ramp(t, 10.8, 11.1, E.lin) });
        bottomB.set({ k: ramp(t, 10.9, 11.2, E.lin), s: 1 + 0.08 * fin });
        L5.drawOn(tick, ramp(t, 11.2, 11.6, E.out));
        tick.style.display = t >= 11.2 ? "" : "none";
      };
    },
  });
})();
