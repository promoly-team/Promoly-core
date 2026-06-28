import Image from "next/image";
import CategoryProductMetrics from "./CategoryProductMetrics";
import CategoryProductChart from "./CategoryProductChart";
import CategoryProductActions from "./CategoryProductActions";

type Props = {
  product: any;
};

export default function CategoryTopProduct({ product }: Props) {
  return (
    <div className="bg-panel rounded-2xl p-4 sm:p-6 shadow-elevated border border-line mb-10">
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        <div className="bg-white rounded-xl p-6 flex items-center justify-center">
          <Image
            src={product.imagem_url ?? "/placeholder.png"}
            alt={product.titulo}
            width={500}
            height={500}
            className="w-full rounded-xl object-contain"
          />
        </div>

        <div>
          <CategoryProductMetrics product={product} />
          <CategoryProductChart product={product} />
          <CategoryProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
