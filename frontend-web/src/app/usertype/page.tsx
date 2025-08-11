"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  RefreshCw,
  Shield,
  Crown,
  Star,
  UserPlus,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils" // Import the auth utilities

interface UserType {
  id: string
  name: string
  description: string
  permissions: {
    adminPermission: boolean
    freeUserPermission: boolean
    premiumUserPermission: boolean
    expertUserPermission: boolean
  }
  isActive: boolean
}

// API response type for user types from database
interface ApiUserType {
  user_type_id: number
  name: string
  description: string | null
  has_admin_permission: boolean
  has_freeuser_permission: boolean
  has_premium_permission: boolean
  has_expert_permission: boolean
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function UserTypeManagement() {
  const router = useRouter()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "delete"
    userTypeId: string
    userTypeName: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    description: "",
    has_admin_permission: false,
    has_freeuser_permission: false,
    has_premium_permission: false,
    has_expert_permission: false,
  })

  // State for user types from database
  const [userTypes, setUserTypes] = useState<UserType[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Updated fetchUserTypes function with auth headers
  const fetchUserTypes = async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/usertypes/all`, {
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
        // Transform the data to match your frontend interface
        const transformedData = data.usertypes.map((ut: ApiUserType) => ({
          id: ut.user_type_id.toString(),
          name: ut.name,
          description: ut.description || "",
          permissions: {
            adminPermission: ut.has_admin_permission,
            freeUserPermission: ut.has_freeuser_permission,
            premiumUserPermission: ut.has_premium_permission,
            expertUserPermission: ut.has_expert_permission,
          },
          // Check if description contains [SUSPENDED] to determine if suspended
          isActive: !ut.description?.includes('[SUSPENDED]'),
        }))
        setUserTypes(transformedData)
      } else {
        setError(data.error || 'Failed to fetch user types')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching user types')
      console.error('Error fetching user types:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Updated handleUpdateUserType function with auth headers
  const handleUpdateUserType = async () => {
    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/usertypes/update_usertype`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_type_id: parseInt(editFormData.id),
          name: editFormData.name,
          description: editFormData.description,
          has_admin_permission: editFormData.has_admin_permission,
          has_freeuser_permission: editFormData.has_freeuser_permission,
          has_premium_permission: editFormData.has_premium_permission,
          has_expert_permission: editFormData.has_expert_permission,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Success - close dialog
        setShowEditDialog(false)
        
        // Show success message
        setSuccessMessage(data.message || 'User type updated successfully!')
        setShowSuccessDialog(true)
        
        // Refresh the data
        await fetchUserTypes()
        
        // Update the selected user type if in detail view
        if (selectedUserType && viewMode === "detail") {
          // Refresh the selected user type data
          const updatedUserType = userTypes.find(ut => ut.id === editFormData.id)
          if (updatedUserType) {
            setSelectedUserType(updatedUserType)
          }
        }
        
      } else {
        setError(data.error || data.message || 'Failed to update user type')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating user type')
      console.error('Error updating user type:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Updated handleSuspendUserType function with auth headers
  const handleSuspendUserType = async () => {
    if (!confirmAction) return
    
    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/usertypes/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userTypeId: confirmAction.userTypeId 
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Show success message
        setSuccessMessage(data.message || `User type ${confirmAction.userTypeName} has been suspended successfully`)
        setShowSuccessDialog(true)
        
        // Refresh the data
        await fetchUserTypes()
        
        // If viewing the suspended user type's details, refresh
        if (selectedUserType && selectedUserType.id === confirmAction.userTypeId) {
          const updatedUserType = userTypes.find(ut => ut.id === confirmAction.userTypeId)
          if (updatedUserType) {
            setSelectedUserType(updatedUserType)
          }
        }
      } else {
        setError(data.error || 'Failed to suspend user type')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while suspending user type')
      console.error('Error suspending user type:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchUserTypes()
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
        // Already on user type page
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

  const filteredUserTypes = userTypes

  const handleAction = async (action: "suspend" | "delete", userTypeId: string) => {
    if (action === "suspend") {
      await handleSuspendUserType()
    } else {
      // TODO: Implement delete functionality if needed
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
      await fetchUserTypes()
    }
  }

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />
  }

  const getUserTypeIcon = (name: string) => {
    switch (name) {
      case "Admin":
        return <Shield className="w-4 h-4 text-red-600" />
      case "Expert User":
      case "Expert":
        return <Crown className="w-4 h-4 text-purple-600" />
      case "Premium User":
      case "Premium":
        return <Star className="w-4 h-4 text-yellow-600" />
      case "Free User":
      case "Free":
        return <UserPlus className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getUserTypeBadgeColor = (name: string, isActive: boolean) => {
    if (!isActive) {
      return "bg-red-100 text-red-700 border-red-200"
    }
    
    switch (name) {
      case "Admin":
        return "bg-red-100 text-red-700 border-red-200"
      case "Expert User":
      case "Expert":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Premium User":
      case "Premium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Free User":
      case "Free":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleViewUserType = (userType: UserType) => {
    setSelectedUserType(userType)
    setViewMode("detail")
  }

  const handleEditUserType = (userType: UserType) => {
    setSelectedUserType(userType)
    setEditFormData({
      id: userType.id,
      name: userType.name,
      description: userType.description,
      has_admin_permission: userType.permissions.adminPermission,
      has_freeuser_permission: userType.permissions.freeUserPermission,
      has_premium_permission: userType.permissions.premiumUserPermission,
      has_expert_permission: userType.permissions.expertUserPermission,
    })
    setShowEditDialog(true)
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedUserType(null)
  }

  // Check if user type can be suspended
  const canSuspendUserType = (userType: UserType): boolean => {
    return userType.name !== "Admin" && userType.name !== "Free"
  }

  // Loading state
  if (isLoadingData) {
    return (
      <AdminLayout
        activeMenuItem="user-type"
        title="Hi, Admin 👋"
        subtitle="Manage user types and permissions"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading user types...</span>
        </div>
      </AdminLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <AdminLayout
        activeMenuItem="user-type"
        title="Hi, Admin 👋"
        subtitle="Manage user types and permissions"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 max-w-md">{error}</p>
            <Button onClick={fetchUserTypes} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // User Type Detail View
  if (viewMode === "detail" && selectedUserType) {
    return (
      <AdminLayout
        activeMenuItem="user-type"
        title="Hi, Admin 👋"
        subtitle="User type details and permissions"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Detail Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span>User Type List</span>
                    <span>{">"}</span>
                    <span>View</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">User Type Details</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="text-gray-600 hover:text-gray-800 bg-transparent"
                >
                  Back to Type List
                </Button>
              </div>
            </div>

            {/* Detail Form - Read Only */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User Type</label>
                <Input value={selectedUserType?.name || ""} readOnly className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input value={selectedUserType?.description || ""} readOnly className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedUserType.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    selectedUserType.isActive ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {selectedUserType.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Permission [ Checkbox ]</label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="view-admin"
                      checked={selectedUserType?.permissions.adminPermission || false}
                      disabled
                    />
                    <label htmlFor="view-admin" className="text-sm font-medium leading-none text-gray-600">
                      Admin Permission
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="view-free"
                      checked={selectedUserType?.permissions.freeUserPermission || false}
                      disabled
                    />
                    <label htmlFor="view-free" className="text-sm font-medium leading-none text-gray-600">
                      Free User Permission
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="view-premium"
                      checked={selectedUserType?.permissions.premiumUserPermission || false}
                      disabled
                    />
                    <label htmlFor="view-premium" className="text-sm font-medium leading-none text-gray-600">
                      Premium User Permission
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="view-expert"
                      checked={selectedUserType?.permissions.expertUserPermission || false}
                      disabled
                    />
                    <label htmlFor="view-expert" className="text-sm font-medium leading-none text-gray-600">
                      Expert User Permission
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <p className="text-sm text-gray-500 italic">
                  To update this user type, please go back to the Type List and click the Update button.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Main User Type List View
  return (
    <AdminLayout
      activeMenuItem="user-type"
      title="Hi, Admin 👋"
      subtitle="Manage user types and permissions"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Type</h2>
                <p className="text-gray-600 mt-1">Configure user types and their permission levels</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  onClick={fetchUserTypes}
                  disabled={isLoadingData}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Table - Removed Users column */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">User Type</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-center">Admin Permission</TableHead>
                  <TableHead className="font-semibold text-center">Free User Permission</TableHead>
                  <TableHead className="font-semibold text-center">Premium User Permission</TableHead>
                  <TableHead className="font-semibold text-center">Expert User Permission</TableHead>
                  <TableHead className="font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUserTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No user types found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUserTypes.map((userType) => (
                    <TableRow key={userType.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getUserTypeIcon(userType.name)}
                          <div>
                            <div className="font-medium text-gray-900">{userType.name}</div>
                            <Badge className={`border text-xs ${getUserTypeBadgeColor(userType.name, userType.isActive)}`}>
                              {userType.isActive ? "Active" : "Suspended"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs">
                        <p className="line-clamp-2">{userType.description}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        {getPermissionIcon(userType.permissions.adminPermission)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPermissionIcon(userType.permissions.freeUserPermission)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPermissionIcon(userType.permissions.premiumUserPermission)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPermissionIcon(userType.permissions.expertUserPermission)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                            onClick={() => handleViewUserType(userType)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                            onClick={() => handleEditUserType(userType)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-8 px-3 ${
                              !canSuspendUserType(userType) || !userType.isActive
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            }`}
                            disabled={!canSuspendUserType(userType) || !userType.isActive}
                            onClick={() => {
                              if (canSuspendUserType(userType) && userType.isActive) {
                                setConfirmAction({
                                  type: "suspend",
                                  userTypeId: userType.id,
                                  userTypeName: userType.name,
                                })
                                setShowConfirmDialog(true)
                              }
                            }}
                          >
                            {!canSuspendUserType(userType) ? (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Protected
                              </>
                            ) : !userType.isActive ? (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Suspended
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Suspend
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>
                {confirmAction?.type === "suspend"
                  ? "Suspend User Type"
                  : "Delete User Type"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "suspend" ? (
                <>
                  Are you sure you want to suspend the <strong>{confirmAction.userTypeName}</strong> user type?
                  <br />
                  <span className="text-orange-600 font-medium">All users with this type will be moved to Free user type. This action cannot be undone.</span>
                </>
              ) : (
                <>
                  Are you sure you want to delete the <strong>{confirmAction?.userTypeName}</strong> user type? This
                  action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className={
                confirmAction?.type === "suspend" || confirmAction?.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction.type, confirmAction.userTypeId)
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {confirmAction?.type === "suspend"
                ? "Suspend"
                : "Delete"}
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

      {/* Update User Type Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Update User Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">User Type</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter user type name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Permission given</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-admin" 
                    checked={editFormData.has_admin_permission}
                    onCheckedChange={(checked) => 
                      setEditFormData({ ...editFormData, has_admin_permission: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="edit-admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Admin Permission
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-free" 
                    checked={editFormData.has_freeuser_permission}
                    onCheckedChange={(checked) => 
                      setEditFormData({ ...editFormData, has_freeuser_permission: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="edit-free"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Free User Permission
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-premium" 
                    checked={editFormData.has_premium_permission}
                    onCheckedChange={(checked) => 
                      setEditFormData({ ...editFormData, has_premium_permission: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="edit-premium"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Premium User Permission
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-expert" 
                    checked={editFormData.has_expert_permission}
                    onCheckedChange={(checked) => 
                      setEditFormData({ ...editFormData, has_expert_permission: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="edit-expert"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Expert User Permission
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col space-y-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white w-full"
              onClick={handleUpdateUserType}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}