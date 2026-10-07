/* js/content/algo/algo-p9-x-01.js: Phase 9 extra lessons: shared helpers and 9.1 Sines build everything. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const TAU = Math.PI * 2;
  const table = (head, rows) =>
    `<table class="t" style="max-width:700px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${[]
            .concat(r.c || r)
            .map((c) => `<td>${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</table>`;
  const mono = (s) =>
    `<div class="mono" style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:12px 16px;font-size:13.5px;line-height:1.7">${s}</div>`;
  const cap = (s) => `<div class="fig-cap">${s}</div>`;
  const r2 = (v) => {
    const t = Math.round(v * 100) / 100;
    return t === 0 ? 0 : t;
  };
  const sn = (v) => (v < 0 ? "−" : "") + Math.abs(v);
  const fc = (re, im) => {
    re = r2(re);
    im = r2(im);
    if (!im) return sn(re);
    const m = Math.abs(im) + "j";
    if (!re) return (im < 0 ? "−" : "") + m;
    return `${sn(re)} ${im < 0 ? "−" : "+"} ${m}`;
  };
  /** In-place iterative radix-2 FFT on re/im Float64Arrays (inv = inverse, scaled by 1/N). */
  function fftIP(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let b = n >> 1;
      for (; j & b; b >>= 1) j ^= b;
      j ^= b;
      if (i < j) {
        [re[i], re[j]] = [re[j], re[i]];
        [im[i], im[j]] = [im[j], im[i]];
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = ((inv ? 1 : -1) * TAU) / len;
      for (let i = 0; i < n; i += len)
        for (let k = 0; k < len / 2; k++) {
          const wr = Math.cos(ang * k),
            wi = Math.sin(ang * k),
            a = i + k,
            b = i + k + len / 2;
          const xr = re[b] * wr - im[b] * wi,
            xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr;
          im[b] = im[a] - xi;
          re[a] += xr;
          im[a] += xi;
        }
    }
    if (inv)
      for (let i = 0; i < n; i++) {
        re[i] /= n;
        im[i] /= n;
      }
  }
  /** Direct O(N²) DFT of complex input. */
  function dftC(xr, xi) {
    const n = xr.length,
      R = new Float64Array(n),
      I = new Float64Array(n);
    for (let k = 0; k < n; k++)
      for (let t = 0; t < n; t++) {
        const a = (-TAU * k * t) / n,
          c = Math.cos(a),
          s = Math.sin(a);
        R[k] += xr[t] * c - xi[t] * s;
        I[k] += xr[t] * s + xi[t] * c;
      }
    return [R, I];
  }
  const bitsRev = (x, b) => {
    let o = 0;
    for (let i = 0; i < b; i++) o |= ((x >> i) & 1) << (b - 1 - i);
    return o;
  };

  const softmax = (arr) => {
    const m = Math.max(...arr);
    const e = arr.map((x) => Math.exp(x - m));
    const s = e.reduce((a, b) => a + b);
    return e.map((x) => x / s);
  };
  const mm = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
  const tr = (A) => A[0].map((_, j) => A.map((r) => r[j]));
  const f2 = (v) => {
    const t = r2(v);
    return (t < 0 ? "−" : "") + Math.abs(t);
  };
  /** Heat colour for a value in [-1, 1]: blue for positive, red for negative. */
  const heat = (v, lim = 1) => {
    const a = Math.min(1, Math.abs(v) / lim);
    return v >= 0
      ? `rgba(28,176,246,${(0.08 + 0.7 * a).toFixed(2)})`
      : `rgba(255,75,75,${(0.08 + 0.7 * a).toFixed(2)})`;
  };
  const grid = (M, { rows = [], cols = [], lim = 1, digits = 1, hl = null } = {}) =>
    `<table class="t" style="font-size:12px;text-align:center"><tr><th></th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>${M.map((r, i) => `<tr><th>${rows[i] ?? ""}</th>${r.map((v, j) => `<td style="background:${heat(v, lim)};${hl && hl(i, j) ? "outline:2px solid var(--amber);" : ""}">${(+v).toFixed(digits)}</td>`).join("")}</tr>`).join("")}</table>`;
  /** A simplified picture of the original transformer, with some boxes highlighted. */
  const archSvg = (hl = []) => {
    const on = (id) => hl.includes(id);
    const box = (x, y, w, t, c, id) =>
      `<g class="fi"><rect x="${x}" y="${y}" width="${w}" height="26" rx="7" fill="color-mix(in srgb, ${c} ${on(id) ? 34 : 10}%, var(--panel-2))" stroke="${on(id) ? c : "var(--line-2)"}" stroke-width="${on(id) ? 2.6 : 1.4}"/><text x="${x + w / 2}" y="${y + 17}" class="fig-box" style="font-size:10.5px">${t}</text></g>`;
    const arrow = (x, y1, y2) =>
      `<path d="M${x} ${y1} L${x} ${y2}" stroke="var(--text-faint)" stroke-width="1.6" marker-end="url(#ah)"/>`;
    const Ex = 18,
      Dx = 252,
      W = 170;
    return `<svg class="fig" viewBox="0 0 440 372" style="max-height:340px"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker></defs>
      <text x="${Ex + W / 2}" y="14" class="fig-sub">Encoder (× N)</text><text x="${Dx + W / 2}" y="14" class="fig-sub">Decoder (× N)</text>
      ${box(Ex, 314, W, "Input tokens", "var(--blue)", "e0")}${arrow(Ex + W / 2, 314, 296)}
      ${box(Ex, 270, W, "Embedding + position", "var(--blue)", "e1")}${arrow(Ex + W / 2, 270, 252)}
      ${box(Ex, 226, W, "Multi-head self-attention", "var(--violet)", "e2")}${arrow(Ex + W / 2, 226, 208)}
      ${box(Ex, 182, W, "Add & Norm", "var(--amber)", "e3")}${arrow(Ex + W / 2, 182, 164)}
      ${box(Ex, 138, W, "Feed-forward network", "var(--teal)", "e4")}${arrow(Ex + W / 2, 138, 120)}
      ${box(Ex, 94, W, "Add & Norm", "var(--amber)", "e5")}
      ${box(Dx, 314, W, "Output so far (shifted)", "var(--blue)", "d0")}${arrow(Dx + W / 2, 314, 296)}
      ${box(Dx, 270, W, "Embedding + position", "var(--blue)", "d1")}${arrow(Dx + W / 2, 270, 252)}
      ${box(Dx, 226, W, "Masked self-attention", "var(--violet)", "d2")}${arrow(Dx + W / 2, 226, 208)}
      ${box(Dx, 182, W, "Cross-attention", "var(--violet)", "d3")}${arrow(Dx + W / 2, 182, 164)}
      ${box(Dx, 138, W, "Feed-forward network", "var(--teal)", "d4")}${arrow(Dx + W / 2, 138, 120)}
      ${box(Dx, 94, W, "Add & Norm (after each)", "var(--amber)", "d5")}${arrow(Dx + W / 2, 94, 76)}
      ${box(Dx, 50, W, "Linear + softmax", "var(--rose)", "d6")}${arrow(Dx + W / 2, 50, 32)}
      <text x="${Dx + W / 2}" y="26" class="fig-sub">next-word probabilities</text>
      <path d="M${Ex + W} 107 C ${Ex + W + 34} 107, ${Dx - 30} 195, ${Dx} 195" fill="none" stroke="var(--violet)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ah)"/><text x="${(Ex + W + Dx) / 2}" y="140" class="fig-sub" style="fill:var(--violet)">keys, values</text></svg>`;
  };

  reg({
    id: "a9-series",
    order: 1,
    num: "9.1",
    title: "Sines build everything",
    blurb:
      "Fourier's 1807 idea: add enough sine waves and you can draw a square wave, a saw tooth or any repeating shape.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let kind = "square",
        terms = 3;
      const NH = 30;
      const amp = (j) =>
        kind === "square"
          ? [2 * j - 1, 4 / (Math.PI * (2 * j - 1))]
          : kind === "saw"
            ? [j, ((j % 2 ? 1 : -1) * 2) / (Math.PI * j)]
            : [2 * j - 1, ((j % 2 ? 1 : -1) * 8) / (Math.PI * Math.PI * (2 * j - 1) ** 2)];
      const target = (x) => {
        if (kind === "square") return Math.sin(x) >= 0 ? 1 : -1;
        if (kind === "saw") {
          const w = ((((x + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
          return w / Math.PI;
        }
        return (2 / Math.PI) * Math.asin(Math.sin(x));
      };
      const sum = (x, T) => {
        let s = 0;
        for (let j = 1; j <= T; j++) {
          const [f, a] = amp(j);
          s += a * Math.sin(f * x);
        }
        return s;
      };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Build a shape from sine waves</h2><span class="faint">two repeats of the shape, 0 to 4π</span></div>
        <div class="controls" id="row"></div>
        <canvas class="viz" id="cv"></canvas>
        <div class="legend"><span style="--c:var(--text-faint)">target shape</span><span style="--c:var(--teal)">sum of the sine waves so far</span><span style="--c:var(--amber)">the newest sine wave added</span></div>
        <canvas class="viz" id="sp" style="margin-top:12px"></canvas>
        <div class="legend"><span style="--c:var(--blue)">bar height = how much of each frequency (amplitude)</span></div>
        <div class="stat-row"><div class="stat teal"><small>Sine waves used</small><b id="s1"></b></div><div class="stat amber"><small>Highest point of the sum</small><b id="s2"></b></div><div class="stat violet"><small>Target highest point</small><b>1</b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      const row = qs("#row", card);
      row.append(
        N.seg(
          [
            ["square", "Square wave"],
            ["saw", "Saw tooth"],
            ["tri", "Triangle"],
          ],
          kind,
          (v) => {
            kind = v;
            draw();
          },
        ),
      );
      const sl = N.slider("Sine waves added", 1, NH, 1, terms, (v) => String(v));
      sl.onInput((v) => {
        terms = v;
        draw();
      });
      row.append(sl);
      function draw() {
        const C = N.colors();
        {
          const { ctx, w, h } = N.setupCanvas(qs("#cv", card), 210);
          const padL = 30,
            padR = 8,
            X = (x) => padL + (x / (2 * TAU)) * (w - padL - padR),
            Y = (v) => h / 2 - (v * (h / 2 - 22)) / 1.3;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padL, h / 2);
          ctx.lineTo(w - padR, h / 2);
          ctx.stroke();
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "right";
          [1, 0, -1].forEach((v) => ctx.fillText(String(v), padL - 5, Y(v) + 4));
          const line = (fn, col, wd) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = wd;
            ctx.beginPath();
            for (let p = 0; p <= 800; p++) {
              const x = (p / 800) * 2 * TAU,
                y = Y(fn(x));
              p ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y);
            }
            ctx.stroke();
          };
          line(target, C.text_faint, 1.6);
          if (terms > 1) {
            const [f, a] = amp(terms);
            line((x) => a * Math.sin(f * x), C.amber, 1.2);
          }
          line((x) => sum(x, terms), C.teal, 2.6);
          ctx.lineWidth = 1;
        }
        {
          const { ctx, w, h } = N.setupCanvas(qs("#sp", card), 130);
          const padL = 30,
            padB = 22,
            maxF = kind === "saw" ? NH : 2 * NH - 1,
            bw = (w - padL - 8) / (maxF + 1);
          ctx.clearRect(0, 0, w, h);
          const hi = 1.3;
          ctx.strokeStyle = C.line;
          ctx.beginPath();
          ctx.moveTo(padL, h - padB);
          ctx.lineTo(w - 8, h - padB);
          ctx.stroke();
          for (let j = 1; j <= terms; j++) {
            const [f, a] = amp(j),
              bh = (Math.abs(a) / hi) * (h - padB - 10);
            ctx.fillStyle = j === terms && terms > 1 ? C.amber : C.blue;
            ctx.fillRect(padL + f * bw, h - padB - bh, Math.max(2, bw - 1.5), bh);
          }
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "center";
          [1, 5, 10, 20, 40, 59]
            .filter((f) => f <= maxF)
            .forEach((f) => ctx.fillText(String(f), padL + f * bw + bw / 2, h - 7));
          ctx.textAlign = "left";
          ctx.fillText("frequency (as a multiple of the first)", padL, 12);
        }
        let mx = -9;
        for (let p = 0; p <= 4000; p++) mx = Math.max(mx, sum((p / 4000) * TAU, terms));
        qs("#s1", card).textContent = terms;
        qs("#s2", card).textContent = fmt(mx, 2);
        qs("#note", card).innerHTML =
          kind === "square"
            ? terms >= 12
              ? `<div class="callout violet"><b>The overshoot never goes away.</b> Beside every jump the sum pokes about 9% of the jump size above the target, however many waves you add (the Gibbs ringing). It just gets narrower. A <i>perfect</i> square wave needs infinitely many odd sine waves.</div>`
              : `<div class="callout">Only <b>odd</b> frequencies (1, 3, 5, …) are used, and each is weaker than the last: 1, 1/3, 1/5, … of the first. Drag the slider up.</div>`
            : kind === "saw"
              ? `<div class="callout">The saw tooth uses <b>every</b> whole frequency, with amplitudes 1, 1/2, 1/3, … that alternate in sign (the bars show the sizes).</div>`
              : `<div class="callout teal">The triangle has no sharp jump, so its amplitudes fall like 1, 1/9, 1/25, … and a handful of waves is already a good fit.</div>`;
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a9-series-1",
          q: "Square wave, with 3 sine waves added. Which frequencies (as multiples of the first) are in the sum?",
          opts: ["1, 2 and 3", "1, 3 and 5", "1, 2 and 4"],
          a: 1,
          why: "A square wave is built from <b>odd</b> frequencies only: 1, 3, 5, then 7, 9, … Choose Square wave and set the slider to 3 to see three bars at 1, 3 and 5.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-series-2",
          q: "Square wave. How strong is the 3rd-frequency sine compared with the 1st?",
          opts: ["Exactly the same height", "One third as tall", "Three times as tall"],
          a: 1,
          why: "The amplitudes go 1, 1/3, 1/5, … so the sine at frequency 3 is <b>one third</b> of the first. Read it off the bar chart.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A repeating signal is a <b>weighted sum of sine waves</b>: you choose the frequencies and the weights.",
            "A <b>sine wave</b> has one frequency and no harmonics, which makes it the basic building block.",
            "A square wave needs the odd frequencies 1, 3, 5, … with weights 1, 1/3, 1/5, …, and strictly <b>infinitely many</b> of them.",
            "The same signal can be described in the <b>time domain</b> (the wiggle) or the <b>frequency domain</b> (the bar chart).",
            "Fourier proposed this in <b>1807</b>. Lagrange and Laplace did not believe it, but it turned out to be true.",
          ],
          "Any repeating shape is a recipe: a list of sine frequencies and how much of each.",
        ),
      );
    },
  });
  L["a9-series"] = {
    sum: "Fourier's big idea: any repeating signal is a <b>weighted sum of sine waves</b>. The recipe (which frequencies, how much of each) is the frequency-domain description.",
    steps: [
      {
        t: "One signal, two descriptions",
        b: `<p>Take the opening of <i>Ode to Joy</i>. You can describe it <b>in time</b>: the air pressure going up and down, note after note. Or you can describe it <b>by frequency</b>: which pitches appear, and how much of each.</p><p>Both describe the <i>same</i> sound. The second one is static: a list of pitches with weights, rather than a moving wiggle.</p>`,
        v: F.compare(
          {
            title: "Time domain",
            c: "blue",
            body:
              F.cells(["E", "E", "F", "G", "G", "F", "E", "D", "C", "C", "D", "E", "E", "D", "D"], { size: 26 }) +
              "notes in the order played",
          },
          {
            title: "Frequency domain",
            c: "teal",
            body:
              F.bars(
                [
                  ["C 261.6 Hz", 2, "blue"],
                  ["D 293.7 Hz", 4, "blue"],
                  ["E 329.6 Hz", 5, "teal"],
                  ["F 349.2 Hz", 2, "blue"],
                  ["G 392.0 Hz", 2, "blue"],
                ],
                { max: 5, fmt: (v) => v + "×" },
              ) + "which pitches, and how often",
          },
        ),
        c: {
          q: "In the frequency-domain bar chart, what does the height of the bar for E tell you?",
          o: [
            "How loud the very first note of the tune is",
            "How much of the tune is made of that pitch",
            "How many seconds the whole tune lasts for",
          ],
          a: 1,
          why: 'Each bar answers "how much of this frequency is in the signal?" The order of the notes lives in the time domain.',
        },
      },
      {
        t: "What is frequency?",
        b: `<p><b>Frequency</b> is how many cycles happen per second, measured in hertz (Hz). One cycle lasts the <b>period</b> $T = 1/f$ seconds. Concert A is 440 Hz, so one cycle lasts about 2.3 milliseconds.</p><p>A <b>sine wave</b> has exactly one frequency. It is a single pure tone, with no harmonics (no higher notes mixed in).</p>`,
        v: F.plot(
          [
            { f: (t) => Math.sin(TAU * t), c: "blue", label: "1 Hz" },
            { f: (t) => Math.sin(TAU * 2 * t), c: "teal", label: "2 Hz" },
            { f: (t) => Math.sin(TAU * 4 * t), c: "amber", label: "4 Hz" },
          ],
          { x: [0, 1], y: [-1.3, 1.3], xl: "one second" },
        ),
        c: {
          q: "A tone has a frequency of 4 Hz. How long does one cycle last?",
          o: ["4 seconds", "0.25 seconds", "0.4 seconds"],
          a: 1,
          hint: "The period is 1 divided by the frequency.",
          why: "$T = 1/f = 1/4 = 0.25$ s. Four of them fit into one second.",
        },
      },
      {
        t: 'Fourier\'s "crazy idea" (1807)',
        b: `<p>Jean-Baptiste Joseph Fourier claimed that <b>any periodic function can be rewritten as a weighted sum of sines</b> of different frequencies, and he gave a method for finding the weights.</p><p>Lagrange, Laplace and Poisson did not believe it. His work was not translated into English until 1878. But it was true, and it became one of the most useful tools in engineering and computing.</p>`,
        v: F.flow([
          { t: "Repeating signal", c: "blue" },
          { t: "Find weights", s: "how much of each", c: "violet" },
          { t: "Sum of sines", s: "weight × sine", c: "teal" },
        ]),
        c: {
          q: "What exactly does Fourier's idea say you can write as a sum of sines?",
          o: ["Any periodic signal", "Only signals that already look like a sine", "Only signals with no sudden jumps"],
          a: 0,
          why: "Periodic is the only requirement. Even a square wave with sharp jumps works, as the next step shows.",
        },
      },
      {
        t: "A square wave from odd sines",
        b: `<p>How many sine waves does a perfect square wave need? Strictly, <b>infinitely many</b>.</p><p>The first is a plain sine. Then add one at <b>three times</b> the frequency with a third of the height, then one at five times with a fifth, and so on. Each new wave sharpens the corners.</p><span class="key">Square wave $= \\tfrac{4}{\\pi}\\left(\\sin x + \\tfrac{1}{3}\\sin 3x + \\tfrac{1}{5}\\sin 5x + \\cdots\\right)$</span>`,
        v:
          F.bars(
            [
              ["1× (first)", 1, "teal"],
              ["3×", 1 / 3, "blue"],
              ["5×", 1 / 5, "violet"],
              ["7×", 1 / 7, "amber"],
              ["9×", 1 / 9, "rose"],
            ],
            { max: 1, fmt: (v) => v.toFixed(2) },
          ) + cap("Relative heights of the sine waves in a square wave. Only odd multiples appear."),
        c: {
          q: "Which sine frequencies appear in a square wave?",
          o: [
            "Every whole multiple: 1, 2, 3, 4, …",
            "Only the odd multiples: 1, 3, 5, 7, …",
            "Only powers of two: 1, 2, 4, 8, …",
          ],
          a: 1,
          why: "The even multiples all cancel out, thanks to the symmetry of the square wave. You can see this in the bar chart.",
        },
      },
      {
        t: "Why we need two numbers per frequency",
        b: `<p>A sine of a given frequency can also be <b>shifted in time</b> (its <b>phase</b>). So each frequency needs two numbers: how big it is (<b>amplitude</b>) and how far it is shifted (<b>phase</b>).</p><p>The transform packs both into one <b>complex number</b>: its length is the amplitude and its angle is the phase. That is why the DFT outputs are complex, even for a real signal.</p>`,
        v:
          `<svg class="fig" viewBox="0 0 260 190" style="max-height:190px"><circle cx="90" cy="100" r="70" fill="none" stroke="var(--line)"/><line x1="10" y1="100" x2="180" y2="100" stroke="var(--line-2)"/><line x1="90" y1="20" x2="90" y2="180" stroke="var(--line-2)"/><line x1="90" y1="100" x2="146" y2="52" stroke="var(--teal)" stroke-width="4" class="draw"/><path d="M122 100 A32 32 0 0 0 117 80" fill="none" stroke="var(--amber)" stroke-width="3"/><text x="130" y="94" class="fig-sub" style="fill:var(--amber)">phase</text><text x="150" y="44" class="fig-sub" style="fill:var(--teal)">length = amplitude</text></svg>` +
          cap("One complex number: its length says how much, its angle says where in the cycle."),
        c: {
          q: "Two sines have the same frequency and height, but one is delayed by a quarter of a cycle. What differs?",
          o: ["The amplitude", "The phase", "The frequency"],
          a: 1,
          why: "A delay changes only the phase. The pitch (frequency) and loudness (amplitude) are unchanged.",
        },
      },
      {
        t: "Dynamic in time, static in frequency",
        b: `<p>Waves on the sea, stock prices, cars on a road and earthquake tremors are all dynamic: they keep changing, which makes them hard to capture. In the frequency domain the same signals become a <b>fixed set of bars</b>. A moving wiggle turns into a still picture.</p><p>That is the whole point of the transform: look at the signal in the domain where the pattern stands still.</p>`,
        v: F.compare(
          {
            title: "Time domain",
            c: "blue",
            body:
              F.plot([{ f: (t) => Math.sin(TAU * 3 * t) + 0.5 * Math.sin(TAU * 8 * t), c: "blue" }], {
                x: [0, 1],
                y: [-1.8, 1.8],
                h: 130,
              }) + "always moving",
          },
          {
            title: "Frequency domain",
            c: "teal",
            body:
              F.bars(
                [
                  ["3 Hz", 1, "teal"],
                  ["8 Hz", 0.5, "violet"],
                ],
                { max: 1, fmt: () => "" },
              ) + "two still bars",
          },
        ),
      },
      {
        t: "Reading the playground",
        b: `<p>Pick a shape and drag <b>Sine waves added</b>. The top picture shows the target (grey), the running sum (green) and the newest wave (orange). The bottom bars show the recipe: one bar per frequency.</p><p>Watch the highest point of the sum on a square wave: it never settles at 1, because of the overshoot at each jump.</p>`,
        v: F.cells([
          { v: "1 wave", sub: "a sine", c: "blue" },
          "→",
          { v: "3 waves", sub: "a rough square", c: "teal" },
          "→",
          { v: "30 waves", sub: "nearly square", c: "violet" },
          "→",
          { v: "∞", sub: "exact", c: "amber" },
        ]),
      },
    ],
    guide: [
      "Pick <b>Square wave</b> and drag <b>Sine waves added</b> from 1 up to 30. Watch the sum approach the target.",
      "Look at the bars: where are they? Match them to the pattern 1, 3, 5, … with heights 1, 1/3, 1/5.",
      "At 12 or more waves, find the overshoot beside each jump. Does it go away as you add more?",
      "Try <b>Saw tooth</b> and <b>Triangle</b>. Which one needs the fewest waves to look right, and why?",
      "Answer the questions after the demo.",
    ],
  };

  Object.assign(shared, {
    table,
    mono,
    cap,
    r2,
    sn,
    fc,
    fftIP,
    dftC,
    bitsRev,
    softmax,
    mm,
    tr,
    f2,
    heat,
    grid,
    archSvg,
    TAU,
  });
})();
