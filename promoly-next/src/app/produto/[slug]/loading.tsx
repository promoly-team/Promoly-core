export default function Loading() {
  return (
    <div className="bg-base min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
          {/* MAIN */}
          <div className="space-y-8">
            {/* CARD PRINCIPAL */}
            <div className="bg-panel rounded-2xl border border-line p-8 animate-pulse">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="bg-panel-subtle rounded-xl h-80"></div>

                <div className="space-y-4">
                  <div className="h-6 bg-panel-subtle rounded w-3/4"></div>
                  <div className="h-4 bg-panel-subtle rounded w-1/4"></div>
                  <div className="h-10 bg-panel-subtle rounded w-1/2"></div>
                  <div className="h-12 bg-panel-subtle rounded w-1/3"></div>
                </div>
              </div>
            </div>

            {/* HISTÓRICO */}
            <div className="bg-panel rounded-2xl border border-line p-8 animate-pulse">
              <div className="h-6 bg-panel-subtle rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-panel-subtle rounded-xl"></div>
            </div>
          </div>

          {/* ASIDE */}
          <div className="bg-panel rounded-2xl border border-line p-6 animate-pulse space-y-4">
            <div className="h-5 bg-panel-subtle rounded w-1/2"></div>
            <div className="h-20 bg-panel-subtle rounded-xl"></div>
            <div className="h-20 bg-panel-subtle rounded-xl"></div>
            <div className="h-20 bg-panel-subtle rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
