"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Users,
  UserCheck,
  UserCog,
  MessageSquare,
  FileText,
  HelpCircle,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const sidebarItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Users, label: "Applications" },
  { icon: UserCheck, label: "User Account" },
  { icon: UserCog, label: "User Type" },
  { icon: User, label: "User Profiling" },
  { icon: MessageSquare, label: "Forum" },
  { icon: FileText, label: "Landing Page" },
  { icon: HelpCircle, label: "FAQ Page" },
  { icon: User, label: "My Profile" },
]

const statsCards = [
  {
    title: "Total User",
    value: "40,689",
    change: "8.5% Up from yesterday",
    trending: "up",
    icon: "👥",
    color: "bg-blue-50",
  },
  {
    title: "Total Rocks",
    value: "10293",
    change: "1.3% Up from past week",
    trending: "up",
    icon: "🪨",
    color: "bg-yellow-50",
  },
  {
    title: "Total Applications In",
    value: "456",
    change: "4.3% Down from yesterday",
    trending: "down",
    icon: "📋",
    color: "bg-green-50",
  },
  {
    title: "Total Articles",
    value: "4560",
    change: "1.8% Up from yesterday",
    trending: "up",
    icon: "📊",
    color: "bg-orange-50",
  },
]

const leastDemandCategories = [
  { name: "Sedimentary Rocks", percentage: 74, color: "bg-red-500", image: "🪨" },
  { name: "Igneous Rocks", percentage: 52, color: "bg-orange-500", image: "🌋" },
  { name: "Regional Rocks", percentage: 36, color: "bg-yellow-500", image: "⛰️" },
]

const onDemandCategories = [
  { name: "Fossils", percentage: 95, color: "bg-green-500", image: "🦕" },
  { name: "Minerals", percentage: 92, color: "bg-green-500", image: "💎" },
  { name: "Metamorphic Rocks", percentage: 89, color: "bg-green-500", image: "🪨" },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-green-600 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-green-500">
          <h1 className="text-xl font-bold">ROCKLAND</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-6 py-3 text-sm hover:bg-green-500 cursor-pointer ${
                item.active ? "bg-green-500" : ""
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-green-500">
          <div className="flex items-center px-2 py-3 text-sm hover:bg-green-500 cursor-pointer rounded">
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Hi, Admin 👋</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@main.com</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-gray-200">A</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center text-xs">
                      {stat.trending === "up" ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={stat.trending === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Least Demand Categories */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Least Demand Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {leastDemandCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                          {category.image}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* On Demand Categories */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">On Demand Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {onDemandCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                          {category.image}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
