/* js/content/algo/algo-p9-x-05.js: Phase 9 extra lessons (overflow): 9.2 From the integral to N samples. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, mono, cap, fc, fftIP, dftC, TAU } = shared;
  reg({
    id: "a9-cft",
    order: 2,
    num: "9.2",
    title: "From the integral to N samples",
    blurb:
      "The continuous transform, why a computer needs a sum instead, and the DFT as spinning arrows added tip to tail.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let n = 4,
        x = [1, 2, 3, 4],
        k = 1;
      const PRE = {
        impulse: (m) => Array.from({ length: m }, (_, i) => (i === 0 ? 1 : 0)),
        constant: (m) => Array(m).fill(1),
        alt: (m) => Array.from({ length: m }, (_, i) => (i % 2 ? -1 : 1)),
        cos1: (m) => Array.from({ length: m }, (_, i) => Math.cos((TAU * i) / m)),
        ramp: (m) => Array.from({ length: m }, (_, i) => i + 1),
      };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Hand DFT: arrows added tip to tail</h2><span class="faint">bin k multiplies sample n by a spinning arrow W<sup>kn</sup></span></div>
        <div class="controls" id="nr"></div><div class="controls" id="pr"></div>
        <div class="controls" id="sm" style="gap:10px 16px"></div>
        <div class="controls" id="kr"></div>
        <canvas class="viz" id="ch"></canvas>
        <div class="legend"><span style="--c:var(--blue)">each small arrow = f[n] × W<sup>kn</sup></span><span style="--c:var(--amber)">orange arrow = their sum = F[k]</span></div>
        <div id="out"></div><div class="stat-row"><div class="stat teal"><small>Chosen bin k</small><b id="sk"></b></div><div class="stat amber"><small>|F[k]|</small><b id="sm1"></b></div><div class="stat violet"><small>Round trip: IDFT(DFT(f)) error</small><b id="se"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      qs("#nr", card).append(
        N.seg(
          [
            ["4", "N = 4"],
            ["8", "N = 8"],
          ],
          String(n),
          (v) => {
            n = +v;
            x = PRE.ramp(n);
            k = Math.min(k, n - 1);
            build();
          },
        ),
      );
      const pr = qs("#pr", card);
      [
        ["impulse", "Impulse"],
        ["constant", "Constant"],
        ["alt", "Alternating ±1"],
        ["cos1", "One cosine"],
        ["ramp", "Ramp 1…N"],
      ].forEach(([id, lb]) => {
        const b = el(`<button class="btn small">${lb}</button>`);
        b.onclick = () => {
          x = PRE[id](n);
          syncSliders();
          draw();
        };
        pr.append(b);
      });
      let sliders = [];
      const kr = qs("#kr", card);
      function build() {
        const sm = qs("#sm", card);
        sm.innerHTML = "";
        sliders = [];
        for (let i = 0; i < n; i++) {
          const s = N.slider(`f[${i}]`, -8, 8, 0.5, x[i], (v) => fmt(v, 1));
          s.onInput((v) => {
            x[i] = v;
            draw();
          });
          sliders.push(s);
          sm.append(s);
        }
        kr.innerHTML = "";
        kr.append(
          N.seg(
            Array.from({ length: n }, (_, i) => [String(i), "k = " + i]),
            String(k),
            (v) => {
              k = +v;
              draw();
            },
          ),
        );
        draw();
      }
      function syncSliders() {
        sliders.forEach((s, i) => {
          s.value = Math.max(-8, Math.min(8, x[i]));
        });
      }
      function draw() {
        const C = N.colors();
        const xr = Float64Array.from(x),
          xi = new Float64Array(n),
          [Fr, Fi] = dftC(xr, xi);
        const br = Float64Array.from(Fr),
          bi = Float64Array.from(Fi);
        fftIP(br, bi, true);
        let err = 0;
        for (let i = 0; i < n; i++) err = Math.max(err, Math.hypot(br[i] - x[i], bi[i]));
        // tip-to-tail chain for bin k
        const pts = [[0, 0]];
        for (let t = 0; t < n; t++) {
          const a = (-TAU * k * t) / n,
            p = pts[t];
          pts.push([p[0] + x[t] * Math.cos(a), p[1] + x[t] * Math.sin(a)]);
        }
        {
          const { ctx, w, h } = N.setupCanvas(qs("#ch", card), 250);
          ctx.clearRect(0, 0, w, h);
          const xs = pts.map((p) => p[0]),
            ys = pts.map((p) => p[1]);
          const minX = Math.min(...xs, 0),
            maxX = Math.max(...xs, 0),
            minY = Math.min(...ys, 0),
            maxY = Math.max(...ys, 0);
          const span = Math.max(maxX - minX, maxY - minY, 1),
            sc = (Math.min(w, h) - 70) / span;
          const ox = w / 2 - ((minX + maxX) / 2) * sc,
            oy = h / 2 + ((minY + maxY) / 2) * sc;
          const X = (v) => ox + v * sc,
            Y = (v) => oy - v * sc;
          ctx.strokeStyle = C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, Y(0));
          ctx.lineTo(w, Y(0));
          ctx.moveTo(X(0), 0);
          ctx.lineTo(X(0), h);
          ctx.stroke();
          const arrow = (x1, y1, x2, y2, col, wd) => {
            ctx.strokeStyle = col;
            ctx.fillStyle = col;
            ctx.lineWidth = wd;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            const a = Math.atan2(y2 - y1, x2 - x1),
              L = 8 + wd;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - L * Math.cos(a - 0.4), y2 - L * Math.sin(a - 0.4));
            ctx.lineTo(x2 - L * Math.cos(a + 0.4), y2 - L * Math.sin(a + 0.4));
            ctx.closePath();
            ctx.fill();
          };
          for (let t = 0; t < n; t++) {
            const a = pts[t],
              b = pts[t + 1];
            if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-9) {
              ctx.fillStyle = C.blue;
              ctx.beginPath();
              ctx.arc(X(a[0]), Y(a[1]), 3, 0, 7);
              ctx.fill();
              continue;
            }
            arrow(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), C.blue, 2.4);
            ctx.fillStyle = C.text_faint;
            ctx.font = "11px monospace";
            ctx.textAlign = "center";
            ctx.fillText("n=" + t, (X(a[0]) + X(b[0])) / 2 + 9, (Y(a[1]) + Y(b[1])) / 2 - 7);
          }
          const e = pts[n];
          if (Math.hypot(e[0], e[1]) > 1e-9) arrow(X(0), Y(0), X(e[0]), Y(e[1]), C.amber, 3.6);
          else {
            ctx.fillStyle = C.amber;
            ctx.beginPath();
            ctx.arc(X(0), Y(0), 6, 0, 7);
            ctx.fill();
          }
          ctx.fillStyle = C.text_faint;
          ctx.textAlign = "left";
          ctx.fillText("real →", w - 44, Y(0) - 5);
          ctx.fillText("imaginary ↑", X(0) + 5, 12);
        }
        const rows = Array.from(
          { length: n },
          (_, j) =>
            `<tr class="${j === k ? "hl" : ""}"><td>${j}</td><td>${fc(Fr[j], Fi[j])}</td><td>${fmt(+Math.hypot(Fr[j], Fi[j]).toFixed(2), 2)}</td></tr>`,
        ).join("");
        qs("#out", card).innerHTML =
          `<table class="t" style="max-width:420px"><tr><th>k</th><th>F[k]</th><th>|F[k]|</th></tr>${rows}</table>`;
        qs("#sk", card).textContent = k;
        qs("#sm1", card).textContent = fmt(+Math.hypot(Fr[k], Fi[k]).toFixed(2), 2);
        qs("#se", card).textContent = err < 1e-9 ? "0 (exact)" : err.toExponential(1);
        const mags = Array.from({ length: n }, (_, j) => Math.hypot(Fr[j], Fi[j]));
        const nz = mags
          .map((m, j) => [m, j])
          .filter(([m]) => m > 1e-9)
          .map(([, j]) => j);
        qs("#note", card).innerHTML =
          nz.length === 1
            ? `<div class="callout violet">All the energy sits in <b>one bin (k = ${nz[0]})</b>. For every other k the little arrows spin around and cancel to a dot at the origin.</div>`
            : nz.length === n
              ? `<div class="callout">Every bin is non-zero. Pick other k values and watch the arrows: the chain curls differently for each frequency.</div>`
              : "";
      }
      build();
      root.appendChild(
        predict({
          id: "a9-cft-1",
          q: "N = 4, so W = e<sup>−j2π/4</sup>. Pick the preset <b>Alternating ±1</b> and look at bin k = 2. What happens to the arrows?",
          opts: [
            "They all point the same way, adding to a long arrow",
            "They cancel in pairs, so F[2] is exactly 0",
            "They curl round into a closed loop of unit arrows",
          ],
          a: 0,
          why: "At k = 2 each spinning arrow flips direction every sample, and the signal flips sign every sample, so every product points the <b>same way</b>. F[2] = 4: all the energy sits in the fastest bin. Matching signal and arrow means they add.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-cft-2",
          q: "Pick <b>Constant</b>. Which bin has all the energy, and how big is it?",
          opts: [
            "k = 0, with |F| = 4 (all four samples add)",
            "k = 2, with |F| = 2 (half the samples add)",
            "Every bin equally, each with |F| = 1 (shared out)",
          ],
          a: 0,
          why: "Bin 0 spins at zero frequency, so every arrow is just 1 and the products simply add: 1 + 1 + 1 + 1 = 4. The other bins cancel to zero.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "The continuous transform is an <b>integral</b> $F(\\omega)=\\int f(t)e^{-j\\omega t}dt$; the inverse has $\\tfrac{1}{2\\pi}$ and a plus sign in the exponent.",
            "A computer only has <b>N samples</b> spaced T apart, so the integral becomes a <b>sum</b>: $F[k]=\\sum_{n=0}^{N-1} f[n]\\,e^{-j2\\pi kn/N}$.",
            "We only test the <b>fundamental and its harmonics</b>: $\\omega_k = 2\\pi k/(NT)$ for k = 0 … N−1, so the bins are fs/N apart.",
            "The inverse DFT is <b>1/N times the complex conjugate</b> of the forward one (the exponent's sign flips).",
            "As a matrix: $F = W f$ with entries $W^{kn}$ and $W=e^{-j2\\pi/N}$. N outputs × N products = <b>N²</b> work.",
          ],
          "Bin k spins every sample at its own speed and adds up: matches add, mismatches cancel.",
        ),
      );
    },
  });
  L["a9-cft"] = {
    sum: 'The Fourier transform asks "how much of frequency ω?" with an integral. A computer swaps the integral for a <b>sum over N samples</b>: the DFT, which is just N spinning arrows added.',
    steps: [
      {
        t: "The continuous Fourier transform",
        b: `<p>For a signal $f(t)$, the Fourier transform gives a new function $F(\\omega)$ of frequency, and the inverse transform gets the signal back:</p>$$F(\\omega)=\\int_{-\\infty}^{\\infty} f(t)\\,e^{-j\\omega t}\\,dt \\qquad f(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} F(\\omega)\\,e^{j\\omega t}\\,d\\omega$$<p>Read the left one as a recipe: for each frequency $\\omega$, multiply the signal by a spinning arrow and add up everything (that is what the integral does).</p>`,
        v: F.flow([
          { t: "f(t)", s: "the signal", c: "blue" },
          { t: "× e^(−jωt)", s: "spin at ω", c: "violet" },
          { t: "∫ add up", s: "over all t", c: "amber" },
          { t: "F(ω)", s: "how much ω", c: "teal" },
        ]),
        c: {
          q: "What does F(ω) measure?",
          o: [
            "How much of frequency ω the signal contains",
            "The value of the signal at the instant t = ω",
            "The total length of time that the signal lasts",
          ],
          a: 0,
          why: "F is a function of frequency: it is large where the signal contains a lot of that frequency.",
        },
      },
      {
        t: "The spinning arrow",
        b: `<p>The term $e^{-j\\theta}$ is just an arrow of length 1 at angle $-\\theta$ (Euler's formula): $e^{-j\\theta}=\\cos\\theta - j\\sin\\theta$.</p><p>With $\\theta=\\omega t$, the arrow spins as time goes on, faster for a bigger $\\omega$. Multiply the signal by this arrow: if the signal wiggles at the <b>same</b> frequency, its peaks line up with the arrow and everything adds. At a different frequency the arrows point everywhere and cancel.</p>`,
        v: `<svg class="fig" viewBox="0 0 300 180" style="max-height:180px"><circle cx="90" cy="90" r="64" fill="none" stroke="var(--line)"/><line x1="14" y1="90" x2="170" y2="90" stroke="var(--line-2)"/><line x1="90" y1="20" x2="90" y2="160" stroke="var(--line-2)"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="90" y1="90" x2="${90 + 56 * Math.cos((-TAU * i) / 8)}" y2="${90 + 56 * Math.sin((-TAU * i) / 8)}" stroke="var(--blue)" stroke-width="2" opacity="${0.35 + i * 0.09}" class="draw"/>`).join("")}<text x="200" y="70" class="fig-sub" style="text-anchor:start">e^(−jθ) = cos θ − j sin θ</text><text x="200" y="92" class="fig-sub" style="text-anchor:start">length 1, angle −θ</text><text x="200" y="114" class="fig-sub" style="text-anchor:start">e^(−jπ) = −1</text></svg>`,
        c: {
          q: "What is $e^{-j\\pi}$? (It is an arrow of length 1 turned by half a circle.)",
          o: ["−1", "1", "j"],
          a: 0,
          hint: "cos π = −1 and sin π = 0.",
          why: "$\\cos\\pi - j\\sin\\pi = -1 - 0 = -1$. Half a turn flips the arrow to point the other way.",
        },
      },
      {
        t: "Computers only have samples",
        b: `<p>Real recordings are <b>digital</b>: we do not have $f(t)$ for every instant, only $N$ samples <code>f[0], f[1], …, f[N−1]</code>, each separated by a sample time $T$ (so the sample rate is $f_s = 1/T$).</p><p>An integral over continuous time cannot be computed from that. We swap it for a <b>sum over the samples</b>.</p>`,
        v:
          (() => {
            const W = 460,
              H = 150,
              X = (i) => 30 + i * 52,
              Y = (v) => 75 - v * 48,
              f = (t) => Math.sin(t * 0.7) + 0.4 * Math.sin(t * 1.9);
            return `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:150px"><path d="${Array.from(
              { length: 221 },
              (_, i) => {
                const t = i / 20;
                return `${i ? "L" : "M"}${(30 + t * 52).toFixed(1)} ${Y(f(t)).toFixed(1)}`;
              },
            ).join(
              " ",
            )}" fill="none" stroke="var(--line-2)" stroke-width="2" class="draw"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${X(i)}" y1="75" x2="${X(i)}" y2="${Y(f(i))}" stroke="var(--teal)" opacity=".4"/><circle cx="${X(i)}" cy="${Y(f(i))}" r="4.5" fill="var(--teal)" class="fi"/>`).join("")}<path d="M${X(2)} 138 H${X(3)}" stroke="var(--amber)" stroke-width="3"/><text x="${(X(2) + X(3)) / 2}" y="132" class="fig-sub" style="fill:var(--amber)">T</text><text x="${X(0)}" y="20" class="fig-sub">f[0]</text><text x="${X(8)}" y="20" class="fig-sub">f[8]</text></svg>`;
          })() + cap("N samples, each one T seconds after the last."),
        c: {
          q: "A signal is sampled every T = 0.01 seconds. What is the sample rate?",
          o: ["10 Hz", "100 Hz", "0.01 Hz"],
          a: 1,
          hint: "Sample rate = 1 / T.",
          why: "$f_s = 1/T = 1/0.01 = 100$ samples per second.",
        },
      },
      {
        t: "The DFT formula",
        b: `<p>Replace the integral with a sum over the samples, and only ask about the frequencies that fit the window: the <b>fundamental</b> and its <b>harmonics</b>, $\\omega_k = \\frac{2\\pi}{NT}k$ for $k = 0,1,\\dots,N-1$:</p>$$F[k]=\\sum_{n=0}^{N-1} f[n]\\,e^{-j2\\pi kn/N}$$<p>So there are <b>N outputs for N inputs</b>. Bin $k$ sits at $k\\,f_s/N$ Hz.</p>`,
        v: table(
          ["k", "angle step per sample", "frequency (N = 8, fs = 8000 Hz)"],
          [
            ["0", "0 (not spinning)", "0 Hz (DC)"],
            ["1", "1/8 of a turn", "1000 Hz"],
            ["2", "2/8 of a turn", "2000 Hz"],
            { c: ["3", "3/8 of a turn", "3000 Hz"], hl: true },
            ["4", "4/8 of a turn", "4000 Hz (Nyquist)"],
            ["…", "…", "…"],
          ],
        ),
        c: {
          q: "N = 8 samples at fs = 8000 Hz. Which frequency is bin k = 3?",
          o: ["3 Hz", "3000 Hz", "375 Hz"],
          a: 1,
          why: "Bin spacing is fs/N = 8000/8 = 1000 Hz, so bin 3 is at 3 × 1000 = 3000 Hz.",
        },
      },
      {
        t: "Undoing it: the inverse DFT",
        b: `<p>The transform loses nothing. Going back needs the same ingredients with the arrows turned the other way, and a $1/N$ to keep the size right:</p>$$f[n]=\\frac{1}{N}\\sum_{k=0}^{N-1} F[k]\\,e^{+j2\\pi kn/N}$$<p>In other words, the inverse DFT is <b>$1/N$ times the complex conjugate</b> of the forward DFT. It is what lets you edit a spectrum and turn it back into a signal.</p>`,
        v: F.compare(
          {
            title: "Forward DFT",
            c: "blue",
            body: mono("F[k] = Σ f[n] · e<sup>−j2πkn/N</sup>") + "samples → frequencies",
          },
          {
            title: "Inverse DFT",
            c: "teal",
            body: mono("f[n] = (1/N) Σ F[k] · e<sup>+j2πkn/N</sup>") + "frequencies → samples",
          },
        ),
        c: {
          q: "How does the inverse DFT differ from the forward one?",
          o: [
            "The exponent's sign flips and a 1/N factor appears",
            "Nothing: applying the forward DFT twice undoes it",
            "It only keeps the real part of each term",
          ],
          a: 0,
          why: "Conjugate arrows (the plus sign) and a 1/N. Forward twice gives N times the reversed signal, not the original.",
        },
      },
      {
        t: "The DFT as a matrix",
        b: `<p>Write $W=e^{-j2\\pi/N}$. Then every output is $F[k]=\\sum_n W^{kn} f[n]$, which is a <b>matrix times a vector</b>: $F = \\mathbf{W} f$, where row $k$, column $n$ holds $W^{kn}$.</p><p>For $N=4$ the number $W=-j$ and its powers only ever take the values 1, −j, −1, j, so the whole matrix fits on paper:</p>`,
        v:
          table(
            ["k \\ n", "n = 0", "n = 1", "n = 2", "n = 3"],
            [
              ["0", "1", "1", "1", "1"],
              ["1", "1", "−j", "−1", "j"],
              ["2", "1", "−1", "1", "−1"],
              ["3", "1", "j", "−1", "−j"],
            ],
          ) + cap("f = [1, 2, 3, 4] gives F = [10, −2 + 2j, −2, −2 − 2j]. Row 0 just adds up the samples."),
        c: {
          q: "Row k = 2 of the N = 4 matrix is [1, −1, 1, −1]. What does that output compute?",
          o: [
            "Even-numbered samples added, odd-numbered ones subtracted",
            "The plain sum of all four samples, as in the row for k = 0",
            "The difference between the first sample and the last sample",
          ],
          a: 0,
          why: "F[2] = f[0] − f[1] + f[2] − f[3]. It is large only when the signal flips sign every sample.",
        },
      },
      {
        t: "The bill: N × N",
        b: `<p>The matrix has $N \\times N$ entries and each is used once: <b>N² complex multiplications</b>. That is $O(N^2)$.</p><p>It is fine for 8 samples. For a second of CD audio it is a disaster, as the table shows. The fix is the <b>Fast Fourier Transform</b>, in the modules after this one.</p>`,
        v: table(
          ["N samples", "N² products", "time at 1 billion per second"],
          [
            ["8", "64", "instant"],
            ["1,024", "1,048,576", "0.001 s"],
            ["44,100 (1 s of CD audio)", "≈ 1.9 billion", "≈ 2 s"],
            { c: ["1,048,576", "≈ 1.1 × 10¹²", "≈ 18 minutes"], hl: true },
          ],
        ),
        c: {
          q: "You double the number of samples N. By what factor does the direct DFT's work grow?",
          o: ["2×", "4×", "8×"],
          a: 1,
          why: "The work is N², and $(2N)^2 = 4N^2$.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Choose $N$, set the samples (or press a preset) and pick a bin $k$. The picture draws each term $f[n]\\,W^{kn}$ as a blue arrow, <b>tip to tail</b>. The orange arrow from the origin to the end of the chain is $F[k]$.</p><p>The table lists every output, and the stat shows that applying the inverse DFT gives your samples back.</p>`,
        v: F.cells([
          { v: "f[n]", sub: "samples", c: "blue" },
          "→",
          { v: "× W^kn", sub: "spin", c: "violet" },
          "→",
          { v: "chain", sub: "tip to tail", c: "amber" },
          "→",
          { v: "F[k]", sub: "the sum", c: "teal" },
        ]),
      },
    ],
    guide: [
      "Press <b>Constant</b>, then step k from 0 to 3. At which k do the arrows line up into a long chain? Where do they curl up and cancel?",
      "Press <b>Alternating ±1</b>. Which bin lights up now? Match it to the hand DFT in the lesson.",
      "Press <b>Ramp 1…N</b> with N = 4 and compare the table with F = [10, −2 + 2j, −2, −2 − 2j].",
      "Switch to N = 8 and try <b>One cosine</b>: how many bins are non-zero, and why that many?",
      "Answer the questions after the demo.",
    ],
  };
})();
