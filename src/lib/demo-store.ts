import {
  createDemoReport,
  type DemoReport,
  type DemoReportStore,
  reportInputSchema,
} from "@shared/report";
const STORAGE_KEY = "streetlight-check:reports:v1";
export const browserDemoStore: DemoReportStore = {
  async list() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const records: unknown = JSON.parse(raw);
    if (
      !Array.isArray(records) ||
      !records.every(
        (r) =>
          reportInputSchema.safeParse(r).success &&
          typeof r.report_id === "string" &&
          typeof r.reported_at === "string" &&
          r.mode === "local_demo",
      )
    )
      throw new Error(
        "Saved reports could not be read. Your existing data has not been overwritten.",
      );
    return records as DemoReport[];
  },
  async save(input, key) {
    const reports = await this.list();
    const previous = reports.find((r) => r.report_id === `DEMO-${key}`);
    if (previous) {
      if (
        JSON.stringify(reportInputSchema.parse(previous)) !==
        JSON.stringify(reportInputSchema.parse({ ...input, photo_path: null }))
      )
        throw new Error(
          "This report changed after saving. Start a new report.",
        );
      return previous;
    }
    const report = createDemoReport(input, key, new Date().toISOString());
    localStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...reports]));
    return report;
  },
};
