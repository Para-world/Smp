import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header skeleton */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-slate-200 dark:bg-slate-800" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 pb-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Information skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-52" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-44" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Completion skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-12" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full mb-4" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-48" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
