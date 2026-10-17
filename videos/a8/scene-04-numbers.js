/* Phase 8 · Cryptography & Blockchain (algo-8), scene 04: "The same trick with numbers" (15 s).
   Diffie-Hellman with the lesson's numbers (A8.DH, common.js): public p = 23 and g = 5, secrets a = 6 and b = 15. Alice works out
   A = 5^6 mod 23 = 8 (the panel defines "mod": 15625 = 679 x 23 + 8, the remainder is 8), Bob works out B = 19; they swap A and
   B along the open wire; each raises what they received to their own secret and both land on 2. The second half is Eve's: she
   knows p, g, A and B and wants a, so she hunts through 5^x mod 23 until it equals 8 (six tries); a real p has 617 digits.
   Colours: blue = public (p, g, A, B and the base of each sum), purple = secret (a, b and the exponent of each sum, with locks),
   green = agreed (the result 2, the hit), orange = what is being worked out, red = Eve.
   Timeline (local seconds): 0.2 Alice, Bob, the pipe; 0.45 p, 0.65 g, 0.85 a, 1.05 b (with locks); 2.8 the working-out panel pops and
   types out (3.0-3.8); 3.9 "mod 23" tag and the remainder lights up; 5.5 A = 8 and 5.7 B = 19 pop at their ends; 5.9-6.1 panel and tag
   fade; 6.2-7.4 the swap; 7.5 the received number and the secret flash; 7.6 / 7.8 the green sums; 8.6 the equals disc; 9.2-9.8 the
   locks pulse (the secrets never moved); 9.5 the purple key icon and "shared key = 2" (the answer to scene 2's question); 10.6-10.95
   all of it fades; 10.95 Eve and what she knows; 11.45 the question; 11.65-13.0 the six tries; 13.25 the last one is the hit: it turns
   red (Eve's colour) and her dashed "a = ?" becomes a solid red "a = 6" (the toy secret leaks); 13.4 "6 tries"; 13.5 the long number,
   13.65 "617 digits long", 14.2 "no computer can search that" (green: safe).
   The paint colours of scene 3 are carried over as small dots: gold beside g, rose beside a, blue beside b, and A = 8 / B = 19 wear the
   orange / green mixture dots (literal paint colours, the same documented exception as scene 3).
   Every number comes from A8.DH / A8.BIG and is asserted below; the captions are built from the same numbers. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, flash, ease: E } = V;
  const lin = E.lin;
  const D = A8.DH;
  const P = A8.PAINT;
  const BIG = A8.BIG;

  // ---------- the model: every number comes from the helper, and is checked here against plain BigInt sums ----------
  const mp = (b, e, m) => Number(BigInt(b) ** BigInt(e) % BigInt(m));
  A8.same("numbers: public and secret", [D.p, D.g, D.a, D.b], [23, 5, 6, 15]);
  A8.same("numbers: A and B", [mp(D.g, D.a, D.p), mp(D.g, D.b, D.p), D.A, D.B], [8, 19, 8, 19]);
  A8.same(
    "numbers: both end on 2",
    [mp(D.B, D.a, D.p), mp(D.A, D.b, D.p), D.aliceCalc.result, D.bobCalc.result],
    [2, 2, 2, 2],
  );
  A8.same(
    "numbers: what each raises",
    [D.aliceCalc.base, D.aliceCalc.exp, D.bobCalc.base, D.bobCalc.exp],
    [19, 6, 8, 15],
  );
  A8.same(
    "numbers: 5^6 = 679 x 23 + 8",
    [5 ** 6, D.powA, D.quot * D.p + D.rem, D.rem === D.A],
    [15625, 15625, 15625, true],
  );
  A8.same(
    "numbers: Eve's table",
    D.search.map((s) => [s.x, s.y, mp(D.g, s.x, D.p)]),
    [1, 2, 3, 4, 5, 6].map((x, i) => [x, [5, 2, 10, 4, 20, 8][i], [5, 2, 10, 4, 20, 8][i]]),
  );
  A8.same(
    "numbers: she hits A on the sixth try and not before",
    [D.tries, D.search.slice(0, -1).some((s) => s.y === D.A)],
    [6, false],
  );
  A8.same("numbers: a number the size of a real prime", [BIG.digits, BIG.lead], [617, "3231700607131100"]);
  A8.same("numbers: Eve's hit gives her a", [D.search[D.search.length - 1].x, D.a], [6, 6]);

  // ---------- small html helpers (colour roles inside a sum: base = public blue, exponent = secret purple) ----------
  const INK = { blue: "var(--blue-ink)", purple: "var(--violet-ink)" };
  const col = (tone, s) => `<span style="color:${INK[tone]}">${A8.esc(s)}</span>`;
  const sup = (fs, inner) =>
    `<span style="font-size:${Math.max(28, Math.round(fs * 0.64))}px;vertical-align:${Math.round(fs * 0.42)}px;line-height:0;margin:0 0.12em 0 0.03em">${inner}</span>`;
  const cpow = (base, exp, fs, bt, et) =>
    `${bt ? col(bt, base) : A8.esc(base)}${sup(fs, et ? col(et, exp) : A8.esc(exp))}`;
  const MUL = "×";
  /* a small paint dot (the colours of scene 3) to put before a number: the same average-of-paints colour as the pots */
  const dot = (drops) => {
    const c = A8.paintRgb(drops);
    return `<span style="display:inline-block;width:26px;height:26px;border-radius:50%;box-sizing:border-box;background:${c.fill};border:3px solid ${c.edge};margin-right:12px;vertical-align:-1px"></span>`;
  };

  /* the working-out line as typed segments: what has been typed shows, the rest keeps its room (hidden) so the panel never resizes */
  const WORK = [
    { t: ` = ${D.powA} = ${D.quot} ${MUL} `, c: null },
    { t: String(D.p), c: "blue" },
    { t: " + ", c: null },
    { t: String(D.rem), c: "hl" },
  ];
  const WORK_ALL = WORK.map((s) => s.t).join("");
  const seg = (s, shown, lit) => {
    const style =
      s.c === "hl"
        ? `border-radius:12px;padding:0 10px;margin:0 -4px;${lit ? "background:var(--amber);color:var(--amber-on)" : ""}`
        : "";
    const inner = s.c === "blue" ? col("blue", shown) : A8.esc(shown);
    return `<span style="${style}">${inner}</span>`;
  };
  const working = (k, lit) => {
    let left = V.type(WORK_ALL, k).length;
    const head = cpow(D.g, D.a, 40, "blue", "purple");
    return (
      head +
      WORK.map((s) => {
        const n = Math.max(0, Math.min(s.t.length, left));
        left -= s.t.length;
        return seg(s, s.t.slice(0, n), lit) + `<span style="visibility:hidden">${A8.esc(s.t.slice(n))}</span>`;
      }).join("")
    );
  };

  // ---------- layout (stage px) ----------
  const SPOT_A = { x: 118, y: 190 };
  const SPOT_B = { x: 818, y: 190 };
  const WIRE = { x: 150, y: 190, w: 636, h: 120 };
  const SECRET_A = { x: 150, y: 430, lock: 38 };
  const SECRET_B = { x: 774, y: 430, lock: 898 };
  const RES_A = { x: 190, y: 330 };
  const RES_B = { x: 746, y: 330 };
  const PANEL = { x: 330, y: 520 }; // under Alice's secret a = 6: it is her working
  const TAG_MOD = { x: 330, y: 592 };
  const KEY_AT = { x: 468, y: 425 }; // "shared key = 2", centred under the equals sign
  const SIDES = 44; // how far the two numbers arc apart while they swap (wide enough that they never touch)
  const TRIES = { x0: 178, dx: 116, y: 280 };

  // Eve's second half: what she knows (p, g, A, B) and what she wants (a), laid out from the left with equal gaps. The widths are
  // rough (A8.textW); the picture is checked by eye.
  const KNOWN = (() => {
    const items = [`p = ${D.p}`, `g = ${D.g}`, `A = ${D.A}`, `B = ${D.B}`, "a = ?"];
    let x = 214;
    return items.map((text, i) => {
      const w = A8.textW(text, 32) + 44;
      if (i === items.length - 1) x += 14; // a little more air before the unknown
      const at = { text, x: x + w / 2 };
      x += w + 12;
      return at;
    });
  })();

  // ---------- timeline (local seconds) ----------
  const T = {
    people: 0.2,
    p: 0.45,
    g: 0.65,
    a: 0.85,
    b: 1.05,
    panel: 2.8,
    type: [3.0, 3.8],
    tagMod: 3.9,
    spotA: 5.5,
    spotB: 5.7,
    panelOut: [5.9, 6.1],
    swap: [6.2, 7.4],
    flashA: [7.4, 7.9],
    flashB: [7.6, 8.1],
    resA: 7.6,
    resB: 7.8,
    equals: 8.6,
    key: 9.5,
    locks: [9.9, 10.5],
    out1: [10.6, 10.95],
    eve: 10.95,
    known: 11.07, // + 0.07 i; the ghost "a = ?" follows
    question: 11.45,
    tries: 11.65, // + 0.27 i
    green: 13.25,
    count: 13.4,
    big: 13.5,
    digits: 13.65,
    red: 14.2,
  };

  V.scene({
    kicker: "DIFFIE-HELLMAN KEY EXCHANGE",
    title: ["The same trick", "with numbers"],
    dur: 15.65,
    caps: [
      [1.25, 3.5, `Like the paint: public p = ${D.p} and g = ${D.g}, secret a = ${D.a} and b = ${D.b}.`],
      [3.9, 6.0, `mod ${D.p} keeps only the remainder after dividing by ${D.p}.`],
      [6.2, 7.9, `They swap A = ${D.A} and B = ${D.B} in public.`],
      [8.0, 9.4, "Each raises what they received to their own secret."],
      [9.5, 10.9, `Both get ${D.shared}: a shared key that was never sent.`],
      [11.65, 13.45, `Eve must try every power of ${D.g} until she hits ${D.A}: that finds a.`],
      [13.7, 15.4, `With a ${BIG.digits}-digit prime that search is hopeless.`],
    ],
    build(stage) {
      // ---- first half: the exchange ----
      const alice = A8.person(stage, { who: "alice", x: 52, y: 50 });
      const bob = A8.person(stage, { who: "bob", x: 884, y: 50, name: "left" });
      const pipe = A8.wire(stage, WIRE);
      const pTag = A8.tag(stage, { x: 376, y: 62, text: `p = ${D.p}`, tone: "blue", fs: 36 });
      const gTag = A8.tag(stage, { x: 552, y: 62, html: `${dot(["P"])}g = ${D.g}`, tone: "blue", fs: 36 });
      const aTag = A8.tag(stage, {
        x: SECRET_A.x,
        y: SECRET_A.y,
        html: `${dot(["A"])}a = ${D.a}`,
        tone: "purple",
        fs: 36,
      });
      const bTag = A8.tag(stage, {
        x: SECRET_B.x,
        y: SECRET_B.y,
        html: `${dot(["B"])}b = ${D.b}`,
        tone: "purple",
        fs: 36,
      });
      const aLock = A8.icon(stage, "lock", { x: SECRET_A.lock, y: SECRET_A.y, tone: "purple", size: 50 });
      const bLock = A8.icon(stage, "lock", { x: SECRET_B.lock, y: SECRET_B.y, tone: "purple", size: 50 });

      const panel = A8.tag(stage, {
        x: PANEL.x,
        y: PANEL.y,
        html: working(0, false),
        tone: "orange",
        fs: 40,
        box: true,
      });
      const tagMod = A8.tag(stage, {
        x: TAG_MOD.x,
        y: TAG_MOD.y,
        html: `${cpow(D.g, D.a, 32)} mod ${D.p} = the remainder ${D.rem}`,
        tone: "orange",
        solid: true,
        fs: 32,
      });

      const numA = A8.tag(stage, {
        x: SPOT_A.x,
        y: SPOT_A.y,
        html: `${dot(P.mixA)}A = ${D.A}`,
        tone: "blue",
        solid: true,
        fs: 40,
      });
      const numB = A8.tag(stage, {
        x: SPOT_B.x,
        y: SPOT_B.y,
        html: `${dot(P.mixB)}B = ${D.B}`,
        tone: "blue",
        solid: true,
        fs: 40,
      });
      const fromA = A8.tag(stage, {
        x: SPOT_A.x,
        y: 282,
        html: `${cpow(D.g, D.a, 28, null, "purple")} mod ${D.p}`,
        tone: "grey",
      });
      const fromB = A8.tag(stage, {
        x: SPOT_B.x,
        y: 282,
        html: `${cpow(D.g, D.b, 28, null, "purple")} mod ${D.p}`,
        tone: "grey",
      });

      const sum = (c) => `${cpow(c.base, c.exp, 40, "blue", "purple")} mod ${D.p} = ${c.result}`;
      const resA = A8.tag(stage, { x: RES_A.x, y: RES_A.y, html: sum(D.aliceCalc), tone: "green", fs: 40, box: true });
      const resB = A8.tag(stage, { x: RES_B.x, y: RES_B.y, html: sum(D.bobCalc), tone: "green", fs: 40, box: true });
      const equals = A8.icon(stage, "equals", { x: 468, y: RES_A.y, tone: "green", disc: true, size: 64 });

      // ---- second half: Eve's hunt ----
      const eve = A8.person(stage, { who: "eve", x: 52, y: 50 });
      const known = KNOWN.slice(0, 4).map((k) => A8.tag(stage, { x: k.x, y: 50, text: k.text, tone: "blue", fs: 32 }));
      const ghost = A8.tag(stage, { x: KNOWN[4].x, y: 50, text: KNOWN[4].text, tone: "purple", ghost: true, fs: 32 });
      const question = A8.tag(stage, {
        x: 468,
        y: 150,
        html: `${col("blue", String(D.g))}${sup(40, col("purple", "x"))} mod ${col("blue", String(D.p))} = ${col("blue", String(D.A))}, so ${col("purple", "x")} = ?`,
        tone: "orange",
        fs: 40,
        box: true,
      });
      const tries = D.search.map((s, i) =>
        A8.tag(stage, {
          x: TRIES.x0 + TRIES.dx * i,
          y: TRIES.y,
          html: `x = ${s.x}<br><span style="font-size:40px">${s.y}</span>`,
          box: true,
          w: 104,
          h: 96,
          fs: 28,
          tone: "orange",
        }),
      );
      const count = A8.tag(stage, { x: 468, y: 375, text: `${D.tries} tries`, tone: "green", solid: true, fs: 36 });
      const big = A8.tag(stage, { x: 468, y: 460, text: `${BIG.lead} ...`, tone: "blue", mono: true, fs: 36 });
      const digits = A8.tag(stage, {
        x: 468,
        y: 530,
        text: `a real prime p: ${BIG.digits} digits`,
        tone: "blue",
        solid: true,
        fs: 32,
      });
      const red = A8.tag(stage, { x: 468, y: 594, text: "no computer can search that", tone: "red", fs: 32 });

      return (t) => {
        const pop = (a, d = 0.3) => ramp(t, a, a + d, lin);
        const out1 = 1 - ramp(t, T.out1[0], T.out1[1], lin);
        const panelO = 1 - ramp(t, T.panelOut[0], T.panelOut[1], lin);

        // the stage and the numbers that start the exchange
        alice.set({ k: pop(T.people, 0.4), o: out1 });
        bob.set({ k: pop(T.people + 0.1, 0.4), o: out1 });
        pipe.set({ k: ramp(t, 0.2, 0.9), o: ramp(t, 0.2, 0.45, lin) * out1 });
        pTag.set({ k: pop(T.p), o: out1 });
        gTag.set({ k: pop(T.g), o: out1 });
        const lockPulse = 1 + 0.12 * flash(t, T.locks[0], T.locks[1]);
        const bump = (a, b) => 1 + 0.08 * flash(t, a, b);
        aTag.set({ k: pop(T.a), o: out1, s: bump(...T.flashA) });
        aLock.set({ k: pop(T.a + 0.08), o: out1, s: lockPulse });
        bTag.set({ k: pop(T.b), o: out1, s: bump(...T.flashB) });
        bLock.set({ k: pop(T.b + 0.08), o: out1, s: lockPulse });

        // the working-out: what "mod" means
        const typed = ramp(t, T.type[0], T.type[1], lin);
        panel.set({ html: working(typed, t >= T.tagMod), k: pop(T.panel), o: panelO * out1 });
        tagMod.set({ k: pop(T.tagMod), o: panelO * out1 });

        // the two public numbers, swapping places along the pipe (Alice's arcs up, Bob's down)
        const f = ramp(t, T.swap[0], T.swap[1], E.inOut);
        const pa = A8.arc(SPOT_A, SPOT_B, f, SIDES);
        const pb = A8.arc(SPOT_B, SPOT_A, f, -SIDES);
        numA.set({ k: pop(T.spotA), o: out1, x: pa.x, y: pa.y, s: bump(...T.flashB) });
        numB.set({ k: pop(T.spotB), o: out1, x: pb.x, y: pb.y, s: bump(...T.flashA) });
        const fromO = 1 - ramp(t, T.swap[0] - 0.12, T.swap[0] + 0.08, lin);
        fromA.set({ k: pop(T.spotA + 0.1), o: fromO * out1 });
        fromB.set({ k: pop(T.spotB + 0.1), o: fromO * out1 });
        // each end raises what it received to its own secret: the same number
        resA.set({ k: pop(T.resA, 0.5), o: out1 });
        resB.set({ k: pop(T.resB, 0.5), o: out1 });
        equals.set({ k: pop(T.equals, 0.4), o: out1 });

        // second half: Eve
        eve.set({ k: pop(T.eve, 0.4) });
        known.forEach((k, i) => k.set({ k: pop(T.known + 0.07 * i, 0.25) }));
        ghost.set({ k: pop(T.known + 0.07 * known.length, 0.25), ghost: true });
        question.set({ k: pop(T.question, 0.35) });
        tries.forEach((tag, i) => {
          const isHit = D.search[i].hit;
          const start = T.tries + 0.27 * i;
          const hitK = isHit ? ramp(t, T.green, T.green + 0.35, lin) : 0;
          tag.set({
            k: pop(start, 0.3),
            tone: hitK > 0 ? "green" : "orange",
            solid: hitK > 0,
            s: 1 + (isHit ? 0.12 * flash(t, T.green, T.green + 0.4) : 0),
          });
        });
        count.set({ k: pop(T.count, 0.3) });
        big.set({ k: pop(T.big, 0.3) });
        digits.set({ k: pop(T.digits, 0.3) });
        red.set({ k: pop(T.red, 0.3) });
      };
    },
  });
})();
