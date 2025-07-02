"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface Interest {
  id: string
  name: string
  description: string
  category: string
}

interface Category {
  id: string
  name: string
  description: string
  interestCount: number
}

export default function UserProfilingManagement() {
  const router = useRouter()
  const [profilingType, setProfilingType] = useState<"Interest" | "Categories">("Interest")
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemName: string
    itemType: "interest" | "category"
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states for add dialog
  const [newItemName, setNewItemName] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")

  // Sample interests data
  const interests: Interest[] = [
    {
      id: "1",
      name: "Dinosaur Fossils",
      description: "Preserved remains of ancient reptiles that lived 230-66 million years ago.",
      category: "Fossils",
    },
    {
      id: "2",
      name: "Limestone",
      description:
        "A sedimentary rock made mainly of calcium carbonate from compressed marine organisms like shells and coral.",
      category: "Sedimentary Rocks",
    },
    {
      id: "3",
      name: "Crystal Formation",
      description: "The process by which crystals form through nucleation and growth in supersaturated solutions.",
      category: "Mineralogy",
    },
    {
      id: "4",
      name: "Volcanic Activity",
      description:
        "Geological processes involving the eruption of molten rock, ash, and gases from the Earth's interior.",
      category: "Volcanology",
    },
  ]

  // Sample categories data
  const categories: Category[] = [
    {
      id: "1",
      name: "Fossils",
      description:
        "Preserved remains or traces of ancient organisms (plants, animals, microorganisms) that have been naturally preserved in rock over millions of years.",
      interestCount: 12,
    },
    {
      id: "2",
      name: "Sedimentary Rocks",
      description:
        "Rocks formed from compressed layers of sediments, organic matter, or minerals that accumulated over time.",
      interestCount: 8,
    },
    {
      id: "3",
      name: "Mineralogy",
      description:
        "The scientific study of minerals, their crystal structure, physical properties, and chemical composition.",
      interestCount: 15,
    },
    {
      id: "4",
      name: "Volcanology",
      description: "The study of volcanoes, lava, magma, and related geological phenomena and processes.",
      interestCount: 6,
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

  const filteredInterests = interests.filter(
    (interest) =>
      interest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (itemId: string, itemType: "interest" | "category") => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would delete the item from the data
  }

  const handleAdd = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowAddDialog(false)
    // Reset form
    setNewItemName("")
    setNewItemDescription("")
    setNewItemCategory("")
    // Here you would add the new item
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
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New {profilingType === "Interest" ? "Interest" : "Category"}
              </Button>
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
                        <TableHead className="font-semibold">Interest ID</TableHead>
                        <TableHead className="font-semibold">Interest</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold text-center">Action</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-semibold">Category-ID</TableHead>
                        <TableHead className="font-semibold">Categories</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold text-center">Interests</TableHead>
                        <TableHead className="font-semibold text-center">Action</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profilingType === "Interest"
                    ? filteredInterests.map((interest) => (
                        <TableRow key={interest.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{interest.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className="font-medium text-gray-900">{interest.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-md">
                            <p className="line-clamp-2">{interest.description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {interest.category}
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
                                  itemId: interest.id,
                                  itemName: interest.name,
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
                    : filteredCategories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{category.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-md">
                            <p className="line-clamp-2">{category.description}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-medium">
                              {category.interestCount} interests
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
                                  itemId: category.id,
                                  itemName: category.name,
                                  itemType: "category",
                                })
                                setShowConfirmDialog(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing 1 to{" "}
                {Math.min(
                  Number.parseInt(entries),
                  profilingType === "Interest" ? filteredInterests.length : filteredCategories.length,
                )}{" "}
                of {profilingType === "Interest" ? filteredInterests.length : filteredCategories.length} entries
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
                    <SelectItem value="fossils">Fossils</SelectItem>
                    <SelectItem value="sedimentary">Sedimentary Rocks</SelectItem>
                    <SelectItem value="mineralogy">Mineralogy</SelectItem>
                    <SelectItem value="volcanology">Volcanology</SelectItem>
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
            <DialogTitle>Delete {confirmAction?.itemType === "interest" ? "Interest" : "Category"}</DialogTitle>
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
    </AdminLayout>
  )
}