import * as THREE from 'three';
import {roomRandomScore} from '../core/random.js';
export function createArchitecture(ctx){
const {M,mat,random,rr,pick}=ctx;const {box,cyl,pipe,cable,ball,at,geometry,geo,transform}=ctx.batch;const {textureCanvas,sign}=ctx.signage;
const architecturalTextures=new Map();
function rail(x,z,length,rot=0,y=.81){at(x,y,z,rot,()=>{for(let i=0;i<=length/.8;i++)cyl(-length/2+i*.8,.54,0,.028,1.08,M.iron);for(const h of[.18,.9,1.05])box(0,h,0,length,.035,.035,M.iron);});}
function acUnit(x,y,z,rot=0){at(x,y,z,rot,()=>{box(0,0,0,.85,.54,.37,M.metal,0,true);cyl(-.17,0,.21,.19,.035,M.dark,Math.PI/2);for(let i=0;i<4;i++)box(.15+i*.07,0,.205,.025,.36,.03,M.dark);pipe([-.25,-.27,0],[-.25,-.4,-.18],.025,M.iron);});}
function waterTank(x,y,z){cyl(x,y+.6,z,.66,1.2,M.tank);cyl(x,y+1.25,z,.77,.15,M.blue);cyl(x,y+1.38,z,.13,.13,M.iron);for(const h of[.2,.45,.85,1.05])cyl(x,y+h,z,.675,.025,M.metal);for(const dx of[-.4,.4])box(x+dx,y-.15,z,.06,.5,.6,M.iron);pipe([x+.63,y+.4,z],[x+.9,y+.4,z],.055,M.metal);pipe([x+.9,y+.4,z],[x+.9,y-.3,z],.055,M.metal);}
function windowRoomId(face,i,total){let room=`${face}:${i}`;if(total>1){const first=i===0,last=i===total-1;if(face==='front')room=first?'corner-front-left':last?'corner-front-right':room;else if(face==='back')room=first?'corner-back-left':last?'corner-back-right':room;else if(face==='right')room=first?'corner-back-right':last?'corner-front-right':room;else if(face==='left')room=first?'corner-back-left':last?'corner-front-left':room;}return room;}
function architecturalSkin(kind){if(architecturalTextures.has(kind))return architecturalTextures.get(kind);const t=textureCanvas(512,512,(c,w,h)=>{
 c.fillStyle=kind==='brick'?'#d5c4b5':'#eee9dc';c.fillRect(0,0,w,h);
 if(kind==='brick'||kind==='tile'){const row=kind==='brick'?32:64,col=kind==='brick'?96:64;for(let y=0;y<h;y+=row)for(let x=-col;x<w;x+=col){const xx=x+(kind==='brick'&&(y/row)%2?col/2:0);c.fillStyle=kind==='brick'?'rgba(255,243,208,.18)':'rgba(90,82,60,.16)';c.fillRect(xx+2,y+2,col-4,row-4);c.strokeStyle=kind==='brick'?'rgba(41,34,29,.30)':'rgba(115,109,90,.27)';c.lineWidth=2;c.strokeRect(xx,y,col,row);}}
 for(let i=0;i<800;i++){c.fillStyle='rgba(47,53,48,.045)';c.fillRect(rr(0,w),rr(0,h),rr(1,4),rr(1,4));}
 for(let i=0;i<9;i++){const xx=rr(0,w),yy=rr(0,h);const g=c.createLinearGradient(0,yy,0,yy+160);g.addColorStop(0,'rgba(46,58,51,.16)');g.addColorStop(1,'rgba(46,58,51,0)');c.fillStyle=g;c.fillRect(xx,yy,rr(5,22),160);}
 });architecturalTextures.set(kind,t);return t;}
function architecturalWindow(x,y,z,w,h,rot,type,lit){at(x,y,z,rot,()=>{
 const trim=type==='wide'?M.cream:type==='balcony'?M.white:type==='ribbon'?M.metal:M.iron;
 box(0,0,0,w+.16,h+.16,.12,trim);box(0,0,.071,w,h,.04,lit?M.warmDim:M.windowDark);
 const panes=type==='ribbon'?4:type==='wide'?3:2;
 for(let i=1;i<panes;i++)box(-w/2+w*i/panes,0,.11,.045,h,.04,trim);
 if(type==='wide'||type==='arched')box(0,h*.16,.11,w,.045,.04,trim);
 box(0,-h/2-.09,.12,w+.26,.12,.33,trim);
 if(lit){box(-w*.34,0,.105,w*.16,h,.02,M.sand);if(type==='balcony')box(w*.29,0,.105,w*.17,h,.02,M.cream);}
 if(type==='balcony'){
  box(0,-h/2-.17,.43,w+.48,.14,.92,M.concrete);rail(0,.84,w+.4,0,-h/2-.1);
  for(const xx of[-w*.48,w*.48])rail(xx,.44,.8,Math.PI/2,-h/2-.1);
  box(-w*.25,-h/2+.04,.60,.34,.32,.30,M.red);ball(-w*.25,-h/2+.28,.60,.28,.30,.25,M.leaf);
 }
});}
function roofGarden(w,d,h){for(let i=0;i<Math.floor(w/.65);i++){const px=-w*.4+i*.67;box(px,h+.38,-d*.34,.42,.34,.38,i%2?M.wood:M.jade);ball(px,h+.71,-d*.34,.3,.4,.3,i%3?M.leaf:M.leaf2);}box(w*.23,h+.35,d*.17,1.25,.13,.65,M.woodLight);for(const x of[-.4,.4])box(w*.23+x,h+.14,d*.17,.08,.34,.5,M.iron);}
function rooftop(w,d,h,style){
 box(0,h+.10,0,w+.12,.2,d+.12,M.concrete,0,true);
 const parapet=style==='garden'?.48:style==='terrace'?.22:.32;
 for(const z of[-d/2,d/2])box(0,h+.2+parapet/2,z,w,parapet,.16,style==='pitched'?M.brick:M.concrete);
 if(style==='garden'||style==='terrace'){rail(0,d/2,w,0,h+.3);rail(w/2,0,d,Math.PI/2,h+.3);roofGarden(w,d,h);}
 else{box(-w/2,h+.38,0,.16,.52,d,M.concrete);box(w/2,h+.38,0,.16,.52,d,M.concrete);}
 if(style==='pitched'){
  for(const side of[-1,1]){const mx=transform(0,h+.65,side*d*.25,w+.35,.12,d*.54,-side*.22);geometry(geo.box,M.maroon,mx);for(let x=-w*.48;x<w/2;x+=.29)pipe([x,h+1.23,0],[x,h+.08,side*d*.53],.019,M.iron);}
  box(0,h+1.22,0,w+.4,.13,.16,M.iron);cyl(w*.38,h+1,d*.2,.18,1.5,M.metal);
 }else{
  const accessX=style==='tank'?-.12*w:-.29*w,accessZ=-d*.21;
  box(accessX,h+.83,accessZ,Math.min(2,w*.36),1.38,Math.min(1.8,d*.33),style==='shed'?M.jade:M.sand,0,true);
  box(accessX,h+1.57,accessZ,Math.min(2.2,w*.4),.13,Math.min(2,d*.36),M.slate);
  box(accessX,h+.73,accessZ+d*.17,.49,1.06,.05,M.dark);
  if(style==='tank'||style==='utility')waterTank(w*.25,h+.35,d*.11);
  if(style==='shed'){
   const sw=w*.45,sd=d*.54;geometry(geo.box,M.jade,transform(w*.19,h+.72,-d*.05,sw,.10,sd,.13));for(let x=w*.19-sw/2;x<w*.19+sw/2;x+=.20)pipe([x,h+.96,-d*.32],[x,h+.48,d*.22],.018,M.metal);
  }
  const count=style==='utility'?3:style==='terrace'?2:1;
  for(let i=0;i<count;i++)acUnit(-w*.30+i*.95,h+.55,d*.29);
  if(style==='utility'){for(let i=0;i<3;i++){cyl(-w*.25+i*.56,h+.34,-d*.35,.22,.45,M.maroon);cyl(-w*.25+i*.56,h+.58,-d*.35,.24,.06,M.dark);}}
  if(style==='garden'){cyl(w*.32,h+1.07,-d*.18,.035,1.9,M.iron);cable([[-w*.3,h+1.8,d*.25],[0,h+1.60,d*.25],[w*.32,h+1.8,d*.25]],.01,M.iron);for(let i=0;i<3;i++)box(-w*.15+i*.44,h+1.3,d*.25,.28,.50,.03,i%2?M.cream:M.jade);}
 }
 cyl(-w*.37,h+.75,-d*.34,.095,1.1,M.metal);cyl(-w*.37,h+1.33,-d*.34,.20,.1,M.iron);
}

 function building(spec){
  const {id,x,z,w,d,floors=3,color='#a6afa2',skin='plaster',window='wide',roof='terrace',rotation=0,label='WORKSHOP'}=spec;
  const h=3.3+(floors-1)*2.38,rate=spec.litRate??ctx.config.lighting.windowLitRate;
  at(x,.8,z,rotation,()=>{
   box(0,h/2,0,w,h,d,mat(color,{map:architecturalSkin(skin)}),0,true);
   box(0,.13,0,w+.12,.26,d+.12,M.slate);
   // Doors and shop glazing remain separate from the upper-room selection.
   architecturalWindow(-w*.20,1.65,d/2+.07,w*.48,1.65,0,'wide',true);
   box(w*.28,1.32,d/2+.06,w*.20,2.35,.12,M.iron);
   box(w*.28,1.4,d/2+.14,w*.15,2.03,.05,M.warmDim);
   box(w*.34,1.3,d/2+.19,.035,.25,.04,M.metal);
   sign(label,0,2.9,d/2+.12,w*.88,.55,spec.signColor??'#355c55','#f1deb1');
   for(let f=1;f<floors;f++){
    const yy=3.3+(f-.5)*2.38,wh=window==='ribbon'?.91:1.38;
    const count=window==='ribbon'?1:Math.max(1,Math.floor(w/(window==='wide'?2.7:2.2))),ns=Math.max(1,Math.floor(d/2.8)),rooms=new Set();
    for(let i=0;i<count;i++){rooms.add(windowRoomId('front',i,count));rooms.add(windowRoomId('back',i,count));}
    for(let i=0;i<ns;i++){rooms.add(windowRoomId('right',i,ns));rooms.add(windowRoomId('left',i,ns));}
    const lit=new Set([...rooms].filter(room=>roomRandomScore(`${ctx.config.seed}:${id}:${f}:${room}`)<rate));
    for(const room of rooms){const flag=spec.roomOverrides?.[`${f}:${room}`];if(flag===true)lit.add(room);else if(flag===false)lit.delete(room);}
    const on=(face,i,n)=>lit.has(windowRoomId(face,i,n));
    for(let i=0;i<count;i++){const xx=-w/2+(.5+i)*w/count,ww=window==='ribbon'?w*.74:w/count*.68;
     architecturalWindow(xx,yy,d/2+.07,ww,wh,0,window,on('front',i,count));
     architecturalWindow(xx,yy,-d/2-.07,ww,wh,Math.PI,'narrow',on('back',i,count));}
    for(let i=0;i<ns;i++){const zz=-d/2+(i+.5)*d/ns,ww=d/ns*.48;
     architecturalWindow(w/2+.07,yy,zz,ww,wh,Math.PI/2,'narrow',on('right',i,ns));
     architecturalWindow(-w/2-.07,yy,zz,ww,wh,-Math.PI/2,'narrow',on('left',i,ns));}
    if(f%2===1)acUnit(w*.29,yy-.65,d/2+.22);
   }
   for(const xx of[-w/2+.18,w/2-.18])pipe([xx,.3,d/2+.18],[xx,h-.1,d/2+.18],.031,M.iron);
   rooftop(w,d,h,roof);
  });
  // Conservative rotated footprint used by pedestrians and prop clearance.
  const c=Math.abs(Math.cos(rotation)),s=Math.abs(Math.sin(rotation));
  ctx.obstacles.push({x,z,w:w/2*c+d/2*s+.2,d:d/2*c+w/2*s+.2,label:id});
  return {id,height:h+.8,width:w,depth:d};
 }
 return {building,architecturalWindow,acUnit,waterTank,rooftop};
}
