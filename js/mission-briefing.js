(() => {
  const sessionKey = 'level-portfolio-mission-envelope-v3-seen';
  const briefing = document.getElementById('mission-briefing');
  const sealed = document.getElementById('mission-sealed');
  const start = document.getElementById('mission-start');
  const replay = document.getElementById('mission-replay');
  const openedDocument = briefing.querySelector('.mission-open');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let openingTimer = 0;
  // Decode the opening artwork while the visitor is still looking at the seal.
  openedDocument.querySelectorAll('img').forEach(img => img.decode().catch(() => {}));

  function showSealed() {
    window.clearTimeout(openingTimer);
    briefing.hidden = false;
    briefing.classList.remove('is-opening', 'is-opened', 'is-folding');
    briefing.classList.add('is-sealed');
    openedDocument.setAttribute('aria-hidden', 'true');
    sealed.disabled = false;
    start.disabled = false;
    replay.hidden = true;
    document.body.classList.add('mission-lock');
    window.setTimeout(() => sealed.focus(), 0);
  }

  function openBriefing() {
    if (!briefing.classList.contains('is-sealed')) return;
    sealed.disabled = true;
    briefing.classList.remove('is-sealed');
    briefing.classList.add('is-opening');
    openedDocument.setAttribute('aria-hidden', 'false');
    openingTimer = window.setTimeout(() => {
      briefing.classList.remove('is-opening');
      briefing.classList.add('is-opened');
      start.focus();
    }, reduceMotion ? 10 : 320);
  }

  function dismissBriefing() {
    window.clearTimeout(openingTimer);
    sessionStorage.setItem(sessionKey, 'true');
    briefing.hidden = true;
    briefing.classList.remove('is-opening', 'is-opened', 'is-folding');
    document.body.classList.remove('mission-lock');
    replay.hidden = false;
    replay.focus();
    window.dispatchEvent(new Event('mission-dismissed'));
  }

  function foldAndDismiss() {
    if (!briefing.classList.contains('is-opened')) return;
    start.disabled = true;
    briefing.classList.remove('is-opened');
    briefing.classList.add('is-folding');
    openedDocument.setAttribute('aria-hidden', 'true');
    openingTimer = window.setTimeout(dismissBriefing, reduceMotion ? 10 : 390);
  }

  sealed.addEventListener('click', openBriefing);
  start.addEventListener('click', foldAndDismiss);
  replay.addEventListener('click', showSealed);
  window.addEventListener('keydown', event => {
    if (briefing.hidden) return;
    if (event.key === 'Escape') {
      if (briefing.classList.contains('is-opened')) foldAndDismiss();
      else if (briefing.classList.contains('is-sealed')) dismissBriefing();
    }
  });

  if (sessionStorage.getItem(sessionKey) === 'true') {
    briefing.hidden = true;
    replay.hidden = false;
    document.body.classList.remove('mission-lock');
  } else {
    showSealed();
  }
})();
