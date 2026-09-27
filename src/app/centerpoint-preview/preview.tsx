"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, LocateFixed, MapPin } from "lucide-react";
import Brand from "@/components/report/Brand";
import type { Coordinates, CenterPointPole, NearbyResult } from "@/lib/server/centerpoint/adapter";
import ReportPreparation from "./report-preparation";

const CenterPointMap = dynamic(() => import("@/components/map/centerpoint/CenterPointMap"), {
  ssr: false, loading: () => <div className="map-shell map-loading cp-live-map">Loading map…</div>,
});
const NEIGHBORHOOD = { latitude: 29.56765, longitude: -95.2083 };
const DOWNTOWN = { latitude: 29.7604, longitude: -95.3698 };
export default function CenterPointPreview() {
  const [center, setCenter] = useState<Coordinates>(NEIGHBORHOOD);
  const [poles, setPoles] = useState<CenterPointPole[]>([]);
  const [selected, setSelected] = useState<CenterPointPole | null>(null);
  const [reportPole, setReportPole] = useState<CenterPointPole | null>(null);
  const [busy, setBusy] = useState(false);
  const [queried, setQueried] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function inspect(point: Coordinates) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setError(""); setSelected(null); setPoles([]); setQueried(true);
    try {
      const params = new URLSearchParams({ latitude: String(point.latitude), longitude: String(point.longitude) });
      const response = await fetch(`/api/centerpoint/nearby?${params}`, { signal: controller.signal });
      const body = await response.json() as NearbyResult & { error?: { message: string } };
      if (!response.ok) throw Error(body.error?.message ?? "Pole details could not load.");
      if (!controller.signal.aborted) setPoles(body.poles);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Pole details could not load.");
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }
  function move(point: Coordinates) {
    request.current?.abort(); setBusy(false); setCenter(point); setPoles([]); setSelected(null); setQueried(false); setError("");
  }
  function locate() {
    if (!navigator.geolocation) { setLocationStatus("GPS is unavailable. Pan the map to your street."); return; }
    setLocationStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (coords.latitude < 28 || coords.latitude > 31 || coords.longitude < -97 || coords.longitude > -93) {
        setLocationStatus("Your location is outside the Houston region. Pan the map to a Houston street."); return;
      }
      move({ latitude: coords.latitude, longitude: coords.longitude });
      setLocationStatus(`GPS accuracy: about ${Math.round(coords.accuracy)} m. Confirm the pole on the map.`);
    }, () => setLocationStatus("Location is unavailable. Pan the map to your street or try again."), { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 });
  }
  return <main className="app centerpoint-preview">
    <Brand />
    <div className="workspace centerpoint-workspace">
      <Link className="centerpoint-back" href="/"><ArrowLeft size={15} /> Back to home</Link>
      <div className="centerpoint-heading">
        <div className="centerpoint-kicker"><MapPin size={15} /> CENTERPOINT STREETLIGHT MAP</div>
        <h1>Find the right streetlight</h1>
        <p>Browse the pink stars and pole numbers from CenterPoint. Tap a star, confirm the pole, then add a photo and prepare your report.</p>
      </div>
      <div className="cp-toolbar">
        <button className="secondary" onClick={locate}><LocateFixed size={16} /> Use my location</button>
        <button className="secondary" onClick={() => move(NEIGHBORHOOD)}>Example neighborhood</button>
        <button className="secondary" onClick={() => move(DOWNTOWN)}>Downtown</button>
      </div>
      {locationStatus && <p role="status" className="centerpoint-footnote">{locationStatus}</p>}
      <div className="centerpoint-layout cp-browse-layout">
        <CenterPointMap center={center} selected={selected} onPick={inspect} />
        <section className="centerpoint-results" aria-label="Streetlight details">
          <div className="centerpoint-results-header"><h2>{selected ? "Pole details" : "Select a streetlight"}</h2></div>
          {busy && <p role="status">Loading nearby pole numbers…</p>}
          {error && <p className="centerpoint-error" role="alert">{error}</p>}
          {!queried && <p className="centerpoint-empty">Tap a pink marker on the map. Pole numbers come directly from CenterPoint’s facility IDs.</p>}
          {queried && !busy && !error && poles.length === 0 && <p>No mapped poles within 25 m of that tap. Tap closer to a pink star.</p>}
          {poles.length > 0 && <p className="centerpoint-empty">Choose the number on the marker you tapped. Distances are from your map tap.</p>}
          <div className="centerpoint-list">
            {poles.map((pole) => <button className={`centerpoint-pole ${selected?.objectId === pole.objectId ? "is-selected" : ""}`} key={pole.objectId} onClick={() => setSelected(pole)} aria-pressed={selected?.objectId === pole.objectId}>
              <span className="cp-star" aria-hidden="true">✦</span>
              <span className="centerpoint-pole-main"><strong>{pole.facilityId ?? "Pole number unavailable"}</strong><small>{pole.fixtureWattage ?? "Fixture details unavailable"}</small></span>
              <span className="centerpoint-distance">{pole.distanceMeters.toFixed(1)} m</span>
            </button>)}
          </div>
          {selected && <div className="cp-selected" aria-live="polite">
            <h3>Pole {selected.facilityId ?? "number unavailable"}</h3>
            <dl><dt>Fixture</dt><dd>{selected.fixtureWattage ?? "Not available"}</dd><dt>Coordinates</dt><dd>{selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}</dd><dt>GIS record</dt><dd>{selected.objectId}</dd></dl>
            <p className="centerpoint-footnote">Check this number against the physical pole. The GIS record number is separate from the pole number.</p>
            <button className="primary" onClick={() => setReportPole(selected)}>Report this streetlight</button>
          </div>}
        </section>
      </div>
      {reportPole && <ReportPreparation key={reportPole.objectId} pole={reportPole} onClose={() => setReportPole(null)} />}
      <p className="centerpoint-footnote">Source: CenterPoint Energy Streetlights GIS. The map shows the provider’s published poles in the visible area. Zoom in to see labels. Unmapped lights and current outage status are not available in this layer.</p>
    </div>
  </main>;
}
