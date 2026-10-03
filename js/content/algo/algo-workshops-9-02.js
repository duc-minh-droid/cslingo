(function () {
  const partScope = (NIC.shared.algoWorkshops9 = NIC.shared.algoWorkshops9 || {});
  const { COL, TAU, fold, fxOn, scope, snd } = partScope;
  const N = NIC,
    { el, qs, qsa } = N;

  function wavesWorkshop(stage, api, life) {
    let nid = 1,
      fs = 64,
      aliased = null,
      coachedAlias = false;
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
        <div class="wk-row aw9-bar"><button class="btn" data-show>Show spectrum</button><button class="btn primary" data-ychk disabled>Check my peaks</button><button class="btn ghost small" data-new>New mystery</button></div>
        <div class="wk-note" data-ynote>The curve looks like a mess. Press <b>Show spectrum</b>, then tap the bar of every frequency you think is hiding inside.</div></div>
      <div class="wk-card" data-p="half" hidden><h3>The halving trick<span class="wk-sp"></span><span class="wk-badge" data-hb></span></h3>
        <div data-hhost></div>
        <div class="wk-row aw9-bar"><button class="btn primary" data-split disabled>Split into two rows</button><button class="btn" data-halves disabled>Half-size DFTs</button><button class="btn" data-comb disabled>Combine</button><button class="btn ghost small" data-hrs>Start again</button></div>
        <div data-hmid></div>
        <div class="wk-note" data-hnote></div></div>`;
    const tabs = qs("[data-tabs]", stage);
    tabs.appendChild(
      N.seg(
        [
          ["mix", "Mixer"],
          ["mys", "Mystery"],
          ["half", "Halving"],
        ],
        "mix",
        (v) => {
          qsa("[data-p]", stage).forEach((p) => {
            p.hidden = p.dataset.p !== v;
            if (!p.hidden && fxOn()) N.fx.enter(p, { y: 6, x: 0, dur: N.fx.DUR.l });
          });
          snd("tap");
          if (v === "mys") myst.enter();
          if (v === "half") half.enter();
        },
      ),
    );

    /* ---------------- MIXER ---------------- */
    const mix = qs('[data-p="mix"]', stage),
      sc = scope(qs("[data-scope]", mix)),
      wrap = qs("[data-waves]", mix),
      note = qs("[data-note]", mix);
    const say = (h) => {
      note.innerHTML = h;
    };
    qs("[data-fs]", mix).appendChild(
      N.seg(
        [
          [64, "64"],
          [32, "32"],
          [16, "16"],
        ],
        String(fs),
        (v) => {
          fs = +v;
          update();
          snd("select");
          const hi = waves.find((w) => w.f > fs / 2),
            eq = waves.find((w) => w.f === fs / 2);
          if (!hi && !eq)
            say(
              `Sampling at <b>${fs}</b> per second. Every wave is below <b>${fs / 2} Hz</b> (half of ${fs}), so each bar sits at the true frequency.`,
            );
          else if (eq && !hi)
            say(
              `<b>${eq.f} Hz</b> is exactly half of ${fs}. The samples land on the zero crossings every time, so this wave <b>vanishes</b>. Nudge it down a little.`,
            );
        },
      ),
    );
    function rows() {
      wrap.innerHTML = "";
      waves.forEach((w, i) => {
        const row = el(
          `<div class="aw9-w"><i class="aw9-dot" style="background:${COL[i % 4]}"></i><div class="aw9-sl"></div><button class="aw9-x" aria-label="Remove wave" ${waves.length < 2 ? "disabled" : ""}>✕</button></div>`,
        );
        const sf = N.slider("Frequency", 1, 30, 1, w.f, (v) => v + " Hz"),
          sa = N.slider("Strength", 0.1, 1, 0.1, w.a, (v) => v.toFixed(1));
        sf.onInput((v) => {
          w.f = v;
          update();
        });
        sa.onInput((v) => {
          w.a = v;
          update();
        });
        qs("input", sf).addEventListener("change", () => coach(w));
        qs("input", sa).addEventListener("change", () => coach(w));
        qs(".aw9-sl", row).append(sf, sa);
        qs(".aw9-x", row).onclick = () => {
          waves = waves.filter((x) => x !== w);
          rows();
          update();
          snd("back");
          say(`Removed a wave. The spectrum lost exactly that bar, and the sum has fewer wiggles.`);
        };
        wrap.appendChild(row);
      });
      qs("[data-add]", mix).disabled = waves.length >= 4;
    }
    qs("[data-add]", mix).onclick = () => {
      const free = [5, 8, 12, 17, 21, 25].find((f) => !waves.some((w) => w.f === f)) || 9;
      waves.push({ id: nid++, f: free, a: 0.6 });
      rows();
      update();
      snd("pop");
      const ph = N.fx && fxOn() && qs(".aw9-w:last-child", wrap);
      if (ph) N.fx.springIn(ph, { from: 0.96 });
      say(
        `Added a <b>${free} Hz</b> wave. The black curve is the <b>sum</b> of all waves, and the spectrum has one bar per wave.`,
      );
      api.say("Many waves in, one messy curve out. But the bars still show the recipe.", "happy");
    };
    function coach(w) {
      if (waves.some((x) => x.f > fs / 2) || waves.some((x) => x.f === fs / 2)) return;
      say(
        waves.length === 1
          ? `One wave: one bar at <b>${w.f} Hz</b>, as tall as its strength <b>${w.a.toFixed(1)}</b>.`
          : `Move a slider and the matching bar slides or grows. Each wave owns one bar.`,
      );
    }
    function update() {
      const r = sc.update({ waves, fs });
      qs("[data-read]", mix).innerHTML = r.peaks.length
        ? `Spectrum peaks: ${r.peaks.map(([k, v]) => `<b>${k} Hz</b> × ${v.toFixed(1)}`).join(" · ")}`
        : "No peaks: the signal is flat.";
      qs("[data-mb]", mix).textContent = `${fs} per second · limit ${fs / 2} Hz`;
      qs("[data-mb]", mix).className = `wk-badge${waves.some((w) => w.f > fs / 2) ? " slow" : ""}`;
      // missions
      if (waves.length >= 2 && new Set(waves.map((w) => w.f)).size >= 2 && r.peaks.length >= 2) api.done("mix");
      if (aliased) {
        const w = waves.find((x) => x.id === aliased.id);
        if (w && w.f === aliased.f && w.f < fs / 2) {
          api.done("rescue");
        }
      }
      const hi = waves.find((w) => w.f > fs / 2);
      const still = aliased && waves.find((x) => x.id === aliased.id && x.f > fs / 2);
      if (hi && !still) {
        aliased = { id: hi.id, f: hi.f };
        const k = fold(hi.f, fs);
        api.done("alias");
        snd("wrong");
        say(
          `<b>${hi.f} Hz</b> is above half the sampling rate (<b>${fs / 2} Hz</b>). With only ${fs} samples a second, the dots can't tell it from a <b>${k} Hz</b> wave, so the bar shows up at <b>${k} Hz</b>. The red dashed curve passes through every dot.`,
        );
        api.say(`A fake ${k} Hz! Too few samples, and a fast wave impersonates a slow one.`, "surprised");
      } else if (
        aliased &&
        !hi &&
        !coachedAlias &&
        waves.some((w) => w.id === aliased.id && w.f === aliased.f && w.f < fs / 2)
      ) {
        coachedAlias = true;
        snd("correct");
        say(
          `Fixed! With <b>${fs}</b> samples a second the limit is <b>${fs / 2} Hz</b>, so <b>${aliased.f} Hz</b> shows where it really is. You need <b>more than twice</b> the highest frequency.`,
        );
        api.say(`Sample more than twice as fast as the fastest wave and the bar is honest.`, "love");
      }
      if (!hi && aliased && !waves.some((w) => w.id === aliased.id && w.f === aliased.f)) {
        aliased = null;
        coachedAlias = false;
      }
    }
    rows();
    update();

    /* ---------------- MYSTERY ---------------- */
    const myP = qs('[data-p="mys"]', stage),
      myst = (() => {
        let truth,
          marks = new Set(),
          shown = false,
          overlay = null,
          tries = 0;
        const ysc = scope(qs("[data-yscope]", myP), {
          onBar: (k) => {
            if (!shown) {
              ynote("Press <b>Show spectrum</b> first.");
              return;
            }
            if (k === 0) return;
            marks.has(k) ? marks.delete(k) : marks.add(k);
            snd("select");
            draw();
            qs("[data-ychk]", myP).disabled = !marks.size;
          },
        });
        const ynote = (h) => {
          qs("[data-ynote]", myP).innerHTML = h;
        };
        const fresh = () => {
          const pool = [];
          while (pool.length < 3) {
            const f = 2 + Math.floor(Math.random() * 23);
            if (pool.every((p) => Math.abs(p - f) >= 3)) pool.push(f);
          }
          const amps = [1, 0.7, 0.4].sort(() => Math.random() - 0.5);
          truth = pool.map((f, i) => ({ f, a: amps[i] })).sort((p, q) => p.f - q.f);
          marks = new Set();
          shown = false;
          overlay = null;
          tries = 0;
          qs("[data-show]", myP).disabled = false;
          qs("[data-ychk]", myP).disabled = true;
        };
        function draw() {
          ysc.update({ waves: truth, fs: 64, parts: false, hideSpec: !shown, marks, overlay, alias: false });
          qs("[data-yb]", myP).textContent = shown ? `${marks.size} picked` : "3 waves inside";
        }
        qs("[data-show]", myP).onclick = () => {
          shown = true;
          qs("[data-show]", myP).disabled = true;
          draw();
          snd("whoosh");
          ynote(
            "Each bar is a frequency hiding in the curve. Tap every bar that is a real wave, then press <b>Check my peaks</b>.",
          );
          api.say("The messy curve is just a few waves added together. Tall bars give them away.", "think");
        };
        qs("[data-new]", myP).onclick = () => {
          fresh();
          draw();
          ynote("A new mystery. Show the spectrum and read it.");
          snd("back");
        };
        qs("[data-ychk]", myP).onclick = () => {
          tries++;
          const tf = new Set(truth.map((t) => t.f)),
            miss = [...tf].filter((f) => !marks.has(f)),
            extra = [...marks].filter((f) => !tf.has(f));
          if (!miss.length && !extra.length) {
            overlay = truth.map((t) => ({
              f: t.f,
              a: +ysc
                .update({ waves: truth, fs: 64, parts: false, hideSpec: false, marks, alias: false })
                .amps[t.f].toFixed(2),
            }));
            draw();
            snd("complete");
            ynote(
              `Right: <b>${truth.map((t) => t.f + " Hz").join(", ")}</b>. The green dashed curve is rebuilt only from the bars you tapped, and it lies <b>exactly</b> on the mystery. The spectrum really is a full recipe.`,
            );
            api.say(`${tries === 1 ? "First go! " : ""}You read the recipe straight off the bars.`, "love");
            api.done("mystery");
          } else {
            snd("wrong");
            const parts = [];
            if (extra.length)
              parts.push(
                `${extra.map((f) => `<b>${f} Hz</b>`).join(", ")} ${extra.length > 1 ? "have" : "has"} a flat bar: nothing wiggles at that frequency`,
              );
            if (miss.length)
              parts.push(
                `you missed ${miss.map((f) => `<b>${f} Hz</b>`).join(", ")}: a short bar is still a real wave, just a weaker one`,
              );
            ynote(`Not quite: ${parts.join("; ")}.`);
            api.say("Look again: every wave gives one bar, tall or short.", "think");
            if (fxOn()) qsa(".aw9-bin.mk", myP).forEach((g) => N.fx.shake(g));
          }
        };
        fresh();
        return {
          enter() {
            draw();
          },
        };
      })();

    /* ---------------- HALVING ---------------- */
    const hP = qs('[data-p="half"]', stage),
      half = (() => {
        const NH = 16,
          x = Array.from({ length: NH }, (_, t) => Math.sin((TAU * 2 * t) / NH) + 0.6 * Math.sin((TAU * 5 * t) / NH));
        const cx = (re, im) => ({ re, im }),
          add = (a, b) => cx(a.re + b.re, a.im + b.im),
          sub = (a, b) => cx(a.re - b.re, a.im - b.im),
          mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
        let muls = 0;
        const dft = (s) => {
          const n = s.length;
          return Array.from({ length: n }, (_, k) => {
            let re = 0,
              im = 0;
            for (let t = 0; t < n; t++) {
              const a = (-TAU * k * t) / n;
              re += s[t] * Math.cos(a);
              im += s[t] * Math.sin(a);
              muls++;
            }
            return cx(re, im);
          });
        };
        muls = 0;
        const direct = dft(x),
          opsDirect = muls;
        muls = 0;
        const E = dft(x.filter((_, t) => t % 2 === 0)),
          O = dft(x.filter((_, t) => t % 2 === 1)),
          opsHalves = muls;
        const WO = Array.from({ length: 8 }, (_, k) =>
          mul(cx(Math.cos((-TAU * k) / NH), Math.sin((-TAU * k) / NH)), O[k]),
        );
        const comb = Array(NH);
        for (let k = 0; k < 8; k++) {
          comb[k] = add(E[k], WO[k]);
          comb[k + 8] = sub(E[k], WO[k]);
        }
        const err = Math.max(...comb.map((z, k) => Math.hypot(z.re - direct[k].re, z.im - direct[k].im)));
        const opsSplit = opsHalves + 8,
          mag = (z) => Math.hypot(z.re, z.im);
        const rc = (v) => {
          const t = Math.round(v * 100) / 100;
          return t === 0 ? 0 : t;
        };
        const fc = (z) => {
          const re = rc(z.re),
            im = rc(z.im);
          return `${re < 0 ? "−" : ""}${Math.abs(re).toFixed(2)} ${im < 0 ? "−" : "+"} ${Math.abs(im).toFixed(2)}i`;
        };
        let phase = 0,
          picked = new Set(),
          inspected = new Set();
        const host = qs("[data-hhost]", hP),
          mid = qs("[data-hmid]", hP),
          hn = (h) => {
            qs("[data-hnote]", hP).innerHTML = h;
          };
        const X = (t) => 24 + 32 * t,
          CY = [88, 252],
          SC = 46;
        const badge = () => {
          qs("[data-hb]", hP).textContent = [
            "Step 1 of 4: sort",
            "Step 2 of 4: split",
            "Step 3 of 4: half DFTs",
            "Step 4 of 4: combine",
            "Inspect the pairs",
          ][phase];
        };
        function build() {
          host.innerHTML = `<svg class="aw9-svg aw9-hsvg" viewBox="0 0 560 345" role="img" aria-label="Sixteen samples">
          <line class="aw9-ax" data-ax0 x1="8" x2="552" y1="${CY[0]}" y2="${CY[0]}"/><line class="aw9-ax" data-ax1 x1="8" x2="552" y1="${CY[1]}" y2="${CY[1]}" style="opacity:0"/>
          ${x.map((v, t) => `<g class="aw9-st" data-t="${t}" tabindex="0" role="button" aria-label="Sample x${t}"><rect class="hit" x="${X(t) - 16}" y="${CY[0] - 76}" width="32" height="168"/><line x1="${X(t)}" x2="${X(t)}" y1="${CY[0]}" y2="${CY[0] - v * SC}"/><circle cx="${X(t)}" cy="${CY[0] - v * SC}" r="8"/><text class="lb" x="${X(t)}" y="${CY[0] + 76}">x${t}</text></g>`).join("")}</svg>`;
          qsa(".aw9-st", host).forEach((g) => {
            g.onclick = () => tap(+g.dataset.t);
            g.onkeydown = (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tap(+g.dataset.t);
              }
            };
          });
        }
        function tap(t) {
          if (phase !== 0) return;
          const g = qs(`.aw9-st[data-t="${t}"]`, host);
          if (t % 2) {
            snd("wrong");
            fxOn() && N.fx.shake(g);
            hn(
              `<b>x${t}</b> has index <b>${t}</b>, which is odd. We count from 0, so the even indices are 0, 2, 4 … 14. Tap those.`,
            );
            api.say("Indices start at zero. Evens are 0, 2, 4…", "think");
            return;
          }
          if (picked.has(t)) return;
          picked.add(t);
          g.classList.add("ev");
          snd("select");
          hn(`<b>x${t}</b>: even. ${8 - picked.size} to go.`);
          if (picked.size === 8) {
            phase = 1;
            qsa(".aw9-st", host).forEach((s) => s.classList.add(+s.dataset.t % 2 ? "od" : "ev"));
            badge();
            qs("[data-split]", hP).disabled = false;
            snd("correct");
            hn("All eight evens found. The other eight are the <b>odd</b> ones. Now press <b>Split into two rows</b>.");
            api.say("Sorted! Two teams of eight: evens (blue) and odds (orange).", "happy");
          }
        }
        function split() {
          phase = 2;
          badge();
          qs("[data-split]", hP).disabled = true;
          qs("[data-halves]", hP).disabled = false;
          snd("whoosh");
          qsa(".aw9-st", host).forEach((g) => {
            const t = +g.dataset.t,
              row = t % 2,
              m = (t - row) / 2,
              nx = 28 + m * 64 + (row ? 32 : 0);
            g.style.transform = `translate(${nx - X(t)}px, ${row ? CY[1] - CY[0] : 0}px)`;
          });
          qs("[data-ax1]", host).style.opacity = 1;
          hn(
            "Top row: the <b>even</b> samples (blue). Bottom row: the <b>odd</b> ones (orange). Each row is a smaller problem, and a DFT of 8 samples costs far less than a DFT of 16.",
          );
        }
        const barsSvg = (vals, cls, title) => {
          const mx = Math.max(...vals, 1e-9);
          return `<div class="aw9-mini"><small>${title}</small><svg viewBox="0 0 ${vals.length * 28 + 8} 96" class="aw9-svg">${vals.map((v, k) => `<rect class="mb ${cls}" x="${6 + k * 28}" y="6" width="22" height="70" rx="3" style="--h:${Math.max(0.02, v / mx)};--i:${k}"/><text class="aw9-tl" x="${17 + k * 28}" y="92" text-anchor="middle">${k}</text>`).join("")}</svg></div>`;
        };
        function halves() {
          phase = 3;
          badge();
          qs("[data-halves]", hP).disabled = true;
          qs("[data-comb]", hP).disabled = false;
          snd("pop");
          mid.innerHTML = `<div class="aw9-two">${barsSvg(E.map(mag), "ev", "E: DFT of the even row (8 bins)")}${barsSvg(O.map(mag), "od", "O: DFT of the odd row (8 bins)")}</div>`;
          hn(
            `Two small DFTs: <b>E</b> from the blue row and <b>O</b> from the orange row. Together they took <b>${opsHalves}</b> multiplications. The direct 16-sample DFT takes <b>${opsDirect}</b>.`,
          );
        }
        function combine() {
          phase = 4;
          badge();
          qs("[data-comb]", hP).disabled = true;
          snd("complete");
          mid.insertAdjacentHTML(
            "beforeend",
            `<div class="aw9-full"><small>X: the full 16-bin spectrum, built from E and O. Tap a bar.</small><div data-xb></div><div class="aw9-insp" data-insp>Tap any bar to see how <b>E</b> and <b>O</b> make it.</div>
          <div class="wk-stats"><div class="wk-stat rose"><small>Direct DFT</small><b>${opsDirect} mults</b></div><div class="wk-stat teal"><small>Split once</small><b>${opsSplit} mults</b></div><div class="wk-stat"><small>Off from direct DFT by</small><b>${err < 1e-9 ? "0" : err.toExponential(1)}</b></div></div></div>`,
          );
          const mxv = Math.max(...comb.map(mag));
          qs("[data-xb]", mid).innerHTML =
            `<svg viewBox="0 0 ${16 * 34 + 8} 130" class="aw9-svg">${comb.map((z, k) => `<g class="aw9-xbin" data-k="${k}" tabindex="0" role="button" aria-label="Bin ${k}"><rect class="hit" x="${6 + k * 34}" y="0" width="32" height="126"/><rect class="mb" x="${8 + k * 34}" y="8" width="26" height="92" rx="3" style="--h:${Math.max(0.02, mag(z) / mxv)};--i:${k}"/><text class="v" x="${21 + k * 34}" y="${100 - 92 * (mag(z) / mxv) + 2}" text-anchor="middle" style="opacity:0">${mag(z).toFixed(1)}</text><text class="aw9-tl" x="${21 + k * 34}" y="118" text-anchor="middle">${k}</text></g>`).join("")}</svg>`;
          qsa(".aw9-xbin", mid).forEach((g) => {
            g.onclick = () => inspect(+g.dataset.k);
            g.onkeydown = (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inspect(+g.dataset.k);
              }
            };
          });
          hn(
            `Combined, and it matches the direct DFT (off by ${err < 1e-9 ? "0" : err.toExponential(1)}). Only <b>${opsSplit}</b> multiplications instead of <b>${opsDirect}</b>, and that's after a single split. Tap bars to see the pairs.`,
          );
          api.say("Same answer, less work. The trick is that bins k and k+8 share one product.", "happy");
        }
        function inspect(kk) {
          const k = kk % 8;
          inspected.add(k);
          snd("tick");
          qsa(".aw9-xbin", mid).forEach((g) => {
            const b = +g.dataset.k;
            g.classList.toggle("sel", b === k || b === k + 8);
            qs(".v", g).style.opacity = b === k || b === k + 8 ? 1 : 0;
          });
          qs("[data-insp]", mid).innerHTML =
            `<b>Bins ${k} and ${k + 8} share their work.</b><br>E[${k}] = ${fc(E[k])}<br>W·O[${k}] = ${fc(WO[k])} <span class="faint">(W = one twist, then O[${k}])</span><br>X[${k}] = E + W·O = <b>${fc(comb[k])}</b><br>X[${k + 8}] = E − W·O = <b>${fc(comb[k + 8])}</b><br><span class="faint">One multiplication gave two answers.</span>`;
          if (fxOn()) N.fx.bump(qs("[data-insp]", mid), { scale: 1.02 });
          if (inspected.size >= 2) {
            api.done("half");
          } else
            hn(
              `Bins <b>${k}</b> and <b>${k + 8}</b> both use the same E and W·O. Only the sign changes. Try another bar.`,
            );
          if (inspected.size === 2)
            api.say("Every pair works the same way: one product, added once and subtracted once.", "love");
        }
        function reset() {
          phase = 0;
          picked = new Set();
          inspected = new Set();
          mid.innerHTML = "";
          build();
          badge();
          qs("[data-split]", hP).disabled = true;
          qs("[data-halves]", hP).disabled = true;
          qs("[data-comb]", hP).disabled = true;
          hn(`Here are 16 samples of a signal. Tap the ones with an <b>even</b> index (x0, x2, x4 …).`);
        }
        qs("[data-split]", hP).onclick = split;
        qs("[data-halves]", hP).onclick = halves;
        qs("[data-comb]", hP).onclick = combine;
        qs("[data-hrs]", hP).onclick = () => {
          reset();
          snd("back");
        };
        reset();
        return {
          enter() {
            if (phase === 0 && !picked.size)
              api.say("Sixteen samples. Sort them into evens and odds, then split the job in half.", "idle");
          },
        };
      })();
  }
  Object.assign(partScope, { wavesWorkshop });
})();
