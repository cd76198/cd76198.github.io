const selector = document.getElementById('page-select');
selector.addEventListener('change', () => {
  const page = document.getElementById(selector.value);
  if (!page) return;
  page.scrollIntoView({ behavior: 'instant', block: 'start' });
  history.replaceState(null, '', `#${selector.value}`);
});
const pages = [...document.querySelectorAll('.document-page')];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting);
  if (visible.length) selector.value = visible[0].target.id;
}, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
pages.forEach(page => observer.observe(page));
