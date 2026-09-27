import type { Metadata } from "next";
import CenterPointPreview from "./preview";
export const metadata: Metadata = {
  title: "CenterPoint streetlights | Streetlight Check",
  description: "Browse CenterPoint pole numbers, take a photo and prepare an outage report.",
};
export default function CenterPointPreviewPage() { return <CenterPointPreview />; }
