/* Data Science (COM3021), Lecture 13: thread-level parallelism.
   This part: the lessons 13.5 (ds13-messages, distributed memory, two-sided messages and MPI; figures only) and
   13.6 (ds13-ranks, communicators, groups, size and rank, with the rank explorer demo). Helpers from ds-l13-01.js. */
(function () {
  const S = NIC.shared.ds13;
  const N = NIC;
  const { qs, qsa, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, seg, stats, setStats, svg, tx, tint, box, line, card } = S;

  /* ---------- figures for 13.5 ---------- */
  /** Three processes (one per shop), each with its own memory and its own slice of the receipts. */
  const distFig = () =>
    svg(
      520,
      150,
      ["North St", "Market Sq", "Station Rd"]
        .map(
          (n, i) =>
            `<rect x="${10 + i * 172}" y="8" width="156" height="130" rx="12" fill="${tint("violet", 8)}" stroke="var(--violet)" stroke-width="2"/>${tx(88 + i * 172, 26, `Process ${i}`, { s: 11.5, c: "var(--violet-ink)" })}` +
            box(26 + i * 172, 38, 124, 40, "Own memory", "amber", `${n} receipts`) +
            box(26 + i * 172, 88, 124, 36, "Own processor", "blue"),
        )
        .join(""),
      "Three processes, each with its own memory holding only its own shop's receipts",
    );
  /** A two-sided message: the sender names the data and the destination; the receiver names the sender. */
  const msgFig = (ok = true) =>
    svg(
      520,
      130,
      box(10, 30, 150, 64, "Process 0", "blue", "send(total, to 2)") +
        box(360, 30, 150, 64, "Process 2", "violet", ok ? "receive(from 0)" : "receive(from 1)") +
        line("M160 62H360", ok ? "teal" : "rose", ok ? "" : "6 4") +
        `<rect class="fi" x="228" y="46" width="64" height="32" rx="5" fill="${tint("amber", 30)}" stroke="var(--amber)" stroke-width="2"/><path d="M228 46l32 18l32-18" fill="none" stroke="var(--amber)" stroke-width="2"/>` +
        tx(
          260,
          112,
          ok ? "Both sides play their part: the message is delivered" : "The receive names the wrong sender: no match",
          {
            s: 11.5,
            c: ok ? "var(--teal-ink)" : "var(--rose-ink)",
          },
        ),
      ok
        ? "Process 0 sends its total to process 2, and process 2 posts a matching receive from process 0"
        : "Process 2 waits for a message from process 1, so the message from process 0 does not match",
    );

  /* ============ 13.5 Letters between kitchens ============ */
  reg({
    id: "ds13-messages",
    order: 5,
    num: "13.5",
    title: "Letters between kitchens",
    blurb: "Distributed memory: each process sees only its own data, so processes swap explicit messages, using MPI.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Distributed memory</b>: data is split between processes, and each process <b>sees only its own data</b>.",
            "Messages are <b>two-sided</b>: a <b>send</b> (data + destination) and a matching <b>receive</b> (sender's number).",
            "<b>MPI</b> is the standard specification of a message-passing library, language-independent with many bindings.",
          ],
          "No shared worktop, so write letters.",
        ),
      );
    },
  });

  L["ds13-messages"] = {
    sum: "In distributed memory parallelism the data is split between processes that see only their own data and communicate by explicit, two-sided messages. MPI is the standard library specification for this message-passing model.",
    steps: [
      st(
        "Three shops, three kitchens",
        `<p>Crumb &amp; Co grows to three shops, each with its own kitchen and its own receipts. No one can reach into another shop's cupboard.</p><p>That is <b>distributed memory parallelism</b>. The data is <b>distributed amongst the processes</b>, so the big job becomes smaller <b>sub-problems</b>, one per process. Each process <b>can only see its own data</b>. To share anything, a process must send it to another as a <b>message</b>.</p>`,
        distFig(),
        mc(
          "Process 1 needs a number held in process 2's memory. In a distributed memory program, how does it get it?",
          [
            "Process 2 sends it in a message",
            "Process 1 reads process 2's memory",
            "Both read it from a global variable",
          ],
          "Processes can only see their own data. Communication between them is done via messages: one process sends data to another.",
        ),
      ),
      st(
        "It takes two to post a letter",
        `<p>A letter only arrives if someone posts it and someone opens the door to collect it.</p><p>Messages between processes are <b>explicit</b> and <b>two-sided</b>: they need a <b>send</b> and a <b>receive</b>. To send, a process names the <b>data</b> and the <b>destination process</b>. The receive must <b>match the sender's process number</b>. This one-to-one exchange is called <b>point-to-point</b> communication, and it is cooperative: both sides must play their part.</p>`,
        msgFig(true),
        mc(
          "Process 0 sends a total to process 2, but process 2 is waiting to receive from process 1. What happens to the message?",
          [
            "It is not matched, so it is not received",
            "Process 2 receives it anyway",
            "It is passed on to process 1 instead",
          ],
          "The receive must match the sender's process number. Process 2 asked for a message from process 1, so the one from process 0 does not match.",
        ),
      ),
      st(
        "MPI: the shared rulebook",
        `<p>The three shops agree on one way of writing and addressing letters, so any baker can read any note.</p><p><b>MPI</b>, the <b>Message Passing Interface</b>, is a <b>standard specification of a library</b> of functions that the parallel copies of a distributed memory program use to exchange messages. Data moves from one process's address space into another's through <b>cooperative operations</b>. MPI also covers topology and synchronisation across nodes, and it is <b>language-independent</b>, with bindings for many languages.</p>`,
        F.flow([
          { t: "Process A", s: "its address space", c: "blue" },
          { t: "MPI send / receive", s: "cooperative", c: "amber" },
          { t: "Process B", s: "its address space", c: "violet" },
        ]),
      ),
    ],
  };

  /* ---------- 13.6: the world and its groups ---------- */
  /** n processes in the world, split into groups of 3. tap = world rank highlighted. */
  function worldSvg(n, sel = -1, pick = false) {
    const g = n / 3,
      w = 520,
      gw = (w - 20) / g,
      cell = Math.min(48, gw / 3 - 6);
    let inner = `<rect x="4" y="4" width="${w - 8}" height="136" rx="12" fill="${tint("teal", 6)}" stroke="var(--teal)" stroke-width="2"/>${tx(18, 22, "MPI_COMM_WORLD", { a: "start", s: 11, c: "var(--teal-ink)" })}`;
    for (let k = 0; k < g; k++) {
      const gx = 10 + k * gw,
        hit = sel >= 0 && Math.floor(sel / 3) === k;
      inner += `<rect x="${gx + 2}" y="32" width="${gw - 4}" height="100" rx="10" fill="${tint("violet", hit ? 16 : 6)}" stroke="var(--violet)" stroke-width="${hit ? 2.5 : 1.5}" stroke-dasharray="${hit ? "" : "5 4"}"/>${tx(gx + gw / 2, 126, `Group ${"ABCD"[k]}`, { s: 10.5, c: "var(--violet-ink)" })}`;
      for (let j = 0; j < 3; j++) {
        const r = k * 3 + j,
          x = gx + (gw - 3 * (cell + 6)) / 2 + j * (cell + 6) + 3,
          on = r === sel;
        inner += `<g ${pick ? `data-pick="${r}" data-k="${r}" class="ds13-proc"` : ""}><rect x="${x}" y="44" width="${cell}" height="${cell + 18}" rx="8" fill="${tint("blue", on ? 40 : 14)}" stroke="var(--blue)" stroke-width="${on ? 3 : 2}"/>${tx(x + cell / 2, 64, `${r}`, { s: 14 })}${tx(x + cell / 2, 86, `${j}`, { s: 11, c: "var(--violet-ink)" })}</g>`;
      }
    }
    return svg(
      w,
      144,
      inner,
      `MPI_COMM_WORLD holds ${n} processes with world ranks 0 to ${n - 1}, split into groups of three with group ranks 0 to 2`,
    );
  }
  S.worldSvg = worldSvg;
  const legend = `<p class="fig-cap" style="margin-top:2px">Big number: rank in the <b>world</b>. Small purple number: rank in its <b>group</b>.</p>`;

  function rankDemo(b) {
    let n = 6,
      sel = -1;
    b.innerHTML = `<div class="controls" data-s></div><div data-f></div>${legend}${stats([
      ["teal", "World rank"],
      ["violet", "Group"],
      ["blue", "Rank in group"],
      ["amber", "Size (world / group)"],
    ])}<div class="fig-cap" data-c></div>`;
    const draw = () => {
      qs("[data-f]", b).innerHTML = worldSvg(n, sel, true);
      qsa(".ds13-proc", b).forEach((g) => (g.onclick = () => ((sel = +g.dataset.k), draw())));
      setStats(b, sel < 0 ? ["–", "–", "–", `${n} / 3`] : [sel, "ABCD"[Math.floor(sel / 3)], sel % 3, `${n} / 3`]);
      qs("[data-c]", b).innerHTML =
        sel < 0
          ? "Tap any process to see its name tags."
          : `This process is rank <b>${sel}</b> in the world and rank <b>${sel % 3}</b> in group ${"ABCD"[Math.floor(sel / 3)]}: one process, two communicators, two ranks.`;
    };
    seg(qs("[data-s]", b), "6:6 processes|12:12 processes", "6", (v) => ((n = +v), (sel = -1), draw()));
    draw();
  }

  /* ============ 13.6 Name tags for every process ============ */
  reg({
    id: "ds13-ranks",
    order: 6,
    num: "13.6",
    title: "Name tags for every process",
    blurb: "Communicators, groups, size and rank: how MPI names the processes that talk to each other.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Rank explorer", "tap a process");
      root.appendChild(c);
      rankDemo(c.lastElementChild);
      root.appendChild(
        pr(
          "ds13-ranks-1",
          "You tapped the <b>first</b> process of a group that is not group A. What was its rank in that group?",
          [
            "0, like the first of every group",
            "The same as its rank in the world",
            "One more than the last group's top rank",
          ],
          "Ranks in a communicator start from 0. Every group numbers its own processes 0, 1, 2, whatever their ranks in the world are.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>communicator</b> connects a group of processes and gives each a unique <b>rank</b> (from 0).",
            "Its attributes include a <b>context</b> (ID), a <b>group</b>, a <b>size</b> and the <b>ranks</b>.",
            "<b>MPI_COMM_WORLD</b> holds every process in the session; a process can belong to several communicators.",
          ],
          "Same process, different name tag in each club.",
        ),
      );
    },
  });

  L["ds13-ranks"] = {
    sum: "An MPI communicator connects a group of processes, giving each a rank from 0. Its attributes are context (ID), group, size and rank. MPI_COMM_WORLD contains every process of the session, and a process can belong to more than one communicator.",
    steps: [
      st(
        "Clubs with member numbers",
        `<p>Every Crumb baker has a staff number for the whole company, and a different number on their own shop's rota.</p><p>MPI organises processes with <b>communicators</b>: objects that connect a <b>group of processes</b> in an MPI session. A communicator gives each process a <b>unique identifier</b> and arranges them in a <b>topology</b>. The main, global communicator is called the <b>World</b> (<b>MPI_COMM_WORLD</b>), and a process can belong to <b>more than one</b> communicator.</p>`,
        worldSvg(6) + legend,
        mc(
          "A process belongs to MPI_COMM_WORLD and to a smaller communicator for its group. Is that allowed?",
          [
            "Yes: a process can be in several communicators",
            "No: each process has exactly one communicator",
            "Only if it leaves MPI_COMM_WORLD first",
          ],
          "A process can be associated with more than one communicator. Every process is in the World, and it can also be in smaller ones.",
        ),
      ),
      st(
        "What a communicator knows",
        `<p>A club's register tells you which club it is, who is in it, how many members there are, and each member's number.</p><p>A communicator has several attributes. The <b>context</b> (or ID) tells one communicator apart from another. The <b>group</b> is the set of processes it manages. The <b>size</b> is the number of processes in it. And the <b>rank</b> is the integer ID MPI gives each process, <b>starting from 0</b>.</p>`,
        svg(
          520,
          96,
          [
            ["Context", "which communicator", "teal"],
            ["Group", "which processes", "violet"],
            ["Size", "how many", "amber"],
            ["Rank", "my number, from 0", "blue"],
          ]
            .map(([n, s, c], i) => box(8 + i * 128, 14, 120, 64, n, c, s))
            .join(""),
          "Four attributes of a communicator: context, group, size and rank",
        ),
        mc(
          "A communicator has 5 processes. Which list shows their ranks?",
          ["0, 1, 2, 3, 4", "1, 2, 3, 4, 5", "5, 4, 3, 2, 1"],
          "MPI gives each process an integer rank starting from 0, so 5 processes are ranks 0 to 4, and the size is 5.",
        ),
      ),
      st(
        "Groups inside the world",
        `<p>When Crumb opens three more shops, the company list grows to twelve bakers, but each shop's rota still runs from its own first baker.</p><p>A <b>group</b> is the object holding the set of all processes in a communicator, and <b>MPI_COMM_WORLD contains all the processes</b> in a particular MPI session. Split twelve world processes into groups of three and each group numbers its members 0, 1, 2 again. Try it in the rank explorer.</p>${mm("<p><i>Beyond the slides:</i> with equal groups of size $g$, world rank $r$ lands in group $\\lfloor r / g \\rfloor$ with group rank $r \\bmod g$. For $r = 7$ and $g = 3$: group $2$ (the third), rank $1$.</p>")}`,
        worldSvg(12, 7) + legend,
      ),
    ],
    guide: [
      "Tap a few processes and read their world rank and their rank in the group.",
      "Switch to <b>12 processes</b> and tap the first process of each group.",
      "Answer the question after the demo.",
    ],
  };
})();
