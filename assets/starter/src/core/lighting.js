import * as THREE from 'three';
import {createRandom} from './random.js';
export function createLighting(ctx){
 const {scene,state,M,emissives,nightLights,streetLampBulb,streetLampDayColor,streetLampNightColor,windowNightColors}=ctx,cfg=ctx.config;
 const hemi=new THREE.HemisphereLight('#a3b9e5','#514357',1.05);scene.add(hemi);
 const key=new THREE.DirectionalLight('#abc9ef',1);key.position.set(-25,40,16);key.castShadow=cfg.visual.shadows;key.shadow.mapSize.set(2048,2048);const bound=Math.max(cfg.terrain.width,cfg.terrain.depth)*.8;Object.assign(key.shadow.camera,{left:-bound,right:bound,top:bound,bottom:-bound,near:1,far:140});key.shadow.bias=-.0005;key.shadow.normalBias=.035;key.shadow.radius=3;scene.add(key);
 const fill=new THREE.DirectionalLight('#f1b383',.65);fill.position.set(30,19,16);scene.add(fill);
 const day=new THREE.Color(cfg.lighting.dayBackground),night=new THREE.Color(cfg.lighting.nightBackground),dayFloor=new THREE.Color('#9bafbc'),nightFloor=new THREE.Color('#152944');let nightAmount=state.night?1:0;
 const {random,rr}=createRandom(cfg.seed^0x7f4a7c15);let rain=null;
 if(cfg.weather.preset==='rain'){
  const positions=new Float32Array(cfg.weather.rainCount*3);for(let i=0;i<positions.length;i+=3){positions[i]=rr(-cfg.terrain.width/2,cfg.terrain.width/2);positions[i+1]=rr(1,24);positions[i+2]=rr(-cfg.terrain.depth/2,cfg.terrain.depth/2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));rain=new THREE.Points(g,new THREE.PointsMaterial({color:'#b8d0dd',size:.06,transparent:true,opacity:.55,depthWrite:false}));scene.add(rain);
 }
 const distance=ctx.camera.position.distanceTo(ctx.controls.target),mist=cfg.weather.preset!=='clear';scene.fog.near=distance+(mist?-8:20);scene.fog.far=distance+(mist?75:140);
 function update(dt){
  const target=state.night?1:0;nightAmount=THREE.MathUtils.lerp(nightAmount,target,1-Math.exp(-dt*2.2));if(Math.abs(nightAmount-target)<.002)nightAmount=target;const n=nightAmount;
  scene.background.copy(day).lerp(night,n);scene.fog.color.copy(scene.background);hemi.intensity=2.2*(1-n)+.95*n;key.intensity=2.5*(1-n)+.9*n;key.color.set('#fff2d6').lerp(new THREE.Color('#abc9ef'),n);fill.intensity=.65+.4*(1-n);
  for(const m of emissives)m.emissiveIntensity=m.userData.nightEmission*(.05+.95*n);
  for(const[i,m]of[M.warm,M.warmDim].entries()){m.color.copy(M.windowDark.color).lerp(windowNightColors[i],n);m.emissiveIntensity=m.userData.nightEmission*n;}
  streetLampBulb.color.copy(streetLampDayColor).lerp(streetLampNightColor,n);streetLampBulb.emissiveIntensity=2.6*n;
  for(const{l,power}of nightLights)l.intensity=power*n*.24;ctx.signage.glowMat.opacity=.18*n;ctx.bloom.strength=(ctx.economy?.14:cfg.lighting.bloom)*n;if(ctx.floor)ctx.floor.material.color.copy(dayFloor).lerp(nightFloor,n);
  if(rain&&!state.paused){const a=rain.geometry.attributes.position;for(let i=0;i<a.count;i++){let x=a.getX(i)+dt*cfg.weather.wind,y=a.getY(i)-dt*9;if(y<.8){y=24;x=rr(-cfg.terrain.width/2,cfg.terrain.width/2);}if(x>cfg.terrain.width/2)x=-cfg.terrain.width/2;a.setXYZ(i,x,y,a.getZ(i));}a.needsUpdate=true;}
 }
 update(10);
 return {update,diagnostics:()=>({nightAmount,windowColor:M.warm.color.getHexString(),unlitColor:M.windowDark.color.getHexString(),windowEmission:M.warm.emissiveIntensity,bulbColor:streetLampBulb.color.getHexString(),bulbEmission:streetLampBulb.emissiveIntensity,weather:cfg.weather.preset,rainPoints:rain?cfg.weather.rainCount:0})};
}
