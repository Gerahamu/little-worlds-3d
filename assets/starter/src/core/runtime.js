import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createMaterials} from './materials.js';
import {createGeometryKit} from './geometry.js';
import {createRandom} from './random.js';
export function createRuntime(config){
 const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');let reduced=reducedQuery.matches;
 const economy=innerWidth<700||(navigator.hardwareConcurrency||8)<=4;
 const state={time:0,trafficTime:0,pedTime:0,night:config.lighting.night,orbit:config.camera.autoRotate&&!reduced,traffic:true,people:true,trafficMode:'active',peopleMode:'active',paused:false,quality:economy?'economy':'high'};
 const scene=new THREE.Scene();scene.background=new THREE.Color(config.lighting.nightBackground);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,economy?1.25:config.visual.pixelRatio));renderer.shadowMap.enabled=config.visual.shadows&&!economy;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=config.lighting.exposure;renderer.localClippingEnabled=true;
 document.querySelector('#city').appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label',config.title+'. Drag to orbit; scroll to zoom.');
 const camera=new THREE.OrthographicCamera(-35,35,24,-24,.1,800),cc=config.camera;
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.autoRotateSpeed=cc.autoRotateSpeed;controls.screenSpacePanning=false;controls.minZoom=cc.minZoom;controls.maxZoom=cc.maxZoom;controls.minPolarAngle=cc.minPolarAngle;controls.maxPolarAngle=cc.maxPolarAngle;controls.maxTargetRadius=Math.min(config.terrain.width,config.terrain.depth)*.2;
 const homePosition=new THREE.Vector3(...cc.position),homeTarget=new THREE.Vector3(...cc.target);controls.cursor.copy(homeTarget);
 const distance=homePosition.distanceTo(homeTarget);scene.fog=new THREE.Fog(config.lighting.nightBackground,distance+20,distance+140);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),config.lighting.bloom,.45,1.08);composer.addPass(bloom);composer.addPass(new OutputPass());
 const rng=createRandom(config.seed),materials=createMaterials(config.visual.palette),batch=createGeometryKit(scene,rng.random,config.visual);
 const ctx={config,scene,renderer,camera,controls,composer,bloom,state,economy,...rng,...materials,batch,obstacles:[]};
 let resetting=null,holdOrbitUntil=performance.now()+6500,raf=0,disposed=false,contextLost=false,previous=performance.now(),frames=0,elapsed=0,slow=0;
 function fit(){const a=innerWidth/innerHeight,h=a<.85?cc.viewHeight*1.3/a:cc.viewHeight;camera.left=-h*a/2;camera.right=h*a/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);}
 function reset(instant=false){const d=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=d;holdOrbitUntil=performance.now()+6500;if(instant||reduced){camera.position.copy(homePosition);controls.target.copy(homeTarget);camera.zoom=1;camera.updateProjectionMatrix();controls.update();}else resetting={start:performance.now(),from:camera.position.clone(),target:controls.target.clone(),zoom:camera.zoom};}
 const onStart=()=>{resetting=null;holdOrbitUntil=performance.now()+10000;};controls.addEventListener('start',onStart);
 const onReduced=e=>{reduced=e.matches;if(reduced)state.orbit=false;};reducedQuery.addEventListener('change',onReduced);
 const onLost=e=>{e.preventDefault();contextLost=true;},onRestored=()=>{contextLost=false;};renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
 addEventListener('resize',fit);fit();reset(true);
 function start(frame){previous=performance.now();function animate(now){if(disposed)return;raf=requestAnimationFrame(animate);const raw=(now-previous)/1000,dt=Math.min(raw,.1);previous=now;if(contextLost||document.hidden)return;
  if(!state.paused){state.time+=dt;if(state.traffic)state.trafficTime+=dt;if(state.people)state.pedTime+=dt;}frame(dt);
  if(resetting){const u=THREE.MathUtils.clamp((now-resetting.start)/1200,0,1),s=u*u*(3-2*u);camera.position.lerpVectors(resetting.from,homePosition,s);controls.target.lerpVectors(resetting.target,homeTarget,s);camera.zoom=THREE.MathUtils.lerp(resetting.zoom,1,s);camera.updateProjectionMatrix();if(u===1)resetting=null;}
  controls.autoRotate=state.orbit&&!state.paused&&now>holdOrbitUntil&&!resetting;controls.update(dt);controls.target.y=THREE.MathUtils.clamp(controls.target.y,1,10);camera.position.y=Math.max(7,camera.position.y);
  composer.render();frames++;elapsed+=raw;if(elapsed>3){ctx.fps=Math.round(frames/elapsed);ctx.drawCalls=renderer.info.render.calls;if(ctx.fps<24&&state.quality==='high'&&++slow>1){renderer.setPixelRatio(1);composer.setPixelRatio(1);renderer.shadowMap.enabled=false;bloom.enabled=false;state.quality='adaptive';}frames=0;elapsed=0;}
 }raf=requestAnimationFrame(animate);}
 function setOrbit(enabled){state.orbit=enabled&&!reduced;holdOrbitUntil=0;}
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);removeEventListener('resize',fit);reducedQuery.removeEventListener('change',onReduced);controls.removeEventListener('start',onStart);controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of(Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());composer.dispose();renderer.dispose();renderer.domElement.remove();}
 return Object.assign(ctx,{start,reset,setOrbit,dispose});
}
