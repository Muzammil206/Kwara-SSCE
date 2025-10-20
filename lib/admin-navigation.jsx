import { Users, FileText, BarChart3, Settings, ClipboardList, HelpCircle, FileSpreadsheet, Map } from "lucide-react"

// Define all navigation items
const allNavigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3, roles: ["admin", "surcon_admin", "appsn_admin"] },
  { name: "User Management", href: "/admin/users", icon: Users, roles: ["admin", "appsn_admin"] },
  {
    name: "APPSN payment verification",
    href: "/admin/payment",
    icon: FileSpreadsheet,
    roles: ["admin", "appsn_admin"],
  },
  {
    name: "SURCON payment verification",
    href: "/admin/applications",
    icon: ClipboardList,
    roles: ["admin", "surcon_admin"],
  },
   {
    name: "Map",
    href: "/admin/map",
    icon: Map,
    roles: ["admin", "surcon_admin", "appsn_admin"],
  },
    {
    name: "User Summary",
    href: "/admin/userSummary",
    icon: FileText,
    roles: ["admin", "appsn_admin"],
  },
  { name: "Pillar Records", href: "/admin/report", icon: FileText, roles: ["admin", "surcon_admin"] },
  { name: "Help & Support", href: "/admin/support", icon: HelpCircle, roles: ["admin", "surcon_admin", "appsn_admin"] },
  { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin"] },
]

// Function to filter navigation items based on user role
export function getNavigationByRole(role) {
  return allNavigation.filter((item) => item.roles.includes(role))
}

