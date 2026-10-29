# Art direction and review

Build the new place's identity in `scene.js`: facade proportions, roofs, setbacks, windows, materials, shopfront lettering and props should reflect its architecture. Generic mass count is not a target. Use references from the user; obtain additional reference material only when it supports the task. The bundled scene is a neutral code demonstration.

Maintain a coherent miniature scale: the shipped person is roughly 1.3–1.7 world units tall; a passenger car is 2.6 × 1.14 units, a bus 4.6 × 1.55. Assess lane and crosswalk proportions against those objects. Crosswalk stripes run parallel to the walking direction. Author sidewalk loops and activity pockets with enough lateral room for two-way walkers; do not densely spawn all characters into one corridor.

Use the shared three-step toon gradient and restrained edge outlines. Give large masses quieter colors and a few semantic accents. Keep signs readable at the default camera and put warm pools only above surfaces. Prefer shared materials and instancing over a new light or material per decorative part. A cached material is shared: clone it when only one instance should change.

Room states belong to logical interiors, not independent facade panes. Corner rooms link adjoining walls. Daytime window emission must reach zero; road-lamp bulbs become gray. Bloom should reinforce selected night accents rather than whitening every surface. New scripts/fonts/resources must be included locally before claiming an offline export.

Register obstacle footprints for new props. `treeIfClear` checks the crown envelope against buildings; its returned boolean indicates skipped placements. Avoid overlapping road/pavement faces; keep decals and warm pools separated vertically to prevent depth flicker.

Review screenshot composition from the home camera and two rotated angles, in Day and Night. Check roof silhouettes, floating objects, tree/building intersections, uniform room states, readable signs, cutaway thickness, vehicle turns and crossings. Inspect a narrow viewport for control overflow. Use actual rendered evidence, not only object counts or a successful build. Physical-device performance remains unverified unless tested there.
