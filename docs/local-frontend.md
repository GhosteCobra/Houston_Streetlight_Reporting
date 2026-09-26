# Run and test Streetlight Check

The frontend runs on the `codex/camera-first-0926` feature branch. It is not merged or deployed. `/` and `/report` open the Report screen; Map and My reports are tabs in the same draft controller.

## Run locally

Use Node.js 24 LTS and npm. From this branch's checkout:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables, Supabase account, or ArcGIS key are required for this demo. The first map load downloads ArcGIS modules and OpenStreetMap tiles; it needs internet access. Photos and drafts stay in IndexedDB in this browser. Map providers receive normal basemap/asset requests, but no photo or report payload. Local storage is not encrypted; use sample photos on shared devices. Clearing site data removes drafts.

## Test on a phone

1. Connect the phone and computer to the same trusted Wi-Fi.
2. Find the computer's LAN IP in network settings. The dev server listens on all interfaces. Open `http://COMPUTER_LAN_IP:3000` on the phone for layout, photo upload and manual map checks.
3. Live camera and GPS require a trusted HTTPS origin on phones. HTTP over a LAN is not localhost on the phone and normally disables these APIs. The app offers upload and manual location instead.
4. For camera testing without deployment, use a locally trusted development certificate. If your team already uses `mkcert`, run the commands below, replacing the sample IP with your computer's actual IP. Trust the development CA on the phone using its OS certificate settings; keep the CA private key on the computer. Do not bypass a browser certificate warning.

```bash
mkdir -p certificates
mkcert -install
mkcert -cert-file certificates/local.pem -key-file certificates/local-key.pem localhost 127.0.0.1 192.168.1.10
npm run dev:https -- --experimental-https-cert certificates/local.pem --experimental-https-key certificates/local-key.pem
```

Open `https://192.168.1.10:3000` using your actual address. `mkcert -CAROOT` identifies the CA directory: transfer only `rootCA.pem` to your own test phone, never `rootCA-key.pem`. Remove the test CA from the phone when finished. `certificates/` is ignored by Git. Certificate installation is a manual machine/phone setup step, not performed by this feature.

On the phone, test allow/deny camera, front/rear switch, capture, retake, app backgrounding, upload, allow/deny GPS, map pin adjustment, candidate selection, review edits, saving, and reopening My reports. Phone hardware, iOS permissions, compass accuracy and certificate trust still need physical-device verification.

## Checks

Keep `npm run dev` running in one terminal. In another:

```bash
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
python3 scripts/check_framework.py
git diff --check
```

Browser tests use synthetic images, mocked permission errors and synthetic camera streams. They do not prove real phone camera/GPS behavior. No lint command or hosted CI has been added. See [test evidence](frontend-test-results.md) for the actual run.

## Current behavior and contracts

- `StreetlightApp` owns one in-memory report: photo → location/pole → review → saved draft. Unsaved input is lost on page reload. Saved drafts can be edited on the same browser/origin.
- `CameraCapture` starts only after a tap, handles denial/unavailable devices, and stops tracks on capture, close, unmount or backgrounding. JPEG/PNG/WebP uploads are decoded, limited to 10 MB and 60 million pixels, resized to 1280 pixels and re-encoded without original EXIF. HEIC is not supported.
- `StreetlightMap` is loaded only in the browser. It uses ArcGIS Maps SDK and the OpenStreetMap basemap with attribution. A list and coordinate fields remain available if rendering fails. Addresses are notes, not geocoded searches.
- `PoleDataAdapter.nearby` returns fixed synthetic DEMO poles within 750 m. The frontend never requests CenterPoint's pole service. [The data assessment](arcgis-data-assessment.md) explains why.
- Ranking combines distance, a user-transcribed number visible in the photo, and optional approximate compass heading if the browser exposes it. This version has no OCR, image classifier, or calibrated confidence score. Every candidate requires a tap; an unknown pole requires explicit pin confirmation. GPS cannot establish the pole or street side.
- `src/lib/report/model.ts` is the implemented local schema. A `Draft` has photo data, confirmed location, nullable pole ID, issue, description, optional number/heading evidence, UUID and save time. Its status is always `draft`, provider delivery is always `not_sent`, and data source is `demo`. It does not implement the proposed server contract in `data-contract.md` or `api-contract.md`.
- `src/lib/report/storage.ts` validates records and stores up to 20 drafts in IndexedDB. Saving edits overwrites the same UUID. Errors keep the form available for retry. No Supabase, authentication, server upload or provider submission exists.
- The saved screen links to the official CenterPoint site. Nothing is transferred automatically, and a demo ID must never be entered as a real utility ID.

## Next handoffs

Person 1 resolves data-use permission; Person 2 replaces the demo adapter only after approval and adds bounded provider queries; Person 3 refines the draft experience; Person 4 designs authenticated server persistence and a versioned migration from local drafts; Person 5 tests physical devices and reviews camera/photo handling. Any real reporting integration needs written authorization and an actual receipt before the UI can claim delivery.
