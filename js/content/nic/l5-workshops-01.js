/* l5-workshops-01.js: Nature-Inspired Lecture 5 workshop 5.W "Encoding sandbox" (no code).
   Part A: a small job assignment (3 bakers, 5 orders) written two ways. Part B: an exam timetable, direct vs indirect.
   Every total, clash count and "moved exams" figure comes from running the real encodings/decoder on the chromosome. */
(function () {
  const N = NIC,
    { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ---------- Part A data: hours each baker needs for each order ---------- */
  const TIMES = [
    [5, 3, 6, 4, 7],
    [4, 6, 2, 5, 3],
    [6, 4, 5, 3, 4],
  ];
  const NW = TIMES.length,
    NJ = TIMES[0].length;
  const totalOf = (g) => g.reduce((s, w, j) => s + TIMES[w - 1][j], 0);
  // brute force over every one of the 3^5 assignments: the best total and the mean total of a random one
  const ALL = Array.from({ length: NW ** NJ }, (_, c) =>
    Array.from({ length: NJ }, (_, j) => (Math.floor(c / NW ** j) % NW) + 1),
  ).map(totalOf);
  const BEST = Math.min(...ALL),
    MEAN = ALL.reduce((a, b) => a + b, 0) / ALL.length;
  const coverage = (g) => {
    const by = Array.from({ length: NJ }, () => []);
    g.forEach((j, w) => by[j - 1].push(w + 1));
    return by;
  };

  /* ---------- Part B data: seven exams, twelve slots, nine conflicts ---------- */
  const NE = 7,
    NS = 12;
  const CL = [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
    [5, 6],
    [5, 7],
    [6, 7],
    [2, 6],
  ];
  const NB = Array.from({ length: NE }, () => []);
  CL.forEach(([a, b]) => {
    NB[a - 1].push(b - 1);
    NB[b - 1].push(a - 1);
  });
  const pairsIn = (slot) => CL.filter(([a, b]) => Math.abs(slot[a - 1] - slot[b - 1]) <= 1);
  const decode = (genes) => {
    const slot = [];
    for (let i = 0; i < NE; i++) {
      const ok = [];
      for (let s = 1; s <= NS; s++) if (!NB[i].some((j) => j < i && Math.abs(slot[j] - s) <= 1)) ok.push(s);
      slot[i] = ok[(genes[i] - 1) % ok.length];
    }
    return slot;
  };
  const D0 = [1, 4, 7, 10, 2, 8, 5],
    I0 = [1, 3, 2, 2, 1, 3, 1];
  const DAYS = ["Mon", "Tue", "Wed"],
    HOURS = ["9:00", "11:00", "2:00", "4:00"];
  const movedBy = (a, b) => a.map((x, i) => (x !== b[i] ? i : -1)).filter((i) => i >= 0);
  // every single-gene change of a chromosome: how many exams move and how many clashing pairs appear
  function scan(genes, toSlots) {
    const base = toSlots(genes);
    let n = 0,
      moved = 0,
      clash = 0,
      most = 0;
    genes.forEach((_, i) => {
      for (let v = 1; v <= NS; v++) {
        if (v === genes[i]) continue;
        const g = genes.slice();
        g[i] = v;
        const s = toSlots(g),
          m = movedBy(base, s).length;
        n++;
        moved += m;
        clash += pairsIn(s).length;
        most = Math.max(most, m);
      }
    });
    return { moved: moved / n, clash: clash / n, most };
  }

  const gridHTML = (slot, bad) =>
    `<table class="t nw5-grid"><tr><th></th>${DAYS.map((d) => `<th>${d}</th>`).join("")}</tr>${HOURS.map(
      (tm, r) =>
        `<tr><th>${tm}</th>${DAYS.map((_, d) => {
          const s = d * 4 + r + 1,
            ex = slot.map((x, i) => (x === s ? i : -1)).filter((i) => i >= 0);
          return `<td>${ex.map((i) => `<b class="${bad.has(i) ? "nw5-bad" : ""}">E${i + 1}</b>`).join(" ")}</td>`;
        }).join("")}</tr>`,
    ).join("")}</table>`;
  const stepper = (label, v, i, on) =>
    `<span class="nw5-gs"><small>${label}</small><span class="nw5-gr"><button class="nw5-st" data-i="${i}" data-d="-1" aria-label="Lower ${label}">−</button><b class="gene ${on ? "changed" : ""}">${v}</b><button class="nw5-st" data-i="${i}" data-d="1" aria-label="Raise ${label}">+</button></span></span>`;

  /* ======================= Part A: jobs ======================= */
  function jobsPanel(host, api) {
    let enc = 1,
      g = [1, 1, 1],
      muts = 0;
    host.innerHTML = `<div class="wk-card"><h3>Who does which order?</h3>
      <p class="wk-note">3 bakers (W1 to W3), 5 orders (J1 to J5). Every order needs exactly one baker, and we want the smallest total time. The table shows the hours each baker needs.</p>
      <div class="wk-row" data-seg></div>
      <div class="nw5-genes" data-genes></div>
      <div class="wk-row"><button class="btn" data-rand>Random chromosome</button><button class="btn" data-mut>Mutate one gene</button><button class="btn ghost" data-test>Test 1,000 random chromosomes</button></div>
      <div data-out></div><div data-tbl></div><div data-test-out></div></div>`;
    const out = qs("[data-out]", host),
      genes = qs("[data-genes]", host);
    const k = () => (enc === 1 ? NJ : NW);
    const fresh = () => Array.from({ length: enc === 1 ? NW : NJ }, () => N.randint(1, k()));
    qs("[data-seg]", host).append(
      N.seg(
        [
          ["1", "Encoding 1: a gene per baker (value = order)"],
          ["2", "Encoding 2: a gene per order (value = baker)"],
        ],
        "1",
        (v) => {
          enc = +v;
          g = enc === 1 ? [1, 1, 1] : [1, 1, 1, 1, 1];
          qs("[data-test-out]", host).innerHTML = "";
          draw();
        },
      ),
    );
    function draw(changed = -1) {
      genes.innerHTML = g
        .map((v, i) =>
          stepper(enc === 1 ? `W${i + 1} does` : `J${i + 1} by`, (enc === 1 ? "J" : "W") + v, i, i === changed),
        )
        .join("");
      qsa(".nw5-st", genes).forEach(
        (b) =>
          (b.onclick = () => {
            const i = +b.dataset.i;
            g[i] = ((g[i] - 1 + +b.dataset.d + k()) % k()) + 1;
            draw(i);
          }),
      );
      const chosen = new Set(enc === 1 ? g.map((j, w) => w * NJ + j - 1) : g.map((w, j) => (w - 1) * NJ + j));
      qs("[data-tbl]", host).innerHTML =
        `<table class="t nw5-grid"><tr><th></th>${TIMES[0].map((_, j) => `<th>J${j + 1}</th>`).join("")}</tr>${TIMES.map(
          (r, w) =>
            `<tr><th>W${w + 1}</th>${r.map((h, j) => `<td class="${chosen.has(w * NJ + j) ? "nw5-pick" : ""}">${h}</td>`).join("")}</tr>`,
        ).join("")}</table>`;
      if (enc === 1) {
        const by = coverage(g),
          done = by.filter((x) => x.length).length,
          lost = by.map((x, j) => (x.length ? "" : `J${j + 1}`)).filter(Boolean);
        out.innerHTML = `<div class="callout rose"><b>Invalid.</b> This chromosome covers <b>${done} of ${NJ}</b> orders${lost.length ? `, so ${lost.join(", ")} get no baker` : ""}. With one gene per baker there are only ${NW} genes, so at most <b>${NW}</b> orders can ever be covered.</div>`;
        if (done === NW) {
          api.say(
            `The best you can do here is <b>${NW} of ${NJ}</b> orders. No chromosome in this encoding is ever valid.`,
            "think",
          );
          api.done("cover");
        }
      } else {
        const load = Array(NW).fill(0);
        g.forEach((w, j) => (load[w - 1] += TIMES[w - 1][j]));
        const t = totalOf(g);
        out.innerHTML = `<div class="callout teal"><b>Valid.</b> Every order has exactly one baker. Total <b>${t} h</b> (best possible ${BEST} h, a random chromosome averages ${MEAN.toFixed(1)} h). Loads: ${load.map((h, w) => `W${w + 1} ${h} h`).join(", ")}.</div>`;
        if (t <= BEST + 2) {
          api.say(`Total <b>${t} h</b>, within 2 hours of the best possible <b>${BEST} h</b>.`, "happy");
          api.done("best");
        }
      }
    }
    qs("[data-rand]", host).onclick = () => {
      g = fresh();
      draw();
    };
    qs("[data-mut]", host).onclick = () => {
      const i = N.randint(0, g.length - 1);
      let v;
      do v = N.randint(1, k());
      while (v === g[i]);
      g[i] = v;
      muts++;
      draw(i);
      if (enc === 2) api.say(`Mutation ${muts}: still a valid chromosome. In Encoding 2 every string is.`, "idle");
    };
    qs("[data-test]", host).onclick = () => {
      let cover = 0,
        tot = 0;
      const R = 1000;
      for (let t = 0; t < R; t++) {
        const c = fresh();
        if (enc === 1 ? coverage(c).every((x) => x.length) : true) cover++;
        if (enc === 2) tot += totalOf(c);
      }
      qs("[data-test-out]", host).innerHTML =
        `<div class="callout blue">${R} random chromosomes: <b>${cover}</b> cover every order${enc === 2 ? `. Their mean total was <b>${(tot / R).toFixed(1)} h</b> against a best of <b>${BEST} h</b>` : ` (impossible with ${NW} genes for ${NJ} orders)`}.</div>`;
    };
    draw();
  }

  /* ======================= Part B: timetable ======================= */
  function ttPanel(host, api) {
    let dG = D0.slice(),
      iG = I0.slice(),
      iEdits = 0;
    const info = { d: null, i: null };
    host.innerHTML = `<div class="wk-card"><h3>Exam timetable: direct vs indirect</h3>
      <p class="wk-note">7 exams, 12 slots (Mon to Wed). Two exams <b>clash</b> if they are in conflict and sit in the <b>same or neighbouring</b> slot. <b>Direct:</b> gene = the exam's slot. <b>Indirect:</b> gene = "take the k-th clash-free slot", decoded in exam order.</p>
      <div class="wk-row"><button class="btn ghost" data-reset>Reset both</button><button class="btn" data-scan>Try every single-gene change</button></div>
      <div class="nw5-two"><div data-pane="d"></div><div data-pane="i"></div></div><div data-scan-out></div></div>`;
    const pane = (k) => qs(`[data-pane="${k}"]`, host);
    const slotsOf = { d: () => dG, i: () => decode(iG) };
    function draw(k, changed = -1) {
      const genes = k === "d" ? dG : iG,
        slot = slotsOf[k](),
        pairs = pairsIn(slot),
        bad = new Set(pairs.flat().map((x) => x - 1));
      pane(k).innerHTML = `<h4>${k === "d" ? "Direct" : "Indirect"}</h4><div class="nw5-genes">${genes
        .map((v, i) => stepper("E" + (i + 1), v, i, i === changed))
        .join(
          "",
        )}</div>${k === "i" ? `<p class="wk-note">Decoded slots: <b>${slot.join(", ")}</b></p>` : ""}${gridHTML(slot, bad)}
        <div class="callout ${pairs.length ? "rose" : "teal"}"><b>${pairs.length}</b> clashing pair${pairs.length === 1 ? "" : "s"}${pairs.length ? ": " + pairs.map(([a, b]) => `E${a}-E${b}`).join(", ") : ""}.</div>
        <p class="wk-note">${info[k] || "Use − and + on any gene."}</p>`;
      qsa(".nw5-st", pane(k)).forEach((b) => (b.onclick = () => edit(k, +b.dataset.i, +b.dataset.d)));
    }
    function edit(k, i, d) {
      const genes = k === "d" ? dG : iG,
        before = slotsOf[k]().slice();
      genes[i] = ((genes[i] - 1 + d + NS) % NS) + 1;
      const after = slotsOf[k](),
        mv = movedBy(before, after).map((x) => "E" + (x + 1)),
        c = pairsIn(after).length;
      info[k] =
        `Last edit (E${i + 1}): moved <b>${mv.length}</b> exam${mv.length === 1 ? "" : "s"} (${mv.join(", ") || "none"}), <b>${c}</b> clashing pair${c === 1 ? "" : "s"} now.`;
      draw(k, i);
      if (k === "d" && c > 0) {
        api.say(
          "One gene changed and a clash appeared. A direct encoding can only <b>punish</b> clashes, not prevent them.",
          "surprised",
        );
        api.done("dclash");
      }
      if (k === "i") {
        iEdits++;
        if (c === 0 && iEdits >= 6) {
          api.say(`<b>${iEdits} edits</b>, and the decoder never produced a clash.`, "love");
          api.done("iclean");
        }
        if (mv.length >= 4) {
          api.say(
            `One indirect gene moved <b>${mv.length}</b> exams: the decoder re-places every later exam around the change.`,
            "surprised",
          );
          api.done("ripple");
        }
      }
    }
    qs("[data-reset]", host).onclick = () => {
      dG = D0.slice();
      iG = I0.slice();
      info.d = info.i = null;
      qs("[data-scan-out]", host).innerHTML = "";
      draw("d");
      draw("i");
    };
    qs("[data-scan]", host).onclick = () => {
      const a = scan(dG, (x) => x),
        b = scan(iG, decode);
      qs("[data-scan-out]", host).innerHTML =
        `<div class="callout blue"><b>Every one-gene change of the current chromosomes (${NE} genes x ${NS - 1} new values).</b> Direct: <b>${a.moved.toFixed(2)}</b> exams move on average, <b>${a.clash.toFixed(2)}</b> clashing pairs, at most ${a.most} moved. Indirect: <b>${b.moved.toFixed(2)}</b> exams move on average (up to <b>${b.most}</b>), <b>${b.clash.toFixed(2)}</b> clashing pairs.</div>`;
    };
    draw("d");
    draw("i");
  }

  N.register({
    id: "l5-encsand",
    subject: "nic",
    lecture: 5,
    order: 90,
    num: "5.W",
    workshop: true,
    title: "Workshop: encoding sandbox",
    blurb:
      "No code. Build chromosomes by hand, see which encodings can be invalid and which mutations ripple furthest.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "nic",
        intro:
          "Same problem, two ways to write it down. Start in <b>Encoding 1</b> and try to cover every order with the genes you are given.",
        missions: [
          {
            id: "cover",
            t: "Cover as many orders as you can",
            d: "In <b>Encoding 1</b>, use + and − so every baker does a <b>different</b> order.",
            hint: "Give W1 order J1, W2 order J2 and W3 order J3. Two orders are left over whatever you do.",
          },
          {
            id: "best",
            t: "Build a cheap valid chromosome",
            d: `Switch to <b>Encoding 2</b> and get the total within 2 hours of the best possible (${BEST} h).`,
            hint: "For each order pick the baker with the smallest number in that column of the table.",
          },
          {
            id: "dclash",
            t: "Break a clean timetable",
            d: "Open <b>Timetable</b>. On the <b>Direct</b> side change one gene until two exams clash.",
            hint: "Move E1 next to E2. E2 is in slot 4, so try slot 3 for E1.",
          },
          {
            id: "iclean",
            t: "Try to make the decoder fail",
            d: "Edit the <b>Indirect</b> genes six times. Look for any clashing pair.",
            hint: "There will not be one. The decoder only offers slots that avoid exams already placed.",
          },
          {
            id: "ripple",
            t: "Find a ripple",
            d: "Change <b>one</b> Indirect gene so that <b>four or more</b> exams move.",
            hint: "Early genes matter most: change E1's gene, since every later exam is placed around it.",
          },
        ],
        build(stage, api) {
          const jobs = el(`<div></div>`),
            tt = el(`<div hidden></div>`),
            bar = el(`<div class="wk-row nw5-tabs"></div>`);
          bar.appendChild(
            N.seg(
              [
                ["jobs", "Jobs (5.2)"],
                ["tt", "Timetable (5.3)"],
              ],
              "jobs",
              (v) => {
                jobs.hidden = v !== "jobs";
                tt.hidden = v !== "tt";
              },
            ),
          );
          stage.append(bar, jobs, tt);
          jobsPanel(jobs, api);
          ttPanel(tt, api);
        },
      });
      root.appendChild(
        predict({
          id: "l5-encsand-1",
          q: "A chromosome uses one gene per baker, and there are 5 orders for 3 bakers. How many orders can the best possible chromosome cover?",
          opts: ["3 of the 5", "All 5", "4 of the 5"],
          a: 0,
          why: "Each baker's gene names a single order, so 3 genes name at most 3 different orders. The encoding cannot express a valid answer, which is why the lecture prefers one gene per order.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-encsand-2",
          q: "You mutate one gene of an indirect timetable chromosome and many exams change slot. Why?",
          opts: [
            "Later exams are decoded around the changed slot",
            "The mutation also changed the other genes",
            "The decoder picks slots at random each time",
          ],
          a: 0,
          why: "The decoder places exams in order, and each choice depends on what is already placed. Change an early gene and everything decoded after it can shift, but the result is still clash-free.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Pick the <b>encoding so that every chromosome is a valid answer</b>: one gene per order (Encoding 2) always is, one gene per baker never is.",
            "In a <b>direct</b> encoding a one-gene mutation changes one thing, but can create a clash that only the fitness function punishes.",
            "An <b>indirect</b> encoding plus a decoder keeps clashes out by construction, at the price of mutations that can <b>ripple</b> through later genes.",
          ],
          "Make invalid answers impossible to write down, rather than punishing them afterwards.",
        ),
      );
    },
  });

  L["l5-encsand"] = {
    sum: "Build job and timetable chromosomes by hand and see what each encoding can and cannot express.",
    steps: [
      {
        t: "Two ways to write the same answer",
        b: `<p>You will share out <b>5 orders</b> between <b>3 bakers</b>. <b>Encoding 1</b> has one gene per baker and the value is an order. <b>Encoding 2</b> has one gene per order and the value is a baker.</p><p>Ask of each: <span class="key">can every chromosome be a complete, valid plan?</span></p>`,
        v: F.compare(
          { title: "Encoding 1", c: "rose", body: "3 genes, values are orders. Can name at most 3 orders" },
          { title: "Encoding 2", c: "teal", body: "5 genes, values are bakers. Every string is a plan" },
        ),
        c: {
          q: "Which encoding can write down a plan where all 5 orders are done?",
          o: [
            "One gene per order, value = baker",
            "One gene per baker, value = order",
            "Both, if the genes are chosen with care",
          ],
          a: 0,
          why: "With a gene per order every order is named and has exactly one baker. With a gene per baker only 3 orders can be named.",
        },
      },
      {
        t: "Direct or indirect timetable",
        b: `<p>For the exam timetable a <b>direct</b> gene is a slot, so a mutation can land two conflicting exams side by side. An <b>indirect</b> gene says <b>take the k-th clash-free slot</b>, so a small decoder builds the timetable and clashes never appear.</p><p>The catch is that changing an early gene can move <span class="key">every exam decoded after it</span>.</p>`,
        v: F.flow([
          { t: "Genes (k values)", c: "blue" },
          { t: "Decoder", c: "amber" },
          { t: "Clash-free timetable", c: "teal" },
        ]),
        c: {
          q: "What do you pay for the indirect encoding?",
          o: ["One mutation can move many exams", "Clashes are still possible", "The fitness cannot be computed"],
          a: 0,
          why: "The decoder places exams one after another, so a change early on shifts the choices after it. Clashes are avoided, but the search is less local.",
        },
      },
    ],
    guide: [],
  };
})();
