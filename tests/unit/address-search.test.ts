import { describe, expect, it, vi, afterEach } from "vitest";
import { searchAddress } from "../../src/lib/server/address-search";
import { POST } from "../../src/app/api/address-search/route";
const match = { matchedAddress: "DEMO ADDRESS, HOUSTON, TX", coordinates: { x: -95.3698, y: 29.7604 } };
const response = (addressMatches: unknown[]) => Response.json({ result: { addressMatches } });
afterEach(() => vi.unstubAllGlobals());
describe("Address lookup", () => {
  it("normalizes longitude and latitude, excludes distant matches and uses a fixed provider", async () => {
    const fetcher = vi.fn(async () => response([match, { ...match, coordinates: { x: -74, y: 40 } }]));
    expect(await searchAddress("DEMO address Houston TX", fetcher)).toEqual([{ label: match.matchedAddress, latitude: 29.7604, longitude: -95.3698 }]);
    const [url, init] = fetcher.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.origin).toBe("https://geocoding.geo.census.gov");
    expect(url.searchParams.get("address")).toBe("DEMO address Houston TX");
    expect(init.cache).toBe("no-store");
  });
  it("rejects invalid input without a provider request and rejects malformed coordinates", async () => {
    const fetcher = vi.fn(async () => response([{ ...match, coordinates: { x: "wrong", y: 29 } }]));
    await expect(searchAddress(" ", fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
    await expect(searchAddress("DEMO address", fetcher)).rejects.toThrow();
  });
  it("returns empty matches and handles provider HTTP failures", async () => {
    expect(await searchAddress("DEMO unknown address", async () => response([]))).toEqual([]);
    await expect(searchAddress("DEMO address", async () => new Response("unavailable", { status: 503 }))).rejects.toThrow();
  });
  it("route validates JSON, does not cache addresses and returns recoverable errors", async () => {
    expect((await POST(new Request("http://localhost/api/address-search", { method: "POST", body: "invalid" }))).status).toBe(400);
    vi.stubGlobal("fetch", vi.fn(async () => response([match])));
    const request = () => new Request("http://localhost/api/address-search", { method: "POST", body: JSON.stringify({ query: "DEMO Houston address" }) });
    const ok = await POST(request());
    expect(ok.status).toBe(200); expect(ok.headers.get("Cache-Control")).toBe("no-store");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("private provider detail"); }));
    const failed = await POST(request());
    expect(failed.status).toBe(503); expect(await failed.text()).not.toContain("private provider detail");
  });
});
