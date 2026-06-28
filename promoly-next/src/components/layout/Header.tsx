"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/constants/categories";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const mainCategories = CATEGORIES.filter((cat) =>
    ["eletronicos", "casa", "pet"].includes(cat.slug),
  );

  const otherCategories = CATEGORIES.filter(
    (cat) => !["eletronicos", "casa", "pet"].includes(cat.slug),
  );

  return (
    <header className="bg-base/80 backdrop-blur-xl border-b border-line sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center text-2xl font-extrabold tracking-tight"
        >
          <span className="text-primary">Promo</span>
          <span className="text-success">ly</span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 relative">
          {mainCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="text-ink-muted hover:text-ink transition font-medium"
            >
              {cat.label}
            </Link>
          ))}

          {/* DROPDOWN */}
          <div className="relative group">
            <button className="text-ink-muted hover:text-ink transition font-medium">
              Mais ▾
            </button>

            <div className="absolute left-0 top-full h-3 w-full"></div>

            <div
              className="
                absolute left-0 top-full
                w-52
                bg-panel-elevated
                border border-line
                rounded-xl
                shadow-elevated
                p-4
                hidden
                group-hover:flex
                flex-col
                gap-1
              "
            >
              {otherCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="text-ink-muted hover:text-ink hover:bg-panel-subtle rounded-lg px-3 py-2 text-sm transition font-medium"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-ink text-2xl"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-panel border-t border-line">
          <div className="flex flex-col px-4 py-4 gap-1 text-sm">
            {mainCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-ink font-medium hover:bg-panel-subtle rounded-lg px-3 py-2.5 transition"
              >
                {cat.label}
              </Link>
            ))}

            <button
              className="text-left text-ink-muted font-semibold px-3 py-2.5"
              onClick={() => setMoreOpen(!moreOpen)}
            >
              Mais categorias {moreOpen ? "▴" : "▾"}
            </button>

            {moreOpen && (
              <div className="flex flex-col gap-1 pl-4 border-l border-line ml-3">
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    onClick={() => {
                      setMobileOpen(false);
                      setMoreOpen(false);
                    }}
                    className="text-ink-muted hover:text-ink rounded-lg px-3 py-2 transition"
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
