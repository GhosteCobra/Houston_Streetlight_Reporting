import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/api/centerpoint/nearby?**", async (route) => {
      const url = new URL(route.request().url());
      const latitude = Number(url.searchParams.get("latitude"));
      const longitude = Number(url.searchParams.get("longitude"));
      const poles =
        Math.abs(latitude - 29.7604) < 0.001 &&
        Math.abs(longitude + 95.3698) < 0.001
          ? [
              {
                objectId: 101,
                facilityId: "TEST-101",
                latitude: 29.76065,
                longitude: -95.36992,
              },
              {
                objectId: 102,
                facilityId: "TEST-102",
                latitude: 29.76018,
                longitude: -95.36969,
              },
              {
                objectId: 103,
                facilityId: "TEST-103",
                latitude: 29.76102,
                longitude: -95.37038,
              },
              {
                objectId: 104,
                facilityId: "TEST-104",
                latitude: 29.75975,
                longitude: -95.36888,
              },
            ].map((p) => ({
              ...p,
              fixtureWattage: "TEST fixture",
              provider: "centerpoint",
              distanceMeters: 20,
            }))
          : [];
      await route.fulfill({
        json: { poles, queriedAt: new Date().toISOString() },
      });
    });
    await use(page);
  },
});
export { expect };
