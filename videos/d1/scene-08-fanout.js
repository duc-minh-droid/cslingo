/* Lecture 1 (ds-1), scene 08: fan-out. Approach 1 stores each post once and merges on read; approach 2 copies each post into
   every follower's mailbox; reads outnumber posts 65 to 1; 345,000 writes a second; a celebrity needs 87 s, so go hybrid.
   Story (local seconds): 0.3 counters, Cat and the "all tweets" box; 0.85 one post flies in (writes 1); 2.6 Ana and the three people
   she follows; 3.0-4.5 three lookups (reads 3) and a merge; 5.2 phase swap; 5.45 five mailboxes; 5.95-7.05 five copies (writes 5);
   7.3-8.65 Ana's one lookup (reads 1); 9.4 two bars (4,600 versus 300,000) and the 65 tag; 10.85 chips 4,600 x 75 = 345,000;
   13.4 bars 87 s versus 5 s and the hybrid tag. Caption 5 starts at 10.0 (the ratio tag), not 9.5, so it never runs ahead. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D1.TWEET;
  const lin = E.lin;
  const FOLLOWEES = T.ana.followees;
  const FOLLOWERS = T.cat.followers;

  // ---------- timeline, every count asserted against the lesson data ----------
  const CUT1 = [5.2, 5.5]; // approach 1 fades
  const CUT2 = [9.0, 9.4]; // approach 2 fades
  const CUT3 = [13.0, 13.4]; // the bars fade
  const RESET = 5.5; // the counters go back to zero
  const POST_AT = 0.85;
  const POST_FLY = 0.7;
  const WRITE1 = [POST_AT + POST_FLY];
  const LOOK = FOLLOWEES.map((_, i) => 3.0 + 0.5 * i); // each lookup: 0.25 s out, 0.25 s back
  const READ1 = LOOK.map((s) => s + 0.25);
  const FAN = FOLLOWERS.map((_, i) => 5.95 + 0.15 * i); // each copy flies for 0.55 s
  const WRITE2 = FAN.map((s) => s + 0.55);
  const LOOK2 = 7.65;
  const READ2 = [LOOK2 + 0.5];
  D1.same("writes with approach 1", [WRITE1.length, T.cat.writes1], [1, 1]);
  D1.same("reads with approach 1", [READ1.length, T.ana.reads1], [3, 3]);
  D1.same("writes with approach 2", [WRITE2.length, T.cat.writes2], [5, 5]);
  D1.same("reads with approach 2", [READ2.length, T.ana.reads2], [1, 1]);
  D1.same("posts x followers", T.load.posts * T.load.fan, T.load.writes2);
  D1.same("reads per post", Math.round(T.load.ratio), 65);
  D1.same("celebrity seconds against the goal", [T.celeb.secs, T.celeb.target], [87, 5]);
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
      [5.3, 7.2, "Approach 2: copy to each follower."],
      [7.3, 9.2, "Reading is one lookup."],
      [10.0, 11.65, "Reads outnumber posts 65 to 1."],
      [11.7, 13.5, "Copy on write: 345,000 a second."],
      [13.7, 15.8, "A celebrity needs 87 seconds: go hybrid."],
    ],
    build(stage) {
      // ----- cards, tags, labels (below the icons) -----
      const writes = D1.stat(stage, { x: 20, y: 0, w: 300, label: "writes", tone: "orange" });
      const reads = D1.stat(stage, { x: 340, y: 0, w: 300, label: "reads", tone: "blue" });
      const store = D1.card(stage, { x: 330, y: 230, w: 200, h: 160, text: "all tweets", tone: "grey" });
      const tag1 = D1.tag(stage, { x: 20, y: 566, text: "Approach 1: merge on read", tone: "blue" });
      const tag2 = D1.tag(stage, { x: 20, y: 566, text: "Approach 2: copy on write", tone: "purple" });
      const follows = D1.label(stage, { x: 650, y: 100, w: 272, text: "Ana follows", align: "left" });
      const chips = FOLLOWEES.map((n, i) => D1.chip(stage, { x: 650 + i * 94, y: 150, w: 84, h: 60, text: n, fs: 28 }));
      const mergeW = D1.tagW("merge");
      const merge = D1.tag(stage, { x: 790 - mergeW / 2, y: 388, text: "merge", tone: "orange", solid: true });
      const ROWS = [90, 190, 290, 390, 490];
      const mailTags = FOLLOWERS.map((n, i) => D1.tag(stage, { x: 744, y: ROWS[i] - 29, text: n, tone: "purple" }));
      const cat = D1.user(stage, { x: 100, y: 300, name: "Cat", tone: "blue" });
      const ana1 = D1.user(stage, { x: 790, y: 300, name: "Ana" });
      const ana2 = D1.user(stage, { x: 862, y: 96, size: 56, name: "" });
      // phase B: bars and chips
      const lblPosts = D1.label(stage, { x: 40, y: 22, w: 520, text: "posts per second", align: "left" });
      const barPosts = D1.bar(stage, { x: 40, y: 64, w: 560, tone: "blue" });
      const lblReads = D1.label(stage, { x: 40, y: 150, w: 520, text: "timeline reads per second", align: "left" });
      const barReads = D1.bar(stage, { x: 40, y: 192, w: 560, tone: "blue" });
      const ratio = D1.tag(stage, {
        x: 40,
        y: 280,
        text: `${Math.round(T.load.ratio)} reads per post`,
        tone: "orange",
        solid: true,
      });
      const CW = [150, 110, 230];
      const CX0 = Math.round((936 - (CW[0] + CW[1] + CW[2] + 80 + 64)) / 2);
      const cx = [CX0, CX0 + CW[0] + 16 + 40 + 16, CX0 + CW[0] + CW[1] + 2 * (16 + 40 + 16)];
      const mid = cx.map((x, i) => x + CW[i] / 2);
      const chipRow = [
        { text: D1.fmt(T.load.posts), tone: "blue", note: "posts / s", solid: false },
        { text: String(T.load.fan), tone: "purple", note: "followers", solid: false },
        { text: D1.fmt(T.load.writes2), tone: "orange", note: "writes / s", solid: true },
      ].map((r, i) => ({
        ...r,
        chip: D1.chip(stage, { x: cx[i], y: 392, w: CW[i], h: 76, tone: r.tone, solid: r.solid, fs: 40 }),
        note_: D1.label(stage, { x: mid[i] - 100, y: 484, w: 200, text: r.note }),
      }));
      // phase C: the celebrity
      const lblC1 = D1.label(stage, {
        x: 130,
        y: 22,
        w: 780,
        text: `celebrity post: ${D1.fmt(T.celeb.followers)} copies`,
        tone: "orange",
        align: "left",
      });
      const barC1 = D1.bar(stage, { x: 130, y: 70, w: 560, h: 56, tone: "red" });
      const lblC2 = D1.label(stage, { x: 130, y: 170, w: 780, text: "our goal", tone: "green", align: "left" });
      const barC2 = D1.bar(stage, { x: 130, y: 218, w: 560, h: 56, tone: "green" });
      const hybridText = "hybrid: most users on write, celebrities on read";
      const hybrid = D1.tag(stage, {
        x: Math.round((936 - D1.tagW(hybridText)) / 2),
        y: 400,
        text: hybridText,
        tone: "purple",
        solid: true,
      });

      // ----- icons (an svg layer above the cards) -----
      const svg = L5.svg(stage);
      const put = (g) => svg.appendChild(g);
      const envPost = put(D1.icon.envelope(0, 0, 56, "blue"));
      const envBack = FOLLOWEES.map(() => put(D1.icon.envelope(0, 0, 40, "blue")));
      const envFan = FOLLOWERS.map(() => put(D1.icon.envelope(0, 0, 44, "purple")));
      const boxes = ROWS.map((y) => put(D1.icon.mailbox(0, 0, 60, "purple")));
      const ring = put(
        V.s("circle", {
          cx: 0,
          cy: 0,
          r: 46,
          fill: "none",
          "stroke-width": 6,
          style: { stroke: D1.tone("blue").c },
        }),
      );
      const envBack2 = put(D1.icon.envelope(0, 0, 40, "blue"));
      const clock1 = put(D1.icon.clock(0, 0, 64, "red"));
      const clock2 = put(D1.icon.clock(0, 0, 64, "green"));
      const times = put(D1.mark("times", 0, 0, 40, "grey"));
      const equals = put(D1.mark("equals", 0, 0, 40, "grey"));
      // ----- moving tokens (HTML, above the svg) -----
      const lookTok = FOLLOWEES.map(() => D1.token(stage, { tone: "blue", size: 28, square: true }));
      const lookTok2 = D1.token(stage, { tone: "blue", size: 28, square: true });

      // ----- paths -----
      const postP = D1.poly([
        [152, 300],
        [430, 362],
      ]);
      const outP = D1.poly([
        [752, 300],
        [548, 318],
      ]);
      const EY = 482;
      const landX = FOLLOWEES.map((_, i) => 735 + 55 * i);
      const backP = landX.map((x) =>
        D1.poly([
          [548, 334],
          [x, EY],
        ]),
      );
      const flyP = ROWS.map((y) =>
        D1.poly([
          [150, 300],
          [700, y],
        ]),
      );
      const arcOut = D1.poly([
        [862, 64],
        [862, 30],
        [700, 30],
        [700, 52],
      ]);
      const arcBack = D1.poly([
        [700, 52],
        [700, 30],
        [862, 30],
        [862, 64],
      ]);
      const at = (p, f) => p.at(f);
      const place = (g, p, extra = {}) => V.place(g, { x: p.x, y: p.y, ...extra });
      const gone = (g) => V.place(g, { o: 0 });

      return (t) => {
        const a1 = fade(t, CUT1);
        const a2 = fade(t, CUT2);
        const aB = fade(t, CUT3);
        const inA1 = t < CUT1[1];
        const inA2 = t >= CUT1[0] && t < CUT2[1];
        const inB = t >= CUT2[0] && t < CUT3[1];
        const inC = t >= CUT3[0];

        // counters
        const phase2 = t >= RESET;
        const wv = phase2 ? count(t, WRITE2) : count(t, WRITE1);
        const rv = phase2 ? count(t, READ2) : count(t, READ1);
        const wb = Math.max(bump(t, phase2 ? WRITE2 : WRITE1), flash(t, RESET, RESET + 0.4));
        const rb = Math.max(bump(t, phase2 ? READ2 : READ1), flash(t, RESET, RESET + 0.4));
        const cnt = Math.min(kin(t, 0.3), a2);
        writes.set({ text: String(wv), k: kin(t, 0.3, 0.4), o: a2, bump: wb });
        reads.set({ text: String(rv), k: kin(t, 0.3, 0.4), o: a2, bump: rb });
        if (cnt <= 0) {
          writes.set({ text: String(wv), k: 0 });
          reads.set({ text: String(rv), k: 0 });
        }

        // approach 1
        cat.set({ k: kin(t, 0.3), o: inA1 || inA2 ? Math.min(a2, 1) : 0 });
        store.set({ k: kin(t, 0.4), o: a1 * (inA1 ? 1 : 0) });
        tag1.set({ k: kin(t, 0.4), o: a1 });
        const pf = ramp(t, POST_AT, POST_AT + POST_FLY, E.inOut);
        if (t >= POST_AT && inA1) {
          place(envPost, at(postP, pf), { s: lerp(1, 0.64, pf), o: a1 });
        } else gone(envPost);
        ana1.set({ k: kin(t, 2.6), o: a1 });
        follows.set({ k: kin(t, 2.7), o: a1 });
        chips.forEach((c, i) => {
          const lit = t >= LOOK[i];
          c.set({
            k: kin(t, 2.7 + 0.08 * i),
            o: a1,
            tone: lit ? "blue" : "grey",
            solid: lit,
            ringK: 0,
          });
        });
        FOLLOWEES.forEach((_, i) => {
          const s0 = LOOK[i];
          const fo = ramp(t, s0, s0 + 0.25, lin);
          const fb = ramp(t, s0 + 0.25, s0 + 0.5, lin);
          const flying = t >= s0 && t < s0 + 0.27 && inA1;
          lookTok[i].set({ ...(flying ? at(outP, fo) : { x: 0, y: 0 }), o: flying ? a1 : 0 });
          if (t >= s0 + 0.25 && inA1) {
            const p = at(backP[i], fb);
            const mx = lerp(p.x, 790, ramp(t, 4.65, 5.05, E.inOut));
            V.place(envBack[i], { x: mx, y: p.y, o: a1 });
          } else gone(envBack[i]);
        });
        merge.set({ k: kin(t, 4.55), o: a1 });

        // approach 2
        tag2.set({ k: kin(t, 5.5), o: inA2 ? a2 : 0 });
        boxes.forEach((g, i) => {
          const k0 = 5.5 + 0.1 * i;
          const bp = Math.max(0, flash(t, WRITE2[i], WRITE2[i] + 0.35));
          V.place(g, {
            x: 700,
            y: ROWS[i],
            s: pop(t, k0) * (1 + 0.18 * bp),
            o: kin(t, k0, 0.15) * a2 * (inA2 || inB ? 1 : 0),
          });
          mailTags[i].set({ k: kin(t, k0, 0.3), o: a2 * (inA2 ? 1 : 0) });
        });
        envFan.forEach((g, i) => {
          const f = ramp(t, FAN[i], WRITE2[i], E.inOut);
          if (t >= FAN[i] && t < WRITE2[i] + 0.05) place(g, at(flyP[i], f), { s: lerp(1, 0.8, f) });
          else gone(g);
        });
        ana2.set({ k: kin(t, 7.3), o: a2 * (t >= 5.5 ? 1 : 0) });
        const rk = ramp(t, 7.5, 7.75, E.pop);
        V.place(ring, { x: 700, y: ROWS[0], s: rk, o: Math.min(1, rk * 3) * a2 * (t >= 7.5 ? 1 : 0) });
        const r2o = ramp(t, LOOK2, LOOK2 + 0.5, lin);
        const r2b = ramp(t, LOOK2 + 0.5, LOOK2 + 1.0, lin);
        const flying2 = t >= LOOK2 && t < LOOK2 + 0.52;
        lookTok2.set({ ...(flying2 ? at(arcOut, r2o) : { x: 0, y: 0 }), o: flying2 ? a2 : 0 });
        if (t >= LOOK2 + 0.5) place(envBack2, at(arcBack, r2b), { o: a2 });
        else gone(envBack2);

        // phase B: posts against reads, then 4,600 x 75 = 345,000
        const bar1 = ramp(t, 9.55, 9.95, E.out);
        const bar2 = ramp(t, 9.75, 10.25, E.out);
        lblPosts.set({ k: kin(t, 9.45), o: aB * (inB ? 1 : 0) });
        barPosts.set({
          v: (T.load.posts / T.load.reads) * bar1,
          text: bar1 > 0.9 ? D1.fmt(T.load.posts) : "",
          k: kin(t, 9.45),
          o: aB * (inB ? 1 : 0),
        });
        lblReads.set({ k: kin(t, 9.65), o: aB * (inB ? 1 : 0) });
        barReads.set({ v: bar2, text: bar2 > 0.9 ? D1.fmt(T.load.reads) : "", k: kin(t, 9.65), o: aB * (inB ? 1 : 0) });
        ratio.set({ k: kin(t, 10.0), o: aB * (inB ? 1 : 0) });
        const cT = [10.85, 11.15, 11.45];
        chipRow.forEach((r, i) => {
          r.chip.set({ k: kin(t, cT[i]), o: aB * (inB ? 1 : 0) });
          r.note_.set({ k: kin(t, cT[i] + 0.1), o: aB * (inB ? 1 : 0) });
        });
        const mk = (g, x, t0) => V.place(g, { x, y: 430, s: pop(t, t0), o: kin(t, t0, 0.15) * aB * (inB ? 1 : 0) });
        mk(times, cx[0] + CW[0] + 16 + 20, 11.05);
        mk(equals, cx[1] + CW[1] + 16 + 20, 11.3);

        // phase C: 87 s against 5 s, then the hybrid
        const u = ramp(t, 13.6, 14.6, lin);
        const cO = inC ? 1 : 0;
        lblC1.set({ k: kin(t, 13.45), o: cO });
        V.place(clock1, { x: 66, y: 98, s: pop(t, 13.45), o: kin(t, 13.45, 0.15) * cO });
        barC1.set({ v: u, text: u > 0.88 ? `${T.celeb.secs} s` : "", k: kin(t, 13.45), o: cO });
        lblC2.set({ k: kin(t, 13.55), o: cO });
        V.place(clock2, { x: 66, y: 246, s: pop(t, 13.55), o: kin(t, 13.55, 0.15) * cO });
        barC2.set({
          v: Math.min(u, T.celeb.target / T.celeb.secs),
          text: u > 0.1 ? `${T.celeb.target} s` : "",
          k: kin(t, 13.55),
          o: cO,
        });
        hybrid.set({ k: kin(t, 14.5), o: cO });
      };
    },
  });
})();
