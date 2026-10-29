import * as THREE from 'three';
export function createTerrain(ctx){
 const {M,mat,pick,random,rr}=ctx,{box,instance,ball,pipe,geometry}=ctx.batch;
 const {width:w,depth:d,thickness:h,surface,relief}=ctx.config.terrain;
 const top=.6,bottom=top-h;
 box(0,top-h/2,0,w,h,d,M.stone,0,true);
 box(0,top,0,w+.2,.24,d+.2,M.slate);
 box(0,.74,0,w,.08,d,surface==='meadow'?M.leafDark:M.sand);
 const stones=['#4b5560','#535d67','#5b646b','#626b72','#4f5b65'].map(c=>mat(c));
 for(let row=0;row<Math.ceil(h/.68);row++){
  const y=bottom+.34+row*.68;
  for(let x=-w/2+.8;x<w/2;x+=1.65)for(const z of[-d/2-.035,d/2+.035])instance('box',pick(stones),x+(row%2)*.45,y,z,1.57,.60,.05);
  for(let z=-d/2+.8;z<d/2;z+=1.55)for(const x of[-w/2-.035,w/2+.035])instance('box',pick(stones),x,y,z+(row%2)*.40,.055,.60,1.46);
 }
 for(const z of[-d/2,d/2])box(0,.54,z,w+.3,.17,.18,M.stoneLight);
 for(const x of[-w/2,w/2])box(x,.54,0,.18,.17,d+.3,M.stoneLight);
 for(let i=0;i<18;i++){
  const side=i%4,x=side<2?rr(-w/2,w/2):(side===2?-1:1)*(w/2+.12),z=side<2?(side===0?-1:1)*(d/2+.12):rr(-d/2,d/2);
  const steps=Math.floor(rr(.5,h-.2)/.24);for(let j=0;j<steps;j++)ball(x+Math.sin(i+j*.8)*.08,.5-j*.24,z,.14,.19,.1,pick([M.leaf,M.leaf2,M.leafDark]));
 }
 // Optional real low-poly relief patches, kept off authored roads/buildings by the scene.
 function reliefPatch(x,z,pw,pd,amplitude=relief){
  const g=new THREE.PlaneGeometry(pw,pd,Math.max(2,Math.ceil(pw)),Math.max(2,Math.ceil(pd)));g.rotateX(-Math.PI/2);
  const a=g.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,.79+random()*amplitude);g.computeVertexNormals();
  geometry(g,M.leafDark,new THREE.Matrix4().makeTranslation(x,0,z));g.dispose();
 }
 function road(path,width=3.2){
  const positions=[],uv=[],n=Math.ceil(path.getLength()*3),points=[];
  for(let i=0;i<=n;i++){const u=i/n,p=path.getPointAt(u),t=path.getTangentAt(u),nx=-t.z,nz=t.x;points.push(p);for(const side of[-1,1]){positions.push(p.x+nx*width/2*side,.815,p.z+nz*width/2*side);uv.push(u,side===1?1:0);}}
  const idx=[];for(let i=0;i<n;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({color:'#606d73',roughness:ctx.config.weather.preset==='rain'?.35:.8,metalness:.12,side:THREE.DoubleSide});const mesh=new THREE.Mesh(g,m);mesh.receiveShadow=true;ctx.scene.add(mesh);
  return points.map(p=>[p.x,p.z]);
 }
 function crosswalk(x,z,length=3.1,width=2.4,rotation=0){ctx.batch.at(x,0,z,rotation,()=>{const count=6,stripe=width/(count*2-1);for(let i=0;i<count;i++)box(-width/2+stripe/2+i*stripe*2,.835,0,stripe,.018,length,M.white);});}
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(w*15,d*15),new THREE.MeshStandardMaterial({color:'#152944',roughness:.7}));floor.rotation.x=-Math.PI/2;floor.position.y=bottom-.18;ctx.scene.add(floor);
 const tex=ctx.signage.textureCanvas(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,15,64,64,64);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
 const contact=new THREE.Mesh(new THREE.PlaneGeometry(w*1.45,d*1.45),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=bottom-.16;ctx.scene.add(contact);
 ctx.floor=floor;return {road,crosswalk,reliefPatch};
}
export function makePath(segments,y=.84){
 const curve=new THREE.CurvePath(),v=p=>new THREE.Vector3(p[0],y,p[1]);
 for(const s of segments){if(s.length===2)curve.add(new THREE.LineCurve3(v(s[0]),v(s[1])));else if(s.length===4)curve.add(new THREE.CubicBezierCurve3(...s.map(v)));else throw new Error('Path segments require 2 line points or 4 cubic control points');}
 return curve;
}
export function distanceToPolyline(x,z,points){let distance=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));distance=Math.min(distance,Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz));}return distance;}
