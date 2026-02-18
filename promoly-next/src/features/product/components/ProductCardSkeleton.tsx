export default function ProductCardSkeleton() {
  return (
    <div className="
      bg-surface
      rounded-xl2
      p-5
      border border-gray-200
      shadow-soft
      animate-pulse
    ">
      <div className="h-36 bg-gray-200 rounded-xl mb-5" />

      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />

      <div className="flex gap-3">
        <div className="h-9 bg-gray-200 rounded-xl flex-1" />
        <div className="h-9 bg-gray-200 rounded-xl flex-1" />
      </div>
    </div>
  );
}
