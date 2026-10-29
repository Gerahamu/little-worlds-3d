import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function createGeometryKit(scene,random,visual={}){
const geo={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,8),ball:new THREE.IcosahedronGeometry(1,1),round:new THREE.SphereGeometry(1,8,6),cone:new THREE.ConeGeometry(1,1,8),plane:new THREE.PlaneGeometry(1,1)};
geo.bevel=new RoundedBoxGeometry(1,1,1,1,.10);geo.cabin=geo.box.clone();{const a=geo.cabin.attributes.position;for(let i=0;i<a.count;i++)if(a.getY(i)>0){a.setX(i,a.getX(i)*.86);a.setZ(i,a.getZ(i)*.65);}geo.cabin.computeVertexNormals();}
const staticBins=new Map(),instanceBins=new Map(),outlines=[];
const staticTrafficMaterials=new Map(),staticTrafficMeshes=[];let collectingTraffic=false;
const dummy=new THREE.Object3D();let frame=new THREE.Matrix4();
function transform(x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();return frame.clone().multiply(dummy.matrix);}
function at(x,y,z,rot,fn){const old=frame;frame=transform(x,y,z,1,1,1,0,rot);try{fn();}finally{frame=old;}}
function geometry(g,m,matrix=frame){if(collectingTraffic){if(!staticTrafficMaterials.has(m)){const copy=m.clone();copy.userData.trafficDecoration=true;staticTrafficMaterials.set(m,copy);}m=staticTrafficMaterials.get(m);}if(!staticBins.has(m))staticBins.set(m,[]);const copy=g.clone().applyMatrix4(matrix);if(!copy.getAttribute('uv'))copy.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(copy.getAttribute('position').count*2),2));staticBins.get(m).push(copy);}
function box(x,y,z,w,h,d,m,rot=0,outline=false){const mx=transform(x,y,z,w,h,d,0,rot);geometry(geo.box,m,mx);if(outline)outlines.push(new THREE.EdgesGeometry(geo.box).applyMatrix4(mx));}
function cyl(x,y,z,r,h,m,rx=0,rz=0){geometry(geo.cyl,m,transform(x,y,z,r,h,r,rx,0,rz));}
function ball(x,y,z,sx,sy,sz,m){const key='ball'+m.uuid;if(!instanceBins.has(key))instanceBins.set(key,{g:geo.ball,m,arr:[]});instanceBins.get(key).arr.push(transform(x,y,z,sx,sy,sz,0,random()*6));}
function instance(kind,m,x,y,z,sx,sy,sz,ry=0,rz=0){const key=kind+m.uuid;if(!instanceBins.has(key))instanceBins.set(key,{g:geo[kind],m,arr:[]});instanceBins.get(key).arr.push(transform(x,y,z,sx,sy,sz,0,ry,rz));}
function pipe(a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dir=bv.clone().sub(av),o=new THREE.Object3D();o.position.copy(av.clone().add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());o.scale.set(r,dir.length(),r);o.updateMatrix();geometry(geo.cyl,m,frame.clone().multiply(o.matrix));}
function cable(ps,r=.018,m=M.black){const path=new THREE.CatmullRomCurve3(ps.map(a=>new THREE.Vector3(...a)));const g=new THREE.TubeGeometry(path,18,r,4,false);geometry(g,m);g.dispose();}
function flush(){for(const[m,gs]of staticBins){const ns=gs.map(g=>g.index?g.toNonIndexed():g);const merged=mergeGeometries(ns,false);const mesh=new THREE.Mesh(merged,m);mesh.castShadow=!m.emissive?.getHex()&&!m.userData.background&&!m.userData.noShadow;mesh.receiveShadow=true;mesh.visible=true;scene.add(mesh);if(m.userData.trafficDecoration)staticTrafficMeshes.push(mesh);for(const g of gs)g.dispose();for(let i=0;i<ns.length;i++)if(ns[i]!==gs[i])ns[i].dispose();}staticBins.clear();for(const b of instanceBins.values()){const mesh=new THREE.InstancedMesh(b.g,b.m,b.arr.length);b.arr.forEach((mx,i)=>mesh.setMatrixAt(i,mx));mesh.castShadow=!b.m.emissive?.getHex();mesh.receiveShadow=true;scene.add(mesh);}instanceBins.clear();if(outlines.length){const g=mergeGeometries(outlines,false);scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#17232d',transparent:true,opacity:visual.outlineOpacity??.42})));outlines.forEach(g=>g.dispose());outlines.length=0;}}

return {geo,transform,at,geometry,box,cyl,ball,instance,pipe,cable,flush,staticTrafficMeshes};
}
