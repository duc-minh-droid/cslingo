/* js/content/algo/algo-p9-x-09.js: Phase 9 extra lessons (overflow): 9.8 The 2-D FFT. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, mono, fftIP, TAU } = shared;
  reg({
    id: "a9-2d",
    order: 8,
    num: "9.8",
    title: "Rows, then columns: the 2-D FFT",
    blurb:
      "Transform an image by running the 1-D FFT along every row and then down every column, and read the wave directions off the result.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const M = 32;
      let seed = 11;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296 - 0.5;
      };
      const noiseImg = Array.from({ length: M * M }, () => rnd() + rnd());
      const waves = [
        { u: 3, v: 1, A: 1 },
        { u: -5, v: 4, A: 0.6 },
        { u: 0, v: 0, A: 0 },
      ];
      let noiseAmp = 0.2,
        mask = new Set();
      const card =
        el(`<div class="card"><div class="card-head"><h2>A tiny sea in 2-D</h2><span class="faint">32 × 32 pixels, up to three plane waves plus noise</span></div>
        <div id="wv" class="controls" style="gap:12px 20px"></div>
        <div class="controls" id="r2"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px">
          <div><div class="faint" style="font-weight:800;margin-bottom:4px">The image (space)</div><canvas class="viz" id="im"></canvas></div>
          <div><div class="faint" style="font-weight:800;margin-bottom:4px">Its 2-D spectrum (click to delete)</div><canvas class="viz" id="sp" style="cursor:pointer"></canvas></div>
          <div><div class="faint" style="font-weight:800;margin-bottom:4px">After deleting the clicked spikes</div><canvas class="viz" id="rs"></canvas></div></div>
        <div class="legend"><span style="--c:var(--amber)">orange cross = zero frequency (centre)</span><span style="--c:var(--rose)">red squares = deleted bins</span></div>
        <div class="stat-row"><div class="stat teal"><small>Strongest wave</small><b id="s1"></b></div><div class="stat amber"><small>1-D FFTs run</small><b>64 (32 rows + 32 columns)</b></div><div class="stat violet"><small>Bins deleted</small><b id="s3"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      const wv = qs("#wv", card);
      waves.forEach((wv0, i) => {
        const box = el(
          `<div style="border-left:3px solid ${["var(--teal)", "var(--violet)", "var(--amber)"][i]};padding-left:10px"></div>`,
        );
        const su = N.slider(`Wave ${i + 1}: u`, -8, 8, 1, wv0.u, (v) => String(v)),
          sv = N.slider(`v`, -8, 8, 1, wv0.v, (v) => String(v)),
          sa = N.slider(`amp`, 0, 1, 0.1, wv0.A, (v) => fmt(v, 1));
        su.onInput((v) => {
          wv0.u = v;
          mask.clear();
          draw();
        });
        sv.onInput((v) => {
          wv0.v = v;
          mask.clear();
          draw();
        });
        sa.onInput((v) => {
          wv0.A = v;
          mask.clear();
          draw();
        });
        box.append(su, sv, sa);
        wv.append(box);
      });
      const r2 = qs("#r2", card);
      const sn2 = N.slider("Noise", 0, 1, 0.1, noiseAmp, (v) => fmt(v, 1));
      sn2.onInput((v) => {
        noiseAmp = v;
        draw();
      });
      const bAuto = el(`<button class="btn small">Delete the strongest spike pair</button>`),
        bClr = el(`<button class="btn small ghost">Clear deletions</button>`);
      r2.append(sn2, bAuto, bClr);
      const fft2 = (re, im, inv) => {
        // rows first (index x), then columns (index y): the lecture's two steps
        for (let y = 0; y < M; y++) {
          const r = re.slice(y * M, y * M + M),
            i = im.slice(y * M, y * M + M);
          fftIP(r, i, inv);
          re.set(r, y * M);
          im.set(i, y * M);
        }
        for (let x = 0; x < M; x++) {
          const r = new Float64Array(M),
            i = new Float64Array(M);
          for (let y = 0; y < M; y++) {
            r[y] = re[y * M + x];
            i[y] = im[y * M + x];
          }
          fftIP(r, i, inv);
          for (let y = 0; y < M; y++) {
            re[y * M + x] = r[y];
            im[y * M + x] = i[y];
          }
        }
      };
      let cache = null;
      const key = (u, v) => (((u % M) + M) % M) + "," + (((v % M) + M) % M);
      function compute() {
        const f = new Float64Array(M * M);
        for (let y = 0; y < M; y++)
          for (let x = 0; x < M; x++) {
            let s = noiseAmp * noiseImg[y * M + x];
            waves.forEach((w) => {
              if (w.A > 0) s += w.A * Math.cos((TAU * (w.u * x + w.v * y)) / M);
            });
            f[y * M + x] = s;
          }
        const re = Float64Array.from(f),
          im = new Float64Array(M * M);
        fft2(re, im, false);
        const mag = Float64Array.from(re, (_, i) => Math.hypot(re[i], im[i]));
        const er = Float64Array.from(re),
          ei = Float64Array.from(im);
        for (let v = 0; v < M; v++)
          for (let u = 0; u < M; u++)
            if (mask.has(u + "," + v)) {
              er[v * M + u] = 0;
              ei[v * M + u] = 0;
            }
        fft2(er, ei, true);
        cache = { f, mag, res: er };
      }
      const strongest = () => {
        let b = -1,
          bu = 0,
          bv = 0;
        for (let v = 0; v < M; v++)
          for (let u = 0; u < M; u++) {
            if (u === 0 && v === 0) continue;
            if (mask.has(u + "," + v)) continue;
            const m = cache.mag[v * M + u];
            if (m > b) {
              b = m;
              bu = u;
              bv = v;
            }
          }
        return [bu, bv, b];
      };
      bAuto.onclick = () => {
        compute();
        const [u, v] = strongest();
        mask.add(u + "," + v);
        mask.add(key(-u, -v));
        draw();
      };
      bClr.onclick = () => {
        mask.clear();
        draw();
      };
      qs("#sp", card).onclick = (e) => {
        const cv = qs("#sp", card),
          r = cv.getBoundingClientRect(),
          c = Math.floor(((e.clientX - r.left) / r.width) * M),
          rw = Math.floor(((e.clientY - r.top) / r.height) * M);
        const u = (c + M / 2) % M,
          v = (rw + M / 2) % M;
        if (u === 0 && v === 0) return;
        const k1 = u + "," + v,
          k2 = key(-u, -v);
        if (mask.has(k1)) {
          mask.delete(k1);
          mask.delete(k2);
        } else {
          mask.add(k1);
          mask.add(k2);
        }
        draw();
      };
      function paintGrey(id, data, lo, hi) {
        const cv = qs(id, card),
          { ctx, w } = N.setupCanvas(cv, cv.clientWidth);
        if (w < 40) return;
        const s = w / M;
        for (let y = 0; y < M; y++)
          for (let x = 0; x < M; x++) {
            const t = Math.max(0, Math.min(1, (data[y * M + x] - lo) / (hi - lo || 1))),
              g = Math.round(20 + t * 215);
            ctx.fillStyle = `rgb(${g},${g},${g})`;
            ctx.fillRect(x * s, y * s, Math.ceil(s), Math.ceil(s));
          }
      }
      function draw() {
        compute();
        const C = N.colors();
        const lo = Math.min(...cache.f),
          hi = Math.max(...cache.f);
        paintGrey("#im", cache.f, lo, hi);
        paintGrey("#rs", cache.res, lo, hi);
        const cv = qs("#sp", card),
          { ctx, w } = N.setupCanvas(cv, cv.clientWidth);
        if (w >= 40) {
          const s = w / M,
            mx = Math.log1p(Math.max(...cache.mag.slice(1)));
          for (let r = 0; r < M; r++)
            for (let c = 0; c < M; c++) {
              const u = (c + M / 2) % M,
                v = (r + M / 2) % M,
                t = Math.log1p(cache.mag[v * M + u]) / (mx || 1),
                g = Math.round(15 + Math.min(1, t) * 235);
              ctx.fillStyle = `rgb(${g},${g},${g})`;
              ctx.fillRect(c * s, r * s, Math.ceil(s), Math.ceil(s));
              if (mask.has(u + "," + v)) {
                ctx.strokeStyle = C.rose;
                ctx.lineWidth = 2;
                ctx.strokeRect(c * s + 1, r * s + 1, s - 2, s - 2);
              }
            }
          ctx.strokeStyle = C.amber;
          ctx.lineWidth = 2;
          const cx = (M / 2 + 0.5) * s;
          ctx.beginPath();
          ctx.moveTo(cx - 6, cx);
          ctx.lineTo(cx + 6, cx);
          ctx.moveTo(cx, cx - 6);
          ctx.lineTo(cx, cx + 6);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
        const [bu0, bv0, bm] = strongest();
        let u = bu0 > M / 2 ? bu0 - M : bu0,
          v = bv0 > M / 2 ? bv0 - M : bv0;
        if (u < 0 || (u === 0 && v < 0)) {
          u = -u;
          v = -v;
        }
        qs("#s1", card).textContent =
          bm > 1 ? `(u,v) = (${u}, ${v}): wavelength ${fmt(+(M / Math.hypot(u, v)).toFixed(1), 1)} px` : "none left";
        qs("#s3", card).textContent = mask.size;
        qs("#note", card).innerHTML = mask.size
          ? `<div class="callout violet"><b>You edited the spectrum.</b> The right-hand image is the inverse 2-D FFT of what is left. Each deleted spike pair removes one plane wave from the picture.</div>`
          : `<div class="callout">Each plane wave becomes a <b>mirrored pair of bright dots</b>. Distance from the centre = how fast it ripples; direction from the centre = which way it runs.</div>`;
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a9-2d-1",
          q: "Set Wave 1 to u = 4, v = 0, switch Waves 2 and 3 off (amp 0) and noise to 0. What does the spectrum look like?",
          opts: [
            "A mirrored pair of dots on the horizontal axis",
            "A single bright dot sitting at the centre",
            "A full horizontal line of bright dots",
          ],
          a: 0,
          why: "u = 4 means 4 ripples across the width and v = 0 means none down the height: vertical stripes. A pure wave gives just two dots, at (4, 0) and its mirror (−4, 0).",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-2d-2",
          q: "With the default waves, press <b>Delete the strongest spike pair</b> once. What does the right-hand image show?",
          opts: [
            "The strongest wave has vanished, leaving the weaker wave and noise",
            "The whole image goes black",
            "The image is unchanged, because one pair is too little to matter",
          ],
          a: 0,
          why: "Each wave lives in exactly one mirrored pair of bins. Deleting that pair removes that one wave (and nothing else) from the inverse transform.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A 2-D FFT is two passes of the 1-D FFT: <b>every row</b> (real → complex), then <b>every column</b> of the result (complex → complex).",
            "For an N × N image that is 2N one-dimensional FFTs: about 2N² log₂N operations, against N⁴ for the direct 2-D sum.",
            "Each plane wave becomes a <b>mirrored pair of dots</b>: distance from the centre = frequency, direction = the way the wave runs.",
            "Deleting a spike pair removes that wave from the image: the 2-D version of a notch filter (and the idea behind cleaning periodic noise from photos).",
          ],
          "Rows, then columns: one trick extends the FFT to images.",
        ),
      );
    },
  });
  L["a9-2d"] = {
    sum: "A 2-D FFT is just the 1-D FFT run along every row and then down every column. Its spectrum shows the frequency and direction of every wave in an image, such as a sea surface.",
    steps: [
      {
        t: "Images are 2-D signals",
        b: `<p>A grey-scale picture is a grid of numbers, a signal that varies in <b>two</b> directions. The workshop's data file <code>waveRadar.csv</code> is such a grid: wave heights measured by radar over a patch of sea, a 1024 × 1024 matrix you can view as an image.</p><p>A wave in 2-D has a frequency <b>and a direction</b>, so each frequency now needs two numbers $(u, v)$: how many ripples across the width and down the height.</p>`,
        v: `<svg class="fig" viewBox="0 0 360 150" style="max-height:150px">${[0, 1].map((p) => `<g transform="translate(${p * 190} 0)"><rect x="10" y="10" width="130" height="130" rx="10" fill="var(--bg-2)" stroke="var(--line-2)"/>${Array.from({ length: 6 }, (_, i) => (p === 0 ? `<line x1="${22 + i * 22}" y1="12" x2="${22 + i * 22}" y2="138" stroke="var(--blue)" stroke-width="7" opacity=".55"/>` : `<line x1="${6 + i * 26}" y1="140" x2="${46 + i * 26}" y2="12" stroke="var(--teal)" stroke-width="7" opacity=".55"/>`)).join("")}</g>`).join("")}<text x="75" y="148" class="fig-sub">ripples across</text><text x="265" y="148" class="fig-sub">ripples at an angle</text></svg>`,
        c: {
          q: "Why does a 2-D wave need two frequency numbers?",
          o: [
            "It ripples at some rate across and down, which also fixes its direction",
            "One number for the wave's height and one for the time it lasts",
            "Because images have a red channel and a separate green channel",
          ],
          a: 0,
          why: "(u, v) = ripples across the width and down the height. Together they give the wavelength and the direction of travel.",
        },
      },
      {
        t: "Rows, then columns",
        b: `<p>The lecture's recipe for a 2-D FFT has two steps:</p><p><b>1.</b> Run the 1-D FFT on <b>each row</b> of the image (real input, complex output).</p><p><b>2.</b> Run the 1-D FFT on <b>each column</b> of that result (complex input, complex output).</p>`,
        v: F.flow([
          { t: "Image", s: "N × N reals", c: "blue" },
          { t: "FFT every row", s: "N transforms", c: "violet" },
          { t: "FFT every column", s: "N transforms", c: "amber" },
          { t: "2-D spectrum", s: "N × N complex", c: "teal" },
        ]),
        c: {
          q: "In step 2, what kind of numbers does the column FFT take as input?",
          o: ["Complex numbers, produced by step 1", "The original real pixel values", "Only the real parts of step 1"],
          a: 0,
          why: "After the row pass every entry is complex, so the column pass is a complex-to-complex FFT.",
        },
      },
      {
        t: "Why that works",
        b: `<p>The 2-D DFT is a double sum: $F[u,v]=\\sum_x\\sum_y f[x,y]\\,e^{-j2\\pi(ux+vy)/N}$. The exponential <b>splits into an x part times a y part</b>, so the inner sum over one direction is itself a 1-D DFT. Do all the inner sums first (the rows), then the outer sums (the columns).</p><p>Because the two sums are independent, doing columns first gives the <b>same answer</b>.</p>`,
        v: mono(
          "F[u,v] = Σ<sub>x</sub> e<sup>−j2πux/N</sup> · [ Σ<sub>y</sub> f[x,y] · e<sup>−j2πvy/N</sup> ]<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↑ a 1-D DFT along one direction",
        ),
        c: {
          q: "You transform the columns first and then the rows. What do you get?",
          o: ["The same 2-D spectrum", "The spectrum rotated by 90 degrees", "Garbage, because the order matters"],
          a: 0,
          why: "The 2-D DFT is separable, so the order of the two 1-D passes does not matter (apart from rounding).",
        },
      },
      {
        t: "The cost",
        b: `<p>For an $N\\times N$ image the direct 2-D sum has $N^2$ outputs each adding $N^2$ terms: $N^4$. Using 1-D transforms along rows and columns ($2N$ of them) with a direct DFT costs $2N\\cdot N^2=2N^3$. With the FFT each 1-D transform costs $N\\log_2 N$, giving $2N^2\\log_2 N$.</p>`,
        v: table(
          ["1024 × 1024 image", "operations"],
          [
            ["direct 2-D sum, N⁴", "≈ 1.1 × 10¹²"],
            ["rows + columns, direct DFT, 2N³", "≈ 2.1 × 10⁹"],
            { c: ["rows + columns, FFT, 2N² log₂N", "≈ 2.1 × 10⁷"], hl: true },
          ],
        ),
        c: {
          q: "A 1024 × 1024 image is transformed by rows and then columns. How many 1-D FFTs are run in total?",
          o: ["1,024", "2,048", "1,048,576"],
          a: 1,
          why: "1,024 rows plus 1,024 columns = 2,048 one-dimensional FFTs.",
        },
      },
      {
        t: "Reading a 2-D spectrum",
        b: `<p>Plots of the 2-D spectrum are shifted so that <b>zero frequency is at the centre</b>. Then:</p><p><b>Distance</b> from the centre is how fast the pattern ripples. <b>Direction</b> from the centre is the way the wave runs. A real image has a mirror-image dot on the opposite side of the centre for every dot, just as the 1-D spectrum has mirror bins.</p>`,
        v: `<svg class="fig" viewBox="0 0 220 190" style="max-height:190px"><rect x="30" y="10" width="160" height="160" rx="10" fill="var(--bg-2)" stroke="var(--line-2)"/><line x1="30" y1="90" x2="190" y2="90" stroke="var(--line)"/><line x1="110" y1="10" x2="110" y2="170" stroke="var(--line)"/><circle cx="110" cy="90" r="5" fill="var(--amber)"/><circle cx="150" cy="66" r="6" fill="var(--teal)" class="fi"/><circle cx="70" cy="114" r="6" fill="var(--teal)" class="fi"/><line x1="110" y1="90" x2="150" y2="66" stroke="var(--teal)" stroke-width="2"/><text x="158" y="62" class="fig-sub" style="text-anchor:start">wave</text><text x="64" y="132" class="fig-sub" style="text-anchor:end">its mirror</text><text x="112" y="186" class="fig-sub">zero frequency in the middle</text></svg>`,
        c: {
          q: "A single plane wave appears in the centred 2-D spectrum as…",
          o: [
            "A pair of dots on opposite sides of the centre",
            "A single bright dot sitting at the centre",
            "A bright ring around the centre of the plot",
          ],
          a: 0,
          why: "A real wave has the bin (u, v) and its mirror (−u, −v), which sit on opposite sides of the centre.",
        },
      },
      {
        t: "Workshop task 2: the sea",
        b: `<p>The workshop asks for two things on <code>waveRadar.csv</code>. <b>Task 1 (1-D):</b> transform just the first row. This gives the wavelengths seen along that single line.</p><p><b>Task 2 (2-D):</b> transform the whole image and analyse it. The peaks give the sea's dominant waves: a peak at $(u,v)$ in an $N\\times N$ image means a wavelength of $N/\\sqrt{u^2+v^2}$ pixels, travelling along the angle $\\arctan(v/u)$.</p>`,
        v: table(
          ["Peak at (u, v)", "N", "Wavelength = N / √(u² + v²)"],
          [
            ["(6, 8)", "100", "100 / 10 = <b>10 px</b>"],
            ["(3, 4)", "50", "50 / 5 = <b>10 px</b>"],
            ["(0, 5)", "100", "100 / 5 = <b>20 px</b>, ripples run down the image"],
          ],
        ),
        c: {
          q: "In a 100 × 100 image the spectrum peaks at (u, v) = (6, 8). What is the wavelength?",
          o: ["10 pixels", "14 pixels", "100 pixels"],
          a: 0,
          hint: "6-8-10 triangle: the distance from the centre is 10.",
          why: "$\\sqrt{6^2+8^2}=10$, so the wavelength is 100 / 10 = 10 pixels.",
        },
      },
      {
        t: "Cleaning images",
        b: `<p>The same moves as in 1-D work on pictures. Delete a spike pair to remove a regular stripe pattern (scan lines, a printed screen). Keep only the bins near the centre for a <b>blur</b> (low-pass) or only the far bins for <b>edges</b> (high-pass). This is how the lecture's "beautify photos" example works.</p>`,
        v: F.compare(
          {
            title: "Keep the middle (low-pass)",
            c: "teal",
            body:
              F.cells(
                [
                  { v: "slow", c: "teal" },
                  { v: "fast", c: "dim" },
                ],
                { size: 62 },
              ) + "smooth, blurred picture",
          },
          {
            title: "Keep the outside (high-pass)",
            c: "violet",
            body:
              F.cells(
                [
                  { v: "slow", c: "dim" },
                  { v: "fast", c: "violet" },
                ],
                { size: 62 },
              ) + "edges and fine detail",
          },
        ),
        c: {
          q: "A photo has a regular pattern of fine stripes. How would you remove it with the 2-D FFT?",
          o: [
            "Delete the matching pair of spikes in the spectrum, then invert",
            "Delete the centre block of the spectrum, then invert",
            "Transform only the first row of pixels, then invert",
          ],
          a: 0,
          why: "Regular stripes are one plane wave, so they sit in one mirrored pair of spikes. Deleting just that pair leaves the picture intact.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>The left picture is built from up to three plane waves plus noise. The middle picture is its 2-D spectrum (centred; <b>click a cell</b> to delete it and its mirror). The right picture is the inverse transform of whatever is left.</p>`,
        v: F.cells([
          { v: "image", c: "blue" },
          "→",
          { v: "2-D FFT", c: "violet" },
          "→",
          { v: "click spikes", c: "rose" },
          "→",
          { v: "inverse", c: "teal" },
        ]),
      },
    ],
    guide: [
      "Find the two bright dots for Wave 1 (u = 3, v = 1) in the spectrum, and check the strongest-wave stat gives a wavelength of 10.1 px.",
      "Change Wave 1 to u = 4, v = 0. How do the stripes and the dots change? Try v = 4 too.",
      "Press <b>Delete the strongest spike pair</b>, then click a few more bright cells in the spectrum.",
      "Raise the noise to 1: the dots stay put while the background lights up. Why does the picture still show clear waves?",
      "Answer the questions after the demo.",
    ],
  };
})();
