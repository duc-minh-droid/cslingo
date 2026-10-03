(function () {
  const partScope = (NIC.shared.algoWorkshops11 = NIC.shared.algoWorkshops11 || {});
  const { DEMOS, TOOL, TOOLS, fxOn, snd } = partScope;
  const N = NIC,
    { el, qs, qsa } = N;

  const CASES = [
    {
      id: "amb",
      t: "Ambulance dispatch",
      brief:
        "A city has known travel times between junctions, none negative. Dispatch needs the quickest route from the station to <b>every</b> junction.",
      need: "quickest routes to every junction, non-negative times",
      tool: "dijk",
      why: "Non-negative costs are exactly what lets Dijkstra declare the closest unsettled junction final.",
      demo: "dijkstra",
      traps: {
        mst: { demo: (b, c) => DEMOS.tree(b, c, "path"), say: "An MST minimises total wiring, not any one journey." },
        astar: {
          say: "A* aims at <b>one</b> goal using a distance estimate. Dispatch needs every junction, so there is no single goal to aim at: Dijkstra is the tool.",
        },
      },
    },
    {
      id: "bot",
      t: "Warehouse robot",
      brief:
        "A robot must reach <b>one</b> shelf on a grid. The straight-line grid distance to the shelf is known and never overestimates. Explore as little as you can.",
      need: "one goal, plus an honest distance estimate",
      tool: "astar",
      why: "An estimate that never overestimates keeps A* correct while it explores far fewer squares.",
      demo: "grid",
      near: {
        dijk: {
          demo: (b, c) => DEMOS.grid(b, c),
          say: "Dijkstra would find the right path, but it ignores the estimate and explores more. Watch the counts.",
        },
      },
    },
    {
      id: "cab",
      t: "Fibre for nine offices",
      brief:
        "Every office must be able to reach every other over fibre. Each link costs money to lay. Keep the <b>total</b> cost as low as possible.",
      need: "connect everything with the cheapest total cost",
      tool: "mst",
      why: "The cut property guarantees the cheapest link across any split is safe, so Prim and Kruskal build the cheapest connected network.",
      demo: "kruskal",
      traps: {
        dijk: {
          demo: (b, c) => DEMOS.tree(b, c, "spt"),
          say: "Shortest routes from one office are not the same as the cheapest total wiring.",
        },
        astar: {
          demo: (b, c) => DEMOS.tree(b, c, "spt"),
          say: "A* finds one route between two points. Here the job is to wire everything.",
        },
      },
    },
    {
      id: "fen",
      t: "Fence the troughs",
      brief:
        "A farmer has GPS pins for twelve water troughs and wants the shortest fence that encloses all of them, bulging only outwards.",
      need: "the smallest convex outline around points",
      tool: "hull",
      why: "The convex hull is the rubber band around the pins. Graham scan finds it with left turns and a stack.",
      demo: "hull",
      traps: {
        mst: {
          say: "An MST joins the pins with a network of links. A fence needs a closed outline around the outside.",
        },
      },
    },
    {
      id: "pro",
      t: "Deep-space probe",
      brief:
        "A probe sends 4-bit readings. Sometimes <b>one</b> bit flips in transit and there is no chance to resend. The receiver must repair it itself.",
      need: "locate and repair one flipped bit, no resend",
      tool: "ham",
      why: "Overlapping parity groups make the failed checks spell the position of the flipped bit, so the receiver can fix it.",
      demo: "hamming",
      traps: { crc: { demo: (b, c) => DEMOS.crc(b, c), say: "CRC can tell the frame is bad, but not where." } },
    },
    {
      id: "led",
      t: "Donation log",
      brief:
        "A charity wants its log to be tamper-evident: if anyone quietly edits an old entry, everyone who checks should be able to see it.",
      need: "edits to history show up for everyone",
      tool: "hash",
      why: "Each block stores the previous block's hash, so an edit breaks every link after it.",
      demo: "hash",
      traps: {
        crc: {
          say: "A CRC catches accidents, but anyone who edits deliberately can simply recompute it. Chained hashes make the edit show up downstream.",
        },
      },
    },
    {
      id: "hum",
      t: "The mystery hum",
      brief:
        "A sound engineer records sixteen samples of a hum and wants to know <b>which pure tones</b> are mixed inside it.",
      need: "which frequencies a signal contains",
      tool: "fft",
      why: "The DFT reads a signal back as one bin per frequency. The FFT is the fast way to compute the same bins.",
      demo: "fft",
      traps: {
        attn: {
          say: "Attention compares items in a sequence with each other. It does not split a waveform into frequencies.",
        },
      },
    },
    {
      id: "arc",
      t: "News archive",
      brief:
        "An archive stores text where a few letters are extremely common and others are rare. Make it smaller without losing a single character.",
      need: "shrink data with very uneven symbol frequencies",
      tool: "huff",
      why: "Huffman gives the commonest symbols the shortest codes, which is optimal for symbol-by-symbol coding.",
      demo: "huffman",
      traps: {
        lzw: {
          say: "LZW wins when whole <b>phrases</b> repeat. This archive's pattern is uneven letter frequency, which is Huffman's home ground.",
        },
      },
    },
    {
      id: "wor",
      t: "Chairs and tables",
      brief:
        "A workshop makes chairs and tables. Each uses wood and hours, both limited, and the profit on each item is fixed. How many of each give the most profit?",
      need: "best mix of two quantities under straight-line limits",
      tool: "lp",
      why: "A linear objective with linear limits has its best plan at a corner of the allowed polygon.",
      demo: "lp",
      traps: {
        golden: {
          say: "Golden-section search has <b>one</b> knob and a single dip. This problem has two quantities and straight-line limits.",
        },
      },
    },
    {
      id: "web",
      t: "Which page matters?",
      brief: "A search engine wants one importance score per page, using only which pages link to which.",
      need: "importance scores from a link graph",
      tool: "pr",
      why: "PageRank lets rank flow along links, repeating until the scores settle, with teleporting to avoid traps.",
      demo: "pagerank",
      traps: { attn: { say: "Attention scores words within a sentence. Ranking pages from their links is PageRank." } },
    },
  ];

  /* =====================================================================
     The workshop
     ===================================================================== */
  function picker(stage, api, life) {
    let idx = 0,
      score = 0,
      combo = 0,
      best = 0,
      wrong = 0,
      solved = 0,
      locked = false,
      tried = new Set(),
      gen = 0;
    const card =
      el(`<div class="wk-card aw11-main"><h3>Client brief<span class="wk-sp"></span><span class="wk-badge" data-round>Case 1 of ${CASES.length}</span></h3>
      <div class="aw11-case" data-case tabindex="0"><div class="aw11-ct" data-ct></div><div class="aw11-cb" data-cb></div><div class="aw11-cn" data-cn></div></div>
      <div class="aw11-hintline" data-hl>Drag the card onto a tool, or tap a tool.</div>
      <div class="wk-stats"><div class="wk-stat amber"><small>Score</small><b data-score>0</b></div><div class="wk-stat teal"><small>Combo</small><b data-combo>×1</b></div><div class="wk-stat rose"><small>Slips</small><b data-wrong>0</b></div></div></div>`);
    const tools = el(
      `<div class="wk-card"><h3>Toolbox<span class="wk-sp"></span><span class="faint" style="text-transform:none;letter-spacing:0">some tools are decoys</span></h3><div class="aw11-tools" data-tools>${TOOLS.slice()
        .sort((a, b) => a.ph - b.ph)
        .map((t) => `<button class="aw11-tool" data-t="${t.id}"><small>Phase ${t.ph}</small><b>${t.name}</b></button>`)
        .join("")}</div></div>`,
    );
    const demo =
      el(`<div class="wk-card aw11-dcard"><h3>Why it fits, or why it fails<span class="wk-sp"></span><button class="btn small ghost" data-replay hidden>Replay</button></h3><div class="aw11-demo" data-demo><div class="aw11-idle">Pick a tool and a small demo runs here.</div></div><div class="wk-note aw11-cap" data-cap></div>
      <div class="wk-row" style="margin-top:10px"><button class="btn primary" data-next hidden>Next case</button><button class="btn ghost small" data-restart>Restart deck</button></div></div>`);
    stage.append(card, tools, demo);
    const caseEl = qs("[data-case]", card),
      demoEl = qs("[data-demo]", demo),
      capEl = qs("[data-cap]", demo),
      nextBtn = qs("[data-next]", demo),
      replay = qs("[data-replay]", demo),
      hl = qs("[data-hl]", card);
    const toolBtn = (id) => qs(`[data-t="${id}"]`, tools);
    let lastRun = null;

    function stats() {
      qs("[data-score]", card).textContent = score;
      qs("[data-combo]", card).textContent = "×" + Math.min(5, Math.max(1, combo));
      qs("[data-wrong]", card).textContent = wrong;
      qs("[data-round]", card).textContent = solved >= CASES.length ? "All done" : `Case ${idx + 1} of ${CASES.length}`;
    }
    function showCase() {
      const s = CASES[idx];
      tried = new Set();
      locked = false;
      qs("[data-ct]", caseEl).innerHTML = s.t;
      qs("[data-cb]", caseEl).innerHTML = s.brief;
      qs("[data-cn]", caseEl).innerHTML = `<span>Needs:</span> ${s.need}`;
      caseEl.className = "aw11-case";
      qsa(".aw11-tool", tools).forEach((b) => (b.className = "aw11-tool"));
      nextBtn.hidden = true;
      replay.hidden = true;
      hl.textContent = "Drag the card onto a tool, or tap a tool.";
      demoEl.innerHTML = `<div class="aw11-idle">Pick a tool and a small demo runs here.</div>`;
      capEl.innerHTML = "";
      gen++;
      stats();
      if (fxOn()) N.fx.enter(caseEl, { y: 10, dur: 0.24 });
      api.say(`New client: <b>${s.t}</b>. What does the problem really ask for?`, "think");
    }
    function startDemo(fn) {
      const my = ++gen;
      demoEl.innerHTML = "";
      capEl.innerHTML = "";
      lastRun = fn;
      replay.hidden = false;
      const c = {
        cap: (h) => {
          if (my === gen) capEl.innerHTML = h;
        },
        wait: (ms) => new Promise((r) => setTimeout(() => r(my === gen && demoEl.isConnected), fxOn() ? ms : 0)),
      };
      return Promise.resolve(fn(demoEl, c)).catch((e) => console.error(e));
    }
    async function choose(id) {
      if (locked || tried.has(id) || solved >= CASES.length) return;
      const s = CASES[idx],
        tl = TOOL[id],
        btn = toolBtn(id);
      if (id === s.tool) {
        locked = true;
        combo++;
        best = Math.max(best, combo);
        const pts = 10 * Math.min(5, combo);
        score += pts;
        solved++;
        btn.classList.add("ok");
        caseEl.classList.add("ok");
        snd("correct");
        if (fxOn()) {
          N.fx.pop && N.fx.pop(btn);
          N.fx.floatText(btn, `+${pts}`, "#58cc02");
        }
        api.done("first");
        if (combo >= 3) api.done("combo");
        hl.innerHTML = `<b>${tl.name}</b> is the fit. ${s.why}`;
        api.say(
          combo > 1 ? `Yes! <b>×${Math.min(5, combo)}</b> combo. ${s.why}` : `Yes, <b>${tl.name}</b>. ${s.why}`,
          "love",
        );
        stats();
        qs("[data-score]", card).parentNode && N.wk.flash(qs("[data-score]", card).parentNode);
        await startDemo((b, c) => DEMOS[s.demo](b, c));
        if (solved >= CASES.length) finish();
        else {
          nextBtn.hidden = false;
          nextBtn.textContent = "Next case";
          if (!fxOn()) nextBtn.focus && 0;
        }
        return;
      }
      tried.add(id);
      btn.classList.add("no");
      const near = s.near && s.near[id],
        trap = (s.traps && s.traps[id]) || near;
      if (near) {
        snd("tick");
        hl.innerHTML = `Close, but not the best fit. ${near.say}`;
        api.say(`Close: ${tl.name} works, but there is a better fit. ${near.say}`, "think");
        btn.classList.remove("no");
        btn.classList.add("near");
        await startDemo(near.demo);
        api.done("trap");
        return;
      }
      combo = 0;
      wrong++;
      snd("wrong");
      if (fxOn()) N.fx.shake(btn);
      stats();
      const why = trap ? trap.say : `<b>${tl.name}</b> is for ${tl.does}. This client needs ${s.need}.`;
      hl.innerHTML = `Not quite. ${why}`;
      api.say(`Not quite. ${why}`, "sad");
      if (trap && trap.demo) {
        await startDemo(trap.demo);
        api.done("trap");
      } else {
        demoEl.innerHTML = `<div class="aw11-idle">${why}</div>`;
        capEl.innerHTML = "";
        replay.hidden = true;
      }
    }
    function finish() {
      api.done("clear");
      if (wrong <= 2) api.done("sharp");
      nextBtn.hidden = true;
      qs("[data-ct]", caseEl).innerHTML = "Consultancy complete";
      qs("[data-cb]", caseEl).innerHTML =
        `You matched all ${CASES.length} clients. Score <b>${score}</b>, best combo <b>×${Math.min(5, best)}</b>, <b>${wrong}</b> slip${wrong === 1 ? "" : "s"}.`;
      qs("[data-cn]", caseEl).innerHTML =
        wrong <= 2 ? "Sharp work: two slips or fewer." : "Restart the deck and aim for two slips or fewer.";
      qs("[data-round]", card).textContent = "All done";
      if (fxOn()) N.fx.celebrate(caseEl, { silent: true });
    }
    nextBtn.onclick = () => {
      idx = Math.min(CASES.length - 1, idx + 1);
      showCase();
    };
    replay.onclick = () => lastRun && startDemo(lastRun);
    qs("[data-restart]", demo).onclick = () => {
      idx = 0;
      score = 0;
      combo = 0;
      best = 0;
      wrong = 0;
      solved = 0;
      showCase();
      api.say("Fresh deck. Same clients, new chance for a clean run.", "happy");
    };
    qsa(".aw11-tool", tools).forEach((b) => (b.onclick = () => choose(b.dataset.t)));

    /* drag the card onto a tool */
    let drag = null;
    caseEl.addEventListener("pointerdown", (e) => {
      if (locked || solved >= CASES.length || e.button > 0) return;
      drag = { x: e.clientX, y: e.clientY, moved: false };
      try {
        caseEl.setPointerCapture(e.pointerId);
      } catch (x) {
        /* ignore */
      }
    });
    caseEl.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      caseEl.classList.add("drag");
      caseEl.style.transform = `translate(${dx}px,${dy}px) scale(.96)`;
      caseEl.style.pointerEvents = "none";
      const t = document.elementFromPoint(e.clientX, e.clientY);
      caseEl.style.pointerEvents = "";
      qsa(".aw11-tool.hot", tools).forEach((b) => b.classList.remove("hot"));
      const tb = t && t.closest && t.closest(".aw11-tool");
      if (tb) tb.classList.add("hot");
    });
    const end = (e) => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      caseEl.classList.remove("drag");
      caseEl.style.transform = "";
      qsa(".aw11-tool.hot", tools).forEach((b) => b.classList.remove("hot"));
      if (!moved) return;
      caseEl.style.pointerEvents = "none";
      const t = document.elementFromPoint(e.clientX, e.clientY);
      caseEl.style.pointerEvents = "";
      const tb = t && t.closest && t.closest(".aw11-tool");
      if (tb) choose(tb.dataset.t);
    };
    caseEl.addEventListener("pointerup", end);
    caseEl.addEventListener("pointercancel", () => {
      drag = null;
      caseEl.classList.remove("drag");
      caseEl.style.transform = "";
    });
    life.onDispose &&
      life.onDispose(() => {
        gen++;
      });
    showCase();
  }
  Object.assign(partScope, { picker });
})();
