/* Revision bank, third set of varied, visual questions (algo-4).
   Workshops a8-chain, a9-mix, a10-code, a11-picker (6 each) and a8-hash, a8-keys, a9-dft, a9-fft, a10-attn (4 each).
   Every figure is drawn here from data computed by the real algorithms (toy hash, DFT, softmax); answers were checked in node. */
(function () {
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
  const tx = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"};fill:${o.c || "var(--ink)"}">${s}</text>`;
  const lines = (x, y, arr, o = {}) => arr.map((s, i) => tx(x, y + i * (o.lh || 15), s, o)).join("");
  const rc = (x, y, w, h, k = "p", o = {}) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${o.r ?? 8}" fill="${o.f || KIND[k][0]}" stroke="${o.st || KIND[k][1]}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, o = {}) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const arrow = (x1, y1, x2, y2, c = "var(--text-faint)", w = 2) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7, p = (t) => `${f1(x2 - h * Math.cos(a + t))},${f1(y2 - h * Math.sin(a + t))}`;
    return ln(x1, y1, x2 - 3 * Math.cos(a), y2 - 3 * Math.sin(a), { c, w }) + `<polygon points="${f1(x2)},${f1(y2)} ${p(0.5)} ${p(-0.5)}" fill="${c}"/>`;
  };
  const circ = (x, y, r, k = "p", o = {}) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${o.f || KIND[k][0]}" stroke="${o.st || KIND[k][1]}" stroke-width="${o.sw || 2}"/>`;
  // drawn ticks and crosses (a ✓ or ✗ typed inside SVG text would be swapped for a badge and misplaced)
  const tick = (x, y, c = "var(--teal-ink)") => `<path d="M ${f1(x - 6)} ${f1(y)} l 4.5 4.5 l 8 -9" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cross = (x, y, c = "var(--rose-ink)") => `<path d="M ${f1(x - 5)} ${f1(y - 5)} l 10 10 M ${f1(x + 5)} ${f1(y - 5)} l -10 10" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;height:auto;display:block;max-width:${Math.min(Math.round(w * 1.45), 560)}px;margin:0 auto">${body}</svg>`;
  const tint = (c, p) => `color-mix(in srgb, ${c} ${p}%, var(--panel))`;
  const TAU = 2 * Math.PI;

  /* ---------- real algorithms used to draw the figures ---------- */
  const djb2 = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0"); };
  const fmix = (h) => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; };
  const scrambled = (s) => fmix(parseInt(djb2(s), 16)).toString(16).padStart(8, "0");
  const zeros = (h) => { let k = 0; while (k < h.length && h[k] === "0") k++; return k; };
  const blockHash = (b) => scrambled(`${b.nonce}|${b.i}|${b.data}|${b.prev}`);
  const mineBlock = (b, need) => { b.nonce = 0; while (zeros(blockHash(b)) < need) b.nonce++; };
  const dftAmps = (x) => { const n = x.length, a = []; for (let k = 0; k <= n / 2; k++) { let re = 0, im = 0; for (let t = 0; t < n; t++) { const q = (-TAU * k * t) / n; re += x[t] * Math.cos(q); im += x[t] * Math.sin(q); } a.push(((k === 0 || k === n / 2 ? 1 : 2) * Math.hypot(re, im)) / n); } return a; };
  const softmax = (s) => { const m = Math.max(...s), e = s.map((v) => Math.exp(v - m)), t = e.reduce((a, b) => a + b, 0); return e.map((v) => v / t); };
  const mono = (h) => `<code>${h}</code>`;

  /* ================================================================== a8-hash ================================================================== */

  // H1: which hex digits move when only the nonce changes (a toy hash whose leading digits are frozen)
  function figHexFrozen() {
    const rows = [0, 1, 2, 3, 4, 5].map((n) => [n, djb2(`alice pays bob 5|nonce=${n}`)]);
    const cw = 28, x0 = 98, y0 = 52, rh = 26;
    let s = tx(8, 16, "Toy hash of “alice pays bob 5|nonce=N”", { a: "start", s: 12, c: "var(--text-dim)" });
    for (let c = 0; c < 8; c++) s += tx(x0 + c * cw + cw / 2, y0 - 7, c + 1, { s: 11, c: "var(--text-faint)" });
    s += tx(8, y0 - 7, "hex digit", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach(([n, h], r) => {
      const y = y0 + r * rh;
      s += tx(8, y + 17, `nonce ${n}`, { a: "start", s: 12, c: "var(--text-dim)" });
      [...h].forEach((d, c) => { s += rc(x0 + c * cw + 1, y + 1, cw - 2, rh - 3, c === 7 ? "a" : "n", { r: 5, sw: 1.5 }) + tx(x0 + c * cw + cw / 2, y + 17, d, { m: 1, s: 13, c: c === 7 ? "var(--amber-ink)" : "var(--text-dim)" }); });
    });
    return svg(330, y0 + rows.length * rh + 6, s, "Six toy hashes for nonces 0 to 5: only the last hex digit changes");
  }

  // H3: a mining log with one wrong verdict
  function figMiningLog() {
    const need = "00", H = (n) => scrambled(`${n}|2|bob pays carol 2|6b17ac04`);
    const rows = [26, 27, 28, 29, 37].map((n) => [n, H(n), n === 28 || n === 37]);
    let s = tx(8, 17, `A script accepts a hash only if it starts with <tspan style="fill:var(--teal-ink)">${need}</tspan>`, { a: "start", s: 13 });
    s += tx(14, 44, "nonce", { a: "start", s: 11, c: "var(--text-faint)" }) + tx(100, 44, "hash", { a: "start", s: 11, c: "var(--text-faint)" }) + tx(250, 44, "script says", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach(([n, h, ok], i) => {
      const y = 52 + i * 38;
      s += pk(`n${n}`, rc(6, y, 328, 32, "p", { r: 8 }) + tx(16, y + 21, n, { a: "start", s: 14, c: "var(--text-dim)" }) + tx(100, y + 21, h, { a: "start", s: 15, m: 1 }) +
        rc(240, y + 5, 88, 22, ok ? "g" : "r", { r: 11, sw: 1.5 }) + (ok ? tick(258, y + 14) : cross(258, y + 16)) + tx(296, y + 21, ok ? "sealed" : "not yet", { s: 12, c: ok ? "var(--teal-ink)" : "var(--rose-ink)" }));
    });
    return svg(340, 52 + rows.length * 38 + 2, s, "Mining log with five nonces, their hashes and the script's verdicts");
  }

  // H4: checksum on the same server as the file
  function figChecksumPipes() {
    const lane = (y, title, file, dig, kind) =>
      tx(8, y, title, { a: "start", s: 12, c: "var(--text-dim)" }) +
      rc(8, y + 8, 100, 28, kind) + tx(58, y + 27, file, { s: 12, m: 1 }) + rc(8, y + 42, 100, 28, kind) + tx(58, y + 61, dig, { s: 12, m: 1 }) +
      arrow(112, y + 39, 134, y + 39) + rc(138, y + 8, 100, 62, "p") + lines(188, y + 33, ["your PC hashes", "the file, compares"], { s: 12 }) +
      arrow(242, y + 39, 264, y + 39) + rc(268, y + 20, 66, 38, "a") + tx(301, y + 37, "match", { s: 12, c: "var(--amber-ink)" }) + tick(301, y + 46, "var(--amber-ink)");
    const s = lane(18, "Honest server", "setup.zip", "digest 9f2c…", "n") + lane(112, "After the break-in", "evil.zip", "digest 41ab…", "r");
    return svg(340, 196, s, "Two pipelines: an honest download and one where the attacker replaced both the file and its checksum, both ending in a match");
  }

  B.add("a8-hash", [
    { type: "mcq", q: "A miner tries nonces for the toy hash below. The nonce is the last thing in the text. Why would this hash make a poor puzzle for “start with zeros”?",
      fig: figHexFrozen(),
      o: ["The leading digits stay the same for every nonce, so no amount of guessing can change them",
        "The last digit climbs by one each time, which lets a miner win far too easily at any difficulty",
        "Eight hex digits is too short to carry a nonce, so the same hashes would repeat after eight tries",
        "A hash written in hexadecimal can never start with a zero digit, so the puzzle has no winners"], a: 0,
      why: "A good hash is unpredictable: change the nonce and every digit scrambles. Here only the last digit moves, because the nonce only reaches the low end of this toy hash. The first digits are frozen, so guessing can never create a leading zero (or, if they happened to be zero, would always have it). That is why the workshop scrambles the hash once more." },
    { type: "cat", q: "A chain is mined at some difficulty (number of leading hex zeros). Raise that difficulty by one zero. Sort each cost by what happens to it.",
      buckets: ["Grows with difficulty", "Doesn't depend on it"],
      items: [["Expected tries to mine one block", 0], ["Hashes a node computes to check one block's seal", 1], ["Length of the hash stored in each block", 1], ["Expected work to re-mine blocks 2 to 5 after an edit", 0], ["Hashes needed to verify a 100-block chain", 1], ["Time an attacker needs to catch up with honest miners", 0]],
      why: "Difficulty only changes how many guesses a winning nonce needs (16× more per extra zero), so everything that involves searching grows. Checking is one hash per block however hard the puzzle was, and the digest length is fixed. Verifying 100 blocks costs 100 hashes at any difficulty, which grows with the chain's length, not its difficulty." },
    { type: "pick", q: "A reviewer is checking a mining script's log. The target is a hash starting with two zeros, <b>00</b>. One verdict in the log is wrong. Tap that row.",
      fig: figMiningLog(), a: "n28",
      why: "Nonce 28 gives <code>0b0553aa</code>, which has only one leading zero, so it does not meet 00 and the script should say “not yet”. Nonce 27's hash ends in zero-ish digits and nonce 37's <code>00e9d55e</code> is a true win: only zeros at the very start count." },
    { type: "mcq", q: "A download page shows a file and its checksum (a hash of the file) side by side on the same server. An attacker breaks into that server. Why does the checksum not protect you?",
      fig: figChecksumPipes(),
      o: ["The attacker can swap the file and its checksum together, so your PC still sees a match",
        "Hashes can be run backwards, so the attacker can rebuild the original file from its checksum",
        "A checksum only covers the first few bytes of a file, so later tampering would go unnoticed",
        "Your PC computes a different hash every time it runs, so a match would never be possible"], a: 0,
      why: "A hash only shows that two things agree, and the attacker controls both. To trust it, the checksum has to come from somewhere the attacker cannot change (a different site, or a signed message). This is the same reason a hash chain needs its seals and a signature: a fingerprint on its own is not a promise." },
  ]);

  /* ================================================================== a8-keys ================================================================== */

  // K1: rings of the values g^a mod 17
  function figRings() {
    const ring = (cx, cy, g, title, sub) => {
      const reach = new Set(); let v = 1; for (let a = 1; a <= 16; a++) { v = (v * g) % 17; reach.add(v); }
      let s = tx(cx, 20, title, { s: 14 }) + tx(cx, 36, sub, { s: 12, c: "var(--text-dim)" });
      const R = 56;
      for (let k = 1; k <= 16; k++) {
        const ang = ((k - 1) / 16) * TAU - Math.PI / 2, x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang), on = reach.has(k);
        s += circ(x, y, on ? 6.5 : 4, on ? "g" : "n", { f: on ? "var(--teal)" : "var(--panel)", sw: 1.5 });
        if (on && g === 4) s += tx(cx + (R + 17) * Math.cos(ang), cy + (R + 17) * Math.sin(ang) + 4, k, { s: 12, c: "var(--teal-ink)" });
      }
      return s;
    };
    const s = ring(88, 118, 3, "g = 3", "reaches 16 values") + ring(252, 118, 4, "g = 4", "reaches only 4 values") +
      tx(88, 208, "3, 9, 10, 13, 5, 15, 11, 16 …", { s: 12, c: "var(--text-dim)" }) + tx(88, 224, "no repeat for 16 steps", { s: 12, c: "var(--text-dim)" }) +
      tx(252, 208, "4, 16, 13, 1, 4, 16, 13, 1 …", { s: 12, c: "var(--text-dim)" }) + tx(252, 224, "repeats every 4 steps", { s: 12, c: "var(--text-dim)" });
    return svg(340, 234, s, "Two rings of 16 positions: the powers of 3 mod 17 land on all 16, the powers of 4 land on only four");
  }

  // K2: signing and checking, who can do what
  function figSignPipe() {
    let s = tx(8, 14, "Alice signs", { a: "start", s: 12, c: "var(--text-dim)" });
    s += pk("s1", rc(8, 22, 150, 48, "p") + lines(83, 42, ["1  Hash the", "contract"], { s: 12 }));
    s += arrow(160, 46, 182, 46);
    s += pk("s2", rc(184, 22, 150, 48, "p") + lines(259, 38, ["2  Lock the hash with", "Alice's PRIVATE key"], { s: 12 }));
    s += arrow(259, 72, 259, 100, "var(--text-faint)") + tx(250, 94, "contract + signature travel to Bob", { a: "end", s: 11, c: "var(--text-dim)" });
    s += tx(8, 120, "Bob checks (Eve can copy all of this)", { a: "start", s: 12, c: "var(--text-dim)" });
    s += pk("s3", rc(8, 128, 100, 56, "p") + lines(58, 148, ["3  Hash the", "contract he got"], { s: 12 }));
    s += arrow(110, 156, 124, 156);
    s += pk("s4", rc(126, 128, 108, 56, "p") + lines(180, 148, ["4  Unlock the sig", "with Alice's", "PUBLIC key"], { s: 11, lh: 13 }));
    s += arrow(236, 156, 250, 156);
    s += pk("s5", rc(252, 128, 82, 56, "p") + lines(293, 148, ["5  Compare", "the two"], { s: 12 }));
    return svg(342, 194, s, "Five steps: Alice hashes then locks with her private key; Bob hashes, unlocks with her public key and compares");
  }

  // K3: Venn of public-channel set-up and bulk speed
  function figVenn() {
    let s = `<circle cx="120" cy="150" r="100" fill="var(--blue)" fill-opacity=".14" stroke="var(--blue)" stroke-width="2.5"/><circle cx="230" cy="150" r="100" fill="var(--amber)" fill-opacity=".14" stroke="var(--amber)" stroke-width="2.5"/>`;
    s += lines(8, 14, ["Can set up a secret", "over a public channel"], { a: "start", s: 12, c: "var(--blue-ink)" }) + lines(342, 14, ["Fast enough for", "bulk data"], { a: "end", s: 12, c: "var(--amber-ink)" });
    s += tx(74, 144, "RSA", { s: 15 }) + tx(74, 168, "Diffie–Hellman", { s: 12 }) + tx(282, 146, "AES", { s: 15 }) + tx(282, 164, "(shared key)", { s: 11, c: "var(--text-dim)" });
    s += `<ellipse cx="175" cy="150" rx="30" ry="46" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-dasharray="5 4"/>` + tx(175, 157, "?", { s: 20, c: "var(--text-faint)" });
    return svg(350, 256, s, "Venn diagram: RSA and Diffie-Hellman sit in the public-channel circle, AES in the bulk-data circle, and the overlap is empty");
  }

  // K4: a tree of certificates
  function figCertTree() {
    let s = rc(95, 8, 150, 42, "g") + lines(170, 26, ["Root CA", "built into the browser"], { s: 12, c: "var(--teal-ink)", lh: 14 });
    s += ln(170, 50, 85, 80, { c: "var(--teal)", w: 3 }) + tx(106, 72, "signed", { s: 11, c: "var(--text-dim)", a: "end" });
    s += rc(15, 80, 140, 40, "p") + lines(85, 97, ["Intermediate CA", "(signed by Root)"], { s: 12, lh: 14 });
    s += rc(185, 80, 140, 40, "n", { d: "5 4" }) + lines(255, 97, ["FreeCert Ltd", "(not in the browser's list)"], { s: 11, lh: 14, c: "var(--text-dim)" });
    s += ln(85, 120, 85, 150, { c: "var(--teal)", w: 3 }) + ln(255, 120, 255, 150, { c: "var(--line-2)", w: 3, d: "5 4" });
    s += pk("A", rc(15, 150, 140, 46, "p") + lines(85, 168, ["shop.example", "signed by Intermediate"], { s: 12, lh: 14 }));
    s += pk("B", rc(185, 150, 140, 46, "p") + lines(255, 168, ["shop.example", "signed by FreeCert"], { s: 12, lh: 14 }));
    s += pk("C", rc(100, 226, 140, 46, "p") + lines(170, 244, ["shop.example", "signed by itself"], { s: 12, lh: 14 }));
    return svg(340, 280, s, "Certificate tree: Root CA signs an Intermediate CA which signs one shop.example certificate; a second comes from an unknown FreeCert; a third signs itself");
  }

  B.add("a8-keys", [
    { type: "mcq", q: "Diffie–Hellman with p = 17. Each ring shows which public values A = gᵃ mod 17 can ever appear (big green dots). Alice and Bob choose g = 4 instead of g = 3. What is the real problem?",
      fig: figRings(),
      o: ["Eve only has to try a = 1, 2, 3, 4, because the powers of 4 repeat after four steps",
        "Alice and Bob would calculate two different shared secrets, so the chat could not start",
        "Eve could read a straight off the ring, since every dot is labelled with its exponent",
        "The public value A would be too big to send, because g = 4 raises it to a higher power"], a: 0,
      hint: "Count the steps until the sequence 4, 16, 13, 1 starts again.",
      why: "The secret exponent only matters up to where the powers start repeating. With g = 3 that is 16 steps, with g = 4 it is 4, so Eve can simply try every a up to 4 (or 8 for g = 2). A good base, called a generator, visits as many values as possible, which is what makes the search hard." },
    { type: "pick", q: "Alice signs a contract and sends it with her signature. Eve has a copy of everything on the wire and Alice's <b>public</b> key. Tap <b>every</b> step Eve could carry out herself.",
      fig: figSignPipe(), a: ["s1", "s3", "s4", "s5"],
      why: "Hashing needs no secret, and unlocking a signature uses the <b>public</b> key, so Eve can do steps 1, 3, 4 and 5. The only step that needs a secret is step 2, locking with Alice's private key. That asymmetry is the whole point: anyone can check a signature, only Alice can make one." },
    { type: "mcq", q: "Each method is placed by what it does well. Nothing lands in the overlap. How does a real secure chat cope with that?",
      fig: figVenn(),
      o: ["Public-key steps agree a fresh key, then fast symmetric encryption carries the chat",
        "It uses RSA for every single message and accepts the extra waiting time on each reply",
        "It sends the AES key in the clear first, because AES is quick enough to make up for that",
        "It picks a much bigger RSA key until RSA becomes as fast as AES for the bulk data"], a: 0,
      why: "Public-key methods can start from nothing but are slow; symmetric ciphers are fast but need a shared key already. Combining them (a hybrid) gets both: use Diffie–Hellman or RSA once to agree a key, then AES for the bulk. A bigger RSA key makes it slower, not faster." },
    { type: "pick", q: "Your browser trusts only the Root CA's key. Three servers each present a certificate claiming to be <b>shop.example</b>. Tap the certificate it should accept.",
      fig: figCertTree(), a: "A",
      why: "A certificate is only as good as the chain of signatures leading back to a key you already hold. A is signed by the Intermediate, whose own certificate is signed by the Root, so the chain closes. FreeCert is unknown to the browser and a self-signed certificate vouches only for itself, so a man in the middle could use either." },
  ]);

  /* ================================================================== a9-dft ================================================================== */

  // D1: tone order is not in the magnitude spectrum
  function figTwoRecordings() {
    const N = 64, tone = (f, t) => Math.sin((TAU * f * t) / N);
    const A = Array.from({ length: N }, (_, t) => (t < 32 ? tone(4, t) : tone(8, t)));
    const Bs = Array.from({ length: N }, (_, t) => (t < 32 ? tone(8, t) : tone(4, t)));
    const sa = dftAmps(A), sb = dftAmps(Bs);
    const wave = (arr, cy, first, second) => {
      const X = (t) => 12 + (t * 316) / 63, pts = (a, b) => arr.slice(a, b + 1).map((v, i) => `${f1(X(a + i))},${f1(cy - v * 17)}`).join(" ");
      return ln(12, cy, 328, cy, { c: "var(--line)", w: 1.5 }) + `<polyline points="${pts(0, 32)}" fill="none" stroke="${first}" stroke-width="2.5" stroke-linejoin="round"/><polyline points="${pts(32, 63)}" fill="none" stroke="${second}" stroke-width="2.5" stroke-linejoin="round"/>`;
    };
    const bars = (x0, amps, title) => {
      let s = tx(x0 + 71, 134, title, { s: 12, c: "var(--text-dim)" });
      for (let k = 0; k <= 12; k++) { const h = amps[k] * 120, c = k === 4 ? "var(--blue)" : k === 8 ? "var(--amber)" : "var(--line-2)"; s += `<rect x="${x0 + k * 11 + 1}" y="${f1(206 - h)}" width="8" height="${f1(Math.max(h, 1))}" rx="2" fill="${c}"/>`; }
      return s + ln(x0, 207, x0 + 143, 207, { c: "var(--line-2)", w: 1.5 }) + tx(x0, 222, "0", { s: 11, c: "var(--text-faint)", a: "start" }) + tx(x0 + 143, 222, "12 Hz", { s: 11, c: "var(--text-faint)", a: "end" });
    };
    const s = tx(8, 14, "Recording A: slow tone, then fast tone", { a: "start", s: 12, c: "var(--text-dim)" }) + wave(A, 42, "var(--blue)", "var(--amber)") +
      tx(8, 78, "Recording B: fast tone, then slow tone", { a: "start", s: 12, c: "var(--text-dim)" }) + wave(Bs, 106, "var(--amber)", "var(--blue)") +
      bars(10, sa, "Spectrum of A") + bars(180, sb, "Spectrum of B");
    return svg(340, 230, s, "Two one-second recordings with the same two tones in opposite order, and their identical magnitude spectra");
  }

  // D2: the fold plot at fs = 40 Hz
  function figFold() {
    const X = (f) => 44 + f * 3.4, Y = (a) => 168 - a * 6;
    const fold = (f) => Math.abs(f - 40 * Math.round(f / 40));
    let s = ln(44, 168, 318, 168, { c: "var(--text-faint)", w: 2 }) + ln(44, 168, 44, 40, { c: "var(--text-faint)", w: 2 });
    [0, 10, 20].forEach((a) => (s += ln(41, Y(a), 47, Y(a), { c: "var(--text-faint)", w: 2 }) + tx(36, Y(a) + 4, a, { a: "end", s: 11, c: "var(--text-dim)" })));
    s += tx(8, 24, "peak you see (Hz)", { a: "start", s: 12, c: "var(--text-dim)" });
    s += `<polyline points="${[0, 20, 40, 60, 80].map((f) => `${f1(X(f))},${f1(Y(fold(f)))}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    s += tx(181, 220, "true frequency of the tone (Hz). Tap marked tones.", { s: 12, c: "var(--text-dim)" });
    [10, 20, 30, 50, 60, 70].forEach((f) => { s += pk(String(f), `<rect x="${f1(X(f) - 14)}" y="176" width="28" height="26" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>` + tx(X(f), 194, f, { s: 13 })); });
    [0, 40, 80].forEach((f) => (s += ln(X(f), 168, X(f), 172, { c: "var(--text-faint)", w: 2 })));
    return svg(330, 228, s, "Zig-zag plot: apparent frequency against true frequency when sampling at 40 Hz");
  }

  // D3: recording set-ups, sample rate across and length up
  function figSetups() {
    const X = (fs) => 48 + (fs / 1400) * 270, Y = (T) => 232 - T * 170;
    let s = ln(48, 232, 322, 232, { c: "var(--text-faint)", w: 2 }) + ln(48, 232, 48, 36, { c: "var(--text-faint)", w: 2 });
    [0, 400, 800, 1200].forEach((v) => (s += ln(X(v), 232, X(v), 236, { c: "var(--text-faint)", w: 2 }) + tx(X(v), 250, v, { s: 11, c: "var(--text-dim)" })));
    [0, 0.5, 1].forEach((v) => (s += ln(44, Y(v), 48, Y(v), { c: "var(--text-faint)", w: 2 }) + tx(40, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-dim)" }) + (v ? ln(48, Y(v), 322, Y(v), { c: "var(--line)", w: 1, d: "3 4" }) : "")));
    s += tx(8, 22, "recording length (s)", { a: "start", s: 12, c: "var(--text-dim)" }) + tx(185, 270, "samples per second (Hz)", { s: 12, c: "var(--text-dim)" });
    [["A", 500, 1], ["B", 800, 0.25], ["C", 800, 1], ["D", 650, 0.6], ["E", 1000, 0.4], ["F", 1200, 0.75], ["G", 400, 0.3]].forEach(([id, fs, T]) => (s += pk(id, circ(X(fs), Y(T), 13, "p") + tx(X(fs), Y(T) + 5, id, { s: 13 }))));
    return svg(335, 278, s, "Scatter of seven recording set-ups: sample rate across, recording length up");
  }

  B.add("a9-dft", [
    { type: "mcq", q: "Recording A plays a 4 Hz tone for half a second then an 8 Hz tone for half a second. Recording B plays them the other way round. Both are analysed with one DFT over the whole second. Can the magnitude spectrum tell you which tone came first?",
      fig: figTwoRecordings(),
      o: ["No: each bar adds up the whole second, so the order of the tones is not in the bar heights",
        "Yes: the 4 Hz bar sits further left when that tone plays first, so you can simply read the order",
        "Yes: the tone that plays first always leaves the taller bar of the two bars in the spectrum",
        "No: the sample rate is too low to hold two different tones in the same recording"], a: 0,
      why: "Every DFT bin multiplies all the samples by one rotating wave and adds the lot, so a bin answers “how much of this frequency is in the window?”, not “when?”. Swapping the halves gives exactly the same magnitudes (here the two charts are numerically identical). To see timing you cut the signal into short windows, a spectrogram." },
    { type: "pick", q: "A recorder samples at <b>40 Hz</b>. The zig-zag shows where a tone of each true frequency appears. A peak shows at 10 Hz. Tap <b>every</b> marked true frequency that could have produced it.",
      fig: figFold(), a: ["10", "30", "50", "70"],
      why: "Everything folds back into 0 to 20 Hz (half of 40). Tones at 10, 30, 50 and 70 Hz all land on 10 Hz: they differ by multiples of the sampling rate (40 Hz) or are mirror images around it. 20 and 60 Hz both land on 20 Hz. After sampling, nothing can tell these impostors apart." },
    { type: "pick", q: "The loudest tone to record is <b>300 Hz</b>, and two hums must show as separate peaks, which needs bins at most <b>2 Hz</b> apart. Each dot is a recording set-up. Tap <b>every</b> set-up that works.",
      fig: figSetups(), a: ["C", "D", "F"], hint: "Two conditions: samples per second above 2 × 300, and bin spacing 1 ÷ length at most 2.",
      why: "Condition 1: sample faster than twice the highest tone, so more than 600 Hz (rules out A and G). Condition 2: bin spacing is 1 ÷ length, so a length of at least 0.5 s gives 2 Hz bins (rules out B and E). C, D and F meet both." },
    { type: "bug", q: "<code>mags</code> holds the DFT magnitudes for bins 0 to n/2, from n samples taken at <code>fs</code> Hz. The function should return the frequency of the loudest bin but gives silly answers. Click the faulty line.",
      code: ["def peak_hz(mags, fs):", "    n = 2 * (len(mags) - 1)", "    k = mags.index(max(mags))", "    return k * n / fs"], a: 3,
      why: "Bin k sits at k × (bin spacing) and the spacing is fs ÷ n. The line multiplies by n and divides by fs, the wrong way up (the answer would shrink as you sample faster). It should be <code>k * fs / n</code>." },
  ]);

  /* ================================================================== a9-fft ================================================================== */

  // F1: samples that are zero on the odd positions
  function figEvenOnly() {
    const xs = [3, 0, 1, 0, 4, 0, 2, 0], cw = 38, x0 = 16;
    let s = tx(8, 16, "8 samples", { a: "start", s: 12, c: "var(--text-dim)" });
    xs.forEach((v, i) => (s += rc(x0 + i * cw, 24, cw - 4, 34, i % 2 ? "n" : "b", { r: 6 }) + tx(x0 + i * cw + (cw - 4) / 2, 47, v, { s: 15, c: i % 2 ? "var(--text-faint)" : "var(--blue-ink)" }) + tx(x0 + i * cw + (cw - 4) / 2, 74, `x${i}`, { s: 11, c: "var(--text-faint)" })));
    s += tx(8, 108, "Spectrum bars (heights depend on the samples)", { a: "start", s: 12, c: "var(--text-dim)" });
    for (let k = 0; k < 8; k++) {
      const x = x0 + k * cw;
      if (k === 1) s += rc(x, 120, cw - 4, 80, "g", { r: 6, sw: 1.5 }) + `<rect x="${x + 5}" y="152" width="${cw - 14}" height="48" rx="3" fill="var(--teal)"/>` + tx(x + (cw - 4) / 2, 140, "ref", { s: 11, c: "var(--teal-ink)" });
      else s += pk(String(k), rc(x, 120, cw - 4, 80, "p", { r: 6, d: "4 3" }) + tx(x + (cw - 4) / 2, 166, "?", { s: 15, c: "var(--text-faint)" }));
      s += tx(x + (cw - 4) / 2, 218, `bin ${k}`, { s: 11, c: "var(--text-faint)" });
    }
    return svg(330, 228, s, "Eight samples with zeros at odd positions, and eight spectrum slots with bin 1 drawn as the reference");
  }

  // F2: an 8-point butterfly network
  function figButterfly8() {
    const order = [0, 4, 2, 6, 1, 5, 3, 7], Y = (i) => 44 + i * 25, bands = [[84, 150], [160, 226], [236, 302]];
    let s = "";
    bands.forEach(([a, b], si) => {
      s += pk(`s${si + 1}`, rc(a - 4, 24, b - a + 8, 206, "p", { r: 10, d: "5 4" }) + tx((a + b) / 2, 18, `Stage ${si + 1}`, { s: 12, c: "var(--text-dim)" }));
    });
    for (let i = 0; i < 8; i++) s += ln(46, Y(i), 306, Y(i), { c: "var(--line-2)", w: 1.5 });
    bands.forEach(([a, b], si) => {
      const d = 1 << si;
      for (let i = 0; i < 8; i++) if (!(i & d)) { const j = i + d; s += ln(a, Y(i), b, Y(j), { c: "var(--blue)", w: 2 }) + ln(a, Y(j), b, Y(i), { c: "var(--blue)", w: 2 }); s += circ(a, Y(i), 3.2, "p", { f: "var(--blue)", st: "var(--blue)", sw: 1 }) + circ(a, Y(j), 3.2, "p", { f: "var(--blue)", st: "var(--blue)", sw: 1 }); }
    });
    order.forEach((v, i) => (s += tx(38, Y(i) + 4, `x${v}`, { a: "end", s: 12 })));
    return svg(340, 242, s, "An eight-point butterfly network with inputs in bit-reversed order and three stages");
  }

  // F3: a log ruler for operation counts
  function figRuler() {
    let s = ln(20, 44, 320, 44, { c: "var(--text-faint)", w: 2.5 });
    for (let e = 1; e <= 10; e++) { const x = 20 + ((e - 1) * 300) / 9; s += ln(x, 38, x, 50, { c: "var(--text-faint)", w: 2 }); }
    [[1, "10"], [3, "1,000"], [6, "1 million"], [9, "1 billion"]].forEach(([e, t]) => (s += tx(20 + ((e - 1) * 300) / 9, 72, t, { s: 12, c: "var(--text-dim)", a: e === 1 ? "start" : "middle" })));
    s += tx(170, 18, "number of operations, each tick is 10× the last", { s: 12, c: "var(--text-dim)" });
    return svg(340, 84, s, "A logarithmic ruler from 10 operations to 10 billion");
  }

  B.add("a9-fft", [
    { type: "pick", q: "An 8-sample recording has <b>zeros at every odd position</b>: x = [3, 0, 1, 0, 4, 0, 2, 0]. Bin 1's bar is drawn. Which other bins must be <b>exactly as tall</b>? Tap them all.",
      fig: figEvenOnly(), a: ["3", "5", "7"], hint: "If the odd samples are all zero, what is left of X[k] = E[k] + W·O[k]?",
      why: "The odd half O is all zeros, so X[k] = E[k] and X[k + 4] = E[k]: the spectrum repeats every 4 bins, so bin 5 equals bin 1. A real signal also mirrors (bin 8 − k has the same height), so bin 7 matches bin 1 and bin 3 matches bin 5. Bins 0, 2, 4 and 6 are different (10, 4, 10, 4 against 1.41)." },
    { type: "pick", q: "In this 8-point FFT the inputs are shuffled into bit-reversed order and then merged in three stages. The original samples <b>x0 and x1</b> (the first two in the recording) are first combined in which stage? Tap it.",
      fig: figButterfly8(), a: "s3", hint: "Follow x0 and x1 along their wires: when do they first end up on the same butterfly?",
      why: "Stage 1 merges neighbours in the shuffled order, so x0 meets x4. Stage 2 merges those pairs with {x2, x6}. Only stage 3 joins the even-indexed group {x0, x4, x2, x6} with the odd group {x1, x5, x3, x7}, so x0 and x1 first meet there. Neighbours in time are the last to meet, because the split starts with even against odd." },
    { type: "order", q: "Each job counts as N² operations (direct DFT) or about N log₂ N (FFT). Order them from the <b>fewest</b> operations to the most.",
      fig: figRuler(), hint: "log₂ of 4,096 is 12, of 65,536 is 16 and of 1,048,576 is 20.",
      items: ["Direct DFT of 64 samples", "FFT of 4,096 samples", "Direct DFT of 512 samples", "FFT of 65,536 samples", "FFT of 1,048,576 samples"],
      why: "64² = 4,096; 4,096 × 12 ≈ 49,000; 512² ≈ 262,000; 65,536 × 16 ≈ 1,050,000; 1,048,576 × 20 ≈ 21 million. A direct DFT of just 512 samples already costs more than an FFT of 4,096, but an FFT of a million samples is still only about 21 million steps, far less than the 10¹² a direct DFT would need." },
    { type: "bug", q: "This should reverse the bits of <code>i</code> (with 3 bits, 6 = 110 becomes 011 = 3), the order an FFT's inputs are shuffled into. It returns 1 for 6. Click the faulty line.",
      code: ["def bit_reverse(i, bits):", "    r = 0", "    for _ in range(bits):", "        r = r | (i & 1)", "        i >>= 1", "    return r"], a: 3,
      why: "Each pass should push the bits already collected one place left and add the new one at the bottom: <code>r = (r &lt;&lt; 1) | (i &amp; 1)</code>. Without the shift every bit lands on the same place, so 6 (110) gives 0, 1, 1 → 1 instead of 3." },
  ]);

  /* ================================================================== a10-attn ================================================================== */

  // A1: query and key arrows in 2-D
  function figArrows() {
    const X = (x) => 34 + (x + 2) * 40, Y = (y) => 222 - (y + 1) * 42, O = [X(0), Y(0)];
    let s = ln(X(-2), Y(0), X(5), Y(0), { c: "var(--line-2)", w: 1.5 }) + ln(X(0), Y(-1), X(0), Y(4), { c: "var(--line-2)", w: 1.5 });
    [[1, 1, "A"], [4, 1, "B"], [0, 3, "C"], [-1, 2, "D"]].forEach(([x, y, id]) => { s += arrow(O[0], O[1], X(x), Y(y), "var(--text-faint)", 2.5); });
    s += arrow(O[0], O[1], X(2), Y(2), "var(--blue)", 4) + tx(X(2) + 10, Y(2) - 14, "query (2, 2)", { a: "start", s: 12, c: "var(--blue-ink)" });
    [[1, 1, "A"], [4, 1, "B"], [0, 3, "C"], [-1, 2, "D"]].forEach(([x, y, id]) => { s += pk(id, circ(X(x), Y(y), 13, "p") + tx(X(x), Y(y) + 5, id, { s: 13 })); });
    s += tx(8, 16, "key arrows A to D, all from the origin", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(330, 240, s, "A blue query arrow (2, 2) and four grey key arrows A (1,1), B (4,1), C (0,3), D (-1,2)");
  }

  // A2: three panels of softmax weights
  function figWeightPanels() {
    const sets = [["A", [4, 2, 0]], ["B", [2, 1, 0]], ["C", [1, 0.5, 0]]];
    let s = "";
    sets.forEach(([id, sc], p) => {
      const x0 = 6 + p * 112, w = softmax(sc);
      let g = rc(x0, 8, 104, 160, "p", { r: 10 }) + tx(x0 + 52, 28, `Panel ${id}`, { s: 13 });
      w.forEach((v, i) => { const h = v * 100, bx = x0 + 12 + i * 29; g += `<rect x="${bx}" y="${f1(138 - h)}" width="24" height="${f1(h)}" rx="3" fill="var(--blue)"/>` + tx(bx + 12, 132 - h, v.toFixed(2), { s: 11 }) + tx(bx + 12, 156, `k${i + 1}`, { s: 11, c: "var(--text-faint)" }); });
      s += pk(id, g);
    });
    return svg(340, 176, s, "Three bar panels of attention weights over three keys");
  }

  // A3: heatmap of attention received
  function figHeat() {
    const toks = ["the", "cat", "sat", "down"], M = [[0.1, 0.5, 0.3, 0.1], [0.05, 0.15, 0.7, 0.1], [0.1, 0.55, 0.25, 0.1], [0.05, 0.55, 0.3, 0.1]];
    const x0 = 78, y0 = 62, cw = 56, ch = 38;
    let s = tx(8, 16, "Rows: the token that is looking.", { a: "start", s: 11, c: "var(--text-dim)" }) + tx(8, 32, "Columns: the token looked at. Each row adds to 1.", { a: "start", s: 11, c: "var(--text-dim)" });
    toks.forEach((t, c) => (s += pk(`c${c}`, rc(x0 + c * cw + 2, y0 - 26, cw - 4, 22, "p", { r: 7 }) + tx(x0 + c * cw + cw / 2, y0 - 10, t, { s: 12 }))));
    M.forEach((row, r) => {
      s += tx(x0 - 8, y0 + r * ch + ch / 2 + 4, toks[r], { a: "end", s: 12, c: "var(--text-dim)" });
      row.forEach((v, c) => (s += `<rect x="${x0 + c * cw + 2}" y="${y0 + r * ch + 2}" width="${cw - 4}" height="${ch - 4}" rx="5" fill="${tint("var(--blue)", Math.round(v * 120))}" stroke="var(--line)" stroke-width="1"/>` + tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 4, v.toFixed(2), { s: 12 })));
    });
    return svg(310, y0 + 4 * ch + 4, s, "Four by four heatmap of attention weights between the tokens the, cat, sat, down");
  }

  B.add("a10-attn", [
    { type: "pick", q: "One token has the query <b>q = (2, 2)</b> (blue). Its score for a key is the dot product q · k. Tap the key that gets the <b>highest score</b>.",
      fig: figArrows(), a: "B", hint: "Dot product = (q across × k across) + (q up × k up).",
      why: "q · B = 2×4 + 2×1 = 10, q · C = 6, q · A = 4 and q · D = 2. A points exactly the same way as q but is short, and B is longer and a little off-angle. The dot product rewards both alignment and size, so it is not the same as “whose tip is nearest” (A's is)." },
    { type: "pick", q: "A head with d_k = 4 gets raw dot-product scores [4, 2, 0] for three keys. It divides by √d_k before softmax. Tap the panel that shows the <b>final weights</b>.",
      fig: figWeightPanels(), a: "B", hint: "√4 = 2, so the scores become 2, 1, 0 (and e ≈ 2.7).",
      why: "Dividing by √4 = 2 turns [4, 2, 0] into [2, 1, 0], whose softmax is about 0.67, 0.24, 0.09 (panel B). Panel A skipped the scaling, so it is too sharp. Panel C divided by d_k = 4 instead of √d_k, a common slip, which over-flattens it." },
    { type: "pick", q: "Four tokens attend to each other with no mask. The biggest single cell is cat → sat (0.70). Add up each column in your head. Which token receives the most attention <b>overall</b>? Tap its header.",
      fig: figHeat(), a: "c1", hint: "Column “cat”: 0.50 + 0.15 + 0.55 + 0.55. Column “sat”: 0.30 + 0.70 + 0.25 + 0.30.",
      why: "Reading down a column gives how much attention a token receives: cat gets 0.50 + 0.15 + 0.55 + 0.55 = 1.75, sat only 1.55 even though it holds the largest single cell. Reading along a row instead shows who one token listens to, and each row adds to 1. Column totals do not have to." },
    { type: "bug", q: "Rows of <code>s</code> are queries, columns are keys. <code>softmax(s, axis=k)</code> makes the numbers along axis <i>k</i> add up to 1 (axis 0 runs down the rows, axis 1 runs along them). The code runs without error, but a token's weights no longer add up to 1. Click the faulty line.",
      code: ["def attend(Q, K, V, d_k):", "    s = Q @ K.T / math.sqrt(d_k)", "    w = softmax(s, axis=0)", "    return w @ V"], a: 2,
      why: "Each query needs its shares across <b>all the keys</b>, which means normalising along each row, <code>axis=1</code> (or −1). With <code>axis=0</code> each column adds to 1 instead, so a token's weights over the keys can total anything." },
  ]);

  /* ================================================================== a8-chain (workshop) ================================================================== */

  // C1: cards after a Verify
  function figVerifiedChain() {
    const cards = [["Genesis", "sealed", "g"], ["Block 1", "sealed", "g"], ["Block 2", "seal broken", "r"], ["Block 3", "after a break", "n"]];
    let s = "";
    cards.forEach(([t, st, k], i) => {
      const x = 6 + i * 84;
      s += pk(`b${i}`, rc(x, 12, 78, 62, k, { r: 10, d: i === 3 ? "5 4" : "", st: i === 3 ? "var(--rose)" : undefined }) + tx(x + 39, 34, t, { s: 13 }) + tx(x + 39, 58, st, { s: 11, c: k === "g" ? "var(--teal-ink)" : "var(--rose-ink)" }));
    });
    const link = (x, ok, t) => (ok ? tick(x, 102) : cross(x, 100)) + tx(x + 12, 106, t, { a: "start", s: 12, c: ok ? "var(--teal-ink)" : "var(--rose-ink)" });
    s += tx(8, 106, "Links:", { a: "start", s: 12, c: "var(--text-dim)" }) + link(70, true, "0 to 1") + link(142, true, "1 to 2") + link(214, false, "2 to 3: prev ≠ hash");
    return svg(340, 118, s, "Four block cards after Verify: block 2 has a broken seal and the link from block 2 to block 3 is broken");
  }

  // C2: dot plot of tries
  function figTriesDots() {
    const need = 2, tries = [];
    for (let i = 0; i < 16; i++) { let n = 1; while (!scrambled(`${n}|blk ${i}`).startsWith("0".repeat(need))) n++; tries.push(n); }
    const X = (v) => 22 + (v / 800) * 296, cnt = {};
    let s = ln(22, 150, 318, 150, { c: "var(--text-faint)", w: 2 });
    [0, 200, 400, 600, 800].forEach((v) => (s += ln(X(v), 150, X(v), 155, { c: "var(--text-faint)", w: 2 }) + tx(X(v), 170, v, { s: 11, c: "var(--text-dim)" })));
    tries.forEach((t) => { const b = Math.floor(t / 100); cnt[b] = (cnt[b] || 0) + 1; s += circ(X(b * 100 + 50), 150 - 9 - (cnt[b] - 1) * 17, 7, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1.5 }); });
    s += ln(X(256), 24, X(256), 150, { c: "var(--amber)", w: 2.5, d: "5 4" }) + tx(X(256) + 5, 34, "16 × 16 = 256", { a: "start", s: 12, c: "var(--amber-ink)" });
    s += tx(170, 190, "nonces tried before the hash started with 00", { s: 12, c: "var(--text-dim)" });
    return svg(340, 200, s, "Dot plot of the number of nonces tried for 16 blocks at difficulty 2");
  }

  // C4: before and after Re-link, built by really mining a chain
  function figRelink() {
    const DATA = ["genesis", "alice pays bob 5", "bob pays carol 2", "carol pays dave 1"], bl = DATA.map((d, i) => ({ i, data: d, nonce: 0, prev: "00000000" }));
    mineBlock(bl[0], 2); for (let i = 1; i < 4; i++) { bl[i].prev = blockHash(bl[i - 1]); mineBlock(bl[i], 2); }
    const stale = bl.map((b) => ({ ...b })); stale[1].data = "alice pays mallory 50";
    const linked = stale.map((b) => ({ ...b })); for (let i = 1; i < 4; i++) linked[i].prev = blockHash(linked[i - 1]);
    const mark = (x, y, ok) => (ok ? tick(x, y) : cross(x, y - 1));
    const panel = (y0, title, ch) => {
      let s = tx(8, y0, title, { a: "start", s: 13 }) + tx(86, y0 + 20, "prev", { s: 11, c: "var(--text-faint)" }) + tx(182, y0 + 20, "own hash", { s: 11, c: "var(--text-faint)" }) + tx(262, y0 + 20, "link", { s: 11, c: "var(--text-faint)" }) + tx(306, y0 + 20, "seal", { s: 11, c: "var(--text-faint)" });
      for (let i = 1; i < 4; i++) {
        const b = ch[i], h = blockHash(b), y = y0 + 28 + (i - 1) * 26, linkOk = b.prev === blockHash(ch[i - 1]), sealOk = zeros(h) >= 2;
        s += tx(8, y + 17, `block ${i}`, { a: "start", s: 12, c: "var(--text-dim)" }) + tx(86, y + 17, b.prev, { m: 1, s: 12, c: linkOk ? "var(--ink)" : "var(--rose-ink)" }) + tx(182, y + 17, h, { m: 1, s: 12, c: sealOk ? "var(--teal-ink)" : "var(--rose-ink)" }) + mark(262, y + 13, linkOk) + mark(306, y + 13, sealOk);
      }
      return s;
    };
    return svg(330, 252, panel(16, "After editing block 1", stale) + ln(8, 128, 322, 128, { c: "var(--line)", w: 1.5 }) + panel(148, "After pressing Re-link, no mining", linked), "Two small tables of prev and hash values for blocks 1 to 3, before and after re-linking");
  }

  // C5: a timeline of the repair bill
  function figRepairBar() {
    let s = tx(8, 16, "After editing block 1", { a: "start", s: 12, c: "var(--text-dim)" });
    ["Re-mine block 1", "Re-mine block 2", "Re-mine block 3"].forEach((t, i) => { s += rc(8 + i * 98, 26, 94, 44, "a", { r: 8 }) + lines(55 + i * 98, 46, [t.split(" ").slice(0, 2).join(" "), t.split(" ").slice(2).join(" ")], { s: 12, c: "var(--amber-ink)", lh: 14 }); });
    s += rc(306, 26, 26, 44, "g", { r: 8 }) + tx(319, 52, "✓", { s: 15, c: "var(--teal-ink)" });
    s += arrow(8, 94, 330, 94, "var(--text-faint)") + tx(8, 112, "time", { a: "start", s: 11, c: "var(--text-faint)" }) + tx(319, 112, "check", { a: "end", s: 11, c: "var(--text-faint)" });
    s += tx(170, 134, "each block needs a hash starting with 00", { s: 12, c: "var(--text-dim)" });
    return svg(340, 144, s, "Timeline: after the edit, three blocks are re-mined one after another, then a quick check at the end");
  }

  // C6: the Verify walk as a flow chart
  function figVerifyFlow() {
    const S = [["l1", "1 · Block 1", ["link: prev is", "genesis hash?"]], ["s1", "2 · Block 1", ["seal: hash", "starts 00?"]], ["l2", "3 · Block 2", ["link: prev is", "block 1's hash?"]], ["s2", "4 · Block 2", ["seal: hash", "starts 00?"]], ["l3", "5 · Block 3", ["link: prev is", "block 2's hash?"]], ["s3", "6 · Block 3", ["seal: hash", "starts 00?"]]];
    let s = tx(172, 14, "Walk order 1 to 6. It stops at the first failure.", { s: 12, c: "var(--text-dim)" });
    S.forEach(([id, b, t], i) => {
      const col = i % 3, row = i < 3 ? 0 : 1, x = 6 + col * 114, y = 26 + row * 82;
      s += pk(id, rc(x, y, 100, 58, "p") + tx(x + 50, y + 16, b, { s: 11.5, c: "var(--text-dim)" }) + lines(x + 50, y + 33, t, { s: 11, lh: 13 }));
      if (col < 2) s += arrow(x + 102, y + 29, x + 112, y + 29, "var(--text-faint)");
    });
    s += `<path d="M 290 86 L 290 98 L 56 98 L 56 104" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-linejoin="round"/><polygon points="56,108 51,100 61,100" fill="var(--text-faint)"/>`;
    return svg(332, 172, s, "Flow chart of six checks, a link check then a seal check for each of blocks 1, 2 and 3, in order");
  }

  B.add("a8-chain", [
    { type: "pick", q: "Someone edited the data of exactly <b>one</b> block, then you pressed Verify. The chain now looks like this. Which block's data was edited? Tap it.",
      fig: figVerifiedChain(), a: "b2",
      why: "Editing a block changes its own hash, so its seal breaks (block 2 shows ✗ seal broken) and the next block's stored prev no longer matches (the 2→3 link shows prev ≠ hash). Block 3 only looks bad because it points at a block whose hash changed. Block 3's own data is fine." },
    { type: "mcq", q: "Sixteen blocks were each mined with the same puzzle: a hash starting with <b>00</b>. The dots show how many nonces each block needed. What does the spread tell you?",
      fig: figTriesDots(),
      o: ["Every guess is an independent 1-in-256 shot, so luck swings widely around about 256",
        "The quick blocks used a smarter nonce order that the slow blocks could have copied too",
        "The difficulty was lowered for the quick blocks and raised again for the slow ones",
        "Mining gets steadily easier as the chain grows, so later blocks should always be quicker"], a: 0,
      why: "Each nonce is a fresh, unpredictable hash with a 1-in-256 chance of starting 00, so the count to the first win varies a lot (some blocks got lucky in 5 tries, one needed over 700), but averages near 256. There is no better strategy than guessing, and the difficulty here never changed." },
    { type: "cat", q: "The target is two leading hex zeros, <b>00</b>. Sort each hash by whether it seals a block.",
      buckets: ["Seals at 2 zeros", "Doesn't seal"],
      items: [["<code>00a32139</code>", 0], ["<code>0a22e6db</code>", 1], ["<code>80378a61</code>", 1], ["<code>000d98d4</code>", 0], ["<code>0c257d45</code>", 1], ["<code>00e9a037</code>", 0]],
      why: "Only zeros at the very <b>start</b> count, and you need two of them in a row. <code>0a22e6db</code> and <code>0c257d45</code> have one, <code>80378a61</code> has a zero in the wrong place, and <code>000d98d4</code> has three, which is more than enough." },
    { type: "mcq", q: "Block 1 was edited and the chain mined as in the workshop. After pressing <b>Re-link, no mining</b> every prev matches the block before it, yet blocks 2 and 3 now fail their seals. Why?",
      fig: figRelink(),
      o: ["prev is part of what a block hashes, so fixing it changed the hash and the zeros vanished",
        "Re-link wipes every nonce, so each block has to be mined again from nothing at all, in order",
        "Only block 1 was ever edited, so the seals on later blocks switch themselves off with it too",
        "Re-link copies the wrong hash into each prev, so the links are still broken in the picture"], a: 0,
      why: "A block's hash is computed from its nonce, data <b>and prev</b>. Block 2's prev changed, so its hash changed to <code>3b1fd712</code>, which no longer starts with 00 (the nonce was found for the old prev). The same ripples to block 3. Fixing pointers is free; the proof of work is not." },
    { type: "slider", q: "After the edit you must re-mine blocks 1, 2 <b>and</b> 3 in turn, each needing a hash that starts <b>00</b>. About how many hashes will that take in total, on average?",
      fig: figRepairBar(), min: 0, max: 1500, step: 50, ans: 750, tol: 150, unit: " hashes",
      hint: "Two hex zeros means 16 × 16 tries for one block. Then ×3.",
      why: "Each block needs about 16 × 16 = 256 guesses, so three blocks need about 3 × 256 = 768. Checking the finished chain costs only a hash or two per block. That gap, hundreds of guesses against one hash to verify, is what makes history expensive to rewrite and cheap to audit." },
    { type: "pick", q: "Block 1's data was edited and nothing has been re-mined. You press Verify, which walks the checks in order and stops at the first failure. Which check is the first to fail? Tap it.",
      fig: figVerifyFlow(), a: "s1",
      why: "Block 1's link check still passes (its prev is the genesis hash, which did not change). Its own hash changed, so its seal fails and the walk stops there. Blocks 2 and 3 have broken links too, but Verify never gets that far, which is why it can report the break after just a couple of hashes." },
  ]);

  /* ================================================================== a9-mix (workshop) ================================================================== */

  // M1: faders and three candidate spectra
  function figMixerBoard() {
    const fader = (y, name, f, a) => {
      const tr = (x0, v, vmax, lab) => ln(x0, y + 16, x0 + 100, y + 16, { c: "var(--line-2)", w: 4 }) + circ(x0 + (v / vmax) * 100, y + 16, 8, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1.5 }) + tx(x0 + 50, y + 40, lab, { s: 12, c: "var(--text-dim)" });
      return tx(8, y + 21, name, { a: "start", s: 13 }) + tr(80, f, 12, `frequency ${f} Hz`) + tr(214, a, 1, `strength ${a}`);
    };
    let s = fader(4, "Wave 1", 3, 1) + fader(56, "Wave 2", 8, 0.5);
    const opts = [["A", [[3, 0.5], [8, 1]]], ["B", [[3, 1], [11, 0.5]]], ["C", [[3, 1], [8, 0.5]]]];
    opts.forEach(([id, bars], p) => {
      const x0 = 6 + p * 112; let g = rc(x0, 116, 104, 100, "p", { r: 10 }) + tx(x0 + 52, 134, `Spectrum ${id}`, { s: 12 });
      for (let k = 0; k <= 12; k++) { const b = bars.find((q) => q[0] === k), h = b ? b[1] * 56 : 0; g += `<rect x="${x0 + 8 + k * 7.4}" y="${f1(200 - h)}" width="5" height="${f1(Math.max(h, 1.5))}" rx="1.5" fill="${b ? "var(--blue)" : "var(--line-2)"}"/>`; }
      g += tx(x0 + 8, 212, "0", { a: "start", s: 10, c: "var(--text-faint)" }) + tx(x0 + 98, 212, "12 Hz", { a: "end", s: 10, c: "var(--text-faint)" });
      s += pk(id, g);
    });
    return svg(340, 222, s, "A mixer with two waves (3 Hz at strength 1, 8 Hz at strength 0.5) and three candidate spectra");
  }

  // M2: grid of true frequency against sample rate
  function figAliasGrid() {
    const fs = [16, 32, 64], fr = [5, 11, 19, 27], x0 = 74, y0 = 56, cw = 80, ch = 38;
    let s = tx(x0 + 120, 16, "samples per second", { s: 12, c: "var(--text-dim)" }) + tx(8, 16, "tone", { a: "start", s: 12, c: "var(--text-dim)" });
    fs.forEach((v, c) => (s += tx(x0 + c * cw + cw / 2, y0 - 10, `${v} /s`, { s: 13 })));
    fr.forEach((f, r) => {
      s += tx(x0 - 10, y0 + r * ch + ch / 2 + 5, `${f} Hz`, { a: "end", s: 13 });
      fs.forEach((v, c) => (s += pk(`${f}-${v}`, rc(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6, "p", { r: 8 }) + tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 5, "?", { s: 14, c: "var(--text-faint)" }))));
    });
    return svg(320, y0 + 4 * ch + 6, s, "A grid with four tone frequencies down the side and three sampling rates across the top");
  }

  // M3: a spectrum with a noise floor
  function figFloor() {
    const amps = [0.002, 0.051, 0.032, 0.986, 0.04, 0.012, 0.035, 0.288, 0.013, 0.029, 0.018, 0.054, 0.176, 0.05, 0.007, 0.02, 0.0];
    const X = (k) => 22 + k * 18, Yb = 166, sc = 130;
    let s = ln(14, Yb, 328, Yb, { c: "var(--text-faint)", w: 2 }) + ln(14, Yb - 0.1 * sc, 328, Yb - 0.1 * sc, { c: "var(--rose)", w: 2, d: "5 4" }) + tx(326, Yb - 0.1 * sc - 6, "noise floor", { a: "end", s: 11, c: "var(--rose-ink)" });
    amps.forEach((a, k) => { s += pk(String(k), `<rect x="${X(k) - 9}" y="20" width="18" height="${Yb - 20}" fill="transparent"/>` + ln(X(k), Yb, X(k), Yb - Math.max(a * sc, 1.5), { c: "var(--blue)", w: 3 }) + circ(X(k), Yb - Math.max(a * sc, 1.5), 4.5, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1 })); });
    for (let k = 0; k <= 16; k += 2) s += tx(X(k), Yb + 16, k, { s: 11, c: "var(--text-dim)" });
    s += tx(170, Yb + 34, "frequency (Hz)", { s: 12, c: "var(--text-dim)" });
    return svg(340, 206, s, "Spectrum of a mystery signal with a dashed noise floor and several bars rising above it");
  }

  // M4: before and after one even/odd split
  function figSplitAreas() {
    let s = tx(58, 16, "One 16-point DFT", { s: 12, c: "var(--text-dim)" }) + rc(10, 26, 96, 96, "b", { r: 6 }) + tx(58, 79, "16 × 16", { s: 15, c: "var(--blue-ink)" });
    s += lines(58, 142, ["every output reads", "all 16 samples"], { s: 11, c: "var(--text-faint)", lh: 14 });
    s += tx(214, 16, "Split, then combine", { s: 12, c: "var(--text-dim)" });
    s += rc(150, 26, 60, 60, "g", { r: 5 }) + tx(180, 61, "8 × 8", { s: 13, c: "var(--teal-ink)" }) + rc(218, 26, 60, 60, "g", { r: 5 }) + tx(248, 61, "8 × 8", { s: 13, c: "var(--teal-ink)" });
    s += tx(180, 102, "evens", { s: 11, c: "var(--text-faint)" }) + tx(248, 102, "odds", { s: 11, c: "var(--text-faint)" });
    s += rc(150, 112, 128, 14, "a", { r: 5 }) + lines(214, 142, ["combine: one product", "for each of 8 bin pairs"], { s: 11, c: "var(--amber-ink)", lh: 14 });
    return svg(300, 164, s, "A single 16 by 16 square against two 8 by 8 squares plus a thin combine strip");
  }

  B.add("a9-mix", [
    { type: "pick", q: "The mixer holds two waves: <b>Wave 1</b> at 3 Hz with strength 1 and <b>Wave 2</b> at 8 Hz with strength 0.5. Which spectrum will it show? Tap it.",
      fig: figMixerBoard(), a: "C",
      why: "Each wave gets its own bar: frequency decides where the bar stands and strength decides how tall it is. So there is a full bar at 3 Hz and a half-height one at 8 Hz (C). A has the strengths swapped, and B has moved Wave 2 to 11 Hz (3 + 8), as if frequencies added up. They don't: waves add, frequencies stay." },
    { type: "pick", q: "You sample tones of 5, 11, 19 and 27 Hz at 16, 32 and 64 samples per second. Tap <b>every</b> cell where the bar will show up at the <b>wrong</b> frequency.",
      fig: figAliasGrid(), a: ["11-16", "19-16", "27-16", "19-32", "27-32"], hint: "A tone shows correctly only if it is below half the sampling rate: 8, 16 or 32 Hz.",
      why: "The limit is half the sampling rate: 8 Hz at 16/s, 16 Hz at 32/s and 32 Hz at 64/s. At 16/s only 5 Hz is safe (11, 19 and 27 fold back to 5, 3 and 5). At 32/s, 19 and 27 fold to 13 and 5. At 64/s everything is below 32 Hz, so all four are right. Note 27 Hz at 16/s lands on 5 Hz: it impersonates the real 5 Hz tone." },
    { type: "pick", q: "A mystery signal is sampled for one second at 32 samples per second, and its spectrum is shown. Tap <b>every</b> frequency that is really in the signal, not just noise.",
      fig: figFloor(), a: ["3", "7", "12"],
      why: "The dashed line is the noise floor: the wobble a few small random bars make by chance. Three bars clearly rise above it, at 3, 7 and 12 Hz. The 12 Hz one is short but it is far above the floor, so it counts. A short bar means a quiet wave, not a missing one." },
    { type: "slider", q: "A 16-point DFT costs about 16 × 16 multiplications. Split the samples into evens and odds, run <b>two</b> 8-point DFTs, then combine with one product for each of the 8 bin pairs. About how many multiplications is that in total?",
      fig: figSplitAreas(), min: 0, max: 300, step: 4, ans: 136, tol: 20, unit: " products",
      hint: "8 × 8 = 64, and there are two of them. Then add 8.",
      why: "Two 8-point DFTs cost 2 × 64 = 128, and combining adds 8 more products: 136, roughly half of 256. Split again and again and the saving compounds, which is how the FFT reaches N log N." },
    { type: "bug", q: "A wave of <code>f</code> Hz sampled <code>fs</code> times per second has its samples at times <code>t / fs</code>. This code should give one second of samples, but the wave comes out wildly wrong. Click the faulty line.",
      code: ["def sample(f, fs):", "    out = []", "    for t in range(fs):", "        a = 2 * pi * f * t * fs", "        out.append(sin(a))", "    return out"], a: 3,
      why: "Sample number t is taken at time t / fs seconds, so the angle is 2π × f × t / fs. Multiplying by fs makes the wave race along, faster the more samples you take. It should divide." },
    { type: "match", q: "In the mixer something changes on screen. Match each thing you see to what you did.",
      pairs: [["A bar jumps to a lower frequency than the wave you set", "Sampled at less than twice its frequency"], ["A bar gets taller but stays in place", "Raised that wave's strength"], ["A bar slides sideways at the same height", "Changed that wave's frequency"], ["A bar disappears from the spectrum", "Set that wave's strength to zero"]],
      why: "Height tracks strength and position tracks frequency. A bar standing at the wrong place when you set nothing wrong is the alias warning: the wave is above half the sampling rate and has folded back." },
  ]);

  /* ================================================================== a10-code (workshop) ================================================================== */

  // X1: printed scores and weights
  function figScoreTable() {
    const rows = [[0, 0, 0], [-2, 0, 0], [1, 1, 0], [2, 0, 0]], shown = rows.map((r) => softmax(r).map((v) => v.toFixed(2)));
    shown[2] = ["0.50", "0.50", "0.00"];
    let s = tx(16, 16, "scores", { a: "start", s: 11, c: "var(--text-faint)" }) + tx(160, 16, "weights printed", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach((r, i) => { const y = 24 + i * 44; s += pk(`r${i}`, rc(6, y, 328, 38, "p") + tx(16, y + 24, `[${r.join(", ")}]`.replace(/-/g, "−"), { a: "start", s: 14, m: 1 }) + tx(160, y + 24, `[${shown[i].join(", ")}]`, { a: "start", s: 14, m: 1 })); });
    return svg(340, 204, s, "Four rows each showing three scores and the three softmax weights a student's code printed");
  }

  // X2: two pipelines for softmax
  function figSoftmaxPipes() {
    const box = (x, y, k, a, b, c) => rc(x, y, 96, 62, k) + lines(x + 48, y + 20, [a, b, c].filter(Boolean), { s: 11, lh: 14 });
    let s = tx(8, 14, "Naive", { a: "start", s: 12, c: "var(--text-dim)" });
    s += box(8, 22, "p", "scores", "1000, 1000,", "998") + arrow(106, 53, 122, 53) + box(124, 22, "r", "e^score", "overflow!", "") + arrow(222, 53, 238, 53) + box(240, 22, "n", "divide by", "the total", "(never reached)");
    s += tx(8, 108, "Subtract the largest score first", { a: "start", s: 12, c: "var(--text-dim)" });
    s += box(8, 116, "p", "minus the max", "0, 0, −2", "") + arrow(106, 147, 122, 147) + box(124, 116, "p", "e^score", "1, 1, 0.14", "") + arrow(222, 147, 238, 147) + box(240, 116, "g", "divide by", "the total", "0.47 0.47 0.06");
    return svg(344, 186, s, "Naive softmax fails at the exponential on scores near 1000; subtracting the largest score first gives weights 0.47, 0.47, 0.06");
  }

  // X3: where can a blended output land?
  function figHull() {
    const X = (x) => 40 + x * 62, Y = (y) => 262 - y * 62;
    let s = ln(X(0), Y(0), X(4), Y(0), { c: "var(--line-2)", w: 1.5 }) + ln(X(0), Y(0), X(0), Y(4), { c: "var(--line-2)", w: 1.5 });
    for (let v = 1; v <= 4; v++) s += tx(X(v), Y(0) + 15, v, { s: 11, c: "var(--text-faint)" }) + tx(X(0) - 9, Y(v) + 4, v, { s: 11, c: "var(--text-faint)", a: "end" });
    [[3, 0, "v1 (3, 0)", 1], [0, 3, "v2 (0, 3)", 1], [3, 3, "v3 (3, 3)", 1]].forEach(([x, y, t]) => { s += `<rect x="${X(x) - 6}" y="${Y(y) - 6}" width="12" height="12" rx="2" fill="var(--violet)" stroke="var(--violet-lip)" stroke-width="1.5"/>`; });
    s += tx(X(3) + 12, Y(0) - 2, "v1", { a: "start", s: 12, c: "var(--violet-ink)" }) + tx(X(0) + 12, Y(3) - 4, "v2", { a: "start", s: 12, c: "var(--violet-ink)" }) + tx(X(3), Y(3) - 12, "v3", { s: 12, c: "var(--violet-ink)" });
    [["A", 2, 2], ["B", 1, 1], ["C", 3.55, 2.4], ["D", 1, 2.2], ["E", 2.4, 0.2], ["F", 2.5, 2.5]].forEach(([id, x, y]) => (s += pk(id, circ(X(x), Y(y), 12, "p") + tx(X(x), Y(y) + 5, id, { s: 13 }))));
    return svg(336, 284, s, "Three value vectors v1 (3,0), v2 (0,3) and v3 (3,3) as purple squares and six candidate outputs A to F");
  }

  // X4: a scale from shared evenly to winner takes all
  function figGauge() {
    let s = ln(20, 40, 320, 40, { c: "var(--text-faint)", w: 3 });
    [[0.333, "⅓"], [0.5, "½"], [0.75, "¾"], [1, "1"]].forEach(([v, t]) => { const x = 20 + ((v - 0.333) / 0.667) * 300; s += ln(x, 33, x, 47, { c: "var(--text-faint)", w: 2 }) + tx(x, 64, t, { s: 13, c: "var(--text-dim)", a: v === 1 ? "end" : v < 0.4 ? "start" : "middle" }); });
    s += tx(20, 18, "even shares", { a: "start", s: 12, c: "var(--blue-ink)" }) + tx(320, 18, "winner takes (almost) all", { a: "end", s: 12, c: "var(--amber-ink)" }) + tx(170, 84, "weight of the biggest share, 3 tokens", { s: 11, c: "var(--text-faint)" });
    return svg(340, 94, s, "A scale for the biggest softmax weight, from one third to one");
  }

  // X6: matrix shapes in one attention head
  function figShapes() {
    const u = 20, mat = (id, x, y, r, c, name, wrong) => pk(id, rc(x, y, c * u, r * u, wrong ? "p" : "p", { r: 5 }) + tx(x + (c * u) / 2, y + (r * u) / 2 - 2, name, { s: 12 }) + tx(x + (c * u) / 2, y + (r * u) / 2 + 13, `${r}×${c}`, { s: 12, c: "var(--text-dim)" }));
    let s = tx(8, 14, "3 tokens, d_k = 4, values of 2 numbers. Shape = rows × columns.", { a: "start", s: 11, c: "var(--text-dim)" });
    s += mat("Q", 10, 34, 3, 4, "Q") + tx(104, 70, "×", { s: 18, c: "var(--text-faint)" }) + mat("Kt", 122, 24, 4, 3, "Kᵀ") + tx(196, 70, "→", { s: 18, c: "var(--text-faint)" }) + mat("scores", 214, 34, 3, 3, "scores");
    s += tx(244, 112, "↓ softmax", { s: 11, c: "var(--text-faint)" });
    s += mat("weights", 10, 134, 3, 3, "weights") + tx(88, 170, "×", { s: 18, c: "var(--text-faint)" }) + mat("V", 104, 134, 3, 2, "V") + tx(160, 170, "=", { s: 18, c: "var(--text-faint)" }) + mat("out", 176, 134, 3, 3, "out");
    return svg(300, 210, s, "Six matrices Q, K transposed, scores, weights, V and out with their shapes");
  }

  B.add("a10-code", [
    { type: "pick", q: "A student prints three scores and the three softmax weights for four different tokens. One row <b>cannot</b> be the output of a correct softmax, whatever the code looks like. Tap it.",
      fig: figScoreTable(), a: "r2",
      why: "Softmax turns every score into e^score, which is always positive, so no weight can be exactly 0 (a masked score of −∞ is the only way to get there). Scores [1, 1, 0] should give about 0.42, 0.42, 0.16. The printed 0.50, 0.50, 0.00 looks like each score divided by the total of the scores. Row 2's negative score is fine: it just earns a small share." },
    { type: "mcq", q: "Scores of 1000 overflow <code>math.exp</code>, so the lab subtracts the biggest score first. Why can that never change the final weights?",
      fig: figSoftmaxPipes(),
      o: ["Each term shrinks by the same factor, e to the max, so the final division cancels it",
        "It removes the largest score from the sum, which the other weights never really needed",
        "It rounds the scores so that they match exactly after the exponential step is taken",
        "It forces the weights to add to 1, which the divide step cannot manage on its own"], a: 0,
      why: "e^(s − m) = e^s ÷ e^m. Every term gets divided by the same e^m, and so does the total, so the common factor cancels in the final division. The weights are identical, but the numbers stay small enough to compute. Without this step Python raises an OverflowError on <code>math.exp(1000)</code>." },
    { type: "pick", q: "Three value vectors are fixed: v1 = (3, 0), v2 = (0, 3) and v3 = (3, 3). A token blends them with positive weights that add up to 1. Tap <b>every</b> candidate that no choice of weights could ever produce.",
      fig: figHull(), a: ["B", "C", "E"], hint: "A blend with weights adding to 1 stays inside the triangle with corners v1, v2 and v3. Which side is x + y = 3?",
      why: "A weighted average with positive weights summing to 1 always lands inside the triangle with corners v1, v2, v3 (x ≤ 3, y ≤ 3 and x + y ≥ 3). B (1, 1) and E (2.4, 0.2) have x + y below 3, and C sticks out past x = 3. A, D and F are inside. Attention can only mix its values, never invent something outside them." },
    { type: "order", q: "A token's three keys give these score patterns (the other two scores are 0). Order them from the <b>most even</b> weights to the <b>sharpest</b>, judged by the biggest weight.",
      fig: figGauge(), hint: "e ≈ 2.7, e³ ≈ 20 and e⁶ ≈ 400. A score of −3 gives a tiny e⁻³ ≈ 0.05.",
      items: ["scores [0, 0, 0]", "scores [−3, 0, 0]", "scores [1, 0, 0]", "scores [3, 0, 0]", "scores [6, 0, 0]"],
      why: "Biggest weights: [0, 0, 0] gives ⅓ each; [−3, 0, 0] makes the first key almost invisible and the others share about 0.49 each; [1, 0, 0] gives 2.7 ÷ (2.7 + 2) ≈ 0.58; [3, 0, 0] gives about 0.91; [6, 0, 0] gives about 0.995. A lower score does not make the blend sharper, it just hands more to the rest." },
    { type: "bug", q: "In the lab's blend step, <code>weights[j]</code> is token <code>j</code>'s share. This loop runs without any error but gives the wrong mix. Click the faulty line.",
      code: ["mix = [0] * len(V[0])", "for j in range(len(V)):", "    for d in range(len(V[0])):", "        mix[d] += weights[d] * V[j][d]"], a: 3,
      why: "The share to use is token j's, <code>weights[j]</code>. The line indexes by <code>d</code>, the slot in the value vector, so it multiplies by the wrong weight (and fails with an IndexError whenever there are fewer tokens than slots). It should read <code>weights[j] * V[j][d]</code>." },
    { type: "pick", q: "n = 3 tokens, d_k = 4 numbers per query and key, and each value vector has 2 numbers. Rows are tokens. One box in this attention head is drawn with the <b>wrong shape</b>. Tap it.",
      fig: figShapes(), a: "out",
      why: "The scores and weights are token against token, 3×3, and V is 3×2. Multiplying 3×3 by 3×2 gives 3 rows (one per token) and 2 columns (the length of a value vector), so <b>out</b> should be 3×2. A blend of value vectors can't be wider than the values themselves." },
  ]);

  /* ================================================================== a11-picker (workshop) ================================================================== */

  // P1: decision flow
  function figToolFlow() {
    const Q = [["Link every point as", "cheaply as possible?", "mst", ["MST", "Prim / Kruskal"]], ["An outline round", "scattered points?", "hull", ["Convex hull"]], ["Best mix under", "straight-line limits?", "lp", ["Linear", "programming"]], ["One goal, plus an honest", "estimate of distance left?", "astar", ["A*"]]];
    let s = "";
    Q.forEach(([a, b, id, name], i) => {
      const y = 8 + i * 66;
      s += rc(8, y, 190, 44, "b") + lines(103, y + 19, [a, b], { s: 12, lh: 15 }) + arrow(200, y + 22, 238, y + 22, "var(--teal)", 2.5) + tx(219, y + 14, "yes", { s: 11, c: "var(--teal-ink)" });
      s += pk(id, rc(242, y + 1, 108, 42, "g") + lines(296, y + (name.length > 1 ? 18 : 25), name, { s: 12, lh: 14, c: "var(--teal-ink)" }));
      s += arrow(103, y + 46, 103, y + 64, "var(--rose)", 2.5) + tx(122, y + 59, "no", { s: 11, c: "var(--rose-ink)" });
    });
    s += pk("dijk", rc(8, 272, 190, 38, "g") + tx(103, 296, "Dijkstra", { s: 13, c: "var(--teal-ink)" }));
    return svg(356, 318, s, "A decision flow chart: four yes/no questions lead to MST, convex hull, linear programming, A* or finally Dijkstra");
  }

  // P2: the channel
  function figChannel() {
    const wire = (x1, x2) => ln(x1, 58, x2, 58, { c: "var(--text-faint)", w: 2 });
    let s = rc(6, 36, 62, 44, "n") + lines(37, 55, ["Text", "in"], { s: 12, lh: 14 }) + rc(272, 36, 62, 44, "n") + lines(303, 55, ["Text", "out"], { s: 12, lh: 14 });
    [84, 124, 220, 252].forEach((x) => (s += circ(x, 58, 15, "p") + tx(x, 63, "?", { s: 15, c: "var(--text-faint)" })));
    s += wire(68, 69) + wire(99, 109) + wire(139, 160) + wire(204, 205) + wire(235, 237) + wire(267, 272);
    s += `<polyline points="150,58 160,40 168,74 178,40 188,74 196,58" fill="none" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round"/>`;
    s += tx(173, 100, "noisy link: one bit may flip", { s: 12, c: "var(--amber-ink)" }) + tx(106, 28, "two steps before", { s: 11, c: "var(--text-dim)" }) + tx(236, 28, "two steps after", { s: 11, c: "var(--text-dim)" });
    return svg(340, 112, s, "A channel: text goes through two steps, a noisy link where a bit may flip, then two more steps");
  }

  // P3: three trees on the same six sites
  function figTrees() {
    const pos = { S: [24, 56], A: [84, 20], B: [84, 92], C: [188, 20], D: [188, 92], E: [264, 56] };
    const all = [["S", "A", 4], ["S", "B", 6], ["A", "B", 1], ["A", "C", 6], ["B", "D", 3], ["C", "D", 3], ["C", "E", 5], ["D", "E", 4], ["B", "C", 7]];
    const panels = [["p1", "Panel 1", ["SA", "SB", "BD", "CD", "DE"]], ["p2", "Panel 2", ["SA", "AB", "BD", "AC", "DE"]], ["p3", "Panel 3", ["AB", "BD", "CD", "SA", "DE"]]];
    let s = "";
    panels.forEach(([id, title, keep], p) => {
      const y0 = p * 118 + 6; let g = rc(4, y0, 292, 112, "p", { r: 10 }) + tx(14, y0 + 20, title, { a: "start", s: 12, c: "var(--text-dim)" });
      all.forEach(([a, b, w]) => { const on = keep.includes(a + b), [xa, ya] = pos[a], [xb, yb] = pos[b]; g += ln(xa + 16, ya + y0 + 8, xb + 16, yb + y0 + 8, on ? { c: "var(--blue)", w: 4 } : { c: "var(--line)", w: 1.5, d: "3 4" }); if (on) g += tx((xa + xb) / 2 + 16 + (xa === xb ? 11 : 0), (ya + yb) / 2 + y0 + 8 + (xa === xb ? 4 : -6), w, { s: 12, c: "var(--blue-ink)" }); });
      Object.entries(pos).forEach(([k, [x, y]]) => (g += circ(x + 16, y + y0 + 8, 11, "p") + tx(x + 16, y + y0 + 13, k, { s: 12 })));
      s += pk(id, g);
    });
    return svg(300, 364, s, "Three spanning trees on the same six sites S, A, B, C, D, E with the link lengths on chosen links");
  }

  B.add("a11-picker", [
    { type: "pick", q: "A library robot needs the quickest route from its dock to <b>every one</b> of 40 shelves. Travel times are never negative. Follow the flow chart and tap the tool you land on.",
      fig: figToolFlow(), a: "dijk",
      why: "Linking everything cheaply, wrapping points and mixing under limits are all different jobs, so the first three answers are no. A* needs one goal and an honest estimate of what is left, and here there are 40 goals, so the answer is also no. That leaves Dijkstra: quickest routes from one start to everywhere, when no cost is negative." },
    { type: "order", q: "A newsletter is Huffman-compressed and Hamming-protected, then sent over a noisy link where one bit in a block may flip. Put the steps in the right order.",
      fig: figChannel(),
      items: ["Compress the text with Huffman", "Add Hamming parity bits", "Send it across the noisy link", "Use the parity checks to repair the flipped bit", "Decompress back to the newsletter"],
      why: "Compression squeezes redundancy out, and error correction deliberately puts a little back, so compress first and protect second. Protecting first would let the compressor throw the parity bits away. At the far end it must go in reverse: repair the bit while the parity bits are still there, then decompress. A flipped bit inside compressed data would otherwise scramble everything after it." },
    { type: "pick", q: "Six sites must be joined into one cable network with the <b>least cable overall</b>. Each panel keeps some of the same links (lengths shown). Tap the best panel.",
      fig: figTrees(), a: "p3", hint: "Add up the five lengths in each panel.",
      why: "Panel 3 totals 1 + 3 + 3 + 4 + 4 = 15, the cheapest tree: that is what Prim or Kruskal build. Panel 2 is Dijkstra's tree from S (4 + 1 + 3 + 6 + 4 = 18): every site gets its quickest route from S, but that is a different goal from the cheapest total. Panel 1 totals 4 + 6 + 3 + 3 + 4 = 20." },
    { type: "order", q: "Put these jobs in order from the <b>fewest</b> basic steps to the most.",
      fig: figRuler(), hint: "Binary search ≈ 10 steps. FFT ≈ N log₂ N. Attention ≈ n². 2³² is about 4 billion.",
      items: ["Binary search through 1,024 sorted items", "Direct DFT of 32 samples (N²)", "FFT of 1,024 samples (N log₂ N)", "Attention scores for 1,024 tokens (n²)", "Trying every subset of 32 items (2³²)"],
      why: "About 10 steps; 32² = 1,024; 1,024 × 10 ≈ 10,000; 1,024² ≈ 1 million; and 2³² ≈ 4.3 billion. Log, near-linear, quadratic and exponential growth are far apart: a million-fold jump between the FFT and attention at this size is nothing next to what the exponential brute force costs." },
    { type: "cat", q: "Sort each tool by the kind of thing it hands back.",
      buckets: ["A score for each item", "A route or a network of links", "A string of bits"],
      items: [["PageRank", 0], ["Attention weights", 0], ["Dijkstra", 1], ["Minimum spanning tree", 1], ["Huffman coding", 2], ["CRC check bits", 2], ["LZW", 2]],
      why: "PageRank scores pages and attention weights score tokens. Dijkstra returns routes and an MST a set of links. Huffman and LZW return shorter bit strings and a CRC returns a few check bits. Knowing the output shape is the quickest way to rule tools out." },
    { type: "pick", q: "A planner uses four tools. Three things then change in the data. Tap <b>every</b> cell where the tool will now give wrong answers.",
      fig: (function () {
        const rows = ["A road gets a negative cost", "The cost curve gets a second dip", "The distance estimate sometimes overshoots"], cols = [["Dijkstra", ""], ["A*", ""], ["MST", ""], ["Golden-", "section"]], x0 = 148, y0 = 52, cw = 52, ch = 44;
        let s = "";
        cols.forEach(([a, b], c) => (s += lines(x0 + c * cw + cw / 2, y0 - 22, b ? [a, b] : [a], { s: 11, lh: 12 })));
        rows.forEach((t, r) => {
          const w = t.split(" "), mid = Math.ceil(w.length / 2);
          s += lines(x0 - 8, y0 + r * ch + ch / 2 - 2, [w.slice(0, mid).join(" "), w.slice(mid).join(" ")], { a: "end", s: 11, c: "var(--text-dim)", lh: 13 });
          cols.forEach((_, c) => (s += pk(`r${r}c${c}`, rc(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6, "p", { r: 8 }) + tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 5, "?", { s: 14, c: "var(--text-faint)" }))));
        });
        return svg(358, y0 + 3 * ch + 6, s, "A grid of three changes against four tools");
      })(), a: ["r0c0", "r0c1", "r1c3", "r2c1"],
      why: "Dijkstra and A* both rely on costs never being negative (a settled place can only get worse later). A* additionally trusts its estimate never to overshoot, so an overshooting estimate breaks A* but not Dijkstra, which does not use one. Golden-section search needs a single dip, so a second dip breaks it. An MST is untouched by any of the three: Prim and Kruskal still work with negative lengths." },
  ]);
})();
