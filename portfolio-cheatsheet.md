# 📷 Photography Portfolio — Cheat Sheet

## 🖥️ Local Development

### Start the local server

```bash
cd ~/Documents/projects/website
npm run dev
```

Then open **http://localhost:4321/website** in your browser.
Stop the server with **Ctrl+C**.

---

## 📸 Adding New Photos

### Full workflow for new photos

```bash
# 1. Export photos from Lightroom to src/gallery/Wildlife/ (or other folder)

# 2. Navigate to project
cd ~/Documents/projects/website

# 3. Auto-generate gallery.yaml from new photos
npm run generate

# 4. Preview locally
npm run dev

# 5. When happy, push to GitHub
git add .
git commit -m "add new photos"
git push
```

---

## 🚀 Pushing Changes to Live Website

```bash
cd ~/Documents/projects/website
git add .
git commit -m "describe what you changed"
git push
```

Then check **GitHub → Actions** tab — wait for green ✅.
Live site: **https://tobiaskleinn-online.github.io/website**

---

## 🔑 GitHub Token (Credentials)

### Clear old/expired token

```bash
git credential-osxkeychain erase
host=github.com
protocol=https
```

Press **Enter** twice. Next `git push` will ask for new credentials.

### When asked for credentials

- **Username:** your GitHub username
- **Password:** paste your Personal Access Token

### Create a new token

1. github.com → Avatar → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token → check **repo** scope → copy immediately!

---

## 🖼️ Gallery Management

### Regenerate gallery.yaml from images

```bash
cd ~/Documents/projects/website
npm run generate
```

### Check what's in gallery.yaml

```bash
cat src/gallery/gallery.yaml
```

### List all photos in a folder

```bash
ls src/gallery/Wildlife/
```

---

## 🛠️ Common Git Commands

```bash
# Check status of changes
git status

# See what changed
git diff

# Pull latest from GitHub
git pull

# Check git history
git log --oneline
```

---

## 🔧 Fixing Common Issues

### Fix case sensitivity (folder names)

```bash
git mv src/gallery/street src/gallery/temp
git mv src/gallery/temp src/gallery/Street
git add .
git commit -m "fix folder capitalization"
git push
```

### Merge conflict after pull

```bash
git config pull.rebase false
git pull
# If editor opens: Ctrl+X (nano) or :wq (vim)
git push
```

### Check installed Node version

```bash
node --version
```

---

## 📁 Project Structure

```
website/
├── src/
│   ├── gallery/          ← Your photos go here
│   │   ├── Wildlife/
│   │   ├── Landscape/
│   │   ├── Street/
│   │   └── Travel/
│   ├── gallery/gallery.yaml  ← Auto-generated, can edit manually
│   ├── components/       ← UI components
│   ├── pages/            ← Website pages
│   └── styles/           ← CSS files
├── public/
│   └── images/           ← Profile photo goes here
├── site.config.mts       ← Site title, name, profile image
└── astro.config.mts      ← Site URL and base path
```

---

## ⚙️ Key Config Files

### site.config.mts — Personal info

- Site title, your name, profile image filename

### astro.config.mts — URL settings

```typescript
site: 'https://tobiaskleinn-online.github.io';
base: 'website';
```

### src/gallery/gallery.yaml — Photo metadata

- Edit titles, descriptions, collections manually here
- Or run `npm run generate` to auto-update

---

## 🌿 Lightroom → Website Workflow

1. **In Lightroom:** Set IPTC Title field for each photo
2. **Export** as JPEG, max 2500px long edge, quality 85-90
3. **Copy** exported JPEGs to `src/gallery/[Category]/`
4. **Run** `npm run generate` to update gallery.yaml
5. **Check** locally with `npm run dev`
6. **Push** with `git add . && git commit -m "..." && git push`

---

## 🏷️ Lightroom Export Preset Settings

- Format: JPEG
- Quality: 85-90
- Long edge: 2500px
- Metadata: All (IPTC included)
- Output sharpening: Screen, Standard

## Homepage selection and cameraPhysics

Your photo workflow stays the same: add photos to `src/gallery/<Category>/`, run
`npm run generate`, then preview and build. Titles and EXIF properties are still
imported from the images. Preview images and larger lightbox images are generated
as WebP during `npm run build`; white borders are applied by CSS.

Edit `src/data/homepage.config.ts` to choose and order the leading homepage images.
Use paths relative to `src/gallery`, such as `Landscape/DSC01267.jpg`. If one is
removed, existing featured photographs fill its place automatically.

cameraPhysics is integrated locally at `/website/photography/`; use the Projects
section to open Camera Lab, Basics, or Tools.

The theme button follows the device preference initially and remembers a manual
light/dark choice in this browser. White photo borders stay white in both modes.

## Image-led homepage and compact gallery

The first path in `homepagePhotos` supplies the full-width landing photograph.
The selected photos and the full featured collection remain below it. The gallery uses the original
justified rows with small, even gaps; titles and camera settings appear when a
photo is opened. Layout uses known image dimensions without waiting for downloads.
White borders stay white in both themes. The Inter typeface is hosted locally in
`src/assets/fonts`, with its license alongside it.

## Featured photo strip and design guide

Selected work now includes every photo tagged `featured` in `gallery.yaml`.
The paths in `src/data/homepage.config.ts` come first; duplicates are removed.
Use the horizontal strip, its previous/next controls, or keyboard arrows to browse.
Open a photo to continue through the same collection in the lightbox.

Shared colors and dimensions live in `src/styles/tokens.css`. The design guide
stays in the local, ignored `design-guide/` directory. There is no public design
guide link, page route, or PDF. Builds publish only the contents of `dist/`.

To regenerate the PDF after changing tokens, run `scripts/create-design-guide.py`
with a Python environment containing ReportLab and pass the paths to regular and
semibold Inter TTF files. The website itself continues to use the local WOFF2 font.

## Integrated photography tools

The Projects section introduces Camera & optics with direct Camera Lab, Basics,
and Tools links. The module uses those same three tabs, with no extra overview or
language switch. The shared header and theme are used throughout. The standalone camera-lab project remains
independent. Run `npm run sync:camera` to import its latest built version, then
`npm run test:camera` and `npm run build`. See `docs/camera-physics-integration.md`.
