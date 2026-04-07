function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-[320px] w-full rounded-xl" />
    </div>
  );
}
