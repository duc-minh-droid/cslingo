(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { closePop, top } = app;
  const { qs, qsa, el, esc } = NIC;
  const fx = NIC.fx;

  // ---------- account sync (js/sync.js) ----------
  const IC_CLOUD = `<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.4 9.1 4.5 4.5 0 0 0 7 18z" fill="currentColor"/></svg>`;
  app.syncRow = function syncRow() {
    if (!NIC.sync) return "";
    const em = NIC.sync.email();
    return em
      ? `<div class="menu-row sy-row ${NIC.sync.busy && NIC.sync.busy() ? "busy" : ""}">${IC_CLOUD}<i class="sy-dot" title="Saving to your account"></i><span>Logged in<small>${esc(em.replace(/@cslingo.app$/, ""))}</small></span><button class="sy-out" data-act="signout">Sign out</button></div>`
      : `<button class="menu-row sy-row" data-act="signin">${IC_CLOUD}<span>Log in<small>Your progress follows your account</small></span></button>`;
  };
  app.wireSync = function wireSync(root) {
    const i = qs('[data-act="signin"]', root),
      o = qs('[data-act="signout"]', root);
    const ret = root.classList.contains("pop-card") ? () => qs('[data-pop="me"]', top) : null; // opened from the menu: focus goes back to its button
    if (i)
      i.addEventListener("click", () => {
        closePop();
        signInModal(ret);
      });
    // signing out changes the user, and NIC.sync.on below re-renders (one route, not two)
    if (o)
      o.addEventListener("click", async () => {
        if (!confirm("Log out on this device? Your progress stays in your account.")) return;
        closePop();
        await NIC.sync.signOut();
      });
  };
  /** Duolingo-style "Log in" screen: full-screen on phones, a centred column on desktop. Username maps to <name>@cslingo.app. */
  function signInModal(ret) {
    const eye = (on) =>
      `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>${on ? "" : '<path d="M4 20L20 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'}</svg>`;
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
        <button class="btn big si-go" type="submit">Log in</button>
      </form>
      <div class="si-or"><span>How it works</span></div>
      <p class="si-foot">${NIC.mascot({ who: "chip", size: 44, mood: "happy", poke: false })}<span>New here? Pick <b>Create account</b>: just a username and a password, no email. Log in on any device and your progress is right there. It is only ever added to, never replaced.</span></p>
    </div>`,
      { cls: "si-modal", ret },
    );
    m.classList.add("si-back");
    const f = qs(".si-form", m),
      msg = qs(".si-msg", m),
      btn = qs(".si-go", m),
      eyeB = qs(".si-eye", m),
      grp = qs(".si-group", m);
    let up = false,
      label = "Log in";
    const head = qs(".si-h", m);
    qsa("[data-mode]", m).forEach((t) =>
      t.addEventListener("click", () => {
        up = t.dataset.mode === "up";
        label = up ? "Create account" : "Log in";
        qsa("[data-mode]", m).forEach((x) => {
          x.classList.toggle("on", x === t);
          x.setAttribute("aria-selected", x === t);
        });
        head.textContent = label;
        btn.textContent = label;
        f.p.autocomplete = up ? "new-password" : "current-password";
        f.p.placeholder = up ? "Password (8+ characters)" : "Password";
        clearErr();
      }),
    );
    eyeB.addEventListener("click", () => {
      const show = f.p.type === "password";
      f.p.type = show ? "text" : "password";
      eyeB.innerHTML = eye(show);
      eyeB.setAttribute("aria-pressed", show);
      eyeB.setAttribute("aria-label", show ? "Hide password" : "Show password");
      f.p.focus({ preventScroll: true });
    });
    const clearErr = () => {
      grp.classList.remove("bad");
      if (!msg.hidden) msg.hidden = true;
    };
    f.u.addEventListener("input", clearErr);
    f.p.addEventListener("input", clearErr);
    const fail = (text) => {
      msg.textContent = text;
      msg.hidden = false;
      grp.classList.add("bad");
      fx.reveal(msg);
      if (fx.ok) fx.shake(grp);
      NIC.sfx.play("wrong");
    };
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = f.u.value.trim(),
        pw = f.p.value;
      if (!u || !pw) {
        fail(!u ? "Enter your username." : "Enter your password.");
        (u ? f.p : f.u).focus();
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `${up ? "Creating account" : "Logging in"}<span class="sy-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>`;
      btn.setAttribute("aria-busy", "true");
      try {
        if (up) await NIC.sync.signUp(u, pw);
        else await NIC.sync.signIn(u, pw);
        m.close();
        NIC.sfx.play("check");
      } catch (err) {
        btn.disabled = false;
        btn.textContent = label;
        btn.removeAttribute("aria-busy");
        const t = String((err && err.message) || err);
        fail(up ? t : /invalid|credential|password/i.test(t) ? "Wrong username or password." : `Couldn't log in: ${t}`);
      }
    });
  }
  // signed in or out: the top bar and (on Profile) the sync row change
  if (NIC.sync)
    NIC.sync.on(() => {
      app.renderTop();
      if (app.lastRoute && app.lastRoute.tab === "profile" && !NIC.player.isOpen()) app.route();
    });
  // a pending dot on the sync row while progress is being pushed (js/sync.js fires nic:sync)
  const syncBusy = () =>
    qsa(".sy-row", document).forEach((r) =>
      r.classList.toggle("busy", !!(NIC.sync && NIC.sync.busy && NIC.sync.busy())),
    );
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
  Object.assign(app, { modal });
})();
