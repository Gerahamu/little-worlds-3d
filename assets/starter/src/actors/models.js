import * as THREE from 'three';
export function createActors(ctx){
const {scene,M,mat,random,rr,pick,state,emissives}=ctx,clamp=THREE.MathUtils.clamp;const {geo}=ctx.batch;const labels=ctx.config.traffic.labels;
const {signMat}=ctx.signage;const dynamicParts=[],trafficRoots=[];
const clips=[new THREE.Plane(new THREE.Vector3(1,0,0),ctx.config.terrain.width/2),new THREE.Plane(new THREE.Vector3(-1,0,0),ctx.config.terrain.width/2),new THREE.Plane(new THREE.Vector3(0,0,1),ctx.config.terrain.depth/2),new THREE.Plane(new THREE.Vector3(0,0,-1),ctx.config.terrain.depth/2)];
function part(parent,kind,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const mesh=new THREE.Mesh(geo[kind],m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);parent.add(mesh);dynamicParts.push(mesh);return mesh;}
function pivot(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
const clothing=['#bf604c','#d9c6a4','#365b73','#6e7b59','#404855','#d1b265','#91a4a1','#675b76','#c18d89','#73839b','#a1b0c1','#dfddd1','#263d53'].map(c=>mat(c));
const people=[];
function character(index){const root=new THREE.Group();scene.add(root);const child=index%11===0,elder=index%13===0&&index%11!==0,height=child?rr(.85,.98):elder?rr(1.05,1.15):rr(1.10,1.30),bodyWidth=rr(.30,.39),skin=pick([M.skin1,M.skin2,M.skin3,M.skin4]),shirt=clothing[index%clothing.length],trousers=pick([M.dark,M.black,M.slate,M.maroon]),hair=elder?M.hair3:pick([M.hair,M.hair2]);root.scale.setScalar(height);
 part(root,'box',shirt,0,.72,0,bodyWidth,.43,.22);part(root,'box',skin,0,.97,0,.10,.12,.10);part(root,'round',skin,0,1.10,0,.135,.16,.13);
 const hairStyle=index%5;part(root,'round',hair,0,1.19,-.025,.14,.08,.135);if(hairStyle===0){part(root,'box',hair,0,1.08,-.10,.25,.2,.09);}if(hairStyle===1)part(root,'round',hair,0,1.17,-.16,.08,.08,.08);if(hairStyle===2)part(root,'box',hair,.095,1.13,-.025,.07,.16,.2);if(hairStyle===3){part(root,'box',shirt,0,1.25,.025,.27,.05,.27);part(root,'box',shirt,0,1.23,.15,.24,.025,.12);}
 for(const x of[-.05,.05])part(root,'box',M.black,x,1.11,.126,.023,.024,.015);
 if(index%7===0){part(root,'box',M.iron,0,1.11,.14,.23,.025,.015);part(root,'box',M.cream,0,.86,.118,.07,.23,.025);}
 const arms=[],legs=[];for(const side of[-1,1]){const arm=pivot(root,side*(bodyWidth/2+.055),.88,0);part(arm,'box',shirt,0,-.13,0,.085,.30,.11);part(arm,'round',skin,0,-.32,.015,.055,.06,.05);arms.push(arm);const leg=pivot(root,side*.09,.50,0);part(leg,'box',trousers,0,-.20,0,.11,.40,.13);part(leg,'box',M.black,0,-.39,.055,.135,.10,.23);legs.push(leg);}
 const dress=!child&&index%8===2;if(dress)part(root,'cone',shirt,0,.46,0,.25,.43,.23,Math.PI);
 const accessory=index%6;if(accessory===0){part(root,'box',pick([M.red,M.wood,M.green]),0,.72,-.19,.26,.31,.15);for(const side of[-1,1])part(root,'box',M.iron,side*.12,.78,.11,.025,.29,.025);}if(accessory===1){part(arms[0],'box',M.woodLight,0,-.47,.02,.24,.28,.12);part(arms[0],'box',M.cream,0,-.31,.02,.1,.08,.025);}if(accessory===2){part(root,'box',M.maroon,.25,.51,-.02,.20,.23,.14);part(root,'box',M.wood,.18,.75,.13,.025,.37,.025,0,0,-.3);}
 if(index>30&&index%17===0){part(root,'cyl',M.iron,.25,1.17,.04,.012,1.1,.012);part(root,'cone',pick([M.blue,M.jade,M.red]),.25,1.78,.04,.61,.24,.61);}
 if(elder)part(arms[1],'cyl',M.wood,0,-.57,.08,.018,.68,.018);
 const p={root,arms,legs,index,height,child,elder,dress,hairStyle,accessory,phase:rr(0,Math.PI*2),speed:rr(.48,.83)*(child?1.1:elder?.75:1),mode:'walking',wait:0,path:null,segment:0,progress:0,walkDistance:0};people.push(p);return p;}
function pose(p,moving,dt,sitting=false){const t=state.pedTime,pulse=p.walkDistance*9+p.phase;for(let i=0;i<2;i++){const sign=i===0?1:-1;p.legs[i].rotation.x=sitting?-1.35:moving?Math.sin(pulse)*.48*sign:Math.sin(t*.65+p.phase)*.015;p.arms[i].rotation.x=sitting?-.6+Math.sin(t*1.1+p.phase+i)*.17:moving?-Math.sin(pulse)*.38*sign:-.04+Math.sin(t*.9+p.phase+i)*.055;p.arms[i].rotation.z=(i===0?-.06:.06)+(p.mode==='socializing'?Math.sin(t*1.5+p.phase)*.08:0);}p.root.position.y=(sitting?.94:.82)+(moving?Math.abs(Math.sin(pulse))*.018:Math.sin(t*.7+p.phase)*.008);}
const vehicleMaterials=new Map();function vm(m){if(!vehicleMaterials.has(m)){const clone=m.clone();clone.clippingPlanes=clips;clone.clipShadows=true;if(m.userData.nightEmission){clone.userData.nightEmission=m.userData.nightEmission;emissives.push(clone);}vehicleMaterials.set(m,clone);}return vehicleMaterials.get(m);}
function car(type,color,rider=true){const root=new THREE.Group();scene.add(root);trafficRoots.push(root);const wheels=[],bus=type==='bus',van=type==='van',scooter=type==='scooter';const L=bus?4.6:van?2.9:scooter?1.35:2.6,W=bus?1.55:van?1.34:scooter?.52:1.14;
 const add=(kind,m,x,y,z,a,b,c,rx=0,ry=0,rz=0)=>part(root,kind,vm(m),x,y,z,a,b,c,rx,ry,rz);
 if(scooter){add('box',color,0,.55,0,.39,.52,.76);add('box',M.black,0,.84,-.2,.47,.12,.58);add('box',color,0,.65,.45,.49,.7,.16, .15);add('box',M.black,0,1.03,.49,.67,.05,.07);add('box',M.red,0,1.07,-.50,.62,.55,.52);add('round',M.lamp,0,.86,.57,.12,.10,.05);if(rider){add('box',M.jade,0,1.21,-.06,.36,.43,.24,.12);add('round',M.skin1,0,1.53,-.02,.14,.16,.14);add('round',M.red,0,1.64,-.035,.16,.10,.15);for(const side of[-1,1]){add('box',M.dark,side*.20,.77,.03,.12,.36,.38,0,0,side*.2);add('box',M.jade,side*.22,1.17,.20,.10,.30,.12,-.8);add('round',M.skin1,side*.22,1.06,.35,.05,.06,.05);}}}
 // Variant extensions: this generic shell owns the lower outer body.
 // A same-width RV/trailer shell would expose coplanar faces (Z-fighting).
 // Replace/narrow the underlying shell and clear trim by its nearest face;
 // see references/surface-depth-stability.md in the installed Skill.
 else{add('bevel',color,0,.49,0,W,.64,L);add('box',color,0,.40,L*.40,W*.92,.27,L*.25);add('box',M.black,0,.27,-L*.43,W*.78,.10,.07);if(bus){add('box',M.glass,0,1.14,0,W*.97,.82,L*.87);add('box',color,0,1.62,0,W*1.02,.16,L*.98);for(const side of[-1,1])for(let i=0;i<7;i++)add('box',color,side*(W/2+.008),1.14,-L*.35+i*L*.11,.045,.84,.055);add('box',M.dark,0,1.05,L/2+.02,W*.9,.61,.04);add('box',M.blue,0,.75,L/2+.04,W*.98,.19,.06);const tm=signMat(labels.route,'#1554b9','#e7f5ff');const ds=part(root,'plane',vm(tm),0,1.48,L/2+.05,1.05,.30,1);ds.userData.routeDisplay=true;for(const side of[-1,1]){part(root,'plane',vm(signMat(labels.bus,'#e0d6b7','#275781')),side*(W/2+.035),.64,0,2.3,.34,1,0,side*Math.PI/2);}add('box',M.white,0,1.75,-.5,.85,.19,1.1);}else if(van){add('box',color,0,1.02,-.35,W*.99,1.1,L*.62);add('box',M.glass,0,.93,L*.25,W*.85,.47,L*.27);add('box',color,0,1.26,L*.25,W*.95,.12,L*.34);for(const side of[-1,1])part(root,'plane',vm(signMat(labels.delivery,'#d7ded6','#53736b')),side*(W/2+.02),1.1,-.4,1.25,.40,1,0,side*Math.PI/2);}else{add('cabin',M.glass,0,.99,-.08,W*.84,.48,L*.53);add('bevel',color,0,1.25,-.13,W*.92,.12,L*.48);add('box',color,0,.69,-.03,W*.99,.12,L*.95);for(const side of[-1,1]){add('box',color,side*W*.52,.90,.31,.17,.12,.16);add('box',M.metal,side*W*.505,.66,-.19,.03,.045,.19);}if(type==='taxi'){add('box',M.cream,0,1.40,0,.45,.15,.25);}}
 for(const side of[-1,1]){add('box',M.lamp,side*W*.33,.55,L/2+.025,W*.17,.17,.045);add('box',M.neonRed,side*W*.33,.50,-L/2-.025,W*.17,.13,.045);}add('box',M.white,0,.35,L/2+.052,.31,.12,.02);}
 const wheelPositions=scooter?[[0,-.48],[0,.48]]:[[-W*.50,-L*.30],[W*.50,-L*.30],[-W*.50,L*.30],[W*.50,L*.30]];
 for(const[x,z]of wheelPositions){const w=pivot(root,x,.25,z);part(w,'cyl',vm(M.black),0,0,0,bus?.30:scooter?.22:.25,.13,bus?.30:scooter?.22:.25,0,0,Math.PI/2);part(w,'cyl',vm(M.metal),x<0?-.075:.075,0,0,bus?.16:.13,.02,bus?.16:.13,0,0,Math.PI/2);wheels.push(w);}
 root.position.y=.66;return{root,wheels,length:L,width:W,type};}


 let batchTotal=0;
 function batch(){
 const dynamicBins=new Map();
for(const p of dynamicParts){const key=p.geometry.uuid+p.material.uuid;if(!dynamicBins.has(key))dynamicBins.set(key,{parts:[],geometry:p.geometry,material:p.material});dynamicBins.get(key).parts.push(p);p.visible=false;}
for(const b of dynamicBins.values()){b.mesh=new THREE.InstancedMesh(b.geometry,b.material,b.parts.length);b.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);b.mesh.frustumCulled=false;b.mesh.castShadow=!b.material.emissive?.getHex();scene.add(b.mesh);}
const hiddenMatrix=new THREE.Matrix4().makeScale(0,0,0);
function syncDynamic(){scene.updateMatrixWorld();for(const b of dynamicBins.values()){for(let i=0;i<b.parts.length;i++){const part=b.parts[i];let visible=part.userData.agentVisible!==false;for(let p=part.parent;p&&p!==scene;p=p.parent)if(!p.visible)visible=false;b.mesh.setMatrixAt(i,visible?part.matrixWorld:hiddenMatrix);}b.mesh.instanceMatrix.needsUpdate=true;}}

 batchTotal=dynamicBins.size;return syncDynamic;
 }
 return {character,pose,car,people,trafficRoots,batch,part,pivot,batchCount:()=>batchTotal};
}
