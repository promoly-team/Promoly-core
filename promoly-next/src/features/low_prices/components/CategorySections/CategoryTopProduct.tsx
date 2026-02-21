import Image from "next/image";
import CategoryProductMetrics from "./CategoryProductMetrics";
import CategoryProductChart from "./CategoryProductChart";
import CategoryProductActions from "./CategoryProductActions";

type Props = {
  product: any;
};

export default function CategoryTopProduct({ product }: Props) {
  return (
    <div className="bg-[#0a154a] border border-[#45C4B0] rounded-2xl p-8 sm:p-10 shadow-lg mb-16">
      {/* BLOCO SUPERIOR */}
      <div className="grid md:grid-cols-2 gap-12 items-start mb-14">
        {/* IMAGEM */}
        <div className="flex justify-center">
          <Image
            src={product.imagem_url ?? "/placeholder.png"}
            alt={product.titulo}
            width={500}
            height={500}
            className="
      w-full
      max-w-[416px]      /* 30% maior no mobile */
      sm:max-w-[420px]   /* desktop mantém */
      h-auto
      rounded-xl
      object-contain
      transition-transform
      duration-300
      hover:scale-105
    "
          />
        </div>

        {/* MÉTRICAS + AÇÕES */}
        <div>
          <CategoryProductMetrics product={product} />
          <CategoryProductActions product={product} />
        </div>
      </div>

      {/* GRÁFICO FULL WIDTH */}
      <div className="mt-6">
        <CategoryProductChart product={product} />
      </div>
    </div>
  );
}
