"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Eye, EyeOff, Lock, AlertCircle, ArrowRight, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"
import { Suspense } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  useEffect(() => {
    const checkToken = async () => {
      const tokenHash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (!tokenHash || type !== "recovery") {
        setError("Invalid or missing reset token. Please request a new password reset.")
        setIsCheckingToken(false)
        return
      }

      try {
        // Verify the session with the token hash
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        })

        if (error) {
          setError("Invalid or expired reset token. Please request a new password reset.")
        } else {
          setIsValidToken(true)
        }
      } catch (error) {
        console.error("Token verification error:", error)
        setError("Error verifying reset token. Please try again.")
      } finally {
        setIsCheckingToken(false)
      }
    }

    checkToken()
  }, [searchParams])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!password || !confirmPassword) {
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
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw error
      }

      // Success!
      toast.success("Password updated successfully!")

      // Redirect to login page
      setTimeout(() => {
        router.push("/newlogin")
      }, 2000)
    } catch (error) {
      console.error("Password reset error:", error.message)

      if (error.message.includes("Password should be at least")) {
        setError("Password must be at least 6 characters long.")
      } else if (error.message.includes("New password should be different")) {
        setError("New password must be different from your current password.")
      } else {
        setError("Failed to update password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }
  

  if (isCheckingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4 py-12">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mb-4" />
            <p className="text-muted-foreground">Verifying reset token...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken) {
    return (
        <Suspense fallback={null}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Invalid Token</h1>
            <p className="text-gray-600 mt-2">The reset link is invalid or has expired</p>
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Please request a new password reset from the login page.
                </p>

                <Button asChild className="w-full">
                  <Link href="/login">Return to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={null}>
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <KeyRound className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Create New Password</CardTitle>
            <CardDescription className="text-center">Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
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
                  <li>Different from your previous password</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Updating password...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Update Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/login" className="text-purple-600 hover:underline text-sm">
            Return to Login
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pillar Application System. All rights reserved.</p>
        </div>
      </div>
    </div>
    </Suspense>
  )
}
