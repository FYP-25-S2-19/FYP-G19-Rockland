"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Home,
  Users,
  UserCheck,
  UserCog,
  User,
  MessageSquare,
  FileText,
  HelpCircle,
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  UserX,
  Crown,
  Trash2,
  Download,
  Plus,
  RefreshCw,
} from "lucide-react"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  dob: string
  status: "Active" | "Suspended" | "Pending"
  userType: "Free User" | "Premium User" | "Expert"
  joinDate: string
  lastLogin: string
}

type SortField = keyof UserData
type SortDirection = "asc" | "desc"

export default function UserAccountList() {
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("firstName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "delete" | "upgrade"
    userId?: string
    userIds?: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced sample user data
  const users: UserData[] = [
    {
      id: "#1",
      firstName: "Matt",
      lastName: "Johnson",
      email: "matt.johnson@gmail.com",
      dob: "13/05/2000",
      status: "Active",
      userType: "Free User",
      joinDate: "2024-01-15",
      lastLogin: "2024-12-10",
    },
    {
      id: "#2",
      firstName: "Jessica",
      lastName: "Smith",
      email: "jessica.smith@gmail.com",
      dob: "13/05/1980",
      status: "Suspended",
      userType: "Premium User",
      joinDate: "2024-02-20",
      lastLogin: "2024-12-08",
    },
    {
      id: "#3",
      firstName: "Alexander",
      lastName: "Brown",
      email: "alexander.brown@gmail.com",
      dob: "13/05/1980",
      status: "Active",
      userType: "Expert",
      joinDate: "2024-03-10",
      lastLogin: "2024-12-09",
    },
    {
      id: "#4",
      firstName: "Sarah",
      lastName: "Davis",
      email: "sarah.davis@gmail.com",
      dob: "22/08/1995",
      status: "Pending",
      userType: "Free User",
      joinDate: "2024-12-01",
      lastLogin: "Never",
    },
    {
      id: "#5",
      firstName: "Michael",
      lastName: "Wilson",
      email: "michael.wilson@gmail.com",
      dob: "15/03/1988",
      status: "Active",
      userType: "Premium User",
      joinDate: "2024-01-05",
      lastLogin: "2024-12-10",
    },
  ]

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      const matchesUserType = userTypeFilter === "all" || user.userType === userTypeFilter

      return matchesSearch && matchesStatus && matchesUserType
    })

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const direction = sortDirection === "asc" ? 1 : -1

      if (aValue < bValue) return -1 * direction
      if (aValue > bValue) return 1 * direction
      return 0
    })

    return filtered
  }, [users, searchQuery, statusFilter, userTypeFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedUsers.length / Number.parseInt(entries))
  const startIndex = (currentPage - 1) * Number.parseInt(entries)
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + Number.parseInt(entries))

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleAction = async (action: "suspend" | "delete" | "upgrade", userId?: string, userIds?: string[]) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    setSelectedUsers([])
    // Here you would update the user data
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200"
      case "Suspended":
        return "bg-red-100 text-red-700 border-red-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "Free User":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Premium User":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Expert":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-green-600" />
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-green-600 text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-green-500">
          <h1 className="text-xl font-bold tracking-wide">ROCKLAND</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {[
            { icon: Home, label: "Home", active: false },
            { icon: Users, label: "Applications", active: false },
            { icon: UserCheck, label: "User Account", active: true },
            { icon: UserCog, label: "User Type", active: false },
            { icon: User, label: "User Profiling", active: false },
            { icon: MessageSquare, label: "Forum", active: false },
            { icon: FileText, label: "Landing Page", active: false },
            { icon: HelpCircle, label: "FAQ Page", active: false },
            { icon: User, label: "My Profile", active: false },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-6 py-3 text-sm cursor-pointer transition-all duration-200 ${
                item.active ? "bg-green-500 border-r-4 border-white" : "hover:bg-green-500 hover:translate-x-1"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-green-500">
          <div className="flex items-center px-2 py-3 text-sm hover:bg-green-500 cursor-pointer rounded transition-colors duration-200">
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hi, Admin 👋</h1>
              <p className="text-gray-600 mt-1">Manage your user accounts efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">admin@main.com</p>
                </div>
                <Avatar className="ring-2 ring-green-100">
                  <AvatarFallback className="bg-green-100 text-green-600 font-semibold">A</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* User Account List */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Account List</h2>
                  <p className="text-gray-600 mt-1">
                    {filteredAndSortedUsers.length} users found
                    {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" className="hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
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
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">entries</span>
                  </div>

                  {/* Bulk Actions */}
                  {selectedUsers.length > 0 && (
                    <div className="flex items-center space-x-2 animate-in slide-in-from-left duration-200">
                      <Badge variant="secondary" className="px-3 py-1">
                        {selectedUsers.length} selected
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setConfirmAction({ type: "suspend", userIds: selectedUsers })
                          setShowConfirmDialog(true)
                        }}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setConfirmAction({ type: "delete", userIds: selectedUsers })
                          setShowConfirmDialog(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Filters */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Free User">Free User</SelectItem>
                      <SelectItem value="Premium User">Premium User</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search */}
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">User ID</TableHead>
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                        onClick={() => handleSort("firstName")}
                      >
                        <span>Name</span>
                        {getSortIcon("firstName")}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                        onClick={() => handleSort("email")}
                      >
                        <span>Email</span>
                        {getSortIcon("email")}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                        onClick={() => handleSort("dob")}
                      >
                        <span>DOB</span>
                        {getSortIcon("dob")}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <span>Status</span>
                        {getSortIcon("status")}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                        onClick={() => handleSort("userType")}
                      >
                        <span>User Type</span>
                        {getSortIcon("userType")}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">Last Login</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-100 text-green-600 text-xs font-semibold">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell className="text-gray-600">{user.dob}</TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(user.status)}`}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getUserTypeColor(user.userType)}`}>{user.userType}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 px-3">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {user.status === "Active" && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setConfirmAction({ type: "suspend", userId: user.id })
                                    setShowConfirmDialog(true)
                                  }}
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              )}
                              {user.userType !== "Expert" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setConfirmAction({ type: "upgrade", userId: user.id })
                                      setShowConfirmDialog(true)
                                    }}
                                  >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Upgrade User
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setConfirmAction({ type: "delete", userId: user.id })
                                  setShowConfirmDialog(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + Number.parseInt(entries), filteredAndSortedUsers.length)} of{" "}
                {filteredAndSortedUsers.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`w-10 h-8 ${currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "suspend" && "Suspend User(s)"}
              {confirmAction?.type === "delete" && "Delete User(s)"}
              {confirmAction?.type === "upgrade" && "Upgrade User"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "suspend" &&
                `Are you sure you want to suspend ${
                  confirmAction.userIds ? `${confirmAction.userIds.length} users` : "this user"
                }? They will not be able to access their account.`}
              {confirmAction?.type === "delete" &&
                `Are you sure you want to delete ${
                  confirmAction.userIds ? `${confirmAction.userIds.length} users` : "this user"
                }? This action cannot be undone.`}
              {confirmAction?.type === "upgrade" &&
                "Are you sure you want to upgrade this user? They will gain access to premium features."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className={
                confirmAction?.type === "delete" || confirmAction?.type === "suspend"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction.type, confirmAction.userId, confirmAction.userIds)
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {confirmAction?.type === "suspend" && "Suspend"}
              {confirmAction?.type === "delete" && "Delete"}
              {confirmAction?.type === "upgrade" && "Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
