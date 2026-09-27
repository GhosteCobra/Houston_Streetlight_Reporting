import { CenterPointAdapter, CenterPointQueryError } from "../../../../lib/server/centerpoint/adapter";

const adapter = new CenterPointAdapter();
// A bounded instance budget complements cache/coalescing. Use shared limits before broad rollout.
let windowStart = 0;
let requests = 0;
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = params.get("latitude");
  const lon = params.get("longitude");
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!lat?.trim() || !lon?.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 28 || latitude > 31 || longitude < -97 || longitude > -93) {
    return Response.json({ error: { code: "invalid_input", message: "Choose a location in the Houston region." } }, { status: 400 });
  }
  if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); requests = 0; }
  if (++requests > 60) return Response.json({ error: { code: "rate_limit", message: "Please wait a minute before inspecting another pole." } }, { status: 429, headers: { "Retry-After": "60" } });
  try {
    return Response.json(await adapter.nearby({ latitude, longitude }, 25), { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    const code = error instanceof CenterPointQueryError ? error.code : "unavailable";
    return Response.json({ error: { code, message: code === "incomplete" ? "Too many nearby poles. Zoom in and tap closer to the marker." : "CenterPoint details are unavailable. Please try again shortly." } }, { status: 503 });
  }
}
