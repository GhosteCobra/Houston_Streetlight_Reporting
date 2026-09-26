import { z } from "zod";

export const issueLabels = {
  light_out: "Light out",
  flickering: "Flickering",
  pole_damaged: "Damaged pole",
  pole_leaning: "Leaning pole",
  exposed_wires: "Exposed wires",
  other: "Other",
} as const;
export type IssueType = keyof typeof issueLabels;
export const reportInputSchema = z.object({
  pole_id: z.string().min(1).nullable(),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  location_source: z.enum(["gps", "manual"]),
  location_confirmed: z.literal(true, {
    error: "Confirm the location before continuing.",
  }),
  location_accuracy_m: z.number().nonnegative().nullable(),
  captured_at: z.iso.datetime().nullable(),
  address: z.string().max(300).nullable(),
  issue_type: z.enum([
    "light_out",
    "flickering",
    "pole_damaged",
    "pole_leaning",
    "exposed_wires",
    "other",
  ]),
  description: z.string().max(2000),
  photo_path: z.string().nullable(),
});
export type ReportInput = z.infer<typeof reportInputSchema>;
export type Pole = {
  pole_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  status: "working" | "reported" | "damaged" | "unknown";
  provider: string | null;
  source: string;
};
export type DemoReport = ReportInput & {
  report_id: string;
  reported_at: string;
  status: "submitted";
  provider_delivery_status: "not_sent";
  mode: "local_demo";
};
export const demoPoles: Pole[] = [
  {
    pole_id: "DEMO-2841",
    latitude: 29.7568,
    longitude: -95.3654,
    address: "Main St, Houston, TX (sample)",
    status: "reported",
    provider: null,
    source: "synthetic-person3",
  },
  {
    pole_id: "DEMO-2842",
    latitude: 29.7581,
    longitude: -95.3691,
    address: "Dallas St, Houston, TX (sample)",
    status: "working",
    provider: null,
    source: "synthetic-person3",
  },
  {
    pole_id: "DEMO-2843",
    latitude: 29.7529,
    longitude: -95.3673,
    address: "Bell St, Houston, TX (sample)",
    status: "damaged",
    provider: null,
    source: "synthetic-person3",
  },
  {
    pole_id: "DEMO-2844",
    latitude: 29.761,
    longitude: -95.3626,
    address: "Texas Ave, Houston, TX (sample)",
    status: "unknown",
    provider: null,
    source: "synthetic-person3",
  },
];
export interface DemoReportStore {
  list(): Promise<DemoReport[]>;
  save(input: ReportInput, idempotencyKey: string): Promise<DemoReport>;
}
export function createDemoReport(
  input: ReportInput,
  key: string,
  now: string,
): DemoReport {
  const validated = reportInputSchema.parse(input);
  return {
    ...validated,
    photo_path: null,
    report_id: `DEMO-${key}`,
    reported_at: now,
    status: "submitted",
    provider_delivery_status: "not_sent",
    mode: "local_demo",
  };
}
export function possibleDuplicates(
  input: ReportInput,
  reports: DemoReport[],
  now = Date.now(),
) {
  return reports.filter(
    (r) =>
      r.issue_type === input.issue_type &&
      now - Date.parse(r.reported_at) < 7 * 86400000 &&
      ((input.pole_id !== null && input.pole_id === r.pole_id) ||
        (input.pole_id === null &&
          Math.hypot(
            (r.latitude - input.latitude) * 111320,
            (r.longitude - input.longitude) *
              111320 *
              Math.cos((input.latitude * Math.PI) / 180),
          ) <= 25)),
  );
}
