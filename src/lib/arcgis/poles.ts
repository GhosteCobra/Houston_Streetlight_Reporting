import type { Coordinates, Pole } from "../report/model";
export interface PoleDataAdapter {
  mode: "demo" | "live";
  label: string;
  nearby(location: Coordinates, signal?: AbortSignal): Promise<Pole[]>;
}
// Invented fixtures only. These are not CenterPoint asset records.
const fixtures: Pole[] = [
  {
    id: "DEMO-101",
    latitude: 29.76065,
    longitude: -95.36992,
    address: "Sample corner · north sidewalk",
    source: "demo",
  },
  {
    id: "DEMO-102",
    latitude: 29.76018,
    longitude: -95.36969,
    address: "Sample corner · south sidewalk",
    source: "demo",
  },
  {
    id: "DEMO-103",
    latitude: 29.76102,
    longitude: -95.37038,
    address: "Sample block · west end",
    source: "demo",
  },
  {
    id: "DEMO-104",
    latitude: 29.75975,
    longitude: -95.36888,
    address: "Sample block · east end",
    source: "demo",
  },
];
export const poleAdapter: PoleDataAdapter = {
  mode: "demo",
  label: "Illustrative Houston poles",
  async nearby(location, signal) {
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const timer = setTimeout(resolve, 180);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
    return fixtures.filter((p) => distanceMeters(location, p) <= 750);
  },
};
export function distanceMeters(a: Coordinates, b: Coordinates) {
  const r = Math.PI / 180;
  const p = (b.latitude - a.latitude) * r,
    l = (b.longitude - a.longitude) * r;
  const h =
    Math.sin(p / 2) ** 2 +
    Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(l / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function bearing(a: Coordinates, b: Coordinates) {
  const r = Math.PI / 180,
    d = (b.longitude - a.longitude) * r;
  return (
    ((Math.atan2(
      Math.sin(d) * Math.cos(b.latitude * r),
      Math.cos(a.latitude * r) * Math.sin(b.latitude * r) -
        Math.sin(a.latitude * r) * Math.cos(b.latitude * r) * Math.cos(d),
    ) *
      180) /
      Math.PI +
      360) %
    360
  );
}
export function rankPoles(
  poles: Pole[],
  location: Coordinates,
  numberText = "",
  heading: number | null = null,
  accuracy: number | null = null,
) {
  const normalized = (v: string) =>
    v
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  return poles
    .map((p) => {
      const distance = distanceMeters(location, p);
      const numberMatch =
        !!numberText.trim() &&
        normalized(numberText) ===
          normalized(p.source === "centerpoint" ? (p.facilityId ?? "") : p.id);
      const angle =
        heading === null
          ? null
          : Math.abs(((bearing(location, p) - heading + 540) % 360) - 180);
      const directionAgrees = angle !== null && angle <= 45;
      const score =
        (numberMatch ? 1000 : 0) +
        (directionAgrees ? 40 : 0) -
        distance / (accuracy && accuracy > 50 ? 4 : 1);
      return {
        ...p,
        distance,
        score,
        numberMatch,
        directionAgrees,
        reason: numberMatch
          ? "Matches the number you entered"
          : directionAgrees
            ? "Near your approximate camera direction"
            : "Nearby location only",
      };
    })
    .sort((a, b) => b.score - a.score);
}

// The live adapter receives only the bounded, normalized server response.
export const centerPointAdapter: PoleDataAdapter = {
  mode: "live",
  label: "CenterPoint Energy streetlights",
  async nearby(location, signal) {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
    });
    const response = await fetch(`/api/centerpoint/nearby?${params}`, {
      signal,
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(
        body.error?.message ?? "Streetlight details are unavailable.",
      );
    return body.poles.map(
      (p: {
        objectId: number;
        facilityId: string | null;
        fixtureWattage: string | null;
        latitude: number;
        longitude: number;
      }) => ({
        id: `CP-${p.objectId}`,
        facilityId: p.facilityId,
        fixtureWattage: p.fixtureWattage,
        latitude: p.latitude,
        longitude: p.longitude,
        address: "",
        source: "centerpoint" as const,
      }),
    );
  },
};
export function poleLabel(pole: Pole) {
  return pole.source === "centerpoint"
    ? (pole.facilityId ?? "Pole number unavailable")
    : pole.id;
}
