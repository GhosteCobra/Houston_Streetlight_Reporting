import { test, expect } from "./provider-fixture";
const photo = {
  name: "sample.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  ),
};
async function upload(page: import("@playwright/test").Page) {
  await page.getByLabel("Choose streetlight photo").setInputFiles(photo);
  await page.getByRole("button", { name: "Use this photo" }).click();
}
test("Report opens first; denied camera falls back to gallery", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Report a streetlight" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open camera", exact: true }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "Camera permission was denied",
  );
  await upload(page);
  await expect(
    page.getByRole("heading", { name: "Confirm the streetlight" }),
  ).toBeVisible();
});
test("Photo to confirmed demo pole to local draft; edit and reload; no utility submission", async ({
  page,
}) => {
  const providerRequests: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" && r.url().includes("centerpointenergy.com"))
      providerRequests.push(r.url());
  });
  await page.goto("/");
  await upload(page);
  await expect(
    page.getByRole("button", { name: "Review report" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset map to Houston" }).click();
  await page
    .getByText("Need to correct the location or pole?", { exact: true })
    .click();
  await page
    .getByText("Choose a different streetlight", { exact: true })
    .click();
  await page.getByRole("button", { name: /TEST-101/ }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await page.getByLabel("Anything else").fill("Test draft only");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(
    page.getByRole("heading", { name: "Draft saved", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("CenterPoint has not received a report."),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Saved" }).click();
  await expect(
    page.getByRole("heading", { name: "Light out", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review & edit" }).click();
  await expect(page.getByLabel("Anything else")).toHaveValue("Test draft only");
  expect(providerRequests).toEqual([]);
});
test("Denied GPS, bad coordinates, and confirmed manual pin", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (_success, error) =>
      error?.({
        code: 1,
        message: "denied",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
  });
  await page.goto("/");
  await upload(page);
  await page.getByRole("button", { name: "Use my current location" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "could not get your location",
  );
  await page
    .getByText("Need to correct the location or pole?", { exact: true })
    .click();
  await page.getByText("Adjust location", { exact: true }).click();
  await page.getByText("Enter coordinates instead", { exact: true }).click();
  await page.getByLabel("Latitude", { exact: true }).fill("91");
  await page.getByLabel("Longitude", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Set these coordinates" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "valid latitude",
  );
  await page.getByLabel("Latitude", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Set these coordinates" }).click();
  await page
    .getByText("Choose a different streetlight", { exact: true })
    .click();
  await expect(
    page.getByText("No published poles within 25 m", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm this map pin" }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(
    page.getByText("Manual location · pole ID unknown"),
  ).toBeVisible();
});
test("Camera stream stops when navigating away (synthetic test stream)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as Window & { stopped?: boolean }).stopped = false;
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "blue";
      context.fillRect(0, 0, 320, 240);
      const stream = canvas.captureStream(10);
      const track = stream.getVideoTracks()[0];
      const stop = track.stop.bind(track);
      track.stop = () => {
        (window as Window & { stopped?: boolean }).stopped = true;
        stop();
      };
      return stream;
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open camera", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Close camera" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Saved" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as Window & { stopped?: boolean }).stopped),
    )
    .toBe(true);
});

test("No-photo draft can be saved, reopened, and edited", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Continue without a photo" }).click();
  await page.getByRole("button", { name: "Reset map to Houston" }).click();
  await page
    .getByText("Need to correct the location or pole?", { exact: true })
    .click();
  await page
    .getByText("Choose a different streetlight", { exact: true })
    .click();
  await page.getByRole("button", { name: /TEST-101/ }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(page.getByText("No photo attached")).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Draft saved", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await page.getByRole("button", { name: "Review & edit" }).click();
  await expect(page.getByText("No photo attached")).toBeVisible();
});

test("Map offers one start action, then report keeps fallback options closed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start a report" }),
  ).toBeVisible();
  await expect(page.locator(".fallback-options")).toHaveCount(0);
  await expect(page.locator(".map-controls")).toHaveCount(0);
  const map = await page.locator(".map-layout > .map-shell").boundingBox();
  expect(map).not.toBeNull();
  expect(map!.width).toBeGreaterThan(1000);
  await page.getByRole("button", { name: "Start a report" }).click();
  await expect(
    page.getByRole("heading", { name: "Report a streetlight" }),
  ).toBeVisible();
  await page.getByLabel("Upload streetlight image").setInputFiles(photo);
  await expect(page.locator(".fallback-options")).toHaveCount(1);
  await expect(page.locator(".fallback-options")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(
    page.getByText("Enter a pole number", { exact: true }),
  ).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  const phoneMap = await page.locator(".map-layout > .map-shell").boundingBox();
  const phoneControls = await page.locator(".map-controls").boundingBox();
  expect(phoneControls!.y).toBeGreaterThanOrEqual(
    phoneMap!.y + phoneMap!.height,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("Desktop starts with a full map and uploads a photo beside it", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({
    latitude: 29.7604,
    longitude: -95.3698,
    accuracy: 8,
  });
  await page.goto("/");
  await expect(
    page.locator(".map-layout > .map-shell:not(.map-loading)"),
  ).toBeVisible();
  const map = await page
    .locator(".map-layout > .map-shell:not(.map-loading)")
    .boundingBox();
  const uploadPanel = await page.locator(".map-controls").boundingBox();
  expect(map).not.toBeNull();
  expect(uploadPanel!.x).toBeGreaterThan(map!.x + map!.width);
  expect(map!.width).toBeGreaterThan(600);
  await expect(
    page.getByRole("button", { name: "Map", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Other streetlights" }),
  ).toBeHidden();
  await page.getByLabel("Upload streetlight image").setInputFiles(photo);
  await expect(
    page.getByRole("region", { name: "Suggested streetlight" }),
  ).toContainText("TEST-102");
  await page.getByRole("button", { name: "Confirm streetlight" }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(
    page.getByAltText("Photo to include with your draft"),
  ).toBeVisible();
});

test("Provider outage preserves photo and manual reporting without demo substitution", async ({
  page,
}) => {
  await page.route("**/api/centerpoint/nearby?**", (route) =>
    route.fulfill({
      status: 503,
      json: {
        error: {
          message:
            "CenterPoint details are unavailable. Please try again shortly.",
        },
      },
    }),
  );
  await page.goto("/");
  await upload(page);
  await page.getByRole("button", { name: "Reset map to Houston" }).click();
  await expect(
    page.getByText(
      "CenterPoint details are unavailable. Please try again shortly.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Suggested streetlight" }),
  ).toHaveCount(0);
  await page
    .getByText("Need to correct the location or pole?", { exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm this map pin" }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(
    page.getByAltText("Photo to include with your draft"),
  ).toBeVisible();
  await expect(
    page.getByText("Manual location · pole ID unknown"),
  ).toBeVisible();
});

for (const width of [1440, 390]) {
  test(`Map-first report keeps its pole through upload and save at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (width < 1000) await page.getByRole("button", { name: "Map", exact: true }).click();
    await expect(page.getByRole("button", { name: "Service area", exact: true })).toBeEnabled({ timeout: 45000 });
    const map = page.locator(".arcgis-map");
    const box = await map.boundingBox();
    await map.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
    await expect(page.getByRole("heading", { name: "Confirm the streetlight" })).toBeVisible();
    await page.getByRole("button", { name: "Confirm streetlight", exact: true }).click();
    await expect(page.getByRole("button", { name: "Review report" })).toBeEnabled();
    if (width >= 1000) {
      await page.getByLabel("Upload streetlight image").setInputFiles(photo);
      await expect(page.getByAltText("Your selected streetlight")).toBeVisible();
      await expect(page.getByRole("button", { name: "Review report" })).toBeEnabled();
    }
    await page.getByRole("button", { name: "Review report" }).click();
    await expect(page.getByText("TEST-102", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Draft saved", exact: true })).toBeVisible();
    await expect(page.getByText("CenterPoint has not received a report.")).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: /^Saved/ }).click();
    await page.getByRole("button", { name: "Review & edit" }).click();
    await expect(page.getByText("TEST-102", { exact: true })).toBeVisible();
  });
}
