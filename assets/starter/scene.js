import {makePath} from './src/world/terrain.js';
// Country-specific scenery belongs here. This neutral demo is not a country map.
export function buildScene(ctx){
 const {width:w,depth:d}=ctx.config.terrain,rx=w*.35,rz=d*.33,r=Math.min(rx,rz)*.38,k=.55228475;
 const segments=[
  [[-rx+r,-rz],[rx-r,-rz]],[[rx-r,-rz],[rx-r+k*r,-rz],[rx,-rz+r-k*r],[rx,-rz+r]],
  [[rx,-rz+r],[rx,rz-r]],[[rx,rz-r],[rx,rz-r+k*r],[rx-r+k*r,rz],[rx-r,rz]],
  [[rx-r,rz],[-rx+r,rz]],[[-rx+r,rz],[-rx+r-k*r,rz],[-rx,rz-r+k*r],[-rx,rz-r]],
  [[-rx,rz-r],[-rx,-rz+r]],[[-rx,-rz+r],[-rx,-rz+r-k*r],[-rx+r-k*r,-rz],[-rx+r,-rz]]
 ];
 const curve=makePath(segments),roadWidth=3.1,roadPoints=ctx.terrain.road(curve,roadWidth);
 ctx.terrain.crosswalk(0,rz,roadWidth,2.2);
 const specs=[
  {id:'workshop',x:-w*.19,z:-d*.08,w:4.9,d:4.4,floors:3,color:'#bcaa8e',skin:'tile',window:'wide',roof:'terrace',label:'WORKSHOP'},
  {id:'market',x:0,z:-d*.11,w:5.1,d:4.4,floors:4,color:'#899e9b',skin:'plaster',window:'narrow',roof:'shed',label:'CORNER MARKET',signColor:'#456675'},
  {id:'cafe',x:w*.19,z:-d*.06,w:4.8,d:4.2,floors:2,color:'#a37f69',skin:'brick',window:'wide',roof:'pitched',label:'GARDEN CAFE'}
 ];
 const buildings=specs.map(s=>ctx.architecture.building(s));
 for(const[x,z,size]of[[-w*.22,d*.13,.8],[w*.22,d*.15,.85],[-w*.42,-d*.40,.7],[w*.42,d*.40,.65]])ctx.props.treeIfClear(x,z,size);
 for(const[x,z]of[[-4.5,3.3],[4.5,3.3]])ctx.props.bench(x,z);
 for(const[x,z]of[[-rx+1,rz-2.3],[rx-1,rz-2.3],[-rx+1,-rz+2.3],[rx-1,-rz+2.3]])ctx.props.lamp(x,z);
 ctx.signage.shopLight(-w*.19,2.7,.5,22);ctx.signage.shopLight(w*.19,2.7,.8,20);
 ctx.signage.projectingSign('CAFE',w*.19+2,4.3,.7,.65,2.0,'#294e49','#f5d4a0');
 ctx.signage.outlineNeon('OPEN',-w*.19,2.7,.3,1.2,.4,'#f5a58c');
 if(ctx.config.terrain.surface==='meadow')ctx.terrain.reliefPatch(-w*.4,d*.25,w*.09,d*.15);
 return {buildings,roadPoints,roadWidth,
  lanes:[{id:'loop',entry:'loop',axis:'LOOP',curve,stopPoint:[3.0,rz],exitDistance:9,busStop:null}],
  junction:{x:0,z:rz,w:3.2,d:roadWidth/2+.4},
  footRoutes:[[[ -rx+3,-rz+3],[rx-3,-rz+3],[rx-3,rz-3],[-rx+3,rz-3]],[[-w/2+1.1,-d/2+1.1],[w/2-1.1,-d/2+1.1],[w/2-1.1,d/2-1.1],[-w/2+1.1,d/2-1.1]]],
  crossings:[{a:[0,rz-2.4],b:[0,rz+2.4]}],
  activities:[{x:-3.2,z:2.6,mode:'taking-photo'},{x:3.2,z:2.5,mode:'socializing'},{x:4,z:2.8,mode:'socializing'}],
  signals:[{x:2.5,z:rz-2.3,axis:'LOOP',rotation:Math.PI}]
 };
}
