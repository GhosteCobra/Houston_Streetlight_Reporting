"use client";

import { useEffect, useRef, useState } from "react";
import type MapView from "@arcgis/core/views/MapView";
import type { Coordinates, CenterPointPole } from "@/lib/server/centerpoint/adapter";

const SERVICE = "https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer";

export default function CenterPointMap({ center, selected, onPick }: {
  center: Coordinates;
  selected: CenterPointPole | null;
  onPick: (point: Coordinates) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<MapView | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [zoomedOut, setZoomedOut] = useState(false);
  useEffect(() => {
    let disposed = false;
    let owned: MapView | undefined;
    let removeWatch: (() => void) | undefined;
    (async () => {
      try {
        const [{ default: Map }, { default: View }, { default: MapImageLayer }, { default: config }, reactive] = await Promise.all([
          import("@arcgis/core/Map"), import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/MapImageLayer"), import("@arcgis/core/config"),
          import("@arcgis/core/core/reactiveUtils"),
        ]);
        if (disposed || !container.current) return;
        config.assetsPath = "https://js.arcgis.com/4.34/@arcgis/core/assets";
        const poles = new MapImageLayer({ url: SERVICE, title: "CenterPoint streetlights", sublayers: [{ id: 0, visible: true, popupEnabled: false }] });
        owned = new View({ container: container.current, map: new Map({ basemap: "gray-vector", layers: [poles] }), center: [center.longitude, center.latitude], zoom: 17, popupEnabled: false, ui: { components: ["zoom", "attribution"] } });
        view.current = owned;
        await owned.when();
        await poles.load();
        if (disposed) return;
        const layerView = await owned.whenLayerView(poles);
        if (disposed) return;
        const watch = reactive.watch(() => [owned!.scale, layerView.suspended], () => setZoomedOut(owned!.scale > 10000), { initial: true });
        removeWatch = () => watch.remove();
        owned.on("layerview-create-error", () => setError("The streetlight layer could not load. Reload the page to retry."));
        owned.on("click", (event) => {
          if (event.mapPoint && owned!.scale <= 10000) {
            pick.current({ latitude: event.mapPoint.latitude!, longitude: event.mapPoint.longitude! });
          }
        });
        setReady(true);
      } catch {
        if (!disposed) setError("The map could not load. Check your connection and reload to retry.");
      }
    })();
    return () => { disposed = true; removeWatch?.(); owned?.destroy(); view.current = null; };
    // Create one map. The effects below update its position and selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (ready) void view.current?.goTo({ center: [center.longitude, center.latitude], zoom: 17 }, { animate: false }).catch(() => {});
  }, [center.latitude, center.longitude, ready]);
  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!ready || !view.current) return;
      const [{ default: Graphic }, { default: Point }] = await Promise.all([import("@arcgis/core/Graphic"), import("@arcgis/core/geometry/Point")]);
      if (disposed || !view.current) return;
      view.current.graphics.removeAll();
      if (selected) view.current.graphics.add(new Graphic({
        geometry: new Point({ latitude: selected.latitude, longitude: selected.longitude }),
        symbol: { type: "simple-marker", style: "circle", size: 28, color: [0, 0, 0, 0], outline: { color: "#15234c", width: 3 } },
      }));
    })();
    return () => { disposed = true; };
  }, [selected, ready]);
  return <div className="map-shell cp-live-map">
    <div ref={container} className="arcgis-map" aria-label="CenterPoint streetlights. Pan to browse and tap a star to inspect nearby pole numbers." />
    {!ready && !error && <div className="map-loading" role="status">Loading CenterPoint streetlights…</div>}
    {error && <p className="map-error" role="alert">{error}</p>}
    <span className="map-demo">CENTERPOINT STREETLIGHTS</span>
    <div className="map-hint">{zoomedOut ? "Zoom in to street level to see poles and their numbers." : "Tap a pink star, then confirm its pole number below."}</div>
  </div>;
}
