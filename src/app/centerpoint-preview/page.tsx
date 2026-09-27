import type { Metadata } from "next";
import { CenterPointAdapter, CenterPointQueryError } from "@/lib/server/centerpoint/adapter";
import CenterPointPreview from "./preview";

export const metadata: Metadata = {
  title: "CenterPoint streetlight map preview | Streetlight Check",
  description: "Small-area preview of CenterPoint streetlight GIS points in the Streetlight Check map.",
};
export const dynamic = "force-dynamic";

// Keep the first visual test to one downtown block. No browser-controlled query or dataset export.
const sampleCenter = { latitude: 29.7604, longitude: -95.3698 };
const sampleRadiusMeters = 25;
const adapter = new CenterPointAdapter();

export default async function CenterPointPreviewPage() {
  try {
    const result = await adapter.nearby(sampleCenter, sampleRadiusMeters);
    return <CenterPointPreview center={sampleCenter} radiusMeters={sampleRadiusMeters} result={result} />;
  } catch (error) {
    const message = error instanceof CenterPointQueryError
      ? error.message
      : "The CenterPoint map service is unavailable right now.";
    return <CenterPointPreview center={sampleCenter} radiusMeters={sampleRadiusMeters} error={message} />;
  }
}
