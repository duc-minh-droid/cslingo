/* Phase 8 — Cryptography & Blockchain: hash chains, proof of work, DH, RSA */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  const djb2 = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const modpow = (b, e, m) => {
    let r = 1;
    b %= m;
    while (e) {
      if (e & 1) r = (r * b) % m;
      b = (b * b) % m;
      e >>= 1;
    }
    return r;
  };

  /* ============ 8.1 Hash chains & PoW ============ */
  L["a8-hash"] = {
    sum: "A hash is a short <b>fingerprint</b> of any data: same input, same fingerprint; change one letter and the fingerprint changes completely. Chain fingerprints together and any edit to history <b>shows up in every later block</b>.",
    steps: [
      {
        t: "What a hash promises",
        b: `<p>A hash function turns any input into a fixed-size fingerprint (the <b>digest</b>).</p><p><b>Deterministic</b>: same input, same digest, every time.<br><b>Avalanche</b>: a tiny change gives a totally different digest.<br><b>One-way</b>: you can't work backwards from the digest to the input.</p>`,
        v: (box) => {
          box.innerHTML =
            F.cells([{ v: '"cat"' }, "→", { v: djb2("cat"), c: "teal" }]) +
            F.cells([{ v: '"cot"' }, "→", { v: djb2("cot"), c: "rose" }]) +
            `<div class="fig-cap">One letter changed and the fingerprint is unrecognisable. (This demo uses djb2, a <b>toy</b> hash. Real systems use SHA-256.)</div>`;
        },
      },
      {
        t: "Chain the fingerprints",
        b: `<p>Each block stores the <b>previous block's hash</b> inside it. So block 2's fingerprint depends on block 1's, which depends on block 0's, and so on.</p>`,
        v: F.flow([
          { t: "Block 0", s: "hash → a1f…" },
          { t: "Block 1", s: "prev = a1f…" },
          { t: "Block 2", s: "prev = 7c2…" },
          { t: "Block 3", s: "prev = e90…", c: "teal" },
        ]),
      },
      {
        t: "Tampering shows downstream",
        b: `<p>Change the data in block 1 and its hash changes. Now block 2's stored "prev" no longer matches, and the chain visibly breaks from that point on.</p>`,
        v: F.flow([
          { t: "Block 0", s: "✓", c: "teal" },
          { t: "Block 1", s: "data edited", c: "rose" },
          { t: "Block 2", s: "prev ≠ hash ✗", c: "rose" },
          { t: "Block 3", s: "✗", c: "rose" },
        ]),
        c: {
          q: "An attacker edits block 1 and then recomputes every later hash. What does validation say?",
          o: [
            "It catches it, because chains prevent tampering",
            "It passes: the rebuilt chain is self-consistent",
            "It depends on which nonces were chosen",
          ],
          a: 1,
          why: "With full write access you can always rebuild a clean-looking chain. Deciding which chain is the real one is the job of consensus.",
        },
      },
      {
        t: "Proof of work: expensive to make, cheap to check",
        b: `<p><b>Mining</b> means finding a nonce that makes the block's hash start with some zeros. The only way is trial and error, and each extra hex zero multiplies the work by <b>16</b>. <b>Checking</b> someone's answer takes one hash.</p>`,
        v: F.bars(
          [
            ["1 zero", 16, "teal", "tries"],
            ["2 zeros", 256, "teal"],
            ["3 zeros", 4096, "amber"],
            ["4 zeros", 65536, "rose"],
          ],
          { max: 65536, fmt: (v) => "≈ " + v.toLocaleString() },
        ),
        c: {
          type: "cat",
          q: "What does proof of work actually give you? Sort each claim.",
          buckets: ["Proof of work gives this", "It does not give this"],
          items: [
            ["Rewriting history costs real work, if honest miners dominate", 0],
            ["Every transaction in the chain is true and valid", 1],
            ["Checking a mined block takes only one hash", 0],
            ["A block becomes final the moment it is mined", 1],
          ],
          hint: "Proof of work prices effort. Does effort say anything about whether the data inside is true?",
          why: "It prices rewrites: a valid nonce is costly to find and cheap to check. It says nothing about whether the data is true, a mined block is not instantly final, and a 51% attacker breaks it.",
        },
      },
    ],
    guide: [
      "Press <b>Tamper</b>, then <b>Verify chain</b>. Where does it turn red?",
      "Press <b>Rewrite chain</b>. It's valid again. What does that tell you about hashes alone?",
      "Press <b>Mine</b> at difficulty 1, then 2. Compare the attempt counts (roughly 16× more).",
    ],
  };

  N.register({
    id: "a8-hash",
    subject: "algo",
    lecture: 8,
    order: 1,
    num: "8.1",
    title: "Hash chains & proof of work",
    blurb:
      "Tamper with a block and watch the chain light up downstream — then mine nonces and feel the difficulty curve.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const blocks = [
        { i: 0, data: "genesis", nonce: 0, prev: "00000000" },
        { i: 1, data: "alice pays bob 5", nonce: 0, prev: "" },
        { i: 2, data: "bob pays carol 2", nonce: 0, prev: "" },
      ];
      let diff = 1,
        mining = null;
      const bh = (b) => djb2(`${b.i}|${b.data}|${b.prev}|${b.nonce}`);
      const card = el(`<div class="card"><div id="chain"></div>
        <div class="controls"><button class="btn rose" id="tamp">Tamper: block 1 data → "alice pays MALLORY 50"</button><button class="btn" id="ver">Verify chain</button><button class="btn ghost" id="rw">Rewrite chain (recompute all)</button></div>
        <div class="card" style="background:var(--bg-2);margin-top:14px"><div class="card-head"><h3>Mine block 0 — find nonce so hash starts with zeros</h3></div>
          <div id="dsl"></div><div class="controls"><button class="btn primary" id="mine">Mine</button></div>
          <div class="stat-row"><div class="stat"><small>Attempts</small><b id="at">0</b></div><div class="stat amber"><small>Winning nonce</small><b id="wn">—</b></div><div class="stat teal"><small>Verify cost</small><b>1 hash</b></div></div></div>
        <div class="callout" id="msg" style="display:none"></div></div>`);
      root.appendChild(card);
      blocks.slice(1).forEach((b, i) => (b.prev = bh(blocks[i])));
      const sl = N.slider("difficulty (leading hex zeros)", 1, 4, 1, 1, (v) => v);
      sl.onInput((v) => (diff = v));
      qs("#dsl", card).appendChild(sl);
      function draw(verify) {
        qs("#chain", card).innerHTML = `<div class="grid three">${blocks
          .map((b, i) => {
            const h = bh(b),
              linkOk = i === 0 || b.prev === bh(blocks[i - 1]);
            const bad = verify && (!linkOk || (i > 0 && h !== bh(b)));
            return `<div class="card" style="margin:0;${bad ? "border-color:var(--rose)" : ""}">
            <span class="tag ${bad ? "rose" : "teal"}">block ${i}</span>
            <div class="mono" style="font-size:12px;margin-top:8px">data: ${b.data}<br>nonce: ${b.nonce}<br>prev: ${b.prev.slice(0, 8)}<br>hash: <b style="color:${bad ? "var(--rose)" : "var(--teal)"}">${h}</b></div>
            ${i > 0 ? `<div class="faint" style="font-size:11px;margin-top:6px">${linkOk ? "✓ prev matches" : "✗ prev_hash stale"}</div>` : ""}</div>`;
          })
          .join("")}</div>`;
      }
      qs("#tamp", card).onclick = () => {
        blocks[1].data = "alice pays MALLORY 50";
        draw(true);
        msg(
          "Block 1's hash changed — and block 2's stored prev_hash no longer matches. <b>Tamper-evident.</b>",
          "rose",
        );
      };
      qs("#ver", card).onclick = () => {
        draw(true);
        const ok = blocks.every((b, i) => i === 0 || b.prev === bh(blocks[i - 1]));
        msg(ok ? "Chain valid." : "Broken links highlighted in red.", ok ? "teal" : "rose");
      };
      qs("#rw", card).onclick = () => {
        blocks.forEach((b, i) => {
          if (i) b.prev = bh(blocks[i - 1]);
          b.nonce = 0;
        });
        draw(true);
        msg(
          "Chain re-computed and <b>valid again</b> — but the data was changed. Hashes detect, they don't prevent. Consensus (or access control) prevents.",
          "amber",
        );
      };
      qs("#mine", card).onclick = () => {
        if (mining) {
          clearInterval(mining);
          mining = null;
          qs("#mine", card).textContent = "Mine";
          return;
        }
        const b = blocks[0];
        b.nonce = 0;
        let tries = 0;
        const target = "0".repeat(diff);
        qs("#mine", card).textContent = "Stop";
        mining = life.interval(() => {
          for (let k = 0; k < 500; k++) {
            tries++;
            b.nonce++;
            if (bh(b).startsWith(target)) break;
          }
          qs("#at", card).textContent = tries.toLocaleString();
          if (bh(b).startsWith(target)) {
            clearInterval(mining);
            mining = null;
            qs("#wn", card).textContent = b.nonce;
            qs("#mine", card).textContent = "Mine";
            draw(false);
          }
        }, 30);
      };
      function msg(t, c) {
        const m = qs("#msg", card);
        m.style.display = "block";
        m.className = "callout " + c;
        m.innerHTML = t;
      }
      draw(false);
      root.appendChild(
        predict({
          id: "a8-hash-1",
          q: "Each extra leading hex-zero of difficulty multiplies expected mining work by…",
          opts: ["2", "16", "256"],
          a: 1,
          why: "One hex digit = 4 bits → each required zero digit cuts the success space 16-fold. Difficulty is exponential in target length.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Hash chains make edits <b>evident</b>: change history and every later link breaks.",
            "A rebuilt chain validates — detection ≠ prevention. Consensus picks which chain is real.",
            "PoW = asymmetric cost: mining is trial-and-error, verifying is one hash.",
          ],
          "Hashes fingerprint data; chains fingerprint history; proof of work prices rewrites.",
        ),
      );
    },
  });

  /* ============ 8.2 DH & RSA ============ */
  L["a8-keys"] = {
    sum: "Two different tools. <b>Diffie–Hellman</b> lets two strangers agree on a shared secret while everyone listens, without ever sending the secret. <b>RSA</b> lets anyone lock a message with your public key that only your private key opens.",
    steps: [
      {
        t: "The paint-mixing picture",
        b: `<p>Alice and Bob agree a public colour. Each mixes in a <b>secret</b> colour and sends the mixture. Each then adds their own secret to the <i>other's</i> mixture. Both end with the same final colour, and a watcher can't separate mixed paint.</p>`,
        v: `<svg class="fig" viewBox="0 0 480 170" role="img" aria-label="Alice and Bob each mix a public colour with a secret one. Only the mixtures cross the wire. Each then adds their own secret to the other's mixture, and both end with the same colour." style="max-height:170px">${[
          ["Alice", 70, "#ff4b4b"],
          ["Bob", 410, "#1cb0f6"],
        ]
          .map(
            ([n, x, c]) =>
              `<g class="fi"><text x="${x}" y="18" class="fig-box">${n}</text><circle cx="${x - 22}" cy="48" r="16" fill="#ff9600"/><text x="${x - 22}" y="80" class="fig-sub">public</text><text x="${x}" y="52" class="fig-sub">+</text><circle cx="${x + 22}" cy="48" r="16" fill="${c}"/><text x="${x + 22}" y="80" class="fig-sub">secret</text></g>`,
          )
          .join(
            "",
          )}<path d="M110 110 L370 110" stroke="var(--text-faint)" stroke-dasharray="5 5" class="draw"/><text x="240" y="102" class="fig-sub">only the mixtures cross the wire</text><circle cx="240" cy="145" r="18" fill="#b77a88" class="fi"/><text x="240" y="150" class="fig-sub" style="fill:#fff">same</text><text x="300" y="150" class="fig-sub" style="text-anchor:start">both end with this colour</text></svg>`,
      },
      {
        t: "The same trick with numbers",
        b: `<p>Public: prime p = 23, base g = 5.</p>`,
        v: `<table class="t" style="max-width:560px"><tr><th></th><th>Alice</th><th>Bob</th></tr><tr><td>secret</td><td class="mono">a = 6</td><td class="mono">b = 15</td></tr><tr><td>sends</td><td class="mono">5⁶ mod 23 = <b>8</b></td><td class="mono">5¹⁵ mod 23 = <b>19</b></td></tr><tr class="hl"><td>computes</td><td class="mono">19⁶ mod 23 = <b>2</b></td><td class="mono">8¹⁵ mod 23 = <b>2</b></td></tr></table><div class="fig-cap">Both get 2. The wire only carried 23, 5, 8 and 19.</div>`,
        c: {
          type: "cat",
          q: "In Diffie–Hellman an eavesdropper sees p, g, A and B. At real key sizes, which jobs are <b>easy for anyone</b> and which are <b>hard for the eavesdropper</b>?",
          buckets: ["Easy for anyone", "Hard for the eavesdropper"],
          items: [
            ["Compute gᵃ mod p when you know a", 0],
            ["Compute Bᵃ mod p when you know a (Alice's last step)", 0],
            ["Find a from gᵃ mod p (a discrete log)", 1],
            ["Find the shared key from p, g, A and B alone", 1],
          ],
          hint: "Going forward with a known secret is just repeated multiplication. What if you don't know the secret?",
          why: "Computing gᵃ is easy, and so is raising B to the power a if you know a. Undoing it, finding a from gᵃ, is a discrete log: hard at real sizes. That asymmetry is the whole security.",
        },
      },
      {
        t: "What DH does NOT do",
        b: `<p>DH proves nothing about <b>who</b> you're talking to. An attacker in the middle can run one exchange with Alice and another with Bob, and read everything in between. Real protocols fix this with certificates and signatures.</p>`,
        v: F.flow([
          { t: "Alice", s: "key K₁" },
          { t: "🎩 Mallory", s: "knows K₁ and K₂", c: "rose" },
          { t: "Bob", s: "key K₂" },
        ]),
      },
      {
        t: "RSA in miniature",
        b: `<p>Pick primes p = 5, q = 11. Then n = 55 and φ = 4 × 10 = 40. Choose e = 3 (it shares no factor with 40). Find d with 3d ≡ 1 (mod 40): <b>d = 27</b>, since 81 = 2 × 40 + 1.</p>`,
        v: F.flow([
          { t: "message 7", s: "plaintext" },
          { t: "7³ mod 55", s: "public key (55, 3)", c: "violet" },
          { t: "13", s: "ciphertext", c: "amber" },
          { t: "13²⁷ mod 55", s: "private d = 27", c: "violet" },
          { t: "7 ✓", s: "recovered" },
        ]),
        c: {
          q: "Why must e share no factor with φ(n)?",
          o: [
            "It makes encryption run faster",
            "d is e's inverse mod φ(n), which needs gcd(e, φ) = 1",
            "It's just a convention from the original paper",
          ],
          a: 1,
          why: "No inverse means no d, which means no decryption. Key generation checks this.",
        },
      },
      {
        t: "Why this is only a toy",
        b: `<p>n = 55 can be factored in your head. Real n has 2048+ bits. Raw RSA is also <b>deterministic</b> (same message, same ciphertext), which leaks information.</p><span class="key">Real systems use padding (OAEP), secure randomness and vetted libraries. Never hand-roll crypto.</span>`,
      },
    ],
    guide: [
      "Move both secret sliders. The shared secret changes, but Alice and Bob always agree.",
      "Tick <b>Attacker-in-the-middle</b>. Now each side shares a key with Mallory instead.",
      "Encrypt 7, then decrypt it. Try other numbers from 1 to 54.",
    ],
  };

  N.register({
    id: "a8-keys",
    subject: "algo",
    lecture: 8,
    order: 2,
    num: "8.2",
    title: "Shared secrets & toy RSA",
    blurb: "Two strangers agree on a secret in public — then encrypt and decrypt a message with a miniature RSA.",
    render(root) {
      root.appendChild(header(this, ""));
      const p = 23,
        g = 5;
      let a = 6,
        b = 15,
        mitm = false;
      const card = el(`<div><div class="card"><div class="card-head"><h3>Diffie–Hellman · p=23, g=5</h3></div>
        <div id="sls"></div><div class="controls"><label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="mitm"> Attacker-in-the-middle (Mallory swaps public values)</label></div>
        <div class="grid three" id="parties"></div></div>
        <div class="card" style="margin-top:14px"><div class="card-head"><h3>Toy RSA · n=55, e=3, d=27</h3><span class="tag rose">educational only</span></div>
        <div class="controls"><input class="field" style="max-width:120px" id="m" type="number" min="1" max="54" value="7"><button class="btn primary" id="enc">Encrypt M³ mod 55</button><button class="btn" id="dec">Decrypt C²⁷ mod 55</button></div>
        <div class="stat-row"><div class="stat"><small>Message M</small><b id="mv">7</b></div><div class="stat violet"><small>Ciphertext C</small><b id="cv">—</b></div><div class="stat teal"><small>Decrypted</small><b id="dv">—</b></div></div>
        <div class="callout rose"><b>Never deploy this.</b> n=55 factors instantly, raw RSA is deterministic (same M → same C), and there's no padding/authentication. Production crypto: OAEP padding, ~2048+ bit keys, vetted libraries only.</div></div></div>`);
      root.appendChild(card);
      const slA = N.slider("Alice's secret a", 2, 20, 1, 6, (v) => v);
      const slB = N.slider("Bob's secret b", 2, 20, 1, 15, (v) => v);
      slA.onInput((v) => {
        a = v;
        draw();
      });
      slB.onInput((v) => {
        b = v;
        draw();
      });
      qs("#sls", card).append(slA, slB);
      qs("#mitm", card).onchange = (e) => {
        mitm = e.target.checked;
        draw();
      };
      function draw() {
        const A = modpow(g, a, p),
          B = modpow(g, b, p);
        const mA = modpow(g, 9, p),
          mB = modpow(g, 7, p); // Mallory's secrets 9, 7
        const sA = mitm ? modpow(mB, a, p) : modpow(B, a, p);
        const sB = mitm ? modpow(mA, b, p) : modpow(A, b, p);
        const sM1 = mitm ? modpow(A, 9, p) : null,
          sM2 = mitm ? modpow(B, 7, p) : null;
        qs("#parties", card).innerHTML = [
          ["Alice", `secret a=${a}`, `sends A=${A}`, `computes shared: <b>${sA}</b>`],
          mitm
            ? ["🎩 Mallory", "swaps A→A′, B→B′", `knows ${sM1} & ${sM2}`, "reads everything"]
            : ["Wire", `sees A=${A}, B=${B}`, "can't get the secret", "(discrete log is hard)"],
          ["Bob", `secret b=${b}`, `sends B=${B}`, `computes shared: <b>${sB}</b>`],
        ]
          .map(
            ([n, l1, l2, l3]) =>
              `<div class="card" style="margin:0;background:var(--bg-2)"><b>${n}</b><p class="dim" style="font-size:13px;margin-top:8px">${l1}<br>${l2}<br>${l3}</p></div>`,
          )
          .join("");
      }
      draw();
      let C = null;
      qs("#enc", card).onclick = () => {
        const m = +qs("#m", card).value;
        if (m < 1 || m > 54) return;
        C = modpow(m, 3, 55);
        qs("#mv", card).textContent = m;
        qs("#cv", card).textContent = C;
        qs("#dv", card).textContent = "—";
      };
      qs("#dec", card).onclick = () => {
        if (C === null) return;
        qs("#dv", card).textContent = modpow(C, 27, 55);
      };
      root.appendChild(
        predict({
          id: "a8-key-1",
          q: "DH gives Alice and Bob a shared secret over a public channel. What does it NOT give them?",
          opts: [
            "A secret value that both of them end up knowing",
            "Proof of who they're talking to",
            "A secret that an eavesdropper can't compute",
          ],
          a: 1,
          why: "DH is key <b>agreement</b>, not authentication. Certificates/signatures bind public values to identities. (The shared secret then keys a fast symmetric cipher for the messages.)",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "DH: shared secret from exchanged public values — discrete log is the hard problem.",
            "RSA: public (n,e) encrypts, private d decrypts — factoring n is the hard problem.",
            "Both are <b>building blocks</b>: real protocols hybridise (DH/RSA for keys, symmetric cipher for data, signatures for identity).",
          ],
          "Public values in, shared secret out — and always authenticate who you're talking to.",
        ),
      );
    },
  });
})();
