import { describe, it, expect } from "vitest";
import { draftSchema, type Pole } from "../../src/lib/report/model";
import { poleLabel, rankPoles } from "../../src/lib/arcgis/poles";
const draft = {
  id: "synthetic-draft",
  savedAt: "2026-09-26T00:00:00Z",
  photo: null,
  location: {
    latitude: 29.76,
    longitude: -95.36,
    accuracy: null,
    source: "manual",
    address: "",
  },
  poleId: "CP-123",
  facilityId: "TEST-FACILITY",
  fixtureWattage: "TEST fixture",
  issue: "Light out",
  description: "",
  status: "draft",
  providerDelivery: "not_sent",
  dataSource: "centerpoint",
  poleNumberEvidence: "",
  heading: null,
};
describe("provider draft identity", () => {
  it("retains the displayed facility number separately from the GIS key", () => {
    const parsed = draftSchema.parse(JSON.parse(JSON.stringify(draft)));
    expect(parsed.poleId).toBe("CP-123");
    expect(parsed.facilityId).toBe("TEST-FACILITY");
    expect(parsed.providerDelivery).toBe("not_sent");
  });
  it("continues reading existing demo drafts without new fields", () => {
    const { facilityId, fixtureWattage, ...legacy } = draft;
    expect(
      draftSchema.parse({ ...legacy, dataSource: "demo", poleId: "DEMO-101" })
        .poleId,
    ).toBe("DEMO-101");
  });
  it("does not display or match a GIS key as the pole number", () => {
    const pole: Pole = {
      id: "CP-123",
      facilityId: null,
      latitude: 29.76,
      longitude: -95.36,
      address: "",
      source: "centerpoint",
    };
    expect(poleLabel(pole)).toBe("Pole number unavailable");
    expect(rankPoles([pole], pole, "CP-123")[0].numberMatch).toBe(false);
    expect(
      rankPoles(
        [{ ...pole, facilityId: "TEST-FACILITY" }],
        pole,
        "TEST-FACILITY",
      )[0].numberMatch,
    ).toBe(true);
  });
});
