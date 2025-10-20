"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import {AdminLayout} from "@/components/layout-admin"


export default function UserQuotaTable() {
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [quarterFilter, setQuarterFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  useEffect(() => {
    try {
      const fetchData = async () => {
        const { data, error } = await supabase.from("user_quota").select(`*, users!inner(name)`)
        if (error) throw error
        if (data) setData(data)
            console.log("Fetched data:", data)
      }
      fetchData()
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [])

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.users.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesQuarter = quarterFilter === "all" || item.quarter === quarterFilter
      const matchesYear = yearFilter === "all" || item.year.toString() === yearFilter

      return matchesSearch && matchesQuarter && matchesYear
    })
  }, [data, searchTerm, quarterFilter, yearFilter])

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      "Index",
      "ID",
      "User ID",
      "Quarter",
      "Year",
      "Regular Pillars Applied",
      "Special Pillars Applied",
      "Total Paid",
      "Total Pillars Used",
      "Quota Limit",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.idx,
          row.id,
          row.user_id,
          row.quarter,
          row.year,
          row.regular_pillars_applied,
          row.special_pillars_applied,
          row.total_paid,
          row.total_pillars_used,
          row.quota_limit,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "user_quota_data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get unique quarters and years for filter options
  const quarters = [...new Set(data.map((item) => item.quarter))]
  const years = [...new Set(data.map((item) => item.year.toString()))]

  return (
    <AdminLayout>
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Quota Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />

            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quarters</SelectItem>
                {quarters.map((quarter) => (
                  <SelectItem key={quarter} value={quarter}>
                    {quarter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline">
              Export CSV
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Surveyor Name</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Regular Pillars</TableHead>
                  <TableHead>Special Pillars</TableHead>
                  <TableHead>Total MDS paid</TableHead>
                  <TableHead>Total Pillars Used</TableHead>
                   <TableHead>Total Appsn fee Paid</TableHead>
                  <TableHead>Quota Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-small">{item.users.name}</TableCell>
                      <TableCell>{item.quarter}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{item.regular_pillars_applied}</TableCell>
                      <TableCell>{item.special_pillars_applied}</TableCell>
                      <TableCell>#{Number.parseFloat(item.total_paid * 0.7).toLocaleString()}</TableCell>
                      <TableCell>{item.total_pillars_used}</TableCell>
                       <TableCell>#{(item.total_pillars_used * 4100).toLocaleString()}</TableCell>
                      <TableCell>{item.quota_limit}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} records
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  )
}
