export default function ProductCardSkeleton() {
  return (
    <div className="
      bg-panel
      rounded-xl2
      p-5
      border border-line
      shadow-elevated
      animate-pulse
    ">
      <div className="h-36 bg-panel-subtle rounded-xl mb-5" />

      <div className="h-4 bg-panel-subtle rounded w-3/4 mb-3" />
      <div className="h-4 bg-panel-subtle rounded w-1/2 mb-6" />

      <div className="flex gap-3">
        <div className="h-9 bg-panel-subtle rounded-xl flex-1" />
        <div className="h-9 bg-panel-subtle rounded-xl flex-1" />
      </div>
    </div>
  );
}
