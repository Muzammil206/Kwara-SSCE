"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { Header } from "@/components/admin/header"
import { Sidebar } from "@/components/admin/sidebar"


export  function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle dark mode
  useEffect(() => {
    setMounted(true)
    const isDark = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarOpen && !e.target.closest(".sidebar") && !e.target.closest(".sidebar-toggle")) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [sidebarOpen])

  if (!mounted) return null

  return (
    <AdminAuthProvider>
      <div
        className={cn(
          "min-h-screen transition-colors duration-200",
          isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900",
        )}
      >
        {/* Header Component */}
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Sidebar Component */}
        <Sidebar isDarkMode={isDarkMode} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <div
          className={cn(
            "lg:pl-72 pt-16 min-h-screen flex flex-col transition-opacity duration-200",
            sidebarOpen && "lg:opacity-50 lg:pointer-events-none",
          )}
        >
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  )
}

