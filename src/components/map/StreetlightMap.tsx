"use client";
import { useEffect, useRef, useState } from "react";
import type { Coordinates, Pole } from "@/lib/report/model";
import { MapPin, LoaderCircle } from "lucide-react";
import type MapView from "@arcgis/core/views/MapView";
export default function StreetlightMap({
  location,
  poles,
  selected,
  onPin,
  onPole,
  interactive = true,
}: {
  location: Coordinates;
  poles: Pole[];
  selected: string | null;
  onPin: (point: Coordinates) => void;
  onPole: (id: string) => void;
  interactive?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null),
    view = useRef<MapView | null>(null),
    callbacks = useRef({ onPin, onPole, interactive });
  callbacks.current = { onPin, onPole, interactive };
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    let owned: MapView | null = null;
    (async () => {
      try {
        const [
          { default: Map },
          { default: MapView },
          { default: config },
          { default: MapImageLayer },
        ] = await Promise.all([
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/config"),
          import("@arcgis/core/layers/MapImageLayer"),
        ]);
        if (disposed || !container.current) return;
        config.assetsPath = "https://js.arcgis.com/4.34/@arcgis/core/assets";
        const providerLayer = new MapImageLayer({
          url: "https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer",
          title: "CenterPoint Energy streetlights",
          sublayers: [{ id: 0, visible: true, popupEnabled: false }],
        });
        owned = new MapView({
          container: container.current,
          map: new Map({ basemap: "osm", layers: [providerLayer] }),
          popupEnabled: false,
          center: [location.longitude, location.latitude],
          zoom: 17,
          ui: { components: ["zoom", "attribution"] },
          constraints: { minZoom: 3, snapToZoom: false },
        });
        view.current = owned;
        await owned.when();
        if (disposed) return;
        setReady(true);
        providerLayer.load().catch(() => {
          if (!disposed)
            setError(
              "CenterPoint streetlights could not load. Try reloading the map.",
            );
        });
        owned.on("click", async (e) => {
          if (!callbacks.current.interactive) return;
          const hit = await owned!.hitTest(e);
          if (disposed || !callbacks.current.interactive) return;
          const found = hit.results.find(
            (r) => r.type === "graphic" && r.graphic.attributes?.poleId,
          );
          if (found && found.type === "graphic") {
            callbacks.current.onPole(found.graphic.attributes.poleId);
          } else if (e.mapPoint) {
            callbacks.current.onPin({
              latitude: e.mapPoint.latitude!,
              longitude: e.mapPoint.longitude!,
            });
          }
        });
      } catch {
        if (!disposed)
          setError(
            "The map could not load. Use the pole list or coordinate fields below.",
          );
      }
    })();
    return () => {
      disposed = true;
      owned?.destroy();
      view.current = null;
    };
    // Initial center is intentional. Subsequent coordinates update the same view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!ready || !view.current) return;
    let cancelled = false;
    (async () => {
      const [{ default: Graphic }, { default: Point }] = await Promise.all([
        import("@arcgis/core/Graphic"),
        import("@arcgis/core/geometry/Point"),
      ]);
      if (cancelled || !view.current) return;
      view.current.graphics.removeAll();
      for (const pole of interactive
        ? poles.filter((p) => p.id === selected)
        : [])
        view.current.graphics.add(
          new Graphic({
            geometry: new Point({
              latitude: pole.latitude,
              longitude: pole.longitude,
            }),
            attributes: { poleId: pole.id },
            symbol: {
              type: "simple-marker",
              color: pole.id === selected ? "#6c55af" : "#09224e",
              size: pole.id === selected ? 20 : 14,
              outline: { color: "white", width: 2 },
            },
          }),
        );
      if (interactive)
        view.current.graphics.add(
          new Graphic({
            geometry: new Point({
              latitude: location.latitude,
              longitude: location.longitude,
            }),
            symbol: {
              type: "simple-marker",
              style: "cross",
              color: "#198799",
              size: 20,
              outline: { color: "#198799", width: 3 },
            },
          }),
        );
      view.current
        .goTo(
          { center: [location.longitude, location.latitude] },
          { animate: false },
        )
        .catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [
    location.latitude,
    location.longitude,
    poles,
    selected,
    ready,
    interactive,
  ]);
  return (
    <div className="map-shell">
      <div
        ref={container}
        className="arcgis-map"
        aria-label={
          interactive
            ? "CenterPoint streetlights over the street map. Tap a marker to inspect nearby poles."
            : "CenterPoint streetlights over the Houston street map."
        }
      />
      {!ready && !error && (
        <div className="map-loading" role="status">
          <LoaderCircle className="spin" />
          Loading the map…
        </div>
      )}
      {error && (
        <p className="map-error" role="alert">
          {error}
        </p>
      )}
      <span className="map-demo">CENTERPOINT STREETLIGHTS</span>
      {interactive && (
        <div className="map-hint">
          <MapPin size={14} />
          Tap a pink star to find its pole number.
        </div>
      )}
    </div>
  );
}
