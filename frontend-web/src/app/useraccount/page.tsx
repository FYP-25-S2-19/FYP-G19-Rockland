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
  UserX,
  Crown,
  RefreshCw,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface UserAccount {
  id: string
  firstName: string
  email: string
  dob: string
  status: "Active" | "Suspended" | "Inactive"
  userType: "Free user" | "Premium" | "Expert"
}

interface PaymentTransaction {
  id: string
  date: string
  description: string
  amount: string
  paymentMethod: string
  status: "Completed" | "Pending" | "Failed"
}

export default function UserAccountPage() {
  const router = useRouter()
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "upgrade"
    userId: string
    userName: string
    currentType?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail" | "payment">("list")
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)

  // Sample user data
  const users: UserAccount[] = [
    {
      id: "#1",
      firstName: "Matt",
      email: "dicker@gmail.com",
      dob: "13/05/2000",
      status: "Active",
      userType: "Free user",
    },
    {
      id: "#2",
      firstName: "Jessica",
      email: "xy@gmail.com",
      dob: "13/05/1980",
      status: "Suspended",
      userType: "Premium",
    },
    {
      id: "#3",
      firstName: "Matt",
      email: "alexander@gmail.com",
      dob: "13/05/1980",
      status: "Active",
      userType: "Expert",
    },
    {
      id: "#4",
      firstName: "Sarah",
      email: "sarah.davis@gmail.com",
      dob: "22/08/1995",
      status: "Active",
      userType: "Free user",
    },
    {
      id: "#5",
      firstName: "Michael",
      email: "michael.wilson@gmail.com",
      dob: "15/03/1988",
      status: "Active",
      userType: "Premium",
    },
  ]

  const samplePayments: PaymentTransaction[] = [
    {
      id: "#1",
      date: "13/05/2025",
      description: "Premium User Subscription",
      amount: "$29.99",
      paymentMethod: "Credit Card ****1234",
      status: "Completed",
    },
    {
      id: "#2",
      date: "13/04/2025",
      description: "Premium User Subscription",
      amount: "$29.99",
      paymentMethod: "Credit Card ****1234",
      status: "Completed",
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
        // Already on user account page
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

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAction = async (action: "suspend" | "upgrade", userId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would update the user data
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200"
      case "Suspended":
        return "bg-red-100 text-red-700 border-red-200"
      case "Inactive":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "Free user":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Premium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Expert":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getNextUserType = (currentType: string) => {
    switch (currentType) {
      case "Free user":
        return "Premium"
      case "Premium":
        return "Expert"
      default:
        return currentType
    }
  }

  // User Detail View
  if (viewMode === "detail" && selectedUser) {
    return (
      <AdminLayout
        activeMenuItem="user-account"
        title="Hi, Admin 👋"
        subtitle="User account details"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          {/* Breadcrumb and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>User Account List</span>
              <span>{">"}</span>
              <span className="text-gray-900 font-medium">View</span>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setViewMode("list")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to User List
              </Button>
              <Button
                onClick={() => setViewMode("payment")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                View Payment History
              </Button>
            </div>
          </div>

          {/* User Details Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input value={selectedUser.firstName} readOnly className="pl-10 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input value="Dickerson" readOnly className="pl-10 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <Input value="12/10/2004" readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <Input value="82622526" readOnly className="bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input value={selectedUser.email} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest</label>
                <Input value="Fossils, Minerals" readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <Input value={selectedUser.userType} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <Input value="Male" readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <Input value="Singapore" readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">{selectedUser.status}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                <Input value="09/04/2025" readOnly className="bg-gray-50" />
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Payment History View
  if (viewMode === "payment" && selectedUser) {
    return (
      <AdminLayout
        activeMenuItem="user-account"
        title="Hi, Admin 👋"
        subtitle="Payment history"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          {/* Breadcrumb and User Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setViewMode("detail")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to User Information
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">Matt Dickerson</span>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Premium</Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Show</span>
                  <Select value="10" onValueChange={() => {}}>
                    <SelectTrigger className="w-16 h-8">
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
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Transaction-ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Payment Method</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samplePayments.map((payment, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{payment.id}</TableCell>
                      <TableCell className="text-gray-600">{payment.date}</TableCell>
                      <TableCell className="text-gray-900">{payment.description}</TableCell>
                      <TableCell className="text-gray-900 font-medium">{payment.amount}</TableCell>
                      <TableCell className="text-gray-600">{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 border-green-200">{payment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">Showing 1 to 2 of 2 entries</div>
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
      </AdminLayout>
    )
  }

  // Main User Account List
  return (
    <AdminLayout
      activeMenuItem="user-account"
      title="Hi, Admin 👋"
      subtitle="Manage user accounts and subscriptions"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Account List</h2>

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
                    placeholder="Search..."
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
                  <TableHead className="font-semibold">User-ID</TableHead>
                  <TableHead className="font-semibold">First Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">DOB</TableHead>
                  <TableHead className="font-semibold text-center">View</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Suspend</TableHead>
                  <TableHead className="font-semibold text-center">User Type</TableHead>
                  <TableHead className="font-semibold text-center">Upgrade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{user.id}</TableCell>
                    <TableCell className="text-gray-900">{user.firstName}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.dob}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-8 px-4"
                        onClick={() => {
                          setSelectedUser(user)
                          setViewMode("detail")
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`border ${getStatusColor(user.status)}`}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 px-4 ${
                          user.status === "Suspended"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        }`}
                        disabled={user.status === "Suspended"}
                        onClick={() => {
                          if (user.status !== "Suspended") {
                            setConfirmAction({
                              type: "suspend",
                              userId: user.id,
                              userName: user.firstName,
                            })
                            setShowConfirmDialog(true)
                          }
                        }}
                      >
                        <UserX className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`border ${getUserTypeColor(user.userType)}`}>{user.userType}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 px-4 ${
                          user.userType === "Expert"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                        }`}
                        disabled={user.userType === "Expert"}
                        onClick={() => {
                          if (user.userType !== "Expert") {
                            setConfirmAction({
                              type: "upgrade",
                              userId: user.id,
                              userName: user.firstName,
                              currentType: user.userType,
                            })
                            setShowConfirmDialog(true)
                          }
                        }}
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Upgrade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 1 to {Math.min(Number.parseInt(entries), filteredUsers.length)} of {filteredUsers.length}{" "}
              entries
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
              {confirmAction?.type === "suspend" ? "Suspend User Account" : "Upgrade User Account"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "suspend" ? (
                <>
                  Are you sure you want to suspend <strong>{confirmAction?.userName}</strong>'s account? They will not be
                  able to access the platform.
                </>
              ) : (
                <>
                  Are you sure you want to upgrade <strong>{confirmAction?.userName}</strong> from{" "}
                  <strong>{confirmAction?.currentType}</strong> to{" "}
                  <strong>{confirmAction?.currentType ? getNextUserType(confirmAction.currentType) : ""}</strong>?
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
                confirmAction?.type === "suspend" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction.type, confirmAction.userId)
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {confirmAction?.type === "suspend" ? "Suspend" : "Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}