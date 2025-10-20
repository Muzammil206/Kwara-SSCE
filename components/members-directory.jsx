"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Mail, Phone, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"

export default function MembersDirectory() {
  const [surveyors, setSurveyors] = useState([])
  const [filteredSurveyors, setFilteredSurveyors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArea, setSelectedArea] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const itemsPerPage = 15

  // Fetch surveyors from Supabase
  useEffect(() => {
    async function fetchSurveyors() {
      try {
        setLoading(true)

        const { data, error } = await supabase.from("profile").select("*")

        if (data) {
          // Shuffle randomly
          const shuffled = data.sort(() => Math.random() - 0.5)
          setSurveyors(shuffled)
          setFilteredSurveyors(shuffled)
          setTotalPages(Math.ceil(shuffled.length / itemsPerPage))
          console.log(shuffled)
        }
        if (error) throw error

        setTotalPages(Math.ceil(data.length / itemsPerPage))
      } catch (error) {
        console.error("Error fetching surveyors:", error)
        setError("Failed to load surveyors. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchSurveyors()
  }, [])

  // Filter surveyors based on search term and selected area
  useEffect(() => {
    let result = surveyors
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((surveyor) => surveyor.name.toLowerCase().includes(term))
    }

    setFilteredSurveyors(result)
    setTotalPages(Math.ceil(result.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, selectedArea, surveyors])

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSurveyors.slice(startIndex, endIndex)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of results
    const resultsElement = document.getElementById("results-top")
    if (resultsElement) {
      window.scrollTo({
        top: resultsElement.offsetTop - 100,
        behavior: "smooth",
      })
    }
  }

  // Toggle filter panel
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search and Filter Section */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter button (mobile) */}
            <button
              onClick={toggleFilter}
              className="sm:hidden w-full flex items-center justify-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-3 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Mobile filters */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="sm:hidden overflow-hidden"
                >
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500">Filter options will go here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            <div id="results-top" className="text-sm text-gray-500">
              Found {filteredSurveyors.length} surveyors
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading surveyors...</span>
          </div>
        )}

        {/* Error state */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* Results */}
        {!loading && !error && (
          <>
            {filteredSurveyors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="text-gray-500 mb-2">No surveyors found matching your criteria</div>
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedArea("")
                  }}
                  className="text-emerald-600 hover:text-emerald-800 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {getCurrentPageItems().map((surveyor) => (
                  <div
                    key={surveyor.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header with avatar and basic info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                            <AvatarImage src={surveyor.avatar_url || "/placeholder.svg"} alt={surveyor.name} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                              {surveyor.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2) || "SU"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-emerald-800 text-base sm:text-lg mb-1 line-clamp-2">
                            {surveyor.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">
                           SURCON Reg No: {surveyor.surveyor_reg || "Not Specified"}
                          </p>
                          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                            {surveyor.company_name || "Not Specified"}
                          </span>
                        </div>
                      </div>

                      {/* Contact information */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-2">{surveyor.address || "Kwara"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <a
                            href={`mailto:${surveyor.email || ""}`}
                            className="text-sm text-emerald-600 hover:underline truncate"
                          >
                            {surveyor.email || "Not Specified"}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <a
                            href={`tel:0${surveyor.phone_number || ""}`}
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            0{surveyor.phone_number || "Not Specified"}
                          </a>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="pt-4 border-t border-gray-100">
                        <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                          Contact Surveyor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredSurveyors.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                      let page
                      if (totalPages <= 5) {
                        page = index + 1
                      } else if (currentPage <= 3) {
                        page = index + 1
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + index
                      } else {
                        page = currentPage - 2 + index
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            currentPage === page ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-50"
                          }`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
