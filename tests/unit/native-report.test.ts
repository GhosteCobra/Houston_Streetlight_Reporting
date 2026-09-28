import { strict as assert } from "node:assert";
import { test } from "vitest";
import {
  createDemoReport,
  possibleDuplicates,
  reportInputSchema,
  type ReportInput,
} from "../../shared/report";
const input: ReportInput = {
  pole_id: "DEMO-2841",
  latitude: 29.7568,
  longitude: -95.3654,
  address: null,
  location_source: "manual",
  location_confirmed: true,
  location_accuracy_m: null,
  captured_at: null,
  issue_type: "light_out",
  description: "",
  photo_path: null,
};
test("requires finite coordinates, a known issue and confirmed location", () => {
  for (const patch of [
    { latitude: NaN },
    { latitude: 91 },
    { longitude: -181 },
    { location_confirmed: false },
    { issue_type: "invented" },
    { location_accuracy_m: -1 },
    { description: "a".repeat(2001) },
  ])
    assert.equal(
      reportInputSchema.safeParse({ ...input, ...patch }).success,
      false,
    );
});
test("supports unknown poles and no-photo reports", () => {
  assert.equal(
    reportInputSchema.safeParse({
      ...input,
      pole_id: null,
      address: null,
      photo_path: null,
    }).success,
    true,
  );
});
test("local confirmation is always a demo and never claims provider delivery", () => {
  const saved = createDemoReport(input, "test-key", "2026-09-25T12:00:00Z");
  assert.equal(saved.report_id, "DEMO-test-key");
  assert.equal(saved.provider_delivery_status, "not_sent");
  assert.equal(saved.mode, "local_demo");
  assert.equal(saved.photo_path, null);
});
test("warns for the same pole and issue within seven days", () => {
  const saved = createDemoReport(input, "one", "2026-09-25T12:00:00Z");
  assert.equal(
    possibleDuplicates(input, [saved], Date.parse("2026-09-26T12:00:00Z"))
      .length,
    1,
  );
  assert.equal(
    possibleDuplicates(
      { ...input, issue_type: "flickering" },
      [saved],
      Date.parse("2026-09-26T12:00:00Z"),
    ).length,
    0,
  );
  assert.equal(
    possibleDuplicates(input, [saved], Date.parse("2026-10-03T12:00:00Z"))
      .length,
    0,
  );
});
test("unknown-pole duplicates require proximity, not a shared null ID", () => {
  const saved = createDemoReport(
    { ...input, pole_id: null },
    "one",
    "2026-09-25T12:00:00Z",
  );
  const now = Date.parse("2026-09-26T12:00:00Z");
  assert.equal(
    possibleDuplicates(
      { ...input, pole_id: null, latitude: 29.75681 },
      [saved],
      now,
    ).length,
    1,
  );
  assert.equal(
    possibleDuplicates({ ...input, pole_id: null, latitude: 30 }, [saved], now)
      .length,
    0,
  );
});
