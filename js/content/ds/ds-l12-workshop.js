/* Data Science Lecture 12 workshop (12.W): ship Loafly. Fit six services on one server, order a Dockerfile so code
   changes rebuild fast, scale for the lunch rush, and survive a node going down. No code, no typing.
   Models come from ds-l12-02.js (usage) and ds-l12-03.js (build, clusterSvg) through NIC.shared.ds12. */
(function () {
  const S = NIC.shared.ds12;
  const N = NIC;
  const { el, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, seg, stats, setStats, vmStack, ctStack, usage, build, dfHtml, clusterSvg } = S;

  const RAM = 12, // GB on Loafly's server (illustrative)
    PER_POD = 20, // orders a minute one shop pod can serve
    RUSH = 100; // orders a minute at lunchtime

  function sandbox(stage, api) {
    const C1 = el(
      `<div class="wk-card"><h3>1 · Fit the server (${RAM} GB)</h3><div class="controls" data-m></div><div class="controls" data-s></div><div data-f></div>${stats(
        [
          ["amber", "Operating systems"],
          ["blue", "Memory needed"],
          ["teal", "Fits?"],
        ],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    const C2 = el(
      `<div class="wk-card"><h3>2 · Fast rebuilds</h3><div class="controls" data-o></div><div data-f></div><div class="controls"><button class="btn primary" data-b>Edit the code, then docker build</button></div>${stats(
        [["amber", "Layers rebuilt"]],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    const C3 = el(
      `<div class="wk-card"><h3>3 · Lunch rush (${RUSH} orders a minute)</h3><div class="controls" data-s></div><div data-f></div><div class="controls"><button class="btn primary" data-r>Start the lunch rush</button><button class="btn" data-n>Node 2 goes down</button></div>${stats(
        [
          ["violet", "Desired pods"],
          ["teal", "Running pods"],
          ["blue", "Orders served a minute"],
        ],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    stage.append(C1, C2, C3);
    const $ = (c, q) => c.querySelector(q);

    /* card 1 */
    let mode = "vm";
    const sl1 = N.slider("Services", 1, 6, 1, 4, (v) => `${v}`);
    $(C1, "[data-s]").append(sl1);
    const draw1 = () => {
      const n = sl1.value,
        u = usage(mode, n),
        fits = u.mem <= RAM;
      $(C1, "[data-f]").innerHTML = mode === "vm" ? vmStack(n, "os") : ctStack(n, "os");
      setStats(C1, [u.os, `${u.mem} GB`, fits ? "yes" : "no"]);
      $(C1, "[data-c]").innerHTML = fits
        ? `${n} service${n > 1 ? "s" : ""} in ${u.mem} GB: fits.`
        : `${u.mem} GB is more than the server's ${RAM} GB. Every VM brings its own guest OS.`;
      if (fits && n === 6 && api.done("fit"))
        api.say("All six services fit: containers share one kernel instead of six guest operating systems.", "happy");
      else if (!fits) api.say("Too heavy. Which part of the stack is repeated for every service?", "think");
    };
    seg($(C1, "[data-m]"), "vm:Virtual machines|ct:Containers", mode, (v) => ((mode = v), draw1()));
    sl1.onInput(draw1);

    /* card 2 */
    let order = "bad";
    const draw2 = (rows, msg) => {
      $(C2, "[data-f]").innerHTML = dfHtml(rows);
      $(C2, "[data-c]").innerHTML = msg;
    };
    const plain = () => S.DF[order].map((l) => ({ cmd: l[0], what: l[1] }));
    seg($(C2, "[data-o]"), "bad:Copy code first|good:Install libraries first", order, (v) => {
      order = v;
      setStats(C2, ["–"]);
      draw2(plain(), "Dockerfile order changed. Edit the code and build.");
    });
    $(C2, "[data-b]").onclick = () => {
      const rows = build(order, "code"),
        n = rows.filter((r) => r.redo).length;
      setStats(C2, [n]);
      draw2(
        rows,
        n > 1
          ? "Copying the code early breaks the cache for every layer after it, so the slow library install runs again."
          : "Only the code layer was rebuilt: the libraries came from the cache.",
      );
      if (n === 1 && api.done("cache"))
        api.say("Put what changes least at the top and your code last: the cache does the rest.", "love");
      else if (n > 1) api.say("The library install ran again just for a code edit. Try the other order.", "surprised");
    };

    /* card 3 */
    const k = { want: 2, up: [true, true, true], fresh: [] };
    let rush = false;
    const sl3 = N.slider("Replicas wanted", 1, 6, 1, k.want, (v) => `${v}`);
    $(C3, "[data-s]").append(sl3);
    const draw3 = (msg) => {
      $(C3, "[data-f]").innerHTML = clusterSvg(k);
      const served = Math.min(rush ? RUSH : 40, k.want * PER_POD);
      setStats(C3, [k.want, k.want, rush ? `${served} of ${RUSH}` : "quiet"]);
      $(C3, "[data-n]").textContent = k.up[1] ? "Node 2 goes down" : "Bring node 2 back";
      if (msg) $(C3, "[data-c]").innerHTML = msg;
    };
    sl3.onInput((v) => {
      k.fresh = v > k.want ? Array.from({ length: v - k.want }, (_, i) => k.want + i) : [];
      k.want = v;
      draw3(`The Deployment now wants <b>${v}</b> pods.`);
    });
    $(C3, "[data-r]").onclick = () => {
      rush = true;
      const ok = k.want * PER_POD >= RUSH;
      draw3(
        ok
          ? "Every order is served: the Service shares the rush across all the pods."
          : `Each pod serves ${PER_POD} orders a minute, so orders are queuing. Add replicas.`,
      );
      if (ok && api.done("rush")) api.say("Scaled out sideways: more pods behind one Service.", "happy");
      else if (!ok) api.say("Customers are waiting. Raise Replicas wanted.", "sleepy");
    };
    $(C3, "[data-n]").onclick = () => {
      const before = S.place(k.want, k.up)[1];
      k.up[1] = !k.up[1];
      k.fresh = k.up[1] ? [] : before;
      draw3(
        k.up[1]
          ? "Node 2 is back in the cluster."
          : `Node 2 went down. Its pods were rescheduled onto nodes 1 and 3: still <b>${k.want}</b> running.`,
      );
      if (!k.up[1] && k.want >= 3 && api.done("heal"))
        api.say("Self-healing: the control plane brought the cluster back to its desired state.", "determined");
      else if (!k.up[1]) api.say("Healed, but try it with at least 3 replicas wanted.", "think");
    };

    draw1();
    draw2(plain(), "Mo's first Dockerfile copies the code before installing the libraries.");
    draw3("Two pods of the shop service on a quiet morning.");
  }

  reg({
    id: "ds12-lab",
    order: 90,
    workshop: true,
    num: "12.W",
    title: "Workshop: ship Loafly",
    blurb: "No code. Fit the services on one server, make rebuilds fast, and keep the shop up through the lunch rush.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "Loafly is going live. Pack its services, build them quickly, and keep the shop answering when things get busy or break.",
        missions: [
          {
            id: "fit",
            t: "Fit six services",
            d: "In card 1 get all <b>6</b> services onto the 12 GB server so that <b>Fits?</b> says yes.",
            hint: "Look at <b>Operating systems</b> in each mode.",
          },
          {
            id: "cache",
            t: "Fast rebuilds",
            d: "In card 2 pick the Dockerfile order where a code edit rebuilds only <b>1</b> layer, and press the build button.",
            hint: "Layers below the first changed one are rebuilt. Where should the code go?",
          },
          {
            id: "rush",
            t: "Survive the lunch rush",
            d: "In card 3 set <b>Replicas wanted</b> high enough, then press <b>Start the lunch rush</b> so every order is served.",
            hint: "Each pod serves 20 orders a minute.",
          },
          {
            id: "heal",
            t: "Lose a node",
            d: "With at least <b>3</b> replicas wanted, press <b>Node 2 goes down</b> and check the pods keep running.",
            hint: "Watch where node 2's pods end up.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds12-lab-1",
          "In card 2, why did <b>Copy code first</b> make a tiny code edit rebuild the library install too?",
          [
            "Every layer after a changed layer is rebuilt",
            "Docker never caches the library install",
            "Code edits always rebuild the base image",
          ],
          "Layers are cached in order. Once one layer changes, every layer after it has to be rebuilt, so copying the code early drags the slow install along with it.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Containers share one kernel, so many more services fit on a machine than with a VM each.",
            "Order a Dockerfile from what changes least to what changes most: the <b>layer cache</b> keeps rebuilds fast.",
            "Kubernetes <b>scales</b> by adding pods behind a Service and <b>self-heals</b> by rescheduling pods when a node fails.",
          ],
          "Light boxes, smart layers, and a conductor that never sleeps.",
        ),
      );
    },
  });

  L["ds12-lab"] = {
    sum: "Ship Loafly: compare VMs and containers on one server, order a Dockerfile for the layer cache, and scale and heal a Kubernetes cluster.",
    steps: [
      st(
        "What you will practise",
        "<p>Three cards, four missions. First you squeeze Loafly's six services onto one server. Then you order Mo's Dockerfile so a code edit rebuilds quickly. Last, you run the shop on a small Kubernetes cluster through the lunch rush and a broken node.</p>",
        F.flow([
          { t: "Fit", s: "VMs or containers", c: "amber" },
          { t: "Build", s: "the layer cache", c: "teal" },
          { t: "Scale", s: "the lunch rush", c: "blue" },
          { t: "Heal", s: "a node goes down", c: "rose" },
        ]),
        mc(
          "Six services each in their own VM do not fit on the server. What is the main thing being repeated?",
          ["A guest operating system", "The server's own hardware", "The application code"],
          "Every VM runs its own guest OS. Containers share the host kernel, so that repetition disappears.",
        ),
      ),
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
