# Architecture and interfaces

## Project entry points

- `project.config.js`: JSON-compatible ES module default export. Identity, seed, terrain width/depth/thickness/surface/relief, camera limits and home pose, weather preset/wind/rain count, lighting colors/exposure/bloom/window-lit probability, visual palette/font/outline/pixel ratio/shadows, people counts/speed and traffic counts/signal plan/labels. CLI flags override common fields; other settings remain editable.
- `scene.js`: `buildScene(ctx)` creates the place's visible layout and returns its navigation descriptors. This is the primary scene-specific file. No runtime fetches or original project files are used.
- `src/main.js`: assembles factories, flushes static geometry once, creates actors, signals and dynamic batches, then binds UI and starts the frame loop.
- `scripts/serve.py`: Python standard-library static server bound to loopback by default; runs from any working directory.
- `scripts/export-html.py [--output path.html]`: traverses static ES module imports, embeds the graph as data URLs with an import map, inlines CSS and includes the Three.js MIT notice. Default output is `dist/<name>.html`; run the exporter again after source edits. Unsupported/unvendored imports fail clearly. New fetched assets, runtime dynamic imports or fonts require an explicit export adapter or embedding.

## Reusable modules

| Module | ES module API and purpose |
|---|---|
| core/random | `createRandom(seed)` → `random`, `rr`, `pick`; `roomRandomScore(key)` |
| core/materials | `createMaterials(palette)` → shared `M`, `mat`, gradient and registered emission materials |
| core/geometry | `createGeometryKit(scene, random, visual)` → `at`, `box`, `cyl`, `ball`, `instance`, `pipe`, `cable`, `geometry`, `transform`, `flush` |
| core/runtime | `createRuntime(config)` → context, `start(frame)`, `reset(instant)`, `setOrbit`, `dispose` |
| core/lighting | `createLighting(ctx)` → `update(dt)`, `diagnostics()`; Day/Night, fog/mist/rain, bloom |
| world/signage | `createSignage(ctx)` → CanvasTexture/text/lightbox/projecting-sign/neon functions and shared warm pools/lights |
| world/architecture | `createArchitecture(ctx)` → `building(spec)`, window, AC, roof and tank construction |
| world/props | `createProps(ctx)` → tree, crown-clearance tree, planter, bench, lamp |
| world/terrain | `createTerrain(ctx)` → road ribbon, crosswalk, relief patch; exported `makePath(segments,y)`, `distanceToPolyline` |
| actors/models | `createActors(ctx)` → character/pose, car variants, primitives, dynamic instancing; register all actors before `batch()` |
| systems/simulation | `createSimulation(ctx, layout, actors)` → `update(dt)`, `cycle(kind)`, `diagnostics()` and model arrays |
| ui/toolbar | `bindToolbar(ctx, simulation)` → time switch, refresh and cleanup |

Automatic orbit waits 6.5 seconds initially and after Reset, and 10 seconds after manual camera interaction; clicking Orbit starts it immediately.

All dimensions are world units, Y is up. Default walk/surface height is around 0.8. `at(x,y,z,yaw,fn)` composes nested transforms and restores the frame even if construction throws. Batched primitives are not independently selectable after `flush()`; use a separate Mesh/Group for something that must later move. Build static geometry before one flush; register all dynamic parts before actors.batch(). Dynamic parts keep transform-only hierarchies and render through shared InstancedMesh batches.

## Buildings and obstacles

`building({id,x,z,w,d,floors,color,skin,window,roof,rotation,label,signColor,litRate,roomOverrides})` creates a footprint and returns height metadata. Current skins: plaster, tile, brick. Windows: wide, narrow, ribbon, balcony, arched. Roofs: garden, terrace, tank, utility, shed, pitched. These are generic mechanisms, not complete national architecture libraries.

Upper floors start at level index 1; overrides use keys such as `1:corner-front-right`. Corner identity links adjacent facades; a boolean override wins over random selection. Lighting probability is not a fixed aggregate quota. Add complex new roof/facade styles as real mesh builders without scattering country checks across the core.

`ctx.obstacles` contains `{x,z,w,d,label}` with HALF extents. Buildings register conservative rotated footprints, clearance trees register trunks, and benches register footprints. Register any additional props that must block walkers. Tree crown clearance uses existing obstacles and may skip a placement; direct `tree()` does not perform clearance.

## Navigation layout contract

`buildScene(ctx)` returns:

- `buildings`: metadata for diagnostics.
- `roadPoints`, `roadWidth`: a sampled XZ road centerline and its full width; ordinary walkers reject its footprint.
- `footRoutes`: arrays of XZ points, each forming a closed sidewalk loop. Keep them clear of buildings/props. Dedicated crossings bypass the road exclusion.
- `crossings`: `{a:[x,z],b:[x,z]}`; the demo spawns pairs on opposite sides when population permits. Align these with visible crosswalks.
- `activities`: `{x,z,mode}` where supported modes include browsing, taking-photo and socializing. The model pose helper also supports seated dining; author a seat/activity adapter when needed.
- `lanes`: `{id,entry,axis,curve,stopPoint,stopBase?,exitDistance?,busStop?,next?}`. `curve` is a THREE.CurvePath with line or cubic Bezier segments. `makePath` consumes arrays of 2 points for lines or 4 for cubic control points. Motion uses arc length. `stopPoint` derives stop distance by sampling, or supply exact arc distance `stopBase`. A car stops its front before this gate. `busStop` is an optional dwell arc distance. `next` is an optional list of compatible lane IDs used on later laps; by default a vehicle stays on its route. Loop endpoints should match. Open lanes should start/end beyond slab clipping boundaries.
- `junction`: `{x,z,w,d}` with HALF extents around the shared controlled conflict area. Clearance uses oriented vehicle footprints and active crossings. This is ONE conflict controller, not multiple independently timed junctions.
- `signals`: `{x,z,axis,rotation}` fixtures. Axis labels must match lane axis and green phase names.

`traffic.signalPlan` is an ordered list `[phase, seconds]`. For axis `LOOP`, use `LOOP`, `LOOP_AMBER`, `LOOP_CLEAR`, `PED`, `PED_CLEAR`. More axis labels can share one controller (e.g. NS and EW). A non-pedestrian `_CLEAR` stage waits for committed traffic/crossers; PED_CLEAR waits for active crossers. Vehicles enter only on their green; an already committed vehicle clears. Pedestrians start in the early PED interval. Configure a long enough PED/clearance interval for the actual crossing length/speed. Occupancy-based restoration defers revealing hidden agents when it would conflict with visible crossing traffic.

Traffic and People each cycle active → paused → hidden → active; paused agents remain obstacles. Space pauses the whole world. The default road is a one-way neutral loop, not a general street generator. Multi-intersection controllers, right/left-hand driving layouts, authored branch connectivity, new traffic behavior and navigation meshes need additional implementation and validation.

## Browser inspection and dependencies

`window.littleWorld` exposes `ready`, `config`, `ctx`, `layout`, `simulation`, `setTime`, `cycle`, `reset`, `diagnostics`, `dispose`. Diagnostics include logical agent positions, signal stage, toon step count, Day/Night material values, camera and spawn failures. Use these alongside real screenshots; counts alone do not prove correct rendering.

Three.js 0.180.0 and the transitive closure of the used official addons are copied in `vendor/three/`; package.json records the pinned dependency but runtime imports point to those local files. `vendor/DEPENDENCIES.json` has the official npm tarball source, SHA-512 integrity and per-file SHA-256 hashes. No npm install is required. New ES modules use explicit relative `.js` paths; addon imports use `three/addons/`.
