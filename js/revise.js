/* Revise tab (#revise): shuffled revision decks drawn from finished sessions via NIC.bank.
   NIC.revisePage(main, life, {names}) renders the page; the session itself runs in NIC.player.revise().
   Preferences (deck size, courses) live in localStorage key `nic.revPrefs`. */
(function () {
  const N = NIC, { el, qs, qsa, store, esc } = N;
  const ICON = `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="15" rx="2.5" fill="currentColor" opacity=".45"/><rect x="7" y="3" width="14" height="15" rx="2.5" fill="currentColor"/><path d="M11 10.5l2 2 4-4.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const SIZES = [5, 10, 20];
  const plain = (h) => String(h).replace(/<[^>]+>/g, "");

  /** calm: the page already arrived with a page transition (or only the panel changed), so skip the staggered entrance. */
  function page(main, life, { names = {}, calm = false } = {}) {
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
    const doneMods = store.get("nic.lessonDone", {});
    const rows = N.modules.filter((m) => bySess[m.id] && doneMods[m.id]).map((m) => {
      const qs_ = bySess[m.id];
      return { m, n: qs_.length, due: qs_.filter((x) => isDue(R[x.id])).length, mastered: qs_.filter((x) => R[x.id] && R[x.id].box >= 4).length, seen: qs_.filter((x) => R[x.id]).length };
    });

    const head = `<div class="sp-hero u-blue rv-hero">${N.mascot({ who: "chip", size: 130, mood: pool.length ? "determined" : "sleepy", act: pool.length ? "dance" : "sleep", acc: ["propeller"] })}
      <div><h1>Due reviews</h1><p>A shuffled mix from every session you've finished. Get one right and it comes back later; miss it and it comes back soon.</p></div></div>`;
    if (!pool.length) {
      main.appendChild(el(`<div class="page side-page">${head}<div class="card rv-empty"><b>Nothing to revise yet</b><p class="faint">Finish a lesson and its questions join your deck here.</p><a class="btn big primary" href="#home">Go to lessons</a></div></div>`));
      return;
    }

    // an unfinished round: reopen it straight away after a refresh, otherwise offer Continue
    const saved = N.player.revSaved && N.player.revSaved();
    if (saved && !page.booted && !saved.paused) { page.booted = true; setTimeout(() => N.player.revise({ resume: true, ...(saved.opts || {}), home: (saved.opts && saved.opts.home) || "practice" }), 0); }
    page.booted = true;
    const resumeCard = saved ? `<div class="card rv-resume"><div><b>Continue your revision</b><span class="faint">Question ${Math.min(saved.done + 1, saved.ids.length)} of ${saved.ids.length}</span></div><button class="btn primary rv-continue">Continue</button></div>` : "";
    const node = el(`<div class="page side-page">${head}
      ${resumeCard}
      <div class="card rv-setup">
        <div class="rv-row"><b>Courses</b><div class="seg rv-subj">${subjects.length > 1 ? `<button data-s="*">All</button>` : ""}${subjects.map((s) => `<button data-s="${s}">${esc(names[s] || s)}</button>`).join("")}</div></div>
        <div class="rv-row"><b>Questions</b><div class="seg rv-size">${SIZES.map((n) => `<button data-n="${n}">${n}</button>`).join("")}</div></div>
        <button class="btn big primary rv-go">Start revision</button>
      </div>
      <div class="rv-done"><h2>Sessions you've done</h2><div class="rv-list"></div></div>
    </div>`);
    main.appendChild(node);

    const fx = N.fx || {};
    let painted = false;
    /** The value in a stat tile: numbers count to their new value, anything else (the "–" placeholder) is set as text. */
    const setStat = (b, v, fmt) => {
      if (typeof v !== "number" || !painted || !fx.count) { b.textContent = typeof v === "number" ? fmt(v) : v; if (typeof v === "number") b.dataset.v = v; else delete b.dataset.v; return; }
      if (b.dataset.v === undefined) { b.textContent = fmt(v); b.dataset.v = v; return; }
      fx.count(b, v, { from: +b.dataset.v, fmt, dur: fx.DUR ? fx.DUR.l : 0.3 });
    };
    /** One session row. Updated in place later so the bar's CSS transition runs. */
    const rowHTML = (r) => `<div class="rv-sess" data-id="${r.m.id}"><div class="rv-sess-t"><small>${esc(names[r.m.subject || "nic"] || "")} · ${r.m.num === "Boss" ? "Boss" : r.m.num}</small><b>${plain(r.m.title)}</b></div></div>`;
    const fillRow = () => {}; // rows carry no progress or counts, just which session it is

    function paint() {
      qsa(".rv-subj button", node).forEach((b) => b.classList.toggle("on", b.dataset.s === "*" ? !prefs.subjects : !!prefs.subjects && prefs.subjects.includes(b.dataset.s) || (!prefs.subjects && subjects.length === 1)));
      qsa(".rv-size button", node).forEach((b) => b.classList.toggle("on", +b.dataset.n === prefs.n));
      const go = qs(".rv-go", node), avail = pool.filter(inScope).length;
      go.textContent = "Start revision";
      go.disabled = !avail;
      // patch the list: rows that leave fade out, rows that stay keep their node (their bar animates), new rows enter
      const list = rows.filter((r) => inScope({ subject: r.m.subject || "nic" })), box = qs(".rv-list", node);
      const want = new Set(list.map((r) => r.m.id)), have = {};
      Array.from(box.children).forEach((row) => {
        if (row.classList.contains("m-ghost")) return;
        if (want.has(row.dataset.id)) { have[row.dataset.id] = row; return; }
        if (!painted || !fx.ok || !fx.exit) return row.remove();
        row.classList.add("m-ghost"); fx.exit(row, { scale: 1, dur: fx.DUR.s }).then(() => row.remove());
      });
      const added = [];
      let at = null; // insert in list order, after the previous kept row
      list.forEach((r) => {
        let row = have[r.m.id];
        if (!row) { row = el(rowHTML(r)); added.push(row); }
        fillRow(row, r);
        const ref = at ? at.nextSibling : box.firstChild;
        if (row !== ref) box.insertBefore(row, ref);
        at = row;
      });
      // ghosts that are fading out go to the end, out of the way of the kept order
      Array.from(box.children).filter((x) => x.classList.contains("m-ghost")).forEach((g) => box.appendChild(g));
      if (painted && added.length && fx.enter) fx.enter(added, { y: 6, stagger: 0.03, dur: fx.DUR.m });
      qs(".rv-done", node).hidden = !list.length;
      painted = true;
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
    const cont = qs(".rv-continue", node);
    if (cont) cont.addEventListener("click", () => N.player.revise({ resume: true, ...(saved.opts || {}), home: (saved.opts && saved.opts.home) || "practice" }));
    qs(".rv-go", node).addEventListener("click", () => N.player.revise({ home: "practice/due", n: prefs.n, subjects: prefs.subjects }));
    paint();
    if (!calm && fx.enter) fx.enter(Array.from(node.children), { stagger: 0.03 }); // 7 blocks, total stagger under 200ms
  }

  N.revisePage = page;
  N.revisePage.icon = ICON;
})();
