"use client"

import { formatDistanceToNow } from "date-fns"
import { MapPin, User, Home, FileText, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// Define application status styles
const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  paid: "bg-blue-100 text-blue-800 border-blue-200",
}

// Helper function to determine application status
const getApplicationStatus = (application) => {
  if (application.status) return application.status

  if (application.paid_amount > 0) return "paid"
  if (application.approved === true) return "approved"
  if (application.approved === false) return "rejected"
  return "pending"
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function ApplicationCard({ applications }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {applications && applications.length > 0 ? (
        applications.map((application) => {
          const status = getApplicationStatus(application)
          // Handle both date formats (from API or from static data)
          const timeAgo = application.applied_at
            ? formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })
            : application.date

          return (
            <div key={application.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      status === "approved"
                        ? "bg-emerald-500"
                        : status === "rejected"
                          ? "bg-rose-500"
                          : status === "paid"
                            ? "bg-blue-500"
                            : "bg-amber-500",
                    )}
                  />
                  <h4 className="text-xs font-medium truncate max-w-[120px] sm:max-w-none text-slate-900 dark:text-slate-100">
                    {application.plan_number ? `Plan #${application.plan_number}` : `Application #${application.id}`}
                  </h4>
                </div>
                <div className={cn("text-xs capitalize px-1.5 py-0.5 rounded-full font-medium", statusStyles[status])}>
                  {status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                {application.client_name && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <User className="h-3 w-3 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{application.client_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <Calendar className="h-3 w-3 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                  <span className="truncate">{timeAgo}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                  <span className="truncate">
                    {application.lga ||
                      (application.location && application.location.split(",")[0]) ||
                      application.location}
                  </span>
                </div>

                {application.land_use && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Home className="h-3 w-3 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="capitalize truncate">{application.land_use}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">No applications yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            When you submit applications, they will appear here.
          </p>
        </div>
      )}
    </div>
  )
}

