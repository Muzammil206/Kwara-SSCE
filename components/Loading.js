import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Navigation Bar */}
      <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          {/* Logo/Brand Skeleton */}
          <Skeleton className="h-8 w-32" />
          
          {/* Search Bar Skeleton */}
          <Skeleton className="h-9 w-full max-w-md" />
          
          {/* Navigation Items Skeleton */}
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <Skeleton className="absolute inset-0 rounded-none" />
        
        {/* Centered Loading Message */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 px-4 py-3 rounded-lg bg-background border shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-lg font-semibold">Loading Map</h3>
              <p className="text-sm text-muted-foreground">Please wait while we load your plan...</p>
            </div>
          </div>
        </div>

        {/* Optional: Map controls skeletons */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>

        {/* Optional: Zoom controls skeletons */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Optional: Attribution skeleton */}
        <div className="absolute left-4 bottom-4">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  )
}
