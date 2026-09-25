import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <Skeleton className="h-8 w-24" />

      {/* Header skeleton */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-slate-200 dark:bg-slate-800" />
        <CardContent className="px-6 py-6 pt-0 relative">
          <div className="-mt-8 mb-4">
            <Skeleton className="h-16 w-16 rounded-xl border-4 border-white dark:border-[#0B1120]" />
          </div>
          <div className="space-y-3 max-w-2xl">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview skeleton */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>

          {/* Assignments skeleton */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3 pt-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Instructor skeleton */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info skeleton */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-4 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-24 mb-1.5" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
