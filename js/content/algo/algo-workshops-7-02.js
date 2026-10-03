(function () {
  const partScope = (NIC.shared.algoWorkshops7 = NIC.shared.algoWorkshops7 || {});
  const { DY, ENTROPY, FIXED_LEN, MSG, SLOT, SYMS, TOTAL, VBH, VBW, X0, YB, fxOn, greedyCost, snd, wait } = partScope;
  const N = NIC,
    { el, qs, qsa } = N;

  /* ------------------------------------------------------------------ */
  function buildTree(stage, api, life) {
    let uid = 0,
      forest,
      cost,
      hist,
      sel,
      busy,
      wrongs,
      finished,
      enc;
    const fresh = () => {
      uid = 0;
      forest = SYMS.map((x) => ({ id: uid++, label: x.s, f: x.f, leaf: true, w: 1, sym: x }));
      cost = 0;
      hist = [];
      sel = null;
      busy = false;
      finished = false;
      enc = { i: 0, bits: [] };
    };
    const order = () => forest.slice().sort((a, b) => a.f - b.f || a.id - b.id);
    const kidsOrder = (x, y) => (x.f !== y.f ? (x.f > y.f ? [x, y] : [y, x]) : x.id < y.id ? [x, y] : [y, x]); // bit 0 goes to the larger child
    const snap = () => ({ forest: forest.slice(), cost, uid, finished });

    /* ---- DOM ---- */
    const top =
      el(`<div class="wk-card aw7-queue"><h3>The queue<span class="wk-sp"></span><span class="faint aw7-hint-l" style="text-transform:none;letter-spacing:0">46 hours of reports</span></h3>
      <div class="aw7-chips" data-chips role="group" aria-label="Queue of nodes, smallest first"></div>
      <div class="aw7-whatif" data-what hidden></div>
      <div class="wk-row aw7-ctl"><button class="btn small" data-hint>Hint</button><button class="btn small" data-undo>Undo</button><button class="btn ghost small" data-rs>Restart</button>
        <span class="wk-sp"></span><span class="aw7-note" data-note>Tap the <b>two smallest</b> nodes to merge them.</span></div></div>`);
    const tree =
      el(`<div class="wk-card aw7-treecard"><h3>The tree<span class="wk-sp"></span><span class="faint" style="text-transform:none;letter-spacing:0">left branch 0 goes to the larger child</span></h3>
      <div class="wk-stats" data-stats></div><div class="aw7-stagebox" data-svg></div></div>`);
    const result = el(`<div class="wk-card aw7-result" data-res hidden></div>`);
    const encCard = el(`<div class="wk-card aw7-enc" data-enc hidden></div>`);
    stage.append(top, tree, result, encCard);
    const chips = qs("[data-chips]", top),
      what = qs("[data-what]", top),
      note = qs("[data-note]", top),
      box = qs("[data-svg]", tree),
      stats = qs("[data-stats]", tree);
    const say = (h) => {
      note.innerHTML = h;
    };

    /* ---- layout ---- */
    const height = (nd) => (nd.leaf ? 0 : Math.max(height(nd.kids[0]), height(nd.kids[1])) + 1);
    function layout() {
      const abs = new Map();
      let x = X0;
      const cx = (nd, x0) =>
        nd.leaf ? x0 + SLOT / 2 : (cx(nd.kids[0], x0) + cx(nd.kids[1], x0 + nd.kids[0].w * SLOT)) / 2;
      const put = (nd, x0) => {
        abs.set(nd.id, { x: cx(nd, x0), y: YB - height(nd) * DY });
        if (!nd.leaf) {
          put(nd.kids[0], x0);
          put(nd.kids[1], x0 + nd.kids[0].w * SLOT);
        }
      };
      order().forEach((r) => {
        put(r, x);
        x += r.w * SLOT;
      });
      return abs;
    }
    function nodeSvg(nd, abs, pa, isRoot) {
      const a = abs.get(nd.id),
        rx = a.x - (pa ? pa.x : 0),
        ry = a.y - (pa ? pa.y : 0);
      let edges = "",
        kids = "";
      if (!nd.leaf) {
        nd.kids.forEach((k, i) => {
          const ka = abs.get(k.id),
            dx = ka.x - a.x,
            dy = ka.y - a.y,
            y2 = dy - (k.leaf ? 22 : 20);
          edges += `<g class="aw7-edge" data-e="${k.id}"><line x1="0" y1="18" x2="${dx}" y2="${y2}"/><g transform="translate(${dx * 0.42} ${18 + (y2 - 18) * 0.42})" class="aw7-bit b${i}"><circle r="10"/><text>${i}</text></g></g>`;
          kids += nodeSvg(k, abs, a, false);
        });
      }
      const self = nd.leaf
        ? `<g class="aw7-self aw7-leaf aw7-c-${nd.sym.c}"><rect class="lip" x="-29" y="-19" width="58" height="44" rx="12"/><rect x="-29" y="-22" width="58" height="44" rx="12"/><text class="aw7-l" y="-5">${nd.label}</text><text class="aw7-n" y="12">${nd.f}</text></g>`
        : `<g class="aw7-self aw7-inner"><circle class="lip" cy="3" r="20"/><circle r="20"/><text class="aw7-n" y="1">${nd.f}</text></g>`;
      return `<g class="aw7-nd${isRoot ? " aw7-root" : ""}" data-id="${nd.id}" transform="translate(${rx} ${ry})"${isRoot ? ` tabindex="0" role="button" aria-label="${nd.leaf ? nd.sym.name : "Merged node"} ${nd.f}"` : ""}>${edges}${self}${kids}</g>`;
    }
    let lastAbs = new Map();
    function drawTree(newNode) {
      const abs = layout();
      const html = `<svg class="aw7-svg" viewBox="0 0 ${VBW} ${VBH}" role="img" aria-label="Huffman tree being built">${order()
        .map((r) => nodeSvg(r, abs, null, true))
        .join("")}</svg>`;
      box.innerHTML = html;
      const svg = box.firstElementChild;
      qsa(".aw7-root", svg).forEach((g) => {
        g.classList.toggle("sel", sel !== null && +g.dataset.id === sel);
      });
      if (fxOn()) {
        const grp = (id) => qs(`.aw7-nd[data-id="${id}"]`, svg);
        const moves = newNode ? [...newNode.kids, ...order().filter((r) => r !== newNode)] : [];
        moves.forEach((nd) => {
          const o = lastAbs.get(nd.id),
            n = abs.get(nd.id),
            g = grp(nd.id);
          if (!o || !g || (o.x === n.x && o.y === n.y)) return;
          const parent = newNode && newNode.kids.includes(nd) ? abs.get(newNode.id) : null;
          const rx = n.x - (parent ? parent.x : 0),
            ry = n.y - (parent ? parent.y : 0);
          g.animate(
            [
              { transform: `translate(${rx + o.x - n.x}px, ${ry + o.y - n.y}px)` },
              { transform: `translate(${rx}px, ${ry}px)` },
            ],
            { duration: 420, easing: "cubic-bezier(.3,.9,.3,1)" },
          );
        });
        if (newNode) {
          const g = grp(newNode.id);
          qs(".aw7-self", g).animate(
            [
              { transform: "scale(.3)", opacity: 0 },
              { transform: "scale(1.12)", opacity: 1, offset: 0.7 },
              { transform: "scale(1)", opacity: 1 },
            ],
            { duration: 480, delay: 240, easing: "ease-out", fill: "backwards" },
          );
          qsa(":scope > .aw7-edge", g).forEach((e) =>
            e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 300, fill: "backwards" }),
          );
        }
      }
      lastAbs = abs;
    }

    function drawChips() {
      chips.innerHTML = order()
        .map(
          (nd) =>
            `<button class="aw7-chip${nd.leaf ? ` aw7-c-${nd.sym.c}` : " inner"}${sel === nd.id ? " sel" : ""}" data-id="${nd.id}" ${finished ? "disabled" : ""}><b>${nd.leaf ? nd.label : nd.label.length > 4 ? `${nd.label.length} symbols` : nd.label.split("").sort().join("")}</b><i>${nd.f}</i></button>`,
        )
        .join("");
      qsa(".aw7-chip", chips).forEach((c) => (c.onclick = () => pick(+c.dataset.id)));
    }
    function drawStats() {
      const merges = SYMS.length - forest.length;
      stats.innerHTML =
        N.wk.stat("Merges", `${merges} of ${SYMS.length - 1}`, "blue") +
        N.wk.stat("Bits so far", cost, "amber") +
        N.wk.stat("Wrong tries", wrongs, wrongs ? "rose" : "");
      qs("[data-undo]", top).disabled = !hist.length || busy;
      qs("[data-hint]", top).disabled = finished || busy;
    }
    function draw(newNode) {
      drawChips();
      drawTree(newNode);
      drawStats();
    }

    /* ---- moves ---- */
    function pick(id) {
      if (busy || finished) return;
      what.hidden = true;
      if (sel === null) {
        sel = id;
        snd("select");
        draw();
        say(`<b>${forest.find((n) => n.id === id).label}</b> picked. Now tap the node to merge it with.`);
        return;
      }
      if (sel === id) {
        sel = null;
        draw();
        say("Unpicked. Tap the <b>two smallest</b> nodes.");
        return;
      }
      const a = forest.find((n) => n.id === sel),
        b = forest.find((n) => n.id === id);
      sel = null;
      const q = order(),
        s1 = q[0].f,
        s2 = q[1].f,
        ok = Math.min(a.f, b.f) === s1 && Math.max(a.f, b.f) === s2;
      if (ok) return merge(a, b);
      wrong(a, b, q);
    }

    async function merge(a, b) {
      busy = true;
      hist.push(snap());
      const [k0, k1] = kidsOrder(a, b),
        nd = { id: uid++, label: k0.label + k1.label, f: a.f + b.f, leaf: false, kids: [k0, k1], w: k0.w + k1.w };
      forest = forest.filter((n) => n !== a && n !== b);
      forest.push(nd);
      cost += nd.f;
      snd("pop");
      draw(nd);
      if (fxOn()) {
        const s = qs(".wk-stat.amber b", stats);
        if (s) N.fx.bump(s, { scale: 1.3 });
        N.fx.floatText(qs(".wk-stat.amber", stats), `+${nd.f}`, "#ff9600");
      }
      say(
        `<b>${a.label} ${a.f}</b> + <b>${b.label} ${b.f}</b> = <b>${nd.f}</b>. That merge costs <b>${nd.f} bits</b>: every report beneath it gets one bit longer.`,
      );
      api.done("first");
      await wait(520);
      busy = false;
      if (forest.length === 1) return complete();
      api.say(
        forest.length > 3
          ? "Good. The new node joins the queue and competes on its total."
          : "Nearly there. Keep taking the two smallest.",
        "happy",
      );
      drawStats();
    }

    function wrong(a, b, q) {
      wrongs++;
      snd("wrong");
      const rest = forest.filter((n) => n !== a && n !== b).map((n) => n.f),
        sum = a.f + b.f;
      const yours = cost + sum + greedyCost(rest.concat(sum)),
        best = cost + greedyCost(forest.map((n) => n.f));
      api.say(
        `Not those two. <b>${q[0].label} (${q[0].f})</b> and <b>${q[1].label} (${q[1].f})</b> are the smallest.`,
        "sad",
      );
      drawChips();
      drawStats();
      qsa(".aw7-chip", chips).forEach((c) => {
        if (+c.dataset.id === a.id || +c.dataset.id === b.id) {
          c.classList.add("bad");
          fxOn() && N.fx.shake(c);
          setTimeout(() => c.classList.remove("bad"), 700);
        }
      });
      const extra = yours - best;
      const maxv = Math.max(yours, best);
      what.hidden = false;
      what.innerHTML = `<b class="aw7-wh">What if you merged ${a.label} + ${b.label}?</b>
        <div class="aw7-wrow"><span>Your pair, then smallest-first</span><div class="aw7-wbar"><i class="bad" style="--v:${yours / maxv}"></i></div><output>${yours}</output></div>
        <div class="aw7-wrow"><span>Smallest two, then smallest-first</span><div class="aw7-wbar"><i style="--v:${best / maxv}"></i></div><output>${best}</output></div>
        <p>${extra > 0 ? `That path ends <b>${extra} bit${extra > 1 ? "s" : ""} worse</b> (${Math.round((extra / best) * 100)}% bigger).` : `Here it happens to tie, but only smallest-first is <i>guaranteed</i> best.`} Merging ${a.f} and ${b.f} costs ${sum} bits <i>now</i>, and the big node then sits in every later merge. The two rarest symbols should pay for the deepest spot.</p>`;
      if (fxOn()) {
        qsa(".aw7-wbar i", what).forEach((i) =>
          i.animate([{ transform: "scaleX(0)" }, { transform: `scaleX(${i.style.getPropertyValue("--v")})` }], {
            duration: 420,
            easing: "cubic-bezier(.3,.9,.3,1)",
          }),
        );
      }
      say(`Nothing changed. Try again with <b>${q[0].label}</b> and <b>${q[1].label}</b>.`);
      api.done("mistake");
    }

    const codesOf = (root) => {
      const m = {};
      const go = (n, p) => {
        if (n.leaf) m[n.label] = p;
        else {
          go(n.kids[0], p + "0");
          go(n.kids[1], p + "1");
        }
      };
      go(root, "");
      return m;
    };
    let codes = {};

    function complete() {
      finished = true;
      codes = codesOf(forest[0]);
      draw();
      snd("complete");
      api.done("tree");
      const tot = SYMS.reduce((s, x) => s + x.f * codes[x.s].length, 0);
      api.say(
        `Tree done! The whole day's reports need <b>${tot} bits</b>, against ${TOTAL * FIXED_LEN} with fixed ${FIXED_LEN}-bit codes.${wrongs === 0 ? ` Want to see what a mistake costs? Press <b>Restart</b> and merge a pair that isn't the smallest.` : ""}`,
        "love",
      );
      say("Tree complete. Read the codes, then send a forecast below.");
      renderResult(tot);
      renderEnc();
    }

    function renderResult(tot) {
      const fixed = TOTAL * FIXED_LEN,
        floor = ENTROPY * TOTAL,
        max = fixed;
      result.hidden = false;
      result.innerHTML = `<h3>The codes you built</h3>
        <div class="aw7-restbl">${SYMS.map(
          (x) =>
            `<div class="aw7-rrow aw7-c-${x.c}"><span class="aw7-rs">${x.s}</span><span class="aw7-rn">${x.name} <small>× ${x.f}</small></span><span class="aw7-rc">${codes[
              x.s
            ]
              .split("")
              .map((b) => `<i class="b${b}">${b}</i>`)
              .join(
                "",
              )}</span><span class="aw7-rb">${x.f} × ${codes[x.s].length} = <b>${x.f * codes[x.s].length}</b></span></div>`,
        ).join("")}</div>
        <div class="aw7-cmp">
          <div class="aw7-crow"><span>Fixed ${FIXED_LEN} bits each</span><div class="aw7-cbar"><i class="dim" style="--v:${fixed / max}"></i></div><output>${fixed}</output></div>
          <div class="aw7-crow"><span>Your Huffman tree</span><div class="aw7-cbar"><i class="teal" style="--v:${tot / max}"></i></div><output>${tot}</output></div>
          <div class="aw7-crow"><span>Entropy floor</span><div class="aw7-cbar"><i class="violet" style="--v:${floor / max}"></i></div><output>${floor.toFixed(1)}</output></div>
        </div>
        <p class="aw7-cap">Average <b>${(tot / TOTAL).toFixed(2)}</b> bits per report, against ${FIXED_LEN} fixed and an entropy floor of <b>${ENTROPY.toFixed(2)}</b>. Huffman saves <b>${Math.round((1 - tot / fixed) * 100)}%</b> and never goes below the floor, because codeword lengths are whole bits.</p>`;
      if (fxOn()) {
        qsa(".aw7-cbar i", result).forEach((i, k) =>
          i.animate([{ transform: "scaleX(0)" }, { transform: `scaleX(${i.style.getPropertyValue("--v")})` }], {
            duration: 520,
            delay: 120 + k * 120,
            easing: "cubic-bezier(.3,.9,.3,1)",
            fill: "backwards",
          }),
        );
        qsa(".aw7-rrow", result).forEach((r, k) =>
          r.animate(
            [
              { opacity: 0, transform: "translateY(6px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 240, delay: k * 50, fill: "backwards" },
          ),
        );
      }
    }

    /* ---- encode a forecast with the tree you built ---- */
    function renderEnc() {
      encCard.hidden = false;
      encCard.innerHTML = `<h3>Send a forecast<span class="wk-sp"></span><span class="faint" style="text-transform:none;letter-spacing:0" data-ec></span></h3>
        <div class="aw7-msg" data-msg>${MSG.map((s, i) => `<span class="aw7-tok aw7-c-${SYMS.find((x) => x.s === s).c}${i === 0 ? " now" : ""}" data-i="${i}">${s}</span>`).join("")}</div>
        <div class="aw7-keys" data-keys>${SYMS.map((x) => `<button class="aw7-key aw7-c-${x.c}" data-s="${x.s}"><b>${x.s}</b><small>${x.name}</small></button>`).join("")}</div>
        <div class="aw7-bits" data-bits aria-live="polite"><span class="aw7-ph">Tap the symbols in order. The path you take down the tree is the code.</span></div>
        <p class="aw7-cap" data-ecap></p>`;
      enc = { i: 0, bits: [] };
      qsa("[data-s]", encCard).forEach((k) => (k.onclick = () => encTap(k.dataset.s)));
      updEnc();
      if (fxOn()) N.fx.enter(encCard, { y: 10, x: 0 });
    }
    function updEnc() {
      qs("[data-ec]", encCard).textContent = `${enc.bits.length} bits sent · fixed would use ${enc.i * FIXED_LEN}`;
      qsa(".aw7-tok", encCard).forEach((t, i) => {
        t.classList.toggle("done", i < enc.i);
        t.classList.toggle("now", i === enc.i);
      });
    }
    function hotPath(sym) {
      const svg = box.firstElementChild;
      if (!svg) return;
      qsa(".aw7-edge.hot", svg).forEach((e) => e.classList.remove("hot"));
      qsa(".aw7-leaf.hot", svg).forEach((e) => e.classList.remove("hot"));
      const root = forest[0];
      const path = [];
      let found = false;
      const go = (n) => {
        if (n.leaf) {
          found = n.label === sym;
          return found;
        }
        for (const k of n.kids) {
          path.push(k.id);
          if (go(k)) return true;
          path.pop();
        }
        return false;
      };
      go(root);
      path.forEach((id) => {
        const e = qs(`.aw7-edge[data-e="${id}"]`, svg);
        e && e.classList.add("hot");
      });
      const leaf = qs(`.aw7-nd[data-id="${path[path.length - 1]}"] > .aw7-self`, svg);
      leaf && leaf.classList.add("hot");
    }
    function encTap(s) {
      if (!finished || enc.i >= MSG.length) return;
      const want = MSG[enc.i];
      if (s !== want) {
        snd("wrong");
        const k = qs(`[data-s="${s}"]`, encCard);
        fxOn() && k && N.fx.shake(k);
        api.say(
          `The next report in the forecast is <b>${want}</b> (${SYMS.find((x) => x.s === want).name}), not ${s}.`,
          "think",
        );
        return;
      }
      const code = codes[s];
      if (enc.bits.length === 0) qs("[data-bits]", encCard).innerHTML = "";
      const host = qs("[data-bits]", encCard),
        grp = el(`<span class="aw7-cg aw7-c-${SYMS.find((x) => x.s === s).c}"></span>`);
      code.split("").forEach((b) => grp.appendChild(el(`<i class="b${b}">${b}</i>`)));
      host.appendChild(grp);
      enc.bits.push(...code.split(""));
      enc.i++;
      snd("tap");
      hotPath(s);
      updEnc();
      if (fxOn())
        qsa("i", grp).forEach((b, k) =>
          b.animate(
            [
              { transform: "translateY(-14px) scale(.6)", opacity: 0 },
              { transform: "none", opacity: 1 },
            ],
            { duration: 260, delay: k * 90, fill: "backwards", easing: "cubic-bezier(.3,1.4,.5,1)" },
          ),
        );
      if (enc.i === MSG.length) {
        const fixed = MSG.length * FIXED_LEN;
        qs("[data-ecap]", encCard).innerHTML =
          `Sent <b>${enc.bits.length}</b> bits (<span class="mono">${enc.bits.join("")}</span>) instead of ${fixed}. With no gaps between codewords, the receiver walks the tree from the root and every leaf it hits ends one symbol. That only works because no code is the start of another.`;
        api.done("encode");
      } else
        api.say(
          `${s} is <b>${code}</b>: ${code.length} bit${code.length > 1 ? "s" : ""}. ${code.length <= 2 ? "A common symbol sits near the root." : "A rare symbol sits deep."}`,
          "happy",
        );
    }

    /* ---- controls ---- */
    qs("[data-hint]", top).onclick = () => {
      if (busy || finished) return;
      const q = order();
      qsa(".aw7-chip", chips).forEach((c) => {
        if (+c.dataset.id === q[0].id || +c.dataset.id === q[1].id) {
          c.classList.add("hint");
          setTimeout(() => c.classList.remove("hint"), 1800);
        }
      });
      say(
        `Hint: the queue is sorted. The two on the left, <b>${q[0].label} (${q[0].f})</b> and <b>${q[1].label} (${q[1].f})</b>, are the smallest.`,
      );
    };
    qs("[data-undo]", top).onclick = () => {
      if (busy || !hist.length) return;
      const h = hist.pop();
      forest = h.forest;
      cost = h.cost;
      uid = h.uid;
      finished = false;
      sel = null;
      what.hidden = true;
      result.hidden = true;
      encCard.hidden = true;
      lastAbs = layout();
      draw();
      say("Undone. Try that merge again.");
      snd("back");
    };
    qs("[data-rs]", top).onclick = () => {
      if (busy) return;
      fresh();
      wrongs = 0;
      result.hidden = true;
      encCard.hidden = true;
      what.hidden = true;
      lastAbs = new Map();
      draw();
      say("Fresh queue. Tap the <b>two smallest</b> nodes.");
      api.say("Fresh start. Smallest two first.", "idle");
    };
    box.addEventListener("click", (e) => {
      const g = e.target.closest && e.target.closest(".aw7-root");
      if (g) pick(+g.dataset.id);
    });
    box.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const g = e.target.closest && e.target.closest(".aw7-root");
      if (g) {
        e.preventDefault();
        pick(+g.dataset.id);
      }
    });

    wrongs = 0;
    fresh();
    lastAbs = layout();
    draw();
  }
  Object.assign(partScope, { buildTree });
})();
