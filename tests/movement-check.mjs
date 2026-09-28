import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { CharacterMovement } from '../js/character-movement.js';
import { loadCollision } from './load-collision.mjs';
const meshes=loadCollision(),movement=new CharacterMovement(meshes);
function walk(start,targets){
 let p=new THREE.Vector3(...start);p=movement.settle(p,.5)??p;
 for(const target of targets){
  let reached=false;
  for(let i=0;i<2000;i++){
   const dx=target[0]-p.x,dz=target[1]-p.z,d=Math.hypot(dx,dz);if(d<.07){reached=true;break;}
   const sx=dx/d*Math.min(d,.08),sz=dz/d*Math.min(d,.08);
   const next=movement.tryMove(p,sx,sz)??movement.tryMove(p,sx,0)??movement.tryMove(p,0,sz);
   if(!next){console.log('BLOCK',p.toArray(),target,movement.contacts(p).map(e=>e.mesh.userData.ue_actor_label));break;}p=next;
  }
  if(!reached)return false;
 }
 console.log('PASS',p.toArray());return true;
}
assert(walk([157,22.5,-18],[[160,-22],[165,-30],[170,-39],[171,-40],[190,-40],[190,-30]]));
assert(walk([190,30.9,-30],[[190,-40],[171,-40],[170,-39],[165,-30],[160,-22],[157,-18]]));
assert(walk([155,16.5337,1],[[161.5,1],[162,-3],[161,-6],[159,-10],[158,-14],[157,-18],[160,-22],[165,-30],[170,-39]]));
const dungeonMeshes=loadCollision('dungeon');
for(const mesh of dungeonMeshes)if(['MCP_TEST_TransformStair_Blocker','MCP_TEST_MidBossEnemy','MCP_TEST_MidBossInteraction'].includes(mesh.userData.ue_actor_name))mesh.visible=false;
const dungeon=new CharacterMovement(dungeonMeshes);
let d=new THREE.Vector3(84,3.3,11);d=dungeon.settle(d,.5)??d;
for(const target of [73.6,84]){
 let arrived=false;
 for(let i=0;i<300;i++){if(Math.abs(d.x-target)<.08){arrived=true;break;}const next=dungeon.tryMove(d,Math.sign(target-d.x)*.06,0);if(!next){console.log('DUNGEON BLOCK',d.toArray());break;}d=next;}
 if(!arrived)throw new Error('Dungeon staircase regression');console.log('PASS dungeon stairs',d.toArray());
}
