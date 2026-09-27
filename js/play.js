import * as THREE from 'https://esm.sh/three@0.180.0';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const root = document.getElementById('play');
const canvas = document.getElementById('play-canvas');
const status = document.getElementById('play-status');
const prompt = document.getElementById('play-prompt');
const log = document.getElementById('play-log');
const information = document.getElementById('play-information');
const hpLabel = document.getElementById('play-hp');
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11171b);
scene.add(new THREE.HemisphereLight(0xffffff,0x68717c,2.2));
const sun = new THREE.DirectionalLight(0xffe4b7,2.1);
sun.position.set(25,70,35); scene.add(sun);
const camera = new THREE.PerspectiveCamera(27,1,.05,900);
const player = new THREE.Mesh(new THREE.CapsuleGeometry(.35,1.1,4,8),new THREE.MeshStandardMaterial({color:0xf4c16f,emissive:0x482a06}));
scene.add(player);
const markerGroup = new THREE.Group(); scene.add(markerGroup);
const ray = new THREE.Raycaster();
const down = new THREE.Vector3(0,-1,0);
let metadata, map = 'field', visual, collision, solids = [], surfaces = [], running = false;
let position = new THREE.Vector3(), lastSafe = new THREE.Vector3(), frame = performance.now(), held = new Set();
let game = {}, enemies = [], introSeen = new Set(), pulse = 0, interaction = null;
const points = {
  field:[{x:155,z:1,title:'출발지',body:'고정 쿼터뷰로 길과 랜드마크를 확인하는 필드 시작점입니다.'},{x:184.6,z:24.8,title:'토벌대 임시 진지',body:'외부 조사대가 설치한 거점과 성당 접근 동선을 살펴보세요.'},{x:215,z:0,title:'성당 진입',body:'입구를 통과하면 보수된 던전 v02로 전환됩니다.'}],
  dungeon:[{x:0,z:-12,title:'던전 진입',body:'선발대의 경로를 따라 다리와 문, 계단, 색 순서 장치를 조사합니다.'},{x:52.5,z:11,title:'약한 다리',body:'공격 8회로 다리를 파괴할 수 있으며, 레버에서 복구합니다.'},{x:63,z:11,title:'중간보스 문',body:'문 근처에서 E를 5초 동안 눌러 개방합니다.'},{x:79,z:11,title:'계단과 레버',body:'중간보스 처치 후 장치가 자동 가동됩니다. 레버의 E는 다리 복구입니다.'},{x:53.75,z:1.5,title:'색 순서 장치',body:'파랑 → 빨강 → 초록 순서로 누르세요. 오답이면 적 3명이 나타납니다.'}]
};
function say(message){log.textContent=message;}
function setInfo(title,body){information.innerHTML='';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=body;information.append(h,p);}
function object(name){let found=null; visual?.traverse(o=>{if(!found && (o.userData?.ue_actor_name===name || o.name===name))found=o});return found;}
function matching(prefix){let nodes=[];visual?.traverse(o=>{if(o.userData?.ue_actor_name?.startsWith(prefix)||o.name.startsWith(prefix))nodes.push(o)});return nodes.filter(o=>!nodes.some(other=>other!==o && other.getObjectById(o.id)));}
function hide(name,visible){const o=object(name);if(o)o.visible=visible;collision?.traverse(c=>{if(c.userData?.ue_actor_name===name || c.name===name)c.visible=visible});}
function restartState(){
  enemies.forEach(e=>scene.remove(e.mesh));enemies=[];
  game={hp:100,bridgeHits:0,bridgeBroken:false,door:false,doorHold:0,bossDead:false,lever:false,stairTimer:0,stairs:false,puzzle:0,wrong:0,penalty:0,finalDoor:false,finished:false,chaserStopped:false,attackTime:0,respawn:map==='field'?new THREE.Vector3(...metadata.maps.field.spawn):new THREE.Vector3(...metadata.maps.dungeon.spawn)};
  hpLabel.textContent='HP 100';
  if(map==='dungeon'){
    ['P02_BridgeWeakSection_Deck','P02_BridgeWeakSection_RailS','P02_BridgeWeakSection_RailN','P02_MidBossDoor','MCP_TEST_TransformStair_Blocker','MCP_TEST_Candidate1_BigDoor'].forEach(n=>hide(n,true));
    ['MCP_TEST_TransformStair_Lever','MCP_TEST_TransformStair_LeverHandle'].forEach(n=>hide(n,false));
    const boss=metadata.maps.dungeon.objects.MCP_TEST_MidBossEnemy.position;
    spawnEnemy('boss',boss,100,1.2,0);
  }
}
function spawnEnemy(kind,coords,hp,speed,damage){const mat=new THREE.MeshStandardMaterial({color:kind==='boss'?0x9c548f:0xc34b42,emissive:kind==='boss'?0x381339:0x42120c});const mesh=new THREE.Mesh(new THREE.BoxGeometry(.8,1.6,.8),mat);mesh.position.set(coords[0],coords[1]+.8,coords[2]);scene.add(mesh);enemies.push({kind,mesh,hp,speed,damage,attackAt:0});}
async function openMap(which){
  if(!metadata) metadata=await fetch('./assets/data/play-map.json').then(r=>r.json());
  running=false;status.textContent=which==='field'?'필드 로딩 중…':'던전 로딩 중…';status.hidden=false;
  const [rendered,physical]=await Promise.all([loader.loadAsync('./assets/models/'+which+'.glb'),loader.loadAsync('./assets/models/'+which+'-collision.glb')]);
  if(visual)scene.remove(visual);if(collision)scene.remove(collision);
  map=which;visual=rendered.scene;collision=physical.scene;scene.add(visual);
  visual.traverse(o=>{if(o.userData?.initially_hidden)o.visible=false});
  collision.updateMatrixWorld(true);surfaces=[];solids=[];
  collision.traverse(o=>{if(o.isMesh){o.material.side=THREE.DoubleSide;surfaces.push(o);solids.push(o)}});
  position.set(...metadata.maps[map].spawn);lastSafe.copy(position);player.position.copy(position);
  camera.fov=2*THREE.MathUtils.radToDeg(Math.atan(Math.tan(Math.PI/8)/camera.aspect));camera.updateProjectionMatrix();
  markerGroup.clear();points[map].forEach((p,i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),new THREE.MeshStandardMaterial({color:0xe5b66b,emissive:0x81501e,emissiveIntensity:.7}));m.position.set(p.x,position.y+1,p.z);m.userData.index=i;markerGroup.add(m)});
  restartState();setInfo(map==='field'?'외부 필드':'던전 내부',map==='field'?'WASD 이동 · 마커 근처 E로 지역 설명 · 입구에서 던전 전환':'WASD 이동 · 마우스 클릭 또는 J 공격 · E 상호작용 · R 다시 시작');
  status.hidden=true;running=true;say(map==='field'?'성당 입구를 찾아 이동하세요.':'던전의 흔적과 장치를 조사하세요.');root.scrollIntoView({behavior:'smooth',block:'start'});
}
function active(mesh){for(let o=mesh;o;o=o.parent)if(!o.visible)return false;return true}
function floorAt(x,z,fromY){ray.set(new THREE.Vector3(x,fromY+.6,z),down);ray.far=3;let hits=ray.intersectObjects(surfaces.filter(active),false);for(const hit of hits){const n=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld);if(n?.y>=.71 && hit.point.y<=fromY+.45)return hit.point.y}return null}
function blocked(start,delta){const d=delta.clone().normalize();for(const height of [-.45,.05,.55]){ray.set(new THREE.Vector3(start.x,start.y+height,start.z),d);ray.far=delta.length()+.35;for(const hit of ray.intersectObjects(solids.filter(active),false)){const n=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld);if(n && Math.abs(n.y)<.71 && hit.distance<ray.far)return true}}return false}
function moveStep(dx,dz){const d=new THREE.Vector3(dx,0,dz);if(blocked(position,d))return;const x=position.x+dx,z=position.z+dz;const floor=floorAt(x,z,position.y-.9);if(floor===null)return;position.set(x,floor+.9,z);lastSafe.copy(position)}
function distance(x,z){return Math.hypot(position.x-x,position.z-z)}
function objDist(name){const v=metadata.maps.dungeon.objects[name]?.position;return v?distance(v[0],v[2]):Infinity}
function spawnChaser(){const p=metadata.maps.dungeon.objects.P02_MidBossEnemySpawn.position;spawnEnemy('chaser',p,34,4.1,10);say('추격자가 나타났습니다.');}
function doAttack(){if(!running||game.finished||performance.now()/1000<game.attackTime||held.has('e'))return;game.attackTime=performance.now()/1000+.35;
  const candidates=enemies.filter(e=>Math.hypot(e.mesh.position.x-position.x,e.mesh.position.z-position.z)<3.1);
  for(const e of candidates){e.hp-=34;e.mesh.material.emissive.setHex(0xffbb60);setTimeout(()=>e.mesh.material.emissive.setHex(0x381339),120);if(e.hp<=0){scene.remove(e.mesh);enemies.splice(enemies.indexOf(e),1);if(e.kind==='boss'){game.bossDead=true;game.lever=true;game.stairTimer=2;say('중간보스를 처치했습니다. 장치가 곧 가동됩니다.')}else say('적을 처치했습니다.')}}
  if(objDist('P02_BridgeWeakSection_Deck')<3.5 && position.x>53 && !game.bridgeBroken){game.bridgeHits++;say('약한 다리 타격 '+game.bridgeHits+'/8');if(game.bridgeHits>=8){game.bridgeBroken=true;['P02_BridgeWeakSection_Deck','P02_BridgeWeakSection_RailS','P02_BridgeWeakSection_RailN'].forEach(n=>hide(n,false));game.chaserStopped=true;enemies.filter(e=>e.kind==='chaser').forEach(e=>{scene.remove(e.mesh);enemies.splice(enemies.indexOf(e),1)});game.respawn.set(61,4.3,11);say('다리가 무너졌습니다. 추격이 끝났습니다.')}}
}
function interact(){if(!running||game.finished)return;
  const near=points[map].find(p=>distance(p.x,p.z)<4);if(near){setInfo(near.title,near.body);if(map==='field' && near.x===215 && position.x>215.4){openMap('dungeon');return}}
  if(map!=='dungeon')return;
  if(game.penalty>0){say('페널티가 끝나면 장치를 다시 조작할 수 있습니다.');return}
  if(game.lever && objDist('MCP_TEST_TransformStair_Blocker')<4){game.bridgeBroken=false;game.bridgeHits=0;['P02_BridgeWeakSection_Deck','P02_BridgeWeakSection_RailS','P02_BridgeWeakSection_RailN'].forEach(n=>hide(n,true));say('레버로 다리를 복구했습니다.');return}
  for(const [name,color] of [['P02_ColorPad_Blue','파랑'],['P02_ColorPad_Red','빨강'],['P02_ColorPad_Green','초록']]){
    if(objDist(name)>2.2||game.finalDoor)continue;
    if(['파랑','빨강','초록'][game.puzzle]===color){game.puzzle++;say('입력 '+game.puzzle+'/3 · '+color);if(game.puzzle===3){game.finalDoor=true;hide('MCP_TEST_Candidate1_BigDoor',false);say('최종문이 열렸습니다. 출구로 이동하세요.')}}else{game.puzzle=0;game.wrong++;game.penalty=60;['NE','E','SE'].forEach(k=>spawnEnemy('penalty',metadata.maps.dungeon.objects['P02_WrongAnswerSpawn_'+k].position,34,4.1,10));say('잘못된 순서입니다. 적 3명이 나타났습니다.')}return;
  }
}
function update(dt){
  const speed=4*dt;let dx=(held.has('w')?1:0)-(held.has('s')?1:0),dz=(held.has('d')?1:0)-(held.has('a')?1:0);const mag=Math.hypot(dx,dz)||1;dx*=speed/mag;dz*=speed/mag;
  if(dx||dz){moveStep(dx,0);moveStep(0,dz)}player.position.copy(position);
  const o=metadata.maps[map].cameraOffset;camera.position.set(position.x+o[0],position.y+o[1],position.z+o[2]);camera.lookAt(position);
  pulse+=dt;markerGroup.children.forEach((m,i)=>{const p=points[map][i];m.position.y=(floorAt(p.x,p.z,position.y)??position.y)+1.2+Math.sin(pulse*2+i)*.17});
  const close=points[map].find(p=>distance(p.x,p.z)<4);prompt.textContent=close?'E · '+close.title:map==='dungeon'?'J / 클릭 · 공격     E · 조작':'WASD · 이동';
  if(map==='field'){const t=metadata.transition.bounds_ue_cm;if(position.x>t.x_open[0]/100 && position.x<t.x_open[1]/100 && Math.abs(position.z)<4.8 && position.y>t.z_open[0]/100-1 && position.y<t.z_open[1]/100+1)openMap('dungeon');return}
  if(!game.chaserStopped && position.x>=46 && !enemies.some(e=>e.kind==='chaser'))spawnChaser();
  if(!game.door && objDist('P02_MidBossDoor')<2.5 && held.has('e')){game.doorHold+=dt;prompt.textContent='문 개방 '+Math.floor(game.doorHold/5*100)+'% · E 유지';if(game.doorHold>=5){game.door=true;hide('P02_MidBossDoor',false);game.respawn.set(61,4.3,11);say('중간보스 문이 열렸습니다.')}}else game.doorHold=0;
  if(game.stairTimer>0){game.stairTimer-=dt;if(game.stairTimer<=0){game.stairs=true;hide('MCP_TEST_TransformStair_Blocker',false);say('계단 차단막이 열렸습니다.')}}
  if(game.penalty>0){game.penalty-=dt;if(game.penalty<=0 || !enemies.some(e=>e.kind==='penalty')){game.penalty=0;enemies.filter(e=>e.kind==='penalty').forEach(e=>{scene.remove(e.mesh);enemies.splice(enemies.indexOf(e),1)});say('색 순서 장치를 다시 조작할 수 있습니다.')}}
  for(const e of enemies){const vx=position.x-e.mesh.position.x,vz=position.z-e.mesh.position.z,dist=Math.hypot(vx,vz);if(dist>1.5 && dist<22){e.mesh.position.x+=vx/dist*e.speed*dt;e.mesh.position.z+=vz/dist*e.speed*dt;const y=floorAt(e.mesh.position.x,e.mesh.position.z,e.mesh.position.y);if(y!==null)e.mesh.position.y=y+.8}else if(dist<=1.5 && e.damage && performance.now()/1000>e.attackAt){e.attackAt=performance.now()/1000+1.5;game.hp-=e.damage;hpLabel.textContent='HP '+Math.max(0,game.hp);if(game.hp<=0)respawn()}}
  if(position.y< -16.6)respawn();
  if(game.finalDoor && objDist('P02_EndTrigger')<2.5){game.finished=true;setInfo('조사 완료','성당 내부의 주요 장치와 경로 조사를 마쳤습니다. 다른 지역의 설명도 확인해 보세요.');say('조사 완료 · R로 다시 시작');}
}
function respawn(){game.hp=100;hpLabel.textContent='HP 100';position.copy(game.respawn);say('다시 시작 지점으로 이동했습니다. 기믹 진행 상태는 유지됩니다.');}
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-frame)/1000,.05);frame=now;if(running)update(dt);renderer.render(scene,camera)}requestAnimationFrame(loop);
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=2*THREE.MathUtils.radToDeg(Math.atan(Math.tan(Math.PI/8)/camera.aspect));camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();
document.getElementById('play-field').addEventListener('click',()=>openMap('field').catch(e=>{console.error(e);status.hidden=false;status.textContent='필드 로딩 오류'}));
document.getElementById('play-dungeon').addEventListener('click',()=>openMap('dungeon').catch(e=>{console.error(e);status.hidden=false;status.textContent='던전 로딩 오류'}));
document.getElementById('play-reset').addEventListener('click',()=>{if(running)openMap(map)});
document.addEventListener('keydown',e=>{if(!root.matches(':hover') && document.activeElement!==canvas)return;const k=e.key.toLowerCase();if('wasdejr'.includes(k)){e.preventDefault();held.add(k)}if(k==='j'&&!e.repeat)doAttack();if(k==='e'&&!e.repeat)interact();if(k==='r'&&!e.repeat)openMap(map)});
document.addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>held.clear());canvas.addEventListener('click',()=>{canvas.focus();doAttack()});
const regionInfo={field:['외부 필드','순례자 계단과 토벌대의 임시 진입로를 따라 성당에 접근합니다. 진입 지점에서 던전으로 전환됩니다.'],bridge:['약한 다리','다리 끝을 지난 상태에서 8회 공격하면 다리의 충돌이 사라집니다. 계단 장치의 레버로 복구할 수 있습니다.'],door:['중간보스 문','문 가까이에서 E를 5초 유지하면 열립니다. 피격이나 키 해제 시 진행량이 초기화됩니다.'],stairs:['계단과 레버','중간보스 처치 후 차단막이 자동으로 열립니다. 레버를 누르면 무너진 다리만 복구됩니다.'],puzzle:['색 순서 장치','파랑 → 빨강 → 초록 순서입니다. 오답일 때 적 3명이 등장하며, 모두 처치하거나 60초가 지나야 다시 시도할 수 있습니다.']};
document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>setInfo(...regionInfo[b.dataset.region])));
