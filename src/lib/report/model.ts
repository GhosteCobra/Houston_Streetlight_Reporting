import { z } from "zod";
export const coordinateSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
export type Coordinates = z.infer<typeof coordinateSchema>;
export type Location = Coordinates & {
  accuracy: number | null;
  source: "gps" | "manual" | "demo";
  address: string;
};
export type Pole = Coordinates & {
  id: string;
  address: string;
  source: "demo" | "centerpoint";
  facilityId?: string | null;
  fixtureWattage?: string | null;
};
export const issues = [
  "Light out",
  "Flickering",
  "Damaged pole",
  "Leaning pole",
  "Exposed wires",
  "Other",
] as const;
export const draftSchema = z.object({
  id: z.string(),
  savedAt: z.string(),
  photo: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/)
    .nullable(),
  location: coordinateSchema.extend({
    accuracy: z.number().nullable(),
    source: z.enum(["gps", "manual", "demo"]),
    address: z.string().max(300),
  }),
  poleId: z.string().nullable(),
  issue: z.enum(issues),
  description: z.string().max(2000),
  status: z.literal("draft"),
  providerDelivery: z.literal("not_sent"),
  dataSource: z.enum(["demo", "centerpoint"]),
  facilityId: z.string().nullable().optional(),
  fixtureWattage: z.string().nullable().optional(),
  poleNumberEvidence: z.string().max(80),
  heading: z.number().min(0).max(360).nullable(),
});
export type Draft = z.infer<typeof draftSchema>;
export const HOUSTON: Coordinates = { latitude: 29.7604, longitude: -95.3698 };
export const OFFICIAL_URL =
  "https://sora.centerpointenergy.com/HOU_Sloreporting/";
