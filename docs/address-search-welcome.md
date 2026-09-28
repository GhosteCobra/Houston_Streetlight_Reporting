# Address search and desktop welcome

Owner: this task, frontend/map/API scope. Branch: address-search-and-welcome. Base: 0f2f350. No open PRs were returned at the overlap check. Skills applied: new-feature, code-structure, evidence-driven-testing, before-and-after and unslop with repository overrides.

## Behavior

Desktop visitors to `/` see a welcome page explaining the phone-first experience and an actual 390 × 844 screenshot of `/report`. Continue on this computer opens `/report`. Visitors below 1000 px go directly to the reporting flow. No camera or location permission is requested on the welcome page.

Address search appears only with the map: above the desktop photo panel and above the mobile Map tab. It accepts a street address and city, submits to the Census geocoder, and centers the map on a matching Houston-area location. Multiple matches require a choice. A wide service-area view returns to street scale. Users still confirm a pole or manual pin. Photos alone do not establish location.

Search failures preserve the report. Editing the search or changing map/location/step cancels outstanding requests. Geocoder results do not confirm utility ownership or exact pole identity. See the [address endpoint contract](api-contract.md).

## Evidence and limitations

macOS, Node 24.19.0, Chromium, isolated development port 3121 and production test port 3122. The public address 901 Bagby St, Houston, TX returned a live Census match; manual browser verification showed the map move and a nearby pole suggestion. Automated tests use synthetic address and pole responses, not resident information.

The root install, TypeScript check, 29 unit tests, 24 browser scenarios, production build, framework checker and whitespace checks cover this release. New scenarios exercise desktop onboarding, phone redirect, address-to-pole-to-save at 1440/390 px, ambiguous/no-match/provider failures and stale search cancellation. An initial test locator matched both the labeled section and input; changing it to the searchbox role resolved the test-only failure.

Visual evidence is retained in ignored `.artifacts/address-welcome/`. `public/images/mobile-report-preview.png` is a real phone-sized screenshot of the production build's example camera screen, captured through the browser. The image is included deliberately as the landing-page asset, with no resident photo or private data.

Physical phone camera/GPS, native Expo behavior, teammate review and Greptile review were not run. The search service accepts complete street addresses, not arbitrary business names. An instance rate limit and eight-second provider timeout are implemented; distributed traffic limiting is future work. The existing two moderate development dependency advisories remain unchanged. Drafts still stay in the browser and are not sent to CenterPoint.

Production uses the existing Vercel project. Roll back with a normal revert or the previous Vercel deployment; saved-draft schema is unchanged.

The live smoke test exposed a response-versus-render race after resetting the map. Address responses now compare the controller’s synchronous selection version before applying results, in addition to cancelling through the component effect. The delayed-response regression covers this case.
