/* Phase 6 · scene 06-resend (11.5 s): detection alone is enough when the receiver can ask again (a download), but a far-away
   probe cannot wait for the answer, so its code must repair errors by itself. Two stacked panels, played one after the other.
   Every bit comes from A6.ARQ (the parity frame 11010010 whose 4th bit flips) and A6.HAM (the codeword 0110011 whose
   6th position flips); nothing is typed here.
   Panel A (top), local seconds: 0.15-0.75 the panel, its title and the wire appear (panel A starts centred in the stage and
   slides up at 5.55-6.0 to make room for B); 1.0 the frame pops at the sender, 1.2-2.4 it slides to the receiver; 1.7-2.4 noise
   (a bolt) flips the 4th bit red; 2.5-2.9 a red cross (the check fails), 2.7 "check fails"; 3.0-3.8 the orange return arrow
   draws, 3.1 "send again"; 3.9 the damaged frame goes, 4.1-5.2 a clean frame is sent again; 5.2-5.5 the cross becomes a tick.
   Panel B (bottom): 5.9-6.5 the panel and a dotted, long wire; 6.3 "minutes away"; 6.65-7.8 the Hamming codeword travels; 7.0-7.5
   noise flips position 6; 7.9-8.3 red cross, 8.1 "check fails"; 8.3-9.4 the return arrow crawls and stalls at about a fifth of
   the way (a dotted trail shows the long way home); 9.2 the tag becomes "too slow"; 9.6-10.05 the receiver flips the bit back itself (green), the cross becomes a tick
   and the verdict reads "fixed on arrival". */
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
  A6.same(
    "resend: download frame and its damaged copy",
    [ARQ.frame, ARQ.bad, ARQ.frame.length],
    ["11010010", "11000010", 8],
  );
  A6.same("resend: the damaged frame has an odd count of 1s", [A6.ones(ARQ.bad) % 2, A6.ones(ARQ.frame) % 2], [1, 0]);
  A6.same("resend: download flip", [ARQ.frame[HIT_A], ARQ.bad[HIT_A], A6.diffAt(ARQ.frame, ARQ.bad)], ["1", "0", [3]]);
  A6.same("resend: probe flip", [HAM.cw[HIT_B], HAM.one.recv[HIT_B], A6.diffAt(HAM.cw, HAM.one.recv)], ["1", "0", [5]]);
  A6.same("resend: the probe's code repairs itself", [A6.hFix(HAM.one.recv), HAM.one.at], [HAM.cw, 6]);

  // ---------- layout (stage px; both panels use local coordinates, y = 0 is the top of the panel) ----------
  const PANEL_H = 280;
  const OY_A = 0; // where panel A ends up
  const OY_B = 330;
  const A_DROP = 170; // panel A starts this far lower, centred in the stage while it is alone
  const SND = { x: 16, w: 130, y: 118, h: 84 }; // sender stub (centred on the wire, y 160)
  const RCV = { x: 790, w: 130, y: 118, h: 84 }; // receiver stub
  const WIRE_Y = 160;
  const WIRE_X0 = SND.x + SND.w;
  const WIRE_LEN = RCV.x - WIRE_X0;
  const PKT = { x: 164, y: 134, size: 52, gap: 4, fs: 30 };
  const widthOf = (n) => n * PKT.size + (n - 1) * PKT.gap;
  const DX_A = RCV.x - 16 - PKT.x - widthOf(ARQ.frame.length); // 166: the frame stops just left of the receiver
  const DX_B = RCV.x - 16 - PKT.x - widthOf(HAM.cw.length); // 222
  const MID_X = (WIRE_X0 + RCV.x) / 2; // 468: the middle of the wire
  const ICON = { x: RCV.x + RCV.w / 2 + 1, y: 60, size: 64 };
  const VERDICT_Y = 216; // the verdict tag sits under the receiver
  const ARROW = { y: 100, head: 24, tip0: RCV.x - 24, tip1: 150 }; // the return arrow: its head runs from tip0 to tip1
  const STALL = 0.22; // how far the return arrow gets in panel B
  const tipX = (p) => ARROW.tip0 - (ARROW.tip0 - ARROW.tip1) * p;
  const left = (centre, text) => Math.round(centre - A6.tagW(text) / 2);

  // ---------- timeline ----------
  const T = {
    a: { card: [0.15, 0.5], title: [0.3, 0.55], stubs: [0.3, 0.65], wire: [0.35, 0.75], rise: [5.55, 6.0] },
    a1: {
      pop: 1.0,
      slide: [1.2, 2.4],
      tag: [1.15, 1.4],
      bolt: [1.7, 1.95, 2.15, 2.4],
      flip: [1.9, 2.3],
      out: [3.9, 4.0],
    },
    aCheck: { arrive: [2.4, 2.7], cross: [2.5, 2.9], fails: [2.7, 2.95] },
    aAsk: { arrow: [3.0, 3.8], tag: [3.1, 3.35], sender: [3.8, 4.1], fade: [5.0, 5.3] },
    a2: { pop: 4.1, slide: [4.2, 5.2], tag: [4.2, 4.45] },
    aOk: { arrive: [5.2, 5.5], crossOut: [5.2, 5.4], tick: [5.25, 5.55], tag: [5.25, 5.5] },
    b: { card: [5.9, 6.25], title: [6.0, 6.3], stubs: [6.05, 6.4], wire: [6.1, 6.5], far: [6.3, 6.55] },
    b1: { pop: 6.6, slide: [6.65, 7.8], bolt: [7.0, 7.2, 7.3, 7.5], flip: [7.1, 7.5] },
    bCheck: { arrive: [7.8, 8.1], cross: [7.9, 8.3], fails: [8.1, 8.35] },
    bAsk: { arrow: [8.3, 9.4], slow: [9.2, 9.55] },
    bFix: { flip: [9.6, 10.05], crossOut: [9.6, 9.8], tick: [9.75, 10.15], tag: [10.05, 10.3], fade: [9.6, 10.0] },
  };

  // ---------- small builders shared by both panels ----------
  const popped = (t, t0, i) => A6.seq(t, t0, 0.015, 0.22, i);
  const tileX = (i, dx) => PKT.x + i * (PKT.size + PKT.gap) + PKT.size / 2 + dx;

  /** A panel: an absolutely placed box (local coordinates) with its card, title tag and the two stubs. */
  function panel(stage, y, title) {
    const box = V.h("div", {
      style: { position: "absolute", left: "0px", top: `${y}px`, width: "936px", height: `${PANEL_H}px` },
    });
    stage.append(box);
    const card = A6.card(box, { x: 0, y: 0, w: 936, h: PANEL_H, tone: "grey", plain: true });
    const head = A6.tag(box, { x: 24, y: 14, text: title, tone: "grey" });
    const sender = A6.card(box, { ...SND, text: "sender", tone: "grey", plain: false });
    const receiver = A6.card(box, { ...RCV, text: "receiver", tone: "grey", plain: false });
    const draw = (t, tm, bump = {}) => {
      card.set({ k: ramp(t, ...tm.card, lin) });
      head.set({ k: ramp(t, ...tm.title, lin) });
      const k = ramp(t, ...tm.stubs, lin);
      sender.set({ k, s: 1 + 0.07 * (bump.sender || 0) });
      receiver.set({ k, s: 1 + 0.07 * (bump.receiver || 0) });
    };
    return { box, draw };
  }

  /** The orange return arrow: a line that grows from the receiver with its head leading (p 0..1 = the whole way). */
  function crawl(svg, y) {
    const c = A6.tone("orange").c;
    const line = svg.appendChild(
      V.s("line", { y1: y, y2: y, "stroke-width": 8, "stroke-linecap": "round", style: { stroke: c } }),
    );
    const tri = svg.appendChild(
      V.s("polygon", { "stroke-width": 3, "stroke-linejoin": "round", style: { fill: c, stroke: c } }),
    );
    return (p, o = 1) => {
      const tip = tipX(p);
      const h = ARROW.head;
      line.setAttribute("x1", String(RCV.x));
      line.setAttribute("x2", String(tip + h * 0.75));
      tri.setAttribute("points", `${tip},${y} ${tip + h},${y - h * 0.46} ${tip + h},${y + h * 0.46}`);
      const k = clamp(p * 40) * o;
      V.show(line, k);
      V.show(tri, k);
    };
  }

  /** The red cross and the green tick above the receiver. */
  function verdictIcons(svg) {
    const cross = svg.appendChild(L5.cross(ICON.x, ICON.y, ICON.size, "red", { w: 9, ink: true }));
    const tick = svg.appendChild(L5.tick(ICON.x, ICON.y, ICON.size, "green", { w: 9, ink: true }));
    return (t, crossAt, crossOut, tickAt) => {
      const ck = ramp(t, ...crossAt, lin);
      V.place(cross, { s: 0.6 + 0.4 * E.pop(ck), o: 1 - ramp(t, ...crossOut, lin) });
      L5.drawOn(cross, ck);
      const tk = ramp(t, ...tickAt, lin);
      V.place(tick, { s: 0.6 + 0.4 * E.pop(tk) });
      L5.drawOn(tick, tk);
    };
  }

  /** Draw one frame row at time t: pop at the sender, slide by dx, and (optionally) one tile `sp` that flips. */
  function drivePacket(row, t, { t0, slide, dx, fade = 1, sp }) {
    const x = dx * ramp(t, slide[0], slide[1], E.inOut);
    for (let i = 0; i < row.n; i++) {
      const k = popped(t, t0, i);
      const st = { x, s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) * fade };
      if (sp && i === sp.i) {
        const fk = ramp(t, ...sp.at, E.inOut);
        const solid = !!sp.solid && fk >= 0.5;
        row.flip(i, fk, { ...st, tone: sp.tone, from: sp.from, to: sp.to, toTone: sp.toTone, solid, hop: 8 });
      } else row.set(i, st);
    }
    return x;
  }

  /** A bolt riding above the tile it hits: in over [a, b], out over [c, d]. */
  function strike(g, at, x, t) {
    const [a, b, c, d] = at;
    const k = ramp(t, a, b, lin);
    const alive = k * (1 - ramp(t, c, d, lin));
    V.place(g, { x, y: -18 * (1 - E.out(k)), s: 0.4 + 0.7 * E.pop(k), o: Math.min(1, alive * 5) });
  }

  // ================= PANEL A: the download =================
  function buildA(stage) {
    const P = panel(stage, OY_A, "download");
    const b = P.box;
    const wire = V.h("div", {
      style: {
        position: "absolute",
        left: `${WIRE_X0}px`,
        top: `${WIRE_Y - 6}px`,
        width: `${WIRE_LEN}px`,
        height: "12px",
        borderRadius: "6px",
        background: "var(--line-2)",
      },
    });
    b.append(wire);
    const svg = L5.svg(b);
    const arrow = crawl(svg, ARROW.y);
    const icons = verdictIcons(svg);
    const sendAgain = A6.tag(b, {
      x: left(MID_X, "send again"),
      y: 14,
      text: "send again",
      tone: "orange",
      solid: true,
    });
    const verdict = A6.tag(b, { x: 700, y: VERDICT_Y, text: "check fails", h: 54, tone: "red" });
    const tagX = PKT.x + (widthOf(ARQ.frame.length) - A6.tagW("frame")) / 2;
    const frameTag = [0, 1].map(() => A6.tag(b, { x: tagX, y: PKT.y + PKT.size + 14, text: "frame", tone: "grey" }));
    const tones = [...Array(7).fill("grey"), "orange"];
    const row = () =>
      A6.bits(b, { x: PKT.x, y: PKT.y, bits: ARQ.frame, size: PKT.size, gap: PKT.gap, fs: PKT.fs, tones });
    const frames = [row(), row()];
    const bolt = L5.svg(b).appendChild(A6.bolt(0, 112, 70, "orange"));

    return (t) => {
      V.place(P.box, { y: A_DROP * (1 - ramp(t, ...T.a.rise, E.inOut)) });
      P.draw(t, T.a, {
        sender: flash(t, ...T.aAsk.sender),
        receiver: flash(t, ...T.aCheck.arrive) + flash(t, ...T.aOk.arrive),
      });
      wire.style.width = `${WIRE_LEN * ramp(t, ...T.a.wire, lin)}px`;
      V.show(wire, ramp(t, T.a.wire[0], T.a.wire[0] + 0.1, lin));

      // frame 1: travels, gets hit by noise, fails the check, goes
      const out1 = 1 - ramp(t, ...T.a1.out, lin);
      const dx1 = drivePacket(frames[0], t, {
        t0: T.a1.pop,
        slide: T.a1.slide,
        dx: DX_A,
        fade: out1,
        sp: { i: HIT_A, at: T.a1.flip, tone: "grey", from: ARQ.frame[HIT_A], to: ARQ.bad[HIT_A], toTone: "red" },
      });
      frameTag[0].set({ k: ramp(t, ...T.a1.tag, lin), x: dx1, o: out1 });
      strike(bolt, T.a1.bolt, tileX(HIT_A, dx1), t);

      // frame 2: the clean copy, sent again once the arrow has reached the sender
      const dx2 = drivePacket(frames[1], t, { t0: T.a2.pop, slide: T.a2.slide, dx: DX_A });
      frameTag[1].set({ k: ramp(t, ...T.a2.tag, lin), x: dx2 });

      // the verdict: red cross and "check fails", the return arrow, then (after the resend) a green tick
      icons(t, T.aCheck.cross, T.aOk.crossOut, T.aOk.tick);
      const ok = t >= T.aOk.tag[0];
      verdict.set({
        text: ok ? "check passes" : "check fails",
        tone: ok ? "green" : "red",
        k: ok ? 1 : ramp(t, ...T.aCheck.fails, lin),
        s: 1 + 0.12 * flash(t, ...T.aOk.tag),
      });
      const askOut = 1 - ramp(t, ...T.aAsk.fade, lin);
      arrow(ramp(t, ...T.aAsk.arrow, lin), askOut);
      sendAgain.set({ k: ramp(t, ...T.aAsk.tag, lin), o: askOut });
    };
  }

  // ================= PANEL B: the far-away probe =================
  function buildB(stage) {
    const P = panel(stage, OY_B, "far-away probe");
    const b = P.box;
    const svg = L5.svg(b);
    const wire = svg.appendChild(
      V.s("line", {
        x1: WIRE_X0,
        y1: WIRE_Y,
        x2: WIRE_X0,
        y2: WIRE_Y,
        "stroke-width": 12,
        "stroke-linecap": "round",
        "stroke-dasharray": "2 22",
        style: { stroke: "var(--line-2)" },
      }),
    );
    const trail = svg.appendChild(
      V.s("line", {
        x1: RCV.x,
        y1: ARROW.y,
        x2: ARROW.tip1 + ARROW.head,
        y2: ARROW.y,
        "stroke-width": 8,
        "stroke-linecap": "round",
        "stroke-dasharray": "2 22",
        style: { stroke: "var(--line-2)" },
      }),
    );
    const arrow = crawl(svg, ARROW.y);
    const icons = verdictIcons(svg);
    const far = A6.tag(b, { x: left(MID_X, "minutes away"), y: 14, text: "minutes away", tone: "grey" });
    const verdict = A6.tag(b, { x: 640, y: VERDICT_Y, text: "check fails", h: 54, tone: "red" });
    const tones = [...HAM.cw].map((_, i) => (HAM.checkPos.includes(A6.pos(i)) ? "orange" : "grey"));
    const frame = A6.bits(b, { x: PKT.x, y: PKT.y, bits: HAM.cw, size: PKT.size, gap: PKT.gap, fs: PKT.fs, tones });
    const bolt = L5.svg(b).appendChild(A6.bolt(0, 112, 70, "orange"));
    const farLeft = left(MID_X, "minutes away");
    const slowLeft = left(tipX(STALL) + ARROW.head / 2, "too slow"); // "too slow" sits over the stalled arrow
    const hit = { i: HIT_B, tone: "grey", from: HAM.cw[HIT_B], to: HAM.one.recv[HIT_B], toTone: "red", at: T.b1.flip };
    const fix = {
      i: HIT_B,
      tone: "red",
      from: HAM.one.recv[HIT_B],
      to: HAM.cw[HIT_B],
      toTone: "green",
      at: T.bFix.flip,
    };

    return (t) => {
      P.draw(t, T.b, { receiver: flash(t, ...T.bCheck.arrive) });
      const wk = ramp(t, ...T.b.wire, lin);
      wire.setAttribute("x2", String(WIRE_X0 + WIRE_LEN * wk));
      V.show(wire, wk > 0 ? 1 : 0);

      // the codeword travels; position 6 is hit, and later the receiver flips it back itself
      const dx = drivePacket(frame, t, {
        t0: T.b1.pop,
        slide: T.b1.slide,
        dx: DX_B,
        sp: t >= T.bFix.flip[0] ? { ...fix, solid: true } : hit,
      });
      strike(bolt, T.b1.bolt, tileX(HIT_B, dx), t);

      // the check fails; the return arrow crawls; the receiver does not wait
      icons(t, T.bCheck.cross, T.bFix.crossOut, T.bFix.tick);
      const fixed = t >= T.bFix.tag[0];
      verdict.set({
        text: fixed ? "fixed on arrival" : "check fails",
        tone: fixed ? "green" : "red",
        solid: fixed,
        k: fixed ? 1 : ramp(t, ...T.bCheck.fails, lin),
        s: 1 + 0.12 * flash(t, ...T.bFix.tag),
      });
      const fade = 1 - ramp(t, ...T.bFix.fade, lin);
      arrow(STALL * ramp(t, ...T.bAsk.arrow, lin), fade);
      V.show(trail, ramp(t, T.bAsk.arrow[0], T.bAsk.arrow[0] + 0.3, lin) * fade);
      const slow = t >= T.bAsk.slow[0];
      far.set({
        text: slow ? "too slow" : "minutes away",
        tone: slow ? "red" : "grey",
        solid: slow,
        k: ramp(t, ...T.b.far, lin),
        x: (slowLeft - farLeft) * ramp(t, ...T.bAsk.slow, E.out),
        s: 1 + 0.12 * flash(t, ...T.bAsk.slow),
        o: fade,
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
    build(stage) {
      const a = buildA(stage);
      const b = buildB(stage);
      return (t) => {
        a(t);
        b(t);
      };
    },
  });
})();
