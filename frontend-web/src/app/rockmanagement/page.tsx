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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Trash2,
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
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
  signed_url?: string
  created_at: string
  user_id: number
}

interface FilterOptions {
  types: string[]
  rarities: string[]
  locations: string[]
}

interface SearchFilters {
  rock_name: string
  rock_type: string[]
  rarity: string[]
  location: string[]
  sort_by: string
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
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemTitle: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rock-specific state
  const [rocks, setRocks] = useState<Rock[]>([])
  const [selectedRock, setSelectedRock] = useState<Rock | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [],
    rarities: [],
    locations: []
  })

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    rock_name: '',
    rock_type: [],
    rarity: [],
    location: [],
    sort_by: 'newest'
  })
  const [tempFilters, setTempFilters] = useState<SearchFilters>({
    rock_name: '',
    rock_type: [],
    rarity: [],
    location: [],
    sort_by: 'newest'
  })
  const [isSearchActive, setIsSearchActive] = useState(false)

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const authInfo = getAuthInfo()
      if (!authInfo.isAuthenticated) return

      const response = await fetch(`${API_BASE_URL}/api/rocks/filter-options-v2`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFilterOptions(data.filter_options)
        }
      }
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  // Search rocks
  const searchRocks = async (filters: SearchFilters) => {
    try {
      setSearchLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      // Build query parameters
      const queryParams = new URLSearchParams()
      
      if (filters.rock_name.trim()) {
        queryParams.append('rock_name', filters.rock_name.trim())
      }
      
      filters.rock_type.forEach(type => {
        queryParams.append('rock_type[]', type)
      })
      
      filters.rarity.forEach(rarity => {
        queryParams.append('rarity[]', rarity)
      })
      
      filters.location.forEach(location => {
        queryParams.append('location[]', location)
      })
      
      if (filters.sort_by) {
        queryParams.append('sort_by', filters.sort_by)
      }

      const response = await fetch(`${API_BASE_URL}/api/rocks/search?${queryParams}`, {
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
        // Process rocks to add signed URLs (similar to fetchRocks)
        const processedRocks = await Promise.all(
          data.rocks.map(async (rock: Rock) => {
            if (rock.photo_url && !rock.signed_url) {
              try {
                const urlResponse = await fetch(`${API_BASE_URL}/api/rocks/${rock.rock_id}/image-url`, {
                  headers: { 'Authorization': `Bearer ${authInfo.token}` }
                })
                if (urlResponse.ok) {
                  const urlData = await urlResponse.json()
                  if (urlData.success) {
                    rock.signed_url = urlData.signed_url
                  }
                }
              } catch (err) {
                console.error(`Failed to get signed URL for rock ${rock.rock_id}:`, err)
              }
            }
            return rock
          })
        )
        
        setRocks(processedRocks)
        setIsSearchActive(true)
      } else {
        setError(data.error || 'Failed to search rocks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching rocks')
      console.error('Error searching rocks:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  // Fetch all rocks (original functionality)
  const fetchRocks = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsSearchActive(false)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

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
        setRocks(data.rocks)
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

  // Delete rock (unchanged)
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
        
        // Refresh current view
        if (isSearchActive) {
          await searchRocks(searchFilters)
        } else {
          await fetchRocks()
        }
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

  // Handle search submit
  const handleSearch = () => {
    setSearchFilters({...tempFilters})
    searchRocks(tempFilters)
  }

  // Handle clear search
  const handleClearSearch = () => {
    const resetFilters = {
      rock_name: '',
      rock_type: [],
      rarity: [],
      location: [],
      sort_by: 'newest'
    }
    setSearchFilters(resetFilters)
    setTempFilters(resetFilters)
    setIsSearchActive(false)
    fetchRocks()
  }

  // Handle filter changes
  const handleMultiSelectChange = (filterKey: keyof SearchFilters, value: string) => {
    setTempFilters(prev => {
      const currentArray = prev[filterKey] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return { ...prev, [filterKey]: newArray }
    })
  }

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (tempFilters.rock_name.trim()) count++
    if (tempFilters.rock_type.length > 0) count++
    if (tempFilters.rarity.length > 0) count++
    if (tempFilters.location.length > 0) count++
    return count
  }

  // Load data on component mount
  useEffect(() => {
    fetchRocks()
    fetchFilterOptions()
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
    if (loading || searchLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <span className="text-gray-500">
              {searchLoading ? 'Searching rocks...' : 'Loading rocks...'}
            </span>
          </TableCell>
        </TableRow>
      )
    }

    if (rocks.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
            {isSearchActive ? 'No rocks found matching your search criteria' : 'No rocks found'}
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

  const getSortLabel = (sortValue: string) => {
    switch (sortValue) {
      case 'az': return 'A-Z'
      case 'za': return 'Z-A'
      case 'most_commented': return 'Most Commented'
      case 'rarity': return 'Rarity'
      case 'newest': return 'Newest First'
      default: return 'Newest First'
    }
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
                {isSearchActive && (
                  <p className="text-sm text-blue-600 mt-1">
                    Showing search results ({rocks.length} rocks found)
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {isSearchActive && (
                  <Button
                    variant="outline"
                    onClick={handleClearSearch}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={isSearchActive ? () => searchRocks(searchFilters) : fetchRocks}
                  disabled={loading || searchLoading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${(loading || searchLoading) ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search rocks by name..."
                    value={tempFilters.rock_name}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, rock_name: e.target.value }))}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilterDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
                <Button onClick={handleSearch} disabled={searchLoading} className="bg-blue-600 hover:bg-blue-700">
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {/* Active Filters Display */}
              {(tempFilters.rock_type.length > 0 || tempFilters.rarity.length > 0 || tempFilters.location.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  
                  {tempFilters.rock_type.map(type => (
                    <Badge key={type} variant="outline" className="flex items-center space-x-1">
                      <span>Type: {type}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleMultiSelectChange('rock_type', type)}
                      />
                    </Badge>
                  ))}
                  
                  {tempFilters.rarity.map(rarity => (
                    <Badge key={rarity} variant="outline" className="flex items-center space-x-1">
                      <span>Rarity: {rarity}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleMultiSelectChange('rarity', rarity)}
                      />
                    </Badge>
                  ))}
                  
                  {tempFilters.location.map(location => (
                    <Badge key={location} variant="outline" className="flex items-center space-x-1">
                      <span>Location: {location}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleMultiSelectChange('location', location)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Rock Database
                {rocks.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({rocks.length} {rocks.length === 1 ? 'rock' : 'rocks'})
                  </span>
                )}
              </h3>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select
                  value={tempFilters.sort_by}
                  onValueChange={(value) => setTempFilters(prev => ({ ...prev, sort_by: value }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                    <SelectItem value="most_commented">Most Commented</SelectItem>
                    <SelectItem value="rarity">Rarity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Rocks</DialogTitle>
            <DialogDescription>
              Use filters to narrow down your rock search results
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rock Type Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Rock Type</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {filterOptions.types.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={tempFilters.rock_type.includes(type)}
                      onCheckedChange={() => handleMultiSelectChange('rock_type', type)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Rarity</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.rarities.map(rarity => (
                  <div key={rarity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rarity-${rarity}`}
                      checked={tempFilters.rarity.includes(rarity)}
                      onCheckedChange={() => handleMultiSelectChange('rarity', rarity)}
                    />
                    <label
                      htmlFor={`rarity-${rarity}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {rarity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Common Locations</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filterOptions.locations.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={tempFilters.location.includes(location)}
                      onCheckedChange={() => handleMultiSelectChange('location', location)}
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const resetFilters = {
                  rock_name: tempFilters.rock_name, // Keep search name
                  rock_type: [],
                  rarity: [],
                  location: [],
                  sort_by: tempFilters.sort_by // Keep sort
                }
                setTempFilters(resetFilters)
              }}
            >
              Clear Filters
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowFilterDialog(false)
                handleSearch()
              }} className="bg-blue-600 hover:bg-blue-700">
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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