import { Skeleton } from '@/components/ui/primitives';

export function PortfolioSkeleton() {
  return (
    <div className="container-x flex min-h-screen flex-col justify-center gap-6 py-24" role="status" aria-label="Loading portfolio">
      <Skeleton className="h-8 w-56 rounded-full" />
      <Skeleton className="h-20 w-full max-w-md" />
      <Skeleton className="h-6 w-full max-w-xl" />
      <Skeleton className="h-6 w-full max-w-lg" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-40 rounded-full" />
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
