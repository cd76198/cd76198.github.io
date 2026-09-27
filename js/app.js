import { siteData } from './site-data.js';

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
    } else {
      actions = `<span class="project-link disabled">별도 제출한 PDF 참고</span>`;
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
const regionInfo={field:['외부 필드','순례자 계단과 토벌대의 임시 진입로를 따라 성당에 접근합니다. 관찰 지점에서는 색 장치의 단서를 확인할 수 있습니다.'],bridge:['약한 다리','다리 끝을 지난 상태에서 8회 공격하면 다리의 충돌이 사라집니다. 계단 장치의 레버로 복구할 수 있습니다.'],door:['중간보스 문','문 가까이에서 E를 5초 유지하면 열립니다. 피격이나 키 해제 시 진행량이 초기화됩니다.'],stairs:['계단과 레버','중간보스 처치 후 차단막이 자동으로 열립니다. 레버를 누르면 무너진 다리만 복구됩니다.'],puzzle:['색 순서 장치','파랑 → 빨강 → 초록 순서입니다. 오답일 때 적 3명이 등장하며, 모두 처치하거나 60초가 지나야 다시 시도할 수 있습니다.']};
const regionDialog=document.getElementById('region-dialog');
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
  const [title,description]=regionInfo[button.dataset.region];
  document.getElementById('region-title').textContent=title;
  document.getElementById('region-description').textContent=description;
  document.getElementById('region-image').hidden=button.dataset.region!=='field';
  regionDialog.showModal();
}));
document.getElementById('region-close').addEventListener('click',()=>regionDialog.close());
let playLoaded=false;
async function loadPlay(){
  if(playLoaded)return;playLoaded=true;
  try { await import('./play.js?v=2'); }
  catch(error){playLoaded=false;document.getElementById('play-status').textContent=/WebGL context/i.test(String(error))?'이 브라우저에서 WebGL을 사용할 수 없습니다. 오른쪽 지역 버튼으로 내용을 확인하세요.':'플레이 화면을 불러오지 못했습니다. 새로고침해 주세요.';console.error(error)}
}
document.querySelectorAll('a[href="#play"],#play-field,#play-dungeon').forEach(link=>link.addEventListener('pointerdown',loadPlay,{once:true}));
new IntersectionObserver((entries,observer)=>{if(entries.some(e=>e.isIntersecting)){loadPlay();observer.disconnect()}},{rootMargin:'250px'}).observe(document.getElementById('play'));
// The first screen is the briefing. Do not compete with it for network or GPU work.
async function loadSpatialViewer() {
  try {
    const { initSpatialViewer } = await import('./viewer.js');
    initSpatialViewer(siteData.viewerModels);
  } catch (error) {
    document.getElementById('viewer-status').textContent = '3D 뷰어를 불러오지 못했습니다. 새로고침해 주세요.';
    console.error(error);
  }
}
if (document.getElementById('mission-briefing').hidden) {
  loadSpatialViewer();
} else {
  window.addEventListener('mission-dismissed', loadSpatialViewer, { once: true });
}
