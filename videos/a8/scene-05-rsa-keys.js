/* Phase 8 · scene 05 rsa-keys (12 s): "Publish a lock, keep the key". Building the toy RSA key pair of lesson 8.3 ("RSA in miniature").
   Bob picks two secret primes p = 5 and q = 11, multiplies them to n = 55 (public), works out z = (5 - 1)(11 - 1) = 40 (secret),
   picks e = 3 (it shares no factor with 40: public) and finds d = 27 because 3 x 27 = 81 = 2 x 40 + 1 (secret). Only two things
   leave the workshop: the PUBLIC KEY (55, 3), a padlock anyone can snap shut, and the PRIVATE KEY 27, the only key that opens it.
   A grid of cells beside the first rows shows WHY: 5 rows x 11 columns = the 55 cells of n (blue, public); taking away the last row
   and the last column leaves the 4 x 10 = 40 cells of z (purple, secret).
   Colours: purple = secret (always with a lock in the left gutter), blue = public, green = a check that passed, orange = the
   remainder 1 that makes d work, grey = a row that has been put away. Every number comes from A8.RSA (common.js) and is asserted below.
   Timeline (local seconds): 0.2 Bob; 0.4 / 0.65 the two primes, 0.95 their lock; 2.0 n = 5 x 11, 2.25-2.5 "= 55" types out; 3.55 z,
   3.85-4.15 "= 40" types out, 4.3 its lock; 5.55 e = 3, 5.75 "shares no factor with 40", 5.9-6.35 the tick draws; 7.4 d = 27 and its
   lock, 7.55-8.15 the relation types out with "+ 1" last; 9.1-9.45 the primes and z are put away (grey, dashed); 9.6 the padlock
   (open) with its tags, n and e flash as its parts; 10.15-10.45 it snaps shut; 10.3 the private key, 10.35-10.75 d flashes as its part. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, flash, ease: E } = V;
  const lin = E.lin;
  const R = A8.RSA;

  // ---------- the model: every number comes from the helper, checked here ----------
  const isPrime = (x) => x > 1 && Array.from({ length: x - 2 }, (_, i) => i + 2).every((f) => x % f !== 0);
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

  // the text of every row, built from the numbers (the arithmetic signs are plain text, not glyph icons)
  const TX = {
    p: `prime p = ${R.p}`,
    q: `prime q = ${R.q}`,
    nHead: `n = ${R.p} × ${R.q}`,
    nTail: ` = ${R.n}`,
    zHead: `z = (${R.p} − 1) × (${R.q} − 1)`,
    zTail: ` = ${R.z}`,
    e: `e = ${R.e}`,
    share: `shares no factor with ${R.z}`,
    d: `d = ${R.d}`,
    relMain: `${R.e} × ${R.d} = ${R.dCheck.prod} = ${R.dCheck.k} × ${R.z}`,
    relLast: `+ ${R.dCheck.rem}`,
    pub: `(${R.n}, ${R.e})`,
    priv: `${R.d}`,
  };

  // ---------- layout (stage px) ----------
  const X0 = 64; // left edge of every recipe tag
  const GX = 34; // the lock gutter
  const ROWY = [130, 225, 320, 415, 510];
  const RX = 796; // centre of the key-pair column
  const CELL = { x: 430, size: 18, gap: 3 }; // the n / z grid, to the right of the n row (y centred on that row)
  const tagW = (text, fs) => A8.textW(text, fs) + 44; // a rough pill width (text + padding + border)
  const wP = tagW(TX.p, 36);
  const wE = tagW(TX.e, 40);
  const wD = tagW(TX.d, 40);
  const wShare = tagW(TX.share, 28);
  const QX = X0 + wP + 14; // the second prime, after the first
  const SHAREX = X0 + wE + 14; // "shares no factor with 40", after e = 3
  const RELX = X0 + wD + 14; // the relation, after d = 27
  const TICKX = SHAREX + wShare + 14 + 22;
  A8.must(
    RELX + tagW(`${TX.relMain} ${TX.relLast}`, 32) + 24 < RX - 112 - 8,
    "the relation row stays clear of the private key tag",
  );
  A8.must(TICKX + 22 < RX - 112, "the tick stays clear of the key column");
  // the remainder 1 is an orange chip inside the purple relation tag (dark text on the saturated fill: 4.8:1 or better)
  const CHIP =
    "display:inline-block;margin-left:8px;padding:0 10px;border-radius:12px;background:var(--amber);color:var(--amber-on)";

  // ---------- timeline (local seconds) ----------
  const T = {
    bob: 0.2,
    p: 0.4,
    q: 0.65,
    lock1: 0.95,
    n: 2.0,
    grid: [2.05, 2.7],
    nTail: [2.25, 2.5],
    nFlash: [2.5, 2.9],
    z: 3.55,
    zGrid: 3.6,
    zTail: [3.85, 4.15],
    zFlash: [4.15, 4.55],
    lock3: 4.3,
    e: 5.55,
    share: 5.75,
    tick: [5.9, 6.35],
    d: 7.4,
    lock5: 7.5,
    rel: [7.55, 8.15],
    relFlash: [8.15, 8.55],
    forget: [9.1, 9.45],
    pad: 9.6,
    padTag: 9.75,
    padNums: 9.9,
    partsFlash: [9.65, 10.05],
    snap: [10.15, 10.45],
    key: 10.3,
    keyTag: 10.45,
    keyNum: 10.6,
    dFlash: [10.35, 10.75],
  };
  const pop = (t, a, d = 0.35) => ramp(t, a, a + d, lin);
  const inside = (t, [a, b]) => t >= a && t < b;
  const bump = (t, w, amount = 0.07) => 1 + amount * flash(t, w[0], w[1]);
  const typed = (full, t, w) => V.type(full, ramp(t, w[0], w[1], lin));

  function build(stage) {
    // ---------- the recipe (left) ----------
    const lock = (y) => A8.icon(stage, "lock", { x: GX, y, tone: "purple", size: 38 });
    const lock1 = lock(ROWY[0]);
    const lock3 = lock(ROWY[2]);
    const lock5 = lock(ROWY[4]);

    const secret = (text, x, y, fs) => A8.tag(stage, { x, y, text, tone: "purple", fs, anchor: "l" });
    const shelved = (text, x, y, fs) => A8.tag(stage, { x, y, text, tone: "grey", ghost: true, fs, anchor: "l", o: 0 });
    const pTag = secret(TX.p, X0, ROWY[0], 36);
    const qTag = secret(TX.q, QX, ROWY[0], 36);
    const pAway = shelved(TX.p, X0, ROWY[0], 36);
    const qAway = shelved(TX.q, QX, ROWY[0], 36);
    const gridH = GRID.rows * CELL.size + (GRID.rows - 1) * CELL.gap;
    const grid = A8.cells(stage, {
      x: CELL.x,
      y: Math.round(ROWY[1] - gridH / 2),
      cols: GRID.cols,
      rows: GRID.rows,
      size: CELL.size,
      gap: CELL.gap,
    });
    A8.must(CELL.x + grid.width < RX - 112, "the grid stays clear of the key-pair column");
    const nTag = A8.tag(stage, { x: X0, y: ROWY[1], text: TX.nHead, tone: "blue", fs: 40, anchor: "l" });
    const zTag = secret(TX.zHead, X0, ROWY[2], 36);
    const zAway = shelved(TX.zHead + TX.zTail, X0, ROWY[2], 36);
    const eTag = A8.tag(stage, { x: X0, y: ROWY[3], text: TX.e, tone: "blue", fs: 40, anchor: "l" });
    const shareTag = A8.tag(stage, { x: SHAREX, y: ROWY[3], text: TX.share, tone: "green", fs: 28, anchor: "l" });
    const tick = A8.icon(stage, "tick", { x: TICKX, y: ROWY[3], tone: "green", size: 44 });
    const dTag = secret(TX.d, X0, ROWY[4], 40);
    const relTag = A8.tag(stage, { x: RELX, y: ROWY[4], html: "", tone: "purple", fs: 32, anchor: "l" });

    // ---------- the key pair (right) ----------
    const padlock = A8.icon(stage, "lock", { x: RX, y: 190, tone: "blue", size: 120 });
    const padTag = A8.tag(stage, { x: RX, y: 290, text: "public key", tone: "blue", fs: 32 });
    const padNums = A8.tag(stage, { x: RX, y: 345, text: TX.pub, tone: "blue", solid: true, fs: 36 });
    const key = A8.icon(stage, "key", { x: RX, y: 440, tone: "purple", size: 120 });
    const keyTag = A8.tag(stage, { x: RX, y: 534, text: "private key", tone: "purple", fs: 32 });
    const keyNum = A8.tag(stage, { x: RX, y: 589, text: TX.priv, tone: "purple", solid: true, fs: 36 });

    const bob = A8.person(stage, { who: "bob", x: 52, y: 50 });

    return (t) => {
      bob.set({ k: pop(t, T.bob, 0.5) });

      // the primes and z are put away once only the keys matter: grey, dashed outline, the lock lets go
      const g = ramp(t, ...T.forget, lin);
      const gone = 1 - g;

      // row 1: two secret primes
      pTag.set({ k: pop(t, T.p), o: gone });
      qTag.set({ k: pop(t, T.q), o: gone });
      pAway.set({ ghost: true, k: pop(t, T.p), o: g });
      qAway.set({ ghost: true, k: pop(t, T.q), o: g });
      lock1.set({ k: pop(t, T.lock1, 0.3), o: gone });

      // the grid: n cells (blue); then the last row and column are taken away and the inner z cells turn purple
      grid.update(
        (r, c) => {
          const tz = T.zGrid + 0.015 * (r + c);
          if (t < tz) return { tone: "blue" };
          return inGrid(r, c)
            ? { tone: "purple", k: pop(t, tz, 0.2) }
            : { tone: "grey", ghost: true, k: pop(t, tz, 0.2) };
        },
        { rows: GRID.rows * ramp(t, ...T.grid, lin), o: gone },
      );

      // row 2: n = p x q
      const nFlash = inside(t, T.nFlash) || inside(t, T.partsFlash);
      nTag.set({
        text: TX.nHead + typed(TX.nTail, t, T.nTail),
        solid: nFlash,
        k: pop(t, T.n),
        s: Math.max(bump(t, T.nFlash), bump(t, T.partsFlash)),
      });

      // row 3: z = (p - 1)(q - 1)
      zTag.set({
        text: TX.zHead + typed(TX.zTail, t, T.zTail),
        solid: inside(t, T.zFlash),
        k: pop(t, T.z),
        s: bump(t, T.zFlash),
        o: gone,
      });
      zAway.set({ ghost: true, k: pop(t, T.z), o: g });
      lock3.set({ k: pop(t, T.lock3, 0.3), o: gone });

      // row 4: e shares no factor with z
      eTag.set({
        k: pop(t, T.e),
        solid: inside(t, T.partsFlash),
        s: bump(t, T.partsFlash),
      });
      shareTag.set({ k: pop(t, T.share, 0.3) });
      tick.set({ k: pop(t, T.tick[0], 0.2), draw: ramp(t, ...T.tick, lin) });

      // row 5: d, and the sum that proves it (the remainder 1 comes last, in orange)
      dTag.set({
        k: pop(t, T.d),
        solid: inside(t, T.dFlash),
        s: bump(t, T.dFlash),
      });
      lock5.set({ k: pop(t, T.lock5, 0.3) });
      const rel = typed(`${TX.relMain} ${TX.relLast}`, t, T.rel);
      const main = A8.esc(rel.slice(0, TX.relMain.length));
      const last = rel.slice(TX.relMain.length).trim();
      relTag.set({
        html: main + (last ? `<span style="${CHIP}">${A8.esc(last)}</span>` : ""),
        k: pop(t, T.rel[0], 0.25),
        s: bump(t, T.relFlash, 0.05),
      });

      // the key pair: a padlock anyone can snap shut, and the one key that opens it
      const open = 1 - ramp(t, ...T.snap, E.inOut);
      padlock.set({ k: pop(t, T.pad, 0.4), open, s: bump(t, [T.snap[1] - 0.15, T.snap[1] + 0.2], 0.1) });
      padTag.set({ k: pop(t, T.padTag, 0.3) });
      padNums.set({ k: pop(t, T.padNums, 0.3) });
      key.set({ k: pop(t, T.key, 0.4) });
      keyTag.set({ k: pop(t, T.keyTag, 0.3) });
      keyNum.set({ k: pop(t, T.keyNum, 0.3) });
    };
  }

  V.scene({
    kicker: "RSA KEY PAIR",
    title: ["Publish a lock,", "keep the key"],
    dur: 12,
    caps: [
      [0.5, 2.1, "Pick two secret primes: 5 and 11."],
      [2.2, 3.8, "Multiply them: n = 55 will be public."],
      [3.9, 5.6, "Next z = (5 − 1) × (11 − 1) = 40, kept secret."],
      [5.7, 7.5, "Pick e = 3: it shares no factor with 40."],
      [7.6, 9.4, "d = 27, because 3 × 27 = 81 = 2 × 40 + 1."],
      [9.6, 11.6, "Publish (55, 3). Keep 27 secret."],
    ],
    build,
  });
})();
