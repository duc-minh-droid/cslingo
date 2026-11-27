/* Data Science (COM3021), Lecture 13: thread-level parallelism.
   This part: the lessons 13.3 (ds13-threads, threads and shared memory, with the receipt-splitting demo) and
   13.4 (ds13-openmp, OpenMP and fork-join, with the fork-join timeline demo). Helpers from ds-l13-01.js. */
(function () {
  const S = NIC.shared.ds13;
  const N = NIC;
  const { qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, seg, stats, setStats, svg, tx, tint, box, line, card, thread, lanes } = S;

  /* ---------- figures for 13.3 ---------- */
  const COLS = ["blue", "teal", "amber", "violet"];
  /** One process holding shared memory (a running total and the receipts file) that three threads reach into. */
  function sharedFig(showMem) {
    const xs = [60, 200, 340];
    return svg(
      480,
      showMem ? 176 : 120,
      `<rect x="10" y="6" width="460" height="${showMem ? 164 : 108}" rx="12" fill="${tint("violet", 8)}" stroke="var(--violet)" stroke-width="2"/>${tx(26, 24, "Crumb's tally program (one process)", { a: "start", s: 11.5, c: "var(--violet-ink)" })}` +
        xs
          .map((x, i) => thread(x + 20, 36, 54, COLS[i]) + tx(x + 40, 70, `Thread ${i + 1}`, { a: "start", s: 11 }))
          .join("") +
        (showMem
          ? xs.map((x) => line(`M${x + 20} 92L${x < 150 ? 150 : x > 300 ? 330 : 240} 118`, "line-2", "4 3")).join("") +
            box(100, 118, 140, 40, "total = 0", "amber", "global variable") +
            box(250, 118, 140, 40, "receipts.csv", "amber", "open file")
          : ""),
      showMem
        ? "Three threads inside one process all reach the same global variable and the same open file"
        : "One process with three threads of execution inside it",
    );
  }
  /** Twelve receipt blocks split between n threads; each thread on its own core. */
  function splitSvg(n) {
    const per = 12 / n;
    const chips = Array.from({ length: 12 }, (_, i) => {
      const t = Math.floor(i / per),
        x = 14 + i * 41;
      return `<rect class="fi" x="${x}" y="14" width="35" height="30" rx="6" fill="${tint(COLS[t], 30)}" stroke="var(--${COLS[t]})" stroke-width="2"/>${tx(x + 17.5, 34, `${i + 1}`, { s: 11 })}`;
    }).join("");
    const cores = [0, 1, 2, 3]
      .map((c) =>
        box(14 + c * 124, 66, 112, 40, `Core ${c + 1}`, c < n ? COLS[c] : "line-2", c < n ? `thread ${c + 1}` : "idle"),
      )
      .join("");
    return svg(
      520,
      116,
      chips + cores,
      `Twelve blocks of receipts shared between ${n} threads on a four-core processor`,
    );
  }
  const nodeFig = () =>
    svg(
      520,
      150,
      `<rect x="10" y="6" width="320" height="138" rx="12" fill="${tint("teal", 8)}" stroke="var(--teal)" stroke-width="2"/>${tx(26, 24, "One node (one computer)", { a: "start", s: 11.5, c: "var(--teal-ink)" })}` +
        [0, 1, 2, 3]
          .map((c) => box(24 + c * 74, 36, 66, 36, `Core ${c + 1}`, "blue") + line(`M${57 + c * 74} 72L170 96`))
          .join("") +
        box(60, 96, 220, 38, "Shared memory", "amber") +
        box(360, 50, 150, 56, "Another node", "line-2", "cannot see this memory") +
        line("M330 78H360", "rose", "5 4"),
      "Threads need cores that share one memory, which means one node; another computer cannot see that memory",
    );

  /** 13.3 demo: split the receipt pile over 1, 2 or 4 threads. */
  function splitDemo(b) {
    let n = 1;
    b.innerHTML = `<div class="controls" data-s></div><div data-f></div>${stats([
      ["blue", "Threads"],
      ["teal", "Cores busy"],
      ["amber", "Minutes to finish"],
    ])}<div class="fig-cap" data-c></div>`;
    const draw = () => {
      qs("[data-f]", b).innerHTML = splitSvg(n);
      setStats(b, [n, `${n} of 4`, 12 / n]);
      qs("[data-c]", b).innerHTML =
        n === 1
          ? "One thread works through all twelve blocks while three cores sit idle: <b>12 minutes</b>."
          : `Each of the ${n} threads takes its own ${12 / n} blocks, all at once: done in <b>${12 / n} minutes</b>.`;
    };
    seg(qs("[data-s]", b), "1:1 thread|2:2 threads|4:4 threads", "1", (v) => ((n = +v), draw()));
    draw();
  }
  S.splitSvg = splitSvg;

  /* ============ 13.3 One kitchen, many cooks ============ */
  reg({
    id: "ds13-threads",
    order: 3,
    num: "13.3",
    title: "One kitchen, many cooks",
    blurb: "Threads share their process's memory, take a core each and split the data between them.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Split the receipt pile", "4 cores");
      root.appendChild(c);
      splitDemo(c.lastElementChild);
      root.appendChild(
        pr(
          "ds13-threads-1",
          "You went from <b>1 thread</b> to <b>4 threads</b>. Why did the tally finish sooner?",
          [
            "Each thread took a different part of the pile",
            "Each thread tallied the whole pile faster",
            "The threads skipped blocks the others had seen",
          ],
          "The work is the same; it is shared out. Four threads on four cores each handle a quarter of the blocks at the same time.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>thread</b> is a semi-independent stream of execution spawned by a process: a <b>lightweight process</b>.",
            "Threads <b>share memory</b> (global variables, file descriptors) and can see the parent process's data.",
            "On different cores they work on different parts of the data: a speed-up, but only on <b>one node</b>.",
          ],
          "Same worktop, separate jobs.",
        ),
      );
    },
  });

  L["ds13-threads"] = {
    sum: "A thread is a semi-independent stream of execution spawned by a process. Threads share memory, run on different cores of one node and split the data between them for a parallel speed-up.",
    steps: [
      st(
        "What a thread is",
        `<p>Think of a recipe being followed: a list of steps, done one after another. A cook working through it is a stream of execution.</p><p>A <b>thread</b> is a <b>semi-independent stream of execution spawned by a process</b>. A process can start several threads, and each follows its own path through the code. Because they live inside one process, threads are often called <b>lightweight processes</b>.</p>`,
        sharedFig(false),
      ),
      st(
        "Sharing the worktop",
        `<p>Crumb's cooks share one worktop: the flour, the scales and the order book are there for all of them.</p><p>Threads <b>share memory</b> with each other, for example <b>global variables</b> and <b>file descriptors</b> (handles to open files). So every thread <b>can see the data of the parent process</b>. Nothing has to be copied or sent before a thread can start on it.</p>`,
        sharedFig(true),
        mc(
          "Crumb's program has a global variable <b>total</b>. Thread 3 is started later. Can it read <b>total</b>?",
          [
            "Yes: threads share the process's memory",
            "No: each thread starts with empty memory",
            "Only if thread 1 sends it a message first",
          ],
          "Threads share memory such as global variables and open files, so a thread can see the data of its parent process.",
        ),
      ),
      st(
        "Split the pile",
        `<p>Hand each cook a different stack of receipts and the pile shrinks four times as fast.</p><p>In a <b>shared memory system</b>, the threads are assigned to <b>different physical cores</b> of the processor, and each thread operates on a <b>different part of the data</b>. That is where the <b>parallel speed-up</b> comes from. Try the demo after this lesson to see it.</p>${mm("<p><i>Beyond the slides:</i> with work $W$ split evenly over $p$ threads on $p$ free cores, the ideal time is</p>$$T_p = \\frac{W}{p} \\qquad \\text{speed-up } = \\frac{T_1}{T_p} = p$$<p>Twelve one-minute blocks on 4 threads: $12 / 4 = 3$ minutes, a speed-up of 4. Real programs fall short of this ideal.</p>")}`,
        splitSvg(4),
      ),
      st(
        "Only one kitchen",
        `<p>Cooks can share a worktop only if they stand in the same kitchen. A cook across town cannot reach the flour.</p><p>Shared memory systems <b>require the cores to share memory</b>, so all the threads run on a <b>single node</b>: one computer. To use several computers you need another model, distributed memory, which is where this lecture heads next.</p>`,
        nodeFig(),
        mc(
          "Crumb buys a second computer and wants the tally threads to spread across both. What stops plain threads doing this?",
          [
            "The two computers do not share one memory",
            "Threads can only ever run on a single core",
            "Each thread needs its own copy of the data",
          ],
          "Threads work through shared memory, and cores in different computers do not share memory. That limits a threaded program to one node.",
        ),
      ),
    ],
    guide: [
      "Pick <b>1 thread</b> and look at the cores and <b>Minutes to finish</b>.",
      "Switch to <b>2 threads</b>, then <b>4 threads</b>, and watch how the blocks are shared out.",
      "Answer the question after the demo.",
    ],
  };

  /* ---------- 13.4: fork-join timelines ---------- */
  /** A program: seq 2, parallel 8, seq 1, parallel 4, seq 1 (minutes), on n threads; the master is thread 0. */
  function forkJoin(n) {
    const plan = [
      ["seq", 2, "load"],
      ["par", 8],
      ["seq", 1, "sort"],
      ["par", 4],
      ["seq", 1, "report"],
    ];
    const rows = Array.from({ length: n }, (_, i) => ({ n: i ? `Worker ${i}` : "Master", s: [] }));
    const marks = [];
    let t = 0;
    for (const [k, w, lbl] of plan) {
      if (k === "seq") {
        rows[0].s.push([t, t + w, "seq", lbl]);
        rows.slice(1).forEach((r) => r.s.push([t, t + w, "idle"]));
        t += w;
      } else {
        const d = w / n;
        if (n > 1) marks.push([t, "fork"]);
        rows.forEach((r) => r.s.push([t, t + d, "work", "tally"]));
        t += d;
        if (n > 1) marks.push([t, "join"]);
      }
    }
    return { rows, marks, end: t };
  }
  function forkFig(n, T = 16) {
    const p = forkJoin(n);
    return lanes(p.rows, {
      T,
      marks: p.marks,
      label: `A fork-join program on ${n} threads finishes after ${p.end} minutes`,
    });
  }
  S.forkJoin = forkJoin;
  S.forkFig = forkFig;

  function forkDemo(b) {
    let n = 1;
    b.innerHTML = `<div class="controls" data-s></div><div data-f></div>${stats([
      ["blue", "Threads"],
      ["violet", "Sequential minutes"],
      ["amber", "Total minutes"],
    ])}<div class="fig-cap" data-c></div>`;
    const draw = () => {
      const p = forkJoin(n);
      qs("[data-f]", b).innerHTML = forkFig(n);
      setStats(b, [n, 4, p.end]);
      qs("[data-c]", b).innerHTML =
        n === 1
          ? "With one thread the master does everything in order: <b>16 minutes</b>."
          : `The master <b>forks</b> ${n - 1} worker${n > 2 ? "s" : ""} for each tally and <b>joins</b> them before carrying on: <b>${p.end} minutes</b>.`;
    };
    seg(qs("[data-s]", b), "1:1 thread|2:2 threads|4:4 threads", "1", (v) => ((n = +v), draw()));
    draw();
  }

  /* ============ 13.4 Fork, work, join ============ */
  reg({
    id: "ds13-openmp",
    order: 4,
    num: "13.4",
    title: "Fork, work, join",
    blurb: "OpenMP: mark the parts to parallelise, and a master thread forks workers and joins them again.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Fork-join timeline", "OpenMP style");
      root.appendChild(c);
      forkDemo(c.lastElementChild);
      root.appendChild(
        pr(
          "ds13-openmp-1",
          "As you added threads, which parts of the timeline stayed the same length?",
          [
            "The master's sequential parts",
            "The tally parts between fork and join",
            "Every part shrank by the same amount",
          ],
          "Only the parallel regions are shared out. The sequential segments (load, sort, report) run on the master thread alone, so they take as long with 4 threads as with 1.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>OpenMP</b> is a widely used API for shared memory programming with threads; parallelism is <b>implicit</b>.",
            "<b>Fork</b>: the master thread spawns workers. <b>Join</b>: a synchronisation point where everyone has finished.",
            "A program is a sequence of <b>fork-join parallel segments</b> separated by <b>sequential master</b> segments.",
          ],
          "Fork, work, join, and repeat.",
        ),
      );
    },
  });

  L["ds13-openmp"] = {
    sum: "OpenMP is a widely used API for shared memory programming with threads. You mark what to parallelise; a master thread forks worker threads, and they join at a synchronisation point. Programs alternate fork-join parallel segments with sequential master segments.",
    steps: [
      st(
        "Just point at the slow part",
        `<p>Crumb's head baker doesn't explain to each helper how to share the work. She points at the big job and says "this one, together".</p><p><b>OpenMP</b> works like that. It is one of the most widely used <b>APIs</b> (Application Program Interfaces) for <b>shared memory programming using threads</b>. Its parallelism is <b>implicit</b>: you specify which parts of the program to parallelise, and the <b>compiler</b> produces a parallel executable. Much of the detail is hidden from you.</p>`,
        F.flow([
          { t: "Your program", s: "slow loop marked", c: "violet" },
          { t: "Compiler", s: "adds the threads", c: "blue" },
          { t: "Parallel executable", s: "runs on all cores", c: "teal" },
        ]),
        mc(
          "What does the programmer do when using OpenMP?",
          [
            "Marks which parts of the program to parallelise",
            "Writes the code that creates each thread by hand",
            "Sends messages between the threads explicitly",
          ],
          "OpenMP's parallelism is implicit: you mark the parts to run in parallel, and the compiler produces the parallel executable.",
        ),
      ),
      st(
        "Fork: call in the helpers",
        `<p>The head baker works alone until the big job arrives, then calls the helpers over.</p><p>An OpenMP program has one <b>parent</b> (or <b>master</b>) thread and several <b>worker</b> threads. At a <b>fork</b>, the parent thread <b>spawns</b> a number of worker threads, and they perform their computation separately, each on its own share of the work.</p>`,
        forkFig(4, 7),
      ),
      st(
        "Join: wait for everyone",
        `<p>The next job can't start until every helper has put their tray down.</p><p>At a <b>join</b>, the threads have completed their computation. It is a <b>synchronisation point</b>: the program does not carry on beyond it until all the threads have finished. Then the master continues on its own.</p>`,
        lanes(
          [
            { n: "Master", s: [[0, 3, "work", "tally"]] },
            {
              n: "Worker 1",
              s: [
                [0, 2, "work", "tally"],
                [2, 3, "idle"],
              ],
            },
            {
              n: "Worker 2",
              s: [
                [0, 1.5, "work", "tally"],
                [1.5, 3, "idle"],
              ],
            },
          ],
          {
            T: 4,
            marks: [[3, "join"]],
            label: "At the join, faster threads wait for the slowest before the program continues",
          },
        ),
        mc(
          "Two workers finish their share early. What happens at the join?",
          [
            "Everyone waits until the last thread finishes",
            "The program continues as soon as one is done",
            "The early threads take a new share of work",
          ],
          "A join is a synchronisation point: computation only continues beyond it once all the threads have completed.",
        ),
      ),
      st(
        "The rhythm of a program",
        `<p>Crumb's night shift has a rhythm: the head baker sets up alone, everyone tallies together, she sorts alone, everyone tallies again, and she writes the report.</p><p>An OpenMP program mostly consists of a <b>sequence of fork-join parallel segments</b> separated by <b>lone sequential master thread segments</b>. Only the parallel segments get faster with more threads. Try the demo after this lesson.</p>${mm("<p><i>Beyond the slides:</i> with sequential time $s$ and parallel time $w$ on $p$ threads,</p>$$T_p = s + \\frac{w}{p}$$<p>Here $s = 4$ and $w = 12$: one thread takes 16 minutes, four take $4 + 3 = 7$. However many threads you add, the time never drops below $s$ (this is Amdahl's law).</p>")}`,
        forkFig(2),
      ),
    ],
    guide: [
      "Start with <b>1 thread</b>: the master does everything in order.",
      "Pick <b>2 threads</b>, then <b>4 threads</b>, and find each <b>fork</b> and <b>join</b>.",
      "Compare the sequential minutes with the total minutes, then answer the question after the demo.",
    ],
  };
})();
