(function () {
  const partScope = (NIC.shared.algoWorkshops8 = NIC.shared.algoWorkshops8 || {});
  const { DATA, fxOn, hashOf, snd, tiles, zeros } = partScope;
  const N = NIC,
    { qs, qsa } = N;

  function chainWorkshop(stage, api, life) {
    let blocks,
      sel = 1,
      diff = 1,
      auto = null,
      repairTries = 0,
      edited = false,
      lastBad = new Set(),
      prevDesk = "",
      tried = 0;
    function fresh() {
      blocks = DATA.map(([o, a], i) => ({
        i,
        orig: o,
        alt: a,
        data: o,
        nonce: 0,
        prev: "00000000",
        mined: false,
        need: 0,
        tries: 0,
      }));
      const g = blocks[0];
      while (zeros(hashOf(g)) < 2) g.nonce++;
      g.mined = true;
      g.need = 2;
      edited = false;
      repairTries = 0;
      sel = 1;
      tried = 0;
      lastBad = new Set();
    }
    fresh();
    const sync = () => {
      for (let i = 1; i < blocks.length; i++) if (!blocks[i].mined) blocks[i].prev = hashOf(blocks[i - 1]);
    };
    const linkOk = (i) => i === 0 || blocks[i].prev === hashOf(blocks[i - 1]);
    const sealOk = (b) => b.mined && zeros(hashOf(b)) >= b.need;
    const valid = (i) => sealOk(blocks[i]) && linkOk(i);
    /** Index of the first mined block that fails a check (the chain is only as good as its first break). */
    const firstBad = () => {
      for (let i = 1; i < blocks.length; i++) {
        if (!blocks[i].mined) return null;
        if (!valid(i)) return i;
      }
      return null;
    };

    stage.innerHTML = `<div class="wk-card"><h3>The chain<span class="wk-sp"></span><span class="wk-badge" data-cs>Tap a block to work on it</span></h3>
      <div class="aw8-chain" data-chain></div>
      <div class="aw8-leg"><span><i class="lg ok"></i>sealed and linked</span><span><i class="lg bad"></i>broken</span><span><i class="lg tnt"></i>after a break</span><span><i class="lg"></i>not mined yet</span></div></div>
    <div class="wk-card"><h3>Mining desk<span class="wk-sp"></span><span class="wk-badge" data-sel></span></h3>
      <div class="aw8-desk">
        <div class="aw8-live">
          <div class="aw8-nonce"><small>nonce</small><b data-nn>0</b></div>
          <div class="aw8-tiles" data-tiles></div>
          <div class="aw8-goal" data-goal></div>
        </div>
        <div class="aw8-ctl">
          <div class="aw8-dl"><small>Difficulty: leading zeros needed</small><div data-diff></div></div>
          <div class="wk-row"><button class="btn primary" data-try>Try next nonce</button><button class="btn" data-ten>Try 10</button><button class="btn" data-auto>Auto-mine</button></div>
          <div class="wk-stats"><div class="wk-stat"><small>Tries, this block</small><b data-tt>0</b></div><div class="wk-stat rose"><small>Tries since the edit</small><b data-rt>0</b></div><div class="wk-stat teal"><small>Hashes to verify</small><b data-vt>4</b></div></div>
        </div>
      </div></div>
    <div class="wk-card"><h3>Your move</h3><div class="wk-row"><button class="btn" data-ver>Verify chain</button><button class="btn" data-rel disabled>Re-link, no mining</button><button class="btn ghost small" data-rs>Start again</button></div>
      <div class="wk-note" data-note style="margin-top:10px">Mine block 1 first: press <b>Try next nonce</b> and watch the hash change each time.</div></div>`;
    const chain = qs("[data-chain]", stage),
      note = qs("[data-note]", stage),
      tl = qs("[data-tiles]", stage);
    const say = (h) => {
      note.innerHTML = h;
    };

    // cards and links, built once and patched by paint()
    chain.innerHTML = blocks
      .map(
        (
          b,
          i,
        ) => `${i ? `<div class="aw8-ln" data-l="${i}"><span class="aw8-la">→</span><span class="aw8-lt"></span></div>` : ""}
      <div class="aw8-blk" data-i="${i}" ${i ? `tabindex="0" role="button" aria-label="Block ${i}"` : ""}>
        <div class="aw8-bh"><b>${i ? "Block " + i : "Genesis"}</b><span class="aw8-st"></span></div>
        <div class="aw8-row"><small>data</small><span class="aw8-d"></span>${i ? `<button class="aw8-ed" data-ed="${i}" title="Edit or restore this block's data"></button>` : ""}</div>
        <div class="aw8-row"><small>nonce</small><span class="aw8-n"></span></div>
        <div class="aw8-row"><small>prev</small><span class="aw8-hx aw8-pv"></span></div>
        <div class="aw8-row"><small>hash</small><span class="aw8-hx aw8-hs"></span></div></div>`,
      )
      .join("");
    qs("[data-diff]", stage).appendChild(
      N.seg(
        [
          [1, "1 zero"],
          [2, "2 zeros"],
          [3, "3 zeros"],
        ],
        String(diff),
        (v) => {
          diff = +v;
          paint();
          if (!auto)
            say(
              `Difficulty ${diff}: a hash wins only if it starts with <b>${"0".repeat(diff)}</b>. On average that takes about <b>${Math.pow(16, diff).toLocaleString()}</b> tries.`,
            );
        },
      ),
    );

    function paint() {
      sync();
      const fb = firstBad(),
        bad = new Set();
      blocks.forEach((b, i) => {
        const card = qs(`.aw8-blk[data-i="${i}"]`, chain),
          h = hashOf(b),
          target = b.mined ? b.need : diff;
        let state = "open";
        if (b.mined)
          state = fb !== null && i === fb ? "bad" : fb !== null && i > fb ? "tnt" : i === 0 || valid(i) ? "ok" : "bad";
        if (i > 0 && b.mined && !valid(i) && state !== "bad") state = "bad";
        if (state === "bad" || state === "tnt") bad.add(i);
        card.className = `aw8-blk ${state}${i === sel ? " sel" : ""}${i === 0 ? " gen" : ""}`;
        qs(".aw8-st", card).textContent = {
          ok: "✓ sealed",
          bad: !b.mined ? "" : !sealOk(b) ? "✗ seal broken" : "✗ bad link",
          tnt: "after a break",
          open: "not mined",
        }[state];
        const dEl = qs(".aw8-d", card);
        dEl.textContent = b.data;
        dEl.classList.toggle("tamp", b.data !== b.orig);
        qs(".aw8-n", card).textContent = b.nonce;
        const pv = qs(".aw8-pv", card);
        pv.textContent = b.prev;
        pv.className = `aw8-hx aw8-pv${i && b.mined && !linkOk(i) ? " stale" : ""}`;
        qs(".aw8-hs", card).innerHTML = tiles(h, target);
        const ed = qs(".aw8-ed", card);
        if (ed) {
          ed.textContent = b.data === b.orig ? "✎ edit" : "↶ restore";
          ed.classList.toggle("on", b.data !== b.orig);
          ed.disabled = !!auto;
        }
        if (i) {
          const ln = qs(`.aw8-ln[data-l="${i}"]`, chain),
            ok = !b.mined || linkOk(i);
          ln.className = `aw8-ln ${!b.mined ? "open" : ok ? "ok" : "bad"}`;
          qs(".aw8-la", ln).textContent = !b.mined ? "→" : ok ? "→" : "✗";
          qs(".aw8-lt", ln).textContent = !b.mined ? "link follows" : ok ? "link ✓" : "prev ≠ hash";
        }
      });
      // a fresh break ripples down the chain
      if (fxOn())
        [...bad]
          .filter((i) => !lastBad.has(i))
          .sort()
          .forEach((i, k) => {
            const c = qs(`.aw8-blk[data-i="${i}"]`, chain);
            c.style.setProperty("--d", k * 130 + "ms");
            N.wk.flash(c, "aw8-alarm");
          });
      lastBad = bad;
      // desk
      const b = blocks[sel],
        h = hashOf(b),
        target = b.mined ? b.need : diff;
      qs("[data-sel]", stage).textContent = `Block ${sel}`;
      qs("[data-nn]", stage).textContent = b.nonce;
      tl.innerHTML = tiles(h, target);
      if (prevDesk && fxOn() && prevDesk !== h)
        qsa("i", tl).forEach((t, k) => {
          if (prevDesk[k] !== h[k]) N.wk.flash(t, "aw8-chg");
        });
      prevDesk = h;
      const k = zeros(h);
      qs("[data-goal]", stage).innerHTML =
        b.mined && sealOk(b)
          ? `<b class="ok">Sealed: ${k} leading zero${k === 1 ? "" : "s"}, needed ${b.need}.</b>`
          : `Needs <b>${"0".repeat(target)}</b> at the start. This hash has <b>${k}</b>.`;
      qs("[data-tt]", stage).textContent = b.tries.toLocaleString();
      qs("[data-rt]", stage).textContent = edited ? repairTries.toLocaleString() : "-";
      qs("[data-vt]", stage).textContent = blocks.filter((x) => x.mined).length;
      qs("[data-try]", stage).disabled = qs("[data-ten]", stage).disabled = !!auto;
      qs("[data-auto]", stage).textContent = auto ? "Stop" : "Auto-mine";
      qs("[data-rel]", stage).disabled = !edited || !!auto;
      qs("[data-cs]", stage).textContent =
        fb !== null
          ? `Broken at block ${fb}`
          : blocks.slice(1).every((x) => x.mined)
            ? "Chain sealed"
            : `${blocks.slice(1).filter((x) => x.mined).length} of 3 mined`;
      qs("[data-cs]", stage).className = `wk-badge${fb !== null ? " slow" : ""}`;
      missions();
    }

    function missions() {
      const fb = firstBad(),
        mined = blocks.slice(1).every((x) => x.mined),
        allOk = mined && fb === null;
      if (blocks[1].mined && sealOk(blocks[1]) && valid(1)) api.done("seal");
      if (!edited && allOk && blocks[2].need >= 2 && blocks[3].need >= 2) api.done("chain");
      if (edited && fb !== null && blocks.some((b, i) => i > fb && b.mined)) api.done("tamper");
      if (edited && allOk) api.done("repair");
    }

    /** One guess: bump the nonce, re-hash, and report whether the hash now meets the target. */
    function attempt(b) {
      sync();
      if (b.mined) {
        b.mined = false;
        b.tries = 0;
        b.nonce = 0;
      }
      b.nonce++;
      b.tries++;
      tried++;
      if (edited) repairTries++;
      sync();
      if (zeros(hashOf(b)) >= diff) {
        b.mined = true;
        b.need = diff;
        return true;
      }
      return false;
    }
    function sealed(b) {
      snd("correct");
      const first = b.i === 1 && !edited;
      say(
        `<b>Sealed!</b> Nonce <b>${b.nonce}</b> makes the hash <code>${hashOf(b)}</code>. It took <b>${b.tries.toLocaleString()}</b> tries. Anyone can check it with <b>one</b> hash.`,
      );
      api.say(
        first
          ? `Found it after ${b.tries} tries. There was no shortcut, only guessing. Checking costs one hash.`
          : `Block ${b.i} sealed in ${b.tries.toLocaleString()} tries${b.tries > Math.pow(16, diff) * 2 ? ": unlucky, but that's proof of work" : ""}.`,
        "happy",
      );
      if (fxOn()) N.wk.flash(qs(`.aw8-blk[data-i="${b.i}"]`, chain), "aw8-seal");
    }
    function tryOne(n) {
      const b = blocks[sel];
      let hit = false;
      for (let k = 0; k < n && !hit; k++) hit = attempt(b);
      paint();
      if (hit) return sealed(b);
      const h = hashOf(b),
        z = zeros(h);
      snd("tick");
      if (n > 1)
        return say(
          `Tried ${n} more nonces. The best you can hope for is a hash starting <b>${"0".repeat(diff)}</b>; the latest has <b>${z}</b> zero${z === 1 ? "" : "s"}. Keep going.`,
        );
      say(
        `Nonce <b>${b.nonce}</b> gives <code>${h}</code>: <b>${z}</b> leading zero${z === 1 ? "" : "s"}, need <b>${diff}</b>. ${z === diff - 1 && diff > 1 ? "So close, but close counts for nothing." : "Change the nonce by 1 and the whole hash changes. You can't steer it."}`,
      );
      if (tried === 1)
        api.say(
          "Each nonce gives a brand-new, unpredictable hash. Keep trying until it starts with enough zeros.",
          "think",
        );
    }
    function toggleAuto() {
      if (auto) {
        auto();
        auto = null;
        paint();
        say("Stopped. Your nonce search is still where you left it.");
        return;
      }
      const b = blocks[sel];
      if (!fxOn()) {
        let hit = false,
          n = 0;
        while (!hit && n < 400000) {
          hit = attempt(b);
          n++;
        }
        paint();
        return hit ? sealed(b) : say("Gave up after 400,000 tries.");
      }
      const batch = [0, 30, 45, 220][diff];
      auto = life.interval(() => {
        let hit = false;
        for (let k = 0; k < batch && !hit; k++) hit = attempt(b);
        if (hit) {
          auto();
          auto = null;
          paint();
          sealed(b);
          return;
        }
        paint();
      }, 33);
      say(`Mining block ${sel} for <b>${"0".repeat(diff)}</b>… watch the tiles flicker. Every flicker is one hash.`);
      api.say("Computers mine by guessing at speed. There is no other way.", "determined");
      paint();
    }
    qs("[data-try]", stage).onclick = () => tryOne(1);
    qs("[data-ten]", stage).onclick = () => tryOne(10);
    qs("[data-auto]", stage).onclick = toggleAuto;

    qsa(".aw8-blk", chain).forEach((c) => {
      const i = +c.dataset.i;
      const choose = (e) => {
        if (e.target.closest(".aw8-ed") || i === 0 || auto) return;
        sel = i;
        prevDesk = "";
        paint();
        say(`Working on <b>block ${i}</b>. Its <code>prev</code> is copied from block ${i - 1}'s current hash.`);
      };
      c.onclick = choose;
      c.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          choose(e);
        }
      };
    });
    qsa(".aw8-ed", chain).forEach(
      (btn) =>
        (btn.onclick = () => {
          const i = +btn.dataset.ed,
            b = blocks[i],
            oldH = hashOf(b);
          b.data = b.data === b.orig ? b.alt : b.orig;
          const was2 = edited;
          edited = blocks.some((x) => x.data !== x.orig);
          if (edited && !was2) repairTries = 0;
          if (!edited) repairTries = 0;
          paint();
          snd(b.data === b.orig ? "back" : "wrong");
          if (b.data === b.orig)
            return say(
              `Restored the original data. The hash is <code>${hashOf(b)}</code> again, so the link lines up. Undoing an edit is easy; <b>keeping</b> a lie is the hard part.`,
            );
          if (!b.mined)
            return say(
              `Edited block ${i}, but it isn't mined yet, so nothing has been built on it. Edit a block that <b>later blocks already point at</b>.`,
            );
          const fb = firstBad(),
            after = blocks.filter((x, k) => k > i && x.mined).length;
          say(
            `You changed block ${i}'s data. One letter flipped its hash from <code>${oldH}</code> to <code>${hashOf(b)}</code>. ${after ? `Block ${i + 1} still stores the <b>old</b> hash in <code>prev</code>, so the link snaps, and everything after it can't be trusted.` : "Its seal is broken, because the new hash no longer starts with enough zeros."}`,
          );
          api.say(
            after && fb !== null
              ? "See the red? One tiny edit, and the chain shows exactly where it broke."
              : "The seal broke: the hash changed, so the zeros are gone.",
            "surprised",
          );
        }),
    );

    qs("[data-rel]", stage).onclick = () => {
      for (let i = 1; i < blocks.length; i++) if (blocks[i].mined) blocks[i].prev = hashOf(blocks[i - 1]);
      paint();
      snd("whoosh");
      const n = blocks.filter((b, i) => i > 0 && b.mined && !sealOk(b)).length;
      say(
        `Every <code>prev</code> now matches, so the links are green. But changing <code>prev</code> changed each block's own hash, so <b>${n} seal${n === 1 ? " is" : "s are"} broken</b>. Patching the links isn't enough: you still owe the <b>work</b>.`,
      );
      api.say("Fixing the pointers is free, but the zeros aren't. You'll have to mine again.", "think");
    };

    let verifying = false;
    qs("[data-ver]", stage).onclick = async () => {
      if (verifying || auto) return;
      verifying = true;
      const n = blocks.length;
      let bad = null;
      for (let i = 0; i < n; i++) {
        const c = qs(`.aw8-blk[data-i="${i}"]`, chain);
        if (blocks[i].mined === false) break;
        c.classList.add("scan");
        snd("tick");
        if (fxOn()) await new Promise((r) => setTimeout(r, 260));
        c.classList.remove("scan");
        if (i > 0 && !valid(i)) {
          bad = i;
          break;
        }
      }
      verifying = false;
      const checked = blocks.filter((b, i) => b.mined && (bad === null || i <= bad)).length;
      if (bad !== null) {
        snd("wrong");
        say(
          `Verification stops at <b>block ${bad}</b>: ${!linkOk(bad) ? "its <code>prev</code> doesn't match the hash before it" : "its hash doesn't start with enough zeros"}. That took just <b>${checked}</b> hash${checked === 1 ? "" : "es"}.`,
        );
        return api.say("Checking is quick: you can see the break straight away.", "think");
      }
      snd("complete");
      if (edited && repairTries > 0) {
        say(
          `Valid! Checking took <b>${checked} hashes</b>. The repair cost <b>${repairTries.toLocaleString()}</b> tries. That gap is the point: <b>rewriting is expensive, checking is cheap</b>.`,
        );
        api.say(
          `${repairTries.toLocaleString()} tries to rewrite, ${checked} to check. That's what proof of work prices.`,
          "love",
        );
        api.done("audit");
      } else
        say(
          `Valid. Checking took <b>${checked}</b> hashes: one per block. ${edited ? "" : "Now try editing a block, then come back."}`,
        );
    };

    qs("[data-rs]", stage).onclick = () => {
      if (auto) {
        auto();
        auto = null;
      }
      fresh();
      prevDesk = "";
      paint();
      say("Fresh chain. Mine block 1 to begin.");
      snd("back");
    };
    paint();
  }
  Object.assign(partScope, { chainWorkshop });
})();
