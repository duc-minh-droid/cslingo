/* algo-p6-x-01: Phase 6 shared helpers, 6.1 noise and redundancy, 6.9 beyond Hamming (ported from the vault). */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  const reg = (m) => N.register({ subject: "algo", lecture: 6, ...m });

  /* ---------- helpers ---------- */
  const COL = {
    teal: "var(--teal)",
    violet: "var(--violet)",
    amber: "var(--amber)",
    rose: "var(--rose)",
    blue: "var(--blue)",
  };
  const xor = (a, b) => a ^ b;
  const par = (bits) => bits.reduce(xor, 0);
  const bitsOf = (s) => String(s).split("").map(Number);
  const str = (b) => b.join("");
  const ones = (b) => b.reduce((a, x) => a + x, 0);
  // seeded random (for demos that simulate a noisy channel)
  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Hamming(7,4): codeword order p1 p2 d1 p3 d2 d3 d4 (positions 1..7)
  const hEnc = (d) => [d[0] ^ d[1] ^ d[3], d[0] ^ d[2] ^ d[3], d[0], d[1] ^ d[2] ^ d[3], d[1], d[2], d[3]];
  const hChecks = (r) => [r[0] ^ r[2] ^ r[4] ^ r[6], r[1] ^ r[2] ^ r[5] ^ r[6], r[3] ^ r[4] ^ r[5] ^ r[6]]; // s1 s2 s4
  const hSyn = (r) => {
    const s = hChecks(r);
    return s[2] * 4 + s[1] * 2 + s[0];
  };
  const hFix = (r) => {
    const o = r.slice(),
      s = hSyn(o);
    if (s) o[s - 1] ^= 1;
    return o;
  };
  const hData = (r) => [r[2], r[4], r[5], r[6]];
  // remainder of a full-length bit string divided by the generator (mod-2 long division)
  const polyMod = (bits, gen) => {
    const m = bitsOf(bits),
      g = bitsOf(gen);
    for (let i = 0; i <= m.length - g.length; i++) if (m[i]) for (let j = 0; j < g.length; j++) m[i + j] ^= g[j];
    return str(m.slice(Math.max(0, m.length - (g.length - 1))));
  };
  // CRC check bits: remainder of (message + r zeros) / generator
  const crcRem = (msg, gen) => polyMod(msg + "0".repeat(gen.length - 1), gen);
  const polyTex = (gen) => {
    const g = String(gen),
      n = g.length - 1,
      t = [];
    for (let i = 0; i <= n; i++)
      if (g[i] === "1") {
        const e = n - i;
        t.push(e === 0 ? "1" : e === 1 ? "x" : `x^${e}`);
      }
    return `$${t.join("+")}$`;
  };

  // a figure cell with an optional data-k (so a runner question can ask the learner to tap it)
  const cell = (v, o = {}) =>
    `<span class="cell" ${o.k !== undefined ? `data-k="${o.k}"` : ""} style="--c:${o.c ? COL[o.c] : "var(--line-2)"};min-width:${o.w || 34}px;${o.c ? `background:color-mix(in srgb, ${COL[o.c]} 16%, var(--panel-2))` : ""}">${v}${o.sub !== undefined ? `<small>${o.sub}</small>` : ""}</span>`;
  const cellRow = (arr, label) =>
    `<div class="fig-cells">${label ? `<span class="fcl">${label}</span>` : ""}${arr.join("")}</div>`;
  const RSTYLE = `.c6-st{width:100%;display:grid;gap:10px;justify-items:center}.c6-st .rn-pickable{outline:3px solid var(--violet);outline-offset:2px;border-radius:10px;cursor:pointer}.c6-ch{display:inline-flex;min-width:46px;justify-content:center;padding:6px 12px;border:2px solid var(--line-2);border-radius:10px;font-weight:800;font-family:var(--mono);background:var(--panel)}.c6-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}.c6-box{border:2px solid var(--line-2);border-radius:12px;padding:8px 10px;background:var(--panel-2);text-align:center;min-width:130px}.c6-box h4{margin:0 0 6px;font-size:12px;color:var(--text-faint)}.c6-note{font-size:13.5px;color:var(--text-soft);text-align:center;min-height:20px}`;
  const simpleRun = (box, life, o) =>
    F.run(box, life, {
      code: o.code,
      build(stage) {
        const st = document.createElement("style");
        st.textContent = RSTYLE;
        stage.appendChild(st);
        const d = document.createElement("div");
        d.className = "c6-st";
        stage.appendChild(d);
        return d;
      },
      frames: o.frames,
      draw(d, f) {
        d.innerHTML = o.html(f);
      },
    });

  const table = (head, rows, mw = 640) =>
    `<table class="t" style="max-width:${mw}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const chips = (opts) =>
    `<div class="c6-row">${opts.map((o) => (Array.isArray(o) ? `<span class="c6-ch" data-k="${o[0]}">${o[1]}</span>` : `<span class="c6-ch" data-k="${o}">${o}</span>`)).join("")}</div>`;
  // CRC by the register algorithm of the lecture: shift C left, shifting in the next bit; if the bit shifted out is 1, XOR C with the last r bits of P.
  function crcRegister(bits, gen, pad) {
    const r = gen.length - 1,
      P = bitsOf(gen).slice(1),
      seq = bitsOf(bits).concat(pad ? Array(r).fill(0) : []);
    let C = Array(r).fill(0);
    const trace = [];
    seq.forEach((nb, i) => {
      const before = C.slice(),
        out = C[0],
        shifted = C.slice(1).concat([nb]);
      C = out ? shifted.map((b, j) => b ^ P[j]) : shifted;
      trace.push({ i, nb, before, out, shifted, after: C.slice(), padded: i >= bits.length });
    });
    return { rem: str(C), trace };
  }
  // three overlapping circles for Hamming(7,4): vals = r1..r7, bad = [p1, p2, p3] failing flags, err = a position to ring (1..7) or 0
  function venn(vals, bad, err) {
    const POS = [
      [75, 85],
      [225, 85],
      [150, 62],
      [150, 208],
      [113, 137],
      [187, 137],
      [150, 115],
    ];
    const LAB = ["p1", "p2", "d1", "p3", "d2", "d3", "d4"];
    const circ = [
      [110, 95, "p1"],
      [190, 95, "p2"],
      [150, 160, "p3"],
    ];
    return `<svg class="fig" viewBox="0 0 300 262" style="max-height:230px">${circ.map(([x, y, n], k) => `<circle cx="${x}" cy="${y}" r="70" fill="color-mix(in srgb, ${bad[k] ? "var(--rose)" : "var(--teal)"} 10%, transparent)" stroke="${bad[k] ? "var(--rose)" : "var(--teal)"}" stroke-width="${bad[k] ? 3.5 : 2}"/>`).join("")}
      <text x="40" y="30" class="fig-sub" style="fill:${bad[0] ? "var(--rose-ink)" : "var(--teal-ink)"}">circle p1 ${bad[0] ? "✗" : "✓"}</text><text x="260" y="30" class="fig-sub" style="text-anchor:end;fill:${bad[1] ? "var(--rose-ink)" : "var(--teal-ink)"}">circle p2 ${bad[1] ? "✗" : "✓"}</text><text x="150" y="256" class="fig-sub" style="text-anchor:middle;fill:${bad[2] ? "var(--rose-ink)" : "var(--teal-ink)"}">circle p3 ${bad[2] ? "✗" : "✓"}</text>
      ${POS.map(([x, y], i) => `<g><circle cx="${x}" cy="${y}" r="15" fill="${err === i + 1 ? "var(--rose)" : "var(--panel)"}" stroke="${err === i + 1 ? "var(--rose)" : "var(--line-2)"}" stroke-width="2"/><text x="${x}" y="${y + 5}" class="fig-n" style="${err === i + 1 ? "fill:var(--rose-on)" : ""}">${vals[i]}</text><text x="${x}" y="${y + 27}" class="fig-sub" style="text-anchor:middle;font-size:9px">${LAB[i]}</text></g>`).join("")}</svg>`;
  }
  // the shift-register diagram for generator 1101 (x^3 + x^2 + 1): a cell gets an XOR gate where the coefficient is 1
  const crcDiagram =
    () => `<svg class="fig" viewBox="0 0 470 150" style="max-height:170px"><defs><marker id="c6ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker></defs>
    ${[
      ["c2", 110, "x²"],
      ["c1", 210, "x¹"],
      ["c0", 310, "x⁰"],
    ]
      .map(
        ([n, x, p]) =>
          `<rect x="${x}" y="70" width="60" height="40" rx="9" fill="var(--panel-2)" stroke="var(--violet)" stroke-width="2"/><text x="${x + 30}" y="95" class="fig-n">${n}</text><text x="${x + 30}" y="126" class="fig-sub" style="text-anchor:middle">${p}</text>`,
      )
      .join("")}
    <path d="M465 90 H410" stroke="var(--text-faint)" stroke-width="2" marker-end="url(#c6ar)"/><text x="440" y="82" class="fig-sub" style="text-anchor:middle">next bit</text>
    <circle cx="395" cy="90" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="2"/><text x="395" y="95" class="fig-n" style="fill:var(--amber-ink)">⊕</text><path d="M384 90 H372" stroke="var(--text-faint)" stroke-width="2" marker-end="url(#c6ar)"/>
    <path d="M310 90 H272" stroke="var(--text-faint)" stroke-width="2" marker-end="url(#c6ar)"/>
    <path d="M210 90 H202" stroke="var(--text-faint)" stroke-width="2"/><circle cx="190" cy="90" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="2"/><text x="190" y="95" class="fig-n" style="fill:var(--amber-ink)">⊕</text><path d="M179 90 H172" stroke="var(--text-faint)" stroke-width="2" marker-end="url(#c6ar)"/>
    <path d="M110 90 H60" stroke="var(--rose)" stroke-width="2.5"/><path d="M60 90 V30 H395 V79" fill="none" stroke="var(--rose)" stroke-width="2.5" marker-end="url(#c6ar)"/><path d="M190 30 V79" fill="none" stroke="var(--rose)" stroke-width="2.5" marker-end="url(#c6ar)"/>
    <text x="64" y="22" class="fig-sub" style="fill:var(--rose-ink)">bit shifted out feeds back to the XOR gates</text></svg>`;
  /* ============================================================
     6.1 Noise and redundancy
     ============================================================ */
  L["a6-noise"] = {
    sum: "Every channel adds noise, and far-away senders are quiet, so bits flip. Compression removes redundancy; error coding adds a little back so the receiver can notice (<b>detect</b>) or repair (<b>correct</b>) flips. Detect-and-resend needs a way to ask again; forward correction does not.",
    // prettier-ignore
    steps: [
      { t: "Noise is everywhere", b: `<p>Whenever bits travel (radio, a cable, a disk, a QR code) noise can flip a few of them. And signals fade fast: received power falls with the <b>square</b> of the distance, so the further the sender, the more noise matters.</p><span class="key">Double the distance and you get a quarter of the power.</span>`,
        v: F.plot([{ f: (d) => 1 / (d * d), c: "violet", width: 3 }], { x: [1, 4], y: [0, 1], w: 520, h: 190, xl: "distance", yl: "received power", marks: [[1, "full", "teal", 1], [2, "¼", "amber", 0.25], [4, "1/16", "rose", 0.0625]] }),
        c: { q: "A probe moves from 10 million km away to 20 million km away. What happens to the power the receiver picks up?", o: ["It halves", "It falls to a quarter", "It stays the same", "It falls to a tenth"], a: 1, why: "Power ∝ 1 / distance². Twice as far means 1 / 2² = ¼ of the power, so the signal sinks towards the noise." } },
      { t: "Where bits get flipped", b: `<p>The same problem shows up in very different places. Each row has a <b>source</b>, a <b>medium</b> and a <b>destination</b>, and noise in the medium can flip any bit.</p>`,
        v: table(["Source", "Medium", "Destination"], [["Wi-Fi card", "radio wave", "Wi-Fi card"], ["RAM", "disk drive", "RAM"], ["printer", "QR code", "phone camera"], ["Voyager probe", "radio wave", "Earth"], ["RAM", "CD", "RAM"]], 520),
        c: { q: "Which of these is NOT a channel where noise can corrupt bits?", o: ["A scratched CD read by a laser drive", "A dirty QR code scanned by a phone", "A copy made inside a noise-free simulator", "A deep-space radio link to Earth"], a: 2, why: "Noise belongs to physical media. A perfect simulation never flips a bit unless you make it, but a scratched disc, a smudged code and a faint radio signal all can." } },
      { t: "Redundancy: taken out, then put back", b: `<p><b>Compression</b> strips redundancy to save space. <b>Error coding</b> deliberately adds a little back, so the receiver can tell when something flipped. The price is the <b>code rate</b>: data bits divided by transmitted bits.</p><p>Send 4 data bits plus 3 check bits and the rate is <b>4/7</b>.</p>`,
        v: F.flow([{ t: "Raw data" }, { t: "Compress", s: "remove redundancy", c: "blue" }, { t: "Add check bits", s: "add a little back", c: "violet" }, { t: "Noisy channel", c: "rose" }, { t: "Check and fix", c: "teal" }]),
        c: { q: "A scheme sends 8 data bits plus 4 check bits. What is its rate?", o: ["1/2", "2/3", "3/2", "1/12"], a: 1, why: "8 data bits out of 8 + 4 = 12 sent: 8/12 = 2/3. Rate is always data over total, so it is below 1." } },
      { t: "Two ways to cope", b: `<p><b>Reverse error correction (REC):</b> the receiver only <i>detects</i> errors. If the check fails it sends a <b>NAK</b> and the sender transmits again. This is <b>ARQ</b>, Automatic Repeat reQuest.</p><p><b>Forward error correction (FEC):</b> enough redundancy is sent that the receiver can <i>repair</i> the damage itself, with no conversation.</p>`,
        v: F.compare({ title: "Reverse (detect + ARQ)", c: "blue", body: "Check fails → <b>NAK</b> → sender resends.<br>Simple codes, but needs a return channel." }, { title: "Forward (FEC)", c: "violet", body: "Receiver repairs the data itself.<br>Cleverer codes, no resend, no return channel." }),
        c: { q: "Which scheme can only work if the receiver is able to talk back to the sender?", o: ["Forward error correction", "Detect and resend (ARQ)", "Both need it", "Neither needs it"], a: 1, why: "ARQ is a conversation: NAK, then resend. FEC is one-way: the receiver fixes things alone." } },
      { t: "When you cannot ask again", b: `<p>Resending only works when there is time and a way back. Detection alone is <b>unsuited</b> to:</p><ul><li><b>Real-time</b> traffic: a resent frame of a live call arrives too late to matter.</li><li><b>Simplex</b> links such as broadcasting: there is no feedback channel at all.</li><li><b>Very long delays</b>, like a spacecraft light-minutes away.</li></ul>`,
        v: table(["Situation", "Resend possible?", "Better choice"], [["Downloading a file", "yes, cheap", "detect + resend"], ["Live video call", "arrives too late", "correct on arrival"], ["TV broadcast (simplex)", "no feedback", "correct on arrival"], ["Spacecraft, minutes away", "a very slow resend", "correct on arrival"]], 560),
        c: { q: "Why is detect-and-resend a poor fit for a live radio broadcast?", o: ["Radio signals cannot carry check bits", "Listeners have no channel to send a NAK back", "Resent bits would be corrupted again", "Check bits make the signal too long to broadcast"], a: 1, why: "Broadcasting is simplex: one sender, many receivers and no return path. With no way to ask again, the receiver must be able to fix the damage itself." } },
      { t: "Watch ARQ run", b: `<p>Step through one frame: the sender adds an even-parity bit, noise flips a bit, the receiver notices, sends a <b>NAK</b> and the sender tries again.</p>`, v: (box, life) => arqRun(box, life) },
    ],
    guide: [
      "Slide the <b>flip chance</b> up and down and watch each scheme's row change.",
      "Compare the bits-sent column with the wrong-blocks column: nothing is free.",
      "Answer the questions after the demo.",
    ],
  };

  // prettier-ignore
  function arqRun(box, life) {
    const DATA = "1101001";
    const frame = DATA + par(bitsOf(DATA)); // 11010010
    const hit = 3; // noise flips this index
    const bad = bitsOf(frame); bad[hit] ^= 1;
    function* frames() {
      const mk = (o) => ({ snd: frame, ch: null, rcv: null, flip: -1, reply: "", note: "", ...o });
      yield mk({ cap: `The sender has data <b>${DATA}</b>. Its even-parity bit is <b>${par(bitsOf(DATA))}</b> (${ones(bitsOf(DATA))} ones is already even). Frame: <b>${frame}</b>.`, note: "ready to send" });
      yield mk({ ch: str(bad), flip: hit, cap: `The frame is on the wire. Noise flips bit <b>${hit + 1}</b> (shown in red).`, note: "in transit" });
      yield mk({ ch: str(bad), rcv: str(bad), flip: hit, cap: `The receiver counts the 1s: there are <b>${ones(bad)}</b>, an odd number. The parity rule is broken.`, note: `${ones(bad)} ones: odd` });
      yield mk({ rcv: str(bad), flip: hit, reply: "NAK", ask: { q: "The count is odd, so the check failed. What does the receiver send back?", pick: ".c6-ch", a: ["NAK"], why: "A failed check means 'send it again': a negative acknowledgement, <b>NAK</b>. The receiver cannot fix the bit, only report it." }, cap: `Check failed, so the receiver sends a <b>NAK</b>. It knows <i>something</i> flipped, but not which bit.`, note: "NAK sent" });
      yield mk({ ch: frame, cap: `The sender retransmits the same frame <b>${frame}</b>. This time the noise misses it.`, note: "retransmission" });
      yield mk({ rcv: frame, reply: "ACK", mood: "love", cap: `Now ${ones(bitsOf(frame))} ones: even. The receiver sends an <b>ACK</b> and delivers <b>${DATA}</b>. The cost was one extra transmission.`, note: "ACK: delivered" });
    }
    const showFrame = (s, flip) => (s ? cellRow(bitsOf(s).map((b, i) => cell(b, { c: i === flip ? "rose" : i === 7 ? "amber" : undefined, w: 30 }))) : `<div class="faint" style="height:38px;line-height:38px">-</div>`);
    simpleRun(box, life, {
      code: ["sender: frame = data + even parity bit", "noise may flip bits in transit", "receiver: count the 1s", "odd? send NAK; the sender resends", "even? send ACK and keep the data"],
      frames,
      html: (f) => `<div class="c6-row" style="align-items:stretch"><div class="c6-box"><h4>Sender</h4>${showFrame(f.snd)}</div><div class="c6-box"><h4>Wire</h4>${showFrame(f.ch, f.flip)}</div><div class="c6-box"><h4>Receiver</h4>${showFrame(f.rcv, f.flip)}</div></div>
        <div class="c6-note">${f.note}</div><div class="c6-row">${["ACK", "NAK"].map((o) => `<span class="c6-ch" data-k="${o}" style="${f.reply === o ? `border-color:var(--${o === "NAK" ? "rose" : "teal"})` : ""}">${o}</span>`).join("")}</div>`,
    });
  }

  // a seeded simulation of four ways to send an 8-bit block over a channel that flips each bit with chance p
  // prettier-ignore
  function simulate(p, B = 3000) {
    const R = mulberry(11), flip = () => (R() < p ? 1 : 0), rbits = (n) => Array.from({ length: n }, () => (R() < 0.5 ? 1 : 0));
    let w = 0;
    for (let b = 0; b < B; b++) { let bad = 0; for (let i = 0; i < 8; i++) bad |= flip(); w += bad; }
    const none = w / B;
    let tx = 0; w = 0;
    for (let b = 0; b < B; b++) { rbits(8); for (let t = 0; t < 60; t++) { tx++; let f = 0, bad = 0; for (let i = 0; i < 9; i++) { const x = flip(); f ^= x; if (i < 8) bad |= x; } if (!f) { w += bad; break; } } }
    const parity = { wrong: w / B, tx: tx / B };
    w = 0;
    for (let b = 0; b < B; b++) { let bad = 0; for (let i = 0; i < 8; i++) if (flip() + flip() + flip() >= 2) bad = 1; w += bad; }
    const rep = w / B;
    w = 0;
    for (let b = 0; b < B; b++) { let bad = 0; for (let n = 0; n < 2; n++) { const d = rbits(4), r = hEnc(d); for (let i = 0; i < 7; i++) r[i] ^= flip(); if (str(hData(hFix(r))) !== str(d)) bad = 1; } w += bad; }
    return { none, parity, rep, ham: w / B };
  }

  reg({
    id: "a6-noise",
    order: 1,
    num: "6.1",
    title: "Noise and redundancy",
    blurb: "Why bits flip, why we add redundancy, and the difference between detect-and-resend and fix-on-arrival.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Send many random 8-bit blocks through a noisy channel using four different schemes (seeded, so each flip chance gives the same run every time).",
        ),
      );
      let p = 0.05;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Four ways to send a block</h2><span class="faint">each bit flips with the chance you choose</span></div>
        <div class="controls" id="sl"></div><div id="tb"></div><div class="callout" id="msg" style="min-height:48px"></div></div>`);
      root.appendChild(card);
      const sl = N.slider("Flip chance per bit", 0.01, 0.2, 0.01, p, (v) => `${Math.round(v * 100)}%`);
      sl.onInput((v) => {
        p = v;
        draw();
      });
      qs("#sl", card).appendChild(sl);
      const pc = (x) => (x * 100).toFixed(x < 0.1 ? 1 : 0) + "%";
      // prettier-ignore
      function draw() {
        const s = simulate(p);
        qs("#tb", card).innerHTML = table(["Scheme", "Bits sent per 8 data bits", "Wrong blocks delivered", "Resends"], [
          { c: ["Send as it is", "8", pc(s.none), "none"] },
          { c: ["Parity bit + resend (ARQ)", (9 * s.parity.tx).toFixed(1), pc(s.parity.wrong), `${s.parity.tx.toFixed(2)} sends per block`] },
          { c: ["Repeat every bit 3 times (FEC)", "24", pc(s.rep), "none"] },
          { c: ["Hamming(7,4) twice (FEC)", "14", pc(s.ham), "none"] },
        ], 720);
        qs("#msg", card).className = "callout " + (p > 0.1 ? "amber" : "teal");
        qs("#msg", card).innerHTML = `At <b>${Math.round(p * 100)}%</b>: sending as it is corrupts <b>${pc(s.none)}</b> of blocks. The ARQ row pays in <i>resends</i> (its cost grows with noise), while the two FEC rows pay a <i>fixed</i> number of extra bits whatever the noise.`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a6-noise-1",
          q: "The noise gets worse. Which scheme's cost per block (bits actually put on the wire) grows because of it?",
          opts: [
            "Parity + resend: each failure means another send",
            "Repeat 3 times: it must repeat the bits more often",
            "Hamming(7,4): its codewords grow longer to cope",
          ],
          a: 0,
          why: "Repetition always sends 24 bits and Hamming always sends 14. Only the resend scheme's cost depends on how often a check fails.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-noise-2",
          q: "A satellite broadcasts to thousands of dishes and none can reply. Which row of the table is simply unavailable to it?",
          opts: ["Parity bit + resend", "Repeat every bit 3 times", "Hamming(7,4) twice"],
          a: 0,
          why: "Resending needs the receiver to send a NAK back. With no return channel only the forward-correcting rows (repetition, Hamming) are possible.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Signals weaken with distance (power ∝ 1/distance²), so noise flips bits.",
            "Compression removes redundancy; error coding adds a little back. Rate = data bits / bits sent.",
            "Reverse correction detects and asks again (ARQ). Forward correction repairs by itself.",
            "Detection alone is unsuited to real-time and simplex links.",
          ],
          "Redundancy is what lets a receiver notice, or even repair, a flipped bit.",
        ),
      );
    },
  });

  /* ============================================================
     6.9 Beyond Hamming: detect or correct, and the bigger codes
     ============================================================ */
  const pFail = (n, p) => 1 - Math.pow(1 - p, n) - n * p * Math.pow(1 - p, n - 1); // chance a block has 2 or more flips

  L["a6-codes"] = {
    sum: "Detection codes (parity, CRC) are simple but need a resend; correction codes (Hamming and its descendants) are cleverer but work one-way. Longer Hamming codes waste less, but fail once a block takes two hits. Reed-Solomon, turbo and LDPC codes carry the same ideas into CDs, QR codes, phones and deep space.",
    // prettier-ignore
    steps: [
      { t: "Detect or correct?", b: `<p><b>Error detection</b> only learns <i>that</i> data is wrong. The codes are simple and cheap, but a retransmission is usually needed, which makes them unsuited to <b>simplex</b> links.</p><p><b>Error correction</b> repairs the data. The codes are more complex, but no retransmission is needed, so they are required wherever there is <b>no feedback channel</b>.</p>`,
        v: F.compare({ title: "Detection (parity, CRC)", c: "blue", body: "Simple codes<br>Needs retransmission<br>Unsuited to simplex links" }, { title: "Correction (Hamming...)", c: "violet", body: "More complex codes<br>No retransmission<br>Works with no feedback channel" }),
        c: { q: "A sensor streams to a base station that never replies. Which kind of code is required?", o: ["Error detection alone", "Error correction (forward)", "Either one works equally well", "No code: the sensor can simply send each reading again"], a: 1, why: "Detection needs a NAK to be useful. With no feedback channel the receiver has to repair errors itself, which means forward correction." } },
      { t: "Pick the right tool", b: `<p>Ask two questions: can the receiver talk back, and can a resend arrive in time? If both are yes, a cheap detecting code plus ARQ is enough. If either is no, spend the extra bits on correction.</p>`,
        v: table(["Situation", "Talk back?", "Resend in time?", "Use"], [["Web page download", "yes", "yes", "CRC + resend"], ["Live phone call", "yes", "no", "correction"], ["Probe near Neptune", "yes, but hours later", "no", "correction"], ["Radio station", "no", "n/a", "correction"]], 600),
        c: { q: "A video call has a back channel, but a resent packet would arrive after its frame was shown. What should it rely on?", o: ["A CRC and a resend", "Forward error correction", "Parity bits only", "Nothing: it must accept every error"], a: 1, why: "A resend is useless if it arrives too late, so the receiver needs enough redundancy to repair damage straight away." } },
      { t: "Longer Hamming codes", b: `<p>$r$ check bits can name $2^r - 1$ positions, so a Hamming code has $n = 2^r - 1$ bits, of which $k = n - r$ carry data. Hamming(7,4), (15,11), (31,26)... each waste less: the rate $k/n$ climbs towards 1.</p>`,
        v: F.bars([2, 3, 4, 5, 6].map((r) => { const n = 2 ** r - 1; return [`(${n},${n - r})`, (n - r) / n, r === 3 ? "teal" : "violet", `r = ${r}`]; }), { max: 1, fmt: (v) => v.toFixed(2) }),
        c: { q: "A Hamming code uses 4 check bits. How many bits in a codeword, and how many carry data?", o: ["15 bits, 11 data", "16 bits, 12 data", "7 bits, 4 data", "31 bits, 26 data"], a: 0, why: "$2^4 - 1 = 15$ positions, leaving $15 - 4 = 11$ data bits: Hamming(15,11)." } },
      { t: "Why not make blocks huge?", b: `<p>Every Hamming codeword repairs <b>one</b> flip. A longer block holds more bits, so the chance of two or more flips in the <i>same</i> block rises, and then the repair goes wrong. Efficiency climbs; reliability falls.</p><p>Hamming(7,4) has minimum distance 3: it can correct 1 error <i>or</i> detect 2, not both at once. One extra overall parity bit makes distance 4, which corrects 1 and detects 2 (<b>SECDED</b>).</p>`,
        v: F.compare({ title: "Distance 3 (Hamming 7,4)", c: "amber", body: "corrects 1 error<br><i>or</i> detects 2<br>a double error is miscorrected" }, { title: "Distance 4 (SECDED)", c: "teal", body: "corrects 1 error<br><b>and</b> detects 2<br>a double error is flagged" }),
        c: { q: "Why does a very long Hamming block become unreliable on a noisy link?", o: ["Its check bits stop working above a limit of 15 bits", "It is likelier to take two flips and repairs only one", "Longer codewords can no longer be decoded at all", "Its code rate falls steadily towards zero as it grows"], a: 1, why: "The single-error repair is still perfect, but the more bits in a block the more likely it is to be hit twice. Then the syndrome points at the wrong place." } },
      { t: "Reed-Solomon codes", b: `<p>Irving Reed and Gustave Solomon introduced these codes in 1960. They work on groups of bits (symbols), so a burst that wrecks a run of neighbouring bits damages only a few symbols. They protect <b>CDs, DVDs, Blu-ray discs, QR codes, DSL and WiMAX, DVB and ATSC broadcasts, RAID 6 disk arrays and satellite links</b>.</p>`,
        v: table(["Where", "What gets damaged"], [["CD, DVD, Blu-ray", "scratches and dust"], ["QR code", "dirt, creases, glare"], ["Satellite and broadcast (DVB, ATSC)", "weak, noisy radio"], ["RAID 6 storage", "failed disk sectors"]], 540),
        c: { q: "A QR code survives a smudge across part of it. Which family of codes is mainly responsible?", o: ["Reed-Solomon codes", "Parity bits", "Repetition code", "A single CRC"], a: 0, why: "QR codes use Reed-Solomon, which repairs damaged symbols. A CRC or parity bit could only report that something is wrong." } },
      { t: "Turbo and LDPC codes", b: `<p><b>Turbo codes</b> (1990-91) were the first practical codes to come close to the <b>channel capacity</b>, the best rate a noisy channel allows. They are used in 3G/4G mobile and deep-space links.</p><p><b>LDPC codes</b> (Robert Gallager, 1960) are built from a <b>sparse bipartite graph</b>: bits on one side, parity checks on the other, each check touching only a few bits. They also approach capacity and are used in DVB-S2 and Wi-Fi.</p>`,
        v: F.graph({ nodes: { v1: { x: 40, y: 40, label: "v1", c: "teal" }, v2: { x: 130, y: 40, label: "v2", c: "teal" }, v3: { x: 220, y: 40, label: "v3", c: "teal" }, v4: { x: 310, y: 40, label: "v4", c: "teal" }, v5: { x: 400, y: 40, label: "v5", c: "teal" }, c1: { x: 90, y: 170, label: "c1", c: "violet" }, c2: { x: 220, y: 170, label: "c2", c: "violet" }, c3: { x: 350, y: 170, label: "c3", c: "violet" } }, edges: [["v1", "c1"], ["v2", "c1"], ["v4", "c1"], ["v2", "c2"], ["v3", "c2"], ["v5", "c2"], ["v1", "c3"], ["v4", "c3"], ["v5", "c3"]], w: 440, h: 210, r: 20 }),
        c: { q: "What makes an LDPC code 'low density'?", o: ["Each parity check involves only a few of the bits", "It uses fewer than 8 bits per block in total", "Most of its codewords are all zeros in practice", "It stores its data at a low signal power"], a: 0, why: "The graph connecting bits to checks is sparse: each check touches only a few bits (and each bit only a few checks)." } },
    ],
    guide: [
      "Choose a flip chance, then slide <b>r</b> (check bits) and watch the rate rise.",
      "Look at the chance-a-block-fails column: where does it cross 50%?",
      "Answer the questions after the demo.",
    ],
  };

  reg({
    id: "a6-codes",
    order: 9,
    num: "6.9",
    title: "Beyond Hamming",
    blurb:
      "Detect or correct? Longer Hamming codes waste less but fail sooner, then Reed-Solomon, turbo and LDPC codes.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Each row is a Hamming code with r check bits. 'Fails' means the block takes two or more flips, which a distance-3 code cannot repair.",
        ),
      );
      let r = 3,
        p = 0.01;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Block size trade-off</h2><span class="faint">n = 2<sup>r</sup> − 1 bits, k = n − r data bits</span></div>
        <div class="controls"><span class="faint">flip chance per bit</span><span id="pp"></span></div><div class="controls" id="sl"></div><div id="tb"></div><div class="callout" id="msg" style="min-height:48px"></div></div>`);
      root.appendChild(card);
      const pc = (x) => (x * 100 < 10 ? (x * 100).toFixed(1) : Math.round(x * 100)) + "%";
      qs("#pp", card).appendChild(
        N.seg(
          [
            ["0.001", "0.1%"],
            ["0.01", "1%"],
            ["0.03", "3%"],
          ],
          String(p),
          (v) => {
            p = +v;
            draw();
          },
        ),
      );
      const sl = N.slider("Check bits r", 2, 8, 1, r, (v) => v);
      sl.onInput((v) => {
        r = v;
        draw();
      });
      qs("#sl", card).appendChild(sl);
      // prettier-ignore
      function draw() {
        const rows = [];
        for (let q = 2; q <= 8; q++) { const n = 2 ** q - 1, k = n - q; rows.push({ c: [q, `(${n}, ${k})`, (k / n).toFixed(2), pc(pFail(n, p))], hl: q === r }); }
        qs("#tb", card).innerHTML = table(["r", "Hamming(n, k)", "Rate k/n", "Block fails"], rows, 560);
        const n = 2 ** r - 1, k = n - r;
        qs("#msg", card).className = "callout " + (pFail(n, p) > 0.1 ? "rose" : "teal");
        qs("#msg", card).innerHTML = `Hamming(${n}, ${k}) at ${pc(p)} flips: rate <b>${(k / n).toFixed(2)}</b>, but <b>${pc(pFail(n, p))}</b> of blocks take two or more flips and cannot be repaired.`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a6-codes-1",
          q: "Keep the flip chance at 1% and slide r from 3 up to 6. What happens to the rate and to the chance a block fails?",
          opts: [
            "Rate rises and the fail chance rises",
            "Rate rises and the fail chance falls",
            "Rate falls and the fail chance rises",
          ],
          a: 0,
          why: "A longer block spends its check bits more efficiently (rate up), but it holds more bits that can be hit, so two flips in one block become more likely.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-codes-2",
          q: "At 3% flips, which block size fails most often: r = 3, r = 5 or r = 7?",
          opts: ["r = 3 (7 bits)", "r = 5 (31 bits)", "r = 7 (127 bits)"],
          a: 2,
          why: "More bits per block means more chances for two flips: about 2% for 7 bits, about 24% for 31 bits and about 90% for 127 bits.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Detection (parity, CRC): simple, needs a resend. Correction (Hamming...): cleverer, works one-way.",
            "Hamming codes have n = 2^r − 1; the rate k/n approaches 1 as r grows, but each block still repairs only one flip.",
            "Distance 3 corrects 1 or detects 2; adding a parity bit (distance 4) corrects 1 and detects 2.",
            "Reed-Solomon (1960): CDs, QR codes, DVB, RAID 6. Turbo (1990-91): 3G/4G, deep space. LDPC (Gallager, 1960): sparse graph, DVB-S2, Wi-Fi.",
          ],
          "Pick the code to fit the channel: resend if you can, correct if you must.",
        ),
      );
    },
  });
  Object.assign((NIC.shared.algoP6 = NIC.shared.algoP6 || {}), {
    COL,
    xor,
    par,
    bitsOf,
    str,
    ones,
    mulberry,
    hEnc,
    hChecks,
    hSyn,
    hFix,
    hData,
    polyMod,
    crcRem,
    polyTex,
    cell,
    cellRow,
    simpleRun,
    chips,
    table,
    crcRegister,
    venn,
    crcDiagram,
  });
})();
