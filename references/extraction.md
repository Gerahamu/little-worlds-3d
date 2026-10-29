# Extraction inventory

## A — directly reusable implementations

- `src/core/random.js`: original Mulberry32 RNG and stable spatial hash, now with independent stream instances.
- `src/core/geometry.js`: transform stack, box/cylinder/icosahedron primitives, cables/pipes, material-grouped static merging, repeated-primitive instancing and geometric edge outlines. Scope is now a factory.
- `src/core/materials.js`: three-level nearest-filter toon gradient, MeshToonMaterial palette/cache and registered night-emission materials; texture UUIDs keep cache keys small.
- `src/actors/models.js`: original articulated child/adult/elder character construction, clothing, hair/accessories, walking/seated poses; car/taxi/bus/van/scooter bodies, wheel animation and batched dynamic primitive rendering. No model files are needed.
- `src/world/signage.js`: CanvasTexture paint, vertical/horizontal text, secondary line, lightbox, outline neon, projecting sign mounting and inexpensive additive warm pools.
- `src/world/architecture.js`: window/frame/curtain construction, corner room identity, wall textures, AC units, tanks, rooftop access, gardens, rails, pitched and utility roofs.
- `src/world/props.js`: trees, planters, benches and road lamps; tree clearance against building envelopes.
- `styles.css` and toolbar SVGs: original responsive layout, accessible button states, reduced-motion CSS and active/paused/hidden visual states.

These code bodies are present in the Starter. Factory arguments and a few renamed dependencies replace globals; direct reuse does not mean byte-identical modules.

## B — real implementations adapted to configuration

- `runtime.js`: Renderer/Scene, orthographic OrbitControls constraints, delayed automatic rotation, damping, eased reset, resize, context-loss handling and adaptive resolution/shadows. Camera bounds and renderer settings now come from config; disposal is explicit.
- `lighting.js`: original day/night interpolation, shadows, window daylight color/emission correction, gray daytime lamps, bloom and shared localized lights. Fog presets and optional rain particles are new small adapters (Seoul itself did not implement rain).
- `terrain.js`: floating masonry slab, coursed edges, vines, surface layer and contact shadow are dimension-driven adaptations. Optional triangulated relief patches and arbitrary curved road ribbons are new working adapters; neither claims to be Seoul's old terrain system.
- `architecture.js`: building descriptors replace coordinate-keyed Seoul profiles. Room lighting uses a seeded hash with configurable probability and explicit room overrides; adjoining corner faces share a logical room. Door/shop glazing is independent from upper-floor rooms.
- `simulation.js`: original arc-length motion, signal stages, occupancy clearance, braking/headway/exit checks, bus dwell, pedestrian lateral spacing/local avoidance/turnback, crossing permissions and hidden-agent restoration. Scene-authored curves, stop points, footprints, sidewalk loops and activities replace every Seoul route and seat coordinate. One shared controlled conflict area is supported.
- UI binds generic world title and state to those systems; counts, weather, palette, lighting and camera come from `project.config.js`.
- `scripts/create-project.py`, project `scripts/serve.py` and `scripts/export-html.py` are new working distribution tools. Vendored dependency closure makes both source projects and single-page exports independent of the old project and the network.

## C — intentionally excluded

The Seoul six-envelope layout; all original road, paving, sign, bus-stop, seating, traffic-signal and pedestrian-route coordinates; Korean commercial names and font subset; blue/purple circle overrides; Seoul skyline/hill/tower; old screenshots, archives, audit scripts and generated compiled monolith. No default Route 66 scene is included.

The neutral demonstration has three generic businesses around a ring road and a small plaza. New countries need their own authored layout and recognizable local forms, signage/fonts, street furniture and driving rules.
