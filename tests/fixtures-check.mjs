import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {CharacterMovement} from '../js/character-movement.js';
function box(w,h,d,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d));m.position.set(x,y,z);m.updateMatrixWorld(true);return m;}
function travel(m,start,target){let p=new THREE.Vector3(...start);p=m.settle(p,.5)??p;for(let i=0;i<250;i++){if(p.x>=target-.06)return p;const next=m.tryMove(p,.05,0);if(!next)return p;p=next;}return p;}
for(const h of [.3,.4,.45,.6,1.2]){const m=new CharacterMovement([box(20,.2,8,0,-.1,0),box(2,h,4,2,h/2,0)]);const p=travel(m,[0,.9,0],3);console.log('step',h,p.toArray());assert.equal(p.x>2.8,h<=.45);}
// Thin walls cannot be crossed, and dynamic collision removal opens the passage.
const wall=box(.03,3,4,1,1.5,0),floor=box(20,.2,8,0,-.1,0),m=new CharacterMovement([floor,wall]);assert(travel(m,[0,.9,0],2).x<1);wall.visible=false;assert(travel(m,[0,.9,0],2).x>1.9);
console.log('PASS step limits, tall walls and dynamic visibility');
