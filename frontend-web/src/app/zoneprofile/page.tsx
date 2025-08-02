"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Trash2,
  MapPin,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface ZoneProfile {
  zone_id: number
  zone_name: string
  geological_name: string
  rock_type: string
  key_rock: string
  lat_min: number
  lat_max: number
  lng_min: number
  lng_max: number
  density: string
  spawn_cooldown_minutes: number
  max_spawn_count: number
}

interface ZoneFormData {
  zone_name: string
  geological_name: string
  rock_type: string
  key_rock: string
  lat_min: string
  lat_max: string
  lng_min: string
  lng_max: string
  density: string
  spawn_cooldown_minutes: string
  max_spawn_count: string
}

// API configuration
const getAuthInfo = () => {
  try {
    const token = localStorage.getItem('adminToken')
    const email = localStorage.getItem('adminEmail')
    
    if (!token || !email) {
      return { isAuthenticated: false, error: 'No authentication token found' }
    }
    
    return { isAuthenticated: true, token, email }
  } catch (error) {
    return { isAuthenticated: false, error: 'Authentication error' }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ZoneProfileManagement() {
  const router = useRouter()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemTitle: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Zone-specific state
  const [zones, setZones] = useState<ZoneProfile[]>([])
  const [selectedZone, setSelectedZone] = useState<ZoneProfile | null>(null)
  const [zoneFormData, setZoneFormData] = useState<ZoneFormData>({
    zone_name: '',
    geological_name: '',
    rock_type: '',
    key_rock: '',
    lat_min: '',
    lat_max: '',
    lng_min: '',
    lng_max: '',
    density: 'medium',
    spawn_cooldown_minutes: '15',
    max_spawn_count: '15'
  })

  // Fetch zones from API
  const fetchZones = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/zones/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setZones(data.zones)
      } else {
        setError(data.error || 'Failed to fetch zones')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching zones')
      console.error('Error fetching zones:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create zone
  const createZone = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validation
      if (!zoneFormData.zone_name.trim()) {
        setError('Zone name is required')
        return
      }

      if (!zoneFormData.geological_name.trim()) {
        setError('Geological name is required')
        return
      }

      if (!zoneFormData.rock_type.trim()) {
        setError('Rock type is required')
        return
      }

      if (!zoneFormData.key_rock.trim()) {
        setError('Key rock is required')
        return
      }

      // Validate coordinates
      const latMin = parseFloat(zoneFormData.lat_min)
      const latMax = parseFloat(zoneFormData.lat_max)
      const lngMin = parseFloat(zoneFormData.lng_min)
      const lngMax = parseFloat(zoneFormData.lng_max)

      if (isNaN(latMin) || isNaN(latMax) || isNaN(lngMin) || isNaN(lngMax)) {
        setError('All coordinates must be valid numbers')
        return
      }

      if (latMin >= latMax || lngMin >= lngMax) {
        setError('Min coordinates must be less than max coordinates')
        return
      }

      const spawnCooldown = parseInt(zoneFormData.spawn_cooldown_minutes)
      const maxSpawn = parseInt(zoneFormData.max_spawn_count)

      if (isNaN(spawnCooldown) || spawnCooldown < 1) {
        setError('Spawn cooldown must be a positive number')
        return
      }

      if (isNaN(maxSpawn) || maxSpawn < 1) {
        setError('Max spawn count must be a positive number')
        return
      }

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/zones/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone_name: zoneFormData.zone_name.trim(),
          geological_name: zoneFormData.geological_name.trim(),
          rock_type: zoneFormData.rock_type.trim(),
          key_rock: zoneFormData.key_rock.trim(),
          lat_min: latMin,
          lat_max: latMax,
          lng_min: lngMin,
          lng_max: lngMax,
          density: zoneFormData.density,
          spawn_cooldown_minutes: spawnCooldown,
          max_spawn_count: maxSpawn
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Zone created successfully')
        setShowSuccessDialog(true)
        
        // Reset form
        setZoneFormData({
          zone_name: '',
          geological_name: '',
          rock_type: '',
          key_rock: '',
          lat_min: '',
          lat_max: '',
          lng_min: '',
          lng_max: '',
          density: 'medium',
          spawn_cooldown_minutes: '15',
          max_spawn_count: '15'
        })
        
        // Refresh zones list
        await fetchZones()
      } else {
        setError(data.message || 'Failed to create zone')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating zone')
      console.error('Error creating zone:', err)
    } finally {
      setIsLoading(false)
      setShowAddDialog(false)
    }
  }

  // Delete zone
  const deleteZone = async (zoneId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/zones/admin/delete/${zoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Zone deleted successfully')
        setShowSuccessDialog(true)
        
        // Refresh zones list
        await fetchZones()
      } else {
        setError(data.message || 'Failed to delete zone')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting zone')
      console.error('Error deleting zone:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchZones()
  }, [])

  // Clear error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

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
        router.push('/landingpage')
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

  const handleViewZone = (zone: ZoneProfile) => {
    setSelectedZone(zone)
    setShowViewDialog(true)
  }

  const renderTableRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <span className="text-gray-500">Loading zones...</span>
          </TableCell>
        </TableRow>
      )
    }

    if (zones.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
            No zones found
          </TableCell>
        </TableRow>
      )
    }

    return zones.map((zone) => (
      <TableRow key={zone.zone_id} className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">{zone.zone_name}</TableCell>
        <TableCell className="text-gray-600">{zone.geological_name}</TableCell>
        <TableCell className="text-gray-600">{zone.rock_type}</TableCell>
        <TableCell className="text-gray-600">{zone.key_rock}</TableCell>
        <TableCell className="text-gray-600">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            zone.density === 'high' ? 'bg-red-100 text-red-800' :
            zone.density === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {zone.density}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={() => handleViewZone(zone)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
              onClick={() => {
                setConfirmAction({
                  type: "delete",
                  itemId: zone.zone_id.toString(),
                  itemTitle: zone.zone_name,
                })
                setShowConfirmDialog(true)
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  // Show error dialog if there's an error
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
              <p className="text-red-600 mb-4 max-w-md mx-auto">{error}</p>
              <Button 
                onClick={() => {
                  setError(null)
                  fetchZones()
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
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
                <p className="text-gray-600 mt-1">Create, view and manage geological zones</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={fetchZones}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Zone
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Database</h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Zone Name</TableHead>
                    <TableHead className="font-semibold">Geological Name</TableHead>
                    <TableHead className="font-semibold">Rock Type</TableHead>
                    <TableHead className="font-semibold">Key Rock</TableHead>
                    <TableHead className="font-semibold">Density</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Zone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Zone Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zone Name *</label>
                <Input 
                  placeholder="Central Mining District" 
                  value={zoneFormData.zone_name}
                  onChange={(e) => setZoneFormData(prev => ({ ...prev, zone_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Geological Name *</label>
                <Input 
                  placeholder="Appalachian Mountain Formation" 
                  value={zoneFormData.geological_name}
                  onChange={(e) => setZoneFormData(prev => ({ ...prev, geological_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rock Type *</label>
                <Input 
                  placeholder="Sedimentary" 
                  value={zoneFormData.rock_type}
                  onChange={(e) => setZoneFormData(prev => ({ ...prev, rock_type: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Rock *</label>
                <Input 
                  placeholder="Limestone" 
                  value={zoneFormData.key_rock}
                  onChange={(e) => setZoneFormData(prev => ({ ...prev, key_rock: e.target.value }))}
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Zone Boundaries
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lat Min *</label>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="1.2345" 
                    value={zoneFormData.lat_min}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, lat_min: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lat Max *</label>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="1.5678" 
                    value={zoneFormData.lat_max}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, lat_max: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lng Min *</label>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="103.1234" 
                    value={zoneFormData.lng_min}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, lng_min: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lng Max *</label>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="103.5678" 
                    value={zoneFormData.lng_max}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, lng_max: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Zone Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Zone Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Density</label>
                  <Select value={zoneFormData.density} onValueChange={(value) => setZoneFormData(prev => ({ ...prev, density: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Spawn Cooldown (minutes)</label>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="15" 
                    value={zoneFormData.spawn_cooldown_minutes}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, spawn_cooldown_minutes: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Spawn Count</label>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="15" 
                    value={zoneFormData.max_spawn_count}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, max_spawn_count: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col space-y-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white w-full"
              onClick={createZone}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Create Zone Profile
            </Button>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isLoading} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Zone Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Zone Details: {selectedZone?.zone_name}
            </DialogTitle>
          </DialogHeader>

          {selectedZone && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Zone Name</label>
                    <p className="text-gray-900 mt-1">{selectedZone.zone_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Geological Name</label>
                    <p className="text-gray-900 mt-1">{selectedZone.geological_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Rock Type</label>
                    <p className="text-gray-900 mt-1">{selectedZone.rock_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Key Rock</label>
                    <p className="text-gray-900 mt-1">{selectedZone.key_rock}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Zone ID</label>
                    <p className="text-gray-900 mt-1">{selectedZone.zone_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Density</label>
                    <p className="text-gray-900 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedZone.density === 'high' ? 'bg-red-100 text-red-800' :
                        selectedZone.density === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedZone.density}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Spawn Cooldown</label>
                    <p className="text-gray-900 mt-1">{selectedZone.spawn_cooldown_minutes} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Max Spawn Count</label>
                    <p className="text-gray-900 mt-1">{selectedZone.max_spawn_count}</p>
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Zone Boundaries
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Latitude Range:</span>
                    <p className="text-gray-900">{selectedZone.lat_min} to {selectedZone.lat_max}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Longitude Range:</span>
                    <p className="text-gray-900">{selectedZone.lng_min} to {selectedZone.lng_max}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)} className="bg-gray-600 hover:bg-gray-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Zone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{confirmAction?.itemTitle}"</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (confirmAction) {
                  deleteZone(confirmAction.itemId)
                }
              }}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Operation Successful</span>
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}