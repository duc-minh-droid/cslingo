/* Lecture 1 (ds-1), scene 08: fan-out. Approach 1 stores each post once and merges on read; approach 2 copies each post into
   every follower's mailbox; reads outnumber posts 65 to 1; 345,000 writes a second; a celebrity needs 87 s, so go hybrid.
   Story (local seconds): 0.3 counters, Cat and the "all tweets" box; 0.55-1.45 Cat's post flies in (writes 1); 2.6 Ana, the
   three people she follows and her timeline card; 2.95-4.65 three lookups (reads 3), each brings a tweet back; 4.7 they merge;
   5.25-5.55 swap (the counters dip to zero); 5.5-5.9 five mailboxes; 5.85-6.95 five copies fly out (writes 5, each mailbox
   lights up); 7.5-8.4 Ana's one lookup brings the whole timeline back in one go (reads 1); 9.3 two bars (4,600 versus 300,000)
   and the 65 tag; 10.2-11.7 chips 4,600 x 75 = 345,000; 13.45 bars 87 s versus 5 s; 14.75 the hybrid tag and the two groups it
   serves. Captions run at 17 characters a second or slower and start once their picture is on screen (caption 5 at 9.8, the
   ratio tag; caption 7 at 13.6, the celebrity bars). Counts and numbers all come from D1.TWEET and are asserted below. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D1.TWEET;
  const lin = E.lin;
  const FOLLOWEES = T.ana.followees; // Ben, Cat, Dev (Ana follows them)
  const FOLLOWERS = T.cat.followers; // Ana, Ben, Dev, Eli, Fay (they follow Cat)

  // ---------- timeline (every count is asserted against the lesson data below) ----------
  const CUT1 = [5.25, 5.55]; // approach 1 fades
  const SWAP = 5.4; // the counters are hidden at this moment and restart from zero
  const CUT2 = [9.0, 9.3]; // approach 2 fades
  const CUT3 = [13.25, 13.55]; // the bars fade
  const POST = [0.75, 1.45]; // Cat's post flies into the store
  const WRITE1 = [POST[1]];
  const LOOK = FOLLOWEES.map((_, i) => 2.95 + 0.5 * i); // a lookup leaves Ana's list
  const OUT = 0.3; // ... reaches the store 0.3 s later (one read)
  const BACK = 0.4; // ... and the tweet is back at Ana 0.4 s after that
  const HIT1 = LOOK.map((s) => s + OUT);
  const ARR1 = HIT1.map((s) => s + BACK);
  const MERGE = [ARR1[ARR1.length - 1] + 0.05, ARR1[ARR1.length - 1] + 0.4];
  const FAN = FOLLOWERS.map((_, i) => 5.85 + 0.14 * i); // each copy flies for 0.55 s
  const WRITE2 = FAN.map((s) => s + 0.55);
  const READ2 = 7.5;
  const HIT2 = [READ2 + 0.35];
  const ARR2 = HIT2[0] + 0.55;
  D1.same("writes with approach 1", [WRITE1.length, T.cat.writes1], [1, 1]);
  D1.same("reads with approach 1", [HIT1.length, T.ana.reads1], [3, 3]);
  D1.same("writes with approach 2", [WRITE2.length, T.cat.writes2], [5, 5]);
  D1.same("reads with approach 2", [HIT2.length, T.ana.reads2], [1, 1]);
  D1.same("Ana follows Cat and Cat's followers include Ana", [FOLLOWEES.includes("Cat"), FOLLOWERS[0]], [true, "Ana"]);
  D1.same("posts x followers", T.load.posts * T.load.fan, T.load.writes2);
  D1.same("reads per post", Math.round(T.load.ratio), 65);
  D1.same("celebrity seconds against the goal", [T.celeb.secs, T.celeb.target], [87, 5]);
  D1.same("celebrity copies at 345,000 a second", Math.round(T.celeb.followers / T.load.writes2), T.celeb.secs);

  // ---------- geometry (stage pixels) ----------
  const CAT = { x: 100, y: 270 };
  const HAND = { x: CAT.x + 66, y: CAT.y }; // where Cat's tweets start
  const ANA = { x: 790, y: 270 };
  const STORE = { x: 270, y: 165, w: 270, h: 240 };
  const SLOTS = [
    [330, 262],
    [405, 262],
    [480, 262],
    [330, 340],
    [405, 340],
    [480, 340],
  ]; // the six tweets in the store
  const MINE = 3; // Cat's new post lands here
  const PICKS = [2, MINE, 5]; // what Ben, Cat and Dev wrote
  const TL = { x: 656, y: 372, w: 260, h: 164 }; // Ana's timeline card
  const TS = [
    [710, 478],
    [786, 478],
    [862, 478],
  ]; // where the three tweets arrive, one by one
  const STACK = [
    [764, 488],
    [786, 478],
    [808, 468],
  ]; // ... and the merged pile
  const CHIP = { x: 664, y: 62, w: 82, h: 60, step: 88 };
  const ROW = { x: 410, w: 220, h: 76 };
  const ROW_Y = FOLLOWERS.map((_, i) => 118 + 88 * i);
  const BOX = (i) => [ROW.x + 43, ROW_Y[i] + 38]; // the mailbox icon of row i

  const count = (t, list) => list.filter((x) => t >= x).length;
  const bump = (t, list) => Math.max(0, ...list.map((x) => flash(t, x, x + 0.4)));
  const fade = (t, [a, b]) => 1 - ramp(t, a, b, lin);
  const pop = (t, a, d = 0.4) => ramp(t, a, a + d, E.pop);
  const kin = (t, a, d = 0.3) => ramp(t, a, a + d, lin);

  V.scene({
    kicker: "CASE STUDY: TIMELINES",
    title: ["Do the work", "on write or on read?"],
    dur: 16,
    caps: [
      [0.5, 2.6, "Approach 1: one write per post."],
      [2.8, 5.0, "Reading means 3 lookups and a merge."],
      [5.3, 7.3, "Approach 2: copy to each follower."],
      [7.4, 9.2, "Reading is one lookup."],
      [9.8, 11.55, "Reads outnumber posts 65 to 1."],
      [11.65, 13.5, "Copy on write: 345,000 a second."],
      [13.6, 15.95, "A celebrity needs 87 seconds: go hybrid."],
    ],
    build(stage) {
      // ----- counters, approach tags, people -----
      const writes = D1.stat(stage, { x: 26, y: 16, w: 290, label: "writes", tone: "orange" });
      const reads = D1.stat(stage, { x: 336, y: 16, w: 290, label: "reads", tone: "blue" });
      const approach = D1.tag(stage, { x: 20, y: 562, text: "Approach 1: merge on read", tone: "blue" });
      const cat = D1.user(stage, { x: CAT.x, y: CAT.y, size: 72, name: "Cat", tone: "blue" });
      const ana = D1.user(stage, { x: ANA.x, y: ANA.y, size: 72, name: "Ana" });
      const tl = D1.card(stage, { x: TL.x, y: TL.y, w: TL.w, h: TL.h });
      D1.label(tl.el, { x: 0, y: 10, w: TL.w - 6, text: "Ana's timeline" });

      // ----- approach 1: the store with six tweets, and the people Ana follows -----
      const store = D1.card(stage, { x: STORE.x, y: STORE.y, w: STORE.w, h: STORE.h });
      D1.label(store.el, { x: 0, y: 12, w: STORE.w - 6, text: "all tweets" });
      const pile = L5.svg(store.el, STORE.w - 6, STORE.h - 6);
      const stored = SLOTS.map((_, i) => (i === MINE ? null : pile.appendChild(D1.icon.envelope(0, 0, 56, "grey"))));
      const follows = D1.label(stage, { x: CHIP.x, y: 14, w: 260, text: "Ana follows", align: "left" });
      const chips = FOLLOWEES.map((n, i) =>
        D1.chip(stage, { x: CHIP.x + i * CHIP.step, y: CHIP.y, w: CHIP.w, h: CHIP.h, text: n, fs: 28 }),
      );
      const mergeX = STACK[1][0] - 64; // the tag is about 128 px wide: centre it under the card
      const merge = D1.tag(stage, { x: mergeX, y: TL.y + TL.h + 18, text: "merge", tone: "orange", solid: true });

      // ----- approach 2: five mailboxes (grey until the copy arrives, then purple) -----
      const rows = FOLLOWERS.map((name, i) => {
        const card = D1.card(stage, { x: ROW.x, y: ROW_Y[i], w: ROW.w, h: ROW.h });
        const lab = D1.label(card.el, { x: 84, y: 18, w: 120, text: name, align: "left" });
        const svg = L5.svg(card.el, ROW.w - 6, ROW.h - 6);
        const off = svg.appendChild(D1.icon.mailbox(0, 0, 50, "grey"));
        const on = svg.appendChild(D1.icon.mailbox(0, 0, 50, "purple"));
        return { card, lab, off, on };
      });

      // ----- phase B: posts against reads, then 4,600 x 75 = 345,000 -----
      const lblPosts = D1.label(stage, { x: 20, y: 14, w: 520, text: "posts per second", align: "left" });
      const barPosts = D1.bar(stage, { x: 20, y: 52, w: 760, h: 56, tone: "blue" });
      const lblReads = D1.label(stage, { x: 20, y: 136, w: 620, text: "timeline reads per second", align: "left" });
      const barReads = D1.bar(stage, { x: 20, y: 174, w: 760, h: 56, tone: "blue" });
      const ratio = D1.tag(stage, {
        x: 20,
        y: 258,
        text: `${Math.round(T.load.ratio)} reads per post`,
        tone: "orange",
        solid: true,
      });
      const CW = [170, 120, 270];
      const CX0 = Math.round((936 - (CW[0] + CW[1] + CW[2] + 2 * 72)) / 2);
      const cx = [CX0, CX0 + CW[0] + 72, CX0 + CW[0] + CW[1] + 144];
      const cow = D1.tag(stage, { x: CX0, y: 360, text: "copy on write", tone: "purple" });
      const chipRow = [
        { text: D1.fmt(T.load.posts), tone: "blue", note: "posts / s", solid: false },
        { text: String(T.load.fan), tone: "purple", note: "followers each", solid: false },
        { text: D1.fmt(T.load.writes2), tone: "orange", note: "writes / s", solid: true },
      ].map((r, i) => ({
        ...r,
        chip: D1.chip(stage, { x: cx[i], y: 430, w: CW[i], h: 84, tone: r.tone, solid: r.solid, fs: 44 }),
        note_: D1.label(stage, { x: cx[i] + CW[i] / 2 - 120, y: 528, w: 240, text: r.note }),
      }));

      // ----- phase C: the celebrity, then the hybrid and who it serves -----
      const lblC1 = D1.label(stage, {
        x: 130,
        y: 14,
        w: 790,
        text: `celebrity: ${D1.fmt(T.celeb.followers)} copies at ${D1.fmt(T.load.writes2)} / s`,
        tone: "orange",
        align: "left",
      });
      const barC1 = D1.bar(stage, { x: 130, y: 62, w: 700, h: 56, tone: "red" });
      const lblC2 = D1.label(stage, { x: 130, y: 152, w: 780, text: "our goal", tone: "green", align: "left" });
      const barC2 = D1.bar(stage, { x: 130, y: 200, w: 700, h: 56, tone: "green" });
      const hybrid = D1.tag(stage, {
        x: 468 - 77, // about 154 px wide, centred on the stage
        y: 304,
        text: "hybrid",
        tone: "purple",
        solid: true,
        fs: 36,
        h: 68,
      });
      const group = (x, tone, who, how, icon) => {
        const card = D1.card(stage, { x, y: 424, w: 440, h: 132, tone, plain: false });
        const g = L5.svg(card.el, 434, 126);
        g.appendChild(icon);
        D1.label(card.el, { x: 134, y: 24, w: 280, text: who, tone, align: "left", bold: true }).set({
          tone,
          bold: true,
        });
        D1.label(card.el, { x: 134, y: 68, w: 280, text: how, tone, align: "left" }).set({ tone });
        return card;
      };
      const grpUsers = group(20, "purple", "most users", "copy on write", D1.icon.mailbox(58, 60, 78, "purple"));
      const grpStars = group(476, "blue", "celebrities", "merge on read", D1.icon.db(58, 62, 84, "blue"));

      // ----- icons (an svg layer above the cards) -----
      const svg = L5.svg(stage);
      const put = (g) => svg.appendChild(g);
      const trail = FOLLOWERS.map(() =>
        put(
          V.s("line", {
            x1: HAND.x,
            y1: HAND.y,
            x2: HAND.x,
            y2: HAND.y,
            "stroke-width": 5,
            "stroke-linecap": "round",
            style: { stroke: D1.tone("purple").edge, strokeDasharray: "1 12" },
          }),
        ),
      );
      const envPost = put(D1.icon.envelope(0, 0, 56, "blue"));
      const envBack = FOLLOWEES.map(() => put(D1.icon.envelope(0, 0, 60, "blue")));
      const envFan = FOLLOWERS.map(() => put(D1.icon.envelope(0, 0, 48, "purple")));
      const bundle = put(
        V.s("g", {}, ...STACK.map(([x, y]) => D1.icon.envelope(x - STACK[1][0], y - STACK[1][1], 60, "blue"))),
      );
      const ring = put(
        V.s("rect", {
          x: ROW.x - 8,
          y: ROW_Y[0] - 8,
          width: ROW.w + 16,
          height: ROW.h + 16,
          rx: 32,
          fill: "none",
          "stroke-width": 6,
          style: { stroke: D1.tone("blue").c },
        }),
      );
      const armL = put(L5.arrow(430, 384, 262, 416, "grey", 1, { w: 6, head: 22 }));
      const armR = put(L5.arrow(506, 384, 674, 416, "grey", 1, { w: 6, head: 22 }));
      const clock1 = put(D1.icon.clock(0, 0, 64, "red"));
      const clock2 = put(D1.icon.clock(0, 0, 64, "green"));
      const times = put(D1.mark("times", 0, 0, 40, "grey"));
      const equals = put(D1.mark("equals", 0, 0, 40, "grey"));
      // moving lookups (HTML, above the svg)
      const lookTok = FOLLOWEES.map(() => D1.token(stage, { tone: "blue", size: 30, square: true }));
      const lookTok2 = D1.token(stage, { tone: "blue", size: 30, square: true });

      // ----- paths -----
      const chipC = FOLLOWEES.map((_, i) => CHIP.x + i * CHIP.step + CHIP.w / 2);
      const postP = D1.poly([[HAND.x, HAND.y], SLOTS[MINE]]);
      const outP = chipC.map((x, i) => D1.poly([[x, CHIP.y + CHIP.h + 10], SLOTS[PICKS[i]]]));
      const backP = PICKS.map((p, i) => D1.poly([SLOTS[p], TS[i]]));
      const flyP = FOLLOWERS.map((_, i) => D1.poly([[HAND.x, HAND.y], BOX(i)]));
      const rowEdge = [ROW.x + ROW.w + 8, ROW_Y[0] + ROW.h / 2];
      const readOut = D1.poly([[ANA.x - 34, ANA.y - 20], rowEdge]);
      const readBack = D1.poly([rowEdge, STACK[1]]);
      const place = (g, p, extra = {}) => V.place(g, { x: p.x, y: p.y, ...extra });
      const gone = (g) => V.place(g, { o: 0 });

      return (t) => {
        const a1 = fade(t, CUT1);
        const a2 = fade(t, CUT2);
        const aB = fade(t, CUT3);
        const second = t >= SWAP;

        // counters: they dip while the approach changes, then restart from zero
        const dip = Math.min(1 - flash(t, CUT1[0], CUT1[1]), a2);
        const wb = 0.6 * bump(t, second ? WRITE2 : WRITE1);
        const rb = 0.6 * bump(t, second ? HIT2 : HIT1);
        writes.set({
          text: String(second ? count(t, WRITE2) : count(t, WRITE1)),
          k: kin(t, 0.3, 0.4),
          o: dip,
          bump: wb,
        });
        reads.set({ text: String(second ? count(t, HIT2) : count(t, HIT1)), k: kin(t, 0.3, 0.4), o: dip, bump: rb });

        // the people and the timeline card stay for both approaches
        cat.set({ k: kin(t, 0.3), o: a2 });
        ana.set({ k: kin(t, 2.6), o: a2 });
        tl.set({ k: kin(t, 2.7, 0.35), o: a2 });

        // ----- approach 1 -----
        approach.set({
          text: second ? "Approach 2: copy on write" : "Approach 1: merge on read",
          tone: second ? "purple" : "blue",
          k: kin(t, 0.3, 0.4),
          o: dip,
        });
        store.set({ k: kin(t, 0.3, 0.4), o: a1 });
        stored.forEach((g, i) => {
          if (!g) return;
          const pulse = PICKS.includes(i) ? flash(t, HIT1[PICKS.indexOf(i)], HIT1[PICKS.indexOf(i)] + 0.35) : 0;
          V.place(g, {
            x: SLOTS[i][0] - STORE.x - 3,
            y: SLOTS[i][1] - STORE.y - 3,
            s: pop(t, 0.45 + 0.07 * i) * (1 + 0.3 * pulse),
            o: kin(t, 0.45 + 0.07 * i, 0.15),
          });
        });
        const pf = ramp(t, POST[0], POST[1], E.inOut);
        const mine = flash(t, HIT1[1], HIT1[1] + 0.35);
        if (t >= 0.55) {
          place(envPost, postP.at(pf), {
            s: lerp(0.5 + 0.5 * pop(t, 0.55, 0.3), 1, pf) * (1 + 0.3 * mine),
            o: a1,
          });
        } else gone(envPost);
        follows.set({ k: kin(t, 2.65), o: a1 });
        chips.forEach((c, i) => {
          const lit = t >= LOOK[i];
          c.set({ k: kin(t, 2.65 + 0.08 * i), o: a1, tone: lit ? "blue" : "grey", solid: lit });
        });
        FOLLOWEES.forEach((_, i) => {
          const flying = t >= LOOK[i] && t < HIT1[i] + 0.02;
          const out = flying ? outP[i].at(ramp(t, LOOK[i], HIT1[i], E.inOut)) : { x: 0, y: 0 };
          lookTok[i].set({ ...out, o: flying ? a1 : 0 });
          if (t >= HIT1[i]) {
            const f = ramp(t, HIT1[i], ARR1[i], E.inOut);
            const p = backP[i].at(f);
            const mk = ramp(t, MERGE[0], MERGE[1], E.inOut);
            V.place(envBack[i], {
              x: lerp(p.x, STACK[i][0], mk),
              y: lerp(p.y, STACK[i][1], mk),
              s: lerp(0.8, 1, f),
              o: a1,
            });
          } else gone(envBack[i]);
        });
        merge.set({ k: kin(t, MERGE[0], 0.3), o: a1 });

        // ----- approach 2 -----
        rows.forEach((r, i) => {
          const done = t >= WRITE2[i];
          const k0 = 5.5 + 0.08 * i;
          r.card.set({ tone: done ? "purple" : "grey", plain: !done, k: kin(t, k0, 0.35), o: a2 });
          r.lab.set({ tone: done ? "purple" : "grey" });
          V.place(r.off, { x: 37, y: 31, o: done ? 0 : 1 });
          V.place(r.on, { x: 37, y: 31, s: 1 + 0.25 * flash(t, WRITE2[i], WRITE2[i] + 0.35), o: done ? 1 : 0 });
          const f = ramp(t, FAN[i], WRITE2[i], E.inOut);
          const p = flyP[i].at(f);
          trail[i].setAttribute("x2", D1.f1(p.x));
          trail[i].setAttribute("y2", D1.f1(p.y));
          trail[i].style.opacity = t >= FAN[i] && a2 > 0 ? String(0.9 * a2) : "0";
          if (t >= FAN[i] && t < WRITE2[i]) {
            place(envFan[i], p, { s: lerp(1, 0.55, ramp(f, 0.7, 1, lin)), o: a2 * (1 - ramp(f, 0.85, 1, lin)) });
          } else gone(envFan[i]);
        });
        // Ana's one lookup: her mailbox is read, and the whole timeline comes back in one go
        const rk = ramp(t, READ2 - 0.15, READ2 + 0.1, E.pop);
        V.place(ring, { s: rk, o: Math.min(1, rk * 3) * a2 });
        const flying2 = t >= READ2 && t < HIT2[0] + 0.02;
        const out2 = flying2 ? readOut.at(ramp(t, READ2, HIT2[0], E.inOut)) : { x: 0, y: 0 };
        lookTok2.set({ ...out2, o: flying2 ? a2 : 0 });
        if (t >= HIT2[0]) {
          const f = ramp(t, HIT2[0], ARR2, E.inOut);
          place(bundle, readBack.at(f), { s: lerp(0.6, 1, f), o: a2 });
        } else gone(bundle);

        // ----- phase B -----
        lblPosts.set({ k: kin(t, 9.3), o: aB });
        const bar1 = ramp(t, 9.35, 9.65, E.out);
        const bar2 = ramp(t, 9.45, 9.8, E.out);
        barPosts.set({
          v: (T.load.posts / T.load.reads) * bar1,
          text: bar1 > 0.9 ? D1.fmt(T.load.posts) : "",
          k: kin(t, 9.3),
          o: aB,
        });
        lblReads.set({ k: kin(t, 9.4), o: aB });
        barReads.set({ v: bar2, text: bar2 > 0.9 ? D1.fmt(T.load.reads) : "", k: kin(t, 9.4), o: aB });
        ratio.set({ k: kin(t, 9.8), o: aB });
        cow.set({ k: kin(t, 10.2), o: aB });
        const cT = [10.35, 10.85, 11.3];
        chipRow.forEach((r, i) => {
          r.chip.set({ text: r.text, tone: r.tone, solid: r.solid, k: kin(t, cT[i]), o: aB });
          r.note_.set({ k: kin(t, cT[i] + 0.1), o: aB });
        });
        const mk = (g, x, t0) => V.place(g, { x, y: 472, s: pop(t, t0), o: kin(t, t0, 0.15) * aB });
        mk(times, cx[0] + CW[0] + 36, 10.7);
        mk(equals, cx[1] + CW[1] + 36, 11.15);

        // ----- phase C -----
        const u = ramp(t, 13.65, 14.5, lin);
        lblC1.set({ k: kin(t, 13.45), o: 1 });
        V.place(clock1, { x: 66, y: 90, s: pop(t, 13.45), o: kin(t, 13.45, 0.15) });
        barC1.set({ v: u, text: u > 0.88 ? `${T.celeb.secs} s` : "", k: kin(t, 13.45), o: 1 });
        lblC2.set({ k: kin(t, 13.55), o: 1 });
        V.place(clock2, { x: 66, y: 228, s: pop(t, 13.55), o: kin(t, 13.55, 0.15) });
        barC2.set({
          v: Math.min(u, T.celeb.target / T.celeb.secs),
          text: u > 0.1 ? `${T.celeb.target} s` : "",
          k: kin(t, 13.55),
          o: 1,
        });
        hybrid.set({ k: kin(t, 14.75), o: 1 });
        L5.drawOn(armL, ramp(t, 14.95, 15.25, lin));
        L5.drawOn(armR, ramp(t, 15.1, 15.4, lin));
        grpUsers.set({ k: kin(t, 15.1, 0.35), o: 1 });
        grpStars.set({ k: kin(t, 15.3, 0.35), o: 1 });
      };
    },
  });
})();
