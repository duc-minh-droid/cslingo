/* Data Science (COM3021), Lecture 4, part 3: the replication-log runner for 4.2, and 4.4 (new followers, failure and failover). */
(function () {
  const S = (NIC.shared.dsL4 = NIC.shared.dsL4 || {});
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { css, chip, node, reg } = S;

  const WR = [
    ["title", "Trip"],
    ["note", "Pack bags"],
    ["title", "Trip 2026"],
  ];
  function logRun(box, life) {
    F.run(box, life, {
      code: [
        "client sends the write to the leader",
        "leader applies it and appends it to the replication log",
        "each follower applies the entry, in log order",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const st = { Leader: [], "Follower A": [], "Follower B": [] };
        const snap = (x) => ({
          s: Object.fromEntries(Object.entries(st).map(([k, v]) => [k, v.slice()])),
          hot: "",
          ...x,
        });
        yield snap({
          cap: "One <b>leader</b> and two <b>followers</b>, all empty. Three client writes are coming.",
          line: 0,
        });
        for (let i = 0; i < WR.length; i++) {
          const [k, v] = WR[i],
            ent = `#${i + 1} ${k} = ${v}`;
          st.Leader.push(ent);
          const f = snap({
            hot: "Leader",
            line: 1,
            cap: `Write <b>${k} = ${v}</b> goes to the <b>leader</b>. It stores it and appends entry <b>#${i + 1}</b> to the replication log.`,
          });
          if (i === 0)
            f.ask = {
              q: "A client wants to write. Tap the node that must receive the write.",
              pick: ".d4-nd",
              a: ["Leader"],
              why: "Writes are only sent to the leader. Followers are read-only copies.",
            };
          yield f;
          st["Follower A"].push(ent);
          yield snap({
            hot: "Follower A",
            line: 2,
            cap: `<b>Follower A</b> applies entry #${i + 1}. <b>Follower B</b> is slower and has not received it yet.`,
          });
          st["Follower B"].push(ent);
          yield snap({
            hot: "Follower B",
            line: 2,
            cap: `<b>Follower B</b> applies #${i + 1} too. Same changes, <b>same order</b>.`,
          });
        }
        yield snap({
          cap: "All three hold the same data. Reads may go to <b>any</b> replica; writes only to the leader.",
          line: 2,
        });
      },
      draw(sc, f) {
        sc.innerHTML = `<div class="d4-row">${Object.entries(f.s)
          .map(([k, v]) =>
            node(
              k,
              k === "Leader" ? "Leader" : k,
              v.length,
              `pk ${k === "Leader" ? "lead" : ""} ${f.hot === k ? "hot" : ""}`,
              `<div>${v.map((x) => chip(x, x === v[v.length - 1] ? "new" : "")).join("") || '<span class="faint">(empty)</span>'}</div>`,
            ),
          )
          .join("")}</div>`;
      },
    });
  }

  S.logRun = logRun;

  /* ---- 4.4 runner: snapshot, copy, catch up ---- */
  function snapRun(box, life) {
    F.run(box, life, {
      code: [
        "take a snapshot of the leader at one point in time",
        "copy the snapshot to the new follower",
        "ask the leader for every change since the snapshot",
        "apply the backlog: the follower has caught up",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        let lead = 5,
          snap = 0,
          f3 = 0;
        const s = (x) => ({ lead, snap, f3, ...x });
        yield s({
          cap: "The leader holds changes up to <b>#5</b> and is still taking writes. A new follower, <b>F3</b>, needs a copy.",
          line: 0,
        });
        yield s({
          cap: "Copying the files as they are would catch the data <b>mid-change</b>, and locking out writes while copying is not ideal either.",
          line: 0,
        });
        snap = 5;
        yield s({
          cap: "Take a <b>snapshot</b> of the leader's database at one point in time: it holds everything up to <b>#5</b>.",
          line: 0,
        });
        f3 = 5;
        lead = 7;
        yield s({
          cap: "The snapshot is copied to F3. Copying took time, so the leader has accepted <b>#6</b> and <b>#7</b> meanwhile.",
          line: 1,
        });
        yield s({
          cap: "F3 now asks for all the changes since the snapshot.",
          line: 2,
          ask: {
            q: "The snapshot ended at #5. Tap the first log entry F3 must ask for.",
            pick: ".d4-ent",
            a: ["6"],
            why: "Everything up to #5 is already in the snapshot, so F3 needs #6 onwards.",
          },
        });
        f3 = 6;
        yield s({ cap: "F3 applies <b>#6</b>.", line: 3 });
        f3 = 7;
        lead = 8;
        yield s({ cap: "F3 applies <b>#7</b>. The leader took <b>#8</b> in the meantime.", line: 3 });
        f3 = 8;
        yield s({
          cap: "F3 applies <b>#8</b>: the backlog is processed, so F3 has <b>caught up</b> and is now an ordinary follower.",
          line: 3,
        });
      },
      draw(sc, f) {
        const ents = (n, from) =>
          Array.from({ length: n }, (_, i) => i + 1)
            .filter((i) => i > from)
            .map((i) => chip(`#${i}`, f.snap && i > f.snap ? "tmp" : ""));
        const lead = Array.from(
          { length: f.lead },
          (_, i) =>
            `<span class="d4-chip d4-ent ${f.snap && i + 1 > f.snap ? "tmp" : ""}" data-k="${i + 1}">#${i + 1}</span>`,
        ).join("");
        const snapChip = f.snap ? chip(`snapshot to #${f.snap}`, "new") : "";
        sc.innerHTML = `<div class="d4-row"><div class="d4-nd lead" data-k="Leader"><small>Leader log</small><div>${lead}</div></div>
          <div class="d4-nd ${f.f3 === f.lead ? "ok" : f.f3 ? "old" : "down"}" data-k="F3"><small>New follower F3</small><span class="d4-v">${f.f3 ? `#${f.f3}` : "empty"}</span><div>${snapChip}${f.f3 > f.snap ? ents(f.f3, f.snap).join("") : ""}</div></div></div>`;
      },
    });
  }

  /* ============ 4.4 New followers and failover ============ */
  const rand = (a, b) => a + Math.floor(N.rnd() * (b - a + 1));
  reg({
    id: "ds4-failover",
    order: 4,
    num: "4.4",
    title: "New followers and failover",
    blurb: "Add a replica without stopping writes, and survive a crashed leader without two bosses.",
    render(root, life) {
      css();
      root.appendChild(header(this, ""));
      const WRITTEN = 20;
      let ap, phase;
      const card =
        el(`<div class="card"><div class="card-head"><h2>The leader has crashed</h2><span class="tag">which follower should lead?</span></div>
        <div class="d4-row" id="n"></div><p class="dim" id="t" style="min-height:66px"></p>
        <div class="controls"><button class="btn rose" id="x">Crash the leader</button><button class="btn ghost" id="r">New run</button></div></div>`);
      root.appendChild(card);
      const draw = (picked) => {
        const best = Math.max(...ap);
        qs("#n", card).innerHTML =
          node("L", "Old leader", `#${WRITTEN}`, phase === "up" ? "lead ok" : "down", "wrote 20 changes") +
          ap
            .map((v, i) =>
              node(
                i,
                `Follower ${"ABC"[i]}`,
                `#${v}`,
                `${phase === "crashed" ? "pk " : ""}${picked === i ? "lead " : ""}${v === best ? "ok" : "old"}`,
                picked === i ? "new leader" : "applied so far",
              ),
            )
            .join("");
        qs("#t", card).innerHTML =
          phase === "up"
            ? "The leader has written 20 changes (#1 to #20), but followers apply them asynchronously, so each is at a different point. Press <b>Crash the leader</b>."
            : phase === "crashed"
              ? "<b>The leader is gone.</b> Tap the follower you want to promote to leader."
              : picked === undefined
                ? ""
                : ap[picked] === best
                  ? `You promoted a follower at <b>#${ap[picked]}</b>, the most up-to-date one. The <b>${WRITTEN - ap[picked]}</b> changes after it were never received by any follower, so they are lost.`
                  : `That follower is only at <b>#${ap[picked]}</b>. Another one reached <b>#${best}</b>, so promoting this one loses <b>${best - ap[picked]}</b> more changes than necessary (${WRITTEN - ap[picked]} lost in total).`;
        qsa(".pk", card).forEach((b) => (b.onclick = () => ((phase = "done"), draw(+b.dataset.k))));
      };
      const fresh = () => {
        const set = new Set();
        while (set.size < 3) set.add(rand(13, 19));
        ap = [...set];
        phase = "up";
        draw();
      };
      qs("#x", card).onclick = () => {
        phase = "crashed";
        draw();
      };
      qs("#r", card).onclick = fresh;
      fresh();

      let cut = false,
        prom = false,
        aW = 0,
        bW = 0;
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>A network fault</h2><span class="tag">split brain</span></div>
        <div class="d4-row" id="n2"></div><div class="controls" id="b2"></div><p class="dim" id="t2" style="min-height:66px"></p></div>`);
      root.appendChild(c2);
      const btn = (t, f, cls = "") => {
        const b = el(`<button class="btn small ${cls}">${t}</button>`);
        b.onclick = f;
        qs("#b2", c2).appendChild(b);
        return b;
      };
      let msg = "Everything is healthy: A is the leader. Press <b>Cut A off</b>.";
      const bCut = btn("Cut A off from B and C", () => {
        cut = true;
        msg =
          "B and C cannot hear A, so they assume it has <b>died</b>. But A is running and still believes it is the leader.";
        draw2();
      });
      const bProm = btn("Promote B to leader", () => {
        prom = true;
        msg = "B is the new leader. Now <b>both A and B</b> think they are the leader.";
        draw2();
      });
      btn("A client writes to A", () => {
        aW++;
        msg = cut ? "A accepts the write: it still thinks it is the leader." : "A is the leader and accepts the write.";
        draw2();
      });
      const bWB = btn("A client writes to B", () => {
        if (prom) bW++;
        msg = prom
          ? "B accepts the write as the new leader."
          : "<b>Refused:</b> B is a follower, so writes go to the leader.";
        draw2();
      });
      btn("Repair the network", () => {
        msg =
          prom && aW && bW
            ? `<b style="color:var(--rose-ink)">Split brain.</b> A holds ${aW} write${aW > 1 ? "s" : ""} that B never saw, and B holds ${bW} that A never saw. Two histories of one database: some must be lost, or the data is inconsistent.`
            : prom
              ? "The network is back. Only one side took writes, so the old leader can <b>step down</b> and follow B. This time it was luck."
              : "The network is back and A simply carries on as leader.";
        cut = prom = false;
        aW = bW = 0;
        draw2();
      });
      btn(
        "Reset",
        () => {
          cut = prom = false;
          aW = bW = 0;
          msg = "Everything is healthy: A is the leader. Press <b>Cut A off</b>.";
          draw2();
        },
        "ghost",
      );
      function draw2() {
        qs("#n2", c2).innerHTML =
          node("A", "Node A", `${aW} new`, cut ? "old" : "lead", cut ? "isolated, thinks it leads" : "leader") +
          node("B", "Node B", `${bW} new`, prom ? "lead" : "ok", prom ? "new leader" : "follower") +
          node("C", "Node C", "·", "ok", "follower");
        bProm.disabled = !cut || prom;
        bCut.disabled = cut;
        bWB.disabled = false;
        qs("#t2", c2).innerHTML = msg;
      }
      draw2();

      root.appendChild(
        predict({
          id: "ds4-failover-1",
          q: "The old leader had written 20 changes. The followers have reached #15, #18 and #16. You promote the follower at #18. How many of the 20 changes are lost?",
          opts: ["2", "5", "0"],
          a: 0,
          why: "The new leader only has changes up to #18, so #19 and #20 are lost. Promoting the follower at #15 would have lost 5.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds4-failover-2",
          q: "In the network-fault demo, A is cut off and B is promoted. Clients write to A and to B, then the network is repaired. What is the situation?",
          opts: [
            "Two leaders took different writes: split brain",
            "A's writes merge into B's cleanly and nothing is lost",
            "B refuses every write, so only A has data",
          ],
          a: 0,
          why: "Each side accepted writes the other never saw. Having two nodes that both believe they are the leader is split brain.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A new follower needs a copy of changing data. Copying the files is inconsistent, and locking out writes is not ideal. Instead: <b>snapshot</b> the leader, <b>copy</b> it, then <b>request the changes since the snapshot</b> until it has <b>caught up</b>.",
            "A <b>failed follower</b> knows from its logs the last transaction it processed, so it reconnects and requests the changes it missed.",
            "<b>Leader failure (failover)</b>: a follower is promoted, often the one with the most up-to-date changes. Anything it never received is lost.",
            "Many problems can arise, such as <b>split brain</b>: two nodes both believe they are the leader.",
          ],
          "Snapshot plus catch-up adds a follower without pausing writes, and failover must never leave two leaders.",
        ),
      );
    },
  });
  L["ds4-failover"] = {
    sum: "Adding followers with a snapshot and catch-up, follower recovery, leader failover and split brain.",
    steps: [
      {
        t: "Adding a follower is not a plain copy",
        b: `<p>To add a follower you need a copy of the data. But the data is <b>very dynamic</b>, so copying files while writes continue gives an inconsistent copy. <b>Locking</b> the database for writes while copying is not ideal either.</p>`,
        v: F.compare(
          { title: "Just copy it", c: "rose", body: "data changes during the copy" },
          { title: "Lock for writes", c: "amber", body: "the service cannot write meanwhile" },
        ),
        c: {
          q: "Why is simply copying a live leader's files a poor way to add a follower?",
          o: [
            "Data changes during the copy, so it is inconsistent",
            "Followers can only be created empty, never from data",
            "Copying always deletes the original files afterwards",
          ],
          a: 0,
          why: "Writes keep arriving during the copy, so different parts of the copy reflect different moments.",
        },
      },
      {
        t: "Snapshot, then catch up",
        b: `<p>Take a <b>snapshot</b> of the leader's database at one point in time and copy it to the new follower. The follower then requests <b>all changes since the snapshot</b>. When it has processed that backlog, it has <b>caught up</b>.</p>`,
        v: F.flow(["Snapshot", "Copy it over", "Request changes since", { t: "Caught up", c: "teal" }]),
        c: {
          type: "order",
          q: "Put the steps of adding a follower in order.",
          items: [
            "Take a snapshot of the leader at one point in time",
            "Copy the snapshot to the new follower",
            "The follower requests the changes made since the snapshot",
            "It processes the backlog and has caught up",
          ],
          why: "Snapshot first gives a consistent starting point, and the log supplies everything that happened afterwards.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Step through a new follower joining a leader that never stops taking writes.</p>`,
        v: (box, life) => snapRun(box, life),
      },
      {
        t: "When a follower fails",
        b: `<p>A follower that crashes and restarts knows <b>from its logs</b> the last transaction it processed. It connects to the leader and <b>requests the changes</b> since then, which is the same catch-up as before.</p>`,
        v: F.flow([
          "Follower restarts",
          "Read own log",
          "Ask leader for newer changes",
          { t: "Up to date", c: "teal" },
        ]),
        c: {
          q: "How does a restarted follower know what it missed?",
          o: [
            "Its own log shows the last change it processed",
            "It asks the client what was written",
            "It must delete everything and start again",
          ],
          a: 0,
          why: "The log records its last processed transaction, so it asks the leader for just the later ones.",
        },
      },
      {
        t: "When the leader fails: failover",
        b: `<p>One of the followers is <b>promoted</b> to be the new leader. Often it is the replica with the <b>most up-to-date</b> changes from the old leader. Anything no follower had received is lost.</p>`,
        v: F.cells(
          [
            { v: "#17", sub: "Follower A", c: "amber" },
            { v: "#19", sub: "Follower B: promote", c: "teal" },
            { v: "#18", sub: "Follower C", c: "amber" },
          ],
          { size: 128 },
        ),
        c: {
          q: "The followers have applied changes up to #17, #19 and #18. Which is the usual best choice for the new leader?",
          o: ["The one at #19", "The one at #17", "Any, since they are all copies"],
          a: 0,
          why: "The follower with the most up-to-date changes loses the fewest writes. They are not identical copies while replication lags.",
        },
      },
      {
        t: "Split brain",
        b: `<p>Many problems can arise during failover. The best-known is <b>split brain</b>: the old leader is only cut off, not dead, so after a follower is promoted <b>two nodes both believe they are the leader</b> and accept different writes.</p>`,
        v: F.compare(
          { title: "Old leader", c: "rose", body: "alive but cut off<br>still thinks it leads" },
          { title: "New leader", c: "rose", body: "promoted by the others<br>also accepts writes" },
        ),
        c: {
          q: "What is split brain?",
          o: [
            "Two nodes both think they lead and accept writes",
            "The data being divided into partitions across nodes",
            "A follower being far behind the leader log",
          ],
          a: 0,
          why: "Two leaders accepting writes means diverging histories. It is different from partitioning, and different from lag.",
        },
      },
    ],
    guide: [
      "In the first demo, press <b>Crash the leader</b> and promote a follower. Try <b>New run</b> and choose a different one each time.",
      "In the second demo, press <b>Cut A off</b>, <b>Promote B</b>, write to both sides, then <b>Repair the network</b>.",
      "Answer the questions after the demos.",
    ],
  };
})();
