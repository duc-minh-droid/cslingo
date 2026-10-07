/* js/content/algo/algo-p9-x-07.js: Phase 9 extra lessons (overflow): 9.5 Editing a signal in frequency. */
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
    id: "a9-filter",
    order: 5,
    num: "9.5",
    title: "Editing a signal in frequency",
    blurb: "Transform, delete the bins you do not want, transform back: notch out a hum, smooth noise, or compress.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const NS = 128,
        HUM = 15,
        SLOW = 3;
      let seed = 7;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      const noise = Array.from({ length: NS }, () => rnd() + rnd() + rnd() - 1.5); // roughly bell shaped, mean 0
      let mode = "notch",
        cut = 8,
        topK = 4,
        noiseAmp = 0.3,
        humOn = true,
        mirror = true;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Spectrum surgery</h2><span class="faint">N = 128 samples: a slow 3-cycle wave, a 15-cycle hum, and noise</span></div>
        <div class="controls" id="r1"></div><div class="controls" id="r2"></div>
        <canvas class="viz" id="tm"></canvas>
        <div class="legend"><span style="--c:var(--text-faint)">original (noisy) signal</span><span style="--c:var(--teal)">after editing the spectrum</span></div>
        <canvas class="viz" id="sp" style="margin-top:12px"></canvas>
        <div class="legend"><span style="--c:var(--blue)">kept bins</span><span style="--c:var(--rose)">deleted bins</span></div>
        <div class="stat-row"><div class="stat teal"><small>Energy kept</small><b id="s1"></b></div><div class="stat amber"><small>Imaginary leftover</small><b id="s2"></b></div><div class="stat violet"><small>Bins deleted</small><b id="s3"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      const r1 = qs("#r1", card),
        r2 = qs("#r2", card);
      r1.append(
        N.seg(
          [
            ["off", "No edit"],
            ["notch", "Notch out the hum"],
            ["low", "Low-pass"],
            ["high", "High-pass"],
            ["top", "Keep the top K"],
          ],
          mode,
          (v) => {
            mode = v;
            draw();
          },
        ),
      );
      const sc = N.slider("Cut-off bin", 1, 60, 1, cut, (v) => String(v));
      sc.onInput((v) => {
        cut = v;
        draw();
      });
      const sk = N.slider("K bins kept", 1, 20, 1, topK, (v) => String(v));
      sk.onInput((v) => {
        topK = v;
        draw();
      });
      const sn2 = N.slider("Noise", 0, 0.6, 0.05, noiseAmp, (v) => fmt(v, 2));
      sn2.onInput((v) => {
        noiseAmp = v;
        draw();
      });
      const mi = el(
        `<label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" checked> Delete the mirror bin N−k too</label>`,
      );
      qs("input", mi).onchange = (e) => {
        mirror = e.target.checked;
        draw();
      };
      r2.append(sc, sk, sn2, mi);
      function draw() {
        const C = N.colors();
        const x = Array.from(
          { length: NS },
          (_, n) =>
            Math.sin((TAU * SLOW * n) / NS) + (humOn ? 0.6 * Math.sin((TAU * HUM * n) / NS) : 0) + noiseAmp * noise[n],
        );
        const re = Float64Array.from(x),
          im = new Float64Array(NS);
        fftIP(re, im, false);
        const mag = Array.from({ length: NS }, (_, k) => Math.hypot(re[k], im[k]));
        const keep = new Array(NS / 2 + 1).fill(true);
        if (mode === "notch") keep[HUM] = false;
        if (mode === "low") for (let k = cut + 1; k <= NS / 2; k++) keep[k] = false;
        if (mode === "high") for (let k = 0; k < cut; k++) keep[k] = false;
        if (mode === "top") {
          const idx = keep.map((_, k) => k).sort((a, b) => mag[b] - mag[a]);
          keep.fill(false);
          idx.slice(0, topK).forEach((k) => (keep[k] = true));
        }
        const full = new Array(NS).fill(true);
        for (let k = 0; k <= NS / 2; k++) {
          full[k] = keep[k];
          if (k > 0 && k < NS / 2) full[NS - k] = mirror ? keep[k] : true;
        }
        const er = Float64Array.from(re),
          ei = Float64Array.from(im);
        for (let k = 0; k < NS; k++)
          if (!full[k]) {
            er[k] = 0;
            ei[k] = 0;
          }
        fftIP(er, ei, true);
        {
          const { ctx, w, h } = N.setupCanvas(qs("#tm", card), 190);
          const padL = 30,
            X = (n) => padL + (n / (NS - 1)) * (w - padL - 8),
            Y = (v) => h / 2 - (v * (h / 2 - 14)) / 2.2;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padL, h / 2);
          ctx.lineTo(w - 8, h / 2);
          ctx.stroke();
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "right";
          [2, 0, -2].forEach((v) => ctx.fillText(String(v), padL - 5, Y(v) + 4));
          const path = (arr, col, wd) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = wd;
            ctx.beginPath();
            arr.forEach((v, n) => (n ? ctx.lineTo(X(n), Y(v)) : ctx.moveTo(X(n), Y(v))));
            ctx.stroke();
          };
          path(x, C.text_faint, 1.2);
          path(Array.from(er), C.teal, 2.6);
          ctx.lineWidth = 1;
          ctx.fillStyle = C.text_faint;
          ctx.textAlign = "left";
          ctx.fillText("sample n (0 to 127)", padL, h - 4);
        }
        {
          const { ctx, w, h } = N.setupCanvas(qs("#sp", card), 170);
          const padL = 30,
            padB = 22,
            padT = 10,
            X = (k) => padL + (k / 64) * (w - padL - 8),
            bw = (w - padL - 8) / 65,
            hi = Math.max(...mag.slice(0, 65), 1e-9);
          ctx.clearRect(0, 0, w, h);
          for (let k = 0; k <= 64; k++) {
            const bh = (mag[k] / hi) * (h - padT - padB);
            ctx.fillStyle = keep[k] ? C.blue : C.rose;
            ctx.fillRect(X(k) - bw / 2 + 0.5, h - padB - bh, Math.max(1, bw - 1), bh);
          }
          ctx.fillStyle = C.text_faint;
          ctx.font = "11px monospace";
          ctx.textAlign = "center";
          [0, 3, 15, 32, 48, 64].forEach((k) => ctx.fillText("k=" + k, X(k), h - 7));
        }
        const eAll = mag.reduce((s, v) => s + v * v, 0),
          eKeep = mag.reduce((s, v, k) => s + (full[k] ? v * v : 0), 0);
        qs("#s1", card).textContent = fmt(+((eKeep / eAll) * 100).toFixed(1), 1) + "%";
        const imx = Math.max(...Array.from(ei, Math.abs));
        qs("#s2", card).textContent = imx < 1e-9 ? "none" : "up to " + fmt(+imx.toFixed(2), 2);
        qs("#s3", card).textContent = full.filter((v) => !v).length;
        qs("#note", card).innerHTML =
          !mirror && mode !== "off"
            ? `<div class="callout rose"><b>Half a deletion.</b> A real signal's spectrum comes in mirror pairs (k and N−k). Delete only one of the pair and the inverse DFT returns a <b>complex</b> signal: part of the unwanted component is still there, and an imaginary part appears.</div>`
            : mode === "notch"
              ? `<div class="callout teal">Bins 15 and 113 (= 128 − 15) are deleted: the hum is gone and the slow wave is untouched.</div>`
              : mode === "low"
                ? `<div class="callout">A low-pass keeps the slow content and throws away everything above the cut-off, including the hum and most of the noise. Sharp edges would get rounded too.</div>`
                : mode === "high"
                  ? `<div class="callout">A high-pass does the opposite: the slow 3-cycle wave is deleted and only the fast stuff survives.</div>`
                  : mode === "top"
                    ? `<div class="callout violet"><b>Compression:</b> keep only the ${topK} biggest bins and drop the rest. Few numbers to store, yet the signal shape is close when the spectrum is dominated by a few peaks.</div>`
                    : "";
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a9-filter-1",
          q: "Mode <b>Notch out the hum</b> with the mirror box <b>ticked</b>. Now untick <b>Delete the mirror bin</b>. What happens to the result?",
          opts: [
            "It turns complex: half the hum stays and an imaginary part appears",
            "Nothing changes, because only bin 15 matters for the hum",
            "The hum is removed twice as thoroughly, doubling the effect",
          ],
          a: 0,
          why: "Real signals have mirror-image bins k and N−k that carry the same wave between them. Remove only bin 15 and the leftover bin 113 is a <b>complex</b> rotating term, so the result is no longer a real signal.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-filter-2",
          q: "Mode <b>Low-pass</b>, cut-off bin <b>8</b>, noise 0.4. What does the teal curve show?",
          opts: [
            "A smooth slow wave: the hum at bin 15 and the noise are gone",
            "The slow wave and the hum, with only the fast noise removed",
            "Nothing at all: a low-pass deletes every bin below 8 and keeps the rest",
          ],
          a: 0,
          why: "A low-pass keeps the bins up to the cut-off: here the 3-cycle wave. The hum sits at bin 15, above the cut-off, so it goes too. Lower the cut-off to 2 and even the wanted wave starts to disappear.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Filtering in frequency</b>: DFT, set unwanted bins to zero, inverse DFT.",
            "Delete <b>both</b> bins of a mirror pair (k and N−k) or the output stops being real.",
            "<b>Low-pass</b> keeps slow content (and removes most noise), <b>high-pass</b> keeps fast content, a <b>notch</b> removes one frequency such as a hum.",
            "<b>Compression</b> keeps only the biggest coefficients: fewer numbers, similar signal. It is the idea behind MP3 and JPEG.",
            "Real uses: voice enhancement, noise cancellation, earthquake analysis, radio tuning, ECG and EEG, X-ray crystallography.",
          ],
          "Move to the frequency domain when the thing you want to remove has a frequency.",
        ),
      );
    },
  });
  L["a9-filter"] = {
    sum: "In the frequency domain, unwanted parts of a signal are just bars you can delete. Transform, edit the bins, transform back: the same trick gives noise removal, notch filters and compression.",
    steps: [
      {
        t: "Transform, edit, transform back",
        b: `<p>Many jobs are hard in time and easy in frequency. A steady 50 Hz hum is mixed through the whole recording, but in the spectrum it is <b>one tall bar</b>. So:</p><p><b>1.</b> DFT the samples. <b>2.</b> Set the unwanted bins to zero (or scale them). <b>3.</b> Inverse DFT to get a cleaned signal.</p>`,
        v: F.flow([
          { t: "Signal", s: "samples", c: "blue" },
          { t: "DFT", c: "violet" },
          { t: "Edit bins", s: "zero some", c: "rose" },
          { t: "Inverse DFT", c: "violet" },
          { t: "Cleaned", c: "teal" },
        ]),
        c: {
          q: "A recording has a steady hum at one frequency. Why is the spectrum a good place to remove it?",
          o: [
            "The hum is a single bar there, so you delete that bin",
            "The hum is a quieter sound once it is transformed",
            "The DFT removes all noise by itself, for free",
          ],
          a: 0,
          why: "A pure tone is spread over all time but concentrated in one frequency bin. Deleting that bin removes it without touching the rest.",
        },
      },
      {
        t: "Remove a component: the notch",
        b: `<p>To remove a sine such as $\\sin(5x)$ from a mixture, find its bin and delete it. Because the spectrum of a real signal is symmetric, the wave lives in <b>two</b> bins: $k$ and $N-k$.</p><span class="key">Delete both k and N − k. With N = 128 and a hum at k = 15, delete bins 15 and 113.</span>`,
        v: F.cells(
          [
            { v: "k=3", sub: "keep", c: "blue" },
            { v: "k=15", sub: "delete", c: "rose" },
            { v: "…", c: "dim" },
            { v: "k=113", sub: "delete (mirror)", c: "rose" },
            { v: "k=125", sub: "keep (mirror)", c: "blue" },
          ],
          { size: 60 },
        ),
        c: {
          q: "N = 128 and the hum is at bin 15. Which bin is its mirror?",
          o: ["14", "113", "64"],
          a: 1,
          hint: "The mirror of k is N − k.",
          why: "128 − 15 = 113. Delete 15 and 113 together.",
        },
      },
      {
        t: "Low-pass and high-pass",
        b: `<p>Instead of one bin, delete a whole range. A <b>low-pass</b> keeps bins below a cut-off and removes the rest: noise is mostly fast wiggles, so this smooths it, but sharp edges in the wanted signal get rounded too. A <b>high-pass</b> keeps only the fast changes (it removes slow drift).</p>`,
        v: F.compare(
          {
            title: "Low-pass",
            c: "teal",
            body:
              F.bars(
                [
                  ["slow", 1, "teal"],
                  ["medium", 0.6, "teal"],
                  ["fast", 0.1, "dim"],
                  ["noise", 0.05, "dim"],
                ],
                { max: 1, fmt: () => "" },
              ) + "fast bins removed",
          },
          {
            title: "High-pass",
            c: "violet",
            body:
              F.bars(
                [
                  ["slow", 0.05, "dim"],
                  ["medium", 0.1, "dim"],
                  ["fast", 0.7, "violet"],
                  ["noise", 0.6, "violet"],
                ],
                { max: 1, fmt: () => "" },
              ) + "slow bins removed",
          },
        ),
        c: {
          q: "You want to remove slow drift from a sensor reading. Which filter?",
          o: ["Low-pass", "High-pass", "Notch at the highest bin"],
          a: 1,
          why: "Drift is a very slow change: a low-frequency component. A high-pass removes it and keeps the quick changes.",
        },
      },
      {
        t: "Compression: keep the big bins",
        b: `<p>Most real signals have a spectrum with <b>a few tall bars and many tiny ones</b>. If you keep only the biggest coefficients and drop the tiny ones, you store far fewer numbers yet the signal barely changes. That is the principle of lossy audio, image and video compression.</p>`,
        v:
          F.bars(
            [
              ["bin 3", 1, "teal"],
              ["bin 15", 0.6, "teal"],
              ["bin 7", 0.05, "dim"],
              ["bin 22", 0.04, "dim"],
              ["bin 40", 0.03, "dim"],
            ],
            { max: 1, fmt: () => "" },
          ) + cap("Keep the teal bins and drop the grey ones: two numbers instead of five."),
        c: {
          q: "Why does dropping the smallest coefficients compress a signal?",
          o: [
            "Fewer numbers to store, with only a small change to the signal",
            "The remaining numbers are always exact whole integers",
            "It converts the whole signal back into the time domain",
          ],
          a: 0,
          why: "Small bins contribute almost nothing to the shape. You trade a little accuracy for a lot of storage.",
        },
      },
      {
        t: "Voice, photos and other uses",
        b: `<p>The same recipe appears everywhere: <b>voice enhancement</b> (remove a steady hiss or hum), <b>noise cancellation</b> in digital devices, <b>beautifying photos</b> (a photo is a 2-D signal, see later), sound, image and video compression, earthquake analysis, active vibration damping, radio and Wi-Fi tuning, vehicle emissions testing, EEG and ECG signals, and X-ray crystallography (such as the structure of DNA).</p>`,
        v: table(
          ["Field", "What the spectrum is used for"],
          [
            ["Voice recording", "find and delete a hum or hiss"],
            ["Earthquakes, buildings", "find shaking frequencies to design against"],
            ["Radio and Wi-Fi", "pick one channel (one frequency band) out of many"],
            ["EEG, ECG", "see which rhythms are present"],
            [
              "X-ray crystallography of molecules such as DNA",
              "diffraction patterns are Fourier transforms of structure",
            ],
          ],
        ),
        c: {
          q: "Which of these is a typical use of the Fourier transform?",
          o: [
            "Tuning a radio to one channel",
            "Sorting a list of names",
            "Finding the shortest road between two towns",
          ],
          a: 0,
          why: "Tuning picks one frequency band out of a mixture. Sorting and shortest paths are graph or list algorithms.",
        },
      },
      {
        t: "Heart-rate variability",
        b: `<p><b>Heart-rate variability (HRV)</b> measures how the time between beats varies. Taking the spectrum of the beat-to-beat series splits the variation into bands:</p><p>The ratio <b>LF/HF</b> is used as an index of the balance between the sympathetic ("fight or flight") and parasympathetic ("rest") nervous systems.</p>`,
        v: table(
          ["Band", "Frequency range"],
          [
            ["ULF (ultra low)", "below 0.0033 Hz"],
            ["VLF (very low)", "0.0033 to 0.04 Hz"],
            { c: ["LF (low)", "0.04 to 0.15 Hz"], hl: true },
            { c: ["HF (high)", "0.15 to 0.4 Hz"], hl: true },
          ],
        ),
        c: {
          q: "A heart-rate series has a strong rhythm at 0.1 Hz. Which band is that?",
          o: ["VLF", "LF", "HF"],
          a: 1,
          why: "0.1 Hz lies between 0.04 and 0.15 Hz, which is the LF band.",
        },
      },
      {
        t: "Scans from spectra",
        b: `<p>The FFT also powers medical imaging. In <b>X-ray computed tomography</b> (CT or CAT scan), computer-processed X-rays taken from many angles are combined into tomographic images, or "slices", of the body. The reconstruction relies on Fourier transforms, and the FFT makes it fast enough to be practical.</p>`,
        v: F.flow([
          { t: "X-rays", s: "many angles", c: "blue" },
          { t: "Fourier transforms", s: "via the FFT", c: "violet" },
          { t: "Combine", c: "amber" },
          { t: "Slice image", c: "teal" },
        ]),
      },
      {
        t: "Reading the playground",
        b: `<p>The signal is a slow 3-cycle wave plus a 15-cycle hum and noise. Pick a mode and watch the <b>teal</b> curve (the edited signal) against the grey original. In the spectrum, <b>blue</b> bars are kept and <b>red</b> bars are deleted. The <b>mirror</b> tick shows what happens if you delete only half a pair.</p>`,
        v: F.cells([
          { v: "DFT", c: "violet" },
          "→",
          { v: "delete", sub: "red bars", c: "rose" },
          "→",
          { v: "IDFT", c: "violet" },
          "→",
          { v: "clean", c: "teal" },
        ]),
      },
    ],
    guide: [
      "Pick <b>Notch out the hum</b>. The teal curve should be a smooth 3-cycle sine.",
      "Untick <b>Delete the mirror bin</b> and read the <b>Imaginary leftover</b> stat. Tick it again.",
      "Try <b>Low-pass</b> and drag the cut-off from 60 down to 2. When does the hum vanish? When does the slow wave start to vanish?",
      "Try <b>Keep the top K</b> and raise K from 1 to 4. How few bins still give a good copy?",
      "Answer the questions after the demo.",
    ],
  };
})();
