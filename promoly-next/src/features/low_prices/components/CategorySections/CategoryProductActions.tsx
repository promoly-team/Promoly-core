type Props = {
  product: any;
};

export default function CategoryProductActions({ product }: Props) {
  return (
    <div className="flex gap-4 mt-8">
      <a
        href={`/produto/${product.slug}-${product.produto_id}`}
        className="
          flex-1
          bg-surface-subtle
          hover:bg-gray-200
          text-gray-800
          py-3
          rounded-xl
          text-center
          transition
        "
      >
        Detalhes
      </a>

      {product.url_afiliada && (
        <a
          href={product.url_afiliada}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="
            flex-1
            bg-primary
            hover:bg-primary-hover
            text-white
            py-3
            rounded-xl
            text-center
            transition
          "
        >
          Comprar
        </a>
      )}
    </div>
  );
}
