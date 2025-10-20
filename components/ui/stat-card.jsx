import PropTypes from "prop-types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({ icon, title, value, subValue, change, className }) {
  return (
    <Card className={cn("overflow-hidden bg-white shadow-lg rounded-xl", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-600">{title}</div>
              {change !== undefined && (
                <div
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                  )}
                >
                  {change >= 0 ? "+" : ""}
                  {change}%
                </div>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
            {subValue && <div className="mt-1 text-sm text-gray-500">{subValue}</div>}
          </div>
          <div className="flex-shrink-0">
            <div className="p-3 bg-gradient-to-tl from-blue-600 to-blue-400 rounded-xl text-white">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subValue: PropTypes.string,
  change: PropTypes.number,
  className: PropTypes.string,
}

