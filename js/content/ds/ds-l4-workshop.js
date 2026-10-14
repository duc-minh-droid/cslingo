/* Data Science (COM3021), Lecture 4 workshop 4.W: run a replica cluster (no code). */
(function () {
  const S = NIC.shared.dsL4;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { css, chip, node } = S;
  const snd = (n) => N.sfx && N.sfx.play(n);
  const ORDER = ["A", "B", "C", "D"];

  function cluster(stage, api, life) {
    css();
    let t, nodes, leader, pend, wl, top, myLast, mode, ryw, lagB, lostAcked, promoted, semiAcked;
    const seed = () => {
      t = 0;
      top = myLast = 1;
      mode = mode || "async";
      ryw = ryw || false;
      lagB = lagB || 4;
      nodes = {
        L: { name: "Leader", up: true, ap: 1, lag: 0, join: null },
        A: { name: "Follower A", up: true, ap: 1, lag: 1, join: null },
        B: { name: "Follower B", up: true, ap: 1, lag: lagB, join: null },
      };
      leader = "L";
      pend = [];
      wl = [];
      lostAcked = 0;
      promoted = false;
      semiAcked = 0;
    };
    seed();
    const top1 = el(
      `<div class="wk-card"><h3>Cluster settings</h3><div class="wk-row" id="set"></div><div class="wk-row" id="sl" style="margin-top:8px"></div></div>`,
    );
    const body =
      el(`<div class="wk-card"><h3>The cluster<span class="wk-sp"></span><span class="faint" id="clk" style="text-transform:none;letter-spacing:0"></span></h3>
      <div class="d4-row" id="nd"></div><div class="wk-row" id="ctl"></div><div id="wl" style="margin-top:8px"></div></div>`);
    const out = el(`<div class="wk-out">Write something, then read it back from the followers.</div>`);
    stage.append(top1, body, out);
    const setOut = (h) => {
      out.innerHTML = h;
      N.wk.flash(out);
    };
    const followers = () => ORDER.filter((k) => nodes[k] && k !== leader);
    const syncNode = () => followers().find((k) => nodes[k].up && !nodes[k].join);
    const acked = () => wl.filter((w) => w.ack).map((w) => w.seq);

    const lagSl = N.slider("Follower B lag", 2, 6, 1, lagB, (v) => `${v} ticks`);
    qs("#set", top1).append(
      N.seg(
        [
          ["async", "Asynchronous"],
          ["semi", "Semi-synchronous"],
        ],
        mode,
        (v) => (mode = v),
      ),
      N.seg(
        [
          ["off", "Plain reads"],
          ["on", "Own writes from the leader"],
        ],
        ryw ? "on" : "off",
        (v) => (ryw = v === "on"),
      ),
    );
    qs("#sl", top1).appendChild(lagSl);
    lagSl.onInput((v) => {
      lagB = v;
      nodes.B.lag = v;
    });
    const bW = el(`<button class="btn primary">Write to the leader</button>`),
      bCrash = el(`<button class="btn rose">Crash the leader</button>`),
      bAdd = el(`<button class="btn">Add a follower</button>`),
      bRs = el(`<button class="btn ghost small">Reset</button>`);
    qs("#ctl", body).append(bW, bCrash, bAdd, bRs);

    function draw() {
      qs("#clk", body).textContent = `tick ${t}`;
      const host = qs("#nd", body);
      host.innerHTML = "";
      Object.entries(nodes).forEach(([k, n]) => {
        const role = !n.up
          ? "crashed"
          : k === leader
            ? "leader"
            : n.join
              ? n.join.stage === "snap"
                ? "copying snapshot"
                : "catching up"
              : "follower";
        const c = el(
          node(
            k,
            n.name,
            `v${n.ap}`,
            `${k === leader && n.up ? "lead " : ""}${!n.up ? "down" : n.ap >= top ? "ok" : "old"}`,
            role,
          ),
        );
        host.appendChild(c);
        if (n.up) {
          const r = el(`<button class="btn small" style="margin-top:6px">Read</button>`);
          r.onclick = () => read(k);
          c.appendChild(r);
          if (leader && !nodes[leader].up && k !== leader && !n.join) {
            const p = el(`<button class="btn small primary" style="margin:6px 0 0 4px">Promote</button>`);
            p.onclick = () => promote(k);
            c.appendChild(p);
          }
        }
      });
      qs("#wl", body).innerHTML =
        `<span class="faint" style="font-size:12.5px">Writes: </span>` +
        (wl.map((w) => chip(`v${w.seq}${w.ack ? " done" : " waiting"}`, w.ack ? "new" : "tmp")).join("") ||
          '<span class="faint">none yet</span>');
      bCrash.disabled = !nodes[leader] || !nodes[leader].up;
      bAdd.disabled = ORDER.every((k) => nodes[k]);
    }
    function write() {
      if (!nodes[leader] || !nodes[leader].up) {
        setOut("<b>No leader.</b> The old leader is down: promote a follower first.");
        snd("wrong");
        return;
      }
      const seq = ++top;
      myLast = seq;
      nodes[leader].ap = seq;
      const w = { seq, ack: mode === "async" || !syncNode(), mode };
      wl.push(w);
      followers().forEach((k) => nodes[k].up && !nodes[k].join && pend.push({ k, seq, due: t + nodes[k].lag }));
      snd("tap");
      setOut(
        w.ack
          ? `Leader stored <b>v${seq}</b> and told the client <b>done</b> straight away. The followers get it a little later.`
          : `Leader stored <b>v${seq}</b> and is <b>waiting</b> for ${nodes[syncNode()].name} before answering.`,
      );
      if (promoted && !lostAcked && semiAcked) {
        api.say(
          "A write on the new leader, and nothing the client was told about is missing. A clean failover.",
          "love",
        );
        api.done("safe");
      }
      draw();
    }
    function deliver() {
      pend
        .filter((p) => p.due <= t)
        .forEach((p) => {
          const n = nodes[p.k];
          if (n && n.up) n.ap = Math.max(n.ap, p.seq);
        });
      pend = pend.filter((p) => p.due > t);
      wl.forEach((w) => {
        if (!w.ack && syncNode() && nodes[syncNode()].ap >= w.seq) {
          w.ack = true;
          if (w.mode === "semi") semiAcked++;
        }
      });
      Object.entries(nodes).forEach(([k, n]) => {
        if (!n.join) return;
        if (n.join.stage === "snap") {
          if (++n.join.t >= 2) {
            n.ap = n.join.snap;
            n.join.stage = "catch";
            setOut(`Snapshot copied (<b>v${n.ap}</b>). ${n.name} now asks the leader for every change since then.`);
          }
        } else if (nodes[leader]) {
          n.ap = Math.min(nodes[leader].ap, n.ap + 1);
          if (n.ap >= nodes[leader].ap) {
            n.join = null;
            setOut(`<b>${n.name}</b> has <b>caught up</b> and is now an ordinary follower.`);
            api.say("Snapshot, then catch-up: a new follower joined without ever stopping the writes.", "happy");
            api.done("join");
            snd("correct");
          }
        }
      });
    }
    function read(k) {
      let from = k,
        note = "";
      if (ryw && k !== leader && nodes[k].ap < myLast && nodes[leader] && nodes[leader].up) {
        from = leader;
        note = ` (${nodes[k].name} was behind your last write, so the read went to the leader)`;
      }
      const seen = nodes[from].ap,
        stale = seen < myLast;
      snd(stale ? "wrong" : "correct");
      setOut(
        `${nodes[from].name} says <b>v${seen}</b>${note}. ${stale ? `<span class="no">Stale: your latest write was v${myLast}.</span>` : '<span class="ok">Fresh.</span>'}`,
      );
      if (stale) {
        api.say(
          "You wrote v" +
            myLast +
            " but this replica still shows v" +
            seen +
            ". That is replication lag. Can you fix it?",
          "think",
        );
        api.done("stale");
      } else if (note) {
        api.say("Reading your own new data from the leader: the read-your-writes guarantee.", "happy");
        api.done("fix");
      }
      draw();
    }
    function crash() {
      nodes[leader].up = false;
      pend = [];
      snd("sad");
      N.fx && N.fx.ok && N.fx.shake(qs(`[data-k="${leader}"]`, body));
      setOut("<b>The leader crashed.</b> Changes still on their way to the followers are gone. Promote a follower.");
      api.say(
        "No leader means no writes. Pick the follower to promote, and think about which has the most data.",
        "shocked",
      );
      draw();
    }
    function promote(k) {
      const ap = nodes[k].ap;
      const lost = acked().filter((s) => s > ap).length;
      lostAcked = lost;
      promoted = true;
      leader = k;
      top = ap;
      myLast = Math.min(myLast, ap);
      followers().forEach((f) => {
        if (nodes[f].up) nodes[f].ap = Math.min(nodes[f].ap, ap);
        if (nodes[f].up && nodes[f].ap < ap) pend.push({ k: f, seq: ap, due: t + nodes[f].lag });
      });
      wl = wl.filter((w) => w.seq <= ap);
      snd("whoosh");
      if (lost) {
        setOut(
          `${nodes[k].name} is the new leader at <b>v${ap}</b>. <span class="no">${lost} write${lost > 1 ? "s" : ""} the client was told were done never reached it: lost.</span>`,
        );
        api.say(
          "The client was told those writes worked, but no surviving node has them. That is the cost of asynchronous replication.",
          "sad",
        );
        if (mode === "async") api.done("lost");
      } else {
        setOut(`${nodes[k].name} is the new leader at <b>v${ap}</b>. Every write the client was told about survived.`);
        api.say("Nothing acknowledged was lost. Now write again to prove the new leader works.", "happy");
      }
      draw();
    }
    function addFollower() {
      const id = ORDER.find((k) => !nodes[k]);
      nodes[id] = {
        name: `Follower ${id}`,
        up: true,
        ap: 0,
        lag: 2,
        join: { stage: "snap", t: 0, snap: nodes[leader].ap },
      };
      setOut(
        `A <b>snapshot</b> of the leader at <b>v${nodes[leader].ap}</b> is being copied to ${nodes[id].name}. The leader keeps taking writes.`,
      );
      snd("pop");
      draw();
    }
    bW.onclick = write;
    bCrash.onclick = crash;
    bAdd.onclick = () =>
      nodes[leader].up ? addFollower() : setOut("Promote a new leader first: a snapshot needs one to copy.");
    bRs.onclick = () => {
      seed();
      draw();
      setOut("Cluster reset: a leader and two followers, all at v1.");
      api.say("Fresh cluster. Pick the next mission.", "idle");
    };
    life.interval(() => {
      t++;
      deliver();
      draw();
    }, 600);
    draw();
  }

  N.register({
    subject: "ds",
    lecture: 4,
    order: 90,
    workshop: true,
    id: "ds4-cluster",
    num: "4.W",
    title: "Workshop: run a replica cluster",
    blurb: "No code. Write to a leader, read stale data, crash it and fail over.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "A <b>leader</b> and two <b>followers</b>. Every <b>tick</b> the log moves along. Write, read, crash, promote, then add a new follower.",
        missions: [
          {
            id: "stale",
            t: "Spot a stale read",
            d: "Press <b>Write to the leader</b>, then straight away <b>Read</b> from <b>Follower B</b>.",
            hint: "Follower B lags by several ticks. Read it right after writing and compare with the leader.",
          },
          {
            id: "fix",
            t: "Fix the stale read",
            d: "Switch on <b>Own writes from the leader</b>, write again and read from <b>Follower B</b>.",
            hint: "With the setting on, a read from a replica that is behind your last write is sent to the leader.",
          },
          {
            id: "lost",
            t: "Lose an acknowledged write",
            d: "In <b>Asynchronous</b> mode, write, then <b>Crash the leader</b> at once and <b>Promote</b> a follower that has not got it.",
            hint: "Crash within a tick or two of the write, then promote Follower B, which lags the most.",
          },
          {
            id: "safe",
            t: "Fail over safely",
            d: "Press <b>Reset</b>. In <b>Semi-synchronous</b> mode write and wait for <b>done</b>, crash the leader, promote the follower with the newest data, then write again.",
            hint: "Semi-synchronous waits for one follower, so after the write says done at least one follower holds it. Promote the one at the highest version.",
          },
          {
            id: "join",
            t: "Bring in a new follower",
            d: "Press <b>Reset</b>, then <b>Add a follower</b> and watch it copy a snapshot and catch up.",
            hint: "Keep writing while it joins: the leader never stops, and the new follower asks for the changes made since its snapshot.",
          },
        ],
        build: (stage, api) => cluster(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "ds4-cluster-1",
          q: "In asynchronous mode the leader tells the client 'done', then crashes before any follower has the write. You promote a follower. What happened to that write?",
          opts: [
            "It is lost, though the client was told it succeeded",
            "It is recovered from the follower's log",
            "It is kept on the crashed leader and still readable",
          ],
          a: 0,
          why: "No surviving node ever received it. Asynchronous replication answers before followers confirm, so this window of loss exists.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds4-cluster-2",
          q: "A user saves a post and reloads, but the post is missing because the read hit a lagging follower. Which change in the workshop fixes it for that user?",
          opts: [
            "Route their own recent reads to the leader",
            "Crash the leader and promote follower B at once",
            "Make the lag slider bigger so B has more time",
          ],
          a: 0,
          why: "Read-your-writes consistency: a user's own recent updates are read from the leader (or a replica known to have caught up).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Followers lag the leader: a read from a slow replica can be <b>stale</b>. <b>Read-your-writes</b> sends a user's own recent reads to a fresh node.",
            "<b>Asynchronous</b> replication can lose writes the client was told succeeded; <b>semi-synchronous</b> keeps one up-to-date follower.",
            "<b>Failover</b>: promote the follower with the most up-to-date changes, then carry on writing.",
            "A new follower joins by <b>snapshot plus catch-up</b>, with no pause in writes.",
          ],
          "Replicas trade freshness and safety for availability, and you choose where to pay.",
        ),
      );
    },
  });
  L["ds4-cluster"] = {
    sum: "Drive a small replica cluster by hand: stale reads, read-your-writes, lost writes, failover and new followers.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>You run a cluster of one <b>leader</b> and two <b>followers</b>. Writes go to the leader, and the replication log reaches each follower after a delay (its <b>lag</b>).</p>`,
        v: F.flow(["Write", { t: "Leader", c: "blue" }, { t: "Followers", c: "teal" }]),
        c: {
          q: "A follower is a few ticks behind the leader. A read sent to it returns...",
          o: ["Older data than the leader holds", "An error", "Newer data than the leader holds"],
          a: 0,
          why: "A follower applies changes after the leader does, so it can briefly hold older data.",
        },
      },
      {
        t: "Two dials",
        b: `<p><b>Asynchronous</b> answers the client at once. <b>Semi-synchronous</b> waits for one follower first. And a setting can send your <b>own recent reads</b> to the leader. Try each, then crash the leader.</p>`,
        v: F.compare(
          { title: "Asynchronous", c: "amber", body: "fast answer, a crash can lose writes" },
          { title: "Semi-synchronous", c: "teal", body: "one follower confirms first" },
        ),
        c: {
          q: "Which setting keeps an acknowledged write safe if the leader crashes right after the answer?",
          o: ["Semi-synchronous", "Asynchronous"],
          a: 0,
          why: "The leader waited for a follower to have the write before answering, so a copy survives.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
