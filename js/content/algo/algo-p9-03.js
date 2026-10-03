(function () {
  const partScope = (NIC.shared.algoP9 = NIC.shared.algoP9 || {});
  const { addV } = partScope;
  const N = NIC;
  const { el, qsa } = N;
  const L = N.LESSONS;
  const FG = NIC.fig;
  addV(
    "a9-dft",
    4,
    FG.compare(
      {
        title: "Whole number of cycles",
        c: "teal",
        body:
          FG.bars(
            [
              ["bin 4", 100, "teal"],
              ["bin 5", 0.5, "dim"],
              ["bin 6", 0.5, "dim"],
            ],
            { max: 100, fmt: () => "" },
          ) + "all energy in one bin",
      },
      {
        title: "Cycles cut off mid-way",
        c: "rose",
        body:
          FG.bars(
            [
              ["bin 4", 62, "rose"],
              ["bin 5", 24, "rose"],
              ["bin 6", 9, "rose"],
            ],
            { max: 100, fmt: () => "" },
          ) + "energy smears into neighbours",
      },
    ) +
      `<div class="fig-cap">Illustrative bar heights; try it for real in the playground by choosing a frequency that isn't a whole number.</div>`,
  );
  addV(
    "a9-fft",
    0,
    `<table class="t" style="max-width:520px"><tr><th>N</th><th class="num">direct DFT (N²)</th><th class="num">FFT (N log₂N)</th><th class="num">saving</th></tr><tr><td>8</td><td class="num">64</td><td class="num">24</td><td class="num">2.7×</td></tr><tr><td>1,024</td><td class="num">1,048,576</td><td class="num">10,240</td><td class="num">102×</td></tr><tr class="hl"><td>1,000,000</td><td class="num">10¹²</td><td class="num">≈ 2 × 10⁷</td><td class="num">≈ 50,000×</td></tr></table>`,
  );
  addV(
    "a9-fft",
    3,
    `<svg class="fig" viewBox="0 0 360 170" style="max-height:170px"><g class="fi"><circle cx="50" cy="45" r="16" fill="var(--panel-2)" stroke="var(--teal)" stroke-width="2"/><text x="50" y="50" class="fig-n">a</text></g><g class="fi"><circle cx="50" cy="125" r="16" fill="var(--panel-2)" stroke="var(--amber)" stroke-width="2"/><text x="50" y="130" class="fig-n">b</text></g><path d="M66 45 L290 45 M66 125 L290 125 M66 45 L290 125 M66 125 L290 45" stroke="var(--line-2)" stroke-width="2" fill="none" class="draw"/><rect x="150" y="113" width="42" height="24" rx="6" fill="var(--violet-dim)" stroke="var(--violet)"/><text x="171" y="130" class="fig-sub" style="fill:var(--violet)">×W</text><g class="fi"><text x="300" y="50" class="fig-box" style="text-anchor:start">a + W·b</text><text x="300" y="130" class="fig-box" style="text-anchor:start">a − W·b</text></g></svg><div class="fig-cap">One multiply by W, shared by both outputs: that's the butterfly.</div>`,
  );
  addV(
    "a9-fft",
    4,
    FG.cells([{ v: 8, c: "teal" }, "→", { v: 4, c: "teal" }, "→", { v: 2, c: "teal" }, "→", { v: 1, c: "teal" }]) +
      FG.cells([{ v: 6, c: "rose" }, "→", { v: 3, c: "rose" }, "→", { v: "1.5 ✗", c: "rose" }]) +
      `<div class="fig-cap">Powers of two halve cleanly down to 1; other sizes get zero-padded or use mixed-radix steps.</div>`,
  );
  addV(
    "a9-fft",
    5,
    FG.bars(
      [
        ["direct DFT, N = 10⁶", 12, "rose", "10¹² ops"],
        ["FFT, N = 10⁶", 7.3, "teal", "2 × 10⁷ ops"],
      ],
      { max: 12, fmt: () => "" },
    ) + `<div class="fig-cap">Bar length is log-scaled: the real gap is about 50,000×.</div>`,
  );

  /* ---------- step-through runner: the 8-point butterfly network ---------- */
  function fftRun(box, life) {
    const NP = 8,
      BITS = 3,
      x = [3, 1, 0, 2, 1, 0, 2, 1];
    const rev = (r) => {
      let o = 0;
      for (let b = 0; b < BITS; b++) o |= ((r >> b) & 1) << (BITS - 1 - b);
      return o;
    };
    const cx = { re: 0, im: 0 };
    const add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
      sub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
    const mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
    const r2 = (v) => {
      const t = Math.round(v * 100) / 100;
      return t === 0 ? 0 : t;
    };
    const sn = (v) => (v < 0 ? "−" : "") + Math.abs(v);
    const fc = (z) => {
      const re = r2(z.re),
        im = r2(z.im);
      if (!im) return sn(re);
      const ims = Math.abs(im) + "i";
      if (!re) return (im < 0 ? "−" : "") + ims;
      return `${sn(re)} ${im < 0 ? "−" : "+"} ${ims}`;
    };
    const BW = 92,
      BH = 26,
      X0 = 78,
      DX = 150,
      Y0 = 58,
      DYR = 34,
      W = 610,
      H = Y0 + DYR * 7 + 26;
    const colX = (s) => X0 + s * DX,
      rowY = (r) => Y0 + r * DYR;
    function* frames() {
      let a = Array.from({ length: NP }, (_, r) => ({ re: x[rev(r)], im: 0 }));
      const cols = [a.map((z, r) => `x${rev(r)} = ${fc(z)}`), ...[1, 2, 3].map(() => Array(NP).fill(""))];
      const done = [];
      const snap = (o) => ({ cols: cols.map((cl) => cl.slice()), done: done.slice(), cur: null, ...o });
      yield snap({
        cap: "The 8 samples, reordered bit-reversed (row 1 holds x4). Each one is already a size-1 DFT. Tap a sample to change it.",
      });
      for (let s = 0; s < BITS; s++) {
        const h = 1 << s,
          m = 2 * h,
          nxt = a.slice();
        for (let g = 0; g < NP; g += m)
          for (let j = 0; j < h; j++) {
            const t = g + j,
              u = t + h,
              ang = (-2 * Math.PI * j) / m,
              w = { re: Math.cos(ang), im: Math.sin(ang) };
            const wb = mul(w, a[u]);
            nxt[t] = add(a[t], wb);
            nxt[u] = sub(a[t], wb);
            cols[s + 1][t] = fc(nxt[t]);
            cols[s + 1][u] = fc(nxt[u]);
            done.push(`${s}:${t}`);
            const ask =
              s === 1 && t === 0
                ? {
                    q: "New stage, new partners. Which row does row <b>0</b> pair with now? Tap it.",
                    pick: ".rn-fft-n.rn-fft-c1",
                    a: String(u),
                    why: `In stage ${s + 1} partners sit <b>${h}</b> rows apart, so row 0 pairs with row ${u}.`,
                  }
                : null;
            yield snap({
              cur: { s, t, u },
              ask,
              cap: `Stage ${s + 1} (size ${m}): rows <b>${t}</b> and <b>${u}</b>, W = <b>${fc(w)}</b>. Top: a + W·b = <b>${fc(nxt[t])}</b>. Bottom: a − W·b = <b>${fc(nxt[u])}</b>.`,
            });
          }
        a = nxt;
      }
      // check against the direct O(N²) sum
      let err = 0;
      for (let k = 0; k < NP; k++) {
        let z = { ...cx };
        for (let t = 0; t < NP; t++) {
          const an = (-2 * Math.PI * k * t) / NP;
          z = add(z, { re: x[t] * Math.cos(an), im: x[t] * Math.sin(an) });
        }
        err = Math.max(err, Math.hypot(z.re - a[k].re, z.im - a[k].im));
      }
      yield snap({
        mood: "love",
        cap: `Done: row k now holds X[k], in normal order. ${err < 1e-9 ? "It matches the direct DFT exactly" : "Check failed against the direct DFT"}, using <b>12 butterflies</b> instead of 64 multiply-adds.`,
      });
    }
    FG.run(box, life, {
      build(stage, api) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("class", "fig rn-svg rn-fft");
        let lines = "",
          nodes = "";
        for (let s = 0; s < BITS; s++) {
          const h = 1 << s;
          for (let r = 0; r < NP; r++) {
            const p = r ^ h,
              top = Math.min(r, p);
            [r, p].forEach(
              (to) =>
                (lines += `<line class="rn-fft-e" data-b="${s}:${top}" x1="${colX(s) + BW / 2}" y1="${rowY(r)}" x2="${colX(s + 1) - BW / 2}" y2="${rowY(to)}"/>`),
            );
          }
        }
        const heads = ["input (bit-reversed)", "stage 1", "stage 2", "stage 3 = X[k]"];
        for (let s = 0; s <= BITS; s++)
          for (let r = 0; r < NP; r++)
            nodes += `<g class="rn-fft-n rn-fft-c${s}" data-k="${r}" transform="translate(${colX(s)} ${rowY(r)})"><g class="rn-fft-in-g"><rect x="${-BW / 2}" y="${-BH / 2}" width="${BW}" height="${BH}" rx="8"/><text y="4.5"></text></g></g>`;
        svg.innerHTML = `${heads.map((t, s) => `<text class="rn-fft-h" x="${colX(s)}" y="24">${t}</text>`).join("")}
          ${Array.from({ length: NP }, (_, r) => `<text class="rn-fft-row" x="14" y="${rowY(r) + 4}">${r}</text><text class="rn-fft-row" x="${colX(3) + BW / 2 + 18}" y="${rowY(r) + 4}">X${r}</text>`).join("")}
          <g>${lines}</g><g>${nodes}</g>`;
        const wrap = el(`<div class="rn-fft-wrap"></div>`);
        wrap.appendChild(svg);
        stage.appendChild(wrap);
        const s = {
          lines: qsa(".rn-fft-e", svg),
          node: (col, r) => {
            const g = svg.querySelector(`.rn-fft-c${col}[data-k="${r}"]`);
            return { g, inner: g.firstChild, t: g.querySelector("text") };
          },
        };
        for (let r = 0; r < NP; r++) {
          const n0 = s.node(0, r);
          api.edit(n0.g, {
            get: () => x[rev(r)],
            set: (v) => {
              x[rev(r)] = v;
              n0.t.textContent = `x${rev(r)} = ${v}`;
            },
            min: -5,
            max: 9,
          });
        }
        return s;
      },
      draw(s, f, c) {
        const cur = f.cur,
          key = cur && `${cur.s}:${cur.t}`;
        s.lines.forEach((ln) => {
          ln.classList.toggle("rn-fft-hot", ln.dataset.b === key);
          ln.classList.toggle("rn-fft-did", ln.dataset.b !== key && f.done.includes(ln.dataset.b));
        });
        for (let col = 0; col <= BITS; col++)
          for (let r = 0; r < NP; r++) {
            const h = s.node(col, r),
              v = f.cols[col][r],
              was = c.prev ? c.prev.cols[col][r] : "";
            const isIn = !!cur && col === cur.s && (r === cur.t || r === cur.u),
              isOut = !!cur && col === cur.s + 1 && (r === cur.t || r === cur.u);
            h.g.classList.toggle("rn-fft-in", isIn);
            h.g.classList.toggle("rn-fft-out", isOut);
            h.g.classList.toggle("rn-fft-empty", !v);
            h.t.textContent = v || "";
            if (isOut && v && v !== was) FG.rn.pulse(c, h.inner, 0.2);
          }
      },
      frames,
    });
  }
  if (L["a9-fft"])
    L["a9-fft"].steps.splice(4, 0, {
      t: "Watch it run",
      b: `<p>All 12 butterflies of an 8-point FFT. Press <b>play</b> or step with the arrows: each step combines one pair of rows and writes two new values.</p><p>It will pause once and ask you to predict a pair. Tap an input sample to change it and the run recomputes.</p>`,
      v: (box, life) => fftRun(box, life),
    });
})();
