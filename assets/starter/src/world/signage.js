import * as THREE from 'three';
export function createSignage(ctx){
const {scene,M,mat,gradient,emissives,nightLights}=ctx;const {at,box,pipe,geometry,geo,transform}=ctx.batch;
const FONT=ctx.config.visual.fontFamily,signs=new Map();
const signFrameMat=mat('#2c3942'),signBrassMat=mat('#a18a62');
function textureCanvas(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function signMat(text,bg,fg,vertical=false,small='',variant='board'){
 const key=[text,bg,fg,vertical,small,variant].join('|');if(signs.has(key))return signs.get(key);
 const W=vertical?256:1024,H=vertical?1024:320;
 function paint(c,w,h,emission=false){
  c.fillStyle=bg;c.fillRect(0,0,w,h);if(emission){c.fillStyle='rgba(0,0,0,.63)';c.fillRect(0,0,w,h);}
  if(!emission){c.strokeStyle=fg+'70';c.lineWidth=5;c.strokeRect(10,10,w-20,h-20);c.fillStyle='rgba(255,255,255,.055)';c.fillRect(15,15,w-30,h*.34);}
  c.fillStyle=fg;c.strokeStyle=fg;c.textAlign='center';c.textBaseline='middle';
  if(vertical){const chars=[...text].filter(x=>x!==' '),step=(h-116)/chars.length;c.font=`700 ${Math.min(194,step*.90)}px ${FONT}`;chars.forEach((a,i)=>c.fillText(a,w/2,58+step*(i+.5)));}
  else{c.font=`700 ${Math.min(190,880/[...text].length)}px ${FONT}`;
   if(variant==='outline'){c.lineWidth=3.2;c.strokeText(text,w/2,h*.48);}else c.fillText(text,w/2,small?h*.40:h*.49);
   if(small){c.font=`700 ${Math.min(42,880/[...small].length)}px ${FONT}`;c.fillText(small,w/2,h*.81);}
  }
 }
 const face=textureCanvas(W,H,(c,w,h)=>paint(c,w,h));
 const lit=textureCanvas(W,H,(c,w,h)=>paint(c,w,h,true));
 const power=variant==='outline'?2.5:vertical?1.95:.8;
 const m=new THREE.MeshToonMaterial({map:face,gradientMap:gradient,emissive:'#ffffff',emissiveMap:lit,emissiveIntensity:power});m.userData.nightEmission=power;m.userData.signage=true;emissives.push(m);signs.set(key,m);return m;
}
function sign(text,x,y,z,w,h,bg='#a83221',fg='#ffedb1',rot=0,vertical=false,small='',variant='board'){
 at(x,y,z,rot,()=>{box(0,0,0,w+.12,h+.12,variant==='lightbox'?.32:.17,signFrameMat);geometry(geo.plane,signMat(text,bg,fg,vertical,small,variant),transform(0,0,variant==='lightbox'?.167:.092,w,h,1));});
}
function projectingSign(text,x,y,z,w,h,bg,fg,wallRot=0){at(x,y,z,wallRot,()=>{
 const reach=w*.5+.48;
 for(const dy of[-h*.34,h*.34]){pipe([0,dy,-.12],[0,dy,reach+.2],.045,signFrameMat);box(0,dy,-.08,.25,.27,.14,signFrameMat);}
 at(0,0,reach,Math.PI/2,()=>{box(0,0,0,w+.12,h+.16,.25,signFrameMat);for(const side of[-1,1])geometry(geo.plane,signMat(text,bg,fg,true),transform(0,0,side*.132,w,h,1,0,side===1?0:Math.PI));});
});}
function outlineNeon(text,x,y,z,w,h,fg,rot=0){sign(text,x,y,z,w,h,'#192531',fg,rot,false,'','outline');}
function groundText(text,x,z,w,d,rot=0){const m=signMat(text,'#34414e','#d8d7bf');m.userData.signage=false;m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;at(x,.675,z,rot,()=>geometry(geo.plane,m,transform(0,0,0,w,d,1,-Math.PI/2)));}
function glowTexture(){return textureCanvas(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,194,93,.9)');g.addColorStop(.3,'rgba(255,150,45,.3)');g.addColorStop(1,'rgba(255,126,30,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});}
const glowMat=new THREE.MeshBasicMaterial({map:glowTexture(),color:'#ffc276',transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending});
const groundGlows=[];
function warmPool(x,z,w,d){const mesh=new THREE.Mesh(geo.plane,glowMat);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.837,z);mesh.scale.set(w,d,1);scene.add(mesh);groundGlows.push(mesh);}
function shopLight(x,y,z,power=22){const l=new THREE.PointLight('#ff9b43',power,10,2);l.position.set(x,y,z);scene.add(l);nightLights.push({l,power});}

return {textureCanvas,signMat,sign,projectingSign,outlineNeon,groundText,warmPool,shopLight,groundGlows,glowMat,signs};
}
