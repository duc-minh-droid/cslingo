(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});

  // =====================================================================
  //  Icons
  // =====================================================================
  const IC = {
    sun: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    moon: `<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>`,
    themeSys: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 4v13" stroke="currentColor" stroke-width="2.2"/><path d="M12 4h6a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6z" fill="currentColor"/><path d="M8 21h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24"><path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 13v4M8 21h8l-1-4H9z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    play: `<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
    film: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/></svg>`,
    flame: `<svg viewBox="0 0 24 24"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-7 1-9.5z" fill="currentColor"/><path d="M12 12c.6 2 2.5 3 2.5 5a2.5 2.5 0 0 1-5 0c0-1.2.8-2 1.3-2.6.2 1 .7 1.4 1.2 1.4-.4-1.4-.3-2.6 0-3.8z" fill="#ffc800"/></svg>`,
    chest: `<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="11" rx="2.5" fill="#cd7900"/><path d="M3 11a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1H3z" fill="#ff9600"/><rect x="10" y="10" width="4" height="5" rx="1" fill="#ffc800"/></svg>`,
    home: `<svg viewBox="0 0 24 24"><path d="M3.5 11L12 3.5l8.5 7.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" fill="currentColor"/></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24"><rect x="2" y="8" width="4" height="8" rx="1.5" fill="currentColor"/><rect x="18" y="8" width="4" height="8" rx="1.5" fill="currentColor"/><rect x="5" y="6" width="3" height="12" rx="1.5" fill="currentColor"/><rect x="16" y="6" width="3" height="12" rx="1.5" fill="currentColor"/><rect x="8" y="10.5" width="8" height="3" rx="1.5" fill="currentColor"/></svg>`,
    face: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="8.5" cy="10.5" r="1.6" fill="var(--bg)"/><circle cx="15.5" cy="10.5" r="1.6" fill="var(--bg)"/><path d="M8 14.5q4 3.5 8 0" stroke="var(--bg)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    chev: `<svg viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    book: `<svg viewBox="0 0 24 24"><path d="M4 5c3-1 5.5-.6 8 1.4V20c-2.5-2-5-2.4-8-1.4zM20 5c-3-1-5.5-.6-8 1.4V20c2.5-2 5-2.4 8-1.4z" fill="currentColor"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    lock: `<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>`,
    sound: `<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    reset: `<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const ring = (f, r = 9, w = 3.5, col = "#ffc800") => {
    const L = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 ${2 * r + w * 2} ${2 * r + w * 2}"><circle cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${w}"/><circle class="ring-v" cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - Math.min(1, f))}" transform="rotate(-90 ${r + w} ${r + w})"/></svg>`;
  };
  Object.assign(app, { IC, ring });
})();
