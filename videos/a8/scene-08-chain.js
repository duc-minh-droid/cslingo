/* Phase 8 · Cryptography & Blockchain (algo-8), scene 08: "Edit one block and every link after breaks" (12.5 s).
   The hash chain of lesson 8.5 (A8.CHAIN, common.js): three blocks, each storing its data, the hash of the block BEFORE it (prev)
   and its own hash. Editing block 1 changes its hash, so the prev stored in block 2 no longer matches and the link breaks; a forger
   repairs block 2's prev (which changes block 2's hash and breaks the link into block 3), repairs that too, and the whole chain
   checks out again: hashes SPOT edits, they do not PREVENT them (scenes 9 and 10 make forging costly).
   A CHECK STRIP under the blocks shows what "the link breaks" means: two copies of the fingerprints lift out of the blocks (the hash
   of block L on the left, the prev stored in block L + 1 on the right) and are compared digit by digit: green tick when every digit
   matches, red cross and red digits when not. The left chip is always the EARLIER block, so the copies travel a short way down.
   Colours (video-wide): blue = fingerprints and links that match, orange = the edited data and the digits that are changing,
   red = a mismatch (a broken link, the block behind it), green = a check that passes.
   Timeline (local seconds): 0.2-1.25 the blocks pop; 1.35-2.2 the links draw (blue), the tick discs pop 1.9 / 2.2; 2.0-2.6 the
   check strip: the labels pop and the two copies fly down out of the blocks, 2.6 the green tick; 2.65 green "valid chain".
   3.3-3.9 block 1's data strip goes orange, the old words are rubbed out and "ann pays EVE 50" is typed; 3.9-4.4 its hash digits roll
   to 9a1f8189 (orange). 5.0-5.45 a fresh copy of block 1's hash flies down, the digits that differ turn red and the disc becomes a
   red cross; 5.45 link 1 turns red with a cross disc and block 2 goes red; 5.5 "broken chain". 7.4-7.7 block 2's prev is repaired
   (rolls to 9a1f8189, orange); 7.7-8.1 the new prev flies down; 8.1 green tick, link 1 blue again, block 2 grey again. 8.0-8.35 block
   2's hash is recomputed (rolls to 25ebb100) and, because it changed, link 2 breaks at once: 8.35 red cross, block 3 red. 8.7-9.3 the
   strip moves on to link 2 (block 2's hash against the prev stored in block 3) and shows why: red cross, every digit red. 9.8-10.1
   block 3's prev is repaired (25ebb100), 10.1-10.5 the new prev flies down: 10.5 green tick, link 2 blue; 10.4-10.7 block 3's hash
   rolls to 99c1e647; 10.75 "valid chain" again; 11.0 the orange tag "but the edit is
   still there"; hold. Every string comes from A8.CHAIN and is asserted below; nothing is typed here. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;
  const lin = E.lin;
  const CH = A8.CHAIN;

  // ---------- the model: every string comes from the helper (the real toy hash), checked here against the storyboard ----------
  const S = [0, 1, 2, 3].map((s) => CH.view(s)); // the chain at stage 0 honest, 1 block 1 edited, 2 block 2 repaired, 3 block 3 repaired
  A8.same("chain: genesis", CH.genesis, "ecaf011a");
  A8.same(
    "chain: the honest chain",
    S[0].map((b) => [b.data, b.prev, b.hash, b.linkOk]),
    [
      ["ann pays ben 5", "ecaf011a", "fb28ccb9", true],
      ["ben pays cat 2", "fb28ccb9", "51320862", true],
      ["cat pays dan 1", "51320862", "57cc211e", true],
    ],
  );
  A8.same(
    "chain: block 1 edited, block 2's link broken",
    [S[1][0].data, S[1][0].hash, S[1][1].prev, S[1][1].linkOk, S[1][2].linkOk],
    ["ann pays EVE 50", "9a1f8189", "fb28ccb9", false, true],
  );
  A8.same(
    "chain: block 2 repaired, block 3's link broken",
    [S[2][1].prev, S[2][1].hash, S[2][1].linkOk, S[2][2].prev, S[2][2].linkOk],
    ["9a1f8189", "25ebb100", true, "51320862", false],
  );
  A8.same(
    "chain: block 3 repaired, every link valid",
    [S[3][2].prev, S[3][2].hash, S[3].map((b) => b.linkOk)],
    ["25ebb100", "99c1e647", [true, true, true]],
  );
  A8.same(
    "chain: the edit changes seven of block 1's eight hash digits",
    [A8.diffIdx(S[0][0].hash, S[1][0].hash).length, S[0][0].hash.length],
    [7, 8],
  );
  A8.same(
    "chain: a link holds when the stored prev is the hash of the block before",
    [
      S[0][1].prev === S[0][0].hash,
      S[1][1].prev === S[1][0].hash,
      S[2][1].prev === S[2][0].hash,
      S[2][2].prev === S[2][1].hash,
      S[3][2].prev === S[3][1].hash,
    ],
    [true, false, true, false, true],
  );

  // the words of the edit: what stays, what is rubbed out, what is typed
  const OLD = S[0][0].data;
  const NEW = S[1][0].data;
  let common = 0;
  while (common < OLD.length && OLD[common] === NEW[common]) common++;
  const KEEP = OLD.slice(0, common);
  const GONE = OLD.slice(common);
  const TYPED = NEW.slice(common);
  A8.same(
    "chain: the edit keeps 'ann pays ' and swaps the tail",
    [KEEP, GONE, TYPED],
    ["ann pays ", "ben 5", "EVE 50"],
  );

  // ---------- layout (stage px) ----------
  const BLK = { x: 12, y: 40, w: 270, step: 321 }; // 12 px stage margins left and right, 51 px between the cards
  const STRIP = { lx: 310, rx: 626, y: 352, labelY: 414, mid: 468 }; // left chip = earlier block, right chip = the prev stored behind it; labels sit UNDER the chips so the copies never fly through them
  const BADGE = { x: 303, y: 484, w: 330, h: 68 };
  const TAG = { x: 468, y: 594 };

  // ---------- timeline (local seconds) ----------
  const T = {
    block: 0.2, // + 0.25 i, 0.55 s each
    link: [
      [1.35, 1.9],
      [1.65, 2.2],
    ],
    labels: 2.0,
    badge: 2.65,
    edit: [3.3, 3.9], // the data strip: rub out, then type
    hash1: [3.9, 4.4],
    break1: 5.45, // the check shows the mismatch
    badBadge: 5.5,
    prev2: [7.4, 7.7], // block 2's stored prev is repaired by hand ...
    fixed1: 8.1, // ... the new copy lands: link 1 passes again
    hash2: [8.0, 8.35], // block 2's hash is recomputed (orange) ...
    break2: 8.35, // ... and no longer matches what block 3 stores: link 2 breaks at once
    swap: [8.7, 8.9], // the strip clears, then moves on to link 2 to show why
    verdict2: 9.3, // the strip's verdict on link 2
    prev3: [9.8, 10.1],
    fixed2: 10.5, // block 3's repaired prev lands: link 2 passes
    hash3: [10.4, 10.7],
    goodBadge: 10.75,
    tag: 11.0,
  };
  const pop = (t, a, d = 0.3) => ramp(t, a, a + d, lin);
  const NEVER = 99; // a time that never comes (finite, so the ramps stay numbers)

  // the check strip: copies of fingerprints that fly down out of the blocks and are compared in pairs (the checks)
  // slot "L" is the hash of block L, slot "R" the prev stored in block L + 1; src = [block index, field]; fly = [start, arrival]
  const CHIPS = {
    H1a: { slot: "L", text: S[0][0].hash, src: [0, "hash"], fly: [2.0, 2.5], out: 5.0 },
    P2a: { slot: "R", text: S[0][1].prev, src: [1, "prev"], fly: [2.1, 2.6], out: T.prev2[1] },
    H1b: { slot: "L", text: S[1][0].hash, src: [0, "hash"], fly: [5.0, 5.45], out: T.swap[0] },
    P2b: { slot: "R", text: S[2][1].prev, src: [1, "prev"], fly: [T.prev2[1], T.fixed1], out: T.swap[0] },
    H2: { slot: "L", text: S[2][1].hash, src: [1, "hash"], fly: [T.swap[1], T.verdict2], out: NEVER },
    P3a: { slot: "R", text: S[2][2].prev, src: [2, "prev"], fly: [T.swap[1], T.verdict2], out: T.prev3[1] },
    P3b: { slot: "R", text: S[3][2].prev, src: [2, "prev"], fly: [T.prev3[1], T.fixed2], out: NEVER },
  };
  // each check starts when its first new copy leaves (or the strip clears) and ends when the last copy lands
  const CHECKS = [
    { a: "H1a", b: "P2a", start: 2.0, end: 2.6, link: 0 },
    { a: "H1b", b: "P2a", start: 5.0, end: T.break1, link: 0 },
    { a: "H1b", b: "P2b", start: T.prev2[1], end: T.fixed1, link: 0 },
    { a: "H2", b: "P3a", start: T.swap[0], end: T.verdict2, link: 1 },
    { a: "H2", b: "P3b", start: T.prev3[1], end: T.fixed2, link: 1 },
  ].map((c) => {
    const [x, y] = [CHIPS[c.a].text, CHIPS[c.b].text];
    return { ...c, ok: x === y, diff: A8.diffIdx(x, y) };
  });
  A8.same(
    "chain: the five checks (match, mismatch, match, mismatch, match)",
    CHECKS.map((c) => c.ok),
    [true, false, true, false, true],
  );
  A8.same(
    "chain: the checks compare the right pairs",
    CHECKS.map((c) => [CHIPS[c.a].text, CHIPS[c.b].text]),
    [
      ["fb28ccb9", "fb28ccb9"],
      ["9a1f8189", "fb28ccb9"],
      ["9a1f8189", "9a1f8189"],
      ["25ebb100", "51320862"],
      ["25ebb100", "25ebb100"],
    ],
  );
  A8.same(
    "chain: the digits that differ in the two broken checks",
    CHECKS.filter((c) => !c.ok).map((c) => c.diff.length),
    [7, 8],
  );
  // link states: each entry is [time the state begins, ok]
  const LINKS = [
    [
      [T.link[0][1], true],
      [T.break1, false],
      [T.fixed1, true],
    ],
    [
      [T.link[1][1], true],
      [T.break2, false],
      [T.fixed2, true],
    ],
  ];
  const linkState = (i, t) => {
    let st = { ok: true, since: NEVER };
    LINKS[i].forEach(([at, ok]) => {
      if (t >= at) st = { ok, since: at };
    });
    return st;
  };
  const broken = (i, t) => {
    const st = linkState(i, t);
    return st.since < NEVER && !st.ok;
  };

  // ---------- small pure helpers ----------
  const HEX = "0123456789abcdef";
  /* a hash that is being recomputed: the digits spin and settle left to right between a and b (pure in t) */
  const roll = (from, to, t, [a, b]) => {
    if (t <= a) return from;
    if (t >= b) return to;
    const f = Math.floor(t * 24);
    return [...to]
      .map((ch, j) => {
        const settle = a + (b - a) * (0.3 + (0.7 * (j + 1)) / to.length);
        return t >= settle ? ch : HEX[Math.imul(j * 7919 + f * 104729 + 17, 2654435761) >>> 28];
      })
      .join("");
  };
  const changing = (t, [a, b], tail = 0.1) => t >= a && t < b + tail;
  /* the data strip: the words after "ann pays " are rubbed out, then the new ones typed */
  const edited = (t) => {
    const k = ramp(t, T.edit[0], T.edit[1], lin);
    if (k <= 0) return OLD;
    if (k >= 1) return NEW;
    return (
      KEEP + (k < 0.35 ? GONE.slice(0, Math.round(GONE.length * (1 - k / 0.35))) : V.type(TYPED, (k - 0.35) / 0.65))
    );
  };

  function build(stage) {
    // the three blocks: data, prev (the hash stored from the block before) and hash
    const blocks = [0, 1, 2].map((i) =>
      A8.block(stage, { x: BLK.x + i * BLK.step, y: BLK.y, w: BLK.w, title: `Block ${i + 1}` }),
    );
    const fieldAt = (i, f) => ({ x: blocks[i].mid.x - 3, y: blocks[i].pt(f).y });

    // the links from a block's hash to the prev of the next one, with a tick or cross disc on each
    const links = [0, 1].map((i) => {
      const pts = A8.elbow(blocks[i].pt("hash", "r"), blocks[i + 1].pt("prev", "l"));
      const at = { x: pts[1][0], y: (pts[1][1] + pts[2][1]) / 2 };
      return {
        line: A8.link(stage, { pts, tone: "blue" }),
        ok: A8.icon(stage, "tick", { ...at, size: 40, disc: true, tone: "green" }),
        bad: A8.icon(stage, "cross", { ...at, size: 40, disc: true, tone: "red" }),
      };
    });

    // the check strip: labels, the copies and the verdict disc
    const label = (x, text) => A8.tag(stage, { x, y: STRIP.labelY, text, tone: "grey" });
    const labelsA = [label(STRIP.lx, "hash of block 1"), label(STRIP.rx, "stored in block 2")];
    const labelsB = [label(STRIP.lx, "hash of block 2"), label(STRIP.rx, "stored in block 3")];
    const chips = Object.fromEntries(
      Object.entries(CHIPS).map(([id, c]) => [
        id,
        A8.digest(stage, { x: STRIP.mid, y: STRIP.y, text: c.text, fs: 36 }),
      ]),
    );
    const disc = {
      ok: A8.icon(stage, "tick", { x: STRIP.mid, y: STRIP.y, size: 56, disc: true, tone: "green" }),
      bad: A8.icon(stage, "cross", { x: STRIP.mid, y: STRIP.y, size: 56, disc: true, tone: "red" }),
    };

    // the verdict on the whole chain, and the sting in the tail
    const badge = L5.badge(stage, { ...BADGE, valid: "valid chain", invalid: "broken chain" });
    const tag = A8.tag(stage, { x: TAG.x, y: TAG.y, text: "but the edit is still there", tone: "orange" });

    // the most recent check that has begun (and, for a chip, that it belongs to)
    const checkAt = (t, id) => {
      let c = null;
      CHECKS.forEach((k) => {
        if (t >= k.start && (!id || k.a === id || k.b === id)) c = k;
      });
      return c;
    };

    return (t) => {
      // ----- the blocks -----
      const b1Roll = changing(t, T.hash1);
      const b2Broken = broken(0, t);
      const b3Broken = broken(1, t);
      const views = [
        {
          data: edited(t),
          dataTone: t >= T.edit[0] ? "orange" : "grey",
          prev: S[0][0].prev,
          prevTone: "blue",
          hash: roll(S[0][0].hash, S[1][0].hash, t, T.hash1),
          hashMarks: b1Roll ? () => "orange" : null,
          tone: "grey",
          mark: null,
          markK: 1,
        },
        {
          data: S[0][1].data,
          dataTone: "grey",
          prev: roll(S[0][1].prev, S[2][1].prev, t, T.prev2),
          prevTone: b2Broken ? "red" : "blue",
          prevMarks: changing(t, T.prev2) ? () => "orange" : null,
          hash: roll(S[0][1].hash, S[2][1].hash, t, T.hash2),
          hashMarks: changing(t, T.hash2) ? () => "orange" : null,
          tone: b2Broken ? "red" : "grey",
          mark: b2Broken ? "bad" : null,
          markK: pop(t, linkState(0, t).since, 0.25),
        },
        {
          data: S[0][2].data,
          dataTone: "grey",
          prev: roll(S[0][2].prev, S[3][2].prev, t, T.prev3),
          prevTone: b3Broken ? "red" : "blue",
          prevMarks: changing(t, T.prev3) ? () => "orange" : null,
          hash: roll(S[0][2].hash, S[3][2].hash, t, T.hash3),
          hashMarks: changing(t, T.hash3) ? () => "orange" : null,
          tone: b3Broken ? "red" : "grey",
          mark: b3Broken ? "bad" : null,
          markK: pop(t, linkState(1, t).since, 0.25),
        },
      ];
      blocks.forEach((b, i) => b.set({ ...views[i], hashTone: "blue", k: pop(t, T.block + 0.25 * i, 0.55) }));

      // ----- the links and their discs -----
      links.forEach((l, i) => {
        const st = linkState(i, t);
        l.line.set({ k: ramp(t, T.link[i][0], T.link[i][1], lin), tone: st.ok ? "blue" : "red" });
        l.ok.set({ k: st.ok ? pop(t, st.since) : 0 });
        l.bad.set({ k: st.ok ? 0 : pop(t, st.since), draw: ramp(t, st.since + 0.05, st.since + 0.3, lin) });
      });

      // ----- the check strip -----
      const cur = checkAt(t);
      const swapOut = 1 - ramp(t, T.swap[0], T.swap[1], lin);
      labelsA.forEach((l) => l.set({ k: pop(t, T.labels), o: swapOut }));
      labelsB.forEach((l) => l.set({ k: pop(t, T.swap[1]) }));
      Object.entries(CHIPS).forEach(([id, c]) => {
        const f = ramp(t, c.fly[0], c.fly[1], E.inOut);
        const from = fieldAt(...c.src);
        const to = { x: c.slot === "L" ? STRIP.lx : STRIP.rx, y: STRIP.y };
        const p = A8.arc(from, to, f);
        const alive = ramp(t, c.fly[0], c.fly[0] + 0.12, lin) * (1 - ramp(t, c.out, c.out + 0.2, lin));
        const ck = checkAt(t, id);
        const settled = ck && t >= ck.end;
        const red = settled && !ck.ok ? (i) => (ck.diff.includes(i) ? "red" : null) : null;
        chips[id].set({
          x: p.x,
          y: p.y,
          s: lerp(0.78, 1, f),
          o: alive,
          marks: settled && ck.ok ? () => "green" : red,
        });
      });
      const verdict = cur && t >= cur.end ? cur : null;
      disc.ok.set({ k: verdict && verdict.ok ? pop(t, verdict.end) : 0 });
      disc.bad.set({
        k: verdict && !verdict.ok ? pop(t, verdict.end) : 0,
        draw: verdict ? ramp(t, verdict.end + 0.05, verdict.end + 0.3, lin) : 0,
      });

      // ----- the verdict on the chain, and the tag -----
      if (t < T.badge) badge("none", 0);
      else if (t < T.badBadge) badge("valid", pop(t, T.badge, 0.35));
      else if (t < T.goodBadge) badge("invalid", pop(t, T.badBadge, 0.35));
      else badge("valid", pop(t, T.goodBadge, 0.35));
      tag.set({ k: pop(t, T.tag, 0.35) });
    };
  }

  V.scene({
    kicker: "HASH CHAIN",
    title: ["Edit one block and", "every link after breaks"],
    dur: 12.5,
    caps: [
      [1.0, 3.2, "Each block stores the hash of the block before it."],
      [3.3, 5.4, "Edit one block and its hash changes."],
      [5.5, 7.7, "The next block holds the old hash: the link breaks."],
      [8.2, 10.8, "Recompute every later hash and it looks valid again."],
      [11.0, 12.4, "Hashes spot edits. They do not stop them."],
    ],
    build,
  });
})();
