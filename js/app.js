import { siteData } from './site-data.js?v=4';
import { fieldNotes, appendNoteParagraph } from './field-notes.js?v=5';
import { createViewerNotes } from './viewer-notes.js?v=2';

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
}

function renderProfile() {
  const p = siteData.profile;

  setText('brand-name', p.brandName);
  setText('hero-eyebrow', p.eyebrow);
  setText('hero-summary', p.summary);

  const titleEl = document.getElementById('hero-title');
  titleEl.innerHTML = String(p.title || '').split('\n').map(line => escapeHtml(line).replaceAll('공간을 정량화하고','<span class="hero-phrase"><span class="hero-emphasis">공간을 정량화</span>하고</span>').replaceAll('근거로 설계하는','<span class="hero-phrase"><span class="hero-emphasis">근거로 설계</span>하는</span>')).join('<br>');

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

}

function escapeHtml(value='') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

renderProfile();
const fieldNoteLinks=document.getElementById('field-note-links');
const fieldNoteDialog=document.getElementById('field-note-dialog');
fieldNotes.forEach((point,index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.textContent=`${point.number??index+1}. ${point.title}`;
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
  try { await import('./play.js?v=14'); }
  catch(error){playLoaded=false;document.getElementById('play-status').textContent=/WebGL context/i.test(String(error))?'이 브라우저에서 3D 플레이를 사용할 수 없습니다.':'플레이 화면을 불러오지 못했습니다. 새로고침해 주세요.';console.error(error)}
}
document.querySelectorAll('a[href="#play"],#play-field,#play-dungeon').forEach(link=>link.addEventListener('pointerdown',loadPlay,{once:true}));
new IntersectionObserver((entries,observer)=>{if(entries.some(e=>e.isIntersecting)){loadPlay();observer.disconnect()}},{rootMargin:'250px'}).observe(document.getElementById('play'));
// The first screen is the briefing. Do not compete with it for network or GPU work.
const viewerNotes=createViewerNotes();
viewerNotes.setModel((siteData.viewerModels||[]).find(model=>model.enabled)?.id);
async function loadSpatialViewer() {
  try {
    const { initSpatialViewer } = await import('./viewer.js?v=6');
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

for(const id of ['play-field','play-dungeon'])document.getElementById(id).addEventListener('click',()=>{
  for(const other of ['play-field','play-dungeon']){const button=document.getElementById(other);button.classList.toggle('active',id===other);button.setAttribute('aria-pressed',String(id===other));}
});
