type Props = {
  product: any;
};

export default function CategoryProductActions({ product }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-10">
      {/* DETALHES */}
      <a
        href={`/produto/${product.slug}-${product.produto_id}`}
        className="
          flex-1
          bg-[#DAFDBA]
          hover:bg-[#45C4B0]
          text-[#000D34]
          font-semibold
          py-3
          rounded-xl
          text-center
          transition
        "
      >
        Ver detalhes
      </a>

      {/* COMPRAR */}
      {product.url_afiliada && (
        <a
          href={product.url_afiliada}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="
            flex-1
            bg-[#F5F138]
            hover:brightness-95
            text-[#000D34]
            font-bold
            py-3
            rounded-xl
            text-center
            transition
          "
        >
          Comprar agora
        </a>
      )}
    </div>
  );
}
