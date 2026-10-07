/* algo-p6-x-03: Phase 6: 6.5 codewords and distance, 6.6 the guessing game, 6.3 CRC deepening. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const {
    bitsOf,
    str,
    ones,
    hEnc,
    hSyn,
    hFix,
    hData,
    polyMod,
    cell,
    cellRow,
    simpleRun,
    chips,
    table,
    crcRegister,
    crcDiagram,
  } = (NIC.shared.algoP6 = NIC.shared.algoP6 || {});
  const reg = (m) => N.register({ subject: "algo", lecture: 6, ...m });
  /* ============================================================
     6.5 Codewords, Hamming distance and repetition
     ============================================================ */
  const hd = (a, b) => [...String(a)].filter((c, i) => c !== String(b)[i]).length;
  const major = (s) => (ones(bitsOf(s)) * 2 > s.length ? 1 : 0);
  const cubeNodes = () => {
    const P = {
      "000": [60, 205],
      "001": [180, 205],
      "010": [60, 105],
      "011": [180, 105],
      100: [130, 160],
      101: [250, 160],
      110: [130, 60],
      111: [250, 60],
    };
    return Object.fromEntries(Object.entries(P).map(([k, v]) => [k, { x: v[0], y: v[1], label: k }]));
  };
  const cubeEdges = () => {
    const ks = ["000", "001", "010", "011", "100", "101", "110", "111"],
      e = [];
    for (const a of ks) for (const b of ks) if (a < b && hd(a, b) === 1) e.push([a, b]);
    return e;
  };

  L["a6-distance"] = {
    sum: "Only some bit strings are valid <b>codewords</b>. The <b>Hamming distance</b> counts the positions where two words differ, and the minimum distance between codewords decides how many errors a code can detect and correct. Repeating each bit three times is the simplest example.",
    // prettier-ignore
    steps: [
      { t: "Words and codewords", b: `<p>An $n$-bit string has $2^n$ possible values, but a code allows only some of them: the <b>codewords</b>. If a received word is not a codeword, something flipped. Here 3-bit strings sit at the corners of a cube, and only <b>000</b> and <b>111</b> are codewords (the repetition code for 0 and 1).</p>`,
        v: F.graph({ nodes: Object.fromEntries(Object.entries(cubeNodes()).map(([k, v]) => [k, { ...v, c: k === "000" || k === "111" ? "teal" : undefined }])), edges: cubeEdges(), w: 320, h: 250, r: 22 }),
        c: { q: "How many 3-bit strings are there in total, and how many are codewords here?", o: ["8 strings, 2 codewords", "3 strings, 2 codewords", "8 strings, 8 codewords", "6 strings, 2 codewords"], a: 0, why: "Three bits give $2^3 = 8$ strings. Only 000 and 111 are codewords. Each edge of the cube is a single bit flip." } },
      { t: "Hamming distance", b: `<p>The <b>Hamming distance</b> between two equal-length words is the number of positions where their symbols differ. XOR the words and count the 1s.</p>`,
        v: F.frames([
          { t: "110001 vs 011101", v: F.cells(["1", "1", "0", "0", "0", "1"], { label: "a" }) + F.cells(["0", "1", "1", "1", "0", "1"], { label: "b" }) },
          { t: "differences at positions 1, 3 and 4", v: F.cells([{ v: "1", c: "rose" }, "0", { v: "1", c: "rose" }, { v: "1", c: "rose" }, "0", "0"], { label: "a ⊕ b" }) },
          { t: "three 1s: distance = <b>3</b>", v: F.cells(["d", "=", { v: "3", c: "amber" }]) },
        ]),
        c: { q: "What is the Hamming distance between 0110 and 1100?", o: ["1", "2", "3", "4"], a: 1, why: "Compare place by place: 0/1 differs, 1/1 same, 1/0 differs, 0/0 same. Two positions differ." } },
      { t: "The repetition code", b: `<p>Encode 0 as <b>000</b> and 1 as <b>111</b>. The receiver decodes by <b>majority vote</b>: any word with two or more 1s is read as 1. A single flip anywhere is repaired.</p>`,
        v: table(["Received", "Decoded", "Received", "Decoded"], [["000", "0", "111", "1"], ["001", "0", "110", "1"], ["010", "0", "101", "1"], ["100", "0", "011", "1"]], 420),
        c: { q: "The repetition code 000/111 is used and the receiver sees 101. What does it decode?", o: ["0", "1", "It cannot decide", "An error flag"], a: 1, why: "Majority vote: two 1s against one 0 gives 1. It trusts the majority, so two flips of 000 would be silently misread." } },
      { t: "Distance sets the power", b: `<p>The <b>minimum distance</b> $d$ is the smallest distance between any two codewords. A code can <b>detect</b> up to $d-1$ errors, and <b>correct</b> up to $\\lfloor (d-1)/2 \\rfloor$. The repetition code has $d = 3$: it fixes 1 flip, or notices 2.</p>`,
        v: table(["Minimum distance d", "Detects up to", "Corrects up to"], [["1", "0", "0"], ["2", "1", "0"], { c: ["3", "2", "1"], hl: true }, ["4", "3", "1"], ["5", "4", "2"]], 520),
        c: { q: "A code has minimum distance 5 between its codewords. How many errors can it always correct?", o: ["1", "2", "4", "5"], a: 1, why: "It corrects up to ⌊(5 − 1) / 2⌋ = 2 errors. It could detect up to 4, but detection and correction share the same distance budget." } },
      { t: "The price: rate", b: `<p>Repeating each bit $n$ times gives distance $n$ and a rate of $1/n$. Three copies corrects 1 flip but wastes two thirds of the bandwidth; five copies corrects 2 and wastes four fifths. Cleverer codes get the same correction for far less overhead, as Hamming(7,4) will show.</p>`,
        v: F.bars([["Repeat ×3 (d = 3)", 1 / 3, "rose", "fixes 1"], ["Repeat ×5 (d = 5)", 1 / 5, "rose", "fixes 2"], ["Hamming(7,4) (d = 3)", 4 / 7, "teal", "fixes 1"], ["Hamming(15,11) (d = 3)", 11 / 15, "teal", "fixes 1"]], { max: 1, fmt: (v) => v.toFixed(2) }) + `<div class="fig-cap">Code rate (data bits per bit sent). The longer Hamming code fixes the same single error with far less overhead.</div>`,
        c: { q: "A code repeats every bit 5 times. What fraction of the transmitted bits carry new information?", o: ["1/5", "2/5", "1/2", "5/1"], a: 0, why: "Each data bit is sent as 5 bits, so only one fifth of what is sent is new. The rate is 1/5." } },
      { t: "Vocabulary", b: `<p>Four terms from the lecture:</p><ul><li><b>Codeword</b>: a valid element of the code.</li><li><b>Hamming distance</b>: positions where two words differ.</li><li><b>Forward error correction (FEC)</b>: adding redundancy at the transmitter so the receiver can fix errors on its own.</li><li><b>Modulo-2 arithmetic</b>: every result is reduced mod 2, so addition is XOR.</li></ul>`,
        v: table(["Term", "Quick example"], [["codeword", "000 or 111 in the repetition code"], ["Hamming distance", "d(110001, 011101) = 3"], ["FEC", "Hamming(7,4) repairs 1 flipped bit"], ["modulo 2", "1 + 1 = 0"]], 560),
        c: { q: "Which of these is a statement about Hamming distance?", o: ["The number of 1s in a word", "The number of positions where two words differ", "The length of a codeword", "How many bits a code can send per second"], a: 1, why: "Hamming distance compares two words position by position and counts the mismatches." } },
    ],
    guide: [
      "Toggle bits of words <b>a</b> and <b>b</b> and watch the distance and XOR row.",
      "Choose repeat ×3 or ×5, then click transmitted bits to flip them.",
      "Find how many flips a copy count can always repair.",
    ],
  };

  reg({
    id: "a6-distance",
    order: 5,
    num: "6.5",
    title: "Codewords, distance and repetition",
    blurb: "Measure Hamming distance, build the simplest error-correcting code, and see what minimum distance buys.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Two tools: a distance meter for two 6-bit words, and a repetition code you can attack with bit flips.",
        ),
      );
      let a = bitsOf("110001"),
        b = bitsOf("011101");
      const c1 =
        el(`<div class="card"><div class="card-head"><h2>Distance meter</h2><span class="faint">click bits to toggle</span></div>
        <div class="controls"><span class="faint">a</span><span id="ra"></span></div><div class="controls"><span class="faint">b</span><span id="rb"></span></div>
        <div class="controls"><span class="faint">a ⊕ b</span><span id="rx"></span></div><div class="stat-row"><div class="stat amber"><small>Hamming distance</small><b id="dd"></b></div></div></div>`);
      root.appendChild(c1);
      // prettier-ignore
      function drawD() {
        const x = a.map((v, i) => v ^ b[i]);
        const mk = (arr, id, hl) => { qs(id, c1).innerHTML = `<div class="genome">${arr.map((v, i) => `<button class="gene ${v ? "good" : ""}" data-i="${i}" style="min-width:34px;height:34px;${hl && hl[i] ? "border-color:var(--rose-ink)" : ""}">${v}</button>`).join("")}</div>`; };
        mk(a, "#ra", x); mk(b, "#rb", x);
        qs("#rx", c1).innerHTML = `<div class="genome">${x.map((v) => `<span class="gene ${v ? "good" : ""}" style="min-width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;${v ? "border-color:var(--rose-ink)" : ""}">${v}</span>`).join("")}</div>`;
        qsa("#ra .gene", c1).forEach((g) => (g.onclick = () => { a[+g.dataset.i] ^= 1; drawD(); }));
        qsa("#rb .gene", c1).forEach((g) => (g.onclick = () => { b[+g.dataset.i] ^= 1; drawD(); }));
        qs("#dd", c1).textContent = ones(x);
      }
      drawD();
      let rep = 3,
        msg = [1, 0, 1, 1],
        hits = new Set();
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>Repetition code</h2><span class="faint">majority vote decodes each group</span></div>
        <div class="controls"><span class="faint">copies</span><span id="cp"></span></div>
        <div class="controls"><span class="faint">message</span><span id="ms"></span></div>
        <div id="tx"></div><div class="stat-row"><div class="stat violet"><small>Flips so far</small><b id="nf"></b></div><div class="stat amber"><small>Min distance</small><b id="md"></b></div><div class="stat teal"><small>Always corrects</small><b id="cr"></b></div></div>
        <div class="callout" id="out" style="min-height:48px"></div><div class="controls"><button class="btn ghost" id="rs">Undo flips</button></div></div>`);
      root.appendChild(c2);
      qs("#cp", c2).appendChild(
        N.seg(
          [
            ["3", "×3"],
            ["5", "×5"],
          ],
          String(rep),
          (v) => {
            rep = +v;
            hits = new Set();
            drawR();
          },
        ),
      );
      // prettier-ignore
      function drawR() {
        qs("#ms", c2).innerHTML = `<div class="genome">${msg.map((v, i) => `<button class="gene ${v ? "good" : ""}" data-i="${i}" style="min-width:34px;height:34px">${v}</button>`).join("")}</div>`;
        qsa("#ms .gene", c2).forEach((g) => (g.onclick = () => { msg[+g.dataset.i] ^= 1; hits = new Set(); drawR(); }));
        const sent = msg.flatMap((v) => Array(rep).fill(v)), got = sent.map((v, i) => (hits.has(i) ? v ^ 1 : v));
        let h = `<div style="display:flex;gap:10px;flex-wrap:wrap">`;
        const decoded = [];
        msg.forEach((v, g) => {
          const grp = got.slice(g * rep, (g + 1) * rep), d = major(str(grp)); decoded.push(d);
          h += `<div class="genome" style="border:2px dashed var(--line-2);border-radius:12px;padding:4px">${grp.map((x, k) => { const i = g * rep + k; return `<button class="gene ${x ? "good" : ""}" data-i="${i}" style="min-width:30px;height:32px;${hits.has(i) ? "border-color:var(--rose-ink)" : ""}">${x}</button>`; }).join("")}<span class="faint" style="align-self:center;margin:0 4px">→</span><b class="mono" style="align-self:center;color:var(--${d === v ? "teal" : "rose"})">${d}</b></div>`;
        });
        qs("#tx", c2).innerHTML = h + "</div>";
        qsa("#tx .gene", c2).forEach((g) => (g.onclick = () => { const i = +g.dataset.i; hits.has(i) ? hits.delete(i) : hits.add(i); drawR(); }));
        qs("#nf", c2).textContent = hits.size; qs("#md", c2).textContent = rep; qs("#cr", c2).textContent = (rep - 1) / 2 + " per group";
        const ok = str(decoded) === str(msg), box = qs("#out", c2);
        if (!hits.size) { box.className = "callout teal"; box.innerHTML = "No noise yet: every group decodes to its bit. Click transmitted bits to flip them."; }
        else if (ok) { box.className = "callout teal"; box.innerHTML = `Decoded <b>${str(decoded)}</b> = the message. The majority outvoted ${hits.size} flip${hits.size > 1 ? "s" : ""}.`; }
        else { box.className = "callout rose"; box.innerHTML = `Decoded <b>${str(decoded)}</b>, but the message was <b>${str(msg)}</b>. A group lost its majority: more flips than the code can repair, and the decoder cannot tell.`; }
      }
      qs("#rs", c2).onclick = () => {
        hits = new Set();
        drawR();
      };
      drawR();
      root.appendChild(
        predict({
          id: "a6-dist-1",
          q: "Repeat-3 sends 000 for a data bit of 0. Noise flips two of the three bits and 101 arrives. What does majority vote output?",
          opts: [
            "0, the correct bit",
            "1, a wrong bit with no warning",
            "Nothing: it detects the double error and stops",
          ],
          a: 1,
          why: "101 has two 1s, so the vote says 1. Two flips are more than distance 3 can repair, and the decoder cannot tell this word from a one-flip 111.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-dist-2",
          q: "Switch to ×5. How many flips inside ONE group can the majority vote always repair?",
          opts: ["1", "2", "3"],
          a: 1,
          why: "Five copies tolerate any 2 flips: the 3 untouched copies still outvote them. A third flip hands the vote to the wrong value.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Codewords are the valid strings; anything else reveals an error.",
            "Hamming distance = number of differing positions = number of 1s in a ⊕ b.",
            "Minimum distance d detects d − 1 errors and corrects ⌊(d − 1)/2⌋.",
            "Repetition buys correction at a rate of only 1/n.",
          ],
          "More distance between codewords means more errors survived, at a price in rate.",
        ),
      );
    },
  });

  /* ============================================================
     6.6 The guessing game: bits as addresses
     ============================================================ */
  const inList = (n, k) => ((n >> k) & 1) === 1;
  const listOf = (k) => Array.from({ length: 50 }, (_, i) => i + 1).filter((n) => inList(n, k));

  L["a6-game"] = {
    sum: 'Think of a number from 1 to 50. Six yes/no questions ("is it in this list?") pin it down, because the answers are its binary digits. Hamming\'s code uses the same trick in reverse: a few extra check questions whose answers name the one that lied.',
    // prettier-ignore
    steps: [
      { t: "The game", b: `<p>Pick a secret number from 1 to 50. You are shown six lists and, for each, you say only <b>yes</b> or <b>no</b>: is my number in it? List 1 holds the odd numbers; list 2 holds 2, 3, 6, 7, 10, 11 and so on; list 3 holds 4 to 7, 12 to 15 and so on. Each list is worth a different weight: 1, 2, 4, 8, 16 and 32.</p>`,
        v: table(["List", "Weight", "Starts with"], [0, 1, 2, 3, 4, 5].map((k) => [k + 1, 2 ** k, listOf(k).slice(0, 9).join(", ") + ", …"]), 560),
        c: { q: "Which list contains the number 6?", o: ["List 1 (weight 1) only", "Lists 2 and 3 (weights 2 and 4)", "List 3 (weight 4) only", "Lists 1 and 2 (weights 1 and 2)"], a: 1, why: "6 = 4 + 2, so it is in the weight-4 list and the weight-2 list, and not in the odd numbers." } },
      { t: "The answers add up to the number", b: `<p>Add the weights of every list that says <b>yes</b>. For secret 37 the answers are yes to the lists weighted 32, 4 and 1, so $32 + 4 + 1 = 37$. In other words, the yes/no answers <b>are</b> the binary digits of the number.</p>`,
        v: F.frames([
          { t: "Secret 37: answers for weights 32, 16, 8, 4, 2, 1", v: F.cells([{ v: "yes", sub: "32", c: "teal", w: 44 }, { v: "no", sub: "16", w: 44 }, { v: "no", sub: "8", w: 44 }, { v: "yes", sub: "4", c: "teal", w: 44 }, { v: "no", sub: "2", w: 44 }, { v: "yes", sub: "1", c: "teal", w: 44 }]) },
          { t: "As binary: 100101 = 32 + 4 + 1 = <b>37</b>", v: F.cells(["1", "0", "0", "1", "0", "1", "=", { v: "37", c: "amber" }]) },
        ]),
        c: { q: "You answer yes to the lists with weights 2 and 8 and no to all the others. What is the number?", o: ["10", "28", "16", "11"], a: 0, why: "2 + 8 = 10." } },
      { t: "Why six questions are enough", b: `<p>Each yes/no answer halves the possibilities, so $n$ answers can tell apart $2^n$ numbers. Six answers give $2^6 = 64$, enough for 50. You never need to know the number itself: the answers carry all of it.</p>`,
        v: F.bars([1, 2, 3, 4, 5, 6].map((n) => [`${n} question${n > 1 ? "s" : ""}`, 2 ** n, n === 6 ? "teal" : "violet", `${2 ** n} numbers`]), { max: 64 }),
        c: { q: "You want to find a secret number from 1 to 100. How many yes/no lists do you need?", o: ["6", "7", "50", "100"], a: 1, why: "$2^6 = 64$ is too few for 100 numbers, but $2^7 = 128$ is enough. Seven lists." } },
      { t: "A lie breaks it silently", b: `<p>Suppose one answer is wrong, say the weight-2 list says <b>yes</b> instead of no. You now add $32+4+2+1 = 39$. The wrong answer looks exactly like a valid one: with no spare information there is no way to notice. This is a flipped bit with no redundancy.</p>`,
        v: F.frames([
          { t: "True answers: 100101 = 37", v: F.cells(["1", "0", "0", "1", "0", "1"]) },
          { t: "One lie on the weight-2 list: 100111 = <b>39</b>", v: F.cells(["1", "0", "0", "1", { v: "1", c: "rose" }, "1"]) },
        ]),
        c: { q: "The secret is 37 (binary 100101). Someone lies on the weight-8 list. What number do you compute?", o: ["29", "45", "36", "41"], a: 1, why: "37 is not in the weight-8 list, so the true answer is no. A lie says yes, adding 8: 37 + 8 = 45." } },
      { t: "Extra checks name the liar", b: `<p>Hamming's idea: send <b>7 answers</b> for a 4-bit number, three of them extra "check" answers. Each check covers the positions whose binary number has a particular bit set. If one answer lies, the checks that fail <b>spell its position in binary</b>.</p><p>Three checks give $2^3 = 8$ outcomes: "no lie" plus the 7 possible positions. That is exactly why 3 is the right number.</p>`,
        v: table(["Position", "1", "2", "3", "4", "5", "6", "7"], [["binary", ...[1, 2, 3, 4, 5, 6, 7].map((i) => `<span class="mono">${i.toString(2).padStart(3, "0")}</span>`)], ["check 1 (weight 1)", ...[1, 2, 3, 4, 5, 6, 7].map((i) => (i & 1 ? "●" : ""))], ["check 2 (weight 2)", ...[1, 2, 3, 4, 5, 6, 7].map((i) => (i & 2 ? "●" : ""))], ["check 4 (weight 4)", ...[1, 2, 3, 4, 5, 6, 7].map((i) => (i & 4 ? "●" : ""))]], 640),
        c: { q: "Seven answers are sent and one lies. Checks 1 and 4 disagree; check 2 agrees. Which position lied?", o: ["3", "5", "6", "7"], a: 1, why: "Check 4, check 2, check 1 = 1, 0, 1 reads as binary 101 = 5. Position 5 belongs to the checks with weights 1 and 4, but not 2." } },
    ],
    guide: [
      "Slide the secret number: the six grids show which lists contain it.",
      "Click a yes/no chip to make that answer lie and see which wrong number you would compute.",
      "In the second card, pick a number 0 to 15, click one of the 7 answers to make it lie and let the checks find it.",
    ],
  };

  reg({
    id: "a6-game",
    order: 6,
    num: "6.6",
    title: "The guessing game",
    blurb:
      "Six yes/no lists identify any number 1-50 because the answers are its binary digits. A lie slips through, unless extra checks name the liar.",
    render(root) {
      root.appendChild(header(this, "Part 1: the six-list game. Part 2: seven answers where one liar can be found."));
      let secret = 37,
        lies = new Set();
      const c1 =
        el(`<div class="card"><style>.g6-grid{display:grid;grid-template-columns:repeat(10,13px);gap:2px}.g6-grid i{width:13px;height:13px;border-radius:3px;background:var(--panel-2);border:1px solid var(--line-2)}.g6-grid i.in{background:var(--blue);border-color:var(--blue-ink)}.g6-grid i.me{outline:2px solid var(--amber);outline-offset:1px}</style>
        <div class="card-head"><h2>Part 1: the six lists</h2><span class="faint">blue = in the list; outlined = secret number</span></div>
        <div class="controls" id="sl"></div><div id="lists" style="display:flex;gap:14px;flex-wrap:wrap"></div>
        <div id="ans" class="controls" style="margin-top:8px"></div>
        <div class="stat-row"><div class="stat amber"><small>Secret number</small><b id="sec"></b></div><div class="stat violet"><small>Number from the answers</small><b id="got"></b></div></div>
        <div class="callout" id="gm" style="min-height:48px"></div></div>`);
      root.appendChild(c1);
      const sl = N.slider("Secret number", 1, 50, 1, secret, (v) => v);
      sl.onInput((v) => {
        secret = v;
        lies = new Set();
        draw1();
      });
      qs("#sl", c1).appendChild(sl);
      // prettier-ignore
      function draw1() {
        qs("#lists", c1).innerHTML = [0, 1, 2, 3, 4, 5].map((k) => `<div><b style="font-size:12.5px">List ${k + 1} (weight ${2 ** k})</b><div class="g6-grid">${Array.from({ length: 50 }, (_, i) => `<i class="${inList(i + 1, k) ? "in" : ""} ${i + 1 === secret ? "me" : ""}" title="${i + 1}"></i>`).join("")}</div></div>`).join("");
        const ans = [0, 1, 2, 3, 4, 5].map((k) => (inList(secret, k) ? 1 : 0) ^ (lies.has(k) ? 1 : 0));
        qs("#ans", c1).innerHTML = `<span class="faint">answers (click to lie):</span>` + ans.map((a, k) => `<button class="btn small ${a ? "primary" : "ghost"}" data-k="${k}" style="${lies.has(k) ? "border-color:var(--rose-ink)" : ""}">${2 ** k}: ${a ? "yes" : "no"}</button>`).join("");
        qsa("#ans button", c1).forEach((b) => (b.onclick = () => { const k = +b.dataset.k; lies.has(k) ? lies.delete(k) : lies.add(k); draw1(); }));
        const got = ans.reduce((s, a, k) => s + a * 2 ** k, 0);
        qs("#sec", c1).textContent = secret; qs("#got", c1).textContent = got;
        const box = qs("#gm", c1);
        if (!lies.size) { box.className = "callout teal"; box.innerHTML = `Honest answers: ${ans.map((a, k) => (a ? 2 ** k : 0)).filter(Boolean).join(" + ")} = <b>${got}</b>.`; }
        else if (got < 1 || got > 50) { box.className = "callout amber"; box.innerHTML = `The lie gives <b>${got}</b>, which is not even a valid number. Here you can tell something is wrong, but not which answer, and for most numbers the wrong sum is still valid.`; }
        else { box.className = "callout rose"; box.innerHTML = `Lying about ${lies.size === 1 ? "one answer" : lies.size + " answers"} gives <b>${got}</b> instead of ${secret}. It looks perfectly valid, so nothing warns you.`; }
      }
      draw1();
      let num = 9,
        lie = -1;
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>Part 2: seven answers, one liar</h2><span class="faint">positions 1 to 7: check, check, data, check, data, data, data</span></div>
        <div class="controls" id="sl2"></div><div id="sev"></div>
        <div class="stat-row"><div class="stat violet"><small>Checks 4 2 1 disagree</small><b id="sy"></b></div><div class="stat amber"><small>The liar is position</small><b id="pos"></b></div><div class="stat teal"><small>Number recovered</small><b id="rec"></b></div></div>
        <div class="callout" id="m2" style="min-height:48px"></div></div>`);
      root.appendChild(c2);
      const sl2 = N.slider("Secret number (0 to 15)", 0, 15, 1, num, (v) => v);
      sl2.onInput((v) => {
        num = v;
        lie = -1;
        draw2();
      });
      qs("#sl2", c2).appendChild(sl2);
      const toBits = (n) => [8, 4, 2, 1].map((w) => (n & w ? 1 : 0));
      // prettier-ignore
      function draw2() {
        const cw = hEnc(toBits(num)), rx = cw.map((b, i) => (i === lie ? b ^ 1 : b));
        const names = ["check 1", "check 2", "d1 (8)", "check 4", "d2 (4)", "d3 (2)", "d4 (1)"];
        qs("#sev", c2).innerHTML = `<div class="genome">${rx.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:44px;height:44px;flex-direction:column;${i === lie ? "border-color:var(--rose-ink)" : ""}${[0, 1, 3].includes(i) ? ";outline:2px solid var(--violet)" : ""}"><span>${b}</span><small style="font-size:9px;font-weight:700">${names[i]}</small></button>`).join("")}</div>`;
        qsa("#sev .gene", c2).forEach((g) => (g.onclick = () => { const i = +g.dataset.i; lie = lie === i ? -1 : i; draw2(); }));
        const s = hSyn(rx), fixed = hFix(rx), got = hData(fixed).reduce((a, b) => a * 2 + b, 0);
        qs("#sy", c2).textContent = `${(s >> 2) & 1}${(s >> 1) & 1}${s & 1}`;
        qs("#pos", c2).textContent = s ? s : "none";
        qs("#rec", c2).textContent = got;
        const box = qs("#m2", c2);
        if (lie < 0) { box.className = "callout teal"; box.innerHTML = `Number <b>${num}</b> = ${toBits(num).join("")} is sent as <b>${cw.join("")}</b>. All three checks agree. Click an answer to make it lie.`; }
        else { box.className = "callout amber"; box.innerHTML = `Position <b>${lie + 1}</b> lied. The checks that fail spell <b>${(s >> 2) & 1}${(s >> 1) & 1}${s & 1}</b> = ${s}, which names it. Flip it back and the number is recovered: <b>${got}</b>.`; }
      }
      draw2();
      root.appendChild(
        predict({
          id: "a6-game-1",
          q: "The secret number is 50. Which lists (by weight) say yes?",
          opts: ["32, 16 and 2", "32, 8 and 2", "32, 16, 2 and 1"],
          a: 0,
          why: "50 = 32 + 16 + 2 (binary 110010). Check with the grids: its outline appears in exactly the weight-32, weight-16 and weight-2 lists.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-game-2",
          q: "In Part 2 one of the seven answers lies and the checks read 1 1 1. Which position is the liar?",
          opts: ["1", "4", "7"],
          a: 2,
          why: "The failed checks 4, 2 and 1 all disagree: 111 in binary is 7. Position 7 is the only one covered by all three checks.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Yes/no answers are binary digits: n answers distinguish $2^n$ numbers.",
            "With no redundancy a wrong answer just looks like a different valid number.",
            "Three extra checks give 8 outcomes: 'no error' plus the position of any one of 7 answers.",
          ],
          "Hamming's code turns the failed checks into the address of the bad bit.",
        ),
      );
    },
  });

  /* ============ 6.3 Parity to CRC (deepened) ============ */
  const crcL = L["a6-crc"],
    crcM = N.modules.find((m) => m.id === "a6-crc");
  const at = (steps, title) => steps.findIndex((s) => s.t === title);
  crcL.steps.splice(
    at(crcL.steps, "Why the receiver can check it"),
    0,
    {
      t: "The same division as a shift register",
      b: `<p>In hardware you do not write out long division. A short <b>shift register</b> with $r$ cells does it one bit at a time. The rule for drawing it: where a cell's bit is simply shifted along, the generator coefficient is <b>0</b> (a plain wire); where an XOR gate sits in front of a cell, the coefficient is <b>1</b>.</p><p>For 1101 ($x^3+x^2+1$) the coefficients of $x^0$ and $x^2$ are 1, so gates sit before $c_0$ and before $c_2$, and nothing before $c_1$.</p>`,
      v: crcDiagram(),
      c: {
        q: "In the register diagram, a cell has an XOR gate in front of it when…",
        o: [
          "its generator coefficient is 1",
          "the cell currently holds a 1 at that moment",
          "the message bit being shifted in is 0",
          "the cell is the last one in the chain",
        ],
        a: 0,
        why: "A plain wire (the bit is just shifted) means coefficient 0; an XOR with the fed-back bit means coefficient 1. That is how a polynomial turns into a circuit.",
      },
    },
    {
      t: "The bitwise algorithm, run on 1011011",
      b: `<p>Zero a register $C$ of $r$ bits, then repeat $N + r$ times (message bits, then $r$ padding zeros): shift $C$ left, shifting in the next bit; if the bit that fell out was <b>1</b>, XOR $C$ with the last $r$ bits of $P$. For $P$ = 1101 that is <b>101</b>.</p><p>Step through the message <span class="mono">1011011</span>.</p>`,
      v: (box, life) => crcRun(box, life),
    },
  );
  crcL.steps.push({
    t: "Checking is the same engine",
    b: `<p>The receiver uses the <b>same register</b>. It feeds the whole frame (message and CRC) through with <b>no padding zeros</b>. A clean frame leaves the register at <b>000</b>; any other value means the frame changed in transit.</p>`,
    v: (() => {
      const fr = "1011011001",
        bad = bitsOf(fr);
      bad[2] ^= 1;
      const f2 = str(bad);
      return F.frames([
        {
          t: `Clean frame ${fr}: register ends at <b>${crcRegister(fr, "1101", false).rem}</b> ✓`,
          v: F.cells(bitsOf(fr).map((b, k) => (k >= 7 ? { v: b, c: "amber" } : b))),
        },
        {
          t: `Bit 3 flips (${f2}): register ends at <b>${crcRegister(f2, "1101", false).rem}</b> → detected`,
          v: F.cells(bitsOf(f2).map((b, k) => (k === 2 ? { v: b, c: "rose" } : k >= 7 ? { v: b, c: "amber" } : b))),
        },
      ]);
    })(),
    c: {
      q: "A receiver runs a frame through the CRC-1101 register and the register ends at 011. What does that mean?",
      o: [
        "The frame was corrupted: a clean frame always ends at 000",
        "The frame is fine: any remainder is acceptable",
        "The last three bits are the ones that flipped",
        "The sender used a different generator",
      ],
      a: 0,
      why: "A clean frame is an exact multiple of the generator, so the register finishes at zero. Any non-zero value means corruption, though it does not say where.",
    },
  });
  crcL.guide = [
    "Click bits in the parity strip. One flip is caught; a second flip hides the first.",
    "Press <b>Next XOR</b> to step through the CRC division and check each XOR yourself.",
    "In the frame check, click bits of a received frame and watch the remainder.",
    "Confirm the final remainder: 100.",
    "Answer the questions after the demo.",
  ];
  crcM.order = 3;
  crcM.num = "6.3";
  const crcRender = crcM.render;
  crcM.render = function (root, life) {
    crcRender.call(this, root, life);
    const crcDivide = polyMod;
    const tail = root.lastElementChild,
      pred = tail.previousElementSibling;

    const sentFrame = bitsOf("1011100"),
      rxf = sentFrame.slice();
    const fcard = el(
      `<div class="card"><div class="card-head"><h3>Check a received frame</h3><span class="faint">frame 1011100 (message 1011 + CRC 100), generator 1101 · click bits to corrupt</span></div><div id="fr"></div><div class="stat-row"><div class="stat amber"><small>Remainder</small><b id="fremd"></b></div><div class="stat violet"><small>Bits flipped</small><b id="frn"></b></div></div><div class="callout" id="frm" style="min-height:46px"></div></div>`,
    );
    root.insertBefore(fcard, pred);
    function drawFrame() {
      qs("#fr", fcard).innerHTML =
        `<div class="genome">${rxf.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" style="min-width:34px;height:34px;font-size:15px;${i >= 4 ? "outline:2px solid var(--amber);" : ""}${b !== sentFrame[i] ? "border-color:var(--rose-ink)" : ""}">${b}</button>`).join("")}</div>`;
      qsa("#fr .gene", fcard).forEach(
        (g) =>
          (g.onclick = () => {
            rxf[+g.dataset.i] ^= 1;
            drawFrame();
          }),
      );
      const rem = crcDivide(str(rxf), "1101"),
        n = rxf.filter((b, i) => b !== sentFrame[i]).length,
        clean = rem === "000";
      qs("#fremd", fcard).textContent = rem;
      qs("#frn", fcard).textContent = n;
      const m = qs("#frm", fcard);
      if (!n) {
        m.className = "callout teal";
        m.innerHTML = "Remainder 000: the frame divides exactly, so it passes.";
      } else if (!clean) {
        m.className = "callout amber";
        m.innerHTML = `Remainder <b>${rem}</b> is not zero: corruption <b>detected</b>. (The remainder does not say which bit.)`;
      } else {
        m.className = "callout rose";
        m.innerHTML = `${n} flips yet the remainder is <b>000</b>: this pattern is itself a multiple of 1101, so it slips through. Rare for a good generator, but possible.`;
      }
    }
    drawFrame();
    root.insertBefore(
      predict({
        id: "a6-crc-2",
        q: "In the frame check, flip just ONE bit anywhere in 1011100. Does the remainder ever stay at 000?",
        opts: [
          "Never: with generator 1101 every single flip is caught",
          "Yes, when the flipped bit is in the CRC part",
          "Yes, when the flipped bit is the first one",
        ],
        a: 0,
        why: "A single flipped bit is a lone power of x, and 1101 (which has a constant term) never divides it. Every position gives a non-zero remainder.",
      }),
      tail,
    );
  };
  /* ---------- CRC bitwise algorithm as a step-through runner ---------- */
  // prettier-ignore
  function crcRun(box, life) {
    const MSG = "1011011", GEN = "1101", PL = "101";
    const run = crcRegister(MSG, GEN, true), rem = run.rem;
    const trace = run.trace.map((t) => ({ ...t, before: str(t.before), shifted: str(t.shifted), after: str(t.after) }));
    function* frames() {
      yield { i: -1, phase: "start", C: "000", out: null, cap: "Start with the register <b>C = 000</b>. We feed in the 7 message bits, then 3 padding zeros: 10 steps." };
      let asked = 0;
      for (const t of trace) {
        const ask = (t.out === 1 && asked === 0) || (t.out === 0 && t.i === 5) ? (asked++, { q: `The register holds ${t.before}. Its left bit, ${t.out}, is about to fall out as ${t.nb} shifts in. What happens?`, pick: ".c6-ch", a: [t.out ? "xor" : "skip"], why: t.out ? `The bit shifted out is 1, so C is XORed with the last bits of P (${PL}).` : "The bit shifted out is 0, so nothing is XORed: the shift alone is the new C." }) : null;
        yield { i: t.i, phase: "shift", C: t.shifted, out: t.out, ask, cap: `Shift left, bringing in <b>${t.nb}</b>${t.padded ? " (a padding zero)" : ""}. The bit that fell out was <b>${t.out}</b>${t.out ? ", so XOR with " + PL + " next." : ": nothing more to do."}` };
        if (t.out) yield { i: t.i, phase: "xor", C: t.after, out: t.out, cap: `${t.shifted} ⊕ ${PL} = <b>${t.after}</b>.` };
      }
      yield { i: 10, phase: "end", C: rem, out: null, mood: "love", cap: `All ${MSG.length + 3} steps done. The register holds <b>${rem}</b>: that is the CRC. Send <b>${MSG}${rem}</b>.` };
    }
    const all = MSG + "000";
    simpleRun(box, life, {
      code: ["C = r zero bits", "for each of N + r bits: shift C left, bring in the next bit (or 0)", "if the bit shifted out was 1: C = C ⊕ last r bits of P", "return C"],
      frames,
      html: (f) => `${cellRow(all.split("").map((b, k) => cell(b, { c: f.i === k && f.phase !== "end" ? "violet" : k < f.i || f.phase === "end" ? "teal" : k >= MSG.length ? "amber" : undefined, w: 30 })), "bits in")}
        <div class="c6-row"><span class="faint">out</span>${cell(f.out === null ? "·" : f.out, { c: f.out === 1 ? "rose" : undefined, w: 30 })}<span class="faint" style="margin-left:10px">register C</span>${f.C.split("").map((b) => cell(b, { c: f.phase === "xor" || f.phase === "end" ? "teal" : "violet", w: 34 })).join("")}</div>
        <div class="c6-note">${f.phase === "xor" ? "XOR applied" : f.phase === "shift" ? "shifted" : ""}</div>${chips([["xor", "XOR with " + PL], ["skip", "just shift"]])}`,
    });
  }
})();
