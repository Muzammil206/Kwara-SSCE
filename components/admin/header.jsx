"use client"

import { Menu, Bell, Moon, Sun, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { Button } from "@/components/ui/button"

export function Header({ isDarkMode, toggleDarkMode, sidebarOpen, setSidebarOpen }) {
  const { adminUser, signOut } = useAdminAuth()

  // Get first letter of name or email for avatar
  const getInitials = () => {
    if (adminUser?.name) {
      return adminUser.name.charAt(0).toUpperCase()
    }
    if (adminUser?.email) {
      return adminUser.email.charAt(0).toUpperCase()
    }
    return "A"
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-30 transition-colors duration-200",
        "h-16 px-4 flex items-center justify-between shadow-sm lg:pl-72",
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "p-2 rounded-full lg:hidden sidebar-toggle",
          isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100",
        )}
      >
        <Menu size={22} />
      </button>

      {/* Logo for mobile */}
      <div className="lg:hidden">
        <h1
          className={cn("text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent")}
        >
          Pillar Admin
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDarkMode ? "text-blue-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100",
          )}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className={cn(
            "p-2 rounded-full relative",
            isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100",
          )}
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "hidden md:flex items-center gap-2",
            isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100",
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>

        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  )
}

