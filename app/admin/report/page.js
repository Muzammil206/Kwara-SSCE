"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import {AdminLayout} from "@/components/layout-admin"
import { format, parseISO } from "date-fns"
import {
  FileText,
  Search,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserPillarIdsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedApplications, setExpandedApplications] = useState({})
  const [pillarIdsByApplication, setPillarIdsByApplication] = useState({})
 

  
  
  // Fetch user's applications
  useEffect(() => {
    

    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("pillar_applications")
          .select("*")
          
          .order("applied_at", { ascending: false })

        if (error) throw error

        setApplications(data || [])

        // Initialize expanded state for all applications
        const expandedState = {}
        data?.forEach((app) => {
          expandedState[app.id] = false
        })
        setExpandedApplications(expandedState)
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast.error("Failed to fetch your applications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Fetch pillar IDs for an application when it's expanded
  const fetchPillarIds = useCallback(
    async (applicationId) => {
      // If we already have the pillar IDs, don't fetch again
      if (pillarIdsByApplication[applicationId]) return

      try {
        const { data, error } = await supabase
          .from("pillar_numbers")
          .select("*")
          .eq("pillar_application_id", applicationId)

        if (error) throw error

        // Update the pillar IDs state
        setPillarIdsByApplication((prev) => ({
          ...prev,
          [applicationId]: data || [],
        }))
      } catch (error) {
        console.error(`Error fetching pillar IDs for application ${applicationId}:`, error)
        toast.error("Failed to fetch pillar IDs")
      }
    },
    [pillarIdsByApplication],
  )

  // Toggle expanded state for an application
  const toggleApplicationExpanded = useCallback(
    async (applicationId) => {
      // If expanding, fetch pillar IDs
      if (!expandedApplications[applicationId]) {
        await fetchPillarIds(applicationId)
      }

      setExpandedApplications((prev) => ({
        ...prev,
        [applicationId]: !prev[applicationId],
      }))
    },
    [expandedApplications, fetchPillarIds],
  )

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.plan_number && app.plan_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.lga && app.lga.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.pillar_type && app.pillar_type.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" || (app.status && app.status.toLowerCase() === statusFilter.toLowerCase())

    return matchesSearch && matchesStatus
  })

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }, [])

  // Get status badge styling
  const getStatusBadge = useCallback((status) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>

    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }, [])

  // Get status icon
  const getStatusIcon = useCallback((status) => {
    if (!status) return <Clock className="h-5 w-5 text-gray-400" />

    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }, [])

  // Download pillar IDs as CSV
  const downloadPillarIds = useCallback(
    (applicationId) => {
      const pillarIds = pillarIdsByApplication[applicationId]
      if (!pillarIds || pillarIds.length === 0) {
        toast.error("No pillar IDs available to download")
        return
      }

      // Find the application
      const application = applications.find((app) => app.id === applicationId)
      if (!application) return

      // Create CSV content
      let csvContent = "Pillar ID,Application Number,Location,Date Assigned\n"
      pillarIds.forEach((pillar) => {
        csvContent += `${pillar.pillar_id},${application.plan_number || "N/A"},${application.lga || "N/A"},${formatDate(pillar.created_at || application.applied_at)}\n`
      })

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `pillar-ids-${application.plan_number || applicationId}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Pillar IDs downloaded successfully")
    },
    [pillarIdsByApplication, applications, formatDate],
  )

  // Print pillar IDs
  const printPillarIds = useCallback(
    (applicationId) => {
      const pillarIds = pillarIdsByApplication[applicationId]
      if (!pillarIds || pillarIds.length === 0) {
        toast.error("No pillar IDs available to print")
        return
      }

      // Find the application
      const application = applications.find((app) => app.id === applicationId)
      if (!application) return

      // Create a printable document
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast.error("Unable to open print window. Please check your popup blocker.")
        return
      }

      printWindow.document.write(`
      <html>
        <head>
          <title>Pillar IDs - ${application.plan_number || applicationId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; font-size: 24px; }
            .header { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pillar IDs for Application ${application.plan_number || applicationId}</h1>
            <p>Location: ${application.lga || "N/A"}</p>
            <p>Application Date: ${formatDate(application.applied_at)}</p>
            <p>Status: ${application.status || "N/A"}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Pillar ID</th>
                <th>Date Assigned</th>
              </tr>
            </thead>
            <tbody>
              ${pillarIds
                .map(
                  (pillar, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${pillar.pillar_id}</td>
                  <td>${formatDate(pillar.created_at || application.applied_at)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Printed on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
      printWindow.document.close()
    },
    [pillarIdsByApplication, applications, formatDate],
  )

  // Copy pillar IDs to clipboard
  const copyPillarIds = useCallback(
    async (applicationId) => {
      const pillarIds = pillarIdsByApplication[applicationId]
      if (!pillarIds || pillarIds.length === 0) {
        toast.error("No pillar IDs available to copy")
        return
      }

      try {
        await navigator.clipboard.writeText(pillarIds.map((p) => p.pillar_id).join(", "))
        toast.success("Pillar IDs copied to clipboard")
      } catch (error) {
        toast.error("Failed to copy pillar IDs")
      }
    },
    [pillarIdsByApplication],
  )

  // Helper function to render the applications list
  const renderApplicationsList = useCallback(
    (apps) => {
      if (apps.length === 0) {
        return (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {applications.length === 0
                ? "You haven't submitted any pillar applications yet."
                : "No applications match your current search or filter criteria."}
            </p>
            {applications.length === 0 && (
              <Button className="mt-4" onClick={() => router.push("/applications/new")}>
                Submit New Application
              </Button>
            )}
          </div>
        )
      }

      return (
        
        <div className="space-y-6">
          {apps.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <CardTitle className="text-lg">Application {application.plan_number || application.id}</CardTitle>
                      <CardDescription>Submitted on {formatDate(application.applied_at)}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Location: <span className="font-medium">{application.lga || "N/A"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Type: <span className="font-medium capitalize">{application.pillar_type || "Standard"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {application.status?.toLowerCase() === "approved"
                        ? `Approved on: ${formatDate(application.approved_at || application.updated_at || application.applied_at)}`
                        : `Applied on: ${formatDate(application.applied_at)}`}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toggleApplicationExpanded(application.id)}
                >
                  {expandedApplications[application.id] ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Pillar IDs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      View Pillar IDs
                    </>
                  )}
                </Button>

                {expandedApplications[application.id] && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Assigned Pillar IDs</h4>

                    {!pillarIdsByApplication[application.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : pillarIdsByApplication[application.id].length === 0 ? (
                      <div className="text-center py-4 bg-muted/10 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          {application.status?.toLowerCase() === "approved"
                            ? "No pillar IDs have been assigned to this application yet."
                            : "Pillar IDs will be assigned once your application is approved."}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          {pillarIdsByApplication[application.id].map((pillar, index) => (
                            <div key={index} className="border rounded-md p-3 bg-muted/10">
                              <p className="font-medium text-sm">{pillar.pillar_id}</p>
                              <p className="text-xs text-muted-foreground">
                                Assigned: {formatDate(pillar.created_at || application.applied_at)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => downloadPillarIds(application.id)}
                          >
                            <Download className="h-4 w-4" />
                            <span>Download CSV</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => printPillarIds(application.id)}
                          >
                            <Printer className="h-4 w-4" />
                            <span>Print</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => copyPillarIds(application.id)}
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Copy IDs</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/applications`)}>
                    View Full Application
                  </Button>

                  
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )
    },
    [
      applications,
      expandedApplications,
      pillarIdsByApplication,
      formatDate,
      getStatusIcon,
      getStatusBadge,
      toggleApplicationExpanded,
      downloadPillarIds,
      printPillarIds,
      copyPillarIds,
      router,
    ],
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col gap-4 mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pillar Records</h1>
        <p className="text-muted-foreground mt-2"> Assigned pillar IDs</p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-4 max-w-md mx-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search by plan number, location, or type..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderApplicationsList(filteredApplications)}
        </TabsContent>

        <TabsContent value="approved">
          {renderApplicationsList(applications.filter((app) => app.status?.toLowerCase() === "approved"))}
        </TabsContent>

        <TabsContent value="pending">
          {renderApplicationsList(applications.filter((app) => app.status?.toLowerCase() === "pending"))}
        </TabsContent>

        <TabsContent value="rejected">
          {renderApplicationsList(applications.filter((app) => app.status?.toLowerCase() === "rejected"))}
        </TabsContent>
      </Tabs>
    </div>
    </AdminLayout>
  )
}
