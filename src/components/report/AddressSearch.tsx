"use client";
import { useEffect, useRef, useState } from "react";
import { Search, LoaderCircle, MapPin } from "lucide-react";
import type { AddressMatch } from "@/lib/server/address-search";

export default function AddressSearch({ onSelect, contextKey, getSelectionVersion }: {
  onSelect: (match: AddressMatch) => void; contextKey: string; getSelectionVersion: () => number;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [matches, setMatches] = useState<AddressMatch[]>([]);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    pending.current?.abort();
    setBusy(false); setMatches([]); setMessage("");
    return () => pending.current?.abort();
  }, [contextKey]);
  function choose(match: AddressMatch) {
    setMatches([]); setQuery(match.label);
    onSelect(match);
  }
  return <section className="address-search" aria-label="Find an address">
    <form onSubmit={async (event) => {
      event.preventDefault();
      pending.current?.abort();
      const controller = new AbortController(); pending.current = controller;
      const selectionVersion = getSelectionVersion();
      setBusy(true); setMessage(""); setMatches([]);
      try {
        const response = await fetch("/api/address-search", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim() }), signal: controller.signal,
        });
        const data = await response.json();
        if (controller.signal.aborted || selectionVersion !== getSelectionVersion()) return;
        if (!response.ok) throw new Error(data.error?.message ?? "Address search failed. Try again.");
        if (!data.matches.length) setMessage("No matching address in the Houston area. Include the street number, city and ZIP code, or tap the map.");
        else if (data.matches.length === 1) choose(data.matches[0]);
        else { setMatches(data.matches); setMessage("Choose the address you meant."); }
      } catch (error) {
        if (!controller.signal.aborted && selectionVersion === getSelectionVersion()) setMessage(error instanceof Error ? error.message : "Address search failed. Try again.");
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }}>
      <label htmlFor="map-address">Find an address</label>
      <div className="address-search-row">
        <input id="map-address" type="search" autoComplete="street-address" required minLength={5} maxLength={100}
          placeholder="Street address, city, TX" value={query}
          onChange={(event) => { pending.current?.abort(); setBusy(false); setMatches([]); setMessage(""); setQuery(event.target.value); }} />
        <button className="primary" type="submit" disabled={busy} aria-label="Search address">
          {busy ? <LoaderCircle className="spin" size={19} /> : <Search size={19} />}<span>{busy ? "Finding…" : "Find"}</span>
        </button>
      </div>
      <p className="field-help">Search a Houston-area street address. Then tap the light you want to report.</p>
    </form>
    {message && <p role="status" className="address-message">{message}</p>}
    {matches.length > 0 && <ul className="address-results">{matches.map((match, i) => <li key={i}>
      <button type="button" onClick={() => choose(match)}><MapPin size={17} />{match.label}</button>
    </li>)}</ul>}
    <small className="address-credit">Address lookup by US Census. Your search is sent when you press Find.</small>
  </section>;
}
