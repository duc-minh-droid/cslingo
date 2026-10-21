/* Lecture 7 · The Paxos protocol, scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line.
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0 (each pictogram starts 0.4 s later), 6.8 the call to action.
   Row 1 (green): five acceptors A to E pop, A, B, C turn green (a majority), D and E turn red (crashed).
   Row 2 (purple): a proposer and three acceptors pop, a purple dot flies out (prepare), green dots fly back (promise), a blue dot
   flies out (accept) and the three acceptors turn green.
   Row 3 (blue): an orange 9 pops and is crossed out, an arrow draws to a blue 7 with a green tick (the proposer keeps the value that
   may already be chosen).
   Every pictogram plays once and then holds its finished frame; only the mascot bob moves after about 6 s. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
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
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);

  // ---------- row 1: a majority of five agrees while two crash ----------
  function majorityRow(pic) {
    const Q = D7.QUORUM;
    D7.same("recap row 1: three of five, two may crash", [Q.n, Q.need, Q.maxDown], [5, 3, 2]);
    const discs = D7.ACCS.map((k, i) => D4.disc(pic, { x: 38 + 66 * i, y: 70, size: 58, text: k, tone: "grey" }));
    return (t) => {
      const q = t - START[0];
      discs.forEach((d, i) => {
        const up = i < Q.need;
        const at = up ? 1.0 + 0.25 * i : 2.2 + 0.25 * (i - Q.need);
        const lit = q >= at;
        d.set({
          k: ramp(q, 0.1 + 0.1 * i, 0.6 + 0.1 * i, E.lin),
          tone: lit ? (up ? "green" : "red") : "grey",
          s: 1 + 0.15 * flash(q, at, at + 0.35),
        });
      });
    };
  }

  // ---------- row 2: prepare and promise, then accept ----------
  function phasesRow(pic) {
    const R = D7.R1;
    D7.same("recap row 2: number 1, value 7, A to D answer", [R.n, R.v, R.promises.length], [1, 7, 4]);
    const P = { x: 44, y: 70 };
    const ACC = [22, 70, 118].map((y) => ({ x: 280, y }));
    const prop = D4.disc(pic, { x: P.x, y: P.y, size: 62, text: "P", tone: "blue" });
    const accs = ACC.map((a) => D4.disc(pic, { x: a.x, y: a.y, size: 40, text: "", tone: "grey" }));
    const dot = (tone) => ACC.map(() => D4.disc(pic, { x: 0, y: 0, size: 26, text: "", tone }));
    const [prep, prom, acc] = [dot("purple"), dot("green"), dot("blue")];
    const at = (a, b, f) => ({ x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) });
    const fly = (set, from, to, q, t0, i) => {
      const f = ramp(q, t0 + 0.12 * i, t0 + 0.12 * i + 0.6, E.inOut);
      const p = at(from, to, f);
      set.set({ x: p.x, y: p.y, k: f > 0.01 && f < 0.99 ? 1 : 0 });
    };
    return (t) => {
      const q = t - START[1];
      prop.set({ k: ramp(q, 0.1, 0.6, E.lin) });
      accs.forEach((a, i) => {
        const done = q >= 3.2 + 0.12 * i;
        a.set({
          k: ramp(q, 0.2 + 0.1 * i, 0.7 + 0.1 * i, E.lin),
          tone: done ? "green" : "grey",
          s: 1 + 0.2 * flash(q, 3.2 + 0.12 * i, 3.6 + 0.12 * i),
        });
      });
      ACC.forEach((a, i) => {
        fly(prep[i], P, a, q, 1.0, i);
        fly(prom[i], a, P, q, 1.9, i);
        fly(acc[i], P, a, q, 2.6, i);
      });
    };
  }

  // ---------- row 3: send the value that may already be chosen ----------
  function safeRow(pic) {
    const S = D7.SAFE;
    D7.same("recap row 3: P2 wants 9 but must send 7", [S.p2.own, S.p2.sends], [9, 7]);
    const own = D4.disc(pic, { x: 56, y: 70, size: 66, text: String(S.p2.own), tone: "orange" });
    const sends = D4.disc(pic, { x: 262, y: 70, size: 66, text: String(S.p2.sends), tone: "blue" });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const cross = svg.appendChild(L5.cross(56, 70, 36, "red", { w: 7 }));
    const arrow = svg.appendChild(L5.arrow(104, 70, 214, 70, "purple", 1, { w: 8, head: 20 }));
    const tick = svg.appendChild(L5.tick(316, 26, 40, "green", { w: 8 }));
    return (t) => {
      const q = t - START[2];
      own.set({ k: ramp(q, 0.1, 0.6, E.lin) });
      const x = ramp(q, 1.0, 1.3, E.lin);
      V.place(cross, { s: 0.5 + 0.5 * E.pop(x), o: x });
      const a = ramp(q, 1.6, 2.1, E.lin);
      L5.drawOn(arrow, a);
      V.show(arrow, a > 0 ? 1 : 0);
      sends.set({ k: ramp(q, 1.9, 2.4, E.lin), s: 1 + 0.15 * flash(q, 2.2, 2.6) });
      const k = ramp(q, 2.7, 3.2, E.lin);
      L5.drawOn(tick, k);
      V.place(tick, { s: 1 + 0.25 * flash(q, 3.1, 3.5), o: k > 0.01 ? 1 : 0 });
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
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["green", "A majority decides:\n3 of 5, two may crash", majorityRow],
        ["purple", "Prepare and promise,\nthen accept", phasesRow],
        ["blue", "Never change a value\nthat may be chosen", safeRow],
      ].map(([tone, text, make], i) => {
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
        text: "Next: Workshop 7.W",
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
          r.update(t);
        });
        const c = ramp(t, 6.8, 7.4, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 6.8, 7.1) });
      };
    },
  });
})();
