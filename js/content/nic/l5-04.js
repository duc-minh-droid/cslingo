/* l5-04: Lecture 5: 5.4 constrained reals, the jet nozzle. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.l5 = NIC.shared.l5 || {});
  const { ga, row } = sh;

  /* ============ 5.4 Constrained real genes: the jet nozzle ============ */
  const NZ0 = [2, 1.8, 1.1, 1.3, 1.3, 1.5];
  const nzOK = (d) => d[0] >= d[1] && d[1] >= d[2] && d[3] <= d[4] && d[4] <= d[5];
  const nozzleSVG = (d, w = 360, h = 120, bad = []) => {
    const n = d.length,
      sw = (w - 20) / n,
      mx = Math.max(2, ...d);
    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;background:var(--bg-2);border:1px solid var(--line);border-radius:12px">${d
      .map((x, i) => {
        const hh = (x / mx) * (h - 30);
        return `<rect x="${10 + i * sw}" y="${(h - hh) / 2}" width="${sw - 2}" height="${hh}" rx="4" fill="${bad.includes(i) ? "var(--rose)" : "var(--teal)"}" opacity="0.85"/><text x="${10 + i * sw + sw / 2 - 1}" y="${h - 4}" text-anchor="middle" font-size="10" fill="var(--text-faint)">${x.toFixed(1)}</text>`;
      })
      .join("")}</svg>`;
  };

  N.register({
    id: "l5-nozzle",
    lecture: 5,
    order: 4,
    num: "5.4",
    title: "Constrained reals: the jet nozzle",
    blurb:
      "Mutate a six-diameter nozzle and watch the ordering rule break, then switch to an encoding that cannot be invalid.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "One of the first EA applications: Rechenberg's pipe bend, then Schwefel's <b>two-phase jet nozzle</b> in the same lab, evolving the internal shape for maximum thrust. A fixed encoding uses six diameters with the rule <b>D1 ≥ D2 ≥ D3</b> and <b>D4 ≤ D5 ≤ D6</b>. A <b>variable-length</b> encoding drops the rule and lets sections be added or removed.",
        ),
      );
      const card = el(
        `<div class="card"><div class="tabs" id="tabs"><button data-t="fix" class="on">Fixed six diameters</button><button data-t="var">Variable length</button></div><div id="tb"></div></div>`,
      );
      root.appendChild(card);
      const TABS = {
        fix(tb) {
          let d = NZ0.slice(),
            prev = null,
            ch = -1;
          tb.innerHTML = `<p class="dim">Genes are diameters between 0.1 and 2. <b>Random-gene mutation</b> replaces one gene with a fresh random value in that range.</p><div class="controls"><button class="btn primary" data-o="m">Mutate a random gene</button><button class="btn" data-o="k">Mutate 2,000×, each gene</button><button class="btn ghost" data-o="r">Reset</button></div><div id="o"></div><canvas class="viz" id="cv" style="display:none"></canvas>`;
          const draw = () => {
            const ok = nzOK(d),
              bad = [];
            if (!ok) {
              if (d[0] < d[1]) bad.push(0, 1);
              if (d[1] < d[2]) bad.push(1, 2);
              if (d[3] > d[4]) bad.push(3, 4);
              if (d[4] > d[5]) bad.push(4, 5);
            }
            qs("#o", tb).innerHTML =
              (prev ? row("before", ga(prev.map((x) => x.toFixed(2)))) : "") +
              row(
                prev ? "after" : "genes",
                ga(
                  d.map((x) => x.toFixed(2)),
                  (i) => (bad.includes(i) ? "bad" : i === ch ? "changed" : ""),
                ),
              ) +
              nozzleSVG(d, 360, 120, bad) +
              `<div class="callout ${ok ? "teal" : "rose"}">${ok ? "<b>Valid nozzle.</b> D1 ≥ D2 ≥ D3 and D4 ≤ D5 ≤ D6." : "<b>Invalid nozzle.</b> The ordering rule is broken at the red sections."}</div>`;
          };
          qsa("[data-o]", tb).forEach(
            (b) =>
              (b.onclick = () => {
                const o = b.dataset.o;
                if (o === "r") {
                  d = NZ0.slice();
                  prev = null;
                  ch = -1;
                  return draw();
                }
                if (o === "m") {
                  prev = d.slice();
                  ch = randint(0, 5);
                  d[ch] = 0.1 + rnd() * 1.9;
                  return draw();
                }
                const per = [],
                  R = 2000;
                for (let i = 0; i < 6; i++) {
                  let ok = 0;
                  for (let r = 0; r < R; r++) {
                    const x = NZ0.slice();
                    x[i] = 0.1 + rnd() * 1.9;
                    if (nzOK(x)) ok++;
                  }
                  per.push((100 * ok) / R);
                }
                const cv = qs("#cv", tb);
                if (!cv) return;
                cv.style.display = "";
                N.barChart(cv, {
                  groups: [{ values: per, color: N.colors().teal }],
                  labels: ["D1", "D2", "D3", "D4", "D5", "D6"],
                  names: ["% of mutations that stay valid"],
                  height: 190,
                  decimals: 0,
                  yMax: 100,
                });
                qs("#o", tb).insertAdjacentHTML(
                  "beforeend",
                  `<p>Average over the six genes: <b>${Math.round(per.reduce((a, b) => a + b, 0) / 6)}%</b> of random-gene mutations of 2, 1.8, 1.1, 1.3, 1.3, 1.5 stay valid.</p>`,
                );
              }),
          );
          draw();
        },
        var(tb) {
          let v = { pre: [2, 1.5], small: 0.6, post: [1.1, 1.7] };
          tb.innerHTML = `<p class="dim">Genotype: how many sections before the smallest, how many after, and their diameters. The <b>only</b> rule: the middle section is the smallest. Mutations change a diameter, add a section or delete one.</p><div class="controls"><button class="btn primary" data-o="m">Mutate</button><button class="btn" data-o="k">Mutate 2,000× and check</button><button class="btn ghost" data-o="r">Reset</button></div><div id="o"></div>`;
          const flat = () => [...v.pre, v.small, ...v.post];
          const valid = () => {
            const s = v.small;
            return v.pre.concat(v.post).every((x) => x >= s) && s >= 0.1;
          };
          const mut = () => {
            const r = randint(0, 3);
            if (r === 0 && v.pre.length + v.post.length > 0) {
              const arr = rnd() < 0.5 && v.pre.length ? v.pre : v.post.length ? v.post : v.pre;
              const i = randint(0, arr.length - 1);
              arr[i] = v.small + rnd() * (2 - v.small);
            } else if (r === 1) {
              v.small = 0.1 + rnd() * (Math.min(...v.pre, ...v.post, 2) - 0.1);
            } else if (r === 2 && v.pre.length + v.post.length < 8) {
              (rnd() < 0.5 ? v.pre : v.post).push(v.small + rnd() * (2 - v.small));
            } else if (v.pre.length + v.post.length > 1) {
              const arr = rnd() < 0.5 && v.pre.length ? v.pre : v.post.length ? v.post : v.pre;
              arr.splice(randint(0, arr.length - 1), 1);
            }
          };
          const draw = () => {
            const d = flat();
            qs("#o", tb).innerHTML =
              row("Z1, Z2", ga([v.pre.length, v.post.length]), "sections before / after the smallest") +
              row(
                "diameters",
                ga(
                  d.map((x) => x.toFixed(2)),
                  (i) => (i === v.pre.length ? "changed" : ""),
                ),
              ) +
              nozzleSVG(d, 360, 120) +
              `<div class="callout teal"><b>${d.length} sections.</b> Always valid: the smallest is in the middle by construction.</div>`;
          };
          qsa("[data-o]", tb).forEach(
            (b) =>
              (b.onclick = () => {
                const o = b.dataset.o;
                if (o === "r") {
                  v = { pre: [2, 1.5], small: 0.6, post: [1.1, 1.7] };
                  return draw();
                }
                if (o === "m") {
                  mut();
                  return draw();
                }
                let ok = 0,
                  lenSet = new Set();
                for (let r = 0; r < 2000; r++) {
                  mut();
                  if (valid()) ok++;
                  lenSet.add(flat().length);
                }
                draw();
                qs("#o", tb).insertAdjacentHTML(
                  "beforeend",
                  `<p><b>${ok}</b> of 2,000 mutated nozzles were valid. The number of sections wandered through <b>${lenSet.size}</b> different lengths.</p>`,
                );
              }),
          );
          draw();
        },
      };
      qsa("#tabs button", card).forEach((b) =>
        b.addEventListener("click", () => {
          qsa("#tabs button", card).forEach((x) => x.classList.toggle("on", x === b));
          TABS[b.dataset.t](qs("#tb", card));
        }),
      );
      TABS.fix(qs("#tb", card));
      root.appendChild(
        predict({
          id: "l5-noz-1",
          q: "In 2, 1.8, 1.1, 1.3, 1.3, 1.5, gene D1 = 2 (the maximum). Random-gene mutation draws a fresh value from 0.1 to 2. How likely is D1 to stay ≥ D2 = 1.8?",
          opts: ["About 10%", "About 50%", "About 90%"],
          a: 0,
          why: "Only values between 1.8 and 2 keep the order. That is 0.2 out of a range of 1.9, about <b>10%</b>.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-noz-2",
          q: "Which gene of 2, 1.8, 1.1, 1.3, 1.3, 1.5 is most likely to stay valid after a random-gene mutation?",
          opts: ["D1", "D3", "D5", "D6"],
          a: 1,
          why: "D3 only has to stay ≤ D2 = 1.8, so any new value up to 1.8 is fine: about 90%. D1 and D5 sit in tight spots (about 10% each), and D6 must be ≥ 1.3 (about 37%).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Random-gene mutation on an ordered real vector breaks the ordering most of the time (about 57% of mutations of the lecture genotype).",
            "A variable-length encoding with one simple rule (middle section smallest) is valid after every mutation.",
            "Because it can add and delete sections, the EA can <b>innovate</b>: reach shapes the fixed encoding cannot express.",
          ],
          "Choose an encoding whose rules survive mutation, and let it grow.",
        ),
      );
    },
  });

  const F_ = N.fig;
  const compare2 = () =>
    F_.compare(
      { title: "Fixed: 6 diameters", body: "Always 5 sections.<br>Can only tune what you built in.", c: "blue" },
      { title: "Variable length", body: "Sections can be added or deleted.<br>New shapes are reachable.", c: "teal" },
    );
  L["l5-nozzle"] = {
    sum: "A fixed set of ordered diameters is fragile under mutation. A <b>variable-length</b> encoding with one simple rule is always valid and lets the EA <b>innovate</b>.",
    steps: [
      {
        t: "One of the first EA applications",
        b: `<p>Find the internal shape of a <b>two-phase jet nozzle</b> that gives the maximum thrust under given starting conditions. Ingo Rechenberg did the very first one (a pipe bend); Schwefel did the nozzle later in the same lab with an evolution strategy.</p><p class="dim">A recurring theme: design freedom gives entirely new, better designs, based on principles we don't yet understand.</p>`,
        v: F.flow(["Rechenberg: pipe bend", "Schwefel: jet nozzle", { t: "Maximum thrust", c: "teal" }]),
        c: {
          q: "What is the recurring theme of these early EA design problems?",
          o: [
            "Freedom in the encoding can give new, better designs",
            "EAs only ever fine-tune designs engineers already know",
            "Binary encodings are the only ones that work in practice",
          ],
          a: 0,
          why: "Evolved nozzles looked nothing like what engineers drew.",
        },
      },
      {
        t: "A fixed encoding",
        b: `<p>Six diameters D1 … D6 (five sections) with the rule <b>D1 ≥ D2 ≥ D3</b> and <b>D4 ≤ D5 ≤ D6</b>. Each is allowed between 0.1 and 2.</p>`,
        v: row("genes", ga([2, 1.8, 1.1, 1.3, 1.3, 1.5])) + nozzleSVG(NZ0, 360, 110),
        c: {
          q: "Is 2, 1.8, 1.1, 1.3, 1.3, 1.5 a valid genotype?",
          o: [
            "Yes: 2 ≥ 1.8 ≥ 1.1 and 1.3 ≤ 1.3 ≤ 1.5",
            "No: D3 must be larger than D4 for a valid nozzle",
            "No: D4 and D5 must differ, so 1.3 and 1.3 is invalid",
          ],
          a: 0,
          why: "Both ordered runs are respected. There is no rule between D3 and D4.",
        },
      },
      {
        t: "What does random-gene mutation do?",
        b: `<p>Replace one gene with a random value in the range. Most of the time that <b>breaks an ordering</b>. For this genotype the chance of staying valid is about 10% for D1, 47% for D2, 90% for D3, 63% for D4, 11% for D5 and 37% for D6: <b>43%</b> on average.</p>`,
        v: `<div class="fig-bars">${[
          ["D1", 10],
          ["D2", 47],
          ["D3", 90],
          ["D4", 63],
          ["D5", 11],
          ["D6", 37],
        ]
          .map(
            ([l, p]) =>
              `<div class="fb-row"><span class="fb-l">${l}</span><span class="fb-track"><span class="fb-fill" style="--w:${p / 100};background:var(--teal)"></span></span><span class="fb-v">${p}%</span></div>`,
          )
          .join("")}</div>`,
        c: {
          q: "What is the likely effect of random-gene mutation on this genotype?",
          o: ["It usually breaks the ordering rule", "It always keeps the nozzle valid", "It never changes the shape"],
          a: 0,
          why: "Only about 43% of mutations stay valid, so most break a rule.",
        },
      },
      {
        t: "Variable length, one rule",
        b: `<p>Genotype: <b>Z1, Z2</b> (sections before and after the smallest) followed by the diameters. The <b>only</b> constraint: the middle section is the smallest. Mutations may change diameters, <b>add</b> sections or <b>delete</b> them.</p>`,
        v:
          row("Z1, Z2", ga([2, 2])) +
          row(
            "diameters",
            ga([2, 1.5, 0.6, 1.1, 1.7], (i) => (i === 2 ? "changed" : "")),
          ),
        c: {
          q: "Which encoding is valid after every mutation?",
          o: [
            "The variable-length one with a smallest middle section",
            "The fixed six-diameter one with two ordered runs",
            "Both, because mutation never breaks rules",
          ],
          a: 0,
          why: "Its single rule is kept by construction.",
        },
      },
      {
        t: "Innovation, not just optimisation",
        b: `<p>Because the number of sections can change, the EA can <b>discover shapes you did not think of</b>. A fixed list of six diameters can only tune the shape you gave it.</p>`,
        v: compare2(),
        c: {
          q: "Why can the variable-length encoding innovate?",
          o: [
            "The number of sections can change, so new shapes exist",
            "It uses a larger population than the fixed encoding",
            "It needs no fitness function to judge its shapes",
          ],
          a: 0,
          why: "A fixed encoding can only express shapes with the sections you built in.",
        },
      },
    ],
    guide: [
      "Press <b>Mutate a random gene</b> repeatedly and watch for red sections.",
      "Press <b>Mutate 2,000×, each gene</b> to see the chance each gene stays valid.",
      "Switch to <b>Variable length</b> and mutate: it is always valid.",
      "Answer the questions after the demo.",
    ],
  };
})();
