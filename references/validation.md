# Installed Starter verification — 2026-10-22

Real projects were initialized outside the Seoul workspace from the installed global Skill. Tests used local vendored Three.js, not the original project, its server or its font file. Temporary projects and servers are removed after verification; the installed Skill and evidence below remain.

## Initializer / build

- Created `independent-world` through `scripts/create-project.py`: title, independent ES modules, config, local dependency closure and project scripts present.
- Existing-destination invocation returned exit 2; configuration hashes before and after were equal. The final generated project source matched the Starter byte-for-byte except the intentionally configured identity/settings fields. See [initializer evidence](verification/initializer-results.json).
- Created a second project `portable-world` from the final Starter: seed 173; 36 × 30 terrain; 12 people; 3 vehicles; rain weather; meadow relief. Camera framing scales when CLI terrain dimensions change.
- Python and all 15 authored JavaScript modules pass syntax checks; the official skill-creator quick validator returned `Skill is valid!`. Its missing PyYAML dependency was supplied from verified PyPI source in the temporary validation directory only, without changing global Python or other Skills. These checks complement, not replace, runtime tests.
- Exporter traversed 30 ES modules (15 authored modules/config/scene + 15 official Three.js modules) into one approximately 2.95 MB HTML, with inline CSS and Three.js license. No package installation was used.

## Browser observations

The clear-weather default project (1440 × 1000) rendered three procedural buildings and the floating masonry base. All 18 people spawned successfully. Over a 2.2-second sample 13 walking people and all 4 vehicles moved; idle activities and waiting crossers were intentionally stationary. Three-level toon gradient and 68 cached toon materials were present and the rendered screenshot was reviewed.

Actual pointer dragging changed the camera; wheel zoom reached 1.5867; Reset returned to [70,55,82] and zoom 1. Day/Night changed window emission from 1.1 to exactly 0, with exact daytime unlit glass `#263b40`; road-lamp bulbs changed from `#f1cc8c` / emission 2.6 to gray `#737c80` / emission 0. Traffic and People each passed pause, hide and active-resume-mode checks. The toolbar fit a 390 × 844 viewport. No page errors, console errors or failed requests occurred in the completed run.

The final configured rain project was observed for roughly 32 seconds: automatic camera orbit moved; all 3 cars moved and changed heading around curved route corners; 9 of 12 people moved over the observation, including 2 crossing pedestrians. All LOOP, LOOP_AMBER, LOOP_CLEAR, PED and PED_CLEAR stages were observed; driving and braking were observed. All people spawned. Rain diagnostics showed 300 particles. No page errors or failed requests occurred.

## Standalone export

The final exported `portable-world.html` was opened via `file://` in a separate offline browser context. It rendered the same 3 buildings and three-step toon materials; people and cars moved, Day UI switched correctly and window/lamp emission reached zero. Observed HTTP(S) requests: 0. Page errors: 0. This validates the actual exported file, not just the development server.

## Independent fresh-context forward test

A separate agent with no Seoul conversation/project context loaded only the installed Skill. It initialized a neutral `Skill Forward Test` project with 6 people, 2 vehicles and mist; served it on an ephemeral port; verified movement, camera controls, Day/Night and three-state UI; exported and opened the file offline with zero HTTP requests and page errors. It used a separately launched browser after encountering an occupied shared automation profile, then removed its project and server. No blocking Skill usability gap was reported. Default demo copy should be adapted to the new place, and the initial auto-orbit delay is documented in architecture.md.

## Evidence

- [Browser results](verification/browser-results.json)
- [Clear night](verification/neutral-night.png), [clear day](verification/neutral-day.png), [narrow viewport](verification/neutral-mobile.png)
- [Configured rain](verification/configured-rain.png), [offline export](verification/offline-export.png)

## Limits

These are finite browser samples. They do not prove all possible traffic arrangements, seed values or future crowd densities are collision-free. The adapted simulation has one controlled conflict area, authored sidewalk paths, simple footprints and closed/compatible lane routes. Multiple independent intersections, robust pathfinding, complex seat selection, national traffic rules and newly authored terrain/buildings need additional scene work and relevant checks. Mobile layout was tested in a browser viewport; physical-device performance has not been measured. The original source hashes in provenance.json are preserved as extraction evidence; they are not a runtime dependency.
