import { addressQuery, searchAddress } from "../../../lib/server/address-search";

let windowStart = 0;
let requests = 0;
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  let query: string;
  try {
    const body = await request.text();
    if (body.length > 1024) throw new Error("Too long");
    query = addressQuery.parse(JSON.parse(body).query);
  } catch {
    return Response.json({ error: { message: "Enter a street address and city, between 5 and 100 characters." } }, { status: 400, headers });
  }
  // Instance budget. A distributed limit is needed before a broad public rollout.
  if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); requests = 0; }
  if (++requests > 30) return Response.json({ error: { message: "Please wait a minute before searching again." } }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
  try {
    return Response.json({ matches: await searchAddress(query) }, { headers });
  } catch {
    return Response.json({ error: { message: "Address search is unavailable right now. Try again, use your location, or tap the map." } }, { status: 503, headers });
  }
}
