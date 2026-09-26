"use client";
import { StreetlampIcon } from "@/components/StreetlampIcon";
import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, ArrowRight, X } from "lucide-react";
import { demoPoles, type Pole } from "@shared/report";
import { SampleMap } from "@/components/report/SampleMap";
export default function MapPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [filters, setFilters] = useState(false);
  const [selected, setSelected] = useState<Pole | null>(demoPoles[0]);
  const poles = demoPoles.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      `${p.pole_id} ${p.address}`.toLowerCase().includes(query.toLowerCase()),
  );
  const visibleSelected = poles.find((p) => p.pole_id === selected?.pole_id);
  return (
    <main id="main" className="page map-page">
      <div className="page-heading">
        <div>
          <h1>Streetlight map</h1>
          <p>Explore sample streetlights and select a pole to report.</p>
        </div>
        <span className="badge lavender">Demo data</span>
      </div>
      <div className="search-row">
        <label className="search-input">
          <Search />
          <input
            aria-label="Search an address or pole ID"
            placeholder="Search an address or pole ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className="icon-button"
          aria-label="Filter streetlights"
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal />
        </button>
      </div>
      {filters && (
        <label className="filter-row">
          Streetlight status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {["working", "reported", "damaged", "unknown"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}
      <div className="map-layout">
        <div className="map-stage">
          <SampleMap
            poles={poles}
            selected={visibleSelected?.pole_id}
            onSelect={setSelected}
          />
          {visibleSelected && (
            <section className="pole-sheet" aria-label="Selected streetlight">
              <span className={`pole-icon ${visibleSelected.status}`}>
                <StreetlampIcon size={36} />
              </span>
              <div>
                <h2>Streetlight #{visibleSelected.pole_id}</h2>
                <span className="badge mint">{visibleSelected.status}</span>
                <p>
                  <MapPin size={17} />
                  {visibleSelected.address}
                </p>
                <Link
                  className="text-link"
                  href={`/report?pole=${visibleSelected.pole_id}`}
                >
                  Report this streetlight <ArrowRight size={18} />
                </Link>
              </div>
              <button
                className="close-button"
                aria-label="Close pole details"
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
            </section>
          )}
        </div>
        <aside className="pole-list">
          <h2>Nearby streetlights</h2>
          <p className="muted">
            {poles.length} sample{" "}
            {poles.length === 1 ? "streetlight" : "streetlights"}
          </p>
          {poles.length === 0 ? (
            <p role="status">
              No matches. Try another street or clear the filter.
            </p>
          ) : (
            poles.map((p) => (
              <button
                key={p.pole_id}
                className={`pole-row ${visibleSelected?.pole_id === p.pole_id ? "active" : ""}`}
                onClick={() => setSelected(p)}
              >
                <StreetlampIcon />
                <span>
                  <strong>{p.pole_id}</strong>
                  <small>{p.address}</small>
                  <span className={`status-dot ${p.status}`} />
                  <small className="inline">{p.status}</small>
                </span>
              </button>
            ))
          )}
          <div className="notice">
            This preview uses synthetic poles. The team&apos;s ArcGIS map will
            replace this schematic.
          </div>
        </aside>
      </div>
    </main>
  );
}
