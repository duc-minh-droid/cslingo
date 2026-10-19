/* Phase 8 · scene 05 rsa-keys (13.5 s): "Publish a lock, keep the key". Building the toy RSA key pair of lesson 8.3 ("RSA in miniature").
   Bob picks two secret primes p = 5 and q = 11, multiplies them to n = 55 (public), works out z = (5 - 1)(11 - 1) = 40 (secret),
   picks e = 3 (it shares no factor with 40: public) and finds d = 27 because 3 x 27 = 81 = 2 x 40 + 1 (secret). Only two things
   leave the workshop: the PUBLIC KEY (55, 3), a padlock anyone can snap shut, and the PRIVATE KEY 27, the only key that opens it.
   The picture is a grid: 5 rows x 11 columns = the 55 cells of n (blue, public); taking away the last row and the last column leaves
   the 4 x 10 = 40 cells of z (purple, secret), and the side labels change from 5 and 11 to 4 and 10. The e check is drawn as two
   rows of factors (3: 1 3 and 40: 1 2 4 5 8 10 20 40) whose only shared chip, 1, lights up green. The right column is the key pair
   growing as the numbers are chosen: the open padlock arrives with n (blue, public), e joins n in "(55, 3)", the key arrives with d.
   Colours: purple = secret (always with a lock or a dashed purple frame), blue = public, green = a check that passed, orange = the
   remainder 1 that makes d work, grey = a factor that is not shared. Every number comes from A8.RSA (common.js) and is asserted
   below; the captions are built from the same numbers.
   Timeline (local seconds): 0.2 Bob; 0.45 label p, 0.7 label q (each with its lock); 0.95-1.9 the grid grows (pale); 2.3-2.7 the cells
   turn blue, "n = 5 x 11" with "= 55" typed 2.55-2.95; 3.1 the open padlock with "public key" and "n = 55"; 4.0 the inner cells turn
   purple, the last row and column go dashed grey, the labels become p - 1 = 4 and q - 1 = 10, 4.3-4.7 z is typed, 4.85 "only Bob can
   work this out"; 5.8-6.1 the grid and its rows fade; 6.1-6.9 the two factor rows (3 and 40) pop; 6.95 the shared 1 turns green, 7.15
   its tick and "only 1 in common"; 8.3-8.65 the rows fade and e joins n in the padlock's tag; 8.7 d = 27, 8.9-9.7 the relation
   types out with "+ 1" last; 10.0 the private key, its tag and 27; 11.0 both keys flash (publish this, keep that). */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, flash, ease: E } = V;
  const lin = E.lin;
  const R = A8.RSA;

  // ---------- the model: every number comes from the helper, checked here ----------
  const isPrime = (x) => x > 1 && Array.from({ length: x - 2 }, (_, i) => i + 2).every((f) => x % f !== 0);
  const divisors = (x) => Array.from({ length: x }, (_, i) => i + 1).filter((f) => x % f === 0);
  A8.same("rsa keys: two secret primes and their product", [R.p, R.q, R.n, R.p * R.q], [5, 11, 55, 55]);
  A8.same("rsa keys: p and q are prime", [isPrime(R.p), isPrime(R.q)], [true, true]);
  A8.same("rsa keys: z = (p - 1)(q - 1) = 4 x 10 = 40", [R.z, (R.p - 1) * (R.q - 1), 4 * 10], [40, 40, 40]);
  A8.same(
    "rsa keys: e = 3 shares no factor with 40, e = 2 does",
    R.eCands.map((c) => [c.e, c.g, A8.gcd(c.e, R.z)]),
    [
      [2, 2, 2],
      [3, 1, 1],
    ],
  );
  A8.same("rsa keys: e is the candidate with no common factor", [R.e, A8.gcd(R.e, R.z)], [3, 1]);
  A8.same("rsa keys: 3 x 27 = 81 = 2 x 40 + 1", R.dCheck, { prod: 81, k: 2, rem: 1 });
  A8.same("rsa keys: the relation adds up", [R.e * R.d, R.dCheck.k * R.z + R.dCheck.rem], [81, 81]);
  A8.same("rsa keys: d is the smallest number with e x d = 1 (mod z)", [R.d, (R.e * R.d) % R.z], [27, 1]);
  A8.same("rsa keys: the public key is (n, e) and the private key is d", [R.n, R.e, R.d], [55, 3, 27]);

  // the grid: p rows by q columns of cells is n cells; without the last row and column it is (p - 1) x (q - 1) = z cells
  const GRID = { rows: R.p, cols: R.q, innerRows: R.p - 1, innerCols: R.q - 1 };
  const inGrid = (r, c) => r < GRID.innerRows && c < GRID.innerCols;
  const cellsIn = Array.from({ length: GRID.rows * GRID.cols }, (_, i) =>
    inGrid(Math.floor(i / GRID.cols), i % GRID.cols),
  );
  A8.same(
    "rsa keys: the grid holds n cells, the inner block z cells",
    [cellsIn.length, cellsIn.filter(Boolean).length, cellsIn.filter((x) => !x).length],
    [R.n, R.z, R.n - R.z],
  );

  // the two factor rows of the e check: the only factor of e and z in common is 1
  const FAC = { e: divisors(R.e), z: divisors(R.z) };
  const COMMON = FAC.e.filter((f) => FAC.z.includes(f));
  A8.same(
    "rsa keys: factors of 3 and of 40",
    [FAC.e, FAC.z],
    [
      [1, 3],
      [1, 2, 4, 5, 8, 10, 20, 40],
    ],
  );
  A8.same("rsa keys: the only shared factor is 1", [COMMON, FAC.e.filter((f) => FAC.z.includes(f)).length], [[1], 1]);

  // the text of every tag, built from the numbers (the arithmetic signs are plain text, not glyph icons)
  const TX = {
    p: `p = ${R.p}`,
    q: `q = ${R.q}`,
    pm: `p − 1 = ${R.p - 1}`,
    qm: `q − 1 = ${R.q - 1}`,
    nHead: `n = ${R.p} × ${R.q}`,
    nTail: ` = ${R.n}`,
    zHead: `z = (${R.p} − 1) × (${R.q} − 1)`,
    zTail: ` = ${R.z}`,
    e: `e = ${R.e}`,
    zNum: `z = ${R.z}`,
    share: `only ${COMMON.join(", ")} in common`,
    d: `d = ${R.d}`,
    relMain: `${R.e} × ${R.d} = ${R.dCheck.prod} = ${R.dCheck.k} × ${R.z}`,
    relLast: `+ ${R.dCheck.rem}`,
    nOnly: `n = ${R.n}`,
    pub: `(${R.n}, ${R.e})`,
    priv: `${R.d}`,
  };
  const CAP = {
    primes: `Pick two secret primes: ${R.p} and ${R.q}.`,
    n: `Multiply them: n = ${R.n} is public.`,
    z: `Next ${TX.zHead} = ${R.z}, kept secret.`,
    e: `Pick e = ${R.e}: only ${COMMON.join(", ")} divides both ${R.e} and ${R.z}.`,
    d: `d = ${R.d}, because ${TX.relMain} ${TX.relLast}.`,
    pub: `Publish ${TX.pub}. Keep ${R.d} secret.`,
  };

  // ---------- layout (stage px) ----------
  const CELL = { x: 272, y: 170, size: 28, gap: 4 }; // the n / z grid (348 x 156)
  const gridW = GRID.cols * CELL.size + (GRID.cols - 1) * CELL.gap;
  const gridH = GRID.rows * CELL.size + (GRID.rows - 1) * CELL.gap;
  const GMID = { x: CELL.x + gridW / 2, y: CELL.y + gridH / 2 };
  const RX = 800; // centre of the key-pair column
  const PUB = { icon: 118, tag: 202, nums: 266 };
  const KEY = { icon: 392, tag: 474, nums: 538 };
  const ROW = { x: 56, a: 270, b: 366, chipX: 246, w: 48, h: 52, gap: 6, tick: 456 }; // the e check
  const DROW = { d: 262, rel: 352, bars: 424, unit: 6 }; // the d step; the bars show 81 = 2 x 40 + 1 (6 px per unit)
  A8.must(CELL.x + gridW + 40 < RX - 100, "the grid stays clear of the key-pair column");
  A8.must(ROW.chipX + FAC.z.length * (ROW.w + ROW.gap) < RX - 100, "the factor row stays clear of the key-pair column");
  // the remainder 1 is an orange chip inside the purple relation tag (dark text on the saturated fill: 4.8:1 or better)
  const CHIP =
    "display:inline-block;margin-left:8px;padding:0 10px;border-radius:12px;background:var(--amber);color:var(--amber-on)";

  // ---------- timeline (local seconds) ----------
  const T = {
    bob: 0.2,
    pLabel: 0.45,
    qLabel: 0.7,
    grid: [0.95, 1.9],
    n: 2.3, // cells turn blue (+ 0.012 per step along the diagonal), the n tag pops
    nTail: [2.55, 2.95],
    nFlash: [2.95, 3.35],
    pad: 3.1,
    padTag: 3.25,
    padNums: 3.4,
    z: 4.0, // inner cells purple (+ 0.02 per step), labels change
    zFlash: [4.0, 4.4],
    zTag: 4.05,
    zTail: [4.3, 4.7],
    zLock: 4.2,
    note: 4.85,
    out1: [5.8, 6.1],
    rowA: 6.1,
    chipsA: 6.2, // + 0.07 i
    rowB: 6.3,
    chipsB: 6.4, // + 0.045 i
    common: [6.95, 7.3],
    tick: [7.15, 7.5],
    shareTag: 7.2,
    out2: [8.3, 8.65],
    eIn: 8.4, // e joins n in the padlock's tag
    eFlash: [8.4, 8.8],
    d: 8.7,
    rel: [8.9, 9.7],
    bars: [9.2, 9.45], // the first block of 40; the second 9.45-9.7, the remainder 1 at 9.75-9.95
    rest: [9.75, 9.95],
    relFlash: [9.7, 10.1],
    key: 10.0,
    keyTag: 10.15,
    keyNum: 10.3,
    both: [11.0, 11.45],
  };
  const pop = (t, a, d = 0.35) => ramp(t, a, a + d, lin);
  const popK = (t, a, d = 0.2) => 0.4 + 0.6 * ramp(t, a, a + d, lin); // a cell that was already visible never blinks out
  const inside = (t, [a, b]) => t >= a && t < b;
  const bump = (t, w, amount = 0.07) => 1 + amount * flash(t, w[0], w[1]);
  const typed = (full, t, w) => V.type(full, ramp(t, w[0], w[1], lin));

  function build(stage) {
    const bob = A8.person(stage, { who: "bob", x: 52, y: 50 });

    // ---------- the grid and its labels (secret primes, with locks) ----------
    const grid = A8.cells(stage, {
      x: CELL.x,
      y: CELL.y,
      cols: GRID.cols,
      rows: GRID.rows,
      size: CELL.size,
      gap: CELL.gap,
    });
    const LBL = { px: 70, qx: 346 }; // left edges of the two labels (they grow to the right when they become p - 1 and q - 1)
    const pLabel = A8.tag(stage, { x: LBL.px, y: GMID.y, text: TX.p, tone: "purple", fs: 36, anchor: "l" });
    const qLabel = A8.tag(stage, { x: LBL.qx, y: CELL.y - 44, text: TX.q, tone: "purple", fs: 36, anchor: "l" });
    const pLock = A8.icon(stage, "lock", { x: LBL.px - 28, y: GMID.y, tone: "purple", size: 38 });
    const qLock = A8.icon(stage, "lock", { x: LBL.qx - 28, y: CELL.y - 44, tone: "purple", size: 38 });
    const nTag = A8.tag(stage, { x: GMID.x, y: 392, text: TX.nHead, tone: "blue", fs: 40 });
    const zTag = A8.tag(stage, { x: GMID.x, y: 466, text: TX.zHead, tone: "purple", fs: 36 });
    const zLock = A8.icon(stage, "lock", { x: GMID.x - 240 - 26, y: 466, tone: "purple", size: 38 });
    const note = A8.tag(stage, {
      x: GMID.x,
      y: 536,
      text: "only Bob can work this out",
      tone: "purple",
      ghost: true,
      fs: 28,
    });

    // ---------- the e check: factors of e and of z, the shared chip lights up ----------
    const chipX = (i) => ROW.chipX + i * (ROW.w + ROW.gap) + ROW.w / 2;
    const rowA = A8.tag(stage, { x: ROW.x, y: ROW.a, text: TX.e, tone: "blue", fs: 40, anchor: "l" });
    const rowB = A8.tag(stage, { x: ROW.x, y: ROW.b, text: TX.zNum, tone: "purple", fs: 40, anchor: "l" });
    const rowBLock = A8.icon(stage, "lock", { x: 30, y: ROW.b, tone: "purple", size: 34 });
    const chip = (f, i, y) => ({
      f,
      i,
      shared: COMMON.includes(f),
      tag: A8.tag(stage, { x: chipX(i), y, text: String(f), tone: "grey", fs: 30, w: ROW.w, h: ROW.h }),
    });
    const chipsA = FAC.e.map((f, i) => chip(f, i, ROW.a));
    const chipsB = FAC.z.map((f, i) => chip(f, i, ROW.b));
    const tick = A8.icon(stage, "tick", { x: ROW.chipX - 6, y: ROW.tick, tone: "green", size: 44 });
    const shareTag = A8.tag(stage, {
      x: ROW.chipX + 30,
      y: ROW.tick,
      text: TX.share,
      tone: "green",
      fs: 32,
      anchor: "l",
    });

    // ---------- the d step ----------
    const dLock = A8.icon(stage, "lock", { x: 34, y: DROW.d, tone: "purple", size: 38 });
    const dTag = A8.tag(stage, { x: 62, y: DROW.d, text: TX.d, tone: "purple", fs: 44, anchor: "l" });
    const relTag = A8.tag(stage, { x: 24, y: DROW.rel, html: "", tone: "purple", fs: 36, anchor: "l" });
    // 81 as bars: two blocks of 40 and 1 left over
    const bar40 = (i) =>
      A8.bar(stage, {
        x: 24 + i * (40 * DROW.unit + 6),
        y: DROW.bars,
        w: R.z * DROW.unit,
        h: 52,
        tone: "purple",
        text: String(R.z),
        fs: 32,
      });
    const bars = [bar40(0), bar40(1)];
    const barRest = A8.bar(stage, {
      x: 24 + 2 * (R.z * DROW.unit + 6),
      y: DROW.bars,
      w: R.dCheck.rem * DROW.unit,
      h: 52,
      tone: "orange",
      fs: 34,
    });

    // ---------- the key pair grows on the right ----------
    const padlock = A8.icon(stage, "lock", { x: RX, y: PUB.icon, tone: "blue", size: 112 });
    const padTag = A8.tag(stage, { x: RX, y: PUB.tag, text: "public key", tone: "blue", fs: 32 });
    const padNums = A8.tag(stage, { x: RX, y: PUB.nums, text: TX.nOnly, tone: "blue", solid: true, fs: 36 });
    const key = A8.icon(stage, "key", { x: RX, y: KEY.icon, tone: "purple", size: 112 });
    const keyTag = A8.tag(stage, { x: RX, y: KEY.tag, text: "private key", tone: "purple", fs: 32 });
    const keyNum = A8.tag(stage, { x: RX, y: KEY.nums, text: TX.priv, tone: "purple", solid: true, fs: 36 });

    return (t) => {
      bob.set({ k: pop(t, T.bob, 0.5) });
      const o1 = 1 - ramp(t, ...T.out1, lin);
      const o2 = 1 - ramp(t, ...T.out2, lin);

      // the grid: five rows of eleven cells grow (pale), turn blue (n), then the last row and column go away and the inner cells turn purple (z)
      grid.update(
        (r, c) => {
          const tn = T.n + 0.012 * (r + c);
          const tz = T.z + 0.02 * (r + c);
          if (t < tn) return undefined;
          if (t < tz) return { tone: "blue", k: popK(t, tn) };
          return inGrid(r, c) ? { tone: "purple", k: popK(t, tz) } : { tone: "grey", ghost: true, k: popK(t, tz) };
        },
        { rows: GRID.rows * ramp(t, ...T.grid, lin), o: o1 },
      );
      const zNow = t >= T.z;
      const zUp = { solid: inside(t, T.zFlash), s: bump(t, T.zFlash) };
      pLabel.set({ text: zNow ? TX.pm : TX.p, k: pop(t, T.pLabel), o: o1, ...zUp });
      qLabel.set({ text: zNow ? TX.qm : TX.q, k: pop(t, T.qLabel), o: o1, ...zUp });
      pLock.set({ k: pop(t, T.pLabel, 0.3), o: o1 });
      qLock.set({ k: pop(t, T.qLabel, 0.3), o: o1 });
      nTag.set({
        text: TX.nHead + typed(TX.nTail, t, T.nTail),
        solid: inside(t, T.nFlash),
        k: pop(t, T.n),
        s: bump(t, T.nFlash),
        o: o1,
      });
      zTag.set({ text: TX.zHead + typed(TX.zTail, t, T.zTail), k: pop(t, T.zTag), o: o1 });
      zLock.set({ k: pop(t, T.zLock, 0.3), o: o1 });
      note.set({ ghost: true, k: pop(t, T.note), o: o1 });

      // the e check
      rowA.set({ k: pop(t, T.rowA), o: o2, solid: inside(t, T.eFlash), s: bump(t, T.eFlash) });
      rowB.set({ k: pop(t, T.rowB), o: o2 });
      rowBLock.set({ k: pop(t, T.rowB, 0.3), o: o2 });
      const lit = ramp(t, ...T.common, lin);
      const setChips = (list, start, step) =>
        list.forEach((c) =>
          c.tag.set({
            k: pop(t, start + step * c.i, 0.3),
            o: o2,
            tone: c.shared && lit > 0 ? "green" : "grey",
            solid: c.shared && lit > 0,
            s: c.shared ? 1 + 0.12 * flash(t, T.common[0], T.common[1] + 0.2) : 1,
          }),
        );
      setChips(chipsA, T.chipsA, 0.07);
      setChips(chipsB, T.chipsB, 0.045);
      tick.set({ k: pop(t, T.tick[0], 0.2), draw: ramp(t, ...T.tick, lin), o: o2 });
      shareTag.set({ k: pop(t, T.shareTag, 0.3), o: o2 });

      // the d step: d first, then the sum that proves it (the remainder 1 comes last, in orange)
      dLock.set({ k: pop(t, T.d, 0.3) });
      dTag.set({ k: pop(t, T.d), solid: inside(t, T.relFlash), s: bump(t, T.relFlash) });
      const rel = typed(`${TX.relMain} ${TX.relLast}`, t, T.rel);
      const main = A8.esc(rel.slice(0, TX.relMain.length));
      const last = rel.slice(TX.relMain.length).trim();
      relTag.set({
        html: main + (last ? `<span style="${CHIP}">${A8.esc(last)}</span>` : ""),
        k: pop(t, T.rel[0], 0.25),
      });

      bars.forEach((b, i) => b.set({ k: ramp(t, T.bars[0] + 0.25 * i, T.bars[1] + 0.25 * i, E.out) }));
      barRest.set({ k: ramp(t, ...T.rest, E.out), text: String(R.dCheck.rem), textOut: true });

      // the key pair: n arrives with the open padlock (anyone can snap it shut), e joins n, then d arrives with the one key that opens it
      const bothUp = bump(t, T.both, 0.08);
      padlock.set({ k: pop(t, T.pad, 0.4), open: 1, s: Math.max(bump(t, [T.pad + 0.2, T.pad + 0.5], 0.08), bothUp) });
      padTag.set({ k: pop(t, T.padTag, 0.3) });
      padNums.set({
        text: t >= T.eIn ? TX.pub : TX.nOnly,
        k: pop(t, T.padNums, 0.3),
        s: Math.max(bump(t, T.eFlash, 0.1), bothUp),
      });
      key.set({ k: pop(t, T.key, 0.4), s: bump(t, T.both, 0.08) });
      keyTag.set({ k: pop(t, T.keyTag, 0.3) });
      keyNum.set({ k: pop(t, T.keyNum, 0.3), s: bump(t, T.both, 0.1) });
    };
  }

  V.scene({
    kicker: "RSA KEY PAIR",
    title: ["Publish a lock,", "keep the key"],
    dur: 13.5,
    caps: [
      [0.5, 2.2, CAP.primes],
      [2.4, 4.0, CAP.n],
      [4.1, 5.8, CAP.z],
      [6.5, 8.3, CAP.e],
      [9.0, 10.8, CAP.d],
      [11.0, 12.9, CAP.pub],
    ],
    build,
  });
})();
