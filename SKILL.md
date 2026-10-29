---
name: little-worlds-3d
description: Build interactive Three.js low-poly 3D dioramas, miniature cities, floating neighborhoods and Little Worlds country scenes using a bundled offline starter, procedural buildings, people, vehicles and HTML exporter. Use for Three.js 微缩城市、可交互浮空街区 and new country scenes in the Little Worlds series.
---

# Little Worlds 3D

Use the working code in `assets/starter/` before generating new infrastructure. The Starter contains locally vendored Three.js 0.180.0 and needs only Python 3 for serving/export. It does not read the Seoul project or require npm installation.

## Start a world

1. Inspect the destination and the bundled `project.config.js` and `scene.js`. Preserve existing projects; for an existing Little Worlds project, edit its scene/config in place rather than initializing over it.
2. Resolve this Skill's directory from its loaded path. Create a new project with its initializer (destination must not exist):

   ```sh
   python3 <skill-dir>/scripts/create-project.py --name new-world --destination /absolute/new-project
   ```

   Optional flags: `--title`, `--seed`, `--width`, `--depth`, `--people`, `--vehicles`, `--weather clear|mist|rain`, `--terrain plaza|meadow`, `--day`.
3. Run the generated `scripts/serve.py`; edit `scene.js` for the new place's architecture, terrain and route layout, and `project.config.js` for counts, camera, weather and visual settings. Reuse the core, actor models, lighting and toolbar unless the user needs a change. Do not carry Seoul coordinates, Korean text or its screenshot-specific window overrides into new work.
4. Read [architecture.md](references/architecture.md) for module contracts and route/signal constraints. Read [art-direction.md](references/art-direction.md) while designing country-specific scenery. The neutral Starter is a working demonstration, not a finished country scene.
5. Inspect real browser screenshots at useful camera angles, Day/Night, and a narrow viewport. For new or changed layered surfaces, also watch continuous camera orbit and model motion for view-dependent flicker; a still screenshot and zero console errors do not establish depth stability. Verify visible people/vehicle movement, orbit/zoom/reset, the three-state controls and absence of blocking browser errors. Keep validation proportional to changed systems; source syntax alone is not visual proof.
6. Export with the project's `scripts/export-html.py`. Verify the exported page itself; it embeds JavaScript, CSS and Three.js and should run without a network connection. Rebuild after source edits.

## Surface depth stability (Z-fighting)

When extending vehicle bodies, facades, road markings or layered signs, read [surface-depth-stability.md](references/surface-depth-stability.md) before modeling and use its focused runtime checks before delivery.

- Give each visible opaque outer surface one owner. Reuse the vehicle factory and simulation, but do not blindly stack a same-width specialized shell over the generic car shell; use a narrower chassis or replace the underlying panels.
- Place trim, windows and signs outside the host surface with clearance measured from the attachment's nearest face, including its thickness. Check side, front, rear and roof faces after final scale/transforms; moving only a part's center does not prove clearance.
- Resolve conflicting geometry first. Do not hide it by globally disabling depth testing/writing, changing draw order or camera framing. Reserve local polygon offset for intentional surface decals, with runtime verification.
- Check the changed surfaces from both sides, at shallow angles and at near/default/far zoom while moving objects along their actual paths. Verify relevant light modes and the rebuilt offline export. Distinguish Z-fighting from shadow acne, transparency sorting and thin-line aliasing before choosing a fix.

## Wet-road reflections

When adding rain-soaked streets or optimizing reflection lag/cost, read [wet-road-reflections.md](references/wet-road-reflections.md). It covers cached mirrored proxies, proxy-only render targets, opaque road shader composition, same-frame camera updates, dry-mode shutdown and a selectable legacy fallback.

Keep world heights, proxy selection and quality tradeoffs scene-specific. Do not import London's layout/color cutoffs or treat its short performance samples as a guarantee for another world. Preserve existing rain-particle fixes when the request concerns reflection only.

## Reuse boundaries

The original implementation was extracted and adapted, not merely described. [extraction.md](references/extraction.md) distinguishes direct reuse, configurable adapters and excluded Seoul-only content. [provenance.json](references/provenance.json) records source hashes and function lineage. [validation.md](references/validation.md) records the installation's actual checks and limits.

Do not regenerate the base systems from prose. Extend the shipped ES modules and keep scene-specific data outside the core. The simulation is authored-path based with one shared controlled conflict area; multiple independent intersections, navigation meshes, country-specific driving conventions and new architecture require explicit scene work.
