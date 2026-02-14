import { Link } from "react-router-dom";
import { useState } from "react";
import { CATEGORIES } from "../../constants/categories";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const mainCategories = CATEGORIES.filter(cat =>
    ["eletronicos", "casa", "pet"].includes(cat.slug)
  );

  const otherCategories = CATEGORIES.filter(cat =>
    !["eletronicos", "casa", "pet"].includes(cat.slug)
  );

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold text-[#2563eb]"
        >
          Promoly
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 relative">

          {mainCategories.map(cat => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="text-gray-700 hover:text-[#22c177] transition font-medium"
            >
              {cat.label}
            </Link>
          ))}

          {/* DROPDOWN DESKTOP */}
          <div className="relative group">

            <button className="text-gray-700 hover:text-[#22c177] transition font-medium">
              Mais ▾
            </button>

            {/* Área invisível para evitar fechamento prematuro */}
            <div className="absolute left-0 top-full h-3 w-full"></div>

            <div className="
                absolute left-0 top-full
                mt-0
                w-48
                bg-white
                border border-gray-100
                rounded-xl
                shadow-lg
                p-3
                flex-col gap-2
                hidden
                group-hover:flex
              "
            >
              {otherCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/categoria/${cat.slug}`}
                  className="text-gray-700 hover:text-[#2563eb] text-sm transition"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

          </div>

        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
          <div className="flex flex-col px-4 py-4 gap-3 text-sm">

            {mainCategories.map(cat => (
              <Link
                key={cat.slug}
                to={`/categoria/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-[#22c177] transition"
              >
                {cat.label}
              </Link>
            ))}

            {/* MOBILE DROPDOWN */}
            <button
              className="text-left text-gray-700 font-medium"
              onClick={() => setMoreOpen(!moreOpen)}
            >
              Mais
            </button>

            {moreOpen && (
              <div className="flex flex-col gap-2 pl-4 border-l border-gray-200">
                {otherCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    to={`/categoria/${cat.slug}`}
                    onClick={() => {
                      setMobileOpen(false);
                      setMoreOpen(false);
                    }}
                    className="text-gray-600 hover:text-[#2563eb] transition"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </header>
  );
}
