# Pulse — GitHub Pages preparation

Connected project repository: **https://github.com/OffKeyMediaFilms/PulseApp.git**, on main, separately from the original **PULSE** repository. Project-local Git author/account settings use OffKeyMediaFilms; global settings are unchanged. Publishing Pages remains a manual step.

## Build and preview

Use Node.js 24 LTS (minimum 22.12):

```powershell
cd C:\Pulse-Movie-App
npm ci
npm test
npm run build
npm run check:pages
npm run check:pages:http
npm run preview
```

Open http://localhost:4173/PulseApp/. The HTTP check starts and stops its own loopback-only preview, so run it before starting a persistent preview. For editing, use npm run dev and http://localhost:5173/PulseApp/.

## Files prepared

- vite.config.js: base is '/PulseApp/'. The app design, scene layouts and content configuration are retained.
- package.json and package-lock.json: Vite dependency and reproducible npm ci builds.
- .github/workflows/deploy.yml: manual-only build/test/deploy workflow; guarded to the OffKeyMediaFilms/PulseApp repository identity. It does not run on pushes. GitHub Actions receives only dist as the hosting artifact.
- scripts/pages-assets.mjs: copies approved app media/icon/image types from public while preserving existing public/videos and public/images paths, emits the root manifest, and generates the compiled service-worker precache list.
- sw.js: caches only this app's shell, with cache names and requests restricted to its own scope. It does not unregister workers or delete caches belonging to /PULSE/ or other paths. Camera recordings/IndexedDB are not part of this cache.
- scripts/check-pages.mjs and scripts/check-pages-http.mjs: verify subdirectory asset paths, manifest/icons, service-worker entries, clean output and the 21 main scene URLs.

Source configs remain in src/config. They are bundled for hosting, not moved or replaced. Root manifest.webmanifest and sw.js remain editable source templates. Do not edit generated dist files.

## Connected repository and future updates

The only remote for this checkout is origin: https://github.com/OffKeyMediaFilms/PulseApp.git. Its current GitHub visibility is public, as created by the owner. Do not repoint this checkout to SiteWebPixel/PULSE or change repository visibility as part of code updates.

Project-local author: OffKeyMediaFilms <280518034+OffKeyMediaFilms@users.noreply.github.com>. Git authentication is a separate sign-in and must be verified as OffKeyMediaFilms before pushing. Global user settings and other repositories are left unchanged.

Review files before staging. Include app source/config, package files/lockfile, Vite config, .github workflow, scripts, test code, README/this guide and approved placeholder icons. Never stage node_modules, dist, tests/fixtures, recordings, exports, imports, secrets, screenplays or production documents. Recorded/imported phone videos live in IndexedDB rather than the repository. Video extensions are ignored by default; deliberately approve any future film footage separately.

For later approved updates:

```powershell
cd C:\Pulse-Movie-App
git status
git remote -v
git add .gitignore .github package.json package-lock.json vite.config.js index.html manifest.webmanifest sw.js README.md DEPLOYMENT.md src scripts tests public/icons public/images/.gitkeep public/videos/.gitkeep
git diff --cached --name-only
git diff --cached
git commit -m "Update Pulse app"
git push origin main
```

Uploading code does not deploy it automatically. The workflow is manual-only and runs only in OffKeyMediaFilms/PulseApp. Do not change repository visibility or force-push to resolve conflicts.

## Publish later — a separate explicit step

After upload and approval to publish:

1. In **PulseApp > Settings > Pages**, choose **GitHub Actions** as the source.
2. In **Actions**, select **Deploy Pulse to GitHub Pages**, then **Run workflow** on main.
3. The workflow uses Node 24, runs npm ci, tests, build and Pages checks, then deploys only dist through the github-pages environment. It requires contents:read for building and pages:write/id-token:write for deployment. No personal token is embedded.
4. The expected URL is https://OffKeyMediaFilms.github.io/PulseApp/. GitHub supplies the final URL. A direct filming route is https://OffKeyMediaFilms.github.io/PulseApp/?film=1#/scene/9.

Do not manually upload the project root as the Pages artifact: it includes development files, and the deployment output is dist.

## HTTPS phone checks

GitHub Pages' HTTPS origin supports camera/microphone permission requests and service workers where the phone browser supports them. Record Video still requests permission only after a tap, and Start recording remains a separate action. No backend, cloud video upload, accounts, or public livestream is added.

- Open the new HTTPS URL in iPhone Safari or Android Chrome; test permissions, front/rear cameras, supported MediaRecorder output, playback and export.
- Saved Videos uses IndexedDB on that device/browser. Recordings from localhost or an old domain do not automatically move to the new origin. Export and import them manually. Scene reset does not erase saved recordings.
- Keep the same address/browser/profile to reuse the library. Browser eviction, private browsing, clearing site data or uninstalling can remove it; export important takes. Paths within the same GitHub account share an origin, so the repository subdirectory is not a browser-storage privacy boundary.
- Add to Home Screen through Safari Share or Chrome's install option. The emitted manifest starts and scopes the app at /PulseApp/. Notch/safe-area styles and standalone display are retained.
- Visit once online before offline testing. The shell/icons are cached; film videos are not precached. Missing footage still displays placeholders.

The local build and simulated project-subdirectory HTTP checks do not verify GitHub account settings or the hosted HTTPS device behavior; those checks happen after an approved deployment.

Official references: [Vite GitHub Pages guide](https://vite.dev/guide/static-deploy.html), [GitHub custom Pages workflows and plan availability](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
