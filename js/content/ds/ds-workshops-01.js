/* Data Science workshops (COM3021): no-code, hands-on labs built on NIC.workshop.
   1.W Ops room (reliability, load, p99) · 2.W Query lab (relational / document / graph) · 3.W Engine room (memtable, SSTables, compaction).
   Every number on screen comes from the simulation, never typed in. */
(function () {
  const partScope = (NIC.shared.dsWorkshops = NIC.shared.dsWorkshops || {});

  const N = NIC,
    { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (lecture, m) => N.register({ subject: "ds", lecture, order: 90, workshop: true, ...m });
  const fxOn = () => N.fx && N.fx.ok;
  const snd = (n) => N.sfx && N.sfx.play(n);
  const list = (a) => (a.length ? a.join(", ") : "nobody");

  /* =====================================================================
     1.W  OPS ROOM: keep a photo app alive
     ===================================================================== */
  const CAP = 100,
    SLO = 300,
    BASE = 20,
    MAXS = 10;
  function perf(servers, load) {
    const alive = servers.filter((s) => s === "ok").length;
    if (!alive) return { alive, state: "down" };
    const u = load / (CAP * alive);
    if (u > 1) return { alive, u, state: "over" };
    const p50 = Math.round(BASE / (1 - 0.9 * u)),
      p99 = Math.round(p50 * 3.5);
    return { alive, u, p50, p99, state: p99 <= SLO ? "ok" : "slow" };
  }

  function opsRoom(stage, api, life) {
    let servers, load, mode, canary;
    const reset = () => {
      servers = ["ok", "ok", "ok"];
      load = 300;
      canary = -1;
    };
    reset();
    mode = "all";
    const card = el(`<div class="wk-card">
      <h3>Snapbox: live traffic<span class="wk-sp"></span><span class="wk-badge" data-badge>Healthy</span></h3>
      <div class="wk-lane-l">users ▸ load balancer ▸ servers</div><div class="wk-lane" data-lane></div>
      <div class="wk-servers" data-srv style="margin-top:12px"></div>
      <div class="wk-stats" style="margin-top:12px" data-stats></div>
      <div data-lat style="margin-top:10px"></div>
      </div>`);
    const ctl = el(`<div class="wk-card"><h3>Controls</h3>
      <div class="wk-row" data-c1></div>
      <div class="wk-row" data-c2 style="margin-top:12px"></div></div>`);
    stage.append(card, ctl);
    const lane = qs("[data-lane]", card),
      srvBox = qs("[data-srv]", card);
    const sl = N.slider("Traffic", 100, 900, 50, load, (v) => `${v} req/s`);
    const bAdd = el(`<button class="btn">+ Add server</button>`),
      bKill = el(`<button class="btn rose">Kill a server</button>`),
      bFix = el(`<button class="btn">Replace failed</button>`);
    const bDep = el(`<button class="btn primary">Deploy v2</button>`),
      bBack = el(`<button class="btn">Roll back</button>`),
      bRs = el(`<button class="btn ghost small">Reset room</button>`);
    qs("[data-c1]", ctl).append(bAdd, bKill, bFix, sl);
    qs("[data-c2]", ctl).append(
      N.seg(
        [
          ["all", "All at once"],
          ["canary", "One server first"],
        ],
        mode,
        (v) => {
          mode = v;
        },
      ),
      bDep,
      bBack,
      bRs,
    );
    qs("[data-c2]", ctl).insertAdjacentHTML(
      "afterbegin",
      `<span class="faint" style="font-weight:800">Release v2 (it has a bug):</span>`,
    );

    const tiles = [];
    function draw(pop) {
      const P = perf(servers, load);
      while (tiles.length < servers.length) {
        const t = el(
          `<div class="wk-srv pop-in"><div>Server ${tiles.length + 1}</div><div class="wk-meter"><i></i></div><div data-t></div></div>`,
        );
        tiles.push(t);
        srvBox.appendChild(t);
      }
      while (tiles.length > servers.length) tiles.pop().remove();
      servers.forEach((s, i) => {
        const t = tiles[i],
          u = P.u || 0;
        t.className = `wk-srv ${s === "dead" ? "dead" : s === "bug" ? "bug" : u > 0.85 ? "max" : u > 0.65 ? "hot" : ""}${i === canary && s === "bug" ? " canary" : ""}`;
        qs("i", t).style.transform = `scaleY(${s === "ok" ? Math.max(0.06, Math.min(1, u)) : 0})`;
        qs("[data-t]", t).textContent =
          s === "ok" ? `${Math.round(u * 100)}% busy` : s === "dead" ? "disk failed" : "bug crash";
      });
      if (pop != null && tiles[pop]) {
        fxOn() && N.fx.springIn(tiles[pop], { from: 0.5, bounce: 0.55, dur: 0.45 });
      }
      const badge = qs("[data-badge]", card);
      badge.className = `wk-badge ${P.state === "ok" ? "" : P.state === "slow" ? "slow" : "down"}`;
      badge.textContent = { ok: "Healthy", slow: "Too slow", over: "Overloaded", down: "DOWN" }[P.state];
      const cap = P.alive * CAP;
      qs("[data-stats]", card).innerHTML =
        N.wk.stat("Servers up", `${P.alive} / ${servers.length}`, P.alive === servers.length ? "teal" : "amber") +
        N.wk.stat("Traffic", `${load} req/s`, "blue") +
        N.wk.stat("Capacity", `${cap} req/s`) +
        N.wk.stat(
          "Busy",
          P.u == null ? "-" : `${Math.round(P.u * 100)}%`,
          P.u > 1 ? "rose" : P.u > 0.85 ? "amber" : "teal",
        );
      const bar = (name, ms, cls) =>
        `<div class="wk-lat"><span>${name}</span><span class="wk-track"><i class="${cls}" style="transform:scaleX(${ms == null ? 1 : Math.min(1, ms / 800)})"></i>${name === "p99" ? `<span class="wk-slo" style="left:${(SLO / 800) * 100}%"></span>` : ""}</span><output>${P.state === "down" ? "no answer" : P.state === "over" ? "timeouts" : ms + " ms"}</output></div>`;
      qs("[data-lat]", card).innerHTML =
        bar("median", P.p50, P.state === "ok" || P.state === "slow" ? "" : "bad") +
        bar("p99", P.p99, P.state === "ok" ? "" : "bad") +
        `<div class="faint" style="font-size:12px;font-weight:800;text-align:right">black line = goal: p99 under ${SLO} ms</div>`;
      // traffic dots: more traffic, more dots, faster
      const n = Math.max(2, Math.min(10, Math.round(load / 100))),
        w = Math.max(200, (lane.clientWidth || 600) - 16);
      lane.className = `wk-lane${P.state === "ok" ? "" : " bad"}`;
      lane.innerHTML = Array.from(
        { length: n },
        (_, i) =>
          `<span class="wk-pkt" style="--dl:${(-i * 2.6) / n}s;--fd:${Math.max(1.3, 3.2 - load / 450)}s;--lw:${w}px"></span>`,
      ).join("");
      btns(P);
    }
    function btns() {
      bAdd.disabled = servers.length >= MAXS;
      bKill.disabled = !servers.includes("ok");
      bFix.disabled = !servers.some((s) => s !== "ok");
      bBack.disabled = !servers.includes("bug");
    }
    const healthy = () => perf(servers, load).state === "ok";
    const served = () => ["ok", "slow"].includes(perf(servers, load).state);

    bAdd.onclick = () => {
      servers.push("ok");
      draw(servers.length - 1);
      snd("pop");
      const P = perf(servers, load);
      api.say(
        P.state === "ok"
          ? `Server ${servers.length} is in. Each one takes a share, so everyone gets faster.`
          : `Added a server, but at ${Math.round((P.u || 9) * 100)}% busy it's still too hot. Capacity is ${CAP} req/s per server.`,
        "happy",
      );
      if (load >= 600 && healthy()) api.done("spike");
    };
    bKill.onclick = () => {
      const ok = servers.map((s, i) => (s === "ok" ? i : -1)).filter((i) => i >= 0),
        i = ok[Math.floor(N.rnd() * ok.length)];
      servers[i] = "dead";
      snd("wrong");
      draw();
      fxOn() && N.fx.shake(tiles[i]);
      const P = perf(servers, load);
      if (P.state === "ok") {
        api.say(
          "A disk died and nobody noticed. That's a <b>fault</b> that never became a <b>failure</b>: you had spare capacity.",
          "love",
        );
        if (load >= 300) api.done("fault");
      } else if (P.state === "down") api.say("That was the last server. Total failure.", "cry");
      else
        api.say(
          `One server down and Snapbox is <b>${P.state === "over" ? "overloaded" : "too slow"}</b>. Faults are normal, so keep headroom for them.`,
          "sad",
        );
    };
    bFix.onclick = () => {
      servers = servers.map((s) => "ok");
      canary = -1;
      draw();
      snd("tick");
      api.say(
        "Failed servers replaced. In real life: swap the disk, or let the orchestrator restart the machine.",
        "happy",
      );
    };
    sl.onInput((v) => {
      load = v;
      draw();
      const P = perf(servers, load);
      if (load >= 600 && P.state === "ok") api.done("spike");
      if (P.state !== "ok" && load >= 600)
        api.say(`${load} req/s needs more capacity. Add servers until the goal line holds.`, "think");
    });
    bDep.onclick = () => {
      const up = servers.map((s, i) => (s === "ok" ? i : -1)).filter((i) => i >= 0);
      if (!up.length) {
        api.say("There's nothing running to deploy to.", "think");
        return;
      }
      if (mode === "all") {
        up.forEach((i) => (servers[i] = "bug"));
        canary = -1;
        draw();
        snd("sad");
        up.forEach((i) => fxOn() && N.fx.shake(tiles[i]));
        api.say(
          `Every server runs the <b>same</b> code, so the same bug hit all ${up.length} at once. A software fault is <b>correlated</b>: adding servers would not have helped.`,
          "shocked",
        );
        if (perf(servers, load).state === "down") api.done("outage");
      } else {
        canary = up[0];
        servers[canary] = "bug";
        draw();
        snd("wrong");
        fxOn() && N.fx.shake(tiles[canary]);
        if (served()) {
          api.say(
            "Only the <b>first</b> server got v2 and it crashed. Everyone else is on v1 and users barely noticed. Now roll back.",
            "happy",
          );
          api.done("release");
        } else
          api.say(
            "The canary crashed, but the rest couldn't cope with its share of traffic. Lower traffic or add servers first, then try a safer release.",
            "think",
          );
      }
    };
    bBack.onclick = () => {
      servers = servers.map((s) => (s === "bug" ? "ok" : s));
      canary = -1;
      draw();
      snd("tick");
      api.say("Rolled back to v1. Service restored.", "happy");
    };
    bRs.onclick = () => {
      reset();
      sl.value = load;
      draw();
      api.say("Room reset: 3 servers and 300 req/s.", "idle");
    };
    life.onResize(() => draw());
    draw();
  }

  reg(1, {
    id: "ds-ops",
    num: "1.W",
    title: "Workshop: keep the app alive",
    blurb: "No code. Run the ops room for a photo app: survive failed servers, traffic spikes and a bad release.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro: "Welcome to the ops room. <b>Snapbox</b> has 3 servers and 300 req/s. Let's break things safely.",
        missions: [
          {
            id: "fault",
            t: "Survive a dead server",
            d: "Press <b>Kill a server</b> while Snapbox stays <b>Healthy</b> at 300 req/s or more.",
            hint: "Each server handles 100 req/s. After one dies, the rest must stay under about 85% busy. How many servers does that need?",
          },
          {
            id: "spike",
            t: "Ride a traffic spike",
            d: "Push traffic to <b>600 req/s</b> and keep it <b>Healthy</b>.",
            hint: "p99 is the slowest 1 in 100 requests. Watch it cross the black line as servers get busier.",
          },
          {
            id: "release",
            t: "Release without an outage",
            d: "Deploy v2 <b>one server first</b> and keep users being served.",
            hint: "Set the switch to <b>One server first</b>. If the rest can't cope with the load, lower traffic or add a server first.",
          },
          {
            id: "outage",
            t: "Cause an outage on purpose",
            d: "Deploy v2 <b>all at once</b> and watch what happens.",
            hint: "Roll back or press <b>Reset room</b> first, then switch to <b>All at once</b>.",
          },
        ],
        build: (stage, api) => opsRoom(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "ds-ops-1",
          q: "Snapbox has 4 servers, each handling 100 req/s, and 320 req/s of traffic. One disk dies. What happens to the remaining three?",
          opts: [
            "They run above their capacity, so the app slows or fails",
            "They share it easily: 320 req/s is under 400",
            "Nothing, because faults never reduce capacity",
          ],
          a: 0,
          why: "Three servers give 300 req/s of capacity, below the 320 they now receive. A healthy-looking system can fail after one ordinary fault if it has no headroom.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-ops-2",
          q: "A new release crashes on start-up. Which rollout limits the damage to the fewest users?",
          opts: [
            "Send v2 to one server first and watch it",
            "Send v2 to every server at the same moment",
            "Send v2 to every server overnight",
          ],
          a: 0,
          why: "A software bug is correlated: every server running it fails the same way. A canary exposes a small slice of traffic to the new code, so a bad release is caught early.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Hardware faults are <b>independent</b>: extra servers absorb them, but only if you kept <b>headroom</b>.",
            "Software faults are <b>correlated</b>: the same bug hits every copy, so more servers do not help. Roll out <b>gradually</b>.",
            "Judge speed by a <b>percentile</b> (p99), not just the median: the slowest users feel trouble first.",
          ],
          "Plan for one ordinary fault to happen, and release changes to a few servers before all of them.",
        ),
      );
    },
  });
  L["ds-ops"] = {
    sum: "A hands-on ops room: survive faults and spikes, then release a bad version safely.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>You run the servers for <b>Snapbox</b>, a photo app. Four missions: lose a server, take a traffic spike, ship a buggy release carefully, then ship it badly on purpose.</p><p>Every server handles <b>100 requests per second</b>. The goal is a <b>p99 under 300 ms</b>.</p>`,
        v: F.flow(["Traffic", { t: "Load balancer", c: "blue" }, { t: "Servers", c: "teal" }]),
        c: {
          q: 'What does "p99 = 300 ms" mean?',
          o: [
            "99 in 100 requests finish within 300 ms",
            "The average request takes 300 ms",
            "99% of servers respond in 300 ms",
          ],
          a: 0,
          why: "A percentile describes the slowest users: p99 is the time that all but 1 request in 100 beat.",
        },
      },
      {
        t: "Busier means slower",
        b: `<p>A server that is half busy answers quickly. One near its limit queues requests, and the <b>slowest</b> ones suffer first.</p><p>So leave <b>headroom</b>. Capacity you need only when something breaks is still capacity you need.</p>`,
        v: F.compare(
          { title: "40% busy", c: "teal", body: "requests rarely wait: p99 stays small" },
          { title: "95% busy", c: "rose", body: "a queue forms: p99 balloons, then timeouts" },
        ),
        c: {
          q: "Why keep servers well below 100% busy in normal times?",
          o: [
            "So a failure or spike does not push them over the edge",
            "Because idle servers are cheaper to run",
            "Because 100% busy servers lose data",
          ],
          a: 0,
          why: "Headroom is what lets one failed server or one spike be absorbed instead of becoming an outage.",
        },
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };

  /* =====================================================================
     2.W  QUERY LAB: the same question on tables, documents and a graph
     ===================================================================== */
  const PEOPLE = {
    Ana: ["Leeds", "Acme"],
    Ben: ["Leeds", "Bolt"],
    Cy: ["York", "Acme"],
    Dee: ["York", "Bolt"],
    Eli: ["Hull", "Acme"],
  };
  const NAMES = Object.keys(PEOPLE);
  const FRIENDS = [
    ["Ana", "Ben"],
    ["Ben", "Cy"],
    ["Cy", "Dee"],
    ["Dee", "Eli"],
  ];
  const GPOS = { Ana: [50, 70], Ben: [150, 35], Cy: [250, 70], Dee: [350, 35], Eli: [450, 70] };
  const nbrs = (n) => FRIENDS.flatMap(([a, b]) => (a === n ? [b] : b === n ? [a] : []));
  const BLOCKS = [
    { id: "all", k: "start", t: "Start: everyone" },
    { id: "ana", k: "start", t: "Start: Ana" },
    { id: "c-Leeds", k: "flt", t: "City is Leeds" },
    { id: "c-York", k: "flt", t: "City is York" },
    { id: "c-Hull", k: "flt", t: "City is Hull" },
    { id: "w-Acme", k: "flt", t: "Works at Acme" },
    { id: "w-Bolt", k: "flt", t: "Works at Bolt" },
    { id: "hop", k: "hop", t: "Go to friends" },
  ];
  const BL = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));
  Object.assign(partScope, { BL, BLOCKS, FRIENDS, GPOS, NAMES, PEOPLE, fxOn, list, nbrs, reg, snd });
})();
