import { Card, CardContent } from '@/components/ui/card'

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`} />
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <SkeletonPulse className="h-8 w-48 mb-2" />
        <SkeletonPulse className="h-4 w-32" />
      </div>

      {/* Stats Cards skeleton */}
      <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 overflow-hidden shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <SkeletonPulse className="h-3 w-24" />
                  <SkeletonPulse className="h-8 w-32" />
                  <SkeletonPulse className="h-3 w-20" />
                </div>
                <SkeletonPulse className="h-11 w-11 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Business Health skeleton */}
      <div className="mb-8">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonPulse className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <SkeletonPulse className="h-5 w-24" />
                  <SkeletonPulse className="h-3 w-32" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <SkeletonPulse className="h-3 w-24 ml-auto" />
                <SkeletonPulse className="h-6 w-32 ml-auto" />
              </div>
            </div>
            <SkeletonPulse className="h-2 w-full mt-4 rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Charts skeleton */}
      <div className="mb-8 grid gap-5 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i} className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <SkeletonPulse className="h-5 w-40 mb-4" />
              <SkeletonPulse className="h-[200px] w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom panels skeleton */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="border-border bg-card shadow-sm">
            <CardContent className="p-6 space-y-3">
              <SkeletonPulse className="h-5 w-40 mb-2" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <SkeletonPulse className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonPulse className="h-3 w-3/4" />
                    <SkeletonPulse className="h-3 w-1/2" />
                  </div>
                  <SkeletonPulse className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
