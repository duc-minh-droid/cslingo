(function () {
  const partScope = (NIC.shared.algoWorkshops6 = NIC.shared.algoWorkshops6 || {});
  const { CRC_FRAME, CRC_REM, PAR_FRAME, crcDivide, diffIdx, fxOn, hChecks, hData, hEncode, hSyn, snd, strip, wire } =
    partScope;
  const N = NIC,
    { el, qs, qsa } = N;
  const GEN = "1101",
    MSG4 = "1011";

  /* =====================================================================
     the workshop
     ===================================================================== */
  function channel(stage, api, life) {
    const card = el(`<div class="wk-card aw6-card">
      <div class="aw6-tabs" role="tablist">
        <button class="aw6-tab on" role="tab" data-t="par">1 · Parity</button>
        <button class="aw6-tab" role="tab" data-t="crc">2 · CRC</button>
        <button class="aw6-tab" role="tab" data-t="ham">3 · Hamming</button>
      </div>
      <div class="aw6-pane" data-p="par"></div>
      <div class="aw6-pane" data-p="crc" hidden></div>
      <div class="aw6-pane" data-p="ham" hidden></div></div>`);
    stage.appendChild(card);
    const pane = (k) => qs(`[data-p="${k}"]`, card);
    const tabBtn = (k) => qs(`[data-t="${k}"]`, card);
    function show(k) {
      qsa(".aw6-tab", card).forEach((t) => {
        const on = t.dataset.t === k;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on);
        if (on) t.classList.remove("next");
      });
      qsa(".aw6-pane", card).forEach((p) => {
        const on = p.dataset.p === k;
        if (on && p.hidden && fxOn()) N.fx.enter(p, { y: 8, x: 0 });
        p.hidden = !on;
      });
    }
    qsa(".aw6-tab", card).forEach(
      (t) =>
        (t.onclick = () => {
          show(t.dataset.t);
          snd("tap");
        }),
    );
    const nudge = (k) => tabBtn(k).classList.add("next");

    /* ---------------- 1. parity ---------------- */
    (function () {
      const sent = PAR_FRAME,
        rx = sent.slice(),
        host = pane("par");
      host.innerHTML = `<p class="aw6-lede">A 7-bit message plus one <b>even-parity</b> bit. The receiver counts the 1s: an odd count means "error". Tap a received bit to let noise flip it.</p>
        <div class="aw6-end"><b>Sender</b><div data-s></div></div>${wire(false)}
        <div class="aw6-end"><b>Receiver</b><div data-r></div></div>
        <div class="aw6-tiles" data-tiles></div>
        <div class="wk-row"><button class="btn ghost small" data-clean>Clean the wire</button><span class="aw6-foot" data-foot></span></div>`;
      const labels = sent.map((_, i) => (i === 7 ? "parity" : "d" + (i + 1)));
      const tone = (i) => (i === 7 ? "par" : "");
      strip(qs("[data-s]", host), { sent, labels, tone });
      const R = strip(qs("[data-r]", host), { sent, rx, labels, tone, onTap: flip });
      const tiles = qs("[data-tiles]", host),
        w = qs(".aw6-wire", host);
      function paint(flash) {
        R.paint(flash);
        const ones = rx.reduce((a, b) => a + b, 0),
          even = ones % 2 === 0,
          bad = diffIdx(rx, sent);
        w.classList.toggle("noisy", bad.length > 0);
        const fooled = even && bad.length > 0;
        tiles.innerHTML = `<div class="aw6-tile ${even ? "ok" : "no"}"><small>Receiver counts</small><b>${ones} ones</b><span>${even ? "even: looks clean" : "odd: error detected"}</span></div>
          <div class="aw6-tile ${bad.length ? "no" : "ok"}"><small>What really happened</small><b>${bad.length} flipped</b><span>${bad.length ? "bit" + (bad.length > 1 ? "s " : " ") + bad.map((i) => i + 1).join(", ") : "nothing"}</span></div>
          ${fooled ? `<div class="aw6-fooled">Fooled! The receiver accepts damaged data.</div>` : ""}`;
        return { ones, even, bad, fooled };
      }
      function flip(i) {
        rx[i] ^= 1;
        snd("tap");
        const s = paint(i),
          n = s.bad.length;
        if (n === 0) api.say("Clean again: the 1s add up to an even count, and nothing is damaged.", "happy");
        else if (n % 2 === 1) {
          api.say(
            `${s.ones} ones is <b>odd</b>, so the receiver knows something broke. But it can't say <i>which</i> bit, so it can't fix it.`,
            "think",
          );
          if (n === 1 && api.done("detect")) {
            api.say(
              "Caught! One flip always makes the count odd. Now flip a <b>second</b> bit and watch what happens.",
              "happy",
            );
          }
        } else {
          api.say(
            `Two flips cancel out: ${s.ones} ones is <b>even</b> again, so the receiver says all clear. Parity only sees odd versus even.`,
            "shocked",
          );
          if (api.done("fool")) {
            snd("wrong");
            nudge("crc");
          }
        }
      }
      qs("[data-clean]", host).onclick = () => {
        sent.forEach((v, i) => (rx[i] = v));
        paint();
        api.say("Wire cleaned. Flip a bit.", "idle");
      };
      qs("[data-foot]", host).textContent = "Flip 1 bit, then 2.";
      paint();
    })();

    /* ---------------- 2. CRC ---------------- */
    (function () {
      const sent = CRC_FRAME,
        rx = sent.slice(),
        host = pane("crc"),
        G = GEN;
      host.innerHTML = `<p class="aw6-lede">Message <b>${MSG4}</b>, generator <b>${G}</b>: the sender appended remainder <b>${CRC_REM}</b>. The receiver divides the whole frame by ${G} (XOR, no borrows). Remainder 000 means clean.</p>
        <div class="aw6-end"><b>Sender</b><div data-s></div></div>${wire(false)}
        <div class="aw6-end"><b>Receiver</b><div data-r></div></div>
        <div class="aw6-div" data-div aria-live="polite"></div>
        <div class="aw6-tiles" data-tiles></div>
        <div class="wk-row"><button class="btn ghost small" data-clean>Clean the wire</button><span class="aw6-foot" data-foot></span></div>`;
      const labels = sent.map((_, i) => (i < 4 ? "msg" : "crc")),
        tone = (i) => (i >= 4 ? "crc" : "");
      strip(qs("[data-s]", host), { sent, labels, tone });
      const R = strip(qs("[data-r]", host), { sent, rx, labels, tone, onTap: flip });
      const tiles = qs("[data-tiles]", host),
        dv = qs("[data-div]", host),
        w = qs(".aw6-wire", host);
      function paint(flash) {
        R.paint(flash);
        const bits = rx.join(""),
          r = crcDivide(bits, G),
          bad = diffIdx(rx, sent),
          clean = r.rem === "0".repeat(G.length - 1);
        w.classList.toggle("noisy", bad.length > 0);
        // classic long division, one line pair per XOR
        let html = `<div class="aw6-dl"><span class="aw6-dk">frame</span><span class="aw6-dv">${bits}</span></div>`;
        if (!r.steps.length)
          html += `<div class="aw6-dl faint"><span class="aw6-dk"></span><span>no leading 1 to cancel</span></div>`;
        r.steps.forEach((s) => {
          html += `<div class="aw6-dl"><span class="aw6-dk">⊕ ${G}</span><span class="aw6-dv">${" ".repeat(s.at)}<u>${G}</u></span></div><div class="aw6-dl"><span class="aw6-dk"></span><span class="aw6-dv">${s.reg.slice(0, s.at + G.length).replace(/^0+(?=.)/, (m) => m.replace(/0/g, "·")) + s.reg.slice(s.at + G.length)}</span></div>`;
        });
        dv.innerHTML = html;
        tiles.innerHTML = `<div class="aw6-tile ${clean ? "ok" : "no"}"><small>Remainder</small><b>${r.rem}</b><span>${clean ? "zero: accepted" : "not zero: rejected"}</span></div>
          <div class="aw6-tile ${bad.length ? "no" : "ok"}"><small>What really happened</small><b>${bad.length} flipped</b><span>${bad.length ? "bit" + (bad.length > 1 ? "s " : " ") + bad.map((i) => i + 1).join(", ") : "nothing"}</span></div>
          ${clean && bad.length ? `<div class="aw6-fooled">Slipped past the CRC!</div>` : ""}`;
        return { r, bad, clean };
      }
      function flip(i) {
        rx[i] ^= 1;
        snd("tap");
        const s = paint(i),
          n = s.bad.length,
          run3 = n === 3 && s.bad[2] - s.bad[0] === 2;
        if (n === 0) api.say("Clean again: remainder 000.", "happy");
        else if (s.clean)
          api.say(
            `You beat it! These ${n} flips happen to leave a multiple of ${G}. With a 3-bit remainder, only 8 outcomes exist, so a few patterns must collide. Real CRCs use 16 or 32 bits.`,
            "shocked",
          );
        else if (run3) {
          api.say(
            `A burst of <b>3 in a row</b>, and the remainder is <b>${s.r.rem}</b>, not 000. A generator of degree 3 always catches any burst up to 3 bits wide.`,
            "love",
          );
          if (api.done("burst")) nudge("ham");
        } else if (n === 1)
          api.say(
            `One flip: remainder <b>${s.r.rem}</b>, so it's rejected. Every single-bit error is caught.`,
            "happy",
          );
        else
          api.say(
            `Remainder <b>${s.r.rem}</b>: rejected. Parity missed some pairs of flips, but any <b>two</b> flips in this 7-bit frame change the remainder. Now try three bits <b>in a row</b>.`,
            "happy",
          );
      }
      qs("[data-clean]", host).onclick = () => {
        sent.forEach((v, i) => (rx[i] = v));
        paint();
        api.say("Wire cleaned. Flip three neighbouring bits.", "idle");
      };
      qs("[data-foot]", host).textContent = "Flip three bits in a row.";
      paint();
    })();

    /* ---------------- 3. Hamming(7,4) ---------------- */
    (function () {
      const host = pane("ham");
      const data = [1, 0, 1, 1],
        sent = hEncode(data);
      let rx = sent.slice(),
        mode = "noise";
      host.innerHTML = `<p class="aw6-lede">Hamming(7,4): data at <b>3, 5, 6, 7</b> and parity bits at <b>1, 2, 4</b>. Each circle is one parity check. Tap a received bit to flip it, then read which circles turn red.</p>
        <div class="aw6-end"><b>Sender</b><span class="faint aw6-small">tap a data bit to change the message</span><div data-s></div></div>${wire(false)}
        <div class="aw6-end"><b>Receiver</b><div data-r></div></div>
        <div class="aw6-hgrid">
          <div class="aw6-venn-w"><svg class="aw6-venn" viewBox="0 0 280 256" role="img" aria-label="Three overlapping parity circles"></svg></div>
          <div class="aw6-side">
            <div class="aw6-syn" data-syn></div>
            <div class="aw6-mode" role="group" aria-label="What a tap does"><button class="btn small" data-m="noise">Add noise</button><button class="btn small" data-m="repair">Repair</button></div>
            <div class="wk-row"><button class="btn small primary" data-auto>Auto-correct</button><button class="btn ghost small" data-clean>Clean the wire</button></div>
            <div class="aw6-tiles one" data-tiles></div>
          </div></div>`;
      const labels = ["p1", "p2", "d3", "p4", "d5", "d6", "d7"].map((t, i) => `${i + 1} · ${t}`);
      const tone = (i) => ([0, 1, 3].includes(i) ? "par" : "");
      const pos = {
        1: [62, 76],
        2: [218, 76],
        3: [140, 62],
        4: [140, 214],
        5: [92, 142],
        6: [188, 142],
        7: [140, 116],
      };
      const circ = { p1: [105, 96], p2: [175, 96], p4: [140, 156] },
        R_ = 70;
      const svg = qs(".aw6-venn", host);
      svg.innerHTML =
        Object.entries(circ)
          .map(
            ([k, [x, y]]) =>
              `<g class="aw6-vc" data-c="${k}"><circle class="ok" cx="${x}" cy="${y}" r="${R_}"/><circle class="bad" cx="${x}" cy="${y}" r="${R_}"/></g>`,
          )
          .join("") +
        Object.entries(circ)
          .map(
            ([k, [x, y]]) => `<g class="aw6-vc" data-c="${k}"><circle class="ring" cx="${x}" cy="${y}" r="${R_}"/></g>`,
          )
          .join("") +
        `<text class="aw6-cl" x="40" y="26">p1</text><text class="aw6-cl" x="240" y="26">p2</text><text class="aw6-cl" x="242" y="222">p4</text>` +
        Object.entries(pos)
          .map(
            ([p, [x, y]]) =>
              `<g class="aw6-vb${[1, 2, 4].includes(+p) ? " par" : ""}" data-p="${p}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="Received bit ${p}"><circle r="17"/><text class="v" y="1"></text><text class="n" y="-22">${p}</text></g>`,
          )
          .join("");
      strip(qs("[data-s]", host), { sent, labels, tone, onTap: null });
      // the sender's data bits are tappable
      const sHost = qs("[data-s]", host);
      qsa(".aw6-bit", sHost).forEach((b) => {
        const i = +b.dataset.i;
        if ([2, 4, 5, 6].includes(i)) {
          b.disabled = false;
          b.tabIndex = 0;
          b.classList.add("edit");
          b.onclick = () => {
            const k = [2, 4, 5, 6].indexOf(i);
            data[k] ^= 1;
            hEncode(data).forEach((v, q) => (sent[q] = v));
            reset();
            snd("select");
            api.say(
              `New message <b>${data.join("")}</b>. The parity bits are recomputed so every circle holds an even number of 1s.`,
              "happy",
            );
          };
        }
      });
      const Rx = strip(qs("[data-r]", host), { sent, rx, labels, tone, onTap: (i) => tap(i) });
      const tiles = qs("[data-tiles]", host),
        syn = qs("[data-syn]", host),
        w = qs(".aw6-wire", host);

      function paint(flash) {
        // re-point the strips at the current arrays
        qsa(".aw6-bit", sHost).forEach((b, i) => {
          b.textContent = sent[i];
          b.classList.toggle("one", sent[i] === 1);
        });
        Rx.paint(flash);
        const k = hChecks(rx),
          s = hSyn(rx),
          bad = diffIdx(rx, sent);
        w.classList.toggle("noisy", bad.length > 0);
        Object.keys(circ).forEach((c) => {
          qsa(`[data-c="${c}"]`, svg).forEach((g) => g.classList.toggle("fail", !!k[c]));
        });
        Object.entries(pos).forEach(([p]) => {
          const g = qs(`[data-p="${p}"]`, svg),
            v = rx[p - 1],
            fl = v !== sent[p - 1];
          qs(".v", g).textContent = v;
          g.classList.toggle("flipped", fl);
          g.classList.toggle("one", v === 1);
          g.classList.toggle("hit", s === +p);
        });
        if (flash !== undefined && fxOn()) N.fx.bump(qs(`[data-p="${flash + 1}"] circle`, svg), { scale: 1.25 });
        syn.innerHTML = `<div class="aw6-sl">${["p4", "p2", "p1"].map((c) => `<span class="aw6-lamp ${k[c] ? "fail" : "pass"}"><small>${c}</small><b>${k[c] ? "✗" : "✓"}</b></span>`).join("")}<span class="aw6-eq">=</span><span class="aw6-sv"><b>${k.p4}${k.p2}${k.p1}</b><small>= ${s}</small></span></div>
          <div class="aw6-sn">${s === 0 ? "All three checks pass: nothing to locate." : `Syndrome points at <b>position ${s}</b>.`}</div>`;
        const dec = hData(rx),
          ok = dec.join("") === data.join("");
        tiles.innerHTML = `<div class="aw6-tile ${ok ? "ok" : "no"}"><small>Receiver reads</small><b class="mono">${dec.join("")}</b><span>${ok ? "matches what was sent" : `not ${data.join("")}`}</span></div>`;
        qsa("[data-m]", host).forEach((b) => b.classList.toggle("primary", b.dataset.m === mode));
        return { k, s, bad, ok };
      }
      function reset() {
        sent.forEach((_, i) => (rx[i] = sent[i]));
        paint();
      }
      function tap(i) {
        const before = diffIdx(rx, sent),
          wasErr = before.includes(i);
        rx[i] ^= 1;
        snd("tap");
        const r = paint(i),
          n = r.bad.length;
        if (mode === "noise") {
          if (n === 0) api.say("Back to a clean codeword: all three circles are green.", "happy");
          else if (n === 1)
            api.say(
              `Bit ${i + 1} flipped. Circles ${["p1", "p2", "p4"].filter((c) => r.k[c]).join(" and ") || "none"} went red: that reads <b>${r.k.p4}${r.k.p2}${r.k.p1}</b>, which is <b>${r.s}</b> in binary. Switch to <b>Repair</b> and tap position ${r.s}.`,
              "think",
            );
          else
            api.say(
              `${n} bits are wrong now. The circles show ${r.s ? `syndrome <b>${r.s}</b>` : "<b>all clear</b>"}, but it's a single-error code. Press <b>Auto-correct</b> and see.`,
              "surprised",
            );
        } else {
          if (before.length === 1 && wasErr) {
            api.say(`Yes! Position <b>${i + 1}</b> was the culprit: all three circles are green again.`, "love");
            api.done("locate");
          } else if (n === 0) api.say("Clean again.", "happy");
          else if (!wasErr)
            api.say(
              `Position <b>${i + 1}</b> was fine, and you have just damaged it. The syndrome now says <b>${r.s}</b>. Read the failed circles again.`,
              "sad",
            );
          else api.say(`Better: ${n} bit${n > 1 ? "s" : ""} still wrong. Syndrome <b>${r.s}</b>.`, "think");
        }
      }
      qsa("[data-m]", host).forEach(
        (b) =>
          (b.onclick = () => {
            mode = b.dataset.m;
            paint();
            snd("select");
            api.say(
              mode === "repair"
                ? "Repair mode: a tap flips a bit <i>back</i>. Tap the position the syndrome names."
                : "Noise mode: a tap corrupts a bit.",
              "idle",
            );
          }),
      );
      qsa(".aw6-vb", svg).forEach((g) => {
        g.onclick = () => tap(+g.dataset.p - 1);
        g.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            tap(+g.dataset.p - 1);
          }
        };
      });
      qs("[data-clean]", host).onclick = () => {
        reset();
        api.say("Wire cleaned.", "idle");
      };
      qs("[data-auto]", host).onclick = () => {
        const s = hSyn(rx),
          before = diffIdx(rx, sent);
        if (!s) {
          api.say(
            before.length
              ? "All three checks pass, yet the codeword is damaged. Flips that add up to a valid codeword slip through."
              : "Nothing to fix: the syndrome is 000.",
            "think",
          );
          return;
        }
        rx[s - 1] ^= 1;
        snd("pop");
        const r = paint(s - 1),
          innocent = !before.includes(s - 1);
        if (before.length === 1)
          api.say(
            `Auto-corrected position <b>${s}</b>. One error is exactly what Hamming can fix. Try <b>Repair</b> mode to do it by hand.`,
            "happy",
          );
        else if (before.length >= 2 && !r.ok) {
          api.say(
            `It flipped position <b>${s}</b>${innocent ? ", an <b>innocent</b> bit" : ""}. Now <b>${r.bad.length}</b> bits are wrong and the receiver reads <b class="mono">${hData(rx).join("")}</b>, not ${data.join("")}. With two errors the syndrome is misleading.`,
            "shocked",
          );
          if (api.done("two")) snd("wrong");
        } else api.say(`Flipped position <b>${s}</b>.`, "idle");
      };
      reset();
    })();
  }
  Object.assign(partScope, { channel });
})();
