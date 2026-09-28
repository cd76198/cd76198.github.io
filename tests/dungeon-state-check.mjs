import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {CharacterMovement,characterSettings} from '../js/character-movement.js';
import {fieldNotes} from '../js/field-notes.js';
import {dungeonNotes} from '../js/dungeon-notes.js';
import {loadCollision} from './load-collision.mjs';
const element=()=>({textContent:'',hidden:false,clientWidth:900,clientHeight:600,addEventListener(){},replaceChildren(){},append(){},matches(){return true},scrollIntoView(){}});
const elements=new Map(),document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},addEventListener(){},querySelectorAll(){return []},createElement:element};
const context=vm.createContext({THREE:{...THREE,WebGLRenderer:class{setPixelRatio(){}setSize(){}render(){}}},CharacterMovement,characterSettings,fieldNotes,appendNoteParagraph(){},markerTexture(){},GLTFLoader:class{},window:{addEventListener(){}},document,devicePixelRatio:1,performance,requestAnimationFrame(){},ResizeObserver:class{observe(){}},setTimeout(){},console});
const source=fs.readFileSync(new URL('../js/play.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
vm.runInContext(source,context);
context.testMetadata=JSON.parse(fs.readFileSync(new URL('../assets/data/play-map.json',import.meta.url),'utf8'));
context.testCollision=new THREE.Group();for(const mesh of loadCollision('dungeon'))context.testCollision.add(mesh);
vm.runInContext("metadata=testMetadata;map='dungeon';collision=testCollision;visual=testCollision.clone(true);solids=[];collision.traverse(o=>{if(o.isMesh)solids.push(o)});movement=new CharacterMovement(solids);enemyMovement=new CharacterMovement(solids,{radius:.4,halfHeight:.8});restartState();running=true;",context);
assert.equal(vm.runInContext('enemies.length',context),0,'Boss must not exist before the door opens');
vm.runInContext("game.chaserStopped=true;position.set(61,3.3,11);held.add('e');for(let i=0;i<101;i++)update(.05);held.clear();",context);
assert.equal(vm.runInContext('game.door',context),true);
assert.equal(vm.runInContext("enemies.filter(e=>e.kind==='boss').length",context),1);
assert(vm.runInContext("enemies.find(e=>e.kind==='boss').mesh.position.x>69.9",context),'Boss should spawn in the room, not at the door');
for(const color of ['Blue','Red','Green'])vm.runInContext(`position.set(53.75,-8.7,metadata.maps.dungeon.objects.P02_ColorPad_${color}.position[2]);interact();`,context);
assert.equal(vm.runInContext('game.finalDoor',context),true);
assert.equal(vm.runInContext('game.wrong',context),0);
for(const name of ['MCP_TEST_Candidate1_BigDoor','MCP_TEST_Candidate1_BigDoor_Arch']){
 context.actorName=name;
 assert.equal(vm.runInContext('object(actorName).visible',context),false);
 assert.equal(vm.runInContext('solids.filter(o=>o.userData.ue_actor_name===actorName).every(o=>!o.visible)',context),true);
}
// Opening both actors must clear an actual capsule route through the doorway.
assert(vm.runInContext(`(()=>{let p=new THREE.Vector3(56,-8.7,1.5);p=movement.settle(p,.5)??p;for(let i=0;i<160&&p.x<63.4;i++){const next=movement.tryMove(p,.05,0);if(!next)return false;p=next;}return p.x>=63.4;})()`,context));
vm.runInContext('restartState()',context);
assert.equal(vm.runInContext('enemies.length',context),0);
assert.equal(vm.runInContext("object('MCP_TEST_Candidate1_BigDoor').visible&&object('MCP_TEST_Candidate1_BigDoor_Arch').visible",context),true);
assert.deepEqual(fieldNotes.map(n=>n.number),[1,2,3,4,5,6,7,8,9]);
assert.deepEqual(fieldNotes.map(n=>n.title),['시작','바닥타일','호수','천막','순례자의 계단','차단된 옛 길','틈으로 보는 힌트','합류지점','최종진입']);
assert.equal(dungeonNotes[5].x,56.5);
console.log('PASS boss spawn, nearest colour input, both door parts/collisions, reset and note order');
