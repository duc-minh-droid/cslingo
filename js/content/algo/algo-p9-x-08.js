/* js/content/algo/algo-p9-x-08.js: Phase 9 extra lessons (overflow): 9.7 The recursive FFT in code. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 9, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, mono, fc, dftC, TAU } = shared;
  const PSEUDO = [
    "if N = 1: return x",
    "w ← 1,  W_N ← e^(−2πj/N)",
    "x_even ← x[0], x[2], …;  x_odd ← x[1], x[3], …",
    "y_even ← RecursiveFFT(x_even)",
    "y_odd ← RecursiveFFT(x_odd)",
    "for k ← 0 to N/2 − 1:",
    "    y[k] ← y_even[k] + w · y_odd[k]",
    "    y[k + N/2] ← y_even[k] − w · y_odd[k]",
    "    w ← w · W_N",
    "return y",
  ];
  const cadd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
    csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
  const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  const cs = (z) => fc(z.re, z.im);
  /** The workshop's recursive FFT on complex objects, returning the spectrum (used by the benchmark). */
  function recFFT(x) {
    const n = x.length;
    if (n === 1) return x;
    const ye = recFFT(x.filter((_, i) => i % 2 === 0)),
      yo = recFFT(x.filter((_, i) => i % 2 === 1)),
      y = new Array(n);
    let w = { re: 1, im: 0 };
    const WN = { re: Math.cos(-TAU / n), im: Math.sin(-TAU / n) };
    for (let k = 0; k < n / 2; k++) {
      const t = cmul(w, yo[k]);
      y[k] = cadd(ye[k], t);
      y[k + n / 2] = csub(ye[k], t);
      w = cmul(w, WN);
    }
    return y;
  }

  function recRun(box, life) {
    const x = [1, 2, 3, 4];
    const cell = (txt, col, k) =>
      `<span class="rf-c" ${k !== undefined ? `data-k="${k}"` : ""} style="display:inline-block;min-width:46px;text-align:center;padding:3px 7px;margin:2px 3px 2px 0;border:2px solid ${col || "var(--line-2)"};border-radius:9px;background:var(--panel-2);font:800 12.5px var(--sans)">${txt}</span>`;
    function* frames() {
      const stack = [];
      const snap = (o) => ({
        stack: stack.map((c) => ({
          ...c,
          x: c.x.slice(),
          ye: c.ye && c.ye.slice(),
          yo: c.yo && c.yo.slice(),
          y: c.y && c.y.slice(),
        })),
        ...o,
      });
      function* rec(a) {
        const n = a.length,
          d = stack.length,
          call = { n, d, x: a.map(cs), ye: null, yo: null, y: null, k: null, w: null, cur: "x" };
        stack.push(call);
        yield snap({
          line: 0,
          cap:
            n === 1
              ? `<b>RecursiveFFT with N = 1</b>: a one-sample DFT is the sample itself, so return it.`
              : `<b>RecursiveFFT(N = ${n})</b> is called with ${a.map(cs).join(", ")}.`,
        });
        if (n === 1) {
          stack.pop();
          return a;
        }
        const xe = a.filter((_, i) => i % 2 === 0),
          xo = a.filter((_, i) => i % 2 === 1);
        yield snap({
          line: 2,
          cap: `Split into x_even = ${xe.map(cs).join(", ")} and x_odd = ${xo.map(cs).join(", ")}.`,
          ask:
            d === 0
              ? {
                  q: "The first thing the top call does is split its samples. Which samples go into <b>x_even</b>? Tap one of them.",
                  pick: ".rf-top",
                  a: ["0", "2"],
                  why: "<b>Even indices</b> 0 and 2 (values 1 and 3) go to x_even; indices 1 and 3 go to x_odd. That is the decimation in time.",
                }
              : null,
        });
        const ye = yield* rec(xe);
        call.ye = ye.map(cs);
        yield snap({ line: 3, cap: `Back in N = ${n}: <b>y_even</b> = ${ye.map(cs).join(", ")}.` });
        const yo = yield* rec(xo);
        call.yo = yo.map(cs);
        yield snap({ line: 4, cap: `<b>y_odd</b> = ${yo.map(cs).join(", ")}. Now combine them with the twiddle w.` });
        const y = new Array(n).fill(null),
          WN = { re: Math.cos(-TAU / n), im: Math.sin(-TAU / n) };
        call.y = Array(n).fill("");
        let w = { re: 1, im: 0 };
        for (let k = 0; k < n / 2; k++) {
          const t = cmul(w, yo[k]);
          y[k] = cadd(ye[k], t);
          y[k + n / 2] = csub(ye[k], t);
          call.k = k;
          call.w = cs(w);
          call.y[k] = cs(y[k]);
          call.y[k + n / 2] = cs(y[k + n / 2]);
          yield snap({
            line: 6,
            cap: `k = ${k}, w = <b>${cs(w)}</b>. w·y_odd[${k}] = ${cs(t)}. So y[${k}] = ${cs(y[k])} and y[${k + n / 2}] = ${cs(y[k + n / 2])}.`,
          });
          w = cmul(w, WN);
        }
        call.k = null;
        yield snap({
          line: 9,
          cap:
            n === 4
              ? `<b>Done:</b> y = ${y.map(cs).join(", ")}. It equals the direct DFT.`
              : `Return y = ${y.map(cs).join(", ")} to the caller.`,
          mood: n === 4 ? "love" : undefined,
        });
        stack.pop();
        return y;
      }
      yield* rec(x.map((v) => ({ re: v, im: 0 })));
    }
    F.run(box, life, {
      code: PSEUDO,
      build(stage, api) {
        stage.style.minHeight = "340px";
        const host = el(`<div class="rf-host" style="display:grid;gap:8px"></div>`);
        stage.appendChild(host);
        return { host, api };
      },
      frames,
      draw(s, f) {
        s.host.innerHTML = f.stack
          .map((c) => {
            const top = c.d === 0;
            const hl = f.stack.length - 1 === c.d;
            const row = (lbl, arr, col, pickable) =>
              arr
                ? `<div style="display:flex;align-items:center;flex-wrap:wrap"><span style="width:62px;font:800 11.5px var(--sans);color:var(--text-faint)">${lbl}</span>${arr.map((t, i) => cell(t === "" ? "·" : t, col && c.k !== null && (i === c.k || i === c.k + c.n / 2) ? "var(--teal)" : col === "y" ? "var(--line-2)" : "", pickable ? i : undefined).replace('class="rf-c"', `class="rf-c ${pickable ? "rf-top" : ""}"`)).join("")}</div>`
                : "";
            return `<div style="margin-left:${Math.min(c.d, 3) * 18}px;border:2px solid ${hl ? "var(--blue)" : "var(--line)"};border-radius:12px;padding:6px 10px;background:var(--panel)"><div style="font:900 12.5px var(--sans);margin-bottom:2px">RecursiveFFT(N = ${c.n})${c.w !== null ? ` &nbsp; <span style="color:var(--amber)">w = ${c.w}</span>` : ""}</div>${row("x", c.x, null, top)}${row("y_even", c.ye)}${row("y_odd", c.yo)}${row("y", c.y, "y")}</div>`;
          })
          .join("");
      },
    });
  }

  reg({
    id: "a9-fftcode",
    order: 7,
    num: "9.7",
    title: "The recursive FFT in code",
    blurb: "The workshop's pseudocode run for real, and a stopwatch race between the direct DFT and the FFT.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card =
        el(`<div class="card"><div class="card-head"><h2>Stopwatch: direct DFT vs recursive FFT</h2><span class="faint">both run live in your browser</span></div>
        <div class="controls"><button class="btn primary" id="go">Run the timing test</button><span class="faint" id="st">N = 16 up to 2048, each averaged over repeats</span></div>
        <canvas class="viz" id="cv"></canvas>
        <div class="legend"><span style="--c:var(--rose)">direct DFT (N² work)</span><span style="--c:var(--teal)">recursive FFT (N log N work)</span></div>
        <div id="tb"></div><div class="stat-row"><div class="stat amber"><small>Largest difference between the two results</small><b id="er">–</b></div><div class="stat teal"><small>FFT speed-up at N = 2048</small><b id="sp">–</b></div></div></div>`);
      root.appendChild(card);
      const res = [];
      function draw() {
        const C = N.colors();
        const { ctx, w, h } = N.setupCanvas(qs("#cv", card), 230);
        ctx.clearRect(0, 0, w, h);
        const padL = 46,
          padB = 28,
          padT = 12,
          padR = 12;
        ctx.fillStyle = C.text_faint;
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        if (!res.length) {
          ctx.fillText("Press the button to time both programs", w / 2, h / 2);
          return;
        }
        const lo = -3.5,
          hi = Math.max(1, Math.log10(Math.max(...res.map((r) => r.d))) + 0.3);
        const X = (i) => padL + (i / (res.length - 1 || 1)) * (w - padL - padR),
          Y = (ms) => padT + (1 - (Math.log10(Math.max(ms, 1e-4)) - lo) / (hi - lo)) * (h - padT - padB);
        ctx.strokeStyle = C.line;
        ctx.textAlign = "right";
        [-3, -2, -1, 0, 1, 2]
          .filter((e) => e < hi)
          .forEach((e) => {
            const y = Y(10 ** e);
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(w - padR, y);
            ctx.stroke();
            ctx.fillText(e >= 0 ? 10 ** e + " ms" : (10 ** e).toFixed(-e) + " ms", padL - 5, y + 4);
          });
        ctx.textAlign = "center";
        res.forEach((r, i) => ctx.fillText("N=" + r.n, X(i), h - 9));
        [
          ["d", C.rose],
          ["f", C.teal],
        ].forEach(([key, col]) => {
          ctx.strokeStyle = col;
          ctx.fillStyle = col;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          res.forEach((r, i) => (i ? ctx.lineTo(X(i), Y(r[key])) : ctx.moveTo(X(i), Y(r[key]))));
          ctx.stroke();
          res.forEach((r, i) => {
            ctx.beginPath();
            ctx.arc(X(i), Y(r[key]), 3.2, 0, 7);
            ctx.fill();
          });
        });
        ctx.lineWidth = 1;
      }
      qs("#go", card).onclick = async () => {
        const btn = qs("#go", card);
        btn.disabled = true;
        res.length = 0;
        let maxErr = 0;
        for (let k = 4; k <= 11; k++) {
          qs("#st", card).textContent = `timing N = ${2 ** k} …`;
          await new Promise((r) => setTimeout(r, 20));
          const n = 2 ** k,
            xr = Float64Array.from({ length: n }, (_, i) => Math.sin(i * 0.37) + 0.5 * Math.cos(i * 1.3)),
            xi = new Float64Array(n);
          const cx = Array.from(xr, (v) => ({ re: v, im: 0 }));
          let rd = Math.max(1, Math.floor(3e5 / (n * n))),
            t0 = performance.now(),
            D;
          for (let i = 0; i < rd; i++) D = dftC(xr, xi);
          const d = (performance.now() - t0) / rd;
          let rf = Math.max(1, Math.floor(1e5 / (n * k))),
            Y;
          t0 = performance.now();
          for (let i = 0; i < rf; i++) Y = recFFT(cx);
          const f = (performance.now() - t0) / rf;
          for (let i = 0; i < n; i++) maxErr = Math.max(maxErr, Math.hypot(D[0][i] - Y[i].re, D[1][i] - Y[i].im));
          res.push({ n, d, f });
          draw();
        }
        const last = res[res.length - 1];
        qs("#tb", card).innerHTML =
          `<table class="t" style="max-width:520px"><tr><th>N</th><th>direct DFT (ms)</th><th>FFT (ms)</th><th>ratio</th></tr>${res.map((r) => `<tr><td>${r.n}</td><td>${r.d.toFixed(r.d < 1 ? 3 : 1)}</td><td>${r.f.toFixed(r.f < 1 ? 3 : 2)}</td><td>${(r.d / r.f).toFixed(0)}×</td></tr>`).join("")}</table>`;
        qs("#er", card).textContent = maxErr.toExponential(1);
        qs("#sp", card).textContent = "≈ " + Math.round(last.d / last.f) + "×";
        qs("#st", card).textContent = "done. Your computer's exact times will differ; the shapes will not.";
        btn.disabled = false;
      };
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a9-fftcode-1",
          q: "In your timing plot, N doubles at every step. How do the two lines behave as N grows?",
          opts: [
            "The direct DFT line climbs much more steeply, so the gap keeps widening",
            "Both climb at the same rate, so the gap between them stays constant",
            "The FFT line climbs more steeply because it makes recursive calls",
          ],
          a: 0,
          why: "Each doubling multiplies the direct DFT's work by 4 but the FFT's by only a little over 2. The ratio at N = 2048 is already in the hundreds.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-fftcode-2",
          q: "RecursiveFFT is called with N = 6 samples. What goes wrong?",
          opts: [
            "6 splits into two lists of 3, and 3 into 2 and 1, which cannot be paired",
            "Nothing goes wrong: it works for any even N and returns six correct values",
            "It works, but only as slowly as the direct DFT, with no saving at all",
          ],
          a: 0,
          why: "The halving only reaches size 1 cleanly when N is a <b>power of two</b>. At an odd length the even and odd halves have different sizes, so the butterfly loop (which writes y[k] and y[k + N/2]) leaves entries unfilled. Pad the data to the next power of two instead.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "RecursiveFFT: <b>return x if N = 1</b>; split into even and odd samples; recurse on both; then combine with <code>y[k] = ye[k] + w·yo[k]</code> and <code>y[k+N/2] = ye[k] − w·yo[k]</code>, updating <code>w ← w·W_N</code>.",
            "N must be a <b>power of two</b>, otherwise the halving fails (pad with zeros).",
            "The call tree has <b>2N − 1</b> calls and depth log₂N + 1; every level does about N work.",
            "To benchmark, time each program for a range of N and plot elapsed time against N. The direct DFT's curve bends up like N², the FFT's like N log N.",
            "Check any FFT against the direct DFT (max difference ≈ 10⁻¹⁰) and the round trip ifft(fft(x)) ≈ x.",
          ],
          "The pseudocode is ten lines; the whole speed-up comes from calling itself on halves.",
        ),
      );
    },
  });
  L["a9-fftcode"] = {
    sum: "The workshop's <b>RecursiveFFT</b>: return at N = 1, split even and odd, recurse, then combine with butterflies. Time it against the direct DFT to see N² versus N log N.",
    steps: [
      {
        t: "The pseudocode",
        b: `<p>The workshop gives the algorithm in ten lines. The input $x$ has $N$ samples, with $N$ a power of two, and the output $y$ is its spectrum.</p>`,
        v: mono(
          PSEUDO.map(
            (l, i) =>
              `<span style="color:var(--text-faint)">${String(i + 1).padStart(2)}</span>&ensp;${l.replace(/ /g, "&nbsp;")}`,
          ).join("<br>"),
        ),
        c: {
          q: "What does RecursiveFFT return when N = 1?",
          o: [
            "The input unchanged: a one-sample DFT is the sample itself",
            "Zero, because there is no frequency to measure",
            "An error, because it cannot split a single sample",
          ],
          a: 0,
          why: "This base case stops the recursion. The DFT of one number is that number.",
        },
      },
      {
        t: "Split, then recurse",
        b: `<p>Lines 3 to 5: build $x_{\\text{even}}=(x_0,x_2,\\dots,x_{N-2})$ and $x_{\\text{odd}}=(x_1,x_3,\\dots,x_{N-1})$ (in Python: <code>x[0::2]</code> and <code>x[1::2]</code>), and call the same function on each. The size halves every time, so after $\\log_2 N$ levels only single samples remain.</p>`,
        v:
          F.cells(
            [0, 1, 2, 3, 4, 5, 6, 7].map((v) => ({ v, c: v % 2 ? "amber" : "teal" })),
            { label: "x (N = 8)" },
          ) +
          F.cells(
            [0, 2, 4, 6].map((v) => ({ v, c: "teal" })),
            { label: "x_even" },
          ) +
          F.cells(
            [1, 3, 5, 7].map((v) => ({ v, c: "amber" })),
            { label: "x_odd" },
          ),
        c: {
          q: "N = 8. Which indices does x_odd hold?",
          o: ["1, 3, 5, 7", "4, 5, 6, 7", "1, 2, 3, 4"],
          a: 0,
          why: "Odd positions, not the second half. (Splitting into first half and second half is a different algorithm.)",
        },
      },
      {
        t: "Combine with the twiddle",
        b: `<p>Lines 6 to 9 run a loop for $k=0$ to $N/2-1$. Each pass fills <b>two</b> outputs from one multiplication:</p>$$y_k=y^{\\text{even}}_k+w\\,y^{\\text{odd}}_k\\qquad y_{k+N/2}=y^{\\text{even}}_k-w\\,y^{\\text{odd}}_k$$<p>and then turns $w$ by one more step: $w\\leftarrow w\\,W_N$, starting from $w=1$ (so $w=W_N^{k}$ in pass $k$).</p>`,
        v: `<svg class="fig" viewBox="0 0 360 170" style="max-height:170px"><g class="fi"><circle cx="50" cy="45" r="16" fill="var(--panel-2)" stroke="var(--teal)" stroke-width="2"/><text x="50" y="50" class="fig-n">ye</text></g><g class="fi"><circle cx="50" cy="125" r="16" fill="var(--panel-2)" stroke="var(--amber)" stroke-width="2"/><text x="50" y="130" class="fig-n">yo</text></g><path d="M66 45 L290 45 M66 125 L290 125 M66 45 L290 125 M66 125 L290 45" stroke="var(--line-2)" stroke-width="2" fill="none" class="draw"/><rect x="150" y="113" width="42" height="24" rx="6" fill="var(--violet-dim)" stroke="var(--violet)"/><text x="171" y="130" class="fig-sub" style="fill:var(--violet)">×w</text><g class="fi"><text x="298" y="50" class="fig-box" style="text-anchor:start">y[k]</text><text x="298" y="130" class="fig-box" style="text-anchor:start">y[k+N/2]</text></g></svg>`,
        c: {
          q: "Why does the loop only run up to N/2 − 1?",
          o: [
            "Each pass writes two outputs, y[k] and y[k + N/2]",
            "The upper half of the spectrum is thrown away",
            "w becomes 0 after N/2 passes",
          ],
          a: 0,
          why: "N/2 passes × 2 outputs per pass = all N outputs.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>The real algorithm on $x=[1,2,3,4]$. Step with the arrows or press play: calls stack up on the left (the blue box is the active call), results return to the right place and the loop combines them.</p><p>It will pause once and ask you a prediction.</p>`,
        v: (box, life) => recRun(box, life),
      },
      {
        t: "Counting the calls",
        b: `<p>The recursion makes one call for the whole problem, 2 for the halves, 4 for the quarters, and so on, down to $N$ calls of size 1: a total of $1+2+4+\\dots+N = 2N-1$ calls. The depth is $\\log_2 N + 1$. Each level of the tree does about $N$ units of combining work, which is where $O(N\\log N)$ comes from.</p>`,
        v: table(
          ["N", "calls (2N − 1)", "levels (log₂ N + 1)"],
          [
            ["4", "7", "3"],
            ["8", "15", "4"],
            ["1,024", "2,047", "11"],
          ],
        ),
        c: {
          q: "How many RecursiveFFT calls are made in total for N = 8?",
          o: ["8", "15", "24"],
          a: 1,
          why: "1 + 2 + 4 + 8 = 15 = 2·8 − 1.",
        },
      },
      {
        t: "Workshop task 1: race the library",
        b: `<p>The first workshop task is to implement this algorithm and <b>compare its speed with the language's built-in FFT</b>: run each for a range of numbers of observations $N$ and plot elapsed time against $N$.</p><p>Expect the library (compiled code) to win by a constant factor, but <b>both</b> curves should have the N log N shape. If you add the direct DFT, its curve bends away upwards like $N^2$.</p>`,
        v: F.plot(
          [
            { f: (k) => Math.log10(4 ** k), c: "rose", label: "N² (direct)" },
            { f: (k) => Math.log10(2 ** k * k), c: "teal", label: "N log₂ N (FFT)" },
          ],
          { x: [3, 14], y: [0, 9], xl: "log₂ N", yl: "log₁₀(operations)", h: 190 },
        ),
        c: {
          q: "On a plot of time against N, how do you tell an N log N program from an N² program?",
          o: [
            "N² time quadruples per doubling; N log N barely more than doubles",
            "N log N programs are always faster, even for the smallest N",
            "N² programs use far more memory, which makes the curve look different",
          ],
          a: 0,
          why: "Compare ratios as N doubles. Constant factors can hide the difference at small N, but never at large N.",
        },
      },
      {
        t: "Trust, but verify",
        b: `<p>An FFT bug can look plausible, so check it:</p><p><b>1.</b> Compare with the direct DFT: the largest difference should be around $10^{-10}$ (rounding only). <b>2.</b> Round trip: the inverse of the FFT gives back $x$. <b>3.</b> Known answers: an impulse gives a flat spectrum, a constant gives one spike at bin 0.</p>`,
        v: table(
          ["Input x (N = 8)", "Expected spectrum"],
          [
            ["[1, 0, 0, 0, 0, 0, 0, 0]", "all eight bins equal 1"],
            ["[1, 1, 1, 1, 1, 1, 1, 1]", "bin 0 is 8, every other bin 0"],
            ["[1, −1, 1, −1, 1, −1, 1, −1]", "bin 4 is 8, every other bin 0"],
          ],
        ),
        c: {
          q: "Your FFT of an impulse [1, 0, 0, 0, 0, 0, 0, 0] gives bin 0 = 1 and all other bins 0. What does that tell you?",
          o: [
            "There is a bug: an impulse should give a flat spectrum of ones",
            "It is correct, since the impulse is only at position 0",
            "It is correct, since the output should look like the input",
          ],
          a: 0,
          why: "An impulse contains every frequency equally, so each bin is 1. A spectrum equal to the input means the transform did nothing.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Press <b>Run the timing test</b>. It runs a direct $O(N^2)$ DFT and the recursive FFT above on the same data for $N=16$ to 2048, checks they agree, and plots time (log scale, so both fit). The gap between the lines widens with $N$.</p>`,
        v: F.cells([
          { v: "N = 16", sub: "tiny gap", c: "blue" },
          "→",
          { v: "N = 256", sub: "gap grows", c: "violet" },
          "→",
          { v: "N = 2048", sub: "hundreds ×", c: "rose" },
        ]),
      },
    ],
    guide: [
      "Press <b>Run the timing test</b> and wait a few seconds for the lines to appear.",
      "Read the ratio column: how does it change as N doubles?",
      "Check the largest difference stat. Why is it not exactly zero?",
      "Answer the questions after the demo.",
    ],
  };
})();
