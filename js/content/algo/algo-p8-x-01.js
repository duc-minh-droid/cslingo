/* algo-p8-x-01: shared helpers, 8.1 ciphers and 8.2 one-way functions (ported from the vault). */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const S = (NIC.shared.algoP8 = NIC.shared.algoP8 || {});

  const reg = (m) => N.register({ subject: "algo", lecture: 8, ...m });
  // ---------- shared helpers ----------
  const toy = (s) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const modpow = (b, e, m) => {
    let r = 1;
    b %= m;
    while (e > 0) {
      if (e & 1) r = (r * b) % m;
      b = (b * b) % m;
      e = Math.floor(e / 2);
    }
    return r;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const caesar = (s, k) =>
    [...s]
      .map((c) => {
        const x = c.charCodeAt(0);
        return x >= 65 && x <= 90 ? String.fromCharCode(((((x - 65 + k) % 26) + 26) % 26) + 65) : c;
      })
      .join("");
  const TONE = {
    teal: "var(--teal)",
    blue: "var(--blue)",
    amber: "var(--amber)",
    rose: "var(--rose)",
    violet: "var(--violet)",
  };
  const bx = (t, c, extra = "") =>
    `<span style="display:inline-block;padding:6px 10px;margin:3px;border-radius:10px;border:2px solid ${TONE[c] || "var(--line-2)"};background:${c ? `color-mix(in srgb, ${TONE[c]} 14%, var(--panel))` : "var(--panel)"};font:800 14px var(--sans);${extra}">${t}</span>`;
  const tile = (k, t) =>
    `<span class="a8-tile" data-k="${k}" style="display:inline-block;min-width:46px;text-align:center;padding:8px 14px;margin:4px;border-radius:12px;border:2px solid var(--line-2);background:var(--panel);font:900 15px var(--sans);cursor:pointer">${t}</span>`;
  const tiles = (label, list) =>
    `<div style="margin-top:10px"><small class="faint" style="font-weight:800">${label}</small><div>${list.map(([k, t]) => tile(k, t)).join("")}</div></div>`;
  const tbl = (head, rows, mw = 560) =>
    `<table class="t" style="max-width:${mw}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const yesno = (label) =>
    tiles(label, [
      ["yes", "yes"],
      ["no", "no"],
    ]);

  /** A runner whose frames are plain objects {cap, html, line?, ask?: {q, a, why, tiles: html}}.
      The tiles of an ask are drawn on the frame before it, so they exist when the question pauses the run. */
  function runner(box, life, o) {
    F.run(box, life, {
      code: o.code,
      build(stage) {
        const v = el(`<div style="padding:6px 4px;min-height:${o.minH || 190}px;line-height:1.5"></div>`);
        stage.appendChild(v);
        return { v };
      },
      *frames() {
        const fr = o.frames();
        for (let i = 0; i < fr.length; i++) {
          const nx = fr[i + 1];
          const f = { ...fr[i] };
          if (nx && nx.ask) {
            f.html += nx.ask.tiles || "";
            nx.ask = { q: nx.ask.q, pick: ".a8-tile", a: nx.ask.a, why: nx.ask.why, tiles: nx.ask.tiles };
          }
          yield f;
        }
      },
      draw(s, f) {
        s.v.innerHTML = f.html;
      },
    });
  }

  const addStep = (id, at, step) => {
    if (L[id]) L[id].steps.splice(at, 0, step);
  };
  /* ============================================================
     8.1  Ciphers and the key problem
     ============================================================ */
  function caesarRun(box, life) {
    const KEY = 5,
      PLAIN = "SECRET",
      CT = caesar(PLAIN, KEY),
      WORDS = ["SECRET", "CIPHER", "ATTACK", "HELLO"];
    const ctRow = `<div>Intercepted: ${bx(CT, "rose", "letter-spacing:2px")} <span class="faint">method known, shift unknown (1 to 25)</span></div>`;
    const table = (tried, cur) =>
      `<table class="t" style="max-width:420px;margin-top:8px"><tr><th>shift</th><th>decrypt with it</th><th></th></tr>${tried
        .map((k) => {
          const c = caesar(CT, -k),
            ok = WORDS.includes(c);
          return `<tr class="${k === cur ? "hl" : ""}"><td class="mono">${k}</td><td class="mono">${c}</td><td>${ok ? "a word" : "gibberish"}</td></tr>`;
        })
        .join("")}</table>`;
    runner(box, life, {
      code: [
        "ciphertext known, method known",
        "for shift k = 1 … 25:",
        "    guess = slide every letter back by k",
        "    if guess reads as a word: stop",
        "the key is k",
      ],
      frames() {
        const out = [
          {
            cap: `A shift cipher has only <b>25 keys</b>. You hold <b>${CT}</b> and know the method. Try the keys one by one.`,
            line: 0,
            html: ctRow + table([], 0),
          },
        ];
        const tried = [];
        for (let k = 1; k <= 25; k++) {
          tried.push(k);
          const c = caesar(CT, -k),
            ok = WORDS.includes(c);
          const f = {
            cap: `Slide every letter back by <b>${k}</b>: ${CT} becomes <b>${c}</b>.`,
            line: 2,
            html: ctRow + table(tried.slice(), k),
          };
          if (k === 3 || ok)
            f.ask = {
              q: `Shift ${k} gives <b>${c}</b>. Is that readable? Tap yes or no.`,
              a: ok ? "yes" : "no",
              tiles: yesno("Does it read as a word?"),
              why: ok
                ? `Yes: <b>${c}</b> is a word, so the key is ${k}.`
                : `No, ${c} is gibberish, so move on to the next shift.`,
            };
          out.push(f);
          if (ok) break;
        }
        out.push({
          cap: `Found after ${tried.length} tries: the key was <b>${KEY}</b>. Twenty-five keys is nothing for a computer: the cipher's <b>key space is far too small</b>.`,
          line: 4,
          mood: "love",
          html: ctRow + table(tried, KEY),
        });
        return out;
      },
    });
  }

  reg({
    id: "a8-cipher",
    order: 1,
    num: "8.1",
    title: "Ciphers and the key problem",
    blurb:
      "Plaintext in, ciphertext out, a key in between: crack a shift cipher, flip bits with XOR, and meet the problem the rest of the week solves.",
    render(root) {
      root.appendChild(header(this, ""));
      let mode = "enc",
        shift = 3;
      const card =
        el(`<div><div class="card"><div class="card-head"><h2>Shift cipher</h2><span class="faint">letters only; other characters are left alone</span></div>
        <div class="controls"><label class="field">Text <input type="text" id="tx" value="MEET AT NOON" maxlength="30" style="width:210px"></label><span id="seg"></span></div>
        <div id="sl"></div>
        <div class="stat-row"><div class="stat"><small id="inl">Plaintext</small><b class="mono" id="inv">·</b></div><div class="stat violet"><small>Key</small><b id="kv">3</b></div><div class="stat teal"><small id="outl">Ciphertext</small><b class="mono" id="outv">·</b></div></div>
        <details style="margin-top:10px"><summary><b>Attacker's view:</b> try all 25 keys on the output</summary><div id="all" style="margin-top:8px"></div></details></div>
        <div class="card" style="margin-top:14px"><div class="card-head"><h2>XOR with a key</h2><span class="faint">tap a bit to flip it</span></div>
        <div id="xor"></div><div class="callout" id="xnote" style="margin-top:10px"></div></div></div>`);
      root.appendChild(card);
      qs("#seg", card).appendChild(
        N.seg(
          [
            ["enc", "Encrypt"],
            ["dec", "Decrypt"],
          ],
          mode,
          (v) => {
            mode = v;
            draw();
          },
        ),
      );
      const sl = N.slider("Key (shift)", 0, 25, 1, 3, (v) => v);
      sl.onInput((v) => {
        shift = v;
        draw();
      });
      qs("#sl", card).appendChild(sl);
      qs("#tx", card).oninput = draw;
      function draw() {
        const t = (qs("#tx", card).value || "").toUpperCase();
        const out = caesar(t, mode === "enc" ? shift : -shift);
        qs("#inl", card).textContent = mode === "enc" ? "Plaintext" : "Ciphertext";
        qs("#outl", card).textContent = mode === "enc" ? "Ciphertext" : "Plaintext";
        qs("#inv", card).textContent = t || "·";
        qs("#outv", card).textContent = out || "·";
        qs("#kv", card).textContent = shift;
        const rows = [];
        for (let k = 1; k <= 25; k++) {
          const c = caesar(out, -k);
          rows.push(`<tr class="${c === t ? "hl" : ""}"><td class="mono">${k}</td><td class="mono">${c}</td></tr>`);
        }
        qs("#all", card).innerHTML =
          `<div class="log" style="max-height:220px"><table class="t" style="max-width:420px"><tr><th>guess</th><th>decrypt the output with it</th></tr>${rows.join("")}</table></div><p class="faint" style="font-size:13px">Highlighted row: the one that gives back your text (in Encrypt mode). An attacker just looks for the row that reads as language.</p>`;
      }
      draw();
      let m = [1, 0, 1, 1, 0, 0],
        k = [0, 1, 1, 0, 1, 0];
      const xdraw = () => {
        const c = m.map((b, i) => b ^ k[i]),
          back = c.map((b, i) => b ^ k[i]);
        const row = (lab, arr, tone, flip) =>
          `<div style="display:flex;align-items:center;gap:6px;margin:4px 0"><span style="width:104px;font-weight:800;font-size:13px" class="dim">${lab}</span>${arr.map((b, i) => `<button class="btn small ${tone}" ${flip ? `data-f="${flip}" data-i="${i}"` : "disabled"} style="min-width:36px">${b}</button>`).join("")}</div>`;
        qs("#xor", card).innerHTML =
          row("message", m, "", "m") +
          row("key", k, "ghost", "k") +
          row("message ⊕ key", c, "primary") +
          row("⊕ key again", back, "");
        qs("#xnote", card).className = "callout teal";
        qs("#xnote", card).innerHTML =
          "XOR with the same key twice gives the message back. Same key to lock and unlock: that is a <b>symmetric</b> cipher.";
        qsa("[data-f]", card).forEach(
          (b) =>
            (b.onclick = () => {
              (b.dataset.f === "m" ? m : k)[+b.dataset.i] ^= 1;
              xdraw();
            }),
        );
      };
      xdraw();
      root.appendChild(
        predict({
          id: "a8-cipher-1",
          q: "A cipher has about a trillion keys (2<sup>40</sup>). A laptop tests a million keys a second. Roughly how long to try them all?",
          opts: ["a few seconds", "about 12 days", "about 30,000 years"],
          a: 1,
          why: "A trillion divided by a million per second is a million seconds, and a day has about 86,000 seconds, so roughly 12 days. A shift cipher's 25 keys fall instantly; even a trillion keys is not much for a determined attacker, which is why modern keys have 128 bits or more.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-cipher-2",
          q: "In the XOR card, you XOR a message with a key, then XOR the result with the <b>same</b> key. What do you get?",
          opts: ["The original message again", "The key itself, revealed", "A string of all zeros"],
          a: 0,
          why: "Flipping a bit twice restores it, so (M ⊕ K) ⊕ K = M. That is why one shared key both encrypts and decrypts in a symmetric cipher.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A cipher = a public method plus a secret <b>key</b>. Eve sees the ciphertext and knows the method.",
            "Classical ciphers fall to brute force (25 shifts) and to letter-frequency analysis. Key space and structure both matter.",
            "Symmetric: one shared key, fast. Public-key: a key pair, slower. Both leave the same question: how do the two sides get a key safely?",
          ],
          "Everything is secret except the key, so the key must travel safely.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a8-cipher"] = {
    sum: "A cipher turns <b>plaintext</b> into <b>ciphertext</b> using a key, and Eve sees everything on the wire. Classical ciphers fall to brute force and frequency counts; modern symmetric ciphers are strong and fast but need a shared key. The problem of <b>sharing that key</b> through an insecure channel is what Diffie-Hellman and RSA solve.",
    steps: [
      { t: "The cipher system", b: `<p>A sender turns <b>plaintext</b> into <b>ciphertext</b> with an <b>encryption key</b>. The ciphertext crosses an <b>insecure channel</b> such as the Internet, where an eavesdropper can copy every bit. The receiver uses a key to turn it back into plaintext.</p><p>We assume Eve knows the method. Only the key is secret.</p>`,
        v: F.flow([{ t: "Plaintext", s: "readable" }, { t: "Encrypt", s: "uses the key", c: "violet" }, { t: "Ciphertext", s: "Eve can read this", c: "rose" }, { t: "Decrypt", s: "uses a key", c: "violet" }, { t: "Plaintext", s: "readable again" }]),
        c: { q: "Eve copies every bit that crosses the channel and knows the method. What must still be unknown to her?", o: ["The method: it must stay hidden", "The key: the method may be public", "The channel: it must be guarded"], a: 1, why: "Secrecy rests on the key alone. Methods get studied, leaked and reverse-engineered, so a cipher should stay safe even when Eve knows exactly how it works." } },
      { t: "Classical: the shift cipher", b: `<p>The <b>Caesar shift</b> slides every letter along the alphabet by the key <b>k</b>, wrapping from Z back to A. With k = 3: H E L L O becomes <b>K H O O R</b>. To decrypt, slide back by 3.</p>`,
        v: F.cells(["H", "E", "L", "L", "O"].map((c) => ({ v: c, sub: "+3" })), { label: "plain" }) + F.cells([..."KHOOR"].map((c) => ({ v: c, c: "teal" })), { label: "cipher" }),
        c: { q: "Shift cipher, key 3. What does the letter Y become?", o: ["A", "B", "C"], a: 1, hint: "Count on from Y: Z, A, B.", why: "Y, then Z, then wrap to A, then B. Three steps lands on B." } },
      { t: "Watch it run: crack a shift", b: `<p>You intercept <b>XJHWJY</b> and know it is a shift cipher. Press <b>play</b> or step with the arrows: try every key until the output reads as a word.</p><p>It will pause twice and ask whether a guess is readable.</p>`,
        v: (box, life) => caesarRun(box, life) },
      { t: "Why classical ciphers fall", b: `<p><b>Too few keys.</b> A shift cipher has 25. Trying them all (<b>brute force</b>) takes a blink.</p><p><b>Structure survives.</b> Even a scrambled alphabet (about 4 × 10<sup>26</sup> keys) leaves letter counts intact: in English, E is the most common letter, so the most common ciphertext letter is probably E. This is <b>frequency analysis</b>.</p><span class="key">A strong cipher needs a huge key space and no statistical fingerprints.</span>`,
        v: F.bars([["E", 12.7, "teal"], ["T", 9.1, "teal"], ["A", 8.2, "teal"], ["O", 7.5, "teal"], ["Z", 0.1, "rose"]], { max: 14, fmt: (v) => v + "%" }) + `<div class="fig-cap">Typical English letter frequencies: a substitution cipher keeps this shape, just relabelled.</div>`,
        c: { q: "A message uses a scrambled-alphabet cipher with a vast key space. The letter Q is the most common letter in the ciphertext. Best first guess?", o: ["Q stands for E, the commonest English letter", "Q stands for Z, the rarest English letter", "Nothing can be learnt without trying every alphabet"], a: 0, why: "A substitution only relabels letters, so frequencies survive. The commonest cipher letter most likely stands for E, then T, A and so on." } },
      { t: "Modern symmetric ciphers", b: `<p>A <b>symmetric</b> cipher uses the <b>same key</b> to encrypt and to decrypt. Modern ones (DES, and its successor AES) scramble blocks of bits over many rounds and use keys of 128 bits or more, so brute force is hopeless.</p><p>The simplest building block is <b>XOR</b>: flip the message bits wherever the key bit is 1. Do it again and the message comes back.</p>`,
        v: tbl(["", "bits"], [["message M", `<span class="mono">1 0 1 1</span>`], ["key K", `<span class="mono">0 1 1 0</span>`], { c: ["C = M ⊕ K", `<span class="mono"><b>1 1 0 1</b></span>`], hl: true }, ["C ⊕ K", `<span class="mono">1 0 1 1 = M</span>`]], 360),
        c: { q: "What is 1100 XOR 1010 (XOR gives 1 when the two bits differ)?", o: ["0110", "1110", "1000"], a: 0, hint: "Compare column by column: 1,1 → 0; 1,0 → 1; 0,1 → 1; 0,0 → 0.", why: "Differ, differ... column by column: 0, 1, 1, 0, so 0110." } },
      { t: "Symmetric versus public key", b: `<p>Symmetric ciphers are <b>fast</b>, ideal for bulk data, but both sides need the same secret key. With <b>n</b> people who each need a private channel with everyone else, that is <b>n(n−1)/2</b> shared keys.</p><p>Public-key schemes give each person a <b>key pair</b>: anyone can lock with the public half, only the owner unlocks. That needs just n pairs, but the maths is slower.</p>`,
        v: tbl(["", "Symmetric", "Public key"], [["Keys", "one shared secret", "public + private pair"], ["Speed", "fast", "slow (heavy maths)"], ["Examples", "DES, AES", "RSA, Diffie-Hellman"], ["10 people", "45 shared keys", "10 key pairs"], ["Weak point", "getting the key across", "trusting whose key it is"]], 560),
        c: { q: "Ten staff each need a private symmetric channel with every other member of staff. How many shared keys?", o: ["20", "45", "90"], a: 1, hint: "10 × 9 = 90 ordered pairs, and each key serves both directions.", why: "10 × 9 / 2 = 45. The count grows with the square of the group, which is why key management becomes painful." } },
      { t: "The key distribution problem", b: `<p>The lecture's question: <b>how can two people share an encryption key through an insecure channel</b> such as the Internet? If the key is sent in the clear, Eve has it too.</p><p>Two answers follow in this phase: <b>Diffie-Hellman</b> lets them <i>build</i> a shared secret from public values, and <b>RSA</b> lets one side <i>lock the key</i> with the other's public key. In practice both are used only to set up a key, then a fast symmetric cipher carries the data.</p>`,
        v: F.flow([{ t: "Public-key step", s: "DH or RSA", c: "violet" }, { t: "Shared key", s: "now secret", c: "amber" }, { t: "Symmetric cipher", s: "fast, bulk data", c: "teal" }]),
        c: { q: "Why not use RSA for every byte of a long video call?", o: ["It is slow, so use it for the key and a fast cipher for the data", "RSA cannot encrypt anything longer than one word of text at a time", "RSA keys expire every few seconds, forcing constant renewal of the call"], a: 0, why: "Modular exponentiation on big numbers is far slower than a block cipher. Real systems hybridise: public-key crypto for the key, symmetric crypto for the bulk." } },
    ],
    guide: ["Move the <b>Key</b> slider and watch the ciphertext. Switch to <b>Decrypt</b>.", "Open the attacker's view panel: one row of the 25 always reads as your text.", "Tap bits in the XOR card and check that XOR-ing twice gives the message back.", "Answer the questions after the demo."],
  };
  /* ============================================================
     8.2  One-way functions
     ============================================================ */
  function sqmulRun(box, life) {
    const g = 5,
      e = 13,
      p = 23,
      bits = e.toString(2);
    const view = (
      i,
      r,
      note,
      mults,
      sqs,
    ) => `<div>Compute ${bx(`5<sup>13</sup> mod 23`, "violet")} <span class="faint">13 in binary is</span> ${[...bits].map((b, k) => bx(b, k === i ? "amber" : k < i ? "teal" : null)).join("")}</div>
      <div style="margin-top:8px">running result <b>r</b> = ${bx(r, "blue")} ${note ? `<span class="dim">${note}</span>` : ""}</div>
      <div class="faint" style="margin-top:6px">squarings so far: <b>${sqs}</b> &nbsp; extra multiplications: <b>${mults}</b></div>`;
    runner(box, life, {
      minH: 150,
      code: [
        "r = 1",
        "for each bit of the exponent, left to right:",
        "    r = r × r  (mod p)",
        "    if the bit is 1: r = r × g  (mod p)",
        "return r",
      ],
      frames() {
        const out = [
          {
            cap: `Raise <b>5</b> to the power <b>13</b>, modulo <b>23</b>, without ever writing 5<sup>13</sup> in full. Read the exponent's bits from the left; <b>r</b> starts at 1.`,
            line: 0,
            html: view(-1, 1, "", 0, 0),
          },
        ];
        let r = 1,
          m = 0,
          s = 0;
        for (let i = 0; i < bits.length; i++) {
          const sq = (r * r) % p;
          s++;
          out.push({
            cap: `Bit ${i + 1} of ${bits.length}. <b>Square</b>: ${r} × ${r} = ${r * r}, and mod 23 that is <b>${sq}</b>.`,
            line: 2,
            html: view(i, sq, `(${r}² mod 23)`, m, s),
          });
          r = sq;
          const one = bits[i] === "1";
          const ask =
            i === 2 || i === 3
              ? {
                  q: `This bit is <b>${bits[i]}</b>. Do we also multiply by 5 this round? Tap yes or no.`,
                  a: one ? "yes" : "no",
                  tiles: yesno("Multiply by g?"),
                  why: one ? "A 1 bit means multiply by g after squaring." : "A 0 bit means just square and move on.",
                }
              : null;
          if (one) {
            const mu = (r * g) % p;
            m++;
            out.push({
              cap: `The bit is 1, so multiply by 5: ${r} × 5 = ${r * g}, which is <b>${mu}</b> mod 23.`,
              line: 3,
              html: view(i, mu, `(${r} × 5 mod 23)`, m, s),
              ask,
            });
            r = mu;
          } else out.push({ cap: `The bit is 0: no extra multiplication.`, line: 3, html: view(i, r, "", m, s), ask });
        }
        out.push({
          cap: `5<sup>13</sup> mod 23 = <b>${r}</b>, after ${s} squarings and ${m} multiplications (${s + m} in all) instead of 12. For a 2048-bit exponent it is about 2048 squarings, not 10<sup>616</sup> multiplications.`,
          line: 4,
          mood: "love",
          html: view(bits.length, r, "done", m, s),
        });
        return out;
      },
    });
  }

  reg({
    id: "a8-owf",
    order: 2,
    num: "8.2",
    title: "One-way functions",
    blurb:
      "Easy to compute, hard to undo: the idea under both Diffie-Hellman and RSA. Race the forward direction against brute force.",
    render(root) {
      root.appendChild(header(this, ""));
      const PS = { 23: "23", 1009: "1,009", 100003: "100,003", 1000003: "1,000,003" };
      let p = 1009,
        secret = 0,
        y = 0;
      const g = 5;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Forward is easy, backward is search</h2><span class="faint">y = 5<sup>x</sup> mod p</span></div>
        <div class="controls"><span id="seg"></span></div>
        <div class="controls"><button class="btn primary" id="fw">1. Pick a secret x and compute y</button><button class="btn" id="bk" disabled>2. Break it: search for x from y</button></div>
        <div class="stat-row"><div class="stat"><small>Modulus p</small><b id="pv">1,009</b></div><div class="stat blue"><small>y (public)</small><b id="yv">·</b></div><div class="stat teal"><small>Forward cost</small><b id="fc">·</b></div><div class="stat rose"><small>Backward tries</small><b id="bc">·</b></div></div>
        <div class="callout" id="msg" style="min-height:56px">Pick a size for p, then press 1.</div></div>`);
      root.appendChild(card);
      const reset = () => {
        secret = 0;
        y = 0;
        ["#yv", "#fc", "#bc"].forEach((s) => (qs(s, card).textContent = "·"));
        qs("#bk", card).disabled = true;
        qs("#msg", card).className = "callout";
        qs("#msg", card).innerHTML = "Pick a size for p, then press 1.";
      };
      qs("#seg", card).appendChild(
        N.seg(
          Object.entries(PS).map(([v, l]) => [v, l]),
          String(p),
          (v) => {
            p = +v;
            qs("#pv", card).textContent = PS[p];
            reset();
          },
        ),
      );
      const mulCount = (x) => {
        const b = x.toString(2);
        return b.length + [...b].filter((c) => c === "1").length - 1;
      };
      qs("#fw", card).onclick = () => {
        secret = Math.floor(p * 0.55 + Math.random() * p * 0.4);
        y = modpow(g, secret, p);
        qs("#yv", card).textContent = y.toLocaleString();
        qs("#fc", card).textContent = "~" + mulCount(secret) + " steps";
        qs("#bc", card).textContent = "·";
        qs("#bk", card).disabled = false;
        const m = qs("#msg", card);
        m.className = "callout teal";
        m.innerHTML = `Forward: x was chosen at random and y computed with square-and-multiply in about <b>${mulCount(secret)}</b> steps. Now pretend you only know p, 5 and y.`;
      };
      qs("#bk", card).onclick = () => {
        let r = 1,
          t = 0;
        do {
          r = (r * g) % p;
          t++;
        } while (r !== y);
        qs("#bc", card).textContent = t.toLocaleString();
        const m = qs("#msg", card);
        m.className = "callout amber";
        m.innerHTML = `Backward: no shortcut, so trying x = 1, 2, 3 … took <b>${t.toLocaleString()}</b> tries against about ${mulCount(secret)} steps forwards. Make p 1000 times bigger and the search is about 1000 times longer; the forward cost only grows by about 10 steps.`;
      };
      root.appendChild(
        predict({
          id: "a8-owf-1",
          q: "You make the modulus 1000 times bigger (about 10 more bits). What happens to the cost of computing <b>y from x</b>?",
          opts: ["It grows 1000-fold too", "It only grows by about 10 steps", "It stays exactly the same"],
          a: 1,
          why: "Square-and-multiply does a few operations per bit of the exponent, so 10 more bits means roughly 10 to 20 more steps. The brute-force reverse grows with p itself, a thousand times here.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-owf-2",
          q: "Square-and-multiply for an exponent around 1,000 (10 bits) needs roughly how many modular multiplications?",
          opts: ["about 15", "about 1,000", "about 500,000"],
          a: 0,
          why: "Ten squarings plus at most ten extra multiplies. Counting up one multiplication per unit of the exponent would need about 1,000, and that is exactly what repeated squaring avoids.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "One-way: <b>easy to compute, believed hard to reverse</b>. Nobody has proved any candidate is truly one-way.",
            "Multiplying primes is easy, factoring is hard. Modular exponentiation is easy (square-and-multiply), the discrete log is hard.",
            "Cost forwards grows with the number of bits; cost backwards grows with the number itself.",
          ],
          "One-way functions are easy downhill and brutal uphill, and cryptography lives on that asymmetry.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a8-owf"] = {
    sum: "A <b>one-way function</b> is quick to compute and believed hard to reverse. Public-key cryptography is built on two: multiplying primes (reverse: factoring) and modular exponentiation (reverse: the discrete logarithm).",
    steps: [
      { t: "Easy one way, hard back", b: `<p>A <b>one-way function</b> F is "easy" to compute and "difficult" to reverse. Think of scrambling an egg or snapping a padlock shut: trivial in one direction, impractical in the other.</p><p>Nobody has proved that any function is truly one-way. We <b>believe</b> it because nobody has found a fast way back.</p>`,
        v: F.flow([{ t: "x", s: "input" }, { t: "F(x)", s: "easy", c: "teal" }, { t: "y", s: "output" }, { t: "x from y?", s: "hard", c: "rose" }]),
        c: { q: "Which description fits a one-way function?", o: ["Quick forwards, no known fast way back", "Slow forwards, quick to reverse", "Quick both ways, but needs a secret key"], a: 0, why: "One-way means an asymmetry in effort. A function that is quick both ways with a key is a cipher, not a one-way function." } },
      { t: "Multiplying versus factoring", b: `<p>Multiply 47 × 59 and you get <b>2773</b> in seconds. Hand someone 2773 and ask for its two prime factors and they must try dividing by 2, 3, 5, 7 ... up to about 52, one prime at a time.</p><p>With two 512-bit primes the product has about 300 digits, and trial division is hopeless. <b>RSA</b> rests on this.</p>`,
        v: F.compare({ title: "47 × 59 = ?", c: "teal", body: "one multiplication<br><b>2773</b>" }, { title: "2773 = ? × ?", c: "rose", body: "try primes up to 52<br>(15 candidates here, astronomically many for big n)" }),
        c: { q: "Which direction is believed to be hard?", o: ["Multiplying two 500-digit primes together", "Factoring the product back into primes", "Adding the two 500-digit primes together"], a: 1, why: "Multiplication takes a fraction of a second even for huge numbers. Recovering the factors has no known fast method." } },
      { t: "Modular exponentiation", b: `<p>The second one-way function is f(b) = a<sup>b</sup> mod n: <b>raise a to a power, keeping only the remainder</b>.</p><p>It looks heavy, but is easy. <b>Square-and-multiply</b> reads the exponent's bits: square the running result for every bit, multiply by a for each 1. That takes about <b>log₂ b</b> steps. Reduce mod n at every step, so the numbers never grow.</p>`,
        v: F.bars([["exponent 13", 12, "rose", "12 naive multiplications"], ["square-and-multiply", 7, "teal", "7 mod-multiplications"]], { max: 12 }) + `<div class="fig-cap">An exponent of one million needs about 20 squarings with the clever method, against 999,999 naive multiplications.</div>`,
        c: { q: "Why is a<sup>b</sup> mod n computed with repeated squaring rather than by multiplying a by itself b times?", o: ["It needs about log b steps instead of b", "It gives a different, more secure answer", "It avoids needing the modulus n"], a: 0, why: "Both methods give the same answer. Repeated squaring just needs only a few steps per bit of b, which is what makes RSA and DH practical." } },
      { t: "Watch it run: square and multiply", b: `<p>Compute 5<sup>13</sup> mod 23. Press <b>play</b> or step with the arrows: every bit squares the running result, and a 1 bit also multiplies by 5.</p><p>It will ask whether a bit needs the extra multiply.</p>`,
        v: (box, life) => sqmulRun(box, life) },
      { t: "The reverse: the discrete logarithm", b: `<p>Now the other direction: given a, n and the answer y, find <b>b</b> with a<sup>b</sup> mod n = y. The values of 5<sup>x</sup> mod 23 bounce around with <b>no pattern</b> that points back to x.</p><p>For a prime n there is no known fast general method, so the practical approach is to try x = 1, 2, 3 ... This is the <b>discrete logarithm</b>, and <b>Diffie-Hellman</b> relies on it.</p>`,
        v: tbl(["x", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], [["5<sup>x</sup> mod 23", ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => modpow(5, x, 23))]], 640),
        c: { q: "Using the table of 5<sup>x</sup> mod 23, which smallest x gives the value 9?", o: ["8", "10", "12"], a: 1, why: "Scan the row: x = 10 holds 9. With no pattern, scanning is all you can do." } },
      { t: "How big is hard?", b: `<p>Brute-forcing the reverse takes up to <b>n</b> tries, and n doubles with every extra bit. The forward direction only needs a few steps <b>per bit</b>.</p><p>That is why real parameters have <b>thousands of bits</b>: forwards stays fast, backwards becomes impossible.</p>`,
        v: tbl(["Bits in n", "Forward (about)", "Backward tries (about)"], [["20", "30 steps", "1 million"], ["40", "60 steps", "1 trillion"], ["60", "90 steps", "1 quintillion"], ["2048", "3,000 steps", "more than atoms in the universe"]], 560),
        c: { q: "Doubling the number of bits in n roughly does what to the forward cost and the brute-force cost?", o: ["Forward roughly doubles; backward is squared (huge)", "Both roughly double", "Forward is squared; backward roughly doubles"], a: 0, why: "Forward cost is per bit, so it scales with the bit length. Backward cost scales with n = 2^bits, so doubling the bits squares it." } },
      { t: "Where each one is used", b: `<p><b>Diffie-Hellman</b> publishes g<sup>a</sup> mod p: modular exponentiation going out, discrete log protecting it.</p><p><b>RSA</b> encrypts with M<sup>e</sup> mod n (easy) and is secured by the difficulty of factoring n = pq, because the factors give away the private key.</p>`,
        v: tbl(["Scheme", "Easy direction", "Hard reverse"], [["Diffie-Hellman", "g<sup>a</sup> mod p", "find a (discrete log)"], ["RSA", "p × q = n and M<sup>e</sup> mod n", "factor n into p and q"]], 560),
        c: { q: "Which scheme's security rests on factoring a product of two large primes?", o: ["RSA", "Diffie-Hellman", "XOR with a shared key"], a: 0, why: "RSA publishes n = pq; recovering p and q lets you compute the private key. Diffie-Hellman rests on the discrete log instead." } },
    ],
    guide: ["Choose a size for p, press <b>1</b>, then press <b>2</b>. Compare the two costs.", "Repeat with a bigger p. Which cost grows with p, and which barely moves?", "Answer the questions after the demo."],
  };
  Object.assign(S, { toy, modpow, gcd, TONE, bx, tiles, tbl, yesno, runner, addStep, reg });
})();
