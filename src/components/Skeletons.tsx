export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] mb-6 bg-zinc-200 rounded" />
      <div className="space-y-3">
        <div className="h-4 bg-zinc-200 rounded w-3/4" />
        <div className="h-3 bg-zinc-200 rounded w-1/2" />
        <div className="h-5 bg-zinc-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="animate-pulse flex gap-4">
      <div className="w-20 h-20 bg-zinc-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-zinc-200 rounded w-3/4" />
        <div className="h-3 bg-zinc-200 rounded w-1/2" />
        <div className="h-4 bg-zinc-200 rounded w-1/4" />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-24 bg-zinc-200" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-zinc-200" />
    </div>
  );
}
