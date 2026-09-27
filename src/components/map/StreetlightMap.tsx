"use client";
import { useEffect, useRef, useState } from "react";
import type { Coordinates, Pole } from "@/lib/report/model";
import type MapView from "@arcgis/core/views/MapView";
import type ArcGISMap from "@arcgis/core/Map";
import { CENTERPOINT_MAP_SERVICE, MAP_MODES, STREET_LEVEL_SCALE, type MapMode } from "@/lib/arcgis/map-layers";

export default function StreetlightMap({ location, poles, selected, onPin, onPole, interactive = true }: {
  location: Coordinates; poles: Pole[]; selected: string | null;
  onPin: (point: Coordinates) => void; onPole: (id: string) => void; interactive?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<MapView | null>(null);
  const map = useRef<ArcGISMap | null>(null);
  const callbacks = useRef({ onPin, onPole, interactive });
  callbacks.current = { onPin, onPole, interactive };
  const [mode, setMode] = useState<MapMode>("default");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [show3dInfo, setShow3dInfo] = useState(false);
  const [overview, setOverview] = useState(false);
  const latestLocation = useRef(location);
  latestLocation.current = location;

  useEffect(() => {
    let disposed = false;
    let owned: MapView | null = null;
    let stopWatching: (() => void) | undefined;
    setReady(false); setError("");
    (async () => {
      try {
        const [{ default: Map }, { default: MapImageLayer }, { default: config }, reactive] = await Promise.all([
          import("@arcgis/core/Map"), import("@arcgis/core/layers/MapImageLayer"),
          import("@arcgis/core/config"), import("@arcgis/core/core/reactiveUtils"),
        ]);
        if (disposed || !container.current) return;
        config.assetsPath = "https://js.arcgis.com/4.34/@arcgis/core/assets";
        if (!map.current) {
          const detailed = new MapImageLayer({ url: CENTERPOINT_MAP_SERVICE, title: "CenterPoint pole numbers", minScale: STREET_LEVEL_SCALE, sublayers: [{ id: 0, visible: true, popupEnabled: false }] });
          const coverage = new MapImageLayer({ url: CENTERPOINT_MAP_SERVICE, title: "CenterPoint service area", minScale: 0, maxScale: STREET_LEVEL_SCALE, sublayers: [{ id: 1, visible: true, popupEnabled: false, minScale: 0, maxScale: 0, renderer: { type: "simple", symbol: { type: "simple-fill", style: "solid", color: [108, 85, 175, 0.08], outline: { color: [63, 52, 109, 0.9], width: 2 } } } }] });
          map.current = new Map({ basemap: "osm", layers: [coverage, detailed] });
        }
        const { default: MapView } = await import("@arcgis/core/views/MapView");
        if (disposed || !container.current) return;
        map.current.basemap = mode === "satellite" ? "hybrid" : "osm";
        owned = new MapView({ container: container.current, map: map.current, popupEnabled: false,
          center: [latestLocation.current.longitude, latestLocation.current.latitude], zoom: 17,
          ui: { components: ["zoom", "attribution"] }, constraints: { minZoom: 3, snapToZoom: false },
        });
        view.current = owned;
        await owned.when();
        if (disposed) return;
        const handle = reactive.watch(() => owned!.scale, (scale) => setOverview(scale > STREET_LEVEL_SCALE), { initial: true });
        stopWatching = () => handle.remove();
        owned.on("layerview-create-error", () => {
          if (disposed) return;
          setError("A map layer could not load. Reload to retry.");
        });
        owned.on("click", async (event: __esri.ViewClickEvent) => {
          if (!owned) return;
          // At city scale a click zooms in; it must not guess a pole from the coverage outline.
          if (owned.scale > STREET_LEVEL_SCALE && event.mapPoint) {
            await owned.goTo({ center: event.mapPoint, zoom: 17 }, { animate: false }).catch(() => {});
            return;
          }
          if (!callbacks.current.interactive) return;
          const hit = await owned.hitTest(event);
          if (disposed || !callbacks.current.interactive) return;
          const found = hit.results.find((item) => item.type === "graphic" && item.graphic.attributes?.poleId);
          if (found?.type === "graphic") callbacks.current.onPole(found.graphic.attributes.poleId);
          else if (event.mapPoint) callbacks.current.onPin({ latitude: event.mapPoint.latitude!, longitude: event.mapPoint.longitude! });
        });
        setReady(true);
      } catch {
        if (!disposed) setError("The map could not load. Reload to retry.");
      }
    })();
    return () => {
      disposed = true; stopWatching?.();
      if (owned) {
        owned.map = null;
        owned.destroy();
      }
      view.current = null;
    };
    // Default and Satellite share one view so switching preserves location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    map.current?.destroy();
    map.current = null;
  }, []);

  useEffect(() => {
    if (map.current && ready) map.current.basemap = mode === "default" ? "osm" : "hybrid";
  }, [mode, ready]);
  useEffect(() => {
    if (view.current?.ready) void view.current.goTo({ center: [location.longitude, location.latitude] }, { animate: false }).catch(() => {});
  }, [location.latitude, location.longitude]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ready || !view.current) return;
      const [{ default: Graphic }, { default: Point }] = await Promise.all([import("@arcgis/core/Graphic"), import("@arcgis/core/geometry/Point")]);
      if (cancelled || !view.current) return;
      view.current.graphics.removeAll();
      for (const pole of interactive ? poles.filter((p) => p.id === selected) : []) view.current.graphics.add(new Graphic({
        geometry: new Point({ latitude: pole.latitude, longitude: pole.longitude }), attributes: { poleId: pole.id },
        symbol: { type: "simple-marker", color: "#6c55af", size: 20, outline: { color: "white", width: 2 } },
      }));
      if (interactive) view.current.graphics.add(new Graphic({ geometry: new Point({ latitude: location.latitude, longitude: location.longitude }),
        symbol: { type: "simple-marker", style: "cross", color: "#198799", size: 20, outline: { color: "white", width: 2 } },
      }));
    })();
    return () => { cancelled = true; };
  }, [location.latitude, location.longitude, poles, selected, ready, interactive]);

  return <div className="map-shell">
    <div ref={container} className="arcgis-map" aria-label={`CenterPoint streetlights in ${mode} view. Pink points show published streetlights.`} />
    <div className="map-layer-controls" role="group" aria-label="Map layers">
      {MAP_MODES.map((item) => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => { if (item.id === "3d") setShow3dInfo(true); else { setMode(item.id); setShow3dInfo(false); } }}>{item.label}</button>)}
    </div>
    <button type="button" className="map-coverage-button" disabled={!ready} onClick={async () => {
      const { default: Extent } = await import("@arcgis/core/geometry/Extent");
      await view.current?.goTo(new Extent({ xmin: -96.360313, ymin: 28.868938, xmax: -94.683509, ymax: 30.317169, spatialReference: { wkid: 4326 } }).expand(1.1), { animate: false }).catch(() => {});
    }}>Service area</button>
    {!ready && !error && <div className="map-loading" role="status">Loading map…</div>}
    {show3dInfo && <div className="map-3d-pending" role="status">
      <strong>Photorealistic 3D is pending</strong>
      <p>Real building imagery requires Google Maps setup. Default and Satellite are available now.</p>
      <button type="button" onClick={() => setShow3dInfo(false)}>Continue with {mode === "satellite" ? "Satellite" : "Default"}</button>
    </div>}
    {error && <p className="map-error" role="alert">{error}</p>}
    <div className="map-hint">{overview ? "Outlined area: CenterPoint coverage. Zoom in to see individual streetlights." : mode === "satellite" ? "Satellite imagery with CenterPoint poles. Imagery is not live." : "Tap a pink star to find its pole number."}</div>
  </div>;
}
