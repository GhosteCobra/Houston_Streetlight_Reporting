import { describe, expect, it, vi } from "vitest";
import { CenterPointAdapter, CenterPointQueryError } from "../../src/lib/server/centerpoint/adapter";
const center = { latitude: 29.7604, longitude: -95.3698 };
const feature = (id: number, latitude = 29.7605) => ({
  attributes: { OBJECTID: id, FACILITYID: `P-${id}`, FIXTUREWATTAGE: "100" },
  geometry: { x: -95.3698, y: latitude },
});
const payload = (features: ReturnType<typeof feature>[], exceededTransferLimit = false) =>
  ({ spatialReference: { wkid: 4326 }, features, exceededTransferLimit });
const reply = (body: object) => new Response(JSON.stringify(body), { status: 200 });

describe("CenterPointAdapter research boundary", () => {
  it("issues a bounded WGS84 spatial query, normalizes and ranks candidates", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => reply(payload([feature(2, 29.7606), feature(1, 29.7605)])));
    const result = await new CenterPointAdapter(fetcher as typeof fetch).nearby(center, 150);
    const url = new URL(String(fetcher.mock.calls[0][0]));
    expect(url.pathname).toMatch(/\/MapServer\/0\/query$/);
    expect(url.searchParams.get("geometry")).toBe("-95.3698,29.7604");
    expect(url.searchParams.get("inSR")).toBe("4326");
    expect(url.searchParams.get("outSR")).toBe("4326");
    expect(url.searchParams.get("distance")).toBe("170");
    expect(url.searchParams.get("outFields")).toBe("OBJECTID,FACILITYID,FIXTUREWATTAGE");
    expect(url.searchParams.get("resultRecordCount")).toBe("51");
    expect(result.poles.map((pole) => pole.objectId)).toEqual([1, 2]);
    expect(result.poles[0].facilityId).toBe("P-1");
  });
  it("shares cached queries while filtering each GPS point to its exact radius", async () => {
    let now = 0;
    const fetcher = vi.fn(async () => reply(payload([feature(1, 29.7605)])));
    const adapter = new CenterPointAdapter(fetcher as typeof fetch, () => now);
    const near = await adapter.nearby(center, 150);
    const shifted = await adapter.nearby({ latitude: 29.76044, longitude: center.longitude }, 150);
    expect(near.poles).toHaveLength(1);
    expect(shifted.poles).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = 60_001;
    await adapter.nearby(center, 150);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("holds a short failure cooldown instead of repeatedly calling an unavailable service", async () => {
    let now = 0;
    const fetcher = vi.fn(async () => new Response("unavailable", { status: 503 }));
    const adapter = new CenterPointAdapter(fetcher as typeof fetch, () => now);
    await expect(adapter.nearby(center)).rejects.toMatchObject({ code: "unavailable" });
    await expect(adapter.nearby(center)).rejects.toMatchObject({ code: "unavailable" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = 15_001;
    await expect(adapter.nearby(center)).rejects.toMatchObject({ code: "unavailable" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("rejects invalid input, truncation and wrong spatial reference", async () => {
    const adapter = new CenterPointAdapter(vi.fn(async () => reply(payload([], true))) as typeof fetch);
    await expect(adapter.nearby(center, 1000)).rejects.toMatchObject({ code: "invalid_input" });
    await expect(adapter.nearby(center)).rejects.toMatchObject({ code: "incomplete" });
    const wrong = new CenterPointAdapter(vi.fn(async () => reply({ ...payload([feature(1)]), spatialReference: { wkid: 6588 } })) as typeof fetch);
    await expect(wrong.nearby(center)).rejects.toBeInstanceOf(CenterPointQueryError);
  });
});
