/* Lecture 6 · scene 05 (isolation): two shoppers each pay 30 from a balance of 100 (lesson 6.2). Run 1: both read 100 before either
   writes, so both write 70 and one payment is lost. Run 2: one after the other gives 70 then 40. Then the four ACID letters.
   Every value comes from D6.ISO (the real read/write rules, asserted in common.js); the asserts below pin the moments the captions use.
   Local seconds: 0.3-0.8 scaffold, 0.6 + 0.45 * e the mixed bars land (reads 1.5, 1.7, writes 3.2, 3.4), 3.45 badge 'one payment
   lost', 4.2-4.5 reset, 4.6 + 0.35 * e the serial bars land (5.3, 5.9, 6.6, 7.3), 7.5 badge 'both counted', 8.2-8.6 fade,
   8.7 + 0.4 * i the ACID cards pop. Nothing moves after 10.8. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const { ramp, flash, ease: E } = V;
  const ISO = D6.ISO;

  // ---------- timing of the two runs (a run's op lands at at(e)) ----------
  const MIXED = { run: ISO.mixed, at: (e) => 0.6 + 0.45 * e };
  const SERIAL = { run: ISO.serial, at: (e) => 4.6 + 0.35 * e };
  const SWITCH = 4.35; // the reset: mixed run ends, serial run begins
  const BADGE_BAD = 3.45;
  const BADGE_OK = 7.5;
  const FADE = [8.2, 8.6];
  const ACID_AT = 8.7;
  const lastWrite = (r) => r.run.ops.filter((o) => o.kind === "write").slice(-1)[0];
  const firstWrite = (r) => r.run.ops.find((o) => o.kind === "write");

  // ---------- asserted moments (the captions rely on these) ----------
  const reads = ISO.mixed.ops.filter((o) => o.kind === "read");
  const writes = ISO.mixed.ops.filter((o) => o.kind === "write");
  D6.same(
    reads.map((o) => o.val),
    [100, 100],
    "scene 5: both shoppers read 100 first",
  );
  if (Math.max(...reads.map((o) => o.e)) > Math.min(...writes.map((o) => o.s)))
    throw new Error("scene 5: a mixed read ends after a write starts, so the shoppers did not both read first");
  D6.same(
    writes.map((o) => o.val),
    [70, 70],
    "scene 5: both write 70",
  );
  D6.close(MIXED.at(firstWrite(MIXED).e), 3.2, 0.1, "scene 5: the first mixed write lands near 3.2 s");
  D6.close(MIXED.at(lastWrite(MIXED).e), 3.4, 0.1, "scene 5: the second mixed write lands near 3.4 s");
  D6.close(SERIAL.at(lastWrite(SERIAL).e), 7.3, 0.1, "scene 5: the serial run ends near 7.3 s");
  D6.same(
    ISO.serial.ops.map((o) => o.val),
    [100, 70, 70, 40],
    "scene 5: one after the other reads 100, 70 and ends on 40",
  );
  D6.same([ISO.mixed.final, ISO.serial.final, ISO.lost], [70, 40, -30], "scene 5: 70 against the right 40");
  D6.same(D6.ACID.map((a) => a.k).join(""), "ACID", "scene 5: the four letters spell ACID");

  // ---------- geometry (stage px) ----------
  const TL = { x: 0, y: 116, w: 936, laneH: 112, labelW: 190 };
  const CARD = { w: 456, h: 160, y0: 180, gapY: 30, gapX: 24 };
  const cardX = (i) => (i % 2) * (CARD.w + CARD.gapX);
  const cardY = (i) => CARD.y0 + Math.floor(i / 2) * (CARD.h + CARD.gapY);
  const balanceAt = (r, t) => r.run.ops.reduce((b, o) => (t >= r.at(o.e) ? o.bal : b), ISO.balance);

  V.scene({
    kicker: "ACID · ISOLATION",
    title: ["Isolation keeps", "payments apart"],
    dur: 12.5,
    caps: [
      [0.6, 2.3, "Two shoppers each pay £30."],
      [1.8, 3.2, "Both read £100 first."],
      [3.5, 5.0, "Both write £70: one is lost."],
      [7.3, 8.7, "One at a time gives £40."],
      [8.8, 12.2, "ACID: atomic, consistent, isolated, durable."],
    ],
    build(stage) {
      const stat = D6.stat(stage, { x: 0, y: 0, w: 310, h: 80, label: "balance", tone: "blue" });
      const mode = D6.tag(stage, { x: 336, y: 11, text: "at the same moment", tone: "grey" });
      const pay = D6.tag(stage, { x: 684, y: 11, text: `each pays £${ISO.pay}`, tone: "blue" });
      const tl = D6.timeline(stage, { ...TL, T: ISO.T, lanes: ["Shopper X", "Shopper Y"], axis: false });
      const mkBars = (r) =>
        r.run.ops.map((o) => ({
          o,
          bar: tl.bar({
            lane: o.who === "X" ? 0 : 1,
            s: o.s,
            e: o.e,
            text: `${o.kind} ${o.val}`,
            tone: o.kind === "read" ? "blue" : "purple",
          }),
        }));
      const mixedBars = mkBars(MIXED);
      const serialBars = mkBars(SERIAL);
      const badge = V.l5.badge(stage, {
        x: 0,
        y: 372,
        w: 460,
        h: 68,
        invalid: "one payment lost",
        valid: "both counted",
      });
      const should = D6.tag(stage, { x: 490, y: 377, text: `should be £${ISO.serial.final}`, tone: "orange" });

      // the ACID cards (cards first, then discs, then text, so each sits on top of the one before)
      const acid = D6.ACID.map((a, i) => ({
        a,
        card: D6.card(stage, { x: cardX(i), y: cardY(i), w: CARD.w, h: CARD.h, text: "", tone: "purple", plain: true }),
      }));
      const head = D6.tag(stage, { x: 368, y: 72, text: "ACID", tone: "purple", solid: true, fs: 40, h: 72 });
      head.el.style.width = "200px";
      acid.forEach((c, i) => {
        c.disc = D6.disc(stage, { x: cardX(i) + 70, y: cardY(i) + CARD.h / 2, size: 90, text: c.a.k, tone: "purple" });
        c.word = D6.label(stage, {
          x: cardX(i) + 132,
          y: cardY(i) + 28,
          w: 310,
          text: c.a.word,
          tone: "purple",
          fs: 40,
          align: "left",
        });
        c.line = D6.label(stage, {
          x: cardX(i) + 132,
          y: cardY(i) + 90,
          w: 310,
          text: c.a.line,
          tone: "grey",
          fs: 30,
          align: "left",
        });
      });

      return (t) => {
        const fade = 1 - ramp(t, FADE[0], FADE[1]);
        const intro = ramp(t, 0.3, 0.8);
        const serialPhase = t >= SWITCH;
        const run = serialPhase ? SERIAL : MIXED;

        // balance stat: follows the ops of the run on show, a pulse whenever it changes
        const bal = balanceAt(run, t);
        const wrote = t >= run.at(firstWrite(run).e);
        const done = t >= run.at(lastWrite(run).e);
        const pulses = run.run.ops
          .filter((o) => o.kind === "write")
          .map((o) => flash(t, run.at(o.e), run.at(o.e) + 0.45));
        const bump = Math.max(flash(t, SWITCH, SWITCH + 0.4), ...pulses);
        const tone = serialPhase ? (done ? "green" : "blue") : wrote ? "red" : "blue";
        stat.set({ text: `£${bal}`, tone, solid: tone !== "blue", bump, k: intro, o: fade });

        // tags
        mode.set({
          text: serialPhase ? "one after the other" : "at the same moment",
          k: intro,
          o: (1 - flash(t, 4.2, 4.5)) * fade,
        });
        pay.set({ k: ramp(t, 0.5, 0.9), o: fade });
        tl.set({ k: intro, o: fade });

        // bars: each grows over the half second before it lands
        mixedBars.forEach(({ o, bar }) =>
          bar.set({
            k: ramp(t, MIXED.at(o.e) - 0.5, MIXED.at(o.e)),
            o: (1 - ramp(t, 4.2, 4.5)) * fade,
            ring: o.kind === "write" && t >= BADGE_BAD ? "red" : null,
          }),
        );
        serialBars.forEach(({ o, bar }) => bar.set({ k: ramp(t, SERIAL.at(o.e) - 0.5, SERIAL.at(o.e)), o: fade }));

        // verdict badge and the right answer
        const bAt = t >= BADGE_OK ? BADGE_OK : BADGE_BAD;
        const bState = t >= BADGE_OK ? "valid" : t >= BADGE_BAD && t < 4.5 ? "invalid" : "none";
        const bk = ramp(t, bAt, bAt + 0.4);
        badge(bState, bk);
        if (bState !== "none") {
          const bo = (bState === "invalid" ? 1 - ramp(t, 4.2, 4.5) : 1) * fade;
          V.place(badge.el, { s: 0.75 + 0.25 * E.pop(bk), o: Math.min(1, bk * 4) * bo });
        }
        should.set({
          k: ramp(t, 3.9, 4.3),
          tone: serialPhase && done ? "green" : "orange",
          o: fade,
        });

        // the four ACID cards
        head.set({ k: ramp(t, ACID_AT - 0.2, ACID_AT + 0.2) });
        acid.forEach((c, i) => {
          const at = ACID_AT + 0.4 * i;
          c.disc.set({ k: ramp(t, at, at + 0.3) });
          c.card.set({ k: ramp(t, at + 0.1, at + 0.4) });
          c.word.set({ k: ramp(t, at + 0.2, at + 0.45), bold: true });
          c.line.set({ k: ramp(t, at + 0.3, at + 0.55) });
        });
      };
    },
  });
})();
