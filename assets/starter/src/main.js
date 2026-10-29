import config from '../project.config.js';
import {buildScene} from '../scene.js';
import {createRuntime} from './core/runtime.js';
import {createRandom} from './core/random.js';
import {createLighting} from './core/lighting.js';
import {createSignage} from './world/signage.js';
import {createArchitecture} from './world/architecture.js';
import {createProps} from './world/props.js';
import {createTerrain} from './world/terrain.js';
import {createActors} from './actors/models.js';
import {createSimulation} from './systems/simulation.js';
import {bindToolbar} from './ui/toolbar.js';
try{
 await document.fonts.ready;
 const ctx=createRuntime(config);ctx.signage=createSignage(ctx);ctx.architecture=createArchitecture(ctx);ctx.props=createProps(ctx);ctx.terrain=createTerrain(ctx);
 const layout=buildScene(ctx);ctx.batch.flush();
 const actors=createActors({...ctx,...createRandom(config.seed^0x9e3779b9)});
 const simulation=createSimulation({...ctx,...createRandom(config.seed^0x243f6a88)},layout,actors);
 const lighting=createLighting(ctx),ui=bindToolbar(ctx,simulation);
 const world={ready:true,config,ctx,layout,simulation,setTime:ui.setTime,cycle:kind=>{const mode=simulation.cycle(kind);ui.refresh();return mode;},reset:ctx.reset,diagnostics:()=>({state:{...ctx.state},camera:{position:ctx.camera.position.toArray(),target:ctx.controls.target.toArray(),zoom:ctx.camera.zoom},lighting:lighting.diagnostics(),toon:{materialCount:[...ctx.materials.values()].filter(m=>m.isMeshToonMaterial).length,gradientSteps:ctx.gradient.image.width},buildings:layout.buildings,sceneMeshes:ctx.scene.children.length,fps:ctx.fps,simulation:simulation.diagnostics()}),dispose:()=>{ui.dispose();ctx.dispose();}};
 window.littleWorld=world;document.querySelector('#loading').classList.add('done');setTimeout(()=>document.querySelector('#loading').remove(),650);
 ctx.start(dt=>{lighting.update(dt);simulation.update(dt);});
 addEventListener('pagehide',()=>world.dispose(),{once:true});
}catch(error){console.error(error);document.querySelector('#loading-text').textContent='Unable to start this world';document.querySelector('#error').textContent=error.message;throw error;}
