/* js/content/algo/algo-p9-x-13.js: Phase 10 extra lessons (overflow): 10.9 Course recap. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const seg = (o, v, f) =>
    N.seg(
      o.map(([a, l]) => [String(a), l]),
      String(v),
      f,
    );
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap } = shared;
  const tile = (v, c, extra = "") =>
    `<span style="display:inline-grid;place-items:center;min-width:46px;height:46px;padding:0 8px;border-radius:10px;background:var(--${c}-dim);border:2px solid var(--${c});font:900 17px var(--sans);${extra}">${v}</span>`;

  // 10.9 step 3: three overlapping checks; the failing ones spell the position of the flipped bit
  function hammingFig(box) {
    const W = [1, 0, 0, 0, 0, 1, 1],
      LAB = ["p1", "p2", "d1", "p3", "d2", "d3", "d4"],
      CH = [1, 2, 4];
    const host = el(`<div style="padding:4px"></div>`);
    const show = (flip) => {
      const r = W.map((b, i) => (i + 1 === flip ? 1 - b : b));
      const bad = CH.filter((c) => r.reduce((s, b, i) => s + ((i + 1) & c ? b : 0), 0) % 2);
      const pos = bad.reduce((a, b) => a + b, 0);
      const G =
        "display:grid;grid-template-columns:62px repeat(7,minmax(0,1fr)) 54px;gap:4px;align-items:center;max-width:560px";
      const row = r
        .map(
          (b, i) =>
            `<span style="text-align:center">${tile(b, i + 1 === flip ? "rose" : [0, 1, 3].includes(i) ? "amber" : "blue", "min-width:0;width:100%;box-sizing:border-box")}<div class="faint" style="font:800 11px var(--sans)">${i + 1} ${LAB[i]}</div></span>`,
        )
        .join("");
      const checks = CH.map((c, k) => {
        const ok = !bad.includes(c);
        return `<b style="font-size:13px">Check ${k + 1}</b>${r.map((_, i) => `<i style="height:12px;border-radius:4px;background:var(--${(i + 1) & c ? (ok ? "teal" : "rose") : "bg-2"})"></i>`).join("")}<b style="font-size:13px;color:var(--${ok ? "teal" : "rose"}-ink)">${ok ? "pass" : "fail"}</b>`;
      }).join("");
      host.innerHTML = `<div style="${G}"><span></span>${row}<span></span>${checks}</div><div style="font-weight:800;margin-top:8px">${
        pos
          ? `Failing checks ${bad.map((c) => CH.indexOf(c) + 1).join(" and ")} are worth ${bad.join(" + ")} = <b>${pos}</b>: flip bit ${pos} back.`
          : "All three checks pass: no error."
      }</div>`;
    };
    box.append(
      el(`<div class="faint" style="font-size:13px;margin-bottom:4px">Flip one bit of 1000011:</div>`),
      seg([["0", "none"], ...W.map((_, i) => [i + 1, "bit " + (i + 1)])], "0", (v) => show(+v)),
      host,
    );
    show(0);
  }

  // 10.9 step 5: RSA as a padlock, with real numbers computed live
  function rsaFig(box) {
    const modpow = (b, e, m) => {
      let r = 1n;
      for (b %= m; e > 0n; e >>= 1n, b = (b * b) % m) if (e & 1n) r = (r * b) % m;
      return r;
    };
    let msg = 31,
      st = 0;
    const host = el(`<div style="padding:4px"></div>`),
      note = el(`<div style="font-weight:800;margin-top:6px;min-height:44px"></div>`);
    const show = () => {
      const C = modpow(BigInt(msg), 17n, 2773n),
        back = modpow(C, 157n, 2773n);
      const dim = (on) => `opacity:${on ? 1 : 0.18};transition:opacity .3s`;
      const arrow = (t, on) =>
        `<span style="text-align:center;font:800 12px var(--sans);color:var(--text-dim);max-width:104px;${dim(on)}">${t}<br>&#8594;</span>`;
      host.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap"><span style="text-align:center">${tile(msg, "blue")}<div class="faint" style="font:800 11px var(--sans)">message</div></span>${arrow("lock with the public key", st > 0)}<span style="text-align:center;${dim(st > 0)}">${tile(C, "amber")}<div class="faint" style="font:800 11px var(--sans)">on the wire</div></span>${arrow("unlock with the private key", st > 1)}<span style="text-align:center;${dim(st > 1)}">${tile(back, "teal")}<div class="faint" style="font:800 11px var(--sans)">unlocked</div></span></div>`;
      note.textContent = [
        `Bob wants to receive the number ${msg} in secret.`,
        `Anyone can lock it using Bob's public key (17 and 2773): ${msg} becomes ${C}. A spy who sees ${C} cannot go backwards.`,
        `Only Bob has the private key (157), and it turns ${C} back into ${back}.`,
      ][st];
    };
    box.append(
      seg(
        [
          [31, "message 31"],
          [100, "message 100"],
          [2000, "message 2000"],
        ],
        "31",
        (v) => {
          msg = +v;
          show();
        },
      ),
      el(`<div style="height:6px"></div>`),
      seg(
        [
          [0, "1 Message"],
          [1, "2 Lock"],
          [2, "3 Unlock"],
        ],
        "0",
        (v) => {
          st = +v;
          show();
        },
      ),
      host,
      note,
    );
    show();
  }

  reg({
    id: "a10-recap",
    order: 9,
    num: "10.9",
    title: "Course recap: eight algorithms",
    blurb:
      "The revision lecture in one place: what each family of algorithms is for, with the worked examples to practise.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const PAIRS = [
        ["Shrink a file without losing anything", "LZW / Huffman coding"],
        ["Detect that some bits of a message were corrupted", "CRC"],
        ["Correct a single flipped bit", "Hamming (7,4)"],
        ["Chain records so that tampering is visible", "Blockchain hashes"],
        ["Send a secret to someone using their public key", "RSA"],
        ["Split a signal into its frequencies quickly", "FFT"],
        ["Find the outline that wraps a set of points", "Graham scan / gift wrapping"],
        ["Rank web pages by importance", "PageRank"],
      ];
      const OPTS = PAIRS.map((p) => p[1]);
      const card =
        el(`<div class="card"><div class="card-head"><h2>Match the job to the algorithm</h2><span class="faint">tap an answer for each job, then check</span></div><div id="rows"></div>
        <div class="controls"><button class="btn primary" id="chk">Check my matches</button><span class="faint" id="res"></span></div></div>`);
      root.appendChild(card);
      const pick = PAIRS.map(() => -1),
        order = OPTS.map((_, i) => i);
      const rows = qs("#rows", card);
      PAIRS.forEach((pr, i) => {
        const row = el(
          `<div style="margin:8px 0;padding:8px 10px;border:2px solid var(--line);border-radius:12px"><div style="font-weight:800;margin-bottom:6px">${pr[0]}</div><div class="controls" style="gap:6px"></div></div>`,
        );
        const box = qs(".controls", row);
        order.forEach((o) => {
          const b = el(`<button class="btn small ghost" data-o="${o}">${OPTS[o]}</button>`);
          b.onclick = () => {
            pick[i] = o;
            qsa("button", box).forEach((x) => x.classList.toggle("primary", x === b));
          };
          box.append(b);
        });
        rows.append(row);
      });
      qs("#chk", card).onclick = () => {
        let ok = 0;
        qsa("#rows > div", card).forEach((row, i) => {
          const good = pick[i] === i;
          if (good) ok++;
          row.style.borderColor = pick[i] < 0 ? "var(--line)" : good ? "var(--teal)" : "var(--rose)";
        });
        qs("#res", card).textContent = `${ok} of ${PAIRS.length} correct`;
      };
      root.appendChild(
        predict({
          id: "a10-recap-1",
          q: "Hamming (7,4) with data bits d1 d2 d3 d4 = 0 0 1 1 sends the 7-bit word 1000011. Bit 3 of the received word flips. What does the receiver do?",
          opts: [
            "Rechecks the three parities, reads off position 3 and flips that bit back",
            "Asks the sender to transmit the whole word again, as plain CRC would",
            "Detects that an error occurred but cannot say where it is",
          ],
          a: 0,
          why: "Hamming (7,4) corrects any single-bit error: the failing parity checks together spell out the position of the bad bit.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-recap-2",
          q: "The exam has 4 questions of 25 marks each. How many marks is a whole paper worth?",
          opts: ["100", "60", "25"],
          a: 0,
          why: "4 × 25 = 100. (The exam is 60% of the module.)",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Course landscape: <b>compression, error correction, encryption</b>; <b>networking algorithms</b>; <b>time-frequency conversion</b>; <b>graph algorithms and PageRank</b>; <b>optimisation</b> (bracketing, Nelder-Mead, simplex, Kalman filtering).",
            "LZW on A B A B A B A B A emits codewords 0 1 2 4 3 and learns AB, BA, ABA, ABAB on the way.",
            "Hamming (7,4): parity bits p1, p2, p3 are XORs of different data-bit triples; data 0011 gives the word 1000011.",
            "RSA: ciphertext C = M<sup>e</sup> mod n, and M = C<sup>d</sup> mod n with the private key d (587<sup>157</sup> mod 2773 = 31).",
            "Blockchain: changing one record changes its hash, which changes every later hash.",
            "The exam: four questions in two hours, 25 marks each, 60% of the module.",
          ],
          "Every algorithm is a trade: what it assumes, and what it buys.",
        ),
      );
    },
  });
  L["a10-recap"] = {
    sum: "A one-page map of the course with the worked examples from the revision lecture: LZW, Hamming (7,4), blockchain and RSA.",
    steps: [
      {
        t: "The landscape",
        b: `<p>The course covers algorithms from across computing. Revision starts with this map:</p>`,
        v: table(
          ["Theme", "Algorithms"],
          [
            ["Data compression, error correction, encryption", "Huffman, LZW, CRC, Hamming, blockchain hashing, RSA"],
            ["Networking", "Internet routing, graph search"],
            ["Time to frequency", "Fourier transform, FFT"],
            ["Graphs", "Minimum spanning trees, PageRank"],
            ["Geometry", "Gift wrapping, Graham scan"],
            ["Optimisation methods", "Bracketing, Nelder-Mead, simplex, Kalman filtering"],
          ],
        ),
        c: {
          q: "Which theme do the Fourier transform and the FFT belong to?",
          o: ["Time to frequency conversion", "Graph algorithms and PageRank", "Encryption and error correction"],
          a: 0,
          why: "They convert a signal between the time domain and the frequency domain.",
        },
      },
      {
        t: "LZW worked example",
        b: `<p>Start with a dictionary A = 0, B = 1. Read the input and extend the current match while it is in the dictionary; when it is not, output the code of the match, add the longer string as a new entry and restart from the last character.</p><p>For <code>A B A B A B A B A</code> the output is <b>0, 1, 2, 4, 3</b>.</p>`,
        v: table(
          ["current match", "output code", "new dictionary entry"],
          [
            ["A", "0", "AB = 2"],
            ["B", "1", "BA = 3"],
            ["AB", "2", "ABA = 4"],
            ["ABA", "4", "ABAB = 5"],
            ["BA (end of input)", "3", "none"],
          ],
        ),
        c: {
          q: "In the example the codeword 4 stands for…",
          o: ["ABA", "AB", "BA"],
          a: 0,
          why: "The dictionary learned AB = 2, BA = 3 and ABA = 4 as it went.",
        },
      },
      {
        t: "Hamming (7,4) worked example",
        b: `<p>Hamming adds three check bits to four data bits. Each check watches a different, overlapping group of the seven positions. If one bit flips, exactly the checks that watch that position complain, and the complaining checks, read as a number (check 1 is worth 1, check 2 is worth 2, check 3 is worth 4), spell out <b>where</b> the bad bit is.</p><p>Example: the data 0011 is sent as the word 1000011. Flip bit 5 in the picture: checks 1 and 3 fail, and 1 + 4 = 5.</p><details class="math-more"><summary>Show the maths</summary><p>Data bits $d_1d_2d_3d_4=0011$. The parity bits are XORs: $p_1=d_1\\oplus d_2\\oplus d_4=1$, $p_2=d_1\\oplus d_3\\oplus d_4=0$, $p_3=d_2\\oplus d_3\\oplus d_4=0$. The 7-bit word is $p_1\\,p_2\\,d_1\\,p_3\\,d_2\\,d_3\\,d_4=1000011$. If one bit flips, the three parity checks fail in a pattern that names the position.</p></details>`,
        v: (box) => hammingFig(box),
        c: {
          q: "In the 7-bit word, bit 5 flips. Which parity checks fail?",
          o: ["Checks 1 and 3", "Checks 2 and 3", "Only check 3"],
          a: 0,
          hint: "Check 1 watches positions 1, 3, 5, 7. Check 2 watches 2, 3, 6, 7. Check 3 watches 4, 5, 6, 7.",
          why: "Position 5 is watched by check 1 and check 3 but not check 2, so those two fail, and 1 + 4 = 5 names the bad bit.",
        },
      },
      {
        t: "Blockchain",
        b: `<p>Each record stores the hash of the previous one. Change one record and its hash changes, which no longer matches what the next record stored, so the change <b>propagates forward</b> and every later hash changes too. That is what makes tampering visible.</p>`,
        v:
          F.flow([
            { t: "Record 1", s: "hash H1", c: "blue" },
            { t: "Record 2", s: "stores H1", c: "blue" },
            { t: "Record 3", s: "stores H2", c: "blue" },
          ]) + cap("Alter record 1: H1 changes, so record 2 and H2 change, so record 3 changes."),
        c: {
          q: "One old record in a hash chain is altered. What happens?",
          o: [
            "All the following hashes change",
            "Only that record's hash changes",
            "Nothing, since hashes are stored once",
          ],
          a: 0,
          why: "Each record includes the previous hash, so the change ripples forward.",
        },
      },
      {
        t: "RSA worked example",
        b: `<p>RSA works like a padlock you can hand out. Anyone may snap it shut using the receiver's <b>public key</b>, but only the receiver's <b>private key</b> opens it. The message goes in as a number, the lock scrambles it into another number, and only the key holder can turn it back.</p><p>Example with tiny numbers (real ones have hundreds of digits): the message 31 locks to 587, and the private key turns 587 back into 31. Try other messages in the picture.</p><details class="math-more"><summary>Show the maths</summary><p>With $n=2773$ ($=47\\times59$) and private key $d=157$, a received ciphertext $C=587$ is decrypted by $M=C^{d}\\bmod n=587^{157}\\bmod 2773=\\mathbf{31}$. The matching public exponent is $e=17$, and indeed $31^{17}\\bmod 2773=587$. Computers do this with repeated squaring, not by writing out $587^{157}$.</p>${table(
          ["", "value"],
          [
            ["n = p × q", "47 × 59 = 2773"],
            ["public key", "e = 17"],
            ["private key", "d = 157"],
            { c: ["decrypt C = 587", "587<sup>157</sup> mod 2773 = <b>31</b>"], hl: true },
          ],
        )}</details>`,
        v: (box) => rsaFig(box),
        c: {
          q: "In RSA, who needs the private exponent d?",
          o: ["The receiver, to decrypt", "The sender, to encrypt", "Everyone, to verify the public key"],
          a: 0,
          why: "The public key encrypts; only the holder of the private key decrypts.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Eight jobs, eight algorithms. Tap an answer for each job and press <b>Check my matches</b>.</p>`,
        v: F.cells([
          { v: "job", c: "blue" },
          "→",
          { v: "assumption", c: "violet" },
          "→",
          { v: "algorithm", c: "teal" },
        ]),
      },
    ],
    guide: [
      "Tap one algorithm under each job, then press <b>Check my matches</b>.",
      "Fix the red rows and check again.",
      "Answer the questions after the demo.",
    ],
  };
})();
