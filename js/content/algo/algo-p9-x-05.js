/* js/content/algo/algo-p9-x-05.js: Phase 9 extra lessons (overflow): 9.2 From the integral to N samples. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap, fc, fftIP, dftC, TAU, svgFig, tint } = shared;
  const pth = (P) => P.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  /** The signal wound round a circle at two speeds, with the average point of each. */
  const windFig = () => {
    const panel = (cx, w, c, t, note) => {
      const P = Array.from({ length: 301 }, (_, i) => {
        const u = i / 300,
          f = Math.sin(TAU * 3 * u),
          a = TAU * w * u;
        return [cx + 56 * f * Math.cos(a), 92 + 56 * f * Math.sin(a)];
      });
      const m = [0, 1].map((d) => P.reduce((s, p) => s + p[d] / 301, 0));
      return `<line x1="${cx - 70}" y1="92" x2="${cx + 70}" y2="92" stroke="var(--line)"/><line x1="${cx}" y1="22" x2="${cx}" y2="162" stroke="var(--line)"/><path d="${pth(P)}" fill="none" stroke="var(--${c})" stroke-width="2.5" class="draw"/><circle cx="${m[0].toFixed(1)}" cy="${m[1].toFixed(1)}" r="6" fill="var(--amber)" stroke="var(--panel-2)" stroke-width="2"/><text x="${cx}" y="184" class="fig-box">${t}</text><text x="${cx}" y="200" class="fig-sub">${note}</text>`;
    };
    return (
      svgFig(
        560,
        206,
        "A 3 Hz signal wound round a circle 3 times a second gives a lopsided loop whose average point is off-centre; wound 2 times a second it is balanced around the centre",
        panel(140, 3, "teal", "Wound 3 times a second", "lopsided: the average point is off-centre") +
          panel(420, 2, "rose", "Wound 2 times a second", "balanced: the average point is at the centre"),
      ) + cap("The signal wiggles 3 times a second. Orange dot: the average of all the points.")
    );
  };
  /** Where the arrow points when it meets each of 8 samples, for three bins. */
  const spinFig = () => {
    const one = ([k, cx, sub]) => {
      const P = Array.from({ length: 8 }, (_, n) => [(Math.PI * 2 * ((k * n) % 8)) / 8, n]).map(([a, n]) => [
        cx + 56 * Math.cos(a),
        80 + 56 * Math.sin(a),
        a,
        n,
      ]);
      const dot = ([x, y, a, n]) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${tint(k ? "blue" : "teal", 55)}" stroke="var(--${k ? "blue" : "teal"})" stroke-width="2" class="fi"/>${k ? `<text x="${(cx + 72 * Math.cos(a)).toFixed(1)}" y="${(84 + 72 * Math.sin(a)).toFixed(1)}" class="fig-sub">${n}</text>` : ""}`;
      return `<circle cx="${cx}" cy="80" r="56" fill="none" stroke="var(--line)" stroke-width="2"/>${k ? `<path d="${pth(P)}" fill="none" stroke="var(--line-2)" stroke-dasharray="4 4"/>` : `<text x="${cx}" y="58" class="fig-sub">all 8 samples</text>`}${P.map(dot).join("")}<text x="${cx}" y="176" class="fig-box">bin ${k}</text><text x="${cx}" y="192" class="fig-sub">${sub}</text>`;
    };
    return (
      svgFig(
        560,
        200,
        "Three circles showing where the arrow points at samples 0 to 7: bin 0 never moves, bin 1 goes round once, bin 3 goes round three times",
        [
          [0, 100, "does not turn"],
          [1, 280, "1/8 turn per sample"],
          [3, 460, "3/8 turn per sample"],
        ]
          .map(one)
          .join(""),
      ) + cap("The dots are where the arrow points when it meets sample 0, 1, 2 ... 7.")
    );
  };
  /** The 4-point DFT table drawn as arrows (right = 1, down = −j, left = −1, up = j). */
  const matFig = () => {
    const cell = (k, n) =>
      `<g transform="translate(${96 + n * 60} ${52 + k * 44}) rotate(${((k * n) % 4) * 90})"><path d="M-15 0H13M6 -7L14 0L6 7" fill="none" stroke="var(--${k === 2 ? "amber" : "blue"})" stroke-width="3" stroke-linecap="round" class="fi"/></g>`;
    const rows = [0, 1, 2, 3]
      .map(
        (k) =>
          `<text x="40" y="${57 + k * 44}" class="fig-box">k = ${k}</text>${[0, 1, 2, 3].map((n) => cell(k, n)).join("")}`,
      )
      .join("");
    const head = [0, 1, 2, 3].map((n) => `<text x="${96 + n * 60}" y="18" class="fig-sub">sample ${n}</text>`).join("");
    return svgFig(
      560,
      216,
      "A 4 by 4 table of arrows. Row 0 is all pointing right, row 1 turns a quarter more each step, row 2 alternates right and left, row 3 turns the other way",
      `<rect x="10" y="118" width="300" height="44" rx="10" fill="${tint("amber", 18)}"/>${head}${rows}<g class="fig-sub" style="text-anchor:start"><text x="340" y="70">right: keep the sample</text><text x="340" y="94">left: flip its sign</text><text x="340" y="118">down or up: turn it a quarter</text><text x="340" y="150" style="fill:var(--amber-ink)">row 2 reads: add, subtract, add, subtract</text></g>`,
    );
  };
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
        b: `<p>How much of a 3 Hz wave is hiding in a signal? Here is the recipe. <b>Wind the signal round a circle</b>, going round 3 times a second, so each moment becomes a point at some distance from the centre. Then find the <b>average point</b>. If the signal wiggles at 3 Hz, the winding lines its peaks up on one side and the average sits far from the centre: lots of 3 Hz in there. If not, the points spread all round and cancel, and the average sits at the centre: none.</p><p>Repeat for every winding speed and you have the Fourier transform: one answer per frequency.</p><details class="math-more"><summary>Show the maths</summary><p>For a signal $f(t)$ the transform $F(\\omega)$ and its inverse are:</p>$$F(\\omega)=\\int_{-\\infty}^{\\infty} f(t)\\,e^{-j\\omega t}\\,dt \\qquad f(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} F(\\omega)\\,e^{j\\omega t}\\,d\\omega$$<p>The factor $e^{-j\\omega t}$ is the spinning arrow, and the integral adds up all the products.</p></details>`,
        v: windFig(),
        c: {
          q: "In the winding picture, what shows that the signal contains a lot of the winding frequency?",
          o: [
            "The average point sits far from the centre",
            "The curve has the most loops",
            "The average point sits exactly at the centre of the circle",
          ],
          a: 0,
          why: "A match lines the peaks up on one side, so the average point is pulled away from the centre. A mismatch balances out and the average stays at the centre.",
        },
      },
      {
        t: "The spinning arrow",
        b: `<p>Picture an arrow of length 1 that starts pointing right and turns steadily clockwise. A <b>faster frequency just means a faster turn</b>. Half a turn leaves it pointing the opposite way, and a full turn brings it home.</p><p>Multiply a signal by this turning arrow, sample by sample. If the signal wiggles at the <b>same</b> speed, each peak meets the arrow pointing the same way, so the products all add up. At a different speed they point every which way and cancel.</p><details class="math-more"><summary>Show the maths</summary><p>The arrow is $e^{-j\\theta}=\\cos\\theta - j\\sin\\theta$ (Euler's formula): length 1 at angle $-\\theta$. With $\\theta=\\omega t$ it spins faster for a bigger $\\omega$. For example $e^{-j\\pi}=\\cos\\pi - j\\sin\\pi=-1$.</p></details>`,
        v: `<svg class="fig" viewBox="0 0 380 180" style="max-height:180px" role="img" aria-label="An arrow of length 1 shown at eight positions as it turns clockwise"><circle cx="90" cy="90" r="64" fill="none" stroke="var(--line)"/><line x1="14" y1="90" x2="170" y2="90" stroke="var(--line-2)"/><line x1="90" y1="20" x2="90" y2="160" stroke="var(--line-2)"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="90" y1="90" x2="${90 + 56 * Math.cos((TAU * i) / 8)}" y2="${90 + 56 * Math.sin((TAU * i) / 8)}" stroke="var(--blue)" stroke-width="2" opacity="${0.35 + i * 0.09}" class="draw"/>`).join("")}<text x="196" y="70" class="fig-sub" style="text-anchor:start">turns clockwise</text><text x="196" y="92" class="fig-sub" style="text-anchor:start">always length 1</text><text x="196" y="114" class="fig-sub" style="text-anchor:start">half a turn: flipped</text></svg>`,
        c: {
          q: "An arrow starts pointing right and turns clockwise by half a circle. Where does it point?",
          o: ["Left, the opposite way", "Straight down", "Back to the right again"],
          a: 0,
          hint: "Half a circle is a turn of 180 degrees.",
          why: "Half a turn flips the arrow to point the other way. In symbols that is $e^{-j\\pi}=-1$.",
        },
      },
      {
        t: "Computers only have samples",
        b: `<p>A recording is not a smooth curve. It is a <b>list of numbers</b>: one measurement every so often. Record every 0.01 seconds and you get 100 numbers a second. We cannot add up "every instant", but we <b>can add up a list</b>, so the integral becomes a sum over the samples.</p><p>The gap between samples is called T. The number of samples per second, the sample rate, is 1 divided by T.</p>`,
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
            )}" fill="none" stroke="var(--line-2)" stroke-width="2" class="draw"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${X(i)}" y1="75" x2="${X(i)}" y2="${Y(f(i))}" stroke="var(--teal)" opacity=".4"/><circle cx="${X(i)}" cy="${Y(f(i))}" r="4.5" fill="var(--teal)" class="fi"/>`).join("")}<path d="M${X(2)} 138 H${X(3)}" stroke="var(--amber)" stroke-width="3"/><text x="${(X(2) + X(3)) / 2}" y="132" class="fig-sub" style="fill:var(--amber)">T</text><text x="${X(0)}" y="20" class="fig-sub">first</text><text x="${X(8)}" y="20" class="fig-sub">last</text></svg>`;
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
        b: `<p>Do the same with the list. To ask about <b>bin k</b>, turn the arrow by k eighths of a circle (for 8 samples) between one sample and the next. Multiply each sample by the arrow where it has got to, then add up all 8 products.</p><p>Bin 0 does not turn at all, so it just adds the samples. Bin 1 goes round once over the whole list, bin 3 goes round three times. N samples in, <b>N bins out</b>, and bin k sits at k × (sample rate ÷ N) Hz.</p><details class="math-more"><summary>Show the maths</summary><p>Only ask about the frequencies that fit the window: the <b>fundamental</b> and its <b>harmonics</b>, $\\omega_k = \\frac{2\\pi}{NT}k$ for $k = 0,1,\\dots,N-1$:</p>$$F[k]=\\sum_{n=0}^{N-1} f[n]\\,e^{-j2\\pi kn/N}$$<p>Bin $k$ sits at $k\\,f_s/N$ Hz.</p></details>`,
        v: spinFig(),
        c: {
          q: "N = 8 samples at fs = 8000 Hz. Which frequency is bin k = 3?",
          o: ["3 Hz", "3000 Hz", "375 Hz"],
          a: 1,
          why: "Bin spacing is fs/N = 8000/8 = 1000 Hz, so bin 3 is at 3 × 1000 = 3000 Hz.",
        },
      },
      {
        t: "Undoing it: the inverse DFT",
        b: `<p>The transform throws nothing away. Take every bin's wave, with its strength and timing, and <b>add them all back up</b>: you get the original samples. The only differences are that the arrows turn the opposite way and the total is divided by N.</p><p>That is what lets you edit a spectrum (delete a hum, say) and turn it back into a signal. In the picture, the samples 1, 2, 3, 4 go in, a spectrum comes out, and the inverse DFT returns exactly 1, 2, 3, 4.</p><details class="math-more"><summary>Show the maths</summary>$$f[n]=\\frac{1}{N}\\sum_{k=0}^{N-1} F[k]\\,e^{+j2\\pi kn/N}$$<p>In other words, the inverse DFT is $1/N$ times the complex conjugate of the forward DFT.</p></details>`,
        v:
          F.cells(
            [1, 2, 3, 4].map((v) => ({ v, c: "blue" })),
            { label: "samples" },
          ) +
          cap("forward DFT ↓") +
          F.cells(
            ["10", "−2 + 2j", "−2", "−2 − 2j"].map((v) => ({ v, c: "violet" })),
            { label: "spectrum", size: 64 },
          ) +
          cap("inverse DFT ↓") +
          F.cells(
            [1, 2, 3, 4].map((v) => ({ v, c: "teal" })),
            { label: "samples again" },
          ),
        c: {
          q: "You set one bin of a spectrum to zero and run the inverse DFT. What do you get?",
          o: [
            "The signal with that frequency removed",
            "The original signal, unchanged",
            "An error, since the spectrum is incomplete",
          ],
          a: 0,
          why: "The inverse adds the waves back up, so a bin set to zero simply contributes nothing. That is how filtering in the frequency domain works.",
        },
      },
      {
        t: "The DFT as a matrix",
        b: `<p>Bin 0 is one row of instructions: "multiply every sample by this arrow, then add". Bin 1 is another row, and so on. Stack all N rows and you get a <b>square table of arrows</b>, one row per bin and one column per sample. Applying the DFT means multiplying the samples by this table.</p><p>For 4 samples the arrows can only point right, down, left or up, so the whole table fits on paper. Row 0 is all rightwards (just add), and row 2 alternates right and left: add, subtract, add, subtract.</p><details class="math-more"><summary>Show the maths</summary><p>Write $W=e^{-j2\\pi/N}$. Every output is $F[k]=\\sum_n W^{kn} f[n]$, a matrix times a vector: $F = \\mathbf{W} f$, with $W^{kn}$ in row $k$, column $n$. For $N=4$, $W=-j$ and its powers are $1, -j, -1, j$.</p><p>Example: $f=[1,2,3,4]$ gives $F=[10,\\,-2+2j,\\,-2,\\,-2-2j]$.</p></details>`,
        v: matFig() + cap("f = [1, 2, 3, 4] gives F = [10, −2 + 2j, −2, −2 − 2j]. Row 0 just adds up the samples."),
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
        b: `<p>Pick the number of samples, set their values (or press a preset) and choose a bin. The picture draws each sample multiplied by its arrow as a blue arrow, laid <b>tip to tail</b>. The orange arrow from the start to the end of the chain is that bin's answer.</p><p>The table lists every bin, and the stat confirms that running the inverse DFT gives your samples back.</p>`,
        v: F.cells([
          { v: "samples", c: "blue" },
          "→",
          { v: "× turning arrow", c: "violet" },
          "→",
          { v: "chain", sub: "tip to tail", c: "amber" },
          "→",
          { v: "bin's answer", sub: "the sum", c: "teal" },
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
