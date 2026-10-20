/* Lecture 1 (ds-1), scene 08: fan-out. Approach 1 (merge on read) stores each post once and merges the posts of the people you
   follow when you read; approach 2 (fan-out on write) copies each post into every follower's mailbox; reads outnumber posts 65
   to 1, so Twitter fans out: 345,000 writes a second; a celebrity's 30 million copies would take 87 s against a 5 s goal, so
   celebrities are merged on read: the hybrid. The words are the lesson's: "post", "timeline" (the posts of the people you
   follow, defined on a tag), "mailbox" (a ready-made timeline, one per user), "lookups" (what a read costs in phase A) and
   "reads" (timeline views per second in phase B).
   Story (local seconds): 0.3 counters, Cat and the "all posts" box; 0.55-1.45 Cat's post flies in (writes 1); 2.35 Ana, the
   three people she follows and her timeline card; 2.7-4.6 three lookups (lookups 3), each brings a post back, then they merge;
   4.9-5.2 swap (the counters dip to zero); 5.1-5.9 five mailboxes; 5.5-6.6 five copies fly out (writes 5, each mailbox lights
   up); 6.9-7.8 Ana's one lookup brings the whole timeline back in one go (lookups 1); 8.8 two bars (4,600 versus 300,000) and
   the 65 tag; 10.2-11.6 chips 4,600 x 75 = 345,000 under "fan-out on write"; 13.85 bars 87 s versus 5 s; 16.35 the hybrid tag
   and the two big cards it serves, which then hold for 2.6 s. Captions run at 17 characters a second or slower and start once
   their picture is on screen. Counts and numbers all come from D1.TWEET and are asserted below. */
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
  const CUT1 = [4.9, 5.2]; // approach 1 fades
  const SWAP = 5.05; // the counters are hidden at this moment and restart from zero
  const CUT2 = [8.5, 8.8]; // approach 2 fades
  const CUT3 = [13.55, 13.85]; // the bars fade
  const POST = [0.75, 1.45]; // Cat's post flies into the store
  const WRITE1 = [POST[1]];
  const LOOK = FOLLOWEES.map((_, i) => 2.7 + 0.4 * i); // a lookup leaves Ana's list
  const OUT = 0.3; // ... reaches the store 0.3 s later (one lookup)
  const BACK = 0.4; // ... and the post is back at Ana 0.4 s after that
  const HIT1 = LOOK.map((s) => s + OUT);
  const ARR1 = HIT1.map((s) => s + BACK);
  const MERGE = [ARR1[ARR1.length - 1] + 0.05, ARR1[ARR1.length - 1] + 0.4];
  const FAN = FOLLOWERS.map((_, i) => 5.5 + 0.13 * i); // each copy flies for 0.55 s
  const WRITE2 = FAN.map((s) => s + 0.55);
  const READ2 = 6.9;
  const HIT2 = [READ2 + 0.35];
  const ARR2 = HIT2[0] + 0.55;
  const B0 = CUT2[1]; // phase B starts
  const C0 = CUT3[1]; // phase C starts
  const HYB = 16.35; // the hybrid tag; its cards follow
  D1.same("writes with approach 1", [WRITE1.length, T.cat.writes1], [1, 1]);
  D1.same("lookups with approach 1", [HIT1.length, T.ana.reads1], [3, 3]);
  D1.same("writes with approach 2", [WRITE2.length, T.cat.writes2], [5, 5]);
  D1.same("lookups with approach 2", [HIT2.length, T.ana.reads2], [1, 1]);
  D1.same("Ana follows Cat and Cat's followers include Ana", [FOLLOWEES.includes("Cat"), FOLLOWERS[0]], [true, "Ana"]);
  D1.same("posts x followers", T.load.posts * T.load.fan, T.load.writes2);
  D1.same("reads per post", Math.round(T.load.ratio), 65);
  D1.same("celebrity seconds against the goal", [T.celeb.secs, T.celeb.target], [87, 5]);
  D1.same("celebrity copies at 345,000 a second", Math.round(T.celeb.followers / T.load.writes2), T.celeb.secs);

  // ---------- geometry (stage pixels) ----------
  const CAT = { x: 100, y: 270 };
  const HAND = { x: CAT.x + 66, y: CAT.y }; // where Cat's posts start
  const ANA = { x: 790, y: 270 };
  const STORE = { x: 270, y: 165, w: 270, h: 240 };
  const SLOTS = [
    [330, 262],
    [405, 262],
    [480, 262],
    [330, 340],
    [405, 340],
    [480, 340],
  ]; // the six posts in the store
  const MINE = 3; // Cat's new post lands here
  const PICKS = [2, MINE, 5]; // what Ben, Cat and Dev wrote
  const TL = { x: 656, y: 372, w: 260, h: 164 }; // Ana's timeline card
  const TS = [
    [710, 478],
    [786, 478],
    [862, 478],
  ]; // where the three posts arrive, one by one
  const STACK = [
    [764, 488],
    [786, 478],
    [808, 468],
  ]; // ... and the merged pile
  const CHIP = { x: 664, y: 62, w: 82, h: 60, step: 88 };
  const ROW = { x: 410, w: 220, h: 64, pitch: 74, y0: 164 };
  const ROW_Y = FOLLOWERS.map((_, i) => ROW.y0 + ROW.pitch * i);
  const BOX = (i) => [ROW.x + 43, ROW_Y[i] + ROW.h / 2]; // the mailbox icon of row i
  // measured widths of the tags (D1.tagW is only an estimate)
  const TW = { merge: 128, ratio: 279, fan: 266, hybrid: 154 };

  const count = (t, list) => list.filter((x) => t >= x).length;
  const bump = (t, list) => Math.max(0, ...list.map((x) => flash(t, x, x + 0.4)));
  const fade = (t, [a, b]) => 1 - ramp(t, a, b, lin);
  const pop = (t, a, d = 0.4) => ramp(t, a, a + d, E.pop);
  const kin = (t, a, d = 0.3) => ramp(t, a, a + d, lin);

  V.scene({
    kicker: "CASE STUDY: TIMELINES",
    title: ["Do the work", "on write or on read?"],
    dur: 19.75,
    caps: [
      [1.0, 2.8, "Approach 1: one write per post."],
      [2.8, 4.9, `Reading means ${T.ana.reads1} lookups and a merge.`],
      [5.4, 7.4, "Approach 2: copy to each follower."],
      [7.45, 8.8, "Reading is one lookup."],
      [9.55, 11.35, `Reads outnumber posts ${Math.round(T.load.ratio)} to 1.`],
      [11.45, 13.55, `So fan out: ${D1.fmt(T.load.writes2)} writes a second.`],
      [14.65, 16.75, `A celebrity post takes ${T.celeb.secs} s, not ${T.celeb.target}.`],
      [16.85, 18.95, "Hybrid: celebrities merge on read."],
    ],
    build(stage) {
      // ----- counters, approach tags, people -----
      const writes = D1.stat(stage, { x: 20, y: 12, w: 262, label: "writes", tone: "orange" });
      const lookups = D1.stat(stage, { x: 296, y: 12, w: 296, label: "lookups", tone: "blue" });
      const approach = D1.tag(stage, { x: 20, y: 562, text: "Approach 1: merge on read", tone: "blue" });
      const cat = D1.user(stage, { x: CAT.x, y: CAT.y, size: 72, name: "Cat", tone: "blue" });
      const ana = D1.user(stage, { x: ANA.x, y: ANA.y, size: 72, name: "Ana" });
      const tl = D1.card(stage, { x: TL.x, y: TL.y, w: TL.w, h: TL.h });
      D1.label(tl.el, { x: 0, y: 10, w: TL.w - 6, text: "Ana's timeline" });
      // what a timeline is, said once, where Ana looks at it
      const tlDef = D1.tag(stage, { x: 506, y: 562, text: "timeline: posts she follows", tone: "grey" });

      // ----- approach 1: the store with six posts, and the people Ana follows -----
      const store = D1.card(stage, { x: STORE.x, y: STORE.y, w: STORE.w, h: STORE.h });
      D1.label(store.el, { x: 0, y: 12, w: STORE.w - 6, text: "all posts" });
      const pile = L5.svg(store.el, STORE.w - 6, STORE.h - 6);
      const stored = SLOTS.map((_, i) => (i === MINE ? null : pile.appendChild(D1.icon.envelope(0, 0, 56, "grey"))));
      const follows = D1.label(stage, { x: CHIP.x, y: 14, w: 260, text: "Ana follows", align: "left" });
      const chips = FOLLOWEES.map((n, i) =>
        D1.chip(stage, { x: CHIP.x + i * CHIP.step, y: CHIP.y, w: CHIP.w, h: CHIP.h, text: n, fs: 28 }),
      );
      // "merge" sits to the left of the timeline card, where the posts come together
      const merge = D1.tag(stage, {
        x: TL.x - TW.merge - 12,
        y: TL.y + 64,
        text: "merge",
        tone: "orange",
        solid: true,
      });

      // ----- approach 2: five mailboxes (grey until the copy arrives, then purple) -----
      const mailTag = D1.tag(stage, { x: ROW.x, y: 98, text: "mailboxes", tone: "purple" });
      const rows = FOLLOWERS.map((name, i) => {
        const card = D1.card(stage, { x: ROW.x, y: ROW_Y[i], w: ROW.w, h: ROW.h });
        const lab = D1.label(card.el, { x: 84, y: 14, w: 120, text: name, align: "left" });
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
      const fan = D1.tag(stage, { x: 468 - TW.fan / 2, y: 340, text: "fan-out on write", tone: "purple", solid: true });
      const chipRow = [
        { text: D1.fmt(T.load.posts), tone: "blue", note: "posts / s", solid: false },
        { text: String(T.load.fan), tone: "purple", note: "followers each", solid: false },
        { text: D1.fmt(T.load.writes2), tone: "orange", note: "writes / s", solid: true },
      ].map((r, i) => ({
        ...r,
        chip: D1.chip(stage, { x: cx[i], y: 424, w: CW[i], h: 84, tone: r.tone, solid: r.solid, fs: 44 }),
        note_: D1.label(stage, { x: cx[i] + CW[i] / 2 - 120, y: 522, w: 240, text: r.note }),
      }));

      // ----- phase C: the celebrity, then the hybrid and who it serves (big, and held at the end) -----
      const lblC1 = D1.label(stage, {
        x: 130,
        y: 12,
        w: 790,
        text: `${D1.fmt(T.celeb.followers)} copies at ${D1.fmt(T.load.writes2)} / s`,
        tone: "orange",
        align: "left",
      });
      const barC1 = D1.bar(stage, { x: 130, y: 50, w: 700, h: 56, tone: "red" });
      const lblC2 = D1.label(stage, { x: 130, y: 124, w: 780, text: "our goal", tone: "green", align: "left" });
      const barC2 = D1.bar(stage, { x: 130, y: 162, w: 700, h: 56, tone: "green" });
      const hybrid = D1.tag(stage, {
        x: 468 - TW.hybrid / 2,
        y: 250,
        text: "hybrid",
        tone: "purple",
        solid: true,
        fs: 36,
        h: 68,
      });
      const group = (x, tone, who, how, icon) => {
        const card = D1.card(stage, { x, y: 388, w: 440, h: 196, tone, plain: false });
        const g = L5.svg(card.el, 434, 190);
        g.appendChild(icon);
        D1.label(card.el, { x: 146, y: 36, w: 280, text: who, tone, align: "left", fs: 36, bold: true }).set({
          tone,
          bold: true,
        });
        D1.label(card.el, { x: 146, y: 98, w: 280, text: how, tone, align: "left", fs: 30 }).set({ tone });
        return card;
      };
      const grpUsers = group(20, "purple", "most users", "fan-out on write", D1.icon.mailbox(76, 94, 96, "purple"));
      const grpStars = group(476, "blue", "celebrities", "merge on read", D1.icon.db(76, 96, 100, "blue"));

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
      const armL = put(L5.arrow(430, 322, 262, 376, "grey", 1, { w: 6, head: 22 }));
      const armR = put(L5.arrow(506, 322, 674, 376, "grey", 1, { w: 6, head: 22 }));
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
        lookups.set({ text: String(second ? count(t, HIT2) : count(t, HIT1)), k: kin(t, 0.3, 0.4), o: dip, bump: rb });

        // the people and the timeline card stay for both approaches
        cat.set({ k: kin(t, 0.3), o: a2 });
        ana.set({ k: kin(t, 2.35), o: a2 });
        tl.set({ k: kin(t, 2.45, 0.35), o: a2 });
        tlDef.set({ k: kin(t, 2.5), o: a2 });

        // ----- approach 1 -----
        approach.set({
          text: second ? "Approach 2: fan-out on write" : "Approach 1: merge on read",
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
        follows.set({ k: kin(t, 2.4), o: a1 });
        chips.forEach((c, i) => {
          const lit = t >= LOOK[i];
          c.set({ k: kin(t, 2.4 + 0.08 * i), o: a1, tone: lit ? "blue" : "grey", solid: lit });
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
        mailTag.set({ k: kin(t, 5.25), o: a2 });
        rows.forEach((r, i) => {
          const done = t >= WRITE2[i];
          const k0 = 5.1 + 0.07 * i;
          r.card.set({ tone: done ? "purple" : "grey", plain: !done, k: kin(t, k0, 0.35), o: a2 });
          r.lab.set({ tone: done ? "purple" : "grey" });
          V.place(r.off, { x: 37, y: ROW.h / 2 - 3, o: done ? 0 : 1 });
          V.place(r.on, {
            x: 37,
            y: ROW.h / 2 - 3,
            s: 1 + 0.25 * flash(t, WRITE2[i], WRITE2[i] + 0.35),
            o: done ? 1 : 0,
          });
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
        lblPosts.set({ k: kin(t, B0 + 0.1), o: aB });
        const bar1 = ramp(t, B0 + 0.15, B0 + 0.45, E.out);
        const bar2 = ramp(t, B0 + 0.25, B0 + 0.6, E.out);
        barPosts.set({
          v: (T.load.posts / T.load.reads) * bar1,
          text: bar1 > 0.9 ? D1.fmt(T.load.posts) : "",
          k: kin(t, B0 + 0.1),
          o: aB,
        });
        lblReads.set({ k: kin(t, B0 + 0.2), o: aB });
        barReads.set({ v: bar2, text: bar2 > 0.9 ? D1.fmt(T.load.reads) : "", k: kin(t, B0 + 0.2), o: aB });
        ratio.set({ k: kin(t, B0 + 0.7), o: aB });
        fan.set({ k: kin(t, B0 + 1.35), o: aB });
        const cT = [B0 + 1.55, B0 + 2.0, B0 + 2.45];
        chipRow.forEach((r, i) => {
          r.chip.set({ text: r.text, tone: r.tone, solid: r.solid, k: kin(t, cT[i]), o: aB });
          r.note_.set({ k: kin(t, cT[i] + 0.1), o: aB });
        });
        const mk = (g, x, t0) => V.place(g, { x, y: 466, s: pop(t, t0), o: kin(t, t0, 0.15) * aB });
        mk(times, cx[0] + CW[0] + 36, cT[1] - 0.1);
        mk(equals, cx[1] + CW[1] + 36, cT[2] - 0.1);

        // ----- phase C -----
        const u = ramp(t, C0 + 0.2, C0 + 0.8, lin);
        lblC1.set({ k: kin(t, C0 + 0.05), o: 1 });
        V.place(clock1, { x: 66, y: 78, s: pop(t, C0 + 0.05), o: kin(t, C0 + 0.05, 0.15) });
        barC1.set({ v: u, text: u > 0.3 ? `${Math.round(T.celeb.secs * u)} s` : "", k: kin(t, C0 + 0.05), o: 1 });
        lblC2.set({ k: kin(t, C0 + 0.15), o: 1 });
        V.place(clock2, { x: 66, y: 190, s: pop(t, C0 + 0.15), o: kin(t, C0 + 0.15, 0.15) });
        barC2.set({
          v: Math.min(u, T.celeb.target / T.celeb.secs),
          text: u > 0.1 ? `${T.celeb.target} s` : "",
          k: kin(t, C0 + 0.15),
          o: 1,
        });
        hybrid.set({ k: kin(t, HYB), o: 1 });
        L5.drawOn(armL, ramp(t, HYB + 0.15, HYB + 0.45, lin));
        L5.drawOn(armR, ramp(t, HYB + 0.25, HYB + 0.55, lin));
        grpUsers.set({ k: kin(t, HYB + 0.2, 0.35), o: 1 });
        grpStars.set({ k: kin(t, HYB + 0.4, 0.35), o: 1 });
      };
    },
  });
})();
