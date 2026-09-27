/** Public service configuration; no provider credentials or resident coordinates. */
export const CENTERPOINT_MAP_SERVICE = "https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer";
export const STREET_LEVEL_SCALE = 10_000;
export type MapMode = "default" | "satellite" | "3d";
export const MAP_MODES: { id: MapMode; label: string }[] = [
  { id: "default", label: "Default" }, { id: "satellite", label: "Satellite" }, { id: "3d", label: "3D" },
];
