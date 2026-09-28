import { z } from "zod";

export const addressQuery = z.string().trim().min(5).max(100);
export type AddressMatch = { label: string; latitude: number; longitude: number };
const responseSchema = z.object({
  result: z.object({ addressMatches: z.array(z.object({
    matchedAddress: z.string().min(1).max(300),
    coordinates: z.object({ x: z.number().finite().min(-180).max(180), y: z.number().finite().min(-90).max(90) }),
  })).max(100) }),
});

/** Explicit searches only. No address cache or provider response logging. */
export async function searchAddress(query: string, fetcher: typeof fetch = fetch): Promise<AddressMatch[]> {
  const address = addressQuery.parse(query);
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
  url.search = new URLSearchParams({ address, benchmark: "Public_AR_Current", format: "json" }).toString();
  const response = await fetcher(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Address service unavailable");
  const parsed = responseSchema.parse(await response.json());
  return parsed.result.addressMatches
    .filter(({ coordinates: p }) => p.y >= 28 && p.y <= 31 && p.x >= -97 && p.x <= -93)
    .slice(0, 5)
    .map(({ matchedAddress, coordinates }) => ({ label: matchedAddress, latitude: coordinates.y, longitude: coordinates.x }));
}
