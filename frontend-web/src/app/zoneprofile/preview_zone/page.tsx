"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/ui/AdminLayout";
import { Button } from "@/components/ui/button";
import { Loader as GoogleLoader } from "@googlemaps/js-api-loader";

// --- Types ---
type Zone = {
  zone_id: number;
  zone_name: string;
  geological_name: string;
  rock_type: string;
  key_rock: string;
  lat_min: number; lat_max: number; lng_min: number; lng_max: number;
  density: "low" | "medium" | "high" | string;
  spawn_cooldown_minutes: number;
  max_spawn_count: number;
  priority?: number;
  is_active?: boolean;
  polygon_geojson?: any | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const BACK_TO = "/zoneprofile";

// --- Auth helper ---
const getAuthInfo = () => {
  try {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    if (!token || !email) return { isAuthenticated: false, error: "No authentication token found" };
    return { isAuthenticated: true, token, email };
  } catch {
    return { isAuthenticated: false, error: "Authentication error" };
  }
};

export default function PreviewZonesOnGoogleMap() {
  const router = useRouter();

  // UI/data state
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Google map refs
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<Array<google.maps.Polygon | google.maps.Rectangle>>([]);
  const labelsRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);

  // Palette (fallback when density is not low/medium/high)
  const palette = useMemo(
    () => ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666","#1f78b4","#b2df8a"],
    []
  );
  const colorForZone = (z: Zone) => {
    if (z.is_active === false) return { stroke: "#5f6368", fill: "#9aa0a6" }; // suspended
    if (z.density === "low") return { stroke: "#2e7d32", fill: "#66bb6a" };
    if (z.density === "medium") return { stroke: "#ef6c00", fill: "#ffb74d" };
    if (z.density === "high") return { stroke: "#c62828", fill: "#ef5350" };
    const c = palette[z.zone_id % palette.length];
    return { stroke: c, fill: c };
  };

  // Load Google Maps JS
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!GMAPS_KEY) throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
        const loader = new GoogleLoader({ apiKey: GMAPS_KEY, version: "weekly" });
        await loader.load();
        if (cancelled) return;

        if (!mapRef.current && mapDivRef.current) {
          mapRef.current = new google.maps.Map(mapDivRef.current, {
            center: { lat: 1.3521, lng: 103.8198 }, // SG
            zoom: 12,
            mapTypeId: "roadmap",
            clickableIcons: false,
          });
          infoRef.current = new google.maps.InfoWindow({ maxWidth: 320 });
        }
      } catch (e: any) {
        setErr(e?.message || "Failed to load Google Maps");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch zones
  const fetchZones = async () => {
    try {
      setLoading(true);
      setErr(null);
      const auth = getAuthInfo();
      if (!auth.isAuthenticated) {
        setErr(auth.error || "Authentication failed");
        router.push("/login");
        return;
      }
      const res = await fetch(`${API}/api/zones/admin/all`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Non-JSON response (${res.status}). ${t.slice(0, 120)}`);
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch zones");
      setZones(data.zones || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchZones(); }, []);

  // GeoJSON helpers
  const ringToPath = (ring: number[][]) => ring.map(([lng, lat]) => ({ lat, lng }));
  const polygonGeomToPaths = (geometry: any): google.maps.LatLngLiteral[][] =>
    (geometry.coordinates || []).map(ringToPath);

  const centerOfPaths = (paths: google.maps.LatLngLiteral[][]) => {
    const b = new google.maps.LatLngBounds();
    paths.forEach(r => r.forEach(p => b.extend(p)));
    return b.getCenter();
  };

  // Draw zones
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(zones)) return;

    // clear old
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    labelsRef.current.forEach((m) => m.setMap(null));
    labelsRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    // ---- InfoWindow with custom close button + no top gap ----
    const showInfo = (z: Zone, at: google.maps.LatLng | google.maps.LatLngLiteral) => {
      if (!infoRef.current || !mapRef.current) return;

      const html = `
        <div class="gm-iw" style="min-width:240px;max-width:320px;">
          <button class="gm-iw-close" aria-label="Close">&times;</button>
          <div class="gm-iw-title">${z.zone_name}</div>
          <div class="gm-iw-body">
            <div><b>Geology:</b> ${z.geological_name}</div>
            <div><b>Rock:</b> ${z.rock_type} (${z.key_rock})</div>
            <div><b>Density:</b> ${z.density}</div>
            <div><b>Status:</b> ${z.is_active ? "active" : "suspended"}</div>
            <div><b>ID:</b> ${z.zone_id}</div>
          </div>
        </div>`;

      infoRef.current.setContent(html);
      infoRef.current.setPosition(at);
      infoRef.current.open({ map: mapRef.current });

      // hook up our close button
      google.maps.event.addListenerOnce(infoRef.current, "domready", () => {
        document.querySelector<HTMLButtonElement>(".gm-iw-close")?.addEventListener("click", () => {
          infoRef.current?.close();
        });
      });
    };
    // ----------------------------------------------------------

    const drawLabel = (pos: google.maps.LatLng) => {
      const marker = new google.maps.Marker({
        position: pos,
        map: mapRef.current!,
        clickable: false,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: { text: "", color: "#111", fontSize: "12px", fontWeight: "700" },
        zIndex: 9999,
      });
      return marker;
    };

    zones.forEach((z) => {
      const style = colorForZone(z);

      const gj = z.polygon_geojson;
      if (gj && typeof gj === "object") {
        const handleFeature = (feat: any) => {
          if (!feat || !feat.geometry) return;

          if (feat.geometry.type === "Polygon") {
            const paths = polygonGeomToPaths(feat.geometry);
            const poly = new google.maps.Polygon({
              paths,
              strokeColor: style.stroke,
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: style.fill,
              fillOpacity: 0.35,
              zIndex: (z.priority ?? 0) + 1,
            });
            poly.setMap(mapRef.current!);
            overlaysRef.current.push(poly);

            const center = centerOfPaths(paths);
            const label = drawLabel(center);
            label.setLabel({ text: z.zone_name, color: "#111", fontSize: "12px", fontWeight: "700" });
            labelsRef.current.push(label);

            paths.flat().forEach((p) => bounds.extend(p));
            poly.addListener("click", (e: google.maps.MapMouseEvent) => {
              if (e.latLng) showInfo(z, e.latLng);
            });
          } else if (feat.geometry.type === "MultiPolygon") {
            const polys: number[][][][] = feat.geometry.coordinates || [];
            const allForCenter: google.maps.LatLngLiteral[] = [];
            polys.forEach((rings) => {
              const paths = rings.map(ringToPath);
              const poly = new google.maps.Polygon({
                paths,
                strokeColor: style.stroke,
                strokeOpacity: 0.9,
                strokeWeight: 2,
                fillColor: style.fill,
                fillOpacity: 0.35,
                zIndex: (z.priority ?? 0) + 1,
              });
              poly.setMap(mapRef.current!);
              overlaysRef.current.push(poly);
              paths.flat().forEach((p) => {
                bounds.extend(p);
                allForCenter.push(p);
              });
              poly.addListener("click", (e: google.maps.MapMouseEvent) => {
                if (e.latLng) showInfo(z, e.latLng);
              });
            });
            if (allForCenter.length) {
              const b = new google.maps.LatLngBounds();
              allForCenter.forEach((p) => b.extend(p));
              const label = drawLabel(b.getCenter());
              label.setLabel({ text: z.zone_name, color: "#111", fontSize: "12px", fontWeight: "700" });
              labelsRef.current.push(label);
            }
          }
        };

        if (gj.type === "FeatureCollection") {
          (gj.features || []).forEach((f: any) => handleFeature(f));
        } else if (gj.type === "Feature") {
          handleFeature(gj);
        } else if (gj.type === "Polygon" || gj.type === "MultiPolygon") {
          handleFeature({ type: "Feature", geometry: gj, properties: {} });
        }
      } else {
        // bbox fallback
        const rect = new google.maps.Rectangle({
          bounds: {
            south: z.lat_min,
            west: z.lng_min,
            north: z.lat_max,
            east: z.lng_max,
          },
          strokeColor: style.stroke,
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: style.fill,
          fillOpacity: 0.20,
          zIndex: (z.priority ?? 0) + 1,
        });
        rect.setMap(mapRef.current!);
        overlaysRef.current.push(rect);

        const rb = rect.getBounds();
        if (rb) {
          bounds.extend(rb.getSouthWest());
          bounds.extend(rb.getNorthEast());
          const label = drawLabel(rb.getCenter());
          label.setLabel({ text: z.zone_name, color: "#111", fontSize: "12px", fontWeight: "700" });
          labelsRef.current.push(label);
        }

        rect.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) showInfo(z, e.latLng);
        });
      }
    });

    if (!bounds.isEmpty()) {
      mapRef.current!.fitBounds(bounds, 40);
    }
  }, [zones, palette]);

  // AdminLayout navigation
  const handleNavigation = (item: string) => {
    switch (item) {
      case "home": router.push("/dashboard"); break;
      case "applications": router.push("/applications"); break;
      case "user-account": router.push("/useraccount"); break;
      case "user-type": router.push("/usertype"); break;
      case "user-profiling": router.push("/userprofiling"); break;
      case "forum": router.push("/forummanagement"); break;
      case "landing-page": router.push("/landingpagemanagement"); break;
      case "rock-management": router.push("/rockmanagement"); break;
      case "zone-management": router.push("/zoneprofile"); break;
      case "faq-page": router.push("/faqmanagement"); break;
      case "my-profile": router.push("/adminprofile"); break;
      case "logout":
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminToken");
        router.push("/login");
        break;
      default:
        break;
    }
  };

  return (
    <AdminLayout
      activeMenuItem="zone-management"
      title="Hi, Admin 👋"
      subtitle="Preview all zones on Google Maps"
      onNavigate={handleNavigation}
    >
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Zone Preview</h2>
              <p className="text-sm text-gray-600">
                Click a zone for details. Names are shown at each zone’s center.
              </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="text-white bg-gray-600 border-gray-300 hover:bg-gray-200"
                    onClick={() => router.push("/zoneprofile")}
                    >
                     &lt; Back to Zones
                    </Button>
              <Button
                variant="outline"
                className="text-gray-900 border-gray-300 hover:bg-gray-50"
                onClick={fetchZones}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </Button>
              <Button
                variant="outline"
                className="text-gray-900 border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  if (!mapRef.current) return;
                  const b = new google.maps.LatLngBounds();
                  overlaysRef.current.forEach((o) => {
                    // polygons
                    // @ts-ignore
                    if (typeof o.getPaths === "function") {
                      const poly = o as google.maps.Polygon;
                      poly.getPaths().forEach((path) => path.forEach((ll) => b.extend(ll)));
                    } else if (typeof (o as google.maps.Rectangle).getBounds === "function") {
                      const r = o as google.maps.Rectangle;
                      const rb = r.getBounds();
                      if (rb) {
                        b.extend(rb.getSouthWest());
                        b.extend(rb.getNorthEast());
                      }
                    }
                  });
                  if (!b.isEmpty()) mapRef.current.fitBounds(b, 40);
                }}
              >
                Fit to all
              </Button>
            </div>
          </div>

          {/* Map container */}
          <div className="p-4">
            {err && (
              <div className="mb-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">
                {err}
              </div>
            )}
            <div
              ref={mapDivRef}
              style={{ width: "100%", height: "72vh", borderRadius: 12, overflow: "hidden" }}
            />
          </div>

          {/* Legend */}
          <div className="px-4 pb-4">
            <div className="inline-flex gap-4 text-xs text-gray-700">
              <span className="inline-flex items-center gap-1">
                <span style={{ width: 12, height: 12, background: "#66bb6a", display: "inline-block", border: "2px solid #2e7d32" }} />
                Low density
              </span>
              <span className="inline-flex items-center gap-1">
                <span style={{ width: 12, height: 12, background: "#ffb74d", display: "inline-block", border: "2px solid #ef6c00" }} />
                Medium
              </span>
              <span className="inline-flex items-center gap-1">
                <span style={{ width: 12, height: 12, background: "#ef5350", display: "inline-block", border: "2px solid #c62828" }} />
                High
              </span>
              <span className="inline-flex items-center gap-1">
                <span style={{ width: 12, height: 12, background: "#9aa0a6", display: "inline-block", border: "2px solid #5f6368" }} />
                Suspended
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==== Kill the top gap inside InfoWindow & style our X ==== */}
      <style jsx global>{`
        /* Hide Google's default X (prevents reserved space) */
        .gm-style .gm-ui-hover-effect { display: none !important; }

        /* Remove extra top padding Google adds in the container */
        .gm-style .gm-style-iw-c {
          padding: 8px 12px 10px 12px !important; /* tight, no big top gap */
          max-width: 320px !important;
        }

        /* Our content block */
        .gm-iw { position: relative; color: #111; }
        .gm-iw-title { font-weight: 700; margin: 0 28px 6px 0; font-size: 14px; }
        .gm-iw-body { font-size: 12px; line-height: 1.5; }

        /* Custom close button pinned top-right inside the bubble */
        .gm-iw-close {
          position: absolute;
          top: 6px;
          right: 8px;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #111;
          font-size: 16px;
          line-height: 20px;
          text-align: center;
          cursor: pointer;
        }
        .gm-iw-close:hover { background: #f3f4f6; }
      `}</style>
    </AdminLayout>
  );
}
