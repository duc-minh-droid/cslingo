/* Data Science (COM3021), Lecture 4, part 2: 4.3 (synchronous, asynchronous, semi-synchronous) and 4.5 (replication lag). */
(function () {
  const S = (NIC.shared.dsL4 = NIC.shared.dsL4 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { css, chip, node, reg } = S;

  /* ============ 4.3 Synchronous, asynchronous, semi-synchronous ============ */
  const LOCAL = 5,
    T = 220;
  const seg = (a, b, c) =>
    `<div class="d4-seg" style="left:${(a / T) * 100}%;width:${((b - a) / T) * 100}%;background:var(--${c})"></div>`;
  const lane = (label, body) => `<div class="d4-tl"><span>${label}</span><div class="d4-lane">${body}</div></div>`;
  reg({
    id: "ds4-sync",
    order: 3,
    num: "4.3",
    title: "Synchronous, asynchronous, semi-sync",
    blurb: "Should the leader wait for its followers before telling the client the write worked?",
    render(root, life) {
      css();
      root.appendChild(header(this, ""));
      let mode = "async",
        dA = 20,
        dB = 120,
        deadA = false,
        deadB = false,
        crashed = false;
      const card =
        el(`<div class="card"><div class="card-head"><h2>When does the client hear "done"?</h2><span class="tag">one write, in milliseconds</span></div>
        <div class="controls" id="c"></div><div class="controls" id="k"></div><div id="tl"></div>
        <div class="stat-row" id="s"></div><p class="dim" id="t" style="min-height:66px"></p>
        <div class="controls"><button class="btn rose" id="x">Crash the leader as it answers</button></div></div>`);
      root.appendChild(card);
      const sa = N.slider("Follower A confirms after", 10, 200, 10, dA, (v) => `${v} ms`),
        sb = N.slider("Follower B confirms after", 10, 200, 10, dB, (v) => `${v} ms`);
      const bA = el(`<button class="btn small">Kill follower A</button>`),
        bB = el(`<button class="btn small">Kill follower B</button>`);
      qs("#c", card).append(
        N.seg(
          [
            ["async", "Asynchronous"],
            ["semi", "Semi-synchronous"],
            ["sync", "Synchronous (all)"],
          ],
          mode,
          (v) => {
            mode = v;
            crashed = false;
            draw();
          },
        ),
      );
      qs("#k", card).append(sa, sb, bA, bB);
      const draw = () => {
        const fol = [
          { n: "A", d: dA, dead: deadA },
          { n: "B", d: dB, dead: deadB },
        ];
        const arr = (f) => LOCAL + f.d;
        const syncF = fol.find((f) => !f.dead);
        let ack = LOCAL;
        if (mode === "semi" && syncF) ack = arr(syncF);
        if (mode === "sync") ack = fol.some((f) => f.dead) ? null : Math.max(...fol.map(arr));
        const copies = ack === null ? 0 : 1 + fol.filter((f) => !f.dead && arr(f) <= ack).length;
        qs("#tl", card).innerHTML =
          lane("Leader", seg(0, LOCAL, "blue")) +
          fol
            .map((f) =>
              lane(
                `Follower ${f.n}`,
                f.dead ? '<span class="faint" style="padding:0 8px">down</span>' : seg(LOCAL, arr(f), "teal"),
              ),
            )
            .join("") +
          lane(
            "Client waits",
            ack === null
              ? seg(0, T, "rose")
              : seg(0, ack, "amber") + `<div class="d4-ack" style="left:${(ack / T) * 100}%"></div>`,
          );
        bA.textContent = deadA ? "Revive follower A" : "Kill follower A";
        bB.textContent = deadB ? "Revive follower B" : "Kill follower B";
        qs("#s", card).innerHTML =
          `<div class="stat amber"><small>Client waits</small><b>${ack === null ? "stuck" : `${ack} ms`}</b></div><div class="stat ${copies >= 2 ? "" : "blue"}"><small>Copies when told "done"</small><b>${ack === null ? "-" : `${copies} of 3`}</b></div>`;
        const how = {
          async: "The leader answers as soon as it has stored the write. Fast, but the followers may not have it yet.",
          semi: `The leader waits for <b>one</b> follower (${syncF ? syncF.n : "none left"}). ${deadA && !deadB ? "Follower A is down, so B was <b>made synchronous</b>." : "The other follower catches up in the background."}`,
          sync:
            ack === null
              ? "A follower is down, so the leader <b>never gets every confirmation</b>: the write is blocked."
              : "The leader waits until <b>every</b> follower has confirmed, so it is as slow as the slowest one.",
        }[mode];
        qs("#t", card).innerHTML = crashed
          ? ack === null
            ? "The client never got an answer, so it knows the write did not complete."
            : copies >= 2
              ? `${how}<br><b style="color:var(--teal-ink)">The leader crashed, but ${copies - 1} follower${copies > 2 ? "s hold" : " holds"} the write: it survives.</b>`
              : `${how}<br><b style="color:var(--rose-ink)">The leader crashed and no follower had the write yet. The client was told "done", but the data is gone.</b>`
          : how;
      };
      sa.onInput((v) => ((dA = v), (crashed = false), draw()));
      sb.onInput((v) => ((dB = v), (crashed = false), draw()));
      bA.onclick = () => ((deadA = !deadA), (crashed = false), draw());
      bB.onclick = () => ((deadB = !deadB), (crashed = false), draw());
      qs("#x", card).onclick = () => ((crashed = true), draw());
      draw();

      root.appendChild(
        predict({
          id: "ds4-sync-1",
          q: "In the demo, set Asynchronous and press 'Crash the leader as it answers'. The client was told 'done'. What is the risk?",
          opts: [
            "The write may exist only on the crashed leader and be lost",
            "The write is always safe, since followers copy it first",
            "The client never gets an answer",
          ],
          a: 0,
          why: "Asynchronous replication answers before any follower has confirmed, so a crash right then can lose a write the client believes succeeded.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds4-sync-2",
          q: "Semi-synchronous mode, with follower A (fast) as the synchronous one. You kill follower A. What happens to the client's wait?",
          opts: [
            "B becomes synchronous, so the wait grows",
            "Every write blocks until A is revived",
            "The wait stays the same as before the kill",
          ],
          a: 0,
          why: "In semi-synchronous replication, when the synchronous follower is unavailable or slow, an asynchronous follower is made synchronous. Writes carry on, a little slower.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Synchronous</b>: the leader waits for followers to confirm before reporting success. Safer, but a slow or dead follower holds up writes.",
            "<b>Asynchronous</b>: the leader answers at once. Fast, but a leader crash can lose writes the client was told succeeded.",
            "Waiting for <b>all</b> followers is fragile, so synchronous usually means at least <b>one</b> synchronous follower.",
            "<b>Semi-synchronous</b>: if the synchronous follower becomes unavailable or slow, an asynchronous one takes over the role.",
          ],
          "Synchronous trades speed for safety, and semi-synchronous keeps one safe copy without waiting for everyone.",
        ),
      );
    },
  });
  L["ds4-sync"] = {
    sum: "Waiting for followers or not: synchronous, asynchronous and semi-synchronous replication.",
    steps: [
      {
        t: "Should the leader wait?",
        b: `<p>When a write arrives, the leader stores it and sends it to its followers. The question: should it tell the client <b>"done"</b> straight away, or only after the followers have confirmed?</p>`,
        v: F.flow([
          "Client write",
          { t: "Leader stores it", c: "blue" },
          "Followers copy it",
          { t: "Tell the client", c: "teal" },
        ]),
        c: {
          q: "What is the choice between synchronous and asynchronous replication about?",
          o: [
            "Whether the leader waits for followers before replying",
            "Whether followers may serve read queries from clients",
            "Whether the replication log is kept in strict order",
          ],
          a: 0,
          why: "It is only about when success is reported: after follower confirmation (sync) or without waiting (async).",
        },
      },
      {
        t: "Synchronous and asynchronous",
        b: `<p><b>Synchronous</b>: the leader waits for the followers to confirm they received the write before reporting success. <b>Asynchronous</b>: it does not wait.</p>`,
        v: F.compare(
          {
            title: "Synchronous",
            c: "teal",
            body: "followers confirmed first<br>safer, but slower<br>a dead follower can block writes",
          },
          { title: "Asynchronous", c: "amber", body: "answers at once<br>fast<br>a crash can lose writes" },
        ),
        c: {
          type: "cat",
          q: "Which mode does each statement describe?",
          buckets: ["Asynchronous", "Synchronous"],
          items: [
            ["The client is told 'done' as soon as the leader has stored the write", 0],
            ["The leader waits for follower confirmation before reporting success", 1],
            ["A write can vanish if the leader crashes before any follower has it", 0],
            ["A slow follower makes every write slower", 1],
          ],
          why: "Asynchronous answers immediately and risks loss. Synchronous waits, so it is safer but is held up by slow followers.",
        },
      },
      {
        t: "All the followers?",
        b: `<p>Should the leader wait for <b>all</b> followers? That is fragile: one slow or unavailable follower stalls every write. So "synchronous" usually means that <b>at least one</b> follower is synchronous.</p>`,
        v: F.cells(
          [
            { v: "Follower A", sub: "synchronous", c: "teal" },
            { v: "Follower B", sub: "asynchronous", c: "dim" },
            { v: "Follower C", sub: "asynchronous", c: "dim" },
          ],
          { size: 118 },
        ),
        c: {
          q: "Why not make every follower synchronous?",
          o: [
            "One slow or dead follower would hold up every write",
            "Followers cannot confirm more than one write",
            "The leader could then no longer store the data",
          ],
          a: 0,
          why: "A write is only done when all confirm, so the slowest or unavailable follower sets the pace, or blocks it.",
        },
      },
      {
        t: "Semi-synchronous",
        b: `<p>If the synchronous follower becomes <b>unavailable or slow</b>, one of the asynchronous followers is <b>made synchronous</b>. This is called <b>semi-synchronous</b>: there is always one up-to-date copy besides the leader, without waiting for everyone.</p>`,
        v: F.flow([
          { t: "A is sync", c: "teal" },
          { t: "A fails", c: "rose" },
          { t: "B becomes sync", c: "teal" },
        ]),
        c: {
          q: "The synchronous follower goes down in a semi-synchronous setup. What happens?",
          o: [
            "An asynchronous follower is made synchronous",
            "All writes stop until it returns",
            "The leader switches to waiting for every follower",
          ],
          a: 0,
          why: "Another follower takes the synchronous role, so writes carry on with one safe copy.",
        },
      },
      {
        t: "Compare the three",
        v: (box, life) => NIC.shared.ds.plain.sync(box, life),
        b: `<p>The client waits for the <b>slowest follower the leader waits for</b>, and for nobody else. Say the leader needs 5 ms to store the write, follower A confirms 30 ms after the leader finishes and follower B 90 ms after. Switch between the three modes and watch the purple line: the moment the client is told.</p><details class="math-more"><summary>Show the maths</summary><p>Reply time = the leader's 5 ms + the slowest confirmation it waits for. Asynchronous: 5 ms. Semi-synchronous: 5 + 30 = 35 ms. Synchronous (all): 5 + 90 = 95 ms.</p><table class="t"><tr><th>Mode</th><th>Leader waits for</th><th>Speed</th><th>Safety</th></tr><tr><td>Asynchronous</td><td>nobody</td><td>fastest</td><td>lowest</td></tr><tr><td>Semi-synchronous</td><td>one follower</td><td>medium</td><td>good</td></tr><tr><td>Synchronous (all)</td><td>every follower</td><td>slowest</td><td>highest</td></tr></table></details>`,
        c: {
          type: "order",
          q: "Order the modes from the quickest answer to the slowest.",
          items: ["Asynchronous", "Semi-synchronous", "Synchronous (all followers)"],
          why: "The more followers the leader waits for, the longer the client waits.",
        },
      },
    ],
    guide: [
      "Pick a mode, move the follower speed sliders and watch how long the client waits.",
      "Press <b>Kill follower A</b> in each mode, then <b>Crash the leader as it answers</b>.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 4.5 Replication lag ============ */
  reg({
    id: "ds4-lag",
    order: 5,
    num: "4.5",
    title: "Replication lag",
    blurb: "A follower can show yesterday's news. Two guarantees stop users noticing.",
    render(root, life) {
      css();
      root.appendChild(header(this, ""));
      let policy = "any",
        lag = 3,
        myLast = 1,
        lastSeen = 1,
        rr = 0,
        bad = { own: 0, back: 0 },
        rows = [];
      const ap = { Leader: 1, "Follower A": 1, "Follower B": 1 };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Comments page</h2><span class="tag">number of comments you can see</span></div>
        <div class="controls" id="c"></div><div class="d4-row" id="n"></div>
        <div class="controls"><button class="btn primary" id="w">Post a comment</button><button class="btn" id="r">Refresh the page</button><button class="btn ghost" id="z">Reset</button></div>
        <div class="stat-row" id="s"></div><p class="dim" id="t" style="min-height:44px">Post a comment, then refresh.</p><div id="l"></div></div>`);
      root.appendChild(card);
      const sl = N.slider("Follower B lags by", 1, 6, 1, lag, (v) => `${v} s`);
      qs("#c", card).append(
        N.seg(
          [
            ["any", "Any replica"],
            ["ryw", "Own writes from a fresh node"],
            ["sticky", "Always the same replica"],
          ],
          policy,
          (v) => {
            policy = v;
            reset();
          },
        ),
        sl,
      );
      const draw = () => {
        qs("#n", card).innerHTML = Object.entries(ap)
          .map(([k, n]) =>
            node(k, k, n, `${k === "Leader" ? "lead " : ""}${n === ap.Leader ? "ok" : "old"}`, "comments"),
          )
          .join("");
        qs("#s", card).innerHTML =
          `<div class="stat ${bad.own ? "amber" : ""}"><small>Own post missing</small><b>${bad.own}</b></div><div class="stat ${bad.back ? "amber" : ""}"><small>Went back in time</small><b>${bad.back}</b></div>`;
        qs("#l", card).innerHTML = rows
          .slice(0, 5)
          .map((r) => `<div class="faint" style="font-size:13px">${r}</div>`)
          .join("");
      };
      function reset() {
        Object.keys(ap).forEach((k) => (ap[k] = 1));
        myLast = lastSeen = 1;
        rr = 0;
        bad = { own: 0, back: 0 };
        rows = [];
        qs("#t", card).textContent = "Post a comment, then refresh.";
        draw();
      }
      sl.onInput((v) => ((lag = v), reset()));
      qs("#w", card).onclick = () => {
        const v = ++ap.Leader;
        myLast = v;
        life.timeout(() => ((ap["Follower A"] = Math.max(ap["Follower A"], v)), draw()), 600);
        life.timeout(() => ((ap["Follower B"] = Math.max(ap["Follower B"], v)), draw()), lag * 1000);
        qs("#t", card).innerHTML = `Your comment went to the <b>leader</b> (now ${v}). The followers will catch up.`;
        draw();
      };
      qs("#r", card).onclick = () => {
        let from = policy === "sticky" ? "Follower B" : ["Follower A", "Follower B"][rr++ % 2];
        if (policy === "ryw" && ap[from] < myLast) from = "Leader";
        const seen = ap[from],
          own = seen < myLast,
          back = seen < lastSeen;
        bad.own += own ? 1 : 0;
        bad.back += back ? 1 : 0;
        const verdict = back ? "it went <b>back in time</b>" : own ? "your own comment is <b>missing</b>" : "all good";
        rows.unshift(`${from} showed ${seen}: ${verdict.replace(/<[^>]+>/g, "")}`);
        qs("#t", card).innerHTML = `The page was served by <b>${from}</b> and shows <b>${seen}</b>: ${verdict}.`;
        lastSeen = Math.max(lastSeen, seen);
        draw();
      };
      qs("#z", card).onclick = reset;
      draw();

      root.appendChild(
        predict({
          id: "ds4-lag-1",
          q: "In 'Any replica' mode you post a comment and press Refresh at once. The first refresh is served by Follower A, which lags by 600 ms. What does the page show?",
          opts: [
            "The old count, without your comment",
            "The new count, with your comment",
            "An error, since A is behind",
          ],
          a: 0,
          why: "Follower A has not applied the change yet, so it returns the old data. Reading your own recent write from a lagging follower is the read-your-writes problem.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds4-lag-2",
          q: "In 'Always the same replica' mode, you post and refresh straight away. Which is true?",
          opts: [
            "Your comment may be missing, but the page never goes back",
            "Your comment always shows at once, on every refresh",
            "The page can show a higher count and then a lower one afterwards",
          ],
          a: 0,
          why: "Sticking to one replica gives monotonic reads (that replica only moves forward). It does not guarantee read-your-writes, since that replica may still be behind the leader.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Read-only queries may go to any replica, but an <b>asynchronous follower</b> can return <b>out-of-date</b> data.",
            "<b>Read-your-writes consistency</b>: after a write, a reload always shows the updates the user submitted themselves.",
            "<b>Backwards data</b>: reads from <b>different replicas</b> can seem to move backwards in time.",
            "<b>Monotonic reads</b>: make each user always read from the <b>same replica</b>.",
          ],
          "Lag is invisible until a user sees their own post vanish, or the page jump back in time.",
        ),
      );
    },
  });
  L["ds4-lag"] = {
    sum: "Stale reads from lagging followers, read-your-writes consistency and monotonic reads.",
    steps: [
      {
        t: "Followers can lag",
        b: `<p>Read-only queries can go to <b>any replica</b>. If the application reads from an <b>asynchronous follower</b>, it may see <b>out-of-date</b> information, because the update has not arrived yet. Many problems can come from that.</p>`,
        v: F.flow([
          { t: "Leader: new", c: "teal" },
          { t: "log on its way", c: "dim" },
          { t: "Follower: old", c: "amber" },
        ]),
        c: {
          q: "When can a read return out-of-date data?",
          o: [
            "When an async follower has not yet applied the change",
            "Only when the leader has crashed and not recovered",
            "Never, because the log is applied instantly everywhere",
          ],
          a: 0,
          why: "Asynchronous followers apply changes a little after the leader, so they can briefly lag.",
        },
      },
      {
        t: "The lost data",
        b: `<p>A user writes, then reloads. The write went to the <b>leader</b>, but the reload was served by a <b>follower</b> that has not received it yet. The new data seems to have vanished.</p>`,
        v: F.frames([
          { t: "Post a comment", v: `<div>${chip("leader: 4", "new")}</div>` },
          { t: "Reload", v: `<div>${chip("follower: 3", "tmp")}</div>` },
          { t: "Your comment is gone!", v: "<div>?</div>" },
        ]),
        c: {
          q: "A user edits their bio, reloads, and sees the old bio for a moment. What is the likely cause?",
          o: [
            "A follower had not yet received the update",
            "The leader refused the write without any error",
            "The replication log was applied in the wrong order",
          ],
          a: 0,
          why: "The write went to the leader but the read hit a lagging follower.",
        },
      },
      {
        t: "Read-your-writes consistency",
        b: `<p>The guarantee: if the user <b>reloads the page</b>, they will <b>always see any updates they submitted themselves</b>. One way: read the user's own recent changes from the leader, or from a replica known to have caught up.</p>`,
        v: F.compare(
          { title: "Without it", c: "rose", body: "post, reload: the post has vanished" },
          { title: "With it", c: "teal", body: "post, reload: your post is always there" },
        ),
        c: {
          q: "What does read-your-writes consistency promise?",
          o: [
            "A user always sees their own updates after reload",
            "Every user sees every update at the same instant",
            "A user can only read the data that they wrote",
          ],
          a: 0,
          why: "It is about the writer seeing their own updates, not about all users at one moment.",
        },
      },
      {
        t: "Backwards data",
        b: `<p>If a user makes <b>several reads from different replicas</b>, they may see things <b>moving backward in time</b>: the first replica has the update, the second has not.</p>`,
        v: F.flow([
          { t: "Read 1: replica A, count 7", c: "teal" },
          { t: "Read 2: replica B, count 6", c: "rose" },
        ]),
        c: {
          q: "A refresh shows 12 likes, and the next refresh shows 10. What happened?",
          o: [
            "Two reads hit different replicas, one further behind",
            "Two users each liked and unliked at the same moment",
            "The leader deleted two likes while you refreshed",
          ],
          a: 0,
          why: "A lagging replica served the second read, so the data seemed to move backwards.",
        },
      },
      {
        t: "Monotonic reads",
        b: `<p><b>Monotonic reads</b> means a user never sees time go backwards. A simple way: make each user <b>always read from the same replica</b>, so their view only moves forward.</p>`,
        v: F.flow([
          { t: "User 1", c: "blue" },
          { t: "always replica A", c: "teal" },
        ]),
        c: {
          type: "cat",
          q: "Which guarantee addresses each problem?",
          buckets: ["Read-your-writes", "Monotonic reads"],
          items: [
            ["You post, reload, and your post is missing", 0],
            ["Two refreshes in a row show the count going down", 1],
            ["Your new profile photo reverts after you save it", 0],
            ["A feed shows a newer post, then a refresh loses it", 1],
          ],
          why: "Read-your-writes protects a writer's view of their own updates. Monotonic reads stops a reader seeing older data after newer data.",
        },
      },
    ],
    guide: [
      "Press <b>Post a comment</b>, then <b>Refresh the page</b> straight away and again a few times.",
      "Compare the three policies, and watch the two counters.",
      "Move the lag slider and try again. Answer the questions after the demo.",
    ],
  };
})();
