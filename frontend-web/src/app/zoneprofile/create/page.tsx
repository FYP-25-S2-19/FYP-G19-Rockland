"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/ui/AdminLayout";

type Form = {
  zone_name: string;
  geological_name: string;
  rock_type: string;
  key_rock: string;
  lat_min: string;
  lat_max: string;
  lng_min: string;
  lng_max: string;
  density: "low" | "medium" | "high";
  spawn_cooldown_minutes: string;
  max_spawn_count: string;
  priority: string;
  is_active: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BACK_TO = "/zoneprofile";

// Leaflet (client-only)
const L: any = typeof window !== "undefined" ? require("leaflet") : null;
if (L) {
  require("leaflet-draw");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function CreateZonePage() {
  const router = useRouter();

  // Map refs
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // UI state
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rawGeojson, setRawGeojson] = useState("");
  const [csvText, setCsvText] = useState("");

  // Form
  const [form, setForm] = useState<Form>({
    zone_name: "",
    geological_name: "",
    rock_type: "",
    key_rock: "",
    lat_min: "",
    lat_max: "",
    lng_min: "",
    lng_max: "",
    density: "medium",
    spawn_cooldown_minutes: "15",
    max_spawn_count: "15",
    priority: "0",
    is_active: true,
  });

  // Auth helper
  const auth = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const email = typeof window !== "undefined" ? localStorage.getItem("adminEmail") : null;
    if (!token || !email) throw new Error("Not authenticated");
    return token;
  };

  // Map init (note: keyboard: false avoids stealing typing)
  useEffect(() => {
    if (!L || mapRef.current) return;

    const map = L.map("zone-create-map", {
      center: [1.3521, 103.8198],
      zoom: 12,
      keyboard: false, // <-- important: don't eat keyboard events
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        rectangle: true,
        marker: false, circle: false, circlemarker: false, polyline: false,
      },
      edit: { featureGroup: drawnItems, remove: true },
    });
    map.addControl(drawControl);

    // Only keep one geometry
    map.on(L.Draw.Event.CREATED, (e: any) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
    });

    layerRef.current = drawnItems;
    mapRef.current = map;
  }, []);

  // ---------- Geo helpers ----------
  const normalizeGeoJSON = (input: any) => {
    if (!input || typeof input !== "object") return null;
    const t = input.type;
    if (t === "Polygon" || t === "MultiPolygon") return input;
    if (t === "Feature") {
      const g = input.geometry;
      if (g && (g.type === "Polygon" || g.type === "MultiPolygon")) return g;
      return null;
    }
    if (t === "FeatureCollection") {
      const feats = input.features || [];
      for (const f of feats) {
        const g = f?.geometry;
        if (g && (g.type === "Polygon" || g.type === "MultiPolygon")) return g;
      }
      return null;
    }
    return null;
  };

  const bboxFromGeoJSON = (geom: any) => {
    const coords: Array<[number, number]> = []; // [lng, lat]
    if (geom?.type === "Polygon") {
      (geom.coordinates || []).forEach((ring: any[]) => (ring || []).forEach(([lng, lat]) => coords.push([lng, lat])));
    } else if (geom?.type === "MultiPolygon") {
      (geom.coordinates || []).forEach((poly: any[]) =>
        (poly || []).forEach((ring: any[]) => (ring || []).forEach(([lng, lat]) => coords.push([lng, lat])))
      );
    }
    if (!coords.length) return null;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    return [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)] as const;
  };

  const drawFeature = (feature: any) => {
    const fg = layerRef.current as any;
    if (!fg || !L || !mapRef.current) return;
    fg.clearLayers();
    L.geoJSON(feature).eachLayer((lyr: any) => fg.addLayer(lyr));
    const bounds = L.geoJSON(feature).getBounds();
    if (bounds.isValid()) mapRef.current.fitBounds(bounds.pad(0.1));
  };

  const featureFromBBox = (latMin: number, latMax: number, lngMin: number, lngMax: number) => ({
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [[
        [lngMin, latMin], [lngMax, latMin], [lngMax, latMax], [lngMin, latMax], [lngMin, latMin],
      ]],
    },
  });

  const extractPolygon = (): any | null => {
    const fg = layerRef.current as any;
    if (!fg) return null;
    const layers: any[] = [];
    fg.eachLayer((l: any) => layers.push(l));
    if (!layers.length) return null;
    const gj = layers[0].toGeoJSON();
    return gj.type === "Feature" ? gj : { type: "Feature", properties: {}, geometry: gj };
  };

  // CSV -> polygon (accepts "lng,lat" or "lat,lng", auto-detects order)
  const csvToFeature = (csv: string) => {
    const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const points: Array<[number, number]> = []; // [lng, lat]

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].replace(/,+/g, ",").replace(/\s+/g, " ");
      const parts = raw.split(/[,\s]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const a = Number(parts[0]);
      const b = Number(parts[1]);
      if (Number.isNaN(a) || Number.isNaN(b)) continue;

      // detect which is lat/lng:
      // if |a| <= 90 and |b| <= 180 -> assume a=lat, b=lng
      // else assume a=lng, b=lat
      const isALat = Math.abs(a) <= 90 && Math.abs(b) <= 180;
      const lng = isALat ? b : a;
      const lat = isALat ? a : b;
      points.push([lng, lat]);
    }

    if (points.length < 3) throw new Error("CSV needs at least 3 coordinate rows.");

    // close ring if not closed
    const first = points[0];
    const last = points[points.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) points.push([first[0], first[1]]);

    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [points],
      },
    };
  };

  // ---------- Actions ----------
  const onChange = (k: keyof Form, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const previewRawGeoJSON = () => {
    try {
      if (!rawGeojson.trim()) return;
      const parsed = JSON.parse(rawGeojson);
      const geom = normalizeGeoJSON(parsed);
      if (!geom) throw new Error("GeoJSON must be a Polygon or MultiPolygon (or a Feature/FeatureCollection of those).");
      const feature = { type: "Feature", properties: {}, geometry: geom };
      drawFeature(feature);

      const bb = bboxFromGeoJSON(geom);
      if (bb) {
        const [latMin, latMax, lngMin, lngMax] = bb;
        setForm((prev) => ({
          ...prev,
          lat_min: String(latMin),
          lat_max: String(latMax),
          lng_min: String(lngMin),
          lng_max: String(lngMax),
        }));
      }
    } catch (e: any) {
      setErr(e?.message || "Invalid GeoJSON");
    }
  };

  const previewFromCSV = () => {
    try {
      if (!csvText.trim()) return;
      const feature = csvToFeature(csvText);
      drawFeature(feature);

      // fill bbox
      const bb = bboxFromGeoJSON(feature.geometry);
      if (bb) {
        const [latMin, latMax, lngMin, lngMax] = bb;
        setForm((prev) => ({
          ...prev,
          lat_min: String(latMin),
          lat_max: String(latMax),
          lng_min: String(lngMin),
          lng_max: String(lngMax),
        }));
      }
    } catch (e: any) {
      setErr(e?.message || "Invalid CSV");
    }
  };

  const previewFromBBox = () => {
    try {
      const latMin = parseFloat(form.lat_min);
      const latMax = parseFloat(form.lat_max);
      const lngMin = parseFloat(form.lng_min);
      const lngMax = parseFloat(form.lng_max);
      if ([latMin, latMax, lngMin, lngMax].some((n) => Number.isNaN(n))) throw new Error("BBox fields must be numbers.");
      if (latMin >= latMax || lngMin >= lngMax) throw new Error("Invalid bbox: min must be less than max.");
      drawFeature(featureFromBBox(latMin, latMax, lngMax < lngMin ? lngMax : lngMin, lngMax));
    } catch (e: any) {
      setErr(e?.message || "Cannot preview bbox");
    }
  };

  const clearGeometry = () => {
    const fg = layerRef.current as any;
    if (fg) fg.clearLayers();
  };

  const createZone = async () => {
    try {
      setBusy(true);
      setErr(null);
      const token = auth();

      // Validate basics
      if (!form.zone_name.trim()) throw new Error("Zone name is required");
      if (!form.geological_name.trim()) throw new Error("Geological name is required");
      if (!form.rock_type.trim()) throw new Error("Rock type is required");
      if (!form.key_rock.trim()) throw new Error("Key rock is required");

      // Prefer polygon if drawn / pasted
      const feature = extractPolygon();

      // If no polygon, require bbox
      const latMin = parseFloat(form.lat_min);
      const latMax = parseFloat(form.lat_max);
      const lngMin = parseFloat(form.lng_min);
      const lngMax = parseFloat(form.lng_max);
      if (!feature) {
        if ([latMin, latMax, lngMin, lngMax].some((n) => Number.isNaN(n))) {
          throw new Error("If no polygon is drawn, bbox must be valid numbers.");
        }
        if (latMin >= latMax || lngMin >= lngMax) {
          throw new Error("Invalid bbox: min must be less than max.");
        }
      }

      const body: any = {
        zone_name: form.zone_name.trim(),
        geological_name: form.geological_name.trim(),
        rock_type: form.rock_type.trim(),
        key_rock: form.key_rock.trim(),
        density: form.density,
        spawn_cooldown_minutes: parseInt(form.spawn_cooldown_minutes, 10),
        max_spawn_count: parseInt(form.max_spawn_count, 10),
        priority: parseInt(form.priority, 10) || 0,
        is_active: !!form.is_active,
      };

      if (feature) {
        body.polygon_geojson = feature; // backend recomputes bbox from polygon
      } else {
        body.lat_min = latMin;
        body.lat_max = latMax;
        body.lng_min = lngMin;
        body.lng_max = lngMax;
      }

      const res = await fetch(`${API}/api/zones/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Non-JSON response (${res.status}). ${t.slice(0, 120)}`);
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Creation failed");

      router.push(BACK_TO);
    } catch (e: any) {
      setErr(e.message || "Failed to create zone");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      activeMenuItem="zone-management"
      title="Hi, Admin 👋"
      subtitle="Create a new zone"
      onNavigate={(item) => {
        if (item === "zone-management") router.push(BACK_TO);
      }}
    >
      <div className="p-6 space-y-4 bg-white dark:bg-white text-gray-900 dark:text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Zone</h1>
            <p className="text-sm text-gray-600">Fill details, paste CSV/GeoJSON, or draw a polygon, then preview it.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(BACK_TO)} disabled={busy}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={createZone} disabled={busy}>
              {busy ? "Creating…" : "Create Zone"}
            </Button>
          </div>
        </div>

        {err && <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">{err}</div>}

        {/* Split layout: map left, form right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Map (keep under the form via z-index) */}
          <div className="md:col-span-7 relative z-0">
            <div
              id="zone-create-map"
              className="relative"
              style={{ width: "100%", height: "70vh", borderRadius: 12, overflow: "hidden" }}
            />
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" onClick={clearGeometry} disabled={busy}>Clear Geometry</Button>
              <Button variant="outline" onClick={previewFromBBox} disabled={busy}>Preview from BBox</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use polygon/rectangle tools. Drawing a new shape replaces the previous.
            </p>
          </div>

          {/* Form column (raised z-index to ensure clickability) */}
          <div className="md:col-span-5 relative z-10 pointer-events-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              {/* Basic */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Zone Name *</label>
                  <Input
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.zone_name}
                    onChange={(e) => onChange("zone_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Geological Name *</label>
                  <Input
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.geological_name}
                    onChange={(e) => onChange("geological_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Rock Type *</label>
                  <Input
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.rock_type}
                    onChange={(e) => onChange("rock_type", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Key Rock *</label>
                  <Input
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.key_rock}
                    onChange={(e) => onChange("key_rock", e.target.value)}
                  />
                </div>
              </div>

              {/* Density / spawn / priority */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Density</label>
                  <Select value={form.density} onValueChange={(v: any) => onChange("density", v)}>
                    <SelectTrigger className="text-gray-900">
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-900">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Cooldown (min)</label>
                  <Input
                    type="number" min={1}
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.spawn_cooldown_minutes}
                    onChange={(e) => onChange("spawn_cooldown_minutes", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Max Spawn</label>
                  <Input
                    type="number" min={1}
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.max_spawn_count}
                    onChange={(e) => onChange("max_spawn_count", e.target.value)}
                  />
                </div>
              </div>

              {/* Priority + Active */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Priority</label>
                  <Input
                    type="number"
                    className="text-gray-900 placeholder:text-gray-500"
                    value={form.priority}
                    onChange={(e) => onChange("priority", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Status</label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => onChange("is_active", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-800">
                      {form.is_active ? "Active" : "Suspended"}
                    </label>
                  </div>
                </div>
              </div>

              {/* BBox (used if no polygon is drawn) */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Bounding Box (used only if no polygon)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lat Min</label>
                    <Input
                      type="number" step="any"
                      className="text-gray-900 placeholder:text-gray-500"
                      value={form.lat_min}
                      onChange={(e) => onChange("lat_min", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lat Max</label>
                    <Input
                      type="number" step="any"
                      className="text-gray-900 placeholder:text-gray-500"
                      value={form.lat_max}
                      onChange={(e) => onChange("lat_max", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lng Min</label>
                    <Input
                      type="number" step="any"
                      className="text-gray-900 placeholder:text-gray-500"
                      value={form.lng_min}
                      onChange={(e) => onChange("lng_min", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lng Max</label>
                    <Input
                      type="number" step="any"
                      className="text-gray-900 placeholder:text-gray-500"
                      value={form.lng_max}
                      onChange={(e) => onChange("lng_max", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={previewFromBBox}>Preview from BBox</Button>
                </div>
                <p className="text-xs text-gray-500">
                  If you draw or paste a polygon, the server will ignore these and recompute the bbox from the polygon.
                </p>
              </div>

              {/* Paste raw GeoJSON */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Import GeoJSON (paste)</h4>
                <Textarea
                  placeholder='Feature / FeatureCollection / Polygon / MultiPolygon…'
                  className="min-h-[120px] text-gray-900 placeholder:text-gray-500"
                  value={rawGeojson}
                  onChange={(e) => setRawGeojson(e.target.value)}
                  onBlur={previewRawGeoJSON}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={previewRawGeoJSON}>Preview GeoJSON</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRawGeojson("");
                      clearGeometry();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Paste CSV */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Import CSV (paste)</h4>
                <Textarea
                  placeholder={`lng,lat
103.82,1.29
103.85,1.30
103.84,1.33
103.82,1.29`}
                  className="min-h-[120px] text-gray-900 placeholder:text-gray-500"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  onBlur={previewFromCSV}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={previewFromCSV}>Preview CSV</Button>
                  <Button
                    variant="outline"
                    onClick={() => setCsvText("")}
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Accepts <code>lng,lat</code> or <code>lat,lng</code> per line (auto-detected). At least 3 rows required.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => router.push(BACK_TO)} disabled={busy}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={createZone} disabled={busy}>
                  {busy ? "Creating…" : "Create Zone"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
