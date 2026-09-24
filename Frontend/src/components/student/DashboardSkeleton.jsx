export default function DashboardSkeleton() {
  const pulse = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl';

  return (
    <div className="space-y-6">
      {/* Welcome skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 p-8 animate-pulse">
        <div className="h-4 w-36 bg-slate-300 dark:bg-slate-700 rounded mb-3" />
        <div className="h-8 w-72 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-56 bg-slate-300 dark:bg-slate-700 rounded" />
      </div>

      {/* Student summary skeleton */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start gap-5">
          <div className={`w-20 h-20 rounded-2xl ${pulse}`} />
          <div className="flex-1 space-y-3">
            <div className={`h-6 w-40 ${pulse}`} />
            <div className={`h-4 w-48 ${pulse}`} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 ${pulse}`} />
                  <div className="space-y-1.5">
                    <div className={`h-3 w-16 ${pulse}`} />
                    <div className={`h-4 w-24 ${pulse}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5"
          >
            <div className={`w-10 h-10 mb-3 ${pulse}`} />
            <div className={`h-8 w-16 mb-2 ${pulse}`} />
            <div className={`h-4 w-28 ${pulse}`} />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div>
        <div className={`h-5 w-28 mb-4 ${pulse}`} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800"
            >
              <div className={`w-11 h-11 ${pulse}`} />
              <div className={`h-4 w-20 ${pulse}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Two column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-6"
          >
            <div className={`h-5 w-36 mb-5 ${pulse}`} />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-3">
                  <div className={`w-9 h-9 flex-shrink-0 ${pulse}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 w-full ${pulse}`} />
                    <div className={`h-3 w-2/3 ${pulse}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
