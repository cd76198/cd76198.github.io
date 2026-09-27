import * as THREE from 'three';

export function markerTexture(number){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d');
  ctx.beginPath();ctx.arc(64,64,55,0,Math.PI*2);
  ctx.fillStyle='#e9c88c';ctx.fill();
  ctx.lineWidth=7;ctx.strokeStyle='#74492e';ctx.stroke();
  ctx.fillStyle='#34231a';ctx.font='bold 72px "Noto Sans KR",sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(number),64,67);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
