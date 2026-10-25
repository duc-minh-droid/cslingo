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

  // ---- figures for the Hamming steps (tap, read, see) ----
  // tap the four data bits: each check bit is the evenness tally of its own group
  // prettier-ignore
  function parityToggle(box) {
    const d = [0, 0, 1, 1],
      grp = [
        ["p1", [0, 1, 3]],
        ["p2", [0, 2, 3]],
        ["p3", [1, 2, 3]],
      ],
      out = el(`<div class="fig-wrap" aria-live="polite"></div>`);
    const draw = () => {
      const rows = grp.map(([p, ix]) => {
        const n = ix.reduce((s, i) => s + d[i], 0);
        return [`<b>${p}</b> checks ${ix.map((i) => "d" + (i + 1)).join(", ")}`, ix.map((i) => d[i]).join(" "), `${n} one${n === 1 ? "" : "s"}`, `<b>${n % 2}</b>`];
      });
      const r = hEnc(d);
      out.innerHTML =
        `<div class="genome" style="display:flex;justify-content:center;gap:6px">${d.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i}" aria-label="data bit d${i + 1}, ${b}" style="min-width:46px;height:50px;flex-direction:column;font-size:17px"><span>${b}</span><small style="font-size:12px">d${i + 1}</small></button>`).join("")}</div>` +
        table(["Check bit", "its group", "count", "so it is"], rows, 520) +
        F.cells(r.map((b, i) => ({ v: b, sub: ROWLAB[i], c: [0, 1, 3].includes(i) ? "amber" : undefined })), { label: "codeword" });
      out.querySelectorAll(".gene").forEach(
        (g) =>
          (g.onclick = () => {
            d[+g.dataset.i] ^= 1;
            draw();
          }),
      );
    };
    box.appendChild(out);
    draw();
  }
  // tap a position to flip it: the checks that fail add up to its label
  // prettier-ignore
  function checkTap(box) {
    const base = hEnc([1, 0, 1, 0]),
      CH = [
        [1, [1, 3, 5, 7]],
        [2, [2, 3, 6, 7]],
        [4, [4, 5, 6, 7]],
      ],
      out = el(`<div class="fig-wrap" aria-live="polite"></div>`);
    let hit = 5;
    const draw = () => {
      const r = base.map((b, i) => (i + 1 === hit ? b ^ 1 : b)),
        s = hChecks(r),
        bad = CH.filter((_, k) => s[k]).map((c) => c[0]);
      out.innerHTML =
        `<div class="genome" style="display:flex;justify-content:center;gap:6px">${r.map((b, i) => `<button class="gene ${b ? "good" : ""}" data-i="${i + 1}" aria-label="flip position ${i + 1}" style="min-width:42px;height:56px;flex-direction:column;${i + 1 === hit ? "border-color:var(--rose-ink)" : ""}"><span>${b}</span><small style="font-size:11px">${(i + 1).toString(2).padStart(3, "0")}</small></button>`).join("")}</div>` +
        table(["Check", "looks at positions", "result"], CH.map(([w, ps], k) => ({ c: [w, ps.join(" "), s[k] ? "fails" : "passes"], bad: !!s[k] })), 520) +
        `<div class="callout ${hit ? "rose" : "teal"}">${hit ? `Failed checks ${bad.join(" and ")}: ${bad.join(" + ")} = <b>${hSyn(r)}</b>, so position ${hSyn(r)} is the flipped bit.` : "Every check passes: nothing is wrong."} <span class="faint">Tap a position to flip it (tap again to undo).</span></div>`;
      out.querySelectorAll(".gene").forEach(
        (g) =>
          (g.onclick = () => {
            hit = hit === +g.dataset.i ? 0 : +g.dataset.i;
            draw();
          }),
      );
    };
    box.appendChild(out);
    draw();
  }
  // the four data bits sit at fixed positions of the corrected word: lift them out
  // prettier-ignore
  function pickData() {
    const R = [0, 1, 0, 0, 1, 0, 1],
      at = (i) => 10 + i * 60,
      dat = [2, 4, 5, 6];
    const rect = (x, y, b, on) => `<rect x="${x}" y="${y}" width="50" height="44" rx="9" fill="${on ? "color-mix(in srgb, var(--teal) 18%, var(--panel-2))" : "var(--panel-2)"}" stroke="${on ? "var(--teal)" : "var(--line-2)"}" stroke-width="2.5"/><text x="${x + 25}" y="${y + 29}" class="fig-n">${b}</text>`;
    return `<svg class="fig" viewBox="0 0 430 215" style="max-height:230px" role="img" aria-label="The corrected word 0100101. Positions 3, 5, 6 and 7 hold the data bits, which drop out as 0101. Positions 1, 2 and 4 are check bits and are left behind.">${R.map((b, i) => rect(at(i), 14, b, dat.includes(i)) + `<text x="${at(i) + 25}" y="80" class="fig-sub" style="text-anchor:middle">${["p1", "p2", "d1", "p3", "d2", "d3", "d4"][i]} (pos ${i + 1})</text>`).join("")}${dat.map((i, k) => `<line x1="${at(i) + 25}" y1="90" x2="${at(i) + 25}" y2="142" stroke="var(--teal)" stroke-width="3" class="draw"/>` + rect(at(i), 148, R[i], true) + `<text x="${at(i) + 25}" y="208" class="fig-sub" style="text-anchor:middle">data d${k + 1}</text>`).join("")}<text x="${at(1) + 25}" y="140" class="fig-sub" style="text-anchor:middle">check bits stay behind</text></svg>`;
  }
  // one whole trip: encode 1010, noise flips position 5, the receiver repairs it and lifts the data out
  // prettier-ignore
  function tripRun(box, life) {
    const D = [1, 0, 1, 0],
      R = hEnc(D),
      Rb = R.slice(),
      pos = 5;
    Rb[pos - 1] ^= 1;
    const fixed = hFix(Rb),
      row = (a, l, c) => cellRow(a.map((b, k) => cell(b, { w: 34, k: k + 1, sub: l === "data" ? "d" + (k + 1) : k + 1, c: c && c(k + 1) })), l);
    function* frames() {
      yield { k: 0, cap: "<b>Encode.</b> The four data bits <b>1010</b> go in. Three check bits are worked out from them and slotted in at positions 1, 2 and 4." };
      yield { k: 1, cap: `The 7-bit word is <b>${str(R)}</b>. Check bits are orange.` };
      yield { k: 2, cap: `Noise on the wire flips the bit at position ${pos}: the receiver gets <b>${str(Rb)}</b>.` };
      yield { k: 3, ask: { q: "<b>Correct.</b> The three checks fail at weights 1 and 4. Which bit is wrong? Tap it.", pick: ".cell[data-k]", a: [String(pos)], why: "Failed checks 1 and 4 add up to 5, so position 5 is the one flipped." }, cap: "<b>Correct.</b> Run the three checks on the received word. Checks 1 and 4 fail: 1 + 4 = 5." };
      yield { k: 4, cap: `Flip position ${pos} back: the word is <b>${str(fixed)}</b> again. One pass over seven bits.` };
      yield { k: 5, mood: "love", cap: `<b>Decode.</b> Read positions 3, 5, 6 and 7: <b>${str(hData(fixed))}</b>. Data 1010 is back.` };
    }
    simpleRun(box, life, {
      code: ["R = encode(D): add the three check bits", "run the three checks on R", "failed checks add up to position i; if i is not 0, flip bit i", "D = bits 3, 5, 6, 7 of R"],
      frames,
      html: (f) =>
        f.k === 0 ? row(D, "data")
        : f.k === 1 ? row(R, "sent", (p) => ([1, 2, 4].includes(p) ? "amber" : ""))
        : f.k < 4 ? row(Rb, "received", (p) => (p === pos && f.k === 2 ? "rose" : ""))
        : f.k === 4 ? row(fixed, "corrected", (p) => (p === pos ? "teal" : ""))
        : row(fixed, "corrected", (p) => ([3, 5, 6, 7].includes(p) ? "blue" : "")) + row(hData(fixed), "data", () => "blue"),
    });
  }

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
      { t: "The parity-check matrix H", b: `<p>Every position from 1 to 7 has a 3-digit binary label: 1 is 001, 2 is 010, 3 is 011, up to 7 = 111. The three checks are built on those labels. <b>Check 1</b> looks at every position whose label ends in 1, <b>check 2</b> at those with a 1 in the middle, <b>check 4</b> at those with a 1 at the front.</p><p>Now flip any one bit. The checks that fail are exactly the ones that look at that position, so their weights (1, 2, 4) add up to its label, which is its <b>position</b>. Failed checks 1 and 4 mean position 5, because 1 + 4 = 5. No failures means no error. Tap a position below to see it.</p><details class="math-more"><summary>Show the maths</summary><p>$H$ has three rows (called Bit 1, Bit 2, Bit 4) and 7 columns. <b>Column $j$ is the number $j$ written in binary</b>, lowest bit on top. Multiply the received word: $E = H\\,R$. If $E$ is all zeros there is no error; otherwise read $E = [e_1, e_2, e_3]^T$ as $e_1 + 2e_2 + 4e_3$: the position of the flipped bit.</p>${mat(H, { rl: ["Bit 1", "Bit 2", "Bit 4"], cl: [1, 2, 3, 4, 5, 6, 7] })}<p class="faint">Example: R = 1011110 (data 1010, bit 5 flipped) gives E = [1, 0, 1], and 1·1 + 0·2 + 1·4 = <b>5</b>.</p></details>`,
        v: (box) => checkTap(box),
        c: { q: "In the Hamming(7,4) code, checks 2 and 4 fail and check 1 passes. Which position was flipped?", o: ["6", "3", "7", "5"], a: 0, why: "Check 2 looks at positions 2, 3, 6, 7 and check 4 at 4, 5, 6, 7. Only position 6 is in both, and check 1 (1, 3, 5, 7) does not include it. In other words 2 + 4 = 6." } },
      { t: "The decoding matrix M", b: `<p>Once the error is fixed, the four data bits sit in fixed places of the 7-bit word: positions 3, 5, 6 and 7. Positions 1, 2 and 4 hold check bits that have done their job. Getting the data out is just <b>reading those four places</b> and ignoring the rest.</p><p>Example: the corrected word <span class="mono">0100101</span> gives data <span class="mono">0101</span>. Always correct first: a flipped data bit would otherwise be copied straight into the answer.</p><details class="math-more"><summary>Show the maths</summary><p>The decoding matrix $M$ has one row per data bit and a single 1 in the right column, so $D = M\\,R$ just picks them out. For example $R = [0,1,0,0,1,0,1]^T$ gives $D = [0,1,0,1]^T$. With no correction needed that is the data; with an error you apply $H$ and flip first.</p>${mat(Mx, { rl: ["d1", "d2", "d3", "d4"], cl: [1, 2, 3, 4, 5, 6, 7] })}</details>`,
        v: pickData(),
        c: { q: "After correction the 7-bit word is 0110100. Which four data bits does the receiver read out?", o: ["1100", "0110", "0100", "1010"], a: 0, why: "The data live at positions 3, 5, 6 and 7. In 0110100 those are 1, 1, 0, 0. (The first four bits, 0110, include check bits.)" } },
      { t: "Three procedures, three costs", b: `<p>Hamming's code is three small jobs done in order. <b>Encode</b>: turn the 4 data bits into a 7-bit word by adding three check bits. <b>Correct</b>: run the three checks on what arrived, add up the weights of the checks that fail, and flip the bit at that position. <b>Decode</b>: lift the four data bits out of their fixed places.</p><p>Each job is a single pass over a handful of bits, so the cost grows in step with the length of the word: no searching and no trial and error. Step through one whole trip below: data 1010 is sent, noise flips a bit, and the receiver repairs it.</p><details class="math-more"><summary>Show the maths</summary><p>$H\\,G$ is the all-zero matrix, so every codeword gives $E = 0$ and any single flip gives a syndrome that depends <b>only on where it is</b>, not on the data. Encoding is one product, $O(N)$ for $N$ codeword bits; correction multiplies by $H$ ($O(K)$ for $K$ parity bits); decoding multiplies by $M$ ($O(M)$ for $M$ data bits).</p><pre class="fig-wrap mono" style="font-size:13.5px;line-height:1.55;margin:0">Encoding(D):      R = G · D                  (mod 2)
Correction(R):    E = H · R
                  i = e1·1 + e2·2 + e3·4
                  if i ≠ 0: flip bit i of R
Decoding(R):      D = M · R

check: H · G = ${JSON.stringify(H.map((hr) => [0, 1, 2, 3].map((c) => G.reduce((s, g, k) => s ^ (hr[k] & g[c]), 0))))}   (every entry 0)</pre></details>`,
        v: (box, life) => tripRun(box, life),
        c: { q: "Why must the receiver correct the word before lifting the data out?", o: ["A flipped data bit would be copied into the output", "The data positions move until the word is corrected", "Lifting the data out needs the check bits at zero first", "Correcting is cheaper, so it always has to go first"], a: 0, why: "Lifting the data just copies positions 3, 5, 6 and 7. If the noise hit one of those, the copy carries the error. Correction needs all 7 bits, so it comes first." } },
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
      b: `<p>Each check bit is a tally over its own group of data bits. It is chosen so that its group, check bit included, holds an <b>even</b> number of 1s. So to find a check bit, count the 1s in its group: an odd count gives a check bit of 1, an even count gives 0.</p><p>Take data <span class="mono">0011</span>. p1 looks at d1, d2 and d4: 0, 0, 1, one 1, so p1 = 1. p2 looks at d1, d3 and d4: 0, 1, 1, two 1s, so p2 = 0. p3 looks at d2, d3 and d4: 0, 1, 1, so p3 = 0. The codeword is <b>1000011</b>. Tap the data bits below to try your own.</p><details class="math-more"><summary>Show the maths</summary><p>Written as sums mod 2, each parity bit is the XOR of the data bits in its group:</p>$$p_1 = d_1\\oplus d_2\\oplus d_4,\\quad p_2 = d_1\\oplus d_3\\oplus d_4,\\quad p_3 = d_2\\oplus d_3\\oplus d_4$$</details>`,
      v: (box) => parityToggle(box),
      c: {
        q: "p1 covers d1, d2 and d4; p2 covers d1, d3 and d4; p3 covers d2, d3 and d4. You flip only d3. Which check bits must change?",
        o: ["p2 and p3", "p1 and p2", "p1 and p3", "All three"],
        a: 0,
        why: "A check bit changes only if the flipped bit is in its group. d3 is in the groups of p2 and p3 but not p1. (d4 would change all three.)",
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
    b: `<p>Hamming(7,4) corrects <b>exactly one</b> flipped bit. With two flips, the syndrome still points somewhere, but at an innocent bit, so the "fix" makes things worse: the decoder <b>adds another error</b>.</p><p>It cannot even tell that two bits flipped, because a two-flip word looks exactly like a one-flip word from a different codeword. One extra overall parity bit (<b>SECDED</b>) fixes that: the decoder can then <i>detect</i> a double error instead of "repairing" it.</p>`,
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
