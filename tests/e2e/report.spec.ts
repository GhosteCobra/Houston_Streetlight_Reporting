import { test, expect } from "@playwright/test";
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
    page.getByRole("heading", { name: "Find the right pole" }),
  ).toBeVisible();
});
test("Photo to confirmed demo pole to local draft; edit and reload; no utility submission", async ({
  page,
}) => {
  const providerRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("centerpointenergy.com"))
      providerRequests.push(r.url());
  });
  await page.goto("/");
  await upload(page);
  await expect(
    page.getByRole("button", { name: "Review report" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Explore demo area" }).click();
  await page.getByRole("button", { name: /DEMO-101/ }).click();
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
  await page.getByRole("button", { name: "My reports" }).click();
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
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "could not get your location",
  );
  await page.getByText("Enter coordinates instead", { exact: true }).click();
  await page.getByLabel("Latitude", { exact: true }).fill("91");
  await page.getByLabel("Longitude", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Set these coordinates" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "valid latitude",
  );
  await page.getByLabel("Latitude", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Set these coordinates" }).click();
  await expect(
    page.getByText("No sample poles within 750 m", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Use this pin without a pole ID" })
    .click();
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
  await page.getByRole("button", { name: "My reports" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as Window & { stopped?: boolean }).stopped),
    )
    .toBe(true);
});
