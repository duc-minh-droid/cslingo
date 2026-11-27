/* Data Science Lecture 13 workshop (13.W): Crumb & Co's night shift. Split the receipts over threads, fork and join a
   parallel region, deliver an MPI message between shops, and find a process by its ranks. No code, no typing. */
(function () {
  const S = NIC.shared.ds13;
  const N = NIC;
  const { el, qs, qsa, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, seg, stats, setStats, box, svg, line, lanes, splitSvg, worldSvg } = S;

  const cardHtml = (n, title, body) =>
    `<div class="card ds13-wcard" data-card="${n}"><div class="card-head"><h2>${n} · ${title}</h2></div>${body}<div class="fig-cap" data-c></div></div>`;

  function sandbox(stage, api) {
    stage.appendChild(
      el(
        `<div class="ds13-lab">${cardHtml(
          1,
          "One kitchen: share the pile",
          `<div class="controls" data-s></div><div class="controls"><button class="btn primary" data-r>Run tally</button></div><div data-f></div>${stats(
            [
              ["blue", "Threads"],
              ["amber", "Minutes"],
            ],
          )}`,
        )}${cardHtml(
          2,
          "Fork and join",
          `<div class="controls"><button class="btn primary" data-fk>Fork</button><button class="btn" data-jn>Join</button><button class="btn ghost" data-z>Reset</button></div><div data-f></div>`,
        )}${cardHtml(
          3,
          "Three shops: post a letter",
          `<div class="controls" data-to></div><div class="controls" data-from></div><div class="controls"><button class="btn primary" data-d>Deliver</button></div><div data-f></div>`,
        )}${cardHtml(
          4,
          "Find the baker",
          `<div data-f></div>${stats([
            ["teal", "World rank"],
            ["violet", "Group"],
            ["blue", "Rank in group"],
          ])}`,
        )}</div>`,
      ),
    );
    const C = (n) => qs(`[data-card="${n}"]`, stage);

    /* card 1: threads on one node */
    let n1 = 1;
    const c1 = C(1);
    seg(qs("[data-s]", c1), "1:1 thread|2:2 threads|4:4 threads", "1", (v) => (n1 = +v));
    qs("[data-f]", c1).innerHTML = splitSvg(1);
    qs("[data-r]", c1).onclick = () => {
      qs("[data-f]", c1).innerHTML = splitSvg(n1);
      setStats(c1, [n1, 12 / n1]);
      qs("[data-c]", c1).innerHTML =
        n1 === 4
          ? "Every core has its own thread and its own three blocks: done in <b>3 minutes</b>."
          : `${4 - n1} core${4 - n1 > 1 ? "s" : ""} idle. Done in <b>${12 / n1} minutes</b>.`;
      if (n1 === 4 && api.done("split"))
        api.say(
          "Four threads, four cores, a quarter of the pile each. They all share one memory, so nothing was copied.",
          "happy",
        );
      else if (n1 < 4) api.say("Some cores are doing nothing. More threads could use them.", "think");
    };

    /* card 2: fork-join */
    const c2 = C(2),
      W = [3, 2, 1.5];
    let forked = false;
    const draw2 = (joined) => {
      const rows = [{ n: "Master", s: [[0, 1, "seq", "load"]] }];
      if (forked)
        W.forEach((w, i) => {
          if (i === 0) rows[0].s.push([1, 1 + w, "work", "tally"]);
          else
            rows.push({ n: `Worker ${i}`, s: [[1, 1 + w, "work", "tally"], ...(joined ? [[1 + w, 4, "idle"]] : [])] });
        });
      if (joined) rows[0].s.push([4, 5, "seq", "report"]);
      const marks = [...(forked ? [[1, "fork"]] : []), ...(joined ? [[4, "join"]] : [])];
      qs("[data-f]", c2).innerHTML = lanes(rows, { T: 5.5, marks, label: "The master thread's fork-join timeline" });
    };
    draw2(false);
    qs("[data-fk]", c2).onclick = () => {
      forked = true;
      draw2(false);
      qs("[data-c]", c2).innerHTML = "The master <b>forked</b> two workers. Everyone is tallying their own share.";
    };
    qs("[data-jn]", c2).onclick = () => {
      if (!forked) {
        qs("[data-c]", c2).innerHTML = "Nothing to join yet: no workers have been forked.";
        api.say("A join waits for worker threads, so fork some first.", "think");
        return;
      }
      draw2(true);
      qs("[data-c]", c2).innerHTML =
        "The <b>join</b> waits until the master's own share, the longest, is done. Only then does the report start.";
      if (api.done("join"))
        api.say(
          "Fork, work, join. The join is a synchronisation point: nobody moves on until all have finished.",
          "happy",
        );
    };
    qs("[data-z]", c2).onclick = () => {
      forked = false;
      draw2(false);
      qs("[data-c]", c2).innerHTML = "";
    };

    /* card 3: a two-sided message */
    const c3 = C(3);
    let to = 1,
      from = 1;
    seg(qs("[data-to]", c3), "1:Process 0 sends to 1|2:to 2|3:to 3", "1", (v) => (to = +v));
    seg(qs("[data-from]", c3), "0:Process 2 receives from 0|1:from 1|3:from 3", "1", (v) => (from = +v));
    const shops = (hit, ok) =>
      svg(
        520,
        96,
        [0, 1, 2, 3]
          .map((p) =>
            box(
              10 + p * 128,
              10,
              116,
              52,
              `Process ${p}`,
              p === 0 ? "blue" : p === hit ? (ok ? "teal" : "rose") : "line-2",
              p === 0 ? "sender" : p === 2 ? "waiting" : "",
            ),
          )
          .join("") +
          (hit
            ? line(`M68 62Q${(68 + 68 + hit * 128) / 2} 92 ${68 + hit * 128} 62`, ok ? "teal" : "rose", ok ? "" : "5 4")
            : ""),
        "Four processes; process 0 sends a message",
      );
    qs("[data-f]", c3).innerHTML = shops(0, false);
    qs("[data-d]", c3).onclick = () => {
      const ok = to === 2 && from === 0;
      qs("[data-f]", c3).innerHTML = shops(to, ok);
      qs("[data-c]", c3).innerHTML = ok
        ? "Send names process 2, and process 2's receive names process 0: <b>delivered</b>."
        : to !== 2
          ? `The letter went to process ${to}, which is not expecting it. Process 2 is still waiting.`
          : `Process 2 is waiting for a letter from process ${from}, so the one from process 0 does not match.`;
      if (ok && api.done("send"))
        api.say(
          "Two-sided: the sender named the destination and the receiver named the sender. Both played their part.",
          "happy",
        );
      else if (!ok) api.say("Check both sides: where does the send go, and who does the receive expect?", "think");
    };

    /* card 4: ranks */
    const c4 = C(4);
    const draw4 = (sel) => {
      qs("[data-f]", c4).innerHTML = worldSvg(12, sel, true);
      qsa(".ds13-proc", c4).forEach((g) => (g.onclick = () => tap(+g.dataset.k)));
      if (sel >= 0) setStats(c4, [sel, "ABCD"[Math.floor(sel / 3)], sel % 3]);
    };
    const tap = (r) => {
      draw4(r);
      const ok = r === 7;
      qs("[data-c]", c4).innerHTML = ok
        ? "Found: world rank 7 is rank 1 in group C."
        : `That is rank ${r % 3} in group ${"ABCD"[Math.floor(r / 3)]}. Keep looking for rank 1 in group C.`;
      if (ok && api.done("rank"))
        api.say("One process, two name tags: rank 7 in the world, rank 1 in its group.", "happy");
    };
    draw4(-1);
  }

  reg({
    id: "ds13-lab",
    order: 90,
    workshop: true,
    num: "13.W",
    title: "Workshop: Crumb's night shift",
    blurb:
      "No code. Share the receipts over threads, fork and join, post an MPI letter and find a process by its ranks.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "The shop opens at seven and the receipts are piling up. Let's get every core, thread and process working.",
        missions: [
          {
            id: "split",
            t: "Use every core",
            d: "In card 1 pick a number of threads and press <b>Run tally</b> so that no core is left idle.",
            hint: "The processor has 4 cores.",
          },
          {
            id: "join",
            t: "Fork, then join",
            d: "In card 2 press <b>Fork</b> to spawn the workers, then <b>Join</b> to bring them back together.",
            hint: "A join needs workers to wait for, so the fork comes first.",
          },
          {
            id: "send",
            t: "Post a letter",
            d: "In card 3 set up a send from process 0 to process 2 with a matching receive, then press <b>Deliver</b>.",
            hint: "The send names the destination; the receive names the sender.",
          },
          {
            id: "rank",
            t: "Find the baker",
            d: "In card 4 tap the process that is <b>rank 1 in group C</b>.",
            hint: "Small purple numbers are group ranks; group C is the third group.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds13-lab-1",
          "In card 2, two workers finished their tally before the master. What did they do until the join?",
          ["Waited, idle", "Started the report", "Took over the master's share"],
          "A join is a synchronisation point: threads that finish early wait until every thread has completed before the program continues.",
        ),
      );
      root.appendChild(
        pr(
          "ds13-lab-2",
          "In card 3, why could process 2 not simply read the total from process 0's memory?",
          [
            "Each process sees only its own data",
            "Process 0 was still writing to it",
            "MPI only lets rank 0 read other processes",
          ],
          "In distributed memory parallelism processes can only see their own data, so the total has to travel as a message with a send and a matching receive.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Threads in one process share memory and take a core each: one node, many cores.",
            "OpenMP-style <b>fork-join</b>: workers spawn at the fork and synchronise at the join.",
            "Across machines, <b>MPI</b> messages need a send and a matching receive; ranks name the processes.",
          ],
          "Share a kitchen when you can; write letters when you must.",
        ),
      );
    },
  });

  L["ds13-lab"] = {
    sum: "A no-code night shift at Crumb & Co: threads on four cores, a fork-join region, a two-sided MPI message and ranks in communicators.",
    steps: [
      st(
        "Tonight's shift",
        "<p>Crumb's tally runs in two worlds tonight. Inside one computer, threads share memory and split the receipts. Between the three shops, processes have their own memory and must post messages to each other. You'll try both, then find a process by its name tags.</p>",
        F.flow([
          { t: "Threads", s: "one shared memory", c: "blue" },
          { t: "Fork-join", s: "spawn, then sync", c: "violet" },
          { t: "MPI message", s: "send + receive", c: "amber" },
          { t: "Ranks", s: "world and group", c: "teal" },
        ]),
        mc(
          "Which part of tonight's shift needs explicit messages?",
          [
            "Sharing totals between the three shops' processes",
            "Sharing receipts between threads in one program",
            "Letting a worker thread read a global variable",
          ],
          "Threads share their process's memory. Separate processes, as in the three shops, only see their own data and must exchange messages.",
        ),
      ),
      st(
        "Two kinds of team",
        "<p>Shared memory is one kitchen: fast and simple, but every cook must stand in it, so it stops at one node. Distributed memory is many kitchens: it can grow across machines, but every exchange is a letter with a sender and a receiver.</p>",
        svg(
          520,
          80,
          box(10, 10, 240, 60, "Shared memory", "blue", "threads · one node · OpenMP") +
            box(270, 10, 240, 60, "Distributed memory", "violet", "processes · many nodes · MPI"),
          "Shared memory uses threads on one node with OpenMP; distributed memory uses processes on many nodes with MPI",
        ),
        mc(
          "Crumb wants to spread one job across several computers. Which model fits?",
          ["Distributed memory, with MPI", "Shared memory, with OpenMP", "More threads in one process"],
          "Threads need cores that share memory, which means one node. Across several computers each process has its own memory, so MPI messages are the way.",
        ),
      ),
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
