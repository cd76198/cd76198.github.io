(() => {
  const sessionKey = 'level-portfolio-mission-briefing-seen';
  const briefing = document.getElementById('mission-briefing');
  const sealed = document.getElementById('mission-sealed');
  const skip = document.getElementById('mission-skip');
  const start = document.getElementById('mission-start');
  const replay = document.getElementById('mission-replay');
  const openedDocument = briefing.querySelector('.mission-open');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let openingTimer = 0;

  function showSealed() {
    window.clearTimeout(openingTimer);
    briefing.hidden = false;
    briefing.classList.remove('is-opening', 'is-opened');
    briefing.classList.add('is-sealed');
    openedDocument.setAttribute('aria-hidden', 'true');
    sealed.disabled = false;
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
    }, reduceMotion ? 10 : 760);
  }

  function dismissBriefing() {
    window.clearTimeout(openingTimer);
    sessionStorage.setItem(sessionKey, 'true');
    briefing.hidden = true;
    briefing.classList.remove('is-opening', 'is-opened');
    document.body.classList.remove('mission-lock');
    replay.hidden = false;
    replay.focus();
  }

  sealed.addEventListener('click', openBriefing);
  skip.addEventListener('click', dismissBriefing);
  start.addEventListener('click', dismissBriefing);
  replay.addEventListener('click', showSealed);
  window.addEventListener('keydown', event => {
    if (briefing.hidden) return;
    if (event.key === 'Escape') dismissBriefing();
  });

  if (sessionStorage.getItem(sessionKey) === 'true') {
    briefing.hidden = true;
    replay.hidden = false;
    document.body.classList.remove('mission-lock');
  } else {
    showSealed();
  }
})();
