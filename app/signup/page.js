"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"

export default function UserSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Check if email exists in users table
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, email, auth_user_id, role")
        .eq("email", email)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected if email doesn't exist
        throw new Error("Error checking user database")
      }

      // Step 2: Validate user eligibility
      if (!existingUser) {
        setError("Email not found in our system. Please contact support to get your email added.")
        return
      }

      if (existingUser.auth_user_id) {
        toast.success("User already registered, Check your email to confirm your account. If you have not received an email, please check your spam folder or contact support.")
        setError("User already registered, Check your email to confirm your account. If you have not received an email, please check your spam folder or contact support")
        return
      }

      // Step 3: Create auth account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
           toast.success("User already registered, Check your email to confirm your account. If you have not received an email, please check your spam folder or contact support.")
          setError("User already registered, Check your email to confirm your account. If you have not received an email, please check your spam folder or contact support")
        } else {
          throw signUpError
        }
        return
      }

      if (!authData?.user) {
        throw new Error("Failed to create user account")
      }

      // Step 4: Update users table with auth_user_id and set role
      const { error: updateError } = await supabase
        .from("users")
        .update({
          auth_user_id: authData.user.id,
          role: "user",
        })
        .eq("id", existingUser.id)

      if (updateError) {
        // If updating fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw new Error("Failed to link account. Please try again.")
      }

      // Step 5: Update user metadata with role
      await supabase.auth.updateUser({
        data: { role: "user" },
      })

      // Step 6: Sign in the user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error("Account created but failed to sign in. Please use the login page.")
      }

      // Success!
      toast.success("Account created successfully! Welcome!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error.message)

      // Handle different error types
      if (error.message.includes("Email not confirmed")) {
        setError("Please check your email and confirm your account before signing in.")
      } else if (error.message.includes("already registered")) {
        setError("This email is already registered. Please use the login page instead.")
      } else if (error.message.includes("Invalid email")) {
        setError("Please enter a valid email address.")
      } else if (error.message.includes("Password should be at least")) {
        setError("Password must be at least 6 characters long.")
      } else {
        setError(error.message || "An error occurred during signup. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Set up your password to access your account</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">User Registration</CardTitle>
            <CardDescription className="text-center">Enter your email and create a password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
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
                <p className="text-xs text-muted-foreground">Enter the email address that was provided to you</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-9 pr-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>At least 6 characters long</li>
                  <li>Mix of letters and numbers recommended</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm">
            <div className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/newlogin" className="text-green-600 hover:underline font-medium">
                Sign in here
              </Link>
            </div>
            <div>
              <Link href="/" className="text-green-600 hover:underline">
                Return 
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
