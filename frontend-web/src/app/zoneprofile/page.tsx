"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/ui/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, RefreshCw, Loader2, AlertCircle, CheckCircle, Eye, Pencil,
  PauseCircle, PlayCircle, Trash2, MapPin,
} from "lucide-react";

// ---------- Types ----------
interface ZoneProfile {
  zone_id: number;
  zone_name: string;
  geological_name: string;
  rock_type: string;
  key_rock: string;
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
  density: string;
  spawn_cooldown_minutes: number;
  max_spawn_count: number;
  priority?: number;
  is_active?: boolean;
}
type ZoneFull = ZoneProfile & { polygon_geojson?: any | null };

// ---------- Leaflet (client-only) ----------
const L: any = typeof window !== "undefined" ? require("leaflet") : null;
if (L) {
  // Fix default marker icons in Next.js
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ---------- API helpers ----------
const getAuthInfo = () => {
  try {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    if (!token || !email) {
      return { isAuthenticated: false, error: "No authentication token found" };
    }
    return { isAuthenticated: true, token, email };
  } catch {
    return { isAuthenticated: false, error: "Authentication error" };
  }
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ---------- Small geo helpers ----------
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

const normalizeFeature = (polygon_geojson: any) => {
  if (!polygon_geojson) return null;
  if (polygon_geojson.type === "Feature" || polygon_geojson.type === "FeatureCollection") return polygon_geojson;
  if (polygon_geojson.type === "Polygon" || polygon_geojson.type === "MultiPolygon") {
    return { type: "Feature", properties: {}, geometry: polygon_geojson };
  }
  return null;
};

// ---------- Mini map inside dialog (SAFE) ----------
function MiniZoneMap({ zone, open }: { zone: ZoneFull | null; open: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!open || !zone || !L) return;
    const container = containerRef.current;
    if (!container) return;

    // Defensive: if a Leaflet map was attached to this node previously (React strict/dev re-renders)
    if ((container as any)._leaflet_id) {
      try {
        (container as any)._leaflet_id = undefined;
        container.innerHTML = "";
      } catch {}
    }

    // Create once
    if (!mapRef.current) {
      const map = L.map(container, { center: [1.3521, 103.8198], zoom: 12 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
      mapRef.current = map;
      layerGroupRef.current = L.featureGroup().addTo(map);
    }

    // Update geometry
    const map = mapRef.current as any;
    const group = layerGroupRef.current as any;
    group.clearLayers();

    const feature = normalizeFeature(zone.polygon_geojson) ?? bboxToFeature(zone);
    const layer = L.geoJSON(feature).addTo(group);
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));

    // Ensure sizing after dialog animation
    setTimeout(() => map.invalidateSize(), 120);

    // Cleanup on unmount/close
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [open, zone?.zone_id]); // re-run when opening or changing zone

  return <div ref={containerRef} style={{ width: "100%", height: 320, borderRadius: 8, overflow: "hidden" }} />;
}

// ---------- Page ----------
export default function ZoneProfileManagement() {
  const router = useRouter();

  // list state
  const [zones, setZones] = useState<ZoneProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // dialogs / actions
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type:"delete"; itemId:string; itemTitle:string } | null>(null);

  // view dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewZone, setViewZone] = useState<ZoneFull | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // ------ Navigation handler ------
  const handleNavigation = (item: string) => {
    switch (item) {
      case "home":
        router.push('/dashboard')
        break
      case "applications":
        router.push('/applications')
        break
      case "user-account":
        router.push('/useraccount')
        break
      case "user-type":
        router.push('/usertype')
        break
      case "user-profiling":
        router.push('/userprofiling')
        break
      case "forum":
        router.push('/forummanagement')
        break
      case "landing-page":
        router.push('/landingpagemanagement')
        break
      case "rock-management":
        router.push('/rockmanagement')
        break
      case "zone-management":
        // Already on zone management page
        break
      case "faq-page":
        router.push('/faqmanagement')
        break
      case "my-profile":
        router.push('/adminprofile')
        break
      case "logout":
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminEmail')
        localStorage.removeItem('adminToken')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  // ------ fetch zones ------
  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null);

      const authInfo = getAuthInfo();
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || "Authentication failed. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/zones/admin/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authInfo.token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Non-JSON response (${response.status}). First bytes: ${text.slice(0, 120)}`);
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setZones(data.zones);
      } else {
        setError(data.error || "Failed to fetch zones");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching zones");
      console.error("Error fetching zones:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------ view (lazy fetch full record with geometry) ------
  const handleViewZone = async (zone: ZoneProfile) => {
    try {
      setIsLoading(true);
      setShowRaw(false);

      const authInfo = getAuthInfo();
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || "Authentication failed. Please log in again.");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/zones/view/${zone.zone_id}`, {
        headers: { Authorization: `Bearer ${authInfo.token}` },
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Non-JSON response (${res.status}). First bytes: ${t.slice(0, 120)}`);
      }
      const data = await res.json();
      const full: ZoneFull = data.zone || data;
      setViewZone(full);
      setShowViewDialog(true);
    } catch (err: any) {
      setError(err?.message || "Failed to load zone");
    } finally {
      setIsLoading(false);
    }
  };

  // ------ delete ------
  const deleteZone = async (zoneId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const authInfo = getAuthInfo();
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || "Authentication failed. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/zones/admin/delete/${zoneId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authInfo.token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Non-JSON response (${response.status}). First bytes: ${text.slice(0, 120)}`);
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message || "Zone deleted successfully");
        setShowSuccessDialog(true);
        await fetchZones();
      } else {
        setError(data.message || "Failed to delete zone");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while deleting zone");
      console.error("Error deleting zone:", err);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  // ------ suspend/activate ------
  const suspendZone = async (zone: ZoneProfile) => {
    try {
      setIsLoading(true);
      setError(null);

      const authInfo = getAuthInfo();
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || "Auth failed");
        router.push("/login");
        return;
      }

      const path = zone.is_active ? "suspend" : "activate";
      const res = await fetch(`${API_BASE_URL}/api/zones/${zone.zone_id}/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authInfo.token}`,
          "Content-Type": "application/json",
        },
        body: zone.is_active ? JSON.stringify({ reason: "admin action" }) : undefined,
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Non-JSON response (${res.status}). First bytes: ${text.slice(0, 120)}`);
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update status");

      setSuccessMessage(zone.is_active ? "Zone suspended" : "Zone activated");
      setShowSuccessDialog(true);
      await fetchZones();
    } catch (err: any) {
      setError(err?.message || "Error updating zone");
      console.error("Error updating zone:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // effects
  useEffect(() => { fetchZones(); }, []);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // table
  const renderTableRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <span className="text-gray-700">Loading zones...</span>
          </TableCell>
        </TableRow>
      );
    }
    if (zones.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-gray-700">
            No zones found
          </TableCell>
        </TableRow>
      );
    }

    return zones.map((zone) => (
      <TableRow key={zone.zone_id} className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">{zone.zone_name}</TableCell>
        <TableCell className="text-gray-800">{zone.geological_name}</TableCell>
        <TableCell className="text-gray-800">{zone.rock_type}</TableCell>
        <TableCell className="text-gray-800">{zone.key_rock}</TableCell>
        <TableCell className="text-gray-800">{zone.priority ?? 0}</TableCell>
        <TableCell className="text-gray-800">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            zone.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
          }`}>
            {zone.is_active ? "active" : "suspended"}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" className="h-8 px-3 text-gray-900" onClick={() => handleViewZone(zone)}>
              <Eye className="w-4 h-4 mr-1" /> View
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-gray-900" onClick={() => router.push(`/zoneprofile/${zone.zone_id}/edit`)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              className={`${zone.is_active ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"} text-white h-8 px-3`}
              onClick={() => suspendZone(zone)}
            >
              {zone.is_active ? (<><PauseCircle className="w-4 h-4 mr-1" /> Suspend</>) : (<><PlayCircle className="w-4 h-4 mr-1" /> Activate</>)}
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
              onClick={() => { setConfirmAction({ type: "delete", itemId: String(zone.zone_id), itemTitle: zone.zone_name }); setShowConfirmDialog(true); }}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  // error page
  if (error) {
    return (
      <AdminLayout
        activeMenuItem="zone-management"
        title="Hi, Admin 👋"
        subtitle="Manage zone profiles"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-red-700 mb-4 max-w-md mx-auto">{error}</p>
              <Button onClick={() => { setError(null); fetchZones(); }} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      activeMenuItem="zone-management"
      title="Hi, Admin 👋"
      subtitle="Manage zone profiles"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Zone Profile Management</h2>
                <p className="text-gray-700 mt-1">Create, view and manage geological zones</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-gray-600 hover:bg-green-700 text-white" onClick={() => router.push("/zoneprofile/preview_zone")}>
                  <Eye className="w-4 h-4 mr-2" /> Preview Zone
                </Button>
                <Button variant="outline" onClick={fetchZones} disabled={loading} className="flex items-center space-x-2 text-gray-900">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push("/zoneprofile/create")}>
                  <Plus className="w-4 h-4 mr-2" /> Add New Zone
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Database</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Zone Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Geological Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Rock Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Key Rock</TableHead>
                    <TableHead className="font-semibold text-gray-900">Priority</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* View Zone Dialog */}
      <Dialog
        open={showViewDialog}
        onOpenChange={(o) => { setShowViewDialog(o); if (!o) setViewZone(null); }}
      >
        {/* key ensures full remount per zone to avoid any stale state */}
        <DialogContent key={viewZone?.zone_id ?? "view"} className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Zone Details{viewZone ? `: ${viewZone.zone_name}` : ""}
            </DialogTitle>
          </DialogHeader>

          {viewZone ? (
            <div className="space-y-6 py-2">
              {/* Map */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <MiniZoneMap zone={viewZone} open={showViewDialog} />
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div><div className="text-sm font-semibold text-gray-700">Zone Name</div><div>{viewZone.zone_name}</div></div>
                  <div><div className="text-sm font-semibold text-gray-700">Geological Name</div><div>{viewZone.geological_name}</div></div>
                  <div><div className="text-sm font-semibold text-gray-700">Rock Type</div><div>{viewZone.rock_type}</div></div>
                  <div><div className="text-sm font-semibold text-gray-700">Key Rock</div><div>{viewZone.key_rock}</div></div>
                </div>
                <div className="space-y-3">
                  <div><div className="text-sm font-semibold text-gray-700">Zone ID</div><div>{viewZone.zone_id}</div></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Density</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewZone.density === "high" ? "bg-red-100 text-red-800"
                          : viewZone.density === "medium" ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {viewZone.density}
                      </span>
                    </div>
                  </div>
                  <div><div className="text-sm font-semibold text-gray-700">Priority</div><div>{viewZone.priority ?? 0}</div></div>
                  <div><div className="text-sm font-semibold text-gray-700">Status</div><div>{viewZone.is_active ? "active" : "suspended"}</div></div>
                </div>
              </div>

              {/* BBox quick read */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Bounding Box
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium text-gray-700">Latitude:</span> {viewZone.lat_min} → {viewZone.lat_max}</div>
                  <div><span className="font-medium text-gray-700">Longitude:</span> {viewZone.lng_min} → {viewZone.lng_max}</div>
                </div>
              </div>

              {/* Raw GeoJSON toggle */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowRaw((s) => !s)}>
                    {showRaw ? "Hide raw GeoJSON" : "Show raw GeoJSON"}
                  </Button>
                  {viewZone.polygon_geojson && (
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard?.writeText(JSON.stringify(viewZone.polygon_geojson, null, 2))}
                    >
                      Copy GeoJSON
                    </Button>
                  )}
                </div>
                {showRaw && viewZone.polygon_geojson && (
                  <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-56">
{JSON.stringify(viewZone.polygon_geojson, null, 2)}
                  </pre>
                )}
                {!viewZone.polygon_geojson && showRaw && (
                  <div className="text-sm text-gray-600">No polygon saved; this zone uses only a bbox.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-700">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading zone…
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
              Close
            </Button>
            {viewZone && (
              <Button onClick={() => router.push(`/zoneprofile/${viewZone.zone_id}/edit`)} variant="outline">
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Zone</DialogTitle>
            <DialogDescription className="text-gray-700">
              Are you sure you want to delete <strong className="font-semibold">"{confirmAction?.itemTitle}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading} className="text-gray-900">
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { if (confirmAction) { deleteZone(confirmAction.itemId); } }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-gray-900">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Operation Successful</span>
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}