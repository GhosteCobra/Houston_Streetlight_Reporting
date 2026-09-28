import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createDemoReport,
  reportInputSchema,
  type DemoReport,
  type DemoReportStore,
} from "../../shared/report";
const key = "streetlight-check:reports:v1";
export const nativeDemoStore: DemoReportStore = {
  async list() {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const records: unknown = JSON.parse(raw);
    if (
      !Array.isArray(records) ||
      !records.every(
        (r) =>
          reportInputSchema.safeParse(r).success &&
          typeof r.report_id === "string" &&
          r.mode === "local_demo",
      )
    )
      throw new Error("Saved reports could not be read.");
    return records as DemoReport[];
  },
  async save(input, id) {
    const reports = await this.list();
    const prior = reports.find((r) => r.report_id === `DEMO-${id}`);
    if (prior) {
      if (
        JSON.stringify(reportInputSchema.parse(prior)) !==
        JSON.stringify(reportInputSchema.parse(input))
      )
        throw new Error(
          "This report has already been saved with different details.",
        );
      return prior;
    }
    const report = createDemoReport(input, id, new Date().toISOString());
    await AsyncStorage.setItem(key, JSON.stringify([report, ...reports]));
    return report;
  },
};
