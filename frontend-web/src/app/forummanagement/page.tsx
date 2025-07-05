"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
  Trash2,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface Article {
  id: string
  title: string
  content: string
  date: string
  userId: string
  userType: "Expert" | "Premium" | "Free"
  likeCount: number
  dislikeCount: number
  category: string
  location?: string
  author: string
  image?: string
}

interface Discussion {
  id: string
  title: string
  content: string
  date: string
  userId: string
  userType: "Expert" | "Premium" | "Free"
  likeCount: number
  dislikeCount: number
  category: string
  author: string
  comments: Comment[]
  image?: string
}

interface Comment {
  id: string
  author: string
  content: string
  date: string
  likeCount: number
  dislikeCount: number
}

type ViewMode = "list" | "detail"
type ForumType = "Articles" | "Discussion"

export default function ForumManagement() {
  const router = useRouter()
  const [forumType, setForumType] = useState<ForumType>("Articles")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedItem, setSelectedItem] = useState<Article | Discussion | null>(null)
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemTitle: string
    itemType: "article" | "discussion"
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sample articles data
  const articles: Article[] = [
    {
      id: "1",
      title: "Sodium rocks",
      content:
        "It is found in... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin porta nulla ac tincidunt bibendum. Donec ac faucibus mauris. Curabitur in accumsan tortor, commodo sagittis est. Nam consectetur mi a placerat sodales. Donec accumsan fermentum turpis, vitae ultrices urna mollis eleifend. tortor, commodo sagittis est. Nam consectetur mi a placerat sodales. Donec accumsan fermentum turpis, vitae ultrices urna mollis eleifend.",
      date: "19/10/2025",
      userId: "1029",
      userType: "Expert",
      likeCount: 1500,
      dislikeCount: 164,
      category: "Sodium Rocks",
      location: "Mount Bromo, Indonesia",
      author: "Expert Kim",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "2",
      title: "Crystal Formation Patterns",
      content:
        "Understanding how crystals form in different geological conditions. This comprehensive guide covers the various factors that influence crystal growth and development.",
      date: "18/10/2025",
      userId: "1030",
      userType: "Expert",
      likeCount: 892,
      dislikeCount: 45,
      category: "Crystallography",
      location: "Crystal Cave, Mexico",
      author: "Dr. Sarah Chen",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  // Sample discussions data
  const discussions: Discussion[] = [
    {
      id: "1",
      title: "Rocks found in",
      content:
        "I found a... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin porta nulla ac tincidunt bibendum. Donec ac faucibus mauris.",
      date: "19/10/2025",
      userId: "1029",
      userType: "Premium",
      likeCount: 1500,
      dislikeCount: 164,
      category: "Sodium Rocks",
      author: "Jason",
      image: "/placeholder.svg?height=200&width=300",
      comments: [
        {
          id: "1",
          author: "Mason",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin porta nulla ac tincidunt bibendum. Donec ac faucibus mauris.",
          date: "19/10/2025",
          likeCount: 45,
          dislikeCount: 3,
        },
        {
          id: "2",
          author: "Alex",
          content: "Great find! I've seen similar formations in the Rocky Mountains.",
          date: "20/10/2025",
          likeCount: 23,
          dislikeCount: 1,
        },
      ],
    },
    {
      id: "2",
      title: "Best locations for fossil hunting",
      content:
        "What are the best locations for finding fossils? I'm planning a trip and would love some recommendations from experienced hunters.",
      date: "17/10/2025",
      userId: "1031",
      userType: "Premium",
      likeCount: 234,
      dislikeCount: 12,
      category: "Fossils",
      author: "Emma Wilson",
      image: "/placeholder.svg?height=200&width=300",
      comments: [
        {
          id: "3",
          author: "Fossil Hunter",
          content: "The Badlands in South Dakota are excellent for fossil hunting, especially for mammal fossils.",
          date: "17/10/2025",
          likeCount: 67,
          dislikeCount: 2,
        },
      ],
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
        router.push('/userprofiling')
        break
      case "forum":
        // Already on forum page
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

  const currentData = forumType === "Articles" ? articles : discussions
  const filteredData = currentData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (itemId: string, itemType: "article" | "discussion") => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would delete the item from the data
  }

  const handleView = (item: Article | Discussion) => {
    setSelectedItem(item)
    setViewMode("detail")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedItem(null)
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "Expert":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Premium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Free":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Helper function to handle forum type change with proper type checking
  const handleForumTypeChange = (value: string) => {
    if (value === "Articles" || value === "Discussion") {
      setForumType(value as ForumType)
    }
  }

  // Detail View
  if (viewMode === "detail" && selectedItem) {
    return (
      <AdminLayout
        activeMenuItem="forum"
        title="Hi, Admin 👋"
        subtitle="Forum content details"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
                className="text-gray-600 hover:text-gray-800 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {forumType === "Articles" ? "Article" : "Discussion"} List
              </Button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Forum &gt; View {forumType === "Articles" ? "Articles" : "Discussion"}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Image */}
              <div className="lg:col-span-1">
                <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
                      <Image
                        src="/placeholder.svg?height=64&width=64"
                        alt="Placeholder"
                        width={64}
                        height={64}
                        className="opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Like:</span>
                    <span className="font-medium">{selectedItem.likeCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Dislike:</span>
                    <span className="font-medium">{selectedItem.dislikeCount}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category: {selectedItem.category}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {forumType === "Articles" ? "Article" : "Discussion"} Title: {selectedItem.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Posted By: {selectedItem.author}</span>
                  {forumType === "Articles" && "location" in selectedItem && selectedItem.location && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Location: {selectedItem.location}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedItem.content}</p>
                </div>

                {/* Comments Section for Discussions */}
                {forumType === "Discussion" && "comments" in selectedItem && selectedItem.comments.length > 0 && (
                  <div className="mt-8">
                    <Separator className="mb-6" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
                    <div className="space-y-4">
                      {selectedItem.comments.map((comment) => (
                        <Card key={comment.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">Comment by: {comment.author}</span>
                              <span className="text-sm text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {comment.likeCount}
                              </div>
                              <div className="flex items-center">
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                {comment.dislikeCount}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // List View
  return (
    <AdminLayout
      activeMenuItem="forum"
      title="Hi, Admin 👋"
      subtitle="Manage forum content and discussions"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Forum</h2>
                <p className="text-gray-600 mt-1">Select Forum</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Select value={forumType} onValueChange={handleForumTypeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Articles">Articles</SelectItem>
                    <SelectItem value="Discussion">Discussion</SelectItem>
                  </SelectContent>
                </Select>

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
                <div className="relative w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${forumType.toLowerCase()}...`}
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
              {forumType === "Articles" ? "Article" : "Discussion"} List
            </h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    {forumType === "Articles" ? (
                      <>
                        <TableHead className="font-semibold">Article ID</TableHead>
                        <TableHead className="font-semibold">Article Title</TableHead>
                        <TableHead className="font-semibold">Content</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">User-ID (Expert)</TableHead>
                        <TableHead className="font-semibold text-center">Like Count</TableHead>
                        <TableHead className="font-semibold text-center">Action</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-semibold">Discussion ID</TableHead>
                        <TableHead className="font-semibold">Discussion Title</TableHead>
                        <TableHead className="font-semibold">Content</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">User-ID (Premium)</TableHead>
                        <TableHead className="font-semibold text-center">Action</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{item.id}</TableCell>
                      <TableCell className="font-medium text-gray-900 max-w-xs">
                        <p className="line-clamp-1">{item.title}</p>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-md">
                        <p className="line-clamp-2">{item.content}</p>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">{item.userId}</span>
                          <Badge className={`border text-xs ${getUserTypeColor(item.userType)}`}>
                            {item.userType}
                          </Badge>
                        </div>
                      </TableCell>
                      {forumType === "Articles" && (
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-medium">
                            {item.likeCount}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                            onClick={() => handleView(item)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
                            onClick={() => {
                              setConfirmAction({
                                type: "delete",
                                itemId: item.id,
                                itemTitle: item.title,
                                itemType: forumType === "Articles" ? "article" : "discussion",
                              })
                              setShowConfirmDialog(true)
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing 1 to {Math.min(Number.parseInt(entries), filteredData.length)} of {filteredData.length}{" "}
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
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {confirmAction?.itemType === "article" ? "Article" : "Discussion"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {confirmAction?.itemType}:{" "}
              <strong>"{confirmAction?.itemTitle}"</strong>? This action cannot be undone.
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