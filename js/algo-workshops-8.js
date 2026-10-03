/* Algorithms, Phase 8 workshop: "Poke a blockchain" (no code).
   A tiny chain with the lecture's toy hash (djb2) and leading-hex-zero proof of work. Every hash, nonce and count
   comes from really running the hash; nothing shown is typed in.
   Plain djb2 is used as in the lecture, then scrambled once more (murmur3's finaliser). Reason: djb2 only mixes its
   last characters into the LOW bits, so the leading hex digits barely change when the nonce changes and mining for
   leading zeros can take thousands of tries even at 1 zero. The scramble gives the honest 16x-per-zero difficulty. */
(function () {
  const N = NIC,
    { qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);

  const djb2 = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const fmix = (h) => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  };
  const hashOf = (b) =>
    fmix(parseInt(djb2(`${b.nonce}|${b.i}|${b.data}|${b.prev}`), 16))
      .toString(16)
      .padStart(8, "0");
  const zeros = (h) => {
    let k = 0;
    while (k < h.length && h[k] === "0") k++;
    return k;
  };
  const DATA = [
    ["genesis", "genesis"],
    ["alice pays bob 5", "alice pays mallory 50"],
    ["bob pays carol 2", "bob pays mallory 20"],
    ["carol pays dave 1", "carol pays mallory 10"],
  ];

  function tiles(h, target) {
    return h
      .split("")
      .map((c, i) => {
        const inZ = i < target;
        let cls = "";
        if (inZ) {
          const ok = h.slice(0, i + 1) === "0".repeat(i + 1);
          cls = ok ? "z" : h.slice(0, i) === "0".repeat(i) ? "x" : "m";
        }
        return `<i class="${cls}">${c}</i>`;
      })
      .join("");
  }

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

  N.register({
    id: "a8-chain",
    subject: "algo",
    lecture: 8,
    order: 90,
    num: "8.W",
    workshop: true,
    title: "Workshop: poke a blockchain",
    blurb: "Mine blocks by guessing nonces, tamper with history, then pay the price to repair it.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "Here is a tiny chain. <b>Mine</b> it, <b>break</b> it, then <b>repair</b> it, and feel why history is hard to rewrite.",
        missions: [
          {
            id: "seal",
            t: "Seal block 1 by guessing",
            d: "Select <b>block 1</b> and press <b>Try next nonce</b> (or <b>Try 10</b>) until the hash starts with a zero.",
            hint: "At difficulty 1, about 1 hash in 16 starts with 0. Use Try 10 to go faster; there is no cleverer way.",
          },
          {
            id: "chain",
            t: "Mine blocks 2 and 3",
            d: "Set difficulty to <b>2 zeros</b>, pick blocks 2 and 3 and press <b>Auto-mine</b>. Compare the tries with block 1.",
            hint: "Mine in order. Each new block copies the previous block's hash into its own prev.",
          },
          {
            id: "tamper",
            t: "Tamper with history",
            d: "Press <b>✎ edit</b> on block 1 and watch what happens further down the chain.",
            hint: "The edit only works as an attack if later blocks already exist, so finish mission 2 first.",
          },
          {
            id: "repair",
            t: "Repair the chain",
            d: "Keep the edited data, but make every block green again. Re-mine block 1, then 2, then 3.",
            hint: "<b>Re-link, no mining</b> only fixes the pointers and breaks the seals. Select each block in order and mine it again.",
          },
          {
            id: "audit",
            t: "Check the bill",
            d: "Press <b>Verify chain</b> and compare the cost of checking with the cost of the rewrite.",
          },
        ],
        build: chainWorkshop,
      });
      root.appendChild(
        predict({
          id: "a8-wk-1",
          q: "You need a hash that starts with <b>00</b> (two hex zeros). About how many nonces do you expect to try?",
          opts: ["About 16", "About 256", "About 4,096"],
          a: 1,
          why: "One hex zero is a 1-in-16 chance, two is 1 in 16 × 16 = 256, so about 256 tries on average. Each extra zero multiplies the work by 16.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-wk-2",
          q: "Someone edits the data in block 1 of a sealed three-block chain. To make the whole chain valid again, which blocks must be mined again?",
          opts: [
            "Just block 1, the one they changed",
            "Blocks 1, 2 and 3, each in turn",
            "None, if they fix the prev fields",
          ],
          a: 1,
          why: "Block 1's new hash changes block 2's prev, which changes block 2's hash, which changes block 3's prev. Every block from the edit onward needs fresh proof of work. Patching prev alone breaks the zeros.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A nonce is found by <b>guessing</b>: each try gives an unpredictable hash, and each extra zero means about 16× more tries.",
            "Edit an old block and its hash changes, so the next block's <code>prev</code> no longer matches: the break is <b>visible</b>.",
            "Repairing means re-mining every block from the edit onward. That <b>work</b>, not the hash alone, makes history costly to rewrite.",
          ],
          "Mining is expensive, checking takes one hash, and rewriting means redoing all the work after the edit.",
        ),
      );
    },
  });

  L["a8-chain"] = {
    sum: "Mine a tiny chain by guessing nonces, tamper with an old block and see the break, then pay the price of repairing it.",
    steps: [
      {
        t: "Sealing a block",
        b: `<p>To <b>seal</b> a block you change its <b>nonce</b> until the block's hash starts with enough zeros. Every nonce gives a new, unpredictable hash, so you just guess and check.</p>`,
        v: F.flow([
          { t: "Nonce 1", s: "hash starts 7…" },
          { t: "Nonce 2", s: "hash starts c…" },
          { t: "Nonce 3", s: "hash starts 0…", c: "teal" },
        ]),
        c: {
          q: "Why does sealing a block take so many tries?",
          o: [
            "Hashes look random, so you can only try nonces",
            "Each nonce must be approved by a peer first",
            "The nonce stays hidden until blocks pile up",
          ],
          a: 0,
          why: "A good hash gives no clue which nonce will work, so the only method is guess, hash, check. Checking a winner is a single hash.",
        },
      },
      {
        t: "Breaking and repairing",
        b: `<p>Each block stores the hash of the block before it in <code>prev</code>. Edit an old block and its hash changes, so the next block's <code>prev</code> no longer matches. To fix it you must <b>mine again</b>, block after block.</p>`,
        v: F.flow([
          { t: "Block 1", s: "data edited", c: "rose" },
          { t: "Block 2", s: "prev ≠ hash", c: "rose" },
          { t: "Block 3", s: "after the break", c: "rose" },
        ]),
        c: {
          q: "Block 1's data is edited. What shows up at block 2?",
          o: [
            "Its stored prev no longer matches block 1",
            "Its nonce is rewritten by the network",
            "Its data is edited to keep in step",
          ],
          a: 0,
          why: "Block 2 still remembers block 1's old hash in prev, while block 1 now hashes to something completely different. That mismatch is the visible break.",
        },
      },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();
