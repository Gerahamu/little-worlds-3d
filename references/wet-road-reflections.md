# Wet-road reflections: mirrored proxies + road shader

Use when adding or optimizing stylized wet streets in an existing Little Worlds scene. Preserve the user's architecture, roads, camera, rain particles, lighting, simulation and UI unless the requested scope includes them. This is an optional rendering workflow, not a requirement for every world.

## Choose and audit the rendering path

Inspect the actual renderer before choosing a replacement:

- Identify SSR, a reflection camera/planar pass, direct mirrored geometry, render targets and material shader patches.
- Record road world heights, mesh/material ownership, actor batching, lighting/emissive registries, camera update order and postprocessing.
- Distinguish one-time CanvasTexture generation from per-frame texture uploads; identify real readbacks or GPU synchronization rather than inferring them from poor FPS.
- Count reflection passes and their work separately from the main frame. A full-scene pass at 12 Hz can create periodic load spikes and stale reflections during camera motion.
- Keep the working implementation as a selectable visual baseline. Do not replace a good effect solely to adopt a technique.

Direct mirrored geometry can work when ground masking and depth ordering are already suitable. A solid diorama plinth often occludes inverted geometry below the road. In that case use a separate **proxy-only reflection target** and composite it through the existing opaque road shader. This is not an unfiltered second render of the whole city.

## Build the reflection proxy once

Separate proxy construction from per-frame state synchronization.

1. Reuse the scene's existing geometry, materials and textures where useful. For material-batched buildings, cache filtered geometry rather than assuming individual building Groups exist.
2. Keep street-facing wall masses, large roof silhouettes, contrasting stone/brick surfaces, readable warm-window groups, shopfronts and significant signs/lights.
3. Omit small trim, tiny signs, intricate chimneys, foliage fragments, rain particles and irrelevant back-of-block geometry where their absence is visually acceptable.
4. A triangle-area filter can remove minor detail from merged geometry. Preserve UVs and normals, handle indexed/nonindexed buffers, and apply the correct world transform. Do not filter away windows until the reflection becomes flat color.
5. Derive street relevance from the authored layout/road corridors. London-specific coordinate cutoffs or color palettes are adapter data, not reusable defaults.
6. Prefer simplified instanced proxies for conspicuous dynamic objects such as a bus. Copy their existing world matrices and effective visibility; do not rerun the actor factory each frame. Omitting ordinary people/cars is a deliberate quality tradeoff to disclose, not a universal rule.

Cache geometry references, owned filtered buffers, source matrices, material references and dynamic bindings. Rebuild only when the actual layout changes or explicitly requested. Camera movement must not rebuild proxies.

## Mirror geometry and lighting correctly

Get the road's **actual world height**, not the top of the pavement or base slab:

```js
mirroredY = 2 * roadY - originalY;
// Equivalent parent transform for original world-space proxies:
mirrorRoot.position.y = 2 * roadY;
mirrorRoot.scale.y = -1;
```

- A scene with multiple road elevations needs separate local planes or another appropriate method. Detect unsupported elevations and retain the working fallback rather than silently flattening them.
- Account for negative-determinant winding and normals. Three.js normally adjusts face winding for a negative parent transform; verify your material/instancing path. Do not globally disable culling/depth to hide problems.
- For original lit materials, mirror directional-light positions **and targets**, and point-light positions consistently with geometry. Reflect a hemisphere light's direction without introducing the road translation into that direction. Synchronize color/intensity with the original weather system.
- Proxy shadows can be disabled independently if the softer reflected lighting remains acceptable. Keep main-scene shadow quality intact.
- Clip proxy geometry to the appropriate side of the road plane and relevant world edges where necessary. Keep proxy geometry in a separate scene so it never appears as exposed inverted buildings in the main view.

## Integrate before the main composite

For a proxy target rendered through the **same main camera**:

```text
update weather + actors
update controls / final camera pose
update camera world and inverse matrices
sync dynamic proxy transforms and lights
if reflection is wet and capture is dirty:
    reflectionMatrix = bias * camera.projectionMatrix * camera.matrixWorldInverse
    render mirrored proxy scene with this camera into reflectionTarget
render normal scene / composer
```

Project a road fragment's world position through that reflection matrix and divide XY by W before sampling. A different camera requires its own matching projection/view matrix; do not mix the two approaches.

- Camera position, rotation, projection/zoom or viewport changes invalidate the capture immediately. Do not apply a fixed 83/160 ms throttle to camera updates.
- A static target may be cached while camera, relevant lights and reflected dynamic objects are unchanged. GPU ripple animation can continue independently of that cache.
- Include target resize and context restoration in invalidation. Bind capture to the render loop, not asynchronous image updates.
- Restore render target, clipping planes, shadow state and any other modified renderer state with `try/finally`.
- Sample synchronization after rendering. A diagnostic read between a new input and the next frame does not itself establish visible reflection lag.

## Wet-road shader composition

Keep the existing road opaque. Blend reflected color into its outgoing color rather than making the whole road transparent or adding a coplanar glass layer.

Use the road mesh as the shape mask, or an explicit road ownership mask if it shares a larger terrain material. Preserve markings/crosswalks and their existing depth ordering. Do not accidentally apply reflection to building walls, the plinth or ordinary pavement. If reflective pavement is explicitly requested, use its own height and material treatment.

Useful GPU ingredients:

- Low-frequency world-XZ noise for irregular puddle coverage.
- Fine noise and restrained UV/ripple distortion for broken reflections.
- A few offset texture taps for controlled softness.
- Modest view-angle weighting and roughness variation.
- Gentle warm-light gain that retains window color instead of generating neon streaks.

Do not simulate a physical wave for every rain particle or process water images on the CPU. Avoid needless texture reads in the dry branch.

### Central parameters

Keep these in one configuration object:

| Parameter | Purpose |
|---|---|
| `reflectionStrength` | Base reflected-color contribution |
| `reflectionOpacity` | Additional composition multiplier; not ground transparency |
| `wetness` | Wet-mask contribution, multiplied by weather transition |
| `roughness` | Reflected softness/variation |
| `distortionStrength` | UV displacement amplitude |
| `rippleIntensity`, `rippleSpeed` | Water disturbance amount and speed |
| `reflectionBlur` | Offset sampling radius |
| `lightReflectionBoost` | Restrained warm-window/lamp enhancement |

Also expose target resolution scale/caps and proxy simplification settings. UV-space distortion and blur depend on framing/resolution; world-space parameters need scale-aware adaptation.

The London example used strength .62, opacity 1, wetness 1, roughness .58, distortion .00065, ripple intensity/speed 1, blur .0024 and warm-light gain 1.08. Its target scale was .5 with desktop/mobile caps 1024/512. These are starting examples, not universal tuned values.

## Dry mode, switching and lifetime

- Once rain/wet contribution has faded below the useful threshold, skip capture and the shader's expensive reflection branch. Keep the original dry surface.
- Retain named Legacy / Mirrored development modes, e.g. query options or a runtime API. Do not add controls to the product UI unless requested.
- Restore original material compile hooks/cache keys before changing modes. Use stable program cache keys; avoid continuously creating material variants.
- Dispose owned filtered geometry, render targets, instance buffers and event listeners on switch/disposal. Do **not** dispose geometry, textures or materials borrowed from the visible scene.
- An initialization failure should leave a usable legacy path with a diagnostic reason. Unsupported multi-level roads should not break the scene.

## Proportionate acceptance and honest performance reporting

Respect the user's requested verification budget. A focused change can use a matching default/close comparison, a short movement sample and a dry/offline check; it does not automatically justify repeating full traffic/building audits.

Check relevant views while moving the camera, including both street directions, and verify that markings remain readable and no inverted geometry leaks outside the road. Look for culling, depth, sorting or new flicker issues. Keep these separate from pure synchronization counters. Rebuild the offline export with all imported modules and confirm the selectable modes are included.

Compare the same scene, viewport, camera, weather, main quality and actor conditions:

- Report **per-capture** calls/triangles and **average per-frame** reflection work. More frequent smaller captures may raise average draw calls while lowering triangle workload.
- Separate RAF/frame intervals, CPU command submission and actual GPU elapsed time. `performance.now()` around a render submission is not a GPU timing measurement.
- A 60 FPS cap can hide performance headroom. Do not invent an FPS improvement, reliable 1% low or GPU time from short samples.
- Estimate target attachment memory from dimensions/formats separately from owned proxy geometry and driver/program overhead. Reused textures are not additional texture copies.
- Check resource counts around mode switches and inspect cleanup. A finite stable sample is not proof of long-term leak freedom.
- Default to the new path only when visual quality, responsiveness and useful workload improvements support it. Keep Legacy if the replacement loses important visual structure or offers no meaningful benefit.

### Verified London example, not a general benchmark

At 1440×1000, the original full-scene reflection used about 242 calls and 187,909 triangles per capture at roughly 12 Hz. The proxy path used 50 calls and 14,488 triangles per capture, synchronizing captures to camera changes. During movement the average reflection triangle submissions fell from about 35,679 to 14,488 per main frame, while average reflection calls rose slightly from about 46 to 50.

Targets changed from 864×600 to 720×500. Estimated color/depth attachments were 6,220,800 vs 4,320,000 bytes; filtered geometry added about 1,342,656 bytes. Both paths stayed near 60 FPS in short samples; reliable GPU elapsed time and 1% low were not measured. People/small cars were omitted from proxy reflections, while a simplified bus remained. Report these limits when using this example; remeasure on a different scene/device rather than promising its percentages.
