import { test, expect, type Page } from "@playwright/test";

const photo = {
  name: "DEMO-photo.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  ),
};

async function acceptPhoto(page: Page) {
  await page.getByLabel("Choose streetlight photo").setInputFiles(photo);
  await expect(page.getByAltText("Your streetlight photograph")).toBeVisible();
  await page.getByRole("button", { name: "Use this photo" }).click();
}

test("accepted photo requests GPS, suggests nearest light, and saves confirmed light with photo", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 29.7604, longitude: -95.3698, accuracy: 8 });
  await page.goto("/");
  await acceptPhoto(page);
  const suggestion = page.getByRole("region", { name: "Suggested streetlight" });
  await expect(suggestion).toContainText("DEMO-102");
  await expect(suggestion).toContainText("About 27 m");
  await expect(page.getByText("GPS accuracy: about ±8 m.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Review report" })).toBeDisabled();
  await suggestion.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await suggestion.screenshot({ path: ".artifacts/photo-identification/after-suggestion.png" });
  await page.screenshot({ path: ".artifacts/photo-identification/after-mobile.png" });
  await page.getByRole("button", { name: "Confirm Streetlight" }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(page.getByAltText("Photo to include with your draft")).toBeVisible();
  await expect(page.locator(".review-location")).toContainText("DEMO-102");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Draft saved", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^Saved drafts/ }).click();
  await page.getByRole("button", { name: "Review & edit" }).click();
  await expect(page.locator(".review-location")).toContainText("DEMO-102");
  await expect(page.locator(".review-location")).toContainText("29.760180, -95.369690");
  await expect(page.getByAltText("Photo to include with your draft")).toBeVisible();
});

test("choose another uses the existing list and changing location clears confirmation", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 29.7604, longitude: -95.3698 });
  await page.goto("/");
  await acceptPhoto(page);
  await page.getByRole("button", { name: "Choose Another" }).click();
  await expect(page.getByRole("heading", { name: "Possible poles" })).toBeFocused();
  await page.getByRole("button", { name: /DEMO-104/ }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(page.locator(".review-location")).toContainText("DEMO-104");
  await page.locator(".review-location").getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("button", { name: "Explore demo area" }).click();
  await expect(page.getByRole("button", { name: "Review report" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Confirm Streetlight" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const [code, message] of [
  [1, "location permission was denied"],
  [2, "Your location is unavailable"],
  [3, "Location lookup timed out"],
] as const) {
  test(`GPS failure ${code} keeps manual reporting available`, async ({ page }) => {
    await page.addInitScript((failureCode) => {
      navigator.geolocation.getCurrentPosition = (_success, error) => error?.({
        code: failureCode,
        message: "Synthetic GPS failure",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    }, code);
    await page.goto("/");
    await acceptPhoto(page);
    await expect(page.locator("main [role=alert]")).toContainText(message);
    await page.getByText("Enter coordinates instead", { exact: true }).click();
    await page.getByLabel("Latitude", { exact: true }).fill("40");
    await page.getByLabel("Longitude", { exact: true }).fill("-74");
    await page.getByRole("button", { name: "Set these coordinates" }).click();
    await expect(page.getByText("No sample poles within 750 m", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Use this pin without a pole ID" }).click();
    await page.getByRole("button", { name: "Review report" }).click();
    await expect(page.getByText("Manual location · pole ID unknown")).toBeVisible();
    await expect(page.getByAltText("Photo to include with your draft")).toBeVisible();
  });
}

test("late GPS does not replace an explicitly selected manual location", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (success) => {
      (window as Window & { completeGPS?: () => void }).completeGPS = () => success({
        coords: { latitude: 40, longitude: -74, accuracy: 10 },
      } as GeolocationPosition);
    };
  });
  await page.goto("/");
  await acceptPhoto(page);
  await expect(page.getByText("Finding your current location…", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Explore demo area" }).click();
  await page.getByRole("button", { name: "Confirm Streetlight" }).click();
  await page.evaluate(() => (window as Window & { completeGPS?: () => void }).completeGPS?.());
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(page.locator(".review-location")).toContainText("DEMO-102");
});

test("replacement photo clears an old confirmation; remove and no-photo still work", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 29.7604, longitude: -95.3698 });
  await page.goto("/");
  await acceptPhoto(page);
  await page.getByRole("button", { name: "Confirm Streetlight" }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await page.getByRole("button", { name: "Edit photo" }).click();
  await acceptPhoto(page);
  await expect(page.getByRole("button", { name: "Review report" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Confirm Streetlight" })).toBeVisible();
  await page.getByRole("button", { name: "Photo", exact: true }).click();
  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.getByAltText("Your streetlight photograph")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue without a photo" }).click();
  await page.getByRole("button", { name: "Explore demo area" }).click();
  await page.getByRole("button", { name: "Confirm Streetlight" }).click();
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(page.getByText("No photo attached")).toBeVisible();
});

test("photo validation rejects unsupported and corrupt files without starting GPS", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = () => { throw Error("Unexpected GPS request"); };
  });
  await page.goto("/");
  await page.getByLabel("Choose streetlight photo").setInputFiles({
    name: "DEMO.txt", mimeType: "text/plain", buffer: Buffer.from("not an image"),
  });
  await expect(page.locator("main [role=alert]")).toContainText("Choose a JPG, PNG, or WebP");
  await page.getByLabel("Choose streetlight photo").setInputFiles({
    name: "DEMO.png", mimeType: "image/png", buffer: Buffer.from("not an image"),
  });
  await expect(page.locator("main [role=alert]")).toContainText("could not be read");
  await page.getByLabel("Choose streetlight photo").setInputFiles({
    name: "DEMO-large.png", mimeType: "image/png", buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.locator("main [role=alert]")).toContainText("photo is too large");
  await expect(page.getByRole("button", { name: "Use this photo" })).toHaveCount(0);
});

test("synthetic camera capture, retake, and preview still lead to GPS confirmation", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 29.7604, longitude: -95.3698 });
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "navy";
      context.fillRect(0, 0, 320, 240);
      return canvas.captureStream(10);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open camera", exact: true }).click();
  await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBe(320);
  await page.getByRole("button", { name: "Take photo", exact: true }).click();
  await expect(page.getByAltText("Your streetlight photograph")).toBeVisible();
  await page.getByRole("button", { name: "Retake photo", exact: true }).click();
  await expect(page.getByAltText("Your streetlight photograph")).toHaveCount(0);
  await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBe(320);
  await page.getByRole("button", { name: "Take photo", exact: true }).click();
  await page.getByRole("button", { name: "Use this photo" }).click();
  await expect(page.getByRole("region", { name: "Suggested streetlight" })).toContainText("DEMO-102");
});
