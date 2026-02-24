export function SkeletonMealCard() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start gap-3.5">
        <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-28 rounded-lg skeleton-shimmer" />
          <div className="h-3.5 w-full rounded-lg skeleton-shimmer" />
          <div className="flex gap-1.5">
            <div className="h-5 w-14 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-14 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-14 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
