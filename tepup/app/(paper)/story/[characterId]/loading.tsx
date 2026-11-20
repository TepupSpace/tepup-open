import StoryBookSkeleton from '@/components/skeletons/StoryBookSkeleton';

export default function Loading() {
  return (
    <main className="paper-shell sb-story" aria-busy="true">
      <StoryBookSkeleton />
      <div className="sb-listen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-96 max-w-full animate-pulse rounded-md bg-black/10" aria-hidden="true" />
          <div className="h-5 w-80 max-w-full animate-pulse rounded-md bg-black/10" aria-hidden="true" />
        </div>
        <div className="sb-topics" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sb-topics__cell">
              <div className="h-[212px] w-full animate-pulse rounded-md bg-black/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
