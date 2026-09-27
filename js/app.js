import { siteData } from './site-data.js';
import { fieldNotes, appendNoteParagraph } from './field-notes.js?v=3';
import { createViewerNotes } from './viewer-notes.js';

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
    aboutLinks.hidden = true;
  } else {
    aboutLinks.hidden = false;
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
    }

    card.innerHTML = `
      <div class="project-top">
        <span class="project-index">${escapeHtml(project.index)}</span>
        <span class="project-status">${escapeHtml(project.status)}</span>
      </div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="project-role">${escapeHtml(project.role)}</p>
      <div class="project-tags">${tags}</div>
      ${actions ? `<div class="project-actions">${actions}</div>` : ''}
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
const fieldNoteLinks=document.getElementById('field-note-links');
const fieldNoteDialog=document.getElementById('field-note-dialog');
fieldNotes.forEach((point,index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.textContent=`${index+1}. ${point.title}`;
  button.addEventListener('click',()=>{
    document.getElementById('field-note-title').textContent=point.title;
    const content=document.getElementById('field-note-content');
    content.replaceChildren();
    for(const line of point.body.split('\n'))appendNoteParagraph(content,line,point.highlights);
    fieldNoteDialog.showModal();
  });
  fieldNoteLinks.append(button);
});
document.getElementById('field-note-close').addEventListener('click',()=>fieldNoteDialog.close());
let playLoaded=false;
async function loadPlay(){
  if(playLoaded)return;playLoaded=true;
  try { await import('./play.js?v=11'); }
  catch(error){playLoaded=false;document.getElementById('play-status').textContent=/WebGL context/i.test(String(error))?'이 브라우저에서 3D 플레이를 사용할 수 없습니다.':'플레이 화면을 불러오지 못했습니다. 새로고침해 주세요.';console.error(error)}
}
document.querySelectorAll('a[href="#play"],#play-field,#play-dungeon').forEach(link=>link.addEventListener('pointerdown',loadPlay,{once:true}));
new IntersectionObserver((entries,observer)=>{if(entries.some(e=>e.isIntersecting)){loadPlay();observer.disconnect()}},{rootMargin:'250px'}).observe(document.getElementById('play'));
// The first screen is the briefing. Do not compete with it for network or GPU work.
const viewerNotes=createViewerNotes();
viewerNotes.setModel((siteData.viewerModels||[]).find(model=>model.enabled)?.id);
async function loadSpatialViewer() {
  try {
    const { initSpatialViewer } = await import('./viewer.js?v=3');
    initSpatialViewer(siteData.viewerModels,viewerNotes);
  } catch (error) {
    document.getElementById('viewer-status').textContent = '3D 뷰어를 사용할 수 없습니다. 아래 설명 지점 목록을 열어보세요.';
    viewerNotes.showFallback();
    console.error(error);
  }
}
if (document.getElementById('mission-briefing').hidden) {
  loadSpatialViewer();
} else {
  window.addEventListener('mission-dismissed', loadSpatialViewer, { once: true });
}
