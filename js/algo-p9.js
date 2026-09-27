/* ECM3428 Phase 9 (lecture 9) — Fourier intuition, the DFT, and the FFT's halving trick. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, fmt } = N;
  const S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });

  /* ---------- tiny HTML builders for lesson visuals ---------- */
  const table = (head, rows) => `<table class="t" style="max-width:680px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const flow = (items) => `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;
  const genomes = (xs, cls) => `<span class="genome">${xs.map((c, i) => `<span class="gene ${typeof cls === "function" ? cls(i) : cls || ""}" style="min-width:26px;height:28px;font-size:13px">${c}</span>`).join("")}</span>`;

  /** Naive DFT magnitudes for a real signal — deliberately O(N²): this module's whole point. */
  function dftMag(x) {
    const n = x.length, out = new Array(n);
    for (let k = 0; k < n; k++) {
      let re = 0, im = 0;
      for (let t = 0; t < n; t++) {
        const a = (-2 * Math.PI * k * t) / n;
        re += x[t] * Math.cos(a);
        im += x[t] * Math.sin(a);
      }
      out[k] = Math.hypot(re, im);
    }
    return out;
  }

  /* ============ 9.1 Which waves are inside? ============ */
  reg({
    id: "a9-dft", order: 1, num: "9.1", title: "Which waves are inside?",
    blurb: "Mix sine waves, then let a small DFT read the recipe back — including the 60 Hz tone that lies about its frequency.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const FS = 100, NS = 100; // 100 samples at 100 Hz → 1-second window → 1-Hz bins
      const comps = [
        { f: 5, A: 1.0, c: "var(--teal)", name: "Wave 1" },
        { f: 12, A: 0.5, c: "var(--violet)", name: "Wave 2" },
        { f: 0, A: 0, c: "var(--amber)", name: "Wave 3" },
      ];
      let mode = "mix";

      const card = el(`<div class="card"><div class="card-head"><h2>Sine-wave mixer → spectrum</h2><span class="faint">fs = 100 Hz · N = 100 samples · bins are exactly 1 Hz wide</span></div>
        <div class="controls" id="segRow"></div>
        <div id="mixers" class="controls" style="gap:18px"></div>
        <canvas class="viz" id="wave"></canvas>
        <div class="legend"><span style="--c:var(--teal)">sampled dots — what the computer actually sees</span><span style="--c:var(--text-faint)">true continuous signal</span></div>
        <canvas class="viz" id="spec" style="margin-top:14px"></canvas>
        <div class="legend"><span style="--c:var(--teal)">measured |X[k]|</span><span style="--c:var(--rose)">shaded zone = above fs/2, folds back</span><span style="--c:var(--amber)">▼ true component position</span></div>
        <div class="stat-row"><div class="stat teal"><small>Strongest measured</small><b id="pk"></b></div><div class="stat"><small>Nyquist limit fs/2</small><b>50 Hz</b></div><div class="stat amber"><small>Bin spacing fs/N</small><b>1 Hz</b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);

      qs("#segRow", card).append(N.seg(
        [["mix", "Mix of sines"], ["impulse", "Impulse"], ["constant", "Constant"], ["checker", "Checkerboard"]],
        mode,
        (v) => { mode = v; qs("#mixers", card).style.display = v === "mix" ? "" : "none"; draw(); }
      ));

      comps.forEach((c, i) => {
        const wrap = el(`<div style="border-left:3px solid ${c.c};padding-left:10px"></div>`);
        const sf = N.slider(`${c.name} freq (Hz)`, 0, 80, 0.5, c.f, (v) => fmt(v, 1));
        sf.onInput((v) => { c.f = v; draw(); });
        const sa = N.slider(`amp`, 0, 1, 0.05, c.A, (v) => fmt(v, 2));
        sa.onInput((v) => { c.A = v; draw(); });
        wrap.append(sf, document.createElement("br"), sa);
        qs("#mixers", card).append(wrap);
      });

      const signal = (n) => {
        if (mode === "mix") return comps.reduce((s, c) => s + c.A * Math.sin((2 * Math.PI * c.f * n) / FS), 0);
        if (mode === "impulse") return n === 0 ? 1 : 0;
        if (mode === "constant") return 1;
        return n % 2 === 0 ? 1 : -1; // checkerboard = fastest alternation possible
      };
      const truth = (t) => comps.reduce((s, c) => s + c.A * Math.sin(2 * Math.PI * c.f * t), 0); // t in seconds
      const folded = (f) => { let m = f % FS; if (m > FS / 2) m = FS - m; return m; };

      function draw() {
        const C = N.colors();
        const xs = Array.from({ length: NS }, (_, n) => signal(n));
        // ---- waveform ----
        {
          const { ctx, w, h } = N.setupCanvas(qs("#wave", card), 190);
          const padL = 34, padR = 8;
          const ymax = mode === "mix" ? Math.max(1.2, comps.reduce((s, c) => s + c.A, 0) * 1.1) : 1.4;
          const X = (n) => padL + (n / (NS - 1)) * (w - padL - padR);
          const Y = (v) => h / 2 - (v / ymax) * (h / 2 - 14);
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(padL, h / 2); ctx.lineTo(w - padR, h / 2); ctx.stroke();
          ctx.fillStyle = C.text_faint; ctx.font = "11px monospace"; ctx.textAlign = "right";
          ctx.fillText(fmt(ymax, 1), padL - 5, Y(ymax) + 8);
          ctx.fillText("0", padL - 5, h / 2 + 4);
          ctx.fillText(fmt(-ymax, 1), padL - 5, Y(-ymax) + 4);
          if (mode === "mix") {
            ctx.strokeStyle = C.text_faint; ctx.lineWidth = 1.2; ctx.beginPath();
            for (let p = 0; p <= 600; p++) {
              const t = p / 600; // one second
              const x = padL + t * (w - padL - padR), y = Y(truth(t));
              p === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          ctx.lineWidth = 1;
          xs.forEach((v, n) => {
            ctx.strokeStyle = "rgba(88,204,2,0.35)";
            ctx.beginPath(); ctx.moveTo(X(n), h / 2); ctx.lineTo(X(n), Y(v)); ctx.stroke();
          });
          xs.forEach((v, n) => {
            ctx.fillStyle = C.teal;
            ctx.beginPath(); ctx.arc(X(n), Y(v), 2.6, 0, 7); ctx.fill();
          });
          ctx.fillStyle = C.text_faint; ctx.textAlign = "left";
          ctx.fillText("sample n (0–99 = one second)", padL, h - 6);
        }
        // ---- spectrum ----
        const mag = dftMag(xs); // 10k multiply-adds — exactly the O(N²) the FFT avoids
        const half = Math.floor(NS / 2); // bins 0..50 shown
        const FMAX = 80;
        const { ctx, w, h } = N.setupCanvas(qs("#spec", card), 210);
        const padL = 34, padR = 8, padT = 14, padB = 30;
        const F = (f) => padL + (f / FMAX) * (w - padL - padR);
        const hi = Math.max(1e-9, ...mag.slice(0, half + 1));
        const Y = (v) => padT + (1 - v / hi) * (h - padT - padB);
        ctx.clearRect(0, 0, w, h);
        // forbidden zone 50–80 Hz
        ctx.fillStyle = "rgba(255,75,75,0.08)";
        ctx.fillRect(F(50), padT, F(80) - F(50), h - padT - padB);
        ctx.strokeStyle = "rgba(255,75,75,0.5)"; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(F(50), padT); ctx.lineTo(F(50), h - padB); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.rose; ctx.font = "11px monospace"; ctx.textAlign = "center";
        ctx.fillText("above fs/2: can't be", (F(50) + F(80)) / 2, padT + 14);
        ctx.fillText("told from a folded low one", (F(50) + F(80)) / 2, padT + 27);
        // grid + bars
        ctx.strokeStyle = C.line; ctx.fillStyle = C.text_faint;
        for (let g = 0; g <= 4; g++) {
          const y = padT + (g / 4) * (h - padT - padB);
          ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(F(50), y); ctx.stroke();
          ctx.textAlign = "right"; ctx.fillText(fmt(hi * (1 - g / 4), 1), padL - 5, y + 4);
        }
        const bw = (F(50) - F(0)) / 51;
        for (let k = 0; k <= half; k++) {
          const bhh = (mag[k] / hi) * (h - padT - padB);
          ctx.fillStyle = C.teal;
          ctx.fillRect(F(k) - bw / 2 + 1, h - padB - bhh, Math.max(1, bw - 2), bhh);
        }
        ctx.fillStyle = C.text_faint; ctx.textAlign = "center";
        for (let f = 0; f <= 80; f += 10) ctx.fillText(f + " Hz", F(f), h - 14);
        // component markers: true position (orange ▼) and folded landing spot
        const note = qs("#note", card);
        const aliases = [];
        if (mode === "mix") comps.forEach((c) => {
          if (c.A <= 0) return;
          ctx.fillStyle = C.amber; ctx.strokeStyle = C.amber;
          ctx.beginPath(); ctx.moveTo(F(c.f) - 5, h - padB - 2); ctx.lineTo(F(c.f) + 5, h - padB - 2); ctx.lineTo(F(c.f), h - padB + 6); ctx.closePath(); ctx.fill();
          if (c.f > 50) {
            const fa = folded(c.f);
            ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(F(c.f), h - padB + 8); ctx.lineTo(F(fa), h - padB + 8); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = C.rose;
            ctx.beginPath(); ctx.moveTo(F(fa) - 5, h - padB - 2); ctx.lineTo(F(fa) + 5, h - padB - 2); ctx.lineTo(F(fa), h - padB + 6); ctx.closePath(); ctx.fill();
            aliases.push(`<b>${fmt(c.f, 1)} Hz</b> is above the 50 Hz Nyquist limit — it folds to <b style="color:var(--rose)">${fmt(fa, 1)} Hz</b> (100 − ${fmt(c.f, 1)}). The spectrum cannot tell it apart from a real ${fmt(fa, 1)} Hz tone.`);
          }
        });
        const top = mag.slice(0, half + 1).map((v, k) => [v, k]).sort((a, b) => b[0] - a[0]).slice(0, 3);
        qs("#pk", card).textContent = mode === "impulse" ? "all bins ≈ equal" : `${top[0][1]} Hz  (|X| = ${fmt(top[0][0], 1)})`;
        const fixed = {
          impulse: `<div class="callout violet"><b>Impulse [1,0,0,…]:</b> one spike in time contains <b>every frequency equally</b> — the spectrum is flat (each |X[k]| = 1). Matches the N = 4 hand DFT [1,0,0,0] → [1,1,1,1].</div>`,
          constant: `<div class="callout violet"><b>Constant [1,1,1,…]:</b> no wiggle at all, so all energy sits in bin <b>k = 0</b> (DC), |X[0]| = N = 100.</div>`,
          checker: `<div class="callout violet"><b>Checkerboard [1,−1,1,−1,…]:</b> the fastest alternation N samples can hold — all energy lands in bin <b>k = 50</b>, the Nyquist bin. Same as N = 4: [1,−1,1,−1] → energy only at k = 2.</div>`,
          mix: "",
        };
        note.innerHTML = (aliases.length ? `<div class="callout rose"><b>Aliasing!</b> ${aliases.join("<br>")} Rule: fs &gt; 2·f<sub>max</sub>, or the spectrum lies.</div>` : "") + (fixed[mode] || "");
      }
      life.onResize(draw);
      draw();

      root.appendChild(predict({ id: "a9-dft-1",
        q: "Set Wave 1 to 10 Hz amp 1, Wave 2 to 20 Hz amp 0.5, Wave 3 amp 0. What does the spectrum show?",
        opts: ["One peak at 10 Hz — the waves merge", "Two peaks: a tall one at 10 Hz and a half-height one at 20 Hz", "A bump at every frequency"],
        a: 1, why: "The spectrum is just the recipe: which frequencies, how strong. Amplitude maps to bar height." }));
      root.appendChild(predict({ id: "a9-dft-2",
        q: "A true <b>60 Hz</b> hum sampled at fs = 100 Hz appears in the spectrum at…",
        opts: ["60 Hz", "40 Hz", "0 Hz (it disappears)"],
        a: 1, why: "60 Hz is above fs/2 = 50 Hz, so it folds back: 100 − 60 = <b>40 Hz</b>. Try it — set Wave 1 to 60 Hz. The dots pretend to be a 40 Hz wave and the damage is permanent." }));
      root.appendChild(takeaways([
        "Any signal is a <b>recipe of sine waves</b>; the DFT reads the recipe back — each bin X[k] asks \"how much of frequency k?\".",
        "Matching frequencies <b>add</b>, mismatched ones <b>cancel</b> — that's the whole trick.",
        "<b>Aliasing</b>: above fs/2, frequencies fold back and impersonate lower ones (60 Hz @ fs = 100 → 40 Hz). Irreversible.",
        "<b>Leakage</b>: a non-integer number of cycles in the window smears energy across neighbouring bins. Different cause, different fix (windowing).",
        "Real signals give symmetric spectra — only bins 0…N/2 carry independent information.",
        "Direct DFT costs N bins × N samples = <b>O(N²)</b>. That cost is what the next module attacks.",
      ], "The DFT decomposes a signal into its frequencies — and it only tells the truth if you sampled fast enough."));
    },
  });

  /* ============ 9.2 The halving trick ============ */
  reg({
    id: "a9-fft", order: 2, num: "9.2", title: "The halving trick",
    blurb: "The FFT isn't a new transform — it's the same DFT, computed by splitting evens from odds until only one-sample problems remain.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const LEVELS = [
        [[0, 1, 2, 3, 4, 5, 6, 7]],
        [[0, 2, 4, 6], [1, 3, 5, 7]],
        [[0, 4], [2, 6], [1, 5], [3, 7]],
        [[0], [4], [2], [6], [1], [5], [3], [7]],
      ];
      // step: 0 = start, 1-3 = splits reveal levels 1..3, 4-6 = combines merge levels 3→0
      let step = 0, playing = null;
      const STATUS = [
        ["One problem of size 8.", "Direct DFT: 8 outputs × 8 products = <b>64</b> multiply-adds."],
        ["Split evens / odds → two problems of size 4.", "Even indices <span style='color:var(--teal)'>green</span>, odd indices <span style='color:var(--amber)'>orange</span>. Each half would cost (8/2)² = 16 — already only half the work."],
        ["Split again → four problems of size 2.", "Same trick on each half."],
        ["Eight problems of size 1.", "A DFT of one number is <b>the number itself</b>. Leaf order is bit-reversed: <b>0 4 2 6 1 5 3 7</b> (reverse the 3 bits of the position: 001→100=4)."],
        ["Combine: leaves → size-2 results.", "Each pair does one <b>butterfly</b>: out = a + W·b and a − W·b (one multiply, one add, one subtract). 4 butterflies so far."],
        ["Combine: size 2 → size 4.", "Same butterfly shape, longer twiddles. 8 butterflies so far."],
        ["Combine: size 4 → the final spectrum.", "12 butterflies total: <b>3 levels × 8-ish work per level = N·log₂N = 24</b>, versus N² = 64. Identical answer to the direct DFT — just organised so work is shared."],
      ];
      const card = el(`<div class="card"><div class="card-head"><h2>The FFT recursion tree (N = 8)</h2></div>
        <div class="controls"><button class="btn primary" id="nx">Next step →</button><button class="btn" id="pl">Auto-play</button><button class="btn ghost" id="rs">Reset</button><span class="mono dim" id="stc"></span></div>
        <div id="tree"></div>
        <div class="callout" id="stt" style="margin-top:14px"></div>
        <div class="stat-row"><div class="stat violet"><small>Butterflies done</small><b id="bf">0 / 12</b></div><div class="stat rose"><small>Direct DFT ops</small><b>64 (N²)</b></div><div class="stat teal"><small>FFT ops</small><b>24 (N·log₂N)</b></div></div></div>`);
      root.appendChild(card);

      function drawTree() {
        const splitDepth = Math.min(step, 3); // levels 0..splitDepth exist
        const combineK = step > 3 ? step - 3 : 0; // 0..3, merges level (4-k)→(3-k)
        const rows = [];
        for (let l = 0; l <= splitDepth; l++) {
          const mergingLevel = combineK > 0 && l === 4 - combineK;
          const targetLevel = combineK > 0 && l === 3 - combineK;
          const groups = LEVELS[l].map((grp, gi) => {
            const cls = (i) => {
              if (combineK > 0) {
                if (l === mergingLevel) return gi % 2 === 0 ? "good" : "p2"; // pair colours
                if (l === targetLevel) return "changed";
                return "";
              }
              if (l === splitDepth - 1 && step > 0 && step <= 3) return i % 2 === 0 ? "good" : "p2"; // just split
              return "";
            };
            return `<span style="display:inline-flex;margin:0 7px">${genomes(grp, cls)}</span>`;
          }).join("");
          const tag = l === splitDepth && combineK === 0 && l > 0 ? `<span class="faint" style="font-size:12px;margin-left:8px">${l === 3 ? "leaves — bit-reversed order" : `${LEVELS[l].length} problems of size ${LEVELS[l][0].length}`}</span>` : "";
          rows.push(`<div class="genome-row"><span class="lbl">level ${l}</span>${groups}${tag}</div>`);
        }
        let extra = "";
        if (step >= 3 && combineK === 0) {
          extra = `<div class="genome-row"><span class="lbl">position</span><span class="mono dim">0&ensp;1&ensp;2&ensp;3&ensp;4&ensp;5&ensp;6&ensp;7&emsp;→ reverse 3 bits of each position to get its leaf</span></div>
            <div class="genome-row"><span class="lbl">bits</span><span class="mono dim">000 001 010 011 100 101 110 111 &nbsp;→&nbsp; 000 100 010 110 001 101 011 111 = <b>0 4 2 6 1 5 3 7</b></span></div>`;
        }
        qs("#tree", card).innerHTML = rows.join("") + extra;
        const [t, d] = STATUS[step];
        qs("#stt", card).innerHTML = `<b>${t}</b> ${d}`;
        qs("#bf", card).textContent = `${combineK * 4} / 12`;
        qs("#nx", card).textContent = step < 3 ? "Split ↓" : step < 6 ? "Combine (butterflies) ↑" : "Done — reset?";
        qs("#stc", card).textContent = `step ${step} / 6`;
      }
      const stop = () => { if (playing) { playing(); playing = null; qs("#pl", card).textContent = "Auto-play"; } };
      qs("#nx", card).onclick = () => { step = step >= 6 ? 0 : step + 1; if (step === 0) stop(); drawTree(); };
      qs("#rs", card).onclick = () => { stop(); step = 0; drawTree(); };
      qs("#pl", card).onclick = () => {
        if (playing) return stop();
        qs("#pl", card).textContent = "Pause";
        playing = life.interval(() => { step = step >= 6 ? 0 : step + 1; drawTree(); if (step === 6) stop(); }, 1500);
      };
      drawTree();

      // ---- op-count race chart ----
      let k2 = 10, logy = true; // N = 2^k2
      const rc = el(`<div class="card"><div class="card-head"><h2>The race: N² vs N·log₂N</h2><span class="faint">operations (multiply-adds, roughly)</span></div>
        <div class="controls" id="rcRow"></div><canvas class="viz" id="rcv"></canvas>
        <div class="stat-row"><div class="stat rose"><small>Direct DFT</small><b id="o1"></b></div><div class="stat teal"><small>FFT</small><b id="o2"></b></div><div class="stat amber"><small>FFT speedup</small><b id="o3"></b></div></div></div>`);
      root.appendChild(rc);
      const sk = N.slider("log₂ N", 3, 20, 1, k2, (v) => `2^${v} = ${(2 ** v).toLocaleString()}`);
      sk.onInput((v) => { k2 = v; drawRace(); });
      const lg = el(`<label class="field"><input type="checkbox" ${logy ? "checked" : ""}> log scale</label>`);
      qs("input", lg).onchange = (e) => { logy = e.target.checked; drawRace(); };
      qs("#rcRow", rc).append(sk, lg);
      function drawRace() {
        const C = N.colors(), n = 2 ** k2;
        const d = n * n, f = n * k2;
        const { ctx, w, h } = N.setupCanvas(qs("#rcv", rc), 220);
        const padB = 34, padT = 16, cw = w / 2;
        const sc = (v) => (logy ? Math.log10(Math.max(1, v)) : v);
        const hi = sc(d);
        const bars = [[d, C.rose, "direct DFT · N²"], [f, C.teal, "FFT · N·log₂N"]];
        ctx.clearRect(0, 0, w, h);
        bars.forEach(([v, c, lb], i) => {
          const bh = (sc(v) / hi) * (h - padT - padB);
          const x = cw * i + cw * 0.22, bw = cw * 0.56;
          ctx.fillStyle = c; ctx.globalAlpha = 0.85;
          ctx.fillRect(x, h - padB - Math.max(bh, 3), bw, Math.max(bh, 3));
          ctx.globalAlpha = 1; ctx.fillStyle = C.text; ctx.textAlign = "center";
          ctx.font = "13px monospace";
          ctx.fillText(v.toLocaleString(), x + bw / 2, h - padB - Math.max(bh, 3) - 8);
          ctx.fillStyle = C.text_faint; ctx.font = "12px sans-serif";
          ctx.fillText(lb, x + bw / 2, h - 14);
        });
        ctx.fillStyle = C.text_faint; ctx.textAlign = "left"; ctx.font = "11px monospace";
        ctx.fillText(`N = ${n.toLocaleString()}${logy ? " · heights are log₁₀(ops)" : ""}`, 8, h - 14);
        qs("#o1", rc).textContent = d.toLocaleString();
        qs("#o2", rc).textContent = f.toLocaleString();
        qs("#o3", rc).textContent = `≈ ${fmt(n / k2, 1)}×`;
      }
      life.onResize(drawRace);
      drawRace();

      root.appendChild(el(`<div class="callout teal"><b>Same numbers, less work.</b> The FFT is not an approximation — <code>fft(x)</code> must match <code>dft(x)</code> to ~10 decimal places. Every butterfly exists in the direct sum too; the FFT just refuses to compute the same product twice. In practice, verify with the round-trip test: <code>idft(dft(x)) ≈ x</code>.</div>`));
      root.appendChild(predict({ id: "a9-fft-1",
        q: "Repeated even/odd splits of [0 1 2 3 4 5 6 7] end at eight size-1 leaves. In what order?",
        opts: ["0 1 2 3 4 5 6 7", "0 4 2 6 1 5 3 7", "0 2 4 6 1 3 5 7"],
        a: 1, why: "Each split groups by the <i>lowest</i> remaining bit, so leaves end up in <b>bit-reversed</b> position order. Option C is only the first split." }));
      root.appendChild(predict({ id: "a9-fft-2",
        q: "Doubling N makes the direct DFT ~4× slower. The FFT gets slower by…",
        opts: ["also ~4×", "a bit more than 2× — N doubles and one extra level is added", "8×"],
        a: 1, why: "Ratio = 2·(log₂N + 1)/log₂N. For N = 1024→2048 that's 2·11/10 = <b>2.2×</b>. The N² vs N·log N gap is why the FFT changed the world." }));
      root.appendChild(takeaways([
        "One split: X[k] = E[k] + W·O[k], and X[k + N/2] = E[k] − W·O[k] — the same two sub-results produce <b>two</b> outputs.",
        "Recursing to size-1 leaves gives the <b>bit-reversed</b> order 0 4 2 6 1 5 3 7.",
        "Work per level ∝ N; levels = log₂N → <b>O(N log N)</b>. At N = 10⁶ that's ~50,000× fewer ops than N².",
        "Radix-2 FFT needs N = a power of two (halving must reach 1); other lengths use mixed-radix or zero-padding.",
        "FFT output = DFT output exactly. It's an organisation trick, not a new transform.",
      ], "Split evens from odds, recurse, butterfly back up: N log N work for the same N² answer."));
    },
  });

  /* ============ Phase 9 boss ============ */

  /* =================== LESSONS =================== */
  const L = N.LESSONS;
  L["a9-dft"] = {
    sum: "Any signal is a <b>recipe of sine waves</b>. The DFT reads the recipe back — one bin per frequency — and it lies if you sampled too slowly.",
    steps: [
      { t: "Two questions for one signal", b: `<p>A wiggling signal can be asked two different questions:</p>`,
        v: table(["Question", "Where the answer lives"], [["How does the value move over time?", "the <b>time domain</b> — the wiggle you plot"], ["Which frequencies are inside, and how strong?", "the <b>frequency domain</b> — the spectrum"]]) + `<p class="dim" style="margin-top:8px">A messy-looking wiggle might be just two spikes in the spectrum. The DFT is a <b>decomposition</b>, not a transformation into something else.</p>` },
      { t: "How each bin listens", b: `<p>Output bin <code>X[k]</code> answers: <i>"how much of frequency k is in this signal?"</i> It multiplies every sample by a vector rotating at exactly k cycles per window and adds up the products.</p><p><b>Matching frequency</b>: every product points the same direction → they <b>add</b> → big number.<br><b>Mismatched</b>: products point all around the circle → they <b>cancel</b> → ≈ 0.</p>`,
        c: { q: "A signal contains only the frequency of bin 3. What does bin k = 5 return?", o: ["a large value", "≈ 0 — the products walk around the circle and cancel", "a negative number"], a: 1, why: "Cancellation is what makes the DFT selective. Each bin answers its own private question." } },
      { t: "Three hand DFTs worth memorising (N = 4)", b: `<p>For N = 4 the rotating vector only ever takes values 1, −j, −1, j, so these fit on paper:</p>`,
        v: table(["Signal x", "X[0]", "X[1]", "X[2]", "X[3]"], [["constant [1, 1, 1, 1]", "4", "0", "0", "0"], ["impulse [1, 0, 0, 0]", "1", "1", "1", "1"], ["alternating [1, −1, 1, −1]", "0", "0", "4", "0"]]) + `<p class="dim" style="margin-top:8px">Constant = all energy at k = 0 (DC). Impulse = every frequency at once. Alternating = the Nyquist bin k = N/2.</p>`,
        c: { q: "[0, 1, 0, −1] is one cycle of a sine at bin 1. Which bins light up?", o: ["only k = 1", "k = 1 and k = 3 — real signals give symmetric spectra", "all four equally"], a: 1, why: "Bin 3 is 'negative frequency' −1 in disguise. Real signals always produce these conjugate pairs — half the spectrum is redundant." } },
      { t: "Aliasing: sampling too slowly", b: `<p>Sample a 7 Hz sine at 8 Hz and the dots are <b>identical</b> to a 1 Hz sine. Any frequency above <code>fs/2</code> folds back and impersonates a lower one.</p><span class="key">Rule: fs &gt; 2·f<sub>max</sub>. A true 60 Hz tone sampled at 100 Hz appears at <b>40 Hz</b> — and afterwards nothing can tell you it was fake.</span>`,
        c: { q: "Sampled at 80 Hz, the spectrum shows a peak at 35 Hz. The signal…", o: ["definitely contains 35 Hz", "might really contain 45 Hz — it folds past the 40 Hz limit: 80 − 45 = 35", "contains only DC"], a: 1, why: "Folding is irreversible: real 35 Hz and aliased 45 Hz are indistinguishable once sampled." } },
      { t: "Leakage: the window edge", b: `<p>If your N samples hold a <b>whole number of cycles</b>, energy lands in one bin. If not, the window's edges look like a sudden jump, and the energy <b>smears into neighbouring bins</b>.</p><p>The fix is multiplying by a Hann/Hamming window to taper the edges — it <i>reduces</i> leakage but never removes it, and it costs resolution. A different cause than aliasing, with a different fix.</p>` },
      { t: "Reading the playground", b: `<p><b>Top canvas</b>: the faint line is the true continuous signal; the dots are the 100 samples the computer actually gets (fs = 100 Hz). <b>Bottom canvas</b>: the magnitude spectrum — bin k sits at k·fs/N = k Hz, and everything past 50 Hz is unreachable (the shaded zone folds left).</p>` },
    ],
    guide: [
      "Defaults: Wave 1 = 10 Hz, Wave 2 = 12 Hz amp 0.5. Match the two spectrum peaks to the sliders.",
      "Drag <b>Wave 1</b> past 50 Hz and watch its dot-pattern slow down while the true curve speeds up. Set it to exactly <b>60 Hz</b> — where does the peak land?",
      "Set a frequency to a non-integer like <b>10.5 Hz</b>: the single peak smears. That's leakage.",
      "Switch to <b>Impulse</b>, <b>Constant</b> and <b>Checkerboard</b> and match each spectrum to the N = 4 hand DFTs from the lesson.",
      "Answer both Predict questions.",
    ],
  };

  L["a9-fft"] = {
    sum: "The FFT computes the <b>exact same DFT</b> — it just splits evens from odds recursively and shares work, turning N² into N·log N.",
    steps: [
      { t: "Where the waste is", b: `<p>The direct DFT computes N outputs, each a sum of N products: <b>N² multiply-adds</b>.</p><p>But look closer: outputs reuse almost the same twiddle factors over and over. The same products get recomputed thousands of times. If work could be <b>shared</b>, huge savings appear.</p>` },
      { t: "The split that halves the work", b: `<p>Separate the sum into even-indexed and odd-indexed samples. Each half is itself a DFT of size N/2:</p>`,
        v: `<div class="mono" style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:12px 16px;font-size:13.5px">X[k] = E[k] + W·O[k]<br>X[k + N/2] = E[k] − W·O[k]</div><p class="dim" style="margin-top:8px">E and O are the half-size DFTs of the even and odd samples. The twiddle W rotates exactly half a turn between k and k + N/2, flipping its sign.</p>`,
        c: { q: "Outputs k and k + N/2 share which work?", o: ["none — they're independent", "both reuse the same E[k] and O[k]; only the sign of the twiddle term flips", "E[k] only"], a: 1, why: "One pair of half-DFT results produces TWO outputs. That pairing is the butterfly, and it's where the savings live." } },
      { t: "Recurse to the leaves", b: `<p>Apply the split again to each half, and again, until every problem has size 1 — and the DFT of one number is <b>the number itself</b>.</p><p>For N = 8 the leaves come out in a strange order:</p>`,
        v: genomes([0, 4, 2, 6, 1, 5, 3, 7]) + `<p class="dim" style="margin-top:8px">Leaf position → index = <b>reverse the bits</b>: position 001 lands index 100 = 4; position 011 lands 110 = 6. This is the famous bit-reversed order.</p>`,
        c: { q: "In the leaf order 0 4 2 6 1 5 3 7, which index sits at position 6?", o: ["6", "3", "5"], a: 1, why: "Position 6 = 110 in binary; reversed = 011 = 3." } },
      { t: "Butterflies climb back up", b: `<p>Each level merges pairs of results with one butterfly per pair: <code>a + W·b</code> and <code>a − W·b</code> — one multiply, one add, one subtract.</p><p>Per level: work ∝ N. Number of levels: log₂N. Total: <b>O(N log N)</b>.</p><span class="analogy">Mergesort does exactly the same accounting trick — halve the problem, do linear work to recombine.</span>`,
        c: { q: "N = 1024 → how many levels, and roughly how much work?", o: ["1024 levels, ~1M ops", "10 levels, ~10k ops", "2 levels, ~2k ops"], a: 1, why: "log₂1024 = 10 levels × N work each ≈ N·log₂N = 10,240 ops vs N² = 1,048,576 — about 100× less." } },
      { t: "Why powers of two?", b: `<p>The halving must terminate at length 1, so radix-2 FFT needs <b>N = 2^k</b>. Odd sizes break the even/odd chain.</p><p>Real libraries handle other lengths with mixed-radix steps or by zero-padding up to the next power of two. Same result either way — the FFT always equals the DFT.</p>` },
      { t: "The payoff, in numbers", b: `<p>At N = 10⁶: direct DFT ≈ 10¹² ops, FFT ≈ 2 × 10⁷ ops — <b>~50,000× less work</b>. That's the difference between \"impossible in real time\" and \"runs on a phone\", and it's why the FFT genuinely changed the world (audio, Wi-Fi, JPEG, MRI…).</p>` },
      { t: "Reading the playground", b: `<p><b>Top</b>: step down the recursion tree — teal/amber = the even/odd split — to the bit-reversed leaves, then combine back up with butterflies. <b>Bottom</b>: the op-count race as N doubles; toggle log scale to see both bars at once.</p>` },
    ],
    guide: [
      "Press <b>Next step</b> (or Auto-play) and watch the tree split to the leaves, then merge back up.",
      "At the leaves, check the bit row: position bits reversed give the index 0 4 2 6 1 5 3 7.",
      "Watch the butterfly counter during the combine steps: 4 per level × 3 levels = 12, vs 64 for the direct DFT.",
      "In the race card, drag <b>log₂ N</b> to 13 (N = 8,192) and read the speedup. Toggle log scale off to see the FFT bar vanish.",
    ],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => { if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v; };
  const arrows = (freq, n = 8) => Array.from({ length: n }, (_, i) => { const a = -2 * Math.PI * freq * i / n; return a; });
  const wheel = (angles, c, lbl) => `<svg class="fig" viewBox="0 0 200 200" style="max-height:170px"><circle cx="100" cy="100" r="70" fill="none" stroke="var(--line)"/>${angles.map((a) => `<line x1="100" y1="100" x2="${100 + 62 * Math.cos(a)}" y2="${100 + 62 * Math.sin(a)}" stroke="${c}" stroke-width="2.5" class="draw" marker-end=""/>`).join("")}<text x="100" y="192" class="fig-sub">${lbl}</text></svg>`;
  addV("a9-dft", 1, `<div class="fig-compare"><div class="fc fi" style="--c:var(--teal)"><div class="fc-h">Matching frequency</div>${wheel(arrows(0), "var(--teal)", "all arrows line up → big sum")}</div><div class="fc-vs">vs</div><div class="fc fi" style="--c:var(--rose)"><div class="fc-h">Wrong frequency</div>${wheel(arrows(1), "var(--rose)", "arrows point everywhere → cancel to ~0")}</div></div>`);
  addV("a9-dft", 3, (() => {
    const W = 520, H = 170, X = (t) => 20 + t * (W - 40), Y = (v) => H / 2 - v * 58;
    const curve = (f, c, dash) => `<path d="${Array.from({ length: 401 }, (_, i) => { const t = i / 400; return `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(Math.sin(2 * Math.PI * f * t)).toFixed(1)}`; }).join(" ")}" fill="none" stroke="${c}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""} class="draw"/>`;
    const dots = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return `<circle cx="${X(t)}" cy="${Y(Math.sin(2 * Math.PI * 7 * t))}" r="5" fill="var(--amber)" class="fi"/>`; }).join("");
    return `<svg class="fig" viewBox="0 0 ${W} ${H}">${curve(7, "rgba(28,176,246,.5)")}${curve(1, "var(--rose)", "6 4")}${dots}</svg><div class="legend"><span style="--c:rgba(28,176,246,.8)">true 7 Hz signal</span><span style="--c:var(--amber)">8 samples per second</span><span style="--c:var(--rose)">the 1 Hz wave those dots also fit</span></div>`;
  })());
  addV("a9-dft", 4, FG.compare({ title: "Whole number of cycles", c: "teal", body: FG.bars([["bin 4", 100, "teal"], ["bin 5", 0.5, "dim"], ["bin 6", 0.5, "dim"]], { max: 100, fmt: () => "" }) + "all energy in one bin" }, { title: "Cycles cut off mid-way", c: "rose", body: FG.bars([["bin 4", 62, "rose"], ["bin 5", 24, "rose"], ["bin 6", 9, "rose"]], { max: 100, fmt: () => "" }) + "energy smears into neighbours" }) + `<div class="fig-cap">Illustrative bar heights; try it for real in the playground by choosing a frequency that isn't a whole number.</div>`);
  addV("a9-fft", 0, `<table class="t" style="max-width:520px"><tr><th>N</th><th class="num">direct DFT (N²)</th><th class="num">FFT (N log₂N)</th><th class="num">saving</th></tr><tr><td>8</td><td class="num">64</td><td class="num">24</td><td class="num">2.7×</td></tr><tr><td>1,024</td><td class="num">1,048,576</td><td class="num">10,240</td><td class="num">102×</td></tr><tr class="hl"><td>1,000,000</td><td class="num">10¹²</td><td class="num">≈ 2 × 10⁷</td><td class="num">≈ 50,000×</td></tr></table>`);
  addV("a9-fft", 3, `<svg class="fig" viewBox="0 0 360 170" style="max-height:170px"><g class="fi"><circle cx="50" cy="45" r="16" fill="var(--panel-2)" stroke="var(--teal)" stroke-width="2"/><text x="50" y="50" class="fig-n">a</text></g><g class="fi"><circle cx="50" cy="125" r="16" fill="var(--panel-2)" stroke="var(--amber)" stroke-width="2"/><text x="50" y="130" class="fig-n">b</text></g><path d="M66 45 L290 45 M66 125 L290 125 M66 45 L290 125 M66 125 L290 45" stroke="var(--line-2)" stroke-width="2" fill="none" class="draw"/><rect x="150" y="113" width="42" height="24" rx="6" fill="var(--violet-dim)" stroke="var(--violet)"/><text x="171" y="130" class="fig-sub" style="fill:var(--violet)">×W</text><g class="fi"><text x="300" y="50" class="fig-box" style="text-anchor:start">a + W·b</text><text x="300" y="130" class="fig-box" style="text-anchor:start">a − W·b</text></g></svg><div class="fig-cap">One multiply by W, shared by both outputs: that's the butterfly.</div>`);
  addV("a9-fft", 4, FG.cells([{ v: 8, c: "teal" }, "→", { v: 4, c: "teal" }, "→", { v: 2, c: "teal" }, "→", { v: 1, c: "teal" }]) + FG.cells([{ v: 6, c: "rose" }, "→", { v: 3, c: "rose" }, "→", { v: "1.5 ✗", c: "rose" }]) + `<div class="fig-cap">Powers of two halve cleanly down to 1; other sizes get zero-padded or use mixed-radix steps.</div>`);
  addV("a9-fft", 5, FG.bars([["direct DFT, N = 10⁶", 12, "rose", "10¹² ops"], ["FFT, N = 10⁶", 7.3, "teal", "2 × 10⁷ ops"]], { max: 12, fmt: () => "" }) + `<div class="fig-cap">Bar length is log-scaled: the real gap is about 50,000×.</div>`);
})();
