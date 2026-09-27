/** Research-only adapter. Do not wire into public routes without CenterPoint's approval. */
export const CENTERPOINT_STREETLIGHT_LAYER =
  "https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer/0";

export type Coordinates = { latitude: number; longitude: number };
export type CenterPointPole = {
  provider: "centerpoint";
  sourceLayer: typeof CENTERPOINT_STREETLIGHT_LAYER;
  objectId: number;
  facilityId: string | null;
  fixtureWattage: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
};
export type NearbyResult = { poles: CenterPointPole[]; queriedAt: string };

export class CenterPointQueryError extends Error {
  readonly code: "invalid_input" | "unavailable" | "incomplete" | "bad_response";
  constructor(code: CenterPointQueryError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

const MAX_RADIUS_M = 250;
const MAX_POLES = 50;
const CACHE_TTL_MS = 60_000;
const FAILURE_TTL_MS = 15_000;
const MAX_CACHE_KEYS = 100;
const REQUEST_TIMEOUT_MS = 5_000;

type ArcGISFeature = {
  attributes?: { OBJECTID?: unknown; FACILITYID?: unknown; FIXTUREWATTAGE?: unknown };
  geometry?: { x?: unknown; y?: unknown };
};
type ArcGISResponse = {
  error?: { code?: number; message?: string };
  features?: ArcGISFeature[];
  exceededTransferLimit?: boolean;
  spatialReference?: { wkid?: number; latestWkid?: number };
};

function validCoordinates(point: Coordinates) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude) &&
    point.latitude >= -90 && point.latitude <= 90 &&
    point.longitude >= -180 && point.longitude <= 180;
}

export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function normalize(raw: ArcGISResponse): Omit<CenterPointPole, "distanceMeters">[] {
  if (raw.error) throw new CenterPointQueryError("unavailable", "ArcGIS returned an error");
  if (!Array.isArray(raw.features) || raw.exceededTransferLimit || raw.features.length > MAX_POLES) {
    throw new CenterPointQueryError("incomplete", "Query result is incomplete; narrow the area");
  }
  if (raw.spatialReference?.wkid !== 4326 && raw.spatialReference?.latestWkid !== 4326) {
    throw new CenterPointQueryError("bad_response", "ArcGIS did not return WGS84 geometry");
  }
  const seen = new Set<number>();
  return raw.features.map((feature) => {
    const attributes = feature.attributes;
    const point = feature.geometry;
    if (!attributes || !point ||
      !Number.isInteger(attributes.OBJECTID) ||
      !validCoordinates({ latitude: point.y as number, longitude: point.x as number }) ||
      seen.has(attributes.OBJECTID as number)) {
      throw new CenterPointQueryError("bad_response", "Invalid or duplicate streetlight record");
    }
    const objectId = attributes.OBJECTID as number;
    seen.add(objectId);
    const facilityId = typeof attributes.FACILITYID === "string" && attributes.FACILITYID.trim()
      ? attributes.FACILITYID.trim() : null;
    const fixtureWattage = typeof attributes.FIXTUREWATTAGE === "string" && attributes.FIXTUREWATTAGE.trim()
      ? attributes.FIXTUREWATTAGE.trim() : null;
    return {
      provider: "centerpoint" as const,
      sourceLayer: CENTERPOINT_STREETLIGHT_LAYER,
      objectId,
      facilityId,
      fixtureWattage,
      latitude: point.y as number,
      longitude: point.x as number,
    };
  });
}

/** A single server instance shares one-minute successes and at most one request per key. */
export class CenterPointAdapter {
  private readonly cache = new Map<string, { expires: number; poles: ReturnType<typeof normalize> }>();
  private readonly pending = new Map<string, Promise<ReturnType<typeof normalize>>>();
  private readonly failures = new Map<string, { expires: number; code: CenterPointQueryError["code"] }>();

  private readonly fetcher: typeof fetch;
  private readonly now: () => number;
  constructor(fetcher: typeof fetch = fetch, now: () => number = Date.now) {
    this.fetcher = fetcher;
    this.now = now;
  }

  async nearby(center: Coordinates, radiusMeters = 150): Promise<NearbyResult> {
    if (!validCoordinates(center) || !Number.isFinite(radiusMeters) ||
      radiusMeters < 1 || radiusMeters > MAX_RADIUS_M) {
      throw new CenterPointQueryError("invalid_input", "Invalid location or radius");
    }
    // Round only the query center. The 20 m buffer protects edge candidates;
    // exact distance filtering below still uses the user's unrounded GPS point.
    const queryCenter = {
      latitude: Math.round(center.latitude * 10_000) / 10_000,
      longitude: Math.round(center.longitude * 10_000) / 10_000,
    };
    const queryRadius = Math.min(MAX_RADIUS_M + 20, Math.ceil(radiusMeters) + 20);
    const key = `${queryCenter.latitude}:${queryCenter.longitude}:${queryRadius}`;
    const recentFailure = this.failures.get(key);
    if (recentFailure && recentFailure.expires > this.now()) {
      throw new CenterPointQueryError(recentFailure.code, "Recent ArcGIS query failed; try again shortly");
    }
    const cached = this.cache.get(key);
    let poles = cached && cached.expires > this.now() ? cached.poles : undefined;
    if (!poles) {
      let request = this.pending.get(key);
      if (!request) {
        request = this.query(queryCenter, queryRadius);
        this.pending.set(key, request);
        void request.finally(() => this.pending.delete(key)).catch(() => {});
      }
      try {
        poles = await request;
      } catch (error) {
        const code = error instanceof CenterPointQueryError ? error.code : "unavailable";
        this.remember(this.failures, key, { expires: this.now() + FAILURE_TTL_MS, code });
        throw error;
      }
      this.remember(this.cache, key, { expires: this.now() + CACHE_TTL_MS, poles });
    }
    return {
      poles: poles.map((pole) => ({ ...pole, distanceMeters: distanceMeters(center, pole) }))
        .filter((pole) => pole.distanceMeters <= radiusMeters)
        .sort((a, b) => a.distanceMeters - b.distanceMeters || a.objectId - b.objectId),
      queriedAt: new Date(this.now()).toISOString(),
    };
  }

  private remember<T>(cache: Map<string, T>, key: string, value: T) {
    cache.delete(key);
    cache.set(key, value);
    if (cache.size > MAX_CACHE_KEYS) cache.delete(cache.keys().next().value!);
  }

  private async query(center: Coordinates, radiusMeters: number) {
    const params = new URLSearchParams({
      f: "json", where: "1=1", geometry: `${center.longitude},${center.latitude}`,
      geometryType: "esriGeometryPoint", inSR: "4326",
      spatialRel: "esriSpatialRelIntersects", distance: String(radiusMeters),
      units: "esriSRUnit_Meter", outSR: "4326",
      outFields: "OBJECTID,FACILITYID,FIXTUREWATTAGE", returnGeometry: "true",
      resultRecordCount: String(MAX_POLES + 1),
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.fetcher(`${CENTERPOINT_STREETLIGHT_LAYER}/query?${params}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw new CenterPointQueryError("unavailable", `ArcGIS HTTP ${response.status}`);
      const raw = await response.json() as ArcGISResponse;
      return normalize(raw);
    } catch (error) {
      if (error instanceof CenterPointQueryError) throw error;
      throw new CenterPointQueryError("unavailable", "ArcGIS request failed or timed out");
    } finally {
      clearTimeout(timeout);
    }
  }
}
