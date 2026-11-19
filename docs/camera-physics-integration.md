# CameraPhysics integration

The portfolio now hosts cameraPhysics at `/website/photography/` with three entry
points: `#lab` (Camera Lab), `#learn` (Basics), and `#tools` (Tools). The main portfolio header, footer, Inter font and theme preference are
shared. Gallery photographs remain at `/website/collections/`.

## Updating from the camera-lab project

The integration is a local snapshot, so changes in the separate camera-lab project
are imported deliberately:

```sh
npm run sync:camera
npm run test:camera
npm run build
```

The source defaults to `../../chatGPT_area/camera-lab/dist`, keeping the existing
camera-lab project accessible after moving this website to `projects/online/website`.
To use another built source directory:

```sh
npm run sync:camera -- /absolute/path/to/camera-lab/dist
```

The importer writes the runtime to `public/camera-physics`, the page fragment to
`src/data/camera-physics.html`, and isolated layout rules to
`src/styles/camera-physics-import.css`. It never edits camera-lab. Customize the
portfolio adapter in `src/styles/camera-physics.css`; keep imported files generated.
The upstream standalone HTML and duplicate model directory are omitted.

## Theme and runtime

The portfolio owns the light/dark setting. Imported styles are scoped to
`.camera-app` and mapped to the neutral tokens in `src/styles/tokens.css`.
Instructional colors in ray diagrams and natural scene materials remain distinct.
The integrated site is English only. Previous saved camera-lab language preferences
do not change it. The language controls and standalone overview are omitted.

The module runs in the page itself; only the existing 3D scenes use their original
sandboxed iframe architecture. The larger scene-document bundle loads when the
camera lab is opened. The main homepage does not import cameraPhysics JavaScript.
Scene documents receive the portfolio palette and an embedded Inter font.

The Projects anchor opens a full-height Camera & optics section, with direct
Camera Lab, Basics and Tools links. The project has those same three tabs. The
Learn & experiment overview, Color and Composition placeholders, and overview
breadcrumbs are omitted. Old `#explore` links fall back to the lab.

Slider contrast roles live in `src/styles/tokens.css`; the shared styling in
`src/styles/slider-controls.css` is also injected into the embedded 3D scenes.

The inherited third-party asset notices remain in
`public/camera-physics/THIRD_PARTY_LICENSES.txt`.

## Publication boundary

The design guide stays in the ignored, local `design-guide/` directory. Neither
its page route nor its PDF is included in `dist/`. Publishing uses only `dist/`.
