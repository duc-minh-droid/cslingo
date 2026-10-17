/* Phase 8 · scene 06 rsa-lock (13.4 s): "Anyone can lock it, only Bob can unlock". Using the key pair of scene 5. Bob sends out a copy
   of his public key (55, 3) along the open wire; Alice locks her message 7 with it (7^3 = 343 and 343 mod 55 = 13, so she sends 13);
   Bob unlocks with his private key d = 27 (13^27 mod 55 = 7). Eve copies everything on the wire, (55, 3) and 13, but never 27 (a red
   question mark: she is stuck); to get it she must factor n: she divides 55 by 2, 3, 4 and 5, finds 5 x 11 in four tries, then
   z = 4 x 10 = 40 and d = 27: the toy key is broken. A real n has 617+ digits, so that search never ends (a red cross and "too many
   tries" replace the chain, and Bob's key card is purple again).
   Colours: blue = public (the padlock, (55, 3), 13, the base and modulus of each sum), purple = secret (the private key 27, the exponent
   of the unlock sum), green = unlocked (the 7 Bob gets back, the unlock sum, the factor Eve hits), orange = the remainder 13 and the
   guesses being tried, red = Eve and the broken key. The padlock on the travelling 13 is Bob's blue public padlock; it opens only for
   the key that never leaves Bob's side.
   Timeline (local seconds): 0.2 Alice, Bob, the open wire; 0.5 / 0.75 Bob's padlock and private key; 0.6 Eve; 1.0-2.4 a copy of the
   padlock and (55, 3) travels the wire to Alice, 1.8 Eve's copy; 3.0 Alice's 7; 3.3 the lock sum, 3.55-4.05 its second line types out
   and the remainder 13 lights up; 4.2-4.6 the 7 becomes 13 and the padlock snaps shut; 4.7-5.5 the locked 13 crosses the wire, 5.1
   Eve's copy; 5.8 the unlock sum, 5.9-6.3 the key bumps, 6.05-6.3 "= 7" types out; 6.3-6.75 the padlock opens, 6.75 the green 7;
   5.9 Eve's red question mark (she cannot unlock 13 without 27), it fades 7.5-7.7; 7.7 + 0.3 i Eve's divisions (red cross, the last
   green tick), 8.85 "55 = 5 x 11", 9.25 "z = 4 x 10 = 40", 9.65 "so d = 27" and Bob's key turns red; 10.65-11.0 the chain fades, 10.8 the
   key is purple again; 11.15 "a real n: 617+ digits", 11.4 a red cross, 11.6 "too many tries". Every number comes from A8.RSA / A8.BIG and is asserted below; the captions are built from the same numbers. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;
  const R = A8.RSA;
  const BIG = A8.BIG;
  const esc = A8.esc;

  // ---------- the model: every number comes from the helper, and is checked here against plain BigInt sums ----------
  const mp = (b, e, m) => Number(BigInt(b) ** BigInt(e) % BigInt(m));
  const factors = (n) => {
    const tries = [];
    for (let f = 2; ; f++) {
      tries.push(f);
      if (n % f === 0) return { tries, found: f, other: n / f };
    }
  };
  const fa = factors(R.n);
  A8.same("rsa lock: the public key is (n, e) = (55, 3)", [R.n, R.e], [55, 3]);
  A8.same(
    "rsa lock: 7^3 = 343 = 6 x 55 + 13",
    [R.M, R.powE, R.quotE, R.remE, R.C, 7 ** 3, 6 * 55 + 13, mp(R.M, R.e, R.n)],
    [7, 343, 6, 13, 13, 343, 343, 13],
  );
  A8.same("rsa lock: 13^27 mod 55 = 7", [R.back, mp(R.C, R.d, R.n)], [7, 7]);
  A8.same(
    "rsa lock: the private key undoes the lock and e x d = 1 mod z",
    [R.back === R.M, (R.e * R.d) % R.z],
    [true, 1],
  );
  A8.same(
    "rsa lock: Eve's four tries",
    [R.attack.tries, fa.tries],
    [
      [2, 3, 4, 5],
      [2, 3, 4, 5],
    ],
  );
  A8.same(
    "rsa lock: 55 = 5 x 11, z = 40, d = 27",
    [R.attack.found, R.attack.other, fa.found * fa.other, R.attack.z, R.attack.d],
    [5, 11, 55, 40, 27],
  );
  A8.same("rsa lock: 343 mod 55 = 13", [R.powE % R.n, R.powE - R.quotE * R.n, R.remE], [13, 13, 13]);
  A8.same("rsa lock: a real n has 617 digits", [R.digits2048, BIG.digits], [617, 617]);

  const MUL = "×";
  const DIV = "÷";

  // ---------- small html helpers (colour roles inside a sum: public = blue, secret = purple) ----------
  const INK = { blue: "var(--blue-ink)", purple: "var(--violet-ink)" };
  const col = (tone, s) => `<span style="color:${INK[tone]}">${esc(s)}</span>`;
  const sup = (fs, inner) =>
    `<span style="font-size:${Math.max(28, Math.round(fs * 0.64))}px;vertical-align:${Math.round(fs * 0.42)}px;line-height:0;margin:0 0.12em 0 0.03em">${inner}</span>`;
  /* typed text keeps its room: what has been typed shows, the rest is hidden, so the sticker never resizes */
  const typedHtml = (full, k) => {
    const n = V.type(full, k).length;
    return `${esc(full.slice(0, n))}<span style="visibility:hidden">${esc(full.slice(n))}</span>`;
  };
  const label = (small, value) => `<span style="font-size:28px">${esc(small)}</span><br>${esc(value)}`;

  const SUM_FS = 36;
  const LOCK2 = { head: `${R.powE} mod ${R.n} = `, chip: String(R.remE) };
  /* second line of the lock sum: the remainder (the locked value) is typed last and lights up orange */
  const lockLine2 = (k, lit) => {
    const n = V.type(LOCK2.head + LOCK2.chip, k).length;
    const h = Math.min(n, LOCK2.head.length);
    const c = Math.max(0, n - LOCK2.head.length);
    const chip = `border-radius:12px;padding:0 10px;margin:0 -4px;${lit ? "background:var(--amber);color:var(--amber-on)" : ""}`;
    return (
      `${esc(LOCK2.head.slice(0, h))}<span style="visibility:hidden">${esc(LOCK2.head.slice(h))}</span>` +
      `<span style="${chip}">${esc(LOCK2.chip.slice(0, c))}<span style="visibility:hidden">${esc(LOCK2.chip.slice(c))}</span></span>`
    );
  };
  const lockHtml = (k, lit) => `${A8.pow(String(R.M), String(R.e), SUM_FS)} = ${R.powE}<br>${lockLine2(k, lit)}`;
  const unlockHtml = (k) =>
    `${col("blue", String(R.C))}${sup(SUM_FS, col("purple", String(R.d)))} mod ${col("blue", String(R.n))}${typedHtml(` = ${R.back}`, k)}`;

  // ---------- layout (stage px) ----------
  const SPOT_A = { x: 110, y: 190 };
  const SPOT_B = { x: 826, y: 190 };
  const WIRE = { x: 150, y: 190, w: 636, h: 90 };
  const COL = { icon: 660, tag: 804, w: 216 }; // Bob's keys, right column
  const PUB_Y = 294;
  const PRIV_Y = 398;
  const COPY = { x: 74, y: PUB_Y }; // where Alice's copy of the padlock settles (the padlock; its tag trails 108 px to the right)
  const TAG_DX = 108;
  const SUMS = { x: 444, lock: 298, unlock: 404 };
  const FLY = [
    [COL.icon, PUB_Y],
    [COL.icon, WIRE.y],
    [COPY.x, WIRE.y],
    [COPY.x, COPY.y],
  ];
  const EVE_Y = 518;
  const ROW2 = 592;
  const COPY1_X = 168; // Eve's two copies, left edges
  const COPY2_X = 337;
  const TRY = { x0: 490, dx: 116, w: 108, h: 70 };
  const CORNER = 36; // the padlock sits on the top-right corner of the message tile

  // the widths are rough (A8.textW); the picture is checked by eye. These guard against a number change crowding a row.
  const tagW = (text, fs) => A8.textW(text, fs) + 44;
  const WORKS = `${R.n} = ${R.attack.found} ${MUL} ${R.attack.other}`;
  const ZROW = `z = ${R.attack.found - 1} ${MUL} ${R.attack.other - 1} = ${R.attack.z}`;
  const GETS = `so d = ${R.d}`;
  const BIGTXT = `a real n: ${BIG.digits}+ digits`;
  const TOOMANY = "too many tries";
  A8.same("rsa lock: z = 4 x 10 = 40", [R.attack.z, (R.attack.found - 1) * (R.attack.other - 1)], [40, 40]);
  const ARROW = 46; // room for the small arrow between two pills of Eve's chain
  const WORKS_X = 104;
  const ZROW_X = WORKS_X + tagW(WORKS, 32) + ARROW;
  const GETS_X = ZROW_X + tagW(ZROW, 32) + ARROW;
  const CROSS_X = WORKS_X + tagW(BIGTXT, 32) + 40;
  const TOO_X = CROSS_X + 40;
  A8.must(COPY1_X + tagW(`(${R.n}, ${R.e})`, 32) < COPY2_X, "Eve's two copies do not touch");
  A8.must(COPY2_X + tagW(String(R.C), 32) < TRY.x0 - TRY.w / 2, "Eve's copies stay clear of her first division");
  A8.must(
    TRY.x0 + TRY.dx * (R.attack.tries.length - 1) + TRY.w / 2 + 18 <= 924,
    "Eve's divisions stay inside the stage",
  );
  A8.must(GETS_X + tagW(GETS, 32) < 924, "Eve's chain (5 x 11, z, d) fits on one line");
  A8.must(TOO_X + tagW(TOOMANY, 32) < 924, "the conclusion row (617+ digits, too many tries) fits on one line");
  A8.must(
    SUMS.x + tagW(`${R.C}${R.d} mod ${R.n} = ${R.back}`, SUM_FS) / 2 < COL.icon - 28,
    "the unlock sum stays clear of Bob's key column",
  );

  // ---------- timeline (local seconds) ----------
  const T = {
    people: 0.2,
    wireTag: 0.45,
    pub: 0.5,
    eve: 0.6,
    priv: 0.75,
    fly: [1.0, 2.4],
    eveKey: 1.8,
    msg: 3.0,
    lockSum: 3.3,
    lockType: [3.55, 4.05],
    useFlash: [3.35, 3.75],
    flip1: [4.2, 4.4],
    snap: [4.35, 4.6],
    travel: [4.7, 5.5],
    eve13: 5.1,
    unlockSum: 5.8,
    keyFlash: [5.9, 6.3],
    unlockType: [6.05, 6.3],
    open: [6.3, 6.75],
    flip2: 6.75,
    lockOut: [6.8, 7.1],
    stuck: 5.9, // Eve's question mark: she cannot unlock 13 without 27
    stuckOut: [7.5, 7.7],
    tries: 7.7, // + 0.3 i
    triesFail: 0.22,
    found: 8.85,
    zrow: 9.25,
    key: 9.65,
    keyFlash2: [9.65, 10.05],
    chainOut: [10.65, 11.0],
    keyBack: 10.8,
    big: 11.15,
    cross: 11.4,
    toomany: 11.6,
  };
  const pop = (t, a, d = 0.35) => ramp(t, a, a + d, lin);
  const bump = (t, a, b, amount = 0.08) => 1 + amount * flash(t, a, b);

  V.scene({
    kicker: "RSA",
    title: ["Anyone can lock it,", "only Bob can unlock"],
    dur: 13.4,
    caps: [
      [1.0, 3.0, `Bob shares his public key, (${R.n}, ${R.e}).`],
      [3.4, 5.6, `Alice locks ${R.M} with it and gets ${R.C}.`],
      [5.8, 7.6, `Bob unlocks ${R.C} with his private key: back to ${R.back}.`],
      [7.8, 9.5, `Eve factors the tiny n in four tries: ${R.attack.found} ${MUL} ${R.attack.other}.`],
      [9.6, 11.0, `Then z = ${R.attack.z} and d = ${R.attack.d}: she has the key.`],
      [11.2, 13.1, `A real n has ${BIG.digits}+ digits: nobody can factor that.`],
    ],
    build(stage) {
      // ---- the people and the open wire ----
      const alice = A8.person(stage, { who: "alice", x: 52, y: 50 });
      const bob = A8.person(stage, { who: "bob", x: 884, y: 50, name: "left" });
      const pipe = A8.wire(stage, WIRE);
      const pipeTag = A8.tag(stage, { x: 468, y: 112, text: "the open wire", tone: "grey", fs: 28 });

      // ---- Bob's key pair (scene 5): a padlock anyone can snap shut, and the one key that opens it ----
      const pubIcon = A8.icon(stage, "lock", { x: COL.icon, y: PUB_Y, tone: "blue", size: 56 });
      const pubTag = A8.tag(stage, {
        x: COL.tag,
        y: PUB_Y,
        html: label("public key", `(${R.n}, ${R.e})`),
        tone: "blue",
        box: true,
        w: COL.w,
        fs: 32,
      });
      const privIcon = A8.icon(stage, "key", { x: COL.icon, y: PRIV_Y, tone: "purple", size: 64 });
      const privTag = A8.tag(stage, {
        x: COL.tag,
        y: PRIV_Y,
        html: label("private key", String(R.d)),
        tone: "purple",
        box: true,
        w: COL.w,
        fs: 32,
      });

      // ---- the copy of the padlock that travels to Alice (and stays with her) ----
      const flyIcon = A8.icon(stage, "lock", { x: COL.icon, y: PUB_Y, tone: "blue", size: 56 });
      const flyTag = A8.tag(stage, {
        x: COL.icon + TAG_DX,
        y: PUB_Y,
        text: `(${R.n}, ${R.e})`,
        tone: "blue",
        solid: true,
        fs: 32,
      });

      // ---- Alice's message: 7, locked into 13, travels the wire; Bob unlocks it back into 7 ----
      const tile = (text, tone, solid, at) => {
        const t = A8.tag(stage, { x: at.x, y: at.y, text, tone, solid, fs: 48, box: true, w: 80, h: 80 });
        t.el.style.padding = "0";
        return t;
      };
      const msg = tile(String(R.M), "grey", false, SPOT_A);
      const sealed = tile(String(R.C), "blue", true, SPOT_A);
      const back = tile(String(R.back), "green", true, SPOT_B);
      const padlock = A8.icon(stage, "lock", {
        x: SPOT_A.x + CORNER,
        y: SPOT_A.y - CORNER,
        tone: "blue",
        size: 48,
        disc: true,
      });

      // ---- the two sums ----
      const lockSum = A8.tag(stage, {
        x: SUMS.x,
        y: SUMS.lock,
        html: lockHtml(0, false),
        tone: "blue",
        fs: SUM_FS,
        box: true,
      });
      const unlockSum = A8.tag(stage, {
        x: SUMS.x,
        y: SUMS.unlock,
        html: unlockHtml(0),
        tone: "green",
        fs: SUM_FS,
        box: true,
      });

      // ---- Eve: what she copies, her divisions, what she works out ----
      const eve = A8.person(stage, { who: "eve", x: 52, y: EVE_Y });
      const copy1 = A8.tag(stage, {
        x: COPY1_X,
        y: EVE_Y,
        text: `(${R.n}, ${R.e})`,
        tone: "red",
        solid: true,
        fs: 32,
        anchor: "l",
      });
      const copy2 = A8.tag(stage, {
        x: COPY2_X,
        y: EVE_Y,
        text: String(R.C),
        tone: "red",
        solid: true,
        fs: 32,
        anchor: "l",
      });
      const tries = R.attack.tries.map((f, i) => {
        const cx = TRY.x0 + TRY.dx * i;
        const tag = A8.tag(stage, {
          x: cx,
          y: EVE_Y,
          text: `${R.n} ${DIV} ${f}`,
          box: true,
          w: TRY.w,
          h: TRY.h,
          fs: 28,
          tone: "orange",
        });
        tag.el.style.padding = "0";
        const last = i === R.attack.tries.length - 1;
        const badge = A8.icon(stage, last ? "tick" : "cross", {
          x: cx + TRY.w / 2 - 12,
          y: EVE_Y - TRY.h / 2,
          size: 36,
          tone: last ? "green" : "red",
          disc: true,
        });
        return { tag, badge, last };
      });
      const stuck = A8.icon(stage, "qmark", { x: 454, y: EVE_Y, tone: "red", size: 44 });
      const works = A8.tag(stage, {
        x: WORKS_X,
        y: ROW2,
        text: WORKS,
        tone: "red",
        fs: 32,
        anchor: "l",
      });
      const zRow = A8.tag(stage, { x: ZROW_X, y: ROW2, text: ZROW, tone: "red", fs: 32, anchor: "l" });
      const getsD = A8.tag(stage, { x: GETS_X, y: ROW2, text: GETS, tone: "red", solid: true, fs: 32, anchor: "l" });
      const arrow = (x) => A8.icon(stage, "arrow", { x, y: ROW2, tone: "red", size: 32 });
      const arrows = [arrow(ZROW_X - ARROW / 2), arrow(GETS_X - ARROW / 2)];
      const big = A8.tag(stage, { x: WORKS_X, y: ROW2, text: BIGTXT, tone: "blue", solid: true, fs: 32, anchor: "l" });
      const noWay = A8.icon(stage, "cross", { x: CROSS_X, y: ROW2, tone: "red", size: 50, disc: true });
      const tooMany = A8.tag(stage, { x: TOO_X, y: ROW2, text: TOOMANY, tone: "red", fs: 32, anchor: "l" });

      return (t) => {
        // the stage
        alice.set({ k: pop(t, T.people, 0.4) });
        bob.set({ k: pop(t, T.people + 0.1, 0.4) });
        pipe.set({ k: ramp(t, 0.2, 0.9), o: ramp(t, 0.2, 0.45, lin) });
        pipeTag.set({ k: pop(t, T.wireTag, 0.3) });

        // Bob's keys; the key turns red when Eve works out d
        const keyFlash = Math.max(bump(t, ...T.keyFlash, 0.06), bump(t, ...T.keyFlash2, 0.06));
        const broken = t >= T.key && t < T.keyBack; // Eve breaks the toy key; a real n would keep it safe
        pubIcon.set({ k: pop(t, T.pub, 0.4) });
        pubTag.set({ k: pop(t, T.pub + 0.1, 0.3) });
        privIcon.set({ k: pop(t, T.priv, 0.4), tone: broken ? "red" : "purple", s: keyFlash });
        privTag.set({
          k: pop(t, T.priv + 0.1, 0.3),
          tone: broken ? "red" : "purple",
          solid: (t >= T.keyFlash[0] && t < T.keyFlash[1]) || (t >= T.keyFlash2[0] && t < T.keyFlash2[1]),
          s: keyFlash,
        });

        // a copy of the padlock and (55, 3) crosses the open wire to Alice, and stays with her
        const f = ramp(t, T.fly[0], T.fly[1], E.inOut);
        const at = A8.along(FLY, f);
        const dx = TAG_DX + 27 * (1 - ramp(f, 0, 0.15, lin)); // the tag starts over Bob's own tag, then settles behind the padlock
        const use = bump(t, ...T.useFlash);
        flyIcon.set({ k: pop(t, T.fly[0], 0.2), x: at.x, y: at.y, s: use });
        flyTag.set({ k: ramp(f, 0.1, 0.17, lin), x: at.x + dx, y: at.y, s: use }); // pops once the padlock has lifted clear of Bob's own tag

        // Alice's message: 7 -> locked into 13 -> across the wire -> unlocked back into 7
        const flip1 = ramp(t, ...T.flip1, lin);
        const travel = ramp(t, ...T.travel, E.inOut);
        const x = lerp(SPOT_A.x, SPOT_B.x, travel);
        msg.set({ k: pop(t, T.msg, 0.35), o: 1 - flip1 });
        sealed.set({ k: pop(t, T.flip1[0], 0.3), x, o: 1 - ramp(t, T.flip2, T.flip2 + 0.15, lin) });
        const shackle = t < T.open[0] ? 1 - ramp(t, ...T.snap, E.inOut) : ramp(t, ...T.open, E.inOut); // open, snaps shut, opens again
        padlock.set({
          k: pop(t, T.flip1[0] + 0.05, 0.25),
          x: x + CORNER,
          y: SPOT_A.y - CORNER - 12 * ramp(t, ...T.lockOut, lin),
          open: shackle,
          o: 1 - ramp(t, ...T.lockOut, lin),
        });
        back.set({ k: pop(t, T.flip2, 0.3) });

        // the sums
        lockSum.set({ html: lockHtml(ramp(t, ...T.lockType, lin), t >= T.lockType[1]), k: pop(t, T.lockSum, 0.3) });
        unlockSum.set({ html: unlockHtml(ramp(t, ...T.unlockType, lin)), k: pop(t, T.unlockSum, 0.3) });

        // Eve copies what crosses the wire, then tries to divide n
        eve.set({ k: pop(t, T.eve, 0.4) });
        copy1.set({ k: pop(t, T.eveKey, 0.3) });
        copy2.set({ k: pop(t, T.eve13, 0.3) });
        tries.forEach(({ tag, badge, last }, i) => {
          const start = T.tries + 0.3 * i;
          const done = t >= start + T.triesFail;
          tag.set({
            k: pop(t, start, 0.25),
            tone: !done ? "orange" : last ? "green" : "red",
            solid: done && last,
            s: last ? bump(t, start + T.triesFail, start + T.triesFail + 0.4, 0.12) : 1,
          });
          badge.set({
            k: pop(t, start + T.triesFail, 0.2),
            draw: ramp(t, start + T.triesFail, start + T.triesFail + 0.2, lin),
          });
        });
        const co = 1 - ramp(t, ...T.chainOut, lin);
        stuck.set({ k: pop(t, T.stuck, 0.3), o: 1 - ramp(t, ...T.stuckOut, lin) });
        works.set({ k: pop(t, T.found, 0.3), o: co });
        zRow.set({ k: pop(t, T.zrow, 0.3), o: co });
        getsD.set({ k: pop(t, T.key, 0.3), o: co });
        arrows[0].set({ k: pop(t, T.zrow, 0.25), draw: ramp(t, T.zrow, T.zrow + 0.25, lin), o: co });
        arrows[1].set({ k: pop(t, T.key, 0.25), draw: ramp(t, T.key, T.key + 0.25, lin), o: co });
        big.set({ k: pop(t, T.big, 0.3) });
        noWay.set({ k: pop(t, T.cross, 0.3), draw: ramp(t, T.cross, T.cross + 0.3, lin) });
        tooMany.set({ k: pop(t, T.toomany, 0.3) });
      };
    },
  });
})();
