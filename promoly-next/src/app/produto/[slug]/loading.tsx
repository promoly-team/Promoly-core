export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="grid lg:grid-cols-[2fr_1fr] gap-10">

          {/* MAIN */}
          <div className="space-y-8">

            {/* CARD PRINCIPAL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
              <div className="grid md:grid-cols-2 gap-10">

                <div className="bg-gray-200 rounded-xl h-80"></div>

                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                </div>

              </div>
            </div>

            {/* HISTÓRICO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>

          </div>

          {/* ASIDE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>

        </div>

      </div>
    </div>
  );
}
