/* Algorithms, Phase 9 workshop: "Wave mixer" (no code).
   Mixer (waves in, spectrum out, sampling too slowly), Mystery (read the frequencies out of a signal) and
   Halving (even/odd split behind the FFT). Every bar, dot and number comes from a real DFT computed here. */
(function () {
  const N = NIC, { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig, L = N.LESSONS;
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const SVGNS = "http://www.w3.org/2000/svg";
  const COL = ["var(--blue)", "var(--amber)", "var(--violet)", "var(--text-faint)"];
  const TAU = 2 * Math.PI;
  const r1 = (v) => (Math.round(v * 10) / 10).toString();

  /** Sample a sum of sines at fs samples/s for one second, then run a real DFT. Returns amplitudes for bins 0..fs/2. */
  function analyse(waves, fs) {
    const n = fs, x = Array.from({ length: n }, (_, i) => waves.reduce((s, w) => s + w.a * Math.sin((TAU * w.f * i) / fs), 0));
    const amps = [];
    for (let k = 0; k <= n / 2; k++) {
      let re = 0, im = 0;
      for (let t = 0; t < n; t++) { const a = (-TAU * k * t) / n; re += x[t] * Math.cos(a); im += x[t] * Math.sin(a); }
      const m = Math.hypot(re, im);
      amps.push(k === 0 || k === n / 2 ? m / n : (2 * m) / n);
    }
    return { x, amps };
  }
  const fold = (f, fs) => Math.abs(f - fs * Math.round(f / fs));

  /* ---------- a reusable scope: the signal over one second, and its spectrum ---------- */
  function scope(host, o = {}) {
    const W = 560, SX0 = 34, SW = W - 50, KMAX = 32, slot = SW / (KMAX + 1), BASE = 138, BH = 110;
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
    const tSvg = qs("svg", host), sSvg = qsa("svg", host)[1];
    const parts = qs("[data-parts]", host), dots = qs("[data-dots]", host), sum = qs("[data-sum]", host), ov = qs("[data-ov]", host), al = qs("[data-al]", host);
    const bins = qsa(".aw9-bin", sSvg);
    if (o.onBar) bins.forEach((g) => { g.style.cursor = "pointer"; g.addEventListener("click", () => o.onBar(+g.dataset.k)); });
    const curve = (f, a, sc) => { let d = ""; for (let i = 0; i <= 720; i++) { const t = i / 720; d += `${i ? "L" : "M"}${(10 + t * (W - 20)).toFixed(1)} ${(95 - (a * Math.sin(TAU * f * t)) / sc * 78).toFixed(1)}`; } return d; };
    return {
      update({ waves, fs, parts: showParts = true, hideSpec = false, marks = new Set(), overlay = null, alias = true }) {
        const { x, amps } = analyse(waves, fs);
        const sc = Math.max(1, waves.reduce((s, w) => s + w.a, 0));
        // time domain
        parts.innerHTML = showParts ? waves.map((w, i) => `<path d="${curve(w.f, w.a, sc)}" stroke="${COL[i % 4]}" class="aw9-part"/>`).join("") : "";
        sum.setAttribute("d", curve.length && waves.length ? (() => { let d = ""; for (let i = 0; i <= 720; i++) { const t = i / 720; const v = waves.reduce((s, w) => s + w.a * Math.sin(TAU * w.f * t), 0); d += `${i ? "L" : "M"}${(10 + t * (W - 20)).toFixed(1)} ${(95 - (v / sc) * 78).toFixed(1)}`; } return d; })() : "");
        dots.innerHTML = x.map((v, i) => `<circle class="aw9-dt" cx="${(10 + (i / fs) * (W - 20)).toFixed(1)}" cy="${(95 - (v / sc) * 78).toFixed(1)}" r="${fs > 40 ? 3 : 4.5}"/>`).join("");
        const aliased = alias ? waves.filter((w) => w.f > fs / 2) : [];
        al.setAttribute("d", aliased.length ? aliased.map((w) => { const m = Math.round(w.f / fs), ff = w.f - m * fs; return curve(ff, w.a, sc); }).join("") : "");
        ov.setAttribute("d", overlay && overlay.length ? (() => { let d = ""; for (let i = 0; i <= 720; i++) { const t = i / 720; const v = overlay.reduce((s, w) => s + w.a * Math.sin(TAU * w.f * t), 0); d += `${i ? "L" : "M"}${(10 + t * (W - 20)).toFixed(1)} ${(95 - (v / sc) * 78).toFixed(1)}`; } return d; })() : "");
        // spectrum
        const mx = Math.max(1.2, ...amps) * 1.12, aliasBins = new Set(aliased.map((w) => fold(w.f, fs)));
        bins.forEach((g, k) => {
          const inside = k <= fs / 2, v = inside && !hideSpec ? amps[k] : 0, b = qs(".b", g), t = qs(".v", g);
          const h = Math.min(BH, (v / mx) * BH);
          b.style.transform = `scaleY(${v > 0.005 ? Math.max(0.012, h / BH) : 0})`;
          t.textContent = v > 0.05 ? r1(v) : ""; t.style.transform = `translateY(${-h}px)`;
          g.classList.toggle("al", aliasBins.has(k) && v > 0.05); g.classList.toggle("mk", marks.has(k)); g.classList.toggle("off", !inside);
        });
        const ny = qs("[data-ny]", sSvg), nyt = qs("[data-nyt]", sSvg), x0 = SX0 + (fs / 2 + 1) * slot - 1;
        ny.setAttribute("x", x0); ny.setAttribute("width", Math.max(0, W - 8 - x0)); ny.style.opacity = fs / 2 < KMAX ? 1 : 0;
        nyt.setAttribute("x", (x0 + W - 8) / 2); nyt.setAttribute("text-anchor", "middle"); nyt.textContent = fs / 2 < KMAX ? "can't be seen at this sampling rate" : "";
        return { x, amps, peaks: amps.map((v, k) => [k, v]).filter(([, v]) => v > 0.05) };
      },
    };
  }

  function wavesWorkshop(stage, api, life) {
    let nid = 1, tab = "mix", fs = 64, aliased = null, coachedAlias = false;
    let waves = [{ id: nid++, f: 3, a: 1 }];

    stage.innerHTML = `<div class="aw9-tabs" data-tabs></div>
      <div class="wk-card" data-p="mix"><h3>Wave mixer<span class="wk-sp"></span><span class="wk-badge" data-mb></span></h3>
        <div class="aw9-waves" data-waves></div>
        <div class="wk-row aw9-bar"><button class="btn" data-add>+ Add wave</button><span class="aw9-lab">Samples per second</span><div data-fs></div></div>
        <div data-scope></div>
        <div class="aw9-read" data-read></div>
        <div class="wk-note" data-note>Add a second wave and watch the spectrum. Each wave becomes one bar.</div></div>
      <div class="wk-card" data-p="mys" hidden><h3>Mystery signal<span class="wk-sp"></span><span class="wk-badge" data-yb>3 waves inside</span></h3>
        <div data-yscope></div>
        <div class="wk-row aw9-bar"><button class="btn" data-show>Show spectrum</button><button class="btn primary" data-check disabled>Check my peaks</button><button class="btn ghost small" data-new>New mystery</button></div>
        <div class="wk-note" data-ynote>The curve looks like a mess. Press <b>Show spectrum</b>, then tap the bar of every frequency you think is hiding inside.</div></div>
      <div class="wk-card" data-p="half" hidden><h3>The halving trick<span class="wk-sp"></span><span class="wk-badge" data-hb></span></h3>
        <div data-hhost></div>
        <div class="wk-row aw9-bar"><button class="btn primary" data-split disabled>Split into two rows</button><button class="btn" data-halves disabled>Half-size DFTs</button><button class="btn" data-comb disabled>Combine</button><button class="btn ghost small" data-hrs>Start again</button></div>
        <div data-hmid></div>
        <div class="wk-note" data-hnote></div></div>`;
    const tabs = qs("[data-tabs]", stage);
    tabs.appendChild(N.seg([["mix", "Mixer"], ["mys", "Mystery"], ["half", "Halving"]], "mix", (v) => { tab = v; qsa("[data-p]", stage).forEach((p) => { p.hidden = p.dataset.p !== v; if (!p.hidden && fxOn()) N.fx.enter(p, { y: 6, x: 0, dur: N.fx.DUR.l }); }); snd("tap"); if (v === "mys") myst.enter(); if (v === "half") half.enter(); }));

    /* ---------------- MIXER ---------------- */
    const mix = qs('[data-p="mix"]', stage), sc = scope(qs("[data-scope]", mix)), wrap = qs("[data-waves]", mix), note = qs("[data-note]", mix);
    const say = (h) => { note.innerHTML = h; };
    qs("[data-fs]", mix).appendChild(N.seg([[64, "64"], [32, "32"], [16, "16"]], String(fs), (v) => {
      fs = +v; update(); snd("select");
      const hi = waves.find((w) => w.f > fs / 2), eq = waves.find((w) => w.f === fs / 2);
      if (!hi && !eq) say(`Sampling at <b>${fs}</b> per second. Every wave is below <b>${fs / 2} Hz</b> (half of ${fs}), so each bar sits at the true frequency.`);
      else if (eq && !hi) say(`<b>${eq.f} Hz</b> is exactly half of ${fs}. The samples land on the zero crossings every time, so this wave <b>vanishes</b>. Nudge it down a little.`);
    }));
    function rows() {
      wrap.innerHTML = "";
      waves.forEach((w, i) => {
        const row = el(`<div class="aw9-w"><i class="aw9-dot" style="background:${COL[i % 4]}"></i><div class="aw9-sl"></div><button class="aw9-x" aria-label="Remove wave" ${waves.length < 2 ? "disabled" : ""}>✕</button></div>`);
        const sf = N.slider("Frequency", 1, 30, 1, w.f, (v) => v + " Hz"), sa = N.slider("Strength", 0.1, 1, 0.1, w.a, (v) => v.toFixed(1));
        sf.onInput((v) => { w.f = v; update(); }); sa.onInput((v) => { w.a = v; update(); });
        qs("input", sf).addEventListener("change", () => coach(w)); qs("input", sa).addEventListener("change", () => coach(w));
        qs(".aw9-sl", row).append(sf, sa);
        qs(".aw9-x", row).onclick = () => { waves = waves.filter((x) => x !== w); rows(); update(); snd("back"); say(`Removed a wave. The spectrum lost exactly that bar, and the sum has fewer wiggles.`); };
        wrap.appendChild(row);
      });
      qs("[data-add]", mix).disabled = waves.length >= 4;
    }
    qs("[data-add]", mix).onclick = () => {
      const free = [5, 8, 12, 17, 21, 25].find((f) => !waves.some((w) => w.f === f)) || 9;
      waves.push({ id: nid++, f: free, a: 0.6 }); rows(); update(); snd("pop");
      const ph = N.fx && fxOn() && qs(".aw9-w:last-child", wrap); if (ph) N.fx.springIn(ph, { from: 0.96 });
      say(`Added a <b>${free} Hz</b> wave. The black curve is the <b>sum</b> of all waves, and the spectrum has one bar per wave.`);
      api.say("Many waves in, one messy curve out. But the bars still show the recipe.", "happy");
    };
    function coach(w) {
      if (waves.some((x) => x.f > fs / 2) || waves.some((x) => x.f === fs / 2)) return;
      say(waves.length === 1 ? `One wave: one bar at <b>${w.f} Hz</b>, as tall as its strength <b>${w.a.toFixed(1)}</b>.` : `Move a slider and the matching bar slides or grows. Each wave owns one bar.`);
    }
    function update() {
      const r = sc.update({ waves, fs });
      qs("[data-read]", mix).innerHTML = r.peaks.length ? `Spectrum peaks: ${r.peaks.map(([k, v]) => `<b>${k} Hz</b> × ${v.toFixed(1)}`).join(" · ")}` : "No peaks: the signal is flat.";
      qs("[data-mb]", mix).textContent = `${fs} samples per second · limit ${fs / 2} Hz`;
      qs("[data-mb]", mix).className = `wk-badge${waves.some((w) => w.f > fs / 2) ? " slow" : ""}`;
      // missions
      if (waves.length >= 2 && new Set(waves.map((w) => w.f)).size >= 2 && r.peaks.length >= 2) api.done("mix");
      if (aliased) { const w = waves.find((x) => x.id === aliased.id); if (w && w.f === aliased.f && w.f < fs / 2) { api.done("rescue"); } }
      const hi = waves.find((w) => w.f > fs / 2);
      const still = aliased && waves.find((x) => x.id === aliased.id && x.f > fs / 2);
      if (hi && !still) {
        aliased = { id: hi.id, f: hi.f }; const k = fold(hi.f, fs);
        api.done("alias"); snd("wrong");
        say(`<b>${hi.f} Hz</b> is above half the sampling rate (<b>${fs / 2} Hz</b>). With only ${fs} samples a second, the dots can't tell it from a <b>${k} Hz</b> wave, so the bar shows up at <b>${k} Hz</b>. The red dashed curve passes through every dot.`);
        api.say(`A fake ${k} Hz! Too few samples, and a fast wave impersonates a slow one.`, "surprised");
      } else if (aliased && !hi && !coachedAlias && waves.some((w) => w.id === aliased.id && w.f === aliased.f && w.f < fs / 2)) {
        coachedAlias = true; snd("correct");
        say(`Fixed! With <b>${fs}</b> samples a second the limit is <b>${fs / 2} Hz</b>, so <b>${aliased.f} Hz</b> shows where it really is. You need <b>more than twice</b> the highest frequency.`);
        api.say(`Sample more than twice as fast as the fastest wave and the bar is honest.`, "love");
      }
      if (!hi && aliased && !waves.some((w) => w.id === aliased.id && w.f === aliased.f)) { aliased = null; coachedAlias = false; }
    }
    rows(); update();

    /* ---------------- MYSTERY ---------------- */
    const myP = qs('[data-p="mys"]', stage), myst = (() => {
      let truth, marks = new Set(), shown = false, overlay = null, tries = 0;
      const ysc = scope(qs("[data-yscope]", myP), { onBar: (k) => { if (!shown) { ynote("Press <b>Show spectrum</b> first."); return; } if (k === 0) return; marks.has(k) ? marks.delete(k) : marks.add(k); snd("select"); draw(); qs("[data-check]", myP).disabled = !marks.size; } });
      const ynote = (h) => { qs("[data-ynote]", myP).innerHTML = h; };
      const fresh = () => {
        const pool = []; while (pool.length < 3) { const f = 2 + Math.floor(Math.random() * 23); if (pool.every((p) => Math.abs(p - f) >= 3)) pool.push(f); }
        const amps = [1, 0.7, 0.4].sort(() => Math.random() - 0.5);
        truth = pool.map((f, i) => ({ f, a: amps[i] })).sort((p, q) => p.f - q.f); marks = new Set(); shown = false; overlay = null; tries = 0;
        qs("[data-show]", myP).disabled = false; qs("[data-check]", myP).disabled = true;
      };
      function draw() { ysc.update({ waves: truth, fs: 64, parts: false, hideSpec: !shown, marks, overlay, alias: false }); qs("[data-yb]", myP).textContent = shown ? `${marks.size} picked` : "3 waves inside"; }
      qs("[data-show]", myP).onclick = () => { shown = true; qs("[data-show]", myP).disabled = true; draw(); snd("whoosh"); ynote("Each bar is a frequency hiding in the curve. Tap every bar that is a real wave, then press <b>Check my peaks</b>."); api.say("The messy curve is just a few waves added together. Tall bars give them away.", "think"); };
      qs("[data-new]", myP).onclick = () => { fresh(); draw(); ynote("A new mystery. Show the spectrum and read it."); snd("back"); };
      qs("[data-check]", myP).onclick = () => {
        tries++; const tf = new Set(truth.map((t) => t.f)), miss = [...tf].filter((f) => !marks.has(f)), extra = [...marks].filter((f) => !tf.has(f));
        if (!miss.length && !extra.length) {
          overlay = truth.map((t) => ({ f: t.f, a: +ysc.update({ waves: truth, fs: 64, parts: false, hideSpec: false, marks, alias: false }).amps[t.f].toFixed(2) }));
          draw(); snd("complete");
          ynote(`Right: <b>${truth.map((t) => t.f + " Hz").join(", ")}</b>. The green dashed curve is rebuilt only from the bars you tapped, and it lies <b>exactly</b> on the mystery. The spectrum really is a full recipe.`);
          api.say(`${tries === 1 ? "First go! " : ""}You read the recipe straight off the bars.`, "love"); api.done("mystery");
        } else {
          snd("wrong"); const parts = [];
          if (extra.length) parts.push(`${extra.map((f) => `<b>${f} Hz</b>`).join(", ")} ${extra.length > 1 ? "have" : "has"} a flat bar: nothing wiggles at that frequency`);
          if (miss.length) parts.push(`you missed ${miss.map((f) => `<b>${f} Hz</b>`).join(", ")}: a short bar is still a real wave, just a weaker one`);
          ynote(`Not quite: ${parts.join("; ")}.`); api.say("Look again: every wave gives one bar, tall or short.", "think");
          if (fxOn()) qsa(".aw9-bin.mk", myP).forEach((g) => N.fx.shake(g));
        }
      };
      fresh();
      return { enter() { draw(); } };
    })();

    /* ---------------- HALVING ---------------- */
    const hP = qs('[data-p="half"]', stage), half = (() => {
      const NH = 16, x = Array.from({ length: NH }, (_, t) => Math.sin((TAU * 2 * t) / NH) + 0.6 * Math.sin((TAU * 5 * t) / NH));
      const cx = (re, im) => ({ re, im }), add = (a, b) => cx(a.re + b.re, a.im + b.im), sub = (a, b) => cx(a.re - b.re, a.im - b.im), mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
      let muls = 0;
      const dft = (s) => { const n = s.length; return Array.from({ length: n }, (_, k) => { let re = 0, im = 0; for (let t = 0; t < n; t++) { const a = (-TAU * k * t) / n; re += s[t] * Math.cos(a); im += s[t] * Math.sin(a); muls++; } return cx(re, im); }); };
      muls = 0; const direct = dft(x), opsDirect = muls;
      muls = 0; const E = dft(x.filter((_, t) => t % 2 === 0)), O = dft(x.filter((_, t) => t % 2 === 1)), opsHalves = muls;
      const WO = Array.from({ length: 8 }, (_, k) => mul(cx(Math.cos((-TAU * k) / NH), Math.sin((-TAU * k) / NH)), O[k]));
      const comb = Array(NH); for (let k = 0; k < 8; k++) { comb[k] = add(E[k], WO[k]); comb[k + 8] = sub(E[k], WO[k]); }
      const err = Math.max(...comb.map((z, k) => Math.hypot(z.re - direct[k].re, z.im - direct[k].im)));
      const opsSplit = opsHalves + 8, mag = (z) => Math.hypot(z.re, z.im);
      const rc = (v) => { const t = Math.round(v * 100) / 100; return t === 0 ? 0 : t; };
      const fc = (z) => { const re = rc(z.re), im = rc(z.im); return `${re < 0 ? "−" : ""}${Math.abs(re).toFixed(2)} ${im < 0 ? "−" : "+"} ${Math.abs(im).toFixed(2)}i`; };
      let phase = 0, picked = new Set(), inspected = new Set(), selK = null;
      const host = qs("[data-hhost]", hP), mid = qs("[data-hmid]", hP), hn = (h) => { qs("[data-hnote]", hP).innerHTML = h; };
      const X = (t) => 24 + 32 * t, CY = [88, 212], SC = 46;
      const badge = () => { qs("[data-hb]", hP).textContent = ["Step 1 of 4: sort", "Step 2 of 4: split", "Step 3 of 4: half DFTs", "Step 4 of 4: combine", "Inspect the pairs"][phase]; };
      function build() {
        host.innerHTML = `<svg class="aw9-svg aw9-hsvg" viewBox="0 0 560 290" role="img" aria-label="Sixteen samples">
          <line class="aw9-ax" data-ax0 x1="8" x2="552" y1="${CY[0]}" y2="${CY[0]}"/><line class="aw9-ax" data-ax1 x1="8" x2="552" y1="${CY[1]}" y2="${CY[1]}" style="opacity:0"/>
          <text class="aw9-tl aw9-rowt" data-r0 x="10" y="20" style="opacity:0">even-indexed: x0, x2, x4 …</text><text class="aw9-tl aw9-rowt" data-r1 x="10" y="144" style="opacity:0">odd-indexed: x1, x3, x5 …</text>
          ${x.map((v, t) => `<g class="aw9-st" data-t="${t}" tabindex="0" role="button" aria-label="Sample x${t}"><line x1="${X(t)}" x2="${X(t)}" y1="${CY[0]}" y2="${CY[0] - v * SC}"/><circle cx="${X(t)}" cy="${CY[0] - v * SC}" r="8"/><text class="lb" x="${X(t)}" y="${CY[0] + 76}">x${t}</text></g>`).join("")}</svg>`;
        qsa(".aw9-st", host).forEach((g) => { g.onclick = () => tap(+g.dataset.t); g.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(+g.dataset.t); } }; });
      }
      function tap(t) {
        if (phase !== 0) return; const g = qs(`.aw9-st[data-t="${t}"]`, host);
        if (t % 2) { snd("wrong"); fxOn() && N.fx.shake(g); hn(`<b>x${t}</b> has index <b>${t}</b>, which is odd. We count from 0, so the even indices are 0, 2, 4 … 14. Tap those.`); api.say("Indices start at zero. Evens are 0, 2, 4…", "think"); return; }
        if (picked.has(t)) return; picked.add(t); g.classList.add("ev"); snd("select");
        hn(`<b>x${t}</b>: even. ${8 - picked.size} to go.`);
        if (picked.size === 8) {
          phase = 1; qsa(".aw9-st", host).forEach((s) => s.classList.add(+s.dataset.t % 2 ? "od" : "ev")); badge();
          qs("[data-split]", hP).disabled = false; snd("correct");
          hn("All eight evens found. The other eight are the <b>odd</b> ones. Now press <b>Split into two rows</b>."); api.say("Sorted! Two teams of eight: evens (blue) and odds (orange).", "happy");
        }
      }
      function split() {
        phase = 2; badge(); qs("[data-split]", hP).disabled = true; qs("[data-halves]", hP).disabled = false; snd("whoosh");
        qsa(".aw9-st", host).forEach((g) => { const t = +g.dataset.t, row = t % 2, m = (t - row) / 2, nx = 28 + m * 64 + (row ? 32 : 0); g.style.transform = `translate(${nx - X(t)}px, ${row ? CY[1] - CY[0] : 0}px)`; });
        qs("[data-ax1]", host).style.opacity = 1; qs("[data-r0]", host).style.opacity = 1; qs("[data-r1]", host).style.opacity = 1;
        hn("Two rows of <b>eight</b> samples. Each row is a smaller problem, and a DFT of 8 samples costs far less than a DFT of 16.");
      }
      const barsSvg = (vals, cls, title) => { const mx = Math.max(...vals, 1e-9); return `<div class="aw9-mini"><small>${title}</small><svg viewBox="0 0 ${vals.length * 28 + 8} 96" class="aw9-svg">${vals.map((v, k) => `<rect class="mb ${cls}" x="${6 + k * 28}" y="6" width="22" height="70" rx="3" style="--h:${Math.max(0.02, v / mx)};--i:${k}"/><text class="aw9-tl" x="${17 + k * 28}" y="92" text-anchor="middle">${k}</text>`).join("")}</svg></div>`; };
      function halves() {
        phase = 3; badge(); qs("[data-halves]", hP).disabled = true; qs("[data-comb]", hP).disabled = false; snd("pop");
        mid.innerHTML = `<div class="aw9-two">${barsSvg(E.map(mag), "ev", "E: DFT of the even row (8 bins)")}${barsSvg(O.map(mag), "od", "O: DFT of the odd row (8 bins)")}</div>`;
        hn(`Two small DFTs: <b>E</b> from the blue row and <b>O</b> from the orange row. Together they took <b>${opsHalves}</b> multiplications. The direct 16-sample DFT takes <b>${opsDirect}</b>.`);
      }
      function combine() {
        phase = 4; badge(); qs("[data-comb]", hP).disabled = true; snd("complete");
        mid.insertAdjacentHTML("beforeend", `<div class="aw9-full"><small>X: the full 16-bin spectrum, built from E and O. Tap a bar.</small><div data-xb></div><div class="aw9-insp" data-insp>Tap any bar to see how <b>E</b> and <b>O</b> make it.</div>
          <div class="wk-stats"><div class="wk-stat rose"><small>Direct DFT</small><b>${opsDirect} mults</b></div><div class="wk-stat teal"><small>Split once</small><b>${opsSplit} mults</b></div><div class="wk-stat"><small>Off from direct DFT by</small><b>${err < 1e-9 ? "0" : err.toExponential(1)}</b></div></div></div>`);
        const mxv = Math.max(...comb.map(mag));
        qs("[data-xb]", mid).innerHTML = `<svg viewBox="0 0 ${16 * 34 + 8} 130" class="aw9-svg">${comb.map((z, k) => `<g class="aw9-xbin" data-k="${k}" tabindex="0" role="button" aria-label="Bin ${k}"><rect class="hit" x="${6 + k * 34}" y="0" width="32" height="126"/><rect class="mb" x="${8 + k * 34}" y="8" width="26" height="92" rx="3" style="--h:${Math.max(0.02, mag(z) / mxv)};--i:${k}"/><text class="v" x="${21 + k * 34}" y="${100 - 92 * (mag(z) / mxv) + 2}" text-anchor="middle" style="opacity:0">${mag(z).toFixed(1)}</text><text class="aw9-tl" x="${21 + k * 34}" y="118" text-anchor="middle">${k}</text></g>`).join("")}</svg>`;
        qsa(".aw9-xbin", mid).forEach((g) => { g.onclick = () => inspect(+g.dataset.k); g.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inspect(+g.dataset.k); } }; });
        hn(`Combined, and it matches the direct DFT (off by ${err < 1e-9 ? "0" : err.toExponential(1)}). Only <b>${opsSplit}</b> multiplications instead of <b>${opsDirect}</b>, and that's after a single split. Tap bars to see the pairs.`);
        api.say("Same answer, less work. The trick is that bins k and k+8 share one product.", "happy");
      }
      function inspect(kk) {
        const k = kk % 8; selK = k; inspected.add(k); snd("tick");
        qsa(".aw9-xbin", mid).forEach((g) => { const b = +g.dataset.k; g.classList.toggle("sel", b === k || b === k + 8); qs(".v", g).style.opacity = b === k || b === k + 8 ? 1 : 0; });
        qs("[data-insp]", mid).innerHTML = `<b>Bins ${k} and ${k + 8} share their work.</b><br>E[${k}] = ${fc(E[k])}<br>W·O[${k}] = ${fc(WO[k])} <span class="faint">(W = one twist, then O[${k}])</span><br>X[${k}] = E + W·O = <b>${fc(comb[k])}</b><br>X[${k + 8}] = E − W·O = <b>${fc(comb[k + 8])}</b><br><span class="faint">One multiplication gave two answers.</span>`;
        if (fxOn()) N.fx.bump(qs("[data-insp]", mid), { scale: 1.02 });
        if (inspected.size >= 2) { api.done("half"); } else hn(`Bins <b>${k}</b> and <b>${k + 8}</b> both use the same E and W·O. Only the sign changes. Try another bar.`);
        if (inspected.size === 2) api.say("Every pair works the same way: one product, added once and subtracted once.", "love");
      }
      function reset() { phase = 0; picked = new Set(); inspected = new Set(); selK = null; mid.innerHTML = ""; build(); badge(); qs("[data-split]", hP).disabled = true; qs("[data-halves]", hP).disabled = true; qs("[data-comb]", hP).disabled = true; hn(`Here are 16 samples of a signal. Tap the ones with an <b>even</b> index (x0, x2, x4 …).`); }
      qs("[data-split]", hP).onclick = split; qs("[data-halves]", hP).onclick = halves; qs("[data-comb]", hP).onclick = combine; qs("[data-hrs]", hP).onclick = () => { reset(); snd("back"); };
      reset();
      return { enter() { if (phase === 0 && !picked.size) api.say("Sixteen samples. Sort them into evens and odds, then split the job in half.", "idle"); } };
    })();
  }

  N.register({
    id: "a9-mix", subject: "algo", lecture: 9, order: 90, num: "9.W", workshop: true,
    title: "Workshop: the wave mixer",
    blurb: "Mix waves, read a mystery spectrum, break it by sampling too slowly, then split the DFT in half.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro: "Waves in, bars out. <b>Mix</b> some sine waves, read the <b>recipe</b> off the spectrum, and then see how the FFT gets it in half the work.",
        missions: [
          { id: "mix", t: "Mix two waves", d: "In <b>Mixer</b>, press <b>+ Add wave</b> and see one bar per wave.", hint: "Drag the sliders too: frequency moves a bar sideways, strength changes its height." },
          { id: "alias", t: "Sample too slowly", d: "Slide a wave to <b>20 Hz</b> or more, then drop the samples per second to <b>32</b> or <b>16</b>.", hint: "The limit is half the sampling rate. Above it, the bar appears at the wrong frequency." },
          { id: "rescue", t: "Fix it with more samples", d: "Keep the same wave and raise the samples per second until it shows at its true frequency.", hint: "You need more than twice the wave's frequency. 64 samples a second is enough for anything up to 31 Hz." },
          { id: "mystery", t: "Crack the mystery", d: "In <b>Mystery</b>, show the spectrum and tap every frequency hiding in the signal.", hint: "Short bars count too. Tap each bar that rises above the floor." },
          { id: "half", t: "Halve the work", d: "In <b>Halving</b>, sort the samples into evens and odds, split, run two half DFTs and combine. Inspect two bin pairs.", hint: "Indices start at 0: the evens are x0, x2, x4 … x14." },
        ],
        build: wavesWorkshop,
      });
      root.appendChild(predict({ id: "a9-wk-1", q: "A 20 Hz tone is sampled 32 times per second. Where does its bar appear in the spectrum?", opts: ["At 20 Hz, where it belongs", "At 12 Hz, folded back", "At 52 Hz, off the end"], a: 1,
        why: "Half of 32 is 16, and 20 is above that. It folds back to 32 − 20 = 12 Hz, and nothing in the samples can tell it apart from a real 12 Hz wave." }));
      root.appendChild(predict({ id: "a9-wk-2", q: "After splitting into even and odd samples, bins 3 and 11 of a 16-point DFT are both built from E[3] and O[3]. How do they differ?", opts: ["They differ only by a plus or minus on W·O[3]", "Bin 11 needs its own full 16-sample DFT", "Bin 11 is built from the odd samples only"], a: 0,
        why: "X[3] = E[3] + W·O[3] and X[11] = E[3] − W·O[3]. One multiplication feeds both, which is where the savings come from." }));
      root.appendChild(takeaways([
        "A spectrum is a <b>recipe</b>: one bar per wave, with height equal to strength.",
        "Sample at more than <b>twice</b> the highest frequency, or fast waves fold back and pose as slow ones.",
        "Splitting into <b>even and odd</b> samples turns one big DFT into two small ones, and each pair of bins shares a single product.",
      ], "Bars show the waves inside, too few samples fake them, and halving the problem is how the FFT saves work."));
    },
  });

  L["a9-mix"] = {
    sum: "Mix sine waves and read the spectrum, see what sampling too slowly does, then split the DFT into even and odd halves.",
    steps: [
      { t: "Waves in, bars out", b: `<p>Add sine waves and you get one messy curve. The <b>spectrum</b> undoes the mess: it shows one bar for every wave, at its frequency, as tall as its strength.</p>`,
        v: F.flow([{ t: "4 Hz wave" }, { t: "+ 9 Hz wave" }, { t: "messy curve", c: "amber" }, { t: "2 bars", c: "teal" }]),
        c: { q: "A signal is a 4 Hz wave plus a 9 Hz wave. How many bars does its spectrum have?", o: ["Two, at 4 Hz and 9 Hz", "One, at 13 Hz, the total", "Nine, one for each Hz up to 9"], a: 0, why: "Each wave owns one bar at its own frequency. Frequencies don't add together; the waves do." } },
      { t: "Halving the work", b: `<p>The FFT splits the samples into <b>even-indexed</b> and <b>odd-indexed</b> ones, takes a small DFT of each, then combines. Each pair of output bins shares one product.</p>`,
        v: F.flow([{ t: "16 samples" }, { t: "8 even + 8 odd", c: "blue" }, { t: "two small DFTs", c: "amber" }, { t: "combine", c: "teal" }]),
        c: { q: "Why does splitting into evens and odds save work?", o: ["Two half-size DFTs cost less than one full", "Odd samples can be thrown away entirely", "It removes every multiplication from the job"], a: 0, why: "A DFT of n samples costs about n², so two DFTs of n/2 cost about half as much, and combining them is cheap." } },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();
