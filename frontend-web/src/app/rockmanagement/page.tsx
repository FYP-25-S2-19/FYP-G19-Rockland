"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface Rock {
  rock_id: number
  rock_name: string
  rock_type: string
  description: string
  hardness?: string
  color?: string
  composition?: string
  rarity?: string
  density?: string
  common_location?: string
  fun_fact?: string
  photo_url?: string
  signed_url?: string     // Backend provides this
  created_at: string
  user_id: number
}

interface RockFormData {
  rock_name: string
  rock_type: string
  description: string
  hardness: string
  color: string
  composition: string
  rarity: string
  density: string
  common_location: string
  fun_fact: string
  photo_url: string
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

export default function RockManagementPage() {
  const router = useRouter()
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

  // Rock-specific state
  const [rocks, setRocks] = useState<Rock[]>([])
  const [selectedRock, setSelectedRock] = useState<Rock | null>(null)

  // Fetch rocks from API - Updated to use new endpoint
  const fetchRocks = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      // Change this line to use the new endpoint with image processing
      const response = await fetch(`${API_BASE_URL}/api/rocks/admin/all-with-images`, {
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
        setRocks(data.rocks) // Now includes signed_url from backend
      } else {
        setError(data.error || 'Failed to fetch rocks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching rocks')
      console.error('Error fetching rocks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete rock
  const deleteRock = async (rockId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/rocks/admin/delete/${rockId}`, {
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
        setSuccessMessage(data.message || 'Rock deleted successfully')
        setShowSuccessDialog(true)
        
        // Refresh rocks list
        await fetchRocks()
      } else {
        setError(data.message || 'Failed to delete rock')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting rock')
      console.error('Error deleting rock:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchRocks()
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
        router.push('/landingpagemanagement')
        break
      case "rock-management":
        // Already on rock page management
        break
      case "zone-management":
        router.push('/zoneprofile')
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const handleViewRock = (rock: Rock) => {
    setSelectedRock(rock)
    setShowViewDialog(true)
  }

  const renderTableRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <span className="text-gray-500">Loading rocks...</span>
          </TableCell>
        </TableRow>
      )
    }

    if (rocks.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
            No rocks found
          </TableCell>
        </TableRow>
      )
    }

    return rocks.map((rock) => (
      <TableRow key={rock.rock_id} className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">{rock.rock_name}</TableCell>
        <TableCell className="text-gray-600">{rock.rock_type}</TableCell>
        <TableCell className="text-gray-600 max-w-xs truncate">{rock.description}</TableCell>
        <TableCell className="text-gray-600">{formatDate(rock.created_at)}</TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={() => handleViewRock(rock)}
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
                  itemId: rock.rock_id.toString(),
                  itemTitle: rock.rock_name,
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
        activeMenuItem="rock-management"
        title="Hi, Admin 👋"
        subtitle="Manage rock database"
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
                  fetchRocks()
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
      activeMenuItem="rock-management"
      title="Hi, Admin 👋"
      subtitle="Manage rock database"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rock Management</h2>
                <p className="text-gray-600 mt-1">View and manage rock database entries</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchRocks}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rock Database</h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Rock Name</TableHead>
                    <TableHead className="font-semibold">Rock Type</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Date Created</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* View Rock Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Rock Details: {selectedRock?.rock_name}
            </DialogTitle>
          </DialogHeader>

          {selectedRock && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Rock Name</label>
                    <p className="text-gray-900 mt-1">{selectedRock.rock_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Rock Type</label>
                    <p className="text-gray-900 mt-1">{selectedRock.rock_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Hardness</label>
                    <p className="text-gray-900 mt-1">{selectedRock.hardness || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Color</label>
                    <p className="text-gray-900 mt-1">{selectedRock.color || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Rarity</label>
                    <p className="text-gray-900 mt-1">{selectedRock.rarity || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Density</label>
                    <p className="text-gray-900 mt-1">{selectedRock.density || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Common Location</label>
                    <p className="text-gray-900 mt-1">{selectedRock.common_location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Date Created</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedRock.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Created by User ID</label>
                    <p className="text-gray-900 mt-1">{selectedRock.user_id}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedRock.description}
                </p>
              </div>

              {/* Composition */}
              {selectedRock.composition && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Composition</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedRock.composition}
                  </p>
                </div>
              )}

              {/* Fun Fact */}
              {selectedRock.fun_fact && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Fun Fact</label>
                  <p className="text-gray-900 mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {selectedRock.fun_fact}
                  </p>
                </div>
              )}

              {/* Photo section - simplified since backend handles URLs */}
              {selectedRock?.signed_url ? (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Photo</label>
                  <div className="mt-2">
                    <img 
                      src={selectedRock.signed_url}
                      alt={selectedRock.rock_name}
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error('Rock image failed to load:', selectedRock.signed_url)
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('✅ Rock image loaded successfully')
                      }}
                    />
                  </div>
                </div>
              ) : selectedRock?.photo_url ? (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Photo</label>
                  <div className="mt-2 p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <div className="text-yellow-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.812c.932 0 1.684-.846 1.562-1.766L18.626 5.056c-.103-.812-.847-1.434-1.671-1.434H7.045c-.824 0-1.568.622-1.671 1.434L3.554 17.234C3.432 18.154 4.184 19 5.116 19z" />
                      </svg>
                      <p className="text-sm">Image processing failed</p>
                      <p className="text-xs mt-1">Photo exists but couldn't generate secure URL</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Photo</label>
                  <div className="mt-2 p-8 bg-gray-100 rounded-lg text-center">
                    <div className="text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No image available</p>
                    </div>
                  </div>
                </div>
              )}

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
            <DialogTitle>Delete Rock</DialogTitle>
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
                  deleteRock(confirmAction.itemId)
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