import * as THREE from '../vendor/three.module.js';

// Exported CharacterMovement settings, in metres. Keep the capsule and step
// limit identical on both maps; actor names must not grant extra climbing height.
export const characterSettings = Object.freeze({radius:.35,halfHeight:.9,maxStep:.45,walkableNormal:.710000038,speed:4});
const skin=.002, cellSize=4;
const v=()=>new THREE.Vector3();
const ab=v(),normal=v(),closest=v(),edge=v(),difference=v(),axisPoint=v(),edgePoint=v();
function active(mesh){for(let o=mesh;o;o=o.parent)if(!o.visible)return false;return true}

// Squared distance from a vertical capsule axis to a triangle, including edges.
function capsuleDistanceSq(low,high,triangle){
  triangle.getNormal(normal);
  const denom=normal.y*(high.y-low.y);
  if(Math.abs(denom)>1e-12){
    const t=normal.dot(difference.subVectors(triangle.a,low))/denom;
    if(t>=0&&t<=1){closest.copy(low);closest.y+=t*(high.y-low.y);if(triangle.containsPoint(closest))return 0;}
  }
  let best=Math.min(triangle.closestPointToPoint(low,closest).distanceToSquared(low),triangle.closestPointToPoint(high,closest).distanceToSquared(high));
  // Closest points between two segments (capsule axis and each triangle edge).
  for(const [a,b] of [[triangle.a,triangle.b],[triangle.b,triangle.c],[triangle.c,triangle.a]]){
    ab.subVectors(high,low);edge.subVectors(b,a);difference.subVectors(low,a);
    const aa=ab.lengthSq(),ee=edge.lengthSq(),bb=ab.dot(edge),cc=ab.dot(difference),ff=edge.dot(difference),den=aa*ee-bb*bb;
    let s=den>1e-12?THREE.MathUtils.clamp((bb*ff-cc*ee)/den,0,1):0;
    let t=ee>1e-12?(bb*s+ff)/ee:0;
    if(t<0){t=0;s=THREE.MathUtils.clamp(-cc/aa,0,1)}else if(t>1){t=1;s=THREE.MathUtils.clamp((bb-cc)/aa,0,1)}
    axisPoint.copy(low).addScaledVector(ab,s);edgePoint.copy(a).addScaledVector(edge,t);
    best=Math.min(best,axisPoint.distanceToSquared(edgePoint));
  }
  return best;
}

export class CharacterMovement {
  constructor(meshes,settings={}){
    this.settings={...characterSettings,...settings};this.grid=new Map();
    for(const mesh of meshes){
      const geometry=mesh.geometry,p=geometry.attributes.position,index=geometry.index;
      for(let i=0;i<(index?.count??p.count);i+=3){
        const vertices=[0,1,2].map(k=>v().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld));
        const triangle=new THREE.Triangle(...vertices),bounds=new THREE.Box3().setFromPoints(vertices);
        const entry={mesh,triangle,bounds,normal:triangle.getNormal(v())};
        for(let x=Math.floor(bounds.min.x/cellSize);x<=Math.floor(bounds.max.x/cellSize);x++)for(let z=Math.floor(bounds.min.z/cellSize);z<=Math.floor(bounds.max.z/cellSize);z++){
          const key=x+','+z;if(!this.grid.has(key))this.grid.set(key,[]);this.grid.get(key).push(entry);
        }
      }
    }
  }
  nearby(position){
    const radius=this.settings.radius,result=new Set();
    for(let x=Math.floor((position.x-radius)/cellSize);x<=Math.floor((position.x+radius)/cellSize);x++)for(let z=Math.floor((position.z-radius)/cellSize);z<=Math.floor((position.z+radius)/cellSize);z++)for(const e of this.grid.get(x+','+z)??[])result.add(e);
    return result;
  }
  contacts(position){
    const {radius,halfHeight}=this.settings,low=position.clone(),high=position.clone();low.y-=halfHeight-radius;high.y+=halfHeight-radius;
    const contacts=[];
    for(const entry of this.nearby(position)){
      const b=entry.bounds;
      if(!active(entry.mesh)||b.min.y>position.y+halfHeight||b.max.y<position.y-halfHeight||b.min.x>position.x+radius||b.max.x<position.x-radius||b.min.z>position.z+radius||b.max.z<position.z-radius)continue;
      if(capsuleDistanceSq(low,high,entry.triangle)<(radius-skin)**2)contacts.push(entry);
    }
    return contacts;
  }
  clearSweep(start,end){
    const steps=Math.max(1,Math.ceil(start.distanceTo(end)/.025));
    for(let i=1;i<=steps;i++)if(this.contacts(start.clone().lerp(end,i/steps)).length)return false;
    return true;
  }
  settle(start,drop){
    let clear=start.clone();
    for(let distance=.025;distance<=drop+.025;distance+=.025){
      const probe=start.clone();probe.y-=Math.min(distance,drop);
      if(this.contacts(probe).length){
        let collision=probe;
        for(let i=0;i<10;i++){const mid=clear.clone().lerp(collision,.5);if(this.contacts(mid).length)collision=mid;else clear=mid;}
        const contacts=this.contacts(collision);
        if(!contacts.some(e=>e.normal.y>=this.settings.walkableNormal))return null;
        return clear;
      }
      clear=probe;if(distance>=drop)break;
    }
    return null;
  }
  tryMove(position,dx,dz){
    if(Math.hypot(dx,dz)<1e-9)return null;
    const target=position.clone().add(new THREE.Vector3(dx,0,dz));
    if(this.clearSweep(position,target)){
      const grounded=this.settle(target,this.settings.maxStep+.05);
      if(grounded)return grounded;
    }
    // UE-style step sequence: sweep up, forward, then down onto walkable support.
    // The downward capsule sweep catches a tread edge before the centre crosses it.
    const raised=position.clone();
    for(let lift=.025;lift<=this.settings.maxStep+1e-8;lift+=.025){
      const probe=position.clone();probe.y+=Math.min(lift,this.settings.maxStep);
      if(this.contacts(probe).length)break;
      raised.copy(probe);
    }
    if(raised.y-position.y<skin)return null;
    const forward=raised.clone().add(new THREE.Vector3(dx,0,dz));
    if(!this.clearSweep(raised,forward))return null;
    const grounded=this.settle(forward,this.settings.maxStep*2+.05);
    if(!grounded||grounded.y-position.y>this.settings.maxStep+skin)return null;
    // A rounded capsule may touch a tall obstacle's edge; the landing itself
    // still needs to be within MaxStepHeight, not merely the capsule centre.
    const contactProbe=grounded.clone();contactProbe.y-=skin*2;
    const supports=this.contacts(contactProbe).filter(e=>e.normal.y>=this.settings.walkableNormal);
    const oldProbe=position.clone();oldProbe.y-=skin*2;
    const low=position.clone();low.y-=this.settings.halfHeight-this.settings.radius;
    const oldSupport=this.contacts(oldProbe).filter(e=>e.normal.y>=this.settings.walkableNormal);
    const oldFloor=Math.max(position.y-this.settings.halfHeight,...oldSupport.map(e=>e.triangle.closestPointToPoint(low,v()).y));
    const newLow=grounded.clone();newLow.y-=this.settings.halfHeight-this.settings.radius;
    if(!supports.some(e=>e.triangle.closestPointToPoint(newLow,v()).y<=oldFloor+this.settings.maxStep+skin))return null;
    return grounded;
  }
}
