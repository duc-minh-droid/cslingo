/* Lecture 3 (ds-3) · scene 7 (HASH INDEX · LIMITS): keys must fit in memory, and ranges are slow (lesson 3.2 "Disadvantages").
   Two limits of the hash index. (1) The map lives in RAM, so it works only while ALL its keys fit: the memory panel ("map in memory
   (RAM)") has room for 6 entries, twelve keys arrive one after another, the first six take a slot, the other six stop at its door
   and pile up in a queue, red ("6 do not fit"). (2) A hash map has no key order, so a range query (the card defines it: "all keys
   from kitty2 to kitty5") needs a separate lookup for every key: the four wanted keys sit in scattered buckets of the hash table,
   and a blue ring has to hop from one to the next while the orange counter reads 1, 2, 3, 4. Sorted keys, the teaser of the next
   scene, sit side by side: the same four keys are one green stretch of a sorted row. Every number comes from D3.LIM (asserted below
   and when the page loads: 12 keys, 6 slots, the bucket of every key, the four lookups, the keys' places in the sorted list); the
   hash table is D3.LIM.range.table (FNV-1a mod 8). Colours: blue = the key that arrives / the request, purple = memory (the panel,
   the keys held in it, the hash table), red = does not fit, orange = the counters, grey = the sorted row on disk, green = found in
   one stretch.
   Story (local seconds): 0.0 the memory panel is there with its six dashed slots, 0.15 the RAM chip, 0.3 the counters "new keys"
   and "room for 6", 0.55 the purple note "RAM: fast, but small", 0.35-3.0 the twelve keys fly in from the left, one landing every
   0.17 s from 1.15 (blue in flight): the first six land in the slots (purple), the last six stop outside the panel and turn red,
   the counter "new keys" reads 1 to 12, 3.14 the red tag "6 do not fit"; 4.3-4.55 part A fades; 4.55 the blue card "range query:
   all keys from kitty2 to kitty5", 4.7 the purple hash table (eight buckets, six keys, two empty) and 5.0 the counter "lookups 0"
   pop; 5.65 / 6.2 / 6.75 / 7.3 the four wanted keys are looked up in turn (a blue ring, the key turns blue, the counter reads 1 to
   4); 8.1-8.7 the picture rises, 8.3 the grey row "sorted by key" pops below; 9.0-9.5 the green bracket draws under kitty2 to
   kitty5 while the four keys turn green one after another, 9.55 "4 keys in a row"; hold to the end (11 s: half a second over the
   storyboard's 10.5, so the definitions and the last picture can be read). */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the data (run through the real rules, asserted against the storyboard and the lesson) ----------
  const RAM = D3.LIM.ram;
  const RG = D3.LIM.range;
  const KEYS = Array.from({ length: RAM.keys }, (_, i) => `kitty${i + 1}`); // twelve keys arrive in this order
  const IN_MEM = [];
  const LEFT_OUT = [];
  KEYS.forEach((k) => (IN_MEM.length < RAM.slots ? IN_MEM : LEFT_OUT).push(k)); // a key gets a slot while there is room
  D3.same(
    "limits scene: twelve keys, room for six, six do not fit",
    [KEYS.length, IN_MEM.length, LEFT_OUT.length, RAM.fit, RAM.over],
    [12, 6, 6, 6, 6],
  );
  const TABLE = RG.table; // the hash table: eight buckets, a key or null
  const WANT = RG.want; // the range query kitty2 to kitty5
  const SORTED = RG.sorted;
  D3.same(
    "limits scene: the range is every key from kitty2 to kitty5",
    [RG.from, RG.to, SORTED.filter((k) => k >= RG.from && k <= RG.to)],
    ["kitty2", "kitty5", WANT],
  );
  D3.same(
    "limits scene: the wanted keys sit in scattered buckets",
    WANT.map((k) => TABLE.indexOf(k)),
    RG.wantBuckets,
  );
  D3.same("limits scene: one lookup per key", [WANT.length, RG.lookups], [4, 4]);
  const AT = WANT.map((k) => SORTED.indexOf(k)); // their places in the sorted row
  D3.same("limits scene: side by side in the sorted row", [AT, AT.every((a, i) => a === AT[0] + i)], [RG.wantAt, true]);
  D3.same("limits scene: six keys, two empty buckets", [TABLE.filter(Boolean).length, TABLE.length], [6, 8]);

  // ---------- layout A: the memory (stage px; the stage is 936 x 640, the margin is 12) ----------
  const CH = { w: 148, h: 56, gap: 12 }; // a key sticker
  const COLS = 3;
  const PAN = { x: 330, y: 96, w: 516, h: 212 }; // the memory panel: 3 x 2 slots
  const SL = { x: PAN.x + 24, y: PAN.y + 62 }; // the first slot
  const PITCH = { x: CH.w + CH.gap, y: CH.h + CH.gap };
  const Q = { x: PAN.x - 30 - CH.w, y: SL.y }; // the queue column at the panel's door, its rows level with the slot rows
  const SPAWN = 18; // keys fly in from here
  const STAT_Y = PAN.y + PAN.h + 34;
  const STAT_KEYS = { x: PAN.x, w: 270 };
  const STAT_ROOM = { x: PAN.x + 270 + 16, w: PAN.w - 270 - 16 };
  const RAM_TEXT = "RAM: fast, but small"; // says what RAM is
  const RAM_TAG = { x: PAN.x, y: STAT_Y + 80 + 30 };
  const NOFIT_TEXT = `${RAM.over} do not fit`;
  const NOFIT = { x: Q.x + CH.w - D3.tagW(NOFIT_TEXT), y: Q.y - 74 };
  /** where key i ends up: a slot (the first six fill the slots from the right, so no key flies through another), or the queue */
  const target = (i) => {
    if (i < RAM.slots) {
      const row = Math.floor(i / COLS);
      const col = COLS - 1 - (i % COLS);
      return { x: SL.x + col * PITCH.x, y: SL.y + row * PITCH.y, slot: row * COLS + col, fits: true };
    }
    return { x: Q.x, y: Q.y + (i - RAM.slots) * PITCH.y, slot: -1, fits: false };
  };
  const TG = KEYS.map((_, i) => target(i));
  D3.same(
    "limits scene: A fits the stage",
    [
      Q.x >= SPAWN + 100 && Q.x + CH.w + 18 <= PAN.x,
      PAN.x + PAN.w <= 924 && NOFIT.x >= 14 && NOFIT.y >= 12,
      NOFIT.y + 58 + 6 + 8 <= Q.y,
      Q.y + (RAM.over - 1) * PITCH.y + CH.h + 6 <= 628,
      SL.x + COLS * CH.w + (COLS - 1) * CH.gap + 24 === PAN.x + PAN.w,
      SL.y + 2 * CH.h + CH.gap + 26 === PAN.y + PAN.h,
      STAT_Y + 80 + 6 + 20 < Q.y + (RAM.over - 1) * PITCH.y + CH.h, // the counters end above the last queue row
      STAT_ROOM.x + STAT_ROOM.w === PAN.x + PAN.w,
      PAN.x + D3.tagW(RAM_TEXT) <= PAN.x + PAN.w && RAM_TAG.y + 58 + 6 <= 628,
    ],
    Array(9).fill(true),
  );

  // ---------- layout B: the hash table and the sorted row (rig coordinates; the rig is lowered, then rises) ----------
  const CARD = { x: 90, y: 0, w: 490, h: 100 };
  const LK = { x: 604, y: 10, w: 242, h: 80 };
  const HP = { x: 146, y: 122, w: 644, h: 210 }; // the hash table panel
  const HC = { x: HP.x + 24, y: HP.y + 64, w: 140, h: 56, gap: 12 }; // 4 x 2 buckets
  const SP = { x: 35, y: 356, w: 866, h: 184 }; // the sorted row's panel
  const SC = { x: SP.x + 24, y: SP.y + 76, w: 128, h: 56, gap: 8, colGap: 10 };
  const SPAN_Y = SC.y + SC.h + 26;
  const TAG_TEXT = `${WANT.length} keys in a row`;
  const TAG_W = D3.tagW(TAG_TEXT) + 20; // D3.tagW is a little short for bold digits (measured)
  const TAG = { x: SP.x + SP.w - 24 - TAG_W, y: SP.y + 9 };
  const RIG = { low: 150, high: 46 }; // how far the picture sits below the stage top before / after the sorted row appears
  D3.same(
    "limits scene: B fits the stage in both positions",
    [
      HC.x + 4 * HC.w + 3 * HC.gap + 24 === HP.x + HP.w,
      HC.y + 2 * HC.h + HC.gap + 22 === HP.y + HP.h,
      SC.x + 6 * SC.w + 5 * SC.colGap + 24 === SP.x + SP.w,
      CARD.x >= 12 && LK.x + LK.w <= 924 && CARD.x + CARD.w + 24 <= LK.x,
      SP.x >= 12 && SP.x + SP.w <= 924,
      SPAN_Y + 20 <= SP.y + SP.h && SPAN_Y - 14 >= SC.y + SC.h + 6 + 2, // the bracket sits inside the panel, clear of the chips' lip
      TAG.y + 58 + 6 <= SC.y && TAG.x > SP.x + 24 + D3.tagW("sorted by key") + 40,
      RIG.high + CARD.y >= 12 && RIG.high + SP.y + SP.h + 6 <= 628,
      RIG.low + HP.y + HP.h + 6 <= 628 && RIG.low >= 12,
      Math.abs(RIG.low + (HP.y + HP.h + 6) / 2 - 320) < 12, // before the sorted row appears the picture is centred
    ],
    Array(10).fill(true),
  );

  // ---------- timeline ----------
  const T = {
    ram: 0.15,
    stat: 0.3,
    land0: 1.15, // key i lands at 1.15 + 0.17 i
    landStep: 0.17,
    fadeA: 4.3, // part A fades out in 0.25 s, then part B begins
    card: 4.55,
    hash: 4.7,
    chips: 4.85, // bucket b pops at 4.85 + 0.05 b
    lkStat: 5.0,
    lk0: 5.65, // lookup i at 5.65 + 0.55 i
    lkStep: 0.55,
    rise: 8.1,
    sorted: 8.3,
    green: 9.0, // the stretch is drawn and the keys turn green one after another (0.14 s apart)
    greenStep: 0.14,
  };
  /** a key flies at a fixed speed (a short hop for the queue, the whole way for a slot) and lands on the beat */
  const dur = (i) => 0.25 + (TG[i].x - SPAWN) / 1200;
  const LAND = KEYS.map((_, i) => T.land0 + T.landStep * i);
  const START = KEYS.map((_, i) => LAND[i] - dur(i));
  const LK_AT = WANT.map((_, i) => T.lk0 + T.lkStep * i);
  const NOFIT_AT = LAND[KEYS.length - 1] + 0.12;
  const GREEN_END = T.green + 0.5;
  const TAG_AT = GREEN_END + 0.05;
  const DUR = 11;
  /** key i: how far along its flight it is, 0 to 1 (ease-out: it slows into its place) */
  const flightOf = (i, t) => E.out(clamp((t - START[i]) / dur(i)));
  const keyX = (i, t) => lerp(SPAWN, TG[i].x, flightOf(i, t));
  // no two stickers of part A overlap at any moment: every key is checked against every other, frame by frame
  (function checkFlights() {
    for (let t = 0; t <= T.fadeA; t += 1 / 30)
      for (let i = 0; i < KEYS.length; i++)
        for (let j = i + 1; j < KEYS.length; j++) {
          if (t < START[i] + 0.2 || t < START[j] + 0.2) continue; // not popped in yet
          const [dx, dy] = [Math.abs(keyX(i, t) - keyX(j, t)), Math.abs(TG[i].y - TG[j].y)];
          if (dx < CH.w + 4 && dy < CH.h + 4)
            throw new Error(`VID.d3: limits scene: keys ${i + 1} and ${j + 1} overlap at ${t.toFixed(2)} s`);
        }
  })();
  D3.same(
    "limits scene: the order of events",
    [
      START[0] >= 0.3 && START[0] < 0.5, // the first key appears within half a second
      LAND.every((a, i) => i === 0 || a > LAND[i - 1]),
      NOFIT_AT + 0.35 + 0.8 <= T.fadeA + 1e-9,
      T.fadeA + 0.25 <= T.card + 1e-9 &&
        T.card < T.hash &&
        T.hash < T.chips &&
        T.chips + 0.05 * 7 + 0.3 <= LK_AT[0] - 0.1,
      LK_AT[WANT.length - 1] + 0.7 <= T.rise && T.rise <= T.sorted,
      T.sorted + 0.1 + 0.05 * 5 + 0.3 <= T.green + 1e-9,
      TAG_AT + 0.35 + 1 <= DUR,
    ],
    Array(7).fill(true),
  );

  function build(stage) {
    // ---- A: the memory panel with its six dashed slots, the RAM chip, the counters, twelve keys, the red tag ----
    const A = V.h("div", { style: D3.abs(0, 0, 936, 640) });
    stage.append(A);
    const panelA = D3.panel(A, { ...PAN, tone: "purple", plain: true, title: "map in memory (RAM)" });
    const slots = D3.recs(A, {
      x: SL.x,
      y: SL.y,
      w: CH.w,
      h: CH.h,
      gap: CH.gap,
      colGap: CH.gap,
      cols: COLS,
      recs: Array(RAM.slots).fill({}),
      tone: "purple",
    });
    const slotLand = Array(RAM.slots).fill(0); // when the key that fills slot n lands
    TG.forEach((p, i) => p.fits && (slotLand[p.slot] = LAND[i]));
    const ramIcon = L5.svg(A).appendChild(D3.ram(PAN.x + PAN.w - 62, PAN.y + 30, 64, "purple"));
    const keyChips = KEYS.map((k, i) =>
      D3.recCell(A, { x: TG[i].x, y: TG[i].y, w: CH.w, h: CH.h, fs: 28, radius: 16, tone: "blue", rec: { k } }),
    );
    const statKeys = D3.stat(A, { x: STAT_KEYS.x, y: STAT_Y, w: STAT_KEYS.w, label: "new keys", tone: "orange" });
    const statRoom = D3.stat(A, { x: STAT_ROOM.x, y: STAT_Y, w: STAT_ROOM.w, label: "room for", tone: "orange" });
    const ramTag = D3.tag(A, { ...RAM_TAG, text: RAM_TEXT, tone: "purple" });
    const noFit = D3.tag(A, { ...NOFIT, text: NOFIT_TEXT, tone: "red", solid: true });

    // ---- B: the range query, the hash table, the sorted row (one rig: it sits lower first, then rises) ----
    const rig = V.h("div", { style: D3.abs(0, 0, 936, 640) });
    stage.append(rig);
    const card = D3.card(rig, {
      ...CARD,
      text: `range query:\nall keys from ${RG.from} to ${RG.to}`,
      tone: "blue",
      plain: false,
    });
    card.el.style.whiteSpace = "pre-line"; // the text breaks where it says
    const statLk = D3.stat(rig, { ...LK, label: "lookups", tone: "orange" });
    const hashPanel = D3.panel(rig, { ...HP, tone: "purple", plain: true, title: "hash map: no key order" });
    const hash = D3.recs(rig, {
      x: HC.x,
      y: HC.y,
      w: HC.w,
      h: HC.h,
      gap: HC.gap,
      colGap: HC.gap,
      cols: 4,
      recs: TABLE.map((k) => (k ? { k } : {})),
      tone: "purple",
    });
    const sortedPanel = D3.panel(rig, { ...SP, tone: "grey", plain: true, title: "sorted by key" });
    const sorted = D3.recs(rig, {
      x: SC.x,
      y: SC.y,
      w: SC.w,
      h: SC.h,
      gap: SC.gap,
      colGap: SC.colGap,
      cols: 6,
      recs: SORTED.map((k) => ({ k })),
      tone: "grey",
    });
    const span = D3.span(L5.svg(rig), { tone: "green", w: 7 });
    const inRow = D3.tag(rig, { ...TAG, text: TAG_TEXT, tone: "green", solid: true });

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);

      // ---------- A ----------
      V.place(A, { o: 1 - ramp(t, T.fadeA, T.fadeA + 0.25, E.lin) });
      const first = 0.3 + 0.7 * k(0, 0.4); // the panel is there on the first frame
      panelA.set({ k: first });
      slots.all((n) => ({ ghost: true, k: first, o: t >= slotLand[n] ? 0 : 1 })); // a slot is empty until its key lands
      V.place(ramIcon, D3.pop(k(T.ram)));
      keyChips.forEach((c, i) => {
        const since = t - LAND[i];
        const landed = since >= 0;
        c.set({
          tone: landed ? (TG[i].fits ? "purple" : "red") : "blue", // blue while it arrives, then held in memory or turned away
          solid: landed && since < 0.4,
          k: ramp(t, START[i], START[i] + 0.2, E.lin),
          x: keyX(i, t) - TG[i].x,
          s: 1 + 0.08 * flash(t, LAND[i], LAND[i] + 0.3),
        });
      });
      const nKeys = LAND.filter((a) => t >= a).length;
      statKeys.set({
        text: String(nKeys),
        k: k(T.stat, 0.3),
        bump: 0.4 * clamp(LAND.reduce((s, a) => s + flash(t, a, a + 0.25), 0)),
      });
      statRoom.set({ text: String(RAM.slots), k: k(T.stat + 0.1, 0.3) });
      ramTag.set({ k: k(T.stat + 0.25, 0.35) });
      noFit.set({ k: k(NOFIT_AT, 0.35), s: 1 + 0.05 * flash(t, NOFIT_AT, NOFIT_AT + 0.4) });

      // ---------- B ----------
      V.place(rig, { y: lerp(RIG.low, RIG.high, ramp(t, T.rise, T.rise + 0.6, E.inOut)) });
      card.set({ k: k(T.card, 0.35) });
      const done = LK_AT.filter((a) => t >= a).length; // lookups so far
      statLk.set({
        text: String(done),
        k: k(T.lkStat, 0.3),
        bump: 0.4 * clamp(LK_AT.reduce((s, a) => s + flash(t, a, a + 0.25), 0)),
      });
      hashPanel.set({ k: k(T.hash, 0.4) });
      hash.all((b) => {
        const st = { k: D3.seq(t, T.chips, 0.05, 0.3, b) };
        const key = TABLE[b];
        if (!key) return { ...st, ghost: true }; // an empty bucket
        const w = WANT.indexOf(key);
        if (w >= 0 && t >= LK_AT[w]) {
          // looked up: a blue ring, the key turns blue and stays blue (it has been asked for)
          const ring = Math.min(
            ramp(t, LK_AT[w], LK_AT[w] + 0.15, E.lin),
            1 - ramp(t, LK_AT[w] + 0.45, LK_AT[w] + 0.65, E.lin),
          );
          Object.assign(st, {
            tone: "blue",
            solid: t < LK_AT[w] + 0.35,
            s: 1 + 0.08 * flash(t, LK_AT[w], LK_AT[w] + 0.3),
          });
          if (ring > 0) Object.assign(st, { ring: "blue", ringK: ring });
        }
        return st;
      });
      sortedPanel.set({ k: k(T.sorted, 0.4) });
      sorted.all((i) => {
        const st = { k: D3.seq(t, T.sorted + 0.1, 0.05, 0.3, i) };
        const w = AT.indexOf(i);
        const at = T.green + T.greenStep * w;
        if (w >= 0 && t >= at) Object.assign(st, { tone: "green", solid: true, s: 1 + 0.08 * flash(t, at, at + 0.3) }); // one of the stretch
        return st;
      });
      span.set({
        x1: sorted.slot(AT[0]).x,
        x2: sorted.right(AT[AT.length - 1]).x,
        y: SPAN_Y,
        k: ramp(t, T.green, GREEN_END, E.inOut),
      });
      inRow.set({ k: k(TAG_AT, 0.35), s: 1 + 0.05 * flash(t, TAG_AT, TAG_AT + 0.4) });
    };
  }

  V.scene({
    kicker: "HASH INDEX · LIMITS",
    title: ["Keys must fit in memory,", "and ranges are slow"],
    dur: DUR,
    caps: [
      [1.1, 4.2, "The whole map must fit in memory."],
      [5.5, 8.0, "A range needs one lookup per key."],
      [8.8, 10.9, "Sorted keys sit side by side."],
    ],
    build,
  });
})();
