/* algo-p6-x-02: Phase 6: 6.2 parity and XOR, 6.4 CRC as polynomials. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const { par, bitsOf, str, ones, polyMod, crcRem, polyTex, cell, cellRow, simpleRun, chips, table } =
    (NIC.shared.algoP6 = NIC.shared.algoP6 || {});
  const reg = (m) => N.register({ subject: "algo", lecture: 6, ...m });
  /* ============================================================
     6.2 Parity and XOR
     ============================================================ */
  L["a6-parity"] = {
    sum: "XOR is addition with no carry. XOR-ing all the bits of a word gives its <b>parity</b>: 1 if the number of 1s is odd. Send one extra bit that makes the total even and the receiver can spot any odd number of flips, but nothing more.",
    // prettier-ignore
    steps: [
      { t: "XOR: addition without a carry", b: `<p>Modulo-2 arithmetic keeps only the last bit of every sum, so there is no carry. That operation is <b>XOR</b>, written ⊕. The result is <b>1 when the inputs differ</b> and 0 when they match.</p>`,
        v: table(["a", "b", "a ⊕ b"], [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], { c: ["1", "1", "<b>0</b>"], hl: true }], 360),
        c: { q: "What is 1 ⊕ 1 ⊕ 1?", o: ["0", "1", "2", "3"], a: 1, why: "1 ⊕ 1 = 0, then 0 ⊕ 1 = 1. In general, XOR of a row of bits is 1 exactly when the row holds an <b>odd</b> number of 1s." } },
      { t: "The parity bit", b: `<p>XOR all the data bits together to get the parity bit: $p = r_6 \\oplus r_5 \\oplus \\dots \\oplus r_0$. With <b>even parity</b> the sender adds that bit so the whole word, parity bit included, holds an <b>even</b> number of 1s.</p><p>ASCII <b>C</b> is <span class="mono">1000011</span>: three 1s, so p = 1 and the byte sent is <span class="mono">10000111</span>.</p>`,
        v: F.frames([
          { t: "ASCII K = 1001011: four 1s, p = 0", v: F.cells(["1", "0", "0", "1", "0", "1", "1", { v: "0", c: "amber", sub: "parity" }]) },
          { t: "ASCII C = 1000011: three 1s, p = 1", v: F.cells(["1", "0", "0", "0", "0", "1", "1", { v: "1", c: "amber", sub: "parity" }]) },
        ]),
        c: { q: "ASCII M is 1001101. What even-parity bit is sent with it?", o: ["0", "1"], a: 0, why: "1001101 has four 1s, already even, so the parity bit is 0." } },
      { t: "The receiver's check", b: `<p>The receiver XORs <b>all</b> the bits, parity bit included. A result of 0 means the 1s are still even, so the word passes. A result of 1 means an <b>odd</b> number of bits flipped: <b>detected</b>.</p><p>But two flips cancel out. The count is even again, and the error slips through.</p>`,
        v: F.frames([
          { t: "Sent 10010110. Clean: four 1s ✓", v: F.cells(["1", "0", "0", "1", "0", "1", "1", "0"]) },
          { t: "One flip: five 1s → <b>detected</b>", v: F.cells(["1", "0", { v: "1", c: "rose" }, "1", "0", "1", "1", "0"]) },
          { t: "Two flips: four 1s → <b>missed</b>", v: F.cells(["1", "0", { v: "1", c: "rose" }, "1", "0", { v: "0", c: "rose" }, "1", "0"]) },
        ]),
        c: { q: "A parity-protected byte arrives with exactly 2 bits flipped. What does the receiver conclude?", o: ["An error: two bits differ", "It looks clean: the count of 1s is even again", "Which two bits to repair", "That the sender used the wrong parity"], a: 1, why: "Parity only compares odd with even. Two flips shift the count by 0 or 2, so it stays even and the error goes unseen." } },
      { t: "Even or odd parity", b: `<p>The mirror image is <b>odd parity</b>: the sender chooses the parity bit so the total number of 1s is <b>odd</b>. Both work equally well as long as sender and receiver agree.</p><p>Example: ASCII A is <span class="mono">1000001</span> (two 1s). Even parity sends a 0; odd parity sends a 1 so the total becomes three.</p>`,
        v: F.compare({ title: "Even parity", c: "teal", body: "total 1s must be <b>even</b><br><span class=\"mono\">1000001 + 0</span>" }, { title: "Odd parity", c: "violet", body: "total 1s must be <b>odd</b><br><span class=\"mono\">1000001 + 1</span>" }),
        c: { q: "Odd parity is in use. The 7 data bits are 1100110. Which parity bit is sent?", o: ["0", "1"], a: 1, why: "1100110 has four 1s. To make the total odd you need one more 1, so the parity bit is 1." } },
      { t: "What parity cannot do", b: `<p>A single parity bit is cheap, but limited:</p><ul><li>It catches <b>any odd number</b> of flips (1, 3, 5, …).</li><li>It misses <b>any even number</b> (2, 4, 6, …).</li><li>It cannot say <b>where</b> the flip is, so it cannot correct anything.</li></ul><p>That is why the lecture asks: <i>how can we detect more bit errors?</i> The answer is the CRC, next.</p>`,
        v: table(["Bits flipped", "1", "2", "3", "4", "5"], [["Parity result", "✓ caught", "✗ missed", "✓ caught", "✗ missed", "✓ caught"]], 560),
        c: { q: "Which statement about one even-parity bit is true?", o: ["It locates the flipped bit so it can be repaired", "It detects every error pattern in a byte", "It detects any odd number of flipped bits", "It detects errors that flip an even number of bits"], a: 2, why: "Odd flip counts change the parity; even counts cancel. It never says where the flip happened." } },
      { t: "Watch the running XOR", b: `<p>XOR the bits of <span class="mono">1000011</span> one at a time with an accumulator that starts at 0. The final value is the parity bit.</p>`, v: (box, life) => parityRun(box, life) },
    ],
    guide: [
      "Pick a letter, then click bits of the sent byte to flip them.",
      "Count how many flips are caught and how many slip through.",
      "Switch between even and odd parity and watch the parity bit change.",
    ],
  };

  // prettier-ignore
  function parityRun(box, life) {
    const DATA = bitsOf("1000011");
    function* frames() {
      let acc = 0, asked = 0;
      const mk = (i, o) => ({ i, acc, ...o });
      yield mk(-1, { cap: "The accumulator starts at <b>0</b>. We will XOR in the bits left to right." });
      for (let i = 0; i < DATA.length; i++) {
        const prev = acc; acc ^= DATA[i];
        const ask = (i === 2 || i === 5) && asked < 2 ? (asked++, { q: `The accumulator is ${prev} and the next bit is ${DATA[i]}. What is ${prev} ⊕ ${DATA[i]}?`, pick: ".c6-ch", a: [String(acc)], why: `${prev} ⊕ ${DATA[i]} = ${acc}: equal bits give 0, different bits give 1.` }) : null;
        yield mk(i, { ask, cap: `Bit ${i + 1} is <b>${DATA[i]}</b>: ${prev} ⊕ ${DATA[i]} = <b>${acc}</b>.` });
      }
      yield mk(DATA.length, { mood: "love", cap: `Three 1s in total, an odd count, so the accumulator ends at <b>${acc}</b>. That is the parity bit: send <b>${str(DATA)}${acc}</b> and the total is even.` });
    }
    simpleRun(box, life, {
      code: ["acc = 0", "for each data bit: acc = acc ⊕ bit", "parity bit = acc", "send the data followed by the parity bit"],
      frames,
      html: (f) => `${cellRow(DATA.map((b, k) => cell(b, { c: k === f.i ? "violet" : k < f.i ? "teal" : undefined, w: 32 })).concat(f.i >= DATA.length ? [cell(f.acc, { c: "amber", w: 32, sub: "parity" })] : []))}
        <div class="c6-row"><span class="faint">accumulator</span>${cell(f.acc, { c: "amber", w: 40 })}</div>${chips([0, 1])}`,
    });
  }

  const ASCII = { K: "1001011", C: "1000011", M: "1001101", A: "1000001", Y: "1011001", H: "1001000" };
  reg({
    id: "a6-parity",
    order: 2,
    num: "6.2",
    title: "Parity bits and XOR",
    blurb: "XOR is addition without a carry. One extra bit catches any odd number of flips, and misses every even one.",
    render(root) {
      root.appendChild(header(this, "Pick a letter, then click bits of the transmitted byte to flip them."));
      let letter = "C",
        mode = "even",
        flipped = new Set();
      const send = () => {
        const d = bitsOf(ASCII[letter]);
        return d.concat([mode === "even" ? par(d) : par(d) ^ 1]);
      };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Send a byte with a parity bit</h2><span class="faint">last bit = parity (outlined)</span></div>
        <div class="controls"><span id="lt"></span><span id="md"></span></div>
        <div id="by"></div><div class="stat-row"><div class="stat violet"><small>Bits flipped</small><b id="nf"></b></div><div class="stat amber"><small>1s in the byte</small><b id="n1"></b></div><div class="stat teal"><small>Check</small><b id="ck"></b></div></div>
        <div class="callout" id="msg" style="min-height:48px"></div>
        <div class="controls"><button class="btn ghost" id="rs">Undo all flips</button></div>
        <div id="ex" class="faint" style="font-size:13px"></div></div>`);
      root.appendChild(card);
      qs("#lt", card).appendChild(
        N.seg(
          Object.keys(ASCII).map((k) => [k, k]),
          letter,
          (v) => {
            letter = v;
            flipped = new Set();
            draw();
          },
        ),
      );
      qs("#md", card).appendChild(
        N.seg(
          [
            ["even", "Even parity"],
            ["odd", "Odd parity"],
          ],
          mode,
          (v) => {
            mode = v;
            flipped = new Set();
            draw();
          },
        ),
      );
      // count every single and double flip of an 8-bit word that the rule catches
      // prettier-ignore
      function audit() {
        const base = send();
        let s1 = 0, s1c = 0, s2 = 0, s2c = 0;
        const want = mode === "even" ? 0 : 1;
        for (let i = 0; i < 8; i++) { const w = base.slice(); w[i] ^= 1; s1++; if (par(w) !== want) s1c++; }
        for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const w = base.slice(); w[i] ^= 1; w[j] ^= 1; s2++; if (par(w) !== want) s2c++; }
        return { s1, s1c, s2, s2c };
      }
      // prettier-ignore
      function draw() {
        const sent = send(), cur = sent.map((b, i) => (flipped.has(i) ? b ^ 1 : b));
        const want = mode === "even" ? 0 : 1, ok = par(cur) === want;
        qs("#by", card).innerHTML = `<div class="genome">${cur.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:36px;height:36px;font-size:16px;${i === 7 ? "outline:2px solid var(--amber)" : ""}${flipped.has(i) ? ";border-color:var(--rose-ink)" : ""}">${b}</button>`).join("")}</div><div class="faint mono" style="margin-top:4px">${letter} = ${ASCII[letter]} + parity bit ${sent[7]}</div>`;
        qsa(".gene", card).forEach((g) => (g.onclick = () => { const i = +g.dataset.i; flipped.has(i) ? flipped.delete(i) : flipped.add(i); draw(); }));
        qs("#nf", card).textContent = flipped.size;
        qs("#n1", card).textContent = ones(cur);
        qs("#ck", card).textContent = ok ? "passes" : "FAILS";
        const msg = qs("#msg", card);
        if (!flipped.size) { msg.className = "callout teal"; msg.innerHTML = `Clean byte: ${ones(cur)} ones, ${mode === "even" ? "even" : "odd"} as required. Flip a bit.`; }
        else if (!ok) { msg.className = "callout amber"; msg.innerHTML = `<b>Detected.</b> ${flipped.size} flip${flipped.size > 1 ? "s" : ""} (an odd number) broke the parity. But parity cannot say <i>which</i> bit, so nothing can be repaired.`; }
        else { msg.className = "callout rose"; msg.innerHTML = `<b>Missed!</b> ${flipped.size} flips (an even number) cancel out. The receiver sees a valid byte and accepts the wrong data.`; }
        const e = audit();
        qs("#ex", card).innerHTML = `Tried every flip on this byte: parity caught <b>${e.s1c}</b> of <b>${e.s1}</b> single flips and <b>${e.s2c}</b> of <b>${e.s2}</b> double flips.`;
      }
      qs("#rs", card).onclick = () => {
        flipped = new Set();
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a6-parity-1",
          q: "Even parity. The sender transmits 10000111 (the letter C plus its parity bit). The receiver gets 11000110. What does it conclude?",
          opts: [
            "It looks fine: four 1s is even, so the flips go unseen",
            "Something is wrong: the received byte differs from the sent one",
            "Something is wrong: the received byte has an odd number of 1s",
          ],
          a: 0,
          why: "The two bytes differ in bits 2 and 8 (two flips), but 11000110 still has four 1s. The receiver only counts 1s, never compares with the original, so the error is missed.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-parity-2",
          q: "Odd parity is used and the data bits are 1000001 (two 1s). Which parity bit makes the byte valid?",
          opts: ["0, keeping the two 1s", "1, making three 1s"],
          a: 1,
          why: "Odd parity needs an odd total. Two 1s plus a parity bit of 1 gives three.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "XOR is mod-2 addition: 1 when the inputs differ. A row of bits XORs to 1 exactly when it has an odd number of 1s.",
            "Even parity: add a bit so the number of 1s is even. The receiver XORs everything and expects 0.",
            "It catches every odd number of flips and misses every even number, and it never says where.",
          ],
          "One parity bit detects, never corrects, and only sees odd numbers of flips.",
        ),
      );
    },
  });

  /* ============================================================
     6.4 CRC as polynomials
     ============================================================ */
  L["a6-crcpoly"] = {
    sum: "Write bits as the coefficients of a polynomial and CRC becomes algebra: shifting is multiplying by $x^n$, the check bits are the remainder of a division, and a good generator polynomial catches every short burst.",
    // prettier-ignore
    steps: [
      { t: "Bits are polynomial coefficients", b: `<p>Read a bit string as the coefficients of a polynomial in $x$, with the leftmost bit on the highest power. The generator <b>1101</b> becomes</p>$$P(x) = 1\\cdot x^3 + 1\\cdot x^2 + 0\\cdot x^1 + 1\\cdot x^0 = x^3 + x^2 + 1$$<p>The <b>degree</b> of $P$ (here 3) is the number of CRC check bits.</p>`,
        v: F.cells([{ v: "1", sub: "x³", c: "violet" }, { v: "1", sub: "x²", c: "violet" }, { v: "0", sub: "x¹" }, { v: "1", sub: "x⁰", c: "violet" }, "→", { v: "x³ + x² + 1", c: "amber", w: 110 }], { size: 48 }),
        c: { q: "Which polynomial does the bit string 1011 represent?", o: ["$x^3+x+1$", "$x^3+x^2+1$", "$x^4+x^2+x$", "$x^3+x^2+x$"], a: 0, why: "Bits 1, 0, 1, 1 sit on $x^3, x^2, x^1, x^0$. The 0 on $x^2$ drops out, leaving $x^3 + x + 1$." } },
      { t: "Shifting is multiplying", b: `<p>Shifting a bit string left by $n$ places (adding $n$ zeros) is the same as multiplying its polynomial by $x^n$. So "append $r$ zeros" becomes $M(x)\\cdot x^r$. Addition and subtraction are both XOR, because coefficients live in modulo-2 arithmetic.</p>`,
        v: F.frames([
          { t: "M = 1011 is $x^3+x+1$", v: F.cells(["1", "0", "1", "1"]) },
          { t: "× x³ shifts three places: 1011000", v: F.cells(["1", "0", "1", "1", { v: "0", c: "amber" }, { v: "0", c: "amber" }, { v: "0", c: "amber" }]) },
          { t: "Polynomial: $x^6+x^4+x^3$", v: F.cells([{ v: "x⁶", c: "teal", w: 40 }, "+", { v: "x⁴", c: "teal", w: 40 }, "+", { v: "x³", c: "teal", w: 40 }]) },
        ]),
        c: { q: "Shifting a bit string left by 4 places multiplies its polynomial by what?", o: ["$x^4$", "$x+4$", "$4x$", "$x^{16}$"], a: 0, why: "Each place left raises every power by one. Four places raises each power by 4: multiply by $x^4$." } },
      { t: "The encoding rule", b: `<p>Pick a message $M(x)$ and a generator $P(x)$ of degree $r$. The check bits are the remainder of the shifted message, and the frame sent is the shifted message plus that remainder:</p>$$R(x) = M(x)\\,x^r \\bmod P(x),\\qquad T(x) = M(x)\\,x^r + R(x)$$<p>Since $T$ is the shifted message with its own remainder added (XOR), it divides by $P$ with remainder <b>0</b>. The receiver just divides what it gets.</p>`,
        v: F.frames([
          { t: "M = 1100101, P = 10011 ($x^4+x+1$, r = 4): shift → 11001010000", v: F.cells(["1", "1", "0", "0", "1", "0", "1", { v: "0", c: "amber" }, { v: "0", c: "amber" }, { v: "0", c: "amber" }, { v: "0", c: "amber" }]) },
          { t: "Divide by 10011: remainder R = <b>0010</b>", v: F.cells([{ v: "0", c: "violet" }, { v: "0", c: "violet" }, { v: "1", c: "violet" }, { v: "0", c: "violet" }]) },
          { t: "Frame T = 1100101 0010 (divides by 10011 exactly)", v: F.cells(["1", "1", "0", "0", "1", "0", "1", { v: "0", c: "teal" }, { v: "0", c: "teal" }, { v: "1", c: "teal" }, { v: "0", c: "teal" }]) },
        ]),
        c: { q: "A receiver divides a received frame by the generator and gets remainder 0101. What does it conclude?", o: ["The frame is clean, since the remainder is small", "It was corrupted; a clean one leaves 0", "The generator polynomial was chosen wrongly", "Only the last four bits of it are wrong"], a: 1, why: "A frame built as $T = M x^r + R$ is an exact multiple of $P$. Any non-zero remainder proves it changed in transit (and does not say where)." } },
      { t: "Reading real generators", b: `<p>Standards give the generator as a polynomial. To use it, write a 1 for each power that appears and a 0 for each that does not, from the highest power down. A degree-$r$ polynomial gives a bit string of <b>$r+1$ bits</b>.</p><p>CRC-CCITT is $x^{16}+x^{12}+x^5+1$: a 17-bit string with 1s at powers 16, 12, 5 and 0.</p>`,
        v: table(["Polynomial", "Powers present", "Bit string"], [[`$x^4+x^3+1$`, "4, 3, 0", "<span class=\"mono\">11001</span>"], [`$x^4+x+1$`, "4, 1, 0", "<span class=\"mono\">10011</span>"], [`$x^{16}+x^{12}+x^5+1$`, "16, 12, 5, 0", "<span class=\"mono\">10001000000100001</span>"]], 640),
        c: { q: "Which bit string is the generator $x^4+x^3+1$?", o: ["11001", "10011", "11101", "11010"], a: 0, why: "Powers 4, 3 and 0 are present; powers 2 and 1 are absent. Reading from $x^4$ down to $x^0$ gives 1, 1, 0, 0, 1." } },
      { t: "Parity is the smallest CRC", b: `<p>Take the generator $x+1$, bits <b>11</b>. Its degree is 1, so the CRC is a single bit, and that bit turns out to be the <b>parity</b> of the message. A parity bit is a CRC with the smallest possible generator.</p><p>Longer generators spread the same idea over more check bits, and catch far more patterns.</p>`,
        v: F.compare({ title: "Generator 11 on 1011", c: "violet", body: "1011 then one 0 → remainder <b>1</b><br>1011 has three 1s" }, { title: "Even parity of 1011", c: "teal", body: "three 1s → parity bit <b>1</b><br>the same bit" }),
        c: { q: "Generator bits 11 (that is $x+1$) are used on the message 1011. What is the one-bit CRC?", o: ["0", "1"], a: 1, why: "It equals the parity bit. 1011 has three 1s, an odd count, so the check bit is 1." } },
      { t: "What a good generator catches", b: `<p>The lecture quotes CRC-16 (CCITT) with a degree-16 generator. It catches <b>every</b> single and double error, <b>every</b> odd number of errors, and <b>every</b> burst of 16 bits or fewer. A burst is a run of bits where the first and last are wrong.</p><p>Longer bursts can slip through, but rarely: about 99.997% of 17-bit bursts and 99.998% of longer ones are still caught.</p>`,
        v: table(["Error pattern", "CRC-16 detects"], [["Single or double bit errors", "all"], ["Any odd number of bit errors", "all"], ["Bursts up to 16 bits", "all"], ["Bursts of 17 bits", "99.997%"], ["Longer bursts", "99.998%"]], 520),
        c: { q: "A CRC uses a degree-16 generator. What is the longest burst error it is certain to catch?", o: ["8 bits", "16 bits", "17 bits", "32 bits"], a: 1, why: "A burst of length 16 or less is a non-zero polynomial of degree below 16, which a degree-16 generator cannot divide. Length 17 can occasionally match the generator and slip through." } },
    ],
    guide: [
      "Choose a generator and a message and read off the polynomial form, the check bits and the frame.",
      "Click bits of the frame to corrupt it: the remainder turns non-zero when the error is caught.",
      "Read the audit table: which error patterns does each generator miss?",
    ],
  };

  const GENS = [
    ["11", "x+1 (parity)"],
    ["1011", "x³+x+1"],
    ["11001", "x⁴+x³+1"],
    ["10011", "x⁴+x+1"],
  ];
  const MSGS = ["1100101", "0110111", "1101001"];
  // exhaustive audit: how many error patterns of each kind leave remainder 0 (and so slip through)?
  // prettier-ignore
  function crcAudit(n, gen) {
    const r = gen.length - 1;
    const missed = (pos) => { const b = Array(n).fill(0); pos.forEach((i) => (b[i] = 1)); return /^0*$/.test(polyMod(str(b), gen)); };
    const row = { one: [0, 0], two: [0, 0], three: [0, 0], burst: [0, 0] };
    for (let i = 0; i < n; i++) { row.one[1]++; if (missed([i])) row.one[0]++; }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { row.two[1]++; if (missed([i, j])) row.two[0]++; }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) { row.three[1]++; if (missed([i, j, k])) row.three[0]++; }
    for (let b = 1; b <= r; b++) for (let s = 0; s + b <= n; s++) {
      const mids = b > 2 ? 1 << (b - 2) : 1;
      for (let m = 0; m < mids; m++) { const pos = [s]; if (b > 1) { pos.push(s + b - 1); for (let q = 0; q < b - 2; q++) if ((m >> q) & 1) pos.push(s + 1 + q); } row.burst[1]++; if (missed(pos)) row.burst[0]++; }
    }
    return row;
  }

  reg({
    id: "a6-crcpoly",
    order: 4,
    num: "6.4",
    title: "CRC as polynomials",
    blurb:
      "Generators are polynomials, shifting is multiplying, and an exhaustive audit shows what each generator really catches.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Pick a generator and a message. The check bits come from mod-2 long division; the audit tries <b>every</b> error pattern of each kind.",
        ),
      );
      let gen = "1011",
        msg = MSGS[0],
        flips = new Set();
      const card = el(`<div class="card"><div class="card-head"><h2>Encode, corrupt, audit</h2></div>
        <div class="controls"><span class="faint">generator</span><span id="g"></span></div><div class="controls"><span class="faint">message</span><span id="m"></span></div>
        <div id="info" class="mono" style="line-height:1.7"></div>
        <div id="fr"></div><div class="callout" id="msgbox" style="min-height:46px"></div>
        <div class="controls"><button class="btn ghost" id="rs">Undo flips</button></div>
        <h3>Audit: patterns that slip through undetected</h3><div id="au"></div></div>`);
      root.appendChild(card);
      qs("#g", card).appendChild(
        N.seg(
          GENS.map(([g, n]) => [g, n]),
          gen,
          (v) => {
            gen = v;
            flips = new Set();
            draw();
          },
        ),
      );
      qs("#m", card).appendChild(
        N.seg(
          MSGS.map((m) => [m, m]),
          msg,
          (v) => {
            msg = v;
            flips = new Set();
            draw();
          },
        ),
      );
      // prettier-ignore
      function draw() {
        const r = gen.length - 1, rem = crcRem(msg, gen), frame = bitsOf(msg + rem), n = frame.length;
        qs("#info", card).innerHTML = `P = ${polyTex(gen)} (bits ${gen}, degree ${r}) &nbsp; M = ${msg} &nbsp; M·x<sup>${r}</sup> = ${msg}${"0".repeat(r)}<br>check bits R = <b style="color:var(--amber-ink)">${rem}</b> &nbsp; frame T = ${msg}<b style="color:var(--amber-ink)">${rem}</b>`;
        const cur = frame.map((b, i) => (flips.has(i) ? b ^ 1 : b));
        qs("#fr", card).innerHTML = `<div class="genome">${cur.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:32px;height:34px;${i >= msg.length ? "outline:2px solid var(--amber);" : ""}${flips.has(i) ? "border-color:var(--rose-ink)" : ""}">${b}</button>`).join("")}</div>`;
        qsa("#fr .gene", card).forEach((g) => (g.onclick = () => { const i = +g.dataset.i; flips.has(i) ? flips.delete(i) : flips.add(i); draw(); }));
        const chk = polyMod(str(cur), gen), clean = /^0*$/.test(chk), box = qs("#msgbox", card);
        if (!flips.size) { box.className = "callout teal"; box.innerHTML = `Frame divided by ${gen}: remainder <b>${chk}</b>. Clean. Click bits (amber = check bits) to corrupt it.`; }
        else if (!clean) { box.className = "callout amber"; box.innerHTML = `${flips.size} flip${flips.size > 1 ? "s" : ""}: remainder <b>${chk}</b> is not zero, so the error is <b>detected</b>.`; }
        else { box.className = "callout rose"; box.innerHTML = `${flips.size} flips and the remainder is <b>${chk}</b>: the corrupted frame is still a multiple of the generator. <b>Missed.</b>`; }
        const a = crcAudit(n, gen), cc = (x) => `${x[0]} of ${x[1]}`;
        qs("#au", card).innerHTML = table(["Error pattern (frame of " + n + " bits)", "Missed"], [["1 flipped bit", cc(a.one)], ["2 flipped bits", cc(a.two)], ["3 flipped bits", cc(a.three)], [`Bursts of length 1 to ${r}`, cc(a.burst)]], 520);
      }
      qs("#rs", card).onclick = () => {
        flips = new Set();
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a6-crcpoly-1",
          q: "Choose the generator 11. Compare its check bit with the message's parity bit. What do you find?",
          opts: [
            "They are always equal: x+1 gives exactly the parity bit",
            "They are always opposite",
            "They agree only for messages with an even number of 1s",
          ],
          a: 0,
          why: "Dividing by x + 1 leaves the XOR of all message bits, which is the parity. (Notice too that the audit shows it misses every double flip, just like parity.)",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-crcpoly-2",
          q: "With generator 1011 (degree 3), which error patterns in the audit table can never slip through?",
          opts: [
            "Every single flip and every burst of 3 bits or fewer",
            "Every single and double flip, however long the frame",
            "Every error of exactly 3 flipped bits, wherever they are",
          ],
          a: 0,
          why: "Its row shows 0 missed for 1 flip and for bursts up to 3, but a few double flips and many triple flips slip through. A degree-3 generator guarantees bursts up to its degree, not every double error.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Bits are polynomial coefficients; a degree-$r$ generator gives $r$ check bits ($r+1$ generator bits).",
            "Shift by $n$ = multiply by $x^n$. Check bits $R = M x^r \\bmod P$; frame $T = M x^r + R$ is divisible by $P$.",
            "Generator $x+1$ is just parity. Longer generators catch all bursts up to their degree, plus most longer ones.",
          ],
          "A CRC is polynomial division with XOR in place of subtraction.",
        ),
      );
    },
  });
})();
