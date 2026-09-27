/* Revise tab (#revise): shuffled revision decks drawn from finished sessions via NIC.bank.
   NIC.revisePage(main, life, {names}) renders the page; the session itself runs in NIC.player.revise().
   Preferences (deck size, courses) live in localStorage key `nic.revPrefs`. */
(function () {
  const N = NIC, { el, qs, qsa, store, esc } = N;
  const ICON = `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="15" rx="2.5" fill="currentColor" opacity=".45"/><rect x="7" y="3" width="14" height="15" rx="2.5" fill="currentColor"/><path d="M11 10.5l2 2 4-4.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const SIZES = [5, 10, 20];
  const plain = (h) => String(h).replace(/<[^>]+>/g, "");

  function page(main, life, { names = {} } = {}) {
    const prefs = { n: 10, subjects: null, ...store.get("nic.revPrefs", {}) };
    const R = store.get("nic.rev", {});
    const pool = N.bank.all({ learnedOnly: true });
    const subjects = [...new Set(pool.map((x) => x.subject))];
    if (prefs.subjects) prefs.subjects = prefs.subjects.filter((s) => subjects.includes(s));
    if (prefs.subjects && !prefs.subjects.length) prefs.subjects = null;
    const inScope = (x) => !prefs.subjects || prefs.subjects.includes(x.subject);

    // per-session rows: questions, due, mastered
    const bySess = {};
    pool.forEach((x) => { (bySess[x.mod] = bySess[x.mod] || []).push(x); });
    const now = Date.now(), GAP = [0, 0, 1, 3, 7, 14];
    const isDue = (r) => !r || now - r.t >= GAP[Math.min(r.box, 5)] * 864e5;
    const rows = N.modules.filter((m) => bySess[m.id]).map((m) => {
      const qs_ = bySess[m.id];
      return { m, n: qs_.length, due: qs_.filter((x) => isDue(R[x.id])).length, mastered: qs_.filter((x) => R[x.id] && R[x.id].box >= 4).length, seen: qs_.filter((x) => R[x.id]).length };
    });

    const head = `<div class="sp-hero u-blue rv-hero">${N.mascot({ who: "chip", size: 130, mood: pool.length ? "determined" : "sleepy", act: pool.length ? "dance" : "sleep", acc: ["propeller"] })}
      <div><h1>Revise</h1><p>A shuffled mix from every session you've finished. Get one right and it comes back later; miss it and it comes back soon.</p></div></div>`;
    if (!pool.length) {
      main.appendChild(el(`<div class="page side-page">${head}<div class="card rv-empty"><b>Nothing to revise yet</b><p class="faint">Finish a lesson and its questions join your deck here.</p><a class="btn big primary" href="#home">Go to lessons</a></div></div>`));
      return;
    }

    const node = el(`<div class="page side-page">${head}
      <div class="stat-grid rv-stats"></div>
      <div class="card rv-setup">
        <div class="rv-row"><b>Courses</b><div class="seg rv-subj">${subjects.length > 1 ? `<button data-s="*">All</button>` : ""}${subjects.map((s) => `<button data-s="${s}">${esc(names[s] || s)}</button>`).join("")}</div></div>
        <div class="rv-row"><b>Questions</b><div class="seg rv-size">${SIZES.map((n) => `<button data-n="${n}">${n}</button>`).join("")}</div></div>
        <button class="btn big primary rv-go">Start revision</button>
      </div>
      <h2>Your sessions</h2>
      <div class="rv-list"></div>
    </div>`);
    main.appendChild(node);

    function paint() {
      const S = N.bank.stats({ subjects: prefs.subjects });
      qs(".rv-stats", node).innerHTML = [
        ["#ff9600", `<circle cx="12" cy="12" r="9" fill="none" stroke="#ff9600" stroke-width="3"/><path d="M12 7v5l3 2" stroke="#ff9600" stroke-width="3" stroke-linecap="round" fill="none"/>`, S.due, "due now"],
        ["#58cc02", `<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#58cc02" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`, S.mastered, "mastered"],
        ["#1cb0f6", `<circle cx="12" cy="12" r="9" fill="none" stroke="#1cb0f6" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#1cb0f6"/>`, S.seen ? `${Math.round(S.accuracy * 100)}%` : "–", "accuracy"],
        ["#ce82ff", ICON.replace(/currentColor/g, "#ce82ff"), S.available, "questions"],
      ].map(([, svg, v, t]) => `<div class="pf-stat"><svg viewBox="0 0 24 24">${svg.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg><b>${v}</b><span>${t}</span></div>`).join("");
      qsa(".rv-subj button", node).forEach((b) => b.classList.toggle("on", b.dataset.s === "*" ? !prefs.subjects : !!prefs.subjects && prefs.subjects.includes(b.dataset.s) || (!prefs.subjects && subjects.length === 1)));
      qsa(".rv-size button", node).forEach((b) => b.classList.toggle("on", +b.dataset.n === prefs.n));
      const go = qs(".rv-go", node), avail = pool.filter(inScope).length;
      go.textContent = `Start ${Math.min(prefs.n, avail)} questions`;
      go.disabled = !avail;
      const list = rows.filter((r) => inScope({ subject: r.m.subject || "nic" }));
      qs(".rv-list", node).innerHTML = list.map((r) => {
        const f = r.n ? r.mastered / r.n : 0, boss = r.m.num === "Boss";
        return `<div class="rv-sess ${r.due ? "has-due" : ""}"><div class="rv-sess-t"><small>${esc(names[r.m.subject || "nic"] || "")} · ${boss ? "Boss" : r.m.num}</small><b>${plain(r.m.title)}</b></div>
          <div class="rv-sess-bar" title="${r.mastered} of ${r.n} mastered"><span style="transform:scaleX(${f})"></span></div>
          <div class="rv-sess-n">${r.due ? `<span class="rv-due">${r.due} due</span>` : `<span class="rv-ok">all caught up</span>`}<small>${r.seen}/${r.n} seen</small></div></div>`;
      }).join("");
    }
    const save = () => store.set("nic.revPrefs", { n: prefs.n, subjects: prefs.subjects });
    qsa(".rv-subj button", node).forEach((b) => b.addEventListener("click", () => {
      const s = b.dataset.s;
      if (s === "*") prefs.subjects = null;
      else {
        const cur = new Set(prefs.subjects || []);
        if (!prefs.subjects) cur.clear();
        cur.has(s) ? cur.delete(s) : cur.add(s);
        prefs.subjects = cur.size && cur.size < subjects.length ? [...cur] : null;
      }
      N.sfx && N.sfx.play("select"); save(); paint();
    }));
    qsa(".rv-size button", node).forEach((b) => b.addEventListener("click", () => { prefs.n = +b.dataset.n; N.sfx && N.sfx.play("select"); save(); paint(); }));
    qs(".rv-go", node).addEventListener("click", () => N.player.revise({ home: "revise", n: prefs.n, subjects: prefs.subjects }));
    paint();
    if (N.fx && N.fx.enter) N.fx.enter(Array.from(node.children), { stagger: 0.05 });
  }

  N.revisePage = page;
  N.revisePage.icon = ICON;
})();
