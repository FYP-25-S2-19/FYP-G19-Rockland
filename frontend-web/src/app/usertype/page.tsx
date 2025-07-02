"use client"

import { useState } from "react"
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
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  RefreshCw,
  Shield,
  Crown,
  Star,
  UserPlus,
  User,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

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
  userCount: number
  isActive: boolean
}

export default function UserTypeManagement() {
  const router = useRouter()
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "delete" | "activate"
    userTypeId: string
    userTypeName: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    permissions: "",
  })

  // Sample user type data with 4 permission levels
  const userTypes: UserType[] = [
    {
      id: "1",
      name: "Admin",
      description: "Full system access with all administrative privileges",
      permissions: {
        adminPermission: true,
        freeUserPermission: true,
        premiumUserPermission: true,
        expertUserPermission: true,
      },
      userCount: 3,
      isActive: true,
    },
    {
      id: "2",
      name: "Expert User",
      description: "Advanced user with expert-level features and content access",
      permissions: {
        adminPermission: false,
        freeUserPermission: true,
        premiumUserPermission: true,
        expertUserPermission: true,
      },
      userCount: 45,
      isActive: true,
    },
    {
      id: "3",
      name: "Premium User",
      description: "Enhanced user with premium features and extended access",
      permissions: {
        adminPermission: false,
        freeUserPermission: true,
        premiumUserPermission: true,
        expertUserPermission: false,
      },
      userCount: 234,
      isActive: true,
    },
    {
      id: "4",
      name: "Free User",
      description: "Basic user with limited access to core features",
      permissions: {
        adminPermission: false,
        freeUserPermission: true,
        premiumUserPermission: false,
        expertUserPermission: false,
      },
      userCount: 1567,
      isActive: true,
    },
  ]

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
      case "faq-page":
        router.push('/faqmanagement')
        break
      case "my-profile":
        router.push('/adminprofile')
        break
      case "logout":
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminEmail')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  const filteredUserTypes = userTypes.filter(
    (userType) =>
      userType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userType.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAction = async (action: "suspend" | "delete" | "activate", userTypeId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would update the user type data
  }

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />
  }

  const getUserTypeIcon = (name: string) => {
    switch (name) {
      case "Admin":
        return <Shield className="w-4 h-4 text-red-600" />
      case "Expert User":
        return <Crown className="w-4 h-4 text-purple-600" />
      case "Premium User":
        return <Star className="w-4 h-4 text-yellow-600" />
      case "Free User":
        return <UserPlus className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getUserTypeBadgeColor = (name: string) => {
    switch (name) {
      case "Admin":
        return "bg-red-100 text-red-700 border-red-200"
      case "Expert User":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Premium User":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Free User":
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
      name: userType.name,
      description: userType.description,
      permissions: getPermissionDescription(userType.permissions),
    })
    setShowEditDialog(true)
  }

  const getPermissionDescription = (permissions: UserType["permissions"]) => {
    const activePermissions = []
    if (permissions.adminPermission) activePermissions.push("Admin access")
    if (permissions.freeUserPermission) activePermissions.push("Free user access")
    if (permissions.premiumUserPermission) activePermissions.push("Premium access")
    if (permissions.expertUserPermission) activePermissions.push("Expert access")
    return activePermissions.join(", ") || "No permissions"
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedUserType(null)
  }

  const handleUpdateUserType = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowEditDialog(false)
    // Here you would update the user type data
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

            {/* Detail Form */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User Type</label>
                <Input value={selectedUserType?.name || ""} readOnly className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input value={selectedUserType?.description || ""} readOnly className="bg-gray-50" />
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

              <div className="flex justify-end">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => selectedUserType && handleEditUserType(selectedUserType)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>

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
                    <Checkbox id="edit-admin" checked={selectedUserType?.permissions.adminPermission || false} />
                    <label
                      htmlFor="edit-admin"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Admin Permission
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-free" checked={selectedUserType?.permissions.freeUserPermission || false} />
                    <label
                      htmlFor="edit-free"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Free User Permission
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-premium" checked={selectedUserType?.permissions.premiumUserPermission || false} />
                    <label
                      htmlFor="edit-premium"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Premium User Permission
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-expert" checked={selectedUserType?.permissions.expertUserPermission || false} />
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
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New User Type
              </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Show</span>
                  <Select value={entries} onValueChange={setEntries}>
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500">entries</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search user types..."
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
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
                  <TableHead className="font-semibold text-center">Users</TableHead>
                  <TableHead className="font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUserTypes.map((userType) => (
                  <TableRow key={userType.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getUserTypeIcon(userType.name)}
                        <div>
                          <div className="font-medium text-gray-900">{userType.name}</div>
                          <Badge className={`border text-xs ${getUserTypeBadgeColor(userType.name)}`}>
                            {userType.isActive ? "Active" : "Inactive"}
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
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-medium">
                        {userType.userCount.toLocaleString()}
                      </Badge>
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
                            userType.name === "Admin"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : userType.isActive
                                ? "text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                : "text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                          }`}
                          disabled={userType.name === "Admin"}
                          onClick={() => {
                            if (userType.name !== "Admin") {
                              setConfirmAction({
                                type: userType.isActive ? "suspend" : "activate",
                                userTypeId: userType.id,
                                userTypeName: userType.name,
                              })
                              setShowConfirmDialog(true)
                            }
                          }}
                        >
                          {userType.isActive ? (
                            <>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 1 to {Math.min(Number.parseInt(entries), filteredUserTypes.length)} of{" "}
              {filteredUserTypes.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 w-8 h-8">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "suspend"
                ? "Suspend User Type"
                : confirmAction?.type === "activate"
                  ? "Activate User Type"
                  : "Delete User Type"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "suspend" ? (
                <>
                  Are you sure you want to suspend the <strong>{confirmAction.userTypeName}</strong> user type? Users
                  with this type will lose access to the platform.
                </>
              ) : confirmAction?.type === "activate" ? (
                <>
                  Are you sure you want to activate the <strong>{confirmAction.userTypeName}</strong> user type? Users
                  with this type will regain access to the platform.
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
                : confirmAction?.type === "activate"
                  ? "Activate"
                  : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New User Type Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User Type</DialogTitle>
            <DialogDescription>Create a new user type with specific permissions and access levels.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User Type Name</label>
              <Input placeholder="Enter user type name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Enter description" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Permissions</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="admin" />
                  <label
                    htmlFor="admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Admin Permission
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="free" />
                  <label
                    htmlFor="free"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Free User Permission
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="premium" />
                  <label
                    htmlFor="premium"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Premium User Permission
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="expert" />
                  <label
                    htmlFor="expert"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Expert User Permission
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddDialog(false)}>
              Create User Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}