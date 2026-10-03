/* Algorithms, Phase 9 workshop: "Wave mixer" (no code).
   Mixer (waves in, spectrum out, sampling too slowly), Mystery (read the frequencies out of a signal) and
   Halving (even/odd split behind the FFT). Every bar, dot and number comes from a real DFT computed here. */
(function () {
  const partScope = (NIC.shared.algoWorkshops9 = NIC.shared.algoWorkshops9 || {});

  const N = NIC,
    { qs, qsa } = N;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const COL = ["var(--blue)", "var(--amber)", "var(--violet)", "var(--text-faint)"];
  const TAU = 2 * Math.PI;
  const r1 = (v) => (Math.round(v * 10) / 10).toString();

  /** Sample a sum of sines at fs samples/s for one second, then run a real DFT. Returns amplitudes for bins 0..fs/2. */
  function analyse(waves, fs) {
    const n = fs,
      x = Array.from({ length: n }, (_, i) => waves.reduce((s, w) => s + w.a * Math.sin((TAU * w.f * i) / fs), 0));
    const amps = [];
    for (let k = 0; k <= n / 2; k++) {
      let re = 0,
        im = 0;
      for (let t = 0; t < n; t++) {
        const a = (-TAU * k * t) / n;
        re += x[t] * Math.cos(a);
        im += x[t] * Math.sin(a);
      }
      const m = Math.hypot(re, im);
      amps.push(k === 0 || k === n / 2 ? m / n : (2 * m) / n);
    }
    return { x, amps };
  }
  const fold = (f, fs) => Math.abs(f - fs * Math.round(f / fs));

  /* ---------- a reusable scope: the signal over one second, and its spectrum ---------- */
  function scope(host, o = {}) {
    const W = 560,
      SX0 = 34,
      SW = W - 50,
      KMAX = 32,
      slot = SW / (KMAX + 1),
      BASE = 138,
      BH = 110;
    host.innerHTML = `<svg class="aw9-svg" viewBox="0 0 ${W} 190" role="img" aria-label="Signal over one second">
        <line class="aw9-ax" x1="10" x2="${W - 10}" y1="95" y2="95"/>
        <text class="aw9-tl" x="10" y="186">0 s</text><text class="aw9-tl" x="${W - 10}" y="186" text-anchor="end">1 s</text>
        <g data-parts></g><path class="aw9-ov" data-ov d=""/><path class="aw9-al" data-al d=""/><path class="aw9-sum" data-sum d=""/><g data-dots></g></svg>
      <svg class="aw9-svg aw9-spec" viewBox="0 0 ${W} 172" role="img" aria-label="Frequency spectrum">
        <rect class="aw9-ny" data-ny x="0" y="14" width="0" height="${BH + 12}" rx="6"/>
        <text class="aw9-nyt" data-nyt x="0" y="30"></text>
        <line class="aw9-ax" x1="${SX0 - 6}" x2="${W - 10}" y1="${BASE}" y2="${BASE}"/>
        ${Array.from({ length: KMAX + 1 }, (_, k) => `<g class="aw9-bin" data-k="${k}"><rect class="hit" x="${SX0 + k * slot}" y="14" width="${slot}" height="${BH + 26}"/><rect class="b" x="${SX0 + k * slot + 2}" y="${BASE - BH}" width="${slot - 4}" height="${BH}" rx="3"/><text class="v" x="${SX0 + k * slot + slot / 2}" y="${BASE - 5}"></text></g>`).join("")}
        ${Array.from({ length: 9 }, (_, i) => `<text class="aw9-tl" x="${SX0 + i * 4 * slot + slot / 2}" y="${BASE + 17}" text-anchor="middle">${i * 4}</text>`).join("")}
        <text class="aw9-tl" x="${W - 10}" y="${BASE + 32}" text-anchor="end">frequency (Hz)</text></svg>`;
    const sSvg = qsa("svg", host)[1];
    const parts = qs("[data-parts]", host),
      dots = qs("[data-dots]", host),
      sum = qs("[data-sum]", host),
      ov = qs("[data-ov]", host),
      al = qs("[data-al]", host);
    const bins = qsa(".aw9-bin", sSvg);
    if (o.onBar)
      bins.forEach((g) => {
        g.style.cursor = "pointer";
        g.addEventListener("click", () => o.onBar(+g.dataset.k));
      });
    const curve = (f, a, sc) => {
      let d = "";
      for (let i = 0; i <= 720; i++) {
        const t = i / 720;
        d += `${i ? "L" : "M"}${(10 + t * (W - 20)).toFixed(1)} ${(95 - ((a * Math.sin(TAU * f * t)) / sc) * 78).toFixed(1)}`;
      }
      return d;
    };
    return {
      update({
        waves,
        fs,
        parts: showParts = true,
        hideSpec = false,
        marks = new Set(),
        overlay = null,
        alias = true,
      }) {
        const { x, amps } = analyse(waves, fs);
        const sc = Math.max(
          1,
          waves.reduce((s, w) => s + w.a, 0),
        );
        // time domain
        parts.innerHTML = showParts
          ? waves.map((w, i) => `<path d="${curve(w.f, w.a, sc)}" stroke="${COL[i % 4]}" class="aw9-part"/>`).join("")
          : "";
        sum.setAttribute(
          "d",
          curve.length && waves.length
            ? (() => {
                let d = "";
                for (let i = 0; i <= 720; i++) {
                  const t = i / 720;
                  const v = waves.reduce((s, w) => s + w.a * Math.sin(TAU * w.f * t), 0);
                  d += `${i ? "L" : "M"}${(10 + t * (W - 20)).toFixed(1)} ${(95 - (v / sc) * 78).toFixed(1)}`;
                }
                return d;
              })()
            : "",
        );
        dots.innerHTML = x
          .map(
            (v, i) =>
              `<circle class="aw9-dt" cx="${(10 + (i / fs) * (W - 20)).toFixed(1)}" cy="${(95 - (v / sc) * 78).toFixed(1)}" r="${fs > 40 ? 3 : 4.5}"/>`,
          )
          .join("");
        const aliased = alias ? waves.filter((w) => w.f > fs / 2) : [];
        al.setAttribute(
          "d",
          aliased.length
            ? aliased
                .map((w) => {
                  const m = Math.round(w.f / fs),
                    ff = w.f - m * fs;
                  return curve(ff, w.a, sc);
                })
                .join("")
            : "",
        );
        ov.setAttribute(
          "d",
          overlay && overlay.length
            ? (() => {
                let d = "";
                for (let i = 0; i <= 720; i++) {
                  const t = i / 720;
                  const v = overlay.reduce((s, w) => s + w.a * Math.sin(TAU * w.f * t), 0);
                  d += `${i ? "L" : "M"}${(10 + t * (W - 20)).toFixed(1)} ${(95 - (v / sc) * 78).toFixed(1)}`;
                }
                return d;
              })()
            : "",
        );
        // spectrum
        const mx = Math.max(1.2, ...amps) * 1.12,
          aliasBins = new Set(aliased.map((w) => fold(w.f, fs)));
        bins.forEach((g, k) => {
          const inside = k <= fs / 2,
            v = inside && !hideSpec ? amps[k] : 0,
            b = qs(".b", g),
            t = qs(".v", g);
          const h = Math.min(BH, (v / mx) * BH);
          b.style.transform = `scaleY(${v > 0.005 ? Math.max(0.012, h / BH) : 0})`;
          t.textContent = v > 0.05 ? r1(v) : "";
          t.style.transform = `translateY(${-h}px)`;
          g.classList.toggle("al", aliasBins.has(k) && v > 0.05);
          g.classList.toggle("mk", marks.has(k));
          g.classList.toggle("off", !inside);
        });
        const ny = qs("[data-ny]", sSvg),
          nyt = qs("[data-nyt]", sSvg),
          x0 = SX0 + (fs / 2 + 1) * slot - 1;
        ny.setAttribute("x", x0);
        ny.setAttribute("width", Math.max(0, W - 8 - x0));
        ny.style.opacity = fs / 2 < KMAX ? 1 : 0;
        nyt.setAttribute("x", (x0 + W - 8) / 2);
        nyt.setAttribute("text-anchor", "middle");
        nyt.textContent = fs / 2 < KMAX ? "can't be seen at this sampling rate" : "";
        return { x, amps, peaks: amps.map((v, k) => [k, v]).filter(([, v]) => v > 0.05) };
      },
    };
  }
  Object.assign(partScope, { COL, TAU, fold, fxOn, scope, snd });
})();
