import { test, expect } from "./provider-fixture";
const matches = [{ label: "DEMO ADDRESS, HOUSTON, TX", latitude: 29.7604, longitude: -95.3698 }];
test("Desktop welcome shows the mobile capture and enters the report; phones open reporting directly", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A little light. A safer way home." })).toBeVisible();
  const preview = page.locator(".phone-frame img");
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(390);
  await expect(page.locator(".arcgis-map")).toHaveCount(0);
  await page.getByRole("link", { name: "Continue on this computer" }).click();
  await expect(page.getByRole("heading", { name: "Report a streetlight" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Find an address" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/report$/);
  await expect(page.getByRole("button", { name: "Open camera", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Find an address" })).toBeHidden();
});
for (const width of [1440, 390]) {
  test(`Address moves the map, requires confirmation and saves at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/address-search", route => route.fulfill({ json: { matches } }));
    await page.goto("/report");
    if (width < 1000) await page.getByRole("button", { name: "Map", exact: true }).click();
    await page.getByRole("searchbox", { name: "Find an address", exact: true }).fill("DEMO address, Houston, TX");
    await page.getByRole("button", { name: "Search address" }).click();
    await expect(page.getByText(/Showing DEMO ADDRESS/)).toBeVisible();
    if (width < 1000) {
      await expect(page.getByRole("heading", { name: "Find a streetlight" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Service area", exact: true })).toBeEnabled({ timeout: 45000 });
      const map = page.locator(".arcgis-map"); const box = await map.boundingBox();
      await map.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
    }
    await expect(page.getByRole("heading", { name: "Confirm the streetlight" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Review report" })).toBeDisabled();
    await page.getByRole("button", { name: "Confirm streetlight", exact: true }).click();
    await page.getByRole("button", { name: "Review report" }).click();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Draft saved", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
test("No-match, ambiguous and unavailable addresses keep the current report recoverable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/report");
  await page.route("**/api/address-search", route => route.fulfill({ json: { matches: [] } }));
  await page.getByRole("searchbox", { name: "Find an address", exact: true }).fill("DEMO nonexistent address");
  await page.getByRole("button", { name: "Search address" }).click();
  await expect(page.getByText(/No matching address/)).toBeVisible();
  await page.route("**/api/address-search", route => route.fulfill({ json: { matches: [matches[0], { ...matches[0], label: "DEMO SECOND ADDRESS" }] } }));
  await page.getByRole("button", { name: "Search address" }).click();
  await expect(page.getByText("Choose the address you meant.")).toBeVisible();
  await page.getByRole("button", { name: "DEMO SECOND ADDRESS" }).click();
  await expect(page.getByRole("heading", { name: "Confirm the streetlight" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm streetlight", exact: true }).click();
  await page.route("**/api/address-search", route => route.fulfill({ status: 503, json: { error: { message: "Address search is unavailable. Try again." } } }));
  await page.getByRole("button", { name: "Search address" }).click();
  await expect(page.getByText("Address search is unavailable. Try again.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Review report" })).toBeEnabled();
});
test("A late address result cannot replace a newer map selection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  let release!: () => void;
  const gate = new Promise<void>(resolve => release = resolve);
  await page.route("**/api/address-search", async route => { await gate; await route.fulfill({ json: { matches } }).catch(() => {}); });
  await page.goto("/report");
  await page.getByRole("searchbox", { name: "Find an address", exact: true }).fill("DEMO delayed address");
  await page.getByRole("button", { name: "Search address" }).click();
  await expect(page.getByRole("button", { name: "Search address" })).toBeDisabled();
  await page.getByRole("button", { name: "Reset map to Houston" }).click();
  release();
  await expect(page.getByRole("button", { name: "Search address" })).toBeEnabled();
  await expect(page.getByText(/Showing DEMO ADDRESS/)).toHaveCount(0);
});
