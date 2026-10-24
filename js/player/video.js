/* The recap-video player (js/content/{nic,ds,algo}/videos.js):  NIC.videoPlayer(box, {src, poster, label, caption, life})
   A large square frame with its own control bar underneath, so the controls never cover the captions burnt into the video.
   Big play button over the poster; bar: play/pause, time, scrubber, speed, mute, full screen. Keyboard (when the player has
   focus): Space/K play-pause, ←/→ 5 s, M mute, F full screen. Pauses when the lesson's lifecycle ends. */
(function () {
  const N = NIC,
    { el } = N;
  const ICON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/></svg>`,
    replay: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M4.5 4.5v5h5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    vol: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    muted: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    fs: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const RATES = [1, 1.25, 1.5, 0.75];
  const clock = (s) => {
    const t = Math.max(0, Math.floor(s || 0));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  };

  N.videoPlayer = function videoPlayer(box, { src, poster, label, caption, life }) {
    const fig = el(`<figure class="vp" tabindex="0" aria-label="${label}">
      <div class="vp-frame">
        <video playsinline preload="metadata" poster="${poster}"><source src="${src}" type="video/mp4" /></video>
        <button class="vp-big" aria-label="Play">${ICON.play}</button>
      </div>
      <div class="vp-bar">
        <button class="vp-btn vp-play" aria-label="Play">${ICON.play}</button>
        <span class="vp-time"><b class="vp-cur">0:00</b><span> / </span><span class="vp-dur">0:00</span></span>
        <input class="vp-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="Position in the video" />
        <button class="vp-btn vp-rate" aria-label="Playback speed 1 times">1×</button>
        <button class="vp-btn vp-mute" aria-label="Mute">${ICON.vol}</button>
        <button class="vp-btn vp-fs" aria-label="Full screen">${ICON.fs}</button>
      </div>
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>`);
    box.appendChild(fig);
    const $ = (s) => fig.querySelector(s);
    const v = $("video"),
      big = $(".vp-big"),
      play = $(".vp-play"),
      seek = $(".vp-seek"),
      rate = $(".vp-rate"),
      mute = $(".vp-mute");
    let dragging = false;

    const paint = () => {
      const state = v.ended ? "ended" : v.paused ? (v.currentTime > 0 ? "paused" : "idle") : "playing";
      fig.dataset.state = state;
      const icon = state === "playing" ? ICON.pause : state === "ended" ? ICON.replay : ICON.play;
      const name = state === "playing" ? "Pause" : state === "ended" ? "Play again" : "Play";
      play.innerHTML = icon;
      play.setAttribute("aria-label", name);
      big.innerHTML = state === "ended" ? ICON.replay : ICON.play;
      big.setAttribute("aria-label", name);
    };
    const time = () => {
      const d = v.duration || 0;
      $(".vp-cur").textContent = clock(v.currentTime);
      $(".vp-dur").textContent = clock(d);
      if (!dragging && d) seek.value = String(Math.round((v.currentTime / d) * 1000));
      fig.style.setProperty("--p", `${d ? (v.currentTime / d) * 100 : 0}%`);
    };
    const toggle = () => {
      if (v.paused || v.ended) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else v.pause();
    };
    const jump = (s) => {
      v.currentTime = Math.max(0, Math.min((v.duration || 0) - 0.1, v.currentTime + s));
    };
    const fullscreen = () => {
      const frame = $(".vp-frame");
      if (document.fullscreenElement) document.exitFullscreen();
      else if (frame.requestFullscreen) frame.requestFullscreen().catch(() => {});
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iPhone Safari
    };

    big.addEventListener("click", toggle);
    play.addEventListener("click", toggle);
    v.addEventListener("click", toggle);
    ["play", "pause", "ended"].forEach((e) => v.addEventListener(e, paint));
    ["timeupdate", "loadedmetadata", "durationchange", "seeked"].forEach((e) => v.addEventListener(e, time));
    seek.addEventListener("input", () => {
      dragging = true;
      if (v.duration) v.currentTime = (+seek.value / 1000) * v.duration;
      time();
    });
    seek.addEventListener("change", () => (dragging = false));
    rate.addEventListener("click", () => {
      const r = RATES[(RATES.indexOf(v.playbackRate) + 1) % RATES.length];
      v.playbackRate = r;
      rate.textContent = `${r}×`;
      rate.setAttribute("aria-label", `Playback speed ${r} times`);
    });
    mute.addEventListener("click", () => {
      v.muted = !v.muted;
      mute.innerHTML = v.muted ? ICON.muted : ICON.vol;
      mute.setAttribute("aria-label", v.muted ? "Unmute" : "Mute");
    });
    $(".vp-fs").addEventListener("click", fullscreen);
    fig.addEventListener("keydown", (e) => {
      if (e.target === seek && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return; // the slider moves itself
      if (e.target.closest("button") && (e.key === " " || e.key === "Enter")) return; // buttons press themselves
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") toggle();
      else if (k === "arrowleft") jump(-5);
      else if (k === "arrowright") jump(5);
      else if (k === "m") mute.click();
      else if (k === "f") fullscreen();
      else return;
      e.preventDefault();
      e.stopPropagation(); // the player's own keys (Enter = Continue) stay with the lesson
    });
    paint();
    time();
    if (life)
      life.onCleanup(() => {
        try {
          v.pause();
        } catch (e) {
          /* the page is going away */
        }
      });
    return fig;
  };
})();
