"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { getNavigationByRole } from "@/lib/admin-navigation"


export function Sidebar({ isDarkMode, sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname()
  const { adminUser, signOut } = useAdminAuth()

  // Get navigation items based on user role
  const navigation = getNavigationByRole(adminUser?.role || "admin")

  return (
    <>
      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div
        className="sidebar fixed inset-y-0 left-0 z-20 w-72 hidden lg:flex lg:flex-col transition-colors duration-200"
        style={{
          backgroundColor: isDarkMode ? "rgb(31, 41, 55)" : "white",
          borderRight: isDarkMode ? "1px solid rgb(55, 65, 81)" : "1px solid rgb(229, 231, 235)",
        }}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h1
            className={cn(
              "text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent",
            )}
          >
            Pillar Admin
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg group relative",
                    "transition-all duration-200 ease-in-out",
                    isActive
                      ? isDarkMode
                        ? "bg-gray-700 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive
                        ? "text-blue-500"
                        : isDarkMode
                          ? "text-gray-400 group-hover:text-gray-300"
                          : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-500" />}
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className={cn("p-4 border-t", isDarkMode ? "border-gray-700" : "border-gray-200")}>
          <button
            onClick={signOut}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg",
              "transition-colors duration-200",
              isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <LogOut className={cn("mr-3 h-5 w-5", isDarkMode ? "text-gray-400" : "text-gray-400")} />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className={cn(
              "sidebar fixed inset-y-0 left-0 z-20 w-72 shadow-lg lg:hidden",
              "flex flex-col",
              isDarkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white border-r border-gray-200",
            )}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <h1
                className={cn(
                  "text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent",
                )}
              >
                Pillar Admin
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg group relative",
                        "transition-all duration-200 ease-in-out",
                        isActive
                          ? isDarkMode
                            ? "bg-gray-700 text-blue-400"
                            : "bg-blue-50 text-blue-600"
                          : isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100",
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive
                            ? "text-blue-500"
                            : isDarkMode
                              ? "text-gray-400 group-hover:text-gray-300"
                              : "text-gray-400 group-hover:text-gray-500",
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-blue-500" />}
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className={cn("p-4 border-t", isDarkMode ? "border-gray-700" : "border-gray-200")}>
              <button
                onClick={signOut}
                className={cn(
                  "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg",
                  "transition-colors duration-200",
                  isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <LogOut className={cn("mr-3 h-5 w-5", isDarkMode ? "text-gray-400" : "text-gray-400")} />
                Sign out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

