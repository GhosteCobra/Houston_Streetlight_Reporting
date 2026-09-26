import { ReportJourney } from "@/components/report/ReportJourney";
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ pole?: string }>;
}) {
  const { pole } = await searchParams;
  return <ReportJourney initialPole={pole} />;
}
