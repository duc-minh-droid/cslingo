/* Phase 6 — Error Detection & Correction: parity, CRC, Hamming(7,4) */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ============ 6.1 Parity & CRC ============ */
  L["a6-crc"] = {
    sum: "Noise flips bits. To <b>detect</b> it, send a little extra information that depends on the data. A parity bit catches any odd number of flips. A <b>CRC</b> divides the message by a fixed pattern and sends the remainder, which catches far more.",
    steps: [
      {
        t: "Parity: one extra bit",
        b: `<p>Add one bit so the total number of 1s is <b>even</b>. The receiver counts the 1s: if the count is odd, something flipped.</p>`,
        v: F.frames([
          {
            t: "Send 1011001 + parity 0 (four 1s: even)",
            v: F.cells(["1", "0", "1", "1", "0", "0", "1", { v: "0", c: "amber", sub: "parity" }]),
          },
          {
            t: "One bit flips: five 1s, odd → <b>detected</b>",
            v: F.cells(["1", { v: "1", c: "rose" }, "1", "1", "0", "0", "1", { v: "0", c: "amber" }]),
          },
          {
            t: "Two bits flip: six 1s, even → <b>missed</b>",
            v: F.cells(["1", { v: "1", c: "rose" }, "1", "1", { v: "1", c: "rose" }, "0", "1", { v: "0", c: "amber" }]),
          },
        ]),
        c: {
          type: "cat",
          q: "A byte is sent with one even-parity bit. For each error pattern, does parity <b>detect</b> it or <b>miss</b> it?",
          buckets: ["Detected", "Missed"],
          items: [
            ["1 bit flipped", 0],
            ["2 bits flipped", 1],
            ["3 bits flipped", 0],
            ["4 bits flipped", 1],
          ],
          hint: "Parity only counts whether the number of 1s is odd or even. What does an even number of flips do to that count?",
          why: "Parity only checks odd vs even. An odd number of flips (1, 3) changes it and is detected. An even number (2, 4) restores it and is missed. It can't say <i>which</i> bit flipped, either.",
        },
      },
      {
        t: "CRC = long division with XOR",
        b: `<p>A <b>cyclic redundancy check (CRC)</b> treats the bits as a polynomial and divides by a fixed <b>generator</b>, here 1101. It's ordinary long division, except subtraction is <b>XOR</b> (no borrows). Append zeros first, one per generator degree.</p>`,
        v: `<pre class="fig-wrap mono" style="font-size:14px;line-height:1.55;margin:0">  1011000   ← message 1011 + three 0s
^ 1101
  ────
  0110      ← bring down the next bit…
   1100
 ^ 1101
   ────
   0001     ← bring down the last two bits
      100   ← shorter than 1101: stop

remainder = <b style="color:var(--amber-ink)">100</b>  →  send 1011<b style="color:var(--amber-ink)">100</b></pre>`,
      },
      {
        t: "Why the receiver can check it",
        b: `<p>Appending the remainder makes the whole frame divide <b>exactly</b> by the generator. The receiver divides again: remainder 0 means clean, anything else means corrupted.</p><span class="key">A good generator catches every single-bit error, every burst shorter than its degree, and much more.</span>`,
        v: F.compare(
          { title: "Clean frame 1011100", c: "teal", body: "÷ 1101 → remainder <b>000</b> ✓" },
          { title: "One bit flipped", c: "rose", body: "÷ 1101 → remainder <b>≠ 000</b>: error detected" },
        ),
        c: {
          q: "Why can't a CRC protect against a deliberate attacker?",
          o: [
            "Its checksum is too short to be secure",
            "Its maths is public and linear",
            "It's built on XOR, which is weak",
          ],
          a: 1,
          why: "A CRC is built to catch random noise. Protection against tampering needs cryptographic hashes or MACs (Phase 8).",
        },
      },
    ],
    guide: [
      "Click bits in the parity strip. One flip is caught; a second flip hides the first.",
      "Press <b>Next XOR</b> to step through the CRC division and check each XOR yourself.",
      "Confirm the final remainder: 100.",
    ],
  };

  N.register({
    id: "a6-crc",
    subject: "algo",
    lecture: 6,
    order: 1,
    num: "6.1",
    title: "Parity to CRC",
    blurb: "Flip bits and watch detection succeed and fail — then divide a message by a generator polynomial by hand.",
    render(root) {
      root.appendChild(
        header(this, "Message <b>1011</b>, generator <b>1101</b> (degree 3 → pad 3 zeros → dividend <b>1011000</b>)."),
      );
      // --- parity strip ---
      const bits = [1, 0, 1, 1, 0, 0, 1];
      const pcard = el(
        `<div class="card"><div class="card-head"><h3>Parity strip</h3><span class="faint">click bits to flip; last bit = even parity</span></div><div id="strip"></div><div class="callout" id="pmsg"></div></div>`,
      );
      root.appendChild(pcard);
      function drawStrip() {
        const parity = bits.slice(0, -1).reduce((a, b) => a + b, 0) % 2;
        const ok = parity === bits[6];
        qs("#strip", pcard).innerHTML =
          `<div class="genome">${bits.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:34px;height:34px;font-size:15px;${i === 6 ? "outline:2px solid var(--amber)" : ""}">${b}</button>`).join("")}</div>`;
        qsa(".gene", pcard).forEach(
          (b) =>
            (b.onclick = () => {
              const i = +b.dataset.i;
              bits[i] ^= 1;
              drawStrip();
            }),
        );
        qs("#pmsg", pcard).className = "callout " + (ok ? "teal" : "rose");
        qs("#pmsg", pcard).innerHTML = ok
          ? "Parity holds — either no error or an <b>even</b> number of flips (which parity can't see)."
          : "Parity violated — an <b>odd</b> number of bits flipped. Detected, but not located or corrected.";
      }
      drawStrip();
      // --- CRC division stepper ---
      const steps = [
        { line: "1011000", xor: "1101", res: "0110", note: "First 4 bits ≥ generator: XOR with 1101" },
        { line: " 1100", xor: "1101", res: "0001", note: "Bring down next bit → 1100 ≥ 1101: XOR again" },
        { line: "    100", xor: "—", res: "100", note: "Remaining 3 bits < generator → remainder = 100" },
      ];
      let si = 0;
      const ccard =
        el(`<div class="card"><div class="card-head"><h3>CRC division stepper</h3><span class="faint">1011000 ÷ 1101</span></div>
        <div class="controls"><button class="btn primary" id="nx">Next XOR ▸</button><button class="btn ghost" id="rs">Reset</button></div>
        <pre class="mono" id="div" style="font-size:15px;line-height:1.7"></pre><div class="callout" id="cr"></div></div>`);
      root.appendChild(ccard);
      function drawDiv() {
        const shown = steps
          .slice(0, si + 1)
          .map((s) => `${s.line}\n^ ${s.xor}\n= ${s.res}`)
          .join("\n\n");
        qs("#div", ccard).textContent = "1011000 ÷ 1101\n\n" + shown;
        qs("#cr", ccard).innerHTML =
          si === steps.length - 1
            ? `<b>Remainder 100</b> → codeword = 1011<b>100</b>. Receiver divides the whole thing by 1101: remainder 0 = clean, nonzero = corrupted.`
            : steps[si].note;
      }
      qs("#nx", ccard).onclick = () => {
        if (si < 2) {
          si++;
          drawDiv();
        }
      };
      qs("#rs", ccard).onclick = () => {
        si = 0;
        drawDiv();
      };
      drawDiv();
      root.appendChild(
        predict({
          id: "a6-crc-1",
          q: "Message 1011, generator 1101. The transmitted frame ends in…",
          opts: ["the generator", "remainder 100", "the message reversed"],
          a: 1,
          why: "Sender computes remainder of padded message, appends it. Receiver divides and expects 0.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Parity: cheap, catches odd flip counts only.",
            "CRC: mod-2 polynomial division; the appended remainder makes the frame 'divisible'.",
            "Designed for <b>random</b> corruption — its algebra is too simple to resist adversaries.",
          ],
          "Redundancy buys detection; richer algebra buys better detection.",
        ),
      );
    },
  });

  /* ============ 6.2 Hamming ============ */
  L["a6-hamming"] = {
    sum: "Parity says <i>something</i> flipped, but not where. Hamming codes use three parity bits with <b>overlapping</b> regions, and the checks that fail spell out the position of the flipped bit in binary.",
    steps: [
      {
        t: "Parity bits live at 1, 2, 4",
        b: `<p>A 7-bit Hamming codeword puts <b>parity bits at positions 1, 2 and 4</b> (the powers of two) and your 4 data bits at 3, 5, 6 and 7.</p>`,
        v: F.cells([
          { v: "p1", sub: "1", c: "violet" },
          { v: "p2", sub: "2", c: "violet" },
          { v: "d", sub: "3" },
          { v: "p4", sub: "4", c: "violet" },
          { v: "d", sub: "5" },
          { v: "d", sub: "6" },
          { v: "d", sub: "7" },
        ]),
      },
      {
        t: "Each parity bit checks a different group",
        b: `<p>Write each position in binary. Parity bit <b>p1</b> checks every position whose binary ends in 1; <b>p2</b> checks those with a 1 in the middle; <b>p4</b> those with a 1 at the front.</p>`,
        v: `<table class="t" style="max-width:520px;text-align:center"><tr><th>position</th>${[1, 2, 3, 4, 5, 6, 7].map((i) => `<th>${i}</th>`).join("")}</tr><tr><td class="faint">binary</td>${[1, 2, 3, 4, 5, 6, 7].map((i) => `<td class="mono">${i.toString(2).padStart(3, "0")}</td>`).join("")}</tr>${[
          [4, "p4"],
          [2, "p2"],
          [1, "p1"],
        ]
          .map(
            ([bit, n]) =>
              `<tr><td><b style="color:var(--violet-ink)">${n}</b></td>${[1, 2, 3, 4, 5, 6, 7].map((i) => `<td>${i & bit ? "●" : ""}</td>`).join("")}</tr>`,
          )
          .join("")}</table>`,
      },
      {
        t: "Failed checks spell the position",
        b: `<p>Flip bit 6 (binary <b>110</b>). It's in p4's group and p2's group, but not p1's. So exactly p4 and p2 fail. Read the failures as p4 p2 p1 = <b>1 1 0</b> = 6. That's the <b>syndrome</b>, and it points straight at the broken bit.</p>`,
        v: F.frames([
          { t: "Send 1011 → codeword 0110011", v: F.cells(["0", "1", "1", "0", "0", "1", "1"]) },
          { t: "Bit 6 flips in transit", v: F.cells(["0", "1", "1", "0", "0", { v: "0", c: "rose", sub: "6" }, "1"]) },
          {
            t: "Checks: p4 ✗ p2 ✗ p1 ✓ → 110 = 6 → flip it back",
            v: F.cells([
              { v: "1", c: "rose", sub: "p4" },
              { v: "1", c: "rose", sub: "p2" },
              { v: "0", c: "teal", sub: "p1" },
              "=",
              { v: "6", c: "amber" },
            ]),
          },
        ]),
        c: {
          type: "match",
          q: "In a 7-bit Hamming codeword, match each pattern of failed checks to the <b>position</b> of the flipped bit.",
          pairs: [
            ["p4 = 1, p2 = 1, p1 = 0", "Position 6"],
            ["p4 = 1, p2 = 0, p1 = 1", "Position 5"],
            ["p4 = 0, p2 = 1, p1 = 1", "Position 3"],
            ["p4 = 1, p2 = 1, p1 = 1", "Position 7"],
          ],
          hint: "Read the checks p4 p2 p1 as a binary number, with a failed check as 1.",
          why: "110 in binary is 6, 101 is 5, 011 is 3 and 111 is 7. Each position's binary number is exactly the set of checks it belongs to.",
        },
      },
      {
        t: "The limit: one error",
        b: `<p>Hamming(7,4) corrects <b>exactly one</b> flipped bit. With two flips, the syndrome still points somewhere, but at an innocent bit, so the "fix" makes things worse. Adding one extra overall parity bit (<b>SECDED</b>) lets you at least <i>detect</i> double errors.</p>`,
      },
    ],
    guide: [
      "Click one bit of the codeword to corrupt it. The syndrome names its position.",
      "Press <b>Correct</b>. The codeword is fixed.",
      "Now flip <i>two</i> bits and press <b>Correct</b>. Is the codeword repaired?",
    ],
  };

  N.register({
    id: "a6-hamming",
    subject: "algo",
    lecture: 6,
    order: 2,
    num: "6.2",
    title: "Hamming: locate the error",
    blurb: "Encode 4 bits into 7, inject an error, and let the syndrome read out which position to fix.",
    render(root) {
      root.appendChild(header(this, ""));
      const encode = (d) => {
        const c = [0, 0, d[0], 0, d[1], d[2], d[3]]; // positions 1..7, idx0=pos1
        const p = (idxs) => idxs.reduce((a, i) => a ^ c[i], 0);
        c[0] = p([2, 4, 6]);
        c[1] = p([2, 5, 6]);
        c[3] = p([4, 5, 6]);
        return c;
      };
      let data = [1, 0, 1, 1];
      let rx = encode(data);
      const card = el(`<div class="card">
        <div class="controls"><span class="faint">data:</span><span id="din"></span><button class="btn primary" id="enc">Encode ▸</button></div>
        <div id="cw"></div>
        <div class="stat-row"><div class="stat violet"><small>Syndrome p4p2p1</small><b id="sy"></b></div><div class="stat amber"><small>Error position</small><b id="ep"></b></div></div>
        <div class="controls"><button class="btn teal" id="fix">Correct ▸</button><button class="btn ghost" id="rs">Re-encode</button></div>
        <div class="callout" id="msg"></div></div>`);
      root.appendChild(card);
      function drawData() {
        qs("#din", card).innerHTML =
          `<div class="genome">${data.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:30px;height:30px">${b}</button>`).join("")}</div>`;
        qsa("#din .gene", card).forEach(
          (b) =>
            (b.onclick = () => {
              data[+b.dataset.i] ^= 1;
              drawData();
            }),
        );
      }
      function drawCW() {
        qs("#cw", card).innerHTML =
          `<div class="genome-row"><span class="lbl">codeword (click a bit to corrupt):</span><div class="genome">${rx.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:34px;height:34px;font-size:15px">${b}</button>`).join("")}</div></div>
          <div class="mini-row" style="margin-top:6px">${rx.map((_, i) => `<span class="pill ${[0, 1, 3].includes(i) ? "violet" : ""}" style="font-size:11px">${i + 1}${[0, 1, 3].includes(i) ? " (p)" : ""}</span>`).join("")}</div>`;
        qsa("#cw .gene", card).forEach(
          (b) =>
            (b.onclick = () => {
              rx[+b.dataset.i] ^= 1;
              drawCW();
            }),
        );
        const s1 = rx[0] ^ rx[2] ^ rx[4] ^ rx[6],
          s2 = rx[1] ^ rx[2] ^ rx[5] ^ rx[6],
          s4 = rx[3] ^ rx[4] ^ rx[5] ^ rx[6];
        const syn = s4 * 4 + s2 * 2 + s1;
        qs("#sy", card).textContent = `${s4}${s2}${s1} = ${syn}`;
        qs("#ep", card).textContent = syn === 0 ? "none" : `position ${syn}`;
        qs("#msg", card).className = "callout " + (syn === 0 ? "teal" : "amber");
        qs("#msg", card).innerHTML =
          syn === 0
            ? "Clean codeword — all three parity regions hold."
            : `Syndrome names position <b>${syn}</b>. One flip → correctable. Two flips → the syndrome still points somewhere, but at a <b>wrong</b> position.`;
      }
      qs("#enc", card).onclick = () => {
        rx = encode(data);
        drawCW();
      };
      qs("#fix", card).onclick = () => {
        const s1 = rx[0] ^ rx[2] ^ rx[4] ^ rx[6],
          s2 = rx[1] ^ rx[2] ^ rx[5] ^ rx[6],
          s4 = rx[3] ^ rx[4] ^ rx[5] ^ rx[6];
        const syn = s4 * 4 + s2 * 2 + s1;
        if (syn) rx[syn - 1] ^= 1;
        drawCW();
      };
      qs("#rs", card).onclick = () => {
        rx = encode(data);
        drawCW();
      };
      drawData();
      drawCW();
      root.appendChild(
        predict({
          id: "a6-ham-1",
          q: "Two bits of a Hamming(7,4) codeword flip in transit. The receiver corrects the position its syndrome names. What happens?",
          opts: [
            "It flips a third bit, and the data is still wrong",
            "It repairs both flipped bits",
            "It notices two errors and refuses to correct",
          ],
          a: 0,
          why: "Hamming(7,4) can only repair <b>one</b> error. With two flips the failed checks spell out the XOR of the two positions, which is a third position, so the 'fix' damages an innocent bit and nothing warns the receiver. An extra overall parity bit (SECDED) would at least reveal the double error.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Data at non-power-of-2 positions; parity bits at 1, 2, 4 — each covers a binary digit of the position number.",
            "Failed parities read as binary = the error's <b>position</b>, not just its existence.",
            "Hamming(7,4): corrects 1 error, miscorrects on 2. SECDED adds one parity to detect doubles.",
          ],
          "Overlapping parity regions spell the error address in binary.",
        ),
      );
    },
  });
})();
