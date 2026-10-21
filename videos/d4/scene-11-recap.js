/* Lecture 4 (ds-4) · Replication, scene 11-recap: three rows, each a small pictogram and one bold line (bare scene).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row
   (times below are pictogram time), 5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no
   fade, no reset), so for the last 2.5 seconds only Pebble's bob moves.
   Row 1 (blue): one leader takes the writes. A blue leader card with a crown and two grey follower cards; two purple dots flow
          from the leader to the followers (the log) and the followers turn green.
   Row 2 (green): waiting is safer but slower. Two orange bars grow: a short one (answer at once) ends in a red cross, a long one
          (wait for the followers) ends in a green tick.
   Row 3 (red): a crash is survivable. A red bolt hits a grey node, a blue crown hops to a green node and a phone shows a green tick
          (the page still reads what it wrote).
   Every number comes from the D4 helpers (D4.SYNC for the bars) and is asserted when the scene is built. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
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
  const START = APPEAR.map((a) => a + 0.4);
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };
  const NEXT = "Next: Workshop 4.W";

  // ---------- row 1: one leader, the log flows to the followers ----------
  function leaderLog(pic) {
    const leader = D4.card(pic, { x: 14, y: 35, w: 100, h: 70, text: "L", tone: "blue", plain: false, fs: 32 });
    const fA = D4.card(pic, { x: 226, y: 2, w: 100, h: 62, text: "A", tone: "grey", plain: false, fs: 32 });
    const fB = D4.card(pic, { x: 226, y: 76, w: 100, h: 62, text: "B", tone: "grey", plain: false, fs: 32 });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const crown = svg.appendChild(D4.crown(96, 30, 34, "blue"));
    const dots = [
      D4.disc(pic, { x: 114, y: 70, size: 28, text: "", tone: "purple" }),
      D4.disc(pic, { x: 114, y: 70, size: 28, text: "", tone: "purple" }),
    ];
    const ends = [
      { x: 226, y: 33 },
      { x: 226, y: 107 },
    ];
    const FLOW = { start: 0.9, dur: 1.2, step: 0.3 };
    return (t) => {
      const q = t - START[0];
      const k = ramp(q, 0.1, 0.5, E.lin);
      leader.set({ k });
      fA.set({ k: ramp(q, 0.2, 0.6, E.lin) });
      fB.set({ k: ramp(q, 0.3, 0.7, E.lin) });
      V.place(crown, { s: 0.6 + 0.4 * E.pop(ramp(q, 0.3, 0.7, E.lin)), o: ramp(q, 0.3, 0.7, E.lin) });
      dots.forEach((d, i) => {
        const s0 = FLOW.start + FLOW.step * i;
        const f = clamp((q - s0) / FLOW.dur);
        const p = D4.at({ x: 114, y: 70 }, ends[i], E.inOut(f), 0);
        d.set({ x: p.x - 114, y: p.y - 70, k: q >= s0 && q < s0 + FLOW.dur ? 1 : 0 });
      });
      [fA, fB].forEach((card, i) => {
        const at = FLOW.start + FLOW.step * i + FLOW.dur;
        const done = q >= at;
        card.set({
          tone: done ? "green" : "grey",
          plain: false,
          k: ramp(q, 0.2 + 0.1 * i, 0.6 + 0.1 * i, E.lin),
          s: 1 + 0.12 * flash(q, at, at + 0.3),
        });
      });
    };
  }

  // ---------- row 2: waiting is safer but slower ----------
  function waitBars(pic) {
    D4.same(
      "recap row 2: answering at once keeps no copy, waiting for all keeps two",
      [D4.SYNC.modes[0].lost, D4.SYNC.modes[2].left],
      [true, 2],
    );
    const short = D4.bar(pic, { x: 20, y: 22, w: 230, h: 34, tone: "orange" });
    const long = D4.bar(pic, { x: 20, y: 84, w: 230, h: 34, tone: "orange" });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const cross = svg.appendChild(L5.cross(296, 39, 40, "red"));
    const tick = svg.appendChild(L5.tick(296, 101, 48, "green", { ink: true, w: 8 }));
    const fills = [D4.SYNC.modes[0].ack / D4.SYNC.modes[2].ack + 0.05, 0.9]; // 5 ms of 95, and nearly the whole bar
    return (t) => {
      const q = t - START[1];
      const track = ramp(q, 0.1, 0.5, E.lin);
      const grow = ramp(q, 0.9, 2.6, E.out);
      short.set({ k: fills[0] * grow, o: track });
      long.set({ k: fills[1] * grow, o: track });
      const kc = ramp(q, 2.7, 3.1, E.lin);
      L5.drawOn(cross, kc);
      V.place(cross, { s: 0.6 + 0.4 * E.pop(kc), o: kc });
      const kt = ramp(q, 3.3, 3.8, E.lin);
      L5.drawOn(tick, ramp(kt, 0.2, 1, E.lin));
      V.place(tick, { s: 0.6 + 0.4 * E.pop(kt), o: kt });
    };
  }

  // ---------- row 3: a crash, a new leader, a page that still reads its own writes ----------
  function crashPromote(pic) {
    const dead = D4.card(pic, { x: 4, y: 40, w: 100, h: 70, text: "", tone: "grey", plain: false });
    const alive = D4.card(pic, { x: 124, y: 40, w: 100, h: 70, text: "", tone: "grey", plain: false });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const iconA = svg.appendChild(D4.server(54, 75, 46, "grey"));
    const iconB = svg.appendChild(D4.server(174, 75, 46, "grey"));
    const bolt = svg.appendChild(D4.bolt(54, 72, 70, "red"));
    const crown = svg.appendChild(D4.crown(54, 26, 40, "blue"));
    const phone = svg.appendChild(D4.phone(292, 76, 72, "grey"));
    const tick = svg.appendChild(L5.tick(318, 40, 40, "green", { ink: true, w: 8 }));
    return (t) => {
      const q = t - START[2];
      const k = ramp(q, 0.1, 0.5, E.lin);
      const down = ramp(q, 0.5, 0.9, E.lin);
      dead.set({ k, tone: down > 0.5 ? "red" : "grey", plain: false });
      const crowned = q >= 2.4;
      alive.set({ k, tone: crowned ? "green" : "grey", plain: false, s: 1 + 0.12 * flash(q, 2.4, 2.7) });
      V.place(iconA, { s: 0.6 + 0.4 * E.pop(k), o: k });
      V.place(iconB, { s: 0.6 + 0.4 * E.pop(k), o: k });
      V.place(bolt, { s: 0.5 + 0.5 * E.pop(down), o: down });
      // the crown hops from the dead node to the other one along an arc
      const f = E.inOut(ramp(q, 0.9, 2.4, E.lin));
      const p = D4.at({ x: 54, y: 26 }, { x: 174, y: 26 }, f, -38);
      const ck = ramp(q, 0.1, 0.5, E.lin) * (1 - 0.7 * ramp(q, 0.9, 1.1, E.lin) * (1 - f));
      V.place(crown, { x: p.x - 54, y: p.y - 26, s: 0.6 + 0.4 * E.pop(ck), o: ck });
      const pk = ramp(q, 2.9, 3.3, E.lin);
      V.place(phone, { s: 0.6 + 0.4 * E.pop(pk), o: pk });
      const tk = ramp(q, 3.2, 3.7, E.lin);
      L5.drawOn(tick, ramp(tk, 0.2, 1, E.lin));
      V.place(tick, { s: 0.6 + 0.4 * E.pop(tk), o: tk });
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
      // 30 px like the title card's kicker (the engine's .v-kicker is 24 px, below the 28 px minimum)
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP", style: { fontSize: "30px" } });
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "Copies keep it up:\none leader takes the writes", leaderLog],
        ["green", "Waiting is safer\nbut slower", waitBars],
        ["red", "Promote the freshest;\nread your own writes", crashPromote],
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
        text: NEXT,
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
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
