import { siteData } from './site-data.js';
import { initSpatialViewer } from './viewer.js';

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
}

function renderProfile() {
  const p = siteData.profile;

  setText('brand-name', p.brandName);
  setText('hero-eyebrow', p.eyebrow);
  setText('hero-summary', p.summary);
  setText('focus-text', p.focus);
  setText('about-summary', p.about);
  setText('footer-name', p.name && p.name !== 'YOUR NAME' ? p.name : p.brandName);

  const titleEl = document.getElementById('hero-title');
  titleEl.innerHTML = String(p.title || '').split('\n').map(line => escapeHtml(line)).join('<br>');

  const heroActions = document.getElementById('hero-actions');
  heroActions.innerHTML = '';
  for (const link of p.heroActions || []) {
    if (!link.href) continue;
    const a = document.createElement('a');
    a.className = 'link-button' + (link.primary ? ' primary' : '');
    a.href = link.href;
    a.textContent = link.label;
    heroActions.appendChild(a);
  }

  const aboutLinks = document.getElementById('about-links');
  aboutLinks.innerHTML = '';

  if (!(p.links || []).length) {
    const placeholder = document.createElement('div');
    placeholder.style.color = 'var(--muted)';
    placeholder.style.fontSize = '12px';
    placeholder.style.lineHeight = '1.7';
    placeholder.textContent = 'site-data.js에서 Email / Resume / GitHub 링크를 추가하면 이 영역에 자동 표시됨.';
    aboutLinks.appendChild(placeholder);
  } else {
    for (const link of p.links) {
      const a = document.createElement('a');
      a.href = link.href;
      a.target = link.href.startsWith('http') ? '_blank' : '';
      a.rel = link.href.startsWith('http') ? 'noopener noreferrer' : '';
      a.innerHTML = `<span>${escapeHtml(link.label)}</span><span>↗</span>`;
      aboutLinks.appendChild(a);
    }
  }
}

function renderProjects() {
  const grid = document.getElementById('portfolio-grid');
  grid.innerHTML = '';

  for (const project of siteData.projects || []) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const tags = (project.tags || [])
      .map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`)
      .join('');

    let actions = '';
    if ((project.links || []).length) {
      actions = project.links.map(link =>
        `<a class="project-link${link.primary ? ' primary' : ''}" href="${escapeAttr(link.href)}">${escapeHtml(link.label)}</a>`
      ).join('');
    } else {
      actions = `<span class="project-link disabled">LINKS TO BE ADDED</span>`;
    }

    card.innerHTML = `
      <div class="project-top">
        <span class="project-index">${escapeHtml(project.index)}</span>
        <span class="project-status">${escapeHtml(project.status)}</span>
      </div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="project-role">${escapeHtml(project.role)}</p>
      <div class="project-tags">${tags}</div>
      <div class="project-actions">${actions}</div>
    `;

    grid.appendChild(card);
  }
}

function escapeHtml(value='') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value='') {
  return escapeHtml(value);
}

renderProfile();
renderProjects();
initSpatialViewer(siteData.viewerModels);
