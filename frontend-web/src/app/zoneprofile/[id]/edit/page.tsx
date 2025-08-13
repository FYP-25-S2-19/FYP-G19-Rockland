"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/ui/AdminLayout";

type Zone = {
  zone_id: number;
  zone_name: string;
  geological_name: string;
  rock_type: string;
  key_rock: string;
  lat_min: number; lat_max: number; lng_min: number; lng_max: number;
  density: "low" | "medium" | "high";
  spawn_cooldown_minutes: number;
  max_spawn_count: number;
  priority?: number;
  is_active?: boolean;
  polygon_geojson?: any | null;
};

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
  // Fix default marker icons in Next.js
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function EditZonePage() {
  const { id } = useParams<{ id: string }>();
  const zoneId = Number(id);
  const router = useRouter();

  // Map container (ref, not id) to prevent reuse error
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const drawnRef = useRef<any>(null);

  // Data/UI
  const [zone, setZone] = useState<Zone | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Paste/import helpers
  const [rawGeojson, setRawGeojson] = useState("");
  const [csvText, setCsvText] = useState("");

  // ---------- Auth ----------
  const auth = () => {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    if (!token || !email) throw new Error("Not authenticated");
    return token;
  };

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
        (poly || []).forEach((ring: any[]) => (ring || []).forEach(([lng, lat]) => coords.push([lng, lat]))));
    }
    if (!coords.length) return null;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    return [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)] as const;
  };

  const bboxToFeature = (z: { lat_min:number; lat_max:number; lng_min:number; lng_max:number }) => ({
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [[
        [z.lng_min, z.lat_min], [z.lng_max, z.lat_min],
        [z.lng_max, z.lat_max], [z.lng_min, z.lat_max],
        [z.lng_min, z.lat_min],
      ]],
    },
  });

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
    const fg = drawnRef.current as any;
    if (!fg) return null;
    const layers: any[] = [];
    fg.eachLayer((l: any) => layers.push(l));
    if (!layers.length) return null;
    const gj = layers[0].toGeoJSON();
    return gj.type === "Feature" ? gj : { type: "Feature", properties: {}, geometry: gj };
  };

  const drawFeature = (feature: any) => {
    if (!L || !mapRef.current || !drawnRef.current) return;
    const fg = drawnRef.current as any;
    fg.clearLayers();
    L.geoJSON(feature).eachLayer((lyr: any) => fg.addLayer(lyr));
    const bounds = L.geoJSON(feature).getBounds();
    if (bounds.isValid()) mapRef.current.fitBounds(bounds.pad(0.1));
    setTimeout(() => mapRef.current.invalidateSize(), 80);
  };

  // ---------- CSV import (lat,lng columns) ----------
  const parseCSVLatLng = (text: string): Array<[number, number]> => {
    const rows = text
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (!rows.length) return [];
    // detect header
    const headerCells = rows[0].split(/,|;|\t/).map((s) => s.trim().toLowerCase());
    let latIdx = -1, lngIdx = -1, start = 0;
    const latNames = ["lat","latitude","y"];
    const lngNames = ["lng","long","lon","longitude","x"];
    if (headerCells.some((h) => latNames.includes(h)) && headerCells.some((h) => lngNames.includes(h))) {
      latIdx = headerCells.findIndex((h) => latNames.includes(h));
      lngIdx = headerCells.findIndex((h) => lngNames.includes(h));
      start = 1;
    } else {
      latIdx = 0; lngIdx = 1; start = 0;
    }
    const pts: Array<[number, number]> = [];
    for (let i = start; i < rows.length; i++) {
      const c = rows[i].split(/,|;|\t/).map((s) => s.trim());
      const lat = parseFloat(c[latIdx]);
      const lng = parseFloat(c[lngIdx]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) pts.push([lng, lat]); // GeoJSON order [lng,lat]
    }
    return pts;
  };

  const previewCSV = () => {
    try {
      const pts = parseCSVLatLng(csvText);
      if (pts.length < 3) throw new Error("Need at least 3 valid points.");
      // close ring
      if (pts[0][0] !== pts[pts.length-1][0] || pts[0][1] !== pts[pts.length-1][1]) {
        pts.push([pts[0][0], pts[0][1]]);
      }
      const feature = {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [pts] },
      };
      drawFeature(feature);
      const bb = bboxFromGeoJSON(feature.geometry);
      if (bb) {
        const [latMin, latMax, lngMin, lngMax] = bb;
        setForm((prev) => prev ? ({
          ...prev,
          lat_min: String(latMin), lat_max: String(latMax),
          lng_min: String(lngMin), lng_max: String(lngMax),
        }) : prev);
      }
    } catch (e: any) {
      setErr(e?.message || "Invalid CSV");
    }
  };

  // ---------- Preview actions ----------
  const previewRawGeoJSON = () => {
    try {
      if (!rawGeojson.trim()) return;
      const parsed = JSON.parse(rawGeojson);
      const geom = normalizeGeoJSON(parsed);
      if (!geom) throw new Error("GeoJSON must be Polygon/MultiPolygon or a Feature/FeatureCollection containing one.");
      const feature = { type: "Feature", properties: {}, geometry: geom };
      drawFeature(feature);
      const bb = bboxFromGeoJSON(geom);
      if (bb) {
        const [latMin, latMax, lngMin, lngMax] = bb;
        setForm((prev) => prev ? ({
          ...prev,
          lat_min: String(latMin), lat_max: String(latMax),
          lng_min: String(lngMin), lng_max: String(lngMax),
        }) : prev);
      }
    } catch (e: any) {
      setErr(e?.message || "Invalid GeoJSON");
    }
  };

  const previewFromBBox = () => {
    try {
      if (!form) return;
      const latMin = parseFloat(form.lat_min);
      const latMax = parseFloat(form.lat_max);
      const lngMin = parseFloat(form.lng_min);
      const lngMax = parseFloat(form.lng_max);
      if ([latMin, latMax, lngMin, lngMax].some((n) => Number.isNaN(n))) throw new Error("BBox fields must be numbers.");
      if (latMin >= latMax || lngMin >= lngMax) throw new Error("Invalid bbox: min must be less than max.");
      drawFeature(featureFromBBox(latMin, latMax, lngMin, lngMax));
    } catch (e: any) {
      setErr(e?.message || "Cannot preview bbox");
    }
  };

  const clearGeometry = () => {
    const fg = drawnRef.current as any;
    if (fg) fg.clearLayers();
  };

  // ---------- Load zone ----------
  const loadZone = async () => {
    try {
      setBusy(true);
      setErr(null);
      const token = auth();

      const res = await fetch(`${API}/api/zones/view/${zoneId}`, { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Non-JSON response (${res.status}). ${t.slice(0, 120)}`);
      }
      const data = await res.json();
      const z: Zone = data?.zone || data;

      setZone(z);
      setForm({
        zone_name: z.zone_name || "",
        geological_name: z.geological_name || "",
        rock_type: z.rock_type || "",
        key_rock: z.key_rock || "",
        lat_min: String(z.lat_min ?? ""),
        lat_max: String(z.lat_max ?? ""),
        lng_min: String(z.lng_min ?? ""),
        lng_max: String(z.lng_max ?? ""),
        density: (z.density as any) || "medium",
        spawn_cooldown_minutes: String(z.spawn_cooldown_minutes ?? "15"),
        max_spawn_count: String(z.max_spawn_count ?? "15"),
        priority: String(z.priority ?? "0"),
        is_active: z.is_active ?? true,
      });

      // Prefill raw GeoJSON editor with existing polygon if any
      if (z.polygon_geojson) setRawGeojson(JSON.stringify(z.polygon_geojson, null, 2));

      // Draw it
      const feature = z.polygon_geojson
        ? (z.polygon_geojson.type === "Feature" || z.polygon_geojson.type === "FeatureCollection"
            ? z.polygon_geojson
            : { type: "Feature", properties: {}, geometry: z.polygon_geojson })
        : bboxToFeature(z);

      drawFeature(feature);
    } catch (e: any) {
      setErr(e.message || "Failed to load zone");
    } finally {
      setBusy(false);
    }
  };

  // ---------- Map init (safe) ----------
  useEffect(() => {
    if (!L || mapRef.current) return;
    const el = mapContainerRef.current;
    if (!el) return;

    // defensive: if strict/dev remount left a map on this node
    if ((el as any)._leaflet_id) {
      try { (el as any)._leaflet_id = undefined; el.innerHTML = ""; } catch {}
    }

    const map = L.map(el, { center: [1.3521, 103.8198], zoom: 12 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);

    const drawn = new L.FeatureGroup();
    map.addLayer(drawn);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        rectangle: true,
        marker: false, circle: false, circlemarker: false, polyline: false,
      },
      edit: { featureGroup: drawn, remove: true },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      drawn.clearLayers();
      drawn.addLayer(e.layer);
    });

    mapRef.current = map;
    drawnRef.current = drawn;

    return () => {
      try { map.remove(); } catch {}
      mapRef.current = null;
      drawnRef.current = null;
    };
  }, []);

  useEffect(() => { loadZone(); }, []); // initial

  // ---------- Save ----------
  const onChange = (k: keyof Form, v: any) => setForm((prev) => (prev ? { ...prev, [k]: v } : prev));

  const saveAll = async () => {
    if (!form) return;
    try {
      setBusy(true);
      setErr(null);
      const token = auth();

      if (!form.zone_name.trim()) throw new Error("Zone name is required");
      if (!form.geological_name.trim()) throw new Error("Geological name is required");
      if (!form.rock_type.trim()) throw new Error("Rock type is required");
      if (!form.key_rock.trim()) throw new Error("Key rock is required");

      const feature = extractPolygon();

      const latMin = parseFloat(form.lat_min);
      const latMax = parseFloat(form.lat_max);
      const lngMin = parseFloat(form.lng_min);
      const lngMax = parseFloat(form.lng_max);

      if (!feature) {
        if ([latMin, latMax, lngMin, lngMax].some((n) => Number.isNaN(n))) throw new Error("BBox must be valid numbers (or draw/paste a polygon).");
        if (latMin >= latMax || lngMin >= lngMax) throw new Error("Invalid bbox: min must be less than max.");
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
        body.polygon_geojson = feature;
      } else {
        body.lat_min = latMin;
        body.lat_max = latMax;
        body.lng_min = lngMin;
        body.lng_max = lngMax;
      }

      const res = await fetch(`${API}/api/zones/update/${zoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Non-JSON response (${res.status}). ${t.slice(0, 120)}`);
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      router.push(BACK_TO);
    } catch (e: any) {
      setErr(e.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      activeMenuItem="zone-management"
      title="Hi, Admin 👋"
      subtitle={zone ? `Edit zone #${zone.zone_id}` : "Edit zone"}
      onNavigate={(item) => {
        if (item === "zone-management") router.push(BACK_TO);
        if (item === "logout") { localStorage.clear(); router.push("/login"); }
      }}
    >
      <div className="p-6 space-y-4 bg-white text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Zone</h1>
            <p className="text-sm text-gray-600">
              {zone ? `Zone: ${zone.zone_name} (#${zone.zone_id})` : "Loading zone…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(BACK_TO)} disabled={busy}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={saveAll} disabled={busy || !zone}>
              {busy ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        {err && <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">{err}</div>}

        {/* Split layout like create page */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Map + map actions */}
          <div className="md:col-span-7">
            <div ref={mapContainerRef} style={{ width: "100%", height: "70vh", borderRadius: 12, overflow: "hidden" }} />
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" onClick={clearGeometry} disabled={busy}>Clear Geometry</Button>
              <Button variant="outline" onClick={previewFromBBox} disabled={busy}>Preview from BBox</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use polygon/rectangle tools. Drawing a new shape replaces the previous.
            </p>
          </div>

          {/* Form + import panes */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              {/* Basic */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Zone Name *</label>
                  <Input value={form?.zone_name || ""} onChange={(e) => onChange("zone_name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Geological Name *</label>
                  <Input value={form?.geological_name || ""} onChange={(e) => onChange("geological_name", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Rock Type *</label>
                  <Input value={form?.rock_type || ""} onChange={(e) => onChange("rock_type", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Key Rock *</label>
                  <Input value={form?.key_rock || ""} onChange={(e) => onChange("key_rock", e.target.value)} />
                </div>
              </div>

              {/* Density / spawn / priority */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Density</label>
                  <Select value={form?.density || "medium"} onValueChange={(v: any) => onChange("density", v)}>
                    <SelectTrigger><SelectValue placeholder="Select density" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Cooldown (min)</label>
                  <Input type="number" min={1} value={form?.spawn_cooldown_minutes || ""} onChange={(e) => onChange("spawn_cooldown_minutes", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Max Spawn</label>
                  <Input type="number" min={1} value={form?.max_spawn_count || ""} onChange={(e) => onChange("max_spawn_count", e.target.value)} />
                </div>
              </div>

              {/* Priority + Active */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Priority</label>
                  <Input type="number" value={form?.priority || "0"} onChange={(e) => onChange("priority", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900">Status</label>
                  <div className="flex items-center gap-2 h-10">
                    <input id="is_active" type="checkbox" checked={!!form?.is_active} onChange={(e) => onChange("is_active", e.target.checked)} className="h-4 w-4" />
                    <label htmlFor="is_active" className="text-sm text-gray-800">{form?.is_active ? "Active" : "Suspended"}</label>
                  </div>
                </div>
              </div>

              {/* BBox (fallback when no polygon) */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Bounding Box (used only if no polygon)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lat Min</label>
                    <Input type="number" step="any" value={form?.lat_min || ""} onChange={(e) => onChange("lat_min", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lat Max</label>
                    <Input type="number" step="any" value={form?.lat_max || ""} onChange={(e) => onChange("lat_max", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lng Min</label>
                    <Input type="number" step="any" value={form?.lng_min || ""} onChange={(e) => onChange("lng_min", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">Lng Max</label>
                    <Input type="number" step="any" value={form?.lng_max || ""} onChange={(e) => onChange("lng_max", e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={previewFromBBox}>Preview from BBox</Button>
                </div>
                <p className="text-xs text-gray-500">
                  If you draw or paste a polygon, the server will ignore these and recompute the bbox from the polygon.
                </p>
              </div>

              {/* Paste raw GeoJSON (like create page) */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Import GeoJSON (paste)</h4>
                <Textarea
                  placeholder='Paste Feature / FeatureCollection / Polygon / MultiPolygon…'
                  className="min-h-[120px]"
                  value={rawGeojson}
                  onChange={(e) => setRawGeojson(e.target.value)}
                  onBlur={previewRawGeoJSON}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={previewRawGeoJSON}>Preview GeoJSON</Button>
                  <Button variant="outline" onClick={() => { setRawGeojson(""); clearGeometry(); }}>Clear</Button>
                </div>
                <p className="text-xs text-gray-500">We’ll preview the first Polygon/MultiPolygon found and auto-fill the bbox fields.</p>
              </div>

              {/* CSV paste (like create page) */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Import CSV (lat,lng)</h4>
                <Textarea
                  placeholder={`lat,lng
1.3519,103.7759
1.3550,103.7802
…`}
                  className="min-h-[120px]"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={previewCSV}>Preview CSV</Button>
                  <Button variant="outline" onClick={() => setCsvText("")}>Clear</Button>
                </div>
                <p className="text-xs text-gray-500">Headers optional. Accepts lat/lng, latitude/longitude, or y/x.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => router.push(BACK_TO)} disabled={busy}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={saveAll} disabled={busy || !zone}>
                  {busy ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
