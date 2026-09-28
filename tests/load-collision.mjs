import * as THREE from '../vendor/three.module.js';
import fs from 'node:fs';
export function loadCollision(name='field'){
const b=fs.readFileSync(new URL('../assets/models/'+name+'-collision.glb',import.meta.url));const jLen=b.readUInt32LE(12);const gltf=JSON.parse(b.subarray(20,20+jLen).toString());const binStart=20+jLen+8;
function accessor(i){const a=gltf.accessors[i],v=gltf.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],w={5121:1,5123:2,5125:4,5126:4}[a.componentType],get={5121:'getUint8',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType],out=new (a.componentType===5126?Float32Array:Uint32Array)(a.count*n),base=binStart+(v.byteOffset||0)+(a.byteOffset||0),view=new DataView(b.buffer,b.byteOffset,b.byteLength);for(let k=0;k<a.count;k++)for(let m=0;m<n;m++)out[k*n+m]=view[get](base+k*(v.byteStride||n*w)+m*w,true);return out}
// Export collision GLBs use flat nodes; include every primitive (simple and complex shapes).
const scene=new THREE.Scene(),surfaces=[];
for(const node of gltf.nodes){if(node.mesh===undefined)continue;for(const p of gltf.meshes[node.mesh].primitives){const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.BufferAttribute(accessor(p.attributes.POSITION),3));geom.setIndex(new THREE.BufferAttribute(accessor(p.indices),1));geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.position.fromArray(node.translation||[0,0,0]);mesh.quaternion.fromArray(node.rotation||[0,0,0,1]);mesh.scale.fromArray(node.scale||[1,1,1]);mesh.userData=node.extras||{};mesh.name=node.name;scene.add(mesh);surfaces.push(mesh)}}scene.updateMatrixWorld(true);
return surfaces;
}
