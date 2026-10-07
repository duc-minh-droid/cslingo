/* ===== bank-x-algo-4.js ===== */
/* Revision bank, third set of varied, visual questions (algo-4).
   Workshops a8-chain, a9-mix, a10-code, a11-picker (6 each) and a8-hash, a8-keys, a9-dft, a9-fft, a10-attn (4 each).
   Every figure is drawn here from data computed by the real algorithms (toy hash, DFT, softmax); answers were checked in node. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;

  /* ---------- tiny SVG toolkit (theme variables only, so light and dark both work) ---------- */
  const KIND = {
    n: ["var(--panel-2)", "var(--line-2)", "var(--text-dim)"],
    g: ["var(--teal-dim)", "var(--teal)", "var(--teal-ink)"],
    b: ["var(--blue-dim)", "var(--blue)", "var(--blue-ink)"],
    r: ["var(--rose-dim)", "var(--rose)", "var(--rose-ink)"],
    a: ["var(--amber-dim)", "var(--amber)", "var(--amber-ink)"],
    v: ["var(--violet-dim)", "var(--violet)", "var(--violet-ink)"],
    p: ["var(--panel)", "var(--line-2)", "var(--ink)"],
  };
  const f1 = (v) => +(+v).toFixed(1);
  const tx = (x, y, s, o = {}) =>
    `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"};fill:${o.c || "var(--ink)"}">${s}</text>`;
  const lines = (x, y, arr, o = {}) => arr.map((s, i) => tx(x, y + i * (o.lh || 15), s, o)).join("");
  const rc = (x, y, w, h, k = "p", o = {}) =>
    `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${o.r ?? 8}" fill="${o.f || KIND[k][0]}" stroke="${o.st || KIND[k][1]}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const arrow = (x1, y1, x2, y2, c = "var(--text-faint)", w = 2) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 7,
      p = (t) => `${f1(x2 - h * Math.cos(a + t))},${f1(y2 - h * Math.sin(a + t))}`;
    return (
      ln(x1, y1, x2 - 3 * Math.cos(a), y2 - 3 * Math.sin(a), { c, w }) +
      `<polygon points="${f1(x2)},${f1(y2)} ${p(0.5)} ${p(-0.5)}" fill="${c}"/>`
    );
  };
  const circ = (x, y, r, k = "p", o = {}) =>
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${o.f || KIND[k][0]}" stroke="${o.st || KIND[k][1]}" stroke-width="${o.sw || 2}"/>`;
  // drawn ticks and crosses (a ✓ or ✗ typed inside SVG text would be swapped for a badge and misplaced)
  const tick = (x, y, c = "var(--teal-ink)") =>
    `<path d="M ${f1(x - 6)} ${f1(y)} l 4.5 4.5 l 8 -9" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cross = (x, y, c = "var(--rose-ink)") =>
    `<path d="M ${f1(x - 5)} ${f1(y - 5)} l 10 10 M ${f1(x + 5)} ${f1(y - 5)} l -10 10" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const svg = (w, h, body, label) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;height:auto;display:block;max-width:${Math.min(Math.round(w * 1.45), 560)}px;margin:0 auto">${body}</svg>`;
  const tint = (c, p) => `color-mix(in srgb, ${c} ${p}%, var(--panel))`;
  const TAU = 2 * Math.PI;

  /* ---------- real algorithms used to draw the figures ---------- */
  const djb2 = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const fmix = (h) => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  };
  const scrambled = (s) =>
    fmix(parseInt(djb2(s), 16))
      .toString(16)
      .padStart(8, "0");
  const zeros = (h) => {
    let k = 0;
    while (k < h.length && h[k] === "0") k++;
    return k;
  };
  const blockHash = (b) => scrambled(`${b.nonce}|${b.i}|${b.data}|${b.prev}`);
  const mineBlock = (b, need) => {
    b.nonce = 0;
    while (zeros(blockHash(b)) < need) b.nonce++;
  };
  const dftAmps = (x) => {
    const n = x.length,
      a = [];
    for (let k = 0; k <= n / 2; k++) {
      let re = 0,
        im = 0;
      for (let t = 0; t < n; t++) {
        const q = (-TAU * k * t) / n;
        re += x[t] * Math.cos(q);
        im += x[t] * Math.sin(q);
      }
      a.push(((k === 0 || k === n / 2 ? 1 : 2) * Math.hypot(re, im)) / n);
    }
    return a;
  };
  const softmax = (s) => {
    const m = Math.max(...s),
      e = s.map((v) => Math.exp(v - m)),
      t = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / t);
  };

  /* ================================================================== a8-hash ================================================================== */

  // H1: which hex digits move when only the nonce changes (a toy hash whose leading digits are frozen)
  function figHexFrozen() {
    const rows = [0, 1, 2, 3, 4, 5].map((n) => [n, djb2(`alice pays bob 5|nonce=${n}`)]);
    const cw = 28,
      x0 = 98,
      y0 = 52,
      rh = 26;
    let s = tx(8, 16, "Toy hash of “alice pays bob 5|nonce=N”", { a: "start", s: 12, c: "var(--text-dim)" });
    for (let c = 0; c < 8; c++) s += tx(x0 + c * cw + cw / 2, y0 - 7, c + 1, { s: 11, c: "var(--text-faint)" });
    s += tx(8, y0 - 7, "hex digit", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach(([n, h], r) => {
      const y = y0 + r * rh;
      s += tx(8, y + 17, `nonce ${n}`, { a: "start", s: 12, c: "var(--text-dim)" });
      [...h].forEach((d, c) => {
        s +=
          rc(x0 + c * cw + 1, y + 1, cw - 2, rh - 3, c === 7 ? "a" : "n", { r: 5, sw: 1.5 }) +
          tx(x0 + c * cw + cw / 2, y + 17, d, { m: 1, s: 13, c: c === 7 ? "var(--amber-ink)" : "var(--text-dim)" });
      });
    });
    return svg(330, y0 + rows.length * rh + 6, s, "Six toy hashes for nonces 0 to 5: only the last hex digit changes");
  }

  // H3: a mining log with one wrong verdict
  function figMiningLog() {
    const need = "00",
      H = (n) => scrambled(`${n}|2|bob pays carol 2|6b17ac04`);
    const rows = [26, 27, 28, 29, 37].map((n) => [n, H(n), n === 28 || n === 37]);
    let s = tx(
      8,
      17,
      `A script accepts a hash only if it starts with <tspan style="fill:var(--teal-ink)">${need}</tspan>`,
      { a: "start", s: 13 },
    );
    s +=
      tx(14, 44, "nonce", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(100, 44, "hash", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(250, 44, "script says", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach(([n, h, ok], i) => {
      const y = 52 + i * 38;
      s += pk(
        `n${n}`,
        rc(6, y, 328, 32, "p", { r: 8 }) +
          tx(16, y + 21, n, { a: "start", s: 14, c: "var(--text-dim)" }) +
          tx(100, y + 21, h, { a: "start", s: 15, m: 1 }) +
          rc(240, y + 5, 88, 22, ok ? "g" : "r", { r: 11, sw: 1.5 }) +
          (ok ? tick(258, y + 14) : cross(258, y + 16)) +
          tx(296, y + 21, ok ? "sealed" : "not yet", { s: 12, c: ok ? "var(--teal-ink)" : "var(--rose-ink)" }),
      );
    });
    return svg(
      340,
      52 + rows.length * 38 + 2,
      s,
      "Mining log with five nonces, their hashes and the script's verdicts",
    );
  }

  // H4: checksum on the same server as the file
  function figChecksumPipes() {
    const lane = (y, title, file, dig, kind) =>
      tx(8, y, title, { a: "start", s: 12, c: "var(--text-dim)" }) +
      rc(8, y + 8, 100, 28, kind) +
      tx(58, y + 27, file, { s: 12, m: 1 }) +
      rc(8, y + 42, 100, 28, kind) +
      tx(58, y + 61, dig, { s: 12, m: 1 }) +
      arrow(112, y + 39, 134, y + 39) +
      rc(138, y + 8, 100, 62, "p") +
      lines(188, y + 33, ["your PC hashes", "the file, compares"], { s: 12 }) +
      arrow(242, y + 39, 264, y + 39) +
      rc(268, y + 20, 66, 38, "a") +
      tx(301, y + 37, "match", { s: 12, c: "var(--amber-ink)" }) +
      tick(301, y + 46, "var(--amber-ink)");
    const s =
      lane(18, "Honest server", "setup.zip", "digest 9f2c…", "n") +
      lane(112, "After the break-in", "evil.zip", "digest 41ab…", "r");
    return svg(
      340,
      196,
      s,
      "Two pipelines: an honest download and one where the attacker replaced both the file and its checksum, both ending in a match",
    );
  }

  B.add("a8-hash", [
    {
      type: "mcq",
      q: "A miner tries nonces for the toy hash below. The nonce is the last thing in the text. Why would this hash make a poor puzzle for “start with zeros”?",
      fig: figHexFrozen(),
      o: [
        "The leading digits stay the same for every nonce, so no amount of guessing can change them",
        "The last digit climbs by one each time, which lets a miner win far too easily at any difficulty",
        "Eight hex digits is too short to carry a nonce, so the same hashes would repeat after eight tries",
        "A hash written in hexadecimal can never start with a zero digit, so the puzzle has no winners",
      ],
      a: 0,
      why: "A good hash is unpredictable: change the nonce and every digit scrambles. Here only the last digit moves, because the nonce only reaches the low end of this toy hash. The first digits are frozen, so guessing can never create a leading zero (or, if they happened to be zero, would always have it). That is why the workshop scrambles the hash once more.",
    },
    {
      type: "cat",
      q: "A chain is mined at some difficulty (number of leading hex zeros). Raise that difficulty by one zero. Sort each cost by what happens to it.",
      buckets: ["Grows with difficulty", "Doesn't depend on it"],
      items: [
        ["Expected tries to mine one block", 0],
        ["Hashes a node computes to check one block's seal", 1],
        ["Length of the hash stored in each block", 1],
        ["Expected work to re-mine blocks 2 to 5 after an edit", 0],
        ["Hashes needed to verify a 100-block chain", 1],
        ["Time an attacker needs to catch up with honest miners", 0],
      ],
      why: "Difficulty only changes how many guesses a winning nonce needs (16× more per extra zero), so everything that involves searching grows. Checking is one hash per block however hard the puzzle was, and the digest length is fixed. Verifying 100 blocks costs 100 hashes at any difficulty, which grows with the chain's length, not its difficulty.",
    },
    {
      type: "pick",
      q: "A reviewer is checking a mining script's log. The target is a hash starting with two zeros, <b>00</b>. One verdict in the log is wrong. Tap that row.",
      fig: figMiningLog(),
      a: "n28",
      why: "Nonce 28 gives <code>0b0553aa</code>, which has only one leading zero, so it does not meet 00 and the script should say “not yet”. Nonce 27's hash ends in zero-ish digits and nonce 37's <code>00e9d55e</code> is a true win: only zeros at the very start count.",
    },
    {
      type: "mcq",
      q: "A download page shows a file and its checksum (a hash of the file) side by side on the same server. An attacker breaks into that server. Why does the checksum not protect you?",
      fig: figChecksumPipes(),
      o: [
        "The attacker can swap the file and its checksum together, so your PC still sees a match",
        "Hashes can be run backwards, so the attacker can rebuild the original file from its checksum",
        "A checksum only covers the first few bytes of a file, so later tampering would go unnoticed",
        "Your PC computes a different hash every time it runs, so a match would never be possible",
      ],
      a: 0,
      why: "A hash only shows that two things agree, and the attacker controls both. To trust it, the checksum has to come from somewhere the attacker cannot change (a different site, or a signed message). This is the same reason a hash chain needs its seals and a signature: a fingerprint on its own is not a promise.",
    },
  ]);

  /* ================================================================== a8-keys ================================================================== */

  // K1: rings of the values g^a mod 17
  function figRings() {
    const ring = (cx, cy, g, title, sub) => {
      const reach = new Set();
      let v = 1;
      for (let a = 1; a <= 16; a++) {
        v = (v * g) % 17;
        reach.add(v);
      }
      let s = tx(cx, 20, title, { s: 14 }) + tx(cx, 36, sub, { s: 12, c: "var(--text-dim)" });
      const R = 56;
      for (let k = 1; k <= 16; k++) {
        const ang = ((k - 1) / 16) * TAU - Math.PI / 2,
          x = cx + R * Math.cos(ang),
          y = cy + R * Math.sin(ang),
          on = reach.has(k);
        s += circ(x, y, on ? 6.5 : 4, on ? "g" : "n", { f: on ? "var(--teal)" : "var(--panel)", sw: 1.5 });
        if (on && g === 4)
          s += tx(cx + (R + 17) * Math.cos(ang), cy + (R + 17) * Math.sin(ang) + 4, k, { s: 12, c: "var(--teal-ink)" });
      }
      return s;
    };
    const s =
      ring(88, 118, 3, "g = 3", "reaches 16 values") +
      ring(252, 118, 4, "g = 4", "reaches only 4 values") +
      tx(88, 208, "3, 9, 10, 13, 5, 15, 11, 16 …", { s: 12, c: "var(--text-dim)" }) +
      tx(88, 224, "no repeat for 16 steps", { s: 12, c: "var(--text-dim)" }) +
      tx(252, 208, "4, 16, 13, 1, 4, 16, 13, 1 …", { s: 12, c: "var(--text-dim)" }) +
      tx(252, 224, "repeats every 4 steps", { s: 12, c: "var(--text-dim)" });
    return svg(
      340,
      234,
      s,
      "Two rings of 16 positions: the powers of 3 mod 17 land on all 16, the powers of 4 land on only four",
    );
  }

  // K2: signing and checking, who can do what
  function figSignPipe() {
    let s = tx(8, 14, "Alice signs", { a: "start", s: 12, c: "var(--text-dim)" });
    s += pk("s1", rc(8, 22, 150, 48, "p") + lines(83, 42, ["1  Hash the", "contract"], { s: 12 }));
    s += arrow(160, 46, 182, 46);
    s += pk(
      "s2",
      rc(184, 22, 150, 48, "p") + lines(259, 38, ["2  Lock the hash with", "Alice's PRIVATE key"], { s: 12 }),
    );
    s +=
      arrow(259, 72, 259, 100, "var(--text-faint)") +
      tx(250, 94, "contract + signature travel to Bob", { a: "end", s: 11, c: "var(--text-dim)" });
    s += tx(8, 120, "Bob checks (Eve can copy all of this)", { a: "start", s: 12, c: "var(--text-dim)" });
    s += pk("s3", rc(8, 128, 100, 56, "p") + lines(58, 148, ["3  Hash the", "contract he got"], { s: 12 }));
    s += arrow(110, 156, 124, 156);
    s += pk(
      "s4",
      rc(126, 128, 108, 56, "p") +
        lines(180, 148, ["4  Unlock the sig", "with Alice's", "PUBLIC key"], { s: 11, lh: 13 }),
    );
    s += arrow(236, 156, 250, 156);
    s += pk("s5", rc(252, 128, 82, 56, "p") + lines(293, 148, ["5  Compare", "the two"], { s: 12 }));
    return svg(
      342,
      194,
      s,
      "Five steps: Alice hashes then locks with her private key; Bob hashes, unlocks with her public key and compares",
    );
  }

  // K3: Venn of public-channel set-up and bulk speed
  function figVenn() {
    let s = `<circle cx="120" cy="150" r="100" fill="var(--blue)" fill-opacity=".14" stroke="var(--blue)" stroke-width="2.5"/><circle cx="230" cy="150" r="100" fill="var(--amber)" fill-opacity=".14" stroke="var(--amber)" stroke-width="2.5"/>`;
    s +=
      lines(8, 14, ["Can set up a secret", "over a public channel"], { a: "start", s: 12, c: "var(--blue-ink)" }) +
      lines(342, 14, ["Fast enough for", "bulk data"], { a: "end", s: 12, c: "var(--amber-ink)" });
    s +=
      tx(74, 144, "RSA", { s: 15 }) +
      tx(74, 168, "Diffie–Hellman", { s: 12 }) +
      tx(282, 146, "AES", { s: 15 }) +
      tx(282, 164, "(shared key)", { s: 11, c: "var(--text-dim)" });
    s +=
      `<ellipse cx="175" cy="150" rx="30" ry="46" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-dasharray="5 4"/>` +
      tx(175, 157, "?", { s: 20, c: "var(--text-faint)" });
    return svg(
      350,
      256,
      s,
      "Venn diagram: RSA and Diffie-Hellman sit in the public-channel circle, AES in the bulk-data circle, and the overlap is empty",
    );
  }

  // K4: a tree of certificates
  function figCertTree() {
    let s =
      rc(95, 8, 150, 42, "g") +
      lines(170, 26, ["Root CA", "built into the browser"], { s: 12, c: "var(--teal-ink)", lh: 14 });
    s +=
      ln(170, 50, 85, 80, { c: "var(--teal)", w: 3 }) +
      tx(106, 72, "signed", { s: 11, c: "var(--text-dim)", a: "end" });
    s += rc(15, 80, 140, 40, "p") + lines(85, 97, ["Intermediate CA", "(signed by Root)"], { s: 12, lh: 14 });
    s +=
      rc(185, 80, 140, 40, "n", { d: "5 4" }) +
      lines(255, 97, ["FreeCert Ltd", "(not in the browser's list)"], { s: 11, lh: 14, c: "var(--text-dim)" });
    s +=
      ln(85, 120, 85, 150, { c: "var(--teal)", w: 3 }) + ln(255, 120, 255, 150, { c: "var(--line-2)", w: 3, d: "5 4" });
    s += pk(
      "A",
      rc(15, 150, 140, 46, "p") + lines(85, 168, ["shop.example", "signed by Intermediate"], { s: 12, lh: 14 }),
    );
    s += pk(
      "B",
      rc(185, 150, 140, 46, "p") + lines(255, 168, ["shop.example", "signed by FreeCert"], { s: 12, lh: 14 }),
    );
    s += pk("C", rc(100, 226, 140, 46, "p") + lines(170, 244, ["shop.example", "signed by itself"], { s: 12, lh: 14 }));
    return svg(
      340,
      280,
      s,
      "Certificate tree: Root CA signs an Intermediate CA which signs one shop.example certificate; a second comes from an unknown FreeCert; a third signs itself",
    );
  }
  Object.assign(partScope, {
    TAU,
    arrow,
    blockHash,
    circ,
    cross,
    dftAmps,
    f1,
    figCertTree,
    figRings,
    figSignPipe,
    figVenn,
    lines,
    ln,
    mineBlock,
    pk,
    rc,
    scrambled,
    softmax,
    svg,
    tick,
    tint,
    tx,
    zeros,
  });
})();
