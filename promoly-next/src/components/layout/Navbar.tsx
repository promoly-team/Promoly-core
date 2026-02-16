"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/constants/categories";

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
    <header className="bg-surface border-b border-gray-200 sticky top-0 z-50 shadow-soft">

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight"
        >
          <span className="text-primary">Promo</span>
          <span className="text-success">ly</span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 relative">

          {mainCategories.map(cat => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="text-gray-900 hover:text-success transition font-semibold"
            >
              {cat.label}
            </Link>
          ))}

          {/* DROPDOWN */}
          <div className="relative group">

            <button className="text-gray-900 hover:text-success transition font-semibold">
              Mais ▾
            </button>

            <div className="absolute left-0 top-full h-3 w-full"></div>

            <div className="
                absolute left-0 top-full
                w-52
                bg-white
                border border-gray-200
                rounded-xl
                shadow-medium
                p-4
                hidden
                group-hover:flex
                flex-col
                gap-2
              "
            >
              {otherCategories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="text-gray-800 hover:text-primary text-sm transition font-medium"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

          </div>

        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-gray-900 text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-soft">
          <div className="flex flex-col px-4 py-4 gap-4 text-sm">

            {mainCategories.map(cat => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-gray-900 font-medium hover:text-success transition"
              >
                {cat.label}
              </Link>
            ))}

            <button
              className="text-left text-gray-900 font-semibold"
              onClick={() => setMoreOpen(!moreOpen)}
            >
              Mais categorias
            </button>

            {moreOpen && (
              <div className="flex flex-col gap-2 pl-4 border-l border-gray-300">
                {otherCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    onClick={() => {
                      setMobileOpen(false);
                      setMoreOpen(false);
                    }}
                    className="text-gray-700 hover:text-primary transition"
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
