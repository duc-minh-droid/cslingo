/* algo-p6-x-04: Phase 6: 6.8 matrices and the 6.7 Hamming deepening. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const { xor, bitsOf, str, hEnc, hChecks, hSyn, hFix, hData, cell, cellRow, simpleRun, chips, table, venn } =
    (NIC.shared.algoP6 = NIC.shared.algoP6 || {});
  const reg = (m) => N.register({ subject: "algo", lecture: 6, ...m });
  /* ============================================================
     6.8 Matrices: G, H and M
     ============================================================ */
  const G = [
    [1, 1, 0, 1],
    [1, 0, 1, 1],
    [1, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const H = [
    [1, 0, 1, 0, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 1, 1],
  ];
  const Mx = [
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1],
  ];
  const mv = (A, x) => A.map((row) => row.reduce((s, a, i) => s ^ (a & x[i]), 0));
  const mat = (rows, o = {}) =>
    `<table class="t mono" style="width:auto;text-align:center">${o.cl ? `<tr><th></th>${o.cl.map((c) => `<th>${c}</th>`).join("")}</tr>` : ""}${rows.map((r, i) => `<tr class="${i === o.hr ? "hl" : ""}">${o.rl ? `<th>${o.rl[i]}</th>` : ""}${r.map((v, j) => `<td style="padding:4px 9px;${j === o.hc ? "background:color-mix(in srgb, var(--amber) 24%, transparent);" : ""}${v ? "font-weight:900" : "color:var(--text-faint)"}">${v}</td>`).join("")}</tr>`).join("")}</table>`;
  const ROWLAB = ["p1", "p2", "d1", "p3", "d2", "d3", "d4"];

  L["a6-matrix"] = {
    sum: "Hamming(7,4) is linear, so three matrices run the whole code mod 2: the <b>generator</b> $G$ encodes ($R = G\\,D$), the <b>parity-check</b> matrix $H$ finds the error ($E = H\\,R$ is its position in binary) and the <b>decoding</b> matrix $M$ picks the data back out ($D = M\\,R$).",
    // prettier-ignore
    steps: [
      { t: "The rules as a table", b: `<p>The three parity equations are $p_1 = d_1 \\oplus d_2 \\oplus d_4$, $p_2 = d_1 \\oplus d_3 \\oplus d_4$ and $p_3 = d_2 \\oplus d_3 \\oplus d_4$. Write each as a row of 1s and 0s, one entry per data bit: 1 means that data bit feeds the parity bit.</p>`,
        v: mat([[1, 1, 0, 1], [1, 0, 1, 1], [0, 1, 1, 1]], { rl: ["p1", "p2", "p3"], cl: ["d1", "d2", "d3", "d4"] }),
        c: { q: "Which data bits does p3 combine?", o: ["d1, d2 and d4", "d1, d3 and d4", "d2, d3 and d4", "d1, d2 and d3"], a: 2, why: "Row p3 of the table is 0 1 1 1: it XORs d2, d3 and d4 and ignores d1." } },
      { t: "The generator matrix G", b: `<p>The codeword also contains the data bits themselves, in the order p1, p2, d1, p3, d2, d3, d4. So insert an <b>identity</b> row (a single 1) wherever a data bit goes. The result is a 7 × 4 matrix $G$: one row per codeword bit, one column per data bit.</p>`,
        v: mat(G, { rl: ROWLAB, cl: ["d1", "d2", "d3", "d4"], hr: -1 }),
        c: { q: "How big is the generator matrix G for Hamming(7,4)?", o: ["7 rows by 4 columns", "4 rows by 7 columns", "3 rows by 7 columns", "7 rows by 7 columns"], a: 0, why: "There is one row for each of the 7 codeword bits and one column for each of the 4 data bits, so $R = G\\,D$ turns 4 data bits into 7." } },
      { t: "Encoding is one multiplication", b: `<p>Multiply mod 2: each output bit is the XOR of the data bits that its row of $G$ selects. For $D = [1,1,1,0]^T$ the rows give p1 = 1⊕1⊕0 = 0, p2 = 1⊕1⊕0 = 0, d1 = 1, p3 = 1⊕1⊕0 = 0, then d2, d3, d4 copied: $R = [0,0,1,0,1,1,0]^T$.</p>`,
        v: table(["Row", "Selects", "XOR", "Result"], G.map((row, i) => { const D = [1, 1, 1, 0], sel = D.filter((_, j) => row[j]); return [ROWLAB[i], `d${row.map((v, j) => (v ? j + 1 : 0)).filter(Boolean).join(" d")}`, sel.join(" ⊕ "), `<b>${mv([row], D)[0]}</b>`]; }), 560),
        c: { q: "For data D = [0,1,0,1], what is p2, the second entry of G·D (row 1 0 1 1)?", o: ["0", "1"], a: 1, why: "Row 1 0 1 1 selects d1, d3 and d4: 0 ⊕ 0 ⊕ 1 = 1." } },
      { t: "The parity-check matrix H", b: `<p>$H$ has three rows (called Bit 1, Bit 2, Bit 4) and 7 columns. <b>Column $j$ is the number $j$ written in binary</b>, lowest bit on top. Multiply the received word: $E = H\\,R$. If $E$ is all zeros there is no error; otherwise read $E = [e_1, e_2, e_3]^T$ as $e_1 + 2e_2 + 4e_3$: the position of the flipped bit.</p>`,
        v: `<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center">${mat(H, { rl: ["Bit 1", "Bit 2", "Bit 4"], cl: [1, 2, 3, 4, 5, 6, 7] })}<div>${F.cells(["1", "0", "1", "1", { v: "1", c: "rose", sub: "r5" }, "1", "0"], { label: "R" })}<div class="faint" style="font-size:13px">R = 1011110 (data 1010, bit 5 flipped)<br>E = H·R = [1, 0, 1] → 1·1 + 0·2 + 1·4 = <b>5</b></div></div></div>`,
        c: { q: "H·R comes out as E = [0, 1, 1]. Reading the entries as e1 + 2·e2 + 4·e3, which position is wrong?", o: ["3", "6", "1", "7"], a: 1, why: "e1 = 0, e2 = 1, e3 = 1 gives 0 + 2 + 4 = 6. (Reading 011 left to right as 3 is the classic slip: e1 is the 1s place.)" } },
      { t: "The decoding matrix M", b: `<p>Once the error is fixed, the data sit at positions 3, 5, 6 and 7. The decoding matrix $M$ has one row per data bit and a single 1 in the right column, so $D = M\\,R$ just picks them out.</p><p>Example: $R = [0,1,0,0,1,0,1]^T$ gives $D = [0,1,0,1]^T$. With no correction needed that is the data; with an error you apply $H$ and flip first.</p>`,
        v: mat(Mx, { rl: ["d1", "d2", "d3", "d4"], cl: [1, 2, 3, 4, 5, 6, 7] }),
        c: { q: "The corrected received word is R = [1,1,1,1,1,1,1]. What does D = M·R give?", o: ["[1, 1, 1, 1]", "[0, 0, 0, 0]", "[1, 0, 1, 0]", "[1, 1, 1, 1, 1, 1, 1]"], a: 0, why: "M picks positions 3, 5, 6 and 7, all 1s. D has 4 entries, one per data bit." } },
      { t: "Three procedures, three costs", b: `<p>The lecture writes the code as three short procedures. <b>Encoding</b> is one product, $O(N)$ for $N$ codeword bits. <b>Correction</b> multiplies by $H$ ($O(K)$ for $K$ parity bits), reads the index, flips that bit. <b>Decoding</b> multiplies by $M$ ($O(M)$ for $M$ data bits).</p><p>A neat fact: $H\\,G$ is the all-zero matrix, so every codeword gives $E = 0$ and any single flip gives a syndrome that depends <b>only on where it is</b>, not on the data.</p>`,
        v: `<pre class="fig-wrap mono" style="font-size:13.5px;line-height:1.55;margin:0">Encoding(D):      R = G · D                  (mod 2)
Correction(R):    E = H · R
                  i = e1·1 + e2·2 + e3·4
                  if i ≠ 0: flip bit i of R
Decoding(R):      D = M · R

check: H · G = ${JSON.stringify(H.map((hr) => [0, 1, 2, 3].map((c) => G.reduce((s, g, k) => s ^ (hr[k] & g[c]), 0))))}   (every entry 0)</pre>`,
        c: { q: "In which order does a receiver use the matrices?", o: ["H to fix the error, then M for the data", "M first, then H on only the 4 data bits", "G to check the word, then H to decode it", "Only M, because the data bits are never corrupted"], a: 0, why: "Correction needs the full 7-bit word: E = H·R locates the flip, then D = M·R extracts the data. M alone would pass a corrupted data bit straight through." } },
      { t: "Check it with H by hand", b: `<p>Walk through the check of a received word, row by row. Each row of $H$ selects some positions and XORs them.</p>`, v: (box, life) => matrixRun(box, life) },
    ],
    guide: [
      "Toggle the four data bits and read off $R = G\\,D$.",
      "Click one bit of $R$ to corrupt it, then read $E = H\\,R$ and the highlighted column of $H$.",
      "Press <b>Correct</b> and then read the data from $M\\,R$.",
    ],
  };

  // prettier-ignore
  function matrixRun(box, life) {
    const R = [1, 0, 1, 1, 1, 1, 0];
    function* frames() {
      const E = [];
      const names = ["Bit 1", "Bit 2", "Bit 4"];
      yield { R, row: -1, E: [], flipped: false, cap: "Received word R = <b>1011110</b>. We compute E = H · R one row at a time." };
      for (let r = 0; r < 3; r++) {
        const sel = H[r].map((v, j) => (v ? j : -1)).filter((j) => j >= 0), vals = sel.map((j) => R[j]), res = vals.reduce(xor, 0);
        E.push(res);
        const ask = r === 1 ? { q: `Row ${names[r]} selects positions ${sel.map((j) => j + 1).join(", ")}, which hold ${vals.join(", ")}. What is their XOR?`, pick: ".c6-ch", a: [String(res)], why: `${vals.join(" ⊕ ")} = ${res}.` } : null;
        yield { R, row: r, sel, E: E.slice(), flipped: false, ask, cap: `Row <b>${names[r]}</b> selects positions ${sel.map((j) => j + 1).join(", ")}: ${vals.join(" ⊕ ")} = <b>${res}</b>.` };
      }
      const pos = E[0] + 2 * E[1] + 4 * E[2];
      yield { R, row: 3, E: E.slice(), flipped: false, ask: { q: `E = [${E.join(", ")}] means ${E[0]}·1 + ${E[1]}·2 + ${E[2]}·4 = ${pos}. Tap the bit of R that is wrong.`, pick: ".cell[data-k]", a: [String(pos)], why: `The position is e1 + 2·e2 + 4·e3 = ${pos}.` }, cap: `E = [${E.join(", ")}] is not zero, so there is an error. Its position is ${E[0]}·1 + ${E[1]}·2 + ${E[2]}·4 = <b>${pos}</b>.` };
      const fixed = R.slice(); fixed[pos - 1] ^= 1;
      yield { R: fixed, row: 3, E: E.slice(), flipped: pos, mood: "love", cap: `Flip bit ${pos}: R = <b>${str(fixed)}</b>. Then D = M · R picks positions 3, 5, 6, 7: <b>${str(hData(fixed))}</b>.` };
    }
    simpleRun(box, life, {
      code: ["E = H · R  (each row: XOR the selected bits)", "i = e1 + 2·e2 + 4·e3", "if i ≠ 0, flip bit i of R", "D = M · R  (positions 3, 5, 6, 7)"],
      frames,
      html: (f) => `${cellRow(f.R.map((b, j) => cell(b, { k: j + 1, sub: j + 1, c: f.flipped === j + 1 ? "teal" : f.sel && f.sel.includes(j) ? "violet" : undefined, w: 36 })), "R")}
        ${mat(H, { rl: ["Bit 1", "Bit 2", "Bit 4"], cl: [1, 2, 3, 4, 5, 6, 7], hr: f.row >= 0 && f.row < 3 ? f.row : -1 })}
        <div class="c6-row"><span class="faint">E =</span>${[0, 1, 2].map((r) => cell(f.E[r] !== undefined ? f.E[r] : "?", { c: f.E[r] !== undefined ? "amber" : undefined, w: 36 })).join("")}</div>${chips([0, 1])}`,
    });
  }

  reg({
    id: "a6-matrix",
    order: 8,
    num: "6.8",
    title: "Matrices: G, H and M",
    blurb: "Encode with R = G·D, find the error with E = H·R, and pick the data out with D = M·R, all mod 2.",
    render(root) {
      root.appendChild(
        header(this, "Toggle data bits, corrupt a bit of the codeword, then follow the three matrices."),
      );
      let D = [1, 0, 1, 0],
        R = null,
        hit = -1;
      const card = el(`<div class="card"><div class="card-head"><h2>Encode, corrupt, correct</h2></div>
        <div class="controls"><span class="faint">data D</span><span id="dd"></span></div>
        <div class="grid two"><div><h3>R = G · D</h3><div id="mg"></div></div><div><h3>E = H · R</h3><div id="mh"></div><div class="stat-row"><div class="stat amber"><small>E (e1 e2 e3)</small><b id="ee"></b></div><div class="stat violet"><small>Error position</small><b id="ep"></b></div></div></div></div>
        <div class="controls"><span class="faint">received R (click to corrupt)</span><span id="rr"></span></div>
        <div class="controls"><button class="btn teal" id="fx">Correct ▸</button><button class="btn ghost" id="rs">Re-encode</button></div>
        <div class="callout" id="msg" style="min-height:48px"></div></div>`);
      root.appendChild(card);
      const encodeNow = () => {
        R = mv(G, D);
        hit = -1;
      };
      encodeNow();
      // prettier-ignore
      function draw() {
        qs("#dd", card).innerHTML = `<div class="genome">${D.map((v, i) => `<button class="gene ${v ? "good" : ""}" data-i="${i}" style="min-width:34px;height:34px">${v}</button>`).join("")}</div>`;
        qsa("#dd .gene", card).forEach((g) => (g.onclick = () => { D[+g.dataset.i] ^= 1; encodeNow(); draw(); }));
        qs("#mg", card).innerHTML = mat(G.map((row, i) => row.concat([`<b>${mv([row], D)[0]}</b>`])), { rl: ROWLAB, cl: ["d1", "d2", "d3", "d4", "R"] });
        const E = mv(H, R), pos = E[0] + 2 * E[1] + 4 * E[2];
        qs("#mh", card).innerHTML = mat(H.map((row, i) => row.concat([`<b>${E[i]}</b>`])), { rl: ["Bit 1", "Bit 2", "Bit 4"], cl: [1, 2, 3, 4, 5, 6, 7, "E"], hc: pos ? pos - 1 : -1 });
        qs("#ee", card).textContent = E.join(" ");
        qs("#ep", card).textContent = pos ? pos : "none";
        qs("#rr", card).innerHTML = `<div class="genome">${R.map((v, i) => `<button class="gene ${v ? "good" : ""}" data-i="${i}" style="min-width:36px;height:36px;flex-direction:column;${i === hit ? "border-color:var(--rose-ink)" : ""}"><span>${v}</span><small style="font-size:9px;font-weight:700">${ROWLAB[i]}</small></button>`).join("")}</div>`;
        qsa("#rr .gene", card).forEach((g) => (g.onclick = () => { const i = +g.dataset.i; R[i] ^= 1; hit = hit === i ? -1 : i; draw(); }));
        const out = mv(Mx, R), box = qs("#msg", card);
        if (!pos) { box.className = "callout teal"; box.innerHTML = `E is all zeros: no error found. D = M·R = <b>${out.join("")}</b>.`; }
        else { box.className = "callout amber"; box.innerHTML = `E = [${E.join(", ")}] = ${pos}: the highlighted column of H. Press <b>Correct</b> to flip bit ${pos}. (Corrupt <b>two</b> bits and this still points at a single, probably wrong, position.)`; }
      }
      qs("#fx", card).onclick = () => {
        const E = mv(H, R),
          pos = E[0] + 2 * E[1] + 4 * E[2];
        if (pos) {
          R[pos - 1] ^= 1;
          hit = -1;
        }
        draw();
      };
      qs("#rs", card).onclick = () => {
        encodeNow();
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a6-matrix-1",
          q: "Bit 5 is flipped in the codeword for data 1010, and separately bit 5 is flipped in the codeword for data 0111. How do the two E vectors compare?",
          opts: [
            "Identical: E depends only on which position flipped",
            "Different: E depends on the data as well",
            "Both are all zeros because bit 5 is a data bit",
          ],
          a: 0,
          why: "H · (codeword + error) = H · codeword + H · error = 0 + H · error. So E is just column 5 of H, [1, 0, 1], whatever the data.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-matrix-2",
          q: "In the demo, press Correct after flipping one bit. What does M·R then return?",
          opts: ["The original 4 data bits", "The full 7-bit codeword again", "The error position as a number"],
          a: 0,
          why: "After the flip is undone, M picks positions 3, 5, 6 and 7, which are exactly the original data bits.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "G (7 × 4) encodes: R = G·D. Its rows are the parity table plus identity rows.",
            "H (3 × 7) has the positions 1 to 7 in binary as columns. E = H·R, read as e1 + 2·e2 + 4·e3, is the error position.",
            "M (4 × 7) picks the data bits at positions 3, 5, 6, 7. H·G = 0 mod 2.",
          ],
          "All three steps are matrix products mod 2: encode, check, decode.",
        ),
      );
    },
  });

  const at = (steps, title) => steps.findIndex((s) => s.t === title);
  /* ============ 6.7 Hamming (deepened) ============ */
  /* ---------- Hamming runners ---------- */
  // prettier-ignore
  function hamEncRun(box, life) {
    const D = [1, 1, 0, 1];
    const P1 = D[0] ^ D[1] ^ D[3], P2 = D[0] ^ D[2] ^ D[3], P3 = D[1] ^ D[2] ^ D[3];
    function* frames() {
      yield { p: [], cap: "Data bits <b>d1 d2 d3 d4 = 1 1 0 1</b>. We fill in the three parity bits one at a time." };
      yield { p: [P1], use: [0, 1, 3], cap: `p1 = d1 ⊕ d2 ⊕ d4 = 1 ⊕ 1 ⊕ 1 = <b>${P1}</b>.` };
      yield { p: [P1, P2], use: [0, 2, 3], ask: { q: "p2 = d1 ⊕ d3 ⊕ d4 with d1 = 1, d3 = 0, d4 = 1. What is p2?", pick: ".c6-ch", a: [String(P2)], why: "1 ⊕ 0 ⊕ 1 = 0: two 1s cancel." }, cap: `p2 = d1 ⊕ d3 ⊕ d4 = 1 ⊕ 0 ⊕ 1 = <b>${P2}</b>.` };
      yield { p: [P1, P2, P3], use: [1, 2, 3], ask: { q: "p3 = d2 ⊕ d3 ⊕ d4 with d2 = 1, d3 = 0, d4 = 1. What is p3?", pick: ".c6-ch", a: [String(P3)], why: "1 ⊕ 0 ⊕ 1 = 0." }, cap: `p3 = d2 ⊕ d3 ⊕ d4 = 1 ⊕ 0 ⊕ 1 = <b>${P3}</b>.` };
      yield { p: [P1, P2, P3], use: [], done: true, mood: "love", cap: `Arrange as p1 p2 d1 p3 d2 d3 d4: the codeword is <b>${str(hEnc(D))}</b>.` };
    }
    simpleRun(box, life, {
      code: ["p1 = d1 ⊕ d2 ⊕ d4", "p2 = d1 ⊕ d3 ⊕ d4", "p3 = d2 ⊕ d3 ⊕ d4", "output p1 p2 d1 p3 d2 d3 d4"],
      frames,
      html: (f) => {
        const vals = [f.p[0], f.p[1], D[0], f.p[2], D[1], D[2], D[3]], lab = ["p1", "p2", "d1", "p3", "d2", "d3", "d4"];
        return `${cellRow(D.map((b, k) => cell(b, { c: f.use && f.use.includes(k) ? "violet" : undefined, sub: "d" + (k + 1), w: 36 })), "data")}
          ${cellRow(vals.map((v, k) => cell(v === undefined ? "?" : v, { c: [0, 1, 3].includes(k) && v !== undefined ? (f.done ? "teal" : "amber") : undefined, sub: lab[k], w: 36 })), "codeword")}${chips([0, 1])}`;
      },
    });
  }

  // prettier-ignore

  function hamDecRun(box, life) {
    const R = bitsOf("1010111"); // codeword 1010101 with bit 6 flipped
    const fixed = hFix(R);
    const GROUPS = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]], NAMES = ["p1", "p2", "p3"];
    function* frames() {
      const s = hChecks(R), pos = hSyn(R);
      yield { r: R, g: -1, res: [], cap: "Received <b>1010111</b>. At most one bit is wrong. Check each parity group: its bits must XOR to 0." };
      for (let g = 0; g < 3; g++) {
        const vals = GROUPS[g].map((j) => R[j]);
        const ask = g === 1 ? { q: `Group p2 covers positions 2, 3, 6, 7, which hold ${vals.join(", ")}. What do they XOR to?`, pick: ".c6-ch", a: [String(s[g])], why: `${vals.join(" ⊕ ")} = ${s[g]}. A 1 means the check fails.` } : null;
        yield { r: R, g, res: s.slice(0, g + 1), ask, cap: `Group <b>${NAMES[g]}</b> covers positions ${GROUPS[g].map((j) => j + 1).join(", ")}: ${vals.join(" ⊕ ")} = <b>${s[g]}</b>${s[g] ? " (fails)" : " (holds)"}.` };
      }
      yield { r: R, g: 3, res: s, ask: { q: `The checks (p3 p2 p1) read ${s[2]} ${s[1]} ${s[0]}, which is ${pos} in binary. Tap the wrong bit.`, pick: ".cell[data-k]", a: [String(pos)], why: `${s[2]}${s[1]}${s[0]} = ${pos}.` }, cap: `Reading the failed checks as a binary number, p3 p2 p1 = ${s[2]}${s[1]}${s[0]} = <b>${pos}</b>. Position ${pos} is the flipped bit.` };
      yield { r: fixed, g: 4, res: s, flipped: pos, mood: "love", cap: `Flip bit ${pos} back: <b>${str(fixed)}</b>. The data sit at positions 3, 5, 6, 7: <b>${str(hData(fixed))}</b>.` };
    }
    simpleRun(box, life, {
      code: ["for each parity group: XOR its bits", "read the failed checks as a binary number", "if non-zero: flip that position", "take the data bits from positions 3, 5, 6, 7"],
      frames,
      html: (f) => `${cellRow(f.r.map((b, j) => cell(b, { k: j + 1, sub: j + 1, c: f.flipped === j + 1 ? "teal" : f.g >= 0 && f.g < 3 && GROUPS[f.g].includes(j) ? "violet" : undefined, w: 36 })), "received")}
        <div class="c6-row">${[0, 1, 2].map((g) => `<span class="faint">${NAMES[g]}</span>${cell(f.res[g] === undefined ? "?" : f.res[g], { c: f.res[g] === undefined ? undefined : f.res[g] ? "rose" : "teal", w: 34 })}`).join("")}</div>${chips([0, 1])}`,
    });
  }
  const allCodewords = () =>
    Array.from({ length: 16 }, (_, n) => {
      const d = [8, 4, 2, 1].map((w) => (n & w ? 1 : 0));
      return [str(d), str(hEnc(d))];
    });
  const flipOf = (cw, ...pos) => {
    const o = bitsOf(cw);
    pos.forEach((p) => (o[p - 1] ^= 1));
    return o;
  };
  const hamL = L["a6-hamming"],
    hamM = N.modules.find((m) => m.id === "a6-hamming");
  hamL.steps[0].b = `<p>A 7-bit Hamming codeword puts <b>parity bits at positions 1, 2 and 4</b> (the powers of two) and your 4 data bits at 3, 5, 6 and 7. In the lecture's order the word is $p_1\\, p_2\\, d_1\\, p_3\\, d_2\\, d_3\\, d_4$. (This lesson calls the third parity bit p4 after its position 4; it is the lecture's $p_3$.)</p>`;
  hamL.steps[0].v = F.cells([
    { v: "p1", sub: "1", c: "violet" },
    { v: "p2", sub: "2", c: "violet" },
    { v: "d1", sub: "3" },
    { v: "p3", sub: "4", c: "violet" },
    { v: "d2", sub: "5" },
    { v: "d3", sub: "6" },
    { v: "d4", sub: "7" },
  ]);
  hamL.steps[1].c = {
    q: "Which positions does the parity bit at position 2 (p2) check?",
    o: ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "2, 4, 6"],
    a: 1,
    why: "Those are the positions whose binary has the middle bit set: 010, 011, 110, 111.",
  };
  hamL.steps.splice(
    2,
    0,
    {
      t: "The encoding equations",
      b: `<p>Written as sums mod 2, each parity bit is the XOR of the data bits in its group:</p>$$p_1 = d_1\\oplus d_2\\oplus d_4,\\quad p_2 = d_1\\oplus d_3\\oplus d_4,\\quad p_3 = d_2\\oplus d_3\\oplus d_4$$<p>Worked example: data $0011$ means $d_1=0,\\ d_2=0,\\ d_3=1,\\ d_4=1$.</p>`,
      v: F.frames([
        {
          t: "p1 = 0 ⊕ 0 ⊕ 1 = <b>1</b>",
          v: F.cells([
            { v: "1", c: "amber", sub: "p1" },
            "?",
            { v: "0", sub: "d1" },
            "?",
            { v: "0", sub: "d2" },
            { v: "1", sub: "d3" },
            { v: "1", sub: "d4" },
          ]),
        },
        {
          t: "p2 = 0 ⊕ 1 ⊕ 1 = <b>0</b>, p3 = 0 ⊕ 1 ⊕ 1 = <b>0</b>",
          v: F.cells([{ v: "1", c: "amber" }, { v: "0", c: "amber" }, "0", { v: "0", c: "amber" }, "0", "1", "1"]),
        },
        {
          t: "Codeword <b>1000011</b>",
          v: F.cells(["1", "0", "0", "0", "0", "1", "1"], { label: "p1 p2 d1 p3 d2 d3 d4" }),
        },
      ]),
      c: {
        q: "Data bits are 1010 (d1 = 1, d2 = 0, d3 = 1, d4 = 0). What is p3 = d2 ⊕ d3 ⊕ d4?",
        o: ["0", "1"],
        a: 1,
        why: "0 ⊕ 1 ⊕ 0 = 1. The full codeword is 1011010.",
      },
    },
    {
      t: "Encode it by hand",
      b: `<p>Now you fill in the parity bits for data <span class="mono">1101</span>. Tap the right value when asked.</p>`,
      v: (box, life) => hamEncRun(box, life),
    },
    {
      t: "Three circles",
      b: `<p>Picture three overlapping circles, one per parity bit. Each circle holds its parity bit and the data bits it covers; <b>d4 sits in all three</b>, d1 in p1 and p2, d2 in p1 and p3, d3 in p2 and p3.</p><p>A flipped bit breaks <b>exactly the circles that contain it</b>: an error in p1 alone breaks circle p1; in d1, circles p1 and p2; in d4, all three.</p>`,
      v: F.frames(
        [
          [1, "p1 alone"],
          [3, "d1 (position 3)"],
          [7, "d4 (position 7)"],
        ].map(([pos, name]) => {
          const r = flipOf("1010101", pos);
          return { t: `Flip ${name}`, v: venn(r, hChecks(r).map(Boolean), pos) };
        }),
      ),
      c: {
        q: "In the circle picture, only circles p1 and p3 are violated. Which bit flipped?",
        o: ["d1", "d2", "d3", "d4"],
        a: 1,
        why: "d2 is the only bit inside circles p1 and p3 but outside p2. (d1 is in p1 and p2, d3 in p2 and p3, d4 in all three.)",
      },
    },
  );
  hamL.steps.splice(
    at(hamL.steps, "Failed checks spell the position") + 1,
    0,
    {
      t: "Decode by hand",
      b: `<p>Received: <span class="mono">1010111</span>. Check each group, read the syndrome, find the bad bit and recover the data.</p>`,
      v: (box, life) => hamDecRun(box, life),
    },
    {
      t: "Why exactly three parity bits",
      b: `<p>Three checks can each pass or fail: $2^3 = 8$ outcomes. Seven positions plus "no error" is also 8, so every outcome is used. That is why 7 bits is the perfect size for 3 parity bits; more parity bits give longer codes with the same idea.</p><p>The code has 16 codewords (one per 4-bit input). Any two of them differ in at least <b>3</b> positions, which is exactly why a single flip can be repaired.</p>`,
      v: table(
        ["Data", "Codeword", "Data", "Codeword", "Data", "Codeword", "Data", "Codeword"],
        [0, 1, 2, 3].map((row) =>
          allCodewords()
            .filter((_, i) => i % 4 === row)
            .flatMap(([d, c]) => [`<span class="mono">${d}</span>`, `<span class="mono">${c}</span>`]),
        ),
        700,
      ),
      c: {
        q: "Hamming(15,11) uses 4 parity bits. How many different 'syndrome' outcomes can its checks produce?",
        o: ["4", "15", "16", "11"],
        a: 2,
        why: "Four checks give $2^4 = 16$ outcomes: 'no error' plus 15 positions.",
      },
    },
  );
  hamL.steps[at(hamL.steps, "The limit: one error")] = {
    t: "The limit: one error",
    b: `<p>Hamming(7,4) corrects <b>exactly one</b> flipped bit. With two flips, the syndrome still points somewhere, but at an innocent bit, so the "fix" makes things worse: the decoder <b>adds another error</b>. A plain Hamming code can notice that something is wrong with two errors, but cannot repair them. Adding one extra overall parity bit (<b>SECDED</b>) lets you reliably <i>detect</i> double errors.</p>`,
    v: F.frames([
      { t: "Sent 1010101", v: F.cells(["1", "0", "1", "0", "1", "0", "1"]) },
      {
        t: "Bits 2 and 5 flip in transit",
        v: F.cells(["1", { v: "1", c: "rose", sub: "2" }, "1", "0", { v: "0", c: "rose", sub: "5" }, "0", "1"]),
      },
      {
        t: "Syndrome 111 = 7: the decoder flips bit 7 too, giving 1110000",
        v: F.cells(["1", { v: "1", c: "rose" }, "1", "0", { v: "0", c: "rose" }, "0", { v: "0", c: "rose", sub: "7" }]),
      },
    ]),
    c: {
      q: "Two bits flip in a Hamming(7,4) codeword. The decoder applies its usual fix. What is the result?",
      o: [
        "The right data, because both errors were repaired",
        "Three wrong bits: it flipped an innocent third bit",
        "No change at all, since the syndrome is zero",
        "A crash, since two errors cannot be processed",
      ],
      a: 1,
      why: "The two errors combine into a syndrome that points at a third position. Flipping it leaves the word 3 bits from the original, so the 'repair' damages it further.",
    },
  };
  hamL.guide = [
    "Click one bit of the codeword to corrupt it. The syndrome names its position.",
    "Press <b>Correct</b>. The codeword is fixed.",
    "Now flip <i>two</i> bits and press <b>Correct</b>. Is the codeword repaired?",
    "Press <b>Try every error</b> to count how many one-bit and two-bit errors get repaired.",
  ];
  hamM.order = 7;
  hamM.num = "6.7";
  const hamRender = hamM.render;
  hamM.render = function (root, life) {
    hamRender.call(this, root, life);
    const tail = root.lastElementChild,
      pred = tail.previousElementSibling;
    const allCard = el(
      `<div class="card"><div class="card-head"><h3>Try every error</h3><span class="faint">all 16 codewords, every one-bit and every two-bit flip</span></div><div class="controls"><button class="btn primary" id="all">Try every error ▸</button></div><div class="callout" id="allm" style="min-height:48px">Press the button to test the decoder against every possible one-bit and two-bit error.</div></div>`,
    );
    root.insertBefore(allCard, pred);
    qs("#all", allCard).onclick = () => {
      let s1 = 0,
        s1ok = 0,
        s2 = 0,
        s2ok = 0,
        dist3 = 0;
      for (let n = 0; n < 16; n++) {
        const d = [8, 4, 2, 1].map((w) => (n & w ? 1 : 0)),
          cw = hEnc(d);
        for (let i = 0; i < 7; i++) {
          const r = cw.slice();
          r[i] ^= 1;
          s1++;
          if (str(hFix(r)) === str(cw)) s1ok++;
        }
        for (let i = 0; i < 7; i++)
          for (let j = i + 1; j < 7; j++) {
            const r = cw.slice();
            r[i] ^= 1;
            r[j] ^= 1;
            const f = hFix(r);
            s2++;
            if (str(f) === str(cw)) s2ok++;
            else if (f.filter((b, k) => b !== cw[k]).length === 3) dist3++;
          }
      }
      const m = qs("#allm", allCard);
      m.className = "callout amber";
      m.innerHTML = `<b>One flip:</b> ${s1ok} of ${s1} repaired. <b>Two flips:</b> ${s2ok} of ${s2} repaired, and ${dist3} ended up with a word exactly 3 bits from the original. The decoder never notices.`;
    };
    root.insertBefore(
      predict({
        id: "a6-ham-2",
        q: "A Hamming(7,4) codeword is hit by two flips. Press 'Try every error' and compare. Roughly how often does the usual one-syndrome fix recover the original?",
        opts: [
          "Never: every two-bit error ends in a wrong word",
          "About half the time",
          "Always, as long as the flips are far apart",
        ],
        a: 0,
        why: "Any two flips give a syndrome equal to the XOR of their positions, a third position. Flipping that leaves a different valid codeword, three bits from the original, so the result is always wrong.",
      }),
      tail,
    );
  };
})();
