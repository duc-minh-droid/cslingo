/* Phase 8 · Cryptography & Blockchain (algo-8), scene 10: "Rewriting history means redoing the work" (11 s), proof of work (lessons
   8.5 and 8.7, Workshop 8.W). The three blocks of scene 8, now each SEALED by mining (hash starts with 0, with a nonce row).
   Editing block 1 breaks its own seal (nonce 27 no longer gives a 0) and, one beat later, the link into block 2 (the prev it stores
   is the old hash). Repairing means mining again: block 1 (15 tries), then block 2 with its new prev (5 tries), then block 3
   (30 tries). Each block turns red when its seal or its link fails and green once both hold again; the red moves one block along
   at a time. Three orange work bars (15, 5, 30 tries out of 30) add up to 50 tries, where scene 8's forger needed none.
   Colours (video-wide): green = sealed and linked, red = broken seal or link, orange = the edit and the work being done, blue =
   fingerprints and links that hold. Two small tags define the words before they are used: "sealed" and "mining".
   Every state is DERIVED from the strings on screen (a block is good when its hash starts with 0 and the prev it stores is the
   hash of the block before), so what you see is what the real toy hash says (A8.SEAL, common.js, asserted below).
   Timeline (local seconds): 0.2-1.25 the blocks pop (green, tick), 1.15-1.55 the links draw, 0.7 the "sealed" tag; 2.1-2.6 block
   1's data is rubbed out and "ann pays EVE 50" typed (orange); 2.6-2.95 its hash rolls to b411b36a, 2.95 the red first digit, red
   card and cross (seal broken), 3.15 the link and block 2 go red; 3.4 the "mining" tag; 3.8-5.06 hunt 1 (nonce 0 to 14, the first
   digit red until the last), bar 1 grows to 15 of 30, green at 5.06; 5.2-5.45 block 2's prev rolls to the new hash, 5.45-6.09 hunt
   2 (nonce 0 to 4), the link into block 3 goes red at 5.65; 6.3-6.55 block 3's prev rolls, 6.55-8.0 hunt 3 (nonce 0 to 29), green
   at 8.0; 8.2 the bracket, 8.35 the "50 tries" sticker, 9.2 the grey scale note "real blocks need trillions of tries" (lesson 8.7: finding
   a valid block takes trillions of hashes, so a toy 50 is small beside a real chain); hold to 11.5. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, clamp, ease: E } = V;
  const lin = E.lin;
  const SEAL = A8.SEAL;
  const GEN = A8.CHAIN.genesis;
  const DUR = 11.5;
  const LAG = 0.2; // a link is checked a beat after the hash it points at changes, so the seal breaks first and the link second

  // ---------- the model: every string and count is recomputed from the real toy hash and checked ----------
  const SV = [0, 1, 2, 3, 4].map((s) => SEAL.view(s));
  const HUNT = [1, 2, 3].map((i) => SEAL.hunt(i));
  const hashOf = (i, data, prev, n) => A8.toy(`block ${i}|${data}|${prev}|nonce ${n}`);
  const lead0 = (h) => h[0] === "0";
  const firstNonce = (i, data, prev) => {
    for (let n = 0; ; n++) if (lead0(hashOf(i, data, prev, n))) return n;
  };
  SEAL.original.forEach((b, k) => {
    const prev = k ? SEAL.original[k - 1].hash : GEN;
    A8.same(
      `rewrite: sealed block ${b.i} (hash of its data, prev and nonce; the nonce is the first that gives a 0)`,
      [hashOf(b.i, b.data, prev, b.nonce), firstNonce(b.i, b.data, prev), b.tries],
      [b.hash, b.nonce, b.nonce + 1],
    );
  });
  A8.same(
    "rewrite: the sealed chain has nonces 27, 24, 16",
    SEAL.original.map((b) => [b.nonce, b.hash]),
    [
      [27, "017b7e46"],
      [24, "0b2e58f5"],
      [16, "006f9014"],
    ],
  );
  SEAL.forged.forEach((b, k) => {
    const prev = k ? SEAL.forged[k - 1].hash : GEN;
    A8.same(
      `rewrite: re-mined block ${b.i} (first nonce that gives a 0, with the new prev)`,
      [firstNonce(b.i, b.data, prev), hashOf(b.i, b.data, prev, b.nonce), b.tries],
      [b.nonce, b.hash, b.nonce + 1],
    );
    A8.same(
      `rewrite: hunt ${b.i} goes through the digests of nonce 0 to ${b.nonce}, only the last starts with 0`,
      [HUNT[k].rows, HUNT[k].rows.map(lead0)],
      [
        Array.from({ length: b.tries }, (_, n) => hashOf(b.i, b.data, prev, n)),
        HUNT[k].rows.map((_, n) => n === b.nonce),
      ],
    );
  });
  A8.same(
    "rewrite: the forger's tries are 15, 5 and 30, 50 in all",
    [SEAL.forged.map((b) => b.tries), SEAL.total],
    [[15, 5, 30], 50],
  );
  A8.same(
    "rewrite: the forged blocks are 'ann pays EVE 50' and the two later blocks as they were",
    SEAL.forged.map((b) => b.data),
    [A8.CHAIN.edit, SEAL.original[1].data, SEAL.original[2].data],
  );
  A8.same(
    "rewrite: the edit keeps nonce 27 but its hash no longer starts with 0",
    [SV[1][0].nonce, SV[1][0].hash, hashOf(1, A8.CHAIN.edit, GEN, 27), lead0(SV[1][0].hash)],
    [27, "b411b36a", "b411b36a", false],
  );
  A8.same(
    "rewrite: the stored prevs, stale until re-mined, then the new hash of the block before",
    [SV[0][1].prev, SV[3][1].prev, SV[0][2].prev, SV[4][2].prev],
    [SEAL.original[0].hash, SEAL.forged[0].hash, SEAL.original[1].hash, SEAL.forged[1].hash],
  );
  const BAR_OF = Math.max(...SEAL.forged.map((b) => b.tries)); // the longest bar is the longest hunt
  A8.same("rewrite: the longest hunt is 30 tries", BAR_OF, 30);

  // ---------- layout (stage px) ----------
  const BLK = { x: 12, y: 12, w: 270, step: 321 }; // the same 12 px margins and 51 px gaps as scene 8, so the chain does not jump between scenes
  const BAR = { x: 175, y: 330, step: 60, w: 340, h: 48, labelX: 20 };
  const BRACKET = { x: 556, y0: 334, y1: 494, tip: 604 };
  const TOTAL = { x: 760, y: 414 };
  const SCALE = { x: 760, y: 497 };
  const LEGEND_Y = 580;

  // ---------- timeline (local seconds) ----------
  const T = {
    block: 0.2, // + 0.25 i, 0.55 s each
    link: [1.15, 1.55],
    tick: 1.5,
    legendSeal: 0.7,
    edit: [2.1, 2.6],
    hash1: [2.6, 2.95],
    legendMine: 3.4,
    prev2: [5.2, 5.45],
    prev3: [6.3, 6.55],
    bracket: 8.2,
    total: 8.35,
    scale: 9.2,
  };
  // hunt k: the nonce counts 0, 1, 2 ... one row per `per` seconds from `a`; the winner's row is on screen from `won`
  const HUNTS = [
    { a: 3.8, per: 0.09 },
    { a: T.prev2[1], per: 0.16 },
    { a: T.prev3[1], per: 0.05 },
  ].map((h, k) => ({ ...h, rows: HUNT[k].rows, tries: HUNT[k].tries, won: h.a + (HUNT[k].tries - 1) * h.per }));
  const pop = (t, a, d = 0.3) => ramp(t, a, a + d, lin);
  const rowAt = (k, t) => clamp(Math.floor((t - HUNTS[k].a) / HUNTS[k].per + 1e-6), 0, HUNTS[k].tries - 1);

  // ---------- what each block holds at time t (the strings behind the picture) ----------
  /* the hash of block k: sealed, then edited (block 1), then the hash of the try in hand while the block is being mined */
  const hashAt = (k, t) => {
    if (t >= HUNTS[k].a) return HUNTS[k].rows[rowAt(k, t)];
    if (k === 0) return t < T.hash1[1] ? SV[0][0].hash : SV[1][0].hash;
    return SV[0][k].hash;
  };
  const prevAt = (k, t) => {
    if (k === 0) return GEN;
    const [stale, fresh, at] =
      k === 1 ? [SV[0][1].prev, SV[3][1].prev, T.prev2[1]] : [SV[0][2].prev, SV[4][2].prev, T.prev3[1]];
    return t < at ? stale : fresh;
  };
  const nonceAt = (k, t) => (t >= HUNTS[k].a ? rowAt(k, t) : SV[0][k].nonce);
  const sealOk = (k, t) => lead0(hashAt(k, t));
  const linkOk = (k, t) => k === 0 || prevAt(k, t) === hashAt(k - 1, t - LAG);
  const good = (k, t) => sealOk(k, t) && linkOk(k, t);
  A8.same(
    "rewrite: the nonce of the edited block stays 27 until the hunt",
    [nonceAt(0, T.hash1[1] + 0.1), SV[0][0].nonce],
    [27, 27],
  );
  // the moments a state flips, found once by sampling the pure functions above (every 1/120 s)
  const flips = (fn) => {
    const out = [0];
    let last = fn(0);
    for (let i = 1; i <= DUR * 120; i++) {
      const v = fn(i / 120);
      if (v !== last) out.push(i / 120);
      last = v;
    }
    return out;
  };
  const lastFlip = (arr, t, first) => {
    let s = arr[0];
    arr.forEach((f) => {
      if (t >= f) s = f;
    });
    return s === 0 ? first : s;
  };
  const GOOD = [0, 1, 2].map((k) => flips((t) => good(k, t)));
  const LINK = [1, 2].map((k) => flips((t) => linkOk(k, t)));
  const near = (arr, want) => {
    A8.same("rewrite: a state flips as often as planned", arr.length, want.length + 1);
    want.forEach((w, i) => A8.close("rewrite: a state flips when planned", arr[i + 1], w, 0.02));
  };
  near(GOOD[0], [T.hash1[1], HUNTS[0].won]);
  near(GOOD[1], [T.hash1[1] + LAG, HUNTS[1].won]);
  near(GOOD[2], [T.prev2[1] + LAG, HUNTS[2].won]);
  near(LINK[0], [T.hash1[1] + LAG, T.prev2[1]]);
  near(LINK[1], [T.prev2[1] + LAG, T.prev3[1]]);
  A8.same(
    "rewrite: at the end every block is sealed and linked",
    [0, 1, 2].map((k) => good(k, DUR)),
    [true, true, true],
  );

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
  // the words of the edit: what stays, what is rubbed out, what is typed
  const OLD = SV[0][0].data;
  const NEW = SV[1][0].data;
  let common = 0;
  while (common < OLD.length && OLD[common] === NEW[common]) common++;
  const [KEEP, GONE, TYPED] = [OLD.slice(0, common), OLD.slice(common), NEW.slice(common)];
  A8.same(
    "rewrite: the edit keeps 'ann pays ' and swaps the tail",
    [KEEP, GONE, TYPED],
    ["ann pays ", "ben 5", "EVE 50"],
  );
  const edited = (t) => {
    const k = ramp(t, T.edit[0], T.edit[1], lin);
    if (k <= 0) return OLD;
    if (k >= 1) return NEW;
    return (
      KEEP + (k < 0.35 ? GONE.slice(0, Math.round(GONE.length * (1 - k / 0.35))) : V.type(TYPED, (k - 0.35) / 0.65))
    );
  };

  function build(stage) {
    // the three blocks, sealed: data, prev, nonce, hash
    const blocks = [0, 1, 2].map((i) =>
      A8.block(stage, {
        x: BLK.x + i * BLK.step,
        y: BLK.y,
        w: BLK.w,
        fields: ["data", "prev", "nonce", "hash"],
        title: `Block ${i + 1}`,
      }),
    );
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
    // the two definitions, shown before the words are used
    const sealTag = A8.tag(stage, {
      x: 12,
      y: LEGEND_Y,
      text: "sealed: hash starts with 0",
      tone: "green",
      anchor: "l",
    });
    const mineTag = A8.tag(stage, { x: 924, y: LEGEND_Y, text: "mining: trying nonces", tone: "orange", anchor: "r" });
    // the work bars: one per block, as long as its hunt
    const labels = [0, 1, 2].map((i) =>
      A8.tag(stage, {
        x: BAR.labelX,
        y: BAR.y + BAR.step * i + BAR.h / 2,
        text: `block ${i + 1}`,
        tone: "grey",
        anchor: "l",
      }),
    );
    const bars = [0, 1, 2].map((i) =>
      A8.bar(stage, { x: BAR.x, y: BAR.y + BAR.step * i, w: BAR.w, h: BAR.h, tone: "orange" }),
    );
    // the bracket that adds the three hunts up, and the total
    const svg = L5.svg(stage);
    const brace = V.s("path", {
      class: "c-orange",
      d: `M ${BRACKET.x} ${BRACKET.y0} H ${BRACKET.x + 18} V ${BRACKET.y1} H ${BRACKET.x} M ${BRACKET.x + 18} ${TOTAL.y} H ${BRACKET.tip}`,
      pathLength: 1,
      fill: "none",
      "stroke-width": 6,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: "var(--c-lip)", strokeDasharray: "1 1" },
    });
    svg.append(brace);
    const total = A8.tag(stage, {
      x: TOTAL.x,
      y: TOTAL.y,
      text: `${SEAL.total} tries`,
      tone: "orange",
      solid: true,
      fs: 44,
    });

    // the scale of a real chain, in grey: the toy 50 is tiny
    const scale = A8.tag(stage, {
      x: SCALE.x,
      y: SCALE.y,
      text: "real blocks need\ntrillions of tries",
      box: true,
      tone: "grey",
      fs: 28,
    });

    return (t) => {
      // ----- the blocks -----
      blocks.forEach((b, k) => {
        const h = HUNTS[k];
        const hunting = t >= h.a && t < h.won;
        const hash = k === 0 && t < h.a ? roll(SV[0][0].hash, SV[1][0].hash, t, T.hash1) : hashAt(k, t);
        const prevRoll = k === 1 ? T.prev2 : k === 2 ? T.prev3 : null;
        const prev = prevRoll ? roll(SV[0][k].prev, k === 1 ? SV[3][1].prev : SV[4][2].prev, t, prevRoll) : GEN;
        const ok = good(k, t);
        const since = lastFlip(GOOD[k], t, T.block + 0.25 * k + 0.3);
        b.set({
          title: `Block ${k + 1}`,
          data: k === 0 ? edited(t) : SV[0][k].data,
          prev,
          nonce: nonceAt(k, t),
          hash,
          dataTone: k === 0 && t >= T.edit[0] ? "orange" : "grey",
          prevTone: linkOk(k, t) ? "blue" : "red",
          nonceTone: hunting ? "orange" : "grey",
          hashTone: "blue",
          prevMarks: prevRoll && changing(t, prevRoll) ? () => "orange" : null,
          hashMarks:
            k === 0 && changing(t, T.hash1) && t < h.a
              ? () => "orange"
              : (j) => (j === 0 ? (lead0(hash) ? "green" : "red") : null),
          tone: ok ? "green" : "red",
          mark: ok ? "ok" : "bad",
          markK: ramp(t, since, since + 0.25, lin),
          k: pop(t, T.block + 0.25 * k, 0.55),
        });
      });

      // ----- the links and their discs -----
      links.forEach((l, i) => {
        const ok = linkOk(i + 1, t);
        const since = lastFlip(LINK[i], t, T.tick + 0.1 * i);
        l.line.set({ k: ramp(t, T.link[0] + 0.1 * i, T.link[1] + 0.1 * i, lin), tone: ok ? "blue" : "red" });
        l.ok.set({ k: ok ? pop(t, since) : 0 });
        l.bad.set({ k: ok ? 0 : pop(t, since), draw: ramp(t, since + 0.05, since + 0.3, lin) });
      });

      // ----- the two definitions -----
      sealTag.set({ k: pop(t, T.legendSeal, 0.35) });
      mineTag.set({ k: pop(t, T.legendMine, 0.35) });

      // ----- the work bars: one hash per try, finished with its count once the winner is found -----
      bars.forEach((bar, k) => {
        const h = HUNTS[k];
        const n = t < h.a ? -1 : rowAt(k, t);
        const found = t >= h.won;
        labels[k].set({ k: pop(t, h.a - 0.15, 0.3) });
        bar.set({ k: (n + 1) / BAR_OF, text: found ? `${h.tries} tries` : "", textOut: k === 1 });
      });

      // ----- the total -----
      const bk = ramp(t, T.bracket, T.bracket + 0.3, lin);
      brace.style.strokeDashoffset = String(1 - bk);
      V.show(brace, bk > 0.002 ? 1 : 0);
      total.set({ k: pop(t, T.total, 0.4) });
      scale.set({ k: pop(t, T.scale, 0.4) });
    };
  }

  V.scene({
    kicker: "PROOF OF WORK",
    title: ["Rewriting history", "means redoing the work"],
    dur: DUR,
    caps: [
      [0.5, 2.0, "Each block is sealed by its own proof of work."],
      [2.9, 4.2, "Edit block 1: its seal and the link both break."],
      [4.3, 5.8, "Forging it means mining block 1 again."],
      [5.9, 8.2, "Then every later block must be mined again too."],
      [8.5, 11.0, "Rewriting history means redoing all that work."],
    ],
    build,
  });
})();
