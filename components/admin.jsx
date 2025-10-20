"use client"

import { useState, useEffect } from "react"
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ApplicationCard } from "@/components/ui/application-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabaseClient"



const StatCard = ({ title, value, change, icon, isLoading }) => (
  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-xl text-primary">{icon}</div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {change >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <ArrowUpRight className="mr-1 h-4 w-4 transform rotate-45" />
              )}
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </>
      )}
    </CardContent>
  </Card>
)

export default function AdminDashboard() {
  const [applications, setApplications] = useState(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalApplications, setTotalApplications] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Approval rate calculation
  const [approvedRate, setApprovedRate] = useState(0)
  const [paymentRate, setPaymentRate] = useState(0)

  // Application statistics
  const [applicationStatistics, setApplicationStatistics] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch users count
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          

        if (userError) throw userError

        // Fetch applications
        const { data: recentApps, error: appError } = await supabase
          .from("pillar_applications")
          .select("*")
          .order("applied_at", { ascending: false })
          .limit(5)

        if (appError) throw appError

        // Fetch total applications count
        const { count: appsCount, error: countError } = await supabase
          .from("pillar_applications")
          .select("*", { count: "exact", head: true })

        if (countError) throw countError

        // Get application status counts
        const { data: statusData, error: statusError } = await supabase.from("pillar_applications").select("status")
      
        const statusCounts = {
          approved: statusData.filter((app) => app.status === "Approved").length,
          pending: statusData.filter((app) => app.status === "pending").length,
          rejected: statusData.filter((app) => app.status === "null").length,
        }

        const totalStatusCount = statusCounts.approved + statusCounts.pending + statusCounts.rejected
           console.log(statusCounts)
        // Update state with fetched data
        setApplications(recentApps || [])
        setTotalUsers(userData?.length || 0)
        setTotalApplications(appsCount || 0)
        setApplicationStatistics(statusCounts)

        // Calculate rates
        setApprovedRate(Math.round((statusCounts.approved / (totalStatusCount || 1)) * 100))
        setPaymentRate(92) // Mock data for now, replace with actual calculation

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription for applications
    const subscription = supabase
      .channel("public:pillar_applications")
      .on("INSERT", (payload) => {
        // Update applications list when new data is inserted
        setApplications((prevApps) => [payload.new, ...(prevApps || [])].slice(0, 5))
        setTotalApplications((prev) => prev + 1)
      })
      .on("UPDATE", (payload) => {
        // Update applications list when data is updated
        setApplications((prevApps) => prevApps?.map((app) => (app.id === payload.new.id ? payload.new : app)) || [])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  // Stats data with real values
  const stats = [
    {
      title: "Total Users",
      value: isLoading ? "-" : totalUsers.toLocaleString(),
      change: 12.5,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Total Applications",
      value: isLoading ? "-" : totalApplications.toLocaleString(),
      change: 5.2,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Approval Rate",
      value: isLoading ? "-" : `${approvedRate}%`,
      change: 2.3,
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: "Payment Completion",
      value: isLoading ? "-" : `${paymentRate}%`,
      change: 3.1,
      icon: <CreditCard className="h-5 w-5" />,
    },
  ]

  const applicationStats = [
    {
      status: "Approved",
      count: applicationStatistics.approved,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "bg-green-500",
    },
    {
      status: "Pending",
      count: applicationStatistics.pending,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: "bg-yellow-500",
    },
    {
      status: "Rejected",
      count: applicationStatistics.rejected,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      color: "bg-red-500",
    },
  ]

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <>Last updated: Today, {new Date().toLocaleTimeString()}</>
            )}
          </span>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.location.reload()}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats cards with improved design */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Application status with improved visuals */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Application Status</CardTitle>
            <CardDescription>Distribution of application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {applicationStats.map((item, i) => {
                  const percentage = Math.round((item.count / totalApplications) * 100) || 0

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-2 font-medium">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.count}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>

                      <div className="relative">
                        <Progress value={percentage} className="h-2.5 w-full" indicatorclassname={item.color} />
                        <div className="absolute top-3 right-0 text-xs text-muted-foreground">{percentage}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <a href="/admin/reports">View detailed analytics</a>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent applications with improved design */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recent Applications</CardTitle>
            <CardDescription>Latest submitted applications</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-2 w-2 rounded-full mt-2" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : applications && applications.length > 0 ? (
              <ApplicationCard applications={applications} />
            ) : (
              <div className="p-6 text-center text-muted-foreground">No applications found</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-4 pb-6">
            <Button size="sm" asChild>
              <a href="/admin/applications">View all applications</a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Add a third row with additional insights */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Application Growth</CardTitle>
            <CardDescription>Monthly application submission trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <BarChart3 className="h-16 w-16 mb-4 text-primary/30" />
                <p>Chart visualization will appear here</p>
                <p className="text-sm">coming soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

