(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { closePop, top } = app;
  const { qs, qsa, el, esc } = NIC;
  const fx = NIC.fx;

  // ---------- account sync (js/sync.js) ----------
  const IC_CLOUD = `<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.4 9.1 4.5 4.5 0 0 0 7 18z" fill="currentColor"/></svg>`;
  const IC_KEY = `<svg viewBox="0 0 24 24"><path d="M14.5 3a6.5 6.5 0 0 0-6.2 8.4L3 16.7V21h4.3v-2.2h2.2v-2.2h2.2l1.4-1.4A6.5 6.5 0 1 0 14.5 3zm2 4.2a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4z" fill="currentColor"/></svg>`;
  /** "Synced just now" and friends for the menu and Profile. NIC.sync.status() has the raw {loggedIn, user, state, at}. */
  function syncLine() {
    const s = NIC.sync.status();
    if (s.state === "syncing") return "Syncing…";
    if (s.state === "offline") return "Offline, will sync when you're back";
    if (s.state === "error") return "Couldn't sync, will try again";
    const m = Math.floor((Date.now() - s.at) / 60000);
    return m < 1 ? "Synced just now" : m < 60 ? `Synced ${m} min ago` : "Synced over an hour ago";
  }
  app.syncRow = function syncRow() {
    if (!NIC.sync) return "";
    const st = NIC.sync.status();
    return st.loggedIn
      ? `<div class="menu-row sy-row ${NIC.sync.busy && NIC.sync.busy() ? "busy" : ""}">${IC_CLOUD}<i class="sy-dot" title="Saving to your account"></i><span>Logged in<small>${esc(st.user)} · <span data-sy-line>${syncLine()}</span></small></span><button class="sy-out" data-act="signout">Sign out</button></div>
        <button class="menu-row" data-act="changepw">${IC_KEY}<span>Change password</span></button>`
      : `<button class="menu-row sy-row" data-act="signin">${IC_CLOUD}<span>Log in<small>Back up your progress on any device</small></span></button>`;
  };
  app.wireSync = function wireSync(root) {
    const i = qs('[data-act="signin"]', root),
      o = qs('[data-act="signout"]', root),
      c = qs('[data-act="changepw"]', root);
    const ret = root.classList.contains("pop-card") ? () => qs('[data-pop="me"]', top) : null; // opened from the menu: focus goes back to its button
    if (i)
      i.addEventListener("click", () => {
        closePop();
        signInModal(ret);
      });
    if (c)
      c.addEventListener("click", () => {
        closePop();
        changePasswordModal(ret);
      });
    // signing out changes the user, and NIC.sync.on below re-renders (one route, not two)
    if (o)
      o.addEventListener("click", async () => {
        if (
          !confirm(
            "Sign out on this device?\n\nYour progress stays in your account. A copy also stays on this device until a different account signs in here.",
          )
        )
          return;
        closePop();
        try {
          await NIC.sync.signOut();
        } catch (e) {
          fx.toast(
            `<b>Couldn't sign out</b><span>${e && e.unsynced ? e.message : "Check your connection and try again."}</span>`,
          );
        }
      });
  };
  let siModal = null; // the open Log in screen, so the "add this device's progress?" question can replace it
  const eye = (on) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>${on ? "" : '<path d="M4 20L20 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'}</svg>`;
  const dots = `<span class="sy-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>`;
  /** Show a form error (red line, shake, sound) / clear it again. Shared by the Log in and Change password screens. */
  function oops(m, text) {
    const msg = qs(".si-msg", m);
    msg.textContent = text;
    msg.hidden = false;
    qs(".si-group", m).classList.add("bad");
    fx.reveal(msg);
    if (fx.ok) fx.shake(qs(".si-group", m));
    NIC.sfx.play("wrong");
  }
  function calm(m) {
    qs(".si-group", m).classList.remove("bad");
    if (!qs(".si-msg", m).hidden) qs(".si-msg", m).hidden = true;
  }
  /** Duolingo-style "Log in" screen: full-screen on phones, a centred column on desktop. Username maps to <name>@cslingo.app.
      Also NIC.account.signIn(ret, {mode: "in" | "up"}) for other screens (onboarding, nudges). */
  function signInModal(ret, { mode = "in" } = {}) {
    const m = modal(
      `<div class="si">
      <h1 class="si-h">Log in</h1>
      <div class="seg si-mode" role="tablist"><button type="button" role="tab" data-mode="in" class="on" aria-selected="true">Log in</button><button type="button" role="tab" data-mode="up" aria-selected="false">Create account</button></div>
      <form class="si-form" novalidate>
        <div class="si-group">
          <label class="si-field"><span class="sr-only">Username</span><input name="u" required autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Username"></label>
          <label class="si-field si-pw"><span class="sr-only">Password</span><input name="p" type="password" required autocomplete="current-password" placeholder="Password">
            <button type="button" class="si-eye" aria-label="Show password" aria-pressed="false">${eye(false)}</button></label>
        </div>
        <p class="si-msg" role="alert" hidden></p>
        <div class="callout si-note" hidden><b>No email, so we can't reset your password.</b> Pick one you will remember.<br>Username: 3 to 24 letters, numbers, _ . or -<br>Password: 8 or more characters</div>
        <button class="btn big si-go" type="submit">Log in</button>
      </form>
      <div class="si-or"><span>How it works</span></div>
      <p class="si-foot">${NIC.mascot({ who: "chip", size: 44, mood: "happy", poke: false })}<span>New here? Pick <b>Create account</b>: just a username and a password, no email. Log in on any device and your progress is right there. It is only ever added to, never replaced.</span></p>
    </div>`,
      { cls: "si-modal", ret },
    );
    m.classList.add("si-back");
    siModal = m;
    const f = qs(".si-form", m),
      btn = qs(".si-go", m),
      eyeB = qs(".si-eye", m),
      note = qs(".si-note", m);
    let up = false,
      label = "Log in";
    const head = qs(".si-h", m);
    const setMode = (t) => {
      up = t.dataset.mode === "up";
      label = up ? "Create account" : "Log in";
      qsa("[data-mode]", m).forEach((x) => {
        x.classList.toggle("on", x === t);
        x.setAttribute("aria-selected", x === t);
      });
      head.textContent = label;
      btn.textContent = label;
      note.hidden = !up;
      f.p.autocomplete = up ? "new-password" : "current-password";
      f.p.placeholder = up ? "Password (8+ characters)" : "Password";
      calm(m);
    };
    qsa("[data-mode]", m).forEach((t) => t.addEventListener("click", () => setMode(t)));
    if (mode === "up") setMode(qs('[data-mode="up"]', m));
    eyeB.addEventListener("click", () => {
      const show = f.p.type === "password";
      f.p.type = show ? "text" : "password";
      eyeB.innerHTML = eye(show);
      eyeB.setAttribute("aria-pressed", show);
      eyeB.setAttribute("aria-label", show ? "Hide password" : "Show password");
      f.p.focus({ preventScroll: true });
    });
    f.u.addEventListener("input", () => calm(m));
    f.p.addEventListener("input", () => calm(m));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = f.u.value.trim(),
        pw = f.p.value;
      const rule = !u
        ? "Enter your username."
        : !pw
          ? "Enter your password."
          : up && !/^[a-z0-9_.-]{3,24}$/i.test(u)
            ? "Pick a username of 3 to 24 letters, numbers, _ . or -."
            : up && (pw.length < 8 || pw.length > 72)
              ? "Use a password of 8 to 72 characters."
              : "";
      if (rule) {
        oops(m, rule);
        (u && !/username/.test(rule) ? f.p : f.u).focus();
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `${up ? "Creating account" : "Logging in"}${dots}`;
      btn.setAttribute("aria-busy", "true");
      try {
        if (up) await NIC.sync.signUp(u, pw);
        else await NIC.sync.signIn(u, pw);
        // a device with nothing on it is about to receive the account's progress: say so until it has arrived
        if (!Object.keys(NIC.store.get("nic.lessonDone", {})).length) {
          btn.innerHTML = `Loading your progress${dots}`;
          await NIC.sync.settled(10000);
        }
        m.close();
        NIC.sfx.play("check");
      } catch (err) {
        btn.disabled = false;
        btn.textContent = label;
        btn.removeAttribute("aria-busy");
        const t = String((err && err.message) || err);
        oops(
          m,
          up ? t : /invalid|credential|password/i.test(t) ? "Wrong username or password." : `Couldn't log in: ${t}`,
        );
      }
    });
  }
  /** Change password (the account menu). There is no email, so there is no "forgot password" route: say so. */
  function changePasswordModal(ret) {
    const m = modal(
      `<div class="si">
      <h1 class="si-h">Change password</h1>
      <form class="si-form" novalidate>
        <div class="si-group">
          <label class="si-field"><span class="sr-only">New password</span><input name="p" type="password" required autocomplete="new-password" placeholder="New password (8+ characters)"></label>
          <label class="si-field"><span class="sr-only">Repeat the new password</span><input name="p2" type="password" required autocomplete="new-password" placeholder="Repeat it"></label>
        </div>
        <p class="si-msg" role="alert" hidden></p>
        <button class="btn big si-go" type="submit">Save password</button>
      </form>
      <div class="callout"><b>No email, so we can't reset a forgotten password.</b> Keep this one somewhere safe.</div>
    </div>`,
      { cls: "si-modal", ret },
    );
    m.classList.add("si-back");
    const f = qs(".si-form", m),
      btn = qs(".si-go", m);
    f.p.addEventListener("input", () => calm(m));
    f.p2.addEventListener("input", () => calm(m));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rule =
        f.p.value.length < 8 || f.p.value.length > 72
          ? "Use a password of 8 to 72 characters."
          : f.p.value !== f.p2.value
            ? "The two passwords don't match."
            : "";
      if (rule) return oops(m, rule);
      btn.disabled = true;
      btn.innerHTML = `Saving${dots}`;
      try {
        await NIC.sync.changePassword(f.p.value);
        m.close();
        NIC.sfx.play("check");
        fx.toast("<b>Password changed</b>");
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Save password";
        oops(m, String((err && err.message) || err));
      }
    });
  }
  /** js/sync.js asks this when a different account signs in over progress on this device. Resolves "add", "fresh" or null (cancel, which logs out again). */
  if (NIC.sync)
    NIC.sync.askAdopt = (name) =>
      new Promise((resolve) => {
        if (siModal && siModal.isConnected) siModal.close();
        const who = esc(name);
        const m = modal(
          `<div class="si">
        <h1 class="si-h">Add this device's progress?</h1>
        <p class="si-foot">${NIC.mascot({ who: "chip", size: 44, mood: "think", poke: false })}<span>This device already has progress from another account. Add it to <b>${who}</b>, or start fresh with only what <b>${who}</b> has saved?</span></p>
        <div class="sy-form">
          <button class="btn primary big" data-pick="add">Add it to ${who}</button>
          <button class="btn big" data-pick="fresh">Start fresh</button>
          <p class="si-foot">Starting fresh clears this device's copy. Anything already saved to the other account is still there.</p>
          <button class="btn ghost" data-pick="cancel">Cancel and log out</button>
        </div>
      </div>`,
          { cls: "si-modal" },
        );
        m.classList.add("si-back");
        let picked = false;
        const done = (v) => {
          if (picked) return;
          picked = true;
          resolve(v);
        };
        qsa("[data-pick]", m).forEach((b) =>
          b.addEventListener("click", () => {
            done(b.dataset.pick === "cancel" ? null : b.dataset.pick);
            m.close();
          }),
        );
        new MutationObserver((r, o) => {
          if (!m.isConnected) {
            o.disconnect();
            done(null); // closed with the cross, Esc or a tap outside: same as Cancel
          }
        }).observe(document.body, { childList: true });
      });
  // signed in or out: the top bar and (on Profile) the sync row change
  if (NIC.sync)
    NIC.sync.on(() => {
      app.renderTop();
      if (app.lastRoute && app.lastRoute.tab === "profile" && !NIC.player.isOpen()) app.route();
    });
  // a pending dot on the sync row while progress is being pushed, and its "Synced just now" line (js/sync.js fires nic:sync)
  const syncBusy = () => {
    qsa(".sy-row", document).forEach((r) =>
      r.classList.toggle("busy", !!(NIC.sync && NIC.sync.busy && NIC.sync.busy())),
    );
    if (NIC.sync) qsa("[data-sy-line]", document).forEach((n) => (n.textContent = syncLine()));
  };
  window.addEventListener("nic:sync", syncBusy);

  /** Shared modal. ret: element (or function returning one) to focus on close when focus has nowhere else to go. */
  function modal(html, { cls = "", ret = null } = {}) {
    const m = el(
      `<div class="modal-back"><div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Close">✕</button>${html}</div></div>`,
    );
    document.body.appendChild(m);
    NIC.shield(true);
    // close hands focus and the page back at once (so another modal can open straight away), then animates out and removes
    const back = () => {
      // shield(false) refocuses the element that opened it; if that's gone (a closed popover), use ret
      const a = document.activeElement,
        t = typeof ret === "function" ? ret() : ret;
      if (t && t.isConnected && (!a || a === document.body || m.contains(a))) t.focus({ preventScroll: true });
    };
    const close = () => {
      if (m._open === false) return;
      m._open = false;
      document.removeEventListener("keydown", onK);
      NIC.shield(false);
      back();
      if (NIC.sfx) NIC.sfx.play("close");
      if (!fx.ok || !fx.exit || !m.isConnected) return m.remove();
      m.classList.add("m-ghost");
      Promise.all([fx.exit(qs(".modal", m), { y: 14, scale: 0.96 }), fx.exit(m, { scale: 1, dur: fx.DUR.s })]).then(
        () => m.remove(),
      );
    };
    m.close = close;
    new MutationObserver((r, o) => {
      if (!m.isConnected) {
        o.disconnect();
        document.removeEventListener("keydown", onK);
        if (m._open !== false) {
          m._open = false;
          NIC.shield(false);
        }
      }
    }).observe(document.body, { childList: true }); // callers may just m.remove()
    setTimeout(() => {
      const f = m.querySelector("input, .modal button:not(.modal-x)");
      if (f) f.focus();
    }, 30);
    const onK = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onK);
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest(".modal-x")) close();
    });
    if (fx.ok) {
      fx.clean(m, fx.animate(m, { opacity: [0, 1] }, { duration: fx.DUR.s }), ["opacity"]);
      const box = qs(".modal", m);
      fx.clean(
        box,
        fx.animate(
          box,
          fx.reduce()
            ? { opacity: [0, 1] }
            : { opacity: [0, 1], transform: ["translateY(30px) scale(0.94)", "translateY(0px) scale(1)"] },
          { ...fx.SPRING },
        ),
      );
    }
    return m;
  }
  NIC.modal = modal;
  NIC.account = { signIn: signInModal, changePassword: changePasswordModal, syncLine };
  Object.assign(app, { modal, signInModal, changePasswordModal, syncLine });
})();
