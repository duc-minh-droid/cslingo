/* l5-01: Lecture 5 (encodings): 5.1 valid tours, 5.2 direct encodings. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, shuffle } = N;
  const L = N.LESSONS;
  const sh = (NIC.shared.l5 = NIC.shared.l5 || {});

  // ---------- tiny builders (same look as the other lectures) ----------
  const ga = (arr, cls = "") =>
    `<span class="genome">${arr.map((c, i) => `<span class="gene ${typeof cls === "function" ? cls(i) : cls}">${c}</span>`).join("")}</span>`;
  const gs = (s, cls = "") => ga([...s], cls);
  const row = (lbl, html, extra = "") =>
    `<div class="genome-row"><span class="lbl">${lbl}</span>${html}${extra ? `<span class="mono dim">${extra}</span>` : ""}</div>`;
  const dupMask = (arr) => arr.map((c) => arr.filter((x) => x === c).length > 1);
  const table = (head, rows) =>
    `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ============ 5.1 Valid tours: mutation, crossover and repair ============ */
  const repairTour = (s, ref) => {
    const seen = new Set(),
      miss = [...ref].filter((c) => !s.includes(c));
    return [...s]
      .map((c) => {
        if (!seen.has(c)) {
          seen.add(c);
          return c;
        }
        return miss.shift();
      })
      .join("");
  };
  const cross1 = (a, b, cut) => [a.slice(0, cut) + b.slice(cut), b.slice(0, cut) + a.slice(cut)];
  const isPerm = (s) => new Set(s).size === s.length;

  N.register({
    id: "l5-valid",
    lecture: 5,
    order: 1,
    num: "5.1",
    title: "Keeping tours valid",
    blurb: "Standard mutation and crossover break a TSP tour. Cross two tours, then repair the damage.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A tour is a <b>permutation</b>: every city exactly once. <b>Standard</b> operators know nothing about that rule, so they can build tours that visit a city twice and skip another. Two ways out: use a <b>better operator</b>, or add a <b>fix</b> that repairs the child.",
        ),
      );
      let p1 = "ADECB",
        p2 = "AECDB",
        cut = 2,
        repair = false;
      const card = el(
        `<div class="card"><div class="card-head"><h2>Cross two tours</h2></div><div class="controls" id="c"></div><div id="viz"></div><div id="tab"></div><div id="mut"></div></div>`,
      );
      root.appendChild(card);
      const sCut = N.slider("Cut after gene", 1, 4, 1, cut);
      sCut.onInput((v) => {
        cut = v;
        draw();
      });
      const rep = el(`<label class="field"><input type="checkbox" id="rp"> repair the children</label>`);
      qs("input", rep).onchange = (e) => {
        repair = e.target.checked;
        draw();
      };
      const bLec = el(`<button class="btn ghost">Lecture parents</button>`),
        bRnd = el(`<button class="btn">Random parents</button>`),
        bSame = el(`<button class="btn">Same parent twice</button>`);
      bLec.onclick = () => {
        p1 = "ADECB";
        p2 = "AECDB";
        draw();
      };
      bRnd.onclick = () => {
        p1 = shuffle([..."ABCDE"]).join("");
        p2 = shuffle([..."ABCDE"]).join("");
        draw();
      };
      bSame.onclick = () => {
        p2 = p1;
        draw();
      };
      qs("#c", card).append(sCut, rep, bLec, bRnd, bSame);
      function draw() {
        const [r1, r2] = cross1(p1, p2, cut);
        const c1 = repair ? repairTour(r1, p1) : r1,
          c2 = repair ? repairTour(r2, p2) : r2;
        const bad1 = dupMask([...c1]),
          bad2 = dupMask([...c2]);
        const mark = (c, raw, bad, side) =>
          ga([...c], (i) => (bad[i] ? "bad" : c[i] !== raw[i] ? "good" : i < cut ? side : side === "p1" ? "p2" : "p1"));
        qs("#viz", card).innerHTML =
          row("Parent 1", gs(p1, "p1")) +
          row("Parent 2", gs(p2, "p2")) +
          row("Child 1", mark(c1, r1, bad1, "p1"), repair ? "" : isPerm(c1) ? "valid" : "invalid") +
          row("Child 2", mark(c2, r2, bad2, "p2"), repair ? "" : isPerm(c2) ? "valid" : "invalid") +
          `<div class="callout ${isPerm(c1) && isPerm(c2) ? "teal" : "rose"}">${isPerm(c1) && isPerm(c2) ? (repair ? "Both children are valid tours." : "Both children happen to be valid for this cut.") : `Invalid: ${[...new Set([...c1].filter((_, i) => bad1[i]).concat([...c2].filter((_, i) => bad2[i])))].join(", ")} ${"appear twice in a child"}. Tick <b>repair</b> to put the missing cities back.`}</div>`;
        const rows = [1, 2, 3, 4].map((k) => {
          const [a, b] = cross1(p1, p2, k);
          return [`after gene ${k}`, `${a} ${isPerm(a) ? "✓" : "✗"}`, `${b} ${isPerm(b) ? "✓" : "✗"}`];
        });
        qs("#tab", card).innerHTML =
          `<h4>Every cut for these parents (no repair)</h4>` + table(["cut", "child 1", "child 2"], rows);
        qs("#mut", card).innerHTML = "";
      }
      draw();
      // Mutation: standard vs swap on parent 1
      const mcard = el(
        `<div class="card"><div class="card-head"><h2>Mutate a tour</h2></div><div class="controls"><button class="btn" data-m="std">Standard (change one gene)</button><button class="btn" data-m="swap">Swap two genes</button><button class="btn ghost" data-m="rs">Reset</button></div><div id="out"></div><div class="controls"><button class="btn" id="t2k">Try 2,000 random crossovers</button><span id="tr" class="dim"></span></div></div>`,
      );
      root.appendChild(mcard);
      let tour = "ADECB",
        prev = null,
        chg = [];
      const drawM = (note = "") => {
        const bad = dupMask([...tour]);
        qs("#out", mcard).innerHTML =
          (prev ? row("before", gs(prev)) : "") +
          row(
            prev ? "after" : "tour",
            ga([...tour], (i) => (bad[i] ? "bad" : chg.includes(i) ? "changed" : "")),
          ) +
          note;
      };
      qsa("[data-m]", mcard).forEach(
        (b) =>
          (b.onclick = () => {
            const m = b.dataset.m;
            if (m === "rs") {
              tour = "ADECB";
              prev = null;
              chg = [];
              return drawM();
            }
            prev = tour;
            const a = [...tour];
            if (m === "std") {
              const i = randint(0, 4),
                pool = [..."ABCDE"].filter((c) => c !== a[i]);
              a[i] = pool[randint(0, pool.length - 1)];
              chg = [i];
              tour = a.join("");
              drawM(
                isPerm(tour)
                  ? ""
                  : `<div class="callout rose"><b>Invalid.</b> A city is now visited twice and another is missing.</div>`,
              );
            } else {
              const i = randint(0, 4);
              let j;
              do j = randint(0, 4);
              while (j === i);
              [a[i], a[j]] = [a[j], a[i]];
              chg = [i, j];
              tour = a.join("");
              drawM(`<div class="callout teal"><b>Valid.</b> Swap only rearranges cities already in the tour.</div>`);
            }
          }),
      );
      drawM();
      qs("#t2k", mcard).onclick = () => {
        let ok = 0,
          tot = 0;
        for (let t = 0; t < 2000; t++) {
          const a = shuffle([..."ABCDE"]).join(""),
            b = shuffle([..."ABCDE"]).join(""),
            k = randint(1, 4),
            [x, y] = cross1(a, b, k);
          ok += isPerm(x) + isPerm(y);
          tot += 2;
        }
        qs("#tr", mcard).innerHTML =
          `Without repair, <b>${Math.round((100 * ok) / tot)}%</b> of the children were valid tours. With repair: <b>100%</b>.`;
      };
      root.appendChild(
        predict({
          id: "l5-valid-1",
          q: "Both parents are the <b>same</b> tour. Does 1-point crossover at any cut give valid children?",
          opts: [
            "Yes: both tours list the cities in the same order, so none repeats",
            "No: the cut always puts the same city on both sides of it",
            "Only when the cut falls at the very end of the tour",
          ],
          a: 0,
          why: "A child is the head of one copy and the tail of the other. Both copies hold the cities in the same order, so every city appears exactly once. The trouble starts when the parents <i>differ</i>: the head can already contain cities that the other parent's tail repeats.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-valid-2",
          q: "Look at the table of cuts for the lecture parents ADECB and AECDB. Which cuts give invalid children?",
          opts: [
            "Cuts after gene 1 and gene 4",
            "Cuts after gene 2 and gene 3",
            "Every cut",
            "No cut: these parents are safe",
          ],
          a: 1,
          why: "Cut after 1 or 4 only swaps the first city (A in both) or the last (B in both), so the children are the parents again. Cuts after 2 and 3 mix different heads and tails, which repeats a city (e.g. ADE|DB repeats D and drops C).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A tour must contain every city exactly once. Standard mutation (random new value) and standard crossover can break that.",
            "Swap mutation keeps a permutation valid because it only rearranges cities that are already there.",
            "For crossover: use an operator built for permutations, or <b>fix</b> the child (copy, swap tails, then replace repeated cities with the missing ones).",
          ],
          "Operators have to respect the shape of the encoding, or you spend your time repairing.",
        ),
      );
    },
  });

  L["l5-valid"] = {
    sum: "A good encoding is the main design decision in an EA. For tours, <b>standard</b> operators break the permutation, so we need swap-style mutation and a fix for crossover.",
    steps: [
      {
        t: "Encoding is the big decision",
        b: `<p>Given a problem, you must decide how to write a candidate solution as a chromosome. There are <b>many</b> possible encodings for the same problem, and each one changes the <b>shape of the landscape</b> and which strategy climbs it best.</p>`,
        v: row("TSP tour", gs("ADECB")) + `<p class="dim">One way to write the tour A→D→E→C→B.</p>`,
        c: {
          q: "You switch to a different encoding of the same problem. What changes?",
          o: [
            "Only how fast fitness is computed",
            "The landscape, and which operators and strategies suit it",
            "Nothing: the fitness function alone decides the landscape",
          ],
          a: 1,
          why: "Neighbours, ruggedness and the legal moves all depend on how a solution is written down.",
        },
      },
      {
        t: "Standard mutation breaks a tour",
        b: `<p>Standard mutation picks a gene and gives it a random new value. On a tour that can visit one city <b>twice</b> and another <b>never</b>.</p>`,
        v:
          row("before", gs("ADECB")) +
          row(
            "after",
            gs("ACECB", (i) => (i === 1 || i === 3 ? "bad" : "")),
          ) +
          `<p class="dim">C twice, D not at all.</p>`,
        c: {
          q: "After ADECB becomes ACECB, what is wrong?",
          o: [
            "City C is visited twice and D not at all",
            "The tour now has six cities",
            "City A has been dropped from the tour",
          ],
          a: 0,
          why: "Position 2 changed from D to C, so C appears at positions 2 and 4 and D has vanished.",
        },
      },
      {
        t: "Swap fixes mutation",
        b: `<p><b>Swap</b> exchanges two genes. It only rearranges cities that are already there, so the result is always a valid tour.</p>`,
        v:
          row("before", gs("ADECB")) +
          row(
            "after",
            gs("ACEDB", (i) => (i === 1 || i === 3 ? "good" : "")),
          ),
        c: {
          q: "Why is swap mutation safe for permutations?",
          o: [
            "It only rearranges cities already in the tour",
            "It always shortens the tour",
            "It replaces one city with a brand-new one",
          ],
          a: 0,
          why: "No city is created or destroyed, only moved.",
        },
      },
      {
        t: "Crossover has the same problem",
        b: `<p>Cut two tours and swap the tails and you often get a child with a repeated city. Two strategies: <b>(1)</b> a better crossover to begin with, or <b>(2)</b> a <b>fix</b> that makes the child valid again.</p>`,
        v:
          row("Parent 1", gs("ADECB", "p1")) +
          row("Parent 2", gs("AECDB", "p2")) +
          row(
            "Child 1",
            ga([..."ADEDB"], (i) => (i === 1 || i === 3 ? "bad" : i < 3 ? "p1" : "p2")),
          ) +
          `<p class="dim">Cut after gene 3: D appears twice.</p>`,
        c: {
          q: "The child ADEDB has a repeated D. Which city is missing?",
          o: ["C", "B", "E"],
          a: 0,
          why: "A, D, E and B are all there; the only city of A–E not present is C.",
        },
      },
      {
        t: "Copy, swap, repair",
        b: `<p>The lecture's fix: <b>copy</b> the parents, <b>swap</b> the tails, then <b>repair</b> by replacing the repeated city with the one that is missing.</p>`,
        v:
          row(
            "swapped",
            ga([..."ADEDB"], (i) => (i === 3 ? "bad" : "")),
          ) +
          row(
            "repaired",
            ga([..."ADECB"], (i) => (i === 3 ? "good" : "")),
          ),
        c: {
          q: "What does the repair step do?",
          o: [
            "Replaces a repeated gene with a city that is missing",
            "Throws the child away and picks new parents",
            "Leaves the child alone and lowers its fitness",
          ],
          a: 0,
          why: "Repair keeps the child and edits it into a valid tour. Penalising fitness instead is the alternative used with direct encodings.",
        },
      },
    ],
    guide: [
      "Move the <b>Cut</b> slider and watch which cuts give invalid children.",
      "Tick <b>repair</b> to fix the children.",
      "Press <b>Try 2,000 random crossovers</b> to see how often the raw operator breaks a tour.",
      "Answer the questions after the demo.",
    ],
  };
  Object.assign(sh, { ga, gs, row, dupMask, table, mulberry });
})();
