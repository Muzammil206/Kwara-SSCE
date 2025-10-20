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
import Image from "next/image"

export default function UserLoginPage() {
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

      console.log(data.user.id)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("auth_user_id", data.user.id)
        .single()
      console.log("User Role Data:", userData)
      if (userError) {
        // If there's an error or no record found, sign out the user
        await supabase.auth.signOut()
        throw new Error("User account not found or not properly configured")
      }
      if (!userData || !userData.role) {
        // If no role is found, sign out the user
        await supabase.auth.signOut()
        throw new Error("User role not assigned")
      }
      // Get the role from the users table
      const role = userData.role
      // Validate that the role is 'user'
      if (role !== "user") {
        await supabase.auth.signOut()
        throw new Error("You do not have user access privileges")
      }
      // Update user metadata with the role from the database
      await supabase.auth.updateUser({
        data: { role },
      })
      // Successfully authenticated as user
      toast.success("Welcome! Login successful")
      // Redirect to user dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error.message)
      // Handle different error types
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password")
      } else if (
        error.message.includes("User account not found") ||
        error.message.includes("User role not assigned") ||
        error.message.includes("user access privileges")
      ) {
        setError("Your account is not configured for user access")
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
        redirectTo: `${window.location.origin}/reset-password`,
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Image src="/appsn1.png" alt="Logo" width={64} height={64} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-md">Kwara APPSN</h1>
          <p className="text-gray-700 mt-2 text-lg drop-shadow-sm">Pillar Appilcation Portal</p>
        </div>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">User Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
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
                    placeholder="your.email@example.com"
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
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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
            <div className="text-muted-foreground">
              {"Not registered? sign up here with pre-sumbitted email "}
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up here
              </Link>
            </div>
            <div>
              <Link href="/" className="text-blue-600 hover:underline">
                Return to homepage
              </Link>
            </div>
          </CardFooter>
        </Card>
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pillar Application System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
