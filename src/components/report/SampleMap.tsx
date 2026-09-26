"use client";
import { StreetlampIcon } from "@/components/StreetlampIcon";

import type { Pole } from "@shared/report";
const positions: Record<string, { left: string; top: string }> = {
  "DEMO-2841": { left: "56%", top: "48%" },
  "DEMO-2842": { left: "28%", top: "25%" },
  "DEMO-2843": { left: "75%", top: "73%" },
  "DEMO-2844": { left: "77%", top: "20%" },
};
export function SampleMap({
  poles,
  selected,
  onSelect,
  compact = false,
}: {
  poles: Pole[];
  selected?: string | null;
  onSelect?: (pole: Pole) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`sample-map ${compact ? "compact" : ""}`}
      role="group"
      aria-label="Schematic sample streetlight map"
    >
      <div className="map-river" />
      <div className="map-blocks" />
      <div className="map-road road-one" />
      <div className="map-road road-two" />
      <div className="map-road road-three" />
      <span className="street-label main-st">Main St</span>
      <span className="street-label dallas-st">Dallas St</span>
      <span className="street-label texas-st">Texas Ave</span>
      {poles.map((p) => (
        <button
          type="button"
          key={p.pole_id}
          className={`map-pin ${p.status} ${selected === p.pole_id ? "selected" : ""}`}
          style={positions[p.pole_id]}
          aria-label={`Select ${p.pole_id}, ${p.status}`}
          aria-pressed={selected === p.pole_id}
          onClick={() => onSelect?.(p)}
          disabled={!onSelect}
        >
          <StreetlampIcon size={25} />
        </button>
      ))}
      <span className="map-caption">
        Illustrative layout · Synthetic poles · Not for navigation
      </span>
    </div>
  );
}
