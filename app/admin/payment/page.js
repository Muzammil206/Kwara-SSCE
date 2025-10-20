"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AdminLayout } from "@/components/layout-admin"
import CardStatAppsn from "@/components/admin/cardStatAppsn"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Download,
  Calendar,
  Receipt,
  X,
  FileText,
  CalendarDays,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { downloadCSV } from "@/utils/downloadCSV"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import Link from "next/link"

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [revenue , setRevenue] = useState(0)

  // Date filter states
  const [dateFilter, setDateFilter] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({
    from: null,
    to: null,
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const itemsPerPage = 10

  // Fetch payments from the database
  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    autoRefresh()
    const interval = setInterval(() => {
      fetchPayments()
    }, 10000) // refresh every 10 seconds

    return () => clearInterval(interval) // cleanup on unmount
  }, [currentPage, statusFilter, searchTerm])

  const fetchPayments = async () => {
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

      // Transform the data to focus on payment information
      const paymentData = data.map((app) => ({
        id: app.id,
        plan_number: app.plan_number,
        name: app.users?.name || "N/A",
        user_id: app.user_id,
        amount: app.paid_amount,
        area: app.area,
        date: app.applied_at,
        payment_status: app.payment_status ,
        payment_method: app.payment_method ,
        lga: app.lga,
        pillar_no: app.pillar_no,
        appsn_url: app.appsn_url,
        receipt_url: app.receipt_url,
        quarter: app.quarter,
        layout_url: app.layout_url,
        location: app.location,
        client_address: app.client_address,
        client_name: app.client_name,
        mds_fee: app.mds_fee,
        land_use: app.land_use,
        application_type: app.application_type,
        pilot_count: app.pilot_count ,
      }))

      setPayments(paymentData)
      setRevenue(
        paymentData.reduce((sum, payment) => sum + (payment.mds_fee || 0), 0),
      )
    } catch (error) {
      console.error("Error fetching payments:", error.message)
      toast.error("Failed to fetch payments. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment)
    setIsDetailsOpen(true)
  }

  const closePaymentDetails = () => {
    setIsDetailsOpen(false)
  }

  const autoRefresh = () => {
    fetchPayments()
  }

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.from("pillar_applications").update({ payment_status: newStatus }).eq("id", id)

      if (error) throw error

      // Update local state
      setPayments(payments.map((payment) => (payment.id === id ? { ...payment, payment_status: newStatus } : payment)))
      setSelectedPayment((prev) => ({ ...prev, payment_status: newStatus }))
      toast.success(`Payment status changed to ${newStatus}`)
    } catch (error) {
      console.error("Error updating payment status:", error.message)
      toast.error("Could not update payment status")
    } finally {
      setIsLoading(false)
    }
  }

  // Date filtering function
  const filterByDate = (payment) => {
    if (!payment.date || dateFilter === "all") return true

    const paymentDate = parseISO(payment.date)
    const now = new Date()

    switch (dateFilter) {
      case "today":
        return isWithinInterval(paymentDate, {
          start: startOfDay(now),
          end: endOfDay(now),
        })
      case "yesterday":
        const yesterday = subDays(now, 1)
        return isWithinInterval(paymentDate, {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
        })
      case "this-week":
        return isWithinInterval(paymentDate, {
          start: startOfWeek(now),
          end: endOfWeek(now),
        })
      case "this-month":
        return isWithinInterval(paymentDate, {
          start: startOfMonth(now),
          end: endOfMonth(now),
        })
      case "last-7-days":
        return isWithinInterval(paymentDate, {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now),
        })
      case "last-30-days":
        return isWithinInterval(paymentDate, {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now),
        })
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return isWithinInterval(paymentDate, {
            start: startOfDay(customDateRange.from),
            end: endOfDay(customDateRange.to),
          })
        }
        return true
      default:
        return true
    }
  }

  // Filter payments based on search term, status filter, and date filter
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.plan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.lga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.payment_status?.toLowerCase() === statusFilter.toLowerCase()

    const matchesDate = filterByDate(payment)

    return matchesSearch && matchesStatus && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Function to get status badge styling
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
      case "verification-pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  if (isLoading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Date Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  {getDateFilterText()}
                  {dateFilter !== "all" && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                      {filteredPayments.length}
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
              onClick={() => downloadCSV(filteredPayments, "Appsn payments.csv")}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4 mr-1" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}

        <CardStatAppsn  filteredPayments={filteredPayments} payments={payments} />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verification-pending">Verification Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
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
          {/* Payments table - takes full width when details not shown, 2/3 when details shown */}
          <div className={`${isDetailsOpen ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Surveyor Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Pilot NO</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Land use</TableHead>
                    <TableHead>Mds Fee</TableHead>
                    <TableHead>PILLAR No</TableHead>
                    <TableHead>Application Type</TableHead>
                    <TableHead>APPSN Fee</TableHead>
                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.length > 0 ? (
                    paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.plan_number || "N/A"}</TableCell>
                        <TableCell>{payment.name || "N/A"}</TableCell>

                        <TableCell>{`${Number(payment.area).toFixed(2)} m²`}</TableCell>

                        <TableCell>{(payment.pilot_count || 0).toLocaleString()}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.land_use || "N/A"} </TableCell>
                        <TableCell>₦{(payment.mds_fee || 0).toLocaleString()}</TableCell>
                        <TableCell>{payment.pillar_no}</TableCell>
                        <TableCell>{payment.application_type|| "N/A"}</TableCell>
                        <TableCell>₦{(payment.pillar_no * 4100 || "N/A").toLocaleString()}</TableCell>

                        <TableCell>
                          <Badge className={cn(getStatusBadgeStyles(payment.payment_status))}>
                            {payment.payment_status
                              ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openPaymentDetails(payment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>

                              </DropdownMenuItem>
                              <DropdownMenuItem >
                                <Link legacyBehavior  href={`/admin/map/${payment.id}`}>
                                <a target=" _blank" rel="noopener noreferrer">
                                  <span>View on Map</span>
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                              {payment.payment_receipt && (
                                <DropdownMenuItem onClick={() => window.open(payment.payment_receipt, "_blank")}>
                                  <Receipt className="mr-2 h-4 w-4" />
                                  <span>View Receipt</span>
                                </DropdownMenuItem>
                              )}
                              {(payment.payment_status === "pending" ||
                                payment.payment_status === "verification-pending") && (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => updatePaymentStatus(payment.id, "paid")}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Mark as Paid</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                        No payments found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedPayments.length} of {filteredPayments.length} payments
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

          {/* Payment Details Card */}
          {isDetailsOpen && selectedPayment && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Payment Details</CardTitle>
                    <Button variant="ghost" size="icon" onClick={closePaymentDetails} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge className={cn(getStatusBadgeStyles(selectedPayment.payment_status))}>
                    {selectedPayment.payment_status
                      ? selectedPayment.payment_status.charAt(0).toUpperCase() + selectedPayment.payment_status.slice(1)
                      : "Pending"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                      <p>{formatDate(selectedPayment.date)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Plan Number</p>
                      <p>{selectedPayment.plan_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Local Govt</p>
                      <p>{selectedPayment.location || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Client Address</p>
                      <p>{selectedPayment.client_address || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Client Name</p>
                      <p>{selectedPayment.client_name || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="font-medium">₦{(selectedPayment.amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Mds fee</p>
                      <p className="font-medium">₦{(selectedPayment.amount * 0.7 || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">APPSN FEE</p>
                      <p>₦{(selectedPayment.pillar_no * 4100 || "N/A").toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Quarter</p>
                      <p>{selectedPayment.quarter || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Area</p>
                      <p>{selectedPayment.area ? `${Number(selectedPayment.area).toFixed(2)} m²` : "N/A"}</p>
                    </div>
                  </div>

                  {/* Status Change Section */}
                  <div className="border-t border-b py-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Change Payment Status</h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Select
                        defaultValue={selectedPayment.payment_status}
                        onValueChange={(value) => {
                          setSelectedPayment({ ...selectedPayment, payment_status: value })
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verification-pending">Verification Pending</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => updatePaymentStatus(selectedPayment.id, selectedPayment.payment_status)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Status"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Changing the status will update the associated application and notify the user.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Payment Receipt Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment Receipt</h4>
                      {selectedPayment.appsn_url && (
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">Appsn receipt</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => window.open(selectedPayment.appsn_url, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment Receipt</h4>
                      {selectedPayment.receipt_url && (
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">Mds receipt</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => window.open(selectedPayment.receipt_url, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      )}
                    </div>

                    {selectedPayment.layout_url && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Layout Plan</h4>
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">Layout Plan</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => window.open(selectedPayment.layout_url, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="outline" onClick={closePaymentDetails}>
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
