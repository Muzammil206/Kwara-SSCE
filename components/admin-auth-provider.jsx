"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { getNavigationByRole } from "@/lib/admin-navigation"

// Create the context
const AdminAuthContext = createContext(undefined)

// Create a provider component
export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if the user is authenticated and is an admin
  useEffect(() => {
    const checkAdminUser = async () => {
      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session) {
          // No session, user is not logged in
          setAdminUser(null)
          setIsLoading(false)

          // If on an admin page (except login), redirect to login
          if (pathname?.startsWith("/admin") && !pathname?.includes("/admin/login")) {
            router.push("/admin/login")
          }
          return
        }

        // First check if role is in user metadata (set during login)
        let role = session.user.user_metadata?.role

        // If not in metadata, query the admin_users table
        if (!role) {
          const { data: adminData, error: adminError } = await supabase
            .from("admin_users")
            .select("role")
            .eq("user_id", session.user.id)
            .single()

          if (adminError || !adminData) {
            // If there's an error or no record found, sign out the user
            await supabase.auth.signOut()
            setAdminUser(null)
            setIsLoading(false)

            if (pathname?.startsWith("/admin") && !pathname?.includes("/admin/login")) {
              toast.error("You don't have administrator access")
              router.push("/admin/login")
            }
            return
          }

          role = adminData.role

          // Update user metadata with the role from the database
          await supabase.auth.updateUser({
            data: { role },
          })
        }

        // Check if the role is valid
        const validRoles = ["admin", "surcon_admin", "appsn_admin"]
        const isValidAdmin = validRoles.includes(role)

        if (!isValidAdmin) {
          // User is not an admin
          await supabase.auth.signOut()
          setAdminUser(null)
          setIsLoading(false)

          if (pathname?.startsWith("/admin") && !pathname?.includes("/admin/login")) {
            toast.error("You don't have administrator access")
            router.push("/admin/login")
          }
          return
        }

        // Check if the current page is accessible to the user's role
        const allowedNavigation = getNavigationByRole(role)
        const currentPageAllowed =
          allowedNavigation.some((item) => pathname === item.href) ||
          pathname === "/admin/login" ||
          pathname === "/admin" ||
          pathname === "/admin/users"

        if (!currentPageAllowed && pathname?.startsWith("/admin")) {
          // Redirect to dashboard if the current page is not allowed
          router.push("/admin")
          toast.error("You don't have access to this page")
          return
        }

        // User is an admin, set the admin user
        setAdminUser({
          id: session.user.id,
          email: session.user.email || "",
          role: role,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          avatarUrl: session.user.user_metadata?.avatar_url,
          lastLogin: session.user.last_sign_in_at,
        })

        // If on login page and already authenticated, redirect to dashboard
        if (pathname === "/admin/login") {
          router.push("/admin")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setAdminUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setAdminUser(null)
        if (pathname?.startsWith("/admin") && !pathname?.includes("/admin/login")) {
          router.push("/admin/login")
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkAdminUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setAdminUser(null)
      toast.success("Signed out successfully")
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  return <AdminAuthContext.Provider value={{ adminUser, isLoading, signOut }}>{children}</AdminAuthContext.Provider>
}

// Create a hook to use the admin auth context
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}

