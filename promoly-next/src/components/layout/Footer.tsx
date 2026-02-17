export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

        {/* SOBRE */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">
            PromoLy
          </h3>
          <p className="text-sm leading-relaxed">
            Compare preços, acompanhe histórico real e descubra quando um produto
            está realmente abaixo da média.
          </p>
        </div>

        {/* LINKS ÚTEIS */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">
            Links úteis
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/sitemap.xml" className="hover:text-white transition">
                Sitemap
              </a>
            </li>
            <li>
              <a href="/categoria/eletronicos" className="hover:text-white transition">
                Eletrônicos
              </a>
            </li>
            <li>
              <a href="/categoria/games" className="hover:text-white transition">
                Games
              </a>
            </li>
            <li>
              <a href="/categoria/casa" className="hover:text-white transition">
                Casa
              </a>
            </li>
          </ul>
        </div>

        {/* REDES SOCIAIS */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">
            Redes sociais
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="https://instagram.com/Promoly__"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Instagram
            </a>

            <a
              href="https://twitter.com/Promoly_"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Twitter
            </a>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-700 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} PromoLy. Todos os direitos reservados.
      </div>
    </footer>
  );
}
