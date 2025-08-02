"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Tag,
  Heart,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils" // Import the auth utilities

interface Interest {
  interest_id: number
  title: string
  description: string
  categories_id: number
  category_title: string
}

interface Category {
  categories_id: number
  title: string
  description: string
  interest_count: number
}

export default function UserProfilingManagement() {
  const router = useRouter()
  
  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  const [profilingType, setProfilingType] = useState<"Interest" | "Categories">("Interest")
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemName: string
    itemType: "interest" | "category"
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Backend data states
  const [categories, setCategories] = useState<Category[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states for add dialog
  const [newItemName, setNewItemName] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")

  // Updated fetchCategories function with auth headers
  const fetchCategories = async () => {
    try {
      setIsLoadingData(true)
      setError(null)

      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/api/categories/all`, {
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
        setCategories(data.categories)
      } else {
        throw new Error(data.error || 'Failed to fetch categories')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching categories')
      console.error('Error fetching categories:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Updated fetchInterests function with auth headers
  const fetchInterests = async () => {
    try {
      setIsLoadingData(true)
      setError(null)

      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/api/interests/all`, {
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
        setInterests(data.interests)
      } else {
        throw new Error(data.error || 'Failed to fetch interests')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching interests')
      console.error('Error fetching interests:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Fetch categories for dropdown with auth headers
  const fetchCategoriesForDropdown = async () => {
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        return // Don't set error here as this is a background operation
      }

      const response = await fetch(`${API_BASE_URL}/api/categories/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      }
    } catch (error) {
      console.error('Error fetching categories for dropdown:', error)
    }
  }

  // Fetch data when component mounts or profiling type changes
  useEffect(() => {
    if (profilingType === "Categories") {
      fetchCategories()
    } else if (profilingType === "Interest") {
      fetchInterests()
    }
  }, [profilingType])

  // Also fetch categories when component mounts for the dropdown in add dialog
  useEffect(() => {
    fetchCategoriesForDropdown()
  }, [])

  // Clear error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000) // Clear error after 10 seconds
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
        // Already on user profiling page
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

  const filteredInterests = interests.filter(
    (interest) =>
      interest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.category_title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Updated handleDelete function with auth headers
  const handleDelete = async (itemId: string, itemType: "interest" | "category") => {
    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      if (itemType === "category") {
        // Delete category
        const response = await fetch(`${API_BASE_URL}/api/categories/delete_category`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authInfo.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: parseInt(itemId)
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Success - refresh categories and close dialog
          setSuccessMessage(data.message || 'Category deleted successfully!')
          setShowSuccessDialog(true)
          await fetchCategories()
          setShowConfirmDialog(false)
          setConfirmAction(null)
        } else {
          setError(data.error || 'Failed to delete category')
        }
      } else {
        // Delete interest
        const response = await fetch(`${API_BASE_URL}/api/interests/delete_interest`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authInfo.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: parseInt(itemId)
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Success - refresh interests and close dialog
          setSuccessMessage(data.message || 'Interest deleted successfully!')
          setShowSuccessDialog(true)
          await fetchInterests()
          setShowConfirmDialog(false)
          setConfirmAction(null)
        } else {
          setError(data.error || data.message || 'Failed to delete interest')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the item')
      console.error('Error deleting item:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Updated handleAdd function with auth headers
  const handleAdd = async () => {
    if (!newItemName.trim() || !newItemDescription.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (profilingType === "Interest" && !newItemCategory) {
      setError('Please select a category for the interest')
      return
    }

    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      if (profilingType === "Categories") {
        // Create category
        const response = await fetch(`${API_BASE_URL}/api/categories/create_category`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authInfo.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newItemName.trim(),
            description: newItemDescription.trim()
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Success - refresh categories and close dialog
          setSuccessMessage(data.message || 'Category created successfully!')
          setShowSuccessDialog(true)
          await fetchCategories()
          setShowAddDialog(false)
          // Reset form
          setNewItemName("")
          setNewItemDescription("")
          setNewItemCategory("")
        } else {
          setError(data.error || data.message || 'Failed to create category')
        }
      } else {
        // Create interest
        const response = await fetch(`${API_BASE_URL}/api/interests/create_interest`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authInfo.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newItemName.trim(),
            description: newItemDescription.trim(),
            categories_id: parseInt(newItemCategory)
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Success - refresh interests and close dialog
          setSuccessMessage(data.message || 'Interest created successfully!')
          setShowSuccessDialog(true)
          await fetchInterests()
          setShowAddDialog(false)
          // Reset form
          setNewItemName("")
          setNewItemDescription("")
          setNewItemCategory("")
        } else {
          setError(data.error || data.message || 'Failed to create interest')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the item')
      console.error('Error creating item:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    if (profilingType === "Categories") {
      fetchCategories()
    } else if (profilingType === "Interest") {
      fetchInterests()
    }
  }

  const handleOpenAddDialog = () => {
    setNewItemName("")
    setNewItemDescription("")
    setNewItemCategory("")
    setShowAddDialog(true)
  }

  // Loading state
  if (isLoadingData) {
    return (
      <AdminLayout
        activeMenuItem="user-profiling"
        title="Hi, Admin 👋"
        subtitle="Manage user interests and categories"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading {profilingType.toLowerCase()}...</span>
        </div>
      </AdminLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <AdminLayout
        activeMenuItem="user-profiling"
        title="Hi, Admin 👋"
        subtitle="Manage user interests and categories"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 max-w-md">{error}</p>
            <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      activeMenuItem="user-profiling"
      title="Hi, Admin 👋"
      subtitle="Manage user interests and categories"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Profiling</h2>
                <p className="text-gray-600 mt-1">Configure user interests and categories for personalization</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoadingData}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleOpenAddDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New {profilingType === "Interest" ? "Interest" : "Category"}
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Select Profiling</span>
                  <Select
                    value={profilingType}
                    onValueChange={(value) => setProfilingType(value as "Interest" | "Categories")}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interest">Interest</SelectItem>
                      <SelectItem value="Categories">Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${profilingType.toLowerCase()}...`}
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {profilingType === "Interest" ? "Interest List" : "Categories List"}
            </h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    {profilingType === "Interest" ? (
                      <>
                        <TableHead className="font-semibold">Interest</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold text-center">Action</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-semibold">Categories</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold text-center">Action</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profilingType === "Interest"
                    ? filteredInterests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No interests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInterests.map((interest) => (
                          <TableRow key={interest.interest_id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="font-medium text-gray-900">{interest.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 max-w-md">
                              <p className="line-clamp-2">{interest.description}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium">
                                {interest.category_title}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                onClick={() => {
                                  setConfirmAction({
                                    type: "delete",
                                    itemId: interest.interest_id.toString(),
                                    itemName: interest.title,
                                    itemType: "interest",
                                  })
                                  setShowConfirmDialog(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    : filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            No categories found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map((category) => (
                          <TableRow key={category.categories_id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Tag className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-900">{category.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 max-w-md">
                              <p className="line-clamp-2">{category.description}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                onClick={() => {
                                  setConfirmAction({
                                    type: "delete",
                                    itemId: category.categories_id.toString(),
                                    itemName: category.title,
                                    itemType: "category",
                                  })
                                  setShowConfirmDialog(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                </TableBody>
              </Table>
            </div>

            {/* No data state */}
            {((profilingType === "Categories" && filteredCategories.length === 0) || 
              (profilingType === "Interest" && filteredInterests.length === 0)) && !isLoadingData && (
              <div className="text-center py-8">
                {profilingType === "Interest" ? (
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                ) : (
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                )}
                <p className="text-gray-500">No {profilingType.toLowerCase()} found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or add a new {profilingType.toLowerCase()}</p>
              </div>
            )}

            {/* Summary */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {profilingType === "Interest" ? filteredInterests.length : filteredCategories.length} of{" "}
                {profilingType === "Interest" ? interests.length : categories.length} {profilingType.toLowerCase()}
                {searchQuery && " (filtered)"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New {profilingType === "Interest" ? "Interest" : "Category"}</DialogTitle>
            <DialogDescription>
              Create a new {profilingType.toLowerCase()} for user profiling and personalization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {profilingType === "Interest" ? "Interest" : "Category"} Name
              </label>
              <Input 
                placeholder={`Enter ${profilingType.toLowerCase()} name`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Enter detailed description" 
                rows={3}
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
            </div>
            {profilingType === "Interest" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.categories_id} value={category.categories_id.toString()}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAdd} disabled={isLoading}>
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Create {profilingType === "Interest" ? "Interest" : "Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Delete {confirmAction?.itemType === "interest" ? "Interest" : "Category"}</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{confirmAction?.itemName}</strong>? This action cannot be undone.
              {confirmAction?.itemType === "category" && " All interests in this category will also be affected."}
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
                  handleDelete(confirmAction.itemId, confirmAction.itemType)
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