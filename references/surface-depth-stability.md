# Surface depth stability — modeling and verification

## Observed failure: LAST STOP 66

The project added semi-truck and RV branches to the shared actor factory. Both still received the generic full-width rounded car shell before their specialized body was added. The differently colored outer side faces occupied the same plane over a shared area. RV color bands were also body-sized solids with the same front/rear extent as the outer shell. Their end faces overlapped the shell end faces.

The depth buffer stores finite-precision depth values. Equal or nearly equal visible depths have no reliable geometric separation; as the model or camera changes position/orientation, rounding and rasterization can make a different face win. The result looks like crawling patterns, broken stripes or rapidly alternating colors. It is a geometry/depth conflict, not a texture animation or a traffic-path fault. MeshToonMaterial and instancing do not prevent it, and the browser can report no errors.

The confirmed project fix replaced the generic car shell with a narrower chassis for these tall vehicles, retained one specialized outer shell and separated surface trim into side/end attachments. Removing the generic shell also removed the tractor's inherited front shape, so a dedicated hood was needed; glass, grille and bumper were positioned against the intended new surfaces. Preserve dependent geometry when removing an overlapping shell.

The installed neutral Starter has car/taxi, van, bus and scooter branches, not these project-specific semi/RV branches. Its generic-shell reuse point contains a reminder for future extensions. Do not copy all country-specific models back into the Starter merely to address this issue.

## Model construction rules

1. **Audit shared geometry before adding a variant.** List what the common branch already builds. A new vehicle variant can reuse wheels, materials, batching and simulation without inheriting every outer panel. Give opaque panels a single visible owner; remove hidden duplicate skins or narrow the underlying chassis. Partial solid intersection is acceptable where the intersecting faces are fully internal; overlapping exposed coplanar faces are the problem.
2. **Use real attachment clearance.** For a host flat side at `x = side * width/2` and a panel of thickness `t`, place its center at `side * (width/2 + gap + t/2)`. Then the nearest panel face clears the host by `gap`. Apply the equivalent calculation at the front/rear and roof. Rounded/beveled hosts need inspection of their actual geometry, not only bounding-box dimensions.
3. **Separate all faces that remain visible.** A slightly wider body-sized stripe can clear side faces while its end faces still coincide with the host. Prefer thin side/end trim pieces with deliberate corner joins. Keep doors outside trim when they overlap in projection, and account for final parent scale, rotation and batching transforms. Keep dimensions and collision footprints consistent with any silhouette changes.
4. **Choose clearance in the model's scale.** In the Route 66 fix, local nearest-face gaps of 0.014 units for trailer ribs and 0.017 units for RV stripes were used; these are starting examples, not a universal epsilon or a guarantee for all cameras/devices. Avoid arbitrarily tiny offsets, which can vanish at the final view/depth precision, and excessive offsets that make trim float visibly.
5. **Prefer geometric fixes to renderer overrides.** Keep normal depth testing/writing for opaque bodies. `renderOrder` alone does not resolve their depth conflict. Do not globally disable shadows, depth tests, depth writes or change the art direction to conceal it. For deliberately coplanar decals such as road paint, a small normal offset or localized polygon offset on a dedicated material may be appropriate; isolate it from shared materials and verify side effects. Never rely on a single camera angle.

## Diagnose before changing unrelated systems

- **Z-fighting:** two visible surfaces have matching/near-matching depth; colors or patterns swap with motion. Inspect actual surface positions and thickness; temporarily hide one candidate to isolate the overlap.
- **Shadow acne:** artifacts follow a shadow-casting light and disappear when that light's shadows are temporarily disabled. Investigate shadow geometry/bias separately; disabling shadows is a diagnostic step, not the opaque-surface fix.
- **Transparency sorting:** order changes involve transparent glass/glow objects; inspect transparent material depth and sorting behavior separately.
- **Aliasing:** very thin lines/ribs shimmer as they become subpixel. Improve thickness, simplification or appropriate antialiasing after excluding overlapping faces.

Use temporary debug changes only to identify the cause, and restore production rendering before verification. Do not infer the cause solely from the word “flicker.” Camera near/far precision can worsen close-surface conflicts, but tuning the camera does not make duplicate exposed shells valid geometry.

## Focused runtime acceptance

For the changed model/surface family, rather than every unrelated object:

- Observe a continuous full orbit, including the reverse side and shallow grazing angles; sample roughly eight azimuths when useful. Test near, default and far zoom. Capture close views of the previously conflicting areas, not only a distant hero image.
- Observe vehicles translating and turning on their real routes. Check a parked instance too when the same model factory serves both. Inspect front/rear/end faces of trim, windows, doors and roofs. Static screenshots support geometry review but cannot alone prove absence of temporal flicker.
- Check the project's supported light modes (Day/Sunset/Night where present), to distinguish depth conflicts from shadow or lighting artifacts. Keep existing traffic behavior and pedestrian systems intact unless a genuine path/footprint change requires adaptation.
- Rebuild and load the standalone HTML, preferably offline, so delivery includes the corrected model rather than an older embedded module. Record actual observations, errors and untested limits; do not claim all hardware/angles are proven stable by finite samples.
