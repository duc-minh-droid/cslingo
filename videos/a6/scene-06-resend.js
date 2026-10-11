/* Phase 6 · scene 06-resend (11.5 s): detection alone is enough when the receiver can ask again (a download), but a far-away
   probe cannot wait for the answer, so its code must repair errors by itself. Two stacked panels, played one after the other.
   Every bit comes from A6.ARQ (the parity frame 11010010 whose 4th bit flips) and A6.HAM (the codeword 0110011 whose
   6th position flips); nothing is typed here.
   Panel A (top), local seconds: 0.15-0.75 the panel, its title and the wire appear; 1.0 the frame pops at the sender, 1.2-2.4 it
   slides to the receiver; 1.7-2.4 noise (a bolt) flips the 4th bit red; 2.5-2.9 a red cross (the check fails), 2.7 "check
   fails"; 3.0-3.8 the orange return arrow draws, 3.1 "send again"; 3.9 the damaged frame goes, 4.1-5.2 a clean frame is sent
   again; 5.2-5.5 the cross becomes a tick, "check passes".
   Panel B (bottom): 5.9-6.5 the panel and a dotted, long wire; 6.3 "minutes away"; 6.65-7.8 the Hamming codeword travels; 7.0-7.5
   noise flips position 6; 7.9-8.3 red cross, 8.1 "check fails"; 8.3-9.4 the return arrow crawls and stalls at about a fifth of the
   way; 9.2 the tag becomes "too slow"; 9.6-10.4 the receiver flips the bit back itself (green), the cross becomes a tick and
   the verdict reads "fixed on arrival". */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const lin = E.lin;

  // ---------- the data (asserted) ----------
  const ARQ = A6.ARQ;
  const HAM = A6.HAM;
  const HIT_A = ARQ.hit; // tile index flipped in the download frame
  const HIT_B = A6.idx(HAM.one.flip); // tile index of Hamming position 6
  A6.same("resend: download frame and its damaged copy", [ARQ.frame, ARQ.bad, ARQ.frame.length], [
    "11010010",
    "11000010",
    8,
  ]);
  A6.same("resend: the damaged frame has an odd count of 1s", [A6.ones(ARQ.bad) % 2, A6.ones(ARQ.frame) % 2], [1, 0]);
  A6.same("resend: download flip", [ARQ.frame[HIT_A], ARQ.bad[HIT_A], A6.diffAt(ARQ.frame, ARQ.bad)], ["1", "0", [3]]);
  A6.same("resend: probe flip", [HAM.cw[HIT_B], HAM.one.recv[HIT_B], A6.diffAt(HAM.cw, HAM.one.recv)], ["1", "0", [5]]);
  A6.same("resend: the probe's code repairs itself", [A6.hFix(HAM.one.recv), HAM.one.at], [HAM.cw, 6]);

  // ---------- layout (stage px) ----------
  const PANEL_H = 280;
  const OY_A = 0;
  const OY_B = 330;
  const SND = { x: 16, w: 130, y: 118, h: 84 }; // sender stub (centred on the wire, y 160)
  const RCV = { x: 790, w: 130, y: 118, h: 84 }; // receiver stub
  const PKT = { x: 164, y: 134, size: 52, gap: 4, fs: 30 };
  const widthOf = (n) => n * PKT.size + (n - 1) * PKT.gap;
  const DX_A = RCV.x - 16 - PKT.x - widthOf(ARQ.frame.length); // 166: the frame stops just left of the receiver
  const DX_B = RCV.x - 16 - PKT.x - widthOf(HAM.cw.length); // 222
  const MID_X = (SND.x + SND.w + RCV.x) / 2; // 468: the middle of the wire
  const ICON = { x: RCV.x + RCV.w / 2 + 1, y: 60, size: 64 };
  const ARROW_Y = 100;
  const ARROW_END = 150;
  const ARROW_HEAD = 24;
  const VERDICT_Y = 216; // the verdict tag sits under the receiver
  const STALL = 0.22; // how much of the return arrow gets drawn in panel B
  const STALL_X = RCV.x - (RCV.x - (ARROW_END + ARROW_HEAD * 0.75)) * STALL; // where it stops
  const left = (centre, text) => Math.round(centre - A6.tagW(text) / 2);

  // ---------- timeline ----------
  const T = {
    a: { card: [0.15, 0.5], title: [0.3, 0.55], stubs: [0.3, 0.65], wire: [0.35, 0.75] },
    a1: { pop: 1.0, slide: [1.2, 2.4], tag: [1.15, 1.4], bolt: [1.7, 1.95, 2.15, 2.4], flip: [1.9, 2.3], out: [3.9, 4.0] },
    aCheck: { arrive: [2.4, 2.7], cross: [2.5, 2.9], fails: [2.7, 2.95] },
    aAsk: { arrow: [3.0, 3.8], tag: [3.1, 3.35], sender: [3.8, 4.1], fade: [5.0, 5.3] },
    a2: { pop: 4.1, slide: [4.2, 5.2], tag: [4.2, 4.45] },
    aOk: { arrive: [5.2, 5.5], crossOut: [5.2, 5.4], tick: [5.25, 5.55], tag: [5.25, 5.5] },
    b: { card: [5.9, 6.25], title: [6.0, 6.3], stubs: [6.05, 6.4], wire: [6.1, 6.5], far: [6.3, 6.55] },
    b1: { pop: 6.6, slide: [6.65, 7.8], bolt: [7.0, 7.2, 7.3, 7.5], flip: [7.1, 7.5] },
    bCheck: { arrive: [7.8, 8.1], cross: [7.9, 8.3], fails: [8.1, 8.35] },
    bAsk: { arrow: [8.3, 9.4], slow: [9.2, 9.55] },
    bFix: { flip: [9.6, 10.1], crossOut: [9.6, 9.8], tick: [9.8, 10.2], tag: [10.1, 10.4], fade: [9.6, 10.0] },
  };

  const popped = (t, t0, i) => A6.seq(t, t0, 0.015, 0.22, i);

  /** Everything that is the same in both panels: card, title tag, stubs, and the tags that come later. */
  function scaffold(stage, oy, title) {
    return {
      card: A6.card(stage, { x: 0, y: oy, w: 936, h: PANEL_H, tone: "grey", plain: true }),
      title: A6.tag(stage, { x: 24, y: oy + 14, text: title, tone: "grey" }),
      sender: A6.card(stage, { ...SND, y: oy + SND.y, text: "sender", tone: "grey", plain: false }),
      receiver: A6.card(stage, { ...RCV, y: oy + RCV.y, text: "receiver", tone: "grey", plain: false }),
    };
  }

  /** Draw one frame row at time t. sp = the tile that gets hit, {i, at, from, to, toTone, solid(k)}. */
  function drivePacket(row, t, { t0, slide, dx, fade = 1, sp }) {
    const x = dx * ramp(t, slide[0], slide[1], E.inOut);
    for (let i = 0; i < row.n; i++) {
      const k = popped(t, t0, i);
      const st = { x, s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) * fade };
      if (sp && i === sp.i) {
        const fk = ramp(t, ...sp.at, E.inOut);
        row.flip(i, fk, { ...st, tone: sp.tone, from: sp.from, to: sp.to, toTone: sp.toTone, solid: !!sp.solid && fk >= 0.5, hop: 8 });
      } else row.set(i, st);
    }
  }

  function build(stage) {
    // ---- the two panels, then the wires, packets and tags in drawing order ----
    const A = scaffold(stage, OY_A, "download");
    const B = scaffold(stage, OY_B, "far-away probe");
    const wireA = V.h("div", {
      style: {
        position: "absolute",
        left: `${SND.x + SND.w}px`,
        top: `${OY_A + 154}px`,
        width: `${RCV.x - SND.x - SND.w}px`,
        height: "12px",
        borderRadius: "6px",
        background: "var(--line-2)",
      },
    });
    stage.append(wireA);
    const wireLayer = L5.svg(stage);
    const WIRE_B_LEN = RCV.x - (SND.x + SND.w);
    const wireB = wireLayer.appendChild(
      V.s("line", {
        x1: SND.x + SND.w,
        y1: OY_B + 160,
        x2: SND.x + SND.w,
        y2: OY_B + 160,
        "stroke-width": 12,
        "stroke-linecap": "round",
        "stroke-dasharray": "2 22",
        style: { stroke: "var(--line-2)" },
      }),
    );

    // arrows, crosses and ticks (below the tags and the packets)
    const icons = L5.svg(stage);
    const arrowA = icons.appendChild(L5.arrow(RCV.x, OY_A + ARROW_Y, ARROW_END, OY_A + ARROW_Y, "orange", 1, { w: 8, head: ARROW_HEAD }));
    const arrowB = icons.appendChild(L5.arrow(RCV.x, OY_B + ARROW_Y, ARROW_END, OY_B + ARROW_Y, "orange", 1, { w: 8, head: ARROW_HEAD }));
    const mk = (fn, oy) => icons.appendChild(fn(ICON.x, oy + ICON.y, ICON.size, fn === L5.cross ? "red" : "green", { w: 9, ink: true }));
    const crossA = mk(L5.cross, OY_A);
    const tickA = mk(L5.tick, OY_A);
    const crossB = mk(L5.cross, OY_B);
    const tickB = mk(L5.tick, OY_B);

    // tags
    const sendAgain = A6.tag(stage, { x: left(MID_X, "send again"), y: OY_A + 14, text: "send again", tone: "orange", solid: true });
    const minutes = A6.tag(stage, { x: left(MID_X, "minutes away"), y: OY_B + 14, text: "minutes away", tone: "grey" });
    const verdictA = A6.tag(stage, { x: 700, y: OY_A + VERDICT_Y, text: "check fails", h: 54, tone: "red" });
    const verdictB = A6.tag(stage, { x: 640, y: OY_B + VERDICT_Y, text: "check fails", h: 54, tone: "red" });
    const frameTagA = [0, 1].map(() => A6.tag(stage, { x: PKT.x + (widthOf(8) - A6.tagW("frame")) / 2, y: OY_A + PKT.y + PKT.size + 14, text: "frame", tone: "grey" }));

    // the frames
    const frameA = [ARQ.frame, ARQ.frame].map((bits) =>
      A6.bits(stage, { x: PKT.x, y: OY_A + PKT.y, bits, size: PKT.size, gap: PKT.gap, fs: PKT.fs, tones: [...Array(7).fill("grey"), "orange"] }),
    );
    const frameB = A6.bits(stage, {
      x: PKT.x,
      y: OY_B + PKT.y,
      bits: HAM.cw,
      size: PKT.size,
      gap: PKT.gap,
      fs: PKT.fs,
      tones: [...HAM.cw].map((_, i) => (HAM.checkPos.includes(A6.pos(i)) ? "orange" : "grey")),
    });

    // noise: the bolts ride above the tile they hit
    const bolts = L5.svg(stage);
    const boltA = bolts.appendChild(A6.bolt(0, OY_A + 112, 70, "orange"));
    const boltB = bolts.appendChild(A6.bolt(0, OY_B + 112, 70, "orange"));
    const tileX = (i, n, dx) => PKT.x + i * (PKT.size + PKT.gap) + PKT.size / 2 + dx;
    const strike = (g, at, x, t) => {
      const [a, b, c, d] = at;
      const k = ramp(t, a, b, lin) * (1 - ramp(t, c, d, lin));
      V.place(g, { x, y: -18 * (1 - E.out(ramp(t, a, b, lin))), s: 0.4 + 0.7 * E.pop(ramp(t, a, b, lin)), o: Math.min(1, k * 5) });
    };

    return (t) => {
      // ================= PANEL A: the download =================
      A.card.set({ k: ramp(t, ...T.a.card, lin) });
      A.title.set({ k: ramp(t, ...T.a.title, lin) });
      const stubsA = ramp(t, ...T.a.stubs, lin);
      A.sender.set({ k: stubsA, s: 1 + 0.07 * flash(t, ...T.aAsk.sender) });
      A.receiver.set({ k: stubsA, s: 1 + 0.07 * (flash(t, ...T.aCheck.arrive) + flash(t, ...T.aOk.arrive)) });
      wireA.style.width = `${(RCV.x - SND.x - SND.w) * ramp(t, ...T.a.wire, lin)}px`;
      V.show(wireA, ramp(t, T.a.wire[0], T.a.wire[0] + 0.1, lin));

      // frame 1: travels, gets hit, fails the check, disappears
      const dx1 = DX_A * ramp(t, ...T.a1.slide, E.inOut);
      const out1 = 1 - ramp(t, ...T.a1.out, lin);
      drivePacket(frameA[0], t, {
        t0: T.a1.pop,
        slide: T.a1.slide,
        dx: DX_A,
        fade: out1,
        sp: { i: HIT_A, at: T.a1.flip, tone: "grey", from: ARQ.frame[HIT_A], to: ARQ.bad[HIT_A], toTone: "red" },
      });
      frameTagA[0].set({ k: ramp(t, ...T.a1.tag, lin), x: dx1, o: out1 });
      strike(boltA, T.a1.bolt, tileX(HIT_A, 8, dx1), t);

      // frame 2: the clean copy, sent again after the arrow reaches the sender
      const dx2 = DX_A * ramp(t, ...T.a2.slide, E.inOut);
      drivePacket(frameA[1], t, { t0: T.a2.pop, slide: T.a2.slide, dx: DX_A });
      frameTagA[1].set({ k: ramp(t, ...T.a2.tag, lin), x: dx2 });

      // the verdict: red cross and "check fails", then the return arrow, then (after the resend) a green tick
      const crossK = ramp(t, ...T.aCheck.cross, lin);
      V.place(crossA, { s: 0.6 + 0.4 * E.pop(crossK), o: 1 - ramp(t, ...T.aOk.crossOut, lin) });
      L5.drawOn(crossA, crossK);
      const tickK = ramp(t, ...T.aOk.tick, lin);
      V.place(tickA, { s: 0.6 + 0.4 * E.pop(tickK) });
      L5.drawOn(tickA, tickK);
      const okA = t >= T.aOk.tag[0];
      verdictA.set({
        text: okA ? "check passes" : "check fails",
        tone: okA ? "green" : "red",
        k: okA ? 1 : ramp(t, ...T.aCheck.fails, lin),
        s: 1 + 0.12 * flash(t, ...T.aOk.tag),
      });
      const askOut = 1 - ramp(t, ...T.aAsk.fade, lin);
      V.place(arrowA, { o: askOut });
      L5.drawOn(arrowA, ramp(t, ...T.aAsk.arrow, lin));
      sendAgain.set({ k: ramp(t, ...T.aAsk.tag, lin), o: askOut });

      // ================= PANEL B: the far-away probe =================
      B.card.set({ k: ramp(t, ...T.b.card, lin) });
      B.title.set({ k: ramp(t, ...T.b.title, lin) });
      const stubsB = ramp(t, ...T.b.stubs, lin);
      B.sender.set({ k: stubsB });
      B.receiver.set({ k: stubsB, s: 1 + 0.07 * flash(t, ...T.bCheck.arrive) });
      const wk = ramp(t, ...T.b.wire, lin);
      wireB.setAttribute("x2", String(SND.x + SND.w + WIRE_B_LEN * wk));
      V.show(wireLayer, 1);
      V.show(wireB, wk > 0 ? 1 : 0);

      const dxB = DX_B * ramp(t, ...T.b1.slide, E.inOut);
      const fixK = ramp(t, ...T.bFix.flip, E.inOut);
      for (let i = 0; i < frameB.n; i++) {
        const k = popped(t, T.b1.pop, i);
        const st = { x: dxB, s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) };
        if (i !== HIT_B) frameB.set(i, st);
        else if (t < T.bFix.flip[0])
          frameB.flip(i, ramp(t, ...T.b1.flip, E.inOut), { ...st, tone: "grey", from: HAM.cw[i], to: HAM.one.recv[i], toTone: "red", hop: 8 });
        else
          frameB.flip(i, fixK, { ...st, tone: "red", from: HAM.one.recv[i], to: HAM.cw[i], toTone: "green", solid: fixK >= 0.5, hop: 8 });
      }
      strike(boltB, T.b1.bolt, tileX(HIT_B, 7, dxB), t);

      // the stalled return arrow, and the tag that explains why it is useless
      const crossBK = ramp(t, ...T.bCheck.cross, lin);
      V.place(crossB, { s: 0.6 + 0.4 * E.pop(crossBK), o: 1 - ramp(t, ...T.bFix.crossOut, lin) });
      L5.drawOn(crossB, crossBK);
      const tickBK = ramp(t, ...T.bFix.tick, lin);
      V.place(tickB, { s: 0.6 + 0.4 * E.pop(tickBK) });
      L5.drawOn(tickB, tickBK);
      const fixed = t >= T.bFix.tag[0];
      verdictB.set({
        text: fixed ? "fixed on arrival" : "check fails",
        tone: fixed ? "green" : "red",
        solid: fixed,
        k: fixed ? 1 : ramp(t, ...T.bCheck.fails, lin),
        s: 1 + 0.12 * flash(t, ...T.bFix.tag),
      });
      const fadeB = 1 - ramp(t, ...T.bFix.fade, lin);
      V.place(arrowB, { o: fadeB });
      L5.drawOn(arrowB, STALL * ramp(t, ...T.bAsk.arrow, lin));
      const slow = t >= T.bAsk.slow[0];
      const farK = ramp(t, ...T.b.far, lin);
      const glide = ramp(t, T.bAsk.slow[0], T.bAsk.slow[1], E.out);
      const farLeft = left(MID_X, "minutes away");
      const slowLeft = left(STALL_X, "too slow");
      minutes.set({
        text: slow ? "too slow" : "minutes away",
        tone: slow ? "red" : "grey",
        solid: slow,
        k: farK,
        x: (slowLeft - farLeft) * glide,
        s: 1 + 0.12 * flash(t, ...T.bAsk.slow),
        o: fadeB,
      });
    };
  }

  V.scene({
    kicker: "TWO WAYS TO COPE",
    title: ["Ask again,", "or fix it yourself"],
    dur: 11.5,
    caps: [
      [0.4, 2.3, "A download checks every frame."],
      [2.9, 5, "Check fails, so ask for a resend."],
      [6.4, 8.3, "A probe far away cannot wait."],
      [9.5, 11.2, "So it must repair errors itself."],
    ],
    build,
  });
})();
