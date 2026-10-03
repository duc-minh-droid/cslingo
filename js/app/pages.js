(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, SUBJ_ORDER, main } = app;
  const { qs, qsa, el, esc, store } = NIC;
  const fx = NIC.fx,
    game = NIC.game;

  // =====================================================================
  //  Practice + Profile pages
  // =====================================================================
  function practicePage() {
    NIC.revisePage(main, app.life, {
      names: Object.fromEntries(SUBJ_ORDER.map((k) => [k, SUBJECTS[k].name])),
      calm: app.calm,
    });
  }

  function profilePage() {
    const st = game.stats(),
      ach = game.achState(),
      un = game.unlockedAcc();
    const who = ["sprout", "pebble", "byte", "blaze", "chip", "berry"];
    // every character wears something different from the unlocked wardrobe (one item per slot)
    const acc = (k) => {
      const out = [],
        slots = new Set();
      for (let j = 0; j < un.length && out.length < 2; j++) {
        const a = un[(k * 2 + j) % un.length],
          sl = NIC.cast.ACC[a] && NIC.cast.ACC[a].slot;
        if (sl && !slots.has(sl)) {
          slots.add(sl);
          out.push(a);
        }
      }
      return out;
    };
    const page = el(`<div class="page side-page">
      <div class="shelf">${who.map((w, k) => `<div class="shelf-spot">${NIC.mascot({ who: w, size: 92, acc: acc(k), mood: ["happy", "wink", "smug", "laugh", "love", "determined"][k], act: ["", "", "wave", "", "", "dance"][k] })}<span>${NIC.cast.CHARS[w].name}</span></div>`).join("")}</div>
      <p class="faint shelf-hint">Tap a character to poke it. Unlock more hats and gadgets with achievements.</p>
      <div class="stat-grid">
        <div class="pf-stat">${IC.flame.replace('fill="currentColor"', 'fill="#ff9600"')}<b>${game.streak()}</b><span>Day streak</span></div>
        <div class="pf-stat"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#ffc800" stroke="#ff9600" stroke-width="1.6" stroke-linejoin="round"/></svg><b>${game.totalXP()}</b><span>Total XP</span></div>
        <div class="pf-stat">${IC.check.replace('stroke="currentColor"', 'stroke="#58cc02"')}<b>${Object.keys(store.get("nic.lessonDone", {})).length}</b><span>Lessons done</span></div>
        <div class="pf-stat"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#1cb0f6" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#1cb0f6"/></svg><b>${st.answered ? Math.round((100 * st.right) / st.answered) : 0}%</b><span>Accuracy</span></div>
      </div>
      <h2>Achievements</h2>${!game.ACH.some((a) => ach[a.id]) && NIC.art ? `<div class="card ab-empty-card">${NIC.art.empty("achievements")}<b>No achievements yet</b><span class="faint">Finish your first lesson to unlock your first hat.</span></div>` : ""}
      <div class="ach-grid">${game.ACH.map((a) => `<div class="ach ${ach[a.id] ? "got" : ""}">${NIC.mascot({ who: "sprout", size: 64, acc: [a.acc], mood: ach[a.id] ? "happy" : "sleepy", poke: !!ach[a.id] })}${ach[a.id] ? "" : `<span class="ach-lock">${IC.lock}</span>`}<b>${a.t}</b><span>${a.d}</span><small>${ach[a.id] ? `Unlocked ${NIC.cast.ACC[a.acc].name}` : `Unlocks ${NIC.cast.ACC[a.acc].name}`}</small></div>`).join("")}</div>
      <h2>Settings</h2>
      <div class="card settings"><div class="set-row"><b>Daily goal</b><div class="seg goal-seg">${[
        [10, "Casual"],
        [20, "Regular"],
        [30, "Serious"],
        [50, "Intense"],
      ]
        .map(
          ([v, t]) =>
            `<button data-g="${v}" class="${v === game.goal() ? "on" : ""}">${t}<small>${v} XP</small></button>`,
        )
        .join("")}</div></div>
        ${NIC.sync ? `<div class="set-row"><b>Account</b>${NIC.sync.email() ? `<span class="faint">${esc(NIC.sync.email())}</span><button class="btn" data-act="signout">Sign out</button>` : `<button class="btn primary" data-act="signin">Log in</button>`}</div>` : ""}
        ${
          NIC.theme
            ? `<div class="set-row"><b>Theme</b><div class="seg theme-seg" role="radiogroup" aria-label="Theme">${[
                ["system", "System", IC.themeSys],
                ["light", "Light", IC.sun],
                ["dark", "Dark", IC.moon],
              ]
                .map(
                  ([v, t, ic]) =>
                    `<button role="radio" data-theme-pick="${v}" aria-checked="${NIC.theme.get() === v}" class="${NIC.theme.get() === v ? "on" : ""}">${ic}${t}</button>`,
                )
                .join("")}</div></div>`
            : ""
        }
        <div class="set-row"><b id="pfSoundL">Sound effects</b><button class="pf-sw ${NIC.sfx.on() ? "on" : ""}" id="pfSound" role="switch" aria-checked="${NIC.sfx.on()}" aria-labelledby="pfSoundL"><i></i></button></div></div>
    </div>`);
    main.appendChild(page);
    const goalSeg = qs(".goal-seg", page),
      themeSeg = qs(".theme-seg", page);
    app.segPill(goalSeg, false);
    app.segPill(themeSeg, false);
    qsa("[data-g]", page).forEach((b) =>
      b.addEventListener("click", () => {
        game.setGoal(+b.dataset.g);
        app.pickSeg(goalSeg, b);
        app.renderTop();
      }),
    );
    const snd = qs("#pfSound", page);
    snd.addEventListener("click", () => {
      NIC.sfx.set(!NIC.sfx.on());
      const on = NIC.sfx.on();
      snd.classList.toggle("on", on);
      snd.setAttribute("aria-checked", on);
    });
    qsa("[data-theme-pick]", page).forEach((b) =>
      b.addEventListener("click", () => {
        app.pickSeg(themeSeg, b);
        NIC.sfx.play("select");
        NIC.theme.set(b.dataset.themePick, { from: b });
      }),
    );
    app.wireSync(page);
    if (!app.calm) fx.enter(qsa(".shelf-spot, .pf-stat, .ach", page), { stagger: 0.03 });
    app.life.onCleanup(NIC.cast.idle(page));
  }
  Object.assign(app, { practicePage, profilePage });
})();
