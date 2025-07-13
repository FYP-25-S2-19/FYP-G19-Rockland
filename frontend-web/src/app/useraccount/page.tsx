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
  Search,
  Eye,
  UserX,
  Crown,
  RefreshCw,
  User,
  Loader2,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils" // Import the auth utilities

interface UserAccount {
  user_id: number
  email: string
  first_name: string
  last_name: string
  date_of_birth: string
  contact_number: string
  gender: string
  region: string
  status: "Active" | "Suspended" | "Inactive"
  total_points: number
  user_type_id: number
  user_type_name: string
  created_date: string
}

interface PaymentTransaction {
  id: string
  date: string
  description: string
  amount: string
  paymentMethod: string
  status: "Completed" | "Pending" | "Failed"
}

interface SearchCriteria {
  search_term: string
}

interface UpgradeOption {
  value: string
  label: string
  description: string
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function UserAccountPage() {
  const router = useRouter()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend"
    userId: string
    userName: string
  } | null>(null)
  const [upgradeAction, setUpgradeAction] = useState<{
    userId: string
    userName: string
    currentType: string
    targetType: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<"list" | "detail" | "payment">("list")
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search related state
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    search_term: ''
  })
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Sample payment data (you'll need to create API endpoint for this)
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

  // Get available upgrade options based on current user type
  const getUpgradeOptions = (currentType: string): UpgradeOption[] => {
    switch (currentType) {
      case "Free":
        return [
          { value: "Premium", label: "Premium", description: "Access to premium features and content" },
          { value: "Expert", label: "Expert", description: "Full access to all features and expert tools" }
        ]
      case "Premium":
        return [
          { value: "Expert", label: "Expert", description: "Full access to all features and expert tools" }
        ]
      default:
        return []
    }
  }

  // Check if user can be upgraded
  const canUpgrade = (userType: string): boolean => {
    return userType === "Free" || userType === "Premium"
  }

  // Updated fetchUsers function with auth headers
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/users/all`, {
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
        setUsers(data.users)
        setHasSearched(false)
      } else {
        setError(data.error || 'Failed to fetch users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Updated searchUsers function with auth headers
  const searchUsers = async () => {
    try {
      setIsSearching(true)
      setError(null)
      
      // Check if search term is provided
      if (!searchCriteria.search_term.trim()) {
        setError('Please enter a search term (first name, email, or date of birth)')
        return
      }

      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/users/search_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_term: searchCriteria.search_term.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setUsers(data.account_list)
        setHasSearched(true)
      } else {
        setError(data.error || 'Failed to search users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching users')
      console.error('Error searching users:', err)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Clear search and show all users
  const clearSearch = () => {
    setSearchCriteria({
      search_term: ''
    })
    setHasSearched(false)
    fetchUsers()
  }

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchCriteria({
      search_term: value
    })
  }

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers()
    }
  }

  // Updated fetchUserDetails function with auth headers
  const fetchUserDetails = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/users/view_user?email=${encodeURIComponent(email)}`, {
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
        // Convert the backend response to match frontend interface
        const userDetails = {
          user_id: data.user.user_id,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          date_of_birth: data.user.date_of_birth,
          contact_number: data.user.contact_number,
          gender: data.user.gender,
          region: data.user.region,
          status: data.user.status,
          total_points: data.user.total_points,
          user_type_id: data.user.user_type_id,
          user_type_name: data.user.user_type_name,
          created_date: data.user.created_date
        }
        
        setSelectedUser(userDetails)
        setViewMode("detail")
      } else {
        setError(data.error || 'Failed to fetch user details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching user details')
      console.error('Error fetching user details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

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
        localStorage.removeItem('adminToken')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  // Updated handleSuspend function with auth headers
  const handleSuspend = async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/users/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: confirmAction.userId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Show success message
        setSuccessMessage(data.message || `User ${confirmAction.userName} has been suspended successfully`)
        setShowSuccessDialog(true)
        
        // Refresh the appropriate list
        if (hasSearched) {
          await searchUsers()
        } else {
          await fetchUsers()
        }
        
        // If viewing the suspended user's details, refresh
        if (selectedUser && selectedUser.user_id.toString() === confirmAction.userId) {
          await fetchUserDetails(selectedUser.email)
        }
      } else {
        setError(data.error || 'Failed to suspend user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while suspending user')
      console.error('Error suspending user:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Updated handleUpgrade function with auth headers  
  const handleUpgrade = async () => {
    if (!upgradeAction) return
    
    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/users/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: upgradeAction.userId,
          targetUserType: upgradeAction.targetType
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Show success message
        setSuccessMessage(data.message || `User ${upgradeAction.userName} has been upgraded to ${upgradeAction.targetType} successfully`)
        setShowSuccessDialog(true)
        
        // Refresh the appropriate list (search results or all users)
        if (hasSearched) {
          await searchUsers()
        } else {
          await fetchUsers()
        }
        
        // If we have a selected user and it's the same user, refresh their details too
        if (selectedUser && selectedUser.user_id.toString() === upgradeAction.userId) {
          await fetchUserDetails(selectedUser.email)
        }
      } else {
        setError(data.error || 'Failed to upgrade user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while upgrading user')
      console.error('Error upgrading user:', err)
    } finally {
      setIsLoading(false)
      setShowUpgradeDialog(false)
      setUpgradeAction(null)
    }
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
      case "Free":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Premium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Expert":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  // Clear error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000) // Clear error after 10 seconds
      return () => clearTimeout(timer)
    }
  }, [error])

  // Loading state
  if (loading) {
    return (
      <AdminLayout
        activeMenuItem="user-account"
        title="Hi, Admin 👋"
        subtitle="Manage user accounts and subscriptions"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      </AdminLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <AdminLayout
        activeMenuItem="user-account"
        title="Hi, Admin 👋"
        subtitle="Manage user accounts and subscriptions"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 max-w-md">{error}</p>
            <Button onClick={fetchUsers} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
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
                  <Input value={selectedUser.first_name || 'N/A'} readOnly className="pl-10 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input value={selectedUser.last_name || 'N/A'} readOnly className="pl-10 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <Input value={formatDate(selectedUser.date_of_birth)} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <Input value={selectedUser.contact_number || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input value={selectedUser.email || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Points</label>
                <Input value={selectedUser.total_points?.toString() || '0'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <Input value={selectedUser.user_type_name || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <Input value={selectedUser.gender || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <Input value={selectedUser.region || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedUser.status === 'Active' ? 'bg-green-500' : 
                    selectedUser.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className={`font-medium ${
                    selectedUser.status === 'Active' ? 'text-green-700' : 
                    selectedUser.status === 'Suspended' ? 'text-red-700' : 'text-gray-700'
                  }`}>{selectedUser.status}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                <Input value={formatDate(selectedUser.created_date)} readOnly className="bg-gray-50" />
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
                <span className="text-lg font-semibold text-gray-900">
                  {selectedUser.first_name} {selectedUser.last_name}
                </span>
                <Badge className={`border ${getUserTypeColor(selectedUser.user_type_name)}`}>
                  {selectedUser.user_type_name}
                </Badge>
                <Badge className={`border ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
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

            {/* Summary */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">Showing {samplePayments.length} payment transactions</div>
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

            {/* Search Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Users</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by first name, email, or date of birth (e.g., John, john@example.com, 1990-01-15, 15/01/1990)..."
                      value={searchCriteria.search_term}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <Button
                  onClick={searchUsers}
                  disabled={isSearching}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                {hasSearched && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
              {hasSearched && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Found {users.length} user(s)</strong> matching: "{searchCriteria.search_term}"
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Search works with: first name, email address, or date of birth (formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={hasSearched ? searchUsers : fetchUsers}
                  className="flex items-center space-x-2"
                  disabled={loading || isSearching}
                >
                  <RefreshCw className={`h-4 w-4 ${(loading || isSearching) ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
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
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {hasSearched ? 'No users found matching your search criteria' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">#{user.user_id}</TableCell>
                      <TableCell className="text-gray-900">{user.first_name}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(user.date_of_birth)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white h-8 px-4"
                          onClick={() => fetchUserDetails(user.email)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </>
                          )}
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
                          disabled={user.status === "Suspended" || isLoading}
                          onClick={() => {
                            if (user.status !== "Suspended") {
                              setConfirmAction({
                                type: "suspend",
                                userId: user.user_id.toString(),
                                userName: user.first_name,
                              })
                              setShowConfirmDialog(true)
                            }
                          }}
                        >
                          <UserX className="w-3 h-3 mr-1" />
                          {user.status === "Suspended" ? "Suspended" : "Suspend"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`border ${getUserTypeColor(user.user_type_name)}`}>
                          {user.user_type_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {canUpgrade(user.user_type_name) ? (
                          <div className="relative">
                            {isLoading ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 bg-gray-100 text-gray-400 cursor-not-allowed"
                                disabled
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                <span className="text-xs">Upgrade</span>
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            ) : (
                              <Select
                                onValueChange={(targetType) => {
                                  setUpgradeAction({
                                    userId: user.user_id.toString(),
                                    userName: user.first_name,
                                    currentType: user.user_type_name,
                                    targetType: targetType,
                                  })
                                  setShowUpgradeDialog(true)
                                }}
                              >
                                <SelectTrigger className="h-8 px-3 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200">
                                  <Crown className="w-3 h-3 mr-1" />
                                  <span className="text-xs">Upgrade</span>
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getUpgradeOptions(user.user_type_name).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{option.label}</span>
                                        <span className="text-xs text-gray-500">{option.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-4 bg-gray-100 text-gray-400 cursor-not-allowed"
                            disabled
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Max Level
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
              {hasSearched && " (filtered)"}
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Suspend User Account</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{confirmAction?.userName}</strong>'s account? 
              <br />
              <span className="text-red-600 font-medium">They will not be able to access the platform or sign in.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSuspend}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-500" />
              <span>Upgrade User Account</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade <strong>{upgradeAction?.userName}</strong> from{" "}
              <strong>{upgradeAction?.currentType}</strong> to{" "}
              <strong>{upgradeAction?.targetType}</strong>?
              {upgradeAction?.targetType === 'Expert' && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Expert</strong> is the highest user level and cannot be upgraded further.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Upgrade to {upgradeAction?.targetType}
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