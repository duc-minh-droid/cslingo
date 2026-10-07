/* algo-p8-x-02: 8.3 Diffie-Hellman steps for a8-keys, 8.4 RSA, 8.5 hash steps for a8-hash (ported from the vault). */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, esc } = N;
  const L = N.LESSONS,
    F = N.fig;
  const S = (NIC.shared.algoP8 = NIC.shared.algoP8 || {});
  const { toy, modpow, gcd, TONE, bx, tiles, tbl, runner, addStep, reg } = S;
  /* ============================================================
     8.3  Diffie-Hellman: extra steps for the existing a8-keys lesson
     ============================================================ */
  function dhRun(box, life) {
    const p = 19,
      g = 2,
      a = 5,
      b = 7,
      A = modpow(g, a, p),
      B = modpow(g, b, p),
      S = modpow(B, a, p),
      S2 = modpow(A, b, p);
    const side = (st) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
      <div style="border:2px solid var(--line-2);border-radius:12px;padding:8px 12px;background:var(--panel)"><b>Alice</b><div>secret a: ${st.a ? bx(a, "violet") : "?"}</div><div>sends: ${st.A ? bx(A, "blue") : "·"}</div><div>shared: ${st.sa ? bx(S, "teal") : "·"}</div></div>
      <div style="border:2px solid var(--line-2);border-radius:12px;padding:8px 12px;background:var(--panel)"><b>Bob</b><div>secret b: ${st.b ? bx(b, "violet") : "?"}</div><div>sends: ${st.B ? bx(B, "blue") : "·"}</div><div>shared: ${st.sb ? bx(S2, "teal") : "·"}</div></div></div>`;
    const wire = (st) =>
      `<div style="margin-top:6px"><small class="faint" style="font-weight:800">Eve sees on the wire</small><div>${bx("p = " + p)}${bx("g = " + g)}${st.A ? bx("A = " + A, "blue") : ""}${st.B ? bx("B = " + B, "blue") : ""}</div></div>`;
    const pt = (st, ex = "") => side(st) + wire(st) + ex;
    runner(box, life, {
      minH: 200,
      code: [
        "agree on a prime p and base g (public)",
        "Alice picks secret a, Bob picks secret b",
        "Alice sends A = g^a mod p; Bob sends B = g^b mod p",
        "Alice computes B^a mod p; Bob computes A^b mod p",
        "both now hold g^(ab) mod p",
      ],
      frames() {
        const st = {};
        const out = [
          {
            cap: `Public agreement: prime <b>p = ${p}</b>, base <b>g = ${g}</b>. Everything said from now on, Eve hears.`,
            line: 0,
            html: pt(st),
          },
        ];
        st.a = st.b = 1;
        out.push({
          cap: `Alice secretly picks <b>a = ${a}</b>, Bob secretly picks <b>b = ${b}</b>. They never send these.`,
          line: 1,
          html: pt({ ...st }),
        });
        st.A = 1;
        out.push({
          cap: `Alice sends <b>A = ${g}<sup>${a}</sup> mod ${p} = ${A}</b>, since ${g ** a} = ${p} + ${A}.`,
          line: 2,
          html: pt({ ...st }),
        });
        st.B = 1;
        out.push({
          cap: `Bob sends <b>B = ${g}<sup>${b}</sup> mod ${p} = ${B}</b>, since ${g ** b} = 6 × ${p} + ${B}.`,
          line: 2,
          html: pt({ ...st }),
        });
        st.sa = 1;
        out.push({
          cap: `Alice raises what she received (B = ${B}) to her secret: ${B}<sup>${a}</sup> mod ${p} = <b>${S}</b>.`,
          line: 3,
          html: pt({ ...st }),
          ask: {
            q: "Alice now holds Bob's message. Which of these numbers does she raise to her secret <b>a</b>? Tap it.",
            a: "B",
            tiles: tiles("Which number?", [
              ["g", `g = ${g}`],
              ["A", `A = ${A} (her own)`],
              ["B", `B = ${B} (from Bob)`],
            ]),
            why: `She raises Bob's value B to her own a, giving (g^b)^a = g^(ab). Raising her own A would just give g^(a²).`,
          },
        });
        st.sb = 1;
        out.push({
          cap: `Bob raises Alice's A = ${A} to his secret: ${A}<sup>${b}</sup> mod ${p} = <b>${S2}</b>. Same number: (g<sup>a</sup>)<sup>b</sup> = g<sup>ab</sup> = (g<sup>b</sup>)<sup>a</sup>.`,
          line: 4,
          mood: "love",
          html: pt({ ...st }),
        });
        let t = 0,
          r = 1;
        do {
          r = (r * g) % p;
          t++;
        } while (r !== A);
        out.push({
          cap: `Eve knows p, g, A and B but not a or b. With p this tiny she finds a = ${t} in ${t} tries. With a 2048-bit prime that search is impossible.`,
          line: 4,
          html: pt(
            { ...st },
            `<div class="callout amber" style="margin-top:8px">Eve's search: g, g², g³ ... until it equals A = ${A}: stops at a = ${t}.</div>`,
          ),
        });
        return out;
      },
    });
  }

  // prettier-ignore
  addStep("a8-keys", 1, { t: "The four moves with paint", b: `<p>The same story in four moves, as in the lecture:</p><ol><li>Alice and Bob each choose a <b>private colour</b>.</li><li>One of them announces a <b>public colour</b>.</li><li>Each mixes the public colour with their private one and <b>announces the mixture</b>.</li><li>Each adds their own private colour to the <b>other's</b> mixture. The result is the same mixture.</li></ol>`,
    v: F.frames([{ t: "private colours", v: F.cells([{ v: "A", c: "rose" }, { v: "B", c: "blue" }]) }, { t: "public colour", v: F.cells([{ v: "P", c: "amber" }]) }, { t: "announced mixtures", v: F.cells([{ v: "P+A", c: "rose" }, { v: "P+B", c: "blue" }]) }, { t: "both finish with", v: F.cells([{ v: "P+A+B", c: "violet" }]) }]),
    c: { q: "Eve sees the public colour and both announced mixtures. Why can't she make the final P+A+B colour?", o: ["She cannot unmix paint to isolate a private colour", "She never learns which public colour was chosen", "She is only shown one of the two announced mixtures"], a: 0, why: "She holds P+A and P+B, but making P+A+B needs A or B on its own. Un-mixing paint is the stand-in for the discrete logarithm." } });
  // prettier-ignore
  addStep("a8-keys", 3, { t: "The pattern: F(S, P)", b: `<p>Strip away the colours. Alice and Bob exchange public information <b>P</b>. Alice computes F(S<sub>A</sub>, P) with her secret S<sub>A</sub>; Bob computes F(S<sub>B</sub>, P) with his. The function F is chosen so that the two results are <b>equal</b>.</p><p>With numbers, F is modular exponentiation and the equality is <b>(g<sup>b</sup>)<sup>a</sup> = g<sup>ba</sup> = g<sup>ab</sup> = (g<sup>a</sup>)<sup>b</sup> (mod p)</b>. The shared secret g<sup>ab</sup> is never sent.</p>`,
    v: tbl(["", "Alice", "Bob"], [["secret", "S<sub>A</sub> = a", "S<sub>B</sub> = b"], ["publishes", "g<sup>a</sup> mod p", "g<sup>b</sup> mod p"], ["computes", "(g<sup>b</sup>)<sup>a</sup> mod p", "(g<sup>a</sup>)<sup>b</sup> mod p"], { c: ["both hold", "g<sup>ab</sup> mod p", "g<sup>ab</sup> mod p"], hl: true }], 560),
    c: { q: "What property of exponents makes both sides end up with the same number?", o: ["Powers of powers multiply the exponents, and ab = ba", "g^a and g^b are always equal for a prime p", "Both sides pick the same secret by chance"], a: 0, why: "(g^a)^b and (g^b)^a are both g^(ab). That commutativity is what the carefully chosen F provides." } });
  // prettier-ignore
  addStep("a8-keys", 4, { t: "Watch it run: the exchange", b: `<p>The full exchange with p = 19 and g = 2. Press <b>play</b> or step: secrets stay put, only A and B cross the wire.</p><p>It will ask which number Alice raises to her secret.</p>`,
    v: (box, life) => dhRun(box, life) });
  // prettier-ignore
  addStep("a8-keys", 6, { t: "From shared secret to a working key", b: `<p>The shared number g<sup>ab</sup> is not a message, it is <b>raw key material</b>. Both sides convert it into a symmetric key (for example for DES or AES) and from then on use that fast cipher for the data.</p><p>So DH answers the lecture's question: it gets a key across an insecure channel without ever sending the key.</p>`,
    v: F.flow([{ t: "Public values", s: "p, g, A, B" }, { t: "Shared secret", s: "g^ab mod p", c: "amber" }, { t: "Symmetric key", s: "e.g. DES / AES", c: "violet" }, { t: "Encrypted data", s: "fast", c: "teal" }]),
    c: { q: "After Diffie-Hellman, what do Alice and Bob do with the shared secret?", o: ["Derive a symmetric key for a fast cipher", "Send their messages directly as raw g^ab values", "Use it as the public key for a later RSA exchange"], a: 0, why: "DH is key agreement, not encryption. The secret seeds a symmetric key, and the symmetric cipher carries the traffic." } });
  if (L["a8-keys"])
    L["a8-keys"].sum =
      "Two tools. <b>Diffie-Hellman</b> lets strangers build a shared secret while everyone listens: Alice and Bob each combine a private value with public information so that both reach the same F(S, P). <b>RSA</b> lets anyone lock a message with your public key that only your private key opens.";

  /* ============================================================
     8.4  RSA, step by step
     ============================================================ */
  function rsaRun(box, life) {
    const p = 3,
      q = 11,
      n = p * q,
      phi = (p - 1) * (q - 1),
      cands = [4, 5, 7, 10],
      e = 7,
      M = 4;
    let d = 0;
    const tries = [];
    for (let k = 1; ; k++) {
      tries.push(`${e}×${k} = ${e * k}`);
      if ((e * k) % phi === 1) {
        d = k;
        break;
      }
    }
    const C = modpow(M, e, n),
      back = modpow(C, d, n);
    const row = (items) => `<div>${items.join("")}</div>`;
    runner(box, life, {
      minH: 180,
      code: [
        "pick primes p and q; n = p × q",
        "z = (p − 1) × (q − 1)",
        "pick e with no common factor with z; publish (n, e)",
        "find d with (e × d) mod z = 1; keep d secret",
        "C = M^e mod n  (anyone can do this)",
        "M = C^d mod n  (only the key owner)",
      ],
      frames() {
        const out = [];
        out.push({
          cap: `Bob chooses two primes: <b>p = ${p}</b> and <b>q = ${q}</b>. Tiny, so you can follow the arithmetic.`,
          line: 0,
          html: row([bx("p = " + p, "violet"), bx("q = " + q, "violet")]),
        });
        out.push({
          cap: `<b>n = p × q = ${n}</b>. This goes into the public key.`,
          line: 0,
          html: row([bx("p = " + p, "violet"), bx("q = " + q, "violet"), bx("n = " + n, "blue")]),
        });
        out.push({
          cap: `<b>z = (p − 1)(q − 1) = ${p - 1} × ${q - 1} = ${phi}</b>. Candidates for e must share no factor with ${phi}.`,
          line: 1,
          html: row([bx("n = " + n, "blue"), bx("z = " + phi, "amber")]),
        });
        out.push({
          cap: `Check each candidate: gcd(4, ${phi}) = 4, gcd(5, ${phi}) = 5, gcd(10, ${phi}) = 10, but gcd(7, ${phi}) = 1. So <b>e = 7</b>.`,
          line: 2,
          html:
            row([bx("n = " + n, "blue"), bx("z = " + phi, "amber")]) +
            row(
              cands.map((c) =>
                bx(
                  `e = ${c}: gcd ${gcd(c, phi)} ${gcd(c, phi) === 1 ? "✓" : "✗"}`,
                  gcd(c, phi) === 1 ? "teal" : "rose",
                ),
              ),
            ),
          ask: {
            q: `n = ${n}, z = ${phi}. Which candidate for e shares no factor with z? Tap it.`,
            a: cands.filter((c) => gcd(c, phi) === 1).map(String),
            tiles: tiles(
              "Candidates for e",
              cands.map((c) => [String(c), "e = " + c]),
            ),
            why: `Only 7 is coprime to ${phi}: 4, 5 and 10 all share a factor with it.`,
          },
        });
        out.push({
          cap: `Public key published: <b>(n, e) = (${n}, ${e})</b>. Everyone, including Eve, may see it.`,
          line: 2,
          html: row([bx(`public (n, e) = (${n}, ${e})`, "blue")]),
        });
        out.push({
          cap: `Bob finds <b>d</b> with ${e}d mod ${phi} = 1: ${tries.join(", ")}. ${e * d} = ${phi} + 1, so <b>d = ${d}</b>. Kept secret.`,
          line: 3,
          html: row([bx(`public (${n}, ${e})`, "blue"), bx(`private d = ${d}`, "rose")]),
        });
        out.push({
          cap: `Alice encrypts <b>M = ${M}</b> with the public key: ${M}<sup>${e}</sup> = ${M ** e}, and ${M ** e} mod ${n} = <b>${C}</b>.`,
          line: 4,
          html: row([bx(`M = ${M}`), "→", bx(`C = ${C}`, "amber")]),
        });
        out.push({
          cap: `Bob decrypts: ${C}<sup>${d}</sup> = ${C ** d}, and ${C ** d} mod ${n} = <b>${back}</b>. The message is back.`,
          line: 5,
          mood: "love",
          html: row([bx(`C = ${C}`, "amber"), "→", bx(`M = ${back}`, "teal")]),
        });
        out.push({
          cap: `Eve knows n = ${n} and e = ${e}. She factors ${n} = <b>${p} × ${q}</b> in a blink, computes z = ${phi}, and finds d = ${d}. The toy key is broken, which is exactly why real n has 2048 bits.`,
          line: 5,
          html: row([bx(`n = ${n} = ${p} × ${q}`, "rose"), bx(`z = ${phi}`, "rose"), bx(`d = ${d}`, "rose")]),
        });
        return out;
      },
    });
  }

  reg({
    id: "a8-rsa",
    order: 4,
    num: "8.4",
    title: "RSA, step by step",
    blurb:
      "Choose two primes, build a public and a private key, encrypt and decrypt, then break your own key by factoring.",
    render(root) {
      root.appendChild(header(this, ""));
      const PR = [3, 5, 7, 11, 13, 17, 19, 23];
      let pi = 0,
        qi = 3,
        e = null,
        d = null;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Build a key pair</h2><span class="tag rose">toy sizes</span></div>
        <div id="sls"></div>
        <div class="stat-row"><div class="stat"><small>n = p × q</small><b id="nv">·</b></div><div class="stat amber"><small>z = (p−1)(q−1)</small><b id="zv">·</b></div><div class="stat blue"><small>Public key (n, e)</small><b id="pk">·</b></div><div class="stat rose"><small>Private d</small><b id="dv">·</b></div></div>
        <div class="controls" style="margin-top:8px"><small class="faint" style="font-weight:800">Choose e (each shares no factor with z):</small></div><div id="es" style="min-height:48px"></div>
        <div id="sm"></div>
        <div class="stat-row"><div class="stat"><small>Message M</small><b id="mv">·</b></div><div class="stat violet"><small>Ciphertext C = M<sup>e</sup> mod n</small><b id="cv">·</b></div><div class="stat teal"><small>Decrypted C<sup>d</sup> mod n</small><b id="rv">·</b></div></div>
        <div class="callout" id="msg" style="min-height:52px;margin-top:10px"></div>
        <div class="controls"><button class="btn rose" id="atk">Attack: factor n by trial division</button></div><div class="callout amber" id="am" style="min-height:44px">Press Attack to see how many divisions Eve needs.</div></div>`);
      root.appendChild(card);
      const sP = N.slider("Prime p", 0, PR.length - 1, 1, pi, (v) => PR[v]),
        sQ = N.slider("Prime q", 0, PR.length - 1, 1, qi, (v) => PR[v]);
      qs("#sls", card).append(sP, sQ);
      const sM = N.slider("Message M", 1, 40, 1, 4, (v) => v);
      qs("#sm", card).appendChild(sM);
      const eps = () => {
        const z = (PR[pi] - 1) * (PR[qi] - 1),
          out = [];
        for (let c = 3; c < z && out.length < 6; c++) if (gcd(c, z) === 1) out.push(c);
        return out;
      };
      function setE(v) {
        e = v;
        const z = (PR[pi] - 1) * (PR[qi] - 1);
        d = null;
        for (let k = 1; k < z; k++)
          if ((e * k) % z === 1) {
            d = k;
            break;
          }
        structure(true);
      }
      function structure(keep) {
        const P = PR[pi],
          Q = PR[qi];
        qs("#nv", card).textContent = P === Q ? "p = q!" : P * Q;
        qs("#zv", card).textContent = P === Q ? "·" : (P - 1) * (Q - 1);
        const list = P === Q ? [] : eps();
        qs("#es", card).innerHTML = list.length
          ? list
              .map((c) => `<button class="btn small ${c === e ? "primary" : ""}" data-e="${c}">e = ${c}</button>`)
              .join(" ")
          : `<span class="faint">p and q must be different primes</span>`;
        qsa("[data-e]", card).forEach((b) => (b.onclick = () => setE(+b.dataset.e)));
        if (!keep && P !== Q && list.length && !list.includes(e)) {
          setE(list[0]);
          return;
        }
        draw();
      }
      function draw() {
        const P = PR[pi],
          Q = PR[qi],
          n = P * Q;
        const ok = P !== Q && e !== null && d !== null;
        qs("#pk", card).textContent = ok ? `(${n}, ${e})` : "·";
        qs("#dv", card).textContent = ok ? d : "·";
        const M = sM.value;
        qs("#mv", card).textContent = M;
        const msg = qs("#msg", card);
        if (!ok) {
          qs("#cv", card).textContent = "·";
          qs("#rv", card).textContent = "·";
          msg.className = "callout";
          msg.textContent = "Pick two different primes.";
          return;
        }
        const C = modpow(M, e, n),
          R = modpow(C, d, n);
        qs("#cv", card).textContent = C;
        qs("#rv", card).textContent = R;
        msg.className = "callout " + (R === M ? "teal" : "rose");
        msg.innerHTML =
          R === M
            ? `Round trip works: ${M} → ${C} → ${R}.`
            : `<b>It broke.</b> M = ${M} is not smaller than n = ${n}, so it wrapped to ${M % n}. RSA can only carry messages from 0 to n − 1.`;
      }
      sP.onInput((v) => {
        pi = v;
        structure(false);
      });
      sQ.onInput((v) => {
        qi = v;
        structure(false);
      });
      sM.onInput(() => draw());
      qs("#atk", card).onclick = () => {
        const n = PR[pi] * PR[qi];
        let t = 0,
          f = 2;
        while (n % f !== 0) {
          f++;
          t++;
        }
        t++;
        qs("#am", card).innerHTML =
          `Eve divides n = ${n} by 2, 3, 4 ... and finds the factor <b>${f}</b> after <b>${t}</b> divisions. Then q = ${n / f}, z follows, and she computes d exactly as Bob did.`;
      };
      structure(false);
      root.appendChild(
        predict({
          id: "a8-rsa-1",
          q: "Eve knows n and e, then manages to factor n into p and q. What can she now do?",
          opts: [
            "Compute z, then d, and decrypt every message",
            "Only guess which messages were sent, not read them",
            "Nothing, since d is unrelated to p and q",
          ],
          a: 0,
          why: "z = (p−1)(q−1) needs only p and q, and d is the inverse of e modulo z. So factoring n hands Eve the private key. That is why RSA's security is the difficulty of factoring.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-rsa-2",
          q: "Set p = 3 and q = 11 (so n = 33) and encrypt M = 34. What does decryption return?",
          opts: ["34", "1", "an error message"],
          a: 1,
          why: "RSA works modulo n, so 34 behaves exactly like 34 − 33 = 1. The message must be smaller than n; longer data is split into blocks (or, in practice, only a short symmetric key is encrypted).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Public key (n, e): n = pq and e has no common factor with (p−1)(q−1). Private key d: e·d mod (p−1)(q−1) = 1.",
            "Encrypt C = M<sup>e</sup> mod n, decrypt M = C<sup>d</sup> mod n. Both are modular exponentiation: quick.",
            "Security = factoring n. The message must be smaller than n, and real RSA adds random padding.",
          ],
          "Anyone can lock with (n, e); only the holder of d can unlock.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a8-rsa"] = {
    sum: "<b>RSA</b> (Rivest, Shamir, Adleman) was the first practical public-key cipher and is still the most used. Pick two large primes, publish n = pq with an exponent e, keep d secret: anyone can encrypt with (n, e), only the holder of d can decrypt, and breaking it means factoring n.",
    steps: [
      { t: "The setting", b: `<p>RSA assumes the Diffie-Hellman world: <b>no secure channel exists</b>, the method is known to everyone, and the encryption key is <b>public</b>. It is named after Ron Rivest, Adi Shamir and Len Adleman, and it was the first practical public-key scheme.</p>`,
        v: F.flow([{ t: "Bob", s: "publishes (n, e)", c: "violet" }, { t: "Alice", s: "C = M^e mod n", c: "amber" }, { t: "Bob", s: "M = C^d mod n", c: "teal" }]),
        c: { q: "In RSA, what does an eavesdropper know?", o: ["Only the ciphertext that crosses the wire", "The method, (n, e) and the ciphertext, not d", "Everything about the exchange except the plaintext"], a: 1, why: "Public means public: the method and (n, e) are known to all. The ciphertext crosses the wire. d never leaves Bob, so 'everything' is wrong." } },
      { t: "Step 1: the public key", b: `<p>Pick two large primes <b>p</b> and <b>q</b> (at least 512 bits each) and let <b>n = pq</b>. Then pick an <b>e</b> with 1 &lt; e &lt; (p−1)(q−1) that has <b>no common divisor</b> with (p−1)(q−1) other than 1. Publish the pair <b>(n, e)</b>.</p><p>Tiny example: p = 3, q = 7 gives n = 21 and (p−1)(q−1) = 2 × 6 = 12.</p>`,
        v: F.cells([{ v: "p = 3", c: "violet" }, "×", { v: "q = 7", c: "violet" }, "=", { v: "n = 21", c: "blue" }]) + F.cells([{ v: "(3−1)", sub: "p − 1" }, "×", { v: "(7−1)", sub: "q − 1" }, "=", { v: "12", c: "amber", sub: "the limit for e" }]),
        c: { q: "Which part of the public key is the product of the two primes?", o: ["e", "n", "d"], a: 1, why: "n = pq is published, as is e. d is private and is derived from p, q and e." } },
      { t: "Which e is acceptable?", b: `<p>For p = 3, q = 7 the limit is 12. Test each candidate: does any number other than 1 divide both e and 12?</p>`,
        v: tbl(["e", "common divisors with 12", "good?"], [["2", "2", "no"], ["3", "3", "no"], { c: ["5", "only 1", "yes"], hl: true }, { c: ["7", "only 1", "yes"], hl: true }, { c: ["11", "only 1", "yes"], hl: true }], 480),
        c: { q: "p = 5 and q = 13, so (p−1)(q−1) = 48. Which e is acceptable?", o: ["6", "9", "7"], a: 2, hint: "6 and 9 both share the factor 3 with 48.", why: "7 shares nothing with 48. 6 shares 2, 3 and 6 with it; 9 shares 3." } },
      { t: "Step 2: the private key", b: `<p>The private key <b>d</b> is the number below (p−1)(q−1) that undoes e: <b>(e × d) mod (p−1)(q−1) = 1</b>. It is the <i>modular inverse</i> of e, found with the <b>Euclidean algorithm</b>.</p><p>Lecture example: Bob has p = 47, q = 59, so n = 2773 and (p−1)(q−1) = 46 × 58 = 2668. With e = 17 the inverse is <b>d = 157</b>, because 17 × 157 = 2669 = 2668 + 1.</p>`,
        v: tbl(["Euclid, working back", ""], [["2668 = 156 × 17 + 16", "so 16 = 2668 − 156 × 17"], ["17 = 1 × 16 + 1", "so 1 = 17 − 16"], { c: ["substitute", "1 = 17 − (2668 − 156 × 17) = 157 × 17 − 2668"], hl: true }, ["read off", "157 × 17 ≡ 1 (mod 2668), so d = 157"]], 600),
        c: { q: "e = 7 and (p−1)(q−1) = 40. Which d satisfies (7 × d) mod 40 = 1?", o: ["13", "23", "33"], a: 1, hint: "7 × 23 = 161 = 4 × 40 + 1.", why: "7 × 23 = 161, and 161 − 160 = 1. The others give 91 mod 40 = 11 and 231 mod 40 = 31." } },
      { t: "Step 3: encrypt and decrypt", b: `<p><b>Encrypt</b> with the public key: <b>C = M<sup>e</sup> mod n</b>. <b>Decrypt</b> with the private key: <b>M = C<sup>d</sup> mod n</b>.</p><p>Lecture example: Alice sends the secret key <b>31</b> to Bob. With (n, e) = (2773, 17): C = 31<sup>17</sup> mod 2773 = <b>587</b>. Bob computes 587<sup>157</sup> mod 2773 and gets <b>31</b> back.</p><p>It works because e·d = 1 + k(p−1)(q−1), and raising M to that power returns M modulo n.</p>`,
        v: F.flow([{ t: "M = 31", s: "secret key" }, { t: "31^17 mod 2773", s: "public (2773, 17)", c: "violet" }, { t: "C = 587", s: "on the wire", c: "amber" }, { t: "587^157 mod 2773", s: "private d = 157", c: "violet" }, { t: "31 ✓", s: "recovered" }]),
        c: { q: "Alice sends Bob a secret. Which key does she use to encrypt it?", o: ["Bob's public key (n, e)", "Bob's private key d", "Her own private key"], a: 0, why: "Anyone encrypts with the receiver's public key. Only the receiver's private key undoes it." } },
      { t: "Watch it run: a key pair", b: `<p>The whole process on the smallest example: p = 3 and q = 11. Press <b>play</b> or step with the arrows from choosing primes to Eve factoring the key.</p><p>It will ask which candidate is a legal e.</p>`,
        v: (box, life) => rsaRun(box, life) },
      { t: "Edge cases and limits", b: `<p><b>M must be smaller than n.</b> With n = 33, the message 34 comes back as 1. Long data is split into blocks, or just a short key is encrypted.</p><p><b>p and q must differ</b> and be genuinely prime, otherwise n is easy to factor or z is wrong.</p><p><b>Raw RSA is deterministic:</b> the same M always gives the same C, so real systems add random padding.</p>`,
        v: tbl(["n = 33, e = 7, d = 3", "M", "C = M⁷ mod 33", "C³ mod 33"], [["fits", "4", "16", "4 ✓"], { c: ["too big", "34", "1", "1 ✗ (wrapped)"], hl: true }], 560),
        c: { q: "With n = 33, what goes wrong if you try to encrypt M = 40?", o: ["It decrypts as 7, because 40 wraps modulo 33", "It decrypts correctly, giving back 40 exactly", "It cannot be encrypted at all by this key"], a: 0, why: "Everything is modulo n, so 40 is indistinguishable from 40 − 33 = 7. Messages must be in the range 0 to n − 1." } },
      { t: "Why attackers can't just compute d", b: `<p>d comes from (p−1)(q−1), which needs <b>p and q</b>. Eve only has n, so she must <b>factor n</b>. For n = 2773 that takes at most 15 trial divisions; for a 2048-bit n it is believed infeasible, though nobody has proved this.</p>`,
        v: F.flow([{ t: "n = pq", s: "public" }, { t: "factor n", s: "believed hard", c: "rose" }, { t: "p and q", s: "" }, { t: "z = (p−1)(q−1)", s: "" }, { t: "d", s: "private key", c: "amber" }]),
        c: { q: "Why does knowing only (n, e) not give Eve the private key?", o: ["She would need p and q, which means factoring n", "d is simply a random number unrelated to n", "e is encrypted so she cannot read it"], a: 0, why: "d is the inverse of e modulo (p−1)(q−1). Computing that needs the factors of n, and factoring a large n has no known fast method." } },
    ],
    guide: ["Pick two primes and an e. Check the public and private keys appear.", "Slide the message M above n. What happens when it no longer fits?", "Press <b>Attack</b> for several prime pairs: how many divisions does Eve need?", "Answer the questions after the demo."],
  };

  /* ============================================================
     8.5  Hash functions: extra steps for the existing a8-hash lesson
     ============================================================ */
  function chainRun(box, life) {
    const data = ["genesis", "ann pays ben 5", "ben pays cat 2", "cat pays dan 1"];
    const EDIT = "ann pays EVE 50";
    const hashOf = (blk) => toy(`${blk.i}|${blk.data}|${blk.prev}`);
    const mk = () => {
      const bl = data.map((d, i) => ({ i, data: d, prev: "00000000" }));
      for (let i = 1; i < bl.length; i++) bl[i].prev = hashOf(bl[i - 1]);
      return bl;
    };
    const card = (blk, st, i, bl) => {
      const linkOk = i === 0 || blk.prev === hashOf(bl[i - 1]);
      const tone = st.edit === i ? "amber" : !linkOk ? "rose" : "teal";
      return `<div style="flex:1;min-width:120px;border:2px solid ${TONE[tone]};border-radius:12px;padding:8px;background:var(--panel)" ${i ? `data-k="${i}" class="a8-tile"` : ""}><b>Block ${i}</b><div class="mono" style="font-size:11.5px;margin-top:4px;word-break:break-all">${esc(blk.data)}<br>prev ${i ? blk.prev : "-"}<br>hash <b style="color:${TONE[tone]}">${hashOf(blk)}</b></div><div style="font-size:12px;margin-top:4px" class="faint">${i === 0 ? "start" : linkOk ? "link ✓" : "<b style='color:var(--rose)'>link broken ✗</b>"}</div></div>`;
    };
    const show = (bl, st) =>
      `<div style="display:flex;gap:8px;flex-wrap:wrap">${bl.map((b, i) => card(b, st, i, bl)).join("")}</div>`;
    runner(box, life, {
      minH: 150,
      code: [
        "each block stores hash(previous block)",
        "edit block 1's data",
        "block 1's hash changes, so block 2's prev is stale",
        "repair block 2's prev: block 2's hash changes",
        "...so block 3's prev is stale, and so on to the tip",
      ],
      frames() {
        const bl = mk(),
          out = [];
        const snap = (cap, line, st = {}, extra = {}) =>
          out.push({
            cap,
            line,
            html: show(
              bl.map((b) => ({ ...b })),
              st,
            ),
            ...extra,
          });
        const oldHash = hashOf(bl[1]);
        snap("A valid chain: every block stores the hash of the block before it, and every link checks out.", 0);
        bl[1].data = EDIT;
        snap(
          `Someone edits block 1: <b>"${esc(EDIT)}"</b>. Block 1's hash changes from ${oldHash} to <b>${hashOf(bl[1])}</b>.`,
          1,
          { edit: 1 },
        );
        snap(
          "Block 2 still stores the <b>old</b> hash of block 1. Block 2's own data has not changed, so its link to block 1 is the one that now fails.",
          2,
          {},
          {
            ask: {
              q: "Block 1 was edited and nothing else. Which block now has a broken link? Tap it.",
              a: "2",
              tiles: "",
              why: "Block 2's stored prev points at the old block 1 hash, which no longer matches. Block 3 only references block 2, whose content is unchanged.",
            },
          },
        );
        bl[2].prev = hashOf(bl[1]);
        snap(
          `The forger repairs block 2's prev. But block 2's content changed, so its hash is now <b>${hashOf(bl[2])}</b> and block 3's link breaks.`,
          3,
        );
        bl[3].prev = hashOf(bl[2]);
        snap(
          "Repair block 3 too and the whole chain validates again, but the forger had to <b>rewrite every block from the edit to the tip</b>. A proof-of-work chain would demand fresh mining for each rewrite.",
          4,
          {},
          { mood: "love" },
        );
        return out;
      },
    });
  }

  // prettier-ignore
  addStep("a8-hash", 1, { t: "Six properties of a cryptographic hash", b: `<p>A cryptographic hash condenses <b>any</b> amount of data into a short fingerprint, and has to behave in six ways.</p>`,
    v: tbl(["Property", "What it means"], [["One-way", "from a digest you cannot recover the input"], ["Collision free", "nobody can find two inputs with the same digest (ideally)"], ["Fast", "quick to compute, even on large input"], ["Deterministic", "the same input always gives the same digest"], ["Fixed length", "the output size never depends on the input size"], ["Avalanche", "a small input change gives an uncorrelated new digest"]], 620),
    c: { q: "A hash rule says h(x) = the last two digits of x. Which property fails most obviously?", o: ["Fixed output length: always two digits", "Avalanche: x and x+1 stay similar", "Determinism: same input, same output"], a: 1, why: "Last-two-digits is deterministic, fast and always two digits long. But 41 and 42 give 41 and 42, so nothing is scrambled (and collisions are trivial, like 41 and 141)." } });
  // prettier-ignore
  addStep("a8-hash", 2, { t: "A hash is not encryption", b: `<p>Encryption uses a <b>key</b> and is reversible: whoever holds the key gets the plaintext back. A hash has <b>no key</b> and <b>no way back</b>. It does not hide a message, it fingerprints it.</p><p>Typical uses: checking a download has not changed (compare digests), storing password fingerprints, linking blocks in a chain, and proof of work.</p>`,
    v: F.compare({ title: "Encryption", c: "violet", body: "key needed<br>reversible<br>hides the contents" }, { title: "Hash", c: "teal", body: "no key<br>one-way<br>fingerprints the contents" }),
    c: { q: "You download a file and the site publishes its SHA-256 digest. Your copy hashes to the same digest. What does that show?", o: ["Your copy is identical to the one the digest came from", "The file is free of viruses", "The website's author is who they claim to be"], a: 0, why: "A matching digest means the bytes match (assuming you trust the digest itself). It says nothing about whether the content is harmless or who made it." } });
  // prettier-ignore
  addStep("a8-hash", 3, { t: "The SHA family and SHA-256", b: `<p>The <b>Secure Hash Algorithms</b> are published by the US standards body NIST: SHA-0, SHA-1, SHA-2 and SHA-3. Bitcoin leans on <b>SHA-256</b> from the SHA-2 family.</p><p>SHA-256 keeps eight 32-bit words (<b>A to H</b>) and mixes them through <b>64 rounds</b>, each combining the words with functions called Ch, Maj, Σ0 and Σ1 and a round constant. Whatever the input size, the output is <b>256 bits</b>, which is 64 hex digits.</p>`,
    v: F.cells(["A", "B", "C", "D", "E", "F", "G", "H"].map((x, i) => ({ v: x, c: i < 4 ? "violet" : "blue" })), { label: "state" }) + `<div class="fig-cap">One round: shuffle the eight words, mix in Ch, Maj, Σ0, Σ1 and the next message word. Repeat 64 times, then output 256 bits.</div>`,
    c: { q: "How long is the SHA-256 digest of a 1 GB file?", o: ["256 bits, the same as for a one-letter input", "256 bits for every MB, so it scales with size", "64 bits, one for each round"], a: 0, why: "SHA-256 always produces 256 bits (64 hex digits). The 64 is the number of rounds, not the digest size." } });
  // prettier-ignore
  addStep("a8-hash", 6, { t: "Watch it run: damage spreads forwards", b: `<p>A forger edits block 1 in a four-block chain. Press <b>play</b> or step with the arrows: see which links break, and what the repair costs.</p><p>It will ask which block fails first. Tap a block.</p>`,
    v: (box, life) => chainRun(box, life) });
})();
