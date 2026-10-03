/* Algorithms that Changed the World — Phase 1: Foundations & PageRank.
   Modules: 1.1 algorithm anatomy, 1.2 growth counting, 1.3 random surfer, 1.4 PageRank mechanics, boss quiz.
   Numbers verified against Sessions 01–03 (token trace totals 75, the d=0.75 worked step, H matrix). */
(function () {
  const partScope = (NIC.shared.algoP1 = NIC.shared.algoP1 || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, shuffle, esc } = N;
  const L = NIC.LESSONS;

  // ---------- tiny lesson-visual builders ----------
  const table = (head, rows) =>
    `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl || (r[0] && r[0].hl) ? "hl" : r.bad || (r[0] && r[0].bad) ? "bad" : ""}">${[]
            .concat(r.c || (r[0] && r[0].c) || r)
            .flat(2)
            .map((c) => `<td>${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</table>`;
  const flow = (items) =>
    `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;

  /* ================================================================
     1.1 — What is an algorithm?
     ================================================================ */
  L["a1-anatomy"] = {
    sum: "An algorithm is a recipe with no interpretation left to the reader. Trust it because of its <b>invariant</b>: a promise that starts true, stays true, and becomes the answer at the end.",
    steps: [
      {
        t: "A wish is not an algorithm",
        b: `<p>“Deal with the most urgent support request” is a wish. A computer can't run it — too much is left to interpretation. An algorithm answers every question in advance:</p>`,
        v: table(
          ["Question", "Example answer"],
          [
            ["INPUT — what arrives?", "a list of requests"],
            ["OUTPUT — what is returned?", "the single most urgent one"],
            ["COMPARE — how is 'urgent' defined?", "highest priority number; tie → earliest submitted"],
            ["STEPS — in what order?", "scan once, keep the best-so-far"],
            ["TERMINATE — when does it stop?", "after the last request"],
            ["EDGE CASES — empty list? bad data?", "return 'none'; reject malformed rows"],
          ],
        ),
      },
      {
        t: "Watch the state change",
        b: `<p>Here is the smallest real loop there is — <b>find the biggest number</b>:</p>
        <div class="pseudo"><div>best ← first item</div><div>for each remaining item x:</div><div>&nbsp;&nbsp;&nbsp;&nbsp;if x &gt; best:&nbsp;&nbsp;best ← x</div><div>return best</div></div>
        <p>Two pieces of <b>state</b> change every step: <code>best</code> (the answer so far) and your <b>position</b> in the list. Everything else is decoration.</p>`,
      },
      {
        t: "The promise that stays true",
        b: `<p>Why trust this loop on a list you've never seen? Because of a <b>loop invariant</b> — a promise linking the state to the progress made:</p><span class="key">After k items have been checked, <code>best</code> = the biggest of those k items.</span><p>Three checks turn the promise into a proof:</p>`,
        v:
          flow([
            ["Starts true", "teal"],
            ["Stays true", "violet"],
            ["Ends useful", "amber"],
          ]) +
          `<p class="dim" style="margin-top:8px">k = 1: best <i>is</i> the biggest of the first item. Each step replaces best by max(old best, x), so the promise survives. At k = n the promise says “best = biggest of all” — exactly the goal.</p>`,
        c: {
          q: "An invariant that “usually holds” is…",
          o: ["good enough for most inputs", "not an invariant", "fine if the loop is short"],
          a: 1,
          why: "The whole point is that it holds at <b>every</b> step. One broken step and the correctness argument has no anchor.",
        },
      },
      {
        t: "Edge cases are where promises die",
        b: `<p><code>best ← first item</code> fails silently on an <b>empty list</b> — there is no first item, so the invariant can't even start. That's why the checklist includes edge cases: decide what “biggest of nothing” means <i>before</i> the loop runs (return <code>none</code>, raise an error, anything explicit).</p>
        <p>Negative numbers and duplicates are <b>fine</b> — the comparison still works. It's the missing start that breaks it.</p>`,
        c: {
          q: "Which input breaks the loop <code>best ← first item</code>?",
          o: ["A list of negative numbers", "An empty list", "A list with duplicates"],
          a: 1,
          why: "No first item → the invariant can't start. Negatives and duplicates are handled by the comparison itself.",
        },
      },
      {
        t: "You'll meet this pattern again",
        b: `<p>The same “promise that stays true” structure powers the famous algorithms in this module:</p>`,
        v: table(
          ["Algorithm", "The invariant"],
          [
            ["Dijkstra (Phase 2)", "the cheapest unsettled node's distance is already final"],
            ["PageRank (this phase)", "every iteration preserves total rank = 1"],
            ["Simplex (Phase 3)", "every corner visited is feasible and no worse than the last"],
          ],
        ),
      },
    ],
    guide: [
      "Press <b>Step one line</b> and watch the highlighted pseudocode line, the state, and the log — one click = one line executed.",
      "Watch the <b>invariant box</b>: it should say “promise holds ✓” after every step, including i = 0.",
      "Press <b>Auto</b> to run to the end, then read the final invariant box — it becomes the answer.",
      "Switch the input to <b>Empty list</b> and run: the loop ends before it starts, and “none” is the honest answer.",
      "Answer the Predict question.",
    ],
  };

  N.register({
    id: "a1-anatomy",
    subject: "algo",
    lecture: 1,
    order: 1,
    num: "1.1",
    title: "What is an algorithm?",
    blurb: "Step a tiny loop one line at a time and watch the promise that stays true the whole way through.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const LINES = [
        "best ← none",
        "i ← 0                    // items checked so far",
        "while i < length(list):",
        "    if best is none or list[i] > best:  best ← list[i]",
        "    i ← i + 1",
        "return best",
      ];
      let list = [],
        i = 0,
        best = null,
        pc = 0,
        empty = false,
        running = null;
      const card = el(`<div class="card">
        <div class="card-head"><h2>Run the loop one line at a time</h2><span class="faint">goal: return the biggest number</span></div>
        <div class="grid side">
          <div>
            <div class="pseudo" id="code">${LINES.map((s, k) => `<div data-k="${k}">${esc(s)}</div>`).join("")}</div>
            <div class="controls">
              <button class="btn primary" id="st">Step one line →</button>
              <button class="btn" id="go">Auto</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
            <div class="controls" id="modeRow"><span class="faint" style="font-size:13px">Input:</span></div>
            <div class="log mono" id="log" style="font-size:12.5px;max-height:150px"></div>
          </div>
          <div>
            <h3 style="margin-top:0">The state</h3>
            <div class="pop" id="items"></div>
            <div class="stat-row">
              <div class="stat"><small>i (items checked)</small><b id="svi">0</b></div>
              <div class="stat violet"><small>best so far</small><b id="svb">none</b></div>
            </div>
            <div id="inv"></div>
          </div>
        </div></div>`);
      root.appendChild(card);
      const say = (m) => qs("#log", card).insertAdjacentHTML("beforeend", `<div>· ${m}</div>`);
      qs("#modeRow", card).appendChild(
        N.seg(
          [
            ["nums", "A real list"],
            ["empty", "Empty list"],
          ],
          "nums",
          (v) => {
            empty = v === "empty";
            reset();
          },
        ),
      );
      function reset() {
        list = empty ? [] : shuffle([3, 8, 1, 9, 4, 9, 2, 7, 5]).slice(0, 7);
        i = 0;
        best = null;
        pc = 0;
        qs("#log", card).innerHTML = "";
        say(empty ? "the list is empty — watch the loop test" : `list = [${list.join(", ")}]`);
        draw();
      }
      function step() {
        if (pc === 5) return;
        if (pc === 0) {
          best = null;
          say("best ← none");
          pc = 1;
        } else if (pc === 1) {
          i = 0;
          say("i ← 0 — nothing checked yet");
          pc = 2;
        } else if (pc === 2) {
          if (i >= list.length) {
            say(`i=${i} ≥ ${list.length} → loop ends`);
            pc = 5;
            say(`return ${best === null ? "<b>none</b> (empty list)" : "<b>" + best + "</b>"}`);
          } else {
            say(`i=${i} < ${list.length} → check list[${i}] = ${list[i]}`);
            pc = 3;
          }
        } else if (pc === 3) {
          const x = list[i];
          if (best === null || x > best) {
            say(`${x} beats ${best === null ? "nothing" : best} → best ← ${x}`);
            best = x;
          } else say(`${x} doesn't beat ${best} → best stays`);
          pc = 4;
        } else if (pc === 4) {
          i++;
          say(`i ← ${i}`);
          pc = 2;
        }
        draw();
        if (pc === 5) stop();
      }
      function draw() {
        qsa("#code div", card).forEach((d, k) => d.classList.toggle("on", k === pc));
        qs("#items", card).innerHTML = list.length
          ? list
              .map(
                (v, k) =>
                  `<div class="chip ${k === i && pc >= 3 && pc <= 4 ? "scan" : ""} ${v === best && best !== null ? "winner" : ""}" style="${k < i ? "" : "opacity:.55"}"><small>list[${k}]</small><b>${v}</b></div>`,
              )
              .join("")
          : `<span class="faint">[ ] — the list is empty</span>`;
        qs("#svi", card).textContent = i;
        qs("#svb", card).textContent = best === null ? "none" : best;
        const fm = i === 0 ? null : Math.max(...list.slice(0, i));
        const holds = i === 0 ? best === null : best === fm;
        const inv = qs("#inv", card);
        inv.className = "callout " + (holds ? "teal" : "rose");
        inv.innerHTML =
          pc === 5
            ? `<b>Finished.</b> The promise at i = ${list.length} says best = biggest of <b>all</b> items — ${best === null ? "and <b>none</b> is the right answer to “biggest of nothing”." : `it returned <b>${best}</b>.`} The invariant became the answer.`
            : `<b>Invariant:</b> after i items are checked, best = biggest of those i.<br>Now: i = ${i}, max of checked = ${i === 0 ? "—" : fm}, best = ${best === null ? "none" : best} → <b>${holds ? "promise holds ✓" : "BROKEN ✗"}</b>`;
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Auto";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#st", card).onclick = () => {
        stop();
        step();
      };
      qs("#go", card).onclick = () => {
        if (running) return stop();
        if (pc === 5) return;
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(step, 550);
      };
      qs("#rs", card).onclick = () => {
        stop();
        reset();
      };
      reset();
      root.appendChild(
        predict({
          id: "a1-anatomy-1",
          q: "The loop is running on <code>[3, 8, 1, 9, 4, 9, 2]</code>. It just checked the <b>4</b> (i was 4, now i = 5). What are <code>best</code> and the max of checked items now?",
          opts: ["best = 4, max of checked = 4", "best = 9, max of checked = 9", "best = 9, max of checked = 4"],
          a: 1,
          why: "4 doesn't beat 9, so best stays 9 — and the biggest of the first five items is also 9. Every step preserves the invariant whether or not best changes.",
        }),
      );
      root.appendChild(
        el(
          `<div class="callout violet"><b>Why you should care.</b> “It worked when I tried it” is a test. “The promise holds at every step” is a proof. Tests check the inputs you tried; the invariant covers <b>all</b> inputs, including the ones you haven't imagined yet.</div>`,
        ),
      );
      root.appendChild(
        takeaways(
          [
            "An algorithm needs: precise input/output, a defined comparison, ordered steps, termination, and an answer for edge cases.",
            "<b>State</b> = what changes each step. <b>Invariant</b> = the promise about the state that stays true.",
            "Correctness = the promise <b>starts true</b>, <b>stays true</b> each step, and <b>ends as the answer</b>.",
            "Empty input is the classic edge case: the loop can't even start its promise.",
          ],
          "A loop is correct because its promise starts true, stays true, and ends as the answer.",
        ),
      );
    },
  });

  /* ================================================================
     1.2 — How loops grow
     ================================================================ */
  const PATS = {
    single: {
      name: "One pass",
      code: "for i in 0..n:\n    work()",
      f: (n) => n,
      cls: "O(n)",
      note: "Double n → double work.",
    },
    dependent: {
      name: "Inner loop grows",
      code: "for i in 0..n:\n    for j in 0..i:\n        work()",
      f: (n) => (n * (n - 1)) / 2,
      cls: "O(n²)",
      note: "0+1+2+…+(n−1) = n(n−1)/2. Halving a quadratic is still a quadratic.",
    },
    nested: {
      name: "Full nested",
      code: "for i in 0..n:\n    for j in 0..n:\n        work()",
      f: (n) => n * n,
      cls: "O(n²)",
      note: "Every i meets every j: n² calls.",
    },
    halving: {
      name: "Repeated halving",
      code: "i ← n\nwhile i > 1:\n    work()\n    i ← floor(i / 2)",
      f: (n) => {
        let c = 0,
          x = n;
        while (x > 1) {
          x = Math.floor(x / 2);
          c++;
        }
        return c;
      },
      cls: "O(log n)",
      note: "Double n → just one extra step. The growth nobody believes at first.",
    },
  };

  L["a1-bigo"] = {
    sum: "Don't count seconds — count <b>work() calls</b> as a function of n. Single loop: n. Growing inner loop: n(n−1)/2. Halving: log₂n. Keep the dominant term; that's Big-O.",
    steps: [
      {
        t: "Count work, not seconds",
        b: `<p>Seconds depend on your machine, the language, and luck. <b>Operation counts</b> depend only on the algorithm. Take each pattern and ask: how many times does <code>work()</code> run, as a function of n?</p>`,
        v: table(
          ["Pattern", "work() calls at n = 10", "…at n = 1000"],
          [
            ["<code>for i: work()</code>", "10", "1,000"],
            ["<code>for i: for j&lt;i: work()</code>", "45", "499,500"],
            ["<code>for i: for j&lt;n: work()</code>", "100", "1,000,000"],
            ["repeated halving", "3", "9"],
          ],
        ),
      },
      {
        t: "The growing inner loop is still quadratic",
        b: `<p><code>for j in 0..i</code> looks gentler than a full nested loop — and it is, by a factor of two:</p><span class="key">$$0 + 1 + 2 + \\dots + (n-1) = \\frac{n(n-1)}{2} = \\frac{n^2}{2} - \\frac{n}{2}$$</span><p>As n grows the $\\tfrac{n^2}{2}$ term swamps the $-\\tfrac{n}{2}$, so this is <b>$O(n^2)$</b>. Big-O keeps the dominant term and throws away the constant: the <i>shape</i> of the growth is what survives.</p>`,
        c: {
          q: "Is <code>5n + 100</code> really O(n)?",
          o: [
            "No: the extra 100 makes it grow faster than plain n does",
            "Yes: the linear term dominates; constants drop out",
            "No: it's O(5n), which grows five times faster than O(n)",
          ],
          a: 1,
          why: "O(5n) isn't wrong mathematically, but convention writes O(n). Big-O is about shape, not constant speed — though 5× slower is still 5× slower in real life.",
        },
      },
      {
        t: "Halving beats everything",
        b: `<p><code>while i &gt; 1: work(); i ← i/2</code>. How many halvings to reach 1? <b>⌈log₂ n⌉</b>.</p><p>The magic consequence: <b>doubling n adds one step</b>. n = 8 → 3 steps; n = 16 → 4; n = 1024 → 10; n = a billion → ~30. That's why binary search and its cousins scale to planetary inputs.</p>`,
        c: {
          q: "Doubling n makes an O(log n) algorithm…",
          o: [
            "twice as slow, like any other algorithm",
            "take roughly one more step",
            "take about n more steps, one for each new item",
          ],
          a: 1,
          why: "One extra halving undoes one doubling. log₂(2n) = log₂ n + 1.",
        },
      },
      {
        t: "Rank the growth shapes",
        b: `<p>Slowest-growing to fastest-growing, the session's lineup:</p>`,
        v:
          flow([
            ["20", "teal"],
            ["log₂ n", "teal"],
            ["5n + 100", "violet"],
            ["n log₂ n", "violet"],
            ["3n² + n", "amber"],
            ["2ⁿ", "rose"],
          ]) +
          `<p class="dim" style="margin-top:8px">Constants and small terms never change the <i>order</i>. And any exponential eventually beats any polynomial — even 1.1ⁿ vs n¹⁰⁰.</p>`,
        c: {
          q: "Two fragments both solve the problem. How do you decide which is better?",
          o: [
            "Whichever one has the fewest lines of code overall",
            "Whichever one's time or memory grows more slowly",
            "Whichever one runs faster on a small hand-picked test input",
          ],
          a: 1,
          why: "Same answer, different scaling. Growth is the deciding information — it's the whole point of Big-O.",
        },
      },
    ],
    guide: [
      "Pick a loop pattern and press <b>Double n</b> a few times — watch the × column settle on a signature.",
      "Match each signature to a growth class: ×2 → linear, ×4 → quadratic, +1 → logarithmic.",
      "Press <b>Run to 4096</b> on each pattern and compare the totals.",
      "Look at the comparison bars (log scale) — how far ahead is the quadratic at n = 1024?",
      "Answer the Predict question.",
    ],
  };
  Object.assign(partScope, { PATS, table });
})();
