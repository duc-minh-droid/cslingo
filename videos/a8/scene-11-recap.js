/* Phase 8 · Cryptography & Blockchain (algo-8), scene 11-recap: three rows, each a small animated pictogram and one bold line.
   Bare scene. Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is done at about
   4.3, row 2 at 5.3 and row 3 at 6.8, so for the last two seconds only Byte's bob moves.
   Row 1 (purple): two paint pots (Alice's orange mix, Bob's green mix) swap places on arcs, a rose drop falls into the left pot and a
          blue drop into the right one, both turn the same tan, a green equals sign pops between them (A8.PAINT).
   Row 2 (blue): a grey tile 7 meets Bob's open blue padlock; the padlock snaps shut and the tile becomes a blue 13; Bob's purple key
          slides in, the padlock opens and the tile becomes a green 7 with a tick (A8.RSA: 7 -> 13 -> 7).
   Row 3 (green, "A blockchain: linked hashes, and edits cost real work"): three small blocks joined by blue arrows; block 1 is edited
          (orange) and only the link into block 2 breaks (block 2 red); block 1 is re-sealed (green); block 2 is re-sealed, its link
          is green again and only then the next link breaks (block 3 red); block 3 is re-sealed and the last link is green again;
          at the end an orange bar under the blocks grows and says "50 tries": the work of those three seals (A8.SEAL).
   Every number and colour comes from A8.PAINT / A8.RSA / A8.SEAL and is asserted when the scene is built. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const { f1 } = A8.kit;

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 13, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 5.4;
  const cyc = (t, t0) => (t < t0 ? -1 : t - t0); // seconds since the pictogram started (-1 before it); it plays once and holds
  const pop = (q, a, len = 0.3) => (q < 0 ? 0 : ramp(q, a, a + len, E.lin)); // a 0..1 pop-in for an A8 handle's k
  const bumps = (q, times, len = 0.3) => times.reduce((sum, at) => sum + flash(q, at, at + len), 0);

  // a tile that is a plain sticker: no padding, so a two-digit number fits the small box
  const tile = (pic, o) => {
    const t = A8.tag(pic, { box: true, ...o });
    t.el.style.padding = "0";
    return t;
  };

  // ---------- row 1: a shared secret, never sent (paint mixing) ----------
  function paintRow(pic) {
    const P = A8.PAINT;
    A8.same(
      "recap row 1: the two mixtures",
      [P.mixA, P.mixB],
      [
        ["P", "A"],
        ["P", "B"],
      ],
    );
    A8.same(
      "recap row 1: what each ends with",
      [P.finalAlice, P.finalBob],
      [
        ["P", "B", "A"],
        ["P", "A", "B"],
      ],
    );
    A8.same("recap row 1: both end on the same colour", A8.paintRgb(P.finalAlice).fill, A8.paintRgb(P.finalBob).fill);
    if (A8.paintRgb(P.mixA).fill === A8.paintRgb(P.mixB).fill)
      throw new Error("recap row 1: the two mixtures look alike");

    const [L, R, R0] = [{ x: 70, y: 70 }, { x: 270, y: 70 }, 30]; // prettier-ignore
    const potA = A8.pot(pic, { x: L.x, y: L.y, r: R0 }); // Alice's mixture: starts left, travels right
    const potB = A8.pot(pic, { x: R.x, y: R.y, r: R0 }); // Bob's mixture: starts right, travels left
    const secretA = A8.drop(pic, { r: 12, paint: "A" }); // Alice's secret rose falls into the pot she now holds (left)
    const secretB = A8.drop(pic, { r: 12, paint: "B" }); // Bob's secret blue falls into the pot he now holds (right)
    const eq = A8.icon(pic, "equals", { x: 170, y: 70, size: 44, tone: "green", disc: true });
    const T = { pop: 0, swap: [0.4, 1.3], drop: [1.5, 1.95], mix: 1.95, eq: 2.3 };
    const BEND = 34; // the pots are 60 px wide, so they need to clear each other by more than that as they pass
    const FROM = { A: { x: 28, y: 8 }, B: { x: 312, y: 8 } };

    return (q) => {
      const f = ramp(q, ...T.swap, E.inOut);
      const mixed = q >= T.mix;
      const land = flash(q, T.mix, T.mix + 0.35);
      const posA = A8.arc(L, R, f, BEND);
      const posB = A8.arc(R, L, f, -BEND);
      potA.set({ drops: mixed ? P.finalBob : P.mixA, x: posA.x, y: posA.y, k: pop(q, T.pop), s: 1 + 0.12 * land });
      potB.set({ drops: mixed ? P.finalAlice : P.mixB, x: posB.x, y: posB.y, k: pop(q, T.pop), s: 1 + 0.12 * land });

      const g = ramp(q, ...T.drop, E.in);
      const fall = (src, to) => {
        const p = A8.arc(src, to, g, 8);
        const hidden = q < T.drop[0] || g >= 1; // before it falls and once it is inside the pot
        return {
          x: p.x,
          y: p.y,
          s: 1 - 0.45 * ramp(g, 0.7, 1, E.lin),
          o: hidden ? 0 : ramp(q, T.drop[0], T.drop[0] + 0.15, E.lin),
        };
      };
      secretA.set(fall(FROM.A, L));
      secretB.set(fall(FROM.B, R));
      eq.set({ k: pop(q, T.eq, 0.5) });
    };
  }

  // ---------- row 2: anyone can lock, only Bob can open (RSA) ----------
  function lockRow(pic) {
    const R = A8.RSA;
    A8.same(
      "recap row 2: 7 is locked into 13 and unlocked back into 7",
      [R.M, A8.modpow(R.M, R.e, R.n), A8.modpow(R.C, R.d, R.n)],
      [7, 13, 7],
    );
    A8.same("recap row 2: the stored locked and unlocked values", [R.C, R.back], [13, 7]);

    const msg = tile(pic, { x: 70, y: 70, w: 64, h: 64, fs: 36, text: String(R.M), tone: "grey" });
    const padlock = A8.icon(pic, "lock", { x: 170, y: 70, size: 56, tone: "blue" });
    const key = A8.icon(pic, "key", { x: 270, y: 70, size: 56, tone: "purple" });
    const tick = A8.icon(pic, "tick", { x: 70, y: 18, size: 36, tone: "green" });
    const T = { pop: 0, close: [0.5, 0.9], lockedAt: 1.05, key: [1.5, 2.1], open: [2.1, 2.5], openAt: 2.7, tick: 2.8 };

    return (q) => {
      const shut = ramp(q, ...T.close, E.inOut);
      const opened = ramp(q, ...T.open, E.inOut);
      padlock.set({ k: pop(q, T.pop), open: 1 - shut + opened });

      const s = ramp(q, ...T.key, E.out);
      key.set({
        x: 330 - 60 * s,
        k: pop(q, T.key[0], 0.25),
        s: 1 + 0.18 * flash(q, T.key[1] - 0.1, T.key[1] + 0.3),
      });

      // the tile: 7 -> 13 when the padlock shuts, 13 -> 7 when the key opens it
      const back = q >= T.openAt;
      const locked = q >= T.lockedAt && !back;
      msg.set({
        text: String(locked ? R.C : back ? R.back : R.M),
        tone: locked ? "blue" : back ? "green" : "grey",
        solid: locked || back,
        k: pop(q, T.pop),
        s: 1 + 0.14 * bumps(q, [T.close[1] - 0.05, T.open[1] + 0.05], 0.3),
      });
      tick.set({ k: pop(q, T.tick, 0.4), draw: q < 0 ? 0 : ramp(q, T.tick + 0.05, T.tick + 0.4, E.lin) });
    };
  }

  // ---------- row 3: hashes link blocks, work makes edits costly ----------
  function chainRow(pic) {
    const S = A8.SEAL;
    const [edited, stale, second, fixed] = [S.view(1), S.view(2), S.view(3), S.view(4)];
    A8.same("recap row 3: three blocks", [edited.length, S.forged.length], [3, 3]);
    A8.same(
      "recap row 3: editing block 1 breaks its seal and only the link into block 2",
      [edited[0].sealOk, edited[1].linkOk, edited[2].linkOk],
      [false, false, true],
    );
    A8.same(
      "recap row 3: re-mining only block 1 leaves the link into block 2 stale and the next one fine",
      [stale[0].sealOk, stale[1].linkOk, stale[2].linkOk],
      [true, false, true],
    );
    A8.same(
      "recap row 3: re-mining block 2 mends its link and only then breaks the link into block 3",
      [second[1].sealOk, second[1].linkOk, second[2].linkOk],
      [true, true, false],
    );
    A8.same("recap row 3: after re-mining every block all is well", fixed.map((b) => b.sealOk && b.linkOk), [true, true, true]); // prettier-ignore
    if (!(S.total > S.forged.length)) throw new Error("recap row 3: re-sealing should cost more than one try a block");

    const XS = [78, 188, 298];
    const Y = 62;
    const blocks = XS.map((x, i) => tile(pic, { x, y: Y, w: 70, h: 60, fs: 32, text: String(i + 1), tone: "grey" }));
    const links = [0, 1].map((i) => {
      const svg = L5.svg(pic, PIC.w, PIC.h);
      const mk = (name) => svg.appendChild(L5.arrow(XS[i] + 36, Y, XS[i + 1] - 36, Y, name, 1, { w: 5, head: 14 }));
      const l = { blue: mk("blue"), red: mk("red"), green: mk("green") };
      [l.red, l.green].forEach((g) => L5.drawOn(g, 1));
      return l;
    });
    const ticks = XS.map((x) => A8.icon(pic, "tick", { x, y: 14, size: 28, tone: "green" }));
    const work = A8.bar(pic, { x: 43, y: 102, w: 290, h: 36, tone: "orange", text: `${S.total} tries`, fs: 28 });

    const T = {
      pop: 0.08, // block i pops at 0.08 i
      draw: 0.4, // link i draws from 0.4 + 0.2 i
      edit: 1.2,
      red: [1.6, 2.6], // block 2 (and the link before it) breaks with the edit; block 3 (and its link) only after block 2 is mended
      seal: [2.0, 2.5, 3.2], // each block is re-sealed in turn
      fix: [2.5, 3.4], // a link is green again once the block it points at is re-sealed
      work: [3.7, 4.4], // the bar that says what the three seals cost
    };

    return (q) => {
      blocks.forEach((b, i) => {
        const sealed = q >= T.seal[i];
        const hit = i === 0 ? q >= T.edit : q >= T.red[i - 1];
        const at = i === 0 ? T.edit : T.red[i - 1];
        b.set({
          tone: sealed ? "green" : hit ? (i === 0 ? "orange" : "red") : "grey",
          solid: sealed || hit,
          k: pop(q, T.pop * i, 0.3),
          s: 1 + 0.12 * bumps(q, [at, T.seal[i]], 0.35),
        });
        const k = pop(q, T.seal[i], 0.4);
        ticks[i].set({ k, draw: q < 0 ? 0 : ramp(q, T.seal[i] + 0.05, T.seal[i] + 0.4, E.lin) });
      });
      links.forEach((l, i) => {
        L5.drawOn(l.blue, q < 0 ? 0 : ramp(q, T.draw + 0.2 * i, T.draw + 0.2 * i + 0.3, E.lin));
        V.show(l.red, clamp(q < 0 ? 0 : ramp(q, T.red[i], T.red[i] + 0.3, E.lin)));
        V.show(l.green, clamp(q < 0 ? 0 : ramp(q, T.fix[i], T.fix[i] + 0.3, E.lin)));
      });
      work.set({ k: q < 0 ? 0 : ramp(q, ...T.work, E.out) });
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
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["purple", "A shared secret,\nnever sent", paintRow],
        ["blue", "Anyone can lock,\nonly Bob can open", lockRow],
        ["green", "A blockchain: linked\nhashes, and edits\ncost real work", chainRow],
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
          r.update(cyc(t, START[i]));
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
