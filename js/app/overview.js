(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { SUBJECTS, SUBJ_ORDER, inSubj, isBoss, progress, status } = app;
  const { qs, qsa, esc, store } = NIC;
  const game = NIC.game;

  // =====================================================================
  //  Profile overview: how far along each course is, and this week's XP
  // =====================================================================
  const UNIT_COLOR = { nic: "green", ds: "blue", algo: "violet" };

  /** One row per course: lessons done, bosses passed and (once the revision questions have loaded) questions mastered. */
  function courseRow(k) {
    const S = SUBJECTS[k],
      list = inSubj(k),
      P = progress(list),
      bosses = list.filter(isBoss),
      passed = bosses.filter((m) => status(m) === "done").length;
    const loaded = list.length > 0; // a course that hasn't downloaded yet has no lessons to count
    const mastered = NIC.bank && NIC.bank.loaded() ? NIC.bank.stats({ subjects: [k] }).mastered : null;
    const bits = loaded
      ? [
          `${P.d}/${P.n} done`,
          bosses.length ? `${passed}/${bosses.length} boss${bosses.length === 1 ? "" : "es"} passed` : "",
          mastered ? `${mastered} question${mastered === 1 ? "" : "s"} mastered` : "",
        ].filter(Boolean)
      : ["Loading…"];
    return `<div class="ov-row u-${UNIT_COLOR[k] || "green"}"><a class="ov-c" href="#${esc(S.home)}" aria-label="Open ${esc(S.name)}">${NIC.mascot({ who: S.who, size: 44, poke: false, mood: P.n && P.d === P.n ? "love" : "idle" })}
      <div class="ov-ct"><b>${esc(S.name)}</b><span>${bits.join(" · ")}</span>
        <span class="ov-bar" role="progressbar" aria-label="${esc(S.name)} lessons done" aria-valuemin="0" aria-valuemax="${P.n}" aria-valuenow="${P.d}"><span style="transform:scaleX(${P.f})"></span></span></div>
      <b class="ov-pc" aria-hidden="true">${loaded ? Math.round(P.f * 100) + "%" : ""}</b></a>${lectures(k, list)}</div>`;
  }

  /** Collapsed "Lectures" list under a course row: "L3 · 2/5" with a thin bar, linking to the first unfinished lesson. */
  function lectures(k, list) {
    const by = new Map();
    list.forEach((m) => by.set(m.lecture, [...(by.get(m.lecture) || []), m]));
    if (by.size < 2) return "";
    const rows = [...by.entries()].map(([lec, ms]) => {
      const P = progress(ms),
        next = ms.find((m) => status(m) !== "done") || ms[0];
      return `<a class="ov-lec" href="#${esc(next.id)}" aria-label="Lecture ${esc(lec)}, ${P.d} of ${P.n} done${P.d === P.n ? "" : ", continue"}"><span>L${esc(lec)} · ${P.d}/${P.n}</span><i class="ov-lb"><i style="transform:scaleX(${P.f})"></i></i></a>`;
    });
    return `<details class="ov-det"><summary>Lectures</summary><div class="ov-lecs">${rows.join("")}</div></details>`;
  }

  /** Monday to Sunday of this week with the XP earned on each day (the same week the streak pop-up shows). */
  function weekXP() {
    const xp = (store.get("nic.xp", { days: {} }) || {}).days || {};
    return game.week().map((d) => ({ ...d, xp: xp[d.date] || 0 }));
  }
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function weekBars() {
    const wk = weekXP(),
      goal = game.goal(),
      max = Math.max(goal, ...wk.map((d) => d.xp)),
      total = wk.reduce((n, d) => n + d.xp, 0);
    const label = wk.map((d, i) => `${DAYS[i]} ${d.xp} XP`).join(", ");
    return `<div class="ov-week"><div class="ov-wh"><b>This week</b><span>${total} XP</span></div>
      <div class="ov-bars" role="img" aria-label="XP each day this week, goal ${goal}: ${label}" style="--goal:${(goal / max).toFixed(3)}">
        ${wk
          .map(
            (d, i) =>
              `<div class="ov-d ${d.today ? "today" : ""} ${d.xp ? "has" : ""} ${d.xp >= goal ? "met" : ""}" aria-hidden="true"><i style="--h:${(d.xp / max).toFixed(3)}"></i><span>${DAYS[i][0]}</span><em>${d.xp || ""}</em></div>`,
          )
          .join("")}
      </div><small class="faint">Dashed line: your ${goal} XP daily goal</small></div>`;
  }

  /** The "Your progress" block for the Profile page. Courses that are still downloading fill in when they arrive. */
  app.overviewHTML = () =>
    `<div class="ov" data-ov><h2>Your progress</h2><div class="card ov-card"><div class="ov-courses">${SUBJ_ORDER.map(courseRow).join("")}</div>${weekBars()}</div></div>`;
  app.overviewMount = (page) => {
    if (NIC.content.allLoaded()) return;
    NIC.content.all().then(
      () => {
        const box = qs(".ov-courses", page);
        if (box && page.isConnected) box.innerHTML = SUBJ_ORDER.map(courseRow).join("");
      },
      () => {
        qsa(".ov-ct span:not(.ov-bar)", page).forEach(
          (s) => s.textContent === "Loading…" && (s.textContent = "Couldn't load"),
        );
      },
    );
  };
})();
