# Pulse — local film prop foundation

**Current video workflow:** record or choose a file, preview, save locally, post to a scene feed, and reopen it from Saved Videos. See “Local recording, posting and Saved Videos” below.

All files live directly in C:\Pulse-Movie-App. No accounts, backend, real payments, public broadcasts, external assets, or publishing services are used. Dashboard numbering is selection numbering; original scene/shot references appear on each card and in configuration. Screen 17 is Shot 14O; the bright Scene 17 / Shot 17E is the Clean Pulse subview under selection 19.

## Run on Windows

Use Node.js 24 LTS (minimum 22.12), open PowerShell, then:

```powershell
cd C:\Pulse-Movie-App
npm ci
npm run dev
```

Open http://localhost:5173/PulseApp/. Stop with Ctrl+C. npm test runs the checks; npm run build uses Vite to create dist. Use npm run preview and open http://localhost:4173/PulseApp/ to inspect the production build. See [DEPLOYMENT.md](DEPLOYMENT.md) for the prepared, manual-only GitHub Pages workflow.

## Editing guide

- src/config/scenes.js: all 21 selections, shot references, subviews, labels, prompts, notifications, notification messages, delayMs and durationMs, payout amount and reach. Override username, profileImage, caption, comments, counts, engagementStep, viewerCount or liveComments per scene or subview. Each payout notice can have its own amount. Notification arrays support independent absolute delays from scene start; overlapping notices queue sequentially. Set automatic:false for manual-only notices; sound:true enables an optional soft tone after browser audio is unlocked by a tap. Autoplay sound may be blocked.
- src/config/settings.js: common usernames, captions, comments, default engagement and simulation speeds. Counts use dashes until approved figures exist. Set counts to numbers to show increases after posting, refresh, or viral activity. engagementStep controls growth. No unsupported payout or engagement numbers are displayed by default.
- src/config/media.js: all footage paths, poster paths, aspect ratios. Copy clips to public/videos and thumbnails/profile images to public/images. Example src: 'public/videos/kerry.mp4'. Use browser-supported MP4 (H.264/AAC) or WebM. Empty or failed paths show Insert video here. Controls support play/pause, mute, loop and fullscreen when available. Native iPhone fullscreen varies by browser.
- src/styles/theme.css: shared palette and three editable themes.
- src/styles/app.css: spacing, typography and layout.
- public/icons: replaceable SVG brand icon and 192/512 PNG PWA icons.

## Crew workflow and retakes

Open a dashboard card, then Crew controls. Select a shot subview, set timing, test notifications, pause/resume timers, reset engagement or switch theme. Test changes are temporary; edit scenes.js to save them. Film Mode restarts the take and hides the entire crew interface. Hold the Pulse logo for 1.5 seconds to reopen it (Shift+P on a keyboard). Use Reset scene for retakes. Replay notifications restarts their sequence without resetting other interactions. Reset scene clears posting, comments, recording, live and engagement state. Each new route starts independently; no state is sent between phones or persisted remotely.

Direct routes: #/scene/1 through #/scene/21. Subview routes are linked on the dashboard, for example #/scene/19/clean. For a direct filming link use ?film=1#/scene/12. The root always opens the crew dashboard. Crew buttons never appear in Film Mode; intentionally holding the logo restores them. Notifications start at route/reset time or Film Mode restart. Pausing timers freezes simulated uploads, feed growth and notifications; real camera capture uses its own elapsed timer. Timers run while the page is active; avoid locking the phone or switching apps during a take.

## Phone preview and installation

Connect the phone and Windows computer to the same trusted Wi-Fi. Run npm run dev. Find the computer's IPv4 address with ipconfig and open http://YOUR-IP:5173/PulseApp/ on the phone. If Windows asks, allow Node on your private network only. No internet publishing is involved. Stop the server when finished.

LAN HTTP previews support the app interactions but generally do not qualify for service workers or full PWA installation. For standalone installation on phones, use a trusted HTTPS local setup or a future approved HTTPS static host. On iPhone use Safari > Share > Add to Home Screen; on Android use Chrome > Add to Home Screen/Install. Standalone browser chrome removal depends on the platform. The app includes safe-area padding and supports portrait screens. Its UI remains responsive in landscape; it does not force orientation. Offline shell caching works after a successful secure-origin visit; videos are not pre-cached. The Vite build automatically versions the service-worker cache. Do not clear site data to update the app: doing so can erase saved recordings.

## GitHub Pages preparation

See [DEPLOYMENT.md](DEPLOYMENT.md). The base path is /PulseApp/, and the deployment workflow runs only when manually requested. The project remote is https://github.com/OffKeyMediaFilms/PulseApp.git. Project-local Git identity uses OffKeyMediaFilms; global Git identity is unchanged. The original PULSE repository is untouched. Pages deployment remains manual.

## Verification

Foundation tests cover selection mappings, shared rendering, exact required text, clean scene overrides, notification-clock pause/reset behavior, PWA icons and relative paths. Browser QA checks all 34 routes, mobile portrait overflow, and core interactions. Real media playback, phone hardware behavior, sound permissions and Add to Home Screen need final checks on the actual iPhone/Android devices with approved footage and a secure origin.

## Shared design update

The actor UI now follows the original https://sitewebpixel.github.io/PULSE/#video-001 reference: near-black background (#080808), red (#ff2424) wordmark and accents, translucent fixed header, three feed tabs, full-height snap panels, overlaid captions/action rail and five-item bottom navigation. The source HTML, stylesheet, script and mobile rendering were inspected. Story text, fictional account numbers and horror intro from that reference were not imported. Scene/media/settings configurations and original shot mappings remain intact.

The original social controls were mostly decorative. This app retains working posting, recording, live simulation, notifications, resets and payouts, and adds functioning comment/search/share sheets and save toggles. Share opens a local menu with Copy link; it does not post anything externally. Tap a feed username to open Profile. Profile and standalone Watch retain replaceable media players.

Normal, darkening and dark palettes now share the original dark identity with progressively stronger red tint. The Scene 17 / Shot 17E clean subview keeps a bright palette. Edit src/styles/theme.css to tune all palettes. Film Mode still hides crew controls; hold the wordmark for 1.5 seconds or press Shift+P to reopen them.

Responsive browser checks covered all 34 routes at 320x568, 390x844 and 430x932 with no horizontal overflow and navigation anchored to the viewport bottom. Actual iPhone/Android hardware, safe-area insets and standalone installation still require on-device checks on a secure origin. No deployment or GitHub changes were made.

## Earnings, per-video data and local camera (current)

All 21 numbered selections and existing shot routes are retained. A Scene 5 recording subview is available from selection 4, at #/scene/4/argument; this is original story Scene 5, not numbered selection 5 (which remains Shot 6C).

### Configuration files

- **src/config/payouts.js**: selection 3 enrollment labels/confirmation; selection 5 / Shot 6C balance dashboard; selection 11 / Shot 10D performance dashboard; selection 21 / Shot 18F Skye dashboard and payout confirmation. Set estimated, available, pending, qualifiedViews, rpm, totalViews, projectedReach, history, recentPayouts, trend.labels, trend.values and videoEarnings. null displays a dash. Trend values must be numeric to draw a line; missing data never fabricates a trend. Values are display-only, not bank transactions. Legacy scene amount/reach overrides still work when replaced with approved values.
- **src/config/feeds.js**: each entry (s1-v1 means selection 1, video 1) owns video.src, video.poster, video.aspect, username, profileImage, caption, independent counts, comments, notifications, theme and viral settings. sceneFeeds maps selections to ordered video IDs; scene.feedIds can override the list for a subview. There are 63 separately editable configured entries, not one shared engagement object. Leave unknown totals null; a simulated +N shows activity since the scene opened without inventing an absolute total. Enter different approved base numbers for each video when supplied. Likes toggle, follows toggle, comments and shares affect only the selected video. No dialogue or unsupported engagement totals have been supplied.
- Per-video notifications accept event: 'enter', 'like', 'follow' or 'share', plus message, delayMs, durationMs, sound and optional amount. They trigger once per event entry per retake. Delay is measured from the interaction; ordinary scene notifications still measure from scene open. Set viral.enabled, viral.intervalMs and viral.steps independently per video. Selection 3's first video enables growth for the viral shots. animationMs controls the engagement pulse.
- **src/config/camera.js**: camera facingMode, microphone default, preferred recording MIME types, capture size/bitrate, download filename, scene-specific prerecorded media keys and prompts. live contains viewerCount, viewerSteps, comments, commentIntervalMs, heartIntervalMs and heartAnimationMs. null viewerCount shows unknown totals plus simulated deltas. scene.camera and scene.liveSettings offer optional per-shot overrides. Camera/live animation timers use real elapsed time; crew notification Pause does not pause real capture.
- **src/config/scenes.js**: original shot references, all scene prompts, automatic payout notifications and their amounts/delays, and production route mappings. Shot 7J, 14M and 14O notices remain independent. **src/config/media.js** remains the source for standalone footage and prerecorded camera media keys. For full-screen feed footage, edit each video's descriptor in feeds.js.
- **src/config/settings.js** retains shared non-feed defaults and posting speed. Per-video counts and growth now belong to feeds.js; camera/live simulation settings now belong to camera.js. **src/styles/theme.css** still owns the black/red/gray palette and clean Scene 17 exception.

### Using the camera

Open a recording/live scene, then tap **Open camera**. Only that tap requests camera/microphone access. Allowing access starts a muted live preview, never recording. Tap **Start recording** separately; **Stop recording** opens playback and **Save recording** downloads the local blob with a detected file extension. **Retake** returns to source selection; already saved takes remain in IndexedDB. Stopped recordings and imports are automatically saved on this device by default. Wait for “Saved on this device” before leaving. If storage fails, export before leaving. Videos are never put on a server, in the project folder, or in service-worker caches. The browser decides where an exported download is saved. On iPhone, a download may open a native preview; use the browser's save option if needed.

**Flip** requests the other facing camera when available; some devices have only one camera or keep their available camera. **Mic on/off** toggles the audio track. If microphone access fails, choose **Open camera without microphone**. Enabling audio afterward requires another explicit tap and may require permission. Switching cameras is disabled during a take. Leaving the view, restarting a take, backgrounding or closing releases camera tracks; completed or stopped takes can remain saved in IndexedDB; a camera permission response arriving after navigation is also safely released. Downloads contain camera/audio media only: HTML Pulse overlays are not baked into recordings. Composited recording is a future feature.

Choose **Use video** to use the configured prerecorded clip instead of requesting permissions. With no file, a placeholder and clear message appear. Configured prerecorded takes simulate the actor-facing timer/indicator and play the supplied footage; they do not create a new recording. Upload Video imports a phone file into the local library instead. The simulated live view uses either source, has a local timer, comments, viewer changes and hearts, and **End Live** stops it. It does not broadcast or create an account.

Camera access requires HTTPS or localhost. A phone visiting http://COMPUTER-IP:5173 normally cannot use MediaDevices; use prerecorded footage there, or arrange a trusted local HTTPS setup before device filming. No HTTPS service or internet hosting was configured or deployed by this update. Browser permission, codec and download behavior still need validation on your actual iPhones/Android phones.

### New checks

Run npm test for permission gating, format detection, denied/unsupported camera errors, local blob creation, preview/download/retake binding, mic switching, camera switching, live resource cleanup, delayed permission cleanup, per-video engagement isolation and payout rendering. The capture tests use mocked devices/recorders; they do not film the operator. Browser checks cover enrollment and payout confirmations, video earnings detail, independent likes/comments/follows/shares, viral growth, fallback placeholders, all main/subview routes and responsive layouts. Real camera hardware and final footage playback remain an on-device check.

## Local recording, posting and Saved Videos

This extends the existing layouts and all 21 dashboard selections. There is no upload endpoint, backend, cloud account or real broadcast. The existing local development server serves app files only; video capture, gallery selection, IndexedDB and export run in the phone browser.

### On a phone

1. Open the relevant recording screen, or use **Create > Record Video**. Allow camera and microphone access. A live preview opens; recording does not start until **Start recording** is tapped.
2. Alternatively choose **Upload Video** to pick a video from Photos/Gallery or Files. The file is read locally.
3. Stop the recording to see its preview. Use native playback controls or **Play / pause**. Wait for **Saved on this device**. **Save Video** retries local saving if needed; **Export Video** keeps a separate file.
4. Tap **Post to Pulse**. The local posting animation runs, then the video appears in that selection's first feed slot. No bytes leave the device. Scene 1's **Refresh** updates simulated engagement.
5. Open **Saved Videos** from Create, the camera screen, Profile or the crew dashboard. Choose **Replay / Select**, then play, post to the current scene, retake or export. Saved takes remain available after closing/reopening the same browser or installed Pulse, subject to browser storage availability.
6. For a separate copy, choose **Export Video**, then the native **Save Video** link. From a recorded camera preview, **Export Video** is a direct download link. On iPhone, use the browser's Downloads/Files or native save controls if shown. The web app cannot choose the phone's exact download folder.
7. To transfer footage between phones, export it on the first phone, transfer that file using a method chosen by the crew, then use **Import Video** in Saved Videos on the second phone. Pulse itself performs no transfer.

**Reset scene never deletes saved recordings or assignments. Retake keeps previously saved takes.** Deleting requires **Delete > Delete video** in Saved Videos, and removes that video plus its assignments. Other saved takes remain. If storage is unavailable/full, the camera preview reports the error and its export link remains available.

### Recording routes and original story numbering

| Original story scene | Existing selection / route |
| --- | --- |
| 1 | Selection 1, #/scene/1/capture; posting also remains at #/scene/1/post |
| 2 | Selection 2, #/scene/2/capture |
| 5 | Selection 4 subview, #/scene/4/argument (selection 5 remains Shot 6C earnings) |
| 9 | Selection 9, #/scene/9, “Ask what happened” |
| 14 | Selection 15, #/scene/15, “Keep Filming” |
| 16 | Selection 19 subview, #/scene/19/live, “Stay Live” |

In Live, select **Record live footage** after opening the camera and before **Go live** to record while simulating the stream. **End Live** finishes the take and opens the same saved preview workflow. Leaving the toggle off simulates a live camera preview without recording. Neither option broadcasts. Camera tracks are released on navigation/backgrounding. A final recording chunk that arrives during cleanup can still be saved locally. HTML Pulse overlays are not included in the recording.

### Crew assignments

Outside Film Mode, expand **Assign to scene** on a Saved Videos entry, choose a numbered selection (shot references are shown), and tap **Assign video**. That scene uses the same saved video in its first feed slot and relevant playback/prerecorded views. Assignments are stored as references, so reusing a clip does not copy its bytes. Compatible identical imports are also deduplicated with SHA-256 when browser crypto is available. The recording retains its original fictional creator and source scene/shot metadata.

Assignments are hidden in Film Mode. To manage them while filming, hold the Pulse logo to open crew controls and choose **Saved Videos / Assign**; that explicitly leaves Film Mode. Re-enter Film Mode before the next take. **Use configured footage** in crew controls removes only that scene's assignment, keeping the video in Saved Videos.

### Editing and storage

- **src/config/local-videos.js**: database name/version, maximum file size, accepted gallery file types, posting duration and automatic-save setting.
- **src/config/camera.js**: capture formats, camera defaults, prompts and simulated live viewer/comment/heart settings.
- **src/config/scenes.js**: all original selections, shot references, additional recording routes, notification messages/timing.
- **src/config/feeds.js** and **src/config/media.js**: configured placeholder/final footage. Local assignments override them at runtime; the configuration files are not rewritten by recordings.
- **src/utils/video-store.js**: IndexedDB adapter. assets stores one blob per unique clip, items stores IDs/creator/scene/shot/date/type metadata, bindings stores references from scenes to video IDs. Reset and Retake never call remove.

Use the same browser/profile and site origin (scheme + host + port) to reopen your library. Private browsing, clearing site data, changing the site address, uninstalling or browser storage eviction can make clips unavailable. **Export important takes.** See [browser storage behavior](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria). Phone camera access still needs a trusted HTTPS origin; gallery import/storage can work on local LAN HTTP where supported. This update does not deploy or configure HTTPS.

### Validation and limits

Run npm test for unit checks. tests/browser-video-tests.html runs isolated real-browser IndexedDB and native MediaRecorder tests with a synthetic canvas stream (no operator filming) plus a small test-only MP4 at tests/fixtures/playback-test.mp4. Test fixtures are ignored by Git and excluded from dist; the test page is also excluded from the production build. The browser checks cover blob saving/reopening/playback, unique IDs, deduplication, cross-scene references, selective deletion and native recorder output. Actor-app checks cover playback, posting, scene reset/reload, cross-scene assignment, Film Mode hiding and local export.

The automated extension could not attach a file through the native file chooser without broader file permissions; those permissions were left unchanged. The upload/import handlers and file storage were tested separately. The phone's actual Photos/Files picker and physical camera/microphone should be checked on the filming devices. A native Save Video export was verified as a local MP4 download on Windows.
