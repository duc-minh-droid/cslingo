/* l5-03: Lecture 5: 5.3 direct vs indirect timetabling. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint } = N;
  const L = N.LESSONS;
  const sh = (NIC.shared.l5 = NIC.shared.l5 || {});
  const { ga, row, table } = sh;

  /* ============ 5.3 Direct vs indirect: timetabling ============ */
  const CL = [
    [1, 2],
    [1, 3],
    [2, 6],
    [2, 7],
    [2, 8],
    [3, 5],
    [3, 6],
    [4, 6],
    [4, 7],
    [5, 7],
    [5, 8],
    [6, 8],
  ];
  const NB = Array.from({ length: 8 }, () => []);
  CL.forEach(([a, b]) => {
    NB[a - 1].push(b - 1);
    NB[b - 1].push(a - 1);
  });
  const DAYS = ["Mon", "Tue", "Wed", "Thu"],
    TIMES4 = ["9:00", "11:00", "2:00", "4:00"];
  const clashes = (slot) => CL.filter(([a, b]) => Math.abs(slot[a - 1] - slot[b - 1]) <= 1).length;
  const clashers = (slot) => {
    const s = new Set();
    CL.forEach(([a, b]) => {
      if (Math.abs(slot[a - 1] - slot[b - 1]) <= 1) {
        s.add(a - 1);
        s.add(b - 1);
      }
    });
    return s;
  };
  const decode = (genes) => {
    const slot = [];
    for (let i = 0; i < 8; i++) {
      const ok = [];
      for (let s = 1; s <= 16; s++) if (!NB[i].some((j) => j < i && Math.abs(slot[j] - s) <= 1)) ok.push(s);
      slot[i] = ok[(genes[i] - 1) % ok.length];
    }
    return slot;
  };
  const gridHTML = (slot, bad) =>
    `<table class="t" style="max-width:420px;text-align:center"><tr><th></th>${DAYS.map((d) => `<th>${d}</th>`).join("")}</tr>${TIMES4.map(
      (tm, r) =>
        `<tr><th>${tm}</th>${DAYS.map((_, d) => {
          const s = d * 4 + r + 1,
            ex = slot.map((x, i) => (x === s ? i : -1)).filter((i) => i >= 0);
          return `<td>${ex.map((i) => `<b${bad.has(i) ? ' style="color:var(--rose)"' : ""}>E${i + 1}</b>`).join(" ")}</td>`;
        }).join("")}</tr>`,
    ).join("")}</table>`;

  N.register({
    id: "l5-indirect",
    lecture: 5,
    order: 3,
    num: "5.3",
    title: "Direct vs indirect: timetabling",
    blurb:
      "The same exam timetable, written two ways. Mutate each and compare how many exams move and how many clashes appear.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "<b>Direct:</b> gene i is the <i>slot</i> of exam i, so any string of 8 numbers from 1 to 16 is a timetable. <b>Indirect:</b> gene i says <i>use the k-th clash-free slot</i> for exam i, so a small <b>decoder</b> builds the timetable and clashes are avoided by construction. Two exams <b>clash</b> if the lecture's conflict list joins them and they sit in the same or neighbouring slot.",
        ),
      );
      const D0 = [4, 5, 13, 1, 1, 7, 13, 2],
        I0 = [4, 5, 10, 1, 1, 7, 15, 2];
      let dG = D0.slice(),
        iG = I0.slice(),
        dPrev = null,
        iPrev = null,
        dMoved = [],
        iMoved = [];
      const card = el(
        `<div class="card"><div class="card-head"><h2>Mutate both timetables</h2></div><div class="controls"><button class="btn primary" id="m1">Mutate a random gene in both</button><button class="btn" id="m1k">Mutate 1,000×</button><button class="btn ghost" id="rs">Reset</button></div><div class="grid two"><div id="dd"></div><div id="ii"></div></div><div id="cmp"></div><canvas class="viz" id="ch" style="display:none"></canvas></div>`,
      );
      root.appendChild(card);
      const part = (title, genes, slot, moved, kind) => {
        const bad = clashers(slot),
          n = clashes(slot);
        return `<h4>${title}</h4>${row(
          "genes",
          ga(genes, (i) => (moved.includes(i) ? "changed" : "")),
        )}${row(
          "slots",
          ga(slot, (i) => (bad.has(i) ? "bad" : moved.includes(i) ? "changed" : "")),
        )}${gridHTML(slot, bad)}<p class="${n ? "" : "dim"}"><b>${n}</b> clashing ${n === 1 ? "pair" : "pairs"}${kind === "i" ? " (the decoder only picks clash-free slots)" : ""}</p>`;
      };
      function draw() {
        const ds = dG,
          is = decode(iG);
        qs("#dd", card).innerHTML = part("Direct", dG, ds, dMoved, "d");
        qs("#ii", card).innerHTML = part("Indirect", iG, is, iMoved, "i");
        const mv = (a, b) => (a && b ? b.map((x, i) => (x !== a[i] ? "E" + (i + 1) : null)).filter(Boolean) : []);
        const dm = dPrev ? mv(dPrev, ds) : [],
          im = iPrev ? mv(iPrev, is) : [];
        qs("#cmp", card).innerHTML = dPrev
          ? `<div class="callout blue"><b>Last mutation.</b> Direct moved <b>${dm.length}</b> exam${dm.length === 1 ? "" : "s"} (${dm.join(", ") || "none"}). Indirect moved <b>${im.length}</b> (${im.join(", ") || "none"}).</div>`
          : `<p class="dim">Press <b>Mutate</b> to change one gene in each chromosome.</p>`;
      }
      const mutate = (g, k) => {
        const i = randint(0, 7);
        let v;
        do v = randint(1, k);
        while (v === g[i]);
        const o = g.slice();
        o[i] = v;
        return [o, i];
      };
      qs("#m1", card).onclick = () => {
        dPrev = dG.slice();
        iPrev = decode(iG);
        let i;
        [dG, i] = mutate(dG, 16);
        dMoved = [i];
        [iG, i] = mutate(iG, 16);
        iMoved = [i];
        draw();
      };
      qs("#rs", card).onclick = () => {
        dG = D0.slice();
        iG = I0.slice();
        dPrev = iPrev = null;
        dMoved = iMoved = [];
        draw();
      };
      qs("#m1k", card).onclick = () => {
        let dm = 0,
          im = 0,
          dc = 0,
          ic = 0;
        const R = 1000;
        for (let r = 0; r < R; r++) {
          const [d2] = mutate(D0, 16),
            [i2] = mutate(I0, 16),
            a = D0,
            b = d2,
            ia = decode(I0),
            ib = decode(i2);
          dm += b.filter((x, k) => x !== a[k]).length;
          im += ib.filter((x, k) => x !== ia[k]).length;
          dc += clashes(b);
          ic += clashes(ib);
        }
        const cv = qs("#ch", card);
        cv.style.display = "";
        N.barChart(cv, {
          groups: [
            { values: [dm / R, im / R], color: N.colors().blue },
            { values: [dc / R, ic / R], color: N.colors().rose },
          ],
          labels: ["Direct", "Indirect"],
          names: ["exams moved per mutation", "clashing pairs after mutation"],
          height: 190,
          decimals: 2,
        });
        qs("#cmp", card).innerHTML =
          `<div class="callout blue"><b>1,000 single-gene mutations of the lecture chromosomes.</b> Direct: <b>${(dm / R).toFixed(2)}</b> exams moved, <b>${(dc / R).toFixed(2)}</b> clashing pairs on average. Indirect: <b>${(im / R).toFixed(2)}</b> exams moved, <b>${(ic / R).toFixed(2)}</b> clashing pairs.</div>`;
      };
      draw();
      root.appendChild(
        predict({
          id: "l5-ind-1",
          q: "In the <b>indirect</b> timetable, can a single-gene mutation produce two clashing exams?",
          opts: [
            "No: the decoder only ever picks clash-free slots",
            "Yes: any mutation can create a clash",
            "Only if the mutated gene is the last one",
          ],
          a: 0,
          why: "Each exam takes the k-th slot that is free of clashes with exams already placed, so no clash can appear. The constraint is enforced by the <b>encoding</b>, not by the fitness function.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-ind-2",
          q: "You mutate gene 3 of the indirect chromosome. Which exams can change slot?",
          opts: [
            "Exam 3 only, because only its gene changed",
            "Exam 3 and possibly some later exams",
            "Exams 1 and 2, which are decoded before it",
          ],
          a: 1,
          why: "Exam 3 may land in a different slot, which changes which slots are clash-free for exams decoded after it. So one gene can move several exams: the neighbourhood is <b>rugged</b>.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Direct:</b> genes are problem variables; mutation moves one exam; invalid solutions are penalised in fitness.",
            "<b>Indirect:</b> genes are inputs to a constructive heuristic (a decoder); constraints are mostly enforced by the encoding.",
            "Indirect uses domain knowledge and shrinks the search space, but decoding is slower and neighbourhoods are rugged.",
          ],
          "Direct is smooth and fast but lets clashes in. Indirect keeps clashes out but one mutation can shake many exams.",
        ),
      );
    },
  });

  L["l5-indirect"] = {
    sum: "A <b>direct</b> encoding stores the answer itself. An <b>indirect</b> one stores instructions for a decoder that builds the answer, so it can bake in domain knowledge.",
    steps: [
      {
        t: "Direct: the gene is the slot",
        b: `<p>Eight exams, sixteen slots (4 days × 4 times). Gene i is the slot of exam i, so <b>any</b> string of 8 numbers from 1 to 16 is a timetable. Fitness can count clashes, back-to-back exams and so on.</p>`,
        v: row("genes", ga([4, 5, 13, 1, 1, 7, 13, 2])) + `<p class="dim">Exam 1 in slot 4, exam 2 in slot 5, …</p>`,
        c: {
          q: "What is true of every string of 8 numbers from 1 to 16 as a direct timetable?",
          o: [
            "It is a timetable, but it may contain clashes",
            "It is a clash-free timetable",
            "It is not a timetable until it is repaired",
          ],
          a: 0,
          why: "Every string maps to a timetable. Whether it is any good is up to the fitness function.",
        },
      },
      {
        t: "Mutating a direct timetable",
        b: `<p>Single-gene mutation changes <b>one</b> exam's slot, and nothing else. Easy to predict, and the landscape is smooth. The catch: the new slot may clash.</p>`,
        v:
          row("before", ga([4, 5, 13, 1, 1, 7, 13, 2])) +
          row(
            "after",
            ga([4, 5, 6, 1, 1, 7, 13, 2], (i) => (i === 2 ? "changed" : "")),
          ),
        c: {
          q: "Single-gene mutation of a direct timetable moves how many exams?",
          o: ["Exactly one", "Every exam that clashes with it", "Every exam after it"],
          a: 0,
          why: "Only the exam whose gene changed moves.",
        },
      },
      {
        t: "Indirect: the gene is an instruction",
        b: `<p>Now gene i means <b>"use the k-th clash-free slot for exam i"</b>. A decoder goes through the exams in order and, for each, lists the slots that do not clash with exams already placed, then takes the k-th one.</p>`,
        v: `<div class="mini-row"><span class="pill blue">genes 4, 5, 10, …</span><span class="arrow">→</span><span class="pill">decoder</span><span class="arrow">→</span><span class="pill teal">clash-free timetable</span></div>`,
        c: {
          q: "In the indirect encoding, what does the number 4 in gene 1 mean?",
          o: [
            "Put exam 1 in slot 4, whatever is there",
            "Use the 4th clash-free slot for exam 1",
            "Exam 1 clashes with exam 4",
          ],
          a: 1,
          why: "The gene picks from the list of clash-free slots, not from all 16.",
        },
      },
      {
        t: "One gene, many moves",
        b: `<p>Changing one indirect gene can change which slots are free for <b>later</b> exams, so the decoder may move several exams. Neighbouring chromosomes can give quite different timetables: the landscape is <b>rugged</b>.</p>`,
        v:
          row("genes", ga([4, 5, 10, 1, 1, 7, 15, 2])) +
          row(
            "mutate gene 2",
            ga([4, 9, 10, 1, 1, 7, 15, 2], (i) => (i === 1 ? "changed" : "")),
          ) +
          `<p class="dim">The new gene 2 can change which slots are free for exams 3 to 8.</p>`,
        c: {
          q: "Why is the indirect landscape rugged?",
          o: [
            "A small gene change can shift many exams",
            "Its fitness function is random",
            "It has more genes than the direct one",
          ],
          a: 0,
          why: "The decoder's choices cascade: early decisions change what is available later.",
        },
      },
      {
        t: "Direct versus indirect",
        b: `<p>The lecture's comparison:</p>`,
        v:
          table(
            ["", "Modifies", "Invalid solutions"],
            [
              [
                "<b>Direct</b>",
                "a variable of the problem (exam time, pipe size)",
                "dealt with <b>solely by penalising fitness</b>",
              ],
              [
                "<b>Indirect</b>",
                "the variables of a constructive heuristic (clash-free slot, rules for sizing pipes)",
                "mostly dealt with by the <b>encoding</b>; some penalty if needed",
              ],
            ],
          ) +
          table(
            ["Direct", "Indirect"],
            [
              ["straightforward genotype → phenotype map", "easier to exploit domain knowledge"],
              [
                "effects of mutation easy to estimate (smoother landscape)",
                "can enforce constraints and cut the search space",
              ],
              [
                "fast interpretation, so quicker fitness evaluation",
                "slow interpretation; highly rugged neighbourhoods",
              ],
            ],
          ),
        c: {
          q: "Which is a downside of an <b>indirect</b> encoding?",
          o: [
            "Slow decoding and rugged neighbourhoods",
            "It can never enforce any problem constraints",
            "It needs a much larger population to work",
          ],
          a: 0,
          why: "You pay for the decoder's knowledge with time and a less predictable landscape.",
        },
      },
    ],
    guide: [
      "Press <b>Mutate a random gene in both</b> a few times.",
      "Compare how many exams moved in each timetable.",
      "Press <b>Mutate 1,000×</b> for the averages.",
      "Answer the questions after the demo.",
    ],
  };
})();
