export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-[#f0f0f0] dark:bg-zinc-800" />
      <div className="pt-3 space-y-2">
        <div className="h-4 bg-[#f0f0f0] dark:bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-[#f0f0f0] dark:bg-zinc-800 rounded w-2/3" />
        <div className="h-4 bg-[#f0f0f0] dark:bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
  );
}