export function createProps(ctx){
const {M,random,rr,pick,streetLampBulb}=ctx;const {box,cyl,ball,pipe,at}=ctx.batch;const {warmPool}=ctx.signage;
function tree(x,z,s=1,flower=false,y=.8,visible=true){if(visible)cyl(x,y+s*1.2,z,.10*s,2.4*s,M.wood);for(let i=0;i<3;i++){const a=i*2.1;if(visible)pipe([x,y+s,z],[x+Math.cos(a)*s*.7,y+s*2.5,z+Math.sin(a)*s*.7],.05*s,M.wood);}for(let i=0;i<(flower?15:14);i++){const a=random()*Math.PI*2,r=rr(.2,1.15)*s,cy=y+s*2.8+rr(-.6,.7)*s,sx=rr(.45,.75)*s,sy=rr(.5,.8)*s,sz=rr(.4,.75)*s,m=flower?pick([M.blossom,M.blossom2]):pick([M.leaf,M.leaf2,M.leafDark]);if(visible)ball(x+Math.cos(a)*r,cy,z+Math.sin(a)*r,sx,sy,sz,m);else random();}}
function planter(x,z,w=1.2,visible=true){if(visible)box(x,1.02,z,w,.45,.75,M.stoneLight);for(let i=0;i<5;i++){const px=x+rr(-w*.4,w*.4),pz=z+rr(-.2,.2),m=pick([M.leaf,M.leaf2]);if(visible)ball(px,1.4,pz,.24,.3,.23,m);else random();}}
function bench(x,z,rot=0){ctx.obstacles.push({x,z,w:Math.abs(Math.cos(rot))*.85+Math.abs(Math.sin(rot))*.25,d:Math.abs(Math.sin(rot))*.85+Math.abs(Math.cos(rot))*.25,label:'bench'});at(x,.82,z,rot,()=>{box(0,.52,0,1.7,.13,.5,M.woodLight);box(0,.9,-.22,1.7,.42,.08,M.wood);for(const xx of[-.62,.62])box(xx,.26,0,.09,.5,.4,M.iron);});}
function lamp(x,z,y=.8){cyl(x,y+2.0,z,.045,4,M.iron);pipe([x,y+3.95,z],[x+.7,y+3.95,z],.04,M.iron);box(x+.65,y+3.87,z,.5,.12,.27,M.black);box(x+.65,y+3.78,z,.42,.06,.22,streetLampBulb);warmPool(x+.5,z,3.8,3.8);}
 function treeIfClear(x,z,s=1,flower=false){const crown=1.95*s;if(ctx.obstacles.some(b=>Math.hypot(Math.max(Math.abs(x-b.x)-b.w,0),Math.max(Math.abs(z-b.z)-b.d,0))<crown))return false;tree(x,z,s,flower);ctx.obstacles.push({x,z,w:.22,d:.22,label:'tree trunk'});return true;}
 return {tree,treeIfClear,planter,bench,lamp};
}
