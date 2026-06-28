export default function Footer() {
  return (
    <footer className="bg-panel border-t border-line text-ink-muted mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
        {/* SOBRE */}
        <div>
          <h3 className="text-lg font-extrabold mb-4">
            <span className="text-primary">Promo</span>
            <span className="text-success">ly</span>
          </h3>
          <p className="text-sm leading-relaxed">
            Compare preços, acompanhe histórico real e descubra quando um
            produto está realmente abaixo da média.
          </p>
        </div>

        {/* LINKS ÚTEIS */}
        <div>
          <h3 className="text-ink text-lg font-semibold mb-4">Links úteis</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/sitemap.xml" className="hover:text-ink transition">
                Sitemap
              </a>
            </li>
            <li>
              <a
                href="/categoria/eletronicos"
                className="hover:text-ink transition"
              >
                Eletrônicos
              </a>
            </li>
            <li>
              <a
                href="/categoria/games"
                className="hover:text-ink transition"
              >
                Games
              </a>
            </li>
            <li>
              <a href="/categoria/casa" className="hover:text-ink transition">
                Casa
              </a>
            </li>
          </ul>
        </div>

        {/* REDES SOCIAIS */}
        <div>
          <h3 className="text-ink text-lg font-semibold mb-4">
            Redes sociais
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="https://instagram.com/Promoly__"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition"
            >
              Instagram
            </a>

            <a
              href="https://twitter.com/Promoly_"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition"
            >
              Twitter
            </a>

            <a
              href="
              https://www.facebook.com/PromolyCore"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line py-6 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} PromoLy. Todos os direitos reservados.
      </div>
    </footer>
  );
}
