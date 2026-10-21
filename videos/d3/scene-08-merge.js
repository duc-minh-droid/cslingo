/* Lecture 3 (ds-3) · scene 8 (SSTABLES): sorted segments merge like merge sort (lesson 3.3 "Sorted String Tables" and "Watch a merge",
   the fruit keys). An SSTable is a segment SORTED BY KEY with EACH KEY ONCE. Several of them are merged exactly like the merge step of
   merge sort: every segment has a blue RING on its next unread key, the smallest key under the rings goes out, and when two segments
   hold it the NEWEST copy wins (the older one is dropped). A TOMBSTONE (the delete marker of scene 3) that is the newest copy wins
   too, so the key is written nowhere. Everything comes from D3.MERGE (D3.mergeSegments, asserted on load) and is checked again
   below against an independent "newest wins" rule; the picture is D3.mergeRig. Words are defined where they first appear: the grey
   pill "SSTable: sorted by key, each key once", the blue pill "blue ring: next key to read", the red pill "tombstone = delete
   marker" and the green pill "newest copy wins, older is dropped". Colours: grey = the segments on disk, blue = the rings, the smallest key and the
   copies of it, green = the newest copy and the merged result, red = an older copy that is dropped and the tombstone, orange = the
   counter (purple does not appear: nothing here is in memory).
   Story (local seconds): 0.0-1.4 the three segments and the dashed slot waiting in the merged column pop (headings, records, the
   "older - newer" arrow), 0.2-2.5 the grey definition pill, 2.0-2.5 the blue rings pop on each segment's first key, 2.3-4.1 the blue
   ring pill; STEP 1 apple (3.0-5.25): the smallest key is apple, held by segments 1 and 2 (blue), segment 2 is newer so its apple 5
   turns green and the older apple 1 red (4.1), "newest copy wins, older is dropped", the winner flies into the merged column; STEP 2 fig (-6.6):
   segment 3 wins; STEP 3 kiwi (-8.75): the red pill "tombstone = delete marker", then the copy in segment 3 (a TOMBSTONE) is the
   newest, so both kiwi records turn red and nothing flies: the waiting slot of the merged column turns red with a cross and
   the red pill says "kiwi is deleted"; STEPS 4 and 5 mango, plum (-11.45): newest wins again; the orange counter "records on disk"
   pops at 10 and counts down to 4 while the used records stay as dashed ghosts; hold to the end (14.2 s: 0.2 s over the storyboard,
   so the tombstone's definition and the closing counter can be read). */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (the real merge, asserted against the storyboard, the lesson and an independent rule) ----------
  const M = D3.MERGE;
  const FR = M.frames;
  const IN = M.segs.flat().length;
  const OUT = M.out.length;
  D3.same("merge scene: three sorted segments, five distinct keys", [M.segs.length, FR.length], [3, 5]);
  D3.same(
    "merge scene: every key is held by exactly two segments (a repeat for the newest to win)",
    FR.map((f) => f.who.length),
    [2, 2, 2, 2, 2],
  );
  D3.same("merge scene: one tombstone, the newest copy of kiwi", [M.tombSteps, FR[2].key, FR[2].win], [[2], "kiwi", 2]);
  const newest = new Map(); // independent of mergeSegments: the last (newest) record of every key wins, a tombstone deletes
  M.segs.forEach((seg) => seg.forEach((r) => newest.set(r.k, r)));
  const WANT = [...newest.values()].filter((r) => !r.tomb).sort((a, b) => (a.k < b.k ? -1 : 1));
  D3.same("merge scene: the merged segment is the newest copy of every live key, sorted", M.out, WANT);
  D3.same(
    "merge scene: the winners flown out are the merged records",
    FR.filter((f) => !f.tomb).map((f) => f.rec),
    M.out,
  );
  D3.same("merge scene: 10 records in, 4 out", [IN, OUT], [10, 4]);

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12) ----------
  const RIG = { x: 35, y: 24, colW: 200, gap: 22, rowH: 62, rowGap: 12 };
  const ROW = { a: 0, b: 0 }; // y of the two pill rows under the rig
  const CX = 468; // the stage's centre line: the rig and every pill are centred on it
  const GAP = 38; // air between the rig and the first pill row
  const PILL_H = 58;

  // ---------- timeline ----------
  const T = {
    rig: 1.4, // the rig has popped in by now
    def: [0.2, 2.5], // the grey definition of an SSTable
    ring: 2.0, // the blue rings pop in (0.5 s), then hold
    ringPill: [2.3, 4.1], // the blue pill that says what the rings are
    s0: 3.0, // step 1 (apple) starts here, with its rings already drawn
    tomb: 0.3, // the red definition of a tombstone pops this long after step 3 starts
  };
  // each step: r = the rings pop, b = the smallest key's copies are blue, w = the winner and the losers get their colours, y = it flies
  const STEPS = [
    { r: 0, b: 1.1, w: 0.6, y: 0.55 },
    { r: 0.25, b: 0.3, w: 0.35, y: 0.45 },
    { r: 0.25, b: 1.0, w: 0.65, y: 0.25 },
    { r: 0.25, b: 0.3, w: 0.35, y: 0.45 },
    { r: 0.25, b: 0.3, w: 0.35, y: 0.45 },
  ];
  const ST = [];
  const KNOTS = [
    [0, 0],
    [T.ring, 0],
    [T.ring + 0.5, 0.25],
  ];
  STEPS.forEach(({ r, b, w, y }, i) => {
    const s = i ? ST[i - 1].end : T.s0;
    if (r > 0) KNOTS.push([s, i], [s + r, i + 0.25]);
    else KNOTS.push([s, i + 0.25]); // step 1: its rings were drawn in the intro
    KNOTS.push([s + r + b, i + 0.5], [s + r + b + w, i + 0.55], [s + r + b + w + y, i + 1]);
    ST.push({ s, win: s + r + b, fly: s + r + b + w, end: s + r + b + w + y });
  });
  KNOTS.push([ST[4].end + 0.4, 5.4]); // the last record settles from solid to the tint of the others
  /** progress through the merge, 0 to 5: a piecewise-linear walk through the knots (it dwells where a state needs reading) */
  const pOf = (t) => {
    for (let j = 1; j < KNOTS.length; j++) {
      const [[t0, p0], [t1, p1]] = [KNOTS[j - 1], KNOTS[j]];
      if (t <= t1) return t1 > t0 ? p0 + (p1 - p0) * clamp((t - t0) / (t1 - t0)) : p1;
    }
    return KNOTS[KNOTS.length - 1][1];
  };
  T.stat = ST[4].end + 0.05; // the final counter pops
  T.count = [T.stat + 0.3, T.stat + 0.9]; // and counts 10 down to 4
  const DUR = 14.2;
  D3.same(
    "merge scene: the merge walks p from 0 to 5 and the steps follow each other",
    [pOf(0), pOf(T.ring + 0.5), pOf(T.s0), pOf(ST[4].end), pOf(DUR), ST.every((s, i) => !i || s.s === ST[i - 1].end)],
    [0, 0.25, 0.25, 5, 5.4, true],
  );
  D3.same(
    "merge scene: the order of events",
    [
      T.def[1] <= T.ring + 0.5 && T.ring + 0.5 <= T.s0,
      T.ringPill[0] >= T.def[1] - 0.3 && T.ringPill[1] <= ST[0].win,
      ST[2].s + T.tomb + 0.9 <= ST[2].win, // the tombstone's definition can be read before the verdict
      ST[4].end + 0.05 <= T.stat && T.stat + 0.3 <= T.count[0] && T.count[1] + 1.2 <= DUR,
    ],
    Array(4).fill(true),
  );

  function build(stage) {
    const rig = D3.mergeRig(stage, { ...RIG, segs: M.segs, merge: M });
    ROW.a = RIG.y + rig.height + GAP;
    ROW.b = ROW.a + PILL_H + 22;
    D3.same("merge scene: the pills fit under the rig", [ROW.b + PILL_H + 6 <= 628, rig.width <= 866], [true, true]);

    // ---- the pills: a message has a row, a time span, a tone; its text is centred on the stage's centre line ----
    const wide = (text) => D3.tagW(text) + 28; // D3.tagW is a little short for bold text (measured)
    const msg = (text, tone, solid, row, a, b, bumps = []) => {
      const w = wide(text);
      const tag = D3.tag(stage, { x: Math.round(CX - w / 2), y: row === "a" ? ROW.a : ROW.b, text, tone, solid });
      tag.el.style.width = `${w}px`;
      D3.same(`merge scene: "${text}" fits the stage`, CX - w / 2 >= 12 && CX + w / 2 <= 924, true);
      return (t) =>
        tag.set({
          k: Math.min(ramp(t, a, a + 0.3, E.lin), 1 - ramp(t, b - 0.12, b, E.lin)),
          s: 1 + 0.06 * bumps.reduce((acc, at) => acc + flash(t, at, at + 0.3), 0),
        });
    };
    const winText = "newest copy wins, older is dropped";
    const pills = [
      msg("SSTable: sorted by key, each key once", "grey", false, "a", T.def[0], T.def[1]),
      msg("blue ring: next key to read", "blue", false, "b", T.ringPill[0], T.ringPill[1]),
      ...FR.map((f, i) =>
        msg(`smallest key: ${f.key}`, "blue", false, "a", i ? ST[i].s + 0.05 : T.ring + 0.55, ST[i].end),
      ),
      msg(winText, "green", true, "b", ST[0].win, ST[1].end, [ST[0].win, ST[1].win]),
      msg("tombstone = delete marker", "red", false, "b", ST[2].s + T.tomb, ST[2].win),
      msg(`newest is a tombstone: ${FR[2].key} is deleted`, "red", true, "b", ST[2].win, ST[2].end),
      msg(winText, "green", true, "b", ST[3].win, ST[4].end, [ST[3].win, ST[4].win]),
    ];

    // ---- the merged column: one dashed slot waits for the next record (it hops down as the column fills); for the tombstone the
    //      waiting slot turns red with a cross: nothing is written ----
    const OUT_STEP = M.out.map((_, j) => FR.findIndex((f) => f.outIndex === j)); // the step that writes merged slot j
    const NEXT = FR.slice(0, FR[2].step).filter((f) => !f.tomb).length; // merged records written when the tombstone is met = the slot it leaves empty
    D3.same(
      "merge scene: the merged records come from steps 1, 2, 4 and 5; the tombstone leaves slot 3 empty",
      [OUT_STEP, NEXT],
      [[0, 1, 3, 4], 2],
    );
    const waits = M.out.map((_, j) => {
      const c = rig.outSlot(j);
      const on = j ? ST[OUT_STEP[j - 1]].end - 0.15 : 0.9; // the previous record has almost landed
      const off = ST[OUT_STEP[j]].fly + 0.05; // its own record starts to fly: the slot is taken
      return {
        c,
        on,
        off,
        chip: D3.chip(stage, {
          x: c.x - RIG.colW / 2,
          y: c.y - RIG.rowH / 2,
          w: RIG.colW,
          h: RIG.rowH,
          text: "",
          radius: 16,
        }),
      };
    });
    const crossAt = waits[NEXT].c;
    const cross = L5.svg(stage).appendChild(L5.cross(crossAt.x, crossAt.y, 44, "red", { w: 8 }));
    const NO = [ST[2].win + 0.05, ST[3].s - 0.05]; // the red marker shows from the verdict until the next step starts

    // ---- the counter at the end: records on disk, 10 before the merge, 4 after ----
    const stat = D3.stat(stage, { x: CX - 200, y: ROW.a, w: 400, h: 80, label: "records on disk", tone: "orange" });

    return (t) => {
      rig.update({ p: pOf(t), k: ramp(t, 0, T.rig, E.lin) });
      pills.forEach((p) => p(t));

      const tombK = Math.min(ramp(t, NO[0], NO[0] + 0.2, E.lin), 1 - ramp(t, NO[1] - 0.1, NO[1], E.lin));
      waits.forEach((w, j) => {
        const red = j === NEXT && t >= NO[0] && t < NO[1];
        w.chip.set({
          ghost: true,
          tone: red ? "red" : "grey",
          k: Math.min(ramp(t, w.on, w.on + 0.25, E.lin), 1 - ramp(t, w.off - 0.05, w.off + 0.05, E.lin)),
          s: j === NEXT ? 1 + 0.06 * flash(t, NO[0], NO[0] + 0.3) : 1,
        });
      });
      V.place(cross, { ...D3.pop(tombK), o: tombK });

      const n = IN - Math.round((IN - OUT) * ramp(t, T.count[0], T.count[1], E.inOut));
      stat.set({
        text: String(n),
        k: ramp(t, T.stat, T.stat + 0.3, E.lin),
        bump: 0.5 * flash(t, T.count[0], T.count[1]),
      });
    };
  }

  V.scene({
    kicker: "SSTABLES",
    title: ["Sorted segments merge", "like merge sort"],
    dur: DUR,
    caps: [
      [0.95, 3.05, "Three sorted segments, oldest left."],
      [3.1, 4.8, "Take the smallest key first."],
      [4.85, 6.5, "Repeats: the newest wins."],
      [7.0, 8.7, "A newer tombstone deletes it."],
      [9.0, 11.35, "Repeat until every segment is used up."],
      [11.6, 13.7, "One sorted segment, no old values."],
    ],
    build,
  });
})();
