import { beforeEach, describe, expect, it, vi } from "vitest";
const nearby = vi.hoisted(() => vi.fn());
vi.mock("../../src/lib/server/centerpoint/adapter", () => ({
  CenterPointAdapter: class { nearby = nearby; },
  CenterPointQueryError: class extends Error { code = "incomplete"; },
}));

async function route() {
  vi.resetModules();
  return (await import("../../src/app/api/centerpoint/nearby/route")).GET;
}
describe("CenterPoint inspection route", () => {
  beforeEach(() => { nearby.mockReset(); nearby.mockResolvedValue({ poles: [], queriedAt: "test" }); });
  it("rejects missing, non-finite and out-of-region coordinates before provider access", async () => {
    const get = await route();
    for (const query of ["", "latitude=&longitude=-95", "latitude=NaN&longitude=-95", "latitude=29&longitude=Infinity", "latitude=0&longitude=0"]) {
      expect((await get(new Request(`https://app.test/api/centerpoint/nearby?${query}`))).status).toBe(400);
    }
    expect(nearby).not.toHaveBeenCalled();
  });
  it("uses a fixed 25m query even when callers supply a larger radius", async () => {
    const get = await route();
    const result = await get(new Request("https://app.test/api/centerpoint/nearby?latitude=29.5&longitude=-95.2&radius=999999"));
    expect(result.status).toBe(200);
    expect(nearby).toHaveBeenCalledWith({ latitude: 29.5, longitude: -95.2 }, 25);
  });
  it("caps requests per instance and returns a retry delay", async () => {
    const get = await route();
    const request = new Request("https://app.test/api/centerpoint/nearby?latitude=29.5&longitude=-95.2");
    for (let i = 0; i < 60; i++) expect((await get(request)).status).toBe(200);
    const blocked = await get(request);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("60");
    expect(nearby).toHaveBeenCalledTimes(60);
  });
  it("returns a safe failure instead of provider error details", async () => {
    nearby.mockRejectedValue(new Error("private provider failure detail"));
    const get = await route();
    const result = await get(new Request("https://app.test/api/centerpoint/nearby?latitude=29.5&longitude=-95.2"));
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain("private provider failure detail");
  });
});
