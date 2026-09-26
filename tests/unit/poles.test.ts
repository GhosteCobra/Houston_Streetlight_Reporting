import { describe, it, expect } from "vitest";
import {
  distanceMeters,
  rankPoles,
  poleAdapter,
} from "../../src/lib/arcgis/poles";
import {
  HOUSTON,
  coordinateSchema,
  draftSchema,
  type Pole,
} from "../../src/lib/report/model";
const poles: Pole[] = [
  {
    id: "DEMO-A",
    latitude: 29.76041,
    longitude: -95.3698,
    address: "north",
    source: "demo",
  },
  {
    id: "DEMO-B",
    latitude: 29.7602,
    longitude: -95.3698,
    address: "south",
    source: "demo",
  },
];
describe("Candidate evidence, not an exact-match claim", () => {
  it("ranks by distance without photo-number or heading evidence", () => {
    const ranked = rankPoles(poles, HOUSTON);
    expect(ranked[0].id).toBe("DEMO-A");
    expect(ranked[0].reason).toBe("Nearby location only");
    expect(ranked[0].numberMatch).toBe(false);
  });
  it("uses a manually transcribed number over proximity", () => {
    expect(rankPoles(poles, HOUSTON, "demo b")[0].id).toBe("DEMO-B");
  });
  it("uses direction only as a ranking hint", () => {
    expect(rankPoles(poles, HOUSTON, "", 180)[0].id).toBe("DEMO-B");
    expect(rankPoles(poles, HOUSTON, "", 0)[0].directionAgrees).toBe(true);
  });
  it("keeps unknown numbers from becoming matches", () => {
    expect(
      rankPoles(poles, HOUSTON, "123456").every((p) => !p.numberMatch),
    ).toBe(true);
  });
  it("computes meters and handles the same point", () => {
    expect(distanceMeters(HOUSTON, HOUSTON)).toBe(0);
    expect(distanceMeters(HOUSTON, poles[0])).toBeCloseTo(1.11, 1);
  });
  it("does not move demo poles to the visitor GPS location", async () => {
    expect(await poleAdapter.nearby({ latitude: 40, longitude: -74 })).toEqual(
      [],
    );
    expect(
      (await poleAdapter.nearby(HOUSTON)).every((p) =>
        p.id.startsWith("DEMO-"),
      ),
    ).toBe(true);
  });
  it("rejects invalid or nonfinite coordinates", () => {
    expect(
      coordinateSchema.safeParse({ latitude: NaN, longitude: 0 }).success,
    ).toBe(false);
    expect(
      coordinateSchema.safeParse({ latitude: 91, longitude: 0 }).success,
    ).toBe(false);
  });
  it("does not accept a submitted report as a local draft", () => {
    expect(draftSchema.safeParse({ status: "submitted" }).success).toBe(false);
  });
  it("supports cancelling a pending candidate request", async () => {
    const abort = new AbortController();
    const result = poleAdapter.nearby(HOUSTON, abort.signal);
    abort.abort();
    await expect(result).rejects.toMatchObject({ name: "AbortError" });
  });
});
