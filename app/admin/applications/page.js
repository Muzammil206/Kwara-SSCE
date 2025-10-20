"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AdminLayout } from "@/components/layout-admin"
import { downloadCSV } from "@/utils/surconCsv"
import CardStatSurcon  from "@/components/admin/cardStatSurcon"
import Link from "next/link"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  FileText,
  MapPin,
  X,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isWithinInterval,
} from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"


export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pillarIds, setPillarIds] = useState([])

  // Date filter states
  const [dateFilter, setDateFilter] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({
    from: null,
    to: null,
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const itemsPerPage = 10

  // Fetch applications from the database
  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    fetchApplications()
    const interval = setInterval(() => {
      fetchApplications()
    }, 10000) // refresh every 10 seconds

    return () => clearInterval(interval) // cleanup on unmount
  }, [selectedApplication, currentPage, statusFilter, searchTerm])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("pillar_applications")
        .select(`
        *,
        users (
          name
        )
      `)
        .order("applied_at", { ascending: false })

      if (error) throw error
      setApplications(data)
    } catch (error) {
      console.error("Error fetching applications:", error.message)
      toast.error("Failed to fetch applications. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch pillar IDs when an application is selected
  useEffect(() => {
    if (!selectedApplication) {
      setPillarIds([])
      return
    }

    const fetchPillarIds = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("pillar_numbers")
          .select("pillar_id")
          .eq("pillar_application_id", selectedApplication.id)

        if (error) throw error

        if (data && data.length > 0) {
          console.log("Fetched pillar IDs:", data)
          setPillarIds(data)
        } else {
          console.log("No pillar IDs found for this application")
          setPillarIds([])
        }
      } catch (error) {
        console.error("Error fetching pillar IDs:", error)
        toast.error("Failed to fetch pillar IDs")
        setPillarIds([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPillarIds()
  }, [selectedApplication])

  const openApplicationDetails = (application) => {
    setSelectedApplication(application)
    setIsDetailsOpen(true)
  }

  const closeApplicationDetails = () => {
    setIsDetailsOpen(false)
    setSelectedApplication(null)
    setPillarIds([])
  }

  const updateApplicationStatus = async (id, newStatus) => {
    try {
      setIsLoading(true)
      // Update the main application status
      const { error } = await supabase.from("pillar_applications").update({ status: newStatus }).eq("id", id)

      if (error) throw error

      // If approved, also update the surcon status
      if (newStatus === "Approved") {
        await updateSurconStatus(id)
      }

      // Update local state
      setApplications(applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app)))

      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication((prev) => ({ ...prev, status: newStatus }))
      }

      toast.success(`Application status changed to ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error.message)
      toast.error("Could not update application status")
    } finally {
      setIsLoading(false)
    }
  }

  // Update surcon status when application is approved
  const updateSurconStatus = async (applicationId) => {
    try {
      const { data, error } = await supabase
        .from("surcon_pillar_application")
        .update({ status: "approved" })
        .eq("application_id", applicationId)
        .select()

      if (error) {
        console.error("Error updating surcon status:", error.message)
        // Don't throw here, as we want to continue even if this fails
        toast.warning("Application approved, but surcon status update failed")
        return false
      }

      console.log("Surcon status updated:", data)
      return true
    } catch (error) {
      console.error("Error in surcon status update:", error)
      return false
    }
  }

  // Date filtering function
  const filterByDate = (app) => {
    if (!app.applied_at || dateFilter === "all") return true

    const appDate = parseISO(app.applied_at)
    const now = new Date()

    switch (dateFilter) {
      case "today":
        return isWithinInterval(appDate, {
          start: startOfDay(now),
          end: endOfDay(now),
        })
      case "yesterday":
        const yesterday = subDays(now, 1)
        return isWithinInterval(appDate, {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
        })
      case "this-week":
        return isWithinInterval(appDate, {
          start: startOfWeek(now),
          end: endOfWeek(now),
        })
      case "this-month":
        return isWithinInterval(appDate, {
          start: startOfMonth(now),
          end: endOfMonth(now),
        })
      case "last-7-days":
        return isWithinInterval(appDate, {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now),
        })
      case "last-30-days":
        return isWithinInterval(appDate, {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now),
        })
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return isWithinInterval(appDate, {
            start: startOfDay(customDateRange.from),
            end: endOfDay(customDateRange.to),
          })
        }
        return true
      default:
        return true
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.id && app.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.plan_number && app.plan_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.users.name && app.users.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.lga && app.lga.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" || (app.status && app.status.toLowerCase() === statusFilter.toLowerCase())

    const matchesDate = filterByDate(app)

    return matchesSearch && matchesStatus && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Handle custom date range selection
  const handleCustomDateSelect = (range) => {
    setCustomDateRange(range)
    if (range?.from && range?.to) {
      setDateFilter("custom")
      setIsDatePickerOpen(false)
    }
  }

  // Clear date filters
  const clearDateFilter = () => {
    setDateFilter("all")
    setCustomDateRange({ from: null, to: null })
  }

  // Get date filter display text
  const getDateFilterText = () => {
    switch (dateFilter) {
      case "today":
        return "Today"
      case "yesterday":
        return "Yesterday"
      case "this-week":
        return "This Week"
      case "this-month":
        return "This Month"
      case "last-7-days":
        return "Last 7 Days"
      case "last-30-days":
        return "Last 30 Days"
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`
        }
        return "Custom Range"
      default:
        return "All Time"
    }
  }

  if (isLoading && applications.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-2 mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-md">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Application Management</h1>
          <div className="flex items-center gap-2">
            {/* Date Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  {getDateFilterText()}
                  {dateFilter !== "all" && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                      {filteredApplications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setDateFilter("all")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("today")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("yesterday")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Yesterday
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("this-week")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("this-month")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  This Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("last-7-days")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("last-30-days")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Custom Range
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="range"
                        selected={customDateRange}
                        onSelect={handleCustomDateSelect}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </DropdownMenuItem>
                {dateFilter !== "all" && (
                  <>
                    <div className="border-t my-1" />
                    <DropdownMenuItem onClick={clearDateFilter} className="text-red-600">
                      <X className="mr-2 h-4 w-4" />
                      Clear Filter
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => downloadCSV(filteredApplications, "applications.csv")}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <CardStatSurcon filteredApplications={filteredApplications} />

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by ID, plan number, user ID, or location..."
              className="pl-8 w-full sm:w-[350px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Show active filters */}
        {(dateFilter !== "all" || statusFilter !== "all" || searchTerm) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getDateFilterText()}
                <button onClick={clearDateFilter} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Main content area with conditional rendering for details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications table - takes full width when details not shown, 2/3 when details shown */}
          <div className={`${isDetailsOpen ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Number</TableHead>
                    <TableHead>Surveyor Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>No of Pillars</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>APPSN Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.length > 0 ? (
                    paginatedApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.plan_number || "N/A"}</TableCell>
                        <TableCell>
                          <div>
                            <div>{app.users.name || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{app.pillar_type || "N/A"}</TableCell>
                        <TableCell>{app.pillar_no || "N/A"}</TableCell>
                        <TableCell>{formatDate(app.applied_at)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              app.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : app.status === "Pending" || app.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {app.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              app.payment_status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : app.payment_status === "verification-pending" || app.payment_status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {app.payment_status || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell>₦{(app.pillar_payment_fee || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {app.payment_status === null ||
                          app.payment_status === "pending" ||
                          app.payment_status === "verification-pending" ? (
                            <div>waiting for appsn approval</div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="cursor-pointer "
                                  onClick={() => openApplicationDetails(app)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem >
                                    <Link  legacyBehavior  href={`/admin/map/${app.id}`}>
                                    <a target=" _blank" rel="noopener noreferrer">
                                 
                                       <span> <MapPin/>View on Map</span>
                                    </a>
                                      </Link>
                                  </DropdownMenuItem>
                                {app.status !== "Approved" && (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-green-600"
                                    onClick={() => updateApplicationStatus(app.id, "Approved")}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Approve</span>
                                  </DropdownMenuItem>
                                )}
                                {app.status !== "Rejected" && (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onClick={() => updateApplicationStatus(app.id, "Rejected")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Reject</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                        No applications found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {paginatedApplications.length} of {filteredApplications.length} applications
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Application Details Card */}
          {isDetailsOpen && selectedApplication && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Application Details</CardTitle>
                    <Button variant="ghost" size="icon" onClick={closeApplicationDetails} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge
                    className={
                      selectedApplication.status === "Approved"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : selectedApplication.status === "Pending" || selectedApplication.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {selectedApplication.status || "N/A"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Application ID</p>
                      <p className="font-medium">{selectedApplication.plan_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Submission Date</p>
                      <p>{formatDate(selectedApplication.applied_at)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">User ID</p>
                      <p>{selectedApplication.user_id || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Application Type</p>
                      <p className="capitalize">{selectedApplication.pillar_type || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p>{selectedApplication.lga || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Payment Amount</p>
                      <p>₦{(selectedApplication.pillar_payment_fee || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Number of Pillars</p>
                      <p>{(selectedApplication.pillar_no || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Payment Status</p>
                      <p>{selectedApplication.payment_status || "N/A"}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-gray-500">Pillar IDs</p>
                      {pillarIds.length > 0 ? (
                        <p className="break-words">{pillarIds.map((item) => item.pillar_id).join(", ")}</p>
                      ) : (
                        <p className="text-sm text-gray-500">No pillar IDs assigned yet</p>
                      )}
                    </div>
                  </div>

                  {/* Status Change Section */}
                  <div className="border-t border-b py-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Change Application Status</h4>
                    <div className="flex items-center gap-4">
                      <Select
                        defaultValue={selectedApplication.status}
                        onValueChange={(value) => {
                          setSelectedApplication({ ...selectedApplication, status: value })
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => updateApplicationStatus(selectedApplication.id, selectedApplication.status)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Status"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Changing the status will notify the applicant via email and update related records.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Application Details</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm">
                          This is a {selectedApplication.pillar_type?.toLowerCase() || "regular"} pillar application for
                          a location in {selectedApplication.lga || "N/A"}. The application was submitted on{" "}
                          {formatDate(selectedApplication.applied_at)} and is currently{" "}
                          {selectedApplication.status || "pending review"}.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                      {selectedApplication.survey_plan ||
                      selectedApplication.payment_receipt ||
                      selectedApplication.surcon_fee_url ? (
                        <div className="space-y-2">
                          {selectedApplication.survey_plan && (
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm">Survey Plan</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => window.open(selectedApplication.survey_plan, "_blank")}
                              >
                                View
                              </Button>
                            </div>
                          )}
                          {selectedApplication.surcon_fee_url && (
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm">Receipt</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => window.open(selectedApplication.surcon_fee_url, "_blank")}
                              >
                                View
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No documents available for this application.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" onClick={closeApplicationDetails}>
                    Close
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
