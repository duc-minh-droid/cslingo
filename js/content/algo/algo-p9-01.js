/* ECM3428 Phase 9 (lecture 9) — Fourier intuition, the DFT, and the FFT's halving trick. */
(function () {
  const partScope = (NIC.shared.algoP9 = NIC.shared.algoP9 || {});

  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });

  /* ---------- tiny HTML builders for lesson visuals ---------- */
  const table = (head, rows) =>
    `<table class="t" style="max-width:680px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl || (r[0] && r[0].hl) ? "hl" : r.bad || (r[0] && r[0].bad) ? "bad" : ""}">${[]
            .concat(r.c || (r[0] && r[0].c) || r)
            .flat(2)
            .map((c) => `<td>${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</table>`;
  const genomes = (xs, cls) =>
    `<span class="genome">${xs.map((c, i) => `<span class="gene ${typeof cls === "function" ? cls(i) : cls || ""}" style="min-width:26px;height:28px;font-size:13px">${c}</span>`).join("")}</span>`;

  /** Naive DFT magnitudes for a real signal — deliberately O(N²): this module's whole point. */
  function dftMag(x) {
    const n = x.length,
      out = new Array(n);
    for (let k = 0; k < n; k++) {
      let re = 0,
        im = 0;
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
    id: "a9-dft",
    order: 1,
    num: "9.1",
    title: "Which waves are inside?",
    blurb:
      "Mix sine waves, then let a small DFT read the recipe back — including the 60 Hz tone that lies about its frequency.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const FS = 100,
        NS = 100; // 100 samples at 100 Hz → 1-second window → 1-Hz bins
      const comps = [
        { f: 5, A: 1.0, c: "var(--teal)", name: "Wave 1" },
        { f: 12, A: 0.5, c: "var(--violet)", name: "Wave 2" },
        { f: 0, A: 0, c: "var(--amber)", name: "Wave 3" },
      ];
      let mode = "mix";

      const card =
        el(`<div class="card"><div class="card-head"><h2>Sine-wave mixer → spectrum</h2><span class="faint">fs = 100 Hz · N = 100 samples · bins are exactly 1 Hz wide</span></div>
        <div class="controls" id="segRow"></div>
        <div id="mixers" class="controls" style="gap:18px"></div>
        <canvas class="viz" id="wave"></canvas>
        <div class="legend"><span style="--c:var(--teal)">sampled dots — what the computer actually sees</span><span style="--c:var(--text-faint)">true continuous signal</span></div>
        <canvas class="viz" id="spec" style="margin-top:14px"></canvas>
        <div class="legend"><span style="--c:var(--teal)">measured |X[k]|</span><span style="--c:var(--rose)">shaded zone = above fs/2, folds back</span><span style="--c:var(--amber)">▼ true component position</span></div>
        <div class="stat-row"><div class="stat teal"><small>Strongest measured</small><b id="pk"></b></div><div class="stat"><small>Nyquist limit fs/2</small><b>50 Hz</b></div><div class="stat amber"><small>Bin spacing fs/N</small><b>1 Hz</b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);

      qs("#segRow", card).append(
        N.seg(
          [
            ["mix", "Mix of sines"],
            ["impulse", "Impulse"],
            ["constant", "Constant"],
            ["checker", "Checkerboard"],
          ],
          mode,
          (v) => {
            mode = v;
            qs("#mixers", card).style.display = v === "mix" ? "" : "none";
            draw();
          },
        ),
      );

      comps.forEach((c, i) => {
        const wrap = el(`<div style="border-left:3px solid ${c.c};padding-left:10px"></div>`);
        const sf = N.slider(`${c.name} freq (Hz)`, 0, 80, 0.5, c.f, (v) => fmt(v, 1));
        sf.onInput((v) => {
          c.f = v;
          draw();
        });
        const sa = N.slider(`amp`, 0, 1, 0.05, c.A, (v) => fmt(v, 2));
        sa.onInput((v) => {
          c.A = v;
          draw();
        });
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
      const folded = (f) => {
        let m = f % FS;
        if (m > FS / 2) m = FS - m;
        return m;
      };

      function draw() {
        const C = N.colors();
        const xs = Array.from({ length: NS }, (_, n) => signal(n));
        // ---- waveform ----
        {
          const { ctx, w, h } = N.setupCanvas(qs("#wave", card), 190);
          const padL = 34,
            padR = 8;
          const ymax = mode === "mix" ? Math.max(1.2, comps.reduce((s, c) => s + c.A, 0) * 1.1) : 1.4;
          const X = (n) => padL + (n / (NS - 1)) * (w - padL - padR);
          const Y = (v) => h / 2 - (v / ymax) * (h / 2 - 14);
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = C.line;
          ctx.beginPath();
          ctx.moveTo(padL, h / 2);
          ctx.lineTo(w - padR, h / 2);
          ctx.stroke();
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "right";
          ctx.fillText(fmt(ymax, 1), padL - 5, Y(ymax) + 8);
          ctx.fillText("0", padL - 5, h / 2 + 4);
          ctx.fillText(fmt(-ymax, 1), padL - 5, Y(-ymax) + 4);
          if (mode === "mix") {
            ctx.strokeStyle = C.text_faint;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let p = 0; p <= 600; p++) {
              const t = p / 600; // one second
              const x = padL + t * (w - padL - padR),
                y = Y(truth(t));
              p === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          ctx.lineWidth = 1;
          xs.forEach((v, n) => {
            ctx.strokeStyle = "rgba(88,204,2,0.35)";
            ctx.beginPath();
            ctx.moveTo(X(n), h / 2);
            ctx.lineTo(X(n), Y(v));
            ctx.stroke();
          });
          xs.forEach((v, n) => {
            ctx.fillStyle = C.teal;
            ctx.beginPath();
            ctx.arc(X(n), Y(v), 2.6, 0, 7);
            ctx.fill();
          });
          ctx.fillStyle = C.text_faint;
          ctx.textAlign = "left";
          ctx.fillText("sample n (0–99 = one second)", padL, h - 6);
        }
        // ---- spectrum ----
        const mag = dftMag(xs); // 10k multiply-adds — exactly the O(N²) the FFT avoids
        const half = Math.floor(NS / 2); // bins 0..50 shown
        const FMAX = 80;
        const { ctx, w, h } = N.setupCanvas(qs("#spec", card), 210);
        const padL = 34,
          padR = 8,
          padT = 14,
          padB = 30;
        const F = (f) => padL + (f / FMAX) * (w - padL - padR);
        const hi = Math.max(1e-9, ...mag.slice(0, half + 1));
        ctx.clearRect(0, 0, w, h);
        // forbidden zone 50–80 Hz
        ctx.fillStyle = "rgba(255,75,75,0.08)";
        ctx.fillRect(F(50), padT, F(80) - F(50), h - padT - padB);
        ctx.strokeStyle = "rgba(255,75,75,0.5)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(F(50), padT);
        ctx.lineTo(F(50), h - padB);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = C.rose;
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("above fs/2: can't be", (F(50) + F(80)) / 2, padT + 14);
        ctx.fillText("told from a folded low one", (F(50) + F(80)) / 2, padT + 27);
        // grid + bars
        ctx.strokeStyle = C.line;
        ctx.fillStyle = C.text_faint;
        for (let g = 0; g <= 4; g++) {
          const y = padT + (g / 4) * (h - padT - padB);
          ctx.beginPath();
          ctx.moveTo(padL, y);
          ctx.lineTo(F(50), y);
          ctx.stroke();
          ctx.textAlign = "right";
          ctx.fillText(fmt(hi * (1 - g / 4), 1), padL - 5, y + 4);
        }
        const bw = (F(50) - F(0)) / 51;
        for (let k = 0; k <= half; k++) {
          const bhh = (mag[k] / hi) * (h - padT - padB);
          ctx.fillStyle = C.teal;
          ctx.fillRect(F(k) - bw / 2 + 1, h - padB - bhh, Math.max(1, bw - 2), bhh);
        }
        ctx.fillStyle = C.text_faint;
        ctx.textAlign = "center";
        for (let f = 0; f <= 80; f += 10) ctx.fillText(f + " Hz", F(f), h - 14);
        // component markers: true position (orange ▼) and folded landing spot
        const note = qs("#note", card);
        const aliases = [];
        if (mode === "mix")
          comps.forEach((c) => {
            if (c.A <= 0) return;
            ctx.fillStyle = C.amber;
            ctx.strokeStyle = C.amber;
            ctx.beginPath();
            ctx.moveTo(F(c.f) - 5, h - padB - 2);
            ctx.lineTo(F(c.f) + 5, h - padB - 2);
            ctx.lineTo(F(c.f), h - padB + 6);
            ctx.closePath();
            ctx.fill();
            if (c.f > 50) {
              const fa = folded(c.f);
              ctx.setLineDash([3, 3]);
              ctx.beginPath();
              ctx.moveTo(F(c.f), h - padB + 8);
              ctx.lineTo(F(fa), h - padB + 8);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = C.rose;
              ctx.beginPath();
              ctx.moveTo(F(fa) - 5, h - padB - 2);
              ctx.lineTo(F(fa) + 5, h - padB - 2);
              ctx.lineTo(F(fa), h - padB + 6);
              ctx.closePath();
              ctx.fill();
              aliases.push(
                `<b>${fmt(c.f, 1)} Hz</b> is above the 50 Hz Nyquist limit — it folds to <b style="color:var(--rose)">${fmt(fa, 1)} Hz</b> (100 − ${fmt(c.f, 1)}). The spectrum cannot tell it apart from a real ${fmt(fa, 1)} Hz tone.`,
              );
            }
          });
        const top = mag
          .slice(0, half + 1)
          .map((v, k) => [v, k])
          .sort((a, b) => b[0] - a[0])
          .slice(0, 3);
        qs("#pk", card).textContent =
          mode === "impulse" ? "all bins ≈ equal" : `${top[0][1]} Hz  (|X| = ${fmt(top[0][0], 1)})`;
        const fixed = {
          impulse: `<div class="callout violet"><b>Impulse [1,0,0,…]:</b> one spike in time contains <b>every frequency equally</b> — the spectrum is flat (each |X[k]| = 1). Matches the N = 4 hand DFT [1,0,0,0] → [1,1,1,1].</div>`,
          constant: `<div class="callout violet"><b>Constant [1,1,1,…]:</b> no wiggle at all, so all energy sits in bin <b>k = 0</b> (DC), |X[0]| = N = 100.</div>`,
          checker: `<div class="callout violet"><b>Checkerboard [1,−1,1,−1,…]:</b> the fastest alternation N samples can hold — all energy lands in bin <b>k = 50</b>, the Nyquist bin. Same as N = 4: [1,−1,1,−1] → energy only at k = 2.</div>`,
          mix: "",
        };
        note.innerHTML =
          (aliases.length
            ? `<div class="callout rose"><b>Aliasing!</b> ${aliases.join("<br>")} Rule: fs &gt; 2·f<sub>max</sub>, or the spectrum lies.</div>`
            : "") + (fixed[mode] || "");
      }
      life.onResize(draw);
      draw();

      root.appendChild(
        predict({
          id: "a9-dft-1",
          q: "Set Wave 1 to 10 Hz amp 1, Wave 2 to 20 Hz amp 0.5, Wave 3 amp 0. What does the spectrum show?",
          opts: [
            "One peak at 15 Hz, where the two waves average out",
            "Two peaks: tall at 10 Hz, half-height at 20 Hz",
            "A small bump at every frequency up to 20 Hz",
          ],
          a: 1,
          why: "The spectrum is just the recipe: which frequencies, how strong. Amplitude maps to bar height.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-dft-2",
          q: "A true <b>60 Hz</b> hum sampled at fs = 100 Hz appears in the spectrum at…",
          opts: ["60 Hz", "40 Hz", "0 Hz (it disappears)"],
          a: 1,
          why: "60 Hz is above fs/2 = 50 Hz, so it folds back: 100 − 60 = <b>40 Hz</b>. Try it — set Wave 1 to 60 Hz. The dots pretend to be a 40 Hz wave and the damage is permanent.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            'Any signal is a <b>recipe of sine waves</b>; the DFT reads the recipe back — each bin X[k] asks "how much of frequency k?".',
            "Matching frequencies <b>add</b>, mismatched ones <b>cancel</b> — that's the whole trick.",
            "<b>Aliasing</b>: above fs/2, frequencies fold back and impersonate lower ones (60 Hz @ fs = 100 → 40 Hz). Irreversible.",
            "<b>Leakage</b>: a non-integer number of cycles in the window smears energy across neighbouring bins. Different cause, different fix (windowing).",
            "Real signals give symmetric spectra — only bins 0…N/2 carry independent information.",
            "Direct DFT costs N bins × N samples = <b>O(N²)</b>. That cost is what the next module attacks.",
          ],
          "The DFT decomposes a signal into its frequencies — and it only tells the truth if you sampled fast enough.",
        ),
      );
    },
  });
  Object.assign(partScope, { genomes, reg, table });
})();
