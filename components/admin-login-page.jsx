"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
       console.log("User Data:", data)
      if (!data?.user) {
        throw new Error("No user returned from authentication")
      }

      // Query the admin_users table to get the role
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("auth_id", data.user.id)
        .single()
         console.log("Admin Data:", adminData)
      if (adminError) {
        // If there's an error or no record found, sign out the user
        await supabase.auth.signOut()
        throw new Error("You do not have administrator privileges")
      }

      if (!adminData || !adminData.role) {
        // If no role is found, sign out the user
        await supabase.auth.signOut()
        throw new Error("You do not have administrator privileges")
      }

      // Get the role from the admin_users table
      const role = adminData.role

      // Validate that the role is one of the expected values
      const validRoles = ["admin", "surcon_admin", "appsn_admin"]
      if (!validRoles.includes(role)) {
        await supabase.auth.signOut()
        throw new Error("Invalid administrator role")
      }

      // Update user metadata with the role from the database
      await supabase.auth.updateUser({
        data: { role },
      })

      // Successfully authenticated as admin
      toast.success("Login successful")

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (error) {
      console.error("Login error:", error.message)

      // Handle different error types
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password")
      } else if (
        error.message.includes("administrator privileges") ||
        error.message.includes("Invalid administrator role")
      ) {
        setError("You do not have administrator access")
      } else {
        setError("An error occurred during login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) throw error

      toast.success("Password reset instructions sent to your email")
    } catch (error) {
      console.error("Password reset error:", error.message)
      setError("Failed to send reset instructions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the administrator dashboard</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Administrator Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm">
            <div className="text-muted-foreground">This area is restricted to authorized administrators only.</div>
            <div>
              <Link href="/" className="text-primary hover:underline">
                Return to main site
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pillar Application System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

