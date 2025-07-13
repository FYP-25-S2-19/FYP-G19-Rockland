"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminSidebar from "@/components/ui/AdminSidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenuItem: string
  title: string
  subtitle?: string
  onNavigate?: (item: string) => void
}

interface AdminInfo {
  name: string
  email: string
  initials: string
}

export default function AdminLayout({ 
  children, 
  activeMenuItem, 
  title, 
  subtitle,
  onNavigate 
}: AdminLayoutProps) {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)

  // Load admin info from localStorage on component mount
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem('adminEmail')
      const storedName = localStorage.getItem('adminName')
      
      if (storedEmail) {
        let displayName = ""
        let initials = ""
        
        if (storedName) {
          displayName = storedName
          initials = storedName.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2)
        } else {
          // Extract name from email if no separate name stored
          const nameFromEmail = storedEmail.split('@')[0]
          displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
          initials = displayName.charAt(0).toUpperCase()
        }
        
        setAdminInfo({
          name: displayName,
          email: storedEmail,
          initials: initials
        })
      } else {
        // No admin info available
        setAdminInfo(null)
      }
    } catch (error) {
      console.error('Error loading admin info from localStorage:', error)
      setAdminInfo(null)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeItem={activeMenuItem} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center space-x-3">
              {adminInfo ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
                    <p className="text-xs text-gray-500">{adminInfo.email}</p>
                  </div>
                  <Avatar className="ring-2 ring-green-100">
                    <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                      {adminInfo.initials}
                    </AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-400">Not logged in</p>
                  <p className="text-xs text-gray-400">Please log in</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}