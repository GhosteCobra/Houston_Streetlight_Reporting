"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MapPin, RadioTower } from "lucide-react";
import Brand from "@/components/report/Brand";
import type { Coordinates, CenterPointPole, NearbyResult } from "@/lib/server/centerpoint/adapter";

const StreetlightMap = dynamic(() => import("@/components/map/StreetlightMap"), {
  ssr: false,
  loading: () => <div className="map-shell map-loading">Loading map…</div>,
});

function displayId(pole: CenterPointPole) {
  return pole.facilityId ?? `GIS ${pole.objectId}`;
}

export default function CenterPointPreview({
  center,
  radiusMeters,
  result,
  error,
}: {
  center: Coordinates;
  radiusMeters: number;
  result?: NearbyResult;
  error?: string;
}) {
  const poles = result?.poles ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapPoles = useMemo(() => poles.map((pole) => ({
    id: `centerpoint:${pole.objectId}`,
    latitude: pole.latitude,
    longitude: pole.longitude,
    label: displayId(pole),
  })), [poles]);
  const selected = poles.find((pole) => `centerpoint:${pole.objectId}` === selectedId) ?? null;

  return (
    <main className="app centerpoint-preview">
      <Brand />
      <div className="workspace centerpoint-workspace">
        <Link className="centerpoint-back" href="/"><ArrowLeft size={15} /> Back to report</Link>
        <div className="centerpoint-heading">
          <div className="centerpoint-kicker"><RadioTower size={15} /> LIVE GIS PREVIEW</div>
          <h1>Streetlights on our map</h1>
          <p>CenterPoint streetlight points near one downtown Houston test location. Tap a marker or an ID to inspect a pole.</p>
        </div>
        <div className="centerpoint-meta">
          <span><MapPin size={14} /> {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}</span>
          <span>{radiusMeters} m search radius</span>
          <span>{poles.length} {poles.length === 1 ? "pole" : "poles"} found</span>
        </div>
        {error && <p className="centerpoint-error" role="alert">The live pole query could not complete: {error}</p>}
        <div className="centerpoint-layout">
          <StreetlightMap
            location={center}
            poles={mapPoles}
            selected={selectedId}
            onPole={setSelectedId}
            showPoleIds
            zoom={19}
            badge="CENTERPOINT GIS"
            hint="Tap a labeled pole to inspect its GIS record."
          />
          <section className="centerpoint-results" aria-label="Nearby CenterPoint streetlights">
            <div className="centerpoint-results-header">
              <h2>Nearby streetlights</h2>
              <span>Nearest first</span>
            </div>
            {poles.length === 0 && !error && <p className="centerpoint-empty">No mapped streetlights were returned in this small area.</p>}
            <div className="centerpoint-list">
              {poles.map((pole) => {
                const id = `centerpoint:${pole.objectId}`;
                return (
                  <button
                    className={`centerpoint-pole ${selectedId === id ? "is-selected" : ""}`}
                    key={id}
                    onClick={() => setSelectedId(id)}
                    type="button"
                    aria-pressed={selectedId === id}
                  >
                    <span className="centerpoint-pole-dot" aria-hidden="true" />
                    <span className="centerpoint-pole-main"><strong>{displayId(pole)}</strong><small>{pole.facilityId ? "Facility ID" : "GIS feature ID only"}</small></span>
                    <span className="centerpoint-distance">{pole.distanceMeters.toFixed(1)} m</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        {selected && (
          <section className="centerpoint-detail" aria-live="polite">
            <div><span className="centerpoint-detail-label">Selected streetlight</span><h2>{displayId(selected)}</h2></div>
            <dl>
              <div><dt>Facility ID</dt><dd>{selected.facilityId ?? "Not available"}</dd></div>
              <div><dt>Fixture wattage</dt><dd>{selected.fixtureWattage ?? "Not available"}</dd></div>
              <div><dt>Distance from test pin</dt><dd>{selected.distanceMeters.toFixed(1)} m</dd></div>
              <div><dt>GIS feature ID</dt><dd>{selected.objectId}</dd></div>
              <div><dt>Coordinates</dt><dd>{selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}</dd></div>
            </dl>
            <p>Confirm the physical pole before using this ID in a report. GIS position and facility ID alone do not prove which light appears in a photo.</p>
          </section>
        )}
        <p className="centerpoint-footnote">Source: CenterPoint Energy public Streetlights GIS layer. This page reads one bounded area and does not submit an outage report. The teal cross is the test location.</p>
      </div>
    </main>
  );
}
