/* js/content/algo/algo-p9-x-06.js: Phase 9 extra lessons (overflow): 9.4 Leakage and windows. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap, fftIP, TAU } = shared;
  reg({
    id: "a9-leak",
    order: 4,
    num: "9.4",
    title: "Leakage, windows and aliasing",
    blurb: "Two ways the DFT misleads you, and the window functions (Hann, Hamming) that tame one of them.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const NS = 64,
        FB = 20; // 64 samples at fs = 64 Hz: bins are exactly 1 Hz apart
      let fA = 10.5,
        aB = 0.03,
        win = "none",
        dbMode = true;
      const WIN = {
        none: () => 1,
        hann: (n) => 0.5 - 0.5 * Math.cos((TAU * n) / (NS - 1)),
        hamming: (n) => 0.54 - 0.46 * Math.cos((TAU * n) / (NS - 1)),
      };
      const card =
        el(`<div class="card"><div class="card-head"><h2>One strong tone, one faint neighbour</h2><span class="faint">N = 64 samples at fs = 64 Hz, so bin k is exactly k Hz</span></div>
        <div class="controls" id="r1"></div><div class="controls" id="r2"></div>
        <canvas class="viz" id="tm"></canvas>
        <div class="legend"><span style="--c:var(--teal)">samples after the window</span><span style="--c:var(--text-faint)">window shape</span></div>
        <canvas class="viz" id="sp" style="margin-top:12px"></canvas>
        <div class="legend"><span style="--c:var(--teal)">measured |X[k]|, relative to the tallest bin</span><span style="--c:var(--blue)">▼ strong tone</span><span style="--c:var(--amber)">▼ faint tone at 20 Hz</span></div>
        <div class="stat-row"><div class="stat teal"><small>Strong tone: energy outside its 3 nearest bins</small><b id="s1"></b></div><div class="stat amber"><small>Faint tone at 20 Hz</small><b id="s2"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      const r1 = qs("#r1", card),
        r2 = qs("#r2", card);
      const sf = N.slider("Strong tone (Hz)", 6, 14, 0.1, fA, (v) => fmt(v, 1));
      sf.onInput((v) => {
        fA = v;
        draw();
      });
      r1.append(
        sf,
        N.seg(
          [
            ["none", "No window"],
            ["hann", "Hann"],
            ["hamming", "Hamming"],
          ],
          win,
          (v) => {
            win = v;
            draw();
          },
        ),
      );
      r2.append(
        N.seg(
          [
            ["0", "No faint tone"],
            ["0.01", "Faint 1%"],
            ["0.03", "Faint 3%"],
            ["0.1", "Faint 10%"],
          ],
          String(aB),
          (v) => {
            aB = +v;
            draw();
          },
        ),
        N.seg(
          [
            ["db", "dB scale"],
            ["lin", "Linear scale"],
          ],
          "db",
          (v) => {
            dbMode = v === "db";
            draw();
          },
        ),
      );
      const spectrum = (a2, w) => {
        const re = new Float64Array(NS),
          im = new Float64Array(NS);
        for (let n = 0; n < NS; n++)
          re[n] = (Math.sin((TAU * fA * n) / NS) + a2 * Math.sin((TAU * FB * n) / NS)) * WIN[w](n);
        fftIP(re, im, false);
        return Array.from({ length: NS / 2 + 1 }, (_, k) => Math.hypot(re[k], im[k]));
      };
      function draw() {
        const C = N.colors();
        const mag = spectrum(aB, win),
          mx = Math.max(...mag),
          db = mag.map((m) => 20 * Math.log10(Math.max(m, 1e-12) / mx));
        {
          const { ctx, w, h } = N.setupCanvas(qs("#tm", card), 150);
          const padL = 30,
            X = (n) => padL + (n / (NS - 1)) * (w - padL - 8),
            Y = (v) => h / 2 - (v * (h / 2 - 14)) / 1.3;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padL, h / 2);
          ctx.lineTo(w - 8, h / 2);
          ctx.stroke();
          ctx.strokeStyle = C.text_faint;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          for (let n = 0; n < NS; n++) n ? ctx.lineTo(X(n), Y(WIN[win](n))) : ctx.moveTo(X(n), Y(WIN[win](n)));
          ctx.stroke();
          ctx.setLineDash([]);
          for (let n = 0; n < NS; n++) {
            const v = (Math.sin((TAU * fA * n) / NS) + aB * Math.sin((TAU * FB * n) / NS)) * WIN[win](n);
            ctx.strokeStyle = "rgba(88,204,2,0.35)";
            ctx.beginPath();
            ctx.moveTo(X(n), h / 2);
            ctx.lineTo(X(n), Y(v));
            ctx.stroke();
            ctx.fillStyle = C.teal;
            ctx.beginPath();
            ctx.arc(X(n), Y(v), 2.4, 0, 7);
            ctx.fill();
          }
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "left";
          ctx.fillText("sample n (0 to 63)", padL, h - 4);
        }
        {
          const { ctx, w, h } = N.setupCanvas(qs("#sp", card), 230);
          const padL = 40,
            padT = 12,
            padB = 26,
            F = (k) => padL + (k / 32) * (w - padL - 10),
            bw = (w - padL - 10) / 33;
          ctx.clearRect(0, 0, w, h);
          const floor = -100,
            val = (k) => (dbMode ? Math.max(0, (db[k] - floor) / -floor) : mag[k] / mx);
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "right";
          ctx.strokeStyle = C.line;
          ctx.lineWidth = 1;
          (dbMode ? [0, -25, -50, -75, -100] : [1, 0.75, 0.5, 0.25, 0]).forEach((g, i) => {
            const y = padT + (i / 4) * (h - padT - padB);
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(w - 10, y);
            ctx.stroke();
            ctx.fillText(dbMode ? g + " dB" : fmt(g, 2), padL - 5, y + 4);
          });
          for (let k = 0; k <= 32; k++) {
            const bh = val(k) * (h - padT - padB);
            ctx.fillStyle = k === FB && aB > 0 ? C.amber : C.teal;
            ctx.fillRect(F(k) - bw / 2 + 1, h - padB - bh, Math.max(1, bw - 2), bh);
          }
          ctx.fillStyle = C.text_faint;
          ctx.textAlign = "center";
          for (let k = 0; k <= 32; k += 4) ctx.fillText(k + " Hz", F(k), h - 9);
          ctx.fillStyle = C.blue;
          ctx.beginPath();
          ctx.moveTo(F(fA) - 5, padT - 2);
          ctx.lineTo(F(fA) + 5, padT - 2);
          ctx.lineTo(F(fA), padT + 7);
          ctx.closePath();
          ctx.fill();
          if (aB > 0) {
            ctx.fillStyle = C.amber;
            ctx.beginPath();
            ctx.moveTo(F(FB) - 5, padT - 2);
            ctx.lineTo(F(FB) + 5, padT - 2);
            ctx.lineTo(F(FB), padT + 7);
            ctx.closePath();
            ctx.fill();
          }
        }
        // leakage of the strong tone on its own
        const solo = spectrum(0, win),
          e = solo.reduce((s, v) => s + v * v, 0),
          c0 = Math.round(fA);
        const near = [c0 - 1, c0, c0 + 1].reduce((s, k) => s + (solo[k] || 0) ** 2, 0);
        qs("#s1", card).textContent = fmt(Math.max(0, +((1 - near / e) * 100).toFixed(1)), 1) + "%";
        let vis = "no faint tone";
        if (aB > 0)
          vis = db[FB] - Math.max(db[FB - 1], db[FB + 1]) >= 3 ? "visible: a clear bump" : "buried in the skirt";
        qs("#s2", card).textContent = vis;
        const whole = Math.abs(fA - Math.round(fA)) < 1e-9;
        qs("#note", card).innerHTML =
          whole && win === "none"
            ? `<div class="callout teal"><b>A whole number of cycles</b> fits the window, so the tone lands in exactly one bin and every other bin is zero (the dB floor).</div>`
            : win === "none"
              ? `<div class="callout rose"><b>Leakage.</b> ${fmt(fA, 1)} cycles do not fit the window, so the DFT smears this tone across many bins. The skirts can hide a faint tone nearby.</div>`
              : `<div class="callout violet"><b>${win === "hann" ? "Hann" : "Hamming"} window.</b> The edges are tapered towards zero, so far-away skirts drop much lower, at the price of a slightly wider main peak.</div>`;
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a9-leak-1",
          q: "Set the strong tone to <b>10.0 Hz</b>, <b>No window</b> and <b>No faint tone</b>. How many of the bins 0 to 32 show energy?",
          opts: ["One: bin 10 only", "Three: bins 9, 10 and 11", "All of them, but faintly"],
          a: 0,
          why: "Exactly 10 whole cycles fit the 64-sample window, so the arrows of every other bin cancel completely. Now try 10.5 Hz: the single bin becomes a smear.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-leak-2",
          q: "Tone at <b>10.5 Hz</b>, faint tone at 3%. Switch the window from <b>None</b> to <b>Hann</b>. What changes?",
          opts: [
            "The far skirts drop a lot, so the faint tone shows, and the main peak widens a little",
            "The main peak gets narrower, and the skirts stay exactly as high as before",
            "Nothing in the spectrum, because a window only changes how the samples look",
          ],
          a: 0,
          why: "Tapering the edges removes the artificial jump at the seam, which is what caused the long skirts. The price is a wider main lobe. The faint 20 Hz bump becomes visible.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Aliasing</b> comes from sampling too slowly (fs ≤ 2 f<sub>max</sub>); <b>leakage</b> comes from a window that does not hold a whole number of cycles. They are different errors.",
            "The DFT treats the window as one period that repeats forever, so mismatched ends look like a <b>sudden jump</b>, and a jump contains every frequency.",
            "<b>Hann</b> and <b>Hamming</b> windows taper the samples to (near) zero at the edges: much lower skirts, but a wider main peak.",
            "A window cannot fix aliasing: filter the signal <b>before</b> sampling and keep fs above 2 f<sub>max</sub>.",
            "Leakage buries faint tones beside strong ones, which is the practical reason to window.",
          ],
          "Aliasing is about sampling rate, leakage is about the window: fix them in different places.",
        ),
      );
    },
  });
  L["a9-leak"] = {
    sum: "Two errors can make a spectrum lie. <b>Aliasing</b>: sampled too slowly. <b>Leakage</b>: a window that does not hold whole cycles. Windows such as Hann and Hamming tame leakage.",
    steps: [
      {
        t: "Two errors, two causes",
        b: `<p>The DFT can go wrong in two separate ways, and the fixes are not interchangeable.</p>`,
        v: table(
          ["", "Aliasing", "Leakage"],
          [
            [
              "Cause",
              "samples too far apart (fs too low)",
              "finite window: only a fixed set of frequencies is tested, but the real signal has others",
            ],
            ["Symptom", "a fast tone impersonates a slow one", "a single tone smears over several bins"],
            [
              "Fix",
              "sample faster (fs &gt; 2 f<sub>max</sub>) or low-pass filter first",
              "multiply by a window (Hann, Hamming)",
            ],
          ],
        ),
        c: {
          q: "A recording shows a 40 Hz peak that is really a 60 Hz hum sampled at 100 Hz. Which error is this?",
          o: ["Aliasing", "Leakage", "Both at once"],
          a: 0,
          why: "60 Hz is above fs/2 = 50 Hz, so it folds back to 100 − 60 = 40 Hz. That is aliasing, which no window can undo.",
        },
      },
      {
        t: "Why whole cycles matter",
        b: `<p>The DFT behaves as if your $N$ samples were <b>one period of a signal that repeats for ever</b>. If a whole number of cycles fits, the copies join smoothly. If not, the end of one copy meets the start of the next at a <b>sudden jump</b>.</p><p>A jump is not a smooth sine, so it needs lots of other frequencies to describe it. Those extra frequencies are the leakage.</p>`,
        v:
          (() => {
            const W = 460,
              H = 150,
              X = (t) => 20 + (t / 2) * (W - 40),
              Y = (v) => 75 - v * 52;
            return `<svg class="fig" viewBox="0 0 ${W} ${H}" style="max-height:150px"><path d="${Array.from(
              { length: 401 },
              (_, i) => {
                const t = (i / 400) * 2,
                  u = t % 1;
                return `${i && Math.abs(u - ((((i - 1) / 400) * 2) % 1)) < 0.5 ? "L" : "M"}${X(t).toFixed(1)} ${Y(Math.sin(TAU * 2.25 * u)).toFixed(1)}`;
              },
            ).join(
              " ",
            )}" fill="none" stroke="var(--teal)" stroke-width="2.5" class="draw"/><line x1="${X(1)}" y1="14" x2="${X(1)}" y2="${H - 22}" stroke="var(--rose)" stroke-dasharray="5 4"/><text x="${X(1) + 6}" y="26" class="fig-sub" style="fill:var(--rose);text-anchor:start">jump at the seam</text><text x="${X(0.5)}" y="${H - 6}" class="fig-sub">window 1</text><text x="${X(1.5)}" y="${H - 6}" class="fig-sub">window 2 (a copy)</text></svg>`;
          })() + cap("2¼ cycles in the window: the copy restarts at 0 just after the signal ended at its peak."),
        c: {
          q: "Which tone leaks in a window of 64 samples?",
          o: ["8 whole cycles", "8.5 cycles", "Both leak equally"],
          a: 1,
          why: "8.5 cycles leave the ends mismatched, so there is a jump at the seam. 8 whole cycles repeat seamlessly and fall in one bin.",
        },
      },
      {
        t: "Windows: Hann and Hamming",
        b: `<p>The fix is to multiply the samples by a <b>window function</b> before the DFT. It fades the signal in and out so that the two ends nearly meet at zero and the seam jump disappears.</p><p>The two common ones are the <b>Hann</b> (often written Hanning) and <b>Hamming</b> windows:</p>$$w_{\\text{Hann}}[n]=0.5-0.5\\cos\\tfrac{2\\pi n}{N-1}\\qquad w_{\\text{Hamming}}[n]=0.54-0.46\\cos\\tfrac{2\\pi n}{N-1}$$`,
        v: F.plot(
          [
            { f: () => 1, c: "dim", label: "none", dash: "5 4" },
            { f: (t) => 0.5 - 0.5 * Math.cos(TAU * t), c: "teal", label: "Hann" },
            { f: (t) => 0.54 - 0.46 * Math.cos(TAU * t), c: "violet", label: "Hamming" },
          ],
          { x: [0, 1], y: [0, 1.15], xl: "position in the window", h: 170 },
        ),
        c: {
          q: "When do you apply a window?",
          o: [
            "To the samples, before taking the DFT",
            "To the spectrum, after the DFT",
            "To the sampling clock, before recording",
          ],
          a: 0,
          why: "Multiply each sample by the window value for its position, then transform. The window shapes the data the DFT sees.",
        },
      },
      {
        t: "The trade-off",
        b: `<p>Windows are not free. Tapering the ends makes the main peak <b>wider</b> (less able to separate two close tones) but pushes the skirts (<b>side lobes</b>) <b>much lower</b>:</p>`,
        v:
          table(
            ["Window", "First side lobe", "Main peak width (bins)"],
            [
              ["None (rectangular)", "−13 dB", "2"],
              ["Hann", "−31 dB", "4"],
              { c: ["Hamming", "−43 dB", "4"], hl: true },
            ],
          ) + cap("Typical textbook values. Lower side lobe means less leakage."),
        c: {
          q: "Compared with no window, a Hann window gives…",
          o: [
            "lower side lobes but a wider main peak",
            "higher side lobes and a wider main peak",
            "lower side lobes and a narrower main peak",
          ],
          a: 0,
          why: "Everything is a trade: the taper that removes the seam jump also reduces the effective length of the data, which widens the peak.",
        },
      },
      {
        t: "Hidden neighbours",
        b: `<p>Why bother? Leakage skirts from a loud tone can <b>bury a faint tone</b> that sits nearby: the faint tone's bump is lower than the loud one's smear. A window drops the smear far below the faint bump, so it appears.</p><p>That matters for real signals such as hum under speech or a faint heartbeat component beside a strong one.</p>`,
        v: F.compare(
          {
            title: "No window",
            c: "rose",
            body:
              F.cells(
                [
                  { v: "loud", c: "blue" },
                  { v: "smear", c: "rose" },
                  { v: "faint?", c: "dim" },
                  { v: "smear", c: "rose" },
                ],
                { size: 50 },
              ) + "faint tone hidden",
          },
          {
            title: "Hann window",
            c: "teal",
            body:
              F.cells(
                [
                  { v: "loud", c: "blue" },
                  { v: "low", c: "dim" },
                  { v: "faint", c: "amber" },
                  { v: "low", c: "dim" },
                ],
                { size: 50 },
              ) + "faint tone visible",
          },
        ),
        c: {
          q: "A faint tone sits 10 bins away from a very loud one and does not show up in the spectrum. What is the likely cause and fix?",
          o: [
            "Leakage from the loud tone; apply a window",
            "Aliasing; sample faster",
            "The DFT cannot see faint tones at all",
          ],
          a: 0,
          why: "The loud tone's long skirts are higher than the faint tone. Windowing lowers the skirts. Aliasing would move tones, not hide them.",
        },
      },
      {
        t: "Aliasing needs a different cure",
        b: `<p>A window works on the samples you already have; aliasing is lost <b>before</b> the samples exist. Once a 60 Hz tone has folded onto 40 Hz it cannot be told apart from a real 40 Hz tone.</p><p>So you must prevent it: use a sample rate above <b>twice the highest frequency</b> present, and put an <b>anti-aliasing low-pass filter</b> in front of the sampler to remove anything faster.</p>`,
        v: F.flow([
          { t: "Real signal", c: "blue" },
          { t: "Low-pass filter", s: "removes > fs/2", c: "violet" },
          { t: "Sample at fs", s: "fs &gt; 2 fmax", c: "amber" },
          { t: "Window + DFT", s: "tames leakage", c: "teal" },
        ]),
        c: {
          q: "Which step removes aliasing?",
          o: [
            "Applying a Hann window after sampling is done",
            "A low-pass filter placed before the sampler",
            "Taking the inverse DFT of the whole spectrum",
          ],
          a: 1,
          why: "Aliasing happens at sampling time. Only filtering before it, or sampling faster, prevents it.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>The signal is a strong tone plus an optional faint tone at 20 Hz, in 64 samples, so bin $k$ is exactly $k$ Hz. The top picture is the windowed samples; the bottom is the spectrum (dB by default, so skirts show up).</p><p>Try 10.0 Hz first (one bin), then 10.5 Hz (a smear), then add a window.</p>`,
        v: F.cells([
          { v: "10.0", sub: "whole cycles", c: "teal" },
          "→",
          { v: "10.5", sub: "smear", c: "rose" },
          "→",
          { v: "+ Hann", sub: "skirts drop", c: "violet" },
        ]),
      },
    ],
    guide: [
      "Set the strong tone to <b>10.0 Hz</b> with <b>No window</b>. Count the bins that show energy.",
      "Move it to 10.5 Hz (leave the window off). Read the Strong tone energy-outside stat.",
      "Switch on <b>Faint 3%</b> and compare <b>No window</b>, <b>Hann</b> and <b>Hamming</b>. In which is the 20 Hz tone visible?",
      "Toggle the scale to <b>Linear</b>: why does leakage look much smaller there?",
      "Answer the questions after the demo.",
    ],
  };
})();
